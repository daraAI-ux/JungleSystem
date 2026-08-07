import React from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { KolamBarcodeLabelItem } from '../domain/kolam-barcode';
import type { KolamCustomField } from '../domain/kolam-custom-field';
import { getKolamFormSection } from '../domain/kolam-form';
import {
  createEmptyKolamSpeciesVariantFormRow,
  createEmptyKolamSpeciesVendorPriceFormRow,
  getSpeciesStatusLabel,
  slugifySpeciesName,
  type KolamSpecies,
  type KolamSpeciesStatus,
  type KolamSpeciesStockStatus,
  type KolamSpeciesShippingMethod,
  type KolamSpeciesMarketplaceSyncPlatform,
  type KolamSpeciesCustomFieldValue,
  type KolamSpeciesExternalLinkFormRow,
  type KolamSpeciesLinkName,
  type KolamSpeciesVariantFormRow,
  type KolamSpeciesVendorPriceFormRow,
} from '../domain/kolam-species';
import { getKolamFileUrl } from '../lib/file-url';
import { copyTextToClipboard } from '../lib/native-clipboard';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import type { KolamMarketplacePlatform } from '../services/kolam-marketplace-sync-api';
import {
  useKolamSpeciesController,
  type KolamSpeciesController,
} from '../hooks/use-kolam-species-controller';
import {KolamBarcodePrintButton} from './kolam-barcode-print-button';
import { KolamBarcodePrintDialog } from './kolam-barcode-print-dialog';
import { KolamBadge } from './kolam-badge';
import { KolamButton } from './kolam-button';
import {KolamCancelButton} from './kolam-cancel-button';
import {KolamSaveButton} from './kolam-save-button';
import {KolamDaftarButton} from './kolam-daftar-button';
import {KolamEditButton} from './kolam-edit-button';
import { KolamCatalogTranslationsEditor } from './kolam-catalog-translations-editor';
import { KolamCategoryLabel } from './kolam-category-label';
import { KolamComponentOverridesEditor } from './kolam-component-overrides-editor';
import {
  KolamCommercialPolicyEditor,
  type KolamCommercialPolicyEditorValue,
} from './kolam-commercial-policy-editor';
import { KolamConfirmDialog } from './kolam-confirm-dialog';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamCustomFieldIcon } from './kolam-custom-field-icon';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamExportDialog } from './kolam-export-dialog';
import { KolamExportXlsButton } from './kolam-export-xls-button';
import { KolamMarketplacePriceSyncDialog } from './kolam-marketplace-price-sync-dialog';
import { KolamMarketplaceSyncPlatformList } from './kolam-marketplace-sync-platform-list';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamHoverTooltip } from './kolam-hover-tooltip';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import {
  KolamGrocerPricingTiersEditor,
  type KolamGrocerPricingTierEditorRow,
} from './kolam-grocer-pricing-tiers-editor';
import { KolamSpeciesDetailAssetsPanel } from './kolam-species-detail-assets-panel';
import {
  KolamSpeciesDetailOverview,
  type SpeciesDetailMediaItem,
  type SpeciesSidebarGroup,
} from './kolam-species-detail-overview';
import { KolamNativeFormSection } from './kolam-native-form-section';
import { KolamPackingLinksEditor } from './kolam-packing-links-editor';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSearchField } from './kolam-search-field';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamSwitch } from './kolam-switch';
import {
  measureFilterPanelAnchor,
  type KolamFilterPanelAnchor,
} from './kolam-filter-panel-anchor';
import { KolamTableFilterTrigger } from './kolam-table-filter-trigger';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

type SpeciesListFilterPanel = 'taxonomy' | 'category' | 'stock';

const SPECIES_FILTER_PANEL_WIDTH = 320;

type SpeciesMarketplaceSyncSelection = {
  ids: string[];
  itemCount: number;
  platforms?: KolamMarketplacePlatform[];
  title: string;
};

type SpeciesPendingAction = {
  species: KolamSpecies;
  type: 'delete' | 'duplicate';
};

type SpeciesVariantEditTab =
  | 'pricing'
  | 'vendor'
  | 'specs'
  | 'media'
  | 'advanced';

const SPECIES_VARIANT_EDIT_TABS: Array<{
  id: SpeciesVariantEditTab;
  label: string;
}> = [
  { id: 'pricing', label: 'Harga' },
  { id: 'vendor', label: 'Pemasok' },
  { id: 'specs', label: 'Spesifikasi' },
  { id: 'media', label: 'Media' },
  { id: 'advanced', label: 'Lanjutan' },
];

type SpeciesExternalLinkOption = {
  label: string;
  value: KolamSpeciesLinkName | '';
};

const SPECIES_EXTERNAL_LINK_OPTIONS: SpeciesExternalLinkOption[] = [
  { label: 'Pilih tipe', value: '' },
  { label: 'Shopee', value: 'shopee' },
  { label: 'Tokopedia', value: 'tokopedia' },
  { label: 'Situs Web', value: 'website' },
  { label: 'Tautan POS', value: 'link_pos' },
  { label: 'Tautan Lain', value: 'other_link' },
];
type SpeciesDeleteMediaTarget =
  | { type: 'thumbnail'; label: string }
  | { type: 'photo'; index: number; label: string }
  | { type: 'video'; index: number; label: string }
  | { type: 'voice'; label: string }
  | { type: 'variant-photo'; variantId: string; index: number; label: string }
  | { type: 'variant-video'; variantId: string; index: number; label: string };

export function KolamSpeciesSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamSpeciesController(route);

  return (
    <KolamSpeciesShell controller={controller} onRouteChange={onRouteChange}>
      {controller.mode === 'list' ? (
        <KolamSpeciesList
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : controller.mode === 'new' || controller.mode === 'edit' ? (
        <KolamSpeciesForm
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : (
        <KolamSpeciesDetail
          controller={controller}
          onRouteChange={onRouteChange}
        />
      )}
    </KolamSpeciesShell>
  );
}

function KolamSpeciesShell({
  children,
  controller,
  onRouteChange,
}: {
  children: React.ReactNode;
  controller: KolamSpeciesController;
  onRouteChange?: (route: string) => void;
}) {
  return (
    <View
      style={[
        styles.surface,
        controller.mode === 'list' ? styles.listSurface : null,
      ]}
    >
      {controller.mode !== 'list' ? (
        <View style={styles.header}>
          <View style={styles.headerActions}>
            {controller.mode === 'detail' ? (
              <>
                <KolamEditButton
                  intent="primary"
                  onPress={() => {
                    controller.onEdit();
                    const selectedItem = controller.selectedSpecies;
                    if (selectedItem) {
                      onRouteChange?.(`${getSpeciesRoute(selectedItem)}/edit`);
                    }
                  }}
                />
                <KolamDaftarButton
                  onPress={() => {
                    controller.onBackToList();
                    onRouteChange?.('/species');
                  }}
                />
              </>
            ) : (
              <>
                <KolamCancelButton
                  disabled={controller.saving}
                  onPress={() => {
                    controller.onBackToList();
                    onRouteChange?.('/species');
                  }}
                />
                <KolamSaveButton
                  disabled={controller.saving}
                  label={controller.saving ? 'Menyimpan...' : 'Simpan'}
                  onPress={() => {
                    void controller.onSave();
                  }}
                />
              </>
            )}
          </View>
        </View>
      ) : null}
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}
      {children}
    </View>
  );
}

function KolamSpeciesList({
  controller,
  onRouteChange,
}: {
  controller: KolamSpeciesController;
  onRouteChange?: (route: string) => void;
}) {
  const [activeFilterPanel, setActiveFilterPanel] =
    React.useState<SpeciesListFilterPanel | null>(null);
  const [filterPanelQuery, setFilterPanelQuery] = React.useState('');
  const [panelAnchor, setPanelAnchor] =
    React.useState<KolamFilterPanelAnchor | null>(null);
  const toolbarRef = React.useRef<View>(null);
  const taxonomyTriggerRef = React.useRef<View>(null);
  const categoryTriggerRef = React.useRef<View>(null);
  const stockTriggerRef = React.useRef<View>(null);
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [barcodeDialogOpen, setBarcodeDialogOpen] = React.useState(false);
  const [syncPriceDialogOpen, setSyncPriceDialogOpen] = React.useState(false);
  const [syncStockDialogOpen, setSyncStockDialogOpen] = React.useState(false);
  const [barcodeDialogItems, setBarcodeDialogItems] = React.useState<
    KolamBarcodeLabelItem[] | null
  >(null);
  const [syncPriceSelection, setSyncPriceSelection] =
    React.useState<SpeciesMarketplaceSyncSelection | null>(null);
  const [syncStockSelection, setSyncStockSelection] =
    React.useState<SpeciesMarketplaceSyncSelection | null>(null);
  const [pendingAction, setPendingAction] =
    React.useState<SpeciesPendingAction | null>(null);
  const listColumns = React.useMemo<Array<KolamListTableColumn<KolamSpecies>>>(
    () => buildSpeciesListColumns(),
    [],
  );
  const taxonomyFilter = controller.filters.taxonomyId || 'all';
  const categoryFilter = controller.filters.categoryId || 'all';
  const stockFilter = controller.filters.stockStatus;
  const pageCount = Math.max(1, controller.pagination.totalPages);
  const safePage = Math.min(Math.max(controller.pagination.page, 1), pageCount);
  const listSpecies = controller.species;
  const barcodeItems = createSpeciesBarcodeItems(listSpecies);
  const barcodeItemCount = barcodeItems.length;
  const syncPriceSpeciesIds = listSpecies.map(item => item.id);
  const syncPriceItemCount =
    controller.pagination.total || syncPriceSpeciesIds.length;
  const activeBarcodeItems = barcodeDialogItems ?? barcodeItems;
  const activeSyncPriceSpeciesIds =
    syncPriceSelection?.ids ?? syncPriceSpeciesIds;
  const activeSyncPriceItemCount =
    syncPriceSelection?.itemCount ?? syncPriceItemCount;
  const activeSyncStockSpeciesIds =
    syncStockSelection?.ids ?? syncPriceSpeciesIds;
  const activeSyncStockItemCount =
    syncStockSelection?.itemCount ?? syncPriceItemCount;
  const taxonomyFilterLabel =
    taxonomyFilter === 'all'
      ? 'Taksonomi'
      : controller.taxonomies.find(taxonomy => taxonomy.id === taxonomyFilter)
          ?.name ?? 'Taksonomi';
  const categoryFilterLabel =
    categoryFilter === 'all'
      ? 'Kategori'
      : controller.categories.find(category => category.id === categoryFilter)
          ?.name ?? 'Kategori';
  const stockFilterLabel = getSpeciesStockFilterLabel(stockFilter);

  const getFilterTriggerRef = (panel: SpeciesListFilterPanel) => {
    switch (panel) {
      case 'category':
        return categoryTriggerRef;
      case 'stock':
        return stockTriggerRef;
      case 'taxonomy':
      default:
        return taxonomyTriggerRef;
    }
  };

  const anchorFilterPanel = React.useCallback(
    (panel: SpeciesListFilterPanel) => {
      const panelWidth = panel === 'stock' ? 220 : SPECIES_FILTER_PANEL_WIDTH;
      measureFilterPanelAnchor(
        toolbarRef.current,
        getFilterTriggerRef(panel).current,
        panelWidth,
        setPanelAnchor,
      );
    },
    [],
  );

  const openFilterPanel = (panel: SpeciesListFilterPanel) => {
    setFilterPanelQuery('');
    if (activeFilterPanel === panel) {
      setActiveFilterPanel(null);
      setPanelAnchor(null);
      return;
    }
    setActiveFilterPanel(null);
    setPanelAnchor(null);
    const panelWidth = panel === 'stock' ? 220 : SPECIES_FILTER_PANEL_WIDTH;
    requestAnimationFrame(() => {
      measureFilterPanelAnchor(
        toolbarRef.current,
        getFilterTriggerRef(panel).current,
        panelWidth,
        anchor => {
          setPanelAnchor(anchor);
          setActiveFilterPanel(panel);
        },
      );
    });
  };
  const closeFilterPanel = () => {
    setActiveFilterPanel(null);
    setPanelAnchor(null);
    setFilterPanelQuery('');
  };

  React.useEffect(() => {
    if (!activeFilterPanel) {
      return;
    }
    requestAnimationFrame(() => anchorFilterPanel(activeFilterPanel));
  }, [activeFilterPanel, anchorFilterPanel]);

  return (
    <View style={[styles.stack, styles.listStack]}>
      <View
        ref={toolbarRef}
        collapsable={false}
        style={styles.speciesToolbarWrap}
      >
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <KolamSearchField
                containerStyle={kolamTableToolbarStyles.searchInput}
                onChangeText={controller.onSearchChange}
                placeholder="Cari"
                value={controller.filters.search}
              />
              <View ref={taxonomyTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'taxonomy' || taxonomyFilter !== 'all'
                  }
                  label={taxonomyFilterLabel}
                  onPress={() => openFilterPanel('taxonomy')}
                  open={activeFilterPanel === 'taxonomy'}
                  variant="quiet"
                />
              </View>
              <View ref={categoryTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'category' || categoryFilter !== 'all'
                  }
                  label={categoryFilterLabel}
                  onPress={() => openFilterPanel('category')}
                  open={activeFilterPanel === 'category'}
                  variant="quiet"
                />
              </View>
              <View ref={stockTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'stock' || stockFilter !== 'all'
                  }
                  label={stockFilterLabel}
                  onPress={() => openFilterPanel('stock')}
                  open={activeFilterPanel === 'stock'}
                  variant="quiet"
                />
              </View>
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              <KolamExportXlsButton
                label="Export"
                onPress={() => setExportDialogOpen(true)}
              />
              <KolamBarcodePrintButton
                disabled={!barcodeItemCount}
                label={`Cetak barcode (${barcodeItemCount})`}
                onPress={() => {
                  setBarcodeDialogItems(null);
                  setBarcodeDialogOpen(true);
                }}
              />
              <KolamButton
                disabled={!syncPriceItemCount || controller.loading}
                label="Sinkron Harga"
                onPress={() => {
                  setSyncPriceSelection(null);
                  setSyncPriceDialogOpen(true);
                }}
              />
              <KolamButton
                disabled={!syncPriceItemCount || controller.loading}
                label="Sinkron Stok"
                onPress={() => {
                  setSyncStockSelection(null);
                  setSyncStockDialogOpen(true);
                }}
              />
              <KolamButton
                intent="primary"
                label="Baru"
                tone="positive"
                onPress={() => {
                  controller.onCreateNew();
                  onRouteChange?.('/species/baru');
                }}
              />
            </View>
          </View>
        </View>
        {activeFilterPanel && panelAnchor ? (
          <SpeciesFilterOverlayPanel
            activePanel={activeFilterPanel}
            anchor={panelAnchor}
            categories={controller.categories}
            categoryFilter={categoryFilter}
            onCategoryChange={value => {
              controller.onChangeFilters({
                categoryId: value === 'all' ? '' : value,
              });
              closeFilterPanel();
            }}
            onClose={closeFilterPanel}
            onQueryChange={setFilterPanelQuery}
            onStockChange={value => {
              controller.onChangeFilters({ stockStatus: value });
              closeFilterPanel();
            }}
            onTaxonomyChange={value => {
              controller.onChangeFilters({
                taxonomyId: value === 'all' ? '' : value,
              });
              closeFilterPanel();
            }}
            query={filterPanelQuery}
            stockFilter={stockFilter}
            taxonomies={controller.taxonomies}
            taxonomyFilter={taxonomyFilter}
          />
        ) : null}
      </View>
      <KolamBarcodePrintDialog
        items={activeBarcodeItems}
        onOpenChange={open => {
          setBarcodeDialogOpen(open);
          if (!open) {
            setBarcodeDialogItems(null);
          }
        }}
        title="Cetak Barcode Species"
        visible={barcodeDialogOpen}
      />
      <KolamMarketplacePriceSyncDialog
        initialPlatforms={syncPriceSelection?.platforms}
        itemCount={activeSyncPriceItemCount}
        onOpenChange={open => {
          setSyncPriceDialogOpen(open);
          if (!open) {
            setSyncPriceSelection(null);
          }
        }}
        source="species"
        speciesIds={activeSyncPriceSpeciesIds}
        syncKind="price"
        title={
          syncPriceSelection?.title ?? 'Samakan Harga Species ke Marketplace'
        }
        visible={syncPriceDialogOpen}
      />
      <KolamMarketplacePriceSyncDialog
        initialPlatforms={syncStockSelection?.platforms}
        itemCount={activeSyncStockItemCount}
        onOpenChange={open => {
          setSyncStockDialogOpen(open);
          if (!open) {
            setSyncStockSelection(null);
          }
        }}
        source="species"
        speciesIds={activeSyncStockSpeciesIds}
        syncKind="stock"
        title={
          syncStockSelection?.title ?? 'Samakan Stok Species ke Marketplace'
        }
        visible={syncStockDialogOpen}
      />
      <KolamExportDialog
        catalogEndpoint="/species/export/fields"
        defaultPresetKey="basicTaxonomy"
        description="Pilih field yang ingin di-export ke XLSX. Filter list saat ini akan diterapkan."
        downloadEndpoint="/species/export.xlsx"
        downloadParams={{
          search: controller.filters.search.trim() || undefined,
          category: categoryFilter === 'all' ? undefined : [categoryFilter],
          taxonomy: taxonomyFilter === 'all' ? undefined : taxonomyFilterLabel,
          taxonomyId: taxonomyFilter === 'all' ? undefined : taxonomyFilter,
          stockStatus: stockFilter === 'all' ? undefined : stockFilter,
        }}
        filenameHint="species"
        onOpenChange={setExportDialogOpen}
        storageKey="export.species.v1"
        title="Export Species"
        visible={exportDialogOpen}
      />
      <KolamConfirmDialog
        confirmLabel="Duplikasi"
        message={
          'Yakin ingin menduplikasi species ' +
          (pendingAction?.species.displayName ?? '') +
          '? Entri baru akan dibuat dengan detail yang sama.'
        }
        onCancel={() => setPendingAction(null)}
        onConfirm={() => {
          const item = pendingAction?.species;
          if (!item) {
            return;
          }
          void controller.onDuplicateSpecies(item).then(ok => {
            if (ok) {
              setPendingAction(null);
            }
          });
        }}
        title="Duplikasi Species"
        visible={pendingAction?.type === 'duplicate'}
      />
      <KolamDeleteConfirmDialog
        itemLabel={pendingAction?.species.displayName}
        itemType="species"
        onCancel={() => setPendingAction(null)}
        onConfirm={() => {
          const item = pendingAction?.species;
          if (!item) {
            return;
          }
          void controller.onDeleteSpecies(item).then(ok => {
            if (ok) {
              setPendingAction(null);
            }
          });
        }}
        visible={pendingAction?.type === 'delete'}
      />
      {controller.syncPriceMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.syncPriceMessage}
          numberOfLines={2}
          style={styles.speciesSyncStatus}
        />
      ) : null}
      <KolamListTableComposition
        columns={listColumns}
        emptyTitle={
          controller.loading ? 'Memuat spesies...' : 'Belum ada spesies'
        }
        getRowKey={item => item.id}
        loading={controller.loading}
        pagination={{
          onPageChange: controller.onPageChange,
          page: safePage,
          pageSize: controller.pagination.limit,
          total: controller.pagination.total,
        }}
        renderActions={item => (
          <KolamSpeciesActionsMenu
            item={item}
            onBarcode={() => {
              setBarcodeDialogItems(createSpeciesBarcodeItems([item]));
              setBarcodeDialogOpen(true);
            }}
            onCopySku={() => void copyTextToClipboard(item.sku)}
            onDelete={() => setPendingAction({ species: item, type: 'delete' })}
            onDuplicate={() =>
              setPendingAction({ species: item, type: 'duplicate' })
            }
            onEdit={() => {
              void controller.onSelectSpecies(item, 'edit');
              onRouteChange?.(`${getSpeciesRoute(item)}/edit`);
            }}
            onSelect={() => {
              void controller.onSelectSpecies(item);
              onRouteChange?.(getSpeciesRoute(item));
            }}
            onSyncPrice={platforms => {
              setSyncPriceSelection({
                ids: [item.id],
                itemCount: 1,
                platforms,
                title:
                  'Samakan Harga ' +
                  getSpeciesActionName(item) +
                  ' ke Marketplace',
              });
              setSyncPriceDialogOpen(true);
            }}
            onSyncStock={platforms => {
              setSyncStockSelection({
                ids: [item.id],
                itemCount: 1,
                platforms,
                title:
                  'Samakan Stok ' +
                  getSpeciesActionName(item) +
                  ' ke Marketplace',
              });
              setSyncStockDialogOpen(true);
            }}
            onTogglePin={() => void controller.onTogglePin(item)}
          />
        )}
        rows={listSpecies}
        style={styles.speciesTableFrame}
      />
    </View>
  );
}

function SpeciesFilterOverlayPanel({
  activePanel,
  anchor,
  categories,
  categoryFilter,
  onCategoryChange,
  onClose,
  onQueryChange,
  onStockChange,
  onTaxonomyChange,
  query,
  stockFilter,
  taxonomies,
  taxonomyFilter,
}: {
  activePanel: SpeciesListFilterPanel;
  anchor: { left: number; top: number };
  categories: KolamSpeciesController['categories'];
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onStockChange: (value: KolamSpeciesStockStatus) => void;
  onTaxonomyChange: (value: string) => void;
  query: string;
  stockFilter: KolamSpeciesStockStatus;
  taxonomies: KolamSpeciesController['taxonomies'];
  taxonomyFilter: string;
}) {
  const normalizedQuery = normalizeSpeciesFilterQuery(query);
  const options =
    activePanel === 'taxonomy'
      ? [
          { label: 'Taksonomi', value: 'all' },
          ...taxonomies.map(taxonomy => ({
            label: taxonomy.name,
            value: taxonomy.id,
          })),
        ]
      : activePanel === 'category'
      ? [
          { label: 'Kategori', value: 'all' },
          ...categories.map(category => ({
            label: category.name,
            value: category.id,
          })),
        ]
      : [
          { label: 'Stok', value: 'all' },
          { label: 'Ada stok', value: 'in_stock' },
          { label: 'Stok habis', value: 'out_of_stock' },
        ];
  const filteredOptions = normalizedQuery
    ? options.filter(option =>
        normalizeSpeciesFilterQuery(option.label).includes(normalizedQuery),
      )
    : options;
  const selectedValue =
    activePanel === 'taxonomy'
      ? taxonomyFilter
      : activePanel === 'category'
      ? categoryFilter
      : stockFilter;
  const panelWidth = activePanel === 'stock' ? 220 : SPECIES_FILTER_PANEL_WIDTH;

  return (
    <View
      style={[
        styles.speciesFilterOverlayPanel,
        {
          left: anchor.left,
          top: anchor.top,
          width: panelWidth,
        },
      ]}
    >
      {activePanel === 'stock' ? null : (
        <KolamFormTextField
          onChangeText={onQueryChange}
          placeholder={
            activePanel === 'taxonomy'
              ? 'Cari taksonomi...'
              : 'Cari kategori...'
          }
          style={styles.speciesFilterPanelSearch}
          value={query}
        />
      )}
      <ScrollView
        contentContainerStyle={styles.speciesFilterPanelContent}
        keyboardShouldPersistTaps="handled"
        style={styles.speciesFilterPanelScroll}
      >
        {filteredOptions.length ? (
          filteredOptions.map(option => {
            const isSelected = option.value === selectedValue;
            return (
              <KolamButton
                intent={isSelected ? 'primary' : 'plain'}
                key={`${activePanel}-${option.value}`}
                label={option.label}
                onPress={() => {
                  if (activePanel === 'taxonomy') {
                    onTaxonomyChange(option.value);
                    return;
                  }

                  if (activePanel === 'category') {
                    onCategoryChange(option.value);
                    return;
                  }

                  onStockChange(option.value as KolamSpeciesStockStatus);
                }}
                style={styles.speciesFilterPanelOption}
              />
            );
          })
        ) : (
          <KolamCopyStack
            items={[
              {
                id: 'empty',
                text: 'Tidak ada pilihan.',
                style: styles.speciesFilterPanelEmpty,
              },
            ]}
          />
        )}
      </ScrollView>
      <View style={styles.speciesFilterPanelFooter}>
        <KolamButton label="Tutup" onPress={onClose} />
      </View>
    </View>
  );
}

function normalizeSpeciesFilterQuery(value: string) {
  return value.trim().toLowerCase();
}

function createSpeciesBarcodeItems(
  items: KolamSpecies[],
): KolamBarcodeLabelItem[] {
  return items
    .filter(item => item.sku.trim())
    .map(item => ({
      code: item.sku.trim(),
      id: item.id,
      name: item.scientificName || item.displayName,
      price: getSpeciesRootListPriceToSell(item),
    }));
}

function getSpeciesActionName(item: KolamSpecies) {
  return item.scientificName || item.displayName || item.sku || 'Species';
}

function getSpeciesStockFilterLabel(value: KolamSpeciesStockStatus) {
  switch (value) {
    case 'in_stock':
      return 'Ada stok';
    case 'out_of_stock':
      return 'Stok habis';
    case 'all':
    default:
      return 'Stok';
  }
}

function buildSpeciesListColumns(): Array<KolamListTableColumn<KolamSpecies>> {
  return [
    {
      flex: 1.7,
      id: 'primary',
      label: 'Species',
      render: item => <KolamSpeciesIdentityCell item={item} />,
    },
    {
      align: 'center',
      flex: 0.82,
      id: 'meta',
      label: 'SKU',
      render: item => <KolamSpeciesSkuCell item={item} />,
    },
    {
      align: 'center',
      flex: 0.92,
      id: 'amount',
      label: 'Harga',
      render: item => <KolamSpeciesPriceCell item={item} />,
    },
    {
      align: 'center',
      flex: 0.82,
      id: 'children',
      label: 'Stok',
      render: item => (
        <SpeciesListStockCell
          stock={getSpeciesListTotalStock(item)}
          unitLabel={item.unitLabel}
        />
      ),
    },
    {
      align: 'center',
      flex: 1.02,
      id: 'marketplace',
      label: 'Sync',
      render: item => (
        <SpeciesMarketplaceSyncListCell sync={item.marketplaceSync} />
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'notes',
      label: 'Info',
      render: item => (
        <SpeciesListInfoBadges
          hasVariants={
            item.hasVariants ||
            (Array.isArray(item.variants) && item.variants.length > 0)
          }
          sellable={item.sellable}
        />
      ),
    },
  ];
}

function KolamSpeciesIdentityCell({ item }: { item: KolamSpecies }) {
  return (
    <View style={styles.speciesTableIdentityCell}>
      <View style={styles.speciesThumb}>
        <KolamRemoteImage
          accessibilityLabel={`Foto ${item.displayName}`}
          resizeMode="cover"
          revision={item.updatedAt ?? item.thumbnailUri ?? item.id}
          scope="species"
          sourceUri={item.thumbnailUri}
          style={styles.speciesThumbImage}
        />
      </View>
      <KolamCopyStack
        containerStyle={styles.primaryCopy}
        items={[
          {
            id: 'name',
            text: item.scientificName || item.displayName || '-',
            style: styles.scientificName,
          },
        ]}
      />
    </View>
  );
}

function KolamSpeciesSkuCell({ item }: { item: KolamSpecies }) {
  if (item.sku) {
    return (
      <KolamBadge
        horizontalPadding={8}
        intent="secondary"
        label={item.sku}
        shape="square"
        style={styles.skuBadge}
      />
    );
  }

  return (
    <KolamCopyStack
      items={[
        {
          id: 'empty-sku',
          text: '-',
          style: styles.rowSubtext,
        },
      ]}
    />
  );
}

function KolamSpeciesPriceCell({ item }: { item: KolamSpecies }) {
  const priceLabel = getSpeciesListPriceLabel(item);

  return (
    <KolamCopyStack
      items={[
        {
          id: 'price',
          text: priceLabel,
          style: priceLabel.includes('\n')
            ? styles.rowTextCenterStack
            : styles.rowTextCenter,
          textProps: { numberOfLines: 2 },
        },
      ]}
    />
  );
}

function KolamSpeciesActionsMenu({
  item,
  onBarcode,
  onCopySku,
  onDelete,
  onDuplicate,
  onEdit,
  onSelect,
  onSyncPrice,
  onSyncStock,
  onTogglePin,
}: {
  item: KolamSpecies;
  onBarcode: () => void;
  onCopySku: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onSelect: () => void;
  onSyncPrice: (platforms: KolamMarketplacePlatform[]) => void;
  onSyncStock: (platforms: KolamMarketplacePlatform[]) => void;
  onTogglePin: () => void;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);

  return (
    <View style={actionMenuOpen ? styles.speciesActionMenuRaised : null}>
      <KolamOverflowMenuButton
        accessibilityLabel={`Menu ${item.displayName}`}
        onOpenChange={setActionMenuOpen}
        actions={[
          { label: 'Lihat', onPress: onSelect },
          { label: 'Rubah', onPress: onEdit },
          {
            label: 'Sinkron ke Tokopedia',
            onPress: () => onSyncStock(['tokopedia']),
          },
          {
            label: 'Sinkron ke Shopee',
            onPress: () => onSyncStock(['shopee']),
          },
          {
            label: 'Sinkron ke Keduanya',
            onPress: () => onSyncStock(['tokopedia', 'shopee']),
          },
          {
            label: 'Samakan harga ke Tokopedia',
            onPress: () => onSyncPrice(['tokopedia']),
          },
          {
            label: 'Samakan harga ke Shopee',
            onPress: () => onSyncPrice(['shopee']),
          },
          {
            label: 'Samakan harga ke Keduanya',
            onPress: () => onSyncPrice(['tokopedia', 'shopee']),
          },
          { disabled: !item.sku, label: 'Salin SKU', onPress: onCopySku },
          { disabled: !item.sku, label: 'Buat barcode', onPress: onBarcode },
          { label: 'Duplikasi data', onPress: onDuplicate },
          { label: item.isPinned ? 'Lepas Pin' : 'Pin', onPress: onTogglePin },
          { label: 'Hapus', onPress: onDelete, tone: 'danger' },
        ]}
      />
    </View>
  );
}

function SpeciesListInfoBadges({
  hasVariants,
  sellable,
}: {
  hasVariants: boolean;
  sellable: boolean;
}) {
  return (
    <View style={styles.infoBadgeRow}>
      <KolamHoverTooltip
        containerStyle={styles.infoTooltipWrap}
        label={hasVariants ? 'Memiliki varian' : 'Standard'}
      >
        <KolamBadge
          align="center"
          horizontalPadding={0}
          intent="outline"
          label={hasVariants ? 'V' : 'S'}
          shape="square"
          style={styles.infoMonoBadge}
          weight="900"
          width={24}
        />
      </KolamHoverTooltip>
      <KolamHoverTooltip
        containerStyle={styles.infoTooltipWrap}
        label={sellable ? 'Dapat dijual' : 'Tidak dapat dijual'}
      >
        <KolamBadge
          align="center"
          horizontalPadding={8}
          intent={sellable ? 'success' : 'muted'}
          label={sellable ? 'Jual' : 'Tidak dijual'}
          shape="square"
          style={styles.infoSellableBadge}
        />
      </KolamHoverTooltip>
    </View>
  );
}

function SpeciesListStockCell({
  stock,
  unitLabel,
}: {
  stock: number;
  unitLabel: string;
}) {
  if (stock <= 0) {
    return <KolamStatusBadge intent="danger" label="Stok habis" />;
  }
  return (
    <KolamCopyStack
      items={[
        {
          id: 'stock',
          text: `${formatNumber(stock)}${unitLabel ? ` ${unitLabel}` : ''}`,
          style: styles.rowTextCenter,
          textProps: { numberOfLines: 1 },
        },
      ]}
    />
  );
}

function SpeciesMarketplaceSyncListCell({
  sync,
}: {
  sync: KolamSpecies['marketplaceSync'];
}) {
  return (
    <KolamMarketplaceSyncPlatformList
      emptyText="Never synced"
      formatTime={formatRelativeTime}
      platforms={sync?.platforms ?? []}
      showTime
    />
  );
}
function KolamSpeciesForm({
  controller,
  onRouteChange,
}: {
  controller: KolamSpeciesController;
  onRouteChange?: (route: string) => void;
}) {
  const form = controller.form;
  const [deleteMediaTarget, setDeleteMediaTarget] =
    React.useState<SpeciesDeleteMediaTarget | null>(null);
  const [deleteVariantTarget, setDeleteVariantTarget] = React.useState<{
    id: string;
    label: string;
  } | null>(null);
  const categoryOptions = controller.categories.filter(
    category => !form.categoryIds.includes(category.id),
  );
  const selectedCategories = controller.categories.filter(category =>
    form.categoryIds.includes(category.id),
  );
  const tagOptions = controller.tags.filter(
    tag => !form.tagIds.includes(tag.id),
  );
  const selectedTags = controller.tags.filter(tag =>
    form.tagIds.includes(tag.id),
  );
  const hasVariants = form.variants.length > 0;
  const showRootOnlySections = !hasVariants;
  const showRootPricingSections = form.sellable && !hasVariants;

  return (
    <>
      <KolamNativeFormSection section={getKolamFormSection('species-detail')}>
        <View style={settingsWebFormStyles.settingsWebFormFields}>
          <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
            <SpeciesEditSection
              description="Masukkan informasi dasar tentang spesies."
              title="Informasi Dasar"
            >
              <View style={styles.speciesBasicInfoCard}>
                <View style={styles.twoColumnGrid}>
                  <FieldShell
                    label="Nama Ilmiah"
                    required
                    style={styles.speciesBasicInfoHalfField}
                  >
                    <KolamFormTextField
                      editable={!controller.saving}
                      onChangeText={scientificName =>
                        controller.onChangeForm({ scientificName })
                      }
                      placeholder="Contoh: Dendrobates tinctorius"
                      style={settingsWebFormStyles.settingsWebFormFieldValue}
                      value={form.scientificName}
                    />
                  </FieldShell>
                  <FieldShell
                    label="Judul Katalog"
                    style={styles.speciesBasicInfoHalfField}
                  >
                    <KolamFormTextField
                      editable={!controller.saving}
                      onChangeText={displayName =>
                        controller.onChangeForm({ displayName })
                      }
                      placeholder="Judul yang tampil di katalog"
                      style={settingsWebFormStyles.settingsWebFormFieldValue}
                      value={form.displayName}
                    />
                  </FieldShell>
                </View>
                <View style={styles.twoColumnGrid}>
                  <FieldShell
                    label="Nama Umum"
                    style={styles.speciesBasicInfoHalfField}
                  >
                    <KolamFormTextField
                      editable={!controller.saving}
                      onChangeText={commonName =>
                        controller.onChangeForm({ commonName })
                      }
                      placeholder="Nama umum"
                      style={settingsWebFormStyles.settingsWebFormFieldValue}
                      value={form.commonName}
                    />
                  </FieldShell>
                  <FieldShell
                    label="Nama Lokal"
                    style={styles.speciesBasicInfoHalfField}
                  >
                    <KolamFormTextField
                      editable={!controller.saving}
                      onChangeText={localName =>
                        controller.onChangeForm({ localName })
                      }
                      placeholder="Nama lokal"
                      style={settingsWebFormStyles.settingsWebFormFieldValue}
                      value={form.localName}
                    />
                  </FieldShell>
                </View>
                <FieldShell label="Taksonomi Genus" required>
                  <KolamDropdownSelect
                    accessibilityLabel="Pilih taksonomi genus"
                    label="Taksonomi Genus"
                    menuStyle={styles.longDropdownMenu}
                    onChange={taxonomyId =>
                      controller.onChangeForm({ taxonomyId })
                    }
                    options={[
                      { label: 'Pilih genus', value: '' },
                      ...controller.taxonomies.map(taxonomy => ({
                        label: taxonomy.name,
                        value: taxonomy.id,
                      })),
                    ]}
                    searchable
                    searchPlaceholder="Cari genus..."
                    showLabelInTrigger={false}
                    value={form.taxonomyId}
                  />
                </FieldShell>
                <View style={styles.twoColumnGrid}>
                  <FieldShell
                    label="Status"
                    style={styles.speciesBasicInfoHalfField}
                  >
                    <KolamDropdownSelect<KolamSpeciesStatus>
                      label="Status"
                      onChange={status => controller.onChangeForm({ status })}
                      options={[
                        { label: 'Aktif', value: 'active' },
                        { label: 'Nonaktif', value: 'inactive' },
                        { label: 'Draft', value: 'draft' },
                      ]}
                      showLabelInTrigger={false}
                      value={form.status}
                    />
                  </FieldShell>
                  <FieldShell
                    label="Kategori"
                    required
                    style={styles.speciesBasicInfoHalfField}
                  >
                    <View style={styles.categoryPickerStack}>
                      <KolamDropdownSelect
                        accessibilityLabel="Tambah kategori spesies"
                        label="Tambah Kategori"
                        menuStyle={styles.longDropdownMenu}
                        onChange={categoryId => {
                          if (
                            !categoryId ||
                            form.categoryIds.includes(categoryId)
                          ) {
                            return;
                          }

                          controller.onChangeForm({
                            categoryIds: [...form.categoryIds, categoryId],
                          });
                        }}
                        options={[
                          { label: 'Tambah kategori', value: '' },
                          ...categoryOptions.map(category => ({
                            label: `${'  '.repeat(category.level)}${category.name}`,
                            value: category.id,
                          })),
                        ]}
                        searchable
                        searchPlaceholder="Cari kategori..."
                        showLabelInTrigger={false}
                        value=""
                      />
                      <View style={styles.selectedCategoryRow}>
                        {selectedCategories.length ? (
                          selectedCategories.map(category => (
                            <KolamCategoryLabel
                              key={category.id}
                              label={`${category.name} x`}
                              onPress={() =>
                                controller.onChangeForm({
                                  categoryIds: form.categoryIds.filter(
                                    categoryId => categoryId !== category.id,
                                  ),
                                })
                              }
                            />
                          ))
                        ) : (
                          <KolamCopyStack
                            items={[
                              {
                                id: 'empty-category',
                                text: 'Belum ada kategori dipilih.',
                                style: styles.fieldHint,
                              },
                            ]}
                          />
                        )}
                      </View>
                    </View>
                  </FieldShell>
                </View>
              </View>
            </SpeciesEditSection>

            <SpeciesEditSection
              description="Pilih profil spesifikasi atau field manual untuk spesies ini."
              title="Field Kustom"
            >
              <SpeciesCustomFieldEditorPanel controller={controller} />
            </SpeciesEditSection>

            <SpeciesEditSection
              description="Aktifkan penjualan, isi SKU, satuan, dan metode pengiriman."
              title="Penjualan dan Inventori"
            >
              <FieldShell label="SKU">
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={sku => controller.onChangeForm({ sku })}
                  placeholder="SKU"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.sku}
                />
              </FieldShell>
              <SpeciesRootSalesPanel controller={controller} />
              {showRootOnlySections ? (
                <SpeciesRootInventoryPanel controller={controller} />
              ) : null}
            </SpeciesEditSection>

            <SpeciesEditSection
              description="Aktifkan varian jika spesies memiliki variasi ukuran, warna, grade, atau beberapa SKU."
              title="Varian"
            >
              <SpeciesVariantEditorPanel
                controller={controller}
                onDeleteMedia={setDeleteMediaTarget}
                onDeleteVariant={setDeleteVariantTarget}
              />
            </SpeciesEditSection>

            {showRootOnlySections ? (
              <SpeciesEditSection
                description="Komponen produksi untuk spesies tanpa varian."
                title="Bahan Penyusun"
              >
                <SpeciesRootComponentsPanel controller={controller} />
              </SpeciesEditSection>
            ) : null}

            {showRootPricingSections ? (
              <SpeciesEditSection
                description="Harga jual dan harga bertingkat untuk spesies tanpa varian."
                title="Harga"
              >
                <SpeciesRootPricingPanel controller={controller} />
                <SpeciesGrocerPricingPanel
                  disabled={controller.saving}
                  hint="Harga per unit berdasarkan jumlah pembelian. Berlaku untuk spesies tanpa varian; jika varian aktif, harga bertingkat diatur per varian."
                  onChange={grocerPricingTiers =>
                    controller.onChangeForm({ grocerPricingTiers })
                  }
                  rows={form.grocerPricingTiers}
                  title="Harga Bertingkat / Grosir Spesies"
                />
              </SpeciesEditSection>
            ) : null}

            <SpeciesEditSection
              description={
                form.sellable && !hasVariants
                  ? 'Poin anggota dan komisi transaksi spesies.'
                  : 'Komisi transaksi spesies.'
              }
              title={
                form.sellable && !hasVariants
                  ? 'Komisi dan Poin Anggota'
                  : 'Komisi'
              }
            >
              <SpeciesCommercialPolicyPanel
                disabled={controller.saving}
                memberPointsDisabled={!form.sellable || hasVariants}
                memberPointsHint={
                  hasVariants
                    ? 'Spesies ini memakai varian. Poin anggota diatur di tiap varian.'
                    : form.sellable
                    ? 'Poin yang didapat pelanggan per unit spesies.'
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
                title={
                  form.sellable && !hasVariants
                    ? 'Komisi dan Poin Anggota Spesies'
                    : 'Komisi Spesies'
                }
                value={{
                  commissionEnabled: form.commissionEnabled,
                  commissionType: form.commissionType,
                  commissionValue: form.commissionValue,
                  memberPointsEnabled: form.memberPointsEnabled,
                  memberPoints: form.memberPoints,
                }}
              />
            </SpeciesEditSection>

            {showRootOnlySections ? (
              <SpeciesEditSection
                description="Harga beli pemasok, ongkir, dan total HPP."
                title="Harga Supplier"
              >
                <SpeciesRootVendorPricesEditor controller={controller} />
              </SpeciesEditSection>
            ) : null}

            {showRootOnlySections ? (
              <SpeciesEditSection
                description="Berat, dimensi, dan informasi logistik spesies tanpa varian."
                title="Logistik"
              >
                <SpeciesRootLogisticsPanel controller={controller} />
              </SpeciesEditSection>
            ) : null}

            <SpeciesEditSection
              description="Opsional: tautan marketplace, website, POS, atau referensi."
              title="Tautan Eksternal"
            >
              <SpeciesExternalLinksEditor controller={controller} />
            </SpeciesEditSection>

            <SpeciesEditSection
              description="Terjemahan katalog untuk webstore dan audit konten."
              title="Terjemahan"
            >
              <KolamCatalogTranslationsEditor
                editable={!controller.saving}
                kind="species"
                onChange={translations =>
                  controller.onChangeForm({ translations })
                }
                primarySpeciesLocale={{
                  commonName: form.commonName,
                  localName: form.localName,
                  shortDescription: form.shortDescription,
                  description: form.description,
                  morfologis: form.morfologis,
                  habitat: form.habitat,
                  distribution: form.distribution,
                  onChange: patch => controller.onChangeForm(patch),
                }}
                translations={form.translations}
              />
            </SpeciesEditSection>

            <SpeciesEditSection
              description="Judul, kata kunci, dan deskripsi SEO Google."
              title="SEO Google"
            >
              <SpeciesSeoEditPanel controller={controller} />
            </SpeciesEditSection>

            <SpeciesEditSection
              description="Foto, video, thumbnail, audio, dan media per varian."
              title="Media"
            >
              <SpeciesMediaEditPanel
                controller={controller}
                onDelete={setDeleteMediaTarget}
              />
            </SpeciesEditSection>

            <SpeciesEditSection
              description="Status konservasi Daftar Merah IUCN dan tautannya."
              title="Konservasi"
            >
              <View style={styles.twoColumnGrid}>
                <FieldShell label="IUCN">
                  <KolamDropdownSelect
                    accessibilityLabel="Pilih status IUCN"
                    label="IUCN"
                    menuStyle={styles.longDropdownMenu}
                    onChange={iucnStatusId =>
                      controller.onChangeForm({ iucnStatusId })
                    }
                    options={[
                      { label: 'Tanpa IUCN', value: '' },
                      ...controller.iucnStatuses.map(status => ({
                        label: `${status.abbreviation} - ${status.name}`,
                        value: status.id,
                      })),
                    ]}
                    searchable
                    searchPlaceholder="Cari IUCN..."
                    showLabelInTrigger={false}
                    value={form.iucnStatusId}
                  />
                </FieldShell>
                <FieldShell label="Tautan IUCN">
                  <KolamFormTextField
                    editable={!controller.saving}
                    mode="url"
                    onChangeText={iucnLink =>
                      controller.onChangeForm({ iucnLink })
                    }
                    placeholder="Tautan IUCN"
                    style={settingsWebFormStyles.settingsWebFormFieldValue}
                    value={form.iucnLink}
                  />
                </FieldShell>
              </View>
            </SpeciesEditSection>

            <SpeciesEditSection
              description="Tag untuk filter internal, pengelompokan, dan SEO."
              title="Informasi Tambahan"
            >
              <FieldShell label="Tag">
                <View style={styles.categoryPickerStack}>
                  <KolamDropdownSelect
                    accessibilityLabel="Tambah tag spesies"
                    label="Tambah Tag"
                    menuStyle={styles.longDropdownMenu}
                    onChange={tagId => {
                      if (!tagId || form.tagIds.includes(tagId)) {
                        return;
                      }

                      controller.onChangeForm({
                        tagIds: [...form.tagIds, tagId],
                      });
                    }}
                    options={[
                      { label: 'Tambah tag', value: '' },
                      ...tagOptions.map(tag => ({
                        label: tag.name,
                        value: tag.id,
                      })),
                    ]}
                    searchable
                    searchPlaceholder="Cari tag..."
                    showLabelInTrigger={false}
                    value=""
                  />
                  <View style={styles.selectedCategoryRow}>
                    {selectedTags.length ? (
                      selectedTags.map(tag => (
                        <KolamButton
                          intent="outline"
                          key={tag.id}
                          label={`${tag.name} x`}
                          onPress={() =>
                            controller.onChangeForm({
                              tagIds: form.tagIds.filter(
                                tagId => tagId !== tag.id,
                              ),
                            })
                          }
                          style={styles.selectedCategoryButton}
                        />
                      ))
                    ) : (
                      <KolamCopyStack
                        items={[
                          {
                            id: 'empty-tag',
                            text: 'Belum ada tag dipilih.',
                            style: styles.fieldHint,
                          },
                        ]}
                      />
                    )}
                  </View>
                </View>
              </FieldShell>
            </SpeciesEditSection>

            <SpeciesEditSection
              description="Template syarat dan ketentuan aktif untuk spesies."
              title="Syarat dan Ketentuan"
            >
              <SpeciesTermsTemplatesSummaryPanel controller={controller} />
            </SpeciesEditSection>

            <SpeciesEditSection
              description="Produk atau spesies yang terhubung sebagai informasi tambahan."
              title="Item Terlampir"
            >
              <SpeciesAttachedItemsEditPanel controller={controller} />
            </SpeciesEditSection>

            <SpeciesEditSection
              description="Dokumen dan file pendukung spesies."
              title="Aset"
            >
              <SpeciesEditAssetsPanel controller={controller} />
            </SpeciesEditSection>

            <SpeciesEditSection
              description="Bahan kemasan yang terhubung ke spesies atau varian."
              title="Bahan Kemasan"
            >
              <SpeciesPackingLinksPanel controller={controller} />
            </SpeciesEditSection>
          </View>
        </View>
      </KolamNativeFormSection>
      <KolamDeleteConfirmDialog
        itemLabel={deleteVariantTarget?.label}
        itemType="varian spesies"
        onCancel={() => setDeleteVariantTarget(null)}
        onConfirm={() => {
          if (!deleteVariantTarget) {
            return;
          }

          removeSpeciesVariantRow(controller, deleteVariantTarget.id);
          setDeleteVariantTarget(null);
        }}
        visible={!!deleteVariantTarget}
      />
      <KolamDeleteConfirmDialog
        itemLabel={deleteMediaTarget?.label}
        itemType="media spesies"
        onCancel={() => setDeleteMediaTarget(null)}
        onConfirm={() => {
          const target = deleteMediaTarget;
          if (!target) {
            return;
          }

          const action = createDeleteMediaAction(controller, target);

          void action.then(success => {
            if (success) {
              setDeleteMediaTarget(null);
            }
          });
        }}
        visible={!!deleteMediaTarget}
      />
    </>
  );
}

function SpeciesEditSection({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <KolamContentFrame
      style={styles.speciesEditSection}
      variant="settingsWebConfig"
    >
      <KolamCopyStack
        containerStyle={styles.speciesEditSectionHeader}
        items={[
          { id: 'title', text: title, style: styles.speciesEditSectionTitle },
          ...(description
            ? [
                {
                  id: 'description',
                  text: description,
                  style: styles.speciesEditSectionDescription,
                },
              ]
            : []),
        ]}
      />
      <View style={styles.speciesEditSectionBody}>{children}</View>
    </KolamContentFrame>
  );
}

function SpeciesExternalLinksRowsEditor({
  disabled,
  emptyText = 'Belum ada tautan eksternal.',
  links,
  onChange,
}: {
  disabled: boolean;
  emptyText?: string;
  links: KolamSpeciesExternalLinkFormRow[];
  onChange: (links: KolamSpeciesExternalLinkFormRow[]) => void;
}) {
  const updateRow = (
    index: number,
    patch: Partial<KolamSpeciesExternalLinkFormRow>,
  ) => {
    onChange(
      links.map((link, linkIndex) =>
        linkIndex === index ? { ...link, ...patch } : link,
      ),
    );
  };
  const removeRow = (index: number) => {
    onChange(links.filter((_, linkIndex) => linkIndex !== index));
  };
  const addRow = () => {
    onChange([...links, { name: '', value: '' }]);
  };

  return (
    <View style={styles.externalLinksStack}>
      {links.length ? (
        links.map((link, index) => (
          <View key={`${index}-${link.name}`} style={styles.externalLinkRow}>
            <KolamDropdownSelect<KolamSpeciesLinkName | ''>
              accessibilityLabel={`Tipe tautan ${index + 1}`}
              label="Tipe tautan"
              onChange={name => updateRow(index, { name })}
              options={SPECIES_EXTERNAL_LINK_OPTIONS}
              showLabelInTrigger={false}
              value={link.name}
            />
            <KolamFormTextField
              editable={!disabled}
              mode="url"
              onChangeText={value => updateRow(index, { value })}
              placeholder="https://contoh.com"
              style={[
                settingsWebFormStyles.settingsWebFormFieldValue,
                styles.externalLinkInput,
              ]}
              value={link.value}
            />
            <KolamButton
              disabled={disabled}
              intent="danger"
              label="Hapus"
              onPress={() => removeRow(index)}
              style={styles.externalLinkRemoveButton}
            />
          </View>
        ))
      ) : (
        <KolamCopyStack
          items={[
            {
              id: 'empty-links',
              text: emptyText,
              style: styles.fieldHint,
            },
          ]}
        />
      )}
      <KolamButton
        disabled={disabled}
        intent="secondary"
        label="Tambah tautan"
        onPress={addRow}
        style={styles.externalLinkAddButton}
      />
    </View>
  );
}

function SpeciesExternalLinksEditor({
  controller,
}: {
  controller: KolamSpeciesController;
}) {
  return (
    <FieldShell label="Tautan Eksternal">
      <SpeciesExternalLinksRowsEditor
        disabled={controller.saving}
        links={controller.form.externalLinks}
        onChange={externalLinks => controller.onChangeForm({ externalLinks })}
      />
    </FieldShell>
  );
}
function SpeciesMediaEditPanel({
  controller,
  onDelete,
}: {
  controller: KolamSpeciesController;
  onDelete: (target: SpeciesDeleteMediaTarget) => void;
}) {
  const selectedSpecies = controller.selectedSpecies;

  return (
    <FieldShell label="Media Spesies">
      <View style={styles.mediaPickerStack}>
        <View style={styles.mediaPickerRow}>
          <KolamFormTextField
            editable={false}
            mode="url"
            placeholder="Pilih thumbnail dari komputer"
            style={[
              settingsWebFormStyles.settingsWebFormFieldValue,
              styles.mediaPickerInput,
            ]}
            value={controller.form.thumbnailLocalUri}
          />
          <KolamButton
            disabled={controller.saving}
            label="Pilih Thumbnail"
            onPress={() => {
              void controller.onPickThumbnail();
            }}
          />
        </View>
        <View style={styles.mediaPickerRow}>
          <KolamFormTextField
            editable={false}
            mode="url"
            placeholder="Pilih foto untuk ditambahkan"
            style={[
              settingsWebFormStyles.settingsWebFormFieldValue,
              styles.mediaPickerInput,
            ]}
            value={controller.form.photoLocalUri}
          />
          <KolamButton
            disabled={controller.saving}
            label="Tambah Foto"
            onPress={() => {
              void controller.onPickPhoto();
            }}
          />
        </View>
        <View style={styles.mediaPickerRow}>
          <KolamFormTextField
            editable={false}
            mode="url"
            placeholder="Pilih video untuk ditambahkan"
            style={[
              settingsWebFormStyles.settingsWebFormFieldValue,
              styles.mediaPickerInput,
            ]}
            value={controller.form.videoLocalUri}
          />
          <KolamButton
            disabled={controller.saving}
            label="Tambah Video"
            onPress={() => {
              void controller.onPickVideo();
            }}
          />
        </View>
        <View style={styles.mediaPickerRow}>
          <KolamFormTextField
            editable={false}
            mode="url"
            placeholder="Pilih audio spesies"
            style={[
              settingsWebFormStyles.settingsWebFormFieldValue,
              styles.mediaPickerInput,
            ]}
            value={controller.form.voiceLocalUri}
          />
          <KolamButton
            disabled={controller.saving}
            label="Pilih Audio"
            onPress={() => {
              void controller.onPickVoice();
            }}
          />
        </View>
        <KolamCopyStack
          items={[
            {
              id: 'media-note',
              text: 'Media dikirim ke backend saat Simpan, lalu detail dan cache lokal diperbarui.',
              style: styles.fieldHint,
            },
          ]}
        />
        {selectedSpecies?.thumbnailUri || selectedSpecies?.photoUris.length ? (
          <View style={styles.existingMediaGrid}>
            {selectedSpecies.thumbnailUri ? (
              <View style={styles.existingMediaItem}>
                <KolamRemoteImage
                  accessibilityLabel="Thumbnail spesies"
                  resizeMode="cover"
                  revision={
                    selectedSpecies.updatedAt ?? selectedSpecies.thumbnailUri
                  }
                  scope="species"
                  sourceUri={selectedSpecies.thumbnailUri}
                  style={styles.existingMediaImage}
                />
                <KolamButton
                  disabled={controller.saving}
                  intent="danger"
                  label="Hapus Thumbnail"
                  onPress={() =>
                    onDelete({
                      type: 'thumbnail',
                      label: 'thumbnail spesies',
                    })
                  }
                  style={styles.mediaDeleteButton}
                />
              </View>
            ) : null}
            {selectedSpecies.photoUris.map((photoUri, index) => (
              <SpeciesImageMediaCard
                accessibilityLabel={`Foto spesies ${index + 1}`}
                disabled={controller.saving}
                key={`${photoUri}-${index}`}
                onDelete={() =>
                  onDelete({
                    type: 'photo',
                    index,
                    label: `foto ${index + 1}`,
                  })
                }
                onMoveDown={() => {
                  void controller.onReorderPhoto(index, 'down');
                }}
                onMoveUp={() => {
                  void controller.onReorderPhoto(index, 'up');
                }}
                revision={`${selectedSpecies.updatedAt ?? ''}-${index}`}
                showMoveDown={index < selectedSpecies.photoUris.length - 1}
                showMoveUp={index > 0}
                sourceUri={photoUri}
                deleteLabel={`Hapus Foto ${index + 1}`}
              />
            ))}
          </View>
        ) : null}
        <SpeciesVideoVoiceMediaPanel
          controller={controller}
          onDelete={onDelete}
        />
      </View>
    </FieldShell>
  );
}
function SpeciesRootSalesPanel({
  controller,
}: {
  controller: KolamSpeciesController;
}) {
  const form = controller.form;
  const unitOptions = [
    { label: 'Pilih satuan', value: '' },
    ...controller.units.map(unit => ({
      label: unit.initial ? `${unit.name} (${unit.initial})` : unit.name,
      value: unit.id,
    })),
  ];
  const shippingMethods = mergeSpeciesShippingMethods(
    controller.shippingMethods,
    controller.selectedSpecies?.availableShippingMethods ?? [],
  );
  const shippingOptions = [
    { label: 'Tambah metode pengiriman', value: '' },
    ...shippingMethods
      .filter(method => !form.availableShippingMethodIds.includes(method.id))
      .map(method => ({ label: method.displayName, value: method.id })),
  ];
  const selectedMethods = shippingMethods.filter(method =>
    form.availableShippingMethodIds.includes(method.id),
  );

  return (
    <FieldShell label="Penjualan dan Satuan">
      <View style={styles.grocerPricingPanel}>
        <View style={styles.twoColumnGrid}>
          <View style={styles.inlineFieldGroup}>
            <View style={styles.sellableSwitchRow}>
              <KolamCopyStack
                items={[
                  {
                    id: 'label',
                    text: 'Spesies dijual',
                    style: styles.variantTitle,
                  },
                ]}
              />
              <KolamSwitch
                accessibilityLabel="Spesies dijual"
                active={form.sellable}
                disabled={controller.saving}
                onPress={() =>
                  controller.onChangeForm({ sellable: !form.sellable })
                }
              />
            </View>
          </View>
          <View style={styles.inlineFieldGroup}>
            <KolamDropdownSelect
              accessibilityLabel="Pilih satuan"
              label="Satuan"
              menuStyle={styles.longDropdownMenu}
              onChange={unitId => controller.onChangeForm({ unitId })}
              options={unitOptions}
              searchable
              searchPlaceholder="Cari satuan..."
              showLabelInTrigger={false}
              value={form.unitId}
            />
          </View>
        </View>
        <KolamDropdownSelect
          accessibilityLabel="Tambah metode pengiriman"
          label="Metode pengiriman tersedia"
          menuStyle={styles.longDropdownMenu}
          onChange={methodId => {
            if (
              !methodId ||
              form.availableShippingMethodIds.includes(methodId)
            ) {
              return;
            }
            controller.onChangeForm({
              availableShippingMethodIds: [
                ...form.availableShippingMethodIds,
                methodId,
              ],
            });
          }}
          options={shippingOptions}
          searchable
          searchPlaceholder="Cari metode pengiriman..."
          showLabelInTrigger={false}
          value=""
        />
        <View style={styles.selectedCategoryRow}>
          {selectedMethods.length ? (
            selectedMethods.map(method => (
              <KolamButton
                intent="outline"
                key={method.id}
                label={`${method.displayName} x`}
                onPress={() =>
                  controller.onChangeForm({
                    availableShippingMethodIds:
                      form.availableShippingMethodIds.filter(
                        methodId => methodId !== method.id,
                      ),
                  })
                }
                style={styles.selectedCategoryButton}
              />
            ))
          ) : (
            <KolamCopyStack
              items={[
                {
                  id: 'empty-shipping',
                  text: 'Belum ada metode pengiriman dipilih atau daftar metode belum tersedia dari detail/cache.',
                  style: styles.fieldHint,
                },
              ]}
            />
          )}
        </View>
      </View>
    </FieldShell>
  );
}

function SpeciesPriceInput({
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
          ...(hint
            ? [{ id: 'hint', text: hint, style: styles.priceInputHint }]
            : []),
        ]}
      />
      <View style={styles.priceInputRow}>
        <KolamFormTextField
          editable={!disabled}
          keyboardType="numeric"
          onChangeText={onChangeText}
          placeholder={placeholder ?? label}
          style={[
            settingsWebFormStyles.settingsWebFormFieldValue,
            styles.priceInputControl,
          ]}
          value={value}
        />
        {unitLabel ? (
          <View style={styles.priceUnitBadge}>
            <KolamCopyStack
              items={[
                {
                  id: 'unit',
                  text: unitLabel,
                  style: styles.priceUnitBadgeText,
                },
              ]}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function SpeciesRootPricingPanel({
  controller,
}: {
  controller: KolamSpeciesController;
}) {
  const form = controller.form;
  const selectedUnit = controller.units.find(unit => unit.id === form.unitId);
  const unitLabel = selectedUnit?.initial || selectedUnit?.name || '';

  return (
    <FieldShell label="Harga Spesies">
      <View style={styles.pricingPanelStack}>
        <SpeciesVariantFieldPanel
          description="Harga yang dipakai katalog, POS, toko daring, dan pembanding lokapasar."
          title="Harga Penjualan"
        >
          <View style={styles.twoColumnGrid}>
            <SpeciesPriceInput
              disabled={controller.saving}
              hint="Harga utama yang tampil di katalog dan POS."
              label="Harga Jual"
              onChangeText={priceToSell =>
                controller.onChangeForm({ priceToSell })
              }
              unitLabel={unitLabel}
              value={form.priceToSell}
            />
            <SpeciesPriceInput
              disabled={controller.saving}
              hint="Harga daring untuk toko daring atau kanal digital."
              label="Harga Daring"
              onChangeText={onlinePrice =>
                controller.onChangeForm({ onlinePrice })
              }
              unitLabel={unitLabel}
              value={form.onlinePrice}
            />
            <SpeciesPriceInput
              disabled={controller.saving}
              hint="Harga pembanding pasar, bukan harga jual utama."
              label="Harga Pasar"
              onChangeText={marketPrice =>
                controller.onChangeForm({ marketPrice })
              }
              unitLabel={unitLabel}
              value={form.marketPrice}
            />
            <SpeciesPriceInput
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
        </SpeciesVariantFieldPanel>

        <SpeciesVariantFieldPanel
          description="Aturan jumlah minimum saat item dibeli."
          title="Aturan Pesanan"
        >
          <View style={styles.twoColumnGrid}>
            <SpeciesPriceInput
              disabled={controller.saving}
              hint="Jumlah minimum per transaksi."
              label="Minimum Pesanan"
              onChangeText={minimumOrderQty =>
                controller.onChangeForm({ minimumOrderQty })
              }
              value={form.minimumOrderQty}
            />
          </View>
        </SpeciesVariantFieldPanel>
      </View>
    </FieldShell>
  );
}

function SpeciesRootInventoryPanel({
  controller,
}: {
  controller: KolamSpeciesController;
}) {
  const form = controller.form;

  return (
    <FieldShell label="Inventori Spesies">
      <View style={styles.pricingPanelStack}>
        <SpeciesVariantFieldPanel
          description="Stok awal dan batas peringatan stok rendah untuk spesies tanpa varian."
          title="Stok dan Peringatan"
        >
          <View style={styles.twoColumnGrid}>
            <SpeciesPriceInput
              disabled={controller.saving}
              hint="Stok awal saat spesies dibuat atau disunting."
              label="Stok Awal"
              onChangeText={stock => controller.onChangeForm({ stock })}
              value={form.stock}
            />
            <SpeciesPriceInput
              disabled={controller.saving}
              hint="Aplikasi memberi tanda saat stok mencapai angka ini."
              label="Ambang Stok Rendah"
              onChangeText={lowStockThreshold =>
                controller.onChangeForm({ lowStockThreshold })
              }
              value={form.lowStockThreshold}
            />
          </View>
        </SpeciesVariantFieldPanel>
      </View>
    </FieldShell>
  );
}
function SpeciesRootVendorPricesEditor({
  controller,
}: {
  controller: KolamSpeciesController;
}) {
  const form = controller.form;
  const vendorOptions = [
    { label: 'Pilih pemasok', value: '' },
    ...controller.vendors.map(vendor => ({
      label: vendor.name,
      value: vendor.id,
    })),
  ];

  return (
    <FieldShell label="Harga Pemasok / HPP Utama">
      <View style={styles.vendorPricePanel}>
        <View style={styles.variantEditorHeader}>
          <KolamCopyStack
            items={[
              {
                id: 'hint',
                text: 'Harga beli pemasok untuk spesies tanpa varian. Ongkir mengikuti data PO jika tersedia.',
                style: styles.fieldHint,
              },
            ]}
          />
          <KolamButton
            disabled={controller.saving}
            intent="primary"
            label="Tambah Pemasok"
            onPress={() =>
              controller.onChangeForm({
                vendorPrices: [
                  ...form.vendorPrices,
                  createEmptyKolamSpeciesVendorPriceFormRow(),
                ],
              })
            }
          />
        </View>
        {form.vendorPrices.length ? (
          form.vendorPrices.map((row, index) => (
            <SpeciesRootVendorPriceRow
              controller={controller}
              index={index}
              key={row.id}
              row={row}
              vendorOptions={vendorOptions}
            />
          ))
        ) : (
          <KolamCopyStack
            items={[
              {
                id: 'empty-root-vendor',
                text: 'Belum ada harga pemasok untuk spesies utama.',
                style: styles.fieldHint,
              },
            ]}
          />
        )}
      </View>
    </FieldShell>
  );
}

function SpeciesRootVendorPriceRow({
  controller,
  index,
  row,
  vendorOptions,
}: {
  controller: KolamSpeciesController;
  index: number;
  row: KolamSpeciesVendorPriceFormRow;
  vendorOptions: Array<{ label: string; value: string }>;
}) {
  const patchRow = (patch: Partial<KolamSpeciesVendorPriceFormRow>) => {
    controller.onChangeForm({
      vendorPrices: controller.form.vendorPrices.map(item =>
        item.id === row.id ? { ...item, ...patch } : item,
      ),
    });
  };
  const totalCost =
    parseCurrencyInput(row.price) + parseCurrencyInput(row.shippingCost);

  return (
    <View style={styles.vendorPriceRow}>
      <View style={styles.variantEditorHeader}>
        <KolamCopyStack
          items={[
            { id: 'title', text: `Vendor ${index + 1}`, style: styles.rowText },
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
            controller.onChangeForm({
              vendorPrices: controller.form.vendorPrices.filter(
                item => item.id !== row.id,
              ),
            })
          }
        />
      </View>
      <View style={styles.twoColumnGrid}>
        <KolamDropdownSelect
          label="Vendor"
          menuStyle={styles.longDropdownMenu}
          onChange={vendorId => patchRow({ vendorId })}
          options={vendorOptions}
          searchable
          searchPlaceholder="Cari pemasok..."
          showLabelInTrigger={false}
          value={row.vendorId}
        />
        <KolamFormTextField
          editable={!controller.saving}
          mode="url"
          onChangeText={link => patchRow({ link })}
          placeholder="Tautan produk pemasok"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={row.link}
        />
      </View>
      <View style={styles.threeColumnGrid}>
        <KolamFormTextField
          editable={!controller.saving}
          keyboardType="numeric"
          onChangeText={price => patchRow({ price })}
          placeholder="Harga beli pemasok"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={row.price}
        />
        <KolamFormTextField
          editable={!controller.saving}
          keyboardType="numeric"
          onChangeText={shippingCost => patchRow({ shippingCost })}
          placeholder="Ongkir / unit"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={row.shippingCost}
        />
        <KolamFormTextField
          editable={false}
          placeholder="Total HPP"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={formatCurrency(totalCost)}
        />
      </View>
    </View>
  );
}

function SpeciesRootLogisticsPanel({
  controller,
}: {
  controller: KolamSpeciesController;
}) {
  const form = controller.form;
  const unitOptions = [
    { label: 'Pilih satuan', value: '' },
    ...controller.units.map(unit => ({
      label: unit.initial ? `${unit.name} (${unit.initial})` : unit.name,
      value: unit.id,
    })),
  ];

  return (
    <FieldShell label="Berat dan Dimensi Root">
      <View style={styles.grocerPricingPanel}>
        <View style={styles.twoColumnGrid}>
          <View style={styles.inlineFieldGroup}>
            <KolamFormTextField
              editable={!controller.saving}
              keyboardType="numeric"
              onChangeText={weightValue =>
                controller.onChangeForm({ weightValue })
              }
              placeholder="Berat"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={form.weightValue}
            />
            <KolamDropdownSelect
              label="Satuan berat"
              menuStyle={styles.longDropdownMenu}
              onChange={weightUnitId =>
                controller.onChangeForm({ weightUnitId })
              }
              options={unitOptions}
              searchable
              searchPlaceholder="Cari satuan..."
              showLabelInTrigger={false}
              value={form.weightUnitId}
            />
          </View>
          <View style={styles.inlineFieldGroup}>
            <View style={styles.dimensionTriplet}>
              <KolamFormTextField
                editable={!controller.saving}
                keyboardType="numeric"
                onChangeText={dimensionLength =>
                  controller.onChangeForm({ dimensionLength })
                }
                placeholder="P"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.dimensionLength}
              />
              <KolamFormTextField
                editable={!controller.saving}
                keyboardType="numeric"
                onChangeText={dimensionWidth =>
                  controller.onChangeForm({ dimensionWidth })
                }
                placeholder="L"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.dimensionWidth}
              />
              <KolamFormTextField
                editable={!controller.saving}
                keyboardType="numeric"
                onChangeText={dimensionHeight =>
                  controller.onChangeForm({ dimensionHeight })
                }
                placeholder="T"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.dimensionHeight}
              />
            </View>
            <KolamDropdownSelect
              label="Satuan dimensi"
              menuStyle={styles.longDropdownMenu}
              onChange={dimensionUnitId =>
                controller.onChangeForm({ dimensionUnitId })
              }
              options={unitOptions}
              searchable
              searchPlaceholder="Cari satuan..."
              showLabelInTrigger={false}
              value={form.dimensionUnitId}
            />
          </View>
        </View>
      </View>
    </FieldShell>
  );
}

function SpeciesRootComponentsPanel({
  controller,
}: {
  controller: KolamSpeciesController;
}) {
  return (
    <FieldShell label="Bahan Penyusun Root">
      <View style={styles.grocerPricingPanel}>
        <KolamComponentOverridesEditor
          disabled={controller.saving}
          onChange={componentRows => controller.onChangeForm({ componentRows })}
          products={controller.rawMaterialProducts}
          rows={controller.form.componentRows}
        />
      </View>
    </FieldShell>
  );
}

function SpeciesCustomFieldEditorPanel({
  controller,
}: {
  controller: KolamSpeciesController;
}) {
  const fields = React.useMemo(
    () => getActiveSpeciesCustomFields(controller.customFields),
    [controller.customFields],
  );

  return (
    <View style={[styles.speciesBasicInfoCard, styles.customFieldSettingsCard]}>
      <SpeciesCustomFieldRowsEditor
        disabled={controller.saving}
        emptyText="Belum ada definisi field kustom aktif."
        fields={fields}
        profiles={controller.customFieldProfiles}
        rows={controller.form.customFieldValues}
        units={controller.units}
        onChange={customFieldValues =>
          controller.onChangeForm({ customFieldValues })
        }
      />
    </View>
  );
}

function getActiveSpeciesCustomFields(fields: KolamCustomField[]) {
  return fields
    .filter(field => field.status === 'active')
    .slice()
    .sort(
      (left, right) =>
        left.order - right.order ||
        left.fieldLabel.localeCompare(right.fieldLabel),
    );
}

type SpeciesCustomFieldPatch = {
  value?: string;
  minValue?: string;
  maxValue?: string;
  unitId?: string;
};

type SpeciesCustomFieldUnitOption = {
  id: string;
  initial: string;
  name: string;
};

function SpeciesCustomFieldRowsEditor({
  disabled,
  emptyText,
  fields,
  onChange,
  profiles = [],
  rows,
  units,
}: {
  disabled: boolean;
  emptyText: string;
  fields: KolamCustomField[];
  onChange: (rows: KolamSpeciesCustomFieldValue[]) => void;
  profiles?: KolamSpeciesController['customFieldProfiles'];
  rows: KolamSpeciesCustomFieldValue[];
  units: SpeciesCustomFieldUnitOption[];
}) {
  const knownKeys = React.useMemo(
    () => new Set(fields.map(field => field.fieldKey).filter(Boolean)),
    [fields],
  );
  const initialSelectedKeys = React.useMemo(
    () => getSelectedCustomFieldKeys(rows, fields),
    [fields, rows],
  );
  const unknownRows = rows.filter(row => {
    const key = getCustomFieldRowKey(row, fields);
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
  const selectedFields = fields.filter(field =>
    selectedKeySet.has(field.fieldKey),
  );
  const setFieldSelected = (field: KolamCustomField, nextSelected: boolean) => {
    const nextKeys = nextSelected
      ? Array.from(new Set([...selectedKeys, field.fieldKey]))
      : selectedKeys.filter(key => key !== field.fieldKey);
    setSelectedKeys(nextKeys);

    if (!nextSelected) {
      onChange(rows.filter(row => !customFieldRowMatchesField(row, field)));
    }
  };
  const setUseCustomFields = (nextEnabled: boolean) => {
    setEnabled(nextEnabled);
    if (!nextEnabled) {
      setSelectedKeys([]);
      onChange([]);
    }
  };
  const applyProfile = (profileId: string) => {
    const profile = profiles.find(item => item.id === profileId);
    if (!profile) {
      return;
    }

    const nextKeys = profile.fields
      .filter(field => field.status !== 'inactive')
      .map(field => field.fieldKey)
      .filter(Boolean);
    const nextKeySet = new Set(nextKeys);

    setEnabled(true);
    setSelectedKeys(nextKeys);
    onChange(
      rows.filter(row => {
        const key = getCustomFieldRowKey(row, fields);
        return key && nextKeySet.has(key);
      }),
    );
  };

  return (
    <View style={styles.customFieldFormStack}>
      <View style={styles.customFieldSwitchRow}>
        <KolamCopyStack
          items={[
            {
              id: 'label',
              text: 'Gunakan Field Kustom',
              style: styles.customFieldSwitchLabel,
            },
          ]}
        />
        <KolamSwitch
          accessibilityLabel="Gunakan Field Kustom"
          active={enabled}
          disabled={disabled || fields.length === 0}
          onPress={() => setUseCustomFields(!enabled)}
        />
      </View>

      {enabled ? (
        <>
          {profiles.length ? (
            <FieldShell
              label="Profil spesifikasi"
              style={styles.customFieldCompactField}
            >
              <KolamDropdownSelect
                label="Profil spesifikasi"
                menuStyle={styles.longDropdownMenu}
                onChange={applyProfile}
                options={[
                  { label: 'Pilih profil (opsional)...', value: '' },
                  ...profiles.map(profile => ({
                    label: profile.name,
                    value: profile.id,
                  })),
                ]}
                showLabelInTrigger={false}
                value=""
              />
            </FieldShell>
          ) : null}
          <SpeciesCustomFieldMultiSelect
            disabled={disabled || fields.length === 0}
            fields={fields}
            onToggleField={setFieldSelected}
            selectedKeySet={selectedKeySet}
          />

          {selectedFields.length ? (
            selectedFields.map(field => (
              <SpeciesCustomFieldRowsEditorRow
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
                  text: fields.length ? 'Pilih field kustom.' : emptyText,
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
                id: row.fieldId || `unknown-${index}`,
                text: `${row.fieldLabel}: ${row.valueLabel}`,
                style: styles.fieldHint,
              })),
            ]}
          />
        </View>
      ) : null}
    </View>
  );
}

function SpeciesCustomFieldMultiSelect({
  disabled,
  fields,
  onToggleField,
  selectedKeySet,
}: {
  disabled: boolean;
  fields: KolamCustomField[];
  onToggleField: (field: KolamCustomField, nextSelected: boolean) => void;
  selectedKeySet: Set<string>;
}) {
  const [open, setOpen] = React.useState(false);
  const selectedFields = fields.filter(field =>
    selectedKeySet.has(field.fieldKey),
  );

  return (
    <View style={styles.customFieldMultiSelect}>
      <Pressable
        accessibilityLabel="Pilih field kustom"
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={() => setOpen(current => !current)}
        style={styles.customFieldMultiSelectTrigger}
      >
        <View style={styles.customFieldSelectedChips}>
          {selectedFields.map(field => (
            <KolamButton
              disabled={disabled}
              intent="secondary"
              key={field.id || field.fieldKey}
              label={`${field.fieldLabel} x`}
              onPress={() => onToggleField(field, false)}
              style={styles.customFieldSelectedChip}
              textStyle={styles.customFieldSelectedChipText}
            />
          ))}
          <KolamCopyStack
            items={[
              {
                id: 'placeholder',
                text: 'Pilih field kustom...',
                style: selectedFields.length
                  ? styles.customFieldMultiSelectPlaceholderMuted
                  : styles.customFieldMultiSelectPlaceholder,
              },
            ]}
          />
        </View>
        <KolamCopyStack
          items={[
            {
              id: 'chevron',
              text: open ? '^' : 'v',
              style: styles.customFieldMultiSelectChevron,
            },
          ]}
        />
      </Pressable>
      {open ? (
        <View style={styles.customFieldMultiSelectMenu}>
          <ScrollView
            nestedScrollEnabled
            style={styles.customFieldMultiSelectScroll}
            contentContainerStyle={styles.customFieldMultiSelectContent}
          >
            {fields.map(field => {
              const selected = selectedKeySet.has(field.fieldKey);
              return (
                <KolamButton
                  disabled={disabled}
                  intent={selected ? 'primary' : 'plain'}
                  key={field.id || field.fieldKey}
                  label={`${field.fieldLabel}${field.required ? ' *' : ''}`}
                  onPress={() => onToggleField(field, !selected)}
                  style={styles.customFieldMultiSelectOption}
                  textStyle={styles.customFieldMultiSelectOptionText}
                />
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

function SpeciesCustomFieldRowsEditorRow({
  disabled,
  field,
  onChange,
  rows,
  units,
}: {
  disabled: boolean;
  field: KolamCustomField;
  onChange: (rows: KolamSpeciesCustomFieldValue[]) => void;
  rows: KolamSpeciesCustomFieldValue[];
  units: SpeciesCustomFieldUnitOption[];
}) {
  const row = findCustomFieldValueRow(rows, field);
  const raw = getCustomFieldValueRecord(row);

  return (
    <View style={styles.customFieldEditorRow}>
      <KolamCopyStack
        items={[
          {
            id: 'label',
            text: `${field.fieldLabel}${field.required ? ' *' : ''}`,
            style: styles.customFieldInputLabel,
          },
        ]}
      />
      {renderSpeciesCustomFieldRowsInput(
        disabled,
        rows,
        onChange,
        field,
        raw,
        units,
      )}
      {field.description ? (
        <KolamCopyStack
          items={[
            {
              id: 'description',
              text: field.description,
              style: styles.fieldHint,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

function renderSpeciesCustomFieldRowsInput(
  disabled: boolean,
  rows: KolamSpeciesCustomFieldValue[],
  onChange: (rows: KolamSpeciesCustomFieldValue[]) => void,
  field: KolamCustomField,
  raw: Record<string, unknown>,
  units: SpeciesCustomFieldUnitOption[],
) {
  const update = (patch: SpeciesCustomFieldPatch) =>
    updateSpeciesCustomFieldRows(rows, onChange, field, patch);
  const unitSelector = renderSpeciesCustomFieldUnitSelector(
    disabled,
    rows,
    onChange,
    field,
    raw,
    units,
  );

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
        value={getCustomFieldBooleanValue(raw)}
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
        value={getCustomFieldStringValue(raw)}
      />
    );
  }

  if (field.fieldType === 'range') {
    const unitLabel =
      field.unitId && field.unitLabel ? 'Satuan (tetap)' : 'Satuan';
    return (
      <View style={styles.twoColumnGrid}>
        {renderSpeciesCustomFieldLabeledControl(
          'Min',
          <KolamFormTextField
            editable={!disabled}
            keyboardType="numeric"
            onChangeText={minValue => update({ minValue })}
            placeholder="Nilai minimum"
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={getCustomFieldNumberText(raw.minValue)}
          />,
        )}
        {renderSpeciesCustomFieldLabeledControl(
          'Maks',
          <KolamFormTextField
            editable={!disabled}
            keyboardType="numeric"
            onChangeText={maxValue => update({ maxValue })}
            placeholder="Nilai maksimum"
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={getCustomFieldNumberText(raw.maxValue)}
          />,
        )}
        {unitSelector
          ? renderSpeciesCustomFieldLabeledControl(unitLabel, unitSelector)
          : null}
      </View>
    );
  }

  if (field.fieldType === 'number') {
    const numberInput = (
      <KolamFormTextField
        editable={!disabled}
        keyboardType="numeric"
        onChangeText={value => update({ value })}
        placeholder="Masukkan angka"
        style={settingsWebFormStyles.settingsWebFormFieldValue}
        value={getCustomFieldStringValue(raw)}
      />
    );

    if (!field.requiresUnit) {
      return numberInput;
    }

    return (
      <View style={styles.twoColumnGrid}>
        {renderSpeciesCustomFieldLabeledControl('Nilai', numberInput)}
        {unitSelector
          ? renderSpeciesCustomFieldLabeledControl(
              field.unitId && field.unitLabel ? 'Satuan (tetap)' : 'Satuan',
              unitSelector,
            )
          : null}
      </View>
    );
  }

  return (
    <KolamFormTextField
      editable={!disabled}
      multiline
      onChangeText={value => update({ value })}
      placeholder="Masukkan nilai"
      style={[
        settingsWebFormStyles.settingsWebFormFieldValue,
        styles.customFieldTextArea,
      ]}
      value={getCustomFieldStringValue(raw)}
    />
  );
}

function renderSpeciesCustomFieldUnitSelector(
  disabled: boolean,
  rows: KolamSpeciesCustomFieldValue[],
  onChange: (rows: KolamSpeciesCustomFieldValue[]) => void,
  field: KolamCustomField,
  raw: Record<string, unknown>,
  units: SpeciesCustomFieldUnitOption[],
) {
  if (
    !field.requiresUnit ||
    (field.fieldType !== 'number' && field.fieldType !== 'range')
  ) {
    return null;
  }

  if (field.unitId && field.unitLabel) {
    return (
      <View style={styles.customFieldFixedUnitBox}>
        <KolamCopyStack
          items={[
            { id: 'value', text: field.unitLabel, style: styles.rowText },
          ]}
        />
      </View>
    );
  }

  return (
    <KolamDropdownSelect
      label="Satuan"
      menuStyle={styles.longDropdownMenu}
      onChange={unitId =>
        updateSpeciesCustomFieldRows(rows, onChange, field, { unitId })
      }
      options={[
        { label: 'Pilih satuan', value: '' },
        ...units.map(unit => ({
          label: unit.initial ? `${unit.name} (${unit.initial})` : unit.name,
          value: unit.id,
        })),
      ]}
      searchable
      searchPlaceholder="Cari satuan..."
      showLabelInTrigger={false}
      value={getStringFromRecord(getPlainRecord(raw), 'unit')}
    />
  );
}

function renderSpeciesCustomFieldLabeledControl(
  label: string,
  children: React.ReactNode,
) {
  return (
    <View style={styles.customFieldLabeledControl}>
      <KolamCopyStack
        items={[
          {
            id: 'label',
            text: label,
            style: styles.customFieldControlLabel,
          },
        ]}
      />
      {children}
    </View>
  );
}

function updateSpeciesCustomFieldRows(
  rows: KolamSpeciesCustomFieldValue[],
  onChange: (rows: KolamSpeciesCustomFieldValue[]) => void,
  field: KolamCustomField,
  patch: SpeciesCustomFieldPatch | null,
) {
  const currentRow = findCustomFieldValueRow(rows, field);
  const currentRaw = getCustomFieldValueRecord(currentRow);
  const baseRaw: Record<string, unknown> = {
    field: field.id,
    fieldKey: field.fieldKey,
  };

  if (field.requiresUnit && field.unitId) {
    baseRaw.unit = field.unitId;
  }

  const nextRaw = patch
    ? createNextCustomFieldValueRaw(field, currentRaw, baseRaw, patch)
    : baseRaw;
  const nextRows = rows.filter(row => !customFieldRowMatchesField(row, field));

  if (!patch || !shouldKeepCustomFieldValue(field, nextRaw)) {
    onChange(nextRows);
    return;
  }

  const unitLabel = field.unitLabel;
  const nextRow: KolamSpeciesCustomFieldValue = {
    fieldId: field.id,
    fieldLabel: field.fieldLabel,
    raw: nextRaw,
    unitLabel,
    valueLabel: formatSpeciesCustomFieldEditorValue(field, nextRaw, unitLabel),
  };

  onChange([...nextRows, nextRow]);
}

function getSelectedCustomFieldKeys(
  rows: KolamSpeciesCustomFieldValue[],
  fields: KolamCustomField[],
) {
  return Array.from(
    new Set(
      rows
        .map(row => getCustomFieldRowKey(row, fields))
        .filter(Boolean) as string[],
    ),
  );
}

function getCustomFieldRowKey(
  row: KolamSpeciesCustomFieldValue,
  fields: KolamCustomField[],
) {
  const raw = getCustomFieldValueRecord(row);
  const rawKey = getStringFromRecord(raw, 'fieldKey');
  if (rawKey) {
    return rawKey;
  }
  const fieldRecord = getPlainRecord(raw.field);
  const fieldId =
    row.fieldId ||
    getStringFromRecord(fieldRecord, '_id') ||
    getStringFromRecord(fieldRecord, 'id');
  return fields.find(field => field.id === fieldId)?.fieldKey || '';
}

function createNextCustomFieldValueRaw(
  field: KolamCustomField,
  currentRaw: Record<string, unknown>,
  baseRaw: Record<string, unknown>,
  patch: SpeciesCustomFieldPatch,
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
    const minValue =
      patch.minValue ?? getCustomFieldNumberText(currentRaw.minValue);
    const maxValue =
      patch.maxValue ?? getCustomFieldNumberText(currentRaw.maxValue);
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

function shouldKeepCustomFieldValue(
  field: KolamCustomField,
  raw: Record<string, unknown>,
) {
  if (field.fieldType === 'range') {
    return raw.minValue !== undefined || raw.maxValue !== undefined;
  }
  return raw.value !== undefined && raw.value !== null && raw.value !== '';
}

function findCustomFieldValueRow(
  rows: KolamSpeciesCustomFieldValue[],
  field: KolamCustomField,
) {
  return rows.find(row => customFieldRowMatchesField(row, field));
}

function customFieldRowMatchesField(
  row: KolamSpeciesCustomFieldValue,
  field: KolamCustomField,
) {
  const raw = getCustomFieldValueRecord(row);
  const fieldRecord = getPlainRecord(raw.field);
  const rawFieldId =
    getStringFromRecord(fieldRecord, '_id') ||
    getStringFromRecord(fieldRecord, 'id');
  return (
    row.fieldId === field.id ||
    row.fieldId === field.fieldKey ||
    rawFieldId === field.id ||
    getStringFromRecord(raw, 'fieldKey') === field.fieldKey
  );
}

function getCustomFieldValueRecord(row?: KolamSpeciesCustomFieldValue) {
  return getPlainRecord(row?.raw);
}

function getPlainRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function getStringFromRecord(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function getCustomFieldStringValue(raw: Record<string, unknown>) {
  const value = raw.value;
  return value === undefined || value === null ? '' : String(value);
}

function getCustomFieldBooleanValue(raw: Record<string, unknown>) {
  if (raw.value === true) {
    return 'true';
  }
  if (raw.value === false) {
    return 'false';
  }
  return '';
}

function getCustomFieldNumberText(value: unknown) {
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

function formatSpeciesCustomFieldEditorValue(
  field: KolamCustomField,
  raw: Record<string, unknown>,
  unitLabel: string,
) {
  if (field.fieldType === 'range') {
    const values = [raw.minValue, raw.maxValue]
      .map(value => getCustomFieldNumberText(value))
      .filter(Boolean);
    return `${values.join(' - ') || '-'}${unitLabel ? ` ${unitLabel}` : ''}`;
  }

  if (field.fieldType === 'boolean') {
    return raw.value === true ? 'Ya' : raw.value === false ? 'Tidak' : '-';
  }

  const value = getCustomFieldStringValue(raw).trim();
  return `${value || '-'}${unitLabel && value ? ` ${unitLabel}` : ''}`;
}
function SpeciesSeoEditPanel({
  controller,
}: {
  controller: KolamSpeciesController;
}) {
  const score = controller.selectedSpecies?.seo.lastSeoScore;
  return (
    <FieldShell label="SEO Google">
      <View style={styles.grocerPricingPanel}>
        <View style={styles.variantEditorHeader}>
          <KolamCopyStack
            items={[
              {
                id: 'summary',
                text:
                  score == null
                    ? 'Skor SEO belum tersedia.'
                    : `Skor SEO terakhir: ${score}/100`,
                style: styles.fieldHint,
              },
            ]}
          />
          {controller.selectedSpecies?.seo.lastAuditedAt ? (
            <KolamBadge
              label={`Audit: ${formatRelativeTime(
                controller.selectedSpecies.seo.lastAuditedAt,
              )}`}
            />
          ) : null}
        </View>
        <View style={styles.twoColumnGrid}>
          <View style={styles.inlineFieldGroup}>
            <KolamFormTextField
              editable={!controller.saving}
              onChangeText={seoMetaTitle =>
                controller.onChangeForm({ seoMetaTitle })
              }
              placeholder="Judul SEO"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={controller.form.seoMetaTitle}
            />
          </View>
          <View style={styles.inlineFieldGroup}>
            <KolamFormTextField
              editable={!controller.saving}
              onChangeText={seoKeywords =>
                controller.onChangeForm({ seoKeywords })
              }
              placeholder="Kata kunci, pisahkan dengan koma"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={controller.form.seoKeywords}
            />
          </View>
        </View>
        <KolamFormTextField
          editable={!controller.saving}
          multiline
          onChangeText={seoMetaDescription =>
            controller.onChangeForm({ seoMetaDescription })
          }
          placeholder="Deskripsi SEO"
          style={[
            settingsWebFormStyles.settingsWebFormFieldValue,
            styles.customFieldTextArea,
          ]}
          value={controller.form.seoMetaDescription}
        />
      </View>
    </FieldShell>
  );
}

function SpeciesAttachedItemsEditPanel({
  controller,
}: {
  controller: KolamSpeciesController;
}) {
  const [showForm, setShowForm] = React.useState(false);
  const [itemType, setItemType] = React.useState<'product' | 'species'>(
    'product',
  );
  const [relationType, setRelationType] = React.useState('feeding');
  const [targetId, setTargetId] = React.useState('');
  const [note, setNote] = React.useState('');
  const [deleteTarget, setDeleteTarget] = React.useState<{
    id: string;
    label: string;
  } | null>(null);
  const attachedItems = controller.selectedSpecies?.attachedItems ?? [];
  const relationOptions = [
    { label: 'Pakan', value: 'feeding' },
    { label: 'Suplemen', value: 'supplements' },
    { label: 'Obat', value: 'medicine' },
  ];
  const targetOptions = getAttachedItemTargetOptions(controller, itemType);

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
      ...(itemType === 'product'
        ? { product: targetId }
        : { species: targetId }),
      ...(note.trim() ? { note: note.trim() } : {}),
    });
    if (ok) {
      resetForm();
    }
  };

  return (
    <FieldShell label="Item Terlampir">
      <View style={styles.grocerPricingPanel}>
        <View style={styles.variantEditorHeader}>
          <KolamCopyStack
            items={[
              {
                id: 'summary',
                text: attachedItems.length
                  ? `${attachedItems.length} item terhubung ke spesies ini.`
                  : 'Belum ada produk atau spesies yang terlampir.',
                style: styles.fieldHint,
              },
            ]}
          />
          <KolamButton
            disabled={controller.saving || !controller.selectedSpecies}
            intent="primary"
            label={showForm ? 'Tutup Form' : 'Tambah Item'}
            onPress={() => setShowForm(current => !current)}
          />
        </View>
        {attachedItems.map(item => (
          <View key={item.id} style={styles.attachedItemRow}>
            <KolamCopyStack
              items={[
                {
                  id: 'name',
                  text: item.targetName,
                  style: styles.variantTitle,
                },
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
              onPress={() =>
                setDeleteTarget({ id: item.id, label: item.targetName })
              }
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
              options={[
                { label: 'Belum dipilih', value: '' },
                ...targetOptions,
              ]}
              searchable
              searchPlaceholder={
                itemType === 'product' ? 'Cari produk...' : 'Cari spesies...'
              }
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
              <KolamCancelButton
                intent="secondary"
                onPress={resetForm}
              />
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
            void controller
              .onRemoveAttachedItem(deleteTarget.id)
              .then(() => setDeleteTarget(null));
          }
        }}
        visible={Boolean(deleteTarget)}
      />
    </FieldShell>
  );
}

function SpeciesTermsTemplatesSummaryPanel({
  controller,
}: {
  controller: KolamSpeciesController;
}) {
  return (
    <FieldShell label="TOS Aktif">
      <View style={styles.grocerPricingPanel}>
        {controller.termsTemplates.length ? (
          controller.termsTemplates.map(template => (
            <View key={template.id} style={styles.attachedItemRow}>
              <KolamCopyStack
                items={[
                  {
                    id: 'title',
                    text: template.title,
                    style: styles.variantTitle,
                  },
                  {
                    id: 'meta',
                    text: [
                      template.category,
                      template.sourceLabel,
                      `Versi ${template.version}`,
                    ]
                      .filter(Boolean)
                      .join(' - '),
                    style: styles.fieldHint,
                  },
                ]}
              />
              <KolamStatusBadge
                intent="success"
                label={template.status || 'Aktif'}
              />
            </View>
          ))
        ) : (
          <KolamCopyStack
            items={[
              {
                id: 'empty',
                text: 'Belum ada TOS aktif untuk spesies ini.',
                style: styles.fieldHint,
              },
            ]}
          />
        )}
      </View>
    </FieldShell>
  );
}

function getAttachedItemTargetOptions(
  controller: KolamSpeciesController,
  itemType: 'product' | 'species',
) {
  if (itemType === 'species') {
    const selectedId = controller.selectedSpecies?.id;
    return controller.species
      .filter(item => item.id !== selectedId)
      .map(item => ({
        label: [
          item.displayName || item.scientificName,
          item.sku ? `(${item.sku})` : '',
        ]
          .filter(Boolean)
          .join(' '),
        value: item.id,
      }));
  }

  return controller.productOptions.map(item => ({
    label: [item.name, item.sku ? `(${item.sku})` : '']
      .filter(Boolean)
      .join(' '),
    value: item.id,
  }));
}

function mergeSpeciesShippingMethods(
  primary: KolamSpeciesShippingMethod[],
  fallback: KolamSpeciesShippingMethod[],
) {
  const byId = new Map<string, KolamSpeciesShippingMethod>();

  [...primary, ...fallback].forEach(method => {
    if (method.id && !byId.has(method.id)) {
      byId.set(method.id, method);
    }
  });

  return Array.from(byId.values());
}

function SpeciesVariantEditorPanel({
  controller,
  onDeleteMedia,
  onDeleteVariant,
}: {
  controller: KolamSpeciesController;
  onDeleteMedia: (target: SpeciesDeleteMediaTarget) => void;
  onDeleteVariant: (target: { id: string; label: string }) => void;
}) {
  const form = controller.form;
  const [expandedVariantId, setExpandedVariantId] = React.useState<
    string | null
  >(form.variants[0]?.id ?? null);

  React.useEffect(() => {
    if (!form.variants.length) {
      setExpandedVariantId(null);
      return;
    }

    if (
      expandedVariantId &&
      !form.variants.some(variant => variant.id === expandedVariantId)
    ) {
      setExpandedVariantId(null);
    }
  }, [expandedVariantId, form.variants]);

  return (
    <FieldShell label="Varian Spesies">
      <View style={styles.variantEditorPanel}>
        <View style={styles.twoColumnGrid}>
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
          <KolamFormTextField
            editable={!controller.saving}
            onChangeText={variantConfigTier2Name =>
              controller.onChangeForm({
                variantConfigTier2Name,
                variantsTouched: true,
              })
            }
            placeholder="Contoh: Jenis kelamin / fase"
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={form.variantConfigTier2Name}
          />
        </View>
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
            onPress={() => addSpeciesVariantRow(controller)}
          />
        </View>
        {form.variants.map((variant, index) => (
          <SpeciesVariantFormCard
            controller={controller}
            expanded={expandedVariantId === variant.id}
            index={index}
            key={variant.id}
            onDeleteMedia={onDeleteMedia}
            onDeleteVariant={onDeleteVariant}
            onToggle={() =>
              setExpandedVariantId(current =>
                current === variant.id ? null : variant.id,
              )
            }
            variant={variant}
          />
        ))}
      </View>
    </FieldShell>
  );
}

function SpeciesVariantFieldPanel({
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
          ...(description
            ? [
                {
                  id: 'description',
                  text: description,
                  style: styles.fieldHint,
                },
              ]
            : []),
        ]}
      />
      <View style={styles.variantFieldPanelBody}>{children}</View>
    </View>
  );
}

function SpeciesVariantFormCard({
  controller,
  expanded,
  index,
  onDeleteMedia,
  onDeleteVariant,
  onToggle,
  variant,
}: {
  controller: KolamSpeciesController;
  expanded: boolean;
  index: number;
  onDeleteMedia: (target: SpeciesDeleteMediaTarget) => void;
  onDeleteVariant: (target: { id: string; label: string }) => void;
  onToggle: () => void;
  variant: KolamSpeciesVariantFormRow;
}) {
  const unitOptions = [
    { label: 'Pilih satuan', value: '' },
    ...controller.units.map(unit => ({
      label: unit.initial ? `${unit.name} (${unit.initial})` : unit.name,
      value: unit.id,
    })),
  ];
  const weightUnitOptions = [
    { label: 'Pilih satuan', value: '' },
    ...controller.units.filter(isSpeciesWeightUnit).map(unit => ({
      label: unit.initial ? `${unit.name} (${unit.initial})` : unit.name,
      value: unit.id,
    })),
  ];
  const dimensionUnitOptions = [
    { label: 'Pilih satuan', value: '' },
    ...controller.units.filter(isSpeciesDimensionUnit).map(unit => ({
      label: unit.initial ? `${unit.name} (${unit.initial})` : unit.name,
      value: unit.id,
    })),
  ];
  const liveVariant = controller.selectedSpecies?.variants.find(
    item => item.id === variant.id,
  );
  const variantLabel =
    [variant.tier1Value, variant.tier2Value].filter(Boolean).join(' / ') ||
    `Varian ${index + 1}`;
  const [activeTab, setActiveTab] =
    React.useState<SpeciesVariantEditTab>('pricing');
  const livePhotos = Array.isArray(liveVariant?.photoUris)
    ? liveVariant.photoUris.length
    : 0;
  const mediaCount = livePhotos;
  const vendorCount = Array.isArray(variant.vendorPrices)
    ? variant.vendorPrices.length
    : 0;
  const stockValue = Number(liveVariant?.stock ?? 0);
  const priceValue = Number(variant.priceToSell || 0);
  const priceLabel = priceValue > 0 ? formatCurrency(priceValue) : 'Rp 0';
  const vendorCost = getCheapestSpeciesVendorCost(variant.vendorPrices);
  const displayCost = vendorCost ?? parseCurrencyInput(variant.price);
  const skuLabel = variant.sku?.trim() || '-';
  const activeCustomFields = React.useMemo(
    () => getActiveSpeciesCustomFields(controller.customFields),
    [controller.customFields],
  );

  return (
    <View style={styles.variantFormCard}>
      <View style={styles.variantRowHeader}>
        <Pressable
          accessibilityRole="button"
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
            <KolamStatusBadge
              intent="primary"
              label={skuLabel}
              style={styles.variantMetaBadge}
            />
            <KolamStatusBadge
              intent={stockValue > 0 ? 'success' : 'danger'}
              label={`Stok ${formatNumber(stockValue)}`}
              style={styles.variantMetaBadge}
            />
            <KolamStatusBadge
              intent={vendorCount > 0 ? 'success' : 'muted'}
              label={`Pemasok ${vendorCount}`}
              style={styles.variantMetaBadge}
            />
            <KolamStatusBadge
              intent={mediaCount > 0 ? 'success' : 'muted'}
              label={`Media ${mediaCount}`}
              style={styles.variantMetaBadge}
            />
            <KolamStatusBadge
              intent="success"
              label={priceLabel}
              style={styles.variantMetaBadge}
            />
          </View>
        </Pressable>
        <KolamButton
          disabled={controller.saving}
          intent="danger"
          label="Hapus"
          onPress={() =>
            onDeleteVariant({ id: variant.id, label: variantLabel })
          }
          style={styles.variantHeaderButton}
        />
      </View>

      {expanded ? (
        <>
          <View style={styles.variantTabRow}>
            {SPECIES_VARIANT_EDIT_TABS.map(tab => (
              <KolamButton
                intent={activeTab === tab.id ? 'primary' : 'outline'}
                key={tab.id}
                label={tab.label}
                onPress={() => setActiveTab(tab.id)}
                style={styles.variantTabButton}
              />
            ))}
          </View>

          {activeTab === 'pricing' ? (
            <View style={styles.variantTabContent}>
              <View style={styles.variantPricingGrid}>
                <VariantCompactField label="SKU">
                  <KolamFormTextField
                    editable={!controller.saving}
                    onChangeText={sku =>
                      updateSpeciesVariantRow(controller, variant.id, { sku })
                    }
                    placeholder="SKU"
                    style={settingsWebFormStyles.settingsWebFormFieldValue}
                    value={variant.sku}
                  />
                </VariantCompactField>
                <VariantCompactField label="HPP Pemasok">
                  <KolamFormTextField
                    editable={false}
                    placeholder="HPP"
                    style={settingsWebFormStyles.settingsWebFormFieldValue}
                    value={formatCurrency(displayCost)}
                  />
                </VariantCompactField>
                <VariantCompactField label="Harga Jual">
                  <KolamFormTextField
                    editable={!controller.saving}
                    keyboardType="numeric"
                    onChangeText={priceToSell =>
                      updateSpeciesVariantRow(controller, variant.id, {
                        priceToSell,
                      })
                    }
                    placeholder="Harga jual"
                    style={settingsWebFormStyles.settingsWebFormFieldValue}
                    value={variant.priceToSell}
                  />
                </VariantCompactField>
                <VariantCompactField label="Harga Pasar">
                  <KolamFormTextField
                    editable={!controller.saving}
                    keyboardType="numeric"
                    onChangeText={marketPrice =>
                      updateSpeciesVariantRow(controller, variant.id, {
                        marketPrice,
                      })
                    }
                    placeholder="Harga pasar"
                    style={settingsWebFormStyles.settingsWebFormFieldValue}
                    value={variant.marketPrice}
                  />
                </VariantCompactField>
                <VariantCompactField label="Harga Daring">
                  <KolamFormTextField
                    editable={!controller.saving}
                    keyboardType="numeric"
                    onChangeText={onlinePrice =>
                      updateSpeciesVariantRow(controller, variant.id, {
                        onlinePrice,
                      })
                    }
                    placeholder="Harga daring"
                    style={settingsWebFormStyles.settingsWebFormFieldValue}
                    value={variant.onlinePrice}
                  />
                </VariantCompactField>
                <VariantCompactField label="Harga Minimum">
                  <KolamFormTextField
                    editable={!controller.saving}
                    keyboardType="numeric"
                    onChangeText={minimumPriceToSales =>
                      updateSpeciesVariantRow(controller, variant.id, {
                        minimumPriceToSales,
                      })
                    }
                    placeholder="Harga minimum"
                    style={settingsWebFormStyles.settingsWebFormFieldValue}
                    value={variant.minimumPriceToSales}
                  />
                </VariantCompactField>
                <VariantCompactField label="Minimum Pesanan">
                  <KolamFormTextField
                    editable={!controller.saving}
                    keyboardType="numeric"
                    onChangeText={minimumOrderQty =>
                      updateSpeciesVariantRow(controller, variant.id, {
                        minimumOrderQty,
                      })
                    }
                    placeholder="Minimum"
                    style={settingsWebFormStyles.settingsWebFormFieldValue}
                    value={variant.minimumOrderQty}
                  />
                </VariantCompactField>
              </View>
              <SpeciesGrocerPricingPanel
                disabled={controller.saving}
                hint="Harga per unit berdasarkan jumlah pembelian untuk varian ini."
                onChange={grocerPricingTiers =>
                  updateSpeciesVariantRow(controller, variant.id, {
                    grocerPricingTiers,
                  })
                }
                rows={variant.grocerPricingTiers}
                title="Harga Bertingkat / Grosir Varian"
              />
            </View>
          ) : null}

          {activeTab === 'vendor' ? (
            <View style={styles.variantTabContent}>
              <SpeciesVariantVendorPricesEditor
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
                    items={[
                      {
                        id: 'label',
                        text: 'Berat',
                        style: styles.variantSpecsLabel,
                      },
                    ]}
                  />
                  <View style={styles.variantSpecsTwoGrid}>
                    <KolamFormTextField
                      editable={!controller.saving}
                      keyboardType="numeric"
                      onChangeText={weightValue =>
                        updateSpeciesVariantRow(controller, variant.id, {
                          weightValue,
                        })
                      }
                      placeholder="Nilai"
                      style={settingsWebFormStyles.settingsWebFormFieldValue}
                      value={variant.weightValue}
                    />
                    <KolamDropdownSelect
                      label="Satuan"
                      menuStyle={styles.longDropdownMenu}
                      onChange={weightUnitId =>
                        updateSpeciesVariantRow(controller, variant.id, {
                          weightUnitId,
                        })
                      }
                      options={
                        weightUnitOptions.length > 1
                          ? weightUnitOptions
                          : unitOptions
                      }
                      searchable
                      searchPlaceholder="Cari satuan..."
                      showLabelInTrigger={false}
                      value={variant.weightUnitId}
                    />
                  </View>
                </View>
                <View style={styles.variantSpecsGroup}>
                  <KolamCopyStack
                    items={[
                      {
                        id: 'label',
                        text: 'Dimensi (P x L x T)',
                        style: styles.variantSpecsLabel,
                      },
                    ]}
                  />
                  <View style={styles.variantSpecsFourGrid}>
                    <KolamFormTextField
                      editable={!controller.saving}
                      keyboardType="numeric"
                      onChangeText={dimensionLength =>
                        updateSpeciesVariantRow(controller, variant.id, {
                          dimensionLength,
                        })
                      }
                      placeholder="P"
                      style={settingsWebFormStyles.settingsWebFormFieldValue}
                      value={variant.dimensionLength}
                    />
                    <KolamFormTextField
                      editable={!controller.saving}
                      keyboardType="numeric"
                      onChangeText={dimensionWidth =>
                        updateSpeciesVariantRow(controller, variant.id, {
                          dimensionWidth,
                        })
                      }
                      placeholder="L"
                      style={settingsWebFormStyles.settingsWebFormFieldValue}
                      value={variant.dimensionWidth}
                    />
                    <KolamFormTextField
                      editable={!controller.saving}
                      keyboardType="numeric"
                      onChangeText={dimensionHeight =>
                        updateSpeciesVariantRow(controller, variant.id, {
                          dimensionHeight,
                        })
                      }
                      placeholder="T"
                      style={settingsWebFormStyles.settingsWebFormFieldValue}
                      value={variant.dimensionHeight}
                    />
                    <KolamDropdownSelect
                      label="Satuan"
                      menuStyle={styles.longDropdownMenu}
                      onChange={dimensionUnitId =>
                        updateSpeciesVariantRow(controller, variant.id, {
                          dimensionUnitId,
                        })
                      }
                      options={
                        dimensionUnitOptions.length > 1
                          ? dimensionUnitOptions
                          : unitOptions
                      }
                      searchable
                      searchPlaceholder="Cari satuan..."
                      showLabelInTrigger={false}
                      value={variant.dimensionUnitId}
                    />
                  </View>
                </View>
              </View>
            </View>
          ) : null}
          {activeTab === 'media' ? (
            <View style={styles.variantTabContent}>
              <SpeciesVariantMediaPanel
                controller={controller}
                onDelete={onDeleteMedia}
                showVariantSelector={false}
                variantId={variant.id}
              />
            </View>
          ) : null}
          {activeTab === 'advanced' ? (
            <View style={styles.variantTabContent}>
              <View style={styles.variantMemberPointsRow}>
                <KolamCopyStack
                  items={[
                    {
                      id: 'title',
                      text: 'Poin Anggota',
                      style: styles.variantAdvancedTitle,
                    },
                    {
                      id: 'hint',
                      text: 'Poin yang didapat pelanggan per unit pembelian.',
                      style: styles.variantCompactHint,
                    },
                  ]}
                />
                <View style={styles.variantAdvancedActions}>
                  <KolamButton
                    disabled={controller.saving}
                    intent={variant.memberPointsEnabled ? 'primary' : 'outline'}
                    label="Aktif"
                    onPress={() =>
                      updateSpeciesVariantRow(controller, variant.id, {
                        memberPointsEnabled: true,
                      })
                    }
                  />
                  <KolamButton
                    disabled={controller.saving}
                    intent={
                      !variant.memberPointsEnabled ? 'primary' : 'outline'
                    }
                    label="Nonaktif"
                    onPress={() =>
                      updateSpeciesVariantRow(controller, variant.id, {
                        memberPoints: '0',
                        memberPointsEnabled: false,
                      })
                    }
                  />
                  {variant.memberPointsEnabled ? (
                    <KolamFormTextField
                      editable={!controller.saving}
                      keyboardType="numeric"
                      onChangeText={memberPoints =>
                        updateSpeciesVariantRow(controller, variant.id, {
                          memberPoints,
                        })
                      }
                      placeholder="Poin"
                      style={[
                        settingsWebFormStyles.settingsWebFormFieldValue,
                        styles.memberPointsInput,
                      ]}
                      value={variant.memberPoints}
                    />
                  ) : null}
                </View>
              </View>

              <View style={styles.variantAdvancedGrid}>
                <View style={styles.variantAdvancedCard}>
                  <KolamCopyStack
                    items={[
                      {
                        id: 'title',
                        text: 'Bahan Penyusun',
                        style: styles.variantAdvancedTitle,
                      },
                    ]}
                  />
                  <KolamComponentOverridesEditor
                    disabled={controller.saving}
                    onChange={componentOverrides =>
                      updateSpeciesVariantRow(controller, variant.id, {
                        componentOverrides,
                      })
                    }
                    products={controller.rawMaterialProducts}
                    rows={variant.componentOverrides}
                  />
                </View>

                <View style={styles.variantAdvancedCard}>
                  <KolamCopyStack
                    items={[
                      {
                        id: 'title',
                        text: 'Tautan Eksternal',
                        style: styles.variantAdvancedTitle,
                      },
                    ]}
                  />
                  <SpeciesExternalLinksRowsEditor
                    disabled={controller.saving}
                    emptyText="Belum ada tautan eksternal."
                    links={variant.externalLinks}
                    onChange={externalLinks =>
                      updateSpeciesVariantRow(controller, variant.id, {
                        externalLinks,
                      })
                    }
                  />
                </View>

                <View style={styles.variantAdvancedCard}>
                  <KolamCopyStack
                    items={[
                      {
                        id: 'title',
                        text: 'Field Kustom',
                        style: styles.variantAdvancedTitle,
                      },
                    ]}
                  />
                  <SpeciesCustomFieldRowsEditor
                    disabled={controller.saving}
                    emptyText="Belum ada field kustom aktif untuk varian."
                    fields={activeCustomFields}
                    onChange={customFieldValues =>
                      updateSpeciesVariantRow(controller, variant.id, {
                        customFieldValues,
                      })
                    }
                    rows={variant.customFieldValues}
                    units={controller.units}
                  />
                </View>
              </View>
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}
function SpeciesEditAssetsPanel({
  controller,
}: {
  controller: KolamSpeciesController;
}) {
  if (!controller.selectedSpecies) {
    return (
      <FieldShell label="Aset Spesies">
        <View style={styles.grocerPricingPanel}>
          <KolamCopyStack
            items={[
              {
                id: 'empty',
                text: 'Simpan spesies terlebih dahulu sebelum mengunggah aset.',
                style: styles.fieldHint,
              },
            ]}
          />
        </View>
      </FieldShell>
    );
  }

  return (
    <FieldShell label="Aset Spesies">
      <KolamSpeciesDetailAssetsPanel
        onSpeciesChange={species => {
          void controller.onApplySpecies(species);
        }}
        species={controller.selectedSpecies}
      />
    </FieldShell>
  );
}
function SpeciesPackingLinksPanel({
  controller,
}: {
  controller: KolamSpeciesController;
}) {
  const variants = controller.form.variants.map((variant, index) => ({
    id: variant.id,
    label:
      [variant.tier1Value, variant.tier2Value].filter(Boolean).join(' / ') ||
      `Varian ${index + 1}`,
  }));

  return (
    <FieldShell label="Bahan Kemasan">
      <View style={styles.grocerPricingPanel}>
        <KolamCopyStack
          items={[
            {
              id: 'title',
              text: 'Bahan Kemasan',
              style: styles.variantTitle,
            },
            {
              id: 'hint',
              text: 'Kemasan default untuk checkout. Disimpan melalui endpoint bahan kemasan setelah spesies tersimpan.',
              style: styles.fieldHint,
            },
          ]}
        />
        <KolamPackingLinksEditor
          disabled={controller.saving}
          onChange={packingLinks => controller.onChangeForm({ packingLinks })}
          packings={controller.packingOptions}
          rows={controller.form.packingLinks}
          variants={variants}
        />
      </View>
    </FieldShell>
  );
}

function SpeciesVariantAdvancedPanel({
  controller,
  variant,
}: {
  controller: KolamSpeciesController;
  variant: KolamSpeciesVariantFormRow;
}) {
  const fields = React.useMemo(
    () => getActiveSpeciesCustomFields(controller.customFields),
    [controller.customFields],
  );

  return (
    <SpeciesVariantFieldPanel
      description="Tautan eksternal dan field kustom khusus varian."
      title="Informasi Lanjutan Varian"
    >
      <SpeciesVariantFieldPanel
        description="Tautan marketplace, POS, website, atau referensi untuk varian ini."
        title="Tautan Eksternal Varian"
      >
        <SpeciesExternalLinksRowsEditor
          disabled={controller.saving}
          emptyText="Belum ada tautan eksternal untuk varian ini."
          links={variant.externalLinks}
          onChange={externalLinks =>
            updateSpeciesVariantRow(controller, variant.id, { externalLinks })
          }
        />
      </SpeciesVariantFieldPanel>
      <SpeciesVariantFieldPanel
        description="Field kustom yang nilainya berbeda antar varian."
        title="Field Kustom Varian"
      >
        <SpeciesCustomFieldRowsEditor
          disabled={controller.saving}
          emptyText="Belum ada field kustom aktif untuk varian."
          fields={fields}
          rows={variant.customFieldValues}
          units={controller.units}
          onChange={customFieldValues =>
            updateSpeciesVariantRow(controller, variant.id, {
              customFieldValues,
            })
          }
        />
      </SpeciesVariantFieldPanel>
    </SpeciesVariantFieldPanel>
  );
}
function SpeciesVariantBomPanel({
  controller,
  variant,
}: {
  controller: KolamSpeciesController;
  variant: KolamSpeciesVariantFormRow;
}) {
  return (
    <View style={styles.grocerPricingPanel}>
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: 'Penyesuaian Bahan Penyusun',
            style: styles.variantTitle,
          },
          {
            id: 'hint',
            text: 'Override komponen produksi untuk varian ini. Jika kosong, HPP memakai vendor/stored sesuai backend.',
            style: styles.fieldHint,
          },
        ]}
      />
      <KolamComponentOverridesEditor
        disabled={controller.saving}
        onChange={componentOverrides =>
          updateSpeciesVariantRow(controller, variant.id, {
            componentOverrides,
          })
        }
        products={controller.rawMaterialProducts}
        rows={variant.componentOverrides}
      />
    </View>
  );
}

function SpeciesCommercialPolicyPanel({
  disabled,
  memberPointsDisabled,
  memberPointsHint,
  onChange,
  title,
  value,
}: {
  disabled: boolean;
  memberPointsDisabled?: boolean;
  memberPointsHint: string;
  onChange: (value: KolamCommercialPolicyEditorValue) => void;
  title: string;
  value: KolamCommercialPolicyEditorValue;
}) {
  return (
    <View style={styles.grocerPricingPanel}>
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: title,
            style: styles.variantTitle,
          },
          {
            id: 'hint',
            text: 'Mengikuti kontrak backend untuk root species dan varian.',
            style: styles.fieldHint,
          },
        ]}
      />
      <KolamCommercialPolicyEditor
        disabled={disabled}
        memberPointsDisabled={memberPointsDisabled}
        memberPointsHint={memberPointsHint}
        onChange={onChange}
        value={value}
      />
    </View>
  );
}

function SpeciesGrocerPricingPanel({
  disabled,
  hint,
  onChange,
  rows,
  title,
}: {
  disabled: boolean;
  hint: string;
  onChange: (rows: KolamGrocerPricingTierEditorRow[]) => void;
  rows: KolamGrocerPricingTierEditorRow[];
  title: string;
}) {
  return (
    <View style={styles.grocerPricingPanel}>
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: title,
            style: styles.variantTitle,
          },
          {
            id: 'hint',
            text: hint,
            style: styles.fieldHint,
          },
        ]}
      />
      <KolamGrocerPricingTiersEditor
        disabled={disabled}
        onChange={onChange}
        rows={rows}
      />
    </View>
  );
}
function SpeciesVariantVendorPricesEditor({
  controller,
  variant,
}: {
  controller: KolamSpeciesController;
  variant: KolamSpeciesVariantFormRow;
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
              text: 'Harga beli pemasok, ongkir dari PO, dan riwayat HPP per varian.',
              style: styles.fieldHint,
            },
          ]}
        />
        <KolamButton
          disabled={controller.saving}
          intent="primary"
          label="Tambah Pemasok"
          onPress={() =>
            addSpeciesVariantVendorPriceRow(controller, variant.id)
          }
        />
      </View>
      {variant.vendorPrices.length ? (
        variant.vendorPrices.map((row, index) => (
          <SpeciesVariantVendorPriceRow
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

function SpeciesVariantVendorPriceRow({
  controller,
  index,
  row,
  variant,
  vendorOptions,
}: {
  controller: KolamSpeciesController;
  index: number;
  row: KolamSpeciesVendorPriceFormRow;
  variant: KolamSpeciesVariantFormRow;
  vendorOptions: Array<{ label: string; value: string }>;
}) {
  const shippingCost = parseCurrencyInput(row.shippingCost);
  const totalCost = parseCurrencyInput(row.price) + shippingCost;
  const latestHistory = row.priceHistory[0];

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
            removeSpeciesVariantVendorPriceRow(controller, variant.id, row.id)
          }
        />
      </View>
      <View style={styles.twoColumnGrid}>
        <KolamDropdownSelect
          label="Vendor"
          menuStyle={styles.longDropdownMenu}
          onChange={vendorId =>
            updateSpeciesVariantVendorPriceRow(controller, variant.id, row.id, {
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
            updateSpeciesVariantVendorPriceRow(controller, variant.id, row.id, {
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
            updateSpeciesVariantVendorPriceRow(controller, variant.id, row.id, {
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
          {
            id: 'history',
            text: latestHistory
              ? `Riwayat terakhir: ${formatCurrency(
                  latestHistory.oldTotalCost,
                )} ke ${formatCurrency(latestHistory.newTotalCost)}${
                  latestHistory.poRef ? ` dari ${latestHistory.poRef}` : ''
                }${
                  latestHistory.date
                    ? ` (${formatShortDate(latestHistory.date)})`
                    : ''
                }`
              : 'Belum ada history HPP dari backend.',
            style: styles.fieldHint,
          },
        ]}
      />
    </View>
  );
}

function addSpeciesVariantVendorPriceRow(
  controller: KolamSpeciesController,
  variantId: string,
) {
  updateSpeciesVariantRow(controller, variantId, {
    vendorPrices: [
      ...getSpeciesVariantFormRow(controller, variantId).vendorPrices,
      createEmptyKolamSpeciesVendorPriceFormRow(),
    ],
  });
}

function updateSpeciesVariantVendorPriceRow(
  controller: KolamSpeciesController,
  variantId: string,
  rowId: string,
  patch: Partial<KolamSpeciesVendorPriceFormRow>,
) {
  const variant = getSpeciesVariantFormRow(controller, variantId);
  updateSpeciesVariantRow(controller, variantId, {
    vendorPrices: variant.vendorPrices.map(row =>
      row.id === rowId ? { ...row, ...patch } : row,
    ),
  });
}

function removeSpeciesVariantVendorPriceRow(
  controller: KolamSpeciesController,
  variantId: string,
  rowId: string,
) {
  const variant = getSpeciesVariantFormRow(controller, variantId);
  updateSpeciesVariantRow(controller, variantId, {
    vendorPrices: variant.vendorPrices.filter(row => row.id !== rowId),
  });
}

function getSpeciesVariantFormRow(
  controller: KolamSpeciesController,
  variantId: string,
) {
  return (
    controller.form.variants.find(variant => variant.id === variantId) ??
    createEmptyKolamSpeciesVariantFormRow()
  );
}
function addSpeciesVariantRow(controller: KolamSpeciesController) {
  controller.onChangeForm({
    variants: [
      ...controller.form.variants,
      createEmptyKolamSpeciesVariantFormRow(),
    ],
    variantsTouched: true,
  });
}

function updateSpeciesVariantRow(
  controller: KolamSpeciesController,
  id: string,
  patch: Partial<KolamSpeciesVariantFormRow>,
) {
  controller.onChangeForm({
    variants: controller.form.variants.map(variant =>
      variant.id === id ? { ...variant, ...patch } : variant,
    ),
    variantsTouched: true,
  });
}

function removeSpeciesVariantRow(
  controller: KolamSpeciesController,
  id: string,
) {
  const nextVariants = controller.form.variants.filter(
    variant => variant.id !== id,
  );
  controller.onChangeForm({
    selectedVariantId:
      controller.form.selectedVariantId === id
        ? ''
        : controller.form.selectedVariantId,
    variants: nextVariants,
    variantsTouched: true,
  });
}
function SpeciesVideoVoiceMediaPanel({
  controller,
  onDelete,
}: {
  controller: KolamSpeciesController;
  onDelete: (target: SpeciesDeleteMediaTarget) => void;
}) {
  const selectedItem = controller.selectedSpecies;
  if (!selectedItem) {
    return null;
  }

  const item = normalizeSpeciesDetailItem(selectedItem);

  return (
    <View style={styles.mediaLinkStack}>
      {item.videoUris.map((videoUri, index) => (
        <SpeciesLinkMediaRow
          disabled={controller.saving}
          key={`${videoUri}-${index}`}
          label={`Video ${index + 1}`}
          onDelete={() =>
            onDelete({ type: 'video', index, label: `video ${index + 1}` })
          }
          onMoveDown={() => {
            void controller.onReorderVideo(index, 'down');
          }}
          onMoveUp={() => {
            void controller.onReorderVideo(index, 'up');
          }}
          showMoveDown={index < item.videoUris.length - 1}
          showMoveUp={index > 0}
          uri={videoUri}
        />
      ))}
      {item.voiceUri ? (
        <SpeciesLinkMediaRow
          disabled={controller.saving}
          label="Audio Spesies"
          onDelete={() => onDelete({ type: 'voice', label: 'audio spesies' })}
          uri={item.voiceUri}
        />
      ) : null}
    </View>
  );
}

function SpeciesVariantMediaPanel({
  controller,
  onDelete,
  showVariantSelector = true,
  variantId,
}: {
  controller: KolamSpeciesController;
  onDelete: (target: SpeciesDeleteMediaTarget) => void;
  showVariantSelector?: boolean;
  variantId?: string;
}) {
  const selectedItem = controller.selectedSpecies;
  const item = selectedItem ? normalizeSpeciesDetailItem(selectedItem) : null;
  const form = controller.form;
  const activeVariantId = variantId ?? form.selectedVariantId;
  const formVariant = form.variants.find(
    variant => variant.id === activeVariantId,
  );
  const itemVariants = item?.variants ?? [];
  const variantOptions = itemVariants.length
    ? itemVariants.map(variant => ({
        label: variant.sku
          ? `${variant.label} (${variant.sku})`
          : variant.label,
        value: variant.id,
      }))
    : form.variants.map((variant, index) => ({
        label:
          [variant.tier1Value, variant.tier2Value]
            .filter(Boolean)
            .join(' / ') || `Varian ${index + 1}`,
        value: variant.id,
      }));
  const selectedVariant =
    itemVariants.find(variant => variant.id === activeVariantId) ??
    (formVariant
      ? {
          id: formVariant.id,
          label:
            [formVariant.tier1Value, formVariant.tier2Value]
              .filter(Boolean)
              .join(' / ') || 'Varian',
          photoUris: [],
          sku: formVariant.sku,
          videoUris: [],
        }
      : null);

  if (!variantOptions.length) {
    return (
      <View style={styles.variantMediaPanel}>
        <KolamCopyStack
          items={[
            {
              id: 'empty',
              text: 'Belum ada varian untuk media.',
              style: styles.fieldHint,
            },
          ]}
        />
      </View>
    );
  }
  return (
    <View style={styles.variantMediaPanel}>
      {showVariantSelector ? (
        <KolamDropdownSelect
          accessibilityLabel="Pilih varian untuk media"
          label="Varian"
          menuStyle={styles.longDropdownMenu}
          onChange={selectedVariantId =>
            controller.onChangeForm({ selectedVariantId })
          }
          options={[{ label: 'Pilih varian', value: '' }, ...variantOptions]}
          searchable
          searchPlaceholder="Cari varian..."
          showLabelInTrigger={false}
          value={activeVariantId}
        />
      ) : null}
      <View style={styles.mediaPickerRow}>
        <KolamFormTextField
          editable={false}
          mode="url"
          placeholder="Pilih foto varian"
          style={[
            settingsWebFormStyles.settingsWebFormFieldValue,
            styles.mediaPickerInput,
          ]}
          value={form.variantPhotoLocalUri}
        />
        <KolamButton
          disabled={controller.saving || !activeVariantId}
          label="Tambah Foto Varian"
          onPress={() => {
            if (variantId) {
              controller.onChangeForm({ selectedVariantId: variantId });
            }
            void controller.onPickVariantPhoto();
          }}
        />
      </View>
      {selectedVariant ? (
        <View style={styles.existingMediaGrid}>
          {selectedVariant.photoUris.map((photoUri, index) => (
            <SpeciesImageMediaCard
              accessibilityLabel={`Foto varian ${index + 1}`}
              disabled={controller.saving}
              key={`${selectedVariant.id}-photo-${index}`}
              onDelete={() =>
                onDelete({
                  type: 'variant-photo',
                  variantId: selectedVariant.id,
                  index,
                  label: `${selectedVariant.label} foto ${index + 1}`,
                })
              }
              revision={`${selectedVariant.id}-${photoUri}`}
              sourceUri={photoUri}
              deleteLabel={`Hapus Foto ${index + 1}`}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function SpeciesImageMediaCard({
  accessibilityLabel,
  deleteLabel,
  disabled,
  onDelete,
  onMoveDown,
  onMoveUp,
  revision,
  showMoveDown = false,
  showMoveUp = false,
  sourceUri,
}: {
  accessibilityLabel: string;
  deleteLabel: string;
  disabled: boolean;
  onDelete: () => void;
  onMoveDown?: () => void;
  onMoveUp?: () => void;
  revision: string;
  showMoveDown?: boolean;
  showMoveUp?: boolean;
  sourceUri: string;
}) {
  return (
    <View style={styles.existingMediaItem}>
      <KolamRemoteImage
        accessibilityLabel={accessibilityLabel}
        resizeMode="cover"
        revision={revision}
        scope="species"
        sourceUri={sourceUri}
        style={styles.existingMediaImage}
      />
      {onMoveUp || onMoveDown ? (
        <View style={styles.mediaLinkRow}>
          <KolamButton
            disabled={disabled || !showMoveUp}
            label="Naik"
            onPress={onMoveUp ?? (() => undefined)}
          />
          <KolamButton
            disabled={disabled || !showMoveDown}
            label="Turun"
            onPress={onMoveDown ?? (() => undefined)}
          />
        </View>
      ) : null}
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

function SpeciesLinkMediaRow({
  disabled,
  label,
  onDelete,
  onMoveDown,
  onMoveUp,
  showMoveDown = false,
  showMoveUp = false,
  uri,
}: {
  disabled: boolean;
  label: string;
  onDelete: () => void;
  onMoveDown?: () => void;
  onMoveUp?: () => void;
  showMoveDown?: boolean;
  showMoveUp?: boolean;
  uri: string;
}) {
  return (
    <View style={styles.mediaLinkRow}>
      <KolamButton
        label={label}
        onPress={() => {
          void Linking.openURL(uri);
        }}
      />
      {onMoveUp || onMoveDown ? (
        <>
          <KolamButton
            disabled={disabled || !showMoveUp}
            label="Naik"
            onPress={onMoveUp ?? (() => undefined)}
          />
          <KolamButton
            disabled={disabled || !showMoveDown}
            label="Turun"
            onPress={onMoveDown ?? (() => undefined)}
          />
        </>
      ) : null}
      <KolamButton
        disabled={disabled}
        intent="danger"
        label="Hapus"
        onPress={onDelete}
      />
    </View>
  );
}

function createDeleteMediaAction(
  controller: KolamSpeciesController,
  target: SpeciesDeleteMediaTarget,
) {
  switch (target.type) {
    case 'thumbnail':
      return controller.onDeleteThumbnail();
    case 'photo':
      return controller.onDeletePhoto(target.index);
    case 'video':
      return controller.onDeleteVideo(target.index);
    case 'voice':
      return controller.onDeleteVoice();
    case 'variant-photo':
      return controller.onDeleteVariantPhoto(target.variantId, target.index);
    case 'variant-video':
      return controller.onDeleteVariantVideo(target.variantId, target.index);
    default:
      return Promise.resolve(false);
  }
}

function FieldShell({
  children,
  label,
  required = false,
  style,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
  style?: React.ComponentProps<typeof View>['style'];
}) {
  return (
    <View style={[settingsWebFormStyles.settingsWebFormField, style]}>
      <KolamCopyStack
        items={[
          {
            id: 'label',
            text: required ? `${label} *` : label,
            style: settingsWebFormStyles.settingsWebFormFieldLabel,
          },
        ]}
      />
      {children}
    </View>
  );
}
function VariantCompactField({
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
          ...(hint
            ? [{ id: 'hint', text: hint, style: styles.variantCompactHint }]
            : []),
        ]}
      />
      {children}
    </View>
  );
}
function KolamSpeciesDetail({
  controller,
  onRouteChange,
}: {
  controller: KolamSpeciesController;
  onRouteChange?: (route: string) => void;
}) {
  const [detailBarcodeOpen, setDetailBarcodeOpen] = React.useState(false);
  const selectedItem = controller.selectedSpecies;

  if (!selectedItem) {
    return (
      <View style={styles.emptyWrap}>
        <KolamEmptyState
          compact
          message="Pilih spesies dari daftar untuk melihat detail."
          title="Detail spesies belum dipilih"
        />
      </View>
    );
  }

  const item = normalizeSpeciesDetailItem(selectedItem);

  const externalLinks = createSpeciesOverviewExternalLinks(item);
  const detailLinks = [...item.links];
  const lowStockThreshold = getSpeciesLowStockThreshold(item);
  const sidebarGroups = createSpeciesSidebarGroups(
    item,
    controller.iucnStatuses,
    onRouteChange,
  );
  const detailBarcodeItems = item.sku.trim()
    ? [
        {
          code: item.sku.trim(),
          id: item.id,
          name: item.scientificName || item.displayName,
          price: getSpeciesRootListPriceToSell(item),
        },
      ]
    : [];

  return (
    <>
      <View style={styles.detailHeaderRow}>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>SPESIES</Text>
          <Text style={styles.title}>
            {item.scientificName || item.displayName}
          </Text>
          {item.commonName || item.localName ? (
            <View style={styles.nameLine}>
              {item.commonName ? (
                <Text style={styles.commonName}>{item.commonName}</Text>
              ) : null}
              {item.commonName && item.localName ? (
                <Text style={styles.nameSeparator}>|</Text>
              ) : null}
              {item.localName ? (
                <Text style={styles.localName}>{item.localName}</Text>
              ) : null}
            </View>
          ) : null}
          <Text style={styles.description}>
            {[
              item.createdAt ? `Dibuat ${formatShortDate(item.createdAt)}` : '',
              item.updatedAt
                ? `Diperbarui ${formatShortDate(item.updatedAt)}`
                : '',
            ]
              .filter(Boolean)
              .join(' | ')}
          </Text>
        </View>
      </View>
      <KolamSpeciesDetailOverview
        commonName={item.commonName}
        createdAt={item.createdAt ? formatShortDate(item.createdAt) : undefined}
        externalLinks={externalLinks}
        hero={
          <View style={styles.detailHeroImage}>
            <KolamRemoteImage
              accessibilityLabel={`Foto ${item.displayName}`}
              resizeMode="contain"
              revision={item.updatedAt ?? item.thumbnailUri ?? item.id}
              scope="species"
              sourceUri={item.thumbnailUri}
              style={styles.detailHeroImage}
            />
          </View>
        }
        localName={item.localName}
        lowStockThreshold={lowStockThreshold}
        mediaItems={createSpeciesDetailMediaItems(item)}
        meta={[
          {
            label: 'Sinkron Stok',
            value: getMarketplaceSyncLabel(item),
            valueNode: (
              <KolamMarketplaceSyncPlatformList
                platforms={item.marketplaceSync?.platforms ?? []}
              />
            ),
          },
          {
            label: 'Sinkron Terakhir',
            value: getMarketplaceSyncLastSyncedAt(item) || '-',
          },
        ]}
        metrics={[
          { label: 'Stok', value: formatNumber(item.stock) },
          { label: 'Varian', value: item.variantCount },
          { label: 'Harga Jual', value: formatCurrency(item.priceToSell) },
        ]}
        onPrintBarcode={
          detailBarcodeItems.length
            ? () => setDetailBarcodeOpen(true)
            : undefined
        }
        priceLabel={formatCurrency(item.priceToSell)}
        species={item}
        sections={[
          {
            accordion: true,
            description:
              'Daftar varian beserta harga, stok, dimensi, media, pemasok, dan penyesuaian terkait.',
            emptyText: 'Belum ada varian pada spesies ini.',
            items: createVariantDetailItems(item),
            title: 'Varian',
            total: item.variants.length,
          },
          {
            description:
              'Custom field spesifikasi utama dan varian dari backend/cache lokal.',
            emptyText: 'Belum ada custom field spesifikasi tersimpan.',
            items: createCustomFieldItems(item),
            title: 'Spesifikasi',
            total: getCustomFieldTotal(item),
          },
          {
            accordion: true,
            description: 'Terjemahan dan deskripsi yang akan dipakai webstore.',
            emptyText: 'Belum ada data terjemahan.',
            items: item.locales.map(locale => ({
              badge: locale.code.toUpperCase(),
              fields: [
                {
                  label: 'Deskripsi pendek',
                  value: locale.shortDescription,
                },
                {
                  label: 'Deskripsi panjang',
                  value: locale.description,
                },
                {
                  label: 'Morfologi',
                  value: locale.morfologis,
                },
                {
                  label: 'Habitat',
                  value: locale.habitat,
                },
                {
                  label: 'Distribusi',
                  value: locale.distribution,
                },
              ],
              meta: [
                locale.commonName ? `Nama umum: ${locale.commonName}` : '',
                locale.localName ? `Nama lokal: ${locale.localName}` : '',
              ]
                .filter(Boolean)
                .join('\n'),
              title: getLocaleLabel(locale.code),
            })),
            title: 'Konten per bahasa',
            total: item.locales.length,
          },
          {
            description:
              'Link eksternal yang tersimpan di backend dan cache lokal.',
            emptyText: 'Belum ada link eksternal.',
            items: createExternalLinkItems(detailLinks),
            title: 'Tautan',
            total: detailLinks.length,
          },
          {
            description:
              'Status sinkron stok dan harga marketplace dari backend.',
            emptyText: 'Belum ada status sinkron marketplace.',
            items: createMarketplaceSyncItems(item.marketplaceSync),
            title: 'Marketplace',
            total: getMarketplaceSyncTotal(item.marketplaceSync),
          },
          {
            description:
              'Harga beli pemasok, ongkir dari PO, total HPP, dan riwayat per varian.',
            emptyText: 'Belum ada harga pemasok/HPP varian.',
            items: createVariantVendorPriceItems(item),
            title: 'Harga Pemasok / HPP Varian',
            total: getVariantVendorPriceTotal(item),
          },
          {
            description:
              'Komisi penjualan dan poin anggota dari backend/cache lokal.',
            emptyText: 'Belum ada komisi atau poin anggota aktif.',
            items: createCommercialPolicyItems(item),
            title: 'Komisi dan Poin Anggota',
            total: getCommercialPolicyTotal(item),
          },
          {
            description:
              'Penyesuaian komponen produksi per varian dari backend/cache lokal.',
            emptyText: 'Belum ada penyesuaian bahan penyusun per varian.',
            items: createVariantComponentOverrideItems(item),
            title: 'Bahan Penyusun / Penyesuaian Komponen',
            total: getVariantComponentOverrideTotal(item),
          },
          {
            description: 'Kemasan default untuk checkout species atau varian.',
            emptyText: 'Belum ada kemasan terhubung.',
            items: createPackingLinkItems(item),
            title: 'Tautan Kemasan',
            total: item.packings.length,
          },
          {
            description:
              'Harga grosir bertingkat untuk species tanpa varian dan setiap varian.',
            emptyText: 'Belum ada harga grosir bertingkat.',
            items: createGrocerPricingTierItems(item),
            title: 'Harga Grosir',
            total: getGrocerPricingTierTotal(item),
          },
          {
            description:
              'Foto, video, audio, dan media varian yang tersinkron dari backend/cache lokal.',
            emptyText: 'Belum ada media spesies.',
            items: createMediaDetailItems(
              item,
              controller.mediaManifestSummary,
            ),
            title: 'Media',
            total: getMediaDetailTotal(item),
          },
        ]}
        sellable={item.sellable}
        sidebarGroups={sidebarGroups}
        sku={item.sku || item.id}
        status={{
          intent: item.status === 'active' ? 'success' : 'muted',
          label: getSpeciesStatusLabel(item.status),
        }}
        stock={item.stock}
        title={item.scientificName || item.displayName}
        unitLabel={item.unitLabel}
        updatedAt={item.updatedAt ? formatShortDate(item.updatedAt) : undefined}
        voiceUri={item.voiceUri}
      />
      <KolamBarcodePrintDialog
        items={detailBarcodeItems}
        onOpenChange={setDetailBarcodeOpen}
        title="Cetak Barcode Species"
        visible={detailBarcodeOpen}
      />
    </>
  );
}
function createSpeciesDetailMediaItems(
  item: KolamSpecies,
): SpeciesDetailMediaItem[] {
  const mediaItems: SpeciesDetailMediaItem[] = [];
  const seen = new Set<string>();
  const addMediaItem = (entry: SpeciesDetailMediaItem) => {
    if (!entry.uri || seen.has(`${entry.type}:${entry.uri}`)) {
      return;
    }
    seen.add(`${entry.type}:${entry.uri}`);
    mediaItems.push(entry);
  };

  const rootPhotos = item.photoUris.length
    ? item.photoUris
    : [item.thumbnailUri];
  rootPhotos
    .filter(
      (uri): uri is string => typeof uri === 'string' && uri.trim().length > 0,
    )
    .forEach((uri, index) => {
      addMediaItem({
        id: `species-photo-${index}`,
        label: `Foto species ${index + 1}`,
        revision: `${item.updatedAt ?? item.id}-photo-${index}`,
        scope: 'species',
        type: 'image',
        uri,
      });
    });

  item.variants.forEach((variant, variantIndex) => {
    variant.photoUris.forEach((uri, photoIndex) => {
      addMediaItem({
        badgeLabel: variant.label || `Varian ${variantIndex + 1}`,
        id: `variant-photo-${variant.id}-${photoIndex}`,
        label: `${variant.label || `Varian ${variantIndex + 1}`} ${
          photoIndex + 1
        }`,
        revision: `${item.updatedAt ?? item.id}-${variant.id}-${photoIndex}`,
        scope: 'species',
        type: 'image',
        uri,
      });
    });
  });

  item.videoUris.forEach((uri, index) => {
    addMediaItem({
      id: `species-video-${index}`,
      label: `Video species ${index + 1}`,
      type: 'video',
      uri: getKolamFileUrl(uri) ?? uri,
    });
  });

  return mediaItems;
}
function createSpeciesSidebarGroups(
  item: KolamSpecies,
  iucnStatuses: KolamSpeciesController['iucnStatuses'],
  onRouteChange?: (route: string) => void,
): SpeciesSidebarGroup[] {
  return [
    {
      chips: getSpeciesTaxonomyChips(item, onRouteChange),
      emptyText: 'Belum ada taksonomi',
      label: 'Taksonomi',
    },
    {
      chips: item.categories.map(category => ({
        id: category.id || category.name,
        label: category.name,
        onPress: category.name
          ? () =>
              onRouteChange?.(
                `/label-dan-field/kategori/${encodeURIComponent(
                  category.name,
                )}`,
              )
          : undefined,
        tone: 'category',
      })),
      emptyText: 'Belum ada kategori',
      label: 'Kategori',
    },
    {
      chips: item.tags.map(tag => ({
        id: tag.id || tag.name,
        label: tag.name,
        onPress: tag.name
          ? () => onRouteChange?.(`/tags/${encodeURIComponent(tag.name)}`)
          : undefined,
      })),
      emptyText: 'Belum ada tag',
      label: 'Tag',
    },
    {
      chips: getSpeciesIucnChips(item, iucnStatuses, onRouteChange),
      emptyText: 'Belum ada status IUCN',
      label: 'Status Daftar Merah IUCN',
    },
  ];
}

function getSpeciesTaxonomyChips(
  item: KolamSpecies,
  onRouteChange?: (route: string) => void,
) {
  const raw = getRawRecord(item.raw);
  const taxonomy = getRawRecord(raw.taxonomy);
  const ancestors = Array.isArray(taxonomy.ancestors) ? taxonomy.ancestors : [];
  const refs = [...ancestors, taxonomy]
    .map(toSidebarRef)
    .filter(Boolean) as Array<{ id: string; label: string; slug?: string }>;

  if (!refs.length && item.taxonomy) {
    refs.push({
      id: item.taxonomy.id || item.taxonomy.name,
      label: item.taxonomy.name,
    });
  }

  const seen = new Set<string>();
  return refs
    .filter(ref => {
      const key = ref.id || ref.label;
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .map(ref => ({
      id: ref.id || ref.label,
      label: ref.label,
      onPress: () =>
        onRouteChange?.(
          `/taxonomy/${encodeURIComponent(ref.slug || ref.label || ref.id)}`,
        ),
    }));
}

function getSpeciesIucnChips(
  item: KolamSpecies,
  iucnStatuses: KolamSpeciesController['iucnStatuses'],
  onRouteChange?: (route: string) => void,
) {
  const raw = getRawRecord(item.raw);
  const iucn = getRawRecord(
    raw.iucnStatus ?? raw.iucn_status ?? raw.iucn ?? null,
  );
  const id =
    getRawString(iucn, '_id') ||
    getRawString(iucn, 'id') ||
    item.iucnStatus?.id ||
    '';
  const rawAbbreviation = (
    getRawString(iucn, 'abbreviation') ||
    getRawString(iucn, 'code') ||
    ''
  ).toUpperCase();
  const rawName = item.iucnStatus?.name || getRawString(iucn, 'name');
  const matchedIucn = iucnStatuses.find(status => {
    const statusAbbreviation = status.abbreviation.toUpperCase();
    return (
      status.id === id ||
      status.id === item.iucnStatus?.id ||
      (!!rawAbbreviation && statusAbbreviation === rawAbbreviation) ||
      (!!rawName && status.name === rawName)
    );
  });
  const abbreviation = rawAbbreviation || matchedIucn?.abbreviation || '';
  const name = rawName || matchedIucn?.name || '';
  const imagePath =
    getRawString(iucn, 'imageUri') ||
    getRawString(iucn, 'image') ||
    getRawString(iucn, 'icon') ||
    matchedIucn?.imageUri ||
    matchedIucn?.image ||
    '';
  const imageUri = imagePath ? getKolamFileUrl(imagePath) ?? imagePath : null;
  const label = [abbreviation, name].filter(Boolean).join(' - ');

  if (!label) {
    return [];
  }

  return [
    {
      id: id || abbreviation || label,
      imageUri,
      label,
      onPress: () => {
        if (onRouteChange) {
          onRouteChange(
            `/iucn-status/${encodeURIComponent(
              abbreviation || name || id || label,
            )}`,
          );
          return;
        }
        if (item.iucnLink) {
          openExternalUrl(item.iucnLink);
        }
      },
    },
  ];
}

function toSidebarRef(value: unknown) {
  const record = getRawRecord(value);
  const id = getRawString(record, '_id') || getRawString(record, 'id');
  const label =
    getRawString(record, 'name') || getRawString(record, 'scientificName');
  const slug = getRawString(record, 'slug');

  if (!label) {
    return null;
  }

  return { id: id || label, label, slug };
}

function getRawRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function getRawString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}
function getSpeciesLowStockThreshold(item: KolamSpecies) {
  const raw =
    item.raw && typeof item.raw === 'object'
      ? (item.raw as Record<string, unknown>)
      : {};
  const value = Number(raw.lowStockThreshold ?? raw.low_stock_threshold ?? 10);
  return Number.isFinite(value) && value > 0 ? value : 10;
}
function normalizeSpeciesDetailItem(item: KolamSpecies): KolamSpecies {
  return {
    ...item,
    categories: Array.isArray(item.categories) ? item.categories : [],
    customFieldValues: Array.isArray(item.customFieldValues)
      ? item.customFieldValues
      : [],
    grocerPricingTiers: Array.isArray(item.grocerPricingTiers)
      ? item.grocerPricingTiers
      : [],
    links: Array.isArray(item.links) ? item.links : [],
    locales: Array.isArray(item.locales) ? item.locales : [],
    marketplaceSync: {
      label: item.marketplaceSync?.label || 'Belum sinkron',
      lastSyncedAt: item.marketplaceSync?.lastSyncedAt,
      platforms: Array.isArray(item.marketplaceSync?.platforms)
        ? item.marketplaceSync.platforms
        : [],
      pricePlatforms: Array.isArray(item.marketplaceSync?.pricePlatforms)
        ? item.marketplaceSync.pricePlatforms
        : [],
    },
    packings: Array.isArray(item.packings) ? item.packings : [],
    photoUris: Array.isArray(item.photoUris) ? item.photoUris : [],
    tags: Array.isArray(item.tags) ? item.tags : [],
    variants: Array.isArray(item.variants)
      ? item.variants.map(normalizeSpeciesVariantDetailItem)
      : [],
    videoUris: Array.isArray(item.videoUris) ? item.videoUris : [],
  };
}

function createSpeciesOverviewExternalLinks(item: KolamSpecies): Array<{
  label: string;
  name: KolamSpeciesLinkName;
  onPress: () => void;
  value: string;
}> {
  const shopee = item.links.find(link => link.name === 'shopee');
  const tokopedia = item.links.find(link => link.name === 'tokopedia');
  const webstoreUrl = createSpeciesWebstoreUrl(item);
  const links = [
    shopee,
    tokopedia,
    webstoreUrl
      ? {
          label: 'Webstore',
          name: 'website' as KolamSpeciesLinkName,
          value: webstoreUrl,
        }
      : undefined,
  ].filter(
    (
      link,
    ): link is {
      label: string;
      name: KolamSpeciesLinkName;
      value: string;
    } => Boolean(link),
  );

  return links.map(link => ({
    ...link,
    onPress: () => openExternalUrl(link.value),
  }));
}

function createSpeciesWebstoreUrl(item: KolamSpecies) {
  const slug = item.slug?.trim();
  if (!slug) {
    return '';
  }

  return `https://dunia-anura.com/id/species/${encodeURIComponent(slug)}`;
}

function normalizeSpeciesVariantDetailItem(
  variant: KolamSpecies['variants'][number],
): KolamSpecies['variants'][number] {
  return {
    ...variant,
    componentOverrides: Array.isArray(variant.componentOverrides)
      ? variant.componentOverrides
      : [],
    customFieldValues: Array.isArray(variant.customFieldValues)
      ? variant.customFieldValues
      : [],
    grocerPricingTiers: Array.isArray(variant.grocerPricingTiers)
      ? variant.grocerPricingTiers
      : [],
    photoUris: Array.isArray(variant.photoUris) ? variant.photoUris : [],
    vendorPrices: Array.isArray(variant.vendorPrices)
      ? variant.vendorPrices
      : [],
    videoUris: Array.isArray(variant.videoUris) ? variant.videoUris : [],
  };
}
function getSpeciesDetailVariants(item: KolamSpecies) {
  return Array.isArray(item.variants)
    ? item.variants.map(normalizeSpeciesVariantDetailItem)
    : [];
}
function createVariantDetailItems(item: KolamSpecies) {
  const variants = getSpeciesDetailVariants(item);

  return variants.map((variant, index) => ({
    badge: variant.stock > 0 ? 'Aktif' : undefined,
    thumbnail: variant.photoUris[0] ? (
      <KolamRemoteImage
        accessibilityLabel={`Foto ${variant.label}`}
        resizeMode="cover"
        revision={`${item.updatedAt ?? item.id}-${variant.id}`}
        scope="species"
        sourceUri={variant.photoUris[0]}
        style={styles.sectionThumb}
      />
    ) : undefined,
    title: variant.label || `Varian ${index + 1}`,
    value: `${formatCurrency(variant.priceToSell)} | Stok ${formatNumber(
      variant.stock,
    )}`,
    meta: [
      variant.sku ? `SKU: ${variant.sku}` : '',
      variant.productCode ? `Kode produk: ${variant.productCode}` : '',
      `HPP: ${formatCurrency(variant.price)}`,
      `Online: ${formatCurrency(variant.onlinePrice)}`,
      `Harga pasar: ${formatCurrency(variant.marketPrice)}`,
      `Minimum jual: ${formatCurrency(variant.minimumPriceToSales)}`,
      `Minimum order: ${formatNumber(variant.minimumOrderQty)}`,
      variant.weightValue ? `Berat: ${formatNumber(variant.weightValue)}` : '',
      getVariantDimensionLabel(variant),
      `Foto: ${variant.photoUris.length}`,
      `Video: ${variant.videoUris.length}`,
      `Harga pemasok: ${variant.vendorPrices.length}`,
      `Harga grosir: ${variant.grocerPricingTiers.length}`,
      `Penyesuaian bahan: ${variant.componentOverrides.length}`,
      `Field kustom: ${variant.customFieldValues.length}`,
    ]
      .filter(Boolean)
      .join('\n'),
  }));
}

function getVariantDimensionLabel(variant: KolamSpecies['variants'][number]) {
  if (
    !variant.dimensionLength &&
    !variant.dimensionWidth &&
    !variant.dimensionHeight
  ) {
    return '';
  }

  return `Dimensi: ${formatNumber(variant.dimensionLength)} x ${formatNumber(
    variant.dimensionWidth,
  )} x ${formatNumber(variant.dimensionHeight)}`;
}

function createExternalLinkItems(
  links: Array<{ label: string; value: string }>,
) {
  return links.map(link => ({
    title: link.label,
    value: link.value,
  }));
}

function createCustomFieldItems(item: KolamSpecies) {
  const customFieldValues = Array.isArray(item.customFieldValues)
    ? item.customFieldValues
    : [];
  const variants = getSpeciesDetailVariants(item);
  const rootItems = customFieldValues.map(field => ({
    thumbnail: (
      <KolamCustomFieldIcon field={createCustomFieldIconAdapter(field)} />
    ),
    title: `Spesies - ${field.fieldLabel}`,
    value: field.valueLabel,
  }));
  const variantItems = variants.flatMap(variant =>
    (Array.isArray(variant.customFieldValues)
      ? variant.customFieldValues
      : []
    ).map(field => ({
      thumbnail: (
        <KolamCustomFieldIcon field={createCustomFieldIconAdapter(field)} />
      ),
      title: `${variant.label} - ${field.fieldLabel}`,
      value: field.valueLabel,
    })),
  );

  return [...rootItems, ...variantItems];
}

function createCustomFieldIconAdapter(
  field: KolamSpeciesCustomFieldValue,
): KolamCustomField {
  const raw =
    field.raw && typeof field.raw === 'object'
      ? (field.raw as Record<string, unknown>)
      : {};
  const rawField =
    raw.field && typeof raw.field === 'object'
      ? (raw.field as Record<string, unknown>)
      : raw;

  return {
    createdAt: '',
    defaultValue: null,
    description: '',
    fieldKey:
      getCustomFieldAdapterString(rawField, 'fieldKey') || field.fieldId,
    fieldLabel: field.fieldLabel || 'Field kustom',
    fieldType: 'string',
    hasMinMax: false,
    iconUrl:
      getKolamFileUrl(getCustomFieldAdapterString(rawField, 'icon')) ?? null,
    id: field.fieldId || field.fieldLabel || 'custom-field',
    maxAllowed: null,
    minAllowed: null,
    options: [],
    order: 0,
    raw: field.raw,
    required: false,
    requiresUnit: Boolean(field.unitLabel),
    status: 'active',
    translations: {},
    unitId: '',
    unitLabel: field.unitLabel,
    updatedAt: '',
  };
}

function getCustomFieldAdapterString(
  record: Record<string, unknown>,
  key: string,
) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function getCustomFieldTotal(item: KolamSpecies) {
  const customFieldValues = Array.isArray(item.customFieldValues)
    ? item.customFieldValues
    : [];
  const variants = getSpeciesDetailVariants(item);

  return (
    customFieldValues.length +
    variants.reduce(
      (total, variant) =>
        total +
        (Array.isArray(variant.customFieldValues)
          ? variant.customFieldValues.length
          : 0),
      0,
    )
  );
}

function createMediaDetailItems(
  item: KolamSpecies,
  mediaManifest: KolamSpeciesController['mediaManifestSummary'],
) {
  const photoUris = Array.isArray(item.photoUris) ? item.photoUris : [];
  const videoUris = Array.isArray(item.videoUris) ? item.videoUris : [];
  const variants = getSpeciesDetailVariants(item);
  const rootPhotos = photoUris.map((uri, index) => ({
    thumbnail: (
      <KolamRemoteImage
        accessibilityLabel={`Foto spesies ${index + 1}`}
        resizeMode="cover"
        revision={`${item.updatedAt ?? item.id}-photo-${index}`}
        scope="species"
        sourceUri={uri}
        style={styles.sectionThumb}
      />
    ),
    title: `Spesies - Foto ${index + 1}`,
    value: 'Foto root',
  }));
  const rootVideos = videoUris.map((uri, index) => ({
    title: `Spesies - Video ${index + 1}`,
    value: uri,
  }));
  const rootVoice = item.voiceUri
    ? [
        {
          title: 'Spesies - Audio',
          value: item.voiceUri,
        },
      ]
    : [];
  const variantPhotos = variants.flatMap(variant =>
    (Array.isArray(variant.photoUris) ? variant.photoUris : []).map(
      (uri, index) => ({
        thumbnail: (
          <KolamRemoteImage
            accessibilityLabel={`Foto ${variant.label} ${index + 1}`}
            resizeMode="cover"
            revision={`${item.updatedAt ?? item.id}-${
              variant.id
            }-photo-${index}`}
            scope="species"
            sourceUri={uri}
            style={styles.sectionThumb}
          />
        ),
        title: `${variant.label} - Foto ${index + 1}`,
        value: 'Foto varian',
      }),
    ),
  );
  const variantVideos = variants.flatMap(variant =>
    (Array.isArray(variant.videoUris) ? variant.videoUris : []).map(
      (uri, index) => ({
        title: `${variant.label} - Video ${index + 1}`,
        value: uri,
      }),
    ),
  );

  const manifestItems = mediaManifest.total
    ? [
        {
          badge: mediaManifest.errors ? 'Perlu cek' : 'Terindeks',
          title: 'Manifest media',
          value: `${formatNumber(mediaManifest.videos)} video / ${formatNumber(
            mediaManifest.voices,
          )} audio`,
          meta: [
            `Terindeks: ${formatNumber(
              mediaManifest.indexed,
            )} dari ${formatNumber(mediaManifest.total)}`,
            mediaManifest.byteLength
              ? `Ukuran remote: ${formatBytes(mediaManifest.byteLength)}`
              : '',
            mediaManifest.errors
              ? `${formatNumber(
                  mediaManifest.errors,
                )} media perlu dicek ulang saat server live`
              : '',
          ]
            .filter(Boolean)
            .join('\n'),
        },
      ]
    : [];
  return [
    ...manifestItems,
    ...rootPhotos,
    ...rootVideos,
    ...rootVoice,
    ...variantPhotos,
    ...variantVideos,
  ];
}

function getMediaDetailTotal(item: KolamSpecies) {
  const photoUris = Array.isArray(item.photoUris) ? item.photoUris : [];
  const videoUris = Array.isArray(item.videoUris) ? item.videoUris : [];
  const variants = getSpeciesDetailVariants(item);

  return (
    photoUris.length +
    videoUris.length +
    (item.voiceUri ? 1 : 0) +
    variants.reduce(
      (total, variant) =>
        total +
        (Array.isArray(variant.photoUris) ? variant.photoUris.length : 0) +
        (Array.isArray(variant.videoUris) ? variant.videoUris.length : 0),
      0,
    )
  );
}

function createPackingLinkItems(item: KolamSpecies) {
  const packings = Array.isArray(item.packings) ? item.packings : [];
  const variants = getSpeciesDetailVariants(item);

  return packings.map(link => {
    const variant = link.variantId
      ? variants.find(candidate => candidate.id === link.variantId)
      : null;
    const target = variant?.label ?? 'Species root';

    return {
      title: `${target}: ${link.packingName}`,
      value: `Jumlah ${formatNumber(link.quantity)}${
        link.packingCategory ? ` | ${link.packingCategory}` : ''
      }`,
    };
  });
}

function createVariantComponentOverrideItems(item: KolamSpecies) {
  const variants = getSpeciesDetailVariants(item);

  return variants.flatMap(variant =>
    (Array.isArray(variant.componentOverrides)
      ? variant.componentOverrides
      : []
    ).map(component => ({
      title: `${variant.label}: ${component.productName}`,
      value: `Qty ${formatNumber(component.quantity)}${
        component.productSku ? ` | SKU ${component.productSku}` : ''
      }`,
    })),
  );
}

function getVariantComponentOverrideTotal(item: KolamSpecies) {
  const variants = getSpeciesDetailVariants(item);

  return variants.reduce(
    (total, variant) =>
      total +
      (Array.isArray(variant.componentOverrides)
        ? variant.componentOverrides.length
        : 0),
    0,
  );
}

function createCommercialPolicyItems(item: KolamSpecies) {
  const rootItems = [
    item.commissionEnabled
      ? {
          title: 'Spesies - Komisi',
          value: formatCommissionValue(
            item.commissionType,
            item.commissionValue,
          ),
        }
      : null,
    item.memberPoints?.enabled && item.memberPoints.points > 0
      ? {
          title: 'Spesies - Poin Anggota',
          value: `${formatNumber(item.memberPoints.points)} poin per unit`,
        }
      : null,
  ].filter(Boolean) as { title: string; value: string }[];

  const variants = getSpeciesDetailVariants(item);
  const variantItems = variants.flatMap(
    variant =>
      [
        variant.commissionEnabled
          ? {
              title: `${variant.label} - Komisi`,
              value: formatCommissionValue(
                variant.commissionType,
                variant.commissionValue,
              ),
            }
          : null,
        variant.memberPoints?.enabled && variant.memberPoints.points > 0
          ? {
              title: `${variant.label} - Poin Anggota`,
              value: `${formatNumber(
                variant.memberPoints.points,
              )} poin per unit`,
            }
          : null,
      ].filter(Boolean) as { title: string; value: string }[],
  );

  return [...rootItems, ...variantItems];
}

function getCommercialPolicyTotal(item: KolamSpecies) {
  return createCommercialPolicyItems(item).length;
}

function formatCommissionValue(type: 'percentage' | 'fixed', value: number) {
  return type === 'fixed' ? formatCurrency(value) : `${formatNumber(value)}%`;
}

function createGrocerPricingTierItems(item: KolamSpecies) {
  const grocerPricingTiers = Array.isArray(item.grocerPricingTiers)
    ? item.grocerPricingTiers
    : [];
  const variants = getSpeciesDetailVariants(item);
  const rootItems = grocerPricingTiers.map((tier, index) => ({
    title: `Tier Spesies ${index + 1}`,
    value: `Mulai ${formatNumber(tier.minQty)} unit | POS ${formatCurrency(
      tier.price,
    )} | Online ${formatCurrency(tier.onlinePrice)}`,
  }));
  const variantItems = variants.flatMap(variant =>
    (Array.isArray(variant.grocerPricingTiers)
      ? variant.grocerPricingTiers
      : []
    ).map((tier, index) => ({
      title: `${variant.label} - Tier ${index + 1}`,
      value: `Mulai ${formatNumber(tier.minQty)} unit | POS ${formatCurrency(
        tier.price,
      )} | Online ${formatCurrency(tier.onlinePrice)}`,
    })),
  );

  return [...rootItems, ...variantItems];
}

function getGrocerPricingTierTotal(item: KolamSpecies) {
  const grocerPricingTiers = Array.isArray(item.grocerPricingTiers)
    ? item.grocerPricingTiers
    : [];
  const variants = getSpeciesDetailVariants(item);

  return (
    grocerPricingTiers.length +
    variants.reduce(
      (total, variant) =>
        total +
        (Array.isArray(variant.grocerPricingTiers)
          ? variant.grocerPricingTiers.length
          : 0),
      0,
    )
  );
}
function createVariantVendorPriceItems(item: KolamSpecies) {
  const variants = getSpeciesDetailVariants(item);

  return variants.flatMap(variant =>
    (Array.isArray(variant.vendorPrices) ? variant.vendorPrices : []).map(
      price => ({
        title: `${variant.label}: ${price.vendorName}`,
        value: `Total HPP ${formatCurrency(
          price.totalCost,
        )} | Harga ${formatCurrency(price.price)} | Ongkir ${formatCurrency(
          price.shippingCost,
        )}`,
        meta: [
          price.link ? `Tautan: ${price.link}` : '',
          Array.isArray(price.priceHistory) && price.priceHistory.length
            ? `Riwayat terakhir: ${formatVariantVendorHistory(
                price.priceHistory[0],
              )}`
            : 'Belum ada history HPP',
        ]
          .filter(Boolean)
          .join('\n'),
      }),
    ),
  );
}

function getVariantVendorPriceTotal(item: KolamSpecies) {
  const variants = getSpeciesDetailVariants(item);

  return variants.reduce(
    (total, variant) =>
      total +
      (Array.isArray(variant.vendorPrices) ? variant.vendorPrices.length : 0),
    0,
  );
}

function formatVariantVendorHistory(
  history: KolamSpeciesVendorPriceFormRow['priceHistory'][number],
) {
  return `${formatCurrency(history.oldTotalCost)} ke ${formatCurrency(
    history.newTotalCost,
  )}${history.poRef ? ` dari ${history.poRef}` : ''}${
    history.date ? ` (${formatShortDate(history.date)})` : ''
  }`;
}
function MarketplaceSyncPanel({ item }: { item: KolamSpecies | null }) {
  if (!item) {
    return null;
  }

  const syncItems = createMarketplaceSyncItems(item.marketplaceSync);
  const syncLabel = getMarketplaceSyncLabel(item);
  const lastSyncedAt = getMarketplaceSyncLastSyncedAt(item);

  return (
    <FieldShell label="Status Sinkron Stok">
      <View style={styles.marketplaceSyncPanel}>
        <KolamStatusBadge
          intent={getMarketplaceSyncBadgeIntent(syncLabel)}
          label={syncLabel}
        />
        <KolamCopyStack
          items={[
            {
              id: 'last-sync',
              text: lastSyncedAt
                ? 'Terakhir sinkron: ' + lastSyncedAt
                : 'Belum ada waktu sync dari backend.',
              style: styles.fieldHint,
            },
          ]}
        />
        {syncItems.length ? (
          <View style={styles.marketplaceSyncGrid}>
            {syncItems.map(sync => (
              <View key={sync.id} style={styles.marketplaceSyncCard}>
                <KolamCopyStack
                  items={[
                    {
                      id: 'title',
                      text: sync.title,
                      style: styles.rowText,
                      textProps: { numberOfLines: 1 },
                    },
                    {
                      id: 'value',
                      text: sync.value,
                      style: styles.rowSubtext,
                      textProps: { numberOfLines: 2 },
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </FieldShell>
  );
}

function createMarketplaceSyncItems(sync: KolamSpecies['marketplaceSync']) {
  const platforms = getMarketplaceSyncPlatforms(sync);

  return [
    ...platforms.stock.map(platform =>
      createMarketplaceSyncItem(platform, 'Stok'),
    ),
    ...platforms.price.map(platform =>
      createMarketplaceSyncItem(platform, 'Harga'),
    ),
  ];
}

function getMarketplaceSyncPlatforms(sync: KolamSpecies['marketplaceSync']) {
  return {
    stock: Array.isArray(sync?.platforms) ? sync.platforms : [],
    price: Array.isArray(sync?.pricePlatforms) ? sync.pricePlatforms : [],
  };
}

function getMarketplaceSyncTotal(sync: KolamSpecies['marketplaceSync']) {
  const platforms = getMarketplaceSyncPlatforms(sync);
  return platforms.stock.length + platforms.price.length;
}

function getMarketplaceSyncLabel(item: KolamSpecies) {
  return item.marketplaceSync?.label || 'Belum sinkron';
}

function getMarketplaceSyncLastSyncedAt(item: KolamSpecies) {
  return item.marketplaceSync?.lastSyncedAt || '';
}

function createMarketplaceSyncItem(
  platform: KolamSpeciesMarketplaceSyncPlatform,
  kind: 'Stok' | 'Harga',
) {
  return {
    id: kind + '-' + platform.platform,
    title:
      kind +
      ' ' +
      platform.label +
      ': ' +
      getMarketplaceSyncShortStatusLabel(platform.status),
    value:
      [
        platform.lastSyncedAt ? 'Sinkron: ' + platform.lastSyncedAt : '',
        platform.lastError ? 'Error: ' + platform.lastError : '',
        platform.variantCount ? platform.variantCount + ' varian' : '',
        platform.lastTaskId ? 'Task: ' + platform.lastTaskId : '',
      ]
        .filter(Boolean)
        .join(' | ') || 'Belum ada detail sinkron.',
  };
}

function getMarketplaceSyncBadgeIntent(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.includes('gagal') || normalized.includes('failed')) {
    return 'danger' as const;
  }
  if (normalized.includes('sinkron')) {
    return 'success' as const;
  }
  return 'muted' as const;
}
function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <KolamContentFrame style={styles.summaryTile} variant="settingsWebConfig">
      <KolamCopyStack
        items={[
          {
            id: 'value',
            text: formatNumber(value),
            style: styles.summaryValue,
          },
          {
            id: 'label',
            text: label,
            style: styles.summaryLabel,
          },
        ]}
      />
    </KolamContentFrame>
  );
}

function getSpeciesRoute(item: KolamSpecies) {
  return `/species/${encodeURIComponent(
    item.slug || slugifySpeciesName(item.scientificName) || item.id,
  )}`;
}

function openExternalUrl(value: string) {
  const url = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  void Linking.openURL(url);
}

function getLocaleLabel(code: string) {
  switch (code) {
    case 'id':
      return 'Indonesia';
    case 'en':
      return 'English';
    case 'fr':
      return 'Francais';
    case 'zh':
      return 'Chinese';
    case 'hi':
      return 'Hindi';
    case 'ar':
      return 'Arabic';
    case 'ja':
      return 'Japanese';
    default:
      return code.toUpperCase();
  }
}

function isSpeciesWeightUnit(unit: { initial?: string; name: string }) {
  const initial = (unit.initial || '').toLowerCase().trim();
  const name = unit.name.toLowerCase().trim();
  const allowedInitials = ['kg', 'g', 'gr', 'gram', 'kilogram'];
  const allowedNames = ['kilogram', 'gram', 'kilogramme', 'gramme'];
  return (
    allowedInitials.some(item => initial === item) ||
    allowedNames.some(item => name.includes(item))
  );
}

function isSpeciesDimensionUnit(unit: { initial?: string; name: string }) {
  const initial = (unit.initial || '').toLowerCase().trim();
  const name = unit.name.toLowerCase().trim();
  const allowedInitials = [
    'cm',
    'centimeter',
    'centimetre',
    'm',
    'meter',
    'metre',
    'mm',
    'millimeter',
    'millimetre',
    'in',
    'inch',
    'inches',
  ];
  const allowedNames = [
    'centimeter',
    'centimetre',
    'meter',
    'metre',
    'millimeter',
    'millimetre',
    'inch',
    'inches',
  ];
  const excludedNames = [
    'kilogram',
    'kilobyte',
    'kilowatt',
    'kilovolt',
    'kilojoule',
    'kilometer',
    'kilometre',
  ];
  if (allowedInitials.some(item => initial === item)) {
    return true;
  }
  return (
    allowedNames.some(item => name.includes(item)) &&
    !excludedNames.some(item => name.includes(item))
  );
}
function getCheapestSpeciesVendorCost(rows: KolamSpeciesVendorPriceFormRow[]) {
  const totals = rows
    .map(row => {
      const price = parseCurrencyInput(row.price);
      const shippingCost = parseCurrencyInput(row.shippingCost);
      const totalCost = price + shippingCost;
      return totalCost > 0 ? totalCost : null;
    })
    .filter((value): value is number => value !== null);

  if (!totals.length) {
    return null;
  }

  return Math.min(...totals);
}
function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    currency: 'IDR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value || 0);
}

function formatPriceRb(value: number) {
  const parsed = Math.round(Number(value) || 0);
  if (parsed <= 0) {
    return '';
  }

  const thousands = parsed / 1000;
  if (Number.isInteger(thousands)) {
    return `${formatNumber(thousands)} rb`;
  }

  return `${thousands.toLocaleString('id-ID', {
    maximumFractionDigits: 1,
  })} rb`;
}

function getSpeciesListPriceLabel(item: KolamSpecies) {
  const variants = Array.isArray(item.variants) ? item.variants : [];
  if (item.hasVariants || variants.length > 0) {
    const prices = variants
      .map(getSpeciesVariantListPriceToSell)
      .filter(price => Number.isFinite(price) && price > 0);

    if (!prices.length) {
      return 'Belum ada harga varian';
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    if (minPrice === maxPrice) {
      return formatPriceRb(minPrice);
    }

    return `${formatPriceRb(minPrice)} -\n${formatPriceRb(maxPrice)}`;
  }

  const priceToSell = getSpeciesRootListPriceToSell(item);
  return priceToSell > 0 ? formatPriceRb(priceToSell) : 'Belum ada harga';
}

function getSpeciesRootListPriceToSell(item: KolamSpecies) {
  if (Number.isFinite(item.priceToSell) && item.priceToSell > 0) {
    return item.priceToSell;
  }

  const raw =
    item.raw && typeof item.raw === 'object'
      ? (item.raw as Record<string, unknown>)
      : {};
  return firstPositiveNumber(
    raw.price_to_sell,
    raw.priceToSell,
    raw.sellingPrice,
    raw.onlinePrice,
    raw.price,
  );
}

function getSpeciesVariantListPriceToSell(
  variant: KolamSpecies['variants'][number],
) {
  if (Number.isFinite(variant.priceToSell) && variant.priceToSell > 0) {
    return variant.priceToSell;
  }

  const raw =
    variant.raw && typeof variant.raw === 'object'
      ? (variant.raw as Record<string, unknown>)
      : {};
  return firstPositiveNumber(
    raw.price_to_sell,
    raw.priceToSell,
    raw.sellingPrice,
    raw.onlinePrice,
    raw.price,
  );
}

function firstPositiveNumber(...values: unknown[]) {
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 0;
}

function getSpeciesListTotalStock(item: KolamSpecies) {
  const variants = Array.isArray(item.variants) ? item.variants : [];
  if (item.hasVariants || variants.length > 0) {
    return variants.reduce(
      (total, variant) => total + Math.max(0, Number(variant.stock) || 0),
      0,
    );
  }

  return Math.max(0, Number(item.stock) || 0);
}

function getMarketplaceSyncStatusIntent(
  status: KolamSpeciesMarketplaceSyncPlatform['status'],
) {
  switch (status) {
    case 'synced':
      return 'success';
    case 'pending':
      return 'primary';
    case 'partial':
    case 'notFound':
      return 'warning';
    case 'failed':
      return 'danger';
    case 'skipped':
    case 'unknown':
    default:
      return 'muted';
  }
}

function getMarketplaceSyncShortStatusLabel(
  status: KolamSpeciesMarketplaceSyncPlatform['status'],
) {
  switch (status) {
    case 'pending':
      return 'Antre';
    case 'synced':
    case 'skipped':
      return 'Sinkron';
    case 'notFound':
      return 'Tidak ditemukan';
    case 'failed':
      return 'gagal';
    case 'partial':
      return 'Sebagian';
    case 'unknown':
    default:
      return 'Belum sinkron';
  }
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMinutes < 1) {
    return 'baru saja';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m lalu`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}j lalu`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}h lalu`;
}
function formatBytes(value: number) {
  if (!value) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1,
  );
  const size = value / 1024 ** exponent;

  return (
    size.toFixed(size >= 10 || exponent === 0 ? 0 : 1) + ' ' + units[exponent]
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function parseCurrencyInput(value: string) {
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

const styles = StyleSheet.create({
  surface: {
    gap: 16,
  },
  listSurface: {
    flex: 1,
    minHeight: 0,
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
  detailHeaderRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
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
  nameLine: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  commonName: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  localName: {
    color: V.colors.mutedFg,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  nameSeparator: {
    color: V.colors.mutedFg,
    fontSize: 13,
    lineHeight: 20,
  },
  description: {
    color: V.colors.mutedFg,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  errorBadge: {
    alignSelf: 'flex-start',
  },
  stack: {
    gap: 16,
    overflow: 'visible',
    position: 'relative',
  },
  listStack: {
    flex: 1,
    minHeight: 0,
  },
  speciesEditSection: {
    gap: 0,
    padding: 0,
  },
  speciesEditSectionHeader: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  speciesEditSectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 21,
  },
  speciesEditSectionDescription: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 3,
  },
  speciesEditSectionBody: {
    gap: 12,
    padding: 14,
  },
  speciesBasicInfoCard: {
    backgroundColor: '#f9fafb',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  speciesBasicInfoHalfField: {
    flexBasis: 0,
    flexGrow: 1,
    minWidth: 240,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryTile: {
    flexBasis: 220,
    flexGrow: 1,
  },
  summaryValue: {
    color: V.colors.fg,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  summaryLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  speciesToolbarWrap: {
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
    elevation: 1000,
  },
  speciesFilterOverlayPanel: {
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
    zIndex: 120000,
  },
  speciesFilterPanelSearch: {
    marginBottom: 6,
  },
  speciesFilterPanelScroll: {
    maxHeight: 240,
  },
  speciesFilterPanelContent: {
    gap: 4,
  },
  speciesFilterPanelOption: {
    justifyContent: 'flex-start',
  },
  speciesFilterPanelEmpty: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  speciesFilterPanelFooter: {
    alignItems: 'flex-end',
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    marginTop: 6,
    paddingTop: 6,
  },
  speciesHeaderActions: {
    alignItems: 'center',
    borderLeftColor: V.colors.border,
    borderLeftWidth: 1,
    flexDirection: 'row',
    flexShrink: 0,
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
    paddingLeft: 8,
  },
  speciesToolbarButton: {
    minHeight: 34,
    paddingHorizontal: 10,
  },
  speciesSyncStatus: {
    alignSelf: 'flex-start',
    maxWidth: 760,
  },
  speciesTableFrame: {
    elevation: 0,
    position: 'relative',
    zIndex: 1,
  },
  tableToolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    zIndex: 9200,
    elevation: 96,
  },
  searchInput: {
    minWidth: 220,
  },
  emptyWrap: {
    padding: 24,
  },
  speciesTableIdentityCell: {
    alignItems: 'center',
    flexDirection: 'row',
    minWidth: 0,
    overflow: 'visible',
    width: '100%',
  },
  speciesThumb: {
    backgroundColor: V.colors.secondary,
    borderRadius: 6,
    height: 44,
    overflow: 'hidden',
    width: 44,
  },
  speciesThumbImage: {
    height: 44,
    width: 44,
  },
  primaryCopy: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  scientificName: {
    color: V.colors.fg,
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '800',
    lineHeight: 20,
  },
  rowText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  rowTextCenter: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
  },
  rowTextCenterStack: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'center',
  },
  rowSubtext: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  skuBadge: {
    fontFamily: 'Consolas',
    fontSize: 11,
    lineHeight: 16,
  },
  infoBadgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    overflow: 'visible',
  },
  infoTooltipWrap: {
    alignSelf: 'center',
  },
  infoMonoBadge: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  infoSellableBadge: {
    fontSize: 11,
    lineHeight: 16,
  },
  syncStack: {
    gap: 4,
  },
  syncPlatformRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  syncPlatformLabel: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
    width: 22,
  },
  syncBadgeText: {
    fontSize: 10,
    lineHeight: 14,
  },
  syncTimeText: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
  speciesActionMenuRaised: {
    elevation: 30,
    zIndex: 1000,
  },
  rowSubtextRight: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    textAlign: 'right',
  },
  detailHeroImage: {
    aspectRatio: 1,
    borderRadius: 0,
    height: 178,
    overflow: 'hidden',
    width: '100%',
  },
  twoColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  fourColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  threeColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  variantEditorPanel: {
    gap: 12,
  },
  variantEditorHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  variantRowHeader: {
    alignItems: 'center',
    backgroundColor: V.colors.mutedSoft,
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
  variantHeaderActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  variantHeaderButton: {
    minHeight: 34,
    paddingHorizontal: 12,
  },
  variantFormCard: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  variantTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  variantTabRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variantTabButton: {
    minHeight: 34,
    paddingHorizontal: 14,
  },
  variantTabContent: {
    gap: 12,
  },
  variantPricingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  variantMemberPointsRow: {
    alignItems: 'center',
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    padding: 12,
  },
  variantAdvancedActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  memberPointsInput: {
    minWidth: 120,
  },
  variantAdvancedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  variantAdvancedCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 300,
    flexGrow: 1,
    gap: 10,
    minWidth: 260,
    padding: 12,
  },
  variantAdvancedTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
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
  grocerPricingPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
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
  inlineFieldGroup: {
    flexBasis: 320,
    flexGrow: 1,
    gap: 8,
  },
  dimensionTriplet: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryPickerStack: {
    gap: 10,
  },
  selectedCategoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedCategoryButton: {
    minHeight: 32,
  },
  linkFieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  externalLinksStack: {
    gap: 10,
  },
  externalLinkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  externalLinkInput: {
    flexBasis: 320,
    flexGrow: 1,
    minWidth: 220,
  },
  externalLinkRemoveButton: {
    minHeight: 34,
  },
  externalLinkAddButton: {
    alignSelf: 'flex-start',
  },
  marketplaceSyncPanel: {
    gap: 10,
  },
  marketplaceSyncGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  marketplaceSyncCard: {
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flexBasis: 220,
    flexGrow: 1,
    padding: 10,
  },
  fieldHint: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  mediaLinkStack: {
    gap: 8,
  },
  mediaLinkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  mediaPickerStack: {
    gap: 10,
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
  segmentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sellableSwitchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 38,
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    paddingTop: 16,
  },
  longDropdownMenu: {
    maxHeight: 320,
    minWidth: 280,
  },
  customFieldFormStack: {
    gap: 14,
  },
  customFieldSettingsCard: {
    overflow: 'visible',
  },
  customFieldCompactField: {
    gap: 8,
  },
  customFieldSwitchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 34,
  },
  customFieldSwitchLabel: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  customFieldMultiSelect: {
    overflow: 'visible',
    position: 'relative',
    zIndex: 1000,
  },
  customFieldMultiSelectTrigger: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    minHeight: 38,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  customFieldSelectedChips: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    minWidth: 0,
  },
  customFieldSelectedChip: {
    minHeight: 26,
    paddingHorizontal: 8,
  },
  customFieldSelectedChipText: {
    fontSize: 11,
    lineHeight: 15,
  },
  customFieldMultiSelectPlaceholder: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  customFieldMultiSelectPlaceholderMuted: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  customFieldMultiSelectChevron: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  customFieldMultiSelectMenu: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
    maxHeight: 220,
    overflow: 'hidden',
  },
  customFieldMultiSelectScroll: {
    maxHeight: 220,
  },
  customFieldMultiSelectContent: {
    gap: 4,
    padding: 6,
  },
  customFieldMultiSelectOption: {
    justifyContent: 'flex-start',
    minHeight: 32,
  },
  customFieldMultiSelectOptionText: {
    textAlign: 'left',
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
  customFieldLabeledControl: {
    flexBasis: 180,
    flexGrow: 1,
    gap: 6,
    minWidth: 150,
  },
  customFieldControlLabel: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  customFieldEditorRow: {
    gap: 8,
  },
  customFieldInputLabel: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  customFieldTextArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  customFieldUnknownPanel: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    gap: 8,
    padding: 10,
  },
  attachedItemRow: {
    alignItems: 'center',
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    padding: 10,
  },
  attachedItemForm: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    gap: 10,
    padding: 10,
  },
  sectionThumb: {
    borderRadius: 6,
    height: 36,
    width: 36,
  },
});
