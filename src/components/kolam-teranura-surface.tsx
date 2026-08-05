import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  fitKolamDataTableColumns,
  getKolamTableColumns,
  getKolamTableVisualContract,
  type KolamTableColumn,
} from '../domain/kolam-table';
import { type KolamTeranura } from '../domain/kolam-teranura';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  type KolamTeranuraController,
  type KolamTeranuraSellableFilter,
  useKolamTeranuraController,
} from '../hooks/use-kolam-teranura-controller';
import { formatRupiah } from '../lib/money';
import { KolamBadge } from './kolam-badge';
import { KolamButton } from './kolam-button';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamResetButton } from './kolam-reset-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamControlTabList } from './kolam-control-tab-list';
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
import { KolamOverflowMenuButton } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSearchField } from './kolam-search-field';
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

type TeranuraFilterPanel = 'category' | 'brand' | 'sellable';
const TERANURA_FILTER_PANEL_WIDTH = 320;

export function KolamTeranuraSurface({
  onRouteChange,
  route = '/teranura',
}: {
  onRouteChange?: (route: string) => void;
  route?: string;
}) {
  const controller = useKolamTeranuraController(route);

  return (
    <KolamTeranuraShell controller={controller} onRouteChange={onRouteChange}>
      {controller.mode === 'list' ? (
        <KolamTeranuraList
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : (
        <KolamTeranuraDetail controller={controller} />
      )}
    </KolamTeranuraShell>
  );
}

function KolamTeranuraShell({
  children,
  controller,
  onRouteChange,
}: {
  children: React.ReactNode;
  controller: KolamTeranuraController;
  onRouteChange?: (route: string) => void;
}) {
  if (controller.mode === 'list') {
    return (
      <View style={styles.surface}>
        {controller.error ? (
          <Text style={styles.error}>{controller.error}</Text>
        ) : null}
        {children}
      </View>
    );
  }

  const item = controller.selectedItem;
  const contextLabel = item?.name || 'Detail Teranura';

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
              onPress={() => onRouteChange?.('/teranura')}
            />
            {item ? (
              <KolamButton
                intent="primary"
                label="Edit"
                onPress={() => onRouteChange?.(`/teranura/${item.id}/edit`)}
              />
            ) : null}
          </View>
        </View>
      </View>
      {controller.error ? (
        <Text style={styles.error}>{controller.error}</Text>
      ) : null}
      {children}
    </View>
  );
}

function KolamTeranuraList({
  controller,
  onRouteChange,
}: {
  controller: KolamTeranuraController;
  onRouteChange?: (route: string) => void;
}) {
  const [activeFilterPanel, setActiveFilterPanel] =
    React.useState<TeranuraFilterPanel | null>(null);
  const [filterPanelQuery, setFilterPanelQuery] = React.useState('');
  const [panelAnchor, setPanelAnchor] =
    React.useState<KolamFilterPanelAnchor | null>(null);
  const toolbarRef = React.useRef<View>(null);
  const categoryTriggerRef = React.useRef<View>(null);
  const brandTriggerRef = React.useRef<View>(null);
  const sellableTriggerRef = React.useRef<View>(null);
  const listColumns = React.useMemo(() => buildTeranuraListColumns(), []);
  const categoryOptions = React.useMemo(
    () => [
      { label: 'Semua kategori', value: 'all' },
      ...controller.categories.map(category => ({
        label: category.name,
        value: category.id,
      })),
    ],
    [controller.categories],
  );
  const brandOptions = React.useMemo(
    () => [
      { label: 'Semua merek', value: 'all' },
      ...controller.brands.map(brand => ({
        label: brand.name,
        value: brand.id,
      })),
    ],
    [controller.brands],
  );
  const sellableOptions = React.useMemo(
    (): Array<{ label: string; value: KolamTeranuraSellableFilter }> => [
      { label: 'Semua status', value: 'all' },
      { label: 'Dapat dijual', value: 'true' },
      { label: 'Tidak dijual', value: 'false' },
    ],
    [],
  );
  const pageCount = Math.max(1, controller.pagination.totalPages);
  const safePage = Math.min(Math.max(controller.pagination.page, 1), pageCount);
  const selectedCategory = controller.filters.categoryIds[0] ?? 'all';
  const selectedBrand = controller.filters.brandIds[0] ?? 'all';
  const categoryFilterLabel = getTeranuraFilterLabel(
    categoryOptions,
    selectedCategory,
    'Kategori',
  );
  const brandFilterLabel = getTeranuraFilterLabel(
    brandOptions,
    selectedBrand,
    'Merek',
  );
  const sellableFilterLabel = getTeranuraFilterLabel(
    sellableOptions,
    controller.filters.sellable,
    'Status',
  );
  const hasActiveFilters =
    Boolean(controller.filters.search.trim()) ||
    selectedCategory !== 'all' ||
    selectedBrand !== 'all' ||
    controller.filters.sellable !== 'all';
  const getFilterTriggerRef = (panel: TeranuraFilterPanel) => {
    switch (panel) {
      case 'category':
        return categoryTriggerRef;
      case 'brand':
        return brandTriggerRef;
      case 'sellable':
      default:
        return sellableTriggerRef;
    }
  };

  const anchorFilterPanel = React.useCallback((panel: TeranuraFilterPanel) => {
    measureFilterPanelAnchor(
      toolbarRef.current,
      getFilterTriggerRef(panel).current,
      TERANURA_FILTER_PANEL_WIDTH,
      setPanelAnchor,
    );
  }, []);

  const openFilterPanel = React.useCallback(
    (panel: TeranuraFilterPanel) => {
      setFilterPanelQuery('');
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
          TERANURA_FILTER_PANEL_WIDTH,
          anchor => {
            setPanelAnchor(anchor);
            setActiveFilterPanel(panel);
          },
        );
      });
    },
    [activeFilterPanel],
  );
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
                onChangeText={controller.onSearchChange}
                placeholder="Cari Teranura..."
                value={controller.filters.search}
              />
              <View ref={categoryTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'category' ||
                    selectedCategory !== 'all'
                  }
                  label={categoryFilterLabel}
                  onPress={() => openFilterPanel('category')}
                  open={activeFilterPanel === 'category'}
                  variant="quiet"
                />
              </View>
              <View ref={brandTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'brand' || selectedBrand !== 'all'
                  }
                  label={brandFilterLabel}
                  onPress={() => openFilterPanel('brand')}
                  open={activeFilterPanel === 'brand'}
                  variant="quiet"
                />
              </View>
              <View ref={sellableTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'sellable' ||
                    controller.filters.sellable !== 'all'
                  }
                  label={sellableFilterLabel}
                  onPress={() => openFilterPanel('sellable')}
                  open={activeFilterPanel === 'sellable'}
                  variant="quiet"
                />
              </View>
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              {hasActiveFilters ? (
                <KolamResetButton
                  muted
                  onPress={() => {
                    closeFilterPanel();
                    controller.onChangeFilters({
                      brandIds: [],
                      categoryIds: [],
                      search: '',
                      sellable: 'all',
                    });
                  }}
                />
              ) : null}
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
                onPress={() => onRouteChange?.('/teranura/create')}
              />
            </View>
          </View>
        </View>
        {activeFilterPanel && panelAnchor ? (
          <TeranuraFilterOverlayPanel
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
            onSellableChange={value => {
              controller.onChangeFilters({ sellable: value });
              closeFilterPanel();
            }}
            panelAnchor={panelAnchor}
            query={filterPanelQuery}
            selectedBrand={selectedBrand}
            selectedCategory={selectedCategory}
            selectedSellable={controller.filters.sellable}
            sellableOptions={sellableOptions}
          />
        ) : null}
      </View>

      <KolamListTableComposition
        actionsColumn
        columns={listColumns}
        emptyTitle={
          controller.loading ? 'Memuat Teranura...' : 'Belum ada Teranura'
        }
        getRowKey={item => item.id}
        loading={controller.loading}
        pagination={{
          onPageChange: page => controller.onPageChange(page),
          page: safePage,
          pageSize: controller.pagination.limit,
          total: controller.pagination.total || controller.items.length,
        }}
        renderActions={item => (
          <TeranuraActionsMenu
            item={item}
            onEdit={() => onRouteChange?.(`/teranura/${item.id}/edit`)}
            onSelect={() => onRouteChange?.(`/teranura/${item.id}`)}
          />
        )}
        rows={controller.items}
        style={styles.tableFrame}
      />
    </View>
  );
}

function KolamTeranuraDetail({
  controller,
}: {
  controller: KolamTeranuraController;
}) {
  const item = controller.selectedItem;
  const loading = controller.loading;
  const [activeTab, setActiveTab] = React.useState('catalog');
  const tabItems = React.useMemo(
    () => [
      { id: 'catalog', label: 'Katalog' },
      { id: 'iot', label: 'Perangkat IoT' },
    ],
    [],
  );
  const tabPanel = (
    <>
      <KolamControlTabList
        accessibilityLabel="Tab detail Teranura"
        items={tabItems}
        onSelect={setActiveTab}
        selectedId={activeTab}
      />
      <KolamContentFrame
        style={styles.detailTabPanel}
        variant="settingsWebConfig"
      >
        <KolamEmptyState
          compact
          message={
            activeTab === 'iot'
              ? 'Panel perangkat IoT akan diisi setelah audit endpoint dan payload IoT Teranura.'
              : 'Ringkasan katalog Teranura akan diisi pada fase berikutnya.'
          }
          title={activeTab === 'iot' ? 'Perangkat IoT' : 'Katalog'}
        />
      </KolamContentFrame>
    </>
  );

  if (!item) {
    return (
      <View style={styles.detailRoot}>
        <View style={styles.detailHeaderRow}>
          <View style={styles.headingCopy}>
            <Text style={styles.eyebrow}>TERANURA</Text>
            <Text style={styles.detailTitle}>Detail Teranura</Text>
            <Text style={styles.description}>
              {loading
                ? 'Memuat detail Teranura...'
                : 'Detail Teranura tidak ditemukan.'}
            </Text>
          </View>
        </View>
        {tabPanel}
      </View>
    );
  }

  return (
    <View style={styles.detailRoot}>
      <View style={styles.detailHeaderRow}>
        <View style={styles.headingCopy}>
          <View style={styles.detailEyebrowRow}>
            <Text style={styles.eyebrow}>TERANURA</Text>
            {item.deviceLine === 'freyer' ? (
              <KolamBadge intent="info" label="Freyer" />
            ) : null}
          </View>
          <Text style={styles.detailTitle}>{item.name}</Text>
          <Text style={styles.description}>
            Dibuat {formatDateTime(item.createdAt)} | Diperbarui{' '}
            {formatDateTime(item.updatedAt)}
          </Text>
        </View>
        <View style={styles.detailHeaderActions}>
          <KolamButton
            disabled
            intent="danger"
            label="Hapus"
            onPress={() => undefined}
          />
        </View>
      </View>
      {tabPanel}
    </View>
  );
}

function buildTeranuraListColumns(): Array<
  KolamListTableColumn<KolamTeranura>
> {
  return [
    {
      flex: 2,
      id: 'primary',
      label: 'Teranura',
      render: item => <TeranuraIdentityCell item={item} />,
    },
    {
      flex: 0.9,
      id: 'sku',
      label: 'SKU',
      render: item => (
        <Text numberOfLines={1} selectable style={styles.cellText}>
          {item.sku || item.productCode || '-'}
        </Text>
      ),
    },
    {
      flex: 1.05,
      id: 'brand',
      label: 'Merek',
      render: item => <TeranuraBrandCell item={item} />,
    },
    {
      align: 'center',
      flex: 0.95,
      id: 'variant',
      label: 'Tipe',
      render: item => (
        <Text numberOfLines={1} style={styles.cellText}>
          {item.variants.length ? 'Produk varian' : 'Produk standar'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'price',
      label: 'Harga',
      render: item => (
        <Text numberOfLines={1} style={styles.cellText}>
          {item.priceToSell > 0 ? formatRupiah(item.priceToSell) : '-'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.8,
      id: 'stock',
      label: 'Stok',
      render: item => (
        <Text numberOfLines={1} style={styles.cellText}>
          {formatNumber(item.stock)}
          {item.unitLabel ? ` ${item.unitLabel}` : ''}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'status',
      label: 'Status',
      render: item => (
        <KolamBadge
          intent={item.sellable ? 'success' : 'secondary'}
          label={item.sellable ? 'Dapat dijual' : 'Tidak dijual'}
          style={styles.centerBadge}
        />
      ),
    },
  ];
}

function TeranuraIdentityCell({ item }: { item: KolamTeranura }) {
  return (
    <View style={styles.primaryCell}>
      <View style={styles.photoBox}>
        <KolamRemoteImage
          accessibilityLabel={item.name}
          scope="teranura"
          sourceUri={item.photoUrl}
          style={styles.photo}
        />
      </View>
      <View style={styles.primaryTextWrap}>
        <View style={styles.nameRow}>
          <Text numberOfLines={2} style={styles.nameText}>
            {item.name}
          </Text>
          {item.deviceLine === 'freyer' ? (
            <KolamBadge intent="info" label="Freyer" />
          ) : null}
        </View>
        <Text numberOfLines={1} style={styles.metaText}>
          {item.category?.name ?? 'Tanpa kategori'}
        </Text>
      </View>
    </View>
  );
}

function TeranuraBrandCell({ item }: { item: KolamTeranura }) {
  return (
    <View style={styles.brandCell}>
      {item.brand?.logoUrl ? (
        <KolamRemoteImage
          accessibilityLabel={item.brand.name}
          scope="brand"
          sourceUri={item.brand.logoUrl}
          style={styles.brandLogo}
        />
      ) : null}
      <Text numberOfLines={1} style={styles.cellText}>
        {item.brand?.name ?? '-'}
      </Text>
    </View>
  );
}

function TeranuraActionsMenu({
  item,
  onEdit,
  onSelect,
}: {
  item: KolamTeranura;
  onEdit: () => void;
  onSelect: () => void;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);

  return (
    <View style={actionMenuOpen ? styles.activeActionRow : null}>
      <KolamOverflowMenuButton
        accessibilityLabel={`Menu ${item.name}`}
        onOpenChange={setActionMenuOpen}
        actions={[
          { label: 'Lihat', onPress: onSelect },
          { label: 'Rubah', onPress: onEdit },
          {
            disabled: true,
            label: 'Hapus',
            onPress: () => undefined,
            tone: 'danger',
          },
        ]}
      />
    </View>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TeranuraRow({
  columns,
  item,
  onEdit,
  onSelect,
}: {
  columns: KolamTableColumn[];
  item: KolamTeranura;
  onEdit: () => void;
  onSelect: () => void;
}) {
  const code = item.sku || item.productCode || '-';
  const variantLabel = item.variants.length
    ? 'Produk varian'
    : 'Produk standar';
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const columnOf = React.useCallback(
    (id: KolamTableColumn['id']) => columns.find(column => column.id === id),
    [columns],
  );
  const primaryColumn = columnOf('primary');
  const skuColumn = columnOf('meta');
  const brandColumn = columnOf('price');
  const variantColumn = columnOf('children');
  const priceColumn = columnOf('amount');
  const stockColumn = columnOf('products');
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
            styles.identityCell,
            primaryColumn ? getKolamDataTableColumnStyle(primaryColumn) : null,
          ]}
        >
          <View style={styles.primaryCell}>
            <View style={styles.photoBox}>
              <KolamRemoteImage
                accessibilityLabel={item.name}
                scope="teranura"
                sourceUri={item.photoUrl}
                style={styles.photo}
              />
            </View>
            <View style={styles.primaryTextWrap}>
              <View style={styles.nameRow}>
                <Text numberOfLines={2} style={styles.nameText}>
                  {item.name}
                </Text>
                {item.deviceLine === 'freyer' ? (
                  <KolamBadge intent="info" label="Freyer" />
                ) : null}
              </View>
              <Text numberOfLines={1} style={styles.metaText}>
                {item.category?.name ?? 'Tanpa kategori'}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={[
            styles.listCell,
            skuColumn ? getKolamDataTableColumnStyle(skuColumn) : null,
          ]}
        >
          <Text numberOfLines={1} selectable style={styles.cellText}>
            {code}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            brandColumn ? getKolamDataTableColumnStyle(brandColumn) : null,
          ]}
        >
          <View style={styles.brandCell}>
            {item.brand?.logoUrl ? (
              <KolamRemoteImage
                accessibilityLabel={item.brand.name}
                scope="brand"
                sourceUri={item.brand.logoUrl}
                style={styles.brandLogo}
              />
            ) : null}
            <Text numberOfLines={1} style={styles.cellText}>
              {item.brand?.name ?? '-'}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.listCell,
            variantColumn ? getKolamDataTableColumnStyle(variantColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.cellText}>
            {variantLabel}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            priceColumn ? getKolamDataTableColumnStyle(priceColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.cellText}>
            {item.priceToSell > 0 ? formatRupiah(item.priceToSell) : '-'}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            stockColumn ? getKolamDataTableColumnStyle(stockColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.cellText}>
            {formatNumber(item.stock)}
            {item.unitLabel ? ` ${item.unitLabel}` : ''}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            statusColumn ? getKolamDataTableColumnStyle(statusColumn) : null,
          ]}
        >
          <KolamBadge
            intent={item.sellable ? 'success' : 'secondary'}
            label={item.sellable ? 'Dapat dijual' : 'Tidak dijual'}
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
          onOpenChange={setActionMenuOpen}
          actions={[
            { label: 'Lihat', onPress: onSelect },
            { label: 'Rubah', onPress: onEdit },
            {
              disabled: true,
              label: 'Hapus',
              onPress: () => undefined,
              tone: 'danger',
            },
          ]}
        />
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function fitTeranuraListColumns(containerWidth: number): KolamTableColumn[] {
  return fitKolamDataTableColumns(
    getKolamTableColumns('teranura'),
    containerWidth,
    {
      actionsMinWidth: KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
      gap: KOLAM_DATA_TABLE_COLUMN_GAP,
      paddingX: getKolamTableVisualContract().body.cellPaddingX * 2,
      primaryMinWidth: 200,
      secondaryMinWidth: 64,
    },
  );
}

function TeranuraFilterOverlayPanel({
  activePanel,
  brandOptions,
  categoryOptions,
  onBrandChange,
  onCategoryChange,
  onClose,
  onQueryChange,
  onSellableChange,
  panelAnchor,
  query,
  selectedBrand,
  selectedCategory,
  selectedSellable,
  sellableOptions,
}: {
  activePanel: TeranuraFilterPanel;
  brandOptions: Array<{ label: string; value: string }>;
  categoryOptions: Array<{ label: string; value: string }>;
  onBrandChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onSellableChange: (value: KolamTeranuraSellableFilter) => void;
  panelAnchor: { left: number; top: number };
  query: string;
  selectedBrand: string;
  selectedCategory: string;
  selectedSellable: KolamTeranuraSellableFilter;
  sellableOptions: Array<{ label: string; value: KolamTeranuraSellableFilter }>;
}) {
  const options =
    activePanel === 'category'
      ? categoryOptions
      : activePanel === 'brand'
      ? brandOptions
      : sellableOptions;
  const normalizedQuery = normalizeTeranuraFilterQuery(query);
  const filteredOptions =
    normalizedQuery && activePanel !== 'sellable'
      ? options.filter(option =>
          normalizeTeranuraFilterQuery(option.label).includes(normalizedQuery),
        )
      : options;
  const selectedValue =
    activePanel === 'category'
      ? selectedCategory
      : activePanel === 'brand'
      ? selectedBrand
      : selectedSellable;

  return (
    <View
      style={[
        styles.filterOverlayPanel,
        {
          left: panelAnchor.left,
          top: panelAnchor.top,
          width: TERANURA_FILTER_PANEL_WIDTH,
        },
      ]}
    >
      {activePanel === 'sellable' ? null : (
        <KolamFormTextField
          onChangeText={onQueryChange}
          placeholder={
            activePanel === 'category' ? 'Cari kategori...' : 'Cari merek...'
          }
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
                key={`${activePanel}-${option.value}`}
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

                  onSellableChange(option.value as KolamTeranuraSellableFilter);
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

function getTeranuraFilterLabel(
  options: Array<{ label: string; value: string }>,
  value: string,
  fallback: string,
) {
  if (value === 'all') {
    return fallback;
  }

  return options.find(option => option.value === value)?.label ?? fallback;
}

function normalizeTeranuraFilterQuery(value: string) {
  return value.trim().toLowerCase();
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(
    value,
  );
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

const styles = StyleSheet.create({
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
  stack: {
    gap: 16,
    overflow: 'visible',
    position: 'relative',
  },
  toolbarWrap: {
    elevation: 1000,
    flexShrink: 0,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
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
  error: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  tableFrame: {
    flexGrow: 0,
    flexShrink: 0,
    overflow: 'visible',
    width: '100%',
  },
  emptyWrap: {
    minHeight: 240,
    justifyContent: 'center',
  },
  activeActionRow: {
    elevation: 96,
    overflow: 'visible',
    position: 'relative',
    zIndex: 1000,
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
  primaryCell: {
    flex: 1,
    minWidth: 0,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  photoBox: {
    width: 44,
    height: 44,
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: V.radius.md,
    backgroundColor: V.colors.secondary,
  },
  photo: {
    width: 44,
    height: 44,
  },
  primaryTextWrap: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  nameRow: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameText: {
    flexShrink: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
    textAlign: 'left',
  },
  metaText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
    textAlign: 'left',
  },
  cellText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'center',
    width: '100%',
  },
  brandCell: {
    minWidth: 0,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  centerBadge: {
    alignSelf: 'center',
  },
  actionsTrack: {
    alignItems: 'center',
  },
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  detailRoot: {
    width: '100%',
    gap: 16,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  headingCopy: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  detailEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyebrow: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 14,
  },
  detailTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 32,
  },
  description: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  detailHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  detailTabPanel: {
    minHeight: 220,
    padding: 16,
  },
});
