import React, { useState, useEffect } from "react";
import { 
  Zap, Plus, Trash2, Clock, 
  Infinity, Loader2, X, 
  CheckCircle2, RefreshCw, Power,
  List, Activity,
  Globe
} from "lucide-react";
import { getCategories } from "../../api/articles";
import { 
  createSchedule, 
  deleteSchedule, 
  getActiveSchedules 
} from "../../api/schedule"; 

const InjectionSchedule = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await getActiveSchedules();
      setRules(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      console.error("Failed to sync rules", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRules(); }, []);

  const handleDeleteRule = async (id) => {
    if (!window.confirm("Terminate this automated pipeline?")) return;
    try {
      await deleteSchedule(id);
      setRules(prev => prev.filter(r => r._id !== id));
    } catch (err) { 
      alert("Termination failed"); 
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header - Editorial Style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-900 text-white">
              <Activity size={20} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
              Live Sources
            </h3>
          </div>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">
            Automated content synthesis and category sync logic.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-slate-900 text-white px-8 py-4 border-2 border-slate-900 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all active:translate-y-1"
        >
          <Plus size={18} /> New Pipeline
        </button>
      </div>

      {/* Grid of Active Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-900" /></div>
        ) : rules.length === 0 ? (
          <div className="col-span-full py-24 bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw size={40} className="mb-4 opacity-20" />
            <p className="font-black uppercase tracking-widest text-xs text-slate-400">System Idle</p>
            <p className="text-[10px] uppercase mt-2 font-bold tracking-tighter">No active pipelines detected.</p>
          </div>
        ) : rules.map((rule) => (
          <div key={rule._id} className="bg-white border-2 border-slate-900 p-6 flex flex-col group relative hover:shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] transition-all duration-300">
            <div className="flex justify-between items-start mb-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 italic">Active Feed</span>
                <h4 className="font-black text-slate-900 text-xl uppercase tracking-tighter">{rule.category}</h4>
              </div>
              <button 
                onClick={() => handleDeleteRule(rule._id)}
                className="p-2 border-2 border-transparent hover:border-red-600 hover:text-red-600 text-slate-300 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200 overflow-hidden">
              <div className="bg-white p-4">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Articles/Day</p>
                <p className="font-black text-slate-900 text-lg">{rule.articlesPerDay}</p>
              </div>
              <div className="bg-white p-4">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Status</p>
                <div className="flex items-center gap-2">
                   {rule.daysRemaining > 5000 ? (
                    <span className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1"><Infinity size={12}/> Infinite</span>
                  ) : (
                    <span className="text-[10px] font-black text-slate-900 uppercase">{rule.daysRemaining} Days</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-none animate-pulse" />
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Syncing</span>
               </div>
               <p className="text-[9px] text-slate-300 font-mono font-bold uppercase tracking-widest">Ref: {rule._id}</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <CreateScheduleModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onRefresh={fetchRules} 
        />
      )}
    </div>
  );
};

const CreateScheduleModal = ({ isOpen, onClose, onRefresh }) => {
  const [availableSilos, setAvailableSilos] = useState([]);
  const [isInfinite, setIsInfinite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    category: '', // Stores the Silo Slug
    articlesPerDay: 10,
    daysRemaining: 7
  });

  // Load Silos when opening
  useEffect(() => {
    if (isOpen) {
      const fetchSilos = async () => {
        try {
          const res = await getCategories();
          setAvailableSilos(res);
          // Set first silo as default automatically
          if (res.length > 0 && !formData.category) {
            setFormData(prev => ({ ...prev, category: res[0].slug }));
          }
        } catch (err) { 
          console.error("Failed to load categories"); 
        }
      };
      fetchSilos();
    }
  }, [isOpen]);

  const toggleInfinite = () => {
    const nextInfinite = !isInfinite;
    setIsInfinite(nextInfinite);
    setFormData(prev => ({ ...prev, daysRemaining: nextInfinite ? 9999 : 7 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createSchedule(formData);
      onRefresh(); 
      onClose();   
    } catch (err) {
      alert("Failed to start automation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white border-4 border-slate-900 w-full max-w-md shadow-[12px_12px_0px_0px_rgba(37,99,235,1)]">
        
        {/* Header */}
        <div className="p-6 border-b-4 border-slate-900 flex justify-between items-center bg-white">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Automation Settings</h3>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 border-2 border-transparent hover:border-slate-900 transition-all">
            <X size={20}/>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-8">
            
            {/* Silo Selection (List Only) */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Target Category</label>
              <div className="relative">
                <select 
                  required
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-slate-900 p-4 font-black text-xs uppercase tracking-widest text-slate-900 outline-none cursor-pointer appearance-none"
                >
                  <option value="" disabled>Select a category...</option>
                  {availableSilos.map(silo => (
                    <option key={silo._id} value={silo.slug}>
                      {silo.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-900">
                  <Globe size={16} />
                </div>
              </div>
            </div>

            {/* Articles Per Day */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block italic">Articles Per Day</label>
              <div className="bg-slate-50 p-6 border-2 border-slate-200">
                <input 
                  type="range" min="1" max="50"
                  value={formData.articlesPerDay}
                  onChange={e => setFormData({...formData, articlesPerDay: e.target.value})}
                  className="w-full h-3 bg-slate-200 rounded-none appearance-none accent-slate-900 mb-4 cursor-pointer"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400">MIN: 1</span>
                  <div className="bg-slate-900 text-white px-4 py-2 font-black text-xs shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]">
                    {formData.articlesPerDay} POSTS
                  </div>
                  <span className="text-[10px] font-black text-slate-400">MAX: 50</span>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Duration</label>
                <button 
                  type="button" 
                  onClick={toggleInfinite}
                  className={`flex items-center gap-2 text-[9px] font-black px-4 py-2 border-2 transition-all ${isInfinite ? 'bg-slate-900 border-slate-900 text-white shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]' : 'bg-white border-slate-200 text-slate-400'}`}
                >
                  <Infinity size={14} /> ALWAYS ON
                </button>
              </div>
              
              {!isInfinite ? (
                <div className="relative">
                  <input 
                    type="number"
                    value={formData.daysRemaining}
                    onChange={e => setFormData({...formData, daysRemaining: e.target.value})}
                    className="w-full bg-white border-2 border-slate-200 focus:border-slate-900 p-4 font-black text-xs outline-none"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase pointer-events-none">Days</span>
                </div>
              ) : (
                <div className="p-4 border-2 border-emerald-500 bg-emerald-50 flex gap-4 items-center">
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                  <p className="text-[10px] text-emerald-700 font-black uppercase leading-tight">
                    Running until manually stopped.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-8 pt-0">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white py-6 font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-blue-600 transition-all disabled:bg-slate-200 shadow-[6px_6px_0px_0px_rgba(30,41,59,0.2)]"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
              {isSubmitting ? "Starting..." : "Start Automation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InjectionSchedule;