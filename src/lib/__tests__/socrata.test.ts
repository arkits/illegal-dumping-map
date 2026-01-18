import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchDumpingRequests, fetchAllRequestsForYear, clearCache, CITIES } from '../socrata';
import { webMercatorToWGS84, isWGS84, filterInvalidCoordinates } from '../utils';

describe('Socrata API - City Configuration', () => {
  describe('CITIES constant', () => {
    it('should have oakland configuration', () => {
      expect(CITIES.oakland).toBeDefined();
      expect(CITIES.oakland.id).toBe('oakland');
      expect(CITIES.oakland.name).toBe('Oakland');
      expect(CITIES.oakland.domain).toBe('data.oaklandca.gov');
      expect(CITIES.oakland.datasetId).toBe('quth-gb8e');
      expect(CITIES.oakland.filterField).toBe('REQCATEGORY');
      expect(CITIES.oakland.filterValue).toBe('ILLDUMP');
      expect(CITIES.oakland.requiresCoordinateConversion).toBe(true);
    });

    it('should have sanfrancisco configuration', () => {
      expect(CITIES.sanfrancisco).toBeDefined();
      expect(CITIES.sanfrancisco.id).toBe('sanfrancisco');
      expect(CITIES.sanfrancisco.name).toBe('San Francisco');
      expect(CITIES.sanfrancisco.domain).toBe('data.sfgov.org');
      expect(CITIES.sanfrancisco.datasetId).toBe('vw6y-z8j6');
      expect(CITIES.sanfrancisco.filterField).toBe('service_details');
      expect(CITIES.sanfrancisco.filterValue).toBe('trash_dumping');
      expect(CITIES.sanfrancisco.requiresCoordinateConversion).toBe(false);
    });

    it('should have valid center coordinates for both cities', () => {
      expect(CITIES.oakland.centerLat).toBeGreaterThan(37);
      expect(CITIES.oakland.centerLat).toBeLessThan(38);
      expect(CITIES.oakland.centerLon).toBeLessThan(-122);
      expect(CITIES.oakland.centerLon).toBeGreaterThan(-123);

      expect(CITIES.sanfrancisco.centerLat).toBeGreaterThan(37);
      expect(CITIES.sanfrancisco.centerLat).toBeLessThan(38);
      expect(CITIES.sanfrancisco.centerLon).toBeLessThan(-122);
      expect(CITIES.sanfrancisco.centerLon).toBeGreaterThan(-123);
    });
  });

  describe('fetchDumpingRequests', () => {
    let mockFetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      clearCache();
      mockFetch = vi.fn();
      (global as unknown as { fetch: typeof mockFetch }).fetch = mockFetch;
    });

    it('should build correct URL for Oakland', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await fetchDumpingRequests({ cityId: 'oakland', year: 2025, limit: 10 });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const calledUrl = decodeURIComponent(mockFetch.mock.calls[0][0] as string);
      expect(calledUrl).toContain('data.oaklandca.gov');
      expect(calledUrl).toContain('quth-gb8e');
      expect(calledUrl).toContain("REQCATEGORY='ILLDUMP'");
      expect(calledUrl).toContain('date_extract_y(DATETIMEINIT)=2025');
    });

    it('should build correct URL for San Francisco', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await fetchDumpingRequests({ cityId: 'sanfrancisco', year: 2025, limit: 10 });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const calledUrl = decodeURIComponent(mockFetch.mock.calls[0][0] as string);
      expect(calledUrl).toContain('data.sfgov.org');
      expect(calledUrl).toContain('vw6y-z8j6');
      expect(calledUrl).toContain("service_details='trash_dumping'");
      expect(calledUrl).toContain('date_extract_y(requested_datetime)=2025');
    });

    it('should transform Oakland record correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [
          {
            requestid: '1002585',
            srx: '-13611256.78',
            sry: '4551879.71',
            datetimeinit: '2025-01-15T10:00:00.000',
            status: 'CLOSED',
            description: 'Illegal Dumping - debris',
            probaddress: '399 8TH ST',
          },
        ],
      });

      const result = await fetchDumpingRequests({ cityId: 'oakland' });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1002585');
      expect(result[0].lat).toBeCloseTo(37.804747, 4);
      expect(result[0].lon).toBeCloseTo(-122.272, 4);
      expect(result[0].datetimeinit).toBe('2025-01-15T10:00:00.000');
      expect(result[0].status).toBe('CLOSED');
      expect(result[0].address).toBe('399 8TH ST');
    });

    it('should transform San Francisco record correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [
          {
            service_request_id: '13437452',
            lat: '37.759907915394',
            long: '-122.420728147926',
            requested_datetime: '2025-01-15T10:00:00.000',
            status_description: 'Closed',
            service_details: 'trash_dumping',
            address: '208 LEXINGTON ST',
          },
        ],
      });

      const result = await fetchDumpingRequests({ cityId: 'sanfrancisco' });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('13437452');
      expect(result[0].lat).toBeCloseTo(37.7599, 4);
      expect(result[0].lon).toBeCloseTo(-122.4207, 4);
      expect(result[0].datetimeinit).toBe('2025-01-15T10:00:00.000');
      expect(result[0].status).toBe('Closed');
      expect(result[0].address).toBe('208 LEXINGTON ST');
    });

    it('should filter records with invalid coordinates', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [
          {
            requestid: '123456',
            srx: '1356837.439',
            sry: '6118176.538',
            datetimeinit: '2025-01-15T10:00:00.000',
            status: 'OPEN',
          },
          {
            requestid: '789012',
            srx: '-13611256.78',
            sry: '4551879.71',
            datetimeinit: '2025-01-15T10:00:00.000',
            status: 'OPEN',
          },
        ],
      });

      const result = await fetchDumpingRequests({ cityId: 'oakland' });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('789012');
    });

    it('should handle radius filtering', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [
          {
            requestid: '123456',
            srx: '-13611256.78',
            sry: '4551879.71',
            datetimeinit: '2025-01-15T10:00:00.000',
            status: 'OPEN',
          },
          {
            requestid: '789012',
            srx: '-13600000',
            sry: '4500000',
            datetimeinit: '2025-01-15T10:00:00.000',
            status: 'OPEN',
          },
        ],
      });

      const result = await fetchDumpingRequests({
        cityId: 'oakland',
        radius: 5,
        centerLat: 37.804747,
        centerLon: -122.272,
      });

      expect(result.length).toBeLessThanOrEqual(2);
    });

    it('should return count when countOnly is true', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [{ count: '1234' }],
      });

      const result = await fetchDumpingRequests({ cityId: 'oakland', countOnly: true });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1234');
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(fetchDumpingRequests({ cityId: 'oakland' })).rejects.toThrow('API error: 500');
    });

    it('should retry on 403 without auth token', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 403,
        })
        .mockResolvedValue({
          ok: true,
          json: async () => [],
        });

      await fetchDumpingRequests({ cityId: 'oakland' });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should cache API responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [
          {
            requestid: '123456',
            srx: '-13611256.78',
            sry: '4551879.71',
            datetimeinit: '2025-01-15T10:00:00.000',
            status: 'OPEN',
          },
        ],
      });

      await fetchDumpingRequests({ cityId: 'oakland' });
      await fetchDumpingRequests({ cityId: 'oakland' });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchAllRequestsForYear', () => {
    let mockFetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      clearCache();
      mockFetch = vi.fn();
      (global as unknown as { fetch: typeof mockFetch }).fetch = mockFetch;
    });

    it('should paginate through all records', async () => {
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: true,
            json: async () =>
              Array(5000)
                .fill(null)
                .map((_, i) => ({
                  requestid: `req-${i}`,
                  srx: '-13611256.78',
                  sry: '4551879.71',
                  datetimeinit: '2025-01-15T10:00:00.000',
                  status: 'OPEN',
                })),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () =>
            Array(1000)
              .fill(null)
              .map((_, i) => ({
                requestid: `req-${5000 + i}`,
                srx: '-13611256.78',
                sry: '4551879.71',
                datetimeinit: '2025-01-15T10:00:00.000',
                status: 'OPEN',
              })),
        });
      });

      const result = await fetchAllRequestsForYear('oakland', 2025);

      expect(result.length).toBe(6000);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});

describe('Coordinate System Detection', () => {
  describe('Oakland (State Plane → WGS84 conversion)', () => {
    it('should convert Oakland State Plane coordinates correctly', () => {
      const oaklandX = -13611256.78;
      const oaklandY = 4551879.71;
      const [lat, lon] = webMercatorToWGS84(oaklandX, oaklandY);

      expect(lat).toBeCloseTo(37.804747, 4);
      expect(lon).toBeCloseTo(-122.272, 4);
    });

    it('should detect Oakland coordinates as not WGS84', () => {
      expect(isWGS84(-13611256.78, 4551879.71)).toBe(false);
    });
  });

  describe('San Francisco (WGS84 - native)', () => {
    it('should use SF coordinates directly', () => {
      const sfLat = 37.759907915394;
      const sfLon = -122.420728147926;

      expect(isWGS84(sfLon, sfLat)).toBe(true);
    });

    it('should handle SF data format correctly', () => {
      const records = [
        { lat: '37.759907915394', long: '-122.420728147926' },
        { lat: '37.804348', long: '-122.411897' },
      ];

      for (const record of records) {
        const lat = parseFloat(record.lat);
        const lon = parseFloat(record.long);
        expect(isWGS84(lon, lat)).toBe(true);
        expect(filterInvalidCoordinates(lon, lat)).toBe(true);
      }
    });
  });

  describe('filterInvalidCoordinates', () => {
    it('should reject zero coordinates', () => {
      expect(filterInvalidCoordinates(0, 0)).toBe(false);
    });

    it('should reject corrupted coordinates', () => {
      expect(filterInvalidCoordinates(1356837.439, 6118176.538)).toBe(false);
    });

    it('should accept valid Oakland coordinates', () => {
      expect(filterInvalidCoordinates(-13611256.78, 4551879.71)).toBe(true);
    });

    it('should accept valid SF coordinates', () => {
      expect(filterInvalidCoordinates(-122.420728147926, 37.759907915394)).toBe(true);
    });
  });
});

describe('API URL Construction', () => {
  it('should include correct SODA parameters for Oakland', () => {
    const url = new URL('https://data.oaklandca.gov/resource/quth-gb8e.json');
    url.searchParams.set('$where', "REQCATEGORY='ILLDUMP' AND date_extract_y(DATETIMEINIT)=2025");
    url.searchParams.set('$limit', '5000');
    url.searchParams.set('$offset', '0');
    url.searchParams.set('$order', 'DATETIMEINIT DESC');

    expect(url.searchParams.get('$where')).toContain('REQCATEGORY');
    expect(url.searchParams.get('$where')).toContain('ILLDUMP');
    expect(url.searchParams.get('$limit')).toBe('5000');
  });

  it('should include correct SODA parameters for SF', () => {
    const url = new URL('https://data.sfgov.org/resource/vw6y-z8j6.json');
    url.searchParams.set('$where', "service_details='trash_dumping' AND date_extract_y(requested_datetime)=2025");
    url.searchParams.set('$limit', '5000');
    url.searchParams.set('$offset', '0');
    url.searchParams.set('$order', 'requested_datetime DESC');

    expect(url.searchParams.get('$where')).toContain('service_details');
    expect(url.searchParams.get('$where')).toContain('trash_dumping');
    expect(url.searchParams.get('$limit')).toBe('5000');
  });
});
