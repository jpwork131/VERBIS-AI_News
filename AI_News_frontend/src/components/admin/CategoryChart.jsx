import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

export default function CategoryChart({ distribution }) {
  // High-contrast, distinct colors that still feel "Editorial"
  // Deep Blue, Bright Orange, Emerald, Vivid Purple, Crimson, Amber
  const COLORS = ['#2563eb', '#f97316', '#10b981', '#8b5cf6', '#e11d48', '#f59e0b'];

  const totalArticles = distribution.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="bg-white border-2 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,0.1)] p-8 h-full flex flex-col">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 border-b-2 border-slate-100 pb-4">
        <div className="p-2 bg-slate-900 text-white">
          <PieIcon size={18} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
            Topic Distribution
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
            Article breakdown by category
          </p>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-62.5 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distribution}
              dataKey="count"
              nameKey="_id"
              cx="50%" 
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={4}
              stroke="#fff"
              strokeWidth={2}
              isAnimationActive={true}
            >
              {distribution.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  // Adding a hover scale effect for better interaction
                  className="hover:opacity-90 transition-all duration-200 outline-none"
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </Pie>
            <Tooltip 
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-3 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1">
                        {payload[0].name}
                      </p>
                      <p className="text-xl font-mono font-bold leading-none">
                        {payload[0].value} 
                        <span className="text-[10px] text-slate-400 ml-1">Items</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</span>
            <span className="text-3xl font-black text-slate-900 leading-none">
                {totalArticles}
            </span>
        </div>
      </div>

      {/* High-Contrast Grid Legend */}
      <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-y-3 gap-x-6">
        {distribution.map((entry, index) => (
          <div key={index} className="flex items-center gap-3">
            {/* Box instead of dot for better visibility */}
            <div 
              className="w-4 h-4 border-2 border-slate-900 shrink-0" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black text-slate-900 uppercase truncate">
                {entry._id}
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                {((entry.count / totalArticles) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};