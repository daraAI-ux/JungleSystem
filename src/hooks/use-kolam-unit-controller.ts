import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createEmptyKolamUnitFormState,
  createKolamUnitFormState,
  getKolamUnitBreadcrumbPath,
  isKolamUnitRoute,
  slugifyUnitName,
  type KolamUnit,
  type KolamUnitFormState,
} from '../domain/kolam-unit';
import {
  createKolamUnit,
  deleteKolamUnit,
  getKolamUnit,
  getKolamUnits,
  updateKolamUnit,
} from '../services/kolam-unit-api';
import {
  readKolamUnitDetailCache,
  readKolamUnitFromListCacheByRouteKey,
  readKolamUnitListCache,
  removeKolamUnitDetailCache,
  writeKolamUnitDetailCache,
  writeKolamUnitListCache,
} from '../services/kolam-unit-local-cache';

export type KolamUnitSurfaceMode = 'list' | 'detail' | 'edit' | 'new';
export type KolamUnitDataSource = 'idle' | 'cache' | 'live' | 'error';

export interface KolamUnitController {
  breadcrumbPath: string;
  dataSource: KolamUnitDataSource;
  error: string | null;
  form: KolamUnitFormState;
  isEditable: boolean;
  loading: boolean;
  mode: KolamUnitSurfaceMode;
  saving: boolean;
  selectedUnit: KolamUnit | null;
  units: KolamUnit[];
  onBackToList: () => void;
  onChangeForm: (patch: Partial<KolamUnitFormState>) => void;
  onCreateNew: () => void;
  onDeleteUnit: (unit: KolamUnit) => Promise<boolean>;
  onEdit: () => void;
  onRefresh: () => Promise<void>;
  onSave: () => Promise<void>;
  onSelectUnit: (unit: KolamUnit) => Promise<void>;
}

export function useKolamUnitController(route: string): KolamUnitController {
  const initialMode = getInitialMode(route);
  const [units, setUnits] = useState<KolamUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<KolamUnit | null>(null);
  const [mode, setMode] = useState<KolamUnitSurfaceMode>(initialMode);
  const [form, setForm] = useState<KolamUnitFormState>(() =>
    createEmptyKolamUnitFormState(),
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<KolamUnitDataSource>('idle');

  const refresh = useCallback(async () => {
    if (!isKolamUnitRoute(route)) {
      return;
    }

    setLoading(true);
    setError(null);

    const cached = await readKolamUnitListCache();
    if (cached?.value.length) {
      setUnits(cached.value);
      setDataSource('cache');
    }

    try {
      const liveUnits = await getKolamUnits();
      await writeKolamUnitListCache(liveUnits);
      setUnits(liveUnits);
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
      setSelectedUnit(null);
      setForm(createEmptyKolamUnitFormState());
    }
  }, [initialMode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onSelectUnit = useCallback(async (unit: KolamUnit) => {
    setMode('detail');
    setSelectedUnit(unit);
    setForm(createKolamUnitFormState(unit));
    setError(null);

    const cached = await readKolamUnitDetailCache(unit.id);
    if (cached?.value) {
      setSelectedUnit(cached.value);
      setForm(createKolamUnitFormState(cached.value));
      setDataSource('cache');
    }

    try {
      const liveUnit = await getKolamUnit(unit.id);
      await writeKolamUnitDetailCache(liveUnit);
      setSelectedUnit(liveUnit);
      setForm(createKolamUnitFormState(liveUnit));
      setDataSource('live');
    } catch (detailError) {
      setError(getErrorMessage(detailError));
      setDataSource(cached?.value || unit ? 'cache' : 'error');
    }
  }, []);

  useEffect(() => {
    const routeUnitKey = getRouteUnitKey(route);
    if (!routeUnitKey || mode === 'new') {
      return;
    }

    if (selectedUnit && unitMatchesRouteKey(selectedUnit, routeUnitKey)) {
      return;
    }

    let active = true;
    void resolveRouteUnit(routeUnitKey, units).then(unit => {
      if (active) {
        void onSelectUnit(unit);
      }
    });

    return () => {
      active = false;
    };
  }, [mode, onSelectUnit, route, selectedUnit, units]);

  const onBackToList = useCallback(() => {
    setMode('list');
    setSelectedUnit(null);
    setForm(createEmptyKolamUnitFormState());
  }, []);

  const onCreateNew = useCallback(() => {
    setMode('new');
    setSelectedUnit(null);
    setForm(createEmptyKolamUnitFormState());
    setError(null);
  }, []);

  const onEdit = useCallback(() => {
    if (selectedUnit) {
      setMode('edit');
    }
  }, [selectedUnit]);

  const onChangeForm = useCallback((patch: Partial<KolamUnitFormState>) => {
    setForm(current => ({ ...current, ...patch }));
  }, []);

  const onDeleteUnit = useCallback(
    async (unit: KolamUnit) => {
      setSaving(true);
      setError(null);

      try {
        await deleteKolamUnit(unit.id);
        const nextUnits = units.filter(item => item.id !== unit.id);
        await writeKolamUnitListCache(nextUnits);
        await removeKolamUnitDetailCache(unit.id);
        setUnits(nextUnits);
        setMode('list');
        setSelectedUnit(null);
        setForm(createEmptyKolamUnitFormState());
        setDataSource('live');
        return true;
      } catch (deleteError) {
        setError(getErrorMessage(deleteError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [units],
  );

  const onSave = useCallback(async () => {
    if (!form.name.trim()) {
      setError('Nama satuan wajib diisi.');
      return;
    }

    if (!form.initial.trim()) {
      setError('Simbol atau inisial wajib diisi.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const savedUnit =
        mode === 'new'
          ? await createKolamUnit(form)
          : await updateKolamUnit(
              selectedUnit?.id ?? form.id ?? slugifyUnitName(form.name),
              form,
            );

      await writeKolamUnitDetailCache(savedUnit);
      setSelectedUnit(savedUnit);
      setForm(createKolamUnitFormState(savedUnit));
      setMode('detail');
      setUnits(current => upsertUnit(current, savedUnit));
      await writeKolamUnitListCache(upsertUnit(units, savedUnit));
      setDataSource('live');
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }, [form, mode, selectedUnit, units]);

  const breadcrumbPath = useMemo(
    () => getKolamUnitBreadcrumbPath(mode, selectedUnit),
    [mode, selectedUnit],
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
    selectedUnit,
    units,
    onBackToList,
    onChangeForm,
    onCreateNew,
    onDeleteUnit,
    onEdit,
    onRefresh: refresh,
    onSave,
    onSelectUnit,
  };
}

function getInitialMode(route: string): KolamUnitSurfaceMode {
  const routePath = route.split('?')[0];

  if (routePath === '/units/create' || routePath === '/units/baru') {
    return 'new';
  }

  if (routePath.endsWith('/edit') && getRouteUnitKey(routePath)) {
    return 'edit';
  }

  if (getRouteUnitKey(routePath)) {
    return 'detail';
  }

  return 'list';
}

function getRouteUnitKey(route: string) {
  const routePath = route.split('?')[0];
  const detailRoute = routePath.match(/^\/units\/([^/]+)(?:\/edit)?$/);
  const key = detailRoute?.[1];

  if (!key || key === 'create' || key === 'baru') {
    return null;
  }

  return decodeURIComponent(key);
}

function unitMatchesRouteKey(unit: KolamUnit, key: string) {
  const normalizedKey = slugifyUnitName(key);
  const lowerKey = key.toLowerCase();

  return (
    unit.id === key ||
    unit.id.toLowerCase() === lowerKey ||
    unit.initial.toLowerCase() === lowerKey ||
    slugifyUnitName(unit.name) === normalizedKey ||
    unit.name.toLowerCase() === lowerKey
  );
}

async function resolveRouteUnit(routeUnitKey: string, units: KolamUnit[]) {
  return (
    units.find(unit => unitMatchesRouteKey(unit, routeUnitKey)) ??
    (await readKolamUnitFromListCacheByRouteKey(routeUnitKey)) ??
    createRouteUnitStub(routeUnitKey)
  );
}

function createRouteUnitStub(key: string): KolamUnit {
  return {
    id: key,
    name: key,
    initial: key,
    type: null,
    category: '',
    isBase: false,
    status: 'active',
    raw: {},
  };
}

function upsertUnit(units: KolamUnit[], unit: KolamUnit) {
  const exists = units.some(item => item.id === unit.id);
  if (!exists) {
    return [...units, unit].sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  }

  return units.map(item => (item.id === unit.id ? unit : item));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Terjadi kendala saat membaca data satuan.';
}
