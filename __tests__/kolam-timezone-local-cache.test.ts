import {
  createKolamTimezoneOptions,
  ensureKolamTimezoneDatabase,
  getKolamTimezoneCacheKey,
  readKolamTimezoneDatabase,
} from '../src/services/kolam-timezone-local-cache';
import {
  MemoryLocalDataStore,
  resetLocalDataStore,
  setLocalDataStore,
} from '../src/services/local-data-store';

describe('Kolam timezone local database', () => {
  beforeEach(() => {
    setLocalDataStore(new MemoryLocalDataStore());
  });

  afterEach(() => {
    resetLocalDataStore();
  });

  it('normalizes IANA timezone rows for local storage', () => {
    expect(
      createKolamTimezoneOptions([
        'Asia/Jakarta',
        'America/New_York',
        'Asia/Jakarta',
      ]),
    ).toEqual([
      {
        id: 'America/New_York',
        label: 'America/New York',
        region: 'America',
      },
      {
        id: 'Asia/Jakarta',
        label: 'Asia/Jakarta',
        region: 'Asia',
      },
    ]);
  });

  it('seeds the runtime IANA timezone database into local SQLite storage', async () => {
    const options = await ensureKolamTimezoneDatabase();
    const record = await readKolamTimezoneDatabase();

    expect(options.length).toBeGreaterThan(0);
    expect(record).toEqual(
      expect.objectContaining({
        key: getKolamTimezoneCacheKey(),
        value: options,
      }),
    );
  });
});
