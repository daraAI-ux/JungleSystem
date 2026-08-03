import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { KolamWorkspaceSurface } from '../src/components/kolam-workspace-surface';
import { initialCheckoutState } from '../src/data/seed';
import { isKolamVoucherRoute } from '../src/domain/kolam-voucher';
import { getKolamNavigationItemByRoute } from '../src/domain/kolam-navigation';
import { getCheckoutWorkflowSteps } from '../src/lib/workflow';
import { getCartSubtotal } from '../src/lib/checkout';
import { pluginRegistry } from '../src/domain/unified';
import { seedUnifiedDataset } from '../src/services/unified-data';

jest.mock('../src/hooks/use-kolam-voucher-controller', () => ({
  useKolamVoucherController: () => ({
    vouchers: [
      {
        id: 'v1',
        code: 'FLASH10',
        title: 'Flash Voucher Test',
        description: '',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscountAmount: null,
        minPurchaseAmount: 0,
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-12-31T00:00:00.000Z',
        usageLimit: 100,
        usageLimitPerUser: null,
        usedCount: 1,
        status: 'active',
        applicableTo: 'all',
        applicableProducts: [],
        applicableSpecies: [],
        applicableCustomers: [],
        firstOrderOnly: false,
        createdAt: '',
        updatedAt: '',
      },
    ],
    canCreate: true,
    canDelete: true,
    canUpdate: true,
    canView: true,
    customerOptions: [],
    dataSource: 'live',
    error: null,
    form: {
      code: '',
      title: '',
      description: '',
      discountType: 'fixed',
      discountValue: '0',
      maxDiscountAmount: '0',
      minPurchaseAmount: '0',
      startDate: '',
      endDate: '',
      usageLimit: '0',
      usageLimitPerUser: '0',
      status: 'active',
      applicableTo: 'all',
      applicableProductIds: [],
      applicableSpeciesIds: [],
      applicableCustomerIds: [],
      firstOrderOnly: false,
    },
    loading: false,
    loadingOptions: false,
    loadingRedemptions: false,
    mode: 'list',
    mutating: false,
    page: 1,
    pageSize: 20,
    productOptions: [],
    redemptionPage: 1,
    redemptionTotal: 0,
    redemptionTotalPages: 1,
    redemptions: [],
    saving: false,
    search: '',
    selectedVoucher: null,
    speciesOptions: [],
    statusFilter: '',
    statusMessage: null,
    total: 1,
    totalPages: 1,
    onAddCustomerId: jest.fn(),
    onAddProductId: jest.fn(),
    onAddSpeciesId: jest.fn(),
    onBackToList: jest.fn(() => '/vouchers'),
    onChangeForm: jest.fn(),
    onClearFilters: jest.fn(),
    onCreateNew: jest.fn(),
    onDeleteVoucher: jest.fn(async () => true),
    onEdit: jest.fn(() => null),
    onRefresh: jest.fn(async () => undefined),
    onRemoveCustomerId: jest.fn(),
    onRemoveProductId: jest.fn(),
    onRemoveSpeciesId: jest.fn(),
    onSave: jest.fn(async () => null),
    onSearchChange: jest.fn(),
    onSetPage: jest.fn(),
    onSetPageSize: jest.fn(),
    onSetRedemptionPage: jest.fn(),
    onSetStatusFilter: jest.fn(),
    onToggleStatus: jest.fn(async () => true),
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
      onVoucherCodeChange: () => undefined,
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

describe('voucher workspace mount', () => {
  it('recognizes /vouchers as voucher route', () => {
    expect(isKolamVoucherRoute('/vouchers')).toBe(true);
    expect(getKolamNavigationItemByRoute('/vouchers')?.route).toBe('/vouchers');
  });

  it('renders voucher list surface instead of workbench stub', async () => {
    const item = getKolamNavigationItemByRoute('/vouchers');
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

    expect(labels).toContain('Flash Voucher Test');
    expect(labels).toContain('FLASH10');
    expect(labels).not.toContain('native route surface sementara');
  });
});
