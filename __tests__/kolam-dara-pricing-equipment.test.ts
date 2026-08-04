import {
  buildKolamDaraPricingEquipmentConsoleLines,
  formatKolamDaraPricingEquipmentIdr,
  getKolamDaraPricingEquipmentProgressPercent,
  isKolamDaraPricingEquipmentJobActive,
  normalizeKolamDaraPricingEquipmentJobPoll,
  normalizeKolamDaraPricingEquipmentPreview,
  normalizeKolamDaraPricingEquipmentStartResult,
} from '../src/domain/kolam-dara-pricing-equipment';

describe('kolam-dara-pricing-equipment domain', () => {
  it('normalizes preview rows and start jobId', () => {
    const preview = normalizeKolamDaraPricingEquipmentPreview({
      data: {
        operation: 'kolam',
        marketplaceMode: 'markup_online',
        total: 3,
        applicable: 2,
        skipped: 1,
        rows: [
          {
            entityId: 'p1',
            sku: 'SKU-1',
            name: 'Pompa',
            baseCost: 10000,
            oldPrice: 12000,
            newPrice: 13800,
            vendorName: 'Vendor A',
            poCode: 'PO-1',
            skip: false,
          },
          {
            entityId: 'p2',
            sku: 'SKU-2',
            name: 'Skip',
            skip: true,
            skipReason: 'no cost',
          },
        ],
      },
    });
    expect(preview.applicable).toBe(2);
    expect(preview.rows[0]).toMatchObject({
      sku: 'SKU-1',
      newPrice: 13800,
      vendorName: 'Vendor A',
    });
    expect(preview.rows[1].skip).toBe(true);

    expect(
      normalizeKolamDaraPricingEquipmentStartResult({
        data: {jobId: 'job-abc'},
      }),
    ).toEqual({jobId: 'job-abc'});
  });

  it('builds console lines and progress from job poll', () => {
    const job = normalizeKolamDaraPricingEquipmentJobPoll({
      data: {
        _id: 'job-1',
        status: 'running',
        progress: {current: 2, total: 10, message: 'Memproses SKU-1'},
        result: {
          logs: [
            {ts: '2026-01-01', level: 'info', message: 'mulai'},
            {level: 'warn', message: 'lewati'},
          ],
        },
      },
    });
    expect(job).not.toBeNull();
    expect(isKolamDaraPricingEquipmentJobActive(job!.status)).toBe(true);
    expect(getKolamDaraPricingEquipmentProgressPercent(job)).toBe(20);
    expect(buildKolamDaraPricingEquipmentConsoleLines(job)).toEqual([
      '[progress] Memproses SKU-1',
      '[info] mulai',
      '[warn] lewati',
    ]);
    expect(formatKolamDaraPricingEquipmentIdr(15000)).toContain('15');
    expect(formatKolamDaraPricingEquipmentIdr(0)).toBe('—');
  });
});
