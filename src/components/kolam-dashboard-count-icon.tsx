import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {DashboardCountIconKind} from '../domain/dashboard-counts';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamDashboardProductCountIcon} from './kolam-dashboard-product-count-icon';
import {KolamDashboardRawMaterialCountIcon} from './kolam-dashboard-raw-material-count-icon';

export interface KolamDashboardCountIconProps {
  kind: DashboardCountIconKind;
}

export function KolamDashboardCountIcon({
  kind,
}: KolamDashboardCountIconProps) {
  if (kind === 'shopping-bag') {
    return <KolamDashboardProductCountIcon />;
  }

  if (kind === 'package') {
    return <KolamDashboardRawMaterialCountIcon />;
  }

  if (kind === 'book') {
    return (
      <View style={styles.book}>
        <View style={styles.bookSpine} />
        <View style={styles.bookLine} />
      </View>
    );
  }

  return (
    <View style={styles.service}>
      <View style={styles.serviceDot} />
      <View style={styles.serviceLineHorizontal} />
      <View style={styles.serviceLineVertical} />
    </View>
  );
}

const styles = StyleSheet.create({
  book: {
    width: 19,
    height: 20,
    borderRadius: 4,
    borderColor: V.colors.success,
    borderWidth: 2,
  },
  bookSpine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 5,
    width: 2,
    backgroundColor: V.colors.success,
  },
  bookLine: {
    position: 'absolute',
    right: 3,
    top: 6,
    width: 6,
    height: 2,
    borderRadius: 999,
    backgroundColor: V.colors.success,
  },
  service: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderColor: V.colors.success,
    borderWidth: 2,
  },
  serviceLineHorizontal: {
    position: 'absolute',
    width: 12,
    height: 2,
    borderRadius: 999,
    backgroundColor: V.colors.success,
  },
  serviceLineVertical: {
    position: 'absolute',
    width: 2,
    height: 12,
    borderRadius: 999,
    backgroundColor: V.colors.success,
  },
});
