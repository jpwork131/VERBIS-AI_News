import React, { useState, useEffect, useRef } from 'react';
import { assetApi } from '../../api/assets';
import { settingsApi } from '../../api/settings';
import toast from 'react-hot-toast';
import { useBranding } from '../../context/BrandingContext';
import { Save, Cpu, ImageIcon, Zap, ExternalLink, Globe, ShieldCheck, Terminal, HardDrive } from 'lucide-react';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('identity');
  const [loading, setLoading] = useState(false);
  const { refreshBranding } = useBranding();
  const [previews, setPreviews] = useState({ logo: null, banner: null });
  const [syncInputs, setSyncInputs] = useState({ textKey: '', imageKey: '' });
  const [settings, setSettings] = useState({
    siteTitle: '',
    contactEmail: '',
    contactPhone: '',
    logo: '',
    fallbackBannerUrl: '',
    activeTextProvider: '',
    activeImageProvider: '',
    aiProviders: [] 
  });

  const logoRef = useRef();
  const bannerRef = useRef();

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const [brandingRes, configRes] = await Promise.all([
          assetApi.getAssets(),
          settingsApi.getSettings()
        ]);

        setSettings({
          ...configRes,
          ...brandingRes,
          siteTitle: brandingRes.siteTitle || '',
          contactEmail: brandingRes.contactEmail || '',
          contactPhone: brandingRes.contactPhone || '',
          logo: brandingRes.logo || '',
          fallbackBannerUrl: brandingRes.fallbackBannerUrl || ''
        });
      } catch (err) {
        toast.error("Error synchronizing local data");
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  const handleNeuralSync = async () => {
    if (!syncInputs.textKey) return toast.error("Text API Key is required for sync");
    setLoading(true);
    try {
      await settingsApi.syncSmartKeys(syncInputs);
      const freshConfig = await settingsApi.getSettings();
      setSettings(freshConfig);
      toast.success("Intelligence Pool Updated Successfully!");
      setActiveTab('ai-status');
    } catch (err) {
      toast.error(err.response?.data?.message || "AI Analysis Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const files = { 
        logo: logoRef.current?.files[0], 
        fallbackBanner: bannerRef.current?.files[0] 
      };
      let currentSettings = { ...settings };
      if (files.logo || files.fallbackBanner) {
        const assetRes = await assetApi.updateAssets(settings, files);
        currentSettings = { ...currentSettings, ...assetRes.assets };
      }
      const finalData = await settingsApi.updateSettings(currentSettings);
      setSettings(finalData);
      setPreviews({ logo: null, banner: null });
      await refreshBranding();
      toast.success("System Configuration Secured!");
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
  };

  const handleUrlChange = (type, value) => {
    if (type === 'logo') {
      if (logoRef.current) logoRef.current.value = "";
      setPreviews(prev => ({ ...prev, logo: null }));
      setSettings({ ...settings, logo: value });
    } else {
      if (bannerRef.current) bannerRef.current.value = "";
      setPreviews(prev => ({ ...prev, banner: null }));
      setSettings({ ...settings, fallbackBannerUrl: value });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-10">
      
      {/* Editorial Navigation */}
      <div className="flex border-b-2 border-slate-900 mb-10 overflow-x-auto scrollbar-hide">
        {[
          { id: 'identity', label: 'Brand Identity', icon: <Globe size={14} /> },
          { id: 'sync', label: 'Neural Sync', icon: <Zap size={14} /> },
          { id: 'ai-status', label: 'AI Status', icon: <Terminal size={14} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-t-2 border-x-2 -mb-0.5 ${
              activeTab === tab.id 
                ? 'bg-white border-slate-900 border-b-white text-blue-600' 
                : 'bg-slate-50 border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="bg-white border-2 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,0.05)] p-8 lg:p-12">
        
        {/* TAB 1: IDENTITY */}
        {activeTab === 'identity' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Site Title', key: 'siteTitle' },
                { label: 'Control Email', key: 'contactEmail' },
                { label: 'Contact Phone', key: 'contactPhone' }
              ].map(field => (
                <div key={field.key} className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 italic">{field.label}</label>
                  <input 
                    value={settings[field.key]} 
                    onChange={e => setSettings({...settings, [field.key]: e.target.value})} 
                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 text-sm font-bold outline-none focus:border-slate-900 transition-colors" 
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
              {[
                { label: 'Brand Logo', ref: logoRef, key: 'logo', preview: previews.logo, fallback: settings.logo, type: 'logo' },
                { label: 'Article Hero Fallback', ref: bannerRef, key: 'fallbackBannerUrl', preview: previews.banner, fallback: settings.fallbackBannerUrl, type: 'banner' }
              ].map(asset => (
                <div key={asset.key} className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-900">{asset.label}</label>
                  <div className="aspect-video bg-slate-100 border-2 border-slate-900 flex items-center justify-center overflow-hidden relative group">
                    <img 
                      src={asset.preview || asset.fallback} 
                      className={`transition-all duration-500 group-hover:scale-105 ${asset.type === 'logo' ? 'max-h-[40%] object-contain' : 'w-full h-full object-cover grayscale group-hover:grayscale-0'}`} 
                      alt="Preview" 
                      onError={(e) => { e.target.src = "https://placehold.co/600x400?text=ASSET_VOID"; }} 
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <label htmlFor={asset.key} className="bg-white text-slate-900 px-6 py-3 text-[10px] font-black uppercase tracking-tighter cursor-pointer hover:bg-blue-600 hover:text-white transition-colors">Replace Asset</label>
                    </div>
                  </div>
                  <input type="file" ref={asset.ref} hidden id={asset.key} onChange={(e) => handleFileChange(e, asset.type)} accept="image/*" />
                  <input 
                    type="text" 
                    placeholder="REMOTE_URL_SOURCE" 
                    value={settings[asset.key] || ""} 
                    onChange={e => handleUrlChange(asset.type, e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 p-3 text-[10px] font-mono outline-none focus:border-slate-400" 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: NEURAL SYNC */}
        {activeTab === 'sync' && (
          <div className="max-w-2xl mx-auto py-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 p-10 text-white border-b-8 border-blue-600">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-600 text-white">
                  <Zap size={24} fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter italic">Intelligence Sync</h3>
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Model Endpoint Configuration</p>
                </div>
              </div>

              <div className="space-y-8">
                {[
                  { label: 'Text Generation Key', placeholder: 'Groq, OpenAI, or OpenRouter', key: 'textKey' },
                  { label: 'Image Generation Key', placeholder: 'Cloudflare ID:Token or DALL-E', key: 'imageKey' }
                ].map(input => (
                  <div key={input.key} className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400">{input.label}</label>
                    <input 
                      type="password" 
                      placeholder={input.placeholder}
                      className="w-full bg-slate-800 border-b-2 border-slate-700 p-4 text-sm font-mono focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                      onChange={(e) => setSyncInputs({...syncInputs, [input.key]: e.target.value})}
                    />
                  </div>
                ))}

                <button 
                  type="button"
                  onClick={handleNeuralSync}
                  disabled={loading || !syncInputs.textKey}
                  className="w-full py-5 bg-blue-600 hover:bg-white hover:text-slate-900 text-white font-black text-[11px] uppercase tracking-[0.4em] transition-all disabled:bg-slate-800 disabled:text-slate-600"
                >
                  {loading ? "Initializing Smart Mapping..." : "Re-Sync Neural Pool"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AI STATUS */}
        {activeTab === 'ai-status' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between border-b-2 border-slate-100 pb-10 gap-8">
              <div className="flex gap-12">
                {[
                  { label: 'Primary Text', value: settings.activeTextProvider, icon: <Cpu className="text-blue-600" /> },
                  { label: 'Primary Image', value: settings.activeImageProvider, icon: <ImageIcon className="text-slate-400" /> }
                ].map(stat => (
                  <div key={stat.label}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                    <div className="flex items-center gap-3 text-xl font-black text-slate-900 uppercase italic">
                      {stat.icon} {stat.value || "VOID"}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-emerald-50 border-2 border-emerald-500 px-6 py-3 flex items-center gap-3 self-start">
                <div className="w-2 h-2 bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Core Synchronized</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {settings?.aiProviders?.map((provider, idx) => (
                <div key={idx} className="group p-8 bg-slate-50 border-2 border-slate-200 hover:border-slate-900 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className={`p-4 border-2 ${provider.category === 'text' ? 'bg-white border-blue-600 text-blue-600' : 'bg-white border-slate-900 text-slate-900'}`}>
                      {provider.category === 'text' ? <Cpu size={24} /> : <ImageIcon size={24} />}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 uppercase text-lg italic tracking-tighter leading-none">{provider.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">{provider.baseUrl}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-8">
                    {[
                      { label: 'Model_ID', value: provider.textModel || provider.imageModel, mono: true },
                      { label: 'Protocol', value: provider.payloadStructure, mono: false },
                      { label: 'State', value: 'Active', mono: false, color: 'text-emerald-600' }
                    ].map(item => (
                      <div key={item.label}>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                        <p className={`text-[10px] font-bold uppercase ${item.mono ? 'font-mono' : ''} ${item.color || 'text-slate-700'}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )) || <div className="p-20 text-center border-2 border-dashed border-slate-200 text-slate-400 uppercase font-black text-xs tracking-widest italic">No neural assets detected.</div>}
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t-2 border-slate-900 flex justify-end">
          <button 
            type="submit" 
            disabled={loading} 
            className="group bg-slate-900 text-white px-12 py-5 font-black text-[11px] uppercase tracking-[0.4em] hover:bg-blue-600 transition-all flex items-center gap-3 disabled:bg-slate-200"
          >
            <Save size={16} />
            {loading ? "SECURE_SYNCING..." : "COMMIT_CHANGES"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettings;