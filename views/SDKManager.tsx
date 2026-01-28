import React, { useState, useEffect } from 'react';
import { sdkService, SDK, SDKPlugin } from '../src/services/SDKService';

const SDKManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'platforms' | 'tools' | 'plugins'>('platforms');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Android');
  const [sdks, setSdks] = useState<SDK[]>([]);
  const [plugins, setPlugins] = useState<SDKPlugin[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [downloadingPluginId, setDownloadingPluginId] = useState<string | null>(null);

  const platforms = ['Android', 'iOS', 'Windows', 'Mac', 'Linux', 'Web'];

  const formatVersion = (version: string) => (/^\d/.test(version) ? `v${version}` : version);

  useEffect(() => {
    loadData();
    const unsubscribe = sdkService.onChange(() => loadData());
    return () => unsubscribe();
  }, [selectedPlatform]);

  const loadData = () => {
    setSdks(sdkService.getSDKs(selectedPlatform));
    setPlugins(sdkService.getPlugins());
  };

  const handleAction = async (sdk: SDK) => {
    setLoading(true);
    setProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    if (sdk.status === 'Update Available') {
      await sdkService.updateSDK(sdk.id);
    } else if (sdk.status === 'Not Installed') {
      await sdkService.installSDK(sdk.id);
    }

    setTimeout(() => {
      clearInterval(interval);
      setLoading(false);
      setProgress(null);
      loadData();
    }, 2000);
  };

  const handleRefresh = async () => {
    setLoading(true);
    await sdkService.checkForUpdates();
    loadData();
    setLoading(false);
  };

  const [showPluginModal, setShowPluginModal] = useState(false);
  const [newPluginUrl, setNewPluginUrl] = useState('');

  const handleAddPlugin = () => {
    if (newPluginUrl) {
      sdkService.addPlugin({
        id: `custom-${Date.now()}`,
        name: 'Custom Plugin',
        author: 'User Added',
        version: '1.0.0',
        description: `Source: ${newPluginUrl}`,
        installed: true
      });
      setNewPluginUrl('');
      setShowPluginModal(false);
      loadData();
    }
  };

  const handleDownloadPlugin = async (pluginId: string) => {
    setDownloadingPluginId(pluginId);
    const url = await sdkService.getPublicPluginBundleUrl(pluginId);
    if (url) {
      window.open(url, '_blank', 'noopener');
    } else {
      alert('Connect Google Drive to download plugin bundles.');
    }
    setDownloadingPluginId(null);
  };

  return (
    <div className="flex-1 bg-zinc-950 overflow-y-auto p-8 font-sans h-full flex flex-col relative">
      <header className="mb-6 flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 uppercase tracking-tight">SDK & Toolchain Manager</h1>
          <p className="text-zinc-400 text-sm">Manage build tools, platform SDKs, and third-party integrations.</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={handleRefresh}
             disabled={loading}
             className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
           >
             <span className={`material-symbols-rounded text-sm ${loading ? 'animate-spin' : ''}`}>refresh</span>
             Check for Updates
           </button>
           <button 
             onClick={() => setShowPluginModal(true)}
             className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
           >
             <span className="material-symbols-rounded text-sm">extension</span>
             Add Plugin source
           </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 mb-6 shrink-0">
        {platforms.map(p => (
          <button
            key={p}
            onClick={() => setSelectedPlatform(p)}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
              selectedPlatform === p 
                ? 'border-indigo-500 text-white' 
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {sdks.length === 0 ? (
           <div className="text-center py-20 text-zinc-500">
             <span className="material-symbols-rounded text-4xl mb-2">inventory_2</span>
             <p>No SDKs found for this platform.</p>
           </div>
        ) : (
          sdks.map(sdk => (
            <div key={sdk.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between group hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-4">
                <div className={`size-10 rounded-lg flex items-center justify-center ${
                  sdk.status === 'Installed' ? 'bg-indigo-500/10 text-indigo-400' :
                  sdk.status === 'Update Available' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-zinc-800 text-zinc-500'
                }`}>
                   <span className="material-symbols-rounded text-2xl">
                     {sdk.platform === 'Android' ? 'android' : sdk.platform === 'iOS' ? 'phone_iphone' : 'terminal'}
                   </span>
                </div>
                <div>
                  <h3 className="text-white font-bold">{sdk.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                    <span>{formatVersion(sdk.version)}</span>
                    <span>•</span>
                    <span>{sdk.size}</span>
                    <span>•</span>
                    <span>{sdk.source}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="text-right">
                    {sdk.status === 'Installed' && (
                       <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">Installed</span>
                    )}
                    {sdk.status === 'Update Available' && (
                       <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">Update Available</span>
                    )}
                    {sdk.status === 'Not Installed' && (
                       <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 text-[10px] font-bold uppercase tracking-wider border border-zinc-700">Not Installed</span>
                    )}
                 </div>
                 
                 {sdk.status !== 'Installed' ? (
                   <button 
                     onClick={() => handleAction(sdk)}
                     disabled={loading}
                     className="size-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                   >
                     <span className="material-symbols-rounded text-lg">download</span>
                   </button>
                 ) : (
                   <button className="size-8 rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-600 hover:text-red-400 transition-colors">
                     <span className="material-symbols-rounded text-lg">delete</span>
                   </button>
                 )}
              </div>
            </div>
          ))
        )}

        <div className="mt-8">
           <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Installed Plugins</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {plugins.map(plugin => (
               <div key={plugin.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                 <div className="flex justify-between items-start mb-2">
                   <h4 className="text-white font-bold text-sm">{plugin.name}</h4>
                   <span className="text-[10px] font-bold text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">{plugin.version}</span>
                 </div>
                 <p className="text-zinc-400 text-xs mb-3">{plugin.description}</p>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase">By {plugin.author}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadPlugin(plugin.id)}
                        disabled={downloadingPluginId === plugin.id}
                        className="text-xs text-zinc-300 hover:text-white font-bold disabled:opacity-50"
                      >
                        {downloadingPluginId === plugin.id ? 'Preparing...' : 'Download'}
                      </button>
                      <button className="text-xs text-red-400 hover:text-red-300 font-bold">Uninstall</button>
                    </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Progress Footer */}
      {progress !== null && (
        <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-50">
           <div className="h-1 bg-zinc-800 w-full">
              <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
           </div>
           <div className="px-6 py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <span className="size-2 rounded-full bg-indigo-500 animate-ping"></span>
                 <span className="text-xs font-bold text-white">Downloading components...</span>
              </div>
              <span className="text-xs font-mono text-zinc-500">{progress}%</span>
           </div>
        </div>
      )}

      {/* Add Plugin Modal */}
      {showPluginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
           <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Add Custom Plugin Repository</h3>
              <p className="text-sm text-zinc-400 mb-4">Enter the URL of the plugin manifest or git repository.</p>
              <input 
                type="text" 
                value={newPluginUrl}
                onChange={(e) => setNewPluginUrl(e.target.value)}
                placeholder="https://github.com/user/repo.git"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none mb-6"
              />
              <div className="flex justify-end gap-3">
                 <button 
                   onClick={() => setShowPluginModal(false)}
                   className="px-4 py-2 text-sm font-bold text-zinc-400 hover:text-white"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleAddPlugin}
                   className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg"
                 >
                   Add Source
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SDKManager;
