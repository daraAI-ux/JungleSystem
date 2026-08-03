import {useCallback, useEffect, useState} from 'react';
import {getKolamPusatAiHubTab} from '../domain/kolam-pusat-ai';
import type {KolamOwnerCopilotDashboard} from '../domain/kolam-pusat-ai-owner-copilot';
import {getErrorMessage as getApiErrorMessage} from '../lib/api-error';
import {fetchKolamOwnerCopilotDashboard} from '../services/kolam-dara-owner-copilot-api';

export type KolamPusatAiOwnerCopilotDataSource = 'idle' | 'live' | 'error';

export interface KolamPusatAiOwnerCopilotController {
  dash: KolamOwnerCopilotDashboard | null;
  dataSource: KolamPusatAiOwnerCopilotDataSource;
  error: string | null;
  loading: boolean;
  onRefresh: () => Promise<void>;
}

export function useKolamPusatAiOwnerCopilotController(
  route: string,
): KolamPusatAiOwnerCopilotController {
  const enabled = getKolamPusatAiHubTab(route) === 'owner-copilot';
  const [dash, setDash] = useState<KolamOwnerCopilotDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamPusatAiOwnerCopilotDataSource>('idle');

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setDash(await fetchKolamOwnerCopilotDashboard(24));
      setDataSource('live');
    } catch (err) {
      setDash(null);
      setDataSource('error');
      setError(getApiErrorMessage(err, 'Gagal memuat Owner Copilot'));
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
    dash,
    dataSource,
    error,
    loading,
    onRefresh,
  };
}
