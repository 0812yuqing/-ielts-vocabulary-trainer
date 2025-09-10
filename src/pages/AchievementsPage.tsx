import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Lock, 
  Unlock, 
  Zap, 
  Target, 
  Clock,
  TrendingUp,
  Award,
  Crown,
  Medal,
  Sparkles,
  Gift,
  Calendar,
  BookOpen,
  Brain,
  CheckCircle
} from 'lucide-react';
import { PixelCard } from '../components/ui/PixelCard';
import { PixelButton } from '../components/ui/PixelButton';
import { PixelProgress } from '../components/ui/PixelProgress';
import { useUserStore } from '../stores/userStore';
import { useStudyStore } from '../stores/studyStore';
import { useTestStore } from '../stores/testStore';
import { Achievement } from '../types';

interface AchievementProgress {
  achievement: Achievement;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  reward: number;
  completed: boolean;
  progress: number;
  target: number;
}

export const AchievementsPage: React.FC = () => {
  const { user, unlockAchievement } = useUserStore();
  const { studyHistory } = useStudyStore();
  const { testHistory } = useTestStore();
  
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Define achievements
  const achievements: Achievement[] = [
    // Learning Milestones
    {
      id: 'first_word',
      name: 'First Steps',
      description: 'Study your first word',
      icon: '🌟',
      category: 'learning',
      requirement: { type: 'words_studied', value: 1 },
      reward: { exp: 50, title: 'Word Explorer' }
    },
    {
      id: 'word_novice',
      name: 'Word Novice',
      description: 'Study 50 words',
      icon: '📚',
      category: 'learning',
      requirement: { type: 'words_studied', value: 50 },
      reward: { exp: 100, title: 'Novice Learner' }
    },
    {
      id: 'word_expert',
      name: 'Word Expert',
      description: 'Study 200 words',
      icon: '🎓',
      category: 'learning',
      requirement: { type: 'words_studied', value: 200 },
      reward: { exp: 300, title: 'Word Expert' }
    },
    {
      id: 'word_master',
      name: 'Word Master',
      description: 'Study 500 words',
      icon: '👑',
      category: 'learning',
      requirement: { type: 'words_studied', value: 500 },
      reward: { exp: 500, title: 'Word Master' }
    },
    
    // Accuracy Achievements
    {
      id: 'accuracy_scholar',
      name: 'Accuracy Scholar',
      description: 'Achieve 90% accuracy in a study session',
      icon: '🎯',
      category: 'accuracy',
      requirement: { type: 'session_accuracy', value: 90 },
      reward: { exp: 150, title: 'Sharpshooter' }
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Achieve 100% accuracy in a study session',
      icon: '💯',
      category: 'accuracy',
      requirement: { type: 'session_accuracy', value: 100 },
      reward: { exp: 250, title: 'Perfectionist' }
    },
    
    // Consistency Achievements
    {
      id: 'week_streak',
      name: 'Week Warrior',
      description: 'Study for 7 consecutive days',
      icon: '🔥',
      category: 'consistency',
      requirement: { type: 'streak_days', value: 7 },
      reward: { exp: 200, title: 'Dedicated Learner' }
    },
    {
      id: 'month_streak',
      name: 'Month Master',
      description: 'Study for 30 consecutive days',
      icon: '🌟',
      category: 'consistency',
      requirement: { type: 'streak_days', value: 30 },
      reward: { exp: 500, title: 'Consistency Master' }
    },
    
    // Test Achievements
    {
      id: 'test_beginner',
      name: 'Test Beginner',
      description: 'Complete your first test',
      icon: '📝',
      category: 'testing',
      requirement: { type: 'tests_completed', value: 1 },
      reward: { exp: 100, title: 'Test Taker' }
    },
    {
      id: 'test_expert',
      name: 'Test Expert',
      description: 'Complete 10 tests with 80%+ accuracy',
      icon: '🏆',
      category: 'testing',
      requirement: { type: 'tests_high_score', value: 10 },
      reward: { exp: 400, title: 'Test Expert' }
    },
    
    // Time Achievements
    {
      id: 'time_warrior',
      name: 'Time Warrior',
      description: 'Study for 10 hours total',
      icon: '⏰',
      category: 'time',
      requirement: { type: 'time_spent', value: 36000 }, // 10 hours in seconds
      reward: { exp: 300, title: 'Time Warrior' }
    },
    {
      id: 'marathon_learner',
      name: 'Marathon Learner',
      description: 'Study for 50 hours total',
      icon: '🏃',
      category: 'time',
      requirement: { type: 'time_spent', value: 180000 }, // 50 hours in seconds
      reward: { exp: 1000, title: 'Marathon Learner' }
    },
    
    // Special Achievements
    {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Study before 8 AM 5 times',
      icon: '🌅',
      category: 'special',
      requirement: { type: 'early_sessions', value: 5 },
      reward: { exp: 200, title: 'Early Bird' }
    },
    {
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Study after 10 PM 5 times',
      icon: '🌙',
      category: 'special',
      requirement: { type: 'late_sessions', value: 5 },
      reward: { exp: 200, title: 'Night Owl' }
    }
  ];

  useEffect(() => {
    if (user) {
      calculateAchievementProgress();
      generateDailyChallenges();
    }
  }, [user, studyHistory, testHistory]);

  const calculateAchievementProgress = () => {
    if (!user) return;

    const progress = achievements.map(achievement => {
      const isUnlocked = user.achievements.some(a => a.id === achievement.id);
      const unlockedAchievement = user.achievements.find(a => a.id === achievement.id);
      
      let currentProgress = 0;
      let maxProgress = achievement.requirement.value;

      switch (achievement.requirement.type) {
        case 'words_studied':
          currentProgress = user.statistics.totalWordsStudied;
          break;
        case 'session_accuracy':
          const maxAccuracy = Math.max(...studyHistory.map(s => s.accuracy), 0);
          currentProgress = maxAccuracy;
          break;
        case 'streak_days':
          currentProgress = user.streak;
          break;
        case 'tests_completed':
          currentProgress = testHistory.length;
          break;
        case 'tests_high_score':
          const highScoreTests = testHistory.filter(t => t.accuracy >= 80);
          currentProgress = highScoreTests.length;
          break;
        case 'time_spent':
          const totalTime = studyHistory.reduce((sum, s) => sum + s.timeSpent, 0) +
                           testHistory.reduce((sum, t) => sum + t.timeSpent, 0);
          currentProgress = totalTime;
          break;
        case 'early_sessions':
          const earlySessions = studyHistory.filter(s => {
            const hour = new Date(s.completedAt).getHours();
            return hour < 8;
          });
          currentProgress = earlySessions.length;
          break;
        case 'late_sessions':
          const lateSessions = studyHistory.filter(s => {
            const hour = new Date(s.completedAt).getHours();
            return hour >= 22;
          });
          currentProgress = lateSessions.length;
          break;
      }

      return {
        achievement,
        progress: Math.min(currentProgress, maxProgress),
        maxProgress,
        isUnlocked,
        unlockedAt: unlockedAchievement?.unlockedAt
      };
    });

    setAchievementProgress(progress);
    
    // Check for newly unlocked achievements
    progress.forEach(p => {
      if (p.isUnlocked && !user.achievements.some(a => a.id === p.achievement.id)) {
        unlockAchievement(p.achievement);
        setShowUnlockAnimation(p.achievement.id);
        setTimeout(() => setShowUnlockAnimation(null), 3000);
      }
    });
  };

  const generateDailyChallenges = () => {
    const challenges: DailyChallenge[] = [
      {
        id: 'daily_words',
        title: 'Daily Words',
        description: 'Study 10 words today',
        icon: '📚',
        reward: 50,
        completed: false,
        progress: 0,
        target: 10
      },
      {
        id: 'daily_session',
        title: 'Study Session',
        description: 'Complete one study session',
        icon: '🎯',
        reward: 30,
        completed: false,
        progress: 0,
        target: 1
      },
      {
        id: 'daily_accuracy',
        title: 'Accuracy Master',
        description: 'Achieve 85% accuracy today',
        icon: '🎯',
        reward: 75,
        completed: false,
        progress: 0,
        target: 85
      }
    ];

    // Calculate actual progress for today
    const today = new Date().toISOString().split('T')[0];
    const todayStudy = studyHistory.filter(s => s.completedAt.startsWith(today));
    const todayWords = todayStudy.reduce((sum, s) => sum + s.wordsStudied, 0);
    const todayAccuracy = todayStudy.length > 0 
      ? todayStudy.reduce((sum, s) => sum + s.accuracy, 0) / todayStudy.length 
      : 0;

    challenges[0].progress = todayWords;
    challenges[0].completed = todayWords >= 10;
    
    challenges[1].progress = todayStudy.length;
    challenges[1].completed = todayStudy.length >= 1;
    
    challenges[2].progress = todayAccuracy;
    challenges[2].completed = todayAccuracy >= 85;

    setDailyChallenges(challenges);
  };

  const getAchievementsByCategory = (category: string) => {
    if (category === 'all') return achievementProgress;
    return achievementProgress.filter(p => p.achievement.category === category);
  };

  const getCompletionPercentage = () => {
    const unlockedCount = achievementProgress.filter(p => p.isUnlocked).length;
    return Math.round((unlockedCount / achievements.length) * 100);
  };

  const getTotalRewardPoints = () => {
    return achievementProgress
      .filter(p => p.isUnlocked)
      .reduce((sum, p) => sum + p.achievement.reward.exp, 0);
  };

  const categories = [
    { id: 'all', name: 'All', icon: '🏆' },
    { id: 'learning', name: 'Learning', icon: '📚' },
    { id: 'accuracy', name: 'Accuracy', icon: '🎯' },
    { id: 'consistency', name: 'Consistency', icon: '🔥' },
    { id: 'testing', name: 'Testing', icon: '📝' },
    { id: 'time', name: 'Time', icon: '⏰' },
    { id: 'special', name: 'Special', icon: '⭐' }
  ];

  if (!user) {
    return <div className="text-white">Loading achievements...</div>;
  }

  return (
    <div className="min-h-screen bg-pixel-black crt-effect p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="pixel-font text-3xl text-contra-gold mb-2">
            🏆 ACHIEVEMENT HALL
          </h1>
          <p className="pixel-font text-sm text-pixel-light-gray">
            Unlock achievements and track your progress
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <PixelCard variant="default" className="p-4 text-center">
            <div className="text-3xl mb-2">🏆</div>
            <div className="pixel-font text-2xl text-contra-gold mb-1">
              {achievementProgress.filter(p => p.isUnlocked).length}
            </div>
            <div className="pixel-font text-xs text-pixel-light-gray">
              of {achievements.length} achievements
            </div>
            <PixelProgress
              value={achievementProgress.filter(p => p.isUnlocked).length}
              max={achievements.length}
              variant="exp"
              className="mt-2"
            />
          </PixelCard>

          <PixelCard variant="default" className="p-4 text-center">
            <div className="text-3xl mb-2">⭐</div>
            <div className="pixel-font text-2xl text-yellow-400 mb-1">
              {getTotalRewardPoints()}
            </div>
            <div className="pixel-font text-xs text-pixel-light-gray">
              Total EXP earned
            </div>
          </PixelCard>

          <PixelCard variant="default" className="p-4 text-center">
            <div className="text-3xl mb-2">📊</div>
            <div className="pixel-font text-2xl text-contra-green mb-1">
              {getCompletionPercentage()}%
            </div>
            <div className="pixel-font text-xs text-pixel-light-gray">
              Completion rate
            </div>
          </PixelCard>
        </div>

        {/* Daily Challenges */}
        <PixelCard variant="default" className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-contra-gold" size={20} />
            <h3 className="pixel-font text-lg text-contra-gold">DAILY CHALLENGES</h3>
            <span className="pixel-font text-xs text-pixel-light-gray">
              {new Date().toLocaleDateString()}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dailyChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`p-4 rounded-lg border-2 ${
                  challenge.completed 
                    ? 'border-contra-green bg-contra-green/20' 
                    : 'border-pixel-gray bg-pixel-gray/20'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{challenge.icon}</span>
                  <div className="flex-1">
                    <div className="pixel-font text-sm text-pixel-white">
                      {challenge.title}
                    </div>
                    <div className="pixel-font text-xs text-pixel-light-gray">
                      {challenge.description}
                    </div>
                  </div>
                  {challenge.completed && <CheckCircle className="text-contra-green" size={20} />}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="pixel-font text-xs text-yellow-400">
                    +{challenge.reward} EXP
                  </div>
                  <div className="pixel-font text-xs text-pixel-light-gray">
                    {challenge.completed ? 'COMPLETED' : `${Math.round(challenge.progress)}/${challenge.target}`}
                  </div>
                </div>
                
                {!challenge.completed && (
                  <div className="w-full bg-pixel-gray rounded-full h-2 mt-2">
                    <div
                      className="bg-contra-gold h-full rounded-full"
                      style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </PixelCard>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <PixelButton
              key={category.id}
              variant={selectedCategory === category.id ? 'primary' : 'secondary'}
              pixelSize="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </PixelButton>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getAchievementsByCategory(selectedCategory).map((item) => (
            <motion.div
              key={item.achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PixelCard
                variant={item.isUnlocked ? 'default' : 'secondary'}
                className={`p-4 h-full ${
                  item.isUnlocked ? 'border-contra-gold' : 'opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">
                    {item.isUnlocked ? item.achievement.icon : '🔒'}
                  </div>
                  <div className="flex-1">
                    <div className="pixel-font text-sm text-pixel-white mb-1">
                      {item.achievement.name}
                    </div>
                    <div className="pixel-font text-xs text-pixel-light-gray mb-2">
                      {item.achievement.description}
                    </div>
                    
                    {item.isUnlocked ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Star className="text-yellow-400" size={12} />
                          <span className="pixel-font text-xs text-yellow-400">
                            +{item.achievement.reward.exp} EXP
                          </span>
                        </div>
                        {item.achievement.reward.title && (
                          <div className="pixel-font text-xs text-contra-green">
                            Title: {item.achievement.reward.title}
                          </div>
                        )}
                        <div className="pixel-font text-xs text-pixel-light-gray">
                          Unlocked: {item.unlockedAt ? new Date(item.unlockedAt).toLocaleDateString() : 'Unknown'}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="pixel-font text-xs text-pixel-light-gray">
                            Progress
                          </span>
                          <span className="pixel-font text-xs text-pixel-white">
                            {item.progress}/{item.maxProgress}
                          </span>
                        </div>
                        <div className="w-full bg-pixel-gray rounded-full h-2">
                          <div
                            className="bg-contra-gold h-full rounded-full"
                            style={{ width: `${(item.progress / item.maxProgress) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </PixelCard>
            </motion.div>
          ))}
        </div>

        {/* Unlock Animation */}
        <AnimatePresence>
          {showUnlockAnimation && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black/80 z-50"
            >
              <PixelCard variant="default" className="p-8 text-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🏆
                </motion.div>
                <h2 className="pixel-font text-2xl text-contra-gold mb-2">
                  ACHIEVEMENT UNLOCKED!
                </h2>
                <p className="pixel-font text-lg text-pixel-white mb-4">
                  {achievementProgress.find(p => p.achievement.id === showUnlockAnimation)?.achievement.name}
                </p>
                <div className="pixel-font text-sm text-yellow-400">
                  +{achievementProgress.find(p => p.achievement.id === showUnlockAnimation)?.achievement.reward.exp} EXP
                </div>
              </PixelCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};