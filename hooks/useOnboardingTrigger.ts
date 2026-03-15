import { useEffect } from 'react';

export function useOnboardingTrigger(isEmpty: boolean, sectionId: string, onTrigger: () => void): void {
  useEffect(() => {
    if (!isEmpty) return;
    const key = `onboarding-triggered-${sectionId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, 'true');
    onTrigger();
  }, [isEmpty, sectionId, onTrigger]);
}
