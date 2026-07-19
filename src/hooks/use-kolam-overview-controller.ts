import {useMemo} from 'react';
import {
  getDashboardCustomerVisitConfirmations,
  getDashboardCustomerVisitConfirmationsDescriptor,
} from '../domain/dashboard-customer-visit-confirmations';
import {amSurfaces, kolamSurfaces, pluginRegistry} from '../domain/unified';
import {
  getUnifiedOverviewContext,
  type KolamUnifiedOverviewPanelProps,
} from '../components/kolam-unified-overview-panel-types';
import {useKolamDashboardSectionsController} from './use-kolam-dashboard-sections-controller';

export function useKolamOverviewController({
  dataset,
  module,
  plugins = pluginRegistry,
  salesGraphRange,
}: Pick<
  KolamUnifiedOverviewPanelProps,
  'dataset' | 'module' | 'plugins' | 'salesGraphRange'
>) {
  const context = useMemo(
    () => getUnifiedOverviewContext({dataset, module, plugins}),
    [dataset, module, plugins],
  );

  const surfaces = useMemo(() => {
    if (module.id === 'kolam') {
      return kolamSurfaces;
    }

    if (module.id === 'am') {
      return amSurfaces;
    }

    return [];
  }, [module.id]);

  const customerVisitPanel = useMemo(
    () => ({
      descriptor: getDashboardCustomerVisitConfirmationsDescriptor(),
      isVisible: module.id === 'kolam',
      rows:
        module.id === 'kolam'
          ? getDashboardCustomerVisitConfirmations(context.dataset)
          : [],
    }),
    [context.dataset, module.id],
  );
  const dashboardSections = useKolamDashboardSectionsController({
    dataset: context.dataset,
    module: context.module,
    salesGraphRange: salesGraphRange ?? context.dataset.kolam.dashboardRange,
  });

  return {
    context,
    customerVisitPanel,
    dashboardSections,
    showModulePanelBelow: module.id === 'kolam',
    showRuntimeFooter: module.id !== 'kolam',
    surfaces,
  };
}
