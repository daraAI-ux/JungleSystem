import React from 'react';
import { useKolamCrossSyncObservabilityController } from '../hooks/use-kolam-cross-sync-observability-controller';
import { KolamStockCrossSyncObservabilityPanel } from './kolam-stock-cross-sync-observability-panel';

/**
 * Owns observability poll state so updates re-render only this panel,
 * not the stock-transaction list FlatList / filter controls.
 */
export function KolamStockCrossSyncObservabilityHost({
  enabled = true,
  intervalMs = 60_000,
  onRouteChange,
}: {
  enabled?: boolean;
  intervalMs?: number;
  onRouteChange?: (route: string) => void;
} = {}) {
  const state = useKolamCrossSyncObservabilityController({
    enabled,
    intervalMs,
  });

  return (
    <KolamStockCrossSyncObservabilityPanel
      errorMessage={state.errorMessage}
      fetching={state.fetching}
      loading={state.loading}
      onRefresh={state.onRefresh}
      onRouteChange={onRouteChange}
      report={state.report}
    />
  );
}
