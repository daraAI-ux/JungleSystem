import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  getKolamTeamChatCallStartedById,
  isKolamTeamChatCallRingingForMe,
  pickPrimaryKolamTeamChatCall,
  secondsUntilKolamTeamChatCallRing,
} from '../domain/kolam-team-chat-call';
import {
  declineKolamTeamChatCall,
  endKolamTeamChatCall,
  getKolamMyActiveTeamChatCalls,
  getKolamTeamChatCallConfig,
  joinKolamTeamChatCall,
  type KolamTeamChatCall,
} from '../services/kolam-api';
import {createKolamGroupCallRingtoneController} from '../services/kolam-group-call-ringtone';
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
  const [liveCall, setLiveCall] = useState<KolamTeamChatCall | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [groupCallRingtone, setGroupCallRingtone] = useState<
    string | undefined
  >();
  const [, setTick] = useState(0);
  const liveCallRef = useRef<KolamTeamChatCall | null>(null);
  const ringtone = useMemo(() => createKolamGroupCallRingtoneController(), []);
  const soundSettings = useKolamNotificationSoundSettings({
    enabled: Boolean(enabled && userId),
  });

  liveCallRef.current = liveCall;

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

  const mergeCall = useCallback((call: KolamTeamChatCall | null | undefined) => {
    if (!call || call.status === 'ended') {
      setLiveCall(null);
      return;
    }
    setLiveCall(call);
  }, []);

  const refreshMyCalls = useCallback(async () => {
    if (!enabled || !userId) {
      setFeatureEnabled(false);
      setLiveCall(null);
      ringtone.stop();
      return;
    }

    try {
      const config = await getKolamTeamChatCallConfig();
      const nextEnabled = config.enabled === true;
      setFeatureEnabled(nextEnabled);
      setGroupCallRingtone(
        typeof config.groupCallRingtone === 'string'
          ? config.groupCallRingtone
          : undefined,
      );
      if (!nextEnabled) {
        setLiveCall(null);
        ringtone.stop();
        return;
      }

      const calls = await getKolamMyActiveTeamChatCalls();
      mergeCall(pickPrimaryKolamTeamChatCall(calls, userId));
    } catch {
      // Best-effort; keep last known live call.
    }
  }, [enabled, mergeCall, ringtone, userId]);

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
    return () => clearInterval(id);
  }, [liveCall?._id, liveCall?.status]);

  const ringingMe = isKolamTeamChatCallRingingForMe(liveCall, userId);

  useEffect(() => {
    if (!enabled || !featureEnabled || !ringingMe) {
      ringtone.stop();
      return;
    }

    ringtone.start();
    return () => {
      ringtone.stop();
    };
  }, [enabled, featureEnabled, ringingMe, ringtone]);

  useEffect(() => {
    return () => {
      ringtone.stop();
    };
  }, [ringtone]);

  const runAction = useCallback(
    async (action: () => Promise<KolamTeamChatCall>) => {
      if (busy) {
        return;
      }

      setBusy(true);
      setErrorMessage(undefined);
      try {
        const call = await action();
        mergeCall(call.status === 'ended' ? null : call);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Aksi call gagal.',
        );
      } finally {
        setBusy(false);
      }
    },
    [busy, mergeCall],
  );

  const joinCall = useCallback(async () => {
    if (!liveCall) {
      return;
    }
    ringtone.stop();
    await runAction(() => joinKolamTeamChatCall(liveCall._id));
  }, [liveCall, ringtone, runAction]);

  const declineCall = useCallback(async () => {
    if (!liveCall) {
      return;
    }
    ringtone.stop();
    await runAction(() => declineKolamTeamChatCall(liveCall._id));
  }, [liveCall, ringtone, runAction]);

  const endCall = useCallback(async () => {
    if (!liveCall) {
      return;
    }
    ringtone.stop();
    await runAction(() => endKolamTeamChatCall(liveCall._id));
  }, [liveCall, ringtone, runAction]);

  const countdown = liveCall?.ringExpiresAt
    ? secondsUntilKolamTeamChatCallRing(liveCall.ringExpiresAt)
    : 0;
  const canEnd =
    liveCall?.isHost === true ||
    getKolamTeamChatCallStartedById(liveCall) === userId;
  const online = liveCall?.onlineInCall ?? liveCall?.participantCount ?? 0;

  return {
    busy,
    canEnd,
    countdown,
    declineCall,
    endCall,
    errorMessage,
    featureEnabled,
    joinCall,
    liveCall: liveCall && liveCall.status !== 'ended' ? liveCall : null,
    online,
    ringingMe,
  };
}
