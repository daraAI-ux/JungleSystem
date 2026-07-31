import React from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {appConfig} from '../config/app';
import type {UnifiedSurface} from '../domain/unified';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {formatRupiah} from '../lib/money';
import {
  cancelAmTransfer,
  clearAmServiceAccountSession,
  createAmWebhookConfig,
  deleteAmWebhookConfig,
  forceFailAmTransfer,
  getAmBoxes,
  getAmDevices,
  getAmActivityLogs,
  getAmActivityLogStats,
  getAmDeviceServiceLogs,
  getAmMutasi,
  getAmMutasiSummary,
  getAmRacks,
  getAmServiceAccounts,
  getAmTasks,
  getAmTransfers,
  getAmUsers,
  getAmWebhookConfigs,
  getAmWebhookEvents,
  getAmWebhookLogs,
  retryAmTransfer,
  startAmDeviceService,
  stopAmDeviceService,
  testAmWebhookPing,
  updateAmWebhookConfig,
  type AmActivityLog,
  type AmActivityLogStats,
  type AmBox,
  type AmDashboardData,
  type AmDevice,
  type AmDeviceServiceLog,
  type AmMutasi,
  type AmMutasiSummary,
  type AmRack,
  type AmServiceAccount,
  type AmServiceAccountDeviceRef,
  type AmTask,
  type AmTaskStatus,
  type AmTaskType,
  type AmTransfer,
  type AmUser,
  type AmWebhookConfig,
  type AmWebhookLog,
} from '../services/am-api';
import type {UnifiedDataset} from '../services/unified-data';
import {KolamButton} from './kolam-button';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {KolamSearchField} from './kolam-search-field';

type AmRouteId =
  | 'dashboard'
  | 'tasks'
  | 'services'
  | 'hardware'
  | 'webhooks'
  | 'transactions'
  | 'mutasi'
  | 'users'
  | 'activity-log';

interface AmRouteItem {
  id: AmRouteId;
  label: string;
  section: string;
  path: string;
  description: string;
}

const AM_ROUTES: AmRouteItem[] = [
  {id: 'dashboard', label: 'Dashboard', section: 'Overview', path: '/', description: 'Ringkasan akun, device, transfer, dan mutasi AM.'},
  {id: 'tasks', label: 'Tasks', section: 'Automation', path: '/tasks', description: 'Monitor dan kelola automation tasks lintas device.'},
  {id: 'services', label: 'Services', section: 'Automation', path: '/services', description: 'Service account dan worker automation.'},
  {id: 'hardware', label: 'Hardware', section: 'Infrastructure', path: '/hardware', description: 'Rack, box, device, dan koneksi ADB.'},
  {id: 'webhooks', label: 'Webhooks', section: 'Infrastructure', path: '/webhooks', description: 'Konfigurasi dan event webhook AM.'},
  {id: 'transactions', label: 'Transfers', section: 'Banking', path: '/transactions', description: 'Transfer bank dan status eksekusi.'},
  {id: 'mutasi', label: 'Mutations', section: 'Banking', path: '/mutasi', description: 'Mutasi rekening dan ingest transaksi.'},
  {id: 'users', label: 'Users', section: 'Administration', path: '/admin/users', description: 'User AM dan permission role.'},
  {id: 'activity-log', label: 'Activity Log', section: 'Administration', path: '/admin/activity-log', description: 'Audit log aktivitas AM.'},
];

const AM_ROUTE_SECTIONS = ['Overview', 'Automation', 'Infrastructure', 'Banking', 'Administration'];
const TASK_TYPE_LABELS: Record<string, string> = {
  stock_sync: 'Stock Sync',
  process_sale: 'Process Sale',
  send_message: 'Send Message',
  bank_transfer: 'Bank Transfer',
};
const TASK_STATUSES: Array<AmTaskStatus | 'all'> = ['all', 'pending', 'queued', 'processing', 'success', 'failed', 'cancelled'];
const TASK_TYPES: Array<AmTaskType | 'all'> = ['all', 'stock_sync', 'process_sale', 'send_message', 'bank_transfer'];
const AM_PLATFORMS = ['all', 'whatsapp', 'tiktok', 'instagram', 'tokopedia', 'shopee', 'bca', 'brimo', 'dana'];
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

export function KolamAmSurface({
  activeSurface,
  dataset,
  onBackToCenter,
}: {
  activeSurface?: UnifiedSurface | null;
  dataset: UnifiedDataset;
  onBackToCenter?: () => void;
}) {
  const [activeRoute, setActiveRoute] = React.useState<AmRouteId>(
    getRouteIdFromSurface(activeSurface),
  );

  React.useEffect(() => {
    setActiveRoute(getRouteIdFromSurface(activeSurface));
  }, [activeSurface]);

  const route = AM_ROUTES.find(item => item.id === activeRoute) ?? AM_ROUTES[0];

  return (
    <View style={styles.shell}>
      <View style={styles.sidebar}>
        <View style={styles.brandBlock}>
          <Text style={styles.brandTitle}>AM</Text>
          <Text style={styles.brandSubtitle}>Automation Management</Text>
        </View>
        <ScrollView contentContainerStyle={styles.sidebarContent} showsVerticalScrollIndicator={false}>
          {AM_ROUTE_SECTIONS.map(section => {
            const items = AM_ROUTES.filter(item => item.section === section);
            return (
              <View key={section} style={styles.navSection}>
                <Text style={styles.navSectionLabel}>{section}</Text>
                {items.map(item => (
                  <AmNavItem
                    key={item.id}
                    active={item.id === activeRoute}
                    item={item}
                    onPress={() => setActiveRoute(item.id)}
                  />
                ))}
              </View>
            );
          })}
        </ScrollView>
      </View>
      <View style={styles.content}>
        <View style={styles.topBar}>
          <View style={styles.topBarCopy}>
            <Text style={styles.topBarEyebrow}>Automation Management</Text>
            <Text style={styles.topBarTitle}>{route.label}</Text>
            <Text style={styles.topBarSubtitle}>{route.description}</Text>
          </View>
          <View style={styles.topBarActions}>
            <Text style={styles.serverText}>{appConfig.amApiBaseUrl}</Text>
            <KolamButton label="Kembali" intent="outline" size="sm" onPress={onBackToCenter} />
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
          {activeRoute === 'dashboard' ? (
            <AmDashboardPage dashboard={dataset.am.dashboard} />
          ) : activeRoute === 'tasks' ? (
            <AmTasksPage />
          ) : activeRoute === 'services' ? (
            <AmServicesPage />
          ) : activeRoute === 'hardware' ? (
            <AmHardwarePage />
          ) : activeRoute === 'webhooks' ? (
            <AmWebhooksPage />
          ) : activeRoute === 'transactions' ? (
            <AmTransfersPage />
          ) : activeRoute === 'mutasi' ? (
            <AmMutasiPage />
          ) : activeRoute === 'users' ? (
            <AmUsersPage />
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

function AmNavItem({active, item, onPress}: {active: boolean; item: AmRouteItem; onPress: () => void}) {
  return (
    <KolamInteractionFrame
      accessibilityLabel={`AM ${item.label}`}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.navItem, active && styles.navItemActive]}>
      <Text style={[styles.navItemText, active && styles.navItemTextActive]}>{item.label}</Text>
      <Text style={[styles.navItemPath, active && styles.navItemPathActive]}>{item.path}</Text>
    </KolamInteractionFrame>
  );
}

function AmDashboardPage({dashboard}: {dashboard?: AmDashboardData | null}) {
  if (!dashboard) {
    return (
      <View style={styles.emptyPanel}>
        <Text style={styles.panelTitle}>Menunggu data live AM</Text>
        <Text style={styles.panelText}>
          Dashboard akan terisi dari endpoint /dashboard setelah sesi Kolam punya akses AM.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.pageStack}>
      <View style={styles.metricGrid}>
        <AmMetricCard label="Total Balance" value={formatRupiah(dashboard.summary.totalBalance)} meta={`${dashboard.summary.totalAccounts} account`} />
        <AmMetricCard label="Incoming Today" value={formatRupiah(dashboard.summary.todayIncoming.total)} meta={`${dashboard.summary.todayIncoming.count} transaksi`} />
        <AmMetricCard label="Outgoing Today" value={formatRupiah(dashboard.summary.todayOutgoing.total)} meta={`${dashboard.summary.todayOutgoing.count} transaksi`} />
        <AmMetricCard label="Active Devices" value={String(dashboard.summary.activeDevices)} meta={`${dashboard.devices.length} device terdaftar`} />
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Transfer Status</Text>
        <View style={styles.statusRow}>
          <AmStatusPill label="Pending" value={dashboard.transfers.pending} />
          <AmStatusPill label="Processing" value={dashboard.transfers.processing} />
          <AmStatusPill label="Success" value={dashboard.transfers.success} />
          <AmStatusPill label="Failed" value={dashboard.transfers.failed} danger />
        </View>
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Devices</Text>
        {dashboard.devices.slice(0, 8).map(device => (
          <View key={device._id} style={styles.deviceRow}>
            <View>
              <Text style={styles.rowTitle}>{device.name}</Text>
              <Text style={styles.rowMeta}>
                {device.brand} {device.model} - {device.rackName ?? 'No rack'} / {device.boxName ?? 'No box'}
              </Text>
            </View>
            <Text style={styles.rowMeta}>{device.activeAccountCount}/{device.accountCount} active</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function AmTasksPage() {
  const [tasks, setTasks] = React.useState<AmTask[]>([]);
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<string>('all');
  const [type, setType] = React.useState<string>('all');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState(0);

  const fetchTasks = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAmTasks({
        page: 1,
        limit: 20,
        search: search.trim() || undefined,
        status: status === 'all' ? undefined : status,
        type: type === 'all' ? undefined : type,
      });
      setTasks(response.data);
      setTotal(response.meta.total);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat task AM live.');
    } finally {
      setIsLoading(false);
    }
  }, [search, status, type]);

  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  React.useEffect(() => {
    const interval = setInterval(fetchTasks, 10_000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  return (
    <View style={styles.pageStack}>
      <View style={styles.filterBar}>
        <KolamSearchField value={search} onChangeText={setSearch} placeholder="Search..." containerStyle={styles.taskSearch} trailingLabel={`${total} task`} />
        <AmSegmentGroup active={type} items={TASK_TYPES} labels={TASK_TYPE_LABELS} onSelect={setType} />
        <AmSegmentGroup active={status} items={TASK_STATUSES} onSelect={setStatus} />
        <KolamButton label={isLoading ? 'Memuat' : 'Refresh'} intent="outline" size="sm" muted={isLoading} onPress={fetchTasks} />
      </View>
      {error ? (
        <View style={styles.errorPanel}>
          <Text style={styles.errorTitle}>AM live belum bisa dibaca</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <View style={styles.tablePanel}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.typeCol]}>Type</Text>
          <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
          <Text style={[styles.tableHeaderText, styles.deviceCol]}>Device</Text>
          <Text style={[styles.tableHeaderText, styles.accountCol]}>Account</Text>
          <Text style={[styles.tableHeaderText, styles.dateCol]}>Created</Text>
        </View>
        {isLoading && !tasks.length ? <Text style={styles.loadingText}>Memuat tasks dari AM live...</Text> : null}
        {!isLoading && !tasks.length ? <Text style={styles.loadingText}>No tasks found</Text> : null}
        {tasks.map(task => (
          <View key={task._id} style={styles.tableRow}>
            <Text style={[styles.cellText, styles.typeCol]}>{TASK_TYPE_LABELS[task.type] ?? task.type}</Text>
            <Text style={[styles.cellText, styles.statusCol]}>{task.status}</Text>
            <Text style={[styles.cellText, styles.deviceCol]} numberOfLines={1}>{task.deviceId?.name ?? '-'}</Text>
            <Text style={[styles.cellText, styles.accountCol]} numberOfLines={1}>{task.serviceAccountId?.label ?? task.serviceAccountId?.platform ?? '-'}</Text>
            <Text style={[styles.cellText, styles.dateCol]}>{formatAmDate(task.createdAt)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function AmServicesPage() {
  const [accounts, setAccounts] = React.useState<AmServiceAccount[]>([]);
  const [platform, setPlatform] = React.useState('all');
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [expandedTab, setExpandedTab] = React.useState<'logs' | 'history'>('logs');
  const [detailLogs, setDetailLogs] = React.useState<AmDeviceServiceLog[]>([]);
  const [detailTasks, setDetailTasks] = React.useState<AmTask[]>([]);
  const [detailTransfers, setDetailTransfers] = React.useState<AmTransfer[]>([]);
  const [detailRunning, setDetailRunning] = React.useState(false);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState<string | null>(null);
  const [actingServiceId, setActingServiceId] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAccounts = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAmServiceAccounts({
        platform: platform === 'all' ? undefined : platform,
      });
      setAccounts(response.data);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat services AM live.');
    } finally {
      setIsLoading(false);
    }
  }, [platform]);

  React.useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  React.useEffect(() => {
    const interval = setInterval(fetchAccounts, 15_000);
    return () => clearInterval(interval);
  }, [fetchAccounts]);

  const loadServiceLogs = React.useCallback(async (account: AmServiceAccount) => {
    const device = getServiceDevice(account);
    if (!device?._id) {
      setDetailLogs([]);
      setDetailRunning(false);
      setDetailError('Service belum punya device.');
      return;
    }

    try {
      setDetailLoading(true);
      const response = await getAmDeviceServiceLogs(device._id, {
        limit: 80,
        source: 'realtime',
        page: 1,
      });
      setDetailLogs(response.logs);
      setDetailRunning(response.processRunning);
      setDetailError(null);
    } catch (nextError) {
      setDetailError(nextError instanceof Error ? nextError.message : 'Gagal memuat service logs.');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const loadServiceHistory = React.useCallback(async (account: AmServiceAccount) => {
    try {
      setDetailLoading(true);
      if (isTransferBanking(account.platform)) {
        const response = await getAmTransfers({
          serviceAccountId: account._id,
          limit: 5,
          page: 1,
        });
        setDetailTransfers(response.data);
        setDetailTasks([]);
      } else {
        const response = await getAmTasks({
          serviceAccountId: account._id,
          limit: 5,
          page: 1,
        });
        setDetailTasks(response.data);
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
      setDetailTasks([]);
      setDetailTransfers([]);
      setDetailError(null);
      return;
    }

    setExpandedId(account._id);
    setExpandedTab(isTransferBanking(account.platform) ? 'history' : 'logs');
    setDetailLogs([]);
    setDetailTasks([]);
    setDetailTransfers([]);
    if (isTransferBanking(account.platform)) {
      await loadServiceHistory(account);
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
      await loadServiceHistory(account);
    } else {
      await loadServiceLogs(account);
    }
  }, [loadServiceHistory, loadServiceLogs]);

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
      setDetailLogs([]);
      setDetailRunning(false);
      await fetchAccounts();
    } catch (nextError) {
      setDetailError(nextError instanceof Error ? nextError.message : 'Gagal membersihkan session service.');
    } finally {
      setActingServiceId(null);
    }
  }, [fetchAccounts]);

  return (
    <View style={styles.pageStack}>
      <View style={styles.filterBar}>
        <AmSegmentGroup
          active={platform}
          items={AM_PLATFORMS}
          labels={AM_PLATFORM_LABELS}
          onSelect={setPlatform}
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
                  processRunning={detailRunning}
                  tasks={detailTasks}
                  transfers={detailTransfers}
                  canClearSession={PLAYWRIGHT_PLATFORMS.has(account.platform)}
                  clearingSession={actingServiceId === account._id}
                  onClearSession={() => clearServiceSession(account)}
                  onSelectTab={tab => selectDetailTab(account, tab)}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function AmHardwarePage() {
  const [racks, setRacks] = React.useState<AmRack[]>([]);
  const [boxes, setBoxes] = React.useState<AmBox[]>([]);
  const [devices, setDevices] = React.useState<AmDevice[]>([]);
  const [selectedRackId, setSelectedRackId] = React.useState<string | null>(null);
  const [selectedBoxId, setSelectedBoxId] = React.useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchHardware = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [rackResponse, boxResponse, deviceResponse] = await Promise.all([
        getAmRacks(),
        getAmBoxes(),
        getAmDevices(),
      ]);
      setRacks(rackResponse.data);
      setBoxes(boxResponse.data);
      setDevices(deviceResponse.data);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat hardware AM live.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchHardware();
  }, [fetchHardware]);

  React.useEffect(() => {
    const interval = setInterval(fetchHardware, 10_000);
    return () => clearInterval(interval);
  }, [fetchHardware]);

  const connectedDevices = devices.filter(device => device.adbStatus === 'connected').length;
  const unauthorizedDevices = devices.filter(device => device.adbStatus === 'unauthorized').length;
  const selectedRack = racks.find(rack => rack._id === selectedRackId) ?? null;
  const selectedBox = boxes.find(box => box._id === selectedBoxId) ?? null;
  const selectedDevice = devices.find(device => device._id === selectedDeviceId) ?? null;
  const visibleBoxes = selectedRack
    ? boxes.filter(box => isBoxInRack(box, selectedRack))
    : [];
  const visibleDevices = selectedBox
    ? devices.filter(device => isDeviceInBox(device, selectedBox))
    : selectedRack
      ? devices.filter(device => isDeviceInRack(device, selectedRack))
      : devices;

  const resetHardwareRoute = React.useCallback(() => {
    setSelectedRackId(null);
    setSelectedBoxId(null);
    setSelectedDeviceId(null);
  }, []);

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
      {selectedDevice ? (
        <AmDeviceDetailPanel device={selectedDevice} />
      ) : selectedBox ? (
        <AmHardwareDeviceList
          devices={visibleDevices}
          isLoading={isLoading}
          onSelectDevice={device => setSelectedDeviceId(device._id)}
        />
      ) : selectedRack ? (
        <>
          <AmHardwareBoxGrid
            boxes={visibleBoxes}
            isLoading={isLoading}
            onSelectBox={box => setSelectedBoxId(box._id)}
          />
          <AmHardwareDeviceList
            devices={visibleDevices}
            isLoading={isLoading}
            onSelectDevice={device => setSelectedDeviceId(device._id)}
          />
        </>
      ) : (
        <>
          <AmHardwareRackGrid
            boxes={boxes}
            devices={devices}
            isLoading={isLoading}
            onSelectRack={rack => setSelectedRackId(rack._id)}
            racks={racks}
          />
          <AmHardwareDeviceList
            devices={visibleDevices}
            isLoading={isLoading}
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
  isLoading,
  logs,
  onClearSession,
  onSelectTab,
  processRunning,
  tasks,
  transfers,
}: {
  account: AmServiceAccount;
  activeTab: 'logs' | 'history';
  canClearSession: boolean;
  clearingSession: boolean;
  detailError: string | null;
  isLoading: boolean;
  logs: AmDeviceServiceLog[];
  onClearSession: () => void;
  onSelectTab: (tab: 'logs' | 'history') => void;
  processRunning: boolean;
  tasks: AmTask[];
  transfers: AmTransfer[];
}) {
  const banking = isTransferBanking(account.platform);

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
        <View style={styles.logPanel}>
          {!logs.length ? <Text style={styles.logEmptyText}>No realtime logs</Text> : null}
          {logs.slice(-20).map((log, index) => (
            <Text key={`${log.ts}-${index}`} style={styles.logText} numberOfLines={2}>
              [{formatAmDate(log.ts)}] {log.level}: {log.message}
            </Text>
          ))}
        </View>
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
        </View>
      ) : null}
    </View>
  );
}

function AmHardwareRackGrid({
  boxes,
  devices,
  isLoading,
  onSelectRack,
  racks,
}: {
  boxes: AmBox[];
  devices: AmDevice[];
  isLoading: boolean;
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
            <AmStatusChip label={rack.status} tone={rack.status === 'active' ? 'success' : 'muted'} />
          </KolamInteractionFrame>
        ))}
      </View>
    </View>
  );
}

function AmHardwareBoxGrid({
  boxes,
  isLoading,
  onSelectBox,
}: {
  boxes: AmBox[];
  isLoading: boolean;
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
          </KolamInteractionFrame>
        ))}
      </View>
    </View>
  );
}

function AmHardwareDeviceList({
  devices,
  isLoading,
  onSelectDevice,
}: {
  devices: AmDevice[];
  isLoading: boolean;
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
        </KolamInteractionFrame>
      ))}
    </View>
  );
}

function AmDeviceDetailPanel({device}: {device: AmDevice}) {
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
    </View>
  );
}

function AmTransfersPage() {
  const [transfers, setTransfers] = React.useState<AmTransfer[]>([]);
  const [status, setStatus] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [actingTransferId, setActingTransferId] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const fetchTransfers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAmTransfers({
        limit: 30,
        search: search.trim() || undefined,
        status: status === 'all' ? undefined : status,
      });
      setTransfers(response.data);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat transfers AM live.');
    } finally {
      setIsLoading(false);
    }
  }, [search, status]);

  React.useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  React.useEffect(() => {
    const interval = setInterval(fetchTransfers, 10_000);
    return () => clearInterval(interval);
  }, [fetchTransfers]);

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
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Aksi transfer AM gagal.');
    } finally {
      setActingTransferId(null);
    }
  }, [fetchTransfers]);

  return (
    <View style={styles.pageStack}>
      <View style={styles.filterBar}>
        <KolamSearchField value={search} onChangeText={setSearch} placeholder="Search transfer..." containerStyle={styles.taskSearch} trailingLabel={`${transfers.length} transfer`} />
        <AmSegmentGroup active={status} items={['all', 'pending', 'processing', 'success', 'failed']} onSelect={setStatus} />
        <KolamButton label={isLoading ? 'Memuat' : 'Refresh'} intent="outline" muted={isLoading} size="sm" onPress={fetchTransfers} />
      </View>
      <AmInlineError title="Transfers AM belum bisa dibaca" error={error} />
      {actionMessage ? (
        <View style={styles.successPanel}>
          <Text style={styles.successText}>{actionMessage}</Text>
        </View>
      ) : null}
      <View style={styles.tablePanel}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.accountWideCol]}>Account</Text>
          <Text style={[styles.tableHeaderText, styles.recipientCol]}>Recipient</Text>
          <Text style={[styles.tableHeaderText, styles.amountCol]}>Amount</Text>
          <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
          <Text style={[styles.tableHeaderText, styles.dateCol]}>Created</Text>
          <Text style={[styles.tableHeaderText, styles.actionCol]}>Action</Text>
        </View>
        <AmLoadingOrEmpty isLoading={isLoading} items={transfers} loadingText="Memuat transfers dari AM live..." emptyText="No transfers found" />
        {transfers.map(transfer => (
          <View key={transfer._id} style={styles.tableRow}>
            <View style={styles.accountWideCol}>
              <Text style={styles.cellText} numberOfLines={1}>{formatBankAccount(transfer.accountId)}</Text>
              <Text style={styles.rowMeta} numberOfLines={1}>{formatDeviceRef(transfer.deviceId)}</Text>
            </View>
            <View style={styles.recipientCol}>
              <Text style={styles.cellText} numberOfLines={1}>{transfer.recipientName || '-'}</Text>
              <Text style={styles.rowMeta} numberOfLines={1}>{transfer.recipientBank ?? '-'} {transfer.recipientAccount}</Text>
            </View>
            <Text style={[styles.cellText, styles.amountCol]}>{formatRupiah(transfer.amount)}</Text>
            <View style={styles.statusCol}>
              <AmStatusChip label={transfer.status} tone={getTransferTone(transfer.status)} />
            </View>
            <Text style={[styles.cellText, styles.dateCol]}>{formatAmDate(transfer.createdAt)}</Text>
            <View style={styles.actionCol}>
              <AmTransferActions
                disabled={actingTransferId === transfer._id}
                transfer={transfer}
                onAction={runTransferAction}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function AmMutasiPage() {
  const [mutasi, setMutasi] = React.useState<AmMutasi[]>([]);
  const [summary, setSummary] = React.useState<AmMutasiSummary | null>(null);
  const [type, setType] = React.useState('all');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchMutasi = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [listResponse, summaryResponse] = await Promise.all([
        getAmMutasi({limit: 30, type: type === 'all' ? undefined : type}),
        getAmMutasiSummary(),
      ]);
      setMutasi(listResponse.data);
      setSummary(summaryResponse);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat mutasi AM live.');
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  React.useEffect(() => {
    fetchMutasi();
  }, [fetchMutasi]);

  React.useEffect(() => {
    const interval = setInterval(fetchMutasi, 10_000);
    return () => clearInterval(interval);
  }, [fetchMutasi]);

  return (
    <View style={styles.pageStack}>
      <View style={styles.filterBar}>
        <AmMetricCard label="Masuk" value={formatRupiah(summary?.masuk.total ?? 0)} meta={`${summary?.masuk.count ?? 0} mutasi`} />
        <AmMetricCard label="Keluar" value={formatRupiah(summary?.keluar.total ?? 0)} meta={`${summary?.keluar.count ?? 0} mutasi`} />
        <AmSegmentGroup active={type} items={['all', 'masuk', 'keluar']} onSelect={setType} />
        <KolamButton label={isLoading ? 'Memuat' : 'Refresh'} intent="outline" muted={isLoading} size="sm" onPress={fetchMutasi} />
      </View>
      <AmInlineError title="Mutasi AM belum bisa dibaca" error={error} />
      <View style={styles.tablePanel}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.accountWideCol]}>Account</Text>
          <Text style={[styles.tableHeaderText, styles.typeCol]}>Type</Text>
          <Text style={[styles.tableHeaderText, styles.amountCol]}>Amount</Text>
          <Text style={[styles.tableHeaderText, styles.recipientCol]}>Description</Text>
          <Text style={[styles.tableHeaderText, styles.dateCol]}>Detected</Text>
        </View>
        <AmLoadingOrEmpty isLoading={isLoading} items={mutasi} loadingText="Memuat mutasi dari AM live..." emptyText="No mutations found" />
        {mutasi.map(item => (
          <View key={item._id} style={styles.tableRow}>
            <View style={styles.accountWideCol}>
              <Text style={styles.cellText} numberOfLines={1}>{formatBankAccount(item.accountId)}</Text>
              <Text style={styles.rowMeta} numberOfLines={1}>{formatDeviceRef(item.deviceId)}</Text>
            </View>
            <View style={styles.typeCol}>
              <AmStatusChip label={item.type} tone={item.type === 'masuk' ? 'success' : 'warning'} />
            </View>
            <Text style={[styles.cellText, styles.amountCol]}>{formatRupiah(item.amount)}</Text>
            <Text style={[styles.cellText, styles.recipientCol]} numberOfLines={1}>{item.description || '-'}</Text>
            <Text style={[styles.cellText, styles.dateCol]}>{formatAmDate(item.detectedAt)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
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

  if (transfer.status === 'pending' || transfer.status === 'processing') {
    actions.push({id: 'cancel', label: 'Cancel', intent: 'outline'});
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
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={V.colors.mutedFg}
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
        getAmWebhookLogs({limit: 20}),
        getAmWebhookEvents(),
      ]);
      setConfigs(configResponse.data);
      setLogs(logResponse.data);
      setEvents(eventResponse);
      setSelectedEvents(current => current.length ? current : eventResponse);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat webhooks AM live.');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    if (!url || selectedEvents.length === 0) {
      setError('URL dan minimal satu event wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      setActionMessage(null);
      const payload = {
        url,
        events: selectedEvents,
        description: formDescription.trim(),
        ...(formSecret.trim() ? {secret: formSecret.trim()} : {}),
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
      await testAmWebhookPing();
      setActionMessage('Test ping dispatched.');
      await fetchWebhooks();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Webhook test ping gagal.');
    }
  }, [fetchWebhooks]);

  return (
    <View style={styles.pageStack}>
      <View style={styles.filterBar}>
        <AmMetricCard label="Configs" value={String(configs.length)} meta={`${configs.filter(item => item.status === 'active').length} active`} />
        <AmMetricCard label="Recent Logs" value={String(logs.length)} meta={`${logs.filter(log => !log.success).length} failed`} />
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
          <AmTextInput label="Secret" placeholder={editingConfigId ? 'Kosongkan untuk secret lama' : 'Shared secret optional'} value={formSecret} onChangeText={setFormSecret} />
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
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.typeCol]}>Direction</Text>
          <Text style={[styles.tableHeaderText, styles.recipientCol]}>Event</Text>
          <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
          <Text style={[styles.tableHeaderText, styles.amountCol]}>Duration</Text>
          <Text style={[styles.tableHeaderText, styles.dateCol]}>Created</Text>
        </View>
        <AmLoadingOrEmpty isLoading={isLoading} items={logs} loadingText="Memuat webhook logs..." emptyText="No webhook logs found" />
        {logs.map(log => (
          <View key={log._id} style={styles.tableRow}>
            <Text style={[styles.cellText, styles.typeCol]}>{log.direction}</Text>
            <Text style={[styles.cellText, styles.recipientCol]} numberOfLines={1}>{log.event}</Text>
            <View style={styles.statusCol}>
              <AmStatusChip label={log.responseStatus ? String(log.responseStatus) : (log.success ? 'success' : 'failed')} tone={log.success ? 'success' : 'danger'} />
            </View>
            <Text style={[styles.cellText, styles.amountCol]}>{log.duration} ms</Text>
            <Text style={[styles.cellText, styles.dateCol]}>{formatAmDate(log.createdAt)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function AmUsersPage() {
  const [users, setUsers] = React.useState<AmUser[]>([]);
  const [search, setSearch] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUsers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAmUsers({limit: 30, search: search.trim() || undefined});
      setUsers(response.data);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat users AM live.');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <View style={styles.pageStack}>
      <View style={styles.filterBar}>
        <KolamSearchField value={search} onChangeText={setSearch} placeholder="Search users..." containerStyle={styles.taskSearch} trailingLabel={`${users.length} user`} />
        <KolamButton label={isLoading ? 'Memuat' : 'Refresh'} intent="outline" muted={isLoading} size="sm" onPress={fetchUsers} />
      </View>
      <AmInlineError title="Users AM belum bisa dibaca" error={error} />
      <View style={styles.tablePanel}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.accountWideCol]}>Name</Text>
          <Text style={[styles.tableHeaderText, styles.accountCol]}>Username</Text>
          <Text style={[styles.tableHeaderText, styles.recipientCol]}>Role</Text>
          <Text style={[styles.tableHeaderText, styles.amountCol]}>Permissions</Text>
        </View>
        <AmLoadingOrEmpty isLoading={isLoading} items={users} loadingText="Memuat users dari AM live..." emptyText="No users found" />
        {users.map(user => (
          <View key={user._id} style={styles.tableRow}>
            <Text style={[styles.cellText, styles.accountWideCol]} numberOfLines={1}>{user.fullName}</Text>
            <Text style={[styles.cellText, styles.accountCol]} numberOfLines={1}>{user.username}</Text>
            <Text style={[styles.cellText, styles.recipientCol]} numberOfLines={1}>{user.role?.name ?? '-'}</Text>
            <Text style={[styles.cellText, styles.amountCol]}>{user.role?.permissions.length ?? 0}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function AmActivityLogPage() {
  const [logs, setLogs] = React.useState<AmActivityLog[]>([]);
  const [stats, setStats] = React.useState<AmActivityLogStats | null>(null);
  const [status, setStatus] = React.useState('all');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchLogs = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [listResponse, statsResponse] = await Promise.all([
        getAmActivityLogs({limit: 40, status: status === 'all' ? undefined : status}),
        getAmActivityLogStats(7),
      ]);
      setLogs(listResponse.data);
      setStats(statsResponse);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat activity log AM live.');
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <View style={styles.pageStack}>
      <View style={styles.filterBar}>
        <AmMetricCard label="Window" value={`${stats?.days ?? 7}d`} meta={stats?.since ? formatAmDate(stats.since) : 'stats'} />
        <AmMetricCard label="Types" value={String(stats?.byType.length ?? 0)} meta="activity groups" />
        <AmSegmentGroup active={status} items={['all', 'success', 'failed']} onSelect={setStatus} />
        <KolamButton label={isLoading ? 'Memuat' : 'Refresh'} intent="outline" muted={isLoading} size="sm" onPress={fetchLogs} />
      </View>
      <AmInlineError title="Activity Log AM belum bisa dibaca" error={error} />
      <View style={styles.tablePanel}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.dateCol]}>Time</Text>
          <Text style={[styles.tableHeaderText, styles.typeCol]}>Type</Text>
          <Text style={[styles.tableHeaderText, styles.accountWideCol]}>Action</Text>
          <Text style={[styles.tableHeaderText, styles.recipientCol]}>Path</Text>
          <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
        </View>
        <AmLoadingOrEmpty isLoading={isLoading} items={logs} loadingText="Memuat activity logs..." emptyText="No activity logs found" />
        {logs.map(log => (
          <View key={log._id} style={styles.tableRow}>
            <Text style={[styles.cellText, styles.dateCol]}>{formatAmDate(log.timestamp)}</Text>
            <Text style={[styles.cellText, styles.typeCol]}>{log.type}</Text>
            <View style={styles.accountWideCol}>
              <Text style={styles.cellText} numberOfLines={1}>{log.action}</Text>
              <Text style={styles.rowMeta} numberOfLines={1}>{log.username ?? log.userId?.fullName ?? 'anonymous'}</Text>
            </View>
            <Text style={[styles.cellText, styles.recipientCol]} numberOfLines={1}>{log.method} {log.path}</Text>
            <View style={styles.statusCol}>
              <AmStatusChip label={`${log.statusCode}`} tone={log.status === 'success' ? 'success' : 'danger'} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function AmParityPlaceholder({route}: {route: AmRouteItem}) {
  return (
    <View style={styles.emptyPanel}>
      <Text style={styles.panelTitle}>{route.label}</Text>
      <Text style={styles.panelText}>
        Route {route.path} sudah masuk sidebar AM internal. Port native detail berikutnya akan mengikuti halaman AM FE saat ini dan endpoint AM BE live.
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
        <KolamInteractionFrame key={item} onPress={() => onSelect(item)} style={[styles.segment, active === item && styles.segmentActive]}>
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

function getServiceDevice(account: AmServiceAccount) {
  return typeof account.deviceId === 'object' ? account.deviceId : null;
}

function isTransferBanking(platform: string) {
  return platform === 'bca' || platform === 'brimo';
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

function formatDeviceRef(device: AmTransfer['deviceId'] | AmMutasi['deviceId']) {
  if (!device || typeof device === 'string') return '-';
  return device.name;
}

function getTransferTone(status: string) {
  if (status === 'success') return 'success';
  if (status === 'failed') return 'danger';
  return 'warning';
}

function countBoxesForRack(boxes: AmBox[], rack: AmRack) {
  return boxes.filter(box => isBoxInRack(box, rack)).length;
}

function countDevicesForRack(devices: AmDevice[], rack: AmRack) {
  return devices.filter(device => isDeviceInRack(device, rack)).length;
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
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: V.colors.border,
    backgroundColor: V.colors.bg,
  },
  sidebar: {
    width: 248,
    borderRightWidth: 1,
    borderRightColor: V.colors.border,
    backgroundColor: V.colors.sidebar,
  },
  brandBlock: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: V.colors.border,
  },
  brandTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 22,
    fontWeight: '900',
  },
  brandSubtitle: {
    marginTop: 2,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  sidebarContent: {
    padding: 12,
    gap: 12,
  },
  navSection: {
    gap: 6,
  },
  navSectionLabel: {
    paddingHorizontal: 8,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  navItem: {
    gap: 2,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  navItemActive: {
    backgroundColor: V.colors.primarySoft,
  },
  navItemText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  navItemTextActive: {
    color: V.colors.primary,
  },
  navItemPath: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
  },
  navItemPathActive: {
    color: V.colors.primary,
  },
  content: {
    flex: 1,
    minWidth: 0,
    backgroundColor: V.colors.mainSurface,
  },
  topBar: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: V.colors.border,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: V.colors.bg,
  },
  topBarCopy: {
    flex: 1,
    minWidth: 0,
  },
  topBarEyebrow: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  topBarTitle: {
    marginTop: 2,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 22,
    fontWeight: '900',
  },
  topBarSubtitle: {
    marginTop: 2,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
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
  detailList: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 8,
    backgroundColor: V.colors.bg,
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
    borderRadius: 999,
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
