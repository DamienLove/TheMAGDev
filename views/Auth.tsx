import React, { useMemo, useState } from 'react';
import { GithubAuthProvider, GoogleAuthProvider, OAuthProvider, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { ensureUserProfile } from '../src/services/userProfile';

interface AuthProps {
  onLogin: () => void;
  onClose?: () => void;
  intent?: 'general' | 'pro';
}

type AuthMode = 'LOGIN' | 'SIGNUP' | 'RESET';

const Auth: React.FC<AuthProps> = ({ onLogin, onClose, intent = 'general' }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const intentCopy = useMemo(() => {
    if (intent === 'pro') {
      return 'Sign in to unlock Pro features and launch a dedicated VM workspace.';
    }
    return 'Sign in to sync your workspace, preferences, and billing state.';
  }, [intent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setErrorMessage('');
    if (mode === 'RESET') {
      try {
        await sendPasswordResetEmail(auth, email);
        alert('Password reset link sent to your email.');
        setMode('LOGIN');
        return;
      } catch (error: any) {
        setErrorMessage(error?.message || 'Failed to send password reset email.');
        return;
      } finally {
        setLoading(false);
      }
    }

    try {
      if (mode === 'SIGNUP') {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await ensureUserProfile(credential.user);
        const token = await credential.user.getIdToken();
        sessionStorage.setItem('themag_auth_token', token);
        onLogin();
      } else {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        await ensureUserProfile(credential.user);
        const token = await credential.user.getIdToken();
        sessionStorage.setItem('themag_auth_token', token);
        onLogin();
      }
    } catch (error: any) {
      setErrorMessage(error?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderLogin = async (provider: GithubAuthProvider | GoogleAuthProvider | OAuthProvider) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const credential = await signInWithPopup(auth, provider);
      await ensureUserProfile(credential.user);
      const token = await credential.user.getIdToken();
      sessionStorage.setItem('themag_auth_token', token);
      onLogin();
    } catch (error: any) {
      setErrorMessage(error?.message || 'OAuth sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const providers = [
    {
      id: 'google',
      label: 'Continue with Google',
      style: 'bg-white text-zinc-900 hover:bg-zinc-200',
      provider: new GoogleAuthProvider(),
      icon: 'language'
    },
    {
      id: 'github',
      label: 'Continue with GitHub',
      style: 'bg-[#24292F] text-white hover:bg-[#2c323a]',
      provider: new GithubAuthProvider(),
      icon: 'terminal'
    },
    {
      id: 'microsoft',
      label: 'Continue with Microsoft',
      style: 'bg-blue-600 text-white hover:bg-blue-500',
      provider: new OAuthProvider('microsoft.com'),
      icon: 'windows'
    },
    {
      id: 'apple',
      label: 'Continue with Apple',
      style: 'bg-black text-white hover:bg-zinc-900',
      provider: new OAuthProvider('apple.com'),
      icon: 'phone_iphone'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex items-center justify-center relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/5 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-[400px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden flex flex-col mx-4">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-rounded">close</span>
          </button>
        )}
        {/* Header Section */}
        <div className="pt-8 pb-4 px-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-center shadow-lg shadow-indigo-500/10 mb-5">
            <img src="./branding/STLOGO.png" alt="TheMAG.dev" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight mb-2">
            {mode === 'LOGIN' && 'Sign in to TheMAG.dev'}
            {mode === 'SIGNUP' && 'Create Workspace'}
            {mode === 'RESET' && 'Reset Access'}
          </h1>
          <p className="text-zinc-400 text-sm">
            {mode === 'LOGIN' && 'Standardized cloud-native development environment.'}
            {mode === 'SIGNUP' && 'Provision your multi-tenant developer workspace.'}
            {mode === 'RESET' && 'Recover your platform credentials.'}
          </p>
          <p className="text-[11px] text-indigo-200/70 mt-3">{intentCopy}</p>
        </div>

        {mode === 'LOGIN' && (
          <div className="px-6 py-4 flex flex-col gap-3 border-b border-zinc-800/50">
            {providers.map((entry) => (
              <button
                key={entry.id}
                onClick={() => handleProviderLogin(entry.provider)}
                disabled={loading}
                className={`group flex w-full items-center justify-center rounded-lg h-11 px-4 transition-all duration-200 ${entry.style}`}
              >
                <span className="material-symbols-rounded mr-3 text-[20px]">{entry.icon}</span>
                <span className="text-sm font-semibold tracking-wide">{entry.label}</span>
              </button>
            ))}
            <button
              onClick={() => setErrorMessage('Enterprise SSO is not configured yet.')}
              disabled={loading}
              className="group flex w-full items-center justify-center rounded-lg h-11 px-4 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white transition-all duration-200"
            >
              <span className="material-symbols-rounded mr-3 text-[20px]">public</span>
              <span className="text-sm font-semibold tracking-wide">Enterprise SSO</span>
            </button>
          </div>
        )}

        <div className="px-6 py-2">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink-0 mx-4 text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Or authenticate via</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-8 flex flex-col gap-4">
          {errorMessage && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {errorMessage}
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-bold text-zinc-500 uppercase ml-1">Work Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <span className="material-symbols-rounded text-[18px]">mail</span>
                </div>
                <input 
                  id="email"
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="dev@enterprise.com"
                />
              </div>
            </div>

            {mode !== 'RESET' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label htmlFor="password" className="text-xs font-bold text-zinc-500 uppercase">Credential</label>
                  {mode === 'LOGIN' && (
                    <button 
                      type="button"
                      onClick={() => setMode('RESET')}
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Recovery?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <span className="material-symbols-rounded text-[18px]">lock</span>
                  </div>
                  <input 
                    id="password"
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="mt-2 w-full flex items-center justify-center rounded-lg bg-indigo-600 py-3 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 focus:outline-none transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Establishing Session...</span>
              </div>
            ) : (
              mode === 'LOGIN' ? 'Enter Workspace' : mode === 'SIGNUP' ? 'Initialize Environment' : 'Verify Recovery'
            )}
          </button>
        </form>

        <div className="bg-zinc-800/50 px-6 py-4 text-center border-t border-zinc-800">
          <p className="text-xs text-zinc-400">
            {mode === 'LOGIN' ? (
              <>New engineer? <button onClick={() => setMode('SIGNUP')} className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Request Access</button></>
            ) : (
              <button onClick={() => setMode('LOGIN')} className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Return to login gateway</button>
            )}
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-3 text-[11px] font-semibold text-zinc-500 hover:text-white transition-colors"
            >
              Continue as guest
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
