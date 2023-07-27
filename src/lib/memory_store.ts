import { Database } from "bun:sqlite";

const store = new Database(":memory:");
store.run(
  "CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, value TEXT)"
);

export function cacheGet(key: string) {
  const query = store.query<{ value: string }, { $key: string }>(
    "SELECT value FROM cache WHERE key = $key"
  );
  const result = query.get({ $key: key });

  if (result) {
    store.run("DELETE FROM cache WHERE key = ?", [key]);
    return result.value;
  }
}

export function cacheSet(key: string, value: string) {
  const query = store.query<void, { $key: string; $value: string }>(
    "INSERT INTO cache (key, value) VALUES ($key, $value) ON CONFLICT (key) DO UPDATE SET value = $value"
  );

  query.run({ $key: key, $value: value });
}

export function cacheEntries() {
  const query = store.query<
    { key: string; value: string },
    Record<string, never>
  >("SELECT * FROM cache");

  return query.all({});
}

export const CHALLEGE_KEY_PREFIX = "challenge:";

export function cacheGetChallenge(key: string) {
  const challenge = cacheGet(CHALLEGE_KEY_PREFIX + key);
  if (!challenge) {
    throw new Error("No challenge found");
  }
  return challenge;
}

export function cacheSetChallenge(key: string, value: string) {
  cacheSet(`${CHALLEGE_KEY_PREFIX}${key}`, value);
}
