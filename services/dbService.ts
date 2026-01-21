
import { User, ExamSession, UserHistory, PracticeAttempt, PracticeStats } from '../types';

const STORAGE_KEY_SESSIONS = 'aura_db_v1_sessions';
const STORAGE_KEY_PRACTICE = 'aura_db_v1_practice';
const STORAGE_KEY_USER_DB = 'aura_db_v1_users';
const SESSION_TOKEN_KEY = 'aura_auth_token';

export const dbService = {
  async login(email: string, pass: string): Promise<User> {
    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY_USER_DB) || '[]');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error("Diagnostic Identity not found.");
    localStorage.setItem(SESSION_TOKEN_KEY, JSON.stringify(user));
    return user;
  },

  async signup(email: string, pass: string): Promise<User> {
    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY_USER_DB) || '[]');
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) throw new Error("Identity already anchored.");
    const newUser: User = { id: crypto.randomUUID(), email: email.toLowerCase(), username: email.split('@')[0], createdAt: Date.now() };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USER_DB, JSON.stringify(users));
    localStorage.setItem(SESSION_TOKEN_KEY, JSON.stringify(newUser));
    return newUser;
  },

  getCurrentUser(): User | null {
    const data = localStorage.getItem(SESSION_TOKEN_KEY);
    return data ? JSON.parse(data) : null;
  },

  logout() { localStorage.removeItem(SESSION_TOKEN_KEY); },

  async saveSession(session: ExamSession): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) return;
    const all: any[] = JSON.parse(localStorage.getItem(STORAGE_KEY_SESSIONS) || '[]');
    const sWithMeta = { ...session, userId: user.id, updatedAt: Date.now() };
    const idx = all.findIndex(s => s.exam.id === session.exam.id && s.userId === user.id);
    if (idx >= 0) all[idx] = sWithMeta; else all.unshift(sWithMeta);
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(all));
  },

  async savePracticeAttempt(attempt: PracticeAttempt): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) return;
    const all: any[] = JSON.parse(localStorage.getItem(STORAGE_KEY_PRACTICE) || '[]');
    all.unshift({ ...attempt, userId: user.id });
    localStorage.setItem(STORAGE_KEY_PRACTICE, JSON.stringify(all));
  },

  getHistory(): UserHistory {
    const user = this.getCurrentUser();
    if (!user) return { sessions: [], practiceAttempts: [], averageReadiness: 0, discoveredCompanies: {} };

    const allSessions: any[] = JSON.parse(localStorage.getItem(STORAGE_KEY_SESSIONS) || '[]');
    const allPractice: any[] = JSON.parse(localStorage.getItem(STORAGE_KEY_PRACTICE) || '[]');

    const sessions = allSessions.filter(s => s.userId === user.id);
    const practiceAttempts = allPractice.filter(p => p.userId === user.id);

    const completed = sessions.filter(s => s.isCompleted);
    const averageReadiness = completed.length ? Math.round(completed.reduce((acc, s) => acc + (s.results?.readinessScore || 0), 0) / completed.length) : 0;

    return { sessions, practiceAttempts, averageReadiness, discoveredCompanies: {} };
  },

  getPracticeStats(): PracticeStats {
    const { practiceAttempts } = this.getHistory();
    const stats: PracticeStats = {
      totalSolved: practiceAttempts.length,
      difficultyBreakdown: { Easy: 0, Medium: 0, Hard: 0 },
      topicsSolved: {}
    };

    practiceAttempts.forEach(p => {
      const diff = p.question.difficulty as 'Easy' | 'Medium' | 'Hard';
      if (stats.difficultyBreakdown[diff] !== undefined) stats.difficultyBreakdown[diff]++;
      stats.topicsSolved[p.question.topic] = (stats.topicsSolved[p.question.topic] || 0) + 1;
    });

    return stats;
  }
};
