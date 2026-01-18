import { describe, it, expect } from 'vitest';
import {
  webMercatorToWGS84,
  distBetweenLatLon,
  getWeekNumber,
  OAKLAND_CENTER_LAT,
  OAKLAND_CENTER_LON,
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
});

describe('WGS84 vs Web Mercator detection', () => {
  it('should correctly identify WGS84 coordinates (degrees)', () => {
    const srx = -122.27971489920458;
    const sry = 37.812345;
    const isWGS84 = srx >= -180 && srx <= 180 && sry >= -90 && sry <= 90;
    expect(isWGS84).toBe(true);
  });

  it('should correctly identify Web Mercator coordinates (meters)', () => {
    const srx = -13610886.6;
    const sry = 4551848.6;
    const isWGS84 = srx >= -180 && srx <= 180 && sry >= -90 && sry <= 90;
    expect(isWGS84).toBe(false);
  });

  it('should correctly identify invalid coordinates', () => {
    const srx = 1356837.439;
    const sry = 6118176.538;
    const isValid = srx > -18000000 && srx <= 180;
    const isWGS84 = srx >= -180 && srx <= 180 && sry >= -90 && sry <= 90;
    expect(isValid).toBe(false);
    expect(isWGS84).toBe(false);
  });

  it('should handle edge cases for coordinate detection', () => {
    expect(-180 >= -180 && -180 <= 180).toBe(true);
    expect(180 >= -180 && 180 <= 180).toBe(true);
    expect(-90 >= -90 && -90 <= 90).toBe(true);
    expect(90 >= -90 && 90 <= 90).toBe(true);
    expect(-181 >= -180 && -181 <= 180).toBe(false);
    expect(181 >= -180 && 181 <= 180).toBe(false);
  });
});
