import { mockArticles } from "../../constants/indes";
import Card5 from "../cards/card5";
import Lottie from "lottie-react";
import Pagination from "../utils/pagination";
import { useState, useEffect } from "react";

export default function EditorsPick() {
    // Use currentPosts for the grid to enable pagination
    const [animationData, setAnimationData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(6);

    useEffect(() => {
        fetch("/img/Writing.json")
            .then(res => res.json())
            .then(data => setAnimationData(data))
            .catch(err => console.log("Lottie load error:", err));
    }, []);

    const lastPostIndex = currentPage * postsPerPage;
    const firstPostIndex = lastPostIndex - postsPerPage;
    const currentPosts = mockArticles.slice(firstPostIndex, lastPostIndex);

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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {currentPosts.map((article) => (
                        <Card5 key={article.id} article={article} />
                    ))}
                </div>
                <Pagination
                    totalPosts={mockArticles.length}
                    postsPerPage={postsPerPage}
                    setCurrentPage={setCurrentPage}
                    currentPage={currentPage}
                />
            </div>
        </div>
    );
}
