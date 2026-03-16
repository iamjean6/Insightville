import { ArrowRight, Calendar, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const BlogCard = ({ article }) => {
    return (
        <Link to={`/article/${article.id}`} className="relative bg-card border border-border rounded-3xl w-full h-full flex flex-col overflow-hidden group transition-all duration-300">

            {/* Top Image Section */}
            <div className="relative w-full h-56 shrink-0 rounded-t-3xl overflow-hidden">
                <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Floating Button "Cut-out" Top Left */}
                <div className="absolute top-0 left-0">
                    <div className="relative">
                        {/* Background filler for the cut-out look */}
                        <div className="absolute top-0 left-0 w-full h-full bg-card rounded-br-3xl z-0 border-r border-b border-border"></div>
                        <button className="relative z-10 bg-card text-foreground rounded-br-2xl px-5 py-3 flex items-center gap-2 font-vend font-bold text-sm hover:text-primary transition-colors">
                            Read Article
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Overlay Gradient for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
            </div>

            {/* Bottom Content Section - Centered */}
            <div className="p-6 flex flex-col flex-1 items-center text-center bg-card rounded-b-3xl -mt-4 relative z-20">

                <h3 className="text-xl font-bold font-vend text-foreground leading-tight mb-3 group-hover:text-primary transition-colors">
                    {article.title}
                </h3>

                <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                    {article.excerpt}
                </p>

                {/* Meta details anchored at absolute bottom of centered flex */}
                <div className="mt-auto flex items-center justify-center gap-6 text-sm font-medium text-muted-foreground w-full pt-4 border-t border-border">
                    <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <Calendar size={15} />
                        <span>{article.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 hover:text-rose-500 transition-colors">
                        <Heart size={15} />
                        <span>{article.likes || Math.floor(Math.random() * 500)}</span>
                    </div>
                </div>

            </div>

        </Link>
    );
};

export default BlogCard;