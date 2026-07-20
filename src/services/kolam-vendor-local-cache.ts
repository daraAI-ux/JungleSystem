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