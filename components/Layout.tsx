
import React from 'react';
import { Home, Plus, User, Megaphone } from 'lucide-react';

interface LayoutProps {
  currentView: 'feed' | 'create' | 'profile' | 'ads';
  onViewChange: (view: 'feed' | 'create' | 'profile' | 'ads') => void;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onViewChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-6 z-50">
      <button 
        onClick={() => onViewChange('feed')}
        className={`flex flex-col items-center gap-1.5 p-2 w-16 transition-all duration-300 ${currentView === 'feed' ? 'text-white scale-110' : 'text-slate-600 hover:text-slate-400'}`}
      >
        <Home size={26} strokeWidth={currentView === 'feed' ? 3 : 2} />
      </button>

      <button 
        onClick={() => onViewChange('ads')}
        className={`flex flex-col items-center gap-1.5 p-2 w-16 transition-all duration-300 ${currentView === 'ads' ? 'text-white scale-110' : 'text-slate-600 hover:text-slate-400'}`}
      >
        <Megaphone size={26} strokeWidth={currentView === 'ads' ? 3 : 2} />
      </button>

      <button 
        onClick={() => onViewChange('create')}
        className={`relative -top-6 group`}
      >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${currentView === 'create' ? 'bg-white shadow-white/20 scale-110 rotate-90' : 'bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-emerald-500/30 hover:scale-105'}`}>
           <Plus size={32} className={currentView === 'create' ? 'text-black' : 'text-white'} />
        </div>
      </button>

      <button 
        onClick={() => onViewChange('profile')}
        className={`flex flex-col items-center gap-1.5 p-2 w-16 transition-all duration-300 ${currentView === 'profile' ? 'text-white scale-110' : 'text-slate-600 hover:text-slate-400'}`}
      >
        <User size={26} strokeWidth={currentView === 'profile' ? 3 : 2} />
      </button>
    </nav>
  );
};
