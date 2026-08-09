import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { KolamTeranura } from '../domain/kolam-teranura';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { formatRupiah } from '../lib/money';
import { KolamBadge } from './kolam-badge';
import { KolamBarcodePanel } from './kolam-barcode-panel';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamDescriptionList } from './kolam-description-list';
import {
  KolamDetailMediaPreview,
  type KolamDetailMediaItem,
} from './kolam-detail-media-preview';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamEntityStatisticsPanel } from './kolam-entity-statistics-panel';
import { KolamHtmlContent } from './kolam-html-content';
import {
  KolamPricingMetric,
  KolamPricingMetricsGrid,
} from './kolam-pricing-metric-grid';
import { KolamRemoteImage } from './kolam-remote-image';

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

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Ringkasan</Text>
      <View style={styles.overviewGrid}>
        <View style={styles.overviewSidebar}>
          {mediaItems.length ? (
            <KolamDetailMediaPreview items={mediaItems} title={item.name} />
          ) : (
            <View style={styles.mediaPlaceholder}>
              <Text style={styles.emptyText}>Belum ada foto</Text>
            </View>
          )}
          <KolamBarcodePanel
            name={item.name}
            priceLabel={formatRupiah(item.priceToSell)}
            sku={item.sku || item.productCode || item.name}
          />
          <View style={styles.miniGrid}>
            <MiniTile label="Status">
              <KolamBadge
                intent={item.sellable ? 'success' : 'secondary'}
                label={item.sellable ? 'Dijual' : 'Tidak dijual'}
              />
            </MiniTile>
            <MiniTile label="Stok">
              <KolamBadge
                intent={stockIntent}
                label={item.stock <= 0 ? 'Habis' : String(item.stock)}
              />
            </MiniTile>
            <MiniTile label="SKU">
              <Text style={styles.miniValue}>
                {item.sku || item.productCode || '—'}
              </Text>
            </MiniTile>
            <MiniTile label="Satuan">
              <Text style={styles.miniValue}>
                {item.unitInitial || item.unitLabel || '—'}
              </Text>
            </MiniTile>
            <MiniTile label="Merek">
              <Text style={styles.miniValue}>{item.brand?.name || '—'}</Text>
            </MiniTile>
            <MiniTile label="Line">
              {item.deviceLine === 'freyer' ? (
                <KolamBadge intent="info" label="Freyer" />
              ) : (
                <Text style={styles.miniValue}>Teranura</Text>
              )}
            </MiniTile>
          </View>
        </View>

        <View style={styles.overviewMain}>
          {(item.categories.length || item.category) && (
            <View style={styles.block}>
              <Text style={styles.blockLabel}>Kategori</Text>
              <View style={styles.chipWrap}>
                {(item.categories.length
                  ? item.categories
                  : item.category
                  ? [item.category]
                  : []
                ).map(category => (
                  <KolamBadge
                    key={category.id || category.name}
                    intent="secondary"
                    label={category.name}
                  />
                ))}
              </View>
            </View>
          )}
          {item.locationLabel ? (
            <View style={styles.block}>
              <Text style={styles.blockLabel}>Lokasi</Text>
              <Text style={styles.blockValue}>{item.locationLabel}</Text>
            </View>
          ) : null}
          {item.shortDescription ? (
            <View style={styles.block}>
              <Text style={styles.blockLabel}>Deskripsi singkat</Text>
              <Text style={styles.blockValue}>{item.shortDescription}</Text>
            </View>
          ) : null}
          {item.description ? (
            <View style={styles.block}>
              <Text style={styles.blockLabel}>Deskripsi</Text>
              <KolamHtmlContent html={item.description} />
            </View>
          ) : null}
          {item.tags.length ? (
            <View style={styles.block}>
              <Text style={styles.blockLabel}>Tag</Text>
              <View style={styles.chipWrap}>
                {item.tags.map(tag => (
                  <KolamBadge key={tag} intent="muted" label={tag} />
                ))}
              </View>
            </View>
          ) : null}
          {item.links.length ? (
            <View style={styles.block}>
              <Text style={styles.blockLabel}>Tautan</Text>
              {item.links.map(link => (
                <Text key={link.id} selectable style={styles.linkText}>
                  {link.label}: {link.url}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
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
    <View style={styles.miniTile}>
      <Text style={styles.miniLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
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
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    width: '100%',
  },
  overviewSidebar: {
    flexGrow: 1,
    flexShrink: 1,
    gap: 12,
    maxWidth: 360,
    minWidth: 240,
  },
  overviewMain: {
    flexGrow: 2,
    flexShrink: 1,
    gap: 14,
    minWidth: 260,
  },
  mediaPlaceholder: {
    alignItems: 'center',
    backgroundColor: V.colors.secondary,
    borderRadius: V.radius.md,
    justifyContent: 'center',
    minHeight: 180,
  },
  emptyText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  miniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  miniTile: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    minWidth: 100,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  miniLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  miniValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  block: {
    gap: 6,
  },
  blockLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  blockValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  linkText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
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
