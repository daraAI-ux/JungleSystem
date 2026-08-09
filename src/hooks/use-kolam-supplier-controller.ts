import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createEmptyKolamVendorFormState,
  createKolamVendorFormState,
  getKolamSupplierBreadcrumbPath,
  getKolamSupplierEditRouteId,
  getKolamSupplierRouteId,
  isKolamSupplierCreateRoute,
  isKolamSupplierListRoute,
  isKolamSupplierRoute,
  type KolamSupplierAnalyticsFilters,
  type KolamVendor,
  type KolamVendorFormState,
} from '../domain/kolam-vendor';
import {
  createEmptyKolamTaxPartyProfileFormState,
  type KolamTaxPartyProfileFormState,
} from '../domain/kolam-tax-party';
import type { KolamBrand } from '../domain/kolam-brand';
import { getKolamBrands } from '../services/kolam-brand-api';
import {
  getKolamTaxPartyProfile,
  upsertKolamTaxPartyProfile,
} from '../services/kolam-financial-settings-api';
import {
  createKolamVendor,
  deleteKolamVendor,
  deleteKolamVendorPhoto,
  getKolamVendor,
  getKolamVendors,
  updateKolamVendor,
  uploadKolamVendorPhotos,
} from '../services/kolam-vendor-api';
import {
  readKolamVendorDetailCache,
  readKolamVendorFromListCacheById,
  readKolamVendorListCache,
  removeKolamVendorDetailCache,
  writeKolamVendorDetailCache,
  writeKolamVendorListCache,
} from '../services/kolam-vendor-local-cache';
import { pickNativeImageFile } from '../services/native-file-picker';

export type KolamSupplierSurfaceMode = 'list' | 'detail' | 'edit' | 'new';
export type KolamSupplierDataSource = 'idle' | 'cache' | 'live' | 'error';

export interface KolamSupplierController {
  analyticsFilters: KolamSupplierAnalyticsFilters;
  analyticsLoading: boolean;
  brands: KolamBrand[];
  breadcrumbPath: string;
  dataSource: KolamSupplierDataSource;
  error: string | null;
  form: KolamVendorFormState;
  isEditable: boolean;
  loading: boolean;
  mode: KolamSupplierSurfaceMode;
  pendingPhotoUris: string[];
  saving: boolean;
  selectedVendor: KolamVendor | null;
  taxProfile: KolamTaxPartyProfileFormState;
  taxProfileLoaded: boolean;
  taxProfileSaving: boolean;
  vendors: KolamVendor[];
  onBackToList: () => void;
  onChangeAnalyticsFilters: (
    filters: KolamSupplierAnalyticsFilters,
  ) => Promise<void>;
  onChangeForm: (patch: Partial<KolamVendorFormState>) => void;
  onChangeTaxProfile: (patch: Partial<KolamTaxPartyProfileFormState>) => void;
  onAddPendingPhoto: (photoLocalUri: string) => void;
  onCreateNew: () => void;
  onDeleteExistingPhoto: (index: number) => Promise<boolean>;
  onDeleteVendor: (vendor: KolamVendor) => Promise<boolean>;
  onEdit: () => void;
  onPickPhoto: () => Promise<boolean>;
  onRefresh: () => Promise<void>;
  onRemovePendingPhoto: (index: number) => void;
  onSave: () => Promise<string | null>;
  onSaveTaxProfile: () => Promise<boolean>;
  onSelectVendor: (vendor: KolamVendor) => Promise<void>;
}

export function useKolamSupplierController(
  route: string,
): KolamSupplierController {
  const initialMode = getInitialMode(route);
  const [vendors, setVendors] = useState<KolamVendor[]>([]);
  const [brands, setBrands] = useState<KolamBrand[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<KolamVendor | null>(
    null,
  );
  const [mode, setMode] = useState<KolamSupplierSurfaceMode>(initialMode);
  const [form, setForm] = useState<KolamVendorFormState>(() =>
    createEmptyKolamVendorFormState(),
  );
  const [pendingPhotoUris, setPendingPhotoUris] = useState<string[]>([]);
  const [analyticsFilters, setAnalyticsFilters] =
    useState<KolamSupplierAnalyticsFilters>({});
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [taxProfile, setTaxProfile] = useState<KolamTaxPartyProfileFormState>(
    () => createEmptyKolamTaxPartyProfileFormState(),
  );
  const [taxProfileLoaded, setTaxProfileLoaded] = useState(false);
  const [taxProfileSaving, setTaxProfileSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamSupplierDataSource>('idle');

  const refresh = useCallback(async () => {
    if (!isKolamSupplierRoute(route)) {
      return;
    }

    setLoading(true);
    setError(null);

    const cached = await readKolamVendorListCache();
    if (cached?.value.length) {
      setVendors(cached.value);
      setDataSource('cache');
    }

    try {
      const [liveVendors, liveBrands] = await Promise.all([
        getKolamVendors(),
        getKolamBrands().catch(() => [] as KolamBrand[]),
      ]);
      await writeKolamVendorListCache(liveVendors);
      setVendors(liveVendors);
      setBrands(liveBrands);
      setDataSource('live');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource(cached?.value.length ? 'cache' : 'error');
    } finally {
      setLoading(false);
    }
  }, [route]);

  useEffect(() => {
    setMode(initialMode);
    if (initialMode === 'new') {
      setSelectedVendor(null);
      setForm(createEmptyKolamVendorFormState());
      setPendingPhotoUris([]);
    }
  }, [initialMode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const loadTaxProfile = useCallback(
    async (vendorId: string, vendorName: string) => {
      setTaxProfileLoaded(false);
      setTaxProfile(createEmptyKolamTaxPartyProfileFormState(vendorName));
      try {
        const profile = await getKolamTaxPartyProfile('vendor', vendorId);
        setTaxProfile({
          npwp: profile.npwp,
          npwp16: profile.npwp16,
          legalName: profile.legalName || vendorName,
        });
      } catch {
        setTaxProfile(createEmptyKolamTaxPartyProfileFormState(vendorName));
      } finally {
        setTaxProfileLoaded(true);
      }
    },
    [],
  );

  const loadVendor = useCallback(
    async (
      vendor: KolamVendor,
      nextMode: 'detail' | 'edit' = 'detail',
    ) => {
      setMode(nextMode);
      setSelectedVendor(vendor);
      setForm(createKolamVendorFormState(vendor));
      setPendingPhotoUris([]);
      setAnalyticsFilters({});
      setTaxProfile(createEmptyKolamTaxPartyProfileFormState(vendor.name));
      setTaxProfileLoaded(false);
      setError(null);

      const cached = await readKolamVendorDetailCache(vendor.id);
      if (cached?.value) {
        setSelectedVendor(cached.value);
        setForm(createKolamVendorFormState(cached.value));
        setDataSource('cache');
      }

      try {
        const liveVendor = await getKolamVendor(vendor.id);
        await writeKolamVendorDetailCache(liveVendor);
        setSelectedVendor(liveVendor);
        setForm(createKolamVendorFormState(liveVendor));
        setDataSource('live');
        void loadTaxProfile(liveVendor.id, liveVendor.name);
      } catch (detailError) {
        setError(getErrorMessage(detailError));
        setDataSource(cached?.value || vendor ? 'cache' : 'error');
        void loadTaxProfile(vendor.id, vendor.name);
      }
    },
    [loadTaxProfile],
  );

  const onSelectVendor = useCallback(
    async (vendor: KolamVendor) => {
      await loadVendor(vendor, 'detail');
    },
    [loadVendor],
  );

  useEffect(() => {
    if (mode === 'new' || mode === 'list') {
      return;
    }

    const routeId =
      getKolamSupplierEditRouteId(route) || getKolamSupplierRouteId(route);
    if (!routeId) {
      return;
    }

    if (selectedVendor?.id === routeId) {
      return;
    }

    const preferEdit =
      mode === 'edit' || Boolean(getKolamSupplierEditRouteId(route));

    let active = true;
    void resolveRouteVendor(routeId, vendors).then(vendor => {
      if (active) {
        void loadVendor(vendor, preferEdit ? 'edit' : 'detail');
      }
    });

    return () => {
      active = false;
    };
  }, [loadVendor, mode, route, selectedVendor, vendors]);

  const onBackToList = useCallback(() => {
    setMode('list');
    setSelectedVendor(null);
    setForm(createEmptyKolamVendorFormState());
    setPendingPhotoUris([]);
    setAnalyticsFilters({});
    setTaxProfile(createEmptyKolamTaxPartyProfileFormState());
    setTaxProfileLoaded(false);
    setError(null);
  }, []);

  const onCreateNew = useCallback(() => {
    setMode('new');
    setSelectedVendor(null);
    setForm(createEmptyKolamVendorFormState());
    setPendingPhotoUris([]);
    setAnalyticsFilters({});
    setTaxProfile(createEmptyKolamTaxPartyProfileFormState());
    setTaxProfileLoaded(false);
    setError(null);
  }, []);

  const onEdit = useCallback(() => {
    if (selectedVendor) {
      setMode('edit');
      setForm(createKolamVendorFormState(selectedVendor));
      setPendingPhotoUris([]);
    }
  }, [selectedVendor]);

  const onChangeForm = useCallback((patch: Partial<KolamVendorFormState>) => {
    setForm(current => ({ ...current, ...patch }));
  }, []);

  const onChangeTaxProfile = useCallback(
    (patch: Partial<KolamTaxPartyProfileFormState>) => {
      setTaxProfile(current => ({ ...current, ...patch }));
    },
    [],
  );

  const onSaveTaxProfile = useCallback(async () => {
    const vendorId = selectedVendor?.id;
    if (!vendorId) {
      setError('Pilih pemasok sebelum menyimpan NPWP.');
      return false;
    }

    const npwpDigits = taxProfile.npwp.replace(/\D/g, '');
    const npwp16Digits = taxProfile.npwp16.replace(/\D/g, '');
    if (npwpDigits && npwpDigits.length !== 15) {
      setError('NPWP harus 15 digit.');
      return false;
    }
    if (npwp16Digits && npwp16Digits.length !== 16) {
      setError('NPWP 16 digit harus 16 angka.');
      return false;
    }

    setTaxProfileSaving(true);
    setError(null);

    try {
      const saved = await upsertKolamTaxPartyProfile('vendor', vendorId, {
        npwp: npwpDigits || undefined,
        npwp16: npwp16Digits || undefined,
        legalName: taxProfile.legalName.trim() || undefined,
      });
      setTaxProfile({
        npwp: saved.npwp,
        npwp16: saved.npwp16,
        legalName: saved.legalName || selectedVendor?.name || '',
      });
      setTaxProfileLoaded(true);
      return true;
    } catch (saveError) {
      setError(getErrorMessage(saveError));
      return false;
    } finally {
      setTaxProfileSaving(false);
    }
  }, [selectedVendor, taxProfile]);

  const onChangeAnalyticsFilters = useCallback(
    async (filters: KolamSupplierAnalyticsFilters) => {
      const vendorId = selectedVendor?.id;
      if (!vendorId) {
        setAnalyticsFilters(filters);
        return;
      }

      setAnalyticsFilters(filters);
      setAnalyticsLoading(true);
      setError(null);

      try {
        const liveVendor = await getKolamVendor(vendorId, filters);
        await writeKolamVendorDetailCache(liveVendor);
        setSelectedVendor(liveVendor);
        setDataSource('live');
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      } finally {
        setAnalyticsLoading(false);
      }
    },
    [selectedVendor?.id],
  );

  const onPickPhoto = useCallback(async () => {
    if (pendingPhotoUris.length >= 5) {
      setError('Maksimal 5 foto baru per unggahan.');
      return false;
    }

    try {
      setError(null);
      const picked = await pickNativeImageFile();
      if (picked.cancelled) {
        return false;
      }

      const photoLocalUri = picked.uri ?? picked.path ?? '';
      if (!photoLocalUri) {
        setError('File foto tidak memiliki path yang bisa dibaca.');
        return false;
      }

      setPendingPhotoUris(current =>
        current.length >= 5 ? current : [...current, photoLocalUri],
      );
      return true;
    } catch (pickError) {
      setError(getErrorMessage(pickError));
      return false;
    }
  }, [pendingPhotoUris.length]);

  const onAddPendingPhoto = useCallback((photoLocalUri: string) => {
    const trimmed = photoLocalUri.trim();
    if (!trimmed) {
      return;
    }
    setError(null);
    setPendingPhotoUris(current => {
      if (current.length >= 5 || current.includes(trimmed)) {
        return current;
      }
      return [...current, trimmed];
    });
  }, []);

  const onRemovePendingPhoto = useCallback((index: number) => {
    setPendingPhotoUris(current => current.filter((_, i) => i !== index));
  }, []);

  const applyVendor = useCallback(
    async (vendor: KolamVendor) => {
      await writeKolamVendorDetailCache(vendor);
      setSelectedVendor(vendor);
      setForm(createKolamVendorFormState(vendor));
      setVendors(current => {
        const next = upsertVendor(current, vendor);
        void writeKolamVendorListCache(next);
        return next;
      });
      setDataSource('live');
    },
    [],
  );

  const onDeleteExistingPhoto = useCallback(
    async (index: number) => {
      const vendorId = selectedVendor?.id ?? form.id;
      if (!vendorId) {
        setError('Simpan pemasok dulu sebelum menghapus foto.');
        return false;
      }

      setSaving(true);
      setError(null);

      try {
        const updated = await deleteKolamVendorPhoto(vendorId, index);
        await applyVendor(updated);
        return true;
      } catch (deleteError) {
        setError(getErrorMessage(deleteError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [applyVendor, form.id, selectedVendor],
  );

  const onDeleteVendor = useCallback(
    async (vendor: KolamVendor) => {
      setSaving(true);
      setError(null);

      try {
        await deleteKolamVendor(vendor.id);
        const nextVendors = vendors.filter(item => item.id !== vendor.id);
        await writeKolamVendorListCache(nextVendors);
        await removeKolamVendorDetailCache(vendor.id);
        setVendors(nextVendors);
        setMode('list');
        setSelectedVendor(null);
        setForm(createEmptyKolamVendorFormState());
        setPendingPhotoUris([]);
        setDataSource('live');
        return true;
      } catch (deleteError) {
        setError(getErrorMessage(deleteError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [vendors],
  );

  const onSave = useCallback(async () => {
    if (!form.name.trim()) {
      setError('Nama pemasok wajib diisi.');
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      let savedVendor =
        mode === 'new'
          ? await createKolamVendor(form)
          : await updateKolamVendor(
              selectedVendor?.id ?? form.id ?? '',
              form,
            );

      if (!savedVendor.id) {
        throw new Error('Respons simpan pemasok tidak valid.');
      }

      if (pendingPhotoUris.length) {
        savedVendor = await uploadKolamVendorPhotos(
          savedVendor.id,
          pendingPhotoUris,
        );
      }

      setPendingPhotoUris([]);
      await applyVendor(savedVendor);
      setMode('detail');
      return savedVendor.id;
    } catch (saveError) {
      setError(getErrorMessage(saveError));
      return null;
    } finally {
      setSaving(false);
    }
  }, [applyVendor, form, mode, pendingPhotoUris, selectedVendor]);

  const breadcrumbPath = useMemo(
    () => getKolamSupplierBreadcrumbPath(mode, selectedVendor),
    [mode, selectedVendor],
  );

  return {
    analyticsFilters,
    analyticsLoading,
    brands,
    breadcrumbPath,
    dataSource,
    error,
    form,
    isEditable: mode === 'edit' || mode === 'new',
    loading,
    mode,
    pendingPhotoUris,
    saving,
    selectedVendor,
    taxProfile,
    taxProfileLoaded,
    taxProfileSaving,
    vendors,
    onBackToList,
    onAddPendingPhoto,
    onChangeAnalyticsFilters,
    onChangeForm,
    onChangeTaxProfile,
    onCreateNew,
    onDeleteExistingPhoto,
    onDeleteVendor,
    onEdit,
    onPickPhoto,
    onRefresh: refresh,
    onRemovePendingPhoto,
    onSave,
    onSaveTaxProfile,
    onSelectVendor,
  };
}

function getInitialMode(route: string): KolamSupplierSurfaceMode {
  if (!isKolamSupplierRoute(route)) {
    return 'list';
  }
  if (isKolamSupplierCreateRoute(route)) {
    return 'new';
  }
  if (getKolamSupplierEditRouteId(route)) {
    return 'edit';
  }
  if (isKolamSupplierListRoute(route)) {
    return 'list';
  }
  return 'detail';
}

async function resolveRouteVendor(routeId: string, vendors: KolamVendor[]) {
  const fromList = vendors.find(vendor => vendor.id === routeId);
  if (fromList) {
    return fromList;
  }

  const cachedDetail = await readKolamVendorDetailCache(routeId);
  if (cachedDetail?.value) {
    return cachedDetail.value;
  }

  const cachedListItem = await readKolamVendorFromListCacheById(routeId);
  if (cachedListItem) {
    return cachedListItem;
  }

  return {
    id: routeId,
    name: 'Memuat pemasok…',
    email: '',
    phone: '',
    status: 'active',
    isOfficialDistributor: false,
    description: '',
    address: '',
    province: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    bankName: '',
    bankAccountNumber: '',
    links: [],
    photos: [],
    photoUrls: [],
    brands: [],
    products: [],
    species: [],
    packings: [],
    purchaseStatistics: null,
    warrantyContactNote: '',
    poCount: 0,
    productCount: 0,
    speciesCount: 0,
    packingCount: 0,
    createdAt: '',
    updatedAt: '',
    createdByName: '',
  } satisfies KolamVendor;
}

function upsertVendor(vendors: KolamVendor[], vendor: KolamVendor) {
  const index = vendors.findIndex(item => item.id === vendor.id);
  if (index < 0) {
    return [vendor, ...vendors];
  }
  const next = [...vendors];
  next[index] = vendor;
  return next;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return 'Gagal memuat data pemasok';
}
