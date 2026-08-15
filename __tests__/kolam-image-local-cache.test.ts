import {appConfig} from '../src/config/app';
import {
  getRenderableKolamImageUri,
  readKolamImageCache,
  syncKolamImageCache,
  syncKolamImageCacheBatch,
  writeKolamImageCache,
} from '../src/services/kolam-image-local-cache';
import { createKolamLocalAssetRequestHeaders } from '../src/services/kolam-local-asset-store';
import {
  getMemoryKolamImageDiskBackend,
  resetKolamImageDiskBackend,
  setKolamImageDiskBackend,
} from '../src/services/kolam-image-disk-backend';
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
    resetKolamImageDiskBackend();
    setKolamImageDiskBackend(getMemoryKolamImageDiskBackend());
  });

  afterEach(() => {
    resetLocalDataStore();
    resetKolamImageDiskBackend();
    setAccessToken(undefined);
    clearNativeDeviceIdentity();
  });

  it('refuses to store image data URI blobs in SQLite metadata', async () => {
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

  it('downloads image bytes to disk backend and stores path metadata only', async () => {
    const fetcher = jest.fn(async () =>
      createImageResponse('image/png', 'AAA'),
    );

    const asset = await syncKolamImageCache({
      fetcher: fetcher as unknown as typeof fetch,
      revision: 'flag:v1',
      scope: 'country-flag',
      sourceUri: 'https://cdn/flag.png',
    });

    expect(fetcher).toHaveBeenCalled();
    expect(asset?.localPath).toEqual(expect.stringMatching(/^country-flag-h\d+\.png$/));
    expect(asset?.localUri).toEqual(
      expect.stringMatching(/^data:image\/png;base64,AAA/),
    );
    expect(asset?.dataUri).toBeUndefined();
    expect(getRenderableKolamImageUri(asset)).toBe(asset?.localUri);

    const cached = await readKolamImageCache('country-flag', 'https://cdn/flag.png');
    expect(cached?.value.localPath).toBe(asset?.localPath);
    expect(cached?.value.dataUri).toBeUndefined();
  });

  it('dedupes batch sync inputs and downloads unique remote images', async () => {
    const fetcher = jest.fn(async () =>
      createImageResponse('image/png', 'BBB'),
    );
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
    expect(fetcher).toHaveBeenCalledTimes(1);
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
        'User-Agent': appConfig.nativeUserAgent,
        'x-da-client': 'kolam-windows',
        'x-da-client-version': appConfig.nativeClientVersion,
        'x-device-mac': 'AA:BB:CC:DD:EE:FF',
        'x-device-mac-signature': 'signed-mac',
        'x-source': 'Kolam',
      }),
    );
  });
});

function createImageResponse(mimeType: string, base64Payload: string) {
  const bytes = decodeBase64Fixture(base64Payload);
  return {
    ok: true,
    status: 200,
    headers: {
      get(name: string) {
        return name.toLowerCase() === 'content-type' ? mimeType : null;
      },
    },
    async blob() {
      return {
        size: bytes.byteLength,
        type: mimeType,
        async arrayBuffer() {
          return bytes.buffer.slice(
            bytes.byteOffset,
            bytes.byteOffset + bytes.byteLength,
          );
        },
      };
    },
  };
}

function decodeBase64Fixture(value: string) {
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const cleaned = value.replace(/=+$/, '');
  const bytes: number[] = [];

  for (let index = 0; index < cleaned.length; index += 4) {
    const a = alphabet.indexOf(cleaned[index] ?? 'A');
    const b = alphabet.indexOf(cleaned[index + 1] ?? 'A');
    const c = alphabet.indexOf(cleaned[index + 2] ?? 'A');
    const d = alphabet.indexOf(cleaned[index + 3] ?? 'A');
    const triplet = (a << 18) | (b << 12) | ((c & 63) << 6) | (d & 63);
    bytes.push((triplet >> 16) & 255);
    if (cleaned[index + 2]) {
      bytes.push((triplet >> 8) & 255);
    }
    if (cleaned[index + 3]) {
      bytes.push(triplet & 255);
    }
  }

  return Uint8Array.from(bytes);
}
