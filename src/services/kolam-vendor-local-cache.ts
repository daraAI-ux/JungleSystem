import {
  createKolamVendorListRevision,
  type KolamVendor,
} from '../domain/kolam-vendor';
import { getLocalDataStore } from './local-data-store';

const VENDOR_OWNER = 'kolam';

export function getKolamVendorListCacheKey(ownerId = VENDOR_OWNER) {
  return `vendor:list:${ownerId}`;
}

export async function readKolamVendorListCache(ownerId = VENDOR_OWNER) {
  return getLocalDataStore().read<KolamVendor[]>(
    getKolamVendorListCacheKey(ownerId),
  );
}

export async function writeKolamVendorListCache(
  vendors: KolamVendor[],
  ownerId = VENDOR_OWNER,
) {
  const key = getKolamVendorListCacheKey(ownerId);
  const revision = createKolamVendorListRevision(vendors);
  const current = await getLocalDataStore().read<KolamVendor[]>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: vendors,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export function getKolamVendorDetailCacheKey(
  vendorId: string,
  ownerId = VENDOR_OWNER,
) {
  return `vendor:detail:${ownerId}:${vendorId}`;
}

export async function readKolamVendorDetailCache(
  vendorId: string,
  ownerId = VENDOR_OWNER,
) {
  return getLocalDataStore().read<KolamVendor>(
    getKolamVendorDetailCacheKey(vendorId, ownerId),
  );
}

export async function writeKolamVendorDetailCache(
  vendor: KolamVendor,
  ownerId = VENDOR_OWNER,
) {
  await getLocalDataStore().write({
    key: getKolamVendorDetailCacheKey(vendor.id, ownerId),
    value: vendor,
    revision: vendor.updatedAt || vendor.id,
    updatedAt: new Date().toISOString(),
  });
}

export async function readKolamVendorFromListCacheById(
  vendorId: string,
  ownerId = VENDOR_OWNER,
) {
  const cached = await readKolamVendorListCache(ownerId);
  return cached?.value.find(vendor => vendor.id === vendorId) ?? null;
}

export async function removeKolamVendorDetailCache(
  vendorId: string,
  ownerId = VENDOR_OWNER,
) {
  await getLocalDataStore().remove(
    getKolamVendorDetailCacheKey(vendorId, ownerId),
  );
}