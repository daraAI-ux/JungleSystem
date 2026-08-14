import {useEffect, useMemo, useRef} from 'react';
import {NativeEventEmitter, NativeModules, Platform} from 'react-native';
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
  onactivity?: (() => void) | null;
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

type KolamBrowserStorageLike = {
  getItem: (key: string) => string | null;
  removeItem: (key: string) => void;
  setItem: (key: string, value: string) => void;
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

const KOLAM_CHAT_LIVE_RECONNECT_MS = 2000;
const KOLAM_CHAT_LIVE_ACTIVITY_TIMEOUT_MS = 90000;
const KOLAM_CHAT_LIVE_WATCHDOG_MS = 30000;
const lastEventIdMemory: Partial<Record<KolamChatLiveStreamKind, string>> = {};

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
    let watchdogTimer: ReturnType<typeof setInterval> | null = null;
    let stream: KolamEventSourceLike | null = null;
    let lastActivityAt = 0;

    const closeStream = () => {
      stream?.close();
      stream = null;
    };

    const clearReconnectTimer = () => {
      if (!reconnectTimer) {
        return;
      }

      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    };

    const touchActivity = () => {
      lastActivityAt = Date.now();
      clearReconnectTimer();
      onStatusChangeRef.current?.('open');
    };

    const scheduleReconnect = () => {
      if (closed || reconnectTimer) {
        return;
      }

      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, KOLAM_CHAT_LIVE_RECONNECT_MS);
    };

    const connect = () => {
      if (closed) {
        return;
      }

      closeStream();
      const lastEventId = getStoredKolamChatLiveLastEventId(mode);
      stream = factory(buildKolamChatLiveStreamUrl(mode, lastEventId), {
        headers: buildKolamChatLiveStreamHeaders(lastEventId),
        withCredentials: true,
      });

      stream.onopen = () => {
        if (closed) {
          return;
        }

        touchActivity();
      };
      stream.onactivity = touchActivity;

      stream.onerror = () => {
        if (closed) {
          return;
        }

        onStatusChangeRef.current?.('error');
        scheduleReconnect();
      };

      contracts.forEach(contract => {
        stream?.addEventListener(contract.eventName, event => {
          const eventId = event.lastEventId || undefined;
          if (eventId) {
            if (seenEventIds.has(eventId)) {
              return;
            }
            seenEventIds.add(eventId);
            rememberKolamChatLiveLastEventId(mode, eventId);
          }

          touchActivity();
          onEventRef.current({
            contract,
            eventId,
            payload: parseKolamChatLiveEventPayload(event.data),
          });
        });
      });
    };

    connect();
    watchdogTimer = setInterval(() => {
      if (
        closed ||
        !lastActivityAt ||
        Date.now() - lastActivityAt <= KOLAM_CHAT_LIVE_ACTIVITY_TIMEOUT_MS
      ) {
        return;
      }

      onStatusChangeRef.current?.('error');
      connect();
    }, KOLAM_CHAT_LIVE_WATCHDOG_MS);
    (watchdogTimer as {unref?: () => void}).unref?.();

    return () => {
      closed = true;
      clearReconnectTimer();
      if (watchdogTimer) {
        clearInterval(watchdogTimer);
      }
      onStatusChangeRef.current?.('closed');
      closeStream();
    };
  }, [contracts, enabled, eventSourceFactory, mode]);
}

export function buildKolamChatLiveStreamUrl(
  mode: KolamChatLiveStreamKind,
  lastEventId?: string,
) {
  return buildUrl(
    KOLAM_CHAT_LIVE_STREAM_ROUTES[mode],
    lastEventId ? {lastEventId} : undefined,
    appConfig.kolamApiBaseUrl,
  );
}

export function buildKolamChatLiveStreamHeaders(lastEventId?: string) {
  const headers: Record<string, string> = getRuntimeClientHeaders({
    sourceHeader: appConfig.kolamSourceHeader,
  });
  const accessToken = getAccessToken();

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (lastEventId) {
    headers['Last-Event-ID'] = lastEventId;
  }

  return headers;
}

export function clearKolamChatLiveLastEventIdsForTest() {
  (['inbox', 'team-chat'] as const).forEach(mode => {
    delete lastEventIdMemory[mode];
    try {
      (globalThis as {localStorage?: KolamBrowserStorageLike}).localStorage?.removeItem(
        getKolamChatLiveLastEventStorageKey(mode),
      );
    } catch {
      // Test environments may not expose localStorage.
    }
  });
}

function getGlobalEventSourceFactory(): KolamEventSourceFactory | undefined {
  const nativeFactory = getNativeSseEventSourceFactory();
  if (nativeFactory) {
    return nativeFactory;
  }

  const xhrFactory = getXmlHttpRequestEventSourceFactory();
  if (xhrFactory) {
    return xhrFactory;
  }

  const eventSource = (globalThis as {EventSource?: EventSourceGlobal})
    .EventSource;
  if (eventSource) {
    return (url, options) => new eventSource(url, options);
  }

  return undefined;
}

type KolamWindowsSseStreamBridge = {
  addListener?: (eventName: string) => void;
  close?: (
    streamId: string,
  ) => Promise<{closed?: boolean; streamId?: string} | void> | void;
  open?: (options: {
    headers?: Record<string, string>;
    url: string;
    withCredentials?: boolean;
  }) => Promise<{streamId?: string} | void> | {streamId?: string};
  removeListeners?: (count: number) => void;
};

function getNativeSseEventSourceFactory(): KolamEventSourceFactory | undefined {
  if (Platform.OS !== 'windows') {
    return undefined;
  }

  const bridge = (
    NativeModules as Record<string, KolamWindowsSseStreamBridge | undefined>
  ).KolamWindowsSseStream;
  if (typeof bridge?.open !== 'function' || typeof bridge.close !== 'function') {
    return undefined;
  }

  return (url, options) => createNativeSseEventSource(url, options, bridge);
}

function createNativeSseEventSource(
  url: string,
  options: Parameters<KolamEventSourceFactory>[1],
  bridge: KolamWindowsSseStreamBridge,
): KolamEventSourceLike {
  const listeners = new Map<string, Set<KolamEventSourceListener>>();
  let closed = false;
  let opened = false;
  let streamId: string | null = null;
  let pendingChunk = '';
  const subscriptions: Array<{remove: () => void}> = [];

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
      subscriptions.forEach(subscription => {
        try {
          subscription.remove();
        } catch {
          // Ignore emitter teardown races.
        }
      });
      subscriptions.length = 0;
      const id = streamId;
      streamId = null;
      if (id && typeof bridge.close === 'function') {
        Promise.resolve(bridge.close(id)).catch(() => undefined);
      }
    },
    onerror: null,
    onopen: null,
  };

  const emitParsed = (eventName: string, data: string, eventId?: string) => {
    listeners.get(eventName)?.forEach(listener => {
      listener({data, lastEventId: eventId});
    });
  };

  const ingestText = (text: string) => {
    if (closed || !text) {
      return;
    }

    pendingChunk = parseKolamSseText(
      `${pendingChunk}${text}`,
      emitParsed,
      () => source.onactivity?.(),
    );
  };

  try {
    const emitter = new NativeEventEmitter(
      bridge as ConstructorParameters<typeof NativeEventEmitter>[0],
    );

    subscriptions.push(
      emitter.addListener('SseOpened', payload => {
        if (closed) {
          return;
        }
        const id =
          payload && typeof payload === 'object'
            ? String((payload as {streamId?: unknown}).streamId ?? '')
            : '';
        if (!id || (streamId && id !== streamId)) {
          return;
        }
        if (!opened) {
          opened = true;
          source.onopen?.();
        }
        source.onactivity?.();
      }),
    );

    subscriptions.push(
      emitter.addListener('SseChunk', payload => {
        if (closed) {
          return;
        }
        const record =
          payload && typeof payload === 'object'
            ? (payload as {streamId?: unknown; text?: unknown})
            : null;
        const id = String(record?.streamId ?? '');
        if (!id || (streamId && id !== streamId)) {
          return;
        }
        if (typeof record?.text === 'string') {
          ingestText(record.text);
        }
      }),
    );

    subscriptions.push(
      emitter.addListener('SseError', payload => {
        if (closed) {
          return;
        }
        const id =
          payload && typeof payload === 'object'
            ? String((payload as {streamId?: unknown}).streamId ?? '')
            : '';
        if (!id || (streamId && id !== streamId)) {
          return;
        }
        source.onerror?.();
      }),
    );

    subscriptions.push(
      emitter.addListener('SseClosed', payload => {
        if (closed) {
          return;
        }
        const id =
          payload && typeof payload === 'object'
            ? String((payload as {streamId?: unknown}).streamId ?? '')
            : '';
        if (!id || (streamId && id !== streamId)) {
          return;
        }
        const activeId = streamId;
        streamId = null;
        if (activeId && typeof bridge.close === 'function') {
          Promise.resolve(bridge.close(activeId)).catch(() => undefined);
        }
        source.onerror?.();
      }),
    );
  } catch {
    // Fall through — open() below will still fail clearly if bridge is broken.
  }

  Promise.resolve(
    bridge.open?.({
      headers: options?.headers,
      url,
      withCredentials: options?.withCredentials === true,
    }),
  )
    .then(result => {
      if (closed) {
        const id =
          result && typeof result === 'object'
            ? String((result as {streamId?: unknown}).streamId ?? '')
            : '';
        if (id && typeof bridge.close === 'function') {
          Promise.resolve(bridge.close(id)).catch(() => undefined);
        }
        return;
      }

      const id =
        result && typeof result === 'object'
          ? String((result as {streamId?: unknown}).streamId ?? '')
          : '';
      if (!id) {
        source.onerror?.();
        return;
      }

      streamId = id;
    })
    .catch(() => {
      if (!closed) {
        source.onerror?.();
      }
    });

  return source;
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

/** RNW XHR often skips onprogress while SSE stays open — poll responseText. */
const KOLAM_CHAT_LIVE_XHR_POLL_MS = 400;

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
  let pollTimer: ReturnType<typeof setInterval> | null = null;

  const stopPoll = () => {
    if (!pollTimer) {
      return;
    }

    clearInterval(pollTimer);
    pollTimer = null;
  };

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
      stopPoll();
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
    if (closed) {
      return;
    }

    let responseText = '';
    try {
      responseText = xhr.responseText ?? '';
    } catch {
      return;
    }

    if (!responseText) {
      return;
    }

    const nextText = responseText.slice(processedLength);
    processedLength = responseText.length;
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
      () => source.onactivity?.(),
    );
  };

  const markError = () => {
    if (closed) {
      return;
    }

    stopPoll();
    source.onerror?.();
  };

  const markOpen = () => {
    if (closed || opened) {
      return;
    }

    opened = true;
    source.onopen?.();
    source.onactivity?.();
  };

  const startPoll = () => {
    if (closed || pollTimer) {
      return;
    }

    pollTimer = setInterval(() => {
      if (closed) {
        stopPoll();
        return;
      }

      if (
        xhr.readyState === xhr.HEADERS_RECEIVED ||
        xhr.readyState === xhr.LOADING
      ) {
        readAvailableText();
      }
    }, KOLAM_CHAT_LIVE_XHR_POLL_MS);
    (pollTimer as {unref?: () => void}).unref?.();
  };

  xhr.onreadystatechange = () => {
    if (xhr.readyState === xhr.HEADERS_RECEIVED) {
      const status = Number(xhr.status || 0);
      if (status > 0 && (status < 200 || status >= 300)) {
        markError();
        return;
      }

      markOpen();
      startPoll();
      readAvailableText();
      return;
    }

    if (xhr.readyState === xhr.LOADING) {
      markOpen();
      startPoll();
      readAvailableText();
      return;
    }

    if (xhr.readyState === xhr.DONE) {
      readAvailableText();
      stopPoll();
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
  startPoll();

  return source;
}

function parseKolamSseText(
  text: string,
  emit: (eventName: string, data: string, eventId?: string) => void,
  onActivity?: () => void,
) {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split('\n\n');
  const pending = blocks.pop() ?? '';

  blocks.forEach(block => {
    if (block.trim()) {
      // Includes comment heartbeats — keeps the XHR connection watchdog alive.
      onActivity?.();
    }
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

function getStoredKolamChatLiveLastEventId(mode: KolamChatLiveStreamKind) {
  const storageKey = getKolamChatLiveLastEventStorageKey(mode);
  try {
    const storage = (globalThis as {localStorage?: KolamBrowserStorageLike})
      .localStorage;
    const stored = storage?.getItem(storageKey);
    if (stored) {
      return stored;
    }
  } catch {
    // Fall back to process memory when RNW has no browser localStorage.
  }

  return lastEventIdMemory[mode] ?? '';
}

function rememberKolamChatLiveLastEventId(
  mode: KolamChatLiveStreamKind,
  eventId: string,
) {
  lastEventIdMemory[mode] = eventId;
  const storageKey = getKolamChatLiveLastEventStorageKey(mode);
  try {
    (globalThis as {localStorage?: KolamBrowserStorageLike}).localStorage?.setItem(
      storageKey,
      eventId,
    );
  } catch {
    // In-memory resume is enough for the current Windows process.
  }
}

function getKolamChatLiveLastEventStorageKey(mode: KolamChatLiveStreamKind) {
  return `kolam-sse:last-event-id:${mode === 'inbox' ? 'chat' : 'team-chat'}`;
}
