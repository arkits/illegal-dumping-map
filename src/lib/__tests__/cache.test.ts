import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("sqlite cache", () => {
  const originalDbPath = process.env.DATABASE_PATH;

  beforeEach(() => {
    vi.resetModules();
    process.env.DATABASE_PATH = ":memory:";
  });

  afterEach(() => {
    process.env.DATABASE_PATH = originalDbPath;
  });

  it("stores and retrieves request cache entries", async () => {
    const { getRequestsCached, setRequestsCached } = await import("../cache");

    const params = {
      cityId: "oakland",
      year: 2024,
      limit: 100,
      offset: 0,
      radius: 1.5,
      centerLat: 37.8,
      centerLon: -122.3,
    } as const;

    await expect(getRequestsCached(params)).resolves.toBeNull();

    const payload = [{ id: "1", status: "OPEN" }];
    await setRequestsCached({ ...params, data: payload, ttlMs: 1000 });

    await expect(getRequestsCached<typeof payload>(params)).resolves.toEqual(payload);
  });

  it("expires cache entries when ttl has passed", async () => {
    const { getStatsCached, setStatsCached } = await import("../cache");

    const params = {
      cityId: "oakland",
      year: 2024,
      compareYear: 2023,
    } as const;

    await setStatsCached({ ...params, data: { total: 1 }, ttlMs: -1 });

    await expect(getStatsCached<{ total: number }>(params)).resolves.toBeNull();
  });
});
