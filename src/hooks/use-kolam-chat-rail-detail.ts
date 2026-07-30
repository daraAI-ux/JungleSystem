import {useCallback, useEffect, useRef, useState} from 'react';
import type {KolamGlobalChatRailMode} from '../components/kolam-global-chat-rail';
import {
  attachKolamChatMarketplaceProduct,
  assignKolamChatConversation,
  declineKolamTeamChatCall,
  endKolamTeamChatCall,
  editKolamChatMessage,
  editKolamTeamChatMessage,
  getKolamChatConversation,
  getKolamChatMessages,
  getKolamRoomActiveTeamChatCall,
  getKolamTeamChatMembers,
  getKolamTeamChatMessages,
  getKolamTeamChatCallConfig,
  handoverKolamTeamChatCall,
  joinKolamTeamChatCall,
  lowerKolamTeamChatCallHand,
  markKolamChatConversationRead,
  markKolamTeamChatRoomRead,
  muteKolamTeamChatCallParticipant,
  postKolamTeamChatPresence,
  raiseKolamTeamChatCallHand,
  redialKolamTeamChatCall,
  searchKolamTeamChatMessages,
  sendKolamChatImageMessage,
  sendKolamChatTextMessage,
  sendKolamTeamChatMessage,
  startKolamTeamChatCall,
  toggleKolamTeamChatReaction,
  type KolamChatConversation,
  type KolamChatDaraMessageMeta,
  type KolamChatMarketplaceListingHit,
  type KolamChatMessage,
  type KolamChatMessageContent,
  type KolamChatReplyContent,
  type KolamTeamChatCall,
  type KolamTeamChatCallConfig,
  type KolamTeamChatCallParticipant,
  type KolamTeamChatReaction,
  type KolamTeamChatAttachment,
  type KolamTeamChatBotPresence,
  type KolamTeamChatDaraPresence,
  type KolamTeamChatEmbed,
  type KolamTeamChatLinkPreview,
  type KolamTeamChatMessage,
  type KolamTeamChatPresence,
  type KolamTeamChatReplyPreview,
  type KolamTeamChatUserRef,
  unmuteKolamTeamChatCallParticipant,
  updateKolamChatConversationAiHandled,
  updateKolamChatConversationLabels,
  updateKolamChatConversationStatus,
  uploadKolamChatImage,
  uploadKolamTeamChatMedia,
} from '../services/kolam-api';
import type {NativeImagePickerResult} from '../services/native-file-picker';

const EMPTY_TEAM_CHAT_PRESENCE: KolamTeamChatPresence = {
  onlineCount: 0,
  typingUserIds: [],
  viewingCount: 0,
};

const EMPTY_TEAM_ROOM_METADATA: KolamChatRailTeamRoomMetadata = {
  bots: [],
  canManageAiRoomAccess: false,
  dara: null,
  daraReplyEnabled: true,
  members: [],
};

export interface KolamChatRailDetailReactionGroup {
  count: number;
  emoji: string;
  mine: boolean;
}

export interface KolamChatRailDetailMessage {
  attachments: KolamTeamChatAttachment[];
  content?: KolamChatMessageContent | null;
  daraMeta?: KolamChatDaraMessageMeta | null;
  embeds: KolamTeamChatEmbed[];
  id: string;
  author: string;
  body: string;
  linkPreviews: KolamTeamChatLinkPreview[];
  mine: boolean;
  reactions: KolamChatRailDetailReactionGroup[];
  replyContent?: KolamChatReplyContent | null;
  replyPreview?: KolamTeamChatReplyPreview | null;
  senderId?: string | null;
  sentAt?: string;
  editedAt?: string | null;
  editedByName?: string | null;
  status?: string;
}

export interface KolamChatRailSendMessageOptions {
  replyToMessageId?: string | null;
}

export interface KolamChatRailRefreshOptions {
  quiet?: boolean;
}

export interface KolamChatRailTeamRoomMetadata {
  bots: KolamTeamChatBotPresence[];
  canManageAiRoomAccess: boolean;
  dara: KolamTeamChatDaraPresence | null;
  daraReplyEnabled: boolean;
  members: KolamTeamChatUserRef[];
}

export interface KolamChatRailDetailState {
  activeCall: KolamTeamChatCall | null;
  assignInboxToMe: (handoverNote?: string) => Promise<void>;
  callBusy: boolean;
  callConfig: KolamTeamChatCallConfig;
  callErrorMessage?: string;
  conversation: KolamChatConversation | null;
  declineCall: () => Promise<void>;
  endCall: () => Promise<void>;
  errorMessage?: string;
  handoverCall: () => Promise<void>;
  joinCall: () => Promise<void>;
  loading: boolean;
  messages: KolamChatRailDetailMessage[];
  messageSearchLoading: boolean;
  messageSearchQuery: string;
  messageSearchResults: KolamChatRailDetailMessage[] | null;
  muteCallParticipant: (userId: string) => Promise<void>;
  presence: KolamTeamChatPresence;
  clearTeamMessageSearch: () => void;
  editMessage: (messageId: string, body: string) => Promise<void>;
  patchInboxMessageFromLive: (
    messageId: string,
    patch: Partial<KolamChatMessage>,
  ) => void;
  upsertInboxMessageFromLive: (message: KolamChatMessage) => void;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  redialCall: () => Promise<void>;
  refreshCall: () => Promise<void>;
  searchTeamMessages: (query: string) => Promise<void>;
  sendAttachment: (
    file: NativeImagePickerResult,
    text?: string,
    options?: KolamChatRailSendMessageOptions,
  ) => Promise<void>;
  sendInboxImage: (
    file: NativeImagePickerResult,
    options?: KolamChatRailSendMessageOptions,
  ) => Promise<void>;
  refresh: (options?: KolamChatRailRefreshOptions) => Promise<void>;
  sendMessage: (
    text: string,
    options?: KolamChatRailSendMessageOptions,
  ) => Promise<void>;
  sendMarketplaceProduct: (
    item: KolamChatMarketplaceListingHit,
  ) => Promise<void>;
  setInboxLabels: (labelIds: string[]) => Promise<void>;
  signalTyping: (typing: boolean) => void;
  sending: boolean;
  startCall: () => Promise<void>;
  teamRoomMetadata: KolamChatRailTeamRoomMetadata;
  toggleInboxAiHandled: () => Promise<void>;
  toggleInboxStatus: () => Promise<void>;
  toggleCallHand: () => Promise<void>;
  unmuteCallParticipant: (userId: string) => Promise<void>;
  updatePresenceFromLive: (presence: KolamTeamChatPresence) => void;
}

export function useKolamChatRailDetail({
  currentUserId,
  mode,
  selectedId,
}: {
  currentUserId?: string;
  mode: KolamGlobalChatRailMode;
  selectedId: string | null;
}): KolamChatRailDetailState {
  const [messages, setMessages] = useState<KolamChatRailDetailMessage[]>([]);
  const [messageSearchResults, setMessageSearchResults] = useState<
    KolamChatRailDetailMessage[] | null
  >(null);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [messageSearchLoading, setMessageSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState<KolamChatConversation | null>(
    null,
  );
  const [callBusy, setCallBusy] = useState(false);
  const [activeCall, setActiveCall] = useState<KolamTeamChatCall | null>(null);
  const [callConfig, setCallConfig] = useState<KolamTeamChatCallConfig>({
    enabled: false,
  });
  const [callErrorMessage, setCallErrorMessage] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [presence, setPresence] = useState<KolamTeamChatPresence>(
    EMPTY_TEAM_CHAT_PRESENCE,
  );
  const [teamRoomMetadata, setTeamRoomMetadata] =
    useState<KolamChatRailTeamRoomMetadata>(EMPTY_TEAM_ROOM_METADATA);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async (options?: KolamChatRailRefreshOptions) => {
    const quiet = options?.quiet === true;
    if (!selectedId) {
      setMessages([]);
      setMessageSearchResults(null);
      setMessageSearchQuery('');
      setMessageSearchLoading(false);
      setConversation(null);
      setPresence(EMPTY_TEAM_CHAT_PRESENCE);
      setTeamRoomMetadata(EMPTY_TEAM_ROOM_METADATA);
      setActiveCall(null);
      setErrorMessage(undefined);
      setLoading(false);
      return;
    }

    if (!quiet) {
      setLoading(true);
    }
    setErrorMessage(undefined);

    try {
      if (mode === 'team-chat') {
        setConversation(null);
        const [nextMessages, nextMetadata] = await Promise.all([
          getKolamTeamChatMessages(selectedId, {limit: 80}),
          getKolamTeamChatMembers(selectedId).catch(() => EMPTY_TEAM_ROOM_METADATA),
        ]);
        await markKolamTeamChatRoomRead(selectedId).catch(() => undefined);
        setTeamRoomMetadata(nextMetadata);
        setMessages(
          nextMessages.map(message => mapTeamChatMessage(message, currentUserId)),
        );
        return;
      }

      const [nextConversation, nextMessages] = await Promise.all([
        getKolamChatConversation(selectedId),
        getKolamChatMessages(selectedId, {limit: 50}),
      ]);
      await markKolamChatConversationRead(selectedId).catch(() => undefined);
      setConversation(nextConversation);
      setTeamRoomMetadata(EMPTY_TEAM_ROOM_METADATA);
      const buyerDisplayName = getInboxBuyerDisplayName(nextConversation);
      setMessages(
        [...nextMessages]
          .reverse()
          .map(message => mapInboxMessage(message, buyerDisplayName)),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Detail chat belum bisa dibaca.',
      );
      if (!quiet) {
        setMessages([]);
        setConversation(null);
        setTeamRoomMetadata(EMPTY_TEAM_ROOM_METADATA);
      }
    } finally {
      if (!quiet) {
        setLoading(false);
      }
    }
  }, [currentUserId, mode, selectedId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setMessageSearchResults(null);
    setMessageSearchQuery('');
    setMessageSearchLoading(false);
  }, [mode, selectedId]);

  const refreshCall = useCallback(async () => {
    if (mode !== 'team-chat' || !selectedId) {
      setActiveCall(null);
      setCallConfig({enabled: false});
      setCallErrorMessage(undefined);
      return;
    }

    setCallErrorMessage(undefined);

    try {
      const [config, call] = await Promise.all([
        getKolamTeamChatCallConfig(),
        getKolamRoomActiveTeamChatCall(selectedId),
      ]);
      setCallConfig(config);
      setActiveCall(call && call.status !== 'ended' ? call : null);
    } catch (error) {
      setCallErrorMessage(
        error instanceof Error ? error.message : 'Status call belum bisa dibaca.',
      );
    }
  }, [mode, selectedId]);

  useEffect(() => {
    void refreshCall();
  }, [refreshCall]);

  const postTeamChatPresence = useCallback(
    async (typing: boolean, typingRoomId?: string | null) => {
      if (mode !== 'team-chat') {
        return;
      }

      const nextPresence = await postKolamTeamChatPresence({
        typing,
        typingRoomId: typingRoomId ?? null,
        viewingRoomId: selectedId,
      }).catch(() => null);

      if (nextPresence) {
        setPresence(nextPresence);
      }
    },
    [mode, selectedId],
  );

  useEffect(() => {
    if (mode !== 'team-chat' || !selectedId) {
      setPresence(EMPTY_TEAM_CHAT_PRESENCE);
      return;
    }

    void postTeamChatPresence(false, null);

    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }

      void postKolamTeamChatPresence({
        typing: false,
        typingRoomId: null,
        viewingRoomId: null,
      }).catch(() => null);
    };
  }, [mode, postTeamChatPresence, selectedId]);

  const signalTyping = useCallback(
    (typing: boolean) => {
      if (mode !== 'team-chat' || !selectedId) {
        return;
      }

      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }

      if (!typing) {
        void postTeamChatPresence(false, selectedId);
        return;
      }

      void postTeamChatPresence(true, selectedId);
      typingTimerRef.current = setTimeout(() => {
        typingTimerRef.current = null;
        void postTeamChatPresence(false, selectedId);
      }, 2000);
    },
    [mode, postTeamChatPresence, selectedId],
  );

  const updatePresenceFromLive = useCallback(
    (nextPresence: KolamTeamChatPresence) => {
      setPresence(nextPresence);
    },
    [],
  );

  const sendMessage = useCallback(
    async (text: string, options?: KolamChatRailSendMessageOptions) => {
      const body = text.trim();
      if (!selectedId || !body || sending) {
        return;
      }

      setSending(true);
      setErrorMessage(undefined);

      try {
        if (mode === 'team-chat') {
          const message = await sendKolamTeamChatMessage(selectedId, {
            body,
            replyToMessageId: options?.replyToMessageId ?? undefined,
          });
          setMessages(current => [
            ...current,
            mapTeamChatMessage(message, currentUserId),
          ]);
          return;
        }

        const message = await sendKolamChatTextMessage(selectedId, body, {
          replyToMessageId: options?.replyToMessageId ?? undefined,
        });
        setMessages(current => [
          ...current,
          mapInboxMessage(message, getInboxBuyerDisplayName(conversation)),
        ]);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Pesan gagal dikirim.',
        );
      } finally {
        setSending(false);
      }
    },
    [conversation, currentUserId, mode, selectedId, sending],
  );

  const sendAttachment = useCallback(
    async (
      file: NativeImagePickerResult,
      text = '',
      options?: KolamChatRailSendMessageOptions,
    ) => {
      if (!selectedId || mode !== 'team-chat' || sending) {
        return;
      }

      const localUri = file.uri ?? file.path ?? '';
      if (!localUri) {
        setErrorMessage('File lampiran belum bisa dibaca.');
        return;
      }

      setSending(true);
      setErrorMessage(undefined);

      try {
        const attachment = await uploadKolamTeamChatMedia(localUri);
        const message = await sendKolamTeamChatMessage(selectedId, {
          body: text.trim(),
          attachments: [attachment],
          replyToMessageId: options?.replyToMessageId ?? undefined,
        });
        setMessages(current => [
          ...current,
          mapTeamChatMessage(message, currentUserId),
        ]);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Lampiran gagal dikirim.',
        );
      } finally {
        setSending(false);
      }
    },
    [currentUserId, mode, selectedId, sending],
  );

  const sendInboxImage = useCallback(
    async (
      file: NativeImagePickerResult,
      options?: KolamChatRailSendMessageOptions,
    ) => {
      if (!selectedId || mode !== 'inbox' || sending) {
        return;
      }

      const localUri = file.uri ?? file.path ?? '';
      if (!localUri) {
        setErrorMessage('Gambar belum bisa dibaca.');
        return;
      }

      setSending(true);
      setErrorMessage(undefined);

      try {
        const uploaded = await uploadKolamChatImage(localUri);
        const message = await sendKolamChatImageMessage(selectedId, uploaded, {
          replyToMessageId: options?.replyToMessageId ?? undefined,
        });
        setMessages(current => [
          ...current,
          mapInboxMessage(message, getInboxBuyerDisplayName(conversation)),
        ]);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Gambar gagal dikirim.',
        );
      } finally {
        setSending(false);
      }
    },
    [conversation, mode, selectedId, sending],
  );

  const sendMarketplaceProduct = useCallback(
    async (item: KolamChatMarketplaceListingHit) => {
      if (!selectedId || mode !== 'inbox' || sending) {
        return;
      }

      const tempId = `temp_marketplace_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      const optimistic = buildOptimisticMarketplaceMessage(item, tempId);

      setSending(true);
      setErrorMessage(undefined);
      setMessages(current => [...current, optimistic]);

      try {
        const message = await attachKolamChatMarketplaceProduct(
          selectedId,
          buildMarketplaceAttachBody(item),
        );
        setMessages(current =>
          current.map(existing =>
            existing.id === tempId
              ? mapInboxMessage(message, getInboxBuyerDisplayName(conversation))
              : existing,
          ),
        );
      } catch (error) {
        setMessages(current =>
          current.filter(existing => existing.id !== tempId),
        );
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Produk marketplace gagal dikirim.',
        );
      } finally {
        setSending(false);
      }
    },
    [conversation, mode, selectedId, sending],
  );

  const reactToMessage = useCallback(
    async (messageId: string, emoji: string) => {
      if (!selectedId || mode !== 'team-chat' || sending) {
        return;
      }

      setSending(true);
      setErrorMessage(undefined);

      try {
        const message = await toggleKolamTeamChatReaction(
          selectedId,
          messageId,
          emoji,
        );
        setMessages(current =>
          current.map(item =>
            item.id === messageId
              ? mapTeamChatMessage(message, currentUserId)
              : item,
          ),
        );
        setMessageSearchResults(current =>
          current
            ? current.map(item =>
                item.id === messageId
                  ? mapTeamChatMessage(message, currentUserId)
                  : item,
              )
            : current,
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Reaksi gagal dikirim.',
        );
      } finally {
        setSending(false);
      }
    },
    [currentUserId, mode, selectedId, sending],
  );

  const patchInboxMessageFromLive = useCallback(
    (messageId: string, patch: Partial<KolamChatMessage>) => {
      if (mode !== 'inbox' || !messageId) {
        return;
      }

      setMessages(current =>
        current.map(message =>
          message.id === messageId
            ? {...message, ...mapInboxMessagePatch(patch, message)}
            : message,
        ),
      );
    },
    [conversation, mode],
  );

  const upsertInboxMessageFromLive = useCallback(
    (message: KolamChatMessage) => {
      if (mode !== 'inbox' || !message?._id) {
        return;
      }

      const nextMessage = mapInboxMessage(
        message,
        getInboxBuyerDisplayName(conversation),
      );
      setMessages(current => {
        const existingIndex = current.findIndex(item => item.id === nextMessage.id);
        if (existingIndex === -1) {
          return [...current, nextMessage];
        }

        return current.map(item =>
          item.id === nextMessage.id ? {...item, ...nextMessage} : item,
        );
      });
    },
    [mode],
  );

  const editMessage = useCallback(
    async (messageId: string, text: string) => {
      const body = text.trim();
      if (!selectedId || !body || sending) {
        return;
      }

      setSending(true);
      setErrorMessage(undefined);

      try {
        if (mode === 'inbox') {
          const message = await editKolamChatMessage(
            selectedId,
            messageId,
            body,
          );
          setMessages(current =>
            current.map(item =>
              item.id === messageId
                ? mapInboxMessage(message, getInboxBuyerDisplayName(conversation))
                : item,
            ),
          );
          return;
        }

        const message = await editKolamTeamChatMessage(
          selectedId,
          messageId,
          body,
        );
        setMessages(current =>
          current.map(item =>
            item.id === messageId
              ? mapTeamChatMessage(message, currentUserId)
              : item,
          ),
        );
        setMessageSearchResults(current =>
          current
            ? current.map(item =>
                item.id === messageId
                  ? mapTeamChatMessage(message, currentUserId)
                  : item,
              )
            : current,
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Pesan gagal diedit.',
        );
      } finally {
        setSending(false);
      }
    },
    [conversation, currentUserId, mode, selectedId, sending],
  );

  const searchTeamMessages = useCallback(
    async (query: string) => {
      const trimmedQuery = query.trim();
      if (!selectedId || mode !== 'team-chat' || !trimmedQuery) {
        return;
      }

      setMessageSearchLoading(true);
      setErrorMessage(undefined);

      try {
        const results = await searchKolamTeamChatMessages(
          selectedId,
          trimmedQuery,
          40,
        );
        setMessageSearchQuery(trimmedQuery);
        setMessageSearchResults(
          results.map(message => mapTeamChatMessage(message, currentUserId)),
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Pencarian pesan gagal.',
        );
      } finally {
        setMessageSearchLoading(false);
      }
    },
    [currentUserId, mode, selectedId],
  );

  const clearTeamMessageSearch = useCallback(() => {
    setMessageSearchResults(null);
    setMessageSearchQuery('');
    setMessageSearchLoading(false);
  }, []);

  const runInboxConversationAction = useCallback(
    async (action: () => Promise<KolamChatConversation>) => {
      if (mode !== 'inbox' || !selectedId || sending) {
        return;
      }

      setSending(true);
      setErrorMessage(undefined);

      try {
        const nextConversation = await action();
        setConversation(nextConversation);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Aksi conversation gagal diproses.',
        );
      } finally {
        setSending(false);
      }
    },
    [mode, selectedId, sending],
  );

  const toggleInboxStatus = useCallback(async () => {
    if (!selectedId || !conversation) {
      return;
    }

    const nextStatus = conversation.status === 'closed' ? 'open' : 'closed';
    await runInboxConversationAction(() =>
      updateKolamChatConversationStatus(selectedId, nextStatus),
    );
    await refresh();
  }, [conversation, refresh, runInboxConversationAction, selectedId]);

  const assignInboxToMe = useCallback(async (handoverNote?: string) => {
    if (!selectedId || !currentUserId) {
      return;
    }

    await runInboxConversationAction(() =>
      assignKolamChatConversation(selectedId, currentUserId, handoverNote),
    );
  }, [currentUserId, runInboxConversationAction, selectedId]);

  const toggleInboxAiHandled = useCallback(async () => {
    if (!selectedId || !conversation) {
      return;
    }

    await runInboxConversationAction(() =>
      updateKolamChatConversationAiHandled(
        selectedId,
        conversation.isAiHandled !== true,
      ),
    );
  }, [conversation, runInboxConversationAction, selectedId]);

  const setInboxLabels = useCallback(
    async (labelIds: string[]) => {
      if (!selectedId) {
        return;
      }

      await runInboxConversationAction(() =>
        updateKolamChatConversationLabels(selectedId, labelIds),
      );
    },
    [runInboxConversationAction, selectedId],
  );

  const runCallAction = useCallback(
    async (action: () => Promise<KolamTeamChatCall>) => {
      if (mode !== 'team-chat' || !selectedId || callBusy) {
        return;
      }

      setCallBusy(true);
      setCallErrorMessage(undefined);

      try {
        const call = await action();
        setActiveCall(call.status === 'ended' ? null : call);
      } catch (error) {
        setCallErrorMessage(
          error instanceof Error ? error.message : 'Aksi call gagal diproses.',
        );
      } finally {
        setCallBusy(false);
      }
    },
    [callBusy, mode, selectedId],
  );

  const startCall = useCallback(async () => {
    if (!selectedId) {
      return;
    }

    await runCallAction(() => startKolamTeamChatCall(selectedId));
  }, [runCallAction, selectedId]);

  const joinCall = useCallback(async () => {
    if (!activeCall) {
      return;
    }

    await runCallAction(() => joinKolamTeamChatCall(activeCall._id));
  }, [activeCall, runCallAction]);

  const declineCall = useCallback(async () => {
    if (!activeCall) {
      return;
    }

    await runCallAction(() => declineKolamTeamChatCall(activeCall._id));
  }, [activeCall, runCallAction]);

  const endCall = useCallback(async () => {
    if (!activeCall) {
      return;
    }

    await runCallAction(() => endKolamTeamChatCall(activeCall._id));
  }, [activeCall, runCallAction]);

  const redialCall = useCallback(async () => {
    if (!activeCall) {
      return;
    }

    await runCallAction(() => redialKolamTeamChatCall(activeCall._id));
  }, [activeCall, runCallAction]);

  const toggleCallHand = useCallback(async () => {
    if (!activeCall) {
      return;
    }

    const myParticipant = activeCall.participants?.find(
      participant => getCallParticipantUserId(participant) === currentUserId,
    );
    await runCallAction(() =>
      myParticipant?.handRaised
        ? lowerKolamTeamChatCallHand(activeCall._id)
        : raiseKolamTeamChatCallHand(activeCall._id),
    );
  }, [activeCall, currentUserId, runCallAction]);

  const handoverCall = useCallback(async () => {
    if (!activeCall) {
      return;
    }

    await runCallAction(() => handoverKolamTeamChatCall(activeCall._id, 'android'));
  }, [activeCall, runCallAction]);

  const muteCallParticipant = useCallback(
    async (userId: string) => {
      if (!activeCall) {
        return;
      }

      await runCallAction(() =>
        muteKolamTeamChatCallParticipant(activeCall._id, userId),
      );
    },
    [activeCall, runCallAction],
  );

  const unmuteCallParticipant = useCallback(
    async (userId: string) => {
      if (!activeCall) {
        return;
      }

      await runCallAction(() =>
        unmuteKolamTeamChatCallParticipant(activeCall._id, userId),
      );
    },
    [activeCall, runCallAction],
  );

  return {
    activeCall,
    assignInboxToMe,
    callBusy,
    callConfig,
    callErrorMessage,
    conversation,
    clearTeamMessageSearch,
    declineCall,
    editMessage,
    endCall,
    errorMessage,
    handoverCall,
    joinCall,
    loading,
    messages,
    messageSearchLoading,
    messageSearchQuery,
    messageSearchResults,
    muteCallParticipant,
    patchInboxMessageFromLive,
    presence,
    reactToMessage,
    redialCall,
    refreshCall,
    refresh,
    searchTeamMessages,
    sendAttachment,
    sendInboxImage,
    sendMessage,
    sendMarketplaceProduct,
    setInboxLabels,
    signalTyping,
    sending,
    startCall,
    teamRoomMetadata,
    toggleInboxAiHandled,
    toggleInboxStatus,
    toggleCallHand,
    unmuteCallParticipant,
    upsertInboxMessageFromLive,
    updatePresenceFromLive,
  };
}

function getCallParticipantUserId(participant: KolamTeamChatCallParticipant) {
  return typeof participant.user === 'string' ? participant.user : participant.user?._id;
}

function mapInboxMessage(
  message: KolamChatMessage,
  buyerDisplayName?: string,
): KolamChatRailDetailMessage {
  return {
    attachments: [],
    content: message.content ?? null,
    daraMeta: message.daraMeta ?? null,
    embeds: [],
    id: message._id,
    author: getInboxAuthor(message, buyerDisplayName),
    body: getInboxMessageBody(message),
    linkPreviews: [],
    mine: message.direction === 'out',
    reactions: [],
    replyContent: message.replyContent ?? null,
    replyPreview: null,
    senderId: getInboxSenderStaffId(message),
    sentAt: message.sentAt ?? message.createdAt,
    editedAt: message.editedAt ?? null,
    editedByName: message.editedByName ?? null,
    status: message.deliveryStatus,
  };
}

function mapInboxMessagePatch(
  patch: Partial<KolamChatMessage>,
  current: KolamChatRailDetailMessage,
): Partial<KolamChatRailDetailMessage> {
  const next: Partial<KolamChatRailDetailMessage> = {};

  if (patch.content !== undefined) {
    next.content = patch.content ?? null;
    next.body = getInboxMessageBody({
      content: patch.content ?? current.content ?? undefined,
    } as KolamChatMessage);
  }

  if (patch.deliveryStatus !== undefined) {
    next.status = patch.deliveryStatus;
  }

  if (patch.editedAt !== undefined) {
    next.editedAt = patch.editedAt ?? null;
  }

  if (patch.editedByName !== undefined) {
    next.editedByName = patch.editedByName ?? null;
  }

  if (patch.replyContent !== undefined) {
    next.replyContent = patch.replyContent ?? null;
  }

  if (patch.daraMeta !== undefined) {
    next.daraMeta = patch.daraMeta ?? null;
  }

  return next;
}

function buildMarketplaceAttachBody(item: KolamChatMarketplaceListingHit) {
  return {
    ...(item.entityType === 'species'
      ? {speciesId: item.entityId}
      : {productId: item.entityId}),
    entityType: item.entityType,
    ...(item.sku ? {sku: item.sku} : {}),
  };
}

function buildOptimisticMarketplaceMessage(
  item: KolamChatMarketplaceListingHit,
  tempId: string,
): KolamChatRailDetailMessage {
  const platformLabel =
    item.platform === 'tokopedia' ? 'Tokopedia' : 'Shopee';
  const name = item.listingName || item.name || 'Produk marketplace';
  const now = new Date().toISOString();

  return {
    attachments: [],
    author: 'Anda',
    body: `[${platformLabel}] ${name}`,
    content: {
      type: 'marketplace_product_card',
      text: `[${platformLabel}] ${name}`,
      card: {
        entityId: item.entityId,
        entityType: item.entityType,
        name,
        detailHref: item.listingUrl || '',
        marketplace: {
          platform: item.platform,
          productId: item.productId,
          goodsId: item.goodsId ?? undefined,
          shopId: item.shopId ?? undefined,
          listingName: name,
          sku: item.sku ?? undefined,
        },
      },
    },
    daraMeta: null,
    editedAt: null,
    editedByName: null,
    embeds: [],
    id: tempId,
    linkPreviews: [],
    mine: true,
    reactions: [],
    replyContent: null,
    replyPreview: null,
    sentAt: now,
    status: 'pending',
  };
}

function getInboxSenderStaffId(message: KolamChatMessage) {
  const sender = message.senderStaffId;
  return typeof sender === 'string' ? sender : sender?._id ?? null;
}

function mapTeamChatMessage(
  message: KolamTeamChatMessage,
  currentUserId?: string,
): KolamChatRailDetailMessage {
  return {
    attachments: Array.isArray(message.attachments) ? message.attachments : [],
    embeds: Array.isArray(message.embeds) ? message.embeds : [],
    id: message._id,
    author: getTeamChatAuthor(message),
    body:
      message.body?.trim() ||
      (message.attachments?.length || message.embeds?.length || message.linkPreviews?.length
        ? ''
        : 'Pesan'),
    linkPreviews: Array.isArray(message.linkPreviews)
      ? message.linkPreviews
      : [],
    mine: message.senderType !== 'ai',
    reactions: groupTeamChatReactions(message.reactions, currentUserId),
    replyPreview: message.replyPreview ?? null,
    senderId: getTeamChatSenderId(message),
    sentAt: message.createdAt,
    editedAt: message.editedAt ?? null,
    editedByName: message.editedByName ?? null,
  };
}

function getTeamChatSenderId(message: KolamTeamChatMessage) {
  return typeof message.sender === 'string'
    ? message.sender
    : message.sender?._id ?? null;
}

function groupTeamChatReactions(
  reactions: KolamTeamChatReaction[] | undefined,
  currentUserId?: string,
): KolamChatRailDetailReactionGroup[] {
  const groups = new Map<string, KolamChatRailDetailReactionGroup>();

  reactions?.forEach(reaction => {
    const current = groups.get(reaction.emoji) ?? {
      count: 0,
      emoji: reaction.emoji,
      mine: false,
    };
    const userId =
      typeof reaction.user === 'string' ? reaction.user : reaction.user?._id;

    groups.set(reaction.emoji, {
      count: current.count + 1,
      emoji: reaction.emoji,
      mine: current.mine || Boolean(currentUserId && userId === currentUserId),
    });
  });

  return Array.from(groups.values());
}

function getInboxAuthor(message: KolamChatMessage, buyerDisplayName?: string) {
  if (message.direction === 'out') {
    return message.senderName || 'Anda';
  }

  if (message.senderType === 'ai_agent') {
    return 'DARA';
  }

  return message.senderName || buyerDisplayName || 'Buyer';
}

function getInboxBuyerDisplayName(
  conversation?: KolamChatConversation | null,
) {
  const contact = conversation?.contactId;
  if (!contact || typeof contact === 'string') {
    return '';
  }

  const linkedCustomer = contact.linkedCustomerId;
  const customerName =
    linkedCustomer && typeof linkedCustomer === 'object'
      ? linkedCustomer.name?.trim()
      : '';

  return contact.displayName?.trim() || customerName || '';
}

function getInboxMessageBody({content}: KolamChatMessage) {
  if (!content) {
    return 'Pesan';
  }

  if (content.type === 'image') {
    return content.fileName || 'Gambar';
  }

  return content.text?.trim() || content.imageUrl || 'Pesan';
}

function getTeamChatAuthor(message: KolamTeamChatMessage) {
  if (message.senderType === 'ai') {
    return message.botName || 'DARA';
  }

  const sender = message.sender;
  if (sender && typeof sender === 'object') {
    const fullName = [sender.first_name, sender.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();

    return fullName || sender.username || sender.email || 'User';
  }

  return 'User';
}
