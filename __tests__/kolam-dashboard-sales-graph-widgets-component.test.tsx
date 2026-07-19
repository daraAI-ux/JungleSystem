import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamDashboardSalesGraphCard} from '../src/components/kolam-dashboard-sales-graph-widgets';
import {KolamDashboardSalesGraphEmptyIcon} from '../src/components/kolam-dashboard-sales-graph-empty-icon';
import {KolamDashboardSalesGraphTitleIcon} from '../src/components/kolam-dashboard-sales-graph-title-icon';
import {KolamChoiceSegmentGroup} from '../src/components/kolam-choice-segment-group';
import {KolamInlineFrame} from '../src/components/kolam-inline-frame';
import {
  getDashboardSalesGraph,
  getDashboardSalesGraphVisualContract,
} from '../src/domain/dashboard-sales-graph';
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

describe('KolamDashboardSalesGraphCard', () => {
  it('renders the sales graph summary from domain data', async () => {
    const graph = getDashboardSalesGraph(seedUnifiedDataset);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamDashboardSalesGraphCard graph={graph} />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        graph.title,
        graph.description,
        graph.rangeLabel,
        graph.totalLabel,
        graph.rangeHint,
      ]),
    );
    expect(renderText(renderer!)).not.toContain(
      'Total omzet (rentang dipilih) - Total:',
    );
    expect(
      renderer!.root.findAllByType(KolamDashboardSalesGraphTitleIcon),
    ).toHaveLength(0);

    const visual = getDashboardSalesGraphVisualContract();
    const rangeGroup = renderer!.root.findByType(KolamChoiceSegmentGroup);
    const rangeStyle = StyleSheet.flatten(rangeGroup.props.style);
    const header = renderer!.root.findAll(node => {
      const style = StyleSheet.flatten(node.props.style);

      return style?.paddingHorizontal === visual.header.paddingX;
    })[0];
    const inlineFrameVariants = renderer!.root
      .findAllByType(KolamInlineFrame)
      .map(node => node.props.variant);
    const summaryColumn = renderer!.root.findAll(node => {
      const style = StyleSheet.flatten(node.props.style);

      return style?.flexBasis === visual.header.summaryColumnBasis;
    })[0];

    expect(header).toBeTruthy();
    expect(StyleSheet.flatten(header.props.style)).toEqual(
      expect.objectContaining({
        flexWrap: visual.header.flexWrap,
        gap: visual.header.gapY,
      }),
    );
    expect(StyleSheet.flatten(summaryColumn.props.style)).toEqual(
      expect.objectContaining({
        minWidth: visual.header.summaryColumnMinWidth,
        maxWidth: visual.header.summaryColumnMaxWidth,
        flexBasis: visual.header.summaryColumnBasis,
      }),
    );
    expect(inlineFrameVariants).toEqual(
      expect.arrayContaining([
        'dashboardSalesGraphPoint',
        'dashboardSalesGraphAreaTrack',
      ]),
    );
    expect(rangeGroup.props.variant).toBe('range');
    expect(rangeStyle).toEqual(
      expect.objectContaining({
        alignSelf: visual.rangeTrigger.alignSelf,
        gap: visual.rangeTrigger.gap,
        paddingHorizontal: visual.rangeTrigger.wrapperPaddingX,
        paddingVertical: visual.rangeTrigger.wrapperPaddingY,
        borderColor: V.colors[visual.rangeTrigger.borderColor],
      }),
    );

    const totalText = renderer!.root
      .findAllByType(Text)
      .find(node => flattenText(node.props.children).includes(graph.totalLabel));
    const totalStyle = StyleSheet.flatten(totalText?.props.style);

    expect(totalStyle).toEqual(
      expect.objectContaining({
        color: V.colors[visual.header.totalColor],
        fontSize: visual.header.totalFontSize,
      }),
    );
  });

  it('forwards live SalesGraph range choices through the segment primitive', async () => {
    const graph = getDashboardSalesGraph(seedUnifiedDataset);
    const onRangeSelect = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamDashboardSalesGraphCard
            graph={graph}
            onRangeSelect={onRangeSelect}
          />
        </View>,
      );
    });

    const rangeGroup = renderer!.root.findByType(KolamChoiceSegmentGroup);

    await ReactTestRenderer.act(async () => {
      rangeGroup.props.onSelect('year');
    });

    expect(onRangeSelect).toHaveBeenCalledWith('year');
  });

  it('renders the live SalesGraph empty copy without decorative icon', async () => {
    const graph = getDashboardSalesGraph({
      ...seedUnifiedDataset,
      kolam: {
        ...seedUnifiedDataset.kolam,
        salesGraph: [],
      },
      recentSales: seedUnifiedDataset.recentSales.map(sale => ({
        ...sale,
        status: 'pending',
      })),
    });
    const visual = getDashboardSalesGraphVisualContract();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamDashboardSalesGraphCard graph={graph} />
        </View>,
      );
    });

    expect(graph.points).toHaveLength(0);
    expect(renderText(renderer!)).toContain(visual.emptyState.title);
    expect(
      renderer!.root.findAllByType(KolamDashboardSalesGraphEmptyIcon),
    ).toHaveLength(0);
  });
});
