
import React, { useState } from 'react';
import { PositionLevel, UserHistory, User, ExamSession } from '../types';
import { COMPANIES } from '../constants';

interface SetupScreenProps {
  onStart: (company: string, role: string, level: PositionLevel) => void;
  onViewHistory: (session: ExamSession) => void;
  history: UserHistory;
  user: User;
  onLogout: () => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, history, user, onLogout, onViewHistory }) => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Software Development Engineer');
  const [level, setLevel] = useState<PositionLevel>(PositionLevel.SDE_1);

  const handleStart = () => {
    if (!company.trim()) return alert("Enter a target company.");
    onStart(company, role, level);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-10">
        <div className="text-center md:text-left">
          <h1 className="text-5xl font-black tracking-tighter mb-2 bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            AuraAssess
          </h1>
          <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">Authenticated: {user.username}</p>
        </div>
        <button 
          onClick={onLogout}
          className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold hover:text-white transition-all uppercase tracking-widest"
        >
          Terminate Session
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section className="bg-slate-900/40 border border-slate-800 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl">
            <h2 className="text-xl font-bold mb-10 flex items-center gap-4">
              <span className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg text-lg text-white font-black">01</span>
              Configure Domain Probe
            </h2>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Target Entity (Company)</label>
                  <input 
                    type="text"
                    list="known-companies"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Google, Jane Street..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <datalist id="known-companies">
                    {COMPANIES.map(c => <option key={c.name} value={c.name} />)}
                  </datalist>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Functional Role</label>
                  <input 
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Experience Maturity Level</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.values(PositionLevel).map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setLevel(lvl)}
                      className={`px-4 py-5 rounded-2xl border text-xs font-black transition-all ${
                        level === lvl 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/10' 
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-900'
                      }`}
                    >
                      {lvl.split(' / ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStart}
                className="w-full mt-10 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black py-6 px-8 rounded-3xl transition-all shadow-2xl flex items-center justify-center gap-4 text-xl"
              >
                Synthesize Domain Assessment
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
            <h2 className="text-xs font-black mb-8 text-indigo-400 uppercase tracking-widest flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
              Career Trend DNA
            </h2>
            
            {history.sessions.length === 0 ? (
              <div className="py-12 text-center">
                 <div className="w-12 h-12 bg-slate-800/50 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-slate-700">
                    <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <p className="text-slate-500 italic text-xs px-6 leading-relaxed">No data detected in the Neon PostgreSQL cluster yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-indigo-500/5 p-6 rounded-3xl border border-indigo-500/10 text-center">
                  <div className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-[0.2em]">Aggregated Readiness</div>
                  <div className="text-5xl font-black text-white">{history.averageReadiness}%</div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2 mb-4">Past Analysis Sessions</div>
                  {history.sessions.map((s, i) => (
                    <button 
                      key={s.exam.id} 
                      onClick={() => onViewHistory(s)}
                      className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl flex justify-between items-center group hover:border-indigo-500/50 transition-all text-left"
                    >
                      <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-tighter">{s.exam.company}</div>
                        <div className="text-xs font-bold text-slate-200">{s.exam.role.slice(0, 18)}...</div>
                        <div className="text-[9px] text-slate-600 mt-1">{new Date(s.exam.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-black ${s.results!.readinessScore >= 80 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                          {s.results?.readinessScore}%
                        </div>
                        <div className="text-[8px] font-black text-slate-600 uppercase">Score</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <div className="p-8 rounded-[2.5rem] bg-indigo-600/5 border border-indigo-600/10">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Sync Status</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Your exam data is securely anchored to our Neon PostgreSQL database. Logic patterns and solutions are decrypted only for your session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
