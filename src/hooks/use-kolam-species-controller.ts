import { useCallback, useEffect, useMemo, useState } from 'react';
import type { KolamCategory } from '../domain/kolam-category';
import type { KolamCustomField } from '../domain/kolam-custom-field';
import type { KolamIucnStatus } from '../domain/kolam-iucn-status';
import type { KolamPackingOption } from '../domain/kolam-packing-option';
import type { KolamProductOption } from '../domain/kolam-product-option';
import type { KolamShippingMethod } from '../domain/kolam-shipping-method';
import type { KolamTag } from '../domain/kolam-tag';
import {
  createKolamSpeciesDetailRevision,
  createEmptyKolamSpeciesFormState,
  createKolamSpeciesFormState,
  getKolamSpeciesBreadcrumbPath,
  isKolamSpeciesRoute,
  slugifySpeciesName,
  type KolamSpecies,
  type KolamSpeciesFormState,
  type KolamSpeciesListResult,
  type KolamSpeciesPagination,
  type KolamSpeciesStockStatus,
} from '../domain/kolam-species';
import type { KolamTaxonomy } from '../domain/kolam-taxonomy';
import type { KolamUnit } from '../domain/kolam-unit';
import type { KolamVendor } from '../domain/kolam-vendor';
import { getKolamCategories } from '../services/kolam-category-api';
import { getKolamCustomFields } from '../services/kolam-custom-field-api';
import {
  readKolamCustomFieldListCache,
  writeKolamCustomFieldListCache,
} from '../services/kolam-custom-field-local-cache';
import { getKolamIucnStatuses } from '../services/kolam-iucn-status-api';
import { getKolamPackingOptions } from '../services/kolam-packing-option-api';
import {
  readKolamPackingOptionListCache,
  writeKolamPackingOptionListCache,
} from '../services/kolam-packing-option-local-cache';
import {
  getKolamProductOptions,
  getKolamRawProductOptions,
} from '../services/kolam-product-option-api';
import {
  readKolamProductOptionListCache,
  readKolamRawProductOptionListCache,
  writeKolamProductOptionListCache,
  writeKolamRawProductOptionListCache,
} from '../services/kolam-product-option-local-cache';
import {
  addKolamSpeciesAttachedItem,
  createKolamSpecies,
  deleteKolamSpecies,
  deleteKolamSpeciesPhoto,
  deleteKolamSpeciesThumbnail,
  deleteKolamSpeciesVideo,
  deleteKolamSpeciesVoice,
  getKolamSpecies,
  getKolamSpeciesList,
  getKolamSpeciesTermsTemplates,
  duplicateKolamSpecies,
  linkKolamSpeciesPackings,
  removeKolamSpeciesAttachedItem,
  reorderKolamSpeciesMedia,
  updateKolamSpecies,
  updateKolamSpeciesPartial,
  updateKolamSpeciesSeo,
  uploadKolamSpeciesPhoto,
  uploadKolamSpeciesThumbnail,
  uploadKolamSpeciesVideo,
  uploadKolamSpeciesVoice,
  type KolamSpeciesAttachedItemPayload,
  type KolamSpeciesTermsTemplate,
} from '../services/kolam-species-api';
import { getKolamActiveShippingMethods } from '../services/kolam-shipping-method-api';
import {
  readKolamShippingMethodListCache,
  writeKolamShippingMethodListCache,
} from '../services/kolam-shipping-method-local-cache';
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
import { syncKolamMarketplacePrice } from '../services/kolam-marketplace-sync-api';
import {
  readKolamMediaManifest,
  summarizeKolamMediaManifest,
  syncKolamMediaManifest,
  type KolamMediaManifestSummary,
} from '../services/kolam-media-manifest-cache';

export type KolamSpeciesSurfaceMode = 'list' | 'detail' | 'edit' | 'new';
export type KolamSpeciesDataSource = 'idle' | 'cache' | 'live' | 'error';

export interface KolamSpeciesListFilters {
  search: string;
  categoryId: string;
  taxonomyId: string;
  stockStatus: KolamSpeciesStockStatus;
  page: number;
  limit: number;
}

export interface KolamSpeciesController {
  breadcrumbPath: string;
  categories: KolamCategory[];
  customFields: KolamCustomField[];
  dataSource: KolamSpeciesDataSource;
  error: string | null;
  filters: KolamSpeciesListFilters;
  form: KolamSpeciesFormState;
  iucnStatuses: KolamIucnStatus[];
  isEditable: boolean;
  loading: boolean;
  mediaManifestSummary: KolamMediaManifestSummary;
  mode: KolamSpeciesSurfaceMode;
  packingOptions: KolamPackingOption[];
  pagination: KolamSpeciesPagination;
  productOptions: KolamProductOption[];
  rawMaterialProducts: KolamProductOption[];
  shippingMethods: KolamShippingMethod[];
  saving: boolean;
  selectedSpecies: KolamSpecies | null;
  species: KolamSpecies[];
  syncPriceMessage: string | null;
  syncingPrice: boolean;
  tags: KolamTag[];
  termsTemplates: KolamSpeciesTermsTemplate[];
  taxonomies: KolamTaxonomy[];
  units: KolamUnit[];
  vendors: KolamVendor[];
  onAddAttachedItem: (body: KolamSpeciesAttachedItemPayload) => Promise<boolean>;
  onApplySpecies: (species: KolamSpecies) => Promise<void>;
  onBackToList: () => void;
  onChangeFilters: (patch: Partial<KolamSpeciesListFilters>) => void;
  onChangeForm: (patch: Partial<KolamSpeciesFormState>) => void;
  onCreateNew: () => void;
  onDeletePhoto: (index: number) => Promise<boolean>;
  onDeleteSpecies: (species: KolamSpecies) => Promise<boolean>;
  onDuplicateSpecies: (species: KolamSpecies) => Promise<boolean>;
  onDeleteThumbnail: () => Promise<boolean>;
  onDeleteVariantPhoto: (variantId: string, index: number) => Promise<boolean>;
  onDeleteVariantVideo: (variantId: string, index: number) => Promise<boolean>;
  onDeleteVideo: (index: number) => Promise<boolean>;
  onDeleteVoice: () => Promise<boolean>;
  onEdit: () => void;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
  onRemoveAttachedItem: (itemId: string) => Promise<boolean>;
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
  onSearchChange: (search: string) => void;
  onSelectSpecies: (species: KolamSpecies, nextMode?: KolamSpeciesSurfaceMode) => Promise<void>;
  onSyncPrice: (speciesIds?: string[]) => Promise<boolean>;
  onTogglePin: (species: KolamSpecies) => Promise<boolean>;
}

const DEFAULT_SPECIES_PAGINATION: KolamSpeciesPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

export function useKolamSpeciesController(
  route: string,
): KolamSpeciesController {
  const initialMode = getInitialMode(route);
  const [species, setSpecies] = useState<KolamSpecies[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<KolamSpecies | null>(
    null,
  );
  const [mode, setMode] = useState<KolamSpeciesSurfaceMode>(initialMode);
  const [filters, setFilters] = useState<KolamSpeciesListFilters>(() =>
    createInitialSpeciesListFilters(),
  );
  const [pagination, setPagination] = useState<KolamSpeciesPagination>(
    DEFAULT_SPECIES_PAGINATION,
  );
  const [form, setForm] = useState<KolamSpeciesFormState>(() =>
    createEmptyKolamSpeciesFormState(),
  );
  const [categories, setCategories] = useState<KolamCategory[]>([]);
  const [customFields, setCustomFields] = useState<KolamCustomField[]>([]);
  const [taxonomies, setTaxonomies] = useState<KolamTaxonomy[]>([]);
  const [units, setUnits] = useState<KolamUnit[]>([]);
  const [vendors, setVendors] = useState<KolamVendor[]>([]);
  const [packingOptions, setPackingOptions] = useState<KolamPackingOption[]>([]);
  const [productOptions, setProductOptions] = useState<KolamProductOption[]>([]);
  const [rawMaterialProducts, setRawMaterialProducts] = useState<KolamProductOption[]>([]);
  const [shippingMethods, setShippingMethods] = useState<KolamShippingMethod[]>([]);
  const [iucnStatuses, setIucnStatuses] = useState<KolamIucnStatus[]>([]);
  const [tags, setTags] = useState<KolamTag[]>([]);
  const [termsTemplates, setTermsTemplates] = useState<KolamSpeciesTermsTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [mediaManifestSummary, setMediaManifestSummary] = useState(
    summarizeKolamMediaManifest(null),
  );
  const [saving, setSaving] = useState(false);
  const [syncingPrice, setSyncingPrice] = useState(false);
  const [syncPriceMessage, setSyncPriceMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<KolamSpeciesDataSource>('idle');

  const refreshOptions = useCallback(async () => {
    const cachedCustomFields = await readKolamCustomFieldListCache();
    if (cachedCustomFields?.value.length) {
      setCustomFields(cachedCustomFields.value);
    }

    const cachedTags = await readKolamTagListCache();
    if (cachedTags?.value.length) {
      setTags(cachedTags.value);
    }

    const cachedVendors = await readKolamVendorListCache();
    if (cachedVendors?.value.length) {
      setVendors(cachedVendors.value);
    }

    const cachedProducts = await readKolamProductOptionListCache();
    if (cachedProducts?.value.length) {
      setProductOptions(cachedProducts.value);
    }

    const cachedRawProducts = await readKolamRawProductOptionListCache();
    if (cachedRawProducts?.value.length) {
      setRawMaterialProducts(cachedRawProducts.value);
    }

    const cachedShippingMethods = await readKolamShippingMethodListCache();
    if (cachedShippingMethods?.value.length) {
      setShippingMethods(cachedShippingMethods.value);
    }

    const cachedPackings = await readKolamPackingOptionListCache();
    if (cachedPackings?.value.length) {
      setPackingOptions(cachedPackings.value);
    }

    const [
      categoryResult,
      taxonomyResult,
      unitResult,
      iucnResult,
      tagResult,
      vendorResult,
      productResult,
      rawProductResult,
      shippingMethodResult,
      packingResult,
      customFieldResult,
    ] = await Promise.allSettled([
      getKolamCategories(),
      getKolamTaxonomies({ level: 'Genus', limit: 1000 }),
      getKolamUnits(),
      getKolamIucnStatuses({ limit: 1000 }),
      getKolamTags(),
      getKolamVendors(),
      getKolamProductOptions(),
      getKolamRawProductOptions(),
      getKolamActiveShippingMethods(),
      getKolamPackingOptions(),
      getKolamCustomFields(),
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
    if (productResult.status === 'fulfilled') {
      setProductOptions(productResult.value);
      await writeKolamProductOptionListCache(productResult.value);
    }
    if (rawProductResult.status === 'fulfilled') {
      setRawMaterialProducts(rawProductResult.value);
      await writeKolamRawProductOptionListCache(rawProductResult.value);
    }
    if (shippingMethodResult.status === 'fulfilled') {
      setShippingMethods(shippingMethodResult.value);
      await writeKolamShippingMethodListCache(shippingMethodResult.value);
    }
    if (packingResult.status === 'fulfilled') {
      setPackingOptions(packingResult.value);
      await writeKolamPackingOptionListCache(packingResult.value);
    }
    if (customFieldResult.status === 'fulfilled') {
      setCustomFields(customFieldResult.value);
      await writeKolamCustomFieldListCache(customFieldResult.value);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!isKolamSpeciesRoute(route)) {
      return;
    }

    setLoading(true);
    setError(null);

    const canUseCache = isDefaultSpeciesListFilters(filters);
    const cached = canUseCache ? await readKolamSpeciesListCache() : null;
    if (
      cached?.value.data.length &&
      cached.value.pagination.limit === filters.limit
    ) {
      applySpeciesListResult(cached.value, setSpecies, setPagination);
      setDataSource('cache');
    }

    try {
      await refreshOptions();
      const liveResult = await getKolamSpeciesList(
        createSpeciesListRequest(filters),
      );
      if (canUseCache) {
        await writeKolamSpeciesListCache(liveResult);
      }
      applySpeciesListResult(liveResult, setSpecies, setPagination);
      setDataSource('live');
      void startKolamSpeciesDetailCacheHydration(liveResult.data);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource(cached?.value.data.length ? 'cache' : 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, refreshOptions, route]);

  useEffect(() => {
    setMode(initialMode);
    if (initialMode === 'new') {
      setSelectedSpecies(null);
      setForm(createEmptyKolamSpeciesFormState());
      setMediaManifestSummary(summarizeKolamMediaManifest(null));
      setTermsTemplates([]);
    }
    if (initialMode === 'list') {
      setSelectedSpecies(null);
      setMediaManifestSummary(summarizeKolamMediaManifest(null));
      setTermsTemplates([]);
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
      void refreshSpeciesTermsTemplates(item.id, setTermsTemplates);

      const cached = await readKolamSpeciesDetailCache(item.id);
      if (cached?.value) {
        setSelectedSpecies(cached.value);
        setForm(createKolamSpeciesFormState(cached.value));
        setDataSource('cache');
        void refreshSpeciesMediaManifestSummary(
          cached.value,
          setMediaManifestSummary,
        );
      }

      try {
        const liveSpecies = await getKolamSpecies(item.id);
        await writeKolamSpeciesDetailCache(liveSpecies);
        setSelectedSpecies(liveSpecies);
        setForm(createKolamSpeciesFormState(liveSpecies));
        setDataSource('live');
        void refreshSpeciesMediaManifestSummary(
          liveSpecies,
          setMediaManifestSummary,
        );
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
    setMediaManifestSummary(summarizeKolamMediaManifest(null));
    setTermsTemplates([]);
  }, []);

  const onCreateNew = useCallback(() => {
    setMode('new');
    setSelectedSpecies(null);
    setForm(createEmptyKolamSpeciesFormState());
    setMediaManifestSummary(summarizeKolamMediaManifest(null));
    setTermsTemplates([]);
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
      await writeKolamSpeciesListCache({
        data: nextSpecies,
        pagination,
      });
      setSpecies(nextSpecies);
      setSelectedSpecies(next);
      setForm(createKolamSpeciesFormState(next));
      setDataSource('live');
      void refreshSpeciesMediaManifestSummary(next, setMediaManifestSummary);
    },
    [pagination, species],
  );

  const onAddAttachedItem = useCallback(
    async (body: KolamSpeciesAttachedItemPayload) => {
      const item = selectedSpecies;
      if (!item) {
        setError('Simpan spesies terlebih dahulu sebelum menambahkan item terlampir.');
        return false;
      }

      setSaving(true);
      setError(null);
      try {
        const next = await addKolamSpeciesAttachedItem(item.id, body);
        await applyLiveSpecies(next);
        return true;
      } catch (addError) {
        setError(getErrorMessage(addError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [applyLiveSpecies, selectedSpecies],
  );

  const onRemoveAttachedItem = useCallback(
    async (itemId: string) => {
      const item = selectedSpecies;
      if (!item) {
        return false;
      }

      setSaving(true);
      setError(null);
      try {
        const next = await removeKolamSpeciesAttachedItem(item.id, itemId);
        await applyLiveSpecies(next);
        return true;
      } catch (removeError) {
        setError(getErrorMessage(removeError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [applyLiveSpecies, selectedSpecies],
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
    const validationError = validateKolamSpeciesFormForSave(form);
    if (validationError) {
      setError(validationError);
      return;
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

      const seoSyncedSpecies = await syncSpeciesSeoIfNeeded(savedSpecies, form);
      const linkedSpecies = await linkKolamSpeciesPackings(seoSyncedSpecies, form);
      await writeKolamSpeciesDetailCache(linkedSpecies);
      const syncedSpecies = await syncSpeciesMediaIfNeeded(linkedSpecies, form);
      void refreshSpeciesMediaManifestSummary(
        syncedSpecies,
        setMediaManifestSummary,
      );
      const nextSpecies = upsertSpecies(species, syncedSpecies);
      await writeKolamSpeciesListCache({
        data: nextSpecies,
        pagination,
      });
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
  }, [form, mode, pagination, selectedSpecies, species]);

  const onDuplicateSpecies = useCallback(async (item: KolamSpecies) => {
    setSaving(true);
    setError(null);

    try {
      await duplicateKolamSpecies(item.id);
      await refresh();
      return true;
    } catch (duplicateError) {
      setError(getErrorMessage(duplicateError));
      return false;
    } finally {
      setSaving(false);
    }
  }, [refresh]);

  const onDeleteSpecies = useCallback(async (item: KolamSpecies) => {
    setSaving(true);
    setError(null);

    try {
      await deleteKolamSpecies(item.id);
      const nextSpecies = species.filter(speciesItem => speciesItem.id !== item.id);
      await writeKolamSpeciesListCache({
        data: nextSpecies,
        pagination: {
          ...pagination,
          total: Math.max(0, pagination.total - 1),
          totalPages: Math.max(
            1,
            Math.ceil(Math.max(0, pagination.total - 1) / pagination.limit),
          ),
        },
      });
      setSpecies(nextSpecies);
      if (selectedSpecies?.id === item.id) {
        setSelectedSpecies(null);
        setMode('list');
      }
      await refresh();
      return true;
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
      return false;
    } finally {
      setSaving(false);
    }
  }, [pagination, refresh, selectedSpecies?.id, species]);

  const onTogglePin = useCallback(async (item: KolamSpecies) => {
    setError(null);

    try {
      const updated = await updateKolamSpeciesPartial(item.id, {
        isPinned: !item.isPinned,
      });
      const nextSpecies = upsertSpecies(species, updated);
      await writeKolamSpeciesListCache({
        data: nextSpecies,
        pagination,
      });
      await writeKolamSpeciesDetailCache(updated);
      setSpecies(nextSpecies);
      if (selectedSpecies?.id === item.id) {
        setSelectedSpecies(updated);
        setForm(createKolamSpeciesFormState(updated));
      }
      setDataSource('live');
      return true;
    } catch (pinError) {
      setError(getErrorMessage(pinError));
      return false;
    }
  }, [pagination, selectedSpecies?.id, species]);

  const onSyncPrice = useCallback(async (speciesIds?: string[]) => {
    setSyncingPrice(true);
    setSyncPriceMessage(null);
    setError(null);

    try {
      const result = await syncKolamMarketplacePrice({
        source: 'species',
        speciesIds,
      });
      const skippedText = result.skippedNoPrice
        ? ' ' + result.skippedNoPrice + ' item dilewati karena onlinePrice kosong/tidak valid.'
        : '';
      setSyncPriceMessage(result.message + skippedText);
      await refresh();
      return true;
    } catch (syncError) {
      setError(getErrorMessage(syncError));
      return false;
    } finally {
      setSyncingPrice(false);
    }
  }, [refresh]);

  const onChangeFilters = useCallback((patch: Partial<KolamSpeciesListFilters>) => {
    setFilters(current => ({ ...current, ...patch, page: patch.page ?? 1 }));
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

  const breadcrumbPath = useMemo(
    () => getKolamSpeciesBreadcrumbPath(mode, selectedSpecies),
    [mode, selectedSpecies],
  );

  return {
    breadcrumbPath,
    categories,
    customFields,
    dataSource,
    error,
    filters,
    form,
    iucnStatuses,
    isEditable: mode === 'edit' || mode === 'new',
    loading,
    mediaManifestSummary,
    mode,
    packingOptions,
    pagination,
    productOptions,
    rawMaterialProducts,
    shippingMethods,
    saving,
    selectedSpecies,
    species,
    syncPriceMessage,
    syncingPrice,
    tags,
    termsTemplates,
    taxonomies,
    units,
    vendors,
    onAddAttachedItem,
    onApplySpecies: applyLiveSpecies,
    onBackToList,
    onChangeFilters,
    onChangeForm,
    onCreateNew,
    onDeletePhoto,
    onDeleteSpecies,
    onDeleteThumbnail,
    onDuplicateSpecies,
    onDeleteVariantPhoto,
    onDeleteVariantVideo,
    onDeleteVideo,
    onDeleteVoice,
    onEdit,
    onLimitChange,
    onPageChange,
    onRemoveAttachedItem,
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
    onSearchChange,
    onSelectSpecies,
    onSyncPrice,
    onTogglePin,
  };
}

function createInitialSpeciesListFilters(): KolamSpeciesListFilters {
  return {
    search: '',
    categoryId: '',
    taxonomyId: '',
    stockStatus: 'all',
    page: 1,
    limit: 10,
  };
}

function createSpeciesListRequest(filters: KolamSpeciesListFilters) {
  return {
    page: filters.page,
    limit: filters.limit,
    search: filters.search.trim() || undefined,
    category: filters.categoryId || undefined,
    taxonomyId: filters.taxonomyId || undefined,
    stockStatus: filters.stockStatus === 'all' ? undefined : filters.stockStatus,
  };
}

function isDefaultSpeciesListFilters(filters: KolamSpeciesListFilters) {
  return (
    !filters.search.trim() &&
    !filters.categoryId &&
    !filters.taxonomyId &&
    filters.stockStatus === 'all' &&
    filters.page === 1 &&
    filters.limit === 10
  );
}

function applySpeciesListResult(
  result: KolamSpeciesListResult,
  setSpecies: (species: KolamSpecies[]) => void,
  setPagination: (pagination: KolamSpeciesPagination) => void,
) {
  setSpecies(result.data);
  setPagination(result.pagination);
}

function validateKolamSpeciesFormForSave(form: KolamSpeciesFormState) {
  if (!form.scientificName.trim()) {
    return 'Nama ilmiah wajib diisi.';
  }

  if (!form.taxonomyId.trim()) {
    return 'Taksonomi genus wajib dipilih.';
  }

  if (!form.categoryIds.length) {
    return 'Minimal satu kategori wajib dipilih.';
  }

  if (form.sellable && !form.unitId.trim()) {
    return 'Satuan wajib dipilih untuk spesies yang dijual.';
  }

  if (form.sellable && !Number.isFinite(Number(form.priceToSell))) {
    return 'Harga jual wajib berupa angka yang valid.';
  }

  if (form.minimumOrderQty.trim() && Number(form.minimumOrderQty) < 1) {
    return 'Minimal pesanan harus bernilai 1 atau lebih.';
  }

  const variantValidationError = validateKolamSpeciesVariantsForSave(form);
  if (variantValidationError) {
    return variantValidationError;
  }

  return null;
}

function validateKolamSpeciesVariantsForSave(form: KolamSpeciesFormState) {
  if (!form.variantsTouched) {
    return null;
  }

  const missingTier1 = form.variants.findIndex(
    variant => !variant.tier1Value.trim(),
  );
  if (missingTier1 >= 0) {
    return `Varian ${missingTier1 + 1} wajib memiliki nilai varian utama.`;
  }

  if (form.variantConfigTier2Name.trim()) {
    const missingTier2 = form.variants.findIndex(
      variant => !variant.tier2Value.trim(),
    );
    if (missingTier2 >= 0) {
      return `Varian ${missingTier2 + 1} wajib memiliki nilai varian kedua.`;
    }
  }

  const invalidPriceIndex = form.variants.findIndex(
    variant => variant.priceToSell.trim() && !Number.isFinite(Number(variant.priceToSell)),
  );
  if (invalidPriceIndex >= 0) {
    return `Harga jual varian ${invalidPriceIndex + 1} wajib berupa angka yang valid.`;
  }

  return null;
}
async function refreshSpeciesTermsTemplates(
  speciesId: string,
  setTermsTemplates: (templates: KolamSpeciesTermsTemplate[]) => void,
) {
  try {
    const templates = await getKolamSpeciesTermsTemplates(speciesId);
    setTermsTemplates(templates);
  } catch {
    setTermsTemplates([]);
  }
}

async function syncSpeciesSeoIfNeeded(
  species: KolamSpecies,
  form: KolamSpeciesFormState,
) {
  const metaTitle = form.seoMetaTitle.trim();
  const metaDescription = form.seoMetaDescription.trim();
  const keywords = normalizeSeoKeywordsText(form.seoKeywords);
  const currentKeywords = normalizeSeoKeywordsText(
    (species.seo.keywords ?? []).join(', '),
  );

  if (
    metaTitle === species.seo.metaTitle.trim() &&
    metaDescription === species.seo.metaDescription.trim() &&
    keywords === currentKeywords
  ) {
    return species;
  }

  return updateKolamSpeciesSeo(species.id, {
    metaTitle,
    metaDescription,
    keywords,
  });
}

function normalizeSeoKeywordsText(value: string) {
  return value
    .split(',')
    .map(keyword => keyword.trim())
    .filter(Boolean)
    .join(', ');
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

const SPECIES_DETAIL_HYDRATION_DELAY_MS = 80;
let activeSpeciesDetailHydration: Promise<void> | null = null;

function startKolamSpeciesDetailCacheHydration(items: KolamSpecies[]) {
  if (activeSpeciesDetailHydration || !items.length) {
    return;
  }

  activeSpeciesDetailHydration = hydrateKolamSpeciesDetailCache(items).finally(
    () => {
      activeSpeciesDetailHydration = null;
    },
  );
}

async function hydrateKolamSpeciesDetailCache(items: KolamSpecies[]) {
  for (const item of items) {
    if (!item.id) {
      continue;
    }

    const shouldHydrate = await shouldHydrateKolamSpeciesDetail(item);
    if (!shouldHydrate) {
      continue;
    }

    try {
      const detail = await getKolamSpecies(item.id);
      await writeKolamSpeciesDetailCache(detail);
    } catch {
      // Background hydration must never break the foreground list/detail flow.
    }

    await delayKolamSpeciesDetailHydration();
  }
}

async function shouldHydrateKolamSpeciesDetail(item: KolamSpecies) {
  const cached = await readKolamSpeciesDetailCache(item.id);

  if (!cached?.value) {
    return true;
  }

  if (!hasKolamSpeciesLocaleContent(cached.value)) {
    return true;
  }

  return isKolamSpeciesNewerThanCache(item.updatedAt, cached.value.updatedAt);
}

function hasKolamSpeciesLocaleContent(item: KolamSpecies) {
  const locales = Array.isArray(item.locales) ? item.locales : [];
  const hasLocaleText = locales.some(locale =>
    Boolean(
      locale.shortDescription?.trim() ||
        locale.description?.trim() ||
        locale.morfologis?.trim() ||
        locale.habitat?.trim() ||
        locale.distribution?.trim(),
    ),
  );

  return Boolean(
    hasLocaleText ||
      item.shortDescription?.trim() ||
      item.description?.trim() ||
      item.morfologis?.trim() ||
      item.habitat?.trim() ||
      item.distribution?.trim(),
  );
}

function isKolamSpeciesNewerThanCache(
  sourceUpdatedAt: string | undefined,
  cacheUpdatedAt: string | undefined,
) {
  if (!sourceUpdatedAt) {
    return false;
  }

  const sourceTime = Date.parse(sourceUpdatedAt);
  const cacheTime = cacheUpdatedAt ? Date.parse(cacheUpdatedAt) : Number.NaN;

  if (!Number.isFinite(sourceTime)) {
    return false;
  }

  return !Number.isFinite(cacheTime) || sourceTime > cacheTime;
}

function delayKolamSpeciesDetailHydration() {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), SPECIES_DETAIL_HYDRATION_DELAY_MS);
  });
}

async function refreshSpeciesMediaManifestSummary(
  species: KolamSpecies,
  setSummary: (summary: KolamMediaManifestSummary) => void,
) {
  const ownerId = getSpeciesMediaManifestOwnerId(species.id);
  const cached = await readKolamMediaManifest(ownerId);

  if (cached?.value) {
    setSummary(summarizeKolamMediaManifest(cached.value));
  }

  try {
    const manifest = await syncKolamMediaManifest({
      assets: createSpeciesMediaManifestAssets(species),
      ownerId,
      revision: createKolamSpeciesDetailRevision(species),
    });
    setSummary(summarizeKolamMediaManifest(manifest));
  } catch {
    setSummary(summarizeKolamMediaManifest(cached?.value));
  }
}

function getSpeciesMediaManifestOwnerId(speciesId: string) {
  return `species:${speciesId}`;
}

function createSpeciesMediaManifestAssets(species: KolamSpecies) {
  const revisionSeed = species.updatedAt ?? createKolamSpeciesDetailRevision(species);
  const videoUris = Array.isArray(species.videoUris) ? species.videoUris : [];
  const variants = Array.isArray(species.variants) ? species.variants : [];
  const rootVideos = videoUris.map((sourceUri, index) => ({
    kind: 'video' as const,
    label: `Species video ${index + 1}`,
    revision: `${revisionSeed}:root-video:${index}:${sourceUri}`,
    scope: 'species',
    sourceUri,
  }));
  const rootVoice = species.voiceUri
    ? [
        {
          kind: 'voice' as const,
          label: 'Species voice',
          revision: `${revisionSeed}:root-voice:${species.voiceUri}`,
          scope: 'species',
          sourceUri: species.voiceUri,
        },
      ]
    : [];
  const variantVideos = variants.flatMap(variant =>
    (Array.isArray(variant.videoUris) ? variant.videoUris : []).map((sourceUri, index) => ({
      kind: 'video' as const,
      label: `${variant.label || variant.id} video ${index + 1}`,
      revision: `${revisionSeed}:${variant.id}:video:${index}:${sourceUri}`,
      scope: 'species-variant',
      sourceUri,
    })),
  );

  return [...rootVideos, ...rootVoice, ...variantVideos];
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










