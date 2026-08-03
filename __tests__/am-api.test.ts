import {appConfig} from '../src/config/app';
import {clearResponseCookieJar} from '../src/lib/api-client';
import {
  createAmTask,
  createAmTransfer,
  getAmBoxById,
  getAmDeviceById,
  getAmMutasiReceiptUrl,
  getAmRackById,
  loginAmSession,
  logoutAmSession,
  testAmWebhookPing,
  updateAmUser,
} from '../src/services/am-api';

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

  it('logs into the live AM session with cookie credentials', async () => {
    const payload = {username: 'admin', password: 'secret'};
    fetchMock.mockResolvedValue(jsonResponse({
      success: true,
      data: {user: {_id: 'user-current', username: 'admin'}},
    }));

    await loginAmSession(payload, 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/auth/login',
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

  it('creates automation tasks through the AM live task endpoint', async () => {
    const payload = {
      type: 'send_message',
      deviceId: 'device-1',
      serviceAccountId: 'account-1',
      payload: {message: 'Halo'},
      priority: 5,
    };
    fetchMock.mockResolvedValue(jsonResponse({success: true, data: {_id: 'task-new'}}));

    await createAmTask(payload, 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/task',
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

  it('loads hardware detail resources through AM live get-by-id endpoints', async () => {
    fetchMock.mockResolvedValue(jsonResponse({success: true, data: {_id: 'rack-live'}}));

    await getAmRackById('rack-live', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/rack/rack-live',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    fetchMock.mockResolvedValue(jsonResponse({success: true, data: {_id: 'box-live'}}));

    await getAmBoxById(
      'box-live',
      {rackId: 'rack-live'},
      'https://am.example.test/api',
    );

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/box/box-live?rackId=rack-live',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    fetchMock.mockResolvedValue(jsonResponse({success: true, data: {_id: 'device-live'}}));

    await getAmDeviceById(
      'device-live',
      {boxId: 'box-live'},
      'https://am.example.test/api',
    );

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/device/device-live?boxId=box-live',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('returns the live AM webhook test ping message', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      success: true,
      message: 'Test ping dispatched to 2 active config(s)',
    }));

    await expect(testAmWebhookPing('https://am.example.test/api')).resolves.toEqual({
      success: true,
      message: 'Test ping dispatched to 2 active config(s)',
    });

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/webhook/test-ping',
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

  it('updates AM users through the live user endpoint', async () => {
    const payload = {
      fullName: 'Current AM User Updated',
      username: 'current.updated@dunia-anura.com',
    };
    fetchMock.mockResolvedValue(jsonResponse({success: true, data: {_id: 'user-current'}}));

    await updateAmUser('user-current', payload, 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/users/user-current',
      expect.objectContaining({
        method: 'PUT',
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

  it('builds authenticated AM mutasi receipt URLs against the live server', () => {
    expect(getAmMutasiReceiptUrl('mutasi 1', 'https://am.example.test/api/')).toBe(
      'https://am.example.test/api/mutasi/mutasi%201/receipt',
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
