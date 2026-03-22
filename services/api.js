import axios from "axios"
const API_URL = import.meta.env.VITE_API_URL || "/api";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const login = async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
};

export const register = async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
};

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

export const getBlogs = async () => {
    const response = await axios.get(`${API_URL}/blogs`);
    return response.data;
}
export const getOneBlog = async (id) => {
    const response = await axios.get(`${API_URL}/blogs/${id}`);
    return response.data;
}
export const createBlog = async (blogData) => {
    const response = await axios.post(`${API_URL}/blogs`, blogData, getAuthHeader());
    return response.data;
}
export const updateBlog = async (id, blogData) => {
    const response = await axios.put(`${API_URL}/blogs/${id}`, blogData, getAuthHeader());
    return response.data;
}
export const deleteBlog = async (id) => {
    const response = await axios.delete(`${API_URL}/blogs/${id}`, getAuthHeader());
    return response.data;
}

export const updateBlogStatus = async (id, statusData) => {
    const response = await axios.patch(`${API_URL}/blogs/${id}/status`, statusData, getAuthHeader());
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
    const response = await axios.delete(`${API_URL}/comments/${id}`, getAuthHeader());
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

export const getPopularCategories = async () => {
    const response = await axios.get(`${API_URL}/blogs/popular?distinctCategory=true`);
    return response.data;
}

export const getRelatedBlogs = async (id) => {
    const response = await axios.get(`${API_URL}/blogs/${id}/related`);
    return response.data;
}

export const getLatestBlogs = async () => {
    const response = await axios.get(`${API_URL}/blogs/latest`);
    return response.data;
}

export const getBlogsByCategory = async (category, subcategory = "") => {
    const url = subcategory 
        ? `${API_URL}/blogs/category/${category}?subcategory=${subcategory}`
        : `${API_URL}/blogs/category/${category}`;
    const response = await axios.get(url);
    return response.data;
}

export const getMedia = async () => {
    const response = await axios.get(`${API_URL}/media`, getAuthHeader());
    return response.data;
}

export const getBreakingBlogs = async () => {
    const response = await axios.get(`${API_URL}/blogs/breaking`);
    return response.data;
}
