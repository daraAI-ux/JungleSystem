import type {
  KolamTeamChatCall,
  KolamTeamChatCallParticipant,
  KolamTeamChatUserRef,
} from '../services/kolam-api';

export function getKolamTeamChatCallParticipantUserId(
  participant: KolamTeamChatCallParticipant | null | undefined,
): string | undefined {
  if (!participant) {
    return undefined;
  }

  if (typeof participant.userId === 'string' && participant.userId.trim()) {
    return participant.userId.trim();
  }

  if (typeof participant.user === 'string' && participant.user.trim()) {
    return participant.user.trim();
  }

  if (participant.user && typeof participant.user === 'object') {
    const id = participant.user._id;
    return typeof id === 'string' && id.trim() ? id.trim() : undefined;
  }

  return undefined;
}

export function isKolamTeamChatCallParticipantMuted(
  participant: KolamTeamChatCallParticipant | null | undefined,
): boolean {
  if (!participant) {
    return false;
  }

  if (typeof participant.mutedByAdmin === 'boolean') {
    return participant.mutedByAdmin;
  }

  return participant.muted === true;
}

export function getKolamTeamChatCallStartedById(
  call: KolamTeamChatCall | null | undefined,
): string | undefined {
  if (!call?.startedBy) {
    return undefined;
  }

  if (typeof call.startedBy === 'string') {
    return call.startedBy.trim() || undefined;
  }

  const id = call.startedBy._id;
  return typeof id === 'string' && id.trim() ? id.trim() : undefined;
}

export function getKolamTeamChatCallMyParticipant(
  call: KolamTeamChatCall | null | undefined,
  userId?: string | null,
): KolamTeamChatCallParticipant | null {
  if (!call || !userId) {
    return null;
  }

  return (
    call.participants?.find(
      participant => getKolamTeamChatCallParticipantUserId(participant) === userId,
    ) ?? null
  );
}

export function getKolamTeamChatCallMyParticipantStatus(
  call: KolamTeamChatCall | null | undefined,
  userId?: string | null,
) {
  return getKolamTeamChatCallMyParticipant(call, userId)?.status ?? null;
}

/** SoT `isRingingForMe` — invitee still needs to answer. */
export function isKolamTeamChatCallRingingForMe(
  call: KolamTeamChatCall | null | undefined,
  userId?: string | null,
) {
  const status = getKolamTeamChatCallMyParticipantStatus(call, userId);
  return status === 'ringing' || status === 'invited';
}

export function canManageKolamTeamChatCall({
  call,
  isRoomAdmin,
  members,
  userId,
}: {
  call: KolamTeamChatCall | null | undefined;
  isRoomAdmin?: boolean;
  members?: KolamTeamChatUserRef[];
  userId?: string | null;
}): boolean {
  if (!userId) {
    return false;
  }

  if (isRoomAdmin) {
    return true;
  }

  const myMember = members?.find(member => String(member._id) === String(userId));
  if (myMember?.role === 'admin') {
    return true;
  }

  return getKolamTeamChatCallStartedById(call) === userId || call?.isHost === true;
}

/** Mute/unmute is admin-only on BE (not host alone). */
export function canMuteKolamTeamChatCallParticipants({
  isRoomAdmin,
  members,
  userId,
}: {
  isRoomAdmin?: boolean;
  members?: KolamTeamChatUserRef[];
  userId?: string | null;
}): boolean {
  if (!userId) {
    return false;
  }

  if (isRoomAdmin) {
    return true;
  }

  const myMember = members?.find(member => String(member._id) === String(userId));
  return myMember?.role === 'admin';
}

export function secondsUntilKolamTeamChatCallRing(
  iso: string | null | undefined,
): number {
  if (!iso) {
    return 0;
  }

  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 1000));
}

export function pickPrimaryKolamTeamChatCall(
  calls: KolamTeamChatCall[] | undefined,
  userId?: string | null,
): KolamTeamChatCall | null {
  if (!calls?.length || !userId) {
    return null;
  }

  const ringing = calls.find(
    call => call.status !== 'ended' && isKolamTeamChatCallRingingForMe(call, userId),
  );
  if (ringing) {
    return ringing;
  }

  return (
    calls.find(call => call.status === 'active' || call.status === 'ringing') ??
    null
  );
}

/** SoT room strip: `Call · {onlineInCall} online` (+ optional ring countdown). */
export function formatKolamTeamChatCallOnlineLabel(
  call: KolamTeamChatCall | null | undefined,
  options?: {countdownSeconds?: number},
): string {
  if (!call || call.status === 'ended') {
    return 'Call';
  }

  const online =
    typeof call.onlineInCall === 'number'
      ? call.onlineInCall
      : typeof call.participantCount === 'number'
        ? call.participantCount
        : call.participants?.filter(participant => participant.status === 'joined')
            .length ?? 0;

  const countdown = options?.countdownSeconds ?? 0;
  if (countdown > 0) {
    return `Call · ${online} online · ${countdown}s`;
  }

  return `Call · ${online} online`;
}

export function formatKolamTeamChatCallHandoverNotice(token: string): string {
  const trimmed = token.trim();
  if (!trimmed) {
    return 'Handover siap';
  }

  return `Handover token: ${trimmed.slice(0, 12)}…`;
}
