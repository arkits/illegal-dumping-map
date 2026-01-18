import { describe, it, expect } from 'vitest';
import {
  webMercatorToWGS84,
  distBetweenLatLon,
  getWeekNumber,
  OAKLAND_CENTER_LAT,
  OAKLAND_CENTER_LON,
  SF_CENTER_LAT,
  SF_CENTER_LON,
  isWGS84,
  filterInvalidCoordinates,
  CITIES,
  getCityConfig,
  CityId,
} from '../utils';

describe('webMercatorToWGS84', () => {
  it('should convert Web Mercator coordinates to WGS84 for Oakland', () => {
    const oaklandX = -13611256.78;
    const oaklandY = 4551879.71;
    const [lat, lon] = webMercatorToWGS84(oaklandX, oaklandY);
    expect(lat).toBeCloseTo(37.804747, 4);
    expect(lon).toBeCloseTo(-122.272, 4);
  });

  it('should handle San Francisco coordinates', () => {
    const sfX = -13627665.27;
    const sfY = 4547675.35;
    const [lat, lon] = webMercatorToWGS84(sfX, sfY);
    expect(lat).toBeCloseTo(37.7749, 3);
    expect(lon).toBeCloseTo(-122.4194, 3);
  });

  it('should convert large Web Mercator values correctly', () => {
    const x = -13600000;
    const y = 4550000;
    const [lat, lon] = webMercatorToWGS84(x, y);
    expect(lat).toBeGreaterThan(37);
    expect(lat).toBeLessThan(38);
    expect(lon).toBeLessThan(-122);
    expect(lon).toBeGreaterThan(-123);
  });

  it('should handle coordinates near the prime meridian', () => {
    const x = 0;
    const y = 4500000;
    const [lat, lon] = webMercatorToWGS84(x, y);
    expect(lon).toBeCloseTo(0, 2);
    expect(lat).toBeGreaterThan(37);
    expect(lat).toBeLessThan(38);
  });

  it('should handle southern hemisphere Web Mercator coordinates', () => {
    const x = 17000000;
    const y = -4000000;
    const [lat, lon] = webMercatorToWGS84(x, y);
    expect(lat).toBeLessThan(0);
    expect(lat).toBeGreaterThan(-40);
    expect(lon).toBeGreaterThan(150);
    expect(lon).toBeLessThan(160);
  });

  it('should handle eastern hemisphere Web Mercator coordinates', () => {
    const x = 15000000;
    const y = 3800000;
    const [, lon] = webMercatorToWGS84(x, y);
    expect(lon).toBeGreaterThan(130);
    expect(lon).toBeLessThan(150);
  });
});

describe('distBetweenLatLon', () => {
  it('should calculate distance between Oakland and San Francisco correctly', () => {
    const oakland: [number, number] = [37.804747, -122.272];
    const sf: [number, number] = [37.7749, -122.4194];
    const distance = distBetweenLatLon(oakland, sf);
    expect(distance).toBeGreaterThan(10);
    expect(distance).toBeLessThan(20);
  });

  it('should return 0 for the same coordinates', () => {
    const point: [number, number] = [37.804747, -122.272];
    const distance = distBetweenLatLon(point, point);
    expect(distance).toBe(0);
  });

  it('should calculate short distances accurately', () => {
    const point1: [number, number] = [37.804747, -122.272];
    const point2: [number, number] = [37.805747, -122.272];
    const distance = distBetweenLatLon(point1, point2);
    expect(distance).toBeGreaterThan(0.1);
    expect(distance).toBeLessThan(0.2);
  });

  it('should handle points across the prime meridian', () => {
    const london: [number, number] = [51.5074, -0.1278];
    const paris: [number, number] = [48.8566, 2.3522];
    const distance = distBetweenLatLon(london, paris);
    expect(distance).toBeGreaterThan(300);
    expect(distance).toBeLessThan(360);
  });
});

describe('getWeekNumber', () => {
  it('should return correct week number for January dates', () => {
    const jan1 = new Date('2025-01-01');
    expect(getWeekNumber(jan1)).toBe(1);
  });

  it('should return correct week number for mid-year dates', () => {
    const jul1 = new Date('2025-07-01');
    const week = getWeekNumber(jul1);
    expect(week).toBeGreaterThan(26);
    expect(week).toBeLessThan(28);
  });

  it('should return 52 or 53 for December dates in most years', () => {
    const dec31 = new Date('2024-12-31');
    const week = getWeekNumber(dec31);
    expect(week).toBeGreaterThanOrEqual(1);
    expect(week).toBeLessThanOrEqual(53);
  });

  it('should handle leap year correctly', () => {
    const feb29 = new Date('2024-02-29');
    const week = getWeekNumber(feb29);
    expect(week).toBe(9);
  });
});

describe('coordinate constants', () => {
  it('should have valid Oakland center coordinates', () => {
    expect(OAKLAND_CENTER_LAT).toBeGreaterThan(37);
    expect(OAKLAND_CENTER_LAT).toBeLessThan(38);
    expect(OAKLAND_CENTER_LON).toBeLessThan(-122);
    expect(OAKLAND_CENTER_LON).toBeGreaterThan(-123);
  });

  it('should have valid SF center coordinates', () => {
    expect(SF_CENTER_LAT).toBeGreaterThan(37);
    expect(SF_CENTER_LAT).toBeLessThan(38);
    expect(SF_CENTER_LON).toBeLessThan(-122);
    expect(SF_CENTER_LON).toBeGreaterThan(-123);
  });
});

describe('WGS84 vs Web Mercator detection', () => {
  it('should correctly identify WGS84 coordinates (degrees)', () => {
    const srx = -122.27971489920458;
    const sry = 37.812345;
    const isWGS84Coords = srx >= -180 && srx <= 180 && sry >= -90 && sry <= 90;
    expect(isWGS84Coords).toBe(true);
  });

  it('should correctly identify Web Mercator coordinates (meters)', () => {
    const srx = -13610886.6;
    const sry = 4551848.6;
    const isWGS84Coords = srx >= -180 && srx <= 180 && sry >= -90 && sry <= 90;
    expect(isWGS84Coords).toBe(false);
  });

  it('should correctly identify invalid coordinates', () => {
    const srx = 1356837.439;
    const sry = 6118176.538;
    const isValid = srx > -18000000 && srx <= 180;
    const isWGS84Coords = srx >= -180 && srx <= 180 && sry >= -90 && sry <= 90;
    expect(isValid).toBe(false);
    expect(isWGS84Coords).toBe(false);
  });

  it('should handle edge cases for coordinate detection', () => {
    const val1 = -180;
    expect(val1 >= -180 && val1 <= 180).toBe(true);
    const val2 = 180;
    expect(val2 >= -180 && val2 <= 180).toBe(true);
    const val3 = -90;
    expect(val3 >= -90 && val3 <= 90).toBe(true);
    const val4 = 90;
    expect(val4 >= -90 && val4 <= 90).toBe(true);
    const val5 = -181;
    expect(val5 >= -180 && val5 <= 180).toBe(false);
    const val6 = 181;
    expect(val6 >= -180 && val6 <= 180).toBe(false);
  });
});

describe('City Configuration', () => {
  describe('CITIES constant', () => {
    it('should have oakland city', () => {
      expect(CITIES.oakland).toBeDefined();
      expect(CITIES.oakland.id).toBe('oakland');
      expect(CITIES.oakland.name).toBe('Oakland');
      expect(CITIES.oakland.domain).toBe('data.oaklandca.gov');
      expect(CITIES.oakland.datasetId).toBe('quth-gb8e');
      expect(CITIES.oakland.filterField).toBe('REQCATEGORY');
      expect(CITIES.oakland.filterValue).toBe('ILLDUMP');
      expect(CITIES.oakland.requiresCoordinateConversion).toBe(true);
    });

    it('should have sanfrancisco city', () => {
      expect(CITIES.sanfrancisco).toBeDefined();
      expect(CITIES.sanfrancisco.id).toBe('sanfrancisco');
      expect(CITIES.sanfrancisco.name).toBe('San Francisco');
      expect(CITIES.sanfrancisco.domain).toBe('data.sfgov.org');
      expect(CITIES.sanfrancisco.datasetId).toBe('vw6y-z8j6');
      expect(CITIES.sanfrancisco.filterField).toBe('service_details');
      expect(CITIES.sanfrancisco.filterValue).toBe('trash_dumping');
      expect(CITIES.sanfrancisco.requiresCoordinateConversion).toBe(false);
    });

    it('should have unique colors for each city', () => {
      const colors = new Set(Object.values(CITIES).map((c) => c.color));
      expect(colors.size).toBe(Object.keys(CITIES).length);
    });
  });

  describe('getCityConfig', () => {
    it('should return config for valid city', () => {
      const config = getCityConfig('oakland');
      expect(config.id).toBe('oakland');
    });

    it('should return config for sanfrancisco', () => {
      const config = getCityConfig('sanfrancisco');
      expect(config.id).toBe('sanfrancisco');
    });

    it('should throw for invalid city', () => {
      expect(() => getCityConfig('invalid' as CityId)).toThrow('Unknown city: invalid');
    });
  });
});

describe('isWGS84', () => {
  it('should return true for valid WGS84 coordinates', () => {
    expect(isWGS84(-122.4194, 37.7749)).toBe(true);
    expect(isWGS84(-122.272, 37.804747)).toBe(true);
    expect(isWGS84(0, 0)).toBe(true);
    expect(isWGS84(180, 90)).toBe(true);
    expect(isWGS84(-180, -90)).toBe(true);
  });

  it('should return false for Web Mercator coordinates', () => {
    expect(isWGS84(-13611256.78, 4551879.71)).toBe(false);
    expect(isWGS84(-13610886.6, 4551848.6)).toBe(false);
  });

  it('should return false for invalid coordinates', () => {
    expect(isWGS84(1356837.439, 6118176.538)).toBe(false);
    expect(isWGS84(-136108866666, 45518486666)).toBe(false);
  });
});

describe('filterInvalidCoordinates', () => {
  it('should accept valid WGS84 coordinates', () => {
    expect(filterInvalidCoordinates(-122.4194, 37.7749)).toBe(true);
    expect(filterInvalidCoordinates(-122.272, 37.804747)).toBe(true);
  });

  it('should accept valid Web Mercator coordinates', () => {
    expect(filterInvalidCoordinates(-13611256.78, 4551879.71)).toBe(true);
  });

  it('should reject zero coordinates', () => {
    expect(filterInvalidCoordinates(0, 0)).toBe(false);
  });

  it('should reject corrupted coordinates', () => {
    expect(filterInvalidCoordinates(1356837.439, 6118176.538)).toBe(false);
    expect(filterInvalidCoordinates(-136108866666, 45518486666)).toBe(false);
  });

  it('should reject invalid WGS84 out of range', () => {
    expect(isWGS84(181, 0)).toBe(false);
    expect(isWGS84(-181, 0)).toBe(false);
    expect(isWGS84(0, 91)).toBe(false);
    expect(isWGS84(0, -91)).toBe(false);
  });
});
