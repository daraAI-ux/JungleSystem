import {createKolamTeamChatCallMediaSession} from '../src/services/kolam-team-chat-call-media-session';
import type {KolamTeamChatCallMediaToken} from '../src/services/kolam-api';

describe('kolam team chat call media session', () => {
  const readyConfig = {
    enabled: true,
    media: {
      enabled: true,
      url: 'wss://lk.example',
      maxParticipants: 8,
      audioOnly: true,
    },
  };

  const joinedCall = {
    _id: 'call-1',
    participants: [{status: 'joined' as const, userId: 'me'}],
    status: 'active' as const,
  };

  it('does not request a token when the native bridge is missing', async () => {
    const requestMediaToken = jest.fn();
    const session = createKolamTeamChatCallMediaSession({
      nativeModules: {},
      platformOS: 'windows',
      requestMediaToken,
    });

    await session.startAfterJoin({
      call: joinedCall,
      config: readyConfig,
      userId: 'me',
    });

    expect(requestMediaToken).not.toHaveBeenCalled();
    expect(session.getActiveCallId()).toBeNull();
  });

  it('connects with media-token and applies mutedByAdmin', async () => {
    const connectRoom = jest.fn(async () => ({ok: true}));
    const setMicEnabled = jest.fn(async () => ({ok: true}));
    const disconnectRoom = jest.fn(async () => ({ok: true}));
    const token: KolamTeamChatCallMediaToken = {
      url: 'wss://lk.example',
      token: 'jwt',
      roomName: 'tc-call-call-1',
      identity: 'me',
      expiresAt: '2026-08-14T12:02:00.000Z',
    };
    const requestMediaToken = jest.fn(async () => token);

    const session = createKolamTeamChatCallMediaSession({
      nativeModules: {
        KolamWindowsLiveKitRoom: {
          connectRoom,
          disconnectRoom,
          setMicEnabled,
        },
      },
      platformOS: 'windows',
      requestMediaToken,
    });

    await session.startAfterJoin({
      call: {
        ...joinedCall,
        participants: [
          {status: 'joined', userId: 'me', mutedByAdmin: true},
        ],
      },
      config: readyConfig,
      userId: 'me',
    });

    expect(requestMediaToken).toHaveBeenCalledWith(
      expect.objectContaining({callId: 'call-1', userId: 'me'}),
    );
    expect(connectRoom).toHaveBeenCalledWith({
      identity: 'me',
      roomName: 'tc-call-call-1',
      token: 'jwt',
      url: 'wss://lk.example',
    });
    expect(setMicEnabled).toHaveBeenCalledWith(false);
    expect(session.getActiveCallId()).toBe('call-1');

    await session.onCallUpdated({
      call: {
        ...joinedCall,
        participants: [
          {status: 'joined', userId: 'me', mutedByAdmin: false},
        ],
      },
      userId: 'me',
    });
    expect(setMicEnabled).toHaveBeenCalledWith(true);

    await session.stop();
    expect(disconnectRoom).toHaveBeenCalled();
    expect(session.getActiveCallId()).toBeNull();
  });

  it('skips media-token when media.enabled is false', async () => {
    const connectRoom = jest.fn();
    const requestMediaToken = jest.fn();
    const session = createKolamTeamChatCallMediaSession({
      nativeModules: {
        KolamWindowsLiveKitRoom: {connectRoom},
      },
      platformOS: 'windows',
      requestMediaToken,
    });

    await session.startAfterJoin({
      call: joinedCall,
      config: {enabled: true, media: {enabled: false, url: 'wss://lk.example'}},
      userId: 'me',
    });

    expect(requestMediaToken).not.toHaveBeenCalled();
    expect(connectRoom).not.toHaveBeenCalled();
  });
});
