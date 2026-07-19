import {seedUnifiedDataset} from '../src/services/unified-data';
import {
  appendSyncActivity,
  getSyncActivityEntries,
  getSyncActivitySummary,
  getSyncStatusIconKind,
} from '../src/domain/sync-activity';

describe('sync activity model', () => {
  it('builds POS Kolam and AM activity entries from the unified dataset', () => {
    const dataset = {
      ...seedUnifiedDataset,
      errorMessage: 'POS offline',
      kolam: {
        ...seedUnifiedDataset.kolam,
        source: 'fallback' as const,
        errorMessage: 'Kolam offline',
      },
      am: {
        source: 'live' as const,
        dashboard: {
          summary: {
            totalBalance: 100000,
            totalAccounts: 1,
            todayIncoming: {total: 0, count: 0},
            todayOutgoing: {total: 0, count: 0},
            activeDevices: 1,
          },
          transfers: {
            pending: 0,
            processing: 0,
            success: 1,
            failed: 0,
            totalAmount: 0,
          },
          recentTransfers: [],
          recentMutasi: [],
          chartData: [],
          devices: [],
        },
      },
      sync: {
        pos: 'fallback' as const,
        kolam: 'fallback' as const,
        am: 'live' as const,
      },
    };

    expect(getSyncActivityEntries(dataset, '10:00')).toEqual([
      expect.objectContaining({
        area: 'pos',
        status: 'fallback',
        tone: 'warning',
        statusIconKind: 'activity',
        detail: 'POS fallback: POS offline',
        timestamp: '10:00',
      }),
      expect.objectContaining({
        area: 'kolam',
        status: 'fallback',
        tone: 'warning',
        statusIconKind: 'activity',
        detail: 'Kolam fallback: Kolam offline',
      }),
      expect.objectContaining({
        area: 'am',
        status: 'live',
        tone: 'success',
        statusIconKind: 'check',
        detail: 'AM live: dashboard tersedia.',
      }),
    ]);
  });

  it('summarizes and limits sync activity history', () => {
    const first = appendSyncActivity([], seedUnifiedDataset, 'seed');
    const second = appendSyncActivity(first, {
      ...seedUnifiedDataset,
      sync: {pos: 'live', kolam: 'disabled', am: 'disabled'},
    }, 'next', 4);

    expect(second).toHaveLength(4);
    expect(second[0]).toEqual(
      expect.objectContaining({area: 'pos', status: 'live'}),
    );
    expect(getSyncActivitySummary(second)).toEqual({
      total: 4,
      cache: 0,
      live: 1,
      fallback: 0,
      disabled: 2,
      seed: 1,
    });
  });

  it('maps sync source states to native badge icon kinds', () => {
    expect(getSyncStatusIconKind('cache')).toBe('check');
    expect(getSyncStatusIconKind('live')).toBe('check');
    expect(getSyncStatusIconKind('fallback')).toBe('activity');
    expect(getSyncStatusIconKind('disabled')).toBe('clock');
    expect(getSyncStatusIconKind('seed')).toBe('seed');
  });
});
