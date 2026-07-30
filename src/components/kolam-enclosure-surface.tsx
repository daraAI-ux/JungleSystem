import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import {
  KOLAM_ENCLOSURE_LIST_TABS,
  KOLAM_ENCLOSURE_TYPES,
  KOLAM_ENCLOSURE_ROOT,
  type KolamEnclosure,
  type KolamEnclosureAllocationOverviewRow,
  type KolamEnclosureDashboardDeathEvent,
  type KolamEnclosureDashboardSpeciesRow,
  type KolamEnclosureLivestockFilter,
} from '../domain/kolam-enclosure';
import {
  fitKolamDataTableColumns,
  getKolamTableColumns,
  getKolamTableVisualContract,
  type KolamTableColumn,
} from '../domain/kolam-table';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getKolamFileUrl} from '../lib/file-url';
import {
  useKolamEnclosureController,
  type KolamEnclosureController,
} from '../hooks/use-kolam-enclosure-controller';
import {KolamButton} from './kolam-button';
import {KolamCatalogListTableShell} from './kolam-catalog-list-table-shell';
import {KolamCopyStack} from './kolam-copy-stack';
import {
  getKolamDataTableColumnStyle,
  KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  KOLAM_DATA_TABLE_COLUMN_GAP,
} from './kolam-data-table-column-style';
import {KolamDataTableHeader} from './kolam-data-table-header';
import {KolamDataTableRowFrame} from './kolam-data-table-row-frame';
import {
  KolamDataTableActionsTrack,
  KolamDataTableMainTrack,
} from './kolam-data-table-tracks';
import {
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamHoverTooltip} from './kolam-hover-tooltip';
import {KolamProfileAvatarContent} from './kolam-profile-avatar-content';
import {KolamRemoteImage} from './kolam-remote-image';
import {KolamSearchField} from './kolam-search-field';
import {KolamStatusBadge} from './kolam-status-badge';
import {KolamTableFilterTrigger} from './kolam-table-filter-trigger';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';

type EnclosureFilterPanel = 'type' | 'livestock' | null;

const ENCLOSURE_FILTER_PANEL_WIDTH = 232;
const DASHBOARD_SPECIES_PAGE_SIZE = 12;
const DASHBOARD_DEATH_PAGE_SIZE = 10;

const DASHBOARD_SPECIES_COLUMNS: KolamTableColumn[] = [
  {id: 'meta', label: '', align: 'left', width: 56},
  {id: 'primary', label: 'Species', align: 'left'},
  {id: 'notes', label: 'Varian', align: 'left', width: 180},
  {id: 'children', label: 'Qty', align: 'right', width: 112},
  {id: 'amount', label: 'Enclosure', align: 'right', width: 112},
];

const DASHBOARD_DEATH_COLUMNS: KolamTableColumn[] = [
  {id: 'meta', label: 'Waktu', align: 'left', width: 142},
  {id: 'children', label: 'Enclosure', align: 'left', width: 120},
  {id: 'primary', label: 'Species', align: 'left'},
  {id: 'amount', label: 'Qty', align: 'right', width: 80},
  {id: 'status', label: 'Status', align: 'left', width: 132},
  {id: 'actions', label: 'Stok', align: 'right', width: 80},
];

const ALLOCATION_OVERVIEW_COLUMNS: KolamTableColumn[] = [
  {id: 'primary', label: 'Species', align: 'left'},
  {id: 'notes', label: 'Varian', align: 'left', width: 132},
  {id: 'children', label: 'Sudah di enclosure', align: 'right', width: 148},
  {id: 'amount', label: 'Belum di enclosure', align: 'right', width: 148},
  {id: 'marketplace', label: 'Kode enclosure', align: 'left', width: 220},
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
  const [panelAnchor, setPanelAnchor] = React.useState({left: 0, top: 48});
  const toolbarRef = React.useRef<View>(null);
  const typeTriggerRef = React.useRef<View>(null);
  const livestockTriggerRef = React.useRef<View>(null);

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

  const anchorFilterPanel = React.useCallback((panel: EnclosureFilterPanel) => {
    if (!panel) {
      return;
    }
    const triggerRef =
      panel === 'type' ? typeTriggerRef : livestockTriggerRef;
    const toolbar = toolbarRef.current;
    const trigger = triggerRef.current;
    if (!toolbar || !trigger) {
      return;
    }
    toolbar.measureInWindow((toolbarX, toolbarY, toolbarWidth) => {
      trigger.measureInWindow((x, y, _width, height) => {
        const maxLeft = Math.max(
          0,
          toolbarWidth - ENCLOSURE_FILTER_PANEL_WIDTH,
        );
        const preferredLeft = x - toolbarX;
        setPanelAnchor({
          left: Math.min(Math.max(0, preferredLeft), maxLeft),
          top: y - toolbarY + height + 4,
        });
      });
    });
  }, []);

  const toggleFilterPanel = React.useCallback(
    (panel: Exclude<EnclosureFilterPanel, null>) => {
      setActiveFilterPanel(current => {
        const next = current === panel ? null : panel;
        if (next) {
          requestAnimationFrame(() => anchorFilterPanel(next));
        }
        return next;
      });
    },
    [anchorFilterPanel],
  );

  React.useEffect(() => {
    if (!activeFilterPanel) {
      return;
    }
    requestAnimationFrame(() => anchorFilterPanel(activeFilterPanel));
  }, [activeFilterPanel, anchorFilterPanel]);

  return (
    <View style={styles.listRoot}>
      <View ref={toolbarRef} collapsable={false} style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              {KOLAM_ENCLOSURE_LIST_TABS.map(tab => (
                <KolamButton
                  intent={controller.activeTab === tab.id ? 'primary' : 'outline'}
                  key={tab.id}
                  label={tab.label}
                  onPress={() => controller.onTabChange(tab.id)}
                  style={styles.toolbarButton}
                />
              ))}
              <KolamSearchField
                containerStyle={kolamTableToolbarStyles.searchInput}
                onChangeText={setSearchInput}
                placeholder="Cari kode / nama enclosure"
                value={searchInput}
              />
              <View ref={typeTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'type' ||
                    controller.filters.enclosureType !== 'all'
                  }
                  label={typeFilterLabel}
                  onPress={() => toggleFilterPanel('type')}
                  open={activeFilterPanel === 'type'}
                  variant="quiet"
                />
              </View>
              <View ref={livestockTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'livestock' ||
                    controller.filters.livestockPurpose !== 'all'
                  }
                  label={livestockFilterLabel}
                  onPress={() => toggleFilterPanel('livestock')}
                  open={activeFilterPanel === 'livestock'}
                  variant="quiet"
                />
              </View>
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              {filtersAppliedCount > 0 ? (
                <KolamButton
                  label="Reset"
                  muted={!listTabActive}
                  onPress={() => {
                    setSearchInput('');
                    setActiveFilterPanel(null);
                    controller.onClearFilters();
                  }}
                  style={styles.toolbarButton}
                />
              ) : null}
              <KolamButton
                disabled={controller.loading}
                label="Refresh"
                onPress={() => void controller.onRefresh()}
                style={styles.toolbarButton}
              />
            </View>
          </View>
        </View>

        {activeFilterPanel === 'type' ? (
          <View
            style={[
              styles.filterOverlayPanel,
              {
                left: panelAnchor.left,
                top: panelAnchor.top,
              },
            ]}
          >
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
          <View
            style={[
              styles.filterOverlayPanel,
              {
                left: panelAnchor.left,
                top: panelAnchor.top,
              },
            ]}
          >
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
        <KolamEnclosureDashboardPanel
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : controller.activeTab === 'pending' ? (
        <KolamEnclosurePendingPanel controller={controller} />
      ) : (
        <KolamEnclosureAllocationPanel
          controller={controller}
          onRouteChange={onRouteChange}
        />
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
  const [tableBodyWidth, setTableBodyWidth] = React.useState(0);
  const listColumns = React.useMemo(
    () => fitEnclosureListColumns(tableBodyWidth),
    [tableBodyWidth],
  );
  const pageCount = Math.max(1, controller.pagination.totalPages);
  const safePage = Math.min(Math.max(controller.pagination.page, 1), pageCount);

  return (
    <KolamCatalogListTableShell
      footer={
        <KolamTableFooterControls
          onPageSizeChange={controller.onLimitChange}
          page={safePage}
          pageSize={controller.filters.limit}
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
      onBodyWidthChange={setTableBodyWidth}
      style={styles.tableFrame}
    >
      <KolamDataTableHeader columns={listColumns} />
      {controller.enclosures.length ? (
        controller.enclosures.map(item => (
          <KolamEnclosureRow
            columns={listColumns}
            enclosure={item}
            key={item.id || item.code}
            onSelect={() =>
              onRouteChange?.(`${KOLAM_ENCLOSURE_ROOT}/${item.id}`)
            }
          />
        ))
      ) : (
        <View style={styles.emptyWrap}>
          <KolamEmptyState
            compact
            message={getListEmptyMessage(controller)}
            title={
              controller.loading
                ? 'Memuat enclosure…'
                : controller.error
                  ? 'Gagal memuat enclosure'
                  : 'Belum ada enclosure'
            }
          />
        </View>
      )}
    </KolamCatalogListTableShell>
  );
}

function KolamEnclosureRow({
  columns,
  enclosure,
  onSelect,
}: {
  columns: ReturnType<typeof getKolamTableColumns>;
  enclosure: KolamEnclosure;
  onSelect: () => void;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const imageUri = getKolamFileUrl(enclosure.coverPhotoUrl);
  const sizeText = formatEnclosureSize(enclosure);
  const columnOf = React.useCallback(
    (id: (typeof columns)[number]['id']) =>
      columns.find(column => column.id === id),
    [columns],
  );
  const photoColumn = columnOf('meta');
  const codeColumn = columnOf('children');
  const primaryColumn = columnOf('primary');
  const typeColumn = columnOf('notes');
  const livestockColumn = columnOf('products');
  const picColumn = columnOf('marketplace');
  const statusColumn = columnOf('status');
  const actionsColumn = columnOf('actions');

  return (
    <KolamDataTableRowFrame
      style={actionMenuOpen ? styles.activeActionRow : undefined}
    >
      <KolamDataTableMainTrack style={styles.mainTrackVisible}>
        <View
          style={[
            styles.listCell,
            styles.photoCell,
            photoColumn ? getKolamDataTableColumnStyle(photoColumn) : null,
          ]}
        >
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

        <View
          style={[
            styles.listCell,
            codeColumn ? getKolamDataTableColumnStyle(codeColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.cellTextStrong}>
            {enclosure.code || '-'}
          </Text>
        </View>

        <Pressable
          onPress={onSelect}
          style={[
            styles.listCell,
            styles.identityCell,
            primaryColumn ? getKolamDataTableColumnStyle(primaryColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.rowTitle}>
            {enclosure.name || enclosure.code || '-'}
          </Text>
          <Text numberOfLines={1} style={styles.rowMeta}>
            {[enclosure.location?.name, sizeText].filter(Boolean).join(' / ') ||
              '-'}
          </Text>
        </Pressable>

        <View
          style={[
            styles.listCell,
            styles.centerCell,
            typeColumn ? getKolamDataTableColumnStyle(typeColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={[styles.cellText, styles.centerText]}>
            {enclosure.type || '-'}
          </Text>
          {enclosure.aquariumWaterType ? (
            <Text numberOfLines={1} style={[styles.rowMeta, styles.centerText]}>
              {getAquariumWaterLabel(enclosure.aquariumWaterType)}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.listCell,
            styles.centerCell,
            livestockColumn
              ? getKolamDataTableColumnStyle(livestockColumn)
              : null,
          ]}
        >
          <Text numberOfLines={1} style={[styles.cellText, styles.centerText]}>
            {getLivestockPurposeLabel(enclosure.livestockPurpose)}
          </Text>
        </View>

        <View
          style={[
            styles.listCell,
            styles.picCell,
            picColumn ? getKolamDataTableColumnStyle(picColumn) : null,
            styles.overflowVisible,
          ]}
        >
          <KolamEnclosurePicAvatar enclosure={enclosure} />
        </View>

        <View
          style={[
            styles.listCell,
            styles.statusCell,
            statusColumn ? getKolamDataTableColumnStyle(statusColumn) : null,
          ]}
        >
          <KolamStatusBadge
            intent={getEnclosureStatusIntent(enclosure.status)}
            label={enclosure.status || 'active'}
            style={styles.centerBadge}
          />
          {enclosure.customer ? (
            <KolamStatusBadge
              intent="success"
              label="Customer"
              style={styles.centerBadge}
              textStyle={styles.badgeTextSm}
            />
          ) : null}
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
          accessibilityLabel={`Aksi ${enclosure.name || enclosure.code}`}
          actions={[{label: 'Lihat', onPress: onSelect}]}
          onOpenChange={setActionMenuOpen}
        />
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
}

function KolamEnclosurePicAvatar({enclosure}: {enclosure: KolamEnclosure}) {
  const name =
    enclosure.assignedTo?.displayName ||
    enclosure.assignedTo?.email ||
    'Tanpa PIC';
  const photoUri = getKolamFileUrl(enclosure.assignedTo?.photo);
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || '?';

  return (
    <KolamHoverTooltip
      align="center"
      containerStyle={styles.picTooltip}
      label={name}
    >
      <View accessibilityLabel={`PIC ${name}`} style={styles.picAvatar}>
        <KolamProfileAvatarContent
          imageStyle={styles.picAvatarImage}
          imageUrl={photoUri}
          initials={initials}
          textStyle={styles.picAvatarText}
        />
      </View>
    </KolamHoverTooltip>
  );
}

function KolamEnclosureDashboardPanel({
  controller,
  onRouteChange,
}: {
  controller: KolamEnclosureController;
  onRouteChange?: (route: string) => void;
}) {
  if (controller.loading && controller.dataSource === 'idle') {
    return <InlineState title="Memuat dashboard..." />;
  }
  if (controller.error) {
    return <InlineState title="Gagal memuat dashboard" message={controller.error} />;
  }

  const stats = controller.dashboardStats;
  return (
    <ScrollView contentContainerStyle={styles.dashboardContent}>
      <View style={styles.summaryGridHero}>
        <SummaryTile
          icon="E"
          label="Jumlah enclosure"
          value={stats.totals.enclosures}
        />
        <SummaryTile
          hint={`${stats.totals.individuals} ekor total`}
          icon="S"
          label="Species di enclosure"
          value={stats.totals.speciesDistinct}
        />
        <SummaryTile
          accent="primary"
          hint={`${stats.production.speciesDistinct} jenis`}
          icon="P"
          label="Indukan produksi"
          value={stats.production.totalQty}
        />
        <SummaryTile
          hint={`${stats.saleable.speciesDistinct} jenis`}
          icon="J"
          label="Stok jual di enclosure"
          value={stats.saleable.totalQty}
        />
        <SummaryTile
          accent="warning"
          hint={`${stats.deaths.reportedAnimals} ekor dilaporkan / ${stats.deaths.totalCases} event total`}
          icon="!"
          label="Kematian dilaporkan"
          value={stats.deaths.reportedCases}
        />
        <SummaryTile
          accent="primary"
          hint={`${stats.births.totalCases} event / alasan KELAHIRAN`}
          icon="+"
          label="Total kelahiran indukan"
          value={stats.births.totalAnimals}
        />
      </View>

      <View style={styles.typeBand}>
        <View style={styles.typeBandHeading}>
          <Text style={styles.typeBandTitle}>Enclosure per tipe</Text>
        </View>
        <View style={styles.typeGrid}>
          {stats.byType.length ? (
            stats.byType.map(row => (
              <View key={row.type || 'unknown'} style={styles.typeMetric}>
                <Text style={styles.typeMetricValue}>{row.count}</Text>
                <Text numberOfLines={1} style={styles.typeMetricLabel}>
                  {row.type || '-'}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.mutedText}>Belum ada data tipe enclosure.</Text>
          )}
        </View>
      </View>

      <DashboardSpeciesTable
        rows={stats.production.rows}
        speciesDistinct={stats.production.speciesDistinct}
        subtitle="Breakdown per species - kandang produksi."
        title="Indukan produksi (tidak dijual)"
        totalQty={stats.production.totalQty}
      />
      <DashboardSpeciesTable
        rows={stats.saleable.rows}
        speciesDistinct={stats.saleable.speciesDistinct}
        subtitle="Breakdown per species - kandang siap jual."
        title="Stok jual"
        totalQty={stats.saleable.totalQty}
      />
      <DashboardDeathTable
        events={stats.deaths.recent}
        onRouteChange={onRouteChange}
      />
    </ScrollView>
  );
}

function SectionHeading({
  action,
  meta,
  subtitle,
  title,
}: {
  action?: React.ReactNode;
  meta?: string;
  subtitle?: string;
  title: string;
}) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionHeadingCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
        {meta ? <Text style={styles.sectionMeta}>{meta}</Text> : null}
      </View>
      {action ? <View style={styles.sectionAction}>{action}</View> : null}
    </View>
  );
}

function DashboardSpeciesTable({
  rows,
  speciesDistinct,
  subtitle,
  title,
  totalQty,
}: {
  rows: KolamEnclosureDashboardSpeciesRow[];
  speciesDistinct: number;
  subtitle: string;
  title: string;
  totalQty: number;
}) {
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(
    1,
    Math.ceil(rows.length / DASHBOARD_SPECIES_PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice(
    (safePage - 1) * DASHBOARD_SPECIES_PAGE_SIZE,
    safePage * DASHBOARD_SPECIES_PAGE_SIZE,
  );

  React.useEffect(() => {
    setPage(1);
  }, [rows]);

  return (
    <View style={styles.dashboardTableBlock}>
      <SectionHeading
        meta={`${speciesDistinct} jenis / ${totalQty} ekor total`}
        subtitle={subtitle}
        title={title}
      />
      <KolamCatalogListTableShell
        footer={
          rows.length > DASHBOARD_SPECIES_PAGE_SIZE ? (
            <SimpleDashboardPagination
              onPageChange={setPage}
              page={safePage}
              totalItems={rows.length}
              totalPages={totalPages}
            />
          ) : (
            <Text style={styles.sectionMeta}>{rows.length} baris</Text>
          )
        }
        style={styles.tableFrame}
      >
        <View style={styles.dashboardTable}>
          <KolamDataTableHeader columns={DASHBOARD_SPECIES_COLUMNS} />
          {pageRows.length ? (
            pageRows.map(row => (
              <DashboardSpeciesRow
                key={`${row.speciesId}:${row.variantId || ''}`}
                row={row}
              />
            ))
          ) : (
            <View style={styles.emptyWrap}>
              <KolamEmptyState
                compact
                message="Belum ada livestock."
                title="Belum ada livestock"
              />
            </View>
          )}
        </View>
      </KolamCatalogListTableShell>
    </View>
  );
}

function DashboardSpeciesRow({
  row,
}: {
  row: KolamEnclosureDashboardSpeciesRow;
}) {
  const imageUri = getKolamFileUrl(row.thumbnailUrl);

  return (
    <KolamDataTableRowFrame>
      <View style={styles.speciesThumbCell}>
        {imageUri ? (
          <KolamRemoteImage
            accessibilityLabel={`Foto ${row.speciesName || 'species'}`}
            resizeMode="cover"
            scope="enclosure-dashboard-species"
            sourceUri={imageUri}
            style={styles.speciesThumb}
          />
        ) : (
          <Text style={styles.mutedText}>-</Text>
        )}
      </View>
      <View style={[styles.cell, styles.primaryCell]}>
        <Text numberOfLines={1} style={styles.rowTitle}>
          {row.speciesName || '-'}
        </Text>
        {row.scientificName ? (
          <Text numberOfLines={1} style={styles.scientificText}>
            {row.scientificName}
          </Text>
        ) : null}
      </View>
      <View style={[styles.cell, {width: dashboardWidthOf('notes')}]}>
        <Text numberOfLines={2} style={styles.cellText}>
          {row.variantLabel || '-'}
        </Text>
      </View>
      <View style={[styles.cell, {width: dashboardWidthOf('children')}]}>
        <Text style={styles.numText}>
          {row.qty} {row.unit}
        </Text>
      </View>
      <View style={[styles.cell, {width: dashboardWidthOf('amount')}]}>
        <Text style={styles.numText}>{row.enclosureCount}</Text>
      </View>
    </KolamDataTableRowFrame>
  );
}

function DashboardDeathTable({
  events,
  onRouteChange,
}: {
  events: KolamEnclosureDashboardDeathEvent[];
  onRouteChange?: (route: string) => void;
}) {
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(
    1,
    Math.ceil(events.length / DASHBOARD_DEATH_PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const pageEvents = events.slice(
    (safePage - 1) * DASHBOARD_DEATH_PAGE_SIZE,
    safePage * DASHBOARD_DEATH_PAGE_SIZE,
  );

  React.useEffect(() => {
    setPage(1);
  }, [events]);

  return (
    <View style={styles.dashboardTableBlock}>
      <SectionHeading
        action={
          <KolamButton
            label="Pergerakan stok"
            onPress={() => onRouteChange?.('/stock-transaction')}
          />
        }
        subtitle="Event death - link ke pergerakan stok bila tersedia."
        title="Riwayat kematian"
      />
      <KolamCatalogListTableShell
        footer={
          events.length > DASHBOARD_DEATH_PAGE_SIZE ? (
            <SimpleDashboardPagination
              onPageChange={setPage}
              page={safePage}
              totalItems={events.length}
              totalPages={totalPages}
            />
          ) : (
            <Text style={styles.sectionMeta}>{events.length} baris</Text>
          )
        }
        style={styles.tableFrame}
      >
        <View style={styles.dashboardTable}>
          <KolamDataTableHeader columns={DASHBOARD_DEATH_COLUMNS} />
          {pageEvents.length ? (
            pageEvents.map((event, index) => (
              <DashboardDeathRow
                event={event}
                key={`${event.enclosureId}:${event.createdAt || index}`}
                onRouteChange={onRouteChange}
              />
            ))
          ) : (
            <View style={styles.emptyWrap}>
              <KolamEmptyState
                compact
                message="Belum ada catatan kematian."
                title="Belum ada catatan kematian"
              />
            </View>
          )}
        </View>
      </KolamCatalogListTableShell>
    </View>
  );
}

function DashboardDeathRow({
  event,
  onRouteChange,
}: {
  event: KolamEnclosureDashboardDeathEvent;
  onRouteChange?: (route: string) => void;
}) {
  const stockRoute = event.stockTransactionId
    ? `/stock-transaction/${event.stockTransactionId}`
    : event.speciesId
      ? `/stock-transaction?speciesId=${encodeURIComponent(event.speciesId)}`
      : '/stock-transaction';

  return (
    <KolamDataTableRowFrame>
      <View style={[styles.cell, {width: deathWidthOf('meta')}]}>
        <Text numberOfLines={2} style={styles.cellText}>
          {formatDashboardDateTime(event.createdAt)}
        </Text>
      </View>
      <Pressable
        onPress={() =>
          event.enclosureId
            ? onRouteChange?.(`${KOLAM_ENCLOSURE_ROOT}/${event.enclosureId}`)
            : undefined
        }
        style={[styles.cell, {width: deathWidthOf('children')}]}
      >
        <Text numberOfLines={1} style={styles.linkText}>
          {event.enclosureCode || event.enclosureId.slice(-8) || '-'}
        </Text>
      </Pressable>
      <View style={[styles.cell, styles.primaryCell]}>
        <Text numberOfLines={1} style={styles.cellText}>
          {event.speciesName || '-'}
        </Text>
        {event.scientificName ? (
          <Text numberOfLines={1} style={styles.scientificText}>
            {event.scientificName}
          </Text>
        ) : null}
      </View>
      <View style={[styles.cell, {width: deathWidthOf('amount')}]}>
        <Text style={styles.numText}>{event.qty}</Text>
      </View>
      <View style={[styles.cell, {width: deathWidthOf('status')}]}>
        <KolamStatusBadge
          intent={event.reported ? 'warning' : 'muted'}
          label={event.reported ? 'Dilaporkan' : 'Tanpa laporan'}
          textStyle={styles.badgeTextSm}
        />
      </View>
      <View style={[styles.actionCell, {width: deathWidthOf('actions')}]}>
        <KolamButton label="Lihat" onPress={() => onRouteChange?.(stockRoute)} />
      </View>
    </KolamDataTableRowFrame>
  );
}

function SimpleDashboardPagination({
  onPageChange,
  page,
  totalItems,
  totalPages,
}: {
  onPageChange: (page: number) => void;
  page: number;
  totalItems: number;
  totalPages: number;
}) {
  return (
    <View style={styles.dashboardPagination}>
      <Text style={styles.sectionMeta}>{totalItems} baris</Text>
      <View style={styles.paginationRow}>
        <KolamButton
          disabled={page <= 1}
          label="Sebelumnya"
          onPress={() => onPageChange(Math.max(1, page - 1))}
        />
        <Text style={styles.pageLabel}>
          {page} / {totalPages}
        </Text>
        <KolamButton
          disabled={page >= totalPages}
          label="Berikutnya"
          onPress={() => onPageChange(Math.min(totalPages, page + 1))}
        />
      </View>
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
  onRouteChange,
}: {
  controller: KolamEnclosureController;
  onRouteChange?: (route: string) => void;
}) {
  const [page, setPage] = React.useState(1);
  const [openSpeciesIds, setOpenSpeciesIds] = React.useState<Set<string>>(
    () => new Set(),
  );
  const search = controller.filters.search.trim();
  const groups = React.useMemo(
    () => filterAllocationGroups(controller.allocationSpeciesGroups, search),
    [controller.allocationSpeciesGroups, search],
  );
  const totalPages = Math.max(1, Math.ceil(groups.length / DASHBOARD_SPECIES_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageGroups = groups.slice(
    (safePage - 1) * DASHBOARD_SPECIES_PAGE_SIZE,
    safePage * DASHBOARD_SPECIES_PAGE_SIZE,
  );

  React.useEffect(() => {
    setPage(1);
  }, [search, controller.allocationSpeciesGroups]);

  const toggleGroup = React.useCallback((speciesId: string) => {
    setOpenSpeciesIds(current => {
      const next = new Set(current);
      if (next.has(speciesId)) {
        next.delete(speciesId);
      } else {
        next.add(speciesId);
      }
      return next;
    });
  }, []);

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
    <ScrollView contentContainerStyle={styles.dashboardContent}>
      <View style={styles.summaryGrid}>
        <SummaryTile
          icon="S"
          label="Jumlah species"
          value={controller.allocationOverview.totals.speciesCount}
        />
        <SummaryTile
          hint={`${controller.allocationOverview.totals.rowCount} varian`}
          icon="T"
          label="Stok total"
          value={controller.allocationOverview.totals.totalStock}
        />
        <SummaryTile
          accent="primary"
          icon="E"
          label="Sudah di enclosure"
          value={controller.allocationOverview.totals.totalAllocated}
        />
        <SummaryTile
          accent="warning"
          icon="!"
          label="Belum di enclosure"
          value={controller.allocationOverview.totals.totalUnallocated}
        />
      </View>
      <Text style={styles.sectionMeta}>
        {groups.length} species / {controller.allocationOverview.totals.rowCount} varian
      </Text>
      <KolamCatalogListTableShell
        footer={
          groups.length > DASHBOARD_SPECIES_PAGE_SIZE ? (
            <SimpleDashboardPagination
              onPageChange={setPage}
              page={safePage}
              totalItems={groups.length}
              totalPages={totalPages}
            />
          ) : (
            <Text style={styles.sectionMeta}>{groups.length} species</Text>
          )
        }
        style={styles.tableFrame}
      >
        <View style={styles.dashboardTable}>
          <KolamDataTableHeader columns={ALLOCATION_OVERVIEW_COLUMNS} />
          {pageGroups.length ? (
            pageGroups.map(group => (
              <AllocationSpeciesGroupRow
                group={group}
                key={group.speciesId}
                onRouteChange={onRouteChange}
                onToggle={() => toggleGroup(group.speciesId)}
                open={openSpeciesIds.has(group.speciesId)}
              />
            ))
          ) : (
            <View style={styles.emptyWrap}>
              <KolamEmptyState
                compact
                message={
                  search
                    ? `Tidak ada species untuk "${search}".`
                    : 'Belum ada data stok species.'
                }
                title={search ? 'Species tidak ditemukan' : 'Belum ada data stok'}
              />
            </View>
          )}
        </View>
      </KolamCatalogListTableShell>
    </ScrollView>
  );
}

type AllocationSpeciesGroup =
  KolamEnclosureController['allocationSpeciesGroups'][number];

function AllocationSpeciesGroupRow({
  group,
  onRouteChange,
  onToggle,
  open,
}: {
  group: AllocationSpeciesGroup;
  onRouteChange?: (route: string) => void;
  onToggle: () => void;
  open: boolean;
}) {
  const singleRow = group.rows.length === 1 && !group.hasVariants;
  const row = group.rows[0];

  if (singleRow && row) {
    return (
      <AllocationOverviewRow
        allocated={row.allocated}
        codes={row.enclosureCodes}
        enclosures={row.enclosures}
        onRouteChange={onRouteChange}
        scientificName={group.scientificName}
        speciesName={group.speciesName || group.speciesId}
        unit={row.unit || group.unit}
        unallocated={row.unallocated}
        variantLabel={row.variantLabel || '-'}
      />
    );
  }

  return (
    <View>
      <KolamDataTableRowFrame>
        <View style={[styles.cell, styles.primaryCell]}>
          <Text numberOfLines={1} style={styles.rowTitle}>
            {group.speciesName || group.speciesId}
          </Text>
          {group.scientificName ? (
            <Text numberOfLines={1} style={styles.scientificText}>
              {group.scientificName}
            </Text>
          ) : null}
        </View>
        <View style={[styles.cell, {width: allocationWidthOf('notes')}]}>
          <KolamButton
            label={`${group.rows.length} varian ${open ? 'up' : 'down'}`}
            onPress={onToggle}
            style={styles.variantToggleButton}
          />
        </View>
        <View style={[styles.cell, {width: allocationWidthOf('children')}]}>
          <Text style={styles.numText}>
            {group.totalAllocated} {group.unit}
          </Text>
        </View>
        <View style={[styles.cell, {width: allocationWidthOf('amount')}]}>
          <Text
            style={[
              styles.numText,
              group.totalUnallocated > 0 ? styles.warningText : null,
            ]}
          >
            {group.totalUnallocated} {group.unit}
          </Text>
        </View>
        <View style={[styles.cell, {width: allocationWidthOf('marketplace')}]}>
          <AllocationEnclosureCodeLinks
            onRouteChange={onRouteChange}
            rows={group.rows}
          />
        </View>
      </KolamDataTableRowFrame>
      {open ? (
        <View style={styles.allocationVariantPanel}>
          {group.rows.map(rowItem => (
            <AllocationVariantRow
              key={`${rowItem.speciesId}:${rowItem.variantId || ''}`}
              onRouteChange={onRouteChange}
              row={rowItem}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function AllocationOverviewRow({
  allocated,
  codes,
  enclosures,
  onRouteChange,
  scientificName,
  speciesName,
  unit,
  unallocated,
  variantLabel,
}: {
  allocated: number;
  codes: string[];
  enclosures: KolamEnclosureAllocationOverviewRow['enclosures'];
  onRouteChange?: (route: string) => void;
  scientificName: string;
  speciesName: string;
  unit: string;
  unallocated: number;
  variantLabel: string;
}) {
  return (
    <KolamDataTableRowFrame>
      <View style={[styles.cell, styles.primaryCell]}>
        <Text numberOfLines={1} style={styles.rowTitle}>
          {speciesName || '-'}
        </Text>
        {scientificName ? (
          <Text numberOfLines={1} style={styles.scientificText}>
            {scientificName}
          </Text>
        ) : null}
      </View>
      <View style={[styles.cell, {width: allocationWidthOf('notes')}]}>
        <Text numberOfLines={2} style={styles.cellText}>
          {variantLabel || '-'}
        </Text>
      </View>
      <View style={[styles.cell, {width: allocationWidthOf('children')}]}>
        <Text style={styles.numText}>
          {allocated} {unit}
        </Text>
      </View>
      <View style={[styles.cell, {width: allocationWidthOf('amount')}]}>
        <Text style={[styles.numText, unallocated > 0 ? styles.warningText : null]}>
          {unallocated} {unit}
        </Text>
      </View>
      <View style={[styles.cell, {width: allocationWidthOf('marketplace')}]}>
        <AllocationEnclosureCodeLinks
          onRouteChange={onRouteChange}
          rows={[{enclosureCodes: codes, enclosures}]}
        />
      </View>
    </KolamDataTableRowFrame>
  );
}

function AllocationVariantRow({
  onRouteChange,
  row,
}: {
  onRouteChange?: (route: string) => void;
  row: KolamEnclosureAllocationOverviewRow;
}) {
  return (
    <View style={styles.allocationVariantRow}>
      <Text numberOfLines={2} style={[styles.cellText, styles.variantName]}>
        {row.variantLabel || '-'}
      </Text>
      <Text style={styles.allocationVariantMetric}>
        Di enclosure: {row.allocated} {row.unit}
      </Text>
      <Text
        style={[
          styles.allocationVariantMetric,
          row.unallocated > 0 ? styles.warningText : null,
        ]}
      >
        Belum: {row.unallocated} {row.unit}
      </Text>
      <AllocationEnclosureCodeLinks
        onRouteChange={onRouteChange}
        rows={[row]}
        style={styles.allocationVariantCodes}
      />
    </View>
  );
}

function AllocationEnclosureCodeLinks({
  onRouteChange,
  rows,
  style,
}: {
  onRouteChange?: (route: string) => void;
  rows: Array<
    Pick<KolamEnclosureAllocationOverviewRow, 'enclosureCodes' | 'enclosures'>
  >;
  style?: StyleProp<TextStyle>;
}) {
  const links = collectAllocationEnclosureLinks(rows);
  if (!links.length) {
    return <Text style={[styles.cellText, style]}>-</Text>;
  }

  return (
    <View style={styles.codeLinksRow}>
      {links.map((link, index) => (
        <React.Fragment key={`${link.enclosureId || 'code'}:${link.code}`}>
          {index > 0 ? <Text style={[styles.cellText, style]}>, </Text> : null}
          {link.enclosureId ? (
            <Pressable
              accessibilityRole="link"
              onPress={() =>
                onRouteChange?.(`${KOLAM_ENCLOSURE_ROOT}/${link.enclosureId}`)
              }
            >
              <Text numberOfLines={1} style={[styles.linkText, style]}>
                {link.code}
              </Text>
            </Pressable>
          ) : (
            <Text numberOfLines={1} style={[styles.cellText, style]}>
              {link.code}
            </Text>
          )}
        </React.Fragment>
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

function SummaryTile({
  accent,
  hint,
  icon,
  label,
  value,
}: {
  accent?: 'primary' | 'warning';
  hint?: string;
  icon: string;
  label: string;
  value: number;
}) {
  return (
    <View
      style={[
        styles.summaryTile,
        accent === 'primary' ? styles.summaryTilePrimary : null,
        accent === 'warning' ? styles.summaryTileWarning : null,
      ]}
    >
      <View style={styles.summaryTileHeader}>
        <View
          style={[
            styles.summaryIcon,
            accent === 'primary' ? styles.summaryIconPrimary : null,
            accent === 'warning' ? styles.summaryIconWarning : null,
          ]}
        >
          <Text style={styles.summaryIconText}>{icon}</Text>
        </View>
        <Text style={styles.summaryValue}>{value}</Text>
      </View>
      <Text numberOfLines={2} style={styles.summaryLabel}>
        {label}
      </Text>
      {hint ? <Text style={styles.summaryHint}>{hint}</Text> : null}
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

function fitEnclosureListColumns(containerWidth: number): KolamTableColumn[] {
  return fitKolamDataTableColumns(
    getKolamTableColumns('enclosure'),
    containerWidth,
    {
      actionsMinWidth: KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
      gap: KOLAM_DATA_TABLE_COLUMN_GAP,
      paddingX: getKolamTableVisualContract().body.cellPaddingX * 2,
      primaryMinWidth: 160,
      secondaryMinWidth: 48,
    },
  );
}

function dashboardWidthOf(id: KolamTableColumn['id']) {
  return DASHBOARD_SPECIES_COLUMNS.find(column => column.id === id)?.width;
}

function deathWidthOf(id: KolamTableColumn['id']) {
  return DASHBOARD_DEATH_COLUMNS.find(column => column.id === id)?.width;
}

function allocationWidthOf(id: KolamTableColumn['id']) {
  return ALLOCATION_OVERVIEW_COLUMNS.find(column => column.id === id)?.width;
}

function filterAllocationGroups(
  groups: KolamEnclosureController['allocationSpeciesGroups'],
  search: string,
) {
  const needle = search.trim().toLowerCase();
  if (!needle) {
    return groups;
  }

  return groups.filter(group => {
    const text = [
      group.speciesName,
      group.scientificName,
      group.unit,
      ...group.rows.flatMap(row => [
        row.variantLabel,
        ...row.enclosureCodes,
        ...row.enclosures.map(enclosure => enclosure.code),
      ]),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return text.includes(needle);
  });
}

function collectAllocationEnclosureLinks(
  rows: Array<
    Pick<KolamEnclosureAllocationOverviewRow, 'enclosureCodes' | 'enclosures'>
  >,
) {
  const byKey = new Map<string, {code: string; enclosureId: string}>();

  for (const row of rows) {
    for (const enclosure of row.enclosures) {
      const code = enclosure.code.trim();
      const enclosureId = enclosure.enclosureId.trim();
      if (!code && !enclosureId) {
        continue;
      }
      const key = enclosureId || `code:${code}`;
      const current = byKey.get(key);
      if (!current) {
        byKey.set(key, {
          code: code || enclosureId.slice(-8),
          enclosureId,
        });
        continue;
      }
      if (!current.enclosureId && enclosureId) {
        current.enclosureId = enclosureId;
      }
      if (!current.code && code) {
        current.code = code;
      }
    }
    for (const code of row.enclosureCodes) {
      const trimmed = code.trim();
      if (!trimmed) {
        continue;
      }
      const existing = [...byKey.values()].find(item => item.code === trimmed);
      if (existing) {
        continue;
      }
      byKey.set(`code:${trimmed}`, {code: trimmed, enclosureId: ''});
    }
  }

  return [...byKey.values()];
}

function formatDashboardDateTime(value: string) {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
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
    gap: 14,
  },
  errorBadge: {
    alignSelf: 'stretch',
  },
  listRoot: {
    gap: 14,
    overflow: 'visible',
  },
  toolbarWrap: {
    elevation: 1000,
    gap: 10,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
  },
  toolbarButton: {
    flexShrink: 0,
    minHeight: 34,
    paddingHorizontal: 10,
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
  listCell: {
    gap: 2,
    justifyContent: 'center',
    minWidth: 0,
  },
  identityCell: {
    alignItems: 'flex-start',
  },
  centerCell: {
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
    width: '100%',
  },
  mainTrackVisible: {
    overflow: 'visible',
  },
  overflowVisible: {
    overflow: 'visible',
    zIndex: 9000,
  },
  picCell: {
    alignItems: 'center',
  },
  picTooltip: {
    alignSelf: 'center',
  },
  activeActionRow: {
    elevation: 30,
    overflow: 'visible',
    zIndex: 1000,
  },
  picAvatar: {
    alignItems: 'center',
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.border,
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 32,
  },
  picAvatarImage: {
    borderRadius: 16,
    height: 32,
    width: 32,
  },
  picAvatarText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  photoCell: {
    alignItems: 'center',
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
    alignItems: 'center',
    gap: 4,
  },
  centerBadge: {
    alignSelf: 'center',
  },
  actionsTrack: {
    justifyContent: 'center',
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
  numText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  warningText: {
    color: V.colors.warning,
  },
  linkText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  codeLinksRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
    minWidth: 0,
  },
  scientificText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontStyle: 'italic',
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
  summaryGridHero: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dashboardContent: {
    gap: 18,
    paddingBottom: 24,
  },
  sectionHeading: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  sectionHeadingCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  sectionMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionAction: {
    flexShrink: 0,
  },
  typeBand: {
    gap: 10,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  typeBandHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeBandTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  typeMetric: {
    borderLeftColor: V.colors.border,
    borderLeftWidth: 1,
    flexGrow: 1,
    minWidth: 150,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  typeMetricValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 30,
    fontWeight: '900',
  },
  typeMetricLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  summaryTile: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 142,
    padding: 12,
  },
  summaryTilePrimary: {
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.primary,
  },
  summaryTileWarning: {
    backgroundColor: V.colors.warningSoft,
    borderColor: V.colors.warning,
  },
  summaryTileHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  summaryIconPrimary: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.primary,
  },
  summaryIconWarning: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.warning,
  },
  summaryIconText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
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
  summaryHint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    marginTop: 4,
  },
  dashboardTableBlock: {
    gap: 8,
  },
  dashboardTable: {
    gap: 0,
    overflow: 'visible',
  },
  speciesThumbCell: {
    alignItems: 'center',
    justifyContent: 'center',
    width: dashboardWidthOf('meta'),
  },
  speciesThumb: {
    borderRadius: 6,
    height: 36,
    width: 36,
  },
  dashboardPagination: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  variantToggleButton: {
    alignSelf: 'flex-start',
    minHeight: 30,
    paddingHorizontal: 8,
  },
  allocationVariantPanel: {
    backgroundColor: V.colors.secondary,
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  allocationVariantRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    minHeight: 42,
    paddingVertical: 7,
  },
  variantName: {
    flex: 1,
    fontWeight: '700',
    minWidth: 0,
  },
  allocationVariantMetric: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    minWidth: 112,
    textAlign: 'right',
  },
  allocationVariantCodes: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    minWidth: 180,
    width: 220,
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
