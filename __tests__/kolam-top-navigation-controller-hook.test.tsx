import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type {AppModule} from '../src/domain/app-shell';
import type {AttentionPanelItem} from '../src/domain/attention-panel';
import type {AccessScope} from '../src/domain/auth';
import type {SettingsTabItem} from '../src/domain/settings-surface';
import {settingsTabItems} from '../src/domain/settings-surface';
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
  activeSettingsTab,
  accessScope = {kolam: true},
  attentionItems,
  onRender,
}: {
  activeModule: AppModule;
  activeSettingsTab?: SettingsTabItem | null;
  accessScope?: Pick<AccessScope, 'kolam'>;
  attentionItems: AttentionPanelItem[];
  onRender: (controller: TopNavigationController) => void;
}) {
  const controller = useKolamTopNavigationController({
    activeModule,
    activeSettingsTab,
    accessScope,
    attentionItems,
    displayInitials: 'DA',
    onAvatarPress: () => undefined,
    onBreadcrumbDashboardPress: () => undefined,
    onNotificationPress: () => undefined,
    onToggleSidebar: () => undefined,
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
    expect(controller.topNavigation.rightControls.map(control => control.id)).toEqual([
      'cashflow',
      'chat-inbox',
      'chat-team',
      'media',
      'task-manager',
      'notifications',
      'avatar',
    ]);
  });

  it('hides media when Kolam access is unavailable', async () => {
    let latest: TopNavigationController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <TopNavigationHarness
          accessScope={{kolam: false}}
          activeModule="kolam"
          attentionItems={[]}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    expect(
      requireController(latest).topNavigation.rightControls.map(
        control => control.id,
      ),
    ).toEqual([
      'cashflow',
      'chat-inbox',
      'chat-team',
      'task-manager',
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

  it('uses the active Settings tab for Pengaturan breadcrumbs', async () => {
    let latest: TopNavigationController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <TopNavigationHarness
          activeModule="settings"
          activeSettingsTab={
            settingsTabItems.find(item => item.id === 'plugin') ?? null
          }
          attentionItems={[]}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const controller = requireController(latest);

    expect(controller.topNavigation.breadcrumbItems.map(item => item.label)).toEqual([
      'Dashboard',
      'Pengaturan',
      'Plugin',
    ]);
  });
});
