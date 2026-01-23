import React from 'react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { id: View.Dashboard, icon: 'dashboard', label: 'Overview' },
    { id: View.Editor, icon: 'code', label: 'Code' },
    { id: View.Design, icon: 'brush', label: 'Design' },
    { id: View.Infrastructure, icon: 'dns', label: 'Infra' },
    { id: View.Marketplace, icon: 'extension', label: 'Extensions' },
    { id: View.Support, icon: 'forum', label: 'Community' },
  ];

  return (
    <aside className="w-16 flex flex-col items-center bg-slate-900 border-r border-slate-800 py-4 h-full shrink-0 z-50">
      <div className="mb-8 p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/30">
        <span className="material-symbols-rounded text-white" style={{ fontSize: '24px' }}>deployed_code</span>
      </div>

      <nav className="flex-1 flex flex-col gap-4 w-full px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
              currentView === item.id
                ? 'bg-slate-800 text-indigo-400 shadow-md border border-slate-700'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-rounded">{item.icon}</span>
            {/* Tooltip */}
            <div className="absolute left-14 bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              {item.label}
            </div>
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-4 w-full px-2">
        <button 
          onClick={() => onChangeView(View.Settings)}
          className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
            currentView === View.Settings ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="material-symbols-rounded">settings</span>
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold border-2 border-slate-950">
          JD
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;