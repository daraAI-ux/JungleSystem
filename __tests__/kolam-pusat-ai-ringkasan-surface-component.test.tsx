import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {useKolamAuthContext} from '../src/context/kolam-app-contexts';
import {KolamPusatAiRingkasanSurface} from '../src/components/kolam-pusat-ai-ringkasan-surface';
import {fetchKolamDaraJobsList} from '../src/services/kolam-dara-jobs-api';
import {fetchKolamOwnerCopilotDashboard} from '../src/services/kolam-dara-owner-copilot-api';
import {fetchKolamDaraStaffNotifyLog} from '../src/services/kolam-dara-staff-notify-log-api';
import {fetchKolamDaraMarketingHub} from '../src/services/kolam-dara-marketing-hub-api';
import {
  fetchKolamKatakTerbangHealth,
  fetchKolamShippingDeliveryStats,
  fetchKolamShippingOpsLog,
} from '../src/services/kolam-dara-shipping-copilot-api';
import {
  getKolamTeamChatRooms,
  getKolamWebSetting,
} from '../src/services/kolam-api';
import {getKolamSources} from '../src/services/kolam-source-api';

jest.mock('../src/services/kolam-dara-marketing-hub-api', () => ({
  fetchKolamDaraMarketingHub: jest.fn(),
}));

jest.mock('../src/services/kolam-dara-jobs-api', () => ({
  fetchKolamDaraJobsList: jest.fn(),
  fetchKolamDaraJob: jest.fn(),
  normalizeKolamDaraSeoTargetTypes: jest.fn(),
}));

jest.mock('../src/services/kolam-dara-owner-copilot-api', () => ({
  fetchKolamOwnerCopilotDashboard: jest.fn(),
}));

jest.mock('../src/services/kolam-dara-staff-notify-log-api', () => ({
  fetchKolamDaraStaffNotifyLog: jest.fn(),
}));

jest.mock('../src/services/kolam-dara-shipping-copilot-api', () => ({
  fetchKolamShippingDeliveryStats: jest.fn(),
  fetchKolamShippingOpsLog: jest.fn(),
  fetchKolamKatakTerbangHealth: jest.fn(),
}));

jest.mock('../src/services/kolam-api', () => ({
  getKolamTeamChatRooms: jest.fn(),
  getKolamWebSetting: jest.fn(),
  updateKolamWebSetting: jest.fn(),
}));

jest.mock('../src/services/kolam-source-api', () => ({
  getKolamSources: jest.fn(),
}));

jest.mock('../src/context/kolam-app-contexts', () => ({
  useKolamAuthContext: jest.fn(),
}));

const fetchHubMock = fetchKolamDaraMarketingHub as jest.MockedFunction<
  typeof fetchKolamDaraMarketingHub
>;
const fetchJobsMock = fetchKolamDaraJobsList as jest.MockedFunction<
  typeof fetchKolamDaraJobsList
>;
const fetchOwnerMock = fetchKolamOwnerCopilotDashboard as jest.MockedFunction<
  typeof fetchKolamOwnerCopilotDashboard
>;
const fetchLogMock = fetchKolamDaraStaffNotifyLog as jest.MockedFunction<
  typeof fetchKolamDaraStaffNotifyLog
>;
const fetchStatsMock = fetchKolamShippingDeliveryStats as jest.MockedFunction<
  typeof fetchKolamShippingDeliveryStats
>;
const fetchOpsMock = fetchKolamShippingOpsLog as jest.MockedFunction<
  typeof fetchKolamShippingOpsLog
>;
const fetchHealthMock = fetchKolamKatakTerbangHealth as jest.MockedFunction<
  typeof fetchKolamKatakTerbangHealth
>;
const getRoomsMock = getKolamTeamChatRooms as jest.MockedFunction<
  typeof getKolamTeamChatRooms
>;
const getWebSettingMock = getKolamWebSetting as jest.MockedFunction<
  typeof getKolamWebSetting
>;
const getSourcesMock = getKolamSources as jest.MockedFunction<
  typeof getKolamSources
>;
const useAuthContextMock = useKolamAuthContext as jest.MockedFunction<
  typeof useKolamAuthContext
>;

function renderText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAll(node => typeof node.props.children === 'string')
    .flatMap(node => {
      const value = node.props.children;
      return typeof value === 'string' ? [value] : [];
    });
}

describe('KolamPusatAiRingkasanSurface', () => {
  beforeEach(() => {
    fetchHubMock.mockReset();
    fetchJobsMock.mockReset();
    fetchOwnerMock.mockReset();
    fetchLogMock.mockReset();
    fetchStatsMock.mockReset();
    fetchOpsMock.mockReset();
    fetchHealthMock.mockReset();
    getRoomsMock.mockReset();
    getWebSettingMock.mockReset();
    getSourcesMock.mockReset();
    fetchJobsMock.mockResolvedValue([]);
    getRoomsMock.mockResolvedValue([
      {_id: 'room-ops', name: 'Ops Transaksi', isGeneral: false},
    ]);
    getWebSettingMock.mockResolvedValue({
      katakTerbangWorkerName: 'Katak',
      katakTerbangWorkerPhotoUrl: '',
      transaksiCopilotChatNotifyEnabled: true,
      transaksiCopilotTeamRoomId: 'room-ops',
    } as never);
    getSourcesMock.mockResolvedValue({
      items: [],
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 1,
    });
    fetchStatsMock.mockResolvedValue({
      generatedAt: '2026-08-03T12:00:00.000Z',
      range: 'month',
      note: 'Order delivery ditangani DARA vs Katak Terbang',
      dara: {
        value: 12,
        change: 5,
        data: [{timestamp: '2026-08-01T00:00:00.000Z', value: 2}],
        byChannel: {shopee: 4, tokopedia: 5, web: 3},
      },
      bot: {
        value: 8,
        change: -1,
        data: [],
        byChannel: {shopee: 3, tokopedia: 3, web: 2},
      },
      katakTerbangProfile: {name: 'Katak', photoUrl: ''},
      channelSources: {
        shopee: {sourceId: null, name: 'Shopee', logo: null},
        tokopedia: {sourceId: null, name: 'Tokopedia', logo: null},
        web: {sourceId: null, name: 'Website', logo: null},
      },
    });
    fetchOpsMock.mockResolvedValue({
      generatedAt: '2026-08-03T12:00:00.000Z',
      lookbackHours: 72,
      dara: [
        {
          id: 'd1',
          at: '2026-08-03T11:00:00.000Z',
          eventType: 'webstore_fulfillment',
          action: '',
          invoiceCode: 'INV-T',
          phase: 'packing',
          detail: 'Packing webstore',
        },
      ],
      bot: [],
    });
    fetchHealthMock.mockResolvedValue({
      checkedAt: '2026-08-03T12:00:00.000Z',
      overallHealthy: true,
      overallState: 'healthy',
      amConfigured: true,
      amReachable: true,
      platforms: [
        {
          platform: 'shopee',
          enabled: true,
          healthy: true,
          state: 'healthy',
          reason: '',
        },
      ],
      notifyRoom: {
        id: 'room-ops',
        name: 'Ops Transaksi',
        webHref: '/team-chat?room=room-ops',
      },
    });
    fetchLogMock.mockResolvedValue({
      generatedAt: '2026-08-03T12:00:00.000Z',
      lookbackHours: 72,
      summary: {total: 1, llmCopy: 1, templateCopy: 0},
      events: [
        {
          id: 'e1',
          at: '2026-08-03T11:00:00.000Z',
          eventType: 'dara_staff_notify',
          action: 'webstore_packing_request',
          invoiceCode: 'INV-9',
          phase: '',
          detail: 'Packing dimulai',
          copySource: 'llm',
          notified: {teamChat: true, waStaff: false, browserPush: false},
          saleId: '',
        },
      ],
    });
    fetchOwnerMock.mockResolvedValue({
      generatedAt: '2026-08-03T12:00:00.000Z',
      lookbackHours: 24,
      windowLabel: '3 Agu 00.00 — 3 Agu 12.00 WIB',
      teamChat: {
        aiRoomId: 'room-1',
        roomName: 'Chat dengan DARA',
        webHref: '/team-chat?room=room-1',
        suggestedPrompts: ['Ringkasan bisnis hari ini'],
      },
      health: {
        salesFormatted: 'Rp 1.000.000',
        orderCount: 4,
        marginFormatted: 'Rp 200.000 (20.0%)',
        lowStockCount: 3,
      },
      nightOps: {
        opsAuditEnabled: true,
        counts: {
          olshop_dispatch: 2,
          olshop_defer: 0,
          olshop_fail: 0,
          olshop_stock_hold: 0,
          webstore_start: 1,
          dana_ok: 1,
          dana_fail: 0,
        },
        failures: [],
        recentEvents: [],
      },
      insights: [],
      executiveNote: 'Note eksekutif.',
    });
    useAuthContextMock.mockReturnValue({
      authUser: {roleKey: 'super_admin'},
    } as ReturnType<typeof useKolamAuthContext>);
    fetchHubMock.mockResolvedValue({
      generatedAt: '2026-08-03T00:00:00.000Z',
      seo: {
        seoScore: 72,
        pendingApprovals: 2,
        negativeMentions: 1,
        keywordCount: 9,
      },
      market: {
        pendingApprovals: 3,
        tooCheap: 4,
        tooExpensive: 5,
        lowMargin: 1,
      },
      integrations: {
        serpConfigured: true,
        searxngReachable: false,
      },
      serpSnapshotsStored: 11,
      quickLinks: [
        {href: '/campaign/dara-seo', label: 'DARA SEO'},
        {href: '/campaign/dara-jobs', label: 'Riwayat proses'},
      ],
      brands: [
        {id: 'b1', name: 'Anura', productCount: 2, monitoringActive: true},
      ],
      selectedBrandId: 'all',
    });
  });

  it('renders hub tabs and Ringkasan content for admin', async () => {
    const onRouteChange = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamPusatAiRingkasanSurface
          onRouteChange={onRouteChange}
          route="/pusat-ai"
        />,
      );
      await Promise.resolve();
    });

    const text = renderText(renderer!).join(' ');
    expect(text).toContain('Ringkasan');
    expect(text).toContain('Proses');
    expect(text).toContain('Owner Copilot');
    expect(text).toContain('Transaksi Copilot');
    expect(text).toContain('Skor SEO');
    expect(text).toContain('DARA SEO');
    expect(text).not.toContain('Riwayat proses');

    const seoButton = renderer!.root.find(
      node =>
        typeof node.props.label === 'string' && node.props.label === 'Buka SEO',
    );
    await ReactTestRenderer.act(async () => {
      seoButton.props.onPress();
    });
    expect(onRouteChange).toHaveBeenCalledWith('/campaign/dara-seo');
  });

  it('switches to Proses tab and loads job history', async () => {
    fetchJobsMock.mockResolvedValue([
      {
        id: 'job-1',
        module: 'seo',
        jobType: 'seo.bulk_products',
        status: 'running',
        label: 'Audit bulk produk',
        progressCurrent: 2,
        progressTotal: 10,
        progressMessage: 'Memproses 2/10',
        error: '',
        createdAt: '2026-08-03T00:00:00.000Z',
        finishedAt: '',
      },
    ]);

    const onRouteChange = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamPusatAiRingkasanSurface
          onRouteChange={onRouteChange}
          route="/pusat-ai"
        />,
      );
      await Promise.resolve();
    });

    const prosesTab = renderer!.root.find(
      node =>
        typeof node.props.label === 'string' &&
        node.props.label === 'Proses' &&
        typeof node.props.onSelect === 'function',
    );

    await ReactTestRenderer.act(async () => {
      prosesTab.props.onSelect('proses');
    });
    expect(onRouteChange).toHaveBeenCalledWith('/pusat-ai?tab=proses');

    await ReactTestRenderer.act(async () => {
      renderer!.update(
        <KolamPusatAiRingkasanSurface
          onRouteChange={onRouteChange}
          route="/pusat-ai?tab=proses"
        />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = renderText(renderer!).join(' ');
    expect(text).not.toContain('Belum tersedia');
    expect(text).toContain(
      'Progress bar hanya tampil saat proses berjalan',
    );
    expect(text).toContain('Proses');
    expect(text).toContain('Modul');
    expect(text).toContain('Status');
    expect(text).toContain('Progress');
    expect(text).toContain('Aksi');
    expect(text).toContain('Audit bulk produk');
    expect(text).toContain('SEO');
    expect(text).toContain('running');
    expect(text).toContain('Update');
    expect(text).toContain('Tutup');
    expect(text).toContain('Perbaiki tipe SEO lama');
    expect(fetchJobsMock).toHaveBeenCalled();
  });

  it('loads Owner Copilot dashboard for admin', async () => {
    const onRouteChange = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamPusatAiRingkasanSurface
          onRouteChange={onRouteChange}
          route="/pusat-ai?tab=owner-copilot"
        />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = renderText(renderer!).join(' ');
    expect(text).toContain('Owner Copilot');
    expect(text).toContain('Bisnis hari ini');
    expect(text).toContain('Night Ops (24 jam)');
    expect(text).toContain('Rp 1.000.000');
    expect(text).toContain('Buka room DARA');
    expect(text).toContain('Ringkasan bisnis hari ini');
    expect(fetchOwnerMock).toHaveBeenCalled();

    const openRoom = renderer!.root.find(
      node =>
        typeof node.props.label === 'string' &&
        node.props.label === 'Buka room DARA',
    );
    await ReactTestRenderer.act(async () => {
      openRoom.props.onPress();
    });
    expect(onRouteChange).toHaveBeenCalledWith('/team-chat?room=room-1');
  });

  it('loads Log DARA staff notify events for admin', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamPusatAiRingkasanSurface route="/pusat-ai?tab=log-dara" />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = renderText(renderer!).join(' ');
    expect(text).not.toContain('Belum tersedia');
    expect(text).toContain('Total 1');
    expect(text).toContain('LLM 1');
    expect(text).toContain('72 jam terakhir');
    expect(text).toContain('Riwayat event');
    expect(text).toContain('Packing dimulai');
    expect(text).toContain('INV-9');
    expect(text).toContain('Team Chat');
    expect(text).toContain('LLM');
    expect(fetchLogMock).toHaveBeenCalled();
  });

  it('loads Transaksi Copilot shipping dashboard for admin', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamPusatAiRingkasanSurface route="/pusat-ai?tab=transaksi-copilot" />,
      );
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = renderText(renderer!).join(' ');
    expect(text).not.toContain('Belum tersedia');
    expect(text).toContain('Transaksi Copilot');
    expect(text).toContain('Room log transaksi DARA');
    expect(text).toContain('Kesehatan Bot — Katak Terbang');
    expect(text).toContain('Delivery DARA');
    expect(text).toContain('Bot — Katak Terbang');
    expect(text).toContain('Console operasi');
    expect(text).toContain('Log DARA');
    expect(text).toContain('Log Bot');
    expect(text).toContain('12 order');
    expect(fetchStatsMock).toHaveBeenCalled();
    expect(fetchOpsMock).toHaveBeenCalled();
    expect(fetchHealthMock).toHaveBeenCalled();
  });

  it('hides admin tabs for non-admin roles', async () => {
    useAuthContextMock.mockReturnValue({
      authUser: {roleKey: 'staff'},
    } as ReturnType<typeof useKolamAuthContext>);

    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamPusatAiRingkasanSurface route="/pusat-ai" />,
      );
      await Promise.resolve();
    });

    const text = renderText(renderer!).join(' ');
    expect(text).toContain('Ringkasan');
    expect(text).toContain('Proses');
    expect(text).not.toContain('Owner Copilot');
    expect(text).not.toContain('Inventory Copilot');
  });
});
