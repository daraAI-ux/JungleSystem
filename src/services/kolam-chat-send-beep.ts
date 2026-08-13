import {NativeModules, Platform} from 'react-native';

import {
  KOLAM_DEFAULT_NOTIFICATION_BEEP_URI,
  type KolamNotificationSoundAdapter,
} from './kolam-notification-sound-service';
import {createKolamRuntimeNotificationSoundAdapter} from './kolam-notification-sound-runtime';

export type KolamChatSendBeepOptions = {
  adapter?: KolamNotificationSoundAdapter;
  volume?: number;
};

export type KolamChatSendBeepResult =
  | {
      played: true;
      uri: string;
    }
  | {
      played: false;
      reason: 'playback-failed';
    };

type KolamSendBeepNativeBridge = {
  playNotificationSound?: (
    uri: string,
    options: {intent: string; volume: number},
  ) => Promise<unknown> | unknown;
};

export async function playKolamChatSendBeep({
  adapter = createKolamRuntimeNotificationSoundAdapter(),
  volume = 0.5,
}: KolamChatSendBeepOptions = {}): Promise<KolamChatSendBeepResult> {
  const uri = KOLAM_DEFAULT_NOTIFICATION_BEEP_URI;
  const payload = {intent: 'assigned' as const, volume};

  try {
    const native = getKolamSendBeepNativeBridge();
    if (native?.playNotificationSound) {
      await native.playNotificationSound(uri, payload);
      return {played: true, uri};
    }

    await adapter.play(uri, payload);
    return {played: true, uri};
  } catch {
    return {played: false, reason: 'playback-failed'};
  }
}

function getKolamSendBeepNativeBridge(): KolamSendBeepNativeBridge | null {
  if (Platform.OS !== 'windows') {
    return null;
  }

  const bridge = (
    NativeModules as Record<string, KolamSendBeepNativeBridge | undefined>
  ).KolamWindowsNotificationSound;

  return typeof bridge?.playNotificationSound === 'function' ? bridge : null;
}
