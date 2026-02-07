import React, { useState, useEffect } from 'react';
import webContainerService from '../src/services/WebContainerService';

interface BackendModule {
  name: string;
  status: 'Online' | 'Syncing' | 'Offline' | 'Config Required';
  icon: string;
}

interface BackendService {
  id: string;
  name: string;
  provider: string;
  project: string;
  status: 'Active' | 'Warning' | 'Disconnected';
  modules: BackendModule[];
  color: string;
  icon: string;
}

const DEFAULT_SERVICES: BackendService[] = [
    {
      id: 'firebase-1',
      name: 'Google Firebase',
      provider: 'GCP',
      project: 'themag-prod-v1',
      status: 'Active',
      color: 'text-orange-500',
      icon: 'local_fire_department',
      modules: [
        { name: 'Authentication', status: 'Online', icon: 'group' },
        { name: 'Firestore Database', status: 'Online', icon: 'database' },
        { name: 'Cloud Storage', status: 'Online', icon: 'folder' },
        { name: 'Cloud Functions', status: 'Online', icon: 'functions' }
      ]
    },
    {
      id: 'supabase-1',
      name: 'Supabase',
      provider: 'AWS/Self-Hosted',
      project: 'themag-edge-db',
      status: 'Warning',
      color: 'text-emerald-500',
      icon: 'bolt',
      modules: [
        { name: 'PostgreSQL', status: 'Syncing', icon: 'table_chart' },
        { name: 'Realtime Subscriptions', status: 'Online', icon: 'sensors' },
        { name: 'Edge Functions', status: 'Online', icon: 'terminal' }
      ]
    },
    {
      id: 'appwrite-1',
      name: 'Appwrite',
      provider: 'DigitalOcean',
      project: 'unmapped',
      status: 'Disconnected',
      color: 'text-pink-500',
      icon: 'terminal',
      modules: []
    }
  ];

const Infrastructure: React.FC = () => {
  const [services, setServices] = useState<BackendService[]>(() => {
    const saved = localStorage.getItem('themag_infrastructure');
    return saved ? JSON.parse(saved) : DEFAULT_SERVICES;
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState<Partial<BackendService>>({
      name: '',
      provider: '',
      project: ''
  });
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    localStorage.setItem('themag_infrastructure', JSON.stringify(services));
  }, [services]);

  const handleDeployTemplate = async (template: 'react' | 'node') => {
    setDeploying(true);
    try {
      if (!webContainerService.isReady()) {
        await webContainerService.boot();
      }

      if (template === 'react') {
        await webContainerService.mount({
          'package.json': {
            file: {
              contents: JSON.stringify({
                name: 'react-app',
                type: 'module',
                scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
                dependencies: { react: '^18.2.0', 'react-dom': '^18.2.0' },
                devDependencies: { '@vitejs/plugin-react': '^4.0.0', vite: '^4.3.0' }
              }, null, 2)
            }
          },
          'index.html': {
            file: {
              contents: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
            }
          },
          'src': {
            directory: {
              'main.jsx': {
                file: {
                  contents: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
                }
              },
              'App.jsx': {
                file: {
                  contents: `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
    </>
  )
}

export default App`
                }
              },
              'index.css': {
                file: { contents: `body { margin: 0; font-family: system-ui; }` }
              },
              'App.css': {
                file: { contents: `.card { padding: 2em; }` }
              }
            }
          }
        });
        alert('React template deployed to workspace! Open Terminal and run "npm install && npm run dev"');
      } else if (template === 'node') {
         await webContainerService.mount({
          'package.json': {
            file: {
              contents: JSON.stringify({
                name: 'node-api',
                type: 'module',
                scripts: { start: 'node index.js' },
                dependencies: { express: '^4.18.2' }
              }, null, 2)
            }
          },
          'index.js': {
            file: {
              contents: `import express from 'express';
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello from Node.js in the Browser!');
});

app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});`
            }
          }
        });
        alert('Node.js template deployed! Run "npm install && npm start"');
      }
    } catch (e: any) {
      alert('Failed to deploy template: ' + e.message);
    } finally {
      setDeploying(false);
    }
  };

  const handleAddService = () => {
    if (!newService.name || !newService.provider) return;

    const service: BackendService = {
        id: `custom-${Date.now()}`,
        name: newService.name,
        provider: newService.provider,
        project: newService.project || 'unconfigured',
        status: 'Active',
        color: 'text-indigo-500',
        icon: 'cloud',
        modules: []
    };

    setServices([...services, service]);
    setShowAddModal(false);
    setNewService({ name: '', provider: '', project: '' });
  };

  const removeService = (id: string) => {
      setServices(services.filter(s => s.id !== id));
  };

  return (
    <div className="flex-1 bg-zinc-950 overflow-y-auto p-8 font-sans relative">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 uppercase tracking-tight">Infrastructure Stack</h1>
          <p className="text-zinc-400 text-sm">Manage multi-cloud backend services and service mesh connectivity.</p>
        </div>
        <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <span className="material-symbols-rounded text-sm">add</span> Provision New Service
        </button>
      </header>

      {/* Quick Start Templates */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-tight">Quick Start Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleDeployTemplate('react')}
            disabled={deploying}
            className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:bg-zinc-800 hover:border-indigo-500/50 transition-all text-left group"
          >
            <div className="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <span className="material-symbols-rounded text-3xl">code</span>
            </div>
            <div>
              <h3 className="text-white font-bold">React + Vite</h3>
              <p className="text-zinc-400 text-xs mt-1">Modern frontend stack with HMR</p>
            </div>
            <span className="ml-auto material-symbols-rounded text-zinc-600 group-hover:text-white transition-colors">arrow_forward</span>
          </button>

          <button
            onClick={() => handleDeployTemplate('node')}
            disabled={deploying}
            className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:bg-zinc-800 hover:border-emerald-500/50 transition-all text-left group"
          >
            <div className="size-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <span className="material-symbols-rounded text-3xl">terminal</span>
            </div>
            <div>
              <h3 className="text-white font-bold">Node.js Express</h3>
              <p className="text-zinc-400 text-xs mt-1">Simple REST API starter</p>
            </div>
            <span className="ml-auto material-symbols-rounded text-zinc-600 group-hover:text-white transition-colors">arrow_forward</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col group relative">
             <button
                onClick={(e) => { e.stopPropagation(); removeService(service.id); }}
                className="absolute top-2 right-2 p-1 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove Service"
             >
                 <span className="material-symbols-rounded text-sm">close</span>
             </button>

            {/* Service Header */}
            <div className="p-5 border-b border-zinc-800/50 flex items-center justify-between hover:bg-zinc-800/30 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className={`size-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center ${service.color} shadow-lg group-hover:scale-105 transition-transform`}>
                  <span className="material-symbols-rounded text-3xl">{service.icon}</span>
                </div>
                <div>
                  <h3 className="text-white font-bold tracking-tight">{service.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`size-1.5 rounded-full ${
                      service.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 
                      service.status === 'Warning' ? 'bg-amber-500 animate-pulse' : 'bg-zinc-600'
                    }`}></span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">{service.project}</span>
                  </div>
                </div>
              </div>
              <span className="material-symbols-rounded text-zinc-600 group-hover:text-zinc-400 transition-colors">settings</span>
            </div>

            {/* Modules List */}
            <div className="flex-1 p-2">
              {service.modules.length > 0 ? (
                <div className="space-y-1">
                  {service.modules.map((mod, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 rounded-xl transition-colors group/mod cursor-pointer">
                      <span className="material-symbols-rounded text-zinc-500 group-hover/mod:text-indigo-400 transition-colors text-xl">{mod.icon}</span>
                      <p className="text-zinc-300 text-xs font-medium flex-1">{mod.name}</p>
                      {mod.status === 'Syncing' ? (
                        <span className="material-symbols-rounded text-indigo-500 text-sm animate-spin">sync</span>
                      ) : (
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{mod.status}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center space-y-4">
                  <p className="text-zinc-500 text-xs italic">No active modules connected to this instance.</p>
                  <button className="w-full py-2.5 rounded-xl border border-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all">Connect Provider API</button>
                </div>
              )}
            </div>

            {/* Service Footer / Quick Info */}
            <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-zinc-600 uppercase">Provider:</span>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{service.provider}</span>
               </div>
               <button className="text-[10px] font-bold text-indigo-400 hover:underline flex items-center gap-1">
                  Metrics <span className="material-symbols-rounded text-xs">open_in_new</span>
               </button>
            </div>
          </div>
        ))}

        {/* Upgrade / Pro Tip Card */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-900/40 to-indigo-600/10 p-6 border border-indigo-500/20 shadow-xl relative overflow-hidden group">
           <div className="absolute -top-10 -right-10 size-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                 <span className="material-symbols-rounded text-indigo-400">rocket_launch</span>
                 <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Enterprise Feature</span>
              </div>
              <p className="text-white text-base font-bold leading-tight mb-2">Automated Multi-Region Failover</p>
              <p className="text-indigo-200/60 text-xs leading-relaxed mb-6">Deploy cloud functions with zero-downtime traffic migration across 14+ global regions.</p>
              <button className="mt-auto w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 uppercase tracking-widest">Upgrade Workspace</button>
           </div>
        </div>
      </div>

      {showAddModal && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                  <h3 className="text-lg font-bold text-white mb-4">Provision New Service</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Service Name</label>
                          <input
                            type="text"
                            value={newService.name}
                            onChange={(e) => setNewService({...newService, name: e.target.value})}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none"
                            placeholder="My Backend Service"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Provider</label>
                          <select
                            value={newService.provider}
                            onChange={(e) => setNewService({...newService, provider: e.target.value})}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none"
                          >
                              <option value="">Select Provider...</option>
                              <option value="AWS">AWS</option>
                              <option value="GCP">Google Cloud Platform</option>
                              <option value="Azure">Azure</option>
                              <option value="DigitalOcean">DigitalOcean</option>
                              <option value="Vercel">Vercel</option>
                              <option value="Netlify">Netlify</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Project ID</label>
                          <input
                            type="text"
                            value={newService.project}
                            onChange={(e) => setNewService({...newService, project: e.target.value})}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none"
                            placeholder="project-id-123"
                          />
                      </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => setShowAddModal(false)}
                        className="px-4 py-2 text-zinc-400 hover:text-white text-sm font-bold"
                      >
                          Cancel
                      </button>
                      <button
                        onClick={handleAddService}
                        disabled={!newService.name || !newService.provider}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-bold"
                      >
                          Provision
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Infrastructure;
