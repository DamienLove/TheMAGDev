import React from 'react';
import { View } from '../types';

interface AppLayoutProps {
  currentView: View;
  onChangeView: (view: View) => void;
  children: React.ReactNode;
  user?: { name: string; avatar: string };
}

const AppLayout: React.FC<AppLayoutProps> = ({ currentView, onChangeView, children, user }) => {
  const navItems = [
    { id: View.Dashboard, icon: 'grid_view', label: 'Overview' },
    { id: View.Projects, icon: 'kanban', label: 'Projects' },
    { id: View.Editor, icon: 'code', label: 'Code' },
    { id: View.Design, icon: 'brush', label: 'Design' },
    { id: View.Infrastructure, icon: 'dns', label: 'Infra' },
    { id: View.Marketplace, icon: 'extension', label: 'Market' },
    { id: View.Support, icon: 'forum', label: 'Help' },
  ];

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-200 overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Top Navigation Bar */}
      <header className="h-14 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 z-50">
        
        {/* Left: Brand & Context */}
        <div className="flex items-center gap-4 w-64">
          <div className="flex items-center gap-2 text-indigo-500">
             <span className="material-symbols-rounded text-[24px]">deployed_code</span>
             <span className="font-bold text-white tracking-tight hidden md:block">Nexus</span>
          </div>
          <div className="h-4 w-px bg-zinc-800 hidden md:block"></div>
          <div className="flex items-center gap-2 text-sm text-zinc-400 hidden md:flex cursor-pointer hover:text-white transition-colors">
            <span>acme-corp</span>
            <span className="text-zinc-700">/</span>
            <span className="font-medium text-zinc-200">nexus-web</span>
            <span className="material-symbols-rounded text-[16px]">expand_more</span>
          </div>
        </div>

        {/* Center: Main Navigation Tabs */}
        <nav className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800/50 backdrop-blur-sm">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  currentView === item.id
                    ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/50'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                <span className={`material-symbols-rounded text-[18px] ${currentView === item.id ? 'text-indigo-400' : ''}`}>{item.icon}</span>
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Right: Actions & User */}
        <div className="flex items-center justify-end gap-3 w-64">
           {/* Command Search */}
           <div className="hidden lg:flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-md py-1.5 px-2 w-48 transition-all cursor-text group">
               <span className="material-symbols-rounded text-zinc-500 text-[16px]">search</span>
               <span className="text-zinc-500 text-xs group-hover:text-zinc-400">Type command...</span>
               <div className="ml-auto flex gap-1">
                  <kbd className="text-[9px] bg-zinc-800 text-zinc-400 px-1 rounded border border-zinc-700 font-mono">⌘K</kbd>
               </div>
            </div>

            <div className="flex items-center gap-1">
              <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors relative">
                 <span className="material-symbols-rounded text-[20px]">notifications</span>
                 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-zinc-950"></span>
              </button>
              <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                 <span className="material-symbols-rounded text-[20px]">settings</span>
              </button>
            </div>
            
            <div className="h-4 w-px bg-zinc-800 mx-1"></div>

            <div className="flex items-center gap-2 cursor-pointer hover:bg-zinc-900 p-1 rounded-lg transition-colors">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-zinc-950">
                {user ? user.avatar : 'U'}
              </div>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative bg-zinc-950">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;