import {useMemo} from 'react';
import type {ShellModule} from '../domain/app-shell';
import {
  getDashboardCountCards,
  getDashboardCountSectionDescriptor,
  type DashboardCountCard,
  type DashboardCountSectionDescriptor,
} from '../domain/dashboard-counts';
import {
  getDashboardPendingOrders,
  getDashboardPendingOrdersDescriptor,
  type DashboardPendingOrdersDescriptor,
  type DashboardPendingOrdersPanel,
} from '../domain/dashboard-pending-orders';
import {
  getDashboardRailSections,
  type DashboardRailSection,
} from '../domain/dashboard-rail';
import {
  getDashboardSalesGraph,
  type DashboardSalesGraph,
  type DashboardSalesGraphRange,
} from '../domain/dashboard-sales-graph';
import {
  getDashboardStatCards,
  type DashboardStatCard,
} from '../domain/dashboard-stats';
import type {UnifiedDataset} from '../services/unified-data';

export interface KolamDashboardSectionsController {
  countCards: DashboardCountCard[];
  countDescriptor: DashboardCountSectionDescriptor;
  isKolamDashboard: boolean;
  pendingOrdersDescriptor: DashboardPendingOrdersDescriptor | null;
  pendingOrdersPanel: DashboardPendingOrdersPanel | null;
  railSections: DashboardRailSection[];
  salesGraph: DashboardSalesGraph | null;
  salesGraphRange: DashboardSalesGraphRange;
  statCards: DashboardStatCard[];
}

export function useKolamDashboardSectionsController({
  dataset,
  module,
  salesGraphRange = 'month',
}: {
  dataset: UnifiedDataset;
  module: Pick<ShellModule, 'id'>;
  salesGraphRange?: DashboardSalesGraphRange;
}): KolamDashboardSectionsController {
  const isKolamDashboard = module.id === 'kolam';

  return useMemo(() => {
    if (!isKolamDashboard) {
      return {
        countCards: [],
        countDescriptor: getDashboardCountSectionDescriptor(),
        isKolamDashboard,
        pendingOrdersDescriptor: null,
        pendingOrdersPanel: null,
        railSections: [],
        salesGraph: null,
        salesGraphRange,
        statCards: [],
      };
    }

    return {
      countCards: getDashboardCountCards(dataset),
      countDescriptor: getDashboardCountSectionDescriptor(),
      isKolamDashboard,
      pendingOrdersDescriptor: getDashboardPendingOrdersDescriptor(),
      pendingOrdersPanel: getDashboardPendingOrders(dataset),
      railSections: getDashboardRailSections(dataset),
      salesGraph: getDashboardSalesGraph(dataset, salesGraphRange),
      salesGraphRange,
      statCards: getDashboardStatCards(dataset),
    };
  }, [dataset, isKolamDashboard, salesGraphRange]);
}
