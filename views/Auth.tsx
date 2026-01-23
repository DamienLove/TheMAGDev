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
    
    // Simulate network delay and secure processing (hashing, salting, encryption)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (mode === 'RESET') {
      alert('Password reset link sent to your email.');
      setMode('LOGIN');
      setLoading(false);
      return;
    }

    // Simulate secure storage
    const secureToken = btoa(`${email}:${Date.now()}`); // Mock token
    sessionStorage.setItem('nexus_auth_token', secureToken);
    
    setLoading(false);
    onLogin();
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10 mx-4">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
            <span className="material-symbols-rounded text-white text-3xl">deployed_code</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-1">
          {mode === 'LOGIN' && 'Welcome Back'}
          {mode === 'SIGNUP' && 'Create Account'}
          {mode === 'RESET' && 'Reset Password'}
        </h2>
        <p className="text-slate-400 text-center text-sm mb-8">
          {mode === 'LOGIN' && 'Enter your credentials to access the IDE.'}
          {mode === 'SIGNUP' && 'Join thousands of developers building on Nexus.'}
          {mode === 'RESET' && 'We will send you a recovery link.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="name@company.com"
            />
          </div>

          {mode !== 'RESET' && (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="••••••••••••"
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              mode === 'LOGIN' ? 'Sign In' : mode === 'SIGNUP' ? 'Create Account' : 'Send Reset Link'
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          {mode === 'LOGIN' ? (
            <>
              <button onClick={() => setMode('SIGNUP')} className="text-slate-400 hover:text-white transition-colors">Create account</button>
              <button onClick={() => setMode('RESET')} className="text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</button>
            </>
          ) : (
            <button onClick={() => setMode('LOGIN')} className="text-slate-400 hover:text-white transition-colors w-full text-center">Back to Sign In</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;