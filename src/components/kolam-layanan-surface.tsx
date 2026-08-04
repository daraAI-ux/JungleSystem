import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  buildKolamLayananOpsKpiCards,
  formatKolamLayananUnitPrice,
  getKolamLayananCapacityStatusIntent,
  getKolamLayananCapacityStatusLabel,
  getKolamLayananPendingStatusLabel,
  getKolamLayananSubscriptionStatusIntent,
  getKolamLayananSubscriptionStatusLabel,
  getKolamLayananTaskTypeLabel,
  KOLAM_LAYANAN_LIST_TABS,
  KOLAM_LAYANAN_ROOT,
  KOLAM_LAYANAN_SUBSCRIPTION_STATUS_OPTIONS,
  type KolamLayananCapacitySlot,
  type KolamLayananOpsAlert,
  type KolamLayananOpsDashboard,
  type KolamLayananPendingService,
  type KolamLayananService,
  type KolamLayananSubscription,
} from '../domain/kolam-layanan';
import { type KolamTableColumn } from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamLayananController,
  type KolamLayananController,
} from '../hooks/use-kolam-layanan-controller';
import { KolamButton } from './kolam-button';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamContentFrame } from './kolam-content-frame';
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
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamLayananExecutionDetail } from './kolam-layanan-execution-detail';
import { KolamLayananServiceEditor } from './kolam-layanan-service-editor';
import { KolamLayananSubscriptionDetail } from './kolam-layanan-subscription-detail';
import { KolamLayananVoucherDetail } from './kolam-layanan-voucher-detail';
import { KolamSearchField } from './kolam-search-field';
import { KolamStatsCardStrip } from './kolam-stats-card-strip';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

const WEEKDAY_HEADERS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const SERVICE_COLUMNS: KolamTableColumn[] = [
  { id: 'primary', label: 'Nama', align: 'left', width: 180 },
  { id: 'meta', label: 'SKU', align: 'left', width: 110 },
  { id: 'children', label: 'Kode paket', align: 'left', width: 110 },
  { id: 'products', label: 'Merek', align: 'left', width: 130 },
  { id: 'status', label: 'Tipe', align: 'left', width: 110 },
  { id: 'notes', label: 'Jual m³', align: 'right', width: 90 },
  { id: 'marketplace', label: 'Jual km', align: 'right', width: 90 },
  {
    id: 'actions',
    label: '',
    align: 'right',
    width: KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  },
];

const PENDING_COLUMNS: KolamTableColumn[] = [
  { id: 'primary', label: 'Voucher', align: 'left', width: 140 },
  { id: 'meta', label: 'Invoice', align: 'left', width: 120 },
  { id: 'children', label: 'Paket', align: 'left', width: 160 },
  { id: 'products', label: 'Pelanggan', align: 'left', width: 140 },
  { id: 'status', label: 'Status', align: 'left', width: 130 },
  {
    id: 'actions',
    label: '',
    align: 'right',
    width: KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  },
];

const SUBSCRIPTION_COLUMNS: KolamTableColumn[] = [
  { id: 'primary', label: 'Nomor', align: 'left', width: 130 },
  { id: 'meta', label: 'Pelanggan', align: 'left', width: 140 },
  { id: 'children', label: 'Paket', align: 'left', width: 160 },
  { id: 'products', label: 'Voucher', align: 'left', width: 120 },
  { id: 'status', label: 'Periode', align: 'left', width: 150 },
  { id: 'notes', label: 'Status', align: 'left', width: 120 },
  { id: 'marketplace', label: 'Auto', align: 'left', width: 70 },
  {
    id: 'actions',
    label: '',
    align: 'right',
    width: KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  },
];

export function KolamLayananSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamLayananController(route);

  if (controller.mode === 'voucher') {
    return (
      <KolamLayananVoucherDetail
        onRouteChange={onRouteChange}
        route={route}
      />
    );
  }

  if (controller.mode === 'execution') {
    return (
      <KolamLayananExecutionDetail
        onRouteChange={onRouteChange}
        route={route}
      />
    );
  }

  if (controller.mode === 'langganan') {
    return (
      <KolamLayananSubscriptionDetail
        onRouteChange={onRouteChange}
        route={route}
      />
    );
  }

  if (controller.mode !== 'list') {
    return (
      <KolamLayananServiceEditor
        controller={controller}
        onRouteChange={onRouteChange}
        route={route}
      />
    );
  }

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
      <KolamLayananList controller={controller} onRouteChange={onRouteChange} />
    </View>
  );
}

function KolamLayananList({
  controller,
  onRouteChange,
}: {
  controller: KolamLayananController;
  onRouteChange?: (route: string) => void;
}) {
  const kpiCards = buildKolamLayananOpsKpiCards(controller.opsDashboard);

  return (
    <ScrollView
      contentContainerStyle={styles.listContent}
      style={styles.stack}
    >
      <View style={styles.fullWidth}>
        <KolamStatsCardStrip cards={kpiCards} />
      </View>

      <View style={[kolamTableToolbarStyles.shell, styles.fullWidth]}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            {KOLAM_LAYANAN_LIST_TABS.map(tab => (
              <KolamButton
                intent={
                  controller.activeTab === tab.id ? 'primary' : 'outline'
                }
                key={tab.id}
                label={tab.label}
                onPress={() => {
                  const href = controller.onTabChange(tab.id);
                  onRouteChange?.(href);
                }}
                style={styles.tabButton}
              />
            ))}
            {controller.activeTab === 'daftar' ||
            controller.activeTab === 'langganan' ? (
              <KolamSearchField
                containerStyle={kolamTableToolbarStyles.searchInput}
                onChangeText={controller.onSearchChange}
                placeholder={
                  controller.activeTab === 'langganan'
                    ? 'Cari nomor / kode paket…'
                    : 'Cari layanan…'
                }
                value={controller.search}
              />
            ) : null}
            {controller.activeTab === 'langganan' ? (
              <KolamDropdownSelect
                label="Status"
                onChange={value =>
                  controller.onSetSubscriptionStatusFilter(
                    value as typeof controller.subscriptionStatusFilter,
                  )
                }
                options={[
                  { label: 'Status', value: 'all' },
                  ...KOLAM_LAYANAN_SUBSCRIPTION_STATUS_OPTIONS.map(option => ({
                    label: option.label,
                    value: option.id,
                  })),
                ]}
                showLabelInTrigger={false}
                value={controller.subscriptionStatusFilter}
              />
            ) : null}
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              disabled={controller.loading || controller.opsLoading}
              label="Refresh"
              onPress={() => {
                void controller.onRefresh();
              }}
            />
            {controller.activeTab === 'daftar' ? (
              <KolamButton
                intent="primary"
                label="Baru"
                onPress={() => {
                  controller.onCreateNew();
                  onRouteChange?.(`${KOLAM_LAYANAN_ROOT}/create`);
                }}
              />
            ) : null}
          </View>
        </View>
      </View>

      {controller.activeTab === 'daftar' ? (
        <>
          <KolamLayananServiceTable
            controller={controller}
            onRouteChange={onRouteChange}
          />
          <KolamLayananAlertRail
            dashboard={controller.opsDashboard}
            onRouteChange={onRouteChange}
          />
        </>
      ) : null}

      {controller.activeTab === 'operasional' ? (
        <>
          <KolamLayananCapacityGrid dashboard={controller.opsDashboard} />
          <KolamLayananPendingTable
            controller={controller}
            onRouteChange={onRouteChange}
          />
        </>
      ) : null}

      {controller.activeTab === 'langganan' ? (
        <KolamLayananSubscriptionTable
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : null}
    </ScrollView>
  );
}

function KolamLayananAlertRail({
  dashboard,
  onRouteChange,
}: {
  dashboard: KolamLayananOpsDashboard | null;
  onRouteChange?: (route: string) => void;
}) {
  if (!dashboard) {
    return null;
  }

  const panels: Array<{ title: string; rows: KolamLayananOpsAlert[] }> = [
    { title: 'Kunjungan terlambat', rows: dashboard.alerts.overdue },
    {
      title: 'Tunggu verifikasi supervisor',
      rows: dashboard.alerts.pendingSupervisor,
    },
    {
      title: 'Tunggu konfirmasi pelanggan',
      rows: dashboard.alerts.pendingCustomerConfirm,
    },
  ].filter(panel => panel.rows.length > 0);

  return (
    <KolamContentFrame variant="nativeFormSection">
      <Text style={styles.sectionTitle}>Perlu tindakan</Text>
      {panels.length === 0 ? (
        <Text style={styles.metaText}>
          Tidak ada kunjungan yang menunggu tindakan.
        </Text>
      ) : (
        panels.map(panel => (
          <View key={panel.title} style={styles.alertBlock}>
            <Text style={styles.alertTitle}>{panel.title}</Text>
            {panel.rows.slice(0, 8).map(row => (
              <Pressable
                key={`${row.taskId}-${row.executionId}`}
                disabled={!row.href}
                onPress={() => {
                  if (row.href) {
                    onRouteChange?.(row.href);
                  }
                }}
                style={styles.alertRow}
              >
                <Text numberOfLines={1} style={styles.alertLabel}>
                  {row.visitTitle}
                </Text>
                <Text style={styles.metaText}>
                  {formatAlertTime(row.scheduledTime)}
                </Text>
              </Pressable>
            ))}
          </View>
        ))
      )}
    </KolamContentFrame>
  );
}

function KolamLayananCapacityGrid({
  dashboard,
}: {
  dashboard: KolamLayananOpsDashboard | null;
}) {
  const slots = dashboard?.slots ?? [];
  const weeks = [1, 2, 3, 4].map(week => ({
    week,
    rows: [0, 1, 2, 3, 4, 5, 6].map(weekday =>
      slots.find(slot => slot.week === week && slot.weekday === weekday),
    ),
  }));

  return (
    <KolamContentFrame variant="nativeFormSection">
      <Text style={styles.sectionTitle}>Kapasitas slot</Text>
      <Text style={styles.metaText}>
        Grid kunjungan periode 30 hari (4 minggu × 7 hari).
      </Text>
      {dashboard?.capacityPeriodStart ? (
        <Text style={styles.metaText}>
          {dashboard.capacityPeriodStart} s/d {dashboard.capacityPeriodEnd}
        </Text>
      ) : null}
      {dashboard?.capacitySummary ? (
        <Text style={styles.metaText}>
          Penuh: {dashboard.capacitySummary.fullSlots} · Hampir penuh:{' '}
          {dashboard.capacitySummary.limitedSlots}
        </Text>
      ) : null}
      {!dashboard ? (
        <Text style={styles.metaText}>Memuat kapasitas…</Text>
      ) : (
        weeks.map(({ week, rows }) => (
          <View key={week} style={styles.weekBlock}>
            <Text style={styles.weekTitle}>Minggu {week}</Text>
            <View style={styles.weekGrid}>
              {rows.map((slot, weekday) => (
                <CapacityCell
                  key={`${week}-${weekday}`}
                  slot={slot}
                  weekday={weekday}
                />
              ))}
            </View>
          </View>
        ))
      )}
    </KolamContentFrame>
  );
}

function CapacityCell({
  slot,
  weekday,
}: {
  slot?: KolamLayananCapacitySlot;
  weekday: number;
}) {
  return (
    <View style={styles.capacityCell}>
      <View style={styles.capacityCellHeader}>
        <Text style={styles.capacityWeekday}>{WEEKDAY_HEADERS[weekday]}</Text>
        {slot ? (
          <KolamStatusBadge
            intent={getKolamLayananCapacityStatusIntent(slot.status)}
            label={getKolamLayananCapacityStatusLabel(slot.status)}
          />
        ) : null}
      </View>
      {slot ? (
        <Text style={styles.metaText}>
          {slot.booked}/{slot.capacity}
          {slot.dates[0] ? `\n${slot.dates[0]}` : ''}
        </Text>
      ) : (
        <Text style={styles.metaText}>—</Text>
      )}
    </View>
  );
}

function KolamLayananServiceTable({
  controller,
  onRouteChange,
}: {
  controller: KolamLayananController;
  onRouteChange?: (route: string) => void;
}) {
  const columns = useFitColumns(SERVICE_COLUMNS);

  return (
    <KolamCatalogListTableShell
      footer={
        <CatalogPagination
          onSetPage={controller.onSetPage}
          onSetPageSize={controller.onSetPageSize}
          page={controller.page}
          pageSize={controller.pageSize}
          total={controller.total}
          totalPages={controller.totalPages}
        />
      }
      onBodyWidthChange={columns.setWidth}
    >
      <KolamDataTableHeader columns={columns.columns} />
      {!controller.loading && controller.services.length === 0 ? (
        <KolamEmptyState
          message="Belum ada paket layanan, atau pencarian tidak menemukan hasil."
          title="Layanan kosong"
        />
      ) : null}
      {controller.services.map(service => (
        <KolamLayananServiceRow
          columns={columns.columns}
          key={service.id}
          onEdit={() => {
            controller.onOpenEdit(service);
            onRouteChange?.(`${KOLAM_LAYANAN_ROOT}/${service.id}/edit`);
          }}
          onSelect={() => {
            controller.onSelectService(service);
            onRouteChange?.(`${KOLAM_LAYANAN_ROOT}/${service.id}`);
          }}
          service={service}
        />
      ))}
    </KolamCatalogListTableShell>
  );
}

function KolamLayananPendingTable({
  controller,
  onRouteChange,
}: {
  controller: KolamLayananController;
  onRouteChange?: (route: string) => void;
}) {
  const columns = useFitColumns(PENDING_COLUMNS);

  return (
    <KolamCatalogListTableShell
      footer={
        <CatalogPagination
          onSetPage={controller.onSetPage}
          onSetPageSize={controller.onSetPageSize}
          page={controller.page}
          pageSize={controller.pageSize}
          total={controller.total}
          totalPages={controller.totalPages}
        />
      }
      onBodyWidthChange={columns.setWidth}
    >
      <Text style={styles.tableCaption}>Voucher menunggu tindakan</Text>
      <KolamDataTableHeader columns={columns.columns} />
      {!controller.loading && controller.pendingServices.length === 0 ? (
        <KolamEmptyState
          message="Tidak ada voucher terbuka saat ini."
          title="Voucher kosong"
        />
      ) : null}
      {controller.pendingServices.map(item => (
        <KolamLayananPendingRow
          columns={columns.columns}
          item={item}
          key={item.id}
          onSelect={() => {
            controller.onSelectPending(item);
            onRouteChange?.(`${KOLAM_LAYANAN_ROOT}/voucher/${item.id}`);
          }}
        />
      ))}
    </KolamCatalogListTableShell>
  );
}

function KolamLayananSubscriptionTable({
  controller,
  onRouteChange,
}: {
  controller: KolamLayananController;
  onRouteChange?: (route: string) => void;
}) {
  const columns = useFitColumns(SUBSCRIPTION_COLUMNS);

  return (
    <KolamCatalogListTableShell
      footer={
        <CatalogPagination
          onSetPage={controller.onSetPage}
          onSetPageSize={controller.onSetPageSize}
          page={controller.page}
          pageSize={controller.pageSize}
          total={controller.total}
          totalPages={controller.totalPages}
        />
      }
      onBodyWidthChange={columns.setWidth}
    >
      <KolamDataTableHeader columns={columns.columns} />
      {!controller.loading && controller.subscriptions.length === 0 ? (
        <KolamEmptyState
          message="Belum ada langganan, atau filter tidak menemukan hasil."
          title="Langganan kosong"
        />
      ) : null}
      {controller.subscriptions.map(item => (
        <KolamLayananSubscriptionRow
          columns={columns.columns}
          item={item}
          key={item.id}
          onSelect={() => {
            controller.onSelectSubscription(item);
            onRouteChange?.(`${KOLAM_LAYANAN_ROOT}/langganan/${item.id}`);
          }}
        />
      ))}
    </KolamCatalogListTableShell>
  );
}

function CatalogPagination({
  onSetPage,
  onSetPageSize,
  page,
  pageSize,
  total,
  totalPages,
}: {
  onSetPage: (page: number) => void;
  onSetPageSize: (pageSize: number) => void;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}) {
  return (
    <KolamTableFooterControls
      onPageSizeChange={onSetPageSize}
      page={page}
      pageSize={pageSize}
      total={total}
    >
      {totalPages > 1 ? (
        <View style={styles.paginationRow}>
          <KolamButton
            disabled={page <= 1}
            label="Sebelumnya"
            onPress={() => onSetPage(Math.max(1, page - 1))}
          />
          <Text style={styles.pageLabel}>
            {page} / {totalPages}
          </Text>
          <KolamButton
            disabled={page >= totalPages}
            label="Berikutnya"
            onPress={() => onSetPage(Math.min(totalPages, page + 1))}
          />
        </View>
      ) : null}
    </KolamTableFooterControls>
  );
}

function useFitColumns(baseColumns: KolamTableColumn[]) {
  const [tableBodyWidth, setTableBodyWidth] = React.useState(0);
  const columns = React.useMemo(() => {
    if (tableBodyWidth <= 0) {
      return baseColumns;
    }
    const flexible = baseColumns.filter(column => column.id !== 'actions');
    const actionsWidth = KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH;
    const gapTotal = KOLAM_DATA_TABLE_COLUMN_GAP * (baseColumns.length - 1);
    const available = Math.max(
      420,
      tableBodyWidth - actionsWidth - gapTotal,
    );
    const baseWidth = flexible.reduce(
      (sum, column) => sum + (column.width ?? 100),
      0,
    );
    const scale = available / Math.max(1, baseWidth);
    return [
      ...flexible.map(column => ({
        ...column,
        width: Math.max(56, Math.round((column.width ?? 100) * scale)),
      })),
      { ...baseColumns[baseColumns.length - 1], width: actionsWidth },
    ];
  }, [baseColumns, tableBodyWidth]);

  return { columns, setWidth: setTableBodyWidth };
}

function KolamLayananServiceRow({
  columns,
  onEdit,
  onSelect,
  service,
}: {
  columns: KolamTableColumn[];
  onEdit: () => void;
  onSelect: () => void;
  service: KolamLayananService;
}) {
  const brandLabel =
    service.brands.length === 0
      ? '—'
      : service.brands
          .slice(0, 2)
          .map(brand => brand.name)
          .join(', ') +
        (service.brands.length > 2 ? ` +${service.brands.length - 2}` : '');

  return (
    <KolamDataTableRowFrame>
      <KolamDataTableMainTrack>
        <Pressable
          accessibilityRole="button"
          onPress={onSelect}
          style={getKolamDataTableColumnStyle(columns[0])}
        >
          <Text numberOfLines={1} style={styles.primaryText}>
            {service.name}
          </Text>
        </Pressable>
        <View style={getKolamDataTableColumnStyle(columns[1])}>
          <Text numberOfLines={1} style={styles.monoText}>
            {service.sku}
          </Text>
        </View>
        <View style={getKolamDataTableColumnStyle(columns[2])}>
          <Text numberOfLines={1} style={styles.monoText}>
            {service.packageCode}
          </Text>
        </View>
        <View style={getKolamDataTableColumnStyle(columns[3])}>
          <Text numberOfLines={1} style={styles.cellText}>
            {brandLabel}
          </Text>
        </View>
        <View style={getKolamDataTableColumnStyle(columns[4])}>
          <Text numberOfLines={1} style={styles.cellText}>
            {getKolamLayananTaskTypeLabel(service.taskType)}
          </Text>
        </View>
        <View style={getKolamDataTableColumnStyle(columns[5])}>
          <Text numberOfLines={1} style={styles.priceText}>
            {formatKolamLayananUnitPrice(service.priceM3, 'm3')}
          </Text>
        </View>
        <View style={getKolamDataTableColumnStyle(columns[6])}>
          <Text numberOfLines={1} style={styles.priceText}>
            {formatKolamLayananUnitPrice(service.priceKm, 'km')}
          </Text>
        </View>
      </KolamDataTableMainTrack>
      <KolamDataTableActionsTrack>
        <KolamOverflowMenuButton
          actions={[
            { label: 'Lihat', onPress: onSelect },
            { label: 'Rubah', onPress: onEdit },
          ]}
        />
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
}

function KolamLayananPendingRow({
  columns,
  item,
  onSelect,
}: {
  columns: KolamTableColumn[];
  item: KolamLayananPendingService;
  onSelect: () => void;
}) {
  return (
    <KolamDataTableRowFrame>
      <KolamDataTableMainTrack>
        <Pressable
          accessibilityRole="button"
          onPress={onSelect}
          style={getKolamDataTableColumnStyle(columns[0])}
        >
          <Text numberOfLines={1} style={styles.monoText}>
            {item.serviceSerial}
          </Text>
        </Pressable>
        <View style={getKolamDataTableColumnStyle(columns[1])}>
          <Text numberOfLines={1} style={styles.monoText}>
            {item.invoiceCode}
          </Text>
        </View>
        <View style={getKolamDataTableColumnStyle(columns[2])}>
          <Text numberOfLines={1} style={styles.primaryText}>
            {item.serviceName}
          </Text>
          <Text numberOfLines={1} style={styles.metaText}>
            {item.packageCode}
          </Text>
        </View>
        <View style={getKolamDataTableColumnStyle(columns[3])}>
          <Text numberOfLines={1} style={styles.cellText}>
            {item.customerName}
          </Text>
        </View>
        <View style={getKolamDataTableColumnStyle(columns[4])}>
          <KolamStatusBadge
            intent="warning"
            label={getKolamLayananPendingStatusLabel(item.status)}
          />
        </View>
      </KolamDataTableMainTrack>
      <KolamDataTableActionsTrack>
        <KolamOverflowMenuButton
          actions={[{ label: 'Lihat', onPress: onSelect }]}
        />
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
}

function KolamLayananSubscriptionRow({
  columns,
  item,
  onSelect,
}: {
  columns: KolamTableColumn[];
  item: KolamLayananSubscription;
  onSelect: () => void;
}) {
  return (
    <KolamDataTableRowFrame>
      <KolamDataTableMainTrack>
        <Pressable
          accessibilityRole="button"
          onPress={onSelect}
          style={getKolamDataTableColumnStyle(columns[0])}
        >
          <Text numberOfLines={1} style={styles.monoText}>
            {item.subscriptionNumber}
          </Text>
        </Pressable>
        <View style={getKolamDataTableColumnStyle(columns[1])}>
          <Text numberOfLines={1} style={styles.cellText}>
            {item.customerName}
          </Text>
        </View>
        <View style={getKolamDataTableColumnStyle(columns[2])}>
          <Text numberOfLines={1} style={styles.primaryText}>
            {item.serviceName}
          </Text>
          <Text numberOfLines={1} style={styles.metaText}>
            {item.packageCode}
          </Text>
        </View>
        <View style={getKolamDataTableColumnStyle(columns[3])}>
          <Text numberOfLines={1} style={styles.monoText}>
            {item.voucherSerial}
          </Text>
        </View>
        <View style={getKolamDataTableColumnStyle(columns[4])}>
          <Text numberOfLines={2} style={styles.cellText}>
            {formatListDate(item.startDate)} – {formatListDate(item.endDate)}
          </Text>
        </View>
        <View style={getKolamDataTableColumnStyle(columns[5])}>
          <KolamStatusBadge
            intent={getKolamLayananSubscriptionStatusIntent(item.status)}
            label={getKolamLayananSubscriptionStatusLabel(item.status)}
          />
        </View>
        <View style={getKolamDataTableColumnStyle(columns[6])}>
          <Text numberOfLines={1} style={styles.cellText}>
            {item.autoRenew ? 'Ya' : 'Tidak'}
          </Text>
        </View>
      </KolamDataTableMainTrack>
      <KolamDataTableActionsTrack>
        <KolamOverflowMenuButton
          actions={[{ label: 'Lihat', onPress: onSelect }]}
        />
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
}

function formatListDate(value?: string | null) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatAlertTime(value?: string | null) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  surface: {
    alignSelf: 'stretch',
    flex: 1,
    gap: 8,
    minWidth: 0,
    width: '100%',
  },
  stack: {
    alignSelf: 'stretch',
    flex: 1,
    minWidth: 0,
    width: '100%',
  },
  listContent: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    flexGrow: 1,
    gap: 8,
    minWidth: 0,
    paddingBottom: 24,
    width: '100%',
  },
  fullWidth: {
    alignSelf: 'stretch',
    minWidth: 0,
    width: '100%',
  },
  errorBadge: {
    alignSelf: 'stretch',
    marginHorizontal: 4,
  },
  tabButton: {
    minHeight: 34,
    paddingHorizontal: 10,
  },
  placeholderTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 420,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  tableCaption: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  alertBlock: {
    gap: 6,
    marginTop: 8,
  },
  alertTitle: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '700',
  },
  alertRow: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  alertLabel: {
    color: V.colors.fg,
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  weekBlock: {
    gap: 6,
    marginTop: 10,
  },
  weekTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  weekGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  capacityCell: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    minWidth: 96,
    padding: 8,
    width: '13%',
  },
  capacityCellHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'space-between',
  },
  capacityWeekday: {
    color: V.colors.fg,
    fontSize: 11,
    fontWeight: '700',
  },
  primaryText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  monoText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  cellText: {
    color: V.colors.fg,
    fontSize: 13,
  },
  metaText: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  priceText: {
    color: V.colors.success,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
});
