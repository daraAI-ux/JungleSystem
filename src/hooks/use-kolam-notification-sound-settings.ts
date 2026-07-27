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
  intervalMs = 300_000,
}: {
  intervalMs?: number;
} = {}): KolamNotificationSoundSettingsState {
  const [state, setState] = useState<KolamNotificationSoundSettingsState>({
    loading: true,
    webSetting: null,
  });

  useEffect(() => {
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
  }, [intervalMs]);

  return state;
}
