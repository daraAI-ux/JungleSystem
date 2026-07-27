import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {useKolamChatRailReadonlyData} from '../hooks/use-kolam-chat-rail-readonly-data';
import {KolamBadge} from './kolam-badge';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamIconButton} from './kolam-icon-button';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamTopNavigationChatIcon} from './kolam-top-navigation-chat-icon';
import {KolamXIcon} from './kolam-x-icon';

export type KolamGlobalChatRailMode = 'inbox' | 'team-chat';

export function KolamGlobalChatRail({
  mode,
  onClose,
}: {
  mode: KolamGlobalChatRailMode;
  onClose: () => void;
}) {
  const content = getChatRailContent(mode);
  const data = useKolamChatRailReadonlyData({mode});
  const items = getChatRailItems(mode, data);

  return (
    <View accessibilityLabel={content.accessibilityLabel} style={styles.rail}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <View style={styles.iconShell}>
            <KolamTopNavigationChatIcon kind={content.iconKind} />
          </View>
          <View style={styles.copyGroup}>
            <Text style={styles.eyebrow}>Chat</Text>
            <Text style={styles.title}>{content.title}</Text>
          </View>
        </View>
        <KolamIconButton
          accessibilityLabel="Tutup panel chat"
          onPress={onClose}
          size={32}
          radius="full"
          variant="ghost">
          <KolamXIcon color={V.colors.mutedFg} />
        </KolamIconButton>
      </View>

      <View style={styles.body}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCopy}>
            <Text style={styles.placeholderTitle}>
              {content.placeholderTitle}
            </Text>
            <Text style={styles.placeholderCopy}>{content.placeholderCopy}</Text>
          </View>
          <KolamBadge
            intent={data.totalUnread > 0 ? 'primary' : 'muted'}
            label={data.totalUnread > 99 ? '99+' : data.totalUnread}
          />
        </View>

        <Text style={styles.metaText}>
          {data.loading
            ? 'Memuat data read-only...'
            : `${items.length} item terpantau`}
        </Text>

        {data.errorMessage ? (
          <KolamEmptyState
            compact
            message={data.errorMessage}
            title="Data chat belum bisa dibaca"
          />
        ) : null}

        {!data.loading && !data.errorMessage && items.length === 0 ? (
          <KolamEmptyState
            compact
            message={content.emptyMessage}
            title={content.emptyTitle}
          />
        ) : null}

        {!data.errorMessage && items.length > 0 ? (
          <View style={styles.list}>
            <KolamMappedList
              items={items}
              limit={6}
              getKey={item => item.id}
              renderItem={item => (
                <View style={styles.row}>
                  <View style={styles.rowCopy}>
                    <Text numberOfLines={1} style={styles.rowTitle}>
                      {item.title}
                    </Text>
                    <Text numberOfLines={2} style={styles.rowPreview}>
                      {item.preview}
                    </Text>
                  </View>
                  {item.unreadCount > 0 ? (
                    <KolamBadge
                      intent="primary"
                      label={item.unreadCount > 99 ? '99+' : item.unreadCount}
                    />
                  ) : null}
                </View>
              )}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function getChatRailContent(mode: KolamGlobalChatRailMode) {
  if (mode === 'team-chat') {
    return {
      accessibilityLabel: 'Panel kanan Team chat',
      iconKind: 'team' as const,
      placeholderTitle: 'Team chat siap dipasang',
      placeholderCopy:
        'Read-only room dan unread sudah terhubung. Stream realtime dan detail pesan masuk di fase berikutnya.',
      emptyTitle: 'Belum ada room aktif',
      emptyMessage: 'Room team chat akan muncul di sini setelah backend mengirim data.',
      title: 'Team chat',
    };
  }

  return {
    accessibilityLabel: 'Panel kanan Pesan masuk',
    iconKind: 'inbox' as const,
    placeholderTitle: 'Inbox siap dipasang',
    placeholderCopy:
      'Read-only conversation unread sudah terhubung. Detail pesan dan aksi balas masuk di fase berikutnya.',
    emptyTitle: 'Tidak ada pesan unread',
    emptyMessage: 'Conversation unread dari marketplace akan muncul di sini.',
    title: 'Pesan masuk',
  };
}

function getChatRailItems(
  mode: KolamGlobalChatRailMode,
  data: ReturnType<typeof useKolamChatRailReadonlyData>,
) {
  if (mode === 'team-chat') {
    return data.rooms.map(room => ({
      id: room._id,
      preview: room.lastMessagePreview || room.category || 'Room team chat',
      title: room.name || 'Room tanpa nama',
      unreadCount: room.unreadCount ?? 0,
    }));
  }

  return data.conversations.map(conversation => ({
    id: conversation._id,
    preview:
      conversation.lastMessagePreview ||
      conversation.platform ||
      'Conversation marketplace',
    title: getConversationTitle(conversation),
    unreadCount: conversation.unreadCount ?? 0,
  }));
}

function getConversationTitle({
  contactId,
  platform,
}: {
  contactId?: string | {displayName?: string};
  platform?: string;
}) {
  if (contactId && typeof contactId === 'object') {
    const displayName = contactId.displayName?.trim();
    if (displayName) {
      return displayName;
    }
  }

  return platform ? platform : 'Conversation';
}

const styles = StyleSheet.create({
  rail: {
    width: 360,
    minWidth: 360,
    maxWidth: 360,
    backgroundColor: V.colors.bg,
    borderLeftColor: V.colors.border,
    borderLeftWidth: 1,
  },
  header: {
    minHeight: V.layout.topNavHeight,
    paddingHorizontal: 14,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleGroup: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconShell: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  copyGroup: {
    minWidth: 0,
    flex: 1,
  },
  eyebrow: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '800',
  },
  body: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  summaryCopy: {
    minWidth: 0,
    flex: 1,
  },
  placeholderTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '800',
  },
  placeholderCopy: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
  metaText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    gap: 8,
  },
  row: {
    minHeight: 58,
    padding: 10,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowCopy: {
    minWidth: 0,
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  rowPreview: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
});
