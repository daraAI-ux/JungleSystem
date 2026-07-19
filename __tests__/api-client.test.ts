import { appConfig } from '../src/config/app';
import {
  apiRequest,
  clearNativeDeviceIdentity,
  clearResponseCookieJar,
  setAccessToken,
  setNativeDeviceIdentity,
} from '../src/lib/api-client';

const fetchMock = jest.fn();
const cookieAuthBaseUrl = 'https://cookie-auth.example.test';

describe('native runtime API identity', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
    globalThis.fetch = fetchMock;
    setAccessToken(undefined);
    clearNativeDeviceIdentity();
    clearResponseCookieJar();
  });

  it('marks requests as KolamWindows without changing the source contract', async () => {
    await apiRequest({ method: 'GET', path: '/health' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.apiBaseUrl}/health`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Origin: appConfig.nativeOrigin,
          'User-Agent': appConfig.nativeUserAgent,
          'x-da-client': appConfig.nativeClientId,
          'x-da-client-version': appConfig.nativeClientVersion,
          'x-source': appConfig.sourceHeader,
        }),
      }),
    );
  });

  it('sends native MAC identity only when provided by the Windows runtime', async () => {
    setNativeDeviceIdentity({
      macAddresses: ['aa:bb:cc:dd:ee:ff', '11-22-33-44-55-66'],
      macSignature: 'signed-macs',
    });
    setAccessToken('live-token');

    await apiRequest({
      method: 'GET',
      path: '/auth/detail-user',
      sourceHeader: appConfig.kolamSourceHeader,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.apiBaseUrl}/auth/detail-user`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer live-token',
          'x-device-mac': 'AA:BB:CC:DD:EE:FF,11-22-33-44-55-66',
          'x-device-mac-signature': 'signed-macs',
          'x-source': appConfig.kolamSourceHeader,
        }),
      }),
    );
  });

  it('stores response cookies and sends the matching CSRF header on later unsafe requests', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(
          { ok: true },
          'accessToken=live-cookie; Path=/; HttpOnly, kolamCsrf=csrf-1; Path=/',
        ),
      )
      .mockResolvedValueOnce(jsonResponse({ handoffCode: 'handoff-1' }));

    await apiRequest({
      method: 'POST',
      path: '/session',
      baseUrl: cookieAuthBaseUrl,
      cookieJar: true,
      credentials: 'omit',
      body: { mode: 'password' },
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${cookieAuthBaseUrl}/session`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
        }),
      }),
    );

    await apiRequest({
      method: 'POST',
      path: '/handoff',
      baseUrl: cookieAuthBaseUrl,
      cookieJar: true,
      credentials: 'omit',
    });

    expect(fetchMock).toHaveBeenLastCalledWith(
      `${cookieAuthBaseUrl}/handoff`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Cookie: 'accessToken=live-cookie; kolamCsrf=csrf-1',
          'x-csrf-token': 'csrf-1',
        }),
      }),
    );
  });

  it('sends FormData bodies without forcing the JSON content type', async () => {
    const formData = new FormData();
    formData.append('photos', 'file');

    await apiRequest({
      method: 'POST',
      path: '/brand/brand-1/upload-photos',
      body: formData,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.apiBaseUrl}/brand/brand-1/upload-photos`,
      expect.objectContaining({
        method: 'POST',
        body: formData,
        headers: expect.not.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });
});

function jsonResponse(payload: unknown, setCookie?: string) {
  return {
    ok: true,
    status: 200,
    headers: {
      get: jest.fn((name: string) =>
        name.toLowerCase() === 'set-cookie' ? setCookie : undefined,
      ),
    },
    text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
  };
}
