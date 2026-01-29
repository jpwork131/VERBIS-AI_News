import { Link } from "react-router-dom";
import { ArrowUpRight, Calendar, Globe, MessageSquare, ChevronRight } from "lucide-react";
import CommentBox from "../ui/CommentBox";
import ArticleActions from "../ui/ArticleActions";

export default function ArticleCard({ article, onUpdate, variant = "grid" }) {
  const articleLink = `/${article.categorySlug || "news"}/${article.slug}`;

  // HOME-ONLY LOGIC: Filter for top-level comments and take only the latest 2
  const previewComments = (article.comments || [])
    .filter(c => !c.parentId)
    .slice(-2) 
    .reverse();

    // VARIANT: SIDEBAR/COMPACT (For "Flash Reports")
  if (variant === "compact") {
    return (
      <Link to={articleLink} className="group flex gap-4 border-b border-slate-100 pb-4 last:border-0">
        <div className="w-20 h-20 shrink-0 bg-slate-100 overflow-hidden">
          <img src={article.bannerImage} className="h-full w-full object-cover transition-all duration-500" />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1">{article.category}</span>
          <h4 className="text-xs font-bold leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">{article.title}</h4>
        </div>
      </Link>
    );
  }

  // VARIANT: HORIZONTAL (For the "Main Feed" list)
  if (variant === "horizontal") {
    // Get the latest comment for the preview
    const latestComment = article.comments?.[article.comments.length - 1];

    return (
      <div className="group grid grid-cols-1 md:grid-cols-12 gap-6 pb-10 border-b border-slate-100">
        {/* Image Container with Hover Preview */}
        <Link 
          to={articleLink} 
          className="md:col-span-4 aspect-video bg-slate-100 overflow-hidden relative group/img cursor-pointer"
        >
          <img 
            src={article.bannerImage} 
            className="h-full w-full object-cover group-hover/img:scale-105 transition-transform duration-700" 
            alt={article.title}
          />
          
          {/* Category Label */}
          <div className="absolute top-3 left-3 bg-white px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter shadow-sm z-10">
            {article.category}
          </div>

          {/* FLOATING COMMENT TOOLTIP (The Hover Preview) */}
          {latestComment && (
            <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover/img:translate-y-0 transition-transform duration-300 bg-slate-900/95 backdrop-blur-sm z-20">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">
                  Latest Comment
                </span>
              </div>
              <p className="text-[10px] text-white italic line-clamp-2 leading-relaxed font-medium">
                "{latestComment.comment}"
              </p>
              <p className="text-[9px] text-slate-400 mt-2 uppercase font-black tracking-tight">
                — {latestComment.userName}
              </p>
            </div>
          )}
        </Link>

        {/* Content Section */}
        <div className="md:col-span-8 flex flex-col py-1">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase mb-2">
            <span className="text-blue-600">{article.source?.name || "Global News"}</span>
            <span>•</span>
            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
          </div>
          
          <Link to={articleLink}>
            <h3 className="font-serif text-2xl font-black leading-tight group-hover:text-blue-600 transition-colors mb-3">
              {article.title}
            </h3>
          </Link>
          
          <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed font-medium">
            {article.summary}
          </p>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ArticleActions article={article} onUpdate={onUpdate} />
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <MessageSquare size={12} /> 
                {article.comments?.length || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-900 border border-slate-200">
            {article.category || "AI Insight"}
          </span>
        </div>

        <div className="absolute right-4 bottom-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="bg-blue-600 p-2 text-white shadow-lg">
            <ArrowUpRight size={18} />
          </div>
        </div>
      </Link>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-6">
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

        <Link to={articleLink} className="block mb-3">
          <h2 className="font-serif text-2xl font-bold leading-tight text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {article.title}
          </h2>
        </Link>

        <p className="text-sm leading-relaxed text-slate-600 line-clamp-3 mb-6">
          {article.summary}
        </p>

        {/* Home Card Discussion Preview */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <ArticleActions article={article} onUpdate={onUpdate} />
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <MessageSquare size={14} />
              {article.comments?.length || 0}
            </div>
          </div>

          {/* Homepage Limited Comments View */}
          <div className="space-y-2 mb-4">
             {previewComments.length > 0 ? (
               previewComments.map(c => (
                 <div key={c._id} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                   <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">{c.userName}</p>
                   <p className="text-xs text-slate-600 line-clamp-1 italic">"{c.comment}"</p>
                 </div>
               ))
             ) : (
               <p className="text-[10px] text-slate-400 uppercase tracking-widest">No comments yet</p>
             )}
          </div>

          <Link 
            to={articleLink}
            className="flex w-full items-center justify-center gap-2 bg-slate-900 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-blue-600"
          >
            View All Comments <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}