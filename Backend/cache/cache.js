import { setQuery, getQuery } from "./query.js";
import { getUserDataKey, CacheKeys } from "./key.js";
import cache from "./index.js"

async function saveBlog(blog) {
    const key = CacheKeys.BLOGS_ALL;
    return await setQuery(key, blog, new Date(Date.now() + Number(process.env.CONTENT_CACHE_DURATION)));
}

async function fetchBlog() {
    const key = CacheKeys.BLOGS_ALL;
    return await getQuery(key);
}
async function saveBlogDetail(id, blog) {
    const key = `${CacheKeys.BLOG_DETAIL}:${id}`;
    return await setQuery(key, blog, new Date(Date.now() + Number(process.env.CONTENT_CACHE_DURATION)));
}

async function fetchBlogDetail(id) {
    const key = `${CacheKeys.BLOG_DETAIL}:${id}`;
    return await getQuery(key);
}

async function invalidateBlogCache(id = null) {
    await cache.del(CacheKeys.BLOGS_ALL);
    if (id) {
        await cache.del(`${CacheKeys.BLOG_DETAIL}:${id}`);
    }
}

async function saveUser(userId, user) {
    const key = getUserDataKey(userId);
    return await setQuery(key, { data: user }, new Date(Date.now() + Number(process.env.CONTENT_CACHE_DURATION)));
}

async function fetchUser(userId) {
    const key = getUserDataKey(userId);
    const result = await getQuery(key);
    if (!result) return null;
    return result.data;
}

async function deleteUser(userId) {
    const key = getUserDataKey(userId);
    return await setQuery(key, null, new Date(Date.now() + Number(process.env.CONTENT_CACHE_DURATION)));
}

async function saveComments(id, comments) {
    const key = `${CacheKeys.BLOG_COMMENTS}:${id}`;
    return await setQuery(key, comments, new Date(Date.now() + Number(process.env.CONTENT_CACHE_DURATION)));
}

async function fetchComments(id) {
    const key = `${CacheKeys.BLOG_COMMENTS}:${id}`;
    return await getQuery(key);
}

async function invalidateCommentsCache(id) {
    await cache.del(`${CacheKeys.BLOG_COMMENTS}:${id}`);
}

async function saveLikes(id, likes) {
    const key = `blog:likes:${id}`;
    return await setQuery(key, likes, new Date(Date.now() + Number(process.env.CONTENT_CACHE_DURATION)));
}

async function fetchLikes(id) {
    const key = `blog:likes:${id}`;
    return await getQuery(key);
}

async function saveViews(id, views) {
    const key = `blog:views:${id}`;
    return await setQuery(key, views, new Date(Date.now() + Number(process.env.CONTENT_CACHE_DURATION)));
}

async function fetchViews(id) {
    const key = `blog:views:${id}`;
    return await getQuery(key);
}

const cacheService = { 
    saveUser, 
    fetchUser, 
    deleteUser, 
    saveBlog, 
    fetchBlog, 
    saveBlogDetail, 
    fetchBlogDetail, 
    invalidateBlogCache,
    saveComments,
    fetchComments,
    invalidateCommentsCache,
    saveLikes,
    fetchLikes,
    saveViews,
    fetchViews
};

export { 
    saveUser, 
    fetchUser, 
    deleteUser, 
    saveBlog, 
    fetchBlog, 
    saveBlogDetail, 
    fetchBlogDetail, 
    invalidateBlogCache,
    saveComments,
    fetchComments,
    invalidateCommentsCache,
    saveLikes,
    fetchLikes,
    saveViews,
    fetchViews
};

export default cacheService;
