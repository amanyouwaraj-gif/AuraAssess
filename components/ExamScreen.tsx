
import React, { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import { ExamSession, UserAnswer, CodingQuestion, MCQQuestion, SectionType } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants';
import { geminiService } from '../services/geminiService';

// Setup Ace builds for ESM.sh compatibility
if (typeof window !== 'undefined') {
  const ace = (window as any).ace;
  if (ace) {
    ace.config.set('basePath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.38.0/src-min-noconflict/');
    ace.config.set('modePath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.38.0/src-min-noconflict/');
    ace.config.set('themePath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.38.0/src-min-noconflict/');
  }
}

const STARTER_TEMPLATES: Record<string, string> = {
  python: `import sys\nimport math\nfrom collections import *\n\n# Secure I/O Implementation\ndef solve():\n    # Implement core logic here\n    pass\n\nif __name__ == "__main__":\n    solve()`,
  javascript: `const fs = require('fs');\n\n/**\n * Main Entry Point\n */\nfunction solve() {\n    // Implement logic below\n}\n\nsolve();`,
  typescript: `import * as fs from 'fs';\n\n/**\n * Static Typed Simulation\n */\nfunction solve(): void {\n    // Core Logic\n}\n\nsolve();`,
  java: `import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Standard CP logic\n    }\n}`,
  cpp: `#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implementation\n    return 0;\n}`
};

interface ExamScreenProps {
  session: ExamSession;
  onComplete: (answers: Record<string, UserAnswer>) => void;
  onUpdateAnswers: (answers: Record<string, UserAnswer>) => void;
  onNavigate: (section: SectionType, idx: number) => void;
}

const ExamScreen: React.FC<ExamScreenProps> = ({ session, onComplete, onUpdateAnswers, onNavigate }) => {
  const [activeSection, setActiveSection] = useState<SectionType>(session.currentSection || 'Technical');
  const [currentIdx, setCurrentIdx] = useState(session.currentIdx || 0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>(session.answers || {});
  const [timeLeft, setTimeLeft] = useState(() => {
    const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
    return Math.max(0, session.exam.timeMinutes * 60 - elapsed);
  });
  const [selectedLang, setSelectedLang] = useState(SUPPORTED_LANGUAGES[2].id);
  const [isRunning, setIsRunning] = useState(false);

  const sections = session.exam.sections;
  const currentSectionList = 
    activeSection === 'Technical' ? sections.technical :
    activeSection === 'Coding' ? sections.coding :
    activeSection === 'Quantitative' ? sections.quantitative :
    sections.reasoning;

  const currentQuestion = currentSectionList[currentIdx];
  const isCoding = activeSection === 'Coding';

  useEffect(() => {
    onNavigate(activeSection, currentIdx);
  }, [activeSection, currentIdx]);

  useEffect(() => {
    if (isCoding && currentQuestion) {
      const q = currentQuestion as CodingQuestion;
      const qId = q.id;
      const existingAns = answers[qId];
      
      if (!existingAns?.codeStates?.[selectedLang]) {
        const starterCode = q.starterCodes?.[selectedLang] || STARTER_TEMPLATES[selectedLang];
        const updatedStates = { ...(existingAns?.codeStates || {}), [selectedLang]: starterCode };
        
        const newAnswer = { 
          questionId: qId, 
          answer: starterCode, 
          language: selectedLang,
          codeStates: updatedStates,
          runResult: existingAns?.runResult 
        };
        const updated = { ...answers, [qId]: newAnswer };
        setAnswers(updated);
        onUpdateAnswers(updated);
      }
    }
  }, [currentQuestion?.id, selectedLang, isCoding]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete(answers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [answers, onComplete]);

  const updateMCQAnswer = (val: string) => {
    const updated = {
      ...answers,
      [currentQuestion.id]: { questionId: currentQuestion.id, answer: val }
    };
    setAnswers(updated);
    onUpdateAnswers(updated);
  };

  const updateCodeAnswer = (newCode: string) => {
    const qId = currentQuestion.id;
    const currentAns = answers[qId];
    const updatedStates = { ...(currentAns?.codeStates || {}), [selectedLang]: newCode };
    const updated = {
      ...answers,
      [qId]: { 
        ...currentAns,
        answer: newCode, 
        language: selectedLang,
        codeStates: updatedStates 
      }
    };
    setAnswers(updated);
    onUpdateAnswers(updated);
  };

  const handleRunCode = async () => {
    if (!isCoding) return;
    const q = currentQuestion as CodingQuestion;
    const code = answers[q.id]?.answer || "";
    setIsRunning(true);
    try {
      const result = await geminiService.runCodeAgainstTests(q, code, selectedLang);
      const updatedAnswers = {
        ...answers,
        [q.id]: { ...answers[q.id], runResult: result }
      };
      setAnswers(updatedAnswers);
      onUpdateAnswers(updatedAnswers);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const activeRunResult = answers[currentQuestion?.id]?.runResult;

  return (
    <div className="h-screen flex flex-col bg-[#020617]">
      <nav className="flex items-center justify-between px-8 py-4 bg-slate-900/50 border-b border-white/5 shrink-0 backdrop-blur-xl">
        <div className="flex items-center gap-10">
          <span className="text-2xl font-black text-indigo-400 italic tracking-tighter">AuraAssess</span>
          <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            {(['Technical', 'Coding', 'Quantitative', 'Reasoning'] as SectionType[]).map(sec => (
              <button 
                key={sec} 
                onClick={() => { setActiveSection(sec); setCurrentIdx(0); }}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === sec ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="px-6 py-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-mono text-sm font-bold shadow-inner">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <button onClick={() => onComplete(answers)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-500/20">Commit Protocol</button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-72 bg-[#020617] border-r border-white/5 p-6 space-y-2 shrink-0 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-4 mb-6">Execution Stack</div>
          {currentSectionList.map((q, i) => (
            <button 
              key={q.id} 
              onClick={() => setCurrentIdx(i)} 
              className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all text-xs font-bold ${currentIdx === i ? 'bg-slate-900 border border-white/10 text-white shadow-xl' : answers[q.id] ? 'text-emerald-500/80' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <div className="flex items-center gap-4">
                 <span className={`w-6 h-6 rounded-lg flex items-center justify-center border text-[10px] font-black ${currentIdx === i ? 'border-indigo-500 text-indigo-400' : 'border-slate-800'}`}>{i + 1}</span>
                 Q{i+1} Vector
              </div>
              {answers[q.id] && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>}
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div className="w-full md:w-1/2 p-12 overflow-y-auto border-r border-white/5 bg-slate-950/20 backdrop-blur-sm custom-scrollbar">
            {isCoding ? (
              <div className="max-w-none space-y-12">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-4xl font-black text-white mb-2 leading-none">{(currentQuestion as CodingQuestion).title}</h1>
                    <div className="flex gap-2 mt-4">
                       <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-indigo-500/20">{(currentQuestion as CodingQuestion).difficulty}</span>
                       <span className="bg-slate-900/50 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-white/5">{(currentQuestion as CodingQuestion).topic}</span>
                    </div>
                  </div>
                </div>
                
                <div className="prose prose-invert prose-lg text-slate-300 leading-relaxed font-medium">
                   {(currentQuestion as CodingQuestion).problem.split('\n').map((line, i) => <p key={i} className="mb-4">{line}</p>)}
                </div>

                <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 space-y-4 shadow-xl">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Technical Constraints</h4>
                  <p className="text-xs font-mono text-slate-400 italic">{(currentQuestion as CodingQuestion).constraints || "Standard DSA resource policies apply."}</p>
                </div>

                <div className="space-y-8">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Verification Scenarios</h3>
                  {(currentQuestion as CodingQuestion).samples?.map((s, idx) => (
                    <div key={idx} className="bg-slate-900/30 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                      <div className="px-6 py-3 border-b border-white/5 bg-white/5 font-black text-[9px] uppercase text-slate-500 tracking-widest">Case Scenario #{idx + 1}</div>
                      <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-10">
                          <div>
                             <div className="text-[10px] font-black text-indigo-400 mb-2 uppercase tracking-widest opacity-50">Standard Input</div>
                             <pre className="p-4 bg-black/60 rounded-2xl text-slate-300 font-mono text-xs border border-white/5 overflow-x-auto">{s.input}</pre>
                          </div>
                          <div>
                             <div className="text-[10px] font-black text-emerald-400 mb-2 uppercase tracking-widest opacity-50">Expected Output</div>
                             <pre className="p-4 bg-black/60 rounded-2xl text-slate-300 font-mono text-xs border border-white/5 overflow-x-auto">{s.output}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto py-12">
                <div className="mb-10">
                   <span className="bg-indigo-500/10 border border-indigo-500/20 px-5 py-2 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">{(currentQuestion as MCQQuestion).topic} Calibration</span>
                </div>
                <h1 className="text-4xl font-black text-white mb-16 leading-tight">{(currentQuestion as MCQQuestion).question}</h1>
                <div className="grid grid-cols-1 gap-5">
                  {(currentQuestion as MCQQuestion).options.map((opt, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => updateMCQAnswer(idx.toString())} 
                      className={`w-full p-8 rounded-[2.5rem] border text-left flex items-center gap-8 transition-all hover:bg-slate-900/60 ${answers[currentQuestion.id]?.answer === idx.toString() ? 'bg-indigo-600 border-indigo-400 text-white shadow-2xl shadow-indigo-600/30' : 'bg-slate-900/40 border-white/5 text-slate-400'}`}
                    >
                      <span className={`w-12 h-12 flex items-center justify-center rounded-2xl border font-black transition-all text-lg ${answers[currentQuestion.id]?.answer === idx.toString() ? 'bg-white/20 border-white/30 text-white' : 'border-slate-800 bg-black text-slate-600'}`}>{String.fromCharCode(65 + idx)}</span>
                      <span className="font-bold text-xl">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col bg-black overflow-hidden relative">
            {isCoding ? (
              <>
                <div className="flex items-center justify-between px-8 py-5 bg-[#020617] border-b border-white/5 shrink-0">
                  <div className="flex gap-1.5 bg-black/60 p-1.5 rounded-2xl border border-white/5">
                    {SUPPORTED_LANGUAGES.map(l => (
                      <button 
                        key={l.id} 
                        onClick={() => setSelectedLang(l.id)} 
                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedLang === l.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-white'}`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={handleRunCode} 
                    disabled={isRunning} 
                    className="bg-indigo-600 px-8 py-2.5 rounded-2xl text-white text-[10px] font-black uppercase hover:bg-indigo-500 active:scale-95 disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                  >
                    {isRunning ? 'Synthesizing...' : 'Run Simulation'}
                  </button>
                </div>
                <div className="flex-1 relative overflow-hidden">
                  <AceEditor
                    mode={selectedLang === 'cpp' ? 'c_cpp' : selectedLang === 'javascript' || selectedLang === 'typescript' ? 'javascript' : selectedLang}
                    theme="tomorrow_night_eighties"
                    name={`editor-${currentQuestion.id}`}
                    onChange={updateCodeAnswer}
                    value={answers[currentQuestion.id]?.answer || ''}
                    fontSize={15}
                    width="100%"
                    height="100%"
                    setOptions={{ showLineNumbers: true, tabSize: 4, useWorker: false, highlightActiveLine: true, fontFamily: 'Fira Code' }}
                    className="bg-black"
                  />
                </div>
                
                {activeRunResult && (
                  <div className="h-72 bg-[#020617] overflow-y-auto p-8 font-mono border-t border-white/10 shadow-2xl custom-scrollbar shrink-0">
                    <div className="flex justify-between items-center mb-8">
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Diagnostic Matrix</span>
                       <div className="flex items-center gap-6">
                         <div className="text-[11px] font-black text-indigo-400 bg-indigo-500/5 px-4 py-1.5 rounded-xl border border-indigo-500/20">
                           {activeRunResult.testCaseResults.filter(t => t.passed).length} / 15 SECURED
                         </div>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-15 gap-3 mb-10 h-3">
                       {activeRunResult.testCaseResults.map((tr, i) => (
                         <div 
                          key={i} 
                          title={`Test ${i+1}`}
                          className={`h-full rounded-full transition-all duration-700 ${tr.passed ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]'}`}
                         ></div>
                       ))}
                    </div>

                    <div className="space-y-4">
                       {activeRunResult.testCaseResults.filter(t => !t.passed).slice(0, 1).map((tr, i) => (
                         <div key={i} className="text-xs p-5 rounded-3xl bg-slate-950 border border-rose-500/20 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                            <span className="font-black text-rose-500 uppercase tracking-widest text-[10px]">Logic Breach Detected</span>
                            <div className="text-slate-400 mt-2 font-medium italic">
                               {tr.isHidden ? "System failure on hidden boundary vector." : `Failed on input prefix: ${tr.input.slice(0, 30)}...`}
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#020617]">
                <div className="relative mb-12">
                  <div className="w-32 h-32 rounded-full border-2 border-indigo-500/5 border-t-indigo-500 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 h-12 text-indigo-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                  </div>
                </div>
                <h2 className="text-3xl font-black text-white mb-4 italic">Logic Locked</h2>
                <p className="text-slate-500 text-sm max-w-sm font-medium">Persistence monitored via Neon cluster.</p>
              </div>
            )}
            
            <div className="p-10 bg-black/60 border-t border-white/5 flex justify-between gap-6 backdrop-blur-xl shrink-0">
              <button onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))} className="flex-1 px-8 py-5 rounded-[2rem] bg-slate-900 border border-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all active:scale-95">Previous</button>
              <button 
                onClick={() => {
                   if (currentIdx < currentSectionList.length - 1) {
                     setCurrentIdx(prev => prev + 1);
                   } else {
                     const sectionFlow: SectionType[] = ['Technical', 'Coding', 'Quantitative', 'Reasoning'];
                     const nextSecIdx = sectionFlow.indexOf(activeSection) + 1;
                     if (nextSecIdx < sectionFlow.length) {
                       setActiveSection(sectionFlow[nextSecIdx]);
                       setCurrentIdx(0);
                     } else {
                        onComplete(answers);
                     }
                   }
                }} 
                className="flex-[2] px-8 py-5 rounded-[2rem] bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 active:scale-95 transition-all shadow-2xl"
              >
                Execute Next Phase
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamScreen;
