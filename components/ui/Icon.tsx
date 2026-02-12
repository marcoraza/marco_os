import React from 'react';
import { cn } from '../../utils/cn';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg';

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: IconSize;
  className?: string;
}

const sizeMap: Record<IconSize, string> = {
  xs: 'text-xs',    // 12px
  sm: 'text-sm',    // 14px
  md: 'text-base',  // 16px
  lg: 'text-lg',    // 18px
};

export function Icon({ name, size = 'md', className, ...props }: IconProps) {
  return (
    <span 
      className={cn('material-symbols-outlined select-none', sizeMap[size], className)} 
      {...props}
    >
      {name}
    </span>
  );
}