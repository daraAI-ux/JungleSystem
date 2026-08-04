import React from 'react';
import type {TopNavRightControl} from '../domain/top-nav';
import type {KolamChatUnreadCounts} from '../hooks/use-kolam-chat-notification-host';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamTopNavigationRightControl} from './kolam-top-navigation-right-control';

export function KolamTopNavigationRight({
  attentionCount,
  chatUnreadCounts,
  displayInitials,
  onAvatarPress,
  onCashflowNavigate,
  onChatControlPress,
  onNotificationPress,
  profilePhotoUrl,
  rightControls,
}: {
  attentionCount: number;
  chatUnreadCounts?: KolamChatUnreadCounts;
  displayInitials: string;
  onAvatarPress: () => void;
  onCashflowNavigate?: (route: string) => void;
  onChatControlPress?: (control: TopNavRightControl) => void;
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
            chatUnreadCounts={chatUnreadCounts}
            control={control}
            displayInitials={displayInitials}
            onAvatarPress={onAvatarPress}
            onCashflowNavigate={onCashflowNavigate}
            onChatControlPress={onChatControlPress}
            onNotificationPress={onNotificationPress}
            profilePhotoUrl={profilePhotoUrl}
          />
        )}
      />
    </KolamListFrame>
  );
}
