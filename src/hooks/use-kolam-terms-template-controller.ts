import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildKolamTermsTemplateCreateBody,
  buildKolamTermsTemplateDetailRoute,
  buildKolamTermsTemplateEditRoute,
  buildKolamTermsTemplateUpdateBody,
  createEmptyKolamTermsTemplateFormState,
  createKolamTermsTemplateFormState,
  getKolamTermsTemplateRouteId,
  getKolamTermsTemplateSurfaceMode,
  isKolamTermsTemplateFormEditable,
  isKolamTermsTemplateRoute,
  validateKolamTermsTemplateForm,
  type KolamTermsTemplate,
  type KolamTermsTemplateFormState,
  type KolamTermsTemplateStatus,
  type KolamTermsTemplateSurfaceMode,
} from '../domain/kolam-terms-template';
import { getErrorMessage as getApiErrorMessage } from '../lib/api-error';
import {
  archiveKolamTermsTemplate,
  createKolamTermsTemplate,
  getKolamTermsTemplate,
  getKolamTermsTemplates,
  setKolamTermsTemplateStatus,
  updateKolamTermsTemplate,
} from '../services/kolam-terms-template-api';

export type KolamTermsTemplateDataSource = 'idle' | 'live' | 'error';

export interface KolamTermsTemplateController {
  dataSource: KolamTermsTemplateDataSource;
  error: string | null;
  form: KolamTermsTemplateFormState;
  isFormEditable: boolean;
  items: KolamTermsTemplate[];
  loading: boolean;
  mode: KolamTermsTemplateSurfaceMode;
  mutating: boolean;
  page: number;
  pageSize: number;
  search: string;
  selected: KolamTermsTemplate | null;
  statusFilter: '' | KolamTermsTemplateStatus;
  statusMessage: string | null;
  total: number;
  totalPages: number;
  onArchive: (item: KolamTermsTemplate) => Promise<boolean>;
  onBackToList: () => void;
  onChangeForm: (patch: Partial<KolamTermsTemplateFormState>) => void;
  onCreateNew: () => void;
  onEdit: () => void;
  onPublish: (item: KolamTermsTemplate) => Promise<boolean>;
  onRefresh: () => Promise<void>;
  onSave: () => Promise<string | null>;
  onSearchChange: (value: string) => void;
  onSelectItem: (item: KolamTermsTemplate) => void;
  onSetDraft: (item: KolamTermsTemplate) => Promise<boolean>;
  onSetPage: (page: number) => void;
  onSetPageSize: (pageSize: number) => void;
  onSetStatusFilter: (status: '' | KolamTermsTemplateStatus) => void;
}

export function useKolamTermsTemplateController(
  route: string,
  onRouteChange?: (route: string) => void,
): KolamTermsTemplateController {
  const mode = getKolamTermsTemplateSurfaceMode(route);
  const routeId = getKolamTermsTemplateRouteId(route);

  const [items, setItems] = useState<KolamTermsTemplate[]>([]);
  const [selected, setSelected] = useState<KolamTermsTemplate | null>(null);
  const [form, setForm] = useState<KolamTermsTemplateFormState>(() =>
    createEmptyKolamTermsTemplateFormState(),
  );
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamTermsTemplateDataSource>('idle');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | KolamTermsTemplateStatus>(
    '',
  );
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const isFormEditable = isKolamTermsTemplateFormEditable(selected, mode);

  const refreshList = useCallback(async () => {
    if (!isKolamTermsTemplateRoute(route)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const live = await getKolamTermsTemplates({
        page,
        limit: pageSize,
        q: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setItems(live.items);
      setTotal(live.total);
      setTotalPages(live.totalPages);
      setDataSource('live');
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, route, search, statusFilter]);

  const refreshDetail = useCallback(async () => {
    if (!routeId) {
      setSelected(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const live = await getKolamTermsTemplate(routeId);
      setSelected(live);
      setForm(createKolamTermsTemplateFormState(live));
      setDataSource('live');
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
      setDataSource('error');
      setSelected(null);
    } finally {
      setLoading(false);
    }
  }, [routeId]);

  useEffect(() => {
    if (mode === 'list') {
      void refreshList();
      return;
    }
    if (mode === 'new') {
      setSelected(null);
      setForm(createEmptyKolamTermsTemplateFormState());
      setError(null);
      setStatusMessage(null);
      return;
    }
    if (mode === 'detail' || mode === 'edit') {
      void refreshDetail();
    }
  }, [mode, refreshDetail, refreshList]);

  const onRefresh = useCallback(async () => {
    if (mode === 'list') {
      await refreshList();
      return;
    }
    if (mode === 'detail' || mode === 'edit') {
      await refreshDetail();
    }
  }, [mode, refreshDetail, refreshList]);

  const applyLocalStatus = useCallback((updated: KolamTermsTemplate) => {
    setItems(prev =>
      prev.map(item => (item.id === updated.id ? updated : item)),
    );
    setSelected(prev => (prev?.id === updated.id ? updated : prev));
    setForm(createKolamTermsTemplateFormState(updated));
  }, []);

  const onPublish = useCallback(
    async (item: KolamTermsTemplate) => {
      setMutating(true);
      setError(null);
      setStatusMessage(null);
      try {
        const updated = await setKolamTermsTemplateStatus(item.id, 'published');
        applyLocalStatus(updated);
        setStatusMessage('Template diterbitkan.');
        if (mode === 'list') {
          await refreshList();
        }
        return true;
      } catch (err) {
        setError(getApiErrorMessage(err));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [applyLocalStatus, mode, refreshList],
  );

  const onSetDraft = useCallback(
    async (item: KolamTermsTemplate) => {
      setMutating(true);
      setError(null);
      setStatusMessage(null);
      try {
        const updated = await setKolamTermsTemplateStatus(item.id, 'draft');
        applyLocalStatus(updated);
        setStatusMessage('Template dibuka sebagai draf.');
        if (mode === 'list') {
          await refreshList();
        }
        return true;
      } catch (err) {
        setError(getApiErrorMessage(err));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [applyLocalStatus, mode, refreshList],
  );

  const onArchive = useCallback(
    async (item: KolamTermsTemplate) => {
      setMutating(true);
      setError(null);
      setStatusMessage(null);
      try {
        const updated = await archiveKolamTermsTemplate(item.id);
        applyLocalStatus(updated);
        setStatusMessage('Template diarsipkan.');
        if (mode === 'list') {
          await refreshList();
        }
        return true;
      } catch (err) {
        setError(getApiErrorMessage(err));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [applyLocalStatus, mode, refreshList],
  );

  const onChangeForm = useCallback(
    (patch: Partial<KolamTermsTemplateFormState>) => {
      setForm(prev => ({ ...prev, ...patch }));
    },
    [],
  );

  const onSave = useCallback(async (): Promise<string | null> => {
    const validation = validateKolamTermsTemplateForm(form);
    if (!validation.isValid) {
      setError(validation.errors[0] ?? 'Form tidak valid.');
      return null;
    }
    if (mode !== 'new' && !isFormEditable) {
      setError('Template diarsipkan. Buka draf atau terbitkan dulu sebelum ubah.');
      return null;
    }

    setMutating(true);
    setError(null);
    setStatusMessage(null);
    try {
      if (mode === 'new') {
        const created = await createKolamTermsTemplate(
          buildKolamTermsTemplateCreateBody(form),
        );
        setStatusMessage('Template berhasil dibuat.');
        onRouteChange?.(buildKolamTermsTemplateDetailRoute(created.id));
        return created.id;
      }

      const id = selected?.id || routeId;
      if (!id) {
        setError('Template tidak ditemukan.');
        return null;
      }
      const updated = await updateKolamTermsTemplate(
        id,
        buildKolamTermsTemplateUpdateBody(form),
      );
      applyLocalStatus(updated);
      setStatusMessage('Template berhasil disimpan.');
      if (mode === 'edit') {
        onRouteChange?.(buildKolamTermsTemplateDetailRoute(updated.id));
      }
      return updated.id;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return null;
    } finally {
      setMutating(false);
    }
  }, [
    applyLocalStatus,
    form,
    isFormEditable,
    mode,
    onRouteChange,
    routeId,
    selected?.id,
  ]);

  const onSelectItem = useCallback(
    (item: KolamTermsTemplate) => {
      onRouteChange?.(buildKolamTermsTemplateDetailRoute(item.id));
    },
    [onRouteChange],
  );

  const onBackToList = useCallback(() => {
    onRouteChange?.('/terms-templates');
  }, [onRouteChange]);

  const onCreateNew = useCallback(() => {
    onRouteChange?.('/terms-templates/new');
  }, [onRouteChange]);

  const handleEdit = useCallback(() => {
    const id = selected?.id || routeId;
    if (!id) {
      return;
    }
    onRouteChange?.(buildKolamTermsTemplateEditRoute(id));
  }, [onRouteChange, routeId, selected?.id]);

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const onSetStatusFilter = useCallback(
    (status: '' | KolamTermsTemplateStatus) => {
      setStatusFilter(status);
      setPage(1);
    },
    [],
  );

  const onSetPage = useCallback((next: number) => {
    setPage(Math.max(1, next));
  }, []);

  const onSetPageSize = useCallback((next: number) => {
    setPageSize(Math.max(1, next));
    setPage(1);
  }, []);

  return useMemo(
    () => ({
      dataSource,
      error,
      form,
      isFormEditable,
      items,
      loading,
      mode,
      mutating,
      page,
      pageSize,
      search,
      selected,
      statusFilter,
      statusMessage,
      total,
      totalPages,
      onArchive,
      onBackToList,
      onChangeForm,
      onCreateNew,
      onEdit: handleEdit,
      onPublish,
      onRefresh,
      onSave,
      onSearchChange,
      onSelectItem,
      onSetDraft,
      onSetPage,
      onSetPageSize,
      onSetStatusFilter,
    }),
    [
      dataSource,
      error,
      form,
      handleEdit,
      isFormEditable,
      items,
      loading,
      mode,
      mutating,
      page,
      pageSize,
      search,
      selected,
      statusFilter,
      statusMessage,
      total,
      totalPages,
      onArchive,
      onBackToList,
      onChangeForm,
      onCreateNew,
      onPublish,
      onRefresh,
      onSave,
      onSearchChange,
      onSelectItem,
      onSetDraft,
      onSetPage,
      onSetPageSize,
      onSetStatusFilter,
    ],
  );
}
