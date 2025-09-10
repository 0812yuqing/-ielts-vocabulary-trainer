import React from 'react';
import { clsx } from 'clsx';
import { PixelCardProps } from '../types';

export const PixelCard: React.FC<PixelCardProps> = ({ 
  variant, 
  className, 
  children 
}) => {
  const baseClasses = 'relative overflow-hidden transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-pixel-black pixel-border',
    bordered: 'bg-transparent pixel-border',
    elevated: 'bg-pixel-black pixel-border shadow-lg transform hover:scale-105'
  };

  return (
    <div className={clsx(baseClasses, variantClasses[variant], className)}>
      {/* CRT scan lines effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="w-full h-full bg-gradient-to-b from-transparent via-white/20 to-transparent animate-pulse"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};