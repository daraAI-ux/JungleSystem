import {
  canRequestKolamTeamChatCallMediaToken,
  getKolamTeamChatCallMyParticipant,
  getKolamTeamChatCallMyParticipantStatus,
  isKolamTeamChatCallMediaReady,
  isKolamTeamChatCallParticipantMuted,
  type KolamTeamChatCallMediaConnectionState,
} from '../domain/kolam-team-chat-call';
import type {
  KolamTeamChatCall,
  KolamTeamChatCallConfig,
} from './kolam-api';
import {
  getKolamLiveKitNativeBridge,
  type KolamLiveKitNativeBridgeOptions,
} from './kolam-livekit-native-bridge';
import {requestKolamTeamChatCallMediaTokenIfReady} from './kolam-team-chat-call-media';

export type KolamTeamChatCallMediaSessionOptions =
  KolamLiveKitNativeBridgeOptions & {
    requestMediaToken?: typeof requestKolamTeamChatCallMediaTokenIfReady;
  };

export type {
  KolamTeamChatCallMediaConnectionState,
  KolamTeamChatCallMediaConnectionStatus,
} from '../domain/kolam-team-chat-call';

type MediaConnectionListener = (
  state: KolamTeamChatCallMediaConnectionState,
) => void;

const IDLE_CONNECTION: KolamTeamChatCallMediaConnectionState = {
  callId: null,
  status: 'idle',
};

/**
 * JS session for LiveKit voice after signaling join.
 * Native C++ room does the actual WebRTC when the bridge is linked.
 */
export function createKolamTeamChatCallMediaSession(
  options: KolamTeamChatCallMediaSessionOptions = {},
) {
  let activeCallId: string | null = null;
  let starting = false;
  let connectionState: KolamTeamChatCallMediaConnectionState = IDLE_CONNECTION;
  const listeners = new Set<MediaConnectionListener>();

  const requestMediaToken =
    options.requestMediaToken ?? requestKolamTeamChatCallMediaTokenIfReady;

  function emitConnectionState(
    next: KolamTeamChatCallMediaConnectionState,
  ): KolamTeamChatCallMediaConnectionState {
    connectionState = next;
    listeners.forEach(listener => {
      listener(connectionState);
    });
    return connectionState;
  }

  function getConnectionState(): KolamTeamChatCallMediaConnectionState {
    return connectionState;
  }

  function subscribe(listener: MediaConnectionListener): () => void {
    listeners.add(listener);
    listener(connectionState);
    return () => {
      listeners.delete(listener);
    };
  }

  async function syncMicFromCall(
    call: KolamTeamChatCall | null | undefined,
    userId?: string | null,
  ): Promise<void> {
    const bridge = getKolamLiveKitNativeBridge(options);
    if (!bridge?.setMicEnabled || !activeCallId) {
      return;
    }

    const me = getKolamTeamChatCallMyParticipant(call, userId);
    const mutedByAdmin = isKolamTeamChatCallParticipantMuted(me);
    await bridge.setMicEnabled(!mutedByAdmin);
  }

  async function stop(): Promise<void> {
    activeCallId = null;
    emitConnectionState(IDLE_CONNECTION);
    const bridge = getKolamLiveKitNativeBridge(options);
    if (!bridge?.disconnectRoom) {
      return;
    }
    try {
      await bridge.disconnectRoom();
    } catch {
      // Best-effort teardown.
    }
  }

  async function startAfterJoin({
    call,
    config,
    userId,
  }: {
    call: KolamTeamChatCall | null | undefined;
    config: KolamTeamChatCallConfig | null | undefined;
    userId?: string | null;
  }): Promise<KolamTeamChatCallMediaConnectionState> {
    if (!call?._id || starting) {
      return connectionState;
    }

    if (activeCallId === call._id && connectionState.status === 'connected') {
      return connectionState;
    }

    const myStatus = getKolamTeamChatCallMyParticipantStatus(call, userId);
    if (myStatus !== 'joined') {
      return connectionState;
    }

    if (!isKolamTeamChatCallMediaReady(config)) {
      return emitConnectionState({
        callId: call._id,
        reason: 'Media call belum dikonfigurasi',
        status: 'failed',
      });
    }

    if (
      !canRequestKolamTeamChatCallMediaToken({
        call,
        config,
        userId,
      })
    ) {
      return connectionState;
    }

    const bridge = getKolamLiveKitNativeBridge(options);
    if (!bridge?.connectRoom) {
      return emitConnectionState({
        callId: call._id,
        reason: 'Media native tidak tersedia',
        status: 'failed',
      });
    }

    starting = true;
    emitConnectionState({
      callId: call._id,
      status: 'connecting',
    });

    try {
      const mediaToken = await requestMediaToken({
        call,
        callId: call._id,
        config,
        userId,
      });
      if (!mediaToken?.token || !mediaToken.url) {
        activeCallId = null;
        return emitConnectionState({
          callId: call._id,
          reason: 'Token media gagal',
          status: 'failed',
        });
      }

      const connectResult = await bridge.connectRoom({
        identity: mediaToken.identity,
        roomName: mediaToken.roomName,
        token: mediaToken.token,
        url: mediaToken.url,
      });
      if (connectResult && connectResult.ok === false) {
        activeCallId = null;
        const reason = String(connectResult.reason || '').trim();
        return emitConnectionState({
          callId: call._id,
          reason: reason || 'Gagal terhubung',
          status: 'failed',
        });
      }
      activeCallId = call._id;
      await syncMicFromCall(call, userId);
      return emitConnectionState({
        callId: call._id,
        status: 'connected',
      });
    } catch (error) {
      activeCallId = null;
      return emitConnectionState({
        callId: call._id,
        reason:
          error instanceof Error && error.message.trim()
            ? error.message.trim()
            : 'Gagal media',
        status: 'failed',
      });
    } finally {
      starting = false;
    }
  }

  async function onCallUpdated({
    call,
    userId,
  }: {
    call: KolamTeamChatCall | null | undefined;
    userId?: string | null;
  }): Promise<void> {
    if (!call || call.status === 'ended') {
      await stop();
      return;
    }

    if (activeCallId && call._id !== activeCallId) {
      return;
    }

    await syncMicFromCall(call, userId);
  }

  return {
    getActiveCallId: () => activeCallId,
    getConnectionState,
    onCallUpdated,
    startAfterJoin,
    stop,
    subscribe,
  };
}

let sharedSession: ReturnType<typeof createKolamTeamChatCallMediaSession> | null =
  null;

export function getSharedKolamTeamChatCallMediaSession() {
  if (!sharedSession) {
    sharedSession = createKolamTeamChatCallMediaSession();
  }
  return sharedSession;
}

export function stopSharedKolamTeamChatCallMediaSession() {
  return getSharedKolamTeamChatCallMediaSession().stop();
}
