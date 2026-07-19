import {NativeModules} from 'react-native';

export type LocalDataEngine = 'memory' | 'sqlite-native';

export interface LocalDataRecord<T> {
  key: string;
  value: T;
  revision: string;
  updatedAt: string;
  engine: LocalDataEngine;
}

export interface LocalDataStore {
  engine: LocalDataEngine;
  read<T>(key: string): Promise<LocalDataRecord<T> | null>;
  write<T>(record: Omit<LocalDataRecord<T>, 'engine'>): Promise<void>;
  remove(key: string): Promise<void>;
}

export interface NativeLocalDataBridge {
  readRecord(key: string): string | null | Promise<string | null>;
  writeRecord(key: string, payload: string): void | boolean | Promise<void | boolean>;
  removeRecord(key: string): void | boolean | Promise<void | boolean>;
}

export class MemoryLocalDataStore implements LocalDataStore {
  engine: LocalDataEngine = 'memory';
  private records = new Map<string, LocalDataRecord<unknown>>();

  async read<T>(key: string): Promise<LocalDataRecord<T> | null> {
    return (this.records.get(key) as LocalDataRecord<T> | undefined) ?? null;
  }

  async write<T>(record: Omit<LocalDataRecord<T>, 'engine'>): Promise<void> {
    this.records.set(record.key, {
      ...record,
      engine: this.engine,
    });
  }

  async remove(key: string): Promise<void> {
    this.records.delete(key);
  }

  clear() {
    this.records.clear();
  }
}

export class NativeSQLiteLocalDataStore implements LocalDataStore {
  engine: LocalDataEngine = 'sqlite-native';

  constructor(private readonly bridge: NativeLocalDataBridge) {}

  async read<T>(key: string): Promise<LocalDataRecord<T> | null> {
    const payload = await this.bridge.readRecord(key);

    if (!payload) {
      return null;
    }

    const parsed = parseNativeRecord<T>(payload);

    if (!parsed || parsed.key !== key) {
      return null;
    }

    return {
      ...parsed,
      engine: this.engine,
    };
  }

  async write<T>(record: Omit<LocalDataRecord<T>, 'engine'>): Promise<void> {
    await this.bridge.writeRecord(record.key, JSON.stringify(record));
  }

  async remove(key: string): Promise<void> {
    await this.bridge.removeRecord(key);
  }
}

let activeLocalDataStore: LocalDataStore = createDefaultLocalDataStore();

export function getLocalDataStore(): LocalDataStore {
  return activeLocalDataStore;
}

export function setLocalDataStore(store: LocalDataStore) {
  activeLocalDataStore = store;
}

export function resetLocalDataStore() {
  activeLocalDataStore = createDefaultLocalDataStore();
}

export function createDefaultLocalDataStore(
  bridge = getNativeLocalDataBridge(),
): LocalDataStore {
  return bridge
    ? new NativeSQLiteLocalDataStore(bridge)
    : new MemoryLocalDataStore();
}

function getNativeLocalDataBridge(): NativeLocalDataBridge | null {
  const bridge = NativeModules.KolamWindowsSQLiteStore as
    | NativeLocalDataBridge
    | undefined;

  if (
    bridge &&
    typeof bridge.readRecord === 'function' &&
    typeof bridge.writeRecord === 'function' &&
    typeof bridge.removeRecord === 'function'
  ) {
    return bridge;
  }

  return null;
}

function parseNativeRecord<T>(
  payload: string,
): Omit<LocalDataRecord<T>, 'engine'> | null {
  try {
    const parsed = JSON.parse(payload) as Partial<LocalDataRecord<T>>;

    if (
      typeof parsed.key !== 'string' ||
      typeof parsed.revision !== 'string' ||
      typeof parsed.updatedAt !== 'string' ||
      !Object.prototype.hasOwnProperty.call(parsed, 'value')
    ) {
      return null;
    }

    return {
      key: parsed.key,
      value: parsed.value as T,
      revision: parsed.revision,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}
