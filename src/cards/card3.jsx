import { Share, Heart, Bookmark, Eye, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";

const Card3 = ({ article }) => {
    return (
        <Link to={`/article/${article._id || article.id}`} className="group flex bg-card border border-border rounded-2xl shadow-md p-4 gap-6 mb-6 max-w-3xl h-full transition-all duration-300">

            {/* Image */}
            <div className="relative md:w-64 md:h-64 h-56 w-42 flex-shrink-0 overflow-hidden rounded-3xl">
                <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                />

                {/* Category */}
                <span className="absolute top-3 left-3 text-xs text-white font-black font-righteous bg-primary/80 backdrop-blur-sm px-2 py-1 rounded-lg">
                    #{article.category}
                </span>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-between flex-1 font-vend">

                <div>
                    <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {article.title}
                    </h2>

                    <p className="text-muted-foreground text-sm mt-2 line-clamp-3">
                        {article.excerpt}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4">

                    {/* Author */}
                    <div className="flex items-center gap-3">
                        <img
                            src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop"
                            className="w-8 h-8 rounded-full border border-border"
                        />

                        <div>
                            <p className="text-sm font-semibold text-foreground">{article.author}</p>
                            <p className="text-xs text-muted-foreground">{new Date(article.date).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Share size={18} className="cursor-pointer hover:text-primary transition-colors" />
                        <MoreHorizontal size={18} className="cursor-pointer hover:text-primary transition-colors" />
                    </div>

                </div>

            </div>
        </Link>
    );
};

export default Card3;