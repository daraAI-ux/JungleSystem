import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import type {KolamDaraSeoKpiTone} from '../domain/kolam-dara-seo';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const GAUGE_R = 36;
const GAUGE_C = 2 * Math.PI * GAUGE_R;
const GAUGE_SIZE = 78;

function gaugeOffset(pct: number) {
  return GAUGE_C * (1 - Math.min(100, Math.max(0, pct)) / 100);
}

function toneStroke(tone: KolamDaraSeoKpiTone) {
  if (tone === 'good') {
    return V.colors.success;
  }
  if (tone === 'bad') {
    return V.colors.danger;
  }
  return V.colors.warning;
}

/**
 * FE parity: DA-Dara-Plugin `CircularKpi` donut gauge on SEO dashboard.
 * Scoped to DARA SEO — does not change shared KolamStatsCardStrip.
 */
export function KolamDaraSeoCircularKpi({
  display,
  label,
  pct,
  status,
  sub,
  tone,
  trend,
}: {
  display: string;
  label: string;
  pct: number;
  status: string;
  sub?: string;
  tone: KolamDaraSeoKpiTone;
  trend?: string;
}) {
  const stroke = toneStroke(tone);
  return (
    <View style={styles.card}>
      <Text numberOfLines={2} style={styles.label}>
        {label}
      </Text>
      <View style={styles.gauge}>
        <Svg
          height={GAUGE_SIZE}
          style={styles.gaugeSvg}
          viewBox="0 0 88 88"
          width={GAUGE_SIZE}>
          <Circle
            cx={44}
            cy={44}
            fill="none"
            r={GAUGE_R}
            stroke={V.colors.border}
            strokeWidth={8}
          />
          <Circle
            cx={44}
            cy={44}
            fill="none"
            r={GAUGE_R}
            stroke={stroke}
            strokeDasharray={`${GAUGE_C}`}
            strokeDashoffset={gaugeOffset(pct)}
            strokeLinecap="round"
            strokeWidth={8}
          />
        </Svg>
        <View style={styles.gaugeCenter} pointerEvents="none">
          <Text numberOfLines={1} style={styles.display}>
            {display}
          </Text>
          {sub ? (
            <Text numberOfLines={1} style={styles.sub}>
              {sub}
            </Text>
          ) : null}
        </View>
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.status,
          tone === 'good'
            ? styles.statusGood
            : tone === 'bad'
              ? styles.statusBad
              : styles.statusWarn,
        ]}>
        {status}
      </Text>
      <Text numberOfLines={2} style={styles.trend}>
        {trend ?? ' '}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    flexBasis: 0,
    gap: 8,
    minWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  label: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    height: 32,
    textAlign: 'center',
    width: '100%',
  },
  gauge: {
    alignItems: 'center',
    height: GAUGE_SIZE,
    justifyContent: 'center',
    position: 'relative',
    width: GAUGE_SIZE,
  },
  gaugeSvg: {
    transform: [{rotate: '-90deg'}],
  },
  gaugeCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  display: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
    textAlign: 'center',
  },
  sub: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  status: {
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    width: '100%',
  },
  statusGood: {color: V.colors.success},
  statusWarn: {color: V.colors.warning},
  statusBad: {color: V.colors.danger},
  trend: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    height: 28,
    lineHeight: 14,
    textAlign: 'center',
    width: '100%',
  },
});
