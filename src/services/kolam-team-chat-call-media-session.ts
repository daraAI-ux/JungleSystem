import {
  canRequestKolamTeamChatCallMediaToken,
  getKolamTeamChatCallMyParticipant,
  isKolamTeamChatCallParticipantMuted,
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

/**
 * JS session for LiveKit voice after signaling join.
 * Native C++ room (Batch B1+) does the actual WebRTC; until linked this is a no-op.
 */
export function createKolamTeamChatCallMediaSession(
  options: KolamTeamChatCallMediaSessionOptions = {},
) {
  let activeCallId: string | null = null;
  let starting = false;

  const requestMediaToken =
    options.requestMediaToken ?? requestKolamTeamChatCallMediaTokenIfReady;

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
  }): Promise<void> {
    if (!call?._id || starting) {
      return;
    }

    if (
      !canRequestKolamTeamChatCallMediaToken({
        call,
        config,
        userId,
      })
    ) {
      return;
    }

    const bridge = getKolamLiveKitNativeBridge(options);
    if (!bridge?.connectRoom) {
      // Native LiveKit room not linked yet (Batch B1+).
      return;
    }

    starting = true;
    try {
      const mediaToken = await requestMediaToken({
        call,
        callId: call._id,
        config,
        userId,
      });
      if (!mediaToken?.token || !mediaToken.url) {
        return;
      }

      const connectResult = await bridge.connectRoom({
        identity: mediaToken.identity,
        roomName: mediaToken.roomName,
        token: mediaToken.token,
        url: mediaToken.url,
      });
      if (connectResult && connectResult.ok === false) {
        activeCallId = null;
        return;
      }
      activeCallId = call._id;
      await syncMicFromCall(call, userId);
    } catch {
      activeCallId = null;
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
    onCallUpdated,
    startAfterJoin,
    stop,
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
