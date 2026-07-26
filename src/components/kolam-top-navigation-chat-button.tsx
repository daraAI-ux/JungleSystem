import React from 'react';
import {KolamIconButton} from './kolam-icon-button';
import {KolamTopNavigationChatIcon} from './kolam-top-navigation-chat-icon';

export function KolamTopNavigationChatButton({
  accessibilityLabel,
  kind,
  onPress,
}: {
  accessibilityLabel: string;
  kind: 'inbox' | 'team';
  onPress: () => void;
}) {
  return (
    <KolamIconButton
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      size={32}
      radius="full">
      <KolamTopNavigationChatIcon kind={kind} />
    </KolamIconButton>
  );
}
