import React, { useState, useEffect } from "react";
import { mockArticles } from "../../constants/index";
import Overlay from "../cards/overlay";
import Standard from "../cards/standard";
import Pagination from "../utils/pagination";
import { getBlogs } from "../../services/api";
import { useCategory } from "../utils/CategoryContext";

const ArticleCard = ({ article }) => {
    return (
        <div className="break-inside-avoid mb-6 h-full">
            {article.featured ? (
                <Overlay article={article} />
            ) : (
                <Standard article={article} />
            )}
        </div>
    );
};

export default function Featuredstories() {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const { selectedCategory, selectedSubcategory } = useCategory();
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(6);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await getBlogs();
                if (response && response.data) {
                    setPosts(response.data);
                    setFilteredPosts(response.data);
                } else {
                    setPosts(mockArticles);
                    setFilteredPosts(mockArticles);
                }
            } catch (err) {
                console.warn("API unavailable, using mock data:", err);
                setPosts(mockArticles);
                setFilteredPosts(mockArticles);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    useEffect(() => {
        let filtered = posts;
        if (selectedCategory !== "All") {
            filtered = filtered.filter(post => post.category === selectedCategory);
            if (selectedSubcategory) {
                filtered = filtered.filter(post => post.subcategory === selectedSubcategory);
            }
        }
        setFilteredPosts(filtered);
        setCurrentPage(1); // Reset to first page on filter change
    }, [selectedCategory, selectedSubcategory, posts]);

    const lastPostIndex = currentPage * postsPerPage;
    const firstPostIndex = lastPostIndex - postsPerPage;
    const currentPosts = filteredPosts.slice(firstPostIndex, lastPostIndex);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-300">
            <div className="mb-10 text-center">
                <h1 className="text-4xl md:text-5xl font-righteous text-foreground mb-4">Recent Stories</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">Explore our curated collection of featured stories and in-depth articles across trending categories.</p>
            </div>

            {filteredPosts.length === 0 ? (
                <div className="w-full py-20 text-center rounded-3xl  ">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center mx-auto shadow-sm border border-border">
                            <img src="/img/not_found.gif" alt="" className="w-full h-full object-cover rounded-full" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground font-vend">No articles available</h3>
                        <p className="text-muted-foreground font-medium italic">
                            There are currently no articles in the <span className="text-primary font-bold">"{selectedCategory}"</span> category for this section.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                    {currentPosts.map((article) => (
                        <ArticleCard key={article._id || article.id} article={article} />
                    ))}
                </div>
            )}

            <Pagination
                totalPosts={filteredPosts.length}
                postsPerPage={postsPerPage}
                setCurrentPage={setCurrentPage}
                currentPage={currentPage}
            />
        </div>
    );
}
