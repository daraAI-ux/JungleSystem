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
import type {
  KolamAuthLoginMode,
  KolamAuthOtpStep,
} from './use-kolam-auth-controller';
import type {StaffOtpLoginConfig} from '../services/auth-api';

export function useKolamRuntimeSurfaceController({
  accessScope,
  activeModule,
  amApiBaseUrl,
  authEmail,
  authLoginMode = 'password',
  authMessage,
  authOtpCode = '',
  authOtpConfig = null,
  authOtpStep = 'email',
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
  isRequestingOtp = false,
  isSigningIn,
  onCommandSelect,
  onRuntimeAction,
  onRequestOtp,
  onSignIn,
  onSignOut,
  onSync,
  onVerifyOtp,
  readinessChecks,
  readinessSummaryText,
  runtimeIdentityItems,
  runtimeIdentityMeta,
  setAmApiBaseUrl,
  setAuthEmail,
  setAuthLoginMode,
  setAuthOtpCode,
  setAuthOtpStep,
  setAuthPassword,
  setAuthSource,
  setCommandSearch,
  syncActivity,
}: {
  accessScope: AccessScope;
  activeModule: AppModule;
  amApiBaseUrl: string;
  authEmail: string;
  authLoginMode?: KolamAuthLoginMode;
  authMessage: string;
  authOtpCode?: string;
  authOtpConfig?: StaffOtpLoginConfig | null;
  authOtpStep?: KolamAuthOtpStep;
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
  isRequestingOtp?: boolean;
  isSigningIn: boolean;
  onCommandSelect: (command: CommandEntry) => Promise<void>;
  onRuntimeAction: (action: RuntimeAction) => Promise<void>;
  onRequestOtp?: () => Promise<void>;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onSync: () => Promise<void>;
  onVerifyOtp?: () => Promise<void>;
  readinessChecks: ReadinessCheck[];
  readinessSummaryText: string;
  runtimeIdentityItems: RuntimeIdentityItem[];
  runtimeIdentityMeta: string;
  setAmApiBaseUrl: Dispatch<SetStateAction<string>>;
  setAuthEmail: Dispatch<SetStateAction<string>>;
  setAuthLoginMode?: Dispatch<SetStateAction<KolamAuthLoginMode>>;
  setAuthOtpCode?: Dispatch<SetStateAction<string>>;
  setAuthOtpStep?: Dispatch<SetStateAction<KolamAuthOtpStep>>;
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
      authLoginMode,
      authMessage,
      authOtpCode,
      authOtpConfig,
      authOtpStep,
      authPassword,
      authSource,
      authSourceHint,
      authSources,
      displayName,
      isRequestingOtp,
      isSigningIn,
      onAmApiBaseUrlChange: setAmApiBaseUrl,
      onAuthEmailChange: setAuthEmail,
      onAuthLoginModeChange: setAuthLoginMode,
      onAuthOtpCodeChange: setAuthOtpCode,
      onAuthOtpStepChange: setAuthOtpStep,
      onAuthPasswordChange: setAuthPassword,
      onAuthSourceChange: setAuthSource,
      onLogin: onSignIn,
      onLogout: onSignOut,
      onRequestOtp,
      onSync,
      onVerifyOtp,
    }),
    [
      accessScope,
      amApiBaseUrl,
      authEmail,
      authLoginMode,
      authMessage,
      authOtpCode,
      authOtpConfig,
      authOtpStep,
      authPassword,
      authSource,
      authSourceHint,
      displayName,
      isRequestingOtp,
      isSigningIn,
      onRequestOtp,
      onSignIn,
      onSignOut,
      onSync,
      onVerifyOtp,
      setAmApiBaseUrl,
      setAuthEmail,
      setAuthLoginMode,
      setAuthOtpCode,
      setAuthOtpStep,
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
