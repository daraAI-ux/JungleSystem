import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createEmptyKolamCustomFieldFormState,
  createKolamCustomFieldFormState,
  getKolamCustomFieldBreadcrumbPath,
  isKolamCustomFieldRoute,
  slugifyCustomFieldLabel,
  type KolamCustomField,
  type KolamCustomFieldFormState,
  type KolamCustomFieldUnit,
} from '../domain/kolam-custom-field';
import {
  createKolamCustomField,
  deleteKolamCustomField,
  getKolamCustomField,
  getKolamCustomFields,
  getKolamCustomFieldUnits,
  updateKolamCustomField,
  updateKolamCustomFieldStatus,
  uploadKolamCustomFieldIcon,
} from '../services/kolam-custom-field-api';
import {
  readKolamCustomFieldDetailCache,
  readKolamCustomFieldFromListCacheByRouteKey,
  readKolamCustomFieldListCache,
  readKolamCustomFieldUnitsCache,
  removeKolamCustomFieldDetailCache,
  writeKolamCustomFieldDetailCache,
  writeKolamCustomFieldListCache,
  writeKolamCustomFieldUnitsCache,
} from '../services/kolam-custom-field-local-cache';
import { syncKolamLocalAssetBatch } from '../services/kolam-local-asset-store';
import { pickNativeImageFile } from '../services/native-file-picker';

export type KolamCustomFieldSurfaceMode = 'list' | 'detail' | 'edit' | 'new';
export type KolamCustomFieldDataSource = 'idle' | 'cache' | 'live' | 'error';

export interface KolamCustomFieldController {
  breadcrumbPath: string;
  dataSource: KolamCustomFieldDataSource;
  error: string | null;
  fields: KolamCustomField[];
  form: KolamCustomFieldFormState;
  isEditable: boolean;
  loading: boolean;
  mode: KolamCustomFieldSurfaceMode;
  saving: boolean;
  selectedField: KolamCustomField | null;
  units: KolamCustomFieldUnit[];
  onBackToList: () => void;
  onChangeForm: (patch: Partial<KolamCustomFieldFormState>) => void;
  onCreateNew: () => void;
  onDeleteField: (field: KolamCustomField) => Promise<boolean>;
  onEdit: () => void;
  onPickIcon: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onSave: () => Promise<void>;
  onSelectField: (field: KolamCustomField) => Promise<void>;
  onSetFieldStatus: (
    field: KolamCustomField,
    status: 'active' | 'inactive',
  ) => Promise<boolean>;
}

export function useKolamCustomFieldController(
  route: string,
): KolamCustomFieldController {
  const initialMode = getInitialMode(route);
  const [fields, setFields] = useState<KolamCustomField[]>([]);
  const [units, setUnits] = useState<KolamCustomFieldUnit[]>([]);
  const [selectedField, setSelectedField] = useState<KolamCustomField | null>(
    null,
  );
  const [mode, setMode] = useState<KolamCustomFieldSurfaceMode>(initialMode);
  const [form, setForm] = useState<KolamCustomFieldFormState>(() =>
    createEmptyKolamCustomFieldFormState(),
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamCustomFieldDataSource>('idle');

  const refreshUnits = useCallback(async () => {
    const cached = await readKolamCustomFieldUnitsCache();
    if (cached?.value.length) {
      setUnits(cached.value);
    }

    try {
      const liveUnits = await getKolamCustomFieldUnits();
      await writeKolamCustomFieldUnitsCache(liveUnits);
      setUnits(liveUnits);
    } catch {
      if (!cached?.value.length) {
        setUnits([]);
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!isKolamCustomFieldRoute(route)) {
      return;
    }

    setLoading(true);
    setError(null);

    const cached = await readKolamCustomFieldListCache();
    if (cached?.value.length) {
      setFields(cached.value);
      setDataSource('cache');
    }

    try {
      const liveFields = await getKolamCustomFields();
      await writeKolamCustomFieldListCache(liveFields);
      setFields(liveFields);
      setDataSource('live');
      void syncCustomFieldIconAssets(liveFields);
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
      setSelectedField(null);
      setForm(createEmptyKolamCustomFieldFormState());
    }
  }, [initialMode]);

  useEffect(() => {
    void refresh();
    void refreshUnits();
  }, [refresh, refreshUnits]);

  const onSelectField = useCallback(async (field: KolamCustomField) => {
    setMode('detail');
    setSelectedField(field);
    setForm(createKolamCustomFieldFormState(field));
    setError(null);

    const cached = await readKolamCustomFieldDetailCache(field.id);
    if (cached?.value) {
      setSelectedField(cached.value);
      setForm(createKolamCustomFieldFormState(cached.value));
      setDataSource('cache');
    }

    try {
      const liveField = await getKolamCustomField(field.id);
      await writeKolamCustomFieldDetailCache(liveField);
      setSelectedField(liveField);
      setForm(createKolamCustomFieldFormState(liveField));
      setDataSource('live');
      void syncCustomFieldIconAssets([liveField]);
    } catch (detailError) {
      setError(getErrorMessage(detailError));
      setDataSource(cached?.value || field ? 'cache' : 'error');
    }
  }, []);

  useEffect(() => {
    const routeFieldKey = getRouteFieldKey(route);
    if (!routeFieldKey || mode === 'new') {
      return;
    }

    if (selectedField && fieldMatchesRouteKey(selectedField, routeFieldKey)) {
      return;
    }

    let active = true;
    void resolveRouteField(routeFieldKey, fields).then(field => {
      if (active) {
        void onSelectField(field);
      }
    });

    return () => {
      active = false;
    };
  }, [fields, mode, onSelectField, route, selectedField]);

  const onBackToList = useCallback(() => {
    setMode('list');
    setSelectedField(null);
    setForm(createEmptyKolamCustomFieldFormState());
  }, []);

  const onCreateNew = useCallback(() => {
    setMode('new');
    setSelectedField(null);
    setForm(createEmptyKolamCustomFieldFormState());
    setError(null);
  }, []);

  const onEdit = useCallback(() => {
    if (selectedField) {
      setMode('edit');
    }
  }, [selectedField]);

  const onChangeForm = useCallback(
    (patch: Partial<KolamCustomFieldFormState>) => {
      setForm(current => ({ ...current, ...patch }));
    },
    [],
  );

  const onPickIcon = useCallback(async () => {
    try {
      const picked = await pickNativeImageFile();
      const iconLocalUri = picked.uri ?? picked.path ?? '';

      if (!picked.cancelled && iconLocalUri) {
        setForm(current => ({ ...current, iconLocalUri }));
      }
    } catch (pickError) {
      setError(getErrorMessage(pickError));
    }
  }, []);

  const onDeleteField = useCallback(
    async (field: KolamCustomField) => {
      setSaving(true);
      setError(null);

      try {
        await deleteKolamCustomField(field.id);
        const nextFields = fields.filter(item => item.id !== field.id);
        await writeKolamCustomFieldListCache(nextFields);
        await removeKolamCustomFieldDetailCache(field.id);
        setFields(nextFields);
        setMode('list');
        setSelectedField(null);
        setForm(createEmptyKolamCustomFieldFormState());
        setDataSource('live');
        return true;
      } catch (deleteError) {
        setError(getErrorMessage(deleteError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fields],
  );

  const onSetFieldStatus = useCallback(
    async (field: KolamCustomField, status: 'active' | 'inactive') => {
      setSaving(true);
      setError(null);

      try {
        const updated = await updateKolamCustomFieldStatus(field.id, status);
        await writeKolamCustomFieldDetailCache(updated);
        setFields(current => upsertField(current, updated));
        await writeKolamCustomFieldListCache(upsertField(fields, updated));
        setSelectedField(current =>
          current?.id === updated.id ? updated : current,
        );
        setDataSource('live');
        return true;
      } catch (statusError) {
        setError(getErrorMessage(statusError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fields],
  );

  const onSave = useCallback(async () => {
    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const baseField =
        mode === 'new'
          ? await createKolamCustomField(form)
          : await updateKolamCustomField(
              selectedField?.id ??
                form.id ??
                slugifyCustomFieldLabel(form.fieldLabel),
              form,
            );
      const savedField = form.iconLocalUri
        ? await uploadKolamCustomFieldIcon(baseField.id, form.iconLocalUri)
        : baseField;

      await writeKolamCustomFieldDetailCache(savedField);
      setSelectedField(savedField);
      setForm(createKolamCustomFieldFormState(savedField));
      setMode('detail');
      setFields(current => upsertField(current, savedField));
      await writeKolamCustomFieldListCache(upsertField(fields, savedField));
      setDataSource('live');
      void syncCustomFieldIconAssets([savedField]);
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }, [fields, form, mode, selectedField]);

  const breadcrumbPath = useMemo(
    () => getKolamCustomFieldBreadcrumbPath(mode, selectedField),
    [mode, selectedField],
  );

  return {
    breadcrumbPath,
    dataSource,
    error,
    fields,
    form,
    isEditable: mode === 'edit' || mode === 'new',
    loading,
    mode,
    saving,
    selectedField,
    units,
    onBackToList,
    onChangeForm,
    onCreateNew,
    onDeleteField,
    onEdit,
    onPickIcon,
    onRefresh: refresh,
    onSave,
    onSelectField,
    onSetFieldStatus,
  };
}

function getInitialMode(route: string): KolamCustomFieldSurfaceMode {
  const routePath = route.split('?')[0];

  if (routePath === '/custom-fields/create' || routePath === '/custom-fields/baru') {
    return 'new';
  }

  if (routePath.endsWith('/edit') && getRouteFieldKey(routePath)) {
    return 'edit';
  }

  if (getRouteFieldKey(routePath)) {
    return 'detail';
  }

  return 'list';
}

function getRouteFieldKey(route: string) {
  const routePath = route.split('?')[0];
  const detailRoute = routePath.match(/^\/custom-fields\/([^/]+)(?:\/edit)?$/);
  const key = detailRoute?.[1];

  if (!key || key === 'create' || key === 'baru') {
    return null;
  }

  return decodeURIComponent(key);
}

function fieldMatchesRouteKey(field: KolamCustomField, key: string) {
  const normalizedKey = slugifyCustomFieldLabel(key);
  const lowerKey = key.toLowerCase();

  return (
    field.id === key ||
    field.id.toLowerCase() === lowerKey ||
    field.fieldKey === key ||
    field.fieldKey.toLowerCase() === lowerKey ||
    slugifyCustomFieldLabel(field.fieldLabel) === normalizedKey ||
    field.fieldLabel.toLowerCase() === lowerKey
  );
}

async function resolveRouteField(
  routeFieldKey: string,
  fields: KolamCustomField[],
) {
  return (
    fields.find(field => fieldMatchesRouteKey(field, routeFieldKey)) ??
    (await readKolamCustomFieldFromListCacheByRouteKey(routeFieldKey)) ??
    createRouteFieldStub(routeFieldKey)
  );
}

function createRouteFieldStub(key: string): KolamCustomField {
  return {
    id: key,
    fieldKey: slugifyCustomFieldLabel(key),
    fieldLabel: key,
    fieldType: 'string',
    options: [],
    hasMinMax: false,
    minAllowed: null,
    maxAllowed: null,
    requiresUnit: false,
    unitId: '',
    unitLabel: '',
    required: false,
    defaultValue: null,
    order: 0,
    description: '',
    translations: {},
    status: 'active',
    iconUrl: null,
    raw: {},
  };
}

function upsertField(
  fields: KolamCustomField[],
  field: KolamCustomField,
) {
  const exists = fields.some(item => item.id === field.id);
  if (!exists) {
    return [...fields, field].sort((left, right) =>
      left.fieldLabel.localeCompare(right.fieldLabel),
    );
  }

  return fields.map(item => (item.id === field.id ? field : item));
}

function validateForm(form: KolamCustomFieldFormState) {
  if (!form.fieldKey.trim()) {
    return 'Kunci field wajib diisi.';
  }

  if (!form.fieldLabel.trim()) {
    return 'Label field wajib diisi.';
  }

  if (form.fieldType === 'select' && !form.optionsText.trim()) {
    return 'Opsi wajib diisi untuk tipe pilihan.';
  }

  if (
    (form.fieldType === 'number' || form.fieldType === 'range') &&
    form.requiresUnit &&
    !form.unitId
  ) {
    return 'Satuan wajib dipilih ketika field membutuhkan satuan.';
  }

  return null;
}

function syncCustomFieldIconAssets(fields: KolamCustomField[]) {
  return syncKolamLocalAssetBatch({
    assets: fields.map(field => ({
      revision: [field.iconUrl ?? '', field.updatedAt ?? ''].join(':'),
      sourceUri: field.iconUrl,
    })),
    scope: 'custom-field-icon',
  }).catch(() => null);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Terjadi kendala saat membaca data field kustom.';
}
