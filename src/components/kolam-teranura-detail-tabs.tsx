import React from 'react';
import { Image, Linking, StyleSheet, Text, View } from 'react-native';
import { appConfig } from '../config/app';
import type { KolamCustomField } from '../domain/kolam-custom-field';
import type {
  KolamTeranura,
  KolamTeranuraCustomField,
  KolamTeranuraVariant,
} from '../domain/kolam-teranura';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { copyTextToClipboard } from '../lib/native-clipboard';
import { formatRupiah } from '../lib/money';
import {
  deleteKolamProductAsset,
  uploadKolamProductAsset,
} from '../services/kolam-product-api';
import { KolamBadge } from './kolam-badge';
import { KolamBarcodePanel } from './kolam-barcode-panel';
import { KolamButton } from './kolam-button';
import { KolamCategoryLabel } from './kolam-category-label';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCustomFieldIcon } from './kolam-custom-field-icon';
import { KolamDescriptionList } from './kolam-description-list';
import {
  KolamDetailAttachedItemsPanel,
  KolamDetailSeoGooglePanel,
  KolamDetailTermsTemplatesPanel,
} from './kolam-detail-more-panels';
import { KolamDetailLocaleTabs } from './kolam-detail-locale-tabs';
import {
  KolamDetailMediaPreview,
  type KolamDetailMediaItem,
} from './kolam-detail-media-preview';
import {
  KolamEntityDetailAssetsPanel,
  type KolamEntityDetailAsset,
} from './kolam-entity-detail-assets-panel';
import { KolamEntityStatisticsPanel } from './kolam-entity-statistics-panel';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import { KolamMarketplaceSyncPlatformList } from './kolam-marketplace-sync-platform-list';
import { KolamPricingMarketplaceSyncFooter } from './kolam-pricing-detail-widgets';
import {
  KolamPricingMetric,
  KolamPricingMetricsGrid,
} from './kolam-pricing-metric-grid';
import { KolamRemoteImage } from './kolam-remote-image';

const SHOPEE_LOGO = require('../assets/marketplace/shopee.jpg');
const TOKOPEDIA_LOGO = require('../assets/marketplace/tokopedia.png');

function formatWeightLabel(weight: number) {
  return weight > 0 ? String(weight) : '-';
}

function formatDimensionLabel(item: {
  length: number;
  width: number;
  height: number;
}) {
  if (!item.length && !item.width && !item.height) {
    return '-';
  }
  return `${item.length || 0} x ${item.width || 0} x ${item.height || 0}`;
}

function formatVolumeLabel(item: {
  length: number;
  width: number;
  height: number;
}) {
  if (!item.length || !item.width || !item.height) {
    return '-';
  }
  return String(item.length * item.width * item.height);
}

function formatCommissionLabel(item: KolamTeranura) {
  if (!item.commissionEnabled) {
    return 'Nonaktif';
  }
  return item.commissionType === 'percentage'
    ? `${item.commissionValue}%`
    : formatRupiah(item.commissionValue);
}

function createTeranuraCustomFieldIconAdapter(
  field: KolamTeranuraCustomField,
): KolamCustomField {
  const fieldType =
    field.type === 'number' ||
    field.type === 'boolean' ||
    field.type === 'range' ||
    field.type === 'select'
      ? field.type
      : 'string';

  return {
    createdAt: '',
    defaultValue: null,
    description: '',
    fieldKey: field.id,
    fieldLabel: field.label,
    fieldType,
    hasMinMax: false,
    iconUrl: null,
    id: field.id,
    maxAllowed: null,
    minAllowed: null,
    options: [],
    order: 0,
    raw: field,
    required: false,
    requiresUnit: false,
    status: 'active',
    translations: {},
    unitId: '',
    unitLabel: '',
    updatedAt: '',
  };
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
  if (item.variants.length > 0) {
    return <TeranuraVariantPricingTab item={item} />;
  }

  const cheapestVendor = [...item.vendorPrices].sort(
    (left, right) => left.totalCost - right.totalCost,
  )[0];

  return (
    <View style={styles.detailPanel}>
      <Text style={styles.detailPanelTitle}>Harga & Penjualan</Text>
      <KolamPricingMetricsGrid>
        <KolamPricingMetric label="Harga Produk">
          <Text style={styles.pricingMetricText}>
            {formatRupiah(item.priceToSell)}
          </Text>
          {item.unitLabel ? (
            <Text style={styles.detailMutedText}>/ {item.unitLabel}</Text>
          ) : null}
        </KolamPricingMetric>
        <KolamPricingMetric label="Harga Tokopedia/Shopee" fullWidth>
          <Text style={styles.pricingMetricText}>
            {formatRupiah(item.onlinePrice)}
          </Text>
          <KolamPricingMarketplaceSyncFooter
            platforms={item.marketplaceSyncPlatforms}
          />
        </KolamPricingMetric>
        <KolamPricingMetric label="Harga Pasar">
          <Text style={styles.pricingMetricText}>
            {formatRupiah(item.marketPrice)}
          </Text>
        </KolamPricingMetric>
        <KolamPricingMetric label="Harga jual minimum">
          <Text style={styles.pricingMetricText}>
            {formatRupiah(item.minimumPriceToSales)}
          </Text>
        </KolamPricingMetric>
        <KolamPricingMetric label="Min. pembelian">
          <Text style={styles.pricingMetricText}>
            {item.minimumOrderQty || '-'}
          </Text>
        </KolamPricingMetric>
        <KolamPricingMetric label="HPP">
          <Text style={styles.pricingMetricText}>
            {item.price > 0
              ? formatRupiah(item.price)
              : cheapestVendor
              ? formatRupiah(cheapestVendor.totalCost)
              : '-'}
          </Text>
          {cheapestVendor && !(item.price > 0) ? (
            <Text style={styles.detailMutedText}>
              {cheapestVendor.vendorName}
            </Text>
          ) : null}
        </KolamPricingMetric>
        <KolamPricingMetric label="Poin member">
          <Text style={styles.pricingMetricText}>
            {item.memberPointsEnabled
              ? `${item.memberPoints} pts`
              : 'Nonaktif'}
          </Text>
        </KolamPricingMetric>
        <KolamPricingMetric label="Komisi">
          <Text style={styles.pricingMetricDanger}>
            {formatCommissionLabel(item)}
          </Text>
        </KolamPricingMetric>
      </KolamPricingMetricsGrid>
    </View>
  );
}

function TeranuraVariantPricingTab({ item }: { item: KolamTeranura }) {
  const tabs = React.useMemo(
    () =>
      item.variants.map((variant, index) => ({
        id: variant.id || String(index),
        label: variant.label || `Varian ${index + 1}`,
        variant,
      })),
    [item.variants],
  );
  const [activeVariantId, setActiveVariantId] = React.useState(
    tabs[0]?.id ?? '0',
  );
  const tabsKey = tabs.map(tab => tab.id).join('|');

  React.useEffect(() => {
    if (!tabs.some(tab => tab.id === activeVariantId)) {
      setActiveVariantId(tabs[0]?.id ?? '0');
    }
  }, [activeVariantId, tabs, tabsKey]);

  const activeTab = tabs.find(tab => tab.id === activeVariantId) ?? tabs[0];
  const variant = activeTab?.variant;

  if (!activeTab || !variant) {
    return (
      <View style={styles.detailPanel}>
        <Text style={styles.detailPanelTitle}>Harga</Text>
        <Text style={styles.detailMutedText}>Belum memiliki varian.</Text>
      </View>
    );
  }

  return (
    <View style={styles.detailPanel}>
      <Text style={styles.detailPanelTitle}>Harga Varian</Text>
      <View style={styles.variantTabHeader}>
        <Text style={styles.variantTabLabel}>Varian :</Text>
        <View style={styles.variantTabList}>
          {tabs.map(tab => (
            <KolamButton
              accessibilityLabel={`Buka harga ${tab.label}`}
              intent={activeTab.id === tab.id ? 'primary' : 'outline'}
              key={tab.id}
              label={tab.label}
              onPress={() => setActiveVariantId(tab.id)}
              style={styles.variantTabButton}
            />
          ))}
        </View>
      </View>
      <View style={styles.variantPricingPanel}>
        <Text style={styles.variantPricingTitle}>{activeTab.label}</Text>
        <KolamPricingMetricsGrid compact>
          <KolamPricingMetric label="SKU">
            <Text selectable style={styles.variantSkuCode}>
              {variant.sku || variant.productCode || '-'}
            </Text>
          </KolamPricingMetric>
          <KolamPricingMetric label="Stok">
            <View style={styles.inlineMetricRow}>
              <KolamBadge
                intent={
                  variant.stock <= 0
                    ? 'danger'
                    : variant.stock <= item.lowStockThreshold
                    ? 'warning'
                    : 'success'
                }
                label={variant.stock <= 0 ? '0' : String(variant.stock)}
              />
            </View>
          </KolamPricingMetric>
          <KolamPricingMetric label="Harga Produk">
            <Text style={styles.pricingMetricText}>
              {formatRupiah(variant.priceToSell)}
            </Text>
            {item.unitLabel ? (
              <Text style={styles.detailMutedText}>/ {item.unitLabel}</Text>
            ) : null}
          </KolamPricingMetric>
          <KolamPricingMetric label="Harga Tokopedia/Shopee" fullWidth>
            <Text style={styles.pricingMetricText}>
              {formatRupiah(item.onlinePrice)}
            </Text>
            <KolamPricingMarketplaceSyncFooter
              platforms={item.marketplaceSyncPlatforms}
            />
          </KolamPricingMetric>
          <KolamPricingMetric label="Harga Pasar">
            <Text style={styles.pricingMetricText}>
              {formatRupiah(item.marketPrice)}
            </Text>
          </KolamPricingMetric>
          <KolamPricingMetric label="Harga jual minimum">
            <Text style={styles.pricingMetricText}>
              {formatRupiah(item.minimumPriceToSales)}
            </Text>
          </KolamPricingMetric>
          <KolamPricingMetric label="Min. pembelian">
            <Text style={styles.pricingMetricText}>
              {item.minimumOrderQty || '-'}
            </Text>
          </KolamPricingMetric>
          <KolamPricingMetric label="HPP">
            <Text style={styles.pricingMetricText}>
              {variant.price > 0 ? formatRupiah(variant.price) : '-'}
            </Text>
          </KolamPricingMetric>
          <KolamPricingMetric label="Poin member">
            <Text style={styles.pricingMetricText}>
              {variant.memberPointsEnabled
                ? `${variant.memberPoints} pts`
                : 'Nonaktif'}
            </Text>
          </KolamPricingMetric>
          <KolamPricingMetric label="Komisi">
            <Text style={styles.pricingMetricDanger}>
              {formatCommissionLabel(item)}
            </Text>
          </KolamPricingMetric>
        </KolamPricingMetricsGrid>
      </View>
    </View>
  );
}

export function TeranuraSpecificationsTab({ item }: { item: KolamTeranura }) {
  const rootFields = item.customFields;
  const hasSpecs = rootFields.length > 0;

  return (
    <View style={styles.detailPanel}>
      <Text style={styles.detailPanelTitle}>Spesifikasi</Text>
      {hasSpecs ? (
        <TeranuraCustomFieldGroup fields={rootFields} title="Produk" />
      ) : (
        <Text style={styles.variantMeta}>
          Belum ada custom field spesifikasi.
        </Text>
      )}
    </View>
  );
}

function TeranuraCustomFieldGroup({
  fields,
  title,
}: {
  fields: KolamTeranuraCustomField[];
  title: string;
}) {
  return (
    <View style={styles.variantRow}>
      <View style={styles.variantCopy}>
        <Text style={styles.variantTitle}>{title}</Text>
        <View style={styles.customFieldSpecList}>
          {fields.map(field => (
            <View key={field.id} style={styles.customFieldSpecRow}>
              <KolamCustomFieldIcon
                field={createTeranuraCustomFieldIconAdapter(field)}
              />
              <View style={styles.customFieldSpecCopy}>
                <Text style={styles.customFieldSpecLabel}>{field.label}</Text>
                <Text style={styles.customFieldSpecValue}>
                  {field.value || '-'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export function TeranuraLogisticsTab({ item }: { item: KolamTeranura }) {
  const variants = item.variants;
  const shippingMethods = item.shippingMethods;
  const rootWeight = formatWeightLabel(item.weight);
  const rootDimension = formatDimensionLabel(item);
  const rootVolume = formatVolumeLabel(item);
  const hasRootLogistics =
    rootWeight !== '-' || rootDimension !== '-' || rootVolume !== '-';
  const hasContent =
    shippingMethods.length > 0 || hasRootLogistics || variants.length > 0;

  return (
    <View style={styles.sectionGrid}>
      <KolamContentFrame
        style={styles.sectionCardFull}
        variant="settingsWebConfig"
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
            <Text style={styles.sectionTitle}>Logistik</Text>
            <Text style={styles.sectionDescription}>
              Metode pengiriman, berat, dimensi, volume, dan batas pengiriman.
            </Text>
          </View>
        </View>
        <View style={styles.logisticsVariantStack}>
          {shippingMethods.length ? (
            <View style={styles.logisticsPanelBlock}>
              <Text style={styles.variantPricingTitle}>Metode Pengiriman</Text>
              <View style={styles.logisticsShippingGrid}>
                {shippingMethods.map(method => (
                  <View
                    key={method.id}
                    style={[
                      styles.logisticsVariantCard,
                      styles.logisticsHalfCard,
                    ]}
                  >
                    <View style={styles.logisticsMethodHeader}>
                      {method.logoUri ? (
                        <KolamRemoteImage
                          accessibilityLabel={`Logo ${method.displayName}`}
                          resizeMode="contain"
                          revision={method.id}
                          scope="shipping-method-logo"
                          sourceUri={method.logoUri}
                          style={styles.logisticsMethodLogo}
                        />
                      ) : (
                        <View style={styles.logisticsMethodLogoFallback}>
                          <Text style={styles.logisticsMethodLogoFallbackText}>
                            {method.displayName.slice(0, 1).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={styles.logisticsMethodTitleWrap}>
                        <Text style={styles.logisticsMethodTitle}>
                          {method.displayName}
                        </Text>
                        <Text style={styles.logisticsMethodMeta}>
                          {method.priceLabel || 'Harga pengiriman belum disetel'}
                        </Text>
                      </View>
                      {method.category ? (
                        <KolamBadge intent="muted" label={method.category} />
                      ) : null}
                    </View>
                    <Text style={styles.logisticsMethodMeta}>
                      {method.etaLabel || 'Estimasi belum disetel'}
                    </Text>
                    <Text style={styles.logisticsMethodMeta}>
                      {method.coverageLabel || 'Cakupan: semua wilayah tersedia'}
                    </Text>
                    {method.minimumOrderAmount > 0 ? (
                      <Text style={styles.logisticsMethodMeta}>
                        Min. order: {formatRupiah(method.minimumOrderAmount)}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {hasRootLogistics || variants.length ? (
            <View style={styles.logisticsPanelBlock}>
              <Text style={styles.variantPricingTitle}>Ukuran & Berat</Text>
              <View style={styles.logisticsShippingGrid}>
                {hasRootLogistics ? (
                  <View
                    style={[
                      styles.logisticsVariantCard,
                      styles.logisticsHalfCard,
                    ]}
                  >
                    <Text style={styles.logisticsMethodTitle}>Produk</Text>
                    <KolamPricingMetricsGrid compact>
                      <KolamPricingMetric label="Berat">
                        <Text style={styles.pricingMetricText}>
                          {rootWeight}
                        </Text>
                      </KolamPricingMetric>
                      <KolamPricingMetric label="Dimensi">
                        <Text style={styles.pricingMetricText}>
                          {rootDimension}
                        </Text>
                      </KolamPricingMetric>
                      <KolamPricingMetric label="Volume">
                        <Text style={styles.pricingMetricText}>
                          {rootVolume}
                        </Text>
                      </KolamPricingMetric>
                    </KolamPricingMetricsGrid>
                  </View>
                ) : null}
                {variants.map((variant, index) => (
                  <TeranuraVariantLogisticsCard
                    key={variant.id || String(index)}
                    index={index}
                    variant={variant}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {!hasContent ? (
            <Text style={styles.emptyText}>
              Belum ada data logistik dari server/cache lokal.
            </Text>
          ) : null}
        </View>
      </KolamContentFrame>
    </View>
  );
}

function TeranuraVariantLogisticsCard({
  index,
  variant,
}: {
  index: number;
  variant: KolamTeranuraVariant;
}) {
  return (
    <View style={[styles.logisticsVariantCard, styles.logisticsHalfCard]}>
      <Text style={styles.logisticsMethodTitle}>
        {variant.label || `Varian ${index + 1}`}
      </Text>
      <KolamPricingMetricsGrid compact>
        <KolamPricingMetric label="Berat">
          <Text style={styles.pricingMetricText}>
            {formatWeightLabel(variant.weight)}
          </Text>
        </KolamPricingMetric>
        <KolamPricingMetric label="Dimensi">
          <Text style={styles.pricingMetricText}>
            {formatDimensionLabel(variant)}
          </Text>
        </KolamPricingMetric>
        <KolamPricingMetric label="Volume">
          <Text style={styles.pricingMetricText}>
            {formatVolumeLabel(variant)}
          </Text>
        </KolamPricingMetric>
      </KolamPricingMetricsGrid>
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
          style={styles.variantThumbImage}
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
          style={styles.variantThumbImage}
        />
      ) : undefined,
      tone: 'default' as const,
      value: `x${packing.quantity}`,
    })),
  ];

  return (
    <View style={styles.detailPanel}>
      <Text style={styles.detailPanelTitle}>Bahan Penyusun</Text>
      <KolamDescriptionList
        accessibilityLabel="Bahan penyusun dan kemasan produk"
        rows={
          rows.length
            ? rows
            : [
                {
                  id: 'empty',
                  label: 'Bahan baku dan kemasan',
                  meta: 'FE menampilkan komponen dan packing di tab ini.',
                  tone: 'default',
                  value: 'Belum ada bahan penyusun atau kemasan.',
                },
              ]
        }
      />
    </View>
  );
}

export function TeranuraMoreTab({ item }: { item: KolamTeranura }) {
  const termsItemId = item.linkedProductId || item.id;

  return (
    <View style={styles.sectionGrid}>
      <KolamDetailTermsTemplatesPanel
        itemId={termsItemId}
        itemLabel="produk"
        itemType="product"
        summary={{
          label: 'Garansi',
          meta: [
            item.warranty.days ? `${item.warranty.days} hari` : '',
            item.warranty.vendorName,
            item.warranty.termsTitle,
          ]
            .filter(Boolean)
            .join(' | '),
          status: item.warranty.label,
          statusIntent: item.warranty.mode === 'none' ? 'muted' : 'success',
        }}
      />
      <KolamDetailAttachedItemsPanel
        description="Produk atau spesies terhubung (compatible / replacement)."
        emptyText="Belum ada item terlampir."
        items={item.attachedItems}
        title="Produk kompatibel"
      />
      <KolamDetailSeoGooglePanel
        description={item.description}
        entityName={item.name}
        pathPrefix="products"
        seo={{
          keywords: item.seo.keywords,
          lastSeoScore: item.seo.lastSeoScore,
          metaDescription: item.seo.metaDescription,
          metaTitle: item.seo.metaTitle,
        }}
        shortDescription={item.shortDescription}
        slug={item.slug}
      />
    </View>
  );
}

export function TeranuraAssetsTab({ item }: { item: KolamTeranura }) {
  const productId = item.linkedProductId || item.id;

  const handleUpload = React.useCallback(
    async (title: string, localUri: string) => {
      const updated = await uploadKolamProductAsset(productId, title, localUri);
      return updated.assets;
    },
    [productId],
  );

  const handleDelete = React.useCallback(
    async (assetId: string) => {
      const updated = await deleteKolamProductAsset(productId, assetId);
      return updated.assets;
    },
    [productId],
  );

  const handleDownload = React.useCallback(
    (asset: KolamEntityDetailAsset) => {
      const base = appConfig.kolamApiBaseUrl.replace(/\/$/, '');
      void Linking.openURL(
        `${base}/products/${encodeURIComponent(
          productId,
        )}/assets/${encodeURIComponent(asset.id)}/download`,
      );
    },
    [productId],
  );

  return (
    <KolamEntityDetailAssetsPanel
      assets={item.assets}
      deleteAsset={handleDelete}
      downloadAsset={handleDownload}
      uploadAsset={handleUpload}
    />
  );
}

export function TeranuraStatisticsTab({ item }: { item: KolamTeranura }) {
  const entityId = item.linkedProductId || item.id;

  return (
    <KolamEntityStatisticsPanel
      description="Penjualan, pembelian, dan performa produk."
      entityId={entityId}
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
  detailMutedText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  pricingMetricText: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  pricingMetricDanger: {
    color: V.colors.danger,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  inlineMetricRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  variantTabHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  variantTabLabel: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  variantTabList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    minWidth: 0,
  },
  variantTabButton: {
    minHeight: 32,
    paddingHorizontal: 10,
  },
  variantPricingPanel: {
    alignSelf: 'stretch',
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    minWidth: 0,
    padding: 12,
    width: '100%',
  },
  variantPricingTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },
  variantSkuCode: {
    backgroundColor: V.colors.secondary,
    borderRadius: 4,
    color: V.colors.fg,
    fontFamily: 'Consolas',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  sectionGrid: {
    alignSelf: 'stretch',
    gap: 12,
    minWidth: 0,
    width: '100%',
  },
  sectionCardFull: {
    alignSelf: 'stretch',
    gap: 0,
    minWidth: 0,
    padding: 0,
    width: '100%',
  },
  sectionHeader: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    padding: 12,
  },
  sectionTitleWrap: {
    gap: 3,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },
  sectionDescription: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  logisticsVariantStack: {
    alignSelf: 'stretch',
    gap: 10,
    minWidth: 0,
    padding: 12,
    width: '100%',
  },
  logisticsVariantCard: {
    alignSelf: 'stretch',
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    minWidth: 0,
    padding: 12,
    width: '100%',
  },
  logisticsHalfCard: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 280,
  },
  logisticsPanelBlock: {
    alignSelf: 'stretch',
    gap: 10,
    minWidth: 0,
    width: '100%',
  },
  logisticsShippingGrid: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    minWidth: 0,
    width: '100%',
  },
  logisticsMethodHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  logisticsMethodLogo: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 42,
    width: 56,
  },
  logisticsMethodLogoFallback: {
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderColor: '#bbf7d0',
    borderRadius: 6,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 56,
  },
  logisticsMethodLogoFallbackText: {
    color: V.colors.primary,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 20,
  },
  logisticsMethodTitleWrap: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  logisticsMethodTitle: {
    color: V.colors.fg,
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  logisticsMethodMeta: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  variantRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  variantCopy: {
    flex: 1,
    minWidth: 0,
  },
  variantTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
  },
  variantMeta: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  variantThumbImage: {
    height: 42,
    width: 42,
  },
  customFieldSpecList: {
    alignSelf: 'stretch',
    gap: 8,
    marginTop: 10,
    minWidth: 0,
    width: '100%',
  },
  customFieldSpecRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 48,
    minWidth: 0,
    padding: 10,
    width: '100%',
  },
  customFieldSpecCopy: {
    flex: 1,
    minWidth: 0,
  },
  customFieldSpecLabel: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  customFieldSpecValue: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
});
