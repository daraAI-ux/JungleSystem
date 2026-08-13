import {Image, type ImageSourcePropType} from 'react-native';

import type {KolamNotificationSoundAdapter} from './kolam-notification-sound-service';
import {createKolamRuntimeNotificationSoundAdapter} from './kolam-notification-sound-runtime';

declare const require: (moduleName: string) => unknown;

const KOLAM_CHAT_SEND_BEEP_ASSET = require('../assets/sounds/chat-send-beep.wav') as ImageSourcePropType;

export type KolamChatSendBeepOptions = {
  adapter?: KolamNotificationSoundAdapter;
  resolveAssetSource?: typeof Image.resolveAssetSource;
  volume?: number;
};

export type KolamChatSendBeepResult =
  | {
      played: true;
      uri: string;
    }
  | {
      played: false;
      reason: 'missing-uri' | 'playback-failed';
    };

export async function playKolamChatSendBeep({
  adapter = createKolamRuntimeNotificationSoundAdapter(),
  resolveAssetSource = Image.resolveAssetSource,
  volume = 0.28,
}: KolamChatSendBeepOptions = {}): Promise<KolamChatSendBeepResult> {
  const uri = resolveKolamChatSendBeepUri(resolveAssetSource);
  if (!uri) {
    return {played: false, reason: 'missing-uri'};
  }

  try {
    await adapter.play(uri, {
      intent: 'assigned',
      volume,
    });
    return {played: true, uri};
  } catch {
    return {played: false, reason: 'playback-failed'};
  }
}

export function resolveKolamChatSendBeepUri(
  resolveAssetSource: typeof Image.resolveAssetSource = Image.resolveAssetSource,
) {
  const source = resolveAssetSource(KOLAM_CHAT_SEND_BEEP_ASSET);
  return typeof source?.uri === 'string' && source.uri.trim()
    ? source.uri
    : null;
}
