import { appConfig } from '../src/config/app';
import {
  confirmKolamAdminCashflowTransaction,
  rejectKolamAdminCashflowTransaction,
} from '../src/services/kolam-cashflow-session-api';

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock;
});

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return {
    ok: init.status ? init.status >= 200 && init.status < 300 : true,
    status: init.status ?? 200,
    headers: new Headers(init.headers),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe('kolam admin cashflow transaction api', () => {
  it('posts confirm and reject endpoints for a session transaction', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true }));

    await confirmKolamAdminCashflowTransaction('sess-1', 'trx-1');
    await rejectKolamAdminCashflowTransaction('sess-1', 'trx-2', 'Salah nominal');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `${appConfig.kolamApiBaseUrl.replace(/\/+$/, '')}/cashflow/sess-1/transactions/trx-1/confirm`,
    );
    expect(fetchMock.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      `${appConfig.kolamApiBaseUrl.replace(/\/+$/, '')}/cashflow/sess-1/transactions/trx-2/reject`,
    );
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({
      note: 'Salah nominal',
    });
  });
});
