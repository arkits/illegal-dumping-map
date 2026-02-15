export type { CityId, ParkingCityId } from "./cache.sqlite";

type SqliteModule = typeof import("./cache.sqlite");

type Asyncify<T> = T extends (...args: infer A) => infer R ? (...args: A) => Promise<R> : never;

type AsyncCacheFns = {
  [K in keyof SqliteModule]: Asyncify<SqliteModule[K]>;
};

const useMemoryBackend = process.env.NODE_ENV === "test";

let sqliteModulePromise: Promise<SqliteModule> | null = null;
let memoryModulePromise: Promise<SqliteModule> | null = null;

const getBackend = () => {
  if (useMemoryBackend) {
    if (!memoryModulePromise) {
      memoryModulePromise = import("./cache.memory") as Promise<SqliteModule>;
    }
    return memoryModulePromise;
  }

  if (!sqliteModulePromise) {
    sqliteModulePromise = import("./cache.sqlite");
  }
  return sqliteModulePromise;
};

export const getRequestsCached: AsyncCacheFns["getRequestsCached"] = async (...args) =>
  (await getBackend()).getRequestsCached(...args);

export const setRequestsCached: AsyncCacheFns["setRequestsCached"] = async (...args) =>
  (await getBackend()).setRequestsCached(...args);

export const getStatsCached: AsyncCacheFns["getStatsCached"] = async (...args) =>
  (await getBackend()).getStatsCached(...args);

export const setStatsCached: AsyncCacheFns["setStatsCached"] = async (...args) =>
  (await getBackend()).setStatsCached(...args);

export const getWeeklyCached: AsyncCacheFns["getWeeklyCached"] = async (...args) =>
  (await getBackend()).getWeeklyCached(...args);

export const setWeeklyCached: AsyncCacheFns["setWeeklyCached"] = async (...args) =>
  (await getBackend()).setWeeklyCached(...args);

export const getParkingRequestsCached: AsyncCacheFns["getParkingRequestsCached"] = async (
  ...args
) => (await getBackend()).getParkingRequestsCached(...args);

export const setParkingRequestsCached: AsyncCacheFns["setParkingRequestsCached"] = async (
  ...args
) => (await getBackend()).setParkingRequestsCached(...args);

export const getParkingStatsCached: AsyncCacheFns["getParkingStatsCached"] = async (...args) =>
  (await getBackend()).getParkingStatsCached(...args);

export const setParkingStatsCached: AsyncCacheFns["setParkingStatsCached"] = async (...args) =>
  (await getBackend()).setParkingStatsCached(...args);

export const getParkingWeeklyCached: AsyncCacheFns["getParkingWeeklyCached"] = async (...args) =>
  (await getBackend()).getParkingWeeklyCached(...args);

export const setParkingWeeklyCached: AsyncCacheFns["setParkingWeeklyCached"] = async (...args) =>
  (await getBackend()).setParkingWeeklyCached(...args);
