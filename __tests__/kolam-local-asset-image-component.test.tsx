import React from 'react';
import { Image } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamLocalAssetImage } from '../src/components/kolam-local-asset-image';
import { writeKolamLocalAsset } from '../src/services/kolam-local-asset-store';
import {
  MemoryLocalDataStore,
  resetLocalDataStore,
  setLocalDataStore,
} from '../src/services/local-data-store';

describe('KolamLocalAssetImage', () => {
  beforeEach(() => {
    setLocalDataStore(new MemoryLocalDataStore());
  });

  afterEach(() => {
    resetLocalDataStore();
  });

  it('renders only asset data already stored in the local DB', async () => {
    await writeKolamLocalAsset('brand-logo', {
      dataUri: 'data:image/png;base64,AAA',
      mimeType: 'image/png',
      revision: 'logo:v1',
      scope: 'brand-logo',
      sourceUri: 'https://cdn/logo.png',
      updatedAt: '2026-07-19T00:00:00.000Z',
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamLocalAssetImage
          accessibilityLabel="Brand logo"
          revision="logo:v1"
          scope="brand-logo"
          sourceUri="https://cdn/logo.png"
          style={{ height: 40, width: 132 }}
        />,
      );
    });

    expect(renderer!.root.findByType(Image).props.source).toEqual({
      uri: 'data:image/png;base64,AAA',
    });
  });

  it('stays empty when the asset has not been synced locally', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamLocalAssetImage
          accessibilityLabel="Brand logo"
          revision="logo:v1"
          scope="brand-logo"
          sourceUri="https://cdn/logo.png"
          style={{ height: 40, width: 132 }}
        />,
      );
    });

    expect(renderer!.root.findAllByType(Image)).toHaveLength(0);
  });
});
