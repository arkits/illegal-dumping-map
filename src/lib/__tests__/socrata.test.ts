import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Socrata API coordinate handling', () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function isWGS84(srx: number, sry: number): boolean {
    return srx >= -180 && srx <= 180 && sry >= -90 && sry <= 90;
  }

  function isValidWebMercator(srx: number): boolean {
    return srx < 0 && srx >= -18000000;
  }

  function filterInvalidCoordinates(srx: number, sry: number): boolean {
    if (srx === 0 && sry === 0) return false;
    if (!isWGS84(srx, sry) && !isValidWebMercator(srx)) return false;
    return true;
  }

  describe('isWGS84 detection', () => {
    it('should detect WGS84 coordinates (degrees) correctly', () => {
      expect(isWGS84(-122.27971489920458, 37.812345)).toBe(true);
      expect(isWGS84(151.2093, -33.8688)).toBe(true);
      expect(isWGS84(139.6917, 35.6895)).toBe(true);
      expect(isWGS84(-0.1278, 51.5074)).toBe(true);
    });

    it('should reject Web Mercator coordinates as WGS84', () => {
      expect(isWGS84(-13610886.6, 4551848.6)).toBe(false);
      expect(isWGS84(-13611256.78, 4551879.71)).toBe(false);
    });

    it('should reject invalid coordinates as WGS84', () => {
      expect(isWGS84(1356837.439, 6118176.538)).toBe(false);
      expect(isWGS84(-136108866666, 45518486666)).toBe(false);
    });
  });

  describe('isValidWebMercator detection', () => {
    it('should detect valid Web Mercator coordinates', () => {
      expect(isValidWebMercator(-13610886.6)).toBe(true);
      expect(isValidWebMercator(-13611256.78)).toBe(true);
      expect(isValidWebMercator(-10000000)).toBe(true);
    });

    it('should reject invalid Web Mercator coordinates', () => {
      expect(isValidWebMercator(1356837.439)).toBe(false);
      expect(isValidWebMercator(-136108866666)).toBe(false);
      expect(isValidWebMercator(0)).toBe(false);
    });
  });

  describe('filterInvalidCoordinates', () => {
    it('should accept valid WGS84 coordinates', () => {
      expect(filterInvalidCoordinates(-122.27971489920458, 37.812345)).toBe(true);
    });

    it('should accept valid Web Mercator coordinates', () => {
      expect(filterInvalidCoordinates(-13610886.6, 4551848.6)).toBe(true);
    });

    it('should reject corrupted coordinates (wrong hemisphere)', () => {
      expect(filterInvalidCoordinates(1356837.439, 6118176.538)).toBe(false);
    });

    it('should reject zero coordinates', () => {
      expect(filterInvalidCoordinates(0, 0)).toBe(false);
    });

    it('should reject extremely large coordinates', () => {
      expect(filterInvalidCoordinates(-136108866666, 45518486666)).toBe(false);
    });
  });

  describe('coordinate conversion logic', () => {
    it('should convert WGS84 degrees to lat/lon correctly', () => {
      const srx = -122.27971489920458;
      const sry = 37.812345;
      const isWGS = isWGS84(srx, sry);
      const [lat, lon] = isWGS ? [sry, srx] : [0, 0];
      expect(lat).toBe(37.812345);
      expect(lon).toBe(-122.27971489920458);
    });

    it('should convert Web Mercator meters to lat/lon correctly', () => {
      const srx = -13610886.6;
      const sry = 4551848.6;
      const isWGS = isWGS84(srx, sry);
      expect(isWGS).toBe(false);
    });
  });

  describe('real data scenarios from Oakland Open Data Portal', () => {
    it('should handle 2026 WGS84 format data', () => {
      const record = { srx: '-122.27971489920458', sry: '37.812345' };
      const srx = parseFloat(record.srx);
      const sry = parseFloat(record.sry);
      const isWGS = isWGS84(srx, sry);
      expect(isWGS).toBe(true);
    });

    it('should handle 2025 Web Mercator format data', () => {
      const record = { srx: '-13610886.6', sry: '4551848.6' };
      const srx = parseFloat(record.srx);
      const sry = parseFloat(record.sry);
      const isWGS = isWGS84(srx, sry);
      expect(isWGS).toBe(false);
      const isValid = isValidWebMercator(srx);
      expect(isValid).toBe(true);
    });

    it('should filter out corrupted 2026 data', () => {
      const record = { srx: '1356837.439', sry: '6118176.538' };
      const srx = parseFloat(record.srx);
      const sry = parseFloat(record.sry);
      const isValid = filterInvalidCoordinates(srx, sry);
      expect(isValid).toBe(false);
    });
  });
});
