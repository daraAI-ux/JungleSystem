import {
  getAttentionPanelCloseAction,
  getAttentionPanelHeaderActions,
  getAttentionPanelItems,
} from '../src/domain/attention-panel';
import type {ReadinessCheck} from '../src/domain/readiness';

const checks: ReadinessCheck[] = [
  {
    id: 'ready-check',
    area: 'platform',
    label: 'Ready check',
    status: 'ready',
    statusIconKind: 'check',
    detail: 'Ready detail',
    evidence: 'ready.ts',
  },
  {
    id: 'blocked-check',
    area: 'security',
    label: 'Blocked check',
    status: 'blocked',
    statusIconKind: 'clock',
    detail: 'Blocked detail',
    evidence: 'blocked.ts',
  },
  {
    id: 'partial-check',
    area: 'plugins',
    label: 'Partial check',
    status: 'partial',
    statusIconKind: 'activity',
    detail: 'Partial detail',
    evidence: 'partial.ts',
  },
];

describe('getAttentionPanelItems', () => {
  it('builds popup items from errors, non-ready readiness checks, and non-live sync', () => {
    const items = getAttentionPanelItems({
      checks,
      sync: {pos: 'live', kolam: 'seed', am: 'disabled'},
      errors: [{id: 'kolam', label: 'Kolam API', message: 'Token expired'}],
    });

    expect(items.map(item => item.id)).toEqual([
      'error-kolam',
      'readiness-blocked-check',
      'readiness-partial-check',
      'sync-kolam',
      'sync-am',
    ]);
    expect(items.find(item => item.id === 'error-kolam')?.meta).toBe(
      'Source error',
    );
    expect(items.find(item => item.id === 'sync-kolam')?.message).toBe(
      'Data KOLAM sedang memakai status seed.',
    );
    expect(items.find(item => item.id === 'readiness-blocked-check')?.tone).toBe(
      'danger',
    );
    expect(items.find(item => item.id === 'sync-am')?.tone).toBe('warning');
    expect(items.every(item => item.isUnread)).toBe(true);
  });

  it('returns an all-clear item when there is nothing to show', () => {
    const items = getAttentionPanelItems({
      checks: checks.filter(check => check.status === 'ready'),
      sync: {pos: 'live', kolam: 'live', am: 'live'},
    });

    expect(items).toEqual([
      {
        id: 'all-clear',
        label: 'All clear',
        message: 'No unread operational notifications.',
        meta: 'Notifications',
        tone: 'success',
        isUnread: false,
      },
    ]);
  });

  it('builds notification popup header actions like Kolam live', () => {
    expect(getAttentionPanelHeaderActions(4)).toEqual([
      {
        id: 'unread',
        label: '4 Unread',
        routeHint: 'native-attention',
      },
      {
        id: 'see-all',
        label: 'See All',
        routeHint: '/notifications',
      },
    ]);

    expect(getAttentionPanelHeaderActions(120)[0].label).toBe('99+ Unread');
    expect(getAttentionPanelHeaderActions(0)).toEqual([
      {
        id: 'see-all',
        label: 'See All',
        routeHint: '/notifications',
      },
    ]);
  });

  it('keeps an icon-only close affordance contract for the native popup chrome', () => {
    expect(getAttentionPanelCloseAction()).toEqual({
      id: 'close',
      label: 'Close notifications',
      iconKind: 'x',
      sourceComponent:
        'E:\\Projects\\da-inventory-frontend\\src\\components\\notification-popup.tsx',
    });
  });
});
