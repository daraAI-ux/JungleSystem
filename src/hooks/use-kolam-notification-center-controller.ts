import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';
import {
  formatKolamNotificationDateTime,
  getKolamNotificationLink,
  type KolamNotification,
  type KolamNotificationStats,
  type KolamNotificationsResult,
} from '../domain/kolam-notifications';
import {
  getKolamNotifications,
  getKolamNotificationStats,
  markAllKolamNotificationsRead,
  markKolamNotificationRead,
} from '../services/kolam-notifications-api';
import {useKolamNotificationSoundSettings} from './use-kolam-notification-sound-settings';
import {createKolamNotificationSoundService} from '../services/kolam-notification-sound-service';
import {createKolamRuntimeNotificationSoundAdapter} from '../services/kolam-notification-sound-runtime';
import type {AttentionPanelItem} from '../domain/attention-panel';

const NOTIFICATION_STATS_REFRESH_MS = 30_000;
const NOTIFICATION_LIST_REFRESH_MS = 60_000;

const EMPTY_STATS: KolamNotificationStats = {
  total: 0,
  unread: 0,
  read: 0,
};

const EMPTY_RESULT: KolamNotificationsResult = {
  data: [],
  pagination: {
    from: 0,
    hasMore: false,
    page: 1,
    perPage: 10,
    to: 0,
    totalData: 0,
  },
};

export function useKolamNotificationCenterController({
  enabled,
  limit = 10,
  page = 1,
  playSoundOnNewUnread = false,
}: {
  enabled: boolean;
  limit?: number;
  page?: number;
  playSoundOnNewUnread?: boolean;
}) {
  const [result, setResult] = useState<KolamNotificationsResult>(EMPTY_RESULT);
  const [stats, setStats] = useState<KolamNotificationStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const previousUnreadRef = useRef<number | null>(null);
  const latestNotificationRef = useRef<KolamNotification | undefined>(
    undefined,
  );
  const soundSettings = useKolamNotificationSoundSettings({
    enabled: enabled && playSoundOnNewUnread,
  });
  const soundService = useMemo(
    () =>
      createKolamNotificationSoundService({
        adapter: createKolamRuntimeNotificationSoundAdapter(),
      }),
    [],
  );

  const refreshStats = useCallback(async () => {
    if (!enabled) {
      setStats(EMPTY_STATS);
      previousUnreadRef.current = null;
      return EMPTY_STATS;
    }

    const nextStats = await getKolamNotificationStats();
    setStats(nextStats);
    return nextStats;
  }, [enabled]);

  const refreshList = useCallback(async () => {
    if (!enabled) {
      setResult({
        ...EMPTY_RESULT,
        pagination: {...EMPTY_RESULT.pagination, page, perPage: limit},
      });
      latestNotificationRef.current = undefined;
      return EMPTY_RESULT;
    }

    const nextResult = await getKolamNotifications({
      page,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setResult(nextResult);
    latestNotificationRef.current = nextResult.data[0];
    return nextResult;
  }, [enabled, limit, page]);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      setIsRefreshing(false);
      setErrorMessage('');
      setStats(EMPTY_STATS);
      setResult({
        ...EMPTY_RESULT,
        pagination: {...EMPTY_RESULT.pagination, page, perPage: limit},
      });
      previousUnreadRef.current = null;
      latestNotificationRef.current = undefined;
      return;
    }

    setIsRefreshing(true);
    setErrorMessage('');
    try {
      const [nextStats, nextResult] = await Promise.all([
        refreshStats(),
        refreshList(),
      ]);
      maybePlayNotificationSound({
        latest: nextResult.data[0],
        nextUnread: nextStats.unread,
        playSoundOnNewUnread,
        previousUnreadRef,
        soundService,
        webSetting: soundSettings.webSetting,
      });
    } catch (error) {
      setErrorMessage(getNotificationErrorMessage(error));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [
    enabled,
    limit,
    page,
    playSoundOnNewUnread,
    refreshList,
    refreshStats,
    soundService,
    soundSettings.webSetting,
  ]);

  useEffect(() => {
    if (!enabled) {
      setStats(EMPTY_STATS);
      setResult({
        ...EMPTY_RESULT,
        pagination: {...EMPTY_RESULT.pagination, page, perPage: limit},
      });
      previousUnreadRef.current = null;
      latestNotificationRef.current = undefined;
      return undefined;
    }

    setIsLoading(true);
    refresh();

    const statsTimer = setInterval(() => {
      refreshStats()
        .then(nextStats => {
          maybePlayNotificationSound({
            latest: latestNotificationRef.current,
            nextUnread: nextStats.unread,
            playSoundOnNewUnread,
            previousUnreadRef,
            soundService,
            webSetting: soundSettings.webSetting,
          });
        })
        .catch(error => setErrorMessage(getNotificationErrorMessage(error)));
    }, NOTIFICATION_STATS_REFRESH_MS);
    const listTimer = setInterval(() => {
      refreshList().catch(error =>
        setErrorMessage(getNotificationErrorMessage(error)),
      );
    }, NOTIFICATION_LIST_REFRESH_MS);
    (statsTimer as {unref?: () => void}).unref?.();
    (listTimer as {unref?: () => void}).unref?.();

    return () => {
      clearInterval(statsTimer);
      clearInterval(listTimer);
    };
  }, [
    enabled,
    limit,
    page,
    playSoundOnNewUnread,
    refresh,
    refreshList,
    refreshStats,
    soundService,
    soundSettings.webSetting,
  ]);

  const markAsRead = useCallback(
    async (notification: KolamNotification) => {
      if (!enabled || notification.isRead) {
        return;
      }

      await markKolamNotificationRead(notification._id);
      await Promise.all([refreshStats(), refreshList()]);
    },
    [enabled, refreshList, refreshStats],
  );

  const markAllAsRead = useCallback(async () => {
    if (!enabled) {
      return;
    }

    await markAllKolamNotificationsRead();
    await Promise.all([refreshStats(), refreshList()]);
  }, [enabled, refreshList, refreshStats]);

  const attentionItems = useMemo(
    () =>
      result.data.length
        ? result.data.map(getKolamNotificationAttentionItem)
        : [
            {
              id: 'notification-empty',
              label: 'No notifications',
              message: '',
              meta: 'Notifications',
              tone: 'success' as const,
              isUnread: false,
            },
          ],
    [result.data],
  );

  return {
    attentionItems,
    errorMessage,
    isLoading,
    isRefreshing,
    markAllAsRead,
    markAsRead,
    notifications: result.data,
    pagination: result.pagination,
    refresh,
    stats,
    unreadCount: stats.unread,
  };
}

export function getKolamNotificationAttentionItem(
  notification: KolamNotification,
): AttentionPanelItem {
  return {
    id: `notification-${notification._id}`,
    label: notification.title,
    message: notification.message,
    meta: formatKolamNotificationDateTime(notification.createdAt),
    tone: getNotificationTone(notification.type),
    isUnread: !notification.isRead,
    notification,
    routeHint: getKolamNotificationLink(notification),
  };
}

function getNotificationTone(type: KolamNotification['type']) {
  if (type === 'success') {
    return 'success';
  }
  if (type === 'warning') {
    return 'warning';
  }
  if (type === 'error') {
    return 'danger';
  }

  return 'info';
}

function maybePlayNotificationSound({
  latest,
  nextUnread,
  playSoundOnNewUnread,
  previousUnreadRef,
  soundService,
  webSetting,
}: {
  latest?: KolamNotification;
  nextUnread: number;
  playSoundOnNewUnread: boolean;
  previousUnreadRef: MutableRefObject<number | null>;
  soundService: ReturnType<typeof createKolamNotificationSoundService>;
  webSetting: ReturnType<typeof useKolamNotificationSoundSettings>['webSetting'];
}) {
  const previousUnread = previousUnreadRef.current;
  if (previousUnread === null) {
    previousUnreadRef.current = nextUnread;
    return;
  }

  if (!playSoundOnNewUnread || nextUnread <= previousUnread) {
    previousUnreadRef.current = nextUnread;
    return;
  }

  previousUnreadRef.current = nextUnread;
  Promise.resolve(
    soundService.play({
      intent: latest?.category === 'sales' ? 'sales' : 'assigned',
      webSetting,
    }),
  ).catch(() => undefined);
}

function getNotificationErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Gagal memuat notifikasi.';
}
