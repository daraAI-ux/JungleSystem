import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {classifyKolamChatLiveEvent} from '../domain/kolam-chat-live-classifier';
import type {KolamChatLiveStreamKind} from '../domain/kolam-chat-live-contract';
import {
  type KolamChatLiveEvent,
  useKolamChatLiveStream,
} from './use-kolam-chat-live-stream';
import {useKolamNotificationSoundSettings} from './use-kolam-notification-sound-settings';
import {
  getKolamChatUnreadTotal,
  getKolamTeamChatUnreadTotal,
  type KolamNotificationSoundType,
} from '../services/kolam-api';
import {createKolamNotificationSoundService} from '../services/kolam-notification-sound-service';
import {createKolamRuntimeNotificationSoundAdapter} from '../services/kolam-notification-sound-runtime';

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
  visibleRailMode,
}: {
  lastSoundAtMs?: number | null;
  next: KolamChatUnreadCounts;
  nowMs?: number;
  previous: KolamChatUnreadCounts | null;
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

  if (next.inbox > previous.inbox && visibleRailMode !== 'inbox') {
    intents.push('assigned');
  }

  if (next.team > previous.team && visibleRailMode !== 'team-chat') {
    intents.push('assigned');
  }

  return intents;
}

export function useKolamChatNotificationHost({
  currentUserId,
  enabled,
  visibleRailMode,
}: {
  currentUserId?: string | null;
  enabled: boolean;
  visibleRailMode?: KolamChatLiveStreamKind | null;
}) {
  const [unreadCounts, setUnreadCounts] = useState<KolamChatUnreadCounts>({
    inbox: 0,
    team: 0,
  });
  const unreadCountsRef = useRef(unreadCounts);
  const previousUnreadRef = useRef<KolamChatUnreadCounts | null>(null);
  const visibleRailModeRef = useRef(visibleRailMode);
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
  webSettingRef.current = soundSettings.webSetting;

  const playSoundIntent = useCallback(
    (intent: KolamNotificationSoundType | 'none') => {
      if (intent === 'none') {
        return;
      }

      lastSoundAtRef.current = Date.now();
      // Same path as Settings test (custom file / default) — do not force local beep.
      Promise.resolve(
        notificationSoundService.play({
          intent,
          webSetting: webSettingRef.current,
        }),
      ).catch(() => undefined);
    },
    [notificationSoundService],
  );

  const refreshUnreadCounts = useCallback(async () => {
    if (!enabled) {
      previousUnreadRef.current = null;
      unreadCountsRef.current = {inbox: 0, team: 0};
      setUnreadCounts({inbox: 0, team: 0});
      return;
    }

    const [inboxResult, teamResult] = await Promise.allSettled([
      getKolamChatUnreadTotal(),
      getKolamTeamChatUnreadTotal(),
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

    const intents = resolveKolamChatUnreadRiseSoundIntents({
      lastSoundAtMs: lastSoundAtRef.current || null,
      next,
      previous: previousUnreadRef.current,
      visibleRailMode: visibleRailModeRef.current,
    });
    previousUnreadRef.current = next;
    unreadCountsRef.current = next;

    if (next.inbox !== current.inbox || next.team !== current.team) {
      setUnreadCounts(next);
    }

    intents.forEach(intent => {
      playSoundIntent(intent);
    });
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
        selectedItemId: null,
      });

      if (visibleRailMode !== event.contract.stream) {
        playSoundIntent(classification.soundIntent);
      }

      if (classification.refreshTargets.includes('unread-badge')) {
        Promise.resolve(refreshUnreadCounts()).catch(() => undefined);
      }
    },
    [currentUserId, playSoundIntent, refreshUnreadCounts, visibleRailMode],
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

  return {refreshUnreadCounts, unreadCounts};
}
