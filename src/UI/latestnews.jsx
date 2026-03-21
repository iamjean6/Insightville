import React, { useState, useEffect } from "react";
import Card3 from "../cards/card3";
import { mockArticles } from "../../constants/index";
import { getBlogs, getLatestBlogs, getBlogsByCategory } from "../../services/api";
import { useCategory } from "../utils/CategoryContext";
import Pagination from "../utils/pagination";

export default function Latestnews() {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const { selectedCategory, selectedSubcategory } = useCategory();
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(6);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                let response;
                if (selectedCategory === "All") {
                    response = await getLatestBlogs();
                } else {
                    response = await getBlogsByCategory(selectedCategory, selectedSubcategory);
                }

                if (response && response.success) {
                    setPosts(response.data);
                    setFilteredPosts(response.data);
                } else {
                    const fallback = selectedCategory === "All"
                        ? mockArticles
                        : mockArticles.filter(post => post.category === selectedCategory);
                    setPosts(fallback);
                    setFilteredPosts(fallback);
                }
            } catch (err) {
                console.warn("API unavailable, using mock data:", err);
                const fallback = selectedCategory === "All"
                    ? mockArticles
                    : mockArticles.filter(post => post.category === selectedCategory);
                setPosts(fallback);
                setFilteredPosts(fallback);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
        setCurrentPage(1);
    }, [selectedCategory, selectedSubcategory]);

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

                {filteredPosts.length === 0 ? (
                    <div className="w-full py-20 text-center rounded-3xl ">
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center mx-auto shadow-sm border border-border">
                                <img src="/img/dicaprio.gif" alt="" className="w-full h-full object-cover rounded-full" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground font-vend">No articles available</h3>
                            <p className="text-muted-foreground font-medium italic">
                                There are currently no articles in the <span className="text-primary font-bold">"{selectedCategory}"</span> category for this section.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                        {currentPosts.map((article) => (
                            <Card3 key={article._id || article.id} article={article} />
                        ))}
                    </div>
                )}
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