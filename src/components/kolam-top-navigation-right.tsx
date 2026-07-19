import React from 'react';
import type {TopNavRightControl} from '../domain/top-nav';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamTopNavigationRightControl} from './kolam-top-navigation-right-control';

export function KolamTopNavigationRight({
  attentionCount,
  displayInitials,
  onAvatarPress,
  onNotificationPress,
  profilePhotoUrl,
  rightControls,
}: {
  attentionCount: number;
  displayInitials: string;
  onAvatarPress: () => void;
  onNotificationPress: () => void;
  profilePhotoUrl?: string | null;
  rightControls: TopNavRightControl[];
}) {
  return (
    <KolamListFrame variant="topNavRight">
      <KolamMappedList
        items={rightControls}
        getKey={control => control.id}
        renderItem={control => (
          <KolamTopNavigationRightControl
            attentionCount={attentionCount}
            control={control}
            displayInitials={displayInitials}
            onAvatarPress={onAvatarPress}
            onNotificationPress={onNotificationPress}
            profilePhotoUrl={profilePhotoUrl}
          />
        )}
      />
    </KolamListFrame>
  );
}
