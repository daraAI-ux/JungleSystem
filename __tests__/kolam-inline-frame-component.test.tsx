import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamInlineFrame} from '../src/components/kolam-inline-frame';
import {getDashboardSalesGraphVisualContract} from '../src/domain/dashboard-sales-graph';
import {getDashboardStatsVisualContract} from '../src/domain/dashboard-stats';

describe('KolamInlineFrame', () => {
  it('renders shared inline row chrome and keeps children ordered', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamInlineFrame variant="attentionItemTitleRow">
          <Text>Title</Text>
          <Text>Dot</Text>
        </KolamInlineFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({
        flexDirection: 'row',
        justifyContent: 'space-between',
      }),
    );
    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'Title',
      'Dot',
    ]);
  });

  it('supports total row layout variant', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamInlineFrame variant="totalRow">
          <Text>Label</Text>
          <Text>Value</Text>
        </KolamInlineFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({
        flexDirection: 'row',
        justifyContent: 'space-between',
      }),
    );
  });

  it('supports live SalesGraph point and track layout variants', async () => {
    const visual = getDashboardSalesGraphVisualContract();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamInlineFrame variant="dashboardSalesGraphPoint">
          <KolamInlineFrame variant="dashboardSalesGraphAreaTrack">
            <Text>Point</Text>
          </KolamInlineFrame>
        </KolamInlineFrame>,
      );
    });

    const frames = renderer!.root.findAllByType(View);
    const pointStyle = StyleSheet.flatten(frames[0].props.style);
    const trackStyle = StyleSheet.flatten(frames[1].props.style);

    expect(pointStyle).toEqual(
      expect.objectContaining({
        minWidth: visual.point.minWidth,
        alignItems: 'center',
        gap: visual.point.gapY,
      }),
    );
    expect(trackStyle).toEqual(
      expect.objectContaining({
        height: visual.chart.innerPlotHeight,
        justifyContent: 'flex-end',
        borderBottomWidth: visual.point.trackBorderWidth,
      }),
    );
  });

  it('supports live dashboard Stats sparkline shell layout', async () => {
    const visual = getDashboardStatsVisualContract();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamInlineFrame variant="dashboardStatSparkline">
          <Text>Bar</Text>
        </KolamInlineFrame>,
      );
    });

    expect(
      StyleSheet.flatten(renderer!.root.findByType(View).props.style),
    ).toEqual(
      expect.objectContaining({
        height: visual.sparkline.height,
        marginTop: visual.card.gapY,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: visual.sparkline.gapX,
      }),
    );
  });
});
