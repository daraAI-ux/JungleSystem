import React from 'react';
import {
  getShellModuleRouteIndex,
  type AppModule,
  type ShellModuleRouteEntry,
} from '../domain/app-shell';
import type { CommandEntry } from '../domain/command-index';
import type { DashboardCustomerVisitConfirmation } from '../domain/dashboard-customer-visit-confirmations';
import type { DashboardSalesGraphRange } from '../domain/dashboard-sales-graph';
import { isKolamBrandRoute } from '../domain/kolam-brand';
import { isKolamCategoryRoute } from '../domain/kolam-category';
import { isKolamComplaintRoute } from '../domain/kolam-complaint';
import { isKolamLayananNativeRoute } from '../domain/kolam-layanan';
import { isKolamCustomFieldRoute } from '../domain/kolam-custom-field';
import { isKolamEnclosureNativeRoute } from '../domain/kolam-enclosure';
import { isKolamIucnStatusRoute } from '../domain/kolam-iucn-status';
import { isKolamLocationRoute } from '../domain/kolam-location';
import { isKolamAppDownloadRoute } from '../domain/kolam-app-download';
import { isKolamMediaRoute } from '../domain/kolam-media';
import { isKolamPackingMaterialRoute } from '../domain/kolam-packing-option';
import { isKolamShippingMethodRoute } from '../domain/kolam-shipping-method';
import { isKolamProductRoute } from '../domain/kolam-product';
import { isKolamProductSerialRoute } from '../domain/kolam-product-serial';
import { isKolamProductionRoute } from '../domain/kolam-production';
import { isKolamPurchaseOrderRoute } from '../domain/kolam-purchase-order';
import { isKolamTagRoute } from '../domain/kolam-tag';
import { isKolamTaskManagerRoute } from '../domain/kolam-task-manager';
import { isKolamSpeciesRoute } from '../domain/kolam-species';
import { isKolamStockTransactionRoute } from '../domain/kolam-stock-transaction';
import { isKolamStockOpnameRoute } from '../domain/kolam-stock-opname';
import { isKolamAdminCashflowSessionRoute } from '../domain/kolam-admin-cashflow-session';
import { isKolamCommissionRoute } from '../domain/kolam-commission';
import {
  isKolamAssetPurchaseRoute,
  isKolamRoutineExpenseRoute,
  isKolamUnexpectedExpenseRoute,
  isKolamUnexpectedIncomeRoute,
} from '../domain/kolam-finance-expense';
import { isKolamBonusRoute } from '../domain/kolam-bonus';
import { isKolamFinanceSummaryRoute } from '../domain/kolam-finance-summary';
import { isKolamFinanceTaxRoute } from '../domain/kolam-finance-tax';
import { isKolamPayrollRoute } from '../domain/kolam-payroll';
import { isKolamPayableRoute } from '../domain/kolam-payable';
import { isKolamReceivableRoute } from '../domain/kolam-receivable';
import { isKolamWalletRoute } from '../domain/kolam-wallet';
import { isKolamCampaignRoute } from '../domain/kolam-campaign';
import { isKolamDaraMarketIntelRoute } from '../domain/kolam-dara-market-intel';
import { isKolamDaraSeoRoute } from '../domain/kolam-dara-seo';
import { isKolamDaraTrainingRoute } from '../domain/kolam-dara-training';
import { isKolamHrRoute } from '../domain/kolam-hr';
import { isKolamPusatAiHubRoute } from '../domain/kolam-pusat-ai';
import { isKolamSalesRoute } from '../domain/kolam-sales';
import { isKolamSourceRoute } from '../domain/kolam-source';
import { isKolamSupplierRoute } from '../domain/kolam-vendor';
import { isKolamTaxonomyRoute } from '../domain/kolam-taxonomy';
import { isKolamTeranuraNativeRoute } from '../domain/kolam-teranura';
import { isKolamProyekRoute } from '../domain/kolam-proyek';
import { isKolamTermsTemplateRoute } from '../domain/kolam-terms-template';
import { isKolamUnitRoute } from '../domain/kolam-unit';
import { isKolamUserRoute } from '../domain/kolam-user';
import { isKolamVoucherRoute } from '../domain/kolam-voucher';
import type { KolamNavigationItem } from '../domain/kolam-navigation';
import {
  getSettingsSurfaceItemByRoute,
  type SettingsTabItem,
} from '../domain/settings-surface';
import type { PluginRouteEntry } from '../domain/unified';
import type { UnifiedSurface } from '../domain/unified';
import type { SyncActivityEntry } from '../domain/sync-activity';
import type { UnifiedDataset } from '../services/unified-data';
import { KolamBrandSurface } from './kolam-brand-surface';
import { KolamCampaignSurface } from './kolam-campaign-surface';
import { KolamCategorySurface } from './kolam-category-surface';
import { KolamDaraMarketIntelSurface } from './kolam-dara-market-intel-surface';
import { KolamDaraSeoSurface } from './kolam-dara-seo-surface';
import { KolamDaraTrainingSurface } from './kolam-dara-training-surface';
import { KolamHrSurface } from './kolam-hr-surface';
import { KolamPusatAiRingkasanSurface } from './kolam-pusat-ai-ringkasan-surface';
import { KolamComplaintSurface } from './kolam-complaint-surface';
import { KolamLayananSurface } from './kolam-layanan-surface';
import { KolamCustomFieldSurface } from './kolam-custom-field-surface';
import { KolamEnclosureSurface } from './kolam-enclosure-surface';
import { KolamIucnStatusSurface } from './kolam-iucn-status-surface';
import { KolamLocationSurface } from './kolam-location-surface';
import { KolamAppDownloadSurface } from './kolam-app-download-surface';
import { KolamMediaLibrarySurface } from './kolam-media-library-surface';
import { KolamPackingMaterialSurface } from './kolam-packing-material-surface';
import { KolamShippingMethodSurface } from './kolam-shipping-method-surface';
import { KolamProductSurface } from './kolam-product-surface';
import { KolamProductSerialSurface } from './kolam-product-serial-surface';
import { KolamProductionSurface } from './kolam-production-surface';
import { KolamPurchaseOrderSurface } from './kolam-purchase-order-surface';
import { KolamSpeciesSurface } from './kolam-species-surface';
import { KolamStockTransactionSurface } from './kolam-stock-transaction-surface';
import { KolamStockOpnameSurface } from './kolam-stock-opname-surface';
import { KolamAdminCashflowSessionSurface } from './kolam-admin-cashflow-session-surface';
import { KolamCommissionSurface } from './kolam-commission-surface';
import {
  KolamAssetPurchaseSurface,
  KolamRoutineExpenseSurface,
  KolamUnexpectedExpenseSurface,
  KolamUnexpectedIncomeSurface,
} from './kolam-finance-expense-list-surface';
import { KolamBonusSurface } from './kolam-bonus-surface';
import { KolamFinanceSummarySurface } from './kolam-finance-summary-surface';
import { KolamFinanceTaxSurface } from './kolam-finance-tax-surface';
import { KolamPayrollSurface } from './kolam-payroll-surface';
import { KolamPayableSurface } from './kolam-payable-surface';
import { KolamReceivableSurface } from './kolam-receivable-surface';
import { KolamWalletSurface } from './kolam-wallet-surface';
import { KolamSalesOpsSurface } from './kolam-sales-ops-surface';
import { KolamSourceSurface } from './kolam-source-surface';
import { KolamSupplierSurface } from './kolam-supplier-surface';
import { KolamTagSurface } from './kolam-tag-surface';
import { KolamTeranuraSurface } from './kolam-teranura-surface';
import { KolamProyekSurface } from './kolam-proyek-surface';
import { KolamTermsTemplateSurface } from './kolam-terms-template-surface';
import { KolamTaxonomySurface } from './kolam-taxonomy-surface';
import { KolamUnitSurface } from './kolam-unit-surface';
import { KolamUserSurface } from './kolam-user-surface';
import { KolamVoucherSurface } from './kolam-voucher-surface';
import { KolamNavigationRouteSurface } from './kolam-navigation-route-surface';
import { KolamModuleRouteLauncher } from './kolam-module-route-launcher';
import { KolamModuleRouteSurface } from './kolam-module-route-surface';
import type { KolamCheckoutWorkspaceProps } from './kolam-pos-workspace-widgets';
import type { KolamRuntimeSurfaceProps } from './kolam-runtime-surface';
import { KolamSurfaceRouteSurface } from './kolam-surface-route-surface';
import {
  KolamCashflowSurface,
  KolamCatalogSurface,
  KolamCheckoutSurface,
  KolamAmSurface,
  KolamCustomerSurface,
  KolamOverviewSurface,
  KolamSalesSurface,
  KolamSettingsSurface,
  KolamTaskManagerSurface,
  type KolamCashflowSurfaceProps,
  type KolamCatalogSurfaceProps,
  type KolamCustomerSurfaceProps,
  type KolamPluginSurfaceProps,
  type KolamSalesSurfaceProps,
} from './kolam-workspace-module-surfaces';

export interface KolamWorkspaceSurfaceProps {
  activeModule: AppModule;
  activeAmSurface?: UnifiedSurface | null;
  activeKolamSurface?: UnifiedSurface | null;
  activeModuleRoute?: ShellModuleRouteEntry | null;
  activeNavigationItem?: KolamNavigationItem | null;
  activePluginRoute?: PluginRouteEntry | null;
  cashflow: KolamCashflowSurfaceProps;
  catalog: KolamCatalogSurfaceProps;
  checkout: KolamCheckoutWorkspaceProps;
  customer: KolamCustomerSurfaceProps;
  dataset: UnifiedDataset;
  plugins: KolamPluginSurfaceProps;
  salesGraphRange?: DashboardSalesGraphRange;
  onCommandSelect?: (command: CommandEntry) => void;
  onCustomerVisitConfirm?: (row: DashboardCustomerVisitConfirmation) => void;
  onDashboardRoute?: (route: string) => void;
  onModuleRouteSelect?: (route: ShellModuleRouteEntry) => void;
  onPluginRouteSelect?: (route: PluginRouteEntry) => void;
  onSelectModule?: (module: AppModule) => void;
  onKolamSurfaceSelect?: (surface: UnifiedSurface) => void;
  onSettingsTabChange?: (tab: SettingsTabItem) => void;
  onSalesGraphRangeSelect?: (range: DashboardSalesGraphRange) => void;
  sales: KolamSalesSurfaceProps;
  syncActivity: SyncActivityEntry[];
  runtime?: KolamRuntimeSurfaceProps;
  onAmSurfaceSelect?: (surface: UnifiedSurface) => void;
}

export function KolamWorkspaceSurfaceComponent({
  activeModule,
  activeAmSurface,
  activeKolamSurface,
  activeModuleRoute,
  activeNavigationItem,
  cashflow,
  catalog,
  checkout,
  customer,
  dataset,
  salesGraphRange,
  onCommandSelect,
  onCustomerVisitConfirm,
  onDashboardRoute,
  onModuleRouteSelect,
  onSelectModule,
  onKolamSurfaceSelect,
  onSettingsTabChange,
  onSalesGraphRangeSelect,
  sales,
  syncActivity,
}: KolamWorkspaceSurfaceProps) {
  const activeRoutePath = activeNavigationItem?.route.split('?')[0] ?? '';

  if (activeRoutePath && isKolamProductRoute(activeRoutePath)) {
    return (
      <KolamProductSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/products'}
      />
    );
  }

  if (activeRoutePath && isKolamSpeciesRoute(activeRoutePath)) {
    return (
      <KolamSpeciesSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/species'}
      />
    );
  }

  if (activeRoutePath && isKolamStockTransactionRoute(activeRoutePath)) {
    return (
      <KolamStockTransactionSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/stock-transaction'}
      />
    );
  }

  if (activeRoutePath && isKolamStockOpnameRoute(activeRoutePath)) {
    return (
      <KolamStockOpnameSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/stock-opname'}
      />
    );
  }

  if (activeRoutePath && isKolamMediaRoute(activeRoutePath)) {
    return (
      <KolamMediaLibrarySurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/media'}
      />
    );
  }

  if (activeRoutePath && isKolamAppDownloadRoute(activeRoutePath)) {
    return <KolamAppDownloadSurface />;
  }

  if (activeRoutePath && isKolamAdminCashflowSessionRoute(activeRoutePath)) {
    return (
      <KolamAdminCashflowSessionSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/cashflow-session'}
      />
    );
  }

  if (activeRoutePath && isKolamPayrollRoute(activeRoutePath)) {
    return (
      <KolamPayrollSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/finance/payroll'}
      />
    );
  }

  if (activeRoutePath && isKolamBonusRoute(activeRoutePath)) {
    return (
      <KolamBonusSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/finance/bonus'}
      />
    );
  }

  if (activeRoutePath && isKolamFinanceTaxRoute(activeRoutePath)) {
    return (
      <KolamFinanceTaxSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/finance/tax'}
      />
    );
  }

  if (activeRoutePath && isKolamDaraTrainingRoute(activeRoutePath)) {
    return (
      <KolamDaraTrainingSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/list-of-users/dara-training'}
      />
    );
  }

  if (activeRoutePath && isKolamHrRoute(activeRoutePath)) {
    return (
      <KolamHrSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/list-of-users/hr'}
      />
    );
  }

  if (activeRoutePath && isKolamFinanceSummaryRoute(activeRoutePath)) {
    return (
      <KolamFinanceSummarySurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/finance'}
      />
    );
  }

  if (activeRoutePath && isKolamRoutineExpenseRoute(activeRoutePath)) {
    return (
      <KolamRoutineExpenseSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/routine-expenses'}
      />
    );
  }

  if (activeRoutePath && isKolamUnexpectedExpenseRoute(activeRoutePath)) {
    return (
      <KolamUnexpectedExpenseSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/unexpected-expense'}
      />
    );
  }

  if (activeRoutePath && isKolamUnexpectedIncomeRoute(activeRoutePath)) {
    return (
      <KolamUnexpectedIncomeSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/unexpected-income'}
      />
    );
  }

  if (activeRoutePath && isKolamAssetPurchaseRoute(activeRoutePath)) {
    return (
      <KolamAssetPurchaseSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/asset-purchase'}
      />
    );
  }

  if (activeRoutePath && isKolamCommissionRoute(activeRoutePath)) {
    return (
      <KolamCommissionSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/commissions'}
      />
    );
  }

  if (activeRoutePath && isKolamPayableRoute(activeRoutePath)) {
    return (
      <KolamPayableSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/payable'}
      />
    );
  }

  if (activeRoutePath && isKolamReceivableRoute(activeRoutePath)) {
    return (
      <KolamReceivableSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/receivable'}
      />
    );
  }

  if (activeRoutePath && isKolamWalletRoute(activeRoutePath)) {
    return (
      <KolamWalletSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/wallet'}
      />
    );
  }

  if (activeRoutePath && isKolamSalesRoute(activeRoutePath)) {
    return (
      <KolamSalesOpsSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/sales'}
      />
    );
  }

  if (activeRoutePath && isKolamCampaignRoute(activeRoutePath)) {
    return (
      <KolamCampaignSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/campaign'}
      />
    );
  }

  if (activeRoutePath && isKolamVoucherRoute(activeRoutePath)) {
    return (
      <KolamVoucherSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/vouchers'}
      />
    );
  }

  if (activeRoutePath && isKolamCustomerRoute(activeRoutePath)) {
    return (
      <KolamCustomerSurface
        customer={customer}
        customers={dataset.customers}
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/customers'}
      />
    );
  }

  if (activeRoutePath && isKolamTermsTemplateRoute(activeRoutePath)) {
    return (
      <KolamTermsTemplateSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/terms-templates'}
      />
    );
  }

  if (activeRoutePath && isKolamProyekRoute(activeRoutePath)) {
    return (
      <KolamProyekSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/proyek'}
      />
    );
  }

  if (activeRoutePath && isKolamTaskManagerRoute(activeRoutePath)) {
    return (
      <KolamTaskManagerSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/task-manager'}
      />
    );
  }

  const activeModuleRoutePath = activeModuleRoute?.route
    ? activeModuleRoute.route.startsWith('/')
      ? activeModuleRoute.route
      : `/${activeModuleRoute.route}`
    : '';
  if (
    activeModuleRoutePath &&
    isKolamCampaignRoute(activeModuleRoutePath)
  ) {
    return (
      <KolamCampaignSurface
        onRouteChange={onDashboardRoute}
        route={activeModuleRoutePath}
      />
    );
  }

  if (
    activeModuleRoutePath &&
    isKolamVoucherRoute(activeModuleRoutePath)
  ) {
    return (
      <KolamVoucherSurface
        onRouteChange={onDashboardRoute}
        route={activeModuleRoutePath}
      />
    );
  }

  if (
    activeNavigationItem &&
    isKolamPusatAiHubRoute(activeNavigationItem.route)
  ) {
    return (
      <KolamPusatAiRingkasanSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem.route}
      />
    );
  }

  if (activeRoutePath && isKolamDaraMarketIntelRoute(activeRoutePath)) {
    return (
      <KolamDaraMarketIntelSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/campaign/dara-market-intel'}
      />
    );
  }

  if (activeRoutePath && isKolamDaraSeoRoute(activeRoutePath)) {
    return (
      <KolamDaraSeoSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/campaign/dara-seo'}
      />
    );
  }

  if (activeRoutePath && isKolamTeranuraNativeRoute(activeRoutePath)) {
    return (
      <KolamTeranuraSurface
        onRouteChange={onDashboardRoute}
        route={activeNavigationItem?.route ?? '/teranura'}
      />
    );
  }

  switch (activeModule) {
    case 'kolam':
      if (activeNavigationItem && activeNavigationItem.route !== '/') {
        if (isKolamBrandRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamBrandSurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }

        if (isKolamSourceRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamSourceSurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }

        if (isKolamComplaintRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamComplaintSurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }

        if (isKolamLayananNativeRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamLayananSurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }

        if (isKolamCategoryRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamCategorySurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }

        if (isKolamTagRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamTagSurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }
        if (isKolamSupplierRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamSupplierSurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }
        if (isKolamPurchaseOrderRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamPurchaseOrderSurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }
        if (isKolamProductionRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamProductionSurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }
        if (isKolamEnclosureNativeRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamEnclosureSurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }
        if (isKolamProductSerialRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamProductSerialSurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }
        if (isKolamSpeciesRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamSpeciesSurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }
        if (isKolamTeranuraNativeRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamTeranuraSurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }
        if (isKolamTaxonomyRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamTaxonomySurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }
        if (isKolamIucnStatusRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamIucnStatusSurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }

        if (isKolamLocationRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamLocationSurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }

        if (isKolamCustomFieldRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamCustomFieldSurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }

        if (isKolamPackingMaterialRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamPackingMaterialSurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }

        if (isKolamShippingMethodRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamShippingMethodSurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }

        if (isKolamUnitRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamUnitSurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }

        if (isKolamUserRoute(activeNavigationItem.route)) {
          return (
            <KolamUserSurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }

        if (isKolamCampaignRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamCampaignSurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }

        if (isKolamVoucherRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamVoucherSurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }

        if (isKolamTaskManagerRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamTaskManagerSurface
              onRouteChange={onDashboardRoute}
              route={activeNavigationItem.route}
            />
          );
        }

        return (
          <KolamNavigationRouteSurface
            dataset={dataset}
            item={activeNavigationItem}
            onRouteChange={onDashboardRoute}
          />
        );
      }

      if (activeKolamSurface) {
        return (
          <KolamSurfaceRouteSurface
            dataset={dataset}
            surface={activeKolamSurface}
          />
        );
      }

      return (
        <KolamOverviewSurface
          dataset={dataset}
          onCommandSelect={onCommandSelect}
          moduleId="kolam"
          onCustomerVisitConfirm={onCustomerVisitConfirm}
          onDashboardRoute={onDashboardRoute}
          onSelectModule={onSelectModule}
          onSurfaceSelect={onKolamSurfaceSelect}
          onSalesGraphRangeSelect={onSalesGraphRangeSelect}
          salesGraphRange={salesGraphRange}
        />
      );
    case 'settings':
      if (activeNavigationItem) {
        const settingsSurface = getSettingsSurfaceItemByRoute(
          activeNavigationItem.route,
        );

        if (!settingsSurface) {
          return (
            <KolamNavigationRouteSurface
              dataset={dataset}
              item={activeNavigationItem}
              onRouteChange={onDashboardRoute}
            />
          );
        }

        return (
          <KolamSettingsSurface
            key={settingsSurface.id}
            activeSurfaceId={settingsSurface.id}
            onActiveTabChange={onSettingsTabChange}
            syncActivity={syncActivity}
          />
        );
      }

      return (
        <KolamSettingsSurface
          onActiveTabChange={onSettingsTabChange}
          syncActivity={syncActivity}
        />
      );
    case 'checkout':
      return (
        <KolamCheckoutSurface
          checkout={checkout}
          customer={customer}
          onBackToCenter={() => onSelectModule?.('kolam')}
        />
      );
    case 'catalog':
      return renderPosRouteContext(
        activeModule,
        dataset,
        activeNavigationItem,
        activeModuleRoute,
        <KolamCatalogSurface catalog={catalog} />,
        onModuleRouteSelect,
      );
    case 'sales':
      return renderPosRouteContext(
        activeModule,
        dataset,
        activeNavigationItem,
        activeModuleRoute,
        <KolamSalesSurface sales={sales} />,
        onModuleRouteSelect,
      );
    case 'cashflow':
      return renderPosRouteContext(
        activeModule,
        dataset,
        activeNavigationItem,
        activeModuleRoute,
        <KolamCashflowSurface
          activeSession={dataset.activeSession}
          cashflow={cashflow}
        />,
        onModuleRouteSelect,
      );
    case 'customer':
      if (activeNavigationItem?.route.split('?')[0]?.startsWith('/customers')) {
        return (
          <KolamCustomerSurface
            customer={customer}
            customers={dataset.customers}
            onRouteChange={onDashboardRoute}
            route={activeNavigationItem.route}
          />
        );
      }

      return renderPosRouteContext(
        activeModule,
        dataset,
        activeNavigationItem,
        activeModuleRoute,
        <KolamCustomerSurface
          customer={customer}
          customers={dataset.customers}
          onRouteChange={onDashboardRoute}
          route={activeNavigationItem?.route}
        />,
        onModuleRouteSelect,
      );
    case 'am':
      return (
        <KolamAmSurface
          activeSurface={activeAmSurface}
          activeModuleRoute={activeModuleRoute}
          dataset={dataset}
          onBackToCenter={() => onSelectModule?.('kolam')}
          onModuleRouteSelect={onModuleRouteSelect}
        />
      );
    default:
      return null;
  }
}

function renderWithNavigationRoute(
  dataset: UnifiedDataset,
  item: KolamNavigationItem | null | undefined,
  surface: React.ReactNode,
  onRouteChange?: (route: string) => void,
) {
  if (!item) {
    return surface;
  }

  return (
    <>
      <KolamNavigationRouteSurface
        dataset={dataset}
        item={item}
        onRouteChange={onRouteChange}
      />
      {surface}
    </>
  );
}

function renderWithModuleRoute(
  dataset: UnifiedDataset,
  route: ShellModuleRouteEntry | null | undefined,
  surface: React.ReactNode,
) {
  if (!route) {
    return surface;
  }

  return (
    <>
      <KolamModuleRouteSurface dataset={dataset} route={route} />
      {surface}
    </>
  );
}

function renderWithPosModuleRoute(
  moduleId: AppModule,
  dataset: UnifiedDataset,
  route: ShellModuleRouteEntry | null | undefined,
  surface: React.ReactNode,
  onRouteSelect?: (route: ShellModuleRouteEntry) => void,
) {
  const routes = getShellModuleRouteIndex({ areas: ['pos'] }).filter(
    entry => entry.moduleId === moduleId,
  );

  return renderWithModuleRoute(
    dataset,
    route,
    <>
      <KolamModuleRouteLauncher
        label={`${getPosModuleLabel(moduleId)} Route Launcher`}
        routes={routes}
        onRouteSelect={onRouteSelect}
      />
      {surface}
    </>,
  );
}

function renderPosRouteContext(
  moduleId: AppModule,
  dataset: UnifiedDataset,
  navigationItem: KolamNavigationItem | null | undefined,
  moduleRoute: ShellModuleRouteEntry | null | undefined,
  surface: React.ReactNode,
  onRouteSelect?: (route: ShellModuleRouteEntry) => void,
) {
  if (navigationItem) {
    return renderWithNavigationRoute(
      dataset,
      navigationItem,
      renderWithPosModuleRoute(moduleId, dataset, null, surface, onRouteSelect),
    );
  }

  return renderWithPosModuleRoute(
    moduleId,
    dataset,
    moduleRoute,
    surface,
    onRouteSelect,
  );
}

function isKolamCustomerRoute(route: string) {
  const routePath = route.split('?')[0];
  return routePath === '/customers' || routePath.startsWith('/customers/');
}

function getPosModuleLabel(moduleId: AppModule) {
  switch (moduleId) {
    case 'catalog':
      return 'Katalog';
    case 'sales':
      return 'Sales';
    case 'cashflow':
      return 'Cashflow';
    case 'customer':
      return 'Customer';
    case 'checkout':
    default:
      return 'Checkout';
  }
}

export const KolamWorkspaceSurface = React.memo(KolamWorkspaceSurfaceComponent);
KolamWorkspaceSurface.displayName = 'KolamWorkspaceSurface';
