import {requestKolamTeamChatCallMediaTokenIfReady} from '../src/services/kolam-team-chat-call-media';
import {getKolamTeamChatCallMediaToken} from '../src/services/kolam-api';

jest.mock('../src/services/kolam-api', () => {
  const actual = jest.requireActual('../src/services/kolam-api');
  return {
    ...actual,
    getKolamTeamChatCallMediaToken: jest.fn(),
  };
});

const getMediaTokenMock = getKolamTeamChatCallMediaToken as jest.MockedFunction<
  typeof getKolamTeamChatCallMediaToken
>;

describe('requestKolamTeamChatCallMediaTokenIfReady', () => {
  beforeEach(() => {
    getMediaTokenMock.mockReset();
    getMediaTokenMock.mockResolvedValue({
      url: 'wss://lk.example',
      token: 'jwt',
      roomName: 'tc-call-c1',
      identity: 'me',
      expiresAt: '2026-08-14T12:02:00.000Z',
    });
  });

  it('does not hit the network when media is disabled', async () => {
    await expect(
      requestKolamTeamChatCallMediaTokenIfReady({
        callId: 'c1',
        config: {enabled: true, media: {enabled: false, url: 'wss://lk.example'}},
        userId: 'me',
      }),
    ).resolves.toBeNull();
    expect(getMediaTokenMock).not.toHaveBeenCalled();
  });

  it('does not hit the network when participant is not joined', async () => {
    await expect(
      requestKolamTeamChatCallMediaTokenIfReady({
        call: {
          _id: 'c1',
          participants: [{status: 'ringing', userId: 'me'}],
          status: 'ringing',
        },
        callId: 'c1',
        config: {
          enabled: true,
          media: {enabled: true, url: 'wss://lk.example'},
        },
        userId: 'me',
      }),
    ).resolves.toBeNull();
    expect(getMediaTokenMock).not.toHaveBeenCalled();
  });

  it('requests a token when media is ready and joined', async () => {
    await expect(
      requestKolamTeamChatCallMediaTokenIfReady({
        call: {
          _id: 'c1',
          participants: [{status: 'joined', userId: 'me'}],
          status: 'active',
        },
        callId: 'c1',
        config: {
          enabled: true,
          media: {enabled: true, url: 'wss://lk.example'},
        },
        userId: 'me',
      }),
    ).resolves.toMatchObject({token: 'jwt', roomName: 'tc-call-c1'});
    expect(getMediaTokenMock).toHaveBeenCalledWith('c1');
  });
});
