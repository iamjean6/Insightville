import { Search, ArrowRight } from "lucide-react";
import { getPopularCategories } from "../../services/api";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchResults } from "../../services/api";

export default function HeroCTA() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState([])
    const [popularBlogs, setPopularBlogs] = useState([]);
    useEffect(() => {
        const fetchPopularBlogs = async () => {
            try {
                const res = await getPopularCategories();
                if (res.success) {
                    setPopularBlogs(res.data);
                }
            } catch (err) {
                console.error('Failed to fetch popular blogs:', err);
            }
        };
        fetchPopularBlogs();
    }, []);



    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.trim()) {
                try {
                    const res = await fetchResults(searchQuery);
                    if (res && res.data) {
                        setResults(res.data);
                    }
                } catch (err) {
                    console.error("Search failed:", err);
                }
            } else {
                setResults([]);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        // For now, prevent default search navigation since we have a live dropdown
        // Alternatively, we could navigate to a dedicated search page if it existed
    };

    return (
        <div className="w-full relative overflow-hidden py-20 lg:py-32 flex flex-col items-center justify-center text-center px-4 transition-colors duration-300">

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">

                <h1 className="text-5xl md:text-7xl font-alfa text-foreground mb-6 tracking-tight leading-tight drop-shadow-lg">
                    Uncover The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Extraordinary</span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground font-changa max-w-2xl mb-10 leading-relaxed">
                    Dive into our curated insights, cutting-edge trends, and compelling stories from around the globe. Stay curious.
                </p>

                {/* Search Bar Container */}
                <div className="w-full max-w-lg mb-8 relative group">
                    <form onSubmit={handleSearch} className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for articles, trends, or topics..."
                            className="w-full bg-card border-2 border-border text-foreground placeholder-muted-foreground rounded-full py-4 pl-12 pr-32 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-vend text-lg shadow-inner"
                        />
                        <button type="submit" className="absolute inset-y-2 right-2 bg-primary hover:bg-primary/90 text-primary-foreground font-righteous uppercase text-sm tracking-wider px-6 rounded-full transition-colors flex items-center gap-2 shadow-lg shadow-primary/30">
                            Search
                        </button>
                    </form>

                    {/* Live Search Results Dropdown */}
                    {results.length > 0 && (
                        <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50 text-left">
                            {results.map(article => (
                                <Link 
                                    to={`/article/${article._id}`} 
                                    key={article._id}
                                    className="block px-6 py-4 hover:bg-muted/50 border-b border-border/50 last:border-0 transition-colors"
                                >
                                    <h4 className="font-bold text-foreground font-vend truncate">{article.title}</h4>
                                    <div className="flex gap-2 items-center mt-1 text-xs text-muted-foreground">
                                        <span className="uppercase font-bold text-primary">{article.category}</span>
                                        <span>•</span>
                                        <span>{new Date(article.date).toLocaleDateString()}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-4 items-center text-sm font-vend text-muted-foreground">
                    <span>Popular:</span>
                    {popularBlogs.map((blog, index) => (
                        <Link to={`/category/${blog._id}`} key={blog._id} className="cursor-pointer hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4">{blog.category}</Link>
                    ))}
                </div>

            </div>
        </div>
    );
}
