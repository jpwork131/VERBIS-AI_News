import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../api/auth";
import { Bookmark, Calendar, Mail } from "lucide-react";
import ArticleCard from "../components/cards/ArticleCard";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await getMe();
        setUser(data);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleUpdateArticle = (updatedArticle) => {
    setUser((prev) => ({
      ...prev,
      savedArticles: prev.savedArticles.map((a) =>
        a._id === updatedArticle._id ? updatedArticle : a
      ),
    }));
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="animate-pulse font-serif text-lg text-muted-foreground">Syncing profile...</p>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 space-y-12">
        
        {/* Profile Card */}
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border shadow-sm">
          {/* Header Accent */}
          <div className="h-32 bg-linear-to-r from-primary/80 to-primary/40" />
          
          <div className="px-6 pb-8 sm:px-10">
            <div className="-mt-14 mb-6">
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-8 border-card bg-secondary text-3xl font-bold text-secondary-foreground shadow-lg">
                {user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="font-serif text-4xl font-bold tracking-tight">{user.name}</h1>
              <div className="flex flex-wrap gap-6 text-sm font-medium text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  {user.email}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Articles Section */}
        <div className="space-y-8">
          <div className="flex items-end justify-between border-b border-border pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                <Bookmark className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-serif text-3xl font-bold">Your Library</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  {user.savedArticles?.length || 0} Archived Stories
                </p>
              </div>
            </div>
          </div>

          {!user.savedArticles || user.savedArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card/30 px-6 py-24 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
                <Bookmark className="h-10 w-10 text-muted-foreground/20" />
              </div>
              <h3 className="font-serif text-2xl font-semibold">No saved stories yet</h3>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Explore the latest headlines and click the bookmark icon to save articles for later reading.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {user.savedArticles.map((article) => (
                <ArticleCard 
                  key={article._id} 
                  article={article} 
                  onUpdate={handleUpdateArticle}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}