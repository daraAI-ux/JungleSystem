import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildCreatePOBody,
  buildUpdatePOContentBody,
  calculateKolamPOBreakdown,
  createEmptyKolamPOFormState,
  createInitialKolamPurchaseOrderListFilters,
  createKolamPOFormStateFromPO,
  getKolamPurchaseOrderBreadcrumbPath,
  getKolamPurchaseOrderEditRouteId,
  getKolamPurchaseOrderRouteId,
  isKolamPurchaseOrderCreateRoute,
  isKolamPurchaseOrderDetailRoute,
  isKolamPurchaseOrderEditRoute,
  isKolamPurchaseOrderListRoute,
  isKolamPurchaseOrderRoute,
  type KolamEditPOCheckItemsBody,
  type KolamPOAllocationResult,
  type KolamPOCheckItemInput,
  type KolamPOFormLineItem,
  type KolamPOFormState,
  type KolamPurchaseOrder,
  type KolamPurchaseOrderListFilters,
  type KolamPurchaseOrderPagination,
  type KolamUpdatePOStatusBody,
} from '../domain/kolam-purchase-order';
import type { KolamVendor } from '../domain/kolam-vendor';
import type { KolamWalletOption } from '../domain/kolam-wallet-option';
import { getErrorMessage } from '../lib/api-error';
import {
  type KolamMarketplacePlatform,
  getKolamMarketplaceTask,
  syncKolamMarketplaceStock,
} from '../services/kolam-marketplace-sync-api';
import {
  getKolamPayableInstallments,
  payKolamPayableInstallment,
  type KolamPayableInstallment,
} from '../services/kolam-payable-installment-api';
import {
  confirmKolamPurchaseOrderRefund,
  createKolamPurchaseOrder,
  deleteKolamPurchaseOrder,
  downloadKolamPurchaseOrderListExport,
  downloadKolamPurchaseOrderPdf,
  editKolamPurchaseOrderCheckItems,
  getKolamItemsForPO,
  getKolamPurchaseOrder,
  getKolamPurchaseOrderList,
  payKolamPurchaseOrderDP,
  replaceKolamPurchaseOrderPaymentProof,
  replaceKolamPurchaseOrderRefundProof,
  updateKolamPurchaseOrder,
  updateKolamPurchaseOrderFakturPajak,
  updateKolamPurchaseOrderPayment,
  updateKolamPurchaseOrderStatus,
  uploadKolamPurchaseOrderCheckProof,
  uploadKolamPurchaseOrderPartialProof,
  uploadKolamPurchaseOrderPaymentProof,
  uploadKolamPurchaseOrderReceiveProof,
  uploadKolamPurchaseOrderRefundProof,
  uploadKolamPurchaseOrderVendorInvoice,
  type KolamGetItemsForPOResult,
  type KolamPOItemForSelection,
  type KolamPOItemForSelectionVariant,
} from '../services/kolam-purchase-order-api';
import { getKolamVendors } from '../services/kolam-vendor-api';
import { getKolamWalletOptions } from '../services/kolam-wallet-option-api';
import { pickNativeImageFile } from '../services/native-file-picker';

export type KolamPurchaseOrderSurfaceMode = 'list' | 'detail' | 'create' | 'edit';
export type KolamPurchaseOrderDataSource = 'idle' | 'live' | 'error';

const DEFAULT_PAGINATION: KolamPurchaseOrderPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

const EMPTY_ITEM_PICKER_RESULT: KolamGetItemsForPOResult = {
  products: [],
  species: [],
  packings: [],
};

export interface KolamPurchaseOrderController {
  breadcrumbPath: string;
  breakdown: KolamPOAllocationResult;
  dataSource: KolamPurchaseOrderDataSource;
  error: string | null;
  exporting: boolean;
  filters: KolamPurchaseOrderListFilters;
  form: KolamPOFormState;
  itemPickerLoading: boolean;
  itemPickerResult: KolamGetItemsForPOResult;
  loading: boolean;
  mode: KolamPurchaseOrderSurfaceMode;
  mutating: boolean;
  orders: KolamPurchaseOrder[];
  pagination: KolamPurchaseOrderPagination;
  payableInstallments: KolamPayableInstallment[];
  payableInstallmentsLoading: boolean;
  selectedPO: KolamPurchaseOrder | null;
  statusMessage: string | null;
  vendors: KolamVendor[];
  walletOptions: KolamWalletOption[];
  onAddItemLine: (
    item: KolamPOItemForSelection,
    variant?: KolamPOItemForSelectionVariant | null,
  ) => void;
  onBackToList: () => void;
  onChangeFilters: (patch: Partial<KolamPurchaseOrderListFilters>) => void;
  onChangeForm: (patch: Partial<KolamPOFormState>) => void;
  onChangeItemLine: (key: string, patch: Partial<KolamPOFormLineItem>) => void;
  onClearFilters: () => void;
  onConfirmRefund: (localProofUri: string) => Promise<boolean>;
  onCreateNew: () => void;
  onDeletePO: (po: KolamPurchaseOrder) => Promise<boolean>;
  onRestorePO: (po: KolamPurchaseOrder) => Promise<boolean>;
  onEdit: () => boolean;
  onEditCheckItems: (params: {
    items: KolamPOCheckItemInput[];
    editReason: string;
    partialNote?: string;
    localPartialProofUris?: string[];
  }) => Promise<boolean>;
  onExportList: () => Promise<void>;
  onExportPdf: () => Promise<void>;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
  onPay: (localProofUri: string) => Promise<boolean>;
  onPayDP: (localProofUri: string) => Promise<boolean>;
  onPayInstallment: (
    installmentId: string,
    localProofUris: string[],
  ) => Promise<boolean>;
  onPickImage: () => Promise<string | null>;
  onRefresh: () => Promise<void>;
  onRemoveItemLine: (key: string) => void;
  onReplacePaymentProof: (localProofUri: string) => Promise<boolean>;
  onReplaceRefundProof: (localProofUri: string) => Promise<boolean>;
  onRestoreToDraft: () => Promise<boolean>;
  onCheckPO: (params: {
    items: KolamPOCheckItemInput[];
    localCheckProofUris: string[];
    partialNote?: string;
    localPartialProofUris?: string[];
  }) => Promise<boolean>;
  onReceivePO: (localProofUris: string[]) => Promise<boolean>;
  onSave: () => Promise<string | null>;
  onSaveFakturPajak: (input: {
    serialNumber: string;
    status: 'none' | 'draft' | 'issued' | 'cancelled';
    vendorNpwp: string;
    vendorName: string;
    notes: string;
  }) => Promise<boolean>;
  onSearchChange: (search: string) => void;
  onSearchItemsForPO: (params: {
    search?: string;
    type?: 'all' | 'product' | 'species' | 'packing';
  }) => Promise<void>;
  onSelectPO: (po: KolamPurchaseOrder) => Promise<void>;
  onSyncMarketplace: (platforms: KolamMarketplacePlatform[]) => Promise<boolean>;
  onUpdateStatus: (body: KolamUpdatePOStatusBody) => Promise<boolean>;
  onUploadVendorInvoice: (localUri: string) => Promise<boolean>;
}

export function useKolamPurchaseOrderController(
  route: string,
): KolamPurchaseOrderController {
  const initialMode = getInitialMode(route);
  const [mode, setMode] = useState<KolamPurchaseOrderSurfaceMode>(initialMode);
  const [filters, setFilters] = useState<KolamPurchaseOrderListFilters>(() =>
    createInitialKolamPurchaseOrderListFilters(route),
  );
  const [orders, setOrders] = useState<KolamPurchaseOrder[]>([]);
  const [pagination, setPagination] =
    useState<KolamPurchaseOrderPagination>(DEFAULT_PAGINATION);
  const [selectedPO, setSelectedPO] = useState<KolamPurchaseOrder | null>(null);
  const [form, setForm] = useState<KolamPOFormState>(() =>
    createEmptyKolamPOFormState(),
  );
  const [vendors, setVendors] = useState<KolamVendor[]>([]);
  const [walletOptions, setWalletOptions] = useState<KolamWalletOption[]>([]);
  const [itemPickerResult, setItemPickerResult] =
    useState<KolamGetItemsForPOResult>(EMPTY_ITEM_PICKER_RESULT);
  const [itemPickerLoading, setItemPickerLoading] = useState(false);
  const [payableInstallments, setPayableInstallments] = useState<
    KolamPayableInstallment[]
  >([]);
  const [payableInstallmentsLoading, setPayableInstallmentsLoading] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamPurchaseOrderDataSource>('idle');

  useEffect(() => {
    const nextMode = getInitialMode(route);
    setMode(nextMode);
    if (nextMode === 'list') {
      setFilters(createInitialKolamPurchaseOrderListFilters(route));
      setSelectedPO(null);
      setPayableInstallments([]);
    }
    if (nextMode === 'create') {
      setSelectedPO(null);
      setForm(createEmptyKolamPOFormState());
      setPayableInstallments([]);
    }
    setError(null);
    setStatusMessage(null);
  }, [route]);

  const loadPayableInstallments = useCallback(
    async (po: KolamPurchaseOrder | null) => {
      const payableId = po?.payable?.id;
      if (!payableId) {
        setPayableInstallments([]);
        return;
      }
      setPayableInstallmentsLoading(true);
      try {
        const list = await getKolamPayableInstallments(payableId);
        setPayableInstallments(list);
      } catch {
        setPayableInstallments([]);
      } finally {
        setPayableInstallmentsLoading(false);
      }
    },
    [],
  );

  const refreshFormOptions = useCallback(async () => {
    const [vendorList, walletList] = await Promise.all([
      getKolamVendors().catch(() => [] as KolamVendor[]),
      getKolamWalletOptions().catch(() => [] as KolamWalletOption[]),
    ]);
    setVendors(vendorList);
    setWalletOptions(walletList);
  }, []);

  const refreshList = useCallback(async () => {
    if (!isKolamPurchaseOrderListRoute(route)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [listResult] = await Promise.all([
        getKolamPurchaseOrderList(filters),
        refreshFormOptions(),
      ]);
      setOrders(listResult.data);
      setPagination(listResult.pagination);
      setDataSource('live');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [filters, refreshFormOptions, route]);

  const refreshCreate = useCallback(async () => {
    if (!isKolamPurchaseOrderCreateRoute(route)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await refreshFormOptions();
      setDataSource('live');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [refreshFormOptions, route]);

  const refreshDetail = useCallback(async () => {
    const id =
      getKolamPurchaseOrderEditRouteId(route) || getKolamPurchaseOrderRouteId(route);
    if (!id) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await refreshFormOptions();
      const po = await getKolamPurchaseOrder(id);
      setSelectedPO(po);
      setForm(createKolamPOFormStateFromPO(po));
      setDataSource('live');
      void loadPayableInstallments(po);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [loadPayableInstallments, refreshFormOptions, route]);

  const refresh = useCallback(async () => {
    if (!isKolamPurchaseOrderRoute(route)) {
      return;
    }
    if (isKolamPurchaseOrderListRoute(route)) {
      await refreshList();
      return;
    }
    if (isKolamPurchaseOrderCreateRoute(route)) {
      await refreshCreate();
      return;
    }
    if (isKolamPurchaseOrderDetailRoute(route) || isKolamPurchaseOrderEditRoute(route)) {
      await refreshDetail();
    }
  }, [refreshCreate, refreshDetail, refreshList, route]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onChangeFilters = useCallback(
    (patch: Partial<KolamPurchaseOrderListFilters>) => {
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
      search: '',
      searchByItem: '',
      status: '',
      paymentStatus: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 10,
    });
  }, []);

  const onSelectPO = useCallback(
    async (po: KolamPurchaseOrder) => {
      setMode('detail');
      setSelectedPO(po);
      setForm(createKolamPOFormStateFromPO(po));
      setError(null);
      setStatusMessage(null);
      setLoading(true);
      try {
        const live = await getKolamPurchaseOrder(po.id);
        setSelectedPO(live);
        setForm(createKolamPOFormStateFromPO(live));
        setDataSource('live');
        void loadPayableInstallments(live);
      } catch (loadError) {
        setError(getErrorMessage(loadError));
        setDataSource('error');
      } finally {
        setLoading(false);
      }
    },
    [loadPayableInstallments],
  );

  const onBackToList = useCallback(() => {
    setMode('list');
    setSelectedPO(null);
    setForm(createEmptyKolamPOFormState());
    setPayableInstallments([]);
    setError(null);
    setStatusMessage(null);
  }, []);

  const onCreateNew = useCallback(() => {
    setMode('create');
    setSelectedPO(null);
    setForm(createEmptyKolamPOFormState());
    setPayableInstallments([]);
    setError(null);
    setStatusMessage(null);
  }, []);

  const onEdit = useCallback((): boolean => {
    if (!selectedPO) {
      return false;
    }
    if (selectedPO.status !== 'draft' && selectedPO.status !== 'sent') {
      setError('PO hanya bisa diedit saat status draf atau dikirim.');
      return false;
    }
    setMode('edit');
    setForm(createKolamPOFormStateFromPO(selectedPO));
    setError(null);
    return true;
  }, [selectedPO]);

  const onChangeForm = useCallback((patch: Partial<KolamPOFormState>) => {
    setForm(current => ({ ...current, ...patch }));
  }, []);

  const onAddItemLine = useCallback(
    (
      item: KolamPOItemForSelection,
      variant?: KolamPOItemForSelectionVariant | null,
    ) => {
      setForm(current => {
        const key = `${item.itemType}-${item.id}-${variant?.id ?? ''}-${Date.now()}-${current.items.length}`;
        const line: KolamPOFormLineItem = {
          key,
          itemType: item.itemType,
          refId: item.id,
          variantId: variant?.id ?? '',
          variantLabel: variant
            ? [variant.tier1Value, variant.tier2Value]
                .map(part => part?.trim())
                .filter(Boolean)
                .join(' – ') ||
              variant.sku ||
              '—'
            : '—',
          title: item.title,
          sku: variant?.sku || item.sku || '—',
          unitLabel: item.unitLabel || '—',
          quantity: '1',
          unitPrice: variant?.price || item.price || 0,
        };
        return { ...current, items: [...current.items, line] };
      });
    },
    [],
  );

  const onRemoveItemLine = useCallback((key: string) => {
    setForm(current => ({
      ...current,
      items: current.items.filter(item => item.key !== key),
    }));
  }, []);

  const onChangeItemLine = useCallback(
    (key: string, patch: Partial<KolamPOFormLineItem>) => {
      setForm(current => ({
        ...current,
        items: current.items.map(item =>
          item.key === key ? { ...item, ...patch } : item,
        ),
      }));
    },
    [],
  );

  const onSearchItemsForPO = useCallback(
    async (params: {
      search?: string;
      type?: 'all' | 'product' | 'species' | 'packing';
    }) => {
      setItemPickerLoading(true);
      try {
        const result = await getKolamItemsForPO({
          vendor: form.vendorId || undefined,
          search: params.search,
          type: params.type ?? 'all',
        });
        setItemPickerResult(result);
      } catch (searchError) {
        setError(getErrorMessage(searchError));
      } finally {
        setItemPickerLoading(false);
      }
    },
    [form.vendorId],
  );

  const breakdown = useMemo(
    () =>
      calculateKolamPOBreakdown({
        items: form.items.map(item => ({
          unitPrice: item.unitPrice,
          quantity: Number(item.quantity) || 0,
        })),
        shippingCost: Number(form.shippingCost) || 0,
        discount: {
          type: form.discountType,
          value: Number(form.discountValue) || 0,
        },
      }),
    [form.discountType, form.discountValue, form.items, form.shippingCost],
  );

  const onSave = useCallback(async (): Promise<string | null> => {
    if (!form.vendorId) {
      setError('Pilih pemasok terlebih dahulu.');
      return null;
    }
    if (!form.items.length) {
      setError('Tambahkan minimal 1 item PO.');
      return null;
    }

    setMutating(true);
    setError(null);
    try {
      const saved =
        mode === 'create'
          ? await createKolamPurchaseOrder(buildCreatePOBody(form))
          : await updateKolamPurchaseOrder(
              selectedPO?.id ?? form.id ?? '',
              buildUpdatePOContentBody(form),
            );

      if (!saved.id) {
        throw new Error('Respons simpan PO tidak valid.');
      }

      setSelectedPO(saved);
      setForm(createKolamPOFormStateFromPO(saved));
      setMode('detail');
      setStatusMessage('Purchase order berhasil disimpan');
      void loadPayableInstallments(saved);
      return saved.id;
    } catch (saveError) {
      setError(getErrorMessage(saveError));
      return null;
    } finally {
      setMutating(false);
    }
  }, [form, loadPayableInstallments, mode, selectedPO]);

  const onSaveFakturPajak = useCallback(
    async (input: {
      serialNumber: string;
      status: 'none' | 'draft' | 'issued' | 'cancelled';
      vendorNpwp: string;
      vendorName: string;
      notes: string;
    }): Promise<boolean> => {
      if (!selectedPO) {
        return false;
      }
      setMutating(true);
      setError(null);
      try {
        const saved = await updateKolamPurchaseOrderFakturPajak(
          selectedPO.id,
          input,
        );
        setSelectedPO(saved);
        setStatusMessage('Faktur pajak disimpan');
        return true;
      } catch (saveError) {
        setError(getErrorMessage(saveError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [selectedPO],
  );

  const onDeletePO = useCallback(
    async (po: KolamPurchaseOrder): Promise<boolean> => {
      setMutating(true);
      setError(null);
      try {
        await deleteKolamPurchaseOrder(po.id);
        setOrders(current => current.filter(item => item.id !== po.id));
        setPagination(current => ({
          ...current,
          total: Math.max(0, current.total - 1),
          totalPages: Math.max(
            1,
            Math.ceil(Math.max(0, current.total - 1) / current.limit),
          ),
        }));
        if (selectedPO?.id === po.id) {
          setMode('list');
          setSelectedPO(null);
          setForm(createEmptyKolamPOFormState());
        }
        setStatusMessage('Purchase order berhasil dihapus');
        return true;
      } catch (deleteError) {
        setError(getErrorMessage(deleteError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [selectedPO],
  );

  const onRestorePO = useCallback(
    async (po: KolamPurchaseOrder): Promise<boolean> => {
      setMutating(true);
      setError(null);
      try {
        const updated = await updateKolamPurchaseOrderStatus(po.id, {
          status: 'draft',
        });
        setOrders(current => upsertPO(current, updated));
        if (selectedPO?.id === po.id) {
          setSelectedPO(updated);
          setForm(createKolamPOFormStateFromPO(updated));
        }
        setStatusMessage('PO dikembalikan ke draf');
        return true;
      } catch (restoreError) {
        setError(getErrorMessage(restoreError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [selectedPO],
  );

  const applyStatusUpdate = useCallback(
    async (body: KolamUpdatePOStatusBody): Promise<boolean> => {
      const id = selectedPO?.id;
      if (!id) {
        return false;
      }
      setMutating(true);
      setError(null);
      try {
        const updated = await updateKolamPurchaseOrderStatus(id, body);
        setSelectedPO(updated);
        setForm(createKolamPOFormStateFromPO(updated));
        setOrders(current => upsertPO(current, updated));
        setStatusMessage('Status purchase order berhasil diperbarui');
        void loadPayableInstallments(updated);
        return true;
      } catch (updateError) {
        setError(getErrorMessage(updateError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [loadPayableInstallments, selectedPO],
  );

  const onUpdateStatus = applyStatusUpdate;

  const onRestoreToDraft = useCallback(
    () => applyStatusUpdate({ status: 'draft' }),
    [applyStatusUpdate],
  );

  const onReceivePO = useCallback(
    async (localProofUris: string[]): Promise<boolean> => {
      const id = selectedPO?.id;
      if (!id) {
        return false;
      }
      setMutating(true);
      setError(null);
      try {
        let receiveProofs: string[] = [];
        if (localProofUris.length) {
          const uploaded = await uploadKolamPurchaseOrderReceiveProof(
            id,
            localProofUris,
          );
          receiveProofs = uploaded.paths;
        }
        const updated = await updateKolamPurchaseOrderStatus(id, {
          status: 'received',
          receiveProofs: receiveProofs.length ? receiveProofs : undefined,
        });
        setSelectedPO(updated);
        setForm(createKolamPOFormStateFromPO(updated));
        setOrders(current => upsertPO(current, updated));
        setStatusMessage('Purchase order ditandai diterima');
        return true;
      } catch (receiveError) {
        setError(getErrorMessage(receiveError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [selectedPO],
  );

  const onCheckPO = useCallback(
    async (params: {
      items: KolamPOCheckItemInput[];
      localCheckProofUris: string[];
      partialNote?: string;
      localPartialProofUris?: string[];
    }): Promise<boolean> => {
      const id = selectedPO?.id;
      if (!id) {
        return false;
      }
      setMutating(true);
      setError(null);
      try {
        let checkProofs: string[] = [];
        if (params.localCheckProofUris.length) {
          const uploaded = await uploadKolamPurchaseOrderCheckProof(
            id,
            params.localCheckProofUris,
          );
          checkProofs = uploaded.paths;
        }
        let partialProofs: string[] = [];
        if (params.localPartialProofUris?.length) {
          const uploaded = await uploadKolamPurchaseOrderPartialProof(
            id,
            params.localPartialProofUris,
          );
          partialProofs = uploaded.paths;
        }
        const updated = await updateKolamPurchaseOrderStatus(id, {
          status: 'on_check',
          items: params.items,
          checkProofs: checkProofs.length ? checkProofs : undefined,
          partialNote: params.partialNote || undefined,
          partialProofs: partialProofs.length ? partialProofs : undefined,
        });
        setSelectedPO(updated);
        setForm(createKolamPOFormStateFromPO(updated));
        setOrders(current => upsertPO(current, updated));
        setStatusMessage('Pemeriksaan purchase order tersimpan');
        return true;
      } catch (checkError) {
        setError(getErrorMessage(checkError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [selectedPO],
  );

  const onEditCheckItems = useCallback(
    async (params: {
      items: KolamPOCheckItemInput[];
      editReason: string;
      partialNote?: string;
      localPartialProofUris?: string[];
    }): Promise<boolean> => {
      const id = selectedPO?.id;
      if (!id) {
        return false;
      }
      setMutating(true);
      setError(null);
      try {
        let partialProofs: string[] = [];
        if (params.localPartialProofUris?.length) {
          const uploaded = await uploadKolamPurchaseOrderPartialProof(
            id,
            params.localPartialProofUris,
          );
          partialProofs = uploaded.paths;
        }
        const body: KolamEditPOCheckItemsBody = {
          items: params.items,
          editReason: params.editReason,
          partialNote: params.partialNote || undefined,
          partialProofs: partialProofs.length ? partialProofs : undefined,
        };
        const updated = await editKolamPurchaseOrderCheckItems(id, body);
        setSelectedPO(updated);
        setForm(createKolamPOFormStateFromPO(updated));
        setOrders(current => upsertPO(current, updated));
        setStatusMessage('Item pemeriksaan purchase order diperbarui');
        return true;
      } catch (editError) {
        setError(getErrorMessage(editError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [selectedPO],
  );

  const onUploadVendorInvoice = useCallback(
    async (localUri: string): Promise<boolean> => {
      const id = selectedPO?.id;
      if (!id || !localUri) {
        return false;
      }
      setMutating(true);
      setError(null);
      try {
        await uploadKolamPurchaseOrderVendorInvoice(id, localUri);
        const refreshed = await getKolamPurchaseOrder(id);
        setSelectedPO(refreshed);
        setForm(createKolamPOFormStateFromPO(refreshed));
        setOrders(current => upsertPO(current, refreshed));
        setStatusMessage('Invoice vendor berhasil diunggah');
        return true;
      } catch (uploadError) {
        setError(getErrorMessage(uploadError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [selectedPO],
  );

  const onPay = useCallback(
    async (localProofUri: string): Promise<boolean> => {
      const id = selectedPO?.id;
      if (!id) {
        return false;
      }
      if (!localProofUri) {
        setError('Pilih bukti pembayaran terlebih dahulu.');
        return false;
      }
      setMutating(true);
      setError(null);
      try {
        const uploaded = await uploadKolamPurchaseOrderPaymentProof(
          id,
          localProofUri,
        );
        const updated = await updateKolamPurchaseOrderPayment(id, {
          paymentStatus: 'paid',
          paymentProof: uploaded.path,
        });
        setSelectedPO(updated);
        setForm(createKolamPOFormStateFromPO(updated));
        setOrders(current => upsertPO(current, updated));
        setStatusMessage('Pembayaran purchase order tercatat lunas');
        void loadPayableInstallments(updated);
        return true;
      } catch (payError) {
        setError(getErrorMessage(payError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [loadPayableInstallments, selectedPO],
  );

  const onPayDP = useCallback(
    async (localProofUri: string): Promise<boolean> => {
      const id = selectedPO?.id;
      if (!id) {
        return false;
      }
      if (!localProofUri) {
        setError('Pilih bukti DP terlebih dahulu.');
        return false;
      }
      setMutating(true);
      setError(null);
      try {
        const uploaded = await uploadKolamPurchaseOrderPaymentProof(
          id,
          localProofUri,
        );
        await payKolamPurchaseOrderDP(id, { paymentProof: uploaded.path });
        const refreshed = await getKolamPurchaseOrder(id);
        setSelectedPO(refreshed);
        setForm(createKolamPOFormStateFromPO(refreshed));
        setOrders(current => upsertPO(current, refreshed));
        setStatusMessage('DP purchase order tercatat');
        void loadPayableInstallments(refreshed);
        return true;
      } catch (dpError) {
        setError(getErrorMessage(dpError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [loadPayableInstallments, selectedPO],
  );

  const onConfirmRefund = useCallback(
    async (localProofUri: string): Promise<boolean> => {
      const id = selectedPO?.id;
      if (!id) {
        return false;
      }
      if (!localProofUri) {
        setError('Pilih bukti refund terlebih dahulu.');
        return false;
      }
      setMutating(true);
      setError(null);
      try {
        const uploaded = await uploadKolamPurchaseOrderRefundProof(
          id,
          localProofUri,
        );
        const updated = await confirmKolamPurchaseOrderRefund(id, {
          refundProof: uploaded.path,
        });
        setSelectedPO(updated);
        setForm(createKolamPOFormStateFromPO(updated));
        setOrders(current => upsertPO(current, updated));
        setStatusMessage('Refund purchase order dikonfirmasi');
        return true;
      } catch (refundError) {
        setError(getErrorMessage(refundError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [selectedPO],
  );

  const onReplacePaymentProof = useCallback(
    async (localProofUri: string): Promise<boolean> => {
      const id = selectedPO?.id;
      if (!id || !localProofUri) {
        return false;
      }
      setMutating(true);
      setError(null);
      try {
        const uploaded = await uploadKolamPurchaseOrderPaymentProof(
          id,
          localProofUri,
        );
        const updated = await replaceKolamPurchaseOrderPaymentProof(
          id,
          uploaded.path,
        );
        setSelectedPO(updated);
        setForm(createKolamPOFormStateFromPO(updated));
        setOrders(current => upsertPO(current, updated));
        setStatusMessage('Bukti pembayaran berhasil diganti');
        return true;
      } catch (replaceError) {
        setError(getErrorMessage(replaceError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [selectedPO],
  );

  const onReplaceRefundProof = useCallback(
    async (localProofUri: string): Promise<boolean> => {
      const id = selectedPO?.id;
      if (!id || !localProofUri) {
        return false;
      }
      setMutating(true);
      setError(null);
      try {
        const uploaded = await uploadKolamPurchaseOrderRefundProof(
          id,
          localProofUri,
        );
        const updated = await replaceKolamPurchaseOrderRefundProof(
          id,
          uploaded.path,
        );
        setSelectedPO(updated);
        setForm(createKolamPOFormStateFromPO(updated));
        setOrders(current => upsertPO(current, updated));
        setStatusMessage('Bukti refund berhasil diganti');
        return true;
      } catch (replaceError) {
        setError(getErrorMessage(replaceError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [selectedPO],
  );

  const onPayInstallment = useCallback(
    async (installmentId: string, localProofUris: string[]): Promise<boolean> => {
      const payableId = selectedPO?.payable?.id;
      const poId = selectedPO?.id;
      if (!payableId || !poId) {
        setError('Purchase order ini tidak punya cicilan aktif.');
        return false;
      }
      setMutating(true);
      setError(null);
      try {
        const list = await payKolamPayableInstallment(
          payableId,
          installmentId,
          localProofUris,
        );
        setPayableInstallments(list);
        setStatusMessage('Cicilan berhasil dibayar');
        const refreshed = await getKolamPurchaseOrder(poId);
        setSelectedPO(refreshed);
        setForm(createKolamPOFormStateFromPO(refreshed));
        setOrders(current => upsertPO(current, refreshed));
        return true;
      } catch (payError) {
        setError(getErrorMessage(payError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [selectedPO],
  );

  const onExportList = useCallback(async () => {
    setExporting(true);
    setError(null);
    try {
      await downloadKolamPurchaseOrderListExport(filters);
      setStatusMessage('Ekspor daftar purchase order berhasil diunduh');
    } catch (exportError) {
      setError(getErrorMessage(exportError));
    } finally {
      setExporting(false);
    }
  }, [filters]);

  const onExportPdf = useCallback(async () => {
    const po = selectedPO;
    if (!po) {
      return;
    }
    setExporting(true);
    setError(null);
    try {
      await downloadKolamPurchaseOrderPdf(po.id, po.poCode);
      setStatusMessage('PDF purchase order berhasil diunduh');
    } catch (exportError) {
      setError(getErrorMessage(exportError));
    } finally {
      setExporting(false);
    }
  }, [selectedPO]);

  const onSyncMarketplace = useCallback(
    async (platforms: KolamMarketplacePlatform[]): Promise<boolean> => {
      const po = selectedPO;
      if (!po) {
        return false;
      }
      const skus = Array.from(
        new Set(po.items.map(item => item.sku.trim()).filter(Boolean)),
      );
      if (!skus.length) {
        setError('Purchase order ini tidak punya SKU item untuk disinkron.');
        return false;
      }
      setMutating(true);
      setError(null);
      setStatusMessage(null);
      try {
        const result = await syncKolamMarketplaceStock({
          platforms,
          onlySkus: skus,
        });
        setStatusMessage(result.message);
        const taskIds = Object.values(result.perPlatform)
          .map(entry => entry.taskId)
          .filter((taskId): taskId is string => Boolean(taskId));
        if (taskIds.length) {
          await Promise.all(taskIds.map(taskId => pollKolamMarketplaceTask(taskId)));
          setStatusMessage('Sinkron stok marketplace selesai diproses');
        }
        return true;
      } catch (syncError) {
        setError(getErrorMessage(syncError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [selectedPO],
  );

  const onPickImage = useCallback(async (): Promise<string | null> => {
    try {
      const picked = await pickNativeImageFile();
      if (picked.cancelled) {
        return null;
      }
      return picked.uri ?? picked.path ?? null;
    } catch (pickError) {
      setError(getErrorMessage(pickError));
      return null;
    }
  }, []);

  const breadcrumbPath = useMemo(
    () =>
      getKolamPurchaseOrderBreadcrumbPath(
        mode === 'create' ? 'new' : mode,
        selectedPO,
      ),
    [mode, selectedPO],
  );

  return {
    breadcrumbPath,
    breakdown,
    dataSource,
    error,
    exporting,
    filters,
    form,
    itemPickerLoading,
    itemPickerResult,
    loading,
    mode,
    mutating,
    orders,
    pagination,
    payableInstallments,
    payableInstallmentsLoading,
    selectedPO,
    statusMessage,
    vendors,
    walletOptions,
    onAddItemLine,
    onBackToList,
    onChangeFilters,
    onChangeForm,
    onChangeItemLine,
    onClearFilters,
    onConfirmRefund,
    onCreateNew,
    onDeletePO,
    onRestorePO,
    onEdit,
    onEditCheckItems,
    onExportList,
    onExportPdf,
    onLimitChange,
    onPageChange,
    onPay,
    onPayDP,
    onPayInstallment,
    onPickImage,
    onRefresh: refresh,
    onRemoveItemLine,
    onReplacePaymentProof,
    onReplaceRefundProof,
    onRestoreToDraft,
    onCheckPO,
    onReceivePO,
    onSave,
    onSaveFakturPajak,
    onSearchChange,
    onSearchItemsForPO,
    onSelectPO,
    onSyncMarketplace,
    onUpdateStatus,
    onUploadVendorInvoice,
  };
}

function getInitialMode(route: string): KolamPurchaseOrderSurfaceMode {
  if (isKolamPurchaseOrderCreateRoute(route)) {
    return 'create';
  }
  if (isKolamPurchaseOrderEditRoute(route)) {
    return 'edit';
  }
  if (isKolamPurchaseOrderListRoute(route)) {
    return 'list';
  }
  if (isKolamPurchaseOrderDetailRoute(route)) {
    return 'detail';
  }
  return 'list';
}

function upsertPO(
  list: KolamPurchaseOrder[],
  po: KolamPurchaseOrder,
): KolamPurchaseOrder[] {
  const index = list.findIndex(item => item.id === po.id);
  if (index < 0) {
    return list;
  }
  const next = [...list];
  next[index] = po;
  return next;
}

async function pollKolamMarketplaceTask(
  taskId: string,
  attempts = 5,
  delayMs = 800,
) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const task = await getKolamMarketplaceTask(taskId);
      if (
        !task ||
        task.status === 'success' ||
        task.status === 'failed' ||
        task.status === 'cancelled'
      ) {
        return task;
      }
    } catch {
      return null;
    }
    if (attempt < attempts - 1) {
      await new Promise<void>(resolve => setTimeout(() => resolve(), delayMs));
    }
  }
  return null;
}
