import {NativeModules, Platform} from 'react-native';
import type {
  KolamNotificationSoundAdapter,
  KolamNotificationSoundPlayOptions,
} from './kolam-notification-sound-service';

export type KolamNotificationSoundRuntimePath =
  | 'native-windows'
  | 'web-audio'
  | 'unsupported';

export type KolamNotificationSoundNativeResult = {
  path?: string;
  status?: string;
  uri?: string;
};

export type KolamNotificationSoundNativeBridge = {
  playNotificationSound?: (
    uri: string,
    options?: KolamNotificationSoundNativePayload,
  ) =>
    | Promise<KolamNotificationSoundNativeResult | void>
    | KolamNotificationSoundNativeResult
    | void;
  playSound?: (
    uri: string,
    options?: KolamNotificationSoundNativePayload,
  ) =>
    | Promise<KolamNotificationSoundNativeResult | void>
    | KolamNotificationSoundNativeResult
    | void;
};

export type KolamNotificationSoundNativePayload = {
  intent: string;
  volume: number;
};

export type KolamRuntimeAudioElement = {
  currentTime?: number;
  play: () => Promise<void> | void;
  volume?: number;
};

export type KolamRuntimeNotificationSoundAdapterOptions = {
  audioFactory?: (uri: string) => KolamRuntimeAudioElement;
  nativeModules?: Record<
    string,
    KolamNotificationSoundNativeBridge | undefined
  >;
  platformOS?: string;
};

export function createKolamRuntimeNotificationSoundAdapter(
  options: KolamRuntimeNotificationSoundAdapterOptions = {},
): KolamNotificationSoundAdapter {
  return {
    async play(uri, playOptions) {
      const runtimePath = await playKolamRuntimeNotificationSound(
        uri,
        playOptions,
        options,
      );
      if (runtimePath === 'unsupported') {
        throw new Error('Native notification sound runtime is unavailable.');
      }
    },
  };
}

export async function playKolamRuntimeNotificationSound(
  uri: string,
  playOptions: KolamNotificationSoundPlayOptions,
  options: KolamRuntimeNotificationSoundAdapterOptions = {},
): Promise<KolamNotificationSoundRuntimePath> {
  const nativeBridge = getKolamNotificationSoundNativeBridge(options);
  if (nativeBridge) {
    const payload = toNativePayload(playOptions);
    if (nativeBridge.playNotificationSound) {
      await nativeBridge.playNotificationSound(uri, payload);
      return 'native-windows';
    }

    if (nativeBridge.playSound) {
      await nativeBridge.playSound(uri, payload);
      return 'native-windows';
    }
  }

  const audioFactory = options.audioFactory ?? getGlobalAudioFactory();
  if (audioFactory) {
    await playWithAudioFactory(audioFactory, uri, playOptions);
    return 'web-audio';
  }

  return 'unsupported';
}

export function getKolamNotificationSoundRuntimePath(
  options: KolamRuntimeNotificationSoundAdapterOptions = {},
): KolamNotificationSoundRuntimePath {
  if (getKolamNotificationSoundNativeBridge(options)) {
    return 'native-windows';
  }

  if (options.audioFactory ?? getGlobalAudioFactory()) {
    return 'web-audio';
  }

  return 'unsupported';
}

export function getKolamNotificationSoundNativeBridge({
  nativeModules = NativeModules as Record<
    string,
    KolamNotificationSoundNativeBridge | undefined
  >,
  platformOS = Platform.OS,
}: KolamRuntimeNotificationSoundAdapterOptions = {}) {
  if (platformOS !== 'windows') {
    return null;
  }

  const bridge =
    nativeModules.KolamWindowsNotificationSound ??
    nativeModules.KolamNotificationSound;

  if (
    typeof bridge?.playNotificationSound === 'function' ||
    typeof bridge?.playSound === 'function'
  ) {
    return bridge;
  }

  return null;
}

function toNativePayload({
  intent,
  volume,
}: KolamNotificationSoundPlayOptions): KolamNotificationSoundNativePayload {
  return {
    intent,
    volume: clampVolume(volume),
  };
}

async function playWithAudioFactory(
  audioFactory: (uri: string) => KolamRuntimeAudioElement,
  uri: string,
  {volume}: KolamNotificationSoundPlayOptions,
) {
  const audio = audioFactory(uri);
  audio.volume = clampVolume(volume);
  audio.currentTime = 0;
  await audio.play();
}

function getGlobalAudioFactory() {
  const AudioConstructor = (globalThis as {
    Audio?: new (uri: string) => KolamRuntimeAudioElement;
  }).Audio;

  if (!AudioConstructor) {
    return undefined;
  }

  return (uri: string) => new AudioConstructor(uri);
}

function clampVolume(volume: number) {
  if (!Number.isFinite(volume)) {
    return 0.5;
  }

  return Math.min(1, Math.max(0, volume));
}
