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
        'Daily Cashflow',
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

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Automation Management',
        'Server',
        'https://frogs.dunia-anura.com/api',
        'Dashboard AM belum live',
        'Tasks',
        'Hardware',
      ]),
    );
    expect(renderText(renderer!)).not.toContain('Ringkasan Penjualan');
  });

  it('opens Automation Management surfaces from the native launcher', async () => {
    const onAmSurfaceSelect = jest.fn();
    const taskSurface = amSurfaces.find(surface => surface.id === 'tasks');
    let renderer: ReactTestRenderer.ReactTestRenderer;

    if (!taskSurface) {
      throw new Error('AM Tasks surface is missing.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamWorkspaceSurface
            {...buildSurfaceProps({
              activeModule: 'am',
              onAmSurfaceSelect,
            })}
          />
        </View>,
      );
    });

    await ReactTestRenderer.act(async () => {
      renderer!.root
        .findByProps({ accessibilityLabel: 'Buka Tasks surface' })
        .props.onPress();
    });

    expect(onAmSurfaceSelect).toHaveBeenCalledWith(taskSurface);
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

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Automation Management - Tasks',
        'am-fe/(dashboard)/tasks / am-be/routes/task',
        'Source Repo',
        'https://frogs.dunia-anura.com/api',
        'Native Client',
        'npm run verify:shell-routes',
        'Tasks workbench',
        'Automation Flow',
        'AM dashboard belum live',
      ]),
    );
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

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'AM Route',
        'transactions/:id',
        'Source Repo',
        'E:\\Projects\\da-automation-management',
        'Automation Management',
        'https://frogs.dunia-anura.com/api',
        'Native Client',
        'npm run verify:shell-routes',
      ]),
    );
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
