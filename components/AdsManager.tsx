import React, { useState, useRef } from 'react';
import { Advertisement, AdAsset } from '../types';
import { Button } from './Button';
import { Plus, Upload, Trash2, Building2, ImageIcon, Check } from 'lucide-react';

interface AdsManagerProps {
  ads: Advertisement[];
  onAddAd: (ad: Advertisement) => void;
}

export const AdsManager: React.FC<AdsManagerProps> = ({ ads, onAddAd }) => {
  const [brandName, setBrandName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [color, setColor] = useState('#10b981');
  const [logoAsset, setLogoAsset] = useState<AdAsset | null>(null);
  
  // Use a ref for the file input to trigger it from a custom button
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoAsset({
          id: Date.now().toString(),
          type: 'logo',
          url: reader.result as string,
          description: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
      fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName || !slogan || !logoAsset) {
        alert("Please complete the form: Company Name, Tagline, and Logo are required.");
        return;
    }

    const newAd: Advertisement = {
      id: Date.now().toString(),
      brandName,
      slogan,
      color,
      assets: [logoAsset],
      cpm: Math.floor(Math.random() * 50) + 10 
    };

    onAddAd(newAd);
    // Reset form
    setBrandName('');
    setSlogan('');
    setLogoAsset(null);
    setColor('#10b981');
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-900 aurora-bg relative">
      {/* Header - Fixed at top */}
      <div className="px-6 pt-12 pb-4 bg-gradient-to-b from-black/80 to-transparent shrink-0 z-10">
        <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
           <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
               <Building2 size={28} />
           </div>
           Register Brand
        </h1>
        <p className="text-slate-400 text-sm mt-2 font-medium">
           Setup your company profile for game integration.
        </p>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
         
         {/* Form Card */}
         <form onSubmit={handleSubmit} className="bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 mb-8 shadow-xl">
            
            {/* Input Group */}
            <div className="space-y-5">
                <div>
                    <label className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2 block">Company Name</label>
                    <input 
                        type="text" 
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="e.g. CyberCola"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-medium"
                    />
                </div>

                <div>
                    <label className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2 block">Tagline</label>
                    <input 
                        type="text" 
                        value={slogan}
                        onChange={(e) => setSlogan(e.target.value)}
                        placeholder="e.g. The Future of Taste"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-medium"
                    />
                </div>

                {/* Image Upload Area */}
                <div>
                    <label className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2 block">Brand Logo (Required)</label>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                    />
                    
                    {!logoAsset ? (
                        <div 
                            onClick={triggerUpload}
                            className="w-full aspect-[2/1] border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl bg-black/20 hover:bg-emerald-500/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group"
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-emerald-500/20 flex items-center justify-center transition-colors">
                                <Upload className="text-slate-400 group-hover:text-emerald-400" size={20} />
                            </div>
                            <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">
                                Tap to upload logo
                            </span>
                        </div>
                    ) : (
                        <div className="relative w-full aspect-[2/1] bg-black/40 rounded-2xl border border-emerald-500/30 overflow-hidden group">
                            <img src={logoAsset.url} alt="Logo Preview" className="w-full h-full object-contain p-4" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                                <button 
                                    type="button"
                                    onClick={triggerUpload}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-xs font-bold backdrop-blur-md transition-colors"
                                >
                                    Change
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setLogoAsset(null)}
                                    className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-full transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="absolute top-3 right-3 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                                <Check size={12} strokeWidth={4} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Color Picker */}
                <div>
                   <label className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2 block">Brand Color</label>
                   <div className="flex flex-wrap gap-3">
                     {['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'].map(c => (
                        <button 
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`w-10 h-10 rounded-full border-2 transition-transform ${color === c ? 'border-white scale-110 shadow-lg shadow-white/20' : 'border-transparent scale-100 opacity-60 hover:opacity-100 hover:scale-105'}`}
                          style={{ backgroundColor: c }}
                          aria-label={`Select color ${c}`}
                        />
                     ))}
                   </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="mt-8">
                <Button 
                    type="submit" 
                    className="w-full py-4 text-lg !bg-white !text-black shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                    disabled={!logoAsset || !brandName}
                >
                   <Plus size={20} className="mr-2" strokeWidth={3} />
                   Register Company
                </Button>
            </div>
         </form>

         {/* Existing Brands */}
         <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Your Brands</h3>
            <span className="text-xs font-mono text-slate-600">{ads.length} Active</span>
         </div>
         
         <div className="space-y-3">
            {ads.map(ad => (
               <div key={ad.id} className="bg-slate-800/30 border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-black/50 border border-white/10 p-2 flex items-center justify-center overflow-hidden">
                        {ad.assets[0] ? (
                            <img src={ad.assets[0].url} className="w-full h-full object-contain" alt={ad.brandName} />
                        ) : (
                            <ImageIcon className="text-slate-700" size={24} />
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-lg leading-tight">{ad.brandName}</h4>
                        <p className="text-xs text-slate-400 font-medium">"{ad.slogan}"</p>
                    </div>
                  </div>
                  <div className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: ad.color, color: ad.color }}></div>
               </div>
            ))}
            
            {ads.length === 0 && (
               <div className="text-center p-12 text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
                  <Building2 size={32} className="mx-auto mb-3 opacity-50" />
                  <p>No registered brands yet.</p>
               </div>
            )}
         </div>

      </div>
    </div>
  );
};