import {useCallback, useEffect, useRef, useState} from 'react';
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
  refresh: () => Promise<void>;
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
  const mountedRef = useRef(false);
  const [state, setState] = useState<KolamChatRailReadonlyDataState>({
    conversations: [],
    loading: true,
    rooms: [],
    refresh: async () => undefined,
    totalUnread: 0,
  });

  const refresh = useCallback(async () => {
    setState(current => ({
      ...current,
      loading: !getHasLoadedData(current),
      errorMessage: undefined,
    }));

    try {
      if (mode === 'team-chat') {
        const rooms = await getKolamTeamChatRooms();
        if (!mountedRef.current) {
          return;
        }

        setState({
          conversations: [],
          loading: false,
          rooms,
          refresh,
          totalUnread: getUnreadTotal(rooms),
        });
        return;
      }

      const conversations = await getKolamChatConversations({
        status: 'open',
        unreadOnly: true,
        limit: 100,
      });
      if (!mountedRef.current) {
        return;
      }

      setState({
        conversations,
        loading: false,
        rooms: [],
        refresh,
        totalUnread: getUnreadTotal(conversations),
      });
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }

      setState(current => ({
        ...current,
        loading: false,
        errorMessage:
          error instanceof Error
            ? error.message
            : 'Data chat belum bisa dibaca.',
        refresh,
      }));
    }
  }, [mode]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    mountedRef.current = true;

    refresh();
    timer = setInterval(() => {
      refresh();
    }, intervalMs);

    return () => {
      mountedRef.current = false;
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [intervalMs, mode, refresh]);

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
