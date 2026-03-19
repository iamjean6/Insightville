import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import { rateLimit } from "express-rate-limit";
import { 
    getBlogs, 
    getOneBlog, 
    createBlog, 
    updateBlog, 
    deleteBlog, 
    updateBlogStatus,
    getComments,
    getAllComments,
    deleteComment,
    likeBlog,
    postComment,
    getPopularBlogs,
    getRelatedBlogs,
    getLatestBlogs,
    getBlogCategory,
    getMedia
} from "./controllers/blogController.js";
import { login, register } from "./controllers/authController.js";
import { protect } from "./middleware/authMiddleware.js";
import { streamTTS } from "./controllers/ttsController.js";
import mongoose from "mongoose";

const app = express();

// Middleware
app.use(cors());
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 }, useTempFiles: false, }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    if ((req.url === "/api/blogs" || req.url === "/api/blogs/") && req.method === "POST") {
        console.log("--- POST /api/blogs ---");
        console.log("Headers Content-Type:", req.headers['content-type']);
        console.log("Body Keys:", Object.keys(req.body));
        console.log("Files Keys:", req.files ? Object.keys(req.files) : "No files");
    } else {
        console.log(`${req.method} ${req.url}`);
    }
    next();
});

// Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes" }
});
app.use("/api/", limiter);


app.get("/", (req, res) => {
    res.send("Insightville Backend is running");
});
// Auth Routes
app.post("/api/auth/login", login);
app.post("/api/auth/register", register); // Initially open, can be protected later

// Blog Routes
app.get("/api/blogs", getBlogs);
app.get("/api/blogs/popular", getPopularBlogs);
app.get("/api/blogs/latest", getLatestBlogs);
app.get("/api/blogs/category/:category", getBlogCategory);
app.get("/api/blogs/:id", getOneBlog);
app.get("/api/blogs/:id/related", getRelatedBlogs);

// Protected Blog Routes
app.post("/api/blogs", protect, createBlog);
app.put("/api/blogs/:id", protect, updateBlog);
app.delete("/api/blogs/:id", protect, deleteBlog);
app.patch("/api/blogs/:id/status", protect, updateBlogStatus);
app.get("/api/media", protect, getMedia);

app.patch("/api/blogs/:id/like", likeBlog);
app.post("/api/blogs/:id/comments", postComment);

// Protected Comment Routes
app.delete("/api/comments/:id", protect, deleteComment);
app.get("/api/comments", getAllComments);
app.get("/api/blogs/:id/comments", getComments);

// Text to Speech
app.post("/api/tts", streamTTS);

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("MongoDB connected");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});