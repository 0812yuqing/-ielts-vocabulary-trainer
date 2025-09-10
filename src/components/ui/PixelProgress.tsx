import React from 'react';
import { clsx } from 'clsx';
import { PixelProgressProps } from '../types';

export const PixelProgress: React.FC<PixelProgressProps> = ({ 
  label, 
  value, 
  max, 
  variant = 'exp',
  showPercentage = false,
  className 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const variantColors = {
    exp: 'bg-contra-gold',
    health: 'bg-red-500',
    time: 'bg-power-up-blue'
  };

  const variantLabels = {
    exp: 'EXP',
    health: 'HP',
    time: 'TIME'
  };

  return (
    <div className={clsx('space-y-2', className)}>
      {/* Label */}
      <div className="flex justify-between items-center">
        <span className="pixel-font text-xs text-pixel-light-gray">
          {label}
        </span>
        {showPercentage && (
          <span className="pixel-font text-xs text-contra-gold">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      
      {/* Progress bar container */}
      <div className="relative bg-pixel-gray rounded-sm h-3 overflow-hidden">
        {/* Progress fill */}
        <div 
          className={clsx(
            'h-full transition-all duration-500 relative overflow-hidden',
            variantColors[variant]
          )}
          style={{ width: `${percentage}%` }}
        >
          {/* Animated pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
        </div>
        
        {/* Pixel pattern overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="w-full h-full" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
          }}></div>
        </div>
      </div>
      
      {/* Value display */}
      <div className="flex justify-between items-center">
        <span className="pixel-font text-xs text-pixel-white">
          {value}/{max}
        </span>
        <span className="pixel-font text-xs text-pixel-light-gray">
          {variantLabels[variant]}
        </span>
      </div>
    </div>
  );
};