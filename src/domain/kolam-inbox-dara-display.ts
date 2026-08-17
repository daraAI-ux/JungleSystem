import type {KolamChatDaraMessageMeta, KolamChatMessage} from '../services/kolam-api';

/** FE MessageBubble: AI label is always Dara — BE often stores senderName "AI Assistant". */
export function isKolamInboxAiMessage(
  message: Partial<
    Pick<KolamChatMessage, 'senderType' | 'senderName' | 'daraMeta'>
  > & {daraMeta?: KolamChatDaraMessageMeta | null},
) {
  // BE `ai-chat` stores automated DARA outbound as senderType "system" + senderName "System"
  // (rating, handoff notices, etc.). FE stream treats those as balasan DARA.
  if (
    message.senderType === 'ai_agent' ||
    message.senderType === 'system' ||
    message.daraMeta
  ) {
    return true;
  }

  const senderName = String(message.senderName ?? '')
    .trim()
    .toLowerCase();
  return (
    senderName === 'dara' ||
    senderName.includes('dara') ||
    senderName === 'ai assistant' ||
    senderName === 'system' ||
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

/** Map BE labels like "System" / "AI Assistant" when only a name string is available. */
export function resolveKolamInboxSenderDisplayName(
  senderName?: string | null,
): string {
  const trimmed = String(senderName ?? '').trim();
  if (!trimmed) {
    return '';
  }
  if (isKolamInboxAiMessage({senderName: trimmed})) {
    return 'DARA';
  }
  return trimmed;
}
