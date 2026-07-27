import type {KolamNotificationSoundType} from '../services/kolam-api';

export type KolamChatLiveStreamKind = 'inbox' | 'team-chat';

export type KolamChatLiveRefreshTarget =
  | 'inbox-list'
  | 'inbox-detail'
  | 'team-room-list'
  | 'team-room-detail'
  | 'team-room-presence'
  | 'unread-badge'
  | 'call-state';

export type KolamChatLiveSoundIntent =
  | KolamNotificationSoundType
  | 'incoming-assigned-or-unassigned'
  | 'none';

export type KolamChatLiveEventContract = {
  stream: KolamChatLiveStreamKind;
  eventName: string;
  route: string;
  refreshTargets: KolamChatLiveRefreshTarget[];
  soundIntent: KolamChatLiveSoundIntent;
  legacySources: string[];
  note: string;
};

const INBOX_LEGACY_SOURCES = [
  'E:\\Projects\\DA-Chat-Plugin\\src\\hooks\\chat\\use-chat-stream.ts',
  'E:\\Projects\\DA-Chat-Plugin\\src\\components\\inbox\\notification-sound-listener.tsx',
  'E:\\Projects\\da-inventory-backend\\plugins\\chat\\routes\\chat.routes.js',
];

const TEAM_CHAT_LEGACY_SOURCES = [
  'E:\\Projects\\DA-Chat-Plugin\\src\\hooks\\team-chat\\use-team-chat-stream.ts',
  'E:\\Projects\\DA-Chat-Plugin\\src\\pages\\team-chat.tsx',
  'E:\\Projects\\da-inventory-backend\\plugins\\chat\\routes\\team-chat.routes.js',
];

export const KOLAM_CHAT_LIVE_STREAM_ROUTES: Record<
  KolamChatLiveStreamKind,
  string
> = {
  inbox: '/chat/stream',
  'team-chat': '/team-chat/stream',
};

export const KOLAM_CHAT_LIVE_EVENT_CONTRACTS: readonly KolamChatLiveEventContract[] =
  [
    {
      stream: 'inbox',
      eventName: 'message.created',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES.inbox,
      refreshTargets: ['inbox-list', 'inbox-detail', 'unread-badge'],
      soundIntent: 'incoming-assigned-or-unassigned',
      legacySources: INBOX_LEGACY_SOURCES,
      note: 'Legacy FE plays assigned or unassigned notification sound only for inbound messages not currently viewed.',
    },
    {
      stream: 'inbox',
      eventName: 'message.updated',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES.inbox,
      refreshTargets: ['inbox-detail'],
      soundIntent: 'none',
      legacySources: INBOX_LEGACY_SOURCES,
      note: 'Keeps the open conversation detail synchronized after message status/content changes.',
    },
    {
      stream: 'inbox',
      eventName: 'conversation.updated',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES.inbox,
      refreshTargets: ['inbox-list', 'inbox-detail', 'unread-badge'],
      soundIntent: 'none',
      legacySources: INBOX_LEGACY_SOURCES,
      note: 'Used by BE for assignment, last-message, read, and sale conversation changes.',
    },
    {
      stream: 'inbox',
      eventName: 'conversation.ai_handoff',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES.inbox,
      refreshTargets: ['inbox-list', 'inbox-detail', 'unread-badge'],
      soundIntent: 'handoff',
      legacySources: INBOX_LEGACY_SOURCES,
      note: 'Legacy FE maps this to handoff browser notification and handoffNotificationSound.',
    },
    {
      stream: 'inbox',
      eventName: 'conversation.assigned',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES.inbox,
      refreshTargets: ['inbox-list', 'inbox-detail', 'unread-badge'],
      soundIntent: 'none',
      legacySources: INBOX_LEGACY_SOURCES,
      note: 'Assignment changes should refresh rail data; sound remains message-driven unless later approved.',
    },
    {
      stream: 'inbox',
      eventName: 'conversation.closed',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES.inbox,
      refreshTargets: ['inbox-list', 'inbox-detail', 'unread-badge'],
      soundIntent: 'none',
      legacySources: INBOX_LEGACY_SOURCES,
      note: 'Retained from the legacy stream event list for lifecycle synchronization.',
    },
    {
      stream: 'inbox',
      eventName: 'conversation.deleted',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES.inbox,
      refreshTargets: ['inbox-list', 'unread-badge'],
      soundIntent: 'none',
      legacySources: INBOX_LEGACY_SOURCES,
      note: 'Deleted conversations should leave the rail list/detail in a consistent state.',
    },
    {
      stream: 'inbox',
      eventName: 'rating.created',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES.inbox,
      refreshTargets: ['inbox-detail'],
      soundIntent: 'none',
      legacySources: INBOX_LEGACY_SOURCES,
      note: 'Rating changes belong to conversation detail metadata, not notification sound.',
    },
    {
      stream: 'inbox',
      eventName: 'typing.update',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES.inbox,
      refreshTargets: ['inbox-detail'],
      soundIntent: 'none',
      legacySources: INBOX_LEGACY_SOURCES,
      note: 'Typing state is live UI only and should not drive unread or notification sound.',
    },
    {
      stream: 'inbox',
      eventName: 'dara.processing',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES.inbox,
      refreshTargets: ['inbox-detail'],
      soundIntent: 'none',
      legacySources: INBOX_LEGACY_SOURCES,
      note: 'DARA progress event for the open inbox conversation.',
    },
    {
      stream: 'inbox',
      eventName: 'dara.processing.done',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES.inbox,
      refreshTargets: ['inbox-list', 'inbox-detail'],
      soundIntent: 'none',
      legacySources: INBOX_LEGACY_SOURCES,
      note: 'DARA completion can affect conversation preview and detail.',
    },
    {
      stream: 'inbox',
      eventName: 'sync.required',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES.inbox,
      refreshTargets: ['inbox-list', 'inbox-detail', 'unread-badge'],
      soundIntent: 'none',
      legacySources: INBOX_LEGACY_SOURCES,
      note: 'Fallback invalidation event for stale or broad server-side changes.',
    },
    {
      stream: 'team-chat',
      eventName: 'message.created',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES['team-chat'],
      refreshTargets: ['team-room-list', 'team-room-detail', 'unread-badge'],
      soundIntent: 'assigned',
      legacySources: TEAM_CHAT_LEGACY_SOURCES,
      note: 'Team room messages update room previews and active detail; sound classification can be narrowed in 6C.',
    },
    {
      stream: 'team-chat',
      eventName: 'message.updated',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES['team-chat'],
      refreshTargets: ['team-room-detail'],
      soundIntent: 'none',
      legacySources: TEAM_CHAT_LEGACY_SOURCES,
      note: 'Message edit/delete state should refresh the open team room only.',
    },
    {
      stream: 'team-chat',
      eventName: 'message.reaction.updated',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES['team-chat'],
      refreshTargets: ['team-room-detail'],
      soundIntent: 'none',
      legacySources: TEAM_CHAT_LEGACY_SOURCES,
      note: 'Reaction changes are detail-only and silent.',
    },
    {
      stream: 'team-chat',
      eventName: 'room.updated',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES['team-chat'],
      refreshTargets: ['team-room-list', 'team-room-detail', 'unread-badge'],
      soundIntent: 'none',
      legacySources: TEAM_CHAT_LEGACY_SOURCES,
      note: 'Room updates cover member, read, SEO, and preview mutations from BE.',
    },
    {
      stream: 'team-chat',
      eventName: 'room.created',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES['team-chat'],
      refreshTargets: ['team-room-list'],
      soundIntent: 'none',
      legacySources: TEAM_CHAT_LEGACY_SOURCES,
      note: 'New rooms should appear in the rail list without forcing a detail load.',
    },
    {
      stream: 'team-chat',
      eventName: 'room.messages.purged',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES['team-chat'],
      refreshTargets: ['team-room-list', 'team-room-detail', 'unread-badge'],
      soundIntent: 'none',
      legacySources: TEAM_CHAT_LEGACY_SOURCES,
      note: 'Bulk purge invalidates both preview and active room message history.',
    },
    {
      stream: 'team-chat',
      eventName: 'presence.updated',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES['team-chat'],
      refreshTargets: ['team-room-presence'],
      soundIntent: 'none',
      legacySources: TEAM_CHAT_LEGACY_SOURCES,
      note: 'Presence is live display metadata and should stay silent.',
    },
    {
      stream: 'team-chat',
      eventName: 'dara.processing',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES['team-chat'],
      refreshTargets: ['team-room-detail'],
      soundIntent: 'none',
      legacySources: TEAM_CHAT_LEGACY_SOURCES,
      note: 'DARA room processing state for the active team room.',
    },
    {
      stream: 'team-chat',
      eventName: 'dara.processing.done',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES['team-chat'],
      refreshTargets: ['team-room-list', 'team-room-detail'],
      soundIntent: 'none',
      legacySources: TEAM_CHAT_LEGACY_SOURCES,
      note: 'DARA completion can update room preview and detail transcript.',
    },
    {
      stream: 'team-chat',
      eventName: 'dara.thinking',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES['team-chat'],
      refreshTargets: ['team-room-detail'],
      soundIntent: 'none',
      legacySources: TEAM_CHAT_LEGACY_SOURCES,
      note: 'DARA thinking lifecycle is rendered in the room detail and is silent.',
    },
    {
      stream: 'team-chat',
      eventName: 'dara.thinking.chunk',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES['team-chat'],
      refreshTargets: ['team-room-detail'],
      soundIntent: 'none',
      legacySources: TEAM_CHAT_LEGACY_SOURCES,
      note: 'Streaming DARA thinking chunk for the active room transcript.',
    },
    {
      stream: 'team-chat',
      eventName: 'dara.thinking.done',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES['team-chat'],
      refreshTargets: ['team-room-detail'],
      soundIntent: 'none',
      legacySources: TEAM_CHAT_LEGACY_SOURCES,
      note: 'End of DARA thinking stream for the active room transcript.',
    },
    {
      stream: 'team-chat',
      eventName: 'dara.seo.mode',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES['team-chat'],
      refreshTargets: ['team-room-detail'],
      soundIntent: 'none',
      legacySources: TEAM_CHAT_LEGACY_SOURCES,
      note: 'Room SEO mode event is UI state only.',
    },
    {
      stream: 'team-chat',
      eventName: 'call.updated',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES['team-chat'],
      refreshTargets: ['call-state', 'team-room-detail'],
      soundIntent: 'group-call',
      legacySources: TEAM_CHAT_LEGACY_SOURCES,
      note: 'Legacy team stream reserves call events; 6D/6F should route this to groupCallRingtone.',
    },
    {
      stream: 'team-chat',
      eventName: 'call.ended',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES['team-chat'],
      refreshTargets: ['call-state', 'team-room-detail'],
      soundIntent: 'none',
      legacySources: TEAM_CHAT_LEGACY_SOURCES,
      note: 'Call end should stop/clear call state and should not start a sound.',
    },
    {
      stream: 'team-chat',
      eventName: 'sync.required',
      route: KOLAM_CHAT_LIVE_STREAM_ROUTES['team-chat'],
      refreshTargets: ['team-room-list', 'team-room-detail', 'unread-badge'],
      soundIntent: 'none',
      legacySources: TEAM_CHAT_LEGACY_SOURCES,
      note: 'Fallback invalidation event for broad team-chat changes.',
    },
  ] as const;

export function getKolamChatLiveEventContracts(
  stream?: KolamChatLiveStreamKind,
): KolamChatLiveEventContract[] {
  if (!stream) return [...KOLAM_CHAT_LIVE_EVENT_CONTRACTS];
  return KOLAM_CHAT_LIVE_EVENT_CONTRACTS.filter(
    contract => contract.stream === stream,
  );
}

export function findKolamChatLiveEventContract(
  stream: KolamChatLiveStreamKind,
  eventName: string,
): KolamChatLiveEventContract | undefined {
  return KOLAM_CHAT_LIVE_EVENT_CONTRACTS.find(
    contract =>
      contract.stream === stream && contract.eventName === eventName,
  );
}
