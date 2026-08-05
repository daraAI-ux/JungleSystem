import React from 'react';
import {Image, StyleSheet} from 'react-native';

const NOTIFICATION_BELL_ICON = require('../assets/icons/notification-bell.png');

export interface KolamNotificationBellIconProps {
  color?: string;
}

export function KolamNotificationBellIcon(
  _props: KolamNotificationBellIconProps,
) {
  return (
    <Image
      resizeMode="contain"
      source={NOTIFICATION_BELL_ICON}
      style={styles.icon}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    height: 22,
    width: 22,
  },
});
