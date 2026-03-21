import React, { useState, useEffect } from 'react';
import { getBreakingBlogs } from '../../services/api';
import { X, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const BreakingTicker = () => {
    const [breakingNews, setBreakingNews] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBreaking = async () => {
            try {
                const response = await getBreakingBlogs();
                if (response.success && response.data.length > 0) {
                    setBreakingNews(response.data);
                } else {
                    setIsVisible(false);
                }
            } catch (error) {
                console.error("Failed to fetch breaking news:", error);
                setIsVisible(false);
            } finally {
                setLoading(false);
            }
        };

        fetchBreaking();
    }, []);

    useEffect(() => {
        if (breakingNews.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [breakingNews]);

    if (!isVisible || loading || breakingNews.length === 0) return null;

    const currentItem = breakingNews[currentIndex];

    return (
        <div className="bg-primary text-primary-foreground py-2 px-4 relative overflow-hidden flex items-center shadow-md z-50">
            {/* Ticker Label */}
            <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider animate-pulse whitespace-nowrap z-10">
                <Zap size={14} fill="currentColor" />
                Breaking News
            </div>

            {/* Content Area */}
            <div className="flex-1 ml-4 relative h-6 overflow-hidden">
                {breakingNews.map((item, index) => (
                    <Link
                        key={item._id}
                        to={`/article/${item._id}`}
                        className={`absolute inset-0 flex items-center transition-all duration-700 ease-in-out hover:underline underline-offset-4
                            ${index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
                    >
                        <span className="text-sm font-medium truncate max-w-[80vw]">
                            {item.title}
                        </span>
                    </Link>
                ))}
            </div>

            {/* Close Button */}
            <button 
                onClick={() => setIsVisible(false)}
                className="ml-4 p-1 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close"
            >
                <X size={16} />
            </button>

            {/* Animated background element */}
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-white/5 to-transparent skew-x-12 transform translate-x-20"></div>
        </div>
    );
};

export default BreakingTicker;
