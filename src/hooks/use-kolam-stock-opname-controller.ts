import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createInitialStockOpnameListFilters,
  getKolamStockOpnameRouteId,
  getKolamStockOpnameSurfaceMode,
  type KolamStockOpname,
  type KolamStockOpnameLineTargetType,
  type KolamStockOpnameListFilters,
  type KolamStockOpnamePagination,
  type KolamStockOpnameSurfaceMode,
} from '../domain/kolam-stock-opname';
import { ApiError } from '../lib/api-error';
import {
  deleteKolamStockOpname,
  exportKolamStockOpnameList,
  getKolamStockOpnameList,
  importKolamStockOpname,
  createKolamStockOpnameDocument,
} from '../services/kolam-stock-opname-api';

export interface KolamStockOpnameController {
  mode: KolamStockOpnameSurfaceMode;
  documentId: string | null;
  filters: KolamStockOpnameListFilters;
  items: KolamStockOpname[];
  pagination: KolamStockOpnamePagination;
  loading: boolean;
  exporting: boolean;
  importing: boolean;
  deleting: boolean;
  creating: boolean;
  error: string;
  statusMessage: string;
  onChangeFilters: (patch: Partial<KolamStockOpnameListFilters>) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRefresh: () => Promise<void>;
  onExport: () => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onCreate: (note?: string) => Promise<KolamStockOpname | null>;
  onImport: (input: {
    fileUri: string;
    fileName?: string;
    targetType: KolamStockOpnameLineTargetType;
    note?: string;
  }) => Promise<KolamStockOpname | null>;
  clearStatusMessage: () => void;
}

export function useKolamStockOpnameController(
  route: string,
): KolamStockOpnameController {
  const mode = getKolamStockOpnameSurfaceMode(route);
  const documentId = getKolamStockOpnameRouteId(route);
  const [filters, setFilters] = useState<KolamStockOpnameListFilters>(() =>
    createInitialStockOpnameListFilters(route),
  );
  const [items, setItems] = useState<KolamStockOpname[]>([]);
  const [pagination, setPagination] = useState<KolamStockOpnamePagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  useEffect(() => {
    setFilters(createInitialStockOpnameListFilters(route));
  }, [route]);

  useEffect(() => {
    if (mode !== 'list') {
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    void getKolamStockOpnameList(filters)
      .then(result => {
        if (cancelled) {
          return;
        }
        setItems(result.data);
        setPagination(result.pagination);
      })
      .catch(err => {
        if (cancelled) {
          return;
        }
        setItems([]);
        setError(formatError(err));
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [mode, filters]);

  return useMemo(
    () => ({
      mode,
      documentId,
      filters,
      items,
      pagination,
      loading,
      exporting,
      importing,
      deleting,
      creating,
      error,
      statusMessage,
      onChangeFilters: patch => {
        setFilters(prev => ({
          ...prev,
          ...patch,
          page:
            patch.page != null
              ? patch.page
              : patch.search != null ||
                patch.status != null ||
                patch.startDate != null ||
                patch.endDate != null ||
                patch.limit != null
              ? 1
              : prev.page,
        }));
      },
      onClearFilters: () => {
        setFilters({
          search: '',
          status: '',
          startDate: '',
          endDate: '',
          page: 1,
          limit: filtersRef.current.limit,
          sort: 'createdAt:desc',
        });
      },
      onPageChange: page => {
        setFilters(prev => ({ ...prev, page: Math.max(1, page) }));
      },
      onLimitChange: limit => {
        setFilters(prev => ({
          ...prev,
          limit: Math.max(1, limit),
          page: 1,
        }));
      },
      onRefresh: async () => {
        if (mode !== 'list') {
          return;
        }
        setLoading(true);
        setError('');
        try {
          const result = await getKolamStockOpnameList(filtersRef.current);
          setItems(result.data);
          setPagination(result.pagination);
        } catch (err) {
          setError(formatError(err));
        } finally {
          setLoading(false);
        }
      },
      onExport: async () => {
        setExporting(true);
        setError('');
        setStatusMessage('');
        try {
          const saved = await exportKolamStockOpnameList(filtersRef.current);
          setStatusMessage(`Ekspor siap: ${saved.name}`);
          return true;
        } catch (err) {
          setError(formatError(err));
          return false;
        } finally {
          setExporting(false);
        }
      },
      onDelete: async id => {
        setDeleting(true);
        setError('');
        setStatusMessage('');
        try {
          const result = await deleteKolamStockOpname(id);
          setStatusMessage(
            result.documentNumber
              ? `${result.documentNumber} dihapus`
              : 'Dokumen dihapus',
          );
          const list = await getKolamStockOpnameList(filtersRef.current);
          setItems(list.data);
          setPagination(list.pagination);
          return true;
        } catch (err) {
          setError(formatError(err));
          return false;
        } finally {
          setDeleting(false);
        }
      },
      onCreate: async note => {
        setCreating(true);
        setError('');
        setStatusMessage('');
        try {
          const doc = await createKolamStockOpnameDocument({
            note: note?.trim() || undefined,
          });
          setStatusMessage(
            doc.documentNumber
              ? `Draf dibuat: ${doc.documentNumber}`
              : 'Draf stock opname dibuat',
          );
          return doc;
        } catch (err) {
          setError(formatError(err));
          return null;
        } finally {
          setCreating(false);
        }
      },
      onImport: async input => {
        setImporting(true);
        setError('');
        setStatusMessage('');
        try {
          const result = await importKolamStockOpname(input);
          const { summary, header } = result;
          const note =
            summary.errors.length > 0
              ? `Impor: ${summary.imported} berhasil, ${summary.skipped} gagal`
              : `Impor berhasil: ${summary.imported} baris`;
          setStatusMessage(note);
          return header;
        } catch (err) {
          setError(formatError(err));
          return null;
        } finally {
          setImporting(false);
        }
      },
      clearStatusMessage: () => setStatusMessage(''),
    }),
    [
      mode,
      documentId,
      filters,
      items,
      pagination,
      loading,
      exporting,
      importing,
      deleting,
      creating,
      error,
      statusMessage,
    ],
  );
}

function formatError(err: unknown) {
  if (err instanceof ApiError) {
    return err.message || `HTTP ${err.status}`;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Gagal memuat dokumen stock opname';
}
