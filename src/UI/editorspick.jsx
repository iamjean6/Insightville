import { mockArticles } from "../../constants/index";
import Card5 from "../cards/card5";
import Lottie from "lottie-react";
import Pagination from "../utils/pagination";
import { useState, useEffect } from "react";
import { getBlogs } from "../../services/api";
import { useCategory } from "../utils/CategoryContext";

export default function EditorsPick() {
    const [animationData, setAnimationData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const { selectedCategory, selectedSubcategory } = useCategory();
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(6);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/img/Writing.json")
            .then(res => res.json())
            .then(data => setAnimationData(data))
            .catch(err => console.log("Lottie load error:", err));

        const fetchPosts = async () => {
            try {
                const response = await getBlogs();
                if (response && response.data) {
                    const picks = response.data.filter(p => p.editorsPick);
                    setPosts(picks.length > 0 ? picks : mockArticles.filter(p => p.isFeatured));
                } else {
                    setPosts(mockArticles.filter(p => p.isFeatured));
                }
            } catch (err) {
                console.warn("API unavailable, using mock data:", err);
                setPosts(mockArticles.filter(p => p.isFeatured));
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
        setCurrentPage(1);
    }, [selectedCategory, selectedSubcategory, posts]);

    const lastPostIndex = currentPage * postsPerPage;
    const firstPostIndex = lastPostIndex - postsPerPage;
    const currentPosts = filteredPosts.slice(firstPostIndex, lastPostIndex);

    return (
        <div className="w-full bg-background py-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-12">
                    <div className="flex items-center gap-3">
                        {animationData ? (
                            <div className="w-16 h-16">
                                <Lottie animationData={animationData} loop={true} />
                            </div>
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-muted animate-pulse"></div>
                        )}
                        <h2 className="text-3xl mt-2 lg:text-4xl text-foreground font-bold tracking-tight font-vend mb-3 drop-shadow-md">
                            Editor's Pick
                        </h2>
                    </div>
                    <p className="text-muted-foreground font-changa text-lg mb-4 max-w-2xl">
                        Handpicked stories and exclusive insights curated by our editorial team.
                    </p>
                    <div className="border-t-2 border-primary w-16 shadow-lg shadow-primary/40"></div>
                </div>

                {filteredPosts.length === 0 ? (
                    <div className="w-full py-20 text-center rounded-3xl bg-muted/5 backdrop-blur-sm">
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center mx-auto shadow-sm border border-border">
                                <img src="/img/jonah.gif" alt="" className="w-full h-full object-cover rounded-full" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground font-vend">No articles available</h3>
                            <p className="text-muted-foreground font-medium italic">
                                There are currently no articles in the <span className="text-primary font-bold">"{selectedCategory}"</span> category for this section.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {currentPosts.map((article) => (
                            <Card5 key={article._id || article.id} article={article} />
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
        </div>
    );
}
