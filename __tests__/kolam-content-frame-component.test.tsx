import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamContentFrame} from '../src/components/kolam-content-frame';
import {getDashboardSalesGraphVisualContract} from '../src/domain/dashboard-sales-graph';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamContentFrame', () => {
  it('renders checkout pane chrome with children intact', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamContentFrame variant="checkoutPane">
          <Text>Checkout child</Text>
        </KolamContentFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({
        backgroundColor: V.colors.bg,
        borderColor: V.colors.border,
        width: 390,
      }),
    );
    expect(renderer!.root.findByType(Text).props.children).toBe(
      'Checkout child',
    );
  });

  it('keeps status panel body separator tokens reusable', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamContentFrame variant="statusPanelBody">
          <Text>Status body</Text>
        </KolamContentFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({
        borderTopColor: V.colors.border,
        borderTopWidth: 1,
      }),
    );
  });

  it('uses the live SalesGraph content frame for plot and empty states', async () => {
    const visual = getDashboardSalesGraphVisualContract();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamContentFrame variant="dashboardSalesGraphPlot">
            <Text>Plot</Text>
          </KolamContentFrame>
          <KolamContentFrame variant="dashboardSalesGraphEmpty">
            <Text>Empty</Text>
          </KolamContentFrame>
        </View>,
      );
    });

    const frames = renderer!.root
      .findAllByType(View)
      .filter(node => node.props.style?.minHeight === visual.content.height);

    expect(frames[0].props.style).toEqual(
      expect.objectContaining({
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: visual.content.plotGap,
        paddingHorizontal: visual.content.paddingX,
        paddingTop: visual.content.paddingTop,
        paddingBottom: visual.content.paddingBottom,
      }),
    );
    expect(frames[1].props.style).toEqual(
      expect.objectContaining({
        alignItems: 'center',
        justifyContent: 'center',
        gap: visual.emptyState.gapY,
        paddingHorizontal: visual.content.paddingX,
        paddingBottom: visual.content.paddingBottom,
      }),
    );
  });
});
