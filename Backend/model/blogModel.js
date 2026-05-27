import mongoose from "mongoose";
const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"]
    },
    excerpt: {
        type: String,
        required: [true, "Synopsis is required"]
    },
    content: {
        type: String,
        required: [true, "Content is required"]
    },
   image: {
    webp: {
        type: String,
        required: true
    },
    jpeg: {
        type: String,
        required: true
    },
    avif: {
        type: String,
        required: true
    }
},
    author: {
        type: String,
        required: [true, "Author is required"]
    },
   authorImages: {
    webp: {
        type: String
    },
    jpeg: {
        type: String
    },
    avif: {
        type: String
    }
},
    category: {
        type: String,
        required: [true, "Category is required"]
    },
    subcategory: {
        type: String,
        default: ""
    },
    quote: {
        type: String,
    },
    featured: {
        type: Boolean,
        default: false
    },
    editorsPick: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    key: {
        type: String,
    },
    videoUrl: {
        type: String,
    },
    videoKey: {
        type: String,
    },
    breaking: {
        type: Boolean,
        default: false
    }
})

// Database Indexes for optimized querying
BlogSchema.index({ date: -1 });
BlogSchema.index({ category: 1 });
BlogSchema.index({ breaking: 1 });
BlogSchema.index({ views: -1 });
BlogSchema.index({ likes: -1 });

// Text Index for full-text search
BlogSchema.index({ title: 'text', content: 'text', tags: 'text' });

export default mongoose.model("Blog", BlogSchema);