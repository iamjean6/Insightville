
import express from "express";
import Blog from "../model/blogModel.js";

const router = express.Router();

router.get("/search", async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }
        
        // Using MongoDB Text Search for high relevance and speed
        const articles = await Blog.find(
            { $text: { $search: query } },
            { score: { $meta: "textScore" } }
        ).sort({ score: { $meta: "textScore" } }).limit(20);
        
        res.status(200).json({ success: true, count: articles.length, data: articles });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ message: "Server error during search" });
    }
});

export default router;