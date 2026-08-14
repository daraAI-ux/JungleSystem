import {getKolamFileUrl} from '../lib/file-url';
import type {KolamNotificationSoundType, KolamWebSetting} from './kolam-api';

export const KOLAM_DEFAULT_NOTIFICATION_BEEP_URI =
  'data:audio/wav;base64,UklGRqQMAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YYAMAAAAAOEdCy4UKUERhPFs2H/R6d8P/Y0bZy1qKvUTWPQU2jjR1N0g+h4ZlSyVK5UWN/fi2yDR4ts395UWlSuVLB4ZIPrU3TjRFNpY9PUTaipnLY0bD/3p33/RbNiE8UERFCkLLuEdAAAf4vXR7Na/7nwOlCeBLhcg8QJz5JnSltUL7KgL7CXILiwi4AXi5mvTa9Rr6ckIHiTgLh4kyQhr6WvUa9Pi5uAFLCLILuwlqAsL7JbVmdJz5PECFyCBLpQnfA6/7uzW9dEf4g==';

export type KolamNotificationSoundIntent = KolamNotificationSoundType | 'none';

export type KolamNotificationSoundAdapter = {
  play: (uri: string, options: KolamNotificationSoundPlayOptions) => Promise<void>;
};

export type KolamNotificationSoundPlayOptions = {
  intent: KolamNotificationSoundType;
  volume: number;
};

export type KolamNotificationSoundServiceOptions = {
  adapter: KolamNotificationSoundAdapter;
  clock?: () => number;
  cooldownMs?: number;
  fallbackUri?: string;
  volume?: number;
};

export type KolamNotificationSoundRequest = {
  intent: KolamNotificationSoundIntent;
  /**
   * Skip the global cooldown (group-call ringtone loop / Settings preview).
   */
  bypassCooldown?: boolean;
  /**
   * Chat ding should not wait on a remote custom file download.
   * Settings preview keeps remote playback when this is false/omitted.
   */
  preferInstantLocal?: boolean;
  webSetting?: Pick<
    KolamWebSetting,
    | 'notificationSound'
    | 'unassignedNotificationSound'
    | 'handoffNotificationSound'
    | 'groupCallRingtone'
    | 'salesNotificationSound'
  > | null;
};

export type KolamNotificationSoundResult =
  | {
      played: true;
      intent: KolamNotificationSoundType;
      uri: string;
    }
  | {
      played: false;
      reason: 'cooldown' | 'none';
    };

const SOUND_FIELD_BY_INTENT: Record<
  KolamNotificationSoundType,
  keyof NonNullable<KolamNotificationSoundRequest['webSetting']>
> = {
  assigned: 'notificationSound',
  unassigned: 'unassignedNotificationSound',
  handoff: 'handoffNotificationSound',
  'group-call': 'groupCallRingtone',
  sales: 'salesNotificationSound',
};

export function createKolamNotificationSoundService({
  adapter,
  clock = Date.now,
  cooldownMs = 900,
  fallbackUri = KOLAM_DEFAULT_NOTIFICATION_BEEP_URI,
  volume = 0.5,
}: KolamNotificationSoundServiceOptions) {
  let lastPlayedAt = 0;

  return {
    async play(
      request: KolamNotificationSoundRequest,
    ): Promise<KolamNotificationSoundResult> {
      if (request.intent === 'none') {
        return {played: false, reason: 'none'};
      }

      const now = clock();
      if (
        !request.bypassCooldown &&
        lastPlayedAt > 0 &&
        now - lastPlayedAt < cooldownMs
      ) {
        return {played: false, reason: 'cooldown'};
      }

      let uri = resolveKolamNotificationSoundUri({
        fallbackUri,
        intent: request.intent,
        webSetting: request.webSetting,
      });

      if (request.preferInstantLocal && isRemoteNotificationSoundUri(uri)) {
        uri = fallbackUri;
      }

      lastPlayedAt = now;
      await adapter.play(uri, {intent: request.intent, volume});

      return {
        played: true,
        intent: request.intent,
        uri,
      };
    },
  };
}

export function resolveKolamNotificationSoundUri({
  fallbackUri = KOLAM_DEFAULT_NOTIFICATION_BEEP_URI,
  intent,
  webSetting,
}: {
  fallbackUri?: string;
  intent: KolamNotificationSoundType;
  webSetting?: KolamNotificationSoundRequest['webSetting'];
}) {
  const field = SOUND_FIELD_BY_INTENT[intent];
  const value = webSetting?.[field]?.trim();

  if (!value) {
    return fallbackUri;
  }

  return getKolamFileUrl(value) ?? fallbackUri;
}

function isRemoteNotificationSoundUri(uri: string) {
  return /^https?:\/\//i.test(uri.trim());
}
