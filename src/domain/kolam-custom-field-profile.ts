import {
  normalizeKolamCustomField,
  type KolamCustomField,
} from './kolam-custom-field';

export type KolamCustomFieldProfileScope = 'product' | 'species' | 'raw';
export type KolamCustomFieldProfileStatus = 'active' | 'inactive';

export interface KolamCustomFieldProfile {
  id: string;
  name: string;
  scope: KolamCustomFieldProfileScope;
  description: string;
  fields: KolamCustomField[];
  status: KolamCustomFieldProfileStatus;
}

export function normalizeKolamCustomFieldProfileList(payload: unknown) {
  const root = unwrapData(payload);
  const rootRecord = asRecord(root);
  const list: unknown[] = Array.isArray(root)
    ? root
    : Array.isArray(rootRecord.data)
    ? rootRecord.data
    : [];

  return list.map(normalizeKolamCustomFieldProfile).filter(profile => profile.id);
}

function normalizeKolamCustomFieldProfile(
  payload: unknown,
): KolamCustomFieldProfile {
  const record = asRecord(payload);
  const id = getString(record, '_id') || getString(record, 'id');
  const name = getString(record, 'name') || 'Profil spesifikasi';
  const rawFields = Array.isArray(record.fields) ? record.fields : [];

  return {
    id,
    name,
    scope: normalizeScope(record.scope),
    description: getString(record, 'description'),
    fields: rawFields.map(normalizeKolamCustomField),
    status: record.status === 'inactive' ? 'inactive' : 'active',
  };
}

function normalizeScope(value: unknown): KolamCustomFieldProfileScope {
  return value === 'product' || value === 'raw' ? value : 'species';
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
