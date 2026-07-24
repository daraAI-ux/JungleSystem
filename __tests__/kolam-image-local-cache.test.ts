import {
  readKolamImageCache,
  syncKolamImageCache,
  syncKolamImageCacheBatch,
  writeKolamImageCache,
} from '../src/services/kolam-image-local-cache';
import { createKolamLocalAssetRequestHeaders } from '../src/services/kolam-local-asset-store';
import {
  clearNativeDeviceIdentity,
  setAccessToken,
  setNativeDeviceIdentity,
} from '../src/lib/api-client';
import {
  MemoryLocalDataStore,
  resetLocalDataStore,
  setLocalDataStore,
} from '../src/services/local-data-store';

describe('Kolam image local cache', () => {
  beforeEach(() => {
    setLocalDataStore(new MemoryLocalDataStore());
  });

  afterEach(() => {
    resetLocalDataStore();
    setAccessToken(undefined);
    clearNativeDeviceIdentity();
  });

  it('does not store image data URI in SQLite because media renders from backend URI', async () => {
    const image = {
      sourceUri: 'https://cdn/logo.png',
      revision: 'brand-1:v1',
      dataUri: 'data:image/png;base64,AAA',
      mimeType: 'image/png',
      scope: 'brand-logo',
      updatedAt: '2026-07-19T00:00:00.000Z',
    };

    await expect(writeKolamImageCache('brand-logo', image)).resolves.toBe(false);
    await expect(
      readKolamImageCache('brand-logo', image.sourceUri),
    ).resolves.toBeNull();
  });

  it('does not fetch image blobs during sync', async () => {
    const fetcher = jest.fn();

    await expect(
      syncKolamImageCache({
        fetcher: fetcher as unknown as typeof fetch,
        revision: 'https://cdn/flag.png',
        scope: 'country-flag',
        sourceUri: 'https://cdn/flag.png',
      }),
    ).resolves.toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('indexes image batch inputs without downloading binary media', async () => {
    const fetcher = jest.fn();
    const summary = await syncKolamImageCacheBatch({
      fetcher: fetcher as unknown as typeof fetch,
      scope: 'brand-logo',
      images: [
        { sourceUri: 'https://cdn/logo-a.png', revision: 'a:v1' },
        { sourceUri: 'https://cdn/logo-a.png', revision: 'a:v1' },
        { sourceUri: null, revision: 'empty' },
      ],
    });

    expect(summary).toEqual({ failed: 0, synced: 2 });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('builds backend-gated request headers for optional file downloads', () => {
    setAccessToken('token-123');
    setNativeDeviceIdentity({
      macAddresses: ['AA:BB:CC:DD:EE:FF'],
      macSignature: 'signed-mac',
    });

    expect(createKolamLocalAssetRequestHeaders('Kolam')).toEqual(
      expect.objectContaining({
        Accept:
          'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        Authorization: 'Bearer token-123',
        Origin: 'app://kolamwindows',
        'User-Agent': 'KolamWindows/0.0.1',
        'x-da-client': 'kolam-windows',
        'x-da-client-version': '0.0.1',
        'x-device-mac': 'AA:BB:CC:DD:EE:FF',
        'x-device-mac-signature': 'signed-mac',
        'x-source': 'Kolam',
      }),
    );
  });
});
