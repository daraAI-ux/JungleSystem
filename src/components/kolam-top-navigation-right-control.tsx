import React from 'react';
import type {TopNavRightControl} from '../domain/top-nav';
import {KolamTopNavigationAvatarButton} from './kolam-top-navigation-avatar-button';
import {KolamTopNavigationCashflowHost} from './kolam-top-navigation-cashflow-host';
import {KolamTopNavigationChatButton} from './kolam-top-navigation-chat-button';
import {KolamTopNavigationNotificationButton} from './kolam-top-navigation-notification-button';
import {KolamTopNavigationTaskIcon} from './kolam-top-navigation-task-icon';
import {KolamIconButton} from './kolam-icon-button';

export function KolamTopNavigationRightControl({
  attentionCount,
  control,
  displayInitials,
  onAvatarPress,
  onCashflowNavigate,
  onChatControlPress,
  onNotificationPress,
  profilePhotoUrl,
}: {
  attentionCount: number;
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
    return (
      <KolamTopNavigationChatButton
        accessibilityLabel={control.label}
        kind={control.id === 'chat-inbox' ? 'inbox' : 'team'}
        onPress={() => onChatControlPress?.(control)}
      />
    );
  }

  if (control.id === 'task-manager') {
    return (
      <KolamIconButton
        accessibilityLabel={control.label}
        onPress={() => onCashflowNavigate?.('/task-manager')}
        size={32}
        radius="full">
        <KolamTopNavigationTaskIcon />
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
