import {appConfig} from '../src/config/app';
import {clearResponseCookieJar} from '../src/lib/api-client';
import {logoutAmSession} from '../src/services/am-api';

const fetchMock = jest.fn();

describe('AM API service', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(jsonResponse({success: true, message: 'Logout success'}));
    globalThis.fetch = fetchMock;
    clearResponseCookieJar();
  });

  it('logs out of the live AM session with AM source and cookie credentials', async () => {
    await logoutAmSession('https://am.example.test/api');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/auth/logout',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });
});

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    headers: {
      get: jest.fn(),
    },
    text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
  };
}
