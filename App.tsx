import React, { useState, useEffect } from 'react';
import AppLayout from './components/AppLayout';
import { View } from './types';
import Dashboard from './views/Dashboard';
import CodeEditor from './views/CodeEditor';
import DesignStudio from './views/DesignStudio';
import BuildSystem from './views/BuildSystem';
import Analytics from './views/Analytics';
import Marketplace from './views/Marketplace';
import Infrastructure from './views/Infrastructure';
import CommunitySupport from './views/CommunitySupport';
import DesktopWorkspace from './views/DesktopWorkspace';
import Projects from './views/Projects';
import Auth from './views/Auth';
import Paywall from './components/Paywall';
import { useRevenueCat } from './src/hooks/useRevenueCat';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  
  // RevenueCat Integration
  const { isPro, currentOffering, purchasePackage, loading: rcLoading } = useRevenueCat();

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

  const handleRestrictedAccess = (view: View) => {
    // Example: Restrict 'Desktop' and 'Build' to Pro users
    if ((view === View.Desktop || view === View.Build) && !isPro) {
      setShowPaywall(true);
    } else {
      setCurrentView(view);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case View.Dashboard: return <Dashboard />;
      case View.Projects: return <Projects />;
      case View.Editor: return <CodeEditor />;
      case View.Desktop: return <DesktopWorkspace />;
      case View.Design: return <DesignStudio />;
      case View.Build: return <BuildSystem />;
      case View.Analytics: return <Analytics />;
      case View.Marketplace: return <Marketplace />;
      case View.Infrastructure: return <Infrastructure />;
      case View.Support: return <CommunitySupport />;
      case View.Settings:
        return (
          <div className="flex-1 p-8 bg-zinc-950 text-white">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-2xl mb-6">
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
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-2xl">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  Subscription 
                  {isPro && <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded">PRO</span>}
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  {isPro ? "You have full access to TheMAG.dev Pro features." : "Upgrade to unlock Build Systems and Desktop Workspace."}
                </p>
                {!isPro && (
                  <button 
                    onClick={() => setShowPaywall(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                  >
                    Upgrade Now
                  </button>
                )}
            </div>
          </div>
        );
      default: return null;
    }
  };

  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <AppLayout 
      currentView={currentView} 
      onChangeView={handleRestrictedAccess}
      user={{ name: 'John Doe', avatar: 'JD' }}
    >
        {renderView()}
        {showPaywall && (
          <Paywall 
            packages={currentOffering} 
            onPurchase={purchasePackage}
            onClose={() => setShowPaywall(false)} 
          />
        )}
    </AppLayout>
  );
};

export default App;