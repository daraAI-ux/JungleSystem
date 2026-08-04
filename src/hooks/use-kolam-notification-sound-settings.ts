import {useEffect, useState} from 'react';
import {
  getKolamWebSetting,
  type KolamWebSetting,
} from '../services/kolam-api';

export type KolamNotificationSoundSettingsState = {
  loading: boolean;
  webSetting: Pick<
    KolamWebSetting,
    | 'notificationSound'
    | 'unassignedNotificationSound'
    | 'handoffNotificationSound'
    | 'groupCallRingtone'
    | 'salesNotificationSound'
  > | null;
};

export function useKolamNotificationSoundSettings({
  enabled = true,
  intervalMs = 300_000,
}: {
  enabled?: boolean;
  intervalMs?: number;
} = {}): KolamNotificationSoundSettingsState {
  const [state, setState] = useState<KolamNotificationSoundSettingsState>({
    loading: true,
    webSetting: null,
  });

  useEffect(() => {
    if (!enabled) {
      setState({
        loading: false,
        webSetting: null,
      });
      return undefined;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    const refresh = async () => {
      try {
        const webSetting = await getKolamWebSetting();
        if (cancelled) {
          return;
        }

        setState({
          loading: false,
          webSetting: {
            groupCallRingtone: webSetting.groupCallRingtone,
            handoffNotificationSound: webSetting.handoffNotificationSound,
            notificationSound: webSetting.notificationSound,
            salesNotificationSound: webSetting.salesNotificationSound,
            unassignedNotificationSound: webSetting.unassignedNotificationSound,
          },
        });
      } catch {
        if (cancelled) {
          return;
        }

        setState(current => ({
          ...current,
          loading: false,
        }));
      }
    };

    refresh();
    timer = setInterval(refresh, intervalMs);

    return () => {
      cancelled = true;
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [enabled, intervalMs]);

  return state;
}
