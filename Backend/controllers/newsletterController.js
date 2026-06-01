import Subscriber from "../model/subscriberModel.js";

export const subscribeToNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const existingSubscriber = await Subscriber.findOne({ email });

        if (existingSubscriber) {
            if (!existingSubscriber.isActive) {
                // Reactivate them if they previously unsubscribed
                existingSubscriber.isActive = true;
                await existingSubscriber.save();
                return res.status(200).json({ success: true, message: "Welcome back! You've been resubscribed." });
            }
            return res.status(400).json({ success: false, message: "You are already subscribed!" });
        }

        await Subscriber.create({ email });

        return res.status(201).json({ success: true, message: "Successfully subscribed to the newsletter!" });
    } catch (err) {
        console.error("Newsletter Subscription Error:", err);
        return res.status(500).json({ success: false, message: "An error occurred while subscribing" });
    }
};
