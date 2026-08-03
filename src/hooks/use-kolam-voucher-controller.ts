import { useCallback, useEffect, useMemo, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  buildKolamVoucherDetailRoute,
  buildKolamVoucherEditRoute,
  createEmptyKolamVoucherFormState,
  createKolamVoucherFormState,
  createKolamVoucherSavePayload,
  getKolamVoucherIdFromRoute,
  getKolamVoucherRouteMode,
  hasKolamVoucherPermission,
  isKolamVoucherRoute,
  validateKolamVoucherForm,
  type KolamVoucher,
  type KolamVoucherFormState,
  type KolamVoucherPickerOption,
  type KolamVoucherRedemption,
  type KolamVoucherRouteMode,
  type KolamVoucherStatus,
} from '../domain/kolam-voucher';
import { getErrorMessage as getApiErrorMessage } from '../lib/api-error';
import { getKolamCustomerList } from '../services/kolam-customer-api';
import { getKolamProductOptions } from '../services/kolam-product-option-api';
import { getKolamSpeciesList } from '../services/kolam-species-api';
import {
  createKolamVoucher,
  deleteKolamVoucher,
  getKolamVoucher,
  getKolamVoucherRedemptions,
  getKolamVouchers,
  updateKolamVoucher,
  updateKolamVoucherStatus,
} from '../services/kolam-voucher-api';

export type KolamVoucherSurfaceMode = KolamVoucherRouteMode;
export type KolamVoucherDataSource = 'idle' | 'live' | 'error';

const OPTION_LIMIT = 1000;

export interface KolamVoucherController {
  canCreate: boolean;
  canDelete: boolean;
  canUpdate: boolean;
  canView: boolean;
  customerOptions: KolamVoucherPickerOption[];
  dataSource: KolamVoucherDataSource;
  error: string | null;
  form: KolamVoucherFormState;
  loading: boolean;
  loadingOptions: boolean;
  loadingRedemptions: boolean;
  mode: KolamVoucherSurfaceMode;
  mutating: boolean;
  page: number;
  pageSize: number;
  productOptions: KolamVoucherPickerOption[];
  redemptionPage: number;
  redemptionTotal: number;
  redemptionTotalPages: number;
  redemptions: KolamVoucherRedemption[];
  saving: boolean;
  search: string;
  selectedVoucher: KolamVoucher | null;
  speciesOptions: KolamVoucherPickerOption[];
  statusFilter: '' | KolamVoucherStatus;
  statusMessage: string | null;
  total: number;
  totalPages: number;
  vouchers: KolamVoucher[];
  onAddCustomerId: (id: string) => void;
  onAddProductId: (id: string) => void;
  onAddSpeciesId: (id: string) => void;
  onBackToList: () => string;
  onChangeForm: <K extends keyof KolamVoucherFormState>(
    key: K,
    value: KolamVoucherFormState[K],
  ) => void;
  onClearFilters: () => void;
  onCreateNew: () => void;
  onDeleteVoucher: (voucher: KolamVoucher) => Promise<boolean>;
  onEdit: () => string | null;
  onRefresh: () => Promise<void>;
  onRemoveCustomerId: (id: string) => void;
  onRemoveProductId: (id: string) => void;
  onRemoveSpeciesId: (id: string) => void;
  onSave: () => Promise<string | null>;
  onSearchChange: (value: string) => void;
  onSetPage: (page: number) => void;
  onSetPageSize: (pageSize: number) => void;
  onSetRedemptionPage: (page: number) => void;
  onSetStatusFilter: (value: '' | KolamVoucherStatus) => void;
  onToggleStatus: (voucher: KolamVoucher) => Promise<boolean>;
}

export function useKolamVoucherController(route: string): KolamVoucherController {
  const { authUser } = useKolamAuthContext();
  const initialMode = getKolamVoucherRouteMode(route);
  const routeVoucherId = getKolamVoucherIdFromRoute(route);

  const canView = hasKolamVoucherPermission(
    authUser?.permissions,
    'view',
    authUser?.roleKey,
  );
  const canCreate = hasKolamVoucherPermission(
    authUser?.permissions,
    'create',
    authUser?.roleKey,
  );
  const canUpdate = hasKolamVoucherPermission(
    authUser?.permissions,
    'update',
    authUser?.roleKey,
  );
  const canDelete = hasKolamVoucherPermission(
    authUser?.permissions,
    'delete',
    authUser?.roleKey,
  );

  const [vouchers, setVouchers] = useState<KolamVoucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<KolamVoucher | null>(
    null,
  );
  const [mode, setMode] = useState<KolamVoucherSurfaceMode>(initialMode);
  const [form, setForm] = useState<KolamVoucherFormState>(() =>
    createEmptyKolamVoucherFormState(),
  );
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingRedemptions, setLoadingRedemptions] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<KolamVoucherDataSource>('idle');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | KolamVoucherStatus>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [productOptions, setProductOptions] = useState<
    KolamVoucherPickerOption[]
  >([]);
  const [speciesOptions, setSpeciesOptions] = useState<
    KolamVoucherPickerOption[]
  >([]);
  const [customerOptions, setCustomerOptions] = useState<
    KolamVoucherPickerOption[]
  >([]);
  const [redemptions, setRedemptions] = useState<KolamVoucherRedemption[]>([]);
  const [redemptionPage, setRedemptionPage] = useState(1);
  const [redemptionTotal, setRedemptionTotal] = useState(0);
  const [redemptionTotalPages, setRedemptionTotalPages] = useState(1);

  useEffect(() => {
    if (!isKolamVoucherRoute(route)) {
      return;
    }
    setMode(getKolamVoucherRouteMode(route));
  }, [route]);

  useEffect(() => {
    setError(null);
    setStatusMessage(null);
    if (mode === 'new') {
      setSelectedVoucher(null);
      setForm(createEmptyKolamVoucherFormState());
      setRedemptions([]);
    }
  }, [mode, route]);

  const loadList = useCallback(async () => {
    if (!canView) {
      setVouchers([]);
      setTotal(0);
      setTotalPages(1);
      setDataSource('idle');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getKolamVouchers({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setVouchers(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setPage(result.page);
      setDataSource('live');
    } catch (loadError) {
      setVouchers([]);
      setTotal(0);
      setTotalPages(1);
      setDataSource('error');
      setError(getApiErrorMessage(loadError, 'Gagal memuat daftar voucher.'));
    } finally {
      setLoading(false);
    }
  }, [canView, page, pageSize, search, statusFilter]);

  const loadVoucherById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const live = await getKolamVoucher(id);
      setSelectedVoucher(live);
      setForm(createKolamVoucherFormState(live));
      setRedemptionPage(1);
      setDataSource('live');
      return live;
    } catch (loadError) {
      setSelectedVoucher(null);
      setDataSource('error');
      setError(getApiErrorMessage(loadError, 'Gagal memuat detail voucher.'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRedemptions = useCallback(
    async (id: string, nextPage: number) => {
      setLoadingRedemptions(true);
      try {
        const result = await getKolamVoucherRedemptions(id, {
          page: nextPage,
          limit: 20,
        });
        setRedemptions(result.items);
        setRedemptionPage(result.page);
        setRedemptionTotal(result.total);
        setRedemptionTotalPages(result.totalPages);
      } catch (loadError) {
        setRedemptions([]);
        setRedemptionTotal(0);
        setRedemptionTotalPages(1);
        setError(
          getApiErrorMessage(loadError, 'Gagal memuat riwayat penukaran.'),
        );
      } finally {
        setLoadingRedemptions(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!canView) {
      return;
    }
    if (mode === 'list') {
      void loadList();
      return;
    }
    if (
      (mode === 'detail' || mode === 'edit') &&
      routeVoucherId &&
      selectedVoucher?.id !== routeVoucherId
    ) {
      void loadVoucherById(routeVoucherId);
    }
  }, [
    canView,
    loadList,
    loadVoucherById,
    mode,
    routeVoucherId,
    selectedVoucher?.id,
  ]);

  useEffect(() => {
    if (mode !== 'detail' || !selectedVoucher?.id) {
      return;
    }
    void loadRedemptions(selectedVoucher.id, redemptionPage);
  }, [loadRedemptions, mode, redemptionPage, selectedVoucher?.id]);

  useEffect(() => {
    if (!canView || (mode !== 'new' && mode !== 'edit')) {
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoadingOptions(true);
      try {
        const [products, species, customers] = await Promise.all([
          getKolamProductOptions(),
          getKolamSpeciesList({
            page: 1,
            limit: OPTION_LIMIT,
            view: 'list',
          }),
          getKolamCustomerList({ page: 1, limit: OPTION_LIMIT }),
        ]);
        if (cancelled) {
          return;
        }
        setProductOptions(
          products.map(item => ({
            id: item.id,
            label: item.name,
            sublabel: item.sku || undefined,
          })),
        );
        setSpeciesOptions(
          species.data.map(item => ({
            id: item.id,
            label:
              item.displayName ||
              item.scientificName ||
              item.commonName ||
              item.localName ||
              item.id,
          })),
        );
        setCustomerOptions(
          customers.items.map(item => ({
            id: item.id,
            label: item.name || item.email || item.id,
            sublabel: item.email || item.phone || undefined,
          })),
        );
      } catch {
        if (!cancelled) {
          setProductOptions([]);
          setSpeciesOptions([]);
          setCustomerOptions([]);
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
  }, [canView, mode]);

  const mergedProductOptions = useMemo(() => {
    return mergePickerOptions(
      productOptions,
      selectedVoucher?.applicableProducts ?? [],
    );
  }, [productOptions, selectedVoucher?.applicableProducts]);

  const mergedSpeciesOptions = useMemo(() => {
    return mergePickerOptions(
      speciesOptions,
      selectedVoucher?.applicableSpecies ?? [],
    );
  }, [speciesOptions, selectedVoucher?.applicableSpecies]);

  const mergedCustomerOptions = useMemo(() => {
    return mergePickerOptions(
      customerOptions,
      selectedVoucher?.applicableCustomers ?? [],
    );
  }, [customerOptions, selectedVoucher?.applicableCustomers]);

  const onRefresh = useCallback(async () => {
    setStatusMessage(null);
    if (mode === 'list') {
      await loadList();
      return;
    }
    if (routeVoucherId) {
      await loadVoucherById(routeVoucherId);
      if (mode === 'detail') {
        await loadRedemptions(routeVoucherId, redemptionPage);
      }
    }
  }, [
    loadList,
    loadRedemptions,
    loadVoucherById,
    mode,
    redemptionPage,
    routeVoucherId,
  ]);

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const onSetStatusFilter = useCallback((value: '' | KolamVoucherStatus) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const onClearFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('');
    setPage(1);
  }, []);

  const onSetPage = useCallback((nextPage: number) => {
    setPage(Math.max(1, nextPage));
  }, []);

  const onSetPageSize = useCallback((nextSize: number) => {
    setPageSize(Math.max(1, nextSize));
    setPage(1);
  }, []);

  const onSetRedemptionPage = useCallback((nextPage: number) => {
    setRedemptionPage(Math.max(1, nextPage));
  }, []);

  const onBackToList = useCallback(() => {
    setMode('list');
    setSelectedVoucher(null);
    setForm(createEmptyKolamVoucherFormState());
    setStatusMessage(null);
    setError(null);
    setRedemptions([]);
    return '/vouchers';
  }, []);

  const onCreateNew = useCallback(() => {
    setMode('new');
    setSelectedVoucher(null);
    setForm(createEmptyKolamVoucherFormState());
    setStatusMessage(null);
    setError(null);
  }, []);

  const onEdit = useCallback(() => {
    if (!selectedVoucher) {
      return null;
    }
    setMode('edit');
    setForm(createKolamVoucherFormState(selectedVoucher));
    setError(null);
    setStatusMessage(null);
    return buildKolamVoucherEditRoute(selectedVoucher.id);
  }, [selectedVoucher]);

  const onChangeForm = useCallback(
    <K extends keyof KolamVoucherFormState>(
      key: K,
      value: KolamVoucherFormState[K],
    ) => {
      setForm(prev => ({ ...prev, [key]: value }));
    },
    [],
  );

  const onAddProductId = useCallback((id: string) => {
    if (!id) {
      return;
    }
    setForm(prev =>
      prev.applicableProductIds.includes(id)
        ? prev
        : {
            ...prev,
            applicableProductIds: [...prev.applicableProductIds, id],
          },
    );
  }, []);

  const onRemoveProductId = useCallback((id: string) => {
    setForm(prev => ({
      ...prev,
      applicableProductIds: prev.applicableProductIds.filter(
        item => item !== id,
      ),
    }));
  }, []);

  const onAddSpeciesId = useCallback((id: string) => {
    if (!id) {
      return;
    }
    setForm(prev =>
      prev.applicableSpeciesIds.includes(id)
        ? prev
        : {
            ...prev,
            applicableSpeciesIds: [...prev.applicableSpeciesIds, id],
          },
    );
  }, []);

  const onRemoveSpeciesId = useCallback((id: string) => {
    setForm(prev => ({
      ...prev,
      applicableSpeciesIds: prev.applicableSpeciesIds.filter(
        item => item !== id,
      ),
    }));
  }, []);

  const onAddCustomerId = useCallback((id: string) => {
    if (!id) {
      return;
    }
    setForm(prev =>
      prev.applicableCustomerIds.includes(id)
        ? prev
        : {
            ...prev,
            applicableCustomerIds: [...prev.applicableCustomerIds, id],
          },
    );
  }, []);

  const onRemoveCustomerId = useCallback((id: string) => {
    setForm(prev => ({
      ...prev,
      applicableCustomerIds: prev.applicableCustomerIds.filter(
        item => item !== id,
      ),
    }));
  }, []);

  const onSave = useCallback(async () => {
    const isEdit = mode === 'edit';
    if (isEdit && !canUpdate) {
      setError('Tidak ada izin update voucher.');
      return null;
    }
    if (!isEdit && !canCreate) {
      setError('Tidak ada izin create voucher.');
      return null;
    }
    const validationError = validateKolamVoucherForm(form, { isEdit });
    if (validationError) {
      setError(validationError);
      return null;
    }
    const body = createKolamVoucherSavePayload(form);
    setSaving(true);
    setError(null);
    setStatusMessage(null);
    try {
      const saved = isEdit && selectedVoucher
        ? await updateKolamVoucher(selectedVoucher.id, body)
        : await createKolamVoucher(body);
      setSelectedVoucher(saved);
      setForm(createKolamVoucherFormState(saved));
      setMode('detail');
      setStatusMessage(
        isEdit
          ? `Voucher ${saved.code} diperbarui.`
          : `Voucher ${saved.code} dibuat.`,
      );
      setRedemptionPage(1);
      return buildKolamVoucherDetailRoute(saved.id);
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, 'Gagal menyimpan voucher.'));
      return null;
    } finally {
      setSaving(false);
    }
  }, [canCreate, canUpdate, form, mode, selectedVoucher]);

  const onToggleStatus = useCallback(
    async (voucher: KolamVoucher) => {
      if (!canUpdate) {
        setError('Tidak ada izin update voucher.');
        return false;
      }
      if (voucher.status === 'expired') {
        setError('Voucher kedaluwarsa tidak bisa diaktifkan lewat toggle.');
        return false;
      }
      const nextStatus = voucher.status === 'active' ? 'inactive' : 'active';
      setMutating(true);
      setError(null);
      setStatusMessage(null);
      try {
        await updateKolamVoucherStatus(voucher.id, nextStatus);
        setStatusMessage(
          nextStatus === 'active'
            ? `Voucher ${voucher.code} diaktifkan.`
            : `Voucher ${voucher.code} dinonaktifkan.`,
        );
        await loadList();
        return true;
      } catch (toggleError) {
        setError(
          getApiErrorMessage(toggleError, 'Gagal mengubah status voucher.'),
        );
        return false;
      } finally {
        setMutating(false);
      }
    },
    [canUpdate, loadList],
  );

  const onDeleteVoucher = useCallback(
    async (voucher: KolamVoucher) => {
      if (!canDelete) {
        setError('Tidak ada izin hapus voucher.');
        return false;
      }
      setMutating(true);
      setError(null);
      setStatusMessage(null);
      try {
        await deleteKolamVoucher(voucher.id);
        setStatusMessage(`Voucher ${voucher.code} dihapus.`);
        await loadList();
        return true;
      } catch (deleteError) {
        setError(getApiErrorMessage(deleteError, 'Gagal menghapus voucher.'));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [canDelete, loadList],
  );

  return {
    canCreate,
    canDelete,
    canUpdate,
    canView,
    customerOptions: mergedCustomerOptions,
    dataSource,
    error,
    form,
    loading,
    loadingOptions,
    loadingRedemptions,
    mode,
    mutating,
    page,
    pageSize,
    productOptions: mergedProductOptions,
    redemptionPage,
    redemptionTotal,
    redemptionTotalPages,
    redemptions,
    saving,
    search,
    selectedVoucher,
    speciesOptions: mergedSpeciesOptions,
    statusFilter,
    statusMessage,
    total,
    totalPages,
    vouchers,
    onAddCustomerId,
    onAddProductId,
    onAddSpeciesId,
    onBackToList,
    onChangeForm,
    onClearFilters,
    onCreateNew,
    onDeleteVoucher,
    onEdit,
    onRefresh,
    onRemoveCustomerId,
    onRemoveProductId,
    onRemoveSpeciesId,
    onSave,
    onSearchChange,
    onSetPage,
    onSetPageSize,
    onSetRedemptionPage,
    onSetStatusFilter,
    onToggleStatus,
  };
}

function mergePickerOptions(
  options: KolamVoucherPickerOption[],
  seeded: Array<{ id: string; label: string; sublabel?: string }>,
): KolamVoucherPickerOption[] {
  const map = new Map<string, KolamVoucherPickerOption>();
  for (const item of seeded) {
    map.set(item.id, {
      id: item.id,
      label: item.label,
      sublabel: item.sublabel,
    });
  }
  for (const item of options) {
    map.set(item.id, item);
  }
  return Array.from(map.values());
}
