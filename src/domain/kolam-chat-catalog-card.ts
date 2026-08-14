import {getKolamFileUrl} from '../lib/file-url';
import type {KolamProduct, KolamProductVariant} from './kolam-product';
import type {KolamSpecies, KolamSpeciesVariantMedia} from './kolam-species';

export const KOLAM_CHAT_MARKETPLACE_SITE_URL = 'https://dunia-anura.com';
const MARKETPLACE_DEFAULT_LOCALE = 'id';

export type KolamChatCatalogEntityType = 'product' | 'species';

export interface KolamChatCatalogCardPayload {
  entityId: string;
  entityType: KolamChatCatalogEntityType;
  name: string;
  price?: number;
  priceLabel?: string;
  stock?: number;
  imageUrl?: string;
  detailHref?: string;
  variantId?: string;
}

export interface KolamChatCatalogCardContent {
  type: 'product_card' | 'species_card';
  card: KolamChatCatalogCardPayload;
}

type MarketplaceVariantSlug = {
  id?: string;
  tier1Value?: string;
  tier2Value?: string;
  sku?: string;
  productCode?: string;
};

/** Selaras `generateSlug` di da-marketplace / DA-Chat-Plugin. */
export function slugifyKolamMarketplaceSegment(value: string) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function toKolamMarketplaceAbsoluteHref(
  pathOrUrl: string | undefined | null,
  siteUrl = KOLAM_CHAT_MARKETPLACE_SITE_URL,
): string | undefined {
  if (!pathOrUrl?.trim()) {
    return undefined;
  }
  const href = pathOrUrl.trim();
  if (/^https?:\/\//i.test(href)) {
    return href;
  }
  const base = siteUrl.replace(/\/+$/, '');
  const path = href.startsWith('/') ? href : `/${href}`;
  return `${base}${path}`;
}

function variantSlug(v: MarketplaceVariantSlug) {
  const parts = [v.tier1Value, v.tier2Value].filter(Boolean);
  if (parts.length > 0) {
    return slugifyKolamMarketplaceSegment(parts.join('-'));
  }
  if (v.sku) {
    return slugifyKolamMarketplaceSegment(v.sku);
  }
  if (v.productCode) {
    return slugifyKolamMarketplaceSegment(v.productCode);
  }
  if (v.id) {
    return v.id.slice(-8);
  }
  return '';
}

export function marketplaceProductPath(
  name: string,
  _id?: string,
  variant?: MarketplaceVariantSlug,
) {
  const base = `/${MARKETPLACE_DEFAULT_LOCALE}/products/${slugifyKolamMarketplaceSegment(
    name,
  )}`;
  const seg = variant ? variantSlug(variant) : '';
  return seg ? `${base}/${seg}` : base;
}

export function marketplaceSpeciesPath(
  scientificName: string,
  _id?: string,
  variant?: MarketplaceVariantSlug,
) {
  const base = `/${MARKETPLACE_DEFAULT_LOCALE}/${slugifyKolamMarketplaceSegment(
    scientificName,
  )}`;
  const seg = variant ? variantSlug(variant) : '';
  return seg ? `${base}/${seg}` : base;
}

export function marketplaceProductUrl(
  name: string,
  _id?: string,
  variant?: MarketplaceVariantSlug,
) {
  return (
    toKolamMarketplaceAbsoluteHref(marketplaceProductPath(name, _id, variant)) ??
    ''
  );
}

export function marketplaceSpeciesUrl(
  scientificName: string,
  _id?: string,
  variant?: MarketplaceVariantSlug,
) {
  return (
    toKolamMarketplaceAbsoluteHref(
      marketplaceSpeciesPath(scientificName, _id, variant),
    ) ?? ''
  );
}

export function formatKolamCatalogRupiah(n: number) {
  if (!Number.isFinite(n) || n <= 0) {
    return '';
  }
  return `Rp${Math.round(n).toLocaleString('id-ID')}`;
}

export function formatKolamCatalogPriceLabel(min: number, max: number) {
  if (min <= 0 && max <= 0) {
    return '-';
  }
  if (min === max) {
    return formatKolamCatalogRupiah(min) || '-';
  }
  return `${formatKolamCatalogRupiah(min)} – ${formatKolamCatalogRupiah(max)}`;
}

export function pickKolamCatalogPrice(item: {
  priceToSell?: number;
  onlinePrice?: number;
}): number {
  return item.priceToSell || item.onlinePrice || 0;
}

export function hasKolamCatalogVariants(item: {
  hasVariants?: boolean;
  variants?: unknown[];
}): boolean {
  return (
    Boolean(item.hasVariants) ||
    (Array.isArray(item.variants) && item.variants.length > 0)
  );
}

export function sumKolamCatalogVariantStock(
  variants?: Array<{stock?: number}>,
): number {
  if (!variants?.length) {
    return 0;
  }
  return variants.reduce((sum, variant) => {
    const stock = Number(variant.stock);
    return sum + (Number.isFinite(stock) && stock >= 0 ? stock : 0);
  }, 0);
}

export function variantKolamCatalogPriceRange(
  variants: Array<{priceToSell?: number; onlinePrice?: number}>,
): {min: number; max: number} | null {
  const prices = variants
    .map(variant => pickKolamCatalogPrice(variant))
    .filter(n => n > 0);
  if (!prices.length) {
    return null;
  }
  return {min: Math.min(...prices), max: Math.max(...prices)};
}

export function variantKolamCatalogDisplayName(
  variant: {
    label?: string;
    name?: string;
    tier1Value?: string;
    tier2Value?: string;
  },
): string {
  if (variant.label?.trim()) {
    return variant.label.trim();
  }
  if (variant.name?.trim()) {
    return variant.name.trim();
  }
  const tiers = [variant.tier1Value, variant.tier2Value]
    .map(value => value?.trim())
    .filter(Boolean) as string[];
  return tiers.length > 0 ? tiers.join(' — ') : 'Varian';
}

export function effectiveKolamCatalogStock(
  parent: {stock?: number; hasVariants?: boolean; variants?: Array<{stock?: number}>},
  variant?: {stock?: number},
): number {
  if (variant) {
    const stock = Number(variant.stock);
    return Number.isFinite(stock) && stock >= 0 ? stock : 0;
  }
  if (hasKolamCatalogVariants(parent)) {
    return sumKolamCatalogVariantStock(parent.variants);
  }
  const stock = Number(parent.stock);
  return Number.isFinite(stock) && stock >= 0 ? stock : 0;
}

export function absoluteKolamCatalogImageUrl(path?: string | null) {
  const value = path?.trim();
  if (!value) {
    return '';
  }
  return getKolamFileUrl(value) ?? value;
}

export function buildKolamChatCatalogCardContent(picked: {
  entityType: KolamChatCatalogEntityType;
  entityId: string;
  name: string;
  price: number;
  stock?: number;
  imageUrl?: string;
  detailHref?: string;
  variantId?: string;
}): KolamChatCatalogCardContent {
  const priceLabel =
    picked.price > 0 ? formatKolamCatalogRupiah(picked.price) : '';
  return {
    type: picked.entityType === 'species' ? 'species_card' : 'product_card',
    card: {
      entityId: picked.entityId,
      entityType: picked.entityType,
      name: picked.name,
      price: picked.price,
      priceLabel,
      stock: picked.stock ?? 0,
      imageUrl: picked.imageUrl ?? '',
      detailHref: picked.detailHref ?? '',
      variantId: picked.variantId ?? '',
    },
  };
}

export function buildKolamChatCatalogCardFromProduct(
  product: KolamProduct,
  variant?: KolamProductVariant,
): KolamChatCatalogCardContent {
  const baseName = product.name;
  const variantLabel = variant
    ? variantKolamCatalogDisplayName(variant)
    : '';
  const fullName = variantLabel ? `${baseName} — ${variantLabel}` : baseName;
  const variantPrice = variant ? pickKolamCatalogPrice(variant) : 0;
  const parentPrice = pickKolamCatalogPrice(product);
  const price = variantPrice > 0 ? variantPrice : parentPrice;
  const imageUrl = absoluteKolamCatalogImageUrl(
    variant?.photoUris?.[0] || product.photoUris?.[0] || product.thumbnailUri,
  );
  const stock = effectiveKolamCatalogStock(product, variant);
  return buildKolamChatCatalogCardContent({
    entityType: 'product',
    entityId: product.id,
    name: fullName,
    price,
    stock,
    imageUrl,
    detailHref: marketplaceProductUrl(product.name, product.id, variant),
    variantId: variant?.id,
  });
}

export function buildKolamChatCatalogCardFromSpecies(
  species: KolamSpecies,
  variant?: KolamSpeciesVariantMedia,
): KolamChatCatalogCardContent {
  const baseName = species.scientificName || species.displayName;
  const variantLabel = variant
    ? variantKolamCatalogDisplayName(variant)
    : '';
  const fullName = variantLabel ? `${baseName} — ${variantLabel}` : baseName;
  const variantPrice = variant ? pickKolamCatalogPrice(variant) : 0;
  const parentPrice = pickKolamCatalogPrice(species);
  const price = variantPrice > 0 ? variantPrice : parentPrice;
  const imageUrl = absoluteKolamCatalogImageUrl(
    variant?.photoUris?.[0] ||
      species.photoUris?.[0] ||
      species.thumbnailUri,
  );
  const stock = effectiveKolamCatalogStock(species, variant);
  return buildKolamChatCatalogCardContent({
    entityType: 'species',
    entityId: species.id,
    name: fullName,
    price,
    stock,
    imageUrl,
    detailHref: marketplaceSpeciesUrl(
      species.scientificName || species.displayName,
      species.id,
      variant,
    ),
    variantId: variant?.id,
  });
}

export interface KolamChatLegacyProductShare {
  entityType: KolamChatCatalogEntityType;
  name: string;
  priceLabel?: string;
  imageUrl?: string;
  detailHref?: string;
}

/** Plain-text product share for team-chat (and legacy channels). */
export function kolamChatCatalogCardToShareText(
  content: KolamChatCatalogCardContent,
): string {
  const card = content.card;
  const priceLabel =
    card.priceLabel || formatKolamCatalogRupiah(card.price ?? 0);
  const stock = card.stock ?? 0;
  const head = priceLabel
    ? `[Product] ${card.name} — ${priceLabel} — Stok ${stock}`
    : `[Product] ${card.name} — Stok ${stock}`;
  const lines = [head];
  if (card.imageUrl) {
    lines.push(card.imageUrl);
  }
  if (card.detailHref) {
    lines.push(`[Link] ${card.detailHref}`);
  }
  return lines.join('\n');
}

export function isKolamProductShareBody(body: string): boolean {
  return (body || '').trim().startsWith('[Product]');
}

export function parseKolamLegacyProductShareText(
  raw: string,
): KolamChatLegacyProductShare | null {
  const text = raw?.trim() || '';
  if (!text.startsWith('[Product]')) {
    return null;
  }

  const lines = text.split('\n').map(line => line.trim());
  const head = lines[0] || '';
  let imageUrl: string | undefined;
  let detailHref: string | undefined;
  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i] || '';
    if (line.startsWith('[Link]')) {
      const href = line.replace(/^\[Link\]\s*/, '').trim();
      if (href) {
        detailHref = toKolamMarketplaceAbsoluteHref(href);
      }
    } else if (!imageUrl && /^https?:\/\//i.test(line)) {
      imageUrl = line;
    }
  }

  const segments = head
    .replace(/^\[Product\]\s*/, '')
    .split(/\s*—\s*/)
    .map(part => part.trim())
    .filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  const baseName = segments[0];
  let priceLabel: string | undefined;
  const extraParts: string[] = [];
  for (let i = 1; i < segments.length; i += 1) {
    const seg = segments[i];
    if (/^Rp/i.test(seg)) {
      priceLabel = seg;
    } else if (/(sold|terjual)/i.test(seg) || /^Stok\s+\d+/i.test(seg)) {
      continue;
    } else {
      extraParts.push(seg);
    }
  }

  const name = extraParts.length
    ? `${baseName} — ${extraParts.join(' — ')}`
    : baseName;

  return {
    entityType: 'product',
    name,
    priceLabel,
    imageUrl,
    detailHref,
  };
}
