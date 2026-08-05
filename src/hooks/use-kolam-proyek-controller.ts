import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildKolamProyekDetailRoute,
  buildKolamProyekDetailRouteForItem,
  buildKolamProyekEditRoute,
  buildKolamProyekListRoute,
  buildKolamProyekNewRoute,
  buildKolamProyekQuotationPayload,
  canCancelKolamProyekQuotation,
  canDeleteKolamProyekQuotation,
  canEditKolamProyekQuotation,
  canResendKolamProyekQuotation,
  canSendKolamProyekQuotation,
  createEmptyKolamProyekQuotationForm,
  createKolamProyekQuotationFormFromDetail,
  createKolamProyekQuotationFormItem,
  getKolamProyekRouteRef,
  getKolamProyekSurfaceMode,
  isKolamProyekRoute,
  validateKolamProyekQuotationForm,
  type KolamProyekDetail,
  type KolamProyekLifecycleStatus,
  type KolamProyekListItem,
  type KolamProyekQuotationFormState,
  type KolamProyekSurfaceMode,
} from '../domain/kolam-proyek';
import { getErrorMessage as getApiErrorMessage } from '../lib/api-error';
import { getKolamCustomerList } from '../services/kolam-customer-api';
import {
  cancelKolamProyek,
  createKolamProyekQuotation,
  deleteKolamProyek,
  getKolamProyek,
  getKolamProyekList,
  resendKolamProyekQuotation,
  sendKolamProyekQuotation,
  updateKolamProyekQuotation,
} from '../services/kolam-proyek-api';
import { getKolamTermsTemplates } from '../services/kolam-terms-template-api';
import { getKolamUserList } from '../services/kolam-user-api';

const OPTION_LIMIT = 500;

export type KolamProyekDataSource = 'idle' | 'live' | 'error';

export type KolamProyekPickerOption = {
  id: string;
  label: string;
  sublabel?: string;
};

export interface KolamProyekController {
  acting: boolean;
  canCancel: boolean;
  canDelete: boolean;
  canEdit: boolean;
  canResend: boolean;
  canSend: boolean;
  customerOptions: KolamProyekPickerOption[];
  dataSource: KolamProyekDataSource;
  error: string | null;
  form: KolamProyekQuotationFormState;
  items: KolamProyekListItem[];
  lifecycleFilter: '' | KolamProyekLifecycleStatus;
  loading: boolean;
  loadingOptions: boolean;
  mode: KolamProyekSurfaceMode;
  page: number;
  pageSize: number;
  saving: boolean;
  search: string;
  selected: KolamProyekDetail | null;
  staffOptions: KolamProyekPickerOption[];
  statusMessage: string | null;
  termsOptions: KolamProyekPickerOption[];
  total: number;
  totalPages: number;
  onAddFormItem: () => void;
  onBackToList: () => void;
  onCancelProject: (reason: string) => Promise<boolean>;
  onCreateNew: () => void;
  onDeleteDraft: (password: string) => Promise<boolean>;
  onEdit: () => void;
  onFormChange: (patch: Partial<KolamProyekQuotationFormState>) => void;
  onOpenItem: (item: KolamProyekListItem) => void;
  onPatchFormItem: (
    key: string,
    patch: Partial<KolamProyekQuotationFormState['items'][number]>,
  ) => void;
  onRefresh: () => Promise<void>;
  onRemoveFormItem: (key: string) => void;
  onResendQuotation: (resolutionNote?: string) => Promise<boolean>;
  onSaveQuotation: () => Promise<string | null>;
  onSearchChange: (value: string) => void;
  onSendQuotation: () => Promise<boolean>;
  onSetLifecycleFilter: (status: '' | KolamProyekLifecycleStatus) => void;
  onSetPage: (page: number) => void;
  onSetPageSize: (pageSize: number) => void;
}

export function useKolamProyekController(
  route: string,
  onRouteChange?: (route: string) => void,
): KolamProyekController {
  const mode = getKolamProyekSurfaceMode(route);
  const routeRef = getKolamProyekRouteRef(route);

  const [items, setItems] = useState<KolamProyekListItem[]>([]);
  const [selected, setSelected] = useState<KolamProyekDetail | null>(null);
  const [form, setForm] = useState<KolamProyekQuotationFormState>(
    createEmptyKolamProyekQuotationForm,
  );
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<KolamProyekDataSource>('idle');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState('');
  const [lifecycleFilter, setLifecycleFilter] = useState<
    '' | KolamProyekLifecycleStatus
  >('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [customerOptions, setCustomerOptions] = useState<
    KolamProyekPickerOption[]
  >([]);
  const [staffOptions, setStaffOptions] = useState<KolamProyekPickerOption[]>(
    [],
  );
  const [termsOptions, setTermsOptions] = useState<KolamProyekPickerOption[]>(
    [],
  );

  const canEdit = canEditKolamProyekQuotation(selected?.lifecycleStatus);
  const canSend = canSendKolamProyekQuotation(selected?.lifecycleStatus);
  const canResend = canResendKolamProyekQuotation(selected?.lifecycleStatus);
  const canCancel = canCancelKolamProyekQuotation(selected?.lifecycleStatus);
  const canDelete = canDeleteKolamProyekQuotation(selected?.lifecycleStatus);

  const refreshList = useCallback(async () => {
    if (!isKolamProyekRoute(route)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const live = await getKolamProyekList({
        page,
        limit: pageSize,
        lifecycleStatus: lifecycleFilter || undefined,
      });
      const needle = search.trim().toLowerCase();
      const filtered = needle
        ? live.items.filter(item => {
            const haystack = [
              item.quotationNumber,
              item.clientName,
              item.designerName,
              item.id,
            ]
              .join(' ')
              .toLowerCase();
            return haystack.includes(needle);
          })
        : live.items;
      setItems(filtered);
      setTotal(needle ? filtered.length : live.total);
      setTotalPages(needle ? 1 : live.totalPages);
      setDataSource('live');
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [lifecycleFilter, page, pageSize, route, search]);

  const refreshDetail = useCallback(async () => {
    if (!routeRef) {
      setSelected(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const detail = await getKolamProyek(routeRef);
      setSelected(detail);
      if (mode === 'edit') {
        setForm(createKolamProyekQuotationFormFromDetail(detail));
      }
      setDataSource('live');
    } catch (loadError) {
      setSelected(null);
      setError(getApiErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [mode, routeRef]);

  useEffect(() => {
    if (mode === 'list') {
      void refreshList();
      return;
    }
    if (mode === 'detail' || mode === 'edit') {
      void refreshDetail();
      return;
    }
    if (mode === 'new') {
      setSelected(null);
      setForm(createEmptyKolamProyekQuotationForm());
      setError(null);
      setDataSource('idle');
    }
  }, [mode, refreshDetail, refreshList]);

  useEffect(() => {
    if (mode !== 'new' && mode !== 'edit') {
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoadingOptions(true);
      try {
        const [customers, staff, terms] = await Promise.all([
          getKolamCustomerList({ page: 1, limit: OPTION_LIMIT }),
          getKolamUserList({
            page: 1,
            limit: OPTION_LIMIT,
            isEmployee: 'true',
          }),
          getKolamTermsTemplates({
            page: 1,
            limit: 50,
            status: 'published',
          }),
        ]);
        if (cancelled) {
          return;
        }
        setCustomerOptions(
          customers.items.map(item => ({
            id: item.id,
            label: item.name || item.email || item.id,
            sublabel: item.email || item.phone || undefined,
          })),
        );
        setStaffOptions(
          staff.items.map(item => ({
            id: item.id,
            label:
              item.displayName ||
              [item.firstName, item.lastName].filter(Boolean).join(' ') ||
              item.username ||
              item.id,
            sublabel: item.email || item.roleLabel || undefined,
          })),
        );
        setTermsOptions(
          terms.items.map(item => ({
            id: item.id,
            label: `${item.title} (v${item.version})`,
          })),
        );
      } catch {
        if (!cancelled) {
          setCustomerOptions([]);
          setStaffOptions([]);
          setTermsOptions([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const onRefresh = useCallback(async () => {
    setStatusMessage(null);
    if (mode === 'list') {
      await refreshList();
      return;
    }
    if (mode === 'detail' || mode === 'edit') {
      await refreshDetail();
    }
  }, [mode, refreshDetail, refreshList]);

  const onBackToList = useCallback(() => {
    setStatusMessage(null);
    onRouteChange?.(buildKolamProyekListRoute());
  }, [onRouteChange]);

  const onCreateNew = useCallback(() => {
    setStatusMessage(null);
    setForm(createEmptyKolamProyekQuotationForm());
    onRouteChange?.(buildKolamProyekNewRoute());
  }, [onRouteChange]);

  const onEdit = useCallback(() => {
    if (!selected || !canEditKolamProyekQuotation(selected.lifecycleStatus)) {
      return;
    }
    setStatusMessage(null);
    setForm(createKolamProyekQuotationFormFromDetail(selected));
    onRouteChange?.(
      buildKolamProyekEditRoute(
        selected.quotationNumber || selected.id,
        selected.id,
      ),
    );
  }, [onRouteChange, selected]);

  const onOpenItem = useCallback(
    (item: KolamProyekListItem) => {
      setStatusMessage(null);
      onRouteChange?.(buildKolamProyekDetailRouteForItem(item));
    },
    [onRouteChange],
  );

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const onSetLifecycleFilter = useCallback(
    (status: '' | KolamProyekLifecycleStatus) => {
      setLifecycleFilter(status);
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

  const onFormChange = useCallback(
    (patch: Partial<KolamProyekQuotationFormState>) => {
      setForm(prev => {
        const next = { ...prev, ...patch };
        if (
          patch.clientUserId &&
          patch.clientUserId === next.designerUserId
        ) {
          next.designerUserId = '';
          next.designerName = '';
        }
        return next;
      });
    },
    [],
  );

  const onAddFormItem = useCallback(() => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, createKolamProyekQuotationFormItem()],
    }));
  }, []);

  const onPatchFormItem = useCallback(
    (
      key: string,
      patch: Partial<KolamProyekQuotationFormState['items'][number]>,
    ) => {
      setForm(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.key === key ? { ...item, ...patch } : item,
        ),
      }));
    },
    [],
  );

  const onRemoveFormItem = useCallback((key: string) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.key !== key),
    }));
  }, []);

  const onSaveQuotation = useCallback(async () => {
    const validationError = validateKolamProyekQuotationForm(form);
    if (validationError) {
      setError(validationError);
      return null;
    }
    setSaving(true);
    setError(null);
    setStatusMessage(null);
    try {
      const body = buildKolamProyekQuotationPayload(form);
      const saved =
        mode === 'edit' && selected
          ? await updateKolamProyekQuotation(selected.id, body)
          : await createKolamProyekQuotation(body);
      setSelected(saved);
      setStatusMessage(
        mode === 'edit'
          ? 'Surat penawaran disimpan.'
          : 'Surat penawaran dibuat. Kirim dari halaman detail.',
      );
      const nextRoute = buildKolamProyekDetailRoute(
        saved.quotationNumber || saved.id,
      );
      onRouteChange?.(nextRoute);
      return nextRoute;
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
      return null;
    } finally {
      setSaving(false);
    }
  }, [form, mode, onRouteChange, selected]);

  const onSendQuotation = useCallback(async () => {
    if (!selected || !canSendKolamProyekQuotation(selected.lifecycleStatus)) {
      return false;
    }
    setActing(true);
    setError(null);
    setStatusMessage(null);
    try {
      const updated = await sendKolamProyekQuotation(selected.id);
      setSelected(updated);
      setStatusMessage('Surat penawaran terkirim ke klien.');
      const nextRef = updated.quotationNumber || updated.id;
      if (nextRef !== routeRef) {
        onRouteChange?.(buildKolamProyekDetailRoute(nextRef));
      }
      return true;
    } catch (sendError) {
      setError(getApiErrorMessage(sendError));
      return false;
    } finally {
      setActing(false);
    }
  }, [onRouteChange, routeRef, selected]);

  const onResendQuotation = useCallback(
    async (resolutionNote?: string) => {
      if (
        !selected ||
        !canResendKolamProyekQuotation(selected.lifecycleStatus)
      ) {
        return false;
      }
      setActing(true);
      setError(null);
      setStatusMessage(null);
      try {
        const updated = await resendKolamProyekQuotation(
          selected.id,
          resolutionNote,
        );
        setSelected(updated);
        setStatusMessage('Surat penawaran dikirim ulang.');
        const nextRef = updated.quotationNumber || updated.id;
        if (nextRef !== routeRef) {
          onRouteChange?.(buildKolamProyekDetailRoute(nextRef));
        }
        return true;
      } catch (resendError) {
        setError(getApiErrorMessage(resendError));
        return false;
      } finally {
        setActing(false);
      }
    },
    [onRouteChange, routeRef, selected],
  );

  const onCancelProject = useCallback(
    async (reason: string) => {
      if (
        !selected ||
        !canCancelKolamProyekQuotation(selected.lifecycleStatus)
      ) {
        return false;
      }
      const trimmed = reason.trim();
      if (trimmed.length < 3) {
        setError('Alasan pembatalan minimal 3 karakter.');
        return false;
      }
      setActing(true);
      setError(null);
      setStatusMessage(null);
      try {
        const updated = await cancelKolamProyek(selected.id, trimmed);
        setSelected(updated);
        setStatusMessage('Proyek dibatalkan.');
        return true;
      } catch (cancelError) {
        setError(getApiErrorMessage(cancelError));
        return false;
      } finally {
        setActing(false);
      }
    },
    [selected],
  );

  const onDeleteDraft = useCallback(
    async (password: string) => {
      if (
        !selected ||
        !canDeleteKolamProyekQuotation(selected.lifecycleStatus)
      ) {
        return false;
      }
      if (!password.trim()) {
        setError('Password wajib untuk menghapus draft.');
        return false;
      }
      setActing(true);
      setError(null);
      setStatusMessage(null);
      try {
        await deleteKolamProyek(selected.id, password.trim());
        setSelected(null);
        setStatusMessage('Draft proyek dihapus.');
        onRouteChange?.(buildKolamProyekListRoute());
        return true;
      } catch (deleteError) {
        setError(getApiErrorMessage(deleteError));
        return false;
      } finally {
        setActing(false);
      }
    },
    [onRouteChange, selected],
  );

  const mergedCustomerOptions = useMemo(() => {
    if (!selected?.clientId) {
      return customerOptions;
    }
    if (customerOptions.some(option => option.id === selected.clientId)) {
      return customerOptions;
    }
    return [
      {
        id: selected.clientId,
        label: selected.clientName || selected.clientId,
        sublabel: selected.clientEmail || undefined,
      },
      ...customerOptions,
    ];
  }, [customerOptions, selected]);

  const mergedStaffOptions = useMemo(() => {
    if (!form.designerUserId) {
      return staffOptions;
    }
    if (staffOptions.some(option => option.id === form.designerUserId)) {
      return staffOptions;
    }
    return [
      {
        id: form.designerUserId,
        label: form.designerName || form.designerUserId,
      },
      ...staffOptions,
    ];
  }, [form.designerName, form.designerUserId, staffOptions]);

  const mergedTermsOptions = useMemo(() => {
    if (!form.termsTemplateId) {
      return termsOptions;
    }
    if (termsOptions.some(option => option.id === form.termsTemplateId)) {
      return termsOptions;
    }
    return [
      { id: form.termsTemplateId, label: form.termsTemplateId },
      ...termsOptions,
    ];
  }, [form.termsTemplateId, termsOptions]);

  return useMemo(
    () => ({
      acting,
      canCancel,
      canDelete,
      canEdit,
      canResend,
      canSend,
      customerOptions: mergedCustomerOptions,
      dataSource,
      error,
      form,
      items,
      lifecycleFilter,
      loading,
      loadingOptions,
      mode,
      page,
      pageSize,
      saving,
      search,
      selected,
      staffOptions: mergedStaffOptions,
      statusMessage,
      termsOptions: mergedTermsOptions,
      total,
      totalPages,
      onAddFormItem,
      onBackToList,
      onCancelProject,
      onCreateNew,
      onDeleteDraft,
      onEdit,
      onFormChange,
      onOpenItem,
      onPatchFormItem,
      onRefresh,
      onRemoveFormItem,
      onResendQuotation,
      onSaveQuotation,
      onSearchChange,
      onSendQuotation,
      onSetLifecycleFilter,
      onSetPage,
      onSetPageSize,
    }),
    [
      acting,
      canCancel,
      canDelete,
      canEdit,
      canResend,
      canSend,
      dataSource,
      error,
      form,
      items,
      lifecycleFilter,
      loading,
      loadingOptions,
      mergedCustomerOptions,
      mergedStaffOptions,
      mergedTermsOptions,
      mode,
      onAddFormItem,
      onBackToList,
      onCancelProject,
      onCreateNew,
      onDeleteDraft,
      onEdit,
      onFormChange,
      onOpenItem,
      onPatchFormItem,
      onRefresh,
      onRemoveFormItem,
      onResendQuotation,
      onSaveQuotation,
      onSearchChange,
      onSendQuotation,
      onSetLifecycleFilter,
      onSetPage,
      onSetPageSize,
      page,
      pageSize,
      saving,
      search,
      selected,
      statusMessage,
      total,
      totalPages,
    ],
  );
}
