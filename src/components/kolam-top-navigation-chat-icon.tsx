import React from 'react';
import {StyleSheet, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export function KolamTopNavigationChatIcon({
  kind,
  color = V.colors.mutedFg,
}: {
  kind: 'inbox' | 'team';
  color?: string;
}) {
  if (kind === 'team') {
    return (
      <View style={styles.teamIcon}>
        <View style={[styles.teamHeadOne, {backgroundColor: color}]} />
        <View style={[styles.teamHeadTwo, {backgroundColor: color}]} />
        <View style={[styles.teamBody, {backgroundColor: color}]} />
      </View>
    );
  }

  return (
    <View style={styles.inboxIcon}>
      <View style={[styles.inboxFrame, {borderColor: color}]} />
      <View style={[styles.inboxLip, {borderColor: color}]} />
      <View style={[styles.inboxTray, {backgroundColor: color}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  inboxIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inboxFrame: {
    position: 'absolute',
    left: 2,
    right: 2,
    top: 4,
    bottom: 3,
    borderWidth: 1.5,
    borderRadius: 3,
  },
  inboxLip: {
    position: 'absolute',
    left: 5,
    right: 5,
    bottom: 6,
    height: 4,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  inboxTray: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 5,
    height: 1.5,
    borderRadius: 1,
  },
  teamIcon: {
    width: 18,
    height: 17,
  },
  teamHeadOne: {
    position: 'absolute',
    left: 3,
    top: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  teamHeadTwo: {
    position: 'absolute',
    right: 3,
    top: 4,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  teamBody: {
    position: 'absolute',
    left: 2,
    right: 2,
    bottom: 2,
    height: 6,
    borderRadius: 5,
  },
});
