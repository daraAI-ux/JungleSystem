import {useMemo} from 'react';
import type {KolamRuntimeSurfaceProps} from '../components/kolam-runtime-surface';

type RuntimeProps = KolamRuntimeSurfaceProps;

export function useKolamRuntimeController({
  auth,
  commandIndex,
  readiness,
  runtimeActions,
  runtimeIdentity,
  syncActivity,
  syncStatus,
}: RuntimeProps) {
  const runtime = useMemo<RuntimeProps>(
    () => ({
      auth,
      commandIndex,
      readiness,
      runtimeActions,
      runtimeIdentity,
      syncActivity,
      syncStatus,
    }),
    [
      auth,
      commandIndex,
      readiness,
      runtimeActions,
      runtimeIdentity,
      syncActivity,
      syncStatus,
    ],
  );

  return {runtime};
}
