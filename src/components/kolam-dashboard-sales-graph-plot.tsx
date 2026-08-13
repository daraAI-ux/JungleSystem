import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';
import type {DashboardSalesGraphPoint} from '../domain/dashboard-sales-graph';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamContentFrame} from './kolam-content-frame';
import {KolamDashboardSalesGraphPoint} from './kolam-dashboard-sales-graph-point';
import {DASHBOARD_SALES_GRAPH_VISUAL} from './kolam-dashboard-sales-graph-visual';
import {KolamMappedList} from './kolam-mapped-list';

const LINE_CHART_WIDTH = 1000;

export function KolamDashboardSalesGraphPlot({
  mode = 'bar',
  points,
}: {
  mode?: 'bar' | 'line';
  points: DashboardSalesGraphPoint[];
}) {
  if (mode === 'line') {
    return <KolamDashboardSalesGraphLinePlot points={points} />;
  }

  return (
    <KolamContentFrame variant="dashboardSalesGraphPlot">
      <KolamMappedList
        items={points}
        getKey={point => point.id}
        renderItem={point => <KolamDashboardSalesGraphPoint point={point} />}
      />
    </KolamContentFrame>
  );
}

function KolamDashboardSalesGraphLinePlot({
  points,
}: {
  points: DashboardSalesGraphPoint[];
}) {
  const chartPoints = getLineChartPoints(points);
  const linePath = buildSmoothLinePath(chartPoints);

  return (
    <KolamContentFrame
      variant="dashboardSalesGraphPlot"
      style={styles.salesGraphLinePlot}>
      <View style={styles.salesGraphLineValues}>
        <KolamMappedList
          items={points}
          getKey={point => point.id}
          renderItem={point => (
            <Text numberOfLines={1} style={styles.salesGraphValue}>
              {point.valueLabel}
            </Text>
          )}
        />
      </View>
      <View style={styles.salesGraphLineChart}>
        <Svg
          width="100%"
          height={DASHBOARD_SALES_GRAPH_VISUAL.chart.innerPlotHeight}
          viewBox={`0 0 ${LINE_CHART_WIDTH} ${DASHBOARD_SALES_GRAPH_VISUAL.chart.innerPlotHeight}`}
          preserveAspectRatio="none"
          style={styles.salesGraphLineSvg}>
          <Path
            d={linePath}
            fill="none"
            stroke={V.colors.success}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
          />
          <KolamMappedList
            items={chartPoints}
            getKey={point => point.id}
            renderItem={point => (
              <Circle
                cx={point.x}
                cy={point.y}
                fill={V.colors.primary}
                r={DASHBOARD_SALES_GRAPH_VISUAL.point.dotSize / 2}
                stroke={V.colors.bg}
                strokeWidth={DASHBOARD_SALES_GRAPH_VISUAL.point.dotBorderWidth}
              />
            )}
          />
        </Svg>
      </View>
      <View style={styles.salesGraphLineLabels}>
        <KolamMappedList
          items={points}
          getKey={point => point.id}
          renderItem={point => (
            <Text numberOfLines={1} style={styles.salesGraphLabel}>
              {point.label}
            </Text>
          )}
        />
      </View>
    </KolamContentFrame>
  );
}

function getLineChartPoints(points: DashboardSalesGraphPoint[]) {
  const safePoints = points.length > 1 ? points : [points[0], points[0]];
  const plotHeight = DASHBOARD_SALES_GRAPH_VISUAL.chart.innerPlotHeight;
  const dotSize = DASHBOARD_SALES_GRAPH_VISUAL.point.dotSize;
  const stepX = LINE_CHART_WIDTH / Math.max(safePoints.length - 1, 1);

  return safePoints.map((point, index) => ({
    id: `${point.id}-${index}`,
    x: round(index * stepX),
    y: round(
      Math.max(dotSize, Math.min(plotHeight - dotSize, point.lineOffsetTop)),
    ),
  }));
}

function buildSmoothLinePath(points: Array<{x: number; y: number}>) {
  if (!points.length) {
    return '';
  }

  const commands = [`M ${points[0].x} ${points[0].y}`];

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const previous = points[index - 1] ?? current;
    const afterNext = points[index + 2] ?? next;
    const controlOne = {
      x: current.x + (next.x - previous.x) / 6,
      y: current.y + (next.y - previous.y) / 6,
    };
    const controlTwo = {
      x: next.x - (afterNext.x - current.x) / 6,
      y: next.y - (afterNext.y - current.y) / 6,
    };

    commands.push(
      `C ${round(controlOne.x)} ${round(controlOne.y)} ${round(
        controlTwo.x,
      )} ${round(controlTwo.y)} ${next.x} ${next.y}`,
    );
  }

  return commands.join(' ');
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

const styles = StyleSheet.create({
  salesGraphLinePlot: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: DASHBOARD_SALES_GRAPH_VISUAL.point.gapY,
  },
  salesGraphLineValues: {
    flexDirection: 'row',
    gap: DASHBOARD_SALES_GRAPH_VISUAL.content.plotGap,
  },
  salesGraphLineChart: {
    height: DASHBOARD_SALES_GRAPH_VISUAL.chart.innerPlotHeight,
    borderBottomColor: V.colors.border,
    borderBottomWidth: DASHBOARD_SALES_GRAPH_VISUAL.point.trackBorderWidth,
  },
  salesGraphLineSvg: {
    flex: 1,
  },
  salesGraphLineLabels: {
    flexDirection: 'row',
    gap: DASHBOARD_SALES_GRAPH_VISUAL.content.plotGap,
  },
  salesGraphValue: {
    flex: 1,
    minWidth: DASHBOARD_SALES_GRAPH_VISUAL.point.minWidth,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_SALES_GRAPH_VISUAL.point.valueFontSize,
    fontWeight: '700',
    textAlign: 'center',
  },
  salesGraphLabel: {
    flex: 1,
    minWidth: DASHBOARD_SALES_GRAPH_VISUAL.point.minWidth,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_SALES_GRAPH_VISUAL.point.labelFontSize,
    fontWeight: '700',
    textAlign: 'center',
  },
});
