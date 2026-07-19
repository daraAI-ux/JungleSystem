import {
  formatReadinessSummary,
  getNativeReadinessChecks,
  getReadinessSummary,
  getReadinessStatusIconKind,
} from '../src/domain/readiness';

describe('native readiness model', () => {
  it('tracks ready partial and blocked gates for the unified native app', () => {
    const checks = getNativeReadinessChecks();
    const summary = getReadinessSummary(checks);

    expect(checks.map(check => check.id)).toEqual([
      'shell-area-coverage',
      'runtime-action-coverage',
      'plugin-registry-sync',
      'live-api-contracts',
      'live-route-coverage',
      'secure-token-storage',
      'windows-native-toolchain',
    ]);
    expect(checks.find(check => check.id === 'plugin-registry-sync')).toEqual(
      expect.objectContaining({
        status: 'partial',
        statusIconKind: 'activity',
        evidence: 'npm run verify:registry',
      }),
    );
    expect(checks.find(check => check.id === 'secure-token-storage')).toEqual(
      expect.objectContaining({
        status: 'blocked',
        statusIconKind: 'clock',
        evidence: 'src/services/token-store.ts',
      }),
    );
    expect(checks.find(check => check.id === 'live-route-coverage')).toEqual(
      expect.objectContaining({
        status: 'ready',
        statusIconKind: 'check',
        evidence: 'npm run verify:live-routes',
      }),
    );
    expect(checks.find(check => check.id === 'windows-native-toolchain')).toEqual(
      expect.objectContaining({status: 'blocked'}),
    );
    expect(summary).toEqual({
      total: 7,
      ready: 4,
      partial: 1,
      blocked: 2,
      productionReady: false,
    });
    expect(formatReadinessSummary(summary)).toBe(
      '4/7 ready, 1 partial, 2 blocked',
    );
  });

  it('maps readiness status to native badge icon kinds', () => {
    expect(getReadinessStatusIconKind('ready')).toBe('check');
    expect(getReadinessStatusIconKind('partial')).toBe('activity');
    expect(getReadinessStatusIconKind('blocked')).toBe('clock');
    expect(
      getNativeReadinessChecks().every(check => Boolean(check.statusIconKind)),
    ).toBe(true);
  });

  it('can represent production-ready once external blockers are resolved and plugin versions align', () => {
    const checks = getNativeReadinessChecks({
      secureStorageReady: true,
      windowsToolchainReady: true,
    }).map(check =>
      check.id === 'plugin-registry-sync'
        ? {...check, status: 'ready' as const, detail: 'Plugin versions aligned.'}
        : check,
    );

    expect(getReadinessSummary(checks)).toEqual({
      total: 7,
      ready: 7,
      partial: 0,
      blocked: 0,
      productionReady: true,
    });
  });
});
