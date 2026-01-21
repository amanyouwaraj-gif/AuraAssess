
import React from 'react';
import { CompanyInference } from '../types';

interface ExamIntroProps {
  inference: CompanyInference;
  onBegin: () => void;
}

const ExamIntro: React.FC<ExamIntroProps> = ({ inference, onBegin }) => {
  const isHigh = inference.confidence === 'High';
  const isMed = inference.confidence === 'Medium';

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-in zoom-in-95 duration-500">
      <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-xl rounded-[40px] overflow-hidden shadow-2xl">
        <div className="p-12">
          <div className="flex items-center justify-between mb-8">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20">
              Pattern Inference Ready
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs font-bold uppercase">Confidence</span>
              <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${isHigh ? 'bg-emerald-500 text-white' : isMed ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}>
                {inference.confidence}
              </span>
            </div>
          </div>

          <h1 className="text-5xl font-black text-white mb-4">{inference.company}</h1>
          <p className="text-xl text-slate-400 mb-12">{inference.level} • {inference.category}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Interview Vibe</h3>
                <p className="text-slate-200 text-sm leading-relaxed">{inference.vibe}</p>
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Predicted Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {inference.predictedTopics.map(topic => (
                    <span key={topic} className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-slate-300">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 bg-slate-950/40 p-6 rounded-3xl border border-slate-700/50">
               <div>
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">System Assumptions</h3>
                  <ul className="space-y-2">
                    {inference.assumptions.map((a, i) => (
                      <li key={i} className="text-[13px] text-slate-400 flex items-start gap-2">
                        <span className="text-indigo-500 mt-1">•</span>
                        {a}
                      </li>
                    ))}
                  </ul>
               </div>
               {inference.includesAptitude && (
                 <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                   <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-sm">!</div>
                   <span className="text-xs font-bold text-amber-400">Aptitude & Reasoning Section Included</span>
                 </div>
               )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={onBegin}
              className="w-full bg-slate-100 text-slate-950 font-black py-5 rounded-3xl text-xl hover:bg-white transition-all transform hover:scale-[1.01] active:scale-95 shadow-2xl shadow-white/5"
            >
              Start Official Mock Exam
            </button>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              Timer starts immediately upon selection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamIntro;
