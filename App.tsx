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
import Paywall from './components/Paywall';
import { useRevenueCat } from './src/hooks/useRevenueCat';
import LoadingScreen from './src/components/LoadingScreen';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { UserProfile } from './src/services/userProfile';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // RevenueCat Integration
  const { isPro, currentOffering, purchasePackage, loading: rcLoading } = useRevenueCat();

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

  const isAdmin = Boolean(userProfile?.isAdmin || userProfile?.role === 'admin');
  const profileIsPro = Boolean(userProfile?.isPro || userProfile?.plan === 'pro' || isAdmin);
  const effectiveIsPro = Boolean(profileIsPro || isPro);

  const displayName = userProfile?.displayName || authUser?.displayName || authUser?.email || 'Engineer';
  const displayAvatar = useMemo(() => {
    const value = displayName || 'User';
    const parts = value.split(/[^\w]+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    const initials = parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('');
    return initials || value.slice(0, 2).toUpperCase();
  }, [displayName]);

  if (rcLoading || authLoading || profileLoading) {
    return <LoadingScreen />;
  }

  const handleLogout = () => {
    sessionStorage.removeItem('themag_auth_token');
    signOut(auth);
    setIsAuthenticated(false);
  };

  const handleRestrictedAccess = (view: View) => {
    // Example: Restrict 'Desktop' and 'Build' to Pro users
    if ((view === View.Desktop || view === View.Build) && !effectiveIsPro) {
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
      case View.Extensions: return <ExtensionMarketplace />;
      case View.Settings: return <Settings />;
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
      user={{ name: displayName, avatar: displayAvatar }}
      badges={{ isPro: effectiveIsPro, isAdmin }}
    >
        {renderView()}
        {showPaywall && !effectiveIsPro && (
          <Paywall
            packages={currentOffering}
            onPurchase={purchasePackage}
            onClose={() => setShowPaywall(false)}
          />
        )}
    </AppLayout>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
};

export default App;
