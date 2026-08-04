import {
  formatReadinessSummary,
  getNativeReadinessChecks,
  getReadinessSummary,
  getReadinessStatusIconKind,
} from '../src/domain/readiness';

describe('native readiness model', () => {
  it('tracks secure token storage as blocked by default', () => {
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
    expect(checks.find(check => check.id === 'secure-token-storage')).toEqual(
      expect.objectContaining({
        status: 'blocked',
        statusIconKind: 'clock',
        evidence: 'src/services/token-store.ts',
      }),
    );
    expect(checks.find(check => check.id === 'windows-native-toolchain')).toEqual(
      expect.objectContaining({status: 'blocked'}),
    );
    expect(summary.total).toBe(7);
    expect(summary.productionReady).toBe(false);
    expect(formatReadinessSummary(summary)).toMatch(/^\d+\/7 ready/);
  });

  it('maps readiness status to native badge icon kinds', () => {
    expect(getReadinessStatusIconKind('ready')).toBe('check');
    expect(getReadinessStatusIconKind('partial')).toBe('activity');
    expect(getReadinessStatusIconKind('blocked')).toBe('clock');
    expect(
      getNativeReadinessChecks().every(check => Boolean(check.statusIconKind)),
    ).toBe(true);
  });

  it('marks local-data auth persist as partial until Credential Manager is ready', () => {
    const checks = getNativeReadinessChecks({
      localDataAuthPersistReady: true,
    });
    expect(checks.find(check => check.id === 'secure-token-storage')).toEqual(
      expect.objectContaining({
        status: 'partial',
        statusIconKind: 'activity',
      }),
    );
  });

  it('can represent production-ready once external blockers are resolved and plugin versions align', () => {
    const checks = getNativeReadinessChecks({
      secureStorageReady: true,
      windowsToolchainReady: true,
    }).map(check =>
      check.status === 'ready'
        ? check
        : {...check, status: 'ready' as const, detail: 'Aligned for production gate.'},
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
