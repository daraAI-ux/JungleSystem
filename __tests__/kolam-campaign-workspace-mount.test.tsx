import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { KolamWorkspaceSurface } from '../src/components/kolam-workspace-surface';
import { initialCheckoutState } from '../src/data/seed';
import { isKolamCampaignRoute } from '../src/domain/kolam-campaign';
import {
  getKolamNavigationItemByRoute,
} from '../src/domain/kolam-navigation';
import { getCheckoutWorkflowSteps } from '../src/lib/workflow';
import { getCartSubtotal } from '../src/lib/checkout';
import { pluginRegistry } from '../src/domain/unified';
import { seedUnifiedDataset } from '../src/services/unified-data';

jest.mock('../src/hooks/use-kolam-campaign-controller', () => ({
  useKolamCampaignController: () => ({
    campaigns: [
      {
        id: 'c1',
        title: 'Flash Sale Test',
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-01-03T00:00:00.000Z',
        discountType: 'percentage',
        discountValue: 10,
        products: [],
        status: 'on_going',
        raw: {},
      },
    ],
    canCreate: true,
    canDelete: true,
    canUpdate: true,
    canView: true,
    dataSource: 'live',
    error: null,
    form: {
      title: '',
      startDate: '',
      endDate: '',
      discountType: 'fixed',
      discountValue: '0',
      status: 'on_planning',
      products: [{ productId: '', variantIds: [] }],
    },
    loading: false,
    loadingProducts: false,
    mode: 'list',
    mutating: false,
    page: 1,
    pageSize: 10,
    productOptions: [],
    productSearch: '',
    saving: false,
    search: '',
    selectedCampaign: null,
    statusFilter: '',
    statusMessage: null,
    total: 1,
    totalPages: 1,
    onAddProductRow: jest.fn(),
    onBackToList: jest.fn(() => '/campaign'),
    onChangeForm: jest.fn(),
    onClearFilters: jest.fn(),
    onCreateNew: jest.fn(),
    onDeleteCampaign: jest.fn(async () => true),
    onEdit: jest.fn(),
    onProductSearchChange: jest.fn(),
    onRefresh: jest.fn(async () => undefined),
    onRemoveProductRow: jest.fn(),
    onSave: jest.fn(async () => null),
    onSearchChange: jest.fn(),
    onSetPage: jest.fn(),
    onSetPageSize: jest.fn(),
    onSetProductId: jest.fn(),
    onSetStatusFilter: jest.fn(),
    onSetVariantIds: jest.fn(),
    onToggleVariant: jest.fn(),
  }),
}));

jest.mock('react-native-webview', () => {
  const ReactNative = require('react-native');
  return { __esModule: true, default: ReactNative.View };
});

function buildSurfaceProps(
  overrides: Partial<React.ComponentProps<typeof KolamWorkspaceSurface>> = {},
) {
  const dataset = seedUnifiedDataset;
  const selectedCustomer = dataset.customers[0];
  const selectedPayment = dataset.paymentMethods[0];
  const subtotal = getCartSubtotal(initialCheckoutState.cart, dataset.catalog);

  return {
    activeModule: 'kolam' as const,
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

describe('campaign workspace mount', () => {
  it('recognizes /campaign as campaign route', () => {
    expect(isKolamCampaignRoute('/campaign')).toBe(true);
    expect(getKolamNavigationItemByRoute('/campaign')?.route).toBe('/campaign');
  });

  it('renders campaign list surface instead of workbench stub', async () => {
    const item = getKolamNavigationItemByRoute('/campaign');
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <KolamWorkspaceSurface
          {...buildSurfaceProps({ activeNavigationItem: item })}
        />,
      );
    });

    const labels = tree!
      .root.findAllByType(Text)
      .map(node => String(node.props.children ?? ''))
      .flat()
      .join(' ');

    expect(labels).toContain('Flash Sale Test');
    expect(labels).not.toContain('native route surface sementara');
    expect(labels).not.toContain('Daftar Kampanye workbench');
  });
});
