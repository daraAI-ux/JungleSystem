import {shellModules, type AppArea} from './app-shell';
import {getPluginIntegrationStats, pluginRegistry} from './unified';
import {getRuntimeActionsByModule, runtimeActions} from './runtime-actions';
import {
  getKolamNavigationRouteVariants,
  kolamNavigationSections,
} from './kolam-navigation';

export type ReadinessArea = AppArea | 'platform' | 'security';
export type ReadinessStatus = 'ready' | 'partial' | 'blocked';
export type ReadinessStatusIconKind = 'check' | 'activity' | 'clock';

export interface ReadinessCheck {
  id: string;
  area: ReadinessArea;
  label: string;
  status: ReadinessStatus;
  statusIconKind: ReadinessStatusIconKind;
  detail: string;
  evidence: string;
}

export interface NativeReadinessOptions {
  secureStorageReady?: boolean;
  windowsToolchainReady?: boolean;
}

export interface ReadinessSummary {
  total: number;
  ready: number;
  partial: number;
  blocked: number;
  productionReady: boolean;
}

export function getNativeReadinessChecks(
  options: NativeReadinessOptions = {},
): ReadinessCheck[] {
  const areas = new Set(shellModules.map(module => module.area));
  const missingActionModules = shellModules.filter(
    module => getRuntimeActionsByModule(module.id).length === 0,
  );
  const pluginStats = getPluginIntegrationStats(pluginRegistry);
  const liveApiActions = runtimeActions.filter(
    action => action.status === 'live-api',
  );
  const nativeRouteCount =
    kolamNavigationSections.flatMap(section => section.items).length +
    getKolamNavigationRouteVariants(kolamNavigationSections).length;

  const checks: Array<Omit<ReadinessCheck, 'statusIconKind'>> = [
    {
      id: 'shell-area-coverage',
      area: 'platform',
      label: 'Shell area coverage',
      status:
        areas.has('kolam') &&
        areas.has('pos') &&
        areas.has('am') &&
        areas.has('plugins')
          ? 'ready'
          : 'blocked',
      detail: `${areas.size} area shell terdaftar: ${Array.from(areas).join(', ')}.`,
      evidence: 'src/domain/app-shell.ts',
    },
    {
      id: 'runtime-action-coverage',
      area: 'platform',
      label: 'Runtime action coverage',
      status: missingActionModules.length ? 'blocked' : 'ready',
      detail: missingActionModules.length
        ? `Module tanpa action: ${missingActionModules
            .map(module => module.id)
            .join(', ')}.`
        : `${shellModules.length} module shell punya minimal satu action runtime.`,
      evidence: 'src/domain/runtime-actions.ts',
    },
    {
      id: 'plugin-registry-sync',
      area: 'plugins',
      label: 'Plugin registry sync',
      status: pluginStats.versionMismatch ? 'partial' : 'ready',
      detail: `${pluginStats.total} plugin, ${pluginStats.routeCount} route, ${pluginStats.versionMismatch} version mismatch.`,
      evidence: 'npm run verify:registry',
    },
    {
      id: 'live-api-contracts',
      area: 'platform',
      label: 'Live API contracts',
      status: liveApiActions.length >= 7 ? 'ready' : 'partial',
      detail: `${liveApiActions.length} action live API dipetakan untuk Kolam, POS, dan AM.`,
      evidence: 'src/domain/runtime-actions.ts',
    },
    {
      id: 'live-route-coverage',
      area: 'kolam',
      label: 'Live route coverage',
      status: nativeRouteCount >= 257 ? 'ready' : 'partial',
      detail: `${nativeRouteCount} route Kolam native terdaftar untuk mencakup FE live.`,
      evidence: 'npm run verify:live-routes',
    },
    {
      id: 'secure-token-storage',
      area: 'security',
      label: 'Secure token storage',
      status: options.secureStorageReady ? 'ready' : 'blocked',
      detail: options.secureStorageReady
        ? 'Token siap disimpan lewat secure storage native.'
        : 'Token masih runtime memory; auto-login produksi belum aman.',
      evidence: 'src/services/token-store.ts',
    },
    {
      id: 'windows-native-toolchain',
      area: 'platform',
      label: 'Windows native toolchain',
      status: options.windowsToolchainReady ? 'ready' : 'blocked',
      detail: options.windowsToolchainReady
        ? 'Toolchain native siap untuk npm run windows.'
        : 'PowerShell 7, .NET SDK, dan Visual Studio/vswhere masih wajib dilengkapi.',
      evidence: 'npm run doctor:windows',
    },
  ];

  return checks.map(check => ({
    ...check,
    statusIconKind: getReadinessStatusIconKind(check.status),
  }));
}

export function getReadinessStatusIconKind(
  status: ReadinessStatus,
): ReadinessStatusIconKind {
  if (status === 'ready') {
    return 'check';
  }

  if (status === 'partial') {
    return 'activity';
  }

  return 'clock';
}

export function getReadinessSummary(
  checks: ReadinessCheck[],
): ReadinessSummary {
  const ready = checks.filter(check => check.status === 'ready').length;
  const partial = checks.filter(check => check.status === 'partial').length;
  const blocked = checks.filter(check => check.status === 'blocked').length;

  return {
    total: checks.length,
    ready,
    partial,
    blocked,
    productionReady: blocked === 0 && partial === 0,
  };
}

export function formatReadinessSummary(summary: ReadinessSummary): string {
  return `${summary.ready}/${summary.total} ready, ${summary.partial} partial, ${summary.blocked} blocked`;
}
