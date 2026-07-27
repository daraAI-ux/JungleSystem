import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {useKolamChatRailReadonlyData} from '../hooks/use-kolam-chat-rail-readonly-data';
import {KolamBadge} from './kolam-badge';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamIconButton} from './kolam-icon-button';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamPressable} from './kolam-pressable';
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
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(
    null,
  );
  const selectedItem = items.find(item => item.id === selectedItemId) ?? null;

  React.useEffect(() => {
    setSelectedItemId(null);
  }, [mode]);

  React.useEffect(() => {
    if (selectedItemId && !items.some(item => item.id === selectedItemId)) {
      setSelectedItemId(null);
    }
  }, [items, selectedItemId]);

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
            : `${items.length} ${content.itemLabel} terpantau`}
        </Text>

        {selectedItem ? (
          <View style={styles.selectedBanner}>
            <Text numberOfLines={1} style={styles.selectedTitle}>
              {selectedItem.title}
            </Text>
            <Text numberOfLines={2} style={styles.selectedMeta}>
              {selectedItem.preview}
            </Text>
          </View>
        ) : null}

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
          <ScrollView
            style={styles.listScroll}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator>
            <KolamMappedList
              items={items}
              getKey={item => item.id}
              renderItem={item => (
                <KolamPressable
                  accessibilityLabel={`${content.selectLabel} ${item.title}`}
                  accessibilityState={{selected: item.id === selectedItemId}}
                  onPress={() => setSelectedItemId(item.id)}
                  style={[
                    styles.row,
                    item.id === selectedItemId && styles.rowSelected,
                  ]}>
                  <View style={styles.rowCopy}>
                    <View style={styles.rowTopLine}>
                      <Text numberOfLines={1} style={styles.rowTitle}>
                        {item.title}
                      </Text>
                      <Text style={styles.rowTime}>{item.timeLabel}</Text>
                    </View>
                    <Text numberOfLines={2} style={styles.rowPreview}>
                      {item.preview}
                    </Text>
                    <View style={styles.rowMetaLine}>
                      <KolamBadge
                        intent="muted"
                        label={item.metaLabel}
                        shape="square"
                      />
                      {item.secondaryMetaLabel ? (
                        <Text numberOfLines={1} style={styles.rowSubMeta}>
                          {item.secondaryMetaLabel}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  {item.unreadCount > 0 ? (
                    <KolamBadge
                      intent="primary"
                      label={item.unreadCount > 99 ? '99+' : item.unreadCount}
                    />
                  ) : null}
                </KolamPressable>
              )}
            />
          </ScrollView>
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
      itemLabel: 'room',
      selectLabel: 'Pilih room',
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
    itemLabel: 'conversation',
    selectLabel: 'Pilih conversation',
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
      metaLabel: getRoomCategoryLabel(room),
      preview: room.lastMessagePreview || 'Belum ada preview pesan.',
      secondaryMetaLabel: getRoomSecondaryMeta(room),
      timeLabel: formatRelativeTime(room.lastMessageAt),
      title: getRoomTitle(room),
      unreadCount: room.unreadCount ?? 0,
    }));
  }

  return data.conversations.map(conversation => ({
    id: conversation._id,
    metaLabel: conversation.platform
      ? getPlatformLabel(conversation.platform)
      : 'Marketplace',
    preview: getConversationPreview(conversation),
    secondaryMetaLabel: conversation.status === 'closed' ? 'Closed' : 'Open',
    timeLabel: formatRelativeTime(conversation.lastMessageAt),
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

function getRoomTitle({
  category,
  directPeerName,
  name,
}: {
  category?: string;
  directPeerName?: string;
  name?: string;
}) {
  if (category === 'direct' && directPeerName?.trim()) {
    return directPeerName.trim();
  }

  return name?.trim() || 'Room tanpa nama';
}

function getRoomCategoryLabel({
  category,
  isAiRoom,
  isDaraDirect,
  isGeneral,
}: {
  category?: string;
  isAiRoom?: boolean;
  isDaraDirect?: boolean;
  isGeneral?: boolean;
}) {
  if (isDaraDirect) {
    return 'DARA';
  }

  if (isAiRoom) {
    return 'AI room';
  }

  if (isGeneral) {
    return 'General';
  }

  if (!category) {
    return 'Room';
  }

  return category
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function getRoomSecondaryMeta({
  category,
  isAiRoom,
  isGeneral,
}: {
  category?: string;
  isAiRoom?: boolean;
  isGeneral?: boolean;
}) {
  if (isAiRoom) {
    return 'Asisten internal';
  }

  if (isGeneral) {
    return 'Room utama';
  }

  return category ? 'Team chat' : undefined;
}

function getPlatformLabel(platform: string) {
  return platform
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function getConversationDirectionPrefix(direction?: 'in' | 'out') {
  return direction === 'out' ? 'Anda: ' : '';
}

function getConversationPreview({
  lastMessageDirection,
  lastMessagePreview,
}: {
  lastMessageDirection?: 'in' | 'out';
  lastMessagePreview?: string;
}) {
  const preview = lastMessagePreview?.trim();

  if (!preview) {
    return 'Conversation marketplace';
  }

  return `${getConversationDirectionPrefix(lastMessageDirection)}${preview}`;
}

function formatRelativeTime(iso?: string | null) {
  if (!iso) {
    return '';
  }

  const timestamp = new Date(iso).getTime();
  if (!Number.isFinite(timestamp)) {
    return '';
  }

  const diffMs = Date.now() - timestamp;
  if (diffMs < 60_000) {
    return 'now';
  }

  if (diffMs < 3_600_000) {
    return `${Math.floor(diffMs / 60_000)}m`;
  }

  if (diffMs < 86_400_000) {
    return `${Math.floor(diffMs / 3_600_000)}h`;
  }

  if (diffMs < 604_800_000) {
    return `${Math.floor(diffMs / 86_400_000)}d`;
  }

  return new Date(iso).toLocaleDateString('id-ID');
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
  selectedBanner: {
    padding: 10,
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.primary,
    borderWidth: 1,
    gap: 3,
  },
  selectedTitle: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  selectedMeta: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  listScroll: {
    flex: 1,
    minHeight: 0,
  },
  list: {
    gap: 8,
    paddingBottom: 16,
  },
  row: {
    minHeight: 76,
    padding: 10,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowSelected: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  rowCopy: {
    minWidth: 0,
    flex: 1,
    gap: 5,
  },
  rowTopLine: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowTitle: {
    minWidth: 0,
    flex: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  rowTime: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  rowPreview: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  rowMetaLine: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowSubMeta: {
    minWidth: 0,
    flex: 1,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
});
