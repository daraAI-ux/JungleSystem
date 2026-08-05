import { useCallback, useEffect, useMemo, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  buildBonusListRoute,
  createInitialBonusListFilters,
  type KolamBonusListFilters,
  type KolamBonusListRow,
} from '../domain/kolam-bonus';
import {
  hasSettingsPermission,
  isSettingsSuperAdminRoleKey,
} from '../domain/settings-surface';
import { ApiError } from '../lib/api-error';
import {
  createKolamBonus,
  fetchKolamBonusList,
} from '../services/kolam-bonus-api';
import { getKolamUserList } from '../services/kolam-user-api';

const EMPLOYEE_OPTION_LIMIT = 200;

export type KolamBonusEmployeeOption = {
  label: string;
  value: string;
};

export type KolamBonusCreateDraft = {
  userId: string;
  amount: string;
  reason: string;
};

export interface KolamBonusListController {
  filters: KolamBonusListFilters;
  rows: KolamBonusListRow[];
  loading: boolean;
  error: string;
  mutating: boolean;
  canView: boolean;
  canCreate: boolean;
  createOpen: boolean;
  createDraft: KolamBonusCreateDraft;
  employeeOptions: KolamBonusEmployeeOption[];
  loadingEmployees: boolean;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onRefresh: () => Promise<void>;
  onOpenCreate: () => void;
  onCloseCreate: () => void;
  onCreateDraftChange: (patch: Partial<KolamBonusCreateDraft>) => void;
  onCreateBonus: () => Promise<void>;
}

function emptyCreateDraft(): KolamBonusCreateDraft {
  return { userId: '', amount: '', reason: '' };
}

export function useKolamBonusListController(
  route: string,
  onRouteChange?: (route: string) => void,
): KolamBonusListController {
  const { authUser } = useKolamAuthContext();
  const [filters, setFilters] = useState<KolamBonusListFilters>(() =>
    createInitialBonusListFilters(route),
  );
  const [rows, setRows] = useState<KolamBonusListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] =
    useState<KolamBonusCreateDraft>(emptyCreateDraft);
  const [employeeOptions, setEmployeeOptions] = useState<
    KolamBonusEmployeeOption[]
  >([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const permissionContext = useMemo(
    () => ({
      permissions: authUser?.permissions,
      roleKey: authUser?.roleKey,
    }),
    [authUser?.permissions, authUser?.roleKey],
  );
  const isSuperAdmin = isSettingsSuperAdminRoleKey(authUser?.roleKey ?? '');
  const canView =
    isSuperAdmin || hasSettingsPermission(permissionContext, 'salary', 'view');
  const canCreate =
    isSuperAdmin ||
    hasSettingsPermission(permissionContext, 'salary', 'update');

  useEffect(() => {
    setFilters(createInitialBonusListFilters(route));
  }, [route]);

  const syncRoute = useCallback(
    (next: KolamBonusListFilters) => {
      onRouteChange?.(buildBonusListRoute(next));
    },
    [onRouteChange],
  );

  const refresh = useCallback(async () => {
    if (!canView) {
      setRows([]);
      setError('Akses ditolak: butuh izin salary:view.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const nextRows = await fetchKolamBonusList(filters);
      setRows(nextRows);
    } catch (err) {
      setRows([]);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat bonus',
      );
    } finally {
      setLoading(false);
    }
  }, [canView, filters]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const loadEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    try {
      const result = await getKolamUserList({
        page: 1,
        limit: EMPLOYEE_OPTION_LIMIT,
        isEmployee: 'true',
      });
      setEmployeeOptions(
        result.items.map(item => ({
          value: item.id,
          label:
            item.displayName ||
            [item.firstName, item.lastName].filter(Boolean).join(' ') ||
            item.username ||
            item.id,
        })),
      );
    } catch {
      setEmployeeOptions([]);
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  useEffect(() => {
    if (!createOpen || !canCreate) {
      return;
    }
    void loadEmployees();
  }, [canCreate, createOpen, loadEmployees]);

  const onYearChange = useCallback(
    (year: number) => {
      setFilters(prev => {
        const next = { ...prev, year: Math.max(1, year) };
        syncRoute(next);
        return next;
      });
    },
    [syncRoute],
  );

  const onMonthChange = useCallback(
    (month: number) => {
      setFilters(prev => {
        const next = {
          ...prev,
          month: Math.min(12, Math.max(1, month)),
        };
        syncRoute(next);
        return next;
      });
    },
    [syncRoute],
  );

  const onOpenCreate = useCallback(() => {
    if (!canCreate) {
      return;
    }
    setCreateDraft(emptyCreateDraft());
    setError('');
    setCreateOpen(true);
  }, [canCreate]);

  const onCloseCreate = useCallback(() => {
    if (mutating) {
      return;
    }
    setCreateOpen(false);
    setCreateDraft(emptyCreateDraft());
  }, [mutating]);

  const onCreateDraftChange = useCallback(
    (patch: Partial<KolamBonusCreateDraft>) => {
      setCreateDraft(prev => ({ ...prev, ...patch }));
    },
    [],
  );

  const onCreateBonus = useCallback(async () => {
    if (!canCreate || mutating) {
      return;
    }
    const userId = createDraft.userId.trim();
    const amount = Number(createDraft.amount);
    if (!userId || !Number.isFinite(amount) || amount <= 0) {
      setError('Pilih karyawan dan isi jumlah bonus');
      return;
    }
    setMutating(true);
    setError('');
    try {
      const reason = createDraft.reason.trim();
      await createKolamBonus({
        userId,
        amount,
        ...(reason ? { reason } : {}),
      });
      setCreateOpen(false);
      setCreateDraft(emptyCreateDraft());
      await refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal membuat bonus',
      );
    } finally {
      setMutating(false);
    }
  }, [canCreate, createDraft, mutating, refresh]);

  return {
    filters,
    rows,
    loading,
    error,
    mutating,
    canView,
    canCreate,
    createOpen,
    createDraft,
    employeeOptions,
    loadingEmployees,
    onYearChange,
    onMonthChange,
    onRefresh: refresh,
    onOpenCreate,
    onCloseCreate,
    onCreateDraftChange,
    onCreateBonus,
  };
}
