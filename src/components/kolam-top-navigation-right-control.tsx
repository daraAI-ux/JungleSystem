import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {TopNavRightControl} from '../domain/top-nav';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
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
    return (
      <KolamTopNavigationControlTooltip label={control.label}>
        <KolamTopNavigationCashflowHost onNavigate={onCashflowNavigate} />
      </KolamTopNavigationControlTooltip>
    );
  }

  if (control.id === 'chat-inbox' || control.id === 'chat-team') {
    const kind = control.id === 'chat-inbox' ? 'inbox' : 'team';

    return (
      <KolamTopNavigationControlTooltip label={control.label}>
        <KolamTopNavigationChatButton
          accessibilityLabel={control.label}
          kind={kind}
          onPress={() => onChatControlPress?.(control)}
          unreadCount={chatUnreadCounts?.[kind] ?? 0}
        />
      </KolamTopNavigationControlTooltip>
    );
  }

  if (control.id === 'task-manager') {
    return (
      <KolamTopNavigationControlTooltip label={control.label}>
        <KolamIconButton
          accessibilityLabel={control.label}
          onPress={() => onCashflowNavigate?.('/task-manager')}
          size={28}
          radius="full"
          variant="ghost">
          <KolamTopNavigationTaskIcon />
        </KolamIconButton>
      </KolamTopNavigationControlTooltip>
    );
  }

  if (control.id === 'app-downloads') {
    return (
      <KolamTopNavigationControlTooltip label={control.label}>
        <KolamIconButton
          accessibilityLabel={control.label}
          onPress={() => onCashflowNavigate?.('/app-downloads')}
          size={28}
          radius="full"
          variant="ghost">
          <KolamTopNavigationDownloadIcon />
        </KolamIconButton>
      </KolamTopNavigationControlTooltip>
    );
  }

  if (control.id === 'media') {
    return (
      <KolamTopNavigationControlTooltip label={control.label}>
        <KolamIconButton
          accessibilityLabel={control.label}
          onPress={() => onCashflowNavigate?.('/media')}
          size={28}
          radius="full"
          variant="ghost">
          <KolamTopNavigationMediaIcon />
        </KolamIconButton>
      </KolamTopNavigationControlTooltip>
    );
  }

  if (control.id === 'notifications') {
    return (
      <KolamTopNavigationControlTooltip label={control.label}>
        <KolamTopNavigationNotificationButton
          attentionCount={attentionCount}
          onNotificationPress={onNotificationPress}
        />
      </KolamTopNavigationControlTooltip>
    );
  }

  if (control.id === 'avatar') {
    return (
      <KolamTopNavigationControlTooltip label={control.label}>
        <KolamTopNavigationAvatarButton
          displayInitials={displayInitials}
          onAvatarPress={onAvatarPress}
          profilePhotoUrl={profilePhotoUrl}
        />
      </KolamTopNavigationControlTooltip>
    );
  }

  return null;
}

function KolamTopNavigationControlTooltip({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  const [visible, setVisible] = React.useState(false);
  const bubbleWidth = Math.min(220, Math.max(96, label.length * 8 + 28));

  return (
    <View
      onPointerEnter={() => setVisible(true)}
      onPointerLeave={() => setVisible(false)}
      style={[styles.tooltipRoot, visible ? styles.tooltipRootOpen : null]}>
      {children}
      {visible ? (
        <View
          pointerEvents="none"
          style={[styles.tooltipBubble, {width: bubbleWidth}]}>
          <Text numberOfLines={1} style={styles.tooltipText}>
            {label}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tooltipRoot: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    overflow: 'visible',
    position: 'relative',
    width: 28,
  },
  tooltipRootOpen: {
    elevation: 120,
    zIndex: 12000,
  },
  tooltipBubble: {
    alignItems: 'center',
    backgroundColor: V.colors.fg,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    elevation: 130,
    justifyContent: 'center',
    marginTop: 5,
    minHeight: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    top: '100%',
    zIndex: 13000,
  },
  tooltipText: {
    color: V.colors.bg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
});
