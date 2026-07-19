import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {DashboardCountIconKind} from '../domain/dashboard-counts';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export interface KolamDashboardCountIconProps {
  kind: DashboardCountIconKind;
}

export function KolamDashboardCountIcon({
  kind,
}: KolamDashboardCountIconProps) {
  if (kind === 'shopping-bag') {
    return (
      <View style={styles.bag}>
        <View style={styles.bagHandle} />
        <View style={styles.bagBody} />
      </View>
    );
  }

  if (kind === 'package') {
    return (
      <View style={styles.package}>
        <View style={styles.packageTop} />
        <View style={styles.packageSeam} />
      </View>
    );
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
  bag: {
    width: 20,
    height: 20,
    alignItems: 'center',
  },
  bagHandle: {
    width: 10,
    height: 7,
    borderColor: V.colors.success,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },
  bagBody: {
    width: 18,
    height: 14,
    marginTop: -1,
    borderRadius: 4,
    borderColor: V.colors.success,
    borderWidth: 2,
    backgroundColor: V.colors.successSoft,
  },
  package: {
    width: 20,
    height: 18,
    borderRadius: 4,
    borderColor: V.colors.success,
    borderWidth: 2,
  },
  packageTop: {
    position: 'absolute',
    top: 5,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: V.colors.success,
  },
  packageSeam: {
    position: 'absolute',
    top: 0,
    bottom: 5,
    left: 8,
    width: 2,
    backgroundColor: V.colors.success,
  },
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
