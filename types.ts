
export enum PositionLevel {
  INTERN = 'Intern / Trainee',
  FRESHER = 'Fresher / Graduate',
  SDE_1 = 'SDE-1 / Junior',
  SDE_2 = 'SDE-2 / Mid',
  SENIOR = 'Senior / Lead',
  ARCHITECT = 'Architect / Principal'
}

export type SectionType = 'Technical' | 'Coding' | 'Quantitative' | 'Reasoning';

export interface LevelDNA {
  focus: string;
  topics: string[];
  difficulty: {
    veryEasy: number;
    easy: number;
    medium: number;
    hard: number;
    veryHard: number;
    ultraHard: number;
  };
  timeMultiplier: number;
}

export interface CompanyProfile {
  name: string;
  commonTopics: string[];
  vibe: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: number;
}

export interface CompanyInference {
  company: string;
  role: string;
  level: string;
  vibe: string;
  predictedTopics: string[];
  confidence: 'High' | 'Medium' | 'Low' | string;
  category: string;
  assumptions: string[];
  includesAptitude: boolean;
}

export interface CodingQuestion {
  id: string;
  title: string;
  problem: string;
  constraints: string;
  samples: Array<{ input: string; output: string; explanation?: string }>;
  hidden_tests: Array<{ input: string; output: string }>;
  solution_code: string; 
  solution_explanation: string;
  difficulty: 'Very Easy' | 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Ultra Hard';
  topic: string;
  starterCodes: Record<string, string>;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
  section: SectionType;
}

export interface Exam {
  id: string;
  company: string;
  role: string;
  level: PositionLevel;
  sections: {
    technical: MCQQuestion[];
    coding: CodingQuestion[];
    quantitative: MCQQuestion[];
    reasoning: MCQQuestion[];
  };
  timeMinutes: number;
  createdAt: number;
  inference?: CompanyInference;
}

export interface RunResult {
  passed: boolean;
  score: number;
  testCaseResults: Array<{
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
    isHidden?: boolean;
    category?: string;
  }>;
}

export interface UserAnswer {
  questionId: string;
  answer: string;
  language?: string;
  codeStates?: Record<string, string>; 
  runResult?: RunResult;
}

export interface EvaluationResult {
  questionId: string;
  score: number;
  feedback: string;
  correctSolution: string;
  passedCount: number;
  totalCount: number;
}

export interface ExamSession {
  id?: string;
  exam: Exam;
  answers: Record<string, UserAnswer>;
  startTime: number;
  isCompleted: boolean;
  currentSection?: SectionType;
  currentIdx?: number;
  results?: {
    totalScore: number;
    sectionScores: Record<string, number>;
    readinessScore: number;
    evaluations: EvaluationResult[];
    overallFeedback: string;
  };
}

export interface PracticeAttempt {
  id: string;
  question: CodingQuestion;
  answer: string;
  language: string;
  runResult: RunResult;
  timestamp: number;
  score: number;
}

export interface PracticeSession {
  id: string;
  topic: string;
  difficulty: string;
  questions: CodingQuestion[];
  attempts: Record<string, PracticeAttempt>;
  startTime: number;
  isCompleted: boolean;
}

export interface UserHistory {
  sessions: ExamSession[];
  practiceAttempts: PracticeAttempt[];
  averageReadiness: number;
  discoveredCompanies: Record<string, CompanyInference>;
}

export interface PracticeStats {
  totalSolved: number;
  difficultyBreakdown: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  topicsSolved: Record<string, number>;
}
