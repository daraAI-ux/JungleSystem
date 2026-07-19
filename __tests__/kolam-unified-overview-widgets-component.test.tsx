import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamUnifiedOverviewPanel} from '../src/components/kolam-unified-overview-widgets';
import {getShellModule} from '../src/domain/app-shell';
import {pluginRegistry} from '../src/domain/unified';
import {seedUnifiedDataset} from '../src/services/unified-data';

function renderText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(Text).map(node => node.props.children);
}

describe('unified overview Kolam widgets', () => {
  it('renders Kolam Beranda overview in live FE order', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamUnifiedOverviewPanel
          module={getShellModule('kolam')}
          dataset={seedUnifiedDataset}
        />,
      );
    });

    const text = renderText(renderer!);

    expect(text).toEqual(
      expect.arrayContaining([
        'Omzet Hari ini',
        'Produk',
        'Stok Habis',
        'Ringkasan Penjualan',
        'Pesanan perlu ditindak lanjuti',
      ]),
    );
    expect(text).not.toContain('Kolam Surface Launcher');
    expect(text).not.toContain('Source repo live');
    expect(text).not.toContain('Unified runtime');
  });

  it('renders plugin registry summary from filtered plugin input', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamUnifiedOverviewPanel
            module={getShellModule('plugins')}
            dataset={seedUnifiedDataset}
            plugins={pluginRegistry.slice(0, 2)}
            pluginSearch="chat"
            onPluginSearchChange={() => undefined}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Plugin tersedia',
        'Plugin',
        'Capability / Source',
        'Unified runtime',
      ]),
    );
  });
});

