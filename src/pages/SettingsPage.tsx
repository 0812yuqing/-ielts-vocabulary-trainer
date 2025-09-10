import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  Bell, 
  BellOff, 
  Moon, 
  Sun,
  Download,
  Upload,
  Trash2,
  Shield,
  Palette,
  Globe,
  RefreshCw
} from 'lucide-react';
import { PixelCard } from '../components/ui/PixelCard';
import { PixelButton } from '../components/ui/PixelButton';
import { PixelProgress } from '../components/ui/PixelProgress';
import { useUserStore } from '../stores/userStore';
import { useStudyStore } from '../stores/studyStore';
import { useTestStore } from '../stores/testStore';
import { storage } from '../utils/storage';
import { audioManager } from '../utils/audioService';

interface Settings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  darkMode: boolean;
  language: 'en' | 'zh';
  dailyGoal: number;
  studyReminders: boolean;
  reminderTime: string;
  autoPlayAudio: boolean;
  difficultyPreference: 'adaptive' | 'manual';
  theme: 'classic' | 'neon' | 'monochrome';
}

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useUserStore();
  const { studyHistory } = useStudyStore();
  const { testHistory } = useTestStore();
  
  const [settings, setSettings] = useState<Settings>({
    soundEnabled: true,
    notificationsEnabled: true,
    darkMode: true,
    language: 'en',
    dailyGoal: 20,
    studyReminders: true,
    reminderTime: '19:00',
    autoPlayAudio: false,
    difficultyPreference: 'adaptive',
    theme: 'classic'
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) });
    }
  };

  const saveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    audioManager.toggleMute(!settings.soundEnabled);
  };

  const handleSettingChange = (key: keyof Settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings();
  };

  const exportData = async () => {
    setIsExporting(true);
    try {
      const exportData = {
        user,
        studyHistory,
        testHistory,
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ielts-vocab-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate imported data
      if (data.user && data.studyHistory && data.testHistory) {
        // Import data
        await storage.saveUserData(data.user);
        await storage.saveStudyHistory(data.studyHistory);
        await storage.saveTestHistory(data.testHistory);
        
        // Update stores
        updateUser(data.user);
        
        alert('Data imported successfully! Please refresh the page.');
        window.location.reload();
      } else {
        alert('Invalid backup file format.');
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import data. Please check the file format.');
    } finally {
      setIsImporting(false);
    }
  };

  const resetData = async () => {
    setIsResetting(true);
    try {
      // Clear all data
      await storage.clearAllData();
      localStorage.clear();
      
      // Reset user
      updateUser(null);
      
      alert('All data has been reset. Please refresh the page.');
      window.location.reload();
    } catch (error) {
      console.error('Reset failed:', error);
      alert('Failed to reset data.');
    } finally {
      setIsResetting(false);
      setShowResetConfirm(false);
    }
  };

  const getStorageInfo = () => {
    const totalSize = new Blob([
      JSON.stringify(user),
      JSON.stringify(studyHistory),
      JSON.stringify(testHistory)
    ]).size;
    
    return {
      totalSize: (totalSize / 1024).toFixed(2) + ' KB',
      studySessions: studyHistory.length,
      testResults: testHistory.length,
      masteredWords: user?.masteredWords.length || 0
    };
  };

  const storageInfo = getStorageInfo();

  return (
    <div className="min-h-screen bg-pixel-black crt-effect p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="pixel-font text-3xl text-contra-gold mb-2">
            🛠️ ARMORY
          </h1>
          <p className="pixel-font text-sm text-pixel-light-gray">
            Configure your mission settings and preferences
          </p>
        </div>

        {/* Audio Settings */}
        <PixelCard variant="default" className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Volume2 className="text-contra-gold" size={20} />
            <h3 className="pixel-font text-lg text-contra-gold">AUDIO SETTINGS</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="pixel-font text-sm text-pixel-white">Sound Effects</div>
                <div className="pixel-font text-xs text-pixel-light-gray">
                  Enable game sounds and feedback
                </div>
              </div>
              <PixelButton
                variant={settings.soundEnabled ? 'primary' : 'secondary'}
                pixelSize="sm"
                onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
              >
                {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </PixelButton>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="pixel-font text-sm text-pixel-white">Auto-play Audio</div>
                <div className="pixel-font text-xs text-pixel-light-gray">
                  Automatically play word pronunciations
                </div>
              </div>
              <PixelButton
                variant={settings.autoPlayAudio ? 'primary' : 'secondary'}
                pixelSize="sm"
                onClick={() => handleSettingChange('autoPlayAudio', !settings.autoPlayAudio)}
              >
                {settings.autoPlayAudio ? 'ON' : 'OFF'}
              </PixelButton>
            </div>
          </div>
        </PixelCard>

        {/* Study Preferences */}
        <PixelCard variant="default" className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="text-contra-gold" size={20} />
            <h3 className="pixel-font text-lg text-contra-gold">STUDY PREFERENCES</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="pixel-font text-sm text-pixel-white">Daily Goal</div>
                <div className="pixel-font text-xs text-pixel-light-gray">
                  Words to study per day
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PixelButton
                  variant="secondary"
                  pixelSize="sm"
                  onClick={() => handleSettingChange('dailyGoal', Math.max(5, settings.dailyGoal - 5))}
                >
                  -
                </PixelButton>
                <span className="pixel-font text-sm text-pixel-white w-12 text-center">
                  {settings.dailyGoal}
                </span>
                <PixelButton
                  variant="secondary"
                  pixelSize="sm"
                  onClick={() => handleSettingChange('dailyGoal', Math.min(50, settings.dailyGoal + 5))}
                >
                  +
                </PixelButton>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="pixel-font text-sm text-pixel-white">Difficulty</div>
                <div className="pixel-font text-xs text-pixel-light-gray">
                  Adaptive or manual difficulty selection
                </div>
              </div>
              <PixelButton
                variant={settings.difficultyPreference === 'adaptive' ? 'primary' : 'secondary'}
                pixelSize="sm"
                onClick={() => handleSettingChange('difficultyPreference', 
                  settings.difficultyPreference === 'adaptive' ? 'manual' : 'adaptive'
                )}
              >
                {settings.difficultyPreference === 'adaptive' ? 'ADAPTIVE' : 'MANUAL'}
              </PixelButton>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="pixel-font text-sm text-pixel-white">Study Reminders</div>
                <div className="pixel-font text-xs text-pixel-light-gray">
                  Daily study notifications
                </div>
              </div>
              <PixelButton
                variant={settings.studyReminders ? 'primary' : 'secondary'}
                pixelSize="sm"
                onClick={() => handleSettingChange('studyReminders', !settings.studyReminders)}
              >
                {settings.studyReminders ? <Bell size={16} /> : <BellOff size={16} />}
              </PixelButton>
            </div>
          </div>
        </PixelCard>

        {/* Appearance */}
        <PixelCard variant="default" className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="text-contra-gold" size={20} />
            <h3 className="pixel-font text-lg text-contra-gold">APPEARANCE</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="pixel-font text-sm text-pixel-white">Theme</div>
                <div className="pixel-font text-xs text-pixel-light-gray">
                  Color scheme for the interface
                </div>
              </div>
              <div className="flex gap-2">
                {['classic', 'neon', 'monochrome'].map((theme) => (
                  <PixelButton
                    key={theme}
                    variant={settings.theme === theme ? 'primary' : 'secondary'}
                    pixelSize="sm"
                    onClick={() => handleSettingChange('theme', theme)}
                  >
                    {theme.toUpperCase()}
                  </PixelButton>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="pixel-font text-sm text-pixel-white">Language</div>
                <div className="pixel-font text-xs text-pixel-light-gray">
                  Interface language
                </div>
              </div>
              <div className="flex gap-2">
                <PixelButton
                  variant={settings.language === 'en' ? 'primary' : 'secondary'}
                  pixelSize="sm"
                  onClick={() => handleSettingChange('language', 'en')}
                >
                  EN
                </PixelButton>
                <PixelButton
                  variant={settings.language === 'zh' ? 'primary' : 'secondary'}
                  pixelSize="sm"
                  onClick={() => handleSettingChange('language', 'zh')}
                >
                  中文
                </PixelButton>
              </div>
            </div>
          </div>
        </PixelCard>

        {/* Data Management */}
        <PixelCard variant="default" className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-contra-gold" size={20} />
            <h3 className="pixel-font text-lg text-contra-gold">DATA MANAGEMENT</h3>
          </div>
          
          <div className="space-y-4">
            {/* Storage Info */}
            <div className="bg-pixel-gray/30 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="pixel-font text-pixel-light-gray">Storage Used</div>
                  <div className="pixel-font text-pixel-white">{storageInfo.totalSize}</div>
                </div>
                <div>
                  <div className="pixel-font text-pixel-light-gray">Study Sessions</div>
                  <div className="pixel-font text-pixel-white">{storageInfo.studySessions}</div>
                </div>
                <div>
                  <div className="pixel-font text-pixel-light-gray">Test Results</div>
                  <div className="pixel-font text-pixel-white">{storageInfo.testResults}</div>
                </div>
                <div>
                  <div className="pixel-font text-pixel-light-gray">Mastered Words</div>
                  <div className="pixel-font text-pixel-white">{storageInfo.masteredWords}</div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <PixelButton
                variant="secondary"
                onClick={exportData}
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                {isExporting ? 'EXPORTING...' : 'EXPORT DATA'}
              </PixelButton>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isImporting}
                />
                <PixelButton
                  variant="secondary"
                  disabled={isImporting}
                  className="w-full flex items-center gap-2"
                >
                  <Upload size={16} />
                  {isImporting ? 'IMPORTING...' : 'IMPORT DATA'}
                </PixelButton>
              </div>
            </div>
            
            {/* Reset Data */}
            <div className="border-t border-pixel-gray pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="pixel-font text-sm text-red-500">Reset All Data</div>
                  <div className="pixel-font text-xs text-pixel-light-gray">
                    Permanently delete all progress and settings
                  </div>
                </div>
                <PixelButton
                  variant="danger"
                  onClick={() => setShowResetConfirm(true)}
                  disabled={isResetting}
                >
                  {isResetting ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </PixelButton>
              </div>
              
              {showResetConfirm && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
                  <div className="pixel-font text-sm text-red-500 mb-2">
                    ⚠️ WARNING: This action cannot be undone!
                  </div>
                  <div className="pixel-font text-xs text-pixel-light-gray mb-3">
                    All your progress, settings, and data will be permanently deleted.
                  </div>
                  <div className="flex gap-2">
                    <PixelButton
                      variant="danger"
                      onClick={resetData}
                      className="flex-1"
                    >
                      YES, RESET EVERYTHING
                    </PixelButton>
                    <PixelButton
                      variant="secondary"
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1"
                    >
                      CANCEL
                    </PixelButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PixelCard>

        {/* App Info */}
        <PixelCard variant="default" className="p-6 text-center">
          <div className="pixel-font text-lg text-contra-gold mb-2">
            IELTS Vocabulary Trainer
          </div>
          <div className="pixel-font text-sm text-pixel-light-gray mb-2">
            Version 1.0.0
          </div>
          <div className="pixel-font text-xs text-pixel-light-gray">
            A retro gaming approach to vocabulary mastery
          </div>
        </PixelCard>
      </div>
    </div>
  );
};