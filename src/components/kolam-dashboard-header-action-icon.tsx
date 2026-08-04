import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {DashboardHeaderAction} from '../domain/dashboard-header';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export interface KolamDashboardHeaderActionIconProps {
  intent: DashboardHeaderAction['intent'];
  kind: DashboardHeaderAction['iconKind'];
  tone?: DashboardHeaderAction['buttonTone'];
}

export function KolamDashboardHeaderActionIcon({
  intent,
  kind,
  tone = 'default',
}: KolamDashboardHeaderActionIconProps) {
  const strokeStyle =
    tone === 'positive'
      ? styles.strokePositive
      : intent === 'primary'
        ? styles.strokePrimary
        : styles.stroke;

  if (kind === 'plus') {
    return (
      <View style={styles.plusIcon}>
        <View style={[styles.plusLineHorizontal, strokeStyle]} />
        <View style={[styles.plusLineVertical, strokeStyle]} />
      </View>
    );
  }

  if (kind === 'camera') {
    return (
      <View style={styles.cameraIcon}>
        <View style={[styles.cameraBody, strokeStyle]} />
        <View style={[styles.cameraTop, strokeStyle]} />
        <View style={[styles.cameraLens, strokeStyle]} />
      </View>
    );
  }

  return (
    <View style={styles.packageIcon}>
      <View style={[styles.packageBox, strokeStyle]} />
      <View style={[styles.packageLid, strokeStyle]} />
      <View style={[styles.packageSeam, strokeStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  stroke: {
    borderColor: V.colors.fg,
    backgroundColor: V.colors.fg,
  },
  strokePrimary: {
    borderColor: V.colors.primaryFg,
    backgroundColor: V.colors.primaryFg,
  },
  strokePositive: {
    borderColor: V.colors.success,
    backgroundColor: V.colors.success,
  },
  plusIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusLineHorizontal: {
    position: 'absolute',
    width: 13,
    height: 2,
    borderRadius: 999,
  },
  plusLineVertical: {
    position: 'absolute',
    width: 2,
    height: 13,
    borderRadius: 999,
  },
  packageIcon: {
    width: 16,
    height: 16,
  },
  cameraIcon: {
    width: 16,
    height: 16,
  },
  cameraBody: {
    position: 'absolute',
    left: 1,
    right: 1,
    bottom: 3,
    height: 10,
    borderWidth: 2,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  cameraTop: {
    position: 'absolute',
    left: 4,
    top: 2,
    width: 7,
    height: 4,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: 'transparent',
  },
  cameraLens: {
    position: 'absolute',
    left: 6,
    top: 7,
    width: 4,
    height: 4,
    borderRadius: 999,
  },
  packageBox: {
    position: 'absolute',
    left: 2,
    right: 2,
    bottom: 2,
    height: 10,
    borderWidth: 2,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  packageLid: {
    position: 'absolute',
    left: 4,
    right: 4,
    top: 1,
    height: 5,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundColor: 'transparent',
  },
  packageSeam: {
    position: 'absolute',
    left: 7,
    top: 5,
    width: 2,
    height: 8,
    borderRadius: 999,
  },
});
