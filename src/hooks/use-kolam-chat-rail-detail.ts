import {useCallback, useEffect, useRef, useState} from 'react';
import type {KolamGlobalChatRailMode} from '../components/kolam-global-chat-rail';
import {
  getKolamChatMessages,
  getKolamTeamChatMessages,
  markKolamChatConversationRead,
  markKolamTeamChatRoomRead,
  postKolamTeamChatPresence,
  sendKolamChatTextMessage,
  sendKolamTeamChatMessage,
  sendKolamTeamChatTextMessage,
  toggleKolamTeamChatReaction,
  type KolamChatMessage,
  type KolamTeamChatReaction,
  type KolamTeamChatAttachment,
  type KolamTeamChatMessage,
  type KolamTeamChatPresence,
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
  errorMessage?: string;
  loading: boolean;
  messages: KolamChatRailDetailMessage[];
  presence: KolamTeamChatPresence;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  sendAttachment: (file: NativeImagePickerResult, text?: string) => Promise<void>;
  refresh: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  signalTyping: (typing: boolean) => void;
  sending: boolean;
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
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [presence, setPresence] = useState<KolamTeamChatPresence>(
    EMPTY_TEAM_CHAT_PRESENCE,
  );
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    if (!selectedId) {
      setMessages([]);
      setPresence(EMPTY_TEAM_CHAT_PRESENCE);
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

  return {
    errorMessage,
    loading,
    messages,
    presence,
    reactToMessage,
    refresh,
    sendAttachment,
    sendMessage,
    signalTyping,
    sending,
    updatePresenceFromLive,
  };
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
