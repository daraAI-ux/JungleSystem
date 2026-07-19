import type {Dispatch, SetStateAction} from 'react';
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
  return useKolamRuntimeController({
    auth: {
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
    },
    runtimeIdentity: {
      items: runtimeIdentityItems,
      meta: runtimeIdentityMeta,
    },
    syncStatus: {
      message: getUnifiedSyncMessage(dataset),
      loading: isLoadingDataset,
      errorMessage: dataset.errorMessage,
    },
    syncActivity,
    readiness: {
      checks: readinessChecks,
      summaryText: readinessSummaryText,
    },
    runtimeActions: {
      moduleId: activeModule,
      accessScope,
      onAction: onRuntimeAction,
    },
    commandIndex: {
      commands,
      coverageCommands,
      totalCount: commandTotalCount,
      search: commandSearch,
      onSearchChange: setCommandSearch,
      onSelect: onCommandSelect,
    },
  });
}
