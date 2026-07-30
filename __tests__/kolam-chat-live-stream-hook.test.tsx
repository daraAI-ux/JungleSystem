import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {
  buildKolamChatLiveStreamHeaders,
  buildKolamChatLiveStreamUrl,
  useKolamChatLiveStream,
  type KolamChatLiveEvent,
} from '../src/hooks/use-kolam-chat-live-stream';
import {setAccessToken} from '../src/lib/api-client';

type Listener = (event: {data?: string; lastEventId?: string}) => void;

class FakeEventSource {
  listeners: Record<string, Listener[]> = {};
  closed = false;
  onerror?: (() => void) | null;
  onopen?: (() => void) | null;

  addEventListener(eventName: string, listener: Listener) {
    this.listeners[eventName] ??= [];
    this.listeners[eventName].push(listener);
  }

  close() {
    this.closed = true;
  }

  emit(eventName: string, payload: unknown, eventId?: string) {
    this.listeners[eventName]?.forEach(listener => {
      listener({
        data: JSON.stringify(payload),
        lastEventId: eventId,
      });
    });
  }
}

class FakeStreamingXmlHttpRequest {
  static DONE = 4;
  static HEADERS_RECEIVED = 2;
  static LOADING = 3;
  static OPENED = 1;
  static UNSENT = 0;
  static instances: FakeStreamingXmlHttpRequest[] = [];

  DONE = 4;
  HEADERS_RECEIVED = 2;
  LOADING = 3;
  aborted = false;
  async?: boolean;
  headers: Record<string, string> = {};
  method?: string;
  onerror?: (() => void) | null;
  onprogress?: (() => void) | null;
  onreadystatechange?: (() => void) | null;
  ontimeout?: (() => void) | null;
  readyState = 0;
  responseText = '';
  sent = false;
  status = 200;
  url?: string;
  withCredentials?: boolean;

  constructor() {
    FakeStreamingXmlHttpRequest.instances.push(this);
  }

  abort() {
    this.aborted = true;
  }

  open(method: string, url: string, async?: boolean) {
    this.method = method;
    this.url = url;
    this.async = async;
  }

  send() {
    this.sent = true;
  }

  setRequestHeader(header: string, value: string) {
    this.headers[header] = value;
  }

  emitChunk(chunk: string) {
    this.responseText += chunk;
    this.readyState = this.LOADING;
    this.onprogress?.();
    this.onreadystatechange?.();
  }

  finish() {
    this.readyState = this.DONE;
    this.onreadystatechange?.();
  }
}

function LiveStreamProbe({
  enabled,
  eventSourceFactory,
  onEvent,
  onStatusChange,
}: {
  enabled?: boolean;
  eventSourceFactory?: Parameters<typeof useKolamChatLiveStream>[0]['eventSourceFactory'];
  onEvent: (event: KolamChatLiveEvent) => void;
  onStatusChange?: Parameters<typeof useKolamChatLiveStream>[0]['onStatusChange'];
}) {
  useKolamChatLiveStream({
    enabled,
    eventSourceFactory,
    mode: 'inbox',
    onEvent,
    onStatusChange,
  });

  return null;
}

describe('useKolamChatLiveStream', () => {
  afterEach(() => {
    setAccessToken(undefined);
  });

  it('builds Kolam live stream URL and bearer headers', () => {
    setAccessToken('token-123');

    expect(buildKolamChatLiveStreamUrl('inbox')).toBe(
      'https://amfibi.dunia-anura.com/api/chat/stream',
    );
    expect(buildKolamChatLiveStreamUrl('team-chat')).toBe(
      'https://amfibi.dunia-anura.com/api/team-chat/stream',
    );
    expect(buildKolamChatLiveStreamHeaders()).toEqual(
      expect.objectContaining({
        Authorization: 'Bearer token-123',
        'x-source': 'Kolam',
      }),
    );
  });

  it('subscribes to contract events, parses payloads, dedupes ids, and closes on unmount', async () => {
    const events: KolamChatLiveEvent[] = [];
    const createdSources: FakeEventSource[] = [];
    const factory = jest.fn((url: string) => {
      expect(url).toBe('https://amfibi.dunia-anura.com/api/chat/stream');
      const source = new FakeEventSource();
      createdSources.push(source);
      return source;
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <LiveStreamProbe
          eventSourceFactory={factory}
          onEvent={event => events.push(event)}
        />,
      );
    });

    createdSources[0].emit(
      'message.created',
      {conversationId: 'conv-1'},
      'event-1',
    );
    createdSources[0].emit(
      'message.created',
      {conversationId: 'conv-1'},
      'event-1',
    );

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual(
      expect.objectContaining({
        eventId: 'event-1',
        payload: {conversationId: 'conv-1'},
      }),
    );
    expect(events[0].contract.eventName).toBe('message.created');

    await ReactTestRenderer.act(async () => {
      renderer!.unmount();
    });

    expect(createdSources[0].closed).toBe(true);
  });

  it('falls back to XMLHttpRequest streaming when EventSource is unavailable', async () => {
    const events: KolamChatLiveEvent[] = [];
    const globalWithStreams = globalThis as Record<string, unknown>;
    const originalEventSource = globalWithStreams.EventSource;
    const originalXmlHttpRequest = globalWithStreams.XMLHttpRequest;
    FakeStreamingXmlHttpRequest.instances = [];
    setAccessToken('token-xhr');

    delete globalWithStreams.EventSource;
    globalWithStreams.XMLHttpRequest = FakeStreamingXmlHttpRequest;

    try {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <LiveStreamProbe onEvent={event => events.push(event)} />,
        );
      });

      const xhr = FakeStreamingXmlHttpRequest.instances[0];
      expect(xhr.url).toBe('https://amfibi.dunia-anura.com/api/chat/stream');
      expect(xhr.headers).toEqual(
        expect.objectContaining({
          Authorization: 'Bearer token-xhr',
          'x-source': 'Kolam',
        }),
      );

      xhr.emitChunk('id: event-2\n');
      xhr.emitChunk(
        'event: message.updated\ndata: {"messageId":"msg-1","deliveryStatus":"delivered"}\n\n',
      );

      expect(events).toHaveLength(1);
      expect(events[0]).toEqual(
        expect.objectContaining({
          eventId: 'event-2',
          payload: {messageId: 'msg-1', deliveryStatus: 'delivered'},
        }),
      );
      expect(events[0].contract.eventName).toBe('message.updated');

      await ReactTestRenderer.act(async () => {
        renderer!.unmount();
      });

      expect(xhr.aborted).toBe(true);
    } finally {
      globalWithStreams.EventSource = originalEventSource;
      globalWithStreams.XMLHttpRequest = originalXmlHttpRequest;
    }
  });

  it('prefers XMLHttpRequest streaming over global EventSource so auth headers are preserved', async () => {
    const events: KolamChatLiveEvent[] = [];
    const globalWithStreams = globalThis as Record<string, unknown>;
    const originalEventSource = globalWithStreams.EventSource;
    const originalXmlHttpRequest = globalWithStreams.XMLHttpRequest;
    const eventSourceFactory = jest.fn(() => new FakeEventSource());
    FakeStreamingXmlHttpRequest.instances = [];
    setAccessToken('token-xhr-first');

    globalWithStreams.EventSource = eventSourceFactory;
    globalWithStreams.XMLHttpRequest = FakeStreamingXmlHttpRequest;

    try {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <LiveStreamProbe onEvent={event => events.push(event)} />,
        );
      });

      expect(eventSourceFactory).not.toHaveBeenCalled();
      const xhr = FakeStreamingXmlHttpRequest.instances[0];
      expect(xhr.headers).toEqual(
        expect.objectContaining({
          Authorization: 'Bearer token-xhr-first',
          'x-source': 'Kolam',
        }),
      );

      xhr.emitChunk(
        'event: message.created\ndata: {"conversationId":"conv-1"}\n\n',
      );
      expect(events[0].contract.eventName).toBe('message.created');

      await ReactTestRenderer.act(async () => {
        renderer!.unmount();
      });
    } finally {
      globalWithStreams.EventSource = originalEventSource;
      globalWithStreams.XMLHttpRequest = originalXmlHttpRequest;
    }
  });

  it('reconnects after a stream error', async () => {
    jest.useFakeTimers();
    const createdSources: FakeEventSource[] = [];
    const factory = jest.fn(() => {
      const source = new FakeEventSource();
      createdSources.push(source);
      return source;
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <LiveStreamProbe
          eventSourceFactory={factory}
          onEvent={jest.fn()}
        />,
      );
    });

    expect(createdSources).toHaveLength(1);

    await ReactTestRenderer.act(async () => {
      createdSources[0].onerror?.();
      jest.advanceTimersByTime(2000);
    });

    expect(createdSources[0].closed).toBe(true);
    expect(createdSources).toHaveLength(2);

    await ReactTestRenderer.act(async () => {
      renderer!.unmount();
    });

    jest.useRealTimers();
  });

  it('reports idle when disabled and does not create an EventSource', async () => {
    const onStatusChange = jest.fn();
    const factory = jest.fn();

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <LiveStreamProbe
          enabled={false}
          eventSourceFactory={factory}
          onEvent={jest.fn()}
          onStatusChange={onStatusChange}
        />,
      );
    });

    expect(factory).not.toHaveBeenCalled();
    expect(onStatusChange).toHaveBeenCalledWith('idle');
  });

  it('reports unsupported when no EventSource runtime is available', async () => {
    const onStatusChange = jest.fn();
    const globalWithEventSource = globalThis as Record<string, unknown>;
    const originalEventSource = globalWithEventSource.EventSource;
    const originalXmlHttpRequest = globalWithEventSource.XMLHttpRequest;

    delete globalWithEventSource.EventSource;
    delete globalWithEventSource.XMLHttpRequest;

    try {
      await ReactTestRenderer.act(async () => {
        ReactTestRenderer.create(
          <LiveStreamProbe
            onEvent={jest.fn()}
            onStatusChange={onStatusChange}
          />,
        );
      });
    } finally {
      globalWithEventSource.EventSource = originalEventSource;
      globalWithEventSource.XMLHttpRequest = originalXmlHttpRequest;
    }

    expect(onStatusChange).toHaveBeenCalledWith('unsupported');
  });
});
