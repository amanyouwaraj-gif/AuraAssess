
import { neon } from '@neondatabase/serverless';
import { User, ExamSession, UserHistory, PracticeAttempt, PracticeStats } from '../types';

const SESSION_TOKEN_KEY = 'aura_auth_token';
const DB_URL_SESSION_KEY = 'aura_db_runtime_url';

const DEFAULT_DATABASE_URL = "postgresql://neondb_owner:npg_i1RSdtf0nbjM@ep-wispy-glade-ah68u421-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

let _sql: any = null;
let _runtimeUrl: string | null = typeof window !== 'undefined' ? sessionStorage.getItem(DB_URL_SESSION_KEY) : null;

export const setDbRuntimeUrl = (url: string) => {
  _runtimeUrl = url;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(DB_URL_SESSION_KEY, url);
  }
  _sql = neon(url);
};

const getSql = () => {
  if (_sql) return _sql;
  
  const url = (process.env.DATABASE_URL) || _runtimeUrl || DEFAULT_DATABASE_URL;
  if (!url) {
    throw new Error("Neon Database URL not found.");
  }
  
  _sql = neon(url);
  return _sql;
};

export const dbService = {
  isConfigured(): boolean {
    return !!((process.env.DATABASE_URL) || _runtimeUrl || DEFAULT_DATABASE_URL);
  },

  async init(): Promise<void> {
    if (!this.isConfigured()) return;
    try {
      const sql = getSql();
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          username TEXT NOT NULL,
          created_at BIGINT NOT NULL
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS sessions (
          id UUID PRIMARY KEY,
          user_id UUID NOT NULL,
          exam_data JSONB NOT NULL,
          answers JSONB NOT NULL,
          is_completed BOOLEAN DEFAULT FALSE,
          results JSONB,
          updated_at BIGINT NOT NULL
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS practice_attempts (
          id UUID PRIMARY KEY,
          user_id UUID NOT NULL,
          question_data JSONB NOT NULL,
          answer TEXT NOT NULL,
          language TEXT NOT NULL,
          run_result JSONB NOT NULL,
          score INTEGER NOT NULL,
          timestamp BIGINT NOT NULL
        );
      `;
      console.log("Database Protocol: Online.");
    } catch (e: any) {
      console.warn("Infrastructure warning (Initial sync):", e.message);
    }
  },

  async login(email: string, pass: string): Promise<User> {
    const sql = getSql();
    const result = await sql`
      SELECT * FROM users WHERE LOWER(email) = LOWER(${email}) AND password = ${pass}
    `;
    if (result.length === 0) throw new Error("Diagnostic Identity not found.");
    const user: User = {
      id: result[0].id,
      email: result[0].email,
      username: result[0].username,
      createdAt: result[0].created_at
    };
    localStorage.setItem(SESSION_TOKEN_KEY, JSON.stringify(user));
    return user;
  },

  async signup(email: string, pass: string): Promise<User> {
    const sql = getSql();
    const check = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${email})`;
    if (check.length > 0) throw new Error("Identity already anchored.");
    
    const newUser: User = { 
      id: crypto.randomUUID(), 
      email: email.toLowerCase(), 
      username: email.split('@')[0], 
      createdAt: Date.now() 
    };
    
    await sql`
      INSERT INTO users (id, email, password, username, created_at)
      VALUES (${newUser.id}, ${newUser.email}, ${pass}, ${newUser.username}, ${newUser.createdAt})
    `;
    
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
    
    const sql = getSql();
    const id = session.id || crypto.randomUUID();
    await sql`
      INSERT INTO sessions (id, user_id, exam_data, answers, is_completed, results, updated_at)
      VALUES (${id}, ${user.id}, ${JSON.stringify(session.exam)}, ${JSON.stringify(session.answers)}, ${session.isCompleted}, ${JSON.stringify(session.results)}, ${Date.now()})
      ON CONFLICT (id) DO UPDATE SET
        exam_data = EXCLUDED.exam_data,
        answers = EXCLUDED.answers,
        is_completed = EXCLUDED.is_completed,
        results = EXCLUDED.results,
        updated_at = EXCLUDED.updated_at
    `;
  },

  async savePracticeAttempt(attempt: PracticeAttempt): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) return;
    
    const sql = getSql();
    await sql`
      INSERT INTO practice_attempts (id, user_id, question_data, answer, language, run_result, score, timestamp)
      VALUES (${attempt.id}, ${user.id}, ${JSON.stringify(attempt.question)}, ${attempt.answer}, ${attempt.language}, ${JSON.stringify(attempt.runResult)}, ${attempt.score}, ${attempt.timestamp})
    `;
  },

  async getHistory(): Promise<UserHistory> {
    const user = this.getCurrentUser();
    if (!user) return { sessions: [], practiceAttempts: [], averageReadiness: 0, discoveredCompanies: {} };

    try {
      const sql = getSql();
      const sessionsRaw = await sql`SELECT * FROM sessions WHERE user_id = ${user.id} ORDER BY updated_at DESC`;
      const practiceRaw = await sql`SELECT * FROM practice_attempts WHERE user_id = ${user.id} ORDER BY timestamp DESC`;

      const sessions: ExamSession[] = sessionsRaw.map(s => ({
        id: s.id,
        exam: s.exam_data,
        answers: s.answers,
        startTime: s.updated_at,
        isCompleted: s.is_completed,
        results: s.results
      }));

      const practiceAttempts: PracticeAttempt[] = practiceRaw.map(p => ({
        id: p.id,
        question: p.question_data,
        answer: p.answer,
        language: p.language,
        runResult: p.run_result,
        timestamp: p.timestamp,
        score: p.score
      }));

      const completed = sessions.filter(s => s.isCompleted);
      const averageReadiness = completed.length ? Math.round(completed.reduce((acc, s) => acc + (s.results?.readinessScore || 0), 0) / completed.length) : 0;

      return { sessions, practiceAttempts, averageReadiness, discoveredCompanies: {} };
    } catch (e) {
      return { sessions: [], practiceAttempts: [], averageReadiness: 0, discoveredCompanies: {} };
    }
  },

  async getPracticeStats(): Promise<PracticeStats> {
    const { practiceAttempts } = await this.getHistory();
    const stats: PracticeStats = {
      totalSolved: practiceAttempts.length,
      difficultyBreakdown: { Easy: 0, Medium: 0, Hard: 0 },
      topicsSolved: {}
    };

    practiceAttempts.forEach(p => {
      let diff = p.question.difficulty;
      if (diff === 'Very Easy') diff = 'Easy';
      if (diff === 'Very Hard' || diff === 'Ultra Hard') diff = 'Hard';
      
      const key = diff as keyof typeof stats.difficultyBreakdown;
      if (stats.difficultyBreakdown[key] !== undefined) {
        stats.difficultyBreakdown[key]++;
      } else {
        stats.difficultyBreakdown.Medium++;
      }
      
      const topic = p.question.topic || 'Unknown';
      stats.topicsSolved[topic] = (stats.topicsSolved[topic] || 0) + 1;
    });

    return stats;
  }
};
