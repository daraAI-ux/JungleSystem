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

  it('matches active team room detail by room id', () => {
    const classification = classifyKolamChatLiveEvent(
      {
        contract: contract('team-chat', 'message.created'),
        payload: {roomId: 'room-1'},
      },
      {selectedItemId: 'room-1'},
    );

    expect(classification).toEqual(
      expect.objectContaining({
        refreshDetail: true,
        refreshList: true,
        soundIntent: 'assigned',
        targetId: 'room-1',
      }),
    );
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
});
