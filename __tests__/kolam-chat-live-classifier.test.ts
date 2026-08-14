import {classifyKolamChatLiveEvent} from '../src/domain/kolam-chat-live-classifier';
import {findKolamChatLiveEventContract} from '../src/domain/kolam-chat-live-contract';

function contract(stream: 'inbox' | 'team-chat', eventName: string) {
  const result = findKolamChatLiveEventContract(stream, eventName);
  if (!result) {
    throw new Error(`Missing contract ${stream}:${eventName}`);
  }
  return result;
}

describe('kolam chat live classifier', () => {
  it('classifies inbound assigned inbox messages for the current staff', () => {
    const classification = classifyKolamChatLiveEvent(
      {
        contract: contract('inbox', 'message.created'),
        eventId: 'evt-1',
        payload: {
          assignedStaffId: 'staff-1',
          conversationId: 'conv-1',
          message: {direction: 'in'},
        },
      },
      {currentUserId: 'staff-1'},
    );

    expect(classification).toEqual(
      expect.objectContaining({
        eventId: 'evt-1',
        eventName: 'message.created',
        refreshDetail: false,
        refreshList: true,
        soundIntent: 'assigned',
        stream: 'inbox',
        targetId: 'conv-1',
      }),
    );
  });

  it('classifies inbound unassigned inbox messages separately', () => {
    const classification = classifyKolamChatLiveEvent({
      contract: contract('inbox', 'message.created'),
      payload: {
        conversationId: 'conv-1',
        message: {direction: 'in'},
      },
    });

    expect(classification.soundIntent).toBe('unassigned');
  });

  it('suppresses inbox sound for outbound messages or messages already open', () => {
    expect(
      classifyKolamChatLiveEvent({
        contract: contract('inbox', 'message.created'),
        payload: {
          conversationId: 'conv-1',
          message: {direction: 'out'},
        },
      }).soundIntent,
    ).toBe('none');

    expect(
      classifyKolamChatLiveEvent(
        {
          contract: contract('inbox', 'message.created'),
          payload: {
            conversationId: 'conv-1',
            message: {direction: 'in'},
          },
        },
        {selectedItemId: 'conv-1'},
      ).soundIntent,
    ).toBe('none');
  });

  it('skips detail refetch for open-thread inbox message.created (upsert-only)', () => {
    const classification = classifyKolamChatLiveEvent(
      {
        contract: contract('inbox', 'message.created'),
        payload: {
          conversationId: 'conv-1',
          message: {direction: 'in'},
        },
      },
      {selectedItemId: 'conv-1'},
    );

    expect(classification).toEqual(
      expect.objectContaining({
        isForSelectedDetail: true,
        refreshDetail: false,
        refreshList: true,
        targetId: 'conv-1',
      }),
    );
  });

  it('does not refetch messages for inbox typing.update', () => {
    const classification = classifyKolamChatLiveEvent(
      {
        contract: contract('inbox', 'typing.update'),
        payload: {conversationId: 'conv-1'},
      },
      {selectedItemId: 'conv-1'},
    );

    expect(classification.refreshDetail).toBe(false);
    expect(classification.refreshList).toBe(false);
  });

  it('matches assigned staff ids as strings even when payload uses object ids', () => {
    const classification = classifyKolamChatLiveEvent(
      {
        contract: contract('inbox', 'message.created'),
        payload: {
          assignedStaffId: {_id: 'staff-1'},
          conversationId: 'conv-1',
          message: {direction: 'IN'},
        },
      },
      {currentUserId: 'staff-1'},
    );

    expect(classification.soundIntent).toBe('assigned');
  });

  it('dings inbox conversation.updated for inbound last message as backup', () => {
    expect(
      classifyKolamChatLiveEvent({
        contract: contract('inbox', 'conversation.updated'),
        payload: {
          conversationId: 'conv-1',
          lastMessageDirection: 'in',
        },
      }).soundIntent,
    ).toBe('unassigned');

    expect(
      classifyKolamChatLiveEvent({
        contract: contract('inbox', 'conversation.updated'),
        payload: {
          conversationId: 'conv-1',
          lastMessageDirection: 'out',
        },
      }).soundIntent,
    ).toBe('none');
  });

  it('skips detail refetch for open-thread team message.created (upsert-only)', () => {
    const classification = classifyKolamChatLiveEvent(
      {
        contract: contract('team-chat', 'message.created'),
        payload: {roomId: 'room-1', message: {_id: 'msg-1'}},
      },
      {selectedItemId: 'room-1'},
    );

    expect(classification).toEqual(
      expect.objectContaining({
        isForSelectedDetail: true,
        refreshDetail: false,
        refreshList: true,
        targetId: 'room-1',
      }),
    );
  });

  it('matches active team room detail by room id', () => {
    const classification = classifyKolamChatLiveEvent(
      {
        contract: contract('team-chat', 'message.created'),
        payload: {
          roomId: 'room-1',
          message: {
            sender: {_id: 'staff-2'},
            body: 'Halo',
          },
        },
      },
      {currentUserId: 'staff-1', selectedItemId: 'room-1'},
    );

    expect(classification).toEqual(
      expect.objectContaining({
        refreshDetail: false,
        refreshList: true,
        soundIntent: 'none',
        targetId: 'room-1',
      }),
    );
  });

  it('dings team chat for other rooms and mutes own messages', () => {
    expect(
      classifyKolamChatLiveEvent(
        {
          contract: contract('team-chat', 'message.created'),
          payload: {
            roomId: 'room-b',
            message: {
              sender: {_id: 'staff-2', first_name: 'Maya'},
              body: 'Update stok',
            },
          },
        },
        {currentUserId: 'staff-1', selectedItemId: 'room-a'},
      ).soundIntent,
    ).toBe('assigned');

    expect(
      classifyKolamChatLiveEvent(
        {
          contract: contract('team-chat', 'message.created'),
          payload: {
            roomId: 'room-b',
            message: {
              sender: {_id: 'staff-1', first_name: 'Me'},
              body: 'Saya kirim',
            },
          },
        },
        {currentUserId: 'staff-1', selectedItemId: 'room-a'},
      ).soundIntent,
    ).toBe('none');

    expect(
      classifyKolamChatLiveEvent(
        {
          contract: contract('team-chat', 'message.created'),
          payload: {
            roomId: 'room-b',
            message: {
              sender: {_id: 'staff-2'},
              body: 'Ping',
            },
          },
        },
        {currentUserId: 'staff-1'},
      ).soundIntent,
    ).toBe('assigned');
  });

  it('resolves team chat room id from nested payload or message.room', () => {
    expect(
      classifyKolamChatLiveEvent({
        contract: contract('team-chat', 'message.created'),
        payload: {
          data: {roomId: 'room-nested', message: {_id: 'msg-1'}},
        },
      }).targetId,
    ).toBe('room-nested');

    expect(
      classifyKolamChatLiveEvent({
        contract: contract('team-chat', 'message.created'),
        payload: {
          message: {_id: 'msg-1', room: 'room-from-message'},
        },
      }).targetId,
    ).toBe('room-from-message');
  });

  it('refreshes selected detail for sync.required without a target id', () => {
    const classification = classifyKolamChatLiveEvent(
      {
        contract: contract('team-chat', 'sync.required'),
        payload: {},
      },
      {selectedItemId: 'room-1'},
    );

    expect(classification.refreshDetail).toBe(true);
    expect(classification.refreshList).toBe(true);
    expect(classification.soundIntent).toBe('none');
  });

  it('does not ding call.updated for hosts or non-invitees (gate owns ringtone)', () => {
    expect(
      classifyKolamChatLiveEvent(
        {
          contract: contract('team-chat', 'call.updated'),
          payload: {
            call: {
              _id: 'call-1',
              participants: [{status: 'joined', userId: 'host-1'}],
              startedBy: 'host-1',
              status: 'ringing',
            },
            roomId: 'room-1',
          },
        },
        {currentUserId: 'host-1'},
      ).soundIntent,
    ).toBe('none');

    expect(
      classifyKolamChatLiveEvent(
        {
          contract: contract('team-chat', 'call.updated'),
          payload: {
            call: {
              _id: 'call-1',
              participants: [{status: 'ringing', userId: 'invitee-1'}],
              startedBy: 'host-1',
              status: 'ringing',
            },
            roomId: 'room-1',
          },
        },
        {currentUserId: 'invitee-1'},
      ).soundIntent,
    ).toBe('none');
  });
});
