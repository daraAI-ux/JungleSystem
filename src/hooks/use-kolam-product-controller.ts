import { useCallback, useEffect, useMemo, useState } from 'react';
import { getKolamBrands } from '../services/kolam-brand-api';
import {
  readKolamBrandListCache,
  writeKolamBrandListCache,
} from '../services/kolam-brand-local-cache';
import { getKolamCategories } from '../services/kolam-category-api';
import {
  readKolamCategoryListCache,
  writeKolamCategoryListCache,
} from '../services/kolam-category-local-cache';
import { flattenAllCategories, type KolamCategory } from '../domain/kolam-category';
import type { KolamBrand } from '../domain/kolam-brand';
import type { KolamProductOption } from '../domain/kolam-product-option';
import type { KolamSpecies } from '../domain/kolam-species';
import {
  createEmptyKolamProductFormState,
  createKolamProductFormState,
  createKolamProductSavePayload,
  getKolamProductBreadcrumbPath,
  isKolamProductRoute,
  slugifyProductName,
  type KolamProduct,
  type KolamProductFormState,
  type KolamProductListResult,
  type KolamProductPagination,
  type KolamProductSurfaceMode,
} from '../domain/kolam-product';
import type { KolamTag } from '../domain/kolam-tag';
import type { KolamUnit } from '../domain/kolam-unit';
import {
  addKolamProductAttachedItem,
  archiveKolamProduct,
  createKolamProduct,
  deleteKolamProduct,
  duplicateKolamProduct,
  getKolamProductDetail,
  getKolamProducts,
  removeKolamProductAttachedItem,
  restoreKolamProduct,
  updateKolamProduct,
  updateKolamProductPartial,
  updateKolamProductSeo,
  type GetKolamProductsOptions,
  type KolamProductAttachedItemPayload,
} from '../services/kolam-product-api';
import { getKolamProductOptions } from '../services/kolam-product-option-api';
import {
  readKolamProductOptionListCache,
  writeKolamProductOptionListCache,
} from '../services/kolam-product-option-local-cache';
import { getKolamSpeciesList } from '../services/kolam-species-api';
import {
  readKolamSpeciesListCache,
  writeKolamSpeciesListCache,
} from '../services/kolam-species-local-cache';
import { getKolamTags } from '../services/kolam-tag-api';
import { getKolamUnits } from '../services/kolam-unit-api';
import {
  readKolamProductDetailCache,
  readKolamProductFromListCacheByRouteKey,
  readKolamProductListCache,
  removeKolamProductDetailCache,
  writeKolamProductDetailCache,
  writeKolamProductListCache,
} from '../services/kolam-product-local-cache';

export type KolamProductDataSource = 'idle' | 'cache' | 'live' | 'error';

export interface KolamProductListFilters {
  search: string;
  categoryIds: string[];
  brandIds: string[];
  stockStatus: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
  archived: boolean;
}

export interface KolamProductController {
  brands: KolamBrand[];
  breadcrumbPath: string;
  categories: KolamCategory[];
  dataSource: KolamProductDataSource;
  error: string | null;
  filters: KolamProductListFilters;
  form: KolamProductFormState | null;
  isEditable: boolean;
  loading: boolean;
  mode: KolamProductSurfaceMode;
  pagination: KolamProductPagination;
  productOptions: KolamProductOption[];
  products: KolamProduct[];
  saving: boolean;
  selectedProduct: KolamProduct | null;
  species: KolamSpecies[];
  tags: KolamTag[];
  units: KolamUnit[];
  onAddAttachedItem: (body: KolamProductAttachedItemPayload) => Promise<boolean>;
  onBackToList: () => void;
  onChangeForm: (patch: Partial<KolamProductFormState>) => void;
  onChangeFilters: (patch: Partial<KolamProductListFilters>) => void;
  onCreateNew: () => void;
  onEdit: () => void;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => Promise<void>;
  onArchiveProduct: (product: KolamProduct) => Promise<boolean>;
  onDeleteProduct: (product: KolamProduct) => Promise<boolean>;
  onDuplicateProduct: (product: KolamProduct) => Promise<boolean>;
  onRemoveAttachedItem: (itemId: string) => Promise<boolean>;
  onRestoreProduct: (product: KolamProduct) => Promise<boolean>;
  onSave: () => Promise<void>;
  onSearchChange: (search: string) => void;
  onTogglePin: (product: KolamProduct) => Promise<boolean>;
  onSelectProduct: (
    product: KolamProduct,
    nextMode?: KolamProductSurfaceMode,
  ) => Promise<void>;
}

const DEFAULT_PAGINATION: KolamProductPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

export function useKolamProductController(
  route: string,
): KolamProductController {
  const initialMode = getInitialMode(route);
  const [products, setProducts] = useState<KolamProduct[]>([]);
  const [brands, setBrands] = useState<KolamBrand[]>([]);
  const [categories, setCategories] = useState<KolamCategory[]>([]);
  const [productOptions, setProductOptions] = useState<KolamProductOption[]>([]);
  const [species, setSpecies] = useState<KolamSpecies[]>([]);
  const [tags, setTags] = useState<KolamTag[]>([]);
  const [units, setUnits] = useState<KolamUnit[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<KolamProduct | null>(
    null,
  );
  const [mode, setMode] = useState<KolamProductSurfaceMode>(initialMode);
  const [filters, setFilters] = useState<KolamProductListFilters>(() =>
    createInitialFilters(route),
  );
  const [pagination, setPagination] = useState<KolamProductPagination>(
    DEFAULT_PAGINATION,
  );
  const [form, setForm] = useState<KolamProductFormState | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<KolamProductDataSource>('idle');

  const refreshOptions = useCallback(async () => {
    const cachedBrands = await readKolamBrandListCache();
    if (cachedBrands?.value.length) {
      setBrands(cachedBrands.value);
    }

    const cachedCategories = await readKolamCategoryListCache();
    if (cachedCategories?.value.length) {
      setCategories(flattenAllCategories(cachedCategories.value));
    }

    const cachedProducts = await readKolamProductOptionListCache();
    if (cachedProducts?.value.length) {
      setProductOptions(cachedProducts.value);
    }

    const cachedSpecies = await readKolamSpeciesListCache();
    if (cachedSpecies?.value.length) {
      setSpecies(cachedSpecies.value);
    }

    const [
      brandResult,
      categoryResult,
      tagResult,
      unitResult,
      productOptionResult,
      speciesResult,
    ] = await Promise.allSettled([
      getKolamBrands(),
      getKolamCategories(),
      getKolamTags(),
      getKolamUnits(),
      getKolamProductOptions(),
      getKolamSpeciesList({ limit: 1000 }),
    ]);

    if (brandResult.status === 'fulfilled') {
      await writeKolamBrandListCache(brandResult.value);
      setBrands(brandResult.value);
    }

    if (categoryResult.status === 'fulfilled') {
      await writeKolamCategoryListCache(categoryResult.value);
      setCategories(flattenAllCategories(categoryResult.value));
    }

    if (tagResult.status === 'fulfilled') {
      setTags(tagResult.value);
    }

    if (unitResult.status === 'fulfilled') {
      setUnits(tagActiveUnits(unitResult.value));
    }

    if (productOptionResult.status === 'fulfilled') {
      await writeKolamProductOptionListCache(productOptionResult.value);
      setProductOptions(productOptionResult.value);
    }

    if (speciesResult.status === 'fulfilled') {
      await writeKolamSpeciesListCache(speciesResult.value);
      setSpecies(speciesResult.value);
    }
  }, []);
  const refresh = useCallback(async () => {
    if (!isKolamProductRoute(route)) {
      return;
    }

    setLoading(true);
    setError(null);

    const canUseCache = isDefaultListFilters(filters);
    const cached = canUseCache ? await readKolamProductListCache() : null;
    if (cached?.value.data.length) {
      setProducts(cached.value.data);
      setPagination(cached.value.pagination);
      setDataSource('cache');
    }

    try {
      const liveResult = await getKolamProducts(createListRequest(filters));
      if (canUseCache) {
        await writeKolamProductListCache(liveResult);
      }
      applyProductListResult(liveResult, setProducts, setPagination);
      setDataSource('live');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource(cached?.value.data.length ? 'cache' : 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, route]);

  useEffect(() => {
    setMode(initialMode);
    setFilters(current => {
      const archived = route.split('?')[0] === '/products/archive';
      return current.archived === archived ? current : { ...current, archived };
    });
    if (initialMode === 'new') {
      setSelectedProduct(null);
      setForm(null);
    }
  }, [initialMode, route]);

  useEffect(() => {
    if (isKolamProductRoute(route)) {
      void refreshOptions();
    }
  }, [refreshOptions, route]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onSelectProduct = useCallback(
    async (product: KolamProduct, nextMode: KolamProductSurfaceMode = 'detail') => {
      setMode(nextMode);
      setSelectedProduct(product);
      setForm(nextMode === 'edit' ? createKolamProductFormState(product) : null);
      setError(null);

      const cached = await readKolamProductDetailCache(product.id);
      if (cached?.value) {
        setSelectedProduct(cached.value);
        setForm(nextMode === 'edit' ? createKolamProductFormState(cached.value) : null);
        setDataSource('cache');
      }

      try {
        const liveProduct = await getKolamProductDetail(product.id, {
          forEdit: nextMode === 'edit',
        });
        await writeKolamProductDetailCache(liveProduct);
        setSelectedProduct(liveProduct);
        setForm(nextMode === 'edit' ? createKolamProductFormState(liveProduct) : null);
        setProducts(current => upsertProduct(current, liveProduct));
        setDataSource('live');
      } catch (detailError) {
        setError(getErrorMessage(detailError));
        setDataSource(cached?.value || product ? 'cache' : 'error');
      }
    },
    [],
  );

  useEffect(() => {
    const routeProductKey = getRouteProductKey(route);
    if (!routeProductKey || mode === 'new') {
      return;
    }

    if (selectedProduct && productMatchesRouteKey(selectedProduct, routeProductKey)) {
      return;
    }

    let active = true;
    void resolveRouteProduct(routeProductKey, products).then(product => {
      if (active) {
        void onSelectProduct(product, initialMode === 'edit' ? 'edit' : 'detail');
      }
    });

    return () => {
      active = false;
    };
  }, [initialMode, mode, onSelectProduct, products, route, selectedProduct]);

  const onBackToList = useCallback(() => {
    setMode('list');
    setSelectedProduct(null);
    setForm(null);
  }, []);

  const onCreateNew = useCallback(() => {
    setMode('new');
    setSelectedProduct(null);
    setForm(createEmptyKolamProductFormState());
    setError(null);
    void refreshOptions();
  }, [refreshOptions]);

  const onEdit = useCallback(() => {
    if (selectedProduct) {
      setMode('edit');
      setForm(createKolamProductFormState(selectedProduct));
    }
  }, [selectedProduct]);

  const onChangeForm = useCallback((patch: Partial<KolamProductFormState>) => {
    setForm(current => (current ? { ...current, ...patch } : current));
  }, []);

  const onChangeFilters = useCallback((patch: Partial<KolamProductListFilters>) => {
    setFilters(current => ({ ...current, ...patch, page: patch.page ?? 1 }));
  }, []);

  const onTogglePin = useCallback(
    async (product: KolamProduct) => {
      setLoading(true);
      setError(null);

      try {
        const savedProduct = await updateKolamProductPartial(product.id, {
          isPinned: !product.isPinned,
        });
        await writeKolamProductDetailCache(savedProduct);
        setProducts(current => upsertProduct(current, savedProduct));
        setSelectedProduct(current =>
          current?.id === savedProduct.id ? savedProduct : current,
        );
        setDataSource('live');
        return true;
      } catch (pinError) {
        setError(getErrorMessage(pinError));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const onDuplicateProduct = useCallback(
    async (product: KolamProduct) => {
      setLoading(true);
      setError(null);

      try {
        await duplicateKolamProduct(product.id);
        await refresh();
        return true;
      } catch (duplicateError) {
        setError(getErrorMessage(duplicateError));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [refresh],
  );

  const onArchiveProduct = useCallback(
    async (product: KolamProduct) => {
      setLoading(true);
      setError(null);

      try {
        await archiveKolamProduct(product.id);
        await removeKolamProductDetailCache(product.id);
        await refresh();
        return true;
      } catch (archiveError) {
        setError(getErrorMessage(archiveError));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [refresh],
  );

  const onRestoreProduct = useCallback(
    async (product: KolamProduct) => {
      setLoading(true);
      setError(null);

      try {
        await restoreKolamProduct(product.id);
        await refresh();
        return true;
      } catch (restoreError) {
        setError(getErrorMessage(restoreError));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [refresh],
  );

  const onDeleteProduct = useCallback(
    async (product: KolamProduct) => {
      setLoading(true);
      setError(null);

      try {
        await deleteKolamProduct(product.id);
        await removeKolamProductDetailCache(product.id);
        setProducts(current => current.filter(item => item.id !== product.id));
        setSelectedProduct(current => (current?.id === product.id ? null : current));
        await refresh();
        return true;
      } catch (deleteError) {
        setError(getErrorMessage(deleteError));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [refresh],
  );

  const onAddAttachedItem = useCallback(
    async (body: KolamProductAttachedItemPayload) => {
      const product = selectedProduct;
      if (!product) {
        setError('Simpan produk terlebih dahulu sebelum menambahkan item terlampir.');
        return false;
      }

      setSaving(true);
      setError(null);
      try {
        const nextProduct = await addKolamProductAttachedItem(product.id, body);
        await writeKolamProductDetailCache(nextProduct);
        const nextProducts = upsertProduct(products, nextProduct);
        await writeKolamProductListCache({
          data: nextProducts,
          pagination,
        });
        setProducts(nextProducts);
        setSelectedProduct(nextProduct);
        setForm(createKolamProductFormState(nextProduct));
        setDataSource('live');
        return true;
      } catch (addError) {
        setError(getErrorMessage(addError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [pagination, products, selectedProduct],
  );

  const onRemoveAttachedItem = useCallback(
    async (itemId: string) => {
      const product = selectedProduct;
      if (!product) {
        return false;
      }

      setSaving(true);
      setError(null);
      try {
        const nextProduct = await removeKolamProductAttachedItem(product.id, itemId);
        await writeKolamProductDetailCache(nextProduct);
        const nextProducts = upsertProduct(products, nextProduct);
        await writeKolamProductListCache({
          data: nextProducts,
          pagination,
        });
        setProducts(nextProducts);
        setSelectedProduct(nextProduct);
        setForm(createKolamProductFormState(nextProduct));
        setDataSource('live');
        return true;
      } catch (removeError) {
        setError(getErrorMessage(removeError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [pagination, products, selectedProduct],
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

  const onSave = useCallback(async () => {
    if (!form) {
      setError('Form produk belum siap.');
      return;
    }

    const validationError = validateKolamProductFormForSave(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = createKolamProductSavePayload(form);
      const savedProduct =
        mode === 'new'
          ? await createKolamProduct(payload)
          : await updateKolamProduct(
              form.id || selectedProduct?.id || slugifyProductName(form.name),
              payload,
            );
      const syncedProduct = await syncProductSeoIfNeeded(savedProduct, form);
      await writeKolamProductDetailCache(syncedProduct);
      const nextProducts = upsertProduct(products, syncedProduct);
      await writeKolamProductListCache({
        data: nextProducts,
        pagination,
      });
      setProducts(nextProducts);
      setSelectedProduct(syncedProduct);
      setForm(createKolamProductFormState(syncedProduct));
      setMode('detail');
      setDataSource('live');
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }, [form, mode, pagination, products, selectedProduct?.id]);

  const breadcrumbPath = useMemo(
    () => getKolamProductBreadcrumbPath(mode, selectedProduct),
    [mode, selectedProduct],
  );

  return {
    brands,
    breadcrumbPath,
    categories,
    dataSource,
    error,
    filters,
    form,
    isEditable: mode === 'edit' || mode === 'new',
    loading,
    mode,
    pagination,
    productOptions,
    products,
    saving,
    selectedProduct,
    species,
    tags,
    units,
    onAddAttachedItem,
    onBackToList,
    onChangeForm,
    onChangeFilters,
    onCreateNew,
    onEdit,
    onLimitChange,
    onPageChange,
    onRefresh: refresh,
    onArchiveProduct,
    onDeleteProduct,
    onDuplicateProduct,
    onRemoveAttachedItem,
    onRestoreProduct,
    onSave,
    onSearchChange,
    onTogglePin,
    onSelectProduct,
  };
}

function createInitialFilters(route: string): KolamProductListFilters {
  return {
    search: '',
    categoryIds: [],
    brandIds: [],
    stockStatus: '',
    sortBy: '',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
    archived: route.split('?')[0] === '/products/archive',
  };
}

function createListRequest(
  filters: KolamProductListFilters,
): GetKolamProductsOptions {
  return {
    page: filters.page,
    limit: filters.limit,
    search: filters.search.trim() || undefined,
    type: 'product',
    category: filters.categoryIds.length ? filters.categoryIds : undefined,
    brand: filters.brandIds.length ? filters.brandIds : undefined,
    sortBy: filters.sortBy || undefined,
    sortOrder: filters.sortBy ? filters.sortOrder : undefined,
    stockStatus: filters.stockStatus || undefined,
    view: 'list',
    archived: filters.archived || undefined,
  };
}

function isDefaultListFilters(filters: KolamProductListFilters) {
  return (
    !filters.search.trim() &&
    !filters.categoryIds.length &&
    !filters.brandIds.length &&
    !filters.stockStatus &&
    !filters.sortBy &&
    filters.sortOrder === 'desc' &&
    filters.page === 1 &&
    filters.limit === 10 &&
    !filters.archived
  );
}

function validateKolamProductFormForSave(form: KolamProductFormState) {
  if (!form.brandIds.length) {
    return 'Pilih minimal satu merek.';
  }

  if (!form.unitId.trim()) {
    return 'Pilih satuan produk.';
  }

  if (form.productType === 'raw' && !form.productCode.trim()) {
    return 'Kode produk wajib diisi untuk raw material.';
  }

  if (form.productType !== 'raw' && !form.sku.trim()) {
    return 'SKU wajib diisi untuk produk.';
  }

  return null;
}

async function syncProductSeoIfNeeded(
  product: KolamProduct,
  form: KolamProductFormState,
) {
  const metaTitle = form.seoMetaTitle.trim();
  const metaDescription = form.seoMetaDescription.trim();
  const keywords = normalizeSeoKeywordsText(form.seoKeywords);
  const currentKeywords = normalizeSeoKeywordsText(
    (product.seo.keywords ?? []).join(', '),
  );

  if (
    metaTitle === product.seo.metaTitle.trim() &&
    metaDescription === product.seo.metaDescription.trim() &&
    keywords === currentKeywords
  ) {
    return product;
  }

  return updateKolamProductSeo(product.id, {
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

function tagActiveUnits(units: KolamUnit[]) {
  return units.filter(unit => unit.status !== 'inactive');
}

function applyProductListResult(
  result: KolamProductListResult,
  setProducts: (products: KolamProduct[]) => void,
  setPagination: (pagination: KolamProductPagination) => void,
) {
  setProducts(result.data);
  setPagination(result.pagination);
}

function getInitialMode(route: string): KolamProductSurfaceMode {
  const routePath = route.split('?')[0];

  if (routePath === '/products/create' || routePath === '/products/baru') {
    return 'new';
  }

  if (routePath.endsWith('/edit') && getRouteProductKey(routePath)) {
    return 'edit';
  }

  if (getRouteProductKey(routePath)) {
    return 'detail';
  }

  return 'list';
}

function getRouteProductKey(route: string) {
  const routePath = route.split('?')[0];
  const detailRoute = routePath.match(/^\/products\/([^/]+)(?:\/edit)?$/);
  const key = detailRoute?.[1];

  if (!key || key === 'create' || key === 'baru' || key === 'archive') {
    return null;
  }

  return decodeURIComponent(key);
}

function productMatchesRouteKey(product: KolamProduct, key: string) {
  const normalizedKey = slugifyProductName(key);
  const lowerKey = key.toLowerCase();
  const productSlug = product.slug || slugifyProductName(product.name);

  return (
    product.id === key ||
    product.id.toLowerCase() === lowerKey ||
    product.slug === key ||
    productSlug === normalizedKey ||
    product.sku.toLowerCase() === lowerKey ||
    product.productCode.toLowerCase() === lowerKey ||
    product.name.toLowerCase() === lowerKey
  );
}

async function resolveRouteProduct(routeProductKey: string, products: KolamProduct[]) {
  return (
    products.find(product => productMatchesRouteKey(product, routeProductKey)) ??
    (await readKolamProductFromListCacheByRouteKey(routeProductKey)) ??
    createRouteProductStub(routeProductKey)
  );
}

function createRouteProductStub(key: string): KolamProduct {
  return {
    id: key,
    name: key,
    slug: slugifyProductName(key),
    sku: '',
    productCode: '',
    type: 'product',
    status: 'Aktif',
    labels: [],
    thumbnailUri: '',
    photoUris: [],
    categories: [],
    brands: [],
    description: '',
    attachedItems: [],
    customFields: [],
    components: [],
    packings: [],
    assets: [],
    warranty: {
      days: 0,
      label: 'Tanpa garansi',
      mode: 'none',
      termsExcerpt: '',
      termsTitle: '',
      vendorName: '',
    },
    seo: {
      faqCount: 0,
      keywords: [],
      lastAuditedAt: '',
      lastSeoScore: 0,
      metaDescription: '',
      metaTitle: '',
    },
    externalLinks: [],
    logistics: {
      dimensionLabel: '-',
      height: 0,
      length: 0,
      shippingMethods: [],
      volume: 0,
      weight: 0,
      weightLabel: '-',
      width: 0,
    },
    localeBlocks: [
      {
        description: '',
        locale: 'id',
        localeLabel: 'Indonesia',
        name: key,
        shortDescription: '',
      },
    ],
    shortDescription: '',
    tags: [],
    locationLabel: '',
    videos: [],
    variants: [],
    variantCount: 0,
    hasVariants: false,
    unitLabel: '',
    price: 0,
    priceToSell: 0,
    marketPrice: 0,
    onlinePrice: 0,
    minimumPriceToSales: 0,
    minimumOrderQty: 0,
    vendorPriceRangeLabel: 'Belum ada harga vendor',
    grocerPricingTiers: [],
    memberPoints: { enabled: false, points: 0 },
    commission: { enabled: false, label: 'Nonaktif', type: 'percentage', value: 0 },
    stock: 0,
    lowStockThreshold: 0,
    sellable: true,
    isPinned: false,
    marketplaceSync: {
      label: 'Belum sinkron',
      platforms: [],
      pricePlatforms: [],
    },
    createdAt: '',
    updatedAt: '',
    raw: {},
  };
}

function upsertProduct(products: KolamProduct[], product: KolamProduct) {
  const exists = products.some(item => item.id === product.id);
  if (!exists) {
    return [...products, product].sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  }

  return products.map(item => (item.id === product.id ? product : item));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Terjadi kendala saat membaca data produk.';
}







