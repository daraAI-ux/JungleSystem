import {useEffect, useState} from 'react';
import type {KolamGlobalChatRailMode} from '../components/kolam-global-chat-rail';
import {
  getKolamChatConversations,
  getKolamTeamChatRooms,
  type KolamChatConversation,
  type KolamTeamChatRoom,
} from '../services/kolam-api';

export interface KolamChatRailReadonlyDataState {
  conversations: KolamChatConversation[];
  errorMessage?: string;
  loading: boolean;
  rooms: KolamTeamChatRoom[];
  totalUnread: number;
}

export function useKolamChatRailReadonlyData({
  intervalMs = 30_000,
  mode,
}: {
  intervalMs?: number;
  mode: KolamGlobalChatRailMode;
}): KolamChatRailReadonlyDataState {
  const [state, setState] = useState<KolamChatRailReadonlyDataState>({
    conversations: [],
    loading: true,
    rooms: [],
    totalUnread: 0,
  });

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    const refresh = async () => {
      setState(current => ({
        ...current,
        loading: !getHasLoadedData(current),
        errorMessage: undefined,
      }));

      try {
        if (mode === 'team-chat') {
          const rooms = await getKolamTeamChatRooms();
          if (cancelled) {
            return;
          }

          setState({
            conversations: [],
            loading: false,
            rooms,
            totalUnread: getUnreadTotal(rooms),
          });
          return;
        }

        const conversations = await getKolamChatConversations({
          status: 'open',
          unreadOnly: true,
          limit: 100,
        });
        if (cancelled) {
          return;
        }

        setState({
          conversations,
          loading: false,
          rooms: [],
          totalUnread: getUnreadTotal(conversations),
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState(current => ({
          ...current,
          loading: false,
          errorMessage:
            error instanceof Error
              ? error.message
              : 'Data chat belum bisa dibaca.',
        }));
      }
    };

    refresh();
    timer = setInterval(() => {
      refresh();
    }, intervalMs);

    return () => {
      cancelled = true;
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [intervalMs, mode]);

  return state;
}

function getHasLoadedData(state: KolamChatRailReadonlyDataState) {
  return state.conversations.length > 0 || state.rooms.length > 0;
}

function getUnreadTotal(items: Array<{unreadCount?: number}>) {
  return items.reduce(
    (total, item) => total + Math.max(0, item.unreadCount ?? 0),
    0,
  );
}
