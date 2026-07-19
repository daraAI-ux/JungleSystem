import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamDashboardPendingOrders} from '../src/components/kolam-dashboard-pending-orders-widgets';
import {KolamPressable} from '../src/components/kolam-pressable';
import {
  getDashboardPendingOrders,
  getDashboardPendingOrdersDescriptor,
  getDashboardPendingOrdersVisualContract,
} from '../src/domain/dashboard-pending-orders';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';
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

describe('KolamDashboardPendingOrders', () => {
  it('renders pending order sections from domain data', async () => {
    const descriptor = getDashboardPendingOrdersDescriptor();
    const panel = getDashboardPendingOrders(seedUnifiedDataset);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamDashboardPendingOrders descriptor={descriptor} panel={panel} />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        descriptor.title,
        descriptor.actionLabel,
        panel.description,
        panel.sections[0].title + ' (1)',
        panel.sections[0].items[0].invoiceCode,
        panel.sections[0].items[0].totalLabel,
      ]),
    );

    const visual = getDashboardPendingOrdersVisualContract();
    const actionText = renderer!.root
      .findAllByType(Text)
      .find(node => flattenText(node.props.children).includes(descriptor.actionLabel));
    const header = renderer!.root.findAll(node => {
      const style = StyleSheet.flatten(node.props.style);

      return style?.paddingHorizontal === visual.header.paddingX;
    })[0];

    expect(actionText?.props.style).toEqual(
      expect.objectContaining({color: V.colors.primary}),
    );
    expect(header).toBeTruthy();

    const sectionHeader = renderer!.root.findAll(node => {
      const style = StyleSheet.flatten(node.props.style);

      return (
        style?.backgroundColor ===
        V.colors[visual.content.sectionHeaderBackground]
      );
    })[0];

    expect(sectionHeader).toBeTruthy();

    const row = renderer!.root.findAll(node => {
      const style = StyleSheet.flatten(node.props.style);

      return (
        style?.paddingHorizontal === visual.content.rowPaddingX &&
        style?.columnGap === visual.content.rowGapX
      );
    })[0];
    const statusBadgeGroup = renderer!.root.findAll(node => {
      const style = StyleSheet.flatten(node.props.style);

      return style?.marginLeft === visual.row.statusGroupMarginLeft;
    })[0];

    expect(StyleSheet.flatten(row.props.style)).toEqual(
      expect.objectContaining({
        flexWrap: 'wrap',
        columnGap: visual.content.rowGapX,
        rowGap: visual.content.rowGapY,
      }),
    );
    expect(StyleSheet.flatten(statusBadgeGroup.props.style)).toEqual(
      expect.objectContaining({
        marginLeft: visual.row.statusGroupMarginLeft,
        justifyContent: 'flex-end',
        columnGap: visual.row.badgesGapX,
        rowGap: visual.row.badgesGapY,
      }),
    );
  });

  it('renders the live empty text when there are no pending sections', async () => {
    const descriptor = getDashboardPendingOrdersDescriptor();
    const panel = getDashboardPendingOrders({
      ...seedUnifiedDataset,
      recentSales: seedUnifiedDataset.recentSales.map(sale => ({
        ...sale,
        status: 'paid',
      })),
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamDashboardPendingOrders descriptor={descriptor} panel={panel} />
        </View>,
      );
    });

    expect(renderText(renderer!)).toContain(panel.emptyLabel);
  });

  it('routes the live PendingOrders links through reusable pressable primitives', async () => {
    const descriptor = getDashboardPendingOrdersDescriptor();
    const panel = getDashboardPendingOrders(seedUnifiedDataset);
    const onOpenRoute = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamDashboardPendingOrders
            descriptor={descriptor}
            onOpenRoute={onOpenRoute}
            panel={panel}
          />
        </View>,
      );
    });

    const pressables = renderer!.root.findAllByType(KolamPressable);
    const action = pressables.find(
      node =>
        node.props.accessibilityLabel ===
        `${descriptor.actionLabel} - ${descriptor.actionRoute}`,
    );
    const row = pressables.find(
      node =>
        node.props.accessibilityLabel ===
        `${panel.sections[0].items[0].invoiceCode} - ${panel.sections[0].items[0].route}`,
    );

    expect(action).toBeTruthy();
    expect(row).toBeTruthy();
    if (!action || !row) {
      throw new Error('Pending Orders route pressables were not rendered.');
    }

    action.props.onPress();
    row.props.onPress();

    expect(onOpenRoute).toHaveBeenNthCalledWith(1, descriptor.actionRoute);
    expect(onOpenRoute).toHaveBeenNthCalledWith(
      2,
      panel.sections[0].items[0].route,
    );
  });
});
