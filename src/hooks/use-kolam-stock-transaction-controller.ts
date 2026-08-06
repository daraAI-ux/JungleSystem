import { useCallback, useEffect, useMemo, useState } from 'react';
import type { KolamFreyerOption } from '../domain/kolam-freyer-option';
import type { KolamProduct } from '../domain/kolam-product';
import type { KolamProductOption } from '../domain/kolam-product-option';
import type { KolamSpecies } from '../domain/kolam-species';
import {
  createEmptyKolamStockOpnameFormState,
  createInitialStockTransactionListFilters,
  createKolamStockOpnameTargetFromFreyer,
  createKolamStockOpnameTargetFromProduct,
  createKolamStockOpnameTargetFromSpecies,
  createKolamStockOpnameTargetFromTeranura,
  getKolamStockTransactionBreadcrumbPath,
  getKolamStockTransactionRouteId,
  getStockOpnameCurrentStock,
  getStockOpnameDiff,
  getStockOpnameLossAmount,
  isKolamStockTransactionDetailRoute,
  isKolamStockTransactionListRoute,
  isKolamStockTransactionOpnameRoute,
  isKolamStockTransactionRoute,
  stockOpnameNeedsWalletConfirm,
  validateKolamStockOpnameForm,
  type KolamStockOpnameFormState,
  type KolamStockOpnameTargetOption,
  type KolamStockOpnameTargetType,
  type KolamStockTransaction,
  type KolamStockTransactionListFilters,
  type KolamStockTransactionPagination,
  type KolamStockTransactionPendingReturn,
  type KolamStockTransactionStatus,
} from '../domain/kolam-stock-transaction';
import type { KolamTeranura } from '../domain/kolam-teranura';
import type { KolamWalletOption } from '../domain/kolam-wallet-option';
import { getErrorMessage } from '../lib/api-error';
import { getKolamFreyerOptions } from '../services/kolam-freyer-option-api';
import { getKolamProducts } from '../services/kolam-product-api';
import { getKolamProductOptions } from '../services/kolam-product-option-api';
import { getKolamSpeciesList } from '../services/kolam-species-api';
import {
  cancelKolamStockTransactionFinance,
  createKolamStockOpname,
  downloadKolamStockTransactionExport,
  getKolamStockTransaction,
  getKolamStockTransactionList,
  verifyKolamStockTransaction,
} from '../services/kolam-stock-transaction-api';
import { getKolamTeranuras } from '../services/kolam-teranura-api';
import { getKolamWalletOptions } from '../services/kolam-wallet-option-api';
import { pickNativeImageFile } from '../services/native-file-picker';

export type KolamStockTransactionSurfaceMode = 'list' | 'detail' | 'opname';
export type KolamStockTransactionDataSource = 'idle' | 'live' | 'error';

const DEFAULT_PAGINATION: KolamStockTransactionPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

export interface KolamStockTransactionController {
  breadcrumbPath: string;
  dataSource: KolamStockTransactionDataSource;
  error: string | null;
  exporting: boolean;
  filters: KolamStockTransactionListFilters;
  freyerOptions: KolamFreyerOption[];
  loading: boolean;
  mode: KolamStockTransactionSurfaceMode;
  mutating: boolean;
  opnameForm: KolamStockOpnameFormState;
  opnameProducts: KolamProduct[];
  opnameRawProducts: KolamProduct[];
  opnameSelectedTarget: KolamStockOpnameTargetOption | null;
  opnameCurrentStock: number | null;
  opnameDiff: number | null;
  opnameLossAmount: number;
  opnameNeedsWallet: boolean;
  pagination: KolamStockTransactionPagination;
  pendingReturns: KolamStockTransactionPendingReturn[];
  productOptions: KolamProductOption[];
  selectedTransaction: KolamStockTransaction | null;
  speciesOptions: KolamSpecies[];
  statusMessage: string | null;
  teranuraOptions: KolamTeranura[];
  transactions: KolamStockTransaction[];
  walletOptions: KolamWalletOption[];
  onAddOpnamePhoto: () => Promise<void>;
  onCancelFinance: () => Promise<boolean>;
  onChangeFilters: (patch: Partial<KolamStockTransactionListFilters>) => void;
  onChangeOpnameForm: (patch: Partial<KolamStockOpnameFormState>) => void;
  onClearFilters: () => void;
  onExport: () => Promise<void>;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => Promise<void>;
  onRemoveOpnamePhoto: (index: number) => void;
  onSearchChange: (search: string) => void;
  onSubmitOpname: () => Promise<'wallet' | 'done' | 'error'>;
  onConfirmOpnameWallet: () => Promise<boolean>;
  onVerify: () => Promise<boolean>;
}

export function useKolamStockTransactionController(
  route: string,
): KolamStockTransactionController {
  const initialMode = getInitialMode(route);
  const [mode, setMode] =
    useState<KolamStockTransactionSurfaceMode>(initialMode);
  const [filters, setFilters] = useState<KolamStockTransactionListFilters>(() =>
    createInitialStockTransactionListFilters(route),
  );
  const [transactions, setTransactions] = useState<KolamStockTransaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<KolamStockTransaction | null>(null);
  const [pagination, setPagination] =
    useState<KolamStockTransactionPagination>(DEFAULT_PAGINATION);
  const [pendingReturns, setPendingReturns] = useState<
    KolamStockTransactionPendingReturn[]
  >([]);
  const [productOptions, setProductOptions] = useState<KolamProductOption[]>(
    [],
  );
  const [speciesOptions, setSpeciesOptions] = useState<KolamSpecies[]>([]);
  const [opnameProducts, setOpnameProducts] = useState<KolamProduct[]>([]);
  const [opnameRawProducts, setOpnameRawProducts] = useState<KolamProduct[]>(
    [],
  );
  const [freyerOptions, setFreyerOptions] = useState<KolamFreyerOption[]>([]);
  const [teranuraOptions, setTeranuraOptions] = useState<KolamTeranura[]>([]);
  const [walletOptions, setWalletOptions] = useState<KolamWalletOption[]>([]);
  const [opnameForm, setOpnameForm] = useState<KolamStockOpnameFormState>(() =>
    createEmptyKolamStockOpnameFormState(),
  );
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamStockTransactionDataSource>('idle');

  useEffect(() => {
    const nextMode = getInitialMode(route);
    setMode(nextMode);
    if (nextMode === 'list') {
      setFilters(createInitialStockTransactionListFilters(route));
      setSelectedTransaction(null);
    }
    if (nextMode === 'opname') {
      setSelectedTransaction(null);
      setOpnameForm(createEmptyKolamStockOpnameFormState());
    }
    setError(null);
    setStatusMessage(null);
  }, [route]);

  const refreshListOptions = useCallback(async () => {
    const [productResult, speciesResult] = await Promise.allSettled([
      getKolamProductOptions(),
      getKolamSpeciesList({ limit: 1000, page: 1 }),
    ]);
    if (productResult.status === 'fulfilled') {
      setProductOptions(productResult.value);
    }
    if (speciesResult.status === 'fulfilled') {
      setSpeciesOptions(speciesResult.value.data);
    }
  }, []);

  const refreshOpnameOptions = useCallback(async () => {
    const [
      productResult,
      rawResult,
      speciesResult,
      freyerResult,
      teranuraResult,
      walletResult,
    ] = await Promise.allSettled([
      getKolamProducts({ page: 1, limit: 1000, type: 'product' }),
      getKolamProducts({ page: 1, limit: 1000, type: 'raw' }),
      getKolamSpeciesList({ limit: 1000, page: 1 }),
      getKolamFreyerOptions({ page: 1, limit: 1000 }),
      getKolamTeranuras({ page: 1, limit: 1000 }),
      getKolamWalletOptions(),
    ]);

    if (productResult.status === 'fulfilled') {
      setOpnameProducts(productResult.value.data);
    }
    if (rawResult.status === 'fulfilled') {
      setOpnameRawProducts(rawResult.value.data);
    }
    if (speciesResult.status === 'fulfilled') {
      setSpeciesOptions(speciesResult.value.data);
    }
    if (freyerResult.status === 'fulfilled') {
      setFreyerOptions(freyerResult.value);
    }
    if (teranuraResult.status === 'fulfilled') {
      setTeranuraOptions(teranuraResult.value.data);
    }
    if (walletResult.status === 'fulfilled') {
      setWalletOptions(walletResult.value);
    }
  }, []);

  const refreshList = useCallback(async () => {
    if (!isKolamStockTransactionListRoute(route)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await refreshListOptions();
      const liveResult = await getKolamStockTransactionList(filters);
      setTransactions(liveResult.data);
      setPagination(liveResult.pagination);
      setPendingReturns(liveResult.pendingReturnExpectations);
      setDataSource('live');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [filters, refreshListOptions, route]);

  const refreshDetail = useCallback(async () => {
    const id = getKolamStockTransactionRouteId(route);
    if (!id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await refreshListOptions();
      const live = await getKolamStockTransaction(id);
      setSelectedTransaction(live);
      setDataSource('live');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [refreshListOptions, route]);

  const refreshOpname = useCallback(async () => {
    if (!isKolamStockTransactionOpnameRoute(route)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await refreshOpnameOptions();
      setDataSource('live');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [refreshOpnameOptions, route]);

  const refresh = useCallback(async () => {
    if (!isKolamStockTransactionRoute(route)) {
      return;
    }
    if (isKolamStockTransactionListRoute(route)) {
      await refreshList();
      return;
    }
    if (isKolamStockTransactionDetailRoute(route)) {
      await refreshDetail();
      return;
    }
    if (isKolamStockTransactionOpnameRoute(route)) {
      await refreshOpname();
    }
  }, [refreshDetail, refreshList, refreshOpname, route]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const opnameSelectedTarget = useMemo(() => {
    return resolveOpnameTarget(
      opnameForm.targetType,
      opnameForm.targetId,
      opnameProducts,
      opnameRawProducts,
      speciesOptions,
      freyerOptions,
      teranuraOptions,
    );
  }, [
    freyerOptions,
    opnameForm.targetId,
    opnameForm.targetType,
    opnameProducts,
    opnameRawProducts,
    speciesOptions,
    teranuraOptions,
  ]);

  const opnameCurrentStock = useMemo(
    () =>
      getStockOpnameCurrentStock(opnameSelectedTarget, opnameForm.variantId),
    [opnameForm.variantId, opnameSelectedTarget],
  );
  const opnameDiff = useMemo(
    () => getStockOpnameDiff(opnameForm, opnameSelectedTarget),
    [opnameForm, opnameSelectedTarget],
  );
  const opnameLossAmount = useMemo(
    () => getStockOpnameLossAmount(opnameForm, opnameSelectedTarget),
    [opnameForm, opnameSelectedTarget],
  );
  const opnameNeedsWallet = useMemo(
    () => stockOpnameNeedsWalletConfirm(opnameForm, opnameSelectedTarget),
    [opnameForm, opnameSelectedTarget],
  );

  const onChangeFilters = useCallback(
    (patch: Partial<KolamStockTransactionListFilters>) => {
      setFilters(current => {
        const next: KolamStockTransactionListFilters = {
          ...current,
          ...patch,
          page: patch.page ?? 1,
        };
        if (patch.productId !== undefined && patch.productId) {
          next.speciesId = '';
        }
        if (patch.speciesId !== undefined && patch.speciesId) {
          next.productId = '';
        }
        if (patch.status !== undefined) {
          next.status =
            patch.status === 'verified' || patch.status === 'unverified'
              ? (patch.status as KolamStockTransactionStatus)
              : '';
        }
        return next;
      });
    },
    [],
  );

  const onClearFilters = useCallback(() => {
    setFilters({
      search: '',
      productId: '',
      speciesId: '',
      enclosureId: '',
      stockOpnameId: '',
      status: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 10,
    });
  }, []);

  const onSearchChange = useCallback((search: string) => {
    setFilters(current => ({ ...current, search, page: 1 }));
  }, []);

  const onPageChange = useCallback((page: number) => {
    setFilters(current => ({ ...current, page: Math.max(1, page) }));
  }, []);

  const onLimitChange = useCallback((limit: number) => {
    setFilters(current => ({ ...current, limit, page: 1 }));
  }, []);

  const onExport = useCallback(async () => {
    setExporting(true);
    setError(null);
    try {
      await downloadKolamStockTransactionExport(filters);
    } catch (exportError) {
      setError(getErrorMessage(exportError));
    } finally {
      setExporting(false);
    }
  }, [filters]);

  const onVerify = useCallback(async () => {
    const id =
      selectedTransaction?.id || getKolamStockTransactionRouteId(route);
    if (!id) {
      return false;
    }
    setMutating(true);
    setError(null);
    setStatusMessage(null);
    try {
      const updated = await verifyKolamStockTransaction(id);
      setSelectedTransaction(updated);
      setStatusMessage('Verifikasi finance berhasil');
      setDataSource('live');
      return true;
    } catch (verifyError) {
      setError(getErrorMessage(verifyError));
      return false;
    } finally {
      setMutating(false);
    }
  }, [route, selectedTransaction?.id]);

  const onCancelFinance = useCallback(async () => {
    const id =
      selectedTransaction?.id || getKolamStockTransactionRouteId(route);
    if (!id) {
      return false;
    }
    setMutating(true);
    setError(null);
    setStatusMessage(null);
    try {
      const updated = await cancelKolamStockTransactionFinance(id);
      setSelectedTransaction(updated);
      setStatusMessage('Finance dibatalkan untuk transaksi ini');
      setDataSource('live');
      return true;
    } catch (cancelError) {
      setError(getErrorMessage(cancelError));
      return false;
    } finally {
      setMutating(false);
    }
  }, [route, selectedTransaction?.id]);

  const onChangeOpnameForm = useCallback(
    (patch: Partial<KolamStockOpnameFormState>) => {
      setOpnameForm(current => {
        const next = { ...current, ...patch };
        if (
          patch.targetType !== undefined &&
          patch.targetType !== current.targetType
        ) {
          next.targetId = '';
          next.variantId = '';
          next.adjustedStock = '0';
          next.walletId = '';
        }
        if (
          patch.targetId !== undefined &&
          patch.targetId !== current.targetId
        ) {
          next.variantId = '';
          next.adjustedStock = '0';
          next.walletId = '';
        }
        return next;
      });
    },
    [],
  );

  const onAddOpnamePhoto = useCallback(async () => {
    try {
      const picked = await pickNativeImageFile();
      if (picked.cancelled || !picked.uri) {
        return;
      }
      setOpnameForm(current => ({
        ...current,
        photoUris: [...current.photoUris, picked.uri!],
      }));
    } catch (pickError) {
      setError(getErrorMessage(pickError));
    }
  }, []);

  const onRemoveOpnamePhoto = useCallback((index: number) => {
    setOpnameForm(current => ({
      ...current,
      photoUris: current.photoUris.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));
  }, []);

  const submitOpname = useCallback(async () => {
    const validationError = validateKolamStockOpnameForm(
      opnameForm,
      opnameSelectedTarget,
    );
    if (validationError) {
      setError(validationError);
      return false;
    }

    setMutating(true);
    setError(null);
    setStatusMessage(null);
    try {
      await createKolamStockOpname({
        targetType: opnameForm.targetType,
        targetId: opnameForm.targetId,
        variantId: opnameForm.variantId || undefined,
        adjustedStock: String(Number(opnameForm.adjustedStock)),
        reason: opnameForm.reason || undefined,
        photoUris: opnameForm.photoUris,
        walletId: opnameForm.walletId || undefined,
      });
      setStatusMessage('Stok berhasil disesuaikan');
      setOpnameForm(createEmptyKolamStockOpnameFormState());
      return true;
    } catch (submitError) {
      setError(getErrorMessage(submitError));
      return false;
    } finally {
      setMutating(false);
    }
  }, [opnameForm, opnameSelectedTarget]);

  const onSubmitOpname = useCallback(async (): Promise<
    'wallet' | 'done' | 'error'
  > => {
    const validationError = validateKolamStockOpnameForm(
      opnameForm,
      opnameSelectedTarget,
    );
    if (validationError) {
      setError(validationError);
      return 'error';
    }

    if (stockOpnameNeedsWalletConfirm(opnameForm, opnameSelectedTarget)) {
      if (!opnameForm.walletId) {
        const mainWallet =
          walletOptions.find(wallet => wallet.type === 'main') ??
          walletOptions[0];
        if (mainWallet) {
          setOpnameForm(current => ({ ...current, walletId: mainWallet.id }));
        }
      }
      return 'wallet';
    }

    const ok = await submitOpname();
    return ok ? 'done' : 'error';
  }, [opnameForm, opnameSelectedTarget, submitOpname, walletOptions]);

  const onConfirmOpnameWallet = useCallback(async () => {
    if (!opnameForm.walletId) {
      setError('Pilih dompet terlebih dahulu.');
      return false;
    }
    return submitOpname();
  }, [opnameForm.walletId, submitOpname]);

  const breadcrumbPath = useMemo(
    () => getKolamStockTransactionBreadcrumbPath(mode),
    [mode],
  );

  return {
    breadcrumbPath,
    dataSource,
    error,
    exporting,
    filters,
    freyerOptions,
    loading,
    mode,
    mutating,
    opnameForm,
    opnameProducts,
    opnameRawProducts,
    opnameSelectedTarget,
    opnameCurrentStock,
    opnameDiff,
    opnameLossAmount,
    opnameNeedsWallet,
    pagination,
    pendingReturns,
    productOptions,
    selectedTransaction,
    speciesOptions,
    statusMessage,
    teranuraOptions,
    transactions,
    walletOptions,
    onAddOpnamePhoto,
    onCancelFinance,
    onChangeFilters,
    onChangeOpnameForm,
    onClearFilters,
    onExport,
    onLimitChange,
    onPageChange,
    onRefresh: refresh,
    onRemoveOpnamePhoto,
    onSearchChange,
    onSubmitOpname,
    onConfirmOpnameWallet,
    onVerify,
  };
}

function resolveOpnameTarget(
  targetType: KolamStockOpnameTargetType,
  targetId: string,
  products: KolamProduct[],
  rawProducts: KolamProduct[],
  species: KolamSpecies[],
  freyers: KolamFreyerOption[],
  teranuras: KolamTeranura[],
): KolamStockOpnameTargetOption | null {
  if (!targetId) {
    return null;
  }

  if (targetType === 'product') {
    const product = products.find(item => item.id === targetId);
    return product ? createKolamStockOpnameTargetFromProduct(product) : null;
  }
  if (targetType === 'raw') {
    const product = rawProducts.find(item => item.id === targetId);
    return product ? createKolamStockOpnameTargetFromProduct(product) : null;
  }
  if (targetType === 'species') {
    const item = species.find(entry => entry.id === targetId);
    return item ? createKolamStockOpnameTargetFromSpecies(item) : null;
  }
  if (targetType === 'freyer') {
    const item = freyers.find(entry => entry.id === targetId);
    return item ? createKolamStockOpnameTargetFromFreyer(item) : null;
  }
  if (targetType === 'teranura') {
    const item = teranuras.find(entry => entry.id === targetId);
    return item ? createKolamStockOpnameTargetFromTeranura(item) : null;
  }
  return null;
}

function getInitialMode(route: string): KolamStockTransactionSurfaceMode {
  if (isKolamStockTransactionOpnameRoute(route)) {
    return 'opname';
  }
  if (isKolamStockTransactionDetailRoute(route)) {
    return 'detail';
  }
  return 'list';
}
