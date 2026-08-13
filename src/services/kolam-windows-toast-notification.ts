import {
  DeviceEventEmitter,
  NativeEventEmitter,
  NativeModules,
  Platform,
  TurboModuleRegistry,
} from 'react-native';
import {
  resolveKolamChatDesktopToast,
  resolveKolamChatDesktopToastFromInboxConversation,
  resolveKolamChatDesktopToastFromUnreadInbox,
  resolveKolamChatDesktopToastFromUnreadTeam,
  type KolamChatDesktopToastRequest,
} from '../domain/kolam-chat-desktop-toast';
import type {KolamChatLiveClassification} from '../domain/kolam-chat-live-classifier';
import type {KolamChatLiveStreamKind} from '../domain/kolam-chat-live-contract';
import {
  getKolamChatConversation,
  getKolamChatConversations,
  getKolamTeamChatRooms,
} from './kolam-api';

export type KolamWindowsToastActivation = {
  stream: KolamChatLiveStreamKind;
  targetId: string;
};

type KolamWindowsToastNativeBridge = {
  showToast?: (
    options: KolamChatDesktopToastRequest,
  ) => Promise<{status?: string; tag?: string} | void> | void;
  takePendingActivation?: () => Promise<unknown>;
};

export async function showKolamWindowsToast(
  request: KolamChatDesktopToastRequest,
): Promise<void> {
  const bridge = getKolamWindowsToastNativeBridge();
  if (!bridge?.showToast) {
    return;
  }

  await bridge.showToast(request);
}

export function showKolamChatDesktopToastForUnread(
  stream: KolamChatLiveStreamKind,
) {
  try {
    Promise.resolve(showUnreadConversationToast(stream)).catch(() => undefined);
  } catch {
    // Toast must never break chat sound / live handlers.
  }
}

async function showUnreadConversationToast(stream: KolamChatLiveStreamKind) {
  if (stream === 'team-chat') {
    const request = resolveKolamChatDesktopToastFromUnreadTeam(
      await getKolamTeamChatRooms(),
    );
    if (request) {
      await showKolamWindowsToast(request);
    }
    return;
  }

  const request = resolveKolamChatDesktopToastFromUnreadInbox(
    await getKolamChatConversations({
      status: 'open',
      unreadOnly: true,
      limit: 100,
    }),
  );
  if (request) {
    await showKolamWindowsToast(request);
  }
}

export function showKolamChatDesktopToastFromLive({
  classification,
  currentUserId,
  payload,
}: {
  classification: Pick<
    KolamChatLiveClassification,
    'eventName' | 'soundIntent' | 'stream' | 'targetId'
  >;
  currentUserId?: string | null;
  payload: unknown;
}) {
  try {
    const request = resolveKolamChatDesktopToast({
      classification,
      currentUserId,
      payload,
    });
    if (request) {
      Promise.resolve(showKolamWindowsToast(request)).catch(() => undefined);
    }

    if (
      classification.stream === 'inbox' &&
      classification.eventName === 'conversation.updated' &&
      classification.soundIntent !== 'none' &&
      classification.targetId
    ) {
      Promise.resolve(
        showInboxToastFromConversation(classification.targetId),
      ).catch(() => undefined);
    }
  } catch {
    // Toast must never break chat sound / live handlers.
  }
}

async function showInboxToastFromConversation(conversationId: string) {
  const conversation = await getKolamChatConversation(conversationId);
  const request = resolveKolamChatDesktopToastFromInboxConversation(conversation);
  if (request) {
    await showKolamWindowsToast(request);
  }
}

export async function takeKolamWindowsToastActivation(): Promise<KolamWindowsToastActivation | null> {
  const bridge = getKolamWindowsToastNativeBridge();
  if (!bridge?.takePendingActivation) {
    return null;
  }

  return parseKolamWindowsToastActivation(await bridge.takePendingActivation());
}

export function subscribeKolamWindowsToastActivation(
  onActivate: (activation: KolamWindowsToastActivation) => void,
) {
  const handle = (raw: unknown) => {
    try {
      const activation = parseKolamWindowsToastActivation(raw);
      if (activation) {
        onActivate(activation);
      }
    } catch {
      // Ignore malformed activation payloads.
    }
  };

  const deviceSub = DeviceEventEmitter.addListener(
    'kolamToastActivated',
    handle,
  );
  let nativeSub: {remove: () => void} | null = null;

  try {
    const nativeModule = (
      NativeModules as Record<string, {addListener?: unknown} | undefined>
    ).KolamWindowsToastNotification;
    if (typeof nativeModule?.addListener === 'function') {
      nativeSub = new NativeEventEmitter(
        nativeModule as ConstructorParameters<typeof NativeEventEmitter>[0],
      ).addListener('ToastActivated', handle);
    }
  } catch {
    nativeSub = null;
  }

  return () => {
    deviceSub.remove();
    nativeSub?.remove();
  };
}

export function parseKolamWindowsToastActivation(
  raw: unknown,
): KolamWindowsToastActivation | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const fromLaunch = parseKolamWindowsToastLaunch(
    typeof record.launch === 'string'
      ? record.launch
      : typeof record.argument === 'string'
        ? record.argument
        : '',
  );
  if (fromLaunch) {
    return fromLaunch;
  }

  const stream = record.stream;
  const targetId =
    typeof record.targetId === 'string' ? record.targetId.trim() : '';

  if ((stream !== 'inbox' && stream !== 'team-chat') || !targetId) {
    return null;
  }

  return {stream, targetId};
}

export function parseKolamWindowsToastLaunch(
  value: string,
): KolamWindowsToastActivation | null {
  const raw = value.trim();
  if (!raw) {
    return null;
  }

  const uriMatch = raw.match(
    /junglesystem:\/\/chat\/(inbox|team-chat)\/([^/?#\s]+)/i,
  );
  if (uriMatch) {
    return {
      stream: uriMatch[1] === 'team-chat' ? 'team-chat' : 'inbox',
      targetId: decodeURIComponent(uriMatch[2]),
    };
  }

  const parts = raw.split('|');
  if (parts.length >= 3 && parts[0] === 'kolam-chat') {
    const stream = parts[1];
    const targetId = parts.slice(2).join('|').trim();
    if ((stream === 'inbox' || stream === 'team-chat') && targetId) {
      return {stream, targetId};
    }
  }

  return null;
}

function getKolamWindowsToastNativeBridge():
  | KolamWindowsToastNativeBridge
  | null {
  if (Platform.OS !== 'windows') {
    return null;
  }

  const fromNativeModules = (
    NativeModules as Record<string, KolamWindowsToastNativeBridge | undefined>
  ).KolamWindowsToastNotification;
  if (typeof fromNativeModules?.showToast === 'function') {
    return fromNativeModules;
  }

  try {
    const fromTurbo = TurboModuleRegistry.get<KolamWindowsToastNativeBridge>(
      'KolamWindowsToastNotification',
    );
    if (typeof fromTurbo?.showToast === 'function') {
      return fromTurbo;
    }
  } catch {
    // Classic native module lookup is enough when TurboModuleRegistry is empty.
  }

  return null;
}
