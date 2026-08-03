import React from 'react';
import { Text, View } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamWorkspaceSurface } from '../src/components/kolam-workspace-surface';
import { initialCheckoutState } from '../src/data/seed';
import { getShellModuleRouteEntry } from '../src/domain/app-shell';
import { authSources } from '../src/domain/auth';
import { getCommandIndex } from '../src/domain/command-index';
import { getDashboardCustomerVisitConfirmations } from '../src/domain/dashboard-customer-visit-confirmations';
import {
  getKolamNavigationItemByRoute,
  getKolamNavigationItemByRuntimeRoute,
} from '../src/domain/kolam-navigation';
import { getNativeReadinessChecks } from '../src/domain/readiness';
import {
  getRuntimeIdentityItems,
  getRuntimeIdentitySummary,
} from '../src/domain/runtime-identity';
import { getSyncActivityEntries } from '../src/domain/sync-activity';
import {
  amSurfaces,
  getPluginRouteIndex,
  kolamSurfaces,
  pluginRegistry,
} from '../src/domain/unified';
import { getCartSubtotal } from '../src/lib/checkout';
import { getCheckoutWorkflowSteps } from '../src/lib/workflow';
import { seedUnifiedDataset } from '../src/services/unified-data';

jest.mock('react-native-webview', () => {
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: ReactNative.View,
  };
});

jest.mock('../src/components/kolam-tiptap-rich-text-editor', () => {
  const React = require('react');
  const ReactNative = require('react-native');
  return {
    KolamTipTapRichTextEditor: ({ value }: { value: string }) =>
      React.createElement(ReactNative.Text, null, value || 'Deskripsi'),
  };
});

jest.mock('../src/services/am-api', () => ({
  getAmDashboard: jest.fn(() =>
    Promise.resolve({
      summary: {
        totalBalance: 0,
        totalAccounts: 0,
        todayIncoming: { total: 0, count: 0 },
        todayOutgoing: { total: 0, count: 0 },
        activeDevices: 0,
      },
      transfers: {
        pending: 0,
        processing: 0,
        success: 0,
        failed: 0,
        totalAmount: 0,
      },
      recentTransfers: [],
      recentMutasi: [],
      chartData: [],
      devices: [],
    }),
  ),
  getAmDevicesAdbStatus: jest.fn(() => Promise.resolve({})),
  getAmTasks: jest.fn(() =>
    Promise.resolve({ data: [], meta: { total: 0, limit: 0 } }),
  ),
  getAmTransfers: jest.fn(() =>
    Promise.resolve({ data: [], meta: { total: 0, limit: 0 } }),
  ),
  recordAmPageView: jest.fn(() => Promise.resolve(undefined)),
}));

jest.mock('../src/services/kolam-task-manager-api', () => ({
  createKolamTaskManagerTask: jest.fn(() => Promise.resolve({})),
  getKolamTaskManagerCategories: jest.fn(() =>
    Promise.resolve([
      { active: true, bucket: 'project', color: '#16a34a', id: 'cat-1', name: 'Operasional' },
    ]),
  ),
  getKolamTaskManagerTasks: jest.fn(query =>
    Promise.resolve({
      items:
        query?.limit === 400 ||
        query?.page !== 1 ||
        (query?.status && query.status !== 'all')
          ? []
          : [
              {
                assistedBy: null,
                category: { color: '#16a34a', id: 'cat-1', name: 'Operasional' },
                categoryBucket: 'project',
                checklist: [],
                completedAt: '',
                complaintId: '',
                conversationId: '',
                createdAt: '2026-08-03T01:00:00.000Z',
                createdBy: null,
                customerId: '',
                description: '',
                dueDate: '2026-08-03T16:59:00.000Z',
                enclosureId: '',
                id: 'task-1',
                priority: 'high',
                productionId: '',
                projectId: '',
                saleId: '',
                serviceId: '',
                source: 'manual',
                status: 'todo',
                taskType: null,
                title: 'Cek jadwal kolam',
                updatedAt: '',
                updatedBy: null,
                urgent: true,
                assignedTo: {
                  displayName: 'Dara Ops',
                  email: '',
                  firstName: 'Dara',
                  id: 'user-1',
                  lastName: 'Ops',
                  profilePicture: '',
                  username: 'dara',
                },
              },
            ],
      page: 1,
      pageSize: query?.limit ?? 10,
      total: query?.status && query.status !== 'all' ? 0 : 1,
      totalPages: 1,
    }),
  ),
  getKolamTaskManagerTask: jest.fn(() =>
    Promise.resolve({
      assistedBy: null,
      category: { color: '#16a34a', id: 'cat-1', name: 'Operasional' },
      categoryBucket: 'project',
      checklist: [
        {
          assignedTo: null,
          done: true,
          doneAt: '',
          doneBy: null,
          id: 'check-1',
          sortOrder: 0,
          title: 'Cek pompa',
        },
      ],
      completedAt: '',
      complaintId: '',
      conversationId: '',
      createdAt: '2026-08-03T01:00:00.000Z',
      createdBy: null,
      customerId: '',
      description: '<p>Pastikan filter berjalan.</p>',
      dueDate: '2026-08-03T16:59:00.000Z',
      enclosureId: '',
      id: 'task-1',
      priority: 'high',
      productionId: '',
      projectId: '',
      saleId: '',
      serviceId: '',
      source: 'manual',
      status: 'todo',
      taskType: null,
      timeline: [
        {
          at: '2026-08-03T01:00:00.000Z',
          by: null,
          id: 'timeline-1',
          message: 'Tugas dibuat',
          type: 'created',
        },
      ],
      title: 'Cek jadwal kolam',
      updatedAt: '',
      updatedBy: null,
      urgent: true,
      assignedTo: {
        displayName: 'Dara Ops',
        email: '',
        firstName: 'Dara',
        id: 'user-1',
        lastName: 'Ops',
        profilePicture: '',
        username: 'dara',
      },
    }),
  ),
  getKolamTaskRecurringTemplates: jest.fn(() =>
    Promise.resolve([
      {
        active: true,
        assignedTo: {
          displayName: 'Dara Ops',
          email: '',
          firstName: 'Dara',
          id: 'user-1',
          lastName: 'Ops',
          profilePicture: '',
          username: 'dara',
        },
        categoryBucket: 'enclosure',
        createdAt: '',
        description: '',
        id: 'tpl-1',
        priority: 'medium',
        recurrence: {
          dayOfMonth: null,
          daysOfWeek: [],
          dueHoursAfter: 24,
          time: '09:00',
          type: 'daily',
        },
        sampleReviewPercent: 10,
        taskType: null,
        title: 'Cek harian enclosure',
        updatedAt: '',
      },
    ]),
  ),
  getKolamTaskRecurringOccurrences: jest.fn(() =>
    Promise.resolve([
      {
        assignedTo: null,
        categoryBucket: 'enclosure',
        categoryLabel: 'Enclosure',
        dueAt: '2026-08-03T16:59:00.000Z',
        id: 'occ-1',
        priority: 'medium',
        scheduledAt: '2026-08-03T02:00:00.000Z',
        status: 'pending',
        taskId: 'task-1',
        title: 'Cek suhu',
      },
    ]),
  ),
  getKolamTaskRecurringServiceVisits: jest.fn(() => Promise.resolve([])),
  runKolamTaskRecurringTick: jest.fn(() => Promise.resolve(undefined)),
  updateKolamTaskManagerChecklist: jest.fn(() => Promise.resolve({})),
  updateKolamTaskManagerStatus: jest.fn(() => Promise.resolve({})),
  updateKolamTaskManagerTask: jest.fn(() => Promise.resolve({})),
}));

jest.mock('../src/services/kolam-user-api', () => ({
  getKolamUserList: jest.fn(() =>
    Promise.resolve({
      items: [
        {
          displayName: 'Dara Ops',
          email: '',
          firstName: 'Dara',
          id: 'user-1',
          lastName: 'Ops',
          username: 'dara',
        },
      ],
    }),
  ),
}));

const mountedWorkspaceRenderers: ReactTestRenderer.ReactTestRenderer[] = [];

afterEach(() => {
  for (const renderer of mountedWorkspaceRenderers.splice(0)) {
    ReactTestRenderer.act(() => {
      renderer.unmount();
    });
  }
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

function buildSurfaceProps(
  overrides: Partial<React.ComponentProps<typeof KolamWorkspaceSurface>> = {},
) {
  const dataset = seedUnifiedDataset;
  const selectedCustomer = dataset.customers[0];
  const selectedPayment = dataset.paymentMethods[0];
  const subtotal = getCartSubtotal(initialCheckoutState.cart, dataset.catalog);

  return {
    activeModule: 'catalog',
    dataset,
    syncActivity: [],
    checkout: {
      activeType: 'all',
      afterDiscount: subtotal,
      canCreateDraft: true,
      catalog: dataset.catalog,
      catalogSearch: '',
      checkout: initialCheckoutState,
      customers: dataset.customers,
      filteredCatalog: dataset.catalog,
      finalTotal: subtotal,
      isCreatingSale: false,
      onAddToCart: () => undefined,
      onCatalogSearchChange: () => undefined,
      onClearCart: () => undefined,
      onCreateSaleDraft: () => undefined,
      onDiscountAmountChange: () => undefined,
      onDiscountTypeChange: () => undefined,
      onGlobalDiscountChange: () => undefined,
      onGlobalDiscountTypeChange: () => undefined,
      onQuantityChange: () => undefined,
      onSelectCustomer: () => undefined,
      onSelectPaymentMethod: () => undefined,
      onShippingCostChange: () => undefined,
      onTypeChange: () => undefined,
      paymentMethods: dataset.paymentMethods,
      recentSales: dataset.recentSales,
      selectedCustomer,
      selectedPayment,
      subtotal,
      workflowSteps: getCheckoutWorkflowSteps({
        signedIn: true,
        hasPosAccess: true,
        hasCashflow: true,
        hasCustomer: true,
        hasPaymentMethod: true,
        cartItemCount: initialCheckoutState.cart.length,
      }),
    },
    catalog: {
      catalogSearch: '',
      filteredCatalog: dataset.catalog,
      onCatalogSearchChange: () => undefined,
    },
    sales: {
      sales: dataset.recentSales,
      updatingSaleId: null,
      onStatusChange: () => undefined,
    },
    cashflow: {
      cashflowPreview: null,
      cashflowShiftName: '',
      canClose: true,
      canOpen: false,
      isClosingCashflow: false,
      isLoadingCashflowPreview: false,
      isOpeningCashflow: false,
      onCashflowShiftNameChange: () => undefined,
      onCloseCashflow: () => undefined,
      onOpenCashflow: () => undefined,
    },
    customer: {
      customerForm: {
        name: '',
        gender: 'other',
        address: '',
        phone: '',
        email: '',
        notes: '',
      },
      isCreatingCustomer: false,
      onCreateCustomer: () => undefined,
      onCustomerFormChange: () => undefined,
    },
    plugins: {
      filteredPlugins: pluginRegistry,
      pluginSearch: '',
      onPluginSearchChange: () => undefined,
    },
    ...overrides,
  } satisfies React.ComponentProps<typeof KolamWorkspaceSurface>;
}

function buildRuntimeProps(): NonNullable<
  React.ComponentProps<typeof KolamWorkspaceSurface>['runtime']
> {
  const runtimeIdentityItems = getRuntimeIdentityItems();
  const runtimeIdentitySummary =
    getRuntimeIdentitySummary(runtimeIdentityItems);
  const commands = getCommandIndex();

  return {
    auth: {
      accessScope: { am: true, kolam: true, pos: true },
      amApiBaseUrl: 'https://am.example.test',
      authEmail: '',
      authMessage: 'Runtime server existing siap.',
      authPassword: '',
      authSource: 'pos',
      authSourceHint: 'POS access_pos atau role POS.',
      authSources,
      displayName: 'Dunia Anura',
      isSigningIn: false,
      onAmApiBaseUrlChange: () => undefined,
      onAuthEmailChange: () => undefined,
      onAuthPasswordChange: () => undefined,
      onAuthSourceChange: () => undefined,
      onLogin: () => undefined,
      onLogout: () => undefined,
      onSync: () => undefined,
    },
    runtimeIdentity: {
      items: runtimeIdentityItems,
      meta: `${runtimeIdentitySummary.ready} ready`,
    },
    syncStatus: {
      message: 'Unified sync live',
      loading: false,
    },
    syncActivity: getSyncActivityEntries(seedUnifiedDataset, '10:00'),
    readiness: {
      checks: getNativeReadinessChecks(),
      summaryText: 'readiness summary',
    },
    runtimeActions: {
      accessScope: { am: true, kolam: true, pos: true },
      moduleId: 'checkout',
      onAction: () => undefined,
    },
    commandIndex: {
      commands,
      totalCount: commands.length,
      search: '',
      onSearchChange: () => undefined,
      onSelect: () => undefined,
    },
  };
}

describe('KolamWorkspaceSurface', () => {
  it('renders POS catalog through the shared workspace boundary', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface {...buildSurfaceProps()} />
        </View>,
      );
    });
    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Katalog', 'Sponge Filter Medium']),
    );
  });

  it('renders the native Task Manager surface for /task-manager', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    const taskManagerItem = getKolamNavigationItemByRoute('/task-manager');

    if (!taskManagerItem) {
      throw new Error('Task Manager navigation item is missing.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'kolam',
              activeNavigationItem: taskManagerItem,
            })}
          />
        </View>,
      );
    });

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Tugas',
        'Tugas Terjadwal',
        'To Do',
        'Cek jadwal kolam',
        'Dara Ops',
      ]),
    );
  });

  it('opens the native Task Manager form from /task-manager', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    const taskManagerItem = getKolamNavigationItemByRoute('/task-manager');

    if (!taskManagerItem) {
      throw new Error('Task Manager navigation item is missing.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'kolam',
              activeNavigationItem: taskManagerItem,
            })}
          />
        </View>,
      );
    });

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    const newButton = renderer!.root.findAll(
      node => node.props.label === 'Baru',
    )[0];

    await ReactTestRenderer.act(async () => {
      newButton.props.onPress();
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Tugas baru', 'Judul', 'PIC', 'Kategori']),
    );
  });

  it('renders the native Task Manager detail surface for /task-manager/:id', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    const taskManagerItem = {
      ...getKolamNavigationItemByRoute('/task-manager')!,
      route: '/task-manager/task-1',
    };

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'kolam',
              activeNavigationItem: taskManagerItem,
            })}
          />
        </View>,
      );
    });

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Cek jadwal kolam',
        'Checklist',
        'Cek pompa',
        'Timeline',
        'Tugas dibuat',
      ]),
    );
  });

  it('renders the native Task Manager recurring tab', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    const baseItem = getKolamNavigationItemByRoute('/task-manager');
    const recurringItem = baseItem
      ? {
          ...baseItem,
          route: '/task-manager/tugas-terjadwal',
        }
      : null;

    if (!recurringItem) {
      throw new Error('Task Manager recurring navigation item is missing.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'kolam',
              activeNavigationItem: recurringItem,
            })}
          />
        </View>,
      );
    });

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Tugas berulang',
        'Template aktif',
        'Cek harian enclosure',
        'Jadwal / occurrence',
        'Cek suhu',
      ]),
    );
  });

  it('renders selected POS module routes through the shared route surface', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    const saleDraftRoute = getShellModuleRouteEntry('checkout', 'sale-draft');

    if (!saleDraftRoute) {
      throw new Error('POS sale-draft route is missing.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'checkout',
              activeModuleRoute: saleDraftRoute,
            })}
          />
        </View>,
      );
    });
    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Checkout Route',
        'sale-draft',
        'Source Repo',
        'E:\\Projects\\da-pos',
        'Checkout',
        'Checkout workbench',
        'Form Flow',
        '4 item sellable',
        '2 payment method',
        'Open Surface',
        'Server Runtime',
        'Native Client',
        'npm run verify:shell-routes',
      ]),
    );
  });

  it('opens POS module routes from the native route launcher', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    const onModuleRouteSelect = jest.fn();
    const saleDraftRoute = getShellModuleRouteEntry('checkout', 'sale-draft');

    if (!saleDraftRoute) {
      throw new Error('POS sale-draft route is missing.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'checkout',
              onModuleRouteSelect,
            })}
          />
        </View>,
      );
    });

    await ReactTestRenderer.act(async () => {
      renderer!.root
        .findByProps({ accessibilityLabel: 'Buka Checkout sale-draft' })
        .props.onPress();
    });

    expect(onModuleRouteSelect).toHaveBeenCalledWith(saleDraftRoute);
  });

  it('renders selected Kolam surfaces through the shared route surface', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    const financeSurface = kolamSurfaces.find(
      surface => surface.id === 'finance',
    );

    if (!financeSurface) {
      throw new Error('Kolam Finance surface is missing.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'kolam',
              activeKolamSurface: financeSurface,
            })}
          />
        </View>,
      );
    });
    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Kolam - Finance',
        'finance / wallet / payable / receivable',
        'https://amfibi.dunia-anura.com/api',
        'Native Client',
        'npm run verify:live-routes',
        'Sync Kolam saat ini: seed.',
        'Finance workbench',
        'Sesi Tunai Harian',
      ]),
    );
  });

  it('opens Kolam surfaces from the Preparation launcher', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    const onKolamSurfaceSelect = jest.fn();
    const financeSurface = kolamSurfaces.find(
      surface => surface.id === 'finance',
    );

    if (!financeSurface) {
      throw new Error('Kolam Finance surface is missing.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'preparation',
              onKolamSurfaceSelect,
            })}
          />
        </View>,
      );
    });

    await ReactTestRenderer.act(async () => {
      renderer!.root
        .findByProps({ accessibilityLabel: 'Buka Finance surface' })
        .props.onPress();
    });

    expect(onKolamSurfaceSelect).toHaveBeenCalledWith(financeSurface);
  });

  it('renders runtime controls only inside Preparation', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'catalog',
              runtime: buildRuntimeProps(),
            })}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).not.toContain('Session');

    await ReactTestRenderer.act(async () => {
      renderer!.update(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'preparation',
              runtime: buildRuntimeProps(),
            })}
          />
        </View>,
      );
    });
    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Session', 'Runtime', 'Unified sync live']),
    );
  });

  it('renders plugin hub through the same workspace boundary', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({ activeModule: 'plugins' })}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Plugin tersedia', 'Route plugin']),
    );
  });

  it('renders selected plugin routes as native route surfaces', async () => {
    const teamChatRoute = getPluginRouteIndex(pluginRegistry).find(
      route => route.route === '/team-chat',
    );
    let renderer: ReactTestRenderer.ReactTestRenderer;

    if (!teamChatRoute) {
      throw new Error('Team Chat plugin route is missing from registry.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'plugins',
              activePluginRoute: teamChatRoute,
            })}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Chat Route',
        '/team-chat',
        'Chat & Inbox',
        'Server Runtime',
        'Native Client',
        'npm run verify:registry',
        'Runtime',
        'Chat workbench',
        'plugin host',
        'Plugin Host Runtime',
      ]),
    );
  });

  it('renders Automation Management as its own runtime surface', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({ activeModule: 'am' })}
          />
        </View>,
      );
    });
    mountedWorkspaceRenderers.push(renderer!);

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'https://frogs.dunia-anura.com/api',
        'Kembali',
        'Dashboard live AM dari endpoint /dashboard.',
        'Transfer Status',
      ]),
    );
    expect(renderText(renderer!)).not.toContain('Automation Management');
    expect(renderText(renderer!)).not.toContain('Ringkasan akun, device, transfer, dan mutasi AM.');
    expect(renderText(renderer!)).not.toContain('Ringkasan Penjualan');
  });

  it('renders Automation Management routes from the shell route state', async () => {
    const taskRoute = getShellModuleRouteEntry('am', 'tasks');
    let renderer: ReactTestRenderer.ReactTestRenderer;

    if (!taskRoute) {
      throw new Error('AM Tasks route is missing.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'am',
              activeModuleRoute: taskRoute,
            })}
          />
        </View>,
      );
    });
    mountedWorkspaceRenderers.push(renderer!);

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'https://frogs.dunia-anura.com/api',
        'Kembali',
        '0 task',
      ]),
    );
    expect(renderText(renderer!)).not.toContain('Automation Management');
    expect(renderText(renderer!)).not.toContain('Monitor dan kelola automation tasks lintas device.');
  });

  it('renders selected Automation Management routes as native route surfaces', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    const taskSurface = amSurfaces.find(surface => surface.id === 'tasks');

    if (!taskSurface) {
      throw new Error('AM Tasks surface is missing.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'am',
              activeAmSurface: taskSurface,
            })}
          />
        </View>,
      );
    });
    mountedWorkspaceRenderers.push(renderer!);

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'https://frogs.dunia-anura.com/api',
        'Kembali',
        '0 task',
      ]),
    );
    expect(renderText(renderer!)).not.toContain('Automation Management');
    expect(renderText(renderer!)).not.toContain('Monitor dan kelola automation tasks lintas device.');
  });

  it('renders Automation Management module route contracts from the shell index', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    const transactionRoute = getShellModuleRouteEntry('am', 'transactions/:id');

    if (!transactionRoute) {
      throw new Error('AM transactions route is missing.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'am',
              activeModuleRoute: transactionRoute,
            })}
          />
        </View>,
      );
    });
    mountedWorkspaceRenderers.push(renderer!);

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'https://frogs.dunia-anura.com/api',
        'Kembali',
        '0 transfer',
      ]),
    );
    expect(renderText(renderer!)).not.toContain('Automation Management');
    expect(renderText(renderer!)).not.toContain('Transfer bank dan status eksekusi.');
  });

  it('forwards AM topbar Settings to the shell route handler', async () => {
    const onModuleRouteSelect = jest.fn();
    const settingsRoute = getShellModuleRouteEntry('am', 'settings/account');
    let renderer: ReactTestRenderer.ReactTestRenderer;

    if (!settingsRoute) {
      throw new Error('AM account settings route is missing.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'am',
              onModuleRouteSelect,
            })}
          />
        </View>,
      );
    });
    mountedWorkspaceRenderers.push(renderer!);

    await ReactTestRenderer.act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Settings'}).props.onPress();
    });

    expect(onModuleRouteSelect).toHaveBeenCalledWith(settingsRoute);
  });

  it('forwards Beranda customer visit confirmation actions from workspace', async () => {
    const onCustomerVisitConfirm = jest.fn();
    const [confirmation] =
      getDashboardCustomerVisitConfirmations(seedUnifiedDataset);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'kolam',
              onCustomerVisitConfirm,
            })}
          />
        </View>,
      );
    });

    const action = renderer!.root.findByProps({
      accessibilityLabel: confirmation.actionAccessibilityLabel,
    });

    await ReactTestRenderer.act(async () => {
      action.props.onPress();
    });

    expect(onCustomerVisitConfirm).toHaveBeenCalledWith(confirmation);
  });

  it('renders selected Kolam menu routes as native route surfaces', async () => {
    const tagRoute = getKolamNavigationItemByRoute('/tags');
    let renderer: ReactTestRenderer.ReactTestRenderer;

    if (!tagRoute) {
      throw new Error('Tag route is missing from Kolam navigation.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'kolam',
              activeNavigationItem: tagRoute,
            })}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Tags', '/tags', 'Route', 'Runtime']),
    );
    expect(renderText(renderer!)).not.toContain('Ringkasan Penjualan');
  });

  it('keeps Kolam route context when routes open POS catalog surfaces', async () => {
    const productsRoute = getKolamNavigationItemByRoute('/products');
    let renderer: ReactTestRenderer.ReactTestRenderer;

    if (!productsRoute) {
      throw new Error('Products route is missing from Kolam navigation.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'catalog',
              activeNavigationItem: productsRoute,
            })}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Products',
        '/products',
        'Route',
        'Katalog',
        'Sponge Filter Medium',
      ]),
    );
  });

  it('renders live route variant metadata on POS catalog route surfaces', async () => {
    const productsCreateRoute =
      getKolamNavigationItemByRuntimeRoute('/products/create');
    let renderer: ReactTestRenderer.ReactTestRenderer;

    if (!productsCreateRoute) {
      throw new Error('Products create route did not resolve.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'catalog',
              activeNavigationItem: productsCreateRoute,
            })}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Products Create',
        '/products/create',
        'Route Pattern',
        'Base Route',
        'https://amfibi.dunia-anura.com/api',
        'npm run verify:live-routes',
        'Katalog',
      ]),
    );
  });

  it('renders virtual dashboard route context on POS catalog surfaces', async () => {
    const inventoryRoute = getKolamNavigationItemByRuntimeRoute('/inventory');
    let renderer: ReactTestRenderer.ReactTestRenderer;

    if (!inventoryRoute) {
      throw new Error('Inventory runtime route did not resolve.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'catalog',
              activeNavigationItem: inventoryRoute,
            })}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Inventory', '/inventory', 'Katalog']),
    );
  });

  it('keeps Kolam route context when routes open POS sales surfaces', async () => {
    const salesRoute = getKolamNavigationItemByRoute('/sales');
    let renderer: ReactTestRenderer.ReactTestRenderer;

    if (!salesRoute) {
      throw new Error('Sales route is missing from Kolam navigation.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'sales',
              activeNavigationItem: salesRoute,
            })}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Sales', '/sales', 'Route', 'Sales Terbaru']),
    );
  });

  it('opens native Settings tabs from selected Settings routes', async () => {
    const rolesRoute = getKolamNavigationItemByRoute('/settings/roles');
    let renderer: ReactTestRenderer.ReactTestRenderer;

    if (!rolesRoute) {
      throw new Error('Roles route is missing from Kolam navigation.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'settings',
              activeNavigationItem: rolesRoute,
            })}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Settings',
        'Role Management',
        'access_inventory',
      ]),
    );
  });

  it('renders uncovered Settings routes as temporary route surfaces', async () => {
    const sitemapRoute = getKolamNavigationItemByRoute('/settings/sitemap');
    let renderer: ReactTestRenderer.ReactTestRenderer;

    if (!sitemapRoute) {
      throw new Error('Sitemap route is missing from Kolam navigation.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'settings',
              activeNavigationItem: sitemapRoute,
            })}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Sitemap', '/settings/sitemap', 'Route']),
    );
    expect(renderText(renderer!)).not.toContain('Web Settings form');
  });
});
