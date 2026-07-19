import type {ReadinessCheck} from './readiness';
import type {UnifiedSyncStatus} from '../services/unified-data';

export type AttentionTone = 'success' | 'info' | 'warning' | 'danger';

export interface AttentionPanelItem {
  id: string;
  label: string;
  message: string;
  meta: string;
  tone: AttentionTone;
  isUnread: boolean;
}

export interface AttentionPanelHeaderAction {
  id: 'unread' | 'see-all';
  label: string;
  routeHint: string;
}

export interface AttentionPanelCloseAction {
  id: 'close';
  label: string;
  iconKind: 'x';
  sourceComponent: string;
}

export interface AttentionPanelInput {
  checks: ReadinessCheck[];
  sync: UnifiedSyncStatus;
  errors?: Array<{id: string; label: string; message?: string}>;
}

export function getAttentionPanelItems({
  checks,
  sync,
  errors = [],
}: AttentionPanelInput): AttentionPanelItem[] {
  const readinessItems = checks
    .filter(check => check.status !== 'ready')
    .map<AttentionPanelItem>(check => ({
      id: `readiness-${check.id}`,
      label: check.label,
      message: check.detail,
      meta: check.evidence,
      tone: check.status === 'blocked' ? 'danger' : 'warning',
      isUnread: true,
    }));

  const errorItems = errors
    .filter(error => error.message)
    .map(error => ({
      id: `error-${error.id}`,
      label: error.label,
      message: error.message ?? '',
      meta: 'Source error',
      tone: 'danger' as const,
      isUnread: true,
    }));

  const syncItems = Object.entries(sync)
    .filter(([, state]) => state !== 'live')
    .map<AttentionPanelItem>(([area, state]) => ({
      id: `sync-${area}`,
      label: `${area.toUpperCase()} sync`,
      message: `Data ${area.toUpperCase()} sedang memakai status ${state}.`,
      meta: 'Unified sync',
      tone: state === 'disabled' ? 'warning' : 'info',
      isUnread: true,
    }));

  const items = [...errorItems, ...readinessItems, ...syncItems];

  if (items.length) {
    return items;
  }

  return [
    {
      id: 'all-clear',
      label: 'All clear',
      message: 'No unread operational notifications.',
      meta: 'Notifications',
      tone: 'success',
      isUnread: false,
    },
  ];
}

export function getAttentionPanelHeaderActions(
  unreadCount: number,
): AttentionPanelHeaderAction[] {
  const actions: AttentionPanelHeaderAction[] = [];

  if (unreadCount > 0) {
    actions.push({
      id: 'unread',
      label: `${unreadCount > 99 ? '99+' : unreadCount} Unread`,
      routeHint: 'native-attention',
    });
  }

  actions.push({
    id: 'see-all',
    label: 'See All',
    routeHint: '/notifications',
  });

  return actions;
}

export function getAttentionPanelCloseAction(): AttentionPanelCloseAction {
  return {
    id: 'close',
    label: 'Close notifications',
    iconKind: 'x',
    sourceComponent:
      'E:\\Projects\\da-inventory-frontend\\src\\components\\notification-popup.tsx',
  };
}
