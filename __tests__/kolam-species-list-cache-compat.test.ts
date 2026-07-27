import {
  normalizeKolamSpeciesListCacheValue,
  readKolamSpeciesListCache,
} from '../src/services/kolam-species-local-cache';
import {
  MemoryLocalDataStore,
  resetLocalDataStore,
  setLocalDataStore,
} from '../src/services/local-data-store';

describe('Kolam species list cache compatibility', () => {
  beforeEach(() => {
    setLocalDataStore(new MemoryLocalDataStore());
  });

  afterEach(() => {
    resetLocalDataStore();
  });

  it('normalizes legacy array cache values into list results', () => {
    const normalized = normalizeKolamSpeciesListCacheValue([
      { id: 's1', scientificName: 'Betta splendens' },
    ]);

    expect(normalized?.data).toHaveLength(1);
    expect(normalized?.pagination).toEqual({
      page: 1,
      limit: 1,
      total: 1,
      totalPages: 1,
    });
  });

  it('reads legacy array cache without throwing on .data.length access', async () => {
    const store = new MemoryLocalDataStore();
    setLocalDataStore(store);
    await store.write({
      key: 'species:list:kolam',
      revision: 'legacy',
      updatedAt: '2026-07-28T00:00:00.000Z',
      value: [{ id: 's1', scientificName: 'Betta splendens' }],
    });

    const cached = await readKolamSpeciesListCache();
    expect(cached?.value.data.length).toBe(1);
    expect(cached?.value.pagination.total).toBe(1);
  });
});
