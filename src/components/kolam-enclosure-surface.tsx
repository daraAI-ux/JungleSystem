import React from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  KOLAM_ENCLOSURE_LIST_TABS,
  KOLAM_ENCLOSURE_TYPES,
  KOLAM_ENCLOSURE_ROOT,
  type KolamEnclosure,
  type KolamEnclosureLivestockFilter,
} from '../domain/kolam-enclosure';
import type {KolamTableColumn} from '../domain/kolam-table';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getKolamFileUrl} from '../lib/file-url';
import {
  useKolamEnclosureController,
  type KolamEnclosureController,
} from '../hooks/use-kolam-enclosure-controller';
import {KolamButton} from './kolam-button';
import {KolamCatalogListTableShell} from './kolam-catalog-list-table-shell';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamDataTableHeader} from './kolam-data-table-header';
import {KolamDataTableRowFrame} from './kolam-data-table-row-frame';
import {
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamFormTextField} from './kolam-form-text-field';
import {KolamRemoteImage} from './kolam-remote-image';
import {KolamStatusBadge} from './kolam-status-badge';
import {KolamTableFilterTrigger} from './kolam-table-filter-trigger';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';

type EnclosureFilterPanel = 'type' | 'livestock' | null;

const ENCLOSURE_TABLE_COLUMNS: KolamTableColumn[] = [
  {id: 'meta', label: '', align: 'left', width: 64},
  {id: 'children', label: 'Kode', align: 'left', width: 118},
  {id: 'primary', label: 'Nama', align: 'left'},
  {id: 'notes', label: 'Tipe', align: 'left', width: 132},
  {id: 'products', label: 'Livestock', align: 'left', width: 116},
  {id: 'marketplace', label: 'PIC', align: 'left', width: 150},
  {id: 'status', label: 'Status', align: 'left', width: 112},
  {id: 'actions', label: '', align: 'right', width: 64},
];

const LIVESTOCK_FILTER_OPTIONS: Array<{
  label: string;
  value: KolamEnclosureLivestockFilter;
}> = [
  {label: 'Semua livestock', value: 'all'},
  {label: 'Saleable', value: 'saleable'},
  {label: 'Production', value: 'production'},
];

export function KolamEnclosureSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamEnclosureController(route);

  return (
    <View style={styles.surface}>
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.errorBadge}
        />
      ) : null}
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}
      <KolamEnclosureList
        controller={controller}
        onRouteChange={onRouteChange}
      />
    </View>
  );
}

function KolamEnclosureList({
  controller,
  onRouteChange,
}: {
  controller: KolamEnclosureController;
  onRouteChange?: (route: string) => void;
}) {
  const [searchInput, setSearchInput] = React.useState(
    controller.filters.search,
  );
  const [activeFilterPanel, setActiveFilterPanel] =
    React.useState<EnclosureFilterPanel>(null);

  React.useEffect(() => {
    setSearchInput(controller.filters.search);
  }, [controller.filters.search]);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput !== controller.filters.search) {
        controller.onSearchChange(searchInput);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [controller, searchInput]);

  const listTabActive =
    controller.activeTab === 'internal' ||
    controller.activeTab === 'client_linked';
  const filtersAppliedCount = [
    controller.filters.search,
    controller.filters.enclosureType !== 'all'
      ? controller.filters.enclosureType
      : '',
    controller.filters.livestockPurpose !== 'all'
      ? controller.filters.livestockPurpose
      : '',
  ].filter(Boolean).length;
  const typeFilterLabel =
    controller.filters.enclosureType === 'all'
      ? 'Tipe'
      : controller.filters.enclosureType;
  const livestockFilterLabel =
    controller.filters.livestockPurpose === 'all'
      ? 'Livestock'
      : getLivestockPurposeLabel(controller.filters.livestockPurpose);

  return (
    <View style={styles.listRoot}>
      <View style={styles.toolbarWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {KOLAM_ENCLOSURE_LIST_TABS.map(tab => (
            <KolamButton
              key={tab.id}
              intent={controller.activeTab === tab.id ? 'primary' : 'outline'}
              label={tab.label}
              onPress={() => controller.onTabChange(tab.id)}
              style={styles.tabButton}
            />
          ))}
        </ScrollView>

        <View style={kolamTableToolbarStyles.row}>
          <KolamFormTextField
            onChangeText={setSearchInput}
            placeholder="Cari kode / nama enclosure"
            style={kolamTableToolbarStyles.searchInput}
            value={searchInput}
          />
          <View style={kolamTableToolbarStyles.controls}>
            <KolamTableFilterTrigger
              active={
                activeFilterPanel === 'type' ||
                controller.filters.enclosureType !== 'all'
              }
              label={typeFilterLabel}
              onPress={() =>
                setActiveFilterPanel(current =>
                  current === 'type' ? null : 'type',
                )
              }
            />
            <KolamTableFilterTrigger
              active={
                activeFilterPanel === 'livestock' ||
                controller.filters.livestockPurpose !== 'all'
              }
              label={livestockFilterLabel}
              onPress={() =>
                setActiveFilterPanel(current =>
                  current === 'livestock' ? null : 'livestock',
                )
              }
            />
            {filtersAppliedCount > 0 ? (
              <KolamButton
                label="Reset"
                muted={!listTabActive}
                onPress={() => {
                  setSearchInput('');
                  setActiveFilterPanel(null);
                  controller.onClearFilters();
                }}
              />
            ) : null}
            <KolamButton
              disabled={controller.loading}
              label="Refresh"
              onPress={() => void controller.onRefresh()}
            />
          </View>
        </View>

        {activeFilterPanel === 'type' ? (
          <View style={[styles.filterOverlayPanel, styles.filterPanelType]}>
            <ScrollView
              contentContainerStyle={styles.filterPanelContent}
              keyboardShouldPersistTaps="handled"
              style={styles.filterPanelScroll}
            >
              <KolamButton
                intent={
                  controller.filters.enclosureType === 'all'
                    ? 'primary'
                    : 'plain'
                }
                label="Semua tipe"
                onPress={() => {
                  controller.onChangeFilters({enclosureType: 'all'});
                  setActiveFilterPanel(null);
                }}
                style={styles.filterPanelOption}
              />
              {KOLAM_ENCLOSURE_TYPES.map(type => (
                <KolamButton
                  intent={
                    controller.filters.enclosureType === type
                      ? 'primary'
                      : 'plain'
                  }
                  key={type}
                  label={type}
                  onPress={() => {
                    controller.onChangeFilters({enclosureType: type});
                    setActiveFilterPanel(null);
                  }}
                  style={styles.filterPanelOption}
                />
              ))}
            </ScrollView>
            <View style={styles.filterPanelFooter}>
              <KolamButton
                label="Tutup"
                onPress={() => setActiveFilterPanel(null)}
              />
            </View>
          </View>
        ) : null}

        {activeFilterPanel === 'livestock' ? (
          <View style={[styles.filterOverlayPanel, styles.filterPanelLivestock]}>
            <ScrollView
              contentContainerStyle={styles.filterPanelContent}
              keyboardShouldPersistTaps="handled"
              style={styles.filterPanelScroll}
            >
              {LIVESTOCK_FILTER_OPTIONS.map(option => (
                <KolamButton
                  intent={
                    controller.filters.livestockPurpose === option.value
                      ? 'primary'
                      : 'plain'
                  }
                  key={option.value}
                  label={option.label}
                  onPress={() => {
                    controller.onChangeFilters({
                      livestockPurpose: option.value,
                    });
                    setActiveFilterPanel(null);
                  }}
                  style={styles.filterPanelOption}
                />
              ))}
            </ScrollView>
            <View style={styles.filterPanelFooter}>
              <KolamButton
                label="Tutup"
                onPress={() => setActiveFilterPanel(null)}
              />
            </View>
          </View>
        ) : null}
      </View>

      {listTabActive ? (
        <KolamEnclosureTable
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : controller.activeTab === 'dashboard' ? (
        <KolamEnclosureDashboardPanel controller={controller} />
      ) : controller.activeTab === 'pending' ? (
        <KolamEnclosurePendingPanel controller={controller} />
      ) : (
        <KolamEnclosureAllocationPanel controller={controller} />
      )}
    </View>
  );
}

function KolamEnclosureTable({
  controller,
  onRouteChange,
}: {
  controller: KolamEnclosureController;
  onRouteChange?: (route: string) => void;
}) {
  const pageCount = Math.max(1, controller.pagination.totalPages);
  const safePage = Math.min(Math.max(controller.pagination.page, 1), pageCount);
  const renderRow = React.useCallback(
    ({item}: {item: KolamEnclosure}) => (
      <KolamEnclosureRow
        enclosure={item}
        onSelect={() => onRouteChange?.(`${KOLAM_ENCLOSURE_ROOT}/${item.id}`)}
      />
    ),
    [onRouteChange],
  );

  return (
    <KolamCatalogListTableShell
      footer={
        <KolamTableFooterControls
          onPageSizeChange={controller.onLimitChange}
          page={safePage}
          pageSize={controller.pagination.limit}
          total={controller.pagination.total}
        >
          {pageCount > 1 ? (
            <View style={styles.paginationRow}>
              <KolamButton
                disabled={safePage <= 1}
                label="Sebelumnya"
                onPress={() =>
                  controller.onPageChange(Math.max(1, safePage - 1))
                }
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
                  controller.onPageChange(Math.min(pageCount, safePage + 1))
                }
              />
            </View>
          ) : null}
        </KolamTableFooterControls>
      }
      style={styles.tableFrame}
    >
      <FlatList
        contentContainerStyle={styles.listContent}
        data={controller.enclosures}
        keyExtractor={item => item.id || item.code}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              compact
              message={getListEmptyMessage(controller)}
              title={
                controller.loading
                  ? 'Memuat enclosure...'
                  : controller.error
                    ? 'Gagal memuat enclosure'
                    : 'Belum ada enclosure'
              }
            />
          </View>
        }
        ListHeaderComponent={
          <KolamDataTableHeader columns={ENCLOSURE_TABLE_COLUMNS} />
        }
        renderItem={renderRow}
        style={styles.listFlatList}
      />
    </KolamCatalogListTableShell>
  );
}

function KolamEnclosureRow({
  enclosure,
  onSelect,
}: {
  enclosure: KolamEnclosure;
  onSelect: () => void;
}) {
  const imageUri = getKolamFileUrl(enclosure.coverPhotoUrl);
  const sizeText = formatEnclosureSize(enclosure);

  return (
    <KolamDataTableRowFrame>
      <View style={styles.photoCell}>
        {imageUri ? (
          <KolamRemoteImage
            accessibilityLabel={`Foto ${enclosure.name || enclosure.code}`}
            resizeMode="cover"
            scope="enclosure-list"
            sourceUri={imageUri}
            style={styles.photo}
          />
        ) : (
          <Text style={styles.mutedText}>-</Text>
        )}
      </View>
      <View style={[styles.cell, {width: widthOf('children')}]}>
        <Text numberOfLines={1} style={styles.cellTextStrong}>
          {enclosure.code || '-'}
        </Text>
      </View>
      <Pressable onPress={onSelect} style={[styles.cell, styles.primaryCell]}>
        <Text numberOfLines={1} style={styles.rowTitle}>
          {enclosure.name || enclosure.code || '-'}
        </Text>
        <Text numberOfLines={1} style={styles.rowMeta}>
          {[
            enclosure.location?.name,
            sizeText,
          ]
            .filter(Boolean)
            .join(' / ') || '-'}
        </Text>
      </Pressable>
      <View style={[styles.cell, {width: widthOf('notes')}]}>
        <Text numberOfLines={1} style={styles.cellText}>
          {enclosure.type || '-'}
        </Text>
        {enclosure.aquariumWaterType ? (
          <Text numberOfLines={1} style={styles.rowMeta}>
            {getAquariumWaterLabel(enclosure.aquariumWaterType)}
          </Text>
        ) : null}
      </View>
      <View style={[styles.cell, {width: widthOf('products')}]}>
        <Text numberOfLines={1} style={styles.cellText}>
          {getLivestockPurposeLabel(enclosure.livestockPurpose)}
        </Text>
      </View>
      <View style={[styles.cell, {width: widthOf('marketplace')}]}>
        <Text numberOfLines={2} style={styles.cellText}>
          {enclosure.assignedTo?.displayName || '-'}
        </Text>
      </View>
      <View style={[styles.cell, styles.statusCell, {width: widthOf('status')}]}>
        <KolamStatusBadge
          intent={getEnclosureStatusIntent(enclosure.status)}
          label={enclosure.status || 'active'}
        />
        {enclosure.customer ? (
          <KolamStatusBadge
            intent="success"
            label="Customer"
            textStyle={styles.badgeTextSm}
          />
        ) : null}
      </View>
      <View style={[styles.actionCell, {width: widthOf('actions')}]}>
        <KolamButton label="Lihat" onPress={onSelect} />
      </View>
    </KolamDataTableRowFrame>
  );
}

function KolamEnclosureDashboardPanel({
  controller,
}: {
  controller: KolamEnclosureController;
}) {
  if (controller.loading && controller.dataSource === 'idle') {
    return <InlineState title="Memuat dashboard..." />;
  }
  if (controller.error) {
    return <InlineState title="Gagal memuat dashboard" message={controller.error} />;
  }

  const stats = controller.dashboardStats;
  return (
    <View style={styles.summaryGrid}>
      <SummaryTile label="Enclosure" value={stats.totals.enclosures} />
      <SummaryTile label="Species" value={stats.totals.speciesDistinct} />
      <SummaryTile label="Individu" value={stats.totals.individuals} />
      <SummaryTile label="Births" value={stats.births.totalAnimals} />
    </View>
  );
}

function KolamEnclosurePendingPanel({
  controller,
}: {
  controller: KolamEnclosureController;
}) {
  if (controller.loading && !controller.pendingAllocations.length) {
    return <InlineState title="Memuat pending allocation..." />;
  }
  if (controller.error) {
    return <InlineState title="Gagal memuat pending" message={controller.error} />;
  }
  if (!controller.pendingAllocations.length) {
    return (
      <InlineState
        title="Tidak ada pending allocation"
        message="Semua livestock saleable sudah dialokasikan."
      />
    );
  }

  return (
    <View style={styles.panelList}>
      {controller.pendingAllocations.map(item => (
        <View key={item.id} style={styles.panelRow}>
          <KolamCopyStack
            containerStyle={styles.panelRowCopy}
            items={[
              {id: 'title', text: item.displayLine || item.speciesName, style: styles.rowTitle},
              {
                id: 'meta',
                text: [item.invoiceCode, item.variantLabel].filter(Boolean).join(' / '),
                style: styles.rowMeta,
              },
            ]}
          />
          <Text style={styles.qtyText}>{item.qtyRemaining}</Text>
        </View>
      ))}
    </View>
  );
}

function KolamEnclosureAllocationPanel({
  controller,
}: {
  controller: KolamEnclosureController;
}) {
  if (controller.loading && !controller.allocationOverview.items.length) {
    return <InlineState title="Memuat statistik allocation..." />;
  }
  if (controller.error) {
    return <InlineState title="Gagal memuat statistik" message={controller.error} />;
  }
  if (!controller.allocationSpeciesGroups.length) {
    return (
      <InlineState
        title="Belum ada statistik"
        message="Belum ada livestock yang terhubung ke enclosure."
      />
    );
  }

  return (
    <View style={styles.panelList}>
      {controller.allocationSpeciesGroups.map(group => (
        <View key={group.speciesId} style={styles.panelRow}>
          <KolamCopyStack
            containerStyle={styles.panelRowCopy}
            items={[
              {id: 'title', text: group.speciesName || group.speciesId, style: styles.rowTitle},
              {
                id: 'meta',
                text: group.scientificName || `${group.rows.length} varian`,
                style: styles.rowMeta,
              },
            ]}
          />
          <Text style={styles.qtyText}>
            {group.totalAllocated}/{group.totalStock}
          </Text>
        </View>
      ))}
    </View>
  );
}

function InlineState({message, title}: {message?: string; title: string}) {
  return (
    <View style={styles.emptyWrap}>
      <KolamEmptyState compact message={message ?? ''} title={title} />
    </View>
  );
}

function SummaryTile({label, value}: {label: string; value: number}) {
  return (
    <View style={styles.summaryTile}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function getListEmptyMessage(controller: KolamEnclosureController) {
  if (controller.error) {
    return controller.error;
  }
  if (controller.loading) {
    return 'Data enclosure sedang dimuat dari Kolam.';
  }
  if (controller.filters.search.trim()) {
    return `Tidak ada enclosure untuk "${controller.filters.search.trim()}".`;
  }
  return 'Coba ubah tab, pencarian, atau filter.';
}

function widthOf(id: KolamTableColumn['id']) {
  return ENCLOSURE_TABLE_COLUMNS.find(column => column.id === id)?.width;
}

function getLivestockPurposeLabel(value: KolamEnclosureLivestockFilter | string) {
  if (value === 'production') {
    return 'Production';
  }
  if (value === 'saleable') {
    return 'Saleable';
  }
  return 'Semua livestock';
}

function getAquariumWaterLabel(value: string) {
  if (value === 'freshwater') {
    return 'Air tawar';
  }
  if (value === 'marine') {
    return 'Air laut';
  }
  return value;
}

function getEnclosureStatusIntent(
  status: string,
): 'primary' | 'success' | 'warning' | 'danger' | 'muted' {
  switch (status) {
    case 'active':
      return 'success';
    case 'maintenance':
      return 'warning';
    case 'inactive':
    case 'deleted':
      return 'danger';
    default:
      return 'muted';
  }
}

function formatEnclosureSize(enclosure: KolamEnclosure) {
  const {high, length, width} = enclosure.size;
  const unit = length.unitLabel || width.unitLabel || high.unitLabel;
  const values = [length.value, width.value, high.value].filter(
    value => value > 0,
  );
  return values.length === 3 ? `${values.join(' x ')} ${unit}` : '';
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 12,
    minHeight: 0,
    overflow: 'visible',
  },
  errorBadge: {
    alignSelf: 'stretch',
  },
  listRoot: {
    flex: 1,
    gap: 12,
    minHeight: 0,
    overflow: 'visible',
  },
  toolbarWrap: {
    elevation: 1000,
    gap: 10,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
  },
  tabRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 2,
  },
  tabButton: {
    flexShrink: 0,
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
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 16,
    top: 88,
    width: 232,
    zIndex: 120000,
  },
  filterPanelType: {
    right: 124,
  },
  filterPanelLivestock: {
    right: 8,
  },
  filterPanelScroll: {
    maxHeight: 280,
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
  tableFrame: {
    minHeight: 0,
    overflow: 'visible',
  },
  listFlatList: {
    flexGrow: 0,
    overflow: 'visible',
  },
  listContent: {
    flexGrow: 0,
    overflow: 'visible',
  },
  emptyWrap: {
    padding: 16,
  },
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
  },
  photoCell: {
    alignItems: 'center',
    justifyContent: 'center',
    width: widthOf('meta'),
  },
  photo: {
    borderRadius: 6,
    height: 40,
    width: 40,
  },
  cell: {
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  primaryCell: {
    flex: 1,
    minWidth: 0,
  },
  statusCell: {
    alignItems: 'flex-start',
    gap: 4,
  },
  actionCell: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  rowTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '800',
  },
  rowMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  cellText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  cellTextStrong: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  mutedText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  badgeTextSm: {
    fontSize: 10,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryTile: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 148,
    padding: 14,
  },
  summaryValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 24,
    fontWeight: '800',
  },
  summaryLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  panelList: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
  },
  panelRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  panelRowCopy: {
    flex: 1,
    minWidth: 0,
  },
  qtyText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
});
