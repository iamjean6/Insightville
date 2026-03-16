import { Link } from "react-router-dom";
import { Pencil, Folder, MessageCircle, Calendar } from "lucide-react";

const Card5 = ({ article }) => {
  return (
    <div className="bg-card border border-border relative rounded-2xl flex flex-col group overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
      <Link to={`/article/${article.id}`} className="relative w-full h-72 lg:h-80 overflow-hidden shrink-0 block">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {article.isFeatured && (
          <span className="absolute top-4 left-4 bg-primary text-primary-foreground font-righteous text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
            Featured
          </span>
        )}
      </Link>

      <div className="flex flex-col flex-1 pt-6 px-6 font-vend text-foreground bg-transparent">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Calendar size={14} />
          <span>{article.date}</span>
        </div>

        <Link to={`/article/${article.id}`}>
          <h3 className="text-xl font-extrabold text-foreground leading-snug group-hover:text-primary transition-colors mb-3">
            {article.title}
          </h3>
        </Link>

        <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
          {article.excerpt}
        </p>

        <div className="w-12 h-px bg-primary/30 mb-4 mt-auto"></div>

        <div className="flex flex-wrap items-center text-muted-foreground gap-x-4 gap-y-2 py-4 text-xs sm:text-sm">
          <div className='flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer'>
            <Pencil className="text-primary" size={15} />
            <span className="whitespace-nowrap">by {article.author}</span>
          </div>
          <span className="text-border">/</span>
          <div className='flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer'>
            <Folder className="text-primary" size={15} />
            <span className="font-semibold whitespace-nowrap">{article.category}</span>
          </div>
          <span className="text-border hidden md:inline">/</span>
          <div className='flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer'>
            <MessageCircle className="text-primary" size={15} />
            <span className="whitespace-nowrap">{Math.floor(Math.random() * 40) + 5} Comments</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card5;
