import type {KolamChatLiveClassification} from './kolam-chat-live-classifier';
import type {KolamChatLiveStreamKind} from './kolam-chat-live-contract';

export type KolamChatDesktopToastRequest = {
  body: string;
  stream: KolamChatLiveStreamKind;
  tag: string;
  targetId: string;
  title: string;
};

const HANDOFF_REASON_LABELS: Record<string, string> = {
  explicit_request: 'Pembeli minta CS',
  payment_proof: 'Bukti pembayaran',
  image: 'Gambar perlu CS',
  low_confidence: 'AI kurang yakin',
  policy: 'Kebijakan CS',
  unknown: 'Perlu bantuan CS',
};

const LIVE_ALERT_CLAIM_TTL_MS = 2_000;
const liveAlertClaims = new Map<string, number>();

export function tryClaimKolamChatLiveAlert({
  nowMs = Date.now(),
  stream,
  targetId,
  ttlMs = LIVE_ALERT_CLAIM_TTL_MS,
}: {
  nowMs?: number;
  stream: KolamChatLiveStreamKind;
  targetId?: string;
  ttlMs?: number;
}) {
  const id = targetId?.trim();
  if (!id) {
    return false;
  }

  const key = `${stream}:${id}`;
  const previous = liveAlertClaims.get(key);
  if (previous != null && nowMs - previous < ttlMs) {
    return false;
  }

  liveAlertClaims.set(key, nowMs);
  return true;
}

export function resolveKolamChatDesktopToast({
  classification,
  currentUserId,
  payload,
}: {
  classification: Pick<
    KolamChatLiveClassification,
    'eventName' | 'soundIntent' | 'stream' | 'targetId'
  >;
  currentUserId?: string | null;
  payload: unknown;
}): KolamChatDesktopToastRequest | null {
  if (classification.soundIntent === 'none' || !classification.targetId) {
    return null;
  }

  if (classification.eventName === 'conversation.ai_handoff') {
    return resolveHandoffToast(classification.stream, classification.targetId, payload);
  }

  if (classification.stream === 'team-chat') {
    if (classification.eventName !== 'message.created') {
      return null;
    }

    return resolveTeamMessageToast(
      classification.targetId,
      payload,
      currentUserId,
    );
  }

  if (classification.eventName === 'conversation.updated') {
    return resolveInboxConversationUpdatedToast(
      classification.targetId,
      payload,
    );
  }

  if (classification.eventName !== 'message.created') {
    return null;
  }

  return resolveInboxMessageToast(classification.targetId, payload);
}

export type KolamChatUnreadInboxToastSource = {
  _id?: string;
  contactId?: unknown;
  lastMessageAt?: string | null;
  lastMessageDirection?: string;
  lastMessagePreview?: string;
  lastMessageType?: string;
  platform?: string;
  unreadCount?: number;
};

export type KolamChatUnreadTeamToastSource = {
  _id?: string;
  lastMessageAt?: string | null;
  lastMessagePreview?: string;
  name?: string;
  unreadCount?: number;
};

export function resolveKolamChatDesktopToastFromInboxConversation(
  conversation: KolamChatUnreadInboxToastSource,
): KolamChatDesktopToastRequest | null {
  const conversationId = readText(conversation._id);
  if (!conversationId) {
    return null;
  }

  const sender =
    readInboxContactName(conversation.contactId) ||
    (conversation.lastMessageDirection === 'in' ? 'Customer' : '');
  const platform = formatInboxToastPlatform(readText(conversation.platform));
  const title = [platform, sender].filter(Boolean).join(' · ') || 'Inbox';
  const body =
    clipPreview(readText(conversation.lastMessagePreview)) ||
    resolveUnreadTypePreview(conversation.lastMessageType) ||
    'Pesan baru';

  return {
    body,
    stream: 'inbox',
    tag: `chat-${conversationId}`,
    targetId: conversationId,
    title,
  };
}

export function resolveKolamChatDesktopToastFromUnreadInbox(
  conversations: KolamChatUnreadInboxToastSource[],
): KolamChatDesktopToastRequest | null {
  const conversation = pickLatestUnreadInboxConversation(conversations);
  return conversation
    ? resolveKolamChatDesktopToastFromInboxConversation(conversation)
    : null;
}

export function resolveKolamChatDesktopToastFromUnreadTeam(
  rooms: KolamChatUnreadTeamToastSource[],
): KolamChatDesktopToastRequest | null {
  const room = pickLatestUnreadTeamRoom(rooms);
  if (!room?._id) {
    return null;
  }

  const body = clipPreview(readText(room.lastMessagePreview));
  if (!body) {
    return null;
  }

  return {
    body,
    stream: 'team-chat',
    tag: `team-${room._id}`,
    targetId: room._id,
    title: readText(room.name) || 'Team Chat',
  };
}

function pickLatestUnreadInboxConversation(
  conversations: KolamChatUnreadInboxToastSource[],
) {
  return conversations
    .filter(conversation => (conversation.unreadCount ?? 0) > 0 && conversation._id)
    .sort((left, right) => {
      const leftAt = Date.parse(String(left.lastMessageAt || '')) || 0;
      const rightAt = Date.parse(String(right.lastMessageAt || '')) || 0;
      return rightAt - leftAt;
    })[0];
}

function pickLatestUnreadTeamRoom(rooms: KolamChatUnreadTeamToastSource[]) {
  return rooms
    .filter(room => (room.unreadCount ?? 0) > 0 && room._id)
    .sort((left, right) => {
      const leftAt = Date.parse(String(left.lastMessageAt || '')) || 0;
      const rightAt = Date.parse(String(right.lastMessageAt || '')) || 0;
      return rightAt - leftAt;
    })[0];
}

function readInboxContactName(value: unknown) {
  const contact = asRecord(value);
  if (!contact) {
    return '';
  }

  const linked = asRecord(contact.linkedCustomerId);
  return (
    readText(contact.displayName) ||
    readText(linked?.name) ||
    ''
  );
}

function resolveUnreadTypePreview(type: unknown) {
  const normalized = readText(type);
  if (!normalized || normalized === 'text') {
    return '';
  }

  return `[${normalized}]`;
}

function resolveInboxConversationUpdatedToast(
  conversationId: string,
  payload: unknown,
): KolamChatDesktopToastRequest | null {
  const record = asRecord(payload);
  const preview =
    clipPreview(readText(record?.lastMessagePreview)) ||
    resolveUnreadTypePreview(record?.lastMessageType) ||
    'Pesan baru';
  const sender =
    readInboxContactName(record?.contactId) ||
    resolveInboxToastSenderName({
      senderName: record?.senderName,
      senderType: record?.senderType,
    });
  const platform = formatInboxToastPlatform(readText(record?.platform));
  const titled = [platform, sender].filter(Boolean).join(' · ');

  return {
    body: titled ? preview : platform || sender || 'Inbox',
    stream: 'inbox',
    tag: `chat-${conversationId}`,
    targetId: conversationId,
    title: titled || preview,
  };
}

function resolveInboxMessageToast(
  conversationId: string,
  payload: unknown,
): KolamChatDesktopToastRequest | null {
  const record = asRecord(payload);
  const message = asRecord(record?.message);
  const sender = resolveInboxToastSenderName(message);
  const platform = formatInboxToastPlatform(
    readText(message?.platform) || readText(record?.platform),
  );
  const title = [platform, sender].filter(Boolean).join(' · ') || 'Inbox';
  const body =
    (message ? resolveInboxPreview(message) : '') ||
    clipPreview(readText(record?.lastMessagePreview)) ||
    'Pesan baru';

  return {
    body,
    stream: 'inbox',
    tag: `chat-${conversationId}`,
    targetId: conversationId,
    title,
  };
}

function resolveInboxToastSenderName(message?: Record<string, unknown>) {
  if (!message) {
    return '';
  }

  const senderType = readText(message.senderType).toLowerCase();
  const senderName = readText(message.senderName);
  if (
    senderType === 'ai_agent' ||
    senderType === 'system' ||
    senderName.toLowerCase() === 'system' ||
    senderName.toLowerCase() === 'ai assistant'
  ) {
    return 'DARA';
  }

  if (senderName) {
    return senderName;
  }

  return senderType === 'buyer' ? 'Customer' : '';
}

function formatInboxToastPlatform(platform: string) {
  const normalized = platform.trim().toLowerCase();
  if (normalized === 'tokopedia') {
    return 'Tokopedia';
  }
  if (normalized === 'shopee') {
    return 'Shopee';
  }
  if (normalized === 'tiktok') {
    return 'TikTok';
  }
  if (normalized === 'whatsapp') {
    return 'WhatsApp';
  }
  if (normalized === 'instagram') {
    return 'Instagram';
  }
  if (normalized === 'store') {
    return 'Store';
  }
  return platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : '';
}

function resolveTeamMessageToast(
  roomId: string,
  payload: unknown,
  currentUserId?: string | null,
): KolamChatDesktopToastRequest | null {
  const record = asRecord(payload);
  const message = asRecord(record?.message);
  if (!message) {
    return null;
  }

  const senderId = resolveTeamSenderId(message.sender);
  if (currentUserId && senderId && senderId === String(currentUserId).trim()) {
    return null;
  }

  const title = resolveTeamSenderName(message) || 'Team Chat';
  const body = clipPreview(readText(message.body) || resolveInboxPreview(message));
  if (!body) {
    return null;
  }

  return {
    body,
    stream: 'team-chat',
    tag: `team-${roomId}`,
    targetId: roomId,
    title,
  };
}

function resolveHandoffToast(
  stream: KolamChatLiveStreamKind,
  conversationId: string,
  payload: unknown,
): KolamChatDesktopToastRequest | null {
  if (stream !== 'inbox') {
    return null;
  }

  const record = asRecord(payload);
  const reason = readText(record?.reason);
  const reasonLabel = HANDOFF_REASON_LABELS[reason] || 'Perlu bantuan CS';
  const buyerPreview = clipPreview(readText(record?.buyerPreview));
  const body = buyerPreview ? `${reasonLabel} — ${buyerPreview}` : reasonLabel;

  return {
    body,
    stream: 'inbox',
    tag: `handoff-${conversationId}`,
    targetId: conversationId,
    title: 'Butuh handover',
  };
}

function resolveInboxPreview(message: Record<string, unknown>) {
  const content = asRecord(message.content);
  if (!content) {
    return clipPreview(readText(message.body) || readText(message.text));
  }

  const text = clipPreview(readText(content.text));
  if (text) {
    return text;
  }

  const type = readText(content.type);
  if (type && type !== 'text') {
    return `[${type}]`;
  }

  return '';
}

function resolveTeamSenderName(message: Record<string, unknown>) {
  const sender = asRecord(message.sender);
  if (!sender) {
    return readText(message.botName) || readText(message.senderName);
  }

  const fullName = [readText(sender.first_name), readText(sender.last_name)]
    .filter(Boolean)
    .join(' ')
    .trim();
  return (
    fullName ||
    readText(sender.username) ||
    readText(sender.email) ||
    readText(message.botName) ||
    ''
  );
}

function resolveTeamSenderId(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim();
  }

  const record = asRecord(value);
  const id = record?._id ?? record?.id;
  return typeof id === 'string' || typeof id === 'number'
    ? String(id).trim()
    : '';
}

function asRecord(value: unknown) {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : undefined;
}

function readText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function clipPreview(value: string) {
  return value.length > 120 ? value.slice(0, 120) : value;
}
