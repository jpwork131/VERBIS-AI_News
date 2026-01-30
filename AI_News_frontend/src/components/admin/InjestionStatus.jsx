import React from 'react';
import { Zap, Activity, CheckCircle2, Cpu } from 'lucide-react';

export default function IngestionStatus({ rules }) {
  if (!rules || rules.length === 0) return null;

  return (
    <div className="p-8 bg-paper rounded-[2.5rem] border border-border shadow-sm transition-all duration-300 animate-in fade-in zoom-in-95">
      
      {/* Header: Refined & Modern */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-accent rounded-2xl text-white shadow-lg shadow-accent/20">
            <Zap size={22} />
          </div>
          <div>
            <h2 className="text-sm font-black text-ink uppercase tracking-[0.2em]">
              Active Ingestion Pipeline
            </h2>
          </div>
        </div>
      </div>

      {/* Grid: Tailux Soft Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {rules.map((rule, i) => {
          const pct = parseFloat(rule.percentage) || 0;
          const isComplete = pct >= 100;

          return (
            <div 
              key={i} 
              className="p-6 bg-surface border border-border rounded-4xl hover:shadow-xl hover:shadow-accent/5 transition-all duration-500 group relative overflow-hidden"
            >
              {/* Subtle background flair */}
              <div className={`absolute -right-4 -bottom-4 h-20 w-20 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${isComplete ? 'text-green-500' : 'text-accent'}`}>
                <Cpu size={80} />
              </div>

              {/* Top Status */}
              <div className="flex justify-between items-start mb-6">
                <span className="text-[9px] font-black text-muted uppercase tracking-[0.2em] group-hover:text-accent transition-colors">
                  {rule.category}
                </span>
                {isComplete ? (
                  <div className="bg-green-500/10 p-1.5 rounded-lg">
                    <CheckCircle2 size={14} className="text-green-500" />
                  </div>
                ) : (
                  <div className="bg-accent/10 p-1.5 rounded-lg animate-pulse">
                    <Activity size={14} className="text-accent" />
                  </div>
                )}
              </div>
              
              {/* Data Row */}
              <div className="flex justify-between items-end mb-4">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-4xl font-black text-ink tracking-tighter">
                    {Math.round(pct)}
                  </span>
                  <span className="text-sm font-black text-ink">%</span>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[10px] font-bold text-ink mb-1">
                    {rule.current} <span className="text-muted/40 mx-0.5">/</span> {rule.total}
                  </p>
                  <p className="text-[8px] font-black uppercase text-muted tracking-tighter">Articles</p>
                </div>
              </div>

              {/* Tailux-Style Progress Bar */}
              <div className="h-2 w-full bg-border rounded-full p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                    isComplete ? 'bg-green-500' : 'bg-accent'
                  }`} 
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>

              {/* Status Text */}
              <div className="mt-5 flex justify-between items-center">
                <span className="text-[9px] font-bold text-muted uppercase tracking-tighter">Logic</span>
                <span className={`text-[9px] font-black uppercase tracking-widest ${isComplete ? 'text-green-500' : 'text-accent'}`}>
                  {isComplete ? 'Synced' : 'Active'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Metrics */}
      <div className="mt-12 flex flex-wrap gap-10 items-center border-t border-border pt-8">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black text-muted uppercase tracking-[0.2em]">Active Pipeline</span>
          <span className="text-xl font-black text-ink font-mono">{rules.length.toString().padStart(2, '0')}</span>
        </div>
        <div className="h-8 w-px bg-border hidden sm:block" />
        <div className="flex flex-col gap-1">
        </div>
      </div>
    </div>
  );
}