import React from 'react';
import { Image, ScrollView, StyleSheet, Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamAppShellSurface } from '../src/components/kolam-app-shell-surface';
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

function getMainContentStyle(renderer: ReactTestRenderer.ReactTestRenderer) {
  const scrollView = renderer.root.findAllByType(ScrollView).find(node => {
    const style = StyleSheet.flatten(node.props.contentContainerStyle);

    return style?.padding === 16 || typeof style?.maxWidth === 'number';
  });

  if (!scrollView) {
    throw new Error('Main content ScrollView was not rendered.');
  }

  return StyleSheet.flatten(scrollView.props.contentContainerStyle);
}

describe('KolamAppShellSurface', () => {
  it('renders shell chrome and scroll content from shared layout boundary', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAppShellSurface
          sidebar={{
            accessScope: { am: true, kolam: true, pos: true },
            activeModule: 'checkout',
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
            breadcrumbItems: getTopNavBreadcrumbItems('checkout'),
            displayInitials: 'DA',
            profilePhotoUrl: 'https://amfibi.dunia-anura.com/media/avatar.jpg',
            rightControls: getTopNavRightControls(),
            serverMetrics: {
              snapshot: {
                checkedAt: '2026-07-19T00:00:00.000Z',
                cpuPercent: 12,
                memoryPercent: 34,
                diskPercent: 56,
              },
            },
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
            title: 'Checkout',
            subtitle: 'Native POS workspace',
            sessionOpen: false,
            showSessionPill: true,
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
        'Kolam',
        'POS',
        'Dashboard',
        'Checkout',
        'CPU 12%',
        'RAM 34%',
        'Disk 56%',
        'Workspace child',
      ]),
    );
    expect(getMainContentStyle(renderer!).maxWidth).toBeUndefined();
    const avatarImage = renderer!.root.findAllByType(Image).find(node => {
      const source = node.props.source;
      return source?.uri === 'https://amfibi.dunia-anura.com/media/avatar.jpg';
    });

    expect(avatarImage).toBeDefined();
    expect(avatarImage!.props.resizeMode).toBe('cover');
    expect(StyleSheet.flatten(avatarImage!.props.style)).toEqual(
      expect.objectContaining({
        width: 32,
        height: 32,
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
            serverMetrics: {
              snapshot: {
                checkedAt: '2026-07-19T00:00:00.000Z',
                cpuPercent: 12,
                memoryPercent: 34,
                diskPercent: 56,
              },
            },
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
            sessionOpen: false,
            showSessionPill: false,
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
});
