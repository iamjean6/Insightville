import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const client = process.env.PAYPAL_CLIENT?.trim();
const secret = process.env.PAYPAL_SECRET?.trim();
const configuredUrl = process.env.PAYPAL_BASEURL?.trim();

console.log("=== PayPal Diagnosis ===");
console.log(`PAYPAL_CLIENT length: ${client?.length} (Starts with: ${client?.substring(0, 5)})`);
console.log(`PAYPAL_SECRET length: ${secret?.length} (Starts with: ${secret?.substring(0, 5)})`);
console.log(`Configured BASE_URL: ${configuredUrl}`);
console.log("========================\n");

async function testAuth(envName, url) {
    try {
        console.log(`Testing against ${envName} (${url})...`);
        const auth = Buffer.from(`${client}:${secret}`).toString("base64");
        
        const response = await axios.post(`${url}/v1/oauth2/token`, "grant_type=client_credentials", {
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        
        console.log(`✅ SUCCESS! Keys are valid for ${envName}!`);
        return true;
    } catch (err) {
        console.log(`❌ FAILED on ${envName}: ${err.response?.data?.error || err.message}`);
        return false;
    }
}

async function run() {
    if (!client || !secret) {
        console.log("CRITICAL: Keys are missing from .env!");
        return;
    }

    const sandboxSuccess = await testAuth("SANDBOX", "https://api-m.sandbox.paypal.com");
    if (!sandboxSuccess) {
        await testAuth("LIVE", "https://api-m.paypal.com");
    }
}

run();
