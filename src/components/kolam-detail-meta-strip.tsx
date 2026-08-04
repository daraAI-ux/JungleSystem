import React from 'react';
import {StyleSheet, Text, View, type StyleProp, type ViewStyle} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCardFrame} from './kolam-card-frame';

/**
 * Detail meta strip under toolbar — same frame/spacing as penjualan detail.
 * SoT layout: KolamCardFrame compact + label-above-value items.
 */
export function KolamDetailMetaStrip({
  children,
  style,
  trailing,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  trailing?: React.ReactNode;
}) {
  return (
    <KolamCardFrame style={[styles.stripCard, style]} variant="compact">
      <View style={styles.stripRow}>
        {children}
        {trailing}
      </View>
    </KolamCardFrame>
  );
}

export function KolamDetailMetaStripItem({
  children,
  label,
  style,
}: {
  children: React.ReactNode;
  label: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.stripItem, style]}>
      <Text style={styles.stripLabel}>{label}</Text>
      {children}
    </View>
  );
}

export const kolamDetailMetaStripStyles = StyleSheet.create({
  stripSourceSlot: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    marginLeft: 'auto',
    minHeight: 72,
    width: 88,
  },
  stripSourceLogo: {
    height: 72,
    width: 88,
  },
  stripValue: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '700',
  },
});

const styles = StyleSheet.create({
  stripCard: {
    alignSelf: 'stretch',
    minWidth: '100%',
    overflow: 'hidden',
    paddingLeft: 12,
    paddingRight: 0,
    paddingVertical: 0,
    width: '100%',
  },
  stripRow: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    minHeight: 72,
    width: '100%',
  },
  stripItem: {
    gap: 4,
    justifyContent: 'center',
    minWidth: 120,
    paddingVertical: 12,
  },
  stripLabel: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
