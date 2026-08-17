import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {tryClaimKolamChatLiveAlert} from '../domain/kolam-chat-desktop-toast';
import {classifyKolamChatLiveEvent} from '../domain/kolam-chat-live-classifier';
import type {KolamChatLiveStreamKind} from '../domain/kolam-chat-live-contract';
import {
  applyKolamTeamChatReadConfirmUnreadZero,
  noteKolamTeamChatLiveMessageForReadConfirm,
} from '../domain/kolam-team-chat-read-confirm';
import {
  type KolamChatLiveEvent,
  useKolamChatLiveStream,
} from './use-kolam-chat-live-stream';
import {useKolamNotificationSoundSettings} from './use-kolam-notification-sound-settings';
import {
  getKolamChatConversations,
  getKolamTeamChatRooms,
  type KolamNotificationSoundType,
} from '../services/kolam-api';
import {createKolamNotificationSoundService} from '../services/kolam-notification-sound-service';
import {createKolamRuntimeNotificationSoundAdapter} from '../services/kolam-notification-sound-runtime';
import {
  showKolamChatDesktopToastForUnread,
  showKolamChatDesktopToastFromLive,
} from '../services/kolam-windows-toast-notification';

export type KolamChatUnreadCounts = {
  inbox: number;
  team: number;
};

const CHAT_NOTIFICATION_REFRESH_MS = 10_000;
/** Skip unread-rise ding if live path already played recently. */
const CHAT_NOTIFICATION_UNREAD_SOUND_GUARD_MS = 2_500;

export function resolveKolamChatUnreadRiseSoundIntents({
  lastSoundAtMs,
  next,
  nowMs,
  previous,
}: {
  lastSoundAtMs?: number | null;
  next: KolamChatUnreadCounts;
  nowMs?: number;
  previous: KolamChatUnreadCounts | null;
  /** @deprecated Stream-wide mute removed; kept optional for call-site compat. */
  visibleRailMode?: KolamChatLiveStreamKind | null;
}): KolamNotificationSoundType[] {
  if (!previous) {
    return [];
  }

  const now = nowMs ?? Date.now();
  if (
    typeof lastSoundAtMs === 'number' &&
    lastSoundAtMs > 0 &&
    now - lastSoundAtMs < CHAT_NOTIFICATION_UNREAD_SOUND_GUARD_MS
  ) {
    return [];
  }

  const intents: KolamNotificationSoundType[] = [];

  // Per-thread mute lives on the live path (selectedItemId). Unread-rise is
  // aggregate — still ding while a rail is open so thread B is not silent.
  if (next.inbox > previous.inbox) {
    intents.push('assigned');
  }

  if (next.team > previous.team) {
    intents.push('assigned');
  }

  return intents;
}

export function useKolamChatNotificationHost({
  currentUserId,
  enabled,
  visibleRailMode,
  visibleSelectedItemId,
  visibleSelectedItemIds,
}: {
  currentUserId?: string | null;
  enabled: boolean;
  visibleRailMode?: KolamChatLiveStreamKind | null;
  /** @deprecated Prefer visibleSelectedItemIds when excluding multiple open threads. */
  visibleSelectedItemId?: string | null;
  visibleSelectedItemIds?: string[] | null;
}) {
  const [unreadCounts, setUnreadCounts] = useState<KolamChatUnreadCounts>({
    inbox: 0,
    team: 0,
  });
  const unreadCountsRef = useRef(unreadCounts);
  const previousUnreadRef = useRef<KolamChatUnreadCounts | null>(null);
  const visibleRailModeRef = useRef(visibleRailMode);
  const visibleSelectedItemIdsRef = useRef<string[]>([]);
  const lastSoundAtRef = useRef(0);
  const soundSettings = useKolamNotificationSoundSettings({enabled});
  const webSettingRef = useRef(soundSettings.webSetting);
  const notificationSoundService = useMemo(
    () =>
      createKolamNotificationSoundService({
        adapter: createKolamRuntimeNotificationSoundAdapter(),
      }),
    [],
  );

  unreadCountsRef.current = unreadCounts;
  visibleRailModeRef.current = visibleRailMode;
  visibleSelectedItemIdsRef.current = normalizeNotificationExcludeIds(
    visibleSelectedItemIds,
    visibleSelectedItemId,
  );
  webSettingRef.current = soundSettings.webSetting;

  const playSoundIntent = useCallback(
    (intent: KolamNotificationSoundType | 'none') => {
      if (intent === 'none') {
        return;
      }

      lastSoundAtRef.current = Date.now();
      // Same path as Settings test (custom file / default).
      Promise.resolve(
        notificationSoundService.play({
          intent,
          webSetting: webSettingRef.current,
        }),
      ).catch(() => undefined);
    },
    [notificationSoundService],
  );

  const applyUnreadDelta = useCallback(
    (stream: 'inbox' | 'team', delta: number) => {
      if (!delta) {
        return;
      }

      setUnreadCounts(current => {
        const next: KolamChatUnreadCounts = {
          ...current,
          [stream]: Math.max(0, current[stream] + delta),
        };
        unreadCountsRef.current = next;
        previousUnreadRef.current = next;
        return next;
      });
    },
    [],
  );

  const refreshUnreadCounts = useCallback(async () => {
    if (!enabled) {
      previousUnreadRef.current = null;
      unreadCountsRef.current = {inbox: 0, team: 0};
      setUnreadCounts({inbox: 0, team: 0});
      return;
    }

    const viewingIds = visibleSelectedItemIdsRef.current;
    const viewingStream = visibleRailModeRef.current;
    const [inboxResult, teamResult] = await Promise.allSettled([
      sumChatUnreadTotal({
        excludeItemIds: viewingStream === 'inbox' ? viewingIds : [],
        kind: 'inbox',
      }),
      sumChatUnreadTotal({
        excludeItemIds: viewingStream === 'team-chat' ? viewingIds : [],
        kind: 'team',
      }),
    ]);

    const current = unreadCountsRef.current;
    const next: KolamChatUnreadCounts = {
      inbox:
        inboxResult.status === 'fulfilled'
          ? Math.max(0, inboxResult.value)
          : current.inbox,
      team:
        teamResult.status === 'fulfilled'
          ? Math.max(0, teamResult.value)
          : current.team,
    };

    const previous = previousUnreadRef.current;
    const intents = resolveKolamChatUnreadRiseSoundIntents({
      lastSoundAtMs: lastSoundAtRef.current || null,
      next,
      previous,
    });
    previousUnreadRef.current = next;
    unreadCountsRef.current = next;

    if (next.inbox !== current.inbox || next.team !== current.team) {
      setUnreadCounts(next);
    }

    intents.forEach(intent => {
      playSoundIntent(intent);
    });
    if (previous) {
      // Live path already surfaces thread toasts; unread-rise still toasts so
      // team/inbox alerts appear when SSE misses (parity with sound Batch B).
      if (next.inbox > previous.inbox) {
        showKolamChatDesktopToastForUnread('inbox');
      }
      if (next.team > previous.team) {
        showKolamChatDesktopToastForUnread('team-chat');
      }
    }
  }, [enabled, playSoundIntent]);

  useEffect(() => {
    if (!enabled) {
      previousUnreadRef.current = null;
      unreadCountsRef.current = {inbox: 0, team: 0};
      setUnreadCounts({inbox: 0, team: 0});
      return undefined;
    }

    refreshUnreadCounts();
    const timer = setInterval(refreshUnreadCounts, CHAT_NOTIFICATION_REFRESH_MS);
    (timer as {unref?: () => void}).unref?.();

    return () => {
      clearInterval(timer);
    };
  }, [enabled, refreshUnreadCounts]);

  const handleLiveEvent = useCallback(
    (event: KolamChatLiveEvent) => {
      const classification = classifyKolamChatLiveEvent(event, {
        currentUserId,
        selectedItemId: visibleSelectedItemIdsRef.current[0] ?? null,
      });

      if (
        classification.stream === 'team-chat' &&
        classification.eventName === 'message.created'
      ) {
        noteKolamTeamChatLiveMessageForReadConfirm({
          roomId: classification.targetId,
          viewingRoomIds: visibleSelectedItemIdsRef.current,
        });
      }

      if (classification.soundIntent !== 'none') {
        if (
          tryClaimKolamChatLiveAlert({
            stream: classification.stream,
            targetId: classification.targetId,
          })
        ) {
          playSoundIntent(classification.soundIntent);
          showKolamChatDesktopToastFromLive({
            classification,
            currentUserId,
            payload: event.payload,
          });
        }
      }

      if (classification.refreshTargets.includes('unread-badge')) {
        Promise.resolve(refreshUnreadCounts()).catch(() => undefined);
      }
    },
    [currentUserId, playSoundIntent, refreshUnreadCounts],
  );

  useKolamChatLiveStream({
    enabled,
    mode: 'inbox',
    onEvent: handleLiveEvent,
  });
  useKolamChatLiveStream({
    enabled,
    mode: 'team-chat',
    onEvent: handleLiveEvent,
  });

  return {applyUnreadDelta, refreshUnreadCounts, unreadCounts};
}

async function sumChatUnreadTotal({
  excludeItemIds,
  kind,
}: {
  excludeItemIds?: string[] | null;
  kind: 'inbox' | 'team';
}) {
  const items =
    kind === 'team'
      ? applyKolamTeamChatReadConfirmUnreadZero(await getKolamTeamChatRooms())
      : await getKolamChatConversations({
          status: 'open',
          unreadOnly: true,
          limit: 100,
        });
  const excludeIds = new Set(
    (excludeItemIds ?? [])
      .map(value => value?.trim())
      .filter((value): value is string => Boolean(value)),
  );

  return items.reduce((total, item) => {
    if (item._id && excludeIds.has(item._id)) {
      return total;
    }
    return total + Math.max(0, item.unreadCount ?? 0);
  }, 0);
}

function normalizeNotificationExcludeIds(
  visibleSelectedItemIds?: string[] | null,
  visibleSelectedItemId?: string | null,
): string[] {
  if (Array.isArray(visibleSelectedItemIds) && visibleSelectedItemIds.length > 0) {
    return [
      ...new Set(
        visibleSelectedItemIds
          .map(value => value?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    ];
  }

  const legacyId = visibleSelectedItemId?.trim();
  return legacyId ? [legacyId] : [];
}
