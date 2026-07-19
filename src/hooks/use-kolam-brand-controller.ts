import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createEmptyKolamBrandFormState,
  createKolamBrandFormState,
  createKolamBrandLogoDraft,
  getKolamBrandBreadcrumbPath,
  isKolamBrandRoute,
  shouldSyncKolamBrandLogo,
  slugifyBrandName,
  type KolamBrand,
  type KolamBrandFormState,
  type KolamBrandLogoDraft,
} from '../domain/kolam-brand';
import {
  createKolamBrand,
  deleteKolamBrand,
  getKolamBrand,
  getKolamBrands,
  updateKolamBrand,
  uploadKolamBrandLogo,
} from '../services/kolam-brand-api';
import {
  readKolamBrandDetailCache,
  readKolamBrandFromListCacheByRouteKey,
  readKolamBrandListCache,
  readKolamBrandLogoDraft,
  removeKolamBrandDetailCache,
  writeKolamBrandDetailCache,
  writeKolamBrandListCache,
  writeKolamBrandLogoDraft,
} from '../services/kolam-brand-local-cache';
import { syncKolamImageCacheBatch } from '../services/kolam-image-local-cache';
import { pickNativeImageFile } from '../services/native-file-picker';

export type KolamBrandSurfaceMode = 'list' | 'detail' | 'edit' | 'new';
export type KolamBrandDataSource = 'idle' | 'cache' | 'live' | 'error';

export interface KolamBrandController {
  brands: KolamBrand[];
  breadcrumbPath: string;
  dataSource: KolamBrandDataSource;
  error: string | null;
  form: KolamBrandFormState;
  loading: boolean;
  logoDraft: KolamBrandLogoDraft | null;
  mode: KolamBrandSurfaceMode;
  saving: boolean;
  selectedBrand: KolamBrand | null;
  isEditable: boolean;
  onBackToList: () => void;
  onChangeForm: (patch: Partial<KolamBrandFormState>) => void;
  onCreateNew: () => void;
  onDeleteBrand: (brand: KolamBrand) => Promise<boolean>;
  onEdit: () => void;
  onPickLogo: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onSave: () => Promise<void>;
  onSelectBrand: (brand: KolamBrand) => Promise<void>;
}

export function useKolamBrandController(route: string): KolamBrandController {
  const initialMode = getInitialMode(route);
  const [brands, setBrands] = useState<KolamBrand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<KolamBrand | null>(null);
  const [mode, setMode] = useState<KolamBrandSurfaceMode>(initialMode);
  const [form, setForm] = useState<KolamBrandFormState>(() =>
    createEmptyKolamBrandFormState(),
  );
  const [logoDraft, setLogoDraft] = useState<KolamBrandLogoDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<KolamBrandDataSource>('idle');

  const refresh = useCallback(async () => {
    if (!isKolamBrandRoute(route)) {
      return;
    }

    setLoading(true);
    setError(null);

    const cached = await readKolamBrandListCache();
    if (cached?.value.length) {
      setBrands(cached.value);
      setDataSource('cache');
    }

    try {
      const liveBrands = await getKolamBrands();
      await writeKolamBrandListCache(liveBrands);
      setBrands(liveBrands);
      setDataSource('live');
      void syncBrandLogoAssets(liveBrands);
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
      setSelectedBrand(null);
      setForm(createEmptyKolamBrandFormState());
      setLogoDraft(null);
    }
  }, [initialMode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onSelectBrand = useCallback(async (brand: KolamBrand) => {
    setMode('detail');
    setSelectedBrand(brand);
    setForm(createKolamBrandFormState(brand));
    setLogoDraft(null);
    setError(null);

    const cached = await readKolamBrandDetailCache(brand.id);
    if (cached?.value) {
      setSelectedBrand(cached.value);
      setForm(createKolamBrandFormState(cached.value));
      setDataSource('cache');
    }

    try {
      const liveBrand = await getKolamBrand(brand.id);
      await writeKolamBrandDetailCache(liveBrand);
      const draft = await readKolamBrandLogoDraft(liveBrand.id);
      setSelectedBrand(liveBrand);
      setForm(createKolamBrandFormState(liveBrand));
      setLogoDraft(draft?.value ?? null);
      setDataSource('live');
      void syncBrandLogoAssets([liveBrand]);
    } catch (detailError) {
      setError(getErrorMessage(detailError));
      setDataSource(cached?.value || brand ? 'cache' : 'error');
    }
  }, []);

  useEffect(() => {
    const routeBrandKey = getRouteBrandKey(route);
    if (!routeBrandKey || mode === 'new') {
      return;
    }

    if (selectedBrand && brandMatchesRouteKey(selectedBrand, routeBrandKey)) {
      return;
    }

    let active = true;
    void resolveRouteBrand(routeBrandKey, brands).then(routeBrand => {
      if (active) {
        void onSelectBrand(routeBrand);
      }
    });

    return () => {
      active = false;
    };
  }, [brands, mode, onSelectBrand, route, selectedBrand]);

  const onBackToList = useCallback(() => {
    setMode('list');
    setSelectedBrand(null);
    setForm(createEmptyKolamBrandFormState());
    setLogoDraft(null);
  }, []);

  const onCreateNew = useCallback(() => {
    setMode('new');
    setSelectedBrand(null);
    setForm(createEmptyKolamBrandFormState());
    setLogoDraft(null);
    setError(null);
  }, []);

  const onEdit = useCallback(() => {
    if (selectedBrand) {
      setMode('edit');
    }
  }, [selectedBrand]);

  const onDeleteBrand = useCallback(
    async (brand: KolamBrand) => {
      setSaving(true);
      setError(null);

      try {
        await deleteKolamBrand(brand.id);
        const nextBrands = brands.filter(item => item.id !== brand.id);
        await writeKolamBrandListCache(nextBrands);
        await removeKolamBrandDetailCache(brand.id);
        setBrands(nextBrands);
        setMode('list');
        setSelectedBrand(null);
        setForm(createEmptyKolamBrandFormState());
        setLogoDraft(null);
        setDataSource('live');
        return true;
      } catch (deleteError) {
        setError(getErrorMessage(deleteError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [brands],
  );

  const onChangeForm = useCallback((patch: Partial<KolamBrandFormState>) => {
    setForm(current => ({ ...current, ...patch }));
  }, []);

  const onPickLogo = useCallback(async () => {
    try {
      setError(null);
      const picked = await pickNativeImageFile();
      if (picked.cancelled) {
        return;
      }

      const logoLocalUri = picked.uri ?? picked.path ?? '';
      if (!logoLocalUri) {
        setError('File logo tidak memiliki path yang bisa dibaca.');
        return;
      }

      setForm(current => ({ ...current, logoLocalUri }));
    } catch (pickError) {
      setError(getErrorMessage(pickError));
    }
  }, []);

  const onSave = useCallback(async () => {
    if (!form.name.trim()) {
      setError('Nama merek wajib diisi.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const savedBrand =
        mode === 'new'
          ? await createKolamBrand(form)
          : await updateKolamBrand(
              selectedBrand?.id ?? form.id ?? slugifyBrandName(form.name),
              form,
            );
      const syncedBrand = await syncLogoIfNeeded(
        savedBrand,
        form,
        setLogoDraft,
      );

      await writeKolamBrandDetailCache(syncedBrand);
      setSelectedBrand(syncedBrand);
      setForm(createKolamBrandFormState(syncedBrand));
      setMode('detail');
      setBrands(current => upsertBrand(current, syncedBrand));
      await writeKolamBrandListCache(upsertBrand(brands, syncedBrand));
      setDataSource('live');
      void syncBrandLogoAssets([syncedBrand]);
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }, [brands, form, mode, selectedBrand]);

  const breadcrumbPath = useMemo(
    () => getKolamBrandBreadcrumbPath(mode, selectedBrand),
    [mode, selectedBrand],
  );

  return {
    brands,
    breadcrumbPath,
    dataSource,
    error,
    form,
    loading,
    logoDraft,
    mode,
    saving,
    selectedBrand,
    isEditable: mode === 'edit' || mode === 'new',
    onBackToList,
    onChangeForm,
    onCreateNew,
    onDeleteBrand,
    onEdit,
    onPickLogo,
    onRefresh: refresh,
    onSave,
    onSelectBrand,
  };
}

function getInitialMode(route: string): KolamBrandSurfaceMode {
  const routePath = route.split('?')[0];

  if (
    routePath === '/brands/create' ||
    routePath === '/label-dan-field/merek/baru'
  ) {
    return 'new';
  }

  if (routePath.endsWith('/edit') && getRouteBrandKey(routePath)) {
    return 'edit';
  }

  if (getRouteBrandKey(routePath)) {
    return 'detail';
  }

  return 'list';
}

function getRouteBrandKey(route: string) {
  const routePath = route.split('?')[0];
  const oldRoute = routePath.match(/^\/brands\/([^/]+)(?:\/edit)?$/);
  const newRoute = routePath.match(
    /^\/label-dan-field\/merek\/([^/]+)(?:\/edit)?$/,
  );
  const key = oldRoute?.[1] ?? newRoute?.[1];

  if (!key || key === 'create' || key === 'baru') {
    return null;
  }

  return decodeURIComponent(key);
}

function brandMatchesRouteKey(brand: KolamBrand, key: string) {
  const normalizedKey = slugifyBrandName(key);
  const lowerKey = key.toLowerCase();
  const brandSlug = brand.slug || slugifyBrandName(brand.name);

  return (
    brand.id === key ||
    brand.id.toLowerCase() === lowerKey ||
    brand.slug === key ||
    brandSlug === normalizedKey ||
    brand.name.toLowerCase() === lowerKey
  );
}

async function resolveRouteBrand(routeBrandKey: string, brands: KolamBrand[]) {
  return (
    brands.find(brand => brandMatchesRouteKey(brand, routeBrandKey)) ??
    (await readKolamBrandFromListCacheByRouteKey(routeBrandKey)) ??
    createRouteBrandStub(routeBrandKey)
  );
}

function createRouteBrandStub(key: string): KolamBrand {
  return {
    id: key,
    name: key,
    slug: slugifyBrandName(key),
    description: '',
    originCountry: 'Indonesia',
    status: 'active',
    notes: '',
    links: [],
    photos: [],
    logoUrl: null,
    productCount: 0,
    rawMaterialCount: 0,
    serviceCount: 0,
    speciesCount: 0,
    raw: {},
  };
}

async function syncLogoIfNeeded(
  brand: KolamBrand,
  form: KolamBrandFormState,
  setLogoDraft: (draft: KolamBrandLogoDraft | null) => void,
) {
  const localUri = form.logoLocalUri.trim();
  if (!localUri) {
    return brand;
  }

  const previous = await readKolamBrandLogoDraft(brand.id);
  const draft = createKolamBrandLogoDraft({
    brand,
    localUri,
    remoteUrl: form.logoRemoteUrl || brand.logoUrl,
    previous: previous?.value ?? null,
  });

  if (!shouldSyncKolamBrandLogo(draft, brand.logoUrl)) {
    await writeKolamBrandLogoDraft(draft);
    setLogoDraft(draft);
    return brand;
  }

  try {
    const uploadedBrand = await uploadKolamBrandLogo(brand.id, localUri);
    const syncedDraft: KolamBrandLogoDraft = {
      ...draft,
      dirty: false,
      syncState: 'synced',
      remoteUrl: uploadedBrand.logoUrl,
      serverHash: draft.contentHash,
      lastSyncedAt: new Date().toISOString(),
      lastAttemptHash: draft.contentHash,
      updatedAt: new Date().toISOString(),
    };
    await writeKolamBrandLogoDraft(syncedDraft);
    setLogoDraft(syncedDraft);
    return uploadedBrand;
  } catch (error) {
    const failedDraft: KolamBrandLogoDraft = {
      ...draft,
      syncState: 'failed',
      lastAttemptHash: draft.contentHash,
      updatedAt: new Date().toISOString(),
    };
    await writeKolamBrandLogoDraft(failedDraft);
    setLogoDraft(failedDraft);
    throw error;
  }
}

function upsertBrand(brands: KolamBrand[], brand: KolamBrand) {
  const existing = brands.findIndex(item => item.id === brand.id);
  if (existing < 0) {
    return [brand, ...brands];
  }

  return brands.map(item => (item.id === brand.id ? brand : item));
}

function syncBrandLogoAssets(brands: KolamBrand[]) {
  return syncKolamImageCacheBatch({
    scope: 'brand-logo',
    images: brands.map(brand => ({
      sourceUri: brand.logoUrl,
      revision: getBrandLogoImageRevision(brand),
    })),
  }).catch(() => ({ failed: brands.length, synced: 0 }));
}

function getBrandLogoImageRevision(brand: KolamBrand) {
  return [brand.logoUrl ?? '', brand.updatedAt ?? ''].join(':');
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Merek belum bisa dimuat dari backend.';
}
