import type {
  KolamChatLiveEventContract,
  KolamChatLiveRefreshTarget,
} from './kolam-chat-live-contract';
import type {KolamNotificationSoundType} from '../services/kolam-api';

export type KolamChatLiveClassifiableEvent = {
  contract: KolamChatLiveEventContract;
  eventId?: string;
  payload: unknown;
};

export type KolamChatLiveResolvedSoundIntent =
  | KolamNotificationSoundType
  | 'none';

export type KolamChatLiveClassificationContext = {
  currentUserId?: string | null;
  selectedItemId?: string | null;
};

export type KolamChatLiveClassification = {
  eventId?: string;
  eventName: string;
  isForSelectedDetail: boolean;
  refreshCallState: boolean;
  refreshDetail: boolean;
  refreshList: boolean;
  refreshPresence: boolean;
  refreshTargets: KolamChatLiveRefreshTarget[];
  soundIntent: KolamChatLiveResolvedSoundIntent;
  stream: KolamChatLiveEventContract['stream'];
  targetId?: string;
};

export function classifyKolamChatLiveEvent(
  event: KolamChatLiveClassifiableEvent,
  context: KolamChatLiveClassificationContext = {},
): KolamChatLiveClassification {
  const targetId = getKolamChatLiveEventTargetId(event);
  const refreshTargets = event.contract.refreshTargets;
  const isForSelectedDetail = getIsForSelectedDetail({
    event,
    selectedItemId: context.selectedItemId,
    targetId,
  });

  // Open-thread message.created is applied via upsert; a concurrent full refetch
  // can race and wipe the just-sent/upserted row (plugin keeps upsert-only).
  const refreshDetail =
    isForSelectedDetail &&
    !(
      (event.contract.stream === 'inbox' ||
        event.contract.stream === 'team-chat') &&
      event.contract.eventName === 'message.created'
    );

  return {
    eventId: event.eventId,
    eventName: event.contract.eventName,
    isForSelectedDetail,
    refreshCallState: refreshTargets.includes('call-state'),
    refreshDetail,
    refreshList: refreshTargets.some(target =>
      ['inbox-list', 'team-room-list', 'unread-badge'].includes(target),
    ),
    refreshPresence: refreshTargets.includes('team-room-presence'),
    refreshTargets,
    soundIntent: resolveKolamChatLiveSoundIntent(event, {
      currentUserId: context.currentUserId,
      selectedItemId: context.selectedItemId,
      targetId,
    }),
    stream: event.contract.stream,
    targetId,
  };
}

function readLiveTargetId(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return undefined;
}

export function getKolamChatLiveEventTargetId({
  contract,
  payload,
}: KolamChatLiveClassifiableEvent) {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const record = payload as Record<string, unknown>;
  if (contract.stream === 'team-chat') {
    const nested =
      record.data && typeof record.data === 'object'
        ? (record.data as Record<string, unknown>)
        : undefined;
    const message =
      (record.message && typeof record.message === 'object'
        ? (record.message as Record<string, unknown>)
        : undefined) ??
      (nested?.message && typeof nested.message === 'object'
        ? (nested.message as Record<string, unknown>)
        : undefined);
    const roomFromMessage = message
      ? readLiveTargetId(message.room) ||
        (message.room && typeof message.room === 'object'
          ? readLiveTargetId((message.room as {_id?: unknown})._id)
          : undefined)
      : undefined;
    const envelopeId = readLiveTargetId(record.id);

    return (
      readLiveTargetId(record.roomId) ||
      readLiveTargetId(record.room) ||
      readLiveTargetId(nested?.roomId) ||
      readLiveTargetId(nested?.room) ||
      roomFromMessage ||
      (envelopeId && !envelopeId.includes(':') ? envelopeId : undefined)
    );
  }

  return (
    readLiveTargetId(record.conversationId) || readLiveTargetId(record.id)
  );
}

function getIsForSelectedDetail({
  event,
  selectedItemId,
  targetId,
}: {
  event: KolamChatLiveClassifiableEvent;
  selectedItemId?: string | null;
  targetId?: string;
}) {
  if (!selectedItemId) {
    return false;
  }

  if (
    !event.contract.refreshTargets.some(target =>
      ['inbox-detail', 'team-room-detail'].includes(target),
    )
  ) {
    return false;
  }

  if (event.contract.eventName === 'sync.required') {
    return true;
  }

  return !targetId || targetId.trim() === selectedItemId.trim();
}

function resolveKolamChatLiveSoundIntent(
  event: KolamChatLiveClassifiableEvent,
  context: {
    currentUserId?: string | null;
    selectedItemId?: string | null;
    targetId?: string;
  },
): KolamChatLiveResolvedSoundIntent {
  // Backup when message.created is missed/malformed but conversation.updated arrives.
  if (
    event.contract.stream === 'inbox' &&
    event.contract.eventName === 'conversation.updated'
  ) {
    return resolveInboxIncomingSoundIntent(event.payload, context, {
      directionSource: 'lastMessageDirection',
    });
  }

  if (event.contract.soundIntent === 'none') {
    return 'none';
  }

  if (event.contract.soundIntent !== 'incoming-assigned-or-unassigned') {
    return event.contract.soundIntent;
  }

  return resolveInboxIncomingSoundIntent(event.payload, context, {
    directionSource: 'message',
  });
}

function resolveInboxIncomingSoundIntent(
  payload: unknown,
  context: {
    currentUserId?: string | null;
    selectedItemId?: string | null;
    targetId?: string;
  },
  options: {directionSource: 'message' | 'lastMessageDirection'},
): KolamChatLiveResolvedSoundIntent {
  if (context.selectedItemId && context.selectedItemId.trim() === context.targetId?.trim()) {
    return 'none';
  }

  const record = getPayloadRecord(payload);
  const direction =
    options.directionSource === 'message'
      ? normalizeChatDirection(getPayloadRecord(record?.message)?.direction)
      : normalizeChatDirection(record?.lastMessageDirection);

  if (direction !== 'in') {
    return 'none';
  }

  const assignedStaffId = normalizeAssignedStaffId(record?.assignedStaffId);
  const currentUserId = normalizeId(context.currentUserId);

  if (!assignedStaffId) {
    return 'unassigned';
  }

  if (currentUserId && assignedStaffId !== currentUserId) {
    return 'none';
  }

  return 'assigned';
}

function getPayloadRecord(value: unknown) {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : undefined;
}

function normalizeChatDirection(value: unknown): 'in' | 'out' | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'in' || normalized === 'incoming') {
    return 'in';
  }

  if (normalized === 'out' || normalized === 'outgoing') {
    return 'out';
  }

  return null;
}

function normalizeAssignedStaffId(value: unknown): string | undefined {
  if (value == null || value === false) {
    return undefined;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const id = String(value).trim();
    return id || undefined;
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return normalizeAssignedStaffId(record._id ?? record.id);
  }

  return undefined;
}

function normalizeId(value: unknown): string | undefined {
  if (value == null) {
    return undefined;
  }

  const id = String(value).trim();
  return id || undefined;
}
