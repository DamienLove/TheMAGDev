import React, { useState } from 'react';
import { View } from '../types';
import Sidebar from './Sidebar';

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

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-200 overflow-hidden font-sans selection:bg-indigo-500/30">
      <Sidebar currentView={currentView} onChangeView={onChangeView} user={user} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Platform Global Header */}
        <header className="h-14 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 z-50 shadow-2xl">

          {/* Brand Identity & Cluster Context */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-lg shadow-zinc-950/40">
                <img src="./branding/STLOGO.png" alt="TheMAG.dev" className="w-5 h-5 object-contain" />
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

          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors">search</span>
              <input
                type="text"
                placeholder="Search commands, files..."
                className="bg-zinc-900/50 border border-zinc-800 rounded-full py-1.5 pl-9 pr-4 text-[11px] w-64 focus:outline-none focus:border-indigo-500/50 focus:bg-zinc-900 transition-all text-zinc-300 placeholder:text-zinc-600"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                <span className="px-1 py-0.5 rounded bg-zinc-800 text-[8px] font-bold text-zinc-500">⌘</span>
                <span className="px-1 py-0.5 rounded bg-zinc-800 text-[8px] font-bold text-zinc-500">K</span>
              </div>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-3">
            <a
              href="https://magstack.rf.gd/"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:border-emerald-500/60 hover:bg-zinc-900 transition-all"
            >
              <span className="material-symbols-rounded text-[14px]">hub</span>
              MagStack
            </a>

            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 rounded-lg transition-colors ${showNotifications ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
            >
              <span className="material-symbols-rounded text-xl">notifications</span>
              {notifications.some(n => !n.read) && (
                <span className="absolute top-2 right-2 size-2 bg-indigo-500 rounded-full border-2 border-zinc-950"></span>
              )}
            </button>

            {auth?.isAuthenticated ? (
              <button onClick={auth.onLogout} className="text-[10px] font-bold uppercase text-zinc-500 hover:text-zinc-300 transition-colors">Logout</button>
            ) : (
              <button onClick={auth?.onLogin} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-indigo-500/20">Sign In</button>
            )}
          </div>
        </header>

        {/* Primary Rendering Surface */}
        <main className="flex-1 min-h-0 min-w-0 overflow-hidden relative bg-zinc-950 flex flex-col">
          {children}

          {/* Notifications Overlay */}
          {showNotifications && (
            <div className="absolute top-2 right-4 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Platform Events</span>
                <button className="text-[9px] font-bold text-indigo-400 hover:underline uppercase">Clear all</button>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? notifications.map(n => (
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
                )) : (
                  <div className="p-8 text-center">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase">No new events</p>
                  </div>
                )}
              </div>
              <button className="w-full py-3 bg-zinc-950/50 text-center text-[10px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-widest">View system audit log</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
