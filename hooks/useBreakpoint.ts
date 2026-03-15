// hooks/useBreakpoint.ts
// Returns breakpoint flags based on window width.
// Breakpoints: mobile < 768px, tablet 768-1024px, desktop > 1024px
import { useState, useEffect } from 'react';

interface Breakpoint {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
}

function getBreakpoint(width: number): Breakpoint {
  return {
    width,
    isMobile: width < 768,
    isTablet: width >= 768 && width <= 1024,
    isDesktop: width > 1024,
  };
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(() =>
    typeof window !== 'undefined'
      ? getBreakpoint(window.innerWidth)
      : { isMobile: false, isTablet: false, isDesktop: true, width: 1440 }
  );

  useEffect(() => {
    const handler = () => setBp(getBreakpoint(window.innerWidth));
    window.addEventListener('resize', handler, { passive: true });
    return () => window.removeEventListener('resize', handler);
  }, []);

  return bp;
}
