import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  BookOpen, 
  Brain,
  Calendar,
  Trophy,
  Zap
} from 'lucide-react';
import { PixelCard } from '../components/ui/PixelCard';
import { PixelButton } from '../components/ui/PixelButton';
import { PixelProgress } from '../components/ui/PixelProgress';
import { useUserStore } from '../stores/userStore';
import { useStudyStore } from '../stores/studyStore';
import { useTestStore } from '../stores/testStore';
import { vocabularyLoader } from '../utils/vocabularyLoader';

interface TimeSeriesData {
  date: string;
  wordsStudied: number;
  accuracy: number;
  timeSpent: number;
  expGained: number;
}

interface VocabularyStats {
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  reviewWords: number;
  averageAccuracy: number;
  totalTimeSpent: number;
}

export const ProgressPage: React.FC = () => {
  const { user } = useUserStore();
  const { studyHistory, todayProgress } = useStudyStore();
  const { testHistory } = useTestStore();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [vocabularyStats, setVocabularyStats] = useState<VocabularyStats>({
    totalWords: 0,
    masteredWords: 0,
    learningWords: 0,
    reviewWords: 0,
    averageAccuracy: 0,
    totalTimeSpent: 0
  });

  useEffect(() => {
    if (user) {
      calculateVocabularyStats();
      generateTimeSeriesData();
    }
  }, [user, studyHistory, testHistory, selectedPeriod]);

  const calculateVocabularyStats = async () => {
    if (!user) return;

    // Load all vocabulary data
    await vocabularyLoader.loadVocabularyData();
    const allWords = vocabularyLoader.getAllWords();
    
    // Calculate statistics based on user's progress
    const masteredWords = user.masteredWords.length;
    const learningWords = user.learningWords.length;
    const reviewWords = user.reviewWords.length;
    
    // Calculate average accuracy from study history
    const totalAccuracy = studyHistory.reduce((sum, session) => sum + session.accuracy, 0);
    const averageAccuracy = studyHistory.length > 0 ? totalAccuracy / studyHistory.length : 0;
    
    // Calculate total time spent
    const totalTimeSpent = studyHistory.reduce((sum, session) => sum + session.timeSpent, 0) +
                         testHistory.reduce((sum, test) => sum + test.timeSpent, 0);

    setVocabularyStats({
      totalWords: allWords.length,
      masteredWords,
      learningWords,
      reviewWords,
      averageAccuracy,
      totalTimeSpent
    });
  };

  const generateTimeSeriesData = () => {
    const now = new Date();
    const data: TimeSeriesData[] = [];
    const daysToShow = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 90;
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Filter study sessions for this date
      const dayStudySessions = studyHistory.filter(session => 
        session.completedAt.startsWith(dateStr)
      );
      
      // Filter test results for this date
      const dayTestResults = testHistory.filter(test => 
        test.completedAt.startsWith(dateStr)
      );
      
      const wordsStudied = dayStudySessions.reduce((sum, session) => sum + session.wordsStudied, 0);
      const totalAccuracy = dayStudySessions.reduce((sum, session) => sum + session.accuracy, 0) +
                           dayTestResults.reduce((sum, test) => sum + test.accuracy, 0);
      const accuracy = dayStudySessions.length + dayTestResults.length > 0 
        ? totalAccuracy / (dayStudySessions.length + dayTestResults.length) 
        : 0;
      const timeSpent = dayStudySessions.reduce((sum, session) => sum + session.timeSpent, 0) +
                       dayTestResults.reduce((sum, test) => sum + test.timeSpent, 0);
      const expGained = dayStudySessions.reduce((sum, session) => sum + session.expGained, 0) +
                       dayTestResults.reduce((sum, test) => sum + Math.floor(test.score * 5), 0);
      
      data.push({
        date: dateStr,
        wordsStudied,
        accuracy,
        timeSpent,
        expGained
      });
    }
    
    setTimeSeriesData(data);
  };

  const getStreakDays = () => {
    const now = new Date();
    let streak = 0;
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const hasActivity = studyHistory.some(session => 
        session.completedAt.startsWith(dateStr)
      ) || testHistory.some(test => 
        test.completedAt.startsWith(dateStr)
      );
      
      if (hasActivity) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStudyLevel = () => {
    const progress = (vocabularyStats.masteredWords / vocabularyStats.totalWords) * 100;
    if (progress >= 80) return { level: 'VOCABULARY MASTER', color: 'text-contra-gold' };
    if (progress >= 60) return { level: 'WORD WARRIOR', color: 'text-purple-500' };
    if (progress >= 40) return { level: 'LANGUAGE LEARNER', color: 'text-blue-500' };
    if (progress >= 20) return { level: 'WORD EXPLORER', color: 'text-green-500' };
    return { level: 'BEGINNING ADVENTURER', color: 'text-yellow-500' };
  };

  const studyLevel = getStudyLevel();
  const streakDays = getStreakDays();

  if (!user) {
    return (
      <div className="min-h-screen bg-pixel-black crt-effect p-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="pixel-font text-3xl text-contra-gold mb-4">📊 INTEL BRIEFING</h1>
          <p className="pixel-font text-pixel-light-gray">Please initialize your profile first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pixel-black crt-effect p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="pixel-font text-3xl text-contra-gold mb-2">
            📊 INTEL BRIEFING
          </h1>
          <p className="pixel-font text-sm text-pixel-light-gray mb-4">
            Track your mission progress and analyze performance
          </p>
          <PixelButton 
            variant="secondary" 
            pixelSize="sm"
            onClick={() => window.location.href = '/progress/analytics'}
          >
            📈 ADVANCED ANALYTICS
          </PixelButton>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <PixelCard variant="default" className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="text-contra-gold" size={20} />
              <span className="pixel-font text-xs text-contra-gold">RANK</span>
            </div>
            <div className="pixel-font text-2xl text-pixel-white mb-1">
              {studyLevel.level}
            </div>
            <div className="pixel-font text-xs text-pixel-light-gray">
              Level {user.level}
            </div>
          </PixelCard>

          <PixelCard variant="default" className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="text-yellow-400" size={20} />
              <span className="pixel-font text-xs text-yellow-400">STREAK</span>
            </div>
            <div className="pixel-font text-2xl text-pixel-white mb-1">
              {streakDays} DAYS
            </div>
            <div className="pixel-font text-xs text-pixel-light-gray">
              Keep it up!
            </div>
          </PixelCard>

          <PixelCard variant="default" className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="text-purple-500" size={20} />
              <span className="pixel-font text-xs text-purple-500">WORDS MASTERED</span>
            </div>
            <div className="pixel-font text-2xl text-pixel-white mb-1">
              {vocabularyStats.masteredWords}
            </div>
            <div className="pixel-font text-xs text-pixel-light-gray">
              {Math.round((vocabularyStats.masteredWords / vocabularyStats.totalWords) * 100)}% of total
            </div>
          </PixelCard>

          <PixelCard variant="default" className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="text-blue-500" size={20} />
              <span className="pixel-font text-xs text-blue-500">TOTAL TIME</span>
            </div>
            <div className="pixel-font text-2xl text-pixel-white mb-1">
              {formatTime(vocabularyStats.totalTimeSpent)}
            </div>
            <div className="pixel-font text-xs text-pixel-light-gray">
              Time invested
            </div>
          </PixelCard>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PixelCard variant="default" className="p-6">
            <h3 className="pixel-font text-lg text-contra-gold mb-4">📈 VOCABULARY PROGRESS</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="pixel-font text-sm text-pixel-light-gray">Mastered Words</span>
                  <span className="pixel-font text-sm text-contra-green">
                    {vocabularyStats.masteredWords} / {vocabularyStats.totalWords}
                  </span>
                </div>
                <PixelProgress
                  value={vocabularyStats.masteredWords}
                  max={vocabularyStats.totalWords}
                  variant="exp"
                  showPercentage
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="pixel-font text-sm text-pixel-light-gray">Currently Learning</span>
                  <span className="pixel-font text-sm text-power-up-blue">
                    {vocabularyStats.learningWords} words
                  </span>
                </div>
                <PixelProgress
                  value={vocabularyStats.learningWords}
                  max={50}
                  variant="health"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="pixel-font text-sm text-pixel-light-gray">Ready for Review</span>
                  <span className="pixel-font text-sm text-yellow-500">
                    {vocabularyStats.reviewWords} words
                  </span>
                </div>
                <PixelProgress
                  value={vocabularyStats.reviewWords}
                  max={30}
                  variant="health"
                />
              </div>
            </div>
          </PixelCard>

          <PixelCard variant="default" className="p-6">
            <h3 className="pixel-font text-lg text-contra-gold mb-4">🎯 PERFORMANCE METRICS</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="pixel-font text-sm text-pixel-light-gray">Study Accuracy</span>
                <span className="pixel-font text-sm text-contra-green">
                  {Math.round(vocabularyStats.averageAccuracy)}%
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="pixel-font text-sm text-pixel-light-gray">Study Sessions</span>
                <span className="pixel-font text-sm text-pixel-white">
                  {studyHistory.length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="pixel-font text-sm text-pixel-light-gray">Tests Completed</span>
                <span className="pixel-font text-sm text-pixel-white">
                  {testHistory.length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="pixel-font text-sm text-pixel-light-gray">Experience Points</span>
                <span className="pixel-font text-sm text-yellow-400">
                  {user.experience} EXP
                </span>
              </div>
            </div>
          </PixelCard>
        </div>

        {/* Time Period Selector */}
        <div className="flex justify-center gap-2 mb-6">
          {(['week', 'month', 'all'] as const).map((period) => (
            <PixelButton
              key={period}
              variant={selectedPeriod === period ? 'primary' : 'secondary'}
              pixelSize="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period.toUpperCase()}
            </PixelButton>
          ))}
        </div>

        {/* Activity Timeline */}
        <PixelCard variant="default" className="p-6 mb-8">
          <h3 className="pixel-font text-lg text-contra-gold mb-4">📅 ACTIVITY TIMELINE</h3>
          
          <div className="space-y-3">
            {timeSeriesData.slice(-7).map((day, index) => (
              <div key={day.date} className="flex items-center justify-between p-3 bg-pixel-gray/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    day.wordsStudied > 0 ? 'bg-contra-green' : 'bg-pixel-gray'
                  }`} />
                  <span className="pixel-font text-sm text-pixel-light-gray">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  {day.wordsStudied > 0 && (
                    <>
                      <span className="pixel-font text-contra-green">
                        {day.wordsStudied} words
                      </span>
                      <span className="pixel-font text-blue-400">
                        {Math.round(day.accuracy)}%
                      </span>
                      <span className="pixel-font text-yellow-400">
                        +{day.expGained} EXP
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </PixelCard>

        {/* Recent Achievements */}
        {user.achievements.length > 0 && (
          <PixelCard variant="default" className="p-6">
            <h3 className="pixel-font text-lg text-contra-gold mb-4">🏆 RECENT ACHIEVEMENTS</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {user.achievements.slice(-6).map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-pixel-gray/30 rounded-lg">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <div className="pixel-font text-sm text-pixel-white">
                      {achievement.name}
                    </div>
                    <div className="pixel-font text-xs text-pixel-light-gray">
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </PixelCard>
        )}
      </div>
    </div>
  );
};