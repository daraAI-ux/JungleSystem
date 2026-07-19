import {
  createDefaultLocalDataStore,
  MemoryLocalDataStore,
  NativeSQLiteLocalDataStore,
  type NativeLocalDataBridge,
} from '../src/services/local-data-store';

function createBridgeMock(
  initialRecords: Record<string, string | null> = {},
): NativeLocalDataBridge & {
  records: Record<string, string | null>;
} {
  return {
    records: {...initialRecords},
    async readRecord(key: string) {
      return this.records[key] ?? null;
    },
    async writeRecord(key: string, payload: string) {
      this.records[key] = payload;
    },
    async removeRecord(key: string) {
      delete this.records[key];
    },
  };
}

describe('local data store engines', () => {
  it('uses memory when a native SQLite bridge is not available', () => {
    expect(createDefaultLocalDataStore(null)).toBeInstanceOf(MemoryLocalDataStore);
  });

  it('round-trips records through the native SQLite bridge adapter', async () => {
    const bridge = createBridgeMock();
    const store = new NativeSQLiteLocalDataStore(bridge);

    await store.write({
      key: 'unified:staff@example.test:dashboard:month',
      value: {counts: {products: 12}},
      revision: 'rev-1',
      updatedAt: '2026-07-19T10:00:00.000Z',
    });

    await expect(
      store.read<{counts: {products: number}}>(
        'unified:staff@example.test:dashboard:month',
      ),
    ).resolves.toEqual({
      key: 'unified:staff@example.test:dashboard:month',
      value: {counts: {products: 12}},
      revision: 'rev-1',
      updatedAt: '2026-07-19T10:00:00.000Z',
      engine: 'sqlite-native',
    });
  });

  it('treats malformed native payloads as cache misses', async () => {
    const bridge = createBridgeMock({
      broken: '{not-json',
      wrong: JSON.stringify({
        key: 'other',
        value: {},
        revision: 'rev',
        updatedAt: '2026-07-19T10:00:00.000Z',
      }),
    });
    const store = new NativeSQLiteLocalDataStore(bridge);

    await expect(store.read('broken')).resolves.toBeNull();
    await expect(store.read('wrong')).resolves.toBeNull();
  });

  it('removes records through the native bridge', async () => {
    const bridge = createBridgeMock({
      key: JSON.stringify({
        key: 'key',
        value: {ok: true},
        revision: 'rev',
        updatedAt: '2026-07-19T10:00:00.000Z',
      }),
    });
    const store = new NativeSQLiteLocalDataStore(bridge);

    await store.remove('key');

    await expect(store.read('key')).resolves.toBeNull();
  });
});
