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
  let store: MemoryLocalDataStore;

  beforeEach(() => {
    store = new MemoryLocalDataStore();
    setLocalDataStore(store);
  });

  afterEach(() => {
    resetLocalDataStore();
    setAccessToken(undefined);
    clearNativeDeviceIdentity();
  });

  it('stores image data URI in the local DB only when the source changes', async () => {
    const image = {
      sourceUri: 'https://cdn/logo.png',
      revision: 'brand-1:v1',
      dataUri: 'data:image/png;base64,AAA',
      mimeType: 'image/png',
      scope: 'brand-logo',
      updatedAt: '2026-07-19T00:00:00.000Z',
    };

    await expect(writeKolamImageCache('brand-logo', image)).resolves.toBe(true);
    await expect(writeKolamImageCache('brand-logo', image)).resolves.toBe(
      false,
    );
    await expect(
      readKolamImageCache('brand-logo', image.sourceUri),
    ).resolves.toEqual(
      expect.objectContaining({
        revision: image.revision,
        value: image,
      }),
    );
  });

  it('returns cached image data without fetching again', async () => {
    const fetcher = jest.fn();
    const image = {
      sourceUri: 'https://cdn/flag.png',
      revision: 'https://cdn/flag.png',
      dataUri: 'data:image/png;base64,BBB',
      mimeType: 'image/png',
      scope: 'country-flag',
      updatedAt: '2026-07-19T00:00:00.000Z',
    };

    await writeKolamImageCache('country-flag', image);

    await expect(
      syncKolamImageCache({
        fetcher: fetcher as unknown as typeof fetch,
        revision: image.revision,
        scope: 'country-flag',
        sourceUri: image.sourceUri,
      }),
    ).resolves.toEqual(image);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('syncs image batches once per source URI for shared local asset storage', async () => {
    const fetcher = jest.fn();
    await writeKolamImageCache('brand-logo', {
      sourceUri: 'https://cdn/logo-a.png',
      revision: 'a:v1',
      dataUri: 'data:image/png;base64,AAA',
      mimeType: 'image/png',
      scope: 'brand-logo',
      updatedAt: '2026-07-19T00:00:00.000Z',
    });

    const summary = await syncKolamImageCacheBatch({
      fetcher: fetcher as unknown as typeof fetch,
      scope: 'brand-logo',
      images: [
        { sourceUri: 'https://cdn/logo-a.png', revision: 'a:v1' },
        { sourceUri: 'https://cdn/logo-a.png', revision: 'a:v1' },
        { sourceUri: null, revision: 'empty' },
      ],
    });

    expect(summary).toEqual({ failed: 0, synced: 1 });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('builds backend-gated request headers for local asset downloads', () => {
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
