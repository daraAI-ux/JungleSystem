import React from 'react';
import {StyleSheet} from 'react-native';
import {KolamNotificationBadge} from './kolam-notification-badge';
import {KolamNotificationBellIcon} from './kolam-notification-bell-icon';
import {KolamPressable} from './kolam-pressable';

export function KolamTopNavigationNotificationButton({
  attentionCount,
  onNotificationPress,
}: {
  attentionCount: number;
  onNotificationPress: () => void;
}) {
  return (
    <KolamPressable
      accessibilityLabel="Notifikasi"
      onPress={onNotificationPress}
      style={styles.button}>
      <KolamNotificationBellIcon />
      <KolamNotificationBadge attentionCount={attentionCount} />
    </KolamPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    height: 32,
    justifyContent: 'center',
    position: 'relative',
    width: 32,
  },
});
