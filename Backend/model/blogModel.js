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
        type: String,
        required: [true, "Please enter Image is required"]
    },
    author: {
        type: String,
        required: [true, "Author is required"]
    },
    authorImage: {
        type: String,
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

export default mongoose.model("Blog", BlogSchema);