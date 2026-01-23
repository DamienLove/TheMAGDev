import React from 'react';

const Marketplace: React.FC = () => {
  const extensions = [
    {
      name: 'Flutter Support',
      author: 'Dart Team',
      installs: '4.2M',
      desc: 'Debugging and IntelliSense for Flutter development.',
      icon: 'flutter_dash',
      color: 'bg-blue-500'
    },
    {
      name: 'Python Pro',
      author: 'Microsoft',
      installs: '12M',
      desc: 'Rich support for the Python language including data science tools.',
      icon: 'code', // Using generic code icon for python
      color: 'bg-yellow-500'
    },
    {
      name: 'GitHub Copilot',
      author: 'GitHub',
      installs: '8.5M',
      desc: 'Your AI pair programmer.',
      icon: 'smart_toy',
      color: 'bg-slate-700'
    },
    {
      name: 'Docker Explorer',
      author: 'Docker Inc.',
      installs: '5.1M',
      desc: 'Manage Docker Containers, Images, and Registries.',
      icon: 'dns',
      color: 'bg-sky-600'
    },
    {
      name: 'Tailwind CSS',
      author: 'Brad Cornes',
      installs: '3.8M',
      desc: 'Intelligent Tailwind CSS tooling.',
      icon: 'brush',
      color: 'bg-teal-500'
    },
    {
      name: 'Material Theme',
      author: 'Equinusocio',
      installs: '6M',
      desc: 'The most epic theme for Nexus IDE.',
      icon: 'palette',
      color: 'bg-emerald-500'
    }
  ];

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Extension Marketplace</h1>
          <div className="relative max-w-xl">
            <span className="material-symbols-rounded absolute left-3 top-2.5 text-slate-400">search</span>
            <input 
              type="text" 
              placeholder="Search extensions..." 
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </header>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {extensions.map((ext, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${ext.color} flex items-center justify-center text-white shadow-lg`}>
                    <span className="material-symbols-rounded" style={{ fontSize: '28px' }}>{ext.icon}</span>
                  </div>
                  <button className="px-3 py-1.5 bg-slate-800 text-indigo-400 text-sm font-medium rounded-lg hover:bg-indigo-600 hover:text-white transition-colors">
                    Install
                  </button>
                </div>
                <h3 className="font-bold text-white text-lg">{ext.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 mb-3">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-rounded text-[14px]">person</span> {ext.author}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-rounded text-[14px]">download</span> {ext.installs}
                  </span>
                </div>
                <p className="text-sm text-slate-400 line-clamp-2">{ext.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;