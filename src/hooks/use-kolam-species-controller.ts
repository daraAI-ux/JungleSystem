import { useCallback, useEffect, useMemo, useState } from 'react';
import type { KolamCategory } from '../domain/kolam-category';
import type { KolamIucnStatus } from '../domain/kolam-iucn-status';
import type { KolamTag } from '../domain/kolam-tag';
import {
  createEmptyKolamSpeciesFormState,
  createKolamSpeciesFormState,
  getKolamSpeciesBreadcrumbPath,
  isKolamSpeciesRoute,
  slugifySpeciesName,
  type KolamSpecies,
  type KolamSpeciesFormState,
} from '../domain/kolam-species';
import type { KolamTaxonomy } from '../domain/kolam-taxonomy';
import type { KolamUnit } from '../domain/kolam-unit';
import type { KolamVendor } from '../domain/kolam-vendor';
import { getKolamCategories } from '../services/kolam-category-api';
import { getKolamIucnStatuses } from '../services/kolam-iucn-status-api';
import {
  createKolamSpecies,
  deleteKolamSpeciesPhoto,
  deleteKolamSpeciesThumbnail,
  deleteKolamSpeciesVideo,
  deleteKolamSpeciesVoice,
  getKolamSpecies,
  getKolamSpeciesList,
  reorderKolamSpeciesMedia,
  updateKolamSpecies,
  uploadKolamSpeciesPhoto,
  uploadKolamSpeciesThumbnail,
  uploadKolamSpeciesVideo,
  uploadKolamSpeciesVoice,
} from '../services/kolam-species-api';
import {
  readKolamSpeciesDetailCache,
  readKolamSpeciesFromListCacheByRouteKey,
  readKolamSpeciesListCache,
  writeKolamSpeciesDetailCache,
  writeKolamSpeciesListCache,
} from '../services/kolam-species-local-cache';
import { getKolamTags } from '../services/kolam-tag-api';
import {
  readKolamTagListCache,
  writeKolamTagListCache,
} from '../services/kolam-tag-local-cache';
import { getKolamTaxonomies } from '../services/kolam-taxonomy-api';
import { getKolamUnits } from '../services/kolam-unit-api';
import { getKolamVendors } from '../services/kolam-vendor-api';
import {
  readKolamVendorListCache,
  writeKolamVendorListCache,
} from '../services/kolam-vendor-local-cache';
import {
  pickNativeAudioFile,
  pickNativeImageFile,
  pickNativeVideoFile,
} from '../services/native-file-picker';

export type KolamSpeciesSurfaceMode = 'list' | 'detail' | 'edit' | 'new';
export type KolamSpeciesDataSource = 'idle' | 'cache' | 'live' | 'error';

export interface KolamSpeciesController {
  breadcrumbPath: string;
  categories: KolamCategory[];
  dataSource: KolamSpeciesDataSource;
  error: string | null;
  form: KolamSpeciesFormState;
  iucnStatuses: KolamIucnStatus[];
  isEditable: boolean;
  loading: boolean;
  mode: KolamSpeciesSurfaceMode;
  saving: boolean;
  selectedSpecies: KolamSpecies | null;
  species: KolamSpecies[];
  tags: KolamTag[];
  taxonomies: KolamTaxonomy[];
  units: KolamUnit[];
  vendors: KolamVendor[];
  onBackToList: () => void;
  onChangeForm: (patch: Partial<KolamSpeciesFormState>) => void;
  onCreateNew: () => void;
  onDeletePhoto: (index: number) => Promise<boolean>;
  onDeleteThumbnail: () => Promise<boolean>;
  onDeleteVariantPhoto: (variantId: string, index: number) => Promise<boolean>;
  onDeleteVariantVideo: (variantId: string, index: number) => Promise<boolean>;
  onDeleteVideo: (index: number) => Promise<boolean>;
  onDeleteVoice: () => Promise<boolean>;
  onEdit: () => void;
  onPickPhoto: () => Promise<void>;
  onPickVariantPhoto: () => Promise<void>;
  onPickVariantVideo: () => Promise<void>;
  onPickVideo: () => Promise<void>;
  onPickVoice: () => Promise<void>;
  onPickThumbnail: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onReorderPhoto: (index: number, direction: 'up' | 'down') => Promise<boolean>;
  onReorderVariantPhoto: (variantId: string, index: number, direction: 'up' | 'down') => Promise<boolean>;
  onReorderVariantVideo: (variantId: string, index: number, direction: 'up' | 'down') => Promise<boolean>;
  onReorderVideo: (index: number, direction: 'up' | 'down') => Promise<boolean>;
  onSave: () => Promise<void>;
  onSelectSpecies: (species: KolamSpecies, nextMode?: KolamSpeciesSurfaceMode) => Promise<void>;
}

export function useKolamSpeciesController(
  route: string,
): KolamSpeciesController {
  const initialMode = getInitialMode(route);
  const [species, setSpecies] = useState<KolamSpecies[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<KolamSpecies | null>(
    null,
  );
  const [mode, setMode] = useState<KolamSpeciesSurfaceMode>(initialMode);
  const [form, setForm] = useState<KolamSpeciesFormState>(() =>
    createEmptyKolamSpeciesFormState(),
  );
  const [categories, setCategories] = useState<KolamCategory[]>([]);
  const [taxonomies, setTaxonomies] = useState<KolamTaxonomy[]>([]);
  const [units, setUnits] = useState<KolamUnit[]>([]);
  const [vendors, setVendors] = useState<KolamVendor[]>([]);
  const [iucnStatuses, setIucnStatuses] = useState<KolamIucnStatus[]>([]);
  const [tags, setTags] = useState<KolamTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<KolamSpeciesDataSource>('idle');

  const refreshOptions = useCallback(async () => {
    const cachedTags = await readKolamTagListCache();
    if (cachedTags?.value.length) {
      setTags(cachedTags.value);
    }

    const cachedVendors = await readKolamVendorListCache();
    if (cachedVendors?.value.length) {
      setVendors(cachedVendors.value);
    }

    const [
      categoryResult,
      taxonomyResult,
      unitResult,
      iucnResult,
      tagResult,
      vendorResult,
    ] = await Promise.allSettled([
      getKolamCategories(),
      getKolamTaxonomies({ level: 'Genus', limit: 1000 }),
      getKolamUnits(),
      getKolamIucnStatuses({ limit: 1000 }),
      getKolamTags(),
      getKolamVendors(),
    ]);

    if (categoryResult.status === 'fulfilled') {
      setCategories(flattenCategories(categoryResult.value));
    }
    if (taxonomyResult.status === 'fulfilled') {
      setTaxonomies(taxonomyResult.value);
    }
    if (unitResult.status === 'fulfilled') {
      setUnits(unitResult.value);
    }
    if (iucnResult.status === 'fulfilled') {
      setIucnStatuses(iucnResult.value);
    }
    if (tagResult.status === 'fulfilled') {
      setTags(tagResult.value);
      await writeKolamTagListCache(tagResult.value);
    }
    if (vendorResult.status === 'fulfilled') {
      setVendors(vendorResult.value);
      await writeKolamVendorListCache(vendorResult.value);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!isKolamSpeciesRoute(route)) {
      return;
    }

    setLoading(true);
    setError(null);

    const cached = await readKolamSpeciesListCache();
    if (cached?.value.length) {
      setSpecies(cached.value);
      setDataSource('cache');
    }

    try {
      await refreshOptions();
      const liveSpecies = await getKolamSpeciesList({ limit: 1000 });
      await writeKolamSpeciesListCache(liveSpecies);
      setSpecies(liveSpecies);
      setDataSource('live');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource(cached?.value.length ? 'cache' : 'error');
    } finally {
      setLoading(false);
    }
  }, [refreshOptions, route]);

  useEffect(() => {
    setMode(initialMode);
    if (initialMode === 'new') {
      setSelectedSpecies(null);
      setForm(createEmptyKolamSpeciesFormState());
    }
    if (initialMode === 'list') {
      setSelectedSpecies(null);
    }
  }, [initialMode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onSelectSpecies = useCallback(
    async (item: KolamSpecies, nextMode: KolamSpeciesSurfaceMode = 'detail') => {
      setMode(nextMode);
      setSelectedSpecies(item);
      setForm(createKolamSpeciesFormState(item));
      setError(null);

      const cached = await readKolamSpeciesDetailCache(item.id);
      if (cached?.value) {
        setSelectedSpecies(cached.value);
        setForm(createKolamSpeciesFormState(cached.value));
        setDataSource('cache');
      }

      try {
        const liveSpecies = await getKolamSpecies(item.id);
        await writeKolamSpeciesDetailCache(liveSpecies);
        setSelectedSpecies(liveSpecies);
        setForm(createKolamSpeciesFormState(liveSpecies));
        setDataSource('live');
      } catch (detailError) {
        setError(getErrorMessage(detailError));
        setDataSource(cached?.value || item ? 'cache' : 'error');
      }
    },
    [],
  );

  useEffect(() => {
    const routeSpeciesKey = getRouteSpeciesKey(route);
    if (!routeSpeciesKey || mode === 'list' || mode === 'new') {
      return;
    }

    if (
      selectedSpecies &&
      speciesMatchesRouteKey(selectedSpecies, routeSpeciesKey)
    ) {
      return;
    }

    let active = true;
    void resolveRouteSpecies(routeSpeciesKey, species).then(item => {
      if (active && item) {
        void onSelectSpecies(item, initialMode === 'edit' ? 'edit' : 'detail');
      }
    });

    return () => {
      active = false;
    };
  }, [initialMode, mode, onSelectSpecies, route, selectedSpecies, species]);

  const onBackToList = useCallback(() => {
    setMode('list');
    setSelectedSpecies(null);
    setForm(createEmptyKolamSpeciesFormState());
  }, []);

  const onCreateNew = useCallback(() => {
    setMode('new');
    setSelectedSpecies(null);
    setForm(createEmptyKolamSpeciesFormState());
    setError(null);
    void refreshOptions();
  }, [refreshOptions]);

  const onEdit = useCallback(() => {
    if (!selectedSpecies) {
      return;
    }

    setMode('edit');
    setForm(createKolamSpeciesFormState(selectedSpecies));
    setError(null);
    void refreshOptions();
  }, [refreshOptions, selectedSpecies]);

  const onChangeForm = useCallback((patch: Partial<KolamSpeciesFormState>) => {
    setForm(current => ({ ...current, ...patch }));
  }, []);

  const applyLiveSpecies = useCallback(
    async (next: KolamSpecies) => {
      await writeKolamSpeciesDetailCache(next);
      const nextSpecies = upsertSpecies(species, next);
      await writeKolamSpeciesListCache(nextSpecies);
      setSpecies(nextSpecies);
      setSelectedSpecies(next);
      setForm(createKolamSpeciesFormState(next));
      setDataSource('live');
    },
    [species],
  );

  const onDeleteThumbnail = useCallback(async () => {
    const item = selectedSpecies;
    if (!item) {
      return false;
    }

    setSaving(true);
    setError(null);
    try {
      const next = await deleteKolamSpeciesThumbnail(item.id);
      await applyLiveSpecies(next);
      return true;
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
      return false;
    } finally {
      setSaving(false);
    }
  }, [applyLiveSpecies, selectedSpecies]);

  const onDeletePhoto = useCallback(
    async (index: number) => {
      const item = selectedSpecies;
      if (!item) {
        return false;
      }

      setSaving(true);
      setError(null);
      try {
        const next = await deleteKolamSpeciesPhoto(item.id, index);
        await applyLiveSpecies(next);
        return true;
      } catch (deleteError) {
        setError(getErrorMessage(deleteError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [applyLiveSpecies, selectedSpecies],
  );
  const onDeleteVideo = useCallback(
    async (index: number) => {
      const item = selectedSpecies;
      if (!item) {
        return false;
      }

      setSaving(true);
      setError(null);
      try {
        const next = await deleteKolamSpeciesVideo(item.id, index);
        await applyLiveSpecies(next);
        return true;
      } catch (deleteError) {
        setError(getErrorMessage(deleteError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [applyLiveSpecies, selectedSpecies],
  );

  const onDeleteVoice = useCallback(async () => {
    const item = selectedSpecies;
    if (!item) {
      return false;
    }

    setSaving(true);
    setError(null);
    try {
      const next = await deleteKolamSpeciesVoice(item.id);
      await applyLiveSpecies(next);
      return true;
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
      return false;
    } finally {
      setSaving(false);
    }
  }, [applyLiveSpecies, selectedSpecies]);

  const onDeleteVariantPhoto = useCallback(
    async (variantId: string, index: number) => {
      const item = selectedSpecies;
      if (!item) {
        return false;
      }

      setSaving(true);
      setError(null);
      try {
        const next = await deleteKolamSpeciesPhoto(item.id, index, variantId);
        await applyLiveSpecies(next);
        return true;
      } catch (deleteError) {
        setError(getErrorMessage(deleteError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [applyLiveSpecies, selectedSpecies],
  );

  const onDeleteVariantVideo = useCallback(
    async (variantId: string, index: number) => {
      const item = selectedSpecies;
      if (!item) {
        return false;
      }

      setSaving(true);
      setError(null);
      try {
        const next = await deleteKolamSpeciesVideo(item.id, index, variantId);
        await applyLiveSpecies(next);
        return true;
      } catch (deleteError) {
        setError(getErrorMessage(deleteError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [applyLiveSpecies, selectedSpecies],
  );

  const onReorderPhoto = useCallback(
    async (index: number, direction: 'up' | 'down') => {
      const item = selectedSpecies;
      if (!item) {
        return false;
      }

      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= item.photoUris.length) {
        return false;
      }

      const photos = [...item.photoUris];
      const moved = photos[index];
      photos[index] = photos[nextIndex];
      photos[nextIndex] = moved;

      setSaving(true);
      setError(null);
      try {
        const next = await reorderKolamSpeciesMedia(item.id, { photos });
        await applyLiveSpecies(next);
        return true;
      } catch (reorderError) {
        setError(getErrorMessage(reorderError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [applyLiveSpecies, selectedSpecies],
  );

  const onReorderVideo = useCallback(
    async (index: number, direction: 'up' | 'down') => {
      const item = selectedSpecies;
      if (!item) {
        return false;
      }

      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= item.videoUris.length) {
        return false;
      }

      const videos = [...item.videoUris];
      const moved = videos[index];
      videos[index] = videos[nextIndex];
      videos[nextIndex] = moved;

      setSaving(true);
      setError(null);
      try {
        const next = await reorderKolamSpeciesMedia(item.id, { videos });
        await applyLiveSpecies(next);
        return true;
      } catch (reorderError) {
        setError(getErrorMessage(reorderError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [applyLiveSpecies, selectedSpecies],
  );
  const onReorderVariantPhoto = useCallback(
    async (variantId: string, index: number, direction: 'up' | 'down') => {
      const item = selectedSpecies;
      const variant = item?.variants.find(candidate => candidate.id === variantId);
      if (!item || !variant) {
        return false;
      }

      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= variant.photoUris.length) {
        return false;
      }

      const photos = [...variant.photoUris];
      const moved = photos[index];
      photos[index] = photos[nextIndex];
      photos[nextIndex] = moved;

      setSaving(true);
      setError(null);
      try {
        const next = await reorderKolamSpeciesMedia(item.id, { photos, variant: variantId });
        await applyLiveSpecies(next);
        return true;
      } catch (reorderError) {
        setError(getErrorMessage(reorderError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [applyLiveSpecies, selectedSpecies],
  );

  const onReorderVariantVideo = useCallback(
    async (variantId: string, index: number, direction: 'up' | 'down') => {
      const item = selectedSpecies;
      const variant = item?.variants.find(candidate => candidate.id === variantId);
      if (!item || !variant) {
        return false;
      }

      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= variant.videoUris.length) {
        return false;
      }

      const videos = [...variant.videoUris];
      const moved = videos[index];
      videos[index] = videos[nextIndex];
      videos[nextIndex] = moved;

      setSaving(true);
      setError(null);
      try {
        const next = await reorderKolamSpeciesMedia(item.id, { videos, variant: variantId });
        await applyLiveSpecies(next);
        return true;
      } catch (reorderError) {
        setError(getErrorMessage(reorderError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [applyLiveSpecies, selectedSpecies],
  );
  const onPickThumbnail = useCallback(async () => {
    try {
      setError(null);
      const picked = await pickNativeImageFile();
      if (picked.cancelled) {
        return;
      }

      const thumbnailLocalUri = picked.uri ?? picked.path ?? '';
      if (!thumbnailLocalUri) {
        setError('File thumbnail tidak memiliki path yang bisa dibaca.');
        return;
      }

      setForm(current => ({ ...current, thumbnailLocalUri }));
    } catch (pickError) {
      setError(getErrorMessage(pickError));
    }
  }, []);

  const onPickPhoto = useCallback(async () => {
    try {
      setError(null);
      const picked = await pickNativeImageFile();
      if (picked.cancelled) {
        return;
      }

      const photoLocalUri = picked.uri ?? picked.path ?? '';
      if (!photoLocalUri) {
        setError('File foto tidak memiliki path yang bisa dibaca.');
        return;
      }

      setForm(current => ({ ...current, photoLocalUri }));
    } catch (pickError) {
      setError(getErrorMessage(pickError));
    }
  }, []);
  const onPickVideo = useCallback(async () => {
    try {
      setError(null);
      const picked = await pickNativeVideoFile();
      if (picked.cancelled) return;
      const videoLocalUri = picked.uri ?? picked.path ?? '';
      if (!videoLocalUri) {
        setError('File video tidak memiliki path yang bisa dibaca.');
        return;
      }
      setForm(current => ({ ...current, videoLocalUri }));
    } catch (pickError) {
      setError(getErrorMessage(pickError));
    }
  }, []);

  const onPickVoice = useCallback(async () => {
    try {
      setError(null);
      const picked = await pickNativeAudioFile();
      if (picked.cancelled) return;
      const voiceLocalUri = picked.uri ?? picked.path ?? '';
      if (!voiceLocalUri) {
        setError('File voice tidak memiliki path yang bisa dibaca.');
        return;
      }
      setForm(current => ({ ...current, voiceLocalUri }));
    } catch (pickError) {
      setError(getErrorMessage(pickError));
    }
  }, []);

  const onPickVariantPhoto = useCallback(async () => {
    try {
      setError(null);
      const picked = await pickNativeImageFile();
      if (picked.cancelled) return;
      const variantPhotoLocalUri = picked.uri ?? picked.path ?? '';
      if (!variantPhotoLocalUri) {
        setError('File foto varian tidak memiliki path yang bisa dibaca.');
        return;
      }
      setForm(current => ({ ...current, variantPhotoLocalUri }));
    } catch (pickError) {
      setError(getErrorMessage(pickError));
    }
  }, []);

  const onPickVariantVideo = useCallback(async () => {
    try {
      setError(null);
      const picked = await pickNativeVideoFile();
      if (picked.cancelled) return;
      const variantVideoLocalUri = picked.uri ?? picked.path ?? '';
      if (!variantVideoLocalUri) {
        setError('File video varian tidak memiliki path yang bisa dibaca.');
        return;
      }
      setForm(current => ({ ...current, variantVideoLocalUri }));
    } catch (pickError) {
      setError(getErrorMessage(pickError));
    }
  }, []);
  const onSave = useCallback(async () => {
    if (!form.scientificName.trim()) {
      setError('Nama ilmiah wajib diisi.');
      return;
    }

    if (!form.taxonomyId.trim()) {
      setError('Taksonomi Genus wajib dipilih.');
      return;
    }

    if (!form.categoryIds.length) {
      setError('Minimal satu kategori wajib dipilih.');
      return;
    }

    if (form.sellable && !form.unitId.trim()) {
      setError('Satuan wajib dipilih untuk spesies yang dijual.');
      return;
    }

    if (form.variantsTouched) {
      const missingTier1 = form.variants.findIndex(
        variant => !variant.tier1Value.trim(),
      );
      if (missingTier1 >= 0) {
        setError(`Varian ${missingTier1 + 1} wajib memiliki nilai varian utama.`);
        return;
      }

      if (form.variantConfigTier2Name.trim()) {
        const missingTier2 = form.variants.findIndex(
          variant => !variant.tier2Value.trim(),
        );
        if (missingTier2 >= 0) {
          setError(`Varian ${missingTier2 + 1} wajib memiliki nilai varian kedua.`);
          return;
        }
      }
    }

    setSaving(true);
    setError(null);

    try {
      const savedSpecies =
        mode === 'new'
          ? await createKolamSpecies(form)
          : await updateKolamSpecies(
              selectedSpecies?.id ?? form.id ?? slugifySpeciesName(form.scientificName),
              form,
            );

      await writeKolamSpeciesDetailCache(savedSpecies);
      const syncedSpecies = await syncSpeciesMediaIfNeeded(savedSpecies, form);
      const nextSpecies = upsertSpecies(species, syncedSpecies);
      await writeKolamSpeciesListCache(nextSpecies);
      setSpecies(nextSpecies);
      setSelectedSpecies(syncedSpecies);
      setForm(createKolamSpeciesFormState(syncedSpecies));
      setMode('detail');
      setDataSource('live');
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }, [form, mode, selectedSpecies, species]);

  const breadcrumbPath = useMemo(
    () => getKolamSpeciesBreadcrumbPath(mode, selectedSpecies),
    [mode, selectedSpecies],
  );

  return {
    breadcrumbPath,
    categories,
    dataSource,
    error,
    form,
    iucnStatuses,
    isEditable: mode === 'edit' || mode === 'new',
    loading,
    mode,
    saving,
    selectedSpecies,
    species,
    tags,
    taxonomies,
    units,
    vendors,
    onBackToList,
    onChangeForm,
    onCreateNew,
    onDeletePhoto,
    onDeleteThumbnail,
    onDeleteVariantPhoto,
    onDeleteVariantVideo,
    onDeleteVideo,
    onDeleteVoice,
    onEdit,
    onPickPhoto,
    onPickThumbnail,
    onPickVariantPhoto,
    onPickVariantVideo,
    onPickVideo,
    onPickVoice,
    onRefresh: refresh,
    onReorderPhoto,
    onReorderVariantPhoto,
    onReorderVariantVideo,
    onReorderVideo,
    onSave,
    onSelectSpecies,
  };
}

async function syncSpeciesMediaIfNeeded(
  species: KolamSpecies,
  form: KolamSpeciesFormState,
) {
  let current = species;

  if (form.thumbnailLocalUri.trim()) {
    current = await uploadKolamSpeciesThumbnail(
      current.id,
      form.thumbnailLocalUri.trim(),
    );
  }

  if (form.photoLocalUri.trim()) {
    current = await uploadKolamSpeciesPhoto(current.id, form.photoLocalUri.trim());
  }

  if (form.videoLocalUri.trim()) {
    current = await uploadKolamSpeciesVideo(current.id, form.videoLocalUri.trim());
  }

  if (form.voiceLocalUri.trim()) {
    current = await uploadKolamSpeciesVoice(current.id, form.voiceLocalUri.trim());
  }

  if (form.selectedVariantId.trim() && form.variantPhotoLocalUri.trim()) {
    current = await uploadKolamSpeciesPhoto(
      current.id,
      form.variantPhotoLocalUri.trim(),
      form.selectedVariantId.trim(),
    );
  }

  if (form.selectedVariantId.trim() && form.variantVideoLocalUri.trim()) {
    current = await uploadKolamSpeciesVideo(
      current.id,
      form.variantVideoLocalUri.trim(),
      form.selectedVariantId.trim(),
    );
  }

  await writeKolamSpeciesDetailCache(current);
  return current;
}
function getInitialMode(route: string): KolamSpeciesSurfaceMode {
  const cleanRoute = route.split('?')[0];
  if (cleanRoute === '/species/baru' || cleanRoute === '/species/create') {
    return 'new';
  }

  if (cleanRoute.endsWith('/edit')) {
    return 'edit';
  }

  const routeKey = getRouteSpeciesKey(route);
  return routeKey ? 'detail' : 'list';
}

function getRouteSpeciesKey(route: string) {
  const cleanRoute = route.split('?')[0];
  const parts = cleanRoute.split('/').filter(Boolean);

  if (parts[0] !== 'species' || parts.length < 2) {
    return null;
  }

  if (parts[1] === 'baru' || parts[1] === 'create') {
    return null;
  }

  return decodeURIComponent(parts[1]);
}

async function resolveRouteSpecies(
  routeKey: string,
  currentSpecies: KolamSpecies[],
) {
  const direct =
    currentSpecies.find(item => speciesMatchesRouteKey(item, routeKey)) ??
    (await readKolamSpeciesFromListCacheByRouteKey(routeKey));

  if (direct) {
    return direct;
  }

  try {
    return await getKolamSpecies(routeKey);
  } catch {
    return null;
  }
}

function speciesMatchesRouteKey(item: KolamSpecies, routeKey: string) {
  const key = routeKey.toLowerCase();
  return (
    item.id.toLowerCase() === key ||
    item.slug.toLowerCase() === key ||
    item.scientificName.toLowerCase() === key ||
    item.displayName.toLowerCase() === key
  );
}

function upsertSpecies(items: KolamSpecies[], species: KolamSpecies) {
  const exists = items.some(item => item.id === species.id);
  if (!exists) {
    return [species, ...items];
  }

  return items.map(item => (item.id === species.id ? species : item));
}

function flattenCategories(categories: KolamCategory[]): KolamCategory[] {
  return categories.flatMap(category => [
    category,
    ...flattenCategories(category.children ?? []),
  ]);
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message);
  }

  return 'Gagal memuat data spesies.';
}







