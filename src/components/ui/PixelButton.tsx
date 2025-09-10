import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { PixelButtonProps } from '../types';

export const PixelButton: React.FC<PixelButtonProps> = ({ 
  variant, 
  pixelSize = 'md', 
  className, 
  children, 
  onClick, 
  disabled = false 
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-contra-gold text-pixel-black hover:bg-yellow-400 active:bg-yellow-500',
    secondary: 'bg-pixel-gray text-pixel-white hover:bg-gray-600 active:bg-gray-700',
    danger: 'bg-red-600 text-pixel-white hover:bg-red-700 active:bg-red-800',
    'power-up': 'bg-power-up-blue text-pixel-white hover:bg-blue-400 active:bg-blue-500'
  };

  const baseClasses = 'pixel-font font-bold border-2 border-transparent transition-all duration-150 relative overflow-hidden';

  return (
    <motion.button
      className={clsx(
        baseClasses,
        sizeClasses[pixelSize],
        variantClasses[variant],
        'pixel-button',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {/* Button shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-300"></div>
      
      {/* Pixel border effect */}
      <div className="absolute inset-0 border-2 border-white/20 pointer-events-none"></div>
      
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};