import {getAccessScope, type AccessScope} from '../domain/auth';
import type {AuthSession, SignedInUser} from '../services/auth-api';
import {
  getUnifiedSyncMessage,
  type KolamDashboardRange,
  type UnifiedDataset,
} from '../services/unified-data';
import type {RefreshUnifiedDatasetInput} from './use-kolam-unified-data-controller';

export function useKolamSessionSyncController({
  authUser,
  onMessage,
  onReconcileDataset,
  onRefreshUnifiedDataset,
  onSignIn,
  onSignOut,
}: {
  authUser: SignedInUser | null;
  onMessage: (message: string) => void;
  onReconcileDataset: (dataset: UnifiedDataset) => void;
  onRefreshUnifiedDataset: (
    input: RefreshUnifiedDatasetInput,
  ) => Promise<UnifiedDataset>;
  onSignIn: () => Promise<AuthSession | null>;
  onSignOut: () => Promise<void>;
}) {
  const refreshDataset = async (
    preferLiveApi: boolean,
    enabledAreas: AccessScope = getAccessScope(authUser),
    kolamDashboardRange?: KolamDashboardRange,
  ) => {
    const nextDataset = await onRefreshUnifiedDataset({
      cacheOwnerId: preferLiveApi ? getCacheOwnerId(authUser) : undefined,
      preferLiveApi,
      enabledAreas,
      kolamDashboardRange,
    });
    onReconcileDataset(nextDataset);
    onMessage(getUnifiedSyncMessage(nextDataset));
  };

  const handleSignIn = async () => {
    const session = await onSignIn();
    if (session) {
      const nextDataset = await onRefreshUnifiedDataset({
        cacheOwnerId: getCacheOwnerId(session.user),
        preferLiveApi: true,
        enabledAreas: getAccessScope(session.user),
      });
      onReconcileDataset(nextDataset);
      onMessage(getUnifiedSyncMessage(nextDataset));
    }
  };

  const handleSignOut = async () => {
    await onSignOut();
    await refreshDataset(false, getAccessScope(null));
  };

  return {
    handleSignIn,
    handleSignOut,
    refreshDataset,
  };
}

function getCacheOwnerId(user: SignedInUser | null) {
  return user?.id ?? user?.email;
}
