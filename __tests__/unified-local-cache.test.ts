import {
  getUnifiedDatasetCacheKey,
  loadCachedUnifiedDataset,
  markUnifiedDatasetAsCache,
  persistUnifiedDatasetIfChanged,
  refreshUnifiedDatasetWithCache,
} from '../src/services/unified-local-cache';
import {
  loadUnifiedDataset,
  seedUnifiedDataset,
  type UnifiedDataset,
} from '../src/services/unified-data';
import {
  MemoryLocalDataStore,
  resetLocalDataStore,
  setLocalDataStore,
} from '../src/services/local-data-store';

jest.mock('../src/services/unified-data', () => {
  const actual = jest.requireActual('../src/services/unified-data');

  return {
    ...actual,
    loadUnifiedDataset: jest.fn(),
  };
});

const loadUnifiedDatasetMock =
  loadUnifiedDataset as jest.MockedFunction<typeof loadUnifiedDataset>;

function buildLiveDataset(overrides: Partial<UnifiedDataset> = {}): UnifiedDataset {
  return {
    ...seedUnifiedDataset,
    ...overrides,
    kolam: {
      ...seedUnifiedDataset.kolam,
      source: 'live',
      dashboardCounts: {
        products: 9,
        rawProducts: 4,
        species: 5,
        services: 2,
      },
      ...overrides.kolam,
    },
    sync: {
      pos: 'disabled',
      kolam: 'live',
      am: 'disabled',
      ...overrides.sync,
    },
  };
}

describe('unified local cache', () => {
  beforeEach(() => {
    loadUnifiedDatasetMock.mockReset();
    setLocalDataStore(new MemoryLocalDataStore());
  });

  afterEach(() => {
    resetLocalDataStore();
  });

  it('builds cache keys per owner and dashboard range', () => {
    expect(getUnifiedDatasetCacheKey('Sico.Ekel@Nustek.co.id', 'year')).toBe(
      'unified:sico.ekel@nustek.co.id:dashboard:year',
    );
    expect(getUnifiedDatasetCacheKey(undefined, 'month')).toBeNull();
  });

  it('persists live refresh data and reads it back as local cache', async () => {
    const dataset = buildLiveDataset();

    await expect(
      persistUnifiedDatasetIfChanged({
        cacheOwnerId: 'staff@example.test',
        dataset,
      }),
    ).resolves.toMatchObject({
      changed: true,
      metadata: {
        ownerId: 'staff@example.test',
        sourceSummary: {
          pos: 'disabled',
          kolam: 'live',
          am: 'disabled',
        },
      },
    });

    await expect(
      loadCachedUnifiedDataset({cacheOwnerId: 'staff@example.test'}),
    ).resolves.toMatchObject({
      kolam: expect.objectContaining({source: 'cache'}),
      sync: {
        pos: 'disabled',
        kolam: 'cache',
        am: 'disabled',
      },
    });
  });

  it('does not rewrite the local record when the server revision is unchanged', async () => {
    const dataset = buildLiveDataset();

    await persistUnifiedDatasetIfChanged({
      cacheOwnerId: 'staff@example.test',
      dataset,
    });

    await expect(
      persistUnifiedDatasetIfChanged({
        cacheOwnerId: 'staff@example.test',
        dataset,
      }),
    ).resolves.toMatchObject({changed: false});
  });

  it('skips cache writes for fallback seed or anonymous data', async () => {
    await expect(
      persistUnifiedDatasetIfChanged({
        cacheOwnerId: 'staff@example.test',
        dataset: seedUnifiedDataset,
      }),
    ).resolves.toBeNull();
    await expect(
      persistUnifiedDatasetIfChanged({
        dataset: buildLiveDataset(),
      }),
    ).resolves.toBeNull();
  });

  it('refreshes from the existing backend loader and stores only changed data', async () => {
    const dataset = buildLiveDataset({
      kolam: {
        ...seedUnifiedDataset.kolam,
        source: 'live',
        dashboardRange: 'year',
        dashboardCounts: {
          products: 12,
          rawProducts: 4,
          species: 5,
          services: 3,
        },
      },
    });
    loadUnifiedDatasetMock.mockResolvedValue(dataset);

    await expect(
      refreshUnifiedDatasetWithCache({
        cacheOwnerId: 'staff@example.test',
        preferLiveApi: true,
        enabledAreas: {pos: false, kolam: true, am: false},
        kolamDashboardRange: 'year',
      }),
    ).resolves.toMatchObject({
      dataset,
      changed: true,
      metadata: {
        key: 'unified:staff@example.test:dashboard:year',
      },
    });
    expect(loadUnifiedDatasetMock).toHaveBeenCalledWith({
      preferLiveApi: true,
      enabledAreas: {pos: false, kolam: true, am: false},
      kolamDashboardRange: 'year',
    });
  });

  it('marks cached datasets without changing the saved source object', () => {
    const dataset = buildLiveDataset();
    const cached = markUnifiedDatasetAsCache(dataset);

    expect(cached).not.toBe(dataset);
    expect(cached.kolam.source).toBe('cache');
    expect(dataset.kolam.source).toBe('live');
  });
});
