import {useCallback, useEffect, useRef, useState} from 'react';
import type {KolamGlobalChatRailMode} from '../components/kolam-global-chat-rail';
import {
  getKolamChatConversations,
  getKolamTeamChatRooms,
  type KolamChatConversation,
  type KolamChatConversationListParams,
  type KolamTeamChatRoom,
} from '../services/kolam-api';

export interface KolamChatRailReadonlyDataState {
  clearItemUnread?: (itemId: string) => number;
  conversations: KolamChatConversation[];
  errorMessage?: string;
  loading: boolean;
  refresh: () => Promise<void>;
  rooms: KolamTeamChatRoom[];
  totalUnread: number;
}

export function useKolamChatRailReadonlyData({
  inboxParams,
  intervalMs = 30_000,
  mode,
  viewingItemId = null,
}: {
  inboxParams?: KolamChatConversationListParams;
  intervalMs?: number;
  mode: KolamGlobalChatRailMode;
  /** Active thread(s) to keep at unread 0 while list refresh races mark-read. */
  viewingItemId?: string | string[] | null;
}): KolamChatRailReadonlyDataState {
  const mountedRef = useRef(false);
  const viewingItemIdRef = useRef(viewingItemId);
  const refreshRef = useRef<() => Promise<void>>(async () => undefined);
  const clearItemUnreadRef = useRef<(itemId: string) => number>(() => 0);
  const [state, setState] = useState<KolamChatRailReadonlyDataState>({
    clearItemUnread: itemId => clearItemUnreadRef.current(itemId),
    conversations: [],
    loading: true,
    rooms: [],
    refresh: () => refreshRef.current(),
    totalUnread: 0,
  });

  viewingItemIdRef.current = viewingItemId;

  const clearItemUnread = useCallback(
    (itemId: string) => {
      const id = itemId?.trim();
      if (!id) {
        return 0;
      }

      let cleared = 0;
      setState(current => {
        if (mode === 'team-chat') {
          const target = current.rooms.find(room => room._id === id);
          cleared = Math.max(0, target?.unreadCount ?? 0);
          if (cleared === 0) {
            return current;
          }
          const rooms = current.rooms.map(room =>
            room._id === id ? {...room, unreadCount: 0} : room,
          );
          return {
            ...current,
            rooms,
            totalUnread: getUnreadTotal(rooms),
          };
        }

        const target = current.conversations.find(
          conversation => conversation._id === id,
        );
        cleared = Math.max(0, target?.unreadCount ?? 0);
        if (cleared === 0) {
          return current;
        }
        const conversations = current.conversations.map(conversation =>
          conversation._id === id
            ? {...conversation, unreadCount: 0}
            : conversation,
        );
        return {
          ...current,
          conversations,
          totalUnread: getUnreadTotal(conversations),
        };
      });
      return cleared;
    },
    [mode],
  );

  clearItemUnreadRef.current = clearItemUnread;

  const refresh = useCallback(async () => {
    setState(current => ({
      ...current,
      loading: !getHasLoadedData(current),
      errorMessage: undefined,
    }));

    try {
      if (mode === 'team-chat') {
        const rooms = applyViewingItemUnreadZero(
          await getKolamTeamChatRooms(),
          viewingItemIdRef.current,
        );
        if (!mountedRef.current) {
          return;
        }

        setState(current => ({
          ...current,
          conversations: [],
          loading: false,
          rooms,
          totalUnread: getUnreadTotal(rooms),
        }));
        return;
      }

      const conversations = applyViewingItemUnreadZero(
        await getKolamChatConversations({
          limit: 100,
          ...inboxParams,
        }),
        viewingItemIdRef.current,
      );
      if (!mountedRef.current) {
        return;
      }

      setState(current => ({
        ...current,
        conversations,
        loading: false,
        rooms: [],
        totalUnread: getUnreadTotal(conversations),
      }));
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
      }));
    }
  }, [inboxParams, mode]);

  refreshRef.current = refresh;

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

  return {
    ...state,
    clearItemUnread,
    refresh,
  };
}

export function applyViewingItemUnreadZero<
  T extends {_id?: string; unreadCount?: number},
>(items: T[], viewingItemId?: string | string[] | null): T[] {
  const viewingIds = normalizeViewingItemIds(viewingItemId);
  if (viewingIds.size === 0) {
    return items;
  }

  return items.map(item => {
    const id = item._id?.trim();
    if (!id || !viewingIds.has(id) || (item.unreadCount ?? 0) <= 0) {
      return item;
    }
    return {...item, unreadCount: 0};
  });
}

function normalizeViewingItemIds(
  viewingItemId?: string | string[] | null,
): Set<string> {
  if (Array.isArray(viewingItemId)) {
    return new Set(
      viewingItemId
        .map(value => value?.trim())
        .filter((value): value is string => Boolean(value)),
    );
  }

  const id = viewingItemId?.trim();
  return id ? new Set([id]) : new Set();
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
