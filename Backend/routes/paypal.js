import express from "express";
import got from "got";
import User from "../model/userModel.js";
import PaymentEvent from "../model/paymentEventModel.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const paypalClient = got.extend({
    prefixUrl: process.env.PAYPAL_BASEURL,
    retry: {
        limit: 3,
        methods: ["POST", "GET"],
        statusCodes: [408, 413, 429, 500, 502, 503, 504],
        backoffLimit: 3000
    },
    responseType: 'json'
});

const getAccessToken = async () => {
    try {
        const client = process.env.PAYPAL_CLIENT?.trim();
        const secret = process.env.PAYPAL_SECRET?.trim();
        
        if (!client || !secret) {
            console.error("CRITICAL: PAYPAL_CLIENT or PAYPAL_SECRET is missing from process.env!");
        }

        const auth = Buffer.from(`${client}:${secret}`).toString("base64");
        
        const response = await paypalClient.post(
            `v1/oauth2/token`,
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                form: {
                    grant_type: "client_credentials",
                }
            }
        );

        return response.body.access_token;
    } catch (err) {
        console.error("PayPal Auth Error:", err.response?.body || err.message);
        throw new Error("Could not authenticate with PayPal");
    }
};

const createOrder = async (req, res) => {
    try {
        const { packageId } = req.body;
        
        let value = "1.00";
        let creditsToAdd = 5;
        
        if (packageId === "pro") {
            value = "5.00";
            creditsToAdd = 25;
        }

        const accessToken = await getAccessToken();
        
        const response = await paypalClient.post(
            `v2/checkout/orders`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                json: {
                    intent: "CAPTURE",
                    purchase_units: [
                        {
                            custom_id: `${req.user._id}|${creditsToAdd}`,
                            description: `Purchase ${creditsToAdd} TTS Credits`,
                            amount: {
                                currency_code: "USD",
                                value: value
                            }
                        }
                    ]
                }
            }
        );

        return res.status(200).json({ id: response.body.id });
    } catch (err) {
        console.error("Create Order Error:", err.response?.body || err.message);
        res.status(500).json({ error: "Failed to create PayPal order" });
    }
};

const handleWebhook = async (req, res) => {
    try {
        const event = req.body;
        
        if (event.event_type !== "PAYMENT.CAPTURE.COMPLETED") {
            return res.status(200).send();
        }

        const capture = event.resource;
        const customId = capture.custom_id;
        
        if (!customId) {
            console.error("Webhook missing custom_id");
            return res.status(200).send();
        }

        const [userId, creditsStr] = customId.split("|");
        const creditsToAdd = parseInt(creditsStr, 10);

        const existingEvent = await PaymentEvent.findOne({ eventId: event.id });
        if (existingEvent) {
            console.log(`♻️ Webhook ${event.id} already processed. Skipping.`);
            return res.status(200).send(); 
        }

        await PaymentEvent.create({
            eventId: event.id,
            userId: userId,
            amount: parseFloat(capture.amount.value),
            creditsAdded: creditsToAdd
        });

        await User.findByIdAndUpdate(userId, {
            $inc: { credits: creditsToAdd }
        });

        console.log(`✅ Successfully credited ${creditsToAdd} credits to user ${userId}`);
        res.status(200).send("Webhook received and processed");
        
    } catch (error) {
        if (error.code === 11000) {
            console.log("♻️ Concurrent webhook caught by MongoDB unique index. Skipping.");
            return res.status(200).send();
        }
        
        console.error("PayPal Webhook Error:", error);
        res.status(500).send("Internal Server Error");
    }
};

router.post('/create-order', protect, createOrder);
router.post('/webhook', express.json(), handleWebhook);

export default router;
