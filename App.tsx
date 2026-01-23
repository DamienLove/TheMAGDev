import React, { useState, useEffect } from 'react';
import AppLayout from './components/AppLayout';
import { View } from './types';
import Dashboard from './views/Dashboard';
import CodeEditor from './views/CodeEditor';
import DesignStudio from './views/DesignStudio';
import Marketplace from './views/Marketplace';
import Infrastructure from './views/Infrastructure';
import CommunitySupport from './views/CommunitySupport';
import Projects from './views/Projects';
import Auth from './views/Auth';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session
  useEffect(() => {
    const token = sessionStorage.getItem('nexus_auth_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('nexus_auth_token');
    setIsAuthenticated(false);
  };

  const renderView = () => {
    switch (currentView) {
      case View.Dashboard:
        return <Dashboard />;
      case View.Projects:
        return <Projects />;
      case View.Editor:
        return <CodeEditor />;
      case View.Design:
        return <DesignStudio />;
      case View.Marketplace:
        return <Marketplace />;
      case View.Infrastructure:
        return <Infrastructure />;
      case View.Support:
        return <CommunitySupport />;
      case View.Settings:
        return (
          <div className="flex-1 p-8 bg-zinc-950 text-white">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-2xl">
                <h3 className="text-lg font-medium mb-4">Account</h3>
                <div className="flex items-center justify-between mb-6">
                   <div>
                       <p className="text-zinc-300">Current Session</p>
                       <p className="text-xs text-zinc-500">Active since {new Date().toLocaleTimeString()}</p>
                   </div>
                   <button 
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                    Log Out
                    </button>
                </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex-1 flex items-center justify-center bg-zinc-950 text-zinc-500">
            <div className="text-center">
              <span className="material-symbols-rounded text-6xl mb-4">construction</span>
              <p>This module is under development.</p>
            </div>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <AppLayout 
      currentView={currentView} 
      onChangeView={setCurrentView}
      user={{ name: 'John Doe', avatar: 'JD' }}
    >
        {renderView()}
    </AppLayout>
  );
};

export default App;