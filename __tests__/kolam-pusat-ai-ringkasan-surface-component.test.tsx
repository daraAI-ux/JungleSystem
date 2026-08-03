import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {useKolamAuthContext} from '../src/context/kolam-app-contexts';
import {KolamPusatAiRingkasanSurface} from '../src/components/kolam-pusat-ai-ringkasan-surface';
import {fetchKolamDaraJobsList} from '../src/services/kolam-dara-jobs-api';
import {fetchKolamOwnerCopilotDashboard} from '../src/services/kolam-dara-owner-copilot-api';
import {fetchKolamDaraMarketingHub} from '../src/services/kolam-dara-marketing-hub-api';

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
    fetchJobsMock.mockResolvedValue([]);
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
