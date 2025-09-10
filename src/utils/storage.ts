import { StorageAdapter, UserData, StudyRecord, TestResult, SyncData } from '../types';

// IndexedDB implementation
class IndexedDBStorage implements StorageAdapter {
  private dbName = 'VocabularyGame';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('studyRecords')) {
          const store = db.createObjectStore('studyRecords', { keyPath: 'id' });
          store.createIndex('wordId', 'wordId', { unique: false });
          store.createIndex('userId', 'userId', { unique: false });
        }
        if (!db.objectStoreNames.contains('testRecords')) {
          db.createObjectStore('testRecords', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('achievements')) {
          db.createObjectStore('achievements', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.put({ id: key, data: value });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async remove(key: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Study records specific methods
  async saveStudyRecord(record: StudyRecord): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['studyRecords'], 'readwrite');
      const store = transaction.objectStore('studyRecords');
      const request = store.put(record);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getStudyRecords(): Promise<StudyRecord[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['studyRecords'], 'readonly');
      const store = transaction.objectStore('studyRecords');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getStudyRecordsByWord(wordId: string): Promise<StudyRecord[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['studyRecords'], 'readonly');
      const store = transaction.objectStore('studyRecords');
      const index = store.index('wordId');
      const request = index.getAll(wordId);
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getStudyRecordsByUser(userId: string): Promise<StudyRecord[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['studyRecords'], 'readonly');
      const store = transaction.objectStore('studyRecords');
      const index = store.index('userId');
      const request = index.getAll(userId);
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Test records specific methods
  async saveTestResult(result: TestResult): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['testRecords'], 'readwrite');
      const store = transaction.objectStore('testRecords');
      const request = store.put(result);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getTestResults(userId: string): Promise<TestResult[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['testRecords'], 'readonly');
      const store = transaction.objectStore('testRecords');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const results = (request.result || []) as TestResult[];
        resolve(results.filter(result => result.id.includes(userId)));
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// localStorage fallback implementation
class LocalStorageAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('localStorage get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('localStorage set error:', error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage remove error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('localStorage clear error:', error);
    }
  }

  async saveStudyRecord(record: StudyRecord): Promise<void> {
    const records = await this.get<StudyRecord[]>('studyRecords') || [];
    const existingIndex = records.findIndex(r => r.id === record.id);
    
    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }
    
    await this.set('studyRecords', records);
  }

  async getStudyRecords(): Promise<StudyRecord[]> {
    return await this.get<StudyRecord[]>('studyRecords') || [];
  }

  async getStudyRecordsByWord(wordId: string): Promise<StudyRecord[]> {
    const records = await this.getStudyRecords();
    return records.filter(record => record.wordId === wordId);
  }

  async getStudyRecordsByUser(userId: string): Promise<StudyRecord[]> {
    const records = await this.getStudyRecords();
    return records.filter(record => record.userId === userId);
  }

  async saveTestResult(result: TestResult): Promise<void> {
    const results = await this.get<TestResult[]>('testRecords') || [];
    results.push(result);
    await this.set('testRecords', results);
  }

  async getTestResults(userId: string): Promise<TestResult[]> {
    const results = await this.get<TestResult[]>('testRecords') || [];
    return results.filter(result => result.id.includes(userId));
  }
}

// Storage Manager
class StorageManager {
  private adapter: StorageAdapter;
  private readonly MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly WARNING_THRESHOLD = 0.8; // 80% usage warning

  constructor() {
    // Check support and choose adapter
    this.adapter = this.isIndexedDBSupported() 
      ? new IndexedDBStorage() 
      : new LocalStorageAdapter();
  }

  private isIndexedDBSupported(): boolean {
    try {
      return 'indexedDB' in window && indexedDB !== null;
    } catch {
      return false;
    }
  }

  // Generic storage methods
  async get<T>(key: string): Promise<T | null> {
    return await this.adapter.get<T>(key);
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.adapter.set<T>(key, value);
  }

  async remove(key: string): Promise<void> {
    await this.adapter.remove(key);
  }

  async clear(): Promise<void> {
    await this.adapter.clear();
  }

  // User data methods
  async saveUserData(userData: UserData): Promise<void> {
    await this.adapter.set('user', userData);
  }

  async getUserData(): Promise<UserData | null> {
    return await this.adapter.get<UserData>('user');
  }

  // Study records methods
  async saveStudyRecord(record: StudyRecord): Promise<void> {
    await this.adapter.saveStudyRecord(record);
  }

  async getStudyRecords(): Promise<StudyRecord[]> {
    return await this.adapter.getStudyRecords();
  }

  async getStudyRecordsByWord(wordId: string): Promise<StudyRecord[]> {
    return await this.adapter.getStudyRecordsByWord(wordId);
  }

  async getStudyRecordsByUser(userId: string): Promise<StudyRecord[]> {
    return await this.adapter.getStudyRecordsByUser(userId);
  }

  async getStudyRecord(wordId: string, userId: string): Promise<StudyRecord | null> {
    const records = await this.getStudyRecordsByUser(userId);
    return records.find(record => record.wordId === wordId) || null;
  }

  // Test results methods
  async saveTestResult(result: TestResult): Promise<void> {
    await this.adapter.saveTestResult(result);
  }

  async getTestResults(userId: string): Promise<TestResult[]> {
    return await this.adapter.getTestResults(userId);
  }

  // Settings methods
  async saveSetting(key: string, value: any): Promise<void> {
    await this.adapter.set(`setting_${key}`, value);
  }

  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    const value = await this.adapter.get<T>(`setting_${key}`);
    return value !== null ? value : defaultValue;
  }

  // Data export/import
  async exportData(): Promise<string> {
    const userData = await this.getUserData();
    const studyRecords = await this.getStudyRecords();
    const testResults = userData ? await this.getTestResults(userData.id) : [];
    
    const syncData: SyncData = {
      user: userData!,
      studyRecords: studyRecords.reduce((acc, record) => {
        acc[record.id] = record;
        return acc;
      }, {} as Record<string, StudyRecord>),
      testResults,
      achievements: [],
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(syncData, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData) as SyncData;
      
      if (data.user) {
        await this.saveUserData(data.user);
      }
      
      if (data.studyRecords) {
        for (const record of Object.values(data.studyRecords)) {
          await this.saveStudyRecord(record);
        }
      }
      
      if (data.testResults) {
        for (const result of data.testResults) {
          await this.saveTestResult(result);
        }
      }
      
      console.log('Data imported successfully');
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }

  // Storage quota management
  async checkStorageQuota(): Promise<{ used: number; total: number; percentage: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        total: estimate.quota || this.MAX_STORAGE_SIZE,
        percentage: ((estimate.usage || 0) / (estimate.quota || this.MAX_STORAGE_SIZE)) * 100
      };
    }
    
    // Fallback estimation
    const estimatedSize = await this.estimateLocalStorageSize();
    return {
      used: estimatedSize,
      total: this.MAX_STORAGE_SIZE,
      percentage: (estimatedSize / this.MAX_STORAGE_SIZE) * 100
    };
  }

  private async estimateLocalStorageSize(): Promise<number> {
    let totalSize = 0;
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    
    return totalSize * 2; // Rough estimation (UTF-16 encoding)
  }

  async cleanupOldData(): Promise<void> {
    const quota = await this.checkStorageQuota();
    
    if (quota.percentage > this.WARNING_THRESHOLD) {
      console.warn('Storage usage is high, cleaning up old data...');
      
      // Clean up old test results (keep only last 100)
      const userData = await this.getUserData();
      if (userData) {
        const testResults = await this.getTestResults(userData.id);
        if (testResults.length > 100) {
          // Remove oldest results
          const toKeep = testResults.slice(-100);
          await this.adapter.remove('testRecords');
          for (const result of toKeep) {
            await this.saveTestResult(result);
          }
        }
      }
    }
  }

  // Utility methods
  async isDataAvailable(): Promise<boolean> {
    const userData = await this.getUserData();
    return userData !== null;
  }

  async resetData(): Promise<void> {
    await this.clear();
    console.log('All data has been reset');
  }
}

// Export singleton instance
export const storage = new StorageManager();