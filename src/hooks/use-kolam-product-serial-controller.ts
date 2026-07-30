import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createInitialProductSerialListFilters,
  getKolamProductSerialSurfaceMode,
  type KolamProductSerial,
  type KolamProductSerialListFilters,
  type KolamProductSerialOpnameResult,
  type KolamProductSerialPagination,
  type KolamProductSerialSurfaceMode,
} from '../domain/kolam-product-serial';
import { getErrorMessage } from '../lib/api-error';
import {
  getKolamProductSerialList,
  submitKolamProductSerialOpname,
} from '../services/kolam-product-serial-api';

const DEFAULT_PAGINATION: KolamProductSerialPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

export interface KolamProductSerialOpnameSessionItem {
  key: string;
  serialNumber: string;
  found: boolean;
  message: string;
  data: KolamProductSerialOpnameResult['data'];
  scannedAt: string;
}

export interface KolamProductSerialController {
  error: string | null;
  filters: KolamProductSerialListFilters;
  loading: boolean;
  mode: KolamProductSerialSurfaceMode;
  opnameInput: string;
  opnameSubmitting: boolean;
  pagination: KolamProductSerialPagination;
  serials: KolamProductSerial[];
  sessionItems: KolamProductSerialOpnameSessionItem[];
  statusMessage: string | null;
  onChangeFilters: (patch: Partial<KolamProductSerialListFilters>) => void;
  onClearFilters: () => void;
  onClearProductFilter: () => void;
  onClearStatusMessage: () => void;
  onLimitChange: (limit: number) => void;
  onOpnameInputChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => Promise<void>;
  onResetSession: () => void;
  onSearchChange: (search: string) => void;
  onSubmitOpname: () => Promise<void>;
}

export function useKolamProductSerialController(
  route: string,
): KolamProductSerialController {
  const [mode, setMode] = useState<KolamProductSerialSurfaceMode>(() =>
    getKolamProductSerialSurfaceMode(route),
  );
  const [filters, setFilters] = useState<KolamProductSerialListFilters>(() =>
    createInitialProductSerialListFilters(route),
  );
  const [serials, setSerials] = useState<KolamProductSerial[]>([]);
  const [pagination, setPagination] =
    useState<KolamProductSerialPagination>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [opnameInput, setOpnameInput] = useState('');
  const [opnameSubmitting, setOpnameSubmitting] = useState(false);
  const [sessionItems, setSessionItems] = useState<
    KolamProductSerialOpnameSessionItem[]
  >([]);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const nextMode = getKolamProductSerialSurfaceMode(route);
    setMode(nextMode);
    if (nextMode === 'list') {
      setFilters(createInitialProductSerialListFilters(route));
    }
    setError(null);
    setStatusMessage(null);
  }, [route]);

  const refreshList = useCallback(
    async (nextFilters: KolamProductSerialListFilters) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);
      try {
        const result = await getKolamProductSerialList(nextFilters);
        if (requestId !== requestIdRef.current) {
          return;
        }
        setSerials(result.data);
        setPagination(result.pagination);
      } catch (loadError) {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setSerials([]);
        setPagination(DEFAULT_PAGINATION);
        setError(getErrorMessage(loadError));
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (mode !== 'list') {
      return;
    }
    void refreshList(filters);
  }, [filters, mode, refreshList]);

  const onChangeFilters = useCallback(
    (patch: Partial<KolamProductSerialListFilters>) => {
      setFilters(current => ({
        ...current,
        ...patch,
        page: patch.page ?? 1,
      }));
    },
    [],
  );

  const onSearchChange = useCallback((search: string) => {
    setFilters(current => ({ ...current, search, page: 1 }));
  }, []);

  const onPageChange = useCallback((page: number) => {
    setFilters(current => ({ ...current, page: Math.max(1, page) }));
  }, []);

  const onLimitChange = useCallback((limit: number) => {
    setFilters(current => ({ ...current, limit, page: 1 }));
  }, []);

  const onClearFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      productType: '',
      status: '',
      productId: '',
    });
  }, []);

  const onClearProductFilter = useCallback(() => {
    setFilters(current => ({ ...current, productId: '', page: 1 }));
  }, []);

  const onClearStatusMessage = useCallback(() => {
    setStatusMessage(null);
  }, []);

  const onOpnameInputChange = useCallback((value: string) => {
    setOpnameInput(value);
  }, []);

  const onResetSession = useCallback(() => {
    setSessionItems([]);
    setStatusMessage(null);
    setError(null);
  }, []);

  const onSubmitOpname = useCallback(async () => {
    const trimmed = opnameInput.trim().toUpperCase();
    if (!trimmed) {
      return;
    }

    const alreadyScanned = sessionItems.find(
      item => item.serialNumber === trimmed,
    );
    if (alreadyScanned) {
      setStatusMessage(`${trimmed} sudah dipindai sesi ini.`);
      setOpnameInput('');
      return;
    }

    setOpnameSubmitting(true);
    setError(null);
    try {
      const result = await submitKolamProductSerialOpname(trimmed);
      setSessionItems(current => [
        {
          key: `${trimmed}-${Date.now()}`,
          serialNumber: result.serialNumber || trimmed,
          found: result.found,
          message: result.message,
          data: result.data,
          scannedAt: new Date().toISOString(),
        },
        ...current,
      ]);
      setStatusMessage(result.message || null);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setOpnameSubmitting(false);
      setOpnameInput('');
    }
  }, [opnameInput, sessionItems]);

  const onRefresh = useCallback(async () => {
    if (mode === 'list') {
      await refreshList(filters);
    }
  }, [filters, mode, refreshList]);

  return useMemo(
    () => ({
      error,
      filters,
      loading,
      mode,
      opnameInput,
      opnameSubmitting,
      pagination,
      serials,
      sessionItems,
      statusMessage,
      onChangeFilters,
      onClearFilters,
      onClearProductFilter,
      onClearStatusMessage,
      onLimitChange,
      onOpnameInputChange,
      onPageChange,
      onRefresh,
      onResetSession,
      onSearchChange,
      onSubmitOpname,
    }),
    [
      error,
      filters,
      loading,
      mode,
      opnameInput,
      opnameSubmitting,
      pagination,
      serials,
      sessionItems,
      statusMessage,
      onChangeFilters,
      onClearFilters,
      onClearProductFilter,
      onClearStatusMessage,
      onLimitChange,
      onOpnameInputChange,
      onPageChange,
      onRefresh,
      onResetSession,
      onSearchChange,
      onSubmitOpname,
    ],
  );
}
