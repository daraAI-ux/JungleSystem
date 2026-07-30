import React from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getKolamFormSection } from '../domain/kolam-form';
import {
  fitKolamDataTableColumns,
  getKolamTableColumns,
  getKolamTableVisualContract,
  type KolamTableColumn,
} from '../domain/kolam-table';
import {
  buildKolamSupplierMonthlyTrendGraphItems,
  flattenKolamSupplierProductRows,
  flattenKolamSupplierSpeciesRows,
  formatKolamVendorAddress,
  getKolamVendorStatusIntent,
  getKolamVendorStatusLabel,
  hasKolamVendorPurchaseAnalytics,
  KOLAM_SUPPLIER_ROOT,
  type KolamSupplierAnalyticsFilters,
  type KolamSupplierCatalogTab,
  type KolamVendor,
  type KolamVendorPurchaseProductStat,
  type KolamVendorStatus,
} from '../domain/kolam-vendor';
import { buildDashboardSalesGraphPoints } from '../domain/dashboard-sales-graph';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  canEditKolamTaxPartyProfile,
  hasKolamTaxPartyNpwp,
} from '../domain/kolam-tax-party';
import { formatRupiah } from '../lib/money';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  useKolamSupplierController,
  type KolamSupplierController,
} from '../hooks/use-kolam-supplier-controller';
import { KolamButton } from './kolam-button';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDashboardSalesGraphPlot } from './kolam-dashboard-sales-graph-plot';
import {
  getKolamDataTableColumnStyle,
  KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  KOLAM_DATA_TABLE_COLUMN_GAP,
} from './kolam-data-table-column-style';
import { KolamDataTableHeader } from './kolam-data-table-header';
import { KolamDataTableRowFrame } from './kolam-data-table-row-frame';
import {
  KolamDataTableActionsTrack,
  KolamDataTableMainTrack,
} from './kolam-data-table-tracks';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import { KolamDescriptionList } from './kolam-description-list';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamLabelFieldDetailOverview } from './kolam-label-field-detail-overview';
import { KolamNativeFormSection } from './kolam-native-form-section';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSearchField } from './kolam-search-field';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamSwitch } from './kolam-switch';
import { KolamTableFilterTrigger } from './kolam-table-filter-trigger';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

type SupplierSortMode = 'name-asc' | 'name-desc' | 'po-desc' | 'newest';
type SupplierStatusFilter = 'all' | 'active' | 'inactive' | 'blacklisted';
type SupplierFilterPanel = 'status' | 'sort' | null;
type SupplierAnalyticsFilterPanel = 'period' | 'year' | 'month' | null;

export function KolamSupplierSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamSupplierController(route);

  return (
    <View
      style={[
        styles.surface,
        controller.mode === 'list' ? styles.listSurface : null,
      ]}
    >
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}
      {controller.mode === 'list' ? (
        <KolamSupplierList
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : (
        <KolamSupplierDetail
          controller={controller}
          onRouteChange={onRouteChange}
        />
      )}
    </View>
  );
}

function KolamSupplierList({
  controller,
  onRouteChange,
}: {
  controller: KolamSupplierController;
  onRouteChange?: (route: string) => void;
}) {
  const [search, setSearch] = React.useState('');
  const [sortMode, setSortMode] = React.useState<SupplierSortMode>('name-asc');
  const [statusFilter, setStatusFilter] =
    React.useState<SupplierStatusFilter>('all');
  const [activeFilterPanel, setActiveFilterPanel] =
    React.useState<SupplierFilterPanel>(null);
  const [pageSize, setPageSize] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamVendor | null>(null);
  const [openActionRowId, setOpenActionRowId] = React.useState<string | null>(
    null,
  );
  const [tableBodyWidth, setTableBodyWidth] = React.useState(0);
  const listColumns = React.useMemo(
    () => fitSupplierListColumns(tableBodyWidth),
    [tableBodyWidth],
  );

  const filtered = React.useMemo(
    () => filterVendors(controller.vendors, search, statusFilter),
    [controller.vendors, search, statusFilter],
  );
  const sorted = React.useMemo(
    () => sortVendors(filtered, sortMode),
    [filtered, sortMode],
  );
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
  const filtersAppliedCount =
    Number(Boolean(search.trim())) +
    Number(statusFilter !== 'all') +
    Number(sortMode !== 'name-asc');

  const statusFilterLabel =
    statusFilter === 'all'
      ? 'Status'
      : getKolamVendorStatusLabel(statusFilter);
  const sortFilterLabel =
    sortMode === 'name-asc'
      ? 'Urutan'
      : sortMode === 'name-desc'
      ? 'Nama Z-A'
      : sortMode === 'po-desc'
      ? 'Total PO'
      : 'Terbaru';

  React.useEffect(() => {
    setPage(1);
  }, [pageSize, search, sortMode, statusFilter]);

  const renderRow = React.useCallback(
    ({ item }: { item: KolamVendor }) => (
      <KolamSupplierRow
        columns={listColumns}
        onDelete={() => setDeleteCandidate(item)}
        onEdit={() => {
          onRouteChange?.(`${KOLAM_SUPPLIER_ROOT}/${item.id}/edit`);
        }}
        onMenuOpenChange={open => {
          setOpenActionRowId(open ? item.id : null);
        }}
        onSelect={() => {
          void controller.onSelectVendor(item);
          onRouteChange?.(`${KOLAM_SUPPLIER_ROOT}/${item.id}`);
        }}
        vendor={item}
      />
    ),
    [controller, listColumns, onRouteChange],
  );

  return (
    <View style={styles.listRoot}>
      <View style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <KolamSearchField
                containerStyle={kolamTableToolbarStyles.searchInput}
                onChangeText={setSearch}
                placeholder="Cari"
                value={search}
              />
              <KolamTableFilterTrigger
                active={activeFilterPanel === 'status' || statusFilter !== 'all'}
                label={statusFilterLabel}
                onPress={() =>
                  setActiveFilterPanel(current =>
                    current === 'status' ? null : 'status',
                  )
                }
                open={activeFilterPanel === 'status'}
                variant="quiet"
              />
              <KolamTableFilterTrigger
                active={activeFilterPanel === 'sort' || sortMode !== 'name-asc'}
                label={sortFilterLabel}
                onPress={() =>
                  setActiveFilterPanel(current =>
                    current === 'sort' ? null : 'sort',
                  )
                }
                open={activeFilterPanel === 'sort'}
                variant="quiet"
              />
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              {filtersAppliedCount > 0 ? (
                <KolamButton
                  label="Reset"
                  muted
                  onPress={() => {
                    setSearch('');
                    setStatusFilter('all');
                    setSortMode('name-asc');
                    setActiveFilterPanel(null);
                    setPage(1);
                  }}
                  style={styles.toolbarButton}
                />
              ) : null}
              <KolamButton
                disabled={controller.loading}
                label="Muat ulang"
                onPress={() => {
                  void controller.onRefresh();
                }}
                style={styles.toolbarButton}
              />
              <KolamButton
                intent="primary"
                label="Baru"
                onPress={() => {
                  controller.onCreateNew();
                  onRouteChange?.(`${KOLAM_SUPPLIER_ROOT}/create`);
                }}
                style={styles.toolbarButton}
              />
            </View>
          </View>
        </View>

        {activeFilterPanel === 'status' ? (
          <View style={[styles.filterOverlayPanel, styles.filterPanelStatus]}>
            <ScrollView
              contentContainerStyle={styles.filterPanelContent}
              keyboardShouldPersistTaps="handled"
              style={styles.filterPanelScroll}
            >
              {(
                [
                  { label: 'Semua', value: 'all' },
                  { label: 'Aktif', value: 'active' },
                  { label: 'Nonaktif', value: 'inactive' },
                  { label: 'Blacklist', value: 'blacklisted' },
                ] as const
              ).map(option => (
                <KolamButton
                  intent={statusFilter === option.value ? 'primary' : 'plain'}
                  key={option.value}
                  label={option.label}
                  onPress={() => {
                    setStatusFilter(option.value);
                    setActiveFilterPanel(null);
                    setPage(1);
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

        {activeFilterPanel === 'sort' ? (
          <View style={[styles.filterOverlayPanel, styles.filterPanelSort]}>
            <ScrollView
              contentContainerStyle={styles.filterPanelContent}
              keyboardShouldPersistTaps="handled"
              style={styles.filterPanelScroll}
            >
              {(
                [
                  { label: 'Nama A-Z', value: 'name-asc' },
                  { label: 'Nama Z-A', value: 'name-desc' },
                  { label: 'Total PO', value: 'po-desc' },
                  { label: 'Terbaru', value: 'newest' },
                ] as const
              ).map(option => (
                <KolamButton
                  intent={sortMode === option.value ? 'primary' : 'plain'}
                  key={option.value}
                  label={option.label}
                  onPress={() => {
                    setSortMode(option.value);
                    setActiveFilterPanel(null);
                    setPage(1);
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

      <KolamCatalogListTableShell
        footer={
          <KolamTableFooterControls
            onPageSizeChange={setPageSize}
            page={safePage}
            pageSize={pageSize}
            total={sorted.length}
          >
            {pageCount > 1 ? (
              <View style={styles.paginationRow}>
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
        }
        style={styles.tableFrame}
        onBodyWidthChange={setTableBodyWidth}
      >
        <FlatList
          contentContainerStyle={[
            styles.listContent,
            openActionRowId ? styles.listContentMenuOpen : null,
          ]}
          data={paged}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <KolamEmptyState
                compact
                message="Coba ubah pencarian atau filter status."
                title={
                  controller.loading ? 'Memuat pemasok…' : 'Belum ada pemasok'
                }
              />
            </View>
          }
          ListHeaderComponent={
            <KolamDataTableHeader columns={listColumns} />
          }
          removeClippedSubviews={false}
          renderItem={renderRow}
          style={styles.listFlatList}
        />
      </KolamCatalogListTableShell>

      <KolamDeleteConfirmDialog
        itemLabel={deleteCandidate?.name}
        itemType="pemasok"
        visible={Boolean(deleteCandidate)}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          const vendor = deleteCandidate;
          setDeleteCandidate(null);
          if (!vendor) {
            return;
          }
          void controller.onDeleteVendor(vendor).then(deleted => {
            if (deleted) {
              onRouteChange?.(KOLAM_SUPPLIER_ROOT);
            }
          });
        }}
      />
    </View>
  );
}

function KolamSupplierRow({
  columns,
  onDelete,
  onEdit,
  onMenuOpenChange,
  onSelect,
  vendor,
}: {
  columns: ReturnType<typeof getKolamTableColumns>;
  onDelete: () => void;
  onEdit: () => void;
  onMenuOpenChange?: (open: boolean) => void;
  onSelect: () => void;
  vendor: KolamVendor;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const thumb = vendor.photoUrls?.[0] || vendor.photos?.[0] || '';
  const columnOf = React.useCallback(
    (id: (typeof columns)[number]['id']) =>
      columns.find(column => column.id === id),
    [columns],
  );
  const primaryColumn = columnOf('primary');
  const phoneColumn = columnOf('meta');
  const emailColumn = columnOf('notes');
  const poColumn = columnOf('children');
  const statusColumn = columnOf('status');
  const actionsColumn = columnOf('actions');

  return (
    <KolamDataTableRowFrame
      style={actionMenuOpen ? styles.activeActionRow : undefined}
    >
      <KolamDataTableMainTrack>
        <Pressable
          onPress={onSelect}
          style={[
            styles.listCell,
            styles.identityCell,
            primaryColumn ? getKolamDataTableColumnStyle(primaryColumn) : null,
          ]}
        >
          <View style={styles.identity}>
            {thumb ? (
              <KolamRemoteImage
                accessibilityLabel={`Foto ${vendor.name}`}
                resizeMode="cover"
                scope="vendor"
                sourceUri={thumb}
                style={styles.thumb}
              />
            ) : (
              <View style={styles.thumbFallback}>
                <Text style={styles.thumbFallbackText}>
                  {vendor.name.slice(0, 1).toUpperCase()}
                </Text>
              </View>
            )}
            <KolamCopyStack
              containerStyle={styles.identityCopy}
              items={[
                {
                  id: 'name',
                  text: vendor.name,
                  style: styles.rowTitle,
                  textProps: { numberOfLines: 1 },
                },
                {
                  id: 'meta',
                  text:
                    [vendor.city, vendor.country].filter(Boolean).join(' · ') ||
                    '—',
                  style: styles.rowMeta,
                  textProps: { numberOfLines: 1 },
                },
              ]}
            />
          </View>
        </Pressable>
        <View
          style={[
            styles.listCell,
            phoneColumn ? getKolamDataTableColumnStyle(phoneColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.cellText}>
            {vendor.phone || '—'}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            emailColumn ? getKolamDataTableColumnStyle(emailColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.cellText}>
            {vendor.email || '—'}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            poColumn ? getKolamDataTableColumnStyle(poColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.numText}>
            {String(vendor.poCount)}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            statusColumn ? getKolamDataTableColumnStyle(statusColumn) : null,
          ]}
        >
          <KolamStatusBadge
            intent={getKolamVendorStatusIntent(vendor.status)}
            label={getKolamVendorStatusLabel(vendor.status)}
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
          accessibilityLabel={`Menu ${vendor.name}`}
          onOpenChange={open => {
            setActionMenuOpen(open);
            onMenuOpenChange?.(open);
          }}
          actions={[
            { label: 'Lihat', onPress: onSelect },
            { label: 'Rubah', onPress: onEdit },
            { label: 'Hapus', onPress: onDelete, tone: 'danger' },
          ]}
        />
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
}

function KolamSupplierDetail({
  controller,
  onRouteChange,
}: {
  controller: KolamSupplierController;
  onRouteChange?: (route: string) => void;
}) {
  const vendor = controller.selectedVendor;
  const editable = controller.isEditable;
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamVendor | null>(null);
  const [activeAnalyticsFilter, setActiveAnalyticsFilter] =
    React.useState<SupplierAnalyticsFilterPanel>(null);
  const analyticsFilters = controller.analyticsFilters;
  const analyticsYears = React.useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => new Date().getFullYear() - index),
    [],
  );
  const analyticsMonths = React.useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        id: index + 1,
        name: new Date(2000, index).toLocaleString('id-ID', { month: 'short' }),
      })),
    [],
  );

  if (editable) {
    const contextLabel =
      controller.mode === 'new'
        ? 'Pemasok baru'
        : `Edit · ${controller.form.name?.trim() || vendor?.name || 'Pemasok'}`;

    return (
      <View style={styles.detailSurface}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <Text numberOfLines={1} style={styles.detailToolbarContext}>
                {contextLabel}
              </Text>
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              <KolamButton
                label="Daftar"
                onPress={() => {
                  controller.onBackToList();
                  onRouteChange?.(KOLAM_SUPPLIER_ROOT);
                }}
                style={styles.toolbarButton}
              />
            </View>
          </View>
        </View>
        <KolamSupplierForm
          controller={controller}
          onRouteChange={onRouteChange}
        />
      </View>
    );
  }

  if (!vendor) {
    return (
      <KolamEmptyState
        compact
        message="Pilih pemasok dari daftar untuk melihat detil."
        title={controller.loading ? 'Memuat detil…' : 'Detil belum tersedia'}
      />
    );
  }

  const address = formatKolamVendorAddress(vendor);
  const heroUri = vendor.photoUrls?.[0] || vendor.photos?.[0] || '';
  const photoUrls = vendor.photoUrls ?? [];
  const periodLabel =
    analyticsFilters.filterType === 'yearly'
      ? 'Tahunan'
      : analyticsFilters.filterType === 'monthly'
      ? 'Bulanan'
      : 'Semua waktu';
  const yearLabel = analyticsFilters.year
    ? String(analyticsFilters.year)
    : 'Semua tahun';
  const monthLabel =
    analyticsFilters.filterType === 'yearly'
      ? 'Semua bulan'
      : analyticsFilters.month
      ? analyticsMonths.find(month => month.id === analyticsFilters.month)
          ?.name ?? `Bln ${analyticsFilters.month}`
      : 'Semua bulan';
  const analyticsFiltersApplied =
    Boolean(analyticsFilters.filterType) ||
    Boolean(analyticsFilters.year) ||
    Boolean(analyticsFilters.month);

  const patchAnalyticsFilters = (patch: KolamSupplierAnalyticsFilters) => {
    const next: KolamSupplierAnalyticsFilters = {
      ...analyticsFilters,
      ...patch,
    };
    if (!next.filterType) {
      delete next.filterType;
    }
    if (!next.year) {
      delete next.year;
    }
    if (next.filterType !== 'monthly' || !next.month) {
      delete next.month;
    }
    void controller.onChangeAnalyticsFilters(next);
  };

  return (
    <View style={styles.detailSurface}>
      <View style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <Text numberOfLines={1} style={styles.detailToolbarContext}>
                {vendor.name}
              </Text>
              <KolamTableFilterTrigger
                active={
                  activeAnalyticsFilter === 'period' ||
                  Boolean(analyticsFilters.filterType)
                }
                label={periodLabel}
                onPress={() =>
                  setActiveAnalyticsFilter(current =>
                    current === 'period' ? null : 'period',
                  )
                }
                open={activeAnalyticsFilter === 'period'}
                variant="quiet"
              />
              <KolamTableFilterTrigger
                active={
                  activeAnalyticsFilter === 'year' ||
                  Boolean(analyticsFilters.year)
                }
                label={yearLabel}
                onPress={() =>
                  setActiveAnalyticsFilter(current =>
                    current === 'year' ? null : 'year',
                  )
                }
                open={activeAnalyticsFilter === 'year'}
                variant="quiet"
              />
              <KolamTableFilterTrigger
                active={
                  activeAnalyticsFilter === 'month' ||
                  Boolean(
                    analyticsFilters.month &&
                      analyticsFilters.filterType !== 'yearly',
                  )
                }
                label={monthLabel}
                onPress={() =>
                  setActiveAnalyticsFilter(current =>
                    current === 'month' ? null : 'month',
                  )
                }
                open={activeAnalyticsFilter === 'month'}
                variant="quiet"
              />
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              {analyticsFiltersApplied ? (
                <KolamButton
                  label="Reset"
                  muted
                  onPress={() => {
                    setActiveAnalyticsFilter(null);
                    void controller.onChangeAnalyticsFilters({});
                  }}
                  style={styles.toolbarButton}
                />
              ) : null}
              <KolamButton
                disabled={controller.loading}
                label="Refresh"
                onPress={() => {
                  void controller.onSelectVendor(vendor);
                }}
                style={styles.toolbarButton}
              />
              <KolamButton
                label="Daftar"
                onPress={() => {
                  controller.onBackToList();
                  onRouteChange?.(KOLAM_SUPPLIER_ROOT);
                }}
                style={styles.toolbarButton}
              />
              <KolamButton
                intent="primary"
                label="Edit"
                onPress={() => {
                  controller.onEdit();
                  onRouteChange?.(
                    `${KOLAM_SUPPLIER_ROOT}/${vendor.id}/edit`,
                  );
                }}
                style={styles.toolbarButton}
              />
              <KolamButton
                intent="danger"
                label="Hapus"
                onPress={() => setDeleteCandidate(vendor)}
                style={styles.toolbarButton}
              />
            </View>
          </View>
        </View>

        {activeAnalyticsFilter === 'period' ? (
          <View
            style={[styles.filterOverlayPanel, styles.filterPanelAnalyticsPeriod]}
          >
            <ScrollView
              contentContainerStyle={styles.filterPanelContent}
              keyboardShouldPersistTaps="handled"
              style={styles.filterPanelScroll}
            >
              {(
                [
                  { label: 'Semua waktu', value: '' as const },
                  { label: 'Tahunan', value: 'yearly' as const },
                  { label: 'Bulanan', value: 'monthly' as const },
                ]
              ).map(option => (
                <KolamButton
                  intent={
                    (analyticsFilters.filterType ?? '') === option.value
                      ? 'primary'
                      : 'plain'
                  }
                  key={option.label}
                  label={option.label}
                  onPress={() => {
                    if (!option.value) {
                      patchAnalyticsFilters({
                        filterType: undefined,
                        month: undefined,
                      });
                    } else {
                      patchAnalyticsFilters({
                        filterType: option.value,
                        month:
                          option.value === 'yearly'
                            ? undefined
                            : analyticsFilters.month,
                        year:
                          analyticsFilters.year ?? new Date().getFullYear(),
                      });
                    }
                    setActiveAnalyticsFilter(null);
                  }}
                  style={styles.filterPanelOption}
                />
              ))}
            </ScrollView>
            <View style={styles.filterPanelFooter}>
              <KolamButton
                label="Tutup"
                onPress={() => setActiveAnalyticsFilter(null)}
              />
            </View>
          </View>
        ) : null}

        {activeAnalyticsFilter === 'year' ? (
          <View
            style={[styles.filterOverlayPanel, styles.filterPanelAnalyticsYear]}
          >
            <ScrollView
              contentContainerStyle={styles.filterPanelContent}
              keyboardShouldPersistTaps="handled"
              style={styles.filterPanelScroll}
            >
              <KolamButton
                intent={!analyticsFilters.year ? 'primary' : 'plain'}
                label="Semua tahun"
                onPress={() => {
                  patchAnalyticsFilters({ year: undefined });
                  setActiveAnalyticsFilter(null);
                }}
                style={styles.filterPanelOption}
              />
              {analyticsYears.map(year => (
                <KolamButton
                  intent={
                    analyticsFilters.year === year ? 'primary' : 'plain'
                  }
                  key={year}
                  label={String(year)}
                  onPress={() => {
                    patchAnalyticsFilters({
                      year,
                      filterType:
                        analyticsFilters.filterType ?? 'yearly',
                    });
                    setActiveAnalyticsFilter(null);
                  }}
                  style={styles.filterPanelOption}
                />
              ))}
            </ScrollView>
            <View style={styles.filterPanelFooter}>
              <KolamButton
                label="Tutup"
                onPress={() => setActiveAnalyticsFilter(null)}
              />
            </View>
          </View>
        ) : null}

        {activeAnalyticsFilter === 'month' ? (
          <View
            style={[styles.filterOverlayPanel, styles.filterPanelAnalyticsMonth]}
          >
            <ScrollView
              contentContainerStyle={styles.filterPanelContent}
              keyboardShouldPersistTaps="handled"
              style={styles.filterPanelScroll}
            >
              <KolamButton
                intent={
                  !analyticsFilters.month ||
                  analyticsFilters.filterType === 'yearly'
                    ? 'primary'
                    : 'plain'
                }
                label="Semua bulan"
                onPress={() => {
                  patchAnalyticsFilters({ month: undefined });
                  setActiveAnalyticsFilter(null);
                }}
                style={styles.filterPanelOption}
              />
              {analyticsMonths.map(month => (
                <KolamButton
                  intent={
                    analyticsFilters.month === month.id &&
                    analyticsFilters.filterType !== 'yearly'
                      ? 'primary'
                      : 'plain'
                  }
                  key={month.id}
                  label={month.name}
                  onPress={() => {
                    patchAnalyticsFilters({
                      month: month.id,
                      filterType: 'monthly',
                      year:
                        analyticsFilters.year ?? new Date().getFullYear(),
                    });
                    setActiveAnalyticsFilter(null);
                  }}
                  style={styles.filterPanelOption}
                />
              ))}
            </ScrollView>
            <View style={styles.filterPanelFooter}>
              <KolamButton
                label="Tutup"
                onPress={() => setActiveAnalyticsFilter(null)}
              />
            </View>
          </View>
        ) : null}
      </View>
      <KolamLabelFieldDetailOverview
        hero={
          heroUri ? (
            <KolamRemoteImage
              accessibilityLabel={`Foto ${vendor.name}`}
              resizeMode="cover"
              scope="vendor"
              sourceUri={heroUri}
              style={styles.heroImage}
            />
          ) : (
            <View style={styles.heroFallback}>
              <Text style={styles.heroFallbackText}>
                {vendor.name.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )
        }
        meta={[]}
        metrics={[
          {
            label: 'Total PO',
            value:
              vendor.purchaseStatistics?.overall.totalOrders ?? vendor.poCount,
          },
          {
            label: 'Nilai total',
            value: vendor.purchaseStatistics
              ? formatRupiah(vendor.purchaseStatistics.overall.totalValue)
              : '—',
          },
          {
            label: 'Rata-rata PO',
            value: vendor.purchaseStatistics
              ? formatRupiah(
                  vendor.purchaseStatistics.overall.averageOrderValue,
                )
              : '—',
          },
          {
            label: 'Pertumbuhan',
            value: vendor.purchaseStatistics
              ? `${
                  vendor.purchaseStatistics.yearly.growthRate > 0 ? '+' : ''
                }${vendor.purchaseStatistics.yearly.growthRate.toFixed(1)}%`
              : '—',
          },
        ]}
        sections={[]}
        status={{
          intent: getKolamVendorStatusIntent(vendor.status),
          label: getKolamVendorStatusLabel(vendor.status),
        }}
      />

      <View style={styles.detailInfoRow}>
        <KolamContentFrame
          style={[styles.detailCard, styles.detailInfoCard]}
          variant="settingsWebConfig"
        >
          <Text style={styles.sectionTitle}>Informasi pemasok</Text>
          <KolamDescriptionList
            accessibilityLabel="Informasi pemasok"
            rows={[
              {
                id: 'name',
                label: 'Nama',
                value: vendor.name,
                meta: '',
                tone: 'default',
              },
              {
                id: 'description',
                label: 'Deskripsi',
                value: vendor.description || '—',
                meta: '',
                tone: 'default',
              },
              {
                id: 'bank',
                label: 'Bank',
                value: vendor.bankName || '—',
                meta: vendor.bankAccountNumber || '',
                tone: 'default',
              },
              {
                id: 'warranty',
                label: 'Catatan garansi',
                value: vendor.warrantyContactNote || '—',
                meta: '',
                tone: 'default',
              },
              ...(vendor.isOfficialDistributor
                ? [
                    {
                      id: 'distributor',
                      label: 'Distributor',
                      value: 'Resmi',
                      meta: '',
                      tone: 'default' as const,
                    },
                  ]
                : []),
            ]}
          />
        </KolamContentFrame>

        <KolamContentFrame
          style={[styles.detailCard, styles.detailInfoCard]}
          variant="settingsWebConfig"
        >
          <Text style={styles.sectionTitle}>Kontak</Text>
          <KolamDescriptionList
            accessibilityLabel="Kontak pemasok"
            rows={[
              {
                id: 'phone',
                label: 'Telepon',
                value: vendor.phone || '—',
                meta: '',
                tone: 'default',
              },
              {
                id: 'email',
                label: 'Email',
                value: vendor.email || '—',
                meta: '',
                tone: 'default',
              },
              {
                id: 'address',
                label: 'Alamat',
                value: address || '—',
                meta: '',
                tone: 'default',
              },
              {
                id: 'created-by',
                label: 'Dibuat oleh',
                value: vendor.createdByName || '—',
                meta: '',
                tone: 'default',
              },
            ]}
          />
        </KolamContentFrame>

        <KolamSupplierTaxProfileCard
          controller={controller}
          style={[styles.detailCard, styles.detailInfoCard]}
        />
      </View>

      <KolamSupplierCatalogTabs
        controller={controller}
        onRouteChange={onRouteChange}
        vendor={vendor}
      />

      {photoUrls.length > 1 ? (
        <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
          <Text style={styles.sectionTitle}>Foto</Text>
          <View style={styles.photoGrid}>
            {photoUrls.map((uri, index) => (
              <KolamRemoteImage
                key={`${uri}-${index}`}
                accessibilityLabel={`Foto pemasok ${index + 1}`}
                resizeMode="cover"
                scope="vendor"
                sourceUri={uri}
                style={styles.photoThumb}
              />
            ))}
          </View>
        </KolamContentFrame>
      ) : null}

      <KolamDeleteConfirmDialog
        itemLabel={deleteCandidate?.name}
        itemType="pemasok"
        visible={Boolean(deleteCandidate)}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          const target = deleteCandidate;
          setDeleteCandidate(null);
          if (!target) {
            return;
          }
          void controller.onDeleteVendor(target).then(deleted => {
            if (deleted) {
              onRouteChange?.(KOLAM_SUPPLIER_ROOT);
            }
          });
        }}
      />
    </View>
  );
}

function KolamSupplierCatalogTabs({
  controller,
  onRouteChange,
  vendor,
}: {
  controller: KolamSupplierController;
  onRouteChange?: (route: string) => void;
  vendor: KolamVendor;
}) {
  const [tab, setTab] = React.useState<KolamSupplierCatalogTab>('analytics');
  const products = vendor.products ?? [];
  const species = vendor.species ?? [];
  const packings = vendor.packings ?? [];
  const brands = vendor.brands ?? [];
  const links = vendor.links ?? [];
  const purchaseStats =
    vendor.purchaseStatistics?.productStats ?? [];
  const productRows = React.useMemo(
    () => flattenKolamSupplierProductRows(products, vendor.id),
    [products, vendor.id],
  );
  const speciesRows = React.useMemo(
    () => flattenKolamSupplierSpeciesRows(species, vendor.id),
    [species, vendor.id],
  );
  const productPurchaseRows = React.useMemo(
    () =>
      mergeCatalogRowsWithPurchaseStats(
        productRows.map(row => ({
          key: row.key,
          id: row.productId,
          title: row.title,
          code: row.code,
          meta: [row.code || null, row.brandLabel || null]
            .filter(Boolean)
            .join(' · '),
          photoUrl: row.photoUrl,
          price: row.vendorPrice,
          isVariantRow: false,
          onPress: () => onRouteChange?.(`/products/${row.productId}`),
        })),
        purchaseStats,
        { appendUnmatched: true },
      ),
    [onRouteChange, productRows, purchaseStats],
  );
  const speciesPurchaseRows = React.useMemo(
    () =>
      mergeCatalogRowsWithPurchaseStats(
        speciesRows.map(row => ({
          key: row.key,
          id: row.speciesId,
          title: row.title,
          code: row.code,
          meta: [row.code || null, row.commonName || null]
            .filter(Boolean)
            .join(' · '),
          photoUrl: row.photoUrl,
          price: row.vendorPrice,
          isVariantRow: false,
          italic: true,
          onPress: () => onRouteChange?.(`/species/${row.speciesId}`),
        })),
        purchaseStats,
      ),
    [onRouteChange, purchaseStats, speciesRows],
  );
  const packingPurchaseRows = React.useMemo(
    () =>
      mergeCatalogRowsWithPurchaseStats(
        packings.map(packing => ({
          key: packing.id,
          id: packing.id,
          title: packing.name,
          code: '',
          meta: [
            packing.category || null,
            `Stok ${packing.stock}`,
            packing.cost > 0 ? `HPP ${formatRupiah(packing.cost)}` : null,
          ]
            .filter(Boolean)
            .join(' · '),
          photoUrl: '',
          price: packing.price,
          isVariantRow: false,
          onPress: () =>
            onRouteChange?.(`/packing-materials/${packing.id}`),
        })),
        purchaseStats,
      ),
    [onRouteChange, packings, purchaseStats],
  );

  const [catalogPageSize, setCatalogPageSize] = React.useState(10);
  const [catalogPage, setCatalogPage] = React.useState(1);
  const activeCatalogRows =
    tab === 'products'
      ? productPurchaseRows
      : tab === 'species'
        ? speciesPurchaseRows
        : tab === 'packings'
          ? packingPurchaseRows
          : null;
  const catalogTotal = activeCatalogRows?.length ?? 0;
  const catalogPageCount = Math.max(
    1,
    Math.ceil(catalogTotal / catalogPageSize),
  );
  const safeCatalogPage = Math.min(catalogPage, catalogPageCount);
  const pagedCatalogRows = activeCatalogRows
    ? activeCatalogRows.slice(
        (safeCatalogPage - 1) * catalogPageSize,
        safeCatalogPage * catalogPageSize,
      )
    : [];
  const catalogRowScope: 'product' | 'species' =
    tab === 'species' ? 'species' : 'product';

  React.useEffect(() => {
    setCatalogPage(1);
  }, [tab, catalogPageSize, vendor.id]);

  return (
    <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
      <Text style={styles.sectionTitle}>Katalog pemasok</Text>
      <View style={styles.segmentRow}>
        {(
          [
            {
              id: 'analytics',
              label: 'Analitik',
            },
            {
              id: 'products',
              label: `Produk & Raw (${vendor.productCount})`,
            },
            {
              id: 'species',
              label: `Species (${vendor.speciesCount})`,
            },
            {
              id: 'packings',
              label: `Bahan Kemasan / Packing (${vendor.packingCount})`,
            },
            {
              id: 'brands',
              label: 'Merek',
            },
            {
              id: 'links',
              label: 'Tautan',
            },
          ] as const
        ).map(item => (
          <KolamButton
            intent={tab === item.id ? 'primary' : 'outline'}
            key={item.id}
            label={item.label}
            onPress={() => setTab(item.id)}
          />
        ))}
      </View>

      {tab === 'analytics' ? (
        <KolamSupplierPurchaseAnalytics controller={controller} embedded />
      ) : null}

      {activeCatalogRows ? (
        catalogTotal ? (
          <View style={styles.catalogTableBlock}>
            <View style={styles.catalogTable}>
              <KolamDataTableHeader
                columns={getKolamTableColumns('supplier-catalog')}
              />
              {pagedCatalogRows.map(row => (
                <SupplierCatalogPurchaseRow
                  key={row.key}
                  row={row}
                  scope={catalogRowScope}
                />
              ))}
            </View>
            <KolamTableFooterControls
              onPageSizeChange={setCatalogPageSize}
              page={safeCatalogPage}
              pageSize={catalogPageSize}
              total={catalogTotal}
            >
              {catalogPageCount > 1 ? (
                <View style={styles.paginationRow}>
                  <KolamButton
                    disabled={safeCatalogPage <= 1}
                    label="Sebelumnya"
                    onPress={() =>
                      setCatalogPage(current => Math.max(1, current - 1))
                    }
                  />
                  <KolamCopyStack
                    items={[
                      {
                        id: 'catalog-page',
                        text: `${safeCatalogPage} / ${catalogPageCount}`,
                        style: styles.pageLabel,
                      },
                    ]}
                  />
                  <KolamButton
                    disabled={safeCatalogPage >= catalogPageCount}
                    label="Berikutnya"
                    onPress={() =>
                      setCatalogPage(current =>
                        Math.min(catalogPageCount, current + 1),
                      )
                    }
                  />
                </View>
              ) : null}
            </KolamTableFooterControls>
          </View>
        ) : (
          <KolamEmptyState
            compact
            message={
              tab === 'products'
                ? 'Belum ada produk atau bahan baku tertaut ke pemasok ini.'
                : tab === 'species'
                  ? 'Belum ada species tertaut ke pemasok ini.'
                  : 'Belum ada bahan kemasan / packing dari pemasok ini.'
            }
            title={
              tab === 'products'
                ? 'Tidak ada produk'
                : tab === 'species'
                  ? 'Tidak ada species'
                  : 'Tidak ada packing'
            }
          />
        )
      ) : null}

      {tab === 'brands' ? (
        brands.length ? (
          <View style={styles.brandChipRow}>
            {brands.map(brand => (
              <KolamButton
                key={brand.id}
                label={brand.name}
                muted
                onPress={() => onRouteChange?.(`/brands/${brand.id}`)}
                style={styles.brandChip}
              />
            ))}
          </View>
        ) : (
          <KolamEmptyState
            compact
            message="Belum ada merek tertaut."
            title="Tidak ada merek"
          />
        )
      ) : null}

      {tab === 'links' ? (
        links.length ? (
          <View style={styles.catalogList}>
            {links.map((link, index) => (
              <View key={`${link}-${index}`} style={styles.catalogRow}>
                <View style={styles.catalogCopy}>
                  <Text numberOfLines={2} style={styles.catalogTitle}>
                    {link}
                  </Text>
                  <Text style={styles.rowMeta}>Tautan {index + 1}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <KolamEmptyState
            compact
            message="Belum ada tautan."
            title="Tidak ada tautan"
          />
        )
      ) : null}
    </KolamContentFrame>
  );
}

function KolamSupplierTaxProfileCard({
  controller,
  style,
}: {
  controller: KolamSupplierController;
  style?: React.ComponentProps<typeof KolamContentFrame>['style'];
}) {
  const { authUser } = useKolamAuthContext();
  const canEdit = canEditKolamTaxPartyProfile({
    roleKey: authUser?.roleKey,
    permissions: authUser?.permissions,
  });
  const form = controller.taxProfile;
  const hasNpwp =
    controller.taxProfileLoaded && hasKolamTaxPartyNpwp(form);

  return (
    <KolamContentFrame
      style={style ?? styles.detailCard}
      variant="settingsWebConfig"
    >
      <View style={styles.taxHeader}>
        <Text style={styles.sectionTitle}>Profil pajak</Text>
        {controller.taxProfileLoaded ? (
          <KolamStatusBadge
            intent={hasNpwp ? 'success' : 'warning'}
            label={hasNpwp ? 'NPWP tercatat' : 'Belum NPWP'}
          />
        ) : null}
      </View>

      {!controller.taxProfileLoaded ? (
        <KolamEmptyState
          compact
          message="Memuat profil pajak dari Dara Tax…"
          title="Memuat NPWP"
        />
      ) : (
        <View style={settingsWebFormStyles.settingsWebFormFields}>
          <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
            <FieldShell label="NPWP 15 digit">
              <KolamFormTextField
                editable={canEdit && !controller.taxProfileSaving}
                mode="numeric"
                onChangeText={npwp =>
                  controller.onChangeTaxProfile({ npwp })
                }
                placeholder="15 digit"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.npwp}
              />
            </FieldShell>
            <FieldShell label="NPWP 16 digit">
              <KolamFormTextField
                editable={canEdit && !controller.taxProfileSaving}
                mode="numeric"
                onChangeText={npwp16 =>
                  controller.onChangeTaxProfile({ npwp16 })
                }
                placeholder="16 digit"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.npwp16}
              />
            </FieldShell>
            <FieldShell label="Nama legal (faktur)">
              <KolamFormTextField
                editable={canEdit && !controller.taxProfileSaving}
                onChangeText={legalName =>
                  controller.onChangeTaxProfile({ legalName })
                }
                placeholder="Nama legal untuk faktur"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.legalName}
              />
            </FieldShell>
          </View>
          {canEdit ? (
            <View style={styles.formActions}>
              <KolamButton
                disabled={controller.taxProfileSaving}
                intent="primary"
                label={
                  controller.taxProfileSaving ? 'Menyimpan…' : 'Simpan NPWP'
                }
                onPress={() => {
                  void controller.onSaveTaxProfile();
                }}
              />
            </View>
          ) : (
            <Text style={styles.switchHint}>
              Mode baca saja — butuh permission tax:draft.
            </Text>
          )}
        </View>
      )}
    </KolamContentFrame>
  );
}

function KolamSupplierPurchaseAnalytics({
  controller,
  embedded = false,
}: {
  controller: KolamSupplierController;
  embedded?: boolean;
}) {
  const stats = controller.selectedVendor?.purchaseStatistics ?? null;
  const monthlyTrendPoints = React.useMemo(
    () =>
      buildDashboardSalesGraphPoints(
        buildKolamSupplierMonthlyTrendGraphItems(
          stats?.yearly.monthlyStatistics,
        ),
      ),
    [stats?.yearly.monthlyStatistics],
  );

  const body = (
    <View style={styles.analyticsStack}>
      {embedded ? null : (
        <Text style={styles.sectionTitle}>Analitik pembelian</Text>
      )}

      {controller.analyticsLoading ? (
        <KolamEmptyState
          compact
          message="Memuat ulang statistik pembelian…"
          title="Memuat analitik"
        />
      ) : !hasKolamVendorPurchaseAnalytics(stats) ? (
        <KolamEmptyState
          compact
          message="Belum ada purchase order untuk filter ini."
          title="Tidak ada data pembelian"
        />
      ) : stats ? (
        <View style={styles.analyticsBlock}>
          <Text style={styles.sectionTitle}>
            Tren bulanan ({stats.yearly.year})
          </Text>
          <Text style={styles.switchHint}>
            Nilai pembelian (IDR) per bulan
          </Text>
          {monthlyTrendPoints.length ? (
            <View style={styles.trendChartFrame}>
              <KolamDashboardSalesGraphPlot points={monthlyTrendPoints} />
            </View>
          ) : (
            <KolamEmptyState
              compact
              message="Belum ada tren bulanan untuk tahun ini."
              title="Grafik kosong"
            />
          )}
        </View>
      ) : null}
    </View>
  );

  if (embedded) {
    return body;
  }

  return (
    <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
      {body}
    </KolamContentFrame>
  );
}

function formatSupplierDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

type SupplierCatalogPurchaseRowData = {
  key: string;
  id: string;
  title: string;
  code: string;
  meta: string;
  photoUrl: string;
  price: number | null;
  isVariantRow: boolean;
  italic?: boolean;
  onPress?: () => void;
  purchase?: KolamVendorPurchaseProductStat | null;
};

function mergeCatalogRowsWithPurchaseStats(
  rows: Omit<SupplierCatalogPurchaseRowData, 'purchase'>[],
  purchaseStats: KolamVendorPurchaseProductStat[],
  options?: { appendUnmatched?: boolean },
): SupplierCatalogPurchaseRowData[] {
  const used = new Set<string>();
  const merged = rows.map(row => {
    const purchase = findPurchaseStatForCatalogRow(purchaseStats, row);
    if (purchase) {
      used.add(purchase.id);
    }
    return { ...row, purchase };
  });

  if (!options?.appendUnmatched) {
    return merged;
  }

  purchaseStats.forEach(stat => {
    if (used.has(stat.id)) {
      return;
    }
    const alreadyListed = merged.some(
      row =>
        row.id === stat.id ||
        (row.code &&
          stat.productSku &&
          row.code.toLowerCase() === stat.productSku.toLowerCase()) ||
        row.title.toLowerCase() === stat.productName.toLowerCase(),
    );
    if (alreadyListed) {
      return;
    }
    merged.push({
      key: `purchase-${stat.id}`,
      id: stat.id,
      title: stat.productName,
      code: stat.productSku,
      meta: stat.productSku ? `SKU ${stat.productSku}` : '',
      photoUrl: '',
      price: null,
      isVariantRow: false,
      purchase: stat,
    });
  });

  return merged;
}

function findPurchaseStatForCatalogRow(
  purchaseStats: KolamVendorPurchaseProductStat[],
  row: { id: string; title: string; code: string },
) {
  const byId = purchaseStats.find(stat => stat.id === row.id);
  if (byId) {
    return byId;
  }
  if (row.code) {
    const bySku = purchaseStats.find(
      stat =>
        stat.productSku &&
        stat.productSku.toLowerCase() === row.code.toLowerCase(),
    );
    if (bySku) {
      return bySku;
    }
  }
  return (
    purchaseStats.find(
      stat =>
        stat.productName.trim().toLowerCase() ===
        row.title.trim().toLowerCase(),
    ) ?? null
  );
}

function SupplierCatalogPurchaseRow({
  row,
  scope,
}: {
  row: SupplierCatalogPurchaseRowData;
  scope: 'product' | 'species';
}) {
  const harga =
    row.price != null
      ? formatRupiah(row.price)
      : row.purchase?.averagePrice
      ? formatRupiah(row.purchase.averagePrice)
      : '—';
  const totalOrder = row.purchase
    ? String(row.purchase.orderCount)
    : '—';
  const totalValue = row.purchase
    ? formatRupiah(row.purchase.totalValue)
    : '—';
  const lastPurchase = row.purchase?.lastPurchase
    ? formatSupplierDateTime(row.purchase.lastPurchase)
    : '—';

  return (
    <KolamDataTableRowFrame
      style={row.isVariantRow ? styles.catalogTableRowVariant : undefined}
    >
      <Pressable
        onPress={row.onPress}
        style={[styles.cell, styles.primaryCell]}
      >
        <View style={styles.identity}>
          {row.isVariantRow ? (
            <Text style={styles.catalogVariantMark}>↳</Text>
          ) : row.photoUrl ? (
            <KolamRemoteImage
              accessibilityLabel={row.title}
              resizeMode="cover"
              scope={scope}
              sourceUri={row.photoUrl}
              style={styles.thumb}
            />
          ) : (
            <View style={styles.thumbFallback}>
              <Text style={styles.thumbFallbackText}>
                {row.title.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
          <KolamCopyStack
            containerStyle={styles.identityCopy}
            items={[
              {
                id: 'name',
                text: row.title,
                style: [
                  styles.rowTitle,
                  row.isVariantRow ? styles.catalogVariantTitle : null,
                  row.italic ? styles.catalogItalic : null,
                ],
              },
              ...(row.meta
                ? [
                    {
                      id: 'meta',
                      text: row.meta,
                      style: styles.rowMeta,
                    },
                  ]
                : []),
            ]}
          />
        </View>
      </Pressable>
      <View style={[styles.cell, { width: 120 }]}>
        <Text style={styles.numText}>{harga}</Text>
      </View>
      <View style={[styles.cell, { width: 110 }]}>
        <Text style={styles.numText}>{totalOrder}</Text>
      </View>
      <View style={[styles.cell, { width: 140 }]}>
        <Text style={styles.numText}>{totalValue}</Text>
      </View>
      <View style={[styles.cell, { width: 140 }]}>
        <Text numberOfLines={2} style={styles.cellText}>
          {lastPurchase}
        </Text>
      </View>
    </KolamDataTableRowFrame>
  );
}

function KolamSupplierForm({
  controller,
  onRouteChange,
}: {
  controller: KolamSupplierController;
  onRouteChange?: (route: string) => void;
}) {
  const form = controller.form;
  const selectedBrands = controller.brands.filter(brand =>
    form.brandIds.includes(brand.id),
  );
  const brandOptions = controller.brands.filter(
    brand => !form.brandIds.includes(brand.id),
  );

  return (
    <KolamNativeFormSection section={getKolamFormSection('supplier-detail')}>
      <View style={settingsWebFormStyles.settingsWebFormFields}>
        <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
          <FieldShell label="Nama pemasok" required>
            <KolamFormTextField
              editable={!controller.saving}
              onChangeText={name => controller.onChangeForm({ name })}
              placeholder="Nama perusahaan / pemasok"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={form.name}
            />
          </FieldShell>

          <View style={styles.formSplitRow}>
            <View style={styles.formSplitCell}>
              <FieldShell label="Telepon">
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={phone => controller.onChangeForm({ phone })}
                  placeholder="Nomor telepon"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.phone}
                />
              </FieldShell>
            </View>
            <View style={styles.formSplitCell}>
              <FieldShell label="Email">
                <KolamFormTextField
                  editable={!controller.saving}
                  mode="email"
                  onChangeText={email => controller.onChangeForm({ email })}
                  placeholder="email@contoh.com"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.email}
                />
              </FieldShell>
            </View>
          </View>

          <FieldShell label="Deskripsi">
            <KolamFormTextField
              editable={!controller.saving}
              multiline
              onChangeText={description =>
                controller.onChangeForm({ description })
              }
              placeholder="Deskripsi singkat"
              style={[
                settingsWebFormStyles.settingsWebFormFieldValue,
                settingsWebFormStyles.settingsWebFormFieldValueTextarea,
              ]}
              value={form.description}
            />
          </FieldShell>

          <FieldShell label="Alamat">
            <KolamFormTextField
              editable={!controller.saving}
              multiline
              onChangeText={address => controller.onChangeForm({ address })}
              placeholder="Alamat lengkap"
              style={[
                settingsWebFormStyles.settingsWebFormFieldValue,
                settingsWebFormStyles.settingsWebFormFieldValueTextarea,
              ]}
              value={form.address}
            />
          </FieldShell>

          <View style={styles.formSplitRow}>
            <View style={styles.formSplitCell}>
              <FieldShell label="Kota">
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={city => controller.onChangeForm({ city })}
                  placeholder="Kota"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.city}
                />
              </FieldShell>
            </View>
            <View style={styles.formSplitCell}>
              <FieldShell label="Provinsi">
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={province =>
                    controller.onChangeForm({ province })
                  }
                  placeholder="Provinsi"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.province}
                />
              </FieldShell>
            </View>
          </View>

          <View style={styles.formSplitRow}>
            <View style={styles.formSplitCell}>
              <FieldShell label="Negara bagian / state">
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={state => controller.onChangeForm({ state })}
                  placeholder="State"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.state}
                />
              </FieldShell>
            </View>
            <View style={styles.formSplitCell}>
              <FieldShell label="Kode pos">
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={postalCode =>
                    controller.onChangeForm({ postalCode })
                  }
                  placeholder="Kode pos"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.postalCode}
                />
              </FieldShell>
            </View>
          </View>

          <FieldShell label="Negara">
            <KolamFormTextField
              editable={!controller.saving}
              onChangeText={country => controller.onChangeForm({ country })}
              placeholder="Indonesia"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={form.country}
            />
          </FieldShell>

          <View style={styles.formSplitRow}>
            <View style={styles.formSplitCell}>
              <FieldShell label="Bank">
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={bankName =>
                    controller.onChangeForm({ bankName })
                  }
                  placeholder="Nama bank"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.bankName}
                />
              </FieldShell>
            </View>
            <View style={styles.formSplitCell}>
              <FieldShell label="Nomor rekening">
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={bankAccountNumber =>
                    controller.onChangeForm({ bankAccountNumber })
                  }
                  placeholder="Nomor rekening"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.bankAccountNumber}
                />
              </FieldShell>
            </View>
          </View>

          <FieldShell label="Status" required>
            <View style={styles.segmentRow}>
              {(
                ['active', 'inactive', 'blacklisted'] as KolamVendorStatus[]
              ).map(status => (
                <KolamButton
                  intent={form.status === status ? 'primary' : 'outline'}
                  key={status}
                  label={getKolamVendorStatusLabel(status)}
                  onPress={() => controller.onChangeForm({ status })}
                />
              ))}
            </View>
          </FieldShell>

          <FieldShell label="Distributor resmi">
            <View style={styles.switchRow}>
              <Text style={styles.switchHint}>
                Tandai jika pemasok adalah distributor resmi merek.
              </Text>
              <KolamSwitch
                active={form.isOfficialDistributor}
                disabled={controller.saving}
                onPress={() =>
                  controller.onChangeForm({
                    isOfficialDistributor: !form.isOfficialDistributor,
                  })
                }
              />
            </View>
          </FieldShell>

          {form.isOfficialDistributor ? (
            <FieldShell label="Catatan kontak garansi">
              <KolamFormTextField
                editable={!controller.saving}
                multiline
                onChangeText={warrantyContactNote =>
                  controller.onChangeForm({ warrantyContactNote })
                }
                placeholder="Kontak / catatan garansi"
                style={[
                  settingsWebFormStyles.settingsWebFormFieldValue,
                  settingsWebFormStyles.settingsWebFormFieldValueTextarea,
                ]}
                value={form.warrantyContactNote}
              />
            </FieldShell>
          ) : null}

          <FieldShell label="Merek">
            <View style={styles.brandPicker}>
              {selectedBrands.length ? (
                <View style={styles.brandChipRow}>
                  {selectedBrands.map(brand => (
                    <KolamButton
                      key={brand.id}
                      label={`× ${brand.name}`}
                      muted
                      onPress={() =>
                        controller.onChangeForm({
                          brandIds: form.brandIds.filter(id => id !== brand.id),
                        })
                      }
                      style={styles.brandChip}
                    />
                  ))}
                </View>
              ) : (
                <Text style={styles.switchHint}>Belum ada merek dipilih.</Text>
              )}
              <KolamDropdownSelect
                label="Tambah merek"
                onChange={brandId => {
                  if (!brandId || form.brandIds.includes(brandId)) {
                    return;
                  }
                  controller.onChangeForm({
                    brandIds: [...form.brandIds, brandId],
                  });
                }}
                options={[
                  { label: 'Pilih merek…', value: '' },
                  ...brandOptions.map(brand => ({
                    label: brand.name,
                    value: brand.id,
                  })),
                ]}
                searchable
                searchPlaceholder="Cari merek…"
                showLabelInTrigger={false}
                value=""
              />
            </View>
          </FieldShell>

          <FieldShell label="Tautan">
            <KolamFormTextField
              editable={!controller.saving}
              multiline
              onChangeText={linkText => controller.onChangeForm({ linkText })}
              placeholder="Satu tautan per baris"
              style={[
                settingsWebFormStyles.settingsWebFormFieldValue,
                settingsWebFormStyles.settingsWebFormFieldValueTextarea,
              ]}
              value={form.linkText}
            />
          </FieldShell>

          <FieldShell label="Foto">
            <View style={styles.photoEditor}>
              <Text style={styles.switchHint}>
                Pilih hingga 5 foto baru. Foto tersimpan dihapus langsung; foto baru diunggah saat Simpan.
              </Text>
              <KolamButton
                disabled={
                  controller.saving || controller.pendingPhotoUris.length >= 5
                }
                label="Tambah foto"
                onPress={() => {
                  void controller.onPickPhoto();
                }}
              />
              {controller.pendingPhotoUris.length ? (
                <View style={styles.photoGrid}>
                  {controller.pendingPhotoUris.map((uri, index) => (
                    <View key={`pending-${uri}-${index}`} style={styles.photoItem}>
                      <Image
                        accessibilityLabel={`Foto baru ${index + 1}`}
                        resizeMode="cover"
                        source={{ uri: toLocalImageUri(uri) }}
                        style={styles.photoThumb}
                      />
                      <KolamButton
                        disabled={controller.saving}
                        intent="danger"
                        label="Buang"
                        onPress={() => controller.onRemovePendingPhoto(index)}
                        style={styles.photoRemove}
                      />
                    </View>
                  ))}
                </View>
              ) : null}
              {controller.selectedVendor?.photoUrls.length ? (
                <View style={styles.photoGrid}>
                  {controller.selectedVendor.photoUrls.map((uri, index) => (
                    <View key={`existing-${uri}-${index}`} style={styles.photoItem}>
                      <KolamRemoteImage
                        accessibilityLabel={`Foto tersimpan ${index + 1}`}
                        resizeMode="cover"
                        scope="vendor"
                        sourceUri={uri}
                        style={styles.photoThumb}
                      />
                      <KolamButton
                        disabled={controller.saving}
                        intent="danger"
                        label="Hapus"
                        onPress={() => {
                          void controller.onDeleteExistingPhoto(index);
                        }}
                        style={styles.photoRemove}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.switchHint}>
                  Belum ada foto tersimpan untuk pemasok ini.
                </Text>
              )}
            </View>
          </FieldShell>
        </View>

        <View style={styles.formActions}>
          <KolamButton
            disabled={controller.saving}
            label="Batal"
            onPress={() => {
              controller.onBackToList();
              onRouteChange?.(KOLAM_SUPPLIER_ROOT);
            }}
          />
          <KolamButton
            disabled={controller.saving}
            intent="primary"
            label={controller.saving ? 'Menyimpan…' : 'Simpan'}
            onPress={() => {
              void controller.onSave().then(id => {
                if (id) {
                  onRouteChange?.(`${KOLAM_SUPPLIER_ROOT}/${id}`);
                }
              });
            }}
          />
        </View>
      </View>
    </KolamNativeFormSection>
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

function toLocalImageUri(uri: string) {
  if (uri.startsWith('file://') || uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri;
  }
  return `file:///${uri.replace(/\\/g, '/')}`;
}

function filterVendors(
  vendors: KolamVendor[],
  search: string,
  status: SupplierStatusFilter,
) {
  const query = search.trim().toLowerCase();
  return vendors.filter(vendor => {
    if (status !== 'all' && vendor.status !== status) {
      return false;
    }
    if (!query) {
      return true;
    }
    return [
      vendor.name,
      vendor.phone,
      vendor.email,
      vendor.city,
      vendor.country,
      vendor.province,
    ]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
}

function sortVendors(vendors: KolamVendor[], mode: SupplierSortMode) {
  const next = [...vendors];
  next.sort((left, right) => {
    switch (mode) {
      case 'name-desc':
        return right.name.localeCompare(left.name, 'id');
      case 'po-desc':
        return right.poCount - left.poCount;
      case 'newest':
        return (right.createdAt || '').localeCompare(left.createdAt || '');
      case 'name-asc':
      default:
        return left.name.localeCompare(right.name, 'id');
    }
  });
  return next;
}

function fitSupplierListColumns(containerWidth: number): KolamTableColumn[] {
  return fitKolamDataTableColumns(
    getKolamTableColumns('supplier'),
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

const styles = StyleSheet.create({
  surface: {
    gap: 14,
  },
  detailSurface: {
    gap: 14,
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
  listSurface: {
    flex: 1,
    minHeight: 0,
    overflow: 'visible',
  },
  listRoot: {
    flex: 1,
    gap: 14,
    minHeight: 0,
    overflow: 'visible',
  },
  toolbarWrap: {
    elevation: 1000,
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
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    top: 48,
    width: 240,
    zIndex: 120000,
  },
  filterPanelStatus: {
    left: 148,
  },
  filterPanelSort: {
    left: 280,
  },
  filterPanelAnalyticsPeriod: {
    left: 4,
  },
  filterPanelAnalyticsYear: {
    left: 140,
  },
  filterPanelAnalyticsMonth: {
    left: 276,
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
    zIndex: 2,
  },
  listFlatList: {
    flexGrow: 0,
    overflow: 'visible',
  },
  listContent: {
    flexGrow: 0,
    overflow: 'visible',
  },
  listContentMenuOpen: {
    paddingBottom: 140,
  },
  errorBadge: {
    alignSelf: 'stretch',
  },
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyWrap: {
    padding: 16,
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
  centerBadge: {
    alignSelf: 'center',
  },
  actionsTrack: {
    alignItems: 'center',
  },
  cell: {
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  primaryCell: {
    flex: 1,
  },
  identity: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
  },
  thumb: {
    borderRadius: 6,
    height: 36,
    width: 36,
  },
  thumbFallback: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderRadius: 6,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  thumbFallbackText: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '700',
  },
  rowTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'left',
  },
  rowMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    textAlign: 'left',
  },
  cellText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    textAlign: 'center',
    width: '100%',
  },
  numText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
  },
  activeActionRow: {
    elevation: 96,
    overflow: 'visible',
    zIndex: 9000,
  },
  detailActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailInfoCard: {
    flexGrow: 1,
    flexBasis: 280,
    minWidth: 260,
  },
  detailCard: {
    gap: 8,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
  },
  heroImage: {
    borderRadius: 10,
    height: 120,
    width: 120,
  },
  heroFallback: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderRadius: 10,
    height: 120,
    justifyContent: 'center',
    width: 120,
  },
  heroFallbackText: {
    color: V.colors.fg,
    fontSize: 36,
    fontWeight: '700',
  },
  brandChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  brandChip: {
    minHeight: 32,
  },
  brandPicker: {
    gap: 8,
  },
  catalogList: {
    gap: 6,
  },
  catalogTable: {
    gap: 0,
    overflow: 'visible',
    width: '100%',
  },
  catalogTableBlock: {
    gap: 8,
    width: '100%',
  },
  catalogTableRowVariant: {
    backgroundColor: V.colors.muted,
  },
  catalogRow: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  catalogRowVariant: {
    backgroundColor: V.colors.muted,
    marginLeft: 18,
  },
  catalogThumb: {
    borderRadius: 6,
    height: 36,
    width: 36,
  },
  catalogThumbFallback: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderRadius: 6,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  catalogVariantMark: {
    color: V.colors.mutedFg,
    fontSize: 14,
    textAlign: 'center',
    width: 36,
  },
  catalogCopy: {
    flex: 1,
    minWidth: 0,
  },
  catalogTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
  },
  catalogVariantTitle: {
    fontWeight: '500',
  },
  catalogItalic: {
    fontStyle: 'italic',
  },
  catalogPrice: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '600',
  },
  analyticsStack: {
    gap: 12,
  },
  analyticsBlock: {
    gap: 8,
  },
  trendChartFrame: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  taxHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoThumb: {
    borderRadius: 8,
    height: 88,
    width: 120,
  },
  photoEditor: {
    gap: 8,
  },
  photoItem: {
    gap: 6,
    width: 120,
  },
  photoRemove: {
    minHeight: 30,
  },
  formSplitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formSplitCell: {
    flexGrow: 1,
    minWidth: 220,
  },
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  switchHint: {
    color: V.colors.mutedFg,
    flex: 1,
    fontSize: 13,
  },
  formActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
});
