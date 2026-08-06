import React from 'react';
import {StyleSheet, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const LEGACY_RANGE_CHEVRON_SIZE = 14;

export function KolamDashboardSalesGraphRangeChevron() {
  return <View style={styles.salesGraphRangeChevron} />;
}

const styles = StyleSheet.create({
  salesGraphRangeChevron: {
    width: LEGACY_RANGE_CHEVRON_SIZE,
    height: LEGACY_RANGE_CHEVRON_SIZE,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: V.colors.mutedFg,
    transform: [{rotate: '45deg'}],
  },
});