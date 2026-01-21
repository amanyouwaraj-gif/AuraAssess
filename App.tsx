
import React, { useState, useEffect, Suspense } from 'react';
import { PositionLevel, Exam, ExamSession, UserAnswer, UserHistory, User, CodingQuestion, PracticeAttempt, PracticeSession } from './types';
import { geminiService } from './services/geminiService';
import { dbService } from './services/dbService';
import SetupScreen from './components/SetupScreen';
import ExamScreen from './components/ExamScreen';
import ResultsDashboard from './components/ResultsDashboard';
import DiscoveryOverlay from './components/DiscoveryOverlay';
import ExamIntro from './components/ExamIntro';
import AuthScreen from './components/AuthScreen';
import PracticeHub from './components/PracticeHub';
import PracticeEditor from './components/PracticeEditor';
import PracticeResults from './components/PracticeResults';
import DatabaseConfig from './components/DatabaseConfig';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'db-config' | 'auth' | 'setup' | 'intro' | 'exam' | 'results' | 'practice-hub' | 'practice-editor' | 'practice-results'>('auth');
  const [session, setSession] = useState<ExamSession | null>(null);
  const [practiceSession, setPracticeSession] = useState<PracticeSession | null>(null);
  const [history, setHistory] = useState<UserHistory>({ sessions: [], practiceAttempts: [], averageReadiness: 0, discoveredCompanies: {} });
  const [loading, setLoading] = useState(false);
  const [discoveryState, setDiscoveryState] = useState<{ active: boolean; msg: string }>({ active: false, msg: '' });
  
  useEffect(() => {
    const initApp = async () => {
      if (!dbService.isConfigured()) {
        setView('db-config');
        return;
      }
      
      try {
        await dbService.init();
        const activeUser = dbService.getCurrentUser();
        if (activeUser) {
          setUser(activeUser);
          const userHistory = await dbService.getHistory();
          setHistory(userHistory);
          setView('setup');
        } else {
          setView('auth');
        }
      } catch (e) {
        setView('db-config');
      }
    };
    initApp();
  }, []);

  const handleDbConfigured = async () => {
    setLoading(true);
    try {
      await dbService.init();
      const activeUser = dbService.getCurrentUser();
      if (activeUser) {
        setUser(activeUser);
        const userHistory = await dbService.getHistory();
        setHistory(userHistory);
        setView('setup');
      } else {
        setView('auth');
      }
    } catch (e) {
      alert("Database Handshake Failed. Please check your connection string.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticated = async (newUser: User) => {
    setUser(newUser);
    const userHistory = await dbService.getHistory();
    setHistory(userHistory);
    setView('setup');
  };

  const handleStartExamRequest = async (company: string, role: string, level: PositionLevel) => {
    setLoading(true);
    setDiscoveryState({ active: true, msg: `Mining ${company} Pattern DNA...` });
    try {
      const exam = await geminiService.generateCompleteAssessment(company, role, level);
      const newSession: ExamSession = { exam, answers: {}, startTime: Date.now(), isCompleted: false, currentSection: 'Technical', currentIdx: 0 };
      setSession(newSession);
      setView('intro');
    } catch (error: any) { 
      console.error("Exam Generation Failed:", error);
      alert(`Synthesis error: ${error.message || "Unknown API failure"}`); 
    } finally { 
      setLoading(false); 
      setDiscoveryState({ active: false, msg: '' }); 
    }
  };

  const handleStartPractice = async (topic: string, difficulty: string) => {
    setLoading(true);
    setDiscoveryState({ active: true, msg: `Synthesizing 5 Unique ${topic} Vectors...` });
    try {
      const questions = await geminiService.generatePracticeSet(topic, difficulty);
      const newPracticeSession: PracticeSession = {
        id: crypto.randomUUID(),
        topic,
        difficulty,
        questions,
        attempts: {},
        startTime: Date.now(),
        isCompleted: false
      };
      setPracticeSession(newPracticeSession);
      setView('practice-editor');
    } catch (e: any) { 
      console.error("Practice Synthesis Failed:", e);
      alert(`Matrix synthesis failed: ${e.message}`); 
    } finally { 
      setLoading(false); 
      setDiscoveryState({ active: false, msg: '' }); 
    }
  };

  const handlePracticeSessionComplete = async (finalAttempts: Record<string, PracticeAttempt>) => {
    setLoading(true);
    setDiscoveryState({ active: true, msg: "Archiving Practice Trace to Neon..." });
    try {
      for (const attempt of Object.values(finalAttempts)) {
        await dbService.savePracticeAttempt(attempt);
      }
      setPracticeSession(prev => prev ? { ...prev, attempts: finalAttempts, isCompleted: true } : null);
      const userHistory = await dbService.getHistory();
      setHistory(userHistory);
      setView('practice-results');
    } catch (e) { alert("Persistence failure."); } finally { setLoading(false); setDiscoveryState({ active: false, msg: '' }); }
  };

  const handleExamComplete = async (answers: Record<string, UserAnswer>) => {
    if (!session) return;
    setLoading(true);
    setDiscoveryState({ active: true, msg: "Quantifying Logic Matrix..." });
    try {
      const results = await geminiService.evaluateAnswers(session.exam, answers);
      const completedSession = { ...session, answers, isCompleted: true, results };
      setSession(completedSession);
      await dbService.saveSession(completedSession);
      const userHistory = await dbService.getHistory();
      setHistory(userHistory);
      setView('results');
    } catch (error) { alert("Evaluation error."); setView('setup'); } finally { setLoading(false); setDiscoveryState({ active: false, msg: '' }); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Suspense fallback={<DiscoveryOverlay message="Syncing Network..." />}>
        {discoveryState.active && <DiscoveryOverlay message={discoveryState.msg} />}
        
        {view === 'db-config' && <DatabaseConfig onConfigured={handleDbConfigured} />}
        
        {view === 'auth' && <AuthScreen onAuthenticated={handleAuthenticated} />}
        
        {view === 'setup' && (
          <SetupScreen 
            onStart={handleStartExamRequest} 
            onEnterPractice={() => setView('practice-hub')}
            history={history} 
            user={user!} 
            onLogout={() => { dbService.logout(); setUser(null); setView('auth'); }}
            onViewHistory={(s) => { setSession(s); setView('results'); }}
          />
        )}

        {view === 'practice-hub' && (
          <PracticeHub 
            history={history} 
            onStartPractice={handleStartPractice} 
            onBack={() => setView('setup')} 
          />
        )}

        {view === 'practice-editor' && practiceSession && (
          <PracticeEditor 
            session={practiceSession} 
            onComplete={handlePracticeSessionComplete} 
            onBack={() => setView('practice-hub')} 
          />
        )}

        {view === 'practice-results' && practiceSession && (
          <PracticeResults 
            session={practiceSession} 
            onDone={() => setView('practice-hub')} 
          />
        )}

        {view === 'intro' && session && <ExamIntro inference={session.exam.inference!} onBegin={() => setView('exam')} />}
        
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
