import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamPreparationSurface} from '../src/components/kolam-preparation-surface';
import {seedUnifiedDataset} from '../src/services/unified-data';

function renderText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAllByType(Text)
    .flatMap(node => flattenText(node.props.children));
}

function flattenText(value: React.ReactNode): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenText);
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }

  return [];
}

describe('KolamPreparationSurface', () => {
  it('hosts launch source and runtime preparation outside Beranda', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamPreparationSurface dataset={seedUnifiedDataset} />
        </View>,
      );
    });

    const text = renderText(renderer!);

    expect(text).toEqual(
      expect.arrayContaining([
        'JungleSystem Launch Map',
        'Kolam Surface Launcher',
        'Source repo live',
        'Unified runtime',
      ]),
    );
  });
});
