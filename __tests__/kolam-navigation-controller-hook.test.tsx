import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { getShellModuleRouteEntry } from '../src/domain/app-shell';
import { getCommandIndex } from '../src/domain/command-index';
import { kolamNavigationSections } from '../src/domain/kolam-navigation';
import { getTopNavUserMenuItems } from '../src/domain/top-nav';
import {
  amSurfaces,
  getPluginRouteIndex,
  kolamSurfaces,
  pluginRegistry,
} from '../src/domain/unified';
import { useKolamNavigationController } from '../src/hooks/use-kolam-navigation-controller';

type NavigationController = ReturnType<typeof useKolamNavigationController>;

function requireNavigationController(controller: NavigationController | null) {
  if (!controller) {
    throw new Error('Navigation controller did not render.');
  }

  return controller;
}

function NavigationHarness({
  messages,
  onRender,
}: {
  messages: string[];
  onRender: (controller: NavigationController) => void;
}) {
  const controller = useKolamNavigationController({
    onMessage: message => messages.push(message),
  });

  onRender(controller);
  return null;
}

describe('Kolam navigation controller hook', () => {
  it('opens quick search and handles module commands', async () => {
    const messages: string[] = [];
    let latest: NavigationController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <NavigationHarness
          messages={messages}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      requireNavigationController(latest).openQuickSearch();
    });

    expect(requireNavigationController(latest).isCommandPaletteOpen).toBe(true);
    expect(messages).toContain('Quick Search membuka CommandPalette native.');

    const checkoutCommand = getCommandIndex().find(
      command => command.kind === 'module' && command.moduleId === 'checkout',
    );

    expect(checkoutCommand).toBeDefined();

    await ReactTestRenderer.act(async () => {
      await requireNavigationController(latest).handleCommand(
        checkoutCommand!,
        async () => undefined,
      );
    });

    expect(requireNavigationController(latest).activeModule).toBe('checkout');
    expect(messages).toContain(
      `${checkoutCommand!.label} dibuka dari command index.`,
    );
  });

  it('handles user menu command entry without touching runtime actions', async () => {
    const messages: string[] = [];
    let latest: NavigationController | null = null;
    let didSignOut = false;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <NavigationHarness
          messages={messages}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const commandMenuItem = getTopNavUserMenuItems('admin').find(
      item => item.id === 'command-menu',
    );

    expect(commandMenuItem).toBeDefined();

    await ReactTestRenderer.act(async () => {
      await requireNavigationController(latest).handleUserMenuAction(
        commandMenuItem!,
        async () => {
          didSignOut = true;
        },
      );
    });

    expect(didSignOut).toBe(false);
    expect(requireNavigationController(latest).isCommandPaletteOpen).toBe(true);
    expect(messages).toContain('Command Menu native siap dari user menu.');
  });

  it('keeps selected Kolam route context for broad native route surfaces', async () => {
    const messages: string[] = [];
    let latest: NavigationController | null = null;
    const brandsItem = kolamNavigationSections
      .flatMap(section => section.items)
      .find(item => item.route === '/brands');

    if (!brandsItem) {
      throw new Error('Brands route is missing from Kolam navigation.');
    }

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <NavigationHarness
          messages={messages}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      requireNavigationController(latest).handleKolamNavigationItem(brandsItem);
    });

    expect(requireNavigationController(latest).activeModule).toBe('kolam');
    expect(requireNavigationController(latest).activeNavigationItem).toEqual(
      expect.objectContaining({
        label: 'Brands',
        route: '/brands',
      }),
    );
    expect(messages.at(-1)).toContain('/brands');
  });

  it('keeps selected live route variants from command palette', async () => {
    const messages: string[] = [];
    let latest: NavigationController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <NavigationHarness
          messages={messages}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const productCreateCommand = getCommandIndex().find(
      command =>
        command.kind === 'navigation-route' &&
        command.route === '/products/create',
    );

    expect(productCreateCommand).toBeDefined();

    await ReactTestRenderer.act(async () => {
      await requireNavigationController(latest).handleCommand(
        productCreateCommand!,
        async () => undefined,
      );
    });

    expect(requireNavigationController(latest).activeModule).toBe('catalog');
    expect(requireNavigationController(latest).activeNavigationItem).toEqual(
      expect.objectContaining({
        label: 'Products Create',
        route: '/products/create',
      }),
    );
    expect(messages.at(-1)).toContain('/products/create');
  });

  it('keeps manual brand detail routes in Kolam instead of falling back to dashboard', async () => {
    const messages: string[] = [];
    let latest: NavigationController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <NavigationHarness
          messages={messages}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      requireNavigationController(latest).handleDashboardRouteContext(
        '/label-dan-field/merek/Dunia%20Anura/edit',
      );
    });

    expect(requireNavigationController(latest).activeModule).toBe('kolam');
    expect(requireNavigationController(latest).activeNavigationItem).toEqual(
      expect.objectContaining({
        label: 'Dunia Anura',
        route: '/label-dan-field/merek/Dunia%20Anura/edit',
      }),
    );
  });

  it('keeps selected POS module route context from command palette', async () => {
    const messages: string[] = [];
    let latest: NavigationController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <NavigationHarness
          messages={messages}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const saleDraftCommand = getCommandIndex().find(
      command =>
        command.kind === 'module-route' && command.route === 'sale-draft',
    );

    expect(saleDraftCommand).toBeDefined();

    await ReactTestRenderer.act(async () => {
      await requireNavigationController(latest).handleCommand(
        saleDraftCommand!,
        async () => undefined,
      );
    });

    expect(requireNavigationController(latest).activeModule).toBe('checkout');
    expect(requireNavigationController(latest).activeModuleRoute).toEqual(
      expect.objectContaining({
        moduleId: 'checkout',
        route: 'sale-draft',
      }),
    );
    expect(requireNavigationController(latest).activeNavigationItem).toBeNull();
    expect(requireNavigationController(latest).activePluginRoute).toBeNull();
    expect(requireNavigationController(latest).activeAmSurface).toBeNull();
    expect(messages.at(-1)).toContain('sale-draft');
  });

  it('keeps selected POS module route context from Module Route Launcher', async () => {
    const messages: string[] = [];
    let latest: NavigationController | null = null;
    const saleDraftRoute = getShellModuleRouteEntry('checkout', 'sale-draft');

    if (!saleDraftRoute) {
      throw new Error('POS sale-draft route is missing.');
    }

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <NavigationHarness
          messages={messages}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      requireNavigationController(latest).handleModuleRouteSelect(
        saleDraftRoute,
      );
    });

    expect(requireNavigationController(latest).activeModule).toBe('checkout');
    expect(requireNavigationController(latest).activeModuleRoute).toEqual(
      expect.objectContaining({
        moduleId: 'checkout',
        route: 'sale-draft',
      }),
    );
    expect(requireNavigationController(latest).activeNavigationItem).toBeNull();
    expect(requireNavigationController(latest).activePluginRoute).toBeNull();
    expect(requireNavigationController(latest).commandSearch).toBe(
      'sale-draft',
    );
    expect(messages.at(-1)).toContain('Module Route Launcher');
  });

  it('keeps selected Kolam surface context from command palette', async () => {
    const messages: string[] = [];
    let latest: NavigationController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <NavigationHarness
          messages={messages}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const financeCommand = getCommandIndex().find(
      command =>
        command.kind === 'kolam-surface' &&
        command.kolamSurfaceId === 'finance',
    );

    expect(financeCommand).toBeDefined();

    await ReactTestRenderer.act(async () => {
      await requireNavigationController(latest).handleCommand(
        financeCommand!,
        async () => undefined,
      );
    });

    expect(requireNavigationController(latest).activeModule).toBe('kolam');
    expect(requireNavigationController(latest).activeKolamSurface).toEqual(
      expect.objectContaining({
        id: 'finance',
        label: 'Finance',
      }),
    );
    expect(requireNavigationController(latest).activeNavigationItem).toBeNull();
    expect(requireNavigationController(latest).activePluginRoute).toBeNull();
    expect(requireNavigationController(latest).activeAmSurface).toBeNull();
    expect(messages.at(-1)).toContain('finance / wallet');
  });

  it('keeps selected Kolam surface context from Kolam Surface Launcher', async () => {
    const messages: string[] = [];
    let latest: NavigationController | null = null;
    const financeSurface = kolamSurfaces.find(
      surface => surface.id === 'finance',
    );

    if (!financeSurface) {
      throw new Error('Kolam Finance surface is missing.');
    }

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <NavigationHarness
          messages={messages}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      requireNavigationController(latest).handleKolamSurfaceSelect(
        financeSurface,
      );
    });

    expect(requireNavigationController(latest).activeModule).toBe('kolam');
    expect(requireNavigationController(latest).activeKolamSurface).toEqual(
      expect.objectContaining({
        id: 'finance',
        label: 'Finance',
      }),
    );
    expect(requireNavigationController(latest).activeAmSurface).toBeNull();
    expect(requireNavigationController(latest).activePluginRoute).toBeNull();
    expect(requireNavigationController(latest).commandSearch).toBe(
      financeSurface.route,
    );
    expect(messages.at(-1)).toContain('Kolam Surface Launcher');
  });

  it('keeps dashboard route context for native route surfaces', async () => {
    const messages: string[] = [];
    let latest: NavigationController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <NavigationHarness
          messages={messages}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      requireNavigationController(latest).handleDashboardRouteContext(
        '/products/product-live-low',
      );
    });

    expect(requireNavigationController(latest).activeNavigationItem).toEqual(
      expect.objectContaining({
        label: 'Products Detail',
        route: '/products/product-live-low',
      }),
    );

    await ReactTestRenderer.act(async () => {
      requireNavigationController(latest).handleDashboardRouteContext(
        '/inventory',
      );
    });

    expect(requireNavigationController(latest).activeNavigationItem).toEqual(
      expect.objectContaining({
        label: 'Inventory',
        route: '/inventory',
      }),
    );
  });

  it('keeps selected plugin route context from command palette', async () => {
    const messages: string[] = [];
    let latest: NavigationController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <NavigationHarness
          messages={messages}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const teamChatCommand = getCommandIndex().find(
      command =>
        command.kind === 'plugin-route' && command.route === '/team-chat',
    );

    expect(teamChatCommand).toBeDefined();

    await ReactTestRenderer.act(async () => {
      await requireNavigationController(latest).handleCommand(
        teamChatCommand!,
        async () => undefined,
      );
    });

    expect(requireNavigationController(latest).activeModule).toBe('plugins');
    expect(requireNavigationController(latest).activePluginRoute).toEqual(
      expect.objectContaining({
        pluginId: 'chat',
        route: '/team-chat',
      }),
    );
    expect(requireNavigationController(latest).pluginSearch).toBe('/team-chat');
    expect(messages.at(-1)).toContain('/team-chat');
  });

  it('keeps selected plugin route context from Plugin Hub launcher', async () => {
    const messages: string[] = [];
    let latest: NavigationController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <NavigationHarness
          messages={messages}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const route = getPluginRouteIndex(pluginRegistry).find(
      item => item.pluginId === 'chat' && item.route === '/team-chat',
    );

    if (!route) {
      throw new Error('Team Chat route missing from plugin registry.');
    }

    await ReactTestRenderer.act(async () => {
      requireNavigationController(latest).handlePluginRouteSelect(route);
    });

    expect(requireNavigationController(latest).activeModule).toBe('plugins');
    expect(requireNavigationController(latest).activePluginRoute).toEqual(
      expect.objectContaining({
        pluginId: 'chat',
        route: '/team-chat',
      }),
    );
    expect(requireNavigationController(latest).pluginSearch).toBe('/team-chat');
    expect(messages.at(-1)).toContain('Plugin Hub');
  });

  it('keeps selected AM route context from command palette', async () => {
    const messages: string[] = [];
    let latest: NavigationController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <NavigationHarness
          messages={messages}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const taskCommand = getCommandIndex().find(
      command => command.kind === 'am-route' && command.amSurfaceId === 'tasks',
    );

    expect(taskCommand).toBeDefined();

    await ReactTestRenderer.act(async () => {
      await requireNavigationController(latest).handleCommand(
        taskCommand!,
        async () => undefined,
      );
    });

    expect(requireNavigationController(latest).activeModule).toBe('am');
    expect(requireNavigationController(latest).activeAmSurface).toEqual(
      expect.objectContaining({
        id: 'tasks',
        label: 'Tasks',
      }),
    );
    expect(requireNavigationController(latest).activeNavigationItem).toBeNull();
    expect(requireNavigationController(latest).activePluginRoute).toBeNull();
    expect(messages.at(-1)).toContain('am-be/routes/task');
  });

  it('keeps selected AM route context from AM Surface Launcher', async () => {
    const messages: string[] = [];
    let latest: NavigationController | null = null;
    const taskSurface = amSurfaces.find(surface => surface.id === 'tasks');

    if (!taskSurface) {
      throw new Error('AM Tasks surface missing from registry.');
    }

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <NavigationHarness
          messages={messages}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      requireNavigationController(latest).handleAmSurfaceSelect(taskSurface);
    });

    expect(requireNavigationController(latest).activeModule).toBe('am');
    expect(requireNavigationController(latest).activeAmSurface).toEqual(
      expect.objectContaining({
        id: 'tasks',
        label: 'Tasks',
      }),
    );
    expect(requireNavigationController(latest).activePluginRoute).toBeNull();
    expect(requireNavigationController(latest).commandSearch).toBe(
      taskSurface.route,
    );
    expect(messages.at(-1)).toContain('AM Surface Launcher');
  });

  it('clears stale route context when selecting a module directly', async () => {
    const messages: string[] = [];
    let latest: NavigationController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <NavigationHarness
          messages={messages}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      requireNavigationController(latest).handleDashboardRouteContext(
        '/products/product-live-low',
      );
      requireNavigationController(latest).handleModuleSelect('checkout');
    });

    expect(requireNavigationController(latest).activeModule).toBe('checkout');
    expect(requireNavigationController(latest).activeNavigationItem).toBeNull();
    expect(requireNavigationController(latest).activePluginRoute).toBeNull();

    const teamChatCommand = getCommandIndex().find(
      command =>
        command.kind === 'plugin-route' && command.route === '/team-chat',
    );

    if (!teamChatCommand) {
      throw new Error('Team Chat command missing from command index.');
    }

    await ReactTestRenderer.act(async () => {
      await requireNavigationController(latest).handleCommand(
        teamChatCommand,
        async () => undefined,
      );
      requireNavigationController(latest).handleModuleSelect('kolam');
    });

    expect(requireNavigationController(latest).activeModule).toBe('kolam');
    expect(requireNavigationController(latest).activeNavigationItem).toBeNull();
    expect(requireNavigationController(latest).activePluginRoute).toBeNull();
  });
});
