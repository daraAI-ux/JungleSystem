import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildCreateProductionBody,
  buildUpdateProductionBody,
  createEmptyKolamProductionFormState,
  createInitialKolamProductionListFilters,
  createKolamProductionFormStateFromProduction,
  getKolamProductionBreadcrumbPath,
  getKolamProductionEditRouteId,
  getKolamProductionRouteId,
  isKolamProductionCreateRoute,
  isKolamProductionDetailRoute,
  isKolamProductionEditRoute,
  isKolamProductionListRoute,
  isKolamProductionRoute,
  type KolamCreateProductionWithPOBody,
  type KolamFinalizeProductionBody,
  type KolamProduction,
  type KolamProductionFormState,
  type KolamProductionListFilters,
  type KolamProductionPagination,
  type KolamProductionSerial,
  type KolamProductionStaffAssignee,
  type KolamProductForProduction,
  type KolamSubmitCheckBody,
  type KolamUpdateProductionBody,
} from '../domain/kolam-production';
import type { KolamSpecies } from '../domain/kolam-species';
import { getErrorMessage, ApiError } from '../lib/api-error';
import {
  cancelKolamProduction,
  createKolamProduction,
  createKolamProductionWithPO,
  deleteKolamProduction,
  deleteKolamProductionPhoto,
  downloadKolamProductionDetailPdf,
  downloadKolamProductionListExport,
  downloadKolamProductionPdf,
  finalizeKolamProduction,
  generateKolamPoFromPlan,
  getKolamFreyersForProduction,
  getKolamProduction,
  getKolamProductionList,
  getKolamProductionStaffAssignees,
  getKolamProductsForProduction,
  getKolamSerialsByProduction,
  recalculateKolamProduction,
  restoreKolamProduction,
  submitKolamProductionCheck,
  updateKolamProduction,
  uploadKolamProductionPhotos,
  type KolamGeneratePoFromPlanResult,
  type KolamRecalculateProductionResult,
  type KolamRestoreProductionResult,
} from '../services/kolam-production-api';
import { getKolamSpeciesList } from '../services/kolam-species-api';
import { pickNativeImageFile } from '../services/native-file-picker';

export type KolamProductionSurfaceMode = 'list' | 'detail' | 'create' | 'edit';
export type KolamProductionDataSource = 'idle' | 'live' | 'error';
export type KolamProductionExportingState = 'list' | 'pdf' | 'detailPdf' | null;

const DEFAULT_PAGINATION: KolamProductionPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

export interface KolamProductionController {
  breadcrumbPath: string;
  dataSource: KolamProductionDataSource;
  error: string | null;
  exporting: KolamProductionExportingState;
  filters: KolamProductionListFilters;
  form: KolamProductionFormState;
  freyersForProduction: KolamProductForProduction[];
  insufficientStock: string[];
  loading: boolean;
  mode: KolamProductionSurfaceMode;
  mutating: boolean;
  pagination: KolamProductionPagination;
  pickerLoading: boolean;
  productions: KolamProduction[];
  productsForProduction: KolamProductForProduction[];
  selectedProduction: KolamProduction | null;
  serials: KolamProductionSerial[];
  serialsLoading: boolean;
  speciesList: KolamSpecies[];
  staffAssignees: KolamProductionStaffAssignee[];
  statusMessage: string | null;
  onBackToList: () => void;
  onCancelProduction: (note?: string) => Promise<boolean>;
  onChangeFilters: (patch: Partial<KolamProductionListFilters>) => void;
  onChangeForm: (patch: Partial<KolamProductionFormState>) => void;
  onClearFilters: () => void;
  onClearInsufficientStock: () => void;
  onCreateNew: () => void;
  onCreateWithPO: () => Promise<string | null>;
  onDeletePhoto: (index: number) => Promise<boolean>;
  onDeleteProduction: () => Promise<boolean>;
  onEdit: () => boolean;
  onExportDetailPdf: () => Promise<void>;
  onExportList: () => Promise<void>;
  onExportPdf: () => Promise<void>;
  onFinalize: (body: KolamFinalizeProductionBody) => Promise<boolean>;
  onGeneratePo: () => Promise<KolamGeneratePoFromPlanResult | null>;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
  onPickImage: () => Promise<string | null>;
  onRecalculate: () => Promise<KolamRecalculateProductionResult | null>;
  onRefresh: () => Promise<void>;
  onRefreshDetailQuiet: () => Promise<void>;
  onRestoreProduction: (note?: string) => Promise<KolamRestoreProductionResult | null>;
  onSave: () => Promise<string | null>;
  onSearchChange: (search: string) => void;
  onSearchProductsForProduction: (search?: string) => Promise<void>;
  onSelectProduction: (production: KolamProduction) => Promise<void>;
  onStartProduction: (note?: string) => Promise<boolean>;
  onSubmitCheck: (body: KolamSubmitCheckBody) => Promise<boolean>;
  onUploadPhotos: (localUris: string[]) => Promise<boolean>;
}

export function useKolamProductionController(
  route: string,
): KolamProductionController {
  const initialMode = getInitialMode(route);
  const [mode, setMode] = useState<KolamProductionSurfaceMode>(initialMode);
  const [filters, setFilters] = useState<KolamProductionListFilters>(() =>
    createInitialKolamProductionListFilters(route),
  );
  const [productions, setProductions] = useState<KolamProduction[]>([]);
  const [pagination, setPagination] =
    useState<KolamProductionPagination>(DEFAULT_PAGINATION);
  const [selectedProduction, setSelectedProduction] =
    useState<KolamProduction | null>(null);
  const [form, setForm] = useState<KolamProductionFormState>(() =>
    createEmptyKolamProductionFormState(),
  );
  const [productsForProduction, setProductsForProduction] = useState<
    KolamProductForProduction[]
  >([]);
  const [freyersForProduction, setFreyersForProduction] = useState<
    KolamProductForProduction[]
  >([]);
  const [speciesList, setSpeciesList] = useState<KolamSpecies[]>([]);
  const [staffAssignees, setStaffAssignees] = useState<
    KolamProductionStaffAssignee[]
  >([]);
  const [serials, setSerials] = useState<KolamProductionSerial[]>([]);
  const [serialsLoading, setSerialsLoading] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [exporting, setExporting] =
    useState<KolamProductionExportingState>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [insufficientStock, setInsufficientStock] = useState<string[]>([]);
  const [dataSource, setDataSource] =
    useState<KolamProductionDataSource>('idle');

  useEffect(() => {
    const nextMode = getInitialMode(route);
    setMode(nextMode);
    if (nextMode === 'list') {
      setFilters(createInitialKolamProductionListFilters(route));
      setSelectedProduction(null);
      setSerials([]);
    }
    if (nextMode === 'create') {
      setSelectedProduction(null);
      setForm(createEmptyKolamProductionFormState());
      setSerials([]);
      setInsufficientStock([]);
    }
    setError(null);
    setStatusMessage(null);
  }, [route]);

  const loadSerials = useCallback(async (productionId: string) => {
    setSerialsLoading(true);
    try {
      const result = await getKolamSerialsByProduction(productionId);
      setSerials(result.data);
    } catch {
      setSerials([]);
    } finally {
      setSerialsLoading(false);
    }
  }, []);

  const refreshFormOptions = useCallback(async () => {
    const [products, freyers, speciesResult, assignees] = await Promise.all([
      getKolamProductsForProduction({ limit: 500 }).catch(() => []),
      getKolamFreyersForProduction({ limit: 500 }).catch(() => []),
      getKolamSpeciesList({ page: 1, limit: 500 }).catch(() => ({
        data: [],
        pagination: DEFAULT_PAGINATION,
      })),
      getKolamProductionStaffAssignees({ limit: 200 }).catch(() => []),
    ]);
    setProductsForProduction(products);
    setFreyersForProduction(freyers);
    setSpeciesList(speciesResult.data);
    setStaffAssignees(assignees);
  }, []);

  const refreshList = useCallback(async () => {
    if (!isKolamProductionListRoute(route)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [listResult] = await Promise.all([
        getKolamProductionList(filters),
        refreshFormOptions(),
      ]);
      setProductions(listResult.data);
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
    if (!isKolamProductionCreateRoute(route)) {
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
      getKolamProductionEditRouteId(route) || getKolamProductionRouteId(route);
    if (!id) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await refreshFormOptions();
      const production = await getKolamProduction(id);
      setSelectedProduction(production);
      setForm(createKolamProductionFormStateFromProduction(production));
      setDataSource('live');
      if (production.status === 'completed') {
        void loadSerials(id);
      } else {
        setSerials([]);
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [loadSerials, refreshFormOptions, route]);

  const refreshDetailQuiet = useCallback(async () => {
    const id = selectedProduction?.id || getKolamProductionRouteId(route);
    if (!id) {
      return;
    }
    try {
      const production = await getKolamProduction(id);
      setSelectedProduction(production);
      setForm(createKolamProductionFormStateFromProduction(production));
      if (production.status === 'completed') {
        void loadSerials(id);
      }
    } catch {
      /* polling errors are non-fatal */
    }
  }, [loadSerials, route, selectedProduction?.id]);

  const refresh = useCallback(async () => {
    if (!isKolamProductionRoute(route)) {
      return;
    }
    if (isKolamProductionListRoute(route)) {
      await refreshList();
      return;
    }
    if (isKolamProductionCreateRoute(route)) {
      await refreshCreate();
      return;
    }
    if (isKolamProductionDetailRoute(route) || isKolamProductionEditRoute(route)) {
      await refreshDetail();
    }
  }, [refreshCreate, refreshDetail, refreshList, route]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onChangeFilters = useCallback(
    (patch: Partial<KolamProductionListFilters>) => {
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
      status: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 10,
    });
  }, []);

  const onSelectProduction = useCallback(
    async (production: KolamProduction) => {
      setMode('detail');
      setSelectedProduction(production);
      setForm(createKolamProductionFormStateFromProduction(production));
      setError(null);
      setStatusMessage(null);
      setLoading(true);
      try {
        const live = await getKolamProduction(production.id);
        setSelectedProduction(live);
        setForm(createKolamProductionFormStateFromProduction(live));
        setDataSource('live');
        if (live.status === 'completed') {
          void loadSerials(live.id);
        }
      } catch (loadError) {
        setError(getErrorMessage(loadError));
        setDataSource('error');
      } finally {
        setLoading(false);
      }
    },
    [loadSerials],
  );

  const onBackToList = useCallback(() => {
    setMode('list');
    setSelectedProduction(null);
    setForm(createEmptyKolamProductionFormState());
    setSerials([]);
    setError(null);
    setStatusMessage(null);
  }, []);

  const onCreateNew = useCallback(() => {
    setMode('create');
    setSelectedProduction(null);
    setForm(createEmptyKolamProductionFormState());
    setError(null);
    setStatusMessage(null);
  }, []);

  const onEdit = useCallback((): boolean => {
    if (!selectedProduction) {
      return false;
    }
    setMode('edit');
    setForm(createKolamProductionFormStateFromProduction(selectedProduction));
    setError(null);
    return true;
  }, [selectedProduction]);

  const onChangeForm = useCallback((patch: Partial<KolamProductionFormState>) => {
    setForm(current => ({ ...current, ...patch }));
  }, []);

  const onSearchProductsForProduction = useCallback(async (search?: string) => {
    setPickerLoading(true);
    try {
      const [products, freyers] = await Promise.all([
        getKolamProductsForProduction({ search, limit: 100 }),
        getKolamFreyersForProduction({ search, limit: 100 }),
      ]);
      setProductsForProduction(products);
      setFreyersForProduction(freyers);
    } finally {
      setPickerLoading(false);
    }
  }, []);

  const onSave = useCallback(async (): Promise<string | null> => {
    setMutating(true);
    setError(null);
    setStatusMessage(null);
    setInsufficientStock([]);
    try {
      if (mode === 'create') {
        const created = await createKolamProduction(buildCreateProductionBody(form));
        setStatusMessage('Produksi berhasil dibuat.');
        return created.id;
      }
      if ((mode === 'edit' || mode === 'detail') && selectedProduction) {
        const updated = await updateKolamProduction(
          selectedProduction.id,
          buildUpdateProductionBody(form, {
            status: selectedProduction.status,
          }),
        );
        setSelectedProduction(updated);
        setForm(createKolamProductionFormStateFromProduction(updated));
        setStatusMessage('Produksi berhasil diperbarui.');
        return updated.id;
      }
      return null;
    } catch (saveError) {
      setError(getErrorMessage(saveError));
      if (
        saveError instanceof ApiError &&
        saveError.code === 'INSUFFICIENT_STOCK'
      ) {
        setInsufficientStock(
          saveError.insufficientStock?.length
            ? saveError.insufficientStock
            : ['Stok bahan tidak mencukupi'],
        );
      }
      return null;
    } finally {
      setMutating(false);
    }
  }, [form, mode, selectedProduction]);

  const onClearInsufficientStock = useCallback(() => {
    setInsufficientStock([]);
  }, []);

  const onGeneratePo = useCallback(async (): Promise<KolamGeneratePoFromPlanResult | null> => {
    setMutating(true);
    setError(null);
    try {
      const result = await generateKolamPoFromPlan(buildCreateProductionBody(form));
      setStatusMessage(result.message || 'PO berhasil digenerate.');
      if (result.created.length) {
        setInsufficientStock([]);
      }
      return result;
    } catch (generateError) {
      setError(getErrorMessage(generateError));
      return null;
    } finally {
      setMutating(false);
    }
  }, [form]);

  const onCreateWithPO = useCallback(async (): Promise<string | null> => {
    if (form.targetType !== 'product' && !form.serialEnabled) {
      setError('Fitur Buat + PO khusus target Produk.');
      return null;
    }
    if (!form.productId || !form.description.trim() || !form.assignedToId) {
      setError('Produk, deskripsi, dan penanggung jawab wajib diisi.');
      return null;
    }
    setMutating(true);
    setError(null);
    setInsufficientStock([]);
    try {
      const body: KolamCreateProductionWithPOBody = {
        product: form.productId,
        serialEnabled: form.serialEnabled || undefined,
        variant: form.variantId || undefined,
        quantity: Math.max(1, Number(form.quantity) || 1),
        description: form.description.trim(),
        assignedTo: form.assignedToId,
        productionDate: form.productionDate || undefined,
      };
      const result = await createKolamProductionWithPO(body);
      setSelectedProduction(result.production);
      setStatusMessage(result.message || 'Produksi + PO berhasil dibuat.');
      return result.production.id;
    } catch (createError) {
      setError(getErrorMessage(createError));
      return null;
    } finally {
      setMutating(false);
    }
  }, [form]);

  const onStartProduction = useCallback(
    async (note?: string): Promise<boolean> => {
      if (!selectedProduction) {
        return false;
      }
      setMutating(true);
      setError(null);
      try {
        const body: KolamUpdateProductionBody = {
          status: 'in_progress',
          note: note?.trim() || undefined,
        };
        const updated = await updateKolamProduction(selectedProduction.id, body);
        setSelectedProduction(updated);
        setStatusMessage('Status diperbarui ke Sedang berjalan.');
        return true;
      } catch (updateError) {
        setError(getErrorMessage(updateError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [selectedProduction],
  );

  const onSubmitCheck = useCallback(
    async (body: KolamSubmitCheckBody): Promise<boolean> => {
      if (!selectedProduction) {
        return false;
      }
      setMutating(true);
      setError(null);
      try {
        const updated = await submitKolamProductionCheck(
          selectedProduction.id,
          body,
        );
        setSelectedProduction(updated);
        setStatusMessage('Produksi dikirim untuk pemeriksaan.');
        return true;
      } catch (submitError) {
        setError(getErrorMessage(submitError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [selectedProduction],
  );

  const onFinalize = useCallback(
    async (body: KolamFinalizeProductionBody): Promise<boolean> => {
      if (!selectedProduction) {
        return false;
      }
      setMutating(true);
      setError(null);
      try {
        const updated = await finalizeKolamProduction(selectedProduction.id, body);
        setSelectedProduction(updated);
        setStatusMessage(
          body.decision === 'accept'
            ? 'Produksi difinalisasi · diterima.'
            : 'Produksi ditolak · kembali ke sedang berjalan.',
        );
        if (updated.status === 'completed') {
          void loadSerials(updated.id);
        }
        return true;
      } catch (finalizeError) {
        setError(getErrorMessage(finalizeError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [loadSerials, selectedProduction],
  );

  const onCancelProduction = useCallback(
    async (note?: string): Promise<boolean> => {
      if (!selectedProduction) {
        return false;
      }
      setMutating(true);
      setError(null);
      try {
        const result = await cancelKolamProduction(
          selectedProduction.id,
          note,
        );
        setSelectedProduction(result.production);
        const cancelledPOs = result.cancelReport.cancelledPOs;
        const keptPOs = result.cancelReport.keptPOs;
        if (cancelledPOs.length > 0) {
          setStatusMessage(
            `Produksi dibatalkan. ${cancelledPOs.length} PO otomatis dibatalkan: ${cancelledPOs.join(', ')}`,
          );
        } else {
          setStatusMessage('Produksi dibatalkan.');
        }
        if (keptPOs.length > 0) {
          setError(
            `${keptPOs.length} PO tetap aktif (status sudah lanjut): ${keptPOs
              .map(po => `${po.poCode} (${po.status})`)
              .join(', ')}`,
          );
        }
        return true;
      } catch (cancelError) {
        setError(getErrorMessage(cancelError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [selectedProduction],
  );

  const onRestoreProduction = useCallback(
    async (note?: string): Promise<KolamRestoreProductionResult | null> => {
      if (!selectedProduction) {
        return null;
      }
      setMutating(true);
      setError(null);
      try {
        const result = await restoreKolamProduction(selectedProduction.id, note);
        setSelectedProduction(result.production);
        setStatusMessage(result.message || 'Produksi dipulihkan.');
        return result;
      } catch (restoreError) {
        setError(getErrorMessage(restoreError));
        return null;
      } finally {
        setMutating(false);
      }
    },
    [selectedProduction],
  );

  const onDeleteProduction = useCallback(async (): Promise<boolean> => {
    if (!selectedProduction) {
      return false;
    }
    setMutating(true);
    setError(null);
    try {
      await deleteKolamProduction(selectedProduction.id);
      setStatusMessage('Produksi dihapus permanen.');
      setSelectedProduction(null);
      setMode('list');
      return true;
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
      return false;
    } finally {
      setMutating(false);
    }
  }, [selectedProduction]);

  const onRecalculate = useCallback(async (): Promise<KolamRecalculateProductionResult | null> => {
    if (!selectedProduction) {
      return null;
    }
    setMutating(true);
    setError(null);
    try {
      const result = await recalculateKolamProduction(selectedProduction.id);
      setSelectedProduction(result.production);
      setStatusMessage('Estimasi biaya & stok diperbarui.');
      return result;
    } catch (recalcError) {
      setError(getErrorMessage(recalcError));
      return null;
    } finally {
      setMutating(false);
    }
  }, [selectedProduction]);

  const onUploadPhotos = useCallback(
    async (localUris: string[]): Promise<boolean> => {
      if (!selectedProduction) {
        return false;
      }
      setMutating(true);
      setError(null);
      try {
        const updated = await uploadKolamProductionPhotos(
          selectedProduction.id,
          localUris,
        );
        setSelectedProduction(updated);
        setStatusMessage('Foto berhasil diunggah.');
        return true;
      } catch (uploadError) {
        setError(getErrorMessage(uploadError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [selectedProduction],
  );

  const onDeletePhoto = useCallback(
    async (index: number): Promise<boolean> => {
      if (!selectedProduction) {
        return false;
      }
      setMutating(true);
      setError(null);
      try {
        const updated = await deleteKolamProductionPhoto(
          selectedProduction.id,
          index,
        );
        setSelectedProduction(updated);
        setStatusMessage('Foto dihapus.');
        return true;
      } catch (deleteError) {
        setError(getErrorMessage(deleteError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [selectedProduction],
  );

  const onPickImage = useCallback(async () => {
    try {
      const picked = await pickNativeImageFile();
      if (picked.cancelled) {
        return null;
      }
      return picked.uri || picked.path || null;
    } catch {
      return null;
    }
  }, []);

  const onExportList = useCallback(async () => {
    setExporting('list');
    setError(null);
    try {
      const result = await downloadKolamProductionListExport(filters);
      setStatusMessage(`Export disimpan: ${result.name}`);
    } catch (exportError) {
      setError(getErrorMessage(exportError));
    } finally {
      setExporting(null);
    }
  }, [filters]);

  const onExportPdf = useCallback(async () => {
    if (!selectedProduction) {
      return;
    }
    setExporting('pdf');
    setError(null);
    try {
      const result = await downloadKolamProductionPdf(
        selectedProduction.id,
        selectedProduction.batchId,
      );
      setStatusMessage(`PDF disimpan: ${result.name}`);
    } catch (exportError) {
      setError(getErrorMessage(exportError));
    } finally {
      setExporting(null);
    }
  }, [selectedProduction]);

  const onExportDetailPdf = useCallback(async () => {
    if (!selectedProduction) {
      return;
    }
    setExporting('detailPdf');
    setError(null);
    try {
      const result = await downloadKolamProductionDetailPdf(
        selectedProduction.id,
        selectedProduction.batchId,
      );
      setStatusMessage(`PDF detail disimpan: ${result.name}`);
    } catch (exportError) {
      setError(getErrorMessage(exportError));
    } finally {
      setExporting(null);
    }
  }, [selectedProduction]);

  const breadcrumbPath = useMemo(
    () =>
      getKolamProductionBreadcrumbPath(
        mode === 'create'
          ? 'new'
          : mode === 'edit'
          ? 'edit'
          : mode === 'detail'
          ? 'detail'
          : 'list',
        selectedProduction,
      ),
    [mode, selectedProduction],
  );

  return {
    breadcrumbPath,
    dataSource,
    error,
    exporting,
    filters,
    form,
    freyersForProduction,
    insufficientStock,
    loading,
    mode,
    mutating,
    pagination,
    pickerLoading,
    productions,
    productsForProduction,
    selectedProduction,
    serials,
    serialsLoading,
    speciesList,
    staffAssignees,
    statusMessage,
    onBackToList,
    onCancelProduction,
    onChangeFilters,
    onChangeForm,
    onClearFilters,
    onClearInsufficientStock,
    onCreateNew,
    onCreateWithPO,
    onDeletePhoto,
    onDeleteProduction,
    onEdit,
    onExportDetailPdf,
    onExportList,
    onExportPdf,
    onFinalize,
    onGeneratePo,
    onLimitChange,
    onPageChange,
    onPickImage,
    onRecalculate,
    onRefresh: refresh,
    onRefreshDetailQuiet: refreshDetailQuiet,
    onRestoreProduction,
    onSave,
    onSearchChange,
    onSearchProductsForProduction,
    onSelectProduction,
    onStartProduction,
    onSubmitCheck,
    onUploadPhotos,
  };
}

function getInitialMode(route: string): KolamProductionSurfaceMode {
  if (isKolamProductionCreateRoute(route)) {
    return 'create';
  }
  if (isKolamProductionEditRoute(route)) {
    return 'edit';
  }
  if (isKolamProductionDetailRoute(route)) {
    return 'detail';
  }
  return 'list';
}
