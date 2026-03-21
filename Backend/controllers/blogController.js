import Blog from "../model/blogModel.js";
import Comment from "../model/commentsSchema.js";
import { v4 } from "uuid";
import { putObject } from "../utils/putObject.js";
import { getObject } from "../utils/getObject.js";
import { deleteObject } from "../utils/deleteObject.js";
import cache from "../cache/cache.js";
import mongoose from "mongoose";

export const getBlogs = async (req, res) => {
    try {
        const cachedBlogs = await cache.fetchBlog();
        if (cachedBlogs) {
            console.log("Blogs fetched from cache");
            return res.status(200).json({ success: true, data: cachedBlogs });
        }
        const blogs = await Blog.find().sort({ date: -1 });
        await cache.saveBlog(blogs);
        console.log("Blogs fetched from database and cached");
        return res.status(200).json({ success: true, data: blogs });
    } catch (err) {
        console.error("Error fetching blogs:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
}
export const getOneBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const cachedBlog = await cache.fetchBlogDetail(id);
        if (cachedBlog) {
            console.log("Blog fetched from cache");
            return res.status(200).json({ success: true, data: cachedBlog });
        }
        const blog = await Blog.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }
        // Get S3 object if needed, but don't let it block the response if it fails
        try {
            await getObject(blog.key);
        } catch (s3err) {
            console.warn("S3 getObject failed for key:", blog.key, s3err.message);
        }

        await cache.saveBlogDetail(id, blog);
        console.log("Blog fetched from database, views incremented, and cached");
        return res.status(200).json({ success: true, data: blog });
    } catch (err) {
        console.error("Error fetching blog:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
}
import fs from 'fs';
import path from 'path';

export const createBlog = async (req, res) => {
    try {
        console.log("Create Blog Request Body:", req.body);
        console.log("Create Blog Request Files:", req.files ? Object.keys(req.files) : "No files");
        const { title, excerpt, content, author, category, subcategory, quote, featured, editorsPick, breaking, date, videoUrl } = req.body
        const { file, authorImageFile, videoFile } = req.files || {}

        const fileName = "articles/" + v4()
        const authorImgName = "authors/" + v4()
        const videoFileName = videoFile ? "videos/" + v4() : null

        const missing = [];
        if (!title) missing.push("title");
        if (!excerpt) missing.push("excerpt");
        if (!content) missing.push("content");
        if (!author) missing.push("author");
        if (!category) missing.push("category");
        if (!date) missing.push("date");

        if (missing.length > 0) {
            console.log("Missing fields detected:", missing);
            return res.status(400).json({
                "status": "error",
                "message": `Missing required fields: ${missing.join(", ")}`
            })
        }

        if (!file) {
            return res.status(400).json({
                "status": "error",
                "message": "Cover image is required"
            })
        }

        const uploadResult = await putObject(file.data, fileName, file.mimetype);
        if (!uploadResult || !uploadResult.url) {
            throw new Error("Failed to upload cover image");
        }

        let finalAuthorImage = req.body.authorImage || "";
        if (authorImageFile) {
            const authorUpload = await putObject(authorImageFile.data, authorImgName, authorImageFile.mimetype);
            if (authorUpload && authorUpload.url) {
                finalAuthorImage = authorUpload.url;
            }
        }

        let finalVideoUrl = videoUrl || null;
        let videoKey = null;

        if (videoFile) {
            const videoUpload = await putObject(videoFile.data, videoFileName, videoFile.mimetype);
            if (videoUpload && videoUpload.url) {
                finalVideoUrl = videoUpload.url;
                videoKey = videoUpload.key;
            }
        }

        const blog = await Blog.create({
            title,
            excerpt,
            content,
            image: uploadResult.url,
            author,
            authorImage: finalAuthorImage,
            category,
            subcategory: subcategory || "",
            quote,
            featured: featured === 'true' || featured === true,
            editorsPick: editorsPick === 'true' || editorsPick === true,
            breaking: breaking === 'true' || breaking === true,
            date: date || new Date(),
            videoUrl: finalVideoUrl,
            videoKey: videoKey,
            key: uploadResult.key
        });

        await cache.invalidateBlogCache();

        return res.status(201).json({
            "status": "success",
            "data": blog,
        })
    } catch (err) {
        console.error('Error in createBlog:', err);
        return res.status(500).json({ "status": "error", "message": err.message })
    }
}
export const getComments = async (req, res) => {
    try {
        const { id } = req.params;
        const cachedComments = await cache.fetchComments(id);
        if (cachedComments) {
            console.log("Comments fetched from cache");
            return res.status(200).json({ success: true, data: cachedComments });
        }
        const comments = await Comment.find({ blogId: id });
        await cache.saveComments(id, comments);
        console.log("Comments fetched from database and cached");
        return res.status(200).json({ success: true, data: comments });
    } catch (err) {
        console.error("Error fetching comments:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
}
export const getLikes = async (req, res) => {
    try {
        const { id } = req.params;
        const cachedLikes = await cache.fetchLikes(id);
        if (cachedLikes) {
            console.log("Likes fetched from cache");
            return res.status(200).json({ success: true, data: cachedLikes });
        }
        const likes = await Blog.findById(id).select("likes");
        await cache.saveLikes(id, likes);
        console.log("Likes fetched from database and cached");
        return res.status(200).json({ success: true, data: likes });
    } catch (err) {
        console.error("Error fetching likes:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
}

export const getViews = async (req, res) => {
    try {
        const { id } = req.params;
        const cachedViews = await cache.fetchViews(id);
        if (cachedViews) {
            console.log("Views fetched from cache");
            return res.status(200).json({ success: true, data: cachedViews });
        }
        const views = await Blog.findById(id).select("views");
        await cache.saveViews(id, views);
        console.log("Views fetched from database and cached");
        return res.status(200).json({ success: true, data: views });
    } catch (err) {
        console.error("Error fetching views:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
}
export const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, excerpt, content, author, category, subcategory, quote, featured, editorsPick, breaking, date, videoUrl } = req.body;
        const files = req.files || {};

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        let updateData = {
            title,
            excerpt,
            content,
            author,
            category,
            subcategory: subcategory !== undefined ? subcategory : blog.subcategory,
            quote,
            date,
            videoUrl: videoUrl !== undefined ? videoUrl : blog.videoUrl,
            featured: featured !== undefined ? (featured === 'true' || featured === true) : blog.featured,
            editorsPick: editorsPick !== undefined ? (editorsPick === 'true' || editorsPick === true) : blog.editorsPick,
            breaking: breaking !== undefined ? (breaking === 'true' || breaking === true) : blog.breaking
        };

        if (files.file) {
            const uploadedImage = await putObject(files.file.data, blog.key);
            if (uploadedImage && uploadedImage.url) {
                updateData.image = uploadedImage.url;
            }
        }

        if (files.authorImageFile) {
            const authorImgName = "authors/" + v4();
            const uploadedAuthorImage = await putObject(files.authorImageFile.data, authorImgName);
            if (uploadedAuthorImage && uploadedAuthorImage.url) {
                updateData.authorImage = uploadedAuthorImage.url;
            }
        } else if (req.body.authorImage) {
            updateData.authorImage = req.body.authorImage;
        }

        const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, { new: true });
        await cache.invalidateBlogCache(id);

        return res.status(200).json({ success: true, data: updatedBlog });
    } catch (err) {
        console.error("Error updating blog:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
}
export const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params
        const blog = await Blog.findById(id)
        if (!blog) {
            return res.status(404).json({
                "status": "error",
                "message": "Article not found"
            })
        }

        console.log(`Attempting deletion for Article ID: ${id}`);

        // Attempt S3 deletion if a key exists
        if (blog.key) {
            console.log(`S3 key found: ${blog.key}. Attempting S3 deletion...`);
            const s3Response = await deleteObject(blog.key);
            console.log("S3 Delete Result:", s3Response);

            // We proceed with DB deletion even if S3 fails, but we log the warning
            if (s3Response.status >= 400 && s3Response.status !== 404) {
                console.warn(`S3 image deletion failed for key ${blog.key} but proceeding with DB deletion: ${s3Response.message}`);
            }
        } else {
            console.log("No S3 key associated with this article. Skipping S3 deletion.");
        }

        // Proceed to delete database record
        await Blog.findByIdAndDelete(id)
        console.log("Article document successfully deleted from database");

        await cache.invalidateBlogCache(id);

        return res.status(200).json({
            "status": "success",
            "message": "Article deleted successfully"
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ "status": "error", "message": err.message })
    }
}
export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params
        const comment = await Comment.findById(id)
        if (!comment) {
            return res.status(404).json({
                "status": "error",
                "message": "Comment not found"
            })
        }
        await Comment.findByIdAndDelete(id)
        await cache.invalidateCommentsCache(id);
        return res.status(200).json({
            "status": "success",
            "message": "Comment deleted successfully"
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ "status": "error", "message": err.message })
    }
}
export const updateBlogStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { featured, editorsPick } = req.body;
        const updateData = {};
        if (featured !== undefined) updateData.featured = featured;
        if (editorsPick !== undefined) updateData.editorsPick = editorsPick;
        if (breaking !== undefined) updateData.breaking = breaking;

        const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, { new: true });

        await cache.invalidateBlogCache(id);

        res.status(200).json({ success: true, data: updatedBlog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getAllComments = async (req, res) => {
    try {
        const comments = await Comment.find().populate("blogId", "title");
        return res.status(200).json({ success: true, data: comments });
    } catch (err) {
        console.error("Error fetching all comments:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const likeBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });
        if (!blog) {
            return res.status(404).json({ success: false, message: "Article not found" });
        }
        await cache.invalidateBlogCache(id);
        return res.status(200).json({ success: true, data: blog });
    } catch (err) {
        console.error("Error liking blog:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const postComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, authorName } = req.body;

        if (!comment) {
            return res.status(400).json({ success: false, message: "Comment content is required" });
        }

        // Since we don't have a full User model yet, we'll store the authorName or a placeholder
        // and bypass the strict userId requirement if necessary, or just use a dummy ID.
        // For now, let's create a comment with the provided blogId.
        const newComment = await Comment.create({
            blogId: id,
            comment: comment,
            // Temporary measure: use a dummy ObjectId if userId is required and not provided
            userId: req.body.userId || new mongoose.Types.ObjectId()
        });

        await cache.invalidateCommentsCache(id);
        return res.status(201).json({ success: true, data: newComment });
    } catch (err) {
        console.error("Error posting comment:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const getPopularBlogs = async (req, res) => {
    try {
        console.log("Fetching popular blogs...");
        // Fetch top 5 blogs sorted by views and likes descending
        const blogs = await Blog.find().sort({ views: -1, likes: -1 }).limit(5);
        console.log(`Found ${blogs.length} popular blogs`);
        return res.status(200).json({ success: true, data: blogs });
    } catch (err) {
        console.error("Error fetching popular blogs:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
}

export const getRelatedBlogs = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Fetching related blogs for article ID: ${id}`);
        const currentBlog = await Blog.findById(id);
        if (!currentBlog) {
            console.log("Current blog not found for related fetching");
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        console.log(`Current blog category: ${currentBlog.category}`);
        const relatedBlogs = await Blog.find({
            category: currentBlog.category,
            _id: { $ne: id }
        }).limit(4);

        console.log(`Found ${relatedBlogs.length} related blogs`);
        return res.status(200).json({ success: true, data: relatedBlogs });
    } catch (err) {
        console.error("Error fetching related blogs:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
}

export const getLatestBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ date: -1 })
        return res.status(200).json({ success: true, data: blogs })
    } catch (err) {
        console.error("Error fetching latest blogs:", err);
        return res.status(500).json({ success: false, message: err.message })
    }
}
export const getBlogCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { subcategory } = req.query;
        let query = { category: category };
        if (subcategory) {
            query.subcategory = subcategory;
        }
        const blogs = await Blog.find(query);
        return res.status(200).json({ success: true, data: blogs });
    } catch (err) {
        console.error("Error fetching blogs by category:", err);
        return res.status(500).json({ success: false, message: err.message })
    }
}

export const getMedia = async (req, res) => {
    try {
        const blogs = await Blog.find({}, 'image videoUrl title author date category');
        res.status(200).json({ success: true, data: blogs });
    } catch (err) {
        console.error("Error fetching media:", err);
        res.status(500).json({ success: false, message: err.message });
    }
}

export const getBreakingBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ breaking: true }).sort({ date: -1 });
        return res.status(200).json({ success: true, data: blogs });
    } catch (err) {
        console.error("Error fetching breaking blogs:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
}