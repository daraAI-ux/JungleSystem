import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type { AppModule, ShellModuleRouteEntry } from '../src/domain/app-shell';
import { getShellModuleRouteEntry } from '../src/domain/app-shell';
import { useKolamDashboardHeaderController } from '../src/hooks/use-kolam-dashboard-header-controller';
import {
  seedUnifiedDataset,
  type UnifiedDataset,
} from '../src/services/unified-data';

type DashboardHeaderController = ReturnType<
  typeof useKolamDashboardHeaderController
>;

function requireController(controller: DashboardHeaderController | null) {
  if (!controller) {
    throw new Error('Dashboard header controller did not render.');
  }

  return controller;
}

function HeaderHarness({
  activeModule,
  activeModuleRoute,
  messages,
  dataset = seedUnifiedDataset,
  onRender,
  onRouteContext,
  onSelectModule,
  timezone,
}: {
  activeModule: AppModule;
  activeModuleRoute?: ShellModuleRouteEntry | null;
  messages: string[];
  dataset?: UnifiedDataset;
  onRender: (controller: DashboardHeaderController) => void;
  onRouteContext?: (route: string) => void;
  onSelectModule: (module: AppModule) => void;
  timezone?: string;
}) {
  const controller = useKolamDashboardHeaderController({
    accessScope: { kolam: true, pos: true },
    activeModule,
    activeModuleRoute,
    activeSession: seedUnifiedDataset.activeSession,
    displayName: 'Offline Operator',
    dataset,
    onMessage: message => messages.push(message),
    onRouteContext,
    onSelectModule,
    timezone,
  });

  onRender(controller);
  return null;
}

describe('Kolam dashboard header controller hook', () => {
  it('builds Beranda header props and forwards live actions to native modules', async () => {
    const messages: string[] = [];
    const routeContexts: string[] = [];
    let latest: DashboardHeaderController | null = null;
    let selectedModule: AppModule | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <HeaderHarness
          activeModule="kolam"
          messages={messages}
          onRender={controller => {
            latest = controller;
          }}
          onRouteContext={route => {
            routeContexts.push(route);
          }}
          onSelectModule={module => {
            selectedModule = module;
          }}
        />,
      );
    });

    const controller = requireController(latest);

    expect(controller.displayInitials).toBe('OO');
    expect(controller.dashboardHeader.eyebrow).toBe('Beranda');
    expect(controller.dashboardHeader.title).toContain('Offline Operator');
    expect(controller.dashboardHeader.showSessionPill).toBe(true);
    expect(controller.dashboardHeader.actions.map(action => action.id)).toEqual(
      ['new-product', 'new-order'],
    );

    await ReactTestRenderer.act(async () => {
      controller.dashboardHeader.onSelectModule(
        controller.dashboardHeader.actions[1],
      );
    });

    expect(selectedModule).toBe('checkout');
    expect(routeContexts).toEqual(['/sales/create']);
    expect(messages).toContain('Order Baru native membuka /sales/create.');
  });

  it('uses the native module title outside Beranda', async () => {
    const messages: string[] = [];
    let latest: DashboardHeaderController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <HeaderHarness
          activeModule="plugins"
          messages={messages}
          onRender={controller => {
            latest = controller;
          }}
          onSelectModule={() => undefined}
        />,
      );
    });

    expect(requireController(latest).dashboardHeader).toEqual(
      expect.objectContaining({
        eyebrow: undefined,
        actions: [],
        showSessionPill: false,
        title: 'Plugin Hub',
        subtitle: 'Plugin Hub workspace native Windows.',
      }),
    );
  });

  it('uses active route context in the native page header', async () => {
    const messages: string[] = [];
    const saleDraftRoute = getShellModuleRouteEntry('checkout', 'sale-draft');
    let latest: DashboardHeaderController | null = null;

    if (!saleDraftRoute) {
      throw new Error('POS sale-draft route is missing.');
    }

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <HeaderHarness
          activeModule="checkout"
          activeModuleRoute={saleDraftRoute}
          messages={messages}
          onRender={controller => {
            latest = controller;
          }}
          onSelectModule={() => undefined}
        />,
      );
    });

    expect(requireController(latest).dashboardHeader).toEqual(
      expect.objectContaining({
        eyebrow: 'POS Route',
        title: 'sale-draft',
        subtitle: '',
        actions: [],
        showSessionPill: false,
      }),
    );
  });

  it('uses the signed-in user timezone when building the Beranda greeting', async () => {
    const messages: string[] = [];
    let latest: DashboardHeaderController | null = null;

    jest.useFakeTimers().setSystemTime(new Date('2026-07-15T11:30:00Z'));

    try {
      await ReactTestRenderer.act(async () => {
        ReactTestRenderer.create(
          <HeaderHarness
            activeModule="kolam"
            messages={messages}
            onRender={controller => {
              latest = controller;
            }}
            onSelectModule={() => undefined}
            timezone="UTC+08:00"
          />,
        );
      });

      expect(requireController(latest).dashboardHeader.title).toBe(
        'Selamat malam, Offline Operator',
      );
    } finally {
      jest.useRealTimers();
    }
  });
  it('shows the local-first cache indicator before live refresh wins', async () => {
    const messages: string[] = [];
    let latest: DashboardHeaderController | null = null;
    const cachedDataset: UnifiedDataset = {
      ...seedUnifiedDataset,
      kolam: { ...seedUnifiedDataset.kolam, source: 'cache' },
      sync: { ...seedUnifiedDataset.sync, kolam: 'cache' },
    };

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <HeaderHarness
          activeModule="kolam"
          dataset={cachedDataset}
          messages={messages}
          onRender={controller => {
            latest = controller;
          }}
          onSelectModule={() => undefined}
        />,
      );
    });

    expect(requireController(latest).dashboardHeader.syncIndicator).toEqual(
      expect.objectContaining({
        area: 'kolam',
        areaLabel: 'Kolam',
        intent: 'success',
        label: 'Cache',
        status: 'cache',
      }),
    );
  });
});
