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

  return {
    eventId: event.eventId,
    eventName: event.contract.eventName,
    isForSelectedDetail,
    refreshCallState: refreshTargets.includes('call-state'),
    refreshDetail: isForSelectedDetail,
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

export function getKolamChatLiveEventTargetId({
  contract,
  payload,
}: KolamChatLiveClassifiableEvent) {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const record = payload as Record<string, unknown>;
  const id =
    contract.stream === 'team-chat'
      ? record.roomId ?? record.id
      : record.conversationId ?? record.id;

  return typeof id === 'string' ? id : undefined;
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

  return !targetId || targetId === selectedItemId;
}

function resolveKolamChatLiveSoundIntent(
  event: KolamChatLiveClassifiableEvent,
  context: {
    currentUserId?: string | null;
    selectedItemId?: string | null;
    targetId?: string;
  },
): KolamChatLiveResolvedSoundIntent {
  if (event.contract.soundIntent === 'none') {
    return 'none';
  }

  if (event.contract.soundIntent !== 'incoming-assigned-or-unassigned') {
    return event.contract.soundIntent;
  }

  if (context.selectedItemId && context.selectedItemId === context.targetId) {
    return 'none';
  }

  const record = getPayloadRecord(event.payload);
  const message = getPayloadRecord(record?.message);
  if (message?.direction !== 'in') {
    return 'none';
  }

  const assignedStaffId =
    typeof record?.assignedStaffId === 'string'
      ? record.assignedStaffId
      : undefined;

  if (!assignedStaffId) {
    return 'unassigned';
  }

  if (context.currentUserId && assignedStaffId !== context.currentUserId) {
    return 'none';
  }

  return 'assigned';
}

function getPayloadRecord(value: unknown) {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : undefined;
}
