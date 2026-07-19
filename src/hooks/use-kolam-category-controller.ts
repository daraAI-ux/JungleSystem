import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createEmptyKolamCategoryFormState,
  createKolamCategoryFormState,
  createKolamCategoryIconDraft,
  flattenAllCategories,
  getKolamCategoryBreadcrumbPath,
  isKolamCategoryRoute,
  shouldSyncKolamCategoryIcon,
  slugifyCategoryName,
  type KolamCategory,
  type KolamCategoryFormState,
  type KolamCategoryIconDraft,
} from '../domain/kolam-category';
import {
  createKolamCategory,
  deleteKolamCategory,
  getKolamCategories,
  getKolamCategory,
  updateKolamCategory,
  uploadKolamCategoryIcon,
} from '../services/kolam-category-api';
import {
  readKolamCategoryDetailCache,
  readKolamCategoryFromListCacheByRouteKey,
  readKolamCategoryIconDraft,
  readKolamCategoryListCache,
  removeKolamCategoryDetailCache,
  writeKolamCategoryDetailCache,
  writeKolamCategoryIconDraft,
  writeKolamCategoryListCache,
} from '../services/kolam-category-local-cache';
import { syncKolamLocalAssetBatch } from '../services/kolam-local-asset-store';
import { pickNativeImageFile } from '../services/native-file-picker';

export type KolamCategorySurfaceMode = 'list' | 'detail' | 'edit' | 'new';
export type KolamCategoryDataSource = 'idle' | 'cache' | 'live' | 'error';

export interface KolamCategoryController {
  breadcrumbPath: string;
  categories: KolamCategory[];
  dataSource: KolamCategoryDataSource;
  error: string | null;
  form: KolamCategoryFormState;
  iconDraft: KolamCategoryIconDraft | null;
  isEditable: boolean;
  loading: boolean;
  mode: KolamCategorySurfaceMode;
  saving: boolean;
  selectedCategory: KolamCategory | null;
  onBackToList: () => void;
  onChangeForm: (patch: Partial<KolamCategoryFormState>) => void;
  onCreateNew: () => void;
  onDeleteCategory: (category: KolamCategory) => Promise<boolean>;
  onEdit: () => void;
  onPickIcon: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onSave: () => Promise<void>;
  onSelectCategory: (category: KolamCategory) => Promise<void>;
}

export function useKolamCategoryController(
  route: string,
): KolamCategoryController {
  const initialMode = getInitialMode(route);
  const [categories, setCategories] = useState<KolamCategory[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<KolamCategory | null>(null);
  const [mode, setMode] = useState<KolamCategorySurfaceMode>(initialMode);
  const [form, setForm] = useState<KolamCategoryFormState>(() =>
    createEmptyKolamCategoryFormState(),
  );
  const [iconDraft, setIconDraft] = useState<KolamCategoryIconDraft | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<KolamCategoryDataSource>('idle');

  const refresh = useCallback(async () => {
    if (!isKolamCategoryRoute(route)) {
      return;
    }

    setLoading(true);
    setError(null);

    const cached = await readKolamCategoryListCache();
    if (cached?.value.length) {
      setCategories(cached.value);
      setDataSource('cache');
    }

    try {
      const liveCategories = await getKolamCategories();
      await writeKolamCategoryListCache(liveCategories);
      setCategories(liveCategories);
      setDataSource('live');
      void syncCategoryIconAssets(liveCategories);
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
      setSelectedCategory(null);
      setForm(createEmptyKolamCategoryFormState());
      setIconDraft(null);
    }
  }, [initialMode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onSelectCategory = useCallback(async (category: KolamCategory) => {
    setMode('detail');
    setSelectedCategory(category);
    setForm(createKolamCategoryFormState(category));
    setIconDraft(null);
    setError(null);

    const cached = await readKolamCategoryDetailCache(category.id);
    if (cached?.value) {
      setSelectedCategory(cached.value);
      setForm(createKolamCategoryFormState(cached.value));
      setDataSource('cache');
    }

    try {
      const liveCategory = await getKolamCategory(category.id);
      await writeKolamCategoryDetailCache(liveCategory);
      const draft = await readKolamCategoryIconDraft(liveCategory.id);
      setSelectedCategory(liveCategory);
      setForm(createKolamCategoryFormState(liveCategory));
      setIconDraft(draft?.value ?? null);
      setDataSource('live');
      void syncCategoryIconAssets([liveCategory]);
    } catch (detailError) {
      setError(getErrorMessage(detailError));
      setDataSource(cached?.value || category ? 'cache' : 'error');
    }
  }, []);

  useEffect(() => {
    const routeCategoryKey = getRouteCategoryKey(route);
    if (!routeCategoryKey || mode === 'new') {
      return;
    }

    if (
      selectedCategory &&
      categoryMatchesRouteKey(selectedCategory, routeCategoryKey)
    ) {
      return;
    }

    let active = true;
    void resolveRouteCategory(routeCategoryKey, categories).then(category => {
      if (active) {
        void onSelectCategory(category);
      }
    });

    return () => {
      active = false;
    };
  }, [categories, mode, onSelectCategory, route, selectedCategory]);

  const onBackToList = useCallback(() => {
    setMode('list');
    setSelectedCategory(null);
    setForm(createEmptyKolamCategoryFormState());
    setIconDraft(null);
  }, []);

  const onCreateNew = useCallback(() => {
    setMode('new');
    setSelectedCategory(null);
    setForm(createEmptyKolamCategoryFormState());
    setIconDraft(null);
    setError(null);
  }, []);

  const onEdit = useCallback(() => {
    if (selectedCategory) {
      setMode('edit');
    }
  }, [selectedCategory]);

  const onDeleteCategory = useCallback(
    async (category: KolamCategory) => {
      setSaving(true);
      setError(null);

      try {
        await deleteKolamCategory(category.id);
        const nextCategories = removeCategoryFromTree(categories, category.id);
        await writeKolamCategoryListCache(nextCategories);
        await removeKolamCategoryDetailCache(category.id);
        setCategories(nextCategories);
        setMode('list');
        setSelectedCategory(null);
        setForm(createEmptyKolamCategoryFormState());
        setIconDraft(null);
        setDataSource('live');
        return true;
      } catch (deleteError) {
        setError(getErrorMessage(deleteError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [categories],
  );

  const onChangeForm = useCallback((patch: Partial<KolamCategoryFormState>) => {
    setForm(current => ({ ...current, ...patch }));
  }, []);

  const onPickIcon = useCallback(async () => {
    try {
      setError(null);
      const picked = await pickNativeImageFile();
      if (picked.cancelled) {
        return;
      }

      const iconLocalUri = picked.uri ?? picked.path ?? '';
      if (!iconLocalUri) {
        setError('File icon tidak memiliki path yang bisa dibaca.');
        return;
      }

      setForm(current => ({ ...current, iconLocalUri }));
    } catch (pickError) {
      setError(getErrorMessage(pickError));
    }
  }, []);

  const onSave = useCallback(async () => {
    if (!form.name.trim()) {
      setError('Nama kategori wajib diisi.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const savedCategory =
        mode === 'new'
          ? await createKolamCategory(form)
          : await updateKolamCategory(
              selectedCategory?.id ?? form.id ?? slugifyCategoryName(form.name),
              form,
            );
      const syncedCategory = await syncIconIfNeeded(
        savedCategory,
        form,
        setIconDraft,
      );

      await writeKolamCategoryDetailCache(syncedCategory);
      setSelectedCategory(syncedCategory);
      setForm(createKolamCategoryFormState(syncedCategory));
      setMode('detail');
      setCategories(current => upsertCategory(current, syncedCategory));
      await writeKolamCategoryListCache(
        upsertCategory(categories, syncedCategory),
      );
      setDataSource('live');
      void syncCategoryIconAssets([syncedCategory]);
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }, [categories, form, mode, selectedCategory]);

  const breadcrumbPath = useMemo(
    () => getKolamCategoryBreadcrumbPath(mode, selectedCategory),
    [mode, selectedCategory],
  );

  return {
    breadcrumbPath,
    categories,
    dataSource,
    error,
    form,
    iconDraft,
    isEditable: mode === 'edit' || mode === 'new',
    loading,
    mode,
    saving,
    selectedCategory,
    onBackToList,
    onChangeForm,
    onCreateNew,
    onDeleteCategory,
    onEdit,
    onPickIcon,
    onRefresh: refresh,
    onSave,
    onSelectCategory,
  };
}

function getInitialMode(route: string): KolamCategorySurfaceMode {
  const routePath = route.split('?')[0];

  if (
    routePath === '/category/create' ||
    routePath === '/label-dan-field/kategori/baru'
  ) {
    return 'new';
  }

  if (routePath.endsWith('/edit') && getRouteCategoryKey(routePath)) {
    return 'edit';
  }

  if (getRouteCategoryKey(routePath)) {
    return 'detail';
  }

  return 'list';
}

function getRouteCategoryKey(route: string) {
  const routePath = route.split('?')[0];
  const oldRoute = routePath.match(/^\/category\/([^/]+)(?:\/edit)?$/);
  const newRoute = routePath.match(
    /^\/label-dan-field\/kategori\/([^/]+)(?:\/edit)?$/,
  );
  const key = oldRoute?.[1] ?? newRoute?.[1];

  if (!key || key === 'create' || key === 'baru') {
    return null;
  }

  return decodeURIComponent(key);
}

function categoryMatchesRouteKey(category: KolamCategory, key: string) {
  const normalizedKey = slugifyCategoryName(key);
  const lowerKey = key.toLowerCase();
  const categorySlug = category.slug || slugifyCategoryName(category.name);

  return (
    category.id === key ||
    category.id.toLowerCase() === lowerKey ||
    category.slug === key ||
    categorySlug === normalizedKey ||
    category.name.toLowerCase() === lowerKey
  );
}

async function resolveRouteCategory(
  routeCategoryKey: string,
  categories: KolamCategory[],
) {
  const allCategories = flattenAllCategories(categories);
  return (
    allCategories.find(category =>
      categoryMatchesRouteKey(category, routeCategoryKey),
    ) ??
    (await readKolamCategoryFromListCacheByRouteKey(routeCategoryKey)) ??
    createRouteCategoryStub(routeCategoryKey)
  );
}

function createRouteCategoryStub(key: string): KolamCategory {
  return {
    id: key,
    name: key,
    slug: slugifyCategoryName(key),
    description: '',
    iconUrl: null,
    photos: [],
    productCount: 0,
    serviceCount: 0,
    speciesCount: 0,
    customFieldCount: 0,
    childrenCount: 0,
    parentId: null,
    parentName: null,
    level: 0,
    showInMarketplace: false,
    marketplaceOrder: 0,
    status: 'active',
    children: [],
    raw: {},
  };
}

async function syncIconIfNeeded(
  category: KolamCategory,
  form: KolamCategoryFormState,
  setIconDraft: (draft: KolamCategoryIconDraft | null) => void,
) {
  const localUri = form.iconLocalUri.trim();
  if (!localUri) {
    return category;
  }

  const previous = await readKolamCategoryIconDraft(category.id);
  const draft = createKolamCategoryIconDraft({
    category,
    localUri,
    remoteUrl: form.iconRemoteUrl || category.iconUrl,
    previous: previous?.value ?? null,
  });

  if (!shouldSyncKolamCategoryIcon(draft, category.iconUrl)) {
    await writeKolamCategoryIconDraft(draft);
    setIconDraft(draft);
    return category;
  }

  try {
    const uploadedCategory = await uploadKolamCategoryIcon(
      category.id,
      localUri,
    );
    const syncedDraft: KolamCategoryIconDraft = {
      ...draft,
      dirty: false,
      syncState: 'synced',
      remoteUrl: uploadedCategory.iconUrl,
      serverHash: draft.contentHash,
      lastSyncedAt: new Date().toISOString(),
      lastAttemptHash: draft.contentHash,
      updatedAt: new Date().toISOString(),
    };
    await writeKolamCategoryIconDraft(syncedDraft);
    setIconDraft(syncedDraft);
    return uploadedCategory;
  } catch (error) {
    const failedDraft: KolamCategoryIconDraft = {
      ...draft,
      syncState: 'failed',
      lastAttemptHash: draft.contentHash,
      updatedAt: new Date().toISOString(),
    };
    await writeKolamCategoryIconDraft(failedDraft);
    setIconDraft(failedDraft);
    throw error;
  }
}

function upsertCategory(
  categories: KolamCategory[],
  category: KolamCategory,
): KolamCategory[] {
  const updated = categories.map(item => {
    if (item.id === category.id) {
      return category;
    }

    return {
      ...item,
      children: upsertCategory(item.children, category),
    };
  });

  return flattenAllCategories(updated).some(item => item.id === category.id)
    ? updated
    : [category, ...updated];
}

function removeCategoryFromTree(
  categories: KolamCategory[],
  categoryId: string,
): KolamCategory[] {
  return categories
    .filter(category => category.id !== categoryId)
    .map(category => ({
      ...category,
      children: removeCategoryFromTree(category.children, categoryId),
    }));
}

function syncCategoryIconAssets(categories: KolamCategory[]) {
  const allCategories = flattenAllCategories(categories);
  return syncKolamLocalAssetBatch({
    scope: 'category-icon',
    assets: allCategories.map(category => ({
      sourceUri: category.iconUrl,
      revision: getCategoryIconRevision(category),
    })),
  }).catch(() => ({ failed: allCategories.length, synced: 0 }));
}

function getCategoryIconRevision(category: KolamCategory) {
  return [category.iconUrl ?? '', category.updatedAt ?? ''].join(':');
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Kategori belum bisa dimuat dari backend.';
}
