import React, { useEffect, useState } from "react";
import { X, Save, Loader2, List, Plus, Newspaper, Layout, ImageIcon, Search, Settings, Globe } from "lucide-react";
import { getCategories } from "../../api/articles";

const EditArticleDrawer = ({ 
  isOpen, 
  article, 
  onClose, 
  onUpdate, 
  setArticle, 
  isSubmitting 
}) => {
  const [isManual, setIsManual] = useState(false);
  const [availableSilos, setAvailableSilos] = useState([]);
  const [loadingSilos, setLoadingSilos] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadSilos = async () => {
        setLoadingSilos(true);
        try {
          const silos = await getCategories(); // Uses your new backend endpoint
          setAvailableSilos(silos);
        } catch (err) {
          console.error("Failed to fetch silos:", err);
        } finally {
          setLoadingSilos(false);
        }
      };
      loadSilos();
    }
  }, [isOpen]);

  if (!isOpen || !article) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(e);
  };

  return (
    <div className="fixed inset-0 z-100 flex justify-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className="relative w-full sm:w-[85%] md:max-w-2xl bg-white border-l-4 border-slate-900 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b-2 border-slate-900 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-slate-900 text-white">
              <Newspaper size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Edit Asset</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">ID: {article._id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 border border-transparent hover:border-slate-900 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-12 pb-32">
          
          {/* CONTENT SECTION */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2">
              <Layout size={14} className="text-slate-900" />
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Article Body</h4>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Headline</label>
                <input 
                  type="text" 
                  value={article.title || ""} 
                  onChange={e => setArticle({...article, title: e.target.value})}
                  className="w-full p-4 bg-white border-2 border-slate-200 focus:border-slate-900 font-serif font-bold italic text-lg outline-none transition-all"
                />
              </div>

              {/* NEW: Summary field - Critical for Home Page display */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Summary (Deck)</label>
                <textarea 
                  rows="3"
                  value={article.summary || ""} 
                  onChange={e => setArticle({...article, summary: e.target.value})}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-200 focus:border-slate-900 text-sm font-medium outline-none transition-all"
                  placeholder="Brief summary for the article card..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Article Text (Markdown)</label>
                <textarea 
                  rows="12"
                  value={article.aiContent || ""} 
                  onChange={e => setArticle({...article, aiContent: e.target.value})}
                  className="w-full p-4 bg-white border-2 border-slate-200 focus:border-slate-900 text-sm leading-relaxed outline-none transition-all font-medium"
                />
              </div>
            </div>
          </section>

          {/* CLASSIFICATION (SILO LOGIC) */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2">
              <Globe size={14} className="text-slate-900" />
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Category Placement</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest"> Category Name</label>
                  <button 
                    type="button" 
                    onClick={() => setIsManual(!isManual)}
                    className="text-[9px] font-black text-blue-600 uppercase hover:underline"
                  >
                    {isManual ? "List View" : "Manual Override"}
                  </button>
                </div>

                {isManual ? (
                  <input 
                    type="text"
                    placeholder="e.g. Metaverse & Gaming"
                    value={article.category || ""}
                    onChange={(e) => setArticle({ ...article, category: e.target.value })}
                    className="w-full p-4 bg-white border-2 border-blue-600 font-bold text-sm outline-none"
                  />
                ) : (
                  <select 
                    value={article.category || ""}
                    onChange={(e) => {
                      const selectedSilo = availableSilos.find(s => s.name === e.target.value);
                      setArticle({ 
                        ...article, 
                        category: e.target.value,
                        categorySlug: selectedSilo ? selectedSilo.slug : article.categorySlug 
                      });
                    }}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-slate-900"
                  >
                    <option value="" disabled>Select a Silo</option>
                    {availableSilos.map((silo) => (
                      <option key={silo._id} value={silo.name}>{silo.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Article Slug</label>
                <input 
                  type="text" 
                  value={article.slug || ""} 
                  onChange={e => setArticle({...article, slug: e.target.value})}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-200 text-[11px] font-mono focus:border-slate-900 outline-none"
                />
              </div>
            </div>

            {/* NEW: SEO Keywords field - Helps the $regex search find it */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SEO Meta Keywords (Comma Separated)</label>
              <input 
                type="text" 
                value={article.seoKeywords ? article.seoKeywords.join(', ') : ""} 
               onChange={e => {
                  const val = e.target.value;
                  setArticle({
                    ...article, 
                    seoKeywords: val ? val.split(',').map(s => s.trim()) : []
                  });
                }}
                className="w-full p-4 bg-slate-50 border-2 border-slate-200 text-[11px] font-mono focus:border-slate-900 outline-none"
                placeholder="nvidia, ai chips, blackwell, tech news"
              />
            </div>
          </section>
          
          {/* MEDIA SECTION */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2">
               <ImageIcon size={14} className="text-slate-900" />
               <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Asset Imagery</h4>
            </div>
            <div className="border-4 border-slate-900 bg-slate-100 aspect-video overflow-hidden">
              <img 
                src={article.bannerImage || "https://placehold.co/600x400?text=NO_IMAGE"} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>
            <input 
              type="text" 
              placeholder="Image URL"
              value={article.bannerImage || ""} 
              onChange={e => setArticle({...article, bannerImage: e.target.value})}
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 text-[11px] font-mono focus:border-slate-900 outline-none"
            />
          </section>

          {/* SYSTEM SETTINGS */}
          <section className="space-y-6 bg-slate-900 p-6">
            <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
               <Settings size={14} className="text-white" />
               <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Visibility Controls</h4>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="checkbox" 
                id="isPurgedComp"
                checked={article.isPurged || false} 
                onChange={e => setArticle({...article, isPurged: e.target.checked})}
                className="w-6 h-6 border-2 border-white rounded-none accent-blue-600 cursor-pointer"
              />
              <label htmlFor="isPurgedComp" className="text-xs font-black text-white uppercase tracking-widest cursor-pointer">
                Archive / Purge from Live Feed
              </label>
            </div>
          </section>
        </form>

        {/* Action Footer */}
        <div className="p-8 border-t-4 border-slate-900 flex gap-4 bg-white mt-auto">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-4 bg-white border-2 border-slate-200 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-blue-600 shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] active:translate-y-1 active:shadow-none transition-all"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {isSubmitting ? "Syncing..." : "Update Asset"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditArticleDrawer;