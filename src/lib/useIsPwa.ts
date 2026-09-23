import * as React from 'react';

/**
 * Returns true when the app is running as an installed PWA (standalone display
 * mode). Uses the `display-mode: standalone` media query for most platforms and
 * falls back to the non-standard `navigator.standalone` for iOS Safari.
 *
 * Reactive: updates if the display mode changes at runtime.
 */
export function isRunningAsPwa(): boolean {
  if (typeof window === 'undefined') return false;
  const standaloneMql = window.matchMedia?.('(display-mode: standalone)').matches;
  const iosStandalone = (window.navigator as any)?.standalone === true;
  return Boolean(standaloneMql || iosStandalone);
}

export function useIsPwa(): boolean {
  const [isPwa, setIsPwa] = React.useState<boolean>(() => isRunningAsPwa());

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(display-mode: standalone)');
    const handler = () => setIsPwa(isRunningAsPwa());
    // Older Safari uses addListener/removeListener
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
    } else {
      mql.addListener(handler);
    }
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handler);
      } else {
        mql.removeListener(handler);
      }
    };
  }, []);

  return isPwa;
}
