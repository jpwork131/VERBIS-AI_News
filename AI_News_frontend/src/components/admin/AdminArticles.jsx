import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Filter, ArrowUpDown, Zap, Terminal, CheckCircle, AlertCircle } from "lucide-react";
import * as articleApi from "../../api/articles";
import EditArticleDrawer from "./EditArticleDrawer";
import CreateAIArticleModal from "./CreateAIArticleModal"; // Corrected typo
import ArticleTable from "./ArticleTable";

const ArticlesTab = ({ refreshParentStats }) => {
  // --- State ---
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sort, setSort] = useState("latest");
  const [availableCategories, setAvailableCategories] = useState([]);

  // Modals/Drawers
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // --- Actions ---

  const fetchDashboardData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      let res;
      if (searchQuery) {
        res = await articleApi.searchArticles(searchQuery, page, 10);
      } else if (selectedCategory && selectedCategory !== "all") {
        res = await articleApi.getArticlesByCategory(selectedCategory, page, 10);
      } else {
        res = await articleApi.getArticles(page, 10);
      }
      setArticles(res.articles || []);
      setTotalPages(res.totalPages || 1);
      setTotalArticles(res.totalArticles || 0);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    fetchDashboardData(currentPage);
  }, [currentPage, fetchDashboardData]);

  // Load Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await articleApi.getCategories();
        setAvailableCategories(res || []);
      } catch (err) { console.error("Silo sync failed", err); }
    };
    fetchCats();
  }, []);

  // 1. CREATE HANDLER
  const handleCreateAI = async (formData, callback) => {
    try {
      setLoading(true);
      const response = await articleApi.createArticleAI(formData);
      if (response) {
        await fetchDashboardData(1);
        if (refreshParentStats) await refreshParentStats();
        if (callback) callback(); 
        setIsAIModalOpen(false);
        showToast("AI Synthesis Complete: Asset Created");
      }
    } catch (err) {
      showToast("Synthesis Failed: Check Pipeline", "error");
    } finally {
      setLoading(false);
    }
  };

  // 2. UPDATE HANDLER
  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await articleApi.updateArticle(selectedArticle._id, selectedArticle);
      if (response) {
        await fetchDashboardData(currentPage);
        if (refreshParentStats) await refreshParentStats();
        setIsEditDrawerOpen(false);
        showToast("Database Synchronized: Asset Updated");
      }
    } catch (err) {
      showToast("Update Failed: Network Error", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("PERMANENT DESTRUCTION: Proceed?")) {
      try {
        await articleApi.deleteArticle(id);
        fetchDashboardData(currentPage);
        if (refreshParentStats) await refreshParentStats();
        showToast("Asset Purged from Repository", "success");
      } catch (err) {
        showToast("Purge Failed", "error");
      }
    }
  };

  return (
    <div className="relative space-y-0 animate-in fade-in duration-500">
      
      {/* Brutalist Toast Notification */}
      {toast.show && (
        <div className={`fixed top-10 right-10 z-200 flex items-center gap-3 p-4 border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-right-10 ${toast.type === 'success' ? 'bg-blue-600 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-black tracking-tighter italic lowercase text-slate-900">
            Article <span className="text-blue-600">Repository</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">
            Active Assets: {totalArticles.toString().padStart(4, '0')}
          </p>
        </div>
        <button 
          onClick={() => setIsAIModalOpen(true)}
          className="bg-slate-900 text-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
        >
          <Zap size={14} fill="currentColor" /> Initiate Synthesis
        </button>
      </div>

      {/* COMMAND BAR */}
      <div className="border-2 border-slate-900 flex flex-wrap items-center bg-white mb-6">
        <div className="flex items-center flex-1 border-r-2 border-slate-900">
          <Search className="ml-4 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="SEARCH_BY_KEYWORD..."
            className="w-full px-4 py-4 text-[11px] font-mono font-bold outline-none uppercase placeholder:text-slate-300"
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>
        
        <div className="relative border-r-2 border-slate-900 min-w-50">
          <select 
            className="w-full bg-white px-4 py-4 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer"
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">Global Archive</option>
            {availableCategories.map((cat) => (
              <option key={cat._id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-900 pointer-events-none" size={14} />
        </div>

        <button 
          onClick={() => setSort(sort === "latest" ? "oldest" : "latest")}
          className="px-6 py-4 text-slate-900 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-colors"
        >
          <ArrowUpDown size={14} /> {sort}
        </button>
      </div>

      {/* TABLE */}
      <div className="border-2 border-slate-900 bg-white overflow-hidden">
        <ArticleTable 
          articles={articles}
          loading={loading}
          onEdit={(article) => {
              setSelectedArticle(article);
              setIsEditDrawerOpen(true);
          }}
          onDelete={handleDelete}
        />
        
        {/* PAGINATION */}
        <div className="p-4 bg-slate-50 border-t-2 border-slate-900 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-slate-400" />
            <span className="font-mono text-[10px] font-bold uppercase text-slate-500">
              Pointer: {currentPage} / {totalPages}
            </span>
          </div>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)} 
              className="px-4 py-2 border-2 border-slate-900 text-[10px] font-black uppercase hover:bg-slate-900 hover:text-white disabled:opacity-20 transition-all"
            >
              Back
            </button>
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(p => p + 1)} 
              className="px-4 py-2 border-2 border-slate-900 text-[10px] font-black uppercase hover:bg-slate-900 hover:text-white disabled:opacity-20 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      <CreateAIArticleModal 
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onCreate={handleCreateAI}
        loading={loading}
      />
      
      {/* EDIT DRAWER */}
      {isEditDrawerOpen && selectedArticle && (
      <EditArticleDrawer 
        isOpen={isEditDrawerOpen}
        article={selectedArticle}
        setArticle={setSelectedArticle}
        onClose={() => {
          setIsEditDrawerOpen(false);
          setSelectedArticle(null);
        }}
        onUpdate={handleUpdate}
        isSubmitting={isSubmitting}
      />
      )}
    </div>
  );
};

export default ArticlesTab;