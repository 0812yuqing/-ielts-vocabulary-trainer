import React from 'react';
import { motion } from 'framer-motion';
import { PixelCard } from './PixelCard';
import { PixelButton } from './PixelButton';

interface AchievementBadgeProps {
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'md',
  showDetails = false,
  className
}) => {
  const isUnlocked = !!achievement.unlockedAt;
  
  const sizeClasses = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-20 h-20 text-3xl',
    lg: 'w-24 h-24 text-4xl'
  };

  return (
    <motion.div
      className={clsx('relative', className)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <PixelCard 
        variant={isUnlocked ? 'default' : 'bordered'} 
        className={clsx(
          'flex flex-col items-center justify-center cursor-pointer transition-all duration-300',
          sizeClasses[size],
          !isUnlocked && 'opacity-50 grayscale'
        )}
      >
        {/* Achievement icon */}
        <motion.div
          className={clsx(
            'mb-2',
            isUnlocked && 'animate-pulse'
          )}
          animate={isUnlocked ? { rotateY: [0, 360] } : {}}
          transition={isUnlocked ? { duration: 2, repeat: Infinity, repeatDelay: 3 } : {}}
        >
          <span className="text-4xl">{achievement.icon}</span>
        </motion.div>
        
        {/* Achievement name */}
        <div className="pixel-font text-xs text-center">
          {achievement.name}
        </div>
        
        {/* Lock overlay for locked achievements */}
        {!isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <span className="text-2xl">🔒</span>
          </div>
        )}
        
        {/* Unlock animation */}
        {isUnlocked && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 1] }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="w-full h-full rounded-lg bg-gradient-to-r from-yellow-400/30 to-transparent"></div>
          </motion.div>
        )}
      </PixelCard>
      
      {/* Details popup */}
      {showDetails && (
        <motion.div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <PixelCard variant="default" className="w-48 p-3">
            <div className="pixel-font text-sm font-bold text-contra-gold mb-1">
              {achievement.name}
            </div>
            <div className="pixel-font text-xs text-pixel-light-gray mb-2">
              {achievement.description}
            </div>
            {isUnlocked && (
              <div className="pixel-font text-xs text-contra-green">
                Unlocked: {new Date(achievement.unlockedAt!).toLocaleDateString()}
              </div>
            )}
          </PixelCard>
        </motion.div>
      )}
    </motion.div>
  );
};

interface AchievementGridProps {
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt?: string;
  }>;
  maxToShow?: number;
  className?: string;
}

export const AchievementGrid: React.FC<AchievementGridProps> = ({
  achievements,
  maxToShow,
  className
}) => {
  const displayAchievements = maxToShow ? achievements.slice(-maxToShow) : achievements;
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  
  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="pixel-font text-sm text-contra-gold">
          🏆 ACHIEVEMENTS
        </div>
        <div className="pixel-font text-xs text-pixel-light-gray">
          {unlockedCount}/{achievements.length}
        </div>
      </div>
      
      {/* Achievement grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {displayAchievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            size="sm"
          />
        ))}
      </div>
      
      {/* View all button */}
      {maxToShow && achievements.length > maxToShow && (
        <div className="text-center">
          <PixelButton variant="secondary" pixelSize="sm" className="text-xs">
            VIEW ALL ({achievements.length})
          </PixelButton>
        </div>
      )}
    </div>
  );
};