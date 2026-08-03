import {
  filterKolamDaraJobs,
  formatKolamDaraJobModuleLabel,
  getKolamDaraJobProgressPercent,
  isKolamDaraJobActive,
  labelForKolamDaraJobType,
  normalizeKolamDaraJob,
  normalizeKolamDaraJobList,
} from '../src/domain/kolam-pusat-ai-jobs';

describe('kolam-pusat-ai-jobs domain', () => {
  it('normalizes job list envelope and labels', () => {
    const jobs = normalizeKolamDaraJobList({
      success: true,
      data: {
        jobs: [
          {
            _id: 'j1',
            module: 'seo',
            jobType: 'seo.bulk_products',
            status: 'running',
            progress: {current: 2, total: 10, message: 'Memproses'},
            createdAt: '2026-08-03T00:00:00.000Z',
          },
        ],
      },
    });

    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({
      id: 'j1',
      module: 'seo',
      label: 'Audit bulk produk',
      progressCurrent: 2,
      progressTotal: 10,
      progressMessage: 'Memproses',
      status: 'running',
    });
    expect(labelForKolamDaraJobType('market.scan_bulk')).toBe(
      'Scan market intelligence',
    );
    expect(formatKolamDaraJobModuleLabel('market-intel')).toBe('Market');
    expect(formatKolamDaraJobModuleLabel('pricing')).toBe('Market');
    expect(formatKolamDaraJobModuleLabel('seo')).toBe('SEO');
  });

  it('computes progress and filters completed/failed client-side', () => {
    const running = normalizeKolamDaraJob({
      id: 'a',
      module: 'seo',
      jobType: 'seo.serp_monitor',
      status: 'running',
      progress: {current: 1, total: 4},
    })!;
    const done = normalizeKolamDaraJob({
      id: 'b',
      module: 'seo',
      jobType: 'seo.serp_monitor',
      status: 'completed',
      progress: {current: 4, total: 4},
    })!;
    const failed = normalizeKolamDaraJob({
      id: 'c',
      module: 'seo',
      jobType: 'seo.serp_monitor',
      status: 'failed',
    })!;

    expect(isKolamDaraJobActive(running)).toBe(true);
    expect(getKolamDaraJobProgressPercent(running)).toBe(25);
    expect(getKolamDaraJobProgressPercent(done)).toBe(100);
    expect(filterKolamDaraJobs([running, done, failed], 'completed')).toEqual([
      done,
    ]);
    expect(filterKolamDaraJobs([running, done, failed], 'failed')).toEqual([
      failed,
    ]);
  });
});
