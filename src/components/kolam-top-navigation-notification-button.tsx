import React from 'react';
import {KolamIconButton} from './kolam-icon-button';
import {KolamNotificationBadge} from './kolam-notification-badge';
import {KolamNotificationBellIcon} from './kolam-notification-bell-icon';

export function KolamTopNavigationNotificationButton({
  attentionCount,
  onNotificationPress,
}: {
  attentionCount: number;
  onNotificationPress: () => void;
}) {
  return (
    <KolamIconButton onPress={onNotificationPress} size={32} radius="full">
      <KolamNotificationBellIcon />
      <KolamNotificationBadge attentionCount={attentionCount} />
    </KolamIconButton>
  );
}
