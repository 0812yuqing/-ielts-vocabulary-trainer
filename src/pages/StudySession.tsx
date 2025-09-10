import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, RotateCcw, Check, X, Clock } from 'lucide-react';
import { PixelCard } from '../components/ui/PixelCard';
import { PixelButton } from '../components/ui/PixelButton';
import { PixelProgress } from '../components/ui/PixelProgress';
import { useStudyStore } from '../stores/studyStore';
import { useUserStore } from '../stores/userStore';
import { Vocabulary, StudyResult } from '../types';
import { vocabularyLoader } from '../utils/vocabularyLoader';
import { speechService } from '../utils/audioService';

interface VocabularyCardProps {
  word: Vocabulary;
  onResult: (result: StudyResult) => void;
  showAnswer?: boolean;
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({ 
  word, 
  onResult,
  showAnswer = false 
}) => {
  const [isFlipped, setIsFlipped] = useState(showAnswer);
  const [startTime] = useState(Date.now());
  const [userAnswer, setUserAnswer] = useState('');
  
  const playAudio = () => {
    if (word.audioUrl) {
      const audio = new Audio(word.audioUrl);
      audio.play().catch(console.error);
    } else {
      // Use Web Speech API as fallback
      speechService.speak(word.word);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    const timeSpent = Date.now() - startTime;
    onResult({
      wordId: word.id,
      isCorrect,
      timeSpent,
      userAnswer,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <motion.div
        className="card-container"
        style={{ perspective: 1000 }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
      >
        <motion.div
          className="card relative w-full h-96 cursor-pointer"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ transformStyle: 'preserve-3d' }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front - Show word */}
          <div className="card-face card-front absolute w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-white">
            <div className="text-4xl font-bold mb-4 pixel-font">{word.word}</div>
            <div className="text-lg opacity-80 mb-6 pixel-font">{word.pronunciation}</div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                playAudio();
              }}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors mb-6"
            >
              <Volume2 size={20} />
              <span className="pixel-font text-sm">PLAY SOUND</span>
            </button>
            
            <div className="text-center">
              <div className="pixel-font text-xs text-yellow-300 mb-2">
                DIFFICULTY: {'⭐'.repeat(Math.min(word.difficulty, 5))}
              </div>
              <div className="pixel-font text-xs opacity-60">
                CLICK TO REVEAL MEANING
              </div>
            </div>
          </div>

          {/* Back - Show definition */}
          <div className="card-face card-back absolute w-full h-full bg-gradient-to-br from-green-600 to-teal-700 rounded-xl shadow-lg p-6 text-white">
            <div className="text-2xl font-bold mb-4 pixel-font">{word.word}</div>
            
            <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
              {word.definitions.map((def, index) => (
                <div key={index} className="bg-white/20 rounded-lg p-3">
                  <div className="pixel-font text-sm font-semibold text-yellow-200 mb-1">
                    {def.partOfSpeech.toUpperCase()}
                  </div>
                  <div className="pixel-font text-base mb-2">{def.meaning}</div>
                  {def.examples.length > 0 && (
                    <div className="pixel-font text-xs opacity-80 italic">
                      💡 "{def.examples[0]}"
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 absolute bottom-4 left-6 right-6">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(false);
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors pixel-font text-sm"
              >
                <X size={20} />
                <span>NEED PRACTICE</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(true);
                }}
                className="flex-1 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors pixel-font text-sm"
              >
                <Check size={20} />
                <span>MASTERED</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export const StudySession: React.FC = () => {
  const [currentWord, setCurrentWord] = useState<Vocabulary | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionType, setSessionType] = useState<'learn' | 'review'>('learn');
  const [wordIndex, setWordIndex] = useState(0);
  const [sessionWords, setSessionWords] = useState<Vocabulary[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<StudyResult[]>([]);
  
  const { startSession, endSession, recordWordStudy, todayProgress } = useStudyStore();
  const { user } = useUserStore();

  useEffect(() => {
    if (sessionActive && sessionWords.length === 0) {
      loadSessionWords();
    }
  }, [sessionActive, sessionType]);

  const loadSessionWords = async () => {
    await vocabularyLoader.loadVocabularyData();
    
    let words: Vocabulary[];
    
    if (sessionType === 'review') {
      words = await useStudyStore.getState().getReviewWords();
    } else {
      // Get new words based on user level
      words = vocabularyLoader.getWordsByLevel(user?.level || 1);
      words = words.slice(0, Math.min(10, words.length));
    }
    
    setSessionWords(words);
    setCurrentWord(words[0] || null);
    setWordIndex(0);
  };

  const startStudySession = (type: 'learn' | 'review') => {
    setSessionType(type);
    setSessionActive(true);
    setShowResults(false);
    setResults([]);
    startSession(type);
  };

  const handleWordResult = async (result: StudyResult) => {
    setResults(prev => [...prev, result]);
    await recordWordStudy(result.wordId, result);

    // Move to next word or end session
    if (wordIndex < sessionWords.length - 1) {
      setWordIndex(prev => prev + 1);
      setCurrentWord(sessionWords[wordIndex + 1]);
    } else {
      // Session complete
      endSession();
      setShowResults(true);
    }
  };

  const nextSession = () => {
    setSessionActive(false);
    setShowResults(false);
    setResults([]);
    setWordIndex(0);
  };

  const getScoreSummary = () => {
    const correct = results.filter(r => r.isCorrect).length;
    const accuracy = results.length > 0 ? (correct / results.length) * 100 : 0;
    const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0);
    
    return { correct, accuracy, totalTime };
  };

  if (!sessionActive) {
    return (
      <div className="min-h-screen bg-pixel-black crt-effect p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="pixel-font text-3xl text-contra-gold mb-2">
              🏕️ TRAINING CAMP
            </h1>
            <p className="pixel-font text-sm text-pixel-light-gray">
              Choose your training mission
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PixelCard variant="default" className="p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-200"
                      onClick={() => startStudySession('learn')}>
              <div className="text-6xl mb-4">📚</div>
              <h2 className="pixel-font text-xl text-contra-gold mb-2">NEW RECRUITS</h2>
              <p className="pixel-font text-sm text-pixel-light-gray mb-4">
                Learn new vocabulary words based on your current level
              </p>
              <div className="space-y-2 text-left">
                <div className="pixel-font text-xs text-pixel-white">• 10 new words per session</div>
                <div className="pixel-font text-xs text-pixel-white">• Adaptive difficulty</div>
                <div className="pixel-font text-xs text-pixel-white">• +10 EXP per correct answer</div>
              </div>
              <PixelButton variant="primary" className="w-full mt-4">
                BEGIN TRAINING
              </PixelButton>
            </PixelCard>

            <PixelCard variant="default" className="p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-200"
                      onClick={() => startStudySession('review')}>
              <div className="text-6xl mb-4">🔄</div>
              <h2 className="pixel-font text-xl text-contra-gold mb-2">REVIEW DRILL</h2>
              <p className="pixel-font text-sm text-pixel-light-gray mb-4">
                Review words that need practice using spaced repetition
              </p>
              <div className="space-y-2 text-left">
                <div className="pixel-font text-xs text-pixel-white">• Smart scheduling</div>
                <div className="pixel-font text-xs text-pixel-white">• Focus on weak areas</div>
                <div className="pixel-font text-xs text-pixel-white">• +5 EXP per review</div>
              </div>
              <PixelButton variant="secondary" className="w-full mt-4">
                START REVIEW
              </PixelButton>
            </PixelCard>
          </div>

          {/* Today's Progress */}
          {todayProgress && (
            <PixelCard variant="default" className="p-6 mt-6">
              <h3 className="pixel-font text-lg text-contra-gold mb-4">📊 TODAY'S PROGRESS</h3>
              <PixelProgress
                label="DAILY OBJECTIVE"
                value={todayProgress.completed}
                max={todayProgress.target}
                variant="exp"
                showPercentage
              />
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="pixel-font text-2xl text-contra-gold">{todayProgress.completed}</div>
                  <div className="pixel-font text-xs text-pixel-light-gray">COMPLETED</div>
                </div>
                <div className="text-center">
                  <div className="pixel-font text-2xl text-contra-green">{Math.round(todayProgress.accuracy)}%</div>
                  <div className="pixel-font text-xs text-pixel-light-gray">ACCURACY</div>
                </div>
                <div className="text-center">
                  <div className="pixel-font text-2xl text-power-up-blue">{Math.floor(todayProgress.timeSpent / 60)}m</div>
                  <div className="pixel-font text-xs text-pixel-light-gray">TIME</div>
                </div>
              </div>
            </PixelCard>
          )}
        </div>
      </div>
    );
  }

  if (showResults) {
    const summary = getScoreSummary();
    
    return (
      <div className="min-h-screen bg-pixel-black crt-effect p-4">
        <div className="container mx-auto max-w-2xl">
          <PixelCard variant="default" className="p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="pixel-font text-2xl text-contra-gold mb-4">SESSION COMPLETE!</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <div className="pixel-font text-3xl text-contra-gold">{summary.correct}</div>
                <div className="pixel-font text-xs text-pixel-light-gray">CORRECT</div>
              </div>
              <div>
                <div className="pixel-font text-3xl text-contra-green">{Math.round(summary.accuracy)}%</div>
                <div className="pixel-font text-xs text-pixel-light-gray">ACCURACY</div>
              </div>
              <div>
                <div className="pixel-font text-3xl text-power-up-blue">{Math.floor(summary.totalTime / 1000)}s</div>
                <div className="pixel-font text-xs text-pixel-light-gray">TIME</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="pixel-font text-lg text-contra-gold mb-2">
                EXPERIENCE EARNED
              </div>
              <div className="pixel-font text-3xl text-yellow-400">
                +{summary.correct * 10} EXP
              </div>
            </div>

            <div className="space-y-3">
              <PixelButton variant="primary" className="w-full" onClick={nextSession}>
                CONTINUE TRAINING
              </PixelButton>
              <PixelButton variant="secondary" className="w-full" onClick={() => window.history.back()}>
                RETURN TO BASE
              </PixelButton>
            </div>
          </PixelCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pixel-black crt-effect p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Session Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="pixel-font text-2xl text-contra-gold">
              {sessionType === 'learn' ? '🏕️ NEW RECRUITS' : '🔄 REVIEW DRILL'}
            </h1>
            <p className="pixel-font text-sm text-pixel-light-gray">
              Word {wordIndex + 1} of {sessionWords.length}
            </p>
          </div>
          
          <div className="text-right">
            <div className="pixel-font text-sm text-contra-green">
              {results.filter(r => r.isCorrect).length} / {results.length} CORRECT
            </div>
            <div className="pixel-font text-xs text-pixel-light-gray">
              {Math.floor(results.reduce((sum, r) => sum + r.timeSpent, 0) / 1000)}s ELAPSED
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <PixelProgress
            label="SESSION PROGRESS"
            value={wordIndex + 1}
            max={sessionWords.length}
            variant="exp"
            showPercentage
          />
        </div>

        {/* Current Word Card */}
        {currentWord && (
          <AnimatePresence mode="wait">
            <VocabularyCard
              key={currentWord.id}
              word={currentWord}
              onResult={handleWordResult}
            />
          </AnimatePresence>
        )}

        {/* Session Controls */}
        <div className="mt-6 text-center">
          <PixelButton
            variant="secondary"
            onClick={() => {
              endSession();
              setSessionActive(false);
            }}
          >
            ABORT MISSION
          </PixelButton>
        </div>
      </div>
    </div>
  );
};