import {
  createKolamCustomFieldDetailRevision,
  createKolamCustomFieldListRevision,
  slugifyCustomFieldLabel,
  type KolamCustomField,
  type KolamCustomFieldUnit,
} from '../domain/kolam-custom-field';
import { getLocalDataStore } from './local-data-store';

const CUSTOM_FIELD_OWNER = 'kolam';

export function getKolamCustomFieldListCacheKey(
  ownerId = CUSTOM_FIELD_OWNER,
) {
  return `custom-field:list:${ownerId}`;
}

export function getKolamCustomFieldDetailCacheKey(
  fieldId: string,
  ownerId = CUSTOM_FIELD_OWNER,
) {
  return `custom-field:detail:${ownerId}:${fieldId}`;
}

export function getKolamCustomFieldUnitListCacheKey(
  ownerId = CUSTOM_FIELD_OWNER,
) {
  return `custom-field:units:${ownerId}`;
}

export async function readKolamCustomFieldListCache(
  ownerId = CUSTOM_FIELD_OWNER,
) {
  return getLocalDataStore().read<KolamCustomField[]>(
    getKolamCustomFieldListCacheKey(ownerId),
  );
}

export async function writeKolamCustomFieldListCache(
  fields: KolamCustomField[],
  ownerId = CUSTOM_FIELD_OWNER,
) {
  const key = getKolamCustomFieldListCacheKey(ownerId);
  const revision = createKolamCustomFieldListRevision(fields);
  const current = await getLocalDataStore().read<KolamCustomField[]>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: fields,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function readKolamCustomFieldDetailCache(
  fieldId: string,
  ownerId = CUSTOM_FIELD_OWNER,
) {
  return getLocalDataStore().read<KolamCustomField>(
    getKolamCustomFieldDetailCacheKey(fieldId, ownerId),
  );
}

export async function writeKolamCustomFieldDetailCache(
  field: KolamCustomField,
  ownerId = CUSTOM_FIELD_OWNER,
) {
  const key = getKolamCustomFieldDetailCacheKey(field.id, ownerId);
  const revision = createKolamCustomFieldDetailRevision(field);
  const current = await getLocalDataStore().read<KolamCustomField>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: field,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function readKolamCustomFieldUnitsCache(
  ownerId = CUSTOM_FIELD_OWNER,
) {
  return getLocalDataStore().read<KolamCustomFieldUnit[]>(
    getKolamCustomFieldUnitListCacheKey(ownerId),
  );
}

export async function writeKolamCustomFieldUnitsCache(
  units: KolamCustomFieldUnit[],
  ownerId = CUSTOM_FIELD_OWNER,
) {
  const key = getKolamCustomFieldUnitListCacheKey(ownerId);
  const revision = units.map(unit => `${unit.id}:${unit.name}`).join('|');
  const current = await getLocalDataStore().read<KolamCustomFieldUnit[]>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: units,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function readKolamCustomFieldFromListCacheByRouteKey(
  routeKey: string,
  ownerId = CUSTOM_FIELD_OWNER,
) {
  const cached = await readKolamCustomFieldListCache(ownerId);
  const routeKeySlug = slugifyCustomFieldLabel(routeKey);
  const routeKeyLower = routeKey.toLowerCase();
  const fields = cached?.value ?? [];

  return (
    fields.find(field => {
      const labelSlug = slugifyCustomFieldLabel(field.fieldLabel);

      return (
        field.id === routeKey ||
        field.id.toLowerCase() === routeKeyLower ||
        field.fieldKey === routeKey ||
        field.fieldKey.toLowerCase() === routeKeyLower ||
        labelSlug === routeKeySlug ||
        field.fieldLabel.toLowerCase() === routeKeyLower
      );
    }) ?? null
  );
}

export async function removeKolamCustomFieldDetailCache(
  fieldId: string,
  ownerId = CUSTOM_FIELD_OWNER,
) {
  await getLocalDataStore().remove(
    getKolamCustomFieldDetailCacheKey(fieldId, ownerId),
  );
}
