import {
  createKolamNotificationSoundService,
  type KolamNotificationSoundServiceOptions,
} from './kolam-notification-sound-service';
import type {KolamWebSetting} from './kolam-api';
import {
  createKolamRuntimeNotificationSoundAdapter,
  stopKolamRuntimeNotificationSound,
} from './kolam-notification-sound-runtime';

export type KolamGroupCallRingtoneWebSetting = Pick<
  KolamWebSetting,
  'groupCallRingtone'
> | null;

type KolamGroupCallRingtonePlayer = {
  play: (
    request: Parameters<
      ReturnType<typeof createKolamNotificationSoundService>['play']
    >[0],
  ) => Promise<unknown>;
};

const RING_INTERVAL_MS = 2_400;

/**
 * SoT `playGroupCallRingtone` / `stopGroupCallRingtone` — loop while invitee is ringing.
 * Native MediaPlayer is one-shot; we re-trigger on an interval (no native rebuild for loop).
 * `stop()` must also halt in-flight native playback (needs rebuilt Windows bridge).
 */
export function createKolamGroupCallRingtoneController(
  options: {
    createSoundService?: (
      serviceOptions?: KolamNotificationSoundServiceOptions,
    ) => KolamGroupCallRingtonePlayer;
    intervalMs?: number;
    stopPlayback?: () => Promise<void> | void;
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

  const stopPlayback =
    options.stopPlayback ?? (() => stopKolamRuntimeNotificationSound());

  let timer: ReturnType<typeof setInterval> | null = null;
  let generation = 0;
  let webSetting: KolamGroupCallRingtoneWebSetting = null;
  let ringtonePath: string | undefined;

  const playOnce = (playGeneration: number) => {
    if (playGeneration !== generation) {
      return;
    }

    Promise.resolve(
      soundService.play({
        bypassCooldown: true,
        intent: 'group-call',
        // Prefer configured ringtone file (Settings); fallback beep if missing/unreachable.
        preferInstantLocal: false,
        webSetting: {
          groupCallRingtone: ringtonePath || webSetting?.groupCallRingtone,
          handoffNotificationSound: undefined,
          notificationSound: undefined,
          salesNotificationSound: undefined,
          unassignedNotificationSound: undefined,
        },
      }),
    )
      .then(() => {
        // In-flight play can finish after stop(); kill audio that started late.
        if (playGeneration !== generation) {
          return stopPlayback();
        }
        return undefined;
      })
      .catch(() => undefined);
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
      // Always (re)start a fresh loop so a prior stop cannot leave us silent.
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      const playGeneration = generation;
      playOnce(playGeneration);
      timer = setInterval(
        () => playOnce(playGeneration),
        options.intervalMs ?? RING_INTERVAL_MS,
      );
    },
    stop() {
      generation += 1;
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      Promise.resolve(stopPlayback()).catch(() => undefined);
    },
    get isRunning() {
      return timer != null;
    },
  };
}

let sharedRingtoneController: ReturnType<
  typeof createKolamGroupCallRingtoneController
> | null = null;

/** Process-wide controller so rail Join and gate overlay share one ringtone. */
export function getSharedKolamGroupCallRingtoneController() {
  if (!sharedRingtoneController) {
    sharedRingtoneController = createKolamGroupCallRingtoneController();
  }
  return sharedRingtoneController;
}

export function stopSharedKolamGroupCallRingtone() {
  getSharedKolamGroupCallRingtoneController().stop();
}
