import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
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
import {
  fitKolamDataTableColumns,
  getKolamTableColumns,
  getKolamTableVisualContract,
  type KolamTableColumn,
} from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { formatRupiah } from '../lib/money';
import { getKolamFileUrl } from '../lib/file-url';
import {
  useKolamPackingMaterialController,
  type KolamPackingMaterialController,
} from '../hooks/use-kolam-packing-material-controller';
import { KolamButton } from './kolam-button';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamCheckmarkIcon } from './kolam-checkmark-icon';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import {
  getKolamDataTableColumnStyle,
  KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  KOLAM_DATA_TABLE_COLUMN_GAP,
} from './kolam-data-table-column-style';
import { KolamDataTableRowFrame } from './kolam-data-table-row-frame';
import {
  KolamDataTableActionsTrack,
  KolamDataTableMainTrack,
} from './kolam-data-table-tracks';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import {
  KolamDetailMediaPreview,
  type KolamDetailMediaItem,
} from './kolam-detail-media-preview';
import type { KolamImagePreviewItem } from './kolam-image-preview-dialog';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import {
  KolamEntityDetailAssetsPanel,
  type KolamEntityDetailAsset,
} from './kolam-entity-detail-assets-panel';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import { KolamNativeFormSection } from './kolam-native-form-section';
import { KolamRemoteImage } from './kolam-remote-image';
import {
  KolamVendorPriceCard,
  type KolamVendorPriceCardItem,
} from './kolam-pricing-detail-widgets';
import { appConfig } from '../config/app';
import {
  getKolamPackingMaterialUsedIn,
  uploadKolamPackingMaterialAsset,
  deleteKolamPackingMaterialAsset,
  uploadKolamPackingMaterialPhotos,
  deleteKolamPackingMaterialPhoto,
} from '../services/kolam-packing-option-api';
import { pickNativeImageFile } from '../services/native-file-picker';
import { KolamControlTabList } from './kolam-control-tab-list';
import { containsHtmlMarkup, KolamHtmlContent } from './kolam-html-content';
import { KolamSearchField } from './kolam-search-field';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';
import {
  measureFilterPanelAnchor,
  type KolamFilterPanelAnchor,
} from './kolam-filter-panel-anchor';
import { KolamTableFilterTrigger } from './kolam-table-filter-trigger';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';

type PackingSortMode = 'newest' | 'name-asc' | 'name-desc' | 'stock-desc';
type PackingStatusFilter = 'all' | 'active' | 'inactive';
type PackingCategoryFilter = 'all' | string;
type PackingListFilterPanel = 'sort' | 'category' | 'status';

const PACKING_FILTER_PANEL_WIDTH = 220;

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
      onRouteChange={onRouteChange}
    >
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
  if (controller.mode === 'list') {
    return (
      <View style={styles.surface}>
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

  const contextLabel =
    controller.mode === 'new'
      ? 'Bahan kemasan baru'
      : controller.mode === 'edit'
      ? `Edit · ${
          controller.selectedMaterial?.name ||
          controller.form.name ||
          'Bahan kemasan'
        }`
      : controller.selectedMaterial?.name || 'Detail bahan kemasan';

  return (
    <View style={styles.surface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.detailToolbarContext}>
              {contextLabel}
            </Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamRefreshButton
              accessibilityLabel="Refresh"
              disabled={controller.loading}
              onPress={() => {
                void controller.onRefresh();
              }}
            />
            <KolamButton
              label="Daftar"
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.('/packing-materials');
              }}
            />
            {controller.mode === 'detail' ? (
              <KolamButton
                intent="primary"
                label="Edit"
                onPress={controller.onEdit}
              />
            ) : null}
          </View>
        </View>
      </View>
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
  const [statusFilter, setStatusFilter] =
    React.useState<PackingStatusFilter>('all');
  const [pageSize, _setPageSize] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [activeFilterPanel, setActiveFilterPanel] =
    React.useState<PackingListFilterPanel | null>(null);
  const [panelAnchor, setPanelAnchor] =
    React.useState<KolamFilterPanelAnchor | null>(null);
  const toolbarRef = React.useRef<View>(null);
  const sortTriggerRef = React.useRef<View>(null);
  const categoryTriggerRef = React.useRef<View>(null);
  const statusTriggerRef = React.useRef<View>(null);
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamPackingMaterial | null>(null);
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
  const listColumns = React.useMemo(() => buildPackingListColumns(), []);
  const sortFilterOptions = React.useMemo<
    Array<{ label: string; value: PackingSortMode }>
  >(
    () => [
      { label: 'Terbaru', value: 'newest' },
      { label: 'Nama A-Z', value: 'name-asc' },
      { label: 'Nama Z-A', value: 'name-desc' },
      { label: 'Stok Terbanyak', value: 'stock-desc' },
    ],
    [],
  );
  const categoryFilterOptions = React.useMemo<
    Array<{ label: string; value: PackingCategoryFilter }>
  >(
    () => [{ label: 'Semua', value: 'all' }, ...KOLAM_PACKING_CATEGORY_OPTIONS],
    [],
  );
  const statusFilterOptions = React.useMemo<
    Array<{ label: string; value: PackingStatusFilter }>
  >(
    () => [
      { label: 'Semua Status', value: 'all' },
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

  const getFilterTriggerRef = (panel: PackingListFilterPanel) => {
    switch (panel) {
      case 'category':
        return categoryTriggerRef;
      case 'status':
        return statusTriggerRef;
      case 'sort':
      default:
        return sortTriggerRef;
    }
  };

  const anchorFilterPanel = React.useCallback(
    (panel: PackingListFilterPanel) => {
      measureFilterPanelAnchor(
        toolbarRef.current,
        getFilterTriggerRef(panel).current,
        PACKING_FILTER_PANEL_WIDTH,
        setPanelAnchor,
      );
    },
    [],
  );

  const openFilterPanel = (panel: PackingListFilterPanel) => {
    if (activeFilterPanel === panel) {
      setActiveFilterPanel(null);
      setPanelAnchor(null);
      return;
    }
    setActiveFilterPanel(null);
    setPanelAnchor(null);
    requestAnimationFrame(() => {
      measureFilterPanelAnchor(
        toolbarRef.current,
        getFilterTriggerRef(panel).current,
        PACKING_FILTER_PANEL_WIDTH,
        anchor => {
          setPanelAnchor(anchor);
          setActiveFilterPanel(panel);
        },
      );
    });
  };

  React.useEffect(() => {
    setPage(1);
  }, [categoryFilter, pageSize, search, sortMode, statusFilter]);

  React.useEffect(() => {
    if (!activeFilterPanel) {
      return;
    }
    requestAnimationFrame(() => anchorFilterPanel(activeFilterPanel));
  }, [activeFilterPanel, anchorFilterPanel]);

  const activeFilterOptions =
    activeFilterPanel === 'sort'
      ? sortFilterOptions
      : activeFilterPanel === 'category'
      ? categoryFilterOptions
      : statusFilterOptions;
  const activeFilterValue =
    activeFilterPanel === 'sort'
      ? sortMode
      : activeFilterPanel === 'category'
      ? categoryFilter
      : statusFilter;

  return (
    <View style={styles.stack}>
      <View ref={toolbarRef} collapsable={false} style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View
              style={[
                kolamTableToolbarStyles.filters,
                styles.listToolbarFilters,
              ]}
            >
              <KolamSearchField
                containerStyle={[
                  kolamTableToolbarStyles.searchInput,
                  styles.listToolbarSearch,
                ]}
                onChangeText={setSearch}
                placeholder="Cari bahan kemasan..."
                value={search}
              />
              <View ref={sortTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={sortMode !== 'newest'}
                  label={sortFilterLabel}
                  onPress={() => openFilterPanel('sort')}
                  open={activeFilterPanel === 'sort'}
                  variant="quiet"
                />
              </View>
              <View ref={categoryTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={categoryFilter !== 'all'}
                  label={categoryFilterLabel}
                  onPress={() => openFilterPanel('category')}
                  open={activeFilterPanel === 'category'}
                  variant="quiet"
                />
              </View>
              <View ref={statusTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={statusFilter !== 'all'}
                  label={statusFilterLabel}
                  onPress={() => openFilterPanel('status')}
                  open={activeFilterPanel === 'status'}
                  variant="quiet"
                />
              </View>
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              <KolamRefreshButton
                accessibilityLabel="Refresh"
                disabled={controller.loading}
                onPress={() => {
                  void controller.onRefresh();
                }}
              />
              <KolamButton
                intent="primary"
                label="Baru"
                tone="positive"
                onPress={() => {
                  controller.onCreateNew();
                  onRouteChange?.('/packing-materials/baru');
                }}
              />
            </View>
          </View>
        </View>
        {activeFilterPanel && panelAnchor ? (
          <View
            style={[
              styles.filterOverlayPanel,
              {
                left: panelAnchor.left,
                top: panelAnchor.top,
                width: PACKING_FILTER_PANEL_WIDTH,
              },
            ]}
          >
            {activeFilterOptions.map(option => {
              const selected = option.value === activeFilterValue;
              return (
                <KolamInteractionFrame
                  accessibilityLabel={option.label}
                  key={`${activeFilterPanel}-${option.value}`}
                  onPress={() => {
                    if (activeFilterPanel === 'sort') {
                      setSortMode(option.value as PackingSortMode);
                    } else if (activeFilterPanel === 'category') {
                      setCategoryFilter(option.value);
                    } else {
                      setStatusFilter(option.value as PackingStatusFilter);
                    }
                    setActiveFilterPanel(null);
                    setPanelAnchor(null);
                  }}
                  selected={selected}
                  style={[
                    styles.filterMenuItem,
                    selected ? styles.filterMenuItemSelected : null,
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.filterMenuItemLabel,
                      selected ? styles.filterMenuItemLabelSelected : null,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {selected ? (
                    <KolamCheckmarkIcon color={V.colors.primary} size="sm" />
                  ) : (
                    <View style={styles.filterMenuItemCheckSpacer} />
                  )}
                </KolamInteractionFrame>
              );
            })}
          </View>
        ) : null}
      </View>
      <KolamListTableComposition
        actionsColumn
        columns={listColumns}
        emptyTitle={
          controller.loading
            ? 'Memuat bahan kemasan...'
            : 'Belum ada bahan kemasan'
        }
        getRowKey={item => item.id}
        loading={controller.loading}
        pagination={{
          onPageChange: setPage,
          page: safePage,
          pageSize,
          total: sortedMaterials.length,
        }}
        renderActions={item => (
          <KolamPackingMaterialActionsMenu
            item={item}
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
        )}
        rows={pagedMaterials}
      />
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

function buildPackingListColumns(): Array<
  KolamListTableColumn<KolamPackingMaterial>
> {
  return [
    {
      align: 'center',
      flex: 0.55,
      id: 'photo',
      label: 'Foto',
      render: item => <PackingMaterialPhotoCell item={item} />,
    },
    {
      flex: 1.45,
      id: 'primary',
      label: 'Bahan Kemasan',
      render: item => <PackingMaterialIdentityCell item={item} />,
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'category',
      label: 'Kategori',
      render: item => (
        <KolamStatusBadge
          intent={getCategoryIntent(item.category)}
          label={getPackingCategoryLabel(item.category)}
          style={styles.centerBadge}
        />
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'dimension',
      label: 'Dimensi',
      render: item => (
        <Text numberOfLines={1} style={styles.cellText}>
          {formatPackingDimension(item)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.8,
      id: 'weight',
      label: 'Berat',
      render: item => (
        <Text numberOfLines={1} style={styles.cellText}>
          {formatPackingWeight(item)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'hpp',
      label: 'HPP',
      render: item => {
        const effectiveHpp = getPackingEffectiveHpp(item);
        return (
          <Text numberOfLines={1} style={styles.cellText}>
            {effectiveHpp > 0 ? formatRupiah(effectiveHpp) : '-'}
          </Text>
        );
      },
    },
    {
      align: 'center',
      flex: 0.65,
      id: 'stock',
      label: 'Stok',
      render: item => (
        <Text numberOfLines={1} style={styles.cellText}>
          {String(item.stock)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.8,
      id: 'status',
      label: 'Status',
      render: item => (
        <KolamStatusBadge
          intent={item.status === 'active' ? 'success' : 'warning'}
          label={item.status === 'active' ? 'Aktif' : 'Nonaktif'}
          style={styles.centerBadge}
        />
      ),
    },
  ];
}

function PackingMaterialPhotoCell({ item }: { item: KolamPackingMaterial }) {
  const photoUri = getKolamFileUrl(item.photos[0]);

  return photoUri ? (
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
  );
}

function PackingMaterialIdentityCell({ item }: { item: KolamPackingMaterial }) {
  const description = item.description.trim();

  return (
    <View style={styles.identityCell}>
      <KolamCopyStack
        containerStyle={styles.nameCopy}
        items={[
          {
            id: 'name',
            text: item.name,
            style: styles.rowTitle,
            textProps: { numberOfLines: 1 },
          },
          ...(description
            ? [
                {
                  id: 'description',
                  text: description,
                  style: styles.rowMeta,
                  textProps: { numberOfLines: 1 },
                },
              ]
            : []),
        ]}
      />
    </View>
  );
}

function KolamPackingMaterialActionsMenu({
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

  return (
    <View style={actionMenuOpen ? styles.activeActionRow : null}>
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
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function KolamPackingMaterialRow({
  columns,
  item,
  onDelete,
  onEdit,
  onSelect,
}: {
  columns: KolamTableColumn[];
  item: KolamPackingMaterial;
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const photoUri = getKolamFileUrl(item.photos[0]);
  const description = item.description.trim();
  const effectiveHpp = getPackingEffectiveHpp(item);
  const columnOf = React.useCallback(
    (id: (typeof columns)[number]['id']) =>
      columns.find(column => column.id === id),
    [columns],
  );
  const photoColumn = columnOf('meta');
  const primaryColumn = columnOf('primary');
  const categoryColumn = columnOf('children');
  const dimensionColumn = columnOf('notes');
  const weightColumn = columnOf('marketplace');
  const hppColumn = columnOf('amount');
  const stockColumn = columnOf('raws');
  const statusColumn = columnOf('status');
  const actionsColumn = columnOf('actions');

  return (
    <KolamDataTableRowFrame
      style={actionMenuOpen ? styles.activeActionRow : undefined}
    >
      <KolamDataTableMainTrack>
        <View
          style={[
            styles.listCell,
            photoColumn ? getKolamDataTableColumnStyle(photoColumn) : null,
          ]}
        >
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
        <View
          style={[
            styles.listCell,
            styles.identityCell,
            primaryColumn ? getKolamDataTableColumnStyle(primaryColumn) : null,
          ]}
        >
          <KolamCopyStack
            containerStyle={styles.nameCopy}
            items={[
              {
                id: 'name',
                text: item.name,
                style: styles.rowTitle,
                textProps: { numberOfLines: 1 },
              },
              ...(description
                ? [
                    {
                      id: 'description',
                      text: description,
                      style: styles.rowMeta,
                      textProps: { numberOfLines: 1 },
                    },
                  ]
                : []),
            ]}
          />
        </View>
        <View
          style={[
            styles.listCell,
            categoryColumn
              ? getKolamDataTableColumnStyle(categoryColumn)
              : null,
          ]}
        >
          <KolamStatusBadge
            intent={getCategoryIntent(item.category)}
            label={getPackingCategoryLabel(item.category)}
            style={styles.centerBadge}
          />
        </View>
        <View
          style={[
            styles.listCell,
            dimensionColumn
              ? getKolamDataTableColumnStyle(dimensionColumn)
              : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.cellText}>
            {formatPackingDimension(item)}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            weightColumn ? getKolamDataTableColumnStyle(weightColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.cellText}>
            {formatPackingWeight(item)}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            hppColumn ? getKolamDataTableColumnStyle(hppColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.cellText}>
            {effectiveHpp > 0 ? formatRupiah(effectiveHpp) : '-'}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            stockColumn ? getKolamDataTableColumnStyle(stockColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.cellText}>
            {String(item.stock)}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            statusColumn ? getKolamDataTableColumnStyle(statusColumn) : null,
          ]}
        >
          <KolamStatusBadge
            intent={item.status === 'active' ? 'success' : 'warning'}
            label={item.status === 'active' ? 'Aktif' : 'Nonaktif'}
            style={styles.centerBadge}
          />
        </View>
      </KolamDataTableMainTrack>
      <KolamDataTableActionsTrack
        style={styles.actionsTrack}
        width={Math.max(
          actionsColumn?.width ?? KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
          KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
        )}
      >
        <KolamOverflowMenuButton
          accessibilityLabel={`Menu ${item.name}`}
          actions={[
            { label: 'Lihat', onPress: onSelect },
            { label: 'Rubah', onPress: onEdit },
            { label: 'Nonaktifkan', onPress: onDelete, tone: 'danger' },
          ]}
          onOpenChange={setActionMenuOpen}
        />
      </KolamDataTableActionsTrack>
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
  const [activeTab, setActiveTab] = React.useState<'overview' | 'assets'>(
    'overview',
  );
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
          controller={controller}
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
  controller,
  item,
  onRouteChange,
}: {
  controller: KolamPackingMaterialController;
  item: KolamPackingMaterial;
  onRouteChange?: (route: string) => void;
}) {
  const effectiveHpp = getPackingEffectiveHpp(item);
  const cheapestSupplier = getCheapestSupplier(item);
  const vendorPrices = React.useMemo(
    () => createPackingVendorPriceItems(item),
    [item],
  );
  const mediaItems = React.useMemo(() => createPackingMediaItems(item), [item]);

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
            <PackingPhotoManager controller={controller} item={item} />
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
                  note={
                    cheapestSupplier
                      ? `Termurah: ${cheapestSupplier.vendorName}`
                      : undefined
                  }
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
        onOpenVendor={
          onRouteChange ? openPackingSupplierDetail(onRouteChange) : undefined
        }
        prices={vendorPrices}
        title="Harga Vendor"
      />
      <PackingUsageCard item={item} onRouteChange={onRouteChange} />
    </View>
  );
}

function PackingPhotoManager({
  controller,
  item,
}: {
  controller: KolamPackingMaterialController;
  item: KolamPackingMaterial;
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const previewItems = React.useMemo(
    () => createPackingPhotoPreviewItems(item),
    [item],
  );

  const uploadPhoto = React.useCallback(async () => {
    setError('');
    try {
      const picked = await pickNativeImageFile();
      const localUri = picked.uri || picked.path;
      if (picked.cancelled || !localUri) {
        return;
      }

      setBusy(true);
      const updated = await uploadKolamPackingMaterialPhotos(item.id, [localUri]);
      await controller.onSelectMaterial(updated);
    } catch (uploadError) {
      setError(getPackingPhotoErrorMessage(uploadError));
    } finally {
      setBusy(false);
    }
  }, [controller, item.id]);

  const deletePhoto = React.useCallback(
    async (index: number) => {
      setError('');
      setBusy(true);
      try {
        const updated = await deleteKolamPackingMaterialPhoto(item.id, index);
        await controller.onSelectMaterial(updated);
      } catch (deleteError) {
        setError(getPackingPhotoErrorMessage(deleteError));
      } finally {
        setBusy(false);
      }
    },
    [controller, item.id],
  );

  return (
    <View style={styles.photoManager}>
      <View style={styles.photoManagerHeader}>
        <Text style={styles.fieldLabel}>Foto</Text>
        <KolamButton
          disabled={busy}
          label={busy ? 'Memproses...' : 'Tambah Foto'}
          onPress={() => {
            void uploadPhoto();
          }}
        />
      </View>
      {item.photos.length ? (
        <View style={styles.photoManagerGrid}>
          {item.photos.map((photo, index) => {
            const uri = getKolamFileUrl(photo);
            return (
              <View key={`${photo}-${index}`} style={styles.photoManagerTile}>
                {uri ? (
                  <KolamRemoteImage
                    accessibilityLabel={`${item.name} ${index + 1}`}
                    previewIndex={index}
                    previewItems={previewItems}
                    resizeMode="cover"
                    revision={photo}
                    scope="packing-material"
                    sourceUri={uri}
                    style={styles.photoManagerImage}
                  />
                ) : (
                  <View style={styles.photoManagerMissing}>
                    <Text style={styles.photoManagerMissingText}>-</Text>
                  </View>
                )}
                <KolamButton
                  disabled={busy}
                  intent="plain"
                  label="Hapus"
                  onPress={() => {
                    void deletePhoto(index);
                  }}
                  textStyle={styles.photoManagerDeleteText}
                />
              </View>
            );
          })}
        </View>
      ) : null}
      {error ? <Text style={styles.photoManagerError}>{error}</Text> : null}
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
          setError(
            err instanceof Error
              ? err.message
              : 'Gagal memuat pemakaian kemasan.',
          );
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
            Produk dan spesies yang menautkan bahan kemasan ini.
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
            <Text style={[styles.simpleTableHead, styles.usageNameCell]}>
              Nama
            </Text>
            <Text style={[styles.simpleTableHead, styles.codeCell]}>Kode</Text>
            <Text style={[styles.simpleTableHead, styles.variantCell]}>
              Varian
            </Text>
            <Text style={[styles.simpleTableHead, styles.qtyCell]}>Qty</Text>
          </View>
          {rows.map(row => (
            <View
              key={`${row.entityType}-${row.entityId}-${row.variantLabel}-${row.quantity}`}
              style={styles.simpleTableRow}
            >
              <View style={styles.typeCell}>
                <KolamStatusBadge
                  intent={getUsageIntent(row)}
                  label={getUsageTypeLabel(row)}
                />
              </View>
              <View style={styles.usageNameCell}>
                <Text
                  onPress={() => onRouteChange?.(getUsageRoute(row))}
                  style={styles.tableLink}
                >
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
          Belum dipakai di produk atau spesies manapun.
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
  const uploadAsset = React.useCallback(
    async (title: string, localUri: string) => {
      const updated = await uploadKolamPackingMaterialAsset(
        item.id,
        title,
        localUri,
      );
      await controller.onSelectMaterial(updated);
      return updated.assets;
    },
    [controller, item.id],
  );

  const deleteAsset = React.useCallback(
    async (assetId: string) => {
      const updated = await deleteKolamPackingMaterialAsset(item.id, assetId);
      await controller.onSelectMaterial(updated);
      return updated.assets;
    },
    [controller, item.id],
  );

  const downloadAsset = React.useCallback(
    (asset: KolamEntityDetailAsset) => {
      openPackingAssetDownload(item.id, asset.id);
    },
    [item.id],
  );

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
    <KolamNativeFormSection
      section={getKolamFormSection('packing-material-detail')}
    >
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
                  value={
                    form.weightUnit ||
                    createUnitOptions(weightUnits)[0]?.value ||
                    ''
                  }
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
              value={
                form.dimensionUnit ||
                createUnitOptions(dimensionUnits)[0]?.value ||
                ''
              }
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
                      updateVendorLine(controller, form, index, {
                        shippingCost,
                      })
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
                    vendorPrices: lines.filter(
                      (_, lineIndex) => lineIndex !== index,
                    ),
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
              {
                id: 'meta',
                text: getPackingCategoryLabel(item.category),
                style: styles.heroMeta,
              },
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

function createPackingMediaItems(
  item: KolamPackingMaterial,
): KolamDetailMediaItem[] {
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

function createPackingPhotoPreviewItems(
  item: KolamPackingMaterial,
): KolamImagePreviewItem[] {
  const previewItems: KolamImagePreviewItem[] = [];

  item.photos.forEach((photo, index) => {
    const uri = getKolamFileUrl(photo);
    if (!uri) {
      return;
    }

    previewItems.push({
      revision: photo,
      scope: 'packing-material',
      title: `${item.name} ${index + 1}`,
      uri,
    });
  });

  return previewItems;
}

function getPackingPhotoErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return 'Gagal memperbarui foto bahan kemasan.';
}

function createPackingVendorPriceItems(
  item: KolamPackingMaterial,
): KolamVendorPriceCardItem[] {
  return item.vendorPrices
    .filter(
      price => price.vendorName || price.price > 0 || price.shippingCost > 0,
    )
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
    return 'Spesies';
  }
  return row.productType === 'raw' ? 'Bahan baku' : 'Produk';
}

function getUsageIntent(row: KolamPackingCatalogUsageRow) {
  if (row.entityType === 'species') {
    return 'success';
  }
  return row.productType === 'raw' ? 'muted' : 'primary';
}

function getUsageRoute(row: KolamPackingCatalogUsageRow) {
  const entityId = encodeURIComponent(row.entityId);
  if (row.entityType === 'species') {
    return `/species/${entityId}`;
  }
  if (row.productType === 'raw') {
    return `/raw-materials/${entityId}`;
  }
  return `/products/${entityId}`;
}

function openPackingAssetDownload(packingId: string, assetId: string) {
  const base = appConfig.kolamApiBaseUrl.replace(/\/$/, '');
  void Linking.openURL(
    `${base}/packing/${encodeURIComponent(
      packingId,
    )}/assets/${encodeURIComponent(assetId)}/download`,
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

function sortPackings(
  items: KolamPackingMaterial[],
  sortMode: PackingSortMode,
) {
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
  return `/packing-materials/${encodeURIComponent(item.id)}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function fitPackingListColumns(containerWidth: number): KolamTableColumn[] {
  // Prefer shared fitter so floors cannot exceed body budget (weighted Math.max
  // floors previously overflowed MainTrack → cells piled onto neighbors).
  // Preferred widths in `packing-material` columns already bias Nama.
  return fitKolamDataTableColumns(
    getKolamTableColumns('packing-material'),
    containerWidth,
    {
      actionsMinWidth: KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
      gap: KOLAM_DATA_TABLE_COLUMN_GAP,
      paddingX: getKolamTableVisualContract().body.cellPaddingX * 2,
      primaryMinWidth: 160,
      secondaryMinWidth: 56,
    },
  );
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
  photoManager: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 10,
    width: 320,
  },
  photoManagerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  photoManagerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoManagerTile: {
    alignItems: 'center',
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 6,
    width: 92,
  },
  photoManagerImage: {
    backgroundColor: V.colors.muted,
    borderRadius: 6,
    height: 70,
    width: 78,
  },
  photoManagerMissing: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderRadius: 6,
    height: 70,
    justifyContent: 'center',
    width: 78,
  },
  photoManagerMissingText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  photoManagerDeleteText: {
    color: V.colors.danger,
    fontSize: 11,
    lineHeight: 15,
  },
  photoManagerError: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
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
  detailToolbarContext: {
    color: V.colors.fg,
    flexShrink: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  errorBadge: {
    alignSelf: 'flex-start',
  },
  stack: {
    gap: 16,
    overflow: 'visible',
    position: 'relative',
  },
  toolbarWrap: {
    position: 'relative',
    zIndex: 100000,
    elevation: 1000,
  },
  listToolbarFilters: {
    flexWrap: 'nowrap',
  },
  listToolbarSearch: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 120,
  },
  filterOverlayPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    elevation: 1200,
    gap: 2,
    padding: 6,
    position: 'absolute',
    shadowColor: V.colors.fg,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    zIndex: 120000,
  },
  filterMenuItem: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filterMenuItemSelected: {
    backgroundColor: V.colors.primarySoft,
  },
  filterMenuItemLabel: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  filterMenuItemLabelSelected: {
    color: V.colors.primary,
    fontWeight: '800',
  },
  filterMenuItemCheckSpacer: {
    height: 14,
    width: 14,
  },
  emptyWrap: {
    minHeight: 260,
    justifyContent: 'center',
  },
  activeActionRow: {
    zIndex: 2000,
    elevation: 100,
  },
  listCell: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  identityCell: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  actionsTrack: {
    alignItems: 'center',
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
  nameCopy: {
    minWidth: 0,
    width: '100%',
  },
  rowTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'left',
  },
  rowMeta: {
    marginTop: 2,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    textAlign: 'left',
  },
  cellText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
  centerBadge: {
    alignSelf: 'center',
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
