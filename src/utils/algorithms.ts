// Learning algorithm utilities
export interface LearningAlgorithm {
  calculateNextReview(masteryLevel: number, reviewCount: number, isCorrect: boolean): Date;
  calculateMasteryLevel(currentLevel: number, reviewCount: number, isCorrect: boolean): number;
  getWordsForSession(userLevel: number, sessionType: 'learn' | 'review' | 'test', count: number): string[];
}

export class SpacedRepetitionAlgorithm implements LearningAlgorithm {
  private readonly baseIntervals = [1, 4, 24, 72, 168, 720, 2880]; // in hours
  
  calculateNextReview(masteryLevel: number, reviewCount: number, isCorrect: boolean): Date {
    const intervalIndex = Math.min(reviewCount - 1, this.baseIntervals.length - 1);
    let baseInterval = this.baseIntervals[intervalIndex];
    
    // Adjust based on mastery level
    const masteryFactor = masteryLevel / 100;
    const actualInterval = baseInterval * (0.5 + masteryFactor * 1.5);
    
    // Adjust based on correctness
    const correctnessFactor = isCorrect ? 1 : 0.5;
    const finalInterval = actualInterval * correctnessFactor;
    
    return new Date(Date.now() + finalInterval * 60 * 60 * 1000);
  }

  calculateMasteryLevel(currentLevel: number, reviewCount: number, isCorrect: boolean): number {
    if (isCorrect) {
      // Increase mastery level
      const increase = (100 - currentLevel) * 0.3;
      return Math.min(currentLevel + increase, 100);
    } else {
      // Decrease mastery level
      const decrease = currentLevel * 0.3;
      return Math.max(currentLevel - decrease, 0);
    }
  }

  getWordsForSession(userLevel: number, sessionType: 'learn' | 'review' | 'test', count: number): string[] {
    // This would be implemented with actual user data
    // For now, return empty array
    return [];
  }
}

// Adaptive difficulty algorithm
export class AdaptiveDifficultyAlgorithm {
  private recentPerformance: Array<{ correct: boolean; timeSpent: number; difficulty: number }> = [];
  private readonly maxHistorySize = 20;

  updatePerformance(correct: boolean, timeSpent: number, difficulty: number): void {
    this.recentPerformance.push({ correct, timeSpent, difficulty });
    
    if (this.recentPerformance.length > this.maxHistorySize) {
      this.recentPerformance.shift();
    }
  }

  calculateOptimalDifficulty(): number {
    if (this.recentPerformance.length < 5) {
      return 5; // Default medium difficulty
    }

    const recentCorrect = this.recentPerformance.slice(-10);
    const accuracy = recentCorrect.filter(p => p.correct).length / recentCorrect.length;
    const avgTimeSpent = recentCorrect.reduce((sum, p) => sum + p.timeSpent, 0) / recentCorrect.length;
    
    let difficulty = 5; // Base difficulty
    
    // Adjust based on accuracy
    if (accuracy > 0.8) {
      difficulty += 1;
    } else if (accuracy < 0.6) {
      difficulty -= 1;
    }
    
    // Adjust based on time spent
    if (avgTimeSpent < 5000) { // Less than 5 seconds
      difficulty += 1;
    } else if (avgTimeSpent > 15000) { // More than 15 seconds
      difficulty -= 1;
    }
    
    return Math.max(1, Math.min(10, difficulty));
  }

  shouldShowHint(): boolean {
    if (this.recentPerformance.length < 3) {
      return true;
    }

    const recent = this.recentPerformance.slice(-5);
    const recentIncorrect = recent.filter(p => !p.correct).length;
    
    return recentIncorrect >= 2;
  }
}

// Word selection algorithm
export class WordSelectionAlgorithm {
  private static instance: WordSelectionAlgorithm;
  private spacedRepetition: SpacedRepetitionAlgorithm;
  private adaptiveDifficulty: AdaptiveDifficultyAlgorithm;

  private constructor() {
    this.spacedRepetition = new SpacedRepetitionAlgorithm();
    this.adaptiveDifficulty = new AdaptiveDifficultyAlgorithm();
  }

  static getInstance(): WordSelectionAlgorithm {
    if (!WordSelectionAlgorithm.instance) {
      WordSelectionAlgorithm.instance = new WordSelectionAlgorithm();
    }
    return WordSelectionAlgorithm.instance;
  }

  selectWordsForSession(
    availableWords: string[],
    userLevel: number,
    sessionType: 'learn' | 'review' | 'test',
    count: number,
    userHistory?: Array<{ wordId: string; masteryLevel: number; lastReview: Date }>
  ): string[] {
    const now = new Date();
    let candidateWords = [...availableWords];
    
    if (userHistory) {
      if (sessionType === 'review') {
        // Select words that need review
        candidateWords = candidateWords.filter(wordId => {
          const history = userHistory.find(h => h.wordId === wordId);
          if (!history) return false;
          
          const nextReview = this.spacedRepetition.calculateNextReview(
            history.masteryLevel,
            1, // Simplified review count
            true // Assume correct for calculation
          );
          
          return nextReview <= now;
        });
        
        // Sort by mastery level (lowest first)
        candidateWords.sort((a, b) => {
          const historyA = userHistory.find(h => h.wordId === a);
          const historyB = userHistory.find(h => h.wordId === b);
          return (historyA?.masteryLevel || 0) - (historyB?.masteryLevel || 0);
        });
      } else if (sessionType === 'learn') {
        // Prioritize new words or words with low mastery
        candidateWords.sort((a, b) => {
          const historyA = userHistory.find(h => h.wordId === a);
          const historyB = userHistory.find(h => h.wordId === b);
          
          const masteryA = historyA?.masteryLevel || 0;
          const masteryB = historyB?.masteryLevel || 0;
          
          // New words first, then low mastery
          if (!historyA && !historyB) return 0;
          if (!historyA) return -1;
          if (!historyB) return 1;
          
          return masteryA - masteryB;
        });
      }
    }
    
    // Apply level filtering
    const optimalDifficulty = this.adaptiveDifficulty.calculateOptimalDifficulty();
    const minDifficulty = Math.max(1, optimalDifficulty - 2);
    const maxDifficulty = Math.min(10, optimalDifficulty + 2);
    
    // Note: In a real implementation, you would filter by actual word difficulty
    // For now, we'll just return the first N words
    
    return candidateWords.slice(0, Math.min(count, candidateWords.length));
  }

  updatePerformance(wordId: string, correct: boolean, timeSpent: number): void {
    this.adaptiveDifficulty.updatePerformance(correct, timeSpent, 5); // Default difficulty
  }

  shouldProvideHint(): boolean {
    return this.adaptiveDifficulty.shouldShowHint();
  }
}

// Export algorithms
export const spacedRepetition = new SpacedRepetitionAlgorithm();
export const adaptiveDifficulty = new AdaptiveDifficultyAlgorithm();
export const wordSelection = WordSelectionAlgorithm.getInstance();