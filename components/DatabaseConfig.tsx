
import React, { useState } from 'react';
import { setDbRuntimeUrl } from '../services/dbService';

interface DatabaseConfigProps {
  onConfigured: () => void;
}

const DatabaseConfig: React.FC<DatabaseConfigProps> = ({ onConfigured }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.startsWith('postgres')) {
      alert("Invalid Connection Protocol. URL must start with 'postgres://'");
      return;
    }
    setIsLoading(true);
    setDbRuntimeUrl(url);
    onConfigured();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-black to-black">
      <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-1000">
        <div className="text-center mb-12">
           <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-indigo-600/40 rotate-3">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4" /></svg>
           </div>
           <h1 className="text-4xl font-black text-white italic tracking-tighter mb-4">Infrastructure Setup Required</h1>
           <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Neon PostgreSQL Persistence Layer</p>
        </div>

        <div className="bg-slate-900/40 border border-white/5 backdrop-blur-3xl rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
             <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          </div>

          <p className="text-slate-300 mb-10 leading-relaxed font-medium">
            AuraAssess requires a <strong>Neon.tech</strong> PostgreSQL connection to archive your assessment DNA and practice traces. Since the environment variable is missing, please provide a connection string for this session.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Neon Connection String</label>
              <input 
                type="password" 
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="postgres://user:pass@ep-cool-name.aws.neon.tech/neondb"
                className="w-full bg-black border border-white/5 rounded-2xl px-6 py-5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm"
              />
              <div className="flex justify-between px-2">
                 <span className="text-[9px] text-slate-600 italic">Sensitive data is only stored in memory for this session.</span>
                 <a href="https://neon.tech" target="_blank" className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors">Get a free Neon DB</a>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-white text-black font-black py-6 rounded-3xl transition-all shadow-xl active:scale-95 disabled:opacity-50 text-xs uppercase tracking-widest hover:bg-indigo-400 hover:text-white"
            >
              {isLoading ? 'Establishing Protocol...' : 'Initialize Infrastructure'}
            </button>
          </form>

          <div className="mt-12 p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
             <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Protocol Note</h4>
             <p className="text-[11px] text-slate-500 leading-relaxed">
                To skip this screen in the future, add <strong>DATABASE_URL</strong> to your <code>.env</code> file or deployment environment variables.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseConfig;
