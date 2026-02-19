import React, { useState, useEffect, useMemo } from 'react';
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
import Settings from './views/Settings';
import ExtensionMarketplace from './views/ExtensionMarketplace';
import SDKManager from './views/SDKManager';
import PopoutModule from './views/PopoutModule';
import LoadingScreen from './src/components/LoadingScreen';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { WorkspaceProvider } from './src/components/workspace';
import './src/services/ModuleRegistryService';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { UserProfile } from './src/services/userProfile';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [autoAuthShown, setAutoAuthShown] = useState(false);
  const [pendingPaywall, setPendingPaywall] = useState(false);
  const [authIntent, setAuthIntent] = useState<'general' | 'pro'>('general');
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Firebase auth session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setIsAuthenticated(Boolean(user));
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authLoading) return;
    const timer = setTimeout(() => {
      setAuthLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [authLoading]);

  useEffect(() => {
    if (!authUser) {
      setUserProfile(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    const ref = doc(db, 'users', authUser.uid);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        setUserProfile(snap.exists() ? ({ ...(snap.data() as UserProfile), uid: authUser.uid } as UserProfile) : null);
        setProfileLoading(false);
      },
      () => setProfileLoading(false)
    );
    return () => unsubscribe();
  }, [authUser]);

  useEffect(() => {
    if (!profileLoading) return;
    const timer = setTimeout(() => {
      setProfileLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [profileLoading]);

  useEffect(() => {
    if (authLoading || profileLoading) return;
    if (!isAuthenticated && !autoAuthShown) {
      setShowAuth(true);
      setAutoAuthShown(true);
    }
  }, [authLoading, profileLoading, isAuthenticated, autoAuthShown]);

  const handleLogout = () => {
    sessionStorage.removeItem('themag_auth_token');
    signOut(auth);
    setIsAuthenticated(false);
  };

  const openAuth = (intent: 'general' | 'pro' = 'general') => {
    setAuthIntent(intent);
    setShowAuth(true);
  };

  const closeAuth = () => {
    setShowAuth(false);
    setPendingPaywall(false);
    setAuthIntent('general');
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuth(false);
    if (authIntent === 'pro') {
      setPendingPaywall(true);
    }
    setAuthIntent('general');
  };

  useEffect(() => {
    if (!pendingPaywall) return;
    if (authLoading || profileLoading) return;
    setPendingPaywall(false);
  }, [pendingPaywall, authLoading, profileLoading]);

  const isAdmin = Boolean(userProfile?.isAdmin || userProfile?.role === 'admin');
  const effectiveIsPro = Boolean(userProfile?.isPro || userProfile?.plan === 'pro' || isAdmin);

  const displayName = userProfile?.displayName || authUser?.displayName || authUser?.email || 'Engineer';
  const displayAvatar = useMemo(() => {
    const value = displayName || 'User';
    const parts = value.split(/[^\w]+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    const initials = parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('');
    return initials || value.slice(0, 2).toUpperCase();
  }, [displayName]);

  const isGuest = !isAuthenticated;
  const userLabel = isGuest ? 'Guest' : displayName;
  const userAvatar = isGuest ? 'G' : displayAvatar;

  if (authLoading || profileLoading) {
    return <LoadingScreen />;
  }

  const handleRestrictedAccess = (view: View) => {
    // Allow access to all views for showcase purposes
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case View.Dashboard: return <Dashboard />;
      case View.Projects: return <Projects onNavigate={handleRestrictedAccess} />;
      case View.Editor: return <CodeEditor />;
      case View.Desktop: return <DesktopWorkspace onNavigate={handleRestrictedAccess} />;
      case View.Design: return <DesignStudio />;
      case View.Build: return <BuildSystem />;
      case View.Analytics: return <Analytics />;
      case View.Marketplace: return <Marketplace />;
      case View.Infrastructure: return <Infrastructure />;
      case View.Support: return <CommunitySupport />;
      case View.Extensions: return <ExtensionMarketplace />;
      case View.SDKs: return <SDKManager />;
      case View.Settings: return <Settings />;
      default: return null;
    }
  };

  return (
    <AppLayout
      currentView={currentView}
      onChangeView={handleRestrictedAccess}
      user={{ name: userLabel, avatar: userAvatar }}
      badges={{ isPro: effectiveIsPro, isAdmin }}
      auth={{ isAuthenticated, onLogin: openAuth, onLogout: handleLogout }}
    >
      {renderView()}
      {showAuth && (
        <div className="fixed inset-0 z-50">
          <Auth
            onLogin={handleAuthSuccess}
            onClose={closeAuth}
            intent={authIntent}
          />
        </div>
      )}
    </AppLayout>
  );
};

const App: React.FC = () => {
  const popoutModule = new URLSearchParams(window.location.search).get('popout');
  return (
    <SettingsProvider>
      <WorkspaceProvider>
        {popoutModule ? <PopoutModule moduleId={popoutModule} /> : <AppContent />}
      </WorkspaceProvider>
    </SettingsProvider>
  );
};

export default App;
