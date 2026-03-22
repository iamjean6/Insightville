import { User, Calendar, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const Standard = ({ article }) => {
    return (
        <div className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 w-full h-full">
            <Link to={`/article/${article._id || article.id}`} className="relative overflow-hidden w-full aspect-video block bg-muted/20">
                <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover hover:cursor-pointer group-hover:scale-[1.01] transition-transform duration-300 text-transparent"
                />
                {/* Badge */}
                <div className="absolute top-4 left-4 z-10">
                    <span className="bg-background/80 backdrop-blur-sm text-primary font-righteous text-xs uppercase tracking-wider px-3 py-1 rounded-full border border-primary/30">
                        {article.category}
                    </span>
                </div>
            </Link>

            <div className="p-6 flex flex-col flex-grow">
                <Link to={`/article/${article._id || article.id}`}>
                    <h2 className="text-xl font-bold tracking-tight font-vend text-foreground mb-3 group-hover:text-primary transition-colors">
                        {article.title}
                    </h2>
                </Link>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                </p>
                <div className="mt-auto text-xs text-muted-foreground flex items-center gap-2 font-medium">
                    <div className="flex items-center gap-2">
                        <User size={14} />
                        <span>{article.author}</span>
                    </div>
                    <span>&bull;</span>
                    <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{new Date(article.date).toLocaleDateString()}</span>
                    </div>
                    <span>&bull;</span>
                    <div className="flex items-center gap-2">
                        <Eye size={14} />
                        <span>{article.views || 0} views</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Standard;
