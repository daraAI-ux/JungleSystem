import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getKolamSupplierBreadcrumbPath,
  getKolamSupplierRouteId,
  isKolamSupplierListRoute,
  isKolamSupplierRoute,
  type KolamVendor,
} from '../domain/kolam-vendor';
import { getKolamVendor, getKolamVendors } from '../services/kolam-vendor-api';
import {
  readKolamVendorDetailCache,
  readKolamVendorFromListCacheById,
  readKolamVendorListCache,
  writeKolamVendorDetailCache,
  writeKolamVendorListCache,
} from '../services/kolam-vendor-local-cache';

export type KolamSupplierSurfaceMode = 'list' | 'detail' | 'unsupported';
export type KolamSupplierDataSource = 'idle' | 'cache' | 'live' | 'error';

export interface KolamSupplierController {
  breadcrumbPath: string;
  dataSource: KolamSupplierDataSource;
  error: string | null;
  loading: boolean;
  mode: KolamSupplierSurfaceMode;
  selectedVendor: KolamVendor | null;
  vendors: KolamVendor[];
  onBackToList: () => void;
  onRefresh: () => Promise<void>;
  onSelectVendor: (vendor: KolamVendor) => Promise<void>;
}

export function useKolamSupplierController(
  route: string,
): KolamSupplierController {
  const initialMode = getInitialMode(route);
  const [vendors, setVendors] = useState<KolamVendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<KolamVendor | null>(
    null,
  );
  const [mode, setMode] = useState<KolamSupplierSurfaceMode>(initialMode);
  const [loading, setLoading] = useState(false);
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
      const liveVendors = await getKolamVendors();
      await writeKolamVendorListCache(liveVendors);
      setVendors(liveVendors);
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
    if (initialMode === 'list' || initialMode === 'unsupported') {
      setSelectedVendor(null);
    }
  }, [initialMode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onSelectVendor = useCallback(async (vendor: KolamVendor) => {
    setMode('detail');
    setSelectedVendor(vendor);
    setError(null);

    const cached = await readKolamVendorDetailCache(vendor.id);
    if (cached?.value) {
      setSelectedVendor(cached.value);
      setDataSource('cache');
    }

    try {
      const liveVendor = await getKolamVendor(vendor.id);
      await writeKolamVendorDetailCache(liveVendor);
      setSelectedVendor(liveVendor);
      setDataSource('live');
    } catch (detailError) {
      setError(getErrorMessage(detailError));
      setDataSource(cached?.value || vendor ? 'cache' : 'error');
    }
  }, []);

  useEffect(() => {
    if (mode !== 'detail') {
      return;
    }

    const routeId = getKolamSupplierRouteId(route);
    if (!routeId) {
      return;
    }

    if (selectedVendor?.id === routeId) {
      return;
    }

    let active = true;
    void resolveRouteVendor(routeId, vendors).then(vendor => {
      if (active) {
        void onSelectVendor(vendor);
      }
    });

    return () => {
      active = false;
    };
  }, [mode, onSelectVendor, route, selectedVendor, vendors]);

  const onBackToList = useCallback(() => {
    setMode('list');
    setSelectedVendor(null);
    setError(null);
  }, []);

  const breadcrumbPath = useMemo(
    () => getKolamSupplierBreadcrumbPath(mode === 'detail' ? 'detail' : 'list', selectedVendor),
    [mode, selectedVendor],
  );

  return {
    breadcrumbPath,
    dataSource,
    error,
    loading,
    mode,
    selectedVendor,
    vendors,
    onBackToList,
    onRefresh: refresh,
    onSelectVendor,
  };
}

function getInitialMode(route: string): KolamSupplierSurfaceMode {
  if (!isKolamSupplierRoute(route)) {
    return 'list';
  }
  const path = route.trim().split('?')[0] || '';
  if (path.endsWith('/create') || path.endsWith('/edit')) {
    return 'unsupported';
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

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return 'Gagal memuat data pemasok';
}
