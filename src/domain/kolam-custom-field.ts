import {
  normalizeKolamTranslationsForSave,
  normalizeKolamTranslationsFromRecord,
  type KolamCatalogTranslationsMap,
  type KolamCustomFieldLocaleFields,
} from './kolam-catalog-locale';
import { getKolamFileUrl } from '../lib/file-url';

export type KolamCustomFieldType =
  | 'number'
  | 'string'
  | 'boolean'
  | 'range'
  | 'select';
export type KolamCustomFieldStatus = 'active' | 'inactive';

export interface KolamCustomFieldUnit {
  id: string;
  initial: string;
  name: string;
}

export interface KolamCustomField {
  id: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: KolamCustomFieldType;
  options: string[];
  hasMinMax: boolean;
  minAllowed: number | null;
  maxAllowed: number | null;
  requiresUnit: boolean;
  unitId: string;
  unitLabel: string;
  required: boolean;
  defaultValue: unknown;
  order: number;
  description: string;
  translations: KolamCatalogTranslationsMap<KolamCustomFieldLocaleFields>;
  status: KolamCustomFieldStatus;
  iconUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
  raw: unknown;
}

export interface KolamCustomFieldFormState {
  id?: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: KolamCustomFieldType;
  optionsText: string;
  hasMinMax: boolean;
  minAllowed: string;
  maxAllowed: string;
  requiresUnit: boolean;
  unitId: string;
  required: boolean;
  defaultValueText: string;
  defaultBoolean: boolean;
  order: string;
  description: string;
  translations: KolamCatalogTranslationsMap<KolamCustomFieldLocaleFields>;
  status: KolamCustomFieldStatus;
  iconLocalUri: string;
  iconRemoteUrl: string;
}

export const KOLAM_CUSTOM_FIELD_BREADCRUMB_ROOT = '/custom-fields';

export function isKolamCustomFieldRoute(route: string) {
  return (
    route === KOLAM_CUSTOM_FIELD_BREADCRUMB_ROOT ||
    route === `${KOLAM_CUSTOM_FIELD_BREADCRUMB_ROOT}/create` ||
    route === `${KOLAM_CUSTOM_FIELD_BREADCRUMB_ROOT}/baru` ||
    route.startsWith(`${KOLAM_CUSTOM_FIELD_BREADCRUMB_ROOT}/`)
  );
}

export function getKolamCustomFieldBreadcrumbPath(
  mode: 'list' | 'detail' | 'edit' | 'new',
  field?: Pick<KolamCustomField, 'fieldLabel'> | null,
) {
  if (mode === 'new') {
    return `${KOLAM_CUSTOM_FIELD_BREADCRUMB_ROOT}/baru`;
  }

  if ((mode === 'detail' || mode === 'edit') && field) {
    return `${KOLAM_CUSTOM_FIELD_BREADCRUMB_ROOT}/${field.fieldLabel}`;
  }

  return KOLAM_CUSTOM_FIELD_BREADCRUMB_ROOT;
}

export function createEmptyKolamCustomFieldFormState(): KolamCustomFieldFormState {
  return {
    fieldKey: '',
    fieldLabel: '',
    fieldType: 'string',
    optionsText: '',
    hasMinMax: false,
    minAllowed: '',
    maxAllowed: '',
    requiresUnit: false,
    unitId: '',
    required: false,
    defaultValueText: '',
    defaultBoolean: false,
    order: '0',
    description: '',
    translations: {},
    status: 'active',
    iconLocalUri: '',
    iconRemoteUrl: '',
  };
}

export function createKolamCustomFieldFormState(
  field: KolamCustomField,
): KolamCustomFieldFormState {
  return {
    id: field.id,
    fieldKey: field.fieldKey,
    fieldLabel: field.fieldLabel,
    fieldType: field.fieldType,
    optionsText: field.options.join(', '),
    hasMinMax: field.hasMinMax,
    minAllowed: field.minAllowed == null ? '' : String(field.minAllowed),
    maxAllowed: field.maxAllowed == null ? '' : String(field.maxAllowed),
    requiresUnit: field.requiresUnit,
    unitId: field.unitId,
    required: field.required,
    defaultValueText:
      typeof field.defaultValue === 'string' ||
      typeof field.defaultValue === 'number'
        ? String(field.defaultValue)
        : '',
    defaultBoolean:
      typeof field.defaultValue === 'boolean' ? field.defaultValue : false,
    order: String(field.order),
    description: field.description,
    translations: field.translations ?? {},
    status: field.status,
    iconLocalUri: '',
    iconRemoteUrl: field.iconUrl ?? '',
  };
}

export function createKolamCustomFieldSavePayload(
  form: KolamCustomFieldFormState,
) {
  const isNumericLike = form.fieldType === 'number' || form.fieldType === 'range';
  const order = Number(form.order);
  const options = form.optionsText
    .split(/[\n,]/g)
    .map(option => option.trim())
    .filter(Boolean);
  const payload: Record<string, unknown> = {
    fieldKey: form.fieldKey.trim(),
    fieldLabel: form.fieldLabel.trim(),
    fieldType: form.fieldType,
    status: form.status,
    order: Number.isFinite(order) ? Math.floor(order) : 0,
    description: form.description.trim(),
    translations: normalizeKolamTranslationsForSave(form.translations) ?? {},
    required: form.required,
    options: form.fieldType === 'select' ? options : [],
    requiresUnit: isNumericLike ? form.requiresUnit : false,
    hasMinMax: isNumericLike ? form.hasMinMax : false,
    unit: isNumericLike && form.requiresUnit ? form.unitId || null : null,
    defaultValue: createDefaultValue(form),
  };

  if (isNumericLike && form.hasMinMax) {
    payload.minAllowed = parseOptionalNumber(form.minAllowed);
    payload.maxAllowed = parseOptionalNumber(form.maxAllowed);
  }

  return payload;
}

export function normalizeKolamCustomField(payload: unknown): KolamCustomField {
  const record = asRecord(payload);
  const id = getString(record, '_id') || getString(record, 'id');
  const fieldLabel = getString(record, 'fieldLabel') || 'Field tanpa label';
  const unit = normalizeUnit(record.unit);
  const iconPath = getString(record, 'icon') || null;

  return {
    id: id || slugifyCustomFieldLabel(fieldLabel),
    fieldKey: getString(record, 'fieldKey') || slugifyCustomFieldLabel(fieldLabel),
    fieldLabel,
    fieldType: normalizeFieldType(record.fieldType),
    options: getStringArray(record.options),
    hasMinMax: getBoolean(record, 'hasMinMax') ?? false,
    minAllowed: getNumber(record, 'minAllowed'),
    maxAllowed: getNumber(record, 'maxAllowed'),
    requiresUnit: getBoolean(record, 'requiresUnit') ?? false,
    unitId: unit.id,
    unitLabel: unit.label,
    required: getBoolean(record, 'required') ?? false,
    defaultValue: record.defaultValue ?? null,
    order: getNumber(record, 'order') ?? 0,
    description: getString(record, 'description'),
    translations: normalizeKolamTranslationsFromRecord<KolamCustomFieldLocaleFields>(
      record.translations,
    ),
    status: record.status === 'inactive' ? 'inactive' : 'active',
    iconUrl: getKolamFileUrl(iconPath),
    createdAt: getString(record, 'createdAt') || undefined,
    updatedAt: getString(record, 'updatedAt') || undefined,
    raw: payload,
  };
}

export function normalizeKolamCustomFieldList(payload: unknown) {
  const root = unwrapData(payload);
  const rootRecord = asRecord(root);
  const list: unknown[] = Array.isArray(root)
    ? root
    : Array.isArray(rootRecord.data)
    ? rootRecord.data
    : Array.isArray(rootRecord.items)
    ? rootRecord.items
    : Array.isArray(rootRecord.customFields)
    ? rootRecord.customFields
    : [];

  return list.map(normalizeKolamCustomField);
}

export function normalizeKolamCustomFieldDetail(payload: unknown) {
  return normalizeKolamCustomField(unwrapData(payload));
}

export function normalizeKolamCustomFieldUnits(payload: unknown) {
  const root = unwrapData(payload);
  const rootRecord = asRecord(root);
  const list: unknown[] = Array.isArray(root)
    ? root
    : Array.isArray(rootRecord.data)
    ? rootRecord.data
    : [];

  return list.map(normalizeKolamCustomFieldUnit).filter(unit => unit.id);
}

export function normalizeKolamCustomFieldUnit(
  payload: unknown,
): KolamCustomFieldUnit {
  const record = asRecord(payload);
  const id = getString(record, '_id') || getString(record, 'id');
  return {
    id,
    name: getString(record, 'name') || id,
    initial: getString(record, 'initial'),
  };
}

export function createKolamCustomFieldListRevision(
  fields: KolamCustomField[],
) {
  return createStableHash(
    fields.map(field => ({
      id: field.id,
      fieldKey: field.fieldKey,
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType,
      status: field.status,
      translations: field.translations,
      order: field.order,
      iconUrl: field.iconUrl,
      updatedAt: field.updatedAt,
    })),
  );
}

export function createKolamCustomFieldDetailRevision(field: KolamCustomField) {
  return createStableHash({
    id: field.id,
    fieldKey: field.fieldKey,
    fieldLabel: field.fieldLabel,
    fieldType: field.fieldType,
    options: field.options,
    required: field.required,
    requiresUnit: field.requiresUnit,
    unitId: field.unitId,
    hasMinMax: field.hasMinMax,
    minAllowed: field.minAllowed,
    maxAllowed: field.maxAllowed,
    defaultValue: field.defaultValue,
    order: field.order,
    description: field.description,
    status: field.status,
    translations: field.translations,
    iconUrl: field.iconUrl,
    updatedAt: field.updatedAt,
  });
}

export function slugifyCustomFieldLabel(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getCustomFieldTypeLabel(type: KolamCustomFieldType) {
  switch (type) {
    case 'number':
      return 'Angka';
    case 'boolean':
      return 'Ya/Tidak';
    case 'range':
      return 'Rentang';
    case 'select':
      return 'Pilihan';
    case 'string':
    default:
      return 'Teks';
  }
}

function createDefaultValue(form: KolamCustomFieldFormState) {
  if (form.fieldType === 'boolean') {
    return form.defaultBoolean;
  }

  if (form.fieldType === 'number' || form.fieldType === 'range') {
    return parseOptionalNumber(form.defaultValueText);
  }

  return form.defaultValueText.trim() || null;
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeFieldType(value: unknown): KolamCustomFieldType {
  return value === 'number' ||
    value === 'boolean' ||
    value === 'range' ||
    value === 'select'
    ? value
    : 'string';
}

function normalizeUnit(value: unknown) {
  if (typeof value === 'string') {
    return { id: value, label: value };
  }

  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  const name = getString(record, 'name');
  const initial = getString(record, 'initial');
  return {
    id,
    label: name ? `${name}${initial ? ` (${initial})` : ''}` : id,
  };
}

function unwrapData(payload: unknown): unknown {
  const record = asRecord(payload);
  if ('data' in record && !Array.isArray(payload)) {
    return record.data;
  }

  return payload;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function getNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getBoolean(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'boolean' ? value : null;
}

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function createStableHash(value: unknown) {
  const json = JSON.stringify(value);
  let hash = 0;
  for (let index = 0; index < json.length; index += 1) {
    hash = (hash << 5) - hash + json.charCodeAt(index);
    hash |= 0;
  }
  return String(hash);
}
