# Oakland 311 Socrata API Documentation

## Overview

The City of Oakland provides public access to 311 service request data through the Socrata Open Data API (SODA). This dataset contains service requests received by the Oakland Call Center (OAK 311), including illegal dumping reports.

**Dataset ID**: `quth-gb8e`  
**Dataset Name**: Service requests received by the Oakland Call Center (OAK 311)  
**Base URL**: `https://data.oaklandca.gov/resource/quth-gb8e.json`  
**Publisher**: City of Oakland Public Works / Department of Transportation  
**License**: Public Domain

---

## API Endpoint

### Base URL
```
https://data.oaklandca.gov/resource/quth-gb8e.json
```

### API Version
This uses Socrata SODA 2.0 API.

---

## Available Fields

| Field Name | Type | Description |
|------------|------|-------------|
| `requestid` | number | The service request number. 5-digit IDs were imported from Recycling Hotline's prior system (pre-Aug 2012). All others are 6 digits. |
| `datetimeinit` | calendar_date | The date and time the request was initiated. Format: `YYYY-MM-DDTHH:MM:SS.sss` |
| `source` | text | How the request was received: SeeClickFix, OAK 311 mobile app, Report A Problem website, or Phone/Email |
| `description` | text | Type of issue. Self-explanatory descriptions with special codes (e.g., "TE" = Traffic Engineering) |
| `reqcategory` | text | Request category (e.g., "ILLDUMP" for illegal dumping, "RECYCLING", "GRAFFITI", etc.) |
| `reqaddress` | location | Request address (raw location field) |
| `probaddress` | text | Problem address. "ZZ" indicates address was not recorded (often for general inquiries) |
| `city` | text | City name (typically "Oakland") |
| `state` | text | State abbreviation (typically "CA") |
| `status` | text | Current status of the request |
| `datetimeclosed` | calendar_date | Date and time the request was closed |
| `srx` | number | X coordinate in NAD_1983_StatePlane_California_III_FIPS_0403_Feet (not lat/lon) |
| `sry` | number | Y coordinate in NAD_1983_StatePlane_California_III_FIPS_0403_Feet (not lat/lon) |
| `referredto` | text | Entity the request was referred to (if status = REFERRED) |
| `councildistrict` | text | City Council District of the request address |
| `beat` | text | Police Beat of the request address |
| `zipcode` | text | ZIP code of the request |

---

## Request Categories

Full list of available `reqcategory` values:

- `ABANDONED AUTO`
- `BLDGMAINT`
- `CUT_CLEAN`
- `CW_DIT_GIS`
- `DRAINAGE`
- `ELECTRICAL`
- `ENVIRON_ENF`
- `FACILITIES`
- `FIRE`
- `GRAFFITI`
- `HE_CLEAN`
- `HOMELESS EMT`
- `ILLDUMP` (Illegal Dumping - **primary category for this project**)
- `KOCB`
- `LAB`
- `METER_REPAIR`
- `OTHER`
- `PARKING`
- `PARKS`
- `POLICE`
- `RECYCLING`
- `ROW` (Right of Way)
- `ROW_INSPECTORS`
- `ROW_STREETSW`
- `SEWERS`
- `SIDESHOWS`
- `STREETSW`
- `SURVEY`
- `TRAFFIC`
- `TRAFFIC_ENGIN`
- `TREES`
- `VEGCONTR`
- `WATERSHED`

---

## Status Values

| Status | Description |
|--------|-------------|
| `PENDING` | Request received for review |
| `OPEN` | Request assigned to work unit |
| `WOCREATE` | Work Order created (not all work units use this status) |
| `CLOSED` | Request is resolved |
| `REFERRED` | Forwarded to another entity (see `referredto` field) |
| `UNFUNDED` | Service not funded by City |
| `CANCEL` / `Cancel` | Canceled (erroneous, testing, or duplicate) |
| `WAITING ON CUSTOMER` | Awaiting customer information |
| `EVALUATED - NO FURTHER ACTION` | Staff determined no further action needed |
| `GONE ON ARRIVAL` | Staff unable to verify issue on-site |
| `REQUEST COMPLETE` | Request fulfilled |

---

## Coordinate System

**Important**: The `srx` and `sry` fields use **NAD_1983_StatePlane_California_III_FIPS_0403_Feet** (a projected coordinate system in feet), NOT latitude/longitude (WGS84).

### Converting to WGS84 (Lat/Lon)

The coordinates must be converted to WGS84 for use with mapping libraries like Leaflet or Google Maps.

**Web Mercator to WGS84 Conversion Formula:**

```typescript
function webMercatorToWGS84(srx: number, sry: number): [number, number] {
  const x = srx;
  const y = sry;
  const earthRadius = 6378137; // meters
  const halfEarthCircumference = Math.PI * earthRadius;

  const lon = (x / halfEarthCircumference) * 180;
  const lat = (y / halfEarthCircumference) * 180;
  const latRad = (Math.PI / 4) * Math.atan(Math.exp((y / halfEarthCircumference) * 360) * Math.PI / 180);
  const latDeg = (2 * Math.atan(Math.exp(latRad)) - Math.PI / 2) * (180 / Math.PI);

  return [latDeg, lon];
}
```

### Detecting Coordinate Format

Sometimes the API returns coordinates already in WGS84. Check if values are within valid WGS84 ranges:
- Latitude: -90 to 90
- Longitude: -180 to 180

```typescript
const isWGS84 = srx >= -180 && srx <= 180 && sry >= -90 && sry <= 90;
const [lat, lon] = isWGS84 ? [sry, srx] : webMercatorToWGS84(srx, sry);
```

---

## Filtering Examples

### Filter by Request Category (Illegal Dumping)
```url
https://data.oaklandca.gov/resource/quth-gb8e.json?$where=REQCATEGORY='ILLDUMP'
```

### Filter by Year
```url
https://data.oaklandca.gov/resource/quth-gb8e.json?$where=REQCATEGORY='ILLDUMP' AND date_extract_y(DATETIMEINIT)=2025
```

### Pagination
```url
https://data.oaklandca.gov/resource/quth-gb8e.json?$limit=1000&$offset=0
```

### Ordering
```url
https://data.oaklandca.gov/resource/quth-gb8e.json?$order=DATETIMEINIT DESC
```

### Combined Query
```url
https://data.oaklandca.gov/resource/quth-gb8e.json?$where=REQCATEGORY='ILLDUMP'&$limit=100&$order=DATETIMEINIT DESC
```

---

## Data Statistics

- **Total Records**: 1,117,476 (as of Jan 2026)
- **Illegal Dumping Records**: 370,019 (approx 33% of all requests)
- **Data Updates**: Continuous (rows updated at regular intervals)

---

## Authentication

The API is publicly accessible without authentication. However, for higher rate limits, you can use:

- **X-App-Token**: Application token (optional, for authenticated requests)
- **Basic Auth**: Username/password for certain operations

Environment variables:
```env
OAK311_API_TOKEN=your_token_here
OAK311_API_USERNAME=your_username_here
```

---

## Rate Limits

- Unauthenticated: Lower rate limits
- Authenticated (with App Token): Higher rate limits

If you receive a 403 error, the API automatically retries without authentication.

---

## Error Handling

| Error Code | Description |
|------------|-------------|
| 200 | Success |
| 403 | Forbidden (retry without auth) |
| 404 | Not Found (invalid dataset) |
| 429 | Rate Limited |
| 500 | Server Error |

---

## Integration Notes

### Field Mapping (API vs Application)

| API Field | Application Field | Notes |
|-----------|-------------------|-------|
| `requestid` | `id` | Primary key |
| `probaddress` | `address` | Problem address |
| `datetimeinit` | `datetimeinit` | Already in ISO format |
| `description` | `description` | |
| `status` | `status` | |
| `srx`, `sry` | `lat`, `lon` | Requires coordinate conversion |

### Handling Missing Addresses

Some records have `probaddress` as "ZZ" or empty string. In these cases, display the lat/lon coordinates instead:

```typescript
const displayAddress = request.address && request.address !== "ZZ" 
  ? request.address 
  : `${request.lat.toFixed(6)}, ${request.lon.toFixed(6)}`;
```

### Filtering Out Invalid Records

Some records have missing or invalid coordinates. Filter them out:

```typescript
if (!record.srx || !record.sry) return null;
const srx = parseFloat(record.srx);
const sry = parseFloat(record.sry);
if (!Number.isFinite(srx) || !Number.isFinite(sry)) return null;
```

### Coordinate Validation

The API may return Web Mercator coordinates with invalid values (positive SRX). Filter these:

```typescript
// SRX should be negative in California State Plane (feet)
// Valid range: approximately -18,000,000 to -5,000,000
if (srx > 0 || srx < -20000000) return null;
```

---

## Resources

- **API Documentation**: https://dev.socrata.com/
- **Dataset Portal**: https://data.oaklandca.gov/dataset/quth-gb8e
- **Illegal Dumping Dataset**: https://data.oaklandca.gov/Infrastructure/illegal-dumping/dpba-izmw
- **OAK 311 Map**: https://data.oaklandca.gov/Infrastructure/OAK-311-Service-Request-Map/yp8e-dukj
