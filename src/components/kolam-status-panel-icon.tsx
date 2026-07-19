import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {StatusPanelIconKind} from '../domain/status-panel';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCheckmarkIcon} from './kolam-checkmark-icon';
import {KolamSearchIcon} from './kolam-search-icon';

export interface KolamStatusPanelIconProps {
  kind: StatusPanelIconKind;
}

export function KolamStatusPanelIcon({kind}: KolamStatusPanelIconProps) {
  if (kind === 'activity') {
    return (
      <View style={styles.activityIcon}>
        <View style={styles.activityDot} />
        <View style={styles.activityLine} />
        <View style={styles.activityDot} />
      </View>
    );
  }

  if (kind === 'checklist') {
    return <KolamCheckmarkIcon color={V.colors.info} size="checklist" />;
  }

  if (kind === 'actions') {
    return (
      <View style={styles.actionsIcon}>
        <View style={styles.actionDot} />
        <View style={styles.actionDot} />
        <View style={styles.actionDot} />
        <View style={styles.actionDot} />
      </View>
    );
  }

  return <KolamSearchIcon color={V.colors.info} variant="panel" />;
}

const styles = StyleSheet.create({
  activityIcon: {
    width: 19,
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: V.colors.info,
  },
  activityLine: {
    width: 8,
    height: 2,
    borderRadius: 999,
    backgroundColor: V.colors.info,
    transform: [{rotate: '-24deg'}],
  },
  actionsIcon: {
    width: 17,
    height: 17,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  actionDot: {
    width: 6,
    height: 6,
    borderRadius: 2,
    backgroundColor: V.colors.info,
  },
});
