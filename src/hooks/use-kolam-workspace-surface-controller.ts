import {useCallback} from 'react';
import type {AppModule, ShellModuleRouteEntry} from '../domain/app-shell';
import type {CommandEntry} from '../domain/command-index';
import type {PluginRouteEntry, UnifiedSurface} from '../domain/unified';
import type {KolamWorkspaceSurfaceProps} from '../components/kolam-workspace-surface';
import {useKolamWorkspaceController} from './use-kolam-workspace-controller';

type WorkspaceCheckoutProps = KolamWorkspaceSurfaceProps['checkout'];
type WorkspaceCashflowProps = KolamWorkspaceSurfaceProps['cashflow'];
type WorkspaceCatalogProps = KolamWorkspaceSurfaceProps['catalog'];
type WorkspaceCustomerProps = KolamWorkspaceSurfaceProps['customer'];
type WorkspacePluginsProps = KolamWorkspaceSurfaceProps['plugins'];
type WorkspaceSalesProps = KolamWorkspaceSurfaceProps['sales'];
type WorkspaceDashboardRouteHandler =
  NonNullable<KolamWorkspaceSurfaceProps['onDashboardRoute']>;

export function useKolamWorkspaceSurfaceController({
  activeModule,
  activeAmSurface,
  activeKolamSurface,
  activeModuleRoute,
  activeNavigationItem,
  activePluginRoute,
  activeType,
  afterDiscount,
  canCloseCashflow,
  canCreateDraft,
  canOpenCashflow,
  cashflowPreview,
  cashflowShiftName,
  catalogSearch,
  checkout,
  customerForm,
  dataset,
  filteredCatalog,
  filteredPlugins,
  finalTotal,
  isClosingCashflow,
  isCreatingCustomer,
  isCreatingSale,
  isLoadingCashflowPreview,
  isOpeningCashflow,
  onAddToCart,
  onCashflowShiftNameChange,
  onCatalogSearchChange,
  onClearCart,
  onCloseCashflow,
  onCommandSelect,
  onCreateCustomer,
  onCreateSaleDraft,
  onCustomerFormChange,
  onCustomerVisitConfirm,
  onDashboardRouteContext,
  onKolamSurfaceSelect,
  onMessage,
  onAmSurfaceSelect,
  onModuleRouteSelect,
  onPluginRouteSelect,
  onSelectModule,
  onDiscountAmountChange,
  onDiscountTypeChange,
  onGlobalDiscountChange,
  onGlobalDiscountTypeChange,
  onOpenCashflow,
  onPluginSearchChange,
  onQuantityChange,
  onSalesGraphRangeSelect,
  onSelectCustomer,
  onSelectPaymentMethod,
  onShippingCostChange,
  onStatusChange,
  onTypeChange,
  pluginSearch,
  salesGraphRange,
  selectedCustomer,
  selectedPayment,
  subtotal,
  syncActivity,
  updatingSaleId,
  workflowSteps,
}: {
  activeModule: KolamWorkspaceSurfaceProps['activeModule'];
  activeAmSurface?: KolamWorkspaceSurfaceProps['activeAmSurface'];
  activeKolamSurface?: KolamWorkspaceSurfaceProps['activeKolamSurface'];
  activeModuleRoute?: KolamWorkspaceSurfaceProps['activeModuleRoute'];
  activeNavigationItem?: KolamWorkspaceSurfaceProps['activeNavigationItem'];
  activePluginRoute?: KolamWorkspaceSurfaceProps['activePluginRoute'];
  activeType: WorkspaceCheckoutProps['activeType'];
  afterDiscount: WorkspaceCheckoutProps['afterDiscount'];
  canCloseCashflow: WorkspaceCashflowProps['canClose'];
  canCreateDraft: WorkspaceCheckoutProps['canCreateDraft'];
  canOpenCashflow: WorkspaceCashflowProps['canOpen'];
  cashflowPreview: WorkspaceCashflowProps['cashflowPreview'];
  cashflowShiftName: WorkspaceCashflowProps['cashflowShiftName'];
  catalogSearch: WorkspaceCatalogProps['catalogSearch'];
  checkout: WorkspaceCheckoutProps['checkout'];
  customerForm: WorkspaceCustomerProps['customerForm'];
  dataset: KolamWorkspaceSurfaceProps['dataset'];
  filteredCatalog: WorkspaceCatalogProps['filteredCatalog'];
  filteredPlugins: WorkspacePluginsProps['filteredPlugins'];
  finalTotal: WorkspaceCheckoutProps['finalTotal'];
  isClosingCashflow: WorkspaceCashflowProps['isClosingCashflow'];
  isCreatingCustomer: WorkspaceCustomerProps['isCreatingCustomer'];
  isCreatingSale: WorkspaceCheckoutProps['isCreatingSale'];
  isLoadingCashflowPreview: WorkspaceCashflowProps['isLoadingCashflowPreview'];
  isOpeningCashflow: WorkspaceCashflowProps['isOpeningCashflow'];
  onAddToCart: WorkspaceCheckoutProps['onAddToCart'];
  onCashflowShiftNameChange: WorkspaceCashflowProps['onCashflowShiftNameChange'];
  onCatalogSearchChange: WorkspaceCatalogProps['onCatalogSearchChange'];
  onClearCart: WorkspaceCheckoutProps['onClearCart'];
  onCloseCashflow: WorkspaceCashflowProps['onCloseCashflow'];
  onCommandSelect?: (command: CommandEntry) => void;
  onCreateCustomer: WorkspaceCustomerProps['onCreateCustomer'];
  onCreateSaleDraft: WorkspaceCheckoutProps['onCreateSaleDraft'];
  onCustomerFormChange: WorkspaceCustomerProps['onCustomerFormChange'];
  onCustomerVisitConfirm: KolamWorkspaceSurfaceProps['onCustomerVisitConfirm'];
  onDashboardRouteContext?: (route: string) => void;
  onKolamSurfaceSelect?: (surface: UnifiedSurface) => void;
  onMessage: (message: string) => void;
  onAmSurfaceSelect?: (surface: UnifiedSurface) => void;
  onModuleRouteSelect?: (route: ShellModuleRouteEntry) => void;
  onPluginRouteSelect?: (route: PluginRouteEntry) => void;
  onSelectModule: (module: AppModule) => void;
  onDiscountAmountChange: WorkspaceCheckoutProps['onDiscountAmountChange'];
  onDiscountTypeChange: WorkspaceCheckoutProps['onDiscountTypeChange'];
  onGlobalDiscountChange: WorkspaceCheckoutProps['onGlobalDiscountChange'];
  onGlobalDiscountTypeChange: WorkspaceCheckoutProps['onGlobalDiscountTypeChange'];
  onOpenCashflow: WorkspaceCashflowProps['onOpenCashflow'];
  onPluginSearchChange: WorkspacePluginsProps['onPluginSearchChange'];
  onQuantityChange: WorkspaceCheckoutProps['onQuantityChange'];
  onSalesGraphRangeSelect?: KolamWorkspaceSurfaceProps['onSalesGraphRangeSelect'];
  onSelectCustomer: WorkspaceCheckoutProps['onSelectCustomer'];
  onSelectPaymentMethod: WorkspaceCheckoutProps['onSelectPaymentMethod'];
  onShippingCostChange: WorkspaceCheckoutProps['onShippingCostChange'];
  onStatusChange: WorkspaceSalesProps['onStatusChange'];
  onTypeChange: WorkspaceCheckoutProps['onTypeChange'];
  pluginSearch: WorkspacePluginsProps['pluginSearch'];
  salesGraphRange?: KolamWorkspaceSurfaceProps['salesGraphRange'];
  selectedCustomer: WorkspaceCheckoutProps['selectedCustomer'];
  selectedPayment: WorkspaceCheckoutProps['selectedPayment'];
  subtotal: WorkspaceCheckoutProps['subtotal'];
  syncActivity: KolamWorkspaceSurfaceProps['syncActivity'];
  updatingSaleId: WorkspaceSalesProps['updatingSaleId'];
  workflowSteps: WorkspaceCheckoutProps['workflowSteps'];
}) {
  const handleDashboardRoute = useCallback<WorkspaceDashboardRouteHandler>(
    route => {
      const module = getDashboardRouteModule(route);

      onSelectModule(module);
      onDashboardRouteContext?.(route);
      onMessage(
        `${getDashboardRouteModuleLabel(module)} native membuka ${route}.`,
      );
    },
    [onDashboardRouteContext, onMessage, onSelectModule],
  );

  return useKolamWorkspaceController({
    activeModule,
    activeAmSurface,
    activeKolamSurface,
    activeModuleRoute,
    activeNavigationItem,
    activePluginRoute,
    dataset,
    syncActivity,
    checkout: {
      activeType,
      afterDiscount,
      canCreateDraft,
      catalog: dataset.catalog,
      catalogSearch,
      checkout,
      customers: dataset.customers,
      filteredCatalog,
      finalTotal,
      isCreatingSale,
      onAddToCart,
      onCatalogSearchChange,
      onClearCart,
      onCreateSaleDraft,
      onDiscountAmountChange,
      onDiscountTypeChange,
      onGlobalDiscountChange,
      onGlobalDiscountTypeChange,
      onQuantityChange,
      onSelectCustomer,
      onSelectPaymentMethod,
      onShippingCostChange,
      onTypeChange,
      paymentMethods: dataset.paymentMethods,
      recentSales: dataset.recentSales,
      selectedCustomer,
      selectedPayment,
      subtotal,
      workflowSteps,
    },
    catalog: {
      catalogSearch,
      filteredCatalog,
      onCatalogSearchChange,
    },
    sales: {
      sales: dataset.recentSales,
      updatingSaleId,
      onStatusChange,
    },
    cashflow: {
      cashflowPreview,
      cashflowShiftName,
      canClose: canCloseCashflow,
      canOpen: canOpenCashflow,
      isClosingCashflow,
      isLoadingCashflowPreview,
      isOpeningCashflow,
      onCashflowShiftNameChange,
      onCloseCashflow,
      onOpenCashflow,
    },
    customer: {
      customerForm,
      isCreatingCustomer,
      onCreateCustomer,
      onCustomerFormChange,
    },
    plugins: {
      filteredPlugins,
      pluginSearch,
      onPluginSearchChange,
    },
    onAmSurfaceSelect,
    onCommandSelect,
    onDashboardRoute: handleDashboardRoute,
    onKolamSurfaceSelect,
    onModuleRouteSelect,
    onPluginRouteSelect,
    onSelectModule,
    onCustomerVisitConfirm,
    onSalesGraphRangeSelect,
    salesGraphRange,
  });
}

function getDashboardRouteModule(route: string): AppModule {
  if (route.startsWith('/sales')) {
    return 'sales';
  }

  if (
    route.startsWith('/inventory') ||
    route.startsWith('/products') ||
    route.startsWith('/raw-materials') ||
    route.startsWith('/species') ||
    route.startsWith('/layanan')
  ) {
    return 'catalog';
  }

  return 'kolam';
}

function getDashboardRouteModuleLabel(module: AppModule) {
  if (module === 'sales') {
    return 'Sales';
  }

  if (module === 'catalog') {
    return 'Katalog';
  }

  return 'Kolam';
}
