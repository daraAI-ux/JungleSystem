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

const CHAT_NOTIFICATION_REFRESH_MS = 30_000;

export function resolveKolamChatUnreadRiseSoundIntents({
  next,
  previous,
  visibleRailMode,
}: {
  next: KolamChatUnreadCounts;
  previous: KolamChatUnreadCounts | null;
  visibleRailMode?: KolamChatLiveStreamKind | null;
}): KolamNotificationSoundType[] {
  if (!previous) {
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
  const soundSettings = useKolamNotificationSoundSettings({enabled});
  const notificationSoundService = useMemo(
    () =>
      createKolamNotificationSoundService({
        adapter: createKolamRuntimeNotificationSoundAdapter(),
      }),
    [],
  );

  unreadCountsRef.current = unreadCounts;
  visibleRailModeRef.current = visibleRailMode;

  const playSoundIntent = useCallback(
    (intent: KolamNotificationSoundType | 'none') => {
      Promise.resolve(
        notificationSoundService.play({
          intent,
          webSetting: soundSettings.webSetting,
        }),
      ).catch(() => undefined);
    },
    [notificationSoundService, soundSettings.webSetting],
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
      next,
      previous: previousUnreadRef.current,
      visibleRailMode: visibleRailModeRef.current,
    });
    previousUnreadRef.current = next;
    unreadCountsRef.current = next;
    setUnreadCounts(next);

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

      if (classification.refreshTargets.includes('unread-badge')) {
        Promise.resolve(refreshUnreadCounts()).catch(() => undefined);
      }

      if (visibleRailMode !== event.contract.stream) {
        playSoundIntent(classification.soundIntent);
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
