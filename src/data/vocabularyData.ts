import { Vocabulary, Definition, Achievement, TestQuestion } from '../types';

// Core vocabulary data
export const coreVocabulary: Vocabulary[] = [
  {
    id: '1',
    word: 'abandon',
    pronunciation: '/əˈbændən/',
    definitions: [
      {
        partOfSpeech: 'verb',
        meaning: 'to give up completely',
        examples: ['He abandoned his plan to travel abroad.', 'The captain abandoned the sinking ship.'],
        synonyms: ['desert', 'forsake', 'quit'],
        antonyms: ['continue', 'maintain', 'keep']
      }
    ],
    difficulty: 4,
    frequency: 85,
    tags: ['common', 'academic']
  },
  {
    id: '2',
    word: 'ability',
    pronunciation: '/əˈbɪlɪti/',
    definitions: [
      {
        partOfSpeech: 'noun',
        meaning: 'the physical or mental power or skill needed to do something',
        examples: ['She has the ability to make people feel at ease.', 'He showed remarkable ability in mathematics.'],
        synonyms: ['capability', 'capacity', 'skill'],
        antonyms: ['inability', 'incapacity']
      }
    ],
    difficulty: 3,
    frequency: 92,
    tags: ['common', 'academic']
  },
  {
    id: '3',
    word: 'academic',
    pronunciation: '/ˌækəˈdemɪk/',
    definitions: [
      {
        partOfSpeech: 'adjective',
        meaning: 'relating to education and scholarship',
        examples: ['The university has high academic standards.', 'She is pursuing an academic career.'],
        synonyms: ['educational', 'scholarly', 'intellectual'],
        antonyms: ['practical', 'vocational']
      },
      {
        partOfSpeech: 'noun',
        meaning: 'a teacher or scholar in a university or institute of higher education',
        examples: ['The conference was attended by leading academics from around the world.']
      }
    ],
    difficulty: 5,
    frequency: 78,
    tags: ['academic', 'education']
  },
  {
    id: '4',
    word: 'access',
    pronunciation: '/ˈækses/',
    definitions: [
      {
        partOfSpeech: 'noun',
        meaning: 'the means or opportunity to approach or enter a place',
        examples: ['The building provides wheelchair access.', 'We need access to the database.'],
        synonyms: ['entry', 'admission', 'approach']
      },
      {
        partOfSpeech: 'verb',
        meaning: 'to obtain, examine, or retrieve data',
        examples: ['You can access your email from anywhere.', 'The system allows users to access files remotely.']
      }
    ],
    difficulty: 4,
    frequency: 88,
    tags: ['common', 'technology', 'academic']
  },
  {
    id: '5',
    word: 'accommodate',
    pronunciation: '/əˈkɒmədeɪt/',
    definitions: [
      {
        partOfSpeech: 'verb',
        meaning: 'to provide lodging or sufficient space for someone',
        examples: ['The hotel can accommodate up to 500 guests.', 'The new building can accommodate more students.'],
        synonyms: ['house', 'lodge', 'fit']
      },
      {
        partOfSpeech: 'verb',
        meaning: 'to adapt or adjust to meet a need',
        examples: ['The company can accommodate special dietary requirements.', 'We need to accommodate their schedule.']
      }
    ],
    difficulty: 6,
    frequency: 72,
    tags: ['academic', 'formal']
  }
];

// Academic vocabulary
export const academicVocabulary: Vocabulary[] = [
  {
    id: '6',
    word: 'analyze',
    pronunciation: '/ˈænəlaɪz/',
    definitions: [
      {
        partOfSpeech: 'verb',
        meaning: 'to examine methodically and in detail',
        examples: ['Scientists analyze data to draw conclusions.', 'Students are asked to analyze the poem\'s structure.'],
        synonyms: ['examine', 'investigate', 'study'],
        antonyms: ['synthesize', 'ignore']
      }
    ],
    difficulty: 5,
    frequency: 85,
    tags: ['academic', 'science', 'analysis']
  },
  {
    id: '7',
    word: 'concept',
    pronunciation: '/ˈkɒnsept/',
    definitions: [
      {
        partOfSpeech: 'noun',
        meaning: 'an abstract idea or general notion',
        examples: ['The concept of time is difficult to explain.', 'She introduced the concept of sustainable development.'],
        synonyms: ['idea', 'notion', 'conception'],
        antonyms: ['reality', 'fact']
      }
    ],
    difficulty: 4,
    frequency: 80,
    tags: ['academic', 'philosophy', 'theory']
  },
  {
    id: '8',
    word: 'context',
    pronunciation: '/ˈkɒntekst/',
    definitions: [
      {
        partOfSpeech: 'noun',
        meaning: 'the circumstances that form the setting for an event',
        examples: ['You need to understand the historical context.', 'The quote was taken out of context.'],
        synonyms: ['background', 'situation', 'circumstances']
      }
    ],
    difficulty: 5,
    frequency: 82,
    tags: ['academic', 'language', 'analysis']
  }
];

// General vocabulary
export const generalVocabulary: Vocabulary[] = [
  {
    id: '9',
    word: 'adventure',
    pronunciation: '/ədˈventʃər/',
    definitions: [
      {
        partOfSpeech: 'noun',
        meaning: 'an unusual and exciting experience or activity',
        examples: ['Traveling alone is quite an adventure.', 'The book tells of their adventures in Africa.'],
        synonyms: ['expedition', 'quest', 'venture'],
        antonyms: ['routine', 'boredom']
      },
      {
        partOfSpeech: 'verb',
        meaning: 'to engage in hazardous or exciting activities',
        examples: ['They adventured into the jungle.', 'She likes to adventure in her spare time.']
      }
    ],
    difficulty: 4,
    frequency: 68,
    tags: ['general', 'travel', 'lifestyle']
  },
  {
    id: '10',
    word: 'benefit',
    pronunciation: '/ˈbenɪfɪt/',
    definitions: [
      {
        partOfSpeech: 'noun',
        meaning: 'an advantage or profit gained from something',
        examples: ['The benefits of exercise are well-known.', 'What are the benefits of this approach?'],
        synonyms: ['advantage', 'profit', 'gain'],
        antonyms: ['disadvantage', 'drawback']
      },
      {
        partOfSpeech: 'verb',
        meaning: 'to receive an advantage; to help or improve',
        examples: ['Many people benefit from the new law.', 'The economy will benefit from these changes.']
      }
    ],
    difficulty: 3,
    frequency: 90,
    tags: ['common', 'business', 'general']
  }
];

// Achievement definitions
export const achievements: Achievement[] = [
  {
    id: 'first_word',
    name: '初学者',
    description: '学会你的第一个单词',
    icon: '🎯',
    category: 'learning',
    requirements: [
      {
        type: 'words_learned',
        target: 1,
        comparison: 'greater_than_or_equal'
      }
    ],
    reward: {
      experience: 10
    }
  },
  {
    id: 'word_master_100',
    name: '词汇达人',
    description: '掌握100个单词',
    icon: '🏆',
    category: 'mastery',
    requirements: [
      {
        type: 'words_learned',
        target: 100,
        comparison: 'greater_than_or_equal'
      }
    ],
    reward: {
      experience: 500,
      title: '词汇达人'
    }
  },
  {
    id: 'streak_7',
    name: '坚持不懈',
    description: '连续学习7天',
    icon: '🔥',
    category: 'consistency',
    requirements: [
      {
        type: 'streak_days',
        target: 7,
        comparison: 'greater_than_or_equal'
      }
    ],
    reward: {
      experience: 200,
      items: ['streak_badge']
    }
  },
  {
    id: 'perfect_score',
    name: '完美表现',
    description: '测试中获得100%正确率',
    icon: '⭐',
    category: 'mastery',
    requirements: [
      {
        type: 'test_score',
        target: 100,
        comparison: 'greater_than_or_equal'
      }
    ],
    reward: {
      experience: 300,
      title: '完美主义者'
    }
  },
  {
    id: 'speed_learner',
    name: '快速学习者',
    description: '1小时内学会20个单词',
    icon: '⚡',
    category: 'speed',
    requirements: [
      {
        type: 'time_spent',
        target: 3600,
        comparison: 'less_than_or_equal'
      },
      {
        type: 'words_learned',
        target: 20,
        comparison: 'greater_than_or_equal'
      }
    ],
    reward: {
      experience: 150,
      items: ['speed_bonus']
    }
  }
];

// Test question templates
export const testQuestionTemplates: TestQuestion[] = [
  {
    id: 'mc_1',
    type: 'multiple_choice',
    wordId: '1',
    question: 'What does "abandon" mean?',
    options: [
      'to give up completely',
      'to continue with enthusiasm',
      'to start something new',
      'to understand deeply'
    ],
    correctAnswer: 'to give up completely',
    difficulty: 4,
    timeLimit: 30
  },
  {
    id: 'fb_1',
    type: 'fill_blank',
    wordId: '2',
    question: 'She has the _____ to make people feel at ease.',
    correctAnswer: 'ability',
    difficulty: 3,
    timeLimit: 20
  },
  {
    id: 'ctx_1',
    type: 'context',
    wordId: '3',
    question: 'The university has high _____ standards.',
    context: 'Choosing the right word: The university has high _____ standards.',
    correctAnswer: 'academic',
    difficulty: 5,
    timeLimit: 25
  }
];

// Helper functions
export const getAllVocabulary = (): Vocabulary[] => {
  return [...coreVocabulary, ...academicVocabulary, ...generalVocabulary];
};

export const getVocabularyByCategory = (category: string): Vocabulary[] => {
  switch (category) {
    case 'core':
      return coreVocabulary;
    case 'academic':
      return academicVocabulary;
    case 'general':
      return generalVocabulary;
    default:
      return getAllVocabulary();
  }
};

export const getVocabularyByDifficulty = (minDifficulty: number, maxDifficulty: number): Vocabulary[] => {
  return getAllVocabulary().filter(word => 
    word.difficulty >= minDifficulty && word.difficulty <= maxDifficulty
  );
};

export const searchVocabulary = (query: string): Vocabulary[] => {
  const lowerQuery = query.toLowerCase();
  return getAllVocabulary().filter(word =>
    word.word.toLowerCase().includes(lowerQuery) ||
    word.pronunciation.toLowerCase().includes(lowerQuery) ||
    word.definitions.some(def => 
      def.meaning.toLowerCase().includes(lowerQuery) ||
      def.examples.some(example => example.toLowerCase().includes(lowerQuery))
    )
  );
};