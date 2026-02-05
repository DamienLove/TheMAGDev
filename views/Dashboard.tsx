import React, { useState, useEffect } from 'react';

interface Metric {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  subtext?: string;
}

interface PlatformStatus {
  name: string;
  version: string;
  status: 'Stable' | 'Building' | 'Failed';
  timestamp: string;
  icon: string;
  progress?: number;
}

interface ActivityItem {
  id: string;
  type: 'deploy' | 'merge' | 'alert' | 'review';
  title: string;
  highlight: string;
  subtitle: string;
  icon: string;
  iconBg: string;
}

type HostingRole = 'primary' | 'backup' | 'mirror' | 'entry' | 'legacy';
type HostingStatus = 'live' | 'planned' | 'fix';

interface HostingTarget {
  name: string;
  role: HostingRole;
  status: HostingStatus;
  url?: string;
  note: string;
}

const hostingTargets: HostingTarget[] = [
  { name: 'Cloudflare Pages', role: 'primary', status: 'planned', note: 'Primary edge host (Cloudflare)' },
  { name: 'Vercel (main)', role: 'backup', status: 'live', url: 'https://the-mag-dev-git-main-damien-loves-projects.vercel.app', note: 'Secondary (Vercel main)' },
  { name: 'Firebase Hosting', role: 'mirror', status: 'live', url: 'https://themagdev-a4363.web.app', note: 'Tertiary (Firebase Hosting)' },
  { name: 'Netlify', role: 'mirror', status: 'live', url: 'https://shimmering-gelato-4b92fa.netlify.app', note: 'Mirror with Git deploys' },
  { name: 'Vercel (preview)', role: 'mirror', status: 'live', url: 'https://the-mag-ik11pe0f6-damien-loves-projects.vercel.app', note: 'Preview deployment' },
  { name: 'InfinityFree (FTP)', role: 'entry', status: 'fix', url: 'https://magstack.rf.gd/', note: 'Entry point (FTP legacy)' },
];

const hostingAlternates = ['GitHub Pages', 'Azure Static Web Apps', 'AWS Amplify'];

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([
    { label: 'Build Success Rate', value: '98.5%', change: 2.1, trend: 'up', subtext: 'Based on last 142 builds' },
    { label: 'Mean Time to Recovery', value: '14.2m', change: 12, trend: 'down', subtext: 'P50 over last 7 days' },
    { label: 'Deployment Frequency', value: '42/day', change: 8.1, trend: 'up', subtext: 'Production & Staging' },
    { label: 'Active Service Mesh', value: '94.8%', change: 0.01, trend: 'neutral', subtext: 'Infrastructure availability' },
  ]);

  const [platforms, setPlatforms] = useState<PlatformStatus[]>([
    { name: 'iOS App Store', version: 'v2.1.0', status: 'Stable', timestamp: '12m ago', icon: 'phone_iphone' },
    { name: 'Android Play Store', version: 'v2.1.1-rc', status: 'Building', timestamp: 'Syncing assets...', icon: 'android', progress: 45 },
    { name: 'TheMAG.dev Desktop', version: 'v1.4.0', status: 'Failed', timestamp: 'Linker Error', icon: 'desktop_windows' },
  ]);

  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: '1', type: 'deploy', title: 'Auto-deploy triggered by', highlight: 'CI/CD Pipeline #8492', subtitle: '24 minutes ago - Cluster: production-main', icon: 'smart_toy', iconBg: 'bg-zinc-800 border-zinc-700' },
    { id: '2', type: 'merge', title: 'Mike Chen merged PR', highlight: '#402', subtitle: '1 hour ago - Repository: core-api', icon: 'merge', iconBg: 'bg-indigo-600/20 border-indigo-500/30' },
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cpuUsage, setCpuUsage] = useState(42);
  const [memoryUsage, setMemoryUsage] = useState(78);
  const [showInsights, setShowInsights] = useState(false);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);

  const roleStyles: Record<HostingRole, string> = {
    primary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    backup: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    mirror: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    entry: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    legacy: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  };

  const roleLabels: Record<HostingRole, string> = {
    primary: 'Primary',
    backup: 'Backup',
    mirror: 'Mirror',
    entry: 'Entry',
    legacy: 'Legacy',
  };

  const statusStyles: Record<HostingStatus, string> = {
    live: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    planned: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    fix: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const statusLabels: Record<HostingStatus, string> = {
    live: 'Live',
    planned: 'Planned',
    fix: 'Needs Fix',
  };

  // Simulate live metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.max(20, Math.min(95, prev + (Math.random() - 0.5) * 10)));
      setMemoryUsage(prev => Math.max(40, Math.min(95, prev + (Math.random() - 0.5) * 5)));

      // Update building platform progress
      setPlatforms(prev => prev.map(p =>
        p.status === 'Building' && p.progress !== undefined
          ? { ...p, progress: Math.min(100, p.progress + Math.random() * 5) }
          : p
      ));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Handle platform build completion
  useEffect(() => {
    const buildingPlatform = platforms.find(p => p.status === 'Building' && p.progress && p.progress >= 100);
    if (buildingPlatform) {
      setPlatforms(prev => prev.map(p =>
        p.name === buildingPlatform.name
          ? { ...p, status: 'Stable', progress: undefined, timestamp: 'Just now' }
          : p
      ));
    }
  }, [platforms]);

  const handleRefreshMetrics = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setMetrics(prev => prev.map(m => ({
        ...m,
        change: parseFloat((Math.random() * 5).toFixed(1)),
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'neutral'
      })));
      setIsRefreshing(false);
    }, 1000);
  };

  const handleTriggerPipeline = () => {
    setIsPipelineRunning(true);
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      type: 'deploy',
      title: 'Pipeline triggered manually by',
      highlight: 'You',
      subtitle: 'Just now - Queued for production-main',
      icon: 'rocket_launch',
      iconBg: 'bg-indigo-600/20 border-indigo-500/30'
    };
    setActivities(prev => [newActivity, ...prev]);

    setTimeout(() => {
      setIsPipelineRunning(false);
      setActivities(prev => prev.map(a =>
        a.id === newActivity.id
          ? { ...a, subtitle: '1 minute ago - Deployed to production-main' }
          : a
      ));
    }, 3000);
  };

  const handleInfraAction = (action: string) => {
    const actionMessages: Record<string, string> = {
      'edge': 'Edge cache invalidated successfully',
      'pods': 'Pod cycle initiated - 3 pods restarting',
      'rollback': 'Rollback initiated to previous stable version',
      'ssh': 'SSH session opened in new terminal'
    };

    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      type: 'alert',
      title: actionMessages[action] || 'Action completed',
      highlight: '',
      subtitle: 'Just now - Initiated by You',
      icon: action === 'ssh' ? 'terminal' : 'settings',
      iconBg: 'bg-amber-600/20 border-amber-500/30'
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const handleRetryBuild = (platformName: string) => {
    setPlatforms(prev => prev.map(p =>
      p.name === platformName
        ? { ...p, status: 'Building', progress: 0, timestamp: 'Starting build...' }
        : p
    ));
  };

  const loadMoreActivity = () => {
    const newActivities: ActivityItem[] = [
      { id: Date.now().toString(), type: 'review', title: 'Code review completed on', highlight: 'PR #398', subtitle: '3 hours ago - Repository: frontend', icon: 'rate_review', iconBg: 'bg-emerald-600/20 border-emerald-500/30' },
      { id: (Date.now() + 1).toString(), type: 'alert', title: 'Memory spike detected in', highlight: 'worker-node-3', subtitle: '4 hours ago - Auto-scaled', icon: 'warning', iconBg: 'bg-amber-600/20 border-amber-500/30' },
    ];
    setActivities(prev => [...prev, ...newActivities]);
  };

  return (
    <div className="flex-1 bg-zinc-950 overflow-y-auto p-8 font-sans">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 uppercase tracking-tight">Project Manganese</h1>
          <p className="text-zinc-400 text-sm font-medium flex items-center gap-2">
            <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Global Infrastructure Monitor • Cluster: us-east-1
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefreshMetrics}
            disabled={isRefreshing}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-zinc-300 rounded-lg text-sm font-bold transition-all border border-zinc-800 flex items-center gap-2"
          >
            <span className={`material-symbols-rounded text-sm ${isRefreshing ? 'animate-spin' : ''}`}>
              {isRefreshing ? 'refresh' : 'analytics'}
            </span>
            {isRefreshing ? 'Refreshing...' : 'Performance Insights'}
          </button>
          <button
            onClick={handleTriggerPipeline}
            disabled={isPipelineRunning}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <span className={`material-symbols-rounded text-sm ${isPipelineRunning ? 'animate-pulse' : ''}`}>rocket_launch</span>
            {isPipelineRunning ? 'Running...' : 'Trigger Pipeline'}
          </button>
          <a
            href="https://magstack.rf.gd/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-sm font-bold transition-all border border-zinc-800 flex items-center gap-2"
          >
            <span className="material-symbols-rounded text-sm">hub</span>
            Open MagStack
          </a>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((m, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl shadow-lg relative overflow-hidden group hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-start mb-2 relative z-10">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{m.label}</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                m.trend === 'up' ? 'text-emerald-400 bg-emerald-400/10' : 
                m.trend === 'down' ? 'text-blue-400 bg-blue-400/10' : 'text-zinc-400 bg-zinc-400/10'
              }`}>
                {m.change > 0 ? '+' : ''}{m.change}%
                <span className="material-symbols-rounded text-[12px]">
                  {m.trend === 'up' ? 'trending_up' : m.trend === 'down' ? 'trending_down' : 'remove'}
                </span>
              </span>
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-white tracking-tight">{m.value}</h3>
              <p className="text-[10px] text-zinc-500 mt-1">{m.subtext}</p>
            </div>
            
            {/* Sparkline Decorative Effect */}
            <div className="absolute bottom-0 left-0 right-0 h-12 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                    <path d="M0,40 L10,35 L20,38 L30,20 L40,25 L50,10 L60,15 L70,5 L80,12 L90,8 L100,20 L100,40 Z" fill="currentColor" className={m.trend === 'up' ? 'text-emerald-500' : 'text-indigo-500'} />
                </svg>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team Velocity Chart Section */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Iteration Velocity</h3>
                <p className="text-xl font-bold text-white">Sprint 24 Analysis</p>
              </div>
              <div className="flex gap-4">
                <span className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase">
                  <span className="size-2 rounded-full bg-indigo-500"></span> Deployment Frequency
                </span>
                <span className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase">
                  <span className="size-2 rounded-full bg-zinc-600"></span> Rollback Rate
                </span>
              </div>
            </div>
            
            <div className="h-48 w-full">
              <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,100 Q50,80 100,110 T200,60 T300,90 T400,40 T500,70 L500,150 L0,150 Z" fill="url(#velocityGradient)" />
                <path d="M0,100 Q50,80 100,110 T200,60 T300,90 T400,40 T500,70" fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
                <path d="M0,130 Q50,120 100,125 T200,115 T300,120 T400,110 T500,120" fill="none" stroke="#52525b" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex justify-between mt-4 px-2">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
                <span key={d} className="text-[10px] font-bold text-zinc-600">{d}</span>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Global Activity Feed</h3>
              <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Audit Logs</button>
            </div>
            <div className="divide-y divide-zinc-800/50 max-h-80 overflow-y-auto">
              {activities.map((activity) => (
                <div key={activity.id} className="p-4 flex gap-4 hover:bg-zinc-800/30 transition-colors">
                   <div className={`size-10 rounded-full ${activity.iconBg} border flex items-center justify-center shrink-0`}>
                      <span className={`material-symbols-rounded text-sm ${activity.type === 'merge' ? 'text-indigo-400' : activity.type === 'alert' ? 'text-amber-400' : activity.type === 'review' ? 'text-emerald-400' : 'text-zinc-400'}`}>{activity.icon}</span>
                   </div>
                   <div className="flex-1">
                      <p className="text-sm text-zinc-100 font-medium">
                        {activity.title} {activity.highlight && <span className="text-indigo-400">{activity.highlight}</span>}
                        {activity.type === 'merge' && <> into <span className="font-mono text-zinc-400 bg-zinc-950 px-1 rounded">main</span></>}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-tight">{activity.subtitle}</p>
                   </div>
                </div>
              ))}
            </div>
            <button onClick={loadMoreActivity} className="w-full py-3 text-center text-xs font-bold text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all uppercase tracking-widest">Load More Activity</button>
          </div>
        </div>

        {/* Platform Coverage / Health Sidebar */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Platform Artifacts</h3>
            <div className="space-y-4">
              {platforms.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 hover:border-zinc-700 transition-all relative overflow-hidden group cursor-pointer">
                  {p.progress !== undefined && (
                    <div className="absolute bottom-0 left-0 h-0.5 bg-indigo-500 transition-all duration-500" style={{ width: `${p.progress}%` }}></div>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                      <span className="material-symbols-rounded text-[24px]">{p.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-none">{p.name}</h4>
                      <p className={`text-[10px] mt-1.5 font-medium ${p.status === 'Failed' ? 'text-red-400' : 'text-zinc-500'}`}>
                        {p.version} • {p.timestamp}
                        {p.progress !== undefined && ` (${Math.round(p.progress)}%)`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.status === 'Failed' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRetryBuild(p.name); }}
                        className="px-2 py-1 text-[10px] font-bold text-amber-400 hover:text-amber-300 border border-amber-500/30 rounded hover:bg-amber-500/10 transition-colors"
                      >
                        Retry
                      </button>
                    )}
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight ${
                      p.status === 'Stable' ? 'bg-emerald-500/10 text-emerald-500' :
                      p.status === 'Building' ? 'bg-indigo-500/10 text-indigo-500 animate-pulse' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {p.status === 'Building' ? (
                        <span className="material-symbols-rounded text-[12px] animate-spin">sync</span>
                      ) : (
                        <span className={`size-1.5 rounded-full ${p.status === 'Stable' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      )}
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Hosting</h3>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Multi-host</span>
            </div>
            <div className="space-y-3">
              {hostingTargets.map((target) => (
                <div key={target.name} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-950/50 border border-zinc-800">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{target.name}</p>
                    <p className="text-[10px] text-zinc-500 mt-1">{target.note}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${roleStyles[target.role]}`}>
                      {roleLabels[target.role]}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${statusStyles[target.status]}`}>
                      {statusLabels[target.status]}
                    </span>
                    {target.url ? (
                      <a
                        href={target.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-zinc-700 text-zinc-300 hover:text-white hover:border-emerald-500/60 hover:bg-zinc-900 transition-all"
                      >
                        Open
                      </a>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-zinc-800 text-zinc-500">
                        Set URL
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Stores: Google Drive</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Other providers</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {hostingAlternates.map((name) => (
                  <span key={name} className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-zinc-950/60 border border-zinc-800 text-zinc-500">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions / Controls */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Infrastructure Control</h3>
            <div className="space-y-4">
               <div className="p-4 bg-zinc-950/50 rounded-lg border border-zinc-800">
                  <div className="flex justify-between text-[11px] font-bold text-zinc-500 uppercase mb-2">
                    <span>CPU Availability</span>
                    <span className={`${cpuUsage > 80 ? 'text-red-400' : cpuUsage > 60 ? 'text-amber-400' : 'text-zinc-300'}`}>{Math.round(cpuUsage)}% Utilization</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all duration-1000 ${cpuUsage > 80 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : cpuUsage > 60 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`} style={{ width: `${cpuUsage}%` }}></div>
                  </div>
               </div>
               <div className="p-4 bg-zinc-950/50 rounded-lg border border-zinc-800">
                  <div className="flex justify-between text-[11px] font-bold text-zinc-500 uppercase mb-2">
                    <span>Heap Memory</span>
                    <span className={`${memoryUsage > 85 ? 'text-red-400' : memoryUsage > 70 ? 'text-amber-400' : 'text-zinc-300'}`}>{Math.round(memoryUsage)}% Usage</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all duration-1000 ${memoryUsage > 85 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'}`} style={{ width: `${memoryUsage}%` }}></div>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-800">
                  <button onClick={() => handleInfraAction('edge')} className="py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-[10px] font-bold text-zinc-400 hover:text-white uppercase tracking-widest transition-all">Invalidate Edge</button>
                  <button onClick={() => handleInfraAction('pods')} className="py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-[10px] font-bold text-zinc-400 hover:text-white uppercase tracking-widest transition-all">Cycle Pods</button>
                  <button onClick={() => handleInfraAction('rollback')} className="py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-[10px] font-bold text-zinc-400 hover:text-white uppercase tracking-widest transition-all">Rollback</button>
                  <button onClick={() => handleInfraAction('ssh')} className="py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-[10px] font-bold text-zinc-400 hover:text-white uppercase tracking-widest transition-all">SSH Access</button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
