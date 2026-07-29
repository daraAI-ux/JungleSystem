import {appConfig} from '../src/config/app';
import {
  getKolamCustomerLocationText,
  normalizeKolamCustomerListResult,
} from '../src/domain/kolam-customer';
import {setAccessToken} from '../src/lib/api-client';
import {getKolamCustomerList} from '../src/services/kolam-customer-api';

const fetchMock = jest.fn();

describe('Kolam customer live API domain', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
    setAccessToken(undefined);
  });

  it('normalizes live customer list rows with pagination and rich metadata', () => {
    const result = normalizeKolamCustomerListResult(
      {
        data: [
          {
            _id: 'customer-1',
            account_restricted: true,
            addresses: [
              {
                _id: 'address-1',
                addressLine1: 'Jl. Mawar',
                city: 'Bandung',
                isDefault: true,
                province: 'Jawa Barat',
                recipientName: 'Maya',
              },
            ],
            createdAt: '2026-07-01T00:00:00.000Z',
            email: 'maya@example.com',
            externalAccounts: [
              {
                externalId: 'tp-1',
                externalName: 'Maya Store',
                linkedAt: '2026-07-02T00:00:00.000Z',
                platform: 'tokopedia',
              },
            ],
            gender: 'female',
            name: 'Maya',
            phone: '0812',
            photos: ['media/customer/maya.jpg'],
            points: {
              availablePoints: 25,
              lifetimePoints: 40,
              totalPoints: 30,
            },
            status: 'active',
            updatedAt: '2026-07-03T00:00:00.000Z',
            username: 'maya',
            verified_status: true,
          },
        ],
        pagination: {
          limit: 10,
          page: 2,
          total: 21,
          totalPages: 3,
        },
      },
      {limit: 10, page: 1},
    );

    expect(result.pagination).toEqual({
      limit: 10,
      page: 2,
      total: 21,
      totalPages: 3,
    });
    expect(result.items[0]).toMatchObject({
      accountRestricted: true,
      email: 'maya@example.com',
      id: 'customer-1',
      name: 'Maya',
      phone: '0812',
      status: 'active',
      username: 'maya',
      verifiedStatus: true,
    });
    expect(result.items[0].points.availablePoints).toBe(25);
    expect(result.items[0].externalAccounts[0]).toMatchObject({
      externalId: 'tp-1',
      platform: 'tokopedia',
    });
    expect(getKolamCustomerLocationText(result.items[0])).toBe(
      'Bandung, Jawa Barat',
    );
  });

  it('requests paginated customer list through direct Kolam BE search params', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: [
          {
            _id: 'customer-2',
            gender: 'male',
            name: 'Rio',
            status: 'inactive',
          },
        ],
        pagination: {
          limit: 25,
          page: 3,
          total: 51,
          totalPages: 3,
        },
      }),
    );

    await expect(
      getKolamCustomerList({limit: 25, page: 3, search: ' rio '}),
    ).resolves.toMatchObject({
      items: [{id: 'customer-2', name: 'Rio'}],
      pagination: {limit: 25, page: 3, total: 51, totalPages: 3},
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/customer?limit=25&page=3&search=rio`,
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-source': appConfig.kolamSourceHeader,
        }),
        method: 'GET',
      }),
    );
  });
});

function jsonResponse(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    headers: {'Content-Type': 'application/json'},
    status: 200,
  });
}
