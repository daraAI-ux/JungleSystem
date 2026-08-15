import {formatKolamTeamChatCallMediaStatusLabel} from '../src/domain/kolam-team-chat-call';
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

  function mockLiveKitRoom(
    methods: Record<string, unknown>,
  ): Record<string, unknown> {
    return {
      addListener: jest.fn(),
      removeListeners: jest.fn(),
      ...methods,
    };
  }

  it('formats short media status labels for the call strip', () => {
    expect(formatKolamTeamChatCallMediaStatusLabel({status: 'idle', callId: null})).toBeNull();
    expect(
      formatKolamTeamChatCallMediaStatusLabel({
        status: 'connecting',
        callId: 'call-1',
      }),
    ).toBe('Menghubungkan');
    expect(
      formatKolamTeamChatCallMediaStatusLabel({
        status: 'connected',
        callId: 'call-1',
      }),
    ).toBe('Terhubung');
    expect(
      formatKolamTeamChatCallMediaStatusLabel({
        status: 'failed',
        callId: 'call-1',
        reason: 'Media native tidak tersedia',
      }),
    ).toBe('Media native tidak tersedia');
  });

  it('fails visibly when the native bridge is missing', async () => {
    const requestMediaToken = jest.fn();
    const session = createKolamTeamChatCallMediaSession({
      nativeModules: {},
      platformOS: 'windows',
      requestMediaToken,
    });

    const state = await session.startAfterJoin({
      call: joinedCall,
      config: readyConfig,
      userId: 'me',
    });

    expect(requestMediaToken).not.toHaveBeenCalled();
    expect(session.getActiveCallId()).toBeNull();
    expect(state).toEqual({
      callId: 'call-1',
      reason: 'Media native tidak tersedia',
      status: 'failed',
    });
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
    const onStatus = jest.fn();

    const session = createKolamTeamChatCallMediaSession({
      nativeModules: {
        KolamWindowsLiveKitRoom: mockLiveKitRoom({
          connectRoom,
          disconnectRoom,
          setMicEnabled,
        }),
      },
      platformOS: 'windows',
      requestMediaToken,
    });
    const unsubscribe = session.subscribe(onStatus);

    const state = await session.startAfterJoin({
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
    expect(state.status).toBe('connected');
    expect(onStatus).toHaveBeenCalledWith(
      expect.objectContaining({status: 'connecting', callId: 'call-1'}),
    );
    expect(onStatus).toHaveBeenCalledWith(
      expect.objectContaining({status: 'connected', callId: 'call-1'}),
    );

    await session.onCallUpdated({
      call: {
        ...joinedCall,
        participants: [
          {status: 'joined', userId: 'me', mutedByAdmin: false},
        ],
      },
      config: readyConfig,
      userId: 'me',
    });
    expect(setMicEnabled).toHaveBeenCalledWith(true);

    await session.stop();
    expect(disconnectRoom).toHaveBeenCalled();
    expect(session.getActiveCallId()).toBeNull();
    expect(session.getConnectionState().status).toBe('idle');
    unsubscribe();
  });

  it('surfaces connect failures instead of staying silent', async () => {
    const connectRoom = jest.fn(async () => ({
      ok: false,
      reason: 'livekit_unavailable',
    }));
    const requestMediaToken = jest.fn(async () => ({
      url: 'wss://lk.example',
      token: 'jwt',
      roomName: 'tc-call-call-1',
      identity: 'me',
      expiresAt: '2026-08-14T12:02:00.000Z',
    }));

    const session = createKolamTeamChatCallMediaSession({
      nativeModules: {
        KolamWindowsLiveKitRoom: mockLiveKitRoom({connectRoom}),
      },
      platformOS: 'windows',
      requestMediaToken,
    });

    await expect(
      session.startAfterJoin({
        call: joinedCall,
        config: readyConfig,
        userId: 'me',
      }),
    ).resolves.toEqual({
      callId: 'call-1',
      reason: 'livekit_unavailable',
      status: 'failed',
    });
  });

  it('reconnects media when already joined but session is idle', async () => {
    const connectRoom = jest.fn(async () => ({ok: true}));
    const setMicEnabled = jest.fn(async () => ({ok: true}));
    const requestMediaToken = jest.fn(async () => ({
      url: 'wss://lk.example',
      token: 'jwt',
      roomName: 'tc-call-call-1',
      identity: 'me',
      expiresAt: '2026-08-14T12:02:00.000Z',
    }));

    const session = createKolamTeamChatCallMediaSession({
      nativeModules: {
        KolamWindowsLiveKitRoom: mockLiveKitRoom({
          connectRoom,
          setMicEnabled,
          disconnectRoom: async () => ({ok: true}),
        }),
      },
      platformOS: 'windows',
      requestMediaToken,
    });

    await session.onCallUpdated({
      call: joinedCall,
      config: readyConfig,
      userId: 'me',
    });

    expect(connectRoom).toHaveBeenCalledTimes(1);
    expect(session.getConnectionState().status).toBe('connected');

    await session.onCallUpdated({
      call: joinedCall,
      config: readyConfig,
      userId: 'me',
    });
    expect(connectRoom).toHaveBeenCalledTimes(1);
    expect(setMicEnabled).toHaveBeenCalled();
  });

  it('skips media-token when media.enabled is false', async () => {
    const connectRoom = jest.fn();
    const requestMediaToken = jest.fn();
    const session = createKolamTeamChatCallMediaSession({
      nativeModules: {
        KolamWindowsLiveKitRoom: mockLiveKitRoom({connectRoom}),
      },
      platformOS: 'windows',
      requestMediaToken,
    });

    const state = await session.startAfterJoin({
      call: joinedCall,
      config: {enabled: true, media: {enabled: false, url: 'wss://lk.example'}},
      userId: 'me',
    });

    expect(requestMediaToken).not.toHaveBeenCalled();
    expect(connectRoom).not.toHaveBeenCalled();
    expect(state).toEqual({
      callId: 'call-1',
      reason: 'Media call belum dikonfigurasi',
      status: 'failed',
    });
  });
});
