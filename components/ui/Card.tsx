import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;       // hover:border-text-secondary/40
  interactive?: boolean; // cursor-pointer + hover effects
  className?: string;
}

export function Card({ children, hover = false, interactive = false, className, ...props }: CardProps) {
  return (
    <div 
      className={cn(
        'bg-surface border border-border-card rounded-md',
        hover && 'hover:border-text-secondary/40 transition-colors',
        interactive && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}