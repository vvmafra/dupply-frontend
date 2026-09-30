/**
 * Persisted in-memory stores for mock services.
 *
 * Mock services used to keep module-level `let` arrays, so any duplicata,
 * offer or investment created during a demo vanished on F5 or in a second
 * tab. Each store now mirrors its value to `localStorage` under a versioned
 * key and re-reads it when another tab writes the same key.
 *
 * Only mock code paths touch these stores; HTTP adapters never do.
 */

const STORAGE_PREFIX = "dupply_mock:";
const STORAGE_VERSION = "v1";

type Resettable = { reset(): void; invalidate(): void };

const registry = new Map<string, Resettable>();

function storageKey(name: string): string {
  return `${STORAGE_PREFIX}${STORAGE_VERSION}:${name}`;
}

function getStorage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

function readJson<T>(key: string): T | undefined {
  const storage = getStorage();
  if (!storage) return undefined;
  try {
    const raw = storage.getItem(key);
    return raw == null ? undefined : (JSON.parse(raw) as T);
  } catch {
    return undefined;
  }
}

function writeJson(key: string, value: unknown): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or storage blocked — keep the in-memory value only.
  }
}

function removeKey(key: string): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    // ignore
  }
}

function register(name: string, entry: Resettable): void {
  if (registry.has(name)) {
    throw new Error(`[mock-store] duplicate store name "${name}"`);
  }
  registry.set(name, entry);
}

export interface MockStore<T> {
  /** Current value (loaded from storage on first access). */
  get(): T;
  /** Replace the value and mirror it to storage. */
  set(next: T): void;
  /** Convenience for `set(fn(get()))`. */
  update(fn: (current: T) => T): T;
  /** Drop persisted data and go back to the seed. */
  reset(): void;
}

/**
 * Value store: the service owns an immutable snapshot and replaces it on
 * every write (`duplicatas = duplicatas.map(...)` style).
 */
export function createMockStore<T>(name: string, seed: () => T): MockStore<T> {
  const key = storageKey(name);
  let value: T | undefined;

  function load(): T {
    if (value === undefined) {
      value = readJson<T>(key) ?? seed();
    }
    return value;
  }

  const store: MockStore<T> = {
    get: load,
    set(next) {
      value = next;
      writeJson(key, next);
    },
    update(fn) {
      const next = fn(load());
      store.set(next);
      return next;
    },
    reset() {
      removeKey(key);
      value = seed();
    },
  };

  register(name, {
    reset: store.reset,
    invalidate: () => {
      value = undefined;
    },
  });

  return store;
}

export interface MockCollection {
  /** Apply persisted items onto the live array (no-op after the first call until invalidated). */
  hydrate(): void;
  /** Mirror the live array to storage. */
  persist(): void;
  /** Restore the seed items in place and drop persisted data. */
  reset(): void;
}

/**
 * Collection store for shared mock arrays that are mutated in place
 * (`MOCK_SELLERS`, `MOCK_INVESTOR_PROFILES`). Other modules keep importing
 * the same array reference; the service calls `hydrate()` before reading
 * and `persist()` after mutating.
 */
export function createMockCollection<T extends object>(
  name: string,
  items: T[],
  idOf: (item: T) => string,
): MockCollection {
  const key = storageKey(name);
  const seedItems = items.map((item) => ({ ...item }));
  let hydrated = false;

  const collection: MockCollection = {
    hydrate() {
      if (hydrated) return;
      hydrated = true;
      const stored = readJson<T[]>(key);
      if (!Array.isArray(stored)) return;
      for (const storedItem of stored) {
        const index = items.findIndex((item) => idOf(item) === idOf(storedItem));
        if (index >= 0) {
          Object.assign(items[index]!, storedItem);
        } else {
          items.push({ ...storedItem });
        }
      }
    },
    persist() {
      writeJson(key, items);
    },
    reset() {
      removeKey(key);
      items.splice(0, items.length, ...seedItems.map((item) => ({ ...item })));
      hydrated = true;
    },
  };

  register(name, {
    reset: collection.reset,
    invalidate: () => {
      hydrated = false;
    },
  });

  return collection;
}

/** Wipe every persisted mock store (all versions) and reseed the registered ones. */
export function resetAllMockStores(): void {
  const storage = getStorage();
  if (storage) {
    const stale: string[] = [];
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) stale.push(key);
    }
    stale.forEach(removeKey);
  }
  registry.forEach((entry) => entry.reset());
}

/** True when at least one mock store has data persisted from a previous session. */
export function hasPersistedMockData(): boolean {
  const storage = getStorage();
  if (!storage) return false;
  for (let i = 0; i < storage.length; i += 1) {
    if (storage.key(i)?.startsWith(STORAGE_PREFIX)) return true;
  }
  return false;
}

// Another tab wrote a store: drop the cached value so the next read reloads it.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (!event.key?.startsWith(STORAGE_PREFIX)) return;
    const name = event.key.slice(event.key.lastIndexOf(":") + 1);
    registry.get(name)?.invalidate();
  });
}
