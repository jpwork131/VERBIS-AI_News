import React from "react";
import { Edit3, Trash2, Loader2, ExternalLink, ShieldAlert } from "lucide-react";

const ArticleTable = ({ articles, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center bg-white border-b-2 border-slate-900">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Synchronizing Asset Ledger...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="py-32 text-center bg-white border-b-2 border-slate-900 border-dashed">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">No intelligence assets found in this cluster.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-b-2 border-slate-900 overflow-hidden">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left border-collapse min-w-212.5">
          <thead>
            <tr className="bg-white border-b border-slate-900 sticky top-0 z-20">
              <th className="px-6 py-5 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Asset Information</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Taxonomy</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Temporal Data</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {articles.map((article) => (
              <tr key={article._id} className="hover:bg-blue-50/30 transition-colors group">
                {/* ASSET INFO */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 shrink-0 overflow-hidden transition-all">
                      <img 
                        src={article.bannerImage || "https://via.placeholder.com/100"} 
                        alt="" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/100?text=VOID"; }}
                      />
                      {article.isPurged && (
                        <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
                          <ShieldAlert size={16} className="text-red-600 drop-shadow-md" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 max-w-md">
                      <p className="font-serif font-bold text-slate-900 line-clamp-1 italic leading-tight text-sm">
                        {article.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-37.5">
                          {article.slug}
                        </span>
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-slate-300 hover:text-blue-600 transition-colors"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                </td>

                {/* TAXONOMY */}
                <td className="px-6 py-5">
                  <span className="inline-block border border-slate-900 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-900 bg-white">
                    {article.category || "Uncategorized"}
                  </span>
                  <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase font-bold tracking-tighter">
                    Engine: {article.modelUsed || "V-Core"}
                  </p>
                </td>

                {/* TEMPORAL DATA */}
                <td className="px-6 py-5">
                  <p className="font-mono text-[11px] font-bold text-slate-900">
                    {new Date(article.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.')}
                  </p>
                  <p className="font-mono text-[10px] font-medium text-slate-400 uppercase">
                    {new Date(article.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </p>
                </td>

                {/* OPERATIONS */}
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(article)}
                      className="p-2 border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all"
                      title="Edit Asset"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(article._id)}
                      className="p-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                      title="Purge Permanently"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArticleTable;