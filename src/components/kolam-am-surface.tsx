import React from 'react';
import {Image, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import type {DimensionValue} from 'react-native';
import {appConfig} from '../config/app';
import {
  AM_ROUTES,
  getAmRouteByModuleRoute,
  type AmRouteId,
  type AmRouteItem,
} from '../domain/am-navigation';
import {
  getShellModuleRouteEntry,
  type ShellModuleRouteEntry,
} from '../domain/app-shell';
import type {UnifiedSurface} from '../domain/unified';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {formatRupiah} from '../lib/money';
import {
  cancelAmTransfer,
  cancelAmTask,
  clearAmServiceAccountSession,
  createAmBox,
  createAmDevice,
  createAmRack,
  createAmServiceAccount,
  createAmTransfer,
  createAmUser,
  createAmWebhookConfig,
  deleteAmBoxes,
  deleteAmDevices,
  deleteAmRacks,
  deleteAmServiceAccount,
  deleteAmUser,
  deleteAmWebhookConfig,
  forceFailAmTransfer,
  forceFailAmTask,
  getAmBoxById,
  getAmBoxes,
  getAmDeviceById,
  getAmDevices,
  getAmActivityLogs,
  getAmActivityLogStats,
  getAmDashboard,
  getAmDeviceServiceLogs,
  getAmDeviceServices,
  getAmDeviceServiceQrUrl,
  getAmDevicesAdbStatus,
  getAmCurrentUser,
  getAmTaskById,
  getAmMutasi,
  getAmMutasiById,
  getAmMutasiSummary,
  getAmRackById,
  getAmRacks,
  getAmRoles,
  getAmServiceAccounts,
  getAmTasks,
  getAmTokopediaApiMonitorStatus,
  getAmTokopediaSession,
  getAmTransferById,
  getAmTransfers,
  getAmUsers,
  getAmWebhookConfigs,
  getAmWebhookEvents,
  getAmWebhookLogs,
  logoutAmSession,
  retryAmTransfer,
  retryAmTask,
  recordAmPageView,
  restartAmTokopediaSession,
  runAmTokopediaApiMonitor,
  sendAmDeviceServiceInput,
  startAmDeviceService,
  startAmTokopediaQrLogin,
  stopAmDeviceService,
  testAmWebhookPing,
  uploadAmTokopediaSession,
  updateAmTokopediaCaptchaSettings,
  updateAmTokopediaLoginMethod,
  updateAmBox,
  updateAmDevice,
  updateAmRack,
  updateAmServiceAccount,
  updateAmUser,
  updateAmWebhookConfig,
  verifyAmTokopediaSession,
  type AmActivityLog,
  type AmActivityLogStats,
  type AmBox,
  type AmCurrentUser,
  type AmDashboardData,
  type AmDevice,
  type AmDeviceAdbStatusMap,
  type AmDevicePayload,
  type AmDeviceServiceLog,
  type AmDeviceServiceStatus,
  type AmMutasi,
  type AmMutasiSummary,
  type AmRack,
  type AmRole,
  type AmServiceAccount,
  type AmServiceAccountDeviceRef,
  type AmServiceAccountPayload,
  type AmTask,
  type AmTaskStatus,
  type AmTaskType,
  type AmTokopediaApiMonitorJob,
  type AmTokopediaSessionInfo,
  type AmTransfer,
  type AmUser,
  type AmWebhookConfig,
  type AmWebhookLog,
} from '../services/am-api';
import type {UnifiedDataset} from '../services/unified-data';
import {KolamButton} from './kolam-button';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {KolamSearchField} from './kolam-search-field';

const TASK_TYPE_LABELS: Record<string, string> = {
  stock_sync: 'Stock Sync',
  process_sale: 'Process Sale',
  send_message: 'Send Message',
  bank_transfer: 'Bank Transfer',
};
const TASK_STATUSES: Array<AmTaskStatus | 'all'> = ['all', 'pending', 'queued', 'processing', 'success', 'failed', 'cancelled'];
const TASK_TYPES: Array<AmTaskType | 'all'> = ['all', 'stock_sync', 'process_sale', 'send_message', 'bank_transfer'];
const AM_TASK_PAGE_LIMIT = 20;
const AM_SERVICE_PAGE_LIMIT = 20;
const AM_SERVICE_LOG_PAGE_LIMIT = 100;
const AM_TRANSFER_PAGE_LIMIT = 20;
const AM_MUTASI_PAGE_LIMIT = 50;
const AM_WEBHOOK_LOG_PAGE_LIMIT = 50;
const AM_USER_PAGE_LIMIT = 20;
const AM_ACTIVITY_LOG_PAGE_LIMIT = 50;
const AM_WEBHOOK_LOG_DIRECTIONS = ['all', 'outgoing'];
const AM_ACTIVITY_LOG_TYPES = ['all', 'api', 'page'];
const AM_ACTIVITY_LOG_STATUSES = ['all', 'success', 'failed'];
const AM_ACTIVITY_LOG_METHODS = ['all', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const AM_PLATFORMS = ['all', 'whatsapp', 'tiktok', 'instagram', 'tokopedia', 'shopee', 'bca', 'brimo', 'dana'];
const AM_RECIPIENT_BANKS = ['BRI', 'BCA', 'Mandiri', 'BNI', 'BSI', 'CIMB Niaga', 'Permata', 'Danamon', 'OCBC NISP', 'BTN'];
const AM_TRANSFER_METHODS = ['BI FAST', 'Realtime Online'];
const AM_TRANSFER_METHOD_FEES: Record<string, number> = {
  'BI FAST': 2500,
  'Realtime Online': 6500,
};
const AM_TRANSACTION_PURPOSES = ['Investment', 'Purchase', 'Others (for various purposes)', 'Transfer of Wealth'];
const AM_PLATFORM_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  tokopedia: 'Tokopedia',
  shopee: 'Shopee',
  bca: 'BCA',
  brimo: 'BRImo',
  dana: 'DANA',
  tiktok: 'TikTok',
  instagram: 'Instagram',
};
const PLAYWRIGHT_PLATFORMS = new Set(['tokopedia', 'shopee', 'tiktok', 'instagram']);
const AM_BROWSER_DEVICE_PLATFORMS = new Set(['tokopedia', 'shopee', 'tiktok', 'instagram', 'whatsapp']);
const TOKOPEDIA_SESSION_LABELS: Record<string, string> = {
  missing: 'Belum ada session',
  empty: 'File kosong',
  ready: 'Session tersedia',
  expired: 'Cookies kedaluwarsa',
};

export function KolamAmSurface({
  activeSurface,
  activeModuleRoute,
  dataset,
  onBackToCenter,
  onModuleRouteSelect,
}: {
  activeSurface?: UnifiedSurface | null;
  activeModuleRoute?: ShellModuleRouteEntry | null;
  dataset: UnifiedDataset;
  onBackToCenter?: () => void;
  onModuleRouteSelect?: (route: ShellModuleRouteEntry) => void;
}) {
  const routeSelection = activeModuleRoute
    ? getAmRouteSelection(activeModuleRoute.route)
    : null;
  const activeRoute = routeSelection
    ? routeSelection.route.id
    : getRouteIdFromSurface(activeSurface);
  const route = AM_ROUTES.find(item => item.id === activeRoute) ?? AM_ROUTES[0];

  React.useEffect(() => {
    recordAmPageView(route.path).catch(() => undefined);
  }, [route.path]);

  return (
    <View style={styles.shell}>
      <View style={styles.content}>
        <View style={styles.topBarCompact}>
          <View style={styles.topBarActions}>
            <Text style={styles.serverText}>{appConfig.amApiBaseUrl}</Text>
            <KolamButton
              accessibilityLabel="AM Settings"
              label="Settings"
              intent="plain"
              size="sm"
              onPress={() => {
                const settingsRoute = getShellModuleRouteEntry(
                  'am',
                  'settings/account',
                );
                if (settingsRoute) {
                  onModuleRouteSelect?.(settingsRoute);
                }
              }}
            />
            <KolamButton label="Kembali" intent="outline" size="sm" onPress={onBackToCenter} />
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
          {activeRoute === 'dashboard' ? (
            <AmDashboardPage
              dashboard={dataset.am.dashboard}
              onModuleRouteSelect={onModuleRouteSelect}
            />
          ) : activeRoute === 'tasks' ? (
            <AmTasksPage initialTaskId={routeSelection?.taskId} />
          ) : activeRoute === 'services' ? (
            <AmServicesPage />
          ) : activeRoute === 'hardware' ? (
            <AmHardwarePage initialRoute={routeSelection?.hardwareRoute} />
          ) : activeRoute === 'webhooks' ? (
            <AmWebhooksPage />
          ) : activeRoute === 'transactions' ? (
            <AmTransfersPage initialTransferId={routeSelection?.transferId} />
          ) : activeRoute === 'mutasi' ? (
            <AmMutasiPage initialMutasiId={routeSelection?.mutasiId} />
          ) : activeRoute === 'users' ? (
            <AmUsersPage />
          ) : activeRoute === 'settings-account' ? (
            <AmAccountSettingsPage />
          ) : activeRoute === 'activity-log' ? (
            <AmActivityLogPage />
          ) : (
            <AmParityPlaceholder route={route} />
          )}
        </ScrollView>
      </View>
    </View>
  );
}

type AmRouteSelection = {
  route: AmRouteItem;
  taskId?: string;
  transferId?: string;
  mutasiId?: string;
  hardwareRoute?: AmHardwareInitialRoute;
};

type AmHardwareInitialRoute = {
  rackId?: string;
  boxId?: string;
  deviceId?: string;
};

function getAmRouteSelection(route?: string | null): AmRouteSelection {
  const normalizedRoute = normalizeModuleRoutePath(route);
  const routeItem = getAmRouteByModuleRoute(normalizedRoute);
  const segments = normalizedRoute === '/' ? [] : normalizedRoute.split('/');

  if (segments[0] === 'tasks' && isConcreteRouteSegment(segments[1])) {
    return {route: routeItem, taskId: segments[1]};
  }

  if (segments[0] === 'transactions' && isConcreteRouteSegment(segments[1])) {
    return {route: routeItem, transferId: segments[1]};
  }

  if (segments[0] === 'mutasi' && isConcreteRouteSegment(segments[1])) {
    return {route: routeItem, mutasiId: segments[1]};
  }

  if (segments[0] === 'hardware') {
    const hardwareRoute: AmHardwareInitialRoute = {};
    if (isConcreteRouteSegment(segments[1])) {
      hardwareRoute.rackId = segments[1];
    }
    if (isConcreteRouteSegment(segments[2])) {
      hardwareRoute.boxId = segments[2];
    }
    if (isConcreteRouteSegment(segments[3])) {
      hardwareRoute.deviceId = segments[3];
    }
    return Object.keys(hardwareRoute).length
      ? {route: routeItem, hardwareRoute}
      : {route: routeItem};
  }

  return {route: routeItem};
}

function getConcreteAmRouteEntry(
  route: string,
  templateRoute = route,
): ShellModuleRouteEntry | null {
  const template = getShellModuleRouteEntry('am', templateRoute);
  if (!template) return null;
  if (route === template.route) return template;
  return {
    ...template,
    id: `am:${route}`,
    route,
  };
}

function normalizeModuleRoutePath(route?: string | null) {
  if (!route || route === '/') return '/';
  return route.split('?')[0].replace(/^\/+/, '').replace(/\/+$/, '') || '/';
}

function isConcreteRouteSegment(segment?: string) {
  return Boolean(segment && !segment.startsWith(':'));
}

function AmDashboardPage({
  dashboard,
  onModuleRouteSelect,
}: {
  dashboard?: AmDashboardData | null;
  onModuleRouteSelect?: (route: ShellModuleRouteEntry) => void;
}) {
  const [data, setData] = React.useState<AmDashboardData | null>(dashboard ?? null);
  const [isLoading, setIsLoading] = React.useState(!dashboard);
  const [error, setError] = React.useState<string | null>(null);

  const fetchDashboard = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAmDashboard();
      setData(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load AM dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setData(dashboard ?? null);
  }, [dashboard]);

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await getAmDashboard();
        if (!mounted) return;
        setData(response);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load AM dashboard');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    load();
    const interval = setInterval(load, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const openAmRoute = React.useCallback((route: string, templateRoute = route) => {
    const entry = getConcreteAmRouteEntry(route, templateRoute);
    if (entry) {
      onModuleRouteSelect?.(entry);
    }
  }, [onModuleRouteSelect]);

  if (!data) {
    return (
      <View style={styles.emptyPanel}>
        <Text style={styles.panelTitle}>{isLoading ? 'Memuat dashboard AM live' : 'Menunggu data live AM'}</Text>
        <Text style={styles.panelText}>
          Dashboard akan terisi dari endpoint /dashboard setelah sesi Kolam punya akses AM.
        </Text>
        <AmInlineError error={error} title="AM dashboard belum bisa dibaca" />
        <KolamButton label="Refresh" intent="outline" size="sm" onPress={fetchDashboard} />
      </View>
    );
  }

  return (
    <View style={styles.pageStack}>
      <View style={styles.actionRow}>
        <Text style={styles.panelText}>Dashboard live AM dari endpoint /dashboard.</Text>
        <KolamButton
          disabled={isLoading}
          label={isLoading ? 'Refreshing...' : 'Refresh'}
          intent="outline"
          size="sm"
          onPress={fetchDashboard}
        />
      </View>
      <AmInlineError error={error} title="AM dashboard refresh gagal" />
      <View style={styles.metricGrid}>
        <AmMetricCard label="Total Balance" value={formatRupiah(data.summary.totalBalance)} meta={`${data.summary.totalAccounts} account`} />
        <AmMetricCard label="Incoming Today" value={formatRupiah(data.summary.todayIncoming.total)} meta={`${data.summary.todayIncoming.count} transaksi`} />
        <AmMetricCard label="Outgoing Today" value={formatRupiah(data.summary.todayOutgoing.total)} meta={`${data.summary.todayOutgoing.count} transaksi`} />
        <AmMetricCard label="Active Devices" value={String(data.summary.activeDevices)} meta={`${data.devices.length} device terdaftar`} />
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Transfer Status</Text>
        <View style={styles.statusRow}>
          <AmStatusPill label="Pending" value={data.transfers.pending} />
          <AmStatusPill label="Processing" value={data.transfers.processing} />
          <AmStatusPill label="Success" value={data.transfers.success} />
          <AmStatusPill label="Failed" value={data.transfers.failed} danger />
        </View>
        <Text style={styles.panelText}>Total amount hari ini: {formatRupiah(data.transfers.totalAmount)}</Text>
      </View>
      <View style={styles.panelGrid}>
        <AmRecentTransfersPanel
          onOpenRoute={openAmRoute}
          transfers={data.recentTransfers}
        />
        <AmRecentMutasiPanel
          onOpenRoute={openAmRoute}
          mutasi={data.recentMutasi}
        />
      </View>
      <View style={styles.panel}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.panelTitle}>7 Hari Mutasi</Text>
          <KolamButton
            accessibilityLabel="AM Dashboard View Mutations"
            label="View all"
            intent="outline"
            size="sm"
            onPress={() => openAmRoute('mutasi')}
          />
        </View>
        <AmMutationChart chartData={data.chartData} />
      </View>
      <View style={styles.panel}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.panelTitle}>Device Overview</Text>
          <KolamButton
            accessibilityLabel="AM Dashboard View Hardware"
            label="View all"
            intent="outline"
            size="sm"
            onPress={() => openAmRoute('hardware')}
          />
        </View>
        <Text style={styles.panelText}>All devices with active accounts and their locations.</Text>
        <View style={styles.detailListHeader}>
          <Text style={[styles.tableHeaderText, styles.serviceCol]}>Device</Text>
          <Text style={[styles.tableHeaderText, styles.deviceWideCol]}>Location</Text>
          <Text style={[styles.tableHeaderText, styles.statusCol]}>Accounts</Text>
          <Text style={[styles.tableHeaderText, styles.accountCol]}>Types</Text>
        </View>
        {data.devices.slice(0, 8).map(device => (
          <View key={device._id} style={styles.deviceRow}>
            <View style={styles.serviceCol}>
              <Text style={styles.rowTitle}>{device.name}</Text>
              <Text style={styles.rowMeta}>
                {[device.brand, device.model].filter(Boolean).join(' ') || device.udid}
              </Text>
            </View>
            <Text style={[styles.rowMeta, styles.deviceWideCol]}>
              {[device.boxName, device.rackName].filter(Boolean).join(' / ') || '-'}
            </Text>
            <Text style={[styles.rowMeta, styles.statusCol]}>{device.activeAccountCount}/{device.accountCount}</Text>
            <Text style={[styles.rowMeta, styles.accountCol]}>{device.accountTypes.length ? device.accountTypes.join(', ') : '-'}</Text>
          </View>
        ))}
        <AmLoadingOrEmpty
          isLoading={false}
          items={data.devices}
          loadingText="Memuat devices dashboard..."
          emptyText="No dashboard devices found"
        />
      </View>
    </View>
  );
}

function AmMutationChart({chartData}: {chartData: Array<{date: string; incoming: number; outgoing: number}>}) {
  const maxAmount = Math.max(
    1,
    ...chartData.flatMap(point => [point.incoming, point.outgoing]),
  );

  return (
    <View style={styles.chartStack}>
      <AmLoadingOrEmpty
        isLoading={false}
        items={chartData}
        loadingText="Memuat chart mutasi..."
        emptyText="No mutation chart data found"
      />
      {chartData.map(point => {
        const incomingWidth = `${Math.max(4, Math.round((point.incoming / maxAmount) * 100))}%` as DimensionValue;
        const outgoingWidth = `${Math.max(4, Math.round((point.outgoing / maxAmount) * 100))}%` as DimensionValue;
        return (
          <View key={point.date} style={styles.chartRow}>
            <Text style={styles.chartDate}>{formatShortDate(point.date)}</Text>
            <View style={styles.chartBars}>
              <View style={styles.chartBarTrack}>
                <View style={[styles.chartBar, styles.chartBarIncoming, {width: incomingWidth}]} />
              </View>
              <View style={styles.chartBarTrack}>
                <View style={[styles.chartBar, styles.chartBarOutgoing, {width: outgoingWidth}]} />
              </View>
            </View>
            <View style={styles.chartValues}>
              <Text style={styles.rowMeta}>In {formatCompactRupiah(point.incoming)}</Text>
              <Text style={styles.rowMeta}>Out {formatCompactRupiah(point.outgoing)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function AmRecentTransfersPanel({
  onOpenRoute,
  transfers,
}: {
  onOpenRoute: (route: string, templateRoute?: string) => void;
  transfers: AmTransfer[];
}) {
  return (
    <View style={styles.panel}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.panelTitle}>Recent Transfers</Text>
        <KolamButton
          accessibilityLabel="AM Dashboard View Transfers"
          label="View all"
          intent="outline"
          size="sm"
          onPress={() => onOpenRoute('transactions')}
        />
      </View>
      <Text style={styles.panelText}>Latest transfer activity across all devices.</Text>
      {transfers.slice(0, 5).map(transfer => (
        <KolamInteractionFrame
          key={transfer._id}
          accessibilityLabel={`AM Dashboard Transfer ${transfer._id}`}
          onPress={() => onOpenRoute(`transactions/${transfer._id}`, 'transactions/:id')}
          style={styles.deviceRow}>
          <View>
            <Text style={styles.rowTitle}>{transfer.recipientName || transfer.recipientAccount}</Text>
            <Text style={styles.rowMeta}>{formatBankAccount(transfer.accountId)} - {formatAmDate(transfer.createdAt)}</Text>
          </View>
          <View style={styles.rowActions}>
            <Text style={styles.amountText}>{formatRupiah(transfer.amount)}</Text>
            <AmStatusChip label={transfer.status} tone={getTransferTone(transfer.status)} />
          </View>
        </KolamInteractionFrame>
      ))}
      <AmLoadingOrEmpty
        isLoading={false}
        items={transfers}
        loadingText="Memuat recent transfers..."
        emptyText="No recent transfers found"
      />
    </View>
  );
}

function AmRecentMutasiPanel({
  mutasi,
  onOpenRoute,
}: {
  mutasi: AmMutasi[];
  onOpenRoute: (route: string, templateRoute?: string) => void;
}) {
  return (
    <View style={styles.panel}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.panelTitle}>Recent Mutations</Text>
        <KolamButton
          accessibilityLabel="AM Dashboard View Recent Mutations"
          label="View all"
          intent="outline"
          size="sm"
          onPress={() => onOpenRoute('mutasi')}
        />
      </View>
      <Text style={styles.panelText}>Latest incoming and outgoing transactions.</Text>
      {mutasi.slice(0, 5).map(item => (
        <KolamInteractionFrame
          key={item._id}
          accessibilityLabel={`AM Dashboard Mutation ${item._id}`}
          onPress={() => onOpenRoute(`mutasi/${item._id}`, 'mutasi/:id')}
          style={styles.deviceRow}>
          <View>
            <Text style={styles.rowTitle}>{item.type === 'masuk' ? 'In' : 'Out'} - {formatBankAccount(item.accountId)}</Text>
            <Text style={styles.rowMeta}>{item.description || formatDeviceRef(item.deviceId)} - {formatAmDate(item.detectedAt)}</Text>
          </View>
          <Text style={[styles.amountText, item.type === 'masuk' ? styles.amountPositive : styles.amountDanger]}>
            {item.type === 'masuk' ? '+' : '-'}{formatRupiah(item.amount)}
          </Text>
        </KolamInteractionFrame>
      ))}
      <AmLoadingOrEmpty
        isLoading={false}
        items={mutasi}
        loadingText="Memuat recent mutations..."
        emptyText="No recent mutations found"
      />
    </View>
  );
}

function AmTasksPage({initialTaskId}: {initialTaskId?: string}) {
  const [tasks, setTasks] = React.useState<AmTask[]>([]);
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<string>('all');
  const [type, setType] = React.useState<string>('all');
  const [serviceAccountId, setServiceAccountId] = React.useState<string>('all');
  const [deviceId, setDeviceId] = React.useState<string>('all');
  const [serviceAccounts, setServiceAccounts] = React.useState<AmServiceAccount[]>([]);
  const [devices, setDevices] = React.useState<AmDevice[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actingTaskId, setActingTaskId] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(AM_TASK_PAGE_LIMIT);
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSelectedTaskId(initialTaskId ?? null);
  }, [initialTaskId]);

  const fetchTasks = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAmTasks({
        page,
        limit: AM_TASK_PAGE_LIMIT,
        search: search.trim() || undefined,
        status: status === 'all' ? undefined : status,
        type: type === 'all' ? undefined : type,
        serviceAccountId: serviceAccountId === 'all' ? undefined : serviceAccountId,
        deviceId: deviceId === 'all' ? undefined : deviceId,
      });
      setTasks(response.data);
      setTotal(response.meta.total);
      setLimit(response.meta.limit || AM_TASK_PAGE_LIMIT);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat task AM live.');
    } finally {
      setIsLoading(false);
    }
  }, [deviceId, page, search, serviceAccountId, status, type]);

  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  React.useEffect(() => {
    let mounted = true;

    const loadFilterOptions = async () => {
      try {
        const [accountsResponse, devicesResponse] = await Promise.all([
          getAmServiceAccounts({limit: 100}),
          getAmDevices({limit: 100}),
        ]);
        if (!mounted) return;
        setServiceAccounts(accountsResponse.data);
        setDevices(devicesResponse.data);
      } catch {
        if (!mounted) return;
        setServiceAccounts([]);
        setDevices([]);
      }
    };

    loadFilterOptions();

    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    const interval = setInterval(fetchTasks, 10_000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const handleSearchChange = React.useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleTypeChange = React.useCallback((value: string) => {
    setType(value);
    setPage(1);
  }, []);

  const handleStatusChange = React.useCallback((value: string) => {
    setStatus(value);
    setPage(1);
  }, []);

  const handleServiceAccountChange = React.useCallback((value: string) => {
    setServiceAccountId(value);
    setPage(1);
  }, []);

  const handleDeviceChange = React.useCallback((value: string) => {
    setDeviceId(value);
    setPage(1);
  }, []);

  const serviceAccountFilterItems = React.useMemo(
    () => ['all', ...serviceAccounts.map(account => account._id)],
    [serviceAccounts],
  );
  const serviceAccountFilterLabels = React.useMemo(
    () => Object.fromEntries(
      serviceAccounts.map(account => [account._id, formatMutasiAccountOption(account)]),
    ),
    [serviceAccounts],
  );
  const deviceFilterItems = React.useMemo(
    () => ['all', ...devices.map(device => device._id)],
    [devices],
  );
  const deviceFilterLabels = React.useMemo(
    () => Object.fromEntries(
      devices.map(device => [device._id, device.name || device.udid || device.tcpAddress || device._id]),
    ),
    [devices],
  );

  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  const rangeFrom = total ? (page - 1) * limit + 1 : 0;
  const rangeTo = total ? Math.min(page * limit, total) : 0;

  const runTaskAction = React.useCallback(async (
    task: AmTask,
    action: 'cancel' | 'retry' | 'force-fail',
  ) => {
    try {
      setActingTaskId(task._id);
      setActionMessage(null);
      if (action === 'cancel') {
        await cancelAmTask(task._id);
        setActionMessage(`Task ${task._id} dibatalkan.`);
      } else if (action === 'retry') {
        await retryAmTask(task._id);
        setActionMessage(`Task ${task._id} dijadwalkan ulang.`);
      } else {
        await forceFailAmTask(task._id);
        setActionMessage(`Task ${task._id} ditandai gagal.`);
      }
      await fetchTasks();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Aksi task AM gagal.');
    } finally {
      setActingTaskId(null);
    }
  }, [fetchTasks]);

  if (selectedTaskId) {
    return (
      <AmTaskDetailPage
        id={selectedTaskId}
        onBack={() => {
          setSelectedTaskId(null);
          fetchTasks();
        }}
        onTaskAction={runTaskAction}
      />
    );
  }

  return (
    <View style={styles.pageStack}>
      <View style={styles.filterBar}>
        <KolamSearchField value={search} onChangeText={handleSearchChange} placeholder="Search..." containerStyle={styles.taskSearch} trailingLabel={`${total} task`} />
        <AmSegmentGroup active={type} items={TASK_TYPES} labels={TASK_TYPE_LABELS} onSelect={handleTypeChange} />
        <AmSegmentGroup active={status} items={TASK_STATUSES} onSelect={handleStatusChange} />
        {serviceAccountFilterItems.length > 1 ? (
          <AmSegmentGroup active={serviceAccountId} items={serviceAccountFilterItems} labels={serviceAccountFilterLabels} onSelect={handleServiceAccountChange} />
        ) : null}
        {deviceFilterItems.length > 1 ? (
          <AmSegmentGroup active={deviceId} items={deviceFilterItems} labels={deviceFilterLabels} onSelect={handleDeviceChange} />
        ) : null}
        <KolamButton label={isLoading ? 'Memuat' : 'Refresh'} intent="outline" size="sm" muted={isLoading} onPress={fetchTasks} />
      </View>
      {error ? (
        <View style={styles.errorPanel}>
          <Text style={styles.errorTitle}>AM live belum bisa dibaca</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      {actionMessage ? (
        <View style={styles.successPanel}>
          <Text style={styles.successText}>{actionMessage}</Text>
        </View>
      ) : null}
      <View style={styles.tablePanel}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.typeCol]}>Type</Text>
          <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
          <Text style={[styles.tableHeaderText, styles.deviceCol]}>Device</Text>
          <Text style={[styles.tableHeaderText, styles.accountCol]}>Account</Text>
          <Text style={[styles.tableHeaderText, styles.errorCol]}>Error</Text>
          <Text style={[styles.tableHeaderText, styles.dateCol]}>Created</Text>
          <Text style={[styles.tableHeaderText, styles.actionCol]}>Action</Text>
        </View>
        {isLoading && !tasks.length ? <Text style={styles.loadingText}>Memuat tasks dari AM live...</Text> : null}
        {!isLoading && !tasks.length ? <Text style={styles.loadingText}>No tasks found</Text> : null}
        {tasks.map(task => (
          <KolamInteractionFrame
            key={task._id}
            accessibilityLabel={`AM Task Detail ${task._id}`}
            accessibilityRole="button"
            onPress={() => setSelectedTaskId(task._id)}
            style={styles.tableRow}>
            <Text style={[styles.cellText, styles.typeCol]}>{TASK_TYPE_LABELS[task.type] ?? task.type}</Text>
            <Text style={[styles.cellText, styles.statusCol]}>{task.status}</Text>
            <Text style={[styles.cellText, styles.deviceCol]} numberOfLines={1}>{task.deviceId?.name ?? '-'}</Text>
            <Text style={[styles.cellText, styles.accountCol]} numberOfLines={1}>{task.serviceAccountId?.label ?? task.serviceAccountId?.platform ?? '-'}</Text>
            <Text style={[styles.cellText, styles.errorCol]} numberOfLines={1}>{task.error || '-'}</Text>
            <Text style={[styles.cellText, styles.dateCol]}>{formatAmDate(task.createdAt)}</Text>
            <View style={styles.actionCol}>
              <AmTaskActions
                disabled={actingTaskId === task._id}
                task={task}
                onAction={runTaskAction}
              />
            </View>
          </KolamInteractionFrame>
        ))}
        {total > limit ? (
          <View style={styles.paginationBar}>
            <Text style={styles.paginationText}>
              Showing {rangeFrom} to {rangeTo} of {total} items
            </Text>
            <View style={styles.inlineActions}>
              <KolamButton
                accessibilityLabel="AM Tasks Previous Page"
                disabled={page <= 1 || isLoading}
                label="Previous"
                intent="outline"
                size="sm"
                onPress={() => setPage(current => Math.max(1, current - 1))}
              />
              <KolamButton
                accessibilityLabel="AM Tasks Next Page"
                disabled={page >= totalPages || isLoading}
                label={`Page ${page}/${totalPages}`}
                intent="outline"
                size="sm"
                onPress={() => setPage(current => Math.min(totalPages, current + 1))}
              />
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function AmTaskDetailPage({
  id,
  onBack,
  onTaskAction,
}: {
  id: string;
  onBack: () => void;
  onTaskAction: (task: AmTask, action: 'cancel' | 'retry' | 'force-fail') => Promise<void>;
}) {
  const [task, setTask] = React.useState<AmTask | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [acting, setActing] = React.useState(false);

  const fetchTask = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAmTaskById(id);
      setTask(response);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat detail task AM.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  React.useEffect(() => {
    if (task?.status !== 'processing') return undefined;
    const interval = setInterval(fetchTask, 5000);
    return () => clearInterval(interval);
  }, [fetchTask, task?.status]);

  const runDetailAction = React.useCallback(async (
    action: 'cancel' | 'retry' | 'force-fail',
  ) => {
    if (!task) return;
    try {
      setActing(true);
      await onTaskAction(task, action);
      await fetchTask();
    } finally {
      setActing(false);
    }
  }, [fetchTask, onTaskAction, task]);

  if (isLoading && !task) {
    return (
      <View style={styles.emptyPanel}>
        <Text style={styles.panelTitle}>Memuat task detail</Text>
        <Text style={styles.panelText}>Mengambil detail task dari AM live...</Text>
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={styles.emptyPanel}>
        <Text style={styles.panelTitle}>Task tidak ditemukan</Text>
        <Text style={styles.panelText}>{error ?? 'Task not found'}</Text>
        <KolamButton label="Kembali" intent="outline" size="sm" onPress={onBack} />
      </View>
    );
  }

  return (
    <View style={styles.pageStack}>
      <View style={styles.detailHeader}>
        <View>
          <Text style={styles.panelTitle}>Task Detail</Text>
          <Text style={styles.panelText}>{TASK_TYPE_LABELS[task.type] ?? task.type} - {task._id}</Text>
        </View>
        <View style={styles.inlineActions}>
          <KolamButton label="Kembali" intent="outline" size="sm" onPress={onBack} />
          <KolamButton label={isLoading ? 'Memuat' : 'Refresh'} intent="outline" size="sm" muted={isLoading} onPress={fetchTask} />
        </View>
      </View>
      <View style={styles.cardGrid}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Overview</Text>
          <AmDetailLine label="Type" value={TASK_TYPE_LABELS[task.type] ?? task.type} />
          <AmDetailLine label="Status" value={task.status} />
          <AmDetailLine label="Priority" value={String(task.priority)} />
          <AmDetailLine label="Retry" value={`${task.retryCount} / ${task.maxRetries}`} />
        </View>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Assignment</Text>
          <AmDetailLine label="Device" value={task.deviceId?.name ?? '-'} />
          <AmDetailLine label="Account" value={task.serviceAccountId?.label ?? '-'} />
          <AmDetailLine label="Platform" value={task.serviceAccountId?.platform ?? '-'} />
        </View>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Timeline</Text>
          <AmDetailLine label="Created By" value={formatTaskCreatedBy(task.createdBy)} />
          <AmDetailLine label="Created" value={formatAmDate(task.createdAt)} />
          <AmDetailLine label="Started" value={formatAmDate(task.startedAt)} />
          <AmDetailLine label="Completed" value={formatAmDate(task.completedAt)} />
        </View>
      </View>
      {task.error ? <AmInlineError error={task.error} title="Task error" /> : null}
      <AmTaskActions
        disabled={acting}
        task={task}
        onAction={(_, action) => runDetailAction(action)}
      />
      <View style={styles.panelGrid}>
        <AmJsonPanel title="Payload" value={task.payload} />
        <AmJsonPanel title="Result" value={task.result} />
      </View>
      {task.logs.length > 0 ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Logs ({task.logs.length} lines)</Text>
          <View style={styles.logPanel}>
            {task.logs.map((line, index) => (
              <Text key={`${index}-${line}`} style={styles.logText}>{line}</Text>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function AmDetailLine({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.detailListRow}>
      <Text style={styles.rowMeta}>{label}</Text>
      <Text style={styles.rowTitle}>{value}</Text>
    </View>
  );
}

function AmJsonPanel({title, value}: {title: string; value: unknown}) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{title}</Text>
      <View style={styles.logPanel}>
        <Text style={styles.logText}>{JSON.stringify(value, null, 2)}</Text>
      </View>
    </View>
  );
}

function AmServicesPage() {
  const [accounts, setAccounts] = React.useState<AmServiceAccount[]>([]);
  const [devices, setDevices] = React.useState<AmDevice[]>([]);
  const [search, setSearch] = React.useState('');
  const [platform, setPlatform] = React.useState('all');
  const [serviceStatus, setServiceStatus] = React.useState('all');
  const [editingServiceId, setEditingServiceId] = React.useState<string | null>(null);
  const [formPlatform, setFormPlatform] = React.useState('tokopedia');
  const [formStatus, setFormStatus] = React.useState<AmServiceAccount['status']>('inactive');
  const [formLabel, setFormLabel] = React.useState('');
  const [formDeviceId, setFormDeviceId] = React.useState('none');
  const [formUsername, setFormUsername] = React.useState('');
  const [formPassword, setFormPassword] = React.useState('');
  const [formPin, setFormPin] = React.useState('');
  const [formAccountNumber, setFormAccountNumber] = React.useState('');
  const [formPhoneNumber, setFormPhoneNumber] = React.useState('');
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [expandedTab, setExpandedTab] = React.useState<'logs' | 'history'>('logs');
  const [sessionToClear, setSessionToClear] = React.useState<AmServiceAccount | null>(null);
  const [detailLogSource, setDetailLogSource] = React.useState<'realtime' | 'history'>('realtime');
  const [detailLogPage, setDetailLogPage] = React.useState(1);
  const [detailLogTotal, setDetailLogTotal] = React.useState(0);
  const [detailLogLimit, setDetailLogLimit] = React.useState(AM_SERVICE_LOG_PAGE_LIMIT);
  const [detailLogs, setDetailLogs] = React.useState<AmDeviceServiceLog[]>([]);
  const [detailServices, setDetailServices] = React.useState<AmDeviceServiceStatus[]>([]);
  const [detailTasks, setDetailTasks] = React.useState<AmTask[]>([]);
  const [detailTransfers, setDetailTransfers] = React.useState<AmTransfer[]>([]);
  const [detailHistoryPage, setDetailHistoryPage] = React.useState(1);
  const [detailHistoryTotal, setDetailHistoryTotal] = React.useState(0);
  const [detailHistoryLimit, setDetailHistoryLimit] = React.useState(5);
  const [detailRunning, setDetailRunning] = React.useState(false);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState<string | null>(null);
  const [actingServiceId, setActingServiceId] = React.useState<string | null>(null);
  const [serviceInputValue, setServiceInputValue] = React.useState('');
  const [serviceInputSending, setServiceInputSending] = React.useState(false);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(AM_SERVICE_PAGE_LIMIT);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAccounts = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAmServiceAccounts({
        page,
        limit: AM_SERVICE_PAGE_LIMIT,
        search: search.trim() || undefined,
        platform: platform === 'all' ? undefined : platform,
        status: serviceStatus === 'all' ? undefined : serviceStatus,
      });
      setAccounts(response.data);
      setTotal(response.meta.total ?? response.data.length);
      setLimit(response.meta.limit || AM_SERVICE_PAGE_LIMIT);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat services AM live.');
    } finally {
      setIsLoading(false);
    }
  }, [page, platform, search, serviceStatus]);

  React.useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  React.useEffect(() => {
    let mounted = true;

    const loadDevices = async () => {
      try {
        const response = await getAmDevices({limit: 100});
        if (mounted) setDevices(response.data);
      } catch {
        if (mounted) setDevices([]);
      }
    };

    loadDevices();

    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    const interval = setInterval(fetchAccounts, 15_000);
    return () => clearInterval(interval);
  }, [fetchAccounts]);

  const handleSearchChange = React.useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePlatformChange = React.useCallback((value: string) => {
    setPlatform(value);
    setPage(1);
  }, []);

  const handleServiceStatusChange = React.useCallback((value: string) => {
    setServiceStatus(value);
    setPage(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  const rangeFrom = total ? (page - 1) * limit + 1 : 0;
  const rangeTo = total ? Math.min(page * limit, total) : 0;
  const serviceDeviceItems = React.useMemo(
    () => ['none', ...devices.map(device => device._id)],
    [devices],
  );
  const serviceDeviceLabels = React.useMemo<Record<string, string>>(
    () => ({
      none: 'No device',
      ...Object.fromEntries(devices.map(device => [device._id, `${device.name} (${formatDeviceIdentifier(device)})`])),
    }),
    [devices],
  );

  const resetServiceForm = React.useCallback(() => {
    setEditingServiceId(null);
    setFormPlatform('tokopedia');
    setFormStatus('inactive');
    setFormLabel('');
    setFormDeviceId('none');
    setFormUsername('');
    setFormPassword('');
    setFormPin('');
    setFormAccountNumber('');
    setFormPhoneNumber('');
  }, []);

  const editServiceAccount = React.useCallback((account: AmServiceAccount) => {
    const device = getServiceDevice(account);
    setEditingServiceId(account._id);
    setFormPlatform(account.platform);
    setFormStatus(account.status);
    setFormLabel(account.label);
    setFormDeviceId(device?._id ?? 'none');
    setFormUsername(account.username ?? '');
    setFormPassword('');
    setFormPin('');
    setFormAccountNumber(account.accountNumber ?? '');
    setFormPhoneNumber(getCredentialString(account.credentials, 'phoneNumber') ?? '');
  }, []);

  const buildServiceAccountPayload = React.useCallback((): AmServiceAccountPayload => {
    const credentials: Record<string, unknown> = {};
    if (formPhoneNumber.trim()) credentials.phoneNumber = formPhoneNumber.trim();

    return {
      platform: formPlatform,
      label: formLabel.trim(),
      deviceId: formDeviceId === 'none' ? null : formDeviceId,
      username: formUsername.trim(),
      password: formPassword.trim(),
      pin: formPin.trim(),
      accountNumber: formAccountNumber.trim(),
      credentials,
      status: formStatus,
    };
  }, [
    formAccountNumber,
    formDeviceId,
    formLabel,
    formPassword,
    formPhoneNumber,
    formPin,
    formPlatform,
    formStatus,
    formUsername,
  ]);

  const submitServiceAccountForm = React.useCallback(async () => {
    const payload = buildServiceAccountPayload();
    if (!payload.platform || !payload.label) {
      setError('Platform dan label service wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      setActionMessage(null);
      setError(null);
      if (editingServiceId) {
        await updateAmServiceAccount(editingServiceId, payload);
        setActionMessage(`${payload.label} diperbarui.`);
      } else {
        await createAmServiceAccount({
          ...payload,
          platform: String(payload.platform),
          label: String(payload.label),
        });
        setActionMessage(`${payload.label} dibuat.`);
      }
      resetServiceForm();
      await fetchAccounts();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal menyimpan service account AM.');
    } finally {
      setIsSubmitting(false);
    }
  }, [buildServiceAccountPayload, editingServiceId, fetchAccounts, resetServiceForm]);

  const loadServiceLogs = React.useCallback(async (
    account: AmServiceAccount,
    source: 'realtime' | 'history' = 'realtime',
    logPage = 1,
    silent = false,
  ) => {
    const device = getServiceDevice(account);
    if (!device?._id) {
      setDetailLogs([]);
      setDetailServices([]);
      setDetailRunning(false);
      setDetailLogPage(1);
      setDetailLogTotal(0);
      setDetailLogLimit(AM_SERVICE_LOG_PAGE_LIMIT);
      setDetailError('Service belum punya device.');
      return;
    }

    try {
      if (!silent) setDetailLoading(true);
      setDetailLogSource(source);
      setDetailLogPage(logPage);
      const [response, statusResponse] = await Promise.all([
        getAmDeviceServiceLogs(device._id, {
          limit: AM_SERVICE_LOG_PAGE_LIMIT,
          source,
          page: logPage,
        }),
        getAmDeviceServices(device._id),
      ]);
      setDetailLogs(response.logs);
      setDetailServices(statusResponse);
      setDetailRunning(response.processRunning);
      setDetailLogTotal(response.total ?? response.logs.length);
      setDetailLogLimit(response.limit || AM_SERVICE_LOG_PAGE_LIMIT);
      setDetailError(null);
    } catch (nextError) {
      setDetailError(nextError instanceof Error ? nextError.message : 'Gagal memuat service logs.');
    } finally {
      if (!silent) setDetailLoading(false);
    }
  }, []);

  const loadServiceHistory = React.useCallback(async (
    account: AmServiceAccount,
    historyPage = 1,
  ) => {
    try {
      setDetailLoading(true);
      setDetailHistoryPage(historyPage);
      if (isTransferBanking(account.platform)) {
        const response = await getAmTransfers({
          serviceAccountId: account._id,
          limit: 5,
          page: historyPage,
        });
        setDetailTransfers(response.data);
        setDetailHistoryTotal(response.meta.total ?? response.data.length);
        setDetailHistoryLimit(response.meta.limit || 5);
        setDetailTasks([]);
      } else {
        const response = await getAmTasks({
          serviceAccountId: account._id,
          limit: 5,
          page: historyPage,
        });
        setDetailTasks(response.data);
        setDetailHistoryTotal(response.meta.total ?? response.data.length);
        setDetailHistoryLimit(response.meta.limit || 5);
        setDetailTransfers([]);
      }
      setDetailError(null);
    } catch (nextError) {
      setDetailError(nextError instanceof Error ? nextError.message : 'Gagal memuat service history.');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const toggleService = React.useCallback(async (account: AmServiceAccount) => {
    if (expandedId === account._id) {
      setExpandedId(null);
      setDetailLogs([]);
      setDetailServices([]);
      setDetailTasks([]);
      setDetailTransfers([]);
      setDetailHistoryPage(1);
      setDetailHistoryTotal(0);
      setDetailHistoryLimit(5);
      setDetailLogSource('realtime');
      setDetailLogPage(1);
      setDetailLogTotal(0);
      setDetailLogLimit(AM_SERVICE_LOG_PAGE_LIMIT);
      setDetailError(null);
      setServiceInputValue('');
      return;
    }

    setExpandedId(account._id);
    setExpandedTab(isTransferBanking(account.platform) ? 'history' : 'logs');
    setDetailLogs([]);
    setDetailServices([]);
    setDetailTasks([]);
    setDetailTransfers([]);
    setDetailHistoryPage(1);
    setDetailHistoryTotal(0);
    setDetailHistoryLimit(5);
    setDetailLogSource('realtime');
    setDetailLogPage(1);
    setDetailLogTotal(0);
    setDetailLogLimit(AM_SERVICE_LOG_PAGE_LIMIT);
    setServiceInputValue('');
    if (isTransferBanking(account.platform)) {
      await loadServiceHistory(account, 1);
    } else {
      await loadServiceLogs(account);
    }
  }, [expandedId, loadServiceHistory, loadServiceLogs]);

  const selectDetailTab = React.useCallback(async (
    account: AmServiceAccount,
    tab: 'logs' | 'history',
  ) => {
    setExpandedTab(tab);
    if (tab === 'history') {
      await loadServiceHistory(account, 1);
    } else {
      await loadServiceLogs(account);
    }
  }, [loadServiceHistory, loadServiceLogs]);

  const changeServiceLogSource = React.useCallback(async (
    account: AmServiceAccount,
    source: 'realtime' | 'history',
  ) => {
    await loadServiceLogs(account, source, 1);
  }, [loadServiceLogs]);

  const changeServiceLogPage = React.useCallback(async (
    account: AmServiceAccount,
    nextPage: number,
  ) => {
    await loadServiceLogs(account, 'history', nextPage);
  }, [loadServiceLogs]);

  const changeServiceHistoryPage = React.useCallback(async (
    account: AmServiceAccount,
    nextPage: number,
  ) => {
    await loadServiceHistory(account, nextPage);
  }, [loadServiceHistory]);

  const runServicePowerAction = React.useCallback(async (account: AmServiceAccount) => {
    const device = getServiceDevice(account);
    if (!device?._id) {
      setError('Service belum punya device.');
      return;
    }

    try {
      setActingServiceId(account._id);
      setActionMessage(null);
      if (account.status === 'active') {
        await stopAmDeviceService(device._id, account._id);
        setActionMessage(`${account.label} dihentikan.`);
      } else {
        await startAmDeviceService(device._id, account._id);
        setActionMessage(`${account.label} dijalankan.`);
      }
      await fetchAccounts();
      if (expandedId === account._id) {
        await loadServiceLogs(account);
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Aksi service AM gagal.');
    } finally {
      setActingServiceId(null);
    }
  }, [expandedId, fetchAccounts, loadServiceLogs]);

  const clearServiceSession = React.useCallback(async (account: AmServiceAccount) => {
    try {
      setActingServiceId(account._id);
      setActionMessage(null);
      const result = await clearAmServiceAccountSession(account._id);
      const deleted = result.deleted?.length ?? 0;
      setActionMessage(deleted > 0 ? `${account.label} session dibersihkan (${deleted} file).` : `${account.label} session state dibersihkan.`);
      setSessionToClear(null);
      setDetailLogs([]);
      setDetailServices([]);
      setDetailRunning(false);
      await fetchAccounts();
    } catch (nextError) {
      setDetailError(nextError instanceof Error ? nextError.message : 'Gagal membersihkan session service.');
    } finally {
      setActingServiceId(null);
    }
  }, [fetchAccounts]);

  const deleteServiceAccount = React.useCallback(async (account: AmServiceAccount) => {
    try {
      setActingServiceId(account._id);
      setActionMessage(null);
      setError(null);
      await deleteAmServiceAccount(account._id);
      if (expandedId === account._id) {
        setExpandedId(null);
        setDetailLogs([]);
        setDetailServices([]);
        setDetailTasks([]);
        setDetailTransfers([]);
        setDetailLogSource('realtime');
        setDetailLogPage(1);
        setDetailLogTotal(0);
        setDetailLogLimit(AM_SERVICE_LOG_PAGE_LIMIT);
        setDetailError(null);
      }
      if (editingServiceId === account._id) {
        resetServiceForm();
      }
      setActionMessage(`${account.label} dihapus.`);
      await fetchAccounts();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal menghapus service account AM.');
    } finally {
      setActingServiceId(null);
    }
  }, [editingServiceId, expandedId, fetchAccounts, resetServiceForm]);

  const submitServiceInput = React.useCallback(async (account: AmServiceAccount, inputType: 'otp' | 'password') => {
    const device = getServiceDevice(account);
    const value = serviceInputValue.trim();
    if (!device?._id) {
      setDetailError('Service belum punya device.');
      return;
    }
    if (!value) {
      setDetailError(inputType === 'password' ? 'Password wajib diisi.' : 'OTP wajib diisi.');
      return;
    }

    try {
      setServiceInputSending(true);
      setDetailError(null);
      await sendAmDeviceServiceInput(device._id, 'otp', value);
      setServiceInputValue('');
      setActionMessage(`${inputType === 'password' ? 'Password' : 'OTP'} dikirim ke ${account.label}.`);
      await loadServiceLogs(account);
    } catch (nextError) {
      setDetailError(nextError instanceof Error ? nextError.message : 'Gagal mengirim input service.');
    } finally {
      setServiceInputSending(false);
    }
  }, [loadServiceLogs, serviceInputValue]);

  const expandedServiceAccount = React.useMemo(
    () => accounts.find(account => account._id === expandedId) ?? null,
    [accounts, expandedId],
  );

  React.useEffect(() => {
    if (
      !expandedServiceAccount ||
      expandedTab !== 'logs' ||
      detailLogSource !== 'realtime' ||
      isTransferBanking(expandedServiceAccount.platform)
    ) {
      return undefined;
    }

    const interval = setInterval(() => {
      loadServiceLogs(expandedServiceAccount, 'realtime', 1, true).catch(() => undefined);
    }, 3000);

    return () => clearInterval(interval);
  }, [detailLogSource, expandedServiceAccount, expandedTab, loadServiceLogs]);

  return (
    <View style={styles.pageStack}>
      <View style={styles.filterBar}>
        <KolamSearchField
          value={search}
          onChangeText={handleSearchChange}
          placeholder="Search services..."
          containerStyle={styles.taskSearch}
          trailingLabel={`${total} service`}
        />
        <AmSegmentGroup
          active={platform}
          items={AM_PLATFORMS}
          labels={AM_PLATFORM_LABELS}
          onSelect={handlePlatformChange}
        />
        <AmSegmentGroup
          active={serviceStatus}
          items={['all', 'active', 'inactive', 'blocked']}
          onSelect={handleServiceStatusChange}
        />
        <KolamButton
          label={isLoading ? 'Memuat' : 'Refresh'}
          intent="outline"
          muted={isLoading}
          size="sm"
          onPress={fetchAccounts}
        />
      </View>
      {error ? (
        <View style={styles.errorPanel}>
          <Text style={styles.errorTitle}>Services AM belum bisa dibaca</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      {actionMessage ? (
        <View style={styles.successPanel}>
          <Text style={styles.successText}>{actionMessage}</Text>
        </View>
      ) : null}
      {sessionToClear ? (
        <View style={styles.warningPanel}>
          <Text style={styles.warningText}>Clear session {sessionToClear.label}?</Text>
          <Text style={styles.panelText}>Service akan dihentikan dan login berikutnya perlu session baru.</Text>
          <View style={styles.inlineActions}>
            <KolamButton
              accessibilityLabel={`AM Service Confirm Clear Session ${sessionToClear._id}`}
              intent="danger"
              label={actingServiceId === sessionToClear._id ? 'Clearing...' : 'Clear Session'}
              muted={actingServiceId === sessionToClear._id}
              size="sm"
              onPress={() => clearServiceSession(sessionToClear)}
            />
            <KolamButton
              accessibilityLabel="AM Service Cancel Clear Session"
              intent="outline"
              label="Cancel"
              muted={actingServiceId === sessionToClear._id}
              size="sm"
              onPress={() => setSessionToClear(null)}
            />
          </View>
        </View>
      ) : null}
      <View style={styles.panel}>
        <View style={styles.detailHeader}>
          <View>
            <Text style={styles.panelTitle}>{editingServiceId ? 'Edit Service Account' : 'Create Service Account'}</Text>
            <Text style={styles.panelText}>Payload mengikuti AM BE live /service-account. Secret kosong saat edit tidak menghapus nilai tersimpan.</Text>
          </View>
          {editingServiceId ? (
            <KolamButton
              accessibilityLabel="AM Service Form Cancel Edit"
              intent="outline"
              label="Cancel Edit"
              muted={isSubmitting}
              size="sm"
              onPress={resetServiceForm}
            />
          ) : null}
        </View>
        <View style={styles.filterBar}>
          <AmSegmentGroup
            active={formPlatform}
            items={AM_PLATFORMS.filter(item => item !== 'all')}
            labels={AM_PLATFORM_LABELS}
            onSelect={setFormPlatform}
          />
          <AmSegmentGroup
            active={formStatus}
            items={['active', 'inactive', 'blocked']}
            onSelect={value => setFormStatus(value)}
          />
          <AmSegmentGroup
            active={formDeviceId}
            items={serviceDeviceItems}
            labels={serviceDeviceLabels}
            onSelect={setFormDeviceId}
          />
        </View>
        <View style={styles.formGrid}>
          <AmTextInput label="Label" placeholder="Tokopedia Seller Center" value={formLabel} onChangeText={setFormLabel} />
          <AmTextInput label="Username" placeholder="username/email opsional" value={formUsername} onChangeText={setFormUsername} />
          <AmTextInput label="Password" placeholder={editingServiceId ? 'Kosongkan jika tidak mengganti' : 'password opsional'} secureTextEntry value={formPassword} onChangeText={setFormPassword} />
          <AmTextInput label="PIN" placeholder={editingServiceId ? 'Kosongkan jika tidak mengganti' : 'PIN opsional'} secureTextEntry value={formPin} onChangeText={setFormPin} />
          <AmTextInput label="Account Number" placeholder="nomor akun/rekening" value={formAccountNumber} onChangeText={setFormAccountNumber} />
          <AmTextInput label="Phone Number" placeholder="credentials.phoneNumber" value={formPhoneNumber} onChangeText={setFormPhoneNumber} />
        </View>
        <View style={styles.inlineActions}>
          <KolamButton
            accessibilityLabel="AM Service Account Save"
            label={isSubmitting ? 'Menyimpan' : editingServiceId ? 'Update Service' : 'Create Service'}
            muted={isSubmitting}
            size="sm"
            onPress={submitServiceAccountForm}
          />
        </View>
      </View>
      <View style={styles.tablePanel}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.serviceCol]}>Service</Text>
          <Text style={[styles.tableHeaderText, styles.platformCol]}>Platform</Text>
          <Text style={[styles.tableHeaderText, styles.deviceWideCol]}>Device</Text>
          <Text style={[styles.tableHeaderText, styles.accountCol]}>Account</Text>
          <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
        </View>
        {isLoading && !accounts.length ? <Text style={styles.loadingText}>Memuat services dari AM live...</Text> : null}
        {!isLoading && !accounts.length ? <Text style={styles.loadingText}>No services found</Text> : null}
        {accounts.map(account => {
          const device = getServiceDevice(account);
          const active = account.status === 'active';
          const expanded = expandedId === account._id;
          return (
            <View key={account._id}>
              <KolamInteractionFrame
                accessibilityLabel={`AM Service ${account.label}`}
                accessibilityRole="button"
                onPress={() => toggleService(account)}
                style={[styles.tableRow, expanded && styles.tableRowExpanded]}>
                <View style={styles.serviceCol}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{account.label}</Text>
                  <Text style={styles.rowMeta}>{expanded ? 'Expanded' : active ? 'Running' : 'Stopped'}</Text>
                </View>
                <Text style={[styles.cellText, styles.platformCol]}>{AM_PLATFORM_LABELS[account.platform] ?? account.platform}</Text>
                <View style={styles.deviceWideCol}>
                  <Text style={styles.cellText} numberOfLines={1}>{device?.name ?? 'Unassigned'}</Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>{formatServiceDeviceMeta(device)}</Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>{formatServiceDeviceLocation(device)}</Text>
                </View>
                <Text style={[styles.cellText, styles.accountCol]} numberOfLines={1}>
                  {account.accountNumber ?? account.username ?? getCredentialString(account.credentials, 'phoneNumber') ?? '-'}
                </Text>
              <View style={styles.statusCol}>
                <View style={styles.statusActionStack}>
                  <AmStatusChip label={active ? 'Ready' : account.status} tone={active ? 'success' : 'warning'} />
                  <KolamButton
                    accessibilityLabel={`AM Service ${active ? 'Stop' : 'Start'} ${account._id}`}
                    intent={active ? 'outline' : 'warning'}
                    label={actingServiceId === account._id ? '...' : active ? 'Stop' : 'Start'}
                    muted={actingServiceId === account._id || !device}
                    size="sm"
                    onPress={() => runServicePowerAction(account)}
                  />
                  <KolamButton
                    accessibilityLabel={`AM Service Edit ${account._id}`}
                    intent="outline"
                    label="Edit"
                    muted={isSubmitting}
                    size="sm"
                    onPress={() => editServiceAccount(account)}
                  />
                  <KolamButton
                    accessibilityLabel={`AM Service Delete ${account._id}`}
                    intent="danger"
                    label={actingServiceId === account._id ? '...' : 'Delete'}
                    muted={actingServiceId === account._id}
                    size="sm"
                    onPress={() => deleteServiceAccount(account)}
                  />
                </View>
              </View>
            </KolamInteractionFrame>
              {expanded ? (
                <AmServiceDetailPanel
                  account={account}
                  activeTab={expandedTab}
                  detailError={detailError}
                  isLoading={detailLoading}
                  logs={detailLogs}
                  logLimit={detailLogLimit}
                  logPage={detailLogPage}
                  logSource={detailLogSource}
                  logTotal={detailLogTotal}
                  historyLimit={detailHistoryLimit}
                  historyPage={detailHistoryPage}
                  historyTotal={detailHistoryTotal}
                  serviceInputSending={serviceInputSending}
                  serviceInputValue={serviceInputValue}
                  serviceStatuses={detailServices}
                  processRunning={detailRunning}
                  tasks={detailTasks}
                  transfers={detailTransfers}
                  canClearSession={PLAYWRIGHT_PLATFORMS.has(account.platform)}
                  clearingSession={actingServiceId === account._id}
                  onClearSession={() => setSessionToClear(account)}
                  onChangeServiceInput={setServiceInputValue}
                  onHistoryPageChange={nextPage => changeServiceHistoryPage(account, nextPage)}
                  onLogPageChange={nextPage => changeServiceLogPage(account, nextPage)}
                  onLogSourceChange={source => changeServiceLogSource(account, source)}
                  onSelectTab={tab => selectDetailTab(account, tab)}
                  onSubmitServiceInput={inputType => submitServiceInput(account, inputType)}
                />
              ) : null}
            </View>
          );
        })}
        {total > 0 ? (
          <View style={styles.paginationBar}>
            <Text style={styles.paginationText}>
              Showing {rangeFrom} to {rangeTo} of {total} items
            </Text>
            <View style={styles.inlineActions}>
              <KolamButton
                accessibilityLabel="AM Services Previous Page"
                disabled={page <= 1 || isLoading}
                label="Previous"
                intent="outline"
                size="sm"
                onPress={() => setPage(current => Math.max(1, current - 1))}
              />
              <KolamButton
                accessibilityLabel="AM Services Next Page"
                disabled={page >= totalPages || isLoading}
                label={`Page ${page}/${totalPages}`}
                intent="outline"
                size="sm"
                onPress={() => setPage(current => Math.min(totalPages, current + 1))}
              />
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function AmTaskActions({
  disabled,
  onAction,
  task,
}: {
  disabled: boolean;
  onAction: (task: AmTask, action: 'cancel' | 'retry' | 'force-fail') => void;
  task: AmTask;
}) {
  const actions: Array<{
    id: 'cancel' | 'retry' | 'force-fail';
    label: string;
    intent: 'outline' | 'danger' | 'warning';
  }> = [];

  if (task.status === 'pending') {
    actions.push({id: 'cancel', label: 'Cancel', intent: 'outline'});
  }

  if (task.status === 'processing') {
    actions.push({id: 'force-fail', label: 'Force Fail', intent: 'danger'});
  }

  if (task.status === 'failed') {
    actions.push({id: 'retry', label: 'Retry', intent: 'warning'});
  }

  if (!actions.length) {
    return <Text style={styles.rowMeta}>-</Text>;
  }

  return (
    <View style={styles.inlineActions}>
      {actions.map(action => (
        <KolamButton
          key={action.id}
          accessibilityLabel={`AM Task ${action.label} ${task._id}`}
          intent={action.intent}
          label={disabled ? '...' : action.label}
          muted={disabled}
          size="sm"
          onPress={() => onAction(task, action.id)}
        />
      ))}
    </View>
  );
}

function AmHardwarePage({initialRoute}: {initialRoute?: AmHardwareInitialRoute}) {
  const [racks, setRacks] = React.useState<AmRack[]>([]);
  const [boxes, setBoxes] = React.useState<AmBox[]>([]);
  const [devices, setDevices] = React.useState<AmDevice[]>([]);
  const [selectedRackId, setSelectedRackId] = React.useState<string | null>(null);
  const [selectedBoxId, setSelectedBoxId] = React.useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = React.useState<string | null>(null);
  const [hardwareForm, setHardwareForm] = React.useState<'rack' | 'box' | 'device'>('rack');
  const [editingHardwareId, setEditingHardwareId] = React.useState<string | null>(null);
  const [formLocation, setFormLocation] = React.useState('');
  const [formDescription, setFormDescription] = React.useState('');
  const [formServerIp, setFormServerIp] = React.useState('');
  const [formStatus, setFormStatus] = React.useState<'active' | 'inactive'>('active');
  const [formRackId, setFormRackId] = React.useState('');
  const [formBoxId, setFormBoxId] = React.useState('');
  const [formConnectionType, setFormConnectionType] = React.useState<'usb' | 'tcp' | 'browser'>('usb');
  const [formUdid, setFormUdid] = React.useState('');
  const [formTcpAddress, setFormTcpAddress] = React.useState('');
  const [formBrand, setFormBrand] = React.useState('');
  const [formModel, setFormModel] = React.useState('');
  const [formAdbPort, setFormAdbPort] = React.useState('');
  const [formAppiumPort, setFormAppiumPort] = React.useState('');
  const [actingHardwareId, setActingHardwareId] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [deletingHardware, setDeletingHardware] = React.useState<{
    kind: 'rack' | 'box' | 'device';
    id: string;
    label: string;
  } | null>(null);
  const [adbStatusByDeviceId, setAdbStatusByDeviceId] = React.useState<AmDeviceAdbStatusMap>({});
  const [adbStatusError, setAdbStatusError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const resolveRoute = async () => {
      if (!initialRoute?.rackId && !initialRoute?.boxId && !initialRoute?.deviceId) {
        setSelectedRackId(null);
        setSelectedBoxId(null);
        setSelectedDeviceId(null);
        return;
      }

      try {
        setError(null);
        let nextRackId = initialRoute.rackId ?? null;
        let nextBoxId = initialRoute.boxId ?? null;
        let nextDeviceId = initialRoute.deviceId ?? null;

        if (initialRoute.rackId) {
          const rack = await getAmRackById(initialRoute.rackId);
          if (!mounted) return;
          nextRackId = rack._id;
          setRacks(current => mergeAmEntityById(current, rack));
        }

        if (initialRoute.boxId) {
          const box = await getAmBoxById(
            initialRoute.boxId,
            nextRackId ? {rackId: nextRackId} : undefined,
          );
          if (!mounted) return;
          nextBoxId = box._id;
          setBoxes(current => mergeAmEntityById(current, box));
          nextRackId = resolveRackId(box.rackId) || nextRackId;
        }

        if (initialRoute.deviceId) {
          const device = await getAmDeviceById(
            initialRoute.deviceId,
            nextBoxId ? {boxId: nextBoxId} : undefined,
          );
          if (!mounted) return;
          nextDeviceId = device._id;
          setDevices(current => mergeAmEntityById(current, device));
          nextBoxId = resolveBoxId(device.boxId) || nextBoxId;
        }

        if (!mounted) return;
        setSelectedRackId(nextRackId);
        setSelectedBoxId(nextBoxId);
        setSelectedDeviceId(nextDeviceId);
      } catch (nextError) {
        if (!mounted) return;
        setSelectedRackId(initialRoute.rackId ?? null);
        setSelectedBoxId(initialRoute.boxId ?? null);
        setSelectedDeviceId(initialRoute.deviceId ?? null);
        setError(nextError instanceof Error ? nextError.message : 'Gagal memuat route hardware AM.');
      }
    };

    void resolveRoute();

    return () => {
      mounted = false;
    };
  }, [initialRoute?.boxId, initialRoute?.deviceId, initialRoute?.rackId]);

  const fetchHardware = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [rackResponse, boxResponse, deviceResponse] = await Promise.all([
        getAmRacks(),
        getAmBoxes(),
        getAmDevices(),
      ]);
      const hasInitialHardwareRoute = Boolean(
        initialRoute?.rackId || initialRoute?.boxId || initialRoute?.deviceId,
      );
      setRacks(current =>
        hasInitialHardwareRoute
          ? mergeAmEntityListById(rackResponse.data, current)
          : selectedRackId
          ? mergeAmEntityListById(
              rackResponse.data,
              current.filter(rack => rack._id === selectedRackId),
            )
          : rackResponse.data,
      );
      setBoxes(current =>
        hasInitialHardwareRoute
          ? mergeAmEntityListById(boxResponse.data, current)
          : selectedBoxId
          ? mergeAmEntityListById(
              boxResponse.data,
              current.filter(box => box._id === selectedBoxId),
            )
          : boxResponse.data,
      );
      setDevices(current =>
        hasInitialHardwareRoute
          ? mergeAmEntityListById(deviceResponse.data, current)
          : selectedDeviceId
          ? mergeAmEntityListById(
              deviceResponse.data,
              current.filter(device => device._id === selectedDeviceId),
            )
          : deviceResponse.data,
      );
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat hardware AM live.');
    } finally {
      setIsLoading(false);
    }
  }, [initialRoute?.boxId, initialRoute?.deviceId, initialRoute?.rackId]);

  React.useEffect(() => {
    fetchHardware();
  }, [fetchHardware]);

  React.useEffect(() => {
    const interval = setInterval(fetchHardware, 10_000);
    return () => clearInterval(interval);
  }, [fetchHardware]);

  const selectedRack = racks.find(rack => rack._id === selectedRackId) ?? null;
  const selectedBox = boxes.find(box => box._id === selectedBoxId) ?? null;
  const devicesWithAdbStatus = React.useMemo(
    () => mergeAmDeviceAdbStatus(devices, adbStatusByDeviceId),
    [adbStatusByDeviceId, devices],
  );
  const connectedDevices = devicesWithAdbStatus.filter(device => device.adbStatus === 'connected').length;
  const unauthorizedDevices = devicesWithAdbStatus.filter(device => device.adbStatus === 'unauthorized').length;
  const selectedDevice = devicesWithAdbStatus.find(device => device._id === selectedDeviceId) ?? null;
  const visibleBoxes = selectedRack
    ? boxes.filter(box => isBoxInRack(box, selectedRack))
    : [];
  const visibleDevices = selectedBox
    ? devicesWithAdbStatus.filter(device => isDeviceInBox(device, selectedBox))
    : selectedRack
      ? devicesWithAdbStatus.filter(device => isDeviceInRack(device, selectedRack))
      : devicesWithAdbStatus;

  const fetchSelectedBoxAdbStatus = React.useCallback(async () => {
    if (!selectedBox) {
      setAdbStatusByDeviceId({});
      setAdbStatusError(null);
      return;
    }

    try {
      const nextStatus = await getAmDevicesAdbStatus(selectedBox._id);
      setAdbStatusByDeviceId(nextStatus);
      setAdbStatusError(null);
    } catch (nextError) {
      setAdbStatusError(nextError instanceof Error ? nextError.message : 'Gagal memuat status ADB box AM.');
    }
  }, [selectedBox]);

  React.useEffect(() => {
    fetchSelectedBoxAdbStatus();
  }, [fetchSelectedBoxAdbStatus]);

  React.useEffect(() => {
    if (!selectedBox) return undefined;
    const interval = setInterval(fetchSelectedBoxAdbStatus, 10_000);
    return () => clearInterval(interval);
  }, [fetchSelectedBoxAdbStatus, selectedBox]);

  const resetHardwareRoute = React.useCallback(() => {
    setSelectedRackId(null);
    setSelectedBoxId(null);
    setSelectedDeviceId(null);
  }, []);

  const resetHardwareForm = React.useCallback((nextForm: 'rack' | 'box' | 'device' = hardwareForm) => {
    setHardwareForm(nextForm);
    setEditingHardwareId(null);
    setFormLocation('');
    setFormDescription('');
    setFormServerIp('');
    setFormStatus('active');
    setFormRackId(nextForm === 'box' ? (selectedRackId ?? racks[0]?._id ?? '') : '');
    setFormBoxId(nextForm === 'device' ? (selectedBoxId ?? boxes[0]?._id ?? '') : '');
    setFormConnectionType('usb');
    setFormUdid('');
    setFormTcpAddress('');
    setFormBrand('');
    setFormModel('');
    setFormAdbPort(nextForm === 'device' ? '5037' : '');
    setFormAppiumPort('');
    setActionMessage(null);
  }, [boxes, hardwareForm, racks, selectedBoxId, selectedRackId]);

  const editRack = React.useCallback((rack: AmRack) => {
    setHardwareForm('rack');
    setEditingHardwareId(rack._id);
    setFormLocation(rack.location ?? '');
    setFormDescription(rack.description ?? '');
    setFormServerIp(rack.serverIp ?? '');
    setFormStatus(rack.status === 'inactive' ? 'inactive' : 'active');
    setActionMessage(null);
  }, []);

  const editBox = React.useCallback((box: AmBox) => {
    setHardwareForm('box');
    setEditingHardwareId(box._id);
    setFormRackId(resolveRackId(box.rackId));
    setFormDescription(box.description ?? '');
    setFormStatus(box.status === 'inactive' ? 'inactive' : 'active');
    setActionMessage(null);
  }, []);

  const editDevice = React.useCallback((device: AmDevice) => {
    setHardwareForm('device');
    setEditingHardwareId(device._id);
    setFormBoxId(resolveBoxId(device.boxId));
    setFormConnectionType(device.connectionType === 'tcp' || device.connectionType === 'browser' ? device.connectionType : 'usb');
    setFormUdid(device.udid ?? '');
    setFormTcpAddress(device.tcpAddress ?? '');
    setFormBrand(device.brand ?? '');
    setFormModel(device.model ?? '');
    setFormAdbPort(device.adbPort ? String(device.adbPort) : '');
    setFormAppiumPort(device.appiumPort ? String(device.appiumPort) : '');
    setActionMessage(null);
  }, []);

  const handleHardwareConnectionTypeChange = React.useCallback((value: string) => {
    if (value !== 'usb' && value !== 'tcp' && value !== 'browser') return;
    setFormConnectionType(value);
    if (!editingHardwareId) {
      setFormAdbPort(value === 'tcp' ? '6404' : value === 'usb' ? '5037' : '');
    }
  }, [editingHardwareId]);

  const saveHardware = React.useCallback(async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      if (hardwareForm === 'rack') {
        const payload = {
          location: formLocation.trim(),
          description: formDescription.trim(),
          serverIp: formServerIp.trim(),
          ...(editingHardwareId ? {status: formStatus} : {}),
        };
        if (editingHardwareId) {
          await updateAmRack(editingHardwareId, payload);
          setActionMessage('Rack AM berhasil diupdate.');
        } else {
          await createAmRack(payload);
          setActionMessage('Rack AM berhasil dibuat.');
        }
      } else if (hardwareForm === 'box') {
        if (!editingHardwareId && !formRackId) {
          setError('Rack wajib dipilih sebelum membuat box.');
          return;
        }
        if (editingHardwareId) {
          await updateAmBox(editingHardwareId, {
            description: formDescription.trim(),
            status: formStatus,
          });
          setActionMessage('Box AM berhasil diupdate.');
        } else {
          await createAmBox({
            rackId: formRackId,
            description: formDescription.trim(),
          });
          setActionMessage('Box AM berhasil dibuat.');
        }
      } else {
        if (!editingHardwareId && !formBoxId) {
          setError('Box wajib dipilih sebelum membuat device.');
          return;
        }
        const devicePayload: AmDevicePayload = {
          connectionType: formConnectionType,
          appiumPort: editingHardwareId ? parseOptionalNumber(formAppiumPort) : undefined,
        };
        if (formConnectionType === 'usb') {
          devicePayload.udid = formUdid.trim();
          devicePayload.adbPort = parseOptionalNumber(formAdbPort);
          devicePayload.brand = formBrand.trim();
          devicePayload.model = formModel.trim();
        } else if (formConnectionType === 'tcp') {
          devicePayload.tcpAddress = formTcpAddress.trim();
          devicePayload.adbPort = parseOptionalNumber(formAdbPort);
          devicePayload.brand = formBrand.trim();
          devicePayload.model = formModel.trim();
        }
        const payload = cleanDevicePayload(devicePayload);
        if (editingHardwareId) {
          await updateAmDevice(editingHardwareId, payload);
          setActionMessage('Device AM berhasil diupdate.');
        } else {
          await createAmDevice({
            boxId: formBoxId,
            ...payload,
          });
          setActionMessage('Device AM berhasil dibuat.');
        }
      }
      resetHardwareForm(hardwareForm);
      await fetchHardware();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal menyimpan hardware AM.');
    } finally {
      setIsSubmitting(false);
    }
  }, [editingHardwareId, fetchHardware, formAdbPort, formAppiumPort, formBoxId, formBrand, formConnectionType, formDescription, formLocation, formModel, formRackId, formServerIp, formStatus, formTcpAddress, formUdid, hardwareForm, resetHardwareForm]);

  const requestDeleteHardware = React.useCallback((kind: 'rack' | 'box' | 'device', id: string, label: string) => {
    setDeletingHardware({kind, id, label});
    setActionMessage(null);
  }, []);

  const deleteHardware = React.useCallback(async (kind: 'rack' | 'box' | 'device', id: string) => {
    try {
      setActingHardwareId(id);
      setError(null);
      if (kind === 'rack') {
        await deleteAmRacks([id]);
        if (selectedRackId === id) resetHardwareRoute();
      } else if (kind === 'box') {
        await deleteAmBoxes([id]);
        if (selectedBoxId === id) {
          setSelectedBoxId(null);
          setSelectedDeviceId(null);
        }
      } else {
        await deleteAmDevices([id]);
        if (selectedDeviceId === id) setSelectedDeviceId(null);
      }
      setDeletingHardware(null);
      setActionMessage(`${titleCase(kind)} AM berhasil dihapus.`);
      await fetchHardware();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal menghapus hardware AM.');
    } finally {
      setActingHardwareId(null);
    }
  }, [fetchHardware, resetHardwareRoute, selectedBoxId, selectedDeviceId, selectedRackId]);

  return (
    <View style={styles.pageStack}>
      <View style={styles.filterBar}>
        <AmMetricCard label="Rack" value={String(racks.length)} meta={`${boxes.length} box`} />
        <AmMetricCard label="Device" value={String(devices.length)} meta={`${connectedDevices} connected`} />
        <AmMetricCard label="ADB Attention" value={String(unauthorizedDevices)} meta="unauthorized device" />
        <KolamButton
          label={isLoading ? 'Memuat' : 'Refresh'}
          intent="outline"
          muted={isLoading}
          size="sm"
          onPress={fetchHardware}
        />
      </View>
      {selectedRack ? (
        <View style={styles.breadcrumbBar}>
          <KolamButton
            label="Rack"
            intent="plain"
            size="sm"
            onPress={resetHardwareRoute}
          />
          <Text style={styles.breadcrumbText}>{selectedRack.name}</Text>
          {selectedBox ? <Text style={styles.breadcrumbText}>/ {selectedBox.name}</Text> : null}
          {selectedDevice ? <Text style={styles.breadcrumbText}>/ {selectedDevice.name}</Text> : null}
          {selectedBox || selectedDevice ? (
            <KolamButton
              label="Back"
              intent="outline"
              size="sm"
              onPress={() => {
                if (selectedDevice) {
                  setSelectedDeviceId(null);
                } else {
                  setSelectedBoxId(null);
                }
              }}
            />
          ) : null}
        </View>
      ) : null}
      {error ? (
        <View style={styles.errorPanel}>
          <Text style={styles.errorTitle}>Hardware AM belum bisa dibaca</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      {actionMessage ? (
        <View style={styles.successPanel}>
          <Text style={styles.successText}>{actionMessage}</Text>
        </View>
      ) : null}
      {adbStatusError ? (
        <View style={styles.warningPanel}>
          <Text style={styles.warningText}>ADB status box belum bisa dibaca: {adbStatusError}</Text>
        </View>
      ) : null}
      {deletingHardware ? (
        <View style={styles.warningPanel}>
          <Text style={styles.warningText}>
            Delete {titleCase(deletingHardware.kind)} {deletingHardware.label}?
          </Text>
          <Text style={styles.panelText}>Aksi ini tidak bisa dibatalkan.</Text>
          <View style={styles.inlineActions}>
            <KolamButton
              accessibilityLabel={`AM Hardware Confirm Delete ${titleCase(deletingHardware.kind)} ${deletingHardware.id}`}
              intent="danger"
              label={actingHardwareId === deletingHardware.id ? '...' : 'Delete'}
              muted={actingHardwareId === deletingHardware.id}
              size="sm"
              onPress={() => deleteHardware(deletingHardware.kind, deletingHardware.id)}
            />
            <KolamButton
              accessibilityLabel="AM Hardware Cancel Delete"
              intent="outline"
              label="Cancel"
              muted={actingHardwareId === deletingHardware.id}
              size="sm"
              onPress={() => setDeletingHardware(null)}
            />
          </View>
        </View>
      ) : null}
      <View style={styles.tablePanel}>
        <View style={styles.formGrid}>
          <AmSegmentGroup
            active={hardwareForm}
            items={['rack', 'box', 'device']}
            labels={{rack: 'Rack', box: 'Box', device: 'Device'}}
            onSelect={value => resetHardwareForm(value as 'rack' | 'box' | 'device')}
          />
          {hardwareForm === 'rack' ? (
            <>
              <AmTextInput label="Location" placeholder="e.g. Server Room A" value={formLocation} onChangeText={setFormLocation} />
              <AmTextInput label="Description" placeholder="Rack notes" value={formDescription} onChangeText={setFormDescription} />
              <AmTextInput label="Server IP" placeholder="192.168.1.10" value={formServerIp} onChangeText={setFormServerIp} />
            </>
          ) : null}
          {hardwareForm === 'box' ? (
            <>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Rack</Text>
                <View style={styles.eventGrid}>
                  {racks.map(rack => (
                    <KolamInteractionFrame
                      key={rack._id}
                      accessibilityLabel={`AM Hardware Form Rack ${rack.name}`}
                      onPress={() => setFormRackId(rack._id)}
                      style={[styles.eventChip, formRackId === rack._id && styles.eventChipSelected]}>
                      <Text style={[styles.eventChipText, formRackId === rack._id && styles.eventChipTextSelected]}>{rack.name}</Text>
                    </KolamInteractionFrame>
                  ))}
                </View>
              </View>
              <AmTextInput label="Description" placeholder="Box notes" value={formDescription} onChangeText={setFormDescription} />
            </>
          ) : null}
          {hardwareForm === 'device' ? (
            <>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Box</Text>
                <View style={styles.eventGrid}>
                  {boxes.map(box => (
                    <KolamInteractionFrame
                      key={box._id}
                      accessibilityLabel={`AM Hardware Form Box ${box.name}`}
                      onPress={() => setFormBoxId(box._id)}
                      style={[styles.eventChip, formBoxId === box._id && styles.eventChipSelected]}>
                      <Text style={[styles.eventChipText, formBoxId === box._id && styles.eventChipTextSelected]}>{box.name}</Text>
                    </KolamInteractionFrame>
                  ))}
                </View>
              </View>
              <AmSegmentGroup
                active={formConnectionType}
                items={['usb', 'tcp', 'browser']}
                labels={{usb: 'USB', tcp: 'TCP', browser: 'Browser'}}
                onSelect={handleHardwareConnectionTypeChange}
              />
              <AmTextInput label="UDID" placeholder="USB device UDID" value={formUdid} onChangeText={setFormUdid} />
              <AmTextInput label="TCP Address" placeholder="192.168.101.231:5555" value={formTcpAddress} onChangeText={setFormTcpAddress} />
              <AmTextInput label="Brand" placeholder="Samsung / Server" value={formBrand} onChangeText={setFormBrand} />
              <AmTextInput label="Model" placeholder="A52 / Playwright" value={formModel} onChangeText={setFormModel} />
              <AmTextInput label="ADB Port" placeholder="optional" value={formAdbPort} onChangeText={setFormAdbPort} />
              {editingHardwareId ? (
                <AmTextInput label="Appium Port" placeholder="optional" value={formAppiumPort} onChangeText={setFormAppiumPort} />
              ) : null}
            </>
          ) : null}
          {editingHardwareId && hardwareForm !== 'device' ? (
            <AmSegmentGroup
              active={formStatus}
              items={['active', 'inactive']}
              labels={{active: 'Active', inactive: 'Inactive'}}
              onSelect={value => setFormStatus(value as 'active' | 'inactive')}
            />
          ) : null}
          <View style={styles.inlineActions}>
            <KolamButton
              accessibilityLabel="AM Hardware Save"
              label={isSubmitting ? 'Menyimpan' : (editingHardwareId ? 'Save' : 'Create')}
              muted={isSubmitting}
              size="sm"
              onPress={saveHardware}
            />
            {editingHardwareId ? (
              <KolamButton
                accessibilityLabel="AM Hardware Cancel Edit"
                label="Cancel"
                intent="outline"
                size="sm"
                onPress={() => resetHardwareForm(hardwareForm)}
              />
            ) : null}
          </View>
        </View>
      </View>
      {selectedDevice ? (
        <AmDeviceDetailPanel device={selectedDevice} />
      ) : selectedBox ? (
        <AmHardwareDeviceList
          actingHardwareId={actingHardwareId}
          devices={visibleDevices}
          isLoading={isLoading}
          onDeleteDevice={device => requestDeleteHardware('device', device._id, device.name)}
          onEditDevice={editDevice}
          onSelectDevice={device => setSelectedDeviceId(device._id)}
        />
      ) : selectedRack ? (
        <>
          <AmHardwareBoxGrid
            actingHardwareId={actingHardwareId}
            boxes={visibleBoxes}
            isLoading={isLoading}
            onDeleteBox={box => requestDeleteHardware('box', box._id, box.name)}
            onEditBox={editBox}
            onSelectBox={box => setSelectedBoxId(box._id)}
          />
          <AmHardwareDeviceList
            actingHardwareId={actingHardwareId}
            devices={visibleDevices}
            isLoading={isLoading}
            onDeleteDevice={device => requestDeleteHardware('device', device._id, device.name)}
            onEditDevice={editDevice}
            onSelectDevice={device => setSelectedDeviceId(device._id)}
          />
        </>
      ) : (
        <>
          <AmHardwareRackGrid
            actingHardwareId={actingHardwareId}
            boxes={boxes}
            devices={devices}
            isLoading={isLoading}
            onDeleteRack={rack => requestDeleteHardware('rack', rack._id, rack.name)}
            onEditRack={editRack}
            onSelectRack={rack => setSelectedRackId(rack._id)}
            racks={racks}
          />
          <AmHardwareDeviceList
            actingHardwareId={actingHardwareId}
            devices={visibleDevices}
            isLoading={isLoading}
            onDeleteDevice={device => requestDeleteHardware('device', device._id, device.name)}
            onEditDevice={editDevice}
            onSelectDevice={device => setSelectedDeviceId(device._id)}
          />
        </>
      )}
    </View>
  );
}

function AmServiceDetailPanel({
  account,
  activeTab,
  canClearSession,
  clearingSession,
  detailError,
  historyLimit,
  historyPage,
  historyTotal,
  isLoading,
  logs,
  logLimit,
  logPage,
  logSource,
  logTotal,
  serviceInputSending,
  serviceInputValue,
  serviceStatuses,
  onClearSession,
  onChangeServiceInput,
  onHistoryPageChange,
  onLogPageChange,
  onLogSourceChange,
  onSelectTab,
  onSubmitServiceInput,
  processRunning,
  tasks,
  transfers,
}: {
  account: AmServiceAccount;
  activeTab: 'logs' | 'history';
  canClearSession: boolean;
  clearingSession: boolean;
  detailError: string | null;
  historyLimit: number;
  historyPage: number;
  historyTotal: number;
  isLoading: boolean;
  logs: AmDeviceServiceLog[];
  logLimit: number;
  logPage: number;
  logSource: 'realtime' | 'history';
  logTotal: number;
  serviceInputSending: boolean;
  serviceInputValue: string;
  serviceStatuses: AmDeviceServiceStatus[];
  onClearSession: () => void;
  onChangeServiceInput: (value: string) => void;
  onHistoryPageChange: (page: number) => void;
  onLogPageChange: (page: number) => void;
  onLogSourceChange: (source: 'realtime' | 'history') => void;
  onSelectTab: (tab: 'logs' | 'history') => void;
  onSubmitServiceInput: (inputType: 'otp' | 'password') => void;
  processRunning: boolean;
  tasks: AmTask[];
  transfers: AmTransfer[];
}) {
  const banking = isTransferBanking(account.platform);
  const device = getServiceDevice(account);
  const runtime = serviceStatuses.find(status => status.serviceAccountId === account._id);
  const qrSignal = getQrLoginSignal(logs);
  const needsPassword = logs.some(log => log.message.includes('PASSWORD_REQUIRED'));
  const needsInput = needsPassword || logs.some(log => log.message.includes('OTP') || log.message.includes('otp') || log.message.includes('INPUT_REQUIRED'));
  const qrUrl = device?._id ? getAmDeviceServiceQrUrl(device._id, account.platform, qrSignal?.qrcodeId) : null;
  const historyTotalPages = Math.max(1, Math.ceil(historyTotal / Math.max(historyLimit, 1)));
  const historyFrom = historyTotal ? (historyPage - 1) * historyLimit + 1 : 0;
  const historyTo = historyTotal ? Math.min(historyPage * historyLimit, historyTotal) : 0;
  const logTotalPages = Math.max(1, Math.ceil(logTotal / Math.max(logLimit, 1)));
  const logFrom = logTotal ? (logPage - 1) * logLimit + 1 : 0;
  const logTo = logTotal ? Math.min(logPage * logLimit, logTotal) : 0;
  const displayedLogs = logSource === 'history' ? logs : logs.slice(-20);

  return (
    <View style={styles.serviceDetailPanel}>
      <View style={styles.detailHeader}>
        <View style={styles.detailTabs}>
          {!banking ? (
            <KolamInteractionFrame
              accessibilityLabel={`AM ${account.label} Logs`}
              onPress={() => onSelectTab('logs')}
              style={[styles.detailTab, activeTab === 'logs' && styles.detailTabActive]}>
              <Text style={[styles.segmentText, activeTab === 'logs' && styles.segmentTextActive]}>
                Logs {processRunning ? 'Live' : ''}
              </Text>
            </KolamInteractionFrame>
          ) : null}
          <KolamInteractionFrame
            accessibilityLabel={`AM ${account.label} History`}
            onPress={() => onSelectTab('history')}
            style={[styles.detailTab, activeTab === 'history' && styles.detailTabActive]}>
            <Text style={[styles.segmentText, activeTab === 'history' && styles.segmentTextActive]}>
              {banking ? 'Transfer History' : 'Task History'}
            </Text>
          </KolamInteractionFrame>
        </View>
        {canClearSession ? (
          <KolamButton
            accessibilityLabel={`AM Service Clear Session ${account._id}`}
            intent="danger"
            label={clearingSession ? 'Clearing...' : 'Clear Session'}
            muted={clearingSession}
            size="sm"
            onPress={onClearSession}
          />
        ) : null}
      </View>
      <AmInlineError title="Detail service AM belum bisa dibaca" error={detailError} />
      {isLoading ? <Text style={styles.loadingText}>Memuat detail service...</Text> : null}
      {!isLoading && activeTab === 'logs' ? (
        <>
          <View style={styles.runtimePanel}>
            <View style={styles.detailHeader}>
              <View>
                <Text style={styles.panelTitle}>Runtime</Text>
                <Text style={styles.rowMeta}>
                  {runtime ? `${titleCase(runtime.taskStatus)} / ${titleCase(runtime.serviceStatus)}` : 'Status service belum tersedia'}
                </Text>
              </View>
              <AmStatusChip
                label={processRunning ? 'process running' : 'process stopped'}
                tone={processRunning ? 'success' : 'muted'}
              />
            </View>
            {account.platform === 'tokopedia' ? (
              <AmTokopediaSessionPanel
                account={account}
                processRunning={processRunning}
              />
            ) : null}
            {qrSignal ? (
              <View style={styles.qrPanel}>
                <Text style={styles.formLabel}>QR Login {AM_PLATFORM_LABELS[account.platform] ?? titleCase(account.platform)}</Text>
                <Text style={styles.rowMeta}>{qrSignal.status ? `Status ${qrSignal.status}` : 'Scan QR dari endpoint AM live.'}</Text>
                {qrSignal.qrcodeBase64 ? (
                  <>
                    <Image
                      accessibilityLabel={`AM Service QR Image ${account._id}`}
                      resizeMode="contain"
                      source={{uri: normalizeAmQrImageUri(qrSignal.qrcodeBase64)}}
                      style={styles.qrImage}
                    />
                    <Text style={styles.monoText} numberOfLines={1}>{qrSignal.qrcodeBase64}</Text>
                  </>
                ) : qrUrl ? (
                  <>
                    <Image
                      accessibilityLabel={`AM Service QR Image ${account._id}`}
                      resizeMode="contain"
                      source={{uri: qrUrl}}
                      style={styles.qrImage}
                    />
                    <Text style={styles.monoText} numberOfLines={1}>{qrUrl}</Text>
                  </>
                ) : (
                  <Text style={styles.rowMeta}>QR image belum tersedia untuk platform ini.</Text>
                )}
              </View>
            ) : null}
            {needsInput ? (
              <View style={styles.formGrid}>
                <AmTextInput
                  label={needsPassword ? 'Password' : 'OTP'}
                  placeholder={needsPassword ? 'Masukkan password service' : 'Masukkan OTP service'}
                  value={serviceInputValue}
                  onChangeText={onChangeServiceInput}
                />
                <KolamButton
                  accessibilityLabel={`AM Service Submit Input ${account._id}`}
                  label={serviceInputSending ? 'Mengirim' : 'Submit Input'}
                  muted={serviceInputSending}
                  size="sm"
                  onPress={() => onSubmitServiceInput(needsPassword ? 'password' : 'otp')}
                />
              </View>
            ) : null}
          </View>
          <View style={styles.filterBar}>
            <AmSegmentGroup
              active={logSource}
              items={['realtime', 'history']}
              labels={{realtime: 'Realtime', history: 'History'}}
              onSelect={value => onLogSourceChange(value as 'realtime' | 'history')}
            />
          </View>
          <View style={styles.logPanel}>
            {!logs.length ? <Text style={styles.logEmptyText}>{logSource === 'history' ? 'No history logs' : 'No realtime logs'}</Text> : null}
            {displayedLogs.map((log, index) => (
              <Text key={`${log.ts}-${index}`} style={styles.logText} numberOfLines={2}>
                [{formatAmDate(log.ts)}] {log.level}: {log.message}
              </Text>
            ))}
          </View>
          {logSource === 'history' && logTotal > logLimit ? (
            <AmServiceHistoryPagination
              currentPage={logPage}
              disabled={isLoading}
              from={logFrom}
              label="AM Service Logs History"
              to={logTo}
              total={logTotal}
              totalPages={logTotalPages}
              onPageChange={onLogPageChange}
            />
          ) : null}
        </>
      ) : null}
      {!isLoading && activeTab === 'history' && banking ? (
        <View style={styles.detailList}>
          {!transfers.length ? <Text style={styles.loadingText}>No transfer history</Text> : null}
          {transfers.map(transfer => (
            <View key={transfer._id} style={styles.detailListRow}>
              <View style={styles.recipientCol}>
                <Text style={styles.cellText} numberOfLines={1}>{transfer.recipientName || transfer.recipientAccount}</Text>
                <Text style={styles.rowMeta}>{formatAmDate(transfer.createdAt)}</Text>
              </View>
              <Text style={[styles.cellText, styles.amountCol]}>{formatRupiah(transfer.amount)}</Text>
              <View style={styles.statusCol}>
                <AmStatusChip label={transfer.status} tone={getTransferTone(transfer.status)} />
              </View>
            </View>
          ))}
          {historyTotal > historyLimit ? (
            <AmServiceHistoryPagination
              currentPage={historyPage}
              disabled={isLoading}
              from={historyFrom}
              label="AM Service Transfer History"
              to={historyTo}
              total={historyTotal}
              totalPages={historyTotalPages}
              onPageChange={onHistoryPageChange}
            />
          ) : null}
        </View>
      ) : null}
      {!isLoading && activeTab === 'history' && !banking ? (
        <View style={styles.detailList}>
          {!tasks.length ? <Text style={styles.loadingText}>No task history</Text> : null}
          {tasks.map(task => (
            <View key={task._id} style={styles.detailListRow}>
              <View style={styles.recipientCol}>
                <Text style={styles.cellText} numberOfLines={1}>{TASK_TYPE_LABELS[task.type] ?? task.type}</Text>
                <Text style={styles.rowMeta}>{formatAmDate(task.createdAt)}</Text>
              </View>
              <Text style={[styles.cellText, styles.amountCol]}>Retry {task.retryCount}/{task.maxRetries}</Text>
              <View style={styles.statusCol}>
                <AmStatusChip label={task.status} tone={getTransferTone(task.status)} />
              </View>
            </View>
          ))}
          {historyTotal > historyLimit ? (
            <AmServiceHistoryPagination
              currentPage={historyPage}
              disabled={isLoading}
              from={historyFrom}
              label="AM Service Task History"
              to={historyTo}
              total={historyTotal}
              totalPages={historyTotalPages}
              onPageChange={onHistoryPageChange}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function AmTokopediaSessionPanel({
  account,
  processRunning,
}: {
  account: AmServiceAccount;
  processRunning: boolean;
}) {
  const [info, setInfo] = React.useState<AmTokopediaSessionInfo | null>(null);
  const [monitorJob, setMonitorJob] = React.useState<AmTokopediaApiMonitorJob | null>(null);
  const [captchaAutoSolve, setCaptchaAutoSolve] = React.useState(false);
  const [anthropicApiKey, setAnthropicApiKey] = React.useState('');
  const [cookiesJson, setCookiesJson] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [acting, setActing] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const loadSession = React.useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const [sessionResponse, monitorResponse] = await Promise.all([
        getAmTokopediaSession(account._id),
        getAmTokopediaApiMonitorStatus(account._id),
      ]);
      setInfo(sessionResponse);
      setCaptchaAutoSolve(sessionResponse.captchaAutoSolve);
      setMonitorJob(monitorResponse.status === 'idle' ? null : monitorResponse);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat Tokopedia session.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [account._id]);

  React.useEffect(() => {
    loadSession();
  }, [loadSession]);

  React.useEffect(() => {
    if (monitorJob?.status !== 'running') return undefined;
    const interval = setInterval(() => loadSession(true), 4000);
    return () => clearInterval(interval);
  }, [loadSession, monitorJob?.status]);

  const runAction = React.useCallback(async (
    action: string,
    callback: () => Promise<string>,
  ) => {
    try {
      setActing(action);
      setMessage(null);
      setError(null);
      const nextMessage = await callback();
      setMessage(nextMessage);
      await loadSession(true);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Aksi Tokopedia session gagal.');
    } finally {
      setActing(null);
    }
  }, [loadSession]);

  const updateLoginMethod = React.useCallback((mode: 'password' | 'fill' | 'qr') => {
    runAction('login-method', async () => {
      const result = await updateAmTokopediaLoginMethod(account._id, {
        qrTiktokLogin: mode === 'qr',
        loginFillOnly: mode === 'fill',
      });
      setInfo(current => current ? {
        ...current,
        qrTiktokLogin: result.qrTiktokLogin,
        loginFillOnly: result.loginFillOnly,
      } : current);
      if (result.qrTiktokLogin) return 'Login QR TikTok diaktifkan. Restart Tokopedia agar berlaku.';
      if (result.loginFillOnly) return 'Mode isi-form-saja aktif. Restart Tokopedia agar berlaku.';
      return 'Login password otomatis dipakai lagi.';
    });
  }, [account._id, runAction]);

  const saveCaptchaSettings = React.useCallback(() => {
    runAction('captcha', async () => {
      const result = await updateAmTokopediaCaptchaSettings(account._id, {
        captchaAutoSolve,
        anthropicApiKey: anthropicApiKey.trim() || undefined,
      });
      setAnthropicApiKey('');
      setInfo(current => current ? {
        ...current,
        captchaAutoSolve: result.captchaAutoSolve,
        hasAnthropicApiKey: result.hasAnthropicApiKey,
        anthropicApiKeyPreview: result.anthropicApiKeyPreview,
        envFallbackAvailable: result.envFallbackAvailable,
      } : current);
      return result.captchaAutoSolve
        ? 'Auto-solve captcha diaktifkan. Restart Tokopedia agar berlaku.'
        : 'Auto-solve captcha dimatikan. Restart Tokopedia agar berlaku.';
    });
  }, [account._id, anthropicApiKey, captchaAutoSolve, runAction]);

  const uploadManualCookies = React.useCallback(() => {
    runAction('upload-cookies', async () => {
      const cookies = parseAmTokopediaCookiesJson(cookiesJson);
      const result = await uploadAmTokopediaSession(account._id, cookies);
      setCookiesJson('');
      return `Session disimpan (${result.cookieCount} cookies).`;
    });
  }, [account._id, cookiesJson, runAction]);

  const statusLabel = info ? TOKOPEDIA_SESSION_LABELS[info.status] ?? titleCase(info.status) : 'Memuat session';
  const loginMode = info?.qrTiktokLogin ? 'qr' : info?.loginFillOnly ? 'fill' : 'password';
  const monitorRunning = monitorJob?.status === 'running';
  const canRunSessionAction = !isLoading && acting === null;
  const cookiesPreview = getAmTokopediaCookiesPreview(cookiesJson);

  return (
    <View style={styles.emptyPanel}>
      <View style={styles.detailHeader}>
        <View>
          <Text style={styles.panelTitle}>Session Login Tokopedia</Text>
          <Text style={styles.panelText}>Status, login method, captcha, QR, dan browser monitor dari AM BE live.</Text>
        </View>
        <AmStatusChip
          label={statusLabel}
          tone={info?.status === 'ready' ? 'success' : info?.status === 'expired' ? 'warning' : 'muted'}
        />
      </View>
      <AmInlineError title="Tokopedia session belum bisa dibaca" error={error} />
      {message ? (
        <View style={styles.successPanel}>
          <Text style={styles.successText}>{message}</Text>
        </View>
      ) : null}
      <View style={styles.metricGrid}>
        <AmMetricCard label="Cookies" value={isLoading ? '...' : String(info?.cookieCount ?? 0)} meta={`${info?.sessionCookieCount ?? 0} session / ${info?.expiredCount ?? 0} expired`} />
        <AmMetricCard label="Updated" value={formatAmDate(info?.updatedAt ?? null)} meta={info?.hasFingerprint ? 'Fingerprint ada' : 'Fingerprint belum ada'} />
        <AmMetricCard label="Service" value={processRunning ? 'Berjalan' : 'Berhenti'} meta={info?.hasDevice ? 'Device terhubung' : 'Belum ada device'} />
        <AmMetricCard label="Captcha" value={captchaAutoSolve ? 'Auto' : 'Manual'} meta={info?.hasAnthropicApiKey ? `Key ${info.anthropicApiKeyPreview ?? 'tersimpan'}` : info?.envFallbackAvailable ? 'Env fallback tersedia' : 'Tidak ada key'} />
      </View>
      <View style={styles.formGrid}>
        <View style={styles.formField}>
          <Text style={styles.formLabel}>Metode Login Automation</Text>
          <View style={styles.inlineActions}>
            <KolamButton
              accessibilityLabel={`AM Tokopedia Login Password ${account._id}`}
              intent={loginMode === 'password' ? 'warning' : 'outline'}
              label="Password"
              muted={!canRunSessionAction || acting === 'login-method'}
              size="sm"
              onPress={() => updateLoginMethod('password')}
            />
            <KolamButton
              accessibilityLabel={`AM Tokopedia Login Fill Only ${account._id}`}
              intent={loginMode === 'fill' ? 'warning' : 'outline'}
              label="Fill Only"
              muted={!canRunSessionAction || acting === 'login-method'}
              size="sm"
              onPress={() => updateLoginMethod('fill')}
            />
            <KolamButton
              accessibilityLabel={`AM Tokopedia Login QR ${account._id}`}
              intent={loginMode === 'qr' ? 'warning' : 'outline'}
              label="QR TikTok"
              muted={!canRunSessionAction || acting === 'login-method'}
              size="sm"
              onPress={() => updateLoginMethod('qr')}
            />
          </View>
          <Text style={styles.rowMeta}>Restart Tokopedia setelah mengubah metode login.</Text>
        </View>
        <View style={styles.formField}>
          <Text style={styles.formLabel}>Auto-solve Captcha</Text>
          <View style={styles.inlineActions}>
            <KolamButton
              accessibilityLabel={`AM Tokopedia Captcha Toggle ${account._id}`}
              intent={captchaAutoSolve ? 'warning' : 'outline'}
              label={captchaAutoSolve ? 'Auto On' : 'Auto Off'}
              muted={!canRunSessionAction || acting === 'captcha'}
              size="sm"
              onPress={() => setCaptchaAutoSolve(current => !current)}
            />
            <KolamButton
              accessibilityLabel={`AM Tokopedia Captcha Save ${account._id}`}
              label={acting === 'captcha' ? 'Menyimpan' : 'Simpan Captcha'}
              muted={!canRunSessionAction || acting === 'captcha'}
              size="sm"
              onPress={saveCaptchaSettings}
            />
          </View>
        </View>
        {captchaAutoSolve ? (
          <AmTextInput
            label="Anthropic API Key"
            placeholder={info?.hasAnthropicApiKey ? 'Kosongkan jika tidak mengganti' : 'sk-ant-api03-...'}
            secureTextEntry
            value={anthropicApiKey}
            onChangeText={setAnthropicApiKey}
          />
        ) : null}
      </View>
      <View style={styles.uploadPanel}>
        <Text style={styles.formLabel}>Upload cookies manual</Text>
        <Text style={styles.rowMeta}>
          Paste JSON export Cookie-Editor dari seller-id.tokopedia.com. Format bisa array cookies atau object {'{cookies: [...]}'}
        </Text>
        <TextInput
          accessibilityLabel={`AM Tokopedia Cookies JSON ${account._id}`}
          multiline
          placeholder="[{&quot;name&quot;:&quot;sid&quot;,&quot;value&quot;:&quot;...&quot;}]"
          placeholderTextColor={V.colors.mutedFg}
          style={[styles.formInput, styles.cookieTextArea]}
          value={cookiesJson}
          onChangeText={setCookiesJson}
        />
        <View style={styles.inlineActions}>
          <KolamButton
            accessibilityLabel={`AM Tokopedia Save Cookies ${account._id}`}
            label={acting === 'upload-cookies' ? 'Menyimpan' : 'Simpan Session'}
            muted={!canRunSessionAction || acting === 'upload-cookies' || !cookiesJson.trim()}
            size="sm"
            onPress={uploadManualCookies}
          />
          <KolamButton
            accessibilityLabel={`AM Tokopedia Clear Cookies ${account._id}`}
            intent="outline"
            label="Bersihkan"
            muted={!cookiesJson.trim()}
            size="sm"
            onPress={() => setCookiesJson('')}
          />
        </View>
        <Text style={cookiesPreview.error ? styles.cookieErrorText : styles.rowMeta}>
          {cookiesPreview.error ?? (cookiesPreview.count ? `Siap upload: ${cookiesPreview.count} cookies` : 'Belum ada cookies JSON.')}
        </Text>
      </View>
      <View style={styles.inlineActions}>
        <KolamButton
          accessibilityLabel={`AM Tokopedia Verify ${account._id}`}
          intent="outline"
          label={acting === 'verify' ? 'Mengecek' : 'Cek Login'}
          muted={!canRunSessionAction || info?.status === 'missing'}
          size="sm"
          onPress={() => runAction('verify', async () => {
            const result = await verifyAmTokopediaSession(account._id);
            return result.loggedIn
              ? `Login valid (${result.cookieCount} cookies).`
              : result.reason ?? 'Session ada tetapi belum login.';
          })}
        />
        <KolamButton
          accessibilityLabel={`AM Tokopedia Restart ${account._id}`}
          intent="outline"
          label={acting === 'restart' ? 'Restart...' : 'Restart Tokopedia'}
          muted={!canRunSessionAction || !processRunning}
          size="sm"
          onPress={() => runAction('restart', async () => {
            const result = await restartAmTokopediaSession(account._id);
            return result.restarted ? 'Tokopedia di-restart.' : 'Service belum berjalan; nyalakan service untuk memakai session baru.';
          })}
        />
        <KolamButton
          accessibilityLabel={`AM Tokopedia QR Start ${account._id}`}
          intent="outline"
          label={acting === 'qr-start' ? 'Memuat QR' : 'Mulai Scan QR'}
          muted={!canRunSessionAction || !processRunning || !info?.qrTiktokLogin}
          size="sm"
          onPress={() => runAction('qr-start', async () => {
            await startAmTokopediaQrLogin(account._id);
            return 'QR login dimulai. Pantau QR/status di log runtime.';
          })}
        />
        <KolamButton
          accessibilityLabel={`AM Tokopedia Api Monitor ${account._id}`}
          intent="outline"
          label={monitorRunning ? 'Monitor berjalan' : 'Perbarui Session'}
          muted={!canRunSessionAction || monitorRunning || info?.status === 'missing' || info?.status === 'empty'}
          size="sm"
          onPress={() => runAction('api-monitor', async () => {
            const job = await runAmTokopediaApiMonitor(account._id, {
              autoRestart: true,
              fillLogin: loginMode === 'fill',
            });
            setMonitorJob(job);
            return job.message;
          })}
        />
        <KolamButton
          accessibilityLabel={`AM Tokopedia Refresh ${account._id}`}
          intent="outline"
          label={isLoading ? 'Memuat' : 'Refresh'}
          muted={isLoading}
          size="sm"
          onPress={() => loadSession()}
        />
      </View>
      {monitorJob ? (
        <Text style={styles.rowMeta}>
          Browser Monitor: {titleCase(monitorJob.status)} - {monitorJob.message}
          {monitorJob.restarted ? ' Service sudah dinyalakan kembali.' : ''}
        </Text>
      ) : null}
    </View>
  );
}

function parseAmTokopediaCookiesJson(text: string): unknown[] {
  const parsed = JSON.parse(text);
  const cookies = Array.isArray(parsed)
    ? parsed
    : isRecord(parsed) && Array.isArray(parsed.cookies)
      ? parsed.cookies
      : null;

  if (!cookies?.length) {
    throw new Error('JSON harus berisi array cookies atau object {cookies: [...]}.');
  }

  return cookies;
}

function getAmTokopediaCookiesPreview(text: string): {count: number; error?: string} {
  if (!text.trim()) {
    return {count: 0};
  }

  try {
    return {count: parseAmTokopediaCookiesJson(text).length};
  } catch (nextError) {
    return {
      count: 0,
      error: nextError instanceof Error ? nextError.message : 'Cookies JSON tidak valid.',
    };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function AmServiceHistoryPagination({
  currentPage,
  disabled,
  from,
  label,
  onPageChange,
  to,
  total,
  totalPages,
}: {
  currentPage: number;
  disabled: boolean;
  from: number;
  label: string;
  onPageChange: (page: number) => void;
  to: number;
  total: number;
  totalPages: number;
}) {
  return (
    <View style={styles.paginationBar}>
      <Text style={styles.paginationText}>
        Showing {from} to {to} of {total} items
      </Text>
      <View style={styles.inlineActions}>
        <KolamButton
          accessibilityLabel={`${label} Previous Page`}
          disabled={currentPage <= 1 || disabled}
          label="Previous"
          intent="outline"
          size="sm"
          onPress={() => onPageChange(Math.max(1, currentPage - 1))}
        />
        <KolamButton
          accessibilityLabel={`${label} Next Page`}
          disabled={currentPage >= totalPages || disabled}
          label={`Page ${currentPage}/${totalPages}`}
          intent="outline"
          size="sm"
          onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        />
      </View>
    </View>
  );
}

function AmHardwareRackGrid({
  actingHardwareId,
  boxes,
  devices,
  isLoading,
  onDeleteRack,
  onEditRack,
  onSelectRack,
  racks,
}: {
  actingHardwareId: string | null;
  boxes: AmBox[];
  devices: AmDevice[];
  isLoading: boolean;
  onDeleteRack: (rack: AmRack) => void;
  onEditRack: (rack: AmRack) => void;
  onSelectRack: (rack: AmRack) => void;
  racks: AmRack[];
}) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Rack</Text>
      {isLoading && !racks.length ? <Text style={styles.loadingText}>Memuat rack dari AM live...</Text> : null}
      {!isLoading && !racks.length ? <Text style={styles.loadingText}>No racks yet</Text> : null}
      <View style={styles.cardGrid}>
        {racks.map(rack => (
          <KolamInteractionFrame
            key={rack._id}
            accessibilityLabel={`AM Hardware Rack ${rack.name}`}
            accessibilityRole="button"
            onPress={() => onSelectRack(rack)}
            style={styles.hardwareCard}>
            <Text style={styles.rowTitle}>{rack.name}</Text>
            <Text style={styles.rowMeta}>{rack.location || 'No location'}</Text>
            <View style={styles.hardwareStats}>
              <Text style={styles.rowMeta}>Box {rack.boxCount ?? countBoxesForRack(boxes, rack)}</Text>
              <Text style={styles.rowMeta}>Device {rack.deviceCount ?? countDevicesForRack(devices, rack)}</Text>
            </View>
            {rack.serverIp ? <Text style={styles.monoText}>{rack.serverIp}</Text> : null}
            <Text style={styles.rowMeta}>Added By {formatRackAddedBy(rack)}</Text>
            <AmStatusChip label={rack.status} tone={rack.status === 'active' ? 'success' : 'muted'} />
            <View style={styles.inlineActions}>
              <KolamButton
                accessibilityLabel={`AM Hardware Edit Rack ${rack._id}`}
                label="Edit"
                intent="outline"
                size="sm"
                onPress={() => onEditRack(rack)}
              />
              <KolamButton
                accessibilityLabel={`AM Hardware Delete Rack ${rack._id}`}
                label={actingHardwareId === rack._id ? '...' : 'Delete'}
                intent="danger"
                muted={actingHardwareId === rack._id}
                size="sm"
                onPress={() => onDeleteRack(rack)}
              />
            </View>
          </KolamInteractionFrame>
        ))}
      </View>
    </View>
  );
}

function AmHardwareBoxGrid({
  actingHardwareId,
  boxes,
  isLoading,
  onDeleteBox,
  onEditBox,
  onSelectBox,
}: {
  actingHardwareId: string | null;
  boxes: AmBox[];
  isLoading: boolean;
  onDeleteBox: (box: AmBox) => void;
  onEditBox: (box: AmBox) => void;
  onSelectBox: (box: AmBox) => void;
}) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Boxes</Text>
      {isLoading && !boxes.length ? <Text style={styles.loadingText}>Memuat box dari AM live...</Text> : null}
      {!isLoading && !boxes.length ? <Text style={styles.loadingText}>No boxes in this rack</Text> : null}
      <View style={styles.cardGrid}>
        {boxes.map(box => (
          <KolamInteractionFrame
            key={box._id}
            accessibilityLabel={`AM Hardware Box ${box.name}`}
            accessibilityRole="button"
            onPress={() => onSelectBox(box)}
            style={styles.hardwareCard}>
            <Text style={styles.rowTitle}>{box.name}</Text>
            <Text style={styles.rowMeta}>{box.description || 'No description'}</Text>
            <Text style={styles.rowMeta}>Device {box.deviceCount ?? 0} / 24</Text>
            <AmStatusChip label={box.status} tone={box.status === 'active' ? 'success' : 'muted'} />
            <View style={styles.inlineActions}>
              <KolamButton
                accessibilityLabel={`AM Hardware Edit Box ${box._id}`}
                label="Edit"
                intent="outline"
                size="sm"
                onPress={() => onEditBox(box)}
              />
              <KolamButton
                accessibilityLabel={`AM Hardware Delete Box ${box._id}`}
                label={actingHardwareId === box._id ? '...' : 'Delete'}
                intent="danger"
                muted={actingHardwareId === box._id}
                size="sm"
                onPress={() => onDeleteBox(box)}
              />
            </View>
          </KolamInteractionFrame>
        ))}
      </View>
    </View>
  );
}

function AmHardwareDeviceList({
  actingHardwareId,
  devices,
  isLoading,
  onDeleteDevice,
  onEditDevice,
  onSelectDevice,
}: {
  actingHardwareId: string | null;
  devices: AmDevice[];
  isLoading: boolean;
  onDeleteDevice: (device: AmDevice) => void;
  onEditDevice: (device: AmDevice) => void;
  onSelectDevice: (device: AmDevice) => void;
}) {
  return (
    <View style={styles.tablePanel}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, styles.deviceNameCol]}>Device</Text>
        <Text style={[styles.tableHeaderText, styles.identifierCol]}>Identifier</Text>
        <Text style={[styles.tableHeaderText, styles.brandCol]}>Brand</Text>
        <Text style={[styles.tableHeaderText, styles.modelCol]}>Model</Text>
        <Text style={[styles.tableHeaderText, styles.statusCol]}>ADB</Text>
        <Text style={[styles.tableHeaderText, styles.actionCol]}>Action</Text>
      </View>
      <AmLoadingOrEmpty isLoading={isLoading} items={devices} loadingText="Memuat devices dari AM live..." emptyText="No devices found" />
      {devices.slice(0, 40).map(device => (
        <KolamInteractionFrame
          key={device._id}
          accessibilityLabel={`AM Hardware Device ${device.name}`}
          accessibilityRole="button"
          onPress={() => onSelectDevice(device)}
          style={styles.tableRow}>
          <View style={styles.deviceNameCol}>
            <Text style={styles.cellText} numberOfLines={1}>{device.name}</Text>
            <Text style={styles.rowMeta} numberOfLines={1}>{formatDeviceBox(device)}</Text>
          </View>
          <Text style={[styles.cellText, styles.identifierCol]} numberOfLines={1}>{formatDeviceIdentifier(device)}</Text>
          <Text style={[styles.cellText, styles.brandCol]} numberOfLines={1}>{device.brand || 'Not set'}</Text>
          <Text style={[styles.cellText, styles.modelCol]} numberOfLines={1}>{device.model || 'Not set'}</Text>
          <View style={styles.statusCol}>
            <AmStatusChip label={device.adbStatus ?? 'disconnected'} tone={getAdbTone(device.adbStatus)} />
          </View>
          <View style={styles.actionCol}>
            <View style={styles.inlineActions}>
              <KolamButton
                accessibilityLabel={`AM Hardware Edit Device ${device._id}`}
                label="Edit"
                intent="outline"
                size="sm"
                onPress={() => onEditDevice(device)}
              />
              <KolamButton
                accessibilityLabel={`AM Hardware Delete Device ${device._id}`}
                label={actingHardwareId === device._id ? '...' : 'Delete'}
                intent="danger"
                muted={actingHardwareId === device._id}
                size="sm"
                onPress={() => onDeleteDevice(device)}
              />
            </View>
          </View>
        </KolamInteractionFrame>
      ))}
    </View>
  );
}

function AmDeviceDetailPanel({device}: {device: AmDevice}) {
  const [accounts, setAccounts] = React.useState<AmServiceAccount[]>([]);
  const [services, setServices] = React.useState<AmDeviceServiceStatus[]>([]);
  const [allDevices, setAllDevices] = React.useState<AmDevice[]>([]);
  const [isServiceFormOpen, setIsServiceFormOpen] = React.useState(false);
  const [serviceFormPlatform, setServiceFormPlatform] = React.useState('bca');
  const [serviceFormStatus, setServiceFormStatus] = React.useState<'active' | 'inactive' | 'blocked'>('inactive');
  const [serviceFormDeviceId, setServiceFormDeviceId] = React.useState(device._id);
  const [serviceFormLabel, setServiceFormLabel] = React.useState('');
  const [serviceFormUsername, setServiceFormUsername] = React.useState('');
  const [serviceFormPassword, setServiceFormPassword] = React.useState('');
  const [serviceFormPin, setServiceFormPin] = React.useState('');
  const [serviceFormAccountNumber, setServiceFormAccountNumber] = React.useState('');
  const [serviceFormPhoneNumber, setServiceFormPhoneNumber] = React.useState('');
  const [editingDeviceServiceId, setEditingDeviceServiceId] = React.useState<string | null>(null);
  const [actingDeviceServiceId, setActingDeviceServiceId] = React.useState<string | null>(null);
  const [isSubmittingService, setIsSubmittingService] = React.useState(false);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const servicePlatformItems = React.useMemo(
    () => device.connectionType === 'browser'
      ? ['tokopedia', 'shopee', 'tiktok', 'instagram', 'whatsapp']
      : ['bca', 'brimo', 'dana'],
    [device.connectionType],
  );
  const deviceOptions = React.useMemo(
    () => mergeAmEntityById(allDevices, device).filter(nextDevice =>
      isDeviceCompatibleWithServicePlatform(nextDevice, serviceFormPlatform),
    ),
    [allDevices, device, serviceFormPlatform],
  );

  const resetDeviceServiceForm = React.useCallback((open = false) => {
    setEditingDeviceServiceId(null);
    setIsServiceFormOpen(open);
    setServiceFormPlatform(servicePlatformItems[0] ?? 'bca');
    setServiceFormStatus('inactive');
    setServiceFormDeviceId(device._id);
    setServiceFormLabel('');
    setServiceFormUsername('');
    setServiceFormPassword('');
    setServiceFormPin('');
    setServiceFormAccountNumber('');
    setServiceFormPhoneNumber('');
    setActionMessage(null);
  }, [device._id, servicePlatformItems]);

  const fetchAllDeviceOptions = React.useCallback(async () => {
    try {
      const response = await getAmDevices({limit: 100});
      setAllDevices(response.data);
    } catch {
      setAllDevices(current => mergeAmEntityById(current, device));
    }
  }, [device]);

  const editDeviceServiceAccount = React.useCallback((account: AmServiceAccount) => {
    setEditingDeviceServiceId(account._id);
    setIsServiceFormOpen(true);
    setServiceFormPlatform(account.platform);
    setServiceFormStatus(account.status as 'active' | 'inactive' | 'blocked');
    setServiceFormDeviceId(resolveServiceAccountDeviceId(account.deviceId) || device._id);
    setServiceFormLabel(account.label);
    setServiceFormUsername(account.username ?? '');
    setServiceFormPassword('');
    setServiceFormPin('');
    setServiceFormAccountNumber(account.accountNumber ?? '');
    setServiceFormPhoneNumber(getCredentialString(account.credentials, 'phoneNumber') ?? '');
    setActionMessage(null);
    void fetchAllDeviceOptions();
  }, [device._id, fetchAllDeviceOptions]);

  const fetchDeviceServices = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [accountResponse, serviceResponse] = await Promise.all([
        getAmServiceAccounts({deviceId: device._id, limit: 100}),
        getAmDeviceServices(device._id),
      ]);
      setAccounts(accountResponse.data);
      setServices(serviceResponse);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat service account device.');
    } finally {
      setIsLoading(false);
    }
  }, [device._id]);

  React.useEffect(() => {
    fetchDeviceServices();
  }, [fetchDeviceServices]);

  React.useEffect(() => {
    setServiceFormPlatform(servicePlatformItems[0] ?? 'bca');
  }, [servicePlatformItems]);

  const submitDeviceServiceAccount = React.useCallback(async () => {
    if (!serviceFormLabel.trim()) {
      setError('Label service wajib diisi.');
      return;
    }

    const credentials: Record<string, unknown> = {};
    if (serviceFormPhoneNumber.trim()) credentials.phoneNumber = serviceFormPhoneNumber.trim();
    const editingAccount = editingDeviceServiceId
      ? accounts.find(account => account._id === editingDeviceServiceId) ?? null
      : null;
    const targetDeviceId = editingDeviceServiceId
      ? serviceFormDeviceId || device._id
      : device._id;
    const currentDeviceId = editingAccount
      ? resolveServiceAccountDeviceId(editingAccount.deviceId) || device._id
      : device._id;
    const deviceChanged = Boolean(editingDeviceServiceId) && targetDeviceId !== currentDeviceId;

    if (deviceChanged && editingAccount?.status === 'active') {
      setError('Stop service first before moving to another device');
      return;
    }

    const payload: AmServiceAccountPayload = {
      platform: serviceFormPlatform,
      label: serviceFormLabel.trim(),
      deviceId: targetDeviceId,
      username: serviceFormUsername.trim(),
      accountNumber: serviceFormAccountNumber.trim(),
      credentials,
      status: serviceFormStatus,
    };
    const password = serviceFormPassword.trim();
    const pin = serviceFormPin.trim();
    if (!editingDeviceServiceId || password) payload.password = password;
    if (!editingDeviceServiceId || pin) payload.pin = pin;

    try {
      setIsSubmittingService(true);
      setError(null);
      setActionMessage(null);
      if (editingDeviceServiceId) {
        await updateAmServiceAccount(editingDeviceServiceId, payload);
      } else {
        await createAmServiceAccount({
          ...payload,
          platform: serviceFormPlatform,
          label: serviceFormLabel.trim(),
        });
      }
      resetDeviceServiceForm(false);
      setActionMessage(`${payload.label} ${editingDeviceServiceId ? 'diperbarui' : 'dibuat'}.`);
      await fetchDeviceServices();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal menyimpan service account device.');
    } finally {
      setIsSubmittingService(false);
    }
  }, [
    device._id,
    editingDeviceServiceId,
    fetchDeviceServices,
    resetDeviceServiceForm,
    accounts,
    serviceFormAccountNumber,
    serviceFormDeviceId,
    serviceFormLabel,
    serviceFormPassword,
    serviceFormPhoneNumber,
    serviceFormPin,
    serviceFormPlatform,
    serviceFormStatus,
    serviceFormUsername,
  ]);

  const deleteDeviceServiceAccount = React.useCallback(async (account: AmServiceAccount) => {
    try {
      setActingDeviceServiceId(account._id);
      setError(null);
      setActionMessage(null);
      await deleteAmServiceAccount(account._id);
      if (editingDeviceServiceId === account._id) {
        resetDeviceServiceForm(false);
      }
      setActionMessage(`${account.label} dihapus.`);
      await fetchDeviceServices();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal menghapus service account device.');
    } finally {
      setActingDeviceServiceId(null);
    }
  }, [editingDeviceServiceId, fetchDeviceServices, resetDeviceServiceForm]);

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{device.name}</Text>
      <View style={styles.metricGrid}>
        <AmMetricCard label="Connection" value={titleCase(device.connectionType ?? 'usb')} meta={formatDeviceIdentifier(device)} />
        <AmMetricCard label="ADB" value={titleCase(device.adbStatus ?? 'disconnected')} meta={device.adbCheckedAt ? formatAmDate(device.adbCheckedAt) : 'not checked'} />
        <AmMetricCard label="Ports" value={String(device.adbPort ?? '-')} meta={`Appium ${device.appiumPort ?? '-'} / System ${device.systemPort ?? '-'}`} />
      </View>
      <View style={styles.detailList}>
        <View style={styles.detailListRow}>
          <Text style={[styles.tableHeaderText, styles.accountCol]}>Brand</Text>
          <Text style={[styles.cellText, styles.recipientCol]}>{device.brand || 'Not set'}</Text>
        </View>
        <View style={styles.detailListRow}>
          <Text style={[styles.tableHeaderText, styles.accountCol]}>Model</Text>
          <Text style={[styles.cellText, styles.recipientCol]}>{device.model || 'Not set'}</Text>
        </View>
        <View style={styles.detailListRow}>
          <Text style={[styles.tableHeaderText, styles.accountCol]}>Box</Text>
          <Text style={[styles.cellText, styles.recipientCol]}>{formatDeviceBox(device)}</Text>
        </View>
      </View>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.panelTitle}>Service Accounts</Text>
        <View style={styles.inlineActions}>
          <KolamButton
            accessibilityLabel={`AM Device Add Service Account ${device._id}`}
            label="Add Service"
            size="sm"
            onPress={() => resetDeviceServiceForm(true)}
          />
          <KolamButton
            disabled={isLoading}
            label={isLoading ? 'Memuat' : 'Refresh'}
            intent="outline"
            size="sm"
            onPress={fetchDeviceServices}
          />
        </View>
      </View>
      <AmInlineError error={error} title="Service account device belum bisa dibaca" />
      {actionMessage ? (
        <View style={styles.successPanel}>
          <Text style={styles.successText}>{actionMessage}</Text>
        </View>
      ) : null}
      {isServiceFormOpen ? (
        <View style={styles.tablePanel}>
          <View style={styles.formGrid}>
            <AmSegmentGroup
              active={serviceFormPlatform}
              items={servicePlatformItems}
              labels={AM_PLATFORM_LABELS}
              onSelect={setServiceFormPlatform}
            />
            <AmSegmentGroup
              active={serviceFormStatus}
              items={['active', 'inactive', 'blocked']}
              onSelect={value => setServiceFormStatus(value as 'active' | 'inactive' | 'blocked')}
            />
            <AmTextInput label="Label" placeholder="Service label" value={serviceFormLabel} onChangeText={setServiceFormLabel} />
            <AmTextInput label="Username" placeholder="username/email" value={serviceFormUsername} onChangeText={setServiceFormUsername} />
            <AmTextInput label="Password" placeholder="password" secureTextEntry value={serviceFormPassword} onChangeText={setServiceFormPassword} />
            <AmTextInput label="PIN" placeholder="PIN" secureTextEntry value={serviceFormPin} onChangeText={setServiceFormPin} />
            <AmTextInput label="Account Number" placeholder="nomor akun/rekening" value={serviceFormAccountNumber} onChangeText={setServiceFormAccountNumber} />
            <AmTextInput label="Phone Number" placeholder="nomor HP" value={serviceFormPhoneNumber} onChangeText={setServiceFormPhoneNumber} />
            {editingDeviceServiceId ? (
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Device</Text>
                <View style={styles.eventGrid}>
                  {deviceOptions.map(nextDevice => (
                    <KolamInteractionFrame
                      key={nextDevice._id}
                      accessibilityLabel={`AM Device Service Target ${nextDevice.name}`}
                      onPress={() => setServiceFormDeviceId(nextDevice._id)}
                      style={[styles.eventChip, serviceFormDeviceId === nextDevice._id && styles.eventChipSelected]}>
                      <Text style={[styles.eventChipText, serviceFormDeviceId === nextDevice._id && styles.eventChipTextSelected]}>
                        {nextDevice.name}
                      </Text>
                    </KolamInteractionFrame>
                  ))}
                </View>
              </View>
            ) : null}
            <View style={styles.inlineActions}>
              <KolamButton
                accessibilityLabel={`AM Device Save Service Account ${device._id}`}
                label={isSubmittingService ? 'Menyimpan' : editingDeviceServiceId ? 'Update Service' : 'Create Service'}
                muted={isSubmittingService}
                size="sm"
                onPress={submitDeviceServiceAccount}
              />
              <KolamButton
                accessibilityLabel={`AM Device Cancel Service Account ${device._id}`}
                label="Cancel"
                intent="outline"
                size="sm"
                onPress={() => resetDeviceServiceForm(false)}
              />
            </View>
          </View>
        </View>
      ) : null}
      <View style={styles.tablePanel}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.serviceCol]}>Account</Text>
          <Text style={[styles.tableHeaderText, styles.platformCol]}>Platform</Text>
          <Text style={[styles.tableHeaderText, styles.accountCol]}>Username</Text>
          <Text style={[styles.tableHeaderText, styles.accountCol]}>Account No.</Text>
          <Text style={[styles.tableHeaderText, styles.amountCol]}>Balance</Text>
          <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
        </View>
        <AmLoadingOrEmpty
          isLoading={isLoading}
          items={accounts}
          loadingText="Memuat service accounts device..."
          emptyText="No service accounts linked to this device"
        />
        {accounts.map(account => {
          const runtime = services.find(status => status.serviceAccountId === account._id);
          const statusLabel = runtime?.serviceStatus ?? account.status;
          return (
            <View key={account._id} style={styles.tableRow}>
              <View style={styles.serviceCol}>
                <Text style={styles.rowTitle} numberOfLines={1}>{account.label}</Text>
                <Text style={styles.rowMeta} numberOfLines={1}>{runtime?.taskStatus ?? 'No runtime task'}</Text>
              </View>
              <Text style={[styles.cellText, styles.platformCol]}>
                {AM_PLATFORM_LABELS[account.platform] ?? account.platform}
              </Text>
              <Text style={[styles.cellText, styles.accountCol]} numberOfLines={1}>
                {account.username ?? getCredentialString(account.credentials, 'phoneNumber') ?? '-'}
              </Text>
              <Text style={[styles.cellText, styles.accountCol]} numberOfLines={1}>
                {account.accountNumber ?? '-'}
              </Text>
              <Text style={[styles.cellText, styles.amountCol]} numberOfLines={1}>
                {typeof account.balance === 'number' ? formatRupiah(account.balance) : '-'}
              </Text>
              <View style={styles.statusCol}>
                <View style={styles.statusActionStack}>
                  <AmStatusChip label={statusLabel} tone={statusLabel === 'running' || statusLabel === 'active' ? 'success' : 'warning'} />
                  <KolamButton
                    accessibilityLabel={`AM Device Edit Service Account ${account._id}`}
                    intent="outline"
                    label="Edit"
                    muted={isSubmittingService || actingDeviceServiceId === account._id}
                    size="sm"
                    onPress={() => editDeviceServiceAccount(account)}
                  />
                  <KolamButton
                    accessibilityLabel={`AM Device Delete Service Account ${account._id}`}
                    intent="danger"
                    label={actingDeviceServiceId === account._id ? '...' : 'Delete'}
                    muted={actingDeviceServiceId === account._id}
                    size="sm"
                    onPress={() => deleteDeviceServiceAccount(account)}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function AmTransfersPage({initialTransferId}: {initialTransferId?: string}) {
  const [transfers, setTransfers] = React.useState<AmTransfer[]>([]);
  const [accounts, setAccounts] = React.useState<AmServiceAccount[]>([]);
  const [status, setStatus] = React.useState('all');
  const [accountFilter, setAccountFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(AM_TRANSFER_PAGE_LIMIT);
  const [total, setTotal] = React.useState(0);
  const [selectedTransferId, setSelectedTransferId] = React.useState<string | null>(null);
  const [selectedTransfer, setSelectedTransfer] = React.useState<AmTransfer | null>(null);
  const [selectedTransferWebhookLogs, setSelectedTransferWebhookLogs] = React.useState<AmWebhookLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState<string | null>(null);
  const [actingTransferId, setActingTransferId] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showTransferForm, setShowTransferForm] = React.useState(false);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = React.useState(false);
  const [formAccountId, setFormAccountId] = React.useState('auto');
  const [formTransferType, setFormTransferType] = React.useState<'transfer' | 'virtual-account'>('transfer');
  const [formRecipientAccount, setFormRecipientAccount] = React.useState('');
  const [formRecipientName, setFormRecipientName] = React.useState('');
  const [formRecipientBank, setFormRecipientBank] = React.useState('');
  const [formTransferMethod, setFormTransferMethod] = React.useState('');
  const [formTransactionPurpose, setFormTransactionPurpose] = React.useState('');
  const [formAmount, setFormAmount] = React.useState('');

  const fetchTransfers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAmTransfers({
        page,
        limit: AM_TRANSFER_PAGE_LIMIT,
        search: search.trim() || undefined,
        status: status === 'all' ? undefined : status,
        serviceAccountId: accountFilter === 'all' ? undefined : accountFilter,
      });
      setTransfers(response.data);
      setTotal(response.meta.total);
      setLimit(response.meta.limit || AM_TRANSFER_PAGE_LIMIT);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat transfers AM live.');
    } finally {
      setIsLoading(false);
    }
  }, [accountFilter, page, search, status]);

  const fetchTransferAccounts = React.useCallback(async () => {
    try {
      const response = await getAmServiceAccounts({limit: 100});
      setAccounts(response.data);
    } catch {
      setAccounts([]);
    }
  }, []);

  React.useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  React.useEffect(() => {
    fetchTransferAccounts();
  }, [fetchTransferAccounts]);

  React.useEffect(() => {
    const hasRunningTransfer = transfers.some(
      transfer => transfer.status === 'pending' || transfer.status === 'processing',
    );
    if (!hasRunningTransfer) return undefined;

    const interval = setInterval(fetchTransfers, 5000);
    return () => clearInterval(interval);
  }, [fetchTransfers, transfers]);

  const loadTransferDetail = React.useCallback(async (id: string) => {
    try {
      setDetailLoading(true);
      const response = await getAmTransferById(id);
      setSelectedTransfer(response);
      if (response.status === 'success' || response.status === 'failed') {
        const logResponse = await getAmWebhookLogs({
          event: response.status === 'success' ? 'transfer.success' : 'transfer.failed',
          limit: 20,
        });
        setSelectedTransferWebhookLogs(
          logResponse.data.filter(log => webhookLogMatchesTransfer(log, id)),
        );
      } else {
        setSelectedTransferWebhookLogs([]);
      }
      setDetailError(null);
    } catch (nextError) {
      setDetailError(nextError instanceof Error ? nextError.message : 'Gagal memuat detail transfer AM.');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!initialTransferId) {
      setSelectedTransferId(null);
      setSelectedTransfer(null);
      setSelectedTransferWebhookLogs([]);
      setDetailError(null);
      return;
    }

    setSelectedTransferId(initialTransferId);
    loadTransferDetail(initialTransferId);
  }, [initialTransferId, loadTransferDetail]);

  React.useEffect(() => {
    if (!selectedTransferId || !selectedTransfer) return;
    if (selectedTransfer.status !== 'pending' && selectedTransfer.status !== 'processing') return;
    const interval = setInterval(() => loadTransferDetail(selectedTransferId), 3000);
    return () => clearInterval(interval);
  }, [loadTransferDetail, selectedTransfer, selectedTransferId]);

  const selectTransfer = React.useCallback(async (transfer: AmTransfer) => {
    if (selectedTransferId === transfer._id) {
      setSelectedTransferId(null);
      setSelectedTransfer(null);
      setSelectedTransferWebhookLogs([]);
      setDetailError(null);
      return;
    }
    setSelectedTransferId(transfer._id);
    setSelectedTransfer(transfer);
    await loadTransferDetail(transfer._id);
  }, [loadTransferDetail, selectedTransferId]);

  const handleTransferSearchChange = React.useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleTransferStatusChange = React.useCallback((value: string) => {
    setStatus(value);
    setPage(1);
  }, []);

  const handleTransferAccountChange = React.useCallback((value: string) => {
    setAccountFilter(value);
    setPage(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  const rangeFrom = total ? (page - 1) * limit + 1 : 0;
  const rangeTo = total ? Math.min(page * limit, total) : 0;
  const transferStats = getTransferStats(transfers);
  const transferAccountItems = React.useMemo(() => ['all', ...accounts.map(account => account._id)], [accounts]);
  const activeTransferAccounts = React.useMemo(
    () => accounts.filter(account => account.status === 'active'),
    [accounts],
  );
  const transferCreateAccountItems = React.useMemo(() => ['auto', ...activeTransferAccounts.map(account => account._id)], [activeTransferAccounts]);
  const transferAccountLabels = React.useMemo<Record<string, string>>(() => {
    const labels: Record<string, string> = {all: 'All Accounts'};
    accounts.forEach(account => {
      labels[account._id] = formatBankAccount(account);
    });
    return labels;
  }, [accounts]);
  const transferCreateAccountLabels = React.useMemo<Record<string, string>>(() => ({
    ...transferAccountLabels,
    auto: 'Auto-select',
  }), [transferAccountLabels]);
  const selectedCreateAccount = React.useMemo(
    () => formAccountId === 'auto' ? null : accounts.find(account => account._id === formAccountId) ?? null,
    [accounts, formAccountId],
  );
  const selectedSourceBank = getBankFromAmPlatform(selectedCreateAccount?.platform);
  const isVirtualAccountTransfer = formTransferType === 'virtual-account';
  const isInterBankTransfer = !isVirtualAccountTransfer
    && formRecipientBank !== ''
    && (selectedSourceBank ? selectedSourceBank !== formRecipientBank : !['BRI', 'BCA'].includes(formRecipientBank));
  const transferFee = isInterBankTransfer && formTransferMethod ? AM_TRANSFER_METHOD_FEES[formTransferMethod] ?? 0 : 0;
  const parsedTransferAmount = parseOptionalRupiah(formAmount);

  const resetTransferForm = React.useCallback(() => {
    setFormAccountId('auto');
    setFormTransferType('transfer');
    setFormRecipientAccount('');
    setFormRecipientName('');
    setFormRecipientBank('');
    setFormTransferMethod('');
    setFormTransactionPurpose('');
    setFormAmount('');
  }, []);

  const handleCreateTransferTypeChange = React.useCallback((value: string) => {
    if (value !== 'transfer' && value !== 'virtual-account') return;
    setFormTransferType(value);
    setFormRecipientBank('');
    setFormTransferMethod('');
    setFormTransactionPurpose('');
  }, []);

  const handleRecipientBankChange = React.useCallback((value: string) => {
    setFormRecipientBank(value);
    setFormTransferMethod('');
    setFormTransactionPurpose('');
  }, []);

  const handleTransferMethodChange = React.useCallback((value: string) => {
    setFormTransferMethod(value);
    if (value !== 'BI FAST') {
      setFormTransactionPurpose('');
    }
  }, []);

  const submitTransferForm = React.useCallback(async () => {
    const recipientAccount = formRecipientAccount.trim();
    const recipientName = formRecipientName.trim();
    if (!recipientAccount) {
      setError('Recipient account is required');
      return;
    }
    if (!isVirtualAccountTransfer && !formRecipientBank) {
      setError('Recipient bank is required');
      return;
    }
    if (parsedTransferAmount !== undefined && parsedTransferAmount > 0 && parsedTransferAmount < 10000) {
      setError('Minimal amount Rp 10.000');
      return;
    }
    if (isInterBankTransfer && !formTransferMethod) {
      setError('Transfer method is required');
      return;
    }
    if (isInterBankTransfer && formTransferMethod === 'BI FAST' && !formTransactionPurpose) {
      setError('Transaction purpose is required');
      return;
    }

    try {
      setIsSubmittingTransfer(true);
      setError(null);
      setActionMessage(null);
      await createAmTransfer({
        accountId: formAccountId === 'auto' ? undefined : formAccountId,
        transferType: formTransferType,
        recipientAccount,
        recipientName: recipientName || undefined,
        recipientBank: isVirtualAccountTransfer ? undefined : formRecipientBank,
        transferMethod: isInterBankTransfer ? formTransferMethod : undefined,
        transactionPurpose: isInterBankTransfer ? formTransactionPurpose : undefined,
        amount: parsedTransferAmount && parsedTransferAmount > 0 ? parsedTransferAmount : undefined,
      });
      setActionMessage('Transfer created');
      setShowTransferForm(false);
      resetTransferForm();
      await fetchTransfers();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Create transfer failed');
    } finally {
      setIsSubmittingTransfer(false);
    }
  }, [
    fetchTransfers,
    formAccountId,
    formRecipientAccount,
    formRecipientBank,
    formRecipientName,
    formTransactionPurpose,
    formTransferMethod,
    formTransferType,
    isInterBankTransfer,
    isVirtualAccountTransfer,
    parsedTransferAmount,
    resetTransferForm,
  ]);

  const runTransferAction = React.useCallback(async (
    transfer: AmTransfer,
    action: 'cancel' | 'retry' | 'force-fail',
  ) => {
    try {
      setActingTransferId(transfer._id);
      setActionMessage(null);
      if (action === 'cancel') {
        await cancelAmTransfer(transfer._id);
        setActionMessage(`Transfer ${transfer.recipientAccount} dibatalkan.`);
      } else if (action === 'retry') {
        await retryAmTransfer(transfer._id);
        setActionMessage(`Transfer ${transfer.recipientAccount} dijadwalkan ulang.`);
      } else {
        await forceFailAmTransfer(transfer._id);
        setActionMessage(`Transfer ${transfer.recipientAccount} ditandai gagal.`);
      }
      await fetchTransfers();
      if (selectedTransferId === transfer._id) {
        await loadTransferDetail(transfer._id);
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Aksi transfer AM gagal.');
    } finally {
      setActingTransferId(null);
    }
  }, [fetchTransfers, loadTransferDetail, selectedTransferId]);

  return (
    <View style={styles.pageStack}>
      <View style={styles.filterBar}>
        <KolamSearchField value={search} onChangeText={handleTransferSearchChange} placeholder="Search transfer..." containerStyle={styles.taskSearch} trailingLabel={`${total} transfer`} />
        <AmSegmentGroup active={status} items={['all', 'pending', 'processing', 'success', 'failed']} onSelect={handleTransferStatusChange} />
        <AmSegmentGroup active={accountFilter} items={transferAccountItems} labels={transferAccountLabels} onSelect={handleTransferAccountChange} />
        <KolamButton
          accessibilityLabel="AM New Transfer"
          label="New Transfer"
          intent={showTransferForm ? 'warning' : 'outline'}
          size="sm"
          onPress={() => setShowTransferForm(current => !current)}
        />
        <KolamButton label={isLoading ? 'Memuat' : 'Refresh'} intent="outline" muted={isLoading} size="sm" onPress={fetchTransfers} />
      </View>
      <AmInlineError title="Transfers AM belum bisa dibaca" error={error} />
      {actionMessage ? (
        <View style={styles.successPanel}>
          <Text style={styles.successText}>{actionMessage}</Text>
        </View>
      ) : null}
      {showTransferForm ? (
        <View style={styles.panel}>
          <View style={styles.formGrid}>
            <View style={styles.detailHeader}>
              <Text style={styles.panelTitle}>New Transfer</Text>
              <KolamButton
                accessibilityLabel="AM Transfer Cancel Create"
                label="Cancel"
                intent="outline"
                size="sm"
                onPress={() => {
                  setShowTransferForm(false);
                  resetTransferForm();
                }}
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Source Account</Text>
              <AmSegmentGroup
                active={formAccountId}
                items={transferCreateAccountItems}
                labels={transferCreateAccountLabels}
                onSelect={setFormAccountId}
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Transfer Type</Text>
              <AmSegmentGroup
                active={formTransferType}
                items={['transfer', 'virtual-account']}
                labels={{transfer: 'Transfer', 'virtual-account': 'Virtual Account'}}
                onSelect={handleCreateTransferTypeChange}
              />
            </View>
            <View style={styles.formGrid}>
              <AmTextInput
                label={isVirtualAccountTransfer ? 'VA Number' : 'Recipient Account Number'}
                placeholder={isVirtualAccountTransfer ? 'VA number' : 'Account number'}
                value={formRecipientAccount}
                onChangeText={setFormRecipientAccount}
              />
              <AmTextInput label="Recipient Name" placeholder="Recipient name" value={formRecipientName} onChangeText={setFormRecipientName} />
              {!isVirtualAccountTransfer ? (
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Recipient Bank</Text>
                  <AmSegmentGroup active={formRecipientBank} items={AM_RECIPIENT_BANKS} onSelect={handleRecipientBankChange} />
                </View>
              ) : null}
              {isInterBankTransfer ? (
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Transfer Method</Text>
                  <AmSegmentGroup active={formTransferMethod} items={AM_TRANSFER_METHODS} onSelect={handleTransferMethodChange} />
                </View>
              ) : null}
              {isInterBankTransfer && formTransferMethod === 'BI FAST' ? (
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Transaction Purpose</Text>
                  <AmSegmentGroup active={formTransactionPurpose} items={AM_TRANSACTION_PURPOSES} onSelect={setFormTransactionPurpose} />
                </View>
              ) : null}
              <AmTextInput label="Amount (IDR)" placeholder="0" value={formAmount} onChangeText={setFormAmount} />
            </View>
            {transferFee > 0 || parsedTransferAmount ? (
              <View style={styles.successPanel}>
                <Text style={styles.successText}>
                  Total {formatRupiah((parsedTransferAmount ?? 0) + transferFee)}
                </Text>
              </View>
            ) : null}
            <View style={styles.inlineActions}>
              <KolamButton
                accessibilityLabel="AM Transfer Create"
                label={isSubmittingTransfer ? 'Creating' : 'Create Transfer'}
                intent="warning"
                muted={isSubmittingTransfer}
                size="sm"
                onPress={submitTransferForm}
              />
            </View>
          </View>
        </View>
      ) : null}
      <View style={styles.metricGrid}>
        <AmMetricCard label="Total Transfers" value={String(transferStats.total)} meta="page result" />
        <AmMetricCard label="Total Amount" value={formatRupiah(transferStats.totalAmount)} meta="page amount" />
        <AmMetricCard label="Pending" value={String(transferStats.pending)} meta="menunggu eksekusi" />
        <AmMetricCard label="Processing" value={String(transferStats.processing)} meta="sedang berjalan" />
        <AmMetricCard label="Success" value={String(transferStats.success)} meta="berhasil" />
        <AmMetricCard label="Failed" value={String(transferStats.failed)} meta="perlu tindak lanjut" />
      </View>
      <View style={styles.tablePanel}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.accountWideCol]}>Account</Text>
          <Text style={[styles.tableHeaderText, styles.recipientCol]}>Recipient</Text>
          <Text style={[styles.tableHeaderText, styles.platformCol]}>Bank</Text>
          <Text style={[styles.tableHeaderText, styles.amountCol]}>Amount</Text>
          <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
          <Text style={[styles.tableHeaderText, styles.deviceWideCol]}>Device</Text>
          <Text style={[styles.tableHeaderText, styles.dateCol]}>Created</Text>
          <Text style={[styles.tableHeaderText, styles.actionCol]}>Action</Text>
        </View>
        <AmLoadingOrEmpty isLoading={isLoading} items={transfers} loadingText="Memuat transfers dari AM live..." emptyText="No transfers found" />
        {transfers.map(transfer => (
          <View key={transfer._id} style={styles.tableRow}>
            <View style={styles.accountWideCol}>
              <Text style={styles.cellText} numberOfLines={1}>{formatBankAccount(transfer.accountId)}</Text>
            </View>
            <View style={styles.recipientCol}>
              <Text style={styles.cellText} numberOfLines={1}>{transfer.recipientName || '-'}</Text>
              <Text style={styles.rowMeta} numberOfLines={1}>{transfer.recipientBank ?? '-'} {transfer.recipientAccount}</Text>
            </View>
            <Text style={[styles.cellText, styles.platformCol]} numberOfLines={1}>
              {transfer.transferType === 'virtual-account' ? 'VA' : transfer.recipientBank ?? '-'}
            </Text>
            <View style={styles.amountCol}>
              <Text style={styles.cellText}>{formatRupiah(transfer.amount)}</Text>
              {transfer.fee > 0 ? (
                <Text style={styles.rowMeta}>Fee {formatRupiah(transfer.fee)}</Text>
              ) : null}
            </View>
            <View style={styles.statusCol}>
              <AmStatusChip label={transfer.status} tone={getTransferTone(transfer.status)} />
            </View>
            <View style={styles.deviceWideCol}>
              <Text style={styles.cellText} numberOfLines={1}>{formatDeviceRef(transfer.deviceId)}</Text>
              <Text style={styles.rowMeta} numberOfLines={1}>{formatDeviceLocation(transfer.deviceId)}</Text>
            </View>
            <Text style={[styles.cellText, styles.dateCol]}>{formatAmDate(transfer.createdAt)}</Text>
            <View style={styles.actionCol}>
              <View style={styles.inlineActions}>
                <KolamButton
                  accessibilityLabel={`AM Transfer Detail ${transfer._id}`}
                  label={selectedTransferId === transfer._id ? 'Close' : 'Detail'}
                  intent="outline"
                  size="sm"
                  onPress={() => selectTransfer(transfer)}
                />
                <AmTransferActions
                  disabled={actingTransferId === transfer._id}
                  transfer={transfer}
                  onAction={runTransferAction}
                />
              </View>
            </View>
          </View>
        ))}
        {total > limit ? (
          <View style={styles.paginationBar}>
            <Text style={styles.paginationText}>
              Showing {rangeFrom} to {rangeTo} of {total} items
            </Text>
            <View style={styles.inlineActions}>
              <KolamButton
                accessibilityLabel="AM Transfers Previous Page"
                disabled={page <= 1 || isLoading}
                label="Previous"
                intent="outline"
                size="sm"
                onPress={() => setPage(current => Math.max(1, current - 1))}
              />
              <KolamButton
                accessibilityLabel="AM Transfers Next Page"
                disabled={page >= totalPages || isLoading}
                label={`Page ${page}/${totalPages}`}
                intent="outline"
                size="sm"
                onPress={() => setPage(current => Math.min(totalPages, current + 1))}
              />
            </View>
          </View>
        ) : null}
      </View>
      {selectedTransferId ? (
        <AmTransferDetailPanel
          actingTransferId={actingTransferId}
          error={detailError}
          isLoading={detailLoading}
          onAction={runTransferAction}
          transfer={selectedTransfer}
          webhookLogs={selectedTransferWebhookLogs}
        />
      ) : null}
    </View>
  );
}

function AmTransferDetailPanel({
  actingTransferId,
  error,
  isLoading,
  onAction,
  transfer,
  webhookLogs,
}: {
  actingTransferId: string | null;
  error: string | null;
  isLoading: boolean;
  onAction: (
    transfer: AmTransfer,
    action: 'cancel' | 'retry' | 'force-fail',
  ) => void;
  transfer: AmTransfer | null;
  webhookLogs: AmWebhookLog[];
}) {
  if (!transfer && !isLoading && !error) return null;

  return (
    <View style={styles.panel}>
      <View style={styles.detailHeader}>
        <View>
          <Text style={styles.panelTitle}>Transfer Detail</Text>
          <Text style={styles.rowMeta}>{transfer?._id ?? 'Memuat detail transfer...'}</Text>
        </View>
        {transfer ? (
          <View style={styles.inlineActions}>
            <AmStatusChip label={transfer.status} tone={getTransferTone(transfer.status)} />
            <AmTransferActions
              disabled={actingTransferId === transfer._id}
              transfer={transfer}
              onAction={onAction}
            />
          </View>
        ) : null}
      </View>
      <AmInlineError title="Detail transfer AM belum bisa dibaca" error={error} />
      {isLoading ? <Text style={styles.loadingText}>Memuat detail transfer...</Text> : null}
      {transfer ? (
        <>
          <View style={styles.metricGrid}>
            <AmMetricCard
              label="Amount"
              value={formatRupiah(transfer.amount)}
              meta={`Fee ${formatRupiah(transfer.fee ?? 0)} / Total ${formatRupiah(transfer.amount + (transfer.fee ?? 0))}`}
            />
            <AmMetricCard label="Type" value={titleCase(transfer.transferType)} meta={transfer.transferMethod ?? 'method not set'} />
            <AmMetricCard label="Recipient" value={transfer.recipientName || '-'} meta={`${transfer.recipientBank ?? '-'} ${transfer.recipientAccount}`} />
          </View>
          <View style={styles.detailList}>
            <View style={styles.detailListRow}>
              <Text style={[styles.tableHeaderText, styles.accountCol]}>Source Account</Text>
              <Text style={[styles.cellText, styles.recipientCol]}>{formatBankAccount(transfer.accountId)}</Text>
            </View>
            <View style={styles.detailListRow}>
              <Text style={[styles.tableHeaderText, styles.accountCol]}>Device</Text>
              <Text style={[styles.cellText, styles.recipientCol]}>{formatDeviceRef(transfer.deviceId)}</Text>
            </View>
            <View style={styles.detailListRow}>
              <Text style={[styles.tableHeaderText, styles.accountCol]}>Box / Rack</Text>
              <Text style={[styles.cellText, styles.recipientCol]}>{formatDeviceLocation(transfer.deviceId)}</Text>
            </View>
            <View style={styles.detailListRow}>
              <Text style={[styles.tableHeaderText, styles.accountCol]}>Server IP</Text>
              <Text style={[styles.cellText, styles.recipientCol]}>{formatTransferServerIp(transfer.deviceId)}</Text>
            </View>
            {transfer.transferMethod ? (
              <View style={styles.detailListRow}>
                <Text style={[styles.tableHeaderText, styles.accountCol]}>Transfer Method</Text>
                <Text style={[styles.cellText, styles.recipientCol]}>{transfer.transferMethod}</Text>
              </View>
            ) : null}
            {transfer.transactionPurpose ? (
              <View style={styles.detailListRow}>
                <Text style={[styles.tableHeaderText, styles.accountCol]}>Transaction Purpose</Text>
                <Text style={[styles.cellText, styles.recipientCol]}>{transfer.transactionPurpose}</Text>
              </View>
            ) : null}
            <View style={styles.detailListRow}>
              <Text style={[styles.tableHeaderText, styles.accountCol]}>Created By</Text>
              <Text style={[styles.cellText, styles.recipientCol]}>{formatTransferCreatedBy(transfer.createdBy)}</Text>
            </View>
            <View style={styles.detailListRow}>
              <Text style={[styles.tableHeaderText, styles.accountCol]}>Created</Text>
              <Text style={[styles.cellText, styles.recipientCol]}>{formatAmDate(transfer.createdAt)}</Text>
            </View>
            <View style={styles.detailListRow}>
              <Text style={[styles.tableHeaderText, styles.accountCol]}>Started</Text>
              <Text style={[styles.cellText, styles.recipientCol]}>{formatAmDate(transfer.startedAt)}</Text>
            </View>
            <View style={styles.detailListRow}>
              <Text style={[styles.tableHeaderText, styles.accountCol]}>Completed</Text>
              <Text style={[styles.cellText, styles.recipientCol]}>{formatAmDate(transfer.completedAt)}</Text>
            </View>
            {transfer.error ? (
              <View style={styles.detailListRow}>
                <Text style={[styles.tableHeaderText, styles.accountCol]}>Error</Text>
                <Text style={[styles.cellText, styles.recipientCol]}>{transfer.error}</Text>
              </View>
            ) : null}
            {transfer.screenshot ? (
              <View style={styles.detailListRow}>
                <Text style={[styles.tableHeaderText, styles.accountCol]}>Proof</Text>
                <Text style={[styles.cellText, styles.recipientCol]}>Screenshot base64 tersedia ({transfer.screenshot.length} chars)</Text>
              </View>
            ) : null}
          </View>
          {transfer.screenshot ? (
            <View style={styles.proofPanel}>
              <Text style={styles.panelTitle}>Transaction Proof</Text>
              <Text style={styles.panelText}>Screenshot taken after transfer.</Text>
              <Image
                accessibilityLabel="AM Transfer Transaction Proof"
                resizeMode="contain"
                source={{uri: `data:image/png;base64,${transfer.screenshot}`}}
                style={styles.proofImage}
              />
            </View>
          ) : null}
          <View style={styles.logPanel}>
            {!transfer.logs.length ? <Text style={styles.logEmptyText}>No transfer logs</Text> : null}
            {transfer.logs.slice(-30).map((line, index) => (
              <Text key={`${index}-${line}`} style={styles.logText} numberOfLines={2}>
                {String(index + 1).padStart(3, '0')} {line}
              </Text>
            ))}
          </View>
          {transfer.status === 'success' || transfer.status === 'failed' ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Webhook Delivery Logs</Text>
              <Text style={styles.panelText}>
                {webhookLogs.length ? `${webhookLogs.length} delivery log terkait transfer ini.` : 'No webhook logs for this transfer'}
              </Text>
              {webhookLogs.map(log => (
                <View key={log._id} style={styles.detailListRow}>
                  <View style={styles.accountWideCol}>
                    <Text style={styles.cellText} numberOfLines={1}>{log.event}</Text>
                    <Text style={styles.rowMeta} numberOfLines={1}>{log.configId?.description || log.url || '-'}</Text>
                  </View>
                  <View style={styles.statusCol}>
                    <AmStatusChip label={log.success ? 'success' : 'failed'} tone={log.success ? 'success' : 'danger'} />
                  </View>
                  <Text style={[styles.cellText, styles.amountCol]}>{log.responseStatus ?? '-'}</Text>
                  <Text style={[styles.cellText, styles.dateCol]}>{formatAmDate(log.createdAt)}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

function AmMutasiPage({initialMutasiId}: {initialMutasiId?: string}) {
  const [mutasi, setMutasi] = React.useState<AmMutasi[]>([]);
  const [summary, setSummary] = React.useState<AmMutasiSummary | null>(null);
  const [accounts, setAccounts] = React.useState<AmServiceAccount[]>([]);
  const [devices, setDevices] = React.useState<AmDevice[]>([]);
  const [type, setType] = React.useState('all');
  const [accountFilter, setAccountFilter] = React.useState('all');
  const [deviceFilter, setDeviceFilter] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(AM_MUTASI_PAGE_LIMIT);
  const [total, setTotal] = React.useState(0);
  const [selectedMutasiId, setSelectedMutasiId] = React.useState<string | null>(null);
  const [selectedMutasi, setSelectedMutasi] = React.useState<AmMutasi | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchMutasi = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [listResponse, summaryResponse] = await Promise.all([
        getAmMutasi({
          page,
          limit: AM_MUTASI_PAGE_LIMIT,
          type: type === 'all' ? undefined : type,
          accountId: accountFilter === 'all' ? undefined : accountFilter,
          deviceId: deviceFilter === 'all' ? undefined : deviceFilter,
        }),
        getAmMutasiSummary(accountFilter === 'all' ? undefined : accountFilter),
      ]);
      setMutasi(listResponse.data);
      setTotal(listResponse.meta.total);
      setLimit(listResponse.meta.limit || AM_MUTASI_PAGE_LIMIT);
      setSummary(summaryResponse);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat mutasi AM live.');
    } finally {
      setIsLoading(false);
    }
  }, [accountFilter, deviceFilter, page, type]);

  const fetchMutasiFilterOptions = React.useCallback(async () => {
    try {
      const [accountResponse, deviceResponse] = await Promise.all([
        getAmServiceAccounts({limit: 100}),
        getAmDevices({limit: 100}),
      ]);
      setAccounts(accountResponse.data);
      setDevices(deviceResponse.data);
    } catch {
      // Mutasi list remains usable when optional filter option loading fails.
    }
  }, []);

  React.useEffect(() => {
    fetchMutasi();
  }, [fetchMutasi]);

  React.useEffect(() => {
    fetchMutasiFilterOptions();
  }, [fetchMutasiFilterOptions]);

  React.useEffect(() => {
    const interval = setInterval(fetchMutasi, 10_000);
    return () => clearInterval(interval);
  }, [fetchMutasi]);

  React.useEffect(() => {
    if (!initialMutasiId) {
      setSelectedMutasiId(null);
      setSelectedMutasi(null);
      setDetailError(null);
      return;
    }

    let mounted = true;
    setSelectedMutasiId(initialMutasiId);
    setSelectedMutasi(null);
    setDetailLoading(true);
    setDetailError(null);

    getAmMutasiById(initialMutasiId)
      .then(response => {
        if (!mounted) return;
        setSelectedMutasi(response);
      })
      .catch(nextError => {
        if (!mounted) return;
        setDetailError(nextError instanceof Error ? nextError.message : 'Gagal memuat detail mutasi AM.');
      })
      .finally(() => {
        if (mounted) setDetailLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [initialMutasiId]);

  const handleMutasiTypeChange = React.useCallback((value: string) => {
    setType(value);
    setPage(1);
  }, []);

  const handleMutasiAccountChange = React.useCallback((value: string) => {
    setAccountFilter(value);
    setPage(1);
  }, []);

  const handleMutasiDeviceChange = React.useCallback((value: string) => {
    setDeviceFilter(value);
    setPage(1);
  }, []);

  const selectMutasi = React.useCallback(async (item: AmMutasi) => {
    if (selectedMutasiId === item._id) {
      setSelectedMutasiId(null);
      setSelectedMutasi(null);
      setDetailError(null);
      return;
    }

    setSelectedMutasiId(item._id);
    setSelectedMutasi(item);
    setDetailLoading(true);
    setDetailError(null);
    try {
      const response = await getAmMutasiById(item._id);
      setSelectedMutasi(response);
    } catch (nextError) {
      setDetailError(nextError instanceof Error ? nextError.message : 'Gagal memuat detail mutasi AM.');
    } finally {
      setDetailLoading(false);
    }
  }, [selectedMutasiId]);

  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  const rangeFrom = total ? (page - 1) * limit + 1 : 0;
  const rangeTo = total ? Math.min(page * limit, total) : 0;
  const incoming = summary?.masuk ?? {total: 0, count: 0};
  const outgoing = summary?.keluar ?? {total: 0, count: 0};
  const netBalance = incoming.total - outgoing.total;
  const totalTransactions = incoming.count + outgoing.count;
  const accountLabels = React.useMemo(
    () => ({
      all: 'All Accounts',
      ...Object.fromEntries(accounts.map(account => [account._id, formatMutasiAccountOption(account)])),
    }),
    [accounts],
  );
  const deviceLabels = React.useMemo(
    () => ({
      all: 'All Devices',
      ...Object.fromEntries(devices.map(device => [device._id, device.name])),
    }),
    [devices],
  );

  return (
    <View style={styles.pageStack}>
      <View style={styles.filterBar}>
        <AmMetricCard label="Total Incoming" value={formatRupiah(incoming.total)} meta={`${incoming.count} mutasi`} />
        <AmMetricCard label="Total Outgoing" value={formatRupiah(outgoing.total)} meta={`${outgoing.count} mutasi`} />
        <AmMetricCard label="Net Balance" value={formatRupiah(netBalance)} meta="masuk - keluar" />
        <AmMetricCard label="Total Transactions" value={String(totalTransactions)} meta="summary count" />
        <AmSegmentGroup active={type} items={['all', 'masuk', 'keluar']} onSelect={handleMutasiTypeChange} />
        <AmSegmentGroup
          active={accountFilter}
          items={['all', ...accounts.map(account => account._id)]}
          labels={accountLabels}
          onSelect={handleMutasiAccountChange}
        />
        <AmSegmentGroup
          active={deviceFilter}
          items={['all', ...devices.map(device => device._id)]}
          labels={deviceLabels}
          onSelect={handleMutasiDeviceChange}
        />
        <KolamButton label={isLoading ? 'Memuat' : 'Refresh'} intent="outline" muted={isLoading} size="sm" onPress={fetchMutasi} />
      </View>
      <AmInlineError title="Mutasi AM belum bisa dibaca" error={error} />
      <View style={styles.tablePanel}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.typeCol]}>Type</Text>
          <Text style={[styles.tableHeaderText, styles.accountWideCol]}>Account</Text>
          <Text style={[styles.tableHeaderText, styles.amountCol]}>Amount</Text>
          <Text style={[styles.tableHeaderText, styles.recipientCol]}>Description</Text>
          <Text style={[styles.tableHeaderText, styles.deviceWideCol]}>Device</Text>
          <Text style={[styles.tableHeaderText, styles.dateCol]}>Time</Text>
          <Text style={[styles.tableHeaderText, styles.actionCol]}>Action</Text>
        </View>
        <AmLoadingOrEmpty isLoading={isLoading} items={mutasi} loadingText="Memuat mutasi dari AM live..." emptyText="No mutations found" />
        {mutasi.map(item => (
          <View key={item._id} style={styles.tableRow}>
            <View style={styles.typeCol}>
              <AmStatusChip
                label={formatMutasiTypeLabel(item.type)}
                tone={item.type === 'masuk' ? 'success' : 'danger'}
              />
            </View>
            <View style={styles.accountWideCol}>
              <Text style={styles.cellText} numberOfLines={1}>{formatBankAccount(item.accountId)}</Text>
              <Text style={styles.rowMeta} numberOfLines={1}>{formatAccountNumber(item.accountId)}</Text>
            </View>
            <Text style={[styles.cellText, styles.amountCol]}>{formatMutasiSignedAmount(item)}</Text>
            <Text style={[styles.cellText, styles.recipientCol]} numberOfLines={1}>{item.description || '-'}</Text>
            <View style={styles.deviceWideCol}>
              <Text style={styles.cellText} numberOfLines={1}>{formatDeviceRef(item.deviceId)}</Text>
              <Text style={styles.rowMeta} numberOfLines={1}>{formatDeviceLocation(item.deviceId)}</Text>
            </View>
            <Text style={[styles.cellText, styles.dateCol]}>{formatAmDate(item.detectedAt)}</Text>
            <View style={styles.actionCol}>
              <KolamButton
                accessibilityLabel={`AM Mutasi Detail ${item._id}`}
                label={selectedMutasiId === item._id ? 'Close' : 'Detail'}
                intent="outline"
                size="sm"
                onPress={() => selectMutasi(item)}
              />
            </View>
          </View>
        ))}
        {total > limit ? (
          <View style={styles.paginationBar}>
            <Text style={styles.paginationText}>
              Showing {rangeFrom} to {rangeTo} of {total} items
            </Text>
            <View style={styles.inlineActions}>
              <KolamButton
                accessibilityLabel="AM Mutasi Previous Page"
                disabled={page <= 1 || isLoading}
                label="Previous"
                intent="outline"
                size="sm"
                onPress={() => setPage(current => Math.max(1, current - 1))}
              />
              <KolamButton
                accessibilityLabel="AM Mutasi Next Page"
                disabled={page >= totalPages || isLoading}
                label={`Page ${page}/${totalPages}`}
                intent="outline"
                size="sm"
                onPress={() => setPage(current => Math.min(totalPages, current + 1))}
              />
            </View>
          </View>
        ) : null}
      </View>
      {selectedMutasiId ? (
        <AmMutasiDetailPanel
          error={detailError}
          isLoading={detailLoading}
          mutasi={selectedMutasi}
        />
      ) : null}
    </View>
  );
}

function AmMutasiDetailPanel({
  error,
  isLoading,
  mutasi,
}: {
  error: string | null;
  isLoading: boolean;
  mutasi: AmMutasi | null;
}) {
  const receiptUrl = mutasi?.receiptFile
    ? `${appConfig.amApiBaseUrl.replace(/\/+$/, '')}/mutasi/${mutasi._id}/receipt`
    : null;

  return (
    <View style={styles.panel}>
      <View style={styles.detailHeader}>
        <View>
          <Text style={styles.panelTitle}>Mutation Detail</Text>
          <Text style={styles.rowMeta}>{mutasi?._id ?? 'Memuat detail mutasi...'}</Text>
        </View>
        {mutasi ? (
          <AmStatusChip
            label={formatMutasiTypeLabel(mutasi.type)}
            tone={mutasi.type === 'masuk' ? 'success' : 'danger'}
          />
        ) : null}
      </View>
      <AmInlineError title="Detail mutasi AM belum bisa dibaca" error={error} />
      {isLoading ? <Text style={styles.loadingText}>Memuat detail mutasi...</Text> : null}
      {mutasi ? (
        <View style={styles.detailList}>
          <View style={styles.detailListRow}>
            <Text style={styles.rowMeta}>Account</Text>
            <Text style={styles.cellText}>{formatBankAccount(mutasi.accountId)} / {formatAccountNumber(mutasi.accountId)}</Text>
          </View>
          <View style={styles.detailListRow}>
            <Text style={styles.rowMeta}>Amount</Text>
            <Text style={styles.cellText}>{formatMutasiSignedAmount(mutasi)}</Text>
          </View>
          <View style={styles.detailListRow}>
            <Text style={styles.rowMeta}>Description</Text>
            <Text style={styles.cellText}>{mutasi.description || '-'}</Text>
          </View>
          <View style={styles.detailListRow}>
            <Text style={styles.rowMeta}>Device</Text>
            <Text style={styles.cellText}>{formatDeviceRef(mutasi.deviceId)} / {formatDeviceLocation(mutasi.deviceId)}</Text>
          </View>
          <View style={styles.detailListRow}>
            <Text style={styles.rowMeta}>Transfer</Text>
            <Text style={styles.cellText}>{formatMutasiTransferRef(mutasi.transferId)}</Text>
          </View>
          <View style={styles.detailListRow}>
            <Text style={styles.rowMeta}>Notification Hash</Text>
            <Text style={styles.monoText}>{mutasi.notificationHash || '-'}</Text>
          </View>
          <View style={styles.detailListRow}>
            <Text style={styles.rowMeta}>Detected</Text>
            <Text style={styles.cellText}>{formatAmDate(mutasi.detectedAt)}</Text>
          </View>
          <View style={styles.detailListRow}>
            <Text style={styles.rowMeta}>Updated</Text>
            <Text style={styles.cellText}>{formatAmDate(mutasi.updatedAt)}</Text>
          </View>
          <View style={styles.detailListRow}>
            <Text style={styles.rowMeta}>Receipt</Text>
            <Text style={receiptUrl ? styles.monoText : styles.cellText}>{receiptUrl ?? 'Receipt not available'}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function formatMutasiTransferRef(
  transfer: AmMutasi['transferId'],
): string {
  if (!transfer) return '-';
  if (typeof transfer === 'string') return transfer;
  return [
    transfer.recipientName,
    transfer.recipientBank,
    transfer.recipientAccount,
    formatRupiah(transfer.amount),
    titleCase(transfer.status),
  ].filter(Boolean).join(' / ');
}

function AmTransferActions({
  disabled,
  onAction,
  transfer,
}: {
  disabled: boolean;
  onAction: (
    transfer: AmTransfer,
    action: 'cancel' | 'retry' | 'force-fail',
  ) => void;
  transfer: AmTransfer;
}) {
  const actions: Array<{
    id: 'cancel' | 'retry' | 'force-fail';
    label: string;
    intent: 'outline' | 'danger' | 'warning';
  }> = [];

  if (transfer.status === 'pending') {
    actions.push({id: 'cancel', label: 'Cancel', intent: 'outline'});
  }

  if (transfer.status === 'processing') {
    actions.push({id: 'force-fail', label: 'Force Fail', intent: 'danger'});
  }

  if (transfer.status === 'failed') {
    actions.push({id: 'retry', label: 'Retry', intent: 'warning'});
  }

  if (!actions.length) {
    return <Text style={styles.rowMeta}>-</Text>;
  }

  return (
    <View style={styles.inlineActions}>
      {actions.map(action => (
        <KolamButton
          key={action.id}
          accessibilityLabel={`AM Transfer ${action.label} ${transfer._id}`}
          intent={action.intent}
          label={disabled ? '...' : action.label}
          muted={disabled}
          size="sm"
          onPress={() => onAction(transfer, action.id)}
        />
      ))}
    </View>
  );
}

function AmTextInput({
  label,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={V.colors.mutedFg}
        secureTextEntry={secureTextEntry}
        style={styles.formInput}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

function AmWebhooksPage() {
  const [configs, setConfigs] = React.useState<AmWebhookConfig[]>([]);
  const [logs, setLogs] = React.useState<AmWebhookLog[]>([]);
  const [events, setEvents] = React.useState<string[]>([]);
  const [logDirectionFilter, setLogDirectionFilter] = React.useState('all');
  const [logEventFilter, setLogEventFilter] = React.useState('all');
  const [logConfigFilter, setLogConfigFilter] = React.useState('all');
  const [logPage, setLogPage] = React.useState(1);
  const [logTotal, setLogTotal] = React.useState(0);
  const [logLimit, setLogLimit] = React.useState(AM_WEBHOOK_LOG_PAGE_LIMIT);
  const [selectedWebhookLog, setSelectedWebhookLog] = React.useState<AmWebhookLog | null>(null);
  const [editingConfigId, setEditingConfigId] = React.useState<string | null>(null);
  const [formUrl, setFormUrl] = React.useState('');
  const [formSecret, setFormSecret] = React.useState('');
  const [formDescription, setFormDescription] = React.useState('');
  const [selectedEvents, setSelectedEvents] = React.useState<string[]>([]);
  const [actingConfigId, setActingConfigId] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchWebhooks = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [configResponse, logResponse, eventResponse] = await Promise.all([
        getAmWebhookConfigs(),
        getAmWebhookLogs({
          page: logPage,
          limit: AM_WEBHOOK_LOG_PAGE_LIMIT,
          direction: logDirectionFilter === 'all' ? undefined : logDirectionFilter,
          event: logEventFilter === 'all' ? undefined : logEventFilter,
          configId: logConfigFilter === 'all' ? undefined : logConfigFilter,
        }),
        getAmWebhookEvents(),
      ]);
      setConfigs(configResponse.data);
      setLogs(logResponse.data);
      setLogTotal(logResponse.meta.total ?? logResponse.data.length);
      setLogLimit(logResponse.meta.limit || AM_WEBHOOK_LOG_PAGE_LIMIT);
      setEvents(eventResponse);
      setSelectedEvents(current => current.length ? current : eventResponse);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat webhooks AM live.');
    } finally {
      setIsLoading(false);
    }
  }, [logConfigFilter, logDirectionFilter, logEventFilter, logPage]);

  React.useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  React.useEffect(() => {
    const interval = setInterval(fetchWebhooks, 10_000);
    return () => clearInterval(interval);
  }, [fetchWebhooks]);

  const resetWebhookForm = React.useCallback(() => {
    setEditingConfigId(null);
    setFormUrl('');
    setFormSecret('');
    setFormDescription('');
    setSelectedEvents(events);
  }, [events]);

  const editWebhook = React.useCallback((config: AmWebhookConfig) => {
    setEditingConfigId(config._id);
    setFormUrl(config.url);
    setFormSecret('');
    setFormDescription(config.description);
    setSelectedEvents(config.events);
    setActionMessage(null);
  }, []);

  const saveWebhook = React.useCallback(async () => {
    const url = formUrl.trim();
    const secret = formSecret.trim();
    if (!url || selectedEvents.length === 0) {
      setError('URL dan minimal satu event wajib diisi.');
      return;
    }
    if (!editingConfigId && secret.length < 16) {
      setError('Secret HMAC minimal 16 karakter wajib diisi untuk webhook baru.');
      return;
    }
    if (editingConfigId && secret && secret.length < 16) {
      setError('Secret HMAC minimal 16 karakter jika ingin diganti.');
      return;
    }

    try {
      setIsSubmitting(true);
      setActionMessage(null);
      const payload = {
        url,
        events: selectedEvents,
        description: formDescription.trim(),
        ...(secret ? {secret} : {}),
      };
      if (editingConfigId) {
        await updateAmWebhookConfig(editingConfigId, payload);
        setActionMessage('Webhook updated.');
      } else {
        await createAmWebhookConfig(payload);
        setActionMessage('Webhook registered.');
      }
      resetWebhookForm();
      await fetchWebhooks();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal menyimpan webhook.');
    } finally {
      setIsSubmitting(false);
    }
  }, [editingConfigId, fetchWebhooks, formDescription, formSecret, formUrl, resetWebhookForm, selectedEvents]);

  const toggleWebhookEvent = React.useCallback((event: string) => {
    setSelectedEvents(current =>
      current.includes(event)
        ? current.filter(item => item !== event)
        : [...current, event],
    );
  }, []);

  const toggleWebhookStatus = React.useCallback(async (config: AmWebhookConfig) => {
    try {
      setActingConfigId(config._id);
      setActionMessage(null);
      await updateAmWebhookConfig(config._id, {
        status: config.status === 'active' ? 'inactive' : 'active',
      });
      setActionMessage(config.status === 'active' ? 'Webhook deactivated.' : 'Webhook activated.');
      await fetchWebhooks();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal mengubah status webhook.');
    } finally {
      setActingConfigId(null);
    }
  }, [fetchWebhooks]);

  const deleteWebhook = React.useCallback(async (config: AmWebhookConfig) => {
    try {
      setActingConfigId(config._id);
      setActionMessage(null);
      await deleteAmWebhookConfig(config._id);
      setActionMessage('Webhook deleted.');
      if (editingConfigId === config._id) resetWebhookForm();
      await fetchWebhooks();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal menghapus webhook.');
    } finally {
      setActingConfigId(null);
    }
  }, [editingConfigId, fetchWebhooks, resetWebhookForm]);

  const testPing = React.useCallback(async () => {
    try {
      setActionMessage(null);
      const result = await testAmWebhookPing();
      setActionMessage(result.message || 'Test ping dispatched.');
      await fetchWebhooks();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Webhook test ping gagal.');
    }
  }, [fetchWebhooks]);

  const handleLogDirectionChange = React.useCallback((value: string) => {
    setLogDirectionFilter(value);
    setLogPage(1);
  }, []);

  const handleLogEventChange = React.useCallback((value: string) => {
    setLogEventFilter(value);
    setLogPage(1);
  }, []);

  const handleLogConfigChange = React.useCallback((value: string) => {
    setLogConfigFilter(value);
    setLogPage(1);
  }, []);

  const webhookLogEventItems = React.useMemo(() => ['all', ...events], [events]);
  const webhookLogEventLabels = React.useMemo<Record<string, string>>(() => {
    const labels: Record<string, string> = {all: 'All Events'};
    events.forEach(event => {
      labels[event] = event;
    });
    return labels;
  }, [events]);
  const webhookLogConfigItems = React.useMemo(() => ['all', ...configs.map(config => config._id)], [configs]);
  const webhookLogConfigLabels = React.useMemo<Record<string, string>>(() => {
    const labels: Record<string, string> = {all: 'All Endpoints'};
    configs.forEach(config => {
      labels[config._id] = config.description || config.url;
    });
    return labels;
  }, [configs]);
  const webhookLogTotalPages = Math.max(1, Math.ceil(logTotal / Math.max(logLimit, 1)));
  const webhookLogRangeFrom = logTotal ? (logPage - 1) * logLimit + 1 : 0;
  const webhookLogRangeTo = logTotal ? Math.min(logPage * logLimit, logTotal) : 0;

  return (
    <View style={styles.pageStack}>
      <View style={styles.filterBar}>
        <AmMetricCard label="Configs" value={String(configs.length)} meta={`${configs.filter(item => item.status === 'active').length} active`} />
        <AmMetricCard label="Delivery Logs" value={String(logTotal || logs.length)} meta={`${logs.filter(log => !log.success).length} failed on page`} />
        <KolamButton label={isLoading ? 'Memuat' : 'Refresh'} intent="outline" muted={isLoading} size="sm" onPress={fetchWebhooks} />
        <KolamButton label="Test Ping" intent="outline" size="sm" onPress={testPing} />
      </View>
      <AmInlineError title="Webhooks AM belum bisa dibaca" error={error} />
      {actionMessage ? (
        <View style={styles.successPanel}>
          <Text style={styles.successText}>{actionMessage}</Text>
        </View>
      ) : null}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{editingConfigId ? 'Edit Webhook' : 'Register Webhook'}</Text>
        <View style={styles.formGrid}>
          <AmTextInput label="URL" placeholder="https://your-server.com/webhook" value={formUrl} onChangeText={setFormUrl} />
          <AmTextInput label="Secret" placeholder={editingConfigId ? 'Kosongkan untuk secret lama' : 'Minimal 16 karakter untuk HMAC'} value={formSecret} onChangeText={setFormSecret} />
          <AmTextInput label="Description" placeholder="e.g. DA Inventory Backend" value={formDescription} onChangeText={setFormDescription} />
        </View>
        <View style={styles.eventGrid}>
          {events.map(event => (
            <KolamInteractionFrame
              key={event}
              accessibilityLabel={`AM Webhook Event ${event}`}
              onPress={() => toggleWebhookEvent(event)}
              style={[styles.eventChip, selectedEvents.includes(event) && styles.eventChipSelected]}>
              <Text style={[styles.segmentText, selectedEvents.includes(event) && styles.segmentTextActive]}>{event}</Text>
            </KolamInteractionFrame>
          ))}
        </View>
        <View style={styles.inlineActions}>
          <KolamButton
            accessibilityLabel="AM Webhook Save"
            intent="warning"
            label={isSubmitting ? 'Saving...' : editingConfigId ? 'Save Webhook' : 'Register Webhook'}
            muted={isSubmitting}
            size="sm"
            onPress={saveWebhook}
          />
          {editingConfigId ? (
            <KolamButton label="Cancel Edit" intent="outline" size="sm" onPress={resetWebhookForm} />
          ) : null}
        </View>
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Webhook Config</Text>
        <View style={styles.cardGrid}>
          {configs.map(config => (
            <View key={config._id} style={styles.hardwareCard}>
              <Text style={styles.rowTitle} numberOfLines={1}>{config.description || config.url}</Text>
              <Text style={styles.rowMeta} numberOfLines={2}>{config.url}</Text>
              <Text style={styles.rowMeta}>{config.events.length} events - {config.failCount} fail</Text>
              <Text style={styles.rowMeta}>Last delivered: {formatAmDate(config.lastDeliveredAt)}</Text>
              <Text style={styles.rowMeta}>
                Secret: {formatWebhookSecretStatus(config)}
              </Text>
              <AmStatusChip label={config.status} tone={config.status === 'active' ? 'success' : 'muted'} />
              <View style={styles.inlineActions}>
                <KolamButton accessibilityLabel={`AM Webhook Edit ${config._id}`} label="Edit" intent="outline" size="sm" onPress={() => editWebhook(config)} />
                <KolamButton
                  accessibilityLabel={`AM Webhook Toggle ${config._id}`}
                  label={actingConfigId === config._id ? '...' : config.status === 'active' ? 'Deactivate' : 'Activate'}
                  intent="warning"
                  muted={actingConfigId === config._id}
                  size="sm"
                  onPress={() => toggleWebhookStatus(config)}
                />
                <KolamButton
                  accessibilityLabel={`AM Webhook Delete ${config._id}`}
                  label={actingConfigId === config._id ? '...' : 'Delete'}
                  intent="danger"
                  muted={actingConfigId === config._id}
                  size="sm"
                  onPress={() => deleteWebhook(config)}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.tablePanel}>
        <View style={styles.filterBar}>
          <AmSegmentGroup
            active={logDirectionFilter}
            items={AM_WEBHOOK_LOG_DIRECTIONS}
            onSelect={handleLogDirectionChange}
          />
          <AmSegmentGroup
            active={logEventFilter}
            items={webhookLogEventItems}
            labels={webhookLogEventLabels}
            onSelect={handleLogEventChange}
          />
          <AmSegmentGroup
            active={logConfigFilter}
            items={webhookLogConfigItems}
            labels={webhookLogConfigLabels}
            onSelect={handleLogConfigChange}
          />
        </View>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.recipientCol]}>Event</Text>
          <Text style={[styles.tableHeaderText, styles.deviceWideCol]}>URL</Text>
          <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
          <Text style={[styles.tableHeaderText, styles.amountCol]}>Duration</Text>
          <Text style={[styles.tableHeaderText, styles.dateCol]}>Created</Text>
          <Text style={[styles.tableHeaderText, styles.actionCol]}>Action</Text>
        </View>
        <AmLoadingOrEmpty isLoading={isLoading} items={logs} loadingText="Memuat webhook logs..." emptyText="No webhook logs found" />
        {logs.map(log => (
          <View key={log._id} style={styles.tableRow}>
            <Text style={[styles.cellText, styles.recipientCol]} numberOfLines={1}>{log.event}</Text>
            <Text style={[styles.cellText, styles.deviceWideCol]} numberOfLines={1}>{getWebhookLogEndpoint(log)}</Text>
            <View style={styles.statusCol}>
              <AmStatusChip label={log.responseStatus ? String(log.responseStatus) : (log.success ? 'success' : 'failed')} tone={log.success ? 'success' : 'danger'} />
            </View>
            <Text style={[styles.cellText, styles.amountCol]}>{log.duration} ms</Text>
            <Text style={[styles.cellText, styles.dateCol]}>{formatAmDate(log.createdAt)}</Text>
            <View style={styles.actionCol}>
              <KolamButton
                accessibilityLabel={`AM Webhook Log Detail ${log._id}`}
                intent="outline"
                label={selectedWebhookLog?._id === log._id ? 'Close' : 'Detail'}
                size="sm"
                onPress={() => setSelectedWebhookLog(current => current?._id === log._id ? null : log)}
              />
            </View>
          </View>
        ))}
        {logTotal > 0 ? (
          <View style={styles.paginationBar}>
            <Text style={styles.paginationText}>
              Showing {webhookLogRangeFrom} to {webhookLogRangeTo} of {logTotal} items
            </Text>
            <View style={styles.inlineActions}>
              <KolamButton
                accessibilityLabel="AM Webhook Logs Previous Page"
                disabled={logPage <= 1 || isLoading}
                intent="outline"
                label="Previous"
                muted={logPage <= 1 || isLoading}
                size="sm"
                onPress={() => setLogPage(current => Math.max(1, current - 1))}
              />
              <KolamButton
                accessibilityLabel="AM Webhook Logs Next Page"
                disabled={logPage >= webhookLogTotalPages || isLoading}
                intent="outline"
                label={`Page ${logPage}/${webhookLogTotalPages}`}
                muted={logPage >= webhookLogTotalPages || isLoading}
                size="sm"
                onPress={() => setLogPage(current => Math.min(webhookLogTotalPages, current + 1))}
              />
            </View>
          </View>
        ) : null}
      </View>
      {selectedWebhookLog ? <AmWebhookLogDetailPanel log={selectedWebhookLog} /> : null}
    </View>
  );
}

function AmWebhookLogDetailPanel({log}: {log: AmWebhookLog}) {
  const endpoint = getWebhookLogEndpoint(log);

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeaderRow}>
        <View>
          <Text style={styles.panelTitle}>Webhook Log Detail</Text>
          <Text style={styles.panelText}>{log.event}</Text>
        </View>
        <AmStatusChip
          label={log.responseStatus ? String(log.responseStatus) : (log.success ? 'success' : 'failed')}
          tone={log.success ? 'success' : 'danger'}
        />
      </View>
      <View style={styles.detailGrid}>
        <AmDetailLine label="Direction" value={log.direction} />
        <AmDetailLine label="Endpoint" value={endpoint} />
        <AmDetailLine label="Config" value={log.configId?.description || log.configId?._id || '-'} />
        <AmDetailLine label="Duration" value={`${log.duration} ms`} />
        <AmDetailLine label="Created" value={formatAmDate(log.createdAt)} />
        <AmDetailLine label="Error" value={log.error || '-'} />
      </View>
      <AmJsonPanel title="Request Body" value={log.requestBody ?? {}} />
      <AmJsonPanel title="Response Body" value={log.responseBody ?? {}} />
    </View>
  );
}

function getWebhookLogEndpoint(log: AmWebhookLog) {
  return log.configId?.url || log.url || '-';
}

function AmUsersPage() {
  const [users, setUsers] = React.useState<AmUser[]>([]);
  const [roles, setRoles] = React.useState<AmRole[]>([]);
  const [currentUser, setCurrentUser] = React.useState<AmCurrentUser | null>(null);
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [limit, setLimit] = React.useState(AM_USER_PAGE_LIMIT);
  const [editingUserId, setEditingUserId] = React.useState<string | null>(null);
  const [formFullName, setFormFullName] = React.useState('');
  const [formUsername, setFormUsername] = React.useState('');
  const [formPassword, setFormPassword] = React.useState('');
  const [formRole, setFormRole] = React.useState('');
  const [actingUserId, setActingUserId] = React.useState<string | null>(null);
  const [deletingUser, setDeletingUser] = React.useState<AmUser | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUsers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [userResponse, roleResponse, currentUserResponse] = await Promise.all([
        getAmUsers({
          page,
          limit: AM_USER_PAGE_LIMIT,
          search: search.trim() || undefined,
          role: roleFilter === 'all' ? undefined : roleFilter,
        }),
        getAmRoles(),
        getAmCurrentUser(),
      ]);
      setUsers(userResponse.data);
      setTotal(userResponse.meta.total);
      setLimit(userResponse.meta.limit || AM_USER_PAGE_LIMIT);
      setRoles(roleResponse);
      setCurrentUser(currentUserResponse);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat users AM live.');
    } finally {
      setIsLoading(false);
    }
  }, [page, roleFilter, search]);

  const handleUserSearchChange = React.useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleUserRoleChange = React.useCallback((value: string) => {
    setRoleFilter(value);
    setPage(1);
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  React.useEffect(() => {
    const interval = setInterval(fetchUsers, 15000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  const resetUserForm = React.useCallback(() => {
    setEditingUserId(null);
    setFormFullName('');
    setFormUsername('');
    setFormPassword('');
    setFormRole('');
  }, []);

  const editUser = React.useCallback((user: AmUser) => {
    setEditingUserId(user._id);
    setFormFullName(user.fullName);
    setFormUsername(user.username);
    setFormPassword('');
    setFormRole(user.role?._id ?? '');
    setDeletingUser(null);
    setActionMessage(null);
  }, []);

  const requestDeleteUser = React.useCallback((user: AmUser) => {
    if (!hasAmPermission(currentUser, 'user:delete')) {
      setError('Akun AM ini tidak memiliki permission user:delete.');
      return;
    }

    setDeletingUser(user);
    setActionMessage(null);
  }, [currentUser]);

  const saveUser = React.useCallback(async () => {
    const fullName = formFullName.trim();
    const username = formUsername.trim();
    const password = formPassword.trim();

    if (editingUserId && !hasAmPermission(currentUser, 'user:update')) {
      setError('Akun AM ini tidak memiliki permission user:update.');
      return;
    }

    if (!editingUserId && !hasAmPermission(currentUser, 'user:create')) {
      setError('Akun AM ini tidak memiliki permission user:create.');
      return;
    }

    if (!fullName || !username || (!editingUserId && !password)) {
      setError('Full name, username, dan password wajib diisi untuk user baru.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingUserId) {
        const original = users.find(user => user._id === editingUserId);
        const payload: {fullName?: string; username?: string; password?: string; role?: string} = {};
        if (!original || fullName !== original.fullName) payload.fullName = fullName;
        if (!original || username !== original.username) payload.username = username;
        if (password) payload.password = password;
        if (formRole && formRole !== original?.role?._id) payload.role = formRole;

        if (!Object.keys(payload).length) {
          setError('Tidak ada perubahan user untuk disimpan.');
          return;
        }

        await updateAmUser(editingUserId, payload);
        setActionMessage('User AM berhasil diupdate.');
      } else {
        await createAmUser({
          fullName,
          username,
          password,
          ...(formRole ? {role: formRole} : {}),
        });
        setActionMessage('User AM berhasil dibuat.');
      }
      resetUserForm();
      await fetchUsers();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal menyimpan user AM.');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentUser, editingUserId, fetchUsers, formFullName, formPassword, formRole, formUsername, resetUserForm, users]);

  const removeUser = React.useCallback(async (user: AmUser) => {
    if (!hasAmPermission(currentUser, 'user:delete')) {
      setError('Akun AM ini tidak memiliki permission user:delete.');
      return;
    }

    try {
      setActingUserId(user._id);
      await deleteAmUser(user._id);
      setActionMessage(`User ${user.username} berhasil dihapus.`);
      setDeletingUser(null);
      if (editingUserId === user._id) {
        resetUserForm();
      }
      await fetchUsers();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal menghapus user AM.');
    } finally {
      setActingUserId(null);
    }
  }, [currentUser, editingUserId, fetchUsers, resetUserForm]);

  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  const rangeFrom = total ? (page - 1) * limit + 1 : 0;
  const rangeTo = total ? Math.min(page * limit, total) : 0;
  const canCreateUser = hasAmPermission(currentUser, 'user:create');
  const canUpdateUser = hasAmPermission(currentUser, 'user:update');
  const canDeleteUser = hasAmPermission(currentUser, 'user:delete');
  const canShowUserForm = canCreateUser || (Boolean(editingUserId) && canUpdateUser);
  const roleFilterItems = React.useMemo(() => ['all', ...roles.map(role => role._id)], [roles]);
  const roleFilterLabels = React.useMemo<Record<string, string>>(() => {
    const labels: Record<string, string> = {all: 'All Roles'};
    roles.forEach(role => {
      labels[role._id] = role.name;
    });
    return labels;
  }, [roles]);

  return (
    <View style={styles.pageStack}>
      <View style={styles.filterBar}>
        <KolamSearchField
          value={search}
          onChangeText={handleUserSearchChange}
          placeholder="Search users..."
          containerStyle={styles.taskSearch}
          trailingLabel={`${total} user`}
        />
        <AmSegmentGroup
          active={roleFilter}
          items={roleFilterItems}
          labels={roleFilterLabels}
          onSelect={handleUserRoleChange}
        />
        <KolamButton label={isLoading ? 'Memuat' : 'Refresh'} intent="outline" muted={isLoading} size="sm" onPress={fetchUsers} />
      </View>
      <AmInlineError title="Users AM belum bisa dibaca" error={error} />
      {actionMessage ? (
        <View style={styles.successPanel}>
          <Text style={styles.successText}>{actionMessage}</Text>
        </View>
      ) : null}
      {deletingUser ? (
        <View style={styles.warningPanel}>
          <Text style={styles.warningText}>
            Hapus {deletingUser.fullName} (@{deletingUser.username})?
          </Text>
          <View style={styles.inlineActions}>
            <KolamButton
              accessibilityLabel={`AM User Confirm Delete ${deletingUser._id}`}
              intent="danger"
              label={actingUserId === deletingUser._id ? '...' : 'Delete'}
              muted={actingUserId === deletingUser._id}
              size="sm"
              onPress={() => removeUser(deletingUser)}
            />
            <KolamButton
              accessibilityLabel="AM User Cancel Delete"
              intent="outline"
              label="Cancel"
              muted={actingUserId === deletingUser._id}
              size="sm"
              onPress={() => setDeletingUser(null)}
            />
          </View>
        </View>
      ) : null}
      {canShowUserForm ? (
        <View style={styles.tablePanel}>
          <View style={styles.formGrid}>
            <AmTextInput label="Full Name" placeholder="e.g. John Doe" value={formFullName} onChangeText={setFormFullName} />
            <AmTextInput label="Username" placeholder="e.g. johndoe" value={formUsername} onChangeText={setFormUsername} />
            <AmTextInput
              label="Password"
              placeholder={editingUserId ? 'Kosongkan untuk password lama' : 'Min 8 chars, uppercase, lowercase, digit, special'}
              secureTextEntry
              value={formPassword}
              onChangeText={setFormPassword}
            />
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Role</Text>
              <View style={styles.eventGrid}>
                <KolamInteractionFrame
                  accessibilityLabel="AM User Role Default"
                  onPress={() => setFormRole('')}
                  style={[styles.eventChip, formRole === '' && styles.eventChipSelected]}>
                  <Text style={[styles.eventChipText, formRole === '' && styles.eventChipTextSelected]}>Default</Text>
                </KolamInteractionFrame>
                {roles.map(role => (
                  <KolamInteractionFrame
                    key={role._id}
                    accessibilityLabel={`AM User Role ${role.name}`}
                    onPress={() => setFormRole(role._id)}
                    style={[styles.eventChip, formRole === role._id && styles.eventChipSelected]}>
                    <Text style={[styles.eventChipText, formRole === role._id && styles.eventChipTextSelected]}>{role.name}</Text>
                  </KolamInteractionFrame>
                ))}
              </View>
            </View>
            <View style={styles.inlineActions}>
              <KolamButton
                accessibilityLabel="AM User Save"
                label={isSubmitting ? 'Menyimpan' : (editingUserId ? 'Save' : 'Create')}
                muted={isSubmitting}
                size="sm"
                onPress={saveUser}
              />
              {editingUserId ? (
                <KolamButton
                  accessibilityLabel="AM User Cancel Edit"
                  label="Cancel"
                  intent="outline"
                  size="sm"
                  onPress={resetUserForm}
                />
              ) : null}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyPanel}>
          <Text style={styles.panelTitle}>Users read-only</Text>
          <Text style={styles.panelText}>
            Akun AM ini hanya menampilkan daftar user karena permission create/update tidak tersedia.
          </Text>
        </View>
      )}
      <View style={styles.tablePanel}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.accountWideCol]}>Name</Text>
          <Text style={[styles.tableHeaderText, styles.accountCol]}>Username</Text>
          <Text style={[styles.tableHeaderText, styles.recipientCol]}>Role</Text>
          <Text style={[styles.tableHeaderText, styles.dateCol]}>Created</Text>
          <Text style={[styles.tableHeaderText, styles.actionCol]}>Action</Text>
        </View>
        <AmLoadingOrEmpty isLoading={isLoading} items={users} loadingText="Memuat users dari AM live..." emptyText="No users found" />
        {users.map(user => (
          <View key={user._id} style={styles.tableRow}>
            <Text style={[styles.cellText, styles.accountWideCol]} numberOfLines={1}>{user.fullName}</Text>
            <Text style={[styles.cellText, styles.accountCol]} numberOfLines={1}>@{user.username}</Text>
            <View style={styles.recipientCol}>
              <AmStatusChip
                label={user.role?.name ?? 'Unknown'}
                tone={getUserRoleTone(user.role?.name)}
              />
            </View>
            <Text style={[styles.cellText, styles.dateCol]}>{formatAmDate(user.createdAt)}</Text>
            <View style={styles.actionCol}>
              <View style={styles.inlineActions}>
                {canUpdateUser ? (
                  <KolamButton
                    accessibilityLabel={`AM User Edit ${user._id}`}
                    label="Edit"
                    intent="outline"
                    size="sm"
                    onPress={() => editUser(user)}
                  />
                ) : null}
                {canDeleteUser ? (
                  <KolamButton
                    accessibilityLabel={`AM User Delete ${user._id}`}
                    label={actingUserId === user._id ? '...' : 'Delete'}
                    intent="danger"
                    muted={actingUserId === user._id}
                    size="sm"
                    onPress={() => requestDeleteUser(user)}
                  />
                ) : null}
              </View>
            </View>
          </View>
        ))}
        {total ? (
          <View style={styles.paginationBar}>
            <Text style={styles.paginationText}>
              Showing {rangeFrom} to {rangeTo} of {total} items
            </Text>
            <View style={styles.inlineActions}>
              <KolamButton
                accessibilityLabel="AM Users Previous Page"
                disabled={page <= 1 || isLoading}
                intent="outline"
                label="Prev"
                muted={page <= 1 || isLoading}
                size="sm"
                onPress={() => setPage(current => Math.max(1, current - 1))}
              />
              <KolamButton
                accessibilityLabel="AM Users Next Page"
                disabled={page >= totalPages || isLoading}
                intent="outline"
                label={`Page ${page}/${totalPages}`}
                muted={page >= totalPages || isLoading}
                size="sm"
                onPress={() => setPage(current => Math.min(totalPages, current + 1))}
              />
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function AmAccountSettingsPage() {
  const [user, setUser] = React.useState<AmCurrentUser | null>(null);
  const [fullName, setFullName] = React.useState('');
  const [emailAddress, setEmailAddress] = React.useState('');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [deletePassword, setDeletePassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  const fetchCurrentUser = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const currentUser = await getAmCurrentUser();
      setUser(currentUser);
      setFullName(currentUser.fullName ?? '');
      setEmailAddress(currentUser.username ?? '');
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat akun AM live.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const showEndpointNotice = React.useCallback((scope: string) => {
    setError(null);
    setActionMessage(
      `${scope} mengikuti form AM FE, tetapi AM BE live saat ini belum menyediakan endpoint akun mandiri.`,
    );
  }, []);

  const handleSaveProfile = React.useCallback(async () => {
    if (!fullName.trim() || !emailAddress.trim()) {
      setError('Full name dan email address wajib diisi.');
      return;
    }

    if (user && fullName.trim() === user.fullName && emailAddress.trim() === user.username) {
      setError('Tidak ada perubahan profile untuk disimpan.');
      return;
    }

    if (!user?._id) {
      setError('Akun AM live belum terbaca.');
      return;
    }

    try {
      setIsSavingProfile(true);
      const updatedUser = await updateAmUser(user._id, {
        fullName: fullName.trim(),
        username: emailAddress.trim(),
      });
      setUser(updatedUser);
      setFullName(updatedUser.fullName ?? '');
      setEmailAddress(updatedUser.username ?? '');
      setError(null);
      setActionMessage('Profile information tersimpan.');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal menyimpan profile AM live.');
    } finally {
      setIsSavingProfile(false);
    }
  }, [emailAddress, fullName, user]);

  const handleUpdatePassword = React.useCallback(() => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Current password, new password, dan confirm password wajib diisi.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Confirm password harus sama dengan new password.');
      return;
    }

    showEndpointNotice('Change password');
  }, [confirmPassword, currentPassword, newPassword, showEndpointNotice]);

  const handleDeleteAccount = React.useCallback(() => {
    if (!deletePassword) {
      setError('Password wajib diisi sebelum delete account.');
      return;
    }

    showEndpointNotice('Danger area');
  }, [deletePassword, showEndpointNotice]);

  const handleLogout = React.useCallback(async () => {
    try {
      setIsLoggingOut(true);
      await logoutAmSession();
      setError(null);
      setActionMessage('AM session logged out. Login ulang diperlukan untuk membaca data AM live.');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal logout session AM live.');
    } finally {
      setIsLoggingOut(false);
    }
  }, []);

  return (
    <View style={styles.pageStack}>
      <View style={styles.filterBar}>
        <AmMetricCard
          label="Signed in as"
          value={user?.fullName ?? (isLoading ? 'Loading' : '-')}
          meta={user?.role?.name ?? user?.username ?? 'AM account'}
        />
        <KolamButton
          label={isLoading ? 'Memuat' : 'Refresh'}
          intent="outline"
          muted={isLoading}
          size="sm"
          onPress={fetchCurrentUser}
        />
        <KolamButton
          accessibilityLabel="AM Account Logout"
          label={isLoggingOut ? 'Logging out' : 'Log out'}
          intent="outline"
          muted={isLoggingOut}
          size="sm"
          onPress={handleLogout}
        />
      </View>
      <AmInlineError title="Account Settings AM" error={error} />
      {actionMessage ? (
        <View style={styles.successPanel}>
          <Text style={styles.successText}>{actionMessage}</Text>
        </View>
      ) : null}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Profile information</Text>
        <Text style={styles.panelText}>
          Manage your personal information, photo, and other profile details.
        </Text>
        <View style={styles.formGrid}>
          <AmTextInput
            label="Full name"
            placeholder="Your name"
            value={fullName}
            onChangeText={setFullName}
          />
          <AmTextInput
            label="Email address"
            placeholder="you@domain.com"
            value={emailAddress}
            onChangeText={setEmailAddress}
          />
          <View style={styles.inlineActions}>
            <KolamButton
              accessibilityLabel="AM Account Save Profile"
              label={isSavingProfile ? 'Saving' : 'Save'}
              muted={isSavingProfile}
              size="sm"
              onPress={handleSaveProfile}
            />
          </View>
        </View>
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Change password</Text>
        <Text style={styles.panelText}>
          Update your current password to keep your account secure.
        </Text>
        <View style={styles.formGrid}>
          <AmTextInput
            label="Current password"
            placeholder="Current password"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <AmTextInput
            label="New password"
            placeholder="New password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <AmTextInput
            label="Confirm password"
            placeholder="Confirm password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <View style={styles.inlineActions}>
            <KolamButton
              accessibilityLabel="AM Account Update Password"
              label="Update password"
              size="sm"
              onPress={handleUpdatePassword}
            />
          </View>
        </View>
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Danger area</Text>
        <Text style={styles.panelText}>
          Permanently delete your account and all associated data.
        </Text>
        <View style={styles.formGrid}>
          <AmTextInput
            label="Confirm password"
            placeholder="Your password"
            secureTextEntry
            value={deletePassword}
            onChangeText={setDeletePassword}
          />
          <View style={styles.inlineActions}>
            <KolamButton
              accessibilityLabel="AM Account Delete"
              label="Delete account"
              intent="danger"
              size="sm"
              onPress={handleDeleteAccount}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function AmActivityLogPage() {
  const [logs, setLogs] = React.useState<AmActivityLog[]>([]);
  const [stats, setStats] = React.useState<AmActivityLogStats | null>(null);
  const [search, setSearch] = React.useState('');
  const [type, setType] = React.useState('all');
  const [status, setStatus] = React.useState('all');
  const [method, setMethod] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(AM_ACTIVITY_LOG_PAGE_LIMIT);
  const [total, setTotal] = React.useState(0);
  const [selectedLog, setSelectedLog] = React.useState<AmActivityLog | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchLogs = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [listResponse, statsResponse] = await Promise.all([
        getAmActivityLogs({
          page,
          limit: AM_ACTIVITY_LOG_PAGE_LIMIT,
          search: search.trim() || undefined,
          type: type === 'all' ? undefined : type,
          status: status === 'all' ? undefined : status,
          method: method === 'all' ? undefined : method,
        }),
        getAmActivityLogStats(7),
      ]);
      setLogs(listResponse.data);
      setTotal(listResponse.meta.total ?? listResponse.data.length);
      setLimit(listResponse.meta.limit || AM_ACTIVITY_LOG_PAGE_LIMIT);
      setStats(statsResponse);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat activity log AM live.');
    } finally {
      setIsLoading(false);
    }
  }, [method, page, search, status, type]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearchChange = React.useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleTypeChange = React.useCallback((value: string) => {
    setType(value);
    setPage(1);
  }, []);

  const handleStatusChange = React.useCallback((value: string) => {
    setStatus(value);
    setPage(1);
  }, []);

  const handleMethodChange = React.useCallback((value: string) => {
    setMethod(value);
    setPage(1);
  }, []);

  const resetFilters = React.useCallback(() => {
    setSearch('');
    setType('all');
    setStatus('all');
    setMethod('all');
    setPage(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  const rangeFrom = total ? (page - 1) * limit + 1 : 0;
  const rangeTo = total ? Math.min(page * limit, total) : 0;
  const successCount = getAmStatsCount(stats?.byStatus, 'success');
  const failedCount = getAmStatsCount(stats?.byStatus, 'failed');
  const apiCount = getAmStatsCount(stats?.byType, 'api');
  const pageCount = getAmStatsCount(stats?.byType, 'page');
  const hasActiveFilters =
    Boolean(search.trim()) || type !== 'all' || status !== 'all' || method !== 'all';

  return (
    <View style={styles.pageStack}>
      <View style={styles.filterBar}>
        <AmMetricCard label="Window" value={`${stats?.days ?? 7}d`} meta={stats?.since ? formatAmDate(stats.since) : 'stats'} />
        <AmMetricCard label="API / Page" value={`${apiCount} / ${pageCount}`} meta="7d type count" />
        <AmMetricCard label="Success" value={String(successCount)} meta={`${failedCount} failed`} />
      </View>
      <View style={styles.emptyPanel}>
        <Text style={styles.panelTitle}>Super Admin audit log</Text>
        <Text style={styles.panelText}>
          Catatan page/API request AM live. Log otomatis dibersihkan setelah 90 hari; bulk delete manual dari AM FE sengaja tidak dijalankan otomatis di native.
        </Text>
      </View>
      <View style={styles.filterBar}>
        <KolamSearchField
          value={search}
          onChangeText={handleSearchChange}
          placeholder="Cari path, username, atau IP..."
          containerStyle={styles.activitySearch}
          trailingLabel={`${total} log`}
        />
        <AmSegmentGroup active={type} items={AM_ACTIVITY_LOG_TYPES} onSelect={handleTypeChange} />
        <AmSegmentGroup active={status} items={AM_ACTIVITY_LOG_STATUSES} onSelect={handleStatusChange} />
        <AmSegmentGroup active={method} items={AM_ACTIVITY_LOG_METHODS} onSelect={handleMethodChange} />
        {hasActiveFilters ? (
          <KolamButton label="Reset" intent="outline" size="sm" onPress={resetFilters} />
        ) : null}
        <KolamButton label={isLoading ? 'Memuat' : 'Refresh'} intent="outline" muted={isLoading} size="sm" onPress={fetchLogs} />
      </View>
      <AmInlineError title="Activity Log AM belum bisa dibaca" error={error} />
      {stats && (stats.topUsers.length || stats.topPaths.length) ? (
        <View style={styles.panelGrid}>
          <AmStatsListPanel emptyText="Belum ada user" items={stats.topUsers} title="Top Users" />
          <AmStatsListPanel emptyText="Belum ada path" items={stats.topPaths} title="Top Paths" />
        </View>
      ) : null}
      <View style={styles.tablePanel}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.dateCol]}>Time</Text>
          <Text style={[styles.tableHeaderText, styles.accountCol]}>User</Text>
          <Text style={[styles.tableHeaderText, styles.typeCol]}>Type</Text>
          <Text style={[styles.tableHeaderText, styles.typeCol]}>Method</Text>
          <Text style={[styles.tableHeaderText, styles.recipientCol]}>Path</Text>
          <Text style={[styles.tableHeaderText, styles.amountCol]}>IP</Text>
          <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
          <Text style={[styles.tableHeaderText, styles.amountCol]}>Duration</Text>
          <Text style={[styles.tableHeaderText, styles.actionCol]}>Action</Text>
        </View>
        <AmLoadingOrEmpty isLoading={isLoading} items={logs} loadingText="Memuat activity logs..." emptyText="No activity logs found" />
        {logs.map(log => (
          <View key={log._id} style={styles.tableRow}>
            <Text style={[styles.cellText, styles.dateCol]}>{formatAmDate(log.timestamp)}</Text>
            <View style={styles.accountCol}>
              <Text style={styles.cellText} numberOfLines={1}>{log.username ?? log.userId?.username ?? 'anonymous'}</Text>
              <Text style={styles.rowMeta} numberOfLines={1}>{log.userId?.fullName ?? '-'}</Text>
            </View>
            <View style={styles.typeCol}>
              <AmStatusChip
                label={formatActivityLogTypeLabel(log.type)}
                tone={log.type === 'api' ? 'warning' : 'muted'}
              />
            </View>
            <View style={styles.typeCol}>
              {log.method ? (
                <AmStatusChip
                  label={log.method}
                  tone={getActivityLogMethodTone(log.method)}
                />
              ) : (
                <Text style={styles.cellText}>-</Text>
              )}
            </View>
            <View style={styles.recipientCol}>
              <Text style={styles.monoText} numberOfLines={1}>{log.path}</Text>
              <Text style={styles.rowMeta} numberOfLines={1}>{log.action}</Text>
            </View>
            <Text style={[styles.cellText, styles.amountCol]} numberOfLines={1}>{log.ip || '-'}</Text>
            <View style={styles.statusCol}>
              <AmStatusChip label={log.statusCode ? String(log.statusCode) : log.status} tone={log.status === 'success' ? 'success' : 'danger'} />
            </View>
            <Text style={[styles.cellText, styles.amountCol]}>{formatAmDuration(log.duration)}</Text>
            <View style={styles.actionCol}>
              <KolamButton
                accessibilityLabel={`AM Activity Log Detail ${log._id}`}
                label="Detail"
                intent="outline"
                size="sm"
                onPress={() => setSelectedLog(current => current?._id === log._id ? null : log)}
              />
            </View>
          </View>
        ))}
        {total > 0 ? (
          <View style={styles.paginationBar}>
            <Text style={styles.paginationText}>
              Showing {rangeFrom} to {rangeTo} of {total} items
            </Text>
            <View style={styles.inlineActions}>
              <KolamButton
                accessibilityLabel="AM Activity Logs Previous Page"
                disabled={page <= 1 || isLoading}
                label="Previous"
                intent="outline"
                size="sm"
                onPress={() => setPage(current => Math.max(1, current - 1))}
              />
              <KolamButton
                accessibilityLabel="AM Activity Logs Next Page"
                disabled={page >= totalPages || isLoading}
                label={`Page ${page}/${totalPages}`}
                intent="outline"
                size="sm"
                onPress={() => setPage(current => Math.min(totalPages, current + 1))}
              />
            </View>
          </View>
        ) : null}
      </View>
      {selectedLog ? <AmActivityLogDetailPanel log={selectedLog} /> : null}
    </View>
  );
}

function AmStatsListPanel({
  emptyText,
  items,
  title,
}: {
  emptyText: string;
  items: Array<{_id: string; count: number}>;
  title: string;
}) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{title}</Text>
      <View style={styles.detailList}>
        {items.length ? items.slice(0, 5).map(item => (
          <View key={item._id || 'unknown'} style={styles.detailListRow}>
            <Text style={[styles.cellText, styles.recipientCol]} numberOfLines={1}>{item._id || 'unknown'}</Text>
            <Text style={[styles.cellText, styles.amountCol]}>{item.count}</Text>
          </View>
        )) : <Text style={styles.rowMeta}>{emptyText}</Text>}
      </View>
    </View>
  );
}

function AmActivityLogDetailPanel({log}: {log: AmActivityLog}) {
  return (
    <View style={styles.panel}>
      <View style={styles.detailHeader}>
        <View>
          <Text style={styles.panelTitle}>Activity Detail</Text>
          <Text style={styles.rowMeta}>{formatAmDate(log.timestamp)}</Text>
        </View>
        <AmStatusChip label={log.statusCode ? String(log.statusCode) : log.status} tone={log.status === 'success' ? 'success' : 'danger'} />
      </View>
      <View style={styles.detailList}>
        <View style={styles.detailListRow}>
          <Text style={styles.tableHeaderText}>User</Text>
          <Text style={[styles.cellText, styles.recipientCol]}>{log.username ?? log.userId?.fullName ?? 'anonymous'}</Text>
        </View>
        <View style={styles.detailListRow}>
          <Text style={styles.tableHeaderText}>Request</Text>
          <Text style={[styles.cellText, styles.recipientCol]}>{log.method || '-'} {log.path}</Text>
        </View>
        <View style={styles.detailListRow}>
          <Text style={styles.tableHeaderText}>Action</Text>
          <Text style={[styles.cellText, styles.recipientCol]}>{log.action || '-'}</Text>
        </View>
        <View style={styles.detailListRow}>
          <Text style={styles.tableHeaderText}>IP</Text>
          <Text style={[styles.cellText, styles.recipientCol]}>{log.ip || '-'}</Text>
        </View>
        <View style={styles.detailListRow}>
          <Text style={styles.tableHeaderText}>Duration</Text>
          <Text style={[styles.cellText, styles.recipientCol]}>{formatAmDuration(log.duration)}</Text>
        </View>
        {log.error ? (
          <View style={styles.detailListRow}>
            <Text style={styles.tableHeaderText}>Error</Text>
            <Text style={[styles.cellText, styles.recipientCol]}>{log.error}</Text>
          </View>
        ) : null}
      </View>
      <AmJsonPanel title="Metadata" value={log.metadata ?? {}} />
      <AmJsonPanel title="User Agent" value={log.userAgent || '-'} />
    </View>
  );
}

function AmParityPlaceholder({route}: {route: AmRouteItem}) {
  return (
    <View style={styles.emptyPanel}>
      <Text style={styles.panelTitle}>{route.label}</Text>
      <Text style={styles.panelText}>
        Route {route.path} sudah masuk menu AM di sidebar utama. Port native detail berikutnya akan mengikuti halaman AM FE saat ini dan endpoint AM BE live.
      </Text>
    </View>
  );
}

function AmMetricCard({label, meta, value}: {label: string; meta: string; value: string}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricMeta}>{meta}</Text>
    </View>
  );
}

function AmStatusPill({danger = false, label, value}: {danger?: boolean; label: string; value: number}) {
  return (
    <View style={[styles.statusPill, danger && styles.statusPillDanger]}>
      <Text style={styles.statusPillValue}>{value}</Text>
      <Text style={styles.statusPillLabel}>{label}</Text>
    </View>
  );
}

function AmStatusChip({
  label,
  tone,
}: {
  label: string;
  tone: 'success' | 'warning' | 'danger' | 'muted';
}) {
  return (
    <View
      style={[
        styles.statusChip,
        tone === 'success' && styles.statusChipSuccess,
        tone === 'warning' && styles.statusChipWarning,
        tone === 'danger' && styles.statusChipDanger,
      ]}>
      <Text style={styles.statusChipText}>{titleCase(label)}</Text>
    </View>
  );
}

function AmInlineError({error, title}: {error: string | null; title: string}) {
  if (!error) return null;

  return (
    <View style={styles.errorPanel}>
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
}

function AmLoadingOrEmpty<T>({
  emptyText,
  isLoading,
  items,
  loadingText,
}: {
  emptyText: string;
  isLoading: boolean;
  items: T[];
  loadingText: string;
}) {
  if (isLoading && !items.length) {
    return <Text style={styles.loadingText}>{loadingText}</Text>;
  }

  if (!isLoading && !items.length) {
    return <Text style={styles.loadingText}>{emptyText}</Text>;
  }

  return null;
}

function AmSegmentGroup({
  active,
  items,
  labels = {},
  onSelect,
}: {
  active: string;
  items: string[];
  labels?: Record<string, string>;
  onSelect: (value: string) => void;
}) {
  return (
    <ScrollView horizontal contentContainerStyle={styles.segmentList} showsHorizontalScrollIndicator={false}>
      {items.map(item => (
        <KolamInteractionFrame
          key={item}
          accessibilityLabel={`AM Segment ${labels[item] ?? titleCase(item)}`}
          onPress={() => onSelect(item)}
          style={[styles.segment, active === item && styles.segmentActive]}>
          <Text style={[styles.segmentText, active === item && styles.segmentTextActive]}>{labels[item] ?? titleCase(item)}</Text>
        </KolamInteractionFrame>
      ))}
    </ScrollView>
  );
}

function formatServiceDeviceMeta(device: AmServiceAccountDeviceRef | null) {
  if (!device || typeof device !== 'object') return 'No device assigned';
  if (device.connectionType === 'tcp') return device.tcpAddress ?? 'TCP device';
  if (device.connectionType === 'usb') return device.udid ?? 'USB device';
  if (device.connectionType === 'browser') return 'Playwright';
  return device.udid ?? device.tcpAddress ?? device.connectionType ?? 'Device linked';
}

function formatServiceDeviceLocation(device: AmServiceAccountDeviceRef | null) {
  if (!device || typeof device !== 'object') return 'No location assigned';
  const box = device.boxId;
  if (!box || typeof box === 'string') return 'No location assigned';
  const rack = box.rackId;
  const rackName = rack && typeof rack === 'object' ? rack.name : null;
  return rackName ? `${box.name} / ${rackName}` : box.name;
}

function getServiceDevice(account: AmServiceAccount) {
  return typeof account.deviceId === 'object' ? account.deviceId : null;
}

function hasAmPermission(user: AmCurrentUser | null, permission: string) {
  if (!user?.role) return false;
  if (user.role.name === 'Super Admin') return true;
  return user.role.permissions.includes(permission);
}

function formatTaskCreatedBy(createdBy: AmTask['createdBy']) {
  if (!createdBy) return '-';
  return createdBy.username || createdBy.email || createdBy.name || '-';
}

function isTransferBanking(platform: string) {
  return platform === 'bca' || platform === 'brimo';
}

function getBankFromAmPlatform(platform?: string | null) {
  if (platform === 'bca') return 'BCA';
  if (platform === 'brimo') return 'BRI';
  return null;
}

function parseOptionalRupiah(value: string) {
  const normalized = value.replace(/[^\d]/g, '');
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getCredentialString(
  credentials: Record<string, unknown>,
  key: string,
) {
  const value = credentials[key];
  return typeof value === 'string' && value.trim() ? value : null;
}

function formatBankAccount(account: AmTransfer['accountId'] | AmMutasi['accountId']) {
  if (!account || typeof account === 'string') return '-';
  const suffix = account.accountNumber ? ` - ${account.accountNumber}` : '';
  return `${account.label}${suffix}`;
}

function formatAccountNumber(account: AmTransfer['accountId'] | AmMutasi['accountId']) {
  if (!account || typeof account === 'string') return '-';
  return account.accountNumber || '-';
}

function formatMutasiAccountOption(account: AmServiceAccount) {
  const prefix = account.label || account.platform || 'Account';
  return account.accountNumber ? `${prefix} - ${account.accountNumber}` : prefix;
}

function formatMutasiTypeLabel(type: AmMutasi['type']) {
  if (type === 'masuk') return 'Incoming';
  if (type === 'keluar') return 'Outgoing';
  return titleCase(type);
}

function formatMutasiSignedAmount(item: AmMutasi) {
  const prefix = item.type === 'masuk' ? '+' : item.type === 'keluar' ? '-' : '';
  return `${prefix}${formatRupiah(item.amount)}`;
}

function webhookLogMatchesTransfer(log: AmWebhookLog, transferId: string) {
  const payload = log.requestBody?.payload;
  if (payload && typeof payload === 'object' && 'transferId' in payload) {
    return payload.transferId === transferId;
  }

  return false;
}

function formatWebhookSecretStatus(config: AmWebhookConfig) {
  if (config.secretMasked) return config.secretMasked;
  return config.hasSecret ? 'configured' : 'not configured';
}

function formatDeviceRef(device: AmTransfer['deviceId'] | AmMutasi['deviceId']) {
  if (!device || typeof device === 'string') return '-';
  return device.name;
}

function formatDeviceLocation(device: AmTransfer['deviceId'] | AmMutasi['deviceId']) {
  if (!device || typeof device === 'string') return '-';
  const box = device.boxId;
  if (!box || typeof box === 'string') return '-';
  const rack = box.rackId;
  const rackName = rack && typeof rack === 'object' ? rack.name : null;
  return rackName ? `${box.name} / ${rackName}` : box.name;
}

function formatTransferServerIp(device: AmTransfer['deviceId']) {
  if (!device || typeof device === 'string') return '-';
  const box = device.boxId;
  if (!box || typeof box === 'string') return '-';
  const rack = box.rackId;
  if (!rack || typeof rack !== 'object') return '-';
  return rack.serverIp || '-';
}

function formatTransferCreatedBy(createdBy: AmTransfer['createdBy']) {
  if (!createdBy || typeof createdBy === 'string') return '-';
  return createdBy.fullName || createdBy.username || '-';
}

function getTransferTone(status: string) {
  if (status === 'success') return 'success';
  if (status === 'failed') return 'danger';
  return 'warning';
}

function getTransferStats(transfers: AmTransfer[]) {
  return {
    total: transfers.length,
    totalAmount: transfers.reduce((sum, transfer) => sum + transfer.amount, 0),
    pending: transfers.filter(transfer => transfer.status === 'pending').length,
    processing: transfers.filter(transfer => transfer.status === 'processing').length,
    success: transfers.filter(transfer => transfer.status === 'success').length,
    failed: transfers.filter(transfer => transfer.status === 'failed').length,
  };
}

function resolveRackId(rack: AmBox['rackId']) {
  return typeof rack === 'string' ? rack : rack?._id ?? '';
}

function resolveBoxId(box: AmDevice['boxId']) {
  return typeof box === 'string' ? box : box?._id ?? '';
}

function resolveServiceAccountDeviceId(device: AmServiceAccount['deviceId']) {
  return typeof device === 'string' ? device : device?._id ?? '';
}

function isDeviceCompatibleWithServicePlatform(device: AmDevice, platform: string) {
  const needsBrowserDevice = AM_BROWSER_DEVICE_PLATFORMS.has(platform);
  return needsBrowserDevice
    ? device.connectionType === 'browser'
    : device.connectionType !== 'browser';
}

function mergeAmEntityById<T extends {_id: string}>(items: T[], nextItem: T) {
  return items.some(item => item._id === nextItem._id)
    ? items.map(item => item._id === nextItem._id ? nextItem : item)
    : [nextItem, ...items];
}

function mergeAmEntityListById<T extends {_id: string}>(items: T[], preservedItems: T[]) {
  return preservedItems.reduce(
    (current, item) => mergeAmEntityById(current, item),
    items,
  );
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function cleanDevicePayload(payload: AmDevicePayload): Omit<AmDevicePayload, 'boxId'> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== ''),
  ) as Omit<AmDevicePayload, 'boxId'>;
}

function getQrLoginSignal(logs: AmDeviceServiceLog[]) {
  for (const log of logs.slice().reverse()) {
    const message = log.message;
    if (!message.includes('QR') && !message.includes('qrcode')) continue;

    const jsonStart = message.indexOf('{');
    if (jsonStart >= 0) {
      try {
        const parsed = JSON.parse(message.slice(jsonStart)) as {
          qrcodeBase64?: string;
          qrcodeId?: string;
          status?: string;
        };
        if (parsed.qrcodeBase64 || parsed.qrcodeId) return parsed;
      } catch {
        // Fall through to pattern extraction below.
      }
    }

    const qrcodeId = message.match(/qrcodeId["':=\s]+([A-Za-z0-9._-]+)/)?.[1]
      ?? message.match(/qr(?:code)?[-_\s]?id["':=\s]+([A-Za-z0-9._-]+)/i)?.[1];
    const status = message.match(/status["':=\s]+([A-Za-z0-9._-]+)/i)?.[1];
    if (qrcodeId || message.includes('QR')) {
      return {qrcodeId, status};
    }
  }
  return null;
}

function normalizeAmQrImageUri(value: string): string {
  return value.startsWith('data:') ? value : `data:image/png;base64,${value}`;
}

function countBoxesForRack(boxes: AmBox[], rack: AmRack) {
  return boxes.filter(box => isBoxInRack(box, rack)).length;
}

function countDevicesForRack(devices: AmDevice[], rack: AmRack) {
  return devices.filter(device => isDeviceInRack(device, rack)).length;
}

function formatRackAddedBy(rack: AmRack) {
  if (!rack.addedBy) return '-';
  return typeof rack.addedBy === 'object' ? rack.addedBy.fullName : rack.addedBy;
}

function isBoxInRack(box: AmBox, rack: AmRack) {
  if (typeof box.rackId === 'string') return box.rackId === rack._id || box.rackId === rack.slug;
  return box.rackId?._id === rack._id || box.rackId?.name === rack.name;
}

function isDeviceInRack(device: AmDevice, rack: AmRack) {
  if (!device.boxId || typeof device.boxId === 'string') return false;
  return device.boxId.rackId?._id === rack._id || device.boxId.rackId?.name === rack.name;
}

function isDeviceInBox(device: AmDevice, box: AmBox) {
  if (!device.boxId) return false;
  if (typeof device.boxId === 'string') return device.boxId === box._id || device.boxId === box.slug;
  return device.boxId._id === box._id || device.boxId.name === box.name;
}

function formatDeviceBox(device: AmDevice) {
  if (!device.boxId || typeof device.boxId === 'string') return 'No box';
  const rackName = device.boxId.rackId?.name;
  return rackName ? `${device.boxId.name} - ${rackName}` : device.boxId.name;
}

function formatDeviceIdentifier(device: AmDevice) {
  if (device.connectionType === 'browser') return 'Playwright';
  if (device.connectionType === 'tcp') return device.tcpAddress ?? '-';
  return device.udid ?? '-';
}

function mergeAmDeviceAdbStatus(
  devices: AmDevice[],
  adbStatusByDeviceId: AmDeviceAdbStatusMap,
) {
  return devices.map(device => {
    const adbStatus = adbStatusByDeviceId[device._id];
    return adbStatus ? {...device, adbStatus} : device;
  });
}

function getAdbTone(status: AmDevice['adbStatus']) {
  if (status === 'connected') return 'success';
  if (status === 'unauthorized') return 'warning';
  return 'danger';
}

function getRouteIdFromSurface(surface?: UnifiedSurface | null): AmRouteId {
  if (!surface) return 'dashboard';
  if (surface.id === 'tasks' || surface.route.includes('tasks')) return 'tasks';
  if (surface.id === 'hardware' || surface.route.includes('hardware')) return 'hardware';
  if (surface.route.includes('webhook')) return 'webhooks';
  if (surface.route.includes('transactions')) return 'transactions';
  if (surface.route.includes('mutasi')) return 'mutasi';
  if (surface.route.includes('admin/users')) return 'users';
  if (surface.route.includes('activity-log')) return 'activity-log';
  if (surface.route.includes('settings/account')) return 'settings-account';
  return 'dashboard';
}

function formatAmDate(value: string | null | undefined) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
  });
}

function formatCompactRupiah(value: number) {
  if (value >= 1_000_000_000) return `Rp${Math.round(value / 1_000_000_000)}M`;
  if (value >= 1_000_000) return `Rp${Math.round(value / 1_000_000)}jt`;
  if (value >= 1_000) return `Rp${Math.round(value / 1_000)}rb`;
  return formatRupiah(value);
}

function formatAmDuration(value: number | null | undefined) {
  return value ? `${value} ms` : '-';
}

function formatActivityLogTypeLabel(type: AmActivityLog['type']) {
  if (type === 'api') return 'API';
  if (type === 'page') return 'Page';
  return titleCase(type);
}

function getActivityLogMethodTone(method: string): 'success' | 'warning' | 'danger' | 'muted' {
  if (method === 'POST') return 'success';
  if (method === 'PUT' || method === 'PATCH') return 'warning';
  if (method === 'DELETE') return 'danger';
  return 'muted';
}

function getUserRoleTone(roleName?: string | null): 'success' | 'warning' | 'danger' | 'muted' {
  if (roleName === 'Super Admin') return 'danger';
  if (roleName === 'User') return 'warning';
  return 'muted';
}

function getAmStatsCount(
  rows: Array<{_id: string; count: number}> | undefined,
  key: string,
) {
  return rows?.find(row => row._id === key)?.count ?? 0;
}

function titleCase(value: string) {
  if (value === 'all') return 'All';
  return value
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const styles = StyleSheet.create({
  shell: {
    minHeight: 720,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: V.colors.border,
    backgroundColor: V.colors.bg,
  },
  content: {
    flex: 1,
    minWidth: 0,
    backgroundColor: V.colors.mainSurface,
  },
  topBarCompact: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: V.colors.border,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: V.colors.bg,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  serverText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
  },
  pageContent: {
    padding: 18,
  },
  pageStack: {
    gap: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    minWidth: 190,
    flexGrow: 1,
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 8,
    padding: 14,
    backgroundColor: V.colors.bg,
  },
  metricLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metricValue: {
    marginTop: 8,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 20,
    fontWeight: '900',
  },
  metricMeta: {
    marginTop: 4,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  panel: {
    gap: 12,
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 8,
    padding: 14,
    backgroundColor: V.colors.bg,
  },
  panelGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailGrid: {
    gap: 8,
  },
  panelTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
  },
  panelText: {
    marginTop: 6,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusPill: {
    minWidth: 120,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: V.colors.successSoft,
  },
  statusPillDanger: {
    backgroundColor: V.colors.dangerSoft,
  },
  statusPillValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '900',
  },
  statusPillLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: V.colors.border,
    paddingTop: 10,
  },
  rowTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  rowMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  rowActions: {
    alignItems: 'flex-end',
    gap: 5,
  },
  chartStack: {
    gap: 10,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chartDate: {
    width: 54,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  chartBars: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  chartBarTrack: {
    height: 8,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: V.colors.muted,
  },
  chartBar: {
    height: 8,
    borderRadius: 999,
  },
  chartBarIncoming: {
    backgroundColor: V.colors.success,
  },
  chartBarOutgoing: {
    backgroundColor: V.colors.danger,
  },
  chartValues: {
    width: 94,
    alignItems: 'flex-end',
    gap: 2,
  },
  amountText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  amountPositive: {
    color: V.colors.success,
  },
  amountDanger: {
    color: V.colors.danger,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: V.colors.bg,
  },
  breadcrumbText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  taskSearch: {
    width: 240,
  },
  activitySearch: {
    width: 300,
  },
  segmentList: {
    gap: 6,
  },
  segment: {
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: V.colors.bg,
  },
  segmentActive: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  segmentText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  segmentTextActive: {
    color: V.colors.primary,
  },
  errorPanel: {
    borderWidth: 1,
    borderColor: V.colors.danger,
    borderRadius: 8,
    padding: 12,
    backgroundColor: V.colors.dangerSoft,
  },
  errorTitle: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  errorText: {
    marginTop: 4,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  tablePanel: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 8,
    backgroundColor: V.colors.bg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: V.colors.border,
    backgroundColor: V.colors.mutedSoft,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tableHeaderText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: V.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  tableRowExpanded: {
    backgroundColor: V.colors.primarySoft,
  },
  serviceDetailPanel: {
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: V.colors.border,
    padding: 12,
    backgroundColor: V.colors.mutedSoft,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  detailTabs: {
    flexDirection: 'row',
    gap: 6,
  },
  detailTab: {
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: V.colors.bg,
  },
  detailTabActive: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  logPanel: {
    gap: 5,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#111827',
  },
  logText: {
    color: '#e5e7eb',
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  logEmptyText: {
    color: '#9ca3af',
    fontFamily: V.fontFamily,
    fontSize: 12,
    textAlign: 'center',
  },
  proofPanel: {
    gap: 8,
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: V.colors.bg,
  },
  proofImage: {
    width: '100%',
    height: 320,
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 8,
    backgroundColor: V.colors.muted,
  },
  detailList: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 8,
    backgroundColor: V.colors.bg,
  },
  detailListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: V.colors.border,
    paddingTop: 10,
  },
  detailListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: V.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  runtimePanel: {
    gap: 10,
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: V.colors.bg,
  },
  qrPanel: {
    gap: 5,
    borderWidth: 1,
    borderColor: V.colors.warning,
    borderRadius: 8,
    padding: 10,
    backgroundColor: V.colors.warningSoft,
  },
  qrImage: {
    width: 180,
    height: 180,
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 8,
    backgroundColor: V.colors.bg,
  },
  cellText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  typeCol: {
    flex: 1.2,
  },
  statusCol: {
    flex: 0.9,
  },
  accountWideCol: {
    flex: 1.3,
  },
  recipientCol: {
    flex: 1.4,
  },
  amountCol: {
    flex: 0.9,
  },
  actionCol: {
    flex: 1.2,
  },
  deviceCol: {
    flex: 1.2,
  },
  accountCol: {
    flex: 1.2,
  },
  errorCol: {
    flex: 1.2,
  },
  dateCol: {
    flex: 1,
  },
  serviceCol: {
    flex: 1.4,
  },
  platformCol: {
    flex: 0.8,
  },
  deviceWideCol: {
    flex: 1.3,
  },
  deviceNameCol: {
    flex: 1.2,
  },
  identifierCol: {
    flex: 1.2,
  },
  brandCol: {
    flex: 0.8,
  },
  modelCol: {
    flex: 0.8,
  },
  statusChip: {
    alignSelf: 'flex-start',
    borderRadius: V.control.badgeRadius,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: V.colors.muted,
  },
  statusChipSuccess: {
    backgroundColor: V.colors.successSoft,
  },
  statusChipWarning: {
    backgroundColor: V.colors.warningSoft,
  },
  statusChipDanger: {
    backgroundColor: V.colors.dangerSoft,
  },
  statusChipText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  inlineActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  paginationBar: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: V.colors.border,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  paginationText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  formGrid: {
    gap: 10,
  },
  formField: {
    gap: 5,
  },
  formLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  formInput: {
    minHeight: 38,
    borderWidth: 1,
    borderColor: V.colors.input,
    borderRadius: 8,
    paddingHorizontal: 10,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    backgroundColor: V.colors.bg,
  },
  uploadPanel: {
    gap: 8,
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: V.colors.mutedSoft,
  },
  cookieTextArea: {
    minHeight: 112,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  cookieErrorText: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  eventGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  eventChip: {
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: V.colors.bg,
  },
  eventChipSelected: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  eventChipText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  eventChipTextSelected: {
    color: V.colors.primary,
  },
  statusActionStack: {
    alignItems: 'flex-start',
    gap: 6,
  },
  successPanel: {
    borderWidth: 1,
    borderColor: V.colors.success,
    borderRadius: 8,
    padding: 12,
    backgroundColor: V.colors.successSoft,
  },
  successText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  warningPanel: {
    borderWidth: 1,
    borderColor: V.colors.warning,
    borderRadius: 8,
    padding: 12,
    backgroundColor: V.colors.warningSoft,
  },
  warningText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  hardwareCard: {
    width: 220,
    gap: 8,
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: V.colors.bg,
  },
  hardwareStats: {
    flexDirection: 'row',
    gap: 10,
  },
  monoText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  loadingText: {
    padding: 18,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    textAlign: 'center',
  },
  emptyPanel: {
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 8,
    padding: 18,
    backgroundColor: V.colors.bg,
  },
});
