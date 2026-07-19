import React from 'react';
import {KolamInlineFrame} from './kolam-inline-frame';
import {KolamProfileAvatarContent} from './kolam-profile-avatar-content';
import {topNavigationStyles as styles} from './kolam-top-navigation-styles';

export function KolamTopNavigationAvatar({
  displayInitials,
  profilePhotoUrl,
}: {
  displayInitials: string;
  profilePhotoUrl?: string | null;
}) {
  return (
    <KolamInlineFrame variant="topNavigationAvatar">
      <KolamProfileAvatarContent
        imageStyle={styles.avatarImage}
        imageUrl={profilePhotoUrl}
        initials={displayInitials}
        textStyle={styles.avatarText}
      />
    </KolamInlineFrame>
  );
}
