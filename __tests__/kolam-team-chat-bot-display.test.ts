import {
  KOLAM_TEAM_CHAT_BOT_KEYS,
  resolveKolamTeamChatBotAvatarRawUrl,
  resolveKolamTeamChatBotDisplayName,
} from '../src/domain/kolam-team-chat-bot-display';

describe('kolam-team-chat-bot-display', () => {
  it('prefers message botAvatarUrl for Raja Anemon', () => {
    expect(
      resolveKolamTeamChatBotAvatarRawUrl({
        botKey: KOLAM_TEAM_CHAT_BOT_KEYS.rajaAnemon,
        botAvatarUrl: '/media/raja-anemon/photo.png',
        rajaAnemonAvatarUrl: '/media/raja-anemon/from-settings.png',
      }),
    ).toBe('/media/raja-anemon/photo.png');
  });

  it('falls back to rajaAnemon websetting photo when message has no botAvatarUrl', () => {
    expect(
      resolveKolamTeamChatBotAvatarRawUrl({
        botKey: 'raja_anemon',
        botAvatarUrl: '',
        rajaAnemonAvatarUrl: '/media/raja-anemon/from-settings.png',
        katakTerbangAvatarUrl: '/media/katak-terbang/wrong.png',
      }),
    ).toBe('/media/raja-anemon/from-settings.png');
  });

  it('does not use DARA/katak photo for raja_anemon without its own photo', () => {
    expect(
      resolveKolamTeamChatBotAvatarRawUrl({
        botKey: KOLAM_TEAM_CHAT_BOT_KEYS.rajaAnemon,
        katakTerbangAvatarUrl: '/media/katak-terbang/x.png',
      }),
    ).toBe('');
  });

  it('resolves display name from botKey when botName missing', () => {
    expect(
      resolveKolamTeamChatBotDisplayName({botKey: 'raja_anemon'}),
    ).toBe('Raja Anemon');
    expect(
      resolveKolamTeamChatBotDisplayName({
        botKey: 'raja_anemon',
        botName: 'PIC Procurement',
      }),
    ).toBe('PIC Procurement');
  });
});
