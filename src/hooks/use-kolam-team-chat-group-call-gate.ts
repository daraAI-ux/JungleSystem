import {useCallback, useEffect, useRef, useState} from 'react';
import {
  getKolamTeamChatCallStartedById,
  isKolamTeamChatCallMediaReady,
  isKolamTeamChatCallRingingForMe,
  isKolamTeamChatCallWaitingRingbackForMe,
  pickPrimaryKolamTeamChatCall,
  secondsUntilKolamTeamChatCallRing,
  withKolamTeamChatCallMyParticipantStatus,
} from '../domain/kolam-team-chat-call';
import {
  declineKolamTeamChatCall,
  endKolamTeamChatCall,
  getKolamMyActiveTeamChatCalls,
  getKolamTeamChatCallConfig,
  joinKolamTeamChatCall,
  type KolamTeamChatCall,
  type KolamTeamChatCallConfig,
} from '../services/kolam-api';
import {
  getSharedKolamGroupCallRingtoneController,
  stopSharedKolamGroupCallRingtone,
} from '../services/kolam-group-call-ringtone';
import {
  getSharedKolamTeamChatCallMediaSession,
  stopSharedKolamTeamChatCallMediaSession,
} from '../services/kolam-team-chat-call-media-session';
import {
  type KolamChatLiveEvent,
  useKolamChatLiveStream,
} from './use-kolam-chat-live-stream';
import {useKolamNotificationSoundSettings} from './use-kolam-notification-sound-settings';

const MY_ACTIVE_CALLS_POLL_MS = 12_000;

function readLiveCallPayload(payload: unknown): {
  call?: KolamTeamChatCall | null;
  callId?: string;
} {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  const record = payload as Record<string, unknown>;
  const nested =
    record.data && typeof record.data === 'object'
      ? (record.data as Record<string, unknown>)
      : null;
  const callCandidate = record.call ?? nested?.call;
  const callIdCandidate = record.callId ?? nested?.callId;

  return {
    call:
      callCandidate && typeof callCandidate === 'object'
        ? (callCandidate as KolamTeamChatCall)
        : null,
    callId:
      typeof callIdCandidate === 'string' && callIdCandidate.trim()
        ? callIdCandidate.trim()
        : undefined,
  };
}

export function useKolamTeamChatGroupCallGate({
  enabled,
  userId,
}: {
  enabled: boolean;
  userId?: string | null;
}) {
  const [featureEnabled, setFeatureEnabled] = useState(false);
  const [callConfig, setCallConfig] = useState<KolamTeamChatCallConfig>({
    enabled: false,
  });
  const [liveCall, setLiveCall] = useState<KolamTeamChatCall | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [groupCallRingtone, setGroupCallRingtone] = useState<
    string | undefined
  >();
  const [, setTick] = useState(0);
  const liveCallRef = useRef<KolamTeamChatCall | null>(null);
  const ringtone = getSharedKolamGroupCallRingtoneController();
  const mediaSession = getSharedKolamTeamChatCallMediaSession();
  const [mediaConnection, setMediaConnection] = useState(() =>
    mediaSession.getConnectionState(),
  );
  const soundSettings = useKolamNotificationSoundSettings({
    enabled: Boolean(enabled && userId),
  });

  liveCallRef.current = liveCall;

  useEffect(() => mediaSession.subscribe(setMediaConnection), [mediaSession]);

  useEffect(() => {
    ringtone.setWebSetting(
      soundSettings.webSetting
        ? {groupCallRingtone: soundSettings.webSetting.groupCallRingtone}
        : null,
    );
  }, [ringtone, soundSettings.webSetting]);

  useEffect(() => {
    ringtone.setRingtonePath(groupCallRingtone);
  }, [groupCallRingtone, ringtone]);

  const mergeCall = useCallback(
    (call: KolamTeamChatCall | null | undefined) => {
      if (!call || call.status === 'ended') {
        setLiveCall(null);
        stopSharedKolamGroupCallRingtone();
        void stopSharedKolamTeamChatCallMediaSession();
        return;
      }
      setLiveCall(call);
      void mediaSession.onCallUpdated({call, config: callConfig, userId});
    },
    [callConfig, mediaSession, userId],
  );

  const refreshMyCalls = useCallback(async () => {
    if (!enabled || !userId) {
      setFeatureEnabled(false);
      setCallConfig({enabled: false});
      setLiveCall(null);
      stopSharedKolamGroupCallRingtone();
      void stopSharedKolamTeamChatCallMediaSession();
      return;
    }

    try {
      const config = await getKolamTeamChatCallConfig();
      const nextEnabled = config.enabled === true;
      setCallConfig(config);
      setFeatureEnabled(nextEnabled);
      setGroupCallRingtone(
        typeof config.groupCallRingtone === 'string'
          ? config.groupCallRingtone
          : undefined,
      );
      if (!nextEnabled) {
        setLiveCall(null);
        stopSharedKolamGroupCallRingtone();
        return;
      }

      const calls = await getKolamMyActiveTeamChatCalls();
      mergeCall(pickPrimaryKolamTeamChatCall(calls, userId));
    } catch {
      // Best-effort; keep last known live call.
    }
  }, [enabled, mergeCall, userId]);

  useEffect(() => {
    void refreshMyCalls();
  }, [refreshMyCalls]);

  useEffect(() => {
    if (!enabled || !userId || !featureEnabled) {
      return;
    }

    const timer = setInterval(() => {
      void refreshMyCalls();
    }, MY_ACTIVE_CALLS_POLL_MS);

    return () => clearInterval(timer);
  }, [enabled, featureEnabled, refreshMyCalls, userId]);

  useKolamChatLiveStream({
    enabled: Boolean(enabled && userId && featureEnabled),
    mode: 'team-chat',
    onEvent: (event: KolamChatLiveEvent) => {
      if (event.contract.eventName === 'call.updated') {
        const {call} = readLiveCallPayload(event.payload);
        if (!call) {
          void refreshMyCalls();
          return;
        }
        mergeCall(call);
        return;
      }

      if (event.contract.eventName === 'call.ended') {
        const {callId} = readLiveCallPayload(event.payload);
        const current = liveCallRef.current;
        if (current && callId && callId !== current._id) {
          return;
        }
        mergeCall(null);
      }
    },
  });

  useEffect(() => {
    if (!liveCall || liveCall.status === 'ended') {
      return;
    }

    const id = setInterval(() => setTick(tick => tick + 1), 1000);
    (id as {unref?: () => void}).unref?.();
    return () => clearInterval(id);
  }, [liveCall?._id, liveCall?.status]);

  const ringingMe = isKolamTeamChatCallRingingForMe(liveCall, userId);
  const waitingRingback = isKolamTeamChatCallWaitingRingbackForMe(
    liveCall,
    userId,
  );
  const shouldPlayCallTone = ringingMe || waitingRingback;
  const shouldPlayCallToneRef = useRef(shouldPlayCallTone);
  shouldPlayCallToneRef.current = shouldPlayCallTone;

  useEffect(() => {
    if (!enabled || !featureEnabled || !shouldPlayCallTone) {
      stopSharedKolamGroupCallRingtone();
      return;
    }

    ringtone.start();
    return () => {
      // Only halt playback when we are truly leaving invite/ringback state.
      // Cleanup during re-render/remount must not kill a still-valid tone.
      if (!shouldPlayCallToneRef.current) {
        stopSharedKolamGroupCallRingtone();
      }
    };
  }, [enabled, featureEnabled, ringtone, shouldPlayCallTone]);

  useEffect(() => {
    return () => {
      stopSharedKolamGroupCallRingtone();
      void stopSharedKolamTeamChatCallMediaSession();
    };
  }, []);

  const runAction = useCallback(
    async (
      action: () => Promise<KolamTeamChatCall>,
      options?: {forceMyStatus?: 'joined' | 'declined'},
    ) => {
      if (busy) {
        return;
      }

      setBusy(true);
      setErrorMessage(undefined);
      try {
        let call = await action();
        if (options?.forceMyStatus && userId) {
          call =
            withKolamTeamChatCallMyParticipantStatus(
              call,
              userId,
              options.forceMyStatus,
            ) ?? call;
        }
        stopSharedKolamGroupCallRingtone();
        mergeCall(call.status === 'ended' ? null : call);
        if (options?.forceMyStatus === 'joined' && call.status !== 'ended') {
          const mediaState = await mediaSession.startAfterJoin({
            call,
            config: callConfig,
            userId,
          });
          if (mediaState.status === 'failed') {
            setErrorMessage(mediaState.reason || 'Gagal media');
          }
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Aksi call gagal.',
        );
      } finally {
        setBusy(false);
      }
    },
    [busy, callConfig, mediaSession, mergeCall, userId],
  );

  const joinCall = useCallback(async () => {
    if (!liveCall) {
      return;
    }
    stopSharedKolamGroupCallRingtone();
    await runAction(() => joinKolamTeamChatCall(liveCall._id), {
      forceMyStatus: 'joined',
    });
  }, [liveCall, runAction]);

  const declineCall = useCallback(async () => {
    if (!liveCall) {
      return;
    }
    stopSharedKolamGroupCallRingtone();
    await runAction(() => declineKolamTeamChatCall(liveCall._id), {
      forceMyStatus: 'declined',
    });
  }, [liveCall, runAction]);

  const endCall = useCallback(async () => {
    if (!liveCall) {
      return;
    }
    stopSharedKolamGroupCallRingtone();
    await runAction(() => endKolamTeamChatCall(liveCall._id));
  }, [liveCall, runAction]);

  const countdown = liveCall?.ringExpiresAt
    ? secondsUntilKolamTeamChatCallRing(liveCall.ringExpiresAt)
    : 0;
  const canEnd =
    liveCall?.isHost === true ||
    getKolamTeamChatCallStartedById(liveCall) === userId;
  const online = liveCall?.onlineInCall ?? liveCall?.participantCount ?? 0;

  return {
    busy,
    callConfig,
    canEnd,
    countdown,
    declineCall,
    endCall,
    errorMessage,
    featureEnabled,
    joinCall,
    liveCall: liveCall && liveCall.status !== 'ended' ? liveCall : null,
    mediaConnection,
    /** LiveKit ready — native bridge may connect; do not call media-token if false. */
    mediaReady: isKolamTeamChatCallMediaReady(callConfig),
    online,
    ringingMe,
  };
}
