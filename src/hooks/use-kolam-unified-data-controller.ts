import {useCallback, useEffect, useState} from 'react';
import {appConfig} from '../config/app';
import {getAccessScope, type AccessScope} from '../domain/auth';
import {appendSyncActivity} from '../domain/sync-activity';
import {
  loadUnifiedDataset,
  seedUnifiedDataset,
  type KolamDashboardRange,
  type UnifiedDataset,
} from '../services/unified-data';
import {
  loadCachedUnifiedDataset,
  refreshUnifiedDatasetWithCache,
} from '../services/unified-local-cache';

export interface RefreshUnifiedDatasetInput {
  cacheOwnerId?: string;
  enabledAreas: AccessScope;
  kolamDashboardRange?: KolamDashboardRange;
  preferLiveApi: boolean;
}

export function useKolamUnifiedDataController() {
  const [dataset, setDataset] = useState<UnifiedDataset>(seedUnifiedDataset);
  const [syncActivity, setSyncActivity] = useState(() =>
    appendSyncActivity([], seedUnifiedDataset, 'seed'),
  );
  const [isLoadingDataset, setIsLoadingDataset] = useState(false);
  const [amApiBaseUrl, setAmApiBaseUrl] = useState(appConfig.amApiBaseUrl);
  const [kolamDashboardRange, setKolamDashboardRange] =
    useState<KolamDashboardRange>('month');

  useEffect(() => {
    let isMounted = true;

    setIsLoadingDataset(true);
    loadUnifiedDataset({enabledAreas: getAccessScope(null)})
      .then(nextDataset => {
        if (isMounted) {
          setDataset(nextDataset);
          setSyncActivity(current => appendSyncActivity(current, nextDataset));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingDataset(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshUnifiedDataset = useCallback(
    async ({
      cacheOwnerId,
      enabledAreas,
      kolamDashboardRange: inputKolamDashboardRange,
      preferLiveApi,
    }: RefreshUnifiedDatasetInput) => {
      const nextRange = inputKolamDashboardRange ?? kolamDashboardRange;
      setIsLoadingDataset(true);

      const cachedDataset = await loadCachedUnifiedDataset({
        cacheOwnerId,
        kolamDashboardRange: nextRange,
      });

      if (cachedDataset) {
        setDataset(cachedDataset);
        setSyncActivity(current =>
          appendSyncActivity(current, cachedDataset, 'cache'),
        );
      }

      const nextDataset = cacheOwnerId
        ? (
            await refreshUnifiedDatasetWithCache({
              cacheOwnerId,
              preferLiveApi,
              amApiBaseUrl,
              enabledAreas,
              kolamDashboardRange: nextRange,
            })
          ).dataset
        : await loadUnifiedDataset({
            preferLiveApi,
            amApiBaseUrl,
            enabledAreas,
            kolamDashboardRange: nextRange,
          });

      setKolamDashboardRange(nextRange);
      setDataset(nextDataset);
      setSyncActivity(current => appendSyncActivity(current, nextDataset));
      setIsLoadingDataset(false);

      return nextDataset;
    },
    [amApiBaseUrl, kolamDashboardRange],
  );

  return {
    amApiBaseUrl,
    dataset,
    isLoadingDataset,
    kolamDashboardRange,
    refreshUnifiedDataset,
    setAmApiBaseUrl,
    setDataset,
    setKolamDashboardRange,
    syncActivity,
  };
}
