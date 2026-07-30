import React from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { type KolamTableColumn, getKolamTableColumns } from '../domain/kolam-table';
import { type KolamTeranura } from '../domain/kolam-teranura';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  type KolamTeranuraSellableFilter,
  useKolamTeranuraController,
} from '../hooks/use-kolam-teranura-controller';
import { formatRupiah } from '../lib/money';
import { KolamBadge } from './kolam-badge';
import { KolamButton } from './kolam-button';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamControlTabList } from './kolam-control-tab-list';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDataTableHeader } from './kolam-data-table-header';
import { KolamDataTableRowFrame } from './kolam-data-table-row-frame';
import {
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamTableFilterTrigger } from './kolam-table-filter-trigger';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

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
  const [activeFilterPanel, setActiveFilterPanel] =
    React.useState<TeranuraFilterPanel | null>(null);
  const [filterPanelQuery, setFilterPanelQuery] = React.useState('');
  const [panelAnchor, setPanelAnchor] = React.useState({ left: 0, top: 48 });
  const toolbarRef = React.useRef<View>(null);
  const categoryTriggerRef = React.useRef<View>(null);
  const brandTriggerRef = React.useRef<View>(null);
  const sellableTriggerRef = React.useRef<View>(null);
  const columns = React.useMemo(() => getKolamTableColumns('teranura'), []);
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
  const anchorFilterPanel = React.useCallback((panel: TeranuraFilterPanel) => {
    const triggerRef =
      panel === 'category'
        ? categoryTriggerRef
        : panel === 'brand'
        ? brandTriggerRef
        : sellableTriggerRef;
    const toolbar = toolbarRef.current;
    const trigger = triggerRef.current;
    if (!toolbar || !trigger) {
      return;
    }

    toolbar.measureInWindow((toolbarX, toolbarY, toolbarWidth) => {
      trigger.measureInWindow((x, y, _width, height) => {
        const maxLeft = Math.max(0, toolbarWidth - TERANURA_FILTER_PANEL_WIDTH);
        const preferredLeft = x - toolbarX;
        setPanelAnchor({
          left: Math.min(Math.max(0, preferredLeft), maxLeft),
          top: y - toolbarY + height + 4,
        });
      });
    });
  }, []);
  const openFilterPanel = React.useCallback(
    (panel: TeranuraFilterPanel) => {
      setActiveFilterPanel(current => {
        const next = current === panel ? null : panel;
        if (next) {
          requestAnimationFrame(() => anchorFilterPanel(next));
        }
        return next;
      });
      setFilterPanelQuery('');
    },
    [anchorFilterPanel],
  );
  const closeFilterPanel = () => {
    setActiveFilterPanel(null);
    setFilterPanelQuery('');
  };
  React.useEffect(() => {
    if (!activeFilterPanel) {
      return;
    }

    requestAnimationFrame(() => anchorFilterPanel(activeFilterPanel));
  }, [activeFilterPanel, anchorFilterPanel]);

  if (controller.mode === 'detail') {
    return (
      <TeranuraDetailShell
        item={controller.selectedItem}
        loading={controller.loading}
        onBack={() => onRouteChange?.('/teranura')}
        onEdit={item => onRouteChange?.(`/teranura/${item.id}/edit`)}
      />
    );
  }

  return (
    <View style={styles.surface}>
      <View style={styles.stack}>
        <View ref={toolbarRef} style={styles.toolbarWrap}>
          <View style={kolamTableToolbarStyles.row}>
            <KolamFormTextField
              mode="search"
              onChangeText={controller.onSearchChange}
              placeholder="Cari Teranura..."
              style={kolamTableToolbarStyles.searchInput}
              value={controller.filters.search}
            />
            <View style={kolamTableToolbarStyles.controls}>
              <View ref={categoryTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={activeFilterPanel === 'category' || selectedCategory !== 'all'}
                  label={categoryFilterLabel}
                  onPress={() => openFilterPanel('category')}
                />
              </View>
              <View ref={brandTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={activeFilterPanel === 'brand' || selectedBrand !== 'all'}
                  label={brandFilterLabel}
                  onPress={() => openFilterPanel('brand')}
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
                />
              </View>
              {hasActiveFilters ? (
                <KolamButton
                  label="Reset"
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
              <KolamButton
                disabled={controller.loading}
                label="Muat Ulang"
                onPress={() => {
                  void controller.onRefresh();
                }}
              />
              <KolamButton
                intent="primary"
                label="Baru"
                onPress={() => onRouteChange?.('/teranura/create')}
              />
            </View>
          </View>
          {activeFilterPanel ? (
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

        {controller.error ? <Text style={styles.error}>{controller.error}</Text> : null}

        <KolamCatalogListTableShell
          footer={
            <KolamTableFooterControls
              onPageSizeChange={controller.onLimitChange}
              page={safePage}
              pageSize={controller.pagination.limit}
              total={controller.pagination.total}
            >
              {pageCount > 1 ? (
                <View style={styles.paginationBar}>
                  <KolamButton
                    disabled={safePage <= 1}
                    label="Sebelumnya"
                    onPress={() => controller.onPageChange(safePage - 1)}
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
                    onPress={() => controller.onPageChange(safePage + 1)}
                  />
                </View>
              ) : null}
            </KolamTableFooterControls>
          }
          style={styles.tableFrame}
        >
          <FlatList
            data={controller.items}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <KolamEmptyState
                  compact
                  message="Data Teranura belum tersedia dari backend."
                  title={
                    controller.loading
                      ? 'Memuat Teranura...'
                      : 'Belum ada Teranura'
                  }
                />
              </View>
            }
            ListHeaderComponent={<KolamDataTableHeader columns={columns} />}
            renderItem={({ item }) => (
              <TeranuraRow
                columns={columns}
                item={item}
                onEdit={() => onRouteChange?.(`/teranura/${item.id}/edit`)}
                onSelect={() => onRouteChange?.(`/teranura/${item.id}`)}
              />
            )}
            removeClippedSubviews={false}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />
        </KolamCatalogListTableShell>
      </View>
    </View>
  );
}

function TeranuraDetailShell({
  item,
  loading,
  onBack,
  onEdit,
}: {
  item: KolamTeranura | null;
  loading: boolean;
  onBack: () => void;
  onEdit: (item: KolamTeranura) => void;
}) {
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
              {loading ? 'Memuat detail Teranura...' : 'Detail Teranura tidak ditemukan.'}
            </Text>
          </View>
          <KolamButton label="Daftar" onPress={onBack} />
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
            Dibuat {formatDateTime(item.createdAt)} | Diperbarui {formatDateTime(item.updatedAt)}
          </Text>
        </View>
        <View style={styles.detailHeaderActions}>
          <KolamButton label="Daftar" onPress={onBack} />
          <KolamButton intent="primary" label="Rubah" onPress={() => onEdit(item)} />
          <KolamButton disabled intent="danger" label="Hapus" onPress={() => undefined} />
        </View>
      </View>
      {tabPanel}
    </View>
  );
}

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
  const variantLabel = item.variants.length ? 'Produk varian' : 'Produk standar';
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);

  return (
    <KolamDataTableRowFrame style={actionMenuOpen && styles.activeActionRow}>
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
            <Text numberOfLines={2} style={styles.nameText}>{item.name}</Text>
            {item.deviceLine === 'freyer' ? (
              <KolamBadge intent="info" label="Freyer" />
            ) : null}
          </View>
          <Text numberOfLines={1} style={styles.metaText}>
            {item.category?.name ?? 'Tanpa kategori'}
          </Text>
        </View>
      </View>
      <Text numberOfLines={1} selectable style={[styles.cellText, getCellWidth(columns, 'meta')]}>
        {code}
      </Text>
      <View style={[styles.brandCell, getCellWidth(columns, 'price')]}>
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
      <Text numberOfLines={1} style={[styles.cellText, getCellWidth(columns, 'children')]}>
        {variantLabel}
      </Text>
      <Text numberOfLines={1} style={[styles.amountText, getCellWidth(columns, 'amount')]}>
        {item.priceToSell > 0 ? formatRupiah(item.priceToSell) : '-'}
      </Text>
      <Text numberOfLines={1} style={[styles.amountText, getCellWidth(columns, 'products')]}>
        {formatNumber(item.stock)}{item.unitLabel ? ` ${item.unitLabel}` : ''}
      </Text>
      <View style={[styles.statusCell, getCellWidth(columns, 'status')]}>
        <KolamBadge
          intent={item.sellable ? 'success' : 'secondary'}
          label={item.sellable ? 'Dapat dijual' : 'Tidak dijual'}
        />
      </View>
      <View
        collapsable={false}
        style={[styles.actionsCell, getCellWidth(columns, 'actions')]}
      >
        <KolamOverflowMenuButton
          accessibilityLabel={`Menu ${item.name}`}
          onOpenChange={setActionMenuOpen}
          actions={[
            { label: 'Lihat', onPress: onSelect },
            { label: 'Rubah', onPress: onEdit },
            { disabled: true, label: 'Hapus', onPress: () => undefined, tone: 'danger' },
          ]}
        />
      </View>
    </KolamDataTableRowFrame>
  );
}

function getCellWidth(columns: KolamTableColumn[], id: KolamTableColumn['id']) {
  const width = columns.find(column => column.id === id)?.width;
  return width ? { width } : null;
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
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value);
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
    flex: 1,
    minHeight: 0,
    overflow: 'visible',
  },
  stack: {
    flex: 1,
    minHeight: 0,
    gap: 16,
    overflow: 'visible',
  },
  toolbarWrap: {
    elevation: 1000,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
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
    minHeight: 0,
    overflow: 'visible',
  },
  list: {
    flexGrow: 0,
    overflow: 'visible',
  },
  listContent: {
    flexGrow: 0,
    overflow: 'visible',
  },
  emptyWrap: {
    minHeight: 240,
    justifyContent: 'center',
  },
  primaryCell: {
    flex: 1,
    minWidth: 0,
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
  },
  metaText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  cellText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  amountText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textAlign: 'right',
  },
  brandCell: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  statusCell: {
    alignItems: 'flex-end',
  },
  activeActionRow: {
    elevation: 96,
    overflow: 'visible',
    position: 'relative',
    zIndex: 1000,
  },
  actionsCell: {
    alignItems: 'flex-end',
    elevation: 30,
    overflow: 'visible',
    position: 'relative',
    zIndex: 1100,
  },
  footerWrap: {
    paddingBottom: 8,
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
