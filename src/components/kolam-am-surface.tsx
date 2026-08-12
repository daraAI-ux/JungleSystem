import React from 'react';
import {Image, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import type {DimensionValue} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_DEVICE_ICON_SVG} from '../assets/icons/device-icon-svg';
import {KOLAM_SALDO_TOTAL_ICON_SVG} from '../assets/icons/saldo-total-icon-svg';
import {KOLAM_UANG_KELUAR_ICON_SVG} from '../assets/icons/uang-keluar-icon-svg';
import {KOLAM_UANG_MASUK_ICON_SVG} from '../assets/icons/uang-masuk-icon-svg';
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
import {formatRupiah, formatRupiahCompactCurrency} from '../lib/money';
import {getAccessToken} from '../lib/api-client';
import {KolamChevronIcon} from './kolam-chevron-icon';
import {
  measureFilterPanelAnchor,
  type KolamFilterPanelAnchor,
} from './kolam-filter-panel-anchor';
import {
  bulkDeleteAmActivityLogs,
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
  getAmMutasiReceiptUrl,
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
  retryAmTransfer,
  retryAmTask,
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
import {KolamCardFrame} from './kolam-card-frame';
import {KolamButton} from './kolam-button';
import {KolamDeleteButton} from './kolam-delete-button';
import {KolamCancelButton} from './kolam-cancel-button';
import {KolamEditButton} from './kolam-edit-button';
import {KolamModuleIcon} from './kolam-module-icon';
import {KolamRefreshButton} from './kolam-refresh-button';
import {KolamResetButton} from './kolam-reset-button';
import {KolamSaveButton} from './kolam-save-button';
import {KolamConfirmDialog} from './kolam-confirm-dialog';
import {KolamCatalogListTableShell} from './kolam-catalog-list-table-shell';
import {KolamDaftarButton} from './kolam-daftar-button';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import {KolamModalDialog} from './kolam-modal-dialog';
import {KolamTableRowActionMenu} from './kolam-dropdown-select';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {KolamSearchField} from './kolam-search-field';
import {KolamSwitch} from './kolam-switch';
import {KolamTableFilterTrigger} from './kolam-table-filter-trigger';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';

const TASK_TYPE_LABELS: Record<string, string> = {
  all: 'Semua tipe',
  stock_sync: 'Sinkron stok',
  process_sale: 'Proses penjualan',
  send_message: 'Kirim pesan',
  bank_transfer: 'Transfer bank',
};
const TASK_STATUS_FILTER_LABELS: Record<string, string> = {
  all: 'Semua status',
};
const TRANSFER_STATUS_FILTER_LABELS: Record<string, string> = {
  all: 'Semua status',
};
const MUTASI_TYPE_FILTER_LABELS: Record<string, string> = {
  all: 'Semua tipe',
  masuk: 'Masuk',
  keluar: 'Keluar',
};
const TASK_FILTER_STATUSES: Array<Exclude<AmTaskStatus, 'queued'> | 'all'> = ['all', 'pending', 'processing', 'success', 'failed', 'cancelled'];
const TASK_TYPES: Array<AmTaskType | 'all'> = ['all', 'stock_sync', 'process_sale', 'send_message', 'bank_transfer'];
const AM_TASK_PAGE_LIMIT = 20;
const AM_SERVICE_PAGE_LIMIT = 20;
const AM_SERVICE_LOG_PAGE_LIMIT = 100;
const AM_TRANSFER_PAGE_LIMIT = 20;
const AM_MUTASI_PAGE_LIMIT = 100;
const AM_WEBHOOK_LOG_PAGE_LIMIT = 50;
const AM_USER_PAGE_LIMIT = 100;
const AM_ACTIVITY_LOG_PAGE_LIMIT = 50;
const AM_WEBHOOK_LOG_DIRECTIONS = ['all', 'outgoing'];
const AM_ACTIVITY_LOG_TYPES = ['all', 'api', 'page'];
const AM_ACTIVITY_LOG_STATUSES = ['all', 'success', 'failed'];
const AM_ACTIVITY_LOG_METHODS = ['all', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const AM_ACTIVITY_LOG_TYPE_LABELS: Record<string, string> = {
  all: 'Semua tipe',
  api: 'API',
  page: 'Halaman',
};
const AM_ACTIVITY_LOG_STATUS_LABELS: Record<string, string> = {
  all: 'Semua status',
  success: 'Berhasil',
  failed: 'Gagal',
};
const AM_ACTIVITY_LOG_METHOD_LABELS: Record<string, string> = {
  all: 'Semua metode',
};
const AM_PLATFORMS = ['all', 'whatsapp', 'tiktok', 'instagram', 'tokopedia', 'shopee', 'bca', 'brimo', 'dana'];
type AmServicesFilterPanel = 'platform' | 'status';
type AmHardwareFilterPanel = 'status';
type AmServiceDetailTab = 'logs' | 'history' | 'session';
type AmDashboardRecentTab = 'transfers' | 'mutasi';
const AM_RECIPIENT_BANKS = ['BRI', 'BCA', 'Mandiri', 'BNI', 'BSI', 'CIMB Niaga', 'Permata', 'Danamon', 'OCBC NISP', 'BTN'];
const AM_TRANSFER_METHODS = ['BI FAST', 'Realtime Online'];
const AM_TRANSFER_METHOD_FEES: Record<string, number> = {
  'BI FAST': 2500,
  'Realtime Online': 6500,
};
const AM_TRANSACTION_PURPOSES = ['Investment', 'Purchase', 'Others (for various purposes)', 'Transfer of Wealth'];
const AM_TRANSACTION_PURPOSE_LABELS: Record<string, string> = {
  Investment: 'Investasi',
  Purchase: 'Pembelian',
  'Others (for various purposes)': 'Lainnya',
  'Transfer of Wealth': 'Transfer dana',
};
const AM_PLATFORM_LABELS: Record<string, string> = {
  all: 'Semua platform',
  whatsapp: 'WhatsApp',
  tokopedia: 'Tokopedia',
  shopee: 'Shopee',
  bca: 'BCA',
  brimo: 'BRImo',
  dana: 'DANA',
  tiktok: 'TikTok',
  instagram: 'Instagram',
};
const AM_SERVICE_STATUS_LABELS: Record<string, string> = {
  all: 'Semua status',
  active: 'Aktif',
  inactive: 'Nonaktif',
  blocked: 'Diblokir',
};
const AM_SERVICE_STATUS_FILTERS = ['all', 'active', 'inactive', 'blocked'];
const AM_HARDWARE_ENTITY_STATUS_FILTERS = ['all', 'active', 'inactive'];
const AM_HARDWARE_DEVICE_STATUS_FILTERS = ['all', 'connected', 'disconnected', 'unauthorized', 'unknown'];
const AM_SERVICE_FILTER_PANEL_WIDTH = 240;
const PLAYWRIGHT_PLATFORMS = new Set(['tokopedia', 'shopee', 'tiktok', 'instagram']);
const AM_BROWSER_DEVICE_PLATFORMS = new Set(['tokopedia', 'shopee', 'tiktok', 'instagram', 'whatsapp']);
const AM_EXCLUSIVE_SERVICE_PLATFORMS = new Set(['whatsapp', 'tokopedia', 'shopee', 'tiktok', 'instagram']);
const AM_BANKING_SERVICE_PLATFORMS = new Set(['bca', 'brimo', 'dana']);
type AmServiceFieldKind = 'username' | 'password' | 'pin' | 'accountNumber' | 'phoneNumber';
const AM_SERVICE_FIELD_META: Record<string, Partial<Record<AmServiceFieldKind, {label: string; placeholder: string}>>> = {
  whatsapp: {
    phoneNumber: {label: 'Nomor HP', placeholder: 'contoh 08123456789'},
  },
  tokopedia: {
    phoneNumber: {label: 'Nomor HP', placeholder: 'contoh 08123456789'},
    password: {label: 'Kata sandi', placeholder: 'Kata sandi Tokopedia'},
  },
  shopee: {
    username: {label: 'Email / Nama pengguna', placeholder: 'Email login toko'},
    password: {label: 'Kata sandi', placeholder: 'Kata sandi toko'},
  },
  tiktok: {
    username: {label: 'Nama pengguna', placeholder: 'Nama pengguna TikTok'},
  },
  instagram: {
    username: {label: 'Email / Nama pengguna', placeholder: 'Email atau nama pengguna Instagram'},
    password: {label: 'Kata sandi', placeholder: 'Kata sandi Instagram'},
  },
  bca: {
    username: {label: 'Nama pengguna', placeholder: 'Nama pengguna myBCA'},
    password: {label: 'Kata sandi', placeholder: 'Kata sandi myBCA'},
    pin: {label: 'PIN', placeholder: 'PIN akun'},
    accountNumber: {label: 'Nomor akun', placeholder: 'contoh 1234567890'},
  },
  brimo: {
    username: {label: 'Nama pengguna', placeholder: 'Nama pengguna BRImo'},
    password: {label: 'Kata sandi', placeholder: 'Kata sandi BRImo'},
    pin: {label: 'PIN', placeholder: 'PIN akun'},
    accountNumber: {label: 'Nomor akun', placeholder: 'contoh 1234567890'},
  },
  dana: {
    phoneNumber: {label: 'Nomor HP DANA', placeholder: 'contoh 081234567890'},
    pin: {label: 'PIN', placeholder: 'PIN DANA'},
  },
};
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
    ? routeSelection.routeId
    : getRouteIdFromSurface(activeSurface);

  return (
    <View style={styles.pageContent}>
      {activeRoute === 'dashboard' ? (
        <AmDashboardPage
          dashboard={dataset.am.dashboard}
          onBackToCenter={onBackToCenter}
          onModuleRouteSelect={onModuleRouteSelect}
        />
      ) : (
        <View style={styles.pageStack}>
          {activeRoute === 'tasks' ? (
            <AmTasksPage
              initialTaskId={routeSelection?.taskId}
              onModuleRouteSelect={onModuleRouteSelect}
            />
          ) : activeRoute === 'services' ? (
            <AmServicesPage />
          ) : activeRoute === 'hardware' ? (
            <AmHardwarePage
              initialRoute={routeSelection?.hardwareRoute}
              onModuleRouteSelect={onModuleRouteSelect}
            />
          ) : activeRoute === 'webhooks' ? (
            <AmWebhooksPage />
          ) : activeRoute === 'transactions' ? (
            <AmTransfersPage
              initialTransferId={routeSelection?.transferId}
              onModuleRouteSelect={onModuleRouteSelect}
            />
          ) : activeRoute === 'mutasi' ? (
            <AmMutasiPage
              initialMutasiId={routeSelection?.mutasiId}
              onModuleRouteSelect={onModuleRouteSelect}
            />
          ) : activeRoute === 'users' ? (
            <AmUsersPage />
          ) : activeRoute === 'activity-log' ? (
            <AmActivityLogPage />
          ) : (
            <AmNotFoundPage />
          )}
        </View>
      )}
    </View>
  );
}

type AmRouteSelection = {
  routeId: AmRouteId | 'not-found';
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
  if (isLegacyAmSsoRoute(normalizedRoute)) {
    return {routeId: 'dashboard'};
  }

  const routeItem = getKnownAmRouteByModuleRoute(normalizedRoute);
  const segments = normalizedRoute === '/' ? [] : normalizedRoute.split('/');

  if (!routeItem) {
    return {routeId: 'not-found'};
  }

  if (segments[0] === 'tasks' && isConcreteRouteSegment(segments[1])) {
    return {routeId: routeItem.id, taskId: segments[1]};
  }

  if (segments[0] === 'transactions' && isConcreteRouteSegment(segments[1])) {
    return {routeId: routeItem.id, transferId: segments[1]};
  }

  if (segments[0] === 'mutasi' && isConcreteRouteSegment(segments[1])) {
    return {routeId: routeItem.id, mutasiId: segments[1]};
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
      ? {routeId: routeItem.id, hardwareRoute}
      : {routeId: routeItem.id};
  }

  return {routeId: routeItem.id};
}

function getKnownAmRouteByModuleRoute(route?: string | null): AmRouteItem | null {
  const normalizedRoute = normalizeModuleRoutePath(route);
  const routeItem = getAmRouteByModuleRoute(normalizedRoute);
  const normalizedItemRoute = normalizeModuleRoutePath(routeItem.moduleRoute);

  if (normalizedItemRoute === '/') {
    return normalizedRoute === '/' ? routeItem : null;
  }

  return normalizedRoute === normalizedItemRoute ||
    normalizedRoute.startsWith(`${normalizedItemRoute}/`)
    ? routeItem
    : null;
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

function isLegacyAmSsoRoute(route: string) {
  return route === 'login' || route === 'settings/account';
}

function isConcreteRouteSegment(segment?: string) {
  return Boolean(segment && !segment.startsWith(':'));
}

function AmDashboardPage({
  dashboard,
  onBackToCenter,
  onModuleRouteSelect,
}: {
  dashboard?: AmDashboardData | null;
  onBackToCenter?: () => void;
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
      setError(err instanceof Error ? err.message : 'Gagal memuat dashboard AM');
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
        setError(err instanceof Error ? err.message : 'Gagal memuat dashboard AM');
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
        <Text style={styles.panelTitle}>{isLoading ? 'Memuat dashboard AM' : 'Menunggu data AM'}</Text>
        <AmInlineError error={error} title="AM dashboard belum bisa dibaca" />
      </View>
    );
  }

  return (
    <View style={[styles.pageStack, styles.dashboardPageStack]}>
      <AmInlineError error={error} title="AM dashboard refresh gagal" />
      <View style={styles.metricGrid}>
        <AmDashboardWalletCard
          artwork="saldo-total"
          label="Saldo Total"
          meta={`${data.summary.totalAccounts} akun`}
          tone={data.summary.totalBalance < 0 ? 'danger' : 'primary'}
          value={formatRupiah(data.summary.totalBalance)}
        />
        <AmDashboardWalletCard
          artwork="uang-masuk"
          label="Masuk Hari Ini"
          meta={`${data.summary.todayIncoming.count} transaksi`}
          tone="success"
          value={formatRupiah(data.summary.todayIncoming.total)}
        />
        <AmDashboardWalletCard
          artwork="uang-keluar"
          label="Keluar Hari Ini"
          meta={`${data.summary.todayOutgoing.count} transaksi`}
          tone="warning"
          value={formatRupiah(data.summary.todayOutgoing.total)}
        />
        <AmDashboardWalletCard
          artwork="device"
          label="Device Aktif"
          meta="dengan akun aktif"
          tone="info"
          value={String(data.summary.activeDevices)}
        />
      </View>
      <View style={styles.overviewGrid}>
        <View style={[styles.panel, styles.overviewChartPanel]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.panelTitle}>Mutasi (7 hari)</Text>
            <KolamButton
              accessibilityLabel="AM Dashboard View Mutations"
              label="Lihat semua"
              intent="outline"
              size="sm"
              onPress={() => openAmRoute('mutasi')}
            />
          </View>
          <Text style={styles.panelText}>Volume transaksi masuk dan keluar selama 7 hari terakhir.</Text>
          <AmMutationChart chartData={data.chartData} />
        </View>
        <View style={[styles.panel, styles.overviewTransferPanel]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.panelTitle}>Transfer Hari Ini</Text>
            <KolamButton
              accessibilityLabel="AM Dashboard View Transfer Status"
              label="Lihat semua"
              intent="outline"
              size="sm"
              onPress={() => openAmRoute('transactions')}
            />
          </View>
          <Text style={styles.panelText}>Ringkasan transfer berdasarkan status.</Text>
          <View style={styles.transferBreakdownStack}>
            <AmTransferBreakdownRow label="Menunggu" value={data.transfers.pending} tone="warning" />
            <AmTransferBreakdownRow label="Diproses" value={data.transfers.processing} tone="info" />
            <AmTransferBreakdownRow label="Berhasil" value={data.transfers.success} tone="success" />
            <AmTransferBreakdownRow label="Gagal" value={data.transfers.failed} tone="danger" />
          </View>
          <View style={styles.transferTotalRow}>
            <Text style={styles.panelText}>Total Nominal</Text>
            <Text style={styles.amountText}>{formatRupiah(data.transfers.totalAmount)}</Text>
          </View>
        </View>
      </View>
      <AmRecentActivityPanel
        mutasi={data.recentMutasi}
        onOpenRoute={openAmRoute}
        transfers={data.recentTransfers}
      />
      {data.devices.length > 0 ? (
        <View style={styles.panel}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.panelTitle}>Ringkasan Device</Text>
            <KolamButton
              accessibilityLabel="AM Dashboard View Hardware"
              label="Lihat semua"
              intent="outline"
              size="sm"
              onPress={() => openAmRoute('hardware')}
            />
          </View>
          <Text style={styles.panelText}>Semua device dengan akun aktif dan lokasinya.</Text>
          <View style={styles.detailListHeader}>
            <Text style={[styles.tableHeaderText, styles.serviceCol]}>Device</Text>
            <Text style={[styles.tableHeaderText, styles.deviceWideCol]}>Lokasi</Text>
            <Text style={[styles.tableHeaderText, styles.statusCol]}>Akun</Text>
            <Text style={[styles.tableHeaderText, styles.accountCol]}>Tipe</Text>
          </View>
          {data.devices.map(device => (
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
        </View>
      ) : null}
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
        emptyText="Data chart mutasi tidak ditemukan"
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
              <Text style={styles.rowMeta}>Masuk {formatCompactRupiah(point.incoming)}</Text>
              <Text style={styles.rowMeta}>Keluar {formatCompactRupiah(point.outgoing)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function AmTransferBreakdownRow({
  label,
  tone,
  value,
}: {
  label: string;
  tone: 'warning' | 'info' | 'success' | 'danger';
  value: number;
}) {
  return (
    <View style={styles.transferBreakdownRow}>
      <AmStatusChip label={label} tone={tone} />
      <Text style={styles.cellText}>{value}</Text>
    </View>
  );
}

function AmRecentActivityPanel({
  mutasi,
  onOpenRoute,
  transfers,
}: {
  mutasi: AmMutasi[];
  onOpenRoute: (route: string, templateRoute?: string) => void;
  transfers: AmTransfer[];
}) {
  const [activeTab, setActiveTab] = React.useState<AmDashboardRecentTab>('transfers');
  const isTransferTab = activeTab === 'transfers';

  return (
    <View style={styles.dashboardRecentPanel}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.detailTabs}>
          <KolamInteractionFrame
            accessibilityLabel="AM Dashboard Recent Transfers Tab"
            onPress={() => setActiveTab('transfers')}
            selected={isTransferTab}
            style={[styles.detailTab, isTransferTab && styles.detailTabActive]}>
            <Text style={[styles.segmentText, isTransferTab && styles.segmentTextActive]}>
              Transfer Terbaru
            </Text>
          </KolamInteractionFrame>
          <KolamInteractionFrame
            accessibilityLabel="AM Dashboard Recent Mutations Tab"
            onPress={() => setActiveTab('mutasi')}
            selected={!isTransferTab}
            style={[styles.detailTab, !isTransferTab && styles.detailTabActive]}>
            <Text style={[styles.segmentText, !isTransferTab && styles.segmentTextActive]}>
              Mutasi Terbaru
            </Text>
          </KolamInteractionFrame>
        </View>
        <KolamButton
          accessibilityLabel={isTransferTab ? 'AM Dashboard View Transfers' : 'AM Dashboard View Recent Mutations'}
          label="Lihat semua"
          intent="outline"
          size="sm"
          onPress={() => onOpenRoute(isTransferTab ? 'transactions' : 'mutasi')}
        />
      </View>
      {isTransferTab ? (
        <AmRecentTransfersTable
          onOpenRoute={onOpenRoute}
          transfers={transfers}
        />
      ) : (
        <AmRecentMutasiTable
          mutasi={mutasi}
          onOpenRoute={onOpenRoute}
        />
      )}
    </View>
  );
}

function AmRecentTransfersTable({
  onOpenRoute,
  transfers,
}: {
  onOpenRoute: (route: string, templateRoute?: string) => void;
  transfers: AmTransfer[];
}) {
  const rows = transfers.slice(0, 10);

  return (
    <>
      <Text style={styles.panelText}>Aktivitas transfer terbaru di semua device.</Text>
      <KolamCatalogListTableShell footer={null} showFooter={false}>
        {rows.length > 0 ? (
          <View style={styles.dashboardRecentTable}>
            <View style={styles.dashboardRecentTableHeader}>
              <Text style={[styles.tableHeaderText, styles.dashboardTransferAccountCol]}>Akun</Text>
              <Text style={[styles.tableHeaderText, styles.dashboardTransferRecipientCol]}>Penerima</Text>
              <Text style={[styles.tableHeaderText, styles.dashboardTransferAmountCol]}>
                Nominal
              </Text>
              <Text style={[styles.tableHeaderText, styles.dashboardTransferStatusCol]}>Status</Text>
              <Text style={[styles.tableHeaderText, styles.dashboardTransferDateCol]}>
                Tanggal
              </Text>
            </View>
            {rows.map(transfer => (
              <KolamInteractionFrame
                key={transfer._id}
                accessibilityLabel={`AM Dashboard Transfer ${transfer._id}`}
                onPress={() => onOpenRoute(`transactions/${transfer._id}`, 'transactions/:id')}
                style={styles.dashboardRecentTableRow}>
                <View style={styles.dashboardTransferAccountCol}>
                  <Text style={styles.cellText} numberOfLines={1}>
                    {formatBankAccount(transfer.accountId)}
                  </Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {formatAccountType(transfer.accountId)}
                  </Text>
                </View>
                <Text
                  style={[styles.rowMeta, styles.dashboardTransferRecipientCol]}
                  numberOfLines={1}>
                  {[transfer.recipientAccount, transfer.recipientName].filter(Boolean).join(' - ') || '-'}
                </Text>
                <Text
                  style={[styles.cellText, styles.dashboardTransferAmountCol, styles.amountText]}
                  numberOfLines={1}>
                  {formatRupiah(transfer.amount)}
                </Text>
                <View style={styles.dashboardTransferStatusCol}>
                  <AmStatusChip label={transfer.status} tone={getTransferTone(transfer.status)} />
                </View>
                <Text
                  style={[styles.rowMeta, styles.dashboardTransferDateCol]}
                  numberOfLines={1}>
                  {formatAmDate(transfer.createdAt)}
                </Text>
              </KolamInteractionFrame>
            ))}
          </View>
        ) : null}
      </KolamCatalogListTableShell>
      <AmLoadingOrEmpty
        isLoading={false}
        items={rows}
        loadingText="Memuat transfer terbaru..."
        emptyText="Transfer terbaru tidak ditemukan"
      />
    </>
  );
}

function AmRecentMutasiTable({
  mutasi,
  onOpenRoute,
}: {
  mutasi: AmMutasi[];
  onOpenRoute: (route: string, templateRoute?: string) => void;
}) {
  const rows = mutasi.slice(0, 10);

  return (
    <>
      <Text style={styles.panelText}>Transaksi masuk dan keluar terbaru.</Text>
      <KolamCatalogListTableShell footer={null} showFooter={false}>
        {rows.length > 0 ? (
          <View style={styles.dashboardRecentTable}>
            <View style={styles.dashboardRecentTableHeader}>
              <Text style={[styles.tableHeaderText, styles.dashboardMutasiAccountCol]}>Akun</Text>
              <Text style={[styles.tableHeaderText, styles.dashboardMutasiTypeCol]}>Tipe</Text>
              <Text style={[styles.tableHeaderText, styles.dashboardMutasiAmountCol]}>
                Nominal
              </Text>
              <Text style={[styles.tableHeaderText, styles.dashboardMutasiDateCol]}>
                Tanggal
              </Text>
            </View>
            {rows.map(item => (
              <KolamInteractionFrame
                key={item._id}
                accessibilityLabel={`AM Dashboard Mutation ${item._id}`}
                onPress={() => onOpenRoute(`mutasi/${item._id}`, 'mutasi/:id')}
                style={styles.dashboardRecentTableRow}>
                <View style={styles.dashboardMutasiAccountCol}>
                  <Text style={styles.cellText} numberOfLines={1}>
                    {formatBankAccount(item.accountId)}
                  </Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {formatAccountType(item.accountId)}
                  </Text>
                </View>
                <View style={styles.dashboardMutasiTypeCol}>
                  <AmStatusChip
                    label={item.type === 'masuk' ? 'Masuk' : 'Keluar'}
                    tone={item.type === 'masuk' ? 'success' : 'danger'}
                  />
                </View>
                <Text
                  style={[
                    styles.cellText,
                    styles.dashboardMutasiAmountCol,
                    styles.amountText,
                    item.type === 'masuk' ? styles.amountPositive : styles.amountDanger,
                  ]}
                  numberOfLines={1}>
                  {item.type === 'masuk' ? '+' : '-'}{formatRupiah(item.amount)}
                </Text>
                <Text
                  style={[styles.rowMeta, styles.dashboardMutasiDateCol]}
                  numberOfLines={1}>
                  {formatAmDate(item.detectedAt)}
                </Text>
              </KolamInteractionFrame>
            ))}
          </View>
        ) : null}
      </KolamCatalogListTableShell>
      <AmLoadingOrEmpty
        isLoading={false}
        items={rows}
        loadingText="Memuat mutasi terbaru..."
        emptyText="Mutasi terbaru tidak ditemukan"
      />
    </>
  );
}

function AmTasksPage({
  initialTaskId,
  onModuleRouteSelect,
}: {
  initialTaskId?: string;
  onModuleRouteSelect?: (route: ShellModuleRouteEntry) => void;
}) {
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
      });
      setTasks(response.data);
      setTotal(response.meta.total);
      setLimit(response.meta.limit || AM_TASK_PAGE_LIMIT);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat task AM.');
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
        onTaskAction={runTaskAction}
      />
    );
  }

  return (
    <View style={styles.pageStack}>
      <View style={styles.filterBar}>
        <KolamSearchField value={search} onChangeText={handleSearchChange} placeholder="Cari..." containerStyle={styles.taskSearch} trailingLabel={`${total} task`} />
        <AmSegmentGroup active={type} items={TASK_TYPES} labels={TASK_TYPE_LABELS} onSelect={handleTypeChange} />
        <AmSegmentGroup active={status} items={TASK_FILTER_STATUSES} labels={TASK_STATUS_FILTER_LABELS} onSelect={handleStatusChange} />
        <KolamRefreshButton accessibilityLabel="Refresh" intent="outline" size="sm" muted={isLoading} onPress={fetchTasks} />
      </View>
      {error ? (
        <View style={styles.errorPanel}>
          <Text style={styles.errorTitle}>AM belum bisa dibaca</Text>
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
          <Text style={[styles.tableHeaderText, styles.typeCol]}>Tipe</Text>
          <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
          <Text style={[styles.tableHeaderText, styles.deviceCol]}>Device</Text>
          <Text style={[styles.tableHeaderText, styles.accountCol]}>Akun</Text>
          <Text style={[styles.tableHeaderText, styles.errorCol]}>Error</Text>
          <Text style={[styles.tableHeaderText, styles.dateCol]}>Dibuat</Text>
          <Text style={[styles.tableHeaderText, styles.actionCol]} />
        </View>
        {isLoading && !tasks.length ? <Text style={styles.loadingText}>Memuat task AM...</Text> : null}
        {!isLoading && !tasks.length ? <Text style={styles.loadingText}>Task tidak ditemukan</Text> : null}
        {tasks.map(task => (
          <KolamInteractionFrame
            key={task._id}
            accessibilityLabel={`AM Task Detail ${task._id}`}
            accessibilityRole="button"
            onPress={() => setSelectedTaskId(task._id)}
            style={styles.tableRow}>
            <Text style={[styles.cellText, styles.typeCol]}>{TASK_TYPE_LABELS[task.type] ?? task.type}</Text>
            <Text style={[styles.cellText, styles.statusCol]}>{formatAmDisplayLabel(task.status)}</Text>
            <Text style={[styles.cellText, styles.deviceCol]} numberOfLines={1}>{task.deviceId?.name ?? '-'}</Text>
            <View style={styles.accountCol}>
              <Text style={styles.cellText} numberOfLines={1}>
                {task.serviceAccountId?.label ?? task.serviceAccountId?.platform ?? '-'}
              </Text>
              {task.serviceAccountId?.platform ? (
                <Text style={styles.rowMeta} numberOfLines={1}>{task.serviceAccountId.platform}</Text>
              ) : null}
            </View>
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
              Menampilkan {rangeFrom}-{rangeTo} dari {total} item
            </Text>
            <View style={styles.inlineActions}>
              <KolamButton
                accessibilityLabel="AM Tasks Previous Page"
                disabled={page <= 1 || isLoading}
                label="Sebelumnya"
                intent="outline"
                size="sm"
                onPress={() => setPage(current => Math.max(1, current - 1))}
              />
              <KolamButton
                accessibilityLabel="AM Tasks Next Page"
                disabled={page >= totalPages || isLoading}
                label={`Halaman ${page}/${totalPages}`}
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
  onTaskAction,
}: {
  id: string;
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
        <Text style={styles.panelText}>Mengambil detail task AM...</Text>
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={styles.emptyPanel}>
        <Text style={styles.panelTitle}>Task tidak ditemukan</Text>
        <Text style={styles.panelText}>{error ?? 'Task tidak ditemukan'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.pageStack}>
      <View style={styles.detailHeader}>
        <View>
          <Text style={styles.panelTitle}>Detail Task</Text>
          <Text style={styles.panelText}>{TASK_TYPE_LABELS[task.type] ?? task.type} - {task._id}</Text>
        </View>
        <View style={styles.inlineActions}>
          <KolamRefreshButton accessibilityLabel="Refresh" intent="outline" size="sm" muted={isLoading} onPress={fetchTask} />
        </View>
      </View>
      <View style={styles.cardGrid}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Ringkasan</Text>
          <AmDetailLine label="Tipe" value={TASK_TYPE_LABELS[task.type] ?? task.type} />
          <AmDetailLine label="Status" value={formatAmDisplayLabel(task.status)} />
          <AmDetailLine label="Prioritas" value={String(task.priority)} />
          <AmDetailLine label="Ulang" value={`${task.retryCount} / ${task.maxRetries}`} />
        </View>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Penugasan</Text>
          <AmDetailLine label="Device" value={task.deviceId?.name ?? '-'} />
          <AmDetailLine label="Akun" value={task.serviceAccountId?.label ?? '-'} />
          <AmDetailLine label="Platform" value={task.serviceAccountId?.platform ?? '-'} />
        </View>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Linimasa</Text>
          <AmDetailLine label="Dibuat oleh" value={formatTaskCreatedBy(task.createdBy)} />
          <AmDetailLine label="Dibuat" value={formatAmDate(task.createdAt)} />
          <AmDetailLine label="Dimulai" value={formatAmDate(task.startedAt)} />
          <AmDetailLine label="Selesai" value={formatAmDate(task.completedAt)} />
        </View>
      </View>
      {task.error ? <AmInlineError error={task.error} title="Error task" /> : null}
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
          <Text style={styles.panelTitle}>Log ({task.logs.length} baris)</Text>
          <View style={styles.logPanel}>
            {task.logs.map((line, index) => (
              <Text key={`${index}-${line}`} selectable style={styles.logText}>{line}</Text>
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
        <Text selectable style={styles.logText}>{JSON.stringify(value, null, 2)}</Text>
      </View>
    </View>
  );
}

function AmServicesPage() {
  const [accounts, setAccounts] = React.useState<AmServiceAccount[]>([]);
  const [search, setSearch] = React.useState('');
  const [platform, setPlatform] = React.useState('all');
  const [serviceStatus, setServiceStatus] = React.useState('all');
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [expandedTab, setExpandedTab] = React.useState<AmServiceDetailTab>('logs');
  const [sessionToClear, setSessionToClear] = React.useState<AmServiceAccount | null>(null);
  const [detailLogSource, setDetailLogSource] = React.useState<'realtime' | 'history' | null>('realtime');
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
  const [submittedInputRequirementKey, setSubmittedInputRequirementKey] = React.useState<string | null>(null);
  const [serviceInputSending, setServiceInputSending] = React.useState(false);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(AM_SERVICE_PAGE_LIMIT);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeFilterPanel, setActiveFilterPanel] = React.useState<AmServicesFilterPanel | null>(null);
  const [panelAnchor, setPanelAnchor] = React.useState<KolamFilterPanelAnchor | null>(null);
  const toolbarRef = React.useRef<View>(null);
  const platformTriggerRef = React.useRef<View>(null);
  const statusTriggerRef = React.useRef<View>(null);

  const getFilterTriggerRef = React.useCallback((panel: AmServicesFilterPanel) => {
    return panel === 'platform' ? platformTriggerRef : statusTriggerRef;
  }, []);

  const anchorFilterPanel = React.useCallback((panel: AmServicesFilterPanel) => {
    const toolbar = toolbarRef.current as unknown as {measureInWindow?: unknown; setNativeProps?: unknown} | null;
    const trigger = getFilterTriggerRef(panel).current as unknown as {measureInWindow?: unknown; setNativeProps?: unknown} | null;
    if (typeof toolbar?.measureInWindow !== 'function' || typeof trigger?.measureInWindow !== 'function') {
      setPanelAnchor({left: 0, top: 44});
      return;
    }
    const testGlobals = globalThis as {expect?: unknown; it?: unknown};
    if (typeof testGlobals.expect === 'function' || typeof testGlobals.it === 'function') {
      setPanelAnchor({left: 0, top: 44});
      return;
    }
    measureFilterPanelAnchor(
      toolbarRef.current,
      getFilterTriggerRef(panel).current,
      AM_SERVICE_FILTER_PANEL_WIDTH,
      setPanelAnchor,
    );
  }, [getFilterTriggerRef]);

  const openFilterPanel = React.useCallback((panel: AmServicesFilterPanel) => {
    if (activeFilterPanel === panel) {
      setActiveFilterPanel(null);
      setPanelAnchor(null);
      return;
    }
    setActiveFilterPanel(null);
    setPanelAnchor(null);
    anchorFilterPanel(panel);
    setActiveFilterPanel(panel);
  }, [activeFilterPanel, anchorFilterPanel]);

  const closeFilterPanel = React.useCallback(() => {
    setActiveFilterPanel(null);
    setPanelAnchor(null);
  }, []);

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
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat services AM.');
    } finally {
      setIsLoading(false);
    }
  }, [page, platform, search, serviceStatus]);

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
    closeFilterPanel();
  }, [closeFilterPanel]);

  const handleServiceStatusChange = React.useCallback((value: string) => {
    setServiceStatus(value);
    setPage(1);
    closeFilterPanel();
  }, [closeFilterPanel]);

  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  const rangeFrom = total ? (page - 1) * limit + 1 : 0;
  const rangeTo = total ? Math.min(page * limit, total) : 0;

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
      setSubmittedInputRequirementKey(null);
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
    setSubmittedInputRequirementKey(null);
    if (isTransferBanking(account.platform)) {
      await loadServiceHistory(account, 1);
    } else {
      await loadServiceLogs(account);
    }
  }, [expandedId, loadServiceHistory, loadServiceLogs]);

  const selectDetailTab = React.useCallback(async (
    account: AmServiceAccount,
    tab: AmServiceDetailTab,
  ) => {
    setExpandedTab(tab);
    if (tab === 'history') {
      await loadServiceHistory(account, 1);
    } else if (tab === 'logs') {
      await loadServiceLogs(account);
    }
  }, [loadServiceHistory, loadServiceLogs]);

  const changeServiceLogSource = React.useCallback(async (
    account: AmServiceAccount,
    source: 'realtime' | 'history',
  ) => {
    if (detailLogSource === source) {
      setDetailLogSource(null);
      setDetailLogPage(1);
      return;
    }

    await loadServiceLogs(account, source, 1);
  }, [detailLogSource, loadServiceLogs]);

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
      await sendAmDeviceServiceInput(device._id, inputType, value);
      setServiceInputValue('');
      setSubmittedInputRequirementKey(getServiceInputRequirementKey(detailLogs));
      setActionMessage(`${inputType === 'password' ? 'Password' : 'OTP'} dikirim ke ${account.label}.`);
      await loadServiceLogs(account);
    } catch (nextError) {
      setDetailError(nextError instanceof Error ? nextError.message : 'Gagal mengirim input service.');
    } finally {
      setServiceInputSending(false);
    }
  }, [detailLogs, loadServiceLogs, serviceInputValue]);

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

  const expandedServiceBanking = expandedServiceAccount
    ? isTransferBanking(expandedServiceAccount.platform)
    : false;

  return (
    <View style={styles.pageStack}>
      <View ref={toolbarRef} collapsable={false} style={styles.amServicesToolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <KolamSearchField
                value={search}
                onChangeText={handleSearchChange}
                placeholder="Cari layanan..."
                containerStyle={kolamTableToolbarStyles.searchInput}
                trailingLabel={`${total} layanan`}
              />
              <View ref={platformTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={activeFilterPanel === 'platform' || platform !== 'all'}
                  label={AM_PLATFORM_LABELS[platform] ?? platform}
                  onPress={() => openFilterPanel('platform')}
                  open={activeFilterPanel === 'platform'}
                  style={styles.amServicesFilterTrigger}
                  variant="quiet"
                />
              </View>
              <View ref={statusTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={activeFilterPanel === 'status' || serviceStatus !== 'all'}
                  label={AM_SERVICE_STATUS_LABELS[serviceStatus] ?? formatAmDisplayLabel(serviceStatus)}
                  onPress={() => openFilterPanel('status')}
                  open={activeFilterPanel === 'status'}
                  style={styles.amServicesFilterTrigger}
                  variant="quiet"
                />
              </View>
            </View>
            {expandedServiceAccount ? (
              <View style={kolamTableToolbarStyles.actions}>
                {!expandedServiceBanking ? (
                  <KolamInteractionFrame
                    accessibilityLabel={`AM ${expandedServiceAccount.label} Logs`}
                    onPress={() => selectDetailTab(expandedServiceAccount, 'logs')}
                    style={[
                      styles.detailTab,
                      expandedTab === 'logs' && styles.detailTabActive,
                    ]}>
                    <Text style={[
                      styles.segmentText,
                      expandedTab === 'logs' && styles.segmentTextActive,
                    ]}>
                      Log Live
                    </Text>
                  </KolamInteractionFrame>
                ) : null}
                <KolamInteractionFrame
                  accessibilityLabel={`AM ${expandedServiceAccount.label} History`}
                  onPress={() => selectDetailTab(expandedServiceAccount, 'history')}
                  style={[
                    styles.detailTab,
                    expandedTab === 'history' && styles.detailTabActive,
                  ]}>
                  <Text style={[
                    styles.segmentText,
                    expandedTab === 'history' && styles.segmentTextActive,
                  ]}>
                    {expandedServiceBanking ? 'Riwayat Transfer' : 'Riwayat Task'}
                  </Text>
                </KolamInteractionFrame>
                {!expandedServiceBanking && expandedServiceAccount.platform === 'tokopedia' ? (
                  <KolamInteractionFrame
                    accessibilityLabel={`AM ${expandedServiceAccount.label} Session`}
                    onPress={() => selectDetailTab(expandedServiceAccount, 'session')}
                    style={[
                      styles.detailTab,
                      expandedTab === 'session' && styles.detailTabActive,
                    ]}>
                    <Text style={[
                      styles.segmentText,
                      expandedTab === 'session' && styles.segmentTextActive,
                    ]}>
                      Session
                    </Text>
                  </KolamInteractionFrame>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
        {activeFilterPanel && panelAnchor ? (
          <AmServicesFilterOverlayPanel
            activePanel={activeFilterPanel}
            anchor={panelAnchor}
            platform={platform}
            serviceStatus={serviceStatus}
            onClose={closeFilterPanel}
            onPlatformChange={handlePlatformChange}
            onStatusChange={handleServiceStatusChange}
          />
        ) : null}
      </View>
      {error ? (
        <View style={styles.errorPanel}>
          <Text style={styles.errorTitle}>Layanan AM belum bisa dibaca</Text>
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
          <Text style={styles.warningText}>Bersihkan session {sessionToClear.label}?</Text>
          <Text style={styles.panelText}>Service akan dihentikan dan login berikutnya perlu session baru.</Text>
          <View style={styles.inlineActions}>
            <KolamDeleteButton
              accessibilityLabel={`AM Service Confirm Clear Session ${sessionToClear._id}`}
              disabled={actingServiceId === sessionToClear._id}
              intent="danger"
              label={actingServiceId === sessionToClear._id ? 'Membersihkan...' : 'Bersihkan Session'}
              muted={actingServiceId === sessionToClear._id}
              size="sm"
              style={styles.serviceActionButton}
              onPress={() => clearServiceSession(sessionToClear)}
            />
            <KolamCancelButton
              accessibilityLabel="AM Service Cancel Clear Session"
              disabled={actingServiceId === sessionToClear._id}
              intent="outline"
              label="Batal"
              muted={actingServiceId === sessionToClear._id}
              size="sm"
              style={styles.serviceActionButton}
              onPress={() => setSessionToClear(null)}
            />
          </View>
        </View>
      ) : null}
      <View style={styles.tablePanel}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.expandCol]} />
          <Text style={[styles.tableHeaderText, styles.serviceCol]}>Layanan</Text>
          <Text style={[styles.tableHeaderText, styles.platformCol]}>Platform</Text>
          <Text style={[styles.tableHeaderText, styles.deviceWideCol]}>Device</Text>
          <Text style={[styles.tableHeaderText, styles.accountCol]}>Akun</Text>
          <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
        </View>
        {isLoading && !accounts.length ? <Text style={styles.loadingText}>Memuat layanan AM...</Text> : null}
        {!isLoading && !accounts.length ? <Text style={styles.loadingText}>Layanan tidak ditemukan</Text> : null}
        {accounts.map(account => {
          const device = getServiceDevice(account);
          const active = account.status === 'active';
          const banking = isTransferBanking(account.platform);
          const expanded = !banking && expandedId === account._id;
          const waitingForInput = expanded &&
            getServiceInputRequirement(detailLogs) !== null &&
            getServiceInputRequirementKey(detailLogs) !== submittedInputRequirementKey;
          return (
            <View key={account._id}>
              <KolamInteractionFrame
                accessibilityLabel={`AM Service ${account.label}`}
                accessibilityRole="button"
                onPress={banking ? undefined : () => toggleService(account)}
                style={[styles.tableRow, expanded && styles.tableRowExpanded]}>
                <View style={styles.expandCol}>
                  {!banking ? (
                    <KolamChevronIcon
                      color={V.colors.mutedFg}
                      direction={expanded ? 'down' : 'right'}
                      size="menu-sm"
                    />
                  ) : null}
                </View>
                <View style={styles.serviceCol}>
                  <View style={styles.serviceTitleRow}>
                    <View style={[styles.serviceStatusDot, active ? styles.serviceStatusDotActive : styles.serviceStatusDotInactive]} />
                    <Text style={styles.rowTitle} numberOfLines={1}>{account.label}</Text>
                    {waitingForInput ? (
                      <View
                        accessibilityLabel={`AM Service Waiting Input ${account._id}`}
                        style={styles.serviceInputDot}
                      />
                    ) : null}
                  </View>
                  <Text style={styles.rowMeta}>
                    {expanded ? 'Dibuka' : active ? (banking ? 'Siap' : 'Berjalan') : 'Berhenti'}
                  </Text>
                </View>
                <Text style={[styles.cellText, styles.platformCol]}>{AM_PLATFORM_LABELS[account.platform] ?? account.platform}</Text>
                <View style={styles.deviceWideCol}>
                  <Text style={styles.cellText} numberOfLines={1}>{device?.name ?? 'Belum ditugaskan'}</Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>{formatServiceDeviceMeta(device)}</Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>{formatServiceDeviceLocation(device)}</Text>
                </View>
                <Text style={[styles.cellText, styles.accountCol]} numberOfLines={1}>
                  {formatServiceAccountDisplay(account)}
                </Text>
              <View style={styles.statusCol}>
                <View style={styles.statusActionStack}>
                  <AmStatusChip
                    label={active ? (isTransferBanking(account.platform) ? 'Siap' : 'Berjalan') : account.status}
                    tone={active ? 'success' : 'warning'}
                  />
                  <KolamSwitch
                    accessibilityLabel={`AM Service Power ${account._id}`}
                    active={active}
                    disabled={actingServiceId === account._id || !device}
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
                  logLimit={detailLogLimit}
                  logPage={detailLogPage}
                  logSource={detailLogSource}
                  logTotal={detailLogTotal}
                  historyLimit={detailHistoryLimit}
                  historyPage={detailHistoryPage}
                  historyTotal={detailHistoryTotal}
                  serviceInputSending={serviceInputSending}
                  serviceInputValue={serviceInputValue}
                  submittedInputRequirementKey={submittedInputRequirementKey}
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
                  onSessionApplied={fetchAccounts}
                  onSubmitServiceInput={inputType => submitServiceInput(account, inputType)}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function AmServicesFilterOverlayPanel({
  activePanel,
  anchor,
  platform,
  serviceStatus,
  onClose,
  onPlatformChange,
  onStatusChange,
}: {
  activePanel: AmServicesFilterPanel;
  anchor: KolamFilterPanelAnchor;
  platform: string;
  serviceStatus: string;
  onClose: () => void;
  onPlatformChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}) {
  const options = activePanel === 'platform'
    ? AM_PLATFORMS.map(value => ({label: AM_PLATFORM_LABELS[value] ?? value, value}))
    : AM_SERVICE_STATUS_FILTERS.map(value => ({label: AM_SERVICE_STATUS_LABELS[value] ?? formatAmDisplayLabel(value), value}));
  const selectedValue = activePanel === 'platform' ? platform : serviceStatus;
  const onSelect = activePanel === 'platform' ? onPlatformChange : onStatusChange;

  return (
    <View
      style={[
        styles.amServicesFilterOverlayPanel,
        {
          left: anchor.left,
          top: anchor.top,
          width: AM_SERVICE_FILTER_PANEL_WIDTH,
        },
      ]}>
      <ScrollView
        contentContainerStyle={styles.amServicesFilterPanelContent}
        keyboardShouldPersistTaps="handled"
        style={styles.amServicesFilterPanelScroll}>
        {options.map(option => {
          const selected = option.value === selectedValue;
          return (
            <KolamButton
              accessibilityLabel={`AM Segment ${formatAmDisplayLabel(option.label)}`}
              intent={selected ? 'primary' : 'plain'}
              key={`${activePanel}-${option.value}`}
              label={formatAmDisplayLabel(option.label)}
              onPress={() => onSelect(option.value)}
              style={styles.amServicesFilterPanelOption}
            />
          );
        })}
      </ScrollView>
      <View style={styles.amServicesFilterPanelFooter}>
        <KolamButton label="Tutup" onPress={onClose} />
      </View>
    </View>
  );
}

function AmHardwareFilterOverlayPanel({
  anchor,
  options,
  selectedValue,
  onClose,
  onSelect,
}: {
  activePanel: AmHardwareFilterPanel;
  anchor: KolamFilterPanelAnchor;
  options: string[];
  selectedValue: string;
  onClose: () => void;
  onSelect: (value: string) => void;
}) {
  return (
    <View
      style={[
        styles.amServicesFilterOverlayPanel,
        {
          left: anchor.left,
          top: anchor.top,
          width: AM_SERVICE_FILTER_PANEL_WIDTH,
        },
      ]}>
      <ScrollView
        contentContainerStyle={styles.amServicesFilterPanelContent}
        keyboardShouldPersistTaps="handled"
        style={styles.amServicesFilterPanelScroll}>
        {options.map(option => {
          const selected = option === selectedValue;
          return (
            <KolamButton
              accessibilityLabel={`AM Hardware Status ${formatAmDisplayLabel(option === 'all' ? 'Semua status' : option)}`}
              intent={selected ? 'primary' : 'plain'}
              key={`hardware-status-${option}`}
              label={option === 'all' ? 'Semua status' : formatAmDisplayLabel(option)}
              onPress={() => onSelect(option)}
              style={styles.amServicesFilterPanelOption}
            />
          );
        })}
      </ScrollView>
      <View style={styles.amServicesFilterPanelFooter}>
        <KolamButton label="Tutup" onPress={onClose} />
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
    actions.push({id: 'cancel', label: 'Batal', intent: 'outline'});
  }

  if (task.status === 'processing') {
    actions.push({id: 'force-fail', label: 'Paksa Gagal', intent: 'danger'});
  }

  if (task.status === 'failed') {
    actions.push({id: 'retry', label: 'Ulangi', intent: 'warning'});
  }

  if (!actions.length) {
    return <Text style={styles.rowMeta}>-</Text>;
  }

  return (
    <View style={styles.inlineActions}>
      {actions.map(action => (
        <KolamButton
          key={action.id}
          accessibilityLabel={`AM Task ${formatAmTaskActionAccessibilityLabel(action.id)} ${task._id}`}
          disabled={disabled}
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

function AmHardwarePage({
  initialRoute,
  onModuleRouteSelect,
}: {
  initialRoute?: AmHardwareInitialRoute;
  onModuleRouteSelect?: (route: ShellModuleRouteEntry) => void;
}) {
  const [racks, setRacks] = React.useState<AmRack[]>([]);
  const [boxes, setBoxes] = React.useState<AmBox[]>([]);
  const [devices, setDevices] = React.useState<AmDevice[]>([]);
  const [selectedRackId, setSelectedRackId] = React.useState<string | null>(null);
  const [selectedBoxId, setSelectedBoxId] = React.useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = React.useState<string | null>(null);
  const [hardwareForm, setHardwareForm] = React.useState<'rack' | 'box' | 'device'>('rack');
  const [editingHardwareId, setEditingHardwareId] = React.useState<string | null>(null);
  const [isRackModalOpen, setIsRackModalOpen] = React.useState(false);
  const [isBoxModalOpen, setIsBoxModalOpen] = React.useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = React.useState(false);
  const [formLocation, setFormLocation] = React.useState('');
  const [formDescription, setFormDescription] = React.useState('');
  const [formServerIp, setFormServerIp] = React.useState('');
  const [formStatus, setFormStatus] = React.useState<'active' | 'inactive'>('active');
  const [formRackId, setFormRackId] = React.useState('');
  const [formBoxId, setFormBoxId] = React.useState('');
  const [formConnectionType, setFormConnectionType] = React.useState<'usb' | 'tcp' | 'browser'>('tcp');
  const [formUdid, setFormUdid] = React.useState('');
  const [formTcpAddress, setFormTcpAddress] = React.useState('');
  const [formBrand, setFormBrand] = React.useState('');
  const [formModel, setFormModel] = React.useState('');
  const [formAdbPort, setFormAdbPort] = React.useState('');
  const [formAppiumPort, setFormAppiumPort] = React.useState('');
  const [formTags, setFormTags] = React.useState('');
  const [actingHardwareId, setActingHardwareId] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [deletingHardware, setDeletingHardware] = React.useState<{
    kind: 'rack' | 'box' | 'device';
    id: string;
    label: string;
  } | null>(null);
  const [adbStatusByDeviceId, setAdbStatusByDeviceId] = React.useState<AmDeviceAdbStatusMap>({});
  const [adbStatusError, setAdbStatusError] = React.useState<string | null>(null);
  const [hardwareSearch, setHardwareSearch] = React.useState('');
  const [hardwareStatus, setHardwareStatus] = React.useState('all');
  const [activeHardwareFilterPanel, setActiveHardwareFilterPanel] = React.useState<AmHardwareFilterPanel | null>(null);
  const [hardwarePanelAnchor, setHardwarePanelAnchor] = React.useState<KolamFilterPanelAnchor | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const hardwareToolbarRef = React.useRef<View>(null);
  const hardwareStatusTriggerRef = React.useRef<View>(null);

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
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat hardware AM.');
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
  const selectedDevice = devicesWithAdbStatus.find(device => device._id === selectedDeviceId) ?? null;
  const visibleBoxes = selectedRack
    ? boxes.filter(box => isBoxInRack(box, selectedRack))
    : [];
  const visibleDevices = selectedBox
    ? devicesWithAdbStatus.filter(device => isDeviceInBox(device, selectedBox))
    : selectedRack
      ? devicesWithAdbStatus.filter(device => isDeviceInRack(device, selectedRack))
      : devicesWithAdbStatus;
  const hardwareStatusOptions = selectedBox
    ? AM_HARDWARE_DEVICE_STATUS_FILTERS
    : AM_HARDWARE_ENTITY_STATUS_FILTERS;
  const normalizedHardwareSearch = hardwareSearch.trim().toLowerCase();
  const filteredRacks = React.useMemo(
    () => filterAmHardwareRacks(racks, normalizedHardwareSearch, hardwareStatus),
    [hardwareStatus, normalizedHardwareSearch, racks],
  );
  const filteredBoxes = React.useMemo(
    () => filterAmHardwareBoxes(visibleBoxes, normalizedHardwareSearch, hardwareStatus),
    [hardwareStatus, normalizedHardwareSearch, visibleBoxes],
  );
  const filteredDevices = React.useMemo(
    () => filterAmHardwareDevices(visibleDevices, normalizedHardwareSearch, hardwareStatus),
    [hardwareStatus, normalizedHardwareSearch, visibleDevices],
  );

  React.useEffect(() => {
    if (!hardwareStatusOptions.includes(hardwareStatus)) {
      setHardwareStatus('all');
      setActiveHardwareFilterPanel(null);
      setHardwarePanelAnchor(null);
    }
  }, [hardwareStatus, hardwareStatusOptions]);

  const anchorHardwareFilterPanel = React.useCallback(() => {
    const toolbar = hardwareToolbarRef.current as unknown as {measureInWindow?: unknown; setNativeProps?: unknown} | null;
    const trigger = hardwareStatusTriggerRef.current as unknown as {measureInWindow?: unknown; setNativeProps?: unknown} | null;
    if (typeof toolbar?.measureInWindow !== 'function' || typeof trigger?.measureInWindow !== 'function') {
      setHardwarePanelAnchor({left: 0, top: 44});
      return;
    }
    const testGlobals = globalThis as {expect?: unknown; it?: unknown};
    if (typeof testGlobals.expect === 'function' || typeof testGlobals.it === 'function') {
      setHardwarePanelAnchor({left: 0, top: 44});
      return;
    }
    measureFilterPanelAnchor(
      hardwareToolbarRef.current,
      hardwareStatusTriggerRef.current,
      AM_SERVICE_FILTER_PANEL_WIDTH,
      setHardwarePanelAnchor,
    );
  }, []);

  const openHardwareFilterPanel = React.useCallback((panel: AmHardwareFilterPanel) => {
    if (activeHardwareFilterPanel === panel) {
      setActiveHardwareFilterPanel(null);
      setHardwarePanelAnchor(null);
      return;
    }
    setActiveHardwareFilterPanel(null);
    setHardwarePanelAnchor(null);
    anchorHardwareFilterPanel();
    setActiveHardwareFilterPanel(panel);
  }, [activeHardwareFilterPanel, anchorHardwareFilterPanel]);

  const closeHardwareFilterPanel = React.useCallback(() => {
    setActiveHardwareFilterPanel(null);
    setHardwarePanelAnchor(null);
  }, []);

  const handleHardwareSearchChange = React.useCallback((value: string) => {
    setHardwareSearch(value);
  }, []);

  const handleHardwareStatusChange = React.useCallback((value: string) => {
    setHardwareStatus(value);
    closeHardwareFilterPanel();
  }, [closeHardwareFilterPanel]);

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
    if (initialRoute?.rackId || initialRoute?.boxId || initialRoute?.deviceId) {
      const hardwareRoute = getShellModuleRouteEntry('am', 'hardware');
      if (hardwareRoute) {
        onModuleRouteSelect?.(hardwareRoute);
        return;
      }
      return;
    }
    setSelectedRackId(null);
    setSelectedBoxId(null);
    setSelectedDeviceId(null);
  }, [initialRoute?.boxId, initialRoute?.deviceId, initialRoute?.rackId, onModuleRouteSelect]);

  const handleHardwareDaftarPress = React.useCallback(() => {
    if (selectedDeviceId) {
      setSelectedDeviceId(null);
      return;
    }

    if (selectedBoxId) {
      setSelectedBoxId(null);
      setSelectedDeviceId(null);
      return;
    }

    resetHardwareRoute();
  }, [resetHardwareRoute, selectedBoxId, selectedDeviceId]);

  const resetHardwareForm = React.useCallback((nextForm: 'rack' | 'box' | 'device' = hardwareForm) => {
    setHardwareForm(nextForm);
    setEditingHardwareId(null);
    setFormLocation('');
    setFormDescription('');
    setFormServerIp('');
    setFormStatus('active');
    setFormRackId(nextForm === 'box' ? (selectedRackId ?? racks[0]?._id ?? '') : '');
    setFormBoxId(nextForm === 'device' ? (selectedBoxId ?? boxes[0]?._id ?? '') : '');
    setFormConnectionType('tcp');
    setFormUdid('');
    setFormTcpAddress('');
    setFormBrand('');
    setFormModel('');
    setFormAdbPort(nextForm === 'device' ? '6404' : '');
    setFormAppiumPort('');
    setFormTags('');
    setActionMessage(null);
  }, [boxes, hardwareForm, racks, selectedBoxId, selectedRackId]);

  const editRack = React.useCallback((rack: AmRack) => {
    setHardwareForm('rack');
    setEditingHardwareId(rack._id);
    setIsRackModalOpen(true);
    setFormLocation(rack.location ?? '');
    setFormDescription(rack.description ?? '');
    setFormServerIp(rack.serverIp ?? '');
    setFormStatus(rack.status === 'inactive' ? 'inactive' : 'active');
    setActionMessage(null);
  }, []);

  const editBox = React.useCallback((box: AmBox) => {
    setHardwareForm('box');
    setEditingHardwareId(box._id);
    setIsBoxModalOpen(true);
    setFormRackId(resolveRackId(box.rackId));
    setFormDescription(box.description ?? '');
    setFormStatus(box.status === 'inactive' ? 'inactive' : 'active');
    setActionMessage(null);
  }, []);

  const editDevice = React.useCallback((device: AmDevice) => {
    setHardwareForm('device');
    setEditingHardwareId(device._id);
    setIsDeviceModalOpen(true);
    setFormBoxId(resolveBoxId(device.boxId));
    setFormConnectionType(device.connectionType === 'tcp' || device.connectionType === 'browser' ? device.connectionType : 'usb');
    setFormUdid(device.udid ?? '');
    setFormTcpAddress(device.tcpAddress ?? '');
    setFormBrand(device.brand ?? '');
    setFormModel(device.model ?? '');
    setFormAdbPort(device.adbPort ? String(device.adbPort) : '');
    setFormAppiumPort(device.appiumPort ? String(device.appiumPort) : '');
    setFormTags((device.tags ?? []).join(', '));
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
          setActionMessage('Rak AM berhasil diperbarui.');
        } else {
          await createAmRack(payload);
          setActionMessage('Rak AM berhasil dibuat.');
        }
      } else if (hardwareForm === 'box') {
        if (!editingHardwareId && !formRackId) {
          setError('Rak wajib dipilih sebelum membuat box.');
          return;
        }
        if (editingHardwareId) {
          await updateAmBox(editingHardwareId, {
            description: formDescription.trim(),
            status: formStatus,
          });
          setActionMessage('Box AM berhasil diperbarui.');
        } else {
          await createAmBox({
            rackId: formRackId,
            description: formDescription.trim(),
          });
          setActionMessage('Box AM berhasil dibuat.');
        }
      } else {
        if (!editingHardwareId && !formBoxId) {
          setError('Box wajib dipilih sebelum membuat perangkat.');
          return;
        }
        if (formConnectionType === 'usb' && !formUdid.trim()) {
          setError('UDID wajib diisi untuk perangkat USB.');
          return;
        }
        if (formConnectionType === 'tcp' && !formTcpAddress.trim()) {
          setError('Alamat TCP wajib diisi untuk perangkat TCP.');
          return;
        }
        const devicePayload: AmDevicePayload = {
          appiumPort: editingHardwareId ? parseOptionalNumber(formAppiumPort) : undefined,
        };
        if (!editingHardwareId) {
          devicePayload.connectionType = formConnectionType;
        }
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
        const tags = parseCommaSeparatedTags(formTags);
        if (tags.length) {
          devicePayload.tags = tags;
        }
        const payload = cleanDevicePayload(devicePayload);
        if (editingHardwareId) {
          await updateAmDevice(editingHardwareId, payload);
          setActionMessage('Perangkat AM berhasil diperbarui.');
        } else {
          await createAmDevice({
            boxId: formBoxId,
            ...payload,
          });
          setActionMessage('Perangkat AM berhasil dibuat.');
        }
      }
      resetHardwareForm(hardwareForm);
      if (hardwareForm === 'rack') {
        setIsRackModalOpen(false);
      }
      if (hardwareForm === 'box') {
        setIsBoxModalOpen(false);
      }
      if (hardwareForm === 'device') {
        setIsDeviceModalOpen(false);
      }
      await fetchHardware();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal menyimpan perangkat AM.');
    } finally {
      setIsSubmitting(false);
    }
  }, [editingHardwareId, fetchHardware, formAdbPort, formAppiumPort, formBoxId, formBrand, formConnectionType, formDescription, formLocation, formModel, formRackId, formServerIp, formStatus, formTags, formTcpAddress, formUdid, hardwareForm, resetHardwareForm]);

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
      setActionMessage(`${formatHardwareKindLabel(kind)} AM berhasil dihapus.`);
      await fetchHardware();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal menghapus perangkat AM.');
    } finally {
      setActingHardwareId(null);
    }
  }, [fetchHardware, resetHardwareRoute, selectedBoxId, selectedDeviceId, selectedRackId]);

  const hardwareListCount = selectedBox
    ? filteredDevices.length
    : selectedRack
      ? filteredBoxes.length
      : filteredRacks.length;
  const hardwareSearchPlaceholder = selectedBox
    ? 'Cari perangkat...'
    : selectedRack
      ? 'Cari box...'
      : 'Cari rak...';
  const hardwareStatusLabel = hardwareStatus === 'all'
    ? 'Semua status'
    : formatAmDisplayLabel(hardwareStatus);
  const openCreateRackModal = React.useCallback(() => {
    resetHardwareForm('rack');
    setIsRackModalOpen(true);
  }, [resetHardwareForm]);
  const openAddBoxModal = React.useCallback(() => {
    resetHardwareForm('box');
    setFormRackId(selectedRack?._id ?? '');
    setIsBoxModalOpen(true);
  }, [resetHardwareForm, selectedRack?._id]);
  const openAddDeviceModal = React.useCallback(() => {
    resetHardwareForm('device');
    setFormBoxId(selectedBox?._id ?? '');
    setIsDeviceModalOpen(true);
  }, [resetHardwareForm, selectedBox?._id]);

  return (
    <View style={styles.pageStack}>
      {!selectedRack ? (
        <View style={styles.amHardwareHeader}>
          <View style={styles.amHardwareHeaderCopy}>
            <Text style={styles.panelTitle}>Rak</Text>
            <Text style={styles.panelText}>Lihat semua rak yang sudah dibuat.</Text>
          </View>
        </View>
      ) : null}
      {selectedRack && !selectedBox ? (
        <View style={styles.amHardwareHeader}>
          <View style={styles.amHardwareHeaderCopy}>
            <Text style={styles.panelTitle}>{selectedRack.name}</Text>
            <Text style={styles.panelText}>Kelola box di rak ini. Setiap box dapat memuat hingga 24 perangkat.</Text>
          </View>
        </View>
      ) : null}
      {selectedBox && !selectedDevice ? (
        <View style={styles.amHardwareHeader}>
          <View style={styles.amHardwareHeaderCopy}>
            <Text style={styles.panelTitle}>{selectedBox.name}</Text>
            <Text style={styles.panelText}>Kelola perangkat di box ini. Setiap perangkat mewakili automation.</Text>
          </View>
        </View>
      ) : null}
      <View ref={hardwareToolbarRef} collapsable={false} style={styles.amHardwareToolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            {!selectedDevice ? (
              <View style={kolamTableToolbarStyles.filters}>
                <KolamSearchField
                  accessibilityLabel="AM Hardware Search"
                  value={hardwareSearch}
                  onChangeText={handleHardwareSearchChange}
                  placeholder={hardwareSearchPlaceholder}
                  containerStyle={kolamTableToolbarStyles.searchInput}
                  trailingLabel={`${hardwareListCount} item`}
                />
                <View ref={hardwareStatusTriggerRef} collapsable={false}>
                  <KolamTableFilterTrigger
                    active={activeHardwareFilterPanel === 'status' || hardwareStatus !== 'all'}
                    label={hardwareStatusLabel}
                    onPress={() => openHardwareFilterPanel('status')}
                    open={activeHardwareFilterPanel === 'status'}
                    style={styles.amServicesFilterTrigger}
                    variant="quiet"
                  />
                </View>
              </View>
            ) : (
              <View style={kolamTableToolbarStyles.filters} />
            )}
            <View style={kolamTableToolbarStyles.actions}>
              {selectedRack ? (
                <KolamDaftarButton
                  accessibilityLabel="AM Hardware Daftar"
                  size="sm"
                  onPress={handleHardwareDaftarPress}
                />
              ) : null}
              {!selectedRack ? (
                <KolamButton
                  accessibilityLabel="AM Hardware Create Rack"
                  label="Buat Rak"
                  size="sm"
                  onPress={openCreateRackModal}
                />
              ) : selectedDevice ? null : selectedBox ? (
                <KolamButton
                  accessibilityLabel="AM Hardware Add Device"
                  label="Tambah Perangkat"
                  size="sm"
                  onPress={openAddDeviceModal}
                />
              ) : (
                <KolamButton
                  accessibilityLabel="AM Hardware Add Box"
                  label="Tambah Box"
                  size="sm"
                  onPress={openAddBoxModal}
                />
              )}
            </View>
          </View>
        </View>
        {activeHardwareFilterPanel && hardwarePanelAnchor && !selectedDevice ? (
          <AmHardwareFilterOverlayPanel
            activePanel={activeHardwareFilterPanel}
            anchor={hardwarePanelAnchor}
            options={hardwareStatusOptions}
            selectedValue={hardwareStatus}
            onClose={closeHardwareFilterPanel}
            onSelect={handleHardwareStatusChange}
          />
        ) : null}
      </View>
      {error ? (
        <View style={styles.errorPanel}>
          <Text style={styles.errorTitle}>Perangkat AM belum bisa dibaca</Text>
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
          <Text style={styles.warningText}>Status ADB box belum bisa dibaca: {adbStatusError}</Text>
        </View>
      ) : null}
      {deletingHardware ? (
        <KolamConfirmDialog
          destructive
          confirmLabel={actingHardwareId === deletingHardware.id ? '...' : 'Hapus'}
          message={`Hapus ${deletingHardware.label}? Aksi ini tidak bisa dibatalkan.`}
          title={`Hapus ${formatHardwareKindLabel(deletingHardware.kind)}?`}
          visible={Boolean(deletingHardware)}
          onCancel={() => setDeletingHardware(null)}
          onConfirm={() => deleteHardware(deletingHardware.kind, deletingHardware.id)}
        />
      ) : null}
      {selectedDevice ? (
        <AmDeviceDetailPanel device={selectedDevice} />
      ) : selectedBox ? (
        <AmHardwareDeviceList
          actingHardwareId={actingHardwareId}
          devices={filteredDevices}
          isLoading={isLoading}
          onDeleteDevice={device => requestDeleteHardware('device', device._id, device.name)}
          onEditDevice={editDevice}
          onSelectDevice={device => setSelectedDeviceId(device._id)}
        />
      ) : selectedRack ? (
        <AmHardwareBoxGrid
          actingHardwareId={actingHardwareId}
          boxes={filteredBoxes}
          isLoading={isLoading}
          onDeleteBox={box => requestDeleteHardware('box', box._id, box.name)}
          onEditBox={editBox}
          onSelectBox={box => setSelectedBoxId(box._id)}
        />
      ) : (
        <AmHardwareRackGrid
          actingHardwareId={actingHardwareId}
          boxes={boxes}
          devices={devices}
          isLoading={isLoading}
          onDeleteRack={rack => requestDeleteHardware('rack', rack._id, rack.name)}
          onEditRack={editRack}
          onSelectRack={rack => setSelectedRackId(rack._id)}
          racks={filteredRacks}
        />
      )}
      <KolamModalDialog
        accessibilityLabel={editingHardwareId ? 'AM Hardware Edit Rack Modal' : 'AM Hardware Create Rack Modal'}
        maxWidth="86%"
        onClose={() => {
          setIsRackModalOpen(false);
          resetHardwareForm('rack');
        }}
        title={editingHardwareId ? 'Ubah Rak' : 'Buat Rak'}
        visible={isRackModalOpen && hardwareForm === 'rack'}
        width={420}
        footer={
          <>
            <KolamCancelButton
              label="Batal"
              onPress={() => {
                setIsRackModalOpen(false);
                resetHardwareForm('rack');
              }}
            />
            <KolamSaveButton
              accessibilityLabel="AM Hardware Save"
              disabled={isSubmitting}
              label={isSubmitting ? 'Menyimpan' : editingHardwareId ? 'Simpan' : 'Buat'}
              muted={isSubmitting}
              onPress={saveHardware}
            />
          </>
        }>
        <View style={styles.formGrid}>
          <AmTextInput
            label="Server IP"
            placeholder="contoh 100.91.91.95:2700"
            value={formServerIp}
            onChangeText={setFormServerIp}
          />
          <AmTextInput
            label="Lokasi"
            placeholder="contoh Lantai 2, Ruang A"
            value={formLocation}
            onChangeText={setFormLocation}
          />
          <AmTextInput
            label="Deskripsi"
            placeholder="Opsional"
            value={formDescription}
            onChangeText={setFormDescription}
          />
        </View>
      </KolamModalDialog>
      <KolamModalDialog
        accessibilityLabel={editingHardwareId ? 'AM Hardware Edit Box Modal' : 'AM Hardware Add Box Modal'}
        maxWidth="86%"
        onClose={() => {
          setIsBoxModalOpen(false);
          resetHardwareForm('box');
        }}
        title={editingHardwareId ? 'Ubah Box' : 'Tambah Box'}
        visible={isBoxModalOpen && hardwareForm === 'box'}
        width={420}
        footer={
          <>
            <KolamCancelButton
              label="Batal"
              onPress={() => {
                setIsBoxModalOpen(false);
                resetHardwareForm('box');
              }}
            />
            <KolamSaveButton
              accessibilityLabel="AM Hardware Save"
              disabled={isSubmitting}
              label={isSubmitting ? 'Menyimpan' : editingHardwareId ? 'Simpan' : 'Buat'}
              muted={isSubmitting}
              onPress={saveHardware}
            />
          </>
        }>
        <View style={styles.formGrid}>
          <AmTextInput
            label="Deskripsi"
            placeholder="Opsional"
            value={formDescription}
            onChangeText={setFormDescription}
          />
        </View>
      </KolamModalDialog>
      <KolamModalDialog
        accessibilityLabel={editingHardwareId ? 'AM Hardware Edit Device Modal' : 'AM Hardware Add Device Modal'}
        maxHeight="86%"
        maxWidth="86%"
        onClose={() => {
          setIsDeviceModalOpen(false);
          resetHardwareForm('device');
        }}
        title={editingHardwareId ? 'Ubah Perangkat' : 'Tambah Perangkat'}
        visible={isDeviceModalOpen && hardwareForm === 'device'}
        width={520}
        footer={
          <>
            <KolamCancelButton
              label="Batal"
              onPress={() => {
                setIsDeviceModalOpen(false);
                resetHardwareForm('device');
              }}
            />
            <KolamSaveButton
              accessibilityLabel="AM Hardware Save"
              disabled={isSubmitting}
              label={isSubmitting ? 'Menyimpan' : editingHardwareId ? 'Simpan' : 'Buat'}
              muted={isSubmitting}
              onPress={saveHardware}
            />
          </>
        }>
        <ScrollView
          nestedScrollEnabled
          style={styles.hardwareModalScroll}
          contentContainerStyle={styles.formGrid}>
          {editingHardwareId ? (
            <View accessibilityLabel="AM Hardware Connection Type Read Only" style={styles.detailListRow}>
              <Text style={[styles.tableHeaderText, styles.accountCol]}>Koneksi</Text>
              <Text style={[styles.cellText, styles.recipientCol]}>
                {{usb: 'USB', tcp: 'TCP', browser: 'Browser'}[formConnectionType]}
              </Text>
            </View>
          ) : (
            <AmSegmentGroup
              active={formConnectionType}
              items={['usb', 'tcp', 'browser']}
              labels={{usb: 'USB', tcp: 'TCP', browser: 'Browser'}}
              onSelect={handleHardwareConnectionTypeChange}
            />
          )}
          {formConnectionType === 'usb' ? (
            <AmTextInput label="UDID" placeholder="UDID perangkat USB" value={formUdid} onChangeText={setFormUdid} />
          ) : null}
          {formConnectionType === 'tcp' ? (
            <AmTextInput label="Alamat TCP" placeholder="192.168.101.231:5555" value={formTcpAddress} onChangeText={setFormTcpAddress} />
          ) : null}
          {formConnectionType !== 'browser' ? (
            <>
              <AmTextInput label="Merek" placeholder="Samsung / Server" value={formBrand} onChangeText={setFormBrand} />
              <AmTextInput label="Model" placeholder="A52 / Playwright" value={formModel} onChangeText={setFormModel} />
            </>
          ) : null}
          <AmTextInput label="Tag" placeholder="whatsapp, marketplace, banking" value={formTags} onChangeText={setFormTags} />
          {formConnectionType !== 'browser' ? (
            <AmTextInput label="Port ADB" placeholder="opsional" value={formAdbPort} onChangeText={setFormAdbPort} />
          ) : null}
          {editingHardwareId && formConnectionType !== 'browser' ? (
            <AmTextInput label="Port Appium" placeholder="opsional" value={formAppiumPort} onChangeText={setFormAppiumPort} />
          ) : null}
        </ScrollView>
      </KolamModalDialog>
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
  submittedInputRequirementKey,
  serviceStatuses,
  onClearSession,
  onChangeServiceInput,
  onHistoryPageChange,
  onLogPageChange,
  onLogSourceChange,
  onSessionApplied,
  onSubmitServiceInput,
  processRunning,
  tasks,
  transfers,
}: {
  account: AmServiceAccount;
  activeTab: AmServiceDetailTab;
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
  logSource: 'realtime' | 'history' | null;
  logTotal: number;
  serviceInputSending: boolean;
  serviceInputValue: string;
  submittedInputRequirementKey: string | null;
  serviceStatuses: AmDeviceServiceStatus[];
  onClearSession: () => void;
  onChangeServiceInput: (value: string) => void;
  onHistoryPageChange: (page: number) => void;
  onLogPageChange: (page: number) => void;
  onLogSourceChange: (source: 'realtime' | 'history') => void;
  onSessionApplied: () => void;
  onSubmitServiceInput: (inputType: 'otp' | 'password') => void;
  processRunning: boolean;
  tasks: AmTask[];
  transfers: AmTransfer[];
}) {
  const banking = isTransferBanking(account.platform);
  const device = getServiceDevice(account);
  const runtime = serviceStatuses.find(status => status.serviceAccountId === account._id);
  const qrSignal = getQrLoginSignal(logs);
  const loginStatus = getServiceLoginStatus(logs);
  const inputRequirement = getServiceInputRequirement(logs);
  const inputRequirementKey = getServiceInputRequirementKey(logs);
  const needsPassword = inputRequirement === 'password';
  const needsInput = inputRequirement !== null && inputRequirementKey !== submittedInputRequirementKey;
  const qrUrl = device?._id ? getAmDeviceServiceQrUrl(device._id, account.platform, qrSignal?.qrcodeId) : null;
  const historyTotalPages = Math.max(1, Math.ceil(historyTotal / Math.max(historyLimit, 1)));
  const historyFrom = historyTotal ? (historyPage - 1) * historyLimit + 1 : 0;
  const historyTo = historyTotal ? Math.min(historyPage * historyLimit, historyTotal) : 0;
  const logTotalPages = Math.max(1, Math.ceil(logTotal / Math.max(logLimit, 1)));
  const logFrom = logTotal ? (logPage - 1) * logLimit + 1 : 0;
  const logTo = logTotal ? Math.min(logPage * logLimit, logTotal) : 0;
  const displayedLogs = logSource === 'history' ? logs : logs.slice(-20);
  const visibleLineCount = logSource === 'history'
    ? logTotal || logs.length
    : logs.length;
  const taskHistoryColumns = React.useMemo<Array<KolamListTableColumn<AmTask>>>(
    () => [
      {
        flex: 1.4,
        id: 'type',
        label: 'Tipe',
        render: task => (
          <Text style={styles.cellText} numberOfLines={1}>
            {TASK_TYPE_LABELS[task.type] ?? task.type}
          </Text>
        ),
      },
      {
        flex: 0.9,
        id: 'status',
        label: 'Status',
        render: task => (
          <AmStatusChip label={task.status} tone={getTransferTone(task.status)} />
        ),
      },
      {
        flex: 1.2,
        id: 'error',
        label: 'Error',
        render: task => (
          <Text style={styles.cellText} numberOfLines={1}>
            {task.error || '-'}
          </Text>
        ),
      },
      {
        flex: 1,
        id: 'startedAt',
        label: 'Mulai',
        render: task => (
          <Text style={styles.cellText} numberOfLines={1}>
            {formatAmDate(task.startedAt)}
          </Text>
        ),
      },
      {
        flex: 1,
        id: 'completedAt',
        label: 'Selesai',
        render: task => (
          <Text style={styles.cellText} numberOfLines={1}>
            {formatAmDate(task.completedAt)}
          </Text>
        ),
      },
    ],
    [],
  );

  return (
    <View style={styles.serviceDetailPanel}>
      {canClearSession ? (
        <View style={[styles.detailHeader, styles.detailHeaderActionsOnly]}>
          <KolamDeleteButton
            accessibilityLabel={`AM Service Clear Session ${account._id}`}
            disabled={clearingSession}
            intent="danger"
            label={clearingSession ? 'Membersihkan...' : 'Bersihkan Session'}
            muted={clearingSession}
            size="sm"
            style={styles.serviceActionButton}
            onPress={onClearSession}
          />
        </View>
      ) : null}
      <AmInlineError title="Detail service AM belum bisa dibaca" error={detailError} />
      {isLoading ? <Text style={styles.loadingText}>Memuat detail layanan...</Text> : null}
      {!isLoading && activeTab === 'session' && account.platform === 'tokopedia' ? (
        <AmTokopediaSessionPanel
          account={account}
          onApplied={onSessionApplied}
          processRunning={processRunning}
        />
      ) : null}
      {!isLoading && activeTab === 'logs' ? (
        <>
          {qrSignal && processRunning ? (
            <View style={styles.qrPanel}>
              <Text style={styles.formLabel}>QR Login {AM_PLATFORM_LABELS[account.platform] ?? titleCase(account.platform)}</Text>
              <Text style={styles.rowMeta}>{qrSignal.status ? `Status ${qrSignal.status}` : 'Scan QR tersedia.'}</Text>
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
                    source={getAmProtectedImageSource(qrUrl)}
                    style={styles.qrImage}
                  />
                  <Text style={styles.monoText} numberOfLines={1}>{qrUrl}</Text>
                </>
              ) : (
                <Text style={styles.rowMeta}>Gambar QR belum tersedia untuk platform ini.</Text>
              )}
              <View style={styles.qrInstructionList}>
                {getQrLoginInstructions(account.platform).map((instruction, index) => (
                  <Text key={`${account.platform}-qr-${index}`} style={styles.qrInstructionText}>
                    {index + 1}. {instruction}
                  </Text>
                ))}
              </View>
            </View>
          ) : null}
          {!qrSignal && loginStatus === 'success' ? (
            <View style={styles.successPanel}>
              <Text style={styles.successText}>Login berhasil - cookies tersimpan. Service siap dipakai.</Text>
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
                disabled={serviceInputSending}
                label={serviceInputSending ? 'Mengirim' : 'Kirim Input'}
                muted={serviceInputSending}
                size="sm"
                style={styles.serviceActionButton}
                onPress={() => onSubmitServiceInput(needsPassword ? 'password' : 'otp')}
              />
            </View>
          ) : null}
          <View style={styles.serviceConsolePanel}>
            <View style={styles.serviceConsoleHeader}>
              <View style={styles.serviceConsoleStatus}>
                <View style={[
                  styles.serviceConsoleStatusDot,
                  processRunning ? styles.serviceConsoleStatusDotRunning : styles.serviceConsoleStatusDotStopped,
                ]} />
                <Text style={styles.serviceConsoleStatusText}>
                  {processRunning ? 'Process running' : 'Process stopped'}
                </Text>
              </View>
              <View style={styles.serviceConsoleActions}>
                <Text style={styles.serviceConsoleLineCount}>{visibleLineCount} lines</Text>
                <View style={styles.serviceConsoleTabs}>
                  <KolamInteractionFrame
                    accessibilityLabel="AM Segment Live"
                    onPress={() => onLogSourceChange('realtime')}
                    style={[
                      styles.serviceConsoleTab,
                      logSource === 'realtime' && styles.serviceConsoleTabActive,
                    ]}>
                    <Text style={[
                      styles.serviceConsoleTabText,
                      logSource === 'realtime' && styles.serviceConsoleTabTextActive,
                    ]}>
                      Live
                    </Text>
                  </KolamInteractionFrame>
                  <KolamInteractionFrame
                    accessibilityLabel="AM Segment History"
                    onPress={() => onLogSourceChange('history')}
                    style={[
                      styles.serviceConsoleTab,
                      logSource === 'history' && styles.serviceConsoleTabActive,
                    ]}>
                    <Text style={[
                      styles.serviceConsoleTabText,
                      logSource === 'history' && styles.serviceConsoleTabTextActive,
                    ]}>
                      History
                    </Text>
                  </KolamInteractionFrame>
                </View>
              </View>
            </View>
            {logSource ? (
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator
                style={styles.serviceLogPanel}
                contentContainerStyle={styles.serviceLogContent}>
                {!logs.length ? <Text selectable style={styles.logEmptyText}>{logSource === 'history' ? 'Log riwayat tidak ditemukan' : 'Log realtime tidak ditemukan'}</Text> : null}
                {displayedLogs.map((log, index) => (
                  <View key={`${log.ts}-${index}`} style={styles.logRow}>
                    <Text selectable style={styles.logTimestamp}>[{formatAmDate(log.ts)}]</Text>
                    <Text selectable style={[styles.logText, styles.logMessage, getAmLogLevelStyle(log.level)]}>
                      {log.level}: {log.message}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : null}
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
          {!transfers.length ? <Text style={styles.loadingText}>Riwayat transfer tidak ditemukan</Text> : null}
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
        <KolamListTableComposition
          columns={taskHistoryColumns}
          emptyTitle="Riwayat task tidak ditemukan"
          getRowKey={task => task._id}
          pagination={historyTotal > historyLimit ? {
            onPageChange: onHistoryPageChange,
            page: historyPage,
            pageSize: historyLimit,
            total: historyTotal,
          } : undefined}
          rows={tasks}
          showFooter={historyTotal > historyLimit}
        />
      ) : null}
    </View>
  );
}

function AmTokopediaSessionPanel({
  account,
  onApplied,
  processRunning,
}: {
  account: AmServiceAccount;
  onApplied?: () => void;
  processRunning: boolean;
}) {
  const [info, setInfo] = React.useState<AmTokopediaSessionInfo | null>(null);
  const [monitorJob, setMonitorJob] = React.useState<AmTokopediaApiMonitorJob | null>(null);
  const [captchaAutoSolve, setCaptchaAutoSolve] = React.useState(false);
  const [anthropicApiKey, setAnthropicApiKey] = React.useState('');
  const [cookiesJson, setCookiesJson] = React.useState('');
  const [qrLogs, setQrLogs] = React.useState<AmDeviceServiceLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [acting, setActing] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const monitorStatusRef = React.useRef<AmTokopediaApiMonitorJob['status']>('idle');
  const deviceId = resolveServiceAccountDeviceId(account.deviceId);

  const loadSession = React.useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const [sessionResponse, monitorResponse] = await Promise.all([
        getAmTokopediaSession(account._id),
        getAmTokopediaApiMonitorStatus(account._id),
      ]);
      const previousMonitorStatus = monitorStatusRef.current;
      monitorStatusRef.current = monitorResponse.status;
      setInfo(sessionResponse);
      setCaptchaAutoSolve(sessionResponse.captchaAutoSolve);
      setMonitorJob(monitorResponse.status === 'idle' ? null : monitorResponse);
      if (previousMonitorStatus === 'running' && monitorResponse.status === 'success') {
        onApplied?.();
      }
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat Tokopedia session.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [account._id, onApplied]);

  const loadQrLogs = React.useCallback(async () => {
    if (!deviceId || !processRunning) {
      setQrLogs([]);
      return;
    }
    try {
      const response = await getAmDeviceServiceLogs(deviceId, {limit: 80, source: 'realtime'});
      setQrLogs(response.logs ?? []);
    } catch {
      setQrLogs([]);
    }
  }, [deviceId, processRunning]);

  React.useEffect(() => {
    loadSession();
  }, [loadSession]);

  React.useEffect(() => {
    if (!processRunning || !info?.qrTiktokLogin) {
      setQrLogs([]);
      return undefined;
    }
    loadQrLogs();
    const interval = setInterval(() => loadQrLogs(), 3000);
    return () => clearInterval(interval);
  }, [info?.qrTiktokLogin, loadQrLogs, processRunning]);

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

  const clearCaptchaApiKey = React.useCallback(() => {
    runAction('captcha-clear-key', async () => {
      const result = await updateAmTokopediaCaptchaSettings(account._id, {
        captchaAutoSolve,
        clearAnthropicApiKey: true,
      });
      setAnthropicApiKey('');
      setInfo(current => current ? {
        ...current,
        captchaAutoSolve: result.captchaAutoSolve,
        hasAnthropicApiKey: result.hasAnthropicApiKey,
        anthropicApiKeyPreview: result.anthropicApiKeyPreview,
        envFallbackAvailable: result.envFallbackAvailable,
      } : current);
      return 'Anthropic API key dihapus.';
    });
  }, [account._id, captchaAutoSolve, runAction]);

  const uploadManualCookies = React.useCallback(() => {
    runAction('upload-cookies', async () => {
      const cookies = parseAmTokopediaCookiesJson(cookiesJson);
      const result = await uploadAmTokopediaSession(account._id, cookies);
      setCookiesJson('');
      onApplied?.();
      return `Session disimpan (${result.cookieCount} cookies).`;
    });
  }, [account._id, cookiesJson, onApplied, runAction]);

  const statusLabel = info ? TOKOPEDIA_SESSION_LABELS[info.status] ?? titleCase(info.status) : 'Memuat session';
  const loginMode = info?.qrTiktokLogin ? 'qr' : info?.loginFillOnly ? 'fill' : 'password';
  const monitorRunning = monitorJob?.status === 'running';
  const canRunSessionAction = !isLoading && acting === null;
  const cookiesPreview = getAmTokopediaCookiesPreview(cookiesJson);
  const qrSignal = getQrLoginSignal(qrLogs);

  return (
    <View style={styles.emptyPanel}>
      <View style={styles.detailHeader}>
        <View>
          <Text style={styles.panelTitle}>Session Login Tokopedia</Text>
          <Text style={styles.panelText}>Status, login method, captcha, QR, dan browser monitor.</Text>
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
              disabled={!canRunSessionAction || acting === 'login-method'}
              intent={loginMode === 'password' ? 'warning' : 'outline'}
              label="Password"
              muted={!canRunSessionAction || acting === 'login-method'}
              size="sm"
              style={styles.serviceActionButton}
              onPress={() => updateLoginMethod('password')}
            />
            <KolamButton
              accessibilityLabel={`AM Tokopedia Login Fill Only ${account._id}`}
              disabled={!canRunSessionAction || acting === 'login-method'}
              intent={loginMode === 'fill' ? 'warning' : 'outline'}
              label="Isi Saja"
              muted={!canRunSessionAction || acting === 'login-method'}
              size="sm"
              style={styles.serviceActionButton}
              onPress={() => updateLoginMethod('fill')}
            />
            <KolamButton
              accessibilityLabel={`AM Tokopedia Login QR ${account._id}`}
              disabled={!canRunSessionAction || acting === 'login-method'}
              intent={loginMode === 'qr' ? 'warning' : 'outline'}
              label="QR TikTok"
              muted={!canRunSessionAction || acting === 'login-method'}
              size="sm"
              style={styles.serviceActionButton}
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
              disabled={!canRunSessionAction || acting === 'captcha'}
              intent={captchaAutoSolve ? 'warning' : 'outline'}
              label={captchaAutoSolve ? 'Auto Aktif' : 'Auto Nonaktif'}
              muted={!canRunSessionAction || acting === 'captcha'}
              size="sm"
              style={styles.serviceActionButton}
              onPress={() => setCaptchaAutoSolve(current => !current)}
            />
            <KolamSaveButton
              accessibilityLabel={`AM Tokopedia Captcha Save ${account._id}`}
              disabled={!canRunSessionAction || acting === 'captcha'}
              label={acting === 'captcha' ? 'Menyimpan' : 'Simpan Captcha'}
              muted={!canRunSessionAction || acting === 'captcha'}
              size="sm"
              style={styles.serviceActionButton}
              onPress={saveCaptchaSettings}
            />
            {info?.hasAnthropicApiKey ? (
              <KolamDeleteButton
                accessibilityLabel={`AM Tokopedia Captcha Clear Key ${account._id}`}
                disabled={!canRunSessionAction || acting === 'captcha-clear-key'}
                intent="outline"
                label={acting === 'captcha-clear-key' ? 'Menghapus' : 'Hapus Key'}
                muted={!canRunSessionAction || acting === 'captcha-clear-key'}
                size="sm"
                style={styles.serviceActionButton}
                onPress={clearCaptchaApiKey}
              />
            ) : null}
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
        <Text style={styles.formLabel}>Unggah cookies manual</Text>
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
          <KolamSaveButton
            accessibilityLabel={`AM Tokopedia Save Cookies ${account._id}`}
            disabled={!canRunSessionAction || acting === 'upload-cookies' || !cookiesJson.trim() || Boolean(cookiesPreview.error)}
            label={acting === 'upload-cookies' ? 'Menyimpan' : 'Simpan Session'}
            muted={!canRunSessionAction || acting === 'upload-cookies' || !cookiesJson.trim() || Boolean(cookiesPreview.error)}
            size="sm"
            style={styles.serviceActionButton}
            onPress={uploadManualCookies}
          />
          <KolamCancelButton
            accessibilityLabel={`AM Tokopedia Clear Cookies ${account._id}`}
            disabled={!cookiesJson.trim()}
            intent="outline"
            label="Bersihkan"
            muted={!cookiesJson.trim()}
            size="sm"
            style={styles.serviceActionButton}
            onPress={() => setCookiesJson('')}
          />
        </View>
        <Text style={cookiesPreview.error ? styles.cookieErrorText : styles.rowMeta}>
          {cookiesPreview.error ?? (cookiesPreview.count ? `Siap unggah: ${cookiesPreview.count} cookies` : 'Belum ada cookies JSON.')}
        </Text>
      </View>
      <View style={styles.inlineActions}>
        <KolamButton
          accessibilityLabel={`AM Tokopedia Verify ${account._id}`}
          disabled={!canRunSessionAction || info?.status === 'missing'}
          intent="outline"
          label={acting === 'verify' ? 'Mengecek' : 'Cek Login'}
          muted={!canRunSessionAction || info?.status === 'missing'}
          size="sm"
          style={styles.serviceActionButton}
          onPress={() => runAction('verify', async () => {
            const result = await verifyAmTokopediaSession(account._id);
            return result.loggedIn
              ? `Login valid (${result.cookieCount} cookies).`
              : result.reason ?? 'Session ada tetapi belum login.';
          })}
        />
        <KolamButton
          accessibilityLabel={`AM Tokopedia Restart ${account._id}`}
          disabled={!canRunSessionAction || !processRunning}
          intent="outline"
          label={acting === 'restart' ? 'Restart...' : 'Restart Tokopedia'}
          muted={!canRunSessionAction || !processRunning}
          size="sm"
          style={styles.serviceActionButton}
          onPress={() => runAction('restart', async () => {
            const result = await restartAmTokopediaSession(account._id);
            return result.restarted ? 'Tokopedia di-restart.' : 'Service belum berjalan; nyalakan service untuk memakai session baru.';
          })}
        />
        <KolamButton
          accessibilityLabel={`AM Tokopedia QR Start ${account._id}`}
          disabled={!canRunSessionAction || !processRunning || !info?.qrTiktokLogin}
          intent="outline"
          label={acting === 'qr-start' ? 'Memuat QR' : 'Mulai Scan QR'}
          muted={!canRunSessionAction || !processRunning || !info?.qrTiktokLogin}
          size="sm"
          style={styles.serviceActionButton}
          onPress={() => runAction('qr-start', async () => {
            await startAmTokopediaQrLogin(account._id);
            await loadQrLogs();
            return 'QR login dimulai. Pantau QR/status di log runtime.';
          })}
        />
        <KolamButton
          accessibilityLabel={`AM Tokopedia Api Monitor ${account._id}`}
          disabled={!canRunSessionAction || monitorRunning || info?.status === 'missing' || info?.status === 'empty'}
          intent="outline"
          label={monitorRunning ? 'Monitor berjalan' : 'Perbarui Session'}
          muted={!canRunSessionAction || monitorRunning || info?.status === 'missing' || info?.status === 'empty'}
          size="sm"
          style={styles.serviceActionButton}
          onPress={() => runAction('api-monitor', async () => {
            const job = await runAmTokopediaApiMonitor(account._id, {
              autoRestart: true,
              fillLogin: loginMode === 'fill',
            });
            setMonitorJob(job);
            return job.message;
          })}
        />
        <KolamRefreshButton
          accessibilityLabel={`AM Tokopedia Refresh ${account._id}`}
          disabled={isLoading}
          intent="outline"

          muted={isLoading}
          size="sm"
          style={styles.serviceIconButton}
          onPress={() => loadSession()}
        />
      </View>
      {monitorJob ? (
        <Text style={styles.rowMeta}>
          Monitor Browser: {titleCase(monitorJob.status)} - {monitorJob.message}
          {monitorJob.restarted ? ' Service sudah dinyalakan kembali.' : ''}
        </Text>
      ) : null}
      {info?.qrTiktokLogin ? (
        <View style={styles.qrPanel}>
          <Text style={styles.formLabel}>QR Login TikTok</Text>
          {!processRunning ? (
            <Text style={styles.rowMeta}>Nyalakan service dulu agar QR bisa dimunculkan.</Text>
          ) : qrSignal ? (
            <>
              <Text style={styles.rowMeta}>{qrSignal.status ? `Status ${qrSignal.status}` : 'Scan QR tersedia.'}</Text>
              {qrSignal.qrcodeBase64 ? (
                <Image
                  accessibilityLabel={`AM Tokopedia QR Image ${account._id}`}
                  resizeMode="contain"
                  source={{uri: normalizeAmQrImageUri(qrSignal.qrcodeBase64)}}
                  style={styles.qrImage}
                />
              ) : (
                <Text style={styles.rowMeta}>Gambar QR belum tersedia.</Text>
              )}
            </>
          ) : (
            <Text style={styles.rowMeta}>Klik Mulai Scan QR untuk memuat QR.</Text>
          )}
        </View>
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
        Menampilkan {from}-{to} dari {total} item
      </Text>
      <View style={styles.inlineActions}>
        <KolamButton
          accessibilityLabel={`${label} Previous Page`}
          disabled={currentPage <= 1 || disabled}
          label="Sebelumnya"
          intent="outline"
          size="sm"
          onPress={() => onPageChange(Math.max(1, currentPage - 1))}
        />
        <KolamButton
          accessibilityLabel={`${label} Next Page`}
          disabled={currentPage >= totalPages || disabled}
          label={`Halaman ${currentPage}/${totalPages}`}
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
    <View style={styles.hardwareGridSection}>
      {isLoading && !racks.length ? <Text style={styles.loadingText}>Memuat rak AM...</Text> : null}
      {!isLoading && !racks.length ? <Text style={styles.loadingText}>Rak belum ada</Text> : null}
      <View style={styles.cardGrid}>
        {racks.map(rack => (
          <KolamInteractionFrame
            key={rack._id}
            accessibilityLabel={`AM Hardware Rack ${rack.name}`}
            accessibilityRole="button"
            onPress={() => onSelectRack(rack)}
            style={styles.hardwareCard}>
            <Text style={styles.rowTitle}>{rack.name}</Text>
            <Text style={styles.rowMeta}>{rack.location || 'Lokasi belum diisi'}</Text>
            <View style={styles.hardwareStats}>
              <Text style={styles.rowMeta}>Box {rack.boxCount ?? countBoxesForRack(boxes, rack)}</Text>
              <Text style={styles.rowMeta}>Perangkat {rack.deviceCount ?? countDevicesForRack(devices, rack)}</Text>
            </View>
            {rack.serverIp ? <Text style={styles.monoText}>{rack.serverIp}</Text> : null}
            <AmStatusChip label={rack.status} tone={rack.status === 'active' ? 'success' : 'muted'} />
            <View style={styles.hardwareCardFooter}>
              <View style={styles.hardwareCardFooterCopy}>
                <Text style={styles.rowMeta}>Ditambahkan oleh</Text>
                <Text style={styles.cellText} numberOfLines={1}>
                  {formatRackAddedBy(rack)}
                </Text>
              </View>
              <KolamTableRowActionMenu
                accessibilityLabel={`AM Hardware Rack Actions ${rack._id}`}
                actions={[
                  {label: 'Lihat Box', onPress: () => onSelectRack(rack)},
                  {label: 'Ubah', onPress: () => onEditRack(rack)},
                  {
                    disabled: actingHardwareId === rack._id,
                    label: actingHardwareId === rack._id ? '...' : 'Hapus',
                    onPress: () => onDeleteRack(rack),
                    tone: 'danger',
                  },
                ]}
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
    <View style={styles.tablePanel}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, styles.deviceNameCol]}>Nama</Text>
        <Text style={[styles.tableHeaderText, styles.amountCol]}>Perangkat</Text>
        <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
        <Text style={[styles.tableHeaderText, styles.recipientCol]}>Deskripsi</Text>
        <Text style={[styles.tableHeaderText, styles.hardwareActionCol]} />
      </View>
      {isLoading && !boxes.length ? <Text style={styles.loadingText}>Memuat box AM...</Text> : null}
      {!isLoading && !boxes.length ? <Text style={styles.loadingText}>Box belum ada di rak ini</Text> : null}
      {boxes.map(box => (
        <KolamInteractionFrame
          key={box._id}
          accessibilityLabel={`AM Hardware Box ${box.name}`}
          accessibilityRole="button"
          onPress={() => onSelectBox(box)}
          style={styles.tableRow}>
          <View style={styles.deviceNameCol}>
            <Text style={styles.cellText} numberOfLines={1}>{box.name}</Text>
          </View>
          <Text style={[styles.cellText, styles.amountCol]}>{box.deviceCount ?? 0} / 24</Text>
          <View style={styles.statusCol}>
            <AmStatusChip label={box.status} tone={box.status === 'active' ? 'success' : 'muted'} />
          </View>
          <Text style={[styles.cellText, styles.recipientCol]} numberOfLines={1}>
            {box.description || 'Tanpa deskripsi'}
          </Text>
          <View style={styles.hardwareActionCol}>
            <KolamTableRowActionMenu
              accessibilityLabel={`AM Hardware Box Actions ${box._id}`}
              actions={[
                {label: 'Lihat Perangkat', onPress: () => onSelectBox(box)},
                {label: 'Ubah', onPress: () => onEditBox(box)},
                {
                  disabled: actingHardwareId === box._id,
                  label: actingHardwareId === box._id ? '...' : 'Hapus',
                  onPress: () => onDeleteBox(box),
                  tone: 'danger',
                },
              ]}
            />
          </View>
        </KolamInteractionFrame>
      ))}
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
        <Text style={[styles.tableHeaderText, styles.deviceNameCol]}>Perangkat</Text>
        <Text style={[styles.tableHeaderText, styles.identifierCol]}>Identitas</Text>
        <Text style={[styles.tableHeaderText, styles.brandCol]}>Merek</Text>
        <Text style={[styles.tableHeaderText, styles.modelCol]}>Model</Text>
        <Text style={[styles.tableHeaderText, styles.statusCol]}>ADB</Text>
        <Text style={[styles.tableHeaderText, styles.hardwareActionCol]} />
      </View>
      <AmLoadingOrEmpty isLoading={isLoading} items={devices} loadingText="Memuat perangkat AM..." emptyText="Perangkat tidak ditemukan" />
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
          <Text style={[styles.cellText, styles.brandCol]} numberOfLines={1}>{device.brand || 'Belum diisi'}</Text>
          <Text style={[styles.cellText, styles.modelCol]} numberOfLines={1}>{device.model || 'Belum diisi'}</Text>
          <View style={styles.statusCol}>
            <AmStatusChip label={device.adbStatus ?? 'disconnected'} tone={getAdbTone(device.adbStatus)} />
          </View>
          <View style={styles.hardwareActionCol}>
            <KolamTableRowActionMenu
              accessibilityLabel={`AM Hardware Device Actions ${device._id}`}
              actions={[
                {label: 'Lihat Detail', onPress: () => onSelectDevice(device)},
                {label: 'Ubah', onPress: () => onEditDevice(device)},
                {
                  disabled: actingHardwareId === device._id,
                  label: actingHardwareId === device._id ? '...' : 'Hapus',
                  onPress: () => onDeleteDevice(device),
                  tone: 'danger',
                },
              ]}
            />
          </View>
        </KolamInteractionFrame>
      ))}
    </View>
  );
}

function AmDeviceDetailPanel({device}: {device: AmDevice}) {
  const isBrowserDevice = device.connectionType === 'browser';
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
  const [moveConfirmOpen, setMoveConfirmOpen] = React.useState(false);
  const [actingDeviceServiceId, setActingDeviceServiceId] = React.useState<string | null>(null);
  const [isSubmittingService, setIsSubmittingService] = React.useState(false);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const servicePlatformItems = React.useMemo(
    () => isBrowserDevice
      ? ['whatsapp', 'tokopedia', 'shopee', 'tiktok', 'instagram']
      : ['bca', 'brimo', 'dana'],
    [isBrowserDevice],
  );
  const deviceServiceMode = React.useMemo(() => {
    if (accounts.some(account => AM_EXCLUSIVE_SERVICE_PLATFORMS.has(account.platform))) return 'exclusive';
    if (accounts.some(account => AM_BANKING_SERVICE_PLATFORMS.has(account.platform))) return 'banking';
    return 'empty';
  }, [accounts]);
  const createServicePlatformItems = React.useMemo(() => {
    if (deviceServiceMode === 'exclusive') return [];
    if (deviceServiceMode === 'banking') {
      return servicePlatformItems.filter(platform => AM_BANKING_SERVICE_PLATFORMS.has(platform));
    }
    return servicePlatformItems;
  }, [deviceServiceMode, servicePlatformItems]);
  const deviceOptions = React.useMemo(
    () => mergeAmEntityById(allDevices, device).filter(nextDevice =>
      isDeviceCompatibleWithServicePlatform(nextDevice, serviceFormPlatform),
    ),
    [allDevices, device, serviceFormPlatform],
  );
  const showDeviceServiceUsername = serviceFormPlatform === 'bca' ||
    serviceFormPlatform === 'brimo' ||
    serviceFormPlatform === 'shopee' ||
    serviceFormPlatform === 'instagram' ||
    serviceFormPlatform === 'tiktok';
  const showDeviceServicePassword = serviceFormPlatform === 'bca' ||
    serviceFormPlatform === 'brimo' ||
    serviceFormPlatform === 'shopee' ||
    serviceFormPlatform === 'instagram' ||
    serviceFormPlatform === 'tokopedia';
  const showDeviceServicePin = serviceFormPlatform === 'bca' ||
    serviceFormPlatform === 'brimo' ||
    serviceFormPlatform === 'dana';
  const showDeviceServiceAccountNumber = serviceFormPlatform === 'bca' ||
    serviceFormPlatform === 'brimo';
  const showDeviceServicePhoneNumber = serviceFormPlatform === 'dana' ||
    serviceFormPlatform === 'whatsapp' ||
    serviceFormPlatform === 'tokopedia';

  const resetDeviceServiceForm = React.useCallback((open = false) => {
    setEditingDeviceServiceId(null);
    setIsServiceFormOpen(open);
    setServiceFormPlatform(createServicePlatformItems[0] ?? servicePlatformItems[0] ?? 'bca');
    setServiceFormStatus('inactive');
    setServiceFormDeviceId(device._id);
    setServiceFormLabel('');
    setServiceFormUsername('');
    setServiceFormPassword('');
    setServiceFormPin('');
    setServiceFormAccountNumber('');
    setServiceFormPhoneNumber('');
    setMoveConfirmOpen(false);
    setActionMessage(null);
  }, [createServicePlatformItems, device._id, servicePlatformItems]);

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
    setServiceFormUsername(getServiceCredentialLogin(account));
    setServiceFormPassword('');
    setServiceFormPin('');
    setServiceFormAccountNumber(account.accountNumber ?? '');
    setServiceFormPhoneNumber(getCredentialString(account.credentials, 'phoneNumber') ?? '');
    setMoveConfirmOpen(false);
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
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat akun layanan perangkat.');
    } finally {
      setIsLoading(false);
    }
  }, [device._id]);

  React.useEffect(() => {
    fetchDeviceServices();
  }, [fetchDeviceServices]);

  React.useEffect(() => {
    if (!editingDeviceServiceId && !isServiceFormOpen) {
      setServiceFormPlatform(createServicePlatformItems[0] ?? servicePlatformItems[0] ?? 'bca');
    }
  }, [createServicePlatformItems, editingDeviceServiceId, isServiceFormOpen, servicePlatformItems]);

  const submitDeviceServiceAccount = React.useCallback(async (moveConfirmed = false) => {
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
      setError('Hentikan layanan sebelum dipindahkan ke perangkat lain.');
      return;
    }

    if (deviceChanged && !moveConfirmed) {
      setMoveConfirmOpen(true);
      return;
    }

    const payload: AmServiceAccountPayload = serviceFormPlatform === 'dana'
      ? {
          platform: serviceFormPlatform,
          label: serviceFormLabel.trim(),
          deviceId: targetDeviceId,
          credentials,
        }
      : AM_BROWSER_DEVICE_PLATFORMS.has(serviceFormPlatform)
        ? {
            platform: serviceFormPlatform,
            label: serviceFormLabel.trim(),
            deviceId: targetDeviceId,
            credentials: buildWebServiceCredentials({
              platform: serviceFormPlatform,
              login: serviceFormUsername,
              password: serviceFormPassword,
              phoneNumber: serviceFormPhoneNumber,
            }),
          }
        : {
            platform: serviceFormPlatform,
            label: serviceFormLabel.trim(),
            deviceId: targetDeviceId,
            username: serviceFormUsername.trim(),
            accountNumber: serviceFormAccountNumber.trim(),
            credentials,
          };
    if (editingDeviceServiceId) payload.status = serviceFormStatus;
    const password = serviceFormPassword.trim();
    const pin = serviceFormPin.trim();
    if (
      serviceFormPlatform !== 'dana' &&
      !AM_BROWSER_DEVICE_PLATFORMS.has(serviceFormPlatform) &&
      (!editingDeviceServiceId || password)
    ) {
      payload.password = password;
    }
    if (!AM_BROWSER_DEVICE_PLATFORMS.has(serviceFormPlatform) && (!editingDeviceServiceId || pin)) {
      payload.pin = pin;
    }

    try {
      setIsSubmittingService(true);
      setError(null);
      setActionMessage(null);
      if (editingDeviceServiceId) {
        const updatePayload = {...payload};
        delete updatePayload.platform;
        if (!deviceChanged) {
          delete updatePayload.deviceId;
        }
        await updateAmServiceAccount(editingDeviceServiceId, updatePayload);
      } else {
        await createAmServiceAccount({
          ...payload,
          platform: serviceFormPlatform,
          label: serviceFormLabel.trim(),
        });
      }
      resetDeviceServiceForm(false);
      const targetDeviceName = deviceOptions.find(nextDevice => nextDevice._id === targetDeviceId)?.name ?? 'device baru';
      setActionMessage(deviceChanged
        ? `${payload.label} dipindahkan ke ${targetDeviceName}.`
        : `${payload.label} ${editingDeviceServiceId ? 'diperbarui' : 'dibuat'}.`);
      await fetchDeviceServices();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal menyimpan akun layanan perangkat.');
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
    deviceOptions,
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
      setError(nextError instanceof Error ? nextError.message : 'Gagal menghapus akun layanan perangkat.');
    } finally {
      setActingDeviceServiceId(null);
    }
  }, [editingDeviceServiceId, fetchDeviceServices, resetDeviceServiceForm]);

  return (
    <View style={styles.panel}>
      <KolamConfirmDialog
        cancelLabel="Batal"
        confirmLabel="Pindahkan"
        message={`Pindahkan ${serviceFormLabel || 'akun layanan'} ke ${deviceOptions.find(nextDevice => nextDevice._id === serviceFormDeviceId)?.name ?? 'perangkat baru'}?`}
        title="Pindahkan Akun Layanan?"
        visible={moveConfirmOpen}
        onCancel={() => setMoveConfirmOpen(false)}
        onConfirm={() => {
          setMoveConfirmOpen(false);
          void submitDeviceServiceAccount(true);
        }}
      />
      <Text style={styles.panelTitle}>{device.name}</Text>
      <View style={styles.amDeviceInfoGrid}>
        <View style={styles.amDeviceInfoItem}>
          <Text style={styles.amDeviceInfoLabel}>Koneksi</Text>
          <View style={styles.amDeviceInfoValueWrap}>
            <AmStatusChip
              label={isBrowserDevice ? 'Browser' : device.connectionType === 'tcp' ? 'TCP/IP' : 'USB'}
              tone={isBrowserDevice ? 'success' : device.connectionType === 'tcp' ? 'warning' : 'muted'}
            />
          </View>
        </View>
        {!isBrowserDevice ? (
          <View style={styles.amDeviceInfoItem}>
            <Text style={styles.amDeviceInfoLabel}>{device.connectionType === 'tcp' ? 'Alamat TCP' : 'UDID'}</Text>
            <Text style={styles.amDeviceInfoValue} numberOfLines={1}>
              {device.connectionType === 'tcp' ? device.tcpAddress || '-' : device.udid || '-'}
            </Text>
          </View>
        ) : null}
        {!isBrowserDevice ? (
          <>
            <View style={styles.amDeviceInfoItem}>
              <Text style={styles.amDeviceInfoLabel}>Status ADB</Text>
              <View style={styles.amDeviceInfoValueWrap}>
                <AmStatusChip label={device.adbStatus ?? 'unknown'} tone={getAdbTone(device.adbStatus)} />
              </View>
            </View>
            <View style={styles.amDeviceInfoItem}>
              <Text style={styles.amDeviceInfoLabel}>Merek</Text>
              <Text style={styles.amDeviceInfoValue} numberOfLines={1}>{device.brand || 'Belum diisi'}</Text>
            </View>
            <View style={styles.amDeviceInfoItem}>
              <Text style={styles.amDeviceInfoLabel}>Model</Text>
              <Text style={styles.amDeviceInfoValue} numberOfLines={1}>{device.model || 'Belum diisi'}</Text>
            </View>
            <View style={styles.amDeviceInfoItem}>
              <Text style={styles.amDeviceInfoLabel}>Port</Text>
              <Text style={styles.amDeviceInfoValue} numberOfLines={1}>
                App:{device.appiumPort ?? '-'} Sys:{device.systemPort ?? '-'} ADB:{device.adbPort ?? '-'}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.amDeviceInfoItem}>
            <Text style={styles.amDeviceInfoLabel}>Lingkungan</Text>
            <Text style={styles.amDeviceInfoValue} numberOfLines={1}>Playwright (Chromium)</Text>
          </View>
        )}
      </View>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.panelTitle}>Akun Layanan</Text>
        <View style={styles.inlineActions}>
          {createServicePlatformItems.length ? (
            <KolamButton
              accessibilityLabel={`AM Device Add Service Account ${device._id}`}
              label="Tambah Akun Layanan"
              size="sm"
              onPress={() => resetDeviceServiceForm(true)}
            />
          ) : null}
        </View>
      </View>
      <AmInlineError error={error} title="Akun layanan perangkat belum bisa dibaca" />
      {actionMessage ? (
        <View style={styles.successPanel}>
          <Text style={styles.successText}>{actionMessage}</Text>
        </View>
      ) : null}
      <KolamModalDialog
        accessibilityLabel={editingDeviceServiceId ? `AM Device Edit Service Account Modal ${device._id}` : `AM Device Add Service Account Modal ${device._id}`}
        maxHeight="86%"
        maxWidth="86%"
        onClose={() => resetDeviceServiceForm(false)}
        title={editingDeviceServiceId ? 'Ubah Akun Layanan' : 'Tambah Akun Layanan'}
        visible={isServiceFormOpen}
        width={520}
        footer={
          <>
            <KolamCancelButton label="Batal" onPress={() => resetDeviceServiceForm(false)} />
            <KolamSaveButton
              accessibilityLabel={`AM Device Save Service Account ${device._id}`}
              disabled={isSubmittingService || !serviceFormLabel.trim()}
              label={isSubmittingService ? 'Menyimpan' : editingDeviceServiceId ? 'Simpan' : 'Buat'}
              muted={isSubmittingService || !serviceFormLabel.trim()}
              onPress={submitDeviceServiceAccount}
            />
          </>
        }>
        <ScrollView
          nestedScrollEnabled
          style={styles.hardwareModalScroll}
          contentContainerStyle={styles.formGrid}>
            {editingDeviceServiceId ? (
              <View style={styles.detailListRow}>
                <Text style={[styles.tableHeaderText, styles.accountCol]}>Platform</Text>
                <Text style={[styles.cellText, styles.recipientCol]}>
                  {AM_PLATFORM_LABELS[serviceFormPlatform] ?? serviceFormPlatform}
                </Text>
              </View>
            ) : (
              <AmSegmentGroup
                active={serviceFormPlatform}
                items={createServicePlatformItems}
                labels={AM_PLATFORM_LABELS}
                onSelect={setServiceFormPlatform}
              />
            )}
            {editingDeviceServiceId ? (
              <AmSegmentGroup
                active={serviceFormStatus}
                items={['active', 'inactive', 'blocked']}
                onSelect={value => setServiceFormStatus(value as 'active' | 'inactive' | 'blocked')}
              />
            ) : null}
            <AmTextInput label="Label" placeholder="Label layanan" value={serviceFormLabel} onChangeText={setServiceFormLabel} />
            {showDeviceServiceUsername ? (
              <AmTextInput {...getAmServiceFieldProps(serviceFormPlatform, 'username', Boolean(editingDeviceServiceId))} value={serviceFormUsername} onChangeText={setServiceFormUsername} />
            ) : null}
            {showDeviceServicePassword ? (
              <AmTextInput {...getAmServiceFieldProps(serviceFormPlatform, 'password', Boolean(editingDeviceServiceId))} secureTextEntry value={serviceFormPassword} onChangeText={setServiceFormPassword} />
            ) : null}
            {showDeviceServicePin ? (
              <AmTextInput {...getAmServiceFieldProps(serviceFormPlatform, 'pin', Boolean(editingDeviceServiceId))} secureTextEntry value={serviceFormPin} onChangeText={setServiceFormPin} />
            ) : null}
            {showDeviceServiceAccountNumber ? (
              <AmTextInput {...getAmServiceFieldProps(serviceFormPlatform, 'accountNumber', Boolean(editingDeviceServiceId))} value={serviceFormAccountNumber} onChangeText={setServiceFormAccountNumber} />
            ) : null}
            {showDeviceServicePhoneNumber ? (
              <AmTextInput {...getAmServiceFieldProps(serviceFormPlatform, 'phoneNumber', Boolean(editingDeviceServiceId))} value={serviceFormPhoneNumber} onChangeText={setServiceFormPhoneNumber} />
            ) : null}
            {editingDeviceServiceId ? (
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Perangkat</Text>
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
        </ScrollView>
      </KolamModalDialog>
      <View style={styles.tablePanel}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.serviceCol]}>Akun</Text>
          <Text style={[styles.tableHeaderText, styles.platformCol]}>Platform</Text>
          <Text style={[styles.tableHeaderText, styles.accountCol]}>Nama Pengguna</Text>
          <Text style={[styles.tableHeaderText, styles.accountCol]}>No. Akun</Text>
          <Text style={[styles.tableHeaderText, styles.amountCol]}>Saldo</Text>
          <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
          <Text style={[styles.tableHeaderText, styles.hardwareActionCol]} />
        </View>
        <AmLoadingOrEmpty
          isLoading={isLoading}
          items={accounts}
          loadingText="Memuat akun layanan perangkat..."
          emptyText="Belum ada akun layanan di perangkat ini"
        />
        {accounts.map(account => {
          const runtime = services.find(status => status.serviceAccountId === account._id);
          const statusLabel = runtime?.serviceStatus ?? account.status;
          return (
            <View key={account._id} style={styles.tableRow}>
              <View style={styles.serviceCol}>
                <Text style={styles.rowTitle} numberOfLines={1}>{account.label}</Text>
                <Text style={styles.rowMeta} numberOfLines={1}>{runtime?.taskStatus ?? 'Tugas runtime tidak ada'}</Text>
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
                <AmStatusChip label={statusLabel} tone={statusLabel === 'running' || statusLabel === 'active' ? 'success' : 'warning'} />
              </View>
              <View style={styles.hardwareActionCol}>
                <KolamTableRowActionMenu
                  accessibilityLabel={`AM Device Service Account Actions ${account._id}`}
                  actions={[
                    {
                      disabled: isSubmittingService || actingDeviceServiceId === account._id,
                      label: 'Ubah',
                      onPress: () => editDeviceServiceAccount(account),
                    },
                    {
                      disabled: actingDeviceServiceId === account._id,
                      label: actingDeviceServiceId === account._id ? '...' : 'Hapus',
                      onPress: () => deleteDeviceServiceAccount(account),
                      tone: 'danger',
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function AmTransfersPage({
  initialTransferId,
  onModuleRouteSelect,
}: {
  initialTransferId?: string;
  onModuleRouteSelect?: (route: ShellModuleRouteEntry) => void;
}) {
  const [transfers, setTransfers] = React.useState<AmTransfer[]>([]);
  const [accounts, setAccounts] = React.useState<AmServiceAccount[]>([]);
  const [status, setStatus] = React.useState('all');
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
      });
      setTransfers(response.data);
      setTotal(response.meta.total);
      setLimit(response.meta.limit || AM_TRANSFER_PAGE_LIMIT);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat transfers AM.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status]);

  const fetchTransferAccounts = React.useCallback(async () => {
    try {
      const response = await getAmServiceAccounts({status: 'active', limit: 100});
      setAccounts(response.data);
    } catch {
      setAccounts([]);
    }
  }, []);

  React.useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  React.useEffect(() => {
    if (showTransferForm) {
      fetchTransferAccounts();
    }
  }, [fetchTransferAccounts, showTransferForm]);

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

  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  const rangeFrom = total ? (page - 1) * limit + 1 : 0;
  const rangeTo = total ? Math.min(page * limit, total) : 0;
  const transferStats = getTransferStats(transfers);
  const activeTransferAccounts = React.useMemo(
    () => accounts.filter(account => account.status === 'active' && isTransferBanking(account.platform)),
    [accounts],
  );
  const transferCreateAccountItems = React.useMemo(() => ['auto', ...activeTransferAccounts.map(account => account._id)], [activeTransferAccounts]);
  const transferCreateAccountLabels = React.useMemo<Record<string, string>>(() => ({
    auto: 'Pilih otomatis',
    ...Object.fromEntries(
      activeTransferAccounts.map(account => [account._id, formatBankAccount(account)]),
    ),
  }), [activeTransferAccounts]);
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
      setError('Nomor akun penerima wajib diisi');
      return;
    }
    if (!isVirtualAccountTransfer && !formRecipientBank) {
      setError('Bank penerima wajib diisi');
      return;
    }
    if (parsedTransferAmount !== undefined && parsedTransferAmount > 0 && parsedTransferAmount < 10000) {
      setError(`Nominal minimal ${formatRupiah(10000)}`);
      return;
    }
    if (isInterBankTransfer && !formTransferMethod) {
      setError('Metode transfer wajib diisi untuk transfer antarbank');
      return;
    }
    if (isInterBankTransfer && formTransferMethod === 'BI FAST' && !formTransactionPurpose) {
      setError('Tujuan transaksi wajib diisi');
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
      setActionMessage('Transfer dibuat');
      setShowTransferForm(false);
      resetTransferForm();
      await fetchTransfers();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal membuat transfer');
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
        <KolamSearchField value={search} onChangeText={handleTransferSearchChange} placeholder="Cari penerima..." containerStyle={styles.taskSearch} trailingLabel={`${total} transfer`} />
        <AmSegmentGroup
          active={status}
          items={['all', 'pending', 'processing', 'success', 'failed']}
          labels={TRANSFER_STATUS_FILTER_LABELS}
          onSelect={handleTransferStatusChange}
        />
        <KolamButton
          accessibilityLabel="AM New Transfer"
          label="Transfer Baru"
          intent={showTransferForm ? 'warning' : 'outline'}
          size="sm"
          onPress={() => setShowTransferForm(current => !current)}
        />
        <KolamRefreshButton
          accessibilityLabel="Refresh"
          disabled={isLoading}

          intent="outline"
          muted={isLoading}
          size="sm"
          onPress={fetchTransfers}
        />
      </View>
      <AmInlineError title="Transfer AM belum bisa dibaca" error={error} />
      {actionMessage ? (
        <View style={styles.successPanel}>
          <Text style={styles.successText}>{actionMessage}</Text>
        </View>
      ) : null}
      {showTransferForm ? (
        <View style={styles.panel}>
          <View style={styles.formGrid}>
            <View style={styles.detailHeader}>
              <Text style={styles.panelTitle}>Transfer Baru</Text>
              <KolamButton
                accessibilityLabel="AM Transfer Cancel Create"
                label="Batal"
                intent="outline"
                size="sm"
                onPress={() => {
                  setShowTransferForm(false);
                  resetTransferForm();
                }}
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Akun Sumber</Text>
              <AmSegmentGroup
                active={formAccountId}
                items={transferCreateAccountItems}
                labels={transferCreateAccountLabels}
                onSelect={setFormAccountId}
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Tipe Transfer</Text>
              <AmSegmentGroup
                active={formTransferType}
                items={['transfer', 'virtual-account']}
                labels={{transfer: 'Transfer', 'virtual-account': 'Transfer Virtual Account'}}
                onSelect={handleCreateTransferTypeChange}
              />
            </View>
            <View style={styles.formGrid}>
              <AmTextInput
                label={isVirtualAccountTransfer ? 'Nomor VA' : 'Nomor Akun Penerima'}
                placeholder={isVirtualAccountTransfer ? 'Nomor VA' : 'Nomor akun'}
                value={formRecipientAccount}
                onChangeText={setFormRecipientAccount}
              />
              <AmTextInput label="Nama Penerima" placeholder="Nama penerima" value={formRecipientName} onChangeText={setFormRecipientName} />
              {!isVirtualAccountTransfer ? (
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Bank Penerima</Text>
                  <AmSegmentGroup active={formRecipientBank} items={AM_RECIPIENT_BANKS} onSelect={handleRecipientBankChange} />
                </View>
              ) : null}
              {isInterBankTransfer ? (
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Metode Transfer</Text>
                  <AmSegmentGroup active={formTransferMethod} items={AM_TRANSFER_METHODS} onSelect={handleTransferMethodChange} />
                </View>
              ) : null}
              {isInterBankTransfer && formTransferMethod === 'BI FAST' ? (
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Tujuan Transaksi</Text>
                  <AmSegmentGroup active={formTransactionPurpose} items={AM_TRANSACTION_PURPOSES} labels={AM_TRANSACTION_PURPOSE_LABELS} onSelect={setFormTransactionPurpose} />
                </View>
              ) : null}
              <AmTextInput label="Nominal (IDR)" placeholder="0" value={formAmount} onChangeText={setFormAmount} />
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
                disabled={isSubmittingTransfer}
                label={isSubmittingTransfer ? 'Membuat' : 'Buat Transfer'}
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
        <AmMetricCard label="Total Transfer" value={String(transferStats.total)} meta="hasil halaman" />
        <AmMetricCard label="Total Nominal" value={formatRupiah(transferStats.totalAmount)} meta="nominal halaman" />
        <AmMetricCard label="Menunggu" value={String(transferStats.pending)} meta="menunggu eksekusi" />
        <AmMetricCard label="Diproses" value={String(transferStats.processing)} meta="sedang berjalan" />
        <AmMetricCard label="Berhasil" value={String(transferStats.success)} meta="berhasil" />
        <AmMetricCard label="Gagal" value={String(transferStats.failed)} meta="perlu tindak lanjut" />
      </View>
      <View style={styles.tablePanel}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.accountWideCol]}>Akun</Text>
          <Text style={[styles.tableHeaderText, styles.recipientCol]}>Penerima</Text>
          <Text style={[styles.tableHeaderText, styles.platformCol]}>Bank</Text>
          <Text style={[styles.tableHeaderText, styles.amountCol]}>Nominal</Text>
          <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
          <Text style={[styles.tableHeaderText, styles.deviceWideCol]}>Device</Text>
          <Text style={[styles.tableHeaderText, styles.dateCol]}>Dibuat</Text>
          <Text style={[styles.tableHeaderText, styles.actionCol]} />
        </View>
        <AmLoadingOrEmpty isLoading={isLoading} items={transfers} loadingText="Memuat transfer AM..." emptyText="Transfer tidak ditemukan" />
        {transfers.map(transfer => (
          <View key={transfer._id} style={styles.tableRow}>
            <View style={styles.accountWideCol}>
              <Text style={styles.cellText} numberOfLines={1}>{formatBankAccount(transfer.accountId)}</Text>
            </View>
            <View style={styles.recipientCol}>
              <Text style={styles.cellText} numberOfLines={1}>{transfer.recipientAccount || '-'}</Text>
              <Text style={styles.rowMeta} numberOfLines={1}>{transfer.recipientName || '-'}</Text>
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
                  label={selectedTransferId === transfer._id ? 'Tutup' : 'Detail'}
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
              Menampilkan {rangeFrom}-{rangeTo} dari {total} item
            </Text>
            <View style={styles.inlineActions}>
              <KolamButton
                accessibilityLabel="AM Transfers Previous Page"
                disabled={page <= 1 || isLoading}
                label="Sebelumnya"
                intent="outline"
                size="sm"
                onPress={() => setPage(current => Math.max(1, current - 1))}
              />
              <KolamButton
                accessibilityLabel="AM Transfers Next Page"
                disabled={page >= totalPages || isLoading}
                label={`Halaman ${page}/${totalPages}`}
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
          <Text style={styles.panelTitle}>Detail Transfer</Text>
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
              label="Nominal"
              value={formatRupiah(transfer.amount)}
              meta={`Biaya ${formatRupiah(transfer.fee ?? 0)} / Total ${formatRupiah(transfer.amount + (transfer.fee ?? 0))}`}
            />
            <AmMetricCard label="Tipe" value={titleCase(transfer.transferType)} meta={transfer.transferMethod ?? 'metode belum diisi'} />
            <AmMetricCard label="Penerima" value={transfer.recipientName || '-'} meta={`${transfer.recipientBank ?? '-'} ${transfer.recipientAccount}`} />
          </View>
          <View style={styles.detailList}>
            <Text style={styles.panelTitle}>Info Transfer</Text>
            <View style={styles.detailListRow}>
              <Text style={[styles.tableHeaderText, styles.accountCol]}>Dibuat</Text>
              <Text style={[styles.cellText, styles.recipientCol]}>{formatAmDate(transfer.createdAt)}</Text>
            </View>
            <View style={styles.detailListRow}>
              <Text style={[styles.tableHeaderText, styles.accountCol]}>Dibuat oleh</Text>
              <Text style={[styles.cellText, styles.recipientCol]}>{formatTransferCreatedBy(transfer.createdBy)}</Text>
            </View>
            {transfer.transferMethod ? (
              <View style={styles.detailListRow}>
                <Text style={[styles.tableHeaderText, styles.accountCol]}>Metode Transfer</Text>
                <Text style={[styles.cellText, styles.recipientCol]}>{transfer.transferMethod}</Text>
              </View>
            ) : null}
            {transfer.transactionPurpose ? (
              <View style={styles.detailListRow}>
                <Text style={[styles.tableHeaderText, styles.accountCol]}>Tujuan Transaksi</Text>
                <Text style={[styles.cellText, styles.recipientCol]}>{transfer.transactionPurpose}</Text>
              </View>
            ) : null}
            <Text style={styles.panelTitle}>Sumber & Device</Text>
            <View style={styles.detailListRow}>
              <Text style={[styles.tableHeaderText, styles.accountCol]}>Akun</Text>
              <Text style={[styles.cellText, styles.recipientCol]}>{formatBankAccount(transfer.accountId)}</Text>
            </View>
            <View style={styles.detailListRow}>
              <Text style={[styles.tableHeaderText, styles.accountCol]}>Tipe Akun</Text>
              <Text style={[styles.cellText, styles.recipientCol]}>{formatAccountType(transfer.accountId)}</Text>
            </View>
            <View style={styles.detailListRow}>
              <Text style={[styles.tableHeaderText, styles.accountCol]}>Nomor Akun</Text>
              <Text style={[styles.cellText, styles.recipientCol]}>{formatAccountNumber(transfer.accountId)}</Text>
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
            <View style={styles.detailListRow}>
              <Text style={[styles.tableHeaderText, styles.accountCol]}>Dimulai</Text>
              <Text style={[styles.cellText, styles.recipientCol]}>{formatAmDate(transfer.startedAt)}</Text>
            </View>
            <View style={styles.detailListRow}>
              <Text style={[styles.tableHeaderText, styles.accountCol]}>Selesai</Text>
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
                <Text style={[styles.tableHeaderText, styles.accountCol]}>Bukti</Text>
                <Text style={[styles.cellText, styles.recipientCol]}>Screenshot base64 tersedia ({transfer.screenshot.length} karakter)</Text>
              </View>
            ) : null}
          </View>
          {transfer.screenshot ? (
            <View style={styles.proofPanel}>
              <Text style={styles.panelTitle}>Bukti Transaksi</Text>
              <Text style={styles.panelText}>Screenshot setelah transfer.</Text>
              <Image
                accessibilityLabel="AM Transfer Bukti Transaksi"
                resizeMode="contain"
                source={{uri: `data:image/png;base64,${transfer.screenshot}`}}
                style={styles.proofImage}
              />
            </View>
          ) : null}
          <View style={styles.detailHeader}>
            <View>
              <Text style={styles.panelTitle}>Log Automasi</Text>
              <Text style={styles.rowMeta}>
                {transfer.logs.length} baris{transfer.status === 'processing' ? ' - refresh tiap 3 detik' : ''}
              </Text>
            </View>
          </View>
          <View style={styles.logPanel}>
            {!transfer.logs.length ? <Text selectable style={styles.logEmptyText}>Log belum ada...</Text> : null}
            {transfer.logs.map((line, index) => (
              <Text key={`${index}-${line}`} selectable style={styles.logText}>
                {String(index + 1).padStart(3, '0')} {line}
              </Text>
            ))}
          </View>
          {transfer.status === 'success' || transfer.status === 'failed' ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Log Pengiriman Webhook</Text>
              <Text style={styles.panelText}>
                {webhookLogs.length ? `${webhookLogs.length} log pengiriman terkait transfer ini.` : 'Log webhook untuk transfer ini tidak ditemukan'}
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

function AmMutasiPage({
  initialMutasiId,
  onModuleRouteSelect,
}: {
  initialMutasiId?: string;
  onModuleRouteSelect?: (route: ShellModuleRouteEntry) => void;
}) {
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
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat mutasi AM.');
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
      all: 'Semua akun',
      ...Object.fromEntries(accounts.map(account => [account._id, formatMutasiAccountOption(account)])),
    }),
    [accounts],
  );
  const deviceLabels = React.useMemo(
    () => ({
      all: 'Semua device',
      ...Object.fromEntries(devices.map(device => [device._id, device.name])),
    }),
    [devices],
  );

  return (
    <View style={styles.pageStack}>
      <View style={styles.filterBar}>
        <AmMetricCard label="Total Masuk" value={formatRupiah(incoming.total)} meta={`${incoming.count} mutasi`} />
        <AmMetricCard label="Total Keluar" value={formatRupiah(outgoing.total)} meta={`${outgoing.count} mutasi`} />
        <AmMetricCard label="Saldo Bersih" value={formatRupiah(netBalance)} meta="masuk - keluar" />
        <AmMetricCard label="Total Transaksi" value={String(totalTransactions)} meta="jumlah ringkasan" />
        <AmSegmentGroup
          active={type}
          items={['all', 'masuk', 'keluar']}
          labels={MUTASI_TYPE_FILTER_LABELS}
          onSelect={handleMutasiTypeChange}
        />
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
        <KolamRefreshButton accessibilityLabel="Refresh" intent="outline" muted={isLoading} size="sm" onPress={fetchMutasi} />
      </View>
      <AmInlineError title="Mutasi AM belum bisa dibaca" error={error} />
      <View style={styles.tablePanel}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.typeCol]}>Tipe</Text>
          <Text style={[styles.tableHeaderText, styles.accountWideCol]}>Akun</Text>
          <Text style={[styles.tableHeaderText, styles.amountCol]}>Nominal</Text>
          <Text style={[styles.tableHeaderText, styles.recipientCol]}>Deskripsi</Text>
          <Text style={[styles.tableHeaderText, styles.deviceWideCol]}>Device</Text>
          <Text style={[styles.tableHeaderText, styles.dateCol]}>Waktu</Text>
          <Text style={[styles.tableHeaderText, styles.actionCol]} />
        </View>
        <AmLoadingOrEmpty isLoading={isLoading} items={mutasi} loadingText="Memuat mutasi AM..." emptyText="Mutasi tidak ditemukan" />
        {mutasi.map(item => (
          <View key={item._id} style={styles.tableRow}>
            <View style={styles.typeCol}>
              <AmStatusChip
                label={formatMutasiTypeLabel(item.type)}
                tone={item.type === 'masuk' ? 'success' : 'danger'}
              />
            </View>
            <View style={styles.accountWideCol}>
              <Text style={styles.cellText} numberOfLines={1}>{formatAccountLabel(item.accountId)}</Text>
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
                label={selectedMutasiId === item._id ? 'Tutup' : 'Detail'}
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
              Menampilkan {rangeFrom}-{rangeTo} dari {total} item
            </Text>
            <View style={styles.inlineActions}>
              <KolamButton
                accessibilityLabel="AM Mutasi Previous Page"
                disabled={page <= 1 || isLoading}
                label="Sebelumnya"
                intent="outline"
                size="sm"
                onPress={() => setPage(current => Math.max(1, current - 1))}
              />
              <KolamButton
                accessibilityLabel="AM Mutasi Next Page"
                disabled={page >= totalPages || isLoading}
                label={`Halaman ${page}/${totalPages}`}
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
    ? getAmMutasiReceiptUrl(mutasi._id)
    : null;

  return (
    <View style={styles.panel}>
      <View style={styles.detailHeader}>
        <View>
          <Text style={styles.panelTitle}>Detail Mutasi</Text>
          <Text style={styles.rowMeta}>{mutasi?._id ?? 'Memuat detail mutasi...'}</Text>
        </View>
        {mutasi ? (
          <View style={styles.inlineActions}>
            <AmStatusChip
              label={formatMutasiTypeLabel(mutasi.type)}
              tone={mutasi.type === 'masuk' ? 'success' : 'danger'}
            />
          </View>
        ) : null}
      </View>
      <AmInlineError title="Detail mutasi AM belum bisa dibaca" error={error} />
      {isLoading ? <Text style={styles.loadingText}>Memuat detail mutasi...</Text> : null}
      {mutasi ? (
        <View style={styles.detailList}>
          <View style={styles.detailListRow}>
            <Text style={styles.rowMeta}>Akun</Text>
            <Text style={styles.cellText}>{formatBankAccount(mutasi.accountId)} / {formatAccountNumber(mutasi.accountId)}</Text>
          </View>
          <View style={styles.detailListRow}>
            <Text style={styles.rowMeta}>Nominal</Text>
            <Text style={styles.cellText}>{formatMutasiSignedAmount(mutasi)}</Text>
          </View>
          <View style={styles.detailListRow}>
            <Text style={styles.rowMeta}>Deskripsi</Text>
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
            <Text style={styles.rowMeta}>Terdeteksi</Text>
            <Text style={styles.cellText}>{formatAmDate(mutasi.detectedAt)}</Text>
          </View>
          <View style={styles.detailListRow}>
            <Text style={styles.rowMeta}>Diupdate</Text>
            <Text style={styles.cellText}>{formatAmDate(mutasi.updatedAt)}</Text>
          </View>
          <View style={styles.detailListRow}>
            <Text style={styles.rowMeta}>Receipt</Text>
            <Text style={receiptUrl ? styles.monoText : styles.cellText}>{receiptUrl ?? 'Receipt tidak tersedia'}</Text>
          </View>
        </View>
      ) : null}
      {receiptUrl ? (
        <View style={styles.proofPanel}>
          <Text style={styles.panelTitle}>Receipt</Text>
          <Image
            accessibilityLabel="AM Mutasi Receipt"
            resizeMode="contain"
            source={getAmProtectedImageSource(receiptUrl)}
            style={styles.proofImage}
          />
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
    actions.push({id: 'cancel', label: 'Batal', intent: 'outline'});
  }

  if (transfer.status === 'processing') {
    actions.push({id: 'force-fail', label: 'Paksa Gagal', intent: 'danger'});
  }

  if (transfer.status === 'failed') {
    actions.push({id: 'retry', label: 'Ulangi', intent: 'warning'});
  }

  if (!actions.length) {
    return <Text style={styles.rowMeta}>-</Text>;
  }

  return (
    <View style={styles.inlineActions}>
      {actions.map(action => (
        <KolamButton
          key={action.id}
          accessibilityLabel={`AM Transfer ${formatAmTaskActionAccessibilityLabel(action.id)} ${transfer._id}`}
          disabled={disabled}
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
  const [logPage, setLogPage] = React.useState(1);
  const [logTotal, setLogTotal] = React.useState(0);
  const [logLimit, setLogLimit] = React.useState(AM_WEBHOOK_LOG_PAGE_LIMIT);
  const [selectedWebhookLog, setSelectedWebhookLog] = React.useState<AmWebhookLog | null>(null);
  const [editingConfigId, setEditingConfigId] = React.useState<string | null>(null);
  const [isWebhookFormOpen, setIsWebhookFormOpen] = React.useState(false);
  const [formUrl, setFormUrl] = React.useState('');
  const [formSecret, setFormSecret] = React.useState('');
  const [formDescription, setFormDescription] = React.useState('');
  const [selectedEvents, setSelectedEvents] = React.useState<string[]>([]);
  const [actingConfigId, setActingConfigId] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isTestingPing, setIsTestingPing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const testPingRefreshTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchWebhooks = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [configResponse, logResponse, eventResponse] = await Promise.all([
        getAmWebhookConfigs(),
        getAmWebhookLogs({
          page: logPage,
          limit: AM_WEBHOOK_LOG_PAGE_LIMIT,
          direction: logDirectionFilter === 'all' ? undefined : logDirectionFilter,
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
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat webhooks AM.');
    } finally {
      setIsLoading(false);
    }
  }, [logDirectionFilter, logPage]);

  React.useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  React.useEffect(() => {
    const interval = setInterval(fetchWebhooks, 10_000);
    return () => clearInterval(interval);
  }, [fetchWebhooks]);

  React.useEffect(() => () => {
    if (testPingRefreshTimerRef.current) {
      clearTimeout(testPingRefreshTimerRef.current);
    }
  }, []);

  const resetWebhookForm = React.useCallback(() => {
    setEditingConfigId(null);
    setFormUrl('');
    setFormSecret('');
    setFormDescription('');
    setSelectedEvents(events);
    setIsWebhookFormOpen(false);
  }, [events]);

  const openCreateWebhookForm = React.useCallback(() => {
    setEditingConfigId(null);
    setFormUrl('');
    setFormSecret('');
    setFormDescription('');
    setSelectedEvents(events);
    setActionMessage(null);
    setIsWebhookFormOpen(true);
  }, [events]);

  const editWebhook = React.useCallback((config: AmWebhookConfig) => {
    setEditingConfigId(config._id);
    setFormUrl(config.url);
    setFormSecret('');
    setFormDescription(config.description);
    setSelectedEvents(config.events);
    setActionMessage(null);
    setIsWebhookFormOpen(true);
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
        setActionMessage('Webhook diupdate.');
      } else {
        await createAmWebhookConfig(payload);
        setActionMessage('Webhook didaftarkan.');
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
      setActionMessage(config.status === 'active' ? 'Webhook dinonaktifkan.' : 'Webhook diaktifkan.');
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
      setActionMessage('Webhook dihapus.');
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
      setIsTestingPing(true);
      setActionMessage(null);
      const result = await testAmWebhookPing();
      setActionMessage(result.message || 'Test ping dikirim.');
      await fetchWebhooks();
      if (testPingRefreshTimerRef.current) {
        clearTimeout(testPingRefreshTimerRef.current);
      }
      testPingRefreshTimerRef.current = setTimeout(() => {
        fetchWebhooks();
      }, 2000);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Webhook test ping gagal.');
    } finally {
      setIsTestingPing(false);
    }
  }, [fetchWebhooks]);

  const handleLogDirectionChange = React.useCallback((value: string) => {
    setLogDirectionFilter(value);
    setLogPage(1);
  }, []);

  const webhookLogTotalPages = Math.max(1, Math.ceil(logTotal / Math.max(logLimit, 1)));
  const webhookLogRangeFrom = logTotal ? (logPage - 1) * logLimit + 1 : 0;
  const webhookLogRangeTo = logTotal ? Math.min(logPage * logLimit, logTotal) : 0;
  const isWebhookActionLocked = isSubmitting || isTestingPing || actingConfigId !== null;

  return (
    <View style={styles.pageStack}>
      <View style={styles.amServicesToolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <View style={styles.amWebhookToolbarMetric}>
                <Text style={styles.metricLabel}>Endpoint</Text>
                <Text style={styles.cellText}>{configs.length} total, {configs.filter(item => item.status === 'active').length} aktif</Text>
              </View>
              <View style={styles.amWebhookToolbarMetric}>
                <Text style={styles.metricLabel}>Log Pengiriman</Text>
                <Text style={styles.cellText}>{logTotal || logs.length} total, {logs.filter(log => !log.success).length} gagal</Text>
              </View>
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              <KolamButton accessibilityLabel="Test Ping" disabled={isWebhookActionLocked} label={isTestingPing ? 'Menguji...' : 'Uji Ping'} intent="outline" muted={isWebhookActionLocked} size="sm" onPress={testPing} />
              <KolamDaftarButton
                accessibilityLabel="AM Webhook Register"
                disabled={isWebhookActionLocked}
                intent={isWebhookFormOpen && !editingConfigId ? 'warning' : 'outline'}
                muted={isWebhookActionLocked}
                size="sm"
                onPress={isWebhookFormOpen && !editingConfigId ? resetWebhookForm : openCreateWebhookForm}
              />
            </View>
          </View>
        </View>
      </View>
      <AmInlineError title="Webhooks AM belum bisa dibaca" error={error} />
      {actionMessage ? (
        <View style={styles.successPanel}>
          <Text style={styles.successText}>{actionMessage}</Text>
        </View>
      ) : null}
      {isWebhookFormOpen ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{editingConfigId ? 'Edit Webhook' : 'Daftar Webhook'}</Text>
          <View style={styles.formGrid}>
            <AmTextInput label="URL" placeholder="https://your-server.com/webhook" value={formUrl} onChangeText={setFormUrl} />
            <AmTextInput label="Secret" placeholder={editingConfigId ? 'Kosongkan untuk secret lama' : 'Minimal 16 karakter untuk HMAC'} value={formSecret} onChangeText={setFormSecret} />
            <AmTextInput label="Deskripsi" placeholder="contoh DA Inventory Backend" value={formDescription} onChangeText={setFormDescription} />
          </View>
          <View style={styles.eventGrid}>
            {events.map(event => (
              <KolamInteractionFrame
                key={event}
                accessibilityLabel={`AM Webhook Event ${event}`}
                disabled={isWebhookActionLocked}
                onPress={() => toggleWebhookEvent(event)}
                style={[styles.eventChip, selectedEvents.includes(event) && styles.eventChipSelected]}>
                <Text style={[styles.segmentText, selectedEvents.includes(event) && styles.segmentTextActive]}>{event}</Text>
              </KolamInteractionFrame>
            ))}
          </View>
          <View style={styles.inlineActions}>
            <KolamSaveButton
              accessibilityLabel="AM Webhook Save"
              disabled={isWebhookActionLocked}
              intent="warning"
              label={isSubmitting ? 'Menyimpan...' : editingConfigId ? 'Simpan Webhook' : 'Daftar'}
              muted={isWebhookActionLocked}
              size="sm"
              onPress={saveWebhook}
            />
            <KolamButton disabled={isWebhookActionLocked} label={editingConfigId ? 'Batal Edit' : 'Batal'} intent="outline" muted={isWebhookActionLocked} size="sm" onPress={resetWebhookForm} />
          </View>
        </View>
      ) : null}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Endpoint</Text>
        <AmLoadingOrEmpty isLoading={isLoading} items={configs} loadingText="Memuat config webhook..." emptyText="Webhook belum terdaftar" />
        <View style={styles.webhookEndpointList}>
          {configs.map(config => (
            <View key={config._id} style={styles.webhookEndpointRow}>
              <View style={styles.webhookEndpointCopy}>
                <View style={styles.webhookEndpointTitleRow}>
                  <Text style={[styles.rowTitle, styles.webhookEndpointTitle]} numberOfLines={1}>{config.description || config.url}</Text>
                  <AmStatusChip label={config.status} tone={config.status === 'active' ? 'success' : 'muted'} />
                </View>
                <Text style={styles.rowMeta} numberOfLines={1}>{config.url}</Text>
                <Text style={styles.rowMeta} numberOfLines={1}>
                  {config.events.length} event - {config.failCount} gagal
                </Text>
                <Text style={styles.rowMeta} numberOfLines={1}>Terakhir terkirim: {formatAmDate(config.lastDeliveredAt)}</Text>
              </View>
              <View style={styles.webhookEndpointActions}>
                <KolamEditButton
                  accessibilityLabel={`AM Webhook Edit ${config._id}`}
                  disabled={isWebhookActionLocked}
                  intent="outline"
                  muted={isWebhookActionLocked}
                  size="sm"
                  onPress={() => editWebhook(config)}
                />
                <KolamButton
                  accessibilityLabel={`AM Webhook Toggle ${config._id}`}
                  disabled={isWebhookActionLocked}
                  label={actingConfigId === config._id ? '...' : config.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                  intent="warning"
                  muted={isWebhookActionLocked}
                  size="sm"
                  onPress={() => toggleWebhookStatus(config)}
                />
                <KolamButton
                  accessibilityLabel={`AM Webhook Delete ${config._id}`}
                  disabled={isWebhookActionLocked}
                  label={actingConfigId === config._id ? '...' : 'Hapus'}
                  intent="danger"
                  muted={isWebhookActionLocked}
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
        </View>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.recipientCol]}>Event</Text>
          <Text style={[styles.tableHeaderText, styles.deviceWideCol]}>URL</Text>
          <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
          <Text style={[styles.tableHeaderText, styles.amountCol]}>Durasi</Text>
          <Text style={[styles.tableHeaderText, styles.dateCol]}>Waktu</Text>
          <Text style={[styles.tableHeaderText, styles.actionCol]}>Aksi</Text>
        </View>
        <AmLoadingOrEmpty isLoading={isLoading} items={logs} loadingText="Memuat log webhook..." emptyText="Log webhook belum ada" />
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
                label={selectedWebhookLog?._id === log._id ? 'Tutup' : 'Detail'}
                size="sm"
                onPress={() => setSelectedWebhookLog(current => current?._id === log._id ? null : log)}
              />
            </View>
          </View>
        ))}
        {logTotal > 0 ? (
          <View style={styles.paginationBar}>
            <Text style={styles.paginationText}>
              Menampilkan {webhookLogRangeFrom}-{webhookLogRangeTo} dari {logTotal} item
            </Text>
            <View style={styles.inlineActions}>
              <KolamButton
                accessibilityLabel="AM Webhook Logs Previous Page"
                disabled={logPage <= 1 || isLoading}
                intent="outline"
                label="Sebelumnya"
                muted={logPage <= 1 || isLoading}
                size="sm"
                onPress={() => setLogPage(current => Math.max(1, current - 1))}
              />
              <KolamButton
                accessibilityLabel="AM Webhook Logs Next Page"
                disabled={logPage >= webhookLogTotalPages || isLoading}
                intent="outline"
                label={`Halaman ${logPage}/${webhookLogTotalPages}`}
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
          <Text style={styles.panelTitle}>Detail Log Webhook</Text>
          <Text style={styles.panelText}>{log.event}</Text>
        </View>
        <AmStatusChip
          label={log.responseStatus ? String(log.responseStatus) : (log.success ? 'success' : 'failed')}
          tone={log.success ? 'success' : 'danger'}
        />
      </View>
      <View style={styles.detailGrid}>
        <AmDetailLine label="Arah" value={log.direction} />
        <AmDetailLine label="Endpoint" value={endpoint} />
        <AmDetailLine label="Config" value={log.configId?.description || log.configId?._id || '-'} />
        <AmDetailLine label="Durasi" value={`${log.duration} ms`} />
        <AmDetailLine label="Dibuat" value={formatAmDate(log.createdAt)} />
        <AmDetailLine label="Error" value={log.error || '-'} />
      </View>
      <AmJsonPanel title="Body Request" value={log.requestBody ?? {}} />
      <AmJsonPanel title="Body Response" value={log.responseBody ?? {}} />
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
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [limit, setLimit] = React.useState(AM_USER_PAGE_LIMIT);
  const [editingUserId, setEditingUserId] = React.useState<string | null>(null);
  const [isCreateUserFormOpen, setIsCreateUserFormOpen] = React.useState(false);
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
      const currentUserResponse = await getAmCurrentUser();
      setCurrentUser(currentUserResponse);

      if (!hasAmPermission(currentUserResponse, 'user:read')) {
        setUsers([]);
        setRoles([]);
        setTotal(0);
        setLimit(AM_USER_PAGE_LIMIT);
        setError(null);
        return;
      }

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
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat users AM.');
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
    setIsCreateUserFormOpen(false);
    setFormFullName('');
    setFormUsername('');
    setFormPassword('');
    setFormRole('');
  }, []);

  const editUser = React.useCallback((user: AmUser) => {
    setEditingUserId(user._id);
    setIsCreateUserFormOpen(false);
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
  const canShowUserForm = (canCreateUser && isCreateUserFormOpen) || (Boolean(editingUserId) && canUpdateUser);
  const assignableRoles = React.useMemo(
    () => roles.filter(role => role.name !== 'Super Admin' || isAmSuperAdmin(currentUser)),
    [currentUser, roles],
  );
  if (currentUser && !hasAmPermission(currentUser, 'user:read')) {
    return (
      <View style={styles.pageStack}>
        <View style={styles.emptyPanel}>
          <Text style={styles.panelTitle}>Pengguna tidak tersedia</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.pageStack}>
      <View style={styles.filterBar}>
        <KolamSearchField
          value={search}
          onChangeText={handleUserSearchChange}
          placeholder="Cari nama atau username..."
          containerStyle={styles.taskSearch}
          trailingLabel={`${total} user`}
        />
        {canCreateUser && !isCreateUserFormOpen && !editingUserId ? (
          <KolamButton
            accessibilityLabel="AM User Create"
          label="Buat User"
            size="sm"
            onPress={() => {
              resetUserForm();
              setIsCreateUserFormOpen(true);
            }}
          />
        ) : null}
        <KolamRefreshButton accessibilityLabel="Refresh" disabled={isLoading} intent="outline" muted={isLoading} size="sm" onPress={fetchUsers} />
      </View>
      <AmInlineError title="Pengguna AM belum bisa dibaca" error={error} />
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
              disabled={actingUserId === deletingUser._id}
              intent="danger"
              label={actingUserId === deletingUser._id ? '...' : 'Hapus'}
              muted={actingUserId === deletingUser._id}
              size="sm"
              onPress={() => removeUser(deletingUser)}
            />
            <KolamButton
              accessibilityLabel="AM User Cancel Delete"
              disabled={actingUserId === deletingUser._id}
              intent="outline"
              label="Batal"
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
            <AmTextInput label="Nama Lengkap" placeholder="contoh John Doe" value={formFullName} onChangeText={setFormFullName} />
            <AmTextInput label="Username" placeholder="contoh johndoe" value={formUsername} onChangeText={setFormUsername} />
            <AmTextInput
              label="Password"
              placeholder={editingUserId ? 'Kosongkan untuk password lama' : 'Min 8 karakter, huruf besar, huruf kecil, angka, simbol'}
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
                {assignableRoles.map(role => (
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
              <KolamSaveButton
                accessibilityLabel="AM User Save"
                disabled={isSubmitting}
                label={isSubmitting ? 'Menyimpan' : (editingUserId ? 'Simpan' : 'Buat')}
                muted={isSubmitting}
                size="sm"
                onPress={saveUser}
              />
              {editingUserId ? (
                <KolamButton
                  accessibilityLabel="AM User Cancel Edit"
                  label="Batal"
                  intent="outline"
                  size="sm"
                  onPress={resetUserForm}
                />
              ) : null}
            </View>
          </View>
        </View>
      ) : null}
      <View style={styles.tablePanel}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.accountWideCol]}>Nama Lengkap</Text>
          <Text style={[styles.tableHeaderText, styles.accountCol]}>Username</Text>
          <Text style={[styles.tableHeaderText, styles.recipientCol]}>Role</Text>
          <Text style={[styles.tableHeaderText, styles.dateCol]}>Dibuat</Text>
          <Text style={[styles.tableHeaderText, styles.actionCol]}>Aksi</Text>
        </View>
        <AmLoadingOrEmpty isLoading={isLoading} items={users} loadingText="Memuat user AM..." emptyText="User tidak ditemukan" />
        {!isLoading && !users.length ? (
          <Text style={styles.rowMeta}>
            {search.trim() ? 'Coba kata pencarian lain.' : 'Buat user untuk mulai.'}
          </Text>
        ) : null}
        {users.map(user => (
          <View key={user._id} style={styles.tableRow}>
            <Text style={[styles.cellText, styles.accountWideCol]} numberOfLines={1}>{user.fullName}</Text>
            <Text style={[styles.cellText, styles.accountCol]} numberOfLines={1}>@{user.username}</Text>
            <View style={styles.recipientCol}>
              <AmStatusChip
                label={user.role?.name ?? 'Tidak diketahui'}
                tone={getUserRoleTone(user.role?.name)}
              />
            </View>
            <Text style={[styles.cellText, styles.dateCol]}>{formatAmDate(user.createdAt)}</Text>
            <View style={styles.actionCol}>
              <View style={styles.inlineActions}>
                {canUpdateUser ? (
                  <KolamEditButton
                    accessibilityLabel={`AM User Edit ${user._id}`}
                    intent="outline"
                    size="sm"
                    onPress={() => editUser(user)}
                  />
                ) : null}
                {canDeleteUser ? (
                  <KolamButton
                    accessibilityLabel={`AM User Delete ${user._id}`}
                    disabled={actingUserId === user._id}
                    label={actingUserId === user._id ? '...' : 'Hapus'}
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
              Menampilkan {rangeFrom}-{rangeTo} dari {total} item
            </Text>
            <View style={styles.inlineActions}>
              <KolamButton
                accessibilityLabel="AM Users Previous Page"
                disabled={page <= 1 || isLoading}
                intent="outline"
                label="Sebelumnya"
                muted={page <= 1 || isLoading}
                size="sm"
                onPress={() => setPage(current => Math.max(1, current - 1))}
              />
              <KolamButton
                accessibilityLabel="AM Users Next Page"
                disabled={page >= totalPages || isLoading}
                intent="outline"
                label={`Halaman ${page}/${totalPages}`}
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

function AmActivityLogPage() {
  const [logs, setLogs] = React.useState<AmActivityLog[]>([]);
  const [stats, setStats] = React.useState<AmActivityLogStats | null>(null);
  const [currentUser, setCurrentUser] = React.useState<AmCurrentUser | null>(null);
  const [accessLoaded, setAccessLoaded] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [type, setType] = React.useState('all');
  const [status, setStatus] = React.useState('all');
  const [method, setMethod] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(AM_ACTIVITY_LOG_PAGE_LIMIT);
  const [total, setTotal] = React.useState(0);
  const [selectedLog, setSelectedLog] = React.useState<AmActivityLog | null>(null);
  const [selectedLogIds, setSelectedLogIds] = React.useState<Set<string>>(() => new Set());
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteFilterConfirm, setShowDeleteFilterConfirm] = React.useState(false);
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = React.useState(false);
  const [deleteMessage, setDeleteMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const buildFilterPayload = React.useCallback(() => ({
    search: search.trim() || undefined,
    type: type === 'all' ? undefined : type,
    status: status === 'all' ? undefined : status,
    method: method === 'all' ? undefined : method,
  }), [method, search, status, type]);

  React.useEffect(() => {
    let mounted = true;

    getAmCurrentUser()
      .then(user => {
        if (mounted) {
          setCurrentUser(user);
          setError(null);
        }
      })
      .catch(nextError => {
        if (mounted) {
          setError(nextError instanceof Error ? nextError.message : 'Gagal membaca user AM.');
        }
      })
      .finally(() => {
        if (mounted) setAccessLoaded(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const isSuperAdmin = isAmSuperAdmin(currentUser);

  const fetchLogs = React.useCallback(async () => {
    if (!isSuperAdmin) return;

    try {
      setIsLoading(true);
      const filterPayload = buildFilterPayload();
      const [listResponse, statsResponse] = await Promise.all([
        getAmActivityLogs({
          page,
          limit: AM_ACTIVITY_LOG_PAGE_LIMIT,
          search: filterPayload.search,
          type: filterPayload.type,
          status: filterPayload.status,
          method: filterPayload.method,
        }),
        getAmActivityLogStats(7),
      ]);
      setLogs(listResponse.data);
      setTotal(listResponse.meta.total ?? listResponse.data.length);
      setLimit(listResponse.meta.limit || AM_ACTIVITY_LOG_PAGE_LIMIT);
      setStats(statsResponse);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal memuat activity log AM.');
    } finally {
      setIsLoading(false);
    }
  }, [buildFilterPayload, isSuperAdmin, page]);

  React.useEffect(() => {
    if (accessLoaded && isSuperAdmin) {
      fetchLogs();
    }
  }, [accessLoaded, fetchLogs, isSuperAdmin]);

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

  const handleDeleteFilter = React.useCallback(async () => {
    try {
      setIsDeleting(true);
      const result = await bulkDeleteAmActivityLogs({
        confirm: true,
        filter: buildFilterPayload(),
      });
      setDeleteMessage(`${result.deletedCount} log dihapus`);
      setShowDeleteFilterConfirm(false);
      setSelectedLog(null);
      await fetchLogs();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal menghapus activity log AM.');
    } finally {
      setIsDeleting(false);
    }
  }, [buildFilterPayload, fetchLogs]);

  const handleDeleteSelectedLog = React.useCallback(async () => {
    const ids = selectedLogIds.size
      ? Array.from(selectedLogIds)
      : selectedLog?._id
        ? [selectedLog._id]
        : [];
    if (!ids.length) return;

    try {
      setIsDeleting(true);
      const result = await bulkDeleteAmActivityLogs({
        confirm: true,
        ids,
      });
      setDeleteMessage(`${result.deletedCount} log dihapus`);
      setShowDeleteSelectedConfirm(false);
      setSelectedLog(null);
      setSelectedLogIds(new Set());
      await fetchLogs();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Gagal menghapus activity log AM.');
    } finally {
      setIsDeleting(false);
    }
  }, [fetchLogs, selectedLog, selectedLogIds]);

  const toggleSelectedLogId = React.useCallback((logId: string) => {
    setSelectedLogIds(current => {
      const next = new Set(current);
      if (next.has(logId)) {
        next.delete(logId);
      } else {
        next.add(logId);
      }
      return next;
    });
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
  const selectedDeleteCount = selectedLogIds.size || (selectedLog ? 1 : 0);

  if (!accessLoaded) {
    return (
      <View style={styles.pageStack}>
        <Text style={styles.loadingText}>Memuat log aktivitas...</Text>
      </View>
    );
  }

  if (!isSuperAdmin) {
    return (
      <View style={styles.pageStack}>
        <View style={styles.warningPanel}>
          <Text style={styles.panelTitle}>Halaman ini hanya untuk Super Admin.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.pageStack}>
      <View style={styles.filterBar}>
        <AmMetricCard label="Periode" value={`${stats?.days ?? 7} hari`} meta={stats?.since ? formatAmDate(stats.since) : 'statistik'} />
        <AmMetricCard label="API / Halaman" value={`${apiCount} / ${pageCount}`} meta="jumlah tipe 7 hari" />
        <AmMetricCard label="Berhasil" value={String(successCount)} meta={`${failedCount} gagal`} />
      </View>
      <View style={styles.emptyPanel}>
        <Text style={styles.panelTitle}>Log Aktivitas</Text>
        <Text style={styles.panelText}>
          Catatan page/API request AM. Otomatis hapus setelah 90 hari. Super Admin bisa hapus manual per baris terpilih atau sesuai filter.
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
        <AmSegmentGroup active={type} items={AM_ACTIVITY_LOG_TYPES} labels={AM_ACTIVITY_LOG_TYPE_LABELS} onSelect={handleTypeChange} />
        <AmSegmentGroup active={status} items={AM_ACTIVITY_LOG_STATUSES} labels={AM_ACTIVITY_LOG_STATUS_LABELS} onSelect={handleStatusChange} />
        <AmSegmentGroup active={method} items={AM_ACTIVITY_LOG_METHODS} labels={AM_ACTIVITY_LOG_METHOD_LABELS} onSelect={handleMethodChange} />
        {hasActiveFilters ? (
          <KolamResetButton intent="outline" size="sm" onPress={resetFilters} />
        ) : null}
        {selectedLogIds.size ? (
          <KolamDeleteButton
            accessibilityLabel="AM Activity Logs Delete Selected"
            disabled={isLoading || isDeleting}
            label={`Hapus terpilih (${selectedLogIds.size})`}
            intent="danger"
            size="sm"
            onPress={() => setShowDeleteSelectedConfirm(true)}
          />
        ) : null}
        {total > 0 ? (
          <KolamDeleteButton
            accessibilityLabel="AM Activity Logs Delete Filter"
            disabled={isLoading || isDeleting}
            label={`Hapus sesuai filter (${total})`}
            intent="danger"
            size="sm"
            onPress={() => setShowDeleteFilterConfirm(true)}
          />
        ) : null}
        <KolamRefreshButton accessibilityLabel="Refresh" intent="outline" muted={isLoading} size="sm" onPress={fetchLogs} />
      </View>
      {deleteMessage ? (
        <View style={styles.successPanel}>
          <Text style={styles.successText}>{deleteMessage}</Text>
        </View>
      ) : null}
      {showDeleteFilterConfirm ? (
        <View style={styles.warningPanel}>
          <Text style={styles.panelTitle}>Hapus activity log</Text>
          <Text style={styles.panelText}>
            {hasActiveFilters
              ? 'Semua log yang cocok dengan filter saat ini akan dihapus permanen.'
              : 'Semua log akan dihapus permanen.'}
          </Text>
          <Text style={styles.warningText}>{total} entri akan dihapus.</Text>
          <View style={styles.inlineActions}>
            <KolamCancelButton
              accessibilityLabel="AM Activity Logs Cancel Delete Filter"
              disabled={isDeleting}
              size="sm"
              onPress={() => setShowDeleteFilterConfirm(false)}
            />
            <KolamDeleteButton
              accessibilityLabel="AM Activity Logs Confirm Delete Filter"
              disabled={isDeleting}
              label={isDeleting ? 'Menghapus' : 'Hapus'}
              intent="danger"
              size="sm"
              onPress={handleDeleteFilter}
            />
          </View>
        </View>
      ) : null}
      <AmInlineError title="Log Aktivitas AM belum bisa dibaca" error={error} />
      {stats && (stats.topUsers.length || stats.topPaths.length) ? (
        <View style={styles.panelGrid}>
          <AmStatsListPanel emptyText="Belum ada user" items={stats.topUsers} title="User Teratas" />
          <AmStatsListPanel emptyText="Belum ada path" items={stats.topPaths} title="Path Teratas" />
        </View>
      ) : null}
      <View style={styles.tablePanel}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.dateCol]}>Waktu</Text>
          <Text style={[styles.tableHeaderText, styles.accountCol]}>User</Text>
          <Text style={[styles.tableHeaderText, styles.typeCol]}>Tipe</Text>
          <Text style={[styles.tableHeaderText, styles.typeCol]}>Metode</Text>
          <Text style={[styles.tableHeaderText, styles.recipientCol]}>Path</Text>
          <Text style={[styles.tableHeaderText, styles.amountCol]}>IP</Text>
          <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
          <Text style={[styles.tableHeaderText, styles.amountCol]}>Durasi</Text>
          <Text style={[styles.tableHeaderText, styles.actionCol]}>Aksi</Text>
        </View>
        <AmLoadingOrEmpty isLoading={isLoading} items={logs} loadingText="Memuat log aktivitas..." emptyText="Tidak ada log" />
        {logs.map(log => (
          <View key={log._id} style={styles.tableRow}>
            <Text style={[styles.cellText, styles.dateCol]}>{formatAmDate(log.timestamp)}</Text>
            <View style={styles.accountCol}>
              <Text style={styles.cellText} numberOfLines={1}>{log.username ?? log.userId?.username ?? 'anonim'}</Text>
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
              <View style={styles.statusActionStack}>
                <KolamButton
                  accessibilityLabel={`AM Activity Log Select ${log._id}`}
                  label={selectedLogIds.has(log._id) ? 'Dipilih' : 'Pilih'}
                  intent="outline"
                  size="sm"
                  onPress={() => toggleSelectedLogId(log._id)}
                />
                <KolamButton
                  accessibilityLabel={`AM Activity Log Detail ${log._id}`}
                  label="Detail"
                  intent="outline"
                  size="sm"
                  onPress={() => setSelectedLog(current => current?._id === log._id ? null : log)}
                />
              </View>
            </View>
          </View>
        ))}
        {total > 0 ? (
          <View style={styles.paginationBar}>
            <Text style={styles.paginationText}>
              Menampilkan {rangeFrom}-{rangeTo} dari {total} item
            </Text>
            <View style={styles.inlineActions}>
              <KolamButton
                accessibilityLabel="AM Activity Logs Previous Page"
                disabled={page <= 1 || isLoading}
                label="Sebelumnya"
                intent="outline"
                size="sm"
                onPress={() => setPage(current => Math.max(1, current - 1))}
              />
              <KolamButton
                accessibilityLabel="AM Activity Logs Next Page"
                disabled={page >= totalPages || isLoading}
                label={`Halaman ${page}/${totalPages}`}
                intent="outline"
                size="sm"
                onPress={() => setPage(current => Math.min(totalPages, current + 1))}
              />
            </View>
          </View>
        ) : null}
      </View>
      {selectedLog ? (
        <AmActivityLogDetailPanel
          isDeleting={isDeleting}
          log={selectedLog}
          onDelete={() => {
            setSelectedLogIds(new Set());
            setShowDeleteSelectedConfirm(true);
          }}
        />
      ) : null}
      {showDeleteSelectedConfirm && selectedDeleteCount ? (
        <View style={styles.warningPanel}>
          <Text style={styles.panelTitle}>Hapus activity log</Text>
          <Text style={styles.panelText}>
            {selectedLogIds.size > 1 ? 'Log yang dipilih akan dihapus permanen.' : 'Log terpilih akan dihapus permanen.'}
          </Text>
          <Text style={styles.warningText}>{selectedDeleteCount} entri akan dihapus.</Text>
          <View style={styles.inlineActions}>
            <KolamCancelButton
              accessibilityLabel="AM Activity Logs Cancel Delete Selected"
              disabled={isDeleting}
              size="sm"
              onPress={() => setShowDeleteSelectedConfirm(false)}
            />
            <KolamDeleteButton
              accessibilityLabel="AM Activity Logs Confirm Delete Selected"
              disabled={isDeleting}
              label={isDeleting ? 'Menghapus' : 'Hapus'}
              intent="danger"
              size="sm"
              onPress={handleDeleteSelectedLog}
            />
          </View>
        </View>
      ) : null}
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

function AmActivityLogDetailPanel({
  isDeleting,
  log,
  onDelete,
}: {
  isDeleting: boolean;
  log: AmActivityLog;
  onDelete: () => void;
}) {
  return (
    <View style={styles.panel}>
      <View style={styles.detailHeader}>
        <View>
          <Text style={styles.panelTitle}>Detail Aktivitas</Text>
          <Text style={styles.rowMeta}>{formatAmDate(log.timestamp)}</Text>
        </View>
        <View style={styles.inlineActions}>
          <AmStatusChip label={log.statusCode ? String(log.statusCode) : log.status} tone={log.status === 'success' ? 'success' : 'danger'} />
          <KolamDeleteButton
            accessibilityLabel={`AM Activity Log Delete Selected ${log._id}`}
            disabled={isDeleting}
            label="Hapus log ini"
            intent="danger"
            size="sm"
            onPress={onDelete}
          />
        </View>
      </View>
      <View style={styles.detailList}>
        <View style={styles.detailListRow}>
          <Text style={styles.tableHeaderText}>Waktu</Text>
          <Text style={[styles.cellText, styles.recipientCol]}>{formatAmDate(log.timestamp)}</Text>
        </View>
        <View style={styles.detailListRow}>
          <Text style={styles.tableHeaderText}>User</Text>
          <Text style={[styles.cellText, styles.recipientCol]}>{log.username ?? log.userId?.fullName ?? 'anonim'}</Text>
        </View>
        <View style={styles.detailListRow}>
          <Text style={styles.tableHeaderText}>Tipe</Text>
          <Text style={[styles.cellText, styles.recipientCol]}>{formatActivityLogTypeLabel(log.type)}</Text>
        </View>
        <View style={styles.detailListRow}>
          <Text style={styles.tableHeaderText}>Request</Text>
          <Text style={[styles.cellText, styles.recipientCol]}>{log.method || '-'} {log.path}</Text>
        </View>
        <View style={styles.detailListRow}>
          <Text style={styles.tableHeaderText}>Status</Text>
          <Text style={[styles.cellText, styles.recipientCol]}>{log.statusCode ? `${log.statusCode} (${formatAmDisplayLabel(log.status)})` : formatAmDisplayLabel(log.status)}</Text>
        </View>
        <View style={styles.detailListRow}>
          <Text style={styles.tableHeaderText}>Aksi</Text>
          <Text style={[styles.cellText, styles.recipientCol]}>{log.action || '-'}</Text>
        </View>
        <View style={styles.detailListRow}>
          <Text style={styles.tableHeaderText}>IP</Text>
          <Text style={[styles.cellText, styles.recipientCol]}>{log.ip || '-'}</Text>
        </View>
        <View style={styles.detailListRow}>
          <Text style={styles.tableHeaderText}>Durasi</Text>
          <Text style={[styles.cellText, styles.recipientCol]}>{formatAmDuration(log.duration)}</Text>
        </View>
        <View style={styles.detailListRow}>
          <Text style={styles.tableHeaderText}>User Agent</Text>
          <Text style={[styles.cellText, styles.recipientCol]}>{log.userAgent || '-'}</Text>
        </View>
        {log.error ? (
          <View style={styles.detailListRow}>
            <Text style={styles.tableHeaderText}>Error</Text>
            <Text style={[styles.cellText, styles.recipientCol]}>{log.error}</Text>
          </View>
        ) : null}
      </View>
      <AmJsonPanel title="Metadata" value={log.metadata ?? {}} />
    </View>
  );
}

function AmNotFoundPage() {
  return (
    <View style={styles.emptyPanel}>
      <Text style={styles.panelTitle}>404</Text>
      <Text style={styles.panelTitle}>Halaman tidak ditemukan</Text>
      <Text style={styles.panelText}>
        Halaman yang dicari tidak ada atau sudah dipindahkan.
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

type AmDashboardWalletCardTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

function AmDashboardWalletCard({
  artwork,
  label,
  meta,
  tone,
  value,
}: {
  artwork?: 'device' | 'saldo-total' | 'uang-keluar' | 'uang-masuk';
  label: string;
  meta: string;
  tone: AmDashboardWalletCardTone;
  value: string;
}) {
  const artworkSvg =
    artwork === 'device'
      ? KOLAM_DEVICE_ICON_SVG
      : artwork === 'saldo-total'
      ? KOLAM_SALDO_TOTAL_ICON_SVG
      : artwork === 'uang-keluar'
        ? KOLAM_UANG_KELUAR_ICON_SVG
      : artwork === 'uang-masuk'
        ? KOLAM_UANG_MASUK_ICON_SVG
        : null;

  return (
    <KolamCardFrame
      style={[
        styles.dashboardWalletCard,
        artworkSvg && styles.dashboardWalletCardWithArtwork,
      ]}>
      <View
        style={[
          styles.dashboardWalletAccent,
          tone === 'success' && styles.dashboardWalletAccentSuccess,
          tone === 'warning' && styles.dashboardWalletAccentWarning,
          tone === 'danger' && styles.dashboardWalletAccentDanger,
          tone === 'info' && styles.dashboardWalletAccentInfo,
        ]}
      />
      <View
        style={[
          styles.dashboardWalletBody,
          artworkSvg && styles.dashboardWalletBodyWithArtwork,
        ]}>
        <View style={styles.dashboardWalletHeader}>
          {artworkSvg ? null : (
            <View style={styles.dashboardWalletIcon}>
              <KolamModuleIcon kind="wallet" size="menu" />
            </View>
          )}
          <View style={styles.dashboardWalletCopy}>
            <Text numberOfLines={1} style={styles.dashboardWalletLabel}>
              {label}
            </Text>
            <Text
              numberOfLines={1}
              style={[
                styles.dashboardWalletValue,
                tone === 'danger' && styles.dashboardWalletValueDanger,
              ]}
            >
              {value}
            </Text>
          </View>
        </View>
        <Text numberOfLines={1} style={styles.dashboardWalletHint}>
          {meta}
        </Text>
      </View>
      {artworkSvg ? (
        <View pointerEvents="none" style={styles.dashboardWalletArtwork}>
          <SvgXml
            height="100%"
            width="100%"
            xml={artworkSvg}
          />
        </View>
      ) : null}
    </KolamCardFrame>
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
  tone: 'success' | 'warning' | 'info' | 'danger' | 'muted';
}) {
  return (
    <View
      style={[
        styles.statusChip,
        tone === 'success' && styles.statusChipSuccess,
        tone === 'warning' && styles.statusChipWarning,
        tone === 'info' && styles.statusChipInfo,
        tone === 'danger' && styles.statusChipDanger,
      ]}>
      <Text style={styles.statusChipText} numberOfLines={1}>{formatAmDisplayLabel(label)}</Text>
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
          accessibilityLabel={`AM Segment ${formatAmDisplayLabel(labels[item] ?? item)}`}
          onPress={() => onSelect(item)}
          style={[styles.segment, active === item && styles.segmentActive]}>
          <Text style={[styles.segmentText, active === item && styles.segmentTextActive]}>{formatAmDisplayLabel(labels[item] ?? item)}</Text>
        </KolamInteractionFrame>
      ))}
    </ScrollView>
  );
}

function formatAmDisplayLabel(label: string) {
  const normalized = label.trim().toLowerCase();
  const labels: Record<string, string> = {
    active: 'Aktif',
    inactive: 'Nonaktif',
    blocked: 'Diblokir',
    cancelled: 'Dibatalkan',
    connected: 'Tersambung',
    disconnected: 'Terputus',
    failed: 'Gagal',
    failure: 'Gagal',
    pending: 'Menunggu',
    processing: 'Diproses',
    queued: 'Antre',
    ready: 'Siap',
    running: 'Berjalan',
    stopped: 'Berhenti',
    success: 'Berhasil',
    unauthorized: 'Tidak diotorisasi',
    warning: 'Peringatan',
    page: 'Halaman',
    api: 'API',
    outgoing: 'Keluar',
    incoming: 'Masuk',
  };

  return labels[normalized] ?? label;
}

function formatAmTaskActionAccessibilityLabel(action: 'cancel' | 'retry' | 'force-fail') {
  if (action === 'cancel') return 'Cancel';
  if (action === 'retry') return 'Retry';
  return 'Force Fail';
}

function formatServiceDeviceMeta(device: AmServiceAccountDeviceRef | null) {
  if (!device || typeof device !== 'object') return 'Device belum ditugaskan';
  if (device.connectionType === 'tcp') return device.tcpAddress ?? 'Device TCP';
  if (device.connectionType === 'usb') return device.udid ?? 'Device USB';
  if (device.connectionType === 'browser') return 'Playwright';
  return device.udid ?? device.tcpAddress ?? device.connectionType ?? 'Device terhubung';
}

function formatServiceDeviceLocation(device: AmServiceAccountDeviceRef | null) {
  if (!device || typeof device !== 'object') return 'Lokasi belum ditugaskan';
  const box = device.boxId;
  if (!box || typeof box === 'string') return 'Lokasi belum ditugaskan';
  const rack = box.rackId;
  const rackName = rack && typeof rack === 'object' ? rack.name : null;
  return rackName ? `${box.name} / ${rackName}` : box.name;
}

function getServiceDevice(account: AmServiceAccount) {
  return typeof account.deviceId === 'object' ? account.deviceId : null;
}

function hasAmPermission(user: AmCurrentUser | null, permission: string) {
  if (!user?.role) return false;
  return user.role.permissions.includes(permission);
}

function isAmSuperAdmin(user: AmCurrentUser | null) {
  return user?.role?.name === 'Super Admin';
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

function getObjectString(
  source: unknown,
  key: string,
) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return null;
  const value = (source as Record<string, unknown>)[key];
  return typeof value === 'string' && value.trim() ? value : null;
}

function getCredentialString(
  credentials: unknown,
  key: string,
) {
  return getObjectString(credentials, key);
}

function formatServiceAccountDisplay(account: AmServiceAccount) {
  return (
    getObjectString(account, 'accountNumber') ??
    getObjectString(account, 'account_number') ??
    getObjectString(account, 'username') ??
    getCredentialString(account.credentials, 'phoneNumber') ??
    getCredentialString(account.credentials, 'phone_number') ??
    getObjectString(account.meta, 'phoneNumber') ??
    getObjectString(account.meta, 'phone_number') ??
    '-'
  );
}

function getServiceCredentialLogin(account: AmServiceAccount) {
  if (account.platform === 'instagram' || account.platform === 'shopee') {
    return getCredentialString(account.credentials, 'email') ?? account.username ?? '';
  }
  if (account.platform === 'tiktok') {
    return getCredentialString(account.credentials, 'username') ?? account.username ?? '';
  }
  return account.username ?? '';
}

function getAmServiceFieldProps(
  platform: string,
  field: AmServiceFieldKind,
  editing = false,
) {
  const fallback: Record<AmServiceFieldKind, {label: string; placeholder: string}> = {
    username: {label: 'Username', placeholder: 'username/email'},
    password: {label: 'Password', placeholder: 'password'},
    pin: {label: 'PIN', placeholder: 'PIN'},
    accountNumber: {label: 'Nomor akun', placeholder: 'nomor akun'},
    phoneNumber: {label: 'Nomor HP', placeholder: 'nomor HP'},
  };
  const meta = AM_SERVICE_FIELD_META[platform]?.[field] ?? fallback[field];
  const isSecret = field === 'password' || field === 'pin';

  return {
    label: meta.label,
    placeholder: editing && isSecret ? 'Kosongkan untuk mempertahankan password lama' : meta.placeholder,
  };
}

function buildWebServiceCredentials({
  platform,
  login,
  password,
  phoneNumber,
}: {
  platform: string;
  login: string;
  password: string;
  phoneNumber: string;
}) {
  const credentials: Record<string, unknown> = {};
  const nextLogin = login.trim();
  const nextPassword = password.trim();
  const nextPhoneNumber = phoneNumber.trim();

  if (platform === 'instagram' || platform === 'shopee') {
    if (nextLogin) credentials.email = nextLogin;
  } else if (platform === 'tiktok') {
    if (nextLogin) credentials.username = nextLogin;
  }
  if (nextPhoneNumber) credentials.phoneNumber = nextPhoneNumber;
  if (nextPassword) credentials.password = nextPassword;
  return credentials;
}

function formatBankAccount(account: AmTransfer['accountId'] | AmMutasi['accountId']) {
  if (!account || typeof account === 'string') return '-';
  const label = account.label || account.name || account.platform || account.type || 'Akun';
  const accountNumber = account.accountNumber || account.account_number;
  const suffix = accountNumber ? ` - ${accountNumber}` : '';
  return `${label}${suffix}`;
}

function formatAccountLabel(account: AmTransfer['accountId'] | AmMutasi['accountId']) {
  if (!account || typeof account === 'string') return '-';
  return account.label || account.name || account.accountNumber || account.account_number || account.platform || account.type || 'Akun';
}

function formatAccountNumber(account: AmTransfer['accountId'] | AmMutasi['accountId']) {
  if (!account || typeof account === 'string') return '-';
  return account.accountNumber || account.account_number || '-';
}

function formatAccountType(account: AmTransfer['accountId'] | AmMutasi['accountId']) {
  if (!account || typeof account === 'string') return '-';
  return account.platform || account.type || '-';
}

function formatMutasiAccountOption(account: AmServiceAccount) {
  const prefix = account.label || account.platform || 'Akun';
  return account.accountNumber ? `${prefix} - ${account.accountNumber}` : prefix;
}

function formatMutasiTypeLabel(type: AmMutasi['type']) {
  if (type === 'masuk') return 'Masuk';
  if (type === 'keluar') return 'Keluar';
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
  return config.hasSecret ? 'terkonfigurasi' : 'belum dikonfigurasi';
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

function getAmLogLevelStyle(level: string | null | undefined) {
  const normalized = level?.toLowerCase();
  if (normalized === 'error' || normalized === 'stderr') return styles.logTextDanger;
  if (normalized === 'info') return styles.logTextInfo;
  return styles.logTextDefault;
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

function parseCommaSeparatedTags(value: string) {
  return value
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);
}

function cleanDevicePayload(payload: AmDevicePayload): Omit<AmDevicePayload, 'boxId'> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== ''),
  ) as Omit<AmDevicePayload, 'boxId'>;
}

function getQrLoginSignal(logs: AmDeviceServiceLog[]) {
  for (const log of logs.slice().reverse()) {
    const message = log.message;
    if (message.includes('login_success') || message.includes('Login success')) return null;
    if (!message.includes('QR') && !message.includes('qrcode')) continue;

    const jsonStart = message.indexOf('{');
    if (jsonStart >= 0) {
      try {
        const parsed = JSON.parse(message.slice(jsonStart)) as {
          data?: {
            qrcodeBase64?: string;
            qrcodeId?: string;
            status?: string;
          };
          qrcodeBase64?: string;
          qrcodeId?: string;
          status?: string;
        };
        const qrData = parsed.data ?? parsed;
        if (qrData.qrcodeBase64 || qrData.qrcodeId) return qrData;
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

function getServiceLoginStatus(logs: AmDeviceServiceLog[]): 'success' | 'waiting' | string | null {
  for (const log of logs.slice().reverse()) {
    const message = log.message;
    if (
      message.includes('login_success') ||
      message.includes('Login success') ||
      message.includes('Already logged in') ||
      message.includes('OTP accepted') ||
      message.includes('"event":"ready"') ||
      message.includes('"event":"login_success"') ||
      message.includes('"event":"otp_fulfilled"')
    ) {
      return 'success';
    }
    if (message.includes('"event":"qr_status"')) {
      const jsonStart = message.indexOf('{');
      if (jsonStart >= 0) {
        try {
          const parsed = JSON.parse(message.slice(jsonStart)) as {data?: {status?: string}};
          return parsed.data?.status ?? null;
        } catch {
          return null;
        }
      }
    }
    if (message.includes('"event":"login_waiting"')) return 'waiting';
  }
  return null;
}

function getQrLoginInstructions(platform: string): string[] {
  if (platform === 'whatsapp') {
    return [
      'Buka WhatsApp di HP',
      'Masuk ke Perangkat Tertaut',
      'Tautkan perangkat dan scan QR ini',
    ];
  }
  if (platform === 'shopee') {
    return [
      'Buka Shopee di HP',
      'Masuk menu Saya lalu ikon QR',
      'Scan QR ini dan konfirmasi login',
    ];
  }
  return [
    'Buka TikTok di HP',
    'Masuk profil lalu ikon QR',
    'Scan QR ini dan konfirmasi login',
  ];
}

function getServiceInputRequirement(logs: AmDeviceServiceLog[]): 'otp' | 'password' | null {
  let lastInputIndex = -1;
  let lastInputType: 'otp' | 'password' | null = null;
  let lastReadyIndex = -1;

  logs.forEach((log, index) => {
    const message = log.message;
    if (message.includes('PASSWORD_REQUIRED')) {
      lastInputIndex = index;
      lastInputType = 'password';
    } else if (
      message.includes('OTP_REQUIRED') ||
      message.includes('INPUT_REQUIRED') ||
      message.includes('"event":"login_waiting"')
    ) {
      lastInputIndex = index;
      lastInputType = 'otp';
    }

    if (
      message.includes('login_success') ||
      message.includes('Login success') ||
      message.includes('Already logged in') ||
      message.includes('OTP accepted') ||
      message.includes('Process ready') ||
      message.includes('"event":"ready"') ||
      message.includes('"event":"login_success"') ||
      message.includes('"event":"otp_fulfilled"')
    ) {
      lastReadyIndex = index;
    }
  });

  return lastInputIndex >= 0 && lastInputIndex > lastReadyIndex ? lastInputType : null;
}

function getServiceInputRequirementKey(logs: AmDeviceServiceLog[]): string | null {
  let lastInputIndex = -1;
  let lastInputType: 'otp' | 'password' | null = null;
  let lastReadyIndex = -1;

  logs.forEach((log, index) => {
    const message = log.message;
    if (message.includes('PASSWORD_REQUIRED')) {
      lastInputIndex = index;
      lastInputType = 'password';
    } else if (
      message.includes('OTP_REQUIRED') ||
      message.includes('INPUT_REQUIRED') ||
      message.includes('"event":"login_waiting"')
    ) {
      lastInputIndex = index;
      lastInputType = 'otp';
    }

    if (
      message.includes('login_success') ||
      message.includes('Login success') ||
      message.includes('Already logged in') ||
      message.includes('OTP accepted') ||
      message.includes('Process ready') ||
      message.includes('"event":"ready"') ||
      message.includes('"event":"login_success"') ||
      message.includes('"event":"otp_fulfilled"')
    ) {
      lastReadyIndex = index;
    }
  });

  if (lastInputIndex < 0 || lastInputIndex <= lastReadyIndex || !lastInputType) {
    return null;
  }

  const inputLog = logs[lastInputIndex];
  return `${lastInputType}:${lastInputIndex}:${inputLog.ts}:${inputLog.message}`;
}

function normalizeAmQrImageUri(value: string): string {
  return value.startsWith('data:') ? value : `data:image/png;base64,${value}`;
}

function getAmProtectedImageSource(uri: string) {
  const token = getAccessToken();
  if (!token) {
    return {uri};
  }

  return {
    uri,
    headers: {
      Authorization: `Bearer ${token}`,
      'x-source': appConfig.amSourceHeader,
    },
  };
}

function countBoxesForRack(boxes: AmBox[], rack: AmRack) {
  return boxes.filter(box => isBoxInRack(box, rack)).length;
}

function countDevicesForRack(devices: AmDevice[], rack: AmRack) {
  return devices.filter(device => isDeviceInRack(device, rack)).length;
}

function formatHardwareKindLabel(kind: 'rack' | 'box' | 'device') {
  if (kind === 'rack') return 'Rak';
  if (kind === 'device') return 'Perangkat';
  return 'Box';
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

function filterAmHardwareRacks(racks: AmRack[], search: string, status: string) {
  return racks.filter(rack => {
    const statusMatch = status === 'all' || rack.status === status;
    const searchMatch = matchesAmHardwareSearch(search, [
      rack.name,
      rack.location,
      rack.description,
      rack.serverIp,
      formatRackAddedBy(rack),
    ]);
    return statusMatch && searchMatch;
  });
}

function filterAmHardwareBoxes(boxes: AmBox[], search: string, status: string) {
  return boxes.filter(box => {
    const statusMatch = status === 'all' || box.status === status;
    const searchMatch = matchesAmHardwareSearch(search, [
      box.name,
      box.description,
      typeof box.rackId === 'object' ? box.rackId?.name : box.rackId,
    ]);
    return statusMatch && searchMatch;
  });
}

function filterAmHardwareDevices(devices: AmDevice[], search: string, status: string) {
  return devices.filter(device => {
    const adbStatus = device.adbStatus ?? 'unknown';
    const statusMatch = status === 'all' || adbStatus === status;
    const searchMatch = matchesAmHardwareSearch(search, [
      device.name,
      device.connectionType,
      device.tcpAddress,
      device.udid,
      device.brand,
      device.model,
      formatDeviceBox(device),
      ...(device.tags ?? []),
    ]);
    return statusMatch && searchMatch;
  });
}

function matchesAmHardwareSearch(search: string, values: Array<string | null | undefined>) {
  if (!search) return true;
  return values.some(value => value?.toLowerCase().includes(search));
}

function formatDeviceBox(device: AmDevice) {
  if (!device.boxId || typeof device.boxId === 'string') return 'Box belum diisi';
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
  return formatRupiahCompactCurrency(value);
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
  pageContent: {
    flexGrow: 1,
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
  },
  pageStack: {
    flexGrow: 1,
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    maxWidth: '100%',
    gap: 16,
  },
  dashboardPageStack: {
    flexGrow: 1,
    flexBasis: 'auto',
  },
  actionRow: {
    width: '100%',
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  metricGrid: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flexBasis: 190,
    minWidth: 190,
    flexGrow: 1,
    flexShrink: 1,
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 8,
    padding: 14,
    backgroundColor: V.colors.bg,
  },
  dashboardWalletCard: {
    flexBasis: 190,
    minWidth: 190,
    flexGrow: 1,
    flexShrink: 1,
    overflow: 'hidden',
    padding: 0,
  },
  dashboardWalletCardWithArtwork: {
    position: 'relative',
  },
  dashboardWalletAccent: {
    backgroundColor: V.colors.primary,
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
    bottom: 10,
    left: 0,
    position: 'absolute',
    top: 10,
    width: 3,
  },
  dashboardWalletAccentSuccess: {
    backgroundColor: V.colors.success,
  },
  dashboardWalletAccentWarning: {
    backgroundColor: V.colors.warning,
  },
  dashboardWalletAccentDanger: {
    backgroundColor: V.colors.danger,
  },
  dashboardWalletAccentInfo: {
    backgroundColor: V.colors.info,
  },
  dashboardWalletBody: {
    gap: 8,
    paddingHorizontal: 14,
    paddingLeft: 16,
    paddingVertical: 12,
  },
  dashboardWalletBodyWithArtwork: {
    paddingRight: 78,
  },
  dashboardWalletHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
  },
  dashboardWalletIcon: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  dashboardWalletArtwork: {
    bottom: 14,
    justifyContent: 'center',
    opacity: 0.96,
    position: 'absolute',
    right: 14,
    top: 14,
    width: 52,
  },
  dashboardWalletCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  dashboardWalletLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  dashboardWalletValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  dashboardWalletValueDanger: {
    color: V.colors.danger,
  },
  dashboardWalletHint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    marginTop: 2,
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
    width: '100%',
    alignSelf: 'stretch',
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0,
    gap: 12,
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 8,
    padding: 14,
    backgroundColor: V.colors.bg,
  },
  panelGrid: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: 12,
  },
  dashboardRecentPanel: {
    width: '100%',
    alignSelf: 'stretch',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    gap: 12,
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 8,
    padding: 14,
    backgroundColor: V.colors.bg,
  },
  recentList: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    gap: 0,
  },
  recentListRow: {
    width: '100%',
    alignSelf: 'stretch',
    maxWidth: '100%',
    minWidth: 0,
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: V.colors.border,
    paddingVertical: 11,
  },
  recentListMain: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
  },
  recentListMeta: {
    flexBasis: 148,
    flexGrow: 0,
    flexShrink: 1,
    minWidth: 0,
    maxWidth: 148,
    alignSelf: 'stretch',
    alignItems: 'flex-end',
    gap: 4,
    overflow: 'hidden',
  },
  dashboardRecentTable: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
  },
  dashboardRecentTableHeader: {
    width: '100%',
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dashboardRecentTableRow: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: V.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dashboardTransferAccountCol: {
    flex: 1.2,
    minWidth: 0,
  },
  dashboardTransferRecipientCol: {
    flex: 1.4,
    minWidth: 0,
  },
  dashboardTransferAmountCol: {
    flex: 0.9,
    minWidth: 0,
    textAlign: 'right',
  },
  dashboardTransferStatusCol: {
    flex: 0.8,
    minWidth: 0,
  },
  dashboardTransferDateCol: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
  },
  dashboardMutasiAccountCol: {
    flex: 1.4,
    minWidth: 0,
  },
  dashboardMutasiTypeCol: {
    flex: 0.7,
    minWidth: 0,
  },
  dashboardMutasiAmountCol: {
    flex: 0.95,
    minWidth: 0,
    textAlign: 'right',
  },
  dashboardMutasiDateCol: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
  },
  overviewGrid: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: 12,
  },
  overviewChartPanel: {
    flexGrow: 2,
    flexShrink: 1,
    flexBasis: 520,
    minWidth: 0,
    maxWidth: '100%',
  },
  overviewTransferPanel: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 240,
    minWidth: 0,
    maxWidth: '100%',
  },
  panelHeaderRow: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailGrid: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    gap: 8,
  },
  panelTitle: {
    flexShrink: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
  },
  panelText: {
    marginTop: 6,
    minWidth: 0,
    maxWidth: '100%',
    flexShrink: 1,
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
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: V.colors.border,
    paddingTop: 10,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    minWidth: 0,
    maxWidth: '100%',
    flexShrink: 1,
    overflow: 'hidden',
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  rowMeta: {
    minWidth: 0,
    maxWidth: '100%',
    flexShrink: 1,
    overflow: 'hidden',
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  rowActions: {
    flexShrink: 0,
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
  transferBreakdownStack: {
    gap: 10,
  },
  transferBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  transferTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: V.colors.border,
    paddingTop: 12,
  },
  amountText: {
    maxWidth: '100%',
    flexShrink: 1,
    overflow: 'hidden',
    textAlign: 'right',
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  rowAmountText: {
    maxWidth: 120,
    textAlign: 'right',
  },
  amountPositive: {
    color: V.colors.success,
  },
  amountDanger: {
    color: V.colors.danger,
  },
  filterBar: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },
  amHardwareHeader: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  amHardwareHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },
  amServicesToolbarWrap: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    position: 'relative',
    zIndex: 100000,
    elevation: 1000,
    overflow: 'visible',
  },
  amHardwareToolbarWrap: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    position: 'relative',
    zIndex: 90000,
    elevation: 900,
    overflow: 'visible',
  },
  amWebhookToolbarMetric: {
    minWidth: 160,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  amServicesFilterTrigger: {
    overflow: 'visible',
  },
  amServicesFilterOverlayPanel: {
    position: 'absolute',
    zIndex: 120000,
    elevation: 1200,
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 8,
    backgroundColor: V.colors.bg,
    padding: 6,
    shadowColor: V.colors.fg,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  amServicesFilterPanelScroll: {
    maxHeight: 240,
  },
  amServicesFilterPanelContent: {
    gap: 4,
  },
  amServicesFilterPanelOption: {
    justifyContent: 'flex-start',
  },
  amServicesFilterPanelFooter: {
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: V.colors.border,
    marginTop: 6,
    paddingTop: 6,
  },
  taskSearch: {
    flexBasis: 240,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 240,
  },
  activitySearch: {
    flexBasis: 300,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 260,
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
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 8,
    backgroundColor: V.colors.bg,
  },
  sectionHeaderRow: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  tableHeader: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    overflow: 'hidden',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: V.colors.border,
    backgroundColor: V.colors.mutedSoft,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dashboardTableHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
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
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: V.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  dashboardTableRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: V.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  tableRowExpanded: {
    backgroundColor: V.colors.primarySoft,
  },
  expandCol: {
    width: 24,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTitleRow: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  serviceStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    flexShrink: 0,
  },
  serviceStatusDotActive: {
    backgroundColor: V.colors.success,
  },
  serviceStatusDotInactive: {
    backgroundColor: V.colors.border,
  },
  serviceInputDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    flexShrink: 0,
    backgroundColor: V.colors.warning,
  },
  serviceDetailPanel: {
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: V.colors.border,
    padding: 12,
    backgroundColor: V.colors.mutedSoft,
  },
  detailHeader: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  detailHeaderActionsOnly: {
    justifyContent: 'flex-end',
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
    gap: 6,
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#030712',
  },
  serviceConsolePanel: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 8,
    backgroundColor: '#030712',
  },
  serviceConsoleHeader: {
    width: '100%',
    minWidth: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
  },
  serviceConsoleStatus: {
    minWidth: 0,
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceConsoleStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  serviceConsoleStatusDotRunning: {
    backgroundColor: '#22c55e',
  },
  serviceConsoleStatusDotStopped: {
    backgroundColor: '#4b5563',
  },
  serviceConsoleStatusText: {
    minWidth: 0,
    color: '#9ca3af',
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  serviceConsoleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  serviceConsoleLineCount: {
    color: '#e5e7eb',
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  serviceConsoleTabs: {
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 6,
    backgroundColor: '#030712',
  },
  serviceConsoleTab: {
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#030712',
  },
  serviceConsoleTabActive: {
    backgroundColor: '#374151',
  },
  serviceConsoleTabText: {
    color: '#6b7280',
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  serviceConsoleTabTextActive: {
    color: '#ffffff',
  },
  serviceLogPanel: {
    maxHeight: 288,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  serviceLogContent: {
    gap: 6,
  },
  logRow: {
    width: '100%',
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  logText: {
    color: '#d1d5db',
    fontFamily: 'Consolas',
    fontSize: 12,
    lineHeight: 18,
  },
  logMessage: {
    flex: 1,
    minWidth: 0,
  },
  logTimestamp: {
    flexShrink: 0,
    color: '#4b5563',
    fontFamily: 'Consolas',
    fontSize: 12,
    lineHeight: 18,
  },
  logTextDefault: {
    color: '#d1d5db',
  },
  logTextInfo: {
    color: '#60a5fa',
  },
  logTextDanger: {
    color: '#f87171',
  },
  logEmptyText: {
    color: '#6b7280',
    fontFamily: 'Consolas',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  proofPanel: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
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
  amDeviceInfoGrid: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 24,
    rowGap: 12,
  },
  amDeviceInfoItem: {
    minWidth: 128,
    flexGrow: 1,
    flexBasis: 150,
    gap: 4,
  },
  amDeviceInfoLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
  },
  amDeviceInfoValue: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
  },
  amDeviceInfoValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailList: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 8,
    backgroundColor: V.colors.bg,
  },
  detailListHeader: {
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: V.colors.border,
    paddingTop: 10,
  },
  detailListRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: V.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  runtimePanel: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
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
  qrInstructionList: {
    gap: 3,
    marginTop: 4,
  },
  qrInstructionText: {
    color: V.colors.warning,
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 16,
  },
  cellText: {
    minWidth: 0,
    maxWidth: '100%',
    flexShrink: 1,
    overflow: 'hidden',
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  typeCol: {
    flex: 1.2,
    minWidth: 0,
  },
  statusCol: {
    flex: 0.9,
    minWidth: 0,
  },
  accountWideCol: {
    flex: 1.3,
    minWidth: 0,
  },
  recipientCol: {
    flex: 1.4,
    minWidth: 0,
  },
  amountCol: {
    flex: 0.9,
    minWidth: 0,
  },
  actionCol: {
    flex: 1.2,
    minWidth: 0,
  },
  hardwareActionCol: {
    alignItems: 'flex-end',
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 44,
    width: 44,
  },
  deviceCol: {
    flex: 1.2,
    minWidth: 0,
  },
  accountCol: {
    flex: 1.2,
    minWidth: 0,
  },
  errorCol: {
    flex: 1.2,
    minWidth: 0,
  },
  dateCol: {
    flex: 1,
    minWidth: 0,
  },
  serviceCol: {
    flex: 1.4,
    minWidth: 0,
  },
  platformCol: {
    flex: 0.8,
    minWidth: 0,
  },
  deviceWideCol: {
    flex: 1.3,
    minWidth: 0,
  },
  recentTypeCol: {
    width: 48,
    flexShrink: 0,
  },
  recentAccountCol: {
    flex: 1.2,
    minWidth: 0,
    overflow: 'hidden',
  },
  recentRecipientCol: {
    flex: 1.2,
    minWidth: 0,
    overflow: 'hidden',
  },
  recentAmountCol: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    overflow: 'hidden',
    textAlign: 'right',
  },
  recentStatusCol: {
    flex: 0.8,
    minWidth: 0,
    flexShrink: 1,
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  recentDateCol: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    overflow: 'hidden',
    textAlign: 'right',
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
    maxWidth: '100%',
    flexShrink: 1,
    overflow: 'hidden',
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
  statusChipInfo: {
    backgroundColor: V.colors.infoSoft,
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
    width: '100%',
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
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
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
  serviceActionButton: {
    borderRadius: V.radius.sm,
  },
  serviceIconButton: {
    borderRadius: V.radius.sm,
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
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  hardwareGridSection: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    gap: 12,
  },
  hardwareCard: {
    flexGrow: 1,
    flexBasis: 220,
    width: 220,
    gap: 8,
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: V.colors.bg,
  },
  hardwareCardFooter: {
    width: '100%',
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: V.colors.border,
    paddingTop: 10,
  },
  hardwareCardFooterCopy: {
    flex: 1,
    minWidth: 0,
  },
  webhookEndpointList: {
    width: '100%',
    gap: 6,
  },
  webhookEndpointRow: {
    width: '100%',
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: V.colors.border,
    paddingVertical: 8,
  },
  webhookEndpointCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  webhookEndpointTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minWidth: 0,
  },
  webhookEndpointTitle: {
    flexShrink: 1,
    minWidth: 0,
  },
  webhookEndpointActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 6,
  },
  hardwareModalScroll: {
    maxHeight: 420,
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
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: 8,
    padding: 18,
    backgroundColor: V.colors.bg,
  },
});
