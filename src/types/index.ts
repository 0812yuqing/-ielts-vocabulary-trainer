// Core vocabulary data types
export interface Vocabulary {
  id: string;
  word: string;
  pronunciation: string;
  definitions: Definition[];
  difficulty: number; // 1-10
  frequency: number; // 0-100
  tags: string[];
  audioUrl?: string;
  imageUrl?: string;
}

export interface Definition {
  partOfSpeech: string;
  meaning: string;
  examples: string[];
  synonyms?: string[];
  antonyms?: string[];
}

// User data types
export interface UserData {
  id: string;
  username: string;
  level: number;
  experience: number;
  streak: number;
  achievements: string[];
  statistics: UserStatistics;
  settings: StudySettings;
  createdAt: string;
  lastActiveAt: string;
}

export interface UserStatistics {
  totalWordsStudied: number;
  totalStudyTime: number; // in milliseconds
  averageAccuracy: number; // 0-100
  dailyGoalStreak: number;
  testResults: TestResult[];
}

export interface StudySettings {
  dailyGoal: number;
  studyReminder: boolean;
  reminderTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  soundEnabled: boolean;
  darkMode: boolean;
  autoPlayAudio: boolean;
  studyMode: 'learn' | 'test' | 'mixed';
}

// Study session types
export interface StudySession {
  id: string;
  userId: string;
  startTime: number;
  endTime?: number;
  wordsStudied: string[];
  totalCorrect: number;
  totalTime: number;
  sessionType: 'learn' | 'review' | 'test';
}

export interface StudyRecord {
  id: string;
  wordId: string;
  userId: string;
  masteryLevel: number; // 0-100
  reviewCount: number;
  correctCount: number;
  lastReviewAt: string;
  nextReviewAt: string;
  studyTime: number; // in milliseconds
  createdAt: string;
}

export interface StudyResult {
  wordId: string;
  isCorrect: boolean;
  timeSpent: number; // in milliseconds
  userAnswer?: string;
  timestamp: string;
}

// Test and assessment types
export interface TestQuestion {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'matching' | 'context';
  wordId: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  context?: string;
  difficulty: number;
  timeLimit?: number;
}

export interface TestSession {
  id: string;
  userId: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'master';
  questions: TestQuestion[];
  answers: TestAnswer[];
  startTime: number;
  endTime?: number;
  score: number;
  maxScore: number;
  passed: boolean;
}

export interface TestAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeUsed: number;
}

export interface TestResult {
  id: string;
  testId: string;
  score: number;
  maxScore: number;
  accuracy: number;
  timeSpent: number;
  completedAt: string;
  weakAreas: string[];
}

// Gamification types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'consistency' | 'mastery' | 'speed' | 'social';
  requirements: AchievementRequirement[];
  reward: AchievementReward;
  unlockedAt?: string;
}

export interface AchievementRequirement {
  type: 'words_learned' | 'streak_days' | 'test_score' | 'accuracy' | 'time_spent';
  target: number;
  comparison: 'greater_than_or_equal' | 'greater_than' | 'equal';
}

export interface AchievementReward {
  experience: number;
  items?: string[];
  title?: string;
}

// Progress tracking types
export interface DailyProgress {
  date: string;
  target: number;
  completed: number;
  newWords: number;
  reviewWords: number;
  accuracy: number;
  timeSpent: number; // in seconds
}

export interface WeeklyProgress {
  weekStart: string;
  dailyProgress: DailyProgress[];
  totalWords: number;
  averageAccuracy: number;
  totalTimeSpent: number;
  achievements: string[];
}

export interface VocabularyProgress {
  wordId: string;
  word: string;
  masteryLevel: number;
  reviewCount: number;
  correctRate: number;
  lastReviewed: string;
  nextReview: string;
  difficulty: number;
}

// Storage and sync types
export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface SyncData {
  user: UserData;
  studyRecords: Record<string, StudyRecord>;
  testResults: TestResult[];
  achievements: Achievement[];
  exportedAt: string;
}

// UI component types
export interface ComponentSize {
  sm: string;
  md: string;
  lg: string;
}

export interface PixelCardProps {
  variant: 'default' | 'bordered' | 'elevated';
  className?: string;
  children: React.ReactNode;
}

export interface PixelButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'power-up';
  pixelSize?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export interface PixelProgressProps {
  label: string;
  value: number;
  max: number;
  variant?: 'exp' | 'health' | 'time';
  showPercentage?: boolean;
  className?: string;
}

// Audio and media types
export interface AudioSettings {
  enabled: boolean;
  volume: number;
  autoPlay: boolean;
  voiceRate: number;
  voicePitch: number;
}

export interface MediaFile {
  url: string;
  type: 'audio' | 'image';
  size: number;
  cached: boolean;
}

// Network and offline types
export interface NetworkStatus {
  isOnline: boolean;
  networkType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

export interface OfflineAction {
  id: string;
  action: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

// Search and filter types
export interface SearchFilters {
  difficulty?: number[];
  tags?: string[];
  masteryLevel?: [number, number];
  lastReviewed?: string;
}

export interface SearchResult {
  word: Vocabulary;
  relevance: number;
  matchedFields: string[];
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;