import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  KolamDashboardCountStrip,
  KolamDashboardCustomerVisitConfirmations,
  KolamDashboardPendingOrders,
  KolamDashboardRightRail,
  KolamDashboardSalesGraphCard,
  KolamDashboardStatsStrip,
} from '../src/components/kolam-dashboard-widgets';
import {getDashboardCountCards} from '../src/domain/dashboard-counts';
import {
  getDashboardCustomerVisitConfirmations,
  getDashboardCustomerVisitConfirmationsDescriptor,
} from '../src/domain/dashboard-customer-visit-confirmations';
import {
  getDashboardPendingOrders,
  getDashboardPendingOrdersDescriptor,
} from '../src/domain/dashboard-pending-orders';
import {getDashboardRailSections} from '../src/domain/dashboard-rail';
import {getDashboardSalesGraph} from '../src/domain/dashboard-sales-graph';
import {getDashboardStatCards} from '../src/domain/dashboard-stats';
import {seedUnifiedDataset} from '../src/services/unified-data';

function renderText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAllByType(Text)
    .flatMap(node => flattenText(node.props.children));
}

function flattenText(value: React.ReactNode): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenText);
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }

  return [];
}

describe('Kolam dashboard widgets barrel', () => {
  it('keeps the existing dashboard widget import surface working', async () => {
    const countCards = getDashboardCountCards(seedUnifiedDataset);
    const statCards = getDashboardStatCards(seedUnifiedDataset);
    const sections = getDashboardRailSections(seedUnifiedDataset);
    const visitConfirmations = getDashboardCustomerVisitConfirmations(seedUnifiedDataset);
    const visitDescriptor = getDashboardCustomerVisitConfirmationsDescriptor();
    const graph = getDashboardSalesGraph(seedUnifiedDataset);
    const pendingOrdersDescriptor = getDashboardPendingOrdersDescriptor();
    const pendingOrdersPanel = getDashboardPendingOrders(seedUnifiedDataset);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamDashboardCountStrip cards={countCards} />
          <KolamDashboardStatsStrip cards={statCards} />
          <KolamDashboardRightRail sections={sections} />
          <KolamDashboardCustomerVisitConfirmations
            descriptor={visitDescriptor}
            rows={visitConfirmations}
          />
          <KolamDashboardSalesGraphCard graph={graph} />
          <KolamDashboardPendingOrders
            descriptor={pendingOrdersDescriptor}
            panel={pendingOrdersPanel}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        countCards[0].label,
        countCards[0].subLabel,
        statCards[0].label,
        sections[0].title,
        visitConfirmations[0].actionLabel,
        graph.title,
      ]),
    );
  });
});



