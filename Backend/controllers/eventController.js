import { client } from '../cache/server.js';

export const handleViewEvent = async (req, res) => {
    const { blogId, visitorId, userId } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'] || '';

    if (/(bot|crawler|spider|lighthouse)/i.test(userAgent)) {
        return res.status(200).json({ message: "ignored" });
    }
    
    const uniqueActor = userId || visitorId || ip;
    const deduplicationKey = `view:${blogId}:${uniqueActor}`;
    
    // Check if they already viewed this blog in the last 12 hours
    const alreadyViewed = await client.get(deduplicationKey);
    if (alreadyViewed) {
        return res.status(200).json({ message: "ignored - already viewed recently" });
    }

    // Mark as viewed for 12 hours (12 * 60 * 60 = 43200 seconds)
    await client.set(deduplicationKey, "1", { EX: 43200 });

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