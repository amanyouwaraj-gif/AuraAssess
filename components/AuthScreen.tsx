
import React, { useState } from 'react';
import { dbService } from '../services/dbService';
import { User } from '../types';

interface AuthScreenProps {
  onAuthenticated: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'selection' | 'login' | 'signup'>('selection');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setError(null);
    try {
      const user = mode === 'login' 
        ? await dbService.login(email, password)
        : await dbService.signup(email, password);
      onAuthenticated(user);
    } catch (err: any) {
      setError(err.message || "Auth protocol failure.");
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'selection') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
        <div className="w-full max-w-4xl animate-in fade-in zoom-in duration-1000">
          <div className="text-center mb-16">
            <h1 className="text-8xl font-black tracking-tighter mb-4 bg-gradient-to-br from-white via-indigo-100 to-indigo-500 bg-clip-text text-transparent italic drop-shadow-2xl">
              AuraAssess
            </h1>
            <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]">Tier-1 Competitive Calibration & DNA Persistence</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <button 
              onClick={() => setMode('login')}
              className="group p-12 rounded-[4rem] bg-slate-900/40 border border-slate-800/50 hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all text-left shadow-2xl relative overflow-hidden backdrop-blur-3xl"
            >
              <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg className="w-48 h-48 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
              </div>
              <h2 className="text-4xl font-black text-white mb-3">Login</h2>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10">Access your historical performance data and resume calibration traces.</p>
              <div className="inline-flex items-center gap-3 text-indigo-400 font-black text-xs uppercase tracking-widest border-b-2 border-indigo-400/20 pb-1 group-hover:border-indigo-400 transition-all">
                Authenticate Session
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
            </button>

            <button 
              onClick={() => setMode('signup')}
              className="group p-12 rounded-[4rem] bg-indigo-600 shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all text-left relative overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-48 h-48 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              </div>
              <h2 className="text-4xl font-black text-white mb-3">Register</h2>
              <p className="text-indigo-50 text-sm font-medium leading-relaxed mb-10">Initialize a new secure logic cluster and start your DNA verification.</p>
              <div className="inline-flex items-center gap-3 text-white font-black text-xs uppercase tracking-widest border-b-2 border-white/30 pb-1 group-hover:border-white transition-all">
                Provision Identity
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
            </button>
          </div>

          <div className="mt-20 flex items-center justify-center gap-8 opacity-30 grayscale hover:grayscale-0 transition-all">
             <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Infrastructure by Neon</span>
             <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
             <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">AWS Central-Core-1</span>
             <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
             <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">E2E Encrypted</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black">
      <div className="w-full max-w-md animate-in slide-in-from-bottom-8 duration-700">
        <button 
          onClick={() => setMode('selection')}
          className="mb-10 text-slate-600 hover:text-indigo-400 transition-colors flex items-center gap-3 text-[10px] font-black uppercase tracking-widest group"
        >
          <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          Return to Hub
        </button>

        <div className="bg-slate-900/40 border border-slate-800 backdrop-blur-3xl rounded-[3rem] p-12 shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
          
          <h2 className="text-4xl font-black text-white mb-2">{mode === 'login' ? 'Authorize' : 'Initialize'}</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-12">{mode === 'login' ? 'Security Protocol V.4' : 'Cloud Identity Provisioning'}</p>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Identity Vector (Email)</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-slate-800 rounded-2xl px-6 py-5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-800 font-medium"
                placeholder="architect@aura.io"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Security Token (Password)</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-slate-800 rounded-2xl px-6 py-5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-800 font-medium"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full font-black py-6 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50 text-xs uppercase tracking-[0.2em] ${mode === 'login' ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'}`}
            >
              {isLoading ? 'Verifying...' : mode === 'login' ? 'Establish Session' : 'Commit New DNA'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
