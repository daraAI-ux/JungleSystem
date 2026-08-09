import { useCallback, useEffect, useState } from 'react';
import type {
  KolamFreyerIotDevice,
  KolamFreyerIotDevicePagination,
} from '../domain/kolam-freyer-iot-device';
import { getKolamFreyerIotDevices } from '../services/kolam-freyer-iot-api';

export interface KolamTeranuraIotDevicesController {
  devices: KolamFreyerIotDevice[];
  error: string | null;
  loading: boolean;
  pagination: KolamFreyerIotDevicePagination;
  search: string;
  onPageChange: (page: number) => void;
  onRefresh: () => Promise<void>;
  onSearchChange: (search: string) => void;
}

const PAGE_SIZE = 10;

const DEFAULT_PAGINATION: KolamFreyerIotDevicePagination = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 1,
};

/**
 * FE parity: `useIotFreyerDevices({ teranuraProductId? })` for shell IoT tab
 * and detail Perangkat IoT (page size 10 + shared table footer).
 */
export function useKolamTeranuraIotDevices(
  teranuraProductId?: string | null,
): KolamTeranuraIotDevicesController {
  const [devices, setDevices] = useState<KolamFreyerIotDevice[]>([]);
  const [pagination, setPagination] =
    useState<KolamFreyerIotDevicePagination>(DEFAULT_PAGINATION);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const productFilter = teranuraProductId?.trim() || '';

  const onRefresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getKolamFreyerIotDevices({
        page,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
        teranuraProductId: productFilter || undefined,
      });
      setDevices(result.data);
      setPagination(result.pagination);
    } catch (loadError) {
      setDevices([]);
      setPagination(DEFAULT_PAGINATION);
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [page, productFilter, search]);

  useEffect(() => {
    setPage(1);
    setSearch('');
  }, [productFilter]);

  useEffect(() => {
    void onRefresh();
  }, [onRefresh]);

  const onPageChange = useCallback((nextPage: number) => {
    setPage(Math.max(1, nextPage));
  }, []);

  const onSearchChange = useCallback((next: string) => {
    setPage(1);
    setSearch(next);
  }, []);

  return {
    devices,
    error,
    loading,
    pagination: {
      ...pagination,
      page,
      limit: PAGE_SIZE,
    },
    search,
    onPageChange,
    onRefresh,
    onSearchChange,
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  if (typeof error === 'string' && error.trim()) {
    return error.trim();
  }
  return 'Gagal memuat perangkat IoT.';
}
