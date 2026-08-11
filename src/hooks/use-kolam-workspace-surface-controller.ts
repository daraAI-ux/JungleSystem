import {useCallback, useMemo} from 'react';
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
  activeCategory,
  activeType,
  afterDiscount,
  canCloseCashflow,
  canCreateDraft,
  canOpenCashflow,
  cashflowPreview,
  cashflowShiftName,
  catalogCategories,
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
  onCategoryChange,
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
  onSettingsTabChange,
  onDiscountAmountChange,
  onDiscountTypeChange,
  onVoucherCodeChange,
  onGlobalDiscountChange,
  onGlobalDiscountTypeChange,
  onOpenCashflow,
  onPluginSearchChange,
  onQuantityChange,
  onReplaceCheckout,
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
  activeCategory?: WorkspaceCheckoutProps['activeCategory'];
  activeType: WorkspaceCheckoutProps['activeType'];
  afterDiscount: WorkspaceCheckoutProps['afterDiscount'];
  canCloseCashflow: WorkspaceCashflowProps['canClose'];
  canCreateDraft: WorkspaceCheckoutProps['canCreateDraft'];
  canOpenCashflow: WorkspaceCashflowProps['canOpen'];
  cashflowPreview: WorkspaceCashflowProps['cashflowPreview'];
  cashflowShiftName: WorkspaceCashflowProps['cashflowShiftName'];
  catalogCategories?: WorkspaceCheckoutProps['catalogCategories'];
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
  onCategoryChange?: WorkspaceCheckoutProps['onCategoryChange'];
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
  onSettingsTabChange?: KolamWorkspaceSurfaceProps['onSettingsTabChange'];
  onDiscountAmountChange: WorkspaceCheckoutProps['onDiscountAmountChange'];
  onDiscountTypeChange: WorkspaceCheckoutProps['onDiscountTypeChange'];
  onVoucherCodeChange: WorkspaceCheckoutProps['onVoucherCodeChange'];
  onGlobalDiscountChange: WorkspaceCheckoutProps['onGlobalDiscountChange'];
  onGlobalDiscountTypeChange: WorkspaceCheckoutProps['onGlobalDiscountTypeChange'];
  onOpenCashflow: WorkspaceCashflowProps['onOpenCashflow'];
  onPluginSearchChange: WorkspacePluginsProps['onPluginSearchChange'];
  onQuantityChange: WorkspaceCheckoutProps['onQuantityChange'];
  onReplaceCheckout?: WorkspaceCheckoutProps['onReplaceCheckout'];
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
      if (isTeamChatRoute(route)) {
        onDashboardRouteContext?.(route);
        return;
      }

      const module = getDashboardRouteModule(route);

      onSelectModule(module);
      onDashboardRouteContext?.(route);
      onMessage(
        `${getDashboardRouteModuleLabel(module)} native membuka ${route}.`,
      );
    },
    [onDashboardRouteContext, onMessage, onSelectModule],
  );

  const checkoutProps = useMemo<WorkspaceCheckoutProps>(
    () => ({
      activeSession: dataset.activeSession,
      activeCategory,
      activeType,
      afterDiscount,
      canCreateDraft,
      catalog: dataset.catalog,
      catalogCategories,
      catalogSearch,
      checkout,
      customers: dataset.customers,
      filteredCatalog,
      finalTotal,
      isCreatingSale,
      onAddToCart,
      onCatalogSearchChange,
      onCategoryChange,
      onClearCart,
      onCreateSaleDraft,
      onDiscountAmountChange,
      onDiscountTypeChange,
      onVoucherCodeChange,
      onGlobalDiscountChange,
      onGlobalDiscountTypeChange,
      onQuantityChange,
      onReplaceCheckout,
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
    }),
    [
      activeCategory,
      activeType,
      afterDiscount,
      canCreateDraft,
      catalogCategories,
      catalogSearch,
      checkout,
      dataset.catalog,
      dataset.customers,
      dataset.activeSession,
      dataset.paymentMethods,
      dataset.recentSales,
      filteredCatalog,
      finalTotal,
      isCreatingSale,
      onAddToCart,
      onCatalogSearchChange,
      onCategoryChange,
      onClearCart,
      onCreateSaleDraft,
      onDiscountAmountChange,
      onDiscountTypeChange,
      onVoucherCodeChange,
      onGlobalDiscountChange,
      onGlobalDiscountTypeChange,
      onQuantityChange,
      onReplaceCheckout,
      onSelectCustomer,
      onSelectPaymentMethod,
      onShippingCostChange,
      onTypeChange,
      selectedCustomer,
      selectedPayment,
      subtotal,
      workflowSteps,
    ],
  );

  const catalogProps = useMemo<WorkspaceCatalogProps>(
    () => ({
      catalogSearch,
      filteredCatalog,
      onCatalogSearchChange,
    }),
    [catalogSearch, filteredCatalog, onCatalogSearchChange],
  );

  const salesProps = useMemo<WorkspaceSalesProps>(
    () => ({
      sales: dataset.recentSales,
      updatingSaleId,
      onStatusChange,
    }),
    [dataset.recentSales, onStatusChange, updatingSaleId],
  );

  const cashflowProps = useMemo<WorkspaceCashflowProps>(
    () => ({
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
    }),
    [
      canCloseCashflow,
      canOpenCashflow,
      cashflowPreview,
      cashflowShiftName,
      isClosingCashflow,
      isLoadingCashflowPreview,
      isOpeningCashflow,
      onCashflowShiftNameChange,
      onCloseCashflow,
      onOpenCashflow,
    ],
  );

  const customerProps = useMemo<WorkspaceCustomerProps>(
    () => ({
      customerForm,
      isCreatingCustomer,
      onCreateCustomer,
      onCustomerFormChange,
    }),
    [customerForm, isCreatingCustomer, onCreateCustomer, onCustomerFormChange],
  );

  const pluginsProps = useMemo<WorkspacePluginsProps>(
    () => ({
      filteredPlugins,
      pluginSearch,
      onPluginSearchChange,
    }),
    [filteredPlugins, onPluginSearchChange, pluginSearch],
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
    checkout: checkoutProps,
    catalog: catalogProps,
    sales: salesProps,
    cashflow: cashflowProps,
    customer: customerProps,
    plugins: pluginsProps,
    onAmSurfaceSelect,
    onCommandSelect,
    onDashboardRoute: handleDashboardRoute,
    onKolamSurfaceSelect,
    onModuleRouteSelect,
    onPluginRouteSelect,
    onSelectModule,
    onSettingsTabChange,
    onCustomerVisitConfirm,
    onSalesGraphRangeSelect,
    salesGraphRange,
  });
}

function isTeamChatRoute(route: string): boolean {
  const path = route.trim().split('?')[0]?.replace(/\/+$/, '');
  return path === '/team-chat';
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
    return 'kolam';
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
