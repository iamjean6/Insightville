import React, { useState, useEffect } from "react";
import Card3 from "../cards/card3";
import { mockArticles } from "../../constants/index";
import { getBlogs } from "../../services/api";
import { useCategory } from "../utils/CategoryContext";
import Pagination from "../utils/pagination";

export default function Latestnews() {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const { selectedCategory } = useCategory();
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(6);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await getBlogs();
                if (response && response.data) {
                    setPosts(response.data);
                } else {
                    setPosts(mockArticles);
                }
            } catch (err) {
                console.warn("API unavailable, using mock data:", err);
                setPosts(mockArticles);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    useEffect(() => {
        if (selectedCategory === "All") {
            setFilteredPosts(posts);
        } else {
            setFilteredPosts(posts.filter(post => post.category === selectedCategory));
        }
        setCurrentPage(1);
    }, [selectedCategory, posts]);

    const lastPostIndex = currentPage * postsPerPage;
    const firstPostIndex = lastPostIndex - postsPerPage;
    const currentPosts = filteredPosts.slice(firstPostIndex, lastPostIndex);

    return (
        <div className="w-full min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                <div className="mb-8">
                    <h2 className="text-3xl text-foreground font-bold tracking-tight font-vend mb-3 drop-shadow-md">
                        Latest News
                    </h2>
                    <div className="border-t-2 border-primary w-16 shadow-lg shadow-primary/40"></div>
                </div>

                {/* Make it 1 column strictly on smaller views, 2 columns on lg displays for standard horizontal feel. */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                    {currentPosts.map((article) => (
                        <Card3 key={article._id || article.id} article={article} />
                    ))}
                </div>
                <Pagination
                    totalPosts={filteredPosts.length}
                    postsPerPage={postsPerPage}
                    setCurrentPage={setCurrentPage}
                    currentPage={currentPage}
                />
                <div className="flex justify-center bg-transparent mt-8 px-16">
                    <img src="/img/journal.svg" alt="" className="w-1/2 h-48" />
                </div>
            </div>
        </div>
    )
}