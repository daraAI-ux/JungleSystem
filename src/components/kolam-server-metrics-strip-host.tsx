import React from 'react';
import {useKolamServerMetricsController} from '../hooks/use-kolam-server-metrics-controller';
import {KolamServerMetricsStrip} from './kolam-server-metrics-strip';

/**
 * Owns server-metrics poll state so updates re-render only this strip,
 * not App / workspace / catalog surfaces.
 */
export function KolamServerMetricsStripHost({
  enabled = true,
  intervalMs,
}: {
  enabled?: boolean;
  intervalMs?: number;
} = {}) {
  const metrics = useKolamServerMetricsController({
    enabled,
    intervalMs,
  });

  return <KolamServerMetricsStrip {...metrics} />;
}
