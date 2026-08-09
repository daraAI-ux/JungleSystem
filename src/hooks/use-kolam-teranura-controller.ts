import { useCallback, useEffect, useState } from 'react';
import { flattenAllCategories, type KolamCategory } from '../domain/kolam-category';
import type { KolamBrand } from '../domain/kolam-brand';
import type { KolamProductOption } from '../domain/kolam-product-option';
import type { KolamShippingMethod } from '../domain/kolam-shipping-method';
import type { KolamTag } from '../domain/kolam-tag';
import type { KolamUnit } from '../domain/kolam-unit';
import type { KolamVendor } from '../domain/kolam-vendor';
import {
  createEmptyKolamTeranuraFormState,
  createKolamTeranuraFormState,
  createKolamTeranuraSavePayload,
  type KolamTeranuraFormState,
} from '../domain/kolam-teranura-form';
import {
  getKolamTeranuraRouteId,
  getKolamTeranuraSurfaceMode,
  type KolamTeranura,
  type KolamTeranuraPagination,
  type KolamTeranuraSurfaceMode,
  type KolamTeranuraSortBy,
  type KolamTeranuraSortOrder,
} from '../domain/kolam-teranura';
import { getKolamBrands } from '../services/kolam-brand-api';
import { getKolamCategories } from '../services/kolam-category-api';
import {
  getKolamLocations,
  type KolamLocationOption,
} from '../services/kolam-location-api';
import {
  getKolamProductOptions,
  getKolamRawProductOptions,
} from '../services/kolam-product-option-api';
import { getKolamActiveShippingMethods } from '../services/kolam-shipping-method-api';
import { getKolamTags } from '../services/kolam-tag-api';
import {
  createKolamTeranura,
  getKolamTeranuraDetail,
  getKolamTeranuras,
  updateKolamTeranura,
  uploadKolamTeranuraPhoto,
  uploadKolamTeranuraVideo,
} from '../services/kolam-teranura-api';
import { getKolamUnits } from '../services/kolam-unit-api';
import { getKolamVendors } from '../services/kolam-vendor-api';
import {
  pickNativeImageFile,
  pickNativeVideoFile,
} from '../services/native-file-picker';

export type KolamTeranuraDataSource = 'idle' | 'live' | 'error';
export type KolamTeranuraSellableFilter = 'all' | 'true' | 'false';

export interface KolamTeranuraListFilters {
  search: string;
  categoryIds: string[];
  brandIds: string[];
  sellable: KolamTeranuraSellableFilter;
  sortBy: KolamTeranuraSortBy;
  sortOrder: KolamTeranuraSortOrder;
  page: number;
  limit: number;
}

export interface KolamTeranuraController {
  brands: KolamBrand[];
  categories: KolamCategory[];
  componentProducts: KolamProductOption[];
  dataSource: KolamTeranuraDataSource;
  error: string | null;
  filters: KolamTeranuraListFilters;
  form: KolamTeranuraFormState | null;
  isEditable: boolean;
  items: KolamTeranura[];
  loading: boolean;
  locations: KolamLocationOption[];
  mode: KolamTeranuraSurfaceMode;
  pagination: KolamTeranuraPagination;
  saving: boolean;
  selectedItem: KolamTeranura | null;
  shippingMethods: KolamShippingMethod[];
  tags: KolamTag[];
  units: KolamUnit[];
  vendors: KolamVendor[];
  onChangeFilters: (patch: Partial<KolamTeranuraListFilters>) => void;
  onChangeForm: (patch: Partial<KolamTeranuraFormState>) => void;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
  onPickPhoto: () => Promise<void>;
  onPickVideo: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onSave: () => Promise<KolamTeranura | null>;
  onSearchChange: (search: string) => void;
}

const DEFAULT_PAGINATION: KolamTeranuraPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

const DEFAULT_FILTERS: KolamTeranuraListFilters = {
  search: '',
  categoryIds: [],
  brandIds: [],
  sellable: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 10,
};

export function useKolamTeranuraController(
  route = '/teranura',
): KolamTeranuraController {
  const mode = getKolamTeranuraSurfaceMode(route);
  const detailId = getKolamTeranuraRouteId(route);
  const isEditable = mode === 'edit' || mode === 'new';
  const [items, setItems] = useState<KolamTeranura[]>([]);
  const [selectedItem, setSelectedItem] = useState<KolamTeranura | null>(null);
  const [form, setForm] = useState<KolamTeranuraFormState | null>(
    mode === 'new' ? createEmptyKolamTeranuraFormState() : null,
  );
  const [categories, setCategories] = useState<KolamCategory[]>([]);
  const [brands, setBrands] = useState<KolamBrand[]>([]);
  const [tags, setTags] = useState<KolamTag[]>([]);
  const [units, setUnits] = useState<KolamUnit[]>([]);
  const [vendors, setVendors] = useState<KolamVendor[]>([]);
  const [locations, setLocations] = useState<KolamLocationOption[]>([]);
  const [shippingMethods, setShippingMethods] = useState<KolamShippingMethod[]>(
    [],
  );
  const [componentProducts, setComponentProducts] = useState<
    KolamProductOption[]
  >([]);
  const [filters, setFilters] =
    useState<KolamTeranuraListFilters>(DEFAULT_FILTERS);
  const [pagination, setPagination] =
    useState<KolamTeranuraPagination>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<KolamTeranuraDataSource>('idle');

  const refreshOptions = useCallback(async () => {
    const [
      categoryList,
      brandList,
      tagList,
      unitList,
      vendorList,
      locationList,
      shippingList,
      productOptions,
      rawOptions,
    ] = await Promise.all([
      getKolamCategories(),
      getKolamBrands(),
      getKolamTags(),
      getKolamUnits(),
      getKolamVendors(),
      getKolamLocations(),
      getKolamActiveShippingMethods(),
      getKolamProductOptions(),
      getKolamRawProductOptions(),
    ]);

    setCategories(flattenAllCategories(categoryList));
    setBrands(brandList);
    setTags(tagList);
    setUnits(unitList);
    setVendors(vendorList);
    setLocations(locationList);
    setShippingMethods(shippingList);
    const byId = new Map<string, KolamProductOption>();
    [...rawOptions, ...productOptions].forEach(option => {
      if (option.id) {
        byId.set(option.id, option);
      }
    });
    setComponentProducts([...byId.values()]);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (mode === 'new') {
        setSelectedItem(null);
        setForm(createEmptyKolamTeranuraFormState());
        setDataSource('live');
        return;
      }

      if (mode === 'detail' || mode === 'edit') {
        const item = await getKolamTeranuraDetail(detailId);
        setSelectedItem(item);
        if (mode === 'edit') {
          setForm(createKolamTeranuraFormState(item));
        }
        setDataSource('live');
        return;
      }

      const result = await getKolamTeranuras({
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        category: filters.categoryIds,
        brand: filters.brandIds,
        sellable: filters.sellable === 'all' ? undefined : filters.sellable,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        includeAllLines: true,
      });

      setItems(result.data);
      setPagination(result.pagination);
      setDataSource('live');
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Gagal memuat Teranura.',
      );
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [detailId, filters, mode]);

  useEffect(() => {
    void refreshOptions().catch(caught => {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Gagal memuat opsi Teranura.',
      );
    });
  }, [refreshOptions]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onChangeFilters = useCallback(
    (patch: Partial<KolamTeranuraListFilters>) => {
      setFilters(current => ({
        ...current,
        ...patch,
        page: patch.page ?? 1,
      }));
    },
    [],
  );

  const onSearchChange = useCallback(
    (search: string) => onChangeFilters({ search }),
    [onChangeFilters],
  );

  const onPageChange = useCallback((page: number) => {
    setFilters(current => ({ ...current, page }));
  }, []);

  const onLimitChange = useCallback((limit: number) => {
    setFilters(current => ({ ...current, limit, page: 1 }));
  }, []);

  const onChangeForm = useCallback((patch: Partial<KolamTeranuraFormState>) => {
    setForm(current => (current ? { ...current, ...patch } : current));
  }, []);

  const onPickPhoto = useCallback(async () => {
    const result = await pickNativeImageFile();
    if (!result.cancelled && result.uri) {
      onChangeForm({ photoLocalUri: result.uri });
    }
  }, [onChangeForm]);

  const onPickVideo = useCallback(async () => {
    const result = await pickNativeVideoFile();
    if (!result.cancelled && result.uri) {
      onChangeForm({ videoLocalUri: result.uri });
    }
  }, [onChangeForm]);

  const onSave = useCallback(async () => {
    if (!form) {
      return null;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = createKolamTeranuraSavePayload(form);
      let saved =
        mode === 'new'
          ? await createKolamTeranura(payload)
          : await updateKolamTeranura(form.id || detailId, payload);

      if (form.photoLocalUri.trim()) {
        saved = await uploadKolamTeranuraPhoto(
          saved.id,
          form.photoLocalUri.trim(),
        );
      }
      if (form.videoLocalUri.trim()) {
        saved = await uploadKolamTeranuraVideo(
          saved.id,
          form.videoLocalUri.trim(),
        );
      }

      setSelectedItem(saved);
      setForm(createKolamTeranuraFormState(saved));
      setDataSource('live');
      return saved;
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Gagal menyimpan Teranura.',
      );
      return null;
    } finally {
      setSaving(false);
    }
  }, [detailId, form, mode]);

  return {
    brands,
    categories,
    componentProducts,
    dataSource,
    error,
    filters,
    form,
    isEditable,
    items,
    loading,
    locations,
    mode,
    pagination,
    saving,
    selectedItem,
    shippingMethods,
    tags,
    units,
    vendors,
    onChangeFilters,
    onChangeForm,
    onLimitChange,
    onPageChange,
    onPickPhoto,
    onPickVideo,
    onRefresh: refresh,
    onSave,
    onSearchChange,
  };
}
