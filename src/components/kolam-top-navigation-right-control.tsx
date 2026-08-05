import React from 'react';
import type {TopNavRightControl} from '../domain/top-nav';
import type {KolamChatUnreadCounts} from '../hooks/use-kolam-chat-notification-host';
import {KolamTopNavigationAvatarButton} from './kolam-top-navigation-avatar-button';
import {KolamTopNavigationCashflowHost} from './kolam-top-navigation-cashflow-host';
import {KolamTopNavigationChatButton} from './kolam-top-navigation-chat-button';
import {KolamTopNavigationDownloadIcon} from './kolam-top-navigation-download-icon';
import {KolamTopNavigationMediaIcon} from './kolam-top-navigation-media-icon';
import {KolamTopNavigationNotificationButton} from './kolam-top-navigation-notification-button';
import {KolamTopNavigationTaskIcon} from './kolam-top-navigation-task-icon';
import {KolamIconButton} from './kolam-icon-button';

export function KolamTopNavigationRightControl({
  attentionCount,
  chatUnreadCounts,
  control,
  displayInitials,
  onAvatarPress,
  onCashflowNavigate,
  onChatControlPress,
  onNotificationPress,
  profilePhotoUrl,
}: {
  attentionCount: number;
  chatUnreadCounts?: KolamChatUnreadCounts;
  control: TopNavRightControl;
  displayInitials: string;
  onAvatarPress: () => void;
  onCashflowNavigate?: (route: string) => void;
  onChatControlPress?: (control: TopNavRightControl) => void;
  onNotificationPress: () => void;
  profilePhotoUrl?: string | null;
}) {
  if (control.id === 'cashflow') {
    return <KolamTopNavigationCashflowHost onNavigate={onCashflowNavigate} />;
  }

  if (control.id === 'chat-inbox' || control.id === 'chat-team') {
    const kind = control.id === 'chat-inbox' ? 'inbox' : 'team';

    return (
      <KolamTopNavigationChatButton
        accessibilityLabel={control.label}
        kind={kind}
        onPress={() => onChatControlPress?.(control)}
        unreadCount={chatUnreadCounts?.[kind] ?? 0}
      />
    );
  }

  if (control.id === 'task-manager') {
    return (
      <KolamIconButton
        accessibilityLabel={control.label}
        onPress={() => onCashflowNavigate?.('/task-manager')}
        size={32}
        radius="full"
        variant="ghost">
        <KolamTopNavigationTaskIcon />
      </KolamIconButton>
    );
  }

  if (control.id === 'app-downloads') {
    return (
      <KolamIconButton
        accessibilityLabel={control.label}
        onPress={() => onCashflowNavigate?.('/app-downloads')}
        size={32}
        radius="full"
        variant="ghost">
        <KolamTopNavigationDownloadIcon />
      </KolamIconButton>
    );
  }

  if (control.id === 'media') {
    return (
      <KolamIconButton
        accessibilityLabel={control.label}
        onPress={() => onCashflowNavigate?.('/media')}
        size={32}
        radius="full"
        variant="ghost">
        <KolamTopNavigationMediaIcon />
      </KolamIconButton>
    );
  }

  if (control.id === 'notifications') {
    return (
      <KolamTopNavigationNotificationButton
        attentionCount={attentionCount}
        onNotificationPress={onNotificationPress}
      />
    );
  }

  if (control.id === 'avatar') {
    return (
      <KolamTopNavigationAvatarButton
        displayInitials={displayInitials}
        onAvatarPress={onAvatarPress}
        profilePhotoUrl={profilePhotoUrl}
      />
    );
  }

  return null;
}
