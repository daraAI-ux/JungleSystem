import {resolveKolamInboxMessageAuthor} from '../src/domain/kolam-inbox-dara-display';
import type {KolamChatMessage} from '../src/services/kolam-api';

describe('kolam-inbox-dara-display', () => {
  it('shows DARA for outbound ai_agent even when BE senderName is AI Assistant', () => {
    expect(
      resolveKolamInboxMessageAuthor({
        direction: 'out',
        senderType: 'ai_agent',
        senderName: 'AI Assistant',
      } as Pick<
        KolamChatMessage,
        'direction' | 'senderType' | 'senderName' | 'daraMeta'
      >),
    ).toBe('DARA');
  });

  it('keeps staff outbound senderName', () => {
    expect(
      resolveKolamInboxMessageAuthor({
        direction: 'out',
        senderType: 'staff',
        senderName: 'Budi',
      } as Pick<
        KolamChatMessage,
        'direction' | 'senderType' | 'senderName' | 'daraMeta'
      >),
    ).toBe('Budi');
  });
});
