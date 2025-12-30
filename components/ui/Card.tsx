import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'glass' | 'accent';
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, variant = 'default' }) => {
  const variants = {
    default: 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm',
    glass: 'glass',
    accent: 'bg-white dark:bg-neutral-900 border-primary/20 shadow-glow'
  };

  return (
    <div 
      onClick={onClick}
      className={`
        rounded-2xl border p-6 transition-all duration-300
        ${onClick ? 'cursor-pointer active:scale-[0.98] hover:border-neutral-300 dark:hover:border-neutral-700' : ''}
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};