
import React from 'react';

interface DiscoveryOverlayProps {
  message: string;
}

const DiscoveryOverlay: React.FC<DiscoveryOverlayProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
      <div className="relative mb-12">
        <div className="w-24 h-24 border-t-4 border-r-4 border-indigo-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-indigo-500 rounded-lg animate-pulse shadow-2xl shadow-indigo-500/50"></div>
        </div>
      </div>
      
      <div className="space-y-4 max-w-md">
        <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Aura Research Mode
        </h2>
        <p className="text-slate-400 font-mono text-sm leading-relaxed h-12">
          {message}
        </p>
      </div>

      <div className="mt-12 flex gap-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
        ))}
      </div>
    </div>
  );
};

export default DiscoveryOverlay;
