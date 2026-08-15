import type {
  KolamTeamChatCall,
  KolamTeamChatCallConfig,
  KolamTeamChatCallParticipant,
  KolamTeamChatUserRef,
} from '../services/kolam-api';

/** Signaling on + LiveKit media configured — safe to request media-token. */
export function isKolamTeamChatCallMediaReady(
  config: KolamTeamChatCallConfig | null | undefined,
): boolean {
  if (config?.enabled !== true || config.media?.enabled !== true) {
    return false;
  }

  const url = config.media.url;
  return typeof url === 'string' && url.trim().length > 0;
}

/**
 * Client must not call POST .../media-token when media is off (BE returns 503)
 * or when local participant is not yet `joined` (BE returns 403).
 */
export function canRequestKolamTeamChatCallMediaToken({
  call,
  config,
  userId,
}: {
  call: KolamTeamChatCall | null | undefined;
  config: KolamTeamChatCallConfig | null | undefined;
  userId?: string | null;
}): boolean {
  if (!isKolamTeamChatCallMediaReady(config)) {
    return false;
  }

  return getKolamTeamChatCallMyParticipantStatus(call, userId) === 'joined';
}

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

/**
 * Outbound ringback for a joined host/peer while waiting for the first peer.
 * Stops once another participant has joined (or onlineInCall >= 2), even if
 * call.status briefly lags on 'ringing'. Mutual exclusive with invite ring.
 */
export function isKolamTeamChatCallWaitingRingbackForMe(
  call: KolamTeamChatCall | null | undefined,
  userId?: string | null,
) {
  if (!call || call.status !== 'ringing') {
    return false;
  }

  if (isKolamTeamChatCallRingingForMe(call, userId)) {
    return false;
  }

  if (getKolamTeamChatCallMyParticipantStatus(call, userId) !== 'joined') {
    return false;
  }

  if ((call.onlineInCall ?? call.participantCount ?? 0) >= 2) {
    return false;
  }

  const myId = String(userId);
  const otherJoined = (call.participants ?? []).some(participant => {
    const participantUserId = getKolamTeamChatCallParticipantUserId(participant);
    return (
      Boolean(participantUserId) &&
      participantUserId !== myId &&
      participant.status === 'joined'
    );
  });

  return !otherJoined;
}

/** Short operator label for participant invite/presence state. */
export function formatKolamTeamChatCallParticipantStatusLabel(
  status: KolamTeamChatCallParticipant['status'] | null | undefined,
): string {
  switch (status) {
    case 'invited':
    case 'ringing':
      return 'Memanggil';
    case 'joined':
      return 'Online';
    case 'declined':
      return 'Tolak';
    case 'no_answer':
      return 'Tidak jawab';
    case 'left':
      return 'Keluar';
    default:
      return '';
  }
}

function formatKolamTeamChatUserRefLabel(
  user: KolamTeamChatUserRef | null | undefined,
): string {
  if (!user) {
    return '';
  }

  return (
    [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
    user.username?.trim() ||
    user.email?.trim() ||
    ''
  );
}

/**
 * BE serializeParticipant only sends userId — resolve display name from room members.
 */
export function resolveKolamTeamChatCallParticipantDisplayName({
  participant,
  members,
}: {
  participant: KolamTeamChatCallParticipant | null | undefined;
  members?: KolamTeamChatUserRef[] | null;
}): string {
  if (!participant) {
    return 'Peserta';
  }

  const embedded =
    typeof participant.user === 'object' && participant.user
      ? formatKolamTeamChatUserRefLabel(participant.user)
      : '';
  if (embedded) {
    return embedded;
  }

  const userId = getKolamTeamChatCallParticipantUserId(participant);
  if (userId && members?.length) {
    const member = members.find(item => String(item._id) === String(userId));
    const fromMember = formatKolamTeamChatUserRefLabel(member);
    if (fromMember) {
      return fromMember;
    }
  }

  return 'Peserta';
}

export function formatKolamTeamChatCallParticipantRowLabel({
  participant,
  members,
}: {
  participant: KolamTeamChatCallParticipant | null | undefined;
  members?: KolamTeamChatUserRef[] | null;
}): string {
  const name = resolveKolamTeamChatCallParticipantDisplayName({
    participant,
    members,
  });
  const status = formatKolamTeamChatCallParticipantStatusLabel(
    participant?.status,
  );
  return status ? `${name} · ${status}` : name;
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

export type KolamTeamChatCallMediaConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'failed';

export type KolamTeamChatCallMediaConnectionState = {
  callId: string | null;
  reason?: string;
  status: KolamTeamChatCallMediaConnectionStatus;
};

/** Short media status for call strip / gate pill (signaling label stays separate). */
export function formatKolamTeamChatCallMediaStatusLabel(
  state: KolamTeamChatCallMediaConnectionState | null | undefined,
): string | null {
  if (!state || state.status === 'idle') {
    return null;
  }

  if (state.status === 'connecting') {
    return 'Menghubungkan';
  }

  if (state.status === 'connected') {
    return 'Terhubung';
  }

  const reason = state.reason?.trim();
  return reason || 'Gagal media';
}

export function formatKolamTeamChatCallHandoverNotice(token: string): string {
  const trimmed = token.trim();
  if (!trimmed) {
    return 'Handover siap';
  }

  return `Handover token: ${trimmed.slice(0, 12)}…`;
}

/** After local join/decline, force participant status so ringtone gating updates immediately. */
export function withKolamTeamChatCallMyParticipantStatus(
  call: KolamTeamChatCall | null | undefined,
  userId: string | null | undefined,
  status: KolamTeamChatCallParticipant['status'],
): KolamTeamChatCall | null {
  if (!call || !userId) {
    return call ?? null;
  }

  const participants = Array.isArray(call.participants)
    ? [...call.participants]
    : [];
  const index = participants.findIndex(
    participant => getKolamTeamChatCallParticipantUserId(participant) === userId,
  );

  if (index >= 0) {
    participants[index] = {...participants[index], status};
  } else {
    participants.push({status, userId});
  }

  return {...call, participants};
}
