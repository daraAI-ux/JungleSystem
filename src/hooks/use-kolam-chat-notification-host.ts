import {useCallback, useEffect, useMemo, useState} from 'react';
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
} from '../services/kolam-api';
import {createKolamNotificationSoundService} from '../services/kolam-notification-sound-service';
import {createKolamRuntimeNotificationSoundAdapter} from '../services/kolam-notification-sound-runtime';

export type KolamChatUnreadCounts = {
  inbox: number;
  team: number;
};

const CHAT_NOTIFICATION_REFRESH_MS = 30_000;

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
  const soundSettings = useKolamNotificationSoundSettings({enabled});
  const notificationSoundService = useMemo(
    () =>
      createKolamNotificationSoundService({
        adapter: createKolamRuntimeNotificationSoundAdapter(),
      }),
    [],
  );

  const refreshUnreadCounts = useCallback(async () => {
    if (!enabled) {
      setUnreadCounts({inbox: 0, team: 0});
      return;
    }

    const [inboxResult, teamResult] = await Promise.allSettled([
      getKolamChatUnreadTotal(),
      getKolamTeamChatUnreadTotal(),
    ]);

    setUnreadCounts(current => ({
      inbox:
        inboxResult.status === 'fulfilled'
          ? Math.max(0, inboxResult.value)
          : current.inbox,
      team:
        teamResult.status === 'fulfilled'
          ? Math.max(0, teamResult.value)
          : current.team,
    }));
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
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
        Promise.resolve(
          notificationSoundService.play({
            intent: classification.soundIntent,
            webSetting: soundSettings.webSetting,
          }),
        ).catch(() => undefined);
      }
    },
    [
      currentUserId,
      notificationSoundService,
      refreshUnreadCounts,
      soundSettings.webSetting,
      visibleRailMode,
    ],
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
