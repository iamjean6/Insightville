import { createClient } from 'redis';
import 'dotenv/config';

const redisURL = `redis://127.0.0.1:6380`;
console.log(`Connecting to temporary Redis at: ${redisURL}`);

const client = createClient({ url: redisURL });

client.on('error', err => console.error('Redis Client Error:', err));

try {
    await client.connect();
    console.log('Successfully connected to temp Redis!');
    const ping = await client.ping();
    console.log('Ping response:', ping);
    await client.disconnect();
    console.log('Disconnected.');
} catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
}
