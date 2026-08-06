import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createEmptyKolamPackingMaterialFormState,
  createKolamPackingMaterialFormState,
  getKolamPackingMaterialBreadcrumbPath,
  isKolamPackingMaterialRoute,
  slugifyPackingMaterialName,
  type KolamPackingMaterial,
  type KolamPackingMaterialFormState,
} from '../domain/kolam-packing-option';
import type { KolamUnit } from '../domain/kolam-unit';
import {
  createKolamPackingMaterial,
  deleteKolamPackingMaterial,
  getKolamPackingMaterial,
  getKolamPackingMaterials,
  updateKolamPackingMaterial,
} from '../services/kolam-packing-option-api';
import {
  readKolamPackingMaterialDetailCache,
  readKolamPackingMaterialFromListCacheByRouteKey,
  readKolamPackingMaterialListCache,
  removeKolamPackingMaterialDetailCache,
  writeKolamPackingMaterialDetailCache,
  writeKolamPackingMaterialListCache,
} from '../services/kolam-packing-option-local-cache';
import { getKolamUnits } from '../services/kolam-unit-api';

export type KolamPackingMaterialSurfaceMode = 'list' | 'detail' | 'edit' | 'new';
export type KolamPackingMaterialDataSource = 'idle' | 'cache' | 'live' | 'error';

export interface KolamPackingMaterialController {
  breadcrumbPath: string;
  dataSource: KolamPackingMaterialDataSource;
  error: string | null;
  form: KolamPackingMaterialFormState;
  isEditable: boolean;
  loading: boolean;
  mode: KolamPackingMaterialSurfaceMode;
  saving: boolean;
  selectedMaterial: KolamPackingMaterial | null;
  materials: KolamPackingMaterial[];
  units: KolamUnit[];
  onBackToList: () => void;
  onChangeForm: (patch: Partial<KolamPackingMaterialFormState>) => void;
  onCreateNew: () => void;
  onDeleteMaterial: (item: KolamPackingMaterial) => Promise<boolean>;
  onEdit: () => void;
  onRefresh: () => Promise<void>;
  onSave: () => Promise<void>;
  onSelectMaterial: (item: KolamPackingMaterial) => Promise<void>;
}

export function useKolamPackingMaterialController(
  route: string,
): KolamPackingMaterialController {
  const initialMode = getInitialMode(route);
  const [materials, setMaterials] = useState<KolamPackingMaterial[]>([]);
  const [selectedMaterial, setSelectedMaterial] =
    useState<KolamPackingMaterial | null>(null);
  const [mode, setMode] =
    useState<KolamPackingMaterialSurfaceMode>(initialMode);
  const [form, setForm] = useState<KolamPackingMaterialFormState>(() =>
    createEmptyKolamPackingMaterialFormState(),
  );
  const [units, setUnits] = useState<KolamUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamPackingMaterialDataSource>('idle');

  const refresh = useCallback(async () => {
    if (!isKolamPackingMaterialRoute(route)) {
      return;
    }

    setLoading(true);
    setError(null);

    const cached = await readKolamPackingMaterialListCache();
    if (cached?.value.length) {
      setMaterials(cached.value);
      setDataSource('cache');
    }

    void getKolamUnits()
      .then(setUnits)
      .catch(() => setUnits([]));

    try {
      const liveMaterials = await getKolamPackingMaterials({ limit: 1000, page: 1 });
      await writeKolamPackingMaterialListCache(liveMaterials);
      setMaterials(liveMaterials);
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
      setSelectedMaterial(null);
      setForm(createEmptyKolamPackingMaterialFormState());
    }
  }, [initialMode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onSelectMaterial = useCallback(async (item: KolamPackingMaterial) => {
    setMode('detail');
    setSelectedMaterial(item);
    setForm(createKolamPackingMaterialFormState(item));
    setError(null);

    const cached = await readKolamPackingMaterialDetailCache(item.id);
    if (cached?.value) {
      setSelectedMaterial(cached.value);
      setForm(createKolamPackingMaterialFormState(cached.value));
      setDataSource('cache');
    }

    try {
      const liveItem = await getKolamPackingMaterial(item.id);
      await writeKolamPackingMaterialDetailCache(liveItem);
      setSelectedMaterial(liveItem);
      setForm(createKolamPackingMaterialFormState(liveItem));
      setDataSource('live');
    } catch (detailError) {
      setError(getErrorMessage(detailError));
      setDataSource(cached?.value || item ? 'cache' : 'error');
    }
  }, []);

  useEffect(() => {
    const routeKey = getRouteMaterialKey(route);
    if (!routeKey || mode === 'new') {
      return;
    }

    const routeMaterial = materials.find(item =>
      materialMatchesRouteKey(item, routeKey),
    );

    if (selectedMaterial && materialMatchesRouteKey(selectedMaterial, routeKey)) {
      if (!routeMaterial || selectedMaterial.id === routeMaterial.id) {
        return;
      }
    }

    let active = true;
    void (routeMaterial
      ? Promise.resolve(routeMaterial)
      : resolveRouteMaterial(routeKey, materials)
    ).then(item => {
      if (active) {
        void onSelectMaterial(item);
      }
    });

    return () => {
      active = false;
    };
  }, [materials, mode, onSelectMaterial, route, selectedMaterial]);

  const onBackToList = useCallback(() => {
    setMode('list');
    setSelectedMaterial(null);
    setForm(createEmptyKolamPackingMaterialFormState());
  }, []);

  const onCreateNew = useCallback(() => {
    setMode('new');
    setSelectedMaterial(null);
    setForm(createEmptyKolamPackingMaterialFormState());
    setError(null);
  }, []);

  const onEdit = useCallback(() => {
    if (selectedMaterial) {
      setMode('edit');
    }
  }, [selectedMaterial]);

  const onChangeForm = useCallback(
    (patch: Partial<KolamPackingMaterialFormState>) => {
      setForm(current => ({ ...current, ...patch }));
    },
    [],
  );

  const onDeleteMaterial = useCallback(
    async (item: KolamPackingMaterial) => {
      setSaving(true);
      setError(null);

      try {
        await deleteKolamPackingMaterial(item.id);
        const nextItem = { ...item, status: 'inactive' as const };
        const nextMaterials = upsertMaterial(materials, nextItem);
        await writeKolamPackingMaterialListCache(nextMaterials);
        await removeKolamPackingMaterialDetailCache(item.id);
        setMaterials(nextMaterials);
        setMode('list');
        setSelectedMaterial(null);
        setForm(createEmptyKolamPackingMaterialFormState());
        setDataSource('live');
        return true;
      } catch (deleteError) {
        setError(getErrorMessage(deleteError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [materials],
  );

  const onSave = useCallback(async () => {
    if (!form.name.trim()) {
      setError('Nama bahan kemasan wajib diisi.');
      return;
    }

    if (!form.category.trim()) {
      setError('Kategori wajib dipilih.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const savedItem =
        mode === 'new'
          ? await createKolamPackingMaterial(form)
          : await updateKolamPackingMaterial(
              selectedMaterial?.id ?? form.id ?? slugifyPackingMaterialName(form.name),
              form,
            );

      await writeKolamPackingMaterialDetailCache(savedItem);
      const nextMaterials = upsertMaterial(materials, savedItem);
      await writeKolamPackingMaterialListCache(nextMaterials);
      setSelectedMaterial(savedItem);
      setForm(createKolamPackingMaterialFormState(savedItem));
      setMaterials(nextMaterials);
      setMode('detail');
      setDataSource('live');
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }, [form, materials, mode, selectedMaterial]);

  const breadcrumbPath = useMemo(
    () => getKolamPackingMaterialBreadcrumbPath(mode, selectedMaterial),
    [mode, selectedMaterial],
  );

  return {
    breadcrumbPath,
    dataSource,
    error,
    form,
    isEditable: mode === 'edit' || mode === 'new',
    loading,
    mode,
    saving,
    selectedMaterial,
    materials,
    units,
    onBackToList,
    onChangeForm,
    onCreateNew,
    onDeleteMaterial,
    onEdit,
    onRefresh: refresh,
    onSave,
    onSelectMaterial,
  };
}

function getInitialMode(route: string): KolamPackingMaterialSurfaceMode {
  const routePath = route.split('?')[0];

  if (
    routePath === `${KOLAM_PACKING_MATERIAL_ROOT}/create` ||
    routePath === `${KOLAM_PACKING_MATERIAL_ROOT}/baru`
  ) {
    return 'new';
  }

  if (routePath.endsWith('/edit') && getRouteMaterialKey(routePath)) {
    return 'edit';
  }

  if (getRouteMaterialKey(routePath)) {
    return 'detail';
  }

  return 'list';
}

const KOLAM_PACKING_MATERIAL_ROOT = '/packing-materials';

function getRouteMaterialKey(route: string) {
  const routePath = route.split('?')[0];
  const detailRoute = routePath.match(/^\/packing-materials\/([^/]+)(?:\/edit)?$/);
  const key = detailRoute?.[1];

  if (!key || key === 'create' || key === 'baru') {
    return null;
  }

  return decodeURIComponent(key);
}

function materialMatchesRouteKey(item: KolamPackingMaterial, key: string) {
  const normalizedKey = slugifyPackingMaterialName(key);
  const lowerKey = key.toLowerCase();

  return (
    item.id === key ||
    item.id.toLowerCase() === lowerKey ||
    slugifyPackingMaterialName(item.name) === normalizedKey ||
    item.name.toLowerCase() === lowerKey
  );
}

async function resolveRouteMaterial(
  routeKey: string,
  materials: KolamPackingMaterial[],
) {
  return (
    materials.find(item => materialMatchesRouteKey(item, routeKey)) ??
    (await readKolamPackingMaterialFromListCacheByRouteKey(routeKey)) ??
    createRouteMaterialStub(routeKey)
  );
}

function createRouteMaterialStub(key: string): KolamPackingMaterial {
  return {
    id: key,
    name: key,
    description: '',
    category: 'Other',
    dimension: { length: null, width: null, height: null, unit: null },
    weight: { value: null, unit: null },
    price: 0,
    cost: 0,
    stock: 0,
    vendorPrices: [],
    photos: [],
    assets: [],
    status: 'active',
    raw: null,
  };
}

function upsertMaterial(
  materials: KolamPackingMaterial[],
  item: KolamPackingMaterial,
) {
  const exists = materials.some(current => current.id === item.id);
  return exists
    ? materials.map(current => (current.id === item.id ? item : current))
    : [item, ...materials];
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return 'Gagal membaca data bahan kemasan dari backend.';
}
