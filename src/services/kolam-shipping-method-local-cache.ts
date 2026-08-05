import {
  createKolamShippingMethodDetailRevision,
  createKolamShippingMethodListRevision,
  type KolamShippingMethod,
} from '../domain/kolam-shipping-method';
import { getLocalDataStore } from './local-data-store';

const SHIPPING_METHOD_OWNER = 'kolam';

export function getKolamShippingMethodListCacheKey(ownerId = SHIPPING_METHOD_OWNER) {
  return `shipping-method:list:${ownerId}`;
}

export function getKolamShippingMethodAdminListCacheKey(
  ownerId = SHIPPING_METHOD_OWNER,
) {
  return `shipping-method:admin-list:${ownerId}`;
}

export function getKolamShippingMethodDetailCacheKey(
  methodId: string,
  ownerId = SHIPPING_METHOD_OWNER,
) {
  return `shipping-method:detail:${ownerId}:${methodId}`;
}

export async function readKolamShippingMethodListCache(
  ownerId = SHIPPING_METHOD_OWNER,
) {
  return getLocalDataStore().read<KolamShippingMethod[]>(
    getKolamShippingMethodListCacheKey(ownerId),
  );
}

export async function writeKolamShippingMethodListCache(
  shippingMethods: KolamShippingMethod[],
  ownerId = SHIPPING_METHOD_OWNER,
) {
  const key = getKolamShippingMethodListCacheKey(ownerId);
  const revision = createKolamShippingMethodListRevision(shippingMethods);
  const current = await getLocalDataStore().read<KolamShippingMethod[]>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: shippingMethods,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function readKolamShippingMethodAdminListCache(
  ownerId = SHIPPING_METHOD_OWNER,
) {
  return getLocalDataStore().read<KolamShippingMethod[]>(
    getKolamShippingMethodAdminListCacheKey(ownerId),
  );
}

export async function writeKolamShippingMethodAdminListCache(
  shippingMethods: KolamShippingMethod[],
  ownerId = SHIPPING_METHOD_OWNER,
) {
  const key = getKolamShippingMethodAdminListCacheKey(ownerId);
  const revision = createKolamShippingMethodListRevision(shippingMethods);
  const current = await getLocalDataStore().read<KolamShippingMethod[]>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: shippingMethods,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function readKolamShippingMethodDetailCache(
  methodId: string,
  ownerId = SHIPPING_METHOD_OWNER,
) {
  return getLocalDataStore().read<KolamShippingMethod>(
    getKolamShippingMethodDetailCacheKey(methodId, ownerId),
  );
}

export async function writeKolamShippingMethodDetailCache(
  method: KolamShippingMethod,
  ownerId = SHIPPING_METHOD_OWNER,
) {
  const key = getKolamShippingMethodDetailCacheKey(method.id, ownerId);
  const revision = createKolamShippingMethodDetailRevision(method);
  const current = await getLocalDataStore().read<KolamShippingMethod>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: method,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function clearKolamShippingMethodDetailCache(
  methodId: string,
  ownerId = SHIPPING_METHOD_OWNER,
) {
  await getLocalDataStore().remove(
    getKolamShippingMethodDetailCacheKey(methodId, ownerId),
  );
}
