import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type {KolamWorkspaceSurfaceProps} from '../src/components/kolam-workspace-surface';
import {initialCheckoutState} from '../src/data/seed';
import type {DashboardCustomerVisitConfirmation} from '../src/domain/dashboard-customer-visit-confirmations';
import {pluginRegistry} from '../src/domain/unified';
import {getCartSubtotal} from '../src/lib/checkout';
import {getCheckoutWorkflowSteps} from '../src/lib/workflow';
import {useKolamWorkspaceController} from '../src/hooks/use-kolam-workspace-controller';
import {seedUnifiedDataset} from '../src/services/unified-data';

type WorkspaceController = ReturnType<typeof useKolamWorkspaceController>;

function requireController(controller: WorkspaceController | null) {
  if (!controller) {
    throw new Error('Workspace controller did not render.');
  }

  return controller;
}

function buildWorkspaceProps(
  overrides: Partial<KolamWorkspaceSurfaceProps> = {},
): KolamWorkspaceSurfaceProps {
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
  };
}

function WorkspaceHarness({
  props,
  onRender,
}: {
  props: KolamWorkspaceSurfaceProps;
  onRender: (controller: WorkspaceController) => void;
}) {
  const controller = useKolamWorkspaceController(props);

  onRender(controller);
  return null;
}

describe('Kolam workspace controller hook', () => {
  it('builds the reusable workspace surface contract without changing module props', async () => {
    let latest: WorkspaceController | null = null;
    const props = buildWorkspaceProps({
      activeModule: 'checkout',
      catalog: {
        catalogSearch: 'frog',
        filteredCatalog: seedUnifiedDataset.catalog.slice(0, 1),
        onCatalogSearchChange: () => undefined,
      },
    });

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <WorkspaceHarness
          props={props}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const {workspace} = requireController(latest);

    expect(workspace.activeModule).toBe('checkout');
    expect(workspace.dataset).toBe(seedUnifiedDataset);
    expect(workspace.checkout.catalog).toBe(seedUnifiedDataset.catalog);
    expect(workspace.catalog.catalogSearch).toBe('frog');
    expect(workspace.catalog.filteredCatalog).toHaveLength(1);
    expect(workspace.plugins.filteredPlugins).toBe(pluginRegistry);
  });

  it('keeps the Beranda customer visit confirmation callback wired through workspace', async () => {
    let latest: WorkspaceController | null = null;
    let openedRoute = '';
    const props = buildWorkspaceProps({
      activeModule: 'kolam',
      onCustomerVisitConfirm: row => {
        openedRoute = row.route;
      },
    });
    const row: DashboardCustomerVisitConfirmation = {
      id: 'visit-1',
      title: 'Dunia Anura',
      description: 'Voucher - Jadwal hari ini',
      actionLabel: 'Konfirmasi',
      actionAccessibilityLabel: 'Konfirmasi - /customer-visit/visit-1',
      route: '/customer-visit/visit-1',
    };

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <WorkspaceHarness
          props={props}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    requireController(latest).workspace.onCustomerVisitConfirm?.(row);

    expect(openedRoute).toBe('/customer-visit/visit-1');
  });
});
