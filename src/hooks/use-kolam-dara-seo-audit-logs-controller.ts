import {useCallback, useEffect, useState} from 'react';
import {
  getKolamDaraSeoTab,
  isKolamDaraSeoRoute,
  type KolamDaraSeoAuditLogRow,
} from '../domain/kolam-dara-seo';
import {sanitizeApiErrorMessage} from '../lib/api-error';
import {fetchKolamDaraSeoAuditLogs} from '../services/kolam-dara-seo-api';

export interface KolamDaraSeoAuditLogsController {
  error: string | null;
  loading: boolean;
  rows: KolamDaraSeoAuditLogRow[];
  onRefresh: () => Promise<void>;
}

export function useKolamDaraSeoAuditLogsController(
  route: string,
): KolamDaraSeoAuditLogsController {
  const enabled =
    isKolamDaraSeoRoute(route) && getKolamDaraSeoTab(route) === 'audit-logs';
  const [rows, setRows] = useState<KolamDaraSeoAuditLogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setRows(await fetchKolamDaraSeoAuditLogs());
    } catch (err) {
      setRows([]);
      setError(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal memuat log audit',
      );
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
    error,
    loading,
    rows,
    onRefresh,
  };
}
