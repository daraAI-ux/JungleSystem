import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamAppShellSurface} from '../src/components/kolam-app-shell-surface';
import {
  getDashboardHeaderActions,
  getDashboardHeaderSyncIndicator,
} from '../src/domain/dashboard-header';
import {getTopNavBreadcrumbItems, getTopNavRightControls} from '../src/domain/top-nav';
import {seedUnifiedDataset} from '../src/services/unified-data';

jest.mock('../src/hooks/use-kolam-server-metrics-controller', () => ({
  useKolamServerMetricsController: () => ({
    loading: false,
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

describe('shell vs workspace memo boundaries', () => {
  it('exports a memoized app shell surface', () => {
    expect(
      (KolamAppShellSurface as unknown as {$$typeof: symbol}).$$typeof,
    ).toBe(Symbol.for('react.memo'));
  });

  it('keeps shell output stable when chrome props and children refs are unchanged', async () => {
    const seedHeaderSyncIndicator = getDashboardHeaderSyncIndicator({
      activeModule: 'kolam',
      dataset: seedUnifiedDataset,
    });

    const sidebar = {
      accessScope: {am: true, kolam: true, pos: true},
      activeModule: 'checkout' as const,
      collapsed: false,
      expandedSections: {},
      filterMenuByAccess: false,
      onMoveMenuSection: () => undefined,
      onQuickSearch: () => undefined,
      onSelectMenuItem: () => undefined,
      onSelectModule: () => undefined,
      onToggleMenuSection: () => undefined,
      sectionOrder: [] as string[],
    };
    const topNavigation = {
      attentionCount: 0,
      breadcrumbItems: getTopNavBreadcrumbItems('checkout'),
      displayInitials: 'DA',
      rightControls: getTopNavRightControls(),
      onAvatarPress: () => undefined,
      onBreadcrumbDashboardPress: () => undefined,
      onNotificationPress: () => undefined,
      onToggleSidebar: () => undefined,
    };
    const dashboardHeader = {
      actions: getDashboardHeaderActions(),
      title: 'Checkout',
      subtitle: 'test',
      syncIndicator: seedHeaderSyncIndicator,
      onSelectModule: () => undefined,
    };
    const overlay = {
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
        onClose: () => undefined,
        onSearchChange: () => undefined,
        onSelect: async () => undefined,
      },
    };
    const children = <Text>stable-workspace</Text>;

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAppShellSurface
          sidebar={sidebar}
          topNavigation={topNavigation}
          overlay={overlay}
          dashboardHeader={dashboardHeader}
        >
          {children}
        </KolamAppShellSurface>,
      );
    });

    const firstJson = renderer!.toJSON();

    await ReactTestRenderer.act(async () => {
      renderer!.update(
        <KolamAppShellSurface
          sidebar={sidebar}
          topNavigation={topNavigation}
          overlay={overlay}
          dashboardHeader={dashboardHeader}
        >
          {children}
        </KolamAppShellSurface>,
      );
    });

    expect(renderer!.toJSON()).toEqual(firstJson);
  });
});
