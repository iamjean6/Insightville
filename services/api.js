import axios from "axios"

const API_URL = "http://localhost:5000/api";

export const getBlogs = async () => {
    const response = await axios.get(`${API_URL}/blogs`);
    return response.data;
}
export const getOneBlog = async (id) => {
    const response = await axios.get(`${API_URL}/blogs/${id}`);
    return response.data;
}
export const createBlog = async (blog) => {
    const response = await axios.post(`${API_URL}/blogs`, blog);
    return response.data;
}
export const updateBlog = async (id, blog) => {
    const response = await axios.put(`${API_URL}/blogs/${id}`, blog);
    return response.data;
}
export const deleteBlog = async (id) => {
    const response = await axios.delete(`${API_URL}/blogs/${id}`);
    return response.data;
}

export const updateBlogStatus = async (id, statusData) => {
    // statusData should be { featured: true/false } or { editorsPick: true/false }
    const response = await axios.patch(`${API_URL}/blogs/${id}/status`, statusData);
    return response.data;
}

export const getAllComments = async () => {
    const response = await axios.get(`${API_URL}/comments`);
    return response.data;
}

export const getBlogComments = async (id) => {
    const response = await axios.get(`${API_URL}/blogs/${id}/comments`);
    return response.data;
}

export const deleteComment = async (id) => {
    const response = await axios.delete(`${API_URL}/comments/${id}`);
    return response.data;
}

export const likeBlog = async (id) => {
    const response = await axios.patch(`${API_URL}/blogs/${id}/like`);
    return response.data;
}

export const postComment = async (id, commentData) => {
    const response = await axios.post(`${API_URL}/blogs/${id}/comments`, commentData);
    return response.data;
}

export const streamTTS = async (text) => {
    const response = await axios.post(`${API_URL}/tts`, { text }, { responseType: 'blob' });
    return response.data;
}

export const getPopularBlogs = async () => {
    const response = await axios.get(`${API_URL}/blogs/popular`);
    return response.data;
}

export const getRelatedBlogs = async (id) => {
    const response = await axios.get(`${API_URL}/blogs/${id}/related`);
    return response.data;
}