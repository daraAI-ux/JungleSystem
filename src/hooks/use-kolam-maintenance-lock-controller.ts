import {useEffect, useState} from 'react';
import {ApiError} from '../lib/api-error';
import {getKolamWebSetting} from '../services/kolam-api';

const MAINTENANCE_POLL_MS = 5000;
const MAINTENANCE_HTTP_STATUSES = new Set([502, 503, 504]);

export function useKolamMaintenanceLockController(enabled: boolean) {
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setLocked(false);
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      timeoutId = setTimeout(checkMaintenance, MAINTENANCE_POLL_MS);
    };

    const checkMaintenance = async () => {
      try {
        const webSetting = await getKolamWebSetting();
        if (!cancelled) {
          setLocked(webSetting.maintenance?.pos === true);
        }
      } catch (error) {
        if (!cancelled && isMaintenanceError(error)) {
          setLocked(true);
        }
      } finally {
        if (!cancelled) {
          schedule();
        }
      }
    };

    checkMaintenance().catch(() => undefined);

    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [enabled]);

  return {locked};
}

function isMaintenanceError(error: unknown) {
  return (
    error instanceof ApiError &&
    MAINTENANCE_HTTP_STATUSES.has(error.status)
  );
}
