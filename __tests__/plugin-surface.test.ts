import {
  getPluginRoutePreviewLabel,
  getPluginSurfaceRowVisualContract,
  getPluginSurfaceSummaryCards,
} from '../src/domain/plugin-surface';
import {
  getPluginIntegrationStats,
  getPluginRouteIndex,
  pluginRegistry,
} from '../src/domain/unified';

describe('getPluginSurfaceSummaryCards', () => {
  it('builds Kolam-style metric cards for Plugin Hub readiness', () => {
    const cards = getPluginSurfaceSummaryCards(
      getPluginIntegrationStats(pluginRegistry),
    );
    const sourceComponent =
      'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\card.tsx';

    expect(cards.map(card => card.id)).toEqual([
      'total',
      'ready',
      'mismatch',
      'routes',
    ]);
    expect(cards.map(card => card.iconKind)).toEqual([
      'plugin',
      'check',
      'warning',
      'route',
    ]);
    expect(cards.map(card => card.sourceComponent)).toEqual(
      Array(4).fill(sourceComponent),
    );
    expect(cards.find(card => card.id === 'mismatch')).toMatchObject({
      value: '1',
      tone: 'warning',
      iconKind: 'warning',
    });
    expect(cards.find(card => card.id === 'routes')?.tone).toBe('info');
  });

  it('marks mismatch healthy when every plugin version matches', () => {
    const cards = getPluginSurfaceSummaryCards({
      total: 2,
      ready: 2,
      versionMismatch: 0,
      routeCount: 5,
    });

    expect(cards.find(card => card.id === 'mismatch')).toMatchObject({
      value: '0',
      tone: 'success',
    });
  });

  it('formats the plugin route preview outside the component layer', () => {
    const routeIndex = getPluginRouteIndex(pluginRegistry);

    expect(getPluginRoutePreviewLabel(routeIndex, 2)).toBe(
      'Bantuan:/bantuan  Bantuan:/bantuan/:slug',
    );
    expect(getPluginRoutePreviewLabel(routeIndex).split('  ')).toHaveLength(6);
  });

  it('keeps table-style metadata chrome for plugin package entry rows', () => {
    expect(getPluginSurfaceRowVisualContract()).toEqual({
      packageEntrySeparatorIconKind: 'arrow-right',
      metadataSourceComponent:
        'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\table.tsx',
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
    });
  });
});
