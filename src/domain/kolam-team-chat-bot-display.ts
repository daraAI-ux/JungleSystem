/**
 * Team Chat bot display helpers — FE plugin chat `messageAuthor` + `TeamChatUserAvatar`.
 */

export const KOLAM_TEAM_CHAT_BOT_KEYS = {
  katakTerbang: 'katak_terbang',
  rajaAnemon: 'raja_anemon',
  pangeranIsopod: 'pangeran_isopod',
} as const;

/** FE `messageAuthor` when senderType is ai / bot. */
export function resolveKolamTeamChatBotDisplayName(input: {
  botKey?: string | null;
  botName?: string | null;
}): string {
  const botName = String(input.botName || '').trim();
  if (botName) {
    return botName;
  }

  const botKey = String(input.botKey || '')
    .trim()
    .toLowerCase();
  if (botKey === KOLAM_TEAM_CHAT_BOT_KEYS.rajaAnemon) {
    return 'Raja Anemon';
  }
  if (botKey === KOLAM_TEAM_CHAT_BOT_KEYS.pangeranIsopod) {
    return 'Pangeran Isopod';
  }
  if (botKey === KOLAM_TEAM_CHAT_BOT_KEYS.katakTerbang) {
    return 'Katak Terbang';
  }

  return 'DARA';
}

/**
 * FE plugin `TeamChatUserAvatar` raw bot photo:
 * message `botAvatarUrl` first, then websetting photo by botKey.
 */
export function resolveKolamTeamChatBotAvatarRawUrl(input: {
  botAvatarUrl?: string | null;
  botKey?: string | null;
  katakTerbangAvatarUrl?: string | null;
  rajaAnemonAvatarUrl?: string | null;
  pangeranIsopodAvatarUrl?: string | null;
}): string {
  const fromMessage = String(input.botAvatarUrl || '').trim();
  if (fromMessage) {
    return fromMessage;
  }

  const botKey = String(input.botKey || '')
    .trim()
    .toLowerCase();
  if (botKey === KOLAM_TEAM_CHAT_BOT_KEYS.katakTerbang) {
    return String(input.katakTerbangAvatarUrl || '').trim();
  }
  if (botKey === KOLAM_TEAM_CHAT_BOT_KEYS.rajaAnemon) {
    return String(input.rajaAnemonAvatarUrl || '').trim();
  }
  if (botKey === KOLAM_TEAM_CHAT_BOT_KEYS.pangeranIsopod) {
    return String(input.pangeranIsopodAvatarUrl || '').trim();
  }

  return '';
}
