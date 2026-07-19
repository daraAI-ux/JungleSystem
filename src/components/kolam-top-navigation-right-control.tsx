import React from 'react';
import type {TopNavRightControl} from '../domain/top-nav';
import {KolamTopNavigationAvatarButton} from './kolam-top-navigation-avatar-button';
import {KolamTopNavigationNotificationButton} from './kolam-top-navigation-notification-button';

export function KolamTopNavigationRightControl({
  attentionCount,
  control,
  displayInitials,
  onAvatarPress,
  onNotificationPress,
  profilePhotoUrl,
}: {
  attentionCount: number;
  control: TopNavRightControl;
  displayInitials: string;
  onAvatarPress: () => void;
  onNotificationPress: () => void;
  profilePhotoUrl?: string | null;
}) {
  if (control.id === 'notifications') {
    return (
      <KolamTopNavigationNotificationButton
        attentionCount={attentionCount}
        onNotificationPress={onNotificationPress}
      />
    );
  }

  return (
    <KolamTopNavigationAvatarButton
      displayInitials={displayInitials}
      onAvatarPress={onAvatarPress}
      profilePhotoUrl={profilePhotoUrl}
    />
  );
}
