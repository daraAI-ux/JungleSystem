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
import { isKolamCustomFieldRoute } from '../domain/kolam-custom-field';
import { isKolamIucnStatusRoute } from '../domain/kolam-iucn-status';
import { isKolamTagRoute } from '../domain/kolam-tag';
import { isKolamTaxonomyRoute } from '../domain/kolam-taxonomy';
import { isKolamUnitRoute } from '../domain/kolam-unit';
import type { KolamNavigationItem } from '../domain/kolam-navigation';
import { getSettingsSurfaceItemByRoute } from '../domain/settings-surface';
import type { PluginRouteEntry } from '../domain/unified';
import type { UnifiedSurface } from '../domain/unified';
import type { SyncActivityEntry } from '../domain/sync-activity';
import type { UnifiedDataset } from '../services/unified-data';
import { KolamBrandSurface } from './kolam-brand-surface';
import { KolamCategorySurface } from './kolam-category-surface';
import { KolamCustomFieldSurface } from './kolam-custom-field-surface';
import { KolamIucnStatusSurface } from './kolam-iucn-status-surface';
import { KolamTagSurface } from './kolam-tag-surface';
import { KolamTaxonomySurface } from './kolam-taxonomy-surface';
import { KolamUnitSurface } from './kolam-unit-surface';
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
  KolamPluginSurface,
  KolamPreparationSurface,
  KolamSalesSurface,
  KolamSettingsSurface,
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
  onSalesGraphRangeSelect?: (range: DashboardSalesGraphRange) => void;
  sales: KolamSalesSurfaceProps;
  syncActivity: SyncActivityEntry[];
  runtime?: KolamRuntimeSurfaceProps;
  onAmSurfaceSelect?: (surface: UnifiedSurface) => void;
}

export function KolamWorkspaceSurface({
  activeModule,
  activeAmSurface,
  activeKolamSurface,
  activeModuleRoute,
  activeNavigationItem,
  activePluginRoute,
  cashflow,
  catalog,
  checkout,
  customer,
  dataset,
  plugins,
  salesGraphRange,
  onCommandSelect,
  onCustomerVisitConfirm,
  onDashboardRoute,
  onAmSurfaceSelect,
  onModuleRouteSelect,
  onPluginRouteSelect,
  onSelectModule,
  onKolamSurfaceSelect,
  onSalesGraphRangeSelect,
  sales,
  syncActivity,
  runtime,
}: KolamWorkspaceSurfaceProps) {
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

        if (isKolamCustomFieldRoute(activeNavigationItem.route.split('?')[0])) {
          return (
            <KolamCustomFieldSurface
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

        return (
          <KolamNavigationRouteSurface
            dataset={dataset}
            item={activeNavigationItem}
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
            />
          );
        }

        return (
          <KolamSettingsSurface
            key={settingsSurface.id}
            activeSurfaceId={settingsSurface.id}
            syncActivity={syncActivity}
          />
        );
      }

      return <KolamSettingsSurface syncActivity={syncActivity} />;
    case 'checkout':
      return renderWithPosModuleRoute(
        activeModule,
        dataset,
        activeModuleRoute,
        <KolamCheckoutSurface checkout={checkout} />,
        onModuleRouteSelect,
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
      return renderPosRouteContext(
        activeModule,
        dataset,
        activeNavigationItem,
        activeModuleRoute,
        <KolamCustomerSurface
          customer={customer}
          customers={dataset.customers}
        />,
        onModuleRouteSelect,
      );
    case 'am':
      return renderWithModuleRoute(
        dataset,
        activeModuleRoute,
        <KolamAmSurface
          activeSurface={activeAmSurface}
          dataset={dataset}
          onSurfaceSelect={onAmSurfaceSelect}
        />,
      );
    case 'plugins':
      return (
        <KolamPluginSurface
          activePluginRoute={activePluginRoute}
          dataset={dataset}
          onPluginRouteSelect={onPluginRouteSelect}
          plugins={plugins}
        />
      );
    case 'preparation':
      return (
        <KolamPreparationSurface
          dataset={dataset}
          runtime={runtime}
          onCommandSelect={onCommandSelect}
          onSelectModule={onSelectModule}
          onSurfaceSelect={onKolamSurfaceSelect}
          salesGraphRange={salesGraphRange}
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
) {
  if (!item) {
    return surface;
  }

  return (
    <>
      <KolamNavigationRouteSurface dataset={dataset} item={item} />
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



