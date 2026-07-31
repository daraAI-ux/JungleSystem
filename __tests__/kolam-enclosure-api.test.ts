import { appConfig } from '../src/config/app';
import { setAccessToken } from '../src/lib/api-client';
import {
  createKolamEnclosure,
  deleteKolamEnclosure,
  getKolamEnclosureDashboardStats,
  getKolamEnclosureDetail,
  getKolamEnclosureStatistics,
  getKolamEnclosureStaffAssignees,
  getKolamEnclosures,
  getKolamPendingLivestockAllocations,
  getKolamSpeciesAllocationOverview,
  resolveKolamEnclosureLivestockAllocation,
  updateKolamEnclosureAssignedTo,
} from '../src/services/kolam-enclosure-api';

const fetchMock = jest.fn();

describe('kolam enclosure api', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
    setAccessToken(undefined);
  });

  it('requests enclosure list with plugin-compatible query params', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: [
          {
            _id: 'enc-1',
            enclosure_code: 'ENC-AQUA-01',
            enclosure_name: 'Aqua 01',
          },
        ],
        meta: { page: 2, limit: 20, total: 21 },
      }),
    );

    await expect(
      getKolamEnclosures({
        enclosureType: 'Aquarium',
        limit: 20,
        livestockPurpose: 'production',
        page: 2,
        scope: 'client_linked',
        search: ' enc ',
      }),
    ).resolves.toMatchObject({
      data: [{ id: 'enc-1', code: 'ENC-AQUA-01', name: 'Aqua 01' }],
      pagination: { page: 2, limit: 20, total: 21, totalPages: 2 },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/enclosures?page=2&limit=20&clientScope=client_linked&search=enc&livestockPurpose=production&enclosure_type=Aquarium`,
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-source': appConfig.kolamSourceHeader,
        }),
        method: 'GET',
      }),
    );
  });

  it('reads enclosure detail by id', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: {
          _id: 'enc-1',
          enclosure_code: 'ENC-1',
          enclosure_name: 'Rack 1',
          photo: ['/uploads/enc-1.jpg'],
          species: [{ speciesId: 'sp-1', speciesName: 'Frog', quantity: 2 }],
        },
      }),
    );

    await expect(getKolamEnclosureDetail('enc-1')).resolves.toMatchObject({
      code: 'ENC-1',
      id: 'enc-1',
      name: 'Rack 1',
      photos: ['/uploads/enc-1.jpg'],
      species: [{quantity: 2, speciesName: 'Frog'}],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/enclosures/enc-1`,
      expect.objectContaining({method: 'GET'}),
    );
  });

  it('reads enclosure statistics by id', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: {
          deaths: [{_id: 'death-1', quantity: '1', totalValue: '100000'}],
          enclosureCode: 'ENC-1',
          enclosureId: 'enc-1',
          lost: [],
          livestockPurpose: 'production',
          production: {
            eggsBySpecies: [{quantity: 4, speciesId: 'sp-1'}],
            events: [
              {
                _id: 'prod-1',
                category: 'indukan_birth',
                categoryLabel: 'Kelahiran indukan',
                quantity: 3,
              },
            ],
            summary: {currentEggQty: 4, indukanBirthQty: 3},
          },
          sales: [],
          summary: {
            currentPopulationQty: 6,
            deathQty: 1,
            healthLabel: 'Menguntungkan',
            healthTone: 'positive',
          },
        },
      }),
    );

    await expect(getKolamEnclosureStatistics('enc-1')).resolves.toMatchObject({
      deaths: [{id: 'death-1', quantity: 1, totalValue: 100000}],
      enclosureId: 'enc-1',
      livestockPurpose: 'production',
      production: {
        events: [{category: 'indukan_birth', quantity: 3}],
        summary: {currentEggQty: 4, indukanBirthQty: 3},
      },
      summary: {currentPopulationQty: 6, deathQty: 1},
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/enclosures/enc-1/statistics`,
      expect.objectContaining({method: 'GET'}),
    );
  });

  it('reads dashboard, pending allocation, allocation overview, and staff', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            births: { totalAnimals: 1, totalCases: 1 },
            byType: [{ count: 1, type: 'Aquarium' }],
            deaths: { recent: [], reportedAnimals: 0, reportedCases: 0 },
            production: { rows: [], speciesDistinct: 0, totalQty: 0 },
            saleable: { rows: [], speciesDistinct: 0, totalQty: 0 },
            totals: { enclosures: 1, individuals: 0, speciesDistinct: 0 },
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: [{ _id: 'pending-1', qtyRemaining: 2, speciesId: 'sp-1' }],
          meta: { total: 1 },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            items: [{ allocated: 1, speciesId: 'sp-1', speciesName: 'Frog' }],
            totals: { speciesCount: 1, totalAllocated: 1 },
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: [
            {
              _id: 'u1',
              first_name: 'Ada',
              last_name: 'Lovelace',
              email: 'ada@example.com',
            },
          ],
        }),
      );

    await expect(getKolamEnclosureDashboardStats()).resolves.toMatchObject({
      totals: { enclosures: 1 },
    });
    await expect(
      getKolamPendingLivestockAllocations({ status: 'pending' }),
    ).resolves.toMatchObject({
      items: [{ id: 'pending-1', qtyRemaining: 2, speciesId: 'sp-1' }],
      total: 1,
    });
    await expect(getKolamSpeciesAllocationOverview()).resolves.toMatchObject({
      items: [{ allocated: 1, speciesId: 'sp-1', speciesName: 'Frog' }],
      totals: { speciesCount: 1, totalAllocated: 1 },
    });
    await expect(
      getKolamEnclosureStaffAssignees({ limit: 50, search: 'ada' }),
    ).resolves.toEqual([
      expect.objectContaining({
        displayName: 'Ada Lovelace',
        email: 'ada@example.com',
        id: 'u1',
      }),
    ]);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${appConfig.kolamApiBaseUrl}/enclosures/dashboard-stats`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${appConfig.kolamApiBaseUrl}/enclosures/pending-livestock-allocations?status=pending`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      `${appConfig.kolamApiBaseUrl}/enclosures/species-allocation-overview`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      `${appConfig.kolamApiBaseUrl}/enclosures/staff-assignees?search=ada&limit=50`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('sends create, PIC update, delete, and resolve-allocation mutations', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ data: { _id: 'enc-1', enclosure_code: 'ENC-01' } }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            _id: 'enc-1',
            assignedTo: { _id: 'u2', username: 'keeper' },
            enclosure_code: 'ENC-01',
          },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ message: 'deleted' }))
      .mockResolvedValueOnce(jsonResponse({ message: 'ok' }));

    await createKolamEnclosure({
      assignedTo: 'u1',
      enclosure_code: ' enc-01 ',
      enclosure_size: {
        high: { unit: 'Cm', value: 40 },
        length: { unit: 'Cm', value: 60 },
        width: { unit: 'Cm', value: 50 },
      },
      enclosure_type: 'Aquarium',
      livestockPurpose: 'production',
      locationId: 'loc-1',
      note: '  Rack A ',
      type_aquarium: 'freshwater',
    });
    await updateKolamEnclosureAssignedTo('enc-1', 'u2');
    await deleteKolamEnclosure('enc-1');
    await resolveKolamEnclosureLivestockAllocation({
      allocations: [{ enclosureId: 'enc-1', qty: 2 }],
      pendingId: 'pending-1',
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${appConfig.kolamApiBaseUrl}/enclosures`,
      expect.objectContaining({
        body: expect.stringContaining('"enclosure_code":"ENC-01"'),
        method: 'POST',
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${appConfig.kolamApiBaseUrl}/enclosures/enc-1/assigned-to`,
      expect.objectContaining({
        body: JSON.stringify({ assignedTo: 'u2' }),
        method: 'PUT',
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      `${appConfig.kolamApiBaseUrl}/enclosures/enc-1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      `${appConfig.kolamApiBaseUrl}/enclosures/resolve-livestock-allocation`,
      expect.objectContaining({
        body: expect.stringContaining('"pendingId":"pending-1"'),
        method: 'POST',
      }),
    );
  });
});

function jsonResponse(payload: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    status: init.status ?? 200,
  });
}
