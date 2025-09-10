import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Target, Check, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { PixelCard } from '../components/ui/PixelCard';
import { PixelButton } from '../components/ui/PixelButton';
import { PixelProgress } from '../components/ui/PixelProgress';
import { useTestStore } from '../stores/testStore';
import { useUserStore } from '../stores/userStore';
import { TestQuestion, TestAnswer } from '../types';

interface TestQuestionCardProps {
  question: TestQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: TestAnswer) => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  currentAnswer?: string;
}

export const TestQuestionCard: React.FC<TestQuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  currentAnswer
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(currentAnswer || '');
  const [timeLeft, setTimeLeft] = useState(question.timeLimit || 30);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    setSelectedAnswer(currentAnswer || '');
    setIsAnswered(!!currentAnswer);
  }, [currentAnswer]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = () => {
    if (selectedAnswer && !isAnswered) {
      setIsAnswered(true);
      onAnswer({
        questionId: question.id,
        userAnswer: selectedAnswer,
        isCorrect: selectedAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim(),
        timeUsed: (question.timeLimit || 30) - timeLeft
      });
    }
  };

  const getProgressColor = () => {
    const percentage = (timeLeft / (question.timeLimit || 30)) * 100;
    if (percentage > 60) return 'bg-contra-green';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Question Header */}
      <PixelCard variant="default" className="p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="text-contra-gold" size={20} />
            <span className="pixel-font text-sm text-contra-gold">
              QUESTION {questionNumber} OF {totalQuestions}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="text-pixel-light-gray" size={16} />
            <span className={`pixel-font text-sm ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-pixel-light-gray'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Time Progress Bar */}
        <div className="w-full bg-pixel-gray rounded-full h-2 mb-4">
          <motion.div
            className={`h-full rounded-full ${getProgressColor()}`}
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / (question.timeLimit || 30)) * 100}%` }}
            transition={{ duration: 1 }}
          />
        </div>

        {/* Question Type Badge */}
        <div className="inline-block px-3 py-1 bg-contra-gold/20 text-contra-gold pixel-font text-xs rounded mb-4">
          {question.type.toUpperCase().replace('_', ' ')}
        </div>
      </PixelCard>

      {/* Question Content */}
      <PixelCard variant="default" className="p-6 mb-4">
        <h3 className="pixel-font text-lg text-pixel-white mb-4">
          {question.question}
        </h3>
        
        {question.context && (
          <div className="bg-pixel-gray rounded-lg p-4 mb-6">
            <p className="pixel-font text-sm text-pixel-light-gray">
              {question.context}
            </p>
          </div>
        )}

        {/* Multiple Choice Options */}
        {question.type === 'multiple_choice' && question.options && (
          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all pixel-font text-sm ${
                  selectedAnswer === option
                    ? 'border-contra-gold bg-contra-gold/20 text-pixel-white'
                    : 'border-pixel-gray hover:border-pixel-light-gray text-pixel-light-gray hover:text-pixel-white'
                } ${isAnswered ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                onClick={() => !isAnswered && setSelectedAnswer(option)}
                whileHover={!isAnswered ? { scale: 1.02 } : {}}
                whileTap={!isAnswered ? { scale: 0.98 } : {}}
                disabled={isAnswered}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === option 
                      ? 'border-contra-gold bg-contra-gold' 
                      : 'border-pixel-gray'
                  }`}>
                    {selectedAnswer === option && (
                      <div className="w-3 h-3 rounded-full bg-pixel-black"></div>
                    )}
                  </div>
                  <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                  <span>{option}</span>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Fill in the Blank Input */}
        {question.type === 'fill_blank' && (
          <div className="mb-6">
            <input
              type="text"
              className="w-full p-4 bg-pixel-gray border-2 border-pixel-gray rounded-lg pixel-font text-pixel-white focus:border-contra-gold focus:outline-none disabled:opacity-50"
              placeholder="Type your answer here..."
              value={selectedAnswer}
              onChange={(e) => !isAnswered && setSelectedAnswer(e.target.value)}
              disabled={isAnswered}
            />
          </div>
        )}

        {/* Context Question */}
        {question.type === 'context' && (
          <div className="mb-6">
            <input
              type="text"
              className="w-full p-4 bg-pixel-gray border-2 border-pixel-gray rounded-lg pixel-font text-pixel-white focus:border-contra-gold focus:outline-none disabled:opacity-50"
              placeholder="Enter the missing word..."
              value={selectedAnswer}
              onChange={(e) => !isAnswered && setSelectedAnswer(e.target.value)}
              disabled={isAnswered}
            />
          </div>
        )}

        {/* Submit Button */}
        <PixelButton
          variant={selectedAnswer && !isAnswered ? 'primary' : 'secondary'}
          className="w-full"
          onClick={handleSubmit}
          disabled={!selectedAnswer || isAnswered}
        >
          {isAnswered ? 'ANSWER SUBMITTED' : 'SUBMIT ANSWER'}
        </PixelButton>
      </PixelCard>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <PixelButton
          variant="secondary"
          pixelSize="sm"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          PREVIOUS
        </PixelButton>

        <div className="pixel-font text-xs text-pixel-light-gray">
          {questionNumber} / {totalQuestions}
        </div>

        <PixelButton
          variant="secondary"
          pixelSize="sm"
          onClick={onNext}
          disabled={!canGoNext}
          className="flex items-center gap-2"
        >
          NEXT
          <ArrowRight size={16} />
        </PixelButton>
      </div>
    </div>
  );
};

export const TestSession: React.FC = () => {
  const [testLevel, setTestLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'master'>('beginner');
  const [showInstructions, setShowInstructions] = useState(true);
  
  const { 
    currentTest, 
    isTestActive, 
    currentQuestionIndex, 
    startTest, 
    answerQuestion, 
    nextQuestion, 
    previousQuestion, 
    endTest 
  } = useTestStore();
  
  const { user } = useUserStore();

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-pixel-black crt-effect p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="pixel-font text-3xl text-contra-gold mb-2">
              ⚔️ COMBAT ZONE
            </h1>
            <p className="pixel-font text-sm text-pixel-light-gray">
              Test your vocabulary skills in battle
            </p>
          </div>

          {/* Level Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { level: 'beginner', name: 'NEW RECRUIT', icon: '🔰', desc: '70% to pass', color: 'text-green-500' },
              { level: 'intermediate', name: 'SOLDIER', icon: '⚔️', desc: '75% to pass', color: 'text-blue-500' },
              { level: 'advanced', name: 'VETERAN', icon: '🎖️', desc: '80% to pass', color: 'text-purple-500' },
              { level: 'master', name: 'LEGEND', icon: '👑', desc: '85% to pass', color: 'text-contra-gold' }
            ].map(({ level, name, icon, desc, color }) => (
              <PixelCard
                key={level}
                variant="default"
                className={`p-4 text-center cursor-pointer hover:shadow-lg transition-all duration-200 ${
                  testLevel === level ? 'ring-2 ring-contra-gold' : ''
                }`}
                onClick={() => setTestLevel(level as any)}
              >
                <div className="text-4xl mb-2">{icon}</div>
                <h3 className={`pixel-font text-sm font-bold ${color} mb-1`}>{name}</h3>
                <p className="pixel-font text-xs text-pixel-light-gray">{desc}</p>
              </PixelCard>
            ))}
          </div>

          {/* Instructions */}
          <PixelCard variant="default" className="p-6 mb-6">
            <h2 className="pixel-font text-lg text-contra-gold mb-4">📋 MISSION BRIEFING</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-contra-gold">•</span>
                <span className="pixel-font text-pixel-light-gray">
                  Answer 20 vocabulary questions to test your skills
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-contra-gold">•</span>
                <span className="pixel-font text-pixel-light-gray">
                  Each question has a time limit - answer quickly and accurately
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-contra-gold">•</span>
                <span className="pixel-font text-pixel-light-gray">
                  You need {testLevel === 'beginner' ? '70%' : testLevel === 'intermediate' ? '75%' : testLevel === 'advanced' ? '80%' : '85%'} to pass
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-contra-gold">•</span>
                <span className="pixel-font text-pixel-light-gray">
                  Earn bonus EXP for high scores and quick completion
                </span>
              </div>
            </div>
          </PixelCard>

          <div className="text-center">
            <PixelButton
              variant="primary"
              className="text-lg px-8"
              onClick={() => {
                startTest(testLevel, 20);
                setShowInstructions(false);
              }}
            >
              BEGIN COMBAT
            </PixelButton>
          </div>
        </div>
      </div>
    );
  }

  if (!currentTest || !isTestActive) {
    return null; // Should not happen, but just in case
  }

  const currentQuestion = currentTest.questions[currentQuestionIndex];
  const currentAnswer = currentTest.answers.find(a => a.questionId === currentQuestion.id);

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-pixel-black crt-effect p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Test Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="pixel-font text-2xl text-contra-gold">
              ⚔️ COMBAT ZONE
            </h1>
            <p className="pixel-font text-sm text-pixel-light-gray">
              {testLevel.toUpperCase()} LEVEL
            </p>
          </div>
          
          <div className="text-right">
            <div className="pixel-font text-sm text-contra-green">
              {currentTest.answers.filter(a => a.isCorrect).length} CORRECT
            </div>
            <div className="pixel-font text-xs text-pixel-light-gray">
              Question {currentQuestionIndex + 1} of {currentTest.questions.length}
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mb-6">
          <PixelProgress
            label="TEST PROGRESS"
            value={currentQuestionIndex + 1}
            max={currentTest.questions.length}
            variant="exp"
            showPercentage
          />
        </div>

        {/* Current Question */}
        <AnimatePresence mode="wait">
          <TestQuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={currentTest.questions.length}
            onAnswer={answerQuestion}
            onPrevious={previousQuestion}
            onNext={nextQuestion}
            canGoPrevious={currentQuestionIndex > 0}
            canGoNext={currentQuestionIndex < currentTest.questions.length - 1}
            currentAnswer={currentAnswer?.userAnswer}
          />
        </AnimatePresence>

        {/* Early Finish Button */}
        {currentQuestionIndex === currentTest.questions.length - 1 && (
          <div className="text-center mt-6">
            <PixelButton
              variant="danger"
              onClick={endTest}
            >
              FINISH TEST
            </PixelButton>
          </div>
        )}
      </div>
    </div>
  );
};