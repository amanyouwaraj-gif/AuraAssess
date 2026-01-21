
import { PositionLevel, LevelDNA, CompanyProfile } from './types';

export const LEVEL_DNA: Record<PositionLevel, LevelDNA> = {
  [PositionLevel.INTERN]: {
    focus: 'Fundamental syntax, basic logic, and arithmetic',
    topics: ['Variables', 'Simple Loops', 'Basic Arithmetic', 'Basic SQL'],
    difficulty: { veryEasy: 50, easy: 40, medium: 10, hard: 0, veryHard: 0, ultraHard: 0 },
    timeMultiplier: 1.5,
  },
  [PositionLevel.FRESHER]: {
    focus: 'DSA basics, coding accuracy, and quantitative aptitude',
    topics: ['Arrays', 'Strings', 'HashMaps', 'Recursion', 'Basic Sorting'],
    difficulty: { veryEasy: 10, easy: 40, medium: 40, hard: 10, veryHard: 0, ultraHard: 0 },
    timeMultiplier: 1.2,
  },
  [PositionLevel.SDE_1]: {
    focus: 'Algorithmic efficiency and problem solving',
    topics: ['Sliding Window', 'Two Pointers', 'Trees', 'Graphs', 'DP'],
    difficulty: { veryEasy: 0, easy: 20, medium: 50, hard: 25, veryHard: 5, ultraHard: 0 },
    timeMultiplier: 1.0,
  },
  [PositionLevel.SDE_2]: {
    focus: 'Advanced DSA, optimization, and system thinking',
    topics: ['Advanced DP', 'Graph Coloring', 'Concurrency', 'Low-Level Design'],
    difficulty: { veryEasy: 0, easy: 0, medium: 30, hard: 50, veryHard: 20, ultraHard: 0 },
    timeMultiplier: 1.0,
  },
  [PositionLevel.SENIOR]: {
    focus: 'System design, complex scaling, and architectural tradeoffs',
    topics: ['High-Level Design', 'Distributed Systems', 'Caching Strategies', 'Security'],
    difficulty: { veryEasy: 0, easy: 0, medium: 0, hard: 40, veryHard: 40, ultraHard: 20 },
    timeMultiplier: 1.0,
  },
  [PositionLevel.ARCHITECT]: {
    focus: 'Enterprise architecture, reliability, and extreme performance',
    topics: ['Consensus Protocols', 'CAP Theorem', 'Fault Tolerance', 'Multi-region scaling'],
    difficulty: { veryEasy: 0, easy: 0, medium: 0, hard: 0, veryHard: 40, ultraHard: 60 },
    timeMultiplier: 1.2,
  },
};

export const COMPANIES: CompanyProfile[] = [
  { name: 'Google', commonTopics: ['Graphs', 'Tries', 'Complex DP'], vibe: 'Extremely algorithmic, emphasis on clean code' },
  { name: 'Amazon', commonTopics: ['Trees', 'Heaps', 'System Design'], vibe: 'Heavy focus on Leadership Principles and scale' },
  { name: 'Meta', commonTopics: ['Arrays', 'Strings', 'Binary Search'], vibe: 'Fast coding, accuracy under pressure' },
  { name: 'Microsoft', commonTopics: ['Linked Lists', 'Trees', 'Logic Puzzles'], vibe: 'Fundamental focus, OS concepts' },
  { name: 'Netflix', commonTopics: ['Concurrency', 'Distributed Systems', 'System Design'], vibe: 'Efficiency and culture-fit focused' },
  { name: 'Uber', commonTopics: ['Graph Algorithms', 'Geometry', 'Real-time Systems'], vibe: 'Hard algorithmic challenges' },
];

export const DSA_TOPICS = [
  'Arrays & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Linked List',
  'Trees',
  'Heaps',
  'Backtracking',
  'Graphs',
  'Dynamic Programming',
  'Bit Manipulation',
  'Advanced Graphs',
  'Math & Geometry'
];

export const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
];
