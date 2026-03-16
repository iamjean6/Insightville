import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

const Pagination = ({ totalPosts, postsPerPage, currentPage, setCurrentPage }) => {
    let pages = [];
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="flex justify-center items-center gap-2 mt-12 mb-8">
            {/* Previous Button */}
            <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className={`flex items-center justify-center gap-2 ${currentPage === 1
                    ? "text-gray-600 cursor-not-allowed"
                    : "text-white bg-white/10 hover:bg-cyan-500 hover:text-black hover:scale-110 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                    }`}
                aria-label="Previous Page"
            >
                <ChevronLeft />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-2">
                {pages.map((page, index) => {
                    const isActive = page === currentPage;
                    return (
                        <button
                            key={index}
                            onClick={() => setCurrentPage(page)}
                            className={`
                                w-6 h-6 rounded-full text-sm font-bold
                                transition-all duration-500 transform
                                ${isActive
                                    ? "bg-cyan-500 text-black scale-110 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:scale-105 border border-white/5"}
                            `}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            {/* Next Button */}
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center gap-2 ${currentPage === totalPages
                    ? "text-gray-600 cursor-not-allowed"
                    : "text-white bg-white/10 hover:bg-cyan-500 hover:text-black hover:scale-110 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                    }`}
                aria-label="Next Page"
            >
                <ChevronRight />
            </button>
        </div>
    );
};

export default Pagination