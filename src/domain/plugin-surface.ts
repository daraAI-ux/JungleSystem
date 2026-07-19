import type {PluginIntegrationStats, PluginRouteEntry} from './unified';

export type PluginSurfaceSummaryIconKind =
  | 'plugin'
  | 'check'
  | 'warning'
  | 'route';

export interface PluginSurfaceSummaryCard {
  id: 'total' | 'ready' | 'mismatch' | 'routes';
  label: string;
  value: string;
  tone: 'default' | 'success' | 'warning' | 'info';
  iconKind: PluginSurfaceSummaryIconKind;
  sourceComponent: string;
}

export interface PluginSurfaceRowVisualContract {
  packageEntrySeparatorIconKind: 'arrow-right';
  metadataSourceComponent: string;
  summaryCard: {
    background: 'bg';
    iconUsesSoftTone: true;
    cardSpacing: number;
  };
  tableWrapper: {
    card: true;
    overflowHidden: true;
    headerBackground: 'secondary/50';
    rowBorderBottom: true;
    cellPaddingX: number;
    rowMinHeight: number;
  };
}

const pluginSummarySourceComponent =
  'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\card.tsx';
const pluginRowMetadataSourceComponent =
  'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\table.tsx';

export function getPluginSurfaceSummaryCards(
  stats: PluginIntegrationStats,
): PluginSurfaceSummaryCard[] {
  return [
    {
      id: 'total',
      label: 'Plugin',
      value: `${stats.total}`,
      tone: 'default',
      iconKind: 'plugin',
      sourceComponent: pluginSummarySourceComponent,
    },
    {
      id: 'ready',
      label: 'Ready',
      value: `${stats.ready}`,
      tone: 'success',
      iconKind: 'check',
      sourceComponent: pluginSummarySourceComponent,
    },
    {
      id: 'mismatch',
      label: 'Mismatch',
      value: `${stats.versionMismatch}`,
      tone: stats.versionMismatch > 0 ? 'warning' : 'success',
      iconKind: 'warning',
      sourceComponent: pluginSummarySourceComponent,
    },
    {
      id: 'routes',
      label: 'Route Host',
      value: `${stats.routeCount}`,
      tone: 'info',
      iconKind: 'route',
      sourceComponent: pluginSummarySourceComponent,
    },
  ];
}

export function getPluginRoutePreviewLabel(
  routeIndex: PluginRouteEntry[],
  limit = 6,
): string {
  return routeIndex
    .slice(0, limit)
    .map(entry => `${entry.pluginLabel}:${entry.route}`)
    .join('  ');
}

export function getPluginSurfaceRowVisualContract(): PluginSurfaceRowVisualContract {
  return {
    packageEntrySeparatorIconKind: 'arrow-right',
    metadataSourceComponent: pluginRowMetadataSourceComponent,
    summaryCard: {
      background: 'bg',
      iconUsesSoftTone: true,
      cardSpacing: 12,
    },
    tableWrapper: {
      card: true,
      overflowHidden: true,
      headerBackground: 'secondary/50',
      rowBorderBottom: true,
      cellPaddingX: 20,
      rowMinHeight: 52,
    },
  };
}
