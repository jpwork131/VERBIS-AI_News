import React, { useEffect, useState } from "react";
import { X, Zap, Loader2, Plus, List, Newspaper, Globe } from "lucide-react";
import { getCategories } from "../../api/articles";

const CreateAIArticleModal = ({ isOpen, onClose, onCreate, loading }) => {
  const initialForm = { 
    title: "", 
    content: "", 
    url: "", 
    sourceName: "", 
    sourceUrl: "", 
    category: "" 
  };

  const [formData, setFormData] = useState(initialForm);
  const [availableSilos, setAvailableSilos] = useState([]); 
  const [fetchingCats, setFetchingCats] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadSilos = async () => {
        setFetchingCats(true);
        try {
          const silos = await getCategories(); // Fetches [{name, slug}, ...]
          setAvailableSilos(silos);
          // Auto-select first silo if available
          if (silos.length > 0) setFormData(prev => ({ ...prev, category: silos[0].name }));
        } catch (err) {
          console.error("Failed to fetch silos:", err);
        } finally {
          setFetchingCats(false);
        }
      };
      loadSilos();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData, () => {
      setFormData(initialForm);
      setIsManual(false);
    }); 
  };

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      {/* Main Box */}
      <div className="bg-white border-4 border-slate-900 w-full max-w-2xl shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b-4 border-slate-900 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-slate-900 text-white">
              <Zap size={20} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 italic">Add New Article</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Database Entry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 border-2 border-transparent hover:border-slate-900 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Main Content */}
          <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest block italic border-b border-slate-100 pb-2">Primary Info</label>
              <input 
                required
                type="text" 
                placeholder="ARTICLE TITLE"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full p-4 bg-white border-2 border-slate-900 font-serif font-bold italic text-lg outline-none"
              />
              <textarea 
                required
                placeholder="PASTE CONTENT HERE..."
                rows="6"
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                className="w-full p-4 bg-white border-2 border-slate-200 focus:border-slate-900 text-sm font-medium outline-none"
              />
          </div>

          {/* Links and Silos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-900 uppercase italic">Source Link (URL)</label>
                <input 
                    required
                    type="url" 
                    placeholder="HTTPS://NEWS-SITE.COM/STORY"
                    value={formData.url}
                    onChange={e => setFormData({...formData, url: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 focus:border-slate-900 text-[11px] font-mono outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-900 uppercase italic">Category / Silo</label>
                 
                </div>

               
                  <div className="relative">
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      disabled={fetchingCats}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-200 font-bold text-slate-900 h-14.5 outline-none appearance-none cursor-pointer focus:border-slate-900"
                    >
                      <option value="">Choose Silo...</option>
                      {availableSilos.map((silo) => (
                        <option key={silo._id} value={silo.name}>{silo.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-900">
                      <Globe size={16} />
                    </div>
                  </div>
               
              </div>
          </div>

          {/* Publisher Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-900 uppercase italic">Publisher Name</label>
                <input 
                    type="text" 
                    placeholder="e.g. BBC NEWS"
                    value={formData.sourceName}
                    onChange={e => setFormData({...formData, sourceName: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 focus:border-slate-900 text-[10px] font-black uppercase outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-900 uppercase italic">Publisher URL</label>
                <input 
                    type="url" 
                    placeholder="HTTPS://BBC.COM"
                    value={formData.sourceUrl}
                    onChange={e => setFormData({...formData, sourceUrl: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 focus:border-slate-900 text-[11px] font-mono outline-none"
                />
              </div>
          </div>
        </form>

        {/* Bottom Buttons */}
        <div className="p-8 border-t-4 border-slate-900 flex gap-4 bg-white">
          <button 
            type="button"
            onClick={onClose}
            className="px-8 py-4 bg-white border-2 border-slate-200 font-black text-[10px] uppercase text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all disabled:bg-slate-200 shadow-[6px_6px_0px_0px_rgba(30,41,59,0.2)]"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} fill="currentColor" />}
            {loading ? "Working..." : "Create Article"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAIArticleModal;