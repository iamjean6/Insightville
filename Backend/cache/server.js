import 'dotenv/config';
import { createClient } from "redis";

const url = process.env.REDIS_URL;

if (!url) {
    console.error("[Redis] REDIS_URL environment variable is not set. Redis will be unavailable.");
}

export const client = url ? createClient({
    url: url,
    socket: {
        tls: url.startsWith('rediss://'),
        reconnectStrategy: (retries) => Math.min(retries * 50, 2000)
    }
}) : null;

if (client) {
    client.on("connect", () => console.log("Redis client connecting"));
    client.on("ready", () => console.log("Redis client ready"));
    client.on("error", (err) => console.error("Redis client error", err));
    client.on("end", () => console.log("Redis client disconnected"));
    client.on("reconnecting", () => console.log("Redis client reconnecting"));

    let retryCount = 0;
    async function connect() {
        try {
            await client.connect();
            retryCount = 0;
        } catch (err) {
            retryCount++;
            console.error(`Redis connection attempt ${retryCount} failed:`, err.message);
            setTimeout(connect, Math.min(30000, 5000 * retryCount));
        }
    }
    connect();

    process.on("SIGINT", async () => {
        await client.disconnect();
    });
}

export default client;