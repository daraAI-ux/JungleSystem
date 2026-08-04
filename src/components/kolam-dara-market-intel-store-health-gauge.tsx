import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import type {KolamDaraMarketIntelStoreHealthTone} from '../domain/kolam-dara-market-intel';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const GAUGE_R = 40;
const GAUGE_C = 2 * Math.PI * GAUGE_R;
const GAUGE_SIZE = 96;
const GAUGE_CX = 48;
const GAUGE_CY = 48;

function gaugeOffset(pct: number) {
  return GAUGE_C * (1 - Math.min(100, Math.max(0, pct)) / 100);
}

function toneStroke(tone: KolamDaraMarketIntelStoreHealthTone) {
  if (tone === 'good') {
    return V.colors.success;
  }
  if (tone === 'bad') {
    return V.colors.danger;
  }
  return V.colors.warning;
}

/**
 * FE store-health gauge. Pattern inspired by SEO CircularKpi (RNW origin rotate),
 * scoped to market-intel — do not import/mutate SEO KPI.
 */
export function KolamDaraMarketIntelStoreHealthGauge({
  score,
  tone,
}: {
  score: number;
  tone: KolamDaraMarketIntelStoreHealthTone;
}) {
  const stroke = toneStroke(tone);
  return (
    <View style={styles.wrap}>
      <Svg height={GAUGE_SIZE} viewBox="0 0 96 96" width={GAUGE_SIZE}>
        <Circle
          cx={GAUGE_CX}
          cy={GAUGE_CY}
          fill="none"
          r={GAUGE_R}
          stroke={V.colors.border}
          strokeWidth={8}
        />
        <Circle
          cx={GAUGE_CX}
          cy={GAUGE_CY}
          fill="none"
          originX={GAUGE_CX}
          originY={GAUGE_CY}
          r={GAUGE_R}
          rotation={-90}
          stroke={stroke}
          strokeDasharray={`${GAUGE_C}`}
          strokeDashoffset={gaugeOffset(score)}
          strokeLinecap="round"
          strokeWidth={8}
        />
      </Svg>
      <View pointerEvents="none" style={styles.center}>
        <Text style={styles.score}>{`${Math.round(score)}%`}</Text>
        <Text style={styles.label}>Kesehatan toko</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    height: GAUGE_SIZE,
    justifyContent: 'center',
    width: GAUGE_SIZE,
  },
  center: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  score: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '800',
  },
  label: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
  },
});
