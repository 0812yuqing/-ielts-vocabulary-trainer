import { create } from 'zustand';
import { storage } from '../utils/storage';
import { TestSession, TestQuestion, TestAnswer, TestResult, Vocabulary } from '../types';
import { vocabularyLoader } from '../utils/vocabularyLoader';

interface TestState {
  currentTest: TestSession | null;
  testHistory: TestResult[];
  isTestActive: boolean;
  currentQuestionIndex: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  startTest: (level: 'beginner' | 'intermediate' | 'advanced' | 'master', questionCount?: number) => Promise<void>;
  answerQuestion: (questionId: string, userAnswer: string, timeUsed: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  endTest: () => Promise<void>;
  getTestHistory: (userId: string) => Promise<void>;
  generateQuestions: (level: string, count: number) => Promise<TestQuestion[]>;
  calculateScore: () => { score: number; maxScore: number; accuracy: number };
  pauseTest: () => void;
  resumeTest: () => void;
  clearError: () => void;
}

export const useTestStore = create<TestState>((set, get) => ({
  currentTest: null,
  testHistory: [],
  isTestActive: false,
  currentQuestionIndex: 0,
  isLoading: false,
  error: null,

  startTest: async (level: 'beginner' | 'intermediate' | 'advanced' | 'master', questionCount = 20) => {
    const { user } = useUserStore.getState();
    if (!user) return;

    set({ isLoading: true, error: null });

    try {
      const questions = await get().generateQuestions(level, questionCount);
      
      const testSession: TestSession = {
        id: crypto.randomUUID(),
        userId: user.id,
        level,
        questions,
        answers: [],
        startTime: Date.now(),
        score: 0,
        maxScore: questions.length,
        passed: false
      };

      set({ 
        currentTest: testSession, 
        isTestActive: true,
        currentQuestionIndex: 0,
        isLoading: false 
      });

    } catch (error) {
      console.error('Failed to start test:', error);
      set({ 
        error: 'Failed to start test session', 
        isLoading: false 
      });
    }
  },

  answerQuestion: (questionId: string, userAnswer: string, timeUsed: number) => {
    const { currentTest, currentQuestionIndex } = get();
    if (!currentTest) return;

    const question = currentTest.questions[currentQuestionIndex];
    const isCorrect = userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();

    const answer: TestAnswer = {
      questionId,
      userAnswer,
      isCorrect,
      timeUsed
    };

    const updatedAnswers = [...currentTest.answers];
    // Replace existing answer or add new one
    const existingIndex = updatedAnswers.findIndex(a => a.questionId === questionId);
    if (existingIndex >= 0) {
      updatedAnswers[existingIndex] = answer;
    } else {
      updatedAnswers.push(answer);
    }

    const updatedTest = {
      ...currentTest,
      answers: updatedAnswers
    };

    set({ currentTest: updatedTest });
  },

  nextQuestion: () => {
    const { currentTest, currentQuestionIndex } = get();
    if (!currentTest || currentQuestionIndex >= currentTest.questions.length - 1) return;

    set({ currentQuestionIndex: currentQuestionIndex + 1 });
  },

  previousQuestion: () => {
    const { currentTest, currentQuestionIndex } = get();
    if (!currentTest || currentQuestionIndex <= 0) return;

    set({ currentQuestionIndex: currentQuestionIndex - 1 });
  },

  endTest: async () => {
    const { currentTest } = get();
    const { user } = useUserStore.getState();
    
    if (!currentTest || !user) return;

    try {
      const endTime = Date.now();
      const totalTime = endTime - currentTest.startTime;
      
      // Calculate final score
      const correctAnswers = currentTest.answers.filter(a => a.isCorrect).length;
      const score = correctAnswers;
      const accuracy = currentTest.answers.length > 0 ? (correctAnswers / currentTest.answers.length) * 100 : 0;
      
      // Determine pass/fail based on level requirements
      const passThresholds = {
        beginner: 70,
        intermediate: 75,
        advanced: 80,
        master: 85
      };
      
      const passed = accuracy >= passThresholds[currentTest.level];

      const finalTest: TestSession = {
        ...currentTest,
        endTime,
        score,
        passed
      };

      // Save test result
      const testResult: TestResult = {
        id: crypto.randomUUID(),
        testId: finalTest.id,
        score,
        maxScore: finalTest.maxScore,
        accuracy,
        timeSpent: totalTime,
        completedAt: new Date().toISOString(),
        weakAreas: get().identifyWeakAreas(finalTest)
      };

      await storage.saveTestResult(testResult);

      // Update user statistics
      const updatedStats = {
        ...user.statistics,
        testResults: [...user.statistics.testResults, testResult]
      };
      
      await useUserStore.getState().updateUser({ statistics: updatedStats });

      // Add experience based on performance
      const expGain = Math.floor(score * 5);
      if (passed) {
        useUserStore.getState().addExperience(expGain);
      }

      set({ 
        currentTest: null, 
        isTestActive: false,
        currentQuestionIndex: 0 
      });

      // Refresh test history
      get().getTestHistory(user.id);

    } catch (error) {
      console.error('Failed to end test:', error);
      set({ error: 'Failed to save test results' });
    }
  },

  getTestHistory: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const history = await storage.getTestResults(userId);
      
      // Sort by completion date (newest first)
      const sortedHistory = history.sort((a, b) => 
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );

      set({ testHistory: sortedHistory, isLoading: false });

    } catch (error) {
      console.error('Failed to get test history:', error);
      set({ 
        error: 'Failed to load test history', 
        isLoading: false 
      });
    }
  },

  generateQuestions: async (level: string, count: number): Promise<TestQuestion[]> => {
    await vocabularyLoader.loadVocabularyData();
    
    const allWords = vocabularyLoader.getAllWords();
    const questions: TestQuestion[] = [];
    
    // Define difficulty ranges for each level
    const difficultyRanges = {
      beginner: [1, 4],
      intermediate: [3, 6],
      advanced: [5, 8],
      master: [7, 10]
    };
    
    const [minDifficulty, maxDifficulty] = difficultyRanges[level as keyof typeof difficultyRanges];
    
    // Filter words by difficulty
    const levelWords = allWords.filter(word => 
      word.difficulty >= minDifficulty && word.difficulty <= maxDifficulty
    );
    
    // Shuffle and select words
    const selectedWords = [...levelWords]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(count, levelWords.length));
    
    // Generate different types of questions
    selectedWords.forEach((word, index) => {
      const questionTypes = ['multiple_choice', 'fill_blank', 'context'];
      const questionType = questionTypes[index % questionTypes.length];
      
      let question: TestQuestion;
      
      switch (questionType) {
        case 'multiple_choice':
          question = {
            id: `mc_${index}`,
            type: 'multiple_choice',
            wordId: word.id,
            question: `What does "${word.word}" mean?`,
            options: generateMultipleChoiceOptions(word, allWords),
            correctAnswer: word.definitions[0].meaning,
            difficulty: word.difficulty,
            timeLimit: 30
          };
          break;
          
        case 'fill_blank':
          question = {
            id: `fb_${index}`,
            type: 'fill_blank',
            wordId: word.id,
            question: generateFillBlankQuestion(word),
            correctAnswer: word.word,
            difficulty: word.difficulty,
            timeLimit: 20
          };
          break;
          
        case 'context':
          question = {
            id: `ctx_${index}`,
            type: 'context',
            wordId: word.id,
            question: `Choose the correct word: ${generateContextQuestion(word)}`,
            context: generateContextExample(word),
            correctAnswer: word.word,
            difficulty: word.difficulty,
            timeLimit: 25
          };
          break;
          
        default:
          question = {
            id: `default_${index}`,
            type: 'multiple_choice',
            wordId: word.id,
            question: `What does "${word.word}" mean?`,
            options: generateMultipleChoiceOptions(word, allWords),
            correctAnswer: word.definitions[0].meaning,
            difficulty: word.difficulty,
            timeLimit: 30
          };
      }
      
      questions.push(question);
    });
    
    return questions;
  },

  calculateScore: () => {
    const { currentTest } = get();
    if (!currentTest) return { score: 0, maxScore: 0, accuracy: 0 };

    const correctAnswers = currentTest.answers.filter(a => a.isCorrect).length;
    const score = correctAnswers;
    const maxScore = currentTest.maxScore;
    const accuracy = currentTest.answers.length > 0 ? (correctAnswers / currentTest.answers.length) * 100 : 0;

    return { score, maxScore, accuracy };
  },

  identifyWeakAreas: (test: TestSession): string[] => {
    const weakAreas: string[] = [];
    const incorrectAnswers = test.answers.filter(a => !a.isCorrect);
    
    // Analyze patterns in incorrect answers
    incorrectAnswers.forEach(answer => {
      const question = test.questions.find(q => q.id === answer.questionId);
      if (question) {
        if (answer.timeUsed > (question.timeLimit || 30) * 1000 * 0.8) {
          weakAreas.push('time_management');
        }
        
        if (question.type === 'multiple_choice') {
          weakAreas.push('vocabulary_meaning');
        } else if (question.type === 'fill_blank') {
          weakAreas.push('spelling');
        } else if (question.type === 'context') {
          weakAreas.push('context_usage');
        }
      }
    });
    
    return [...new Set(weakAreas)];
  },

  pauseTest: () => {
    set({ isTestActive: false });
  },

  resumeTest: () => {
    set({ isTestActive: true });
  },

  clearError: () => {
    set({ error: null });
  }
}));

// Helper functions
function generateMultipleChoiceOptions(word: Vocabulary, allWords: Vocabulary[]): string[] {
  const correctAnswer = word.definitions[0].meaning;
  const options = [correctAnswer];
  
  // Get random incorrect options
  const otherWords = allWords.filter(w => w.id !== word.id);
  
  while (options.length < 4 && otherWords.length > 0) {
    const randomIndex = Math.floor(Math.random() * otherWords.length);
    const randomWord = otherWords[randomIndex];
    const incorrectOption = randomWord.definitions[0].meaning;
    
    if (!options.includes(incorrectOption)) {
      options.push(incorrectOption);
    }
    
    otherWords.splice(randomIndex, 1);
  }
  
  // Shuffle options
  return options.sort(() => Math.random() - 0.5);
}

function generateFillBlankQuestion(word: Vocabulary): string {
  const examples = word.definitions[0].examples;
  if (examples.length > 0) {
    return examples[0].replace(new RegExp(word.word, 'gi'), '_____');
  }
  return `The meaning of "${word.word}" is _____`;
}

function generateContextQuestion(word: Vocabulary): string {
  const examples = word.definitions[0].examples;
  if (examples.length > 0) {
    return examples[0].replace(new RegExp(word.word, 'gi'), '_____');
  }
  return `She has great _____ to solve complex problems.`;
}

function generateContextExample(word: Vocabulary): string {
  const examples = word.definitions[0].examples;
  if (examples.length > 0) {
    return `Context: ${examples[0]}`;
  }
  return `Context: Choose the word that best fits the blank.`;
}