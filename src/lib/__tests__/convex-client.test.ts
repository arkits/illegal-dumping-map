import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('convex-client', () => {
  const originalEnv = process.env.NEXT_PUBLIC_CONVEX_URL;

  beforeEach(() => {
    // Clear the module cache to allow re-importing
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    process.env.NEXT_PUBLIC_CONVEX_URL = originalEnv;
  });

  it('should throw error when NEXT_PUBLIC_CONVEX_URL is not set', async () => {
    delete process.env.NEXT_PUBLIC_CONVEX_URL;

    await expect(async () => {
      // Dynamic import to test the error
      await import('../convex-client');
    }).rejects.toThrow('NEXT_PUBLIC_CONVEX_URL environment variable is not set');
  });

  it('should create client when NEXT_PUBLIC_CONVEX_URL is set', async () => {
    process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test.convex.cloud';

    // Should not throw
    const module = await import('../convex-client');
    expect(module.convexClient).toBeDefined();
  });
});
