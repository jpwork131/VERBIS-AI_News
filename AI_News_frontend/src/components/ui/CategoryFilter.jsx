import React, { useEffect, useState } from "react";
import { ChevronRight, LayoutGrid, Hash } from "lucide-react";
import { getCategories } from "../../api/articles";

const CategoryFilter = ({ activeCategory, onChange }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        // Updated: The API now returns an array of Silo objects [{ name, slug, ... }]
        if (Array.isArray(response)) {
          setCategories(response);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error("Category fetch error:", err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const CategoryButton = ({ label, isActive, onClick, Icon }) => (
    <button
      onClick={onClick}
      className={`group flex w-full items-center justify-between py-2 transition-all duration-200 border-l-2 mb-1 ${
        isActive
          ? "border-blue-600 pl-4 bg-blue-50/50"
          : "border-transparent pl-2 hover:border-slate-200 hover:pl-4"
      }`}
    >
      <span className="flex items-center gap-3">
        <Icon 
          className={`h-3.5 w-3.5 ${
            isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-900"
          }`} 
        />
        <span className={`text-[11px] font-black uppercase tracking-[0.15em] transition-colors ${
          isActive ? "text-slate-900" : "text-slate-500 group-hover:text-slate-900"
        }`}>
          {label}
        </span>
      </span>
      
      {isActive && (
        <div className="h-1 w-1 rounded-full bg-blue-600 mr-2" />
      )}
    </button>
  );

  return (
    <div className="flex flex-col">
      {/* 1. Static "All" button - Uses "All" to match Home.js logic */}
      <CategoryButton 
        label="All Stories"
        isActive={activeCategory === "All" || !activeCategory}
        onClick={() => onChange("All")}
        Icon={LayoutGrid}
      />

      {/* 2. Dynamic Categories */}
      {(categories || []).map((silo) => (
        <CategoryButton
          key={silo._id || silo.slug}
          label={silo.name} // Display Name (e.g., "AI Tech")
          isActive={activeCategory === silo.slug} // Match against the Slug
          onClick={() => onChange(silo.slug)} // Emit the Slug to the parent
          Icon={Hash}
        />
      ))}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4 mt-4 ml-2">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="h-2 w-24 bg-slate-100 animate-pulse rounded" />
           ))}
        </div>
      )}
    </div>
  );
}

export default CategoryFilter;