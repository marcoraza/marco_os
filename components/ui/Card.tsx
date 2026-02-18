import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  hover?: boolean;
  interactive?: boolean;
}

export function Card({ children, hover = false, interactive = false, className, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={interactive ? { y: -2, transition: { duration: 0.15 } } : undefined}
      className={cn(
        'bg-surface border border-border-card rounded-md transition-colors',
        hover && 'hover:border-text-secondary/40',
        interactive && 'cursor-pointer hover:shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
