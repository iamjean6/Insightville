import React from "react";
import { mockArticles } from "../../constants/indes";
import Overlay from "../cards/overlay";
import Standard from "../cards/standard";
import Pagination from "../utils/pagination";

import { useState } from "react";

const ArticleCard = ({ article }) => {
    return (
        <div className="break-inside-avoid mb-6 h-full">
            {article.isFeatured ? (
                <Overlay article={article} />
            ) : (
                <Standard article={article} />
            )}
        </div>
    );
};

export default function Featuredstories() {
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(6);

    const lastPostIndex = currentPage * postsPerPage;
    const firstPostIndex = lastPostIndex - postsPerPage;
    const currentPosts = mockArticles.slice(firstPostIndex, lastPostIndex);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-300">
            <div className="mb-10 text-center">
                <h1 className="text-4xl md:text-5xl font-righteous text-foreground mb-4">Recent Stories</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">Explore our curated collection of featured stories and in-depth articles across trending categories.</p>
            </div>

            {/* Masonry Container */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                {currentPosts.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </div>

            <Pagination
                totalPosts={mockArticles.length}
                postsPerPage={postsPerPage}
                setCurrentPage={setCurrentPage}
                currentPage={currentPage}
            />
        </div>
    );
}
