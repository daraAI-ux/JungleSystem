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
  onRefresh: () => Promise<void>;
  onSearchChange: (search: string) => void;
}

const DEFAULT_PAGINATION: KolamFreyerIotDevicePagination = {
  page: 1,
  limit: 100,
  total: 0,
  totalPages: 1,
};

/**
 * FE parity: `useIotFreyerDevices({ teranuraProductId })` for Teranura detail
 * tab Perangkat IoT.
 */
export function useKolamTeranuraIotDevices(
  teranuraProductId: string | null | undefined,
): KolamTeranuraIotDevicesController {
  const [devices, setDevices] = useState<KolamFreyerIotDevice[]>([]);
  const [pagination, setPagination] =
    useState<KolamFreyerIotDevicePagination>(DEFAULT_PAGINATION);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    const id = teranuraProductId?.trim() || '';
    if (!id) {
      setDevices([]);
      setPagination(DEFAULT_PAGINATION);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await getKolamFreyerIotDevices({
        page: 1,
        limit: 100,
        search: search.trim() || undefined,
        teranuraProductId: id,
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
  }, [search, teranuraProductId]);

  useEffect(() => {
    void onRefresh();
  }, [onRefresh]);

  const onSearchChange = useCallback((next: string) => {
    setSearch(next);
  }, []);

  return {
    devices,
    error,
    loading,
    pagination,
    search,
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
