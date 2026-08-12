import type {KolamChatDaraMessageMeta, KolamChatMessage} from '../services/kolam-api';

/** FE MessageBubble: AI label is always Dara — BE often stores senderName "AI Assistant". */
export function isKolamInboxAiMessage(
  message: Partial<
    Pick<KolamChatMessage, 'senderType' | 'senderName' | 'daraMeta'>
  > & {daraMeta?: KolamChatDaraMessageMeta | null},
) {
  if (message.senderType === 'ai_agent' || message.daraMeta) {
    return true;
  }

  const senderName = String(message.senderName ?? '')
    .trim()
    .toLowerCase();
  return (
    senderName === 'dara' ||
    senderName.includes('dara') ||
    senderName === 'ai assistant' ||
    senderName.includes('katak terbang')
  );
}

export function resolveKolamInboxMessageAuthor(
  message: Pick<
    KolamChatMessage,
    'direction' | 'senderType' | 'senderName' | 'daraMeta'
  >,
  buyerDisplayName?: string,
) {
  if (isKolamInboxAiMessage(message)) {
    return 'DARA';
  }

  if (message.direction === 'out') {
    return message.senderName || 'Anda';
  }

  return message.senderName || buyerDisplayName || 'Buyer';
}
