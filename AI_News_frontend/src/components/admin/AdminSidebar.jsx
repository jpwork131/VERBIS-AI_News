import React from "react";
import { 
  LayoutDashboard, 
  Settings, 
  Newspaper, 
  Users, 
  LogOut, 
  Zap,
  Terminal,
  Tag
} from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab, counts = {} }) => {
  const menuItems = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
    { id: "content", label: "Articles", icon: <Newspaper size={18} /> },
    { 
      id: "categories", 
      label: "Categories", 
      icon: <Tag size={18} />, 
      badge: counts.categories 
    },
    { id: "users", label: "Users", icon: <Users size={18} /> },
    { 
      id: "ingestion", 
      label: "Injection", 
      icon: <Zap size={18} />, 
      badge: counts.ingestion 
    },
    { id: "cron-settings", label: "Cronjobs", icon: <Terminal size={18} /> },
    { id: "system-settings", label: "System", icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-white flex flex-col shrink-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-blue-600 p-1 text-white">
            <Terminal size={16} strokeWidth={3} />
          </div>
          <h1 className="font-serif text-xl font-black tracking-tighter italic lowercase">
            verbis<span className="text-blue-500 not-italic">.admin</span>
          </h1>
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-9">
          Terminal v2.0
        </p>
      </div>
      
      {/* Menu Label */}
      <div className="px-8 mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
          Navigation
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full flex items-center justify-between px-4 py-3 
                transition-all duration-200 group relative
                ${isActive 
                  ? "bg-slate-900 text-white border-l-2 border-blue-600" 
                  : "text-slate-500 hover:text-slate-200 hover:bg-slate-900/50 border-l-2 border-transparent"
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <span className={`${isActive ? "text-blue-500" : "text-slate-600 group-hover:text-slate-400"}`}>
                  {item.icon}
                </span>
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {item.label}
                </span>
              </div>

              {/* The Badge - Mono Style */}
              {item.badge > 0 && (
                <span className={`
                  font-mono text-[10px] px-1.5 py-0.5 border
                  ${isActive 
                    ? "bg-blue-600 border-blue-500 text-white" 
                    : "bg-slate-800 border-slate-700 text-slate-400"
                  }
                `}>
                  {item.badge.toString().padStart(2, '0')}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-6 mt-auto">
        <div className="bg-slate-900/50 p-4 border border-slate-800">
          <button className="flex items-center justify-between w-full group">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-red-400 transition-colors">
              Terminate Session
            </span>
            <LogOut size={16} className="text-slate-600 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;