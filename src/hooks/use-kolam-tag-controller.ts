import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createEmptyKolamTagFormState,
  createKolamTagFormState,
  getKolamTagBreadcrumbPath,
  isKolamTagRoute,
  slugifyTagName,
  type KolamTag,
  type KolamTagFormState,
} from '../domain/kolam-tag';
import {
  createKolamTag,
  deleteKolamTag,
  getKolamTag,
  getKolamTags,
  updateKolamTag,
} from '../services/kolam-tag-api';
import {
  readKolamTagDetailCache,
  readKolamTagFromListCacheByRouteKey,
  readKolamTagListCache,
  removeKolamTagDetailCache,
  writeKolamTagDetailCache,
  writeKolamTagListCache,
} from '../services/kolam-tag-local-cache';

export type KolamTagSurfaceMode = 'list' | 'detail' | 'edit' | 'new';
export type KolamTagDataSource = 'idle' | 'cache' | 'live' | 'error';

export interface KolamTagController {
  breadcrumbPath: string;
  dataSource: KolamTagDataSource;
  error: string | null;
  form: KolamTagFormState;
  isEditable: boolean;
  loading: boolean;
  mode: KolamTagSurfaceMode;
  saving: boolean;
  selectedTag: KolamTag | null;
  tags: KolamTag[];
  onBackToList: () => void;
  onChangeForm: (patch: Partial<KolamTagFormState>) => void;
  onCreateNew: () => void;
  onDeleteTag: (tag: KolamTag) => Promise<boolean>;
  onEdit: () => void;
  onRefresh: () => Promise<void>;
  onSave: () => Promise<void>;
  onSelectTag: (tag: KolamTag) => Promise<void>;
}

export function useKolamTagController(route: string): KolamTagController {
  const initialMode = getInitialMode(route);
  const [tags, setTags] = useState<KolamTag[]>([]);
  const [selectedTag, setSelectedTag] = useState<KolamTag | null>(null);
  const [mode, setMode] = useState<KolamTagSurfaceMode>(initialMode);
  const [form, setForm] = useState<KolamTagFormState>(() =>
    createEmptyKolamTagFormState(),
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<KolamTagDataSource>('idle');

  const refresh = useCallback(async () => {
    if (!isKolamTagRoute(route)) {
      return;
    }

    setLoading(true);
    setError(null);

    const cached = await readKolamTagListCache();
    if (cached?.value.length) {
      setTags(cached.value);
      setDataSource('cache');
    }

    try {
      const liveTags = await getKolamTags();
      await writeKolamTagListCache(liveTags);
      setTags(liveTags);
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
      setSelectedTag(null);
      setForm(createEmptyKolamTagFormState());
    }
  }, [initialMode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onSelectTag = useCallback(async (tag: KolamTag) => {
    setMode('detail');
    setSelectedTag(tag);
    setForm(createKolamTagFormState(tag));
    setError(null);

    const cached = await readKolamTagDetailCache(tag.id);
    if (cached?.value) {
      setSelectedTag(cached.value);
      setForm(createKolamTagFormState(cached.value));
      setDataSource('cache');
    }

    try {
      const liveTag = await getKolamTag(tag.id);
      await writeKolamTagDetailCache(liveTag);
      setSelectedTag(liveTag);
      setForm(createKolamTagFormState(liveTag));
      setDataSource('live');
    } catch (detailError) {
      setError(getErrorMessage(detailError));
      setDataSource(cached?.value || tag ? 'cache' : 'error');
    }
  }, []);

  useEffect(() => {
    const routeTagKey = getRouteTagKey(route);
    if (!routeTagKey || mode === 'new') {
      return;
    }

    if (selectedTag && tagMatchesRouteKey(selectedTag, routeTagKey)) {
      return;
    }

    let active = true;
    void resolveRouteTag(routeTagKey, tags).then(tag => {
      if (active) {
        void onSelectTag(tag);
      }
    });

    return () => {
      active = false;
    };
  }, [mode, onSelectTag, route, selectedTag, tags]);

  const onBackToList = useCallback(() => {
    setMode('list');
    setSelectedTag(null);
    setForm(createEmptyKolamTagFormState());
  }, []);

  const onCreateNew = useCallback(() => {
    setMode('new');
    setSelectedTag(null);
    setForm(createEmptyKolamTagFormState());
    setError(null);
  }, []);

  const onEdit = useCallback(() => {
    if (selectedTag) {
      setMode('edit');
    }
  }, [selectedTag]);

  const onChangeForm = useCallback((patch: Partial<KolamTagFormState>) => {
    setForm(current => ({ ...current, ...patch }));
  }, []);

  const onDeleteTag = useCallback(
    async (tag: KolamTag) => {
      setSaving(true);
      setError(null);

      try {
        await deleteKolamTag(tag.id);
        const nextTags = tags.filter(item => item.id !== tag.id);
        await writeKolamTagListCache(nextTags);
        await removeKolamTagDetailCache(tag.id);
        setTags(nextTags);
        setMode('list');
        setSelectedTag(null);
        setForm(createEmptyKolamTagFormState());
        setDataSource('live');
        return true;
      } catch (deleteError) {
        setError(getErrorMessage(deleteError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [tags],
  );

  const onSave = useCallback(async () => {
    if (!form.name.trim()) {
      setError('Nama tag wajib diisi.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const savedTag =
        mode === 'new'
          ? await createKolamTag(form)
          : await updateKolamTag(
              selectedTag?.id ?? form.id ?? slugifyTagName(form.name),
              form,
            );

      await writeKolamTagDetailCache(savedTag);
      setSelectedTag(savedTag);
      setForm(createKolamTagFormState(savedTag));
      setMode('detail');
      setTags(current => upsertTag(current, savedTag));
      await writeKolamTagListCache(upsertTag(tags, savedTag));
      setDataSource('live');
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }, [form, mode, selectedTag, tags]);

  const breadcrumbPath = useMemo(
    () => getKolamTagBreadcrumbPath(mode, selectedTag),
    [mode, selectedTag],
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
    selectedTag,
    tags,
    onBackToList,
    onChangeForm,
    onCreateNew,
    onDeleteTag,
    onEdit,
    onRefresh: refresh,
    onSave,
    onSelectTag,
  };
}

function getInitialMode(route: string): KolamTagSurfaceMode {
  const routePath = route.split('?')[0];

  if (routePath === '/tags/create' || routePath === '/tags/baru') {
    return 'new';
  }

  if (routePath.endsWith('/edit') && getRouteTagKey(routePath)) {
    return 'edit';
  }

  if (getRouteTagKey(routePath)) {
    return 'detail';
  }

  return 'list';
}

function getRouteTagKey(route: string) {
  const routePath = route.split('?')[0];
  const detailRoute = routePath.match(/^\/tags\/([^/]+)(?:\/edit)?$/);
  const key = detailRoute?.[1];

  if (!key || key === 'create' || key === 'baru') {
    return null;
  }

  return decodeURIComponent(key);
}

function tagMatchesRouteKey(tag: KolamTag, key: string) {
  const normalizedKey = slugifyTagName(key);
  const lowerKey = key.toLowerCase();
  const tagSlug = tag.slug || slugifyTagName(tag.name);

  return (
    tag.id === key ||
    tag.id.toLowerCase() === lowerKey ||
    tag.slug === key ||
    tagSlug === normalizedKey ||
    tag.name.toLowerCase() === lowerKey
  );
}

async function resolveRouteTag(routeTagKey: string, tags: KolamTag[]) {
  return (
    tags.find(tag => tagMatchesRouteKey(tag, routeTagKey)) ??
    (await readKolamTagFromListCacheByRouteKey(routeTagKey)) ??
    createRouteTagStub(routeTagKey)
  );
}

function createRouteTagStub(key: string): KolamTag {
  return {
    id: key,
    name: key,
    slug: slugifyTagName(key),
    description: '',
    color: '#10b981',
    status: 'active',
    createdBy: '-',
    usage: {
      products: [],
      rawMaterials: [],
      services: [],
      freyer: [],
      teranura: [],
      species: [],
    },
    usageTotal: 0,
    raw: {},
  };
}

function upsertTag(tags: KolamTag[], tag: KolamTag) {
  const exists = tags.some(item => item.id === tag.id);
  if (!exists) {
    return [...tags, tag].sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  }

  return tags.map(item => (item.id === tag.id ? tag : item));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Terjadi kendala saat membaca data tag.';
}
