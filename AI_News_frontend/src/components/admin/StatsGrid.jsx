import { Users, Newspaper, Zap, Heart } from 'lucide-react';

export default function StatsGrid({ data }) {
  const cards = [
    { 
      label: "Total Readers", 
      value: data.users.total.toLocaleString(), 
      subtext: `${data.users.today} new today`, 
      icon: <Users size={20} /> 
    },
    { 
      label: "Article Library", 
      value: data.content.total.toLocaleString(), 
      subtext: `${data.content.today} added today`, 
      icon: <Newspaper size={20} /> 
    },
    { 
      label: "Reader Engagement", 
      value: data.users.engagement.avgSaved.toFixed(1), 
      subtext: "Avg. saves per user", 
      icon: <Heart size={20} /> 
    },
    { 
      label: "Live Sources", 
      value: data.ingestion.activeRulesCount, 
      subtext: "Active auto-feeds", 
      icon: <Zap size={20} /> 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {cards.map((card, i) => (
        <div 
          key={i} 
          className="group p-6 bg-white border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-slate-900 text-white group-hover:bg-blue-600 transition-colors">
              {card.icon}
            </div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
              Insight 0{i + 1}
            </span>
          </div>

          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
              {card.label}
            </p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
              {card.value}
            </h3>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1 w-4 bg-blue-600"></div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                {card.subtext}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};