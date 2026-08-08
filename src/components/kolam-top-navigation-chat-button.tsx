import React from 'react';
import {View} from 'react-native';
import {KolamIconButton} from './kolam-icon-button';
import {KolamNotificationBadge} from './kolam-notification-badge';
import {KolamTopNavigationChatIcon} from './kolam-top-navigation-chat-icon';

export function KolamTopNavigationChatButton({
  accessibilityLabel,
  kind,
  onPress,
  unreadCount = 0,
}: {
  accessibilityLabel: string;
  kind: 'inbox' | 'team';
  onPress: () => void;
  unreadCount?: number;
}) {
  return (
    <View>
      <KolamIconButton
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        size={28}
        radius="full"
        variant="ghost">
        <KolamTopNavigationChatIcon kind={kind} />
      </KolamIconButton>
      <KolamNotificationBadge attentionCount={unreadCount} />
    </View>
  );
}
