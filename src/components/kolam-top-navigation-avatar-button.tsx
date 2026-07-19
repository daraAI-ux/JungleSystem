import React from 'react';
import {KolamIconButton} from './kolam-icon-button';
import {KolamTopNavigationAvatar} from './kolam-top-navigation-avatar';

export function KolamTopNavigationAvatarButton({
  displayInitials,
  onAvatarPress,
  profilePhotoUrl,
}: {
  displayInitials: string;
  onAvatarPress: () => void;
  profilePhotoUrl?: string | null;
}) {
  return (
    <KolamIconButton
      onPress={onAvatarPress}
      size={32}
      radius="full"
      variant="ghost">
      <KolamTopNavigationAvatar
        displayInitials={displayInitials}
        profilePhotoUrl={profilePhotoUrl}
      />
    </KolamIconButton>
  );
}
