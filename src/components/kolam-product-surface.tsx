import React from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { appConfig } from '../config/app';
import type { KolamBarcodeLabelItem } from '../domain/kolam-barcode';
import {
  getCustomFieldTypeLabel,
  type KolamCustomField,
} from '../domain/kolam-custom-field';
import type { KolamTableColumn } from '../domain/kolam-table';
import { createEmptyKolamProductVendorPriceFormRow } from '../domain/kolam-product';
import type {
  KolamProduct,
  KolamProductExternalLinkFormRow,
  KolamProductFormState,
  KolamProductLinkName,
  KolamProductVendorPriceFormRow,
  KolamProductVariantFormRow,
} from '../domain/kolam-product';
import type { KolamMarketplacePlatform } from '../services/kolam-marketplace-sync-api';
import type { KolamUnit } from '../domain/kolam-unit';
import {
  fetchKolamActivePricingSources,
  fetchKolamChannelPricingAnalysis,
  fetchKolamPricingPaymentMethods,
  fetchKolamTaxEstimate,
  type KolamChannelPricingAnalysis,
  type KolamPricingPaymentMethod,
  type KolamPricingSource,
  type KolamTaxEstimate,
} from '../services/kolam-pricing-analysis-api';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { useKolamProductController } from '../hooks/use-kolam-product-controller';
import {
  deleteKolamProductAsset,
  uploadKolamProductAsset,
} from '../services/kolam-product-api';
import { KolamBadge } from './kolam-badge';
import { KolamBarcodePanel } from './kolam-barcode-panel';
import { KolamBarcodePrintDialog } from './kolam-barcode-print-dialog';
import { KolamButton } from './kolam-button';
import { KolamCategoryLabel } from './kolam-category-label';
import { KolamCatalogTranslationsEditor } from './kolam-catalog-translations-editor';
import { KolamCommercialPolicyEditor } from './kolam-commercial-policy-editor';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamConfirmDialog } from './kolam-confirm-dialog';
import { KolamControlTabList } from './kolam-control-tab-list';
import { KolamCustomFieldIcon } from './kolam-custom-field-icon';
import { KolamDataTableHeader } from './kolam-data-table-header';
import { KolamDataTableRowFrame } from './kolam-data-table-row-frame';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import { KolamExportDialog } from './kolam-export-dialog';
import { KolamMarketplacePriceSyncDialog } from './kolam-marketplace-price-sync-dialog';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import {
  KolamDetailMediaPreview,
  type KolamDetailMediaItem,
} from './kolam-detail-media-preview';
import { KolamDetailLocaleTabs } from './kolam-detail-locale-tabs';
import {
  KolamEntityDetailAssetsPanel,
  type KolamEntityDetailAsset,
} from './kolam-entity-detail-assets-panel';
import { KolamEntityStatisticsPanel } from './kolam-entity-statistics-panel';
import {
  KolamDetailAttachedItemsPanel,
  KolamDetailSeoGooglePanel,
  KolamDetailTermsTemplatesPanel,
} from './kolam-detail-more-panels';
import { KolamDescriptionList } from './kolam-description-list';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import { KolamMediaPlayer } from './kolam-media-player';
import { KolamMarketplaceSyncPlatformList } from './kolam-marketplace-sync-platform-list';
import { KolamNativeFormSection } from './kolam-native-form-section';
import {
  KolamPricingMetric,
  KolamPricingMetricsGrid,
} from './kolam-pricing-metric-grid';
import {
  KolamGrocerPricingCard,
  KolamInternalProfitCard,
  KolamMarketplaceProfitAnalyzerCard,
  KolamPricingMarketplaceSyncFooter,
  KolamVendorPriceCard,
  type KolamVendorPriceCardItem,
} from './kolam-pricing-detail-widgets';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamGrocerPricingTiersEditor } from './kolam-grocer-pricing-tiers-editor';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { copyTextToClipboard } from '../lib/native-clipboard';

const SHOPEE_LOGO = require('../assets/marketplace/shopee.jpg');
const TOKOPEDIA_LOGO = require('../assets/marketplace/tokopedia.png');

const PRODUCT_EXTERNAL_LINK_OPTIONS: Array<{
  label: string;
  value: KolamProductLinkName | '';
}> = [
  { label: 'Pilih tipe tautan', value: '' },
  { label: 'Shopee', value: 'shopee' },
  { label: 'Tokopedia', value: 'tokopedia' },
  { label: 'Situs Web', value: 'website' },
  { label: 'Tautan POS', value: 'link_pos' },
  { label: 'Tautan Lain', value: 'other_link' },
];

const PRODUCT_COLUMNS: KolamTableColumn[] = [
  { id: 'primary', label: 'Nama', align: 'left' },
  { id: 'meta', label: 'SKU', align: 'left', width: 86 },
  { id: 'price', label: 'Merek', align: 'left', width: 130 },
  { id: 'amount', label: 'Harga Jual', align: 'right', width: 112 },
  { id: 'products', label: 'Stok', align: 'right', width: 86 },
  { id: 'marketplace', label: 'Sinkron Terakhir', align: 'left', width: 132 },
  { id: 'children', label: 'Informasi', align: 'left', width: 96 },
  { id: 'actions', label: '', align: 'right', width: 54 },
];

const STOCK_OPTIONS = [
  { label: 'Semua', value: 'all' },
  { label: 'Stok tersedia', value: 'in_stock' },
  { label: 'Stok habis', value: 'out_of_stock' },
  { label: 'Stok rendah', value: 'low_stock' },
];

type ProductListFilterPanel = 'category' | 'brand' | 'stock';
type ProductVariantEditTab = 'pricing' | 'vendor' | 'specs' | 'media';

type PendingProductAction = {
  product: KolamProduct;
  type: 'archive' | 'delete' | 'duplicate';
};

type SyncStockSelection = {
  ids: string[];
  platforms?: KolamMarketplacePlatform[];
  title: string;
};

type ProductMediaItem = {
  badgeLabel?: string;
  id: string;
  type: 'image' | 'video';
  title: string;
  uri: string;
};

export function KolamProductSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamProductController(route);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [barcodeOpen, setBarcodeOpen] = React.useState(false);
  const [syncPriceOpen, setSyncPriceOpen] = React.useState(false);
  const [syncStockOpen, setSyncStockOpen] = React.useState(false);
  const [barcodeDialogItems, setBarcodeDialogItems] = React.useState<KolamBarcodeLabelItem[] | null>(null);
  const [pendingAction, setPendingAction] = React.useState<PendingProductAction | null>(null);
  const [syncStockSelection, setSyncStockSelection] = React.useState<SyncStockSelection | null>(null);
  const [activeFilterPanel, setActiveFilterPanel] = React.useState<ProductListFilterPanel | null>(null);
  const [filterPanelQuery, setFilterPanelQuery] = React.useState('');
  const productIds = React.useMemo(
    () => controller.products.map(product => product.id).filter(Boolean),
    [controller.products],
  );
  const barcodeItems = React.useMemo(
    () => createBarcodeItems(controller.products),
    [controller.products],
  );
  const categoryOptions = React.useMemo(
    () => [
      { label: 'Semua', value: 'all' },
      ...controller.categories.map(category => ({
        label: category.name,
        value: category.id,
      })),
    ],
    [controller.categories],
  );
  const brandOptions = React.useMemo(
    () => [
      { label: 'Semua', value: 'all' },
      ...controller.brands.map(brand => ({
        label: brand.name,
        value: brand.id,
      })),
    ],
    [controller.brands],
  );
  const selectedCategory = controller.filters.categoryIds[0] ?? 'all';
  const selectedBrand = controller.filters.brandIds[0] ?? 'all';
  const selectedStock = controller.filters.stockStatus || 'all';
  const categoryFilterLabel = getProductFilterLabel(
    categoryOptions,
    selectedCategory,
    'Kategori',
  );
  const brandFilterLabel = getProductFilterLabel(brandOptions, selectedBrand, 'Merek');
  const stockFilterLabel = getProductStockFilterLabel(selectedStock);
  const openFilterPanel = (panel: ProductListFilterPanel) => {
    setActiveFilterPanel(current => (current === panel ? null : panel));
    setFilterPanelQuery('');
  };
  const closeFilterPanel = () => {
    setActiveFilterPanel(null);
    setFilterPanelQuery('');
  };

  if (controller.mode !== 'list') {
    return (
      <KolamProductDetailView
        controller={controller}
        onArchive={product => setPendingAction({ type: 'archive', product })}
        onBack={() => {
          controller.onBackToList();
          onRouteChange?.('/products');
        }}
        onCancelEdit={product => {
          void controller.onSelectProduct(product);
          onRouteChange?.(`/products/${product.slug || product.id}`);
        }}
        onDelete={product => setPendingAction({ type: 'delete', product })}
        onEdit={product => {
          void controller.onSelectProduct(product, 'edit');
          onRouteChange?.(`/products/${product.slug || product.id}/edit`);
        }}
        onPrintBarcode={product => {
          setBarcodeDialogItems(createBarcodeItems([product]));
          setBarcodeOpen(true);
        }}
        onRestore={product => void controller.onRestoreProduct(product)}
      />
    );
  }

  return (
    <View style={styles.surface}>

      <View style={styles.stack}>
        <View style={styles.toolbarShell}>
          <View style={styles.filterRow}>
            <KolamFormTextField
              onChangeText={controller.onSearchChange}
              placeholder="Cari"
              style={styles.search}
              value={controller.filters.search}
            />
            <ProductFilterTrigger
              active={activeFilterPanel === 'category'}
              label={categoryFilterLabel}
              onPress={() => openFilterPanel('category')}
            />
            <ProductFilterTrigger
              active={activeFilterPanel === 'brand'}
              label={brandFilterLabel}
              onPress={() => openFilterPanel('brand')}
            />
            <ProductFilterTrigger
              active={activeFilterPanel === 'stock'}
              label={stockFilterLabel}
              onPress={() => openFilterPanel('stock')}
            />
          </View>
          <View style={styles.actionRow}>
            <KolamButton label="Ekspor" onPress={() => setExportOpen(true)} style={styles.toolbarButton} />
            <KolamButton
              label={`Cetak barcode (${barcodeItems.length})`}
              onPress={() => {
                setBarcodeDialogItems(null);
                setBarcodeOpen(true);
              }}
              style={styles.toolbarButton}
            />
            <KolamButton label="SEO audit" muted style={styles.toolbarButton} />
            <KolamButton
              label="Sinkron Harga"
              onPress={() => setSyncPriceOpen(true)}
              style={styles.toolbarButton}
            />
            <KolamButton
              label="Sinkron Stok"
              onPress={() => {
                setSyncStockSelection({ ids: productIds, title: 'Samakan Stok Produk ke Marketplace' });
                setSyncStockOpen(true);
              }}
              style={styles.toolbarButton}
            />
            <KolamButton
              intent="primary"
              label="Baru"
              onPress={() => {
                controller.onCreateNew();
                onRouteChange?.('/products/create');
              }}
              style={styles.toolbarButton}
            />

          </View>
        </View>

        {controller.error ? (
          <Text style={styles.error}>{controller.error}</Text>
        ) : null}

        {activeFilterPanel ? (
          <ProductFilterOverlayPanel
            activePanel={activeFilterPanel}
            brandOptions={brandOptions}
            categoryOptions={categoryOptions}
            onBrandChange={value => {
              controller.onChangeFilters({
                brandIds: value === 'all' ? [] : [value],
              });
              closeFilterPanel();
            }}
            onCategoryChange={value => {
              controller.onChangeFilters({
                categoryIds: value === 'all' ? [] : [value],
              });
              closeFilterPanel();
            }}
            onClose={closeFilterPanel}
            onQueryChange={setFilterPanelQuery}
            onStockChange={value => {
              controller.onChangeFilters({
                stockStatus: value === 'all' ? '' : value,
              });
              closeFilterPanel();
            }}
            query={filterPanelQuery}
            selectedBrand={selectedBrand}
            selectedCategory={selectedCategory}
            selectedStock={selectedStock}
          />
        ) : null}

        <KolamContentFrame style={styles.tableFrame} variant="settingsWebConfig">
          <KolamDataTableHeader columns={PRODUCT_COLUMNS} />
          {controller.products.length ? (
            controller.products.map(product => (
              <ProductRow
                key={product.id}
                onArchive={() => setPendingAction({ type: 'archive', product })}
                onBarcode={() => {
                  setBarcodeDialogItems(createBarcodeItems([product]));
                  setBarcodeOpen(true);
                }}
                onDelete={() => setPendingAction({ type: 'delete', product })}
                onDetail={() => {
                  void controller.onSelectProduct(product);
                  onRouteChange?.(`/products/${product.slug || product.id}`);
                }}
                onDuplicate={() => setPendingAction({ type: 'duplicate', product })}
                onEdit={() => {
                  void controller.onSelectProduct(product, 'edit');
                  onRouteChange?.(`/products/${product.slug || product.id}/edit`);
                }}
                onLicense={() => onRouteChange?.(`/product-serials?productId=${product.id}`)}
                onSyncStock={platforms => {
                  setSyncStockSelection({
                    ids: [product.id],
                    platforms,
                    title: `Samakan Stok ${product.name} ke Marketplace`,
                  });
                  setSyncStockOpen(true);
                }}
                onTogglePin={() => void controller.onTogglePin(product)}
                product={product}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {controller.loading ? 'Membaca produk...' : 'Belum ada produk.'}
              </Text>
            </View>
          )}
        </KolamContentFrame>

        <View style={styles.footerWrap}>
          <KolamTableFooterControls
            onPageSizeChange={controller.onLimitChange}
            page={controller.pagination.page}
            pageSize={controller.pagination.limit}
            total={controller.pagination.total}
          >
            <KolamButton
              disabled={controller.pagination.page <= 1}
              label="Sebelumnya"
              onPress={() => controller.onPageChange(controller.pagination.page - 1)}
            />
            <KolamButton
              disabled={controller.pagination.page >= controller.pagination.totalPages}
              label="Berikutnya"
              onPress={() => controller.onPageChange(controller.pagination.page + 1)}
            />
          </KolamTableFooterControls>
        </View>
      </View>

      <KolamExportDialog
        catalogEndpoint="/products/export/fields"
        catalogParams={{ type: 'product' }}
        defaultPresetKey="basic"
        description="Pilih field yang ingin di-ekspor ke XLSX. Filter dan pencarian saat ini ikut diterapkan."
        downloadEndpoint="/products/export.xlsx"
        downloadParams={{
          type: 'product',
          search: controller.filters.search || undefined,
          category: controller.filters.categoryIds,
          brand: controller.filters.brandIds,
          stockStatus: controller.filters.stockStatus || undefined,
        }}
        filenameHint="products"
        onOpenChange={setExportOpen}
        storageKey="export.products.v1"
        title="Ekspor Produk"
        visible={exportOpen}
      />
      <KolamBarcodePrintDialog
        description="Label CODE128 memakai SKU produk. Ukuran label mengikuti web: 30mm dengan tinggi barcode 20mm."
        items={barcodeItems}
        onOpenChange={setBarcodeOpen}
        title="Cetak Barcode Produk"
        visible={barcodeOpen}
      />
      <KolamMarketplacePriceSyncDialog
        itemCount={controller.pagination.total || controller.products.length}
        onOpenChange={setSyncPriceOpen}
        productIds={productIds}
        source="products"
        syncKind="price"
        title="Samakan Harga Produk ke Marketplace"
        visible={syncPriceOpen}
      />
      <KolamMarketplacePriceSyncDialog
        initialPlatforms={syncStockSelection?.platforms}
        itemCount={syncStockSelection?.ids.length || controller.pagination.total || controller.products.length}
        onOpenChange={open => {
          setSyncStockOpen(open);
          if (!open) {
            setSyncStockSelection(null);
          }
        }}
        productIds={syncStockSelection?.ids ?? productIds}
        source="products"
        syncKind="stock"
        title={syncStockSelection?.title ?? 'Samakan Stok Produk ke Marketplace'}
        visible={syncStockOpen}
      />
      <KolamConfirmDialog
        confirmLabel="Duplikat"
        message={`Yakin ingin menduplikat produk ${pendingAction?.product.name ?? ''}? Entri produk baru akan dibuat dengan detail yang sama.`}
        title="Duplikat Produk"
        visible={pendingAction?.type === 'duplicate'}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => {
          const product = pendingAction?.product;
          if (!product) {
            return;
          }
          void controller.onDuplicateProduct(product).then(ok => {
            if (ok) {
              setPendingAction(null);
            }
          });
        }}
      />
      <KolamConfirmDialog
        confirmLabel="Arsipkan"
        message={`Produk ${pendingAction?.product.name ?? ''} tidak akan muncul di webstore, DARA, chat, atau PO baru. Data historis tetap tersimpan.`}
        title="Arsipkan Produk?"
        visible={pendingAction?.type === 'archive'}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => {
          const product = pendingAction?.product;
          if (!product) {
            return;
          }
          void controller.onArchiveProduct(product).then(ok => {
            if (ok) {
              setPendingAction(null);
            }
          });
        }}
      />
      <KolamDeleteConfirmDialog
        itemLabel={pendingAction?.product.name}
        itemType="produk"
        visible={pendingAction?.type === 'delete'}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => {
          const product = pendingAction?.product;
          if (!product) {
            return;
          }
          void controller.onDeleteProduct(product).then(ok => {
            if (ok) {
              setPendingAction(null);
            }
          });
        }}
      />
    </View>
  );
}

function ProductFilterTrigger({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <KolamButton
      intent={active ? 'primary' : 'plain'}
      label={label}
      onPress={onPress}
      style={styles.filterTrigger}
    />
  );
}

function ProductFilterOverlayPanel({
  activePanel,
  brandOptions,
  categoryOptions,
  onBrandChange,
  onCategoryChange,
  onClose,
  onQueryChange,
  onStockChange,
  query,
  selectedBrand,
  selectedCategory,
  selectedStock,
}: {
  activePanel: ProductListFilterPanel;
  brandOptions: Array<{ label: string; value: string }>;
  categoryOptions: Array<{ label: string; value: string }>;
  onBrandChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onStockChange: (value: string) => void;
  query: string;
  selectedBrand: string;
  selectedCategory: string;
  selectedStock: string;
}) {
  const options =
    activePanel === 'category'
      ? categoryOptions
      : activePanel === 'brand'
      ? brandOptions
      : STOCK_OPTIONS;
  const selectedValue =
    activePanel === 'category'
      ? selectedCategory
      : activePanel === 'brand'
      ? selectedBrand
      : selectedStock;
  const normalizedQuery = normalizeProductFilterQuery(query);
  const filteredOptions =
    normalizedQuery && activePanel !== 'stock'
      ? options.filter(option =>
          normalizeProductFilterQuery(option.label).includes(normalizedQuery),
        )
      : options;

  return (
    <View
      style={[
        styles.filterOverlayPanel,
        getProductFilterOverlayPanelStyle(activePanel),
      ]}
    >
      {activePanel === 'stock' ? null : (
        <KolamFormTextField
          onChangeText={onQueryChange}
          placeholder={activePanel === 'category' ? 'Cari kategori...' : 'Cari merek...'}
          style={styles.filterPanelSearch}
          value={query}
        />
      )}
      <ScrollView
        contentContainerStyle={styles.filterPanelContent}
        keyboardShouldPersistTaps="handled"
        style={styles.filterPanelScroll}
      >
        {filteredOptions.length ? (
          filteredOptions.map(option => {
            const isSelected = option.value === selectedValue;
            return (
              <KolamButton
                intent={isSelected ? 'primary' : 'plain'}
                key={activePanel + '-' + option.value}
                label={option.label}
                onPress={() => {
                  if (activePanel === 'category') {
                    onCategoryChange(option.value);
                    return;
                  }

                  if (activePanel === 'brand') {
                    onBrandChange(option.value);
                    return;
                  }

                  onStockChange(option.value);
                }}
                style={styles.filterPanelOption}
              />
            );
          })
        ) : (
          <KolamCopyStack
            items={[
              {
                id: 'empty',
                text: 'Tidak ada pilihan.',
                style: styles.filterPanelEmpty,
              },
            ]}
          />
        )}
      </ScrollView>
      <View style={styles.filterPanelFooter}>
        <KolamButton label="Tutup" onPress={onClose} />
      </View>
    </View>
  );
}

function getProductFilterLabel(
  options: Array<{ label: string; value: string }>,
  selectedValue: string,
  fallback: string,
) {
  if (selectedValue === 'all') {
    return fallback;
  }

  return options.find(option => option.value === selectedValue)?.label ?? fallback;
}

function getProductStockFilterLabel(value: string) {
  switch (value) {
    case 'in_stock':
      return 'Stok tersedia';
    case 'out_of_stock':
      return 'Stok habis';
    case 'low_stock':
      return 'Stok rendah';
    case 'all':
    default:
      return 'Stok';
  }
}

function getProductFilterOverlayPanelStyle(panel: ProductListFilterPanel) {
  switch (panel) {
    case 'brand':
      return styles.filterPanelBrand;
    case 'stock':
      return styles.filterPanelStock;
    case 'category':
    default:
      return styles.filterPanelCategory;
  }
}

function normalizeProductFilterQuery(value: string) {
  return value.trim().toLowerCase();
}

function ProductRow({
  onArchive,
  onBarcode,
  onDelete,
  onDetail,
  onDuplicate,
  onEdit,
  onLicense,
  onSyncStock,
  onTogglePin,
  product,
}: {
  onArchive: () => void;
  onBarcode: () => void;
  onDelete: () => void;
  onDetail: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onLicense: () => void;
  onSyncStock: (platforms: KolamMarketplacePlatform[]) => void;
  onTogglePin: () => void;
  product: KolamProduct;
}) {
  const thumbnailUri = product.thumbnailUri || product.photoUris[0] || '';

  return (
    <KolamDataTableRowFrame style={styles.tableRow}>
      <View style={styles.productPrimaryCell}>
        <View style={styles.thumbnailFrame}>
          {thumbnailUri ? (
            <KolamRemoteImage
              accessibilityLabel={`Foto ${product.name}`}
              resizeMode="cover"
              revision={product.updatedAt || thumbnailUri || product.id}
              scope="product"
              sourceUri={thumbnailUri}
              style={styles.thumbnail}
            />
          ) : null}
        </View>
        <KolamCopyStack
          containerStyle={styles.productCopy}
          items={[
            { id: 'name', text: product.name, style: styles.productName },
            {
              id: 'category',
              text: product.categories.map(category => category.name).join(', ') || '-',
              style: styles.productCategory,
            },
          ]}
        />
      </View>
      <Text selectable style={styles.skuCell}>{product.sku || product.productCode || '-'}</Text>
      <View style={styles.brandCell}>
        {product.brands.length ? (
          <View style={styles.brandLogoRow}>
            {product.brands.slice(0, 3).map(brand => (
              <View key={brand.id || brand.name} style={styles.brandLogoFrame}>
                {brand.logoUri ? (
                  <KolamRemoteImage
                    accessibilityLabel={`Logo ${brand.name}`}
                    resizeMode="contain"
                    revision={brand.logoUri}
                    scope="product-brand"
                    sourceUri={brand.logoUri}
                    style={styles.brandLogoImage}
                  />
                ) : (
                  <Text style={styles.brandLogoInitials} numberOfLines={1}>
                    {getBrandInitials(brand.name)}
                  </Text>
                )}
              </View>
            ))}
            {product.brands.length > 3 ? (
              <Text style={styles.brandLogoOverflowText}>+{product.brands.length - 3}</Text>
            ) : null}
          </View>
        ) : (
          <Text style={styles.mutedText}>-</Text>
        )}
      </View>
      <Text style={styles.amountCell}>{formatCurrency(product.priceToSell)}</Text>
      <Text style={styles.stockCell}>{formatStock(product)}</Text>
      <View style={styles.syncCell}>{renderSyncCell(product)}</View>
      <View style={styles.infoCell}>{renderInfoBadges(product)}</View>
      <View style={styles.actionCell}>
        <KolamOverflowMenuButton
          actions={[
            { label: 'Lihat', onPress: onDetail },
            { label: 'Lihat lisensi / stok', onPress: onLicense },
            { label: 'Rubah', onPress: onEdit },
            { label: 'Sinkron ke Tokopedia', onPress: () => onSyncStock(['tokopedia']) },
            { label: 'Sinkron ke Shopee', onPress: () => onSyncStock(['shopee']) },
            { label: 'Sinkron ke Keduanya', onPress: () => onSyncStock(['tokopedia', 'shopee']) },
            {
              disabled: !getProductCode(product),
              label: product.type === 'raw' ? 'Salin Kode Produk' : 'Salin SKU',
              onPress: () => void copyTextToClipboard(getProductCode(product)),
            },
            { disabled: !getProductCode(product), label: 'Buat Barcode', onPress: onBarcode },
            { label: 'Duplikat Data', onPress: onDuplicate },
            { label: product.isPinned ? 'Lepas Pin' : 'Pin', onPress: onTogglePin },
            { label: 'Arsipkan', onPress: onArchive },
            { label: 'Hapus', onPress: onDelete, tone: 'danger' },
          ]}
        />
      </View>
    </KolamDataTableRowFrame>
  );
}

function KolamProductDetailView({
  controller,
  onArchive,
  onBack,
  onCancelEdit,
  onDelete,
  onEdit,
  onPrintBarcode,
  onRestore,
}: {
  controller: ReturnType<typeof useKolamProductController>;
  onArchive: (product: KolamProduct) => void;
  onBack: () => void;
  onCancelEdit: (product: KolamProduct) => void;
  onDelete: (product: KolamProduct) => void;
  onEdit: (product: KolamProduct) => void;
  onPrintBarcode: (product: KolamProduct) => void;
  onRestore: (product: KolamProduct) => void;
}) {
  const [activeTab, setActiveTab] = React.useState('overview');
  const product = React.useMemo(
    () =>
      controller.selectedProduct
        ? ensureProductDetailDefaults(controller.selectedProduct)
        : null,
    [controller.selectedProduct],
  );

  if (controller.mode === 'new') {
    return <ProductEditFormPage controller={controller} onCancel={onBack} />;
  }

  if (!product) {
    return (
      <ScrollView contentContainerStyle={styles.root}>
        <View style={styles.detailHeaderRow}>
          <View style={styles.headingCopy}>
            <Text style={styles.eyebrow}>PRODUK</Text>
            <Text style={styles.title}>Detail Produk</Text>
            <Text style={styles.description}>
              {controller.loading
                ? 'Membaca detail produk...'
                : 'Produk belum dipilih.'}
            </Text>
          </View>
          <KolamButton label="Daftar" onPress={onBack} />
        </View>
      </ScrollView>
    );
  }

  const mediaItems = React.useMemo(() => createProductMediaItems(product), [product]);
  const photos = React.useMemo(
    () => mediaItems.filter(item => item.type === 'image').map(item => item.uri),
    [mediaItems],
  );
  const statusIntent = product.stock <= 0 ? 'danger' : product.stock <= product.lowStockThreshold ? 'warning' : 'success';
  const productCode = getProductCode(product);

  if (controller.mode === 'edit') {
    return <ProductEditFormPage controller={controller} onCancel={() => onCancelEdit(product)} />;
  }

  const tabItems = [
    { id: 'overview', label: 'Ringkasan' },
    { id: 'pricing', label: 'Harga' },
    { id: 'specifications', label: 'Spesifikasi', count: getProductSpecificationTotal(product) },
    { id: 'logistics', label: 'Logistik' },
    { id: 'materials', label: 'Bahan Penyusun', count: product.components.length + product.packings.length },
    { id: 'more', label: 'Lainnya' },
    { id: 'assets', label: 'Aset', count: product.assets.length },
    { id: 'statistics', label: 'Statistik' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <View style={styles.detailHeaderRow}>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>PRODUK</Text>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.description}>
            Dibuat {formatDateTime(product.createdAt)} | Diperbarui {formatDateTime(product.updatedAt)}
          </Text>
        </View>
        <View style={styles.detailHeaderActions}>
          <KolamButton label="Daftar" onPress={onBack} />
          <KolamButton intent="primary" label="Rubah" onPress={() => onEdit(product)} />
          {controller.filters.archived ? (
            <KolamButton label="Pulihkan" onPress={() => onRestore(product)} />
          ) : (
            <KolamButton label="Arsipkan" onPress={() => onArchive(product)} />
          )}
          <KolamButton intent="danger" label="Hapus" onPress={() => onDelete(product)} />
        </View>
      </View>

      <KolamControlTabList
        accessibilityLabel="Tab detail produk"
        items={tabItems}
        onSelect={setActiveTab}
        selectedId={activeTab}
      />

      {activeTab === 'overview' ? (
        <ProductSummaryTab
          mediaItems={mediaItems}
          onPrintBarcode={() => onPrintBarcode(product)}
          product={product}
        />
      ) : (
        <View style={styles.detailMain}>
          {activeTab === 'pricing' ? <ProductPricingTab product={product} /> : null}
          {activeTab === 'specifications' ? <ProductVariantsTab product={product} /> : null}
          {activeTab === 'logistics' ? <ProductLogisticsTab product={product} /> : null}
          {activeTab === 'materials' ? <ProductMaterialsTab product={product} /> : null}
          {activeTab === 'more' ? <ProductMoreTab product={product} /> : null}
          {activeTab === 'assets' ? <ProductAssetsTab product={product} /> : null}
          {activeTab === 'statistics' ? <ProductStatisticsTab product={product} /> : null}
        </View>
      )}
    </ScrollView>
  );
}

function ProductEditFormPage({
  controller,
  onCancel,
}: {
  controller: ReturnType<typeof useKolamProductController>;
  onCancel: () => void;
}) {
  const form = controller.form;

  if (!form) {
    return (
      <ScrollView contentContainerStyle={styles.root}>
        <View style={styles.detailHeaderRow}>
          <View style={styles.headingCopy}>
            <Text style={styles.eyebrow}>PRODUK</Text>
            <Text style={styles.title}>Edit Produk</Text>
            <Text style={styles.description}>
              {controller.loading ? 'Membaca detail produk...' : 'Form produk belum siap.'}
            </Text>
          </View>
          <KolamButton label="Batal" onPress={onCancel} />
        </View>
      </ScrollView>
    );
  }

  const categoryOptions = controller.categories.filter(category => !form.categoryIds.includes(category.id));
  const selectedCategories = controller.categories.filter(category => form.categoryIds.includes(category.id));
  const brandOptions = controller.brands.filter(brand => !form.brandIds.includes(brand.id));
  const selectedBrands = controller.brands.filter(brand => form.brandIds.includes(brand.id));
  const tagOptions = controller.tags.filter(tag => !form.tagIds.includes(tag.id));
  const selectedTags = controller.tags.filter(tag => form.tagIds.includes(tag.id));
  const disabled = controller.saving;
  const formTitle = controller.mode === 'new' ? 'Produk Baru' : 'Edit Produk';
  const saveLabel = controller.mode === 'new' ? 'Simpan Produk' : 'Simpan Perubahan';
  const hasVariants = form.hasVariants || form.variants.length > 0;

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <View style={styles.detailHeaderRow}>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>PRODUK</Text>
          <Text style={styles.title}>{formTitle}</Text>
        </View>
        <View style={styles.detailHeaderActions}>
          <KolamButton disabled={disabled} label="Batal" onPress={onCancel} />
          <KolamButton
            disabled={disabled}
            intent="primary"
            label={disabled ? 'Menyimpan...' : saveLabel}
            onPress={() => {
              void controller.onSave();
            }}
          />
        </View>
      </View>

      {controller.error ? <Text style={styles.error}>{controller.error}</Text> : null}

      <KolamNativeFormSection section={{ description: '', id: 'catalog-translations', title: formTitle }}>
        <View style={settingsWebFormStyles.settingsWebFormFields}>
          <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
            <ProductEditSection
              description="Kode identitas internal. Nama dan deskripsi diatur per bahasa di tab Konten Marketplace."
              title="Identitas produk"
            >
              <View style={styles.twoColumnGrid}>
                <ProductFieldShell label={form.productType === 'raw' ? 'Kode Produk' : 'SKU'} required>
                  <KolamFormTextField
                    editable={!disabled}
                    onChangeText={value =>
                      controller.onChangeForm(form.productType === 'raw' ? { productCode: value } : { sku: value })
                    }
                    placeholder={form.productType === 'raw' ? 'Kode produk' : 'SKU'}
                    style={settingsWebFormStyles.settingsWebFormFieldValue}
                    value={form.productType === 'raw' ? form.productCode : form.sku}
                  />
                </ProductFieldShell>
                <ProductFieldShell label="Tipe Produk">
                  <KolamDropdownSelect
                    label="Tipe Produk"
                    onChange={productType =>
                      controller.onChangeForm({ productType: productType as KolamProductFormState['productType'] })
                    }
                    options={[
                      { label: 'Produk', value: 'product' },
                      { label: 'Bahan Baku', value: 'raw' },
                    ]}
                    showLabelInTrigger={false}
                    value={form.productType}
                  />
                </ProductFieldShell>
              </View>
            </ProductEditSection>

            <ProductEditSection
              description="Terjemahan katalog untuk webstore dan marketplace."
              title="Konten marketplace"
            >
              <KolamCatalogTranslationsEditor
                editable={!disabled}
                kind="product"
                onChange={translations => controller.onChangeForm({ translations })}
                primaryProductLocale={{
                  name: form.name,
                  shortDescription: form.shortDescription,
                  description: form.description,
                  onChange: patch => controller.onChangeForm(patch),
                }}
                translations={form.translations}
              />
            </ProductEditSection>

            <ProductEditSection
              description="Pilih satu atau lebih kategori yang relevan."
              title="Kategori Produk"
            >
              <ProductMultiSelectField
                disabled={disabled}
                emptyText="Belum ada kategori dipilih."
                label="Kategori"
                onAdd={categoryId => controller.onChangeForm({ categoryIds: [...form.categoryIds, categoryId] })}
                onRemove={categoryId => controller.onChangeForm({ categoryIds: form.categoryIds.filter(id => id !== categoryId) })}
                options={categoryOptions.map(category => ({ id: category.id, label: `${'  '.repeat(category.level)}${category.name}` }))}
                selected={selectedCategories.map(category => ({ id: category.id, label: category.name, tone: 'category' as const }))}
                triggerLabel="Tambah kategori"
              />
            </ProductEditSection>

            <ProductEditSection
              description="Hubungkan produk dengan satu atau lebih brand."
              title="Brand"
            >
              <ProductMultiSelectField
                disabled={disabled}
                emptyText="Belum ada merek dipilih."
                label="Merek"
                onAdd={brandId => controller.onChangeForm({ brandIds: [...form.brandIds, brandId] })}
                onRemove={brandId => controller.onChangeForm({ brandIds: form.brandIds.filter(id => id !== brandId) })}
                options={brandOptions.map(brand => ({ id: brand.id, label: brand.name }))}
                selected={selectedBrands.map(brand => ({ id: brand.id, label: brand.name }))}
                triggerLabel="Tambah merek"
              />
            </ProductEditSection>

            <ProductEditSection
              description="Satuan pengukuran dan penghitungan stok produk."
              title="Satuan"
            >
              <ProductFieldShell label="Satuan" required>
                <KolamDropdownSelect
                  label="Satuan"
                  menuStyle={styles.longDropdownMenu}
                  onChange={unitId => controller.onChangeForm({ unitId })}
                  options={[
                    { label: 'Pilih satuan', value: '' },
                    ...controller.units.map(unit => ({ label: unit.initial ? `${unit.name} (${unit.initial})` : unit.name, value: unit.id })),
                  ]}
                  searchable
                  searchPlaceholder="Cari satuan..."
                  showLabelInTrigger={false}
                  value={form.unitId}
                />
              </ProductFieldShell>
            </ProductEditSection>

            <ProductEditSection
              description="Pilih profil spesifikasi atau field manual untuk produk ini."
              title="Field Kustom"
            >
              <ProductCustomFieldEditorPanel controller={controller} />
            </ProductEditSection>

            <ProductEditSection
              description="Aktifkan varian jika produk memiliki beberapa variasi atau beberapa SKU."
              title="Varian"
            >
              <ProductVariantEditorPanel controller={controller} />
            </ProductEditSection>

            {!hasVariants ? (
              <ProductEditSection
                description="Harga jual dan aturan pesanan untuk produk tanpa varian."
                title="Harga"
              >
                <ProductRootPricingPanel controller={controller} />
              </ProductEditSection>
            ) : null}

            <ProductEditSection
              description={form.sellable && !hasVariants ? 'Poin anggota dan komisi transaksi produk.' : 'Komisi transaksi produk.'}
              title={form.sellable && !hasVariants ? 'Komisi dan Poin Anggota' : 'Komisi'}
            >
              <KolamCommercialPolicyEditor
                disabled={disabled}
                memberPointsDisabled={!form.sellable || hasVariants}
                memberPointsHint={
                  hasVariants
                    ? 'Produk ini memakai varian. Poin anggota diatur di tiap varian.'
                    : form.sellable
                    ? 'Poin yang didapat pelanggan per unit produk.'
                    : 'Aktifkan penjualan untuk mengatur poin anggota.'
                }
                onChange={value =>
                  controller.onChangeForm({
                    commissionEnabled: value.commissionEnabled,
                    commissionType: value.commissionType,
                    commissionValue: value.commissionValue,
                    memberPointsEnabled: value.memberPointsEnabled,
                    memberPoints: value.memberPoints,
                  })
                }
                value={{
                  commissionEnabled: form.commissionEnabled,
                  commissionType: form.commissionType,
                  commissionValue: form.commissionValue,
                  memberPointsEnabled: form.memberPointsEnabled,
                  memberPoints: form.memberPoints,
                }}
              />
            </ProductEditSection>

            <ProductEditSection
              description="Tag untuk filter internal, pengelompokan, dan SEO."
              title="Tag"
            >
              <ProductMultiSelectField
                disabled={disabled}
                emptyText="Belum ada tag dipilih."
                label="Tag"
                onAdd={tagId => controller.onChangeForm({ tagIds: [...form.tagIds, tagId] })}
                onRemove={tagId => controller.onChangeForm({ tagIds: form.tagIds.filter(id => id !== tagId) })}
                options={tagOptions.map(tag => ({ id: tag.id, label: tag.name }))}
                selected={selectedTags.map(tag => ({ id: tag.id, label: tag.name }))}
                triggerLabel="Tambah tag"
              />
            </ProductEditSection>

            <ProductEditSection description="Link marketplace atau dokumentasi produk." title="Tautan Eksternal">
              <ProductExternalLinksRowsEditor
                disabled={disabled}
                links={form.externalLinks}
                onChange={externalLinks => controller.onChangeForm({ externalLinks })}
              />
            </ProductEditSection>

            <ProductEditSection
              description="Judul, kata kunci, dan deskripsi SEO Google."
              title="SEO Google"
            >
              <ProductSeoEditPanel controller={controller} />
            </ProductEditSection>

            <ProductEditSection
              description="Hubungkan produk kompatibel atau pengganti."
              title="Produk kompatibel"
            >
              <ProductAttachedItemsEditPanel controller={controller} />
            </ProductEditSection>

            <ProductEditSection
              description="Template S&K yang berlaku untuk produk ini."
              title="Syarat dan Ketentuan"
            >
              <ProductTermsTemplatesSummaryPanel controller={controller} />
            </ProductEditSection>
          </View>
          <View style={styles.formActions}>
            <KolamButton disabled={disabled} label="Batal" onPress={onCancel} />
            <KolamButton
              disabled={disabled}
              intent="primary"
              label={disabled ? 'Menyimpan...' : saveLabel}
              onPress={() => {
                void controller.onSave();
              }}
            />
          </View>
        </View>
      </KolamNativeFormSection>
    </ScrollView>
  );
}

function ProductRootPricingPanel({
  controller,
}: {
  controller: ReturnType<typeof useKolamProductController>;
}) {
  const form = controller.form;
  const selectedUnit = controller.units.find(unit => unit.id === form?.unitId);
  const unitLabel = selectedUnit?.initial || selectedUnit?.name || '';

  if (!form) {
    return null;
  }

  return (
    <ProductFieldShell label="Harga Produk">
      <View style={styles.pricingPanelStack}>
        <ProductPricingFieldPanel
          description="Harga yang dipakai katalog, POS, toko daring, dan pembanding marketplace."
          title="Harga Penjualan"
        >
          <View style={styles.twoColumnGrid}>
            <ProductPriceInput
              disabled={controller.saving}
              hint="Harga utama yang tampil di katalog dan POS."
              label="Harga Jual"
              onChangeText={priceToSell => controller.onChangeForm({ priceToSell })}
              unitLabel={unitLabel}
              value={form.priceToSell}
            />
            <ProductPriceInput
              disabled={controller.saving}
              hint="Harga daring untuk toko daring atau kanal digital."
              label="Harga Daring"
              onChangeText={onlinePrice => controller.onChangeForm({ onlinePrice })}
              unitLabel={unitLabel}
              value={form.onlinePrice}
            />
            <ProductPriceInput
              disabled={controller.saving}
              hint="Harga pembanding pasar, bukan harga jual utama."
              label="Harga Pasar"
              onChangeText={marketPrice => controller.onChangeForm({ marketPrice })}
              unitLabel={unitLabel}
              value={form.marketPrice}
            />
            <ProductPriceInput
              disabled={controller.saving}
              hint="Batas harga terendah yang masih boleh dijual."
              label="Harga Minimum"
              onChangeText={minimumPriceToSales =>
                controller.onChangeForm({ minimumPriceToSales })
              }
              unitLabel={unitLabel}
              value={form.minimumPriceToSales}
            />
          </View>
        </ProductPricingFieldPanel>

        <ProductPricingFieldPanel
          description="Aturan jumlah minimum saat produk dibeli."
          title="Aturan Pesanan"
        >
          <View style={styles.twoColumnGrid}>
            <ProductPriceInput
              disabled={controller.saving}
              hint="Jumlah minimum per transaksi."
              label="Minimum Pesanan"
              onChangeText={minimumOrderQty => controller.onChangeForm({ minimumOrderQty })}
              value={form.minimumOrderQty}
            />
          </View>
        </ProductPricingFieldPanel>
      </View>
    </ProductFieldShell>
  );
}

function ProductPricingFieldPanel({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <View style={styles.variantFieldPanel}>
      <KolamCopyStack
        items={[
          { id: 'title', text: title, style: styles.variantFieldPanelTitle },
          ...(description ? [{ id: 'description', text: description, style: styles.fieldHint }] : []),
        ]}
      />
      <View style={styles.variantFieldPanelBody}>{children}</View>
    </View>
  );
}

function ProductPriceInput({
  disabled,
  hint,
  label,
  onChangeText,
  placeholder,
  unitLabel,
  value,
}: {
  disabled: boolean;
  hint?: string;
  label: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  unitLabel?: string;
  value: string;
}) {
  return (
    <View style={styles.priceInputBlock}>
      <KolamCopyStack
        items={[
          { id: 'label', text: label, style: styles.priceInputLabel },
          ...(hint ? [{ id: 'hint', text: hint, style: styles.priceInputHint }] : []),
        ]}
      />
      <View style={styles.priceInputRow}>
        <KolamFormTextField
          editable={!disabled}
          keyboardType="numeric"
          onChangeText={onChangeText}
          placeholder={placeholder ?? label}
          style={[settingsWebFormStyles.settingsWebFormFieldValue, styles.priceInputControl]}
          value={value}
        />
        {unitLabel ? (
          <View style={styles.priceUnitBadge}>
            <KolamCopyStack
              items={[{ id: 'unit', text: unitLabel, style: styles.priceUnitBadgeText }]}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function ProductVariantEditorPanel({
  controller,
}: {
  controller: ReturnType<typeof useKolamProductController>;
}) {
  const form = controller.form;
  const [expandedVariantId, setExpandedVariantId] = React.useState<string | null>(
    form?.variants[0]?.id ?? null,
  );

  React.useEffect(() => {
    if (!form?.variants.length) {
      setExpandedVariantId(null);
      return;
    }

    if (expandedVariantId && !form.variants.some(variant => variant.id === expandedVariantId)) {
      setExpandedVariantId(null);
    }
  }, [expandedVariantId, form?.variants]);

  if (!form) {
    return null;
  }

  const variantActive = form.hasVariants || form.variants.length > 0;

  return (
    <ProductFieldShell label="Varian Produk">
      <View style={styles.variantEditorPanel}>
        <View style={styles.variantToggleHeader}>
          <KolamCopyStack
            items={[
              {
                id: 'summary',
                text: variantActive
                  ? `${form.variants.length} varian disiapkan`
                  : 'Produk tanpa varian',
                style: styles.fieldHint,
              },
            ]}
          />
          <View style={styles.variantHeaderActions}>
            <KolamButton
              disabled={controller.saving}
              intent={variantActive ? 'primary' : 'outline'}
              label="Aktif"
              onPress={() =>
                controller.onChangeForm({
                  hasVariants: true,
                  variantsTouched: true,
                })
              }
            />
            <KolamButton
              disabled={controller.saving}
              intent={!variantActive ? 'primary' : 'outline'}
              label="Nonaktif"
              onPress={() =>
                controller.onChangeForm({
                  hasVariants: false,
                  selectedVariantId: '',
                  variants: [],
                  variantsTouched: true,
                })
              }
            />
          </View>
        </View>

        {variantActive ? (
          <>
            <ProductPricingFieldPanel
              description="Nama tier dipakai backend untuk menyusun konfigurasi varian."
              title="Konfigurasi Varian"
            >
              <View style={styles.twoColumnGrid}>
                <ProductCompactField label="Nama Tier 1">
                  <KolamFormTextField
                    editable={!controller.saving}
                    onChangeText={variantConfigTier1Name =>
                      controller.onChangeForm({
                        variantConfigTier1Name,
                        variantsTouched: true,
                      })
                    }
                    placeholder="Contoh: Ukuran"
                    style={settingsWebFormStyles.settingsWebFormFieldValue}
                    value={form.variantConfigTier1Name}
                  />
                </ProductCompactField>
                <ProductCompactField label="Nama Tier 2">
                  <KolamFormTextField
                    editable={!controller.saving}
                    onChangeText={variantConfigTier2Name =>
                      controller.onChangeForm({
                        variantConfigTier2Name,
                        variantsTouched: true,
                      })
                    }
                    placeholder="Contoh: Warna / tipe"
                    style={settingsWebFormStyles.settingsWebFormFieldValue}
                    value={form.variantConfigTier2Name}
                  />
                </ProductCompactField>
              </View>
            </ProductPricingFieldPanel>

            <View style={styles.variantEditorHeader}>
              <KolamCopyStack
                items={[
                  {
                    id: 'summary',
                    text: form.variants.length
                      ? `${form.variants.length} varian disiapkan`
                      : 'Belum ada varian',
                    style: styles.fieldHint,
                  },
                ]}
              />
              <KolamButton
                disabled={controller.saving}
                intent="primary"
                label="Tambah Varian"
                onPress={() => addProductVariantRow(controller)}
              />
            </View>

            {form.variants.map((variant, index) => (
              <ProductVariantFormCard
                controller={controller}
                expanded={expandedVariantId === variant.id}
                index={index}
                key={variant.id}
                onToggle={() =>
                  setExpandedVariantId(current =>
                    current === variant.id ? null : variant.id,
                  )
                }
                variant={variant}
              />
            ))}
          </>
        ) : null}
      </View>
    </ProductFieldShell>
  );
}

function ProductVariantFormCard({
  controller,
  expanded,
  index,
  onToggle,
  variant,
}: {
  controller: ReturnType<typeof useKolamProductController>;
  expanded: boolean;
  index: number;
  onToggle: () => void;
  variant: KolamProductVariantFormRow;
}) {
  const form = controller.form;
  const productType = form?.productType ?? 'product';
  const variantLabel =
    [variant.tier1Value, variant.tier2Value].filter(Boolean).join(' / ') ||
    `Varian ${index + 1}`;
  const codeLabel =
    productType === 'raw'
      ? variant.productCode.trim() || '-'
      : variant.sku.trim() || '-';
  const vendorCost = getCheapestProductVendorCost(variant.vendorPrices);
  const displayCost = vendorCost ?? parseNumberInput(variant.price);
  const priceValue = parseNumberInput(variant.priceToSell);
  const priceLabel = priceValue > 0 ? formatCurrency(priceValue) : 'Rp 0';
  const liveVariant = controller.selectedProduct?.variants.find(item => item.id === variant.id);
  const pendingMediaCount = controller.variantPhotoLocalUris[variant.id] ? 1 : 0;
  const mediaCount =
    (Array.isArray(liveVariant?.photoUris) ? liveVariant.photoUris.length : 0) +
    pendingMediaCount;
  const [activeTab, setActiveTab] = React.useState<ProductVariantEditTab>('pricing');
  const unitOptions = [
    { label: 'Pilih satuan', value: '' },
    ...controller.units.map(unit => ({
      label: unit.initial ? `${unit.name} (${unit.initial})` : unit.name,
      value: unit.id,
    })),
  ];
  const activeCustomFields = React.useMemo(
    () => getActiveProductCustomFields(controller.customFields),
    [controller.customFields],
  );

  return (
    <View style={styles.variantFormCard}>
      <View style={styles.variantRowHeader}>
        <KolamInteractionFrame
          accessibilityLabel={`${expanded ? 'Tutup' : 'Buka'} ${variantLabel}`}
          onPress={onToggle}
          style={styles.variantRowPressable}
        >
          <KolamCopyStack
            items={[
              {
                id: 'title',
                text: `${expanded ? 'v' : '>'} ${variantLabel}`,
                style: styles.variantTitle,
              },
            ]}
          />
          <View style={styles.variantHeaderMetaRow}>
            <KolamBadge intent="primary" label={codeLabel} style={styles.variantMetaBadge} />
            <KolamBadge intent="success" label={priceLabel} style={styles.variantMetaBadge} />
            <KolamBadge
              intent={variant.grocerPricingTiers.length ? 'success' : 'muted'}
              label={`Grosir ${variant.grocerPricingTiers.length}`}
              style={styles.variantMetaBadge}
            />
            <KolamBadge
              intent={variant.vendorPrices.length ? 'success' : 'muted'}
              label={`Pemasok ${variant.vendorPrices.length}`}
              style={styles.variantMetaBadge}
            />
            <KolamBadge
              intent={mediaCount ? 'success' : 'muted'}
              label={`Media ${mediaCount}`}
              style={styles.variantMetaBadge}
            />
          </View>
        </KolamInteractionFrame>
        <KolamButton
          disabled={controller.saving}
          intent="danger"
          label="Hapus"
          onPress={() => removeProductVariantRow(controller, variant.id)}
          style={styles.variantHeaderButton}
        />
      </View>

      {expanded ? (
        <>
          <View style={styles.variantTabRow}>
            <KolamButton
              intent={activeTab === 'pricing' ? 'primary' : 'outline'}
              label="Harga"
              onPress={() => setActiveTab('pricing')}
              style={styles.variantTabButton}
            />
            <KolamButton
              intent={activeTab === 'vendor' ? 'primary' : 'outline'}
              label="Pemasok"
              onPress={() => setActiveTab('vendor')}
              style={styles.variantTabButton}
            />
            <KolamButton
              intent={activeTab === 'specs' ? 'primary' : 'outline'}
              label="Spesifikasi"
              onPress={() => setActiveTab('specs')}
              style={styles.variantTabButton}
            />
            <KolamButton
              intent={activeTab === 'media' ? 'primary' : 'outline'}
              label="Media"
              onPress={() => setActiveTab('media')}
              style={styles.variantTabButton}
            />
          </View>

          {activeTab === 'pricing' ? (
            <View style={styles.variantTabContent}>
            <View style={styles.variantPricingGrid}>
              <ProductCompactField label={form?.variantConfigTier1Name || 'Tier 1'}>
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={tier1Value =>
                    updateProductVariantRow(controller, variant.id, { tier1Value })
                  }
                  placeholder="Nilai varian"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={variant.tier1Value}
                />
              </ProductCompactField>
              {form?.variantConfigTier2Name.trim() ? (
                <ProductCompactField label={form.variantConfigTier2Name}>
                  <KolamFormTextField
                    editable={!controller.saving}
                    onChangeText={tier2Value =>
                      updateProductVariantRow(controller, variant.id, { tier2Value })
                    }
                    placeholder="Nilai varian"
                    style={settingsWebFormStyles.settingsWebFormFieldValue}
                    value={variant.tier2Value}
                  />
                </ProductCompactField>
              ) : null}
              <ProductCompactField label={productType === 'raw' ? 'Kode Produk' : 'SKU'}>
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={value =>
                    updateProductVariantRow(
                      controller,
                      variant.id,
                      productType === 'raw' ? { productCode: value } : { sku: value },
                    )
                  }
                  placeholder={productType === 'raw' ? 'Kode produk' : 'SKU'}
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={productType === 'raw' ? variant.productCode : variant.sku}
                />
              </ProductCompactField>
              <ProductCompactField label="HPP Pemasok">
                <KolamFormTextField
                  editable={false}
                  placeholder="HPP"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={formatCurrency(displayCost)}
                />
              </ProductCompactField>
              <ProductCompactField label="Harga Jual">
                <KolamFormTextField
                  editable={!controller.saving}
                  keyboardType="numeric"
                  onChangeText={priceToSell =>
                    updateProductVariantRow(controller, variant.id, { priceToSell })
                  }
                  placeholder="Harga jual"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={variant.priceToSell}
                />
              </ProductCompactField>
              <ProductCompactField label="Harga Pasar">
                <KolamFormTextField
                  editable={!controller.saving}
                  keyboardType="numeric"
                  onChangeText={marketPrice =>
                    updateProductVariantRow(controller, variant.id, { marketPrice })
                  }
                  placeholder="Harga pasar"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={variant.marketPrice}
                />
              </ProductCompactField>
              <ProductCompactField label="Harga Daring">
                <KolamFormTextField
                  editable={!controller.saving}
                  keyboardType="numeric"
                  onChangeText={onlinePrice =>
                    updateProductVariantRow(controller, variant.id, { onlinePrice })
                  }
                  placeholder="Harga daring"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={variant.onlinePrice}
                />
              </ProductCompactField>
              <ProductCompactField label="Harga Minimum">
                <KolamFormTextField
                  editable={!controller.saving}
                  keyboardType="numeric"
                  onChangeText={minimumPriceToSales =>
                    updateProductVariantRow(controller, variant.id, {
                      minimumPriceToSales,
                    })
                  }
                  placeholder="Harga minimum"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={variant.minimumPriceToSales}
                />
              </ProductCompactField>
              <ProductCompactField label="Minimum Pesanan">
                <KolamFormTextField
                  editable={!controller.saving}
                  keyboardType="numeric"
                  onChangeText={minimumOrderQty =>
                    updateProductVariantRow(controller, variant.id, { minimumOrderQty })
                  }
                  placeholder="Minimum"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={variant.minimumOrderQty}
                />
              </ProductCompactField>
            </View>

            <ProductPricingFieldPanel
              description="Harga per unit berdasarkan jumlah pembelian untuk varian ini."
              title="Harga Bertingkat / Grosir Varian"
            >
              <KolamGrocerPricingTiersEditor
                disabled={controller.saving}
                onChange={grocerPricingTiers =>
                  updateProductVariantRow(controller, variant.id, {
                    grocerPricingTiers,
                  })
                }
                rows={variant.grocerPricingTiers}
              />
            </ProductPricingFieldPanel>
          </View>
          ) : null}

          {activeTab === 'vendor' ? (
            <View style={styles.variantTabContent}>
              <ProductVariantVendorPricesEditor
                controller={controller}
                variant={variant}
              />
            </View>
          ) : null}

          {activeTab === 'specs' ? (
            <View style={styles.variantTabContent}>
              <View style={styles.variantSpecsGrid}>
                <View style={styles.variantSpecsGroup}>
                  <KolamCopyStack
                    items={[{ id: 'label', text: 'Berat', style: styles.variantSpecsLabel }]}
                  />
                  <View style={styles.variantSpecsTwoGrid}>
                    <KolamFormTextField
                      editable={!controller.saving}
                      keyboardType="numeric"
                      onChangeText={weightValue =>
                        updateProductVariantRow(controller, variant.id, { weightValue })
                      }
                      placeholder="Nilai"
                      style={settingsWebFormStyles.settingsWebFormFieldValue}
                      value={variant.weightValue}
                    />
                    <KolamDropdownSelect
                      label="Satuan"
                      menuStyle={styles.longDropdownMenu}
                      onChange={weightUnitId =>
                        updateProductVariantRow(controller, variant.id, { weightUnitId })
                      }
                      options={unitOptions}
                      searchable
                      searchPlaceholder="Cari satuan..."
                      showLabelInTrigger={false}
                      value={variant.weightUnitId}
                    />
                  </View>
                </View>
                <View style={styles.variantSpecsGroup}>
                  <KolamCopyStack
                    items={[{ id: 'label', text: 'Dimensi (P x L x T)', style: styles.variantSpecsLabel }]}
                  />
                  <View style={styles.variantSpecsFourGrid}>
                    <KolamFormTextField
                      editable={!controller.saving}
                      keyboardType="numeric"
                      onChangeText={dimensionLength =>
                        updateProductVariantRow(controller, variant.id, { dimensionLength })
                      }
                      placeholder="P"
                      style={settingsWebFormStyles.settingsWebFormFieldValue}
                      value={variant.dimensionLength}
                    />
                    <KolamFormTextField
                      editable={!controller.saving}
                      keyboardType="numeric"
                      onChangeText={dimensionWidth =>
                        updateProductVariantRow(controller, variant.id, { dimensionWidth })
                      }
                      placeholder="L"
                      style={settingsWebFormStyles.settingsWebFormFieldValue}
                      value={variant.dimensionWidth}
                    />
                    <KolamFormTextField
                      editable={!controller.saving}
                      keyboardType="numeric"
                      onChangeText={dimensionHeight =>
                        updateProductVariantRow(controller, variant.id, { dimensionHeight })
                      }
                      placeholder="T"
                      style={settingsWebFormStyles.settingsWebFormFieldValue}
                      value={variant.dimensionHeight}
                    />
                    <KolamDropdownSelect
                      label="Satuan"
                      menuStyle={styles.longDropdownMenu}
                      onChange={dimensionUnitId =>
                        updateProductVariantRow(controller, variant.id, { dimensionUnitId })
                      }
                      options={unitOptions}
                      searchable
                      searchPlaceholder="Cari satuan..."
                      showLabelInTrigger={false}
                      value={variant.dimensionUnitId}
                    />
                  </View>
                </View>
              </View>
              <ProductPricingFieldPanel
                description="Field kustom varian disimpan pada data spesifikasi varian."
                title="Field Kustom Varian"
              >
                <ProductCustomFieldRowsEditor
                  disabled={controller.saving}
                  emptyText="Belum ada field kustom aktif untuk varian."
                  fields={activeCustomFields}
                  onChange={customFieldValues =>
                    updateProductVariantRow(controller, variant.id, { customFieldValues })
                  }
                  rows={variant.customFieldValues}
                  summaryText={
                    activeCustomFields.length
                      ? `${activeCustomFields.length} field aktif tersedia.`
                      : 'Belum ada field kustom aktif.'
                  }
                  units={controller.units}
                />
              </ProductPricingFieldPanel>
            </View>
          ) : null}

          {activeTab === 'media' ? (
            <View style={styles.variantTabContent}>
              <ProductVariantMediaPanel
                controller={controller}
                liveVariant={liveVariant}
                variant={variant}
              />
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

function ProductVariantMediaPanel({
  controller,
  liveVariant,
  variant,
}: {
  controller: ReturnType<typeof useKolamProductController>;
  liveVariant?: KolamProduct['variants'][number];
  variant: KolamProductVariantFormRow;
}) {
  const [deleteTarget, setDeleteTarget] = React.useState<{
    index: number;
    label: string;
  } | null>(null);
  const variantLabel =
    [variant.tier1Value, variant.tier2Value].filter(Boolean).join(' / ') ||
    'Varian';
  const photoUris = Array.isArray(liveVariant?.photoUris) ? liveVariant.photoUris : [];
  const pendingPhotoUri = controller.variantPhotoLocalUris[variant.id] ?? '';

  return (
    <View style={styles.variantMediaPanel}>
      <View style={styles.mediaPickerRow}>
        <KolamFormTextField
          editable={false}
          mode="url"
          placeholder="Pilih foto varian"
          style={[
            settingsWebFormStyles.settingsWebFormFieldValue,
            styles.mediaPickerInput,
          ]}
          value={pendingPhotoUri}
        />
        <KolamButton
          disabled={controller.saving}
          label="Tambah Foto Varian"
          onPress={() => {
            void controller.onPickVariantPhoto(variant.id);
          }}
        />
      </View>
      <KolamCopyStack
        items={[
          {
            id: 'media-note',
            text: pendingPhotoUri
              ? 'Foto varian akan dikirim ke backend saat Simpan.'
              : 'Foto varian mengikuti data backend/cache lokal.',
            style: styles.fieldHint,
          },
        ]}
      />
      {photoUris.length ? (
        <View style={styles.existingMediaGrid}>
          {photoUris.map((photoUri, index) => (
            <ProductVariantImageMediaCard
              accessibilityLabel={`${variantLabel} foto ${index + 1}`}
              disabled={controller.saving || !liveVariant?.id}
              key={`${liveVariant?.id ?? variant.id}-photo-${index}`}
              onDelete={() =>
                setDeleteTarget({
                  index,
                  label: `${variantLabel} foto ${index + 1}`,
                })
              }
              revision={`${liveVariant?.id ?? variant.id}-${photoUri}`}
              sourceUri={photoUri}
              deleteLabel={`Hapus Foto ${index + 1}`}
            />
          ))}
        </View>
      ) : (
        <KolamCopyStack
          items={[
            {
              id: 'empty-media',
              text: 'Belum ada foto varian dari backend/cache lokal.',
              style: styles.fieldHint,
            },
          ]}
        />
      )}
      <KolamDeleteConfirmDialog
        itemLabel={deleteTarget?.label}
        itemType="foto varian produk"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget || !liveVariant?.id) {
            return;
          }
          void controller
            .onDeleteVariantPhoto(liveVariant.id, deleteTarget.index)
            .then(ok => {
              if (ok) {
                setDeleteTarget(null);
              }
            });
        }}
        visible={!!deleteTarget}
      />
    </View>
  );
}

function ProductVariantImageMediaCard({
  accessibilityLabel,
  deleteLabel,
  disabled,
  onDelete,
  revision,
  sourceUri,
}: {
  accessibilityLabel: string;
  deleteLabel: string;
  disabled: boolean;
  onDelete: () => void;
  revision: string;
  sourceUri: string;
}) {
  return (
    <View style={styles.existingMediaItem}>
      <KolamRemoteImage
        accessibilityLabel={accessibilityLabel}
        resizeMode="cover"
        revision={revision}
        scope="product-variant"
        sourceUri={sourceUri}
        style={styles.existingMediaImage}
      />
      <KolamButton
        disabled={disabled}
        intent="danger"
        label={deleteLabel}
        onPress={onDelete}
        style={styles.mediaDeleteButton}
      />
    </View>
  );
}

function ProductVariantVendorPricesEditor({
  controller,
  variant,
}: {
  controller: ReturnType<typeof useKolamProductController>;
  variant: KolamProductVariantFormRow;
}) {
  const vendorOptions = [
    { label: 'Pilih pemasok', value: '' },
    ...controller.vendors.map(vendor => ({
      label: vendor.name,
      value: vendor.id,
    })),
  ];

  return (
    <View style={styles.vendorPricePanel}>
      <View style={styles.variantEditorHeader}>
        <KolamCopyStack
          items={[
            {
              id: 'title',
              text: 'Harga Vendor / HPP',
              style: styles.variantTitle,
            },
            {
              id: 'hint',
              text: 'Harga beli pemasok, ongkir dari PO, dan total HPP per varian.',
              style: styles.fieldHint,
            },
          ]}
        />
        <KolamButton
          disabled={controller.saving}
          intent="primary"
          label="Tambah Pemasok"
          onPress={() => addProductVariantVendorPriceRow(controller, variant.id)}
        />
      </View>
      {variant.vendorPrices.length ? (
        variant.vendorPrices.map((row, index) => (
          <ProductVariantVendorPriceRow
            controller={controller}
            index={index}
            key={row.id}
            row={row}
            variant={variant}
            vendorOptions={vendorOptions}
          />
        ))
      ) : (
        <KolamCopyStack
          items={[
            {
              id: 'empty',
              text: 'Belum ada harga pemasok untuk varian ini.',
              style: styles.fieldHint,
            },
          ]}
        />
      )}
    </View>
  );
}

function ProductVariantVendorPriceRow({
  controller,
  index,
  row,
  variant,
  vendorOptions,
}: {
  controller: ReturnType<typeof useKolamProductController>;
  index: number;
  row: KolamProductVendorPriceFormRow;
  variant: KolamProductVariantFormRow;
  vendorOptions: Array<{ label: string; value: string }>;
}) {
  const shippingCost = parseNumberInput(row.shippingCost);
  const totalCost = parseNumberInput(row.price) + shippingCost;

  return (
    <View style={styles.vendorPriceRow}>
      <View style={styles.variantEditorHeader}>
        <KolamCopyStack
          items={[
            {
              id: 'title',
              text: `Vendor ${index + 1}`,
              style: styles.rowText,
            },
            {
              id: 'total',
              text: `Total HPP: ${formatCurrency(totalCost)}`,
              style: styles.fieldHint,
            },
          ]}
        />
        <KolamButton
          disabled={controller.saving}
          intent="danger"
          label="Hapus Pemasok"
          onPress={() =>
            removeProductVariantVendorPriceRow(controller, variant.id, row.id)
          }
        />
      </View>
      <View style={styles.twoColumnGrid}>
        <KolamDropdownSelect
          label="Vendor"
          menuStyle={styles.longDropdownMenu}
          onChange={vendorId =>
            updateProductVariantVendorPriceRow(controller, variant.id, row.id, {
              vendorId,
            })
          }
          options={vendorOptions}
          searchable
          searchPlaceholder="Cari pemasok..."
          showLabelInTrigger={false}
          value={row.vendorId}
        />
        <KolamFormTextField
          editable={!controller.saving}
          mode="url"
          onChangeText={link =>
            updateProductVariantVendorPriceRow(controller, variant.id, row.id, {
              link,
            })
          }
          placeholder="Link produk vendor"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={row.link}
        />
      </View>
      <View style={styles.threeColumnGrid}>
        <KolamFormTextField
          editable={!controller.saving}
          keyboardType="numeric"
          onChangeText={price =>
            updateProductVariantVendorPriceRow(controller, variant.id, row.id, {
              price,
            })
          }
          placeholder="Harga beli pemasok"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={row.price}
        />
        <KolamFormTextField
          editable={false}
          placeholder="Ongkir / unit"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={formatCurrency(shippingCost)}
        />
        <KolamFormTextField
          editable={false}
          placeholder="Total HPP"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={formatCurrency(totalCost)}
        />
      </View>
      <KolamCopyStack
        items={[
          {
            id: 'shipping-note',
            text: 'Ongkir diisi dari PO completed dan disimpan ulang agar tidak hilang saat edit varian.',
            style: styles.fieldHint,
          },
        ]}
      />
    </View>
  );
}

function ProductCompactField({
  children,
  hint,
  label,
}: {
  children: React.ReactNode;
  hint?: string;
  label: string;
}) {
  return (
    <View style={styles.variantCompactField}>
      <KolamCopyStack
        items={[
          {
            id: 'label',
            text: label,
            style: settingsWebFormStyles.settingsWebFormFieldLabel,
          },
          ...(hint ? [{ id: 'hint', text: hint, style: styles.variantCompactHint }] : []),
        ]}
      />
      {children}
    </View>
  );
}

function addProductVariantRow(
  controller: ReturnType<typeof useKolamProductController>,
) {
  const form = controller.form;
  if (!form) {
    return;
  }

  controller.onChangeForm({
    hasVariants: true,
    variants: [...form.variants, createEmptyProductVariantFormRow()],
    variantsTouched: true,
  });
}

function updateProductVariantRow(
  controller: ReturnType<typeof useKolamProductController>,
  id: string,
  patch: Partial<KolamProductVariantFormRow>,
) {
  const form = controller.form;
  if (!form) {
    return;
  }

  controller.onChangeForm({
    hasVariants: true,
    variants: form.variants.map(variant =>
      variant.id === id ? { ...variant, ...patch } : variant,
    ),
    variantsTouched: true,
  });
}

function removeProductVariantRow(
  controller: ReturnType<typeof useKolamProductController>,
  id: string,
) {
  const form = controller.form;
  if (!form) {
    return;
  }

  const nextVariants = form.variants.filter(variant => variant.id !== id);
  controller.onChangeForm({
    hasVariants: nextVariants.length > 0,
    selectedVariantId: form.selectedVariantId === id ? '' : form.selectedVariantId,
    variants: nextVariants,
    variantsTouched: true,
  });
}

function addProductVariantVendorPriceRow(
  controller: ReturnType<typeof useKolamProductController>,
  variantId: string,
) {
  const variant = getProductVariantFormRow(controller, variantId);
  updateProductVariantRow(controller, variantId, {
    vendorPrices: [
      ...variant.vendorPrices,
      createEmptyKolamProductVendorPriceFormRow(),
    ],
  });
}

function updateProductVariantVendorPriceRow(
  controller: ReturnType<typeof useKolamProductController>,
  variantId: string,
  rowId: string,
  patch: Partial<KolamProductVendorPriceFormRow>,
) {
  const variant = getProductVariantFormRow(controller, variantId);
  updateProductVariantRow(controller, variantId, {
    vendorPrices: variant.vendorPrices.map(row =>
      row.id === rowId ? { ...row, ...patch } : row,
    ),
  });
}

function removeProductVariantVendorPriceRow(
  controller: ReturnType<typeof useKolamProductController>,
  variantId: string,
  rowId: string,
) {
  const variant = getProductVariantFormRow(controller, variantId);
  updateProductVariantRow(controller, variantId, {
    vendorPrices: variant.vendorPrices.filter(row => row.id !== rowId),
  });
}

function getProductVariantFormRow(
  controller: ReturnType<typeof useKolamProductController>,
  variantId: string,
) {
  return (
    controller.form?.variants.find(variant => variant.id === variantId) ??
    createEmptyProductVariantFormRow()
  );
}

function createEmptyProductVariantFormRow(): KolamProductVariantFormRow {
  return {
    id: `variant-draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tier1Value: '',
    tier2Value: '',
    sku: '',
    productCode: '',
    price: '0',
    priceToSell: '0',
    marketPrice: '0',
    onlinePrice: '0',
    minimumPriceToSales: '0',
    minimumOrderQty: '1',
    lowStockThreshold: '0',
    vendorPrices: [],
    componentOverrides: [],
    externalLinks: [],
    grocerPricingTiers: [],
    customFieldValues: [],
    weightValue: '',
    weightUnitId: '',
    dimensionLength: '',
    dimensionWidth: '',
    dimensionHeight: '',
    dimensionUnitId: '',
    memberPointsEnabled: false,
    memberPoints: '0',
    raw: null,
  };
}

function getCheapestProductVendorCost(rows: KolamProductVariantFormRow['vendorPrices']) {
  const costs = rows
    .map(row => parseNumberInput(row.price) + parseNumberInput(row.shippingCost))
    .filter(cost => cost > 0);
  return costs.length ? Math.min(...costs) : null;
}

function ProductCopyableCodeChip({ code, label }: { code: string; label: string }) {
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
        <Text style={styles.titleCodeText}>{label}: {safeCode}</Text>
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

function ProductEditSection({ children, description, title }: { children: React.ReactNode; description?: string; title: string }) {
  return (
    <KolamContentFrame style={styles.productEditSection} variant="settingsWebConfig">
      <KolamCopyStack
        containerStyle={styles.productEditSectionHeader}
        items={[
          { id: 'title', text: title, style: styles.productEditSectionTitle },
          ...(description ? [{ id: 'description', text: description, style: styles.productEditSectionDescription }] : []),
        ]}
      />
      <View style={styles.productEditSectionBody}>{children}</View>
    </KolamContentFrame>
  );
}

function ProductFieldShell({ children, label, required = false }: { children: React.ReactNode; label: string; required?: boolean }) {
  return (
    <View style={settingsWebFormStyles.settingsWebFormField}>
      <KolamSettingsWebFieldLabel label={label} required={required} />
      {children}
    </View>
  );
}

function ProductMultiSelectField({
  disabled,
  emptyText,
  label,
  onAdd,
  onRemove,
  options,
  selected,
  triggerLabel,
}: {
  disabled: boolean;
  emptyText: string;
  label: string;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  options: Array<{ id: string; label: string }>;
  selected: Array<{ id: string; label: string; tone?: 'category' }>;
  triggerLabel: string;
}) {
  return (
    <ProductFieldShell label={label}>
      <View style={styles.categoryPickerStack}>
        <KolamDropdownSelect
          label={triggerLabel}
          menuStyle={styles.longDropdownMenu}
          onChange={value => {
            if (value) onAdd(value);
          }}
          options={[{ label: triggerLabel, value: '' }, ...options.map(option => ({ label: option.label, value: option.id }))]}
          searchable
          searchPlaceholder={`Cari ${label.toLowerCase()}...`}
          showLabelInTrigger={false}
          value=""
        />
        <View style={styles.selectedCategoryRow}>
          {selected.length ? (
            selected.map(item =>
              item.tone === 'category' ? (
                <KolamCategoryLabel key={item.id} label={`${item.label} x`} onPress={() => onRemove(item.id)} />
              ) : (
                <KolamButton intent="outline" key={item.id} label={`${item.label} x`} onPress={() => onRemove(item.id)} style={styles.selectedCategoryButton} />
              ),
            )
          ) : (
            <KolamCopyStack items={[{ id: `empty-${label}`, text: emptyText, style: styles.fieldHint }]} />
          )}
        </View>
      </View>
    </ProductFieldShell>
  );
}

function ProductExternalLinksRowsEditor({ disabled, links, onChange }: { disabled: boolean; links: KolamProductExternalLinkFormRow[]; onChange: (links: KolamProductExternalLinkFormRow[]) => void }) {
  const updateRow = (index: number, patch: Partial<KolamProductExternalLinkFormRow>) => {
    onChange(links.map((link, linkIndex) => (linkIndex === index ? { ...link, ...patch } : link)));
  };

  return (
    <View style={styles.externalLinksStack}>
      {links.length ? (
        links.map((link, index) => (
          <View key={`${index}-${link.name}`} style={styles.externalLinkRow}>
            <KolamDropdownSelect<KolamProductLinkName | ''>
              label="Tipe tautan"
              onChange={name => updateRow(index, { name })}
              options={PRODUCT_EXTERNAL_LINK_OPTIONS}
              showLabelInTrigger={false}
              value={link.name}
            />
            <KolamFormTextField
              editable={!disabled}
              mode="url"
              onChangeText={value => updateRow(index, { value })}
              placeholder="https://contoh.com"
              style={[settingsWebFormStyles.settingsWebFormFieldValue, styles.externalLinkInput]}
              value={link.value}
            />
            <KolamButton disabled={disabled} intent="danger" label="Hapus" onPress={() => onChange(links.filter((_, linkIndex) => linkIndex !== index))} style={styles.externalLinkRemoveButton} />
          </View>
        ))
      ) : (
        <KolamCopyStack items={[{ id: 'empty-links', text: 'Belum ada tautan eksternal.', style: styles.fieldHint }]} />
      )}
      <KolamButton disabled={disabled} intent="secondary" label="Tambah tautan" onPress={() => onChange([...links, { name: '', value: '' }])} style={styles.externalLinkAddButton} />
    </View>
  );
}

function ProductCustomFieldEditorPanel({
  controller,
}: {
  controller: ReturnType<typeof useKolamProductController>;
}) {
  const fields = React.useMemo(
    () => getActiveProductCustomFields(controller.customFields),
    [controller.customFields],
  );
  const form = controller.form;

  return (
    <ProductFieldShell label="Field Kustom">
      <ProductCustomFieldRowsEditor
        disabled={controller.saving}
        emptyText="Belum ada definisi field kustom aktif dari modul Field Kustom."
        fields={fields}
        rows={form?.customFieldValues ?? []}
        summaryText={
          fields.length
            ? `${fields.length} field aktif tersedia untuk produk ini.`
            : 'Belum ada definisi field kustom aktif dari modul Field Kustom.'
        }
        units={controller.units}
        onChange={customFieldValues =>
          controller.onChangeForm({ customFieldValues })
        }
      />
    </ProductFieldShell>
  );
}

function getActiveProductCustomFields(fields: KolamCustomField[]) {
  return fields
    .filter(field => field.status === 'active')
    .slice()
    .sort((left, right) => left.order - right.order || left.fieldLabel.localeCompare(right.fieldLabel));
}

type ProductCustomFieldPatch = {
  value?: string;
  minValue?: string;
  maxValue?: string;
  unitId?: string;
};

function ProductCustomFieldRowsEditor({
  disabled,
  emptyText,
  fields,
  onChange,
  rows,
  summaryText,
  units,
}: {
  disabled: boolean;
  emptyText: string;
  fields: KolamCustomField[];
  onChange: (rows: unknown[]) => void;
  rows: unknown[];
  summaryText: string;
  units: KolamUnit[];
}) {
  const knownKeys = React.useMemo(
    () => new Set(fields.map(field => field.fieldKey).filter(Boolean)),
    [fields],
  );
  const initialSelectedKeys = React.useMemo(
    () => getProductSelectedCustomFieldKeys(rows, fields),
    [fields, rows],
  );
  const unknownRows = rows.filter(row => {
    const key = getProductCustomFieldRowKey(row, fields);
    return !key || !knownKeys.has(key);
  });
  const [enabled, setEnabled] = React.useState(initialSelectedKeys.length > 0);
  const [selectedKeys, setSelectedKeys] = React.useState(initialSelectedKeys);

  React.useEffect(() => {
    setSelectedKeys(initialSelectedKeys);
    setEnabled(initialSelectedKeys.length > 0);
  }, [initialSelectedKeys.join('|')]);

  const selectedKeySet = React.useMemo(
    () => new Set(selectedKeys),
    [selectedKeys],
  );
  const selectedFields = fields.filter(field => selectedKeySet.has(field.fieldKey));
  const setFieldSelected = (field: KolamCustomField, nextSelected: boolean) => {
    const nextKeys = nextSelected
      ? Array.from(new Set([...selectedKeys, field.fieldKey]))
      : selectedKeys.filter(key => key !== field.fieldKey);
    setSelectedKeys(nextKeys);

    if (!nextSelected) {
      onChange(rows.filter(row => !productCustomFieldRowMatchesField(row, field)));
    }
  };
  const setUseCustomFields = (nextEnabled: boolean) => {
    setEnabled(nextEnabled);
    if (!nextEnabled) {
      setSelectedKeys([]);
      onChange([]);
    }
  };

  return (
    <View style={styles.variantPricingPanel}>
      <View style={styles.variantTabHeader}>
        <KolamCopyStack
          items={[
            {
              id: 'summary',
              text: summaryText || emptyText,
              style: styles.fieldHint,
            },
          ]}
        />
        <KolamButton
          disabled={disabled || fields.length === 0}
          intent={enabled ? 'primary' : 'secondary'}
          label={enabled ? 'Field Kustom Aktif' : 'Gunakan Field Kustom'}
          onPress={() => setUseCustomFields(!enabled)}
        />
      </View>

      {enabled ? (
        <>
          <View style={styles.customFieldPickerPanel}>
            <KolamCopyStack
              items={[
                {
                  id: 'picker-title',
                  text: 'Pilih field yang digunakan',
                  style: styles.variantTitle,
                },
                {
                  id: 'picker-hint',
                  text: fields.length
                    ? 'Hanya field yang dipilih yang muncul dan dikirim ke backend.'
                    : emptyText,
                  style: styles.fieldHint,
                },
              ]}
            />
            <View style={styles.selectedCategoryRow}>
              {fields.map(field => {
                const selected = selectedKeySet.has(field.fieldKey);
                return (
                  <KolamButton
                    disabled={disabled}
                    intent={selected ? 'primary' : 'outline'}
                    key={field.id || field.fieldKey}
                    label={`${field.fieldLabel}${field.required ? ' *' : ''}`}
                    onPress={() => setFieldSelected(field, !selected)}
                    style={styles.selectedCategoryButton}
                  />
                );
              })}
            </View>
          </View>

          {selectedFields.length ? (
            selectedFields.map(field => (
              <ProductCustomFieldRowsEditorRow
                disabled={disabled}
                field={field}
                key={field.id || field.fieldKey}
                onChange={onChange}
                rows={rows}
                units={units}
              />
            ))
          ) : (
            <KolamCopyStack
              items={[
                {
                  id: 'empty-selected-fields',
                  text: 'Pilih minimal satu field kustom untuk mengisi nilai.',
                  style: styles.fieldHint,
                },
              ]}
            />
          )}
        </>
      ) : null}

      {enabled && unknownRows.length ? (
        <View style={styles.customFieldUnknownPanel}>
          <KolamCopyStack
            items={[
              {
                id: 'title',
                text: 'Field tersimpan tanpa definisi aktif',
                style: styles.variantTitle,
              },
              ...unknownRows.map((row, index) => ({
                id: getProductCustomFieldRowId(row) || `unknown-${index}`,
                text: `${getProductCustomFieldRowLabel(row, index)}: ${getProductCustomFieldRowValueLabel(row)}`,
                style: styles.fieldHint,
              })),
            ]}
          />
        </View>
      ) : null}
    </View>
  );
}

function ProductCustomFieldRowsEditorRow({
  disabled,
  field,
  onChange,
  rows,
  units,
}: {
  disabled: boolean;
  field: KolamCustomField;
  onChange: (rows: unknown[]) => void;
  rows: unknown[];
  units: KolamUnit[];
}) {
  const row = findProductCustomFieldValueRow(rows, field);
  const raw = getProductCustomFieldValueRecord(row);
  const unitLabel = field.unitLabel || getProductCustomFieldRowUnitLabel(row) || '';
  const fieldTypeLabel = getCustomFieldTypeLabel(field.fieldType);

  return (
    <View style={styles.customFieldEditorRow}>
      <View style={styles.variantTabHeader}>
        <KolamCopyStack
          items={[
            {
              id: 'label',
              text: `${field.fieldLabel}${field.required ? ' *' : ''}`,
              style: styles.variantTitle,
            },
            {
              id: 'meta',
              text: [fieldTypeLabel, unitLabel ? `Satuan: ${unitLabel}` : '']
                .filter(Boolean)
                .join(' - '),
              style: styles.fieldHint,
            },
          ]}
        />
        <KolamButton
          disabled={disabled || !row}
          intent="secondary"
          label="Kosongkan"
          onPress={() => updateProductCustomFieldRows(rows, onChange, field, null)}
        />
      </View>
      {renderProductCustomFieldRowsInput(disabled, rows, onChange, field, raw, units)}
      {field.description ? (
        <KolamCopyStack
          items={[{ id: 'description', text: field.description, style: styles.fieldHint }]}
        />
      ) : null}
    </View>
  );
}

function renderProductCustomFieldRowsInput(
  disabled: boolean,
  rows: unknown[],
  onChange: (rows: unknown[]) => void,
  field: KolamCustomField,
  raw: Record<string, unknown>,
  units: KolamUnit[],
) {
  const update = (patch: ProductCustomFieldPatch) =>
    updateProductCustomFieldRows(rows, onChange, field, patch);
  const unitSelector = renderProductCustomFieldUnitSelector(disabled, rows, onChange, field, raw, units);

  if (field.fieldType === 'boolean') {
    return (
      <KolamDropdownSelect
        label={field.fieldLabel}
        onChange={value => update({ value })}
        options={[
          { label: 'Belum diisi', value: '' },
          { label: 'Ya', value: 'true' },
          { label: 'Tidak', value: 'false' },
        ]}
        value={getProductCustomFieldBooleanValue(raw)}
      />
    );
  }

  if (field.fieldType === 'select') {
    return (
      <KolamDropdownSelect
        label={field.fieldLabel}
        menuStyle={styles.longDropdownMenu}
        onChange={value => update({ value })}
        options={[
          { label: 'Belum diisi', value: '' },
          ...field.options.map(option => ({ label: option, value: option })),
        ]}
        searchable
        searchPlaceholder="Cari pilihan..."
        value={getProductCustomFieldStringValue(raw)}
      />
    );
  }

  if (field.fieldType === 'range') {
    return (
      <View style={styles.twoColumnGrid}>
        <KolamFormTextField
          editable={!disabled}
          keyboardType="numeric"
          onChangeText={minValue => update({ minValue })}
          placeholder="Nilai minimum"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={getProductCustomFieldNumberText(raw.minValue)}
        />
        <KolamFormTextField
          editable={!disabled}
          keyboardType="numeric"
          onChangeText={maxValue => update({ maxValue })}
          placeholder="Nilai maksimum"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={getProductCustomFieldNumberText(raw.maxValue)}
        />
        {unitSelector}
      </View>
    );
  }

  if (field.fieldType === 'number') {
    return (
      <View style={field.requiresUnit ? styles.twoColumnGrid : undefined}>
        <KolamFormTextField
          editable={!disabled}
          keyboardType="numeric"
          onChangeText={value => update({ value })}
          placeholder="Masukkan angka"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={getProductCustomFieldStringValue(raw)}
        />
        {unitSelector}
      </View>
    );
  }

  return (
    <KolamFormTextField
      editable={!disabled}
      multiline
      onChangeText={value => update({ value })}
      placeholder="Masukkan nilai"
      style={[settingsWebFormStyles.settingsWebFormFieldValue, styles.customFieldTextArea]}
      value={getProductCustomFieldStringValue(raw)}
    />
  );
}

function renderProductCustomFieldUnitSelector(
  disabled: boolean,
  rows: unknown[],
  onChange: (rows: unknown[]) => void,
  field: KolamCustomField,
  raw: Record<string, unknown>,
  units: KolamUnit[],
) {
  if (!field.requiresUnit || (field.fieldType !== 'number' && field.fieldType !== 'range')) {
    return null;
  }

  if (field.unitId && field.unitLabel) {
    return (
      <View style={styles.customFieldFixedUnitBox}>
        <KolamCopyStack
          items={[
            { id: 'label', text: 'Satuan tetap', style: styles.fieldHint },
            { id: 'value', text: field.unitLabel, style: styles.pricingMetricText },
          ]}
        />
      </View>
    );
  }

  return (
    <KolamDropdownSelect
      label="Satuan"
      menuStyle={styles.longDropdownMenu}
      onChange={unitId => updateProductCustomFieldRows(rows, onChange, field, { unitId })}
      options={[
        { label: 'Pilih satuan', value: '' },
        ...units.map(unit => ({
          label: unit.initial ? `${unit.name} (${unit.initial})` : unit.name,
          value: unit.id,
        })),
      ]}
      searchable
      searchPlaceholder="Cari satuan..."
      value={getProductCustomFieldUnitId(raw)}
    />
  );
}

function updateProductCustomFieldRows(
  rows: unknown[],
  onChange: (rows: unknown[]) => void,
  field: KolamCustomField,
  patch: ProductCustomFieldPatch | null,
) {
  const currentRow = findProductCustomFieldValueRow(rows, field);
  const currentRaw = getProductCustomFieldValueRecord(currentRow);
  const baseRaw: Record<string, unknown> = {
    field: field.id,
    fieldKey: field.fieldKey,
  };

  if (field.requiresUnit && field.unitId) {
    baseRaw.unit = field.unitId;
  }

  const nextRaw = patch
    ? createNextProductCustomFieldValueRaw(field, currentRaw, baseRaw, patch)
    : baseRaw;
  const nextRows = rows.filter(row => !productCustomFieldRowMatchesField(row, field));

  if (!patch || !shouldKeepProductCustomFieldValue(field, nextRaw)) {
    onChange(nextRows);
    return;
  }

  onChange([...nextRows, nextRaw]);
}

function getProductSelectedCustomFieldKeys(rows: unknown[], fields: KolamCustomField[]) {
  return Array.from(
    new Set(
      rows
        .map(row => getProductCustomFieldRowKey(row, fields))
        .filter(Boolean) as string[],
    ),
  );
}

function getProductCustomFieldRowKey(row: unknown, fields: KolamCustomField[]) {
  const raw = getProductCustomFieldValueRecord(row);
  const rawKey = getStringFromRecord(raw, 'fieldKey');
  if (rawKey) {
    return rawKey;
  }
  const fieldRecord = getPlainRecord(raw.field);
  const fieldId = getProductCustomFieldRowId(row);
  const rawFieldId = getStringFromRecord(fieldRecord, '_id') || getStringFromRecord(fieldRecord, 'id');
  return fields.find(field => field.id === fieldId || field.id === rawFieldId)?.fieldKey || '';
}

function createNextProductCustomFieldValueRaw(
  field: KolamCustomField,
  currentRaw: Record<string, unknown>,
  baseRaw: Record<string, unknown>,
  patch: ProductCustomFieldPatch,
) {
  const nextRaw: Record<string, unknown> = { ...currentRaw, ...baseRaw };

  if (patch.unitId !== undefined) {
    if (patch.unitId.trim()) {
      nextRaw.unit = patch.unitId.trim();
    } else {
      delete nextRaw.unit;
    }
  }

  if (field.fieldType === 'range') {
    const minValue = patch.minValue ?? getProductCustomFieldNumberText(currentRaw.minValue);
    const maxValue = patch.maxValue ?? getProductCustomFieldNumberText(currentRaw.maxValue);
    setOptionalNumberValue(nextRaw, 'minValue', minValue);
    setOptionalNumberValue(nextRaw, 'maxValue', maxValue);
    delete nextRaw.value;
    return nextRaw;
  }

  if (field.fieldType === 'boolean') {
    if (patch.value === 'true') {
      nextRaw.value = true;
    } else if (patch.value === 'false') {
      nextRaw.value = false;
    } else {
      delete nextRaw.value;
    }
    delete nextRaw.minValue;
    delete nextRaw.maxValue;
    return nextRaw;
  }

  if (field.fieldType === 'number') {
    setOptionalNumberValue(nextRaw, 'value', patch.value ?? '');
  } else {
    const value = (patch.value ?? '').trim();
    if (value) {
      nextRaw.value = value;
    } else {
      delete nextRaw.value;
    }
  }
  delete nextRaw.minValue;
  delete nextRaw.maxValue;
  return nextRaw;
}

function shouldKeepProductCustomFieldValue(
  field: KolamCustomField,
  raw: Record<string, unknown>,
) {
  if (field.fieldType === 'range') {
    return raw.minValue !== undefined || raw.maxValue !== undefined;
  }
  return raw.value !== undefined && raw.value !== null && raw.value !== '';
}

function findProductCustomFieldValueRow(rows: unknown[], field: KolamCustomField) {
  return rows.find(row => productCustomFieldRowMatchesField(row, field));
}

function productCustomFieldRowMatchesField(row: unknown, field: KolamCustomField) {
  const raw = getProductCustomFieldValueRecord(row);
  const fieldRecord = getPlainRecord(raw.field);
  const rawFieldId = getStringFromRecord(fieldRecord, '_id') || getStringFromRecord(fieldRecord, 'id');
  return (
    getProductCustomFieldRowId(row) === field.id ||
    getProductCustomFieldRowId(row) === field.fieldKey ||
    rawFieldId === field.id ||
    getStringFromRecord(raw, 'fieldKey') === field.fieldKey
  );
}

function getProductCustomFieldValueRecord(row?: unknown) {
  return getPlainRecord(row);
}

function getProductCustomFieldRowId(row: unknown) {
  const raw = getProductCustomFieldValueRecord(row);
  const fieldRecord = getPlainRecord(raw.field);
  return (
    getStringFromRecord(raw, 'fieldId') ||
    getStringFromRecord(fieldRecord, '_id') ||
    getStringFromRecord(fieldRecord, 'id') ||
    getStringFromRecord(raw, 'fieldKey')
  );
}

function getProductCustomFieldRowLabel(row: unknown, index: number) {
  const raw = getProductCustomFieldValueRecord(row);
  const fieldRecord = getPlainRecord(raw.field);
  return (
    getStringFromRecord(fieldRecord, 'fieldLabel') ||
    getStringFromRecord(raw, 'fieldLabel') ||
    getStringFromRecord(raw, 'fieldKey') ||
    `Field ${index + 1}`
  );
}

function getProductCustomFieldRowValueLabel(row: unknown) {
  const raw = getProductCustomFieldValueRecord(row);
  const valueLabel = getStringFromRecord(raw, 'valueLabel');
  if (valueLabel) {
    return valueLabel;
  }
  if (raw.minValue !== undefined || raw.maxValue !== undefined) {
    return [raw.minValue, raw.maxValue]
      .map(value => getProductCustomFieldNumberText(value))
      .filter(Boolean)
      .join(' - ') || '-';
  }
  if (raw.value === true) {
    return 'Ya';
  }
  if (raw.value === false) {
    return 'Tidak';
  }
  return getProductCustomFieldStringValue(raw) || '-';
}

function getProductCustomFieldRowUnitLabel(row: unknown) {
  const raw = getProductCustomFieldValueRecord(row);
  const unitRecord = getPlainRecord(raw.unit);
  return (
    getStringFromRecord(raw, 'unitLabel') ||
    getStringFromRecord(unitRecord, 'initial') ||
    getStringFromRecord(unitRecord, 'name')
  );
}

function getProductCustomFieldUnitId(raw: Record<string, unknown>) {
  const unitRecord = getPlainRecord(raw.unit);
  return (
    getStringFromRecord(raw, 'unit') ||
    getStringFromRecord(unitRecord, '_id') ||
    getStringFromRecord(unitRecord, 'id')
  );
}

function getPlainRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function getStringFromRecord(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function getProductCustomFieldStringValue(raw: Record<string, unknown>) {
  const value = raw.value;
  return value === undefined || value === null ? '' : String(value);
}

function getProductCustomFieldBooleanValue(raw: Record<string, unknown>) {
  if (raw.value === true) {
    return 'true';
  }
  if (raw.value === false) {
    return 'false';
  }
  return '';
}

function getProductCustomFieldNumberText(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  return '';
}

function setOptionalNumberValue(
  target: Record<string, unknown>,
  key: string,
  value: string,
) {
  const trimmed = value.trim();
  if (!trimmed) {
    delete target[key];
    return;
  }

  const parsed = Number(trimmed.replace(',', '.'));
  if (Number.isFinite(parsed)) {
    target[key] = parsed;
  }
}

function ProductSeoEditPanel({
  controller,
}: {
  controller: ReturnType<typeof useKolamProductController>;
}) {
  const score = controller.selectedProduct?.seo.lastSeoScore;
  const disabled = controller.saving;

  return (
    <ProductFieldShell label="SEO Google">
      <View style={styles.variantPricingPanel}>
        <View style={styles.variantTabHeader}>
          <KolamCopyStack
            items={[
              {
                id: 'summary',
                text: score ? `Skor SEO terakhir: ${score}/100` : 'Skor SEO belum tersedia.',
                style: styles.fieldHint,
              },
            ]}
          />
          {controller.selectedProduct?.seo.lastAuditedAt ? (
            <KolamBadge label="Sudah diaudit" />
          ) : null}
        </View>
        <View style={styles.twoColumnGrid}>
          <ProductFieldShell label="Judul SEO">
            <KolamFormTextField
              editable={!disabled}
              onChangeText={seoMetaTitle => controller.onChangeForm({ seoMetaTitle })}
              placeholder="Judul SEO"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={controller.form?.seoMetaTitle ?? ''}
            />
          </ProductFieldShell>
          <ProductFieldShell label="Kata Kunci">
            <KolamFormTextField
              editable={!disabled}
              onChangeText={seoKeywords => controller.onChangeForm({ seoKeywords })}
              placeholder="Kata kunci, pisahkan dengan koma"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={controller.form?.seoKeywords ?? ''}
            />
          </ProductFieldShell>
        </View>
        <ProductFieldShell label="Deskripsi SEO">
          <KolamFormTextField
            editable={!disabled}
            multiline
            onChangeText={seoMetaDescription => controller.onChangeForm({ seoMetaDescription })}
            placeholder="Deskripsi SEO"
            style={[settingsWebFormStyles.settingsWebFormFieldValue, styles.seoTextArea]}
            value={controller.form?.seoMetaDescription ?? ''}
          />
        </ProductFieldShell>
      </View>
    </ProductFieldShell>
  );
}

function ProductAttachedItemsEditPanel({
  controller,
}: {
  controller: ReturnType<typeof useKolamProductController>;
}) {
  const [showForm, setShowForm] = React.useState(false);
  const [itemType, setItemType] = React.useState<'product' | 'species'>('product');
  const [relationType, setRelationType] = React.useState('compatible_with');
  const [targetId, setTargetId] = React.useState('');
  const [note, setNote] = React.useState('');
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; label: string } | null>(null);
  const selectedProduct = controller.selectedProduct;
  const attachedItems = selectedProduct?.attachedItems ?? [];
  const targetOptions = getProductAttachedItemTargetOptions(controller, itemType);
  const relationOptions = [
    { label: 'Kompatibel', value: 'compatible_with' },
    { label: 'Pengganti', value: 'replacement' },
  ];

  const resetForm = () => {
    setTargetId('');
    setNote('');
    setShowForm(false);
  };

  const addItem = async () => {
    if (!targetId) {
      return;
    }

    const ok = await controller.onAddAttachedItem({
      itemType,
      type: relationType,
      ...(itemType === 'product' ? { product: targetId } : { species: targetId }),
      ...(note.trim() ? { note: note.trim() } : {}),
    });
    if (ok) {
      resetForm();
    }
  };

  return (
    <ProductFieldShell label="Produk Kompatibel">
      <View style={styles.variantPricingPanel}>
        <View style={styles.variantTabHeader}>
          <KolamCopyStack
            items={[
              {
                id: 'summary',
                text: attachedItems.length
                  ? `${attachedItems.length} item terhubung ke produk ini.`
                  : selectedProduct
                  ? 'Belum ada produk kompatibel atau pengganti.'
                  : 'Simpan produk terlebih dahulu sebelum menambahkan item terlampir.',
                style: styles.fieldHint,
              },
            ]}
          />
          <KolamButton
            disabled={controller.saving || !selectedProduct}
            intent="primary"
            label={showForm ? 'Tutup Form' : 'Tambah Item'}
            onPress={() => setShowForm(current => !current)}
          />
        </View>
        {attachedItems.map(item => (
          <View key={item.id} style={styles.attachedItemRow}>
            <KolamCopyStack
              items={[
                { id: 'name', text: item.targetName, style: styles.variantTitle },
                {
                  id: 'meta',
                  text: [
                    item.typeLabel,
                    item.itemType === 'species' ? 'Spesies' : 'Produk',
                    item.targetSku ? `SKU: ${item.targetSku}` : '',
                    item.note,
                  ]
                    .filter(Boolean)
                    .join(' - '),
                  style: styles.fieldHint,
                },
              ]}
            />
            <KolamButton
              disabled={controller.saving}
              intent="danger"
              label="Hapus"
              onPress={() => setDeleteTarget({ id: item.id, label: item.targetName })}
            />
          </View>
        ))}
        {showForm ? (
          <View style={styles.attachedItemForm}>
            <View style={styles.twoColumnGrid}>
              <KolamDropdownSelect
                label="Tipe Hubungan"
                onChange={setRelationType}
                options={relationOptions}
                value={relationType}
              />
              <KolamDropdownSelect
                label="Jenis Item"
                onChange={value => {
                  setItemType(value as 'product' | 'species');
                  setTargetId('');
                }}
                options={[
                  { label: 'Produk', value: 'product' },
                  { label: 'Spesies', value: 'species' },
                ]}
                value={itemType}
              />
            </View>
            <KolamDropdownSelect
              label={itemType === 'product' ? 'Pilih Produk' : 'Pilih Spesies'}
              menuStyle={styles.longDropdownMenu}
              onChange={setTargetId}
              options={[{ label: 'Belum dipilih', value: '' }, ...targetOptions]}
              searchable
              searchPlaceholder={itemType === 'product' ? 'Cari produk...' : 'Cari spesies...'}
              value={targetId}
            />
            <KolamFormTextField
              editable={!controller.saving}
              onChangeText={setNote}
              placeholder="Catatan"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={note}
            />
            <View style={styles.formActions}>
              <KolamButton intent="secondary" label="Batal" onPress={resetForm} />
              <KolamButton
                disabled={controller.saving || !targetId}
                intent="primary"
                label="Tambah"
                onPress={addItem}
              />
            </View>
          </View>
        ) : null}
      </View>
      <KolamDeleteConfirmDialog
        itemLabel={deleteTarget?.label}
        itemType="item terlampir"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            void controller.onRemoveAttachedItem(deleteTarget.id).then(() => setDeleteTarget(null));
          }
        }}
        visible={Boolean(deleteTarget)}
      />
    </ProductFieldShell>
  );
}

function ProductTermsTemplatesSummaryPanel({
  controller,
}: {
  controller: ReturnType<typeof useKolamProductController>;
}) {
  const product = controller.selectedProduct;
  if (!product) {
    return (
      <ProductFieldShell label="TOS Aktif">
        <KolamCopyStack
          items={[
            {
              id: 'empty-terms-create',
              text: 'Simpan produk terlebih dahulu untuk melihat template S&K aktif.',
              style: styles.fieldHint,
            },
          ]}
        />
      </ProductFieldShell>
    );
  }

  return (
    <KolamDetailTermsTemplatesPanel
      itemId={product.id}
      itemLabel="produk"
      itemType="product"
      summary={{
        label: 'Garansi',
        meta: [
          product.warranty.days ? `${product.warranty.days} hari` : '',
          product.warranty.vendorName,
          product.warranty.termsTitle,
        ]
          .filter(Boolean)
          .join(' | '),
        status: product.warranty.label,
        statusIntent: product.warranty.mode === 'none' ? 'muted' : 'success',
      }}
    />
  );
}

function getProductAttachedItemTargetOptions(
  controller: ReturnType<typeof useKolamProductController>,
  itemType: 'product' | 'species',
) {
  if (itemType === 'species') {
    return controller.species.map(item => ({
      label: [
        item.displayName || item.scientificName,
        item.sku ? `(${item.sku})` : '',
      ]
        .filter(Boolean)
        .join(' '),
      value: item.id,
    }));
  }

  const selectedId = controller.selectedProduct?.id;
  return controller.productOptions
    .filter(item => item.id !== selectedId)
    .map(item => ({
      label: [item.name, item.sku ? `(${item.sku})` : ''].filter(Boolean).join(' '),
      value: item.id,
    }));
}

function ProductSummaryTab({
  mediaItems,
  onPrintBarcode,
  product,
}: {
  mediaItems: ProductMediaItem[];
  onPrintBarcode: () => void;
  product: KolamProduct;
}) {
  const productCode = getProductCode(product);
  const statusIntent = product.stock <= 0 ? 'danger' : product.stock <= product.lowStockThreshold ? 'warning' : 'success';
  const sidebarLinks = createProductSidebarLinks(product);
  const localeItems = product.localeBlocks.map(block => ({
    badge: block.locale.toUpperCase(),
    fields: [
      { label: 'Nama produk', value: block.name || product.name },
      { label: 'Deskripsi singkat', value: block.shortDescription },
      { label: 'Deskripsi lengkap', value: block.description },
    ],
    title: block.localeLabel,
  }));

  return (
    <View style={styles.detailPanel}>
      <View style={styles.panelTitleRow}>
        <Text style={styles.detailPanelTitle}>Ringkasan</Text>
        <KolamBadge intent="outline" label={product.type === 'raw' ? 'Kode produk' : 'SKU'} />
      </View>

      <View style={styles.overviewGrid}>
        <View style={styles.overviewSidebar}>
          {mediaItems.length ? (
            <KolamDetailMediaPreview
              items={mediaItems.map(item => ({
                badgeLabel: item.badgeLabel,
                id: item.id,
                label: item.title,
                scope: item.type === 'image' ? 'product-detail' : 'product-video',
                type: item.type,
                uri: item.uri,
              } satisfies KolamDetailMediaItem))}
              title={product.name}
            />
          ) : (
            <View style={styles.detailHeroPlaceholder}>
              <Text style={styles.emptyText}>Belum ada foto</Text>
            </View>
          )}

          <KolamBarcodePanel
            name={product.name}
            onPrint={onPrintBarcode}
            priceLabel={formatCurrency(product.priceToSell)}
            sku={productCode || product.name}
          />

          <View style={styles.sidebarMiniGrid}>
            <ProductMiniTile label="Status">
              <KolamBadge intent={product.sellable ? 'success' : 'secondary'} label={product.sellable ? 'Dijual' : 'Tidak dijual'} />
            </ProductMiniTile>
            <ProductMiniTile label="Daftar Keinginan">
              <Text style={styles.miniMutedValue}>-</Text>
            </ProductMiniTile>
            <ProductMiniTile label="Merek">
              {product.brands.length ? (
                <View style={styles.miniBrandRow}>
                  {product.brands.slice(0, 3).map(brand => (
                    <View key={brand.id || brand.name} style={styles.miniBrandLogoFrame}>
                      {brand.logoUri ? (
                        <KolamRemoteImage
                          accessibilityLabel={`Logo ${brand.name}`}
                          resizeMode="contain"
                          revision={brand.logoUri}
                          scope="product-brand"
                          sourceUri={brand.logoUri}
                          style={styles.miniBrandLogoImage}
                        />
                      ) : (
                        <Text style={styles.miniBrandInitials} numberOfLines={1}>
                          {getBrandInitials(brand.name)}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.miniMutedValue}>-</Text>
              )}
            </ProductMiniTile>
            <ProductMiniTile label="Stok">
              <KolamBadge intent={statusIntent} label={product.stock <= 0 ? 'Habis' : String(product.stock)} />
            </ProductMiniTile>
            <ProductMiniTile label="(-)Stok">
              {product.lowStockThreshold > 0 && product.stock <= product.lowStockThreshold ? (
                <KolamBadge intent="warning" label="Rendah" />
              ) : (
                <Text style={styles.miniMutedValue}>{product.lowStockThreshold || '-'}</Text>
              )}
            </ProductMiniTile>
            <ProductMiniTile label="Satuan">
              <Text style={styles.miniValue}>{product.unitLabel || '-'}</Text>
            </ProductMiniTile>
          </View>

          <View style={styles.externalTileGrid}>
            {sidebarLinks.map(link => {
              const content = (
                <ProductMiniTile label={link.label}>
                  {link.url ? (
                    <View style={styles.externalTileMarketIcon}>
                      {link.logo ? (
                        <Image resizeMode="cover" source={link.logo} style={styles.externalTileLogo} />
                      ) : (
                        <Text style={styles.externalTileMark}>{link.mark}</Text>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.miniMutedValue}>-</Text>
                  )}
                </ProductMiniTile>
              );

              return link.url ? (
                <KolamInteractionFrame
                  accessibilityLabel={`Buka ${link.label}`}
                  key={link.id}
                  onPress={() => void Linking.openURL(normalizeProductUrl(link.url))}
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
              {product.categories.length ? (
                product.categories.map(category => (
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
              {product.tags.length ? (
                product.tags.map(tag => (
                  <View key={tag.id || tag.name} style={styles.sidebarChip}>
                    <View style={styles.sidebarChipContent}>
                      <Text numberOfLines={2} style={styles.sidebarChipText}>
                        {tag.name}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.metaValue}>-</Text>
              )}
            </View>
          </View>
          <ProductMetaBlock label="Lokasi" value={product.locationLabel || '-'} />

          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Sinkron Stok</Text>
            <KolamMarketplaceSyncPlatformList
              platforms={product.marketplaceSync.platforms}
            />
          </View>
        </View>

        <View style={styles.overviewContent}>
          {productCode ? (
            <ProductCopyableCodeChip
              code={productCode}
              label={product.type === 'raw' ? 'Kode' : 'SKU'}
            />
          ) : null}
          <View style={styles.localeTitleRow}>
            <Text style={styles.detailSectionTitle}>Konten per bahasa</Text>
          </View>
          <KolamDetailLocaleTabs
            emptyText="Belum ada konten produk."
            items={localeItems}
          />
        </View>
      </View>

      {product.labels.length ? (
        <View style={styles.labelRow}>
          {product.labels.map(label => (
            <KolamBadge key={label} intent="secondary" label={label} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ProductPricingTab({ product }: { product: KolamProduct }) {
  const [syncPriceDialogOpen, setSyncPriceDialogOpen] = React.useState(false);
  const [syncPricePlatforms, setSyncPricePlatforms] = React.useState<Array<'tokopedia' | 'shopee'>>(['tokopedia', 'shopee']);
  const openSyncPrice = React.useCallback((platforms: Array<'tokopedia' | 'shopee'>) => {
    setSyncPricePlatforms(platforms);
    setSyncPriceDialogOpen(true);
  }, []);
  const vendorPrices = React.useMemo(() => getProductVendorPrices(product), [product]);
  const rawComponents = React.useMemo(() => getProductRawComponents(product), [product]);
  const rawPackings = React.useMemo(() => getProductRawPackings(product), [product]);
  const hppBasis = React.useMemo(
    () =>
      getProductHppBasis({
        components: rawComponents,
        minimumOrderQty: product.minimumOrderQty || 1,
        packings: rawPackings,
        storedPrice: product.price,
        vendorPrices,
      }),
    [product.minimumOrderQty, product.price, rawComponents, rawPackings, vendorPrices],
  );
  const [pricingSupport, setPricingSupport] = React.useState<{
    analysis: KolamChannelPricingAnalysis | null;
    paymentMethods: KolamPricingPaymentMethod[];
    sources: KolamPricingSource[];
    taxEstimate: KolamTaxEstimate | null;
  }>({
    analysis: null,
    paymentMethods: [],
    sources: [],
    taxEstimate: null,
  });

  React.useEffect(() => {
    let active = true;
    Promise.all([
      fetchKolamActivePricingSources(),
      fetchKolamChannelPricingAnalysis({ entityId: product.id, entityType: 'product' }),
      fetchKolamPricingPaymentMethods(),
      fetchKolamTaxEstimate(),
    ])
      .then(([sources, analysis, paymentMethods, taxEstimate]) => {
        if (active) {
          setPricingSupport({ analysis, paymentMethods, sources, taxEstimate });
        }
      })
      .catch(() => {
        if (active) {
          setPricingSupport(current => ({ ...current, analysis: null, taxEstimate: null }));
        }
      });

    return () => {
      active = false;
    };
  }, [product.id]);

  if (product.hasVariants) {
    return (
      <ProductVariantPricingTab
        onOpenSyncPrice={openSyncPrice}
        pricingSupport={pricingSupport}
        product={product}
        rawPackings={rawPackings}
        syncPriceDialog={
          <KolamMarketplacePriceSyncDialog
            initialPlatforms={syncPricePlatforms}
            itemCount={Math.max(1, product.variants.length)}
            onOpenChange={setSyncPriceDialogOpen}
            productIds={[product.id]}
            source="products"
            syncKind="price"
            title={`Samakan Harga ${product.name} ke Marketplace`}
            visible={syncPriceDialogOpen}
          />
        }
      />
    );
  }

  return (
    <View style={styles.detailPanel}>
      <Text style={styles.detailPanelTitle}>Harga & Penjualan</Text>
      <KolamPricingMetricsGrid>
        <KolamPricingMetric label="Harga Produk">
          <Text style={styles.pricingMetricText}>{formatCurrency(product.priceToSell)}</Text>
          {product.unitLabel ? <Text style={styles.detailMutedText}>/ {product.unitLabel}</Text> : null}
        </KolamPricingMetric>
        <KolamPricingMetric label="Harga Tokopedia/Shopee" fullWidth>
          <Text style={styles.pricingMetricText}>{formatCurrency(product.onlinePrice)}</Text>
          <KolamPricingMarketplaceSyncFooter onOpenSyncPrice={openSyncPrice} platforms={product.marketplaceSync.pricePlatforms} />
        </KolamPricingMetric>
        <KolamPricingMetric label="Harga Pasar">
          <Text style={styles.pricingMetricText}>{formatCurrency(product.marketPrice)}</Text>
        </KolamPricingMetric>
        <KolamPricingMetric label="Harga jual minimum">
          <Text style={styles.pricingMetricText}>{formatCurrency(product.minimumPriceToSales)}</Text>
        </KolamPricingMetric>
        <KolamPricingMetric label="Min. pembelian">
          <Text style={styles.pricingMetricText}>{product.minimumOrderQty || '-'}</Text>
        </KolamPricingMetric>
        <ProductHppBasisMetric basis={hppBasis} />
        {pricingSupport.taxEstimate ? (
          <KolamPricingMetric label="Pajak">
            <View style={styles.inlineMetricRow}>
              <Text style={styles.pricingMetricDanger}>{formatNumber(pricingSupport.taxEstimate.ppnRate)}%</Text>
              <KolamBadge intent="secondary" label="PPN" />
            </View>
          </KolamPricingMetric>
        ) : null}
        <KolamPricingMetric label="Poin member">
          <Text style={styles.pricingMetricText}>
            {product.memberPoints.enabled ? `${product.memberPoints.points} pts` : 'Nonaktif'}
          </Text>
        </KolamPricingMetric>
        <KolamPricingMetric label="Komisi">
          <Text style={styles.pricingMetricDanger}>{product.commission.label}</Text>
        </KolamPricingMetric>
      </KolamPricingMetricsGrid>
      {pricingSupport.taxEstimate ? (
        <KolamInternalProfitCard
          commission={product.commission}
          components={rawComponents}
          cost={product.price}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
          minimumOrderQty={product.minimumOrderQty}
          minimumPriceToSales={product.minimumPriceToSales}
          packings={rawPackings}
          paymentMethods={pricingSupport.paymentMethods}
          priceToSell={product.priceToSell}
          taxEstimate={pricingSupport.taxEstimate}
          vendorPrices={vendorPrices}
        />
      ) : null}
      {product.grocerPricingTiers.length ? (
        <KolamGrocerPricingCard
          description="Harga bertingkat untuk pembelian dalam jumlah besar (POS & webstore)."
          formatCurrency={formatCurrency}
          tiers={product.grocerPricingTiers}
          title="Harga grosir"
        />
      ) : null}
      <KolamMarketplaceProfitAnalyzerCard
        analysis={pricingSupport.analysis}
        commission={product.commission}
        cost={product.price}
        formatCurrency={formatCurrency}
        formatNumber={formatNumber}
        minimumOrderQty={product.minimumOrderQty}
        onlinePrice={product.onlinePrice}
        platforms={product.marketplaceSync.pricePlatforms}
        priceToSell={product.priceToSell}
        sources={pricingSupport.sources}
        vendorPrices={vendorPrices}
      />
      {!product.hasVariants && hppBasis.kind === 'vendor' && vendorPrices.length ? (
        <KolamVendorPriceCard
          description="Referensi harga pokok dari supplier. Baris termurah ditandai Terbaik."
          formatCurrency={formatCurrency}
          prices={vendorPrices}
          title="Harga Vendor"
        />
      ) : null}
      <KolamMarketplacePriceSyncDialog
        initialPlatforms={syncPricePlatforms}
        itemCount={1}
        onOpenChange={setSyncPriceDialogOpen}
        productIds={[product.id]}
        source="products"
        syncKind="price"
        title={`Samakan Harga ${product.name} ke Marketplace`}
        visible={syncPriceDialogOpen}
      />
    </View>
  );
}

function ProductVariantPricingTab({
  onOpenSyncPrice,
  pricingSupport,
  product,
  rawPackings,
  syncPriceDialog,
}: {
  onOpenSyncPrice: (platforms: Array<'tokopedia' | 'shopee'>) => void;
  pricingSupport: {
    analysis: KolamChannelPricingAnalysis | null;
    paymentMethods: KolamPricingPaymentMethod[];
    sources: KolamPricingSource[];
    taxEstimate: KolamTaxEstimate | null;
  };
  product: KolamProduct;
  rawPackings: unknown;
  syncPriceDialog: React.ReactNode;
}) {
  const tabs = React.useMemo(
    () =>
      product.variants.map((variant, index) => ({
        id: variant.id || String(index),
        label: variant.label || [variant.tier1Value, variant.tier2Value].filter(Boolean).join(' / ') || `Varian ${index + 1}`,
        variant,
      })),
    [product.variants],
  );
  const [activeVariantId, setActiveVariantId] = React.useState(tabs[0]?.id ?? '0');
  const tabsKey = tabs.map(tab => tab.id).join('|');
  const [variantAnalyses, setVariantAnalyses] = React.useState<Record<string, KolamChannelPricingAnalysis | null>>({});
  const [variantAnalysisLoading, setVariantAnalysisLoading] = React.useState(false);

  React.useEffect(() => {
    if (!tabs.some(tab => tab.id === activeVariantId)) {
      setActiveVariantId(tabs[0]?.id ?? '0');
    }
  }, [activeVariantId, tabs, tabsKey]);

  const activeTab = tabs.find(tab => tab.id === activeVariantId) ?? tabs[0];

  React.useEffect(() => {
    if (!activeTab?.variant.id || Object.prototype.hasOwnProperty.call(variantAnalyses, activeTab.variant.id)) {
      return;
    }

    let active = true;
    setVariantAnalysisLoading(true);
    fetchKolamChannelPricingAnalysis({
      entityId: product.id,
      entityType: 'product',
      variantId: activeTab.variant.id,
    })
      .then(analysis => {
        if (active) {
          setVariantAnalyses(current => ({
            ...current,
            [activeTab.variant.id]: analysis,
          }));
        }
      })
      .catch(() => {
        if (active) {
          setVariantAnalyses(current => ({
            ...current,
            [activeTab.variant.id]: null,
          }));
        }
      })
      .finally(() => {
        if (active) {
          setVariantAnalysisLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [activeTab?.variant.id, product.id, variantAnalyses]);

  const variant = activeTab?.variant;
  const variantComponents = React.useMemo(
    () => (variant?.componentOverrides.length ? variant.componentOverrides : product.components),
    [product.components, variant],
  );
  const variantHppBasis = React.useMemo(
    () =>
      getProductHppBasis({
        components: variantComponents,
        minimumOrderQty: variant?.minimumOrderQty || 1,
        packings: rawPackings,
        storedPrice: variant?.price || 0,
        vendorPrices: variant?.vendorPrices ?? [],
      }),
    [rawPackings, variant, variantComponents],
  );
  const variantCommission = React.useMemo(
    () =>
      variant?.commissionEnabled
        ? {
            enabled: true,
            label: variant.commissionType === 'percentage' ? `${variant.commissionValue}%` : formatCurrency(variant.commissionValue),
            type: variant.commissionType,
            value: variant.commissionValue,
          }
        : product.commission,
    [product.commission, variant],
  );

  if (!activeTab || !variant) {
    return <EmptyDetailPanel title="Harga" message="Produk ini belum memiliki varian." />;
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
        {variantAnalysisLoading ? <Text style={styles.detailMutedText}>Memuat analisa varian...</Text> : null}
        <KolamPricingMetricsGrid compact>
          <KolamPricingMetric label={product.type === 'raw' ? 'Kode produk' : 'SKU'}>
            <Text selectable style={styles.variantSkuCode}>
              {product.type === 'raw' ? variant.productCode || variant.sku || '-' : variant.sku || variant.productCode || '-'}
            </Text>
          </KolamPricingMetric>
          <KolamPricingMetric label="Stok">
            <View style={styles.inlineMetricRow}>
              <KolamBadge
                intent={variant.stock <= 0 ? 'danger' : variant.stock <= variant.lowStockThreshold ? 'warning' : 'success'}
                label={variant.stock <= 0 ? '0' : formatNumber(variant.stock)}
              />
              {variant.lowStockThreshold ? <Text style={styles.detailMutedText}>Batas: {formatNumber(variant.lowStockThreshold)}</Text> : null}
            </View>
          </KolamPricingMetric>
          <KolamPricingMetric label="Harga Produk">
            <Text style={styles.pricingMetricText}>{formatCurrency(variant.priceToSell)}</Text>
            {product.unitLabel ? <Text style={styles.detailMutedText}>/ {product.unitLabel}</Text> : null}
          </KolamPricingMetric>
          <KolamPricingMetric label="Harga Tokopedia/Shopee" fullWidth>
            <Text style={styles.pricingMetricText}>{formatCurrency(variant.onlinePrice)}</Text>
            <KolamPricingMarketplaceSyncFooter onOpenSyncPrice={onOpenSyncPrice} platforms={product.marketplaceSync.pricePlatforms} />
          </KolamPricingMetric>
          <KolamPricingMetric label="Harga Pasar">
            <Text style={styles.pricingMetricText}>{formatCurrency(variant.marketPrice)}</Text>
          </KolamPricingMetric>
          <KolamPricingMetric label="Harga jual minimum">
            <Text style={styles.pricingMetricText}>{formatCurrency(variant.minimumPriceToSales)}</Text>
          </KolamPricingMetric>
          <KolamPricingMetric label="Min. pembelian">
            <Text style={styles.pricingMetricText}>{variant.minimumOrderQty || '-'}</Text>
          </KolamPricingMetric>
          <ProductHppBasisMetric basis={variantHppBasis} />
          {pricingSupport.taxEstimate ? (
            <KolamPricingMetric label="Pajak">
              <View style={styles.inlineMetricRow}>
                <Text style={styles.pricingMetricDanger}>{formatNumber(pricingSupport.taxEstimate.ppnRate)}%</Text>
                <KolamBadge intent="secondary" label="PPN" />
              </View>
            </KolamPricingMetric>
          ) : null}
          <KolamPricingMetric label="Poin member">
            <Text style={styles.pricingMetricText}>
              {variant.memberPoints.enabled ? `${variant.memberPoints.points} pts` : 'Nonaktif'}
            </Text>
          </KolamPricingMetric>
          <KolamPricingMetric label="Komisi">
            <Text style={styles.pricingMetricDanger}>{variantCommission.label}</Text>
          </KolamPricingMetric>
        </KolamPricingMetricsGrid>
        {pricingSupport.taxEstimate ? (
          <KolamInternalProfitCard
            commission={variantCommission}
            components={variantComponents}
            cost={variant.price}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
            minimumOrderQty={variant.minimumOrderQty || 1}
            minimumPriceToSales={variant.minimumPriceToSales}
            packings={rawPackings}
            paymentMethods={pricingSupport.paymentMethods}
            priceToSell={variant.priceToSell}
            taxEstimate={pricingSupport.taxEstimate}
            vendorPrices={variant.vendorPrices}
          />
        ) : null}
        {variant.grocerPricingTiers.length ? (
          <KolamGrocerPricingCard
            description="Harga bertingkat untuk pembelian dalam jumlah besar (POS & webstore)."
            formatCurrency={formatCurrency}
            tiers={variant.grocerPricingTiers}
            title="Harga grosir"
          />
        ) : null}
        <KolamMarketplaceProfitAnalyzerCard
          analysis={variantAnalyses[variant.id]}
          commission={variantCommission}
          cost={variant.price}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
          minimumOrderQty={variant.minimumOrderQty || 1}
          onlinePrice={variant.onlinePrice}
          platforms={product.marketplaceSync.pricePlatforms}
          priceToSell={variant.priceToSell}
          sources={pricingSupport.sources}
          vendorPrices={variant.vendorPrices}
        />
        {variantHppBasis.kind === 'vendor' && variant.vendorPrices.length ? (
          <KolamVendorPriceCard
            badge={activeTab.label}
            description="Harga vendor untuk varian aktif. Baris termurah ditandai Terbaik."
            formatCurrency={formatCurrency}
            prices={variant.vendorPrices}
            title="Harga Vendor"
          />
        ) : null}
      </View>
      {syncPriceDialog}
    </View>
  );
}

type ProductHppBasis =
  | { bomCost: number; kind: 'bom'; packingCost: number; total: number }
  | { kind: 'vendor'; total: number }
  | { kind: 'stored'; total: number };

function ProductHppBasisMetric({ basis }: { basis: ProductHppBasis }) {
  if (basis.kind === 'bom') {
    return (
      <KolamPricingMetric label="Harga BOM" fullWidth>
        <View style={styles.hppBasisStack}>
          {basis.bomCost > 0 ? (
            <View style={styles.hppBasisRow}>
              <Text style={styles.detailMutedText}>Harga bahan baku</Text>
              <Text style={styles.pricingMetricDanger}>{formatCurrency(basis.bomCost)}</Text>
            </View>
          ) : null}
          {basis.packingCost > 0 ? (
            <View style={styles.hppBasisRow}>
              <Text style={styles.detailMutedText}>Harga kemasan</Text>
              <Text style={styles.pricingMetricDanger}>{formatCurrency(basis.packingCost)}</Text>
            </View>
          ) : null}
          <View style={styles.hppBasisRow}>
            <Text style={styles.detailMutedText}>Total BOM</Text>
            <Text style={styles.pricingMetricText}>{formatCurrency(basis.total)}</Text>
          </View>
        </View>
      </KolamPricingMetric>
    );
  }

  if (basis.kind === 'vendor') {
    return (
      <KolamPricingMetric label="Harga vendor" fullWidth>
        <Text style={styles.pricingMetricDanger}>{formatCurrency(basis.total)}</Text>
      </KolamPricingMetric>
    );
  }

  return (
    <KolamPricingMetric label="HPP tersimpan" fullWidth>
      <Text style={styles.pricingMetricText}>{formatCurrency(basis.total)}</Text>
    </KolamPricingMetric>
  );
}

function ProductMiniTile({
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

function ProductMetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaBlock}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function createProductSidebarLinks(product: KolamProduct) {
  const shopee = findProductExternalLink(product, 'shopee');
  const tokopedia = findProductExternalLink(product, 'tokopedia');
  const webstoreUrl = createProductWebstoreUrl(product);

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
      logo: null,
      mark: 'W',
      url: webstoreUrl,
    },
  ];
}

function findProductExternalLink(product: KolamProduct, key: 'shopee' | 'tokopedia') {
  return product.externalLinks.find(link => {
    const label = link.label.trim().toLowerCase();
    const url = link.url.trim().toLowerCase();
    return label.includes(key) || url.includes(key);
  });
}

function createProductWebstoreUrl(product: KolamProduct) {
  const slug = product.slug?.trim();
  if (!slug) {
    return findWebsiteProductExternalLink(product)?.url || '';
  }

  return `https://dunia-anura.com/id/products/${encodeURIComponent(slug)}`;
}

function findWebsiteProductExternalLink(product: KolamProduct) {
  return product.externalLinks.find(link => {
    const label = link.label.trim().toLowerCase();
    return label.includes('website') || label.includes('webstore');
  });
}

function normalizeProductUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : 'https://' + value;
}

function getBrandInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) {
    return '-';
  }

  return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
}

function ProductVariantsTab({ product }: { product: KolamProduct }) {
  const rootFields = Array.isArray(product.customFields) ? product.customFields : [];
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const hasSpecs =
    rootFields.length ||
    variants.some(variant => Array.isArray(variant.customFields) && variant.customFields.length);

  return (
    <View style={styles.detailPanel}>
      <Text style={styles.detailPanelTitle}>Spesifikasi</Text>
      {hasSpecs ? (
        <>
          {rootFields.length ? (
            <ProductCustomFieldGroup fields={rootFields} title="Produk" />
          ) : null}
          {variants.map(variant =>
            variant.customFields.length ? (
              <ProductCustomFieldGroup
                fields={variant.customFields}
                key={variant.id}
                title={variant.label || variant.sku || 'Varian'}
              />
            ) : null,
          )}
        </>
      ) : (
        <Text style={styles.variantMeta}>Belum ada custom field spesifikasi.</Text>
      )}
    </View>
  );
}

function ProductCustomFieldGroup({
  fields,
  title,
}: {
  fields: KolamProduct['customFields'];
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
                field={createProductCustomFieldIconAdapter(field)}
              />
              <View style={styles.customFieldSpecCopy}>
                <Text style={styles.customFieldSpecLabel}>{field.label}</Text>
                <Text style={styles.customFieldSpecValue}>{field.value || '-'}</Text>
                {field.meta ? (
                  <Text style={styles.customFieldSpecMeta}>{field.meta}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function createProductCustomFieldIconAdapter(
  field: KolamProduct['customFields'][number],
): KolamCustomField {
  return {
    createdAt: '',
    defaultValue: null,
    description: field.meta,
    fieldKey: field.id,
    fieldLabel: field.label,
    fieldType: getProductCustomFieldIconType(field.type),
    hasMinMax: false,
    iconUrl: field.iconUri || null,
    id: field.id,
    maxAllowed: null,
    minAllowed: null,
    options: [],
    order: 0,
    raw: field,
    required: field.required,
    requiresUnit: false,
    status: 'active',
    translations: {},
    unitId: '',
    unitLabel: '',
    updatedAt: '',
  };
}

function getProductCustomFieldIconType(value: string): KolamCustomField['fieldType'] {
  return value === 'number' ||
    value === 'boolean' ||
    value === 'range' ||
    value === 'select'
    ? value
    : 'string';
}

function getProductSpecificationTotal(product: KolamProduct) {
  return (
    product.customFields.length +
    product.variants.reduce(
      (total, variant) => total + variant.customFields.length,
      0,
    )
  );
}

function ProductLogisticsTab({ product }: { product: KolamProduct }) {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const shippingMethods = Array.isArray(product.logistics.shippingMethods)
    ? product.logistics.shippingMethods
    : [];
  const rootWeight = product.logistics.weightLabel || '-';
  const rootDimension = product.logistics.dimensionLabel || '-';
  const rootVolume = getProductRootVolumeLabel(product);
  const hasRootLogistics = rootWeight !== '-' || rootDimension !== '-' || rootVolume !== '-';
  const hasContent = shippingMethods.length > 0 || hasRootLogistics || variants.length > 0;

  return (
    <View style={styles.sectionGrid}>
      <KolamContentFrame style={styles.sectionCardFull} variant="settingsWebConfig">
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
            <Text style={styles.sectionTitle}>Logistik</Text>
            <Text style={styles.sectionDescription}>Metode pengiriman, berat, dimensi, volume, dan batas pengiriman.</Text>
          </View>
        </View>
        <View style={styles.logisticsVariantStack}>
          {shippingMethods.length ? (
            <View style={styles.logisticsPanelBlock}>
              <Text style={styles.variantPricingTitle}>Metode Pengiriman</Text>
              <View style={styles.logisticsShippingGrid}>
                {shippingMethods.map(method => {
                  const limits = formatProductShippingLimits(method);
                  return (
                    <View key={method.id} style={[styles.logisticsVariantCard, styles.logisticsHalfCard]}>
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
                            <Text style={styles.logisticsMethodLogoFallbackText}>{method.displayName.slice(0, 1).toUpperCase()}</Text>
                          </View>
                        )}
                        <View style={styles.logisticsMethodTitleWrap}>
                          <Text style={styles.logisticsMethodTitle}>{method.displayName}</Text>
                          <Text style={styles.logisticsMethodMeta}>{formatProductShippingPrice(method)}</Text>
                        </View>
                        {method.category ? <KolamBadge intent="muted" label={method.category} /> : null}
                      </View>
                      <Text style={styles.logisticsMethodMeta}>{formatProductShippingEta(method)}</Text>
                      <Text style={styles.logisticsMethodMeta}>{formatProductShippingCoverage(method)}</Text>
                      {limits ? <Text style={styles.logisticsMethodMeta}>{limits}</Text> : null}
                      {method.minimumOrderAmount > 0 ? (
                        <Text style={styles.logisticsMethodMeta}>Min. order: {formatCurrency(method.minimumOrderAmount)}</Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}

          {hasRootLogistics || variants.length ? (
            <View style={styles.logisticsPanelBlock}>
              <Text style={styles.variantPricingTitle}>Ukuran & Berat</Text>
              <View style={styles.logisticsShippingGrid}>
                {hasRootLogistics ? (
                  <View style={[styles.logisticsVariantCard, styles.logisticsHalfCard]}>
                    <Text style={styles.logisticsMethodTitle}>Produk</Text>
                    <KolamPricingMetricsGrid compact>
                      <KolamPricingMetric label="Berat">
                        <Text style={styles.pricingMetricText}>{rootWeight}</Text>
                      </KolamPricingMetric>
                      <KolamPricingMetric label="Dimensi">
                        <Text style={styles.pricingMetricText}>{rootDimension}</Text>
                      </KolamPricingMetric>
                      <KolamPricingMetric label="Volume">
                        <Text style={styles.pricingMetricText}>{rootVolume}</Text>
                      </KolamPricingMetric>
                    </KolamPricingMetricsGrid>
                  </View>
                ) : null}
                {variants.map((variant, index) => (
                  <View key={variant.id || String(index)} style={[styles.logisticsVariantCard, styles.logisticsHalfCard]}>
                    <Text style={styles.logisticsMethodTitle}>{variant.label || `Varian ${index + 1}`}</Text>
                    <KolamPricingMetricsGrid compact>
                      <KolamPricingMetric label="Berat">
                        <Text style={styles.pricingMetricText}>{getProductVariantWeightLabel(variant)}</Text>
                      </KolamPricingMetric>
                      <KolamPricingMetric label="Dimensi">
                        <Text style={styles.pricingMetricText}>{getProductVariantDimensionLabel(variant)}</Text>
                      </KolamPricingMetric>
                      <KolamPricingMetric label="Volume">
                        <Text style={styles.pricingMetricText}>{getProductVariantVolumeLabel(variant)}</Text>
                      </KolamPricingMetric>
                    </KolamPricingMetricsGrid>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {!hasContent ? (
            <Text style={styles.emptyText}>Belum ada data logistik dari server/cache lokal.</Text>
          ) : null}
        </View>
      </KolamContentFrame>
    </View>
  );
}

function ProductMaterialsTab({ product }: { product: KolamProduct }) {
  const rows = [
    ...product.components.map(component => ({
      id: `component-${component.id}`,
      label: component.name,
      meta: [getMaterialComponentCode(component), component.brandLabel, `${component.quantity} ${component.unitLabel || 'unit'}`]
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
      tone: component.stock <= 0 ? 'danger' as const : 'default' as const,
      value: formatCurrency(component.totalPrice),
    })),
    ...product.packings.map(packing => ({
      id: `packing-${packing.id}`,
      label: packing.name,
      meta: [packing.sku, packing.variantLabel ? `Varian: ${packing.variantLabel}` : '']
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

function ProductMoreTab({ product }: { product: KolamProduct }) {
  return (
    <View style={styles.sectionGrid}>
      <KolamDetailTermsTemplatesPanel
        itemId={product.id}
        itemLabel="produk"
        itemType="product"
        summary={{
          label: 'Garansi',
          meta: [
            product.warranty.days ? `${product.warranty.days} hari` : '',
            product.warranty.vendorName,
            product.warranty.termsTitle,
          ]
            .filter(Boolean)
            .join(' | '),
          status: product.warranty.label,
          statusIntent: product.warranty.mode === 'none' ? 'muted' : 'success',
        }}
      />
      <KolamDetailAttachedItemsPanel
        description="Produk atau spesies terhubung (compatible / replacement)."
        emptyText="Belum ada item terlampir."
        items={product.attachedItems}
        title="Produk kompatibel"
      />
      <KolamDetailSeoGooglePanel
        description={product.description}
        entityName={product.name}
        pathPrefix="products"
        seo={{
          keywords: product.seo.keywords,
          lastSeoScore: product.seo.lastSeoScore,
          metaDescription: product.seo.metaDescription,
          metaTitle: product.seo.metaTitle,
        }}
        shortDescription={product.shortDescription}
        slug={product.slug}
      />
    </View>
  );
}

function getMaterialComponentCode(component: KolamProduct['components'][number]) {
  const currentCode = cleanMaterialCode(component.code);
  if (currentCode) {
    return currentCode;
  }

  const row = toMaterialRecord(component.raw);
  const product = toMaterialRecord(row.product);
  return (
    cleanMaterialCode(readMaterialString(product, 'productCode')) ||
    cleanMaterialCode(readMaterialString(product, 'product_code')) ||
    cleanMaterialCode(readMaterialString(product, 'code')) ||
    cleanMaterialCode(readMaterialString(row, 'productCode')) ||
    cleanMaterialCode(readMaterialString(row, 'product_code')) ||
    cleanMaterialCode(readMaterialString(row, 'code'))
  );
}

function cleanMaterialCode(value: string) {
  const code = value.trim();
  return code && code !== '-' ? code : '';
}

function toMaterialRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? value as Record<string, unknown>
    : {};
}

function readMaterialString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function ProductStatisticsTab({ product }: { product: KolamProduct }) {
  return (
    <KolamEntityStatisticsPanel
      description="Penjualan, pembelian, dan performa produk."
      entityId={product.id}
      entityType="product"
    />
  );
}

function ProductAssetsTab({ product }: { product: KolamProduct }) {
  const handleUpload = React.useCallback(async (title: string, localUri: string) => {
    const updated = await uploadKolamProductAsset(product.id, title, localUri);
    return updated.assets;
  }, [product.id]);

  const handleDelete = React.useCallback(async (assetId: string) => {
    const updated = await deleteKolamProductAsset(product.id, assetId);
    return updated.assets;
  }, [product.id]);

  const handleDownload = React.useCallback((asset: KolamEntityDetailAsset) => {
    const base = appConfig.kolamApiBaseUrl.replace(/\/$/, '');
    void Linking.openURL(`${base}/products/${encodeURIComponent(product.id)}/assets/${encodeURIComponent(asset.id)}/download`);
  }, [product.id]);

  return (
    <KolamEntityDetailAssetsPanel
      assets={product.assets}
      deleteAsset={handleDelete}
      downloadAsset={handleDownload}
      uploadAsset={handleUpload}
    />
  );
}

function DetailFact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailFactRow}>
      <Text style={styles.detailFactLabel}>{label}</Text>
      <Text style={styles.detailFactValue}>{value}</Text>
    </View>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function EmptyDetailPanel({ message, title }: { message: string; title: string }) {
  return (
    <View style={styles.detailPanel}>
      <Text style={styles.detailPanelTitle}>{title}</Text>
      <Text style={styles.detailText}>{message}</Text>
    </View>
  );
}

function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?>(\s*)/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}
function renderSyncCell(product: KolamProduct) {
  return (
    <KolamMarketplaceSyncPlatformList
      platforms={product.marketplaceSync.platforms}
    />
  );
}

function renderPriceSyncCell(product: KolamProduct) {
  const platforms = product.marketplaceSync.pricePlatforms;
  if (!platforms.length) {
    return <Text style={styles.mutedText}>Belum sinkron</Text>;
  }

  return platforms.map(platform => (
    <View key={platform.platform} style={styles.syncLine}>
      <Text style={styles.syncPlatform}>{platform.platform === 'tokopedia' ? 'TP' : 'SH'}</Text>
      <KolamBadge
        intent={platform.status === 'failed' ? 'danger' : 'success'}
        label={platform.statusLabel}
      />
      {platform.lastSyncedAt ? (
        <Text style={styles.detailMutedText}>{formatDateTime(platform.lastSyncedAt)}</Text>
      ) : null}
    </View>
  ));
}

function renderInfoBadges(product: KolamProduct) {
  return (
    <View style={styles.infoBadges}>
      <KolamBadge intent="outline" label={product.hasVariants ? 'V' : 'S'} />
      {product.sellable ? <KolamBadge intent="success" label="Jual" /> : null}
      {product.isPinned ? <KolamBadge intent="info" label="Pin" /> : null}
    </View>
  );
}

function createBarcodeItems(products: KolamProduct[]): KolamBarcodeLabelItem[] {
  return products
    .map(product => ({
      id: product.id,
      code: getProductCode(product),
      name: product.name,
      price: product.priceToSell,
    }))
    .filter(item => item.code);
}

function createProductMediaItems(product: KolamProduct): ProductMediaItem[] {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const videos = Array.isArray(product.videos) ? product.videos : [];
  const productPhotos = product.photoUris.length
    ? product.photoUris
    : product.thumbnailUri
    ? [product.thumbnailUri]
    : [];
  const items: ProductMediaItem[] = [
    ...productPhotos.map((uri, index) => ({
      id: `${product.id}-photo-${index}`,
      type: 'image' as const,
      title: product.name,
      uri,
    })),
    ...videos.map((uri, index) => ({
      id: `${product.id}-video-${index}`,
      type: 'video' as const,
      title: `${product.name} video ${index + 1}`,
      uri,
    })),
  ];

  variants.forEach(variant => {
    const badgeLabel = variant.label;
    const variantPhotos = Array.isArray(variant.photoUris) ? variant.photoUris : [];
    const variantVideos = Array.isArray(variant.videoUris) ? variant.videoUris : [];
    variantPhotos.forEach((uri, index) => {
      items.push({
        badgeLabel,
        id: `${variant.id}-photo-${index}`,
        type: 'image',
        title: `${product.name} - ${badgeLabel}`,
        uri,
      });
    });
    variantVideos.forEach((uri, index) => {
      items.push({
        badgeLabel,
        id: `${variant.id}-video-${index}`,
        type: 'video',
        title: `${product.name} - ${badgeLabel} video ${index + 1}`,
        uri,
      });
    });
  });

  return items;
}

function ensureProductDetailDefaults(product: KolamProduct): KolamProduct {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const categories = Array.isArray(product.categories) ? product.categories : [];
  const brands = Array.isArray(product.brands) ? product.brands : [];
  const photoUris = Array.isArray(product.photoUris) ? product.photoUris : [];
  const videos = Array.isArray(product.videos) ? product.videos : [];
  const labels = Array.isArray(product.labels) ? product.labels : [];

  return {
    ...product,
    attachedItems: Array.isArray(product.attachedItems) ? product.attachedItems : [],
    assets: Array.isArray(product.assets) ? product.assets : [],
    brands,
    categories,
    components: Array.isArray(product.components) ? product.components : [],
    customFields: Array.isArray(product.customFields) ? product.customFields : [],
    externalLinks: Array.isArray(product.externalLinks) ? product.externalLinks : [],
    grocerPricingTiers: Array.isArray(product.grocerPricingTiers)
      ? product.grocerPricingTiers
      : [],
    labels,
    localeBlocks: Array.isArray(product.localeBlocks) && product.localeBlocks.length
      ? product.localeBlocks
      : [
          {
            description: product.description ?? '',
            locale: 'id',
            localeLabel: 'Indonesia',
            name: product.name,
            shortDescription: product.shortDescription ?? '',
          },
        ],
    logistics: {
      dimensionLabel: product.logistics?.dimensionLabel ?? '-',
      height: product.logistics?.height ?? 0,
      length: product.logistics?.length ?? 0,
      shippingMethods: Array.isArray(product.logistics?.shippingMethods)
        ? product.logistics.shippingMethods
        : [],
      volume: product.logistics?.volume ?? 0,
      weight: product.logistics?.weight ?? 0,
      weightLabel: product.logistics?.weightLabel ?? '-',
      width: product.logistics?.width ?? 0,
    },
    marketplaceSync: {
      label: product.marketplaceSync?.label ?? 'Belum sinkron',
      lastSyncedAt: product.marketplaceSync?.lastSyncedAt,
      platforms: Array.isArray(product.marketplaceSync?.platforms)
        ? product.marketplaceSync.platforms
        : [],
      pricePlatforms: Array.isArray(product.marketplaceSync?.pricePlatforms)
        ? product.marketplaceSync.pricePlatforms
        : [],
    },
    memberPoints: product.memberPoints ?? { enabled: false, points: 0 },
    commission: product.commission ?? {
      enabled: false,
      label: 'Nonaktif',
      type: 'percentage',
      value: 0,
    },
    packings: Array.isArray(product.packings) ? product.packings : [],
    photoUris,
    seo: product.seo ?? {
      faqCount: 0,
      keywords: [],
      lastAuditedAt: '',
      lastSeoScore: 0,
      metaDescription: '',
      metaTitle: '',
    },
    tags: Array.isArray(product.tags) ? product.tags : [],
    variants: variants.map(variant => ({
      ...variant,
      componentOverrides: Array.isArray(variant.componentOverrides)
        ? variant.componentOverrides
        : [],
      customFields: Array.isArray(variant.customFields) ? variant.customFields : [],
      externalLinks: Array.isArray(variant.externalLinks) ? variant.externalLinks : [],
      photoUris: Array.isArray(variant.photoUris) ? variant.photoUris : [],
      videoUris: Array.isArray(variant.videoUris) ? variant.videoUris : [],
    })),
    videos,
    warranty: product.warranty ?? {
      days: 0,
      label: 'Tanpa garansi',
      mode: 'none',
      termsExcerpt: '',
      termsTitle: '',
      vendorName: '',
    },
  };
}

function getProductCode(product: KolamProduct) {
  return product.type === 'raw'
    ? product.productCode || product.sku || product.id
    : product.sku || product.productCode || product.id;
}

function getProductVendorPrices(product: KolamProduct): KolamVendorPriceCardItem[] {
  const raw = getRawRecord(product.raw);
  return getProductVendorPriceItems(raw.vendorPrices);
}

function getProductVendorPriceItems(value: unknown): KolamVendorPriceCardItem[] {
  const rawVendorPrices = Array.isArray(value) ? value : [];

  return rawVendorPrices.filter(isActiveProductVendorPrice).map((price, index) => {
    const record = getRawRecord(price);
    const vendor = getRawRecord(record.vendor);
    const priceValue = Number(record.price) || 0;
    const shippingCost = Number(record.shippingCost) || 0;
    const totalCost = Number(record.totalCost) || priceValue + shippingCost;

    return {
      id: String(record._id ?? record.id ?? index),
      link: String(record.link ?? ''),
      price: priceValue,
      priceHistory: Array.isArray(record.priceHistory)
        ? (record.priceHistory as Array<{ date?: string; poId?: string; poRef?: string }>)
        : [],
      shippingCost,
      totalCost,
      vendorId: String(record.vendorId ?? vendor._id ?? vendor.id ?? ''),
      vendorName: String(record.vendorName ?? vendor.name ?? '-'),
    };
  });
}

function getProductHppBasis({
  components,
  minimumOrderQty,
  packings,
  storedPrice,
  vendorPrices,
}: {
  components: unknown;
  minimumOrderQty: number;
  packings: unknown;
  storedPrice: number;
  vendorPrices: KolamVendorPriceCardItem[];
}): ProductHppBasis {
  const bomCost = getProductBomCost(components, minimumOrderQty);
  const packingCost = getProductPackingCost(packings, minimumOrderQty);
  if (bomCost > 0 || packingCost > 0) {
    return {
      bomCost,
      kind: 'bom',
      packingCost,
      total: bomCost + packingCost,
    };
  }

  const vendorCost = getLowestProductVendorCost(vendorPrices);
  if (vendorCost > 0) {
    return {
      kind: 'vendor',
      total: vendorCost,
    };
  }

  return {
    kind: 'stored',
    total: Math.max(0, Number(storedPrice) || 0) * Math.max(1, Number(minimumOrderQty) || 1),
  };
}

function getProductBomCost(components: unknown, minimumOrderQty: number) {
  if (!Array.isArray(components)) {
    return 0;
  }

  const minQty = Math.max(1, Number(minimumOrderQty) || 1);
  return components.reduce((total, item) => {
    const record = getRawRecord(item);
    const product = getRawRecord(record.product);
    const quantity = Math.max(0, Number(record.quantity) || 0);
    const totalPrice = Number(record.totalPrice) || 0;
    const unitPrice = firstPositiveProductNumber(product.price, record.price, record.unitPrice);
    const lineTotal = totalPrice > 0 ? totalPrice : unitPrice * quantity;
    return total + lineTotal * minQty;
  }, 0);
}

function getProductPackingCost(packings: unknown, minimumOrderQty: number) {
  if (!Array.isArray(packings)) {
    return 0;
  }

  const minQty = Math.max(1, Number(minimumOrderQty) || 1);
  return packings.reduce((total, item) => {
    const record = getRawRecord(item);
    const packing = getRawRecord(record.packing);
    const unitCost = firstPositiveProductNumber(
      packing.cost,
      getLowestRawProductVendorCost(packing.vendorPrices),
      record.cost,
      record.price,
      record.totalPrice,
      packing.price,
      packing.priceToSell,
    );
    const quantity = Math.max(1, Number(record.quantity) || 1);
    const batchQuantity = Math.max(1, Math.ceil(quantity / minQty));
    return total + unitCost * batchQuantity;
  }, 0);
}

function getLowestProductVendorCost(prices: KolamVendorPriceCardItem[]) {
  const values = (Array.isArray(prices) ? prices : [])
    .map(price => firstPositiveProductNumber(price.totalCost, price.price + price.shippingCost, price.price))
    .filter(value => value > 0);
  return values.length ? Math.min(...values) : 0;
}

function getLowestRawProductVendorCost(value: unknown) {
  if (!Array.isArray(value)) {
    return 0;
  }

  const values = value
    .map(item => {
      const record = getRawRecord(item);
      const price = Number(record.price) || 0;
      const shipping = Number(record.shippingCost) || 0;
      return firstPositiveProductNumber(record.totalCost, price + shipping, price);
    })
    .filter(price => price > 0);
  return values.length ? Math.min(...values) : 0;
}

function firstPositiveProductNumber(...values: unknown[]) {
  for (const value of values.flat()) {
    const numberValue = Number(value);
    if (Number.isFinite(numberValue) && numberValue > 0) {
      return numberValue;
    }
  }
  return 0;
}

function isActiveProductVendorPrice(value: unknown) {
  const record = getRawRecord(value);
  const vendor = record.vendor;

  if (!vendor) {
    return false;
  }

  if (typeof vendor === 'string') {
    return true;
  }

  const vendorRecord = getRawRecord(vendor);
  const status = String(vendorRecord.status ?? '');
  return !status || status === 'active';
}

function getProductRawComponents(product: KolamProduct) {
  const raw = getRawRecord(product.raw);
  return Array.isArray(raw.components) ? raw.components : product.components;
}

function getProductRawPackings(product: KolamProduct) {
  const raw = getRawRecord(product.raw);
  return Array.isArray(raw.packings) ? raw.packings : product.packings;
}

function getRawRecord(raw: unknown) {
  return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
}

function formatFileSize(value: number) {
  if (!value || value <= 0) {
    return '-';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = value;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function getDataSourceLabel(source: string) {
  switch (source) {
    case 'live':
      return 'live';
    case 'cache':
      return 'cache';
    case 'error':
      return 'server down';
    default:
      return 'idle';
  }
}

function formatCurrency(value: number) {
  if (!value) {
    return '-';
  }

  return `Rp ${value.toLocaleString('id-ID')}`;
}

function parseNumberInput(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatProductShippingPrice(method: KolamProduct['logistics']['shippingMethods'][number]) {
  if (method.pricingPrice <= 0) {
    return 'Harga pengiriman belum disetel';
  }

  switch (method.pricingType) {
    case 'per_kg':
      return `${formatCurrency(method.pricingPrice)}/kg`;
    case 'per_km':
      return `${formatCurrency(method.pricingPrice)}/km`;
    case 'per_cubic_meter':
      return `${formatCurrency(method.pricingPrice)}/m3`;
    case 'fixed':
      return `${formatCurrency(method.pricingPrice)} tetap`;
    default:
      return formatCurrency(method.pricingPrice);
  }
}

function formatProductShippingEta(method: KolamProduct['logistics']['shippingMethods'][number]) {
  const min = method.estimatedMinDays;
  const max = method.estimatedMaxDays;
  if (!min && !max) {
    return 'Estimasi belum disetel';
  }
  if (min === max || !max) {
    return `${min || max} hari`;
  }
  return `${min}-${max} hari`;
}

function formatProductShippingCoverage(method: KolamProduct['logistics']['shippingMethods'][number]) {
  if (!method.restrictedRegions.length) {
    return 'Cakupan: semua wilayah tersedia';
  }
  const visibleRegions = method.restrictedRegions.slice(0, 3).join(', ');
  const rest = method.restrictedRegions.length - 3;
  return `Terbatas: ${visibleRegions}${rest > 0 ? ` +${rest} lagi` : ''}`;
}

function formatProductShippingLimits(method: KolamProduct['logistics']['shippingMethods'][number]) {
  const parts = [
    method.maximumWeight > 0 ? `Maks berat ${formatNumber(method.maximumWeight)}` : '',
    method.maximumDimensionLength || method.maximumDimensionWidth || method.maximumDimensionHeight
      ? `Maks dimensi ${formatNumber(method.maximumDimensionLength)} x ${formatNumber(method.maximumDimensionWidth)} x ${formatNumber(method.maximumDimensionHeight)}`
      : '',
  ].filter(Boolean);
  return parts.join(' | ');
}

function getProductRootVolumeLabel(product: KolamProduct) {
  if (product.logistics.length && product.logistics.width && product.logistics.height) {
    return formatProductDimensionVolume(
      product.logistics.length,
      product.logistics.width,
      product.logistics.height,
      getProductRootDimensionUnitLabel(product),
    );
  }
  return product.logistics.volume ? formatNumber(product.logistics.volume) : '-';
}

function getProductVariantWeightLabel(variant: KolamProduct['variants'][number]) {
  if (variant.weightValue <= 0) {
    return '-';
  }
  return `${formatNumber(variant.weightValue)}${getProductRawUnitLabel(getRawRecord(variant.raw).weight, variant.weightUnitId)}`;
}

function getProductVariantDimensionLabel(variant: KolamProduct['variants'][number]) {
  if (!variant.dimensionLength && !variant.dimensionWidth && !variant.dimensionHeight) {
    return '-';
  }
  const unit = getProductRawUnitLabel(getRawRecord(variant.raw).dimension, variant.dimensionUnitId);
  return `${formatNumber(variant.dimensionLength)} x ${formatNumber(variant.dimensionWidth)} x ${formatNumber(variant.dimensionHeight)}${unit}`;
}

function getProductVariantVolumeLabel(variant: KolamProduct['variants'][number]) {
  const unit = getProductRawUnitLabel(getRawRecord(variant.raw).dimension, variant.dimensionUnitId).trim();
  return formatProductDimensionVolume(
    variant.dimensionLength,
    variant.dimensionWidth,
    variant.dimensionHeight,
    unit,
  );
}

function getProductRootDimensionUnitLabel(product: KolamProduct) {
  const dimension = getRawRecord(getRawRecord(product.raw).dimension);
  const unit = getRawRecord(dimension.unit);
  return String(unit.initial ?? unit.name ?? '').trim();
}

function getProductRawUnitLabel(rawContainer: unknown, fallbackId: string) {
  const record = getRawRecord(rawContainer);
  const unit = getRawRecord(record.unit);
  const label = String(unit.initial ?? unit.name ?? '').trim();
  if (label) {
    return ` ${label}`;
  }
  return fallbackId ? ` ${fallbackId}` : '';
}

function formatProductDimensionVolume(length: number, width: number, height: number, unit: string) {
  if (!length || !width || !height) {
    return '-';
  }
  return `${formatNumber(length * width * height)}${unit ? ` ${unit}3` : ''}`;
}

function formatStock(product: KolamProduct) {
  if (!product.unitLabel) {
    return String(product.stock);
  }

  return `${product.stock} ${product.unitLabel}`;
}

function getProductStockStatusLabel(product: KolamProduct) {
  if (product.stock <= 0) {
    return 'Stok Habis';
  }

  if (product.lowStockThreshold > 0 && product.stock <= product.lowStockThreshold) {
    return 'Stok Rendah';
  }

  return product.status || 'Aktif';
}

function formatDateTime(value: string | undefined) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

const styles = StyleSheet.create({
  root: {
    gap: 18,
    overflow: 'visible',
    padding: 24,
  },
  surface: {
    gap: 16,
  },
  header: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  headingRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    overflow: 'visible',
  },
  headingCopy: {
    flex: 1,
  },
  eyebrow: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0,
  },
  title: {
    color: V.colors.fg,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    marginTop: 2,
  },
  copyCodeWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 5,
  },
  titleCodeChip: {
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  titleCodeText: {
    color: V.colors.mutedFg,
    fontFamily: 'Consolas',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  copyCodeButton: {
    minHeight: 26,
    paddingHorizontal: 8,
  },
  description: {
    color: V.colors.mutedFg,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  stack: {
    gap: 16,
    overflow: 'visible',
    position: 'relative',
  },
  toolbarShell: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 6,
    justifyContent: 'space-between',
    overflow: 'visible',
    padding: 4,
    position: 'relative',
    zIndex: 100000,
    elevation: 1000,
  },
  filterRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 4,
    minWidth: 0,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100001,
    elevation: 1001,
  },
  actionRow: {
    alignItems: 'center',
    borderLeftColor: V.colors.border,
    borderLeftWidth: 1,
    flexDirection: 'row',
    flexShrink: 0,
    flexWrap: 'nowrap',
    gap: 6,
    justifyContent: 'flex-end',
    paddingLeft: 8,
  },
  search: {
    flexBasis: 160,
    flexGrow: 1,
    maxWidth: 220,
    minWidth: 140,
  },
  filterTrigger: {
    flexBasis: 0,
    flexGrow: 1,
    minHeight: 34,
    minWidth: 128,
    paddingHorizontal: 8,
  },
  stockTrigger: {
    flexBasis: 0,
    flexGrow: 1,
    minHeight: 34,
    minWidth: 128,
    paddingHorizontal: 8,
  },
  filterOverlayPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 1200,
    padding: 6,
    position: 'absolute',
    shadowColor: V.colors.fg,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    top: 48,
    width: 320,
    zIndex: 120000,
  },
  filterPanelCategory: {
    left: 168,
  },
  filterPanelBrand: {
    left: 330,
  },
  filterPanelStock: {
    left: 492,
    width: 220,
  },
  filterPanelSearch: {
    marginBottom: 6,
  },
  filterPanelScroll: {
    maxHeight: 240,
  },
  filterPanelContent: {
    gap: 4,
  },
  filterPanelOption: {
    justifyContent: 'flex-start',
  },
  filterPanelEmpty: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  filterPanelFooter: {
    alignItems: 'flex-end',
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    marginTop: 6,
    paddingTop: 6,
  },
  toolbarButton: {
    minHeight: 34,
    paddingHorizontal: 10,
  },
  tableFrame: {
    elevation: 0,
    overflow: 'visible',
    position: 'relative',
    zIndex: 0,
  },
  error: {
    color: V.colors.danger,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionGrid: {
    gap: 12,
  },
  sectionCardFull: {
    gap: 0,
    padding: 0,
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
    gap: 10,
    padding: 12,
  },
  logisticsVariantCard: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  logisticsHalfCard: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 280,
  },
  logisticsPanelBlock: {
    gap: 10,
  },
  logisticsShippingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
  productEditSection: {
    gap: 12,
    padding: 14,
  },
  productEditSectionHeader: {
    gap: 3,
  },
  productEditSectionTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  productEditSectionDescription: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  productEditSectionBody: {
    gap: 12,
  },
  twoColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  longDropdownMenu: {
    width: 320,
  },
  categoryPickerStack: {
    gap: 8,
  },
  selectedCategoryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedCategoryButton: {
    minHeight: 30,
    paddingHorizontal: 10,
  },
  fieldHint: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  rowText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  threeColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  variantEditorPanel: {
    gap: 12,
  },
  variantToggleHeader: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    padding: 12,
  },
  variantEditorHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  variantHeaderActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  variantFormCard: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  variantRowHeader: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    padding: 10,
  },
  variantRowPressable: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
    gap: 12,
    minWidth: 0,
  },
  variantHeaderMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
    marginLeft: 'auto',
  },
  variantMetaBadge: {
    minHeight: 24,
  },
  variantHeaderButton: {
    minHeight: 34,
    paddingHorizontal: 12,
  },
  variantTabRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variantTabContent: {
    gap: 12,
  },
  variantPricingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  variantCompactField: {
    flexBasis: 180,
    flexGrow: 1,
    gap: 6,
    minWidth: 150,
  },
  variantCompactHint: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 13,
  },
  variantSpecsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  variantSpecsGroup: {
    flexBasis: 360,
    flexGrow: 1,
    gap: 8,
    minWidth: 280,
  },
  variantSpecsLabel: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  variantSpecsTwoGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  variantSpecsFourGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  variantMediaPanel: {
    backgroundColor: V.colors.secondary,
    borderRadius: 6,
    gap: 10,
    padding: 10,
  },
  existingMediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  existingMediaItem: {
    alignItems: 'center',
    backgroundColor: V.colors.secondary,
    borderRadius: 6,
    gap: 8,
    padding: 8,
    width: 132,
  },
  existingMediaImage: {
    borderRadius: 6,
    height: 72,
    width: 116,
  },
  mediaDeleteButton: {
    minHeight: 30,
  },
  mediaPickerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaPickerInput: {
    flex: 1,
    minWidth: 240,
  },
  vendorPricePanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  vendorPriceRow: {
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    gap: 10,
    padding: 10,
  },
  variantFieldPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  variantFieldPanelTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  variantFieldPanelBody: {
    gap: 10,
  },
  pricingPanelStack: {
    gap: 12,
  },
  priceInputBlock: {
    flexBasis: 320,
    flexGrow: 1,
    gap: 8,
    minWidth: 240,
  },
  priceInputLabel: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  priceInputHint: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  priceInputRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  priceInputControl: {
    flex: 1,
    minWidth: 0,
  },
  priceUnitBadge: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 10,
  },
  priceUnitBadgeText: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  externalLinksStack: {
    gap: 8,
  },
  externalLinkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  externalLinkInput: {
    flex: 1,
    minWidth: 220,
  },
  externalLinkRemoveButton: {
    minHeight: 34,
    paddingHorizontal: 10,
  },
  externalLinkAddButton: {
    alignSelf: 'flex-start',
    minHeight: 34,
  },
  customFieldPickerPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 10,
  },
  customFieldFixedUnitBox: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 180,
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  customFieldEditorRow: {
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 10,
  },
  customFieldTextArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  customFieldUnknownPanel: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 10,
  },
  seoTextArea: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  attachedItemRow: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 10,
  },
  attachedItemForm: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 10,
  },
  formActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  tableRow: {
    alignItems: 'stretch',
  },
  productPrimaryCell: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    minWidth: 0,
  },
  thumbnailFrame: {
    backgroundColor: V.colors.secondary,
    borderRadius: 6,
    height: 44,
    overflow: 'hidden',
    width: 44,
  },
  thumbnail: {
    height: 44,
    width: 44,
  },
  productCopy: {
    flex: 1,
    minWidth: 0,
  },
  productName: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  productCategory: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    marginTop: 2,
  },
  skuCell: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    width: 86,
  },
  brandCell: {
    width: 130,
  },
  brandLogoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  brandLogoFrame: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 34,
  },
  brandLogoImage: {
    height: '100%',
    width: '100%',
  },
  brandLogoInitials: {
    color: V.colors.fg,
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 12,
  },
  brandLogoOverflowText: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 14,
  },
  amountCell: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'right',
    width: 112,
  },
  stockCell: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'right',
    width: 86,
  },
  syncCell: {
    gap: 4,
    width: 132,
  },
  syncLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  syncPlatform: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '800',
    width: 22,
  },
  infoCell: {
    width: 96,
  },
  infoBadges: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  actionCell: {
    alignItems: 'flex-end',
    width: 54,
  },
  mutedText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'center',
  },
  emptyText: {
    color: V.colors.mutedFg,
    fontSize: 14,
    fontWeight: '700',
  },
  footerWrap: {
    marginTop: 14,
  },
  detailHeaderRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  detailHeaderActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  detailGrid: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 18,
  },
  detailSidebar: {
    gap: 12,
    width: 320,
  },
  detailMain: {
    flex: 1,
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
  detailInfoCard: {
    gap: 10,
    padding: 14,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  detailInfoCardFlat: {
    gap: 6,
    marginTop: 12,
  },
  detailFactRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  detailFactLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '800',
  },
  detailFactValue: {
    color: V.colors.fg,
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  detailSectionTitle: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 4,
  },
  detailText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
  },
  detailMutedText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  detailLongText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 21,
  },
  detailHtmlContent: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  detailPanel: {
    gap: 12,
    padding: 16,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  detailPanelTitle: {
    color: V.colors.fg,
    fontSize: 17,
    fontWeight: '900',
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
  pricingStack: {
    gap: 14,
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
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 12,
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
  hppBasisStack: {
    gap: 6,
  },
  hppBasisRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  inlineMetricRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  panelTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  overviewGrid: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 24,
  },
  overviewSidebar: {
    gap: 12,
    width: 320,
  },
  overviewContent: {
    flex: 1,
    gap: 12,
    minWidth: 0,
  },
  localeTitleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  sidebarMiniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  linkList: {
    alignItems: 'flex-start',
    gap: 8,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricTile: {
    minWidth: 150,
    flexGrow: 1,
    gap: 6,
    padding: 12,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: V.colors.secondary,
  },
  metricLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '800',
  },
  metricValue: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '900',
  },
  variantRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  variantThumb: {
    alignItems: 'center',
    backgroundColor: V.colors.secondary,
    borderRadius: 6,
    height: 42,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 42,
  },
  variantThumbImage: {
    height: 42,
    width: 42,
  },
  variantThumbText: {
    color: V.colors.mutedFg,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
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
  variantSpecList: {
    marginTop: 8,
  },
  customFieldSpecList: {
    gap: 8,
    marginTop: 10,
  },
  customFieldSpecRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.secondary,
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
  customFieldSpecMeta: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  variantAmount: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'right',
    width: 120,
  },
  variantStock: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'right',
    width: 70,
  },
  assetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  assetThumb: {
    borderRadius: 8,
    height: 96,
    width: 86,
  },
  assetVideoThumb: {
    borderRadius: 8,
    height: 96,
    width: 160,
  },
  videoStack: {
    gap: 10,
    marginTop: 4,
  },
  videoPlayer: {
    aspectRatio: 16 / 9,
    borderRadius: 8,
    width: '100%',
  },
});


































