import React from 'react';
import { cn } from '../../utils/cn';

interface SectionLabelProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  icon?: string;  // Material Symbol name
  className?: string;
}

export function SectionLabel({ children, icon, className, ...props }: SectionLabelProps) {
  return (
    <h3 
      className={cn(
        'text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary flex items-center gap-2',
        className
      )}
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-sm">{icon}</span>}
      {children}
    </h3>
  );
}