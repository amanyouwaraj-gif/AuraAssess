
import React, { useState } from 'react';
import AceEditor from 'react-ace';
import { PracticeSession } from '../types';

interface PracticeResultsProps {
  session: PracticeSession;
  onDone: () => void;
}

const PracticeResults: React.FC<PracticeResultsProps> = ({ session, onDone }) => {
  const [selectedId, setSelectedId] = useState<string | null>(session.questions[0]?.id || null);
  const selectedQuestion = session.questions.find(q => q.id === selectedId);
  const selectedAttempt = selectedId ? session.attempts[selectedId] : null;

  const formatCode = (code: string) => {
    if (!code) return "";
    // Clean up possible model formatting issues
    return code.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\'/g, "'").trim();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pb-24 animate-in fade-in zoom-in-95 duration-700">
      <header className="mb-16 flex items-center justify-between border-b border-white/5 pb-10">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter mb-2">Sprint Result Trace</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">{session.topic} • {session.difficulty} Sprint Analysis</p>
        </div>
        <button 
          onClick={onDone}
          className="px-10 py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30"
        >
          Return to Hub
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 sticky top-12">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 px-2">Question Matrix</h3>
            <div className="space-y-3">
              {session.questions.map((q, i) => {
                const attempt = session.attempts[q.id];
                const isSelected = selectedId === q.id;
                const score = attempt?.score || 0;
                
                return (
                  <button 
                    key={q.id}
                    onClick={() => setSelectedId(q.id)}
                    className={`w-full p-5 rounded-2xl border text-left flex justify-between items-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl' : 'bg-black/40 border-white/5 text-slate-400 hover:border-white/20'}`}
                  >
                    <div>
                      <div className="text-[9px] font-black uppercase opacity-60 mb-1">Vector 0{i+1}</div>
                      <div className="text-xs font-bold truncate max-w-[120px]">{q.title}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-black ${isSelected ? 'text-white' : score >= 80 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                        {score}%
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed Review */}
        <div className="lg:col-span-3 space-y-10">
          {selectedQuestion ? (
            <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
              <section className="bg-slate-900/30 border border-white/5 rounded-[3rem] p-12 shadow-2xl overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                    <svg className="w-48 h-48 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                 </div>
                 <h2 className="text-3xl font-black text-white italic mb-6">{selectedQuestion.title}</h2>
                 <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-3xl">{selectedQuestion.problem}</p>
                 
                 <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-3xl p-8 mb-10">
                    <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Coach Review</h5>
                    <p className="text-sm text-slate-300 italic">"The logic used here mirrors standard production optimization for {session.topic}. Evaluate the implementation delta below."</p>
                 </div>

                 <div className="space-y-6">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Optimal Implementation Matrix</h5>
                    <div className="rounded-[2rem] overflow-hidden border border-white/5 bg-black">
                      <AceEditor
                        mode="python"
                        theme="tomorrow_night_eighties"
                        name={`solution-${selectedQuestion.id}`}
                        value={formatCode(selectedQuestion.solution_code)}
                        readOnly={true}
                        fontSize={14}
                        width="100%"
                        height="350px"
                        setOptions={{ useWorker: false, showLineNumbers: true, tabSize: 4, fontFamily: 'Fira Code' }}
                      />
                    </div>
                 </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">User Submission Trace</h5>
                    <div className="rounded-2xl border border-white/5 overflow-hidden bg-black/40">
                      <AceEditor
                        mode="python"
                        theme="tomorrow_night_eighties"
                        name={`user-sub-${selectedQuestion.id}`}
                        value={selectedAttempt?.answer || "// NO_SUBMISSION_DETECTED\n// Question skipped or terminated prematurely."}
                        readOnly={true}
                        fontSize={12}
                        width="100%"
                        height="200px"
                        setOptions={{ useWorker: false, showLineNumbers: true, fontFamily: 'Fira Code' }}
                      />
                    </div>
                 </div>

                 <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10">Diagnostic Profile</h5>
                    <div className={`w-32 h-32 rounded-full border-8 flex items-center justify-center text-4xl font-black mb-6 ${selectedAttempt?.score >= 80 ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400'}`}>
                       {selectedAttempt?.score || 0}%
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pattern Integrity Score</p>
                 </div>
              </section>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 italic">
               Select a question vector to analyze results.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeResults;
