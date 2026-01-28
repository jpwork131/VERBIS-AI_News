import React, { useState, useEffect } from "react";
import { Save, RefreshCw, AlertCircle, ShieldAlert, Terminal } from "lucide-react";
import { settingsApi } from "../../api/settings"; 

const SettingsForm = ({ currentSettings, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [interval, setIntervalValue] = useState(30);
  const [expiry, setExpiry] = useState(7);

  useEffect(() => {
    if (currentSettings) {
      if (currentSettings.cronSchedule) {
        const intervalPart = currentSettings.cronSchedule.split('/')[1];
        const minutes = intervalPart ? parseInt(intervalPart.split(' ')[0]) : 30;
        setIntervalValue(minutes);
      }
      if (currentSettings.articleExpiryDays) {
        setExpiry(currentSettings.articleExpiryDays);
      }
    }
  }, [currentSettings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await settingsApi.cronShedule({
        intervalMinutes: Number(interval),
        articleExpiryDays: Number(expiry)
      });

      if (res.success) {
        setMessage({ 
          type: "success", 
          text: "SYSTEM REBOOTED: INGESTION PIPELINE RESTARTED ON NEW PARAMETERS." 
        });
        if (onUpdate) onUpdate(); 
      }
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "CRITICAL FAILURE: SCHEDULER RESTART ABORTED." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white border-2 border-slate-900 overflow-hidden shadow-[8px_8px_0px_0px_rgba(15,23,42,0.1)]">
      {/* Awareness Banner - Reskinned to Industrial Alert */}
      <div className="bg-slate-900 text-white p-4 flex gap-4">
        <ShieldAlert className="text-blue-400 shrink-0" size={20} />
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
            System Protocol 04: Scheduled Task Override
          </p>
          <p className="text-[9px] text-slate-400 font-mono mt-1 uppercase tracking-tighter">
            Saving changes will kill all active ingestion threads and force a hard restart of the 
            engine core.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-10">
        {/* Interval Slider */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <div>
              <label className="block text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-1">
                Ingestion Frequency
              </label>
              <div className="flex items-center gap-2">
                <Terminal size={12} className="text-slate-400" />
                <p className="text-[10px] text-slate-400 font-mono">
                  ACTIVE_CRON: {currentSettings?.cronSchedule || "OFFLINE"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-mono font-black text-slate-900">
                {interval.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">min</span>
            </div>
          </div>
          
          <input
            type="range"
            min="15"
            max="1440"
            step="15"
            value={interval}
            onChange={(e) => setIntervalValue(e.target.value)}
            className="w-full h-1.5 bg-slate-100 appearance-none cursor-pointer accent-slate-900 border border-slate-200"
          />
          <div className="flex justify-between mt-2 text-[8px] font-black text-slate-300 uppercase tracking-widest">
            <span>15m_min</span>
            <span>24h_max</span>
          </div>
        </section>

        {/* Expiry Input */}
        <section>
          <label className="block text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-3">
            Archive Retention Threshold (Days)
          </label>
          <div className="relative group">
            <input
              type="number"
              min="1"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 focus:border-slate-900 outline-none font-mono font-bold text-slate-900 transition-colors"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase pointer-events-none">
              Days_Limit
            </div>
          </div>
        </section>

        {/* Feedback Messages */}
        {message.text && (
          <div className={`p-4 border-2 flex items-start gap-3 ${
            message.type === "success" 
              ? "bg-white border-blue-600 text-blue-600" 
              : "bg-white border-red-600 text-red-600"
          }`}>
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{message.text}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-5 uppercase tracking-[0.3em] text-[11px] transition-all disabled:opacity-30"
        >
          <div className="flex items-center justify-center gap-3">
            {loading ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
            {loading ? "Re-Initializing Core..." : "Commit System Changes"}
          </div>
        </button>
      </form>
    </div>
  );
};

export default SettingsForm;