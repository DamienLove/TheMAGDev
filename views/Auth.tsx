import React, { useState } from 'react';

interface AuthProps {
  onLogin: () => void;
}

type AuthMode = 'LOGIN' | 'SIGNUP' | 'RESET';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate secure authentication handshake and JWT acquisition
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (mode === 'RESET') {
      alert('Password reset link sent to your corporate email.');
      setMode('LOGIN');
      setLoading(false);
      return;
    }

    // Secure session initialization
    const secureToken = btoa(`${email}:${Date.now()}`); // Mock JWT
    sessionStorage.setItem('nexus_auth_token', secureToken);
    
    setLoading(false);
    onLogin();
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex items-center justify-center relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/5 blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-[400px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden flex flex-col mx-4">
        {/* Header Section */}
        <div className="pt-8 pb-4 px-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-5">
            <span className="material-symbols-rounded text-white text-3xl">deployed_code</span>
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight mb-2">
            {mode === 'LOGIN' && 'Sign in to Nexus'}
            {mode === 'SIGNUP' && 'Create Workspace'}
            {mode === 'RESET' && 'Reset Access'}
          </h1>
          <p className="text-zinc-400 text-sm">
            {mode === 'LOGIN' && 'Standardized cloud-native development environment.'}
            {mode === 'SIGNUP' && 'Provision your multi-tenant developer workspace.'}
            {mode === 'RESET' && 'Recover your platform credentials.'}
          </p>
        </div>

        {mode === 'LOGIN' && (
          <div className="px-6 py-4 flex flex-col gap-3 border-b border-zinc-800/50">
            <button 
              onClick={onLogin}
              className="group flex w-full items-center justify-center rounded-lg h-11 px-4 bg-[#24292F] hover:bg-[#2c323a] text-white transition-all duration-200"
            >
              <span className="material-symbols-rounded mr-3 text-[20px]">terminal</span>
              <span className="text-sm font-semibold tracking-wide">Continue with GitHub</span>
            </button>
            <button 
              onClick={onLogin}
              className="group flex w-full items-center justify-center rounded-lg h-11 px-4 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white transition-all duration-200"
            >
              <span className="material-symbols-rounded mr-3 text-[20px]">public</span>
              <span className="text-sm font-semibold tracking-wide">Single Sign-On (SSO)</span>
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
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Work Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <span className="material-symbols-rounded text-[18px]">mail</span>
                </div>
                <input 
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
                  <label className="text-xs font-bold text-zinc-500 uppercase">Credential</label>
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
        </div>
      </div>
    </div>
  );
};

export default Auth;