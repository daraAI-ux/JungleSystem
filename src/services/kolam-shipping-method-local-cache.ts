import {
  createKolamShippingMethodListRevision,
  type KolamShippingMethod,
} from '../domain/kolam-shipping-method';
import { getLocalDataStore } from './local-data-store';

const SHIPPING_METHOD_OWNER = 'kolam';

export function getKolamShippingMethodListCacheKey(ownerId = SHIPPING_METHOD_OWNER) {
  return `shipping-method:list:${ownerId}`;
}

export async function readKolamShippingMethodListCache(ownerId = SHIPPING_METHOD_OWNER) {
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
