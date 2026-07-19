import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type { AppModule } from '../src/domain/app-shell';
import type { CommandEntry } from '../src/domain/command-index';
import type { KolamNavigationItem } from '../src/domain/kolam-navigation';
import type { TopNavUserMenuItem } from '../src/domain/top-nav';
import { getPluginRouteIndex, pluginRegistry } from '../src/domain/unified';
import { useKolamShellChromeController } from '../src/hooks/use-kolam-shell-chrome-controller';
import { seedUnifiedDataset } from '../src/services/unified-data';

type ShellChromeController = ReturnType<typeof useKolamShellChromeController>;

const accessScope = { am: false, kolam: true, pos: true };
const command: CommandEntry = {
  area: 'pos',
  description: 'Buka checkout',
  id: 'module:checkout',
  kind: 'module',
  label: 'Checkout',
  moduleId: 'checkout',
  source: 'test',
};

function requireController(controller: ShellChromeController | null) {
  if (!controller) {
    throw new Error('Shell chrome controller did not render.');
  }

  return controller;
}

function ShellChromeHarness({
  activePluginRoute,
  onRender,
  onRouteContext,
  roleKey = 'super_admin',
}: {
  activePluginRoute?: ReturnType<typeof getPluginRouteIndex>[number] | null;
  onRender: (controller: ShellChromeController) => void;
  onRouteContext?: (route: string) => void;
  roleKey?: string;
}) {
  const controller = useKolamShellChromeController({
    accessScope,
    activeModule: 'kolam',
    activePluginRoute,
    activeSession: seedUnifiedDataset.activeSession,
    attentionItems: [],
    collapsed: false,
    commandSearch: '',
    dataset: seedUnifiedDataset,
    commands: [command],
    displayName: 'Kasir Kolam',
    email: 'kasir@example.test',
    expandedSections: { inventory: true },
    filterMenuByAccess: true,
    isAttentionOpen: false,
    isCommandPaletteOpen: true,
    isUserMenuOpen: false,
    onAttentionClose: () => undefined,
    onAvatarPress: () => undefined,
    onBreadcrumbDashboardPress: () => undefined,
    onCommandPaletteClose: () => undefined,
    onCommandSearchChange: () => undefined,
    onCommandSelect: async () => undefined,
    onMessage: () => undefined,
    onMoveMenuSection: () => undefined,
    onNotificationPress: () => undefined,
    onQuickSearch: () => undefined,
    onRouteContext,
    onSeeAllNotifications: () => undefined,
    onSelectMenuItem: (_item: KolamNavigationItem) => undefined,
    onSelectModule: (_module: AppModule) => undefined,
    onSignOut: async () => undefined,
    onToggleMenuSection: () => undefined,
    onToggleSidebar: () => undefined,
    onUserMenuClose: () => undefined,
    onUserMenuSelect: async (
      _item: TopNavUserMenuItem,
      _onSignOut: () => Promise<void>,
    ) => undefined,
    roleKey,
    sectionOrder: ['inventory'],
  });

  onRender(controller);
  return null;
}

describe('Kolam shell chrome controller hook', () => {
  it('composes dashboard header top navigation overlay and sidebar props', async () => {
    let latest: ShellChromeController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <ShellChromeHarness
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const controller = requireController(latest);
    expect(controller.dashboardHeader.title).toContain('Kasir Kolam');
    expect(controller.dashboardHeader.sessionOpen).toBe(true);
    expect(controller.topNavigation.attentionCount).toBe(0);
    expect(controller.overlay.commandPalette.commands).toEqual([command]);
    expect(controller.overlay.userMenu.email).toBe('kasir@example.test');
    expect(controller.sidebar.expandedSections).toEqual({ inventory: true });
  });

  it('derives user menu entries from the signed-in role key', async () => {
    let latest: ShellChromeController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <ShellChromeHarness
          onRender={controller => {
            latest = controller;
          }}
          roleKey="pos"
        />,
      );
    });

    expect(
      requireController(latest).overlay.userMenu.items.some(
        item => item.id === 'web-settings',
      ),
    ).toBe(false);
  });

  it('passes dashboard header route context through shell chrome', async () => {
    const routeContexts: string[] = [];
    let latest: ShellChromeController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <ShellChromeHarness
          onRender={controller => {
            latest = controller;
          }}
          onRouteContext={route => {
            routeContexts.push(route);
          }}
        />,
      );
    });

    const controller = requireController(latest);

    await ReactTestRenderer.act(async () => {
      controller.dashboardHeader.onSelectModule(
        controller.dashboardHeader.actions[0],
      );
    });

    expect(routeContexts).toEqual(['/products/create']);
  });

  it('passes active plugin route context into the composed page header', async () => {
    const teamChatRoute = getPluginRouteIndex(pluginRegistry).find(
      route => route.route === '/team-chat',
    );
    let latest: ShellChromeController | null = null;

    if (!teamChatRoute) {
      throw new Error('Team Chat route is missing.');
    }

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <ShellChromeHarness
          activePluginRoute={teamChatRoute}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    expect(requireController(latest).dashboardHeader).toEqual(
      expect.objectContaining({
        eyebrow: 'Plugin Route',
        title: 'Chat /team-chat',
      }),
    );
  });
});
