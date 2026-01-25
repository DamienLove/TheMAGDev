import React, { useState } from 'react';
import { View } from '../types';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface AppLayoutProps {
  currentView: View;
  onChangeView: (view: View) => void;
  children: React.ReactNode;
  user?: { name: string; avatar: string };
  badges?: { isPro?: boolean; isAdmin?: boolean };
  auth?: { isAuthenticated: boolean; onLogin: () => void; onLogout: () => void };
}

const AppLayout: React.FC<AppLayoutProps> = ({ currentView, onChangeView, children, user, badges, auth }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState<Notification[]>([
    { id: '1', type: 'success', title: 'Pipeline Success', message: 'Production build v2.1.0 deployed to us-east-1', time: '5m ago', read: false },
    { id: '2', type: 'warning', title: 'Resource Alert', message: 'TheMAG-Edge-DB exceeding P90 latency threshold', time: '12m ago', read: false },
    { id: '3', type: 'info', title: 'Registry Update', message: 'New verified artifact: @themag/security-scan v1.2', time: '1h ago', read: true },
  ]);

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
    { id: View.Settings, icon: 'settings', label: 'Settings' },
  ];

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-200 overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Platform Global Header */}
      <header className="h-14 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 z-50 shadow-2xl">
        
        {/* Brand Identity & Cluster Context */}
        <div className="flex items-center gap-4 w-[300px]">
          <div className="flex items-center gap-2.5">
             <div className="size-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-lg shadow-zinc-950/40">
                <img src="/branding/STLOGO.png" alt="TheMAG.dev" className="w-5 h-5 object-contain" />
             </div>
             <span className="font-bold text-white tracking-tighter text-lg hidden md:block">TheMAG.dev</span>
          </div>
          <div className="h-4 w-px bg-zinc-800 hidden md:block"></div>
          <div className="flex items-center gap-2 px-2 py-1 bg-zinc-900 rounded border border-zinc-800 hidden md:flex cursor-pointer hover:border-zinc-700 transition-colors group">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-zinc-200 transition-colors">Cluster: us-east-prod</span>
            <span className="material-symbols-rounded text-[14px] text-zinc-600">expand_more</span>
          </div>
        </div>

        {/* Unified Navigation Engine */}
        <nav className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-1 bg-zinc-900/40 p-1 rounded-xl border border-zinc-800/50 backdrop-blur-md">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${
                  currentView === item.id
                    ? 'bg-zinc-800 text-white shadow-lg border border-zinc-700/50'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                }`}
              >
                <span className={`material-symbols-rounded text-[18px] ${currentView === item.id ? 'text-indigo-400' : ''}`}>{item.icon}</span>
                <span className="hidden xl:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Global Action Terminal */}
        <div className="flex items-center justify-end gap-3 w-[300px]">
           <div className="hidden lg:flex items-center gap-3 bg-zinc-950 border border-zinc-800 hover:border-indigo-500/50 rounded-lg py-1.5 px-3 w-56 transition-all cursor-text group shadow-inner">
               <span className="material-symbols-rounded text-zinc-500 text-[16px] group-hover:text-indigo-400 transition-colors">search</span>
               <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Execute command...</span>
               <div className="ml-auto flex gap-1">
                  <kbd className="text-[9px] bg-zinc-900 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-800 font-mono shadow-sm">⌘K</kbd>
               </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-lg transition-all relative ${showNotifications ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}
              >
                 <span className="material-symbols-rounded text-[22px]">notifications</span>
                 <span className="absolute top-2 right-2.5 size-2 bg-indigo-500 rounded-full border-2 border-zinc-950"></span>
              </button>
              <button className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg transition-all">
                 <span className="material-symbols-rounded text-[22px]">tune</span>
              </button>
            </div>
            
            <div className="h-4 w-px bg-zinc-800 mx-1"></div>

            <div className="flex items-center gap-3">
              {auth && (
                <button
                  onClick={auth.isAuthenticated ? auth.onLogout : auth.onLogin}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:border-indigo-500/60 hover:bg-zinc-900 transition-all"
                >
                  <span className="material-symbols-rounded text-[14px]">
                    {auth.isAuthenticated ? 'logout' : 'login'}
                  </span>
                  {auth.isAuthenticated ? 'Sign Out' : 'Sign In'}
                </button>
              )}
              <div className="flex items-center gap-3 cursor-pointer hover:bg-zinc-900 p-1 pr-3 rounded-lg transition-colors group">
              <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition-transform">
                {user ? user.avatar : 'JD'}
              </div>
              <div className="hidden 2xl:flex flex-col">
                 <span className="text-[10px] font-bold text-white leading-none uppercase tracking-tight">{user ? user.name : 'Engineer'}</span>
                 <div className="flex items-center gap-1 mt-1">
                   {auth?.isAuthenticated === false && (
                     <span className="text-[9px] font-bold text-amber-300 uppercase px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">Guest</span>
                   )}
                   {auth?.isAuthenticated !== false && badges?.isAdmin && (
                     <span className="text-[9px] font-bold text-emerald-300 uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Admin</span>
                   )}
                   {auth?.isAuthenticated !== false && badges?.isPro && (
                     <span className="text-[9px] font-bold text-indigo-300 uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">Pro</span>
                   )}
                   {auth?.isAuthenticated !== false && !badges?.isAdmin && !badges?.isPro && (
                     <span className="text-[9px] font-bold text-zinc-500 uppercase">Member</span>
                   )}
                 </div>
              </div>
            </div>
            </div>
        </div>
      </header>

      {/* Primary Rendering Surface */}
      <main className="flex-1 min-h-0 min-w-0 overflow-hidden relative bg-zinc-950">
        {children}
        
        {/* Global HUD Overlays */}
        {showNotifications && (
          <div className="absolute top-2 right-4 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
             <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Platform Events</span>
                <button className="text-[9px] font-bold text-indigo-400 hover:underline uppercase">Clear all</button>
             </div>
             <div className="max-h-[400px] overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="p-4 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors cursor-pointer group">
                     <div className="flex gap-3">
                        <div className={`size-2 rounded-full mt-1.5 shrink-0 ${n.type === 'success' ? 'bg-emerald-500' : n.type === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
                        <div>
                           <p className="text-xs font-bold text-white leading-none">{n.title}</p>
                           <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">{n.message}</p>
                           <p className="text-[9px] text-zinc-600 font-bold uppercase mt-2">{n.time}</p>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
             <button className="w-full py-3 bg-zinc-950/50 text-center text-[10px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-widest">View system audit log</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AppLayout;
