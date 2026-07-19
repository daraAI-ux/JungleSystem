import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  KolamAmOperationalPanel,
  KolamOperationalPanel,
  KolamSurfaceContractList,
} from '../src/components/kolam-unified-operational-widgets';
import {kolamSurfaces} from '../src/domain/unified';
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

describe('unified operational widgets', () => {
  it('renders surface contracts and operational panels directly', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamSurfaceContractList surfaces={kolamSurfaces} />
          <KolamOperationalPanel dataset={seedUnifiedDataset} />
          <KolamAmOperationalPanel dataset={seedUnifiedDataset} />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Surface', 'Finance', 'Dashboard AM belum live']),
    );
  });
});
