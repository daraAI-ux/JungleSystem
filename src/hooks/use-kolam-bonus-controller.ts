import { useCallback, useEffect, useMemo, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  buildBonusListRoute,
  buildKolamBonusCreateRoute,
  createInitialBonusListFilters,
  getKolamBonusSurfaceMode,
  KOLAM_BONUS_ROOT,
  type KolamBonusListFilters,
  type KolamBonusListRow,
  type KolamBonusSurfaceMode,
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
  mode: KolamBonusSurfaceMode;
  filters: KolamBonusListFilters;
  rows: KolamBonusListRow[];
  loading: boolean;
  error: string;
  mutating: boolean;
  canView: boolean;
  canCreate: boolean;
  createDraft: KolamBonusCreateDraft;
  employeeOptions: KolamBonusEmployeeOption[];
  loadingEmployees: boolean;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onRefresh: () => Promise<void>;
  onOpenCreate: () => void;
  onCancelCreate: () => void;
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
  const mode = getKolamBonusSurfaceMode(route);
  const [filters, setFilters] = useState<KolamBonusListFilters>(() =>
    createInitialBonusListFilters(route),
  );
  const [rows, setRows] = useState<KolamBonusListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState('');
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
    if (mode === 'list') {
      setFilters(createInitialBonusListFilters(route));
    }
  }, [mode, route]);

  useEffect(() => {
    if (mode !== 'create') {
      return;
    }
    setCreateDraft(emptyCreateDraft());
    setError('');
  }, [mode]);

  const syncRoute = useCallback(
    (next: KolamBonusListFilters) => {
      onRouteChange?.(buildBonusListRoute(next));
    },
    [onRouteChange],
  );

  const refresh = useCallback(async () => {
    if (mode !== 'list') {
      return;
    }
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
  }, [canView, filters, mode]);

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
    if (mode !== 'create' || !canCreate) {
      return;
    }
    void loadEmployees();
  }, [canCreate, loadEmployees, mode]);

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
    onRouteChange?.(buildKolamBonusCreateRoute());
  }, [canCreate, onRouteChange]);

  const onCancelCreate = useCallback(() => {
    if (mutating) {
      return;
    }
    setCreateDraft(emptyCreateDraft());
    setError('');
    onRouteChange?.(KOLAM_BONUS_ROOT);
  }, [mutating, onRouteChange]);

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
      setCreateDraft(emptyCreateDraft());
      onRouteChange?.(KOLAM_BONUS_ROOT);
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
  }, [canCreate, createDraft, mutating, onRouteChange]);

  return {
    mode,
    filters,
    rows,
    loading,
    error,
    mutating,
    canView,
    canCreate,
    createDraft,
    employeeOptions,
    loadingEmployees,
    onYearChange,
    onMonthChange,
    onRefresh: refresh,
    onOpenCreate,
    onCancelCreate,
    onCreateDraftChange,
    onCreateBonus,
  };
}
