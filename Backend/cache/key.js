export const CacheKeys = {
    BLOGS_ALL: "blogs:all",
    BLOG_DETAIL: "blog:detail",
    BLOG_COMMENTS: "blog:comments",

}
function getCacheKey(key, userId, blogId) {
    return `${key}:${userId}:${blogId}`;
}
export function getUserDataKey(userId) {
    return getCacheKey(CacheKeys.USER_DATA, userId);
}