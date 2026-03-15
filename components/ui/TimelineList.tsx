import React, { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface TimelineListProps {
  children: ReactNode;
  className?: string;
}

export function TimelineList({ children, className }: TimelineListProps) {
  return (
    <div className={cn('flex flex-col gap-0', className)}>
      {children}
    </div>
  );
}
