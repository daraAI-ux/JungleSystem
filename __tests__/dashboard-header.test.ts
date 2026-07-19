import {
  getDashboardHeaderActions,
  getDashboardHeaderRouteContext,
  getDashboardHeaderSyncIndicator,
  getDashboardHeaderVisualContract,
  getDashboardGreeting,
  getDashboardInitials,
  getDashboardSubtitle,
  getDashboardTitle,
  shouldShowDashboardSessionPill,
} from '../src/domain/dashboard-header';
import { getShellModuleRouteEntry } from '../src/domain/app-shell';
import {
  amSurfaces,
  getPluginRouteIndex,
  pluginRegistry,
} from '../src/domain/unified';
import { seedUnifiedDataset } from '../src/services/unified-data';

describe('dashboard header copy', () => {
  it('matches the live Kolam greeting ranges', () => {
    expect(getDashboardGreeting(new Date('2026-07-15T08:00:00Z'))).toBe(
      'Selamat pagi',
    );
    expect(getDashboardGreeting(new Date('2026-07-15T13:00:00Z'))).toBe(
      'Selamat siang',
    );
    expect(getDashboardGreeting(new Date('2026-07-15T18:00:00Z'))).toBe(
      'Selamat sore',
    );
    expect(getDashboardGreeting(new Date('2026-07-15T21:00:00Z'))).toBe(
      'Selamat malam',
    );
  });

  it('uses the live user timezone contract for the Kolam greeting', () => {
    const utcLateMorning = new Date('2026-07-15T11:30:00Z');

    expect(getDashboardGreeting(utcLateMorning, 'UTC+07:00')).toBe(
      'Selamat sore',
    );
    expect(getDashboardGreeting(utcLateMorning, 'UTC+08:00')).toBe(
      'Selamat malam',
    );
    expect(getDashboardGreeting(utcLateMorning, 'invalid')).toBe(
      'Selamat pagi',
    );
  });

  it('keeps the Kolam dashboard subtitle from the live source pattern', () => {
    expect(getDashboardSubtitle('Kolam')).toBe(
      'Ringkasan performa toko hari ini: penjualan, stok, dan pesanan tertunda.',
    );
    expect(getDashboardSubtitle('Plugin Hub')).toBe(
      'Plugin Hub workspace native Windows.',
    );
  });

  it('builds the live DashboardHeader title without a dangling comma', () => {
    const morning = new Date('2026-07-15T08:00:00');

    expect(getDashboardTitle('Offline Operator', morning)).toBe(
      'Selamat pagi, Offline Operator',
    );
    expect(getDashboardTitle('  ', morning)).toBe('Selamat pagi');
    expect(
      getDashboardTitle(
        'Anura Staff',
        new Date('2026-07-15T11:30:00Z'),
        'UTC+08:00',
      ),
    ).toBe('Selamat malam, Anura Staff');
  });

  it('keeps native session status scoped to Beranda only', () => {
    expect(shouldShowDashboardSessionPill('Beranda')).toBe(true);
    expect(shouldShowDashboardSessionPill()).toBe(false);
  });

  it('builds route-aware page header context for native route surfaces', () => {
    const saleDraftRoute = getShellModuleRouteEntry('checkout', 'sale-draft');
    const teamChatRoute = getPluginRouteIndex(pluginRegistry).find(
      route => route.route === '/team-chat',
    );
    const taskSurface = amSurfaces.find(surface => surface.id === 'tasks');

    if (!saleDraftRoute || !teamChatRoute || !taskSurface) {
      throw new Error('Expected route context fixtures are missing.');
    }

    expect(
      getDashboardHeaderRouteContext({ activeModuleRoute: saleDraftRoute }),
    ).toEqual(
      expect.objectContaining({
        eyebrow: 'POS Route',
        route: 'sale-draft',
        subtitle: '',
        title: 'sale-draft',
      }),
    );
    expect(
      getDashboardHeaderRouteContext({ activePluginRoute: teamChatRoute }),
    ).toEqual(
      expect.objectContaining({
        eyebrow: 'Plugin Route',
        route: '/team-chat',
        subtitle: '',
        title: 'Chat /team-chat',
      }),
    );
    expect(
      getDashboardHeaderRouteContext({ activeAmSurface: taskSurface }),
    ).toEqual(
      expect.objectContaining({
        eyebrow: 'AM Surface',
        route: 'am-fe/(dashboard)/tasks / am-be/routes/task',
        subtitle: '',
        title: 'Tasks',
      }),
    );
  });

  it('maps dashboard header sync indicator from active module data source', () => {
    const cachedDataset = {
      ...seedUnifiedDataset,
      kolam: { ...seedUnifiedDataset.kolam, source: 'cache' as const },
      sync: { ...seedUnifiedDataset.sync, kolam: 'cache' as const },
    };
    const livePosDataset = {
      ...seedUnifiedDataset,
      sync: { ...seedUnifiedDataset.sync, pos: 'live' as const },
    };

    expect(
      getDashboardHeaderSyncIndicator({
        activeModule: 'kolam',
        dataset: cachedDataset,
      }),
    ).toEqual(
      expect.objectContaining({
        area: 'kolam',
        areaLabel: 'Kolam',
        detail: 'Kolam data source: Cache',
        intent: 'success',
        label: 'Cache',
        status: 'cache',
        statusIconKind: 'check',
      }),
    );
    expect(
      getDashboardHeaderSyncIndicator({
        activeModule: 'checkout',
        dataset: livePosDataset,
      }),
    ).toEqual(
      expect.objectContaining({
        area: 'pos',
        label: 'Live',
        status: 'live',
      }),
    );
  });

  it('maps live dashboard header actions to native modules', () => {
    expect(getDashboardHeaderActions()).toEqual([
      {
        id: 'new-product',
        label: 'Produk Baru',
        iconKind: 'package',
        intent: 'outline',
        buttonTone: 'positive',
        requiredArea: 'kolam',
        targetModule: 'catalog',
        sourceRoute: '/products/create',
        accessibilityLabel: 'Produk Baru - /products/create',
      },
      {
        id: 'new-order',
        label: 'Order Baru',
        iconKind: 'plus',
        intent: 'primary',
        buttonTone: 'positive',
        requiredArea: 'pos',
        targetModule: 'checkout',
        sourceRoute: '/sales/create',
        accessibilityLabel: 'Order Baru - /sales/create',
      },
    ]);
  });

  it('filters live dashboard header actions using native access scope gates', () => {
    expect(
      getDashboardHeaderActions({ kolam: true, pos: false }).map(
        action => action.id,
      ),
    ).toEqual(['new-product']);
    expect(
      getDashboardHeaderActions({ kolam: false, pos: true }).map(
        action => action.id,
      ),
    ).toEqual(['new-order']);
    expect(
      getDashboardHeaderActions({ kolam: false, pos: false }).map(
        action => action.id,
      ),
    ).toEqual([]);
  });

  it('tracks the live DashboardHeader typography contract for the native page header', () => {
    expect(getDashboardHeaderVisualContract()).toEqual({
      sourceComponent:
        'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\(partials)\\header.tsx',
      layout: {
        gap: 24,
        minHeight: 64,
        paddingTop: 10,
        paddingBottom: 4,
        alignItems: 'flex-end',
      },
      eyebrow: {
        fontSize: 11,
        marginBottom: 7,
        fontWeight: 'bold',
        letterSpacing: 1.3,
        textTransform: 'uppercase',
      },
      title: {
        fontSize: 22,
        lineHeight: 25,
        fontWeight: 'bold',
        trackingSource: 'dashboard-exact-title',
        appliedLetterSpacing: 0,
      },
      description: {
        fontSize: 13,
        marginTop: 6,
      },
      actions: {
        gapX: 10,
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexWrap: 'wrap',
        flexShrink: 0,
        buttonTone: 'positive',
        sourceClass: 'kolam-positive-action',
      },
      sessionPill: {
        visibleOnBeranda: true,
        nativeOnly: true,
        minWidth: 190,
        padding: 10,
        radius: 8,
        borderWidth: 1,
        labelFontSize: 12,
        valueGapY: 3,
        valueFontSize: 14,
      },
    });
  });

  it('returns cloned header visual values so render code cannot mutate the contract', () => {
    const first = getDashboardHeaderVisualContract();
    first.title.fontSize = 99;
    first.layout.minHeight = 99;
    first.layout.paddingTop = 99;
    first.actions.gapX = 99;
    first.actions.flexWrap = 'nowrap' as 'wrap';
    (first.actions as { flexShrink: number }).flexShrink = 1;
    (first.actions as { sourceClass: string }).sourceClass = 'mutated';
    first.eyebrow.fontSize = 99;
    first.sessionPill.visibleOnBeranda = true;
    first.sessionPill.valueFontSize = 99;

    expect(getDashboardHeaderVisualContract().title.fontSize).toBe(22);
    expect(getDashboardHeaderVisualContract().layout.minHeight).toBe(64);
    expect(getDashboardHeaderVisualContract().layout.paddingTop).toBe(10);
    expect(getDashboardHeaderVisualContract().actions.gapX).toBe(10);
    expect(getDashboardHeaderVisualContract().actions.flexWrap).toBe('wrap');
    expect(getDashboardHeaderVisualContract().actions.flexShrink).toBe(0);
    expect(getDashboardHeaderVisualContract().actions.sourceClass).toBe(
      'kolam-positive-action',
    );
    expect(getDashboardHeaderVisualContract().eyebrow.fontSize).toBe(11);
    expect(
      getDashboardHeaderVisualContract().sessionPill.visibleOnBeranda,
    ).toBe(true);
    expect(getDashboardHeaderVisualContract().sessionPill.valueFontSize).toBe(
      14,
    );
  });

  it('builds avatar initials for the native topbar', () => {
    expect(getDashboardInitials('Offline Operator')).toBe('OO');
    expect(getDashboardInitials('Fito')).toBe('F');
    expect(getDashboardInitials('')).toBe('K');
  });
});
