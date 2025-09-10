import React from 'react';
import { motion } from 'framer-motion';
import { PixelCard } from './PixelCard';
import { PixelButton } from './PixelButton';

interface LevelIndicatorProps {
  currentLevel: number;
  currentExp: number;
  expToNext: number;
  showProgress?: boolean;
  className?: string;
}

export const LevelIndicator: React.FC<LevelIndicatorProps> = ({
  currentLevel,
  currentExp,
  expToNext,
  showProgress = true,
  className
}) => {
  const progressPercentage = (currentExp / expToNext) * 100;

  return (
    <PixelCard variant="default" className={clsx('p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Level badge */}
          <motion.div
            className="w-12 h-12 bg-contra-gold rounded-full flex items-center justify-center pixel-border"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="pixel-font text-sm font-bold text-pixel-black">
              {currentLevel}
            </span>
          </motion.div>
          
          <div>
            <div className="pixel-font text-sm text-contra-gold">
              LEVEL {currentLevel}
            </div>
            <div className="pixel-font text-xs text-pixel-light-gray">
              {currentExp}/{expToNext} EXP
            </div>
          </div>
        </div>
        
        {/* Rank indicator */}
        <div className="text-right">
          <div className="pixel-font text-xs text-pixel-light-gray">
            RANK
          </div>
          <div className="pixel-font text-sm text-contra-green">
            {getRankTitle(currentLevel)}
          </div>
        </div>
      </div>
      
      {/* Experience progress bar */}
      {showProgress && (
        <div className="space-y-1">
          <div className="w-full bg-pixel-gray rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-contra-gold to-yellow-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </motion.div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="pixel-font text-xs text-pixel-light-gray">
              PROGRESS
            </span>
            <span className="pixel-font text-xs text-contra-gold">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
      )}
      
      {/* Next level preview */}
      <div className="mt-3 pt-3 border-t border-pixel-gray">
        <div className="pixel-font text-xs text-pixel-light-gray mb-1">
          NEXT LEVEL
        </div>
        <div className="flex items-center justify-between">
          <span className="pixel-font text-sm text-pixel-white">
            {getRankTitle(currentLevel + 1)}
          </span>
          <PixelButton variant="secondary" pixelSize="sm" className="text-xs">
            {expToNext - currentExp} EXP
          </PixelButton>
        </div>
      </div>
    </PixelCard>
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