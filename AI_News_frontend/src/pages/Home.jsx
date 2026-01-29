import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Newspaper, Search, Globe, ChevronLeft, ChevronRight, Zap, Sparkles } from "lucide-react";

import ArticleCard from "../components/cards/ArticleCard";
import CategoryFilter from "../components/ui/CategoryFilter";
import QuickGlanceCard from "../components/cards/QuickGlanceCard";
import Pagination from "../components/ui/Pagination";

import { getArticles, getArticlesByCategory, searchArticles } from "../api/articles";
import { useHomeState } from "../context/HomeStateContext";
import { getQuickGlanceData } from "../utils/quickGlance";
import { getUserInteractions } from "../api/auth";
import SearchInput from "../components/ui/SearchInput";

export default function Home() {
  const navigate = useNavigate();
  const {
    articles, setArticles, // Global "All" articles
    page, setPage,
    totalPages, setTotalPages,
    activeCategory, setActiveCategory,
    isSearchMode, setIsSearchMode,
    searchQuery,
  } = useHomeState();

  // New state specifically for the filtered "Journal" section
  const [journalArticles, setJournalArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeHero, setActiveHero] = useState(0);
  const [siloIndex, setSiloIndex] = useState(0);

  // 1. Initial Load: Get the global content for Hero/Silo (Always "All" content)
  useEffect(() => {
    const fetchGlobal = async () => {
      const res = await getArticles(1, 15);
      if (res?.articles) setArticles(res.articles);
    };
    if (articles.length === 0) fetchGlobal();
  }, []);

  // 2. Journal-Specific Load: This handles Search and Categories
  const loadJournal = useCallback(async () => {
    setLoading(true);
    try {
      const fetchApi = isSearchMode && searchQuery.trim()
        ? searchArticles(searchQuery.trim(), page, 8)
        : (activeCategory && activeCategory !== "All")
          ? getArticlesByCategory(activeCategory, page, 8)
          : getArticles(page, 8);

      // 1. Always fetch the articles (Public)
      const res = await fetchApi;

      // 2. Only fetch interactions if a token exists (Private)
      let interactions = { likedArticleIds: [], savedArticleIds: [] };
      const token = localStorage.getItem("token"); // Or however you store your auth

      if (token) {
        try {
          interactions = await getUserInteractions();
        } catch (err) {
          console.warn("Guest mode: Could not fetch interactions.");
        }
      }

      if (res?.articles) {
        const hydrated = res.articles.map(art => ({
          ...art,
          isLiked: interactions.likedArticleIds.some(id => id.toString() === art._id.toString()),
          isSaved: interactions.savedArticleIds.some(id => id.toString() === art._id.toString())
        }));
        setJournalArticles(hydrated);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error("Journal Load Error:", err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, page, isSearchMode, searchQuery, setTotalPages]);

  useEffect(() => { loadJournal(); }, [loadJournal]);

  // --- Fixed Data Slices (Always from Global 'articles') ---
  const heroItems = articles.slice(0, 3);
  const flashItems = articles.slice(3, 7);
  const siloItems = articles.slice(7, 15);
  const quickGlance = getQuickGlanceData(articles, activeCategory);
  
  const itemsPerPage = 3;
  const maxSilo = Math.max(0, siloItems.length - itemsPerPage);

  // --- Auto-Rotation Effects ---
  useEffect(() => {
    if (heroItems.length < 2) return;
    const t = setInterval(() => setActiveHero(p => (p + 1) % heroItems.length), 6000);
    return () => clearInterval(t);
  }, [heroItems.length]);

  useEffect(() => {
    if (siloItems.length <= itemsPerPage) return;
    const t = setInterval(() => setSiloIndex(p => (p >= maxSilo ? 0 : p + 1)), 8000);
    return () => clearInterval(t);
  }, [maxSilo, siloItems.length]);

  const handleCategoryChange = (slug) => {
    setActiveCategory(slug);
    setPage(1);
    setIsSearchMode(false);
  };

  const handleUpdateArticle = (updated) => {
    setArticles(prev => prev.map(a => a._id === updated._id ? updated : a));
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100">
      {/* 1. TOP TICKER */}
      <nav className="border-b border-slate-100 bg-slate-50/50 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-blue-600">
            <TrendingUp size={18} strokeWidth={2.5} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Global AI News</span>
          </div>
          <div className="hidden md:block text-xs font-bold text-slate-400 uppercase tracking-widest">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </nav>

     {/* 2. HERO SECTION */}
<header className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
  
  {/* THE BIG STORY (Main Hero) */}
  <div className="lg:col-span-8 relative h-[650px] group bg-white">
    {/* Large Background Number for Style */}
    <div className="absolute -top-10 -left-6 select-none pointer-events-none opacity-[0.03] font-serif text-[20rem] font-black italic">
      {activeHero + 1}
    </div>

    <div className="relative h-full w-full overflow-hidden rounded-xl shadow-2xl">
      {heroItems.map((art, i) => (
        <div
          key={art._id}
          onClick={() => navigate(`/${art.categorySlug}/${art.slug}`)}
          className={`absolute inset-0 transition-all duration-1000 cursor-pointer ${
            i === activeHero ? "opacity-100 scale-100 z-10" : "opacity-0 scale-110 z-0"
          }`}
        >
          {/* Image with a subtle zoom on hover */}
          <img 
            src={art.bannerImage} 
            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-1000" 
            alt="" 
          />
          
          {/* Soft Gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Text Content */}
          <div className="absolute bottom-0 left-0 p-10 md:p-16 w-full">
            <div className={`transition-all duration-700 delay-300 ${i === activeHero ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  {art.categorySlug?.replace(/-/g, ' ')}
                </span>
                <span className="text-white/60 text-xs font-medium italic">Current Highlight</span>
              </div>
              
              <h1 className="text-white font-serif text-5xl md:text-7xl font-bold leading-[1.05] tracking-tighter mb-8 max-w-3xl">
                {art.title}
              </h1>

              <div className="flex items-center gap-6">
                <button className="px-8 py-3 bg-blue-600 hover:bg-white hover:text-black text-white text-xs font-black uppercase tracking-widest transition-all rounded-sm">
                  Read Full Story
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Modern Slide Indicators */}
      <div className="absolute top-10 right-10 z-20 flex flex-col gap-4">
        {heroItems.map((_, i) => (
          <button 
            key={i} 
            onClick={(e) => { e.stopPropagation(); setActiveHero(i); }} 
            className="group flex items-center gap-4"
          >
            <div className={`h-px transition-all duration-500 ${i === activeHero ? "w-12 bg-white" : "w-4 bg-white/30 group-hover:w-8"}`} />
            <span className={`text-[10px] font-bold ${i === activeHero ? "text-white" : "text-white/30"}`}>0{i + 1}</span>
          </button>
        ))}
      </div>
    </div>
  </div>

  {/* THE SIDEBAR (Trending Stories) */}
<div className="lg:col-span-4 flex flex-col pt-4">
  {/* Header with an Offset Decorative Block */}
  <div className="relative mb-12">
    <h3 className="text-6xl md:text-8xl font-serif font-black tracking-tighter leading-[0.9] lowercase">
      Trending Now
    </h3>
    
  </div>
  
  <div className="flex flex-col gap-12">
    {flashItems.map((a, idx) => (
      <div 
        key={a._id} 
        onClick={() => navigate(`/${a.categorySlug}/${a.slug}`)}
        className="group cursor-pointer relative"
      >
        <div className="flex gap-6">
          {/* Vertical Metadata Bar */}
          <div className="flex flex-col items-center gap-4 py-1">
            <span className="font-serif text-xl font-black text-slate-200 group-hover:text-blue-600 transition-colors">
              0{idx + 1}
            </span>
            <div className="w-px flex-1 bg-slate-100 group-hover:bg-blue-100 transition-colors" />
          </div>

          {/* Content Area */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600/60">
                {a.categorySlug || "Insight"}
              </span>
              <span className="text-[9px] font-bold text-slate-300 uppercase">
                5 min read
              </span>
            </div>
            
            <h4 className="font-serif text-xl font-bold leading-[1.2] tracking-tight text-slate-900 group-hover:translate-x-1 transition-transform duration-300">
              {a.title}
            </h4>

            {/* Creative Hover Detail: A "Peek" at the image */}
            <div className="relative h-0 group-hover:h-20 opacity-0 group-hover:opacity-100 transition-all duration-500 overflow-hidden rounded-sm">
              <img 
                src={a.bannerImage} 
                className="w-full h-full object-cover brightness-75" 
                alt="" 
              />
              <div className="absolute inset-0 bg-blue-600/20" />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <div className="w-0 group-hover:w-8 h-px bg-slate-900 transition-all duration-500" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                View Story
              </span>
            </div>
          </div>
        </div>
        
        {/* Subtle Background Glow on Hover */}
        <div className="absolute -inset-x-4 -inset-y-2 bg-slate-50/50 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all -z-10 rounded-xl" />
      </div>
    ))}
  </div>
</div>
</header>

      {/* 3. TRENDING & AI PICKS STRIP */}
{!isSearchMode && (
  <section className="bg-white border-y border-slate-200 mb-24 overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
      
      {/* COLUMN 1: TRENDING */}
      <div 
        onClick={() => navigate(`/${quickGlance?.trending?.categorySlug}/${quickGlance?.trending?.slug}`)}
        className="group relative py-14 px-0 md:px-12 cursor-pointer hover:bg-slate-50 transition-all duration-500"
      >
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Trending</span>
            </div>
            <h4 className="font-serif text-2xl font-black leading-tight tracking-tighter group-hover:text-blue-600 transition-colors line-clamp-2">
              {quickGlance?.trending?.title || "Loading trend..."}
            </h4>
          </div>
          <p className="mt-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
            Read Discussion →
          </p>
        </div>
      </div>

      {/* COLUMN 2: PRIMARY AI PICK */}
      <div 
        onClick={() => navigate(`/${quickGlance?.aiPick?.categorySlug}/${quickGlance?.aiPick?.slug}`)}
        className="group relative py-14 px-0 md:px-12 cursor-pointer bg-slate-50/50 md:bg-transparent hover:bg-slate-50 transition-all duration-500"
      >
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-400">
              <Zap size={14} className="fill-current text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI Selection</span>
            </div>
            <h4 className="font-serif text-2xl font-black leading-tight tracking-tighter group-hover:text-blue-600 transition-colors line-clamp-2">
              {quickGlance?.aiPick?.title || "Curating pick..."}
            </h4>
          </div>
          <p className="mt-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
            Full Analysis →
          </p>
        </div>
      </div>

      {/* COLUMN 3: SECONDARY AI PICK (Formerly Status) */}
      <div 
        onClick={() => navigate(`/${quickGlance?.secondaryAiPick?.categorySlug}/${quickGlance?.secondaryAiPick?.slug}`)}
        className="group relative py-14 px-0 md:px-12 cursor-pointer hover:bg-slate-50 transition-all duration-500"
      >
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-400">
              <Sparkles size={14} className="text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Editor's Choice</span>
            </div>
            <h4 className="font-serif text-2xl font-black leading-tight tracking-tighter group-hover:text-blue-600 transition-colors line-clamp-2">
              {quickGlance?.secondaryAiPick?.title || "Refining choice..."}
            </h4>
          </div>
          <p className="mt-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
            View Entry →
          </p>
        </div>
      </div>

    </div>
  </section>
)}

      {/* 4. SILO SLIDER (The "Shifting" Grid) */}
      <section className="max-w-7xl mx-auto px-6 mb-20 overflow-hidden">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-6xl md:text-8xl font-serif font-black tracking-tighter leading-[0.9] lowercase">News By Category</h2>
          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              <button onClick={() => setSiloIndex(p => Math.max(0, p - 1))} className="p-3 border border-slate-200 hover:bg-slate-900 hover:text-white transition-all"><ChevronLeft size={20} /></button>
              <button onClick={() => setSiloIndex(p => (p >= maxSilo ? 0 : p + 1))} className="p-3 border border-slate-200 hover:bg-slate-900 hover:text-white transition-all"><ChevronRight size={20} /></button>
            </div>
            <div className="h-1 w-32 bg-slate-100 relative">
              <div className="absolute h-full bg-blue-600 transition-all duration-700" style={{ width: `${((siloIndex + 1) / (maxSilo + 1)) * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="flex transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]" style={{ transform: `translateX(-${siloIndex * (100 / itemsPerPage)}%)` }}>
          {siloItems.map(a => (
            <div key={a._id} className="w-full md:w-1/3 shrink-0 px-4">
              <ArticleCard article={a} variant="grid" onUpdate={handleUpdateArticle} />
            </div>
          ))}
        </div>
      </section>

      {/* 5. MAIN CONTENT AREA */}
<div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-16 pb-40">
  <main className="lg:col-span-8">
    
    {/* 1. SECTION HEADER: Larger and More Defined */}
    <div className="relative mb-28 border-l-8 border-slate-900 pl-8 py-2">
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-600">
          {isSearchMode ? "Database Search" : "Primary Archive"}
        </span>
        <h2 className="text-6xl md:text-8xl font-serif font-black tracking-tighter leading-[0.9] lowercase">
          {isSearchMode ? searchQuery : activeCategory === "All" ? "journal feed" : activeCategory}
        </h2>
        <div className="mt-6 flex items-center gap-4">
          <span className="h-px w-20 bg-slate-200" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {journalArticles.length} Entries Logged
          </p>
        </div>
      </div>
    </div>
    
    {/* 2. THE FEED: Increased Scale and Spacing */}
    <div className="relative">
      {/* Thicker Vertical Spine */}
      <div className="absolute left-0 md:left-4 top-0 bottom-0 w-[8px] bg-slate-100" />

      <div className="space-y-32 md:space-y-48">
        {loading ? (
          <div className="space-y-20 pl-8 md:pl-28">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-slate-50 animate-pulse rounded-sm border border-slate-100" />
            ))}
          </div>
        ) : journalArticles.length > 0 ? (
          journalArticles.map((a, idx) => (
            <div key={a._id} className="relative pl-8 md:pl-28 group">
              
              {/* Bold Index Marker: Larger and Lower */}
              <div className="absolute left-[-6px] md:left-[9px] top-4 flex flex-col items-center">
                <div className="w-4 h-4 bg-white border-4 border-slate-100 group-hover:border-blue-600 transition-all duration-500 z-10" />
                <span className="mt-6 font-serif italic text-2xl font-black text-slate-100 group-hover:text-blue-600 group-hover:translate-x-2 transition-all duration-500">
                   {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                </span>
              </div>

              {/* Card Container: Scale and spacing */}
              <div className="transition-all duration-700 group-hover:scale-[1.02] origin-left">
                <ArticleCard 
                  article={a} 
                  variant="horizontal" 
                  onUpdate={handleUpdateArticle} 
                />
              </div>

              
            </div>
          ))
        ) : (
          /* Professional Empty State */
          <div className="py-52 text-center bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
            <h3 className="font-serif text-3xl font-black italic text-slate-300">No results found.</h3>
          </div>
        )}
      </div>
    </div>
          <div className="mt-16 pt-10 border-t border-slate-100">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </main>

        <aside className="lg:col-span-4 space-y-12">
          <div className="sticky top-28 space-y-10">
            {/* SEARCH BOX - Linked to Global State */}
            <div className="bg-slate-900 p-8 text-white">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-blue-400">Deep Search</h3>
              <div className="relative border-b border-white/20">
                {/* Re-using your logic-heavy SearchInput component here ensures consistency */}
                <SearchInput className="bg-transparent border-none text-white placeholder:text-slate-500 w-full pb-2 text-sm" />
              </div>
            </div>

            {/* Categories */}
            <section className="bg-white">
              <h3 className="text-xl font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Newspaper size={16} className="text-blue-600" /> Categories
              </h3>
              <CategoryFilter activeCategory={activeCategory} onChange={handleCategoryChange} />
            </section>

            {/* Newsletter */}
            <div className="bg-blue-600 p-8 text-white relative group overflow-hidden">
              <Globe className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 group-hover:rotate-12 transition-transform duration-1000" />
              <div className="relative z-10">
                <h4 className="text-2xl font-serif font-black italic mb-2">Network Updates</h4>
                <p className="text-blue-100 text-sm mb-6 leading-relaxed">Join 50,000+ analysts receiving daily intelligence briefs.</p>
                <button className="w-full bg-white text-blue-600 py-4 text-xs font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">Connect Now</button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}