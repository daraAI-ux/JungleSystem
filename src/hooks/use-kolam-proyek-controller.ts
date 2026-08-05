import { useCallback, useEffect, useMemo, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  buildKolamProyekDetailRoute,
  buildKolamProyekDetailRouteForItem,
  buildKolamProyekEditRoute,
  buildKolamProyekListRoute,
  buildKolamProyekNewRoute,
  buildKolamProyekQuotationPayload,
  canCancelKolamProyekQuotation,
  canCloseKolamProyek,
  canConfirmKolamProyekDp,
  canDeleteKolamProyekQuotation,
  canDownloadKolamProyekInvoice,
  canEditKolamProyekMaterials,
  canEditKolamProyekQuotation,
  canRefundKolamProyek,
  canResendKolamProyekQuotation,
  canSendKolamProyekQuotation,
  canStartKolamProyekWork,
  canSubmitKolamProyekDelivery,
  canSubmitKolamProyekDesign,
  canUpdateKolamProyekProgress,
  createEmptyKolamProyekQuotationForm,
  createKolamProyekQuotationFormFromDetail,
  createKolamProyekQuotationFormItem,
  formatKolamProyekLifecycleLabel,
  getKolamProyekCloseBlockReason,
  getKolamProyekDpRowOutstanding,
  getKolamProyekHappyPathNext,
  getKolamProyekAllowedNext,
  getKolamProyekRouteRef,
  getKolamProyekSectionVisibility,
  getKolamProyekSurfaceMode,
  hasKolamProyekPermission,
  isKolamProyekLinkedTaskDone,
  isKolamProyekRoute,
  validateKolamProyekDpConfirmAmount,
  validateKolamProyekLifecycleNote,
  validateKolamProyekProgressUpdate,
  validateKolamProyekQuotationForm,
  validateKolamProyekSubmitRound,
  type KolamProyekDetail,
  type KolamProyekHppMaterial,
  type KolamProyekLifecycleStatus,
  type KolamProyekListItem,
  type KolamProyekQuotationFormState,
  type KolamProyekSubmitRoundInput,
  type KolamProyekSurfaceMode,
} from '../domain/kolam-proyek';
import {
  isPluginEnabledByConfig,
  type PluginEnabledConfig,
} from '../domain/unified';
import { getErrorMessage as getApiErrorMessage } from '../lib/api-error';
import { getKolamWebSetting } from '../services/kolam-api';
import { getKolamCustomerList } from '../services/kolam-customer-api';
import {
  cancelKolamProyek,
  closeKolamProyek,
  confirmKolamProyekDpReceived,
  createKolamProyekQuotation,
  deleteKolamProyek,
  downloadKolamProyekInvoice,
  downloadKolamProyekKwitansi,
  getKolamProyek,
  getKolamProyekList,
  resendKolamProyekQuotation,
  reverseKolamProyekDpConfirmation,
  sendKolamProyekQuotation,
  submitKolamProyekDelivery,
  submitKolamProyekDesign,
  transitionKolamProyekLifecycle,
  updateKolamProyekHppMaterials,
  updateKolamProyekProgress,
  updateKolamProyekQuotation,
  uploadKolamProyekDpProofs,
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
  canClose: boolean;
  canConfirmDp: boolean;
  canCreate: boolean;
  canDelete: boolean;
  canDownloadInvoice: boolean;
  canDownloadKwitansi: boolean;
  canEdit: boolean;
  canResend: boolean;
  canReverseDp: boolean;
  canSend: boolean;
  canStartWork: boolean;
  canSubmitDelivery: boolean;
  canSubmitDesign: boolean;
  canUpdate: boolean;
  canUpdateProgress: boolean;
  canUploadDpProof: boolean;
  canEditHpp: boolean;
  canRefund: boolean;
  canView: boolean;
  canAdminLifecycle: boolean;
  closeBlockReason: string | null;
  customerOptions: KolamProyekPickerOption[];
  dataSource: KolamProyekDataSource;
  error: string | null;
  form: KolamProyekQuotationFormState;
  items: KolamProyekListItem[];
  lifecycleFilter: '' | KolamProyekLifecycleStatus;
  linkedTaskDone: boolean;
  loading: boolean;
  loadingOptions: boolean;
  mode: KolamProyekSurfaceMode;
  page: number;
  pageSize: number;
  pluginEnabled: boolean;
  saving: boolean;
  search: string;
  selected: KolamProyekDetail | null;
  staffOptions: KolamProyekPickerOption[];
  statusMessage: string | null;
  termsOptions: KolamProyekPickerOption[];
  total: number;
  totalPages: number;
  onAddFormItem: () => void;
  onAdminLifecycleTransition: (
    to: KolamProyekLifecycleStatus,
    note: string,
  ) => Promise<boolean>;
  onBackToList: () => void;
  onCancelProject: (reason: string) => Promise<boolean>;
  onCloseProject: () => Promise<boolean>;
  onConfirmDpReceived: (
    index: number,
    amount: number,
    note?: string,
  ) => Promise<boolean>;
  onCreateNew: () => void;
  onDeleteDraft: (password: string) => Promise<boolean>;
  onDownloadInvoice: () => Promise<boolean>;
  onDownloadKwitansi: (index: number) => Promise<boolean>;
  onEdit: () => void;
  onFormChange: (patch: Partial<KolamProyekQuotationFormState>) => void;
  onOpenItem: (item: KolamProyekListItem) => void;
  onPatchFormItem: (
    key: string,
    patch: Partial<KolamProyekQuotationFormState['items'][number]>,
  ) => void;
  onRefresh: () => Promise<void>;
  onRefundProject: (note: string) => Promise<boolean>;
  onRemoveFormItem: (key: string) => void;
  onResendQuotation: (resolutionNote?: string) => Promise<boolean>;
  onReverseDpConfirmation: (
    index: number,
    confirmationIndex: number,
    reason?: string,
  ) => Promise<boolean>;
  onSaveQuotation: () => Promise<string | null>;
  onSearchChange: (value: string) => void;
  onSendQuotation: () => Promise<boolean>;
  onSetLifecycleFilter: (status: '' | KolamProyekLifecycleStatus) => void;
  onSetPage: (page: number) => void;
  onSetPageSize: (pageSize: number) => void;
  onStartWork: (note: string) => Promise<boolean>;
  onSubmitDelivery: (input: KolamProyekSubmitRoundInput) => Promise<boolean>;
  onSubmitDesign: (input: KolamProyekSubmitRoundInput) => Promise<boolean>;
  onUpdateProgress: (
    progressPercent: number,
    progressNote?: string,
  ) => Promise<boolean>;
  onSaveHppMaterials: (lines: KolamProyekHppMaterial[]) => Promise<boolean>;
  onUploadDpProofs: (
    index: number,
    files: Array<{ uri: string; name?: string; mimeType?: string }>,
    note?: string,
  ) => Promise<boolean>;
}

export function useKolamProyekController(
  route: string,
  onRouteChange?: (route: string) => void,
): KolamProyekController {
  const { authUser } = useKolamAuthContext();
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
  const [pluginEnabled, setPluginEnabled] = useState(true);
  const [customerOptions, setCustomerOptions] = useState<
    KolamProyekPickerOption[]
  >([]);
  const [staffOptions, setStaffOptions] = useState<KolamProyekPickerOption[]>(
    [],
  );
  const [termsOptions, setTermsOptions] = useState<KolamProyekPickerOption[]>(
    [],
  );

  const permissions = authUser?.permissions;
  const roleKey = authUser?.roleKey;
  const canView = hasKolamProyekPermission(permissions, 'view', roleKey);
  const canCreate = hasKolamProyekPermission(permissions, 'create', roleKey);
  const canUpdate = hasKolamProyekPermission(permissions, 'update', roleKey);
  const canDeletePerm = hasKolamProyekPermission(
    permissions,
    'delete',
    roleKey,
  );
  const canUpdateStatus = hasKolamProyekPermission(
    permissions,
    'update_status',
    roleKey,
  );

  const canEdit =
    canUpdate && canEditKolamProyekQuotation(selected?.lifecycleStatus);
  const canSend =
    canUpdate && canSendKolamProyekQuotation(selected?.lifecycleStatus);
  const canResend =
    canUpdate && canResendKolamProyekQuotation(selected?.lifecycleStatus);
  const canCancel =
    canUpdate && canCancelKolamProyekQuotation(selected?.lifecycleStatus);
  const canRefund =
    canUpdate && canRefundKolamProyek(selected?.lifecycleStatus);
  const canDelete =
    canDeletePerm &&
    canDeleteKolamProyekQuotation(selected?.lifecycleStatus);
  const canConfirmDp =
    canUpdateStatus &&
    canConfirmKolamProyekDp(
      selected?.lifecycleStatus,
      selected?.paymentMode,
    );
  const canUploadDpProof =
    canUpdate &&
    canConfirmKolamProyekDp(
      selected?.lifecycleStatus,
      selected?.paymentMode,
    );
  const canReverseDp =
    canUpdateStatus &&
    canConfirmKolamProyekDp(
      selected?.lifecycleStatus,
      selected?.paymentMode,
    );
  const canDownloadKwitansi = canView;
  const canAdminLifecycle =
    canUpdate &&
    getKolamProyekSectionVisibility(
      selected?.lifecycleStatus,
      'lifecycleAdmin',
    ) === 'active' &&
    getKolamProyekHappyPathNext(selected?.lifecycleStatus).length > 0;
  const canEditHpp =
    canUpdate &&
    canEditKolamProyekMaterials(selected?.lifecycleStatus) &&
    getKolamProyekSectionVisibility(
      selected?.lifecycleStatus,
      'hppMaterials',
    ) !== 'hidden';
  const canStartWork =
    canUpdate && canStartKolamProyekWork(selected?.lifecycleStatus);
  const canUpdateProgress =
    canUpdate && canUpdateKolamProyekProgress(selected?.lifecycleStatus);
  const canSubmitDesign =
    canUpdate && canSubmitKolamProyekDesign(selected);
  const canSubmitDelivery =
    canUpdate && canSubmitKolamProyekDelivery(selected);
  const canClose = canUpdate && canCloseKolamProyek(selected);
  const canDownloadInvoice =
    canView && canDownloadKolamProyekInvoice(selected?.lifecycleStatus);
  const closeBlockReason = getKolamProyekCloseBlockReason(selected);
  const linkedTaskDone = isKolamProyekLinkedTaskDone(selected?.linkedTask);

  useEffect(() => {
    let cancelled = false;
    void getKolamWebSetting()
      .then(setting => {
        if (cancelled) {
          return;
        }
        const config = (setting.kolamPlugins ?? null) as PluginEnabledConfig | null;
        setPluginEnabled(
          isPluginEnabledByConfig({ id: 'proyek' }, config),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setPluginEnabled(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshList = useCallback(async () => {
    if (!isKolamProyekRoute(route) || !canView || !pluginEnabled) {
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
  }, [
    canView,
    lifecycleFilter,
    page,
    pageSize,
    pluginEnabled,
    route,
    search,
  ]);

  const refreshDetail = useCallback(async () => {
    if (!routeRef || !canView || !pluginEnabled) {
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
  }, [canView, mode, pluginEnabled, routeRef]);

  useEffect(() => {
    if (!canView || !pluginEnabled) {
      return;
    }
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
  }, [canView, mode, pluginEnabled, refreshDetail, refreshList]);

  useEffect(() => {
    if (
      !canView ||
      !pluginEnabled ||
      (mode !== 'new' && mode !== 'edit')
    ) {
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
  }, [canView, mode, pluginEnabled]);

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
    if (!canCreate) {
      setError('Anda tidak memiliki izin membuat surat penawaran.');
      return;
    }
    setStatusMessage(null);
    setForm(createEmptyKolamProyekQuotationForm());
    onRouteChange?.(buildKolamProyekNewRoute());
  }, [canCreate, onRouteChange]);

  const onEdit = useCallback(() => {
    if (!selected || !canEdit) {
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
  }, [canEdit, onRouteChange, selected]);

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
    if (mode === 'new' && !canCreate) {
      setError('Anda tidak memiliki izin membuat surat penawaran.');
      return null;
    }
    if (mode === 'edit' && !canUpdate) {
      setError('Anda tidak memiliki izin mengubah surat penawaran.');
      return null;
    }
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
  }, [canCreate, canUpdate, form, mode, onRouteChange, selected]);

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

  const onConfirmDpReceived = useCallback(
    async (index: number, amount: number, note?: string) => {
      if (!selected || !canConfirmDp) {
        return false;
      }
      const row = selected.dpSchedule.find(item => item.index === index);
      if (!row || row.paidAt) {
        setError('Baris DP tidak tersedia untuk dikonfirmasi.');
        return false;
      }
      const outstanding = getKolamProyekDpRowOutstanding(row);
      const amountError = validateKolamProyekDpConfirmAmount(amount, outstanding);
      if (amountError) {
        setError(amountError);
        return false;
      }
      setActing(true);
      setError(null);
      setStatusMessage(null);
      try {
        const updated = await confirmKolamProyekDpReceived(selected.id, index, {
          amount,
          note,
        });
        setSelected(updated);
        setStatusMessage(
          updated.lifecycleStatus === 'dp_paid'
            ? 'Dana DP dikonfirmasi. Proyek siap dimulai.'
            : 'Dana DP dikonfirmasi.',
        );
        return true;
      } catch (confirmError) {
        setError(getApiErrorMessage(confirmError));
        return false;
      } finally {
        setActing(false);
      }
    },
    [canConfirmDp, selected],
  );

  const onUploadDpProofs = useCallback(
    async (
      index: number,
      files: Array<{ uri: string; name?: string; mimeType?: string }>,
      note?: string,
    ) => {
      if (!selected || !canUploadDpProof) {
        return false;
      }
      const row = selected.dpSchedule.find(item => item.index === index);
      if (!row || row.paidAt) {
        setError('Baris DP tidak tersedia untuk unggah bukti.');
        return false;
      }
      if (!files.length) {
        setError('Pilih minimal satu file bukti.');
        return false;
      }
      setActing(true);
      setError(null);
      setStatusMessage(null);
      try {
        const updated = await uploadKolamProyekDpProofs(
          selected.id,
          index,
          files,
          note,
        );
        setSelected(updated);
        setStatusMessage(
          `${files.length} bukti pembayaran diunggah. Menunggu konfirmasi finance.`,
        );
        return true;
      } catch (uploadError) {
        setError(getApiErrorMessage(uploadError));
        return false;
      } finally {
        setActing(false);
      }
    },
    [canUploadDpProof, selected],
  );

  const onReverseDpConfirmation = useCallback(
    async (index: number, confirmationIndex: number, reason?: string) => {
      if (!selected || !canReverseDp) {
        return false;
      }
      setActing(true);
      setError(null);
      setStatusMessage(null);
      try {
        const updated = await reverseKolamProyekDpConfirmation(
          selected.id,
          index,
          confirmationIndex,
          reason,
        );
        setSelected(updated);
        setStatusMessage('Konfirmasi pembayaran dibatalkan.');
        return true;
      } catch (reverseError) {
        setError(getApiErrorMessage(reverseError));
        return false;
      } finally {
        setActing(false);
      }
    },
    [canReverseDp, selected],
  );

  const onDownloadKwitansi = useCallback(
    async (index: number) => {
      if (!selected || !canDownloadKwitansi) {
        return false;
      }
      const row = selected.dpSchedule.find(item => item.index === index);
      if (!row?.paidAt || !row.kwitansiNumber) {
        setError('Kwitansi belum tersedia untuk baris DP ini.');
        return false;
      }
      setActing(true);
      setError(null);
      setStatusMessage(null);
      try {
        const result = await downloadKolamProyekKwitansi(
          selected.id,
          index,
          row.kwitansiNumber,
        );
        setStatusMessage(
          result.path
            ? `Kwitansi disimpan: ${result.name}`
            : `Kwitansi diunduh: ${result.name}`,
        );
        return true;
      } catch (downloadError) {
        setError(getApiErrorMessage(downloadError));
        return false;
      } finally {
        setActing(false);
      }
    },
    [canDownloadKwitansi, selected],
  );

  const onStartWork = useCallback(
    async (note: string) => {
      if (!selected || !canStartKolamProyekWork(selected.lifecycleStatus)) {
        return false;
      }
      const noteError = validateKolamProyekLifecycleNote(note);
      if (noteError) {
        setError(noteError);
        return false;
      }
      setActing(true);
      setError(null);
      setStatusMessage(null);
      try {
        const updated = await transitionKolamProyekLifecycle(
          selected.id,
          'in_progress',
          note.trim(),
        );
        setSelected(updated);
        setStatusMessage('Pengerjaan dimulai.');
        return true;
      } catch (startError) {
        setError(getApiErrorMessage(startError));
        return false;
      } finally {
        setActing(false);
      }
    },
    [selected],
  );

  const onAdminLifecycleTransition = useCallback(
    async (to: KolamProyekLifecycleStatus, note: string) => {
      if (!selected || !canAdminLifecycle) {
        return false;
      }
      const allowed = getKolamProyekHappyPathNext(selected.lifecycleStatus);
      if (!allowed.includes(to)) {
        setError('Transisi status tidak diizinkan dari tahap saat ini.');
        return false;
      }
      const noteError = validateKolamProyekLifecycleNote(note);
      if (noteError) {
        setError(noteError);
        return false;
      }
      setActing(true);
      setError(null);
      setStatusMessage(null);
      try {
        const updated = await transitionKolamProyekLifecycle(
          selected.id,
          to,
          note.trim(),
        );
        setSelected(updated);
        setStatusMessage(
          `Status → ${formatKolamProyekLifecycleLabel(updated.lifecycleStatus)}.`,
        );
        return true;
      } catch (transitionError) {
        setError(getApiErrorMessage(transitionError));
        return false;
      } finally {
        setActing(false);
      }
    },
    [canAdminLifecycle, selected],
  );

  const onRefundProject = useCallback(
    async (note: string) => {
      if (!selected || !canRefund) {
        return false;
      }
      const allowed = getKolamProyekAllowedNext(selected.lifecycleStatus);
      if (!allowed.includes('refunded')) {
        setError('Refund tidak diizinkan dari tahap saat ini.');
        return false;
      }
      const noteError = validateKolamProyekLifecycleNote(note);
      if (noteError) {
        setError(noteError);
        return false;
      }
      setActing(true);
      setError(null);
      setStatusMessage(null);
      try {
        const updated = await transitionKolamProyekLifecycle(
          selected.id,
          'refunded',
          note.trim(),
        );
        setSelected(updated);
        setStatusMessage('Proyek ditandai refund.');
        return true;
      } catch (refundError) {
        setError(getApiErrorMessage(refundError));
        return false;
      } finally {
        setActing(false);
      }
    },
    [canRefund, selected],
  );

  const onSaveHppMaterials = useCallback(
    async (lines: KolamProyekHppMaterial[]) => {
      if (!selected || !canEditHpp) {
        return false;
      }
      setActing(true);
      setError(null);
      setStatusMessage(null);
      try {
        const updated = await updateKolamProyekHppMaterials(
          selected.id,
          selected.lifecycleStatus,
          lines,
        );
        setSelected(updated);
        setStatusMessage('Produk Toko disimpan.');
        return true;
      } catch (saveError) {
        setError(getApiErrorMessage(saveError));
        return false;
      } finally {
        setActing(false);
      }
    },
    [canEditHpp, selected],
  );

  const onUpdateProgress = useCallback(
    async (progressPercent: number, progressNote?: string) => {
      if (!selected || !canUpdateKolamProyekProgress(selected.lifecycleStatus)) {
        return false;
      }
      const validationError = validateKolamProyekProgressUpdate(
        progressPercent,
        selected.progressPercent,
      );
      if (validationError) {
        setError(validationError);
        return false;
      }
      setActing(true);
      setError(null);
      setStatusMessage(null);
      try {
        const updated = await updateKolamProyekProgress(selected.id, {
          progressPercent,
          progressNote,
        });
        setSelected(updated);
        setStatusMessage('Progress disimpan.');
        return true;
      } catch (progressError) {
        setError(getApiErrorMessage(progressError));
        return false;
      } finally {
        setActing(false);
      }
    },
    [selected],
  );

  const onSubmitDesign = useCallback(
    async (input: KolamProyekSubmitRoundInput) => {
      if (!selected || !canSubmitKolamProyekDesign(selected)) {
        return false;
      }
      if (!isKolamProyekLinkedTaskDone(selected.linkedTask)) {
        setError(
          'Task proyek harus selesai (status Done) sebelum kirim desain.',
        );
        return false;
      }
      const validationError = validateKolamProyekSubmitRound(input);
      if (validationError) {
        setError(validationError);
        return false;
      }
      setActing(true);
      setError(null);
      setStatusMessage(null);
      try {
        const updated = await submitKolamProyekDesign(selected.id, input);
        setSelected(updated);
        setStatusMessage('Desain terkirim — menunggu review klien.');
        return true;
      } catch (submitError) {
        setError(getApiErrorMessage(submitError));
        return false;
      } finally {
        setActing(false);
      }
    },
    [selected],
  );

  const onSubmitDelivery = useCallback(
    async (input: KolamProyekSubmitRoundInput) => {
      if (!selected || !canSubmitKolamProyekDelivery(selected)) {
        return false;
      }
      const validationError = validateKolamProyekSubmitRound(input);
      if (validationError) {
        setError(validationError);
        return false;
      }
      setActing(true);
      setError(null);
      setStatusMessage(null);
      try {
        const updated = await submitKolamProyekDelivery(selected.id, input);
        setSelected(updated);
        setStatusMessage('Bukti pengerjaan terkirim — menunggu review klien.');
        return true;
      } catch (submitError) {
        setError(getApiErrorMessage(submitError));
        return false;
      } finally {
        setActing(false);
      }
    },
    [selected],
  );

  const onCloseProject = useCallback(async () => {
    if (!selected || !canClose) {
      const reason = getKolamProyekCloseBlockReason(selected);
      if (reason) {
        setError(reason);
      }
      return false;
    }
    setActing(true);
    setError(null);
    setStatusMessage(null);
    try {
      const updated = await closeKolamProyek(selected.id);
      setSelected(updated);
      setStatusMessage('Proyek ditutup / selesai.');
      return true;
    } catch (closeError) {
      setError(getApiErrorMessage(closeError));
      return false;
    } finally {
      setActing(false);
    }
  }, [canClose, selected]);

  const onDownloadInvoice = useCallback(async () => {
    if (!selected || !canDownloadInvoice) {
      return false;
    }
    setActing(true);
    setError(null);
    setStatusMessage(null);
    try {
      const result = await downloadKolamProyekInvoice(
        selected.id,
        selected.quotationNumber,
      );
      setStatusMessage(
        result.path
          ? `Invoice disimpan: ${result.name}`
          : `Invoice diunduh: ${result.name}`,
      );
      return true;
    } catch (downloadError) {
      setError(getApiErrorMessage(downloadError));
      return false;
    } finally {
      setActing(false);
    }
  }, [canDownloadInvoice, selected]);

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
      canClose,
      canConfirmDp,
      canCreate,
      canDelete,
      canDownloadInvoice,
      canDownloadKwitansi,
      canEdit,
      canResend,
      canReverseDp,
      canSend,
      canStartWork,
      canSubmitDelivery,
      canSubmitDesign,
      canUpdate,
      canUpdateProgress,
      canUploadDpProof,
      canEditHpp,
      canRefund,
      canView,
      canAdminLifecycle,
      closeBlockReason,
      customerOptions: mergedCustomerOptions,
      dataSource,
      error,
      form,
      items,
      lifecycleFilter,
      linkedTaskDone,
      loading,
      loadingOptions,
      mode,
      page,
      pageSize,
      pluginEnabled,
      saving,
      search,
      selected,
      staffOptions: mergedStaffOptions,
      statusMessage,
      termsOptions: mergedTermsOptions,
      total,
      totalPages,
      onAddFormItem,
      onAdminLifecycleTransition,
      onBackToList,
      onCancelProject,
      onCloseProject,
      onConfirmDpReceived,
      onCreateNew,
      onDeleteDraft,
      onDownloadInvoice,
      onDownloadKwitansi,
      onEdit,
      onFormChange,
      onOpenItem,
      onPatchFormItem,
      onRefresh,
      onRefundProject,
      onRemoveFormItem,
      onResendQuotation,
      onReverseDpConfirmation,
      onSaveHppMaterials,
      onSaveQuotation,
      onSearchChange,
      onSendQuotation,
      onSetLifecycleFilter,
      onSetPage,
      onSetPageSize,
      onStartWork,
      onSubmitDelivery,
      onSubmitDesign,
      onUpdateProgress,
      onUploadDpProofs,
    }),
    [
      acting,
      canCancel,
      canClose,
      canConfirmDp,
      canCreate,
      canDelete,
      canDownloadInvoice,
      canDownloadKwitansi,
      canEdit,
      canResend,
      canReverseDp,
      canSend,
      canStartWork,
      canSubmitDelivery,
      canSubmitDesign,
      canUpdate,
      canUpdateProgress,
      canUploadDpProof,
      canEditHpp,
      canRefund,
      canView,
      canAdminLifecycle,
      closeBlockReason,
      dataSource,
      error,
      form,
      items,
      lifecycleFilter,
      linkedTaskDone,
      loading,
      loadingOptions,
      mergedCustomerOptions,
      mergedStaffOptions,
      mergedTermsOptions,
      mode,
      onAddFormItem,
      onAdminLifecycleTransition,
      onBackToList,
      onCancelProject,
      onCloseProject,
      onConfirmDpReceived,
      onCreateNew,
      onDeleteDraft,
      onDownloadInvoice,
      onDownloadKwitansi,
      onEdit,
      onFormChange,
      onOpenItem,
      onPatchFormItem,
      onRefresh,
      onRefundProject,
      onRemoveFormItem,
      onResendQuotation,
      onReverseDpConfirmation,
      onSaveHppMaterials,
      onSaveQuotation,
      onSearchChange,
      onSendQuotation,
      onSetLifecycleFilter,
      onSetPage,
      onSetPageSize,
      onStartWork,
      onSubmitDelivery,
      onSubmitDesign,
      onUpdateProgress,
      onUploadDpProofs,
      page,
      pageSize,
      pluginEnabled,
      saving,
      search,
      selected,
      statusMessage,
      total,
      totalPages,
    ],
  );
}
