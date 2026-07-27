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
    const globalWithEventSource = globalThis as typeof globalThis & {
      EventSource?: unknown;
    };
    const originalEventSource = globalWithEventSource.EventSource;

    delete globalWithEventSource.EventSource;

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
    }

    expect(onStatusChange).toHaveBeenCalledWith('unsupported');
  });
});
