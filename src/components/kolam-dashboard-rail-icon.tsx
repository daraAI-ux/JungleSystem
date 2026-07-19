import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {
  DashboardRailIconKind,
  DashboardRailSection,
} from '../domain/dashboard-rail';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCheckmarkIcon} from './kolam-checkmark-icon';
import {KolamWarningIcon} from './kolam-warning-icon';
import {KolamXIcon} from './kolam-x-icon';

export interface KolamDashboardRailIconProps {
  kind: DashboardRailIconKind;
  tone: DashboardRailSection['tone'];
}

export function KolamDashboardRailIcon({
  kind,
  tone,
}: KolamDashboardRailIconProps) {
  const toneStyle = getToneStyle(tone);
  const toneColor = getToneColor(tone);

  if (kind === 'circle-x') {
    return (
      <View style={[toneStyle, styles.circleIcon]}>
        <KolamXIcon color={toneColor} size="md" />
      </View>
    );
  }

  if (kind === 'triangle-warning') {
    return (
      <KolamWarningIcon
        color={V.colors.warning}
        cutoutColor={V.colors.warningSoft}
        detailColor={toneColor}
        variant="rail"
      />
    );
  }

  if (kind === 'circle-check') {
    return (
      <View style={[toneStyle, styles.circleIcon]}>
        <KolamCheckmarkIcon color={toneColor} size="md" />
      </View>
    );
  }

  return (
    <View style={styles.trendingIcon}>
      <View style={[styles.trendAxis, toneStyle]} />
      <View style={[styles.trendLineOne, toneStyle]} />
      <View style={[styles.trendLineTwo, toneStyle]} />
    </View>
  );
}

function getToneColor(tone: DashboardRailSection['tone']) {
  if (tone === 'danger') {
    return V.colors.danger;
  }

  if (tone === 'warning') {
    return V.colors.warning;
  }

  return V.colors.success;
}

function getToneStyle(tone: DashboardRailSection['tone']) {
  if (tone === 'danger') {
    return styles.danger;
  }

  if (tone === 'warning') {
    return styles.warning;
  }

  return styles.success;
}

const styles = StyleSheet.create({
  danger: {
    borderColor: V.colors.danger,
    backgroundColor: V.colors.danger,
  },
  warning: {
    borderColor: V.colors.warning,
    backgroundColor: V.colors.warning,
  },
  success: {
    borderColor: V.colors.success,
    backgroundColor: V.colors.success,
  },
  circleIcon: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  trendingIcon: {
    width: 18,
    height: 18,
    borderLeftColor: V.colors.success,
    borderBottomColor: V.colors.success,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
  },
  trendAxis: {
    position: 'absolute',
    left: 2,
    bottom: 3,
    width: 12,
    height: 2,
    borderRadius: 999,
    transform: [{rotate: '-28deg'}],
  },
  trendLineOne: {
    position: 'absolute',
    right: 4,
    top: 4,
    width: 8,
    height: 2,
    borderRadius: 999,
    transform: [{rotate: '-28deg'}],
  },
  trendLineTwo: {
    position: 'absolute',
    right: 2,
    top: 2,
    width: 2,
    height: 7,
    borderRadius: 999,
  },
});
