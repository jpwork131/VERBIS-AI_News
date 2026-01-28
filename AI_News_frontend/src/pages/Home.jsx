import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Newspaper, TrendingUp } from "lucide-react";

import ArticleCard from "../components/cards/ArticleCard";
import CategoryFilter from "../components/ui/CategoryFilter";
import QuickGlanceCard from "../components/cards/QuickGlanceCard";
import Pagination from "../components/ui/Pagination";

import { getArticles, getArticlesByCategory, searchArticles } from "../api/articles";
import { useHomeState } from "../context/HomeStateContext";
import { getQuickGlanceData } from "../utils/quickGlance";
import { getUserInteractions } from "../api/auth";

export default function Home() {
  const navigate = useNavigate();
  const {
    articles, setArticles,
    page, setPage,
    totalPages, setTotalPages,
    activeCategory, setActiveCategory,
    isSearchMode, setIsSearchMode,
    searchQuery, 
  } = useHomeState();

  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const loadContent = useCallback(async () => {
  setLoading(true);
  try {
    const articlePromise = isSearchMode && searchQuery.trim() 
      ? searchArticles(searchQuery.trim(), page, 9)
      : (activeCategory && activeCategory !== "All")
        ? getArticlesByCategory(activeCategory, page, 9)
        : getArticles(page, 9);

    const [artRes, interactionData] = await Promise.all([
      articlePromise,
      getUserInteractions().catch(() => ({ likedArticleIds: [], savedArticleIds: [] }))
    ]);

    if (artRes && artRes.articles) {

      const hydrated = artRes.articles.map(art => {
        const artIdStr = art._id.toString();
        
        // Use .some() to be safe with array of objects/strings
        const isLiked = interactionData.likedArticleIds.some(
          id => id.toString() === artIdStr
        );
        const isSaved = interactionData.savedArticleIds.some(
          id => id.toString() === artIdStr
        );

        return {
          ...art,
          isLiked,
          isSaved
        };
      });
      setArticles(hydrated);
      setTotalPages(artRes.totalPages || 1);
    }
  } catch (err) {
    console.error("Hydration Error:", err);
  } finally {
    setLoading(false);
  }
}, [activeCategory, page, isSearchMode, searchQuery, setArticles, setTotalPages]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleCategoryChange = (categorySlug) => {
    setActiveCategory(categorySlug);
    setPage(1);
    setIsSearchMode(false);
    setIsSidebarOpen(false);
  };

  const handleUpdateArticle = (updatedArticle) => {
    setArticles(prevArticles => 
      prevArticles.map(art => 
        art._id === updatedArticle._id ? updatedArticle : art
      )
    );
  };


  const displayTitle = activeCategory === "All" || !activeCategory 
    ? "front page" 
    : activeCategory.replace(/-/g, ' ');

  const featured = articles[0];
  const rest = articles.slice(1);
  const quickGlance = getQuickGlanceData(articles, activeCategory);

  const isFirstPage = page === 1 && !loading;
  const showFeatured = isFirstPage && !isSearchMode && featured;

    const displayArticles = isSearchMode ? articles : rest;

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-100 bg-slate-50/50 py-3">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600">
            <TrendingUp size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Global AI Pulse</span>
          </div>
          <div className="hidden md:block text-[10px] font-medium text-slate-400 uppercase tracking-widest">
            Edition 2026 • Real-time Intelligence
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12 py-12">
        <aside>
          <div className="sticky top-28 space-y-10">
            <div>
              <h2 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">
                <Newspaper size={14} className="text-blue-600" />
                Sections
              </h2>
              <CategoryFilter activeCategory={activeCategory} onChange={handleCategoryChange} />
            </div>

            {quickGlance && !isSearchMode && (
              <div className="hidden lg:block pt-10 border-t border-slate-100">
                <h2 className="mb-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Briefing
                </h2>
                <div className="space-y-4">
                  {/* Updated: Using categorySlug to prevent 404 */}
                  <QuickGlanceCard 
                    label="Trending" 
                    title={quickGlance.trending?.title} 
                    onClick={() => navigate(`/${quickGlance.trending?.categorySlug || 'news'}/${quickGlance.trending?.slug}`)} 
                  />
                  <QuickGlanceCard 
                    label="AI Pick" 
                    title={quickGlance.aiPick?.title} 
                    onClick={() => navigate(`/${quickGlance.aiPick?.categorySlug || 'news'}/${quickGlance.aiPick?.slug}`)} 
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        <main>
          <div className="mb-10 flex items-end justify-between border-b-4 border-slate-900 pb-4">
            <h1 className="font-serif text-5xl font-black lowercase tracking-tighter text-slate-900">
              {displayTitle}
            </h1>
            <span className="text-xs font-bold text-slate-400 pb-1 italic">
              {articles.length} stories found
            </span>
          </div>

          {showFeatured && (
            <div 
              /* Updated: Using categorySlug for Hero Article navigation */
              onClick={() => navigate(`/${featured.categorySlug || 'news'}/${featured.slug}`)}
              className="group relative mb-16 cursor-pointer overflow-hidden"
            >
              <div className="aspect-21/9 overflow-hidden bg-slate-100">
                <img
                  src={featured.bannerImage}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
              <div className="mt-6 max-w-3xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2 block">
                  Featured Headline
                </span>
                <h2 className="font-serif text-4xl md:text-5xl font-bold leading-[1.1] text-slate-900 group-hover:underline decoration-blue-600 underline-offset-8">
                  {featured.title}
                </h2>
                <p className="mt-4 text-lg text-slate-600 line-clamp-2 font-medium">
                  {featured.summary}
                </p>
              </div>
            </div>
          )}

          {isSearchMode && (
            <div className="mb-10 p-6 bg-slate-50 border-l-4 border-blue-600">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Search Results for</p>
              <h2 className="text-3xl font-serif font-black">"{searchQuery}"</h2>
            </div>
          )}

          {/* MAIN GRID SECTION */}
          <div className="mt-8">
            {loading ? (
              // SKELETON LOADING
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="aspect-video bg-slate-100 animate-pulse" />
                    <div className="h-6 w-3/4 bg-slate-100 animate-pulse" />
                    <div className="h-4 w-full bg-slate-100 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : displayArticles.length > 0 ? (
              // ACTUAL CONTENT GRID
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16">
                {displayArticles.map((article) => (
                  <ArticleCard key={article._id} article={article} onUpdate={handleUpdateArticle}/>
                ))}
              </div>
            ) : (
              // EMPTY STATE
              <div className="col-span-full py-32 text-center border border-dashed border-slate-200">
                <p className="font-serif text-xl text-slate-400">
                  {isSearchMode 
                    ? `No matches found for "${searchQuery}"` 
                    : "No stories currently in this section."}
                </p>
              </div>
            )}
          </div>

          <div className="mt-20 pt-10 border-t border-slate-100">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}