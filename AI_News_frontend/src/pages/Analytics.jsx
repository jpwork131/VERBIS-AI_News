import React, { useState, useEffect } from "react";
import { Activity, ShieldCheck, Terminal, Layers } from "lucide-react";

import StatsGrid from "../components/admin/StatsGrid";
import IngestionStatus from "../components/admin/InjestionStatus";
import CategoryChart from "../components/admin/CategoryChart";
import { settingsApi } from "../api/settings";
import SettingsForm from "../components/admin/Settings";
import Sidebar from "../components/admin/AdminSidebar";
import ArticlesTab from "../components/admin/AdminArticles";
import InjectionSchedule from "../components/admin/InjectionSchedule";
import SystemSettings from "../components/admin/AdminSettings";
import CategoryManager from "../components/admin/CategoryManager";

const Analytics = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsRes, settingsRes] = await Promise.all([
        settingsApi.getAnalytics(),
        settingsApi.getSettings()
      ]);

      if (statsRes.success) {
        setData({
          ...statsRes.data,
          config: settingsRes.data || settingsRes 
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [activeTab]);

  const sidebarCounts = {
    ingestion: data?.ingestion?.activeRulesCount || data?.ingestion?.rules?.length || 0,
    content: data?.content?.today || 0 
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white font-mono text-[10px] uppercase tracking-[0.3em] text-blue-600">
      <Activity className="mr-3 h-4 w-4 animate-spin" />
      Syncing Intelligence...
    </div>
  );

  return (
    <div className="flex h-screen bg-white overflow-hidden text-slate-900 selection:bg-blue-100">
      {/* --- SIDEBAR --- */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} counts={sidebarCounts} />

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto border-l border-slate-100 relative">
        
        {/* Editorial Top Bar */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-900 bg-white px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-2 text-white">
              <Terminal size={18} />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-black lowercase tracking-tighter leading-none">
                {activeTab.replace("-", " ")}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">System Live • Terminal v2.0</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Last Sync</p>
              <p className="font-mono text-[10px] font-bold">{new Date().toLocaleTimeString()}</p>
            </div>
            <button 
              onClick={fetchStats}
              className="border border-slate-200 px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
            >
              Refresh Data
            </button>
          </div>
        </header>

        <div className="p-8">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && data && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
              
              {/* Section Tag */}
              <div className="flex items-center gap-2 mb-6">
                <Layers size={14} className="text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">System Vitality Metrics</span>
              </div>

              <StatsGrid data={data} />
              
              <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12">
                <div className="border-t-2 border-slate-900 pt-6">
                   <h3 className="mb-6 font-serif text-xl font-bold tracking-tight">Active Ingestion Streams</h3>
                   <IngestionStatus rules={data?.ingestion?.rules || []} />
                </div>
                <div className="border-t-2 border-slate-900 pt-6">
                   <h3 className="mb-6 font-serif text-xl font-bold tracking-tight">Content Weighting</h3>
                   <CategoryChart distribution={data?.content?.distribution || []} />
                </div>
              </div>
            </div>
          )}

          {/* CONTENT TAB */}
          {activeTab === "content" && (
            <div className="animate-in fade-in duration-500">
              <ArticlesTab key="content-manager"
              refreshParentStats={fetchStats}
              />
            </div>
          )}

          {/* CATEGORIES TAB */}
          {activeTab === "categories" && (
            <div className="animate-in fade-in duration-500">
              <CategoryManager key="categories-manager" />
            </div>
          )}

          {/* INGESTION TAB */}
          {activeTab === "ingestion" && (
            <div className="animate-in fade-in duration-500">
              <InjectionSchedule key="ingestion" />
            </div>
          )}

          {/* SETTINGS TABS */}
          {activeTab === "cron-settings" && (
            <div className="max-w-2xl border border-slate-100 p-8 shadow-sm">
              <SettingsForm 
                currentSettings={data?.config} 
                onUpdate={fetchStats}
              />
            </div>
          )}

          {activeTab === "system-settings" && (
            <SystemSettings />
          )}
        </div>
      </main>
    </div>
  );
};

export default Analytics;