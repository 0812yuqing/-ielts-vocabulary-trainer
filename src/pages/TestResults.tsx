import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Trophy, Target, Clock, TrendingUp } from 'lucide-react';
import { PixelCard } from '../components/ui/PixelCard';
import { PixelButton } from '../components/ui/PixelButton';
import { PixelProgress } from '../components/ui/PixelProgress';
import { useTestStore } from '../stores/testStore';
import { useUserStore } from '../stores/userStore';
import { TestResult } from '../types';

interface TestResultsProps {
  testResult: TestResult;
  onRetry: () => void;
  onContinue: () => void;
}

export const TestResults: React.FC<TestResultsProps> = ({
  testResult,
  onRetry,
  onContinue
}) => {
  const { user } = useUserStore();
  
  const getPerformanceLevel = () => {
    if (testResult.accuracy >= 90) return { level: 'PERFECT', color: 'text-contra-gold', emoji: '🏆' };
    if (testResult.accuracy >= 80) return { level: 'EXCELLENT', color: 'text-contra-green', emoji: '⭐' };
    if (testResult.accuracy >= 70) return { level: 'GOOD', color: 'text-blue-500', emoji: '👍' };
    if (testResult.accuracy >= 60) return { level: 'NEEDS IMPROVEMENT', color: 'text-yellow-500', emoji: '📚' };
    return { level: 'KEEP PRACTICING', color: 'text-red-500', emoji: '💪' };
  };

  const performance = getPerformanceLevel();
  const passed = testResult.accuracy >= 70; // Assuming 70% is passing threshold

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-pixel-black crt-effect p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-6xl mb-4"
          >
            {passed ? '🎉' : '💪'}
          </motion.div>
          <h1 className="pixel-font text-3xl text-contra-gold mb-2">
            MISSION COMPLETE!
          </h1>
          <p className="pixel-font text-sm text-pixel-light-gray">
            Test results are ready for review
          </p>
        </div>

        {/* Overall Performance */}
        <PixelCard variant="default" className="p-6 mb-6">
          <div className="text-center mb-6">
            <div className={`pixel-font text-2xl font-bold ${performance.color} mb-2`}>
              {performance.emoji} {performance.level}
            </div>
            <div className="pixel-font text-lg text-pixel-white mb-1">
              {Math.round(testResult.accuracy)}% ACCURACY
            </div>
            <div className="pixel-font text-sm text-pixel-light-gray">
              {testResult.score} / {testResult.maxScore} QUESTIONS CORRECT
            </div>
          </div>

          {/* Performance Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl text-contra-gold mb-1">
                {testResult.score}
              </div>
              <div className="pixel-font text-xs text-pixel-light-gray">CORRECT</div>
            </div>
            <div className="text-center">
              <div className="text-3xl text-red-500 mb-1">
                {testResult.maxScore - testResult.score}
              </div>
              <div className="pixel-font text-xs text-pixel-light-gray">INCORRECT</div>
            </div>
            <div className="text-center">
              <div className="text-3xl text-power-up-blue mb-1">
                {formatTime(Math.floor(testResult.timeSpent / 1000))}
              </div>
              <div className="pixel-font text-xs text-pixel-light-gray">TIME SPENT</div>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mt-6">
            <PixelProgress
              label="OVERALL PERFORMANCE"
              value={testResult.accuracy}
              max={100}
              variant="exp"
              showPercentage
            />
          </div>
        </PixelCard>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <PixelCard variant="default" className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Target className="text-contra-gold" size={20} />
              <span className="pixel-font text-sm text-contra-gold">ACCURACY ANALYSIS</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="pixel-font text-xs text-pixel-light-gray">Correct Rate:</span>
                <span className="pixel-font text-sm text-contra-green">
                  {Math.round(testResult.accuracy)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="pixel-font text-xs text-pixel-light-gray">Error Rate:</span>
                <span className="pixel-font text-sm text-red-500">
                  {Math.round(100 - testResult.accuracy)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="pixel-font text-xs text-pixel-light-gray">Avg Time/Question:</span>
                <span className="pixel-font text-sm text-power-up-blue">
                  {Math.round(testResult.timeSpent / testResult.maxScore / 1000)}s
                </span>
              </div>
            </div>
          </PixelCard>

          <PixelCard variant="default" className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="text-contra-gold" size={20} />
              <span className="pixel-font text-sm text-contra-gold">PERFORMANCE INSIGHTS</span>
            </div>
            <div className="space-y-2">
              {testResult.weakAreas.length > 0 ? (
                testResult.weakAreas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <XCircle className="text-red-500" size={16} />
                    <span className="pixel-font text-xs text-pixel-light-gray">
                      {area.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-contra-green" size={16} />
                  <span className="pixel-font text-xs text-contra-green">
                    NO WEAK AREAS IDENTIFIED
                  </span>
                </div>
              )}
            </div>
          </PixelCard>
        </div>

        {/* Experience Gained */}
        <PixelCard variant="default" className="p-4 mb-6">
          <div className="text-center">
            <div className="pixel-font text-sm text-contra-gold mb-2">
              EXPERIENCE EARNED
            </div>
            <motion.div
              className="pixel-font text-4xl text-yellow-400 mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              +{Math.floor(testResult.score * 5)} EXP
            </motion.div>
            <div className="pixel-font text-xs text-pixel-light-gray">
              Based on your performance
            </div>
          </div>
        </PixelCard>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4">
          <PixelButton
            variant="primary"
            className="flex-1"
            onClick={onContinue}
          >
            CONTINUE MISSION
          </PixelButton>
          <PixelButton
            variant="secondary"
            className="flex-1"
            onClick={onRetry}
          >
            RETRY CHALLENGE
          </PixelButton>
        </div>

        {/* Study Recommendations */}
        {!passed && (
          <PixelCard variant="default" className="p-4 mt-6">
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="text-contra-gold" size={20} />
              <span className="pixel-font text-sm text-contra-gold">RECOMMENDATIONS</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="pixel-font text-pixel-light-gray">
                • Focus on vocabulary meaning and usage
              </div>
              <div className="pixel-font text-pixel-light-gray">
                • Practice with flashcards and context examples
              </div>
              <div className="pixel-font text-pixel-light-gray">
                • Review similar words to build connections
              </div>
              <div className="pixel-font text-pixel-light-gray">
                • Try the beginner level to build confidence
              </div>
            </div>
          </PixelCard>
        )}
      </div>
    </div>
  );
};

// Test History Component
export const TestHistory: React.FC = () => {
  const { testHistory } = useTestStore();
  const { user } = useUserStore();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-pixel-black crt-effect p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="pixel-font text-3xl text-contra-gold mb-2">
            📊 TEST HISTORY
          </h1>
          <p className="pixel-font text-sm text-pixel-light-gray">
            Review your past performance
          </p>
        </div>

        {testHistory.length === 0 ? (
          <PixelCard variant="default" className="p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="pixel-font text-xl text-contra-gold mb-2">NO TESTS YET</h2>
            <p className="pixel-font text-sm text-pixel-light-gray mb-4">
              Complete your first test to see your results here
            </p>
            <PixelButton variant="primary" onClick={() => window.history.back()}>
              START YOUR FIRST TEST
            </PixelButton>
          </PixelCard>
        ) : (
          <div className="space-y-4">
            {testHistory.map((result, index) => (
              <PixelCard key={result.id} variant="default" className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {result.accuracy >= 70 ? '🏆' : '📚'}
                    </div>
                    <div>
                      <div className="pixel-font text-sm text-pixel-white">
                        Test #{testHistory.length - index}
                      </div>
                      <div className="pixel-font text-xs text-pixel-light-gray">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="pixel-font text-lg text-contra-gold">
                      {Math.round(result.accuracy)}%
                    </div>
                    <div className="pixel-font text-xs text-pixel-light-gray">
                      {result.score}/{result.maxScore} correct
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-pixel-gray">
                  <div className="flex justify-between items-center text-xs">
                    <span className="pixel-font text-pixel-light-gray">
                      Time: {Math.floor(result.timeSpent / 1000)}s
                    </span>
                    <span className={`pixel-font ${
                      result.accuracy >= 70 ? 'text-contra-green' : 'text-red-500'
                    }`}>
                      {result.accuracy >= 70 ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                </div>
              </PixelCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};