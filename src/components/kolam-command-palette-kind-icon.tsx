import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {CommandKind} from '../domain/command-index';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export interface KolamCommandPaletteKindIconProps {
  kind: CommandKind;
}

export function KolamCommandPaletteKindIcon({
  kind,
}: KolamCommandPaletteKindIconProps) {
  if (kind === 'module') {
    return (
      <View style={styles.moduleIcon}>
        <View style={styles.moduleTile} />
        <View style={styles.moduleTile} />
        <View style={styles.moduleTile} />
        <View style={styles.moduleTile} />
      </View>
    );
  }

  if (kind === 'module-route') {
    return (
      <View style={styles.routeIcon}>
        <View style={styles.moduleRouteTile} />
        <View style={styles.routeLine} />
      </View>
    );
  }

  if (kind === 'kolam-surface') {
    return (
      <View style={styles.routeIcon}>
        <View style={styles.routeDot} />
        <View style={styles.kolamSurfaceLine} />
      </View>
    );
  }

  if (kind === 'runtime-action') {
    return (
      <View style={styles.actionIcon}>
        <View style={styles.actionStem} />
        <View style={styles.actionBoltTop} />
        <View style={styles.actionBoltBottom} />
      </View>
    );
  }

  if (kind === 'am-route') {
    return (
      <View style={styles.actionIcon}>
        <View style={styles.amRack} />
        <View style={styles.amDevice} />
      </View>
    );
  }

  if (kind === 'navigation-route') {
    return (
      <View style={styles.routeIcon}>
        <View style={styles.routeDot} />
        <View style={styles.routeLine} />
      </View>
    );
  }

  return (
    <View style={styles.pluginIcon}>
      <View style={styles.pluginDot} />
      <View style={styles.pluginLine} />
      <View style={styles.pluginDot} />
    </View>
  );
}

const styles = StyleSheet.create({
  moduleIcon: {
    width: 14,
    height: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  moduleTile: {
    width: 5,
    height: 5,
    borderRadius: 2,
    backgroundColor: V.colors.info,
  },
  moduleRouteTile: {
    position: 'absolute',
    left: 1,
    top: 4,
    width: 7,
    height: 7,
    borderRadius: 2,
    backgroundColor: V.colors.info,
  },
  actionIcon: {
    width: 16,
    height: 17,
  },
  actionStem: {
    position: 'absolute',
    left: 7,
    top: 1,
    width: 2,
    height: 15,
    borderRadius: 999,
    backgroundColor: V.colors.warning,
    transform: [{rotate: '20deg'}],
  },
  actionBoltTop: {
    position: 'absolute',
    left: 5,
    top: 1,
    width: 7,
    height: 2,
    borderRadius: 999,
    backgroundColor: V.colors.warning,
  },
  actionBoltBottom: {
    position: 'absolute',
    left: 4,
    bottom: 2,
    width: 8,
    height: 2,
    borderRadius: 999,
    backgroundColor: V.colors.warning,
  },
  amRack: {
    position: 'absolute',
    left: 2,
    top: 3,
    width: 12,
    height: 11,
    borderColor: V.colors.info,
    borderRadius: 3,
    borderWidth: 2,
  },
  amDevice: {
    position: 'absolute',
    left: 6,
    top: 6,
    width: 5,
    height: 5,
    borderRadius: 2,
    backgroundColor: V.colors.info,
  },
  routeIcon: {
    width: 16,
    height: 16,
    justifyContent: 'center',
  },
  routeDot: {
    position: 'absolute',
    left: 1,
    top: 6,
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: V.colors.primary,
  },
  routeLine: {
    position: 'absolute',
    left: 5,
    top: 7,
    width: 10,
    height: 3,
    borderRadius: 999,
    backgroundColor: V.colors.primary,
  },
  kolamSurfaceLine: {
    position: 'absolute',
    left: 5,
    top: 7,
    width: 10,
    height: 3,
    borderRadius: 999,
    backgroundColor: V.colors.success,
  },
  pluginIcon: {
    width: 17,
    height: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pluginDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: V.colors.success,
  },
  pluginLine: {
    width: 7,
    height: 2,
    borderRadius: 999,
    backgroundColor: V.colors.success,
  },
});
