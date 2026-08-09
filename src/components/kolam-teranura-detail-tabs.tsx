import React from 'react';
import { Image, Linking, StyleSheet, Text, View } from 'react-native';
import type { KolamTeranura } from '../domain/kolam-teranura';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { copyTextToClipboard } from '../lib/native-clipboard';
import { formatRupiah } from '../lib/money';
import { KolamBadge } from './kolam-badge';
import { KolamBarcodePanel } from './kolam-barcode-panel';
import { KolamButton } from './kolam-button';
import { KolamCategoryLabel } from './kolam-category-label';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamDescriptionList } from './kolam-description-list';
import { KolamDetailLocaleTabs } from './kolam-detail-locale-tabs';
import {
  KolamDetailMediaPreview,
  type KolamDetailMediaItem,
} from './kolam-detail-media-preview';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamEntityStatisticsPanel } from './kolam-entity-statistics-panel';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import { KolamMarketplaceSyncPlatformList } from './kolam-marketplace-sync-platform-list';
import {
  KolamPricingMetric,
  KolamPricingMetricsGrid,
} from './kolam-pricing-metric-grid';
import { KolamRemoteImage } from './kolam-remote-image';

const SHOPEE_LOGO = require('../assets/marketplace/shopee.jpg');
const TOKOPEDIA_LOGO = require('../assets/marketplace/tokopedia.png');

function formatMoneyRange(values: number[]) {
  const positive = values.filter(value => value > 0);
  if (!positive.length) {
    return '';
  }
  const min = Math.min(...positive);
  const max = Math.max(...positive);
  return min === max
    ? formatRupiah(min)
    : `${formatRupiah(min)} - ${formatRupiah(max)}`;
}

function formatDimension(item: {
  length: number;
  width: number;
  height: number;
}) {
  if (!item.length && !item.width && !item.height) {
    return '—';
  }
  return `${item.length || 0} × ${item.width || 0} × ${item.height || 0}`;
}

export function TeranuraSummaryTab({ item }: { item: KolamTeranura }) {
  const productCode = (item.sku || item.productCode || '').trim();
  const categories = item.categories.length
    ? item.categories
    : item.category
    ? [item.category]
    : [];
  const mediaItems = React.useMemo(() => {
    const photos: KolamDetailMediaItem[] = item.photos.map((uri, index) => ({
      badgeLabel: 'Foto',
      id: `photo-${index}`,
      label: `Foto ${index + 1}`,
      scope: 'teranura-detail',
      type: 'image' as const,
      uri,
    }));
    const videos: KolamDetailMediaItem[] = item.videos.map((uri, index) => ({
      badgeLabel: 'Video',
      id: `video-${index}`,
      label: `Video ${index + 1}`,
      scope: 'teranura-video',
      type: 'video' as const,
      uri,
    }));
    if (!photos.length && item.photoUrl) {
      photos.push({
        badgeLabel: 'Foto',
        id: 'photo-main',
        label: item.name,
        scope: 'teranura-detail',
        type: 'image',
        uri: item.photoUrl,
      });
    }
    return [...photos, ...videos];
  }, [item.name, item.photoUrl, item.photos, item.videos]);

  const stockIntent =
    item.stock <= 0
      ? 'danger'
      : item.lowStockThreshold > 0 && item.stock <= item.lowStockThreshold
      ? 'warning'
      : 'success';

  const sidebarLinks = React.useMemo(
    () => createTeranuraSidebarLinks(item),
    [item],
  );

  const localeItems = React.useMemo(
    () =>
      item.localeBlocks.map(block => ({
        badge: block.locale.toUpperCase(),
        fields: [
          { label: 'Nama produk', value: block.name || item.name },
          { label: 'Deskripsi singkat', value: block.shortDescription },
          { label: 'Deskripsi lengkap', value: block.description },
        ],
        title: block.localeLabel,
      })),
    [item.localeBlocks, item.name],
  );

  return (
    <View style={styles.detailPanel}>
      <View style={styles.panelTitleRow}>
        <Text style={styles.detailPanelTitle}>Ringkasan</Text>
        {item.deviceLine === 'freyer' ? (
          <KolamBadge intent="info" label="Freyer" />
        ) : null}
      </View>

      <View style={styles.overviewGrid}>
        <View style={styles.overviewSidebar}>
          {mediaItems.length ? (
            <KolamDetailMediaPreview items={mediaItems} title={item.name} />
          ) : (
            <View style={styles.detailHeroPlaceholder}>
              <Text style={styles.emptyText}>Belum ada foto</Text>
            </View>
          )}

          <KolamBarcodePanel
            name={item.name}
            priceLabel={formatRupiah(item.priceToSell)}
            sku={productCode || item.name}
          />

          <View style={styles.sidebarMiniGrid}>
            <MiniTile label="Status">
              <KolamBadge
                intent={item.sellable ? 'success' : 'secondary'}
                label={item.sellable ? 'Dijual' : 'Tidak dijual'}
              />
            </MiniTile>
            <MiniTile label="Daftar Keinginan">
              <Text style={styles.miniMutedValue}>-</Text>
            </MiniTile>
            <MiniTile label="Merek">
              {item.brand ? (
                <View style={styles.miniBrandRow}>
                  <View style={styles.miniBrandLogoFrame}>
                    {item.brand.logoUrl ? (
                      <KolamRemoteImage
                        accessibilityLabel={`Logo ${item.brand.name}`}
                        resizeMode="contain"
                        revision={item.brand.logoUrl}
                        scope="product-brand"
                        sourceUri={item.brand.logoUrl}
                        style={styles.miniBrandLogoImage}
                      />
                    ) : (
                      <Text numberOfLines={1} style={styles.miniBrandInitials}>
                        {getBrandInitials(item.brand.name)}
                      </Text>
                    )}
                  </View>
                </View>
              ) : (
                <Text style={styles.miniMutedValue}>-</Text>
              )}
            </MiniTile>
            <MiniTile label="Stok">
              <KolamBadge
                intent={stockIntent}
                label={item.stock <= 0 ? 'Habis' : String(item.stock)}
              />
            </MiniTile>
            <MiniTile label="(-)Stok">
              {item.lowStockThreshold > 0 &&
              item.stock <= item.lowStockThreshold ? (
                <KolamBadge intent="warning" label="Rendah" />
              ) : (
                <Text style={styles.miniMutedValue}>
                  {item.lowStockThreshold || '-'}
                </Text>
              )}
            </MiniTile>
            <MiniTile label="Satuan">
              <Text style={styles.miniValue}>
                {item.unitLabel || item.unitInitial || '-'}
              </Text>
            </MiniTile>
          </View>

          <View style={styles.externalTileGrid}>
            {sidebarLinks.map(link => {
              const content = (
                <MiniTile label={link.label}>
                  {link.url ? (
                    <View style={styles.externalTileMarketIcon}>
                      {link.logo ? (
                        <Image
                          resizeMode="cover"
                          source={link.logo}
                          style={styles.externalTileLogo}
                        />
                      ) : (
                        <Text style={styles.externalTileMark}>{link.mark}</Text>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.miniMutedValue}>-</Text>
                  )}
                </MiniTile>
              );

              return link.url ? (
                <KolamInteractionFrame
                  accessibilityLabel={`Buka ${link.label}`}
                  key={link.id}
                  onPress={() => void Linking.openURL(normalizeUrl(link.url))}
                  style={styles.externalTilePressable}
                >
                  {content}
                </KolamInteractionFrame>
              ) : (
                <View key={link.id} style={styles.externalTilePressable}>
                  {content}
                </View>
              );
            })}
          </View>

          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Kategori</Text>
            <View style={styles.sidebarChipWrap}>
              {categories.length ? (
                categories.map(category => (
                  <KolamCategoryLabel
                    key={category.id || category.name}
                    label={category.name}
                    style={styles.sidebarCategoryChip}
                    textStyle={styles.sidebarCategoryChipText}
                  />
                ))
              ) : (
                <Text style={styles.metaValue}>-</Text>
              )}
            </View>
          </View>

          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Tag</Text>
            <View style={styles.sidebarChipWrap}>
              {item.tags.length ? (
                item.tags.map(tag => (
                  <View key={tag} style={styles.sidebarChip}>
                    <View style={styles.sidebarChipContent}>
                      <Text numberOfLines={2} style={styles.sidebarChipText}>
                        {tag}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.metaValue}>-</Text>
              )}
            </View>
          </View>

          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Lokasi</Text>
            <Text style={styles.metaValue}>{item.locationLabel || '-'}</Text>
          </View>

          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Sinkron Stok</Text>
            <KolamMarketplaceSyncPlatformList
              platforms={item.marketplaceSyncPlatforms}
            />
          </View>
        </View>

        <View style={styles.overviewContent}>
          {productCode ? (
            <TeranuraCopyableCodeChip code={productCode} label="SKU" />
          ) : null}
          <View style={styles.localeTitleRow}>
            <Text style={styles.detailSectionTitle}>Konten per bahasa</Text>
          </View>
          <KolamDetailLocaleTabs
            emptyText="Belum ada konten Teranura."
            items={localeItems}
          />
        </View>
      </View>
    </View>
  );
}

function TeranuraCopyableCodeChip({
  code,
  label,
}: {
  code: string;
  label: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const safeCode = code.trim();
  const copyCode = () => {
    if (!safeCode) {
      return;
    }
    void copyTextToClipboard(safeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  if (!safeCode) {
    return null;
  }

  return (
    <View style={styles.copyCodeWrap}>
      <KolamInteractionFrame
        accessibilityLabel={`Salin ${label} ${safeCode}`}
        onPress={copyCode}
        style={styles.titleCodeChip}
      >
        <Text style={styles.titleCodeText}>
          {label}: {safeCode}
        </Text>
      </KolamInteractionFrame>
      <KolamButton
        accessibilityLabel={`Salin ${label} ${safeCode}`}
        intent={copied ? 'primary' : 'outline'}
        label={copied ? 'Disalin' : 'Salin'}
        onPress={copyCode}
        style={styles.copyCodeButton}
      />
    </View>
  );
}

function createTeranuraSidebarLinks(item: KolamTeranura) {
  const shopee = findTeranuraLink(item, 'shopee');
  const tokopedia = findTeranuraLink(item, 'tokopedia');
  const webstore =
    findTeranuraLink(item, 'webstore') ||
    findTeranuraLink(item, 'website') ||
    (item.slug.trim()
      ? {
          id: 'webstore-slug',
          label: 'Toko Web',
          url: `https://dunia-anura.com/id/products/${encodeURIComponent(
            item.slug.trim(),
          )}`,
        }
      : null);

  return [
    {
      id: 'shopee',
      label: 'Shopee',
      logo: SHOPEE_LOGO,
      mark: 'S',
      url: shopee?.url || '',
    },
    {
      id: 'tokopedia',
      label: 'Tokopedia',
      logo: TOKOPEDIA_LOGO,
      mark: 'T',
      url: tokopedia?.url || '',
    },
    {
      id: 'webstore',
      label: 'Toko Web',
      logo: null as null,
      mark: 'W',
      url: webstore?.url || '',
    },
  ];
}

function findTeranuraLink(item: KolamTeranura, key: string) {
  return item.links.find(link => {
    const label = link.label.trim().toLowerCase();
    const url = link.url.trim().toLowerCase();
    return label.includes(key) || url.includes(key);
  });
}

function normalizeUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function getBrandInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) {
    return '-';
  }
  return words
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();
}

export function TeranuraPricingTab({ item }: { item: KolamTeranura }) {
  const hasVariants = item.variants.length > 0;
  const costLabel = hasVariants
    ? formatMoneyRange(item.variants.map(variant => variant.price)) || '—'
    : formatRupiah(item.price);
  const sellLabel = hasVariants
    ? formatMoneyRange(item.variants.map(variant => variant.priceToSell)) ||
      '—'
    : formatRupiah(item.priceToSell);
  const cheapest = [...item.vendorPrices].sort(
    (left, right) => left.totalCost - right.totalCost,
  )[0];
  const profit =
    !hasVariants && item.price > 0 && item.priceToSell > 0
      ? item.priceToSell - item.price
      : null;
  const margin =
    profit != null && item.price > 0
      ? ((profit / item.price) * 100).toFixed(1)
      : null;

  return (
    <View style={styles.panel}>
      <KolamContentFrame style={styles.card} variant="settingsWebConfig">
        <Text style={styles.panelTitle}>Harga</Text>
        <KolamPricingMetricsGrid>
          <KolamPricingMetric label="Cost">
            <Text style={styles.metricValue}>{costLabel}</Text>
          </KolamPricingMetric>
          <KolamPricingMetric label="Harga jual (POS)">
            <Text style={styles.metricValue}>{sellLabel}</Text>
          </KolamPricingMetric>
          {!hasVariants && item.marketPrice > 0 ? (
            <KolamPricingMetric label="Harga pasar">
              <Text style={styles.metricValue}>
                {formatRupiah(item.marketPrice)}
              </Text>
            </KolamPricingMetric>
          ) : null}
          {!hasVariants && item.onlinePrice > 0 ? (
            <KolamPricingMetric label="Harga online">
              <Text style={styles.metricValue}>
                {formatRupiah(item.onlinePrice)}
              </Text>
            </KolamPricingMetric>
          ) : null}
          {!hasVariants && item.minimumPriceToSales > 0 ? (
            <KolamPricingMetric label="Harga jual minimum">
              <Text style={styles.metricValue}>
                {formatRupiah(item.minimumPriceToSales)}
              </Text>
            </KolamPricingMetric>
          ) : null}
          <KolamPricingMetric label="Vendor">
            <Text style={styles.metricValue}>
              {item.vendorPrices.length
                ? `${item.vendorPrices.length} vendor`
                : '—'}
            </Text>
            {cheapest ? (
              <Text style={styles.metricMeta}>
                Terbaik: {cheapest.vendorName} ({formatRupiah(cheapest.totalCost)})
              </Text>
            ) : null}
          </KolamPricingMetric>
          <KolamPricingMetric label="Pajak">
            <Text style={styles.metricValue}>11% PPN</Text>
          </KolamPricingMetric>
          {profit != null ? (
            <KolamPricingMetric label="Profit">
              <Text style={styles.metricValue}>{formatRupiah(profit)}</Text>
            </KolamPricingMetric>
          ) : null}
          {margin != null ? (
            <KolamPricingMetric label="Margin">
              <Text style={styles.metricValue}>{margin}%</Text>
            </KolamPricingMetric>
          ) : null}
          <KolamPricingMetric label="Poin member">
            <Text style={styles.metricValue}>
              {item.memberPointsEnabled && item.memberPoints > 0
                ? `${item.memberPoints} pts`
                : 'Nonaktif'}
            </Text>
          </KolamPricingMetric>
          <KolamPricingMetric label="Komisi">
            <Text style={styles.metricValue}>
              {item.commissionEnabled
                ? item.commissionType === 'percentage'
                  ? `${item.commissionValue}%`
                  : formatRupiah(item.commissionValue)
                : 'Nonaktif'}
            </Text>
          </KolamPricingMetric>
        </KolamPricingMetricsGrid>
      </KolamContentFrame>
    </View>
  );
}

export function TeranuraSpecificationsTab({ item }: { item: KolamTeranura }) {
  const rows = item.variants.map((variant, index) => ({
    id: variant.id || `variant-${index}`,
    label: variant.label || `Varian ${index + 1}`,
    meta: [
      variant.sku || variant.productCode,
      `Stok ${variant.stock}`,
      variant.priceToSell > 0 ? formatRupiah(variant.priceToSell) : '',
    ]
      .filter(Boolean)
      .join(' | '),
    tone: 'default' as const,
    value: variant.price > 0 ? formatRupiah(variant.price) : '—',
  }));

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Spesifikasi</Text>
      <KolamDescriptionList
        accessibilityLabel="Varian Teranura"
        rows={
          rows.length
            ? rows
            : [
                {
                  id: 'empty',
                  label: 'Varian',
                  meta: 'Belum ada spesifikasi/varian.',
                  tone: 'default',
                  value: '—',
                },
              ]
        }
      />
    </View>
  );
}

export function TeranuraLogisticsTab({ item }: { item: KolamTeranura }) {
  const hasRoot =
    item.weight > 0 || item.length > 0 || item.width > 0 || item.height > 0;
  const hasContent =
    item.shippingMethods.length > 0 || hasRoot || item.variants.length > 0;

  if (!hasContent) {
    return (
      <View style={styles.panel}>
        <KolamEmptyState compact title="Belum ada data logistik" />
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <KolamContentFrame style={styles.card} variant="settingsWebConfig">
        <Text style={styles.panelTitle}>Logistik</Text>
        {item.shippingMethods.length ? (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Metode pengiriman</Text>
            <View style={styles.shipGrid}>
              {item.shippingMethods.map(method => (
                <View key={method.id} style={styles.shipCard}>
                  <View style={styles.shipHeader}>
                    <Text style={styles.shipTitle}>{method.displayName}</Text>
                    {method.category ? (
                      <KolamBadge intent="muted" label={method.category} />
                    ) : null}
                  </View>
                  <Text style={styles.shipMeta}>{method.priceLabel}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
        {hasRoot || item.variants.length ? (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Ukuran & berat</Text>
            <KolamPricingMetricsGrid compact>
              {hasRoot ? (
                <>
                  <KolamPricingMetric label="Berat">
                    <Text style={styles.metricValue}>
                      {item.weight > 0 ? `${item.weight}` : '—'}
                    </Text>
                  </KolamPricingMetric>
                  <KolamPricingMetric label="Dimensi">
                    <Text style={styles.metricValue}>
                      {formatDimension(item)}
                    </Text>
                  </KolamPricingMetric>
                </>
              ) : null}
            </KolamPricingMetricsGrid>
            {item.variants.map(variant => (
              <View key={variant.id} style={styles.variantLogistics}>
                <Text style={styles.shipTitle}>
                  {variant.label || 'Varian'}
                </Text>
                <Text style={styles.shipMeta}>
                  Berat {variant.weight || '—'} · Dimensi{' '}
                  {formatDimension(variant)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </KolamContentFrame>
    </View>
  );
}

export function TeranuraMaterialsTab({ item }: { item: KolamTeranura }) {
  const rows = [
    ...item.components.map(component => ({
      id: `component-${component.id}`,
      label: component.name,
      meta: [
        component.code,
        component.brandLabel,
        `${component.quantity} ${component.unitLabel || 'unit'}`,
      ]
        .filter(Boolean)
        .join(' | '),
      thumbnail: component.thumbnailUri ? (
        <KolamRemoteImage
          accessibilityLabel={`Foto ${component.name}`}
          resizeMode="cover"
          revision={component.thumbnailUri}
          scope="product"
          sourceUri={component.thumbnailUri}
          style={styles.thumb}
        />
      ) : undefined,
      tone: component.stock <= 0 ? ('danger' as const) : ('default' as const),
      value: formatRupiah(component.totalPrice),
    })),
    ...item.packings.map(packing => ({
      id: `packing-${packing.id}`,
      label: packing.name,
      meta: [
        packing.sku,
        packing.variantLabel ? `Varian: ${packing.variantLabel}` : '',
      ]
        .filter(Boolean)
        .join(' | '),
      thumbnail: packing.thumbnailUri ? (
        <KolamRemoteImage
          accessibilityLabel={`Foto ${packing.name}`}
          resizeMode="cover"
          revision={packing.thumbnailUri}
          scope="packing-material"
          sourceUri={packing.thumbnailUri}
          style={styles.thumb}
        />
      ) : undefined,
      tone: 'default' as const,
      value: `x${packing.quantity}`,
    })),
  ];

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Bahan Penyusun</Text>
      <KolamDescriptionList
        accessibilityLabel="Bahan penyusun Teranura"
        rows={
          rows.length
            ? rows
            : [
                {
                  id: 'empty',
                  label: 'Bahan baku dan kemasan',
                  meta: 'Belum ada bahan penyusun atau kemasan.',
                  tone: 'default',
                  value: '—',
                },
              ]
        }
      />
    </View>
  );
}

export function TeranuraMoreTab({ item }: { item: KolamTeranura }) {
  const customRows = item.customFields.map(field => ({
    id: field.id,
    label: field.label,
    meta: field.type,
    tone: 'default' as const,
    value: field.value,
  }));
  const vendorRows = item.vendorPrices.map(vendor => ({
    id: vendor.id,
    label: vendor.vendorName,
    meta: [
      vendor.price > 0 ? `Harga ${formatRupiah(vendor.price)}` : '',
      vendor.shippingCost > 0
        ? `Ongkir ${formatRupiah(vendor.shippingCost)}`
        : '',
    ]
      .filter(Boolean)
      .join(' | '),
    tone: 'default' as const,
    value: formatRupiah(vendor.totalCost),
  }));

  if (!customRows.length && !vendorRows.length) {
    return (
      <View style={styles.panel}>
        <KolamEmptyState compact title="Belum ada data tambahan" />
      </View>
    );
  }

  return (
    <View style={styles.panelStack}>
      {customRows.length ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Informasi tambahan</Text>
          <KolamDescriptionList
            accessibilityLabel="Custom fields Teranura"
            rows={customRows}
          />
        </View>
      ) : null}
      {vendorRows.length ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Harga vendor</Text>
          <KolamDescriptionList
            accessibilityLabel="Vendor prices Teranura"
            rows={vendorRows}
          />
        </View>
      ) : null}
    </View>
  );
}

export function TeranuraAssetsTab({ item }: { item: KolamTeranura }) {
  const rows = item.assets.map(asset => ({
    id: asset.id,
    label: asset.title,
    meta: [asset.filename, asset.mimeType].filter(Boolean).join(' | '),
    tone: 'default' as const,
    value:
      asset.fileSize > 0
        ? `${Math.max(1, Math.round(asset.fileSize / 1024))} KB`
        : '—',
  }));

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Aset</Text>
      <KolamDescriptionList
        accessibilityLabel="Aset Teranura"
        rows={
          rows.length
            ? rows
            : [
                {
                  id: 'empty',
                  label: 'Aset',
                  meta: 'Belum ada aset.',
                  tone: 'default',
                  value: '—',
                },
              ]
        }
      />
    </View>
  );
}

export function TeranuraStatisticsTab({ item }: { item: KolamTeranura }) {
  if (!item.linkedProductId) {
    return (
      <View style={styles.panel}>
        <KolamEmptyState
          compact
          message="Tidak ada linked product."
          title="Statistik"
        />
      </View>
    );
  }

  return (
    <KolamEntityStatisticsPanel
      description="Data dari linked product Kolam."
      entityId={item.linkedProductId}
      entityType="product"
    />
  );
}

function MiniTile({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <View style={styles.sidebarMiniTile}>
      <Text style={styles.sidebarMiniLabel}>{label}</Text>
      <View style={styles.sidebarMiniContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  detailPanel: {
    alignSelf: 'stretch',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
    width: '100%',
  },
  panelTitleRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    minWidth: 0,
    width: '100%',
  },
  detailPanelTitle: {
    color: V.colors.fg,
    fontSize: 17,
    fontWeight: '900',
  },
  overviewGrid: {
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 24,
    minWidth: 0,
    width: '100%',
  },
  overviewSidebar: {
    flexGrow: 0,
    flexShrink: 0,
    gap: 12,
    width: 320,
  },
  overviewContent: {
    alignSelf: 'stretch',
    flex: 1,
    flexShrink: 1,
    gap: 12,
    minWidth: 0,
  },
  detailHeroPlaceholder: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: V.colors.secondary,
    borderRadius: 8,
    justifyContent: 'center',
    width: '100%',
  },
  emptyText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
  },
  sidebarMiniGrid: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    minWidth: 0,
    width: '100%',
  },
  sidebarMiniTile: {
    alignItems: 'center',
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 94,
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 70,
    padding: 8,
  },
  sidebarMiniLabel: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
  },
  sidebarMiniContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    minHeight: 22,
  },
  miniValue: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
    textAlign: 'center',
  },
  miniMutedValue: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'center',
  },
  miniBrandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
  },
  miniBrandLogoFrame: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 28,
  },
  miniBrandLogoImage: {
    height: '100%',
    width: '100%',
  },
  miniBrandInitials: {
    color: V.colors.fg,
    fontSize: 9,
    fontWeight: '900',
    lineHeight: 11,
  },
  externalTileGrid: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    minWidth: 0,
    width: '100%',
  },
  externalTilePressable: {
    flex: 1,
    minWidth: 94,
  },
  externalTileMarketIcon: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 32,
  },
  externalTileLogo: {
    height: '100%',
    width: '100%',
  },
  externalTileMark: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '900',
  },
  metaBlock: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 10,
  },
  metaLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  metaValue: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  sidebarChipWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sidebarChip: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: '100%',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  sidebarChipContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    maxWidth: '100%',
  },
  sidebarChipText: {
    color: V.colors.fg,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  sidebarCategoryChip: {
    alignSelf: 'flex-start',
  },
  sidebarCategoryChipText: {
    fontSize: 11,
  },
  localeTitleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  detailSectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '900',
  },
  copyCodeWrap: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  titleCodeChip: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  titleCodeText: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '800',
  },
  copyCodeButton: {
    alignSelf: 'center',
  },
  panel: {
    gap: 12,
    width: '100%',
  },
  panelStack: {
    gap: 16,
    width: '100%',
  },
  card: {
    gap: 12,
    padding: 16,
  },
  panelTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '800',
  },
  metricValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  metricMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionBlock: {
    gap: 10,
  },
  sectionLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  shipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shipCard: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    minWidth: 180,
    padding: 10,
  },
  shipHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  shipTitle: {
    color: V.colors.fg,
    flexShrink: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  shipMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
  },
  variantLogistics: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    marginTop: 8,
    padding: 10,
  },
  thumb: {
    borderRadius: 6,
    height: 36,
    width: 36,
  },
});
