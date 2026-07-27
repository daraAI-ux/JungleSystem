import {useCallback, useEffect, useState} from 'react';
import type {KolamGlobalChatRailMode} from '../components/kolam-global-chat-rail';
import {
  getKolamChatMessages,
  getKolamTeamChatMessages,
  markKolamChatConversationRead,
  markKolamTeamChatRoomRead,
  sendKolamChatTextMessage,
  sendKolamTeamChatMessage,
  sendKolamTeamChatTextMessage,
  type KolamChatMessage,
  type KolamTeamChatMessage,
  uploadKolamTeamChatMedia,
} from '../services/kolam-api';
import type {NativeImagePickerResult} from '../services/native-file-picker';

export interface KolamChatRailDetailMessage {
  id: string;
  author: string;
  body: string;
  mine: boolean;
  sentAt?: string;
  status?: string;
}

export interface KolamChatRailDetailState {
  errorMessage?: string;
  loading: boolean;
  messages: KolamChatRailDetailMessage[];
  sendAttachment: (file: NativeImagePickerResult, text?: string) => Promise<void>;
  refresh: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  sending: boolean;
}

export function useKolamChatRailDetail({
  mode,
  selectedId,
}: {
  mode: KolamGlobalChatRailMode;
  selectedId: string | null;
}): KolamChatRailDetailState {
  const [messages, setMessages] = useState<KolamChatRailDetailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const refresh = useCallback(async () => {
    if (!selectedId) {
      setMessages([]);
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
        setMessages(nextMessages.map(mapTeamChatMessage));
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
  }, [mode, selectedId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
          setMessages(current => [...current, mapTeamChatMessage(message)]);
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
    [mode, selectedId, sending],
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
        setMessages(current => [...current, mapTeamChatMessage(message)]);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Lampiran gagal dikirim.',
        );
      } finally {
        setSending(false);
      }
    },
    [mode, selectedId, sending],
  );

  return {
    errorMessage,
    loading,
    messages,
    refresh,
    sendAttachment,
    sendMessage,
    sending,
  };
}

function mapInboxMessage(message: KolamChatMessage): KolamChatRailDetailMessage {
  return {
    id: message._id,
    author: getInboxAuthor(message),
    body: getInboxMessageBody(message),
    mine: message.direction === 'out',
    sentAt: message.sentAt ?? message.createdAt,
    status: message.deliveryStatus,
  };
}

function mapTeamChatMessage(
  message: KolamTeamChatMessage,
): KolamChatRailDetailMessage {
  return {
    id: message._id,
    author: getTeamChatAuthor(message),
    body: message.body?.trim() || 'Pesan',
    mine: message.senderType !== 'ai',
    sentAt: message.createdAt,
  };
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
