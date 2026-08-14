import {
  createKolamNotificationSoundService,
  type KolamNotificationSoundServiceOptions,
} from './kolam-notification-sound-service';
import type {KolamWebSetting} from './kolam-api';
import {createKolamRuntimeNotificationSoundAdapter} from './kolam-notification-sound-runtime';

export type KolamGroupCallRingtoneWebSetting = Pick<
  KolamWebSetting,
  'groupCallRingtone'
> | null;

const RING_INTERVAL_MS = 2_400;

/**
 * SoT `playGroupCallRingtone` / `stopGroupCallRingtone` — loop while invitee is ringing.
 * Native MediaPlayer is one-shot; we re-trigger on an interval (no native rebuild).
 */
export function createKolamGroupCallRingtoneController(
  options: {
    createSoundService?: (
      serviceOptions?: KolamNotificationSoundServiceOptions,
    ) => ReturnType<typeof createKolamNotificationSoundService>;
    intervalMs?: number;
  } = {},
) {
  const soundService = (
    options.createSoundService ??
    ((serviceOptions?: KolamNotificationSoundServiceOptions) =>
      createKolamNotificationSoundService({
        adapter: createKolamRuntimeNotificationSoundAdapter(),
        ...serviceOptions,
      }))
  )({cooldownMs: 0});

  let timer: ReturnType<typeof setInterval> | null = null;
  let webSetting: KolamGroupCallRingtoneWebSetting = null;
  let ringtonePath: string | undefined;

  const playOnce = () => {
    Promise.resolve(
      soundService.play({
        bypassCooldown: true,
        intent: 'group-call',
        preferInstantLocal: true,
        webSetting: {
          groupCallRingtone: ringtonePath || webSetting?.groupCallRingtone,
          handoffNotificationSound: undefined,
          notificationSound: undefined,
          salesNotificationSound: undefined,
          unassignedNotificationSound: undefined,
        },
      }),
    ).catch(() => undefined);
  };

  return {
    setRingtonePath(path?: string | null) {
      ringtonePath =
        typeof path === 'string' && path.trim() ? path.trim() : undefined;
    },
    setWebSetting(next: KolamGroupCallRingtoneWebSetting) {
      webSetting = next;
    },
    start() {
      if (timer) {
        return;
      }
      playOnce();
      timer = setInterval(playOnce, options.intervalMs ?? RING_INTERVAL_MS);
    },
    stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    },
    get isRunning() {
      return timer != null;
    },
  };
}
