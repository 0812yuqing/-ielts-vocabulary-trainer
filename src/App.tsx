import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CommandCenter } from './pages/CommandCenter';
import { StudySession } from './pages/StudySession';
import { ProgressPage } from './pages/ProgressPage';
import { AdvancedAnalytics } from './pages/AdvancedAnalytics';
import { TestSession } from './pages/TestSession';
import { TestResults, TestHistory } from './pages/TestResults';
import { SettingsPage } from './pages/SettingsPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { useUserStore } from './stores/userStore';

function App() {
  const { isInitialized } = useUserStore();

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<CommandCenter />} />
          <Route path="/study" element={<StudySession />} />
          <Route path="/test" element={<TestSession />} />
          <Route path="/test/results" element={<TestResults testResult={undefined} onRetry={() => {}} onContinue={() => {}} />} />
          <Route path="/test/history" element={<TestHistory />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/progress/analytics" element={<AdvancedAnalytics />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;