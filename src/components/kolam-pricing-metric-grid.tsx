import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';

export function KolamPricingMetricsGrid({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  return <View style={[styles.grid, compact ? styles.gridCompact : null]}>{children}</View>;
}

export function KolamPricingMetric({
  children,
  fullWidth = false,
  label,
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
  label: string;
}) {
  return (
    <View style={[styles.box, fullWidth ? styles.full : null]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.value}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridCompact: {
    gap: 8,
  },
  box: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flexBasis: 150,
    flexGrow: 1,
    gap: 5,
    minHeight: 58,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  full: {
    flexBasis: 320,
  },
  label: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
    lineHeight: 15,
    textTransform: 'uppercase',
  },
  value: {
    gap: 4,
    minWidth: 0,
  },
});
