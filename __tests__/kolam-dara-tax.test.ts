import {
  formatKolamDaraTaxDateId,
  formatKolamDaraTaxIdr,
  normalizeKolamDaraTaxDashboard,
  normalizeKolamDaraTaxOverviewSeries,
} from '../src/domain/kolam-dara-tax';

describe('kolam-dara-tax domain', () => {
  it('normalizes dashboard overview, scores, risks, and deadlines', () => {
    const dashboard = normalizeKolamDaraTaxDashboard({
      data: {
        period: 'month',
        overview: {
          period: 'month',
          sales: {
            orderCount: 12,
            revenueIdr: 11_000_000,
            ppnOutput: {dpp: 10_000_000, ppn: 1_100_000, total: 11_100_000},
          },
          purchases: {
            ppnInput: {dpp: 1_000_000, ppn: 110_000, total: 1_110_000},
          },
          commissionPph21: {grossIdr: 500_000, withheldIdr: 25_000},
          netPpnEstimate: 990_000,
        },
        compliance: {
          scores: {overall: 82, vatCompliance: 90},
          highlights: ['Lengkapi NPWP supplier'],
        },
        risks: {
          count: 1,
          alerts: [
            {
              code: 'missing_faktur',
              title: 'Faktur belum lengkap',
              message: 'Ada sale tanpa nomor faktur',
              severity: 'high',
            },
          ],
        },
        deadlines: [
          {
            title: 'SPT Masa PPN',
            dueDate: '2026-08-31T00:00:00.000Z',
            taxType: 'PPN',
          },
        ],
        draftReports: [{_id: 'r1', title: 'Draft', status: 'draft'}],
        regulationDrafts: [
          {_id: 'd1', title: 'Reg', status: 'pending_review'},
          {_id: 'd2', title: 'Old', status: 'approved'},
        ],
      },
    });

    expect(dashboard.overview?.sales.orderCount).toBe(12);
    expect(dashboard.overview?.netPpnEstimate).toBe(990_000);
    expect(dashboard.complianceScores.overall).toBe(82);
    expect(dashboard.risks.count).toBe(1);
    expect(dashboard.risks.alerts[0]?.severity).toBe('high');
    expect(dashboard.deadlines[0]?.taxType).toBe('PPN');
    expect(dashboard.pendingRegulationDraftCount).toBe(1);
    expect(dashboard.draftReportCount).toBe(1);
    expect(formatKolamDaraTaxIdr(1100000)).toContain('1.100.000');
    expect(formatKolamDaraTaxDateId('2026-08-31T00:00:00.000Z')).not.toBe('—');
  });

  it('normalizes overview series rows', () => {
    const series = normalizeKolamDaraTaxOverviewSeries({
      data: {
        months: 6,
        ppnOutputByMonth: [
          {period: '2026-01', orderCount: 3, ppnIdr: 100},
          {period: '2026-02', orderCount: 4, ppnIdr: 200},
        ],
      },
    });
    expect(series.ppnOutputByMonth).toHaveLength(2);
    expect(series.ppnOutputByMonth[1]?.ppnIdr).toBe(200);
  });
});
