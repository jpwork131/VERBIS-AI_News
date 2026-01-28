import { Link, useNavigate } from "react-router-dom";
import SearchInput from "./SearchInput";
import { logoutUser } from "../../api/auth";
import { LogIn, LogOut, Search, User, X } from "lucide-react";
import { useBranding } from "../../context/BrandingContext";
import { useState } from "react";

export default function Navbar() {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { branding } = useBranding();
  
  // Placeholder for user state - ensure this connects to your Auth context
  const user = JSON.parse(localStorage.getItem("user")); 
  const isLoggedIn = !!user;

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
      window.location.reload(); // Refresh to clear state
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
      {/* Optional: Top thin info bar */}
      <div className="hidden md:block bg-slate-50 border-b border-slate-100 py-1.5">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          <span className="text-blue-600">AI Insights & Analysis</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6 h-20 flex items-center justify-between gap-8">
        
        {/* 1. Brand Section (Masthead Style) */}
        {!isMobileSearchOpen && (
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            {branding.logo ? (
              <img 
                src={branding.logo} 
                alt="logo" 
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105" 
              />
            ) : (
              <div className="w-10 h-10 bg-black rounded-sm flex items-center justify-center text-white font-serif italic text-xl">V</div>
            )}
            <div className="flex flex-col">
              <span className="font-serif font-black text-2xl leading-none tracking-tighter text-slate-900">
                {branding.siteTitle?.split(' ')[0] || "VERBIS"}
                <span className="text-blue-600">.</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 leading-none mt-1">
                {branding.siteTitle?.split(' ')[1] || "AI NEWS"}
              </span>
            </div>
          </Link>
        )}

        {/* 2. Search Section (Clean Editorial Input) */}
        <div className={`flex-1 flex justify-center ${isMobileSearchOpen ? "block" : "hidden md:flex"}`}>
          <div className="w-full max-w-lg relative flex items-center">
            <SearchInput onResults={(results) => console.log(results)} />
            
            {isMobileSearchOpen && (
              <button 
                onClick={() => setIsMobileSearchOpen(false)}
                className="md:hidden ml-4 p-2 text-slate-900"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Actions Section */}
        {!isMobileSearchOpen && (
          <div className="flex items-center gap-4 shrink-0">
            
            {/* Mobile Search Toggle */}
            <button 
              onClick={() => setIsMobileSearchOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-black"
            >
              <Search className="h-6 w-6" />
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                >
                  <User className="h-4 w-4" />
                  <span>{user?.name?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="group relative px-6 py-2 overflow-hidden bg-black text-white text-xs font-black uppercase tracking-widest rounded-sm"
              >
                <span className="relative z-10">Sign In</span>
                <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}