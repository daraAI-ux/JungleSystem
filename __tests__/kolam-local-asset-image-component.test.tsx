import React from 'react';
import { Image } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamLocalAssetImage } from '../src/components/kolam-local-asset-image';
import {
  getMemoryKolamImageDiskBackend,
  resetKolamImageDiskBackend,
  setKolamImageDiskBackend,
} from '../src/services/kolam-image-disk-backend';
import { syncKolamLocalAsset } from '../src/services/kolam-local-asset-store';
import {
  MemoryLocalDataStore,
  resetLocalDataStore,
  setLocalDataStore,
} from '../src/services/local-data-store';

describe('KolamLocalAssetImage', () => {
  beforeEach(() => {
    setLocalDataStore(new MemoryLocalDataStore());
    resetKolamImageDiskBackend();
    setKolamImageDiskBackend(getMemoryKolamImageDiskBackend());
  });

  afterEach(() => {
    resetLocalDataStore();
    resetKolamImageDiskBackend();
  });

  it('renders the disk-cached local URI after sync', async () => {
    const bytes = Uint8Array.from([0, 0, 0]);
    const fetcher = jest.fn(async () => {
      return {
        ok: true,
        status: 200,
        headers: {
          get(name: string) {
            return name.toLowerCase() === 'content-type' ? 'image/png' : null;
          },
        },
        async blob() {
          return {
            size: bytes.byteLength,
            type: 'image/png',
            async arrayBuffer() {
              return bytes.buffer.slice(
                bytes.byteOffset,
                bytes.byteOffset + bytes.byteLength,
              );
            },
          };
        },
      };
    });

    await syncKolamLocalAsset({
      fetcher: fetcher as unknown as typeof fetch,
      revision: 'logo:v1',
      scope: 'brand-logo',
      sourceUri: 'https://cdn/logo.png',
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
      await Promise.resolve();
    });

    expect(renderer!.root.findByType(Image).props.source.uri).toEqual(
      expect.stringMatching(/^data:image\/png;base64,/),
    );
  });

  it('stays empty when the backend URI is missing', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamLocalAssetImage
          accessibilityLabel="Brand logo"
          revision="logo:v1"
          scope="brand-logo"
          sourceUri={null}
          style={{ height: 40, width: 132 }}
        />,
      );
    });

    expect(renderer!.root.findAllByType(Image)).toHaveLength(0);
  });
});
