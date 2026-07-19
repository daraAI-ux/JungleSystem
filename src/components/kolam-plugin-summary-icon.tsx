import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {PluginSurfaceSummaryCard} from '../domain/plugin-surface';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCheckmarkIcon} from './kolam-checkmark-icon';
import {KolamWarningIcon} from './kolam-warning-icon';

export interface KolamPluginSummaryIconProps {
  kind: PluginSurfaceSummaryCard['iconKind'];
  tone: PluginSurfaceSummaryCard['tone'];
}

export function KolamPluginSummaryIcon({
  kind,
  tone,
}: KolamPluginSummaryIconProps) {
  const tint = getToneTint(tone);
  const tintStyle = {
    backgroundColor: tint,
    borderColor: tint,
  };

  if (kind === 'check') {
    return <KolamCheckmarkIcon color={tint} size="sm" />;
  }

  if (kind === 'warning') {
    return <KolamWarningIcon color={tint} variant="summary" />;
  }

  if (kind === 'route') {
    return (
      <View style={styles.routeIcon}>
        <View style={[styles.routeNode, tintStyle]} />
        <View style={[styles.routeLine, tintStyle]} />
        <View style={[styles.routeNode, tintStyle]} />
      </View>
    );
  }

  return (
    <View style={styles.pluginIcon}>
      <View style={[styles.pluginDot, tintStyle]} />
      <View style={[styles.pluginDot, tintStyle]} />
      <View style={[styles.pluginDot, tintStyle]} />
      <View style={[styles.pluginDot, tintStyle]} />
    </View>
  );
}

function getToneTint(tone: PluginSurfaceSummaryCard['tone']) {
  if (tone === 'success') {
    return V.colors.success;
  }

  if (tone === 'warning') {
    return V.colors.warning;
  }

  if (tone === 'info') {
    return V.colors.info;
  }

  return V.colors.fg;
}

const styles = StyleSheet.create({
  pluginIcon: {
    width: 14,
    height: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  pluginDot: {
    width: 5,
    height: 5,
    borderRadius: 2,
  },
  routeIcon: {
    width: 17,
    height: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeNode: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  routeLine: {
    width: 7,
    height: 2,
    borderRadius: 999,
  },
});
