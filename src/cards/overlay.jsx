import { User, Calendar, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const Overlay = ({ article }) => {
    return (
        <Link to={`/article/${article._id || article.id}`} className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 w-full h-full block">
            <img
                src={article.image}
                alt={article.title}
                className="w-full h-full hover:cursor-pointer object-cover group-hover:scale-[1.01] transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>

            <div className="absolute top-4 left-4 z-10">
                <span className="bg-primary text-primary-foreground font-righteous text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                    {article.category}
                </span>
            </div>

            <div className="absolute bottom-0 p-6 w-full text-white z-10">
                <h2 className="text-2xl font-bold tracking-tight font-vend mb-2 drop-shadow-md">
                    {article.title}
                </h2>
                <p className="text-sm text-gray-200 mb-3 drop-shadow line-clamp-2 opacity-90">
                    {article.excerpt}
                </p>
                <div className="text-xs text-gray-300 flex items-center gap-2">
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
        </Link>
    )
}

export default Overlay;