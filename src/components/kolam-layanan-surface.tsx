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
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamLayananController,
  type KolamLayananController,
} from '../hooks/use-kolam-layanan-controller';
import { KolamButton } from './kolam-button';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamContentFrame } from './kolam-content-frame';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamLayananExecutionDetail } from './kolam-layanan-execution-detail';
import { KolamLayananServiceEditor } from './kolam-layanan-service-editor';
import { KolamLayananSubscriptionDetail } from './kolam-layanan-subscription-detail';
import { KolamLayananVoucherDetail } from './kolam-layanan-voucher-detail';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import { KolamSearchField } from './kolam-search-field';
import { KolamStatsCard } from './kolam-stats-card';
import { KolamStatusBadge } from './kolam-status-badge';
import type { KolamStatusBadgeIntent } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

const WEEKDAY_HEADERS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

type LayananAlertQueueId = 'overdue' | 'supervisor' | 'customer';

type LayananAlertQueue = {
  id: LayananAlertQueueId;
  intent: KolamStatusBadgeIntent;
  label: string;
  rows: KolamLayananOpsAlert[];
};

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
      <View style={styles.kpiStrip}>
        {kpiCards.map(card => (
          <KolamStatsCard card={card} key={card.id} />
        ))}
      </View>

      <View style={[kolamTableToolbarStyles.shell, styles.fullWidth]}>
        <View style={[kolamTableToolbarStyles.row, styles.toolbarRow]}>
          <View style={kolamTableToolbarStyles.filters}>
            {controller.activeTab === 'daftar' ||
            controller.activeTab === 'langganan' ? (
              <KolamSearchField
                containerStyle={[
                  kolamTableToolbarStyles.searchInput,
                  styles.searchInput,
                ]}
                onChangeText={controller.onSearchChange}
                placeholder={
                  controller.activeTab === 'langganan'
                    ? 'Nomor / kode paket'
                    : 'Cari layanan…'
                }
                value={controller.search}
              />
            ) : (
              <View style={styles.searchInput} />
            )}
            {controller.activeTab === 'langganan' ? (
              <KolamDropdownSelect
                label="Status"
                onChange={value =>
                  controller.onSetSubscriptionStatusFilter(
                    value as typeof controller.subscriptionStatusFilter,
                  )
                }
                options={[
                  { label: 'Semua status', value: 'all' },
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
          <View style={[kolamTableToolbarStyles.actions, styles.actionsRight]}>
            <View style={styles.tabGroup}>
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
            </View>
            <KolamRefreshButton
              accessibilityLabel="Refresh"
              disabled={controller.loading || controller.opsLoading}

              onPress={() => {
                void controller.onRefresh();
              }}
            />
            {controller.activeTab === 'daftar' ? (
              <KolamButton
                intent="primary"
                label="Baru"
                tone="positive"
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

  const queues = React.useMemo<LayananAlertQueue[]>(
    () => [
      {
        id: 'overdue',
        intent: 'danger',
        label: 'Terlambat',
        rows: dashboard.alerts.overdue,
      },
      {
        id: 'supervisor',
        intent: 'warning',
        label: 'Supervisor',
        rows: dashboard.alerts.pendingSupervisor,
      },
      {
        id: 'customer',
        intent: 'primary',
        label: 'Pelanggan',
        rows: dashboard.alerts.pendingCustomerConfirm,
      },
    ],
    [
      dashboard.alerts.overdue,
      dashboard.alerts.pendingCustomerConfirm,
      dashboard.alerts.pendingSupervisor,
    ],
  );
  const [activeQueueId, setActiveQueueId] =
    React.useState<LayananAlertQueueId>('overdue');
  const totalAlerts = queues.reduce((sum, queue) => sum + queue.rows.length, 0);

  React.useEffect(() => {
    const activeQueue = queues.find(queue => queue.id === activeQueueId);
    if (activeQueue && activeQueue.rows.length > 0) {
      return;
    }
    const nextQueue = queues.find(queue => queue.rows.length > 0);
    if (nextQueue && nextQueue.id !== activeQueueId) {
      setActiveQueueId(nextQueue.id);
    }
  }, [activeQueueId, queues]);

  const activeQueue =
    queues.find(queue => queue.id === activeQueueId) ?? queues[0];

  return (
    <KolamContentFrame variant="nativeFormSection">
      <View style={styles.alertHeader}>
        <Text style={styles.sectionTitle}>Perlu tindakan</Text>
        <KolamStatusBadge
          intent={totalAlerts > 0 ? 'warning' : 'success'}
          label={`${totalAlerts} antrian`}
        />
      </View>
      <View style={styles.alertTabs}>
        {queues.map(queue => (
          <Pressable
            accessibilityRole="button"
            key={queue.id}
            onPress={() => setActiveQueueId(queue.id)}
            style={[
              styles.alertTab,
              activeQueueId === queue.id ? styles.alertTabActive : null,
            ]}
          >
            <Text
              style={[
                styles.alertTabLabel,
                activeQueueId === queue.id
                  ? styles.alertTabLabelActive
                  : null,
              ]}
            >
              {queue.label}
            </Text>
            <KolamStatusBadge
              intent={queue.intent}
              label={String(queue.rows.length)}
              style={styles.alertTabBadge}
            />
          </Pressable>
        ))}
      </View>
      {activeQueue.rows.length === 0 ? (
        <Text style={styles.alertEmptyText}>Tidak ada tindakan</Text>
      ) : (
        <View style={styles.alertQueueRows}>
          {activeQueue.rows.slice(0, 8).map(row => (
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
              <View style={styles.alertRowMain}>
                <View style={styles.alertTitleBlock}>
                  <Text numberOfLines={1} style={styles.alertLabel}>
                    {row.visitTitle}
                  </Text>
                  <Text numberOfLines={1} style={styles.alertSubLabel}>
                    {getAlertRowMeta(row)}
                  </Text>
                </View>
                <View style={styles.alertRowMiddle}>
                  <KolamStatusBadge
                    intent="info"
                    label={getAlertTaskKindLabel(row.taskKind)}
                    style={styles.alertRowBadge}
                  />
                  {row.packageTaskCode ? (
                    <Text numberOfLines={1} style={styles.alertCode}>
                      {row.packageTaskCode}
                    </Text>
                  ) : null}
                </View>
                <KolamStatusBadge
                  intent={activeQueue.intent}
                  label={activeQueue.label}
                  style={styles.alertRowBadge}
                />
              </View>
              <Text numberOfLines={1} style={styles.alertTime}>
                {formatAlertTime(row.scheduledTime)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </KolamContentFrame>
  );
}

function getAlertTaskKindLabel(taskKind: string) {
  if (taskKind === 'dosing') {
    return 'Dosing';
  }
  if (taskKind === 'maintenance') {
    return 'Maintenance';
  }
  return taskKind || 'Tugas';
}

function getAlertRowMeta(row: KolamLayananOpsAlert) {
  const refs = [
    row.pendingServiceId ? `Layanan ${row.pendingServiceId.slice(-6)}` : null,
    row.subscriptionId ? `Langganan ${row.subscriptionId.slice(-6)}` : null,
  ].filter(Boolean);
  return refs.join(' · ') || 'Kunjungan layanan';
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
  const columns = React.useMemo(
    () =>
      buildLayananServiceColumns({
        onSelect: service => {
          controller.onSelectService(service);
          onRouteChange?.(KOLAM_LAYANAN_ROOT + '/' + service.id);
        },
      }),
    [controller, onRouteChange],
  );

  return (
    <KolamListTableComposition
      actionsColumn
      columns={columns}
      emptyTitle="Layanan kosong"
      getRowKey={service => service.id}
      loading={controller.loading}
      pagination={{
        onPageChange: controller.onSetPage,
        page: controller.page,
        pageSize: controller.pageSize,
        total: controller.total,
      }}
      renderActions={service => (
        <KolamLayananServiceActionsMenu
          onEdit={() => {
            controller.onOpenEdit(service);
            onRouteChange?.(KOLAM_LAYANAN_ROOT + '/' + service.id + '/edit');
          }}
          onSelect={() => {
            controller.onSelectService(service);
            onRouteChange?.(KOLAM_LAYANAN_ROOT + '/' + service.id);
          }}
        />
      )}
      rows={controller.services}
      style={styles.fullWidth}
    />
  );
}

function KolamLayananPendingTable({
  controller,
  onRouteChange,
}: {
  controller: KolamLayananController;
  onRouteChange?: (route: string) => void;
}) {
  const columns = React.useMemo(
    () =>
      buildLayananPendingColumns({
        onSelect: item => {
          controller.onSelectPending(item);
          onRouteChange?.(KOLAM_LAYANAN_ROOT + '/voucher/' + item.id);
        },
      }),
    [controller, onRouteChange],
  );

  return (
    <View style={styles.tableGroup}>
      <Text style={styles.tableCaption}>Voucher menunggu tindakan</Text>
      <KolamListTableComposition
        actionsColumn
        columns={columns}
        emptyTitle="Voucher kosong"
        getRowKey={item => item.id}
        loading={controller.loading}
        pagination={{
          onPageChange: controller.onSetPage,
          page: controller.page,
          pageSize: controller.pageSize,
          total: controller.total,
        }}
        renderActions={item => (
          <KolamLayananSimpleActionsMenu
            onSelect={() => {
              controller.onSelectPending(item);
              onRouteChange?.(KOLAM_LAYANAN_ROOT + '/voucher/' + item.id);
            }}
          />
        )}
        rows={controller.pendingServices}
        style={styles.fullWidth}
      />
    </View>
  );
}

function KolamLayananSubscriptionTable({
  controller,
  onRouteChange,
}: {
  controller: KolamLayananController;
  onRouteChange?: (route: string) => void;
}) {
  const columns = React.useMemo(
    () =>
      buildLayananSubscriptionColumns({
        onSelect: item => {
          controller.onSelectSubscription(item);
          onRouteChange?.(KOLAM_LAYANAN_ROOT + '/langganan/' + item.id);
        },
      }),
    [controller, onRouteChange],
  );

  return (
    <KolamListTableComposition
      actionsColumn
      columns={columns}
      emptyTitle="Langganan kosong"
      getRowKey={item => item.id}
      loading={controller.loading}
      pagination={{
        onPageChange: controller.onSetPage,
        page: controller.page,
        pageSize: controller.pageSize,
        total: controller.total,
      }}
      renderActions={item => (
        <KolamLayananSimpleActionsMenu
          onSelect={() => {
            controller.onSelectSubscription(item);
            onRouteChange?.(KOLAM_LAYANAN_ROOT + '/langganan/' + item.id);
          }}
        />
      )}
      rows={controller.subscriptions}
      style={styles.fullWidth}
    />
  );
}

function buildLayananServiceColumns({
  onSelect,
}: {
  onSelect: (service: KolamLayananService) => void;
}): Array<KolamListTableColumn<KolamLayananService>> {
  return [
    {
      flex: 1.18,
      id: 'name',
      label: 'Nama',
      render: service => (
        <Pressable
          accessibilityRole="button"
          onPress={() => onSelect(service)}
          style={styles.identityCell}
        >
          <Text numberOfLines={1} style={styles.primaryText}>
            {service.name}
          </Text>
        </Pressable>
      ),
    },
    {
      align: 'center',
      flex: 0.72,
      id: 'sku',
      label: 'SKU',
      render: service => (
        <Text numberOfLines={1} style={styles.monoTextCenter}>
          {service.sku}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.78,
      id: 'packageCode',
      label: 'Kode paket',
      render: service => (
        <Text numberOfLines={1} style={styles.monoTextCenter}>
          {service.packageCode}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.92,
      id: 'brand',
      label: 'Merek',
      render: service => (
        <Text numberOfLines={1} style={styles.cellTextCenter}>
          {formatLayananBrandLabel(service)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.72,
      id: 'type',
      label: 'Tipe',
      render: service => (
        <Text numberOfLines={1} style={styles.cellTextCenter}>
          {getKolamLayananTaskTypeLabel(service.taskType)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.64,
      id: 'priceM3',
      label: 'Jual m3',
      render: service => (
        <Text numberOfLines={1} style={styles.priceTextCenter}>
          {formatKolamLayananUnitPrice(service.priceM3, 'm3')}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.64,
      id: 'priceKm',
      label: 'Jual km',
      render: service => (
        <Text numberOfLines={1} style={styles.priceTextCenter}>
          {formatKolamLayananUnitPrice(service.priceKm, 'km')}
        </Text>
      ),
    },
  ];
}

function buildLayananPendingColumns({
  onSelect,
}: {
  onSelect: (item: KolamLayananPendingService) => void;
}): Array<KolamListTableColumn<KolamLayananPendingService>> {
  return [
    {
      flex: 0.9,
      id: 'voucher',
      label: 'Voucher',
      render: item => (
        <Pressable
          accessibilityRole="button"
          onPress={() => onSelect(item)}
          style={styles.identityCell}
        >
          <Text numberOfLines={1} style={styles.monoText}>
            {item.serviceSerial}
          </Text>
        </Pressable>
      ),
    },
    {
      align: 'center',
      flex: 0.82,
      id: 'invoice',
      label: 'Invoice',
      render: item => (
        <Text numberOfLines={1} style={styles.monoTextCenter}>
          {item.invoiceCode}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 1.05,
      id: 'package',
      label: 'Paket',
      render: item => (
        <View style={styles.centerCell}>
          <Text numberOfLines={1} style={styles.primaryTextCenter}>
            {item.serviceName}
          </Text>
          <Text numberOfLines={1} style={styles.metaTextCenter}>
            {item.packageCode}
          </Text>
        </View>
      ),
    },
    {
      align: 'center',
      flex: 0.92,
      id: 'customer',
      label: 'Pelanggan',
      render: item => (
        <Text numberOfLines={1} style={styles.cellTextCenter}>
          {item.customerName}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.82,
      id: 'status',
      label: 'Status',
      render: item => (
        <KolamStatusBadge
          intent="warning"
          label={getKolamLayananPendingStatusLabel(item.status)}
        />
      ),
    },
  ];
}

function buildLayananSubscriptionColumns({
  onSelect,
}: {
  onSelect: (item: KolamLayananSubscription) => void;
}): Array<KolamListTableColumn<KolamLayananSubscription>> {
  return [
    {
      flex: 0.86,
      id: 'number',
      label: 'Nomor',
      render: item => (
        <Pressable
          accessibilityRole="button"
          onPress={() => onSelect(item)}
          style={styles.identityCell}
        >
          <Text numberOfLines={1} style={styles.monoText}>
            {item.subscriptionNumber}
          </Text>
        </Pressable>
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'customer',
      label: 'Pelanggan',
      render: item => (
        <Text numberOfLines={1} style={styles.cellTextCenter}>
          {item.customerName}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 1.05,
      id: 'package',
      label: 'Paket',
      render: item => (
        <View style={styles.centerCell}>
          <Text numberOfLines={1} style={styles.primaryTextCenter}>
            {item.serviceName}
          </Text>
          <Text numberOfLines={1} style={styles.metaTextCenter}>
            {item.packageCode}
          </Text>
        </View>
      ),
    },
    {
      align: 'center',
      flex: 0.78,
      id: 'voucher',
      label: 'Voucher',
      render: item => (
        <Text numberOfLines={1} style={styles.monoTextCenter}>
          {item.voucherSerial}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.98,
      id: 'period',
      label: 'Periode',
      render: item => (
        <Text numberOfLines={2} style={styles.cellTextCenter}>
          {formatListDate(item.startDate)} - {formatListDate(item.endDate)}
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
          intent={getKolamLayananSubscriptionStatusIntent(item.status)}
          label={getKolamLayananSubscriptionStatusLabel(item.status)}
        />
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'autoRenew',
      label: 'Perpanjang otomatis',
      render: item => (
        <Text numberOfLines={1} style={styles.cellTextCenter}>
          {item.autoRenew ? 'Ya' : 'Tidak'}
        </Text>
      ),
    },
  ];
}

function KolamLayananServiceActionsMenu({
  onEdit,
  onSelect,
}: {
  onEdit: () => void;
  onSelect: () => void;
}) {
  return (
    <KolamOverflowMenuButton
      actions={[
        { label: 'Lihat', onPress: onSelect },
        { label: 'Rubah', onPress: onEdit },
      ]}
    />
  );
}

function KolamLayananSimpleActionsMenu({
  onSelect,
}: {
  onSelect: () => void;
}) {
  return <KolamOverflowMenuButton actions={[{ label: 'Lihat', onPress: onSelect }]} />;
}

function formatLayananBrandLabel(service: KolamLayananService) {
  if (service.brands.length === 0) {
    return '-';
  }
  return (
    service.brands
      .slice(0, 2)
      .map(brand => brand.name)
      .join(', ') +
    (service.brands.length > 2 ? ` +${service.brands.length - 2}` : '')
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
  kpiStrip: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
    minWidth: 0,
    width: '100%',
  },
  toolbarRow: {
    flexWrap: 'nowrap',
  },
  searchInput: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 140,
    width: '100%',
  },
  actionsRight: {
    flexGrow: 0,
    flexShrink: 0,
    marginLeft: 'auto',
  },
  tabGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    flexGrow: 0,
    flexShrink: 0,
    flexWrap: 'nowrap',
    gap: 4,
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
  tableGroup: {
    alignSelf: 'stretch',
    gap: 6,
    minWidth: 0,
    width: '100%',
  },
  alertHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  alertTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  alertTab: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 30,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  alertTabActive: {
    backgroundColor: V.colors.successSoft,
    borderColor: V.colors.successSoft,
  },
  alertTabLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
  },
  alertTabLabelActive: {
    color: V.colors.fg,
  },
  alertTabBadge: {
    minHeight: 18,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  alertQueueRows: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  alertRow: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  alertRowMain: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
  },
  alertTitleBlock: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  alertLabel: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  alertSubLabel: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '600',
  },
  alertRowMiddle: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: 6,
    minWidth: 150,
  },
  alertCode: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    maxWidth: 96,
  },
  alertRowBadge: {
    flexShrink: 0,
  },
  alertTime: {
    color: V.colors.mutedFg,
    flexShrink: 0,
    fontSize: 12,
    fontWeight: '700',
  },
  alertEmptyText: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 4,
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
  identityCell: {
    minWidth: 0,
    width: '100%',
  },
  centerCell: {
    alignItems: 'center',
    gap: 3,
    minWidth: 0,
    width: '100%',
  },
  primaryTextCenter: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
  },
  monoTextCenter: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    width: '100%',
  },
  cellTextCenter: {
    color: V.colors.fg,
    fontSize: 13,
    textAlign: 'center',
    width: '100%',
  },
  metaText: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  metaTextCenter: {
    color: V.colors.mutedFg,
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
  },
  priceText: {
    color: V.colors.success,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
  priceTextCenter: {
    color: V.colors.success,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    width: '100%',
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
