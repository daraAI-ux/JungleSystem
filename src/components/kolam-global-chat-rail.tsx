import React from 'react';
import {
  Animated,
  Image,
  Linking,
  Modal,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputKeyPressEventData,
  useWindowDimensions,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import { KOLAM_CALL_ICON_SVG } from '../assets/icons/call-icon-svg';
import { KOLAM_DELETE_ROOM_ICON_SVG } from '../assets/icons/delete-room-icon-svg';
import { classifyKolamChatLiveEvent } from '../domain/kolam-chat-live-classifier';
import { resolveKolamTeamChatBotAvatarRawUrl } from '../domain/kolam-team-chat-bot-display';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  type KolamChatLiveEvent,
  type KolamChatLiveStreamStatus,
  useKolamChatLiveStream,
} from '../hooks/use-kolam-chat-live-stream';
import {
  type KolamChatRailDetailMessage,
  useKolamChatRailDetail,
} from '../hooks/use-kolam-chat-rail-detail';
import { useKolamChatPlatformHealth } from '../hooks/use-kolam-chat-platform-health';
import { useKolamChatRailLiveSync } from '../hooks/use-kolam-chat-rail-live-sync';
import { useKolamChatRailReadonlyData } from '../hooks/use-kolam-chat-rail-readonly-data';
import { useKolamNotificationSoundSettings } from '../hooks/use-kolam-notification-sound-settings';
import { getKolamFileUrl } from '../lib/file-url';
import { formatRupiah } from '../lib/money';
import type {
  KolamChatAnalytics,
  KolamChatContactDetails,
  KolamChatContactOrder,
  KolamChatHandoverNote,
  KolamChatLabel,
  KolamChatConversationListParams,
  KolamChatConversationStatus,
  KolamChatMarketplaceListingHit,
  KolamChatPlatform,
  KolamChatPlatformHealthRow,
  KolamChatMessage,
  KolamChatStaffRef,
  KolamChatTemplate,
  KolamTeamChatAttachment,
  KolamTeamChatBotPresence,
  KolamTeamChatCallParticipant,
  KolamTeamChatCreateRoomCategory,
  KolamTeamChatEmbed,
  KolamTeamChatLinkPreview,
  KolamTeamChatPresence,
  KolamTeamChatReplyPreview,
  KolamTeamChatUserRef,
  KolamTeamChatRoomCategory,
  KolamUserPickerRow,
} from '../services/kolam-api';
import {
  createKolamChatLabel,
  createKolamTeamChatRoom,
  deleteKolamChatLabel,
  deleteKolamTeamChatRoom,
  getKolamChatAnalytics,
  getKolamChatContactDetails,
  getKolamChatLabels,
  getKolamChatTemplates,
  getKolamWebSetting,
  getKolamUserPickerRows,
  openKolamTeamChatDirect,
  searchKolamChatMarketplaceListings,
  updateKolamChatLabel,
} from '../services/kolam-api';
import { createKolamNotificationSoundService } from '../services/kolam-notification-sound-service';
import { createKolamRuntimeNotificationSoundAdapter } from '../services/kolam-notification-sound-runtime';
import { fetchKolamShippingDeliveryStats } from '../services/kolam-dara-shipping-copilot-api';
import {
  pickNativeAssetFile,
  pickNativeImageFile,
  type NativeImagePickerResult,
} from '../services/native-file-picker';
import { KolamBadge } from './kolam-badge';
import { KolamConfirmDialog } from './kolam-confirm-dialog';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamHoverTooltip } from './kolam-hover-tooltip';
import { KolamIconButton } from './kolam-icon-button';
import { KolamMappedList } from './kolam-mapped-list';
import { openKolamMediaPreview } from './kolam-media-preview-dialog';
import { KolamModalDialog } from './kolam-modal-dialog';
import { KolamModalBackdrop } from './kolam-modal-backdrop';
import { KolamNotesField } from './kolam-notes-field';
import { KolamPressable } from './kolam-pressable';
import { KolamProfileAvatarContent } from './kolam-profile-avatar-content';
import { KolamResetButton } from './kolam-reset-button';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamStatusIndicatorIcon } from './kolam-status-indicator-icon';
import { KolamTopNavigationChatIcon } from './kolam-top-navigation-chat-icon';
import {
  resolveProfilePhotoUrl,
  type SignedInUser,
} from '../services/auth-api';

export type KolamGlobalChatRailMode = 'inbox' | 'team-chat';
type KolamChatRailInboxAssignmentFilter = 'all' | 'assigned' | 'unassigned';

const TEAM_CHAT_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
const CHAT_COMPOSER_EMOJIS = [
  '🙂',
  '👍',
  '🙏',
  '😊',
  '😂',
  '❤️',
  '🔥',
  '✅',
  '🙌',
  '😅',
  '👌',
  '🎉',
];
const INBOX_PLATFORM_FILTERS: Array<KolamChatPlatform | 'all'> = [
  'all',
  'store',
  'tokopedia',
  'shopee',
  'tiktok',
  'whatsapp',
  'instagram',
];
const INBOX_STATUS_FILTERS: Array<KolamChatConversationStatus | 'all'> = [
  'open',
  'closed',
  'all',
];
const INBOX_ASSIGNMENT_FILTERS: KolamChatRailInboxAssignmentFilter[] = [
  'all',
  'assigned',
  'unassigned',
];
const SHOPEE_LOGO = require('../assets/marketplace/shopee.jpg');
const TIKTOK_LOGO = require('../assets/marketplace/tiktok.webp');
const TOKOPEDIA_LOGO = require('../assets/marketplace/tokopedia.png');
const WHATSAPP_LOGO = require('../assets/marketplace/whatsapp.png');
const DARA_AVATAR_DEFAULT_PATH = '/images/dara-avatar.png';
const DARA_THINKING_DEFAULT_LINE = 'DARA sedang berpikir...';
const PLATFORM_GLOW_HEALTHY: KolamPlatformGlowState = {
  animated: false,
  color: '#19b66a',
  opacity: 0.28,
  scale: 1,
  tone: 'healthy',
};
const PLATFORM_GLOW_ACTIVE: KolamPlatformGlowState = {
  animated: true,
  color: '#16a34a',
  opacity: 0.48,
  scale: 1.2,
  tone: 'active',
};
const PLATFORM_GLOW_STARTING: KolamPlatformGlowState = {
  animated: true,
  color: '#f59e0b',
  opacity: 0.35,
  scale: 1.12,
  tone: 'starting',
};
const PLATFORM_GLOW_STALE: KolamPlatformGlowState = {
  animated: false,
  color: '#f97316',
  opacity: 0.26,
  scale: 1,
  tone: 'stale',
};
const PLATFORM_GLOW_DOWN: KolamPlatformGlowState = {
  animated: false,
  color: '#ef4444',
  opacity: 0.36,
  scale: 1,
  tone: 'down',
};
const PLATFORM_GLOW_OFFLINE: KolamPlatformGlowState = {
  animated: false,
  color: '#9ca3af',
  opacity: 0,
  scale: 1,
  tone: 'offline',
};
const PLATFORM_GLOW_NEUTRAL: KolamPlatformGlowState = {
  animated: false,
  color: 'transparent',
  opacity: 0,
  scale: 1,
  tone: 'neutral',
};
const PLATFORM_GLOW_UNKNOWN: KolamPlatformGlowState = {
  animated: false,
  color: 'transparent',
  opacity: 0,
  scale: 1,
  tone: 'unknown',
};
const DARA_THINKING_ACTIVE_EVENTS = new Set([
  'dara.thinking',
  'dara.thinking.chunk',
]);
const DARA_THINKING_DONE_EVENTS = new Set(['dara.thinking.done']);
const CHAT_ADMIN_ROLE_KEYS = new Set([
  'super_admin',
  'super_administrator',
  'super-admin',
  'superadministrator',
  'admin',
  'administrator',
]);
const CHAT_LIVE_STALE_MS = 15_000;
const CHAT_LIVE_FALLBACK_INTERVAL_MS = 5_000;
interface KolamChatRailAnalyticsState {
  data: KolamChatAnalytics | null;
  errorMessage?: string;
  loading: boolean;
}

interface KolamChatRailLabelsState {
  errorMessage?: string;
  items: KolamChatLabel[];
  loading: boolean;
}

interface KolamChatRailTemplatesState {
  errorMessage?: string;
  items: KolamChatTemplate[];
  loading: boolean;
}

interface KolamChatRailMarketplacePickerState {
  errorMessage?: string;
  items: KolamChatMarketplaceListingHit[];
  loading: boolean;
}

interface KolamChatRailContactDetailsState {
  data: KolamChatContactDetails | null;
  errorMessage?: string;
  loading: boolean;
}

interface KolamChatRailDaraAvatarState {
  imageUrl: string | null;
  katakTerbangImageUrl: string | null;
  rajaAnemonImageUrl: string | null;
  pangeranIsopodImageUrl: string | null;
}

interface KolamInboxComposerAccess {
  blockedReason: string | null;
  disabled: boolean;
  lockedBy: string | null;
}

interface KolamTeamChatCreateRoomDraft {
  category: KolamTeamChatCreateRoomCategory;
  description: string;
  name: string;
}

interface KolamTeamChatDirectState {
  busyTarget?: string;
  errorMessage?: string;
  loading: boolean;
  message?: string;
  open: boolean;
  search: string;
  users: KolamUserPickerRow[];
}

interface KolamTeamMentionOption {
  id: string;
  isAi?: boolean;
  label: string;
  username: string;
}

interface KolamChatRailReplyTarget {
  author: string;
  body: string;
  id: string;
}

interface KolamChatRailInboxFilter {
  assignment: KolamChatRailInboxAssignmentFilter;
  labelId: string;
  platform: KolamChatPlatform | 'all';
  search: string;
  status: KolamChatConversationStatus | 'all';
}

interface KolamChatRailItem {
  assignedStaff?: KolamChatStaffRef | string | null;
  handledByDara?: boolean;
  id: string;
  labels?: KolamChatLabel[];
  metaLabel: string;
  platform?: KolamChatPlatform;
  preview: string;
  secondaryMetaLabel?: string;
  teamRoomCategory?: KolamTeamChatRoomCategory | string;
  timeLabel: string;
  title: string;
  unreadCount: number;
}

type KolamTeamMentionTextPart =
  | { type: 'text'; value: string }
  | { type: 'mention'; raw: string; username: string };

interface KolamDaraThinkingLiveSignal {
  key: number;
  line: string;
  roomId: string;
  state: 'active' | 'done';
}

type KolamDaraThinkingLivePatch = Omit<KolamDaraThinkingLiveSignal, 'key'>;

function normalizeDaraAvatarPath(value?: string | null) {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return '';
  }

  return raw.startsWith('/') ? raw : `/${raw}`;
}

function readStringField(
  record: Record<string, unknown> | null | undefined,
  key: string,
) {
  const value = record?.[key];
  return typeof value === 'string' ? value : '';
}

function resolveDaraAvatarImageUrl(
  stored?: string | null,
  katakTerbangWorkerPhotoUrl?: string | null,
) {
  const dara = normalizeDaraAvatarPath(stored);
  const bot = normalizeDaraAvatarPath(katakTerbangWorkerPhotoUrl);
  const path =
    dara && dara.includes('/media/katak-terbang/')
      ? DARA_AVATAR_DEFAULT_PATH
      : dara && dara.includes('/media/dara/')
      ? dara
      : dara && bot && dara === bot
      ? DARA_AVATAR_DEFAULT_PATH
      : dara || DARA_AVATAR_DEFAULT_PATH;

  return getKolamFileUrl(path) ?? path;
}

function resolveBotAvatarImageUrl(stored?: string | null) {
  const path = normalizeDaraAvatarPath(stored);
  return path ? getKolamFileUrl(path) ?? path : null;
}

function resolveKatakTerbangAvatarImageUrl(stored?: string | null) {
  return resolveBotAvatarImageUrl(stored);
}

export function KolamGlobalChatRail({
  initialSelectedId,
  mode,
  onClose,
}: {
  initialSelectedId?: string | null;
  mode: KolamGlobalChatRailMode;
  onClose: () => void;
}) {
  const { authUser } = useKolamAuthContext();
  const content = getChatRailContent(mode);
  const [inboxFilter, setInboxFilter] =
    React.useState<KolamChatRailInboxFilter>({
      assignment: 'all',
      labelId: 'all',
      platform: 'all',
      search: '',
      status: 'all',
    });
  const [healthMenuOpen, setHealthMenuOpen] = React.useState(false);
  const [analyticsMenuOpen, setAnalyticsMenuOpen] = React.useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = React.useState(false);
  const [labelsManagerOpen, setLabelsManagerOpen] = React.useState(false);
  const [daraHeaderMenuOpen, setDaraHeaderMenuOpen] = React.useState(false);
  const [daraWindowRoomId, setDaraWindowRoomId] = React.useState<string | null>(
    null,
  );
  const [daraWindowBusy, setDaraWindowBusy] = React.useState(false);
  const [daraWindowError, setDaraWindowError] = React.useState<
    string | undefined
  >();
  const [daraComposerText, setDaraComposerText] = React.useState('');
  const [daraPendingAttachment, setDaraPendingAttachment] =
    React.useState<NativeImagePickerResult | null>(null);
  const [daraEmojiPickerOpen, setDaraEmojiPickerOpen] = React.useState(false);
  const inboxParams = React.useMemo(
    () => buildInboxListParams(inboxFilter),
    [inboxFilter],
  );
  const data = useKolamChatRailReadonlyData({ inboxParams, mode });
  const platformHealth = useKolamChatPlatformHealth({
    enabled: mode === 'inbox',
  });
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(
    null,
  );
  const [composerText, setComposerText] = React.useState('');
  const [pendingAttachment, setPendingAttachment] =
    React.useState<NativeImagePickerResult | null>(null);
  const [replyTarget, setReplyTarget] =
    React.useState<KolamChatRailReplyTarget | null>(null);
  const [deleteRoomState, setDeleteRoomState] = React.useState<{
    busy: boolean;
    errorMessage?: string;
    target: KolamChatRailItem | null;
  }>({
    busy: false,
    target: null,
  });
  const [daraThinkingLiveSignal, setDaraThinkingLiveSignal] =
    React.useState<KolamDaraThinkingLiveSignal | null>(null);
  const daraThinkingSignalKeyRef = React.useRef(0);
  const [liveStatus, setLiveStatus] =
    React.useState<KolamChatLiveStreamStatus>('idle');
  const [liveLastEventAt, setLiveLastEventAt] = React.useState<number | null>(
    null,
  );
  const [analyticsState, setAnalyticsState] =
    React.useState<KolamChatRailAnalyticsState>({
      data: null,
      loading: mode === 'inbox',
    });
  const [labelsState, setLabelsState] =
    React.useState<KolamChatRailLabelsState>({
      items: [],
      loading: mode === 'inbox',
    });
  const [daraAvatarState, setDaraAvatarState] =
    React.useState<KolamChatRailDaraAvatarState>(() => ({
      imageUrl: resolveDaraAvatarImageUrl(),
      katakTerbangImageUrl: null,
      rajaAnemonImageUrl: null,
      pangeranIsopodImageUrl: null,
    }));
  const items = getChatRailItems(
    mode,
    data,
    inboxFilter.assignment,
    labelsState.items,
  );
  const normalizedInitialSelectedId = initialSelectedId?.trim() || null;
  const [templatesState, setTemplatesState] =
    React.useState<KolamChatRailTemplatesState>({
      items: [],
      loading: mode === 'inbox',
    });
  const [createRoomOpen, setCreateRoomOpen] = React.useState(false);
  const [createRoomDraft, setCreateRoomDraft] =
    React.useState<KolamTeamChatCreateRoomDraft>({
      category: 'meeting',
      description: '',
      name: '',
    });
  const [createRoomBusy, setCreateRoomBusy] = React.useState(false);
  const [createRoomMessage, setCreateRoomMessage] = React.useState<
    string | undefined
  >();
  const [createRoomError, setCreateRoomError] = React.useState<
    string | undefined
  >();
  const [directState, setDirectState] =
    React.useState<KolamTeamChatDirectState>({
      loading: false,
      open: false,
      search: '',
      users: [],
    });
  const currentUserId = authUser?.id;
  const inboxCanReply = canSignedInUserReplyCustomerChat(authUser);
  const canCreateRoom = canCreateTeamChatRoom(authUser);
  const selectedItem = items.find(item => item.id === selectedItemId) ?? null;
  const detail = useKolamChatRailDetail({
    currentUserId,
    mode,
    selectedId: selectedItemId,
  });
  const daraWindowDetail = useKolamChatRailDetail({
    currentUserId,
    mode: 'team-chat',
    selectedId:
      mode === 'team-chat' && daraHeaderMenuOpen ? daraWindowRoomId : null,
  });
  const { syncFromLiveClassification } = useKolamChatRailLiveSync({
    refreshDetail: detail.refresh,
    refreshList: data.refresh,
  });
  const soundSettings = useKolamNotificationSoundSettings();
  const notificationSoundService = React.useMemo(
    () =>
      createKolamNotificationSoundService({
        adapter: createKolamRuntimeNotificationSoundAdapter(),
      }),
    [],
  );
  const detailOpen = selectedItem !== null;
  const handleBackToList = React.useCallback(() => {
    setSelectedItemId(null);
    setComposerText('');
    setPendingAttachment(null);
    setReplyTarget(null);
  }, []);
  const handleRequestDeleteTeamRoom = React.useCallback(
    (item: KolamChatRailItem) => {
      if (mode !== 'team-chat' || !canDeleteTeamChatRoom(item)) {
        return;
      }

      setDeleteRoomState({
        busy: false,
        errorMessage: undefined,
        target: item,
      });
    },
    [mode],
  );

  const handleCancelDeleteTeamRoom = React.useCallback(() => {
    if (deleteRoomState.busy) {
      return;
    }

    setDeleteRoomState({
      busy: false,
      target: null,
    });
  }, [deleteRoomState.busy]);

  const handleConfirmDeleteTeamRoom = React.useCallback(async () => {
    const item = deleteRoomState.target;
    if (
      deleteRoomState.busy ||
      mode !== 'team-chat' ||
      !item ||
      !canDeleteTeamChatRoom(item)
    ) {
      return;
    }

    setDeleteRoomState({
      busy: true,
      errorMessage: undefined,
      target: item,
    });

    try {
      await deleteKolamTeamChatRoom(item.id);
      if (selectedItemId === item.id) {
        handleBackToList();
      }
      await data.refresh();
      setDeleteRoomState({ busy: false, target: null });
    } catch (error) {
      setDeleteRoomState({
        busy: false,
        errorMessage:
          error instanceof Error ? error.message : 'Room gagal dihapus.',
        target: item,
      });
    }
  }, [
    data,
    deleteRoomState.busy,
    deleteRoomState.target,
    handleBackToList,
    mode,
    selectedItemId,
  ]);

  const handleDeleteTeamRoomConfirmPress = React.useCallback(() => {
    void handleConfirmDeleteTeamRoom();
  }, [handleConfirmDeleteTeamRoom]);

  const deleteRoomDialogMessage = React.useMemo(() => {
    const title = deleteRoomState.target?.title ?? 'room ini';
    const baseMessage = `Yakin ingin menghapus room "${title}"? Semua pesan di room ini ikut terhapus permanen.`;

    return deleteRoomState.errorMessage
      ? `${baseMessage}\n\n${deleteRoomState.errorMessage}`
      : baseMessage;
  }, [deleteRoomState.errorMessage, deleteRoomState.target?.title]);

  const deleteRoomDialogTitle = 'Hapus room team chat?';
  const handleLiveStatusChange = React.useCallback(
    (status: KolamChatLiveStreamStatus) => {
      setLiveStatus(status);
      if (status === 'open') {
        setLiveLastEventAt(Date.now());
      }
    },
    [],
  );
  const handleLiveEvent = React.useCallback(
    (event: KolamChatLiveEvent) => {
      setLiveLastEventAt(Date.now());
      const classification = classifyKolamChatLiveEvent(event, {
        currentUserId,
        selectedItemId,
      });
      const daraThinkingPatch = getDaraThinkingLivePatch(event, selectedItemId);

      syncFromLiveClassification(classification);

      if (daraThinkingPatch) {
        daraThinkingSignalKeyRef.current += 1;
        setDaraThinkingLiveSignal({
          ...daraThinkingPatch,
          key: daraThinkingSignalKeyRef.current,
        });
      }

      if (
        classification.refreshPresence &&
        classification.targetId === selectedItemId
      ) {
        const presence = getTeamChatPresenceFromLiveEvent(event);
        if (presence) {
          detail.updatePresenceFromLive(presence);
        }
      }

      const inboxMessageCreated = getInboxMessageCreatedFromLiveEvent(event);
      if (
        inboxMessageCreated &&
        mode === 'inbox' &&
        classification.targetId === selectedItemId
      ) {
        detail.upsertInboxMessageFromLive(inboxMessageCreated);
      }

      const inboxMessagePatch = getInboxMessagePatchFromLiveEvent(event);
      if (
        inboxMessagePatch &&
        mode === 'inbox' &&
        (!classification.targetId || classification.targetId === selectedItemId)
      ) {
        detail.patchInboxMessageFromLive(
          inboxMessagePatch.messageId,
          inboxMessagePatch.patch,
        );
      }

      if (
        classification.refreshCallState &&
        classification.targetId === selectedItemId
      ) {
        void detail.refreshCall();
      }

      Promise.resolve(
        notificationSoundService.play({
          intent: classification.soundIntent,
          webSetting: soundSettings.webSetting,
        }),
      ).catch(() => undefined);
    },
    [
      currentUserId,
      detail,
      mode,
      notificationSoundService,
      selectedItemId,
      soundSettings.webSetting,
      syncFromLiveClassification,
    ],
  );

  React.useEffect(() => {
    const runFallbackRefresh = () => {
      Promise.resolve(data.refresh()).catch(() => undefined);
      if (selectedItemId) {
        Promise.resolve(detail.refresh({ quiet: true })).catch(() => undefined);
      }
    };
    const isLiveStale = () =>
      liveStatus !== 'open' ||
      liveLastEventAt === null ||
      Date.now() - liveLastEventAt > CHAT_LIVE_STALE_MS;

    const timer = setInterval(() => {
      if (isLiveStale()) {
        runFallbackRefresh();
      }
    }, CHAT_LIVE_FALLBACK_INTERVAL_MS);
    (timer as { unref?: () => void }).unref?.();

    return () => {
      clearInterval(timer);
    };
  }, [
    data.refresh,
    detail.refresh,
    liveLastEventAt,
    liveStatus,
    selectedItemId,
  ]);

  React.useEffect(() => {
    setSelectedItemId(null);
    setComposerText('');
    setPendingAttachment(null);
    setReplyTarget(null);
    setDaraThinkingLiveSignal(null);
    setLabelsManagerOpen(false);
    setCreateRoomOpen(false);
    setCreateRoomDraft({ category: 'meeting', description: '', name: '' });
    setCreateRoomBusy(false);
    setCreateRoomMessage(undefined);
    setCreateRoomError(undefined);
    setDirectState({
      loading: false,
      open: false,
      search: '',
      users: [],
    });
  }, [mode]);

  React.useEffect(() => {
    if (mode !== 'inbox') {
      setAnalyticsState({ data: null, loading: false });
      return;
    }

    let active = true;
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 30);

    setAnalyticsState(current => ({
      data: current.data,
      loading: true,
    }));

    getKolamChatAnalytics({
      from: from.toISOString(),
      to: to.toISOString(),
    })
      .then(data => {
        if (active) {
          setAnalyticsState({ data, loading: false });
        }
      })
      .catch(error => {
        if (active) {
          setAnalyticsState({
            data: null,
            errorMessage:
              error instanceof Error
                ? error.message
                : 'Analisa chat belum bisa dibaca.',
            loading: false,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [mode]);

  React.useEffect(() => {
    if (mode !== 'inbox') {
      setLabelsState({ items: [], loading: false });
      return;
    }

    let active = true;
    setLabelsState(current => ({
      items: current.items,
      loading: true,
    }));

    getKolamChatLabels()
      .then(items => {
        if (active) {
          setLabelsState({ items, loading: false });
        }
      })
      .catch(error => {
        if (active) {
          setLabelsState({
            errorMessage:
              error instanceof Error
                ? error.message
                : 'Label chat belum bisa dibaca.',
            items: [],
            loading: false,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [mode]);

  React.useEffect(() => {
    if (mode !== 'inbox') {
      setTemplatesState({ items: [], loading: false });
      return;
    }

    let active = true;
    setTemplatesState(current => ({
      items: current.items,
      loading: true,
    }));

    getKolamChatTemplates()
      .then(items => {
        if (active) {
          setTemplatesState({ items, loading: false });
        }
      })
      .catch(error => {
        if (active) {
          setTemplatesState({
            errorMessage:
              error instanceof Error
                ? error.message
                : 'Template chat belum bisa dibaca.',
            items: [],
            loading: false,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [mode]);

  React.useEffect(() => {
    let active = true;
    getKolamWebSetting()
      .then(async webSetting => {
        const stats =
          mode === 'inbox'
            ? await fetchKolamShippingDeliveryStats('month').catch(() => null)
            : null;
        if (active) {
          const katakTerbangWorkerPhotoUrl = readStringField(
            webSetting,
            'katakTerbangWorkerPhotoUrl',
          );
          const katakTerbangProfilePhotoUrl =
            stats?.katakTerbangProfile.photoUrl || '';
          setDaraAvatarState({
            imageUrl: resolveDaraAvatarImageUrl(
              readStringField(webSetting, 'daraAvatarUrl'),
              katakTerbangWorkerPhotoUrl,
            ),
            katakTerbangImageUrl: resolveKatakTerbangAvatarImageUrl(
              katakTerbangProfilePhotoUrl || katakTerbangWorkerPhotoUrl,
            ),
            rajaAnemonImageUrl: resolveBotAvatarImageUrl(
              readStringField(webSetting, 'rajaAnemonWorkerPhotoUrl'),
            ),
            pangeranIsopodImageUrl: resolveBotAvatarImageUrl(
              readStringField(webSetting, 'pangeranIsopodWorkerPhotoUrl'),
            ),
          });
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [mode]);

  React.useEffect(() => {
    if (selectedItemId && !items.some(item => item.id === selectedItemId)) {
      setSelectedItemId(null);
      setComposerText('');
      setPendingAttachment(null);
      setReplyTarget(null);
    }
  }, [items, selectedItemId]);

  React.useEffect(() => {
    if (
      mode !== 'team-chat' ||
      !normalizedInitialSelectedId ||
      selectedItemId === normalizedInitialSelectedId ||
      !items.some(item => item.id === normalizedInitialSelectedId)
    ) {
      return;
    }

    setSelectedItemId(normalizedInitialSelectedId);
    setComposerText('');
    setPendingAttachment(null);
    setReplyTarget(null);
  }, [items, mode, normalizedInitialSelectedId, selectedItemId]);

  React.useEffect(() => {
    setReplyTarget(null);
  }, [selectedItemId]);

  const handleChooseAttachment = React.useCallback(async () => {
    if (detail.sending) {
      return;
    }

    if (mode === 'inbox') {
      const access = getInboxComposerAccess(
        detail.conversation,
        currentUserId,
        {
          csCanReply: inboxCanReply,
        },
      );
      const blocked = Boolean(
        access.disabled || access.blockedReason || access.lockedBy,
      );

      if (blocked) {
        return;
      }
    }

    const file =
      mode === 'inbox'
        ? await pickNativeImageFile()
        : await pickNativeAssetFile();
    if (!file.cancelled) {
      setPendingAttachment(file);
    }
  }, [currentUserId, detail.conversation, detail.sending, inboxCanReply, mode]);

  const handleSend = React.useCallback(async () => {
    const body = composerText.trim();
    if ((!body && !pendingAttachment) || detail.sending) {
      return;
    }

    const sendOptions = replyTarget
      ? { replyToMessageId: replyTarget.id }
      : undefined;

    if (pendingAttachment) {
      if (mode === 'inbox') {
        await detail.sendInboxImage(pendingAttachment, sendOptions);
      } else {
        if (sendOptions) {
          await detail.sendAttachment(pendingAttachment, body, sendOptions);
        } else {
          await detail.sendAttachment(pendingAttachment, body);
        }
      }
      setPendingAttachment(null);
      setReplyTarget(null);
      setComposerText('');
      detail.signalTyping(false);
      return;
    }

    if (sendOptions) {
      await detail.sendMessage(body, sendOptions);
    } else {
      await detail.sendMessage(body);
    }
    setReplyTarget(null);
    setComposerText('');
    detail.signalTyping(false);
  }, [composerText, detail, mode, pendingAttachment, replyTarget]);

  const handleComposerTextChange = React.useCallback(
    (value: string) => {
      setComposerText(value);
      detail.signalTyping(Boolean(value.trim()));
    },
    [detail],
  );

  const handleCreateRoom = React.useCallback(async () => {
    const name = createRoomDraft.name.trim();
    if (mode !== 'team-chat' || createRoomBusy || !name) {
      setCreateRoomError(name ? undefined : 'Nama room wajib diisi.');
      return;
    }

    setCreateRoomBusy(true);
    setCreateRoomError(undefined);
    setCreateRoomMessage(undefined);

    try {
      const room = await createKolamTeamChatRoom({
        category: createRoomDraft.category,
        description: createRoomDraft.description,
        name,
      });
      await data.refresh();
      setCreateRoomOpen(false);
      setCreateRoomDraft({ category: 'meeting', description: '', name: '' });
      setCreateRoomMessage(undefined);
      setSelectedItemId(room._id);
    } catch (error) {
      setCreateRoomError(
        error instanceof Error ? error.message : 'Room belum bisa dibuat.',
      );
    } finally {
      setCreateRoomBusy(false);
    }
  }, [createRoomBusy, createRoomDraft, data, mode]);

  React.useEffect(() => {
    if (mode !== 'team-chat' || !directState.open) {
      return;
    }

    let cancelled = false;
    const search = directState.search.trim();
    setDirectState(current => ({ ...current, loading: true }));

    const timer = setTimeout(() => {
      getKolamUserPickerRows(search)
        .then(users => {
          if (!cancelled) {
            setDirectState(current => ({
              ...current,
              loading: false,
              users,
            }));
          }
        })
        .catch(error => {
          if (!cancelled) {
            setDirectState(current => ({
              ...current,
              errorMessage:
                error instanceof Error
                  ? error.message
                  : 'Daftar staff belum bisa dimuat.',
              loading: false,
              users: [],
            }));
          }
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [directState.open, directState.search, mode]);

  const handleOpenDirect = React.useCallback(
    async (target: { dara?: boolean; user?: KolamUserPickerRow }) => {
      if (mode !== 'team-chat' || directState.busyTarget) {
        return;
      }

      const userId = target.user?._id;
      if (!target.dara && (!userId || userId === currentUserId)) {
        return;
      }

      const targetKey = target.dara ? 'dara' : userId;
      setDirectState(current => ({
        ...current,
        busyTarget: targetKey,
        errorMessage: undefined,
        message: undefined,
      }));

      try {
        const room = await openKolamTeamChatDirect(
          target.dara ? { dara: true } : { userId },
        );
        await data.refresh();
        setSelectedItemId(room._id);
        setDirectState(current => ({
          ...current,
          busyTarget: undefined,
          message: `Chat pribadi ${getRoomTitle(room)} siap.`,
          open: false,
        }));
      } catch (error) {
        setDirectState(current => ({
          ...current,
          busyTarget: undefined,
          errorMessage:
            error instanceof Error
              ? error.message
              : 'Chat pribadi belum bisa dibuka.',
        }));
      }
    },
    [currentUserId, data, directState.busyTarget, mode],
  );
  const handleEnsureDaraWindowRoom = React.useCallback(async () => {
    if (mode !== 'team-chat' || daraWindowBusy) {
      return;
    }

    if (daraWindowRoomId) {
      await daraWindowDetail.refresh();
      return;
    }

    setDaraWindowBusy(true);
    setDaraWindowError(undefined);

    try {
      const room = await openKolamTeamChatDirect({ dara: true });
      setDaraWindowRoomId(room._id);
      await data.refresh();
    } catch (error) {
      setDaraWindowError(
        error instanceof Error ? error.message : 'Chat DARA belum bisa dibuka.',
      );
    } finally {
      setDaraWindowBusy(false);
    }
  }, [daraWindowBusy, daraWindowDetail, daraWindowRoomId, data, mode]);
  const handleCloseDaraWindow = React.useCallback(() => {
    setDaraHeaderMenuOpen(false);
    setDaraComposerText('');
    setDaraPendingAttachment(null);
    setDaraEmojiPickerOpen(false);
    daraWindowDetail.signalTyping(false);
  }, [daraWindowDetail]);
  const handleDaraComposerTextChange = React.useCallback(
    (value: string) => {
      setDaraComposerText(value);
      daraWindowDetail.signalTyping(Boolean(value.trim()));
    },
    [daraWindowDetail],
  );
  const handleChooseDaraAttachment = React.useCallback(async () => {
    if (
      daraWindowBusy ||
      daraWindowDetail.loading ||
      daraWindowDetail.sending
    ) {
      return;
    }

    const file = await pickNativeAssetFile();
    if (!file.cancelled) {
      setDaraPendingAttachment(file);
    }
  }, [daraWindowBusy, daraWindowDetail.loading, daraWindowDetail.sending]);
  const handlePickDaraEmoji = React.useCallback(
    (emoji: string) => {
      const nextText = `${daraComposerText}${
        daraComposerText ? ' ' : ''
      }${emoji}`;
      setDaraComposerText(nextText);
      setDaraEmojiPickerOpen(false);
      daraWindowDetail.signalTyping(true);
    },
    [daraComposerText, daraWindowDetail],
  );
  const handleDaraWindowSend = React.useCallback(async () => {
    const body = daraComposerText.trim();

    if (
      (!body && !daraPendingAttachment) ||
      daraWindowBusy ||
      daraWindowDetail.loading ||
      daraWindowDetail.sending
    ) {
      return;
    }

    if (daraPendingAttachment) {
      await daraWindowDetail.sendAttachment(daraPendingAttachment, body);
      setDaraPendingAttachment(null);
      setDaraComposerText('');
      daraWindowDetail.signalTyping(false);
      return;
    }

    await daraWindowDetail.sendMessage(body);
    setDaraComposerText('');
    daraWindowDetail.signalTyping(false);
  }, [
    daraComposerText,
    daraPendingAttachment,
    daraWindowBusy,
    daraWindowDetail,
  ]);

  return (
    <>
      <View accessibilityLabel={content.accessibilityLabel} style={styles.rail}>
        <KolamChatRailLiveHost
          mode={mode}
          onEvent={handleLiveEvent}
          onStatusChange={handleLiveStatusChange}
        />
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <View style={styles.iconShell}>
              <KolamTopNavigationChatIcon kind={content.iconKind} />
            </View>
            <View style={styles.copyGroup}>
              <Text style={styles.eyebrow}>Chat</Text>
              <View style={styles.titleInlineRow}>
                <Text style={styles.title}>{content.title}</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerActionRow}>
            {mode === 'inbox' ? (
              <>
                <KolamChatHealthMenu
                  healthState={platformHealth}
                  open={healthMenuOpen}
                  onToggle={() => {
                    setAnalyticsMenuOpen(false);
                    setSettingsMenuOpen(false);
                    setHealthMenuOpen(current => !current);
                  }}
                />
                <KolamChatAnalyticsMenu
                  open={analyticsMenuOpen}
                  onToggle={() => {
                    setHealthMenuOpen(false);
                    setSettingsMenuOpen(false);
                    setAnalyticsMenuOpen(current => !current);
                  }}
                  state={analyticsState}
                />
                <KolamChatSettingsMenu
                  onOpenLabels={() => {
                    setSettingsMenuOpen(false);
                    setLabelsManagerOpen(true);
                  }}
                  onToggle={() => {
                    setAnalyticsMenuOpen(false);
                    setHealthMenuOpen(false);
                    setSettingsMenuOpen(current => !current);
                  }}
                  open={settingsMenuOpen}
                />
              </>
            ) : null}
            {mode === 'team-chat' ? (
              <>
                {canCreateRoom && !detailOpen ? (
                  <KolamIconButton
                    accessibilityLabel="Buat ruang baru"
                    onPress={() => {
                      setDaraHeaderMenuOpen(false);
                      setCreateRoomError(undefined);
                      setCreateRoomMessage(undefined);
                      setCreateRoomOpen(true);
                    }}
                    size={28}
                    radius="md"
                    variant="framed"
                  >
                    <KolamTeamChatAddRoomIcon />
                  </KolamIconButton>
                ) : null}
                <KolamTeamChatDaraHeaderMenu
                  busy={daraWindowBusy}
                  imageUrl={daraAvatarState.imageUrl}
                  onOpenWindow={() => {
                    if (daraHeaderMenuOpen) {
                      handleCloseDaraWindow();
                      return;
                    }
                    setDaraHeaderMenuOpen(true);
                    handleEnsureDaraWindowRoom().catch(() => undefined);
                  }}
                  open={daraHeaderMenuOpen}
                />
              </>
            ) : null}
            <KolamIconButton
              accessibilityLabel="Tutup panel chat"
              onPress={onClose}
              size={28}
              radius="full"
              variant="ghost"
            >
              <KolamStatusIndicatorIcon
                color={V.colors.mutedFg}
                kind="triangle-left"
              />
            </KolamIconButton>
          </View>
        </View>

        <View style={styles.body}>
          {mode === 'inbox' && !detailOpen ? (
            <KolamInboxFilterPanel
              filter={inboxFilter}
              labels={labelsState.items}
              onChange={setInboxFilter}
            />
          ) : null}

          {mode === 'team-chat' && canCreateRoom ? (
            <KolamTeamChatCreateRoomPanel
              busy={createRoomBusy}
              draft={createRoomDraft}
              errorMessage={createRoomError}
              message={createRoomMessage}
              onChange={setCreateRoomDraft}
              onSubmit={handleCreateRoom}
              onToggle={() => {
                setCreateRoomError(undefined);
                setCreateRoomMessage(undefined);
                setCreateRoomOpen(false);
              }}
              open={createRoomOpen}
            />
          ) : null}

          {mode === 'team-chat' && !detailOpen ? (
            <KolamTeamChatDirectPanel
              currentUserId={currentUserId}
              onChangeSearch={search =>
                setDirectState(current => ({
                  ...current,
                  errorMessage: undefined,
                  search,
                }))
              }
              onOpenDara={() => {
                handleOpenDirect({ dara: true }).catch(() => undefined);
              }}
              onOpenUser={user => {
                handleOpenDirect({ user }).catch(() => undefined);
              }}
              onToggle={() =>
                setDirectState(current => ({
                  ...current,
                  errorMessage: undefined,
                  message: undefined,
                  open: !current.open,
                }))
              }
              state={directState}
            />
          ) : null}

          {selectedItem ? (
            <KolamChatRailDetailPanel
              composerText={composerText}
              currentUserId={currentUserId}
              daraAvatarUrl={daraAvatarState.imageUrl}
              katakTerbangAvatarUrl={daraAvatarState.katakTerbangImageUrl}
              rajaAnemonAvatarUrl={daraAvatarState.rajaAnemonImageUrl}
              pangeranIsopodAvatarUrl={daraAvatarState.pangeranIsopodImageUrl}
              canPurgeMessages={canPurgeTeamChatRoomMessages(authUser?.roleKey)}
              daraThinkingLiveSignal={daraThinkingLiveSignal}
              deleteRoomBusy={deleteRoomState.busy}
              detail={detail}
              inboxCanReply={inboxCanReply}
              labels={labelsState.items}
              mode={mode}
              onComposerTextChange={handleComposerTextChange}
              onPendingAttachmentClear={() => setPendingAttachment(null)}
              onPendingAttachmentPick={handleChooseAttachment}
              onReplyCancel={() => setReplyTarget(null)}
              onReplyToMessage={setReplyTarget}
              onBack={handleBackToList}
              onDeleteTeamRoomRequest={() =>
                handleRequestDeleteTeamRoom(selectedItem)
              }
              onSend={handleSend}
              pendingAttachment={pendingAttachment}
              replyTarget={replyTarget}
              selectedItem={selectedItem}
              templatesState={templatesState}
            />
          ) : null}

          {data.errorMessage ? (
            <KolamEmptyState
              compact
              message={data.errorMessage}
              title="Data chat belum bisa dibaca"
            />
          ) : null}

          {!data.loading && !data.errorMessage && items.length === 0 ? (
            <KolamEmptyState
              compact
              message={content.emptyMessage}
              title={content.emptyTitle}
            />
          ) : null}

          {!data.errorMessage && items.length > 0 && !detailOpen ? (
            <ScrollView
              style={styles.listScroll}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator
            >
              <KolamMappedList
                items={items}
                getKey={item => item.id}
                renderItem={item => (
                  <KolamPressable
                    accessibilityLabel={`${content.selectLabel} ${item.title}`}
                    accessibilityState={{
                      selected: item.id === selectedItemId,
                    }}
                    onPress={() => setSelectedItemId(item.id)}
                    style={[
                      styles.row,
                      mode === 'inbox' &&
                        item.unreadCount > 0 &&
                        styles.rowUnread,
                      item.id === selectedItemId && styles.rowSelected,
                    ]}
                  >
                    {mode === 'inbox' && item.platform ? (
                      <View
                        accessibilityLabel={`Logo platform ${item.metaLabel}`}
                        style={styles.rowPlatformLogoShell}
                      >
                        <KolamPlatformFilterLogo platform={item.platform} />
                      </View>
                    ) : null}
                    <View style={styles.rowCopy}>
                      <View style={styles.rowTopLine}>
                        <Text numberOfLines={1} style={styles.rowTitle}>
                          {item.title}
                        </Text>
                        {item.unreadCount > 0 ? (
                          <KolamBadge
                            horizontalPadding={6}
                            intent="primary"
                            label={
                              item.unreadCount > 99 ? '99+' : item.unreadCount
                            }
                            style={styles.rowUnreadBadge}
                          />
                        ) : null}
                        <Text style={styles.rowTime}>{item.timeLabel}</Text>
                      </View>
                      <Text numberOfLines={2} style={styles.rowPreview}>
                        {item.preview}
                      </Text>
                      <View style={styles.rowMetaLine}>
                        {mode === 'team-chat' ? (
                          <KolamBadge
                            intent="muted"
                            label={item.metaLabel}
                            shape="square"
                          />
                        ) : null}
                        {item.secondaryMetaLabel ? (
                          <Text numberOfLines={1} style={styles.rowSubMeta}>
                            {item.secondaryMetaLabel}
                          </Text>
                        ) : null}
                      </View>
                      {mode === 'inbox' && item.labels?.length ? (
                        <View style={styles.rowLabelLine}>
                          <KolamMappedList
                            items={item.labels}
                            getKey={label => label._id}
                            renderItem={label => (
                              <KolamChatLabelPill label={label} />
                            )}
                          />
                        </View>
                      ) : null}
                    </View>
                    {mode === 'inbox' && item.handledByDara ? (
                      <KolamInboxDaraAvatar
                        imageUrl={daraAvatarState.imageUrl}
                      />
                    ) : mode === 'inbox' && item.assignedStaff ? (
                      <KolamInboxAssignedStaffAvatar
                        staff={item.assignedStaff}
                      />
                    ) : null}
                  </KolamPressable>
                )}
              />
            </ScrollView>
          ) : null}
        </View>
      </View>
      {mode === 'team-chat' && daraHeaderMenuOpen ? (
        <KolamTeamChatDaraWindow
          busy={daraWindowBusy}
          composerText={daraComposerText}
          detail={daraWindowDetail}
          emojiPickerOpen={daraEmojiPickerOpen}
          errorMessage={daraWindowError}
          imageUrl={daraAvatarState.imageUrl}
          onClose={handleCloseDaraWindow}
          onComposerTextChange={handleDaraComposerTextChange}
          onEmojiPick={handlePickDaraEmoji}
          onEmojiToggle={() => setDaraEmojiPickerOpen(current => !current)}
          onPendingAttachmentClear={() => setDaraPendingAttachment(null)}
          onPendingAttachmentPick={handleChooseDaraAttachment}
          onSend={handleDaraWindowSend}
          pendingAttachment={daraPendingAttachment}
        />
      ) : null}
      {deleteRoomState.target ? (
        <KolamConfirmDialog
          cancelLabel="Batal"
          confirmLabel={deleteRoomState.busy ? 'Menghapus...' : 'Hapus'}
          destructive
          message={deleteRoomDialogMessage}
          onCancel={handleCancelDeleteTeamRoom}
          onConfirm={handleDeleteTeamRoomConfirmPress}
          title={deleteRoomDialogTitle}
          visible
        />
      ) : null}
      {labelsManagerOpen ? (
        <KolamChatLabelsManagerDialog
          labels={labelsState.items}
          loading={labelsState.loading}
          onClose={() => setLabelsManagerOpen(false)}
          onLabelsChange={items =>
            setLabelsState({
              items,
              loading: false,
            })
          }
        />
      ) : null}
    </>
  );
}

function KolamChatRailLiveHost({
  mode,
  onEvent,
  onStatusChange,
}: {
  mode: KolamGlobalChatRailMode;
  onEvent: (event: KolamChatLiveEvent) => void;
  onStatusChange: (status: KolamChatLiveStreamStatus) => void;
}) {
  useKolamChatLiveStream({
    mode,
    onEvent,
    onStatusChange,
  });

  return null;
}

function KolamInboxFilterPanel({
  filter,
  labels,
  onChange,
}: {
  filter: KolamChatRailInboxFilter;
  labels: KolamChatLabel[];
  onChange: (next: KolamChatRailInboxFilter) => void;
}) {
  const [searchDraft, setSearchDraft] = React.useState(filter.search);
  const statusOptions = React.useMemo(
    () =>
      INBOX_STATUS_FILTERS.map(status => ({
        label: formatInboxStatusFilterLabel(status),
        value: status,
      })),
    [],
  );
  const assignmentOptions = React.useMemo(
    () =>
      INBOX_ASSIGNMENT_FILTERS.map(assignment => ({
        label: formatInboxAssignmentFilterLabel(assignment),
        value: assignment,
      })),
    [],
  );
  const labelOptions = React.useMemo(
    () => [
      { label: 'Semua label', value: 'all' },
      ...labels.map(label => ({
        label: label.name,
        value: label._id,
      })),
    ],
    [labels],
  );

  React.useEffect(() => {
    setSearchDraft(filter.search);
  }, [filter.search]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchDraft !== filter.search) {
        onChange({ ...filter, search: searchDraft });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [filter, onChange, searchDraft]);

  const hasActiveFilter =
    filter.assignment !== 'all' ||
    filter.labelId !== 'all' ||
    filter.platform !== 'all' ||
    filter.search.trim().length > 0 ||
    filter.status !== 'all';

  return (
    <View accessibilityLabel="Filter inbox chat" style={styles.filterPanel}>
      <TextInput
        accessibilityLabel="Cari conversation inbox"
        onChangeText={setSearchDraft}
        placeholder="Cari contact atau pesan"
        placeholderTextColor={V.colors.mutedFg}
        style={styles.filterSearchInput}
        value={searchDraft}
      />
      <View style={styles.filterDropdownStack}>
        <KolamDropdownSelect
          accessibilityLabel="Filter status inbox"
          label="Status"
          menuPlacement="inline"
          onChange={status => onChange({ ...filter, status })}
          options={statusOptions}
          style={styles.filterDropdown}
          triggerStyle={styles.filterDropdownTrigger}
          triggerTextStyle={styles.filterDropdownText}
          value={filter.status}
        />
        <KolamDropdownSelect
          accessibilityLabel="Filter tugas inbox"
          label="Tugas"
          menuPlacement="inline"
          onChange={assignment => onChange({ ...filter, assignment })}
          options={assignmentOptions}
          style={styles.filterDropdown}
          triggerStyle={styles.filterDropdownTrigger}
          triggerTextStyle={styles.filterDropdownText}
          value={filter.assignment}
        />
        <KolamDropdownSelect
          accessibilityLabel="Filter label inbox"
          label="Label"
          menuPlacement="inline"
          onChange={labelId => onChange({ ...filter, labelId })}
          options={labelOptions}
          searchable={labels.length > 6}
          style={styles.filterDropdown}
          triggerStyle={styles.filterDropdownTrigger}
          triggerTextStyle={styles.filterDropdownText}
          value={filter.labelId}
        />
      </View>
      <View style={styles.filterGroup}>
        <Text style={styles.filterGroupLabel}>Platform</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipRow}
        >
          <KolamMappedList
            items={INBOX_PLATFORM_FILTERS}
            getKey={platform => platform}
            renderItem={platform => (
              <KolamPlatformFilterChip
                active={filter.platform === platform}
                onPress={() => onChange({ ...filter, platform })}
                platform={platform}
              />
            )}
          />
        </ScrollView>
      </View>
      <View style={styles.filterBottomRow}>
        {hasActiveFilter ? (
          <KolamResetButton
            accessibilityLabel="Reset filter inbox chat"
            onPress={() =>
              onChange({
                assignment: 'all',
                labelId: 'all',
                platform: 'all',
                search: '',
                status: 'all',
              })
            }
            style={styles.filterResetButton}
          />
        ) : null}
      </View>
    </View>
  );
}

function KolamChatHealthMenu({
  healthState,
  onToggle,
  open,
}: {
  healthState: ReturnType<typeof useKolamChatPlatformHealth>;
  onToggle: () => void;
  open: boolean;
}) {
  const aggregateState = getAggregatePlatformGlowState(healthState);
  const summaryLabel = getChatHealthSummaryLabel(healthState);

  return (
    <View style={styles.chatHealthMenuHost}>
      <KolamPressable
        accessibilityLabel={`Analisa koneksi chat. ${summaryLabel}`}
        accessibilityState={{ expanded: open }}
        onPress={onToggle}
        style={[styles.chatHealthButton, open && styles.chatHealthButtonActive]}
      >
        <KolamPlatformHealthGlow state={aggregateState} />
        <View style={styles.chatHealthRadarIcon}>
          <View style={styles.chatHealthRadarDotPrimary} />
          <View
            style={[styles.chatHealthRadarDot, styles.chatHealthRadarDotTop]}
          />
          <View
            style={[styles.chatHealthRadarDot, styles.chatHealthRadarDotSide]}
          />
        </View>
      </KolamPressable>

      {open ? (
        <View style={styles.chatHealthPopover}>
          <View style={styles.chatHealthPopoverHeader}>
            <Text style={styles.chatHealthPopoverTitle}>Analisa chat</Text>
            <Text style={styles.chatHealthPopoverMeta}>{summaryLabel}</Text>
          </View>

          {healthState.errorMessage ? (
            <Text style={styles.chatHealthErrorText}>
              {healthState.errorMessage}
            </Text>
          ) : null}

          <KolamMappedList
            items={healthState.platforms}
            getKey={row => String(row.platform)}
            renderItem={row => <KolamChatHealthPlatformRow row={row} />}
          />

          {!healthState.platforms.length ? (
            <Text style={styles.chatHealthEmptyText}>
              Status platform sedang dimuat.
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function KolamChatHealthPlatformRow({
  row,
}: {
  row: KolamChatPlatformHealthRow;
}) {
  const platform = isKnownChatPlatform(row.platform) ? row.platform : 'all';
  const state = getPlatformGlowState(platform, row);

  return (
    <View style={styles.chatHealthPlatformRow}>
      <View style={styles.chatHealthPlatformIcon}>
        <KolamPlatformHealthGlow state={state} />
        <KolamPlatformFilterLogo platform={platform} state={state} />
      </View>
      <View style={styles.chatHealthPlatformCopy}>
        <View style={styles.chatHealthPlatformTitleRow}>
          <Text style={styles.chatHealthPlatformTitle}>
            {formatInboxPlatformFilterLabel(platform)}
          </Text>
          <Text
            style={[
              styles.chatHealthStatusPill,
              getChatHealthStatusPillStyle(row.state),
            ]}
          >
            {formatChatHealthState(row.state)}
          </Text>
        </View>
        <Text numberOfLines={2} style={styles.chatHealthReasonText}>
          {row.reason || 'Belum ada keterangan health.'}
        </Text>
        <Text style={styles.chatHealthActivityText}>
          {formatChatHealthActivity(row)}
        </Text>
      </View>
    </View>
  );
}

function KolamChatAnalyticsMenu({
  onToggle,
  open,
  state,
}: {
  onToggle: () => void;
  open: boolean;
  state: KolamChatRailAnalyticsState;
}) {
  const totalChats = getAnalyticsNumber(state.data, 'totalChats');
  const avgRating = getAnalyticsNumber(state.data, 'ratings.average');
  const avgReplyDelay = getAnalyticsNumber(state.data, 'avgReplyDelayMinutes');
  const lateReplyCount = getAnalyticsNumber(state.data, 'lateReplyCount');
  const summaryLabel = state.loading
    ? 'Memuat analisa'
    : state.errorMessage
    ? 'Analisa belum terbaca'
    : `${formatMetricNumber(totalChats)} chat, rating ${formatRating(
        avgRating,
      )}`;

  return (
    <View style={styles.chatHeaderMenuHost}>
      <KolamPressable
        accessibilityLabel={`Analisa performa chat. ${summaryLabel}`}
        accessibilityState={{ expanded: open }}
        onPress={onToggle}
        style={[
          styles.chatAnalyticsButton,
          open && styles.chatHealthButtonActive,
        ]}
      >
        <View style={styles.chatAnalyticsIcon}>
          <View style={[styles.chatAnalyticsBar, styles.chatAnalyticsBarLow]} />
          <View style={[styles.chatAnalyticsBar, styles.chatAnalyticsBarMid]} />
          <View
            style={[styles.chatAnalyticsBar, styles.chatAnalyticsBarHigh]}
          />
        </View>
      </KolamPressable>

      {open ? (
        <View style={styles.chatAnalyticsPopover}>
          <View style={styles.chatHealthPopoverHeader}>
            <Text style={styles.chatHealthPopoverTitle}>Analisa performa</Text>
            <Text style={styles.chatHealthPopoverMeta}>30 hari</Text>
          </View>

          {state.loading ? (
            <Text style={styles.metaText}>Memuat analisa...</Text>
          ) : state.errorMessage ? (
            <Text style={styles.errorText}>{state.errorMessage}</Text>
          ) : (
            <View style={styles.analyticsGrid}>
              <KolamChatRailMetric
                label="Total"
                value={formatMetricNumber(totalChats)}
              />
              <KolamChatRailMetric
                label="Rating"
                value={formatRating(avgRating)}
              />
              <KolamChatRailMetric
                label="Delay"
                value={`${formatMetricNumber(avgReplyDelay)}m`}
              />
              <KolamChatRailMetric
                label="Telat"
                value={formatMetricNumber(lateReplyCount)}
              />
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

function KolamPlatformFilterChip({
  active,
  onPress,
  platform,
}: {
  active: boolean;
  onPress: () => void;
  platform: KolamChatPlatform | 'all';
}) {
  const label = formatInboxPlatformFilterLabel(platform);

  return (
    <KolamPressable
      accessibilityLabel={`Filter ${label}`}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.platformFilterChip,
        active && styles.platformFilterChipActive,
      ]}
    >
      <KolamPlatformFilterLogo platform={platform} />
    </KolamPressable>
  );
}

function KolamPlatformFilterLogo({
  platform,
  state,
}: {
  platform: KolamChatPlatform | 'all';
  state?: KolamPlatformGlowState;
}) {
  const offline = state?.tone === 'offline';

  if (
    platform === 'tokopedia' ||
    platform === 'shopee' ||
    platform === 'tiktok' ||
    platform === 'whatsapp'
  ) {
    return (
      <Image
        resizeMode="contain"
        source={
          platform === 'tokopedia'
            ? TOKOPEDIA_LOGO
            : platform === 'shopee'
            ? SHOPEE_LOGO
            : platform === 'tiktok'
            ? TIKTOK_LOGO
            : WHATSAPP_LOGO
        }
        style={[
          styles.platformLogoImage,
          offline && styles.platformLogoImageOffline,
        ]}
      />
    );
  }

  if (platform === 'store') {
    return (
      <View
        style={[styles.storeLogoBag, offline && styles.storeLogoBagOffline]}
      >
        <View
          style={[
            styles.storeLogoHandle,
            offline && styles.storeLogoHandleOffline,
          ]}
        />
      </View>
    );
  }

  if (platform === 'instagram') {
    return (
      <View
        style={[styles.instagramLogo, offline && styles.instagramLogoOffline]}
      >
        <View
          style={[styles.instagramLens, offline && styles.instagramLensOffline]}
        />
        <View
          style={[
            styles.instagramFlash,
            offline && styles.instagramFlashOffline,
          ]}
        />
      </View>
    );
  }

  return (
    <View style={styles.allPlatformLogo}>
      <View style={styles.allPlatformDot} />
      <View style={styles.allPlatformDot} />
      <View style={styles.allPlatformDot} />
      <View style={styles.allPlatformDot} />
    </View>
  );
}

type KolamPlatformGlowTone =
  | 'healthy'
  | 'active'
  | 'starting'
  | 'stale'
  | 'down'
  | 'offline'
  | 'neutral'
  | 'unknown';

interface KolamPlatformGlowState {
  animated: boolean;
  color: string;
  opacity: number;
  scale: number;
  tone: KolamPlatformGlowTone;
}

function KolamPlatformHealthGlow({ state }: { state: KolamPlatformGlowState }) {
  const pulse = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!state.animated) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          duration: state.tone === 'starting' ? 1100 : 650,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          duration: state.tone === 'starting' ? 1100 : 650,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [pulse, state.animated, state.tone]);

  if (
    state.tone === 'neutral' ||
    state.tone === 'offline' ||
    state.tone === 'unknown'
  ) {
    return null;
  }

  const opacity = state.animated
    ? pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [state.opacity * 0.55, state.opacity],
      })
    : state.opacity;
  const haloOpacity = state.animated
    ? pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [state.opacity * 0.14, state.opacity * 0.36],
      })
    : state.opacity * 0.18;
  const scale = state.animated
    ? pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [1, state.scale],
      })
    : 1;
  const haloScale = state.animated
    ? pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [1.08, state.scale + 0.18],
      })
    : 1.12;

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.platformHealthHalo,
          {
            backgroundColor: state.color,
            opacity: haloOpacity,
            transform: [{ scale: haloScale }],
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.platformHealthGlow,
          {
            borderColor: state.color,
            opacity,
            transform: [{ scale }],
          },
        ]}
      />
    </>
  );
}

function getPlatformGlowState(
  platform: KolamChatPlatform | 'all',
  health?: KolamChatPlatformHealthRow,
): KolamPlatformGlowState {
  if (platform === 'all') {
    return PLATFORM_GLOW_NEUTRAL;
  }

  if (!health) {
    return PLATFORM_GLOW_UNKNOWN;
  }

  if (isRecentPlatformInbound(health.lastInboundAt)) {
    return PLATFORM_GLOW_ACTIVE;
  }

  if (health.state === 'healthy' && health.healthy) {
    return PLATFORM_GLOW_HEALTHY;
  }

  if (health.state === 'starting') {
    return PLATFORM_GLOW_STARTING;
  }

  if (health.state === 'stale') {
    return PLATFORM_GLOW_STALE;
  }

  return PLATFORM_GLOW_OFFLINE;
}

function isRecentPlatformInbound(value?: string | null) {
  if (!value) {
    return false;
  }
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) {
    return false;
  }
  return Date.now() - time < 90_000;
}

function getAggregatePlatformGlowState(
  healthState: ReturnType<typeof useKolamChatPlatformHealth>,
): KolamPlatformGlowState {
  const rows = healthState.platforms;
  if (!rows.length) {
    return PLATFORM_GLOW_UNKNOWN;
  }
  if (
    rows.some(row =>
      ['down', 'inactive', 'unconfigured', 'unknown'].includes(row.state),
    )
  ) {
    return PLATFORM_GLOW_DOWN;
  }
  if (rows.some(row => row.state === 'stale')) {
    return PLATFORM_GLOW_STALE;
  }
  if (rows.some(row => row.state === 'starting')) {
    return PLATFORM_GLOW_STARTING;
  }
  if (rows.some(row => isRecentPlatformInbound(row.lastInboundAt))) {
    return PLATFORM_GLOW_ACTIVE;
  }
  if (rows.every(row => row.healthy || row.state === 'healthy')) {
    return PLATFORM_GLOW_HEALTHY;
  }
  return PLATFORM_GLOW_UNKNOWN;
}

function getChatHealthSummaryLabel(
  healthState: ReturnType<typeof useKolamChatPlatformHealth>,
) {
  if (healthState.loading && !healthState.platforms.length) {
    return 'Memuat status koneksi';
  }
  if (healthState.errorMessage) {
    return 'Health belum terbaca';
  }
  if (!healthState.platforms.length) {
    return 'Belum ada data health';
  }

  const healthy = healthState.platforms.filter(row => row.healthy).length;
  const total = healthState.platforms.length;
  const attention = healthState.platforms.filter(
    row => !row.healthy && row.state !== 'healthy',
  ).length;

  if (!attention) {
    return `${healthy}/${total} platform aktif`;
  }

  return `${healthy}/${total} aktif, ${attention} perlu dicek`;
}

function isKnownChatPlatform(platform: string): platform is KolamChatPlatform {
  return (
    platform === 'tokopedia' ||
    platform === 'shopee' ||
    platform === 'store' ||
    platform === 'tiktok' ||
    platform === 'whatsapp' ||
    platform === 'instagram'
  );
}

function formatChatHealthState(state: KolamChatPlatformHealthRow['state']) {
  if (state === 'healthy') {
    return 'Aktif';
  }
  if (state === 'starting') {
    return 'Mulai';
  }
  if (state === 'stale') {
    return 'Stale';
  }
  if (state === 'down') {
    return 'Putus';
  }
  if (state === 'inactive') {
    return 'Nonaktif';
  }
  if (state === 'unconfigured') {
    return 'Belum set';
  }
  return 'Unknown';
}

function getChatHealthStatusPillStyle(
  state: KolamChatPlatformHealthRow['state'],
) {
  if (state === 'healthy') {
    return styles.chatHealthStatusHealthy;
  }
  if (state === 'starting') {
    return styles.chatHealthStatusStarting;
  }
  if (state === 'stale') {
    return styles.chatHealthStatusStale;
  }
  return styles.chatHealthStatusDown;
}

function formatChatHealthActivity(row: KolamChatPlatformHealthRow) {
  const value =
    row.lastInboundAt ||
    row.lastChatScanAt ||
    row.lastChatReadyAt ||
    row.lastActivityAt;

  if (!value) {
    return row.chatCaptureMode || 'Belum ada aktivitas';
  }

  return `${row.chatCaptureMode || 'chat'} • ${formatRelativeTime(value)}`;
}

function KolamChatRailAnalyticsPanel({
  state,
}: {
  state: KolamChatRailAnalyticsState;
}) {
  const totalChats = getAnalyticsNumber(state.data, 'totalChats');
  const avgRating = getAnalyticsNumber(state.data, 'ratings.average');
  const avgReplyDelay = getAnalyticsNumber(state.data, 'avgReplyDelayMinutes');
  const lateReplyCount = getAnalyticsNumber(state.data, 'lateReplyCount');

  return (
    <View style={styles.analyticsPanel}>
      <View style={styles.analyticsHeader}>
        <Text style={styles.analyticsTitle}>Analisa chat</Text>
        <Text style={styles.analyticsPeriod}>30 hari</Text>
      </View>
      {state.loading ? (
        <Text style={styles.metaText}>Memuat analisa...</Text>
      ) : state.errorMessage ? (
        <Text style={styles.errorText}>{state.errorMessage}</Text>
      ) : (
        <View style={styles.analyticsGrid}>
          <KolamChatRailMetric
            label="Total"
            value={formatMetricNumber(totalChats)}
          />
          <KolamChatRailMetric label="Rating" value={formatRating(avgRating)} />
          <KolamChatRailMetric
            label="Delay"
            value={`${formatMetricNumber(avgReplyDelay)}m`}
          />
          <KolamChatRailMetric
            label="Telat"
            value={formatMetricNumber(lateReplyCount)}
          />
        </View>
      )}
    </View>
  );
}

function KolamChatRailMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.analyticsMetric}>
      <Text style={styles.analyticsMetricLabel}>{label}</Text>
      <Text style={styles.analyticsMetricValue}>{value}</Text>
    </View>
  );
}

function KolamInboxAssignedStaffAvatar({
  staff,
}: {
  staff: KolamChatStaffRef | string;
}) {
  const label = getChatStaffLabel(staff) || 'Staff menangani';
  const photoUri = getChatStaffPhotoUri(staff);
  const initials = getChatStaffInitials(staff);

  return (
    <KolamHoverTooltip containerStyle={styles.rowStaffTooltip} label={label}>
      <View
        accessibilityLabel={`Staff menangani ${label}`}
        style={styles.rowStaffAvatar}
      >
        <KolamProfileAvatarContent
          imageStyle={styles.rowStaffAvatarImage}
          imageUrl={photoUri}
          initials={initials}
          textStyle={styles.rowStaffAvatarText}
        />
      </View>
    </KolamHoverTooltip>
  );
}

function KolamInboxDaraAvatar({ imageUrl }: { imageUrl: string | null }) {
  return (
    <KolamHoverTooltip containerStyle={styles.rowStaffTooltip} label="DARA">
      <View
        accessibilityLabel="DARA menangani chat"
        style={[styles.rowStaffAvatar, styles.rowDaraAvatar]}
      >
        <KolamProfileAvatarContent
          imageStyle={styles.rowStaffAvatarImage}
          imageUrl={imageUrl}
          initials="DA"
          textStyle={styles.rowDaraAvatarText}
        />
      </View>
    </KolamHoverTooltip>
  );
}

function KolamTeamChatDaraHeaderMenu({
  busy,
  imageUrl,
  onOpenWindow,
  open,
}: {
  busy: boolean;
  imageUrl: string | null;
  onOpenWindow: () => void;
  open: boolean;
}) {
  return (
    <View style={styles.chatHeaderMenuHost}>
      <KolamPressable
        accessibilityLabel="Buka jendela DARA team chat"
        accessibilityState={{ busy, expanded: open }}
        onPress={onOpenWindow}
        style={[
          styles.teamDaraHeaderButton,
          open && styles.chatHealthButtonActive,
          busy && styles.composerIconButtonDisabled,
        ]}
      >
        <KolamProfileAvatarContent
          imageStyle={styles.teamDaraHeaderAvatarImage}
          imageUrl={imageUrl}
          initials="DA"
          textStyle={styles.teamDaraHeaderAvatarText}
        />
      </KolamPressable>
    </View>
  );
}

const DARA_WINDOW_MARGIN = 12;
const DARA_WINDOW_TOP_MIN = V.layout.topNavHeight + DARA_WINDOW_MARGIN;
const DARA_WINDOW_WIDTH_RATIO = 0.9;
const DARA_WINDOW_HEIGHT_RATIO = 0.86;
const DARA_WINDOW_MAX_WIDTH = 920;
const DARA_WINDOW_MAX_HEIGHT = 760;
const DARA_WINDOW_MIN_WIDTH = 360;
const DARA_WINDOW_MIN_HEIGHT = 420;

function getDaraWindowPanelSize(windowWidth: number, windowHeight: number) {
  const availableHeight = Math.max(
    DARA_WINDOW_MIN_HEIGHT,
    windowHeight - DARA_WINDOW_TOP_MIN - DARA_WINDOW_MARGIN,
  );
  const width = Math.min(
    DARA_WINDOW_MAX_WIDTH,
    Math.max(
      DARA_WINDOW_MIN_WIDTH,
      Math.round(windowWidth * DARA_WINDOW_WIDTH_RATIO),
    ),
  );
  const height = Math.min(
    DARA_WINDOW_MAX_HEIGHT,
    Math.max(
      DARA_WINDOW_MIN_HEIGHT,
      Math.round(windowHeight * DARA_WINDOW_HEIGHT_RATIO),
    ),
    availableHeight,
  );

  return {
    height,
    width: Math.min(
      width,
      Math.max(DARA_WINDOW_MIN_WIDTH, windowWidth - DARA_WINDOW_MARGIN * 2),
    ),
  };
}

/**
 * DARA popup — same open class as profile user menu:
 * no Modal, fixed absolute anchor under top nav / right edge, final size on first paint.
 */
function KolamTeamChatDaraWindow({
  busy,
  composerText,
  detail,
  emojiPickerOpen,
  errorMessage,
  imageUrl,
  onClose,
  onComposerTextChange,
  onEmojiPick,
  onEmojiToggle,
  onPendingAttachmentClear,
  onPendingAttachmentPick,
  onSend,
  pendingAttachment,
}: {
  busy: boolean;
  composerText: string;
  detail: ReturnType<typeof useKolamChatRailDetail>;
  emojiPickerOpen: boolean;
  errorMessage?: string;
  imageUrl: string | null;
  onClose: () => void;
  onComposerTextChange: (value: string) => void;
  onEmojiPick: (emoji: string) => void;
  onEmojiToggle: () => void;
  onPendingAttachmentClear: () => void;
  onPendingAttachmentPick: () => void | Promise<void>;
  onSend: () => Promise<void>;
  pendingAttachment: NativeImagePickerResult | null;
}) {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const panelSize = React.useMemo(
    () => getDaraWindowPanelSize(windowWidth, windowHeight),
    [windowHeight, windowWidth],
  );
  const composerDisabled = busy || detail.loading || detail.sending;
  const attachmentLabel = pendingAttachment
    ? getPendingChatAttachmentLabel(pendingAttachment)
    : '';
  const mentionQuery = getTrailingMentionQuery(composerText);
  const mentionOptions = React.useMemo(
    () =>
      mentionQuery !== null
        ? buildTeamMentionOptions(
            detail.teamRoomMetadata.members,
            mentionQuery,
            detail.teamRoomMetadata.daraReplyEnabled,
            detail.teamRoomMetadata.bots,
          )
        : [],
    [
      detail.teamRoomMetadata.bots,
      detail.teamRoomMetadata.daraReplyEnabled,
      detail.teamRoomMetadata.members,
      mentionQuery,
    ],
  );

  const handleSubmitComposer = React.useCallback(() => {
    onSend().catch(() => undefined);
  }, [onSend]);
  const handlePickMention = React.useCallback(
    (username: string) => {
      const tag = `@${username} `;
      const nextText =
        composerText.match(/@([a-zA-Z0-9_.-]{0,32})$/) !== null
          ? composerText.replace(/@([a-zA-Z0-9_.-]{0,32})$/, tag)
          : `${composerText}${
              composerText.endsWith(' ') || !composerText ? '' : ' '
            }${tag}`;

      onComposerTextChange(nextText);
    },
    [composerText, onComposerTextChange],
  );
  const handleComposerKeyPress = React.useCallback(
    (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      const nativeEvent = event.nativeEvent as TextInputKeyPressEventData & {
        shiftKey?: boolean;
      };

      if (nativeEvent.key !== 'Enter' || nativeEvent.shiftKey) {
        return;
      }

      event.preventDefault();
      onSend().catch(() => undefined);
    },
    [onSend],
  );

  return (
    <View
      accessibilityLabel="Jendela DARA team chat"
      pointerEvents="auto"
      style={[
        styles.teamDaraWindow,
        {
          height: panelSize.height,
          width: panelSize.width,
        },
      ]}
    >
      <View style={styles.teamDaraWindowHeader}>
        <View style={styles.teamDaraWindowDragHandle}>
          <View style={styles.teamDaraHeaderLargeAvatar}>
            <KolamProfileAvatarContent
              imageStyle={styles.teamDaraHeaderLargeAvatarImage}
              imageUrl={imageUrl}
              initials="DA"
              textStyle={styles.teamDaraHeaderLargeAvatarText}
            />
          </View>
          <View style={styles.teamDaraHeaderCopy}>
            <Text style={styles.teamDaraHeaderTitle}>DARA</Text>
            <Text style={styles.teamDaraHeaderMeta}>Assistant Team Chat</Text>
          </View>
        </View>
        <KolamPressable
          accessibilityLabel="Tutup jendela DARA team chat"
          onPress={onClose}
          style={styles.teamDaraWindowCloseButton}
        >
          <Text style={styles.teamDaraWindowCloseText}>Tutup</Text>
        </KolamPressable>
      </View>

      <View style={styles.teamDaraWindowBody}>
        <KolamTeamChatDaraWindowMessages
          detail={detail}
          errorMessage={errorMessage}
          imageUrl={imageUrl}
          loading={busy}
        />
      </View>

      <View style={styles.teamDaraWindowFooter}>
        {pendingAttachment ? (
          <View style={styles.pendingAttachment}>
            <Text numberOfLines={1} style={styles.pendingAttachmentText}>
              {attachmentLabel}
            </Text>
            <KolamPressable
              accessibilityLabel="Hapus lampiran chat"
              disabled={composerDisabled}
              onPress={onPendingAttachmentClear}
              style={styles.pendingAttachmentRemove}
            >
              <Text style={styles.pendingAttachmentRemoveText}>x</Text>
            </KolamPressable>
          </View>
        ) : null}

        {emojiPickerOpen ? (
          <KolamChatComposerEmojiPicker
            disabled={composerDisabled}
            onPick={onEmojiPick}
          />
        ) : null}

        {mentionOptions.length > 0 ? (
          <KolamTeamMentionPicker
            disabled={composerDisabled}
            onPick={handlePickMention}
            options={mentionOptions}
          />
        ) : null}

        <View
          style={[
            styles.composerShell,
            styles.teamDaraComposerShell,
            composerDisabled && styles.composerShellBlocked,
          ]}
        >
          <TextInput
            accessibilityLabel="Tulis pesan DARA team chat"
            editable={!composerDisabled}
            multiline
            onChangeText={onComposerTextChange}
            onKeyPress={handleComposerKeyPress}
            onSubmitEditing={handleSubmitComposer}
            placeholder={
              composerDisabled ? 'Chat DARA sedang dimuat' : 'Tulis pesan...'
            }
            placeholderTextColor={V.colors.mutedFg}
            style={[styles.composerInput, styles.teamDaraComposerInput]}
            submitBehavior="submit"
            value={composerText}
          />
          <View style={styles.composerToolbar}>
            <View style={styles.composerToolGroup}>
              <KolamPressable
                accessibilityLabel="Lampirkan file team chat"
                disabled={composerDisabled}
                onPress={onPendingAttachmentPick}
                style={[
                  styles.composerIconButton,
                  composerDisabled && styles.composerIconButtonDisabled,
                ]}
              >
                <Text style={styles.composerIconButtonText}>+</Text>
              </KolamPressable>
              <KolamPressable
                accessibilityLabel="Buka emoji chat"
                disabled={composerDisabled}
                onPress={onEmojiToggle}
                style={[
                  styles.composerIconButton,
                  emojiPickerOpen && styles.composerIconButtonActive,
                  composerDisabled && styles.composerIconButtonDisabled,
                ]}
              >
                <Text style={styles.composerIconButtonText}>:)</Text>
              </KolamPressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function KolamTeamChatDaraWindowMessages({
  detail,
  errorMessage,
  imageUrl,
  loading,
}: {
  detail: ReturnType<typeof useKolamChatRailDetail>;
  errorMessage?: string;
  imageUrl: string | null;
  loading: boolean;
}) {
  const messages = detail.messages;
  const displayedError = errorMessage || detail.errorMessage;
  const messageScrollRef = React.useRef<React.ElementRef<
    typeof ScrollView
  > | null>(null);
  const messageScrollKey = React.useMemo(
    () => messages.map(message => message.id).join('|'),
    [messages],
  );

  React.useEffect(() => {
    messageScrollRef.current?.scrollToEnd({ animated: false });
  }, [messageScrollKey]);

  if (loading || detail.loading) {
    return (
      <View style={styles.teamDaraWindowPlaceholder}>
        <Text style={styles.teamDaraWindowPlaceholderTitle}>
          Memuat chat DARA...
        </Text>
      </View>
    );
  }

  if (displayedError) {
    return (
      <View style={styles.teamDaraWindowPlaceholder}>
        <Text style={styles.errorText}>{displayedError}</Text>
      </View>
    );
  }

  if (messages.length === 0) {
    return (
      <View style={styles.teamDaraWindowPlaceholder}>
        <Text style={styles.teamDaraWindowPlaceholderTitle}>
          Belum ada pesan DARA
        </Text>
        <Text style={styles.teamDaraWindowPlaceholderText}>
          Room DARA sudah siap. Tulis pesan lalu tekan Enter untuk mengirim.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      accessibilityLabel="Daftar pesan DARA team chat"
      contentContainerStyle={styles.teamDaraWindowMessageList}
      onContentSizeChange={() => {
        messageScrollRef.current?.scrollToEnd({ animated: false });
      }}
      ref={messageScrollRef}
      style={styles.teamDaraWindowMessageScroll}
      showsVerticalScrollIndicator
    >
      <KolamMappedList
        items={messages}
        getKey={message => message.id}
        renderItem={message => (
          <View
            style={[
              styles.teamDaraWindowMessageBubble,
              message.mine
                ? styles.teamDaraWindowMessageMine
                : styles.teamDaraWindowMessageOther,
            ]}
          >
            <View style={styles.teamMessageAuthorRow}>
              <View style={styles.teamMessageAvatar}>
                <KolamProfileAvatarContent
                  imageStyle={styles.teamMessageAvatarImage}
                  imageUrl={getTeamChatMessageAvatarUrl(message, imageUrl)}
                  initials={getTeamChatMessageInitials(message.author)}
                  textStyle={styles.teamMessageAvatarText}
                />
              </View>
              <Text style={styles.messageAuthor}>{message.author}</Text>
            </View>
            {message.body ? <KolamTeamMentionText body={message.body} /> : null}
            {message.attachments.length > 0 ? (
              <KolamChatAttachmentList attachments={message.attachments} />
            ) : null}
            {message.linkPreviews.length > 0 ? (
              <KolamChatLinkPreviewList previews={message.linkPreviews} />
            ) : null}
            {message.embeds.length > 0 ? (
              <KolamChatEmbedList embeds={message.embeds} />
            ) : null}
          </View>
        )}
      />
    </ScrollView>
  );
}

function KolamChatSettingsMenu({
  onOpenLabels,
  onToggle,
  open,
}: {
  onOpenLabels: () => void;
  onToggle: () => void;
  open: boolean;
}) {
  return (
    <View style={styles.chatHeaderMenuHost}>
      <KolamPressable
        accessibilityLabel="Pengaturan chat"
        accessibilityState={{ expanded: open }}
        onPress={onToggle}
        style={[
          styles.chatSettingsButton,
          open && styles.chatHealthButtonActive,
        ]}
      >
        <View style={styles.chatSettingsIcon}>
          <View style={styles.chatSettingsIconCore} />
          <View
            style={[
              styles.chatSettingsIconTooth,
              styles.chatSettingsIconToothTop,
            ]}
          />
          <View
            style={[
              styles.chatSettingsIconTooth,
              styles.chatSettingsIconToothRight,
            ]}
          />
          <View
            style={[
              styles.chatSettingsIconTooth,
              styles.chatSettingsIconToothBottom,
            ]}
          />
          <View
            style={[
              styles.chatSettingsIconTooth,
              styles.chatSettingsIconToothLeft,
            ]}
          />
        </View>
      </KolamPressable>

      {open ? (
        <View style={styles.chatSettingsPopover}>
          <View style={styles.chatHealthPopoverHeader}>
            <Text style={styles.chatHealthPopoverTitle}>Pengaturan chat</Text>
            <Text style={styles.chatHealthPopoverMeta}>Konfigurasi inbox</Text>
          </View>
          <View style={styles.chatSettingsMenuList}>
            <KolamChatSettingsMenuItem
              label="Label percakapan"
              onPress={onOpenLabels}
            />
            <KolamChatSettingsMenuItem label="Template chat" />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function KolamChatSettingsMenuItem({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {
  return (
    <KolamPressable
      accessibilityLabel={`Buka ${label}`}
      onPress={onPress}
      style={styles.chatSettingsMenuItem}
    >
      <View style={styles.chatSettingsMenuBullet} />
      <Text style={styles.chatSettingsMenuLabel}>{label}</Text>
    </KolamPressable>
  );
}

const CHAT_LABEL_COLOR_SWATCHES = [
  '#3b82f6',
  '#16a34a',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#64748b',
];

function KolamChatLabelsManagerDialog({
  labels,
  loading,
  onClose,
  onLabelsChange,
}: {
  labels: KolamChatLabel[];
  loading: boolean;
  onClose: () => void;
  onLabelsChange: (labels: KolamChatLabel[]) => void;
}) {
  const [draft, setDraft] = React.useState({ color: '#3b82f6', name: '' });
  const [editing, setEditing] = React.useState<KolamChatLabel | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = React.useState<KolamChatLabel | null>(
    null,
  );

  const resetForm = React.useCallback(() => {
    setEditing(null);
    setDraft({ color: '#3b82f6', name: '' });
    setErrorMessage(undefined);
  }, []);

  const refreshLabels = React.useCallback(async () => {
    const nextLabels = await getKolamChatLabels();
    onLabelsChange(nextLabels);
  }, [onLabelsChange]);

  const handleNewLabel = React.useCallback(() => {
    resetForm();
  }, [resetForm]);

  const handleEditLabel = React.useCallback((label: KolamChatLabel) => {
    setEditing(label);
    setDraft({
      color: normalizeChatLabelColor(label.color),
      name: label.name,
    });
    setErrorMessage(undefined);
  }, []);

  const handleSubmit = React.useCallback(async () => {
    const name = draft.name.trim();
    const color = normalizeChatLabelColor(draft.color);

    if (!name) {
      setErrorMessage('Nama label wajib diisi.');
      return;
    }

    setBusy(true);
    setErrorMessage(undefined);
    try {
      if (editing) {
        await updateKolamChatLabel(editing._id, { color, name });
      } else {
        await createKolamChatLabel({ color, name });
      }
      await refreshLabels();
      resetForm();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Label gagal disimpan.',
      );
    } finally {
      setBusy(false);
    }
  }, [draft.color, draft.name, editing, refreshLabels, resetForm]);

  const handleConfirmDelete = React.useCallback(async () => {
    if (!deleteTarget) {
      return;
    }

    setBusy(true);
    setErrorMessage(undefined);
    try {
      await deleteKolamChatLabel(deleteTarget._id);
      await refreshLabels();
      if (editing?._id === deleteTarget._id) {
        resetForm();
      }
      setDeleteTarget(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Label gagal dihapus.',
      );
    } finally {
      setBusy(false);
    }
  }, [deleteTarget, editing?._id, refreshLabels, resetForm]);

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={styles.chatLabelsDialogHost}>
        <KolamModalBackdrop onPress={onClose} />
        <View
          accessibilityLabel="Popup label percakapan"
          style={styles.chatLabelsDialog}
        >
          <View style={styles.chatLabelsDialogHeader}>
            <View>
              <Text style={styles.chatLabelsDialogTitle}>Label percakapan</Text>
            </View>
            <KolamPressable
              accessibilityLabel="Tutup popup label percakapan"
              disabled={busy}
              onPress={onClose}
              style={styles.chatLabelsCloseButton}
            >
              <Text style={styles.chatLabelsCloseText}>Tutup</Text>
            </KolamPressable>
          </View>

          {errorMessage ? (
            <Text style={styles.chatLabelsError}>{errorMessage}</Text>
          ) : null}

          <View style={styles.chatLabelsBody}>
            <View style={styles.chatLabelsList}>
              <View style={styles.chatLabelsListHeader}>
                <Text style={styles.chatLabelsSectionTitle}>Label</Text>
                <KolamPressable
                  accessibilityLabel="New Label"
                  disabled={busy}
                  onPress={handleNewLabel}
                  style={[
                    styles.chatLabelsSmallButton,
                    busy && styles.attachButtonDisabled,
                  ]}
                >
                  <Text style={styles.chatLabelsSmallButtonText}>
                    New Label
                  </Text>
                </KolamPressable>
              </View>
              {loading ? (
                <Text style={styles.metaText}>Loading...</Text>
              ) : labels.length === 0 ? (
                <Text style={styles.emptyDetailText}>Belum ada label.</Text>
              ) : (
                <ScrollView
                  style={styles.chatLabelsListScroll}
                  showsVerticalScrollIndicator
                >
                  <KolamMappedList
                    items={labels}
                    getKey={label => label._id}
                    renderItem={label => {
                      const isSystemLabel = isSystemChatLabel(label);
                      return (
                        <View style={styles.chatLabelsRow}>
                          <View style={styles.chatLabelsRowMain}>
                            <View
                              style={[
                                styles.chatLabelsColorDot,
                                {
                                  backgroundColor: normalizeChatLabelColor(
                                    label.color,
                                  ),
                                },
                              ]}
                            />
                            <Text
                              numberOfLines={1}
                              style={styles.chatLabelsName}
                            >
                              {label.name}
                            </Text>
                          </View>
                          <View style={styles.chatLabelsRowActions}>
                            <KolamPressable
                              accessibilityLabel={`Edit label ${label.name}`}
                              disabled={busy}
                              onPress={() => handleEditLabel(label)}
                              style={[
                                styles.chatLabelsIconButton,
                                busy && styles.attachButtonDisabled,
                              ]}
                            >
                              <Text style={styles.chatLabelsIconButtonText}>
                                Edit
                              </Text>
                            </KolamPressable>
                            {!isSystemLabel ? (
                              <KolamPressable
                                accessibilityLabel={`Hapus label ${label.name}`}
                                disabled={busy}
                                onPress={() => setDeleteTarget(label)}
                                style={[
                                  styles.chatLabelsIconButton,
                                  styles.chatLabelsDeleteButton,
                                  busy && styles.attachButtonDisabled,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.chatLabelsIconButtonText,
                                    styles.chatLabelsDeleteText,
                                  ]}
                                >
                                  Hapus
                                </Text>
                              </KolamPressable>
                            ) : null}
                          </View>
                        </View>
                      );
                    }}
                  />
                </ScrollView>
              )}
            </View>

            <View style={styles.chatLabelsForm}>
              <Text style={styles.chatLabelsSectionTitle}>
                {editing ? 'Edit Label' : 'New Label'}
              </Text>
              <TextInput
                accessibilityLabel="Name label percakapan"
                editable={!busy}
                maxLength={40}
                onChangeText={name =>
                  setDraft(current => ({
                    ...current,
                    name,
                  }))
                }
                placeholder="Name"
                placeholderTextColor={V.colors.mutedFg}
                style={styles.chatLabelsInput}
                value={draft.name}
              />
              <View style={styles.chatLabelsColorRow}>
                <View
                  accessibilityLabel="Preview warna label"
                  style={[
                    styles.chatLabelsColorPreview,
                    { backgroundColor: normalizeChatLabelColor(draft.color) },
                  ]}
                />
                <TextInput
                  accessibilityLabel="Color label percakapan"
                  editable={!busy}
                  maxLength={7}
                  onChangeText={color =>
                    setDraft(current => ({
                      ...current,
                      color,
                    }))
                  }
                  placeholder="#3b82f6"
                  placeholderTextColor={V.colors.mutedFg}
                  style={[styles.chatLabelsInput, styles.chatLabelsColorInput]}
                  value={draft.color}
                />
              </View>
              <View style={styles.chatLabelsSwatches}>
                {CHAT_LABEL_COLOR_SWATCHES.map(color => (
                  <KolamPressable
                    key={color}
                    accessibilityLabel={`Pilih warna label ${color}`}
                    disabled={busy}
                    onPress={() =>
                      setDraft(current => ({
                        ...current,
                        color,
                      }))
                    }
                    style={[
                      styles.chatLabelsSwatch,
                      { backgroundColor: color },
                      normalizeChatLabelColor(draft.color) === color &&
                        styles.chatLabelsSwatchActive,
                    ]}
                  />
                ))}
              </View>
              <View style={styles.chatLabelsFormActions}>
                {editing ? (
                  <KolamPressable
                    accessibilityLabel="Cancel edit label percakapan"
                    disabled={busy}
                    onPress={resetForm}
                    style={[
                      styles.chatLabelsActionButton,
                      busy && styles.attachButtonDisabled,
                    ]}
                  >
                    <Text style={styles.chatLabelsActionText}>Cancel</Text>
                  </KolamPressable>
                ) : null}
                <KolamPressable
                  accessibilityLabel="Save label percakapan"
                  disabled={busy || !draft.name.trim()}
                  onPress={() => void handleSubmit()}
                  style={[
                    styles.chatLabelsActionButton,
                    styles.chatLabelsActionButtonPrimary,
                    (busy || !draft.name.trim()) && styles.attachButtonDisabled,
                  ]}
                >
                  <Text style={styles.chatLabelsActionPrimaryText}>
                    {busy ? 'Saving...' : 'Save'}
                  </Text>
                </KolamPressable>
              </View>
            </View>
          </View>

          {deleteTarget ? (
            <View style={styles.chatLabelsDeleteConfirm}>
              <Text style={styles.chatLabelsDeleteConfirmTitle}>
                Hapus label?
              </Text>
              <Text style={styles.chatLabelsDeleteConfirmText}>
                {deleteTarget.name}
              </Text>
              <View style={styles.chatLabelsFormActions}>
                <KolamPressable
                  accessibilityLabel="Batal hapus label percakapan"
                  disabled={busy}
                  onPress={() => setDeleteTarget(null)}
                  style={[
                    styles.chatLabelsActionButton,
                    busy && styles.attachButtonDisabled,
                  ]}
                >
                  <Text style={styles.chatLabelsActionText}>Batal</Text>
                </KolamPressable>
                <KolamPressable
                  accessibilityLabel="Konfirmasi hapus label percakapan"
                  disabled={busy}
                  onPress={() => void handleConfirmDelete()}
                  style={[
                    styles.chatLabelsActionButton,
                    styles.chatLabelsActionButtonDanger,
                    busy && styles.attachButtonDisabled,
                  ]}
                >
                  <Text style={styles.chatLabelsActionPrimaryText}>
                    {busy ? 'Menghapus...' : 'Hapus'}
                  </Text>
                </KolamPressable>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function KolamTeamChatCreateRoomPanel({
  busy,
  draft,
  errorMessage,
  message,
  onChange,
  onSubmit,
  onToggle,
  open,
}: {
  busy: boolean;
  draft: KolamTeamChatCreateRoomDraft;
  errorMessage?: string;
  message?: string;
  onChange: React.Dispatch<React.SetStateAction<KolamTeamChatCreateRoomDraft>>;
  onSubmit: () => Promise<void> | void;
  onToggle: () => void;
  open: boolean;
}) {
  if (!open) {
    return null;
  }

  return (
    <KolamModalDialog
      accessibilityLabel="Popup room baru team chat"
      maxHeight="86%"
      maxWidth="92%"
      onClose={onToggle}
      title="Room baru"
      visible={open}
      width={420}
      footer={
        <>
          <KolamPressable
            accessibilityLabel="Tutup popup room baru"
            disabled={busy}
            onPress={onToggle}
            style={styles.chatLabelsCloseButton}
          >
            <Text style={styles.chatLabelsCloseText}>Batal</Text>
          </KolamPressable>
          <KolamPressable
            accessibilityLabel="Simpan room team chat"
            disabled={busy || !draft.name.trim()}
            onPress={() => void onSubmit()}
            style={[
              styles.createRoomSubmit,
              styles.createRoomFooterSubmit,
              (busy || !draft.name.trim()) && styles.attachButtonDisabled,
            ]}
          >
            <Text style={styles.createRoomSubmitText}>
              {busy ? 'Membuat...' : 'Simpan'}
            </Text>
          </KolamPressable>
        </>
      }
    >
      {message ? <Text style={styles.createRoomMessage}>{message}</Text> : null}
      {errorMessage ? (
        <Text style={styles.createRoomError}>{errorMessage}</Text>
      ) : null}

      <View style={styles.createRoomForm}>
        <TextInput
          accessibilityLabel="Nama room team chat"
          editable={!busy}
          onChangeText={name => onChange(current => ({ ...current, name }))}
          placeholder="Nama"
          placeholderTextColor={V.colors.mutedFg}
          style={styles.createRoomInput}
          value={draft.name}
        />
        <View style={styles.createRoomCategoryRow}>
          {(['meeting', 'project'] as const).map(category => (
            <KolamPressable
              key={category}
              accessibilityLabel={`Pilih kategori room ${category}`}
              accessibilityState={{ selected: draft.category === category }}
              disabled={busy}
              onPress={() => onChange(current => ({ ...current, category }))}
              style={[
                styles.createRoomCategoryButton,
                draft.category === category &&
                  styles.createRoomCategoryButtonActive,
                busy && styles.attachButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.createRoomCategoryText,
                  draft.category === category &&
                    styles.createRoomCategoryTextActive,
                ]}
              >
                {category === 'meeting' ? 'Meeting' : 'Project'}
              </Text>
            </KolamPressable>
          ))}
        </View>
        <TextInput
          accessibilityLabel="Deskripsi room team chat"
          editable={!busy}
          multiline
          onChangeText={description =>
            onChange(current => ({ ...current, description }))
          }
          placeholder="Deskripsi"
          placeholderTextColor={V.colors.mutedFg}
          style={[styles.createRoomInput, styles.createRoomDescriptionInput]}
          value={draft.description}
        />
      </View>
    </KolamModalDialog>
  );
}

function KolamTeamChatDirectPanel({
  currentUserId,
  onChangeSearch,
  onOpenDara,
  onOpenUser,
  onToggle,
  state,
}: {
  currentUserId?: string;
  onChangeSearch: (search: string) => void;
  onOpenDara: () => void;
  onOpenUser: (user: KolamUserPickerRow) => void;
  onToggle: () => void;
  state: KolamTeamChatDirectState;
}) {
  const visibleUsers = state.users.filter(user => user._id !== currentUserId);

  return (
    <View style={styles.createRoomPanel}>
      <View style={styles.createRoomHeader}>
        <View style={styles.createRoomCopy}>
          <Text style={styles.createRoomTitle}>Chat pribadi</Text>
          <Text style={styles.createRoomMeta}>Staff atau DARA</Text>
        </View>
        <KolamPressable
          accessibilityLabel="Toggle panel chat pribadi team chat"
          disabled={Boolean(state.busyTarget)}
          onPress={onToggle}
          style={[
            styles.createRoomToggle,
            state.busyTarget && styles.attachButtonDisabled,
          ]}
        >
          <Text style={styles.createRoomToggleText}>
            {state.open ? 'Tutup' : 'Direct'}
          </Text>
        </KolamPressable>
      </View>

      {state.message ? (
        <Text style={styles.createRoomMessage}>{state.message}</Text>
      ) : null}
      {state.errorMessage ? (
        <Text style={styles.createRoomError}>{state.errorMessage}</Text>
      ) : null}

      {state.open ? (
        <View style={styles.createRoomForm}>
          <KolamPressable
            accessibilityLabel="Buka chat pribadi DARA"
            disabled={Boolean(state.busyTarget)}
            onPress={onOpenDara}
            style={[
              styles.directPrimaryButton,
              state.busyTarget && styles.attachButtonDisabled,
            ]}
          >
            <Text style={styles.createRoomSubmitText}>
              {state.busyTarget === 'dara' ? 'Membuka DARA...' : 'Chat DARA'}
            </Text>
          </KolamPressable>

          <TextInput
            accessibilityLabel="Cari staff chat pribadi"
            editable={!state.busyTarget}
            onChangeText={onChangeSearch}
            placeholder="Cari staff"
            placeholderTextColor={V.colors.mutedFg}
            style={styles.createRoomInput}
            value={state.search}
          />

          {state.loading ? (
            <Text style={styles.createRoomMeta}>Memuat staff...</Text>
          ) : null}
          {!state.loading && visibleUsers.length === 0 ? (
            <Text style={styles.createRoomMeta}>Staff belum ditemukan.</Text>
          ) : null}
          {visibleUsers.slice(0, 8).map(user => {
            const label = getUserPickerDisplayName(user);
            return (
              <KolamPressable
                key={user._id}
                accessibilityLabel={`Buka chat pribadi ${label}`}
                disabled={Boolean(state.busyTarget)}
                onPress={() => onOpenUser(user)}
                style={[
                  styles.directUserRow,
                  state.busyTarget && styles.attachButtonDisabled,
                ]}
              >
                <View style={styles.directUserCopy}>
                  <Text style={styles.directUserName}>{label}</Text>
                  {user.username ? (
                    <Text style={styles.createRoomMeta}>@{user.username}</Text>
                  ) : null}
                </View>
                <Text style={styles.directUserActionText}>
                  {state.busyTarget === user._id ? 'Membuka...' : 'Buka'}
                </Text>
              </KolamPressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function KolamTeamChatTrashIcon() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.teamRoomTrashIcon}
    >
      <View style={styles.teamRoomTrashHandle} />
      <View style={styles.teamRoomTrashLid} />
      <View style={styles.teamRoomTrashCan}>
        <View style={styles.teamRoomTrashLine} />
        <View style={styles.teamRoomTrashLine} />
      </View>
    </View>
  );
}

function KolamTeamChatDeleteRoomIcon() {
  return (
    <SvgXml
      accessibilityElementsHidden
      height="100%"
      importantForAccessibility="no-hide-descendants"
      width="100%"
      xml={KOLAM_DELETE_ROOM_ICON_SVG}
    />
  );
}

function KolamTeamChatAddRoomIcon() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.teamChatAddRoomIcon}
    >
      <View style={styles.teamChatAddRoomIconHorizontal} />
      <View style={styles.teamChatAddRoomIconVertical} />
    </View>
  );
}

function KolamChatRailDetailPanel({
  composerText,
  currentUserId,
  daraAvatarUrl,
  katakTerbangAvatarUrl,
  rajaAnemonAvatarUrl,
  pangeranIsopodAvatarUrl,
  canPurgeMessages,
  daraThinkingLiveSignal,
  deleteRoomBusy,
  detail,
  inboxCanReply,
  labels,
  mode,
  onComposerTextChange,
  onPendingAttachmentClear,
  onPendingAttachmentPick,
  onReplyCancel,
  onReplyToMessage,
  onBack,
  onDeleteTeamRoomRequest,
  onSend,
  pendingAttachment,
  replyTarget,
  selectedItem,
  templatesState,
}: {
  composerText: string;
  currentUserId?: string;
  daraAvatarUrl: string | null;
  katakTerbangAvatarUrl: string | null;
  rajaAnemonAvatarUrl: string | null;
  pangeranIsopodAvatarUrl: string | null;
  canPurgeMessages: boolean;
  daraThinkingLiveSignal: KolamDaraThinkingLiveSignal | null;
  deleteRoomBusy: boolean;
  detail: ReturnType<typeof useKolamChatRailDetail>;
  inboxCanReply: boolean;
  labels: KolamChatLabel[];
  mode: KolamGlobalChatRailMode;
  onComposerTextChange: (value: string) => void;
  onPendingAttachmentClear: () => void;
  onPendingAttachmentPick: () => void;
  onReplyCancel: () => void;
  onReplyToMessage: (message: KolamChatRailReplyTarget) => void;
  onBack?: () => void;
  onDeleteTeamRoomRequest: () => void;
  onSend: () => Promise<void> | void;
  pendingAttachment: NativeImagePickerResult | null;
  replyTarget: KolamChatRailReplyTarget | null;
  selectedItem: ReturnType<typeof getChatRailItems>[number];
  templatesState: KolamChatRailTemplatesState;
}) {
  const [templatePickerOpen, setTemplatePickerOpen] = React.useState(false);
  const [marketplacePickerOpen, setMarketplacePickerOpen] =
    React.useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = React.useState(false);
  const [templateSearch, setTemplateSearch] = React.useState('');
  const [marketplaceSearch, setMarketplaceSearch] = React.useState('');
  const [contactDetailsOpen, setContactDetailsOpen] = React.useState(false);
  const [daraThinkingLine, setDaraThinkingLine] = React.useState('');
  const [editingMessageId, setEditingMessageId] = React.useState<string | null>(
    null,
  );
  const [openTeamActionMessageId, setOpenTeamActionMessageId] = React.useState<
    string | null
  >(null);
  const [editingDraft, setEditingDraft] = React.useState('');
  const [messageSearchDraft, setMessageSearchDraft] = React.useState('');
  const [purgeConfirmVisible, setPurgeConfirmVisible] = React.useState(false);
  const [purgeStatusMessage, setPurgeStatusMessage] = React.useState<
    string | null
  >(null);
  const [contactDetailsState, setContactDetailsState] =
    React.useState<KolamChatRailContactDetailsState>({
      data: null,
      loading: false,
    });
  const [marketplacePickerState, setMarketplacePickerState] =
    React.useState<KolamChatRailMarketplacePickerState>({
      items: [],
      loading: false,
    });
  const messageScrollRef = React.useRef<React.ElementRef<
    typeof ScrollView
  > | null>(null);
  const inboxComposerAccess =
    mode === 'inbox'
      ? getInboxComposerAccess(detail.conversation, currentUserId, {
          csCanReply: inboxCanReply,
        })
      : null;
  const inboxComposerBlocked = Boolean(
    inboxComposerAccess &&
      (inboxComposerAccess.disabled ||
        inboxComposerAccess.blockedReason ||
        inboxComposerAccess.lockedBy),
  );
  const marketplaceAttachPlatform =
    mode === 'inbox'
      ? getInboxMarketplaceAttachPlatform(detail.conversation?.platform)
      : null;
  const marketplaceAttachLabel = marketplaceAttachPlatform
    ? formatMarketplaceComposerToolLabel(marketplaceAttachPlatform)
    : '';
  const attachmentLabel = pendingAttachment
    ? getPendingChatAttachmentLabel(pendingAttachment)
    : '';
  const filteredTemplates = React.useMemo(
    () => filterChatTemplates(templatesState.items, templateSearch),
    [templateSearch, templatesState.items],
  );
  const displayedMessages =
    mode === 'team-chat' && detail.messageSearchResults
      ? detail.messageSearchResults
      : detail.messages;
  const displayedMessageScrollKey = React.useMemo(
    () => displayedMessages.map(message => message.id).join('|'),
    [displayedMessages],
  );
  const isMessageSearchActive =
    mode === 'team-chat' && detail.messageSearchResults !== null;
  const mentionQuery =
    mode === 'team-chat' ? getTrailingMentionQuery(composerText) : null;
  const mentionOptions = React.useMemo(
    () =>
      mode === 'team-chat' && mentionQuery !== null
        ? buildTeamMentionOptions(
            detail.teamRoomMetadata.members,
            mentionQuery,
            detail.teamRoomMetadata.daraReplyEnabled,
            detail.teamRoomMetadata.bots,
          )
        : [],
    [
      detail.teamRoomMetadata.bots,
      detail.teamRoomMetadata.daraReplyEnabled,
      detail.teamRoomMetadata.members,
      mentionQuery,
      mode,
    ],
  );

  React.useEffect(() => {
    setTemplatePickerOpen(false);
    setMarketplacePickerOpen(false);
    setEmojiPickerOpen(false);
    setTemplateSearch('');
    setMarketplaceSearch('');
    setMarketplacePickerState({ items: [], loading: false });
    setDaraThinkingLine('');
    setEditingMessageId(null);
    setOpenTeamActionMessageId(null);
    setEditingDraft('');
    setMessageSearchDraft('');
    setPurgeConfirmVisible(false);
    setPurgeStatusMessage(null);
    setContactDetailsOpen(false);
    setContactDetailsState({ data: null, loading: false });
  }, [selectedItem.id]);

  React.useEffect(() => {
    if (!marketplaceAttachPlatform) {
      setMarketplacePickerOpen(false);
      setMarketplaceSearch('');
      setMarketplacePickerState({ items: [], loading: false });
    }
  }, [marketplaceAttachPlatform]);

  React.useEffect(() => {
    if (!marketplacePickerOpen || !marketplaceAttachPlatform) {
      return;
    }

    let active = true;
    setMarketplacePickerState(current => ({
      ...current,
      errorMessage: undefined,
      loading: true,
    }));

    const timer = setTimeout(() => {
      searchKolamChatMarketplaceListings({
        limit: 20,
        platform: marketplaceAttachPlatform,
        q: marketplaceSearch,
      })
        .then(result => {
          if (!active) {
            return;
          }

          setMarketplacePickerState({
            items: result.items,
            loading: false,
          });
        })
        .catch(error => {
          if (!active) {
            return;
          }

          setMarketplacePickerState({
            errorMessage:
              error instanceof Error
                ? error.message
                : 'Listing marketplace belum bisa dibaca.',
            items: [],
            loading: false,
          });
        });
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [marketplaceAttachPlatform, marketplacePickerOpen, marketplaceSearch]);

  React.useEffect(() => {
    if (
      daraThinkingLine &&
      detail.messages.some(
        message => !message.mine && message.author === 'DARA',
      )
    ) {
      setDaraThinkingLine('');
    }
  }, [daraThinkingLine, detail.messages]);

  const scrollMessagesToEnd = React.useCallback(() => {
    messageScrollRef.current?.scrollToEnd({ animated: false });
  }, []);

  React.useEffect(() => {
    scrollMessagesToEnd();
  }, [displayedMessageScrollKey, scrollMessagesToEnd, selectedItem.id]);

  React.useEffect(() => {
    if (
      mode !== 'team-chat' ||
      !daraThinkingLiveSignal ||
      daraThinkingLiveSignal.roomId !== selectedItem.id
    ) {
      return;
    }

    if (daraThinkingLiveSignal.state === 'done') {
      setDaraThinkingLine('');
      return;
    }

    setDaraThinkingLine(
      daraThinkingLiveSignal.line || DARA_THINKING_DEFAULT_LINE,
    );
  }, [daraThinkingLiveSignal, mode, selectedItem.id]);

  const handleComposerInputChange = React.useCallback(
    (value: string) => {
      onComposerTextChange(value);
    },
    [onComposerTextChange],
  );

  const handlePickMention = React.useCallback(
    (username: string) => {
      const tag = `@${username} `;
      const nextText =
        composerText.match(/@([a-zA-Z0-9_.-]{0,32})$/) !== null
          ? composerText.replace(/@([a-zA-Z0-9_.-]{0,32})$/, tag)
          : `${composerText}${
              composerText.endsWith(' ') || !composerText ? '' : ' '
            }${tag}`;

      onComposerTextChange(nextText);
    },
    [composerText, onComposerTextChange],
  );

  const handlePickComposerEmoji = React.useCallback(
    (emoji: string) => {
      const nextText = `${composerText}${composerText ? ' ' : ''}${emoji}`;
      onComposerTextChange(nextText);
      setEmojiPickerOpen(false);
    },
    [composerText, onComposerTextChange],
  );

  const handleSendFromComposer = React.useCallback(async () => {
    if (inboxComposerBlocked) {
      return;
    }

    if (
      shouldShowDaraThinking({
        body: composerText,
        daraReplyEnabled: detail.teamRoomMetadata.daraReplyEnabled,
      })
    ) {
      setDaraThinkingLine(DARA_THINKING_DEFAULT_LINE);
    }

    await onSend();
  }, [
    composerText,
    detail.teamRoomMetadata.daraReplyEnabled,
    inboxComposerBlocked,
    onSend,
  ]);

  const handleSubmitComposer = React.useCallback(() => {
    handleSendFromComposer();
  }, [handleSendFromComposer]);

  const handleComposerKeyPress = React.useCallback(
    (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      const nativeEvent = event.nativeEvent as TextInputKeyPressEventData & {
        shiftKey?: boolean;
      };

      if (nativeEvent.key !== 'Enter' || nativeEvent.shiftKey) {
        return;
      }

      event.preventDefault();
      handleSendFromComposer().catch(() => undefined);
    },
    [handleSendFromComposer],
  );

  const handleStartEditMessage = React.useCallback(
    (
      message: ReturnType<typeof useKolamChatRailDetail>['messages'][number],
    ) => {
      setEditingMessageId(message.id);
      setOpenTeamActionMessageId(null);
      setEditingDraft(message.body);
    },
    [],
  );

  const handleCancelEditMessage = React.useCallback(() => {
    setEditingMessageId(null);
    setEditingDraft('');
  }, []);

  const handleSaveEditMessage = React.useCallback(
    async (messageId: string) => {
      const body = editingDraft.trim();
      if (!body) {
        return;
      }

      await detail.editMessage(messageId, body);
      setEditingMessageId(null);
      setEditingDraft('');
    },
    [detail, editingDraft],
  );

  const handleSearchMessages = React.useCallback(async () => {
    const query = messageSearchDraft.trim();
    if (!query) {
      return;
    }

    await detail.searchTeamMessages(query);
  }, [detail, messageSearchDraft]);

  const handleClearMessageSearch = React.useCallback(() => {
    setMessageSearchDraft('');
    detail.clearTeamMessageSearch();
  }, [detail]);

  React.useEffect(() => {
    if (mode !== 'inbox' || !contactDetailsOpen) {
      return;
    }

    let active = true;
    setContactDetailsState(current => ({
      data: current.data,
      loading: true,
    }));

    getKolamChatContactDetails(selectedItem.id, { ordersLimit: 5 })
      .then(data => {
        if (active) {
          setContactDetailsState({ data, loading: false });
        }
      })
      .catch(error => {
        if (active) {
          setContactDetailsState({
            data: null,
            errorMessage:
              error instanceof Error
                ? error.message
                : 'Detail kontak belum bisa dibaca.',
            loading: false,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [contactDetailsOpen, mode, selectedItem.id]);

  const fullPage = Boolean(onBack);
  const backAccessibilityLabel =
    mode === 'team-chat'
      ? 'Kembali ke daftar room team chat'
      : 'Kembali ke daftar inbox chat';
  const canDeleteSelectedTeamRoom =
    mode === 'team-chat' && canDeleteTeamChatRoom(selectedItem);

  return (
    <>
      <View style={[styles.detailPanel, fullPage && styles.detailPanelFull]}>
        <View
          style={[
            styles.selectedBanner,
            mode === 'team-chat' ? styles.selectedBannerTeam : null,
          ]}
        >
          <View style={styles.selectedTitleRow}>
            {onBack ? (
              <KolamPressable
                accessibilityLabel={backAccessibilityLabel}
                onPress={onBack}
                style={styles.detailBackButton}
              >
                <KolamStatusIndicatorIcon
                  color={V.colors.primary}
                  kind="triangle-left"
                />
              </KolamPressable>
            ) : null}
            <View style={styles.selectedTitleBlock}>
              <Text numberOfLines={1} style={styles.selectedTitle}>
                {selectedItem.title}
              </Text>
              {mode === 'team-chat' ? (
                <Text numberOfLines={1} style={styles.presenceMetaInline}>
                  {formatTeamChatPresence(detail.presence)}
                </Text>
              ) : null}
            </View>
            {mode === 'team-chat' &&
            detail.callConfig.enabled &&
            !detail.activeCall ? (
              <KolamPressable
                accessibilityLabel="Start team chat call"
                disabled={detail.callBusy}
                onPress={detail.startCall}
                style={[
                  styles.detailRoomCallButton,
                  detail.callBusy && styles.composerIconButtonDisabled,
                ]}
              >
                <SvgXml height="100%" width="100%" xml={KOLAM_CALL_ICON_SVG} />
              </KolamPressable>
            ) : null}
            {canDeleteSelectedTeamRoom ? (
              <KolamPressable
                accessibilityLabel={`Hapus room ${selectedItem.title}`}
                disabled={deleteRoomBusy}
                onPress={onDeleteTeamRoomRequest}
                style={[
                  styles.detailDeleteRoomButton,
                  deleteRoomBusy && styles.composerIconButtonDisabled,
                ]}
              >
                <KolamTeamChatDeleteRoomIcon />
              </KolamPressable>
            ) : null}
          </View>
          {mode === 'inbox' && selectedItem.preview ? (
            <Text numberOfLines={2} style={styles.selectedMeta}>
              {selectedItem.preview}
            </Text>
          ) : null}
          {mode === 'team-chat' ? (
            <KolamChatCallStrip currentUserId={currentUserId} detail={detail} />
          ) : null}
          {mode === 'team-chat' ? (
            <View style={styles.messageSearchBar}>
              <TextInput
                accessibilityLabel="Cari pesan team chat"
                editable={!detail.messageSearchLoading}
                onChangeText={setMessageSearchDraft}
                onSubmitEditing={() => void handleSearchMessages()}
                placeholder="Cari pesan..."
                placeholderTextColor={V.colors.mutedFg}
                style={styles.messageSearchInput}
                value={messageSearchDraft}
              />
              <KolamPressable
                accessibilityLabel="Jalankan pencarian pesan team chat"
                disabled={
                  !messageSearchDraft.trim() || detail.messageSearchLoading
                }
                onPress={() => void handleSearchMessages()}
                style={[
                  styles.messageSearchButton,
                  (!messageSearchDraft.trim() || detail.messageSearchLoading) &&
                    styles.attachButtonDisabled,
                ]}
              >
                <Text style={styles.messageSearchButtonText}>
                  {detail.messageSearchLoading ? '...' : 'Cari'}
                </Text>
              </KolamPressable>
              {isMessageSearchActive ? (
                <KolamResetButton
                  accessibilityLabel="Bersihkan pencarian pesan team chat"
                  disabled={detail.messageSearchLoading}
                  onPress={handleClearMessageSearch}
                  style={[
                    styles.messageSearchButton,
                    styles.messageSearchButtonGhost,
                    detail.messageSearchLoading && styles.attachButtonDisabled,
                  ]}
                />
              ) : null}
              {canPurgeMessages ? (
                <KolamPressable
                  accessibilityLabel="Hapus semua chat"
                  disabled={detail.purgingMessages}
                  onPress={() => {
                    setPurgeStatusMessage(null);
                    setPurgeConfirmVisible(true);
                  }}
                  style={[
                    styles.messagePurgeButton,
                    detail.purgingMessages && styles.composerIconButtonDisabled,
                  ]}
                >
                  <KolamTeamChatTrashIcon />
                </KolamPressable>
              ) : null}
            </View>
          ) : null}
          {mode === 'team-chat' && purgeStatusMessage ? (
            <Text style={styles.purgeStatusMeta}>{purgeStatusMessage}</Text>
          ) : null}
          {mode === 'inbox' ? (
            <KolamInboxActionStrip
              currentUserId={currentUserId}
              detail={detail}
              detailsOpen={contactDetailsOpen}
              labels={labels}
              onDetailsToggle={() => setContactDetailsOpen(current => !current)}
            />
          ) : null}
        </View>

        {mode === 'inbox' && contactDetailsOpen ? (
          <KolamChatContactDetailsPanel
            conversation={detail.conversation}
            state={contactDetailsState}
          />
        ) : null}

        {mode === 'inbox' && detail.conversation?.handoverNote?.text ? (
          <KolamInboxHandoverNoteBanner
            note={detail.conversation.handoverNote}
          />
        ) : null}

        <View style={[styles.messagePane, fullPage && styles.messagePaneFull]}>
          {detail.loading ? (
            <Text style={styles.metaText}>Memuat pesan...</Text>
          ) : null}

          {detail.errorMessage ? (
            <Text style={styles.errorText}>{detail.errorMessage}</Text>
          ) : null}

          {!detail.loading &&
          !detail.errorMessage &&
          displayedMessages.length === 0 ? (
            <Text style={styles.emptyDetailText}>
              {isMessageSearchActive
                ? `Tidak ada hasil untuk "${detail.messageSearchQuery}".`
                : 'Belum ada pesan.'}
            </Text>
          ) : null}

          {isMessageSearchActive ? (
            <Text style={styles.messageSearchMeta}>
              {`${displayedMessages.length} hasil untuk "${detail.messageSearchQuery}"`}
            </Text>
          ) : null}

          {displayedMessages.length > 0 ? (
            <ScrollView
              ref={messageScrollRef}
              style={[
                styles.messageScroll,
                fullPage && styles.messageScrollFull,
              ]}
              contentContainerStyle={styles.messageList}
              onContentSizeChange={scrollMessagesToEnd}
              onLayout={scrollMessagesToEnd}
              showsVerticalScrollIndicator
            >
              <KolamMappedList
                items={displayedMessages}
                getKey={message => message.id}
                renderItem={message => {
                  const isEditing = editingMessageId === message.id;
                  const canEdit =
                    mode === 'team-chat'
                      ? canEditTeamChatMessage(message, currentUserId)
                      : canEditInboxMessage(message, currentUserId);
                  const canReply =
                    mode === 'team-chat' ||
                    canReplyToInboxConversation(detail.conversation);

                  return (
                    <View
                      style={[
                        styles.messageBubble,
                        message.mine
                          ? styles.messageBubbleMine
                          : styles.messageBubbleOther,
                      ]}
                    >
                      {mode === 'team-chat' ||
                      isInboxDetailAiMessage(message) ? (
                        <View style={styles.teamMessageAuthorRow}>
                          <View style={styles.teamMessageAvatar}>
                            <KolamProfileAvatarContent
                              imageStyle={styles.teamMessageAvatarImage}
                              imageUrl={
                                mode === 'team-chat'
                                  ? getTeamChatMessageAvatarUrl(
                                      message,
                                      daraAvatarUrl,
                                      {
                                        katakTerbangAvatarUrl,
                                        rajaAnemonAvatarUrl,
                                        pangeranIsopodAvatarUrl,
                                      },
                                    )
                                  : getInboxAiMessageAvatarUrl(
                                      message,
                                      katakTerbangAvatarUrl,
                                    )
                              }
                              initials={getTeamChatMessageInitials(
                                message.author,
                              )}
                              textStyle={styles.teamMessageAvatarText}
                            />
                          </View>
                          <Text style={styles.messageAuthor}>
                            {message.author}
                          </Text>
                          <Text
                            style={[
                              styles.messageMeta,
                              styles.messageMetaInline,
                            ]}
                          >
                            {[
                              formatRelativeTime(message.sentAt),
                              getTeamChatEditedLabel(message),
                              message.status,
                            ]
                              .filter(Boolean)
                              .join(' | ')}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.messageAuthor}>
                          {message.author}
                        </Text>
                      )}
                      {mode === 'team-chat' && message.replyPreview?.body ? (
                        <KolamTeamChatReplyPreviewCard
                          replyPreview={message.replyPreview}
                        />
                      ) : null}
                      {isEditing ? (
                        <View style={styles.editMessageComposer}>
                          <TextInput
                            accessibilityLabel={`Edit pesan ${message.author}`}
                            editable={!detail.sending}
                            multiline
                            onChangeText={setEditingDraft}
                            placeholder="Edit pesan"
                            placeholderTextColor={V.colors.mutedFg}
                            style={styles.editMessageInput}
                            value={editingDraft}
                          />
                          <View style={styles.editMessageActions}>
                            <KolamPressable
                              accessibilityLabel="Batalkan edit pesan chat"
                              disabled={detail.sending}
                              onPress={handleCancelEditMessage}
                              style={[
                                styles.editMessageButton,
                                detail.sending && styles.attachButtonDisabled,
                              ]}
                            >
                              <Text style={styles.editMessageButtonText}>
                                Batal
                              </Text>
                            </KolamPressable>
                            <KolamPressable
                              accessibilityLabel="Simpan edit pesan chat"
                              disabled={!editingDraft.trim() || detail.sending}
                              onPress={() => handleSaveEditMessage(message.id)}
                              style={[
                                styles.editMessageButton,
                                styles.editMessageButtonPrimary,
                                (!editingDraft.trim() || detail.sending) &&
                                  styles.attachButtonDisabled,
                              ]}
                            >
                              <Text style={styles.editMessageButtonPrimaryText}>
                                {detail.sending ? 'Menyimpan' : 'Simpan'}
                              </Text>
                            </KolamPressable>
                          </View>
                        </View>
                      ) : (
                        <>
                          {mode === 'team-chat' ? (
                            message.body ? (
                              <KolamTeamMentionText body={message.body} />
                            ) : null
                          ) : message.body ||
                            message.content ||
                            message.replyContent ||
                            message.daraMeta ? (
                            <KolamInboxRichMessageContent message={message} />
                          ) : null}
                          {message.attachments.length > 0 ? (
                            <KolamChatAttachmentList
                              attachments={message.attachments}
                            />
                          ) : null}
                          {mode === 'team-chat' &&
                          message.linkPreviews.length > 0 ? (
                            <KolamChatLinkPreviewList
                              previews={message.linkPreviews}
                            />
                          ) : null}
                          {mode === 'team-chat' && message.embeds.length > 0 ? (
                            <KolamChatEmbedList embeds={message.embeds} />
                          ) : null}
                          {mode === 'team-chat' ? (
                            <KolamChatReactionControls
                              canEdit={canEdit}
                              disabled={detail.sending}
                              message={message}
                              onClose={() => setOpenTeamActionMessageId(null)}
                              onEdit={() => handleStartEditMessage(message)}
                              onReact={emoji =>
                                detail.reactToMessage(message.id, emoji)
                              }
                              onReply={() =>
                                onReplyToMessage({
                                  author: message.author,
                                  body: getTeamChatReplyTargetBody(message),
                                  id: message.id,
                                })
                              }
                              onToggle={() =>
                                setOpenTeamActionMessageId(current =>
                                  current === message.id ? null : message.id,
                                )
                              }
                              open={openTeamActionMessageId === message.id}
                            />
                          ) : null}
                          {mode === 'inbox' ? (
                            <KolamInboxMessageActions
                              canEdit={canEdit}
                              canReply={canReply}
                              disabled={detail.sending}
                              message={message}
                              onEdit={() => handleStartEditMessage(message)}
                              onReply={() =>
                                onReplyToMessage({
                                  author: message.author,
                                  body: getInboxReplyTargetBody(message),
                                  id: message.id,
                                })
                              }
                            />
                          ) : null}
                        </>
                      )}
                      {mode === 'team-chat' ? null : (
                        <Text style={styles.messageMeta}>
                          {[
                            formatRelativeTime(message.sentAt),
                            getTeamChatEditedLabel(message),
                            message.status,
                          ]
                            .filter(Boolean)
                            .join(' | ')}
                        </Text>
                      )}
                    </View>
                  );
                }}
              />
            </ScrollView>
          ) : null}

          {daraThinkingLine ? (
            <KolamDaraThinkingBubble line={daraThinkingLine} />
          ) : null}
        </View>

        {pendingAttachment ? (
          <View style={styles.pendingAttachment}>
            <Text numberOfLines={1} style={styles.pendingAttachmentText}>
              {attachmentLabel}
            </Text>
            <KolamPressable
              accessibilityLabel="Hapus lampiran chat"
              disabled={detail.sending}
              onPress={onPendingAttachmentClear}
              style={styles.pendingAttachmentRemove}
            >
              <Text style={styles.pendingAttachmentRemoveText}>x</Text>
            </KolamPressable>
          </View>
        ) : null}

        {replyTarget ? (
          <KolamChatReplyComposerStrip
            disabled={detail.sending}
            onCancel={onReplyCancel}
            replyTarget={replyTarget}
          />
        ) : null}

        {mode === 'inbox' && templatePickerOpen ? (
          <KolamChatTemplatePicker
            onClose={() => setTemplatePickerOpen(false)}
            onPick={template => {
              onComposerTextChange(template.body);
              setTemplatePickerOpen(false);
            }}
            onSearchChange={setTemplateSearch}
            search={templateSearch}
            state={templatesState}
            templates={filteredTemplates}
          />
        ) : null}

        {marketplaceAttachPlatform && marketplacePickerOpen ? (
          <KolamChatMarketplaceProductPicker
            disabled={detail.sending || inboxComposerBlocked}
            onClose={() => setMarketplacePickerOpen(false)}
            onPick={item => {
              if (detail.sending || inboxComposerBlocked) {
                return;
              }
              setMarketplacePickerOpen(false);
              detail.sendMarketplaceProduct(item).catch(() => undefined);
            }}
            onSearchChange={setMarketplaceSearch}
            platform={marketplaceAttachPlatform}
            search={marketplaceSearch}
            state={marketplacePickerState}
          />
        ) : null}

        {emojiPickerOpen ? (
          <KolamChatComposerEmojiPicker
            disabled={detail.sending || inboxComposerBlocked}
            onPick={handlePickComposerEmoji}
          />
        ) : null}

        {inboxComposerBlocked ? (
          <KolamInboxComposerGate access={inboxComposerAccess} />
        ) : null}

        {mode === 'team-chat' && mentionOptions.length > 0 ? (
          <KolamTeamMentionPicker
            disabled={detail.sending}
            onPick={handlePickMention}
            options={mentionOptions}
          />
        ) : null}

        <View style={styles.composer}>
          <View
            style={[
              styles.composerShell,
              inboxComposerBlocked && styles.composerShellBlocked,
            ]}
          >
            <TextInput
              accessibilityLabel={
                mode === 'team-chat'
                  ? 'Tulis pesan team chat'
                  : 'Tulis pesan inbox'
              }
              editable={!detail.sending && !inboxComposerBlocked}
              multiline
              onChangeText={handleComposerInputChange}
              onKeyPress={handleComposerKeyPress}
              onSubmitEditing={handleSubmitComposer}
              placeholder={
                mode === 'team-chat' &&
                !detail.teamRoomMetadata.daraReplyEnabled
                  ? 'Tulis pesan... @dara nonaktif'
                  : inboxComposerBlocked
                  ? 'Chat belum bisa dibalas'
                  : 'Tulis pesan...'
              }
              placeholderTextColor={V.colors.mutedFg}
              style={styles.composerInput}
              submitBehavior="submit"
              value={composerText}
            />
            <View style={styles.composerToolbar}>
              <View style={styles.composerToolGroup}>
                {mode === 'team-chat' ? (
                  <KolamPressable
                    accessibilityLabel="Lampirkan file team chat"
                    disabled={detail.sending}
                    onPress={onPendingAttachmentPick}
                    style={[
                      styles.composerIconButton,
                      detail.sending && styles.composerIconButtonDisabled,
                    ]}
                  >
                    <Text style={styles.composerIconButtonText}>+</Text>
                  </KolamPressable>
                ) : null}
                {mode === 'inbox' ? (
                  <KolamPressable
                    accessibilityLabel="Lampirkan gambar inbox"
                    disabled={detail.sending || inboxComposerBlocked}
                    onPress={onPendingAttachmentPick}
                    style={[
                      styles.composerIconButton,
                      (detail.sending || inboxComposerBlocked) &&
                        styles.composerIconButtonDisabled,
                    ]}
                  >
                    <Text style={styles.composerIconButtonText}>+</Text>
                  </KolamPressable>
                ) : null}
                {marketplaceAttachPlatform ? (
                  <KolamPressable
                    accessibilityLabel={marketplaceAttachLabel}
                    disabled={detail.sending || inboxComposerBlocked}
                    onPress={() => {
                      setMarketplacePickerOpen(current => !current);
                      setEmojiPickerOpen(false);
                      setTemplatePickerOpen(false);
                    }}
                    style={[
                      styles.composerIconButton,
                      marketplacePickerOpen && styles.composerIconButtonActive,
                      (detail.sending || inboxComposerBlocked) &&
                        styles.composerIconButtonDisabled,
                    ]}
                  >
                    <KolamPlatformFilterLogo
                      platform={marketplaceAttachPlatform}
                    />
                  </KolamPressable>
                ) : null}
                <KolamPressable
                  accessibilityLabel="Buka emoji chat"
                  disabled={detail.sending || inboxComposerBlocked}
                  onPress={() => {
                    setEmojiPickerOpen(current => !current);
                    setTemplatePickerOpen(false);
                    setMarketplacePickerOpen(false);
                  }}
                  style={[
                    styles.composerIconButton,
                    emojiPickerOpen && styles.composerIconButtonActive,
                    (detail.sending || inboxComposerBlocked) &&
                      styles.composerIconButtonDisabled,
                  ]}
                >
                  <Text style={styles.composerIconButtonText}>:)</Text>
                </KolamPressable>
                {mode === 'inbox' ? (
                  <KolamPressable
                    accessibilityLabel="Buka template chat"
                    disabled={detail.sending || inboxComposerBlocked}
                    onPress={() => {
                      setTemplatePickerOpen(current => !current);
                      setEmojiPickerOpen(false);
                      setMarketplacePickerOpen(false);
                    }}
                    style={[
                      styles.composerIconButton,
                      templatePickerOpen && styles.composerIconButtonActive,
                      (detail.sending || inboxComposerBlocked) &&
                        styles.composerIconButtonDisabled,
                    ]}
                  >
                    <Text style={styles.composerIconButtonText}>T</Text>
                  </KolamPressable>
                ) : null}
              </View>
            </View>
          </View>
        </View>
      </View>
      <KolamConfirmDialog
        cancelLabel="Batal"
        confirmLabel={detail.purgingMessages ? 'Menghapus...' : 'Hapus'}
        destructive
        message="Hapus SEMUA pesan di room ini? Tindakan tidak bisa dibatalkan."
        onCancel={() => {
          if (!detail.purgingMessages) {
            setPurgeConfirmVisible(false);
          }
        }}
        onConfirm={() => {
          void (async () => {
            try {
              const deletedCount = await detail.purgeMessages();
              setPurgeConfirmVisible(false);
              setPurgeStatusMessage(`${deletedCount} pesan dihapus`);
            } catch {
              setPurgeConfirmVisible(false);
            }
          })();
        }}
        title="Hapus semua chat?"
        visible={purgeConfirmVisible}
      />
    </>
  );
}

function KolamChatTemplatePicker({
  onClose,
  onPick,
  onSearchChange,
  search,
  state,
  templates,
}: {
  onClose: () => void;
  onPick: (template: KolamChatTemplate) => void;
  onSearchChange: (value: string) => void;
  search: string;
  state: KolamChatRailTemplatesState;
  templates: KolamChatTemplate[];
}) {
  return (
    <View style={styles.templatePicker}>
      <View style={styles.templatePickerHeader}>
        <View style={styles.templatePickerCopy}>
          <Text style={styles.templatePickerTitle}>Templates</Text>
          <Text style={styles.templatePickerMeta}>
            Pilih template untuk mengisi composer
          </Text>
        </View>
        <KolamPressable
          accessibilityLabel="Tutup template chat"
          onPress={onClose}
          style={styles.templatePickerClose}
        >
          <Text style={styles.templatePickerCloseText}>x</Text>
        </KolamPressable>
      </View>
      <TextInput
        accessibilityLabel="Cari template chat"
        onChangeText={onSearchChange}
        placeholder="Cari template..."
        placeholderTextColor={V.colors.mutedFg}
        style={styles.templateSearchInput}
        value={search}
      />
      {state.loading ? (
        <Text style={styles.templatePickerMessage}>Loading...</Text>
      ) : null}
      {!state.loading && state.errorMessage ? (
        <Text style={styles.templatePickerError}>{state.errorMessage}</Text>
      ) : null}
      {!state.loading && !state.errorMessage && templates.length === 0 ? (
        <Text style={styles.templatePickerMessage}>Tidak ada template.</Text>
      ) : null}
      {!state.loading && !state.errorMessage && templates.length > 0 ? (
        <ScrollView
          style={styles.templateListScroll}
          showsVerticalScrollIndicator
        >
          <KolamMappedList
            items={templates}
            getKey={template => template._id}
            renderItem={template => (
              <KolamPressable
                accessibilityLabel={`Pilih template ${template.title}`}
                onPress={() => onPick(template)}
                style={styles.templateRow}
              >
                <View style={styles.templateRowCopy}>
                  <Text numberOfLines={1} style={styles.templateRowTitle}>
                    {template.title}
                  </Text>
                  <Text numberOfLines={2} style={styles.templateRowBody}>
                    {template.body}
                  </Text>
                </View>
                <Text numberOfLines={1} style={styles.templateCategory}>
                  {template.category}
                </Text>
              </KolamPressable>
            )}
          />
        </ScrollView>
      ) : null}
    </View>
  );
}

function KolamChatMarketplaceProductPicker({
  disabled,
  onClose,
  onPick,
  onSearchChange,
  platform,
  search,
  state,
}: {
  disabled: boolean;
  onClose: () => void;
  onPick: (item: KolamChatMarketplaceListingHit) => void;
  onSearchChange: (value: string) => void;
  platform: 'shopee' | 'tokopedia';
  search: string;
  state: KolamChatRailMarketplacePickerState;
}) {
  const platformLabel = formatInboxPlatform(platform);

  return (
    <View style={styles.marketplacePicker}>
      <View style={styles.templatePickerHeader}>
        <View style={styles.templatePickerCopy}>
          <Text style={styles.templatePickerTitle}>Produk {platformLabel}</Text>
          <Text style={styles.templatePickerMeta}>
            Listing ter-map sync. Attach aktif di fase berikutnya.
          </Text>
        </View>
        <KolamPressable
          accessibilityLabel="Tutup produk marketplace"
          onPress={onClose}
          style={styles.templatePickerClose}
        >
          <Text style={styles.templatePickerCloseText}>x</Text>
        </KolamPressable>
      </View>
      <TextInput
        accessibilityLabel={`Cari produk ${platformLabel}`}
        onChangeText={onSearchChange}
        placeholder="Cari nama atau SKU..."
        placeholderTextColor={V.colors.mutedFg}
        style={styles.templateSearchInput}
        value={search}
      />
      {state.loading ? (
        <Text style={styles.templatePickerMessage}>Loading...</Text>
      ) : null}
      {!state.loading && state.errorMessage ? (
        <Text style={styles.templatePickerError}>{state.errorMessage}</Text>
      ) : null}
      {!state.loading && !state.errorMessage && state.items.length === 0 ? (
        <Text style={styles.templatePickerMessage}>
          {search.trim()
            ? 'Tidak ada listing ter-map untuk pencarian ini.'
            : `Ketik nama/SKU atau tunggu daftar ${platformLabel}.`}
        </Text>
      ) : null}
      {!state.loading && !state.errorMessage && state.items.length > 0 ? (
        <ScrollView
          style={styles.marketplaceListScroll}
          showsVerticalScrollIndicator
        >
          <KolamMappedList
            items={state.items}
            getKey={item =>
              `${item.platform}-${item.entityType}-${item.entityId}-${item.productId}`
            }
            renderItem={item => (
              <KolamPressable
                accessibilityLabel={`Kirim produk ${
                  item.listingName || item.name
                }`}
                disabled={disabled}
                onPress={() => onPick(item)}
                style={[
                  styles.marketplaceListingRow,
                  disabled && styles.marketplaceListingRowDisabled,
                ]}
              >
                <View style={styles.marketplaceListingCopy}>
                  <Text
                    numberOfLines={2}
                    style={styles.marketplaceListingTitle}
                  >
                    {item.listingName || item.name}
                  </Text>
                  <Text numberOfLines={1} style={styles.marketplaceListingMeta}>
                    {formatMarketplaceListingMeta(item)}
                  </Text>
                </View>
                <Text style={styles.marketplaceListingState}>Kirim</Text>
              </KolamPressable>
            )}
          />
        </ScrollView>
      ) : null}
    </View>
  );
}

function KolamInboxComposerGate({
  access,
}: {
  access: KolamInboxComposerAccess | null;
}) {
  if (!access) {
    return null;
  }

  const message =
    access.lockedBy !== null
      ? `Already handle by: ${access.lockedBy}`
      : access.blockedReason ?? 'Chat belum bisa dibalas.';

  return (
    <View style={styles.composerGate}>
      <Text style={styles.composerGateText}>{message}</Text>
    </View>
  );
}

function KolamChatComposerEmojiPicker({
  disabled,
  onPick,
}: {
  disabled: boolean;
  onPick: (emoji: string) => void;
}) {
  return (
    <View style={styles.emojiPicker}>
      <KolamMappedList
        items={CHAT_COMPOSER_EMOJIS}
        getKey={emoji => emoji}
        renderItem={emoji => (
          <KolamPressable
            accessibilityLabel={`Pilih emoji ${emoji}`}
            disabled={disabled}
            onPress={() => onPick(emoji)}
            style={[
              styles.emojiPickerButton,
              disabled && styles.composerIconButtonDisabled,
            ]}
          >
            <Text style={styles.emojiPickerButtonText}>{emoji}</Text>
          </KolamPressable>
        )}
      />
    </View>
  );
}

function KolamTeamMentionPicker({
  disabled,
  onPick,
  options,
}: {
  disabled: boolean;
  onPick: (username: string) => void;
  options: KolamTeamMentionOption[];
}) {
  return (
    <View style={styles.mentionPicker}>
      <Text style={styles.mentionPickerTitle}>Tag anggota</Text>
      <View style={styles.mentionOptionList}>
        <KolamMappedList
          items={options}
          getKey={option => option.id}
          renderItem={option => (
            <KolamPressable
              accessibilityLabel={`Pilih mention ${option.username}`}
              disabled={disabled}
              onPress={() => onPick(option.username)}
              style={[
                styles.mentionOption,
                option.isAi && styles.mentionOptionAi,
                disabled && styles.attachButtonDisabled,
              ]}
            >
              <View
                style={[
                  styles.mentionAvatar,
                  option.isAi && styles.mentionAvatarAi,
                ]}
              >
                <Text style={styles.mentionAvatarText}>
                  {getMentionInitials(option.label)}
                </Text>
              </View>
              <View style={styles.mentionOptionCopy}>
                <Text numberOfLines={1} style={styles.mentionOptionLabel}>
                  {option.label}
                </Text>
                <Text numberOfLines={1} style={styles.mentionOptionUsername}>
                  @{option.username}
                </Text>
              </View>
            </KolamPressable>
          )}
        />
      </View>
    </View>
  );
}

function KolamTeamMentionText({ body }: { body: string }) {
  const parts = splitTeamChatMentionText(body);

  return (
    <Text style={styles.messageBody}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return part.value;
        }

        const isDara = part.username.toLowerCase() === 'dara';
        return (
          <Text
            key={`m-${index}-${part.username}`}
            accessibilityLabel={
              isDara ? 'Mention DARA' : `Mention ${part.username}`
            }
            style={[styles.messageMention, isDara && styles.messageMentionAi]}
          >
            {part.raw}
          </Text>
        );
      })}
    </Text>
  );
}

function KolamTeamChatReplyPreviewCard({
  replyPreview,
}: {
  replyPreview: KolamTeamChatReplyPreview;
}) {
  const senderName = replyPreview.senderName?.trim() || 'Pesan';
  const body = replyPreview.body?.trim() || 'Lampiran';

  return (
    <View
      accessibilityLabel={`Reply preview ${senderName}`}
      style={styles.replyPreviewCard}
    >
      <Text numberOfLines={1} style={styles.replyPreviewSender}>
        {senderName}
      </Text>
      <Text numberOfLines={2} style={styles.replyPreviewBody}>
        {body}
      </Text>
    </View>
  );
}

function getTeamChatReplyTargetBody(
  message: ReturnType<typeof useKolamChatRailDetail>['messages'][number],
) {
  const body = message.body.trim();
  if (body) {
    return body;
  }

  if (message.attachments.length > 0) {
    return message.attachments[0]?.fileName ?? 'Lampiran';
  }

  if (message.embeds.length > 0) {
    return (
      message.embeds[0]?.title?.trim() || message.embeds[0]?.refId || 'Embed'
    );
  }

  if (message.linkPreviews.length > 0) {
    return (
      message.linkPreviews[0]?.title ?? message.linkPreviews[0]?.url ?? 'Link'
    );
  }

  return 'Pesan';
}

function getInboxReplyTargetBody(
  message: ReturnType<typeof useKolamChatRailDetail>['messages'][number],
) {
  const body = message.body.trim();
  if (body) {
    return body;
  }

  const content = message.content;
  if (content?.text?.trim()) {
    return content.text.trim();
  }

  const card = resolveInboxCard(content, message.body);
  if (card?.title) {
    return card.title;
  }

  if (message.attachments.length > 0) {
    return message.attachments[0]?.fileName ?? 'Lampiran';
  }

  if (content?.type === 'image') {
    return content.fileName?.trim() || 'Gambar';
  }

  if (content?.type === 'youtube') {
    return content.youtube?.title?.trim() || 'Video YouTube';
  }

  return 'Pesan';
}

function canEditTeamChatMessage(
  message: ReturnType<typeof useKolamChatRailDetail>['messages'][number],
  currentUserId?: string,
) {
  return Boolean(
    currentUserId &&
      message.senderId &&
      message.senderId === currentUserId &&
      message.author !== 'DARA' &&
      message.body.trim(),
  );
}

function getPendingChatAttachmentLabel(file: NativeImagePickerResult) {
  const name = getNativePickedFileName(file);
  const kind = getNativePickedFileKind(file);

  switch (kind) {
    case 'image':
      return `📷 Gambar ${name}`;
    case 'video':
      return `🎬 Video ${name}`;
    case 'audio':
      return `Audio ${name}`;
    case 'file':
    default:
      return `File ${name}`;
  }
}

function getTeamChatMessageAvatarUrl(
  message: KolamChatRailDetailMessage,
  daraAvatarUrl: string | null,
  botAvatarFallback?: {
    katakTerbangAvatarUrl?: string | null;
    rajaAnemonAvatarUrl?: string | null;
    pangeranIsopodAvatarUrl?: string | null;
  },
) {
  const rawBotAvatar = resolveKolamTeamChatBotAvatarRawUrl({
    botAvatarUrl: message.botAvatarUrl,
    botKey: message.botKey,
    katakTerbangAvatarUrl: botAvatarFallback?.katakTerbangAvatarUrl,
    rajaAnemonAvatarUrl: botAvatarFallback?.rajaAnemonAvatarUrl,
    pangeranIsopodAvatarUrl: botAvatarFallback?.pangeranIsopodAvatarUrl,
  });
  if (rawBotAvatar) {
    return (
      resolveProfilePhotoUrl(rawBotAvatar) ||
      resolveBotAvatarImageUrl(rawBotAvatar)
    );
  }

  if (message.senderIsAi) {
    return daraAvatarUrl || resolveDaraAvatarImageUrl();
  }

  return resolveProfilePhotoUrl(message.senderProfilePicture);
}

function getInboxAiMessageAvatarUrl(
  message: KolamChatRailDetailMessage,
  katakTerbangAvatarUrl: string | null,
) {
  if (!isInboxDetailAiMessage(message)) {
    return resolveProfilePhotoUrl(message.senderProfilePicture);
  }

  return (
    resolveProfilePhotoUrl(message.senderProfilePicture) ||
    katakTerbangAvatarUrl ||
    resolveDaraAvatarImageUrl()
  );
}

function isInboxDetailAiMessage(message: KolamChatRailDetailMessage) {
  const author = message.author.trim().toLowerCase();
  return (
    message.senderIsAi === true ||
    Boolean(message.daraMeta) ||
    author === 'dara' ||
    author.includes('katak terbang')
  );
}

function getTeamChatMessageInitials(author: string) {
  const words = author.trim().split(/\s+/).filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();

  return initials || '?';
}

function getNativePickedFileName(file: NativeImagePickerResult) {
  return (
    file.name?.trim() ||
    file.path?.split(/[\\/]/).pop()?.trim() ||
    file.uri?.split('/').pop()?.trim() ||
    'lampiran'
  );
}

function getNativePickedFileKind(file: NativeImagePickerResult) {
  const mimeType = file.mimeType?.toLowerCase() ?? '';
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  if (mimeType.startsWith('video/')) {
    return 'video';
  }
  if (mimeType.startsWith('audio/')) {
    return 'audio';
  }

  const extension =
    file.extension?.toLowerCase().replace(/^\./, '') ??
    getNativePickedFileName(file).split('.').pop()?.toLowerCase();

  if (extension && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension)) {
    return 'image';
  }
  if (extension && ['mp4', 'mov', 'webm'].includes(extension)) {
    return 'video';
  }
  if (extension && ['mp3', 'wav', 'm4a', 'aac'].includes(extension)) {
    return 'audio';
  }

  return 'file';
}

function canEditInboxMessage(
  message: ReturnType<typeof useKolamChatRailDetail>['messages'][number],
  currentUserId?: string,
) {
  return Boolean(
    currentUserId &&
      message.mine &&
      message.senderId &&
      message.senderId === currentUserId &&
      message.content?.type === 'text' &&
      message.body.trim(),
  );
}

function canReplyToInboxConversation(
  conversation: ReturnType<typeof useKolamChatRailDetail>['conversation'],
) {
  return (
    conversation?.platform === 'store' || conversation?.platform === 'whatsapp'
  );
}

function getTeamChatEditedLabel(
  message: ReturnType<typeof useKolamChatRailDetail>['messages'][number],
) {
  if (!message.editedAt) {
    return '';
  }

  const editorName = message.editedByName?.trim();
  return editorName ? `Diedit oleh ${editorName}` : 'Diedit';
}

function KolamInboxRichMessageContent({
  message,
}: {
  message: ReturnType<typeof useKolamChatRailDetail>['messages'][number];
}) {
  const [lightboxUri, setLightboxUri] = React.useState<string | null>(null);
  const content = message.content;
  const replyContent = message.replyContent;
  const image = resolveInboxImageContent(content, message.body);
  const youtube = resolveInboxYoutube(content, message.body);
  const card = resolveInboxCard(content, message.body);
  const linkedCard = resolveInboxLinkedCard(message.body);

  return (
    <View style={styles.inboxRichStack}>
      {replyContent?.text || replyContent?.imageUrl ? (
        <KolamInboxReplyPreview reply={replyContent} />
      ) : null}
      {youtube ? (
        <KolamInboxYoutubeCard youtube={youtube} />
      ) : card ? (
        <KolamInboxProductCard card={card} />
      ) : linkedCard ? (
        <KolamInboxLinkedCard card={linkedCard} />
      ) : image ? (
        <>
          <KolamPressable
            accessibilityLabel={`Buka gambar inbox ${
              content?.fileName || 'Gambar'
            }`}
            onPress={() => setLightboxUri(image.previewUri)}
            style={styles.inboxRichImagePressable}
          >
            <KolamRemoteImage
              accessibilityLabel={content?.fileName || 'Gambar inbox'}
              resizeMode="contain"
              scope="chat-inbox"
              sourceUri={image.thumbnailUri}
              style={styles.inboxRichImage}
            />
          </KolamPressable>
          {image.caption ? (
            <Text style={styles.inboxRichImageCaption}>{image.caption}</Text>
          ) : null}
          <KolamInboxImageLightbox
            onClose={() => setLightboxUri(null)}
            title={content?.fileName || 'Gambar inbox'}
            uri={lightboxUri}
          />
        </>
      ) : (
        <Text style={styles.messageBody}>{message.body}</Text>
      )}
      {message.daraMeta ? <KolamInboxDaraMeta meta={message.daraMeta} /> : null}
    </View>
  );
}

function KolamInboxReplyPreview({
  reply,
}: {
  reply: NonNullable<
    ReturnType<
      typeof useKolamChatRailDetail
    >['messages'][number]['replyContent']
  >;
}) {
  const imageUri = normalizeChatMediaUri(reply.imageUrl);
  const label = reply.senderName?.trim() || 'Reply';

  return (
    <View accessibilityLabel={`Reply ${label}`} style={styles.inboxReplyCard}>
      <Text numberOfLines={1} style={styles.replyPreviewSender}>
        {label}
      </Text>
      {imageUri ? (
        <KolamRemoteImage
          accessibilityLabel={`Gambar reply ${label}`}
          resizeMode="cover"
          scope="chat-inbox-reply"
          sourceUri={imageUri}
          style={styles.inboxReplyImage}
        />
      ) : null}
      <Text numberOfLines={2} style={styles.replyPreviewBody}>
        {reply.text?.trim() || formatReplyContentType(reply.type)}
      </Text>
    </View>
  );
}

function KolamInboxYoutubeCard({
  youtube,
}: {
  youtube: { title?: string; url: string; videoId?: string };
}) {
  return (
    <KolamPressable
      accessibilityLabel="Buka YouTube inbox"
      onPress={() => openInboxExternalUrl(youtube.url)}
      style={styles.inboxRichCard}
    >
      <View style={styles.inboxRichCardIcon}>
        <Text style={styles.inboxRichCardIconText}>YT</Text>
      </View>
      <View style={styles.inboxRichCardCopy}>
        <Text style={styles.chatPreviewKicker}>YouTube</Text>
        <Text numberOfLines={2} style={styles.chatPreviewTitle}>
          {youtube.title || youtube.videoId || 'Video YouTube'}
        </Text>
        <Text numberOfLines={1} style={styles.chatPreviewUrl}>
          {youtube.url}
        </Text>
      </View>
    </KolamPressable>
  );
}

function KolamInboxProductCard({ card }: { card: KolamInboxResolvedCard }) {
  const content = (
    <>
      {card.imageUrl ? (
        <KolamRemoteImage
          accessibilityLabel={`Gambar ${card.title}`}
          resizeMode="cover"
          scope="chat-inbox-card"
          sourceUri={card.imageUrl}
          style={styles.inboxRichCardImage}
        />
      ) : (
        <View style={styles.inboxRichCardIcon}>
          <Text style={styles.inboxRichCardIconText}>
            {card.kind === 'species' ? 'SP' : 'PR'}
          </Text>
        </View>
      )}
      <View style={styles.inboxRichCardCopy}>
        <Text style={styles.chatPreviewKicker}>{card.label}</Text>
        <Text numberOfLines={2} style={styles.chatPreviewTitle}>
          {card.title}
        </Text>
        {card.priceLabel ? (
          <Text numberOfLines={1} style={styles.inboxRichCardStrong}>
            {card.priceLabel}
          </Text>
        ) : null}
        {card.sku || card.marketplaceId ? (
          <Text numberOfLines={1} style={styles.chatPreviewDescription}>
            {[card.sku ? `SKU ${card.sku}` : '', card.marketplaceId]
              .filter(Boolean)
              .join(' | ')}
          </Text>
        ) : null}
        {typeof card.stock === 'number' ? (
          <Text numberOfLines={1} style={styles.chatPreviewDescription}>
            Stok: {formatMetricNumber(card.stock)}
          </Text>
        ) : null}
        {card.actionUrl ? (
          <Text numberOfLines={1} style={styles.chatPreviewUrl}>
            {card.actionUrl}
          </Text>
        ) : null}
      </View>
    </>
  );

  if (card.actionUrl) {
    return (
      <KolamPressable
        accessibilityLabel={`Buka card ${card.title}`}
        onPress={() => openInboxExternalUrl(card.actionUrl)}
        style={styles.inboxRichCard}
      >
        {content}
      </KolamPressable>
    );
  }

  return (
    <View
      accessibilityLabel={`Card ${card.title}`}
      style={styles.inboxRichCard}
    >
      {content}
    </View>
  );
}

function KolamInboxLinkedCard({ card }: { card: KolamInboxLinkedCardData }) {
  const content = (
    <>
      <View style={styles.inboxRichCardIcon}>
        <Text style={styles.inboxRichCardIconText}>{card.icon}</Text>
      </View>
      <View style={styles.inboxRichCardCopy}>
        <Text style={styles.chatPreviewKicker}>{card.label}</Text>
        <Text numberOfLines={2} style={styles.chatPreviewTitle}>
          {card.title}
        </Text>
        {card.subtitle ? (
          <Text numberOfLines={1} style={styles.chatPreviewDescription}>
            {card.subtitle}
          </Text>
        ) : null}
      </View>
    </>
  );

  if (card.actionUrl) {
    return (
      <KolamPressable
        accessibilityLabel={`Buka linked card ${card.title}`}
        onPress={() => openInboxExternalUrl(card.actionUrl)}
        style={styles.inboxRichCard}
      >
        {content}
      </KolamPressable>
    );
  }

  return (
    <View
      accessibilityLabel={`Linked card ${card.title}`}
      style={styles.inboxRichCard}
    >
      {content}
    </View>
  );
}

function KolamInboxImageLightbox({
  onClose,
  title,
  uri,
}: {
  onClose: () => void;
  title: string;
  uri: string | null;
}) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={Boolean(uri)}
    >
      <View style={styles.inboxLightboxRoot}>
        <KolamModalBackdrop onPress={onClose} />
        <View style={styles.inboxLightboxFrame}>
          {uri ? (
            <KolamRemoteImage
              accessibilityLabel={`Preview ${title}`}
              resizeMode="contain"
              scope="chat-inbox-lightbox"
              sourceUri={uri}
              style={styles.inboxLightboxImage}
            />
          ) : null}
          <KolamPressable
            accessibilityLabel="Tutup gambar inbox"
            onPress={onClose}
            style={styles.inboxLightboxClose}
          >
            <Text style={styles.inboxLightboxCloseText}>Tutup</Text>
          </KolamPressable>
        </View>
      </View>
    </Modal>
  );
}

function KolamInboxDaraMeta({
  meta,
}: {
  meta: NonNullable<
    ReturnType<typeof useKolamChatRailDetail>['messages'][number]['daraMeta']
  >;
}) {
  const title = formatDaraMetaTitle(meta);
  const subtitle = [
    meta.matchStatus ? `Match: ${meta.matchStatus}` : '',
    meta.suggestedDisplayName || meta.suggestedScientificName || '',
    meta.invoiceCode ? `Invoice ${meta.invoiceCode}` : '',
  ]
    .filter(Boolean)
    .join(' | ');

  return (
    <View accessibilityLabel="Metadata DARA inbox" style={styles.inboxDaraMeta}>
      <Text style={styles.chatPreviewKicker}>{title}</Text>
      {subtitle ? (
        <Text numberOfLines={2} style={styles.chatPreviewDescription}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

function KolamChatReplyComposerStrip({
  disabled,
  onCancel,
  replyTarget,
}: {
  disabled: boolean;
  onCancel: () => void;
  replyTarget: KolamChatRailReplyTarget;
}) {
  return (
    <View
      accessibilityLabel={`Membalas pesan ${replyTarget.author}`}
      style={styles.replyComposerStrip}
    >
      <View style={styles.replyComposerCopy}>
        <Text numberOfLines={1} style={styles.replyComposerTitle}>
          Balas {replyTarget.author}
        </Text>
        <Text numberOfLines={2} style={styles.replyComposerBody}>
          {replyTarget.body}
        </Text>
      </View>
      <KolamPressable
        accessibilityLabel="Batalkan balasan chat"
        disabled={disabled}
        onPress={onCancel}
        style={[
          styles.replyComposerCancel,
          disabled && styles.attachButtonDisabled,
        ]}
      >
        <Text style={styles.replyComposerCancelText}>x</Text>
      </KolamPressable>
    </View>
  );
}

function KolamDaraThinkingBubble({ line }: { line: string }) {
  return (
    <View
      accessibilityLabel="DARA thinking bubble"
      style={styles.daraThinkingRow}
    >
      <View style={styles.daraThinkingAvatar}>
        <Text style={styles.daraThinkingAvatarText}>DA</Text>
      </View>
      <View style={styles.daraThinkingCopy}>
        <Text style={styles.daraThinkingAuthor}>DARA</Text>
        <Text style={styles.daraThinkingText}>
          {line || DARA_THINKING_DEFAULT_LINE}
        </Text>
      </View>
    </View>
  );
}

function KolamChatContactDetailsPanel({
  conversation,
  state,
}: {
  conversation: ReturnType<typeof useKolamChatRailDetail>['conversation'];
  state: KolamChatRailContactDetailsState;
}) {
  const displayName = getConversationTitle({
    contactId: conversation?.contactId,
    platform: conversation?.platform,
  });
  const customer = state.data?.customer ?? null;
  const metrics = state.data?.metrics ?? {
    ordersCount: 0,
    totalOrders: 0,
    totalSpend: 0,
  };
  const recentOrders = state.data?.recentOrders ?? [];

  return (
    <View style={styles.contactDetailsPanel}>
      <View style={styles.contactDetailsHeader}>
        <View style={styles.contactAvatar}>
          <Text style={styles.contactAvatarText}>
            {getContactInitial(displayName)}
          </Text>
        </View>
        <View style={styles.contactHeaderCopy}>
          <Text numberOfLines={1} style={styles.contactName}>
            {displayName}
          </Text>
          <Text numberOfLines={1} style={styles.contactPlatform}>
            {formatInboxPlatform(conversation?.platform)}
          </Text>
        </View>
      </View>

      {state.loading ? (
        <Text style={styles.contactDetailsMessage}>
          Memuat detail kontak...
        </Text>
      ) : null}

      {!state.loading && state.errorMessage ? (
        <Text style={styles.contactDetailsError}>{state.errorMessage}</Text>
      ) : null}

      {!state.loading && !state.errorMessage ? (
        <ScrollView
          style={styles.contactDetailsScroll}
          showsVerticalScrollIndicator
        >
          <View style={styles.contactDetailsContent}>
            <KolamContactDetailsSection title="CONTACT">
              <KolamContactDetailRow
                label="Phone"
                value={customer?.phone || '-'}
              />
              <KolamContactDetailRow
                label="Email"
                value={customer?.email || '-'}
              />
              <KolamContactDetailRow
                label="Joined"
                value={
                  customer?.createdAt
                    ? formatJoinedMonth(customer.createdAt)
                    : '-'
                }
              />
            </KolamContactDetailsSection>

            {customer ? (
              <KolamContactDetailsSection title="ACTIVITY">
                <KolamContactDetailRow
                  label="Total orders"
                  value={formatInteger(metrics.totalOrders)}
                />
                <KolamContactDetailRow
                  label="Total spend"
                  value={formatRupiah(metrics.totalSpend)}
                />
              </KolamContactDetailsSection>
            ) : null}

            {recentOrders.length > 0 ? (
              <KolamContactDetailsSection
                title={`ORDER HISTORY (${metrics.ordersCount})`}
              >
                <View style={styles.orderList}>
                  <KolamMappedList
                    items={recentOrders}
                    getKey={order => order._id}
                    renderItem={order => <KolamContactOrderRow order={order} />}
                  />
                </View>
              </KolamContactDetailsSection>
            ) : null}

            {!customer ? (
              <View style={styles.contactUnlinkedBox}>
                <Text style={styles.contactUnlinkedTitle}>
                  Kontak belum terhubung ke customer.
                </Text>
                <Text style={styles.contactUnlinkedCopy}>
                  Hubungkan lewat halaman Customer untuk melihat riwayat order.
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

function KolamContactDetailsSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <View style={styles.contactSection}>
      <Text style={styles.contactSectionTitle}>{title}</Text>
      <View style={styles.contactSectionBody}>{children}</View>
    </View>
  );
}

function KolamContactDetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.contactDetailRow}>
      <Text style={styles.contactDetailLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.contactDetailValue}>
        {value}
      </Text>
    </View>
  );
}

function KolamContactOrderRow({ order }: { order: KolamChatContactOrder }) {
  return (
    <View style={styles.orderRow}>
      <View style={styles.orderCopy}>
        <Text numberOfLines={1} style={styles.orderInvoice}>
          {order.invoiceCode}
        </Text>
        <Text numberOfLines={1} style={styles.orderMeta}>
          {[
            formatOrderDate(order.transactionDate),
            `${order.itemsCount ?? 0} item`,
          ]
            .filter(Boolean)
            .join(' | ')}
        </Text>
      </View>
      <View style={styles.orderAmountGroup}>
        <Text numberOfLines={1} style={styles.orderAmount}>
          {formatRupiah(order.finalTotal ?? 0)}
        </Text>
        <Text style={styles.orderStatus}>
          {formatOrderStatus(order.status)}
        </Text>
      </View>
    </View>
  );
}

function KolamInboxActionStrip({
  currentUserId,
  detail,
  detailsOpen,
  labels,
  onDetailsToggle,
}: {
  currentUserId?: string;
  detail: ReturnType<typeof useKolamChatRailDetail>;
  detailsOpen: boolean;
  labels: KolamChatLabel[];
  onDetailsToggle: () => void;
}) {
  const [labelPickerOpen, setLabelPickerOpen] = React.useState(false);
  const [handoverNoteOpen, setHandoverNoteOpen] = React.useState(false);
  const [handoverNoteDraft, setHandoverNoteDraft] = React.useState('');
  const conversation = detail.conversation;
  if (!conversation) {
    return null;
  }

  const isClosed = conversation.status === 'closed';
  const assignedStaffId = getChatStaffId(conversation.assignedStaffId);
  const assignedToMe = Boolean(
    currentUserId && assignedStaffId && assignedStaffId === currentUserId,
  );
  const assignedLabel = getChatStaffLabel(conversation.assignedStaffId);
  const displayLabels = getConversationLabels(conversation, labels);
  const activeLabelIds = new Set(getConversationLabelIds(conversation));
  const handleToggleLabel = (labelId: string) => {
    const nextLabelIds = activeLabelIds.has(labelId)
      ? Array.from(activeLabelIds).filter(id => id !== labelId)
      : [...Array.from(activeLabelIds), labelId];

    void detail.setInboxLabels(nextLabelIds);
  };
  const handleSubmitHandoverNote = async () => {
    const note = handoverNoteDraft.trim();
    await detail.assignInboxToMe(note || undefined);
    setHandoverNoteDraft('');
    setHandoverNoteOpen(false);
  };

  return (
    <View style={styles.inboxActionStrip}>
      {displayLabels.length > 0 ? (
        <View style={styles.inboxLabelRow}>
          <KolamMappedList
            items={displayLabels}
            getKey={label => label._id}
            renderItem={label => <KolamChatLabelPill label={label} />}
          />
        </View>
      ) : null}
      <View style={styles.inboxActionMeta}>
        <Text style={styles.inboxActionTitle}>
          {isClosed ? 'Ditutup' : 'Open'}
        </Text>
        <Text numberOfLines={1} style={styles.inboxActionCopy}>
          {assignedLabel
            ? `CS: ${assignedLabel}`
            : conversation.isAiHandled
            ? 'DARA menangani'
            : 'Belum ditugaskan'}
        </Text>
      </View>
      <View style={styles.inboxActionButtons}>
        <KolamPressable
          accessibilityLabel="Toggle inbox label picker"
          disabled={detail.sending}
          onPress={() => setLabelPickerOpen(current => !current)}
          style={[
            styles.callButton,
            styles.callButtonGhost,
            labelPickerOpen && styles.callButtonActive,
            detail.sending && styles.callButtonDisabled,
          ]}
        >
          <Text style={styles.callButtonGhostText}>Label</Text>
        </KolamPressable>
        <KolamPressable
          accessibilityLabel="Toggle inbox contact details"
          disabled={detail.sending}
          onPress={onDetailsToggle}
          style={[
            styles.callButton,
            styles.callButtonGhost,
            detailsOpen && styles.callButtonActive,
            detail.sending && styles.callButtonDisabled,
          ]}
        >
          <Text style={styles.callButtonGhostText}>Detail kontak</Text>
        </KolamPressable>
        <KolamPressable
          accessibilityLabel="Toggle inbox conversation status"
          disabled={detail.sending}
          onPress={detail.toggleInboxStatus}
          style={[
            styles.callButton,
            detail.sending && styles.callButtonDisabled,
          ]}
        >
          <Text style={styles.callButtonText}>
            {isClosed ? 'Reopen' : 'Resolve'}
          </Text>
        </KolamPressable>
        {!isClosed && !assignedToMe && currentUserId ? (
          <KolamPressable
            accessibilityLabel="Assign inbox conversation to me"
            disabled={detail.sending}
            onPress={() => {
              setHandoverNoteOpen(current => !current);
              setLabelPickerOpen(false);
            }}
            style={[
              styles.callButton,
              styles.callButtonGhost,
              handoverNoteOpen && styles.callButtonActive,
              detail.sending && styles.callButtonDisabled,
            ]}
          >
            <Text style={styles.callButtonGhostText}>Assign saya</Text>
          </KolamPressable>
        ) : null}
        {!isClosed ? (
          <KolamPressable
            accessibilityLabel="Toggle inbox AI handled"
            disabled={detail.sending}
            onPress={detail.toggleInboxAiHandled}
            style={[
              styles.callButton,
              styles.callButtonGhost,
              detail.sending && styles.callButtonDisabled,
            ]}
          >
            <Text style={styles.callButtonGhostText}>
              {conversation.isAiHandled ? 'AI off' : 'AI on'}
            </Text>
          </KolamPressable>
        ) : null}
      </View>
      {handoverNoteOpen ? (
        <View style={styles.inboxHandoverNotePanel}>
          <KolamNotesField
            accessibilityLabel="Catatan handover inbox"
            editable={!detail.sending}
            label="Catatan handover"
            onChangeText={setHandoverNoteDraft}
            placeholder="Tulis konteks singkat untuk CS berikutnya"
            value={handoverNoteDraft}
          />
          <View style={styles.inboxHandoverNoteActions}>
            <KolamPressable
              accessibilityLabel="Batalkan catatan handover inbox"
              disabled={detail.sending}
              onPress={() => {
                setHandoverNoteDraft('');
                setHandoverNoteOpen(false);
              }}
              style={[
                styles.callButton,
                styles.callButtonGhost,
                detail.sending && styles.callButtonDisabled,
              ]}
            >
              <Text style={styles.callButtonGhostText}>Batal</Text>
            </KolamPressable>
            <KolamPressable
              accessibilityLabel="Kirim catatan handover inbox"
              disabled={detail.sending}
              onPress={() => void handleSubmitHandoverNote()}
              style={[
                styles.callButton,
                detail.sending && styles.callButtonDisabled,
              ]}
            >
              <Text style={styles.callButtonText}>
                {detail.sending ? 'Mengirim...' : 'Assign'}
              </Text>
            </KolamPressable>
          </View>
        </View>
      ) : null}
      {labelPickerOpen ? (
        <KolamInboxLabelPicker
          activeLabelIds={activeLabelIds}
          disabled={detail.sending}
          labels={labels}
          onToggleLabel={handleToggleLabel}
        />
      ) : null}
    </View>
  );
}

function KolamChatLabelPill({ label }: { label: KolamChatLabel }) {
  return (
    <View style={styles.inboxLabelPill}>
      <View
        style={[
          styles.inboxLabelDot,
          { backgroundColor: normalizeChatLabelColor(label.color) },
        ]}
      />
      <Text numberOfLines={1} style={styles.inboxLabelText}>
        {label.name}
      </Text>
    </View>
  );
}

function KolamInboxLabelPicker({
  activeLabelIds,
  disabled,
  labels,
  onToggleLabel,
}: {
  activeLabelIds: Set<string>;
  disabled: boolean;
  labels: KolamChatLabel[];
  onToggleLabel: (labelId: string) => void;
}) {
  return (
    <View style={styles.inboxLabelPicker}>
      <Text style={styles.inboxLabelPickerTitle}>Label percakapan</Text>
      {labels.length === 0 ? (
        <Text style={styles.inboxLabelPickerEmpty}>Belum ada label.</Text>
      ) : (
        <View style={styles.inboxLabelOptionList}>
          <KolamMappedList
            items={labels}
            getKey={label => label._id}
            renderItem={label => {
              const active = activeLabelIds.has(label._id);
              return (
                <KolamPressable
                  accessibilityLabel={`Toggle label ${label.name}`}
                  disabled={disabled}
                  onPress={() => onToggleLabel(label._id)}
                  style={[
                    styles.inboxLabelOption,
                    active && styles.inboxLabelOptionActive,
                    disabled && styles.callButtonDisabled,
                  ]}
                >
                  <View
                    style={[
                      styles.inboxLabelDot,
                      { backgroundColor: normalizeChatLabelColor(label.color) },
                    ]}
                  />
                  <Text numberOfLines={1} style={styles.inboxLabelOptionText}>
                    {label.name}
                  </Text>
                  <Text style={styles.inboxLabelOptionMark}>
                    {active ? 'On' : 'Off'}
                  </Text>
                </KolamPressable>
              );
            }}
          />
        </View>
      )}
    </View>
  );
}

function KolamInboxHandoverNoteBanner({
  note,
}: {
  note: KolamChatHandoverNote;
}) {
  const text = note.text?.trim();
  if (!text) {
    return null;
  }

  const fromName = getChatStaffLabel(note.fromStaffId);
  const toName = getChatStaffLabel(note.toStaffId);

  return (
    <View
      accessibilityLabel="Catatan handover percakapan"
      style={styles.inboxHandoverBanner}
    >
      <Text style={styles.inboxHandoverBannerTitle}>Catatan handover</Text>
      {fromName || toName ? (
        <Text style={styles.inboxHandoverBannerRoute}>
          {fromName || '-'} {'->'} {toName || '-'}
        </Text>
      ) : null}
      <Text style={styles.inboxHandoverBannerText}>{text}</Text>
    </View>
  );
}

function KolamChatCallStrip({
  currentUserId,
  detail,
}: {
  currentUserId?: string;
  detail: ReturnType<typeof useKolamChatRailDetail>;
}) {
  if (!detail.callConfig.enabled) {
    return null;
  }

  const activeCall = detail.activeCall;
  const primaryLabel = detail.callBusy
    ? 'Memproses...'
    : activeCall
    ? getCallStatusLabel(activeCall.status)
    : null;
  const secondaryLabel = activeCall
    ? `${
        activeCall.participantCount ?? activeCall.participants?.length ?? 0
      } peserta`
    : null;
  const showCallCopy = Boolean(
    primaryLabel || detail.callErrorMessage || secondaryLabel,
  );
  const myParticipant = activeCall?.participants?.find(
    participant => getCallParticipantUserId(participant) === currentUserId,
  );
  const handRaised = myParticipant?.handRaised === true;
  const noAnswerCount =
    activeCall?.participants?.filter(participant =>
      ['declined', 'no_answer'].includes(participant.status),
    ).length ?? 0;
  const participantControls =
    activeCall?.participants
      ?.map(participant => ({
        participant,
        userId: getCallParticipantUserId(participant),
      }))
      .filter(item => item.userId && item.userId !== currentUserId)
      .slice(0, 3) ?? [];

  return (
    <View style={[styles.callStrip, !activeCall && styles.callStripIdle]}>
      <View style={styles.callTopLine}>
        {showCallCopy ? (
          <View style={styles.callCopy}>
            {primaryLabel ? (
              <Text style={styles.callTitle}>{primaryLabel}</Text>
            ) : null}
            {detail.callErrorMessage || secondaryLabel ? (
              <Text numberOfLines={1} style={styles.callMeta}>
                {detail.callErrorMessage || secondaryLabel}
              </Text>
            ) : null}
          </View>
        ) : null}
        <View style={styles.callActions}>
          {activeCall ? (
            <>
              <KolamPressable
                accessibilityLabel="Join team chat call"
                disabled={detail.callBusy}
                onPress={detail.joinCall}
                style={[
                  styles.callButton,
                  detail.callBusy && styles.callButtonDisabled,
                ]}
              >
                <Text style={styles.callButtonText}>Join</Text>
              </KolamPressable>
              {activeCall.status === 'ringing' ? (
                <KolamPressable
                  accessibilityLabel="Decline team chat call"
                  disabled={detail.callBusy}
                  onPress={detail.declineCall}
                  style={[
                    styles.callButton,
                    styles.callButtonGhost,
                    detail.callBusy && styles.callButtonDisabled,
                  ]}
                >
                  <Text style={styles.callButtonGhostText}>Tolak</Text>
                </KolamPressable>
              ) : null}
              <KolamPressable
                accessibilityLabel="End team chat call"
                disabled={detail.callBusy}
                onPress={detail.endCall}
                style={[
                  styles.callButton,
                  styles.callButtonDanger,
                  detail.callBusy && styles.callButtonDisabled,
                ]}
              >
                <Text style={styles.callButtonText}>End</Text>
              </KolamPressable>
            </>
          ) : null}
        </View>
      </View>
      {activeCall ? (
        <View style={styles.callAdvancedActions}>
          {myParticipant?.status === 'joined' ? (
            <KolamPressable
              accessibilityLabel="Toggle team chat call hand"
              disabled={detail.callBusy}
              onPress={detail.toggleCallHand}
              style={[
                styles.callButton,
                styles.callButtonGhost,
                detail.callBusy && styles.callButtonDisabled,
              ]}
            >
              <Text style={styles.callButtonGhostText}>
                {handRaised ? 'Turunkan' : 'Raise'}
              </Text>
            </KolamPressable>
          ) : null}
          {noAnswerCount > 0 ? (
            <KolamPressable
              accessibilityLabel="Redial team chat call"
              disabled={detail.callBusy}
              onPress={detail.redialCall}
              style={[
                styles.callButton,
                styles.callButtonGhost,
                detail.callBusy && styles.callButtonDisabled,
              ]}
            >
              <Text style={styles.callButtonGhostText}>
                Ulang {noAnswerCount}
              </Text>
            </KolamPressable>
          ) : null}
          <KolamPressable
            accessibilityLabel="Handover team chat call"
            disabled={detail.callBusy}
            onPress={detail.handoverCall}
            style={[
              styles.callButton,
              styles.callButtonGhost,
              detail.callBusy && styles.callButtonDisabled,
            ]}
          >
            <Text style={styles.callButtonGhostText}>Handover</Text>
          </KolamPressable>
        </View>
      ) : null}
      {participantControls.length > 0 ? (
        <View style={styles.callParticipantList}>
          <KolamMappedList
            items={participantControls}
            getKey={item => item.userId ?? 'participant'}
            renderItem={({ participant, userId }) => (
              <View style={styles.callParticipantRow}>
                <Text numberOfLines={1} style={styles.callParticipantText}>
                  {getCallParticipantLabel(participant)}
                </Text>
                <KolamPressable
                  accessibilityLabel={`${
                    participant.muted ? 'Unmute' : 'Mute'
                  } team chat participant`}
                  disabled={detail.callBusy || !userId}
                  onPress={() =>
                    userId
                      ? participant.muted
                        ? detail.unmuteCallParticipant(userId)
                        : detail.muteCallParticipant(userId)
                      : undefined
                  }
                  style={[
                    styles.callButton,
                    styles.callButtonGhost,
                    detail.callBusy && styles.callButtonDisabled,
                  ]}
                >
                  <Text style={styles.callButtonGhostText}>
                    {participant.muted ? 'Unmute' : 'Mute'}
                  </Text>
                </KolamPressable>
              </View>
            )}
          />
        </View>
      ) : null}
    </View>
  );
}

function KolamChatAttachmentList({
  attachments,
}: {
  attachments: KolamTeamChatAttachment[];
}) {
  return (
    <View style={styles.attachmentList}>
      <KolamMappedList
        items={attachments}
        getKey={(attachment, index) =>
          `${attachment.url}-${attachment.fileName ?? attachment.kind}-${index}`
        }
        renderItem={attachment => (
          <KolamChatAttachmentPreview attachment={attachment} />
        )}
      />
    </View>
  );
}

function KolamChatAttachmentPreview({
  attachment,
}: {
  attachment: KolamTeamChatAttachment;
}) {
  const fileName = getAttachmentFileName(attachment);
  const sourceUri = getKolamFileUrl(attachment.url) ?? attachment.url;

  if (attachment.kind === 'image') {
    return (
      <View style={styles.attachmentImageShell}>
        <KolamRemoteImage
          accessibilityLabel={`Lampiran ${fileName}`}
          sourceUri={sourceUri}
          style={styles.attachmentImage}
        />
      </View>
    );
  }

  if (attachment.kind === 'video') {
    return (
      <KolamPressable
        accessibilityLabel={`Buka video ${fileName}`}
        onPress={() =>
          openKolamMediaPreview({
            kind: 'video',
            title: fileName,
            uri: sourceUri,
          })
        }
        style={styles.attachmentVideoRow}
      >
        <View style={styles.attachmentVideoThumb}>
          <Text style={styles.attachmentVideoText}>Video</Text>
        </View>
        <View style={styles.attachmentFileCopy}>
          <Text numberOfLines={1} style={styles.attachmentFileName}>
            {fileName}
          </Text>
          <Text numberOfLines={1} style={styles.attachmentFileMeta}>
            {attachment.mimeType || sourceUri}
          </Text>
        </View>
        <Text style={styles.attachmentOpenText}>Open</Text>
      </KolamPressable>
    );
  }

  return (
    <View style={styles.attachmentFileRow}>
      <View style={styles.attachmentKindBadge}>
        <Text style={styles.attachmentKindText}>
          {getAttachmentKindLabel(attachment)}
        </Text>
      </View>
      <View style={styles.attachmentFileCopy}>
        <Text numberOfLines={1} style={styles.attachmentFileName}>
          {fileName}
        </Text>
        <Text numberOfLines={1} style={styles.attachmentFileMeta}>
          {attachment.mimeType || sourceUri}
        </Text>
      </View>
    </View>
  );
}

function KolamChatLinkPreviewList({
  previews,
}: {
  previews: KolamTeamChatLinkPreview[];
}) {
  return (
    <View style={styles.chatPreviewList}>
      <KolamMappedList
        items={previews}
        getKey={(preview, index) => `${preview.url}-${index}`}
        renderItem={preview => <KolamChatLinkPreview preview={preview} />}
      />
    </View>
  );
}

function KolamChatLinkPreview({
  preview,
}: {
  preview: KolamTeamChatLinkPreview;
}) {
  const previewImage = getTeamChatLinkPreviewImage(preview);
  const imageUri = previewImage
    ? getKolamFileUrl(previewImage) ?? previewImage
    : '';
  const title = preview.title?.trim() || preview.url;
  const description = preview.description?.trim();
  const siteName = preview.siteName?.trim();

  return (
    <View
      accessibilityLabel={`Link preview ${title}`}
      style={styles.chatPreviewCard}
    >
      {imageUri ? (
        <KolamRemoteImage
          accessibilityLabel={`Gambar link preview ${title}`}
          sourceUri={imageUri}
          style={styles.chatPreviewImage}
        />
      ) : null}
      <View style={styles.chatPreviewCopy}>
        {siteName ? (
          <Text numberOfLines={1} style={styles.chatPreviewKicker}>
            {siteName}
          </Text>
        ) : null}
        <Text numberOfLines={2} style={styles.chatPreviewTitle}>
          {title}
        </Text>
        {description ? (
          <Text numberOfLines={2} style={styles.chatPreviewDescription}>
            {description}
          </Text>
        ) : null}
        <Text numberOfLines={1} style={styles.chatPreviewUrl}>
          {preview.url}
        </Text>
      </View>
    </View>
  );
}

function KolamChatEmbedList({ embeds }: { embeds: KolamTeamChatEmbed[] }) {
  return (
    <View style={styles.chatEmbedList}>
      <KolamMappedList
        items={embeds}
        getKey={(embed, index) => `${embed.type}-${embed.refId}-${index}`}
        renderItem={embed => <KolamChatEmbedCard embed={embed} />}
      />
    </View>
  );
}

function KolamChatEmbedCard({ embed }: { embed: KolamTeamChatEmbed }) {
  const label = getTeamChatEmbedTypeLabel(embed.type);
  const title = embed.title?.trim() || embed.refId;
  const subtitle = embed.subtitle?.trim();
  const href = getTeamChatEmbedHref(embed);

  return (
    <View
      accessibilityLabel={`Embed ${label} ${title}`}
      style={styles.chatEmbedCard}
    >
      <View style={styles.chatEmbedIcon}>
        <Text style={styles.chatEmbedIconText}>
          {getTeamChatEmbedInitial(label)}
        </Text>
      </View>
      <View style={styles.chatEmbedCopy}>
        <Text numberOfLines={1} style={styles.chatEmbedKicker}>
          {label}
        </Text>
        <Text numberOfLines={1} style={styles.chatEmbedTitle}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={styles.chatEmbedSubtitle}>
            {subtitle}
          </Text>
        ) : null}
        {href ? (
          <Text numberOfLines={1} style={styles.chatEmbedUrl}>
            {href}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function KolamInboxMessageActions({
  canEdit,
  canReply,
  disabled,
  message,
  onEdit,
  onReply,
}: {
  canEdit: boolean;
  canReply: boolean;
  disabled: boolean;
  message: ReturnType<typeof useKolamChatRailDetail>['messages'][number];
  onEdit: () => void;
  onReply: () => void;
}) {
  if (!canEdit && !canReply) {
    return null;
  }

  return (
    <View style={styles.messageActionRow}>
      {canReply ? (
        <KolamPressable
          accessibilityLabel={`Balas pesan ${message.author}`}
          disabled={disabled}
          onPress={onReply}
          style={[
            styles.replyActionButton,
            disabled && styles.attachButtonDisabled,
          ]}
        >
          <Text style={styles.replyActionText}>Balas</Text>
        </KolamPressable>
      ) : null}
      {canEdit ? (
        <KolamPressable
          accessibilityLabel={`Edit pesan ${message.author}`}
          disabled={disabled}
          onPress={onEdit}
          style={[
            styles.replyActionButton,
            styles.editActionButton,
            disabled && styles.attachButtonDisabled,
          ]}
        >
          <Text style={styles.replyActionText}>Edit</Text>
        </KolamPressable>
      ) : null}
    </View>
  );
}

function KolamChatReactionControls({
  canEdit,
  disabled,
  message,
  onClose,
  onEdit,
  onReact,
  onReply,
  onToggle,
  open,
}: {
  canEdit: boolean;
  disabled: boolean;
  message: ReturnType<typeof useKolamChatRailDetail>['messages'][number];
  onClose: () => void;
  onEdit: () => void;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onToggle: () => void;
  open: boolean;
}) {
  return (
    <View style={styles.reactionControls}>
      <View style={styles.teamBubbleActionRow}>
        <KolamPressable
          accessibilityLabel={`Aksi pesan ${message.author}`}
          accessibilityState={{ expanded: open }}
          disabled={disabled}
          onPress={onToggle}
          style={[
            styles.teamBubbleActionButton,
            open && styles.teamBubbleActionButtonOpen,
            disabled && styles.attachButtonDisabled,
          ]}
        >
          <Text style={styles.teamBubbleActionButtonText}>...</Text>
        </KolamPressable>

        {open ? (
          <View style={styles.teamBubbleActionMenu}>
            <View style={styles.reactionPalette}>
              <KolamMappedList
                items={TEAM_CHAT_REACTIONS}
                getKey={emoji => emoji}
                renderItem={emoji => (
                  <KolamPressable
                    accessibilityLabel={`Reaksi ${emoji}`}
                    disabled={disabled}
                    onPress={() => {
                      onReact(emoji);
                      onClose();
                    }}
                    style={[
                      styles.reactionButton,
                      disabled && styles.reactionButtonDisabled,
                    ]}
                  >
                    <Text style={styles.reactionButtonText}>{emoji}</Text>
                  </KolamPressable>
                )}
              />
            </View>
            <View style={styles.messageActionRow}>
              <KolamPressable
                accessibilityLabel={`Balas pesan ${message.author}`}
                disabled={disabled}
                onPress={() => {
                  onReply();
                  onClose();
                }}
                style={[
                  styles.replyActionButton,
                  disabled && styles.attachButtonDisabled,
                ]}
              >
                <Text style={styles.replyActionText}>Balas</Text>
              </KolamPressable>
              {canEdit ? (
                <KolamPressable
                  accessibilityLabel={`Edit pesan ${message.author}`}
                  disabled={disabled}
                  onPress={() => {
                    onEdit();
                    onClose();
                  }}
                  style={[
                    styles.replyActionButton,
                    styles.editActionButton,
                    disabled && styles.attachButtonDisabled,
                  ]}
                >
                  <Text style={styles.replyActionText}>Edit</Text>
                </KolamPressable>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>

      {message.reactions.length > 0 ? (
        <View style={styles.reactionPills}>
          <KolamMappedList
            items={message.reactions}
            getKey={reaction => reaction.emoji}
            renderItem={reaction => (
              <KolamPressable
                accessibilityLabel={`Toggle reaction ${reaction.emoji}`}
                disabled={disabled}
                onPress={() => onReact(reaction.emoji)}
                style={[
                  styles.reactionPill,
                  reaction.mine && styles.reactionPillMine,
                ]}
              >
                <Text style={styles.reactionPillText}>
                  {reaction.emoji} {reaction.count}
                </Text>
              </KolamPressable>
            )}
          />
        </View>
      ) : null}
    </View>
  );
}

function getChatRailContent(mode: KolamGlobalChatRailMode) {
  if (mode === 'team-chat') {
    return {
      accessibilityLabel: 'Panel kanan Team chat',
      iconKind: 'team' as const,
      emptyTitle: 'Belum ada room aktif',
      emptyMessage:
        'Room team chat akan muncul di sini setelah backend mengirim data.',
      itemLabel: 'room',
      selectLabel: 'Pilih room',
      title: 'Team chat',
    };
  }

  return {
    accessibilityLabel: 'Panel kanan Pesan masuk',
    iconKind: 'inbox' as const,
    emptyTitle: 'Tidak ada pesan unread',
    emptyMessage: 'Conversation unread dari marketplace akan muncul di sini.',
    itemLabel: 'conversation',
    selectLabel: 'Pilih conversation',
    title: 'Pesan masuk',
  };
}

function getChatRailItems(
  mode: KolamGlobalChatRailMode,
  data: ReturnType<typeof useKolamChatRailReadonlyData>,
  inboxAssignmentFilter: KolamChatRailInboxFilter['assignment'] = 'all',
  labels: KolamChatLabel[] = [],
): KolamChatRailItem[] {
  if (mode === 'team-chat') {
    return data.rooms
      .filter(room => !isDaraDirectTeamRoom(room))
      .map(room => ({
        assignedStaff: null,
        handledByDara: false,
        id: room._id,
        labels: [],
        metaLabel: getRoomCategoryLabel(room),
        platform: undefined,
        preview: room.lastMessagePreview || 'Belum ada preview pesan.',
        secondaryMetaLabel: getRoomSecondaryMeta(room),
        teamRoomCategory: room.category,
        timeLabel: formatRelativeTime(room.lastMessageAt),
        title: getRoomTitle(room),
        unreadCount: room.unreadCount ?? 0,
      }));
  }

  return data.conversations
    .filter(conversation =>
      conversationFitsAssignmentFilter(conversation, inboxAssignmentFilter),
    )
    .map(conversation => ({
      assignedStaff: conversation.assignedStaffId ?? null,
      handledByDara: conversation.isAiHandled === true,
      id: conversation._id,
      labels: getConversationLabels(conversation, labels),
      metaLabel: conversation.platform
        ? getPlatformLabel(conversation.platform)
        : 'Marketplace',
      platform: conversation.platform,
      preview: getConversationPreview(conversation),
      secondaryMetaLabel: conversation.status === 'closed' ? 'Closed' : 'Open',
      teamRoomCategory: undefined,
      timeLabel: formatRelativeTime(conversation.lastMessageAt),
      title: getConversationTitle(conversation),
      unreadCount: conversation.unreadCount ?? 0,
    }));
}

function canDeleteTeamChatRoom(item: KolamChatRailItem) {
  return (
    item.teamRoomCategory === 'meeting' || item.teamRoomCategory === 'project'
  );
}

/** BE `isAdminRole` / FE plugin purge button — admin only. */
const TEAM_CHAT_PURGE_ADMIN_ROLE_KEYS = new Set([
  'super_admin',
  'super_administrator',
  'super-admin',
  'super-administrator',
  'superadministrator',
  'admin',
]);

function canPurgeTeamChatRoomMessages(roleKey?: string | null) {
  return TEAM_CHAT_PURGE_ADMIN_ROLE_KEYS.has(
    String(roleKey || '')
      .trim()
      .toLowerCase(),
  );
}

function buildInboxListParams(
  filter: KolamChatRailInboxFilter,
): KolamChatConversationListParams {
  const params: KolamChatConversationListParams = {
    limit: 100,
    page: 1,
  };

  if (filter.status !== 'all') {
    params.status = filter.status;
  }

  if (filter.platform !== 'all') {
    params.platform = filter.platform;
  }

  const search = filter.search.trim();
  if (search) {
    params.search = search;
  }

  if (filter.labelId !== 'all') {
    params.labelId = filter.labelId;
  }

  return params;
}

function conversationFitsAssignmentFilter(
  conversation: { assignedStaffId?: KolamChatStaffRef | string | null },
  filter: KolamChatRailInboxFilter['assignment'],
) {
  if (filter === 'all') {
    return true;
  }

  const assigned = Boolean(getChatStaffId(conversation.assignedStaffId));
  return filter === 'assigned' ? assigned : !assigned;
}

function canSignedInUserReplyCustomerChat(user?: SignedInUser | null) {
  if (!user) {
    return false;
  }

  const roleKey = normalizeChatRoleKey(user.roleKey);
  if (CHAT_ADMIN_ROLE_KEYS.has(roleKey)) {
    return true;
  }

  return user.csActive === true;
}

function canCreateTeamChatRoom(user?: SignedInUser | null) {
  if (!user) {
    return false;
  }

  const roleKey = normalizeChatRoleKey(user.roleKey);
  if (CHAT_ADMIN_ROLE_KEYS.has(roleKey)) {
    return true;
  }

  if ((user as { isOwner?: boolean }).isOwner === true) {
    return true;
  }

  return permissionAllowsChatCreate(user.permissions);
}

function permissionAllowsChatCreate(permissions?: SignedInUser['permissions']) {
  return Boolean(
    permissions?.some(permission => {
      const resource = String(permission.resource ?? '')
        .toLowerCase()
        .trim();
      const actions = (permission.actions ?? []).map(action =>
        String(action).toLowerCase().trim(),
      );
      return (
        resource === 'chat' &&
        (actions.includes('create') || actions.includes('*'))
      );
    }),
  );
}

function normalizeChatRoleKey(roleKey?: string | null) {
  return String(roleKey ?? '')
    .toLowerCase()
    .trim();
}

function getInboxComposerAccess(
  conversation:
    | ReturnType<typeof useKolamChatRailDetail>['conversation']
    | null
    | undefined,
  currentUserId?: string,
  options: { csCanReply: boolean } = { csCanReply: false },
): KolamInboxComposerAccess {
  if (!conversation) {
    return {
      blockedReason: null,
      disabled: true,
      lockedBy: null,
    };
  }

  if (!options.csCanReply) {
    return {
      blockedReason:
        'Mode baca saja - aktifkan CS Aktif di admin untuk membalas chat customer.',
      disabled: false,
      lockedBy: null,
    };
  }

  if (conversation.status === 'closed') {
    if (conversation.pendingRating?.active) {
      return {
        blockedReason:
          'Menunggu rating customer. Thread tetap terlihat, tetapi belum bisa dibalas.',
        disabled: true,
        lockedBy: null,
      };
    }

    return {
      blockedReason: 'Chat ditutup. Reopen conversation sebelum membalas.',
      disabled: true,
      lockedBy: null,
    };
  }

  const assigneeId = getChatStaffId(conversation.assignedStaffId);
  const assignedToMe = Boolean(
    currentUserId && assigneeId && String(currentUserId) === String(assigneeId),
  );

  if (assigneeId && !assignedToMe) {
    return {
      blockedReason: null,
      disabled: false,
      lockedBy: getChatStaffLabel(conversation.assignedStaffId) || 'CS Agent',
    };
  }

  if (!assigneeId && conversation.status === 'open') {
    const isDaraSession =
      conversation.isAiHandled !== false || Boolean(conversation.aiHandoffAt);

    return {
      blockedReason: isDaraSession
        ? 'Chat ditangani DARA. Klik Assign saya di header inbox untuk mengambil chat sebagai CS.'
        : 'Chat belum ditugaskan. Klik Assign saya di header inbox untuk mengambil chat sebagai CS, lalu balas pesan.',
      disabled: false,
      lockedBy: null,
    };
  }

  return {
    blockedReason: null,
    disabled: false,
    lockedBy: null,
  };
}

interface KolamInboxResolvedCard {
  actionUrl?: string;
  imageUrl?: string;
  kind: 'product' | 'species' | 'marketplace';
  label: string;
  marketplaceId?: string;
  priceLabel?: string;
  sku?: string;
  stock?: number;
  title: string;
}

interface KolamInboxLinkedCardData {
  actionUrl?: string;
  icon: string;
  label: string;
  subtitle?: string;
  title: string;
}

interface KolamInboxImageContent {
  caption: string;
  previewUri: string;
  thumbnailUri: string;
}

function resolveInboxImageContent(
  content:
    | ReturnType<typeof useKolamChatRailDetail>['messages'][number]['content']
    | undefined,
  body: string,
): KolamInboxImageContent | null {
  if (content?.type === 'image') {
    const thumbnailUri = normalizeChatMediaUri(
      content.thumbnailUrl || content.imageUrl || content.text,
    );
    const previewUri = normalizeChatMediaUri(
      content.imageUrl || content.thumbnailUrl || content.text,
    );

    if (!thumbnailUri || !previewUri) {
      return null;
    }

    return {
      caption: getInboxImageCaption(content),
      previewUri,
      thumbnailUri,
    };
  }

  const legacy = parseInboxLegacyImageText(body);
  const legacyUri = legacy ? normalizeChatMediaUri(legacy) : null;
  return legacyUri
    ? { caption: '', previewUri: legacyUri, thumbnailUri: legacyUri }
    : null;
}

function getInboxImageCaption(
  content: NonNullable<
    ReturnType<typeof useKolamChatRailDetail>['messages'][number]['content']
  >,
) {
  const caption = content.text?.trim() ?? '';
  if (!caption) {
    return '';
  }

  const duplicateValues = [
    content.fileName,
    content.imageUrl,
    content.thumbnailUrl,
  ]
    .map(value => value?.trim())
    .filter(Boolean);

  if (
    duplicateValues.some(value => value === caption) ||
    isLikelyChatMediaReference(caption)
  ) {
    return '';
  }

  return caption;
}

function isLikelyChatMediaReference(value: string) {
  return /^(https?:|file:|ms-appx:|ms-appdata:|data:|\/)/i.test(value.trim());
}

function resolveInboxYoutube(
  content:
    | ReturnType<typeof useKolamChatRailDetail>['messages'][number]['content']
    | undefined,
  body: string,
) {
  if (content?.youtube?.videoId || content?.youtube?.url) {
    return {
      title: content.youtube.title,
      url:
        content.youtube.url ||
        `https://www.youtube.com/watch?v=${content.youtube.videoId}`,
      videoId: content.youtube.videoId,
    };
  }

  const text = content?.text || body;
  const videoId = extractYoutubeVideoId(text);
  if (!videoId) {
    return null;
  }

  return {
    url: text.trim(),
    videoId,
  };
}

function resolveInboxCard(
  content:
    | ReturnType<typeof useKolamChatRailDetail>['messages'][number]['content']
    | undefined,
  body: string,
): KolamInboxResolvedCard | null {
  const card = content?.card;
  if (card?.name || card?.marketplace?.listingName) {
    const kind =
      content?.type === 'marketplace_product_card' || card.marketplace
        ? 'marketplace'
        : card.entityType === 'species'
        ? 'species'
        : 'product';
    return {
      actionUrl: normalizeInboxActionUrl(card.detailHref || card.imageUrl),
      imageUrl: normalizeChatMediaUri(card.imageUrl) ?? undefined,
      kind,
      label: getInboxCardLabel(kind, card.marketplace?.platform),
      marketplaceId: getInboxMarketplaceCardId(card.marketplace),
      priceLabel:
        card.priceLabel ||
        (typeof card.price === 'number' ? formatRupiah(card.price) : undefined),
      sku: card.marketplace?.sku?.trim() || undefined,
      stock: typeof card.stock === 'number' ? card.stock : undefined,
      title: card.marketplace?.listingName || card.name || 'Item',
    };
  }

  if (
    content?.type === 'product_card' ||
    content?.type === 'species_card' ||
    content?.type === 'marketplace_product_card'
  ) {
    const title = content.text?.trim();
    if (title) {
      return {
        kind:
          content.type === 'species_card'
            ? 'species'
            : content.type === 'marketplace_product_card'
            ? 'marketplace'
            : 'product',
        label: getInboxCardLabel(
          content.type === 'species_card'
            ? 'species'
            : content.type === 'marketplace_product_card'
            ? 'marketplace'
            : 'product',
        ),
        title,
      };
    }
  }

  return parseInboxLegacyProductText(body);
}

function parseInboxLegacyImageText(text: string) {
  const trimmed = text.trim();
  if (!trimmed.startsWith('[Image]')) {
    return null;
  }

  const url = trimmed.replace(/^\[Image\]\s*/, '').trim();
  return /^https?:\/\//i.test(url) ? url : null;
}

function parseInboxLegacyProductText(
  text: string,
): KolamInboxResolvedCard | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith('[Product]')) {
    return null;
  }

  const lines = trimmed.split('\n').map(line => line.trim());
  const head = lines[0]?.replace(/^\[Product\]\s*/, '') ?? '';
  const parts = head
    .split(/\s*[-—]\s*/)
    .map(part => part.trim())
    .filter(Boolean);
  if (parts.length === 0) {
    return null;
  }

  const imageLine = lines
    .slice(1)
    .find(line => /^https?:\/\//i.test(line) && !line.startsWith('[Link]'));
  const priceLabel = parts.find(part => /^Rp/i.test(part));
  const extra = parts
    .slice(1)
    .filter(part => part !== priceLabel && !/(sold|terjual)/i.test(part));

  return {
    actionUrl: normalizeInboxActionUrl(imageLine),
    imageUrl: normalizeChatMediaUri(imageLine) ?? undefined,
    kind: 'product',
    label: 'Product',
    priceLabel,
    title: [parts[0], ...extra].filter(Boolean).join(' - '),
  };
}

function resolveInboxLinkedCard(body: string): KolamInboxLinkedCardData | null {
  const invoice = parseInboxTaggedCard(body, 'Invoice');
  if (invoice) {
    return { ...invoice, icon: 'INV', label: 'Invoice' };
  }

  const project = parseInboxTaggedCard(body, 'Project');
  if (project) {
    return { ...project, icon: 'PRJ', label: 'Proyek' };
  }

  const complaint = parseInboxTaggedCard(body, 'Complaint');
  if (complaint) {
    return { ...complaint, icon: 'CMP', label: 'Komplain' };
  }

  return null;
}

function parseInboxTaggedCard(body: string, tag: string) {
  const trimmed = body.trim();
  if (!trimmed.startsWith(`[${tag}]`)) {
    return null;
  }

  const head = trimmed
    .split('\n')[0]
    ?.replace(new RegExp(`^\\[${tag}\\]\\s*`), '')
    .trim();
  const parts = (head || '')
    .split(/\s*[-—]\s*/)
    .map(part => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  return {
    actionUrl: normalizeInboxActionUrl(
      trimmed
        .split('\n')
        .map(line => line.trim())
        .find(line => line.startsWith('[Link]'))
        ?.replace(/^\[Link\]\s*/, ''),
    ),
    subtitle: parts[1],
    title: parts[0],
  };
}

function normalizeInboxActionUrl(url?: string | null) {
  const value = url?.trim();
  if (!value) {
    return undefined;
  }

  if (/^(https?:|mailto:|tel:)/i.test(value)) {
    return value;
  }

  return getKolamFileUrl(value) ?? undefined;
}

function openInboxExternalUrl(url?: string | null) {
  const target = normalizeInboxActionUrl(url);
  if (!target) {
    return;
  }

  Linking.openURL(target).catch(() => undefined);
}

function normalizeChatMediaUri(uri?: string | null) {
  const value = uri?.trim();
  if (!value) {
    return null;
  }

  return getKolamFileUrl(value) ?? value;
}

function extractYoutubeVideoId(text: string) {
  const value = text.trim();
  const match =
    value.match(/[?&]v=([a-zA-Z0-9_-]{6,})/) ??
    value.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/) ??
    value.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/);

  return match?.[1] ?? null;
}

function getInboxCardLabel(
  kind: KolamInboxResolvedCard['kind'],
  platform?: 'shopee' | 'tokopedia',
) {
  if (platform === 'shopee') {
    return 'Shopee';
  }

  if (platform === 'tokopedia') {
    return 'Tokopedia';
  }

  if (kind === 'species') {
    return 'Livestock';
  }

  return kind === 'marketplace' ? 'Marketplace' : 'Product';
}

function getInboxMarketplaceCardId(
  marketplace?: NonNullable<
    NonNullable<KolamChatMessage['content']>['card']
  >['marketplace'],
) {
  if (!marketplace) {
    return undefined;
  }

  const productId = marketplace.productId?.trim();
  const goodsId = marketplace.goodsId?.trim();
  const value =
    marketplace.platform === 'tokopedia'
      ? goodsId || productId
      : productId || goodsId;

  if (!value) {
    return undefined;
  }

  return marketplace.platform === 'tokopedia'
    ? `Goods ID ${value}`
    : `Product ID ${value}`;
}

function formatReplyContentType(type?: string) {
  if (type === 'image') {
    return 'Foto';
  }
  if (type === 'audio') {
    return 'Audio';
  }
  if (type === 'video') {
    return 'Video';
  }
  if (type === 'document') {
    return 'Dokumen';
  }
  if (type === 'sticker') {
    return 'Stiker';
  }
  if (type === 'story') {
    return 'Story';
  }
  return 'Reply';
}

function formatDaraMetaTitle(
  meta: NonNullable<
    ReturnType<typeof useKolamChatRailDetail>['messages'][number]['daraMeta']
  >,
) {
  if (meta.kind === 'vision' || meta.kind === 'image_clarify') {
    return 'DARA vision';
  }

  if (meta.kind === 'fulfillment') {
    return meta.fulfillmentPhase
      ? `DARA fulfillment ${meta.fulfillmentPhase}`
      : 'DARA fulfillment';
  }

  if (meta.kind === 'payment_proof') {
    return 'DARA payment proof';
  }

  return 'DARA search';
}

function getConversationTitle({
  contactId,
  platform,
}: {
  contactId?: string | { displayName?: string };
  platform?: string;
}) {
  if (contactId && typeof contactId === 'object') {
    const displayName = contactId.displayName?.trim();
    if (displayName) {
      return displayName;
    }
  }

  return platform ? platform : 'Conversation';
}

function getRoomTitle({
  category,
  directPeerName,
  name,
}: {
  category?: string;
  directPeerName?: string;
  name?: string;
}) {
  if (category === 'direct' && directPeerName?.trim()) {
    return directPeerName.trim();
  }

  return name?.trim() || 'Room tanpa nama';
}

function isDaraDirectTeamRoom({
  category,
  directPeerName,
  isDaraDirect,
}: {
  category?: string;
  directPeerName?: string;
  isDaraDirect?: boolean;
}) {
  return (
    isDaraDirect === true ||
    (category === 'direct' && directPeerName?.trim().toLowerCase() === 'dara')
  );
}

function getUserPickerDisplayName(user: KolamUserPickerRow) {
  const fullName = [user.first_name, user.last_name]
    .map(value => value?.trim())
    .filter(Boolean)
    .join(' ');

  return fullName || user.username?.trim() || 'Staff tanpa nama';
}

function getRoomCategoryLabel({
  category,
  isAiRoom,
  isDaraDirect,
  isGeneral,
}: {
  category?: string;
  isAiRoom?: boolean;
  isDaraDirect?: boolean;
  isGeneral?: boolean;
}) {
  if (isDaraDirect) {
    return 'DARA';
  }

  if (isAiRoom) {
    return 'AI room';
  }

  if (isGeneral) {
    return 'General';
  }

  if (!category) {
    return 'Room';
  }

  return category
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function getRoomSecondaryMeta({
  category,
  isAiRoom,
  isGeneral,
}: {
  category?: string;
  isAiRoom?: boolean;
  isGeneral?: boolean;
}) {
  if (isAiRoom) {
    return 'Asisten internal';
  }

  if (isGeneral) {
    return 'Room utama';
  }

  return category ? 'Team chat' : undefined;
}

function getPlatformLabel(platform: string) {
  return platform
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function formatInboxPlatformFilterLabel(platform: KolamChatPlatform | 'all') {
  if (platform === 'all') {
    return 'Semua';
  }

  if (platform === 'tokopedia') {
    return 'Tokped';
  }

  return getPlatformLabel(platform);
}

function formatInboxStatusFilterLabel(
  status: KolamChatConversationStatus | 'all',
) {
  if (status === 'open') {
    return 'Buka';
  }

  if (status === 'closed') {
    return 'Ditutup';
  }

  return 'Semua';
}

function formatInboxAssignmentFilterLabel(
  assignment: KolamChatRailInboxFilter['assignment'],
) {
  if (assignment === 'assigned') {
    return 'Ditugaskan';
  }

  if (assignment === 'unassigned') {
    return 'Belum tugas';
  }

  return 'Semua';
}

function formatInboxPlatform(platform?: string) {
  return platform ? getPlatformLabel(platform) : 'Marketplace';
}

function getInboxMarketplaceAttachPlatform(
  platform?: string | null,
): 'shopee' | 'tokopedia' | null {
  if (platform === 'shopee' || platform === 'tokopedia') {
    return platform;
  }

  return null;
}

function formatMarketplaceComposerToolLabel(platform: 'shopee' | 'tokopedia') {
  return platform === 'tokopedia'
    ? 'Buka produk Tokopedia'
    : 'Buka produk Shopee';
}

function formatMarketplaceListingMeta(item: KolamChatMarketplaceListingHit) {
  const parts = [
    item.sku ? `SKU ${item.sku}` : '',
    item.goodsId || item.productId
      ? `ID ${item.goodsId || item.productId}`
      : '',
    item.entityType === 'species' ? 'Species' : 'Product',
  ].filter(Boolean);

  return parts.join(' | ');
}

function getConversationDirectionPrefix(direction?: 'in' | 'out') {
  return direction === 'out' ? 'Anda: ' : '';
}

function getConversationPreview({
  lastMessageDirection,
  lastMessagePreview,
}: {
  lastMessageDirection?: 'in' | 'out';
  lastMessagePreview?: string;
}) {
  const preview = lastMessagePreview?.trim();

  if (!preview) {
    return 'Conversation marketplace';
  }

  return `${getConversationDirectionPrefix(lastMessageDirection)}${preview}`;
}

function getTeamChatPresenceFromLiveEvent(
  event: KolamChatLiveEvent,
): KolamTeamChatPresence | null {
  if (!event.payload || typeof event.payload !== 'object') {
    return null;
  }

  const presence = (event.payload as { presence?: unknown }).presence;
  if (!presence || typeof presence !== 'object') {
    return null;
  }

  const record = presence as Partial<KolamTeamChatPresence>;
  return {
    onlineCount: Number.isFinite(record.onlineCount)
      ? record.onlineCount ?? 0
      : 0,
    typingUserIds: Array.isArray(record.typingUserIds)
      ? record.typingUserIds.filter(id => typeof id === 'string')
      : [],
    viewingCount: Number.isFinite(record.viewingCount)
      ? record.viewingCount ?? 0
      : 0,
  };
}

function getInboxMessagePatchFromLiveEvent(event: KolamChatLiveEvent) {
  if (
    event.contract.stream !== 'inbox' ||
    event.contract.eventName !== 'message.updated'
  ) {
    return null;
  }

  const payload =
    event.payload && typeof event.payload === 'object'
      ? (event.payload as Record<string, unknown>)
      : {};
  const message =
    payload.message && typeof payload.message === 'object'
      ? (payload.message as Record<string, unknown>)
      : {};
  const messageId =
    readLiveString(payload.messageId) || readLiveString(message._id);

  if (!messageId) {
    return null;
  }

  const deliveryStatus =
    readLiveString(payload.deliveryStatus) ||
    readLiveString(message.deliveryStatus);
  const patch: Partial<KolamChatMessage> = {};

  if (deliveryStatus) {
    patch.deliveryStatus = deliveryStatus;
  }
  if (message.content !== undefined) {
    patch.content = message.content as KolamChatMessage['content'];
  }
  if (message.editedAt !== undefined) {
    patch.editedAt = readLiveString(message.editedAt) || null;
  }
  if (message.editedByName !== undefined) {
    patch.editedByName = readLiveString(message.editedByName) || null;
  }
  if (message.replyContent !== undefined) {
    patch.replyContent =
      message.replyContent as KolamChatMessage['replyContent'];
  }
  if (message.daraMeta !== undefined) {
    patch.daraMeta = message.daraMeta as KolamChatMessage['daraMeta'];
  }
  if (message.senderName !== undefined) {
    patch.senderName = readLiveString(message.senderName);
  }
  if (message.senderType !== undefined) {
    patch.senderType = readLiveString(
      message.senderType,
    ) as KolamChatMessage['senderType'];
  }

  return Object.keys(patch).length ? { messageId, patch } : null;
}

function getInboxMessageCreatedFromLiveEvent(event: KolamChatLiveEvent) {
  if (
    event.contract.stream !== 'inbox' ||
    event.contract.eventName !== 'message.created'
  ) {
    return null;
  }

  const payload =
    event.payload && typeof event.payload === 'object'
      ? (event.payload as Record<string, unknown>)
      : {};
  const message =
    payload.message && typeof payload.message === 'object'
      ? (payload.message as KolamChatMessage)
      : null;

  return message?._id ? message : null;
}

function readLiveString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function getDaraThinkingLivePatch(
  event: KolamChatLiveEvent,
  selectedItemId: string | null,
): KolamDaraThinkingLivePatch | null {
  if (!selectedItemId) {
    return null;
  }

  const eventName = event.contract.eventName;
  if (
    !DARA_THINKING_ACTIVE_EVENTS.has(eventName) &&
    !DARA_THINKING_DONE_EVENTS.has(eventName)
  ) {
    return null;
  }

  const payload =
    event.payload && typeof event.payload === 'object'
      ? (event.payload as Record<string, unknown>)
      : {};
  const roomId = getStringRecordValue(payload, ['roomId', 'room_id', 'room']);
  if (roomId && roomId !== selectedItemId) {
    return null;
  }

  if (DARA_THINKING_DONE_EVENTS.has(eventName)) {
    return {
      line: '',
      roomId: roomId || selectedItemId,
      state: 'done',
    };
  }

  return {
    line:
      typeof event.payload === 'string' && event.payload.trim()
        ? event.payload.trim()
        : getDaraThinkingLine(payload),
    roomId: roomId || selectedItemId,
    state: 'active',
  };
}

function getDaraThinkingLine(payload: Record<string, unknown>) {
  const directLine = getStringRecordValue(payload, [
    'line',
    'reasoningLine',
    'text',
    'chunk',
    'message',
    'status',
  ]);

  if (directLine) {
    return directLine;
  }

  const reasoningLines = payload.reasoningLines;
  if (Array.isArray(reasoningLines)) {
    const lastLine = [...reasoningLines]
      .reverse()
      .find(line => typeof line === 'string' && line.trim());
    if (typeof lastLine === 'string') {
      return lastLine.trim();
    }
  }

  return DARA_THINKING_DEFAULT_LINE;
}

function getStringRecordValue(
  record: Record<string, unknown>,
  keys: string[],
): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function formatTeamChatPresence(presence: KolamTeamChatPresence) {
  const parts = [
    presence.onlineCount > 0
      ? `${presence.onlineCount} online`
      : 'Tidak ada yang online',
    presence.viewingCount > 0 ? `${presence.viewingCount} melihat` : '',
    presence.typingUserIds.length > 0
      ? `${presence.typingUserIds.length} mengetik...`
      : '',
  ].filter(Boolean);

  return parts.join(' · ');
}

function getCallStatusLabel(status: string) {
  switch (status) {
    case 'active':
      return 'Call aktif';
    case 'ringing':
      return 'Call berdering';
    case 'ended':
      return 'Call selesai';
    default:
      return 'Call';
  }
}

function getCallParticipantUserId(participant: KolamTeamChatCallParticipant) {
  return typeof participant.user === 'string'
    ? participant.user
    : participant.user?._id;
}

function getCallParticipantLabel(participant: KolamTeamChatCallParticipant) {
  const user = typeof participant.user === 'object' ? participant.user : null;
  const name = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
      user.username ||
      user.email
    : '';

  return name || getCallParticipantUserId(participant) || 'Participant';
}

function getChatStaffId(staff?: KolamChatStaffRef | string | null) {
  return typeof staff === 'string' ? staff : staff?._id;
}

function getChatStaffLabel(staff?: KolamChatStaffRef | string | null) {
  if (!staff || typeof staff === 'string') {
    return '';
  }

  return (
    [staff.first_name, staff.last_name].filter(Boolean).join(' ').trim() ||
    staff.username ||
    staff._id
  );
}

function getChatStaffPhotoUri(staff?: KolamChatStaffRef | string | null) {
  if (!staff || typeof staff === 'string' || !staff.profile_picture) {
    return null;
  }

  return resolveProfilePhotoUrl(staff.profile_picture);
}

function getChatStaffInitials(staff?: KolamChatStaffRef | string | null) {
  const label = getChatStaffLabel(staff);
  if (!label) {
    return 'CS';
  }

  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

function getConversationLabels(
  conversation: {
    labelIds?: Array<KolamChatLabel | string>;
    labels?: KolamChatLabel[];
  },
  labels: KolamChatLabel[],
) {
  if (Array.isArray(conversation.labels) && conversation.labels.length > 0) {
    return conversation.labels;
  }

  if (!Array.isArray(conversation.labelIds)) {
    return [];
  }

  const labelMap = new Map(labels.map(label => [label._id, label]));
  return conversation.labelIds
    .map(label => (typeof label === 'string' ? labelMap.get(label) : label))
    .filter((label): label is KolamChatLabel => Boolean(label));
}

function getConversationLabelIds(
  conversation: NonNullable<
    ReturnType<typeof useKolamChatRailDetail>['conversation']
  >,
) {
  const rawLabels =
    Array.isArray(conversation.labelIds) && conversation.labelIds.length > 0
      ? conversation.labelIds
      : conversation.labels;

  if (!Array.isArray(rawLabels)) {
    return [];
  }

  return Array.from(
    new Set(
      rawLabels
        .map(label => (typeof label === 'string' ? label : label._id))
        .filter((labelId): labelId is string => Boolean(labelId)),
    ),
  );
}

function filterChatTemplates(
  templates: KolamChatTemplate[],
  search: string,
): KolamChatTemplate[] {
  const needle = search.trim().toLowerCase();
  if (!needle) {
    return templates;
  }

  return templates.filter(template => {
    return (
      template.title.toLowerCase().includes(needle) ||
      template.body.toLowerCase().includes(needle)
    );
  });
}

function getTrailingMentionQuery(text: string): string | null {
  const match = text.match(/@([a-zA-Z0-9_.-]{0,32})$/);
  return match ? match[1] : null;
}

function splitTeamChatMentionText(body: string): KolamTeamMentionTextPart[] {
  const text = String(body ?? '');
  if (!text) {
    return [];
  }

  const parts: KolamTeamMentionTextPart[] = [];
  const mentionPattern = /@([a-zA-Z0-9_.-]{1,32})/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = mentionPattern.exec(text)) !== null) {
    const start = match.index;
    if (start > last) {
      parts.push({ type: 'text', value: text.slice(last, start) });
    }

    parts.push({
      raw: match[0],
      type: 'mention',
      username: match[1],
    });
    last = start + match[0].length;
  }

  if (last < text.length) {
    parts.push({ type: 'text', value: text.slice(last) });
  }

  return parts.length > 0 ? parts : [{ type: 'text', value: text }];
}

function shouldShowDaraThinking({
  body,
  daraReplyEnabled,
}: {
  body: string;
  daraReplyEnabled: boolean;
}) {
  if (!daraReplyEnabled) {
    return false;
  }

  return /@dara\b/i.test(String(body || ''));
}

function buildTeamMentionOptions(
  members: KolamTeamChatUserRef[],
  query: string,
  includeDara: boolean,
  bots: KolamTeamChatBotPresence[] = [],
): KolamTeamMentionOption[] {
  const q = query.toLowerCase();
  const options: KolamTeamMentionOption[] = [];

  if (includeDara && (!q || 'dara'.includes(q) || q.includes('dar'))) {
    options.push({ id: 'dara', isAi: true, label: 'DARA', username: 'dara' });
  }

  bots.forEach(bot => {
    const username = (bot.username || bot.botKey || '').trim();
    if (!username || username === 'dara' || bot.botKey === 'raja_anemon') {
      return;
    }

    const label = (bot.displayName || username).trim();
    const key = `${username} ${label} ${bot.botKey || ''}`.toLowerCase();
    if (q && !key.includes(q)) {
      return;
    }

    options.push({
      id: bot.botKey || username,
      isAi: true,
      label,
      username,
    });
  });

  members.forEach(member => {
    const username = (member.username || '').trim();
    if (!username) {
      return;
    }

    const label = getTeamChatUserLabel(member);
    const key = `${username} ${label}`.toLowerCase();
    if (q && !key.includes(q)) {
      return;
    }

    options.push({ id: member._id || username, label, username });
  });

  return options.slice(0, 12);
}

function getTeamChatUserLabel(user: KolamTeamChatUserRef) {
  return (
    [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
    user.username ||
    user.email ||
    'User'
  );
}

function getMentionInitials(label: string) {
  const words = label.trim().split(/\s+/).filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();

  return initials || '@';
}

function normalizeChatLabelColor(color?: string) {
  const value = color?.trim();
  if (!value) {
    return V.colors.primary;
  }

  const normalized = value.startsWith('#') ? value : `#${value}`;
  return /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized : V.colors.primary;
}

function isSystemChatLabel(label: KolamChatLabel) {
  const name = label.name.trim().toLowerCase();
  return name === 'pelanggan' || name === 'customer';
}

function getAttachmentFileName(attachment: KolamTeamChatAttachment) {
  if (attachment.fileName?.trim()) {
    return attachment.fileName.trim();
  }

  const pathName = attachment.url.split(/[\\/]/).pop()?.trim();
  return pathName || getAttachmentKindLabel(attachment);
}

function getAttachmentKindLabel(attachment: KolamTeamChatAttachment) {
  switch (attachment.kind) {
    case 'audio':
      return 'Audio';
    case 'image':
      return 'Gambar';
    case 'video':
      return 'Video';
    case 'file':
    default:
      return 'File';
  }
}

function getTeamChatEmbedTypeLabel(type: KolamTeamChatEmbed['type']) {
  switch (type) {
    case 'invoice':
      return 'Invoice';
    case 'task':
      return 'Tugas';
    case 'purchase_order':
      return 'Purchase Order';
    default:
      return 'Embed';
  }
}

function getTeamChatEmbedInitial(label: string) {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getTeamChatLinkPreviewImage(preview: KolamTeamChatLinkPreview) {
  const maybeImageUrl = (preview as { imageUrl?: unknown }).imageUrl;
  if (typeof maybeImageUrl === 'string' && maybeImageUrl.trim()) {
    return maybeImageUrl.trim();
  }

  return preview.image?.trim() ?? '';
}

function getTeamChatEmbedHref(embed: KolamTeamChatEmbed) {
  const maybeHref = (embed as { href?: unknown }).href;
  if (typeof maybeHref === 'string' && maybeHref.trim()) {
    return maybeHref.trim();
  }

  return embed.url?.trim() ?? '';
}

function getAnalyticsNumber(
  data: KolamChatAnalytics | null,
  path: string,
): number {
  const value = path.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') {
      return undefined;
    }

    return (current as Record<string, unknown>)[key];
  }, data);

  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function formatMetricNumber(value: number) {
  return String(Math.round(value));
}

function formatRating(value: number) {
  return value > 0 ? value.toFixed(1) : '-';
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatJoinedMonth(iso: string) {
  const timestamp = new Date(iso).getTime();
  if (!Number.isFinite(timestamp)) {
    return '-';
  }

  return new Date(iso).toLocaleDateString('id-ID', {
    month: 'short',
    year: 'numeric',
  });
}

function formatOrderDate(iso?: string) {
  if (!iso) {
    return '';
  }

  const timestamp = new Date(iso).getTime();
  if (!Number.isFinite(timestamp)) {
    return '';
  }

  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatOrderStatus(status: KolamChatContactOrder['status']) {
  switch (status) {
    case 'partial_paid':
      return 'Partial';
    case 'cancelled':
      return 'Cancelled';
    case 'draft':
      return 'Draft';
    case 'paid':
      return 'Paid';
    case 'pending':
      return 'Pending';
    case 'sent':
    default:
      return 'Sent';
  }
}

function getContactInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

function formatRelativeTime(iso?: string | null) {
  if (!iso) {
    return '';
  }

  const timestamp = new Date(iso).getTime();
  if (!Number.isFinite(timestamp)) {
    return '';
  }

  const diffMs = Date.now() - timestamp;
  if (diffMs < 60_000) {
    return 'now';
  }

  if (diffMs < 3_600_000) {
    return `${Math.floor(diffMs / 60_000)}m`;
  }

  if (diffMs < 86_400_000) {
    return `${Math.floor(diffMs / 3_600_000)}h`;
  }

  if (diffMs < 604_800_000) {
    return `${Math.floor(diffMs / 86_400_000)}d`;
  }

  return new Date(iso).toLocaleDateString('id-ID');
}

const styles = StyleSheet.create({
  rail: {
    width: 360,
    minWidth: 360,
    maxWidth: 360,
    backgroundColor: V.colors.bg,
    borderLeftColor: V.colors.border,
    borderLeftWidth: 1,
    overflow: 'visible',
    position: 'relative',
    zIndex: 500,
    elevation: 50,
  },
  header: {
    minHeight: V.layout.topNavHeight,
    paddingHorizontal: 14,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    zIndex: 200,
    elevation: 20,
    overflow: 'visible',
  },
  titleGroup: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 210,
    elevation: 21,
  },
  iconShell: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  copyGroup: {
    minWidth: 0,
    flex: 1,
    zIndex: 220,
    elevation: 22,
  },
  eyebrow: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '800',
  },
  titleInlineRow: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  headerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 7,
    flexShrink: 0,
    zIndex: 230,
    elevation: 23,
  },
  chatHeaderMenuHost: {
    position: 'relative',
    zIndex: 230,
    elevation: 23,
  },
  chatHealthMenuHost: {
    position: 'relative',
    zIndex: 230,
    elevation: 23,
  },
  chatHealthButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderColor: V.colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.bg,
  },
  chatHealthButtonActive: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  chatAnalyticsButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderColor: V.colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.bg,
  },
  chatSettingsButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderColor: V.colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.bg,
  },
  teamDaraHeaderButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderColor: V.colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.bg,
    overflow: 'hidden',
  },
  teamDaraHeaderAvatarImage: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  teamDaraHeaderAvatarText: {
    color: V.colors.primaryFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '900',
  },
  chatSettingsIcon: {
    width: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  chatSettingsIconCore: {
    width: 9,
    height: 9,
    borderRadius: 5,
    borderColor: V.colors.primary,
    borderWidth: 2,
    backgroundColor: V.colors.bg,
  },
  chatSettingsIconTooth: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: V.colors.mutedFg,
  },
  chatSettingsIconToothTop: {
    top: 0,
    left: 6,
  },
  chatSettingsIconToothRight: {
    top: 6,
    right: 0,
  },
  chatSettingsIconToothBottom: {
    bottom: 0,
    left: 6,
  },
  chatSettingsIconToothLeft: {
    top: 6,
    left: 0,
  },
  chatAnalyticsIcon: {
    width: 14,
    height: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
  },
  chatAnalyticsBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: V.colors.mutedFg,
  },
  chatAnalyticsBarLow: {
    height: 6,
  },
  chatAnalyticsBarMid: {
    height: 10,
    backgroundColor: V.colors.primary,
  },
  chatAnalyticsBarHigh: {
    height: 13,
  },
  chatHealthRadarIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderColor: V.colors.mutedFg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHealthRadarDotPrimary: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: V.colors.fg,
  },
  chatHealthRadarDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: V.colors.mutedFg,
  },
  chatHealthRadarDotTop: {
    top: 2,
    right: 3,
  },
  chatHealthRadarDotSide: {
    bottom: 3,
    left: 3,
  },
  chatHealthPopover: {
    position: 'absolute',
    top: 30,
    right: 0,
    width: 286,
    padding: 10,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    gap: 8,
    zIndex: 400,
    elevation: 40,
    shadowColor: '#111827',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  chatAnalyticsPopover: {
    position: 'absolute',
    top: 30,
    right: 0,
    width: 246,
    padding: 10,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    gap: 8,
    zIndex: 400,
    elevation: 40,
    shadowColor: '#111827',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  chatSettingsPopover: {
    position: 'absolute',
    top: 30,
    right: 0,
    width: 212,
    padding: 10,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    gap: 8,
    zIndex: 400,
    elevation: 40,
    shadowColor: '#111827',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  teamDaraWindow: {
    // Same anchor class as profile user menu — final position on first paint.
    position: 'absolute',
    top: V.layout.topNavHeight - 1,
    right: V.layout.contentPadding,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    elevation: 200,
    gap: 8,
    overflow: 'hidden',
    padding: 12,
    shadowColor: V.colors.fg,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    zIndex: 2000,
  },
  teamDaraWindowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    padding: 12,
    gap: 10,
    borderRadius: V.radius.lg,
    borderBottomColor: V.colors.border,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.primarySoft,
  },
  teamDaraWindowDragHandle: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teamDaraWindowBody: {
    flex: 1,
    minHeight: 0,
    padding: 0,
  },
  teamDaraWindowFooter: {
    alignItems: 'stretch',
    flexShrink: 0,
  },
  teamDaraWindowCloseButton: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamDaraWindowCloseText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  teamDaraHeaderLargeAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderColor: V.colors.primary,
    borderWidth: 1,
    backgroundColor: V.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  teamDaraHeaderLargeAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  teamDaraHeaderLargeAvatarText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  teamDaraHeaderCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  teamDaraHeaderTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '900',
  },
  teamDaraHeaderMeta: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  teamDaraWindowPlaceholder: {
    flex: 1,
    minHeight: 260,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    borderStyle: 'dashed',
    backgroundColor: V.colors.mutedSoft,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 8,
  },
  teamDaraWindowPlaceholderTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  teamDaraWindowPlaceholderText: {
    maxWidth: 460,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
  },
  teamDaraWindowMessageList: {
    gap: 10,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 12,
  },
  teamDaraWindowMessageScroll: {
    flex: 1,
    minHeight: 0,
  },
  teamDaraWindowMessageBubble: {
    maxWidth: '78%',
    padding: 10,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    gap: 7,
  },
  teamDaraWindowMessageMine: {
    alignSelf: 'flex-end',
    backgroundColor: V.colors.primarySoft,
  },
  teamDaraWindowMessageOther: {
    alignSelf: 'flex-start',
    backgroundColor: V.colors.bg,
  },
  teamDaraComposerShell: {
    minHeight: 58,
    paddingTop: 7,
    paddingBottom: 7,
  },
  teamDaraComposerInput: {
    minHeight: 30,
    maxHeight: 62,
  },
  chatSettingsMenuList: {
    gap: 6,
  },
  chatSettingsMenuItem: {
    minHeight: 34,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 9,
  },
  chatSettingsMenuBullet: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: V.colors.primary,
  },
  chatSettingsMenuLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  chatLabelsDialogHost: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  chatLabelsDialog: {
    width: 680,
    maxWidth: '96%',
    maxHeight: '88%',
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    padding: 14,
    gap: 12,
    shadowColor: V.colors.fg,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    zIndex: 3,
    elevation: 30,
  },
  chatLabelsDialogHeader: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  chatLabelsDialogTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
  },
  chatLabelsCloseButton: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatLabelsCloseText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  chatLabelsError: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  chatLabelsBody: {
    minHeight: 280,
    flexDirection: 'row',
    gap: 12,
  },
  chatLabelsList: {
    minWidth: 0,
    flex: 1.2,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    padding: 10,
    gap: 8,
  },
  chatLabelsListHeader: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  chatLabelsSectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  chatLabelsSmallButton: {
    minHeight: 28,
    paddingHorizontal: 9,
    borderRadius: V.radius.md,
    backgroundColor: V.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatLabelsSmallButtonText: {
    color: V.colors.primaryFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  chatLabelsListScroll: {
    maxHeight: 280,
  },
  chatLabelsRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    paddingHorizontal: 9,
    paddingVertical: 7,
    marginBottom: 6,
  },
  chatLabelsRowMain: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatLabelsColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  chatLabelsName: {
    minWidth: 0,
    flex: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  chatLabelsRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chatLabelsIconButton: {
    minHeight: 26,
    paddingHorizontal: 8,
    borderRadius: V.radius.sm,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatLabelsDeleteButton: {
    borderColor: V.colors.danger,
  },
  chatLabelsIconButtonText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  chatLabelsDeleteText: {
    color: V.colors.danger,
  },
  chatLabelsForm: {
    minWidth: 0,
    flex: 1,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    padding: 10,
    gap: 9,
  },
  chatLabelsInput: {
    minHeight: 38,
    borderRadius: V.radius.md,
    borderColor: V.colors.input,
    borderWidth: 1,
    paddingHorizontal: 10,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: V.colors.bg,
  },
  chatLabelsColorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatLabelsColorPreview: {
    width: 38,
    height: 38,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  chatLabelsColorInput: {
    flex: 1,
  },
  chatLabelsSwatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  chatLabelsSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  chatLabelsSwatchActive: {
    borderColor: V.colors.fg,
    borderWidth: 2,
  },
  chatLabelsFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  chatLabelsActionButton: {
    minHeight: 32,
    paddingHorizontal: 11,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatLabelsActionButtonPrimary: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primary,
  },
  chatLabelsActionButtonDanger: {
    borderColor: V.colors.danger,
    backgroundColor: V.colors.danger,
  },
  chatLabelsActionText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  chatLabelsActionPrimaryText: {
    color: V.colors.primaryFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  chatLabelsDeleteConfirm: {
    borderRadius: V.radius.md,
    borderColor: V.colors.danger,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    padding: 10,
    gap: 8,
  },
  chatLabelsDeleteConfirmTitle: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  chatLabelsDeleteConfirmText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  chatHealthPopoverHeader: {
    gap: 2,
  },
  chatHealthPopoverTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  chatHealthPopoverMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  chatHealthPlatformRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingVertical: 7,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  chatHealthPlatformIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.bg,
  },
  chatHealthPlatformCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  chatHealthPlatformTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  chatHealthPlatformTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  chatHealthStatusPill: {
    minWidth: 48,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
    textAlign: 'center',
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '900',
  },
  chatHealthStatusHealthy: {
    color: '#047857',
    backgroundColor: '#d1fae5',
  },
  chatHealthStatusStarting: {
    color: '#92400e',
    backgroundColor: '#fef3c7',
  },
  chatHealthStatusStale: {
    color: '#9a3412',
    backgroundColor: '#ffedd5',
  },
  chatHealthStatusDown: {
    color: '#991b1b',
    backgroundColor: '#fee2e2',
  },
  chatHealthReasonText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  chatHealthActivityText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '700',
  },
  chatHealthErrorText: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  chatHealthEmptyText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  body: {
    flex: 1,
    padding: 16,
    gap: 12,
    zIndex: 1,
  },
  metaText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  filterPanel: {
    padding: 10,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    gap: 8,
    zIndex: 1,
  },
  filterSearchInput: {
    minHeight: 34,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: V.radius.md,
    borderColor: V.colors.input,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: V.colors.bg,
  },
  filterGroup: {
    gap: 5,
  },
  filterGroupLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  filterDropdownStack: {
    gap: 6,
  },
  filterDropdown: {
    width: '100%',
  },
  filterDropdownTrigger: {
    minHeight: 32,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: V.radius.md,
    backgroundColor: V.colors.bg,
  },
  filterDropdownText: {
    fontSize: 10,
    fontWeight: '900',
  },
  filterChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  filterBottomRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  platformFilterChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderColor: V.colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.bg,
  },
  platformFilterChipActive: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  platformHealthGlow: {
    position: 'absolute',
    width: 31,
    height: 31,
    borderRadius: 16,
    borderWidth: 2,
  },
  platformHealthHalo: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  platformLogoImage: {
    width: 21,
    height: 21,
    borderRadius: 5,
  },
  platformLogoImageOffline: {
    opacity: 0.28,
  },
  allPlatformLogo: {
    width: 15,
    height: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  allPlatformDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: V.colors.mutedFg,
  },
  storeLogoBag: {
    width: 18,
    height: 16,
    marginTop: 4,
    borderRadius: 4,
    borderColor: '#0f9f6e',
    borderWidth: 2,
    backgroundColor: '#e8fff5',
  },
  storeLogoBagOffline: {
    borderColor: '#9ca3af',
    backgroundColor: '#f3f4f6',
    opacity: 0.62,
  },
  storeLogoHandle: {
    position: 'absolute',
    top: -6,
    left: 4,
    width: 7,
    height: 7,
    borderTopColor: '#0f9f6e',
    borderLeftColor: '#0f9f6e',
    borderRightColor: '#0f9f6e',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  storeLogoHandleOffline: {
    borderTopColor: '#9ca3af',
    borderLeftColor: '#9ca3af',
    borderRightColor: '#9ca3af',
  },
  tiktokLogo: {
    width: 20,
    height: 22,
  },
  tiktokStemAccent: {
    position: 'absolute',
    left: 8,
    top: 1,
    width: 5,
    height: 15,
    borderRadius: 3,
    backgroundColor: '#25f4ee',
  },
  tiktokStem: {
    position: 'absolute',
    left: 10,
    top: 0,
    width: 5,
    height: 15,
    borderRadius: 3,
    backgroundColor: '#111111',
  },
  tiktokBar: {
    position: 'absolute',
    left: 10,
    top: 0,
    width: 10,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#111111',
  },
  tiktokDotAccent: {
    position: 'absolute',
    left: 1,
    bottom: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#fe2c55',
  },
  tiktokDot: {
    position: 'absolute',
    left: 3,
    bottom: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#111111',
  },
  instagramLogo: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderColor: '#e1306c',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff0f6',
  },
  instagramLogoOffline: {
    borderColor: '#9ca3af',
    backgroundColor: '#f3f4f6',
    opacity: 0.62,
  },
  instagramLens: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderColor: '#e1306c',
    borderWidth: 2,
  },
  instagramLensOffline: {
    borderColor: '#9ca3af',
  },
  instagramFlash: {
    position: 'absolute',
    right: 3,
    top: 3,
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#e1306c',
  },
  instagramFlashOffline: {
    backgroundColor: '#9ca3af',
  },
  filterResetButton: {
    minHeight: 28,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.secondary,
  },
  filterResetText: {
    color: V.colors.secondaryFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  analyticsPanel: {
    padding: 10,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    gap: 8,
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  analyticsTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  analyticsPeriod: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  analyticsMetric: {
    minWidth: 0,
    flex: 1,
    padding: 7,
    borderRadius: V.radius.md,
    backgroundColor: V.colors.bg,
    gap: 2,
  },
  analyticsMetricLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  analyticsMetricValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
  },
  createRoomPanel: {
    padding: 10,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    gap: 8,
  },
  teamChatAddRoomIcon: {
    width: 14,
    height: 14,
    position: 'relative',
  },
  teamChatAddRoomIconHorizontal: {
    position: 'absolute',
    left: 1,
    right: 1,
    top: 6,
    height: 2,
    borderRadius: 1,
    backgroundColor: V.colors.fg,
  },
  teamChatAddRoomIconVertical: {
    position: 'absolute',
    top: 1,
    bottom: 1,
    left: 6,
    width: 2,
    borderRadius: 1,
    backgroundColor: V.colors.fg,
  },
  createRoomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  createRoomCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  createRoomTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  createRoomMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  createRoomToggle: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: V.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.primary,
  },
  createRoomToggleText: {
    color: V.colors.primaryFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  createRoomMessage: {
    color: V.colors.success,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  createRoomError: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  createRoomForm: {
    gap: 8,
  },
  createRoomInput: {
    minHeight: 32,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: V.colors.bg,
  },
  createRoomDescriptionInput: {
    minHeight: 56,
    paddingVertical: 8,
    textAlignVertical: 'top',
  },
  createRoomCategoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  createRoomCategoryButton: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.bg,
  },
  createRoomCategoryButtonActive: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  createRoomCategoryText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  createRoomCategoryTextActive: {
    color: V.colors.primary,
  },
  createRoomSubmit: {
    minHeight: 32,
    borderRadius: V.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.primary,
  },
  createRoomFooterSubmit: {
    minWidth: 96,
    paddingHorizontal: 14,
  },
  createRoomSubmitText: {
    color: V.colors.primaryFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  directPrimaryButton: {
    minHeight: 32,
    borderRadius: V.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.primary,
  },
  directUserRow: {
    minHeight: 42,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  directUserCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  directUserName: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  directUserActionText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  selectedBanner: {
    padding: 8,
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.primary,
    borderWidth: 1,
    gap: 4,
  },
  selectedBannerTeam: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 8,
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  selectedTitleRow: {
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedTitleBlock: {
    minWidth: 0,
    flex: 1,
    gap: 1,
  },
  detailBackButton: {
    width: 20,
    height: 20,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: V.colors.primarySoft,
  },
  detailDeleteRoomButton: {
    width: 28,
    height: 28,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  detailRoomCallButton: {
    width: 28,
    height: 28,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  teamRoomTrashIcon: {
    width: 18,
    height: 18,
    position: 'relative',
  },
  teamRoomTrashHandle: {
    position: 'absolute',
    left: 6,
    top: 1,
    width: 6,
    height: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderColor: V.colors.danger,
    borderWidth: 2,
    borderBottomWidth: 0,
  },
  teamRoomTrashLid: {
    position: 'absolute',
    left: 2,
    top: 5,
    width: 14,
    height: 2,
    borderRadius: 999,
    backgroundColor: V.colors.danger,
  },
  teamRoomTrashCan: {
    position: 'absolute',
    left: 4,
    top: 8,
    width: 12,
    height: 9,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderColor: V.colors.danger,
    borderWidth: 2,
    borderTopWidth: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
    paddingTop: 2,
  },
  teamRoomTrashLine: {
    width: 2,
    height: 5,
    borderRadius: 1,
    backgroundColor: V.colors.danger,
  },
  selectedTitle: {
    minWidth: 0,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '800',
  },
  selectedMeta: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  presenceMeta: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  presenceMetaInline: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
  },
  purgeStatusMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
  },
  messageSearchBar: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 6,
  },
  messageSearchInput: {
    minWidth: 0,
    flex: 1,
    minHeight: 30,
    height: 30,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 0,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: V.colors.bg,
  },
  messageSearchButton: {
    minHeight: 30,
    height: 30,
    paddingHorizontal: 10,
    borderRadius: V.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.primary,
  },
  messageSearchButtonGhost: {
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  messagePurgeButton: {
    width: 30,
    height: 30,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  messageSearchButtonText: {
    color: V.colors.primaryFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  messageSearchButtonGhostText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  callStrip: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    gap: 6,
  },
  callStripIdle: {
    alignSelf: 'flex-start',
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  inboxActionStrip: {
    marginTop: 6,
    padding: 8,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    gap: 7,
  },
  inboxLabelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  inboxLabelPill: {
    maxWidth: 130,
    minHeight: 23,
    paddingHorizontal: 7,
    borderRadius: 12,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  inboxLabelDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  inboxLabelText: {
    minWidth: 0,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  inboxLabelPicker: {
    padding: 8,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    gap: 6,
  },
  inboxLabelPickerTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  inboxLabelPickerEmpty: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  inboxHandoverNotePanel: {
    padding: 8,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    gap: 7,
  },
  inboxHandoverNoteActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 7,
  },
  inboxHandoverBanner: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomColor: '#FCD34D',
    borderBottomWidth: 1,
    backgroundColor: '#FFFBEB',
    gap: 4,
  },
  inboxHandoverBannerTitle: {
    color: '#78350F',
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  inboxHandoverBannerRoute: {
    color: '#92400E',
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  inboxHandoverBannerText: {
    color: '#78350F',
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  inboxLabelOptionList: {
    gap: 5,
  },
  inboxLabelOption: {
    minHeight: 30,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  inboxLabelOptionActive: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  inboxLabelOptionText: {
    minWidth: 0,
    flex: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  inboxLabelOptionMark: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '900',
  },
  inboxActionMeta: {
    gap: 2,
  },
  inboxActionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  inboxActionCopy: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  inboxActionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  callTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  callTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  callMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  callActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  callAdvancedActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  callParticipantList: {
    gap: 4,
  },
  callParticipantRow: {
    minHeight: 30,
    paddingLeft: 8,
    borderLeftColor: V.colors.border,
    borderLeftWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  callParticipantText: {
    minWidth: 0,
    flex: 1,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  callButton: {
    minHeight: 28,
    paddingHorizontal: 9,
    borderRadius: V.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.primary,
  },
  callIconButton: {
    borderRadius: 16,
    height: 32,
    minHeight: 32,
    paddingHorizontal: 0,
    width: 32,
  },
  callButtonGhost: {
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  callButtonActive: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  callButtonDanger: {
    backgroundColor: V.colors.danger,
  },
  callButtonDisabled: {
    opacity: 0.55,
  },
  callButtonText: {
    color: V.colors.primaryFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  callButtonGhostText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  detailPanel: {
    maxHeight: 560,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    overflow: 'hidden',
  },
  detailPanelFull: {
    minHeight: 0,
    maxHeight: undefined,
    flex: 1,
  },
  messagePane: {
    minHeight: 120,
    maxHeight: 190,
    padding: 10,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    gap: 8,
  },
  messagePaneFull: {
    minHeight: 0,
    maxHeight: undefined,
    flex: 1,
  },
  messageSearchMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  messageScroll: {
    maxHeight: 170,
  },
  messageScrollFull: {
    minHeight: 0,
    maxHeight: undefined,
    flex: 1,
  },
  messageList: {
    gap: 8,
    paddingBottom: 4,
  },
  messageBubble: {
    alignSelf: 'stretch',
    maxWidth: '100%',
    padding: 9,
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.mutedSoft,
    gap: 3,
  },
  messageBubbleMine: {
    backgroundColor: V.colors.primarySoft,
  },
  messageBubbleOther: {
    backgroundColor: V.colors.bg,
  },
  teamMessageAuthorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  teamMessageAvatar: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 9,
    borderWidth: 1,
    height: 18,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 18,
  },
  teamMessageAvatarImage: {
    height: 18,
    width: 18,
  },
  teamMessageAvatarText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 8,
    fontWeight: '800',
  },
  messageAuthor: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    flexShrink: 1,
  },
  messageBody: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  inboxRichStack: {
    gap: 7,
  },
  inboxRichImage: {
    width: 220,
    height: 132,
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.bg,
  },
  inboxRichImagePressable: {
    width: 220,
    height: 132,
    borderRadius: V.radius.lg,
    overflow: 'hidden',
    backgroundColor: V.colors.bg,
  },
  inboxRichImageCaption: {
    width: 220,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  inboxRichCard: {
    width: 230,
    minHeight: 64,
    padding: 8,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inboxRichCardImage: {
    width: 54,
    height: 54,
    borderRadius: V.radius.md,
    backgroundColor: V.colors.mutedSoft,
  },
  inboxRichCardIcon: {
    width: 42,
    height: 42,
    borderRadius: V.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.secondary,
  },
  inboxRichCardIconText: {
    color: V.colors.secondaryFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  inboxRichCardCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  inboxRichCardStrong: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  inboxReplyCard: {
    width: 220,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderLeftColor: V.colors.primary,
    borderLeftWidth: 2,
    borderRadius: V.radius.md,
    backgroundColor: V.colors.secondary,
    gap: 4,
  },
  inboxReplyImage: {
    width: 88,
    height: 52,
    borderRadius: V.radius.sm,
  },
  inboxDaraMeta: {
    width: 220,
    padding: 7,
    borderRadius: V.radius.md,
    borderColor: V.colors.primary,
    borderWidth: 1,
    backgroundColor: V.colors.primarySoft,
    gap: 2,
  },
  inboxLightboxRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  inboxLightboxFrame: {
    width: '98%',
    height: '94%',
    maxWidth: 1440,
    maxHeight: 980,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    overflow: 'hidden',
  },
  inboxLightboxImage: {
    width: '100%',
    height: '100%',
    backgroundColor: V.colors.mutedSoft,
  },
  inboxLightboxClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: V.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  inboxLightboxCloseText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  messageMention: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  messageMentionAi: {
    color: V.colors.danger,
  },
  daraThinkingRow: {
    maxWidth: '86%',
    padding: 9,
    borderRadius: V.radius.lg,
    borderColor: V.colors.primary,
    borderWidth: 1,
    backgroundColor: V.colors.primarySoft,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  daraThinkingAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.primary,
  },
  daraThinkingAvatarText: {
    color: V.colors.primaryFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '900',
  },
  daraThinkingCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  daraThinkingAuthor: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  daraThinkingText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  attachmentList: {
    gap: 6,
  },
  attachmentImageShell: {
    width: 180,
    height: 118,
    borderRadius: V.radius.lg,
    overflow: 'hidden',
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  attachmentImage: {
    width: 180,
    height: 118,
  },
  attachmentVideoRow: {
    minHeight: 72,
    padding: 8,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attachmentVideoThumb: {
    width: 72,
    height: 48,
    borderRadius: V.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  attachmentVideoText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  attachmentOpenText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  attachmentFileRow: {
    minHeight: 44,
    padding: 8,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attachmentKindBadge: {
    minWidth: 44,
    height: 24,
    borderRadius: V.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.secondary,
  },
  attachmentKindText: {
    color: V.colors.secondaryFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '900',
  },
  attachmentFileCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  attachmentFileName: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  attachmentFileMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  replyPreviewCard: {
    width: 220,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderLeftColor: V.colors.primary,
    borderLeftWidth: 2,
    borderRadius: V.radius.md,
    backgroundColor: V.colors.secondary,
    gap: 2,
  },
  replyPreviewSender: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  replyPreviewBody: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  replyComposerStrip: {
    marginHorizontal: 10,
    marginBottom: 8,
    minHeight: 44,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderLeftColor: V.colors.primary,
    borderLeftWidth: 3,
    borderRadius: 8,
    backgroundColor: V.colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replyComposerCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  replyComposerTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  replyComposerBody: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  replyComposerCancel: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.bg,
  },
  replyComposerCancelText: {
    color: V.colors.secondaryFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  chatPreviewList: {
    gap: 6,
  },
  chatPreviewCard: {
    width: 220,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: V.colors.bg,
  },
  chatPreviewImage: {
    width: 220,
    height: 92,
  },
  chatPreviewCopy: {
    padding: 8,
    gap: 3,
  },
  chatPreviewKicker: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  chatPreviewTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  chatPreviewDescription: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  chatPreviewUrl: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '700',
  },
  chatEmbedList: {
    gap: 6,
  },
  chatEmbedCard: {
    width: 220,
    minHeight: 54,
    padding: 8,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatEmbedIcon: {
    width: 34,
    height: 34,
    borderRadius: V.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.secondary,
  },
  chatEmbedIconText: {
    color: V.colors.secondaryFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  chatEmbedCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  chatEmbedKicker: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  chatEmbedTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  chatEmbedSubtitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  chatEmbedUrl: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '700',
  },
  reactionControls: {
    alignItems: 'flex-end',
    gap: 5,
  },
  teamBubbleActionRow: {
    alignItems: 'flex-end',
    gap: 5,
  },
  teamBubbleActionButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 20,
    justifyContent: 'center',
    paddingHorizontal: 7,
  },
  teamBubbleActionButtonOpen: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  teamBubbleActionButtonText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 12,
  },
  teamBubbleActionMenu: {
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
    padding: 6,
  },
  messageActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  replyActionButton: {
    alignSelf: 'flex-start',
    minHeight: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.secondary,
  },
  editActionButton: {
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  replyActionText: {
    color: V.colors.secondaryFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  editMessageComposer: {
    gap: 8,
  },
  editMessageInput: {
    minHeight: 64,
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    backgroundColor: V.colors.bg,
    textAlignVertical: 'top',
  },
  editMessageActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editMessageButton: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  editMessageButtonPrimary: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primary,
  },
  editMessageButtonText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  editMessageButtonPrimaryText: {
    color: V.colors.primaryFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  reactionPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  reactionPill: {
    minHeight: 24,
    paddingHorizontal: 7,
    borderRadius: 12,
    borderColor: V.colors.border,
    borderWidth: 1,
    justifyContent: 'center',
    backgroundColor: V.colors.bg,
  },
  reactionPillMine: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  reactionPillText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  reactionPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  reactionButton: {
    width: 26,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.secondary,
  },
  reactionButtonDisabled: {
    opacity: 0.55,
  },
  reactionButtonText: {
    color: V.colors.secondaryFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  messageMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  messageMetaInline: {
    flexShrink: 0,
    marginLeft: 'auto',
  },
  emptyDetailText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  mentionPicker: {
    marginHorizontal: 10,
    marginBottom: 8,
    padding: 8,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    gap: 6,
  },
  mentionPickerTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  mentionOptionList: {
    gap: 5,
  },
  mentionOption: {
    minHeight: 38,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mentionOptionAi: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  mentionAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.secondary,
  },
  mentionAvatarAi: {
    backgroundColor: V.colors.primary,
  },
  mentionAvatarText: {
    color: V.colors.primaryFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  mentionOptionCopy: {
    minWidth: 0,
    flex: 1,
    gap: 1,
  },
  mentionOptionLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  mentionOptionUsername: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  pendingAttachment: {
    marginHorizontal: 10,
    marginBottom: 8,
    minHeight: 32,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingAttachmentText: {
    minWidth: 0,
    flex: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  pendingAttachmentRemove: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.secondary,
  },
  pendingAttachmentRemoveText: {
    color: V.colors.secondaryFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  templatePicker: {
    marginHorizontal: 10,
    marginBottom: 8,
    maxHeight: 230,
    padding: 10,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    gap: 8,
  },
  templatePickerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  templatePickerCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  templatePickerTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  templatePickerMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  templatePickerClose: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.secondary,
  },
  templatePickerCloseText: {
    color: V.colors.secondaryFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  templateSearchInput: {
    minHeight: 34,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: V.radius.md,
    borderColor: V.colors.input,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    backgroundColor: V.colors.bg,
  },
  templatePickerMessage: {
    paddingVertical: 10,
    textAlign: 'center',
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  templatePickerError: {
    paddingVertical: 10,
    textAlign: 'center',
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  templateListScroll: {
    maxHeight: 126,
  },
  templateRow: {
    minHeight: 52,
    padding: 8,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  templateRowCopy: {
    minWidth: 0,
    flex: 1,
    gap: 3,
  },
  templateRowTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  templateRowBody: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
  },
  templateCategory: {
    maxWidth: 76,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 9,
    color: V.colors.secondaryFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '900',
    backgroundColor: V.colors.secondary,
  },
  marketplacePicker: {
    marginHorizontal: 10,
    marginBottom: 8,
    maxHeight: 260,
    padding: 10,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    gap: 8,
  },
  marketplaceListScroll: {
    maxHeight: 156,
  },
  marketplaceListingRow: {
    minHeight: 54,
    padding: 8,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  marketplaceListingRowDisabled: {
    opacity: 0.58,
  },
  marketplaceListingCopy: {
    minWidth: 0,
    flex: 1,
    gap: 4,
  },
  marketplaceListingTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 15,
  },
  marketplaceListingMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  marketplaceListingState: {
    maxWidth: 64,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 9,
    color: V.colors.secondaryFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '900',
    backgroundColor: V.colors.secondary,
  },
  emojiPicker: {
    marginHorizontal: 10,
    marginBottom: 8,
    padding: 8,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  emojiPickerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.bg,
  },
  emojiPickerButtonText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    lineHeight: 18,
  },
  contactDetailsPanel: {
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 8,
    maxHeight: 230,
    padding: 10,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    gap: 8,
  },
  contactDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  contactAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.primarySoft,
  },
  contactAvatarText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '900',
  },
  contactHeaderCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  contactName: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  contactPlatform: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  contactDetailsScroll: {
    maxHeight: 166,
  },
  contactDetailsContent: {
    gap: 10,
    paddingBottom: 2,
  },
  contactDetailsMessage: {
    paddingVertical: 10,
    textAlign: 'center',
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  contactDetailsError: {
    paddingVertical: 10,
    textAlign: 'center',
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  contactSection: {
    gap: 5,
  },
  contactSectionTitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0,
  },
  contactSectionBody: {
    gap: 4,
  },
  contactDetailRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  contactDetailLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  contactDetailValue: {
    minWidth: 0,
    flex: 1,
    textAlign: 'right',
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  orderList: {
    gap: 5,
  },
  orderRow: {
    minHeight: 48,
    paddingVertical: 6,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  orderCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  orderInvoice: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  orderMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  orderAmountGroup: {
    maxWidth: 110,
    alignItems: 'flex-end',
    gap: 3,
  },
  orderAmount: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  orderStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    color: V.colors.secondaryFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '900',
    backgroundColor: V.colors.secondary,
  },
  contactUnlinkedBox: {
    padding: 10,
    borderRadius: V.radius.md,
    backgroundColor: V.colors.bg,
    gap: 4,
  },
  contactUnlinkedTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  contactUnlinkedCopy: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
    textAlign: 'center',
  },
  composer: {
    padding: 10,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  composerShell: {
    minHeight: 82,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: V.radius.lg,
    borderColor: V.colors.input,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    gap: 6,
  },
  composerShellBlocked: {
    backgroundColor: V.colors.mutedSoft,
  },
  composerGate: {
    marginHorizontal: 10,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.primarySoft,
  },
  composerGateText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
    textAlign: 'center',
  },
  attachButton: {
    width: 38,
    height: 38,
    borderRadius: V.radius.lg,
    borderColor: V.colors.input,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.bg,
  },
  attachButtonDisabled: {
    opacity: 0.55,
  },
  attachButtonText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },
  templateButton: {
    width: 38,
    height: 38,
    borderRadius: V.radius.lg,
    borderColor: V.colors.input,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.bg,
  },
  templateButtonActive: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  templateButtonText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
  },
  composerInput: {
    minHeight: 34,
    maxHeight: 86,
    minWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 3,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    backgroundColor: 'transparent',
  },
  composerToolbar: {
    minHeight: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  composerToolGroup: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  composerIconButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.mutedSoft,
  },
  composerIconButtonActive: {
    backgroundColor: V.colors.primarySoft,
  },
  composerIconButtonDisabled: {
    opacity: 0.52,
  },
  composerIconButtonText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 14,
  },
  listScroll: {
    flex: 1,
    minHeight: 0,
  },
  list: {
    gap: 8,
    paddingBottom: 16,
  },
  row: {
    minHeight: 76,
    padding: 10,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowPlatformLogoShell: {
    width: 30,
    height: 30,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowStaffTooltip: {
    alignSelf: 'center',
  },
  rowStaffAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rowStaffAvatarImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  rowStaffAvatarText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  rowDaraAvatar: {
    backgroundColor: V.colors.primary,
    borderColor: V.colors.primary,
  },
  rowDaraAvatarText: {
    color: V.colors.primaryFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '900',
  },
  rowUnreadBadge: {
    flexShrink: 0,
    fontSize: 10,
    lineHeight: 14,
  },
  rowUnread: {
    borderColor: 'rgba(220, 38, 38, 0.28)',
    backgroundColor: 'rgba(254, 226, 226, 0.72)',
  },
  rowSelected: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  rowCopy: {
    minWidth: 0,
    flex: 1,
    gap: 5,
  },
  rowTopLine: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowTitle: {
    minWidth: 0,
    flex: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  rowTime: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  rowPreview: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  rowMetaLine: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowLabelLine: {
    minWidth: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  rowSubMeta: {
    minWidth: 0,
    flex: 1,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
});
