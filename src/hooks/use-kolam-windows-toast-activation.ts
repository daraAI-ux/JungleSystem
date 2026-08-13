import {useEffect} from 'react';
import {
  subscribeKolamWindowsToastActivation,
  takeKolamWindowsToastActivation,
  type KolamWindowsToastActivation,
} from '../services/kolam-windows-toast-notification';

const TOAST_ACTIVATION_POLL_MS = 500;

export function useKolamWindowsToastActivation({
  enabled,
  onActivate,
}: {
  enabled: boolean;
  onActivate: (activation: KolamWindowsToastActivation) => void;
}) {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let closed = false;
    const consumePending = () => {
      Promise.resolve(takeKolamWindowsToastActivation())
        .then(activation => {
          if (!closed && activation) {
            onActivate(activation);
          }
        })
        .catch(() => undefined);
    };

    consumePending();
    const timer = setInterval(consumePending, TOAST_ACTIVATION_POLL_MS);
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = subscribeKolamWindowsToastActivation(onActivate);
    } catch {
      unsubscribe = undefined;
    }

    return () => {
      closed = true;
      clearInterval(timer);
      unsubscribe?.();
    };
  }, [enabled, onActivate]);
}
