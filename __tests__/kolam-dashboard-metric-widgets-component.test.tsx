import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamBadge} from '../src/components/kolam-badge';
import {
  KolamDashboardCountStrip,
  KolamDashboardStatsStrip,
} from '../src/components/kolam-dashboard-metric-widgets';
import {KolamInlineFrame} from '../src/components/kolam-inline-frame';
import {KolamListFrame} from '../src/components/kolam-list-frame';
import {KolamPressable} from '../src/components/kolam-pressable';
import {
  getDashboardCountCards,
  getDashboardCountVisualContract,
} from '../src/domain/dashboard-counts';
import {
  getDashboardStatCards,
  getDashboardStatsVisualContract,
} from '../src/domain/dashboard-stats';
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

describe('Kolam dashboard metric widgets', () => {
  it('renders count and stat cards from domain contracts', async () => {
    const countCards = getDashboardCountCards(seedUnifiedDataset);
    const statCards = getDashboardStatCards(seedUnifiedDataset);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamDashboardCountStrip cards={countCards} />
          <KolamDashboardStatsStrip cards={statCards} />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        countCards[0].label,
        countCards[0].value.toLocaleString('id-ID'),
        statCards[0].label,
        statCards[0].value,
      ]),
    );
    expect(
      renderer!.root.findByProps({
        accessibilityLabel: countCards[0].accessibilityLabel,
      }),
    ).toBeTruthy();

    const text = renderText(renderer!);
    const firstCountValue = countCards[0].value.toLocaleString('id-ID');
    expect(text.indexOf(firstCountValue)).toBeLessThan(
      text.indexOf(countCards[0].label),
    );
    expect(text.indexOf(countCards[0].label)).toBeLessThan(
      text.indexOf(countCards[0].subLabel),
    );

    const visual = getDashboardStatsVisualContract();
    const countVisual = getDashboardCountVisualContract();
    const inlineFrameVariants = renderer!.root
      .findAllByType(KolamInlineFrame)
      .map(node => node.props.variant);
    const listFrames = renderer!.root.findAllByType(KolamListFrame);
    const countListFrame = renderer!.root.findAllByType(View).find(node => {
      const style = StyleSheet.flatten(node.props.style);

      return (
        style?.flexDirection === 'row' &&
        style?.flexWrap === 'wrap' &&
        style?.gap === countVisual.cardSpacing
      );
    });
    const statCardFrame = renderer!.root
      .findAllByType(View)
      .find(node =>
        Array.isArray(node.props.style)
          ? node.props.style.some(
              (style: Record<string, unknown>) =>
                style?.minHeight === visual.card.dashboardMinHeight,
            )
          : false,
      );

    expect(
      listFrames.some(frame => frame.props.variant === 'dashboardMetric'),
    ).toBe(true);
    expect(inlineFrameVariants).toContain('dashboardStatSparkline');
    expect(StyleSheet.flatten(countListFrame?.props.style)).toEqual(
      expect.objectContaining({
        flexWrap: 'wrap',
        gap: countVisual.cardSpacing,
      }),
    );
    const dashboardMetricFrame = renderer!.root.findAllByType(View).find(node => {
      const style = StyleSheet.flatten(node.props.style);

      return (
        style?.flexWrap === 'wrap' &&
        style?.gap === visual.grid.gap &&
        style?.flexDirection === 'row'
      );
    });

    expect(
      StyleSheet.flatten(dashboardMetricFrame?.props.style),
    ).toEqual(
      expect.objectContaining({
        flexWrap: 'wrap',
        gap: visual.grid.gap,
      }),
    );
    expect(
      listFrames.some(frame => frame.props.variant === 'dashboardStatChannelRows'),
    ).toBe(true);
    expect(
      listFrames.some(frame => frame.props.variant === 'dashboardStatChannelGrid'),
    ).toBe(true);
    expect(statCards[0].channels.length).toBeLessThanOrEqual(
      visual.sourceBreakdown.maxItems,
    );
    expect(statCardFrame?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({borderRadius: visual.card.radius}),
        expect.objectContaining({minWidth: visual.card.minWidth}),
      ]),
    );

    const firstCountLabel = renderer!.root
      .findAllByType(Text)
      .find(node =>
        flattenText(node.props.children).includes(countCards[0].label),
      );
    const iconTiles = renderer!.root.findAllByType(View).filter(node =>
      Array.isArray(node.props.style)
        ? node.props.style.some(
            (style: Record<string, unknown>) =>
              style?.width === countVisual.iconTile.size &&
              style?.height === countVisual.iconTile.size,
          )
        : node.props.style?.width === countVisual.iconTile.size &&
          node.props.style?.height === countVisual.iconTile.size,
    );

    expect(firstCountLabel?.props.style).toEqual(
      expect.objectContaining({color: V.colors[countVisual.copy.labelTone]}),
    );
    const countCardFrames = renderer!.root.findAllByType(View).filter(node => {
      const style = StyleSheet.flatten(node.props.style);

      return style?.minWidth === countVisual.card.minWidth;
    });

    expect(countCardFrames.length).toBeGreaterThanOrEqual(
      countVisual.gridColumns.desktop,
    );
    expect(iconTiles[0]?.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: V.colors[countVisual.iconTile.background],
      }),
    );

    const trendNode = renderer!.root
      .findAllByType(Text)
      .find(node =>
        flattenText(node.props.children).includes(statCards[0].changeLabel),
      );

    expect(trendNode?.props.style).toEqual(
      expect.objectContaining({
        marginTop: visual.trend.marginTop,
        color: V.colors.mutedFg,
        fontSize: visual.trend.fontSize,
        fontWeight: visual.trend.fontWeight,
      }),
    );
    expect(renderer!.root.findAllByType(KolamBadge)).toHaveLength(0);
  });

  it('routes InventoryCounts cards through reusable pressable primitives', async () => {
    const countCards = getDashboardCountCards(seedUnifiedDataset);
    const onOpenRoute = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamDashboardCountStrip
            cards={countCards}
            onOpenRoute={onOpenRoute}
          />
        </View>,
      );
    });

    const card = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel === countCards[0].accessibilityLabel,
      );

    if (!card) {
      throw new Error('InventoryCounts route card did not render.');
    }

    card.props.onPress();

    expect(onOpenRoute).toHaveBeenCalledWith(countCards[0].routeHint);
  });
});
