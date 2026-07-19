import React from 'react';
import {StyleSheet, View} from 'react-native';
import {getTopNavChromeContract} from '../domain/top-nav';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamInteractionFrame} from './kolam-interaction-frame';

const TOP_NAV_CHROME = getTopNavChromeContract();

export interface KolamSidebarTriggerProps {
  onPress: () => void;
}

export function KolamSidebarTrigger({onPress}: KolamSidebarTriggerProps) {
  return (
    <KolamInteractionFrame onPress={onPress} style={styles.trigger}>
      <View style={styles.icon}>
        <View style={styles.rail} />
        <View style={styles.content} />
      </View>
    </KolamInteractionFrame>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: TOP_NAV_CHROME.triggerSize,
    height: TOP_NAV_CHROME.triggerSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: V.radius.sm,
  },
  icon: {
    width: 17,
    height: 15,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 4,
    borderColor: V.colors.mutedFg,
    borderWidth: 1.5,
  },
  rail: {
    width: 6,
    backgroundColor: V.colors.mutedFg,
    opacity: 0.18,
    borderRightColor: V.colors.mutedFg,
    borderRightWidth: 1.5,
  },
  content: {
    flex: 1,
    backgroundColor: V.colors.bg,
  },
});
