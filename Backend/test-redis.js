import { createClient } from 'redis';
import 'dotenv/config';

const redisURL = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
console.log(`Connecting to: ${redisURL}`);

const client = createClient({ 
    url: redisURL,
    socket: {
        reconnectStrategy: retries => {
            console.log(`Retrying connection... Attempt ${retries}`);
            if (retries > 5) return new Error('Max retries reached');
            return 1000;
        }
    }
});

client.on('error', err => console.error('Redis Client Error:', err));
client.on('connect', () => console.log('Redis Client Connecting...'));
client.on('ready', () => console.log('Redis Client Ready!'));

try {
    await client.connect();
    console.log('Successfully connected!');
    const ping = await client.ping();
    console.log('Ping response:', ping);
    await client.disconnect();
} catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
}
