
import React, { useState, useEffect } from 'react';
import { UserHistory, PracticeStats } from '../types';
import { DSA_TOPICS } from '../constants';
import { dbService } from '../services/dbService';

interface PracticeHubProps {
  history: UserHistory;
  onStartPractice: (topic: string, difficulty: string) => void;
  onBack: () => void;
}

const PracticeHub: React.FC<PracticeHubProps> = ({ history, onStartPractice, onBack }) => {
  const [selectedTopic, setSelectedTopic] = useState(DSA_TOPICS[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  const [stats, setStats] = useState<PracticeStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await dbService.getPracticeStats();
      setStats(data);
    };
    fetchStats();
  }, [history]);

  const getDifficultyInsight = (diff: string) => {
    switch(diff) {
      case 'Easy': return "Direct logical paths. Focus on foundational syntax and standard implementation correctness.";
      case 'Medium': return "Analytical synthesis. Expect problems requiring concepts to be integrated with a logical twist.";
      case 'Hard': return "Deep abstraction. Cryptic descriptions and high edge-case density. Requires sharp intuition.";
      default: return "";
    }
  };

  if (!stats) return <div className="p-20 text-center text-slate-500 font-black animate-pulse">Syncing Proficiency Traces...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-16 flex items-center justify-between border-b border-white/5 pb-10">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter mb-2">Practice Matrix</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Cognitive Load & Logic Synthesis</p>
        </div>
        <button 
          onClick={onBack}
          className="px-6 py-3 rounded-xl bg-slate-900 border border-white/5 text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all tracking-widest"
        >
          Return to Hub
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Stats & History */}
        <div className="lg:col-span-1 space-y-10">
          <section className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-10 block">Proficiency Trace</h3>
            <div className="grid grid-cols-2 gap-6 mb-12">
               <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                  <div className="text-4xl font-black text-white mb-1">{stats.totalSolved}</div>
                  <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Questions</div>
               </div>
               <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                  <div className="text-4xl font-black text-emerald-400 mb-1">{stats.difficultyBreakdown.Hard}</div>
                  <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Hard Clear</div>
               </div>
            </div>
            
            <div className="space-y-4">
               {['Easy', 'Medium', 'Hard'].map(diff => {
                 const count = stats.difficultyBreakdown[diff as keyof typeof stats.difficultyBreakdown];
                 const percentage = stats.totalSolved ? (count / stats.totalSolved) * 100 : 0;
                 return (
                   <div key={diff} className="space-y-2">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">{diff}</span>
                        <span className="text-white">{count}</span>
                     </div>
                     <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${diff === 'Easy' ? 'bg-emerald-500' : diff === 'Medium' ? 'bg-indigo-500' : 'bg-rose-500'}`} style={{ width: `${percentage}%` }}></div>
                     </div>
                   </div>
                 );
               })}
            </div>
          </section>

          <section className="space-y-6">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Solving History</h3>
             <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {history.practiceAttempts.length === 0 ? (
                  <div className="p-10 border border-dashed border-white/10 rounded-3xl text-center text-slate-600 italic text-xs">
                    No traces found.
                  </div>
                ) : (
                  history.practiceAttempts.map(p => (
                    <div key={p.id} className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl flex justify-between items-center hover:border-indigo-500/30 transition-all">
                       <div>
                          <div className="text-xs font-bold text-white mb-1">{p.question.title}</div>
                          <div className="flex gap-2">
                            <span className="text-[8px] font-black text-indigo-400 uppercase">{p.question.difficulty}</span>
                          </div>
                       </div>
                       <div className="text-xs font-black text-emerald-400">{p.score}%</div>
                    </div>
                  ))
                )}
             </div>
          </section>
        </div>

        {/* Right: Synthesis Controls */}
        <div className="lg:col-span-2 space-y-10">
          <section className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                <svg className="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
             </div>
             
             <h2 className="text-2xl font-black text-white mb-12 flex items-center gap-6 italic">
                <span className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </span>
                Initialize Sprint Matrix
             </h2>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Knowledge Topic</label>
                   <div className="grid grid-cols-1 gap-2 max-h-[320px] overflow-y-auto p-2 bg-black/40 rounded-3xl border border-white/5 custom-scrollbar">
                      {DSA_TOPICS.map(topic => (
                        <button 
                          key={topic}
                          type="button"
                          onClick={() => setSelectedTopic(topic)}
                          className={`w-full text-left px-5 py-3 rounded-xl text-xs font-bold transition-all ${selectedTopic === topic ? 'bg-indigo-600 text-white shadow-lg border border-indigo-400' : 'text-slate-500 hover:bg-white/5 border border-transparent'}`}
                        >
                          {topic}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-10">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Thinking Depth (Cognitive Level)</label>
                      <div className="flex flex-col gap-3">
                        {['Easy', 'Medium', 'Hard'].map(diff => (
                          <button 
                            key={diff}
                            type="button"
                            onClick={() => setSelectedDifficulty(diff)}
                            className={`w-full py-5 rounded-2xl border transition-all text-xs font-black uppercase tracking-widest relative z-10 ${selectedDifficulty === diff ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl ring-2 ring-indigo-500/20' : 'bg-slate-950 border-white/5 text-slate-600 hover:bg-slate-900'}`}
                          >
                            {diff} Level
                          </button>
                        ))}
                      </div>
                   </div>

                   <div className="p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 italic">
                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Generator Logic</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        "Synthesizing a <span className="text-white font-black">{selectedDifficulty}</span> complexity set for <span className="text-white font-black">{selectedTopic}</span>. {getDifficultyInsight(selectedDifficulty)}"
                      </p>
                   </div>
                </div>
             </div>

             <button 
               onClick={() => onStartPractice(selectedTopic, selectedDifficulty)}
               className="w-full mt-12 bg-white text-black py-6 rounded-3xl font-black text-xl uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4 group relative z-10"
             >
                Start 5-Question {selectedDifficulty} Sprint
                <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
             </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PracticeHub;
