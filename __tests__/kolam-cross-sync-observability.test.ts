import {
  formatCrossSyncObservabilityAge,
  normalizeKolamCrossSyncObservabilityReport,
} from '../src/domain/kolam-cross-sync-observability';

describe('Kolam cross-sync observability normalize', () => {
  it('normalizes healthy report payload', () => {
    const report = normalizeKolamCrossSyncObservabilityReport({
      success: true,
      data: {
        checkedAt: '2026-07-28T00:00:00.000Z',
        healthy: true,
        alertCount: 0,
        windowHours: 48,
        counts: {
          transactionsWithAudit: 12,
          kolamPendingTaskIds: 2,
          amInFlightStockSync: 1,
          summary: { ok: 10, pending: 2 },
        },
        coalesceGroups: [{ taskId: 't1', stockTxCount: 3, platform: 'shopee' }],
      },
    });

    expect(report.healthy).toBe(true);
    expect(report.counts.transactionsWithAudit).toBe(12);
    expect(report.coalesceGroups).toEqual([
      { taskId: 't1', stockTxCount: 3, platform: 'shopee' },
    ]);
    expect(report.doubleTaskAlerts).toEqual([]);
  });

  it('normalizes alert rows and age labels', () => {
    const report = normalizeKolamCrossSyncObservabilityReport({
      data: {
        healthy: false,
        alertCount: 2,
        doubleTaskAlerts: [
          {
            sku: 'SKU-1',
            platform: 'tokopedia',
            distinctTaskIds: ['a', 'b'],
            stockTxIds: ['tx-1', 'tx-2'],
          },
        ],
        stuckPending: [
          {
            sku: 'SKU-2',
            platform: 'shopee',
            taskId: 'task-9',
            stockTxId: 'tx-9',
            ageMs: 120000,
          },
        ],
      },
    });

    expect(report.alertCount).toBe(2);
    expect(report.doubleTaskAlerts[0]).toMatchObject({
      sku: 'SKU-1',
      stockTxId: 'tx-1',
      distinctTaskIds: ['a', 'b'],
    });
    expect(formatCrossSyncObservabilityAge(report.stuckPending[0]?.ageMs)).toBe(
      '2 mnt',
    );
  });
});
