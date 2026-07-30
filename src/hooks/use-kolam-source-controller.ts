import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createEmptyKolamSourceFormState,
  createKolamSourceFormState,
  getKolamSourceIdFromRoute,
  getKolamSourceRouteMode,
  isKolamSourceRoute,
  validateKolamSourceForm,
  type KolamSource,
  type KolamSourceFormState,
} from '../domain/kolam-source';
import type { KolamWalletOption } from '../domain/kolam-wallet-option';
import type { KolamUserListItem } from '../domain/kolam-user';
import {
  createKolamSource,
  deleteKolamSource,
  deleteKolamSourceLogo,
  getKolamSource,
  getKolamSources,
  patchKolamSource,
  updateKolamSource,
  uploadKolamSourceLogo,
} from '../services/kolam-source-api';
import { getKolamUserList } from '../services/kolam-user-api';
import { getKolamWalletOptionsPaginated } from '../services/kolam-wallet-option-api';
import { getErrorMessage as getApiErrorMessage } from '../lib/api-error';

export type KolamSourceSurfaceMode = 'list' | 'detail' | 'edit' | 'new';
export type KolamSourceDataSource = 'idle' | 'cache' | 'live' | 'error';

export interface KolamSourceController {
  dataSource: KolamSourceDataSource;
  eligibleUsers: KolamUserListItem[];
  error: string | null;
  form: KolamSourceFormState;
  isEditable: boolean;
  loading: boolean;
  mode: KolamSourceSurfaceMode;
  page: number;
  pageSize: number;
  saving: boolean;
  search: string;
  selectedSource: KolamSource | null;
  sources: KolamSource[];
  total: number;
  totalPages: number;
  wallets: KolamWalletOption[];
  onBackToList: () => void;
  onChangeForm: (patch: Partial<KolamSourceFormState>) => void;
  onCreateNew: () => void;
  onDeleteLogo: () => Promise<boolean>;
  onDeleteSource: (source: KolamSource) => Promise<boolean>;
  onEdit: () => void;
  onRefresh: () => Promise<void>;
  onSave: () => Promise<string | null>;
  onSearchChange: (value: string) => void;
  onSelectSource: (source: KolamSource) => Promise<void>;
  onSetPage: (page: number) => void;
  onSetPageSize: (pageSize: number) => void;
  onToggleActive: (source: KolamSource, nextActive: boolean) => Promise<boolean>;
  onUploadLogo: (localUri: string) => Promise<boolean>;
}

export function useKolamSourceController(route: string): KolamSourceController {
  const initialMode = getKolamSourceRouteMode(route);
  const [sources, setSources] = useState<KolamSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<KolamSource | null>(null);
  const [mode, setMode] = useState<KolamSourceSurfaceMode>(initialMode);
  const [form, setForm] = useState<KolamSourceFormState>(() =>
    createEmptyKolamSourceFormState(),
  );
  const [wallets, setWallets] = useState<KolamWalletOption[]>([]);
  const [eligibleUsers, setEligibleUsers] = useState<KolamUserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<KolamSourceDataSource>('idle');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const refresh = useCallback(async () => {
    if (!isKolamSourceRoute(route)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const live = await getKolamSources({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
      });
      setSources(live.items);
      setTotal(live.total);
      setTotalPages(live.totalPages);
      setDataSource('live');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, route, search]);

  const loadFormOptions = useCallback(async () => {
    try {
      const [walletRows, userResult] = await Promise.all([
        getKolamWalletOptionsPaginated({ page: 1, limit: 200 }),
        getKolamUserList({
          commissionEligible: 'true',
          limit: 200,
          page: 1,
        }),
      ]);
      setWallets(walletRows);
      setEligibleUsers(userResult.items);
    } catch {
      setWallets([]);
      setEligibleUsers([]);
    }
  }, []);

  useEffect(() => {
    setMode(initialMode);
    if (initialMode === 'new') {
      setSelectedSource(null);
      setForm(createEmptyKolamSourceFormState());
      void loadFormOptions();
    }
  }, [initialMode, loadFormOptions]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onSelectSource = useCallback(
    async (source: KolamSource) => {
      setMode('detail');
      setSelectedSource(source);
      setForm(createKolamSourceFormState(source));
      setError(null);

      try {
        const live = await getKolamSource(source.id);
        setSelectedSource(live);
        setForm(createKolamSourceFormState(live));
        setDataSource('live');
      } catch (detailError) {
        setError(getErrorMessage(detailError));
      }
    },
    [],
  );

  useEffect(() => {
    const sourceId = getKolamSourceIdFromRoute(route);
    if (!sourceId || mode === 'new') {
      return;
    }

    if (selectedSource?.id === sourceId) {
      if (mode === 'edit') {
        void loadFormOptions();
      }
      return;
    }

    let active = true;
    void (async () => {
      const fromList = sources.find(item => item.id === sourceId);
      if (fromList) {
        if (active) {
          await onSelectSource(fromList);
          if (getKolamSourceRouteMode(route) === 'edit') {
            setMode('edit');
            void loadFormOptions();
          }
        }
        return;
      }

      try {
        const live = await getKolamSource(sourceId);
        if (!active) {
          return;
        }
        setSelectedSource(live);
        setForm(createKolamSourceFormState(live));
        setMode(getKolamSourceRouteMode(route) === 'edit' ? 'edit' : 'detail');
        setDataSource('live');
        if (getKolamSourceRouteMode(route) === 'edit') {
          void loadFormOptions();
        }
      } catch (detailError) {
        if (active) {
          setError(getErrorMessage(detailError));
          setDataSource('error');
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [loadFormOptions, mode, onSelectSource, route, selectedSource?.id, sources]);

  const onBackToList = useCallback(() => {
    setMode('list');
    setSelectedSource(null);
    setForm(createEmptyKolamSourceFormState());
    setError(null);
  }, []);

  const onCreateNew = useCallback(() => {
    setMode('new');
    setSelectedSource(null);
    setForm(createEmptyKolamSourceFormState());
    setError(null);
    void loadFormOptions();
  }, [loadFormOptions]);

  const onEdit = useCallback(() => {
    if (selectedSource) {
      setMode('edit');
      void loadFormOptions();
    }
  }, [loadFormOptions, selectedSource]);

  const onChangeForm = useCallback((patch: Partial<KolamSourceFormState>) => {
    setForm(current => {
      const next = { ...current, ...patch };
      if (patch.isMarketplace === true) {
        next.commissionRecipientMode = 'equal_all_employees';
        next.defaultCommissionRecipientIds = [];
      }
      return next;
    });
  }, []);

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const onSetPage = useCallback((nextPage: number) => {
    setPage(Math.max(1, nextPage));
  }, []);

  const onSetPageSize = useCallback((nextSize: number) => {
    setPageSize(Math.max(1, nextSize));
    setPage(1);
  }, []);

  const onToggleActive = useCallback(
    async (source: KolamSource, nextActive: boolean) => {
      setSaving(true);
      setError(null);
      try {
        const updated = await patchKolamSource(source.id, {
          isActive: nextActive,
        });
        setSources(current =>
          current.map(item => (item.id === updated.id ? updated : item)),
        );
        if (selectedSource?.id === updated.id) {
          setSelectedSource(updated);
          setForm(createKolamSourceFormState(updated));
        }
        return true;
      } catch (toggleError) {
        setError(getErrorMessage(toggleError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [selectedSource?.id],
  );

  const onDeleteSource = useCallback(
    async (source: KolamSource) => {
      setSaving(true);
      setError(null);
      try {
        await deleteKolamSource(source.id);
        setSources(current => current.filter(item => item.id !== source.id));
        setTotal(current => Math.max(0, current - 1));
        setMode('list');
        setSelectedSource(null);
        setForm(createEmptyKolamSourceFormState());
        return true;
      } catch (deleteError) {
        setError(getErrorMessage(deleteError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const onSave = useCallback(async () => {
    const validationError = validateKolamSourceForm(form);
    if (validationError) {
      setError(validationError);
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      const saved =
        mode === 'new'
          ? await createKolamSource(form)
          : await updateKolamSource(
              selectedSource?.id ?? form.id ?? '',
              form,
            );

      let finalSource = saved;
      if (form.pendingLogoLocalUri) {
        finalSource = await uploadKolamSourceLogo(
          saved.id,
          form.pendingLogoLocalUri,
        );
      }

      setSelectedSource(finalSource);
      setForm(createKolamSourceFormState(finalSource));
      setSources(current => upsertSource(current, finalSource));
      setMode('detail');
      setDataSource('live');
      return finalSource.id;
    } catch (saveError) {
      setError(getErrorMessage(saveError));
      return null;
    } finally {
      setSaving(false);
    }
  }, [form, mode, selectedSource?.id]);

  const onUploadLogo = useCallback(
    async (localUri: string) => {
      if (mode === 'new' || !selectedSource) {
        onChangeForm({ pendingLogoLocalUri: localUri });
        return true;
      }

      setSaving(true);
      setError(null);
      try {
        const updated = await uploadKolamSourceLogo(selectedSource.id, localUri);
        setSelectedSource(updated);
        setForm(createKolamSourceFormState(updated));
        setSources(current => upsertSource(current, updated));
        return true;
      } catch (uploadError) {
        setError(getErrorMessage(uploadError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [mode, onChangeForm, selectedSource],
  );

  const onDeleteLogo = useCallback(async () => {
    if (mode === 'new') {
      onChangeForm({ pendingLogoLocalUri: null });
      return true;
    }
    if (!selectedSource) {
      return false;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await deleteKolamSourceLogo(selectedSource.id);
      setSelectedSource(updated);
      setForm(createKolamSourceFormState(updated));
      setSources(current => upsertSource(current, updated));
      return true;
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
      return false;
    } finally {
      setSaving(false);
    }
  }, [mode, onChangeForm, selectedSource]);

  const isEditable = mode === 'edit' || mode === 'new';

  return useMemo(
    () => ({
      dataSource,
      eligibleUsers,
      error,
      form,
      isEditable,
      loading,
      mode,
      page,
      pageSize,
      saving,
      search,
      selectedSource,
      sources,
      total,
      totalPages,
      wallets,
      onBackToList,
      onChangeForm,
      onCreateNew,
      onDeleteLogo,
      onDeleteSource,
      onEdit,
      onRefresh: refresh,
      onSave,
      onSearchChange,
      onSelectSource,
      onSetPage,
      onSetPageSize,
      onToggleActive,
      onUploadLogo,
    }),
    [
      dataSource,
      eligibleUsers,
      error,
      form,
      isEditable,
      loading,
      mode,
      onBackToList,
      onChangeForm,
      onCreateNew,
      onDeleteLogo,
      onDeleteSource,
      onEdit,
      onSave,
      onSearchChange,
      onSelectSource,
      onSetPage,
      onSetPageSize,
      onToggleActive,
      onUploadLogo,
      page,
      pageSize,
      refresh,
      saving,
      search,
      selectedSource,
      sources,
      total,
      totalPages,
      wallets,
    ],
  );
}

function upsertSource(list: KolamSource[], item: KolamSource) {
  const index = list.findIndex(row => row.id === item.id);
  if (index < 0) {
    return [item, ...list];
  }
  const next = list.slice();
  next[index] = item;
  return next;
}

function getErrorMessage(error: unknown) {
  const message = getApiErrorMessage(error).trim();
  return message || 'Terjadi kesalahan pada sumber penjualan.';
}
