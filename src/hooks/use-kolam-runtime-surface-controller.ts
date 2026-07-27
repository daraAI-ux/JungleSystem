import type {Dispatch, SetStateAction} from 'react';
import {useMemo} from 'react';
import type {AppModule} from '../domain/app-shell';
import {authSources, type AccessScope, type AuthSource} from '../domain/auth';
import type {CommandEntry} from '../domain/command-index';
import type {ReadinessCheck} from '../domain/readiness';
import type {RuntimeIdentityItem} from '../domain/runtime-identity';
import type {RuntimeAction} from '../domain/runtime-actions';
import type {SyncActivityEntry} from '../domain/sync-activity';
import {
  getUnifiedSyncMessage,
  type UnifiedDataset,
} from '../services/unified-data';
import type {KolamRuntimeSurfaceProps} from '../components/kolam-runtime-surface';
import {useKolamRuntimeController} from './use-kolam-runtime-controller';

export function useKolamRuntimeSurfaceController({
  accessScope,
  activeModule,
  amApiBaseUrl,
  authEmail,
  authMessage,
  authPassword,
  authSource,
  authSourceHint,
  commandSearch,
  commandTotalCount,
  commands,
  coverageCommands,
  dataset,
  displayName,
  isLoadingDataset,
  isSigningIn,
  onCommandSelect,
  onRuntimeAction,
  onSignIn,
  onSignOut,
  onSync,
  readinessChecks,
  readinessSummaryText,
  runtimeIdentityItems,
  runtimeIdentityMeta,
  setAmApiBaseUrl,
  setAuthEmail,
  setAuthPassword,
  setAuthSource,
  setCommandSearch,
  syncActivity,
}: {
  accessScope: AccessScope;
  activeModule: AppModule;
  amApiBaseUrl: string;
  authEmail: string;
  authMessage: string;
  authPassword: string;
  authSource: AuthSource;
  authSourceHint: string;
  commandSearch: string;
  commandTotalCount: number;
  commands: CommandEntry[];
  coverageCommands?: CommandEntry[];
  dataset: UnifiedDataset;
  displayName: string;
  isLoadingDataset: boolean;
  isSigningIn: boolean;
  onCommandSelect: (command: CommandEntry) => Promise<void>;
  onRuntimeAction: (action: RuntimeAction) => Promise<void>;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onSync: () => Promise<void>;
  readinessChecks: ReadinessCheck[];
  readinessSummaryText: string;
  runtimeIdentityItems: RuntimeIdentityItem[];
  runtimeIdentityMeta: string;
  setAmApiBaseUrl: Dispatch<SetStateAction<string>>;
  setAuthEmail: Dispatch<SetStateAction<string>>;
  setAuthPassword: Dispatch<SetStateAction<string>>;
  setAuthSource: Dispatch<SetStateAction<AuthSource>>;
  setCommandSearch: Dispatch<SetStateAction<string>>;
  syncActivity: SyncActivityEntry[];
}) {
  const auth = useMemo<KolamRuntimeSurfaceProps['auth']>(
    () => ({
      accessScope,
      amApiBaseUrl,
      authEmail,
      authMessage,
      authPassword,
      authSource,
      authSourceHint,
      authSources,
      displayName,
      isSigningIn,
      onAmApiBaseUrlChange: setAmApiBaseUrl,
      onAuthEmailChange: setAuthEmail,
      onAuthPasswordChange: setAuthPassword,
      onAuthSourceChange: setAuthSource,
      onLogin: onSignIn,
      onLogout: onSignOut,
      onSync,
    }),
    [
      accessScope,
      amApiBaseUrl,
      authEmail,
      authMessage,
      authPassword,
      authSource,
      authSourceHint,
      displayName,
      isSigningIn,
      onSignIn,
      onSignOut,
      onSync,
      setAmApiBaseUrl,
      setAuthEmail,
      setAuthPassword,
      setAuthSource,
    ],
  );

  const runtimeIdentity = useMemo<KolamRuntimeSurfaceProps['runtimeIdentity']>(
    () => ({
      items: runtimeIdentityItems,
      meta: runtimeIdentityMeta,
    }),
    [runtimeIdentityItems, runtimeIdentityMeta],
  );

  const syncStatus = useMemo<KolamRuntimeSurfaceProps['syncStatus']>(
    () => ({
      message: getUnifiedSyncMessage(dataset),
      loading: isLoadingDataset,
      errorMessage: dataset.errorMessage,
    }),
    [dataset, isLoadingDataset],
  );

  const readiness = useMemo<KolamRuntimeSurfaceProps['readiness']>(
    () => ({
      checks: readinessChecks,
      summaryText: readinessSummaryText,
    }),
    [readinessChecks, readinessSummaryText],
  );

  const runtimeActions = useMemo<KolamRuntimeSurfaceProps['runtimeActions']>(
    () => ({
      moduleId: activeModule,
      accessScope,
      onAction: onRuntimeAction,
    }),
    [accessScope, activeModule, onRuntimeAction],
  );

  const commandIndex = useMemo<KolamRuntimeSurfaceProps['commandIndex']>(
    () => ({
      commands,
      coverageCommands,
      totalCount: commandTotalCount,
      search: commandSearch,
      onSearchChange: setCommandSearch,
      onSelect: onCommandSelect,
    }),
    [
      commandSearch,
      commandTotalCount,
      commands,
      coverageCommands,
      onCommandSelect,
      setCommandSearch,
    ],
  );

  return useKolamRuntimeController({
    auth,
    runtimeIdentity,
    syncStatus,
    syncActivity,
    readiness,
    runtimeActions,
    commandIndex,
  });
}
