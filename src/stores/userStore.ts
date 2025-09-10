import { create } from 'zustand';
import { storage } from '../utils/storage';
import { vocabularyLoader } from '../utils/vocabularyLoader';
import { UserData, StudySettings, UserStatistics, Achievement } from '../types';

interface UserState {
  user: UserData | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializeUser: (username: string) => Promise<void>;
  updateUser: (updates: Partial<UserData>) => Promise<void>;
  addExperience: (exp: number) => void;
  updateLevel: (newLevel: number) => void;
  updateStreak: () => void;
  addAchievement: (achievementId: string) => void;
  updateSettings: (settings: Partial<StudySettings>) => Promise<void>;
  checkLevelAchievements: (level: number) => void;
  checkAchievements: () => void;
  logout: () => void;
  resetProgress: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isInitialized: false,
  isLoading: false,
  error: null,

  initializeUser: async (username: string) => {
    set({ isLoading: true, error: null });
    
    try {
      let user = await storage.getUserData();
      
      if (!user) {
        // Create new user
        user = {
          id: crypto.randomUUID(),
          username,
          level: 1,
          experience: 0,
          streak: 0,
          achievements: [],
          statistics: {
            totalWordsStudied: 0,
            totalStudyTime: 0,
            averageAccuracy: 0,
            dailyGoalStreak: 0,
            testResults: []
          },
          settings: {
            dailyGoal: 20,
            studyReminder: true,
            reminderTime: '20:00',
            difficulty: 'medium',
            soundEnabled: true,
            darkMode: false,
            autoPlayAudio: false,
            studyMode: 'mixed'
          },
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString()
        };
        
        await storage.saveUserData(user);
      } else {
        // Update last active time
        user.lastActiveAt = new Date().toISOString();
        await storage.saveUserData(user);
      }
      
      set({ user, isInitialized: true, isLoading: false });
      
      // Check for achievements
      get().checkAchievements();
      
    } catch (error) {
      console.error('Failed to initialize user:', error);
      set({ 
        error: 'Failed to initialize user data', 
        isLoading: false 
      });
    }
  },

  updateUser: async (updates: Partial<UserData>) => {
    const { user } = get();
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...updates };
      await storage.saveUserData(updatedUser);
      set({ user: updatedUser });
    } catch (error) {
      console.error('Failed to update user:', error);
      set({ error: 'Failed to update user data' });
    }
  },

  addExperience: (exp: number) => {
    const { user } = get();
    if (!user) return;

    const newExp = user.experience + exp;
    const newLevel = Math.floor(newExp / 1000) + 1;
    
    const updatedUser = {
      ...user,
      experience: newExp,
      level: newLevel
    };
    
    storage.saveUserData(updatedUser);
    set({ user: updatedUser });

    // Check for level achievements
    if (newLevel > user.level) {
      get().checkLevelAchievements(newLevel);
    }
  },

  updateLevel: (newLevel: number) => {
    const { user } = get();
    if (!user) return;

    const updatedUser = {
      ...user,
      level: newLevel
    };
    
    storage.saveUserData(updatedUser);
    set({ user: updatedUser });
  },

  updateStreak: () => {
    const { user } = get();
    if (!user) return;

    const today = new Date().toDateString();
    const lastActive = new Date(user.lastActiveAt).toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let newStreak = user.streak;
    
    if (lastActive === yesterday) {
      newStreak += 1;
    } else if (lastActive !== today) {
      newStreak = 1;
    }

    const updatedUser = {
      ...user,
      streak: newStreak,
      lastActiveAt: new Date().toISOString()
    };
    
    storage.saveUserData(updatedUser);
    set({ user: updatedUser });
  },

  addAchievement: (achievementId: string) => {
    const { user } = get();
    if (!user || user.achievements.includes(achievementId)) return;

    const updatedUser = {
      ...user,
      achievements: [...user.achievements, achievementId]
    };
    
    storage.saveUserData(updatedUser);
    set({ user: updatedUser });
  },

  updateSettings: async (settings: Partial<StudySettings>) => {
    const { user } = get();
    if (!user) return;

    try {
      const updatedUser = {
        ...user,
        settings: { ...user.settings, ...settings }
      };
      
      await storage.saveUserData(updatedUser);
      set({ user: updatedUser });
    } catch (error) {
      console.error('Failed to update settings:', error);
      set({ error: 'Failed to update settings' });
    }
  },

  checkLevelAchievements: (level: number) => {
    const levelAchievements = [
      { level: 5, id: 'first_milestone' },
      { level: 10, id: 'dedicated_learner' },
      { level: 20, id: 'vocabulary_expert' },
      { level: 30, id: 'word_master' },
      { level: 50, id: 'ielts_legend' }
    ];

    levelAchievements.forEach(achievement => {
      if (level >= achievement.level) {
        get().addAchievement(achievement.id);
      }
    });
  },

  checkAchievements: () => {
    const { user } = get();
    if (!user) return;

    // Check streak achievements
    const streakAchievements = [
      { streak: 7, id: 'week_warrior' },
      { streak: 30, id: 'monthly_champion' },
      { streak: 100, id: 'century_club' }
    ];

    streakAchievements.forEach(achievement => {
      if (user.streak >= achievement.streak) {
        get().addAchievement(achievement.id);
      }
    });

    // Check word count achievements
    const wordAchievements = [
      { words: 50, id: 'half_century' },
      { words: 100, id: 'century' },
      { words: 500, id: 'vocabulary_collector' },
      { words: 1000, id: 'word_conqueror' }
    ];

    wordAchievements.forEach(achievement => {
      if (user.statistics.totalWordsStudied >= achievement.words) {
        get().addAchievement(achievement.id);
      }
    });
  },

  logout: () => {
    set({ user: null, isInitialized: false });
  },

  resetProgress: async () => {
    const { user } = get();
    if (!user) return;

    try {
      // Reset user data but keep settings
      const resetUser = {
        ...user,
        level: 1,
        experience: 0,
        streak: 0,
        achievements: [],
        statistics: {
          totalWordsStudied: 0,
          totalStudyTime: 0,
          averageAccuracy: 0,
          dailyGoalStreak: 0,
          testResults: []
        },
        lastActiveAt: new Date().toISOString()
      };

      await storage.saveUserData(resetUser);
      await storage.remove('studyRecords');
      await storage.remove('testRecords');
      
      set({ user: resetUser });
    } catch (error) {
      console.error('Failed to reset progress:', error);
      set({ error: 'Failed to reset progress' });
    }
  }
}));