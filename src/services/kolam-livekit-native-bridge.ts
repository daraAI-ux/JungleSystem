import {NativeEventEmitter, NativeModules, Platform} from 'react-native';

export type KolamLiveKitConnectParams = {
  identity: string;
  roomName: string;
  token: string;
  url: string;
};

export type KolamLiveKitNativeResult = {
  ok?: boolean;
  reason?: string;
  status?: string;
};

export type KolamLiveKitConnectionChangedEvent = {
  intentional?: boolean;
  reason?: string;
  status?: string;
};

export type KolamLiveKitMediaErrorEvent = {
  reason?: string;
  trackSid?: string;
};

export type KolamLiveKitNativeBridge = {
  addListener?: (eventName: string) => void;
  connectRoom?: (
    params: KolamLiveKitConnectParams,
  ) =>
    | Promise<KolamLiveKitNativeResult | void>
    | KolamLiveKitNativeResult
    | void;
  disconnectRoom?: () =>
    | Promise<KolamLiveKitNativeResult | void>
    | KolamLiveKitNativeResult
    | void;
  removeListeners?: (count: number) => void;
  setMicEnabled?: (
    enabled: boolean,
  ) =>
    | Promise<KolamLiveKitNativeResult | void>
    | KolamLiveKitNativeResult
    | void;
};

export type KolamLiveKitNativeBridgeOptions = {
  nativeModules?: Record<string, KolamLiveKitNativeBridge | undefined>;
  platformOS?: string;
};

const NATIVE_MODULE_NAME = 'KolamWindowsLiveKitRoom';

export function getKolamLiveKitNativeBridge(
  options: KolamLiveKitNativeBridgeOptions = {},
): KolamLiveKitNativeBridge | null {
  const platformOS = options.platformOS ?? Platform.OS;
  if (platformOS !== 'windows') {
    return null;
  }

  const modules = options.nativeModules ?? NativeModules;
  const bridge = modules[NATIVE_MODULE_NAME];
  return bridge && typeof bridge === 'object' ? bridge : null;
}

export function isKolamLiveKitNativeBridgeAvailable(
  options: KolamLiveKitNativeBridgeOptions = {},
): boolean {
  const bridge = getKolamLiveKitNativeBridge(options);
  return typeof bridge?.connectRoom === 'function';
}

export function subscribeKolamLiveKitNativeEvents(
  handlers: {
    onConnectionChanged?: (event: KolamLiveKitConnectionChangedEvent) => void;
    onMediaError?: (event: KolamLiveKitMediaErrorEvent) => void;
  },
  options: KolamLiveKitNativeBridgeOptions = {},
): () => void {
  const bridge = getKolamLiveKitNativeBridge(options);
  if (!bridge) {
    return () => undefined;
  }

  const modules = options.nativeModules ?? NativeModules;
  const emitter = new NativeEventEmitter(
    modules[NATIVE_MODULE_NAME] as Parameters<typeof NativeEventEmitter>[0],
  );
  const subscriptions = [
    handlers.onConnectionChanged
      ? emitter.addListener('ConnectionChanged', handlers.onConnectionChanged)
      : null,
    handlers.onMediaError
      ? emitter.addListener('MediaError', handlers.onMediaError)
      : null,
  ].filter(Boolean) as Array<{remove: () => void}>;

  return () => {
    subscriptions.forEach(subscription => subscription.remove());
  };
}
