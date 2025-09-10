import { create } from 'zustand';
import { storage } from '../utils/storage';
import { vocabularyLoader } from '../utils/vocabularyLoader';
import { spacedRepetition } from '../utils/algorithms';
import { StudySession, StudyRecord, StudyResult, DailyProgress, Vocabulary } from '../types';

interface StudyState {
  currentSession: StudySession | null;
  todayProgress: DailyProgress;
  isSessionActive: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  startSession: (sessionType: 'learn' | 'review' | 'test') => void;
  endSession: () => void;
  recordWordStudy: (wordId: string, result: StudyResult) => Promise<void>;
  getTodayProgress: () => Promise<void>;
  getReviewWords: () => Promise<Vocabulary[]>;
  getStudyHistory: (limit?: number) => Promise<StudyRecord[]>;
  getMasteryLevel: (wordId: string) => Promise<number>;
  pauseSession: () => void;
  resumeSession: () => void;
  clearError: () => void;
}

export const useStudyStore = create<StudyState>((set, get) => ({
  currentSession: null,
  todayProgress: {
    date: new Date().toDateString(),
    target: 20,
    completed: 0,
    newWords: 0,
    reviewWords: 0,
    accuracy: 0,
    timeSpent: 0
  },
  isSessionActive: false,
  isLoading: false,
  error: null,

  startSession: (sessionType: 'learn' | 'review' | 'test') => {
    const { user } = useUserStore.getState();
    if (!user) return;

    const session: StudySession = {
      id: crypto.randomUUID(),
      userId: user.id,
      startTime: Date.now(),
      wordsStudied: [],
      totalCorrect: 0,
      totalTime: 0,
      sessionType
    };

    set({ 
      currentSession: session, 
      isSessionActive: true,
      error: null 
    });
  },

  endSession: () => {
    const { currentSession } = get();
    if (!currentSession) return;

    const totalTime = Date.now() - currentSession.startTime;
    const exp = currentSession.wordsStudied.length * 10 + currentSession.totalCorrect * 5;
    
    // Update user experience
    useUserStore.getState().addExperience(exp);
    
    // Update user statistics
    const { user } = useUserStore.getState();
    if (user) {
      const updatedStats = {
        ...user.statistics,
        totalWordsStudied: user.statistics.totalWordsStudied + currentSession.wordsStudied.length,
        totalStudyTime: user.statistics.totalStudyTime + totalTime
      };
      
      useUserStore.getState().updateUser({ statistics: updatedStats });
    }

    set({ 
      currentSession: null, 
      isSessionActive: false 
    });
    
    // Update today's progress
    get().getTodayProgress();
  },

  recordWordStudy: async (wordId: string, result: StudyResult) => {
    const { currentSession } = get();
    const { user } = useUserStore.getState();
    
    if (!currentSession || !user) return;

    try {
      // Get or create study record
      let record = await storage.getStudyRecord(wordId, user.id);
      
      if (record) {
        // Update existing record
        const newMasteryLevel = spacedRepetition.calculateMasteryLevel(
          record.masteryLevel,
          record.reviewCount,
          result.isCorrect
        );
        
        record = {
          ...record,
          masteryLevel: newMasteryLevel,
          reviewCount: record.reviewCount + 1,
          correctCount: record.correctCount + (result.isCorrect ? 1 : 0),
          lastReviewAt: new Date().toISOString(),
          nextReviewAt: spacedRepetition.calculateNextReview(
            newMasteryLevel,
            record.reviewCount + 1,
            result.isCorrect
          ).toISOString(),
          studyTime: record.studyTime + result.timeSpent
        };
      } else {
        // Create new record
        record = {
          id: crypto.randomUUID(),
          wordId,
          userId: user.id,
          masteryLevel: result.isCorrect ? 25 : 5,
          reviewCount: 1,
          correctCount: result.isCorrect ? 1 : 0,
          lastReviewAt: new Date().toISOString(),
          nextReviewAt: spacedRepetition.calculateNextReview(
            result.isCorrect ? 25 : 5,
            1,
            result.isCorrect
          ).toISOString(),
          studyTime: result.timeSpent,
          createdAt: new Date().toISOString()
        };
      }
      
      await storage.saveStudyRecord(record);

      // Update current session
      const updatedSession = {
        ...currentSession,
        wordsStudied: [...currentSession.wordsStudied, wordId],
        totalCorrect: currentSession.totalCorrect + (result.isCorrect ? 1 : 0),
        totalTime: currentSession.totalTime + result.timeSpent
      };

      set({ currentSession: updatedSession });

      // Add experience for studying
      const expGain = result.isCorrect ? 10 : 5;
      useUserStore.getState().addExperience(expGain);

      // Update today's progress
      get().getTodayProgress();

    } catch (error) {
      console.error('Failed to record word study:', error);
      set({ error: 'Failed to record study progress' });
    }
  },

  getTodayProgress: async () => {
    const { user } = useUserStore.getState();
    if (!user) return;

    try {
      const records = await storage.getStudyRecordsByUser(user.id);
      const today = new Date().toDateString();
      
      const todayRecords = records.filter(record =>
        new Date(record.lastReviewAt).toDateString() === today
      );

      const newWords = todayRecords.filter(r => r.reviewCount === 1).length;
      const reviewWords = todayRecords.filter(r => r.reviewCount > 1).length;
      const totalCorrect = todayRecords.reduce((sum, r) => sum + r.correctCount, 0);
      const totalReviews = todayRecords.reduce((sum, r) => sum + r.reviewCount, 0);
      const totalTime = todayRecords.reduce((sum, r) => sum + r.studyTime, 0);

      const todayProgress: DailyProgress = {
        date: today,
        target: user.settings.dailyGoal,
        completed: todayRecords.length,
        newWords,
        reviewWords,
        accuracy: totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0,
        timeSpent: Math.floor(totalTime / 1000) // Convert to seconds
      };

      set({ todayProgress });

    } catch (error) {
      console.error('Failed to get today\'s progress:', error);
      set({ error: 'Failed to load progress data' });
    }
  },

  getReviewWords: async () => {
    const { user } = useUserStore.getState();
    if (!user) return [];

    try {
      await vocabularyLoader.loadVocabularyData();
      const records = await storage.getStudyRecordsByUser(user.id);
      const now = new Date();

      const reviewRecords = records.filter(record =>
        new Date(record.nextReviewAt) <= now
      );

      // Get vocabulary details for review words
      const allWords = vocabularyLoader.getAllWords();
      const reviewWords = reviewRecords
        .map(record => allWords.find(word => word.id === record.wordId))
        .filter(Boolean) as Vocabulary[];

      // Sort by mastery level (lowest first)
      return reviewWords
        .sort((a, b) => {
          const recordA = records.find(r => r.wordId === a.id);
          const recordB = records.find(r => r.wordId === b.id);
          return (recordA?.masteryLevel || 0) - (recordB?.masteryLevel || 0);
        })
        .slice(0, 50);

    } catch (error) {
      console.error('Failed to get review words:', error);
      set({ error: 'Failed to load review words' });
      return [];
    }
  },

  getStudyHistory: async (limit = 50) => {
    const { user } = useUserStore.getState();
    if (!user) return [];

    try {
      const records = await storage.getStudyRecordsByUser(user.id);
      
      // Sort by last review date (newest first)
      return records
        .sort((a, b) => new Date(b.lastReviewAt).getTime() - new Date(a.lastReviewAt).getTime())
        .slice(0, limit);

    } catch (error) {
      console.error('Failed to get study history:', error);
      set({ error: 'Failed to load study history' });
      return [];
    }
  },

  getMasteryLevel: async (wordId: string) => {
    const { user } = useUserStore.getState();
    if (!user) return 0;

    try {
      const record = await storage.getStudyRecord(wordId, user.id);
      return record?.masteryLevel || 0;
    } catch (error) {
      console.error('Failed to get mastery level:', error);
      return 0;
    }
  },

  pauseSession: () => {
    const { currentSession } = get();
    if (!currentSession) return;

    // Pausing functionality could be implemented here
    set({ isSessionActive: false });
  },

  resumeSession: () => {
    set({ isSessionActive: true });
  },

  clearError: () => {
    set({ error: null });
  }
}));