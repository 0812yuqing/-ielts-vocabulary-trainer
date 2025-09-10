import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Target, 
  Clock, 
  Award,
  BookOpen,
  Brain,
  Zap,
  Calendar,
  Filter
} from 'lucide-react';
import { PixelCard } from '../components/ui/PixelCard';
import { PixelButton } from '../components/ui/PixelButton';
import { useUserStore } from '../stores/userStore';
import { useStudyStore } from '../stores/studyStore';
import { useTestStore } from '../stores/testStore';

interface AnalyticsData {
  studyTrend: { date: string; words: number; accuracy: number }[];
  accuracyByDifficulty: { difficulty: number; accuracy: number; count: number }[];
  timeDistribution: { activity: string; time: number; percentage: number }[];
  weeklyPatterns: { day: string; studyTime: number; testTime: number }[];
  learningCurve: { date: string; cumulativeWords: number; accuracy: number }[];
}

export const AdvancedAnalytics: React.FC = () => {
  const { user } = useUserStore();
  const { studyHistory } = useStudyStore();
  const { testHistory } = useTestStore();
  
  const [selectedMetric, setSelectedMetric] = useState<'accuracy' | 'time' | 'words'>('accuracy');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  
  const analyticsData = useMemo(() => {
    if (!user) return null;
    
    const data: AnalyticsData = {
      studyTrend: [],
      accuracyByDifficulty: [],
      timeDistribution: [],
      weeklyPatterns: [],
      learningCurve: []
    };
    
    // Generate study trend data
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayStudy = studyHistory.filter(s => s.completedAt.startsWith(dateStr));
      const wordsStudied = dayStudy.reduce((sum, s) => sum + s.wordsStudied, 0);
      const accuracy = dayStudy.length > 0 
        ? dayStudy.reduce((sum, s) => sum + s.accuracy, 0) / dayStudy.length 
        : 0;
      
      data.studyTrend.push({ date: dateStr, words: wordsStudied, accuracy });
    }
    
    // Calculate accuracy by difficulty (simulated)
    for (let difficulty = 1; difficulty <= 5; difficulty++) {
      const sessionsAtLevel = studyHistory.filter(s => 
        Math.floor(Math.random() * 5) + 1 === difficulty
      );
      
      const accuracy = sessionsAtLevel.length > 0
        ? sessionsAtLevel.reduce((sum, s) => sum + s.accuracy, 0) / sessionsAtLevel.length
        : 0;
      
      data.accuracyByDifficulty.push({
        difficulty,
        accuracy,
        count: sessionsAtLevel.length
      });
    }
    
    // Time distribution
    const totalStudyTime = studyHistory.reduce((sum, s) => sum + s.timeSpent, 0);
    const totalTestTime = testHistory.reduce((sum, t) => sum + t.timeSpent, 0);
    const totalTime = totalStudyTime + totalTestTime;
    
    data.timeDistribution = [
      { activity: 'Study Sessions', time: totalStudyTime, percentage: (totalStudyTime / totalTime) * 100 },
      { activity: 'Tests', time: totalTestTime, percentage: (totalTestTime / totalTime) * 100 }
    ];
    
    // Weekly patterns
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekDays.forEach(day => {
      const dayIndex = weekDays.indexOf(day);
      const dayStudyTime = studyHistory
        .filter(s => new Date(s.completedAt).getDay() === dayIndex)
        .reduce((sum, s) => sum + s.timeSpent, 0);
      const dayTestTime = testHistory
        .filter(t => new Date(t.completedAt).getDay() === dayIndex)
        .reduce((sum, t) => sum + t.timeSpent, 0);
      
      data.weeklyPatterns.push({
        day,
        studyTime: dayStudyTime,
        testTime: dayTestTime
      });
    });
    
    // Learning curve
    let cumulativeWords = 0;
    studyHistory
      .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
      .forEach(session => {
        cumulativeWords += session.wordsStudied;
        data.learningCurve.push({
          date: session.completedAt.split('T')[0],
          cumulativeWords,
          accuracy: session.accuracy
        });
      });
    
    return data;
  }, [user, studyHistory, testHistory, timeRange]);
  
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  
  const getPerformanceInsights = () => {
    if (!analyticsData) return [];
    
    const insights = [];
    
    // Study consistency
    const activeDays = analyticsData.studyTrend.filter(d => d.words > 0).length;
    const totalDays = analyticsData.studyTrend.length;
    const consistency = (activeDays / totalDays) * 100;
    
    if (consistency >= 80) {
      insights.push({
        icon: '🔥',
        title: 'High Consistency',
        description: `You've studied ${activeDays} out of ${totalDays} days (${Math.round(consistency)}%)`
      });
    }
    
    // Accuracy trend
    const recentAccuracy = analyticsData.studyTrend.slice(-7).reduce((sum, d) => sum + d.accuracy, 0) / 7;
    const earlierAccuracy = analyticsData.studyTrend.slice(0, 7).reduce((sum, d) => sum + d.accuracy, 0) / 7;
    
    if (recentAccuracy > earlierAccuracy + 10) {
      insights.push({
        icon: '📈',
        title: 'Improving Accuracy',
        description: `Your accuracy has improved by ${Math.round(recentAccuracy - earlierAccuracy)}%`
      });
    }
    
    // Time investment
    const totalTime = analyticsData.timeDistribution.reduce((sum, d) => sum + d.time, 0);
    if (totalTime > 3600) { // More than 1 hour
      insights.push({
        icon: '⏰',
        title: 'Time Investment',
        description: `You've invested ${formatTime(totalTime)} in learning`
      });
    }
    
    return insights;
  };
  
  const insights = getPerformanceInsights();
  
  if (!user || !analyticsData) {
    return <div className="text-white">Loading analytics...</div>;
  }
  
  return (
    <div className="min-h-screen bg-pixel-black crt-effect p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="pixel-font text-3xl text-contra-gold mb-2">
            📊 ADVANCED ANALYTICS
          </h1>
          <p className="pixel-font text-sm text-pixel-light-gray">
            Deep dive into your learning patterns and performance
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="text-pixel-light-gray" size={16} />
            <span className="pixel-font text-xs text-pixel-light-gray">METRIC:</span>
          </div>
          {(['accuracy', 'time', 'words'] as const).map(metric => (
            <PixelButton
              key={metric}
              variant={selectedMetric === metric ? 'primary' : 'secondary'}
              pixelSize="sm"
              onClick={() => setSelectedMetric(metric)}
            >
              {metric.toUpperCase()}
            </PixelButton>
          ))}
          
          <div className="flex items-center gap-2 ml-4">
            <Calendar className="text-pixel-light-gray" size={16} />
            <span className="pixel-font text-xs text-pixel-light-gray">RANGE:</span>
          </div>
          {(['week', 'month', 'quarter'] as const).map(range => (
            <PixelButton
              key={range}
              variant={timeRange === range ? 'primary' : 'secondary'}
              pixelSize="sm"
              onClick={() => setTimeRange(range)}
            >
              {range.toUpperCase()}
            </PixelButton>
          ))}
        </div>
        
        {/* Performance Insights */}
        {insights.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {insights.map((insight, index) => (
              <PixelCard key={index} variant="default" className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{insight.icon}</span>
                  <h3 className="pixel-font text-sm text-contra-gold">
                    {insight.title}
                  </h3>
                </div>
                <p className="pixel-font text-xs text-pixel-light-gray">
                  {insight.description}
                </p>
              </PixelCard>
            ))}
          </div>
        )}
        
        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Study Trend */}
          <PixelCard variant="default" className="p-6">
            <h3 className="pixel-font text-lg text-contra-gold mb-4">📈 STUDY TREND</h3>
            <div className="space-y-2">
              {analyticsData.studyTrend.slice(-7).map((day, index) => (
                <div key={day.date} className="flex items-center justify-between">
                  <span className="pixel-font text-xs text-pixel-light-gray">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="w-20 bg-pixel-gray rounded-full h-2">
                      <div 
                        className="bg-contra-green h-full rounded-full"
                        style={{ width: `${Math.min(day.words * 10, 100)}%` }}
                      />
                    </div>
                    <span className="pixel-font text-xs text-contra-green">
                      {day.words} words
                    </span>
                    <span className="pixel-font text-xs text-blue-400">
                      {Math.round(day.accuracy)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </PixelCard>
          
          {/* Time Distribution */}
          <PixelCard variant="default" className="p-6">
            <h3 className="pixel-font text-lg text-contra-gold mb-4">⏰ TIME DISTRIBUTION</h3>
            <div className="space-y-4">
              {analyticsData.timeDistribution.map((item, index) => (
                <div key={item.activity}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="pixel-font text-sm text-pixel-light-gray">
                      {item.activity}
                    </span>
                    <span className="pixel-font text-sm text-pixel-white">
                      {formatTime(item.time)}
                    </span>
                  </div>
                  <div className="w-full bg-pixel-gray rounded-full h-3">
                    <div 
                      className={`h-full rounded-full ${index === 0 ? 'bg-contra-green' : 'bg-power-up-blue'}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="pixel-font text-xs text-pixel-light-gray mt-1">
                    {Math.round(item.percentage)}% of total time
                  </div>
                </div>
              ))}
            </div>
          </PixelCard>
          
          {/* Weekly Patterns */}
          <PixelCard variant="default" className="p-6">
            <h3 className="pixel-font text-lg text-contra-gold mb-4">📅 WEEKLY PATTERNS</h3>
            <div className="space-y-2">
              {analyticsData.weeklyPatterns.map((day, index) => (
                <div key={day.day} className="flex items-center justify-between">
                  <span className="pixel-font text-xs text-pixel-light-gray w-8">
                    {day.day}
                  </span>
                  <div className="flex-1 mx-4">
                    <div className="flex gap-1">
                      <div 
                        className="bg-contra-green rounded-sm"
                        style={{ 
                          width: `${Math.min((day.studyTime / 3600) * 20, 100)}%`,
                          height: '8px'
                        }}
                      />
                      <div 
                        className="bg-power-up-blue rounded-sm"
                        style={{ 
                          width: `${Math.min((day.testTime / 3600) * 20, 100)}%`,
                          height: '8px'
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="pixel-font text-contra-green">
                      {Math.round(day.studyTime / 60)}m
                    </span>
                    <span className="pixel-font text-power-up-blue">
                      {Math.round(day.testTime / 60)}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-contra-green rounded-sm" />
                <span className="pixel-font text-pixel-light-gray">Study</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-power-up-blue rounded-sm" />
                <span className="pixel-font text-pixel-light-gray">Test</span>
              </div>
            </div>
          </PixelCard>
          
          {/* Accuracy by Difficulty */}
          <PixelCard variant="default" className="p-6">
            <h3 className="pixel-font text-lg text-contra-gold mb-4">🎯 ACCURACY BY DIFFICULTY</h3>
            <div className="space-y-3">
              {analyticsData.accuracyByDifficulty.map((item, index) => (
                <div key={item.difficulty}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="pixel-font text-xs text-pixel-light-gray">
                      {'⭐'.repeat(item.difficulty)}
                    </span>
                    <span className="pixel-font text-xs text-pixel-white">
                      {Math.round(item.accuracy)}% ({item.count} sessions)
                    </span>
                  </div>
                  <div className="w-full bg-pixel-gray rounded-full h-2">
                    <div 
                      className="bg-contra-green h-full rounded-full"
                      style={{ width: `${item.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </PixelCard>
        </div>
        
        {/* Learning Curve */}
        <PixelCard variant="default" className="p-6">
          <h3 className="pixel-font text-lg text-contra-gold mb-4">📈 LEARNING CURVE</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {analyticsData.learningCurve.slice(-10).map((point, index) => (
              <div key={point.date} className="flex items-center justify-between p-2 bg-pixel-gray/20 rounded">
                <span className="pixel-font text-xs text-pixel-light-gray">
                  {new Date(point.date).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-4">
                  <span className="pixel-font text-sm text-contra-green">
                    {point.cumulativeWords} words
                  </span>
                  <span className="pixel-font text-sm text-blue-400">
                    {Math.round(point.accuracy)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </PixelCard>
      </div>
    </div>
  );
};