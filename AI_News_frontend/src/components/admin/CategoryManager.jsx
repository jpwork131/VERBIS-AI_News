import React, { useState, useEffect } from 'react';
import { Plus, Tag, Search, Activity, Trash2, Edit3, X, Save, Globe, Link, AlertTriangle } from 'lucide-react';
import categoryApi from '../../api/categories';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  // slug to formData
  const [formData, setFormData] = useState({ name: '', slug: '', searchQuery: '', isActive: true });

  // Migration State
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [migrationData, setMigrationData] = useState({ id: '', name: '', migrateToId: '',count: 0 });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setIsEditing(category._id);
      setFormData({ 
        name: category.name, 
        slug: category.slug, // Map existing slug
        searchQuery: category.searchQuery, 
        isActive: category.isActive 
      });
    } else {
      setIsEditing(null);
      setFormData({ name: '', slug: '', searchQuery: '', isActive: true });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await categoryApi.update(isEditing, formData);
      } else {
        await categoryApi.create(formData);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };


  const handleDelete = async (id, name, migrateToId = null) => {
  try {
    // 1. Build URL (supports migration via query param)
    const url = migrateToId ? `${id}?migrateToId=${migrateToId}` : id;

    // 2. Execute Delete
    await categoryApi.delete(url); 
    
    // 3. Reset and Refresh
    setShowMigrationModal(false);
    setMigrationData({ id: '', name: '', migrateToId: '', count: 0 });
    fetchCategories();
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.message || "";

    // 4. Handle Migration Trigger (Status 400)
    if (status === 400 && (msg.includes("MIGRATE_NEEDED") || msg.includes("articles"))) {
      // Extract the article count from the backend message string
      const match = msg.match(/(\d+)/);
      const articleCount = match ? match[0] : "Multiple";

      // Consolidate state update (Don't call this twice!)
      setMigrationData({ 
        id, 
        name, 
        migrateToId: '', 
        count: articleCount 
      });

      setShowMigrationModal(true);
    } else {
      // Handle actual errors (500, 404, etc.)
      alert(msg || "Failed to delete category");
    }
  }
};


  const toggleStatus = async (category) => {
    try {
      await categoryApi.update(category._id, { isActive: !category.isActive });
      fetchCategories();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="p-10 text-center font-mono text-[10px] uppercase tracking-widest">Accessing Silo Database...</div>;

  return (
    <div className="bg-white border-b-2 border-slate-900">
      
      {/* Top Section */}
      <div className="px-6 py-8 border-b-2 border-slate-900 flex justify-between items-center bg-white">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Category <span className="text-blue-600">Silos</span></h2>
          <p className="font-mono text-[10px] text-slate-500 uppercase mt-1">Intelligence Classification Control</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-slate-900 text-white px-5 py-3 font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] active:shadow-none active:translate-y-1"
        >
          + Create New Category
        </button>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b-2 border-slate-900">
              <th className="px-6 py-5 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Category Designation</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Search Logic</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <tr key={cat._id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-5">
                  <p className="font-serif font-bold text-slate-900 italic text-base leading-none">{cat.name}</p>
                  <code className="text-[9px] font-mono text-blue-600 font-bold uppercase tracking-tighter bg-blue-50 px-1">
                    /{cat.slug}
                  </code>
                </td>
                <td className="px-6 py-5">
                  <div className="bg-slate-50 border-l-2 border-slate-900 p-2 max-w-xs">
                    <p className="text-[10px] font-mono text-slate-500 italic line-clamp-1">{cat.searchQuery}</p>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <button 
                    onClick={() => toggleStatus(cat)}
                    className={`border-2 border-slate-900 px-2 py-1 text-[9px] font-black uppercase transition-all hover:scale-105 ${cat.isActive ? 'bg-white text-slate-900' : 'bg-red-500 text-white border-red-500'}`}
                  >
                    {cat.isActive ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(cat)} className="p-2 border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-colors"><Edit3 size={14}/></button>
                    <button onClick={() => handleDelete(cat._id, cat.name)} className="p-2 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors"><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POPUP BOX */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border-4 border-slate-900 w-full max-w-md p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-6">
              {isEditing ? 'Update Intelligence Silo' : 'New Silo Entry'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest block mb-2 items-center gap-2">
                  <Tag size={12} /> Display Name
                </label>
                <input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border-2 border-slate-900 p-3 font-serif font-bold italic focus:outline-none focus:bg-blue-50"
                  placeholder="E.G. QUANTUM COMPUTING"
                  required
                />
              </div>

              {/* ADDED: SLUG EDITABLE FIELD */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest block mb-2 items-center gap-2">
                  <Link size={12} /> URL Slug (Permanent Link)
                </label>
                <input 
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                  className="w-full border-2 border-slate-900 p-3 font-mono text-[11px] focus:outline-none bg-slate-50"
                  placeholder="quantum-computing"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Search size={12} /> Google News Search Terms
                </label>
                <textarea 
                  value={formData.searchQuery}
                  onChange={(e) => setFormData({...formData, searchQuery: e.target.value})}
                  className="w-full border-2 border-slate-900 p-3 font-mono text-xs h-20 focus:outline-none"
                  placeholder='e.g. "Artificial Intelligence" OR "OpenAI"'
                  required
                />
              </div>

              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-slate-900 text-white py-4 font-black uppercase text-xs tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] hover:bg-blue-600 transition-all">
                  {isEditing ? 'Update Entry' : 'Authorize Entry'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 border-2 border-slate-200 font-black uppercase text-[10px] hover:border-slate-900 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MIGRATION MODAL (Triggered when articles exist) */}
      {showMigrationModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-red-900/20 backdrop-blur-md p-4">
          <div className="bg-white border-4 border-red-600 w-full max-w-md p-8 shadow-[12px_12px_0px_0px_rgba(220,38,38,1)]">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-xl font-black uppercase italic">Migration Required</h3>
            </div>
            
            <p className="text-xs font-mono text-slate-600 mb-6 uppercase leading-relaxed">
  Category <span className="text-slate-900 font-black">"{migrationData.name}"</span> contains 
  <span className="text-blue-600 font-black mx-1">({migrationData.count})</span> 
  active intelligence reports. 
  Select a target category to migrate all data before decommission.
</p>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest block mb-2">Target Migration Category</label>
                <select 
                  className="w-full border-2 border-slate-900 p-3 font-mono text-xs focus:outline-none appearance-none bg-slate-50"
                  value={migrationData.migrateToId}
                  onChange={(e) => setMigrationData({...migrationData, migrateToId: e.target.value})}
                >
                  <option value="">-- SELECT TARGET --</option>
                  {categories
                    .filter(c => c._id !== migrationData.id)
                    .map(c => (
                      <option key={c._id} value={c._id}>{c.name.toUpperCase()}</option>
                    ))
                  }
                </select>
              </div>

              <div className="flex gap-4">
                <button 
                  disabled={!migrationData.migrateToId}
                  onClick={() => handleDelete(migrationData.id, migrationData.name, migrationData.migrateToId)}
                  className={`flex-1 py-4 font-black uppercase text-xs tracking-[0.2em] transition-all ${
                    migrationData.migrateToId 
                    ? 'bg-red-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-900' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Confirm Migration & Delete
                </button>
                <button 
                  onClick={() => setShowMigrationModal(false)}
                  className="px-6 border-2 border-slate-200 font-black uppercase text-[10px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;