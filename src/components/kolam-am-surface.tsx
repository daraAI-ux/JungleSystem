import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {appConfig} from '../config/app';
import type {UnifiedSurface} from '../domain/unified';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {formatRupiah} from '../lib/money';
import {
  getAmTasks,
  type AmDashboardData,
  type AmTask,
  type AmTaskStatus,
  type AmTaskType,
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
  deviceCol: {
    flex: 1.2,
  },
  accountCol: {
    flex: 1.2,
  },
  dateCol: {
    flex: 1,
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
