import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type {AppModule} from '../src/domain/app-shell';
import type {AttentionPanelItem} from '../src/domain/attention-panel';
import {useKolamTopNavigationController} from '../src/hooks/use-kolam-top-navigation-controller';

type TopNavigationController = ReturnType<
  typeof useKolamTopNavigationController
>;

function requireController(controller: TopNavigationController | null) {
  if (!controller) {
    throw new Error('Top navigation controller did not render.');
  }

  return controller;
}

function TopNavigationHarness({
  activeModule,
  attentionItems,
  onRender,
}: {
  activeModule: AppModule;
  attentionItems: AttentionPanelItem[];
  onRender: (controller: TopNavigationController) => void;
}) {
  const controller = useKolamTopNavigationController({
    activeModule,
    attentionItems,
    displayInitials: 'DA',
    onAvatarPress: () => undefined,
    onBreadcrumbDashboardPress: () => undefined,
    onNotificationPress: () => undefined,
    onToggleSidebar: () => undefined,
    serverMetrics: {
      snapshot: {
        checkedAt: '2026-07-19T00:00:00.000Z',
        cpuPercent: 12,
        memoryPercent: 34,
        diskPercent: 56,
      },
    },
  });

  onRender(controller);
  return null;
}

describe('Kolam top navigation controller hook', () => {
  it('builds Beranda breadcrumb and ignores the all-clear attention item', async () => {
    let latest: TopNavigationController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <TopNavigationHarness
          activeModule="kolam"
          attentionItems={[
            {
              id: 'all-clear',
              label: 'All clear',
              message: 'Ready',
              meta: 'Runtime',
              tone: 'success',
              isUnread: false,
            },
          ]}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const controller = requireController(latest);

    expect(controller.attentionCount).toBe(0);
    expect(controller.topNavigation.breadcrumbItems).toEqual([
      {id: 'dashboard', label: 'Dashboard', routeHint: '/', current: true},
    ]);
    expect(controller.topNavigation.displayInitials).toBe('DA');
    expect(controller.topNavigation.serverMetrics?.snapshot?.cpuPercent).toBe(12);
    expect(controller.topNavigation.rightControls.map(control => control.id)).toEqual([
      'notifications',
      'avatar',
    ]);
  });

  it('builds module breadcrumb and unread count outside Beranda', async () => {
    let latest: TopNavigationController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <TopNavigationHarness
          activeModule="plugins"
          attentionItems={[
            {
              id: 'sync-kolam',
              label: 'KOLAM sync',
              message: 'fallback',
              meta: 'Unified sync',
              tone: 'warning',
              isUnread: true,
            },
          ]}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const controller = requireController(latest);

    expect(controller.attentionCount).toBe(1);
    expect(controller.topNavigation.breadcrumbItems.map(item => item.label)).toEqual([
      'Dashboard',
      'Plugin',
    ]);
  });
});
