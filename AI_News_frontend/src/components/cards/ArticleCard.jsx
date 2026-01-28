import { Link } from "react-router-dom";
import { ArrowUpRight, Calendar, Globe, MessageSquare } from "lucide-react";
import CommentBox from "../ui/CommentBox";
import ArticleActions from "../ui/ArticleActions";

export default function ArticleCard({ article, onUpdate }) {
  // Use the pre-formatted slug from the API for the URL
  // Matches your backend route: /:category/:slug
  const articleLink = `/${article.categorySlug || "news"}/${article.slug}`;

  return (
    <div className="group flex flex-col bg-white border border-slate-200 overflow-hidden transition-all duration-300 hover:border-blue-600/30 hover:shadow-xl">
      
      {/* Image Section */}
      <Link 
        to={articleLink}
        onClick={() => sessionStorage.setItem("homeScroll", window.scrollY)}
        className="relative block aspect-video overflow-hidden bg-slate-100"
      >
        {article.bannerImage ? (
          <img
            src={article.bannerImage}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-50">
             <Globe className="h-10 w-10 text-slate-200" />
          </div>
        )}

        {/* Category Badge Overlay - Shows Display Name */}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-900 border border-slate-200">
            {article.category || "AI Insight"}
          </span>
        </div>

        {/* Floating Action Arrow */}
        <div className="absolute right-4 bottom-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="bg-blue-600 p-2 text-white shadow-lg">
            <ArrowUpRight size={18} />
          </div>
        </div>
      </Link>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-6">
        
        {/* Source & Date Info */}
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.15em] text-blue-600 mb-3">
          <span className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {article.source?.name || "Global News"}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400">
            {new Date(article.publishedAt).toLocaleDateString("en-US", { 
              month: "short", 
              day: "numeric"
            })}
          </span>
        </div>

        {/* Title */}
        <Link 
          to={articleLink}
          className="block mb-3"
        >
          <h2 className="font-serif text-2xl font-bold leading-tight text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {article.title}
          </h2>
        </Link>

        {/* Summary */}
        <p className="text-sm leading-relaxed text-slate-600 line-clamp-3 mb-6">
          {article.summary}
        </p>

        {/* Interactive Footer (Actions & Comments) */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <ArticleActions article={article} onUpdate={onUpdate} />
            
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
              <MessageSquare size={14} />
              {article.comments?.length || 0}
            </div>
          </div>

          <CommentBox
            articleId={article._id}
            comments={article.comments || []}
            onNewComment={(updatedComments) => {
              if (typeof onUpdate === "function") {
                onUpdate({
                  ...article,
                  comments: updatedComments,
                });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}