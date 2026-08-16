import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamAppShellSurface } from '../src/components/kolam-app-shell-surface';
import { showKolamOverflowMenuOverlay } from '../src/components/kolam-overflow-menu-overlay-host';
import { getDashboardLayoutVisualContract } from '../src/domain/dashboard-layout';
import {
  getDashboardHeaderActions,
  getDashboardHeaderSyncIndicator,
} from '../src/domain/dashboard-header';
import {
  getTopNavBreadcrumbItems,
  getTopNavRightControls,
} from '../src/domain/top-nav';
import { seedUnifiedDataset } from '../src/services/unified-data';

jest.mock('../src/hooks/use-kolam-server-metrics-controller', () => ({
  useKolamServerMetricsController: () => ({
    snapshot: {
      checkedAt: '2026-07-19T00:00:00.000Z',
      cpuPercent: 12,
      memoryPercent: 34,
      diskPercent: 56,
    },
  }),
}));

jest.mock('../src/hooks/use-kolam-admin-cashflow-header-controller', () => ({
  useKolamAdminCashflowHeaderController: () => ({
    loading: false,
    session: null,
    state: 'none',
  }),
}));

const seedHeaderSyncIndicator = getDashboardHeaderSyncIndicator({
  activeModule: 'kolam',
  dataset: seedUnifiedDataset,
});

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

function isMainPageContainerStyle(style: ReturnType<typeof StyleSheet.flatten>) {
  const visual = getDashboardLayoutVisualContract();
  const viewStyle = style as ViewStyle | undefined;

  return (
    viewStyle?.padding === 16 ||
    viewStyle?.maxWidth === visual.page.maxWidthPx ||
    (typeof viewStyle?.paddingHorizontal === 'number' &&
      typeof viewStyle?.paddingTop === 'number' &&
      typeof viewStyle?.paddingBottom === 'number')
  );
}

function getMainContentStyle(renderer: ReactTestRenderer.ReactTestRenderer) {
  const scrollView = renderer.root.findAllByType(ScrollView).find(node =>
    isMainPageContainerStyle(
      StyleSheet.flatten(node.props.contentContainerStyle),
    ),
  );

  if (scrollView) {
    return StyleSheet.flatten(scrollView.props.contentContainerStyle);
  }

  const ownedPageView = renderer.root.findAllByType(View).find(node => {
    const style = StyleSheet.flatten(node.props.style);

    return isMainPageContainerStyle(style);
  });

  if (!ownedPageView) {
    throw new Error('Main content container was not rendered.');
  }

  return StyleSheet.flatten(ownedPageView.props.style);
}

function countMainShellScrollViews(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(ScrollView).filter(node => {
    const style = StyleSheet.flatten(node.props.contentContainerStyle);
    return style?.padding === 16 || typeof style?.maxWidth === 'number';
  }).length;
}

describe('KolamAppShellSurface', () => {
  it('renders shell chrome and scroll content from shared layout boundary', async () => {
    const visual = getDashboardLayoutVisualContract();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAppShellSurface
          sidebar={{
            accessScope: { am: true, kolam: true, pos: true },
            activeModule: 'settings',
            activeRoute: '/pengaturan',
            collapsed: false,
            expandedSections: {},
            filterMenuByAccess: false,
            onMoveMenuSection: () => undefined,
            onQuickSearch: () => undefined,
            onSelectMenuItem: () => undefined,
            onSelectModule: () => undefined,
            onToggleMenuSection: () => undefined,
            sectionOrder: [],
          }}
          topNavigation={{
            attentionCount: 0,
            breadcrumbItems: getTopNavBreadcrumbItems('settings'),
            displayInitials: 'DA',
            profilePhotoUrl: 'https://amfibi.dunia-anura.com/media/avatar.jpg',
            rightControls: getTopNavRightControls(),
            onAvatarPress: () => undefined,
            onBreadcrumbDashboardPress: () => undefined,
            onNotificationPress: () => undefined,
            onToggleSidebar: () => undefined,
          }}
          overlay={{
            isAttentionOpen: false,
            isCommandPaletteOpen: false,
            isUserMenuOpen: false,
            userMenu: {
              items: [],
              displayName: 'Dunia Anura',
              initials: 'DA',
              email: 'seed@kolam.local',
              profilePhotoUrl:
                'https://amfibi.dunia-anura.com/media/avatar.jpg',
              accessScope: { am: true, kolam: true, pos: true },
              onClose: () => undefined,
              onSelect: () => undefined,
            },
            attention: {
              items: [],
              unreadCount: 0,
              onClose: () => undefined,
              onSeeAll: () => undefined,
            },
            commandPalette: {
              commands: [],
              search: '',
              onSearchChange: () => undefined,
              onClose: () => undefined,
              onSelect: () => undefined,
            },
          }}
          dashboardHeader={{
            actions: getDashboardHeaderActions(),
            title: 'Pengaturan',
            subtitle: 'Settings produksi',
            syncIndicator: seedHeaderSyncIndicator,
            onSelectModule: () => undefined,
          }}
        >
          <Text>Workspace child</Text>
        </KolamAppShellSurface>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Pengaturan',
        'CPU 12%',
        'RAM 34%',
        'Disk 56%',
        'Workspace child',
      ]),
    );
    expect(getMainContentStyle(renderer!)).toEqual(
      expect.objectContaining({
        maxWidth: visual.page.maxWidthPx,
        alignSelf: 'center',
      }),
    );
    const avatarImage = renderer!.root.findAllByType(Image).find(node => {
      const source = node.props.source;
      return source?.uri === 'https://amfibi.dunia-anura.com/media/avatar.jpg';
    });

    expect(avatarImage).toBeDefined();
    expect(avatarImage!.props.resizeMode).toBe('cover');
    expect(StyleSheet.flatten(avatarImage!.props.style)).toEqual(
      expect.objectContaining({
        width: 28,
        height: 28,
      }),
    );
    expect(
      StyleSheet.flatten(avatarImage!.props.style)?.transform,
    ).toBeUndefined();
  });

  it('uses the live Beranda page container only for the Kolam dashboard', async () => {
    const visual = getDashboardLayoutVisualContract();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAppShellSurface
          sidebar={{
            accessScope: { am: true, kolam: true, pos: true },
            activeModule: 'kolam',
            collapsed: false,
            expandedSections: {},
            filterMenuByAccess: false,
            onMoveMenuSection: () => undefined,
            onQuickSearch: () => undefined,
            onSelectMenuItem: () => undefined,
            onSelectModule: () => undefined,
            onToggleMenuSection: () => undefined,
            sectionOrder: [],
          }}
          topNavigation={{
            attentionCount: 0,
            breadcrumbItems: getTopNavBreadcrumbItems('kolam'),
            displayInitials: 'DA',
            rightControls: getTopNavRightControls(),
            onAvatarPress: () => undefined,
            onBreadcrumbDashboardPress: () => undefined,
            onNotificationPress: () => undefined,
            onToggleSidebar: () => undefined,
          }}
          overlay={{
            isAttentionOpen: false,
            isCommandPaletteOpen: false,
            isUserMenuOpen: false,
            userMenu: {
              items: [],
              displayName: 'Dunia Anura',
              initials: 'DA',
              email: 'seed@kolam.local',
              accessScope: { am: true, kolam: true, pos: true },
              onClose: () => undefined,
              onSelect: () => undefined,
            },
            attention: {
              items: [],
              unreadCount: 0,
              onClose: () => undefined,
              onSeeAll: () => undefined,
            },
            commandPalette: {
              commands: [],
              search: '',
              onSearchChange: () => undefined,
              onClose: () => undefined,
              onSelect: () => undefined,
            },
          }}
          dashboardHeader={{
            actions: getDashboardHeaderActions(),
            eyebrow: 'Beranda',
            title: 'Selamat pagi',
            subtitle: 'Ringkasan performa toko hari ini.',
            syncIndicator: seedHeaderSyncIndicator,
            onSelectModule: () => undefined,
          }}
        >
          <Text>Beranda child</Text>
        </KolamAppShellSurface>,
      );
    });

    const contentStyle = getMainContentStyle(renderer!);

    expect(contentStyle).toEqual(
      expect.objectContaining({
        maxWidth: visual.page.maxWidthPx,
        alignSelf: 'center',
        paddingHorizontal: visual.page.paddingX,
        paddingTop: visual.page.paddingTop,
        paddingBottom: visual.page.paddingBottom,
      }),
    );
  });

  it('uses the same centered page container for Pengaturan', async () => {
    const visual = getDashboardLayoutVisualContract();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAppShellSurface
          sidebar={{
            accessScope: { am: true, kolam: true, pos: true },
            activeModule: 'settings',
            activeRoute: '/pengaturan',
            collapsed: false,
            expandedSections: {},
            filterMenuByAccess: false,
            onMoveMenuSection: () => undefined,
            onQuickSearch: () => undefined,
            onSelectMenuItem: () => undefined,
            onSelectModule: () => undefined,
            onToggleMenuSection: () => undefined,
            sectionOrder: [],
          }}
          topNavigation={{
            attentionCount: 0,
            breadcrumbItems: getTopNavBreadcrumbItems('settings'),
            displayInitials: 'DA',
            rightControls: getTopNavRightControls(),
            onAvatarPress: () => undefined,
            onBreadcrumbDashboardPress: () => undefined,
            onNotificationPress: () => undefined,
            onToggleSidebar: () => undefined,
          }}
          overlay={{
            isAttentionOpen: false,
            isCommandPaletteOpen: false,
            isUserMenuOpen: false,
            userMenu: {
              items: [],
              displayName: 'Dunia Anura',
              initials: 'DA',
              email: 'seed@kolam.local',
              accessScope: { am: true, kolam: true, pos: true },
              onClose: () => undefined,
              onSelect: () => undefined,
            },
            attention: {
              items: [],
              unreadCount: 0,
              onClose: () => undefined,
              onSeeAll: () => undefined,
            },
            commandPalette: {
              commands: [],
              search: '',
              onSearchChange: () => undefined,
              onClose: () => undefined,
              onSelect: () => undefined,
            },
          }}
          dashboardHeader={{
            actions: getDashboardHeaderActions(),
            title: 'Pengaturan',
            subtitle: 'Settings produksi',
            syncIndicator: seedHeaderSyncIndicator,
            onSelectModule: () => undefined,
          }}
        >
          <Text>Pengaturan child</Text>
        </KolamAppShellSurface>,
      );
    });

    expect(getMainContentStyle(renderer!)).toEqual(
      expect.objectContaining({
        maxWidth: visual.page.maxWidthPx,
        alignSelf: 'center',
      }),
    );
  });

  it('uses the centered app wrapper for AM without local body inset', async () => {
    const visual = getDashboardLayoutVisualContract();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAppShellSurface
          sidebar={{
            accessScope: { am: true, kolam: true, pos: true },
            activeModule: 'am',
            activeRoute: '/',
            collapsed: false,
            expandedSections: {},
            filterMenuByAccess: false,
            onMoveMenuSection: () => undefined,
            onQuickSearch: () => undefined,
            onSelectMenuItem: () => undefined,
            onSelectModule: () => undefined,
            onToggleMenuSection: () => undefined,
            sectionOrder: [],
          }}
          topNavigation={{
            attentionCount: 0,
            breadcrumbItems: getTopNavBreadcrumbItems('am'),
            displayInitials: 'DA',
            rightControls: getTopNavRightControls(),
            onAvatarPress: () => undefined,
            onBreadcrumbDashboardPress: () => undefined,
            onNotificationPress: () => undefined,
            onToggleSidebar: () => undefined,
          }}
          overlay={{
            isAttentionOpen: false,
            isCommandPaletteOpen: false,
            isUserMenuOpen: false,
            userMenu: {
              items: [],
              displayName: 'Dunia Anura',
              initials: 'DA',
              email: 'seed@kolam.local',
              accessScope: { am: true, kolam: true, pos: true },
              onClose: () => undefined,
              onSelect: () => undefined,
            },
            attention: {
              items: [],
              unreadCount: 0,
              onClose: () => undefined,
              onSeeAll: () => undefined,
            },
            commandPalette: {
              commands: [],
              search: '',
              onSearchChange: () => undefined,
              onClose: () => undefined,
              onSelect: () => undefined,
            },
          }}
          dashboardHeader={{
            actions: getDashboardHeaderActions(),
            title: 'Automation Management',
            subtitle: 'AM',
            syncIndicator: seedHeaderSyncIndicator,
            onSelectModule: () => undefined,
          }}
        >
          <Text>AM child</Text>
        </KolamAppShellSurface>,
      );
    });

    const mainContentStyle = getMainContentStyle(renderer!);
    expect(mainContentStyle).toEqual(
      expect.objectContaining({
        maxWidth: visual.page.maxWidthPx,
        alignSelf: 'center',
        paddingHorizontal: visual.page.paddingX,
        paddingTop: visual.page.paddingTop,
        paddingBottom: visual.page.paddingBottom,
      }),
    );
    expect(countMainShellScrollViews(renderer!)).toBe(1);
  });

  it('keeps AM route paths inside the centered app wrapper', async () => {
    const visual = getDashboardLayoutVisualContract();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAppShellSurface
          sidebar={{
            accessScope: { am: true, kolam: true, pos: true },
            activeModule: 'settings',
            activeRoute: '/am/mutasi',
            collapsed: false,
            expandedSections: {},
            filterMenuByAccess: false,
            onMoveMenuSection: () => undefined,
            onQuickSearch: () => undefined,
            onSelectMenuItem: () => undefined,
            onSelectModule: () => undefined,
            onToggleMenuSection: () => undefined,
            sectionOrder: [],
          }}
          topNavigation={{
            attentionCount: 0,
            breadcrumbItems: getTopNavBreadcrumbItems('am'),
            displayInitials: 'DA',
            rightControls: getTopNavRightControls(),
            onAvatarPress: () => undefined,
            onBreadcrumbDashboardPress: () => undefined,
            onNotificationPress: () => undefined,
            onToggleSidebar: () => undefined,
          }}
          overlay={{
            isAttentionOpen: false,
            isCommandPaletteOpen: false,
            isUserMenuOpen: false,
            userMenu: {
              items: [],
              displayName: 'Dunia Anura',
              initials: 'DA',
              email: 'seed@kolam.local',
              accessScope: { am: true, kolam: true, pos: true },
              onClose: () => undefined,
              onSelect: () => undefined,
            },
            attention: {
              items: [],
              unreadCount: 0,
              onClose: () => undefined,
              onSeeAll: () => undefined,
            },
            commandPalette: {
              commands: [],
              search: '',
              onSearchChange: () => undefined,
              onClose: () => undefined,
              onSelect: () => undefined,
            },
          }}
          dashboardHeader={{
            actions: getDashboardHeaderActions(),
            title: 'AM',
            subtitle: 'AM',
            syncIndicator: seedHeaderSyncIndicator,
            onSelectModule: () => undefined,
          }}
        >
          <Text>AM route child</Text>
        </KolamAppShellSurface>,
      );
    });

    expect(getMainContentStyle(renderer!)).toEqual(
      expect.objectContaining({
        maxWidth: visual.page.maxWidthPx,
        alignSelf: 'center',
        paddingHorizontal: visual.page.paddingX,
      }),
    );
  });

  it('remounts shell ScrollView when right rail toggles', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    const renderShell = (rightRail?: React.ReactNode) => (
      <KolamAppShellSurface
        sidebar={{
          accessScope: { am: true, kolam: true, pos: true },
          activeModule: 'settings',
          activeRoute: '/products',
          collapsed: false,
          expandedSections: {},
          filterMenuByAccess: false,
          onMoveMenuSection: () => undefined,
          onQuickSearch: () => undefined,
          onSelectMenuItem: () => undefined,
          onSelectModule: () => undefined,
          onToggleMenuSection: () => undefined,
          sectionOrder: [],
        }}
        topNavigation={{
          attentionCount: 0,
          breadcrumbItems: getTopNavBreadcrumbItems('settings'),
          displayInitials: 'DA',
          rightControls: getTopNavRightControls(),
          onAvatarPress: () => undefined,
          onBreadcrumbDashboardPress: () => undefined,
          onNotificationPress: () => undefined,
          onToggleSidebar: () => undefined,
        }}
        overlay={{
          isAttentionOpen: false,
          isCommandPaletteOpen: false,
          isUserMenuOpen: false,
          userMenu: {
            items: [],
            displayName: 'Dunia Anura',
            initials: 'DA',
            email: 'seed@kolam.local',
            accessScope: { am: true, kolam: true, pos: true },
            onClose: () => undefined,
            onSelect: () => undefined,
          },
          attention: {
            items: [],
            unreadCount: 0,
            onClose: () => undefined,
            onSeeAll: () => undefined,
          },
          commandPalette: {
            commands: [],
            search: '',
            onSearchChange: () => undefined,
            onClose: () => undefined,
            onSelect: () => undefined,
          },
        }}
        dashboardHeader={{
          actions: getDashboardHeaderActions(),
          title: 'Produk',
          subtitle: 'Daftar',
          syncIndicator: seedHeaderSyncIndicator,
          onSelectModule: () => undefined,
        }}
        rightRail={rightRail}
      >
        <Text>Workspace child</Text>
      </KolamAppShellSurface>
    );

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(renderShell());
    });

    const closedScroll = renderer!.root.findAllByType(ScrollView).find(node => {
      const style = StyleSheet.flatten(node.props.contentContainerStyle);
      return style?.padding === 16 || typeof style?.maxWidth === 'number';
    });

    expect(closedScroll).toBeDefined();

    await ReactTestRenderer.act(async () => {
      renderer!.update(renderShell(<Text>Rail child</Text>));
    });

    const openScroll = renderer!.root.findAllByType(ScrollView).find(node => {
      const style = StyleSheet.flatten(node.props.contentContainerStyle);
      return style?.padding === 16 || typeof style?.maxWidth === 'number';
    });

    expect(openScroll).toBeDefined();
    expect(openScroll).not.toBe(closedScroll);
  });

  it('clears leftover overflow overlay when the workspace route changes', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    const renderShell = (activeRoute: string) => (
      <KolamAppShellSurface
        sidebar={{
          accessScope: {am: true, kolam: true, pos: true},
          activeModule: 'settings',
          activeRoute,
          collapsed: false,
          expandedSections: {},
          filterMenuByAccess: false,
          onMoveMenuSection: () => undefined,
          onQuickSearch: () => undefined,
          onSelectMenuItem: () => undefined,
          onSelectModule: () => undefined,
          onToggleMenuSection: () => undefined,
          sectionOrder: [],
        }}
        topNavigation={{
          attentionCount: 0,
          breadcrumbItems: getTopNavBreadcrumbItems('settings'),
          displayInitials: 'DA',
          rightControls: getTopNavRightControls(),
          onAvatarPress: () => undefined,
          onBreadcrumbDashboardPress: () => undefined,
          onNotificationPress: () => undefined,
          onToggleSidebar: () => undefined,
        }}
        overlay={{
          isAttentionOpen: false,
          isCommandPaletteOpen: false,
          isUserMenuOpen: false,
          userMenu: {
            items: [],
            displayName: 'Dunia Anura',
            initials: 'DA',
            email: 'seed@kolam.local',
            accessScope: {am: true, kolam: true, pos: true},
            onClose: () => undefined,
            onSelect: () => undefined,
          },
          attention: {
            items: [],
            unreadCount: 0,
            onClose: () => undefined,
            onSeeAll: () => undefined,
          },
          commandPalette: {
            commands: [],
            search: '',
            onSearchChange: () => undefined,
            onClose: () => undefined,
            onSelect: () => undefined,
          },
        }}
        dashboardHeader={{
          actions: getDashboardHeaderActions(),
          title: 'Produk',
          subtitle: 'Daftar',
          syncIndicator: seedHeaderSyncIndicator,
          onSelectModule: () => undefined,
        }}
      >
        <Text>Workspace child</Text>
      </KolamAppShellSurface>
    );

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(renderShell('/products'));
    });

    await ReactTestRenderer.act(async () => {
      showKolamOverflowMenuOverlay({
        anchorHeight: 24,
        anchorTop: 80,
        content: <Text>Menu nyangkut</Text>,
        estimatedHeight: 80,
        id: 'stuck-menu',
        left: 24,
        top: 80,
        width: 180,
      });
    });

    expect(
      renderer!.root.findAllByProps({
        accessibilityLabel: 'Tutup menu aksi',
      }).length,
    ).toBeGreaterThan(0);

    await ReactTestRenderer.act(async () => {
      renderer!.update(renderShell('/species'));
    });

    expect(
      renderer!.root.findAllByProps({
        accessibilityLabel: 'Tutup menu aksi',
      }),
    ).toHaveLength(0);
  });

  it.each([
    ['/species', 'Species'],
    ['/products', 'Produk'],
    ['/products/archive', 'Arsip Produk'],
    ['/stock-transaction', 'Transaksi Stok'],
    ['/customers', 'Pelanggan'],
    ['/list-of-users', 'Pengguna'],
    ['/payable', 'Hutang'],
    ['/receivable', 'Piutang'],
    ['/commissions', 'Komisi'],
    ['/finance/payroll', 'Payroll'],
    ['/finance/bonus', 'Bonus'],
    ['/media', 'Media'],
  ])('keeps mapped-table route %s on shell ScrollView', async (route, title) => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAppShellSurface
          sidebar={{
            accessScope: { am: true, kolam: true, pos: true },
            activeModule: 'settings',
            activeRoute: route,
            collapsed: false,
            expandedSections: {},
            filterMenuByAccess: false,
            onMoveMenuSection: () => undefined,
            onQuickSearch: () => undefined,
            onSelectMenuItem: () => undefined,
            onSelectModule: () => undefined,
            onToggleMenuSection: () => undefined,
            sectionOrder: [],
          }}
          topNavigation={{
            attentionCount: 0,
            breadcrumbItems: getTopNavBreadcrumbItems('settings'),
            displayInitials: 'DA',
            rightControls: getTopNavRightControls(),
            onAvatarPress: () => undefined,
            onBreadcrumbDashboardPress: () => undefined,
            onNotificationPress: () => undefined,
            onToggleSidebar: () => undefined,
          }}
          overlay={{
            isAttentionOpen: false,
            isCommandPaletteOpen: false,
            isUserMenuOpen: false,
            userMenu: {
              items: [],
              displayName: 'Dunia Anura',
              initials: 'DA',
              email: 'seed@kolam.local',
              accessScope: { am: true, kolam: true, pos: true },
              onClose: () => undefined,
              onSelect: () => undefined,
            },
            attention: {
              items: [],
              unreadCount: 0,
              onClose: () => undefined,
              onSeeAll: () => undefined,
            },
            commandPalette: {
              commands: [],
              search: '',
              onSearchChange: () => undefined,
              onClose: () => undefined,
              onSelect: () => undefined,
            },
          }}
          dashboardHeader={{
            actions: getDashboardHeaderActions(),
            title,
            subtitle: 'Daftar',
            syncIndicator: seedHeaderSyncIndicator,
            onSelectModule: () => undefined,
          }}
        >
          <Text>{`${title} list child`}</Text>
        </KolamAppShellSurface>,
      );
    });

    expect(countMainShellScrollViews(renderer!)).toBe(1);
    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([`${title} list child`, title]),
    );
  });
});
