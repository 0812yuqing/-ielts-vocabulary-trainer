import { Vocabulary } from '../types';
import { coreVocabulary, academicVocabulary, generalVocabulary } from '../data/vocabularyData';

export interface SearchFilters {
  difficulty?: [number, number];
  tags?: string[];
  masteryLevel?: [number, number];
  category?: string;
}

export interface SearchResult {
  word: Vocabulary;
  relevance: number;
  matchedFields: string[];
}

export class VocabularyLoader {
  private cache: Map<string, Vocabulary[]> = new Map();
  private loaded = false;
  private searchIndex: Map<string, Set<string>> = new Map();

  async loadVocabularyData(): Promise<void> {
    if (this.loaded) return;

    try {
      // Load built-in vocabulary data
      this.cache.set('core', coreVocabulary);
      this.cache.set('academic', academicVocabulary);
      this.cache.set('general', generalVocabulary);
      
      // Build search index
      this.buildSearchIndex();
      
      this.loaded = true;
      console.log('Vocabulary data loaded successfully');
    } catch (error) {
      console.error('Failed to load vocabulary data:', error);
      // Use minimal vocabulary as fallback
      this.cache.set('core', this.getMinimalVocabulary());
      this.buildSearchIndex();
      this.loaded = true;
    }
  }

  private buildSearchIndex(): void> {
    this.searchIndex.clear();
    
    const allWords = Array.from(this.cache.values()).flat();
    
    allWords.forEach(word => {
      // Index word itself
      this.addToIndex(word.word.toLowerCase(), word.id);
      
      // Index pronunciation
      this.addToIndex(word.pronunciation.toLowerCase(), word.id);
      
      // Index definitions
      word.definitions.forEach(def => {
        this.addToIndex(def.meaning.toLowerCase(), word.id);
        this.addToIndex(def.partOfSpeech.toLowerCase(), word.id);
        
        // Index examples
        def.examples.forEach(example => {
          this.addToIndex(example.toLowerCase(), word.id);
        });
        
        // Index synonyms
        def.synonyms?.forEach(synonym => {
          this.addToIndex(synonym.toLowerCase(), word.id);
        });
        
        // Index antonyms
        def.antonyms?.forEach(antonym => {
          this.addToIndex(antonym.toLowerCase(), word.id);
        });
      });
      
      // Index tags
      word.tags.forEach(tag => {
        this.addToIndex(tag.toLowerCase(), word.id);
      });
    });
  }

  private addToIndex(term: string, wordId: string): void> {
    if (!this.searchIndex.has(term)) {
      this.searchIndex.set(term, new Set());
    }
    this.searchIndex.get(term)!.add(wordId);
  }

  private getMinimalVocabulary(): Vocabulary[] {
    return [
      {
        id: '1',
        word: 'abandon',
        pronunciation: '/əˈbændən/',
        definitions: [{
          partOfSpeech: 'verb',
          meaning: 'to give up completely',
          examples: ['He abandoned his plan.']
        }],
        difficulty: 4,
        frequency: 85,
        tags: ['common']
      }
    ];
  }

  getWordsByCategory(category: string): Vocabulary[] {
    return this.cache.get(category) || [];
  }

  getAllWords(): Vocabulary[] {
    return Array.from(this.cache.values()).flat();
  }

  getWordsByLevel(level: number): Vocabulary[] {
    const allWords = this.getAllWords();
    const maxDifficulty = Math.min(level + 2, 10);
    const minDifficulty = Math.max(level - 1, 1);
    
    return allWords.filter(word => 
      word.difficulty >= minDifficulty && word.difficulty <= maxDifficulty
    );
  }

  getWordsByDifficulty(min: number, max: number): Vocabulary[] {
    const allWords = this.getAllWords();
    return allWords.filter(word => 
      word.difficulty >= min && word.difficulty <= max
    );
  }

  searchWords(query: string, filters?: SearchFilters, limit = 20): SearchResult[] {
    const allWords = this.getAllWords();
    const lowerQuery = query.toLowerCase();
    
    // Apply filters first
    let filteredWords = allWords;
    
    if (filters) {
      if (filters.difficulty) {
        const [min, max] = filters.difficulty;
        filteredWords = filteredWords.filter(word => 
          word.difficulty >= min && word.difficulty <= max
        );
      }
      
      if (filters.tags && filters.tags.length > 0) {
        filteredWords = filteredWords.filter(word =>
          word.tags.some(tag => filters.tags!.includes(tag))
        );
      }
      
      if (filters.category) {
        filteredWords = filteredWords.filter(word =>
          this.cache.get(filters.category)?.some(w => w.id === word.id)
        );
      }
    }
    
    // Search and rank results
    const results: SearchResult[] = [];
    
    filteredWords.forEach(word => {
      let relevance = 0;
      const matchedFields: string[] = [];
      
      // Exact word match
      if (word.word.toLowerCase() === lowerQuery) {
        relevance += 100;
        matchedFields.push('word');
      }
      // Partial word match
      else if (word.word.toLowerCase().includes(lowerQuery)) {
        relevance += 50;
        matchedFields.push('word');
      }
      
      // Pronunciation match
      if (word.pronunciation.toLowerCase().includes(lowerQuery)) {
        relevance += 30;
        matchedFields.push('pronunciation');
      }
      
      // Definition matches
      word.definitions.forEach(def => {
        if (def.meaning.toLowerCase().includes(lowerQuery)) {
          relevance += 20;
          matchedFields.push('meaning');
        }
        
        def.examples.forEach(example => {
          if (example.toLowerCase().includes(lowerQuery)) {
            relevance += 15;
            matchedFields.push('example');
          }
        });
        
        def.synonyms?.forEach(synonym => {
          if (synonym.toLowerCase() === lowerQuery) {
            relevance += 25;
            matchedFields.push('synonym');
          }
        });
      });
      
      // Tag matches
      word.tags.forEach(tag => {
        if (tag.toLowerCase().includes(lowerQuery)) {
          relevance += 10;
          matchedFields.push('tag');
        }
      });
      
      if (relevance > 0) {
        results.push({
          word,
          relevance,
          matchedFields: [...new Set(matchedFields)]
        });
      }
    });
    
    // Sort by relevance and limit results
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
  }

  getRandomWords(count: number, filters?: SearchFilters): Vocabulary[] {
    let words = this.getAllWords();
    
    if (filters) {
      if (filters.difficulty) {
        const [min, max] = filters.difficulty;
        words = words.filter(word => 
          word.difficulty >= min && word.difficulty <= max
        );
      }
      
      if (filters.tags && filters.tags.length > 0) {
        words = words.filter(word =>
          word.tags.some(tag => filters.tags!.includes(tag))
        );
      }
    }
    
    // Shuffle and take count
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, words.length));
  }

  getWordsForReview(userId: string, masteryRecords: any[], limit = 50): Vocabulary[] {
    const allWords = this.getAllWords();
    const now = new Date();
    
    // Filter words that need review based on mastery records
    const wordsToReview = allWords.filter(word => {
      const record = masteryRecords.find(r => r.wordId === word.id);
      
      if (!record) {
        // New word, always include
        return true;
      }
      
      // Check if it's time for review
      const nextReview = new Date(record.nextReviewAt);
      return nextReview <= now;
    });
    
    // Sort by priority (lower mastery level first)
    return wordsToReview
      .sort((a, b) => {
        const recordA = masteryRecords.find(r => r.wordId === a.id);
        const recordB = masteryRecords.find(r => r.wordId === b.id);
        
        const masteryA = recordA?.masteryLevel || 0;
        const masteryB = recordB?.masteryLevel || 0;
        
        return masteryA - masteryB;
      })
      .slice(0, limit);
  }

  getStatistics(): {
    totalWords: number;
    byCategory: Record<string, number>;
    byDifficulty: Record<number, number>;
    averageDifficulty: number;
  } {
    const allWords = this.getAllWords();
    
    const byCategory: Record<string, number> = {};
    const byDifficulty: Record<number, number> = {};
    
    allWords.forEach(word => {
      // Count by category
      this.cache.forEach((words, category) => {
        if (words.some(w => w.id === word.id)) {
          byCategory[category] = (byCategory[category] || 0) + 1;
        }
      });
      
      // Count by difficulty
      byDifficulty[word.difficulty] = (byDifficulty[word.difficulty] || 0) + 1;
    });
    
    const averageDifficulty = allWords.reduce((sum, word) => sum + word.difficulty, 0) / allWords.length;
    
    return {
      totalWords: allWords.length,
      byCategory,
      byDifficulty,
      averageDifficulty: Math.round(averageDifficulty * 100) / 100
    };
  }

  getWordById(id: string): Vocabulary | undefined {
    const allWords = this.getAllWords();
    return allWords.find(word => word.id === id);
  }

  getSimilarWords(wordId: string, limit = 5): Vocabulary[] {
    const targetWord = this.getWordById(wordId);
    if (!targetWord) return [];
    
    const allWords = this.getAllWords().filter(w => w.id !== wordId);
    const similarWords: Array<{ word: Vocabulary; score: number }> = [];
    
    allWords.forEach(word => {
      let score = 0;
      
      // Same difficulty
      if (Math.abs(word.difficulty - targetWord.difficulty) <= 1) {
        score += 20;
      }
      
      // Same tags
      const commonTags = word.tags.filter(tag => targetWord.tags.includes(tag));
      score += commonTags.length * 15;
      
      // Similar length
      if (Math.abs(word.word.length - targetWord.word.length) <= 2) {
        score += 10;
      }
      
      // Same part of speech
      const targetPos = targetWord.definitions.map(d => d.partOfSpeech);
      const wordPos = word.definitions.map(d => d.partOfSpeech);
      const commonPos = targetPos.filter(pos => wordPos.includes(pos));
      score += commonPos.length * 10;
      
      if (score > 0) {
        similarWords.push({ word, score });
      }
    });
    
    return similarWords
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.word);
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  async refreshData(): Promise<void> {
    this.loaded = false;
    await this.loadVocabularyData();
  }
}

// Export singleton instance
export const vocabularyLoader = new VocabularyLoader();