import React, { useState } from 'react';
import { Plus, List, Tag } from 'lucide-react';

const CategoryInput = ({ categories, value, onChange }) => {
  const [isManual, setIsManual] = useState(false);

  const toggleMode = () => {
    setIsManual(!isManual);
    // Optional: Clear the value when switching if you want a fresh start
    // onChange(''); 
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
          <Tag size={12} /> Category
        </label>
        <button 
          type="button" 
          onClick={toggleMode}
          className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-all"
        >
          {isManual ? "Select from List" : "+ Add New"}
        </button>
      </div>

      <div className="relative group">
        {isManual ? (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter new category name..."
            className="w-full bg-slate-50 border-2 border-blue-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all animate-in slide-in-from-left-2"
          />
        ) : (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500/20 appearance-none cursor-pointer"
          >
            <option value="">-- Choose Category --</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat.name || cat}>
                {cat.name || cat}
              </option>
            ))}
          </select>
        )}
        
        {!isManual && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <List size={16} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryInput;