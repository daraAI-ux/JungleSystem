import { useCallback, useEffect, useState } from 'react';
import { flattenAllCategories, type KolamCategory } from '../domain/kolam-category';
import type { KolamBrand } from '../domain/kolam-brand';
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
  getKolamTeranuraDetail,
  getKolamTeranuras,
} from '../services/kolam-teranura-api';

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
  dataSource: KolamTeranuraDataSource;
  error: string | null;
  filters: KolamTeranuraListFilters;
  items: KolamTeranura[];
  loading: boolean;
  mode: KolamTeranuraSurfaceMode;
  pagination: KolamTeranuraPagination;
  selectedItem: KolamTeranura | null;
  onChangeFilters: (patch: Partial<KolamTeranuraListFilters>) => void;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => Promise<void>;
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

export function useKolamTeranuraController(route = '/teranura'): KolamTeranuraController {
  const mode = getKolamTeranuraSurfaceMode(route);
  const detailId = getKolamTeranuraRouteId(route);
  const [items, setItems] = useState<KolamTeranura[]>([]);
  const [selectedItem, setSelectedItem] = useState<KolamTeranura | null>(null);
  const [categories, setCategories] = useState<KolamCategory[]>([]);
  const [brands, setBrands] = useState<KolamBrand[]>([]);
  const [filters, setFilters] =
    useState<KolamTeranuraListFilters>(DEFAULT_FILTERS);
  const [pagination, setPagination] =
    useState<KolamTeranuraPagination>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<KolamTeranuraDataSource>('idle');

  const refreshOptions = useCallback(async () => {
    const [categoryList, brandList] = await Promise.all([
      getKolamCategories(),
      getKolamBrands(),
    ]);

    setCategories(flattenAllCategories(categoryList));
    setBrands(brandList);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (mode === 'detail') {
        const item = await getKolamTeranuraDetail(detailId);
        setSelectedItem(item);
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
      setError(caught instanceof Error ? caught.message : 'Gagal memuat Teranura.');
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [detailId, filters, mode]);

  useEffect(() => {
    void refreshOptions().catch(caught => {
      setError(caught instanceof Error ? caught.message : 'Gagal memuat opsi Teranura.');
    });
  }, [refreshOptions]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onChangeFilters = useCallback((patch: Partial<KolamTeranuraListFilters>) => {
    setFilters(current => ({
      ...current,
      ...patch,
      page: patch.page ?? 1,
    }));
  }, []);

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

  return {
    brands,
    categories,
    dataSource,
    error,
    filters,
    items,
    loading,
    mode,
    pagination,
    selectedItem,
    onChangeFilters,
    onLimitChange,
    onPageChange,
    onRefresh: refresh,
    onSearchChange,
  };
}
