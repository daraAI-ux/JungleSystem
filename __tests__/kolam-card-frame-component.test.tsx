import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamCardFrame} from '../src/components/kolam-card-frame';
import {KolamInteractiveCardFrame} from '../src/components/kolam-interactive-card-frame';
import {KolamPressable} from '../src/components/kolam-pressable';
import {getDashboardCountVisualContract} from '../src/domain/dashboard-counts';
import {getDashboardCustomerVisitConfirmationsVisualContract} from '../src/domain/dashboard-customer-visit-confirmations';
import {getDashboardPendingOrdersVisualContract} from '../src/domain/dashboard-pending-orders';
import {getDashboardRailVisualContract} from '../src/domain/dashboard-rail';
import {getDashboardSalesGraphVisualContract} from '../src/domain/dashboard-sales-graph';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamCardFrame', () => {
  it('renders shared card chrome with stable bg/border tokens', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamCardFrame>
          <Text>Card child</Text>
        </KolamCardFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({
        backgroundColor: V.colors.bg,
        borderColor: V.colors.border,
      }),
    );
    expect(renderer!.root.findByType(Text).props.children).toBe('Card child');
  });

  it('keeps interactive card frames routed through KolamPressable', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamInteractiveCardFrame
          accessibilityLabel="runtime action"
          accessibilityState={{disabled: false}}
          onPress={onPress}>
          <Text>Action</Text>
        </KolamInteractiveCardFrame>,
      );
    });

    const card = renderer!.root.findByType(KolamPressable);

    expect(card.props.accessibilityLabel).toBe('runtime action');
    expect(card.props.accessibilityState).toEqual({disabled: false});
    card.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('uses live Beranda section card radius for dashboard cards', async () => {
    const countVisual = getDashboardCountVisualContract();
    const pendingVisual = getDashboardPendingOrdersVisualContract();
    const railVisual = getDashboardRailVisualContract();
    const salesVisual = getDashboardSalesGraphVisualContract();
    const visitVisual = getDashboardCustomerVisitConfirmationsVisualContract();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamCardFrame variant="dashboardInventoryCounts">
            <Text>Inventory</Text>
          </KolamCardFrame>
          <KolamCardFrame variant="dashboardPendingOrders">
            <Text>Section</Text>
          </KolamCardFrame>
          <KolamCardFrame variant="dashboardRail">
            <Text>Rail</Text>
          </KolamCardFrame>
          <KolamCardFrame variant="dashboardSalesGraph">
            <Text>Sales</Text>
          </KolamCardFrame>
          <KolamCardFrame variant="dashboardVisitConfirmations">
            <Text>Visit</Text>
          </KolamCardFrame>
        </View>,
      );
    });

    const cards = renderer!.root
      .findAllByType(View)
      .filter(node => node.props.style?.overflow === 'hidden');

    expect(cards[0].props.style).toEqual(
      expect.objectContaining({borderRadius: countVisual.section.frameRadius}),
    );
    expect(cards[1].props.style).toEqual(
      expect.objectContaining({borderRadius: pendingVisual.card.radius}),
    );
    expect(cards[2].props.style).toEqual(
      expect.objectContaining({borderRadius: railVisual.card.radius}),
    );
    expect(cards[3].props.style).toEqual(
      expect.objectContaining({borderRadius: salesVisual.card.radius}),
    );
    const visitCard = renderer!.root.findAllByType(View).find(node => {
      const style = StyleSheet.flatten(node.props.style);

      return style?.gap === visitVisual.card.spacing;
    });

    expect(StyleSheet.flatten(visitCard?.props.style)).toEqual(
      expect.objectContaining({
        backgroundColor: V.colors.bg,
        borderRadius: visitVisual.card.radius,
        paddingVertical: visitVisual.card.paddingY,
      }),
    );
  });
});
