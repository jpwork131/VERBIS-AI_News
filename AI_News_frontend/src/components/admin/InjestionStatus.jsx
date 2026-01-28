import React from "react";
import { BarChart3 } from "lucide-react";

export default function IngestionStatus({ rules }) {
  return (
    <div className="bg-white border-2 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,0.1)] p-8 h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 border-b-2 border-slate-100 pb-4">
        <div className="p-2 bg-slate-900 text-white">
          <BarChart3 size={18} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
            Daily Feed Progress
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
            Content limits by category
          </p>
        </div>
      </div>

      {/* Progress List */}
      <div className="space-y-8">
        {rules.map((rule, i) => {
          const isWarning = rule.percentage > 85;
          const isCritical = rule.percentage >= 100;

          return (
            <div key={i} className="group">
              <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                    Category
                  </span>
                  <span className="text-sm font-black text-slate-900 uppercase">
                    {rule.category}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-mono font-bold ${
                    isCritical ? 'text-red-600' : isWarning ? 'text-orange-500' : 'text-slate-900'
                  }`}>
                    {rule.current} / {rule.total}
                  </span>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                    Articles Synced
                  </p>
                </div>
              </div>

              {/* Brutalist Progress Bar */}
              <div className="w-full bg-slate-100 border border-slate-200 h-4 relative overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${
                    isCritical ? 'bg-red-600' : isWarning ? 'bg-orange-500' : 'bg-slate-900'
                  }`} 
                  style={{ width: `${Math.min(rule.percentage, 100)}%` }}
                >
                  {/* Subtle diagonal stripe overlay for the bar */}
                  <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,rgba(255,255,255,.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.2)_50%,rgba(255,255,255,.2)_75%,transparent_75%,transparent)] bg-size-[20px_20px]"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer Note */}
      <div className="mt-8 pt-4 border-t border-slate-100">
        <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed italic">
          * Limits reset automatically at 00:00 UTC. 
          Contact system admin to increase category volume.
        </p>
      </div>
    </div>
  );
};