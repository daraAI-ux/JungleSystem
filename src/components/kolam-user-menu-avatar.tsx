import React from 'react';
import {KolamInlineFrame} from './kolam-inline-frame';
import {KolamProfileAvatarContent} from './kolam-profile-avatar-content';
import {userMenuPanelStyles as styles} from './kolam-user-menu-panel-styles';

export function KolamUserMenuAvatar({
  initials,
  profilePhotoUrl,
}: {
  initials: string;
  profilePhotoUrl?: string | null;
}) {
  return (
    <KolamInlineFrame variant="userMenuAvatar">
      <KolamProfileAvatarContent
        imageStyle={styles.userMenuAvatarImage}
        imageUrl={profilePhotoUrl}
        initials={initials}
        textStyle={styles.userMenuAvatarText}
      />
    </KolamInlineFrame>
  );
}
