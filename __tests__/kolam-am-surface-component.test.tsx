import React from 'react';
import {Image, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {KolamAmSurface} from '../src/components/kolam-am-surface';
import {getShellModuleRouteEntry} from '../src/domain/app-shell';
import {getDashboardLayoutVisualContract} from '../src/domain/dashboard-layout';
import {setAccessToken} from '../src/lib/api-client';
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
  deleteAmDevices,
  deleteAmRacks,
  deleteAmServiceAccount,
  deleteAmUser,
  deleteAmWebhookConfig,
  forceFailAmTask,
  getAmActivityLogs,
  getAmActivityLogStats,
  getAmBoxById,
  getAmBoxes,
  getAmCurrentUser,
  getAmDashboard,
  getAmDeviceById,
  getAmDeviceServiceLogs,
  getAmDeviceServices,
  getAmDevices,
  getAmDevicesAdbStatus,
  getAmMutasi,
  getAmMutasiById,
  getAmMutasiSummary,
  getAmRackById,
  getAmRacks,
  getAmRoles,
  getAmServiceAccounts,
  getAmTasks,
  getAmTaskById,
  getAmTokopediaApiMonitorStatus,
  getAmTokopediaSession,
  getAmTransferById,
  getAmTransfers,
  getAmUsers,
  getAmWebhookConfigs,
  getAmWebhookLogs,
  recordAmPageView,
  restartAmTokopediaSession,
  runAmTokopediaApiMonitor,
  sendAmDeviceServiceInput,
  startAmTokopediaQrLogin,
  testAmWebhookPing,
  stopAmDeviceService,
  uploadAmTokopediaSession,
  updateAmTokopediaCaptchaSettings,
  updateAmTokopediaLoginMethod,
  updateAmDevice,
  updateAmRack,
  updateAmServiceAccount,
  updateAmUser,
  updateAmWebhookConfig,
  startAmDeviceService,
  verifyAmTokopediaSession,
} from '../src/services/am-api';
import {seedUnifiedDataset} from '../src/services/unified-data';

jest.mock('../src/services/am-api', () => ({
  bulkDeleteAmActivityLogs: jest.fn(() => Promise.resolve({deletedCount: 75})),
  cancelAmTransfer: jest.fn(() => Promise.resolve({_id: 'transfer-1'})),
  cancelAmTask: jest.fn(() => Promise.resolve({_id: 'task-1'})),
  clearAmServiceAccountSession: jest.fn(() => Promise.resolve({stopped: true, deleted: ['session.json'], missing: []})),
  createAmBox: jest.fn(() => Promise.resolve({_id: 'box-new'})),
  createAmDevice: jest.fn(() => Promise.resolve({_id: 'device-new'})),
  createAmRack: jest.fn(() => Promise.resolve({_id: 'rack-new'})),
  createAmServiceAccount: jest.fn(() => Promise.resolve({_id: 'service-new'})),
  createAmTransfer: jest.fn(() => Promise.resolve({_id: 'transfer-new'})),
  createAmUser: jest.fn(() => Promise.resolve({_id: 'user-new'})),
  createAmWebhookConfig: jest.fn(() => Promise.resolve({_id: 'webhook-1'})),
  deleteAmBoxes: jest.fn(() => Promise.resolve(undefined)),
  deleteAmDevices: jest.fn(() => Promise.resolve(undefined)),
  deleteAmRacks: jest.fn(() => Promise.resolve(undefined)),
  deleteAmServiceAccount: jest.fn(() => Promise.resolve(undefined)),
  deleteAmUser: jest.fn(() => Promise.resolve(undefined)),
  deleteAmWebhookConfig: jest.fn(() => Promise.resolve({success: true})),
  forceFailAmTransfer: jest.fn(() => Promise.resolve({_id: 'transfer-1'})),
  forceFailAmTask: jest.fn(() => Promise.resolve({_id: 'task-1'})),
  getAmActivityLogs: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmActivityLogStats: jest.fn(() => Promise.resolve({since: '', days: 7, byType: [], byStatus: [], topUsers: [], topPaths: []})),
  getAmBoxById: jest.fn(() => Promise.resolve({_id: 'box-1', name: 'Box 1'})),
  getAmBoxes: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmCurrentUser: jest.fn(() => Promise.resolve({
    _id: 'user-current',
    fullName: 'Current AM User',
    username: 'current@dunia-anura.com',
    role: {_id: 'role-admin', name: 'Admin', permissions: ['user:read', 'user:update'], description: 'Admin role'},
  })),
  getAmDashboard: jest.fn(() => Promise.resolve(mockDashboardData)),
  getAmDeviceById: jest.fn(() => Promise.resolve({_id: 'device-1', name: 'Device 1'})),
  getAmDeviceServiceLogs: jest.fn(() => Promise.resolve({logs: [], processRunning: false})),
  getAmDeviceServices: jest.fn(() => Promise.resolve([])),
  getAmDeviceServiceQrUrl: jest.fn((deviceId: string, platform: string, qrcodeId?: string) => {
    const endpoint = platform === 'whatsapp' ? 'whatsapp-qr' : platform === 'shopee' ? 'shopee-qr' : null;
    if (!endpoint) return null;
    const suffix = qrcodeId ? `?t=${encodeURIComponent(qrcodeId)}` : '';
    return `https://frogs.dunia-anura.com/api/device/${deviceId}/service/${endpoint}${suffix}`;
  }),
  getAmDevices: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmDevicesAdbStatus: jest.fn(() => Promise.resolve({})),
  getAmMutasi: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmMutasiById: jest.fn(() => Promise.resolve({_id: 'mutasi-1'})),
  getAmMutasiReceiptUrl: jest.fn((id: string) => `https://frogs.dunia-anura.com/api/mutasi/${encodeURIComponent(id)}/receipt`),
  getAmMutasiSummary: jest.fn(() => Promise.resolve({masuk: {total: 0, count: 0}, keluar: {total: 0, count: 0}})),
  getAmRackById: jest.fn(() => Promise.resolve({_id: 'rack-1', name: 'Rack 1'})),
  getAmRacks: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmRoles: jest.fn(() => Promise.resolve([])),
  getAmServiceAccounts: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmTaskById: jest.fn(() => Promise.resolve({_id: 'task-1', logs: []})),
  getAmTasks: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmTokopediaApiMonitorStatus: jest.fn(() => Promise.resolve({status: 'idle', message: 'Idle'})),
  getAmTokopediaSession: jest.fn(() => Promise.resolve({
    status: 'ready',
    cookieCount: 5,
    expiredCount: 0,
    sessionCookieCount: 2,
    updatedAt: '2026-01-01T00:00:00.000Z',
    hasFingerprint: true,
    serviceStatus: 'active',
    hasDevice: true,
    captchaAutoSolve: false,
    hasAnthropicApiKey: true,
    anthropicApiKeyPreview: 'sk-ant-...',
    envFallbackAvailable: true,
    qrTiktokLogin: false,
    loginFillOnly: false,
  })),
  getAmTransferById: jest.fn(() => Promise.resolve({_id: 'transfer-1', logs: []})),
  getAmTransfers: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmUsers: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmWebhookConfigs: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmWebhookEvents: jest.fn(() => Promise.resolve(['transfer.success', 'mutasi.created'])),
  getAmWebhookLogs: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  recordAmPageView: jest.fn(() => Promise.resolve(undefined)),
  restartAmTokopediaSession: jest.fn(() => Promise.resolve({restarted: true, wasRunning: true})),
  retryAmTransfer: jest.fn(() => Promise.resolve({_id: 'transfer-1'})),
  retryAmTask: jest.fn(() => Promise.resolve({_id: 'task-1'})),
  runAmTokopediaApiMonitor: jest.fn(() => Promise.resolve({status: 'running', message: 'Monitor berjalan'})),
  sendAmDeviceServiceInput: jest.fn(() => Promise.resolve({success: true})),
  startAmDeviceService: jest.fn(() => Promise.resolve({success: true})),
  startAmTokopediaQrLogin: jest.fn(() => Promise.resolve({started: true})),
  stopAmDeviceService: jest.fn(() => Promise.resolve({success: true})),
  testAmWebhookPing: jest.fn(() => Promise.resolve({success: true, message: 'Test ping dispatched to 1 active config(s)'})),
  uploadAmTokopediaSession: jest.fn(() => Promise.resolve({cookieCount: 1, updatedAt: '2026-01-01T00:00:00.000Z'})),
  updateAmTokopediaCaptchaSettings: jest.fn(() => Promise.resolve({
    captchaAutoSolve: true,
    hasAnthropicApiKey: true,
    anthropicApiKeyPreview: 'sk-ant-...',
    envFallbackAvailable: true,
  })),
  updateAmTokopediaLoginMethod: jest.fn(() => Promise.resolve({qrTiktokLogin: true, loginFillOnly: false})),
  updateAmBox: jest.fn(() => Promise.resolve({_id: 'box-1'})),
  updateAmDevice: jest.fn(() => Promise.resolve({_id: 'device-1'})),
  updateAmRack: jest.fn(() => Promise.resolve({_id: 'rack-1'})),
  updateAmServiceAccount: jest.fn(() => Promise.resolve({_id: 'service-1'})),
  updateAmUser: jest.fn(() => Promise.resolve({_id: 'user-1'})),
  updateAmWebhookConfig: jest.fn(() => Promise.resolve({_id: 'webhook-1'})),
  verifyAmTokopediaSession: jest.fn(() => Promise.resolve({loggedIn: true, reason: null, cookieCount: 5, url: 'https://seller-id.tokopedia.com'})),
}));

const mockDashboardData = {
  summary: {
    totalBalance: 2500000,
    totalAccounts: 3,
    todayIncoming: {total: 450000, count: 2},
    todayOutgoing: {total: 125000, count: 1},
    activeDevices: 2,
  },
  transfers: {
    pending: 1,
    processing: 2,
    success: 3,
    failed: 1,
    totalAmount: 900000,
  },
  recentTransfers: [
    {
      _id: 'transfer-dashboard-1',
      accountId: { _id: 'account-1', label: 'BCA Main', platform: 'bca', accountNumber: '123' },
      amount: 900000,
      completedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      createdBy: null,
      deviceId: { _id: 'device-1', name: 'Phone 1' },
      error: '',
      fee: 2500,
      logs: [],
      recipientAccount: '999',
      recipientBank: 'BCA',
      recipientName: 'Vendor Dashboard',
      screenshot: '',
      startedAt: null,
      status: 'processing',
      transactionPurpose: null,
      transferMethod: 'BI FAST',
      transferType: 'transfer',
      updatedAt: '',
    },
    {
      _id: 'transfer-dashboard-legacy-account',
      accountId: {_id: 'account-legacy', name: 'Legacy BCA', type: 'bca', account_number: '321'},
      amount: 325000,
      completedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      createdBy: null,
      deviceId: {_id: 'device-1', name: 'Phone 1'},
      error: '',
      fee: 2500,
      logs: [],
      recipientAccount: '991',
      recipientBank: 'BCA',
      recipientName: 'Vendor Legacy Account',
      screenshot: '',
      startedAt: null,
      status: 'pending',
      transactionPurpose: null,
      transferMethod: 'BI FAST',
      transferType: 'transfer',
      updatedAt: '',
    },
    ...Array.from({length: 5}, (_, index) => ({
      _id: `transfer-dashboard-extra-${index + 2}`,
      accountId: {_id: 'account-1', label: 'BCA Main', platform: 'bca', accountNumber: '123'},
      amount: 100000 + index,
      completedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      createdBy: null,
      deviceId: {_id: 'device-1', name: 'Phone 1'},
      error: '',
      fee: 2500,
      logs: [],
      recipientAccount: `99${index}`,
      recipientBank: 'BCA',
      recipientName: index === 4 ? 'Vendor Dashboard Sixth' : `Vendor Dashboard Extra ${index + 2}`,
      screenshot: '',
      startedAt: null,
      status: 'pending',
      transactionPurpose: null,
      transferMethod: 'BI FAST',
      transferType: 'transfer',
      updatedAt: '',
    })),
  ],
  recentMutasi: [
    {
      _id: 'mutasi-dashboard-1',
      accountId: { _id: 'account-1', label: 'BCA Main', platform: 'bca', accountNumber: '123' },
      amount: 450000,
      createdAt: '',
      description: 'Incoming dashboard',
      detectedAt: '2026-01-01T00:05:00.000Z',
      deviceId: { _id: 'device-1', name: 'Phone 1' },
      notificationHash: null,
      transferId: null,
      type: 'masuk',
      updatedAt: '',
    },
    {
      _id: 'mutasi-dashboard-legacy-account',
      accountId: {_id: 'account-legacy', name: 'Legacy BRI', type: 'brimo', account_number: '654'},
      amount: 175000,
      createdAt: '',
      description: 'Incoming legacy account',
      detectedAt: '2026-01-01T00:05:00.000Z',
      deviceId: {_id: 'device-1', name: 'Phone 1'},
      notificationHash: null,
      transferId: null,
      type: 'masuk',
      updatedAt: '',
    },
    ...Array.from({length: 5}, (_, index) => ({
      _id: `mutasi-dashboard-extra-${index + 2}`,
      accountId: {_id: 'account-1', label: 'BCA Main', platform: 'bca', accountNumber: '123'},
      amount: 300000 + index,
      createdAt: '',
      description: index === 4 ? 'Incoming dashboard sixth' : `Incoming dashboard extra ${index + 2}`,
      detectedAt: '2026-01-01T00:05:00.000Z',
      deviceId: {_id: 'device-1', name: 'Phone 1'},
      notificationHash: null,
      transferId: null,
      type: 'masuk',
      updatedAt: '',
    })),
  ],
  chartData: [{date: '2026-01-01', incoming: 450000, outgoing: 125000}],
  devices: [
    {
      _id: 'device-dashboard-1',
      accountCount: 2,
      accountTypes: ['bca'],
      activeAccountCount: 1,
      boxName: 'Box 01',
      brand: 'Samsung',
      model: 'A52',
      name: 'Dashboard Phone',
      rackName: 'Rack Alpha',
      udid: 'USB-1',
    },
    ...Array.from({length: 8}, (_, index) => ({
      _id: `device-dashboard-extra-${index + 2}`,
      accountCount: 1,
      accountTypes: ['bca'],
      activeAccountCount: 1,
      boxName: 'Box 01',
      brand: 'Samsung',
      model: 'A52',
      name: index === 7 ? 'Dashboard Phone Ninth' : `Dashboard Phone Extra ${index + 2}`,
      rackName: 'Rack Alpha',
      udid: `USB-${index + 2}`,
    })),
  ],
};

function renderText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAllByType(Text)
    .flatMap(node => flattenText(node.props.children));
}

function flattenText(value: React.ReactNode): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenText);
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }

  return [];
}

function amRoute(route: string) {
  const entry = getShellModuleRouteEntry('am', route);
  if (!entry) {
    throw new Error(`Missing AM route ${route}`);
  }
  return entry;
}

function concreteAmRoute(route: string, templateRoute: string) {
  return {
    ...amRoute(templateRoute),
    id: `am:${route}`,
    route,
  };
}

async function updateAmRoute(
  renderer: ReactTestRenderer.ReactTestRenderer,
  route: string,
) {
  await act(async () => {
    renderer.update(
      <KolamAmSurface
        activeModuleRoute={amRoute(route)}
        dataset={seedUnifiedDataset}
      />,
    );
  });
}

describe('KolamAmSurface', () => {
  const renderers: ReactTestRenderer.ReactTestRenderer[] = [];

  afterEach(() => {
    for (const renderer of renderers.splice(0)) {
      act(() => {
        renderer.unmount();
      });
    }
    jest.useRealTimers();
    setAccessToken(undefined);
    jest.clearAllMocks();
  });

  it('renders AM as an app surface driven by the main sidebar route', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await act(async () => {
      await Promise.resolve();
    });

    const text = renderText(renderer!);
    const joinedText = text.join(' ');

    expect(text).toContain('Kembali');
    expect(joinedText).not.toContain('Welcome back');
    expect(text).toContain("Today's Incoming");
    expect(text).toContain("Today's Outgoing");
    expect(text).toContain("Today's Transfers");
    expect(text).toContain('Mutations (7 days)');
    expect(joinedText).toContain('Incoming vs outgoing transaction volume over the last 7 days.');
    expect(joinedText).toContain('Transfer breakdown by status.');
    expect(text.indexOf('Mutations (7 days)')).toBeLessThan(text.indexOf("Today's Transfers"));
    expect(text.indexOf("Today's Transfers")).toBeLessThan(text.indexOf('Recent Transfers'));
    expect(text.indexOf('Recent Transfers')).toBeLessThan(text.indexOf('Device Overview'));
    expect(text).not.toContain('Transfer Status');
    expect(text).toContain('Vendor Dashboard');
    expect(text).toContain('Vendor Dashboard Sixth');
    expect(joinedText).toContain('Legacy BCA - 321');
    expect(text).toContain('Recent Mutations');
    expect(text).toEqual(expect.arrayContaining(['Account', 'Recipient', 'Amount', 'Status', 'Time']));
    expect(text).toEqual(expect.arrayContaining(['Type', 'Account', 'Amount', 'Time']));
    expect(joinedText).toContain('Legacy BRI - 654');
    expect(text).toContain('Device Overview');
    expect(joinedText).toContain('with active accounts');
    expect(joinedText).toContain('All devices with active accounts and their locations.');
    expect(text).toContain('Location');
    expect(text).toContain('Accounts');
    expect(text).toContain('Types');
    expect(text).toContain('Dashboard Phone');
    expect(text).toContain('Dashboard Phone Ninth');
    expect(text).toContain('In');
    expect(text).toContain('Rp450rb');
    expect(joinedText).toMatch(/Box 01\s+\/\s+Rack Alpha/);
    expect(joinedText).toMatch(/1\s+\/\s+2/);
    expect(joinedText).toContain('bca');
    expect(text).not.toContain('Automation Management');
    expect(text).not.toContain('Ringkasan akun, device, transfer, dan mutasi AM.');
    expect(text).not.toEqual(
      expect.arrayContaining([
        'Overview',
        'Automation',
        'Infrastructure',
        'Banking',
        'Administration',
      ]),
    );
    const amRoot = renderer!.root
      .findAllByType(View)
      .find(view => {
        const style = StyleSheet.flatten(view.props.style);
        return style?.width === '100%' && style?.paddingTop === getDashboardLayoutVisualContract().page.gapY;
      });
    const amRootStyle = StyleSheet.flatten(amRoot?.props.style);
    expect(amRootStyle).toEqual(
      expect.objectContaining({
        width: '100%',
        alignSelf: 'stretch',
        paddingTop: getDashboardLayoutVisualContract().page.gapY,
      }),
    );
    expect(amRootStyle?.marginHorizontal).toBeUndefined();
    expect(amRootStyle?.maxWidth).toBeUndefined();
    expect(amRootStyle?.paddingHorizontal).toBeUndefined();
    const amRecentPanels = renderer!.root
      .findAllByType(View)
      .filter(view => {
        const style = StyleSheet.flatten(view.props.style);
        return style?.flexBasis === 420 && style?.borderWidth === 1;
      });
    expect(amRecentPanels.length).toBeGreaterThanOrEqual(2);
    expect(amRecentPanels.every(view => {
      const style = StyleSheet.flatten(view.props.style);
      return style?.width === '100%';
    })).toBe(true);
    const verticalAmScroll = renderer!.root
      .findAllByType(ScrollView)
      .find(scroll => !scroll.props.horizontal);
    expect(verticalAmScroll).toBeUndefined();
    const legacyFrame = renderer!.root
      .findAllByType(View)
      .find(view => {
        const style = StyleSheet.flatten(view.props.style);
        return style?.minHeight === 720 && style?.borderWidth === 1;
      });
    expect(legacyFrame).toBeUndefined();
    const amTableHeaders = renderer!.root
      .findAllByType(View)
      .filter(view => {
        const style = StyleSheet.flatten(view.props.style);
        return style?.borderBottomWidth === 1 && style?.backgroundColor;
      });
    expect(amTableHeaders.length).toBeGreaterThan(0);
    expect(amTableHeaders.every(view => {
      const style = StyleSheet.flatten(view.props.style);
      return style?.width === '100%' && style?.overflow === 'hidden';
    })).toBe(true);
    const amTableRows = renderer!.root
      .findAllByType(View)
      .filter(view => {
        const style = StyleSheet.flatten(view.props.style);
        return style?.borderTopWidth === 1 && style?.paddingHorizontal === 12;
      });
    expect(amTableRows.length).toBeGreaterThan(0);
    expect(amTableRows.every(view => {
      const style = StyleSheet.flatten(view.props.style);
      return style?.width === '100%' && style?.overflow === 'hidden';
    })).toBe(true);
    expect(getAmDashboard).toHaveBeenCalledTimes(1);
    expect(recordAmPageView).toHaveBeenCalledWith('/');
  });

  it('hides the AM dashboard device overview when dashboard devices are empty', async () => {
    (getAmDashboard as jest.Mock).mockResolvedValueOnce({
      ...mockDashboardData,
      devices: [],
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await act(async () => {
      await Promise.resolve();
    });

    const text = renderText(renderer!);
    const joinedText = text.join(' ');

    expect(joinedText).toContain('with active accounts');
    expect(text).not.toContain('Device Overview');
    expect(joinedText).not.toContain('All devices with active accounts and their locations.');
  });

  it('keeps the POS-style back button wired to return to Kolam', async () => {
    const onBackToCenter = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface
          dataset={seedUnifiedDataset}
          onBackToCenter={onBackToCenter}
        />,
      );
    });
    renderers.push(renderer!);

    const backButton = renderer!.root.findByProps({
      accessibilityLabel: 'Kembali',
    });

    act(() => {
      backButton.props.onPress();
    });

    expect(onBackToCenter).toHaveBeenCalledTimes(1);
  });

  it('opens AM dashboard parity routes from recent panels', async () => {
    const onModuleRouteSelect = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface
          dataset={seedUnifiedDataset}
          onModuleRouteSelect={onModuleRouteSelect}
        />,
      );
    });
    renderers.push(renderer!);

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Dashboard View Transfers'}).props.onPress();
    });
    expect(onModuleRouteSelect).toHaveBeenLastCalledWith(amRoute('transactions'));

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Dashboard Transfer transfer-dashboard-1'}).props.onPress();
    });
    expect(onModuleRouteSelect).toHaveBeenLastCalledWith(
      concreteAmRoute('transactions/transfer-dashboard-1', 'transactions/:id'),
    );

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Dashboard View Recent Mutations'}).props.onPress();
    });
    expect(onModuleRouteSelect).toHaveBeenLastCalledWith(amRoute('mutasi'));

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Dashboard Mutation mutasi-dashboard-1'}).props.onPress();
    });
    expect(onModuleRouteSelect).toHaveBeenLastCalledWith(
      concreteAmRoute('mutasi/mutasi-dashboard-1', 'mutasi/:id'),
    );

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Dashboard View Hardware'}).props.onPress();
    });
    expect(onModuleRouteSelect).toHaveBeenLastCalledWith(amRoute('hardware'));
  });

  it('renders the AM FE-style not-found page for catch-all routes', async () => {
    const onModuleRouteSelect = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface
          activeModuleRoute={amRoute(':catchAll')}
          dataset={seedUnifiedDataset}
          onModuleRouteSelect={onModuleRouteSelect}
        />,
      );
    });
    renderers.push(renderer!);

    const text = renderText(renderer!);

    expect(text).toContain('404');
    expect(text).toContain('Page not found');
    expect(text).toContain("The page you are looking for doesn't exist or has been moved.");
    expect(text).toContain('Back to Dashboard');
    expect(text).not.toContain('sudah masuk menu AM');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Back to Dashboard'}).props.onPress();
    });

    expect(onModuleRouteSelect).toHaveBeenCalledWith(amRoute('/'));
  });

  it('keeps AM account actions out of the surface topbar', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    expect(
      renderer!.root.findAllByProps({accessibilityLabel: 'AM Settings'}),
    ).toHaveLength(0);
    expect(
      renderer!.root.findAllByProps({accessibilityLabel: 'AM Login'}),
    ).toHaveLength(0);
    expect(renderer!.root.findByProps({accessibilityLabel: 'Kembali'})).toBeTruthy();
  });

  it('does not expose the legacy AM login route inside JungleSystem', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface
          activeModuleRoute={{
            ...amRoute(':catchAll'),
            id: 'am:login',
            route: 'login',
          }}
          dataset={seedUnifiedDataset}
        />,
      );
    });
    renderers.push(renderer!);

    expect(recordAmPageView).toHaveBeenCalledWith('/login');
    expect(renderer!.root.findAllByProps({accessibilityLabel: 'AM Login Submit'})).toHaveLength(0);
    expect(renderText(renderer!).join(' ')).not.toContain('Gunakan akun Kolam yang sama.');
  });

  it('loads live service accounts from the Services route', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'services');
    expect(recordAmPageView).toHaveBeenCalledWith('/services');

    expect(getAmServiceAccounts).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      search: undefined,
      platform: undefined,
      status: undefined,
    });
  });

  it('keeps Services search, platform filter, and pagination in sync with AM live metadata', async () => {
    jest.mocked(getAmServiceAccounts).mockResolvedValue({
      data: [
        {
          _id: 'service-page-1',
          platform: 'shopee',
          label: 'Shopee Main',
          deviceId: {
            _id: 'device-1',
            name: 'Browser 1',
            connectionType: 'browser',
            tcpAddress: null,
            udid: null,
            boxId: {
              _id: 'box-1',
              name: 'Box Browser',
              rackId: {_id: 'rack-1', name: 'Rack Green'},
            },
          },
          status: 'active',
          credentials: {},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 45, limit: 20, page: 1, totalPages: 3},
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'services');

    let text = renderText(renderer!).join(' ').replace(/\s+/g, ' ');
    expect(text).toContain('Showing 1 to 20 of 45 items');
    expect(text).toContain('All Platforms');
    expect(text).toContain('Box Browser / Rack Green');
    expect(getAmServiceAccounts).toHaveBeenLastCalledWith({
      page: 1,
      limit: 20,
      search: undefined,
      platform: undefined,
      status: undefined,
    });

    await act(async () => {
      renderer!.root.findAllByType(TextInput)[0].props.onChangeText('Shopee');
    });

    expect(getAmServiceAccounts).toHaveBeenLastCalledWith({
      page: 1,
      limit: 20,
      search: 'Shopee',
      platform: undefined,
      status: undefined,
    });

    await act(async () => {
      renderer!.root.findAllByProps({accessibilityLabel: 'AM Segment Shopee'})[0].props.onPress();
    });

    expect(getAmServiceAccounts).toHaveBeenLastCalledWith({
      page: 1,
      limit: 20,
      search: 'Shopee',
      platform: 'shopee',
      status: undefined,
    });

    await act(async () => {
      renderer!.root.findAllByProps({accessibilityLabel: 'AM Segment Active'})[0].props.onPress();
    });

    expect(getAmServiceAccounts).toHaveBeenLastCalledWith({
      page: 1,
      limit: 20,
      search: 'Shopee',
      platform: 'shopee',
      status: 'active',
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Services Next Page'}).props.onPress();
    });

    expect(getAmServiceAccounts).toHaveBeenLastCalledWith({
      page: 2,
      limit: 20,
      search: 'Shopee',
      platform: 'shopee',
      status: 'active',
    });
  });

  it('keeps task action guards aligned with AM FE status rules', async () => {
    jest.mocked(getAmTasks).mockResolvedValue({
      data: [
        {
          _id: 'task-1',
          type: 'stock_sync',
          status: 'pending',
          priority: 1,
          deviceId: {_id: 'device-1', name: 'Phone 1'},
          serviceAccountId: {_id: 'service-1', label: 'Tokopedia Main'},
          payload: {},
          result: {},
          error: '',
          logs: [],
          createdBy: null,
          retryCount: 0,
          maxRetries: 3,
          startedAt: null,
          completedAt: null,
          createdAt: '',
          updatedAt: '',
        },
        {
          _id: 'task-queued',
          type: 'stock_sync',
          status: 'queued',
          priority: 1,
          deviceId: {_id: 'device-1', name: 'Phone 1'},
          serviceAccountId: {_id: 'service-1', label: 'Tokopedia Main'},
          payload: {},
          result: {},
          error: '',
          logs: [],
          createdBy: null,
          retryCount: 0,
          maxRetries: 3,
          startedAt: null,
          completedAt: null,
          createdAt: '',
          updatedAt: '',
        },
        {
          _id: 'task-processing',
          type: 'stock_sync',
          status: 'processing',
          priority: 1,
          deviceId: {_id: 'device-1', name: 'Phone 1'},
          serviceAccountId: {_id: 'service-1', label: 'Tokopedia Main'},
          payload: {},
          result: {},
          error: '',
          logs: [],
          createdBy: null,
          retryCount: 0,
          maxRetries: 3,
          startedAt: null,
          completedAt: null,
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 3, limit: 20},
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'tasks');
    const taskListText = renderText(renderer!);
    expect(taskListText).toContain('queued');
    expect(taskListText).toEqual(expect.arrayContaining(['Type', 'Status', 'Device', 'Account', 'Error', 'Created']));
    expect(taskListText).not.toContain('Action');
    expect(
      renderer!.root.findAllByProps({accessibilityLabel: 'AM Segment Queued'}),
    ).toHaveLength(0);
    expect(
      renderer!.root.findAllByProps({accessibilityLabel: 'AM Task Force Fail task-1'}),
    ).toHaveLength(0);
    expect(
      renderer!.root.findAllByProps({accessibilityLabel: 'AM Task Cancel task-queued'}),
    ).toHaveLength(0);
    expect(
      renderer!.root.findAllByProps({accessibilityLabel: 'AM Task Cancel task-processing'}),
    ).toHaveLength(0);
    expect(
      renderer!.root.findAllByProps({accessibilityLabel: 'AM Task Force Fail task-processing'}),
    ).not.toHaveLength(0);
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Task Cancel task-1'}).props.onPress();
    });

    expect(cancelAmTask).toHaveBeenCalledWith('task-1');
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Task Force Fail task-processing'}).props.onPress();
    });
    expect(forceFailAmTask).toHaveBeenCalledWith('task-processing');
    expect(getAmTasks).toHaveBeenCalledTimes(3);
  });

  it('keeps Tasks pagination in sync with AM live list metadata', async () => {
    jest.mocked(getAmTasks).mockResolvedValue({
      data: Array.from({length: 20}, (_, index) => ({
        _id: `task-page-${index + 1}`,
        type: 'stock_sync',
        status: 'success',
        priority: 1,
        deviceId: {_id: 'device-1', name: 'Phone 1'},
        serviceAccountId: {_id: 'service-1', label: 'Tokopedia Main'},
        payload: {},
        result: {},
        error: index === 0 ? 'Device offline' : '',
        logs: [],
        retryCount: 0,
        maxRetries: 3,
        startedAt: null,
        completedAt: null,
        createdBy: null,
        createdAt: '',
        updatedAt: '',
      })),
      meta: {total: 45, limit: 20, page: 1, totalPages: 3},
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'tasks');

    expect(getAmTasks).toHaveBeenLastCalledWith({
      page: 1,
      limit: 20,
      search: undefined,
      status: undefined,
      type: undefined,
    });
    const joinedPageText = renderText(renderer!).join(' ');
    expect(joinedPageText).toMatch(/Showing\s+1\s+to\s+20\s+of\s+45\s+items/);
    expect(joinedPageText).toContain('Page 1/3');
    expect(joinedPageText).toContain('Device offline');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Tasks Next Page'}).props.onPress();
    });

    expect(getAmTasks).toHaveBeenLastCalledWith({
      page: 2,
      limit: 20,
      search: undefined,
      status: undefined,
      type: undefined,
    });
  });

  it('keeps Tasks filters aligned with AM FE without service account or device filters', async () => {
    jest.mocked(getAmServiceAccounts).mockResolvedValue({
      data: [
        {
          _id: 'account-1',
          label: 'BCA Main',
          platform: 'bca',
          accountNumber: '123',
          status: 'active',
          deviceId: null,
          username: '',
          credentials: {},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 100},
    });
    jest.mocked(getAmDevices).mockResolvedValue({
      data: [
        {
          _id: 'device-1',
          name: 'Phone 1',
          slug: 'phone-1',
          boxId: 'box-1',
          connectionType: 'usb',
          udid: 'USB-1',
          tcpAddress: '',
          brand: 'Samsung',
          model: 'A1',
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 100},
    });
    jest.mocked(getAmTasks).mockResolvedValue({
      data: [],
      meta: {total: 0, limit: 20},
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'tasks');

    expect(getAmTasks).toHaveBeenLastCalledWith({
      page: 1,
      limit: 20,
      search: undefined,
      status: undefined,
      type: undefined,
    });
    expect(renderer!.root.findAllByProps({accessibilityLabel: 'AM Segment BCA Main - 123'})).toHaveLength(0);
    expect(renderer!.root.findAllByProps({accessibilityLabel: 'AM Segment Phone 1'})).toHaveLength(0);
    const filterText = renderText(renderer!).join(' ');
    expect(filterText).toContain('All Types');
    expect(filterText).toContain('All Status');
    expect(getAmServiceAccounts).not.toHaveBeenCalled();
    expect(getAmDevices).not.toHaveBeenCalled();
  });

  it('opens task detail from the Tasks route and loads payload, result, and logs', async () => {
    const task = {
      _id: 'task-detail',
      type: 'stock_sync',
      status: 'pending',
      priority: 2,
      deviceId: {_id: 'device-1', name: 'Phone 1'},
      serviceAccountId: {_id: 'service-1', label: 'Tokopedia Main', platform: 'tokopedia'},
      payload: {sku: 'SKU-1'},
      result: {synced: true},
      error: '',
      logs: ['created', 'waiting'],
      retryCount: 1,
      maxRetries: 3,
      startedAt: null,
      completedAt: null,
      createdBy: {_id: 'user-task', username: 'task-admin', email: 'task-admin@example.test'},
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '',
    };
    jest.mocked(getAmTasks).mockResolvedValue({
      data: [task],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmTaskById).mockResolvedValue(task);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'tasks');
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Task Detail task-detail'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Task Cancel task-detail'}).props.onPress();
    });

    expect(getAmTaskById).toHaveBeenCalledWith('task-detail');
    expect(cancelAmTask).toHaveBeenCalledWith('task-detail');
    const text = renderText(renderer!);
    const joinedText = text.join(' ');
    expect(text).toContain('Task Detail');
    expect(text).toContain('Overview');
    expect(text).toContain('Assignment');
    expect(text).toContain('Timeline');
    expect(joinedText).toContain('Created By task-admin');
    expect(text).toContain('Payload');
    expect(text).toContain('Result');
    expect(joinedText).toContain('"sku": "SKU-1"');
    expect(joinedText).toContain('"synced": true');
    expect(joinedText).toMatch(/Logs \(\s*2\s+lines\)/);
    expect(text).toContain('created');
    expect(text).toContain('waiting');
  });

  it('opens task detail directly from a concrete AM shell route', async () => {
    const task = {
      _id: 'task-detail',
      type: 'bank_transfer',
      status: 'processing',
      priority: 3,
      deviceId: {_id: 'device-1', name: 'Phone 1'},
      serviceAccountId: {_id: 'service-1', label: 'BCA Main', platform: 'bca'},
      payload: {amount: 125000},
      result: {},
      error: '',
      logs: ['started'],
      retryCount: 0,
      maxRetries: 3,
      startedAt: '2026-01-01T00:01:00.000Z',
      completedAt: null,
      createdBy: {_id: 'user-task', username: 'task-admin', email: 'task-admin@example.test'},
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '',
    };
    jest.mocked(getAmTaskById).mockResolvedValue(task);
    const onModuleRouteSelect = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface
          activeModuleRoute={concreteAmRoute('tasks/task-detail', 'tasks/:id')}
          dataset={seedUnifiedDataset}
          onModuleRouteSelect={onModuleRouteSelect}
        />,
      );
    });
    renderers.push(renderer!);

    expect(getAmTaskById).toHaveBeenCalledWith('task-detail');
    expect(recordAmPageView).toHaveBeenCalledWith('/tasks/task-detail');
    const text = renderText(renderer!);
    expect(text).toContain('Task Detail');
    expect(text).toContain('Bank Transfer');
    expect(text).toContain('started');
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Task Back'}).props.onPress();
    });

    expect(onModuleRouteSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        moduleId: 'am',
        route: 'tasks',
      }),
    );
  });

  it('keeps Services as the AM FE runtime list without service account CRUD controls', async () => {
    jest.mocked(getAmServiceAccounts).mockResolvedValue({
      data: [
        {
          _id: 'service-edit',
          platform: 'tokopedia',
          label: 'Tokopedia Old',
          deviceId: {
            _id: 'device-browser',
            name: 'Browser Worker',
            connectionType: 'browser',
            tcpAddress: null,
            udid: null,
          },
          status: 'inactive',
          username: 'old-user',
          accountNumber: '',
          credentials: {phoneNumber: '0812'},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 20},
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'services');

    const text = renderText(renderer!);

    expect(text).toContain('Tokopedia Old');
    expect(text).toContain('Stopped');
    expect(text).not.toContain('Create Service Account');
    expect(text).not.toContain('Edit Service Account');
    expect(text).not.toContain('Secret kosong saat edit tidak menghapus nilai tersimpan.');
    expect(renderer!.root.findAllByProps({accessibilityLabel: 'AM Service Account Save'})).toHaveLength(0);
    expect(renderer!.root.findAllByProps({accessibilityLabel: 'AM Service Edit service-edit'})).toHaveLength(0);
    expect(renderer!.root.findAllByProps({accessibilityLabel: 'AM Service Delete service-edit'})).toHaveLength(0);
    expect(renderer!.root.findAllByProps({accessibilityLabel: 'AM Service Platform Read Only'})).toHaveLength(0);
    expect(getAmDevices).not.toHaveBeenCalled();
    expect(createAmServiceAccount).not.toHaveBeenCalled();
    expect(updateAmServiceAccount).not.toHaveBeenCalled();
    expect(deleteAmServiceAccount).not.toHaveBeenCalled();
  });

  it('expands a service row and loads logs plus task history', async () => {
    jest.mocked(getAmServiceAccounts).mockResolvedValueOnce({
      data: [
        {
          _id: 'service-1',
          platform: 'tokopedia',
          label: 'Tokopedia Main',
          deviceId: {
            _id: 'device-1',
            name: 'Phone 1',
            connectionType: 'tcp',
            tcpAddress: '10.0.0.2:5555',
            udid: null,
          },
          status: 'active',
          credentials: {},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmTasks).mockResolvedValue({
      data: [
        {
          _id: 'task-history-1',
          type: 'stock_sync',
          status: 'success',
          priority: 1,
          deviceId: {_id: 'device-1', name: 'Phone 1'},
          serviceAccountId: {_id: 'service-1', label: 'Tokopedia Main'},
          payload: {},
          result: {},
          error: '',
          logs: [],
          createdBy: null,
          retryCount: 0,
          maxRetries: 3,
          startedAt: null,
          completedAt: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '',
        },
      ],
      meta: {total: 12, limit: 5, page: 1, totalPages: 3},
    });
    jest.mocked(getAmDeviceServiceLogs).mockResolvedValue({
      logs: [
        {ts: '2026-01-01T00:00:00.000Z', level: 'info', message: 'Realtime ready'},
      ],
      processRunning: true,
      total: 140,
      page: 1,
      limit: 100,
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'services');
    const serviceListText = renderText(renderer!).join(' ');
    expect(serviceListText).toContain('Running');
    expect(serviceListText).not.toContain('Ready');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Tokopedia Main'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Tokopedia Main History'}).props.onPress();
    });

    expect(getAmDeviceServiceLogs).toHaveBeenCalledWith('device-1', {
      limit: 100,
      page: 1,
      source: 'realtime',
    });
    expect(getAmDeviceServices).toHaveBeenCalledWith('device-1');
    expect(jest.requireMock('../src/services/am-api').getAmTasks).toHaveBeenCalledWith({
      limit: 5,
      page: 1,
      serviceAccountId: 'service-1',
    });
    expect(renderText(renderer!).join(' ')).toContain('Page 1/3');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Task History Next Page'}).props.onPress();
    });

    expect(jest.requireMock('../src/services/am-api').getAmTasks).toHaveBeenLastCalledWith({
      limit: 5,
      page: 2,
      serviceAccountId: 'service-1',
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Tokopedia Main Logs'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Segment History'}).props.onPress();
    });

    expect(getAmDeviceServiceLogs).toHaveBeenLastCalledWith('device-1', {
      limit: 100,
      page: 1,
      source: 'history',
    });
    expect(renderText(renderer!).join(' ')).toMatch(/Showing\s+1\s+to\s+100\s+of\s+140\s+items/);

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Logs History Next Page'}).props.onPress();
    });

    expect(getAmDeviceServiceLogs).toHaveBeenLastCalledWith('device-1', {
      limit: 100,
      page: 2,
      source: 'history',
    });
  });

  it('keeps banking service rows non-expandable like AM FE', async () => {
    jest.mocked(getAmServiceAccounts).mockResolvedValueOnce({
      data: [
        {
          _id: 'service-bca',
          platform: 'bca',
          label: 'BCA Main',
          deviceId: {
            _id: 'device-bca',
            name: 'Bank Device',
            connectionType: 'tcp',
            tcpAddress: '10.0.0.3:5555',
            udid: null,
          },
          status: 'active',
          username: 'bcauser',
          accountNumber: '123456',
          credentials: {},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 20},
    });
    jest.mocked(getAmTransfers).mockClear();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'services');
    const serviceRow = renderer!.root.findByProps({accessibilityLabel: 'AM Service BCA Main'});

    expect(serviceRow.props.onPress).toBeUndefined();
    expect(renderText(renderer!).join(' ')).toContain('Ready');
    expect(renderText(renderer!).join(' ')).not.toContain('Transfer History');
    expect(getAmTransfers).not.toHaveBeenCalled();
  });

  it('polls realtime service logs while a service is expanded', async () => {
    jest.useFakeTimers();
    jest.mocked(getAmServiceAccounts).mockResolvedValue({
      data: [
        {
          _id: 'service-live',
          platform: 'tokopedia',
          label: 'Tokopedia Live',
          deviceId: {
            _id: 'device-live',
            name: 'Phone Live',
            connectionType: 'tcp',
            tcpAddress: '10.0.0.8:5555',
            udid: null,
          },
          status: 'active',
          credentials: {},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmDeviceServiceLogs).mockResolvedValue({
      logs: [{ts: '2026-01-01T00:00:00.000Z', level: 'info', message: 'Realtime ready'}],
      processRunning: true,
      total: 1,
      page: 1,
      limit: 100,
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'services');
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Tokopedia Live'}).props.onPress();
    });

    expect(getAmDeviceServiceLogs).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(3000);
      await Promise.resolve();
    });

    expect(getAmDeviceServiceLogs).toHaveBeenCalledTimes(2);
    expect(getAmDeviceServiceLogs).toHaveBeenLastCalledWith('device-live', {
      limit: 100,
      page: 1,
      source: 'realtime',
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Tokopedia Live'}).props.onPress();
    });
    await act(async () => {
      jest.advanceTimersByTime(3000);
      await Promise.resolve();
    });

    expect(getAmDeviceServiceLogs).toHaveBeenCalledTimes(2);
  });

  it('sends service OTP input when runtime logs request it', async () => {
    setAccessToken('kolam-live-token');
    jest.mocked(getAmServiceAccounts).mockResolvedValue({
      data: [
        {
          _id: 'service-otp',
          platform: 'shopee',
          label: 'Shopee OTP',
          deviceId: {
            _id: 'device-otp',
            name: 'Phone OTP',
            connectionType: 'tcp',
            tcpAddress: '10.0.0.9:5555',
            udid: null,
          },
          status: 'active',
          credentials: {},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmDeviceServiceLogs).mockResolvedValue({
      logs: [
        {ts: '2026-01-01T00:00:00.000Z', level: 'info', message: 'OTP_REQUIRED'},
        {ts: '2026-01-01T00:00:01.000Z', level: 'info', message: '{"event":"qr_code","data":{"qrcodeId":"qr-1","status":"WAITING"}}'},
      ],
      processRunning: true,
    });
    jest.mocked(getAmDeviceServices).mockResolvedValue([
      {
        serviceAccountId: 'service-otp',
        label: 'Shopee OTP',
        platform: 'shopee',
        accountNumber: '',
        serviceStatus: 'active',
        taskStatus: 'running',
        processRunning: true,
        isBanking: false,
      },
    ]);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'services');
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Shopee OTP'}).props.onPress();
    });

    expect(
      renderer!.root.findByProps({accessibilityLabel: 'AM Service QR Image service-otp'}).props.source,
    ).toEqual({
      uri: 'https://frogs.dunia-anura.com/api/device/device-otp/service/shopee-qr?t=qr-1',
      headers: {
        Authorization: 'Bearer kolam-live-token',
        'x-source': 'am',
      },
    });

    const inputs = renderer!.root.findAllByType(TextInput);
    await act(async () => {
      inputs[inputs.length - 1].props.onChangeText('123456');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Submit Input service-otp'}).props.onPress();
    });

    expect(sendAmDeviceServiceInput).toHaveBeenCalledWith('device-otp', 'otp', '123456');
    expect(getAmDeviceServices).toHaveBeenCalledWith('device-otp');
  });

  it('renders nested QR base64 events from AM worker logs', async () => {
    jest.mocked(getAmServiceAccounts).mockResolvedValue({
      data: [
        {
          _id: 'service-qr-base64',
          platform: 'tiktok',
          label: 'TikTok QR',
          deviceId: {
            _id: 'device-qr-base64',
            name: 'Browser QR',
            connectionType: 'browser',
            tcpAddress: null,
            udid: null,
          },
          status: 'active',
          credentials: {},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmDeviceServiceLogs).mockResolvedValue({
      logs: [
        {
          ts: '2026-01-01T00:00:01.000Z',
          level: 'info',
          message: '{"event":"qr_code","data":{"qrcodeId":"qr-base64","qrcodeBase64":"data:image/png;base64,abc123","status":"WAITING"}}',
        },
      ],
      processRunning: true,
    });
    jest.mocked(getAmDeviceServices).mockResolvedValue([
      {
        serviceAccountId: 'service-qr-base64',
        label: 'TikTok QR',
        platform: 'tiktok',
        accountNumber: '',
        serviceStatus: 'active',
        taskStatus: 'running',
        processRunning: true,
        isBanking: false,
      },
    ]);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'services');
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Service TikTok QR'}).props.onPress();
    });

    expect(
      renderer!.root.findByProps({accessibilityLabel: 'AM Service QR Image service-qr-base64'}).props.source,
    ).toEqual({
      uri: 'data:image/png;base64,abc123',
    });
  });

  it('sends password-required runtime input through the AM BE password command channel', async () => {
    jest.mocked(getAmServiceAccounts).mockResolvedValue({
      data: [
        {
          _id: 'service-password',
          platform: 'instagram',
          label: 'Instagram Password',
          deviceId: {
            _id: 'device-password',
            name: 'Browser Password',
            connectionType: 'browser',
            tcpAddress: null,
            udid: null,
          },
          status: 'active',
          credentials: {},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmDeviceServiceLogs).mockResolvedValue({
      logs: [
        {ts: '2026-01-01T00:00:00.000Z', level: 'info', message: 'PASSWORD_REQUIRED'},
      ],
      processRunning: true,
    });
    jest.mocked(getAmDeviceServices).mockResolvedValue([]);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'services');
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Instagram Password'}).props.onPress();
    });

    const inputs = renderer!.root.findAllByType(TextInput);
    expect(inputs[inputs.length - 1].props.placeholder).toBe('Masukkan password service');
    await act(async () => {
      inputs[inputs.length - 1].props.onChangeText('SecretPass1!');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Submit Input service-password'}).props.onPress();
    });

    expect(sendAmDeviceServiceInput).toHaveBeenCalledWith('device-password', 'password', 'SecretPass1!');
  });

  it('hides service input after runtime logs report login success', async () => {
    jest.mocked(getAmServiceAccounts).mockResolvedValue({
      data: [
        {
          _id: 'service-login-ok',
          platform: 'shopee',
          label: 'Shopee Login OK',
          deviceId: {
            _id: 'device-login-ok',
            name: 'Phone Login OK',
            connectionType: 'tcp',
            tcpAddress: '10.0.0.10:5555',
            udid: null,
          },
          status: 'active',
          credentials: {},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmDeviceServiceLogs).mockResolvedValue({
      logs: [
        {ts: '2026-01-01T00:00:00.000Z', level: 'info', message: 'OTP_REQUIRED'},
        {ts: '2026-01-01T00:00:01.000Z', level: 'info', message: 'QR_LOGIN {"qrcodeId":"stale-qr","status":"WAITING"}'},
        {ts: '2026-01-01T00:00:02.000Z', level: 'info', message: '{"event":"login_success"}'},
      ],
      processRunning: true,
    });
    jest.mocked(getAmDeviceServices).mockResolvedValue([]);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'services');
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Shopee Login OK'}).props.onPress();
    });

    expect(
      renderer!.root.findAllByProps({accessibilityLabel: 'AM Service Submit Input service-login-ok'}),
    ).toHaveLength(0);
    expect(
      renderer!.root.findAllByProps({accessibilityLabel: 'AM Service QR Image service-login-ok'}),
    ).toHaveLength(0);
    expect(renderText(renderer!)).not.toContain('Masukkan OTP service');
  });

  it('hides stale QR login images when the AM BE service process has stopped', async () => {
    jest.mocked(getAmServiceAccounts).mockResolvedValue({
      data: [
        {
          _id: 'service-stopped-qr',
          platform: 'shopee',
          label: 'Shopee Stopped QR',
          deviceId: {
            _id: 'device-stopped-qr',
            name: 'Phone Stopped QR',
            connectionType: 'tcp',
            tcpAddress: '10.0.0.11:5555',
            udid: null,
          },
          status: 'inactive',
          credentials: {},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmDeviceServiceLogs).mockResolvedValue({
      logs: [
        {ts: '2026-01-01T00:00:01.000Z', level: 'info', message: 'QR_LOGIN {"qrcodeId":"stale-qr","status":"WAITING"}'},
      ],
      processRunning: false,
    });
    jest.mocked(getAmDeviceServices).mockResolvedValue([
      {
        serviceAccountId: 'service-stopped-qr',
        label: 'Shopee Stopped QR',
        platform: 'shopee',
        accountNumber: '',
        serviceStatus: 'inactive',
        taskStatus: 'idle',
        processRunning: false,
        isBanking: false,
      },
    ]);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'services');
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Shopee Stopped QR'}).props.onPress();
    });

    expect(
      renderer!.root.findAllByProps({accessibilityLabel: 'AM Service QR Image service-stopped-qr'}),
    ).toHaveLength(0);
    expect(renderText(renderer!)).toContain('Runtime');
  });

  it('runs service start and clear session actions from Services', async () => {
    jest.mocked(getAmServiceAccounts).mockResolvedValue({
      data: [
        {
          _id: 'service-2',
          platform: 'tokopedia',
          label: 'Tokopedia Session',
          deviceId: {
            _id: 'device-2',
            name: 'Phone 2',
            connectionType: 'tcp',
            tcpAddress: '10.0.0.3:5555',
            udid: null,
          },
          status: 'inactive',
          credentials: {},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
        {
          _id: 'service-active',
          platform: 'shopee',
          label: 'Shopee Running',
          deviceId: {
            _id: 'device-active',
            name: 'Browser Active',
            connectionType: 'browser',
            tcpAddress: null,
            udid: null,
          },
          status: 'active',
          credentials: {},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'services');
    const inactivePowerSwitch = renderer!.root.findAllByProps({
      accessibilityLabel: 'AM Service Power service-2',
    }).find(node => node.props.accessibilityState);
    const activePowerSwitch = renderer!.root.findAllByProps({
      accessibilityLabel: 'AM Service Power service-active',
    }).find(node => node.props.accessibilityState);
    expect(inactivePowerSwitch).toBeDefined();
    expect(activePowerSwitch).toBeDefined();
    expect(
      inactivePowerSwitch!.props.accessibilityState,
    ).toEqual({checked: false, disabled: false});
    expect(
      activePowerSwitch!.props.accessibilityState,
    ).toEqual({checked: true, disabled: false});
    await act(async () => {
      inactivePowerSwitch!.props.onPress();
    });
    await act(async () => {
      activePowerSwitch!.props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Tokopedia Session'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Clear Session service-2'}).props.onPress();
    });
    expect(clearAmServiceAccountSession).not.toHaveBeenCalled();
    let serviceText = renderText(renderer!).join(' ').replace(/\s+/g, ' ');
    expect(serviceText).toContain('Clear session Tokopedia Session ?');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Cancel Clear Session'}).props.onPress();
    });
    serviceText = renderText(renderer!).join(' ').replace(/\s+/g, ' ');
    expect(serviceText).not.toContain('Clear session Tokopedia Session ?');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Clear Session service-2'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Confirm Clear Session service-2'}).props.onPress();
    });

    expect(startAmDeviceService).toHaveBeenCalledWith('device-2', 'service-2');
    expect(stopAmDeviceService).toHaveBeenCalledWith('device-active', 'service-active');
    expect(clearAmServiceAccountSession).toHaveBeenCalledWith('service-2');
  });

  it('renders Tokopedia session parity actions from Services detail', async () => {
    jest.mocked(getAmServiceAccounts).mockResolvedValue({
      data: [
        {
          _id: 'service-tokopedia',
          platform: 'tokopedia',
          label: 'Tokopedia Seller',
          deviceId: {
            _id: 'device-tokopedia',
            name: 'Browser Worker',
            connectionType: 'browser',
            tcpAddress: null,
            udid: null,
          },
          status: 'active',
          credentials: {},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmDeviceServiceLogs).mockResolvedValue({
      logs: [
        {
          ts: '2026-01-01T00:00:00.000Z',
          level: 'info',
          message: 'QR_LOGIN {"qrcodeId":"tokopedia-qr","qrcodeBase64":"data:image/png;base64,T0s=","status":"WAITING"}',
        },
      ],
      processRunning: true,
    });
    jest.mocked(getAmTokopediaSession).mockResolvedValue({
      status: 'ready',
      cookieCount: 5,
      expiredCount: 0,
      sessionCookieCount: 2,
      updatedAt: '2026-01-01T00:00:00.000Z',
      hasFingerprint: true,
      serviceStatus: 'active',
      hasDevice: true,
      captchaAutoSolve: false,
      hasAnthropicApiKey: true,
      anthropicApiKeyPreview: 'sk-ant-...',
      envFallbackAvailable: true,
      qrTiktokLogin: true,
      loginFillOnly: false,
    });
    jest.mocked(getAmDeviceServices).mockResolvedValue([
      {
        serviceAccountId: 'service-tokopedia',
        label: 'Tokopedia Seller',
        platform: 'tokopedia',
        accountNumber: '',
        serviceStatus: 'active',
        taskStatus: 'running',
        processRunning: true,
        isBanking: false,
      },
    ]);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'services');
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Tokopedia Seller'}).props.onPress();
    });

    expect(getAmTokopediaSession).not.toHaveBeenCalled();
    expect(renderText(renderer!).join(' ')).toContain('Session');
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Tokopedia Seller Session'}).props.onPress();
    });

    const joinedText = renderText(renderer!).join(' ');
    expect(joinedText).toContain('Session Login Tokopedia');
    expect(joinedText).toContain('Session tersedia');
    expect(joinedText).toContain('Cookies');
    expect(renderer!.root.findByProps({accessibilityLabel: 'AM Tokopedia QR Image service-tokopedia'}).props.source).toEqual({
      uri: 'data:image/png;base64,T0s=',
    });
    expect(getAmTokopediaSession).toHaveBeenCalledWith('service-tokopedia');
    expect(getAmTokopediaApiMonitorStatus).toHaveBeenCalledWith('service-tokopedia');
    expect(getAmDeviceServiceLogs).toHaveBeenCalledWith('device-tokopedia', {
      limit: 80,
      source: 'realtime',
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Tokopedia Login QR service-tokopedia'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Tokopedia Captcha Toggle service-tokopedia'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Tokopedia Captcha Save service-tokopedia'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Tokopedia Captcha Clear Key service-tokopedia'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Tokopedia Verify service-tokopedia'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Tokopedia Restart service-tokopedia'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Tokopedia QR Start service-tokopedia'}).props.onPress();
    });
    const cookiesInput = renderer!.root.findByProps({
      accessibilityLabel: 'AM Tokopedia Cookies JSON service-tokopedia',
    });
    await act(async () => {
      cookiesInput.props.onChangeText(JSON.stringify({
        cookies: [{name: 'sid', value: 'cookie-value'}],
      }));
    });
    expect(renderText(renderer!).join(' ')).toContain('Siap upload: 1 cookies');
    const serviceAccountLoadCountBeforeUpload = jest.mocked(getAmServiceAccounts).mock.calls.length;
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Tokopedia Save Cookies service-tokopedia'}).props.onPress();
    });
    expect(jest.mocked(getAmServiceAccounts).mock.calls.length).toBeGreaterThan(serviceAccountLoadCountBeforeUpload);
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Tokopedia Api Monitor service-tokopedia'}).props.onPress();
    });

    expect(updateAmTokopediaLoginMethod).toHaveBeenCalledWith('service-tokopedia', {
      qrTiktokLogin: true,
      loginFillOnly: false,
    });
    expect(updateAmTokopediaCaptchaSettings).toHaveBeenCalledWith('service-tokopedia', {
      captchaAutoSolve: true,
      anthropicApiKey: undefined,
    });
    expect(updateAmTokopediaCaptchaSettings).toHaveBeenCalledWith('service-tokopedia', {
      captchaAutoSolve: false,
      clearAnthropicApiKey: true,
    });
    expect(verifyAmTokopediaSession).toHaveBeenCalledWith('service-tokopedia');
    expect(restartAmTokopediaSession).toHaveBeenCalledWith('service-tokopedia');
    expect(startAmTokopediaQrLogin).toHaveBeenCalledWith('service-tokopedia');
    expect(uploadAmTokopediaSession).toHaveBeenCalledWith('service-tokopedia', [
      {name: 'sid', value: 'cookie-value'},
    ]);
    expect(runAmTokopediaApiMonitor).toHaveBeenCalledWith('service-tokopedia', {
      autoRestart: true,
      fillLogin: false,
    });
  });

  it('loads live hardware topology from the Hardware route', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'hardware');

    expect(getAmRacks).toHaveBeenCalledTimes(1);
    expect(getAmDevices).toHaveBeenCalledTimes(1);
  });

  it('drills down hardware from rack to box to device detail', async () => {
    jest.mocked(getAmRacks).mockResolvedValueOnce({
      data: [
        {
          _id: 'rack-1',
          name: 'Rack Alpha',
          slug: 'rack-alpha',
          location: 'Room A',
          description: '',
          status: 'active',
          serverIp: '10.0.0.1:2700',
          boxCount: 1,
          deviceCount: 1,
          addedBy: {_id: 'user-1', fullName: 'Hardware Admin'},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(jest.requireMock('../src/services/am-api').getAmBoxes).mockResolvedValueOnce({
      data: [
        {
          _id: 'box-1',
          name: 'Box 01',
          slug: 'box-01',
          rackId: {_id: 'rack-1', name: 'Rack Alpha'},
          description: 'Main box',
          status: 'active',
          deviceCount: 1,
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmDevices).mockResolvedValueOnce({
      data: [
        {
          _id: 'device-1',
          name: 'Phone Rack',
          slug: 'phone-rack',
          boxId: {
            _id: 'box-1',
            name: 'Box 01',
            rackId: {_id: 'rack-1', name: 'Rack Alpha'},
          },
          connectionType: 'tcp',
          tcpAddress: '10.0.0.5:5555',
          udid: null,
          brand: 'Samsung',
          model: 'A15',
          adbStatus: 'connected',
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmDevicesAdbStatus).mockResolvedValueOnce({
      'device-1': 'unauthorized',
    });
    jest.mocked(getAmServiceAccounts).mockResolvedValueOnce({
      data: [
        {
          _id: 'service-1',
          label: 'BCA Device Alpha',
          platform: 'bca',
          accountNumber: '1234567890',
          balance: 250000,
          status: 'active',
          deviceId: {
            _id: 'device-1',
            name: 'Phone Rack',
            connectionType: 'tcp',
            tcpAddress: '10.0.0.5:5555',
          },
          username: 'bcauser',
          credentials: {},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 100},
    });
    jest.mocked(getAmDeviceServices).mockResolvedValueOnce([
      {
        serviceAccountId: 'service-1',
        label: 'BCA Device Alpha',
        platform: 'bca',
        accountNumber: '1234567890',
        serviceStatus: 'running',
        taskStatus: 'idle',
        processRunning: true,
        isBanking: true,
      },
    ]);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'hardware');
    let hardwareText = renderText(renderer!).join(' ').replace(/\s+/g, ' ');
    expect(hardwareText).toContain('Added By Hardware Admin');
    expect(hardwareText).not.toContain('Phone Rack');
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Rack Rack Alpha'}).props.onPress();
    });
    hardwareText = renderText(renderer!).join(' ').replace(/\s+/g, ' ');
    expect(hardwareText).toContain('Box 01');
    expect(hardwareText).not.toContain('Phone Rack');
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Box Box 01'}).props.onPress();
    });
    expect(getAmDevicesAdbStatus).toHaveBeenCalledWith('box-1');
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Device Phone Rack'}).props.onPress();
    });

    const text = renderText(renderer!);
    const detailText = text.join(' ').replace(/\s+/g, ' ');
    expect(text).toContain('Phone Rack');
    expect(text).toContain('Samsung');
    expect(text).toContain('A15');
    expect(text).toContain('Unauthorized');
    expect(getAmServiceAccounts).toHaveBeenCalledWith({deviceId: 'device-1', limit: 100});
    expect(getAmDeviceServices).toHaveBeenCalledWith('device-1');
    expect(text).toContain('Service Accounts');
    expect(text).toContain('BCA Device Alpha');
    expect(text).toContain('bcauser');
    expect(text).toContain('1234567890');
    expect(detailText).toContain('Rp 250.000');
    expect(text).toContain('Running');
  });

  it('opens hardware device detail directly from a concrete AM shell route', async () => {
    jest.mocked(getAmRacks).mockResolvedValueOnce({
      data: [
        {
          _id: 'rack-1',
          name: 'Rack Alpha',
          slug: 'rack-alpha',
          location: 'Room A',
          description: '',
          status: 'active',
          serverIp: '10.0.0.1:2700',
          boxCount: 1,
          deviceCount: 1,
          addedBy: {_id: 'user-1', fullName: 'Hardware Admin'},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(jest.requireMock('../src/services/am-api').getAmBoxes).mockResolvedValueOnce({
      data: [
        {
          _id: 'box-1',
          name: 'Box 01',
          slug: 'box-01',
          rackId: {_id: 'rack-1', name: 'Rack Alpha'},
          description: 'Main box',
          status: 'active',
          deviceCount: 1,
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmDevices).mockResolvedValueOnce({
      data: [
        {
          _id: 'device-1',
          name: 'Phone Rack',
          slug: 'phone-rack',
          boxId: {
            _id: 'box-1',
            name: 'Box 01',
            rackId: {_id: 'rack-1', name: 'Rack Alpha'},
          },
          connectionType: 'tcp',
          tcpAddress: '10.0.0.5:5555',
          udid: null,
          brand: 'Samsung',
          model: 'A15',
          adbStatus: 'connected',
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmDevicesAdbStatus).mockResolvedValueOnce({
      'device-1': 'connected',
    });
    jest.mocked(getAmRackById).mockResolvedValueOnce({
      _id: 'rack-1',
      name: 'Rack Alpha',
      slug: 'rack-alpha',
      location: 'Room A',
      description: '',
      status: 'active',
      serverIp: '10.0.0.1:2700',
      boxCount: 1,
      deviceCount: 1,
      addedBy: {_id: 'user-1', fullName: 'Hardware Admin'},
      createdAt: '',
      updatedAt: '',
    });
    jest.mocked(getAmBoxById).mockResolvedValueOnce({
      _id: 'box-1',
      name: 'Box 01',
      slug: 'box-01',
      rackId: {_id: 'rack-1', name: 'Rack Alpha'},
      description: 'Main box',
      status: 'active',
      deviceCount: 1,
      createdAt: '',
      updatedAt: '',
    });
    jest.mocked(getAmDeviceById).mockResolvedValueOnce({
      _id: 'device-1',
      name: 'Phone Rack',
      slug: 'phone-rack',
      boxId: {
        _id: 'box-1',
        name: 'Box 01',
        rackId: {_id: 'rack-1', name: 'Rack Alpha'},
      },
      connectionType: 'tcp',
      tcpAddress: '10.0.0.5:5555',
      udid: null,
      brand: 'Samsung',
      model: 'A15',
      adbStatus: 'connected',
      createdAt: '',
      updatedAt: '',
    });
    jest.mocked(getAmServiceAccounts).mockResolvedValue({
      data: [
        {
          _id: 'service-1',
          label: 'BCA Device Alpha',
          platform: 'bca',
          accountNumber: '1234567890',
          status: 'inactive',
          deviceId: {
            _id: 'device-1',
            name: 'Phone Rack',
            connectionType: 'tcp',
            tcpAddress: '10.0.0.5:5555',
          },
          username: 'bcauser',
          credentials: {},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 100},
    });
    jest.mocked(getAmDevices).mockResolvedValue({
      data: [
        {
          _id: 'device-1',
          name: 'Phone Rack',
          slug: 'phone-rack',
          boxId: {
            _id: 'box-1',
            name: 'Box 01',
            rackId: {_id: 'rack-1', name: 'Rack Alpha'},
          },
          connectionType: 'tcp',
          tcpAddress: '10.0.0.5:5555',
          udid: null,
          brand: 'Samsung',
          model: 'A15',
          adbStatus: 'connected',
          createdAt: '',
          updatedAt: '',
        },
        {
          _id: 'device-2',
          name: 'Phone Target',
          slug: 'phone-target',
          boxId: {
            _id: 'box-1',
            name: 'Box 01',
            rackId: {_id: 'rack-1', name: 'Rack Alpha'},
          },
          connectionType: 'tcp',
          tcpAddress: '10.0.0.6:5555',
          udid: null,
          brand: 'Samsung',
          model: 'A25',
          adbStatus: 'connected',
          createdAt: '',
          updatedAt: '',
        },
        {
          _id: 'device-browser',
          name: 'Browser Target',
          slug: 'browser-target',
          boxId: {
            _id: 'box-1',
            name: 'Box 01',
            rackId: {_id: 'rack-1', name: 'Rack Alpha'},
          },
          connectionType: 'browser',
          tcpAddress: null,
          udid: null,
          brand: 'Playwright',
          model: 'Chromium',
          adbStatus: 'connected',
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 3, limit: 100},
    });
    jest.mocked(getAmDeviceServices).mockResolvedValue([]);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface
          activeModuleRoute={concreteAmRoute(
            'hardware/rack-1/box-1/device-1',
            'hardware/:rackId/:boxId/:deviceId',
          )}
          dataset={seedUnifiedDataset}
        />,
      );
    });
    renderers.push(renderer!);

    const text = renderText(renderer!);
    const joinedText = text.join(' ');
    expect(recordAmPageView).toHaveBeenCalledWith('/hardware/rack-1/box-1/device-1');
    expect(joinedText).toContain('Rack Alpha');
    expect(joinedText).toContain('Box 01');
    expect(text).toContain('Phone Rack');
    expect(text).toContain('Samsung');
    expect(text).toContain('A15');
    expect(getAmDevicesAdbStatus).toHaveBeenCalledWith('box-1');
    expect(getAmServiceAccounts).toHaveBeenCalledWith({deviceId: 'device-1', limit: 100});
    expect(getAmDeviceServices).toHaveBeenCalledWith('device-1');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Device Delete Service Account service-1'}).props.onPress();
    });

    expect(deleteAmServiceAccount).toHaveBeenCalledWith('service-1');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Device Edit Service Account service-1'}).props.onPress();
    });
    await act(async () => {
      await Promise.resolve();
    });

    const findInput = (placeholder: string) => renderer!.root.findAllByType(TextInput).find(input => input.props.placeholder === placeholder);
    await act(async () => {
      findInput('Service label')!.props.onChangeText('BCA Detail Updated');
      findInput('myBCA username')!.props.onChangeText('bca-updated');
      findInput('e.g. 1234567890')!.props.onChangeText('9876543210');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Device Service Target Phone Target'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Device Save Service Account device-1'}).props.onPress();
    });

    expect(updateAmServiceAccount).toHaveBeenCalledWith('service-1', expect.objectContaining({
      label: 'BCA Detail Updated',
      deviceId: 'device-2',
      username: 'bca-updated',
      accountNumber: '9876543210',
      credentials: {},
      status: 'inactive',
    }));
    expect(updateAmServiceAccount).toHaveBeenCalledWith('service-1', expect.not.objectContaining({
      platform: expect.anything(),
      password: '',
      pin: '',
    }));

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Device Add Service Account device-1'}).props.onPress();
    });

    await act(async () => {
      findInput('Service label')!.props.onChangeText('BCA Detail New');
      findInput('myBCA username')!.props.onChangeText('bca-detail');
      findInput('myBCA password')!.props.onChangeText('secret');
      findInput('Account PIN')!.props.onChangeText('123456');
      findInput('e.g. 1234567890')!.props.onChangeText('9876543210');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Device Save Service Account device-1'}).props.onPress();
    });

    expect(createAmServiceAccount).toHaveBeenCalledWith(expect.objectContaining({
      platform: 'bca',
      label: 'BCA Detail New',
      deviceId: 'device-1',
      username: 'bca-detail',
      password: 'secret',
      pin: '123456',
      accountNumber: '9876543210',
      credentials: {},
    }));
    expect(createAmServiceAccount).toHaveBeenCalledWith(expect.not.objectContaining({
      status: expect.anything(),
    }));

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Device Add Service Account device-1'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Segment DANA'}).props.onPress();
    });
    expect(findInput('myBCA username')).toBeUndefined();
    expect(findInput('Store password')).toBeUndefined();
    expect(findInput('e.g. 1234567890')).toBeUndefined();
    await act(async () => {
      findInput('Service label')!.props.onChangeText('DANA Detail');
      findInput('PIN DANA')!.props.onChangeText('654321');
      findInput('e.g. 081234567890')!.props.onChangeText('081234567890');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Device Save Service Account device-1'}).props.onPress();
    });

    expect(createAmServiceAccount).toHaveBeenLastCalledWith(expect.objectContaining({
      platform: 'dana',
      label: 'DANA Detail',
      deviceId: 'device-1',
      pin: '654321',
      credentials: {phoneNumber: '081234567890'},
    }));
    expect(createAmServiceAccount).toHaveBeenLastCalledWith(expect.not.objectContaining({
      username: expect.anything(),
      password: expect.anything(),
      accountNumber: expect.anything(),
      status: expect.anything(),
    }));
  });

  it('routes hardware direct detail back to its parent box route', async () => {
    jest.mocked(getAmRacks).mockResolvedValue({
      data: [
        {
          _id: 'rack-1',
          name: 'Rack Alpha',
          slug: 'rack-alpha',
          location: 'Room A',
          description: '',
          status: 'active',
          serverIp: '10.0.0.1:2700',
          boxCount: 1,
          deviceCount: 1,
          addedBy: {_id: 'user-1', fullName: 'Hardware Admin'},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(jest.requireMock('../src/services/am-api').getAmBoxes).mockResolvedValue({
      data: [
        {
          _id: 'box-1',
          name: 'Box 01',
          slug: 'box-01',
          rackId: {_id: 'rack-1', name: 'Rack Alpha'},
          description: 'Main box',
          status: 'active',
          deviceCount: 1,
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmDevices).mockResolvedValue({
      data: [
        {
          _id: 'device-1',
          name: 'Phone Rack',
          slug: 'phone-rack',
          boxId: {
            _id: 'box-1',
            name: 'Box 01',
            rackId: {_id: 'rack-1', name: 'Rack Alpha'},
          },
          connectionType: 'tcp',
          tcpAddress: '10.0.0.5:5555',
          udid: null,
          brand: 'Samsung',
          model: 'A15',
          adbStatus: 'connected',
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmRackById).mockResolvedValue({
      _id: 'rack-1',
      name: 'Rack Alpha',
      slug: 'rack-alpha',
      location: 'Room A',
      description: '',
      status: 'active',
      serverIp: '10.0.0.1:2700',
      boxCount: 1,
      deviceCount: 1,
      addedBy: {_id: 'user-1', fullName: 'Hardware Admin'},
      createdAt: '',
      updatedAt: '',
    });
    jest.mocked(getAmBoxById).mockResolvedValue({
      _id: 'box-1',
      name: 'Box 01',
      slug: 'box-01',
      rackId: {_id: 'rack-1', name: 'Rack Alpha'},
      description: 'Main box',
      status: 'active',
      deviceCount: 1,
      createdAt: '',
      updatedAt: '',
    });
    jest.mocked(getAmDeviceById).mockResolvedValue({
      _id: 'device-1',
      name: 'Phone Rack',
      slug: 'phone-rack',
      boxId: {
        _id: 'box-1',
        name: 'Box 01',
        rackId: {_id: 'rack-1', name: 'Rack Alpha'},
      },
      connectionType: 'tcp',
      tcpAddress: '10.0.0.5:5555',
      udid: null,
      brand: 'Samsung',
      model: 'A15',
      adbStatus: 'connected',
      createdAt: '',
      updatedAt: '',
    });
    const onModuleRouteSelect = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface
          activeModuleRoute={concreteAmRoute(
            'hardware/rack-1/box-1/device-1',
            'hardware/:rackId/:boxId/:deviceId',
          )}
          dataset={seedUnifiedDataset}
          onModuleRouteSelect={onModuleRouteSelect}
        />,
      );
    });
    renderers.push(renderer!);

    expect(renderText(renderer!)).toContain('Phone Rack');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Back'}).props.onPress();
    });

    expect(onModuleRouteSelect).toHaveBeenCalledWith(
      concreteAmRoute('hardware/rack-1/box-1', 'hardware/:rackId/:boxId'),
    );
  });

  it('defaults browser device service creation to WhatsApp like AM FE', async () => {
    jest.mocked(getAmRackById).mockResolvedValue({
      _id: 'rack-1',
      name: 'Rack Alpha',
      slug: 'rack-alpha',
      location: 'Room A',
      description: '',
      status: 'active',
      serverIp: '10.0.0.1',
      boxCount: 1,
      deviceCount: 1,
      createdAt: '',
      updatedAt: '',
    });
    jest.mocked(getAmBoxById).mockResolvedValue({
      _id: 'box-1',
      name: 'Box 01',
      slug: 'box-01',
      rackId: {_id: 'rack-1', name: 'Rack Alpha'},
      description: '',
      status: 'active',
      deviceCount: 1,
      createdAt: '',
      updatedAt: '',
    });
    const browserDevice = {
      _id: 'device-browser',
      name: 'Browser Target',
      slug: 'browser-target',
      boxId: {
        _id: 'box-1',
        name: 'Box 01',
        rackId: {_id: 'rack-1', name: 'Rack Alpha'},
      },
      connectionType: 'browser',
      tcpAddress: null,
      udid: null,
      brand: 'Playwright',
      model: 'Chromium',
      adbStatus: 'connected',
      createdAt: '',
      updatedAt: '',
    };
    jest.mocked(getAmDeviceById).mockResolvedValue(browserDevice);
    jest.mocked(getAmRacks).mockResolvedValue({
      data: [],
      meta: {total: 0, limit: 20},
    });
    jest.mocked(getAmBoxes).mockResolvedValue({
      data: [],
      meta: {total: 0, limit: 20},
    });
    jest.mocked(getAmDevices).mockResolvedValue({
      data: [browserDevice],
      meta: {total: 1, limit: 20},
    });
    jest.mocked(getAmServiceAccounts).mockResolvedValue({
      data: [],
      meta: {total: 0, limit: 100},
    });
    jest.mocked(getAmDeviceServices).mockResolvedValue([]);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface
          activeModuleRoute={concreteAmRoute(
            'hardware/rack-1/box-1/browser-target',
            'hardware/:rackId/:boxId/:deviceId',
          )}
          dataset={seedUnifiedDataset}
        />,
      );
    });
    renderers.push(renderer!);

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Device Add Service Account device-browser'}).props.onPress();
    });

    const findInput = (placeholder: string) => renderer!.root.findAllByType(TextInput).find(input => input.props.placeholder === placeholder);
    expect(findInput('Store login email')).toBeUndefined();
    expect(findInput('Store password')).toBeUndefined();
    expect(findInput('Account PIN')).toBeUndefined();
    expect(findInput('e.g. 1234567890')).toBeUndefined();
    await act(async () => {
      findInput('Service label')!.props.onChangeText('WA Browser');
      findInput('e.g. 08123456789')!.props.onChangeText('08123456789');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Device Save Service Account device-browser'}).props.onPress();
    });

    expect(createAmServiceAccount).toHaveBeenCalledWith(expect.objectContaining({
      platform: 'whatsapp',
      label: 'WA Browser',
      deviceId: 'device-browser',
      credentials: {phoneNumber: '08123456789'},
    }));
    expect(createAmServiceAccount).toHaveBeenCalledWith(expect.not.objectContaining({
      pin: expect.anything(),
      status: expect.anything(),
    }));
  });

  it('hides service creation on browser devices that already have an exclusive service', async () => {
    jest.mocked(getAmRackById).mockResolvedValue({
      _id: 'rack-1',
      name: 'Rack Alpha',
      slug: 'rack-alpha',
      location: 'Room A',
      description: '',
      status: 'active',
      serverIp: '10.0.0.1',
      boxCount: 1,
      deviceCount: 1,
      createdAt: '',
      updatedAt: '',
    });
    jest.mocked(getAmBoxById).mockResolvedValue({
      _id: 'box-1',
      name: 'Box 01',
      slug: 'box-01',
      rackId: {_id: 'rack-1', name: 'Rack Alpha'},
      description: '',
      status: 'active',
      deviceCount: 1,
      createdAt: '',
      updatedAt: '',
    });
    const browserDevice = {
      _id: 'device-browser',
      name: 'Browser Target',
      slug: 'browser-target',
      boxId: {
        _id: 'box-1',
        name: 'Box 01',
        rackId: {_id: 'rack-1', name: 'Rack Alpha'},
      },
      connectionType: 'browser',
      tcpAddress: null,
      udid: null,
      brand: 'Playwright',
      model: 'Chromium',
      adbStatus: 'connected',
      createdAt: '',
      updatedAt: '',
    };
    jest.mocked(getAmDeviceById).mockResolvedValue(browserDevice);
    jest.mocked(getAmRacks).mockResolvedValue({
      data: [],
      meta: {total: 0, limit: 20},
    });
    jest.mocked(getAmBoxes).mockResolvedValue({
      data: [],
      meta: {total: 0, limit: 20},
    });
    jest.mocked(getAmDevices).mockResolvedValue({
      data: [browserDevice],
      meta: {total: 1, limit: 20},
    });
    jest.mocked(getAmServiceAccounts).mockResolvedValue({
      data: [
        {
          _id: 'service-web-1',
          label: 'WA Browser',
          platform: 'whatsapp',
          accountNumber: '',
          status: 'inactive',
          deviceId: {
            _id: 'device-browser',
            name: 'Browser Target',
            connectionType: 'browser',
          },
          username: '',
          credentials: {phoneNumber: '08123456789'},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 100},
    });
    jest.mocked(getAmDeviceServices).mockResolvedValue([]);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface
          activeModuleRoute={concreteAmRoute(
            'hardware/rack-1/box-1/browser-target',
            'hardware/:rackId/:boxId/:deviceId',
          )}
          dataset={seedUnifiedDataset}
        />,
      );
    });
    renderers.push(renderer!);

    expect(
      renderer!.root.findAllByProps({accessibilityLabel: 'AM Device Add Service Account device-browser'}),
    ).toHaveLength(0);
  });

  it('blocks moving an active hardware service account to another device', async () => {
    jest.mocked(getAmRacks).mockResolvedValue({
      data: [
        {
          _id: 'rack-1',
          name: 'Rack Alpha',
          slug: 'rack-alpha',
          location: 'Room A',
          description: '',
          status: 'active',
          serverIp: '10.0.0.1:2700',
          boxCount: 1,
          deviceCount: 2,
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 20},
    });
    jest.mocked(jest.requireMock('../src/services/am-api').getAmBoxes).mockResolvedValue({
      data: [
        {
          _id: 'box-1',
          name: 'Box 01',
          slug: 'box-01',
          rackId: {_id: 'rack-1', name: 'Rack Alpha'},
          description: 'Main box',
          status: 'active',
          deviceCount: 2,
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 20},
    });
    jest.mocked(getAmDevices).mockResolvedValue({
      data: [
        {
          _id: 'device-1',
          name: 'Phone Rack',
          slug: 'phone-rack',
          boxId: {
            _id: 'box-1',
            name: 'Box 01',
            rackId: {_id: 'rack-1', name: 'Rack Alpha'},
          },
          connectionType: 'tcp',
          tcpAddress: '10.0.0.5:5555',
          udid: null,
          brand: 'Samsung',
          model: 'A15',
          adbStatus: 'connected',
          createdAt: '',
          updatedAt: '',
        },
        {
          _id: 'device-2',
          name: 'Phone Target',
          slug: 'phone-target',
          boxId: {
            _id: 'box-1',
            name: 'Box 01',
            rackId: {_id: 'rack-1', name: 'Rack Alpha'},
          },
          connectionType: 'tcp',
          tcpAddress: '10.0.0.6:5555',
          udid: null,
          brand: 'Samsung',
          model: 'A25',
          adbStatus: 'connected',
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 2, limit: 100},
    });
    jest.mocked(getAmRackById).mockResolvedValue({
      _id: 'rack-1',
      name: 'Rack Alpha',
      slug: 'rack-alpha',
      location: 'Room A',
      description: '',
      status: 'active',
      serverIp: '10.0.0.1:2700',
      boxCount: 1,
      deviceCount: 2,
      createdAt: '',
      updatedAt: '',
    });
    jest.mocked(getAmBoxById).mockResolvedValue({
      _id: 'box-1',
      name: 'Box 01',
      slug: 'box-01',
      rackId: {_id: 'rack-1', name: 'Rack Alpha'},
      description: '',
      status: 'active',
      deviceCount: 2,
      createdAt: '',
      updatedAt: '',
    });
    jest.mocked(getAmDeviceById).mockResolvedValue({
      _id: 'device-1',
      name: 'Phone Rack',
      slug: 'phone-rack',
      boxId: {
        _id: 'box-1',
        name: 'Box 01',
        rackId: {_id: 'rack-1', name: 'Rack Alpha'},
      },
      connectionType: 'tcp',
      tcpAddress: '10.0.0.5:5555',
      udid: null,
      brand: 'Samsung',
      model: 'A15',
      adbStatus: 'connected',
      createdAt: '',
      updatedAt: '',
    });
    jest.mocked(getAmServiceAccounts).mockResolvedValue({
      data: [
        {
          _id: 'service-active',
          label: 'BCA Active',
          platform: 'bca',
          accountNumber: '1234567890',
          status: 'active',
          deviceId: {
            _id: 'device-1',
            name: 'Phone Rack',
            connectionType: 'tcp',
            tcpAddress: '10.0.0.5:5555',
          },
          username: 'bcauser',
          credentials: {},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 100},
    });
    jest.mocked(getAmDeviceServices).mockResolvedValue([]);
    const updateCallsBefore = jest.mocked(updateAmServiceAccount).mock.calls.length;
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface
          activeModuleRoute={concreteAmRoute(
            'hardware/rack-1/box-1/device-1',
            'hardware/:rackId/:boxId/:deviceId',
          )}
          dataset={seedUnifiedDataset}
        />,
      );
    });
    renderers.push(renderer!);

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Device Edit Service Account service-active'}).props.onPress();
    });
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Device Service Target Phone Target'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Device Save Service Account device-1'}).props.onPress();
    });

    expect(updateAmServiceAccount).toHaveBeenCalledTimes(updateCallsBefore);
    expect(renderText(renderer!)).toContain('Stop service first before moving to another device');
  });

  it('resolves hardware deep links by slug through live get-by-id endpoints', async () => {
    jest.mocked(getAmRacks).mockResolvedValue({
      data: [],
      meta: {total: 0, limit: 20},
    });
    jest.mocked(jest.requireMock('../src/services/am-api').getAmBoxes).mockResolvedValue({
      data: [],
      meta: {total: 0, limit: 20},
    });
    jest.mocked(getAmDevices).mockResolvedValue({
      data: [],
      meta: {total: 0, limit: 20},
    });
    jest.mocked(getAmRackById).mockResolvedValue({
      _id: 'rack-live',
      name: 'Rack Live',
      slug: 'rack-live',
      location: 'Room Live',
      description: '',
      status: 'active',
      serverIp: '10.0.0.9',
      boxCount: 1,
      deviceCount: 1,
      createdAt: '',
      updatedAt: '',
    });
    jest.mocked(getAmBoxById).mockResolvedValue({
      _id: 'box-live',
      name: 'Box Live',
      slug: 'box-live',
      rackId: {_id: 'rack-live', name: 'Rack Live'},
      description: '',
      status: 'active',
      deviceCount: 1,
      createdAt: '',
      updatedAt: '',
    });
    jest.mocked(getAmDeviceById).mockResolvedValue({
      _id: 'device-live',
      name: 'Device Live',
      slug: 'device-live',
      boxId: {
        _id: 'box-live',
        name: 'Box Live',
        rackId: {_id: 'rack-live', name: 'Rack Live'},
      },
      connectionType: 'tcp',
      tcpAddress: '10.0.0.9:5555',
      udid: null,
      brand: 'Samsung',
      model: 'A55',
      adbStatus: 'connected',
      createdAt: '',
      updatedAt: '',
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface
          activeModuleRoute={concreteAmRoute(
            'hardware/rack-live/box-live/device-live',
            'hardware/:rackId/:boxId/:deviceId',
          )}
          dataset={seedUnifiedDataset}
        />,
      );
    });
    renderers.push(renderer!);

    await act(async () => {
      await Promise.resolve();
    });

    const text = renderText(renderer!);
    expect(text).toContain('Rack Live');
    expect(text).toContain('Box Live');
    expect(text).toContain('Device Live');
    expect(text).toContain('A55');
    expect(getAmRackById).toHaveBeenCalledWith('rack-live');
    expect(getAmBoxById).toHaveBeenCalledWith('box-live', {rackId: 'rack-live'});
    expect(getAmDeviceById).toHaveBeenCalledWith('device-live', {boxId: 'box-live'});
  });

  it('runs hardware create, edit, and delete actions from the Hardware route', async () => {
    jest.mocked(getAmRacks).mockResolvedValue({
      data: [
        {
          _id: 'rack-1',
          name: 'Rack 1',
          slug: 'rack-1',
          location: 'Old Room',
          description: 'Old rack',
          status: 'active',
          serverIp: '10.0.0.1',
          boxCount: 1,
          deviceCount: 1,
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(jest.requireMock('../src/services/am-api').getAmBoxes).mockResolvedValue({
      data: [
        {
          _id: 'box-1',
          name: 'Box 1',
          slug: 'box-1',
          rackId: {_id: 'rack-1', name: 'Rack 1'},
          description: 'Box notes',
          status: 'active',
          deviceCount: 1,
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmDevices).mockResolvedValue({
      data: [
        {
          _id: 'device-1',
          name: 'Device 1',
          slug: 'device-1',
          boxId: {_id: 'box-1', name: 'Box 1', rackId: {_id: 'rack-1', name: 'Rack 1'}},
          connectionType: 'usb',
          udid: 'USB1234',
          tcpAddress: null,
          brand: 'Samsung',
          model: 'A52',
          systemPort: 8200,
          appiumPort: 4723,
          adbPort: 5037,
          adbStatus: 'connected',
          adbCheckedAt: '',
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'hardware');

    let inputs = renderer!.root.findAllByType(TextInput);
    await act(async () => {
      inputs[0].props.onChangeText('Server Room A');
      inputs[1].props.onChangeText('Main AM rack');
      inputs[2].props.onChangeText('10.0.0.10');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Save'}).props.onPress();
    });

    expect(createAmRack).toHaveBeenCalledWith({
      location: 'Server Room A',
      description: 'Main AM rack',
      serverIp: '10.0.0.10',
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Edit Rack rack-1'}).props.onPress();
    });
    inputs = renderer!.root.findAllByType(TextInput);
    await act(async () => {
      inputs[0].props.onChangeText('Server Room B');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Save'}).props.onPress();
    });

    expect(updateAmRack).toHaveBeenCalledWith('rack-1', {
      location: 'Server Room B',
      description: 'Old rack',
      serverIp: '10.0.0.1',
      status: 'active',
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Delete Rack rack-1'}).props.onPress();
    });
    expect(deleteAmRacks).not.toHaveBeenCalled();
    let hardwareText = renderText(renderer!).join(' ').replace(/\s+/g, ' ');
    expect(hardwareText).toContain('Delete Rack Rack 1 ?');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Cancel Delete'}).props.onPress();
    });
    hardwareText = renderText(renderer!).join(' ').replace(/\s+/g, ' ');
    expect(hardwareText).not.toContain('Delete Rack Rack 1 ?');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Delete Rack rack-1'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Confirm Delete Rack rack-1'}).props.onPress();
    });

    expect(deleteAmRacks).toHaveBeenCalledWith(['rack-1']);

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Segment Box'}).props.onPress();
    });
    inputs = renderer!.root.findAllByType(TextInput);
    await act(async () => {
      inputs[0].props.onChangeText('New box notes');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Save'}).props.onPress();
    });

    expect(createAmBox).toHaveBeenCalledWith({
      rackId: 'rack-1',
      description: 'New box notes',
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Segment Device'}).props.onPress();
    });
    inputs = renderer!.root.findAllByType(TextInput);
    await act(async () => {
      inputs[0].props.onChangeText('10.0.0.9:5555');
      inputs[1].props.onChangeText('Samsung');
      inputs[2].props.onChangeText('A54');
      inputs[3].props.onChangeText('whatsapp, banking');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Save'}).props.onPress();
    });

    expect(createAmDevice).toHaveBeenCalledWith({
      boxId: 'box-1',
      connectionType: 'tcp',
      tcpAddress: '10.0.0.9:5555',
      adbPort: 6404,
      brand: 'Samsung',
      model: 'A54',
      tags: ['whatsapp', 'banking'],
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Segment USB'}).props.onPress();
    });
    inputs = renderer!.root.findAllByType(TextInput);
    await act(async () => {
      inputs[0].props.onChangeText('USBNEW1');
      inputs[1].props.onChangeText('Samsung');
      inputs[2].props.onChangeText('A54');
      inputs[3].props.onChangeText('whatsapp, banking');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Save'}).props.onPress();
    });

    expect(createAmDevice).toHaveBeenLastCalledWith({
      boxId: 'box-1',
      connectionType: 'usb',
      udid: 'USBNEW1',
      adbPort: 5037,
      brand: 'Samsung',
      model: 'A54',
      tags: ['whatsapp', 'banking'],
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Segment Browser'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Save'}).props.onPress();
    });

    expect(createAmDevice).toHaveBeenLastCalledWith({
      boxId: 'box-1',
      connectionType: 'browser',
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Rack Rack 1'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Box Box 1'}).props.onPress();
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Edit Device device-1'}).props.onPress();
    });
    expect(
      renderer!.root.findAllByProps({accessibilityLabel: 'AM Hardware Connection Type Read Only'}).length,
    ).toBeGreaterThan(0);
    expect(
      renderer!.root.findAllByProps({accessibilityLabel: 'AM Segment TCP'}),
    ).toHaveLength(0);
    inputs = renderer!.root.findAllByType(TextInput);
    await act(async () => {
      inputs[0].props.onChangeText('USB9999');
      inputs[1].props.onChangeText('Samsung');
      inputs[2].props.onChangeText('A55');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Save'}).props.onPress();
    });

    expect(updateAmDevice).toHaveBeenCalledWith('device-1', expect.objectContaining({
      udid: 'USB9999',
      brand: 'Samsung',
      model: 'A55',
    }));
    expect(updateAmDevice).toHaveBeenCalledWith('device-1', expect.not.objectContaining({
      connectionType: expect.anything(),
      tcpAddress: expect.anything(),
    }));

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Delete Device device-1'}).props.onPress();
    });
    expect(deleteAmDevices).not.toHaveBeenCalled();
    hardwareText = renderText(renderer!).join(' ').replace(/\s+/g, ' ');
    expect(hardwareText).toContain('Delete Device Device 1 ?');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Confirm Delete Device device-1'}).props.onPress();
    });

    expect(deleteAmDevices).toHaveBeenCalledWith(['device-1']);
  });

  it('loads banking and admin live routes from the main AM sidebar routes', async () => {
    jest.mocked(getAmCurrentUser).mockResolvedValue({
      _id: 'user-current',
      fullName: 'Current AM User',
      username: 'current@dunia-anura.com',
      role: {_id: 'role-super', name: 'Super Admin', permissions: ['user:read'], description: 'Super Admin role'},
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'transactions');
    await updateAmRoute(renderer!, 'mutasi');
    await updateAmRoute(renderer!, 'webhooks');
    const webhooksText = renderText(renderer!).join(' ');
    expect(webhooksText).toContain('No webhooks registered');
    expect(webhooksText).toContain('No webhook logs yet');
    expect(webhooksText).not.toContain('No webhook logs found');
    await updateAmRoute(renderer!, 'admin/users');
    await updateAmRoute(renderer!, 'admin/activity-log');

    expect(getAmTransfers).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      search: undefined,
      status: undefined,
      serviceAccountId: undefined,
    });
    expect(getAmMutasi).toHaveBeenCalledWith({page: 1, limit: 100, type: undefined});
    expect(getAmWebhookConfigs).toHaveBeenCalledTimes(1);
    expect(getAmUsers).toHaveBeenCalledWith({
      page: 1,
      limit: 100,
      search: undefined,
    });
    expect(getAmRoles).toHaveBeenCalledTimes(1);
    expect(getAmActivityLogs).toHaveBeenCalledWith({
      page: 1,
      limit: 50,
      search: undefined,
      type: undefined,
      status: undefined,
      method: undefined,
    });
    expect(getAmCurrentUser).toHaveBeenCalledTimes(2);
  });

  it('renders activity log stats, detail, filters, and pagination from live metadata', async () => {
    jest.mocked(getAmCurrentUser).mockResolvedValue({
      _id: 'user-current',
      fullName: 'Current AM User',
      username: 'current@dunia-anura.com',
      role: {_id: 'role-super', name: 'Super Admin', permissions: ['user:read'], description: 'Super Admin role'},
    });
    jest.mocked(getAmActivityLogs).mockResolvedValue({
      data: [
        {
          _id: 'log-1',
          action: 'GET /activity-log',
          duration: 45,
          error: '',
          ip: '127.0.0.1',
          metadata: {requestId: 'REQ-1'},
          method: 'GET',
          path: '/activity-log',
          status: 'success',
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
          type: 'api',
          userAgent: 'Jest',
          userId: {_id: 'user-1', username: 'alice', fullName: 'Alice AM'},
          username: 'alice',
        },
        {
          _id: 'log-2',
          action: 'PAGE /dashboard',
          duration: 0,
          error: '',
          ip: '127.0.0.2',
          metadata: {},
          method: '',
          path: '/dashboard',
          status: 'success',
          statusCode: 200,
          timestamp: '2026-01-01T00:01:00.000Z',
          type: 'page',
          userAgent: 'Jest',
          userId: null,
          username: null,
        },
      ],
      meta: {total: 75, limit: 50, page: 1, totalPages: 2},
    });
    jest.mocked(getAmActivityLogStats).mockResolvedValue({
      since: '2025-12-25T00:00:00.000Z',
      days: 7,
      byType: [{_id: 'api', count: 12}, {_id: 'page', count: 3}],
      byStatus: [{_id: 'success', count: 10}, {_id: 'failed', count: 2}],
      topUsers: [{_id: 'alice', count: 8}],
      topPaths: [{_id: '/activity-log', count: 6}],
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'admin/activity-log');

    let text = renderText(renderer!);
    let joinedText = text.join(' ');
    expect(text).toEqual(
      expect.arrayContaining([
        'API / Page',
        '12 / 3',
        'Success',
        '2 failed',
        'Top Users',
        'alice',
        'Top Paths',
        '/activity-log',
        'Activity Log',
      ]),
    );
    expect(joinedText).not.toContain('Super Admin audit log');
    expect(joinedText).toContain('Catatan page/API request AM. Otomatis hapus setelah 90 hari.');
    expect(joinedText).toContain('Super Admin bisa hapus manual per baris terpilih atau sesuai filter.');
    expect(joinedText).toContain('Semua tipe');
    expect(joinedText).toContain('Semua status');
    expect(joinedText).toContain('Semua method');
    expect(text).toEqual(expect.arrayContaining(['Waktu', 'Tipe', 'Durasi', 'Aksi']));
    expect(text).not.toEqual(expect.arrayContaining(['Time', 'Type', 'Duration', 'Action']));
    expect(text).toEqual(expect.arrayContaining(['API', 'Page', 'GET']));
    expect(joinedText).toContain('/dashboard');
    expect(joinedText.replace(/\s+/g, ' ')).toContain('Showing 1 to 50 of 75 items');
    expect(joinedText).toContain('Hapus sesuai filter (75)');
    expect(getAmActivityLogs).toHaveBeenLastCalledWith({
      page: 1,
      limit: 50,
      search: undefined,
      type: undefined,
      status: undefined,
      method: undefined,
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Activity Log Select log-1'}).props.onPress();
      renderer!.root.findByProps({accessibilityLabel: 'AM Activity Log Select log-2'}).props.onPress();
    });

    text = renderText(renderer!);
    joinedText = text.join(' ');
    expect(joinedText).toContain('Hapus terpilih (2)');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Activity Logs Delete Selected'}).props.onPress();
    });

    text = renderText(renderer!);
    joinedText = text.join(' ');
    expect(text).toContain('Hapus activity log');
    expect(joinedText).toContain('Log yang dipilih akan dihapus permanen.');
    expect(joinedText.replace(/\s+/g, ' ')).toContain('2 entri akan dihapus.');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Activity Logs Confirm Delete Selected'}).props.onPress();
    });

    expect(bulkDeleteAmActivityLogs).toHaveBeenCalledWith({
      confirm: true,
      ids: ['log-1', 'log-2'],
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Activity Log Detail log-1'}).props.onPress();
    });

    text = renderText(renderer!);
    joinedText = text.join(' ');
    expect(text).toContain('Activity Detail');
    expect(text).toEqual(expect.arrayContaining(['Timestamp', 'Type', 'Status', 'User Agent']));
    expect(joinedText).toContain('API');
    expect(joinedText).toContain('200 (success)');
    expect(joinedText).toContain('REQ-1');
    expect(joinedText).toContain('Jest');
    expect(joinedText).toContain('Hapus log ini');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Activity Log Delete Selected log-1'}).props.onPress();
    });

    text = renderText(renderer!);
    joinedText = text.join(' ');
    expect(text).toContain('Hapus activity log');
    expect(joinedText).toContain('Log terpilih akan dihapus permanen.');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Activity Logs Confirm Delete Selected'}).props.onPress();
    });

    expect(bulkDeleteAmActivityLogs).toHaveBeenCalledWith({
      confirm: true,
      ids: ['log-1'],
    });
    expect(renderText(renderer!).join(' ')).toContain('75 log dihapus');

    await act(async () => {
      renderer!.root.findAllByType(TextInput)[0].props.onChangeText('alice');
    });

    expect(getAmActivityLogs).toHaveBeenLastCalledWith({
      page: 1,
      limit: 50,
      search: 'alice',
      type: undefined,
      status: undefined,
      method: undefined,
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Segment GET'}).props.onPress();
    });

    expect(getAmActivityLogs).toHaveBeenLastCalledWith({
      page: 1,
      limit: 50,
      search: 'alice',
      type: undefined,
      status: undefined,
      method: 'GET',
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Activity Logs Delete Filter'}).props.onPress();
    });

    text = renderText(renderer!);
    joinedText = text.join(' ');
    expect(text).toContain('Hapus activity log');
    expect(joinedText).toContain('Semua log yang cocok dengan filter saat ini akan dihapus permanen.');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Activity Logs Confirm Delete Filter'}).props.onPress();
    });

    expect(bulkDeleteAmActivityLogs).toHaveBeenCalledWith({
      confirm: true,
      filter: {
        search: 'alice',
        type: undefined,
        status: undefined,
        method: 'GET',
      },
    });
    expect(renderText(renderer!).join(' ')).toContain('75 log dihapus');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Activity Logs Next Page'}).props.onPress();
    });

    expect(getAmActivityLogs).toHaveBeenLastCalledWith({
      page: 2,
      limit: 50,
      search: 'alice',
      type: undefined,
      status: undefined,
      method: 'GET',
    });
  });

  it('blocks Activity Log for non-Super Admin users like AM FE', async () => {
    jest.mocked(getAmCurrentUser).mockResolvedValue({
      _id: 'user-current',
      fullName: 'Current AM User',
      username: 'current@dunia-anura.com',
      role: {_id: 'role-admin', name: 'Admin', permissions: ['user:read'], description: 'Admin role'},
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'admin/activity-log');

    expect(renderText(renderer!)).toContain('Halaman ini hanya untuk Super Admin.');
    expect(getAmActivityLogs).not.toHaveBeenCalled();
    expect(getAmActivityLogStats).not.toHaveBeenCalled();
  });

  it('allows Super Admin users without user read permission to open Activity Log like AM BE', async () => {
    jest.mocked(getAmCurrentUser).mockResolvedValue({
      _id: 'user-current',
      fullName: 'Audit Super Admin',
      username: 'audit@dunia-anura.com',
      role: {_id: 'role-super', name: 'Super Admin', permissions: [], description: 'Super Admin role'},
    });
    jest.mocked(getAmActivityLogs).mockResolvedValue({
      data: [
        {
          _id: 'log-super',
          action: 'GET /activity-log',
          duration: 12,
          error: '',
          ip: '127.0.0.1',
          metadata: {},
          method: 'GET',
          path: '/activity-log',
          status: 'success',
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
          type: 'api',
          userAgent: 'Jest',
          userId: null,
          username: 'audit',
        },
      ],
      meta: {total: 1, limit: 50, page: 1, totalPages: 1},
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'admin/activity-log');

    const joinedText = renderText(renderer!).join(' ');
    expect(joinedText).toContain('Activity Log');
    expect(joinedText).not.toContain('Super Admin audit log');
    expect(joinedText).toContain('/activity-log');
    expect(getAmActivityLogs).toHaveBeenCalledWith({
      page: 1,
      limit: 50,
      search: undefined,
      type: undefined,
      status: undefined,
      method: undefined,
    });
    expect(getAmActivityLogStats).toHaveBeenCalledTimes(1);
  });

  it('renders mutasi summary stats and pagination from live metadata', async () => {
    jest.mocked(getAmServiceAccounts).mockResolvedValue({
      data: [
        {
          _id: 'account-1',
          label: 'BCA Main',
          platform: 'bca',
          accountNumber: '123',
          status: 'connected',
          deviceId: null,
          username: '',
          credentials: {},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 100},
    });
    jest.mocked(getAmDevices).mockResolvedValue({
      data: [
        {
          _id: 'device-1',
          name: 'Phone 1',
          slug: 'phone-1',
          brand: 'Samsung',
          model: 'A1',
          boxId: 'box-1',
          udid: 'udid-1',
          connectionType: 'usb',
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 100},
    });
    jest.mocked(getAmMutasi).mockResolvedValue({
      data: [
        {
          _id: 'mutasi-1',
          accountId: {_id: 'account-1', label: 'BCA Main', platform: 'bca', accountNumber: '123'},
          amount: 125000,
          createdAt: '',
          description: 'Incoming sample',
          detectedAt: '2026-01-01T00:00:00.000Z',
          deviceId: {
            _id: 'device-1',
            name: 'Phone 1',
            boxId: {
              _id: 'box-1',
              name: 'Box Green',
              rackId: {_id: 'rack-1', name: 'Rack Mutasi'},
            },
          },
          notificationHash: null,
          transferId: null,
          type: 'masuk',
          updatedAt: '',
        },
        {
          _id: 'mutasi-2',
          accountId: {_id: 'account-1', label: 'BCA Main', platform: 'bca', accountNumber: '123'},
          amount: 50000,
          createdAt: '',
          description: 'Outgoing sample',
          detectedAt: '2026-01-01T00:10:00.000Z',
          deviceId: {
            _id: 'device-1',
            name: 'Phone 1',
            boxId: {
              _id: 'box-1',
              name: 'Box Green',
              rackId: {_id: 'rack-1', name: 'Rack Mutasi'},
            },
          },
          notificationHash: null,
          transferId: null,
          type: 'keluar',
          updatedAt: '',
        },
      ],
      meta: {total: 120, limit: 100, page: 1, totalPages: 2},
    });
    jest.mocked(getAmMutasiSummary).mockResolvedValue({
      masuk: {total: 500000, count: 4},
      keluar: {total: 150000, count: 2},
    });
    jest.mocked(getAmMutasiById).mockResolvedValue({
      _id: 'mutasi-1',
      accountId: {
        _id: 'account-1',
        label: 'BCA Main',
        platform: 'bca',
        accountNumber: '123',
      },
      amount: 125000,
      createdAt: '2026-01-01T00:00:00.000Z',
      description: 'Transfer in',
      detectedAt: '2026-01-01T00:00:00.000Z',
      deviceId: {
        _id: 'device-1',
        name: 'Phone 1',
        connectionType: 'tcp',
        tcpAddress: '10.0.0.2:5555',
        udid: null,
        boxId: {
          _id: 'box-1',
          name: 'Box Green',
          rackId: {_id: 'rack-1', name: 'Rack Mutasi'},
        },
      },
      notificationHash: 'hash-mutasi-1',
      receiptFile: 'receipt-mutasi-1.png',
      transferId: {
        _id: 'transfer-1',
        amount: 125000,
        recipientAccount: '9988',
        recipientBank: 'BCA',
        recipientName: 'Vendor Mutasi',
        status: 'success',
      },
      type: 'masuk',
      updatedAt: '2026-01-01T00:01:00.000Z',
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'mutasi');

    expect(getAmMutasi).toHaveBeenLastCalledWith({
      page: 1,
      limit: 100,
      type: undefined,
      accountId: undefined,
      deviceId: undefined,
    });
    expect(getAmMutasiSummary).toHaveBeenLastCalledWith(undefined);

    const text = renderText(renderer!);
    const joinedText = text.join(' ');
    expect(joinedText).toContain('Total Incoming');
    expect(joinedText).toContain('Total Outgoing');
    expect(joinedText).toContain('Net Balance');
    expect(joinedText).toContain('Total Transactions');
    expect(joinedText).toContain('All types');
    expect(joinedText).toContain('All accounts');
    expect(joinedText).toContain('All devices');
    expect(joinedText).not.toContain('All Accounts');
    expect(joinedText).not.toContain('All Devices');
    expect(text).toContain('BCA Main');
    expect(joinedText).toContain('Phone 1');
    expect(joinedText).toContain('Box Green / Rack Mutasi');
    expect(joinedText).toContain('Incoming');
    expect(joinedText).toContain('Outgoing');
    expect(joinedText).toMatch(/\+Rp\s*125\.000/);
    expect(joinedText).toMatch(/-Rp\s*50\.000/);
    expect(text).toEqual(expect.arrayContaining(['Type', 'Account', 'Amount', 'Description', 'Device', 'Time']));
    expect(joinedText).toContain('Time');
    expect(joinedText).not.toContain('Action');
    expect(joinedText).toMatch(/Showing\s+1\s+to\s+100\s+of\s+120\s+items/);
    expect(joinedText).toContain('Page 1/2');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Mutasi Detail mutasi-1'}).props.onPress();
    });

    const detailText = renderText(renderer!).join(' ');
    expect(getAmMutasiById).toHaveBeenCalledWith('mutasi-1');
    expect(detailText).toContain('Mutation Detail');
    expect(detailText).toContain('hash-mutasi-1');
    expect(detailText).toContain('Vendor Mutasi');
    expect(detailText).toContain('/mutasi/mutasi-1/receipt');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Mutasi Next Page'}).props.onPress();
    });

    expect(getAmMutasi).toHaveBeenLastCalledWith({
      page: 2,
      limit: 100,
      type: undefined,
      accountId: undefined,
      deviceId: undefined,
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Segment BCA Main - 123'}).props.onPress();
    });

    expect(getAmMutasi).toHaveBeenLastCalledWith({
      page: 1,
      limit: 100,
      type: undefined,
      accountId: 'account-1',
      deviceId: undefined,
    });
    expect(getAmMutasiSummary).toHaveBeenLastCalledWith('account-1');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Segment Phone 1'}).props.onPress();
    });

    expect(getAmMutasi).toHaveBeenLastCalledWith({
      page: 1,
      limit: 100,
      type: undefined,
      accountId: 'account-1',
      deviceId: 'device-1',
    });
  });

  it('opens mutasi detail directly from a concrete AM shell route', async () => {
    const detailMutasi = {
      _id: 'mutasi-detail',
      accountId: {_id: 'account-1', label: 'BCA Main', platform: 'bca', accountNumber: '123'},
      amount: 88000,
      createdAt: '2026-01-01T00:00:00.000Z',
      description: 'Direct mutation detail',
      detectedAt: '2026-01-01T00:00:00.000Z',
      deviceId: {_id: 'device-1', name: 'Phone 1'},
      notificationHash: 'hash-direct-mutasi',
      receiptFile: 'receipt-direct.png',
      transferId: null,
      type: 'keluar',
      updatedAt: '2026-01-01T00:01:00.000Z',
    };
    jest.mocked(getAmMutasiById).mockResolvedValue(detailMutasi);
    jest.mocked(getAmMutasi).mockResolvedValue({
      data: [],
      meta: {total: 0, limit: 100, page: 1, totalPages: 1},
    });
    const onModuleRouteSelect = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface
          activeModuleRoute={concreteAmRoute('mutasi/mutasi-detail', 'mutasi/:id')}
          dataset={seedUnifiedDataset}
          onModuleRouteSelect={onModuleRouteSelect}
        />,
      );
    });
    renderers.push(renderer!);

    expect(recordAmPageView).toHaveBeenCalledWith('/mutasi/mutasi-detail');
    expect(getAmMutasiById).toHaveBeenCalledWith('mutasi-detail');
    const text = renderText(renderer!).join(' ');
    expect(text).toContain('Mutation Detail');
    expect(text).toContain('hash-direct-mutasi');
    expect(text).toContain('/mutasi/mutasi-detail/receipt');
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Mutasi Back'}).props.onPress();
    });

    expect(onModuleRouteSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        moduleId: 'am',
        route: 'mutasi',
      }),
    );
  });

  it('does not expose the legacy AM account settings route inside JungleSystem', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface
          activeModuleRoute={{
            ...amRoute(':catchAll'),
            id: 'am:settings/account',
            route: 'settings/account',
          }}
          dataset={seedUnifiedDataset}
        />,
      );
    });
    renderers.push(renderer!);

    const text = renderText(renderer!);
    expect(recordAmPageView).toHaveBeenCalledWith('/settings/account');
    expect(text).not.toContain('Profile information');
    expect(text).not.toContain('Change password');
    expect(text).not.toContain('Account Settings');
    expect(
      renderer!.root.findAllByProps({accessibilityLabel: 'AM Account Save Profile'}),
    ).toHaveLength(0);
    expect(updateAmUser).not.toHaveBeenCalled();
  });

  it('runs user create, edit, and delete actions from the Users route', async () => {
    jest.mocked(getAmCurrentUser).mockResolvedValue({
      _id: 'user-current',
      fullName: 'Current AM Admin',
      username: 'current-admin',
      role: {
        _id: 'role-admin',
        name: 'Admin',
        permissions: ['user:read', 'user:create', 'user:update', 'user:delete'],
        description: 'Admin role',
      },
    });
    jest.mocked(getAmRoles).mockResolvedValue([
      {_id: 'role-admin', name: 'Admin', permissions: ['user:read'], description: 'Admin role'},
      {_id: 'role-super', name: 'Super Admin', permissions: ['user:read', 'user:create'], description: 'Full access'},
    ]);
    jest.mocked(getAmUsers).mockResolvedValue({
      data: [
        {
          _id: 'user-1',
          fullName: 'Existing User',
          username: 'existing',
          role: {_id: 'role-admin', name: 'Admin', permissions: ['user:read'], description: 'Admin role'},
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'admin/users');

    expect(renderer!.root.findAllByProps({accessibilityLabel: 'AM User Role Super Admin'})).toHaveLength(0);
    expect(renderer!.root.findAllByProps({accessibilityLabel: 'AM User Save'})).toHaveLength(0);
    expect(
      renderer!.root.findAllByType(TextInput).some(input => input.props.placeholder === 'Search by name or username...'),
    ).toBe(true);
    expect(renderText(renderer!)).toContain('Full Name');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM User Create'}).props.onPress();
    });

    let inputs = renderer!.root.findAllByType(TextInput);
    expect(inputs[3].props.secureTextEntry).toBe(true);
    await act(async () => {
      inputs[1].props.onChangeText('New User');
      inputs[2].props.onChangeText('newuser');
      inputs[3].props.onChangeText('StrongPass1!');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM User Role Admin'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM User Save'}).props.onPress();
    });

    expect(createAmUser).toHaveBeenCalledWith({
      fullName: 'New User',
      username: 'newuser',
      password: 'StrongPass1!',
      role: 'role-admin',
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM User Edit user-1'}).props.onPress();
    });
    inputs = renderer!.root.findAllByType(TextInput);
    await act(async () => {
      inputs[1].props.onChangeText('Existing User Updated');
      inputs[3].props.onChangeText('AnotherPass1!');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM User Save'}).props.onPress();
    });

    expect(updateAmUser).toHaveBeenCalledWith('user-1', {
      fullName: 'Existing User Updated',
      password: 'AnotherPass1!',
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM User Delete user-1'}).props.onPress();
    });
    expect(deleteAmUser).not.toHaveBeenCalled();

    let text = renderText(renderer!).join(' ').replace(/\s+/g, ' ');
    expect(text).toContain('Hapus Existing User (@ existing )?');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM User Cancel Delete'}).props.onPress();
    });
    text = renderText(renderer!).join(' ').replace(/\s+/g, ' ');
    expect(text).not.toContain('Hapus Existing User (@ existing )?');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM User Delete user-1'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM User Confirm Delete user-1'}).props.onPress();
    });

    expect(deleteAmUser).toHaveBeenCalledWith('user-1');
  });

  it('hides Users create, edit, and delete actions when AM live permission is read-only', async () => {
    jest.mocked(getAmCurrentUser).mockResolvedValue({
      _id: 'user-current',
      fullName: 'Read Only Super Admin',
      username: 'readonly-root',
      role: {
        _id: 'role-read',
        name: 'Super Admin',
        permissions: ['user:read'],
        description: 'Read-only role',
      },
    });
    jest.mocked(getAmRoles).mockResolvedValue([
      {_id: 'role-read', name: 'Super Admin', permissions: ['user:read'], description: 'Read-only role'},
    ]);
    jest.mocked(getAmUsers).mockResolvedValue({
      data: [
        {
          _id: 'user-1',
          fullName: 'Alice Read',
          username: 'alice',
          role: {_id: 'role-read', name: 'User', permissions: ['user:read'], description: 'Read-only role'},
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      meta: {total: 1, limit: 100},
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'admin/users');

    const text = renderText(renderer!).join(' ');
    expect(text).toContain('Alice Read');
    expect(text).not.toContain('Users read-only');
    expect(renderer!.root.findAllByProps({accessibilityLabel: 'AM User Save'})).toHaveLength(0);
    expect(renderer!.root.findAllByProps({accessibilityLabel: 'AM User Edit user-1'})).toHaveLength(0);
    expect(renderer!.root.findAllByProps({accessibilityLabel: 'AM User Delete user-1'})).toHaveLength(0);
  });

  it('blocks direct Users route before fetching list data without user read permission', async () => {
    jest.mocked(getAmCurrentUser).mockResolvedValue({
      _id: 'user-current',
      fullName: 'No Read',
      username: 'no-read',
      role: {
        _id: 'role-no-read',
        name: 'Operator',
        permissions: [],
        description: 'No read access',
      },
    });
    jest.mocked(getAmUsers).mockClear();
    jest.mocked(getAmRoles).mockClear();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'admin/users');

    const text = renderText(renderer!).join(' ');
    expect(text).toContain('Users tidak tersedia');
    expect(getAmUsers).not.toHaveBeenCalled();
    expect(getAmRoles).not.toHaveBeenCalled();
  });

  it('keeps Super Admin role assignment available only to Super Admin users', async () => {
    jest.mocked(getAmCurrentUser).mockResolvedValue({
      _id: 'user-current',
      fullName: 'Root Admin',
      username: 'root',
      role: {
        _id: 'role-super',
        name: 'Super Admin',
        permissions: ['user:read', 'user:create', 'user:update'],
        description: 'Full access',
      },
    });
    jest.mocked(getAmRoles).mockResolvedValue([
      {_id: 'role-admin', name: 'Admin', permissions: ['user:read'], description: 'Admin role'},
      {_id: 'role-super', name: 'Super Admin', permissions: ['user:read', 'user:create'], description: 'Full access'},
    ]);
    jest.mocked(getAmUsers).mockResolvedValue({
      data: [],
      meta: {total: 0, limit: 100},
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'admin/users');

    let text = renderText(renderer!).join(' ');
    expect(text).toContain('No users found');
    expect(text).toContain('Create a user to get started.');

    await act(async () => {
      renderer!.root.findAllByType(TextInput)[0].props.onChangeText('missing');
    });

    text = renderText(renderer!).join(' ');
    expect(text).toContain('Try a different search term.');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM User Create'}).props.onPress();
    });

    expect(renderer!.root.findAllByProps({accessibilityLabel: 'AM User Role Super Admin'}).length).toBeGreaterThan(0);
  });

  it('keeps Users search and pagination in sync with AM live metadata', async () => {
    jest.mocked(getAmRoles).mockResolvedValue([
      {_id: 'role-admin', name: 'Admin', permissions: ['user:read'], description: 'Admin role'},
    ]);
    jest.mocked(getAmUsers).mockResolvedValue({
      data: [
        {
          _id: 'user-1',
          fullName: 'Alice Admin',
          username: 'alice',
          role: {_id: 'role-admin', name: 'Admin', permissions: ['user:read'], description: 'Admin role'},
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          _id: 'user-2',
          fullName: 'Root Admin',
          username: 'root',
          role: {_id: 'role-super', name: 'Super Admin', permissions: ['user:read', 'user:create'], description: 'Full access'},
          createdAt: '2026-01-01T00:10:00.000Z',
          updatedAt: '2026-01-01T00:10:00.000Z',
        },
      ],
      meta: {total: 145, limit: 100, page: 1, totalPages: 2},
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'admin/users');

    const text = renderText(renderer!).join(' ').replace(/\s+/g, ' ');
    expect(text).toContain('Showing 1 to 100 of 145 items');
    expect(text).toContain('Page 1/2');
    expect(text).toContain('Super Admin');
    expect(renderer!.root.findAllByProps({accessibilityLabel: 'AM Segment Admin'})).toHaveLength(0);

    const searchInput = renderer!.root.findAllByType(TextInput)[0];
    await act(async () => {
      searchInput.props.onChangeText('Alice');
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Users Next Page'}).props.onPress();
    });

    expect(getAmUsers).toHaveBeenCalledWith({
      page: 1,
      limit: 100,
      search: undefined,
    });
    expect(getAmUsers).toHaveBeenCalledWith({
      page: 1,
      limit: 100,
      search: 'Alice',
    });
    expect(getAmUsers).toHaveBeenCalledWith({
      page: 2,
      limit: 100,
      search: 'Alice',
    });
  });

  it('keeps transfer action guards aligned with AM FE status rules', async () => {
    jest.mocked(getAmTransfers).mockResolvedValue({
      data: [
        {
          _id: 'transfer-1',
          accountId: { _id: 'account-1', label: 'BCA Main', platform: 'bca', accountNumber: '123' },
          amount: 125000,
          completedAt: null,
          createdAt: '',
          createdBy: null,
          deviceId: {
            _id: 'device-1',
            name: 'Phone 1',
            boxId: {_id: 'box-1', name: 'Box A', rackId: {_id: 'rack-1', name: 'Rack Blue'}},
          },
          error: '',
          fee: 2500,
          logs: [],
          recipientAccount: '999',
          recipientBank: 'BCA',
          recipientName: 'Vendor',
          screenshot: '',
          startedAt: null,
          status: 'pending',
          transactionPurpose: null,
          transferMethod: 'BI FAST',
          transferType: 'transfer',
          updatedAt: '',
        },
        {
          _id: 'transfer-processing',
          accountId: { _id: 'account-1', label: 'BCA Main', platform: 'bca', accountNumber: '123' },
          amount: 125000,
          completedAt: null,
          createdAt: '',
          createdBy: null,
          deviceId: {
            _id: 'device-1',
            name: 'Phone 1',
            boxId: {_id: 'box-1', name: 'Box A', rackId: {_id: 'rack-1', name: 'Rack Blue'}},
          },
          error: '',
          fee: 2500,
          logs: [],
          recipientAccount: '998',
          recipientBank: 'BCA',
          recipientName: 'Vendor Processing',
          screenshot: '',
          startedAt: null,
          status: 'processing',
          transactionPurpose: null,
          transferMethod: 'BI FAST',
          transferType: 'transfer',
          updatedAt: '',
        },
        {
          _id: 'transfer-failed',
          accountId: { _id: 'account-1', label: 'BCA Main', platform: 'bca', accountNumber: '123' },
          amount: 125000,
          completedAt: null,
          createdAt: '',
          createdBy: null,
          deviceId: {
            _id: 'device-1',
            name: 'Phone 1',
            boxId: {_id: 'box-1', name: 'Box A', rackId: {_id: 'rack-1', name: 'Rack Blue'}},
          },
          error: 'Failed',
          fee: 2500,
          logs: [],
          recipientAccount: '997',
          recipientBank: 'BCA',
          recipientName: 'Vendor Failed',
          screenshot: '',
          startedAt: null,
          status: 'failed',
          transactionPurpose: null,
          transferMethod: 'BI FAST',
          transferType: 'transfer',
          updatedAt: '',
        },
      ],
      meta: {total: 3, limit: 20},
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'transactions');
    expect(
      renderer!.root.findAllByProps({accessibilityLabel: 'AM Transfer Force Fail transfer-1'}),
    ).toHaveLength(0);
    expect(
      renderer!.root.findAllByProps({accessibilityLabel: 'AM Transfer Cancel transfer-processing'}),
    ).toHaveLength(0);
    expect(
      renderer!.root.findAllByProps({accessibilityLabel: 'AM Transfer Force Fail transfer-processing'}),
    ).not.toHaveLength(0);
    expect(
      renderer!.root.findAllByProps({accessibilityLabel: 'AM Transfer Retry transfer-failed'}),
    ).not.toHaveLength(0);
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Transfer Cancel transfer-1'}).props.onPress();
    });

    expect(cancelAmTransfer).toHaveBeenCalledWith('transfer-1');
    expect(getAmTransfers).toHaveBeenCalledTimes(2);
  });

  it('renders transfer stats and pagination from the Transfers route metadata', async () => {
    jest.useFakeTimers();
    jest.mocked(getAmServiceAccounts).mockResolvedValue({
      data: [
        {
          _id: 'account-1',
          label: 'BCA Main',
          platform: 'bca',
          accountNumber: '123',
          status: 'active',
          deviceId: null,
          username: '',
          credentials: {},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
        {
          _id: 'account-dana',
          label: 'DANA Main',
          platform: 'dana',
          accountNumber: '555',
          status: 'active',
          deviceId: null,
          username: '',
          credentials: {phoneNumber: '0812'},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 2, limit: 2},
    });
    jest.mocked(getAmTransfers).mockResolvedValue({
      data: [
        {
          _id: 'transfer-pending',
          accountId: { _id: 'account-1', label: 'BCA Main', platform: 'bca', accountNumber: '123' },
          amount: 100000,
          completedAt: null,
          createdAt: '',
          createdBy: null,
          deviceId: {
            _id: 'device-1',
            name: 'Phone 1',
            boxId: {_id: 'box-1', name: 'Box A', rackId: {_id: 'rack-1', name: 'Rack Blue'}},
          },
          error: '',
          fee: 2500,
          logs: [],
          recipientAccount: '999',
          recipientBank: 'BCA',
          recipientName: 'Vendor Pending',
          screenshot: '',
          startedAt: null,
          status: 'pending',
          transactionPurpose: null,
          transferMethod: null,
          transferType: 'transfer',
          updatedAt: '',
        },
        {
          _id: 'transfer-success',
          accountId: { _id: 'account-1', label: 'BCA Main', platform: 'bca', accountNumber: '123' },
          amount: 250000,
          completedAt: null,
          createdAt: '',
          createdBy: null,
          deviceId: { _id: 'device-1', name: 'Phone 1' },
          error: '',
          fee: 2500,
          logs: [],
          recipientAccount: '888',
          recipientBank: 'BRI',
          recipientName: 'Vendor Success',
          screenshot: '',
          startedAt: null,
          status: 'success',
          transactionPurpose: null,
          transferMethod: null,
          transferType: 'transfer',
          updatedAt: '',
        },
      ],
      meta: {total: 45, limit: 20, page: 1, totalPages: 3},
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'transactions');

    expect(getAmTransfers).toHaveBeenLastCalledWith({
      page: 1,
      limit: 20,
      search: undefined,
      status: undefined,
    });
    expect(getAmServiceAccounts).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(5000);
      await Promise.resolve();
    });

    expect(getAmTransfers).toHaveBeenCalledTimes(2);
    expect(getAmTransfers).toHaveBeenLastCalledWith({
      page: 1,
      limit: 20,
      search: undefined,
      status: undefined,
    });

    const joinedText = renderText(renderer!).join(' ');
    expect(
      renderer!.root.findAllByType(TextInput).some(input => input.props.placeholder === 'Search recipient...'),
    ).toBe(true);
    expect(
      renderer!.root.findAllByType(TextInput).some(input => input.props.placeholder === 'Search transfer...'),
    ).toBe(false);
    expect(joinedText).toContain('All statuses');
    expect(joinedText).toContain('Total Transfers');
    expect(joinedText).toContain('Total Amount');
    expect(joinedText).toContain('Pending');
    expect(joinedText).toContain('Account');
    expect(joinedText).toContain('Recipient');
    expect(joinedText).toContain('Bank');
    expect(joinedText).toContain('Amount');
    expect(joinedText).toContain('Status');
    expect(joinedText).toContain('Device');
    expect(joinedText).toContain('Created');
    expect(joinedText).not.toContain('Action');
    expect(joinedText).toContain('Box A / Rack Blue');
    expect(joinedText).toMatch(/Fee\s+Rp\s*2\.500/);
    expect(joinedText).toMatch(/Showing\s+1\s+to\s+20\s+of\s+45\s+items/);
    expect(joinedText).toContain('Page 1/3');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Transfers Next Page'}).props.onPress();
    });

    expect(getAmTransfers).toHaveBeenLastCalledWith({
      page: 2,
      limit: 20,
      search: undefined,
      status: undefined,
    });
    expect(renderer!.root.findAllByProps({accessibilityLabel: 'AM Segment BCA Main - 123'})).toHaveLength(0);
  });

  it('creates a new transfer from the Transfers route form', async () => {
    jest.mocked(getAmServiceAccounts).mockResolvedValue({
      data: [
        {
          _id: 'account-1',
          label: 'BCA Main',
          platform: 'bca',
          accountNumber: '123',
          status: 'active',
          deviceId: null,
          username: '',
          credentials: {},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmTransfers).mockResolvedValue({
      data: [],
      meta: {total: 0, limit: 20, page: 1, totalPages: 1},
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'transactions');
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM New Transfer'}).props.onPress();
    });

    expect(renderer!.root.findAllByProps({accessibilityLabel: 'AM Segment DANA Main - 555'})).toHaveLength(0);

    let inputs = renderer!.root.findAllByType(TextInput);
    await act(async () => {
      inputs[1].props.onChangeText('999001');
      inputs[2].props.onChangeText('Vendor Baru');
      inputs[3].props.onChangeText('250000');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Segment Mandiri'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Segment BI FAST'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Segment Purchase'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Transfer Create'}).props.onPress();
    });

    expect(getAmServiceAccounts).toHaveBeenCalledWith({status: 'active', limit: 100});
    expect(createAmTransfer).toHaveBeenCalledWith({
      accountId: undefined,
      transferType: 'transfer',
      recipientAccount: '999001',
      recipientName: 'Vendor Baru',
      recipientBank: 'Mandiri',
      transferMethod: 'BI FAST',
      transactionPurpose: 'Purchase',
      amount: 250000,
    });
    expect(getAmTransfers).toHaveBeenCalledTimes(2);
    expect(renderText(renderer!).join(' ')).toContain('Transfer created');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM New Transfer'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Segment Virtual Account'}).props.onPress();
    });
    inputs = renderer!.root.findAllByType(TextInput);
    await act(async () => {
      inputs[1].props.onChangeText('880812345678');
      inputs[2].props.onChangeText('VA Vendor');
      inputs[3].props.onChangeText('0');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Transfer Create'}).props.onPress();
    });

    expect(createAmTransfer).toHaveBeenLastCalledWith({
      accountId: undefined,
      transferType: 'virtual-account',
      recipientAccount: '880812345678',
      recipientName: 'VA Vendor',
      recipientBank: undefined,
      transferMethod: undefined,
      transactionPurpose: undefined,
      amount: undefined,
    });
  });

  it('keeps transfer create validation aligned with AM FE before calling AM BE', async () => {
    jest.mocked(getAmServiceAccounts).mockResolvedValue({
      data: [
        {
          _id: 'account-1',
          label: 'BCA Main',
          platform: 'bca',
          accountNumber: '123',
          status: 'active',
          deviceId: null,
          username: '',
          credentials: {},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmTransfers).mockResolvedValue({
      data: [],
      meta: {total: 0, limit: 20, page: 1, totalPages: 1},
    });
    jest.mocked(createAmTransfer).mockClear();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'transactions');
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM New Transfer'}).props.onPress();
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Transfer Create'}).props.onPress();
    });
    expect(renderText(renderer!).join(' ')).toContain('Recipient account is required');
    expect(createAmTransfer).not.toHaveBeenCalled();

    let inputs = renderer!.root.findAllByType(TextInput);
    await act(async () => {
      inputs[1].props.onChangeText('999001');
      inputs[3].props.onChangeText('5000');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Segment Mandiri'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Transfer Create'}).props.onPress();
    });
    expect(renderText(renderer!).join(' ')).toContain('Minimal amount Rp 10.000');
    expect(createAmTransfer).not.toHaveBeenCalled();

    inputs = renderer!.root.findAllByType(TextInput);
    await act(async () => {
      inputs[3].props.onChangeText('250000');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Transfer Create'}).props.onPress();
    });
    expect(renderText(renderer!).join(' ')).toContain('Transfer method is required for inter-bank transfers');
    expect(createAmTransfer).not.toHaveBeenCalled();

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Segment BI FAST'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Transfer Create'}).props.onPress();
    });
    expect(renderText(renderer!).join(' ')).toContain('Transaction purpose is required');
    expect(createAmTransfer).not.toHaveBeenCalled();

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Segment Purchase'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Transfer Create'}).props.onPress();
    });

    expect(createAmTransfer).toHaveBeenCalledTimes(1);
    expect(createAmTransfer).toHaveBeenCalledWith(expect.objectContaining({
      recipientAccount: '999001',
      recipientBank: 'Mandiri',
      transferMethod: 'BI FAST',
      transactionPurpose: 'Purchase',
      amount: 250000,
    }));
  });

  it('loads transfer detail from the Transfers route', async () => {
    const transfer = {
      _id: 'transfer-detail',
      accountId: { _id: 'account-1', label: 'BCA Main', platform: 'bca', accountNumber: '123' },
      amount: 250000,
      completedAt: '2026-01-01T00:05:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      createdBy: { _id: 'user-1', fullName: 'Admin User', username: 'admin' },
      deviceId: {
        _id: 'device-1',
        name: 'Phone 1',
        udid: 'USB1234',
        boxId: {
          _id: 'box-1',
          name: 'Box A',
          rackId: {_id: 'rack-1', name: 'Rack Blue', serverIp: '10.10.10.5'},
        },
      },
      error: '',
      fee: 2500,
      logs: Array.from({length: 35}, (_, index) => `log-${String(index + 1).padStart(2, '0')}`),
      recipientAccount: '999',
      recipientBank: 'BCA',
      recipientName: 'Vendor Detail',
      screenshot: 'abc123',
      startedAt: '2026-01-01T00:01:00.000Z',
      status: 'success',
      transactionPurpose: 'Payment',
      transferMethod: 'BI FAST',
      transferType: 'transfer',
      updatedAt: '',
    };
    jest.mocked(getAmTransfers).mockResolvedValue({
      data: [transfer],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmTransferById).mockResolvedValue(transfer);
    jest.mocked(getAmWebhookLogs).mockResolvedValue({
      data: [
        {
          _id: 'webhook-log-1',
          configId: {_id: 'webhook-1', url: 'https://example.test/hook', description: 'Inventory hook'},
          direction: 'outgoing',
          event: 'transfer.success',
          url: 'https://example.test/hook',
          requestBody: {payload: {transferId: 'transfer-detail'}},
          responseStatus: 200,
          responseBody: {ok: true},
          success: true,
          error: '',
          duration: 42,
          createdAt: '2026-01-01T00:06:00.000Z',
        },
        {
          _id: 'webhook-log-other',
          configId: {_id: 'webhook-2', url: 'https://example.test/other', description: 'Other hook'},
          direction: 'outgoing',
          event: 'transfer.success',
          url: 'https://example.test/other',
          requestBody: {payload: {transferId: 'other-transfer'}},
          responseStatus: 200,
          responseBody: {ok: true},
          success: true,
          error: '',
          duration: 12,
          createdAt: '2026-01-01T00:07:00.000Z',
        },
      ],
      meta: {total: 2, limit: 20},
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'transactions');
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Transfer Detail transfer-detail'}).props.onPress();
    });

    expect(getAmTransferById).toHaveBeenCalledWith('transfer-detail');
    expect(getAmWebhookLogs).toHaveBeenCalledWith({
      event: 'transfer.success',
      limit: 20,
    });
    const text = renderText(renderer!);
    const joinedText = text.join(' ');
    expect(text).toContain('Transfer Detail');
    expect(text).toContain('Vendor Detail');
    expect(text).toContain('Transfer Info');
    expect(joinedText).toMatch(/Total\s+Rp\s*252\.500/);
    expect(joinedText).toContain('Transfer Method BI FAST');
    expect(joinedText).toContain('Transaction Purpose Payment');
    expect(joinedText).toContain('Created At');
    expect(joinedText).toContain('Created By Admin User');
    expect(joinedText).toContain('Source & Device');
    expect(joinedText).toContain('Account Type bca');
    expect(joinedText).toContain('Account Number 123');
    expect(joinedText).toContain('Box / Rack Box A / Rack Blue');
    expect(joinedText).toContain('Server IP 10.10.10.5');
    expect(joinedText).toContain('Webhook Delivery Logs');
    expect(joinedText).toContain('Inventory hook');
    expect(joinedText).not.toContain('Other hook');
    expect(joinedText).toMatch(/Screenshot base64 tersedia \(\s*6\s+chars\)/);
    expect(text).toContain('Transaction Proof');
    expect(text).toContain('Automation Logs');
    expect(joinedText).toMatch(/35\s+line\(s\)/);
    expect(
      renderer!.root.findByProps({accessibilityLabel: 'AM Transfer Transaction Proof'}).props.source,
    ).toEqual({uri: 'data:image/png;base64,abc123'});
    expect(renderer!.root.findAllByType(Image)).toHaveLength(1);
    expect(joinedText).toMatch(/001\s+log-01/);
    expect(joinedText).toMatch(/035\s+log-35/);
  });

  it('opens transfer detail directly from a concrete AM shell route with detail actions', async () => {
    const transfer = {
      _id: 'transfer-detail',
      accountId: { _id: 'account-1', label: 'BCA Main', platform: 'bca', accountNumber: '123' },
      amount: 250000,
      completedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      createdBy: { _id: 'user-1', fullName: 'Admin User', username: 'admin' },
      deviceId: {
        _id: 'device-1',
        name: 'Phone 1',
        udid: 'USB1234',
        boxId: {
          _id: 'box-1',
          name: 'Box A',
          rackId: {_id: 'rack-1', name: 'Rack Blue', serverIp: '10.10.10.5'},
        },
      },
      error: '',
      fee: 2500,
      logs: ['created', 'completed'],
      recipientAccount: '999',
      recipientBank: 'BCA',
      recipientName: 'Vendor Detail',
      screenshot: '',
      startedAt: '2026-01-01T00:01:00.000Z',
      status: 'pending',
      transactionPurpose: 'Payment',
      transferMethod: 'BI FAST',
      transferType: 'transfer',
      updatedAt: '',
    };
    jest.mocked(getAmTransferById).mockResolvedValue(transfer);
    jest.mocked(getAmTransfers).mockResolvedValue({
      data: [],
      meta: {total: 0, limit: 20},
    });
    const onModuleRouteSelect = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface
          activeModuleRoute={concreteAmRoute(
            'transactions/transfer-detail',
            'transactions/:id',
          )}
          dataset={seedUnifiedDataset}
          onModuleRouteSelect={onModuleRouteSelect}
        />,
      );
    });
    renderers.push(renderer!);

    expect(getAmTransferById).toHaveBeenCalledWith('transfer-detail');
    expect(recordAmPageView).toHaveBeenCalledWith('/transactions/transfer-detail');
    const joinedText = renderText(renderer!).join(' ');
    expect(joinedText).toContain('Transfer Detail');
    expect(joinedText).toContain('Vendor Detail');
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Transfer Cancel transfer-detail'}).props.onPress();
    });

    expect(cancelAmTransfer).toHaveBeenCalledWith('transfer-detail');
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Transfer Back'}).props.onPress();
    });

    expect(onModuleRouteSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        moduleId: 'am',
        route: 'transactions',
      }),
    );
  });

  it('runs webhook register, toggle, delete, and test ping actions', async () => {
    jest.mocked(getAmWebhookConfigs).mockResolvedValue({
      data: [
        {
          _id: 'webhook-1',
          url: 'https://example.test/webhook',
          events: ['transfer.success'],
          status: 'active',
          description: 'Existing hook',
          hasSecret: true,
          secretMasked: 'sec...ok',
          lastDeliveredAt: '2026-07-31T01:30:00.000Z',
          failCount: 0,
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'webhooks');

    expect(renderer!.root.findAllByProps({accessibilityLabel: 'AM Webhook Save'})).toHaveLength(0);
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Webhook Register'}).props.onPress();
    });

    const inputs = renderer!.root.findAllByType(TextInput);
    await act(async () => {
      inputs[0].props.onChangeText('https://new.example.test/webhook');
      inputs[1].props.onChangeText('secret');
      inputs[2].props.onChangeText('New hook');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Webhook Save'}).props.onPress();
    });
    expect(createAmWebhookConfig).not.toHaveBeenCalled();
    expect(renderText(renderer!).join(' ')).toContain('Secret HMAC minimal 16 karakter wajib diisi');

    await act(async () => {
      inputs[1].props.onChangeText('secret-16-chars-ok');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Webhook Save'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Webhook Toggle webhook-1'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Webhook Delete webhook-1'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'Test Ping'}).props.onPress();
    });

    expect(createAmWebhookConfig).toHaveBeenCalledWith({
      url: 'https://new.example.test/webhook',
      events: ['transfer.success', 'mutasi.created'],
      description: 'New hook',
      secret: 'secret-16-chars-ok',
    });
    expect(updateAmWebhookConfig).toHaveBeenCalledWith('webhook-1', {
      status: 'inactive',
    });
    expect(deleteAmWebhookConfig).toHaveBeenCalledWith('webhook-1');
    expect(testAmWebhookPing).toHaveBeenCalledTimes(1);
    const configText = renderText(renderer!).join(' ');
    expect(configText).toContain('Endpoints');
    expect(configText).not.toContain('Webhook Config');
    expect(configText).toContain('Test ping dispatched to 1 active config(s)');
    expect(configText).toContain('Last delivered:');
    expect(configText).toContain('31 Jul 2026');
    expect(configText).toContain('sec...ok');
  });

  it('filters and paginates webhook delivery logs against AM BE query params', async () => {
    jest.mocked(getAmWebhookConfigs).mockResolvedValue({
      data: [
        {
          _id: 'webhook-1',
          url: 'https://example.test/webhook',
          events: ['transfer.success'],
          status: 'active',
          description: 'Existing hook',
          lastDeliveredAt: null,
          failCount: 0,
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmWebhookLogs).mockResolvedValue({
      data: [
        {
          _id: 'webhook-log-1',
          configId: {_id: 'webhook-1', url: 'https://example.test/webhook', description: 'Existing hook'},
          direction: 'outgoing',
          event: 'transfer.success',
          url: 'https://example.test/webhook',
          requestBody: {payload: {transferId: 'transfer-1'}},
          responseStatus: 200,
          responseBody: {ok: true},
          success: true,
          error: '',
          duration: 42,
          createdAt: '2026-07-31T01:00:00.000Z',
        },
      ],
      meta: {total: 75, limit: 50},
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await updateAmRoute(renderer!, 'webhooks');

    expect(getAmWebhookLogs).toHaveBeenLastCalledWith({
      page: 1,
      limit: 50,
      direction: undefined,
    });
    const webhooksText = renderText(renderer!).join(' ');
    expect(webhooksText).toContain('https://example.test/webhook');
    expect(webhooksText).toContain('Time');
    expect(webhooksText).toMatch(/Showing\s+1\s+to\s+50\s+of\s+75\s+items/);
    expect(renderer!.root.findAllByProps({accessibilityLabel: 'AM Segment Incoming'})).toHaveLength(0);
    expect(renderer!.root.findAllByProps({accessibilityLabel: 'AM Segment transfer.success'})).toHaveLength(0);
    expect(renderer!.root.findAllByProps({accessibilityLabel: 'AM Segment Existing hook'})).toHaveLength(0);

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Webhook Log Detail webhook-log-1'}).props.onPress();
    });

    const detailText = renderText(renderer!).join(' ');
    expect(detailText).toContain('Webhook Log Detail');
    expect(detailText).toContain('Existing hook');
    expect(detailText).toContain('Request Body');
    expect(detailText).toContain('Response Body');
    expect(detailText).toContain('"transferId": "transfer-1"');
    expect(detailText).toContain('"ok": true');

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Segment Outgoing'}).props.onPress();
    });
    expect(getAmWebhookLogs).toHaveBeenLastCalledWith({
      page: 1,
      limit: 50,
      direction: 'outgoing',
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Webhook Logs Next Page'}).props.onPress();
    });
    expect(getAmWebhookLogs).toHaveBeenLastCalledWith({
      page: 2,
      limit: 50,
      direction: 'outgoing',
    });
  });
});
