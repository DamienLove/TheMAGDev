import React from 'react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
  user?: { avatar?: string };
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, user }) => {
  const navItems = [
    { id: View.Dashboard, icon: 'analytics', label: 'Monitor' },
    { id: View.Projects, icon: 'hub', label: 'Showcase' },
    { id: View.Editor, icon: 'terminal', label: 'Workspace' },
    { id: View.Desktop, icon: 'desktop_windows', label: 'Desktop' },
    { id: View.Design, icon: 'grid_view', label: 'Studio' },
    { id: View.Build, icon: 'dataset', label: 'Build' },
    { id: View.Analytics, icon: 'query_stats', label: 'Insights' },
    { id: View.Infrastructure, icon: 'layers', label: 'Stack' },
    { id: View.SDKs, icon: 'handyman', label: 'SDKs' },
    { id: View.Extensions, icon: 'extension', label: 'Extensions' },
    { id: View.Marketplace, icon: 'storefront', label: 'Marketplace' },
  ];

  return (
    <aside className="w-16 flex flex-col items-center bg-slate-900 border-r border-slate-800 py-4 h-full shrink-0 z-50">
      <div className="mb-8 p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/30">
        <span className="material-symbols-rounded text-white" style={{ fontSize: '24px' }}>deployed_code</span>
      </div>

      <nav className="flex-1 flex flex-col gap-4 w-full px-2 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            aria-label={item.label}
            aria-current={currentView === item.id ? 'page' : undefined}
            className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 shrink-0 ${
              currentView === item.id
                ? 'bg-slate-800 text-indigo-400 shadow-md border border-slate-700'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-rounded">{item.icon}</span>
            {/* Tooltip */}
            <div className="absolute left-14 bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
              {item.label}
            </div>
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-4 w-full px-2 mt-4 pt-4 border-t border-slate-800">
        <button
          onClick={() => onChangeView(View.Support)}
          aria-label="Support"
          className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
            currentView === View.Support ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="material-symbols-rounded">contact_support</span>
          <div className="absolute left-14 bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
            Support
          </div>
        </button>
        <button 
          onClick={() => onChangeView(View.Settings)}
          aria-label="Settings"
          className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
            currentView === View.Settings ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="material-symbols-rounded">settings</span>
          <div className="absolute left-14 bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
            Settings
          </div>
        </button>
        <button
          type="button"
          aria-label="User profile"
          className="w-10 h-10 mx-auto rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold border-2 border-slate-950 shadow-lg cursor-pointer hover:scale-110 transition-transform"
        >
          {user?.avatar || 'JD'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
