import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  formatPackingDimension,
  formatPackingWeight,
  getPackingCategoryLabel,
  getPackingEffectiveHpp,
  KOLAM_PACKING_CATEGORY_OPTIONS,
  type KolamPackingCatalogUsageRow,
  type KolamPackingMaterial,
  type KolamPackingMaterialFormState,
} from '../domain/kolam-packing-option';
import type { KolamUnit } from '../domain/kolam-unit';
import { getKolamFormSection } from '../domain/kolam-form';
import { getKolamTableColumns } from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { formatRupiah } from '../lib/money';
import { getKolamFileUrl } from '../lib/file-url';
import {
  useKolamPackingMaterialController,
  type KolamPackingMaterialController,
} from '../hooks/use-kolam-packing-material-controller';
import { KolamButton } from './kolam-button';
import { KolamChevronIcon } from './kolam-chevron-icon';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDataTableHeader } from './kolam-data-table-header';
import {
  KolamDataTableAmountCell,
  KolamDataTableMetaCell,
} from './kolam-data-table-text-cell';
import { KolamDataTableRowFrame } from './kolam-data-table-row-frame';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import {
  KolamDetailMediaPreview,
  type KolamDetailMediaItem,
} from './kolam-detail-media-preview';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import {
  KolamEntityDetailAssetsPanel,
  type KolamEntityDetailAsset,
} from './kolam-entity-detail-assets-panel';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamNativeFormSection } from './kolam-native-form-section';
import { KolamRemoteImage } from './kolam-remote-image';
import {
  KolamVendorPriceCard,
  type KolamVendorPriceCardItem,
} from './kolam-pricing-detail-widgets';
import { appConfig } from '../config/app';
import { getKolamPackingMaterialUsedIn, uploadKolamPackingMaterialAsset, deleteKolamPackingMaterialAsset } from '../services/kolam-packing-option-api';
import { KolamControlTabList } from './kolam-control-tab-list';
import { containsHtmlMarkup, KolamHtmlContent } from './kolam-html-content';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';

type PackingSortMode = 'newest' | 'name-asc' | 'name-desc' | 'stock-desc';
type PackingStatusFilter = 'all' | 'active' | 'inactive';
type PackingCategoryFilter = 'all' | string;
type PackingToolbarFilterPanel = 'sort' | 'category' | 'status';

export function KolamPackingMaterialSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamPackingMaterialController(route);

  return (
    <KolamPackingMaterialShell
      controller={controller}
      onRouteChange={onRouteChange}>
      {controller.mode === 'list' ? (
        <KolamPackingMaterialList
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : (
        <KolamPackingMaterialDetail
          controller={controller}
          onRouteChange={onRouteChange}
        />
      )}
    </KolamPackingMaterialShell>
  );
}

function KolamPackingMaterialShell({
  children,
  controller,
  onRouteChange,
}: {
  children: React.ReactNode;
  controller: KolamPackingMaterialController;
  onRouteChange?: (route: string) => void;
}) {
  return (
    <View style={styles.surface}>
      {controller.mode === 'edit' || controller.mode === 'new' ? (
        <View style={styles.headerActions}>
          <KolamButton
            label="Daftar"
            onPress={() => {
              controller.onBackToList();
              onRouteChange?.('/packing-materials');
            }}
          />
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

function KolamPackingMaterialList({
  controller,
  onRouteChange,
}: {
  controller: KolamPackingMaterialController;
  onRouteChange?: (route: string) => void;
}) {
  const [search, setSearch] = React.useState('');
  const [sortMode, setSortMode] = React.useState<PackingSortMode>('newest');
  const [categoryFilter, setCategoryFilter] =
    React.useState<PackingCategoryFilter>('all');
  const [activeFilterPanel, setActiveFilterPanel] =
    React.useState<PackingToolbarFilterPanel | null>(null);
  const [statusFilter, setStatusFilter] =
    React.useState<PackingStatusFilter>('all');
  const [pageSize, setPageSize] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamPackingMaterial | null>(null);
  const summary = getPackingSummary(controller.materials);
  const filteredMaterials = React.useMemo(
    () =>
      filterPackings(
        controller.materials,
        search,
        categoryFilter,
        statusFilter,
      ),
    [categoryFilter, controller.materials, search, statusFilter],
  );
  const sortedMaterials = React.useMemo(
    () => sortPackings(filteredMaterials, sortMode),
    [filteredMaterials, sortMode],
  );
  const pageCount = Math.max(1, Math.ceil(sortedMaterials.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedMaterials = sortedMaterials.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const sortFilterOptions = React.useMemo<Array<{ label: string; value: PackingSortMode }>>(
    () => [
      { label: 'Terbaru', value: 'newest' },
      { label: 'Nama A-Z', value: 'name-asc' },
      { label: 'Nama Z-A', value: 'name-desc' },
      { label: 'Stok Terbanyak', value: 'stock-desc' },
    ],
    [],
  );
  const categoryFilterOptions = React.useMemo<Array<{ label: string; value: PackingCategoryFilter }>>(
    () => [
      { label: 'Semua', value: 'all' },
      ...KOLAM_PACKING_CATEGORY_OPTIONS,
    ],
    [],
  );
  const statusFilterOptions = React.useMemo<Array<{ label: string; value: PackingStatusFilter }>>(
    () => [
      { label: 'Semua', value: 'all' },
      { label: 'Aktif', value: 'active' },
      { label: 'Nonaktif', value: 'inactive' },
    ],
    [],
  );
  const sortFilterLabel =
    sortFilterOptions.find(option => option.value === sortMode)?.label ??
    'Urutan';
  const categoryFilterLabel =
    categoryFilter === 'all'
      ? 'Kategori'
      : getPackingCategoryLabel(categoryFilter);
  const statusFilterLabel =
    statusFilter === 'all'
      ? 'Status'
      : statusFilterOptions.find(option => option.value === statusFilter)
          ?.label ?? 'Status';
  const toggleFilterPanel = (panel: PackingToolbarFilterPanel) => {
    setActiveFilterPanel(current => (current === panel ? null : panel));
  };

  React.useEffect(() => {
    setPage(1);
  }, [categoryFilter, pageSize, search, sortMode, statusFilter]);

  return (
    <View style={styles.stack}>
      <View style={styles.summaryGrid}>
        <SummaryTile label="Total Kemasan" value={controller.materials.length} />
        <SummaryTile label="Aktif" value={summary.active} />
        <SummaryTile label="Nonaktif" value={summary.inactive} />
        <SummaryTile label="Stok" value={summary.stock} />
      </View>
      <View style={styles.toolbarWrap}>
        <View style={styles.toolbarShell}>
          <View style={styles.filterRow}>
            <KolamFormTextField
              onChangeText={setSearch}
              placeholder="Cari bahan kemasan..."
              style={styles.searchInput}
              value={search}
            />
            <PackingFilterTrigger
              active={activeFilterPanel === 'sort' || sortMode !== 'newest'}
              label={sortFilterLabel}
              onPress={() => toggleFilterPanel('sort')}
            />
            <PackingFilterTrigger
              active={activeFilterPanel === 'category' || categoryFilter !== 'all'}
              label={categoryFilterLabel}
              onPress={() => toggleFilterPanel('category')}
            />
            <PackingFilterTrigger
              active={activeFilterPanel === 'status' || statusFilter !== 'all'}
              label={statusFilterLabel}
              onPress={() => toggleFilterPanel('status')}
            />
          </View>
          <View style={styles.actionRow}>
            <KolamButton
              disabled={controller.loading}
              label="Muat Ulang"
              onPress={() => {
                void controller.onRefresh();
              }}
              style={styles.toolbarButton}
            />
            <KolamButton
              intent="primary"
              label="Tambah Kemasan"
              onPress={() => {
                controller.onCreateNew();
                onRouteChange?.('/packing-materials/baru');
              }}
              style={styles.toolbarButton}
            />
          </View>
        </View>
        {activeFilterPanel ? (
          <PackingFilterPanel
            onClose={() => setActiveFilterPanel(null)}
            onSelect={value => {
              if (activeFilterPanel === 'sort') {
                setSortMode(value as PackingSortMode);
              } else if (activeFilterPanel === 'category') {
                setCategoryFilter(value);
              } else {
                setStatusFilter(value as PackingStatusFilter);
              }
              setActiveFilterPanel(null);
            }}
            options={
              activeFilterPanel === 'sort'
                ? sortFilterOptions
                : activeFilterPanel === 'category'
                ? categoryFilterOptions
                : statusFilterOptions
            }
            panel={activeFilterPanel}
            selectedValue={
              activeFilterPanel === 'sort'
                ? sortMode
                : activeFilterPanel === 'category'
                ? categoryFilter
                : statusFilter
            }
          />
        ) : null}
      </View>
      <KolamContentFrame variant="settingsWebConfig">
        <KolamDataTableHeader columns={getKolamTableColumns('packing-material')} />
        {pagedMaterials.length ? (
          pagedMaterials.map(item => (
            <KolamPackingMaterialRow
              item={item}
              key={item.id}
              onDelete={() => setDeleteCandidate(item)}
              onEdit={() => {
                void controller.onSelectMaterial(item);
                onRouteChange?.(`${getPackingRoute(item)}/edit`);
              }}
              onSelect={() => {
                void controller.onSelectMaterial(item);
                onRouteChange?.(getPackingRoute(item));
              }}
            />
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              compact
              message="Data bahan kemasan belum tersedia dari cache atau backend."
              title={
                controller.loading
                  ? 'Memuat bahan kemasan...'
                  : 'Belum ada bahan kemasan'
              }
            />
          </View>
        )}
      </KolamContentFrame>
      <View style={styles.footerWrap}>
        <KolamTableFooterControls
          onPageSizeChange={setPageSize}
          page={safePage}
          pageSize={pageSize}
          total={sortedMaterials.length}>
          {pageCount > 1 ? (
            <View style={styles.paginationBar}>
              <KolamButton
                disabled={safePage <= 1}
                label="Sebelumnya"
                onPress={() => setPage(current => Math.max(1, current - 1))}
              />
              <KolamCopyStack
                items={[
                  {
                    id: 'page',
                    text: `${safePage} / ${pageCount}`,
                    style: styles.pageLabel,
                  },
                ]}
              />
              <KolamButton
                disabled={safePage >= pageCount}
                label="Berikutnya"
                onPress={() =>
                  setPage(current => Math.min(pageCount, current + 1))
                }
              />
            </View>
          ) : null}
        </KolamTableFooterControls>
      </View>
      <KolamDeleteConfirmDialog
        itemLabel={deleteCandidate?.name}
        itemType="bahan kemasan"
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          const item = deleteCandidate;
          setDeleteCandidate(null);
          if (!item) {
            return;
          }

          void controller.onDeleteMaterial(item).then(deleted => {
            if (deleted) {
              onRouteChange?.('/packing-materials');
            }
          });
        }}
        visible={Boolean(deleteCandidate)}
      />
    </View>
  );
}

function PackingFilterTrigger({
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
      icon={
        <KolamChevronIcon
          color={active ? V.colors.primaryFg : V.colors.success}
          direction="down"
          size="menu-sm"
        />
      }
      intent={active ? 'primary' : 'secondary'}
      label={label}
      onPress={onPress}
      style={[styles.filterTrigger, active && styles.filterTriggerActive]}
      textStyle={[
        styles.filterTriggerText,
        active && styles.filterTriggerTextActive,
      ]}
    />
  );
}

function PackingFilterPanel({
  onClose,
  onSelect,
  options,
  panel,
  selectedValue,
}: {
  onClose: () => void;
  onSelect: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  panel: PackingToolbarFilterPanel;
  selectedValue: string;
}) {
  return (
    <View
      style={[styles.filterOverlayPanel, getPackingFilterOverlayStyle(panel)]}>
      <ScrollView
        contentContainerStyle={styles.filterPanelContent}
        keyboardShouldPersistTaps="handled"
        style={styles.filterPanelScroll}>
        {options.map(option => {
          const selected = option.value === selectedValue;

          return (
            <KolamButton
              intent={selected ? 'primary' : 'plain'}
              key={option.value}
              label={option.label}
              onPress={() => onSelect(option.value)}
              style={styles.filterPanelOption}
            />
          );
        })}
      </ScrollView>
      <View style={styles.filterPanelFooter}>
        <KolamButton label="Tutup" onPress={onClose} />
      </View>
    </View>
  );
}

function getPackingFilterOverlayStyle(panel: PackingToolbarFilterPanel) {
  switch (panel) {
    case 'sort':
      return styles.filterPanelSort;
    case 'status':
      return styles.filterPanelStatus;
    case 'category':
    default:
      return styles.filterPanelCategory;
  }
}

function KolamPackingMaterialRow({
  item,
  onDelete,
  onEdit,
  onSelect,
}: {
  item: KolamPackingMaterial;
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const photoUri = getKolamFileUrl(item.photos[0]);
  const description = item.description.trim();
  const effectiveHpp = getPackingEffectiveHpp(item);

  return (
    <KolamDataTableRowFrame style={actionMenuOpen && styles.activeActionRow}>
      <View style={styles.photoCell}>
        {photoUri ? (
          <KolamRemoteImage
            accessibilityLabel={`Foto ${item.name}`}
            previewItems={item.photos.map((photo, index) => ({
              id: `${item.id}-${index}`,
              title: `${item.name} ${index + 1}`,
              uri: getKolamFileUrl(photo) ?? '',
            }))}
            resizeMode="cover"
            scope="packing-material"
            sourceUri={photoUri}
            style={styles.photoThumb}
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>-</Text>
          </View>
        )}
      </View>
      <View style={styles.nameCell}>
        <KolamCopyStack
          items={[
            { id: 'name', text: item.name, style: styles.rowTitle },
            ...(description
              ? [
                  {
                    id: 'description',
                    text: description,
                    style: styles.rowMeta,
                  },
                ]
              : []),
          ]}
        />
      </View>
      <View style={styles.categoryCell}>
        <KolamStatusBadge
          intent={getCategoryIntent(item.category)}
          label={getPackingCategoryLabel(item.category)}
        />
      </View>
      <KolamDataTableMetaCell style={styles.dimensionCell}>
        {formatPackingDimension(item)}
      </KolamDataTableMetaCell>
      <KolamDataTableMetaCell style={styles.weightCell}>
        {formatPackingWeight(item)}
      </KolamDataTableMetaCell>
      <KolamDataTableAmountCell style={styles.hppCell}>
        {effectiveHpp > 0 ? formatRupiah(effectiveHpp) : '-'}
      </KolamDataTableAmountCell>
      <KolamDataTableAmountCell style={styles.stockCell}>
        {item.stock}
      </KolamDataTableAmountCell>
      <View style={styles.statusCell}>
        <KolamStatusBadge
          intent={item.status === 'active' ? 'success' : 'warning'}
          label={item.status === 'active' ? 'Aktif' : 'Nonaktif'}
        />
      </View>
      <View style={styles.overflowCell}>
        <KolamOverflowMenuButton
          accessibilityLabel={`Menu ${item.name}`}
          actions={[
            { label: 'Lihat', onPress: onSelect },
            { label: 'Rubah', onPress: onEdit },
            { label: 'Nonaktifkan', onPress: onDelete, tone: 'danger' },
          ]}
          onOpenChange={setActionMenuOpen}
        />
      </View>
    </KolamDataTableRowFrame>
  );
}

function KolamPackingMaterialDetail({
  controller,
  onRouteChange,
}: {
  controller: KolamPackingMaterialController;
  onRouteChange?: (route: string) => void;
}) {
  const item = controller.selectedMaterial;
  const editable = controller.isEditable;
  const [activeTab, setActiveTab] = React.useState<'overview' | 'assets'>('overview');
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamPackingMaterial | null>(null);

  if (!item && controller.mode !== 'new') {
    return (
      <KolamEmptyState
        message="Pilih salah satu bahan kemasan dari daftar untuk melihat detail."
        title="Belum ada bahan kemasan dipilih"
      />
    );
  }

  if (editable || !item) {
    return (
      <View style={styles.stack}>
        <KolamPackingMaterialForm controller={controller} />
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      <View style={styles.detailPageHeader}>
        <View style={styles.detailHeading}>
          <Text style={styles.detailPageTitle}>{item.name}</Text>
          <Text style={styles.detailPageMeta}>
            {createPackingDetailTimestamp(item)}
          </Text>
        </View>
        <View style={styles.detailTopActions}>
          <KolamButton
            label="Daftar"
            onPress={() => {
              controller.onBackToList();
              onRouteChange?.('/packing-materials');
            }}
          />
          <KolamButton
            intent="primary"
            label="Rubah"
            onPress={controller.onEdit}
          />
          <KolamButton
            disabled={item.status !== 'active' || controller.saving}
            intent="danger"
            label="Nonaktifkan"
            onPress={() => setDeleteCandidate(item)}
          />
        </View>
      </View>
      <KolamControlTabList
        accessibilityLabel="Bagian detail bahan kemasan"
        items={[
          { id: 'overview', label: 'Ringkasan' },
          { id: 'assets', label: 'Aset', count: item.assets.length },
        ]}
        onSelect={tab => setActiveTab(tab === 'assets' ? 'assets' : 'overview')}
        selectedId={activeTab}
      />
      {activeTab === 'overview' ? (
        <PackingOverviewPanel
          item={item}
          onRouteChange={onRouteChange}
        />
      ) : (
        <KolamPackingMaterialAssetsPanel controller={controller} item={item} />
      )}
      <KolamDeleteConfirmDialog
        itemLabel={deleteCandidate?.name}
        itemType="bahan kemasan"
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          const material = deleteCandidate;
          setDeleteCandidate(null);
          if (!material) {
            return;
          }

          void controller.onDeleteMaterial(material).then(deleted => {
            if (deleted) {
              onRouteChange?.('/packing-materials');
            }
          });
        }}
        visible={Boolean(deleteCandidate)}
      />
    </View>
  );
}

function PackingOverviewPanel({
  item,
  onRouteChange,
}: {
  item: KolamPackingMaterial;
  onRouteChange?: (route: string) => void;
}) {
  const effectiveHpp = getPackingEffectiveHpp(item);
  const cheapestSupplier = getCheapestSupplier(item);
  const vendorPrices = React.useMemo(
    () => createPackingVendorPriceItems(item),
    [item],
  );
  const mediaItems = React.useMemo(
    () => createPackingMediaItems(item),
    [item],
  );

  return (
    <View style={styles.detailSectionStack}>
      <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
        <View style={styles.detailCardHeader}>
          <View style={styles.detailTitleWrap}>
            <View style={styles.detailTitleRow}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoIconText}>i</Text>
              </View>
              <Text style={styles.detailCardTitle}>Ringkasan</Text>
            </View>
            <Text style={styles.detailCardDescription}>
              Data bahan kemasan yang dipakai saat pembayaran dan pengiriman.
            </Text>
          </View>
          <View style={styles.badgeRow}>
            <KolamStatusBadge
              intent={getCategoryIntent(item.category)}
              label={getPackingCategoryLabel(item.category)}
            />
            <KolamStatusBadge
              intent={item.status === 'active' ? 'success' : 'warning'}
              label={item.status === 'active' ? 'Aktif' : 'Nonaktif'}
            />
          </View>
        </View>
        <View style={styles.overviewContent}>
          <View style={styles.gallery}>
            {mediaItems.length ? (
              <KolamDetailMediaPreview items={mediaItems} title={item.name} />
            ) : (
              <View style={styles.galleryEmpty}>
                <Text style={styles.galleryEmptyTitle}>{item.name}</Text>
                <Text style={styles.galleryEmptyMeta}>
                  Belum ada foto bahan kemasan.
                </Text>
              </View>
            )}
          </View>
          <View style={styles.overviewBody}>
            <View style={styles.overviewMetricGrid}>
              <DetailMetric
                label="Status checkout"
                value={item.status === 'active' ? 'Aktif' : 'Nonaktif'}
                badgeIntent={item.status === 'active' ? 'success' : 'warning'}
              />
              <DetailMetric
                label="Stok"
                value={item.stock === 0 ? 'Stok habis' : String(item.stock)}
                badgeIntent={item.stock === 0 ? 'danger' : undefined}
              />
              <DetailMetric
                label="Dimensi (P x L x T)"
                value={formatPackingDimension(item)}
              />
              <DetailMetric label="Berat" value={formatPackingWeight(item)} />
            </View>
            {item.description.trim() ? (
              <View style={styles.descriptionBlock}>
                <Text style={styles.fieldLabel}>Deskripsi</Text>
                {containsHtmlMarkup(item.description) ? (
                  <KolamHtmlContent html={item.description} />
                ) : (
                  <Text style={styles.descriptionText}>{item.description}</Text>
                )}
              </View>
            ) : null}
            <View style={styles.separator} />
            <View style={styles.priceSection}>
              <Text style={styles.fieldLabel}>Harga</Text>
              <View style={styles.priceGrid}>
                <PriceTile
                  label="Harga tagih customer"
                  value={formatRupiah(item.price)}
                />
                <PriceTile
                  label="HPP dari vendor"
                  value={effectiveHpp > 0 ? formatRupiah(effectiveHpp) : '-'}
                  note={cheapestSupplier ? `Termurah: ${cheapestSupplier.vendorName}` : undefined}
                />
                <PriceTile
                  label="Supplier"
                  value={
                    vendorPrices.length
                      ? `${vendorPrices.length} supplier`
                      : 'Belum ada'
                  }
                />
              </View>
            </View>
          </View>
        </View>
      </KolamContentFrame>
      <KolamVendorPriceCard
        badge={String(vendorPrices.length)}
        description="Referensi harga pokok dari supplier. Baris termurah ditandai Terbaik."
        emptyText="Belum ada harga vendor aktif."
        formatCurrency={formatRupiah}
        onOpenVendor={onRouteChange ? openPackingSupplierDetail(onRouteChange) : undefined}
        prices={vendorPrices}
        title="Harga Vendor"
      />
      <PackingUsageCard
        item={item}
        onRouteChange={onRouteChange}
      />
    </View>
  );
}

function PackingUsageCard({
  item,
  onRouteChange,
}: {
  item: KolamPackingMaterial;
  onRouteChange?: (route: string) => void;
}) {
  const [rows, setRows] = React.useState<KolamPackingCatalogUsageRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    void getKolamPackingMaterialUsedIn(item.id)
      .then(nextRows => {
        if (active) {
          setRows(nextRows);
        }
      })
      .catch(err => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Gagal memuat pemakaian kemasan.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [item.id]);

  return (
    <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
      <View style={styles.detailCardHeader}>
        <View style={styles.detailTitleWrap}>
          <Text style={styles.detailCardTitle}>Dipakai oleh katalog</Text>
          <Text style={styles.detailCardDescription}>
            Produk dan species yang menautkan bahan kemasan ini.
          </Text>
        </View>
        {!loading && rows.length ? (
          <KolamStatusBadge intent="muted" label={String(rows.length)} />
        ) : null}
      </View>
      {loading ? (
        <Text style={styles.emptyText}>Memuat...</Text>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : rows.length ? (
        <View style={styles.simpleTable}>
          <View style={[styles.simpleTableRow, styles.simpleTableHeader]}>
            <Text style={[styles.simpleTableHead, styles.typeCell]}>Tipe</Text>
            <Text style={[styles.simpleTableHead, styles.usageNameCell]}>Nama</Text>
            <Text style={[styles.simpleTableHead, styles.codeCell]}>Kode</Text>
            <Text style={[styles.simpleTableHead, styles.variantCell]}>Varian</Text>
            <Text style={[styles.simpleTableHead, styles.qtyCell]}>Qty</Text>
          </View>
          {rows.map(row => (
            <View
              key={`${row.entityType}-${row.entityId}-${row.variantLabel}-${row.quantity}`}
              style={styles.simpleTableRow}>
              <View style={styles.typeCell}>
                <KolamStatusBadge
                  intent={getUsageIntent(row)}
                  label={getUsageTypeLabel(row)}
                />
              </View>
              <View style={styles.usageNameCell}>
                <Text
                  onPress={() => onRouteChange?.(getUsageRoute(row))}
                  style={styles.tableLink}>
                  {row.name}
                </Text>
              </View>
              <Text style={[styles.simpleTableText, styles.codeCell]}>
                {row.code || '-'}
              </Text>
              <Text style={[styles.simpleTableText, styles.variantCell]}>
                {row.variantLabel || '-'}
              </Text>
              <Text style={[styles.simpleTableStrong, styles.qtyCell]}>
                x{row.quantity}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>
          Belum dipakai di produk atau species manapun.
        </Text>
      )}
    </KolamContentFrame>
  );
}

function KolamPackingMaterialAssetsPanel({
  controller,
  item,
}: {
  controller: KolamPackingMaterialController;
  item: KolamPackingMaterial;
}) {
  const uploadAsset = React.useCallback(async (title: string, localUri: string) => {
    const updated = await uploadKolamPackingMaterialAsset(item.id, title, localUri);
    await controller.onSelectMaterial(updated);
    return updated.assets;
  }, [controller, item.id]);

  const deleteAsset = React.useCallback(async (assetId: string) => {
    const updated = await deleteKolamPackingMaterialAsset(item.id, assetId);
    await controller.onSelectMaterial(updated);
    return updated.assets;
  }, [controller, item.id]);

  const downloadAsset = React.useCallback((asset: KolamEntityDetailAsset) => {
    openPackingAssetDownload(item.id, asset.id);
  }, [item.id]);

  return (
    <KolamEntityDetailAssetsPanel
      assets={item.assets}
      deleteAsset={deleteAsset}
      downloadAsset={downloadAsset}
      itemType="aset bahan kemasan"
      uploadAsset={uploadAsset}
    />
  );
}
function KolamPackingMaterialForm({
  controller,
}: {
  controller: KolamPackingMaterialController;
}) {
  const form = controller.form;
  const dimensionUnits = controller.units.filter(unit =>
    ['cm', 'mm', 'm', 'in', 'inch'].some(value =>
      `${unit.initial} ${unit.name}`.toLowerCase().includes(value),
    ),
  );
  const weightUnits = controller.units.filter(unit =>
    ['kg', 'g', 'gr', 'gram'].some(value =>
      `${unit.initial} ${unit.name}`.toLowerCase().includes(value),
    ),
  );

  return (
    <KolamNativeFormSection section={getKolamFormSection('packing-material-detail')}>
      <View style={settingsWebFormStyles.settingsWebFormFields}>
        <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
          <FieldShell label="Nama" required>
            <KolamFormTextField
              editable={!controller.saving}
              onChangeText={name => controller.onChangeForm({ name })}
              placeholder="contoh: Box Kayu Kecil"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={form.name}
            />
          </FieldShell>
          <FieldShell label="Deskripsi">
            <KolamFormTextField
              editable={!controller.saving}
              multiline
              onChangeText={description =>
                controller.onChangeForm({ description })
              }
              placeholder="Catatan bahan, kegunaan, atau batas ukuran barang."
              style={[
                settingsWebFormStyles.settingsWebFormFieldValue,
                styles.textArea,
              ]}
              value={form.description}
            />
          </FieldShell>
          <View style={styles.formSplitRow}>
            <View style={styles.formSplitCell}>
              <FieldShell label="Kategori" required>
                <KolamDropdownSelect
                  label="Kategori"
                  onChange={category => controller.onChangeForm({ category })}
                  options={[...KOLAM_PACKING_CATEGORY_OPTIONS]}
                  value={form.category}
                />
              </FieldShell>
            </View>
            <View style={styles.formSplitCell}>
              <FieldShell label="Status" required>
                <KolamDropdownSelect
                  label="Status"
                  onChange={enabled =>
                    controller.onChangeForm({ enabled: enabled === 'true' })
                  }
                  options={[
                    { label: 'Aktif', value: 'true' },
                    { label: 'Nonaktif', value: 'false' },
                  ]}
                  value={String(form.enabled)}
                />
              </FieldShell>
            </View>
          </View>
          <FormDivider title="Harga tagih customer" />
          <View style={styles.formSplitRow}>
            <View style={styles.formSplitCell}>
              <FieldShell label="Harga Tagih">
                <KolamFormTextField
                  editable={!controller.saving}
                  mode="numeric"
                  onChangeText={price => controller.onChangeForm({ price })}
                  placeholder="0"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.price}
                />
              </FieldShell>
            </View>
            <View style={styles.formSplitCell}>
              <FieldShell label="Stok">
                <KolamFormTextField
                  editable={!controller.saving}
                  mode="numeric"
                  onChangeText={stock => controller.onChangeForm({ stock })}
                  placeholder="0"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.stock}
                />
              </FieldShell>
            </View>
          </View>
          <FormDivider title="Berat" />
          <View style={styles.formSplitRow}>
            <View style={styles.formSplitCell}>
              <FieldShell label="Nilai Berat">
                <KolamFormTextField
                  editable={!controller.saving}
                  mode="numeric"
                  onChangeText={weightValue =>
                    controller.onChangeForm({ weightValue })
                  }
                  placeholder="contoh: 0.5"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.weightValue}
                />
              </FieldShell>
            </View>
            <View style={styles.formSplitCell}>
              <FieldShell label="Satuan Berat">
                <KolamDropdownSelect
                  label="Satuan"
                  onChange={weightUnit =>
                    controller.onChangeForm({ weightUnit })
                  }
                  options={createUnitOptions(weightUnits)}
                  searchable
                  searchPlaceholder="Cari satuan..."
                  value={form.weightUnit || createUnitOptions(weightUnits)[0]?.value || ''}
                />
              </FieldShell>
            </View>
          </View>
          <FormDivider title="Dimensi" />
          <View style={styles.formSplitRow}>
            <View style={styles.formThirdCell}>
              <FieldShell label="Panjang">
                <KolamFormTextField
                  editable={!controller.saving}
                  mode="numeric"
                  onChangeText={dimensionLength =>
                    controller.onChangeForm({ dimensionLength })
                  }
                  placeholder="P"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.dimensionLength}
                />
              </FieldShell>
            </View>
            <View style={styles.formThirdCell}>
              <FieldShell label="Lebar">
                <KolamFormTextField
                  editable={!controller.saving}
                  mode="numeric"
                  onChangeText={dimensionWidth =>
                    controller.onChangeForm({ dimensionWidth })
                  }
                  placeholder="L"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.dimensionWidth}
                />
              </FieldShell>
            </View>
            <View style={styles.formThirdCell}>
              <FieldShell label="Tinggi">
                <KolamFormTextField
                  editable={!controller.saving}
                  mode="numeric"
                  onChangeText={dimensionHeight =>
                    controller.onChangeForm({ dimensionHeight })
                  }
                  placeholder="T"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.dimensionHeight}
                />
              </FieldShell>
            </View>
          </View>
          <FieldShell label="Satuan Dimensi">
            <KolamDropdownSelect
              label="Satuan"
              onChange={dimensionUnit =>
                controller.onChangeForm({ dimensionUnit })
              }
              options={createUnitOptions(dimensionUnits)}
              searchable
              searchPlaceholder="Cari satuan..."
              value={form.dimensionUnit || createUnitOptions(dimensionUnits)[0]?.value || ''}
            />
          </FieldShell>
          <FormDivider title="Harga Supplier" />
          <VendorPriceEditor form={form} controller={controller} />
          <View style={styles.formActions}>
            <KolamButton
              disabled={controller.saving}
              label="Batal"
              onPress={controller.onBackToList}
            />
            <KolamButton
              disabled={controller.saving}
              intent="primary"
              label={controller.saving ? 'Menyimpan...' : 'Simpan'}
              onPress={() => {
                void controller.onSave();
              }}
            />
          </View>
        </View>
      </View>
    </KolamNativeFormSection>
  );
}

function VendorPriceEditor({
  controller,
  form,
}: {
  controller: KolamPackingMaterialController;
  form: KolamPackingMaterialFormState;
}) {
  const lines = form.vendorPrices;

  return (
    <View style={styles.vendorStack}>
      {lines.length ? (
        lines.map((line, index) => (
          <View key={line.id || index} style={styles.vendorLine}>
            <View style={styles.formSplitRow}>
              <View style={styles.formSplitCell}>
                <FieldShell label="Nama Supplier">
                  <KolamFormTextField
                    editable={!controller.saving}
                    onChangeText={vendorName =>
                      updateVendorLine(controller, form, index, { vendorName })
                    }
                    placeholder="Supplier"
                    style={settingsWebFormStyles.settingsWebFormFieldValue}
                    value={line.vendorName}
                  />
                </FieldShell>
              </View>
              <View style={styles.formSplitCell}>
                <FieldShell label="ID Supplier">
                  <KolamFormTextField
                    editable={!controller.saving}
                    onChangeText={vendorId =>
                      updateVendorLine(controller, form, index, { vendorId })
                    }
                    placeholder="ID supplier dari backend"
                    style={settingsWebFormStyles.settingsWebFormFieldValue}
                    value={line.vendorId}
                  />
                </FieldShell>
              </View>
            </View>
            <View style={styles.formSplitRow}>
              <View style={styles.formSplitCell}>
                <FieldShell label="Harga Beli">
                  <KolamFormTextField
                    editable={!controller.saving}
                    mode="numeric"
                    onChangeText={price =>
                      updateVendorLine(controller, form, index, { price })
                    }
                    placeholder="0"
                    style={settingsWebFormStyles.settingsWebFormFieldValue}
                    value={line.price}
                  />
                </FieldShell>
              </View>
              <View style={styles.formSplitCell}>
                <FieldShell label="Ongkir/unit">
                  <KolamFormTextField
                    editable={!controller.saving}
                    mode="numeric"
                    onChangeText={shippingCost =>
                      updateVendorLine(controller, form, index, { shippingCost })
                    }
                    placeholder="0"
                    style={settingsWebFormStyles.settingsWebFormFieldValue}
                    value={line.shippingCost}
                  />
                </FieldShell>
              </View>
            </View>
            <FieldShell label="Link Supplier">
              <KolamFormTextField
                editable={!controller.saving}
                mode="url"
                onChangeText={link =>
                  updateVendorLine(controller, form, index, { link })
                }
                placeholder="https://..."
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={line.link}
              />
            </FieldShell>
            <View style={styles.vendorActions}>
              <KolamButton
                intent="danger"
                label="Hapus Supplier"
                onPress={() =>
                  controller.onChangeForm({
                    vendorPrices: lines.filter((_, lineIndex) => lineIndex !== index),
                  })
                }
              />
            </View>
          </View>
        ))
      ) : (
        <KolamCopyStack
          items={[
            {
              id: 'empty',
              text: 'Belum ada harga supplier. HPP akan memakai cost dari backend jika tersedia.',
              style: styles.emptyVendorText,
            },
          ]}
        />
      )}
      <View style={styles.vendorActions}>
        <KolamButton
          label="Tambah Supplier"
          onPress={() =>
            controller.onChangeForm({
              vendorPrices: [
                ...lines,
                {
                  id: `baru-${Date.now()}`,
                  vendorId: '',
                  vendorName: '',
                  price: '0',
                  shippingCost: '0',
                  link: '',
                },
              ],
            })
          }
        />
      </View>
    </View>
  );
}

function updateVendorLine(
  controller: KolamPackingMaterialController,
  form: KolamPackingMaterialFormState,
  index: number,
  patch: Partial<KolamPackingMaterialFormState['vendorPrices'][number]>,
) {
  controller.onChangeForm({
    vendorPrices: form.vendorPrices.map((line, lineIndex) =>
      lineIndex === index ? { ...line, ...patch } : line,
    ),
  });
}

function PackingHero({ item }: { item: KolamPackingMaterial }) {
  const firstPhoto = getKolamFileUrl(item.photos[0]);

  return (
    <View style={styles.hero}>
      {firstPhoto ? (
        <KolamRemoteImage
          accessibilityLabel={`Foto ${item.name}`}
          previewItems={item.photos.map((photo, index) => ({
            id: `${item.id}-hero-${index}`,
            title: `${item.name} ${index + 1}`,
            uri: getKolamFileUrl(photo) ?? '',
          }))}
          resizeMode="cover"
          scope="packing-material"
          sourceUri={firstPhoto}
          style={styles.heroPhoto}
        />
      ) : (
        <View style={styles.heroEmpty}>
          <KolamCopyStack
            items={[
              { id: 'name', text: item.name, style: styles.heroName },
              { id: 'meta', text: getPackingCategoryLabel(item.category), style: styles.heroMeta },
            ]}
          />
        </View>
      )}
    </View>
  );
}

function DetailMetric({
  badgeIntent,
  label,
  value,
}: {
  badgeIntent?: 'success' | 'warning' | 'danger' | 'muted';
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailMetricTile}>
      <Text style={styles.detailMetricLabel}>{label}</Text>
      {badgeIntent ? (
        <KolamStatusBadge intent={badgeIntent} label={value} />
      ) : (
        <Text style={styles.detailMetricValue}>{value}</Text>
      )}
    </View>
  );
}

function PriceTile({
  label,
  note,
  value,
}: {
  label: string;
  note?: string;
  value: string;
}) {
  return (
    <View style={styles.priceTile}>
      <Text style={styles.priceTileLabel}>{label}</Text>
      <Text style={styles.priceTileValue}>{value}</Text>
      {note ? <Text style={styles.priceTileNote}>{note}</Text> : null}
    </View>
  );
}

function getCheapestSupplier(item: KolamPackingMaterial) {
  return item.vendorPrices
    .filter(price => (price.totalCost || price.price + price.shippingCost) > 0)
    .sort(
      (left, right) =>
        (left.totalCost || left.price + left.shippingCost) -
        (right.totalCost || right.price + right.shippingCost),
    )[0];
}

function createPackingMediaItems(item: KolamPackingMaterial): KolamDetailMediaItem[] {
  return item.photos
    .map((photo, index) => {
      const uri = getKolamFileUrl(photo) ?? '';
      if (!uri) {
        return null;
      }

      return {
        badgeLabel: `${index + 1} / ${item.photos.length}`,
        id: `${item.id}-photo-${index}`,
        label: `${item.name} ${index + 1}`,
        revision: photo,
        scope: 'packing-material',
        type: 'image',
        uri,
      } satisfies KolamDetailMediaItem;
    })
    .filter(Boolean) as KolamDetailMediaItem[];
}

function createPackingVendorPriceItems(item: KolamPackingMaterial): KolamVendorPriceCardItem[] {
  return item.vendorPrices
    .filter(price => price.vendorName || price.price > 0 || price.shippingCost > 0)
    .map((price, index) => ({
      id: price.id || `packing-vendor-${index}`,
      link: price.link,
      price: price.price,
      priceHistory: [],
      shippingCost: price.shippingCost,
      totalCost: price.totalCost || price.price + price.shippingCost,
      vendorId: price.vendorId,
      vendorName: price.vendorName,
    }));
}

function openPackingSupplierDetail(onRouteChange: (route: string) => void) {
  return (vendorId: string) => {
    if (!vendorId) {
      return;
    }
    onRouteChange(`/suppliers/${encodeURIComponent(vendorId)}`);
  };
}

function getUsageTypeLabel(row: KolamPackingCatalogUsageRow) {
  if (row.entityType === 'species') {
    return 'Species';
  }
  return row.productType === 'raw' ? 'Bahan Baku' : 'Produk';
}

function getUsageIntent(row: KolamPackingCatalogUsageRow) {
  if (row.entityType === 'species') {
    return 'success';
  }
  return row.productType === 'raw' ? 'muted' : 'primary';
}

function getUsageRoute(row: KolamPackingCatalogUsageRow) {
  if (row.entityType === 'species') {
    return `/species/${row.entityId}`;
  }
  if (row.productType === 'raw') {
    return `/raw-materials/${row.entityId}`;
  }
  return `/products/${row.entityId}`;
}

function openPackingAssetDownload(packingId: string, assetId: string) {
  const base = appConfig.kolamApiBaseUrl.replace(/\/$/, '');
  void Linking.openURL(
    `${base}/packing/${encodeURIComponent(packingId)}/assets/${encodeURIComponent(assetId)}/download`,
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryTile}>
      <KolamCopyStack
        items={[
          { id: 'value', text: value, style: styles.summaryValue },
          { id: 'label', text: label, style: styles.summaryLabel },
        ]}
      />
    </View>
  );
}

function FieldShell({
  children,
  label,
  required = false,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <View style={settingsWebFormStyles.settingsWebFormField}>
      <KolamSettingsWebFieldLabel label={label} required={required} />
      {children}
    </View>
  );
}

function FormDivider({ title }: { title: string }) {
  return (
    <KolamCopyStack
      items={[{ id: 'title', text: title, style: styles.formDividerTitle }]}
    />
  );
}

function getPackingSummary(items: KolamPackingMaterial[]) {
  return items.reduce(
    (summary, item) => {
      if (item.status === 'active') {
        summary.active += 1;
      } else {
        summary.inactive += 1;
      }
      summary.stock += item.stock;
      return summary;
    },
    { active: 0, inactive: 0, stock: 0 },
  );
}

function filterPackings(
  items: KolamPackingMaterial[],
  search: string,
  categoryFilter: PackingCategoryFilter,
  statusFilter: PackingStatusFilter,
) {
  const query = search.trim().toLowerCase();

  return items.filter(item => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) {
      return false;
    }

    if (statusFilter !== 'all' && item.status !== statusFilter) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [
      item.name,
      item.description,
      item.category,
      getPackingCategoryLabel(item.category),
      formatPackingDimension(item),
      formatPackingWeight(item),
    ]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
}

function sortPackings(items: KolamPackingMaterial[], sortMode: PackingSortMode) {
  return [...items].sort((left, right) => {
    if (sortMode === 'stock-desc') {
      return right.stock - left.stock || left.name.localeCompare(right.name);
    }

    if (sortMode === 'name-asc') {
      return left.name.localeCompare(right.name);
    }

    if (sortMode === 'name-desc') {
      return right.name.localeCompare(left.name);
    }

    return getPackingTime(right) - getPackingTime(left);
  });
}

function getPackingTime(item: KolamPackingMaterial) {
  const timestamp = Date.parse(item.createdAt ?? item.updatedAt ?? '');
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getPackingRoute(item: KolamPackingMaterial) {
  return `/packing-materials/${encodeURIComponent(item.name || item.id)}`;
}

function createUnitOptions(units: KolamUnit[]) {
  const options = units.map(unit => ({
    label: `${unit.name}${unit.initial ? ` (${unit.initial})` : ''}`,
    value: unit.id,
  }));

  return options.length ? options : [{ label: 'Tidak ada satuan', value: '' }];
}

function getCategoryIntent(category: string) {
  switch (category) {
    case 'Wood':
      return 'warning';
    case 'Bubble Wrap':
      return 'info';
    case 'Foam':
      return 'primary';
    default:
      return 'muted';
  }
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function createPackingDetailTimestamp(item: KolamPackingMaterial) {
  const parts = [
    item.createdAt ? `Dibuat ${formatDateTime(item.createdAt)}` : '',
    item.updatedAt ? `Diperbarui ${formatDateTime(item.updatedAt)}` : '',
  ].filter(Boolean);

  return parts.length ? parts.join(' | ') : 'Tanggal belum tersedia';
}

const styles = StyleSheet.create({
  emptyText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    padding: 18,
    textAlign: 'center',
  },
  detailTopActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  detailPageHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  detailHeading: {
    flex: 1,
    gap: 4,
    minWidth: 260,
  },
  detailPageTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
  },
  detailPageMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  detailSectionStack: {
    gap: 16,
  },
  detailCard: {
    gap: 0,
    overflow: 'hidden',
    padding: 0,
  },
  detailCardHeader: {
    alignItems: 'flex-start',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  detailTitleWrap: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  detailTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  infoIcon: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderRadius: 999,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  infoIconText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  detailCardTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
  },
  detailCardDescription: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  badgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  overviewContent: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 22,
    padding: 16,
  },
  overviewBody: {
    flex: 1,
    flexBasis: 0,
    gap: 14,
    minWidth: 520,
  },
  overviewMetricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailMetricTile: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    flex: 1,
    flexBasis: '23%',
    gap: 6,
    minHeight: 76,
    minWidth: 150,
    padding: 12,
  },
  detailMetricLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 15,
  },
  detailMetricValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  descriptionBlock: {
    gap: 6,
  },
  fieldLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 15,
    textTransform: 'uppercase',
  },
  descriptionText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
  },
  separator: {
    backgroundColor: V.colors.border,
    height: 1,
  },
  priceSection: {
    gap: 8,
  },
  priceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  priceTile: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    flex: 1,
    flexBasis: '30%',
    minWidth: 190,
    padding: 12,
  },
  priceTileLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  priceTileValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
    marginTop: 4,
  },
  priceTileNote: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    marginTop: 4,
  },
  gallery: {
    gap: 10,
    width: 320,
  },
  galleryHeroWrap: {
    height: 320,
    position: 'relative',
    width: 320,
  },
  galleryHero: {
    backgroundColor: V.colors.muted,
    borderRadius: 8,
    height: 320,
    width: 320,
  },
  galleryEmpty: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderRadius: 8,
    height: 300,
    justifyContent: 'center',
    padding: 16,
    width: 300,
  },
  galleryEmptyTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
    textAlign: 'center',
  },
  galleryEmptyMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 6,
    textAlign: 'center',
  },
  galleryArrow: {
    minHeight: 32,
    minWidth: 32,
    paddingHorizontal: 0,
    position: 'absolute',
    top: 134,
  },
  galleryArrowLeft: {
    left: 8,
  },
  galleryArrowRight: {
    right: 8,
  },
  galleryArrowText: {
    color: V.colors.primary,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
  },
  galleryCounter: {
    backgroundColor: 'rgba(17, 24, 39, 0.72)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  galleryCounterText: {
    color: V.colors.primaryFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 15,
  },
  thumbnailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  thumbnail: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 7,
    borderWidth: 1,
    height: 58,
    width: 58,
  },
  thumbnailActive: {
    borderColor: V.colors.primary,
    borderWidth: 2,
  },
  simpleTable: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    margin: 12,
    overflow: 'hidden',
  },
  simpleTableRow: {
    alignItems: 'center',
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  simpleTableHeader: {
    backgroundColor: V.colors.mutedSoft,
    borderTopWidth: 0,
  },
  simpleTableHead: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  simpleTableText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  simpleTableStrong: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 18,
  },
  tableTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  tableMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  tableLink: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  supplierCell: {
    flex: 1.6,
    minWidth: 180,
  },
  moneyCell: {
    flex: 1,
    minWidth: 110,
    textAlign: 'right',
  },
  linkCell: {
    alignItems: 'flex-end',
    flex: 0.8,
    minWidth: 86,
  },
  typeCell: {
    flex: 0.9,
    minWidth: 112,
  },
  usageNameCell: {
    flex: 2,
    minWidth: 220,
  },
  codeCell: {
    flex: 0.9,
    minWidth: 92,
  },
  variantCell: {
    flex: 1,
    minWidth: 110,
  },
  qtyCell: {
    flex: 0.5,
    minWidth: 60,
    textAlign: 'right',
  },
  errorText: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 18,
    padding: 12,
  },
  mutedDash: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },

  surface: {
    gap: 16,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  errorBadge: {
    alignSelf: 'flex-start',
  },
  stack: {
    gap: 16,
    overflow: 'visible',
    position: 'relative',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryTile: {
    minWidth: 220,
    flex: 1,
    padding: 16,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  summaryValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  summaryLabel: {
    marginTop: 4,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  toolbarWrap: {
    position: 'relative',
    zIndex: 100000,
    elevation: 1000,
  },
  toolbarShell: {
    position: 'relative',
    zIndex: 100001,
    elevation: 1001,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    padding: 4,
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 8,
    backgroundColor: V.colors.bg,
  },
  filterRow: {
    position: 'relative',
    zIndex: 1001,
    elevation: 101,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  actionRow: {
    flexDirection: 'row',
    flexShrink: 0,
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: V.colors.border,
  },
  searchInput: {
    flexBasis: 180,
    flexGrow: 1,
    maxWidth: 260,
    minWidth: 150,
  },
  filterTrigger: {
    backgroundColor: V.colors.successSoft,
    borderColor: V.colors.success,
    flexBasis: 0,
    flexGrow: 1,
    minHeight: 34,
    minWidth: 128,
    paddingHorizontal: 8,
  },
  filterTriggerActive: {
    backgroundColor: V.colors.success,
    borderColor: V.colors.success,
  },
  filterTriggerText: {
    color: V.colors.success,
    fontWeight: '800',
  },
  filterTriggerTextActive: {
    color: V.colors.primaryFg,
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
    width: 240,
    zIndex: 120000,
  },
  filterPanelSort: {
    left: 236,
  },
  filterPanelCategory: {
    left: 390,
  },
  filterPanelStatus: {
    left: 544,
    width: 220,
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
  emptyWrap: {
    minHeight: 260,
    justifyContent: 'center',
  },
  activeActionRow: {
    zIndex: 2000,
    elevation: 100,
  },
  photoCell: {
    width: 72,
  },
  photoThumb: {
    width: 46,
    height: 46,
    borderRadius: 6,
    backgroundColor: V.colors.muted,
  },
  photoPlaceholder: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: V.colors.muted,
  },
  photoPlaceholderText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '800',
  },
  nameCell: {
    flex: 1,
    minWidth: 220,
  },
  rowTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  rowMeta: {
    marginTop: 2,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  categoryCell: {
    width: 120,
    alignItems: 'flex-start',
  },
  dimensionCell: {
    width: 128,
  },
  weightCell: {
    width: 96,
  },
  hppCell: {
    width: 116,
  },
  stockCell: {
    width: 72,
  },
  statusCell: {
    width: 104,
    alignItems: 'flex-end',
  },
  overflowCell: {
    width: 56,
    alignItems: 'flex-end',
  },
  footerWrap: {
    marginTop: 14,
  },
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'flex-end',
  },
  pageLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  detailActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  hero: {
    width: 160,
    minHeight: 124,
  },
  heroPhoto: {
    width: 160,
    height: 124,
    borderRadius: 6,
    backgroundColor: V.colors.muted,
  },
  heroEmpty: {
    minHeight: 124,
    justifyContent: 'center',
    padding: 14,
    borderRadius: 6,
    backgroundColor: V.colors.muted,
  },
  heroName: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  heroMeta: {
    marginTop: 6,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  formSplitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formSplitCell: {
    minWidth: 260,
    flex: 1,
  },
  formThirdCell: {
    minWidth: 180,
    flex: 1,
  },
  textArea: {
    minHeight: 82,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  formDividerTitle: {
    marginTop: 4,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 8,
  },
  vendorStack: {
    gap: 12,
  },
  vendorLine: {
    gap: 12,
    padding: 12,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
  },
  vendorActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  emptyVendorText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
});
