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
import type {
  KolamChatAnalytics,
  KolamChatStaffRef,
  KolamTeamChatAttachment,
  KolamTeamChatCallParticipant,
  KolamTeamChatPresence,
} from '../services/kolam-api';
import {getKolamChatAnalytics} from '../services/kolam-api';
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

interface KolamChatRailAnalyticsState {
  data: KolamChatAnalytics | null;
  errorMessage?: string;
  loading: boolean;
}

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
  const [analyticsState, setAnalyticsState] =
    React.useState<KolamChatRailAnalyticsState>({
      data: null,
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

      syncFromLiveClassification(classification);

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
    if (selectedItemId && !items.some(item => item.id === selectedItemId)) {
      setSelectedItemId(null);
      setComposerText('');
      setPendingAttachment(null);
    }
  }, [items, selectedItemId]);

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

    if (pendingAttachment) {
      await detail.sendAttachment(pendingAttachment, body);
      setPendingAttachment(null);
      setComposerText('');
      detail.signalTyping(false);
      return;
    }

    await detail.sendMessage(body);
    setComposerText('');
    detail.signalTyping(false);
  }, [composerText, detail, pendingAttachment]);

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
            detail={detail}
            mode={mode}
            onComposerTextChange={handleComposerTextChange}
            onPendingAttachmentClear={() => setPendingAttachment(null)}
            onPendingAttachmentPick={handleChooseAttachment}
            onSend={handleSend}
            pendingAttachment={pendingAttachment}
            selectedItem={selectedItem}
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
  detail,
  mode,
  onComposerTextChange,
  onPendingAttachmentClear,
  onPendingAttachmentPick,
  onSend,
  pendingAttachment,
  selectedItem,
}: {
  composerText: string;
  currentUserId?: string;
  detail: ReturnType<typeof useKolamChatRailDetail>;
  mode: KolamGlobalChatRailMode;
  onComposerTextChange: (value: string) => void;
  onPendingAttachmentClear: () => void;
  onPendingAttachmentPick: () => void;
  onSend: () => void;
  pendingAttachment: NativeImagePickerResult | null;
  selectedItem: ReturnType<typeof getChatRailItems>[number];
}) {
  const canSend = Boolean(composerText.trim() || pendingAttachment);
  const attachmentLabel = pendingAttachment
    ? pendingAttachment.name ?? pendingAttachment.path ?? pendingAttachment.uri ?? 'File'
    : '';

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
        {mode === 'inbox' ? (
          <KolamInboxActionStrip currentUserId={currentUserId} detail={detail} />
        ) : null}
      </View>

      <View style={styles.messagePane}>
        {detail.loading ? (
          <Text style={styles.metaText}>Memuat pesan...</Text>
        ) : null}

        {detail.errorMessage ? (
          <Text style={styles.errorText}>{detail.errorMessage}</Text>
        ) : null}

        {!detail.loading &&
        !detail.errorMessage &&
        detail.messages.length === 0 ? (
          <Text style={styles.emptyDetailText}>Belum ada pesan.</Text>
        ) : null}

        {detail.messages.length > 0 ? (
          <ScrollView
            style={styles.messageScroll}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator>
            <KolamMappedList
              items={detail.messages}
              getKey={message => message.id}
              renderItem={message => (
                <View
                  style={[
                    styles.messageBubble,
                    message.mine ? styles.messageBubbleMine : styles.messageBubbleOther,
                  ]}>
                  <Text style={styles.messageAuthor}>{message.author}</Text>
                  {message.body ? (
                    <Text style={styles.messageBody}>{message.body}</Text>
                  ) : null}
                  {message.attachments.length > 0 ? (
                    <KolamChatAttachmentList attachments={message.attachments} />
                  ) : null}
                  {mode === 'team-chat' ? (
                    <KolamChatReactionControls
                      disabled={detail.sending}
                      message={message}
                      onReact={emoji => detail.reactToMessage(message.id, emoji)}
                    />
                  ) : null}
                  <Text style={styles.messageMeta}>
                    {[formatRelativeTime(message.sentAt), message.status]
                      .filter(Boolean)
                      .join(' | ')}
                  </Text>
                </View>
              )}
            />
          </ScrollView>
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
        <TextInput
          accessibilityLabel={
            mode === 'team-chat'
              ? 'Tulis pesan team chat'
              : 'Tulis pesan inbox'
          }
          editable={!detail.sending}
          multiline
          onChangeText={onComposerTextChange}
          placeholder="Tulis pesan..."
          placeholderTextColor={V.colors.mutedFg}
          style={styles.composerInput}
          value={composerText}
        />
        <KolamPressable
          accessibilityLabel="Kirim pesan"
          disabled={!canSend || detail.sending}
          onPress={onSend}
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

function KolamInboxActionStrip({
  currentUserId,
  detail,
}: {
  currentUserId?: string;
  detail: ReturnType<typeof useKolamChatRailDetail>;
}) {
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

  return (
    <View style={styles.inboxActionStrip}>
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

function KolamChatReactionControls({
  disabled,
  message,
  onReact,
}: {
  disabled: boolean;
  message: ReturnType<typeof useKolamChatRailDetail>['messages'][number];
  onReact: (emoji: string) => void;
}) {
  return (
    <View style={styles.reactionControls}>
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
    maxHeight: 330,
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
  reactionControls: {
    gap: 5,
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
