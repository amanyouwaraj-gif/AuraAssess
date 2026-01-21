
import React, { useState } from 'react';
import AceEditor from 'react-ace';
import { ExamSession, SectionType, MCQQuestion, CodingQuestion } from '../types';

declare const ace: any;
if (typeof ace !== 'undefined') {
  ace.config.set('basePath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.38.0/src-min-noconflict/');
}

interface ResultsDashboardProps {
  session: ExamSession;
  onRestart: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ session, onRestart }) => {
  const { results, exam } = session;
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  if (!results) return null;

  const allQuestions = [
    ...exam.sections.technical,
    ...exam.sections.coding,
    ...exam.sections.quantitative,
    ...exam.sections.reasoning
  ];

  const getAceMode = (langId?: string) => {
    if (!langId) return 'python';
    const mapping: Record<string, string> = {
      'javascript': 'javascript',
      'typescript': 'javascript',
      'python': 'python',
      'java': 'java',
      'cpp': 'c_cpp'
    };
    return mapping[langId] || 'python';
  };

  const formatCode = (code: string) => {
    if (!code) return "";
    let cleaned = code;
    if (cleaned.includes('\\n')) cleaned = cleaned.replace(/\\n/g, '\n');
    cleaned = cleaned.replace(/\\"/g, '"').replace(/\\'/g, "'");
    if (!cleaned.includes('\n') && cleaned.length > 50) {
        cleaned = cleaned.replace(/;/g, ';\n').replace(/{/g, '{\n').replace(/}/g, '}\n');
    }
    return cleaned.trim();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pb-24 animate-in fade-in duration-700">
      {/* Hero Performance Header */}
      <header className="mb-16 text-center">
        <div className="inline-block relative mb-6">
          <div className="absolute inset-0 bg-indigo-500 blur-[120px] opacity-20 pointer-events-none"></div>
          <div className="relative bg-slate-900/40 border border-white/10 rounded-[3rem] p-12 backdrop-blur-3xl shadow-2xl">
            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-4">Integrity Verification Report</div>
            <div className="text-9xl font-black text-white tracking-tighter tabular-nums leading-none">
              {results.readinessScore}<span className="text-4xl text-indigo-500 opacity-50">%</span>
            </div>
            <p className="mt-8 text-slate-400 font-medium max-w-lg mx-auto leading-relaxed italic border-t border-white/5 pt-8">
              "{results.overallFeedback}"
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 sticky top-12">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 px-2">Diagnostic Clusters</h3>
            <div className="space-y-4">
              {(Object.entries(results.sectionScores) as [string, number][]).map(([name, score]) => (
                <div key={name} className="group p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-indigo-500/30 transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{name}</span>
                    <span className={`text-xs font-black ${score >= 70 ? 'text-emerald-400' : 'text-rose-400'}`}>{score}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${score >= 70 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={onRestart}
              className="w-full mt-10 bg-white text-black py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all shadow-2xl active:scale-95"
            >
              Reset Diagnostic State
            </button>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between px-4 mb-4">
             <h2 className="text-xl font-black text-white italic">Logical Trace Review</h2>
             <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{results.evaluations.length} Vector Points Captured</span>
          </div>

          <div className="space-y-4">
            {results.evaluations.map((evalItem, idx) => {
              const question = allQuestions.find(q => q.id === evalItem.questionId);
              const isCorrect = evalItem.score >= 70;
              const isCoding = (question as any)?.solution_code !== undefined;
              const userAnswer = session.answers[evalItem.questionId];
              const isOpen = selectedQuestionId === evalItem.questionId;

              return (
                <div 
                  key={evalItem.questionId} 
                  className={`group bg-slate-900/30 border rounded-[2rem] overflow-hidden transition-all duration-500 ${isOpen ? 'border-indigo-500/50 ring-1 ring-indigo-500/20 bg-slate-900/60 shadow-2xl' : 'border-white/5 hover:border-white/10'}`}
                >
                  <div 
                    onClick={() => setSelectedQuestionId(isOpen ? null : evalItem.questionId)}
                    className="p-6 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[10px] font-black transition-all ${isCorrect ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {isCorrect ? 'VALID' : 'BREACH'}
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Scenario Vector {idx + 1}</div>
                        <h4 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors">
                          {question ? ('title' in question ? (question as any).title : (question as any).question.slice(0, 80) + '...') : 'NULL_PTR'}
                        </h4>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-6">
                      <div className="tabular-nums">
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Precision</div>
                        <div className={`text-lg font-black ${isCorrect ? 'text-emerald-400' : 'text-indigo-400'}`}>{evalItem.score}%</div>
                      </div>
                      <svg className={`w-5 h-5 text-slate-700 transition-transform duration-500 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="p-10 pt-4 border-t border-white/5 space-y-12 animate-in slide-in-from-top-4 duration-500">
                      
                      {/* Full Original Question Block */}
                      <div className="space-y-4">
                         <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Problem Narrative</h5>
                         <div className="p-8 rounded-3xl bg-black/40 border border-white/5 text-slate-300 leading-relaxed font-medium">
                            {isCoding ? (
                              <div className="space-y-6">
                                <p className="text-lg text-white">{(question as CodingQuestion).problem}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                                   <div>
                                      <div className="text-[9px] font-black text-indigo-400 uppercase mb-2 tracking-widest">Technical Constraints</div>
                                      <p className="text-xs font-mono text-slate-500 leading-relaxed">{(question as CodingQuestion).constraints}</p>
                                   </div>
                                   <div className="flex flex-wrap gap-2 content-start">
                                      <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px] font-black text-indigo-400 uppercase">{(question as any).difficulty}</span>
                                      <span className="px-3 py-1 bg-slate-900 border border-white/5 rounded-lg text-[10px] font-black text-slate-600 uppercase">{(question as any).topic}</span>
                                   </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                <p className="text-xl text-white">{(question as MCQQuestion).question}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                   {(question as MCQQuestion).options.map((opt, i) => (
                                      <div key={i} className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-4 ${i === (question as any).correctAnswer ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-black/20 border-white/5 text-slate-600 opacity-40'}`}>
                                         <div className="w-6 h-6 rounded bg-black/40 flex items-center justify-center border border-current">{String.fromCharCode(65+i)}</div>
                                         {opt}
                                      </div>
                                   ))}
                                </div>
                              </div>
                            )}
                         </div>
                      </div>

                      {/* Structural Diagnosis */}
                      <div className="relative p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 overflow-hidden shadow-inner">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                           <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                        </div>
                        <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Structural Diagnostic Breakdown</h5>
                        <p className="text-indigo-100/80 text-lg leading-relaxed font-medium italic">
                          "{evalItem.feedback}"
                        </p>
                      </div>

                      {/* Side-by-Side Review */}
                      <div className="space-y-10">
                        {isCoding ? (
                          <div className="space-y-12">
                            {/* Code Matrix Comparison */}
                            <div className="grid grid-cols-1 gap-10">
                               <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                     <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Optimal Implementation Matrix</h5>
                                     <span className="text-[9px] font-black text-slate-600 bg-slate-900 px-3 py-1 rounded-full border border-white/5 uppercase">Target Strategy</span>
                                  </div>
                                  <div className="rounded-[2.5rem] border border-emerald-500/20 shadow-2xl overflow-hidden bg-black ring-1 ring-emerald-500/10">
                                    <AceEditor
                                      mode={getAceMode(userAnswer?.language)}
                                      theme="tomorrow_night_eighties"
                                      name={`solution-view-${evalItem.questionId}`}
                                      value={formatCode(evalItem.correctSolution || "")}
                                      readOnly={true}
                                      fontSize={14}
                                      width="100%"
                                      height="380px" 
                                      setOptions={{ useWorker: false, showLineNumbers: true, tabSize: 4, highlightActiveLine: false, wrap: true, fontFamily: 'Fira Code' }}
                                    />
                                    <div className="p-8 bg-slate-950/90 border-t border-white/5">
                                      <span className="text-[10px] font-black text-slate-500 uppercase block mb-4">Architectural Logic</span>
                                      <p className="text-sm text-slate-400 leading-relaxed italic">{(question as any).solution_explanation}</p>
                                    </div>
                                  </div>
                               </div>

                               <div className="space-y-4">
                                  <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">User Execution Trace</h5>
                                  <div className="rounded-[2.5rem] border border-white/5 overflow-hidden bg-black/40 shadow-inner">
                                    <AceEditor
                                      mode={getAceMode(userAnswer?.language)}
                                      theme="tomorrow_night_eighties"
                                      name={`user-view-${evalItem.questionId}`}
                                      value={userAnswer?.answer || "// SIGNAL_OMITTED: No data found for this vector."}
                                      readOnly={true}
                                      fontSize={13}
                                      width="100%"
                                      height="220px" 
                                      setOptions={{ useWorker: false, showLineNumbers: true, highlightActiveLine: false, wrap: true, fontFamily: 'Fira Code' }}
                                    />
                                  </div>
                               </div>
                            </div>

                            {/* Verification Convergence Matrix (Test Cases) */}
                            <div className="space-y-8">
                               <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verification Convergence Matrix</h5>
                               <div className="grid grid-cols-1 gap-4">
                                  {(userAnswer?.runResult?.testCaseResults || (question as CodingQuestion).samples.map(s => ({ ...s, expectedOutput: s.output, actualOutput: "N/A", passed: false, category: "Sample" }))).map((tr: any, ti: number) => (
                                     <div key={ti} className={`p-6 rounded-[2rem] border transition-all ${tr.passed ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'bg-rose-500/5 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.05)]'}`}>
                                        <div className="flex justify-between items-center mb-6">
                                           <div className="flex items-center gap-4">
                                              <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black ${tr.passed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>{ti + 1}</span>
                                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tr.category || "Hidden Logic Vector"}</span>
                                           </div>
                                           <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${tr.passed ? 'text-emerald-400' : 'text-rose-400'}`}>{tr.passed ? "Integrity Verified" : "Breach Detected"}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                           <div className="space-y-2">
                                              <span className="text-[9px] font-black text-slate-600 uppercase block tracking-widest">Input Vector</span>
                                              <pre className="p-4 bg-black/40 rounded-2xl text-[10px] font-mono text-slate-400 border border-white/5 overflow-x-auto">{tr.input}</pre>
                                           </div>
                                           <div className="space-y-2">
                                              <span className="text-[9px] font-black text-emerald-400 uppercase block tracking-widest">Expected Strategy</span>
                                              <pre className="p-4 bg-black/40 rounded-2xl text-[10px] font-mono text-emerald-400/80 border border-emerald-500/10 overflow-x-auto">{tr.expectedOutput || tr.output}</pre>
                                           </div>
                                           <div className="space-y-2">
                                              <span className="text-[9px] font-black text-rose-400 uppercase block tracking-widest">Actual Result</span>
                                              <pre className={`p-4 bg-black/40 rounded-2xl text-[10px] font-mono border overflow-x-auto ${tr.passed ? 'text-emerald-400/80 border-emerald-500/10' : 'text-rose-400/80 border-rose-500/10'}`}>{tr.actualOutput || "N/A"}</pre>
                                           </div>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <div className="p-10 rounded-[3rem] bg-slate-950/80 border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500/30 group-hover:bg-emerald-500 transition-all duration-700"></div>
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-8 block">System Reference Response</span>
                                <div className="flex items-center gap-6 mb-10">
                                   <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-2xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                                      {String.fromCharCode(65 + ((question as any).correctAnswer || 0))}
                                   </div>
                                   <span className="text-xl font-bold text-slate-200">{(question as MCQQuestion).options[(question as any).correctAnswer]}</span>
                                </div>
                                <div className="mt-8 pt-8 border-t border-white/5">
                                   <span className="text-[9px] font-black text-indigo-400 uppercase block mb-3 tracking-widest">Resolution Heuristic</span>
                                   <p className="text-sm text-slate-400 leading-relaxed italic font-medium">
                                      "{(question as any).explanation}"
                                   </p>
                                </div>
                             </div>
                             
                             <div className="p-10 rounded-[3rem] bg-slate-950/80 border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                <div className={`absolute top-0 left-0 w-1.5 h-full transition-all duration-700 ${isCorrect ? 'bg-emerald-500/30 group-hover:bg-emerald-500' : 'bg-rose-500/30 group-hover:bg-rose-500'}`}></div>
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-10 block">User Logic Profiling</span>
                                <div className="space-y-8">
                                   <div className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl font-black mx-auto border-8 transition-all duration-700 ${isCorrect ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_60px_rgba(16,185,129,0.1)]' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_60px_rgba(244,63,94,0.1)]'}`}>
                                      {userAnswer?.answer !== undefined ? String.fromCharCode(65 + parseInt(userAnswer.answer)) : '?'}
                                   </div>
                                   <div>
                                      <span className={`text-xl font-black tracking-tighter uppercase ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                                         {userAnswer?.answer !== undefined ? (isCorrect ? "Alignment Success" : "Logical Collision") : "Signal Loss"}
                                      </span>
                                      <p className="text-slate-500 text-xs font-bold uppercase mt-2 tracking-widest max-w-[200px] mx-auto leading-relaxed">
                                         {userAnswer?.answer !== undefined ? (question as any).options[parseInt(userAnswer.answer)] : "No logic trace detected."}
                                      </p>
                                   </div>
                                </div>
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
