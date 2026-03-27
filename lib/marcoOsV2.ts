export const DEFAULT_MARCO_OS_V2_URL = 'http://127.0.0.1:3000/';

export function resolveMarcoOsV2Url(raw?: string): string {
  const configured = raw?.trim();
  if (!configured) return DEFAULT_MARCO_OS_V2_URL;

  try {
    if (configured.startsWith('http://') || configured.startsWith('https://')) {
      return new URL(configured).toString();
    }

    if (typeof window !== 'undefined') {
      return new URL(configured, window.location.origin).toString();
    }
  } catch {
    return DEFAULT_MARCO_OS_V2_URL;
  }

  return configured;
}

export function getMarcoOsV2Url(): string {
  const env = (import.meta as ImportMeta).env;
  return resolveMarcoOsV2Url(env?.VITE_MARCO_OS_V2_URL);
}

export function openMarcoOsV2(): { url: string; mode: 'new-tab' | 'same-tab' } {
  const url = getMarcoOsV2Url();

  if (typeof window === 'undefined') {
    return { url, mode: 'same-tab' };
  }

  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  if (opened) {
    opened.opener = null;
    return { url, mode: 'new-tab' };
  }

  window.location.assign(url);
  return { url, mode: 'same-tab' };
}
