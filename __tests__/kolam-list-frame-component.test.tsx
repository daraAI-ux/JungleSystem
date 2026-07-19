import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamListFrame} from '../src/components/kolam-list-frame';
import {getDashboardCountVisualContract} from '../src/domain/dashboard-counts';
import {getDashboardCustomerVisitConfirmationsVisualContract} from '../src/domain/dashboard-customer-visit-confirmations';
import {getDashboardHeaderVisualContract} from '../src/domain/dashboard-header';
import {getDashboardLayoutVisualContract} from '../src/domain/dashboard-layout';
import {getDashboardPendingOrdersVisualContract} from '../src/domain/dashboard-pending-orders';
import {getDashboardStatsVisualContract} from '../src/domain/dashboard-stats';

describe('KolamListFrame', () => {
  it('renders shared wrap list chrome and keeps children ordered', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamListFrame accessibilityLabel="runtime cards">
          <Text>One</Text>
          <Text>Two</Text>
        </KolamListFrame>,
      );
    });

    expect(renderer!.root.findByProps({accessibilityLabel: 'runtime cards'})).toBeTruthy();
    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'One',
      'Two',
    ]);
    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({flexWrap: 'wrap'}),
    );
  });

  it('supports metric list spacing variant', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamListFrame variant="metric">
          <Text>Metric</Text>
        </KolamListFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({gap: 12}),
    );
  });

  it('uses the live Beranda KPI wrap grid contract', async () => {
    const visual = getDashboardStatsVisualContract();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamListFrame variant="dashboardMetric">
          <Text>Omzet Hari ini</Text>
        </KolamListFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({
        flexWrap: 'wrap',
        gap: visual.grid.gap,
      }),
    );
    expect(visual.grid.columns).toEqual({base: 1, tablet: 2, desktop: 4});
  });

  it('uses the live Beranda main gap for operational stacks', async () => {
    const visual = getDashboardLayoutVisualContract();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamListFrame variant="operationalStack">
          <Text>Sales graph</Text>
          <Text>Pending orders</Text>
        </KolamListFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({gap: visual.main.gapY}),
    );
  });

  it('uses the live InventoryCounts grid gap for dashboard count lists', async () => {
    const visual = getDashboardCountVisualContract();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamListFrame variant="dashboardCount">
          <Text>Produk</Text>
          <Text>Bahan baku</Text>
        </KolamListFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({gap: visual.cardSpacing}),
    );
    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({flexWrap: 'wrap'}),
    );
    expect(visual.gridColumns).toEqual({base: 1, tablet: 2, desktop: 4});
  });

  it('uses the live PendingOrders status badge group contract', async () => {
    const visual = getDashboardPendingOrdersVisualContract();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamListFrame variant="pendingOrdersStatusBadges">
          <Text>Status</Text>
        </KolamListFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({
        marginLeft: visual.row.statusGroupMarginLeft,
        justifyContent: 'flex-end',
        columnGap: visual.row.badgesGapX,
        rowGap: visual.row.badgesGapY,
      }),
    );
  });

  it('uses the live DashboardHeader action group contract', async () => {
    const visual = getDashboardHeaderVisualContract();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamListFrame variant="dashboardHeaderActions">
          <Text>Produk Baru</Text>
        </KolamListFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({
        gap: visual.actions.gapX,
        flexWrap: visual.actions.flexWrap,
        flexShrink: visual.actions.flexShrink,
      }),
    );
  });

  it('uses the live CustomerVisitConfirmations list contract', async () => {
    const visual = getDashboardCustomerVisitConfirmationsVisualContract();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamListFrame variant="dashboardVisitConfirmationsList">
          <Text>Kunjungan layanan</Text>
        </KolamListFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({
        borderTopWidth: visual.list.borderTopWidth,
        gap: visual.list.gapY,
        paddingHorizontal: visual.list.paddingX,
        paddingVertical: visual.list.paddingY,
      }),
    );
  });
});
