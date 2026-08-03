import {useCallback, useEffect, useState} from 'react';
import {getKolamPusatAiHubTab} from '../domain/kolam-pusat-ai';
import type {KolamDaraStaffNotifyLog} from '../domain/kolam-pusat-ai-log-dara';
import {getErrorMessage as getApiErrorMessage} from '../lib/api-error';
import {fetchKolamDaraStaffNotifyLog} from '../services/kolam-dara-staff-notify-log-api';

export type KolamPusatAiLogDaraDataSource = 'idle' | 'live' | 'error';

export interface KolamPusatAiLogDaraController {
  dataSource: KolamPusatAiLogDaraDataSource;
  error: string | null;
  loading: boolean;
  log: KolamDaraStaffNotifyLog | null;
  onRefresh: () => Promise<void>;
}

export function useKolamPusatAiLogDaraController(
  route: string,
): KolamPusatAiLogDaraController {
  const enabled = getKolamPusatAiHubTab(route) === 'log-dara';
  const [log, setLog] = useState<KolamDaraStaffNotifyLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamPusatAiLogDaraDataSource>('idle');

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setLog(await fetchKolamDaraStaffNotifyLog(72, 80));
      setDataSource('live');
    } catch (err) {
      setLog(null);
      setDataSource('error');
      setError(getApiErrorMessage(err, 'Gagal memuat log DARA'));
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void onRefresh();
  }, [enabled, onRefresh]);

  return {
    dataSource,
    error,
    loading,
    log,
    onRefresh,
  };
}
