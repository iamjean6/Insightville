import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

// ─── Axios instance ────────────────────────────────────────────────────────────
// withCredentials: true ensures the httpOnly refreshToken cookie is sent on
// every request (required for the /api/auth/refresh call to work).
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Token-refresh interceptor ────────────────────────────────────────────────
// When any request returns 401 (access token expired), we:
//   1. Pause all other failing requests in a queue.
//   2. Call /api/auth/refresh once to get a new access token.
//   3. Retry every queued request with the new token.
//   4. If refresh itself fails (refresh token also expired / invalid), log out.

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only attempt refresh on 401 and only once per request
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("/auth/refresh") &&
            !originalRequest.url.includes("/auth/login")
        ) {
            if (isRefreshing) {
                // Queue this request until the ongoing refresh finishes
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers["Authorization"] = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Refresh the access token — the httpOnly cookie is sent automatically
                const { data } = await api.post("/auth/refresh");
                const newToken = data.token;

                localStorage.setItem("token", newToken);
                api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

                processQueue(null, newToken);
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh token is also expired/invalid — force logout
                processQueue(refreshError, null);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                // Redirect to login if in a browser context
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// ─── Request interceptor: always inject the latest access token ───────────────
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
    }
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
};

export const logout = async () => {
    try {
        await api.post("/auth/logout");
    } catch (_) {
        // Ignore errors — still clear local state
    } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete api.defaults.headers.common["Authorization"];
    }
};

// ─── Blogs ─────────────────────────────────────────────────────────────────────
export const getBlogs = async () => {
    const response = await api.get("/blogs");
    return response.data;
};

export const getOneBlog = async (id) => {
    const response = await api.get(`/blogs/${id}`);
    return response.data;
};

export const createBlog = async (blogData) => {
    const response = await api.post("/blogs", blogData);
    return response.data;
};

export const updateBlog = async (id, blogData) => {
    const response = await api.put(`/blogs/${id}`, blogData);
    return response.data;
};

export const deleteBlog = async (id) => {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
};

export const updateBlogStatus = async (id, statusData) => {
    const response = await api.patch(`/blogs/${id}/status`, statusData);
    return response.data;
};

export const getPopularBlogs = async () => {
    const response = await api.get("/blogs/popular");
    return response.data;
};

export const getPopularCategories = async () => {
    const response = await api.get("/blogs/popular?distinctCategory=true");
    return response.data;
};

export const getLatestBlogs = async () => {
    const response = await api.get("/blogs/latest");
    return response.data;
};

export const getBreakingBlogs = async () => {
    const response = await api.get("/blogs/breaking");
    return response.data;
};

export const getBlogsByCategory = async (category, subcategory = "") => {
    const url = subcategory
        ? `/blogs/category/${category}?subcategory=${subcategory}`
        : `/blogs/category/${category}`;
    const response = await api.get(url);
    return response.data;
};

export const getRelatedBlogs = async (id) => {
    const response = await api.get(`/blogs/${id}/related`);
    return response.data;
};

// ─── Comments ──────────────────────────────────────────────────────────────────
export const getAllComments = async () => {
    const response = await api.get("/comments");
    return response.data;
};

export const getBlogComments = async (id) => {
    const response = await api.get(`/blogs/${id}/comments`);
    return response.data;
};

export const deleteComment = async (id) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
};

export const postComment = async (id, commentData) => {
    const response = await api.post(`/blogs/${id}/comments`, commentData);
    return response.data;
};

export const likeBlog = async (id) => {
    const response = await api.patch(`/blogs/${id}/like`);
    return response.data;
};

// ─── Media & TTS ───────────────────────────────────────────────────────────────
export const getMedia = async () => {
    const response = await api.get("/media");
    return response.data;
};

export const uploadInlineMedia = async (file) => {
  const formData = new FormData();
  formData.append('inlineMedia', file);
  const response = await api.post('/media/upload', formData);
  return response.data;
};

export const streamTTS = async (text) => {
    const response = await api.post("/tts", { text }, { responseType: "blob" });
    return response.data;
};
