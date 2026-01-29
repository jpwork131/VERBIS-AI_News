import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Globe, Calendar, Sparkles, ChevronLeft, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown"; 
import { getArticleBySlug, getArticlesByCategory } from "../api/articles";

import ArticleCard from "../components/cards/ArticleCard";

import remarkSlug from 'remark-slug';
import GithubSlugger from 'github-slugger';
import { getUserInteractions } from "../api/auth";
import ArticleActions from "../components/ui/ArticleActions";
import CommentBox from "../components/ui/CommentBox";

export default function ArticleDetail() {
  const { category, slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);

// Reading Progress Logic
  useEffect(() => {
    const updateProgress = () => {
      const currentProgress = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight) {
        setScrollProgress(Number((currentProgress / scrollHeight).toFixed(2)) * 100);
      }
    };
    window.addEventListener("scroll", updateProgress);
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  // LOGIC: Handle state updates for both main and related articles
  const handleUpdateArticle = (updated) => {
  // If updated doesn't have an _id, we can't do anything
  if (!updated || !updated._id) return;

  const updatedId = updated._id.toString();
  
  if (article?._id?.toString() === updatedId) {
    setArticle(prev => ({ ...prev, ...updated }));
  }
  
  setRelatedArticles(prev => 
    prev.map(art => art._id.toString() === updatedId ? { ...art, ...updated } : art)
  );
};

 useEffect(() => {
  const fetchFullData = async () => {
    setLoading(true);
    try {
      // 1. CHECK FOR TOKEN (Avoid the 401 redirect trap)
      const token = localStorage.getItem("token");
      
      // 2. FETCH MAIN ARTICLE (Public)
      const res = await getArticleBySlug(category, slug);
      const mainArticle = res.data;

      if (!mainArticle) throw new Error("Article not found");

      // 3. FETCH INTERACTIONS ONLY IF LOGGED IN
      let interactions = { likedArticleIds: [], savedArticleIds: [] };
      if (token) {
        try {
          interactions = await getUserInteractions();
        } catch (e) {
          console.warn("Guest mode active");
        }
      }

      // 4. FETCH RELATED ARTICLES (Public)
      if (mainArticle?.categorySlug) {
        const relatedRes = await getArticlesByCategory(mainArticle.categorySlug, 1, 6);
        const relatedData = relatedRes.articles || [];
        
        setRelatedArticles(
          relatedData
            .filter((a) => a.slug !== slug) // Don't show the current article
            .map(art => ({
              ...art,
              isLiked: interactions.likedArticleIds?.some(id => id.toString() === art._id.toString()),
              isSaved: interactions.savedArticleIds?.some(id => id.toString() === art._id.toString())
            }))
            .slice(0, 4)
        );
      }

      // 5. HYDRATE MAIN ARTICLE
      const hydratedMain = {
        ...mainArticle,
        isLiked: interactions.likedArticleIds?.some(id => id.toString() === mainArticle._id.toString()),
        isSaved: interactions.savedArticleIds?.some(id => id.toString() === mainArticle._id.toString())
      };

      setArticle(hydratedMain);
      if (hydratedMain?.title) document.title = `${hydratedMain.title} | VERBIS AI`;

    } catch (err) {
      console.error("Failed to load article data", err);
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll on change
    }
  };

  fetchFullData();
  return () => { document.title = "AI NEWS"; };
}, [category, slug]); // Component will re-run when these change

  const slugger = new GithubSlugger();
  let headings = [];
  
  if (article?.aiContent) {
    const content = article.aiContent.replace(/\\n/g, '\n');
    const lines = content.split('\n');
    headings = lines
      .filter(line => line.startsWith('## '))
      .map(line => {
        const text = line.replace('## ', '').trim();
        return { text, id: slugger.slug(text) };
      });
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center font-serif text-slate-400 animate-pulse italic">Reading story...</div>;
  if (!article) return <div className="flex min-h-screen items-center justify-center font-serif text-slate-900">Story not found.</div>;

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100">
      
      {/* 1. Article Progress/Top Utility */}
      <div className=" sticky top-20 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 py-3">
        <div className="mx-auto max-w-7xl px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
            <ChevronLeft size={14} /> Back to Feed
          </Link>
          <div className="flex gap-4 items-center">
            {/* Added: Detail Page Actions */}
            <ArticleActions article={article} onUpdate={handleUpdateArticle} />
            <button className="text-slate-400 hover:text-blue-600"><Share2 size={16}/></button>
          </div>
        </div>
        {/* CREATIVE: Floating Reading Progress Bar */}
      <div className="fixed top-20 left-0 w-full h-1 z-[60] pointer-events-none">
        <div 
          className="h-full bg-blue-600 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      </div>
      

      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[1fr_280px] gap-12 px-6">
        
        {/* CENTER – Main Article Content */}
        <main className="py-12 lg:border-r lg:border-slate-100 lg:pr-12">
          
          {/* Metadata Section */}
          <div className="mb-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="bg-blue-600 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                {article.silo?.name || article.category.replace(/-/g, ' ')}
              </span>
              <span className="text-slate-300">/</span>
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Globe className="h-3 w-3" /> {article.source?.name}
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-serif font-black leading-[1.1] tracking-tighter text-slate-900">
              {article.title}
            </h1>

            <div className="flex items-center gap-4 border-y border-slate-100 py-4">
              <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">AI</div>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-wide">Verbis AI NEWS</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Published {new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <figure className="mb-12">
            <img
              src={article.bannerImage}
              alt={article.title}
              className="w-full aspect-21/10 object-cover bg-slate-100"
            />
            {article.imageCaption && (
              <figcaption className="mt-3 text-xs italic text-slate-400 text-right">
                {article.imageCaption}
              </figcaption>
            )}
          </figure>

          {/* AI Summary Box */}
          {article.summary && (
            <div className="mb-12 border-l-4 border-blue-600 bg-slate-50 p-8">
              <div className="mb-4 flex items-center gap-2 text-blue-600">
                <Sparkles className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">The Insight Brief</span>
              </div>
              <p className="font-serif text-xl italic leading-relaxed text-slate-700">
                {article.summary}
              </p>
            </div>
          )}

          {/* THE BODY */}
          <article className="prose prose-slate prose-lg max-w-none prose-p:text-slate-800 prose-p:leading-[1.8] prose-p:font-sans prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-4 prose-strong:text-slate-900 prose-strong:font-black prose-blockquote:border-l-blue-600 prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:italic prose-li:text-slate-800 prose-h2:scroll-mt-40 prose-h3:scroll-mt-40">
            <ReactMarkdown remarkPlugins={[remarkSlug]}>
              {article.aiContent?.replace(/\\n/g, '\n')}
            </ReactMarkdown>
          </article>

          <div className="mt-16 border-t border-slate-900 pt-16">
            <div className="mb-8">
              <h3 className="text-2xl font-serif font-black italic tracking-tighter">
                Community Discussion
              </h3>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mt-1">
                Join the conversation below
              </p>
            </div>
            
            <CommentBox
              articleId={article._id}
              comments={article.comments || []}
              onNewComment={(updatedComments) => {
                handleUpdateArticle({
                  ...article,
                  comments: updatedComments,
                });
              }}
            />
          </div>

          {/* CREATIVE MINIMAL RECOMMENDED SECTION */}
          {relatedArticles.length > 0 && (
            <section className="mt-32 pt-20 border-t-2 border-slate-950">
              <div className="flex items-baseline justify-between mb-16">
                <h2 className="font-serif text-4xl font-black italic tracking-tighter lowercase">
                  Recommended Reads
                </h2>
                <div className="flex items-center gap-4">
                  <div className="h-px w-12 bg-blue-600" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">
                    Explore More
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20">
                {relatedArticles.slice(0, 4).map((item, index) => (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/${item.categorySlug}/${item.slug}`)}
                    className="group relative cursor-pointer"
                  >
                    {/* Background Index Number */}
                    <span className="absolute -top-10 -left-4 font-serif text-8xl font-black text-slate-50 transition-colors group-hover:text-blue-50/50 z-0">
                      0{index + 1}
                    </span>

                    <div className="relative z-10 flex flex-col gap-4">
                      {/* Minimal Image Reveal on Hover */}
                      <div className="relative h-2 w-full bg-slate-100 overflow-hidden transition-all duration-500 group-hover:h-32 rounded-sm">
                        <img 
                          src={item.bannerImage} 
                          className="w-full h-full object-cover  opacity-0 group-hover:opacity-100 transition-all duration-700 scale-110 group-hover:scale-100"
                          alt=""
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                            {item.category?.replace(/-/g, ' ')}
                          </span>
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                            {new Date(item.publishedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="text-2xl font-serif font-black leading-tight tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h3>

                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 font-medium">
                          {item.summary || "Deep dive into the latest neural architecture shifts and market intelligence."}
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-0.5 w-0 bg-blue-600 transition-all duration-500 group-hover:w-8" />
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500">
                            Read More
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* RIGHT – Navigation Sidebar */}
        <aside className="hidden lg:block py-12">
          <div className="sticky top-32">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <div className="h-px w-4 bg-slate-200" /> CONTENTS
            </h3>
            <nav className="flex flex-col gap-0 border-l border-slate-100">
              {headings.map((heading) => (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  className="group py-3 pl-4 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:border-l-2 hover:border-blue-600 -ml-[1.5px] transition-all"
                >
                  {heading.text}
                </a>
              ))}
            </nav>

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