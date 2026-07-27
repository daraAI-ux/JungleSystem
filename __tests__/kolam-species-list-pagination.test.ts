import { normalizeKolamSpeciesList } from '../src/domain/kolam-species';

describe('Kolam species list pagination', () => {
  it('normalizes list payload with sibling pagination metadata', () => {
    const result = normalizeKolamSpeciesList({
      success: true,
      data: [
        {
          _id: 'species-1',
          scientificName: 'Betta splendens',
          sku: 'SP-001',
        },
        {
          _id: 'species-2',
          scientificName: 'Poecilia reticulata',
          sku: 'SP-002',
        },
      ],
      pagination: {
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      },
    });

    expect(result.data).toHaveLength(2);
    expect(result.data[0]?.id).toBe('species-1');
    expect(result.data[0]?.scientificName).toBe('Betta splendens');
    expect(result.pagination).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
    });
  });

  it('falls back pagination from current page length when meta is missing', () => {
    const result = normalizeKolamSpeciesList([
      { _id: 'species-1', scientificName: 'Betta splendens' },
    ]);

    expect(result.data).toHaveLength(1);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 1,
      total: 1,
      totalPages: 1,
    });
  });
});
