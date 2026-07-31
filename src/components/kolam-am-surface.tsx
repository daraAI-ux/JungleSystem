import React from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {appConfig} from '../config/app';
import {
  AM_ROUTES,
  getAmRouteByModuleRoute,
  type AmRouteId,
  type AmRouteItem,
} from '../domain/am-navigation';
import type {ShellModuleRouteEntry} from '../domain/app-shell';
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
  createAmUser,
  createAmWebhookConfig,
  deleteAmBoxes,
  deleteAmDevices,
  deleteAmRacks,
  deleteAmUser,
  deleteAmWebhookConfig,
  forceFailAmTransfer,
  forceFailAmTask,
  getAmBoxes,
  getAmDevices,
  getAmActivityLogs,
  getAmActivityLogStats,
  getAmDashboard,
  getAmDeviceServiceLogs,
  getAmDeviceServices,
  getAmDeviceServiceQrUrl,
  getAmCurrentUser,
  getAmTaskById,
  getAmMutasi,
  getAmMutasiSummary,
  getAmRacks,
  getAmRoles,
  getAmServiceAccounts,
  getAmTasks,
  getAmTransferById,
  getAmTransfers,
  getAmUsers,
  getAmWebhookConfigs,
  getAmWebhookEvents,
  getAmWebhookLogs,
  retryAmTransfer,
  retryAmTask,
  sendAmDeviceServiceInput,
  startAmDeviceService,
  stopAmDeviceService,
  testAmWebhookPing,
  updateAmBox,
  updateAmDevice,
  updateAmRack,
  updateAmUser,
  updateAmWebhookConfig,
  type AmActivityLog,
  type AmActivityLogStats,
  type AmBox,
  type AmCurrentUser,
  type AmDashboardData,
  type AmDevice,
  type AmDevicePayload,
  type AmDeviceServiceLog,
  type AmDeviceServiceStatus,
  type AmMutasi,
  type AmMutasiSummary,
  type AmRack,
  type AmRole,
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
const AM_TRANSFER_PAGE_LIMIT = 20;
const AM_MUTASI_PAGE_LIMIT = 50;
const AM_USER_PAGE_LIMIT = 20;
const AM_ACTIVITY_LOG_PAGE_LIMIT = 50;
const AM_ACTIVITY_LOG_TYPES = ['all', 'api', 'page'];
const AM_ACTIVITY_LOG_STATUSES = ['all', 'success', 'failed'];
const AM_ACTIVITY_LOG_METHODS = ['all', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
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
  activeModuleRoute,
  dataset,
  onBackToCenter,
}: {
  activeSurface?: UnifiedSurface | null;
  activeModuleRoute?: ShellModuleRouteEntry | null;
  dataset: UnifiedDataset;
  onBackToCenter?: () => void;
}) {
  const activeRoute = activeModuleRoute
    ? getAmRouteByModuleRoute(activeModuleRoute.route).id
    : getRouteIdFromSurface(activeSurface);
  const route = AM_ROUTES.find(item => item.id === activeRoute) ?? AM_ROUTES[0];

  return (
    <View style={styles.shell}>
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

function AmDashboardPage({dashboard}: {dashboard?: AmDashboardData | null}) {
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
        <AmRecentTransfersPanel transfers={data.recentTransfers} />
        <AmRecentMutasiPanel mutasi={data.recentMutasi} />
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>7 Hari Mutasi</Text>
        {data.chartData.map(point => (
          <View key={point.date} style={styles.deviceRow}>
            <Text style={styles.rowTitle}>{point.date}</Text>
            <Text style={styles.rowMeta}>Masuk {formatRupiah(point.incoming)} / Keluar {formatRupiah(point.outgoing)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Devices</Text>
        {data.devices.slice(0, 8).map(device => (
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

function AmRecentTransfersPanel({transfers}: {transfers: AmTransfer[]}) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Recent Transfers</Text>
      <Text style={styles.panelText}>Latest transfer activity across all devices.</Text>
      {transfers.slice(0, 5).map(transfer => (
        <View key={transfer._id} style={styles.deviceRow}>
          <View>
            <Text style={styles.rowTitle}>{transfer.recipientName || transfer.recipientAccount}</Text>
            <Text style={styles.rowMeta}>{formatBankAccount(transfer.accountId)} - {formatAmDate(transfer.createdAt)}</Text>
          </View>
          <View style={styles.rowActions}>
            <Text style={styles.amountText}>{formatRupiah(transfer.amount)}</Text>
            <AmStatusChip label={transfer.status} tone={getTransferTone(transfer.status)} />
          </View>
        </View>
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

function AmRecentMutasiPanel({mutasi}: {mutasi: AmMutasi[]}) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Recent Mutations</Text>
      <Text style={styles.panelText}>Latest incoming and outgoing transactions.</Text>
      {mutasi.slice(0, 5).map(item => (
        <View key={item._id} style={styles.deviceRow}>
          <View>
            <Text style={styles.rowTitle}>{item.type === 'masuk' ? 'In' : 'Out'} - {formatBankAccount(item.accountId)}</Text>
            <Text style={styles.rowMeta}>{item.description || formatDeviceRef(item.deviceId)} - {formatAmDate(item.detectedAt)}</Text>
          </View>
          <Text style={[styles.amountText, item.type === 'masuk' ? styles.amountPositive : styles.amountDanger]}>
            {item.type === 'masuk' ? '+' : '-'}{formatRupiah(item.amount)}
          </Text>
        </View>
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

function AmTasksPage() {
  const [tasks, setTasks] = React.useState<AmTask[]>([]);
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<string>('all');
  const [type, setType] = React.useState<string>('all');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actingTaskId, setActingTaskId] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(AM_TASK_PAGE_LIMIT);
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);

  const fetchTasks = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAmTasks({
        page,
        limit: AM_TASK_PAGE_LIMIT,
        search: search.trim() || undefined,
        status: status === 'all' ? undefined : status,
        type: type === 'all' ? undefined : type,
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
  }, [page, search, status, type]);

  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
  const [search, setSearch] = React.useState('');
  const [platform, setPlatform] = React.useState('all');
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [expandedTab, setExpandedTab] = React.useState<'logs' | 'history'>('logs');
  const [detailLogs, setDetailLogs] = React.useState<AmDeviceServiceLog[]>([]);
  const [detailServices, setDetailServices] = React.useState<AmDeviceServiceStatus[]>([]);
  const [detailTasks, setDetailTasks] = React.useState<AmTask[]>([]);
  const [detailTransfers, setDetailTransfers] = React.useState<AmTransfer[]>([]);
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
  const [error, setError] = React.useState<string | null>(null);

  const fetchAccounts = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAmServiceAccounts({
        page,
        limit: AM_SERVICE_PAGE_LIMIT,
        search: search.trim() || undefined,
        platform: platform === 'all' ? undefined : platform,
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
  }, [page, platform, search]);

  React.useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

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

  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  const rangeFrom = total ? (page - 1) * limit + 1 : 0;
  const rangeTo = total ? Math.min(page * limit, total) : 0;

  const loadServiceLogs = React.useCallback(async (account: AmServiceAccount) => {
    const device = getServiceDevice(account);
    if (!device?._id) {
      setDetailLogs([]);
      setDetailServices([]);
      setDetailRunning(false);
      setDetailError('Service belum punya device.');
      return;
    }

    try {
      setDetailLoading(true);
      const [response, statusResponse] = await Promise.all([
        getAmDeviceServiceLogs(device._id, {
          limit: 80,
          source: 'realtime',
          page: 1,
        }),
        getAmDeviceServices(device._id),
      ]);
      setDetailLogs(response.logs);
      setDetailServices(statusResponse);
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
      setDetailServices([]);
      setDetailTasks([]);
      setDetailTransfers([]);
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
    setServiceInputValue('');
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
      setDetailServices([]);
      setDetailRunning(false);
      await fetchAccounts();
    } catch (nextError) {
      setDetailError(nextError instanceof Error ? nextError.message : 'Gagal membersihkan session service.');
    } finally {
      setActingServiceId(null);
    }
  }, [fetchAccounts]);

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
                  serviceInputSending={serviceInputSending}
                  serviceInputValue={serviceInputValue}
                  serviceStatuses={detailServices}
                  processRunning={detailRunning}
                  tasks={detailTasks}
                  transfers={detailTransfers}
                  canClearSession={PLAYWRIGHT_PLATFORMS.has(account.platform)}
                  clearingSession={actingServiceId === account._id}
                  onClearSession={() => clearServiceSession(account)}
                  onChangeServiceInput={setServiceInputValue}
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

  if (task.status === 'pending' || task.status === 'queued' || task.status === 'processing') {
    actions.push({id: 'cancel', label: 'Cancel', intent: 'outline'});
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

function AmHardwarePage() {
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
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
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
    setFormAdbPort('');
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
        const payload = cleanDevicePayload({
          connectionType: formConnectionType,
          udid: formUdid.trim(),
          tcpAddress: formTcpAddress.trim(),
          brand: formBrand.trim(),
          model: formModel.trim(),
          adbPort: parseOptionalNumber(formAdbPort),
          appiumPort: editingHardwareId ? parseOptionalNumber(formAppiumPort) : undefined,
        });
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
                onSelect={value => setFormConnectionType(value as 'usb' | 'tcp' | 'browser')}
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
          onDeleteDevice={device => deleteHardware('device', device._id)}
          onEditDevice={editDevice}
          onSelectDevice={device => setSelectedDeviceId(device._id)}
        />
      ) : selectedRack ? (
        <>
          <AmHardwareBoxGrid
            actingHardwareId={actingHardwareId}
            boxes={visibleBoxes}
            isLoading={isLoading}
            onDeleteBox={box => deleteHardware('box', box._id)}
            onEditBox={editBox}
            onSelectBox={box => setSelectedBoxId(box._id)}
          />
          <AmHardwareDeviceList
            actingHardwareId={actingHardwareId}
            devices={visibleDevices}
            isLoading={isLoading}
            onDeleteDevice={device => deleteHardware('device', device._id)}
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
            onDeleteRack={rack => deleteHardware('rack', rack._id)}
            onEditRack={editRack}
            onSelectRack={rack => setSelectedRackId(rack._id)}
            racks={racks}
          />
          <AmHardwareDeviceList
            actingHardwareId={actingHardwareId}
            devices={visibleDevices}
            isLoading={isLoading}
            onDeleteDevice={device => deleteHardware('device', device._id)}
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
  isLoading,
  logs,
  serviceInputSending,
  serviceInputValue,
  serviceStatuses,
  onClearSession,
  onChangeServiceInput,
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
  isLoading: boolean;
  logs: AmDeviceServiceLog[];
  serviceInputSending: boolean;
  serviceInputValue: string;
  serviceStatuses: AmDeviceServiceStatus[];
  onClearSession: () => void;
  onChangeServiceInput: (value: string) => void;
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
            {qrSignal ? (
              <View style={styles.qrPanel}>
                <Text style={styles.formLabel}>QR Login {AM_PLATFORM_LABELS[account.platform] ?? titleCase(account.platform)}</Text>
                <Text style={styles.rowMeta}>{qrSignal.status ? `Status ${qrSignal.status}` : 'Scan QR dari endpoint AM live.'}</Text>
                {qrSignal.qrcodeBase64 ? (
                  <Text style={styles.monoText} numberOfLines={1}>{qrSignal.qrcodeBase64}</Text>
                ) : qrUrl ? (
                  <Text style={styles.monoText} numberOfLines={1}>{qrUrl}</Text>
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
          <View style={styles.logPanel}>
            {!logs.length ? <Text style={styles.logEmptyText}>No realtime logs</Text> : null}
            {logs.slice(-20).map((log, index) => (
              <Text key={`${log.ts}-${index}`} style={styles.logText} numberOfLines={2}>
                [{formatAmDate(log.ts)}] {log.level}: {log.message}
              </Text>
            ))}
          </View>
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
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(AM_TRANSFER_PAGE_LIMIT);
  const [total, setTotal] = React.useState(0);
  const [selectedTransferId, setSelectedTransferId] = React.useState<string | null>(null);
  const [selectedTransfer, setSelectedTransfer] = React.useState<AmTransfer | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState<string | null>(null);
  const [actingTransferId, setActingTransferId] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const fetchTransfers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAmTransfers({
        page,
        limit: AM_TRANSFER_PAGE_LIMIT,
        search: search.trim() || undefined,
        status: status === 'all' ? undefined : status,
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
  }, [page, search, status]);

  React.useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  React.useEffect(() => {
    const interval = setInterval(fetchTransfers, 10_000);
    return () => clearInterval(interval);
  }, [fetchTransfers]);

  const loadTransferDetail = React.useCallback(async (id: string) => {
    try {
      setDetailLoading(true);
      const response = await getAmTransferById(id);
      setSelectedTransfer(response);
      setDetailError(null);
    } catch (nextError) {
      setDetailError(nextError instanceof Error ? nextError.message : 'Gagal memuat detail transfer AM.');
    } finally {
      setDetailLoading(false);
    }
  }, []);

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

  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  const rangeFrom = total ? (page - 1) * limit + 1 : 0;
  const rangeTo = total ? Math.min(page * limit, total) : 0;
  const transferStats = getTransferStats(transfers);

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
        <KolamButton label={isLoading ? 'Memuat' : 'Refresh'} intent="outline" muted={isLoading} size="sm" onPress={fetchTransfers} />
      </View>
      <AmInlineError title="Transfers AM belum bisa dibaca" error={error} />
      {actionMessage ? (
        <View style={styles.successPanel}>
          <Text style={styles.successText}>{actionMessage}</Text>
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
          error={detailError}
          isLoading={detailLoading}
          transfer={selectedTransfer}
        />
      ) : null}
    </View>
  );
}

function AmTransferDetailPanel({
  error,
  isLoading,
  transfer,
}: {
  error: string | null;
  isLoading: boolean;
  transfer: AmTransfer | null;
}) {
  if (!transfer && !isLoading && !error) return null;

  return (
    <View style={styles.panel}>
      <View style={styles.detailHeader}>
        <View>
          <Text style={styles.panelTitle}>Transfer Detail</Text>
          <Text style={styles.rowMeta}>{transfer?._id ?? 'Memuat detail transfer...'}</Text>
        </View>
        {transfer ? <AmStatusChip label={transfer.status} tone={getTransferTone(transfer.status)} /> : null}
      </View>
      <AmInlineError title="Detail transfer AM belum bisa dibaca" error={error} />
      {isLoading ? <Text style={styles.loadingText}>Memuat detail transfer...</Text> : null}
      {transfer ? (
        <>
          <View style={styles.metricGrid}>
            <AmMetricCard label="Amount" value={formatRupiah(transfer.amount)} meta={`Fee ${formatRupiah(transfer.fee ?? 0)}`} />
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
          <View style={styles.logPanel}>
            {!transfer.logs.length ? <Text style={styles.logEmptyText}>No transfer logs</Text> : null}
            {transfer.logs.slice(-30).map((line, index) => (
              <Text key={`${index}-${line}`} style={styles.logText} numberOfLines={2}>
                {String(index + 1).padStart(3, '0')} {line}
              </Text>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

function AmMutasiPage() {
  const [mutasi, setMutasi] = React.useState<AmMutasi[]>([]);
  const [summary, setSummary] = React.useState<AmMutasiSummary | null>(null);
  const [type, setType] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(AM_MUTASI_PAGE_LIMIT);
  const [total, setTotal] = React.useState(0);
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
        }),
        getAmMutasiSummary(),
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
  }, [page, type]);

  React.useEffect(() => {
    fetchMutasi();
  }, [fetchMutasi]);

  React.useEffect(() => {
    const interval = setInterval(fetchMutasi, 10_000);
    return () => clearInterval(interval);
  }, [fetchMutasi]);

  const handleMutasiTypeChange = React.useCallback((value: string) => {
    setType(value);
    setPage(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  const rangeFrom = total ? (page - 1) * limit + 1 : 0;
  const rangeTo = total ? Math.min(page * limit, total) : 0;
  const incoming = summary?.masuk ?? {total: 0, count: 0};
  const outgoing = summary?.keluar ?? {total: 0, count: 0};
  const netBalance = incoming.total - outgoing.total;
  const totalTransactions = incoming.count + outgoing.count;

  return (
    <View style={styles.pageStack}>
      <View style={styles.filterBar}>
        <AmMetricCard label="Total Incoming" value={formatRupiah(incoming.total)} meta={`${incoming.count} mutasi`} />
        <AmMetricCard label="Total Outgoing" value={formatRupiah(outgoing.total)} meta={`${outgoing.count} mutasi`} />
        <AmMetricCard label="Net Balance" value={formatRupiah(netBalance)} meta="masuk - keluar" />
        <AmMetricCard label="Total Transactions" value={String(totalTransactions)} meta="summary count" />
        <AmSegmentGroup active={type} items={['all', 'masuk', 'keluar']} onSelect={handleMutasiTypeChange} />
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
  const [roles, setRoles] = React.useState<AmRole[]>([]);
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [limit, setLimit] = React.useState(AM_USER_PAGE_LIMIT);
  const [editingUserId, setEditingUserId] = React.useState<string | null>(null);
  const [formFullName, setFormFullName] = React.useState('');
  const [formUsername, setFormUsername] = React.useState('');
  const [formPassword, setFormPassword] = React.useState('');
  const [formRole, setFormRole] = React.useState('');
  const [actingUserId, setActingUserId] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUsers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [userResponse, roleResponse] = await Promise.all([
        getAmUsers({
          page,
          limit: AM_USER_PAGE_LIMIT,
          search: search.trim() || undefined,
        }),
        getAmRoles(),
      ]);
      setUsers(userResponse.data);
      setTotal(userResponse.meta.total);
      setLimit(userResponse.meta.limit || AM_USER_PAGE_LIMIT);
      setRoles(roleResponse);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat users AM live.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  const handleUserSearchChange = React.useCallback((value: string) => {
    setSearch(value);
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
    setActionMessage(null);
  }, []);

  const saveUser = React.useCallback(async () => {
    const fullName = formFullName.trim();
    const username = formUsername.trim();
    const password = formPassword.trim();

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
  }, [editingUserId, fetchUsers, formFullName, formPassword, formRole, formUsername, resetUserForm, users]);

  const removeUser = React.useCallback(async (user: AmUser) => {
    try {
      setActingUserId(user._id);
      await deleteAmUser(user._id);
      setActionMessage(`User ${user.username} berhasil dihapus.`);
      if (editingUserId === user._id) {
        resetUserForm();
      }
      await fetchUsers();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal menghapus user AM.');
    } finally {
      setActingUserId(null);
    }
  }, [editingUserId, fetchUsers, resetUserForm]);

  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  const rangeFrom = total ? (page - 1) * limit + 1 : 0;
  const rangeTo = total ? Math.min(page * limit, total) : 0;

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
        <KolamButton label={isLoading ? 'Memuat' : 'Refresh'} intent="outline" muted={isLoading} size="sm" onPress={fetchUsers} />
      </View>
      <AmInlineError title="Users AM belum bisa dibaca" error={error} />
      {actionMessage ? (
        <View style={styles.successPanel}>
          <Text style={styles.successText}>{actionMessage}</Text>
        </View>
      ) : null}
      <View style={styles.tablePanel}>
        <View style={styles.formGrid}>
          <AmTextInput label="Full Name" placeholder="e.g. John Doe" value={formFullName} onChangeText={setFormFullName} />
          <AmTextInput label="Username" placeholder="e.g. johndoe" value={formUsername} onChangeText={setFormUsername} />
          <AmTextInput
            label="Password"
            placeholder={editingUserId ? 'Kosongkan untuk password lama' : 'Min 8 chars, uppercase, lowercase, digit, special'}
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
            <Text style={[styles.cellText, styles.recipientCol]} numberOfLines={1}>{user.role?.name ?? '-'}</Text>
            <Text style={[styles.cellText, styles.dateCol]}>{formatAmDate(user.createdAt)}</Text>
            <View style={styles.actionCol}>
              <View style={styles.inlineActions}>
                <KolamButton
                  accessibilityLabel={`AM User Edit ${user._id}`}
                  label="Edit"
                  intent="outline"
                  size="sm"
                  onPress={() => editUser(user)}
                />
                <KolamButton
                  accessibilityLabel={`AM User Delete ${user._id}`}
                  label={actingUserId === user._id ? '...' : 'Delete'}
                  intent="danger"
                  muted={actingUserId === user._id}
                  size="sm"
                  onPress={() => removeUser(user)}
                />
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
      `${scope} mengikuti form AM FE, tetapi AM BE live saat ini baru menyediakan GET /auth/me untuk akun aktif.`,
    );
  }, []);

  const handleSaveProfile = React.useCallback(() => {
    if (!fullName.trim() || !emailAddress.trim()) {
      setError('Full name dan email address wajib diisi.');
      return;
    }

    if (user && fullName.trim() === user.fullName && emailAddress.trim() === user.username) {
      setError('Tidak ada perubahan profile untuk disimpan.');
      return;
    }

    showEndpointNotice('Profile information');
  }, [emailAddress, fullName, showEndpointNotice, user]);

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
              label="Save"
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
            <Text style={[styles.cellText, styles.typeCol]}>{log.type}</Text>
            <Text style={[styles.cellText, styles.typeCol]}>{log.method || '-'}</Text>
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

function formatAmDuration(value: number | null | undefined) {
  return value ? `${value} ms` : '-';
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
