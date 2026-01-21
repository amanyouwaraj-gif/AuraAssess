
import React, { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import { PracticeSession, PracticeAttempt, RunResult, CodingQuestion } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants';
import { geminiService } from '../services/geminiService';

interface PracticeEditorProps {
  session: PracticeSession;
  onComplete: (attempts: Record<string, PracticeAttempt>) => void;
  onBack: () => void;
}

const PracticeEditor: React.FC<PracticeEditorProps> = ({ session, onComplete, onBack }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [attempts, setAttempts] = useState<Record<string, PracticeAttempt>>(session.attempts);
  const [code, setCode] = useState("");
  const [selectedLang, setSelectedLang] = useState('python');
  const [isRunning, setIsRunning] = useState(false);

  const question = session.questions[currentIdx];

  useEffect(() => {
    const existing = attempts[question.id];
    if (existing) {
      setCode(existing.answer);
      setSelectedLang(existing.language);
    } else {
      setCode(question.starterCodes?.[selectedLang] || "");
    }
  }, [currentIdx, question]);

  useEffect(() => {
    // Only update code if the user hasn't already submitted/modified this question
    if (!attempts[question.id]) {
      setCode(question.starterCodes?.[selectedLang] || "");
    }
  }, [selectedLang]);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const result = await geminiService.runCodeAgainstTests(question, code, selectedLang);
      const attempt: PracticeAttempt = {
        id: crypto.randomUUID(),
        question,
        answer: code,
        language: selectedLang,
        runResult: result,
        timestamp: Date.now(),
        score: result.score
      };
      setAttempts(prev => ({ ...prev, [question.id]: attempt }));
    } catch (e) { 
      alert("Execution error in Neural Matrix."); 
    } finally { 
      setIsRunning(false); 
    }
  };

  const handleFinish = () => {
    const attemptedCount = Object.keys(attempts).length;
    const totalCount = session.questions.length;

    if (attemptedCount < totalCount) {
      if (!confirm(`You have only verified ${attemptedCount}/${totalCount} vectors. Finalize sprint with partial data?`)) {
        return;
      }
    }

    // Critical Fix: Generate stub attempts for all unsubmitted questions 
    // to ensure the database and results dashboard have a full set of data.
    const finalAttempts = { ...attempts };
    session.questions.forEach(q => {
      if (!finalAttempts[q.id]) {
        finalAttempts[q.id] = {
          id: crypto.randomUUID(),
          question: q,
          answer: "", // Empty submission
          language: selectedLang,
          runResult: { passed: false, score: 0, testCaseResults: [] },
          timestamp: Date.now(),
          score: 0
        };
      }
    });

    onComplete(finalAttempts);
  };

  const activeAttempt = attempts[question.id];

  return (
    <div className="h-screen flex flex-col bg-[#020617]">
      <nav className="flex items-center justify-between px-8 py-5 bg-slate-900/50 border-b border-white/5 shrink-0 backdrop-blur-xl">
        <div className="flex items-center gap-10">
          <button onClick={onBack} className="text-slate-500 hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <span className="text-xl font-black text-white italic tracking-tighter block leading-none">{question.title}</span>
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1 block opacity-50">Sprint Vector {currentIdx + 1} of 5</span>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleRun} 
            disabled={isRunning} 
            className="bg-slate-900 border border-white/10 px-8 py-2.5 rounded-xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-black/50"
          >
            {isRunning ? 'Synthesizing...' : 'Submit Logic'}
          </button>
          <button 
            onClick={handleFinish} 
            className="bg-emerald-600 px-8 py-2.5 rounded-xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20"
          >
            Finalize Sprint
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="w-20 bg-slate-950 border-r border-white/5 flex flex-col items-center py-8 gap-6">
          {session.questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentIdx(i)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black transition-all relative ${currentIdx === i ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 border border-indigo-500' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}
            >
              {i + 1}
              {attempts[q.id] && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                   <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Description Panel */}
        <div className="w-1/2 p-12 overflow-y-auto border-r border-white/5 bg-slate-950/20 custom-scrollbar">
           <div className="max-w-none space-y-12">
              <div className="prose prose-invert prose-lg text-slate-300 leading-relaxed font-medium">
                 {question.problem.split('\n').map((line, i) => <p key={i} className="mb-4">{line}</p>)}
              </div>

              <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 space-y-4 shadow-xl">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Technical Constraints</h4>
                  <p className="text-xs font-mono text-slate-400 italic">{question.constraints || "Standard DSA complexity required."}</p>
              </div>

              <div className="space-y-8">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Sample Vectors</h3>
                  {question.samples?.map((s, idx) => (
                    <div key={idx} className="bg-slate-900/30 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                      <div className="px-6 py-3 border-b border-white/5 bg-white/5 font-black text-[9px] uppercase text-slate-500 tracking-widest">Case Scenario #{idx + 1}</div>
                      <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-10">
                          <div>
                             <div className="text-[10px] font-black text-indigo-400 mb-2 uppercase tracking-widest opacity-50">Input Signal</div>
                             <pre className="p-4 bg-black/60 rounded-2xl text-slate-300 font-mono text-xs border border-white/5 overflow-x-auto">{s.input}</pre>
                          </div>
                          <div>
                             <div className="text-[10px] font-black text-emerald-400 mb-2 uppercase tracking-widest opacity-50">Expected Result</div>
                             <pre className="p-4 bg-black/60 rounded-2xl text-slate-300 font-mono text-xs border border-white/5 overflow-x-auto">{s.output}</pre>
                          </div>
                        </div>
                        {s.explanation && <p className="text-sm text-slate-500 italic leading-relaxed">{s.explanation}</p>}
                      </div>
                    </div>
                  ))}
              </div>
           </div>
        </div>

        {/* Editor & Console Panel */}
        <div className="flex-1 flex flex-col bg-black">
          <div className="flex items-center justify-between px-8 py-3 bg-[#020617] border-b border-white/5">
             <div className="flex gap-1.5 bg-black/60 p-1 rounded-xl border border-white/5">
                {SUPPORTED_LANGUAGES.map(l => (
                  <button 
                    key={l.id} 
                    onClick={() => setSelectedLang(l.id)}
                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${selectedLang === l.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-white'}`}
                  >
                    {l.name}
                  </button>
                ))}
             </div>
          </div>

          <div className="flex-1 relative">
             <AceEditor
                mode={selectedLang === 'cpp' ? 'c_cpp' : selectedLang === 'javascript' || selectedLang === 'typescript' ? 'javascript' : selectedLang}
                theme="tomorrow_night_eighties"
                name={`practice-editor-${question.id}`}
                onChange={setCode}
                value={code}
                fontSize={15}
                width="100%"
                height="100%"
                setOptions={{ useWorker: false, showLineNumbers: true, tabSize: 4, highlightActiveLine: true, fontFamily: 'Fira Code' }}
                className="bg-black"
             />
          </div>

          {activeAttempt && (
            <div className="h-64 bg-[#020617] border-t border-white/10 p-8 overflow-y-auto custom-scrollbar">
               <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Diagnostic Output</span>
                  <div className="flex gap-4">
                     <span className="text-xs font-black text-emerald-400">{activeAttempt.runResult.score}% Integrity</span>
                     <span className="text-xs font-black text-white">{activeAttempt.runResult.testCaseResults.filter(t => t.passed).length}/15 Secured</span>
                  </div>
               </div>
               <div className="grid grid-cols-15 gap-2 h-2 mb-6">
                  {activeAttempt.runResult.testCaseResults.map((tr, i) => (
                    <div key={i} className={`h-full rounded-full ${tr.passed ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'}`}></div>
                  ))}
               </div>
               <div className="space-y-4">
                  {activeAttempt.runResult.testCaseResults.filter(t => !t.passed).slice(0, 1).map((tr, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-xs text-rose-400 italic">
                       Logic Collision: {tr.isHidden ? "Hidden Vector Failed" : `Prefix Mismatch on Input`}
                    </div>
                  ))}
                  {activeAttempt.runResult.passed && (
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-400 font-bold uppercase tracking-widest">
                       All Validation Vectors Locked
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeEditor;
