import {
  findKolamChatLiveEventContract,
  getKolamChatLiveEventContracts,
  KOLAM_CHAT_LIVE_STREAM_ROUTES,
} from '../src/domain/kolam-chat-live-contract';

describe('kolam chat live contract', () => {
  it('maps legacy chat stream routes without opening SSE connections', () => {
    expect(KOLAM_CHAT_LIVE_STREAM_ROUTES.inbox).toBe('/chat/stream');
    expect(KOLAM_CHAT_LIVE_STREAM_ROUTES['team-chat']).toBe(
      '/team-chat/stream',
    );
  });

  it('keeps inbox live events aligned with the legacy stream contract', () => {
    const inboxEvents = getKolamChatLiveEventContracts('inbox').map(
      event => event.eventName,
    );

    expect(inboxEvents).toEqual([
      'message.created',
      'message.updated',
      'conversation.updated',
      'conversation.ai_handoff',
      'conversation.assigned',
      'conversation.closed',
      'conversation.deleted',
      'rating.created',
      'typing.update',
      'dara.processing',
      'dara.processing.done',
      'sync.required',
    ]);
  });

  it('keeps team-chat live events aligned with the legacy stream contract', () => {
    const teamEvents = getKolamChatLiveEventContracts('team-chat').map(
      event => event.eventName,
    );

    expect(teamEvents).toEqual([
      'message.created',
      'message.updated',
      'message.reaction.updated',
      'room.updated',
      'room.created',
      'room.messages.purged',
      'presence.updated',
      'dara.processing',
      'dara.processing.done',
      'dara.thinking',
      'dara.thinking.chunk',
      'dara.thinking.done',
      'dara.seo.mode',
      'call.updated',
      'call.ended',
      'sync.required',
    ]);
  });

  it('documents sound intents for later headless notification playback', () => {
    expect(
      findKolamChatLiveEventContract('inbox', 'message.created')?.soundIntent,
    ).toBe('incoming-assigned-or-unassigned');
    expect(
      findKolamChatLiveEventContract('inbox', 'conversation.ai_handoff')
        ?.soundIntent,
    ).toBe('handoff');
    expect(
      findKolamChatLiveEventContract('team-chat', 'call.updated')?.soundIntent,
    ).toBe('group-call');
    expect(
      findKolamChatLiveEventContract('team-chat', 'presence.updated')
        ?.soundIntent,
    ).toBe('none');
  });

  it('returns undefined for unknown events', () => {
    expect(
      findKolamChatLiveEventContract('inbox', 'unknown.event'),
    ).toBeUndefined();
  });
});
