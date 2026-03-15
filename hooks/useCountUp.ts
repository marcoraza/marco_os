import { useState, useEffect, useRef } from 'react';

export function useCountUp(target: number, duration: number = 1000): number {
  const [value, setValue] = useState(0);
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (prefersReducedMotion.current) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let raf: number;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
