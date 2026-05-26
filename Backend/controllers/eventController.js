import { client } from '../cache/server.js';

export const handleViewEvent = async (req, res) => {
    const { blogId, visitorId, userId } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'] || '';

    if (/(bot|crawler|spider|lighthouse)/i.test(userAgent)) {
        return res.status(200).json({ message: "ignored" });
    }
    
    const event = {
        blogId,
        visitorId,
        userId,
        ip,
        timestamp: Date.now()
    };
    
    await client.rPush("views_queue", JSON.stringify(event));
    return res.status(200).send("Event buffered");
};