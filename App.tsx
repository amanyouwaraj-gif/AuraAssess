
import React, { useState, useEffect, Suspense } from 'react';
import { PositionLevel, Exam, ExamSession, UserAnswer, UserHistory, User, SectionType } from './types';
import { geminiService } from './services/geminiService';
import { dbService } from './services/dbService';
import SetupScreen from './components/SetupScreen';
import ExamScreen from './components/ExamScreen';
import ResultsDashboard from './components/ResultsDashboard';
import DiscoveryOverlay from './components/DiscoveryOverlay';
import ExamIntro from './components/ExamIntro';
import AuthScreen from './components/AuthScreen';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'auth' | 'setup' | 'intro' | 'exam' | 'results'>('auth');
  const [session, setSession] = useState<ExamSession | null>(null);
  const [history, setHistory] = useState<UserHistory>({ sessions: [], averageReadiness: 0, discoveredCompanies: {} });
  const [loading, setLoading] = useState(false);
  const [discoveryState, setDiscoveryState] = useState<{ active: boolean; msg: string }>({ active: false, msg: '' });
  
  useEffect(() => {
    const activeUser = dbService.getCurrentUser();
    if (activeUser) {
      setUser(activeUser);
      setHistory(dbService.getHistory());
      setView('setup');
    }

    const activeSession = localStorage.getItem('aura_active_session');
    if (activeSession && activeUser) {
      try {
        const parsed = JSON.parse(activeSession);
        if (!parsed.isCompleted) {
          setSession(parsed);
          setView('exam');
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  const handleAuthenticated = (newUser: User) => {
    setUser(newUser);
    setHistory(dbService.getHistory());
    setView('setup');
  };

  const handleStartExamRequest = async (company: string, role: string, level: PositionLevel) => {
    setLoading(true);
    setDiscoveryState({ active: true, msg: `Mining ${company} Pattern DNA...` });
    
    try {
      const exam = await geminiService.generateCompleteAssessment(company, role, level);
      const newSession: ExamSession = { 
        exam, 
        answers: {}, 
        startTime: Date.now(), 
        isCompleted: false, 
        currentSection: 'Technical', 
        currentIdx: 0 
      };
      setSession(newSession);
      localStorage.setItem('aura_active_session', JSON.stringify(newSession));
      setView('intro');
    } catch (error: any) {
      alert(`Synthesis delay. Try again.`);
    } finally {
      setLoading(false);
      setDiscoveryState({ active: false, msg: '' });
    }
  };

  const handleViewPastResults = (oldSession: ExamSession) => {
    setSession(oldSession);
    setView('results');
  };

  const handleBeginExam = () => setView('exam');

  const handleExamComplete = async (answers: Record<string, UserAnswer>) => {
    if (!session) return;
    setLoading(true);
    setDiscoveryState({ active: true, msg: "Quantifying Logic Matrix..." });
    try {
      const results = await geminiService.evaluateAnswers(session.exam, answers);
      const completedSession = { ...session, answers, isCompleted: true, results };
      setSession(completedSession);
      await dbService.saveSession(completedSession);
      setHistory(dbService.getHistory());
      setView('results');
    } catch (error) {
      alert("Evaluation error.");
      setView('setup');
    } finally {
      setLoading(false);
      setDiscoveryState({ active: false, msg: '' });
    }
  };

  const handleLogout = () => {
    dbService.logout();
    setUser(null);
    setView('auth');
  };

  useEffect(() => {
    if (session && !session.isCompleted && user) {
      localStorage.setItem('aura_active_session', JSON.stringify(session));
    }
  }, [session, user]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Suspense fallback={<DiscoveryOverlay message="Syncing Network..." />}>
        {discoveryState.active && <DiscoveryOverlay message={discoveryState.msg} />}
        
        {view === 'auth' && <AuthScreen onAuthenticated={handleAuthenticated} />}
        
        {view === 'setup' && (
          <SetupScreen 
            onStart={handleStartExamRequest} 
            history={history} 
            user={user!} 
            onLogout={handleLogout}
            onViewHistory={handleViewPastResults}
          />
        )}

        {view === 'intro' && session && <ExamIntro inference={session.exam.inference!} onBegin={handleBeginExam} />}
        
        {view === 'exam' && session && (
          <ExamScreen 
            session={session} 
            onComplete={handleExamComplete} 
            onUpdateAnswers={(ans) => setSession(prev => prev ? { ...prev, answers: ans } : null)}
            onNavigate={(sec, idx) => setSession(prev => prev ? { ...prev, currentSection: sec, currentIdx: idx } : null)}
          />
        )}

        {view === 'results' && session?.results && (
          <ResultsDashboard session={session} onRestart={() => setView('setup')} />
        )}
      </Suspense>
    </div>
  );
};

export default App;
