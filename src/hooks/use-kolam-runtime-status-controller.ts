import {useMemo} from 'react';
import {getAttentionPanelItems} from '../domain/attention-panel';
import {
  formatReadinessSummary,
  getNativeReadinessChecks,
  getReadinessSummary,
} from '../domain/readiness';
import {
  getRuntimeIdentityItems,
  getRuntimeIdentitySummary,
  type RuntimeDeviceIdentityStatus,
} from '../domain/runtime-identity';
import type {UnifiedDataset} from '../services/unified-data';

export function useKolamRuntimeStatusController({
  dataset,
  deviceIdentityStatus = 'missing',
}: {
  dataset: UnifiedDataset;
  deviceIdentityStatus?: RuntimeDeviceIdentityStatus;
}) {
  const readinessChecks = useMemo(() => getNativeReadinessChecks(), []);
  const readinessSummary = useMemo(
    () => getReadinessSummary(readinessChecks),
    [readinessChecks],
  );
  const readinessSummaryText = useMemo(
    () => formatReadinessSummary(readinessSummary),
    [readinessSummary],
  );
  const runtimeIdentityItems = useMemo(
    () => getRuntimeIdentityItems({deviceIdentityStatus}),
    [deviceIdentityStatus],
  );
  const runtimeIdentitySummary = useMemo(
    () => getRuntimeIdentitySummary(runtimeIdentityItems),
    [runtimeIdentityItems],
  );
  const runtimeIdentityMeta = useMemo(
    () =>
      `${runtimeIdentitySummary.ready} ready - ${runtimeIdentitySummary.partial} partial`,
    [runtimeIdentitySummary],
  );
  const attentionItems = useMemo(
    () =>
      getAttentionPanelItems({
        checks: readinessChecks,
        sync: dataset.sync,
        errors: [
          {id: 'pos', label: 'POS API', message: dataset.errorMessage},
          {id: 'kolam', label: 'Kolam API', message: dataset.kolam.errorMessage},
          {id: 'am', label: 'AM API', message: dataset.am.errorMessage},
        ],
      }),
    [dataset, readinessChecks],
  );

  return {
    attentionItems,
    readinessChecks,
    readinessSummary,
    readinessSummaryText,
    runtimeIdentityItems,
    runtimeIdentityMeta,
    runtimeIdentitySummary,
  };
}
