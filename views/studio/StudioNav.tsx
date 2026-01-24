import React from 'react';

export type StudioView = 'UI_UX' | 'ASSETS' | 'STORE';

interface StudioNavProps {
  activeView: StudioView;
  onViewChange: (view: StudioView) => void;
}

const StudioNav: React.FC<StudioNavProps> = ({ activeView, onViewChange }) => {
  const navItems: { id: StudioView; label: string; icon: string }[] = [
    { id: 'UI_UX', label: 'UI/UX Design', icon: 'design_services' },
    { id: 'ASSETS', label: 'Assets', icon: 'folder_open' },
    { id: 'STORE', label: 'Studio Store', icon: 'storefront' },
  ];

  return (
    <div className="h-10 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 gap-2 shrink-0 z-40">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id)}
          className={`flex items-center gap-2 px-4 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
            activeView === item.id
              ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/30'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
          }`}
        >
          <span className="material-symbols-rounded text-[18px]">{item.icon}</span>
          {item.label}
        </button>
      ))}
      <div className="ml-auto flex items-center gap-4">
        <div className="h-4 w-px bg-zinc-800"></div>
        <div className="flex items-center gap-2 px-2 py-1 bg-zinc-900/50 rounded border border-zinc-800/50">
           <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
           <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">Live Preview Active</span>
        </div>
      </div>
    </div>
  );
};

export default StudioNav;
