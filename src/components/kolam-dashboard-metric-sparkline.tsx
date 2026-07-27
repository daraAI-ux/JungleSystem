import React from 'react';
import {StyleSheet} from 'react-native';
import Svg, {Defs, LinearGradient, Path, Stop} from 'react-native-svg';
import type {DashboardStatCard} from '../domain/dashboard-stats';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {DASHBOARD_STATS_VISUAL} from './kolam-dashboard-metric-visual';
import {KolamInlineFrame} from './kolam-inline-frame';

const SPARKLINE_WIDTH = 120;
const SPARKLINE_HEIGHT = DASHBOARD_STATS_VISUAL.sparkline.height;
const SPARKLINE_PADDING_Y = 4;

export function KolamDashboardMetricSparkline({
  values,
  tone,
}: {
  tone: DashboardStatCard['changeTone'];
  values: number[];
}) {
  if (!values.length) {
    return null;
  }

  const lineColor = tone === 'danger' ? V.colors.danger : V.colors.success;
  const fillId = `dashboard-stat-sparkline-${tone}`;
  const points = getSparklinePoints(values);
  const linePath = buildSmoothLinePath(points);
  const areaPath = buildAreaPath(points);

  return (
    <KolamInlineFrame variant="dashboardStatSparkline">
      <Svg
        width="100%"
        height={SPARKLINE_HEIGHT}
        viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
        preserveAspectRatio="none"
        style={styles.metricSparklineChart}>
        <Defs>
          <LinearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="5%" stopColor={lineColor} stopOpacity={0.5} />
            <Stop offset="95%" stopColor={lineColor} stopOpacity={0.1} />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill={`url(#${fillId})`} />
        <Path
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </Svg>
    </KolamInlineFrame>
  );
}

function getSparklinePoints(values: number[]) {
  const safeValues = values.length > 1 ? values : [values[0], values[0]];
  const maxValue = Math.max(...safeValues);
  const minValue = Math.min(...safeValues);
  const spread = Math.max(maxValue - minValue, 1);
  const plotHeight = SPARKLINE_HEIGHT - SPARKLINE_PADDING_Y * 2;
  const stepX = SPARKLINE_WIDTH / Math.max(safeValues.length - 1, 1);

  return safeValues.map((value, index) => {
    const normalized = (value - minValue) / spread;
    return {
      x: round(index * stepX),
      y: round(SPARKLINE_PADDING_Y + (1 - normalized) * plotHeight),
    };
  });
}

function buildSmoothLinePath(points: Array<{x: number; y: number}>) {
  if (!points.length) {
    return '';
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
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

function buildAreaPath(points: Array<{x: number; y: number}>) {
  if (!points.length) {
    return '';
  }

  const baseline = SPARKLINE_HEIGHT;
  const linePath = buildSmoothLinePath(points);
  const first = points[0];
  const last = points[points.length - 1];

  return `${linePath} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

const styles = StyleSheet.create({
  metricSparklineChart: {
    flex: 1,
    borderRadius: DASHBOARD_STATS_VISUAL.sparkline.barRadius,
    backgroundColor: V.colors.muted,
  },
});
