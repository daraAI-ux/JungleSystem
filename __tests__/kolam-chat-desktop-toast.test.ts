import {classifyKolamChatLiveEvent} from '../src/domain/kolam-chat-live-classifier';
import {findKolamChatLiveEventContract} from '../src/domain/kolam-chat-live-contract';
import {
  resolveKolamChatDesktopToast,
  resolveKolamChatDesktopToastFromInboxConversation,
  resolveKolamChatDesktopToastFromUnreadInbox,
  tryClaimKolamChatLiveAlert,
} from '../src/domain/kolam-chat-desktop-toast';
import {
  parseKolamWindowsToastActivation,
  parseKolamWindowsToastLaunch,
} from '../src/services/kolam-windows-toast-notification';

function contract(stream: 'inbox' | 'team-chat', eventName: string) {
  const result = findKolamChatLiveEventContract(stream, eventName);
  if (!result) {
    throw new Error(`Missing contract ${stream}:${eventName}`);
  }
  return result;
}

describe('kolam chat desktop toast', () => {
  it('builds an inbox toast from an inbound message like FE', () => {
    const classification = classifyKolamChatLiveEvent({
      contract: contract('inbox', 'message.created'),
      payload: {
        conversationId: 'conv-1',
        message: {
          direction: 'in',
          platform: 'tokopedia',
          senderName: 'Buyer A',
          senderType: 'buyer',
          content: {type: 'text', text: 'Halo stok masih ada?'},
        },
      },
    });

    expect(
      resolveKolamChatDesktopToast({
        classification,
        payload: {
          conversationId: 'conv-1',
          message: {
            direction: 'in',
            platform: 'tokopedia',
            senderName: 'Buyer A',
            senderType: 'buyer',
            content: {type: 'text', text: 'Halo stok masih ada?'},
          },
        },
      }),
    ).toEqual({
      body: 'Halo stok masih ada?',
      stream: 'inbox',
      tag: 'chat-conv-1',
      targetId: 'conv-1',
      title: 'Tokopedia · Buyer A',
    });
  });

  it('labels BE system / AI Assistant inbox senders as DARA in toast titles', () => {
    const classification = classifyKolamChatLiveEvent({
      contract: contract('inbox', 'message.created'),
      payload: {
        conversationId: 'conv-2',
        message: {
          direction: 'in',
          platform: 'whatsapp',
          senderName: 'System',
          senderType: 'system',
          content: {type: 'text', text: 'Mohon beri rating'},
        },
      },
    });

    expect(
      resolveKolamChatDesktopToast({
        classification,
        payload: {
          conversationId: 'conv-2',
          message: {
            direction: 'in',
            platform: 'whatsapp',
            senderName: 'System',
            senderType: 'system',
            content: {type: 'text', text: 'Mohon beri rating'},
          },
        },
      }),
    ).toEqual(
      expect.objectContaining({
        title: 'WhatsApp · DARA',
        body: 'Mohon beri rating',
      }),
    );
  });

  it('skips toast when classifier says none or the open thread matches', () => {
    const outbound = classifyKolamChatLiveEvent({
      contract: contract('inbox', 'message.created'),
      payload: {
        conversationId: 'conv-1',
        message: {direction: 'out', content: {type: 'text', text: 'Balasan'}},
      },
    });
    expect(
      resolveKolamChatDesktopToast({
        classification: outbound,
        payload: {
          conversationId: 'conv-1',
          message: {direction: 'out', content: {type: 'text', text: 'Balasan'}},
        },
      }),
    ).toBeNull();

    const viewing = classifyKolamChatLiveEvent(
      {
        contract: contract('inbox', 'message.created'),
        payload: {
          conversationId: 'conv-1',
          message: {
            direction: 'in',
            senderName: 'Buyer A',
            content: {type: 'text', text: 'Halo'},
          },
        },
      },
      {selectedItemId: 'conv-1'},
    );
    expect(
      resolveKolamChatDesktopToast({
        classification: viewing,
        payload: {
          conversationId: 'conv-1',
          message: {
            direction: 'in',
            senderName: 'Buyer A',
            content: {type: 'text', text: 'Halo'},
          },
        },
      }),
    ).toBeNull();
  });

  it('toasts inbox conversation.updated with preview so banner is not delayed', () => {
    const classification = classifyKolamChatLiveEvent({
      contract: contract('inbox', 'conversation.updated'),
      payload: {
        conversationId: 'conv-1',
        lastMessageDirection: 'in',
        lastMessagePreview: 'Halo stok masih ada?',
      },
    });

    expect(
      resolveKolamChatDesktopToast({
        classification,
        payload: {
          conversationId: 'conv-1',
          lastMessageDirection: 'in',
          lastMessagePreview: 'Halo stok masih ada?',
        },
      }),
    ).toEqual({
      body: 'Inbox',
      stream: 'inbox',
      tag: 'chat-conv-1',
      targetId: 'conv-1',
      title: 'Halo stok masih ada?',
    });
  });

  it('builds a handoff toast from FE copy', () => {
    const classification = classifyKolamChatLiveEvent({
      contract: contract('inbox', 'conversation.ai_handoff'),
      payload: {
        conversationId: 'conv-2',
        reason: 'payment_proof',
        buyerPreview: 'Ini bukti transfer',
      },
    });

    expect(
      resolveKolamChatDesktopToast({
        classification,
        payload: {
          conversationId: 'conv-2',
          reason: 'payment_proof',
          buyerPreview: 'Ini bukti transfer',
        },
      }),
    ).toEqual({
      body: 'Bukti pembayaran — Ini bukti transfer',
      stream: 'inbox',
      tag: 'handoff-conv-2',
      targetId: 'conv-2',
      title: 'Butuh handover',
    });
  });

  it('skips team toast for the current user own message', () => {
    const classification = classifyKolamChatLiveEvent({
      contract: contract('team-chat', 'message.created'),
      payload: {
        roomId: 'room-1',
        message: {
          sender: {_id: 'staff-1', first_name: 'A', last_name: 'B'},
          body: 'Halo tim',
        },
      },
    });

    expect(
      resolveKolamChatDesktopToast({
        classification,
        currentUserId: 'staff-1',
        payload: {
          roomId: 'room-1',
          message: {
            sender: {_id: 'staff-1', first_name: 'A', last_name: 'B'},
            body: 'Halo tim',
          },
        },
      }),
    ).toBeNull();

    expect(
      resolveKolamChatDesktopToast({
        classification,
        currentUserId: 'staff-2',
        payload: {
          roomId: 'room-1',
          message: {
            sender: {_id: 'staff-1', first_name: 'A', last_name: 'B'},
            body: 'Halo tim',
          },
        },
      }),
    ).toEqual({
      body: 'Halo tim',
      stream: 'team-chat',
      tag: 'team-room-1',
      targetId: 'room-1',
      title: 'A B',
    });
  });

  it('parses toast activation payload', () => {
    expect(
      parseKolamWindowsToastActivation({
        stream: 'inbox',
        targetId: 'conv-1',
      }),
    ).toEqual({stream: 'inbox', targetId: 'conv-1'});
    expect(parseKolamWindowsToastActivation({stream: 'inbox'})).toBeNull();
    expect(
      parseKolamWindowsToastLaunch(
        'junglesystem://chat/inbox/conv-1',
      ),
    ).toEqual({stream: 'inbox', targetId: 'conv-1'});
    expect(
      parseKolamWindowsToastLaunch(
        'kolam-chat|team-chat|room-1',
      ),
    ).toEqual({stream: 'team-chat', targetId: 'room-1'});
  });

  it('builds an inbox toast from an unread conversation list', () => {
    expect(
      resolveKolamChatDesktopToastFromUnreadInbox([
        {
          _id: 'conv-old',
          lastMessageAt: '2026-08-13T10:00:00.000Z',
          lastMessageDirection: 'in',
          lastMessagePreview: 'Lama',
          platform: 'shopee',
          unreadCount: 1,
          contactId: {displayName: 'Buyer Lama'},
        },
        {
          _id: 'conv-new',
          lastMessageAt: '2026-08-13T12:00:00.000Z',
          lastMessageDirection: 'in',
          lastMessagePreview: 'Halo stok masih ada?',
          platform: 'tokopedia',
          unreadCount: 2,
          contactId: {displayName: 'Buyer A'},
        },
      ]),
    ).toEqual({
      body: 'Halo stok masih ada?',
      stream: 'inbox',
      tag: 'chat-conv-new',
      targetId: 'conv-new',
      title: 'Tokopedia · Buyer A',
    });
  });

  it('builds an inbox toast from a hydrated conversation without unread', () => {
    expect(
      resolveKolamChatDesktopToastFromInboxConversation({
        _id: 'conv-3',
        lastMessageDirection: 'in',
        lastMessagePreview: 'Minta resi',
        platform: 'shopee',
        unreadCount: 0,
        contactId: {displayName: 'Buyer B'},
      }),
    ).toEqual({
      body: 'Minta resi',
      stream: 'inbox',
      tag: 'chat-conv-3',
      targetId: 'conv-3',
      title: 'Shopee · Buyer B',
    });
  });

  it('claims one live alert per conversation within the ttl', () => {
    const nowMs = 1_700_000_000_000;
    expect(
      tryClaimKolamChatLiveAlert({
        nowMs,
        stream: 'inbox',
        targetId: 'conv-claim-1',
      }),
    ).toBe(true);
    expect(
      tryClaimKolamChatLiveAlert({
        nowMs: nowMs + 400,
        stream: 'inbox',
        targetId: 'conv-claim-1',
      }),
    ).toBe(false);
    expect(
      tryClaimKolamChatLiveAlert({
        nowMs: nowMs + 400,
        stream: 'team-chat',
        targetId: 'conv-claim-1',
      }),
    ).toBe(true);
    expect(
      tryClaimKolamChatLiveAlert({
        nowMs: nowMs + 2_001,
        stream: 'inbox',
        targetId: 'conv-claim-1',
      }),
    ).toBe(true);
  });
});
