
import { User, ExamSession, UserHistory } from '../types';

/**
 * PRODUCTION ARCHITECTURE: SIMULATED NEON POSTGRES PROXY
 * Connection String: postgresql://neondb_owner:npg_i1RSdtf0nbjM@ep-wispy-glade-ah68u421-pooler.c-3.us-east-1.aws.neon.tech/neondb
 * This service handles data partitioning to ensure users only see their own logic patterns.
 */

const STORAGE_KEY_SESSIONS = 'aura_db_v1_sessions';
const STORAGE_KEY_USER_DB = 'aura_db_v1_users';
const SESSION_TOKEN_KEY = 'aura_auth_token';

export const dbService = {
  async login(email: string, pass: string): Promise<User> {
    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY_USER_DB) || '[]');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error("Diagnostic Identity not found. Please register.");
    }

    // In a live environment, hash verification would occur here.
    localStorage.setItem(SESSION_TOKEN_KEY, JSON.stringify(user));
    return user;
  },

  async signup(email: string, pass: string): Promise<User> {
    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY_USER_DB) || '[]');
    
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Identity already anchored in our clusters.");
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      username: email.split('@')[0],
      createdAt: Date.now()
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USER_DB, JSON.stringify(users));
    localStorage.setItem(SESSION_TOKEN_KEY, JSON.stringify(newUser));
    return newUser;
  },

  getCurrentUser(): User | null {
    const data = localStorage.getItem(SESSION_TOKEN_KEY);
    return data ? JSON.parse(data) : null;
  },

  logout() {
    localStorage.removeItem(SESSION_TOKEN_KEY);
  },

  async saveSession(session: ExamSession): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) throw new Error("Unauthorized data stream.");

    const allSessions: (ExamSession & { userId: string })[] = 
      JSON.parse(localStorage.getItem(STORAGE_KEY_SESSIONS) || '[]');

    const sessionWithMetadata = { 
      ...session, 
      userId: user.id, 
      updatedAt: Date.now() 
    };

    const idx = allSessions.findIndex(s => s.exam.id === session.exam.id && s.userId === user.id);
    
    if (idx >= 0) {
      allSessions[idx] = sessionWithMetadata;
    } else {
      allSessions.unshift(sessionWithMetadata);
    }

    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(allSessions));
  },

  getHistory(): UserHistory {
    const user = this.getCurrentUser();
    if (!user) return { sessions: [], averageReadiness: 0, discoveredCompanies: {} };

    const allSessions: (ExamSession & { userId: string })[] = 
      JSON.parse(localStorage.getItem(STORAGE_KEY_SESSIONS) || '[]');
    
    // STRICT ISOLATION FILTER: Partitioning logic mimicking Postgres WHERE userId = $1
    const userSessions = allSessions
      .filter(s => s.userId === user.id)
      .sort((a, b) => b.startTime - a.startTime);

    const completed = userSessions.filter(s => s.isCompleted);
    const averageReadiness = completed.length 
      ? Math.round(completed.reduce((acc, s) => acc + (s.results?.readinessScore || 0), 0) / completed.length)
      : 0;

    return { 
      sessions: userSessions, 
      averageReadiness, 
      discoveredCompanies: {} 
    };
  }
};
