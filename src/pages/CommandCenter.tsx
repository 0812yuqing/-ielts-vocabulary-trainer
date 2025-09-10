import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PixelCard } from '../components/ui/PixelCard';
import { PixelButton } from '../components/ui/PixelButton';
import { LevelIndicator } from '../components/ui/LevelIndicator';
import { StatsCard } from '../components/ui/StatsCard';
import { MissionProgress } from '../components/ui/StatsCard';
import { TodayBattleReport } from '../components/ui/StatsCard';
import { AchievementGrid } from '../components/ui/AchievementBadge';
import { useUserStore } from '../stores/userStore';
import { useStudyStore } from '../stores/studyStore';

interface MissionButtonProps {
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  variant: 'primary' | 'secondary' | 'danger' | 'power-up';
}

const MissionButton: React.FC<MissionButtonProps> = ({
  title,
  subtitle,
  icon,
  route,
  variant
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <PixelCard
        variant="default"
        className="p-4 cursor-pointer h-full hover:shadow-lg transition-all duration-200"
        onClick={() => navigate(route)}
      >
        <div className="text-center space-y-3">
          <div className="text-3xl">{icon}</div>
          <div className="pixel-font text-sm text-contra-gold">
            {title}
          </div>
          <div className="pixel-font text-xs text-pixel-light-gray">
            {subtitle}
          </div>
          <PixelButton variant={variant} pixelSize="sm" className="w-full">
            ENTER
          </PixelButton>
        </div>
      </PixelCard>
    </motion.div>
  );
};

export const CommandCenter: React.FC = () => {
  const { user } = useUserStore();
  const { todayProgress, getTodayProgress } = useStudyStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    getTodayProgress();
  }, [getTodayProgress]);

  if (!user) {
    return (
      <div className="min-h-screen bg-pixel-black crt-effect flex items-center justify-center">
        <PixelCard variant="default" className="p-8 max-w-md w-full mx-4">
          <div className="text-center space-y-4">
            <h1 className="pixel-font text-2xl text-contra-gold mb-6">
              🎮 IELTS VOCABULARY GAME
            </h1>
            <p className="pixel-font text-sm text-pixel-light-gray mb-6">
              Enter your callsign to begin your mission
            </p>
            <input
              type="text"
              placeholder="Enter your name..."
              className="w-full p-3 bg-pixel-gray text-pixel-white pixel-font text-sm border-2 border-contra-gold rounded mb-4"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const username = (e.target as HTMLInputElement).value.trim();
                  if (username) {
                    useUserStore.getState().initializeUser(username);
                  }
                }
              }}
            />
            <PixelButton
              variant="primary"
              className="w-full"
              onClick={() => {
                const input = document.querySelector('input') as HTMLInputElement;
                const username = input?.value.trim();
                if (username) {
                  useUserStore.getState().initializeUser(username);
                }
              }}
            >
              START MISSION
            </PixelButton>
          </div>
        </PixelCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pixel-black crt-effect">
      {/* Header */}
      <div className="bg-pixel-gray border-b-2 border-contra-gold p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">🎮</div>
            <div>
              <h1 className="pixel-font text-lg text-contra-gold">
                COMMAND CENTER
              </h1>
              <div className="pixel-font text-xs text-pixel-light-gray">
                OPERATOR: {user.username.toUpperCase()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <LevelIndicator
              currentLevel={user.level}
              currentExp={user.experience % 1000}
              expToNext={1000}
              showProgress={false}
              className="hidden md:block"
            />
            <div className="text-right">
              <div className="pixel-font text-xs text-contra-green">
                🔥 STREAK: {user.streak}
              </div>
              <div className="pixel-font text-xs text-pixel-light-gray">
                📅 {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Mission Briefing */}
        <PixelCard variant="default" className="mb-6 p-6">
          <div className="text-center space-y-4">
            <div className="pixel-font text-lg text-contra-gold">
              🎯 MISSION BRIEFING
            </div>
            <div className="pixel-font text-sm text-pixel-white">
              OBJECTIVE: MASTER {todayProgress.target - todayProgress.completed} MORE VOCABULARY TARGETS
            </div>
            <div className="pixel-font text-xs text-pixel-light-gray">
              INTELLIGENCE REPORTS SHOW ENEMY WORDS IN THE AREA.
              <br />
              ELIMINATE THEM TO GAIN EXPERIENCE POINTS.
            </div>
          </div>
        </PixelCard>

        {/* Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <MissionButton
            title="TRAINING CAMP"
            subtitle="Learn New Words"
            icon="🏕️"
            route="/study"
            variant="primary"
          />
          <MissionButton
            title="COMBAT ZONE"
            subtitle="Test Your Skills"
            icon="⚔️"
            route="/test"
            variant="danger"
          />
          <MissionButton
            title="INTEL REPORT"
            subtitle="View Progress"
            icon="📊"
            route="/progress"
            variant="secondary"
          />
          <MissionButton
            title="ARMORY"
            subtitle="Settings & Tools"
            icon="🛠️"
            route="/settings"
            variant="secondary"
          />
          <MissionButton
            title="ACHIEVEMENTS"
            subtitle="View Awards"
            icon="🏆"
            route="/achievements"
            variant="power-up"
          />
        </div>

        {/* Status Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Today's Battle Report */}
          <TodayBattleReport
            wordsStudied={todayProgress.completed}
            accuracy={todayProgress.accuracy}
            timeSpent={todayProgress.timeSpent}
            streak={user.streak}
          />

          {/* Current Mission Progress */}
          <MissionProgress
            title="DAILY OBJECTIVE"
            current={todayProgress.completed}
            target={todayProgress.target}
            unit="words"
            icon="🎯"
            deadline="23:59"
          />
        </div>

        {/* Level Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <LevelIndicator
            currentLevel={user.level}
            currentExp={user.experience % 1000}
            expToNext={1000}
          />
          
          <StatsCard
            title="TOTAL ELIMINATED"
            value={user.statistics.totalWordsStudied}
            icon="🏆"
            color="gold"
            trend={{ value: 12, label: 'this week' }}
          />
          
          <StatsCard
            title="MISSION SUCCESS RATE"
            value={`${Math.round(user.statistics.averageAccuracy)}%`}
            icon="📈"
            color="green"
            trend={{ value: 5, label: 'improvement' }}
          />
        </div>

        {/* Recent Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AchievementGrid
            achievements={[
              {
                id: 'first_word',
                name: 'First Victory',
                description: 'Learn your first word',
                icon: '🎯',
                unlockedAt: user.createdAt
              },
              {
                id: 'streak_warrior',
                name: 'Streak Warrior',
                description: '7 day learning streak',
                icon: '🔥',
                unlockedAt: user.streak >= 7 ? user.lastActiveAt : undefined
              },
              {
                id: 'level_10',
                name: 'Elite Soldier',
                description: 'Reach level 10',
                icon: '⭐',
                unlockedAt: user.level >= 10 ? user.lastActiveAt : undefined
              },
              {
                id: 'perfect_score',
                name: 'Perfect Mission',
                description: '100% test accuracy',
                icon: '💯',
                unlockedAt: undefined
              }
            ]}
            maxToShow={4}
          />
          
          {/* Quick Stats */}
          <PixelCard variant="default" className="p-4">
            <div className="pixel-font text-sm text-contra-gold border-b border-pixel-gray pb-2 mb-3">
              📊 QUICK STATS
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="pixel-font text-xs text-pixel-light-gray">MISSIONS COMPLETED:</span>
                <span className="pixel-font text-sm text-pixel-white">
                  {user.statistics.testResults.length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="pixel-font text-xs text-pixel-light-gray">BATTLE TIME:</span>
                <span className="pixel-font text-sm text-power-up-blue">
                  {Math.floor(user.statistics.totalStudyTime / 3600000)}h {Math.floor((user.statistics.totalStudyTime % 3600000) / 60000)}m
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="pixel-font text-xs text-pixel-light-gray">ACHIEVEMENTS:</span>
                <span className="pixel-font text-sm text-contra-gold">
                  {user.achievements.length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="pixel-font text-xs text-pixel-light-gray">RANK:</span>
                <span className="pixel-font text-sm text-contra-green">
                  {getRankTitle(user.level)}
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-pixel-gray">
              <PixelButton
                variant="secondary"
                pixelSize="sm"
                className="w-full"
                onClick={() => navigate('/progress')}
              >
                VIEW DETAILED REPORTS
              </PixelButton>
            </div>
          </PixelCard>
        </div>
      </div>
    </div>
  );
};

// Helper function to get rank titles
function getRankTitle(level: number): string {
  if (level <= 5) return 'ROOKIE';
  if (level <= 10) return 'SOLDIER';
  if (level <= 20) return 'VETERAN';
  if (level <= 30) return 'ELITE';
  if (level <= 40) return 'COMMANDER';
  return 'LEGEND';
}