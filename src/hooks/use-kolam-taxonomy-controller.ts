import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createEmptyKolamTaxonomyFormState,
  createKolamTaxonomyFormState,
  getKolamTaxonomyBreadcrumbPath,
  isKolamTaxonomyRoute,
  slugifyTaxonomyName,
  type KolamTaxonomy,
  type KolamTaxonomyFormState,
} from '../domain/kolam-taxonomy';
import {
  createKolamTaxonomy,
  deleteKolamTaxonomy,
  getKolamTaxonomies,
  getKolamTaxonomy,
  updateKolamTaxonomy,
} from '../services/kolam-taxonomy-api';
import {
  readKolamTaxonomyDetailCache,
  readKolamTaxonomyFromListCacheByRouteKey,
  readKolamTaxonomyListCache,
  removeKolamTaxonomyDetailCache,
  writeKolamTaxonomyDetailCache,
  writeKolamTaxonomyListCache,
} from '../services/kolam-taxonomy-local-cache';

export type KolamTaxonomySurfaceMode = 'list' | 'detail' | 'edit' | 'new';
export type KolamTaxonomyDataSource = 'idle' | 'cache' | 'live' | 'error';

export interface KolamTaxonomyController {
  breadcrumbPath: string;
  dataSource: KolamTaxonomyDataSource;
  error: string | null;
  form: KolamTaxonomyFormState;
  isEditable: boolean;
  loading: boolean;
  mode: KolamTaxonomySurfaceMode;
  saving: boolean;
  selectedTaxonomy: KolamTaxonomy | null;
  taxonomies: KolamTaxonomy[];
  onBackToList: () => void;
  onChangeForm: (patch: Partial<KolamTaxonomyFormState>) => void;
  onCreateNew: () => void;
  onDeleteTaxonomy: (taxonomy: KolamTaxonomy) => Promise<boolean>;
  onEdit: () => void;
  onRefresh: () => Promise<void>;
  onSave: () => Promise<void>;
  onSelectTaxonomy: (taxonomy: KolamTaxonomy) => Promise<void>;
}

export function useKolamTaxonomyController(
  route: string,
): KolamTaxonomyController {
  const initialMode = getInitialMode(route);
  const [taxonomies, setTaxonomies] = useState<KolamTaxonomy[]>([]);
  const [selectedTaxonomy, setSelectedTaxonomy] =
    useState<KolamTaxonomy | null>(null);
  const [mode, setMode] = useState<KolamTaxonomySurfaceMode>(initialMode);
  const [form, setForm] = useState<KolamTaxonomyFormState>(() =>
    createEmptyKolamTaxonomyFormState(),
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamTaxonomyDataSource>('idle');

  const refresh = useCallback(async () => {
    if (!isKolamTaxonomyRoute(route)) {
      return;
    }

    setLoading(true);
    setError(null);

    const cached = await readKolamTaxonomyListCache();
    if (cached?.value.length) {
      setTaxonomies(cached.value);
      setDataSource('cache');
    }

    try {
      const liveTaxonomies = await getKolamTaxonomies({ limit: 1000 });
      await writeKolamTaxonomyListCache(liveTaxonomies);
      setTaxonomies(liveTaxonomies);
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
      setSelectedTaxonomy(null);
      setForm(createEmptyKolamTaxonomyFormState());
    }
  }, [initialMode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onSelectTaxonomy = useCallback(async (taxonomy: KolamTaxonomy) => {
    setMode('detail');
    setSelectedTaxonomy(taxonomy);
    setForm(createKolamTaxonomyFormState(taxonomy));
    setError(null);

    const cached = await readKolamTaxonomyDetailCache(taxonomy.id);
    if (cached?.value) {
      setSelectedTaxonomy(cached.value);
      setForm(createKolamTaxonomyFormState(cached.value));
      setDataSource('cache');
    }

    try {
      const liveTaxonomy = await getKolamTaxonomy(taxonomy.id);
      await writeKolamTaxonomyDetailCache(liveTaxonomy);
      setSelectedTaxonomy(liveTaxonomy);
      setForm(createKolamTaxonomyFormState(liveTaxonomy));
      setDataSource('live');
    } catch (detailError) {
      setError(getErrorMessage(detailError));
      setDataSource(cached?.value || taxonomy ? 'cache' : 'error');
    }
  }, []);

  useEffect(() => {
    const routeTaxonomyKey = getRouteTaxonomyKey(route);
    if (!routeTaxonomyKey || mode === 'new') {
      return;
    }

    if (
      selectedTaxonomy &&
      taxonomyMatchesRouteKey(selectedTaxonomy, routeTaxonomyKey)
    ) {
      return;
    }

    let active = true;
    void resolveRouteTaxonomy(routeTaxonomyKey, taxonomies).then(taxonomy => {
      if (active) {
        void onSelectTaxonomy(taxonomy);
      }
    });

    return () => {
      active = false;
    };
  }, [mode, onSelectTaxonomy, route, selectedTaxonomy, taxonomies]);

  const onBackToList = useCallback(() => {
    setMode('list');
    setSelectedTaxonomy(null);
    setForm(createEmptyKolamTaxonomyFormState());
  }, []);

  const onCreateNew = useCallback(() => {
    setMode('new');
    setSelectedTaxonomy(null);
    setForm(createEmptyKolamTaxonomyFormState());
    setError(null);
  }, []);

  const onEdit = useCallback(() => {
    if (selectedTaxonomy) {
      setMode('edit');
    }
  }, [selectedTaxonomy]);

  const onChangeForm = useCallback((patch: Partial<KolamTaxonomyFormState>) => {
    setForm(current => ({ ...current, ...patch }));
  }, []);

  const onDeleteTaxonomy = useCallback(
    async (taxonomy: KolamTaxonomy) => {
      setSaving(true);
      setError(null);

      try {
        await deleteKolamTaxonomy(taxonomy.id);
        const nextTaxonomies = taxonomies.filter(item => item.id !== taxonomy.id);
        await writeKolamTaxonomyListCache(nextTaxonomies);
        await removeKolamTaxonomyDetailCache(taxonomy.id);
        setTaxonomies(nextTaxonomies);
        setMode('list');
        setSelectedTaxonomy(null);
        setForm(createEmptyKolamTaxonomyFormState());
        setDataSource('live');
        return true;
      } catch (deleteError) {
        setError(getErrorMessage(deleteError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [taxonomies],
  );

  const onSave = useCallback(async () => {
    if (!form.name.trim()) {
      setError('Nama taksonomi wajib diisi.');
      return;
    }

    if (form.level !== 'Kingdom' && !form.parentId.trim() && mode === 'new') {
      setError('Induk taksonomi wajib dipilih untuk level selain Kerajaan.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const savedTaxonomy =
        mode === 'new'
          ? await createKolamTaxonomy(form)
          : await updateKolamTaxonomy(
              selectedTaxonomy?.id ?? form.id ?? slugifyTaxonomyName(form.name),
              form,
            );

      await writeKolamTaxonomyDetailCache(savedTaxonomy);
      setSelectedTaxonomy(savedTaxonomy);
      setForm(createKolamTaxonomyFormState(savedTaxonomy));
      setMode('detail');
      setTaxonomies(current => upsertTaxonomy(current, savedTaxonomy));
      await writeKolamTaxonomyListCache(
        upsertTaxonomy(taxonomies, savedTaxonomy),
      );
      setDataSource('live');
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }, [form, mode, selectedTaxonomy, taxonomies]);

  const breadcrumbPath = useMemo(
    () => getKolamTaxonomyBreadcrumbPath(mode, selectedTaxonomy),
    [mode, selectedTaxonomy],
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
    selectedTaxonomy,
    taxonomies,
    onBackToList,
    onChangeForm,
    onCreateNew,
    onDeleteTaxonomy,
    onEdit,
    onRefresh: refresh,
    onSave,
    onSelectTaxonomy,
  };
}

function getInitialMode(route: string): KolamTaxonomySurfaceMode {
  const routePath = route.split('?')[0];

  if (routePath === '/taxonomy/create' || routePath === '/taxonomy/baru') {
    return 'new';
  }

  if (routePath.endsWith('/edit') && getRouteTaxonomyKey(routePath)) {
    return 'edit';
  }

  if (getRouteTaxonomyKey(routePath)) {
    return 'detail';
  }

  return 'list';
}

function getRouteTaxonomyKey(route: string) {
  const routePath = route.split('?')[0];
  const detailRoute = routePath.match(/^\/taxonomy\/([^/]+)(?:\/edit)?$/);
  const key = detailRoute?.[1];

  if (!key || key === 'create' || key === 'baru') {
    return null;
  }

  return decodeURIComponent(key);
}

function taxonomyMatchesRouteKey(taxonomy: KolamTaxonomy, key: string) {
  const normalizedKey = slugifyTaxonomyName(key);
  const lowerKey = key.toLowerCase();

  return (
    taxonomy.id === key ||
    taxonomy.id.toLowerCase() === lowerKey ||
    taxonomy.slug.toLowerCase() === lowerKey ||
    slugifyTaxonomyName(taxonomy.name) === normalizedKey ||
    taxonomy.name.toLowerCase() === lowerKey
  );
}

async function resolveRouteTaxonomy(
  routeTaxonomyKey: string,
  taxonomies: KolamTaxonomy[],
) {
  return (
    taxonomies.find(taxonomy => taxonomyMatchesRouteKey(taxonomy, routeTaxonomyKey)) ??
    (await readKolamTaxonomyFromListCacheByRouteKey(routeTaxonomyKey)) ??
    createRouteTaxonomyStub(routeTaxonomyKey)
  );
}

function createRouteTaxonomyStub(key: string): KolamTaxonomy {
  return {
    id: key,
    name: key,
    level: 'Kingdom',
    parentId: null,
    parentName: null,
    path: '',
    slug: slugifyTaxonomyName(key),
    ancestors: [],
    children: [],
    fullPath: [],
    description: '',
    scientificName: '',
    commonName: '',
    photos: [],
    status: 'active',
    translations: {},
    raw: {},
  };
}

function upsertTaxonomy(
  taxonomies: KolamTaxonomy[],
  taxonomy: KolamTaxonomy,
) {
  const exists = taxonomies.some(item => item.id === taxonomy.id);
  if (!exists) {
    return [...taxonomies, taxonomy].sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  }

  return taxonomies.map(item => (item.id === taxonomy.id ? taxonomy : item));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Terjadi kendala saat membaca data taksonomi.';
}
