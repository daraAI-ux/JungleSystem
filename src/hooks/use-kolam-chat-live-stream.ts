import {useEffect, useMemo, useRef} from 'react';
import {appConfig} from '../config/app';
import {
  getKolamChatLiveEventContracts,
  KOLAM_CHAT_LIVE_STREAM_ROUTES,
  type KolamChatLiveEventContract,
  type KolamChatLiveStreamKind,
} from '../domain/kolam-chat-live-contract';
import {getRuntimeClientHeaders} from '../domain/runtime-client-contract';
import {buildUrl, getAccessToken} from '../lib/api-client';

type KolamEventSourceListener = (event: KolamMessageEvent) => void;

type KolamEventSourceLike = {
  addEventListener: (
    eventName: string,
    listener: KolamEventSourceListener,
  ) => void;
  close: () => void;
  onerror?: (() => void) | null;
  onopen?: (() => void) | null;
};

type KolamEventSourceFactory = (
  url: string,
  options?: {
    headers?: Record<string, string>;
    withCredentials?: boolean;
  },
) => KolamEventSourceLike;

type KolamMessageEvent = {
  data?: string;
  lastEventId?: string;
};

export type KolamChatLiveEvent = {
  contract: KolamChatLiveEventContract;
  eventId?: string;
  payload: unknown;
};

export type KolamChatLiveStreamStatus =
  | 'idle'
  | 'open'
  | 'closed'
  | 'unsupported'
  | 'error';

export type KolamChatLiveStreamOptions = {
  enabled?: boolean;
  eventSourceFactory?: KolamEventSourceFactory;
  mode: KolamChatLiveStreamKind;
  onEvent: (event: KolamChatLiveEvent) => void;
  onStatusChange?: (status: KolamChatLiveStreamStatus) => void;
};

type EventSourceGlobal = {
  new (
    url: string,
    options?: {
      headers?: Record<string, string>;
      withCredentials?: boolean;
    },
  ): KolamEventSourceLike;
};

export function useKolamChatLiveStream({
  enabled = true,
  eventSourceFactory,
  mode,
  onEvent,
  onStatusChange,
}: KolamChatLiveStreamOptions) {
  const onEventRef = useRef(onEvent);
  const onStatusChangeRef = useRef(onStatusChange);
  const contracts = useMemo(() => getKolamChatLiveEventContracts(mode), [mode]);

  onEventRef.current = onEvent;
  onStatusChangeRef.current = onStatusChange;

  useEffect(() => {
    if (!enabled) {
      onStatusChangeRef.current?.('idle');
      return undefined;
    }

    const factory = eventSourceFactory ?? getGlobalEventSourceFactory();
    if (!factory) {
      onStatusChangeRef.current?.('unsupported');
      return undefined;
    }

    const stream = factory(buildKolamChatLiveStreamUrl(mode), {
      headers: buildKolamChatLiveStreamHeaders(),
      withCredentials: true,
    });
    const seenEventIds = new Set<string>();

    stream.onopen = () => {
      onStatusChangeRef.current?.('open');
    };

    stream.onerror = () => {
      onStatusChangeRef.current?.('error');
    };

    contracts.forEach(contract => {
      stream.addEventListener(contract.eventName, event => {
        const eventId = event.lastEventId || undefined;
        if (eventId) {
          if (seenEventIds.has(eventId)) {
            return;
          }
          seenEventIds.add(eventId);
        }

        onEventRef.current({
          contract,
          eventId,
          payload: parseKolamChatLiveEventPayload(event.data),
        });
      });
    });

    return () => {
      onStatusChangeRef.current?.('closed');
      stream.close();
    };
  }, [contracts, enabled, eventSourceFactory, mode]);
}

export function buildKolamChatLiveStreamUrl(mode: KolamChatLiveStreamKind) {
  return buildUrl(
    KOLAM_CHAT_LIVE_STREAM_ROUTES[mode],
    undefined,
    appConfig.kolamApiBaseUrl,
  );
}

export function buildKolamChatLiveStreamHeaders() {
  const headers: Record<string, string> = getRuntimeClientHeaders({
    sourceHeader: appConfig.kolamSourceHeader,
  });
  const accessToken = getAccessToken();

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

function getGlobalEventSourceFactory(): KolamEventSourceFactory | undefined {
  const eventSource = (globalThis as {EventSource?: EventSourceGlobal})
    .EventSource;
  if (!eventSource) {
    return undefined;
  }

  return (url, options) => new eventSource(url, options);
}

function parseKolamChatLiveEventPayload(data: string | undefined) {
  if (!data) {
    return null;
  }

  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}
