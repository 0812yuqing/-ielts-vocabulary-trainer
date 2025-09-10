import React from 'react';
import { motion } from 'framer-motion';
import { Timer, Target, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { PixelCard } from './PixelCard';
import { PixelProgress } from './PixelProgress';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'gold' | 'green' | 'blue' | 'red' | 'purple';
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  className
}) => {
  const colorClasses = {
    gold: 'text-contra-gold',
    green: 'text-contra-green',
    blue: 'text-power-up-blue',
    red: 'text-red-500',
    purple: 'text-purple-500'
  };

  return (
    <PixelCard variant="default" className={clsx('p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className={clsx('text-2xl', colorClasses[color])}>
          {icon}
        </div>
        
        {trend && (
          <div className="text-right">
            <div className={clsx(
              'pixel-font text-xs',
              trend.value > 0 ? 'text-contra-green' : 'text-red-500'
            )}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </div>
            <div className="pixel-font text-xs text-pixel-light-gray">
              {trend.label}
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="pixel-font text-xs text-pixel-light-gray">
          {title}
        </div>
        <motion.div
          className={clsx('pixel-font text-2xl font-bold', colorClasses[color])}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {value}
        </motion.div>
      </div>
    </PixelCard>
  );
};

interface MissionProgressProps {
  title: string;
  current: number;
  target: number;
  unit: string;
  icon: React.ReactNode;
  deadline?: string;
  className?: string;
}

export const MissionProgress: React.FC<MissionProgressProps> = ({
  title,
  current,
  target,
  unit,
  icon,
  deadline,
  className
}) => {
  const progress = Math.min((current / target) * 100, 100);
  const isCompleted = current >= target;

  return (
    <PixelCard variant="default" className={clsx('p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="text-contra-gold">{icon}</div>
          <div className="pixel-font text-sm text-contra-gold">
            {title}
          </div>
        </div>
        
        {deadline && (
          <div className="pixel-font text-xs text-pixel-light-gray">
            ⏰ {deadline}
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="pixel-font text-xs text-pixel-white">
            {current} {unit}
          </span>
          <span className="pixel-font text-xs text-pixel-light-gray">
            / {target} {unit}
          </span>
        </div>
        
        <PixelProgress
          label="MISSION PROGRESS"
          value={current}
          max={target}
          variant="exp"
          showPercentage
        />
        
        {isCompleted && (
          <motion.div
            className="text-center pixel-font text-xs text-contra-green"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            ✅ MISSION COMPLETE!
          </motion.div>
        )}
      </div>
    </PixelCard>
  );
};

interface TodayBattleReportProps {
  wordsStudied: number;
  accuracy: number;
  timeSpent: number; // in seconds
  streak: number;
  className?: string;
}

export const TodayBattleReport: React.FC<TodayBattleReportProps> = ({
  wordsStudied,
  accuracy,
  timeSpent,
  streak,
  className
}) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <PixelCard variant="default" className={clsx('p-4', className)}>
      <div className="pixel-font text-sm text-contra-gold border-b border-pixel-gray pb-2 mb-3">
        📋 TODAY'S BATTLE REPORT
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <StatsCard
          title="WORDS DEFEATED"
          value={wordsStudied}
          icon={<Target size={20} />}
          color="gold"
        />
        
        <StatsCard
          title="ACCURACY RATE"
          value={`${Math.round(accuracy)}%`}
          icon={<Zap size={20} />}
          color="green"
          trend={{ value: Math.round(accuracy - 75), label: 'vs avg' }}
        />
        
        <StatsCard
          title="TIME IN COMBAT"
          value={formatTime(timeSpent)}
          icon={<Timer size={20} />}
          color="blue"
        />
        
        <StatsCard
          title="BATTLE STREAK"
          value={streak}
          icon="🔥"
          color="red"
        />
      </div>
      
      {/* Battle summary */}
      <div className="mt-3 pt-3 border-t border-pixel-gray">
        <div className="pixel-font text-xs text-pixel-light-gray mb-1">
          BATTLE STATUS
        </div>
        <div className="pixel-font text-sm text-contra-green">
          {wordsStudied >= 20 ? '🎯 MISSION ACCOMPLISHED' : '⚔️ BATTLE IN PROGRESS'}
        </div>
      </div>
    </PixelCard>
  );
};