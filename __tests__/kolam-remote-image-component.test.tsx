import React from 'react';
import { Image } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamRemoteImage } from '../src/components/kolam-remote-image';
import { syncKolamImageCache } from '../src/services/kolam-image-local-cache';

jest.mock('../src/services/kolam-image-local-cache', () => ({
  syncKolamImageCache: jest.fn(),
}));

describe('KolamRemoteImage', () => {
  beforeEach(() => {
    (syncKolamImageCache as jest.Mock).mockReset();
  });

  it('does not render the remote image URL while local storage is still empty', async () => {
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

    expect(renderer!.root.findAllByType(Image)).toHaveLength(0);
    expect(syncKolamImageCache).toHaveBeenCalledWith({
      revision: 'https://cdn/logo.png',
      scope: 'general',
      sourceUri: 'https://cdn/logo.png',
    });
  });

  it('renders the cached data URI instead of the remote image URL', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    (syncKolamImageCache as jest.Mock).mockResolvedValueOnce({
      sourceUri: 'https://cdn/logo.png',
      revision: 'https://cdn/logo.png',
      dataUri: 'data:image/png;base64,AAA',
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
      uri: 'data:image/png;base64,AAA',
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
});
