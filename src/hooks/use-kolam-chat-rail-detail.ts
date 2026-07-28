import {useCallback, useEffect, useRef, useState} from 'react';
import type {KolamGlobalChatRailMode} from '../components/kolam-global-chat-rail';
import {
  declineKolamTeamChatCall,
  endKolamTeamChatCall,
  getKolamChatMessages,
  getKolamRoomActiveTeamChatCall,
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
  sendKolamChatTextMessage,
  sendKolamTeamChatMessage,
  sendKolamTeamChatTextMessage,
  startKolamTeamChatCall,
  toggleKolamTeamChatReaction,
  type KolamChatMessage,
  type KolamTeamChatCall,
  type KolamTeamChatCallConfig,
  type KolamTeamChatCallParticipant,
  type KolamTeamChatReaction,
  type KolamTeamChatAttachment,
  type KolamTeamChatMessage,
  type KolamTeamChatPresence,
  unmuteKolamTeamChatCallParticipant,
  uploadKolamTeamChatMedia,
} from '../services/kolam-api';
import type {NativeImagePickerResult} from '../services/native-file-picker';

const EMPTY_TEAM_CHAT_PRESENCE: KolamTeamChatPresence = {
  onlineCount: 0,
  typingUserIds: [],
  viewingCount: 0,
};

export interface KolamChatRailDetailReactionGroup {
  count: number;
  emoji: string;
  mine: boolean;
}

export interface KolamChatRailDetailMessage {
  attachments: KolamTeamChatAttachment[];
  id: string;
  author: string;
  body: string;
  mine: boolean;
  reactions: KolamChatRailDetailReactionGroup[];
  sentAt?: string;
  status?: string;
}

export interface KolamChatRailDetailState {
  activeCall: KolamTeamChatCall | null;
  callBusy: boolean;
  callConfig: KolamTeamChatCallConfig;
  callErrorMessage?: string;
  declineCall: () => Promise<void>;
  endCall: () => Promise<void>;
  errorMessage?: string;
  handoverCall: () => Promise<void>;
  joinCall: () => Promise<void>;
  loading: boolean;
  messages: KolamChatRailDetailMessage[];
  muteCallParticipant: (userId: string) => Promise<void>;
  presence: KolamTeamChatPresence;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  redialCall: () => Promise<void>;
  refreshCall: () => Promise<void>;
  sendAttachment: (file: NativeImagePickerResult, text?: string) => Promise<void>;
  refresh: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  signalTyping: (typing: boolean) => void;
  sending: boolean;
  startCall: () => Promise<void>;
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
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
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
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    if (!selectedId) {
      setMessages([]);
      setPresence(EMPTY_TEAM_CHAT_PRESENCE);
      setActiveCall(null);
      setErrorMessage(undefined);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage(undefined);

    try {
      if (mode === 'team-chat') {
        const nextMessages = await getKolamTeamChatMessages(selectedId, {
          limit: 80,
        });
        await markKolamTeamChatRoomRead(selectedId).catch(() => undefined);
        setMessages(
          nextMessages.map(message => mapTeamChatMessage(message, currentUserId)),
        );
        return;
      }

      const nextMessages = await getKolamChatMessages(selectedId, {limit: 50});
      await markKolamChatConversationRead(selectedId).catch(() => undefined);
      setMessages([...nextMessages].reverse().map(mapInboxMessage));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Detail chat belum bisa dibaca.',
      );
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, mode, selectedId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
    async (text: string) => {
      const body = text.trim();
      if (!selectedId || !body || sending) {
        return;
      }

      setSending(true);
      setErrorMessage(undefined);

      try {
        if (mode === 'team-chat') {
          const message = await sendKolamTeamChatTextMessage(selectedId, body);
          setMessages(current => [
            ...current,
            mapTeamChatMessage(message, currentUserId),
          ]);
          return;
        }

        const message = await sendKolamChatTextMessage(selectedId, body);
        setMessages(current => [...current, mapInboxMessage(message)]);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Pesan gagal dikirim.',
        );
      } finally {
        setSending(false);
      }
    },
    [currentUserId, mode, selectedId, sending],
  );

  const sendAttachment = useCallback(
    async (file: NativeImagePickerResult, text = '') => {
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
    callBusy,
    callConfig,
    callErrorMessage,
    declineCall,
    endCall,
    errorMessage,
    handoverCall,
    joinCall,
    loading,
    messages,
    muteCallParticipant,
    presence,
    reactToMessage,
    redialCall,
    refreshCall,
    refresh,
    sendAttachment,
    sendMessage,
    signalTyping,
    sending,
    startCall,
    toggleCallHand,
    unmuteCallParticipant,
    updatePresenceFromLive,
  };
}

function getCallParticipantUserId(participant: KolamTeamChatCallParticipant) {
  return typeof participant.user === 'string' ? participant.user : participant.user?._id;
}

function mapInboxMessage(message: KolamChatMessage): KolamChatRailDetailMessage {
  return {
    attachments: [],
    id: message._id,
    author: getInboxAuthor(message),
    body: getInboxMessageBody(message),
    mine: message.direction === 'out',
    reactions: [],
    sentAt: message.sentAt ?? message.createdAt,
    status: message.deliveryStatus,
  };
}

function mapTeamChatMessage(
  message: KolamTeamChatMessage,
  currentUserId?: string,
): KolamChatRailDetailMessage {
  return {
    attachments: Array.isArray(message.attachments) ? message.attachments : [],
    id: message._id,
    author: getTeamChatAuthor(message),
    body: message.body?.trim() || (message.attachments?.length ? '' : 'Pesan'),
    mine: message.senderType !== 'ai',
    reactions: groupTeamChatReactions(message.reactions, currentUserId),
    sentAt: message.createdAt,
  };
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

function getInboxAuthor(message: KolamChatMessage) {
  if (message.direction === 'out') {
    return message.senderName || 'Anda';
  }

  if (message.senderType === 'ai_agent') {
    return 'DARA';
  }

  return message.senderName || 'Buyer';
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
