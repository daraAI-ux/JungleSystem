import {
  isKolamInboxAiMessage,
  resolveKolamInboxMessageAuthor,
} from '../src/domain/kolam-inbox-dara-display';

describe('kolam-inbox-dara-display', () => {
  it('shows DARA for outbound ai_agent even when BE senderName is AI Assistant', () => {
    expect(
      resolveKolamInboxMessageAuthor({
        direction: 'out',
        senderType: 'ai_agent',
        senderName: 'AI Assistant',
      }),
    ).toBe('DARA');
  });

  it('shows DARA for BE system outbound (rating / notices), not System', () => {
    expect(
      resolveKolamInboxMessageAuthor({
        direction: 'out',
        senderType: 'system',
        senderName: 'System',
      }),
    ).toBe('DARA');
    expect(
      isKolamInboxAiMessage({
        senderType: 'system',
        senderName: 'System',
      }),
    ).toBe(true);
  });

  it('keeps staff outbound senderName', () => {
    expect(
      resolveKolamInboxMessageAuthor({
        direction: 'out',
        senderType: 'staff',
        senderName: 'Budi',
      }),
    ).toBe('Budi');
  });

  it('detects AI Assistant senderName as inbox AI', () => {
    expect(
      isKolamInboxAiMessage({
        senderName: 'AI Assistant',
      }),
    ).toBe(true);
  });
});
