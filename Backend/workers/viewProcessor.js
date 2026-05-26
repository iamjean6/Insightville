import cron from "node-cron";
import { client } from "../cache/server.js";
import Blog from "../model/blogModel.js";

async function popAllFromRedisList(key) {
    const multi = client.multi();
    multi.lRange(key, 0, -1);
    multi.del(key);
    const results = await multi.exec();
    return results[0] || [];
}

cron.schedule("*/5 * * * *", async () => {
    try {
        const rawEvents = await popAllFromRedisList("views_queue");
        if (!rawEvents || rawEvents.length === 0) return;

        let blogViewIncrements = {};
        let seenThisWindow = new Set();

        for (let raw of rawEvents) {
            const event = JSON.parse(raw);
            if (!event.blogId) continue;

            const uniqueActor = event.userId || event.visitorId || event.ip;
            const deduplicationKey = `${event.blogId}_${uniqueActor}`;

            if (!seenThisWindow.has(deduplicationKey)) {
                seenThisWindow.add(deduplicationKey);
                if (!blogViewIncrements[event.blogId]) {
                    blogViewIncrements[event.blogId] = 0;
                }
                blogViewIncrements[event.blogId] += 1;
            }
        }

        const bulkOperations = [];
        for (const [blogId, count] of Object.entries(blogViewIncrements)) {
            bulkOperations.push({
                updateOne: {
                    filter: { _id: blogId },
                    update: { $inc: { views: count } }
                }
            });
        }

        if (bulkOperations.length > 0) {
            await Blog.bulkWrite(bulkOperations);
            console.log(`Processed views for ${bulkOperations.length} blogs.`);
        }
    } catch (error) {
        console.error("Error processing views:", error);
    }
});