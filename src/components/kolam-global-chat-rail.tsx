import React from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {useKolamAuthContext} from '../context/kolam-app-contexts';
import {classifyKolamChatLiveEvent} from '../domain/kolam-chat-live-classifier';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {
  type KolamChatLiveEvent,
  useKolamChatLiveStream,
} from '../hooks/use-kolam-chat-live-stream';
import {useKolamChatRailDetail} from '../hooks/use-kolam-chat-rail-detail';
import {useKolamChatRailLiveSync} from '../hooks/use-kolam-chat-rail-live-sync';
import {useKolamChatRailReadonlyData} from '../hooks/use-kolam-chat-rail-readonly-data';
import {useKolamNotificationSoundSettings} from '../hooks/use-kolam-notification-sound-settings';
import {getKolamFileUrl} from '../lib/file-url';
import {formatRupiah} from '../lib/money';
import type {
  KolamChatAnalytics,
  KolamChatContactDetails,
  KolamChatContactOrder,
  KolamChatLabel,
  KolamChatStaffRef,
  KolamChatTemplate,
  KolamTeamChatAttachment,
  KolamTeamChatBotPresence,
  KolamTeamChatCallParticipant,
  KolamTeamChatEmbed,
  KolamTeamChatLinkPreview,
  KolamTeamChatPresence,
  KolamTeamChatReplyPreview,
  KolamTeamChatUserRef,
} from '../services/kolam-api';
import {
  getKolamChatAnalytics,
  getKolamChatContactDetails,
  getKolamChatLabels,
  getKolamChatTemplates,
} from '../services/kolam-api';
import {createKolamNotificationSoundService} from '../services/kolam-notification-sound-service';
import {createKolamRuntimeNotificationSoundAdapter} from '../services/kolam-notification-sound-runtime';
import {
  pickNativeAssetFile,
  type NativeImagePickerResult,
} from '../services/native-file-picker';
import {KolamBadge} from './kolam-badge';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamIconButton} from './kolam-icon-button';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamPressable} from './kolam-pressable';
import {KolamRemoteImage} from './kolam-remote-image';
import {KolamTopNavigationChatIcon} from './kolam-top-navigation-chat-icon';
import {KolamXIcon} from './kolam-x-icon';

export type KolamGlobalChatRailMode = 'inbox' | 'team-chat';

const TEAM_CHAT_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
const DARA_THINKING_DEFAULT_LINE = 'DARA sedang berpikir...';
const DARA_THINKING_ACTIVE_EVENTS = new Set([
  'dara.thinking',
  'dara.thinking.chunk',
]);
const DARA_THINKING_DONE_EVENTS = new Set(['dara.thinking.done']);

interface KolamChatRailAnalyticsState {
  data: KolamChatAnalytics | null;
  errorMessage?: string;
  loading: boolean;
}

interface KolamChatRailLabelsState {
  errorMessage?: string;
  items: KolamChatLabel[];
  loading: boolean;
}

interface KolamChatRailTemplatesState {
  errorMessage?: string;
  items: KolamChatTemplate[];
  loading: boolean;
}

interface KolamChatRailContactDetailsState {
  data: KolamChatContactDetails | null;
  errorMessage?: string;
  loading: boolean;
}

interface KolamTeamMentionOption {
  id: string;
  isAi?: boolean;
  label: string;
  username: string;
}

interface KolamChatRailReplyTarget {
  author: string;
  body: string;
  id: string;
}

type KolamTeamMentionTextPart =
  | {type: 'text'; value: string}
  | {type: 'mention'; raw: string; username: string};

interface KolamDaraThinkingLiveSignal {
  key: number;
  line: string;
  roomId: string;
  state: 'active' | 'done';
}

type KolamDaraThinkingLivePatch = Omit<KolamDaraThinkingLiveSignal, 'key'>;

export function KolamGlobalChatRail({
  mode,
  onClose,
}: {
  mode: KolamGlobalChatRailMode;
  onClose: () => void;
}) {
  const {authUser} = useKolamAuthContext();
  const content = getChatRailContent(mode);
  const data = useKolamChatRailReadonlyData({mode});
  const items = getChatRailItems(mode, data);
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(
    null,
  );
  const [composerText, setComposerText] = React.useState('');
  const [pendingAttachment, setPendingAttachment] =
    React.useState<NativeImagePickerResult | null>(null);
  const [replyTarget, setReplyTarget] =
    React.useState<KolamChatRailReplyTarget | null>(null);
  const [daraThinkingLiveSignal, setDaraThinkingLiveSignal] =
    React.useState<KolamDaraThinkingLiveSignal | null>(null);
  const daraThinkingSignalKeyRef = React.useRef(0);
  const [analyticsState, setAnalyticsState] =
    React.useState<KolamChatRailAnalyticsState>({
      data: null,
      loading: mode === 'inbox',
    });
  const [labelsState, setLabelsState] =
    React.useState<KolamChatRailLabelsState>({
      items: [],
      loading: mode === 'inbox',
    });
  const [templatesState, setTemplatesState] =
    React.useState<KolamChatRailTemplatesState>({
      items: [],
      loading: mode === 'inbox',
    });
  const selectedItem = items.find(item => item.id === selectedItemId) ?? null;
  const detail = useKolamChatRailDetail({
    currentUserId: authUser?.id,
    mode,
    selectedId: selectedItemId,
  });
  const {syncFromLiveClassification} = useKolamChatRailLiveSync({
    refreshDetail: detail.refresh,
    refreshList: data.refresh,
  });
  const soundSettings = useKolamNotificationSoundSettings();
  const notificationSoundService = React.useMemo(
    () =>
      createKolamNotificationSoundService({
        adapter: createKolamRuntimeNotificationSoundAdapter(),
      }),
    [],
  );
  const handleLiveEvent = React.useCallback(
    (event: KolamChatLiveEvent) => {
      const classification = classifyKolamChatLiveEvent(event, {
        currentUserId: authUser?.id,
        selectedItemId,
      });
      const daraThinkingPatch = getDaraThinkingLivePatch(event, selectedItemId);

      syncFromLiveClassification(classification);

      if (daraThinkingPatch) {
        daraThinkingSignalKeyRef.current += 1;
        setDaraThinkingLiveSignal({
          ...daraThinkingPatch,
          key: daraThinkingSignalKeyRef.current,
        });
      }

      if (
        classification.refreshPresence &&
        classification.targetId === selectedItemId
      ) {
        const presence = getTeamChatPresenceFromLiveEvent(event);
        if (presence) {
          detail.updatePresenceFromLive(presence);
        }
      }

      if (classification.refreshCallState && classification.targetId === selectedItemId) {
        void detail.refreshCall();
      }

      Promise.resolve(
        notificationSoundService.play({
          intent: classification.soundIntent,
          webSetting: soundSettings.webSetting,
        }),
      ).catch(() => undefined);
    },
    [
      authUser?.id,
      detail,
      notificationSoundService,
      selectedItemId,
      soundSettings.webSetting,
      syncFromLiveClassification,
    ],
  );

  React.useEffect(() => {
    setSelectedItemId(null);
    setComposerText('');
    setPendingAttachment(null);
    setReplyTarget(null);
    setDaraThinkingLiveSignal(null);
  }, [mode]);

  React.useEffect(() => {
    if (mode !== 'inbox') {
      setAnalyticsState({data: null, loading: false});
      return;
    }

    let active = true;
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 30);

    setAnalyticsState(current => ({
      data: current.data,
      loading: true,
    }));

    getKolamChatAnalytics({
      from: from.toISOString(),
      to: to.toISOString(),
    })
      .then(data => {
        if (active) {
          setAnalyticsState({data, loading: false});
        }
      })
      .catch(error => {
        if (active) {
          setAnalyticsState({
            data: null,
            errorMessage:
              error instanceof Error
                ? error.message
                : 'Analisa chat belum bisa dibaca.',
            loading: false,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [mode]);

  React.useEffect(() => {
    if (mode !== 'inbox') {
      setLabelsState({items: [], loading: false});
      return;
    }

    let active = true;
    setLabelsState(current => ({
      items: current.items,
      loading: true,
    }));

    getKolamChatLabels()
      .then(items => {
        if (active) {
          setLabelsState({items, loading: false});
        }
      })
      .catch(error => {
        if (active) {
          setLabelsState({
            errorMessage:
              error instanceof Error
                ? error.message
                : 'Label chat belum bisa dibaca.',
            items: [],
            loading: false,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [mode]);

  React.useEffect(() => {
    if (mode !== 'inbox') {
      setTemplatesState({items: [], loading: false});
      return;
    }

    let active = true;
    setTemplatesState(current => ({
      items: current.items,
      loading: true,
    }));

    getKolamChatTemplates()
      .then(items => {
        if (active) {
          setTemplatesState({items, loading: false});
        }
      })
      .catch(error => {
        if (active) {
          setTemplatesState({
            errorMessage:
              error instanceof Error
                ? error.message
                : 'Template chat belum bisa dibaca.',
            items: [],
            loading: false,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [mode]);

  React.useEffect(() => {
    if (selectedItemId && !items.some(item => item.id === selectedItemId)) {
      setSelectedItemId(null);
      setComposerText('');
      setPendingAttachment(null);
      setReplyTarget(null);
    }
  }, [items, selectedItemId]);

  React.useEffect(() => {
    setReplyTarget(null);
  }, [selectedItemId]);

  const handleChooseAttachment = React.useCallback(async () => {
    if (mode !== 'team-chat' || detail.sending) {
      return;
    }

    const file = await pickNativeAssetFile();
    if (!file.cancelled) {
      setPendingAttachment(file);
    }
  }, [detail.sending, mode]);

  const handleSend = React.useCallback(async () => {
    const body = composerText.trim();
    if ((!body && !pendingAttachment) || detail.sending) {
      return;
    }

    const sendOptions =
      mode === 'team-chat' && replyTarget
        ? {replyToMessageId: replyTarget.id}
        : undefined;

    if (pendingAttachment) {
      if (sendOptions) {
        await detail.sendAttachment(pendingAttachment, body, sendOptions);
      } else {
        await detail.sendAttachment(pendingAttachment, body);
      }
      setPendingAttachment(null);
      setReplyTarget(null);
      setComposerText('');
      detail.signalTyping(false);
      return;
    }

    if (sendOptions) {
      await detail.sendMessage(body, sendOptions);
    } else {
      await detail.sendMessage(body);
    }
    setReplyTarget(null);
    setComposerText('');
    detail.signalTyping(false);
  }, [composerText, detail, mode, pendingAttachment, replyTarget]);

  const handleComposerTextChange = React.useCallback(
    (value: string) => {
      setComposerText(value);
      detail.signalTyping(Boolean(value.trim()));
    },
    [detail],
  );

  return (
    <View accessibilityLabel={content.accessibilityLabel} style={styles.rail}>
      <KolamChatRailLiveHost mode={mode} onEvent={handleLiveEvent} />
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

        {mode === 'inbox' ? (
          <KolamChatRailAnalyticsPanel state={analyticsState} />
        ) : null}

        {mode === 'inbox' ? <KolamChatRailSettingsShortcuts /> : null}

        {selectedItem ? (
          <KolamChatRailDetailPanel
            composerText={composerText}
            currentUserId={authUser?.id}
            daraThinkingLiveSignal={daraThinkingLiveSignal}
            detail={detail}
            labels={labelsState.items}
            mode={mode}
            onComposerTextChange={handleComposerTextChange}
            onPendingAttachmentClear={() => setPendingAttachment(null)}
            onPendingAttachmentPick={handleChooseAttachment}
            onReplyCancel={() => setReplyTarget(null)}
            onReplyToMessage={setReplyTarget}
            onSend={handleSend}
            pendingAttachment={pendingAttachment}
            replyTarget={replyTarget}
            selectedItem={selectedItem}
            templatesState={templatesState}
          />
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

function KolamChatRailLiveHost({
  mode,
  onEvent,
}: {
  mode: KolamGlobalChatRailMode;
  onEvent: (event: KolamChatLiveEvent) => void;
}) {
  useKolamChatLiveStream({
    mode,
    onEvent,
  });

  return null;
}

function KolamChatRailAnalyticsPanel({
  state,
}: {
  state: KolamChatRailAnalyticsState;
}) {
  const totalChats = getAnalyticsNumber(state.data, 'totalChats');
  const avgRating = getAnalyticsNumber(state.data, 'ratings.average');
  const avgReplyDelay = getAnalyticsNumber(state.data, 'avgReplyDelayMinutes');
  const lateReplyCount = getAnalyticsNumber(state.data, 'lateReplyCount');

  return (
    <View style={styles.analyticsPanel}>
      <View style={styles.analyticsHeader}>
        <Text style={styles.analyticsTitle}>Analisa chat</Text>
        <Text style={styles.analyticsPeriod}>30 hari</Text>
      </View>
      {state.loading ? (
        <Text style={styles.metaText}>Memuat analisa...</Text>
      ) : state.errorMessage ? (
        <Text style={styles.errorText}>{state.errorMessage}</Text>
      ) : (
        <View style={styles.analyticsGrid}>
          <KolamChatRailMetric label="Total" value={formatMetricNumber(totalChats)} />
          <KolamChatRailMetric label="Rating" value={formatRating(avgRating)} />
          <KolamChatRailMetric
            label="Delay"
            value={`${formatMetricNumber(avgReplyDelay)}m`}
          />
          <KolamChatRailMetric
            label="Telat"
            value={formatMetricNumber(lateReplyCount)}
          />
        </View>
      )}
    </View>
  );
}

function KolamChatRailMetric({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.analyticsMetric}>
      <Text style={styles.analyticsMetricLabel}>{label}</Text>
      <Text style={styles.analyticsMetricValue}>{value}</Text>
    </View>
  );
}

function KolamChatRailSettingsShortcuts() {
  return (
    <View style={styles.settingsPanel}>
      <Text style={styles.settingsTitle}>Pengaturan chat</Text>
      <View style={styles.settingsShortcutRow}>
        <Text style={styles.settingsShortcut}>Label percakapan</Text>
        <Text style={styles.settingsShortcut}>Template chat</Text>
      </View>
    </View>
  );
}

function KolamChatRailDetailPanel({
  composerText,
  currentUserId,
  daraThinkingLiveSignal,
  detail,
  labels,
  mode,
  onComposerTextChange,
  onPendingAttachmentClear,
  onPendingAttachmentPick,
  onReplyCancel,
  onReplyToMessage,
  onSend,
  pendingAttachment,
  replyTarget,
  selectedItem,
  templatesState,
}: {
  composerText: string;
  currentUserId?: string;
  daraThinkingLiveSignal: KolamDaraThinkingLiveSignal | null;
  detail: ReturnType<typeof useKolamChatRailDetail>;
  labels: KolamChatLabel[];
  mode: KolamGlobalChatRailMode;
  onComposerTextChange: (value: string) => void;
  onPendingAttachmentClear: () => void;
  onPendingAttachmentPick: () => void;
  onReplyCancel: () => void;
  onReplyToMessage: (message: KolamChatRailReplyTarget) => void;
  onSend: () => Promise<void> | void;
  pendingAttachment: NativeImagePickerResult | null;
  replyTarget: KolamChatRailReplyTarget | null;
  selectedItem: ReturnType<typeof getChatRailItems>[number];
  templatesState: KolamChatRailTemplatesState;
}) {
  const [templatePickerOpen, setTemplatePickerOpen] = React.useState(false);
  const [templateSearch, setTemplateSearch] = React.useState('');
  const [contactDetailsOpen, setContactDetailsOpen] = React.useState(false);
  const [daraThinkingLine, setDaraThinkingLine] = React.useState('');
  const [editingMessageId, setEditingMessageId] = React.useState<string | null>(
    null,
  );
  const [editingDraft, setEditingDraft] = React.useState('');
  const [messageSearchDraft, setMessageSearchDraft] = React.useState('');
  const [contactDetailsState, setContactDetailsState] =
    React.useState<KolamChatRailContactDetailsState>({
      data: null,
      loading: false,
    });
  const canSend = Boolean(composerText.trim() || pendingAttachment);
  const attachmentLabel = pendingAttachment
    ? pendingAttachment.name ?? pendingAttachment.path ?? pendingAttachment.uri ?? 'File'
    : '';
  const filteredTemplates = React.useMemo(
    () => filterChatTemplates(templatesState.items, templateSearch),
    [templateSearch, templatesState.items],
  );
  const displayedMessages =
    mode === 'team-chat' && detail.messageSearchResults
      ? detail.messageSearchResults
      : detail.messages;
  const isMessageSearchActive =
    mode === 'team-chat' && detail.messageSearchResults !== null;
  const mentionQuery =
    mode === 'team-chat' ? getTrailingMentionQuery(composerText) : null;
  const mentionOptions = React.useMemo(
    () =>
      mode === 'team-chat' && mentionQuery !== null
        ? buildTeamMentionOptions(
            detail.teamRoomMetadata.members,
            mentionQuery,
            detail.teamRoomMetadata.daraReplyEnabled,
            detail.teamRoomMetadata.bots,
          )
        : [],
    [
      detail.teamRoomMetadata.bots,
      detail.teamRoomMetadata.daraReplyEnabled,
      detail.teamRoomMetadata.members,
      mentionQuery,
      mode,
    ],
  );

  React.useEffect(() => {
    setTemplatePickerOpen(false);
    setTemplateSearch('');
    setDaraThinkingLine('');
    setEditingMessageId(null);
    setEditingDraft('');
    setMessageSearchDraft('');
    setContactDetailsOpen(false);
    setContactDetailsState({data: null, loading: false});
  }, [selectedItem.id]);

  React.useEffect(() => {
    if (
      daraThinkingLine &&
      detail.messages.some(message => !message.mine && message.author === 'DARA')
    ) {
      setDaraThinkingLine('');
    }
  }, [daraThinkingLine, detail.messages]);

  React.useEffect(() => {
    if (
      mode !== 'team-chat' ||
      !daraThinkingLiveSignal ||
      daraThinkingLiveSignal.roomId !== selectedItem.id
    ) {
      return;
    }

    if (daraThinkingLiveSignal.state === 'done') {
      setDaraThinkingLine('');
      return;
    }

    setDaraThinkingLine(
      daraThinkingLiveSignal.line || DARA_THINKING_DEFAULT_LINE,
    );
  }, [daraThinkingLiveSignal, mode, selectedItem.id]);

  const handleComposerInputChange = React.useCallback(
    (value: string) => {
      onComposerTextChange(value);
    },
    [onComposerTextChange],
  );

  const handlePickMention = React.useCallback(
    (username: string) => {
      const tag = `@${username} `;
      const nextText =
        composerText.match(/@([a-zA-Z0-9_.-]{0,32})$/) !== null
          ? composerText.replace(/@([a-zA-Z0-9_.-]{0,32})$/, tag)
          : `${composerText}${composerText.endsWith(' ') || !composerText ? '' : ' '}${tag}`;

      onComposerTextChange(nextText);
    },
    [composerText, onComposerTextChange],
  );

  const handleSendFromComposer = React.useCallback(async () => {
    if (
      shouldShowDaraThinking({
        body: composerText,
        daraReplyEnabled: detail.teamRoomMetadata.daraReplyEnabled,
      })
    ) {
      setDaraThinkingLine(DARA_THINKING_DEFAULT_LINE);
    }

    await onSend();
  }, [composerText, detail.teamRoomMetadata.daraReplyEnabled, onSend]);

  const handleStartEditMessage = React.useCallback(
    (message: ReturnType<typeof useKolamChatRailDetail>['messages'][number]) => {
      setEditingMessageId(message.id);
      setEditingDraft(message.body);
    },
    [],
  );

  const handleCancelEditMessage = React.useCallback(() => {
    setEditingMessageId(null);
    setEditingDraft('');
  }, []);

  const handleSaveEditMessage = React.useCallback(
    async (messageId: string) => {
      const body = editingDraft.trim();
      if (!body) {
        return;
      }

      await detail.editMessage(messageId, body);
      setEditingMessageId(null);
      setEditingDraft('');
    },
    [detail, editingDraft],
  );

  const handleSearchMessages = React.useCallback(async () => {
    const query = messageSearchDraft.trim();
    if (!query) {
      return;
    }

    await detail.searchTeamMessages(query);
  }, [detail, messageSearchDraft]);

  const handleClearMessageSearch = React.useCallback(() => {
    setMessageSearchDraft('');
    detail.clearTeamMessageSearch();
  }, [detail]);

  React.useEffect(() => {
    if (mode !== 'inbox' || !contactDetailsOpen) {
      return;
    }

    let active = true;
    setContactDetailsState(current => ({
      data: current.data,
      loading: true,
    }));

    getKolamChatContactDetails(selectedItem.id, {ordersLimit: 5})
      .then(data => {
        if (active) {
          setContactDetailsState({data, loading: false});
        }
      })
      .catch(error => {
        if (active) {
          setContactDetailsState({
            data: null,
            errorMessage:
              error instanceof Error
                ? error.message
                : 'Detail kontak belum bisa dibaca.',
            loading: false,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [contactDetailsOpen, mode, selectedItem.id]);

  return (
    <View style={styles.detailPanel}>
      <View style={styles.selectedBanner}>
        <Text numberOfLines={1} style={styles.selectedTitle}>
          {selectedItem.title}
        </Text>
        <Text numberOfLines={2} style={styles.selectedMeta}>
          {selectedItem.preview}
        </Text>
        {mode === 'team-chat' ? (
          <Text numberOfLines={1} style={styles.presenceMeta}>
            {formatTeamChatPresence(detail.presence)}
          </Text>
        ) : null}
        {mode === 'team-chat' ? (
          <KolamChatCallStrip currentUserId={currentUserId} detail={detail} />
        ) : null}
        {mode === 'team-chat' ? (
          <View style={styles.messageSearchBar}>
            <TextInput
              accessibilityLabel="Cari pesan team chat"
              editable={!detail.messageSearchLoading}
              onChangeText={setMessageSearchDraft}
              onSubmitEditing={() => void handleSearchMessages()}
              placeholder="Cari pesan..."
              placeholderTextColor={V.colors.mutedFg}
              style={styles.messageSearchInput}
              value={messageSearchDraft}
            />
            <KolamPressable
              accessibilityLabel="Jalankan pencarian pesan team chat"
              disabled={!messageSearchDraft.trim() || detail.messageSearchLoading}
              onPress={() => void handleSearchMessages()}
              style={[
                styles.messageSearchButton,
                (!messageSearchDraft.trim() || detail.messageSearchLoading) &&
                  styles.attachButtonDisabled,
              ]}>
              <Text style={styles.messageSearchButtonText}>
                {detail.messageSearchLoading ? '...' : 'Cari'}
              </Text>
            </KolamPressable>
            {isMessageSearchActive ? (
              <KolamPressable
                accessibilityLabel="Bersihkan pencarian pesan team chat"
                disabled={detail.messageSearchLoading}
                onPress={handleClearMessageSearch}
                style={[
                  styles.messageSearchButton,
                  styles.messageSearchButtonGhost,
                  detail.messageSearchLoading && styles.attachButtonDisabled,
                ]}>
                <Text style={styles.messageSearchButtonGhostText}>Reset</Text>
              </KolamPressable>
            ) : null}
          </View>
        ) : null}
        {mode === 'inbox' ? (
          <KolamInboxActionStrip
            currentUserId={currentUserId}
            detail={detail}
            detailsOpen={contactDetailsOpen}
            labels={labels}
            onDetailsToggle={() => setContactDetailsOpen(current => !current)}
          />
        ) : null}
      </View>

      {mode === 'inbox' && contactDetailsOpen ? (
        <KolamChatContactDetailsPanel
          conversation={detail.conversation}
          state={contactDetailsState}
        />
      ) : null}

      <View style={styles.messagePane}>
        {detail.loading ? (
          <Text style={styles.metaText}>Memuat pesan...</Text>
        ) : null}

        {detail.errorMessage ? (
          <Text style={styles.errorText}>{detail.errorMessage}</Text>
        ) : null}

        {!detail.loading &&
        !detail.errorMessage &&
        displayedMessages.length === 0 ? (
          <Text style={styles.emptyDetailText}>
            {isMessageSearchActive
              ? `Tidak ada hasil untuk "${detail.messageSearchQuery}".`
              : 'Belum ada pesan.'}
          </Text>
        ) : null}

        {isMessageSearchActive ? (
          <Text style={styles.messageSearchMeta}>
            {`${displayedMessages.length} hasil untuk "${detail.messageSearchQuery}"`}
          </Text>
        ) : null}

        {displayedMessages.length > 0 ? (
          <ScrollView
            style={styles.messageScroll}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator>
            <KolamMappedList
              items={displayedMessages}
              getKey={message => message.id}
              renderItem={message => {
                const isEditing = editingMessageId === message.id;
                const canEdit = canEditTeamChatMessage(message, currentUserId);

                return (
                  <View
                    style={[
                      styles.messageBubble,
                      message.mine
                        ? styles.messageBubbleMine
                        : styles.messageBubbleOther,
                    ]}>
                    <Text style={styles.messageAuthor}>{message.author}</Text>
                    {mode === 'team-chat' && message.replyPreview?.body ? (
                      <KolamTeamChatReplyPreviewCard
                        replyPreview={message.replyPreview}
                      />
                    ) : null}
                    {mode === 'team-chat' && isEditing ? (
                      <View style={styles.editMessageComposer}>
                        <TextInput
                          accessibilityLabel={`Edit pesan ${message.author}`}
                          editable={!detail.sending}
                          multiline
                          onChangeText={setEditingDraft}
                          placeholder="Edit pesan"
                          placeholderTextColor={V.colors.mutedFg}
                          style={styles.editMessageInput}
                          value={editingDraft}
                        />
                        <View style={styles.editMessageActions}>
                          <KolamPressable
                            accessibilityLabel="Batalkan edit pesan team chat"
                            disabled={detail.sending}
                            onPress={handleCancelEditMessage}
                            style={[
                              styles.editMessageButton,
                              detail.sending && styles.attachButtonDisabled,
                            ]}>
                            <Text style={styles.editMessageButtonText}>
                              Batal
                            </Text>
                          </KolamPressable>
                          <KolamPressable
                            accessibilityLabel="Simpan edit pesan team chat"
                            disabled={!editingDraft.trim() || detail.sending}
                            onPress={() => handleSaveEditMessage(message.id)}
                            style={[
                              styles.editMessageButton,
                              styles.editMessageButtonPrimary,
                              (!editingDraft.trim() || detail.sending) &&
                                styles.attachButtonDisabled,
                            ]}>
                            <Text style={styles.editMessageButtonPrimaryText}>
                              {detail.sending ? 'Menyimpan' : 'Simpan'}
                            </Text>
                          </KolamPressable>
                        </View>
                      </View>
                    ) : (
                      <>
                        {message.body ? (
                          mode === 'team-chat' ? (
                            <KolamTeamMentionText body={message.body} />
                          ) : (
                            <Text style={styles.messageBody}>{message.body}</Text>
                          )
                        ) : null}
                        {message.attachments.length > 0 ? (
                          <KolamChatAttachmentList
                            attachments={message.attachments}
                          />
                        ) : null}
                        {mode === 'team-chat' && message.linkPreviews.length > 0 ? (
                          <KolamChatLinkPreviewList
                            previews={message.linkPreviews}
                          />
                        ) : null}
                        {mode === 'team-chat' && message.embeds.length > 0 ? (
                          <KolamChatEmbedList embeds={message.embeds} />
                        ) : null}
                        {mode === 'team-chat' ? (
                          <KolamChatReactionControls
                            canEdit={canEdit}
                            disabled={detail.sending}
                            message={message}
                            onEdit={() => handleStartEditMessage(message)}
                            onReact={emoji =>
                              detail.reactToMessage(message.id, emoji)
                            }
                            onReply={() =>
                              onReplyToMessage({
                                author: message.author,
                                body: getTeamChatReplyTargetBody(message),
                                id: message.id,
                              })
                            }
                          />
                        ) : null}
                      </>
                    )}
                    <Text style={styles.messageMeta}>
                      {[
                        formatRelativeTime(message.sentAt),
                        getTeamChatEditedLabel(message),
                        message.status,
                      ]
                        .filter(Boolean)
                        .join(' | ')}
                    </Text>
                  </View>
                );
              }}
            />
          </ScrollView>
        ) : null}

        {daraThinkingLine ? (
          <KolamDaraThinkingBubble line={daraThinkingLine} />
        ) : null}
      </View>

      {pendingAttachment ? (
        <View style={styles.pendingAttachment}>
          <Text numberOfLines={1} style={styles.pendingAttachmentText}>
            {attachmentLabel}
          </Text>
          <KolamPressable
            accessibilityLabel="Hapus lampiran chat"
            disabled={detail.sending}
            onPress={onPendingAttachmentClear}
            style={styles.pendingAttachmentRemove}>
            <Text style={styles.pendingAttachmentRemoveText}>x</Text>
          </KolamPressable>
        </View>
      ) : null}

      {mode === 'team-chat' && replyTarget ? (
        <KolamTeamChatReplyComposerStrip
          disabled={detail.sending}
          onCancel={onReplyCancel}
          replyTarget={replyTarget}
        />
      ) : null}

      {mode === 'inbox' && templatePickerOpen ? (
        <KolamChatTemplatePicker
          onClose={() => setTemplatePickerOpen(false)}
          onPick={template => {
            onComposerTextChange(template.body);
            setTemplatePickerOpen(false);
          }}
          onSearchChange={setTemplateSearch}
          search={templateSearch}
          state={templatesState}
          templates={filteredTemplates}
        />
      ) : null}

      {mode === 'team-chat' && mentionOptions.length > 0 ? (
        <KolamTeamMentionPicker
          disabled={detail.sending}
          onPick={handlePickMention}
          options={mentionOptions}
        />
      ) : null}

      <View style={styles.composer}>
        {mode === 'team-chat' ? (
          <KolamPressable
            accessibilityLabel="Lampirkan file team chat"
            disabled={detail.sending}
            onPress={onPendingAttachmentPick}
            style={[
              styles.attachButton,
              detail.sending && styles.attachButtonDisabled,
            ]}>
            <Text style={styles.attachButtonText}>+</Text>
          </KolamPressable>
        ) : null}
        {mode === 'inbox' ? (
          <KolamPressable
            accessibilityLabel="Buka template chat"
            disabled={detail.sending}
            onPress={() => setTemplatePickerOpen(current => !current)}
            style={[
              styles.templateButton,
              templatePickerOpen && styles.templateButtonActive,
              detail.sending && styles.attachButtonDisabled,
            ]}>
            <Text style={styles.templateButtonText}>T</Text>
          </KolamPressable>
        ) : null}
        <TextInput
          accessibilityLabel={
            mode === 'team-chat'
              ? 'Tulis pesan team chat'
              : 'Tulis pesan inbox'
          }
          editable={!detail.sending}
          multiline
          onChangeText={handleComposerInputChange}
          placeholder={
            mode === 'team-chat' && !detail.teamRoomMetadata.daraReplyEnabled
              ? 'Tulis pesan... @dara nonaktif'
              : 'Tulis pesan...'
          }
          placeholderTextColor={V.colors.mutedFg}
          style={styles.composerInput}
          value={composerText}
        />
        <KolamPressable
          accessibilityLabel="Kirim pesan"
          disabled={!canSend || detail.sending}
          onPress={handleSendFromComposer}
          style={[
            styles.sendButton,
            (!canSend || detail.sending) && styles.sendButtonDisabled,
          ]}>
          <Text style={styles.sendButtonText}>
            {detail.sending ? 'Mengirim' : 'Kirim'}
          </Text>
        </KolamPressable>
      </View>
    </View>
  );
}

function KolamChatTemplatePicker({
  onClose,
  onPick,
  onSearchChange,
  search,
  state,
  templates,
}: {
  onClose: () => void;
  onPick: (template: KolamChatTemplate) => void;
  onSearchChange: (value: string) => void;
  search: string;
  state: KolamChatRailTemplatesState;
  templates: KolamChatTemplate[];
}) {
  return (
    <View style={styles.templatePicker}>
      <View style={styles.templatePickerHeader}>
        <View style={styles.templatePickerCopy}>
          <Text style={styles.templatePickerTitle}>Templates</Text>
          <Text style={styles.templatePickerMeta}>
            Pilih template untuk mengisi composer
          </Text>
        </View>
        <KolamPressable
          accessibilityLabel="Tutup template chat"
          onPress={onClose}
          style={styles.templatePickerClose}>
          <Text style={styles.templatePickerCloseText}>x</Text>
        </KolamPressable>
      </View>
      <TextInput
        accessibilityLabel="Cari template chat"
        onChangeText={onSearchChange}
        placeholder="Cari template..."
        placeholderTextColor={V.colors.mutedFg}
        style={styles.templateSearchInput}
        value={search}
      />
      {state.loading ? (
        <Text style={styles.templatePickerMessage}>Loading...</Text>
      ) : null}
      {!state.loading && state.errorMessage ? (
        <Text style={styles.templatePickerError}>{state.errorMessage}</Text>
      ) : null}
      {!state.loading && !state.errorMessage && templates.length === 0 ? (
        <Text style={styles.templatePickerMessage}>Tidak ada template.</Text>
      ) : null}
      {!state.loading && !state.errorMessage && templates.length > 0 ? (
        <ScrollView style={styles.templateListScroll} showsVerticalScrollIndicator>
          <KolamMappedList
            items={templates}
            getKey={template => template._id}
            renderItem={template => (
              <KolamPressable
                accessibilityLabel={`Pilih template ${template.title}`}
                onPress={() => onPick(template)}
                style={styles.templateRow}>
                <View style={styles.templateRowCopy}>
                  <Text numberOfLines={1} style={styles.templateRowTitle}>
                    {template.title}
                  </Text>
                  <Text numberOfLines={2} style={styles.templateRowBody}>
                    {template.body}
                  </Text>
                </View>
                <Text numberOfLines={1} style={styles.templateCategory}>
                  {template.category}
                </Text>
              </KolamPressable>
            )}
          />
        </ScrollView>
      ) : null}
    </View>
  );
}

function KolamTeamMentionPicker({
  disabled,
  onPick,
  options,
}: {
  disabled: boolean;
  onPick: (username: string) => void;
  options: KolamTeamMentionOption[];
}) {
  return (
    <View style={styles.mentionPicker}>
      <Text style={styles.mentionPickerTitle}>Tag anggota</Text>
      <View style={styles.mentionOptionList}>
        <KolamMappedList
          items={options}
          getKey={option => option.id}
          renderItem={option => (
            <KolamPressable
              accessibilityLabel={`Pilih mention ${option.username}`}
              disabled={disabled}
              onPress={() => onPick(option.username)}
              style={[
                styles.mentionOption,
                option.isAi && styles.mentionOptionAi,
                disabled && styles.attachButtonDisabled,
              ]}>
              <View style={[styles.mentionAvatar, option.isAi && styles.mentionAvatarAi]}>
                <Text style={styles.mentionAvatarText}>
                  {getMentionInitials(option.label)}
                </Text>
              </View>
              <View style={styles.mentionOptionCopy}>
                <Text numberOfLines={1} style={styles.mentionOptionLabel}>
                  {option.label}
                </Text>
                <Text numberOfLines={1} style={styles.mentionOptionUsername}>
                  @{option.username}
                </Text>
              </View>
            </KolamPressable>
          )}
        />
      </View>
    </View>
  );
}

function KolamTeamMentionText({body}: {body: string}) {
  const parts = splitTeamChatMentionText(body);

  return (
    <Text style={styles.messageBody}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return part.value;
        }

        const isDara = part.username.toLowerCase() === 'dara';
        return (
          <Text
            key={`m-${index}-${part.username}`}
            accessibilityLabel={
              isDara
                ? 'Mention DARA'
                : `Mention ${part.username}`
            }
            style={[styles.messageMention, isDara && styles.messageMentionAi]}>
            {part.raw}
          </Text>
        );
      })}
    </Text>
  );
}

function KolamTeamChatReplyPreviewCard({
  replyPreview,
}: {
  replyPreview: KolamTeamChatReplyPreview;
}) {
  const senderName = replyPreview.senderName?.trim() || 'Pesan';
  const body = replyPreview.body?.trim() || 'Lampiran';

  return (
    <View
      accessibilityLabel={`Reply preview ${senderName}`}
      style={styles.replyPreviewCard}>
      <Text numberOfLines={1} style={styles.replyPreviewSender}>
        {senderName}
      </Text>
      <Text numberOfLines={2} style={styles.replyPreviewBody}>
        {body}
      </Text>
    </View>
  );
}

function getTeamChatReplyTargetBody(
  message: ReturnType<typeof useKolamChatRailDetail>['messages'][number],
) {
  const body = message.body.trim();
  if (body) {
    return body;
  }

  if (message.attachments.length > 0) {
    return message.attachments[0]?.fileName ?? 'Lampiran';
  }

  if (message.embeds.length > 0) {
    return message.embeds[0]?.title?.trim() || message.embeds[0]?.refId || 'Embed';
  }

  if (message.linkPreviews.length > 0) {
    return message.linkPreviews[0]?.title ?? message.linkPreviews[0]?.url ?? 'Link';
  }

  return 'Pesan';
}

function canEditTeamChatMessage(
  message: ReturnType<typeof useKolamChatRailDetail>['messages'][number],
  currentUserId?: string,
) {
  return Boolean(
    currentUserId &&
      message.senderId &&
      message.senderId === currentUserId &&
      message.author !== 'DARA' &&
      message.body.trim(),
  );
}

function getTeamChatEditedLabel(
  message: ReturnType<typeof useKolamChatRailDetail>['messages'][number],
) {
  if (!message.editedAt) {
    return '';
  }

  const editorName = message.editedByName?.trim();
  return editorName ? `Diedit oleh ${editorName}` : 'Diedit';
}

function KolamTeamChatReplyComposerStrip({
  disabled,
  onCancel,
  replyTarget,
}: {
  disabled: boolean;
  onCancel: () => void;
  replyTarget: KolamChatRailReplyTarget;
}) {
  return (
    <View
      accessibilityLabel={`Membalas pesan ${replyTarget.author}`}
      style={styles.replyComposerStrip}>
      <View style={styles.replyComposerCopy}>
        <Text numberOfLines={1} style={styles.replyComposerTitle}>
          Balas {replyTarget.author}
        </Text>
        <Text numberOfLines={2} style={styles.replyComposerBody}>
          {replyTarget.body}
        </Text>
      </View>
      <KolamPressable
        accessibilityLabel="Batalkan balasan team chat"
        disabled={disabled}
        onPress={onCancel}
        style={[
          styles.replyComposerCancel,
          disabled && styles.attachButtonDisabled,
        ]}>
        <Text style={styles.replyComposerCancelText}>x</Text>
      </KolamPressable>
    </View>
  );
}

function KolamDaraThinkingBubble({line}: {line: string}) {
  return (
    <View accessibilityLabel="DARA thinking bubble" style={styles.daraThinkingRow}>
      <View style={styles.daraThinkingAvatar}>
        <Text style={styles.daraThinkingAvatarText}>DA</Text>
      </View>
      <View style={styles.daraThinkingCopy}>
        <Text style={styles.daraThinkingAuthor}>DARA</Text>
        <Text style={styles.daraThinkingText}>
          {line || DARA_THINKING_DEFAULT_LINE}
        </Text>
      </View>
    </View>
  );
}

function KolamChatContactDetailsPanel({
  conversation,
  state,
}: {
  conversation: ReturnType<typeof useKolamChatRailDetail>['conversation'];
  state: KolamChatRailContactDetailsState;
}) {
  const displayName = getConversationTitle({
    contactId: conversation?.contactId,
    platform: conversation?.platform,
  });
  const customer = state.data?.customer ?? null;
  const metrics = state.data?.metrics ?? {
    ordersCount: 0,
    totalOrders: 0,
    totalSpend: 0,
  };
  const recentOrders = state.data?.recentOrders ?? [];

  return (
    <View style={styles.contactDetailsPanel}>
      <View style={styles.contactDetailsHeader}>
        <View style={styles.contactAvatar}>
          <Text style={styles.contactAvatarText}>{getContactInitial(displayName)}</Text>
        </View>
        <View style={styles.contactHeaderCopy}>
          <Text numberOfLines={1} style={styles.contactName}>
            {displayName}
          </Text>
          <Text numberOfLines={1} style={styles.contactPlatform}>
            {formatInboxPlatform(conversation?.platform)}
          </Text>
        </View>
      </View>

      {state.loading ? (
        <Text style={styles.contactDetailsMessage}>Memuat detail kontak...</Text>
      ) : null}

      {!state.loading && state.errorMessage ? (
        <Text style={styles.contactDetailsError}>{state.errorMessage}</Text>
      ) : null}

      {!state.loading && !state.errorMessage ? (
        <ScrollView style={styles.contactDetailsScroll} showsVerticalScrollIndicator>
          <View style={styles.contactDetailsContent}>
            <KolamContactDetailsSection title="CONTACT">
              <KolamContactDetailRow label="Phone" value={customer?.phone || '-'} />
              <KolamContactDetailRow label="Email" value={customer?.email || '-'} />
              <KolamContactDetailRow
                label="Joined"
                value={customer?.createdAt ? formatJoinedMonth(customer.createdAt) : '-'}
              />
            </KolamContactDetailsSection>

            {customer ? (
              <KolamContactDetailsSection title="ACTIVITY">
                <KolamContactDetailRow
                  label="Total orders"
                  value={formatInteger(metrics.totalOrders)}
                />
                <KolamContactDetailRow
                  label="Total spend"
                  value={formatRupiah(metrics.totalSpend)}
                />
              </KolamContactDetailsSection>
            ) : null}

            {recentOrders.length > 0 ? (
              <KolamContactDetailsSection
                title={`ORDER HISTORY (${metrics.ordersCount})`}>
                <View style={styles.orderList}>
                  <KolamMappedList
                    items={recentOrders}
                    getKey={order => order._id}
                    renderItem={order => <KolamContactOrderRow order={order} />}
                  />
                </View>
              </KolamContactDetailsSection>
            ) : null}

            {!customer ? (
              <View style={styles.contactUnlinkedBox}>
                <Text style={styles.contactUnlinkedTitle}>
                  Kontak belum terhubung ke customer.
                </Text>
                <Text style={styles.contactUnlinkedCopy}>
                  Hubungkan lewat halaman Customer untuk melihat riwayat order.
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

function KolamContactDetailsSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <View style={styles.contactSection}>
      <Text style={styles.contactSectionTitle}>{title}</Text>
      <View style={styles.contactSectionBody}>{children}</View>
    </View>
  );
}

function KolamContactDetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.contactDetailRow}>
      <Text style={styles.contactDetailLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.contactDetailValue}>
        {value}
      </Text>
    </View>
  );
}

function KolamContactOrderRow({order}: {order: KolamChatContactOrder}) {
  return (
    <View style={styles.orderRow}>
      <View style={styles.orderCopy}>
        <Text numberOfLines={1} style={styles.orderInvoice}>
          {order.invoiceCode}
        </Text>
        <Text numberOfLines={1} style={styles.orderMeta}>
          {[formatOrderDate(order.transactionDate), `${order.itemsCount ?? 0} item`]
            .filter(Boolean)
            .join(' | ')}
        </Text>
      </View>
      <View style={styles.orderAmountGroup}>
        <Text numberOfLines={1} style={styles.orderAmount}>
          {formatRupiah(order.finalTotal ?? 0)}
        </Text>
        <Text style={styles.orderStatus}>{formatOrderStatus(order.status)}</Text>
      </View>
    </View>
  );
}

function KolamInboxActionStrip({
  currentUserId,
  detail,
  detailsOpen,
  labels,
  onDetailsToggle,
}: {
  currentUserId?: string;
  detail: ReturnType<typeof useKolamChatRailDetail>;
  detailsOpen: boolean;
  labels: KolamChatLabel[];
  onDetailsToggle: () => void;
}) {
  const [labelPickerOpen, setLabelPickerOpen] = React.useState(false);
  const conversation = detail.conversation;
  if (!conversation) {
    return null;
  }

  const isClosed = conversation.status === 'closed';
  const assignedStaffId = getChatStaffId(conversation.assignedStaffId);
  const assignedToMe = Boolean(
    currentUserId && assignedStaffId && assignedStaffId === currentUserId,
  );
  const assignedLabel = getChatStaffLabel(conversation.assignedStaffId);
  const displayLabels = getConversationLabels(conversation, labels);
  const activeLabelIds = new Set(getConversationLabelIds(conversation));
  const handleToggleLabel = (labelId: string) => {
    const nextLabelIds = activeLabelIds.has(labelId)
      ? Array.from(activeLabelIds).filter(id => id !== labelId)
      : [...Array.from(activeLabelIds), labelId];

    void detail.setInboxLabels(nextLabelIds);
  };

  return (
    <View style={styles.inboxActionStrip}>
      {displayLabels.length > 0 ? (
        <View style={styles.inboxLabelRow}>
          <KolamMappedList
            items={displayLabels}
            getKey={label => label._id}
            renderItem={label => <KolamChatLabelPill label={label} />}
          />
        </View>
      ) : null}
      <View style={styles.inboxActionMeta}>
        <Text style={styles.inboxActionTitle}>
          {isClosed ? 'Ditutup' : 'Open'}
        </Text>
        <Text numberOfLines={1} style={styles.inboxActionCopy}>
          {assignedLabel
            ? `CS: ${assignedLabel}`
            : conversation.isAiHandled
              ? 'DARA menangani'
              : 'Belum ditugaskan'}
        </Text>
      </View>
      <View style={styles.inboxActionButtons}>
        <KolamPressable
          accessibilityLabel="Toggle inbox label picker"
          disabled={detail.sending}
          onPress={() => setLabelPickerOpen(current => !current)}
          style={[
            styles.callButton,
            styles.callButtonGhost,
            labelPickerOpen && styles.callButtonActive,
            detail.sending && styles.callButtonDisabled,
          ]}>
          <Text style={styles.callButtonGhostText}>Label</Text>
        </KolamPressable>
        <KolamPressable
          accessibilityLabel="Toggle inbox contact details"
          disabled={detail.sending}
          onPress={onDetailsToggle}
          style={[
            styles.callButton,
            styles.callButtonGhost,
            detailsOpen && styles.callButtonActive,
            detail.sending && styles.callButtonDisabled,
          ]}>
          <Text style={styles.callButtonGhostText}>Detail kontak</Text>
        </KolamPressable>
        <KolamPressable
          accessibilityLabel="Toggle inbox conversation status"
          disabled={detail.sending}
          onPress={detail.toggleInboxStatus}
          style={[styles.callButton, detail.sending && styles.callButtonDisabled]}>
          <Text style={styles.callButtonText}>{isClosed ? 'Reopen' : 'Resolve'}</Text>
        </KolamPressable>
        {!isClosed && !assignedToMe && currentUserId ? (
          <KolamPressable
            accessibilityLabel="Assign inbox conversation to me"
            disabled={detail.sending}
            onPress={detail.assignInboxToMe}
            style={[
              styles.callButton,
              styles.callButtonGhost,
              detail.sending && styles.callButtonDisabled,
            ]}>
            <Text style={styles.callButtonGhostText}>Assign saya</Text>
          </KolamPressable>
        ) : null}
        {!isClosed && assignedStaffId ? (
          <KolamPressable
            accessibilityLabel="Unassign inbox conversation"
            disabled={detail.sending}
            onPress={detail.unassignInbox}
            style={[
              styles.callButton,
              styles.callButtonGhost,
              detail.sending && styles.callButtonDisabled,
            ]}>
            <Text style={styles.callButtonGhostText}>Unassign</Text>
          </KolamPressable>
        ) : null}
        {!isClosed ? (
          <KolamPressable
            accessibilityLabel="Toggle inbox AI handled"
            disabled={detail.sending}
            onPress={detail.toggleInboxAiHandled}
            style={[
              styles.callButton,
              styles.callButtonGhost,
              detail.sending && styles.callButtonDisabled,
            ]}>
            <Text style={styles.callButtonGhostText}>
              {conversation.isAiHandled ? 'AI off' : 'AI on'}
            </Text>
          </KolamPressable>
        ) : null}
      </View>
      {labelPickerOpen ? (
        <KolamInboxLabelPicker
          activeLabelIds={activeLabelIds}
          disabled={detail.sending}
          labels={labels}
          onToggleLabel={handleToggleLabel}
        />
      ) : null}
    </View>
  );
}

function KolamChatLabelPill({label}: {label: KolamChatLabel}) {
  return (
    <View style={styles.inboxLabelPill}>
      <View
        style={[
          styles.inboxLabelDot,
          {backgroundColor: normalizeChatLabelColor(label.color)},
        ]}
      />
      <Text numberOfLines={1} style={styles.inboxLabelText}>
        {label.name}
      </Text>
    </View>
  );
}

function KolamInboxLabelPicker({
  activeLabelIds,
  disabled,
  labels,
  onToggleLabel,
}: {
  activeLabelIds: Set<string>;
  disabled: boolean;
  labels: KolamChatLabel[];
  onToggleLabel: (labelId: string) => void;
}) {
  return (
    <View style={styles.inboxLabelPicker}>
      <Text style={styles.inboxLabelPickerTitle}>Label percakapan</Text>
      {labels.length === 0 ? (
        <Text style={styles.inboxLabelPickerEmpty}>Belum ada label.</Text>
      ) : (
        <View style={styles.inboxLabelOptionList}>
          <KolamMappedList
            items={labels}
            getKey={label => label._id}
            renderItem={label => {
              const active = activeLabelIds.has(label._id);
              return (
                <KolamPressable
                  accessibilityLabel={`Toggle label ${label.name}`}
                  disabled={disabled}
                  onPress={() => onToggleLabel(label._id)}
                  style={[
                    styles.inboxLabelOption,
                    active && styles.inboxLabelOptionActive,
                    disabled && styles.callButtonDisabled,
                  ]}>
                  <View
                    style={[
                      styles.inboxLabelDot,
                      {backgroundColor: normalizeChatLabelColor(label.color)},
                    ]}
                  />
                  <Text numberOfLines={1} style={styles.inboxLabelOptionText}>
                    {label.name}
                  </Text>
                  <Text style={styles.inboxLabelOptionMark}>
                    {active ? 'On' : 'Off'}
                  </Text>
                </KolamPressable>
              );
            }}
          />
        </View>
      )}
    </View>
  );
}

function KolamChatCallStrip({
  currentUserId,
  detail,
}: {
  currentUserId?: string;
  detail: ReturnType<typeof useKolamChatRailDetail>;
}) {
  if (!detail.callConfig.enabled) {
    return null;
  }

  const activeCall = detail.activeCall;
  const primaryLabel = detail.callBusy
    ? 'Memproses...'
    : activeCall
      ? getCallStatusLabel(activeCall.status)
      : 'Tidak ada call aktif';
  const secondaryLabel = activeCall
    ? `${activeCall.participantCount ?? activeCall.participants?.length ?? 0} peserta`
    : 'Siap mulai call grup';
  const myParticipant = activeCall?.participants?.find(
    participant => getCallParticipantUserId(participant) === currentUserId,
  );
  const handRaised = myParticipant?.handRaised === true;
  const noAnswerCount =
    activeCall?.participants?.filter(participant =>
      ['declined', 'no_answer'].includes(participant.status),
    ).length ?? 0;
  const participantControls =
    activeCall?.participants
      ?.map(participant => ({
        participant,
        userId: getCallParticipantUserId(participant),
      }))
      .filter(item => item.userId && item.userId !== currentUserId)
      .slice(0, 3) ?? [];

  return (
    <View style={styles.callStrip}>
      <View style={styles.callTopLine}>
        <View style={styles.callCopy}>
          <Text style={styles.callTitle}>{primaryLabel}</Text>
          <Text numberOfLines={1} style={styles.callMeta}>
            {detail.callErrorMessage || secondaryLabel}
          </Text>
        </View>
        <View style={styles.callActions}>
          {activeCall ? (
            <>
              <KolamPressable
                accessibilityLabel="Join team chat call"
                disabled={detail.callBusy}
                onPress={detail.joinCall}
                style={[styles.callButton, detail.callBusy && styles.callButtonDisabled]}>
                <Text style={styles.callButtonText}>Join</Text>
              </KolamPressable>
              {activeCall.status === 'ringing' ? (
                <KolamPressable
                  accessibilityLabel="Decline team chat call"
                  disabled={detail.callBusy}
                  onPress={detail.declineCall}
                  style={[
                    styles.callButton,
                    styles.callButtonGhost,
                    detail.callBusy && styles.callButtonDisabled,
                  ]}>
                  <Text style={styles.callButtonGhostText}>Tolak</Text>
                </KolamPressable>
              ) : null}
              <KolamPressable
                accessibilityLabel="End team chat call"
                disabled={detail.callBusy}
                onPress={detail.endCall}
                style={[
                  styles.callButton,
                  styles.callButtonDanger,
                  detail.callBusy && styles.callButtonDisabled,
                ]}>
                <Text style={styles.callButtonText}>End</Text>
              </KolamPressable>
            </>
          ) : (
            <KolamPressable
              accessibilityLabel="Start team chat call"
              disabled={detail.callBusy}
              onPress={detail.startCall}
              style={[styles.callButton, detail.callBusy && styles.callButtonDisabled]}>
              <Text style={styles.callButtonText}>Call</Text>
            </KolamPressable>
          )}
        </View>
      </View>
      {activeCall ? (
        <View style={styles.callAdvancedActions}>
          {myParticipant?.status === 'joined' ? (
            <KolamPressable
              accessibilityLabel="Toggle team chat call hand"
              disabled={detail.callBusy}
              onPress={detail.toggleCallHand}
              style={[
                styles.callButton,
                styles.callButtonGhost,
                detail.callBusy && styles.callButtonDisabled,
              ]}>
              <Text style={styles.callButtonGhostText}>
                {handRaised ? 'Turunkan' : 'Raise'}
              </Text>
            </KolamPressable>
          ) : null}
          {noAnswerCount > 0 ? (
            <KolamPressable
              accessibilityLabel="Redial team chat call"
              disabled={detail.callBusy}
              onPress={detail.redialCall}
              style={[
                styles.callButton,
                styles.callButtonGhost,
                detail.callBusy && styles.callButtonDisabled,
              ]}>
              <Text style={styles.callButtonGhostText}>
                Ulang {noAnswerCount}
              </Text>
            </KolamPressable>
          ) : null}
          <KolamPressable
            accessibilityLabel="Handover team chat call"
            disabled={detail.callBusy}
            onPress={detail.handoverCall}
            style={[
              styles.callButton,
              styles.callButtonGhost,
              detail.callBusy && styles.callButtonDisabled,
            ]}>
            <Text style={styles.callButtonGhostText}>Handover</Text>
          </KolamPressable>
        </View>
      ) : null}
      {participantControls.length > 0 ? (
        <View style={styles.callParticipantList}>
          <KolamMappedList
            items={participantControls}
            getKey={item => item.userId ?? 'participant'}
            renderItem={({participant, userId}) => (
              <View style={styles.callParticipantRow}>
                <Text numberOfLines={1} style={styles.callParticipantText}>
                  {getCallParticipantLabel(participant)}
                </Text>
                <KolamPressable
                  accessibilityLabel={`${participant.muted ? 'Unmute' : 'Mute'} team chat participant`}
                  disabled={detail.callBusy || !userId}
                  onPress={() =>
                    userId
                      ? participant.muted
                        ? detail.unmuteCallParticipant(userId)
                        : detail.muteCallParticipant(userId)
                      : undefined
                  }
                  style={[
                    styles.callButton,
                    styles.callButtonGhost,
                    detail.callBusy && styles.callButtonDisabled,
                  ]}>
                  <Text style={styles.callButtonGhostText}>
                    {participant.muted ? 'Unmute' : 'Mute'}
                  </Text>
                </KolamPressable>
              </View>
            )}
          />
        </View>
      ) : null}
    </View>
  );
}

function KolamChatAttachmentList({
  attachments,
}: {
  attachments: KolamTeamChatAttachment[];
}) {
  return (
    <View style={styles.attachmentList}>
      <KolamMappedList
        items={attachments}
        getKey={(attachment, index) =>
          `${attachment.url}-${attachment.fileName ?? attachment.kind}-${index}`
        }
        renderItem={attachment => (
          <KolamChatAttachmentPreview attachment={attachment} />
        )}
      />
    </View>
  );
}

function KolamChatAttachmentPreview({
  attachment,
}: {
  attachment: KolamTeamChatAttachment;
}) {
  const fileName = getAttachmentFileName(attachment);
  const sourceUri = getKolamFileUrl(attachment.url) ?? attachment.url;

  if (attachment.kind === 'image') {
    return (
      <View style={styles.attachmentImageShell}>
        <KolamRemoteImage
          accessibilityLabel={`Lampiran ${fileName}`}
          sourceUri={sourceUri}
          style={styles.attachmentImage}
        />
      </View>
    );
  }

  return (
    <View style={styles.attachmentFileRow}>
      <View style={styles.attachmentKindBadge}>
        <Text style={styles.attachmentKindText}>
          {getAttachmentKindLabel(attachment)}
        </Text>
      </View>
      <View style={styles.attachmentFileCopy}>
        <Text numberOfLines={1} style={styles.attachmentFileName}>
          {fileName}
        </Text>
        <Text numberOfLines={1} style={styles.attachmentFileMeta}>
          {attachment.mimeType || sourceUri}
        </Text>
      </View>
    </View>
  );
}

function KolamChatLinkPreviewList({
  previews,
}: {
  previews: KolamTeamChatLinkPreview[];
}) {
  return (
    <View style={styles.chatPreviewList}>
      <KolamMappedList
        items={previews}
        getKey={(preview, index) => `${preview.url}-${index}`}
        renderItem={preview => <KolamChatLinkPreview preview={preview} />}
      />
    </View>
  );
}

function KolamChatLinkPreview({
  preview,
}: {
  preview: KolamTeamChatLinkPreview;
}) {
  const previewImage = getTeamChatLinkPreviewImage(preview);
  const imageUri = previewImage ? getKolamFileUrl(previewImage) ?? previewImage : '';
  const title = preview.title?.trim() || preview.url;
  const description = preview.description?.trim();
  const siteName = preview.siteName?.trim();

  return (
    <View accessibilityLabel={`Link preview ${title}`} style={styles.chatPreviewCard}>
      {imageUri ? (
        <KolamRemoteImage
          accessibilityLabel={`Gambar link preview ${title}`}
          sourceUri={imageUri}
          style={styles.chatPreviewImage}
        />
      ) : null}
      <View style={styles.chatPreviewCopy}>
        {siteName ? (
          <Text numberOfLines={1} style={styles.chatPreviewKicker}>
            {siteName}
          </Text>
        ) : null}
        <Text numberOfLines={2} style={styles.chatPreviewTitle}>
          {title}
        </Text>
        {description ? (
          <Text numberOfLines={2} style={styles.chatPreviewDescription}>
            {description}
          </Text>
        ) : null}
        <Text numberOfLines={1} style={styles.chatPreviewUrl}>
          {preview.url}
        </Text>
      </View>
    </View>
  );
}

function KolamChatEmbedList({embeds}: {embeds: KolamTeamChatEmbed[]}) {
  return (
    <View style={styles.chatEmbedList}>
      <KolamMappedList
        items={embeds}
        getKey={(embed, index) => `${embed.type}-${embed.refId}-${index}`}
        renderItem={embed => <KolamChatEmbedCard embed={embed} />}
      />
    </View>
  );
}

function KolamChatEmbedCard({embed}: {embed: KolamTeamChatEmbed}) {
  const label = getTeamChatEmbedTypeLabel(embed.type);
  const title = embed.title?.trim() || embed.refId;
  const subtitle = embed.subtitle?.trim();
  const href = getTeamChatEmbedHref(embed);

  return (
    <View accessibilityLabel={`Embed ${label} ${title}`} style={styles.chatEmbedCard}>
      <View style={styles.chatEmbedIcon}>
        <Text style={styles.chatEmbedIconText}>{getTeamChatEmbedInitial(label)}</Text>
      </View>
      <View style={styles.chatEmbedCopy}>
        <Text numberOfLines={1} style={styles.chatEmbedKicker}>
          {label}
        </Text>
        <Text numberOfLines={1} style={styles.chatEmbedTitle}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={styles.chatEmbedSubtitle}>
            {subtitle}
          </Text>
        ) : null}
        {href ? (
          <Text numberOfLines={1} style={styles.chatEmbedUrl}>
            {href}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function KolamChatReactionControls({
  canEdit,
  disabled,
  message,
  onEdit,
  onReact,
  onReply,
}: {
  canEdit: boolean;
  disabled: boolean;
  message: ReturnType<typeof useKolamChatRailDetail>['messages'][number];
  onEdit: () => void;
  onReact: (emoji: string) => void;
  onReply: () => void;
}) {
  return (
    <View style={styles.reactionControls}>
      <View style={styles.messageActionRow}>
        <KolamPressable
          accessibilityLabel={`Balas pesan ${message.author}`}
          disabled={disabled}
          onPress={onReply}
          style={[styles.replyActionButton, disabled && styles.attachButtonDisabled]}>
          <Text style={styles.replyActionText}>Balas</Text>
        </KolamPressable>
        {canEdit ? (
          <KolamPressable
            accessibilityLabel={`Edit pesan ${message.author}`}
            disabled={disabled}
            onPress={onEdit}
            style={[
              styles.replyActionButton,
              styles.editActionButton,
              disabled && styles.attachButtonDisabled,
            ]}>
            <Text style={styles.replyActionText}>Edit</Text>
          </KolamPressable>
        ) : null}
      </View>
      {message.reactions.length > 0 ? (
        <View style={styles.reactionPills}>
          <KolamMappedList
            items={message.reactions}
            getKey={reaction => reaction.emoji}
            renderItem={reaction => (
              <KolamPressable
                accessibilityLabel={`Toggle reaction ${reaction.emoji}`}
                disabled={disabled}
                onPress={() => onReact(reaction.emoji)}
                style={[
                  styles.reactionPill,
                  reaction.mine && styles.reactionPillMine,
                ]}>
                <Text style={styles.reactionPillText}>
                  {reaction.emoji} {reaction.count}
                </Text>
              </KolamPressable>
            )}
          />
        </View>
      ) : null}
      <View style={styles.reactionPalette}>
        <KolamMappedList
          items={TEAM_CHAT_REACTIONS}
          getKey={emoji => emoji}
          renderItem={emoji => (
            <KolamPressable
              accessibilityLabel={`Reaksi ${emoji}`}
              disabled={disabled}
              onPress={() => onReact(emoji)}
              style={[
                styles.reactionButton,
                disabled && styles.reactionButtonDisabled,
              ]}>
              <Text style={styles.reactionButtonText}>{emoji}</Text>
            </KolamPressable>
          )}
        />
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

function formatInboxPlatform(platform?: string) {
  return platform ? getPlatformLabel(platform) : 'Marketplace';
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

function getTeamChatPresenceFromLiveEvent(
  event: KolamChatLiveEvent,
): KolamTeamChatPresence | null {
  if (!event.payload || typeof event.payload !== 'object') {
    return null;
  }

  const presence = (event.payload as {presence?: unknown}).presence;
  if (!presence || typeof presence !== 'object') {
    return null;
  }

  const record = presence as Partial<KolamTeamChatPresence>;
  return {
    onlineCount: Number.isFinite(record.onlineCount) ? record.onlineCount ?? 0 : 0,
    typingUserIds: Array.isArray(record.typingUserIds)
      ? record.typingUserIds.filter(id => typeof id === 'string')
      : [],
    viewingCount: Number.isFinite(record.viewingCount)
      ? record.viewingCount ?? 0
      : 0,
  };
}

function getDaraThinkingLivePatch(
  event: KolamChatLiveEvent,
  selectedItemId: string | null,
): KolamDaraThinkingLivePatch | null {
  if (!selectedItemId) {
    return null;
  }

  const eventName = event.contract.eventName;
  if (
    !DARA_THINKING_ACTIVE_EVENTS.has(eventName) &&
    !DARA_THINKING_DONE_EVENTS.has(eventName)
  ) {
    return null;
  }

  const payload =
    event.payload && typeof event.payload === 'object'
      ? (event.payload as Record<string, unknown>)
      : {};
  const roomId = getStringRecordValue(payload, ['roomId', 'room_id', 'room']);
  if (roomId && roomId !== selectedItemId) {
    return null;
  }

  if (DARA_THINKING_DONE_EVENTS.has(eventName)) {
    return {
      line: '',
      roomId: roomId || selectedItemId,
      state: 'done',
    };
  }

  return {
    line:
      typeof event.payload === 'string' && event.payload.trim()
        ? event.payload.trim()
        : getDaraThinkingLine(payload),
    roomId: roomId || selectedItemId,
    state: 'active',
  };
}

function getDaraThinkingLine(payload: Record<string, unknown>) {
  const directLine = getStringRecordValue(payload, [
    'line',
    'reasoningLine',
    'text',
    'chunk',
    'message',
    'status',
  ]);

  if (directLine) {
    return directLine;
  }

  const reasoningLines = payload.reasoningLines;
  if (Array.isArray(reasoningLines)) {
    const lastLine = [...reasoningLines]
      .reverse()
      .find(line => typeof line === 'string' && line.trim());
    if (typeof lastLine === 'string') {
      return lastLine.trim();
    }
  }

  return DARA_THINKING_DEFAULT_LINE;
}

function getStringRecordValue(
  record: Record<string, unknown>,
  keys: string[],
): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function formatTeamChatPresence(presence: KolamTeamChatPresence) {
  const parts = [
    presence.onlineCount > 0 ? `${presence.onlineCount} online` : 'Tidak ada yang online',
    presence.viewingCount > 0 ? `${presence.viewingCount} melihat` : '',
    presence.typingUserIds.length > 0
      ? `${presence.typingUserIds.length} mengetik...`
      : '',
  ].filter(Boolean);

  return parts.join(' · ');
}

function getCallStatusLabel(status: string) {
  switch (status) {
    case 'active':
      return 'Call aktif';
    case 'ringing':
      return 'Call berdering';
    case 'ended':
      return 'Call selesai';
    default:
      return 'Call';
  }
}

function getCallParticipantUserId(participant: KolamTeamChatCallParticipant) {
  return typeof participant.user === 'string' ? participant.user : participant.user?._id;
}

function getCallParticipantLabel(participant: KolamTeamChatCallParticipant) {
  const user = typeof participant.user === 'object' ? participant.user : null;
  const name = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
      user.username ||
      user.email
    : '';

  return name || getCallParticipantUserId(participant) || 'Participant';
}

function getChatStaffId(staff?: KolamChatStaffRef | string | null) {
  return typeof staff === 'string' ? staff : staff?._id;
}

function getChatStaffLabel(staff?: KolamChatStaffRef | string | null) {
  if (!staff || typeof staff === 'string') {
    return '';
  }

  return (
    [staff.first_name, staff.last_name].filter(Boolean).join(' ').trim() ||
    staff.username ||
    staff._id
  );
}

function getConversationLabels(
  conversation: NonNullable<
    ReturnType<typeof useKolamChatRailDetail>['conversation']
  >,
  labels: KolamChatLabel[],
) {
  if (Array.isArray(conversation.labels) && conversation.labels.length > 0) {
    return conversation.labels;
  }

  if (!Array.isArray(conversation.labelIds)) {
    return [];
  }

  const labelMap = new Map(labels.map(label => [label._id, label]));
  return conversation.labelIds
    .map(label => (typeof label === 'string' ? labelMap.get(label) : label))
    .filter((label): label is KolamChatLabel => Boolean(label));
}

function getConversationLabelIds(
  conversation: NonNullable<
    ReturnType<typeof useKolamChatRailDetail>['conversation']
  >,
) {
  const rawLabels =
    Array.isArray(conversation.labelIds) && conversation.labelIds.length > 0
      ? conversation.labelIds
      : conversation.labels;

  if (!Array.isArray(rawLabels)) {
    return [];
  }

  return Array.from(
    new Set(
      rawLabels
        .map(label => (typeof label === 'string' ? label : label._id))
        .filter((labelId): labelId is string => Boolean(labelId)),
    ),
  );
}

function filterChatTemplates(
  templates: KolamChatTemplate[],
  search: string,
): KolamChatTemplate[] {
  const needle = search.trim().toLowerCase();
  if (!needle) {
    return templates;
  }

  return templates.filter(template => {
    return (
      template.title.toLowerCase().includes(needle) ||
      template.body.toLowerCase().includes(needle)
    );
  });
}

function getTrailingMentionQuery(text: string): string | null {
  const match = text.match(/@([a-zA-Z0-9_.-]{0,32})$/);
  return match ? match[1] : null;
}

function splitTeamChatMentionText(body: string): KolamTeamMentionTextPart[] {
  const text = String(body ?? '');
  if (!text) {
    return [];
  }

  const parts: KolamTeamMentionTextPart[] = [];
  const mentionPattern = /@([a-zA-Z0-9_.-]{1,32})/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = mentionPattern.exec(text)) !== null) {
    const start = match.index;
    if (start > last) {
      parts.push({type: 'text', value: text.slice(last, start)});
    }

    parts.push({
      raw: match[0],
      type: 'mention',
      username: match[1],
    });
    last = start + match[0].length;
  }

  if (last < text.length) {
    parts.push({type: 'text', value: text.slice(last)});
  }

  return parts.length > 0 ? parts : [{type: 'text', value: text}];
}

function shouldShowDaraThinking({
  body,
  daraReplyEnabled,
}: {
  body: string;
  daraReplyEnabled: boolean;
}) {
  if (!daraReplyEnabled) {
    return false;
  }

  return /@dara\b/i.test(String(body || ''));
}

function buildTeamMentionOptions(
  members: KolamTeamChatUserRef[],
  query: string,
  includeDara: boolean,
  bots: KolamTeamChatBotPresence[] = [],
): KolamTeamMentionOption[] {
  const q = query.toLowerCase();
  const options: KolamTeamMentionOption[] = [];

  if (includeDara && (!q || 'dara'.includes(q) || q.includes('dar'))) {
    options.push({id: 'dara', isAi: true, label: 'DARA', username: 'dara'});
  }

  bots.forEach(bot => {
    const username = (bot.username || bot.botKey || '').trim();
    if (!username || username === 'dara' || bot.botKey === 'raja_anemon') {
      return;
    }

    const label = (bot.displayName || username).trim();
    const key = `${username} ${label} ${bot.botKey || ''}`.toLowerCase();
    if (q && !key.includes(q)) {
      return;
    }

    options.push({
      id: bot.botKey || username,
      isAi: true,
      label,
      username,
    });
  });

  members.forEach(member => {
    const username = (member.username || '').trim();
    if (!username) {
      return;
    }

    const label = getTeamChatUserLabel(member);
    const key = `${username} ${label}`.toLowerCase();
    if (q && !key.includes(q)) {
      return;
    }

    options.push({id: member._id || username, label, username});
  });

  return options.slice(0, 12);
}

function getTeamChatUserLabel(user: KolamTeamChatUserRef) {
  return (
    [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
    user.username ||
    user.email ||
    'User'
  );
}

function getMentionInitials(label: string) {
  const words = label.trim().split(/\s+/).filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();

  return initials || '@';
}

function normalizeChatLabelColor(color?: string) {
  const value = color?.trim();
  if (!value) {
    return V.colors.primary;
  }

  return value.startsWith('#') ? value : `#${value}`;
}

function getAttachmentFileName(attachment: KolamTeamChatAttachment) {
  if (attachment.fileName?.trim()) {
    return attachment.fileName.trim();
  }

  const pathName = attachment.url.split(/[\\/]/).pop()?.trim();
  return pathName || getAttachmentKindLabel(attachment);
}

function getAttachmentKindLabel(attachment: KolamTeamChatAttachment) {
  switch (attachment.kind) {
    case 'audio':
      return 'Audio';
    case 'image':
      return 'Gambar';
    case 'video':
      return 'Video';
    case 'file':
    default:
      return 'File';
  }
}

function getTeamChatEmbedTypeLabel(type: KolamTeamChatEmbed['type']) {
  switch (type) {
    case 'invoice':
      return 'Invoice';
    case 'task':
      return 'Tugas';
    case 'purchase_order':
      return 'Purchase Order';
    default:
      return 'Embed';
  }
}

function getTeamChatEmbedInitial(label: string) {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getTeamChatLinkPreviewImage(preview: KolamTeamChatLinkPreview) {
  const maybeImageUrl = (preview as {imageUrl?: unknown}).imageUrl;
  if (typeof maybeImageUrl === 'string' && maybeImageUrl.trim()) {
    return maybeImageUrl.trim();
  }

  return preview.image?.trim() ?? '';
}

function getTeamChatEmbedHref(embed: KolamTeamChatEmbed) {
  const maybeHref = (embed as {href?: unknown}).href;
  if (typeof maybeHref === 'string' && maybeHref.trim()) {
    return maybeHref.trim();
  }

  return embed.url?.trim() ?? '';
}

function getAnalyticsNumber(
  data: KolamChatAnalytics | null,
  path: string,
): number {
  const value = path.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') {
      return undefined;
    }

    return (current as Record<string, unknown>)[key];
  }, data);

  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function formatMetricNumber(value: number) {
  return String(Math.round(value));
}

function formatRating(value: number) {
  return value > 0 ? value.toFixed(1) : '-';
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatJoinedMonth(iso: string) {
  const timestamp = new Date(iso).getTime();
  if (!Number.isFinite(timestamp)) {
    return '-';
  }

  return new Date(iso).toLocaleDateString('id-ID', {
    month: 'short',
    year: 'numeric',
  });
}

function formatOrderDate(iso?: string) {
  if (!iso) {
    return '';
  }

  const timestamp = new Date(iso).getTime();
  if (!Number.isFinite(timestamp)) {
    return '';
  }

  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatOrderStatus(status: KolamChatContactOrder['status']) {
  switch (status) {
    case 'partial_paid':
      return 'Partial';
    case 'cancelled':
      return 'Cancelled';
    case 'draft':
      return 'Draft';
    case 'paid':
      return 'Paid';
    case 'pending':
      return 'Pending';
    case 'sent':
    default:
      return 'Sent';
  }
}

function getContactInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
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
  analyticsPanel: {
    padding: 10,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    gap: 8,
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  analyticsTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  analyticsPeriod: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  analyticsMetric: {
    minWidth: 0,
    flex: 1,
    padding: 7,
    borderRadius: V.radius.md,
    backgroundColor: V.colors.bg,
    gap: 2,
  },
  analyticsMetricLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  analyticsMetricValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
  },
  settingsPanel: {
    padding: 10,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    gap: 8,
  },
  settingsTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  settingsShortcutRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  settingsShortcut: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: V.radius.md,
    overflow: 'hidden',
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
    backgroundColor: V.colors.mutedSoft,
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
  presenceMeta: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  messageSearchBar: {
    marginTop: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  messageSearchInput: {
    minWidth: 0,
    flex: 1,
    minHeight: 32,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: V.colors.bg,
  },
  messageSearchButton: {
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: V.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.primary,
  },
  messageSearchButtonGhost: {
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  messageSearchButtonText: {
    color: V.colors.primaryFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  messageSearchButtonGhostText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  callStrip: {
    marginTop: 6,
    padding: 8,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    gap: 6,
  },
  inboxActionStrip: {
    marginTop: 6,
    padding: 8,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    gap: 7,
  },
  inboxLabelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  inboxLabelPill: {
    maxWidth: 130,
    minHeight: 23,
    paddingHorizontal: 7,
    borderRadius: 12,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  inboxLabelDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  inboxLabelText: {
    minWidth: 0,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  inboxLabelPicker: {
    padding: 8,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    gap: 6,
  },
  inboxLabelPickerTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  inboxLabelPickerEmpty: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  inboxLabelOptionList: {
    gap: 5,
  },
  inboxLabelOption: {
    minHeight: 30,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  inboxLabelOptionActive: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  inboxLabelOptionText: {
    minWidth: 0,
    flex: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  inboxLabelOptionMark: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '900',
  },
  inboxActionMeta: {
    gap: 2,
  },
  inboxActionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  inboxActionCopy: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  inboxActionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  callTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  callTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  callMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  callActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  callAdvancedActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  callParticipantList: {
    gap: 4,
  },
  callParticipantRow: {
    minHeight: 30,
    paddingLeft: 8,
    borderLeftColor: V.colors.border,
    borderLeftWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  callParticipantText: {
    minWidth: 0,
    flex: 1,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  callButton: {
    minHeight: 28,
    paddingHorizontal: 9,
    borderRadius: V.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.primary,
  },
  callButtonGhost: {
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  callButtonActive: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  callButtonDanger: {
    backgroundColor: V.colors.danger,
  },
  callButtonDisabled: {
    opacity: 0.55,
  },
  callButtonText: {
    color: V.colors.primaryFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  callButtonGhostText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  detailPanel: {
    maxHeight: 560,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    overflow: 'hidden',
  },
  messagePane: {
    minHeight: 120,
    maxHeight: 190,
    padding: 10,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    gap: 8,
  },
  messageSearchMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  messageScroll: {
    maxHeight: 170,
  },
  messageList: {
    gap: 8,
    paddingBottom: 4,
  },
  messageBubble: {
    maxWidth: '86%',
    padding: 9,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    gap: 3,
  },
  messageBubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.primary,
  },
  messageBubbleOther: {
    alignSelf: 'flex-start',
  },
  messageAuthor: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  messageBody: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  messageMention: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  messageMentionAi: {
    color: V.colors.danger,
  },
  daraThinkingRow: {
    maxWidth: '86%',
    padding: 9,
    borderRadius: V.radius.lg,
    borderColor: V.colors.primary,
    borderWidth: 1,
    backgroundColor: V.colors.primarySoft,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  daraThinkingAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.primary,
  },
  daraThinkingAvatarText: {
    color: V.colors.primaryFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '900',
  },
  daraThinkingCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  daraThinkingAuthor: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  daraThinkingText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  attachmentList: {
    gap: 6,
  },
  attachmentImageShell: {
    width: 180,
    height: 118,
    borderRadius: V.radius.lg,
    overflow: 'hidden',
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  attachmentImage: {
    width: 180,
    height: 118,
  },
  attachmentFileRow: {
    minHeight: 44,
    padding: 8,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attachmentKindBadge: {
    minWidth: 44,
    height: 24,
    borderRadius: V.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.secondary,
  },
  attachmentKindText: {
    color: V.colors.secondaryFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '900',
  },
  attachmentFileCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  attachmentFileName: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  attachmentFileMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  replyPreviewCard: {
    width: 220,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderLeftColor: V.colors.primary,
    borderLeftWidth: 2,
    borderRadius: V.radius.md,
    backgroundColor: V.colors.secondary,
    gap: 2,
  },
  replyPreviewSender: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  replyPreviewBody: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  replyComposerStrip: {
    marginHorizontal: 10,
    marginBottom: 8,
    minHeight: 44,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderLeftColor: V.colors.primary,
    borderLeftWidth: 3,
    borderRadius: 8,
    backgroundColor: V.colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replyComposerCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  replyComposerTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  replyComposerBody: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  replyComposerCancel: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.bg,
  },
  replyComposerCancelText: {
    color: V.colors.secondaryFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  chatPreviewList: {
    gap: 6,
  },
  chatPreviewCard: {
    width: 220,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: V.colors.bg,
  },
  chatPreviewImage: {
    width: 220,
    height: 92,
  },
  chatPreviewCopy: {
    padding: 8,
    gap: 3,
  },
  chatPreviewKicker: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  chatPreviewTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  chatPreviewDescription: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  chatPreviewUrl: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '700',
  },
  chatEmbedList: {
    gap: 6,
  },
  chatEmbedCard: {
    width: 220,
    minHeight: 54,
    padding: 8,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatEmbedIcon: {
    width: 34,
    height: 34,
    borderRadius: V.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.secondary,
  },
  chatEmbedIconText: {
    color: V.colors.secondaryFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  chatEmbedCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  chatEmbedKicker: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  chatEmbedTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  chatEmbedSubtitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  chatEmbedUrl: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '700',
  },
  reactionControls: {
    gap: 5,
  },
  messageActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  replyActionButton: {
    alignSelf: 'flex-start',
    minHeight: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.secondary,
  },
  editActionButton: {
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  replyActionText: {
    color: V.colors.secondaryFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  editMessageComposer: {
    gap: 8,
  },
  editMessageInput: {
    minHeight: 64,
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    backgroundColor: V.colors.bg,
    textAlignVertical: 'top',
  },
  editMessageActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editMessageButton: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  editMessageButtonPrimary: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primary,
  },
  editMessageButtonText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  editMessageButtonPrimaryText: {
    color: V.colors.primaryFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  reactionPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  reactionPill: {
    minHeight: 24,
    paddingHorizontal: 7,
    borderRadius: 12,
    borderColor: V.colors.border,
    borderWidth: 1,
    justifyContent: 'center',
    backgroundColor: V.colors.bg,
  },
  reactionPillMine: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  reactionPillText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  reactionPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  reactionButton: {
    width: 26,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.secondary,
  },
  reactionButtonDisabled: {
    opacity: 0.55,
  },
  reactionButtonText: {
    color: V.colors.secondaryFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  messageMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  emptyDetailText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  mentionPicker: {
    marginHorizontal: 10,
    marginBottom: 8,
    padding: 8,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    gap: 6,
  },
  mentionPickerTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  mentionOptionList: {
    gap: 5,
  },
  mentionOption: {
    minHeight: 38,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mentionOptionAi: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  mentionAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.secondary,
  },
  mentionAvatarAi: {
    backgroundColor: V.colors.primary,
  },
  mentionAvatarText: {
    color: V.colors.primaryFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  mentionOptionCopy: {
    minWidth: 0,
    flex: 1,
    gap: 1,
  },
  mentionOptionLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  mentionOptionUsername: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  pendingAttachment: {
    marginHorizontal: 10,
    marginBottom: 8,
    minHeight: 32,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingAttachmentText: {
    minWidth: 0,
    flex: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  pendingAttachmentRemove: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.secondary,
  },
  pendingAttachmentRemoveText: {
    color: V.colors.secondaryFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  templatePicker: {
    marginHorizontal: 10,
    marginBottom: 8,
    maxHeight: 230,
    padding: 10,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    gap: 8,
  },
  templatePickerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  templatePickerCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  templatePickerTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  templatePickerMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  templatePickerClose: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.secondary,
  },
  templatePickerCloseText: {
    color: V.colors.secondaryFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  templateSearchInput: {
    minHeight: 34,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: V.radius.md,
    borderColor: V.colors.input,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    backgroundColor: V.colors.bg,
  },
  templatePickerMessage: {
    paddingVertical: 10,
    textAlign: 'center',
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  templatePickerError: {
    paddingVertical: 10,
    textAlign: 'center',
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  templateListScroll: {
    maxHeight: 126,
  },
  templateRow: {
    minHeight: 52,
    padding: 8,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  templateRowCopy: {
    minWidth: 0,
    flex: 1,
    gap: 3,
  },
  templateRowTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  templateRowBody: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
  },
  templateCategory: {
    maxWidth: 76,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 9,
    color: V.colors.secondaryFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '900',
    backgroundColor: V.colors.secondary,
  },
  contactDetailsPanel: {
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 8,
    maxHeight: 230,
    padding: 10,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    gap: 8,
  },
  contactDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  contactAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.primarySoft,
  },
  contactAvatarText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '900',
  },
  contactHeaderCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  contactName: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  contactPlatform: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  contactDetailsScroll: {
    maxHeight: 166,
  },
  contactDetailsContent: {
    gap: 10,
    paddingBottom: 2,
  },
  contactDetailsMessage: {
    paddingVertical: 10,
    textAlign: 'center',
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  contactDetailsError: {
    paddingVertical: 10,
    textAlign: 'center',
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  contactSection: {
    gap: 5,
  },
  contactSectionTitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0,
  },
  contactSectionBody: {
    gap: 4,
  },
  contactDetailRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  contactDetailLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  contactDetailValue: {
    minWidth: 0,
    flex: 1,
    textAlign: 'right',
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  orderList: {
    gap: 5,
  },
  orderRow: {
    minHeight: 48,
    paddingVertical: 6,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  orderCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  orderInvoice: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  orderMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  orderAmountGroup: {
    maxWidth: 110,
    alignItems: 'flex-end',
    gap: 3,
  },
  orderAmount: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  orderStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    color: V.colors.secondaryFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '900',
    backgroundColor: V.colors.secondary,
  },
  contactUnlinkedBox: {
    padding: 10,
    borderRadius: V.radius.md,
    backgroundColor: V.colors.bg,
    gap: 4,
  },
  contactUnlinkedTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  contactUnlinkedCopy: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
    textAlign: 'center',
  },
  composer: {
    padding: 10,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  attachButton: {
    width: 38,
    height: 38,
    borderRadius: V.radius.lg,
    borderColor: V.colors.input,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.bg,
  },
  attachButtonDisabled: {
    opacity: 0.55,
  },
  attachButtonText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },
  templateButton: {
    width: 38,
    height: 38,
    borderRadius: V.radius.lg,
    borderColor: V.colors.input,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.bg,
  },
  templateButtonActive: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  templateButtonText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
  },
  composerInput: {
    minHeight: 38,
    maxHeight: 84,
    minWidth: 0,
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: V.radius.lg,
    borderColor: V.colors.input,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    backgroundColor: V.colors.bg,
  },
  sendButton: {
    minHeight: 38,
    minWidth: 66,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.primary,
  },
  sendButtonDisabled: {
    backgroundColor: V.colors.secondary,
  },
  sendButtonText: {
    color: V.colors.primaryFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
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
