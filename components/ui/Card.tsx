import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  interactive?: boolean;
  className?: string;
}

export function Card({ children, hover = false, interactive = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface border border-border-card rounded-md transition-colors',
        hover && 'hover:border-text-secondary/40',
        interactive && 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-transform',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
