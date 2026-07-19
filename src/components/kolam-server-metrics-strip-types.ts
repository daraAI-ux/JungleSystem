import type {ServerMetricsSnapshot} from '../domain/server-metrics';

export interface KolamServerMetricsStripProps {
  errorMessage?: string;
  loading?: boolean;
  snapshot?: ServerMetricsSnapshot | null;
}
