import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createEmptyKolamIucnStatusFormState,
  createKolamIucnStatusFormState,
  getKolamIucnStatusBreadcrumbPath,
  isKolamIucnStatusRoute,
  slugifyIucnStatusName,
  type KolamIucnStatus,
  type KolamIucnStatusFormState,
} from '../domain/kolam-iucn-status';
import {
  createKolamIucnStatus,
  deleteKolamIucnStatus,
  getKolamIucnStatus,
  getKolamIucnStatuses,
  updateKolamIucnStatus,
  uploadKolamIucnStatusImage,
} from '../services/kolam-iucn-status-api';
import {
  readKolamIucnStatusDetailCache,
  readKolamIucnStatusFromListCacheByRouteKey,
  readKolamIucnStatusListCache,
  removeKolamIucnStatusDetailCache,
  writeKolamIucnStatusDetailCache,
  writeKolamIucnStatusListCache,
} from '../services/kolam-iucn-status-local-cache';
import { syncKolamImageCacheBatch } from '../services/kolam-image-local-cache';
import { pickNativeImageFile } from '../services/native-file-picker';

export type KolamIucnStatusSurfaceMode = 'list' | 'detail' | 'edit' | 'new';
export type KolamIucnStatusDataSource = 'idle' | 'cache' | 'live' | 'error';

export interface KolamIucnStatusController {
  breadcrumbPath: string;
  dataSource: KolamIucnStatusDataSource;
  error: string | null;
  form: KolamIucnStatusFormState;
  isEditable: boolean;
  items: KolamIucnStatus[];
  loading: boolean;
  mode: KolamIucnStatusSurfaceMode;
  saving: boolean;
  selectedItem: KolamIucnStatus | null;
  onBackToList: () => void;
  onChangeForm: (patch: Partial<KolamIucnStatusFormState>) => void;
  onCreateNew: () => void;
  onDeleteItem: (item: KolamIucnStatus) => Promise<boolean>;
  onEdit: () => void;
  onPickImage: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onSave: () => Promise<void>;
  onSelectItem: (item: KolamIucnStatus) => Promise<void>;
}

export function useKolamIucnStatusController(
  route: string,
): KolamIucnStatusController {
  const initialMode = getInitialMode(route);
  const [items, setItems] = useState<KolamIucnStatus[]>([]);
  const [selectedItem, setSelectedItem] = useState<KolamIucnStatus | null>(null);
  const [mode, setMode] = useState<KolamIucnStatusSurfaceMode>(initialMode);
  const [form, setForm] = useState<KolamIucnStatusFormState>(() =>
    createEmptyKolamIucnStatusFormState(),
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamIucnStatusDataSource>('idle');

  const refresh = useCallback(async () => {
    if (!isKolamIucnStatusRoute(route)) {
      return;
    }

    setLoading(true);
    setError(null);

    const cached = await readKolamIucnStatusListCache();
    if (cached?.value.length) {
      setItems(cached.value);
      setDataSource('cache');
    }

    try {
      const liveItems = await getKolamIucnStatuses({ limit: 1000 });
      await writeKolamIucnStatusListCache(liveItems);
      setItems(liveItems);
      setDataSource('live');
      void syncIucnImages(liveItems);
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
      setSelectedItem(null);
      setForm(createEmptyKolamIucnStatusFormState());
    }
  }, [initialMode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onSelectItem = useCallback(async (item: KolamIucnStatus) => {
    setMode('detail');
    setSelectedItem(item);
    setForm(createKolamIucnStatusFormState(item));
    setError(null);

    const cached = await readKolamIucnStatusDetailCache(item.id);
    if (cached?.value) {
      setSelectedItem(cached.value);
      setForm(createKolamIucnStatusFormState(cached.value));
      setDataSource('cache');
    }

    try {
      const liveItem = await getKolamIucnStatus(item.id);
      await writeKolamIucnStatusDetailCache(liveItem);
      setSelectedItem(liveItem);
      setForm(createKolamIucnStatusFormState(liveItem));
      setDataSource('live');
      void syncIucnImages([liveItem]);
    } catch (detailError) {
      setError(getErrorMessage(detailError));
      setDataSource(cached?.value || item ? 'cache' : 'error');
    }
  }, []);

  useEffect(() => {
    const routeKey = getRouteIucnKey(route);
    if (!routeKey || mode === 'new') {
      return;
    }

    if (selectedItem && itemMatchesRouteKey(selectedItem, routeKey)) {
      return;
    }

    let active = true;
    void resolveRouteItem(routeKey, items).then(item => {
      if (active) {
        void onSelectItem(item);
      }
    });

    return () => {
      active = false;
    };
  }, [items, mode, onSelectItem, route, selectedItem]);

  const onBackToList = useCallback(() => {
    setMode('list');
    setSelectedItem(null);
    setForm(createEmptyKolamIucnStatusFormState());
  }, []);

  const onCreateNew = useCallback(() => {
    setMode('new');
    setSelectedItem(null);
    setForm(createEmptyKolamIucnStatusFormState());
    setError(null);
  }, []);

  const onEdit = useCallback(() => {
    if (selectedItem) {
      setMode('edit');
    }
  }, [selectedItem]);

  const onChangeForm = useCallback((patch: Partial<KolamIucnStatusFormState>) => {
    setForm(current => ({ ...current, ...patch }));
  }, []);

  const onPickImage = useCallback(async () => {
    try {
      setError(null);
      const picked = await pickNativeImageFile();
      if (picked.cancelled) {
        return;
      }

      const imageLocalUri = picked.uri ?? picked.path ?? '';
      if (!imageLocalUri) {
        setError('File gambar tidak memiliki path yang bisa dibaca.');
        return;
      }

      setForm(current => ({ ...current, imageLocalUri }));
    } catch (pickError) {
      setError(getErrorMessage(pickError));
    }
  }, []);

  const onDeleteItem = useCallback(
    async (item: KolamIucnStatus) => {
      setSaving(true);
      setError(null);

      try {
        await deleteKolamIucnStatus(item.id);
        const nextItems = items.filter(entry => entry.id !== item.id);
        await writeKolamIucnStatusListCache(nextItems);
        await removeKolamIucnStatusDetailCache(item.id);
        setItems(nextItems);
        setMode('list');
        setSelectedItem(null);
        setForm(createEmptyKolamIucnStatusFormState());
        setDataSource('live');
        return true;
      } catch (deleteError) {
        setError(getErrorMessage(deleteError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [items],
  );

  const onSave = useCallback(async () => {
    if (!form.name.trim()) {
      setError('Nama status IUCN wajib diisi.');
      return;
    }

    if (!form.abbreviation.trim()) {
      setError('Singkatan status IUCN wajib diisi.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const savedItem =
        mode === 'new'
          ? await createKolamIucnStatus(form)
          : await updateKolamIucnStatus(
              selectedItem?.id ?? form.id ?? slugifyIucnStatusName(form.name),
              form,
            );
      const syncedItem = form.imageLocalUri.trim()
        ? await uploadKolamIucnStatusImage(savedItem.id, form.imageLocalUri)
        : savedItem;

      await writeKolamIucnStatusDetailCache(syncedItem);
      setSelectedItem(syncedItem);
      setForm(createKolamIucnStatusFormState(syncedItem));
      setMode('detail');
      setItems(current => upsertItem(current, syncedItem));
      await writeKolamIucnStatusListCache(upsertItem(items, syncedItem));
      setDataSource('live');
      void syncIucnImages([syncedItem]);
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }, [form, items, mode, selectedItem]);

  const breadcrumbPath = useMemo(
    () => getKolamIucnStatusBreadcrumbPath(mode, selectedItem),
    [mode, selectedItem],
  );

  return {
    breadcrumbPath,
    dataSource,
    error,
    form,
    isEditable: mode === 'edit' || mode === 'new',
    items,
    loading,
    mode,
    saving,
    selectedItem,
    onBackToList,
    onChangeForm,
    onCreateNew,
    onDeleteItem,
    onEdit,
    onPickImage,
    onRefresh: refresh,
    onSave,
    onSelectItem,
  };
}

function getInitialMode(route: string): KolamIucnStatusSurfaceMode {
  const routePath = route.split('?')[0];

  if (routePath === '/iucn-status/create' || routePath === '/iucn-status/baru') {
    return 'new';
  }

  if (routePath.endsWith('/edit') && getRouteIucnKey(routePath)) {
    return 'edit';
  }

  if (getRouteIucnKey(routePath)) {
    return 'detail';
  }

  return 'list';
}

function getRouteIucnKey(route: string) {
  const routePath = route.split('?')[0];
  const detailRoute = routePath.match(/^\/iucn-status\/([^/]+)(?:\/edit)?$/);
  const key = detailRoute?.[1];

  if (!key || key === 'create' || key === 'baru') {
    return null;
  }

  return decodeURIComponent(key);
}

function itemMatchesRouteKey(item: KolamIucnStatus, key: string) {
  const normalizedKey = slugifyIucnStatusName(key);
  const lowerKey = key.toLowerCase();

  return (
    item.id === key ||
    item.id.toLowerCase() === lowerKey ||
    item.abbreviation.toLowerCase() === lowerKey ||
    slugifyIucnStatusName(item.name) === normalizedKey ||
    item.name.toLowerCase() === lowerKey
  );
}

async function resolveRouteItem(routeKey: string, items: KolamIucnStatus[]) {
  return (
    items.find(item => itemMatchesRouteKey(item, routeKey)) ??
    (await readKolamIucnStatusFromListCacheByRouteKey(routeKey)) ??
    createRouteItemStub(routeKey)
  );
}

function createRouteItemStub(key: string): KolamIucnStatus {
  return {
    id: key,
    name: key,
    abbreviation: key.toUpperCase(),
    image: null,
    imageUri: null,
    order: 0,
    status: 'active',
    createdBy: '',
    species: [],
    raw: {},
  };
}

function upsertItem(items: KolamIucnStatus[], item: KolamIucnStatus) {
  const exists = items.some(entry => entry.id === item.id);
  if (!exists) {
    return [...items, item].sort((left, right) => left.order - right.order);
  }

  return items.map(entry => (entry.id === item.id ? item : entry));
}

function syncIucnImages(items: KolamIucnStatus[]) {
  return syncKolamImageCacheBatch({
    images: items
      .filter(item => item.imageUri)
      .map(item => ({
        revision: item.updatedAt ?? item.image ?? item.imageUri ?? undefined,
        sourceUri: item.imageUri,
      })),
    scope: 'iucn-status',
  });
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Terjadi kendala saat membaca data Status IUCN.';
}
