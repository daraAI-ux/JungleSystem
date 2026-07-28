import { appConfig } from '../src/config/app';
import {
  createKolamPaymentMethod,
  deleteKolamPaymentMethod,
  deleteKolamPaymentMethodPhoto,
  getKolamPaymentMethods,
  getKolamTaxCompanyProfile,
  updateKolamPaymentMethod,
  updateKolamTaxCompanyProfile,
  uploadKolamPaymentMethodPhoto,
} from '../src/services/kolam-financial-settings-api';

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

describe('kolam financial settings api', () => {
  it('reads payment methods with search and webstore filter', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: [
          {
            _id: 'pm-1',
            name: 'QRIS',
            type: 'qris',
            provider: 'DANA',
            wallet: { _id: 'wallet-1', name: 'Dana', type: 'virtual' },
            isActive: true,
            isAvailableOnWebstore: true,
            requireSaleProof: true,
            costs: [{ name: 'Admin', type: 'percentage', amount: 0.7 }],
          },
        ],
        pagination: { total: 1, page: 2, limit: 5, totalPages: 3 },
      }),
    );

    await expect(
      getKolamPaymentMethods({
        page: 2,
        limit: 5,
        search: 'qris',
        isAvailableOnWebstore: true,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        rows: [
          expect.objectContaining({
            id: 'pm-1',
            name: 'QRIS',
            requireSaleProof: true,
            wallet: expect.objectContaining({ id: 'wallet-1' }),
            costs: [expect.objectContaining({ amount: 0.7 })],
          }),
        ],
        pagination: expect.objectContaining({ totalPages: 3 }),
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/payment-method?page=2&limit=5&search=qris&isAvailableOnWebstore=true`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('sends create and update payment method bodies', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { _id: 'pm-1', name: 'BCA' } }))
      .mockResolvedValueOnce(jsonResponse({ data: { _id: 'pm-1', name: 'BCA Bisnis' } }));

    await createKolamPaymentMethod({
      name: 'BCA',
      type: 'transfer',
      provider: 'BCA',
      wallet: 'wallet-1',
      accountNumber: '123',
      accountName: 'Dunia Anura',
      notes: 'utama',
      isActive: true,
      isAvailableOnWebstore: true,
      requireSaleProof: true,
      costs: [{ name: 'Admin', type: 'fixed', amount: 2500 }],
    });
    await updateKolamPaymentMethod('pm-1', {
      name: 'BCA Bisnis',
      wallet: 'wallet-1',
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${appConfig.kolamApiBaseUrl}/payment-method`,
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"requireSaleProof":true'),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${appConfig.kolamApiBaseUrl}/payment-method/pm-1`,
      expect.objectContaining({
        method: 'PUT',
        body: expect.stringContaining('"name":"BCA Bisnis"'),
      }),
    );
  });

  it('uses FE/BE local payment photo endpoints', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: 'ok' }))
      .mockResolvedValueOnce(jsonResponse({ message: 'deleted' }))
      .mockResolvedValueOnce(jsonResponse({ message: 'deleted' }));

    await uploadKolamPaymentMethodPhoto('pm-1', 'C:\\icons\\qris.png');
    await deleteKolamPaymentMethodPhoto('pm-1');
    await deleteKolamPaymentMethod('pm-1');

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${appConfig.kolamApiBaseUrl}/payment-method/pm-1/upload-photo`,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${appConfig.kolamApiBaseUrl}/payment-method/pm-1/delete-photo`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      `${appConfig.kolamApiBaseUrl}/payment-method/pm-1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('reads and updates tax company profile', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: {
            companyName: 'Dunia Anura',
            defaultPpnRate: 11,
            completeness: { complete: true, missing: [] },
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ success: true, data: { companyName: 'Dunia Anura PT' } }),
      );

    await expect(getKolamTaxCompanyProfile()).resolves.toEqual(
      expect.objectContaining({ companyName: 'Dunia Anura' }),
    );
    await updateKolamTaxCompanyProfile({ companyName: 'Dunia Anura PT' });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${appConfig.kolamApiBaseUrl}/dara-tax/company-profile`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${appConfig.kolamApiBaseUrl}/dara-tax/company-profile`,
      expect.objectContaining({
        method: 'PUT',
        body: expect.stringContaining('"companyName":"Dunia Anura PT"'),
      }),
    );
  });
});
