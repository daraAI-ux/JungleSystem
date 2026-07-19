import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {initialCheckoutState} from '../src/data/seed';
import type {DashboardCustomerVisitConfirmation} from '../src/domain/dashboard-customer-visit-confirmations';
import {pluginRegistry} from '../src/domain/unified';
import {useKolamWorkspaceSurfaceController} from '../src/hooks/use-kolam-workspace-surface-controller';
import {getCartSubtotal} from '../src/lib/checkout';
import {getCheckoutWorkflowSteps} from '../src/lib/workflow';
import {seedUnifiedDataset} from '../src/services/unified-data';

type WorkspaceSurfaceController = ReturnType<
  typeof useKolamWorkspaceSurfaceController
>;
type WorkspaceSurfaceInput = Parameters<
  typeof useKolamWorkspaceSurfaceController
>[0];

function requireController(controller: WorkspaceSurfaceController | null) {
  if (!controller) {
    throw new Error('Workspace surface controller did not render.');
  }

  return controller;
}

function buildWorkspaceSurfaceInput(
  overrides: Partial<WorkspaceSurfaceInput> = {},
): WorkspaceSurfaceInput {
  const dataset = seedUnifiedDataset;
  const subtotal = getCartSubtotal(initialCheckoutState.cart, dataset.catalog);

  return {
    activeModule: 'checkout',
    activeType: 'all',
    afterDiscount: subtotal,
    canCloseCashflow: true,
    canCreateDraft: true,
    canOpenCashflow: false,
    cashflowPreview: null,
    cashflowShiftName: '',
    catalogSearch: '',
    checkout: initialCheckoutState,
    customerForm: {
      name: '',
      gender: 'other',
      address: '',
      phone: '',
      email: '',
      notes: '',
    },
    dataset,
    filteredCatalog: dataset.catalog,
    filteredPlugins: pluginRegistry,
    finalTotal: subtotal,
    isClosingCashflow: false,
    isCreatingCustomer: false,
    isCreatingSale: false,
    isLoadingCashflowPreview: false,
    isOpeningCashflow: false,
    onAddToCart: () => undefined,
    onCashflowShiftNameChange: () => undefined,
    onCatalogSearchChange: () => undefined,
    onClearCart: () => undefined,
    onCloseCashflow: () => undefined,
    onCreateCustomer: () => undefined,
    onCreateSaleDraft: () => undefined,
    onCustomerFormChange: () => undefined,
    onCustomerVisitConfirm: () => undefined,
    onMessage: () => undefined,
    onDiscountAmountChange: () => undefined,
    onDiscountTypeChange: () => undefined,
    onGlobalDiscountChange: () => undefined,
    onGlobalDiscountTypeChange: () => undefined,
    onOpenCashflow: () => undefined,
    onPluginSearchChange: () => undefined,
    onQuantityChange: () => undefined,
    onSelectModule: () => undefined,
    onSelectCustomer: () => undefined,
    onSelectPaymentMethod: () => undefined,
    onShippingCostChange: () => undefined,
    onStatusChange: () => undefined,
    onTypeChange: () => undefined,
    pluginSearch: '',
    selectedCustomer: dataset.customers[0],
    selectedPayment: dataset.paymentMethods[0],
    subtotal,
    syncActivity: [],
    updatingSaleId: null,
    workflowSteps: getCheckoutWorkflowSteps({
      signedIn: true,
      hasPosAccess: true,
      hasCashflow: true,
      hasCustomer: true,
      hasPaymentMethod: true,
      cartItemCount: initialCheckoutState.cart.length,
    }),
    ...overrides,
  };
}

function WorkspaceSurfaceHarness({
  input,
  onRender,
}: {
  input: WorkspaceSurfaceInput;
  onRender: (controller: WorkspaceSurfaceController) => void;
}) {
  const controller = useKolamWorkspaceSurfaceController(input);

  onRender(controller);
  return null;
}

describe('Kolam workspace surface controller hook', () => {
  it('builds workspace module props from flattened app state', async () => {
    let latest: WorkspaceSurfaceController | null = null;
    const input = buildWorkspaceSurfaceInput({
      activeModule: 'sales',
      catalogSearch: 'frog',
      filteredCatalog: seedUnifiedDataset.catalog.slice(0, 1),
      pluginSearch: 'dara',
      updatingSaleId: seedUnifiedDataset.recentSales[0].id,
    });

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <WorkspaceSurfaceHarness
          input={input}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const {workspace} = requireController(latest);

    expect(workspace.activeModule).toBe('sales');
    expect(workspace.activeModuleRoute).toBeUndefined();
    expect(workspace.checkout.catalog).toBe(seedUnifiedDataset.catalog);
    expect(workspace.checkout.paymentMethods).toBe(
      seedUnifiedDataset.paymentMethods,
    );
    expect(workspace.catalog.catalogSearch).toBe('frog');
    expect(workspace.catalog.filteredCatalog).toHaveLength(1);
    expect(workspace.sales.updatingSaleId).toBe(
      seedUnifiedDataset.recentSales[0].id,
    );
    expect(workspace.plugins.pluginSearch).toBe('dara');
  });

  it('keeps checkout, cashflow, and visit callbacks wired through the wrapper', async () => {
    let latest: WorkspaceSurfaceController | null = null;
    const events: string[] = [];
    const row: DashboardCustomerVisitConfirmation = {
      id: 'visit-1',
      title: 'Dunia Anura',
      description: 'Voucher - Jadwal hari ini',
      actionLabel: 'Konfirmasi',
      actionAccessibilityLabel: 'Konfirmasi - /customer-visit/visit-1',
      route: '/customer-visit/visit-1',
    };
    const input = buildWorkspaceSurfaceInput({
      onAddToCart: item => {
        events.push(`cart:${item.id}`);
      },
      onOpenCashflow: async () => {
        events.push('open-cashflow');
      },
      onCustomerVisitConfirm: visitRow => {
        events.push(visitRow.route);
      },
    });

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <WorkspaceSurfaceHarness
          input={input}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    requireController(latest).workspace.checkout.onAddToCart(
      seedUnifiedDataset.catalog[0],
    );
    await requireController(latest).workspace.cashflow.onOpenCashflow();
    requireController(latest).workspace.onCustomerVisitConfirm?.(row);

    expect(events).toEqual([
      `cart:${seedUnifiedDataset.catalog[0].id}`,
      'open-cashflow',
      '/customer-visit/visit-1',
    ]);
  });

  it('routes Beranda Pending Orders links to the native Sales surface', async () => {
    let latest: WorkspaceSurfaceController | null = null;
    const messages: string[] = [];
    const selectedModules: string[] = [];
    const routeContexts: string[] = [];
    const input = buildWorkspaceSurfaceInput({
      activeModule: 'kolam',
      onMessage: message => {
        messages.push(message);
      },
      onDashboardRouteContext: route => {
        routeContexts.push(route);
      },
      onSelectModule: module => {
        selectedModules.push(module);
      },
    });

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <WorkspaceSurfaceHarness
          input={input}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    requireController(latest).workspace.onDashboardRoute?.(
      '/sales?needsAction=1',
    );
    requireController(latest).workspace.onDashboardRoute?.('/sales/sale-1');
    requireController(latest).workspace.onDashboardRoute?.(
      '/products?stockStatus=low_stock',
    );
    requireController(latest).workspace.onDashboardRoute?.('/products/product-1');
    requireController(latest).workspace.onDashboardRoute?.('/inventory');
    requireController(latest).workspace.onDashboardRoute?.('/raw-materials');

    expect(selectedModules).toEqual([
      'sales',
      'sales',
      'catalog',
      'catalog',
      'catalog',
      'catalog',
    ]);
    expect(routeContexts).toEqual([
      '/sales?needsAction=1',
      '/sales/sale-1',
      '/products?stockStatus=low_stock',
      '/products/product-1',
      '/inventory',
      '/raw-materials',
    ]);
    expect(messages).toEqual([
      'Sales native membuka /sales?needsAction=1.',
      'Sales native membuka /sales/sale-1.',
      'Katalog native membuka /products?stockStatus=low_stock.',
      'Katalog native membuka /products/product-1.',
      'Katalog native membuka /inventory.',
      'Katalog native membuka /raw-materials.',
    ]);
  });
});
