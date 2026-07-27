import React from 'react';
import { Image } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamRemoteImage } from '../src/components/kolam-remote-image';
import { syncKolamImageCache } from '../src/services/kolam-image-local-cache';

jest.mock('../src/services/kolam-image-local-cache', () => ({
  getRenderableKolamImageUri: (
    asset: { localUri?: string; dataUri?: string } | null,
  ) => asset?.localUri || asset?.dataUri || null,
  syncKolamImageCache: jest.fn(),
}));

describe('KolamRemoteImage', () => {
  beforeEach(() => {
    (syncKolamImageCache as jest.Mock).mockReset();
  });

  it('falls back to the remote URL while disk cache is still empty', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    (syncKolamImageCache as jest.Mock).mockResolvedValueOnce(null);

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamRemoteImage
          accessibilityLabel="Brand logo"
          sourceUri="https://cdn/logo.png"
          style={{ height: 24, width: 64 }}
        />,
      );
    });

    expect(renderer!.root.findByType(Image).props.source).toEqual({
      uri: 'https://cdn/logo.png',
    });
    expect(syncKolamImageCache).toHaveBeenCalledWith({
      revision: 'https://cdn/logo.png',
      scope: 'general',
      sourceUri: 'https://cdn/logo.png',
    });
  });

  it('prefers the cached local URI once disk sync resolves', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    (syncKolamImageCache as jest.Mock).mockResolvedValueOnce({
      sourceUri: 'https://cdn/logo.png',
      revision: 'https://cdn/logo.png',
      localPath: 'general-h1.png',
      localUri: 'file:///C:/cache/kolam-images/general-h1.png',
      mimeType: 'image/png',
      updatedAt: '2026-07-19T00:00:00.000Z',
    });

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamRemoteImage
          accessibilityLabel="Brand logo"
          sourceUri="https://cdn/logo.png"
          style={{ height: 24, width: 64 }}
        />,
      );
    });

    expect(renderer!.root.findByType(Image).props.source).toEqual({
      uri: 'file:///C:/cache/kolam-images/general-h1.png',
    });
    expect(syncKolamImageCache).toHaveBeenCalledWith({
      revision: 'https://cdn/logo.png',
      scope: 'general',
      sourceUri: 'https://cdn/logo.png',
    });
  });

  it('renders inline image data without syncing remote cache', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamRemoteImage
          accessibilityLabel="Inline flag"
          sourceUri="data:image/svg+xml;utf8,%3Csvg%2F%3E"
          style={{ height: 20, width: 28 }}
        />,
      );
    });

    expect(renderer!.root.findByType(Image).props.source).toEqual({
      uri: 'data:image/svg+xml;utf8,%3Csvg%2F%3E',
    });
    expect(syncKolamImageCache).not.toHaveBeenCalled();
  });

  it('can hide remote fallback until a local cache entry exists', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    let resolveSync: (value: null) => void = () => undefined;
    (syncKolamImageCache as jest.Mock).mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveSync = resolve;
        }),
    );

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamRemoteImage
          accessibilityLabel="Brand logo"
          allowRemoteFallback={false}
          sourceUri="https://cdn/logo.png"
          style={{ height: 24, width: 64 }}
        />,
      );
    });

    expect(renderer!.root.findAllByType(Image)).toHaveLength(0);

    await ReactTestRenderer.act(async () => {
      resolveSync(null);
    });

    expect(renderer!.root.findAllByType(Image)).toHaveLength(0);
  });
});
