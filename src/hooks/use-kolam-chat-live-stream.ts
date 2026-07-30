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

type KolamXmlHttpRequestLike = {
  DONE: number;
  LOADING: number;
  HEADERS_RECEIVED: number;
  readyState: number;
  responseText: string;
  status: number;
  abort: () => void;
  getResponseHeader?: (header: string) => string | null;
  onreadystatechange?: (() => void) | null;
  onerror?: (() => void) | null;
  onprogress?: (() => void) | null;
  ontimeout?: (() => void) | null;
  open: (method: string, url: string, async?: boolean) => void;
  send: () => void;
  setRequestHeader: (header: string, value: string) => void;
  timeout?: number;
  withCredentials?: boolean;
};

type XmlHttpRequestGlobal = {
  new (): KolamXmlHttpRequestLike;
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

    const seenEventIds = new Set<string>();
    let closed = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let stream: KolamEventSourceLike | null = null;

    const closeStream = () => {
      stream?.close();
      stream = null;
    };

    const connect = () => {
      if (closed) {
        return;
      }

      closeStream();
      stream = factory(buildKolamChatLiveStreamUrl(mode), {
        headers: buildKolamChatLiveStreamHeaders(),
        withCredentials: true,
      });

      stream.onopen = () => {
        if (closed) {
          return;
        }

        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
        onStatusChangeRef.current?.('open');
      };

      stream.onerror = () => {
        if (closed) {
          return;
        }

        onStatusChangeRef.current?.('error');
        if (reconnectTimer) {
          return;
        }

        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          connect();
        }, 2000);
      };

      contracts.forEach(contract => {
        stream?.addEventListener(contract.eventName, event => {
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
    };

    connect();

    return () => {
      closed = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      onStatusChangeRef.current?.('closed');
      closeStream();
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
  if (eventSource) {
    return (url, options) => new eventSource(url, options);
  }

  return getXmlHttpRequestEventSourceFactory();
}

function getXmlHttpRequestEventSourceFactory():
  | KolamEventSourceFactory
  | undefined {
  const XmlHttpRequest = (
    globalThis as {XMLHttpRequest?: XmlHttpRequestGlobal}
  ).XMLHttpRequest;

  if (!XmlHttpRequest) {
    return undefined;
  }

  return (url, options) =>
    createXmlHttpRequestEventSource(url, options, XmlHttpRequest);
}

function createXmlHttpRequestEventSource(
  url: string,
  options: Parameters<KolamEventSourceFactory>[1],
  XmlHttpRequest: XmlHttpRequestGlobal,
): KolamEventSourceLike {
  const listeners = new Map<string, Set<KolamEventSourceListener>>();
  const xhr = new XmlHttpRequest();
  let closed = false;
  let opened = false;
  let processedLength = 0;
  let pendingChunk = '';

  const source: KolamEventSourceLike = {
    addEventListener(eventName, listener) {
      const existing = listeners.get(eventName) ?? new Set();
      existing.add(listener);
      listeners.set(eventName, existing);
    },
    close() {
      if (closed) {
        return;
      }

      closed = true;
      xhr.abort();
    },
    onerror: null,
    onopen: null,
  };

  xhr.open('GET', url, true);
  xhr.withCredentials = options?.withCredentials === true;
  Object.entries(options?.headers ?? {}).forEach(([header, value]) => {
    xhr.setRequestHeader(header, value);
  });

  const readAvailableText = () => {
    if (closed || !xhr.responseText) {
      return;
    }

    const nextText = xhr.responseText.slice(processedLength);
    processedLength = xhr.responseText.length;
    if (!nextText) {
      return;
    }

    pendingChunk = parseKolamSseText(
      `${pendingChunk}${nextText}`,
      (eventName, data, eventId) => {
        listeners.get(eventName)?.forEach(listener => {
          listener({data, lastEventId: eventId});
        });
      },
    );
  };

  const markOpen = () => {
    if (opened || closed) {
      return;
    }

    opened = true;
    source.onopen?.();
  };

  const markError = () => {
    if (closed) {
      return;
    }

    source.onerror?.();
  };

  xhr.onreadystatechange = () => {
    if (
      xhr.readyState === xhr.HEADERS_RECEIVED ||
      xhr.readyState === xhr.LOADING
    ) {
      markOpen();
      readAvailableText();
      return;
    }

    if (xhr.readyState === xhr.DONE) {
      readAvailableText();
      if (!closed) {
        markError();
      }
    }
  };
  xhr.onprogress = () => {
    markOpen();
    readAvailableText();
  };
  xhr.onerror = markError;
  xhr.ontimeout = markError;
  xhr.send();

  return source;
}

function parseKolamSseText(
  text: string,
  emit: (eventName: string, data: string, eventId?: string) => void,
) {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split('\n\n');
  const pending = blocks.pop() ?? '';

  blocks.forEach(block => {
    const event = parseKolamSseEventBlock(block);
    if (event) {
      emit(event.eventName, event.data, event.eventId);
    }
  });

  return pending;
}

function parseKolamSseEventBlock(block: string) {
  let eventName = 'message';
  let eventId: string | undefined;
  const dataLines: string[] = [];

  block.split('\n').forEach(line => {
    if (!line || line.startsWith(':')) {
      return;
    }

    const separatorIndex = line.indexOf(':');
    const field =
      separatorIndex >= 0 ? line.slice(0, separatorIndex) : line;
    const rawValue =
      separatorIndex >= 0 ? line.slice(separatorIndex + 1) : '';
    const value = rawValue.startsWith(' ') ? rawValue.slice(1) : rawValue;

    if (field === 'event') {
      eventName = value || 'message';
    } else if (field === 'id') {
      eventId = value || undefined;
    } else if (field === 'data') {
      dataLines.push(value);
    }
  });

  if (!dataLines.length) {
    return null;
  }

  return {
    data: dataLines.join('\n'),
    eventId,
    eventName,
  };
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
