import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  getKolamDaraSeoTab,
  isKolamDaraSeoRoute,
  paginateKolamDaraSeoAuditLogs,
  type KolamDaraSeoAuditLogRow,
} from '../domain/kolam-dara-seo';
import {sanitizeApiErrorMessage} from '../lib/api-error';
import {fetchKolamDaraSeoAuditLogs} from '../services/kolam-dara-seo-api';

export interface KolamDaraSeoAuditLogsController {
  error: string | null;
  loading: boolean;
  page: number;
  pagedItems: KolamDaraSeoAuditLogRow[];
  rows: KolamDaraSeoAuditLogRow[];
  total: number;
  totalPages: number;
  onRefresh: () => Promise<void>;
  onSetPage: (page: number) => void;
}

export function useKolamDaraSeoAuditLogsController(
  route: string,
): KolamDaraSeoAuditLogsController {
  const enabled =
    isKolamDaraSeoRoute(route) && getKolamDaraSeoTab(route) === 'audit-logs';
  const [rows, setRows] = useState<KolamDaraSeoAuditLogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setRows(await fetchKolamDaraSeoAuditLogs());
      setPage(1);
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

  const paged = useMemo(
    () => paginateKolamDaraSeoAuditLogs(rows, page),
    [page, rows],
  );

  return {
    error,
    loading,
    page: paged.page,
    pagedItems: paged.items,
    rows,
    total: paged.total,
    totalPages: paged.totalPages,
    onRefresh,
    onSetPage: setPage,
  };
}
