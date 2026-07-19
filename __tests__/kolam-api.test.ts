import { appConfig } from '../src/config/app';
import { setAccessToken } from '../src/lib/api-client';
import { deleteKolamBrand } from '../src/services/kolam-brand-api';
import {
  deleteKolamCategory,
  getKolamCategories,
  uploadKolamCategoryIcon,
} from '../src/services/kolam-category-api';
import {
  getKolamActivityLogs,
  getKolamPendingCustomerVerifications,
  getKolamRoles,
  getKolamWebSetting,
  getKolamWebSettingVersion,
  updateKolamWebSetting,
} from '../src/services/kolam-api';

const fetchMock = jest.fn();

describe('Kolam Settings API contracts', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
    setAccessToken(undefined);
  });

  it('unwraps Web Settings through direct BE with the Kolam source header', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: {
          companyName: 'Dunia Anura',
          version: '1.2.3',
          maintenance: {
            marketplace: false,
            pos: true,
          },
        },
      }),
    );

    await expect(getKolamWebSetting()).resolves.toMatchObject({
      companyName: 'Dunia Anura',
      version: '1.2.3',
      maintenance: {
        marketplace: false,
        pos: true,
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/websetting`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'x-source': appConfig.kolamSourceHeader,
        }),
      }),
    );
  });

  it('requests the app-specific Web Settings version endpoint through direct BE', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        version: '2.0.0',
        app: 'pos',
        updatedAt: '2026-07-16T00:00:00.000Z',
      }),
    );

    await expect(getKolamWebSettingVersion('pos')).resolves.toMatchObject({
      version: '2.0.0',
      app: 'pos',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/websetting/version?app=pos`,
      expect.objectContaining({
        method: 'GET',
      }),
    );
  });

  it('sends Web Settings updates to the live backend contract', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: {
          companyName: 'Kolam Dunia Anura',
          livechatOnline: true,
        },
      }),
    );

    await updateKolamWebSetting({
      companyName: 'Kolam Dunia Anura',
      livechatOnline: true,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/websetting`,
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-source': appConfig.kolamSourceHeader,
        }),
        body: JSON.stringify({
          companyName: 'Kolam Dunia Anura',
          livechatOnline: true,
        }),
      }),
    );
  });

  it('maps Role Management from /roles data responses through direct BE', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        message: 'Roles fetched successfully',
        data: [
          { _id: 'role-1', name: 'Super Administrator', key: 'super-admin' },
          { _id: 'role-2', name: 'POS Cashier', key: 'pos' },
        ],
      }),
    );

    await expect(getKolamRoles()).resolves.toEqual([
      expect.objectContaining({ key: 'super-admin' }),
      expect.objectContaining({ key: 'pos' }),
    ]);

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/roles`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'x-source': appConfig.kolamSourceHeader,
        }),
      }),
    );
  });

  it('requests customer visit confirmations through direct BE', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: [
          {
            pendingServiceId: 'pending-service-1',
            taskKind: 'maintenance',
            taskId: 'task-1',
            executionId: 'execution-1',
            visitTitle: 'Kunjungan layanan',
          },
        ],
      }),
    );

    await expect(getKolamPendingCustomerVerifications()).resolves.toEqual([
      expect.objectContaining({
        pendingServiceId: 'pending-service-1',
        executionId: 'execution-1',
      }),
    ]);

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/subscriptions/my/pending-customer-verifications`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'x-source': appConfig.kolamSourceHeader,
        }),
      }),
    );
  });

  it('requests Activity Log with backend filters and omits empty params through direct BE', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: [],
        meta: {
          page: 2,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      }),
    );

    await getKolamActivityLogs({
      page: 2,
      limit: 10,
      status: '',
      search: 'checkout',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/activity-log?page=2&limit=10&search=checkout`,
      expect.objectContaining({
        method: 'GET',
      }),
    );
  });

  it('deletes a brand through the direct Kolam backend contract', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true }));

    await expect(deleteKolamBrand('brand-1')).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/brand/brand-1`,
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          'x-source': appConfig.kolamSourceHeader,
        }),
      }),
    );
  });

  it('deletes a category through the direct Kolam backend contract', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true }));

    await expect(deleteKolamCategory('cat-1')).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/category/cat-1`,
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          'x-source': appConfig.kolamSourceHeader,
        }),
      }),
    );
  });

  it('falls back from category tree to flat category endpoint when needed', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: [], total: 0 }))
      .mockResolvedValueOnce(jsonResponse({ data: [], pagination: {} }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: [
            {
              _id: 'cat-1',
              name: 'Peralatan',
              icon: 'media/category/peralatan.png',
            },
          ],
          pagination: { total: 1 },
        }),
      );

    await expect(getKolamCategories()).resolves.toEqual([
      expect.objectContaining({ id: 'cat-1', name: 'Peralatan' }),
    ]);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${appConfig.kolamApiBaseUrl}/category/tree?maxDepth=3`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${appConfig.kolamApiBaseUrl}/category?limit=1000&tree=true`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      `${appConfig.kolamApiBaseUrl}/category?limit=1000`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('builds a local category tree from a flat backend list', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: [], total: 0 }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: [
            { _id: 'cat-1', name: 'Peralatan' },
            {
              _id: 'cat-2',
              name: 'Filter',
              parent: { _id: 'cat-1', name: 'Peralatan' },
            },
          ],
          pagination: { total: 2 },
        }),
      );

    await expect(getKolamCategories()).resolves.toEqual([
      expect.objectContaining({
        id: 'cat-1',
        children: [expect.objectContaining({ id: 'cat-2', level: 1 })],
      }),
    ]);
  });

  it('uploads a category icon through the backend photos contract and refreshes detail', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: 'ok', photos: ['icon.png'] }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            _id: 'cat-1',
            name: 'Peralatan',
            icon: 'media/category/icon.png',
          },
        }),
      );

    await expect(
      uploadKolamCategoryIcon('cat-1', 'C:\\icons\\peralatan.png'),
    ).resolves.toEqual(
      expect.objectContaining({
        iconUrl: 'https://amfibi.dunia-anura.com/media/category/icon.png',
      }),
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${appConfig.kolamApiBaseUrl}/category/cat-1/photos`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-source': appConfig.kolamSourceHeader,
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${appConfig.kolamApiBaseUrl}/category/cat-1`,
      expect.objectContaining({
        method: 'GET',
      }),
    );
  });
});

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
  };
}
