import { getKolamFileUrl } from '../lib/file-url';
import type { KolamSpeciesShippingMethod } from './kolam-species';

export type KolamShippingMethod = KolamSpeciesShippingMethod;

export function normalizeKolamShippingMethodList(payload: unknown): KolamShippingMethod[] {
  const root = unwrapData(payload);
  const record = asRecord(root);
  const list: unknown[] = Array.isArray(root)
    ? root
    : Array.isArray(record.data)
    ? record.data
    : Array.isArray(record.items)
    ? record.items
    : Array.isArray(record.shippingMethods)
    ? record.shippingMethods
    : [];

  return list.map(normalizeKolamShippingMethod).filter(item => item.id && item.displayName);
}

export function createKolamShippingMethodListRevision(items: KolamShippingMethod[]) {
  return createStableHash(
    items.map(item => ({
      id: item.id,
      displayName: item.displayName,
      logoUri: item.logoUri,
      category: item.category,
      pricingType: item.pricingType,
      pricingPrice: item.pricingPrice,
      estimatedMinDays: item.estimatedMinDays,
      estimatedMaxDays: item.estimatedMaxDays,
      maximumWeight: item.maximumWeight,
      maximumDimensionLength: item.maximumDimensionLength,
      maximumDimensionWidth: item.maximumDimensionWidth,
      maximumDimensionHeight: item.maximumDimensionHeight,
      minimumOrderAmount: item.minimumOrderAmount,
    })),
  );
}

function normalizeKolamShippingMethod(payload: unknown): KolamShippingMethod {
  const record = asRecord(payload);
  const pricingModel = asRecord(record.pricingModel);
  const estimatedDays = asRecord(record.estimatedDays);
  const specialConditions = asRecord(record.specialConditions);
  const maximumDimension = asRecord(specialConditions.maximumDimension);
  const id = getObjectIdString(record) || getString(record, '_id') || getString(record, 'id');
  const displayName = getString(record, 'displayName') || getString(record, 'name') || id;

  return {
    id,
    displayName,
    logoUri: getKolamFileUrl(getNullableString(record, 'icon') ?? getNullableString(record, 'logo')),
    category: getString(record, 'category'),
    pricingType: getString(pricingModel, 'type'),
    pricingPrice: Math.max(0, getNumber(pricingModel, 'price') ?? 0),
    estimatedMinDays: Math.max(0, getNumber(estimatedDays, 'min') ?? 0),
    estimatedMaxDays: Math.max(0, getNumber(estimatedDays, 'max') ?? 0),
    restrictedRegions: Array.isArray(specialConditions.restrictedRegions)
      ? specialConditions.restrictedRegions.map(String).filter(Boolean)
      : [],
    maximumWeight: Math.max(0, getNumber(specialConditions, 'maximumWeight') ?? 0),
    maximumDimensionLength: Math.max(0, getNumber(maximumDimension, 'length') ?? 0),
    maximumDimensionWidth: Math.max(0, getNumber(maximumDimension, 'width') ?? 0),
    maximumDimensionHeight: Math.max(0, getNumber(maximumDimension, 'height') ?? 0),
    minimumOrderAmount: Math.max(0, getNumber(specialConditions, 'minimumOrderAmount') ?? 0),
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
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function getNullableString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
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

function getObjectIdString(record: Record<string, unknown>) {
  const value = record._id;
  if (typeof value === 'string') {
    return value;
  }

  const objectRecord = asRecord(value);
  return getString(objectRecord, '$oid');
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
