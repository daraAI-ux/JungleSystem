import {appConfig} from '../src/config/app';
import {clearResponseCookieJar} from '../src/lib/api-client';
import {createAmTransfer, logoutAmSession} from '../src/services/am-api';

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

  it('creates transfers through the AM live transfer endpoint', async () => {
    const payload = {
      transferType: 'transfer' as const,
      transferMethod: 'BI FAST',
      transactionPurpose: 'Purchase',
      recipientAccount: '999',
      recipientName: 'Vendor Baru',
      recipientBank: 'Mandiri',
      amount: 250000,
    };
    fetchMock.mockResolvedValue(jsonResponse({success: true, data: {_id: 'transfer-new'}}));

    await createAmTransfer(payload, 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/transfer',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
          'Content-Type': 'application/json',
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
