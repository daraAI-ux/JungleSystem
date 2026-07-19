export interface ServerMetricsSnapshot {
  checkedAt: string;
  hostname?: string;
  cpuPercent: number | null;
  memoryPercent: number | null;
  diskPercent: number | null;
}

export interface ServerMetricDisplayItem {
  id: 'cpu' | 'memory' | 'disk';
  label: string;
  value: number | null;
}

export function getServerMetricDisplayItems(
  snapshot?: ServerMetricsSnapshot | null,
): ServerMetricDisplayItem[] {
  return [
    {id: 'cpu', label: 'CPU', value: snapshot?.cpuPercent ?? null},
    {id: 'memory', label: 'RAM', value: snapshot?.memoryPercent ?? null},
    {id: 'disk', label: 'Disk', value: snapshot?.diskPercent ?? null},
  ];
}

export function formatServerMetricPercent(value: number | null): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '--';
  }

  return `${Math.round(value)}%`;
}
