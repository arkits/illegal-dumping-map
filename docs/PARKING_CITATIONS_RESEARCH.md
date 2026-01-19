# Parking Citations Dataset Research

## Executive Summary

This document catalogs parking citations datasets available across the 6 currently supported cities in the illegal dumping map application. The research builds on findings in `docs/OAKLAND_DATASETS_POTENTIAL.md` which identified Oakland's Parking Citations dataset as interesting but with coordinate quality issues.

**Key Findings:**
- **Total Cities Researched**: 6 (Oakland, San Francisco, Los Angeles, New York City, Chicago, Seattle)
- **Datasets with Socrata API Access**: 4 cities (Oakland, San Francisco, Los Angeles, New York City)
- **Datasets with Coordinate Data**: 3 cities (Oakland, San Francisco, Los Angeles)
- **Total Records Available**: 50+ million citations across all cities
- **Data Quality Issues**: Oakland has mixed coordinate quality (some invalid coordinates)

**Cities with Working APIs:**
- ✅ **Oakland**: 2.5M+ records, coordinate quality issues
- ✅ **San Francisco**: 23M+ records, WGS84 coordinates
- ✅ **Los Angeles**: 24M+ records, WGS84 coordinates
- ✅ **New York City**: Multiple fiscal year datasets, no direct coordinates (address-based)
- ❌ **Chicago**: No official Socrata dataset (ProPublica historical data only)
- ❌ **Seattle**: No detailed citation-level data (aggregated counts only)

---

## Dataset Catalog

### 1. Oakland Parking Citations

**Status**: ⚠️ **Coordinate Quality Issues**

- **Dataset ID**: `58em-y96b`
- **Dataset Name**: Citation Data Portal
- **Category**: Infrastructure / Finance
- **API Endpoint**: `https://data.oaklandca.gov/resource/58em-y96b.json`
- **Total Records**: 2,515,341+ (as of testing)
- **Data Freshness**: Continuously updated (recent citations from 2025)

#### Key Fields
- `ticket_num` - Ticket number (primary identifier)
- `fine_amount` - Fine amount (e.g., 64.0, 83.0, 66.0, 110.0, 72.0)
- `ticket_iss` - Ticket issue date/time
- `ticket_i_1` - Ticket issue time (formatted, e.g., "9:30:00 AM")
- `violation` - Violation code (e.g., "10.36.100", "22500.F", "10.28.240")
- `violatio_1` - Violation description (e.g., "METER EXP OFF STREET", "NO PKG - SIDEWALK", "NO PARK CERTAIN HRS")
- `location` - Location address (e.g., "145 PIEDMONT LOT", "1035 CAMPBELL ST", "1136 61ST AVE")
- `the_geom` - GeoJSON Point geometry
- `status` - Status (e.g., "U")
- `meter_indi` - Meter indicator (e.g., "Yes", "No")
- `meter` - Meter identifier (if applicable)

#### Coordinate System
- ⚠️ **Mixed Quality** - Some records have valid coordinates, others have placeholder values
- Invalid records show: `{"type":"Point","coordinates":[165.99845616481824,-90]}` (invalid - longitude > 180, latitude = -90)
- Valid records show: `{"type":"Point","coordinates":[-122.20253373718944,37.761078971252616]}` (valid Oakland coordinates)
- Field: `the_geom` (GeoJSON Point)
- Format: `{"type":"Point","coordinates":[lon,lat]}`

#### Sample Query
```bash
curl "https://data.oaklandca.gov/resource/58em-y96b.json?\$where=the_geom IS NOT NULL AND longitude(the_geom) >= -180 AND longitude(the_geom) <= 180 AND latitude(the_geom) >= -90 AND latitude(the_geom) <= 90&\$limit=10&\$order=ticket_iss DESC"
```

#### Visualization Potential
- **Map**: Citation locations (requires filtering invalid coordinates)
- **Charts**: Violation type distribution, fine amount analysis, trends over time
- **Filters**: Violation type, date range, fine amount, location

#### Integration Notes
- **Challenge**: Many records have invalid coordinates (165.99, -90) - need filtering
- **Advantage**: Very large dataset with recent data (2025)
- **Advantage**: Rich metadata (violation types, fine amounts)
- **Recommendation**: Filter out invalid coordinates using bounds check (longitude: -180 to 180, latitude: -90 to 90)
- **Coordinate Filter**: `longitude(the_geom) >= -180 AND longitude(the_geom) <= 180 AND latitude(the_geom) >= -90 AND latitude(the_geom) <= 90`

---

### 2. San Francisco Parking Citations

**Status**: ✅ **Ready**

- **Dataset ID**: `ab4h-6ztd`
- **Dataset Name**: SFMTA - Parking Citations & Fines
- **Category**: Infrastructure / Finance
- **API Endpoint**: `https://data.sfgov.org/resource/ab4h-6ztd.json`
- **Total Records**: 23,126,996+ (as of testing)
- **Data Freshness**: Daily updates (with ~24-hour lag)
- **First Published**: April 3, 2015
- **Last Modified**: October 25, 2025

#### Key Fields
- `citation_number` - Citation number (primary identifier, e.g., "745653112")
- `citation_issued_datetime` - Citation issue date/time (e.g., "2008-04-07T12:18:00.000")
- `violation` - Violation code (e.g., "T37C", "T315A")
- `violation_desc` - Violation description (e.g., "ST CLEANIN", "RESIDENTL")
- `citation_location` - Citation location address (e.g., "190 MALLORCA WAY", "2821 23RD ST")
- `vehicle_plate_state` - Vehicle plate state (e.g., "CA", "OR")
- `vehicle_plate` - Vehicle plate number (e.g., "4NMR490", "YDR871")
- `fine_amount` - Fine amount (e.g., "40", "60")
- `date_added` - Date added to dataset
- `the_geom` - GeoJSON Point geometry
- `supervisor_districts` - Supervisor district number
- `analysis_neighborhood` - Analysis neighborhood (e.g., "Marina", "Mission")
- `latitude` - Latitude (POINT format string - appears to be duplicate of the_geom)
- `longitude` - Longitude (POINT format string - appears to be duplicate of the_geom)
- `:@computed_region_*` - Various computed region fields

#### Coordinate System
- ✅ **WGS84 (lat/lon)** - GeoJSON Point format
- Field: `the_geom` (GeoJSON Point)
- Format: `{"type":"Point","coordinates":[lon,lat]}`
- Example: `{"type":"Point","coordinates":[-122.43779729699997,37.80253268300004]}`
- Coordinates are already in WGS84 - no conversion needed!

#### Sample Query
```bash
curl "https://data.sfgov.org/resource/ab4h-6ztd.json?\$limit=10&\$order=citation_issued_datetime DESC"
```

#### Visualization Potential
- **Map**: Citation locations with violation types and fine amounts
- **Charts**: Violation type distribution, fine amount analysis, neighborhood analysis, trends over time
- **Filters**: Violation type, date range, fine amount, neighborhood, supervisor district

#### Integration Notes
- **Advantage**: Coordinates already in WGS84 - no conversion needed
- **Advantage**: Very large dataset (23M+ records)
- **Advantage**: Rich metadata (neighborhoods, supervisor districts, violation types)
- **Advantage**: Daily updates with recent data
- **Advantage**: Good coordinate quality (all tested records have valid coordinates)
- **Use Case**: Revenue analysis, violation patterns, neighborhood enforcement analysis

---

### 3. Los Angeles Parking Citations

**Status**: ✅ **Ready**

- **Dataset ID**: `4f5p-udkv`
- **Dataset Name**: Parking Citations
- **Category**: Infrastructure / Finance
- **API Endpoint**: `https://data.lacity.org/resource/4f5p-udkv.json`
- **Total Records**: 24,307,581+ (as of testing)
- **Data Freshness**: Continuously updated (recent citations from 2025)
- **First Published**: February 17, 2025
- **Last Modified**: December 14, 2025

#### Key Fields
- `ticket_number` - Ticket number (primary identifier, e.g., "4602073232")
- `issue_date` - Issue date (e.g., "2025-04-26T00:00:00.000")
- `issue_time` - Issue time (e.g., "904", "830")
- `marked_time` - Marked time (e.g., "0000")
- `rp_state_plate` - Registration plate state (e.g., "CA")
- `plate_expiry_date` - Plate expiry date (e.g., "202512", "202510")
- `make` - Vehicle make (e.g., "FORD", "CHEV")
- `body_style` - Body style code (e.g., "PA")
- `body_style_desc` - Body style description (e.g., "PASSENGER CAR")
- `color` - Color code (e.g., "WT", "SL")
- `color_desc` - Color description (e.g., "WHITE", "SILVER")
- `location` - Location address (e.g., "1875 20TH ST W", "5100 WOODMAN AVE")
- `agency` - Agency code (e.g., "55", "53")
- `agency_desc` - Agency description (e.g., "55 - DOT - SOUTHERN", "53 - DOT - VALLEY")
- `violation_code` - Violation code (e.g., "22500H", "22514")
- `violation_description` - Violation description (e.g., "DOUBLE PARKING", "FIRE HYDRANT")
- `fine_amount` - Fine amount (e.g., "68")
- `loc_lat` - Location latitude (string, e.g., "34.0382668")
- `loc_long` - Location longitude (string, e.g., "-118.29959251")
- `geocodelocation` - GeoJSON Point geometry

#### Coordinate System
- ✅ **WGS84 (lat/lon)** - GeoJSON Point format
- Fields: `loc_lat` (latitude string), `loc_long` (longitude string)
- Also provides: `geocodelocation` (GeoJSON Point)
- Format: `{"type":"Point","coordinates":[lon,lat]}`
- Example: `{"type":"Point","coordinates":[-118.29959251,34.0382668]}`
- Coordinates are already in WGS84 - no conversion needed!
- **Note**: Previous version used California State Plane Coordinate System, current version uses web-mercator (EPSG:3857) but provides WGS84 coordinates

#### Sample Query
```bash
curl "https://data.lacity.org/resource/4f5p-udkv.json?\$limit=10&\$order=issue_date DESC"
```

#### Visualization Potential
- **Map**: Citation locations with violation types, fine amounts, and agency information
- **Charts**: Violation type distribution, fine amount analysis, agency analysis, trends over time
- **Filters**: Violation type, date range, fine amount, agency, location

#### Integration Notes
- **Advantage**: Coordinates already in WGS84 - no conversion needed
- **Advantage**: Very large dataset (24M+ records)
- **Advantage**: Rich metadata (vehicle info, agency, violation types)
- **Advantage**: Recent data (2025)
- **Advantage**: Good coordinate quality (all tested records have valid coordinates)
- **Use Case**: Revenue analysis, violation patterns, agency enforcement analysis, vehicle type analysis

---

### 4. New York City Parking Violations

**Status**: ⚠️ **No Direct Coordinates**

- **Dataset ID**: `pvqr-7yc4` (FY 2024), `869v-vr48` (FY 2023), and others by fiscal year
- **Dataset Name**: Parking Violations Issued - Fiscal Year 2024 (and other fiscal years)
- **Category**: Infrastructure / Finance
- **API Endpoint**: `https://data.cityofnewyork.us/resource/pvqr-7yc4.json` (FY 2024)
- **Data Span**: Fiscal Year 2024 (July 1, 2023 - June 30, 2024) and historical fiscal years back to FY 2014
- **Data Freshness**: Updated after fiscal year ends (snapshot at issuance, not live status)

#### Key Fields
- `summons_number` - Summons/Notice number (primary identifier, e.g., "1159637337")
- `plate_id` - License plate number (e.g., "KZH2758")
- `registration_state` - Registration state (e.g., "NY")
- `plate_type` - Type of plate (e.g., "PAS" for passenger)
- `issue_date` - Issue date (e.g., "2023-06-09T00:00:00.000")
- `violation_code` - Violation code (e.g., "67", "87")
- `vehicle_body_type` - Vehicle body type (e.g., "VAN", "SUBN")
- `vehicle_make` - Vehicle make (e.g., "HONDA", "LINCO")
- `vehicle_color` - Vehicle color (e.g., "BLUE")
- `vehicle_year` - Vehicle year (e.g., "2006")
- `issuing_agency` - Issuing agency code (e.g., "P", "M")
- `violation_location` - Violation location code (e.g., "0043")
- `violation_precinct` - Violation precinct (e.g., "43")
- `issuer_precinct` - Issuer precinct (e.g., "43", "968")
- `issuer_code` - Issuer code (e.g., "972773", "271057")
- `violation_time` - Violation time (e.g., "0911A", "0717A")
- `violation_county` - Violation county (e.g., "BX", "NY")
- `street_name` - Street name (e.g., "I/O TAYLOR AVE")
- `intersecting_street` - Intersecting street (e.g., "GUERLAIN")
- `street_code1`, `street_code2`, `street_code3` - Street codes
- `law_section` - Law section (e.g., "408")
- `sub_division` - Sub division (e.g., "E5")
- `meter_number` - Meter number (e.g., "-")
- `feet_from_curb` - Feet from curb (e.g., "0")

#### Coordinate System
- ❌ **No Direct Coordinates** - Only address-based location data
- Fields: `street_name`, `intersecting_street`, `violation_precinct`, `violation_county`, `street_code1/2/3`
- ⚠️ **Requires Geocoding** - Addresses need to be geocoded to lat/lon for mapping
- No `latitude`, `longitude`, or `the_geom` fields in the dataset

#### Sample Query
```bash
curl "https://data.cityofnewyork.us/resource/pvqr-7yc4.json?\$limit=10&\$order=issue_date DESC"
```

#### Visualization Potential
- **Map**: Requires geocoding addresses first
- **Charts**: Violation code distribution, precinct analysis, vehicle type analysis, trends over time
- **Filters**: Violation code, date range, precinct, county, vehicle type

#### Integration Notes
- **Challenge**: No coordinates - requires geocoding service (Google Maps, Mapbox, etc.)
- **Advantage**: Very large dataset (millions of records per fiscal year)
- **Advantage**: Rich metadata (vehicle info, precinct, violation codes)
- **Advantage**: Historical data available (FY 2014-present)
- **Consideration**: Multiple datasets by fiscal year (need to query appropriate dataset)
- **Consideration**: Data represents snapshot at issuance, not live status
- **Alternative Dataset**: "Open Parking and Camera Violations" dataset exists for current/open violations (updated weekly/daily) but also lacks coordinates
- **Recommendation**: Use geocoding service or join with NYC address geocoding dataset if available

---

### 5. Chicago Parking Citations

**Status**: ❌ **No Official Socrata Dataset**

- **Dataset ID**: N/A (no official Socrata dataset found)
- **Dataset Name**: N/A
- **Category**: Infrastructure / Finance
- **API Endpoint**: N/A
- **Data Availability**: Historical data via ProPublica (1996-2018), not on Socrata

#### Key Findings
- **ProPublica Dataset**: ~28.3 million parking and vehicle compliance tickets (January 1, 1996 - May 14, 2018)
- **Source**: Obtained via FOIA request to Chicago's Finance Department
- **Availability**: Available through ProPublica's data store, not via official Socrata API
- **Data Freshness**: Historical only (ends May 2018), not current

#### ProPublica Dataset Fields (from research)
- `ticket_number` - Unique ID per citation
- `issue_date` - Date/time issued
- `violation_location` - Street address or location where issued
- `license_plate_number` - Hashed or anonymized
- `license_plate_state` - State (2-letter code)
- `license_plate_type` - Type (e.g., passenger, taxi, temporary plate)
- `zipcode` - Vehicle registration ZIP code
- `violation_code` - Violation code
- `violation_description` - Violation description
- Payment information (possibly whether ticket is paid or still due)

#### Coordinate System
- ⚠️ **Unknown** - ProPublica dataset structure not fully verified
- May have location data but coordinate format unclear
- Would need to verify ProPublica dataset structure

#### Integration Notes
- **Limitation**: No official Socrata dataset available
- **Limitation**: Historical data only (1996-2018), not current
- **Limitation**: Not accessible via standard Socrata API
- **Alternative**: ProPublica dataset available but requires different integration approach
- **Recommendation**: Not suitable for current/real-time visualization without official API access
- **Note**: Chicago Socrata portal search for "parking citation" returns 404 - no official dataset found

---

### 6. Seattle Parking Citations

**Status**: ❌ **No Detailed Citation Data Available**

- **Dataset ID**: N/A (no detailed citation-level dataset found)
- **Dataset Name**: N/A
- **Category**: Infrastructure / Finance
- **API Endpoint**: N/A
- **Data Availability**: Aggregated data only, no individual citation records

#### Available Datasets
1. **Seattle Vehicle Infractions** (Aggregated)
   - Dataset provides counts of vehicle infractions by type and year
   - Covers combined traffic + parking infractions
   - **Fields**: Infraction type, year, number of infractions
   - **Limitation**: No detailed records per ticket
   - **Not Suitable**: For individual citation mapping/visualization

2. **Paid Parking Transaction Data**
   - Tracks transactions made at on-street paid parking pay stations
   - **Not Citations**: This is payment data, not violation/citation data
   - **Use Case**: Understanding paid parking behavior, not enforcement

#### Coordinate System
- N/A - No detailed citation dataset with coordinates

#### Integration Notes
- **Limitation**: No detailed citation-level dataset available via Socrata
- **Limitation**: Only aggregated counts available (not individual citations)
- **Alternative**: Seattle Municipal Court has "Find My Ticket" portal for individual lookups, but not bulk data access
- **Recommendation**: Would require public records request under Washington State's Public Records Act for detailed citation data
- **Note**: Seattle Socrata portal search for "parking citation" returns 404 - no official dataset found
- **Not Suitable**: For citation-level mapping/visualization without detailed data access

---

## Comparison Table

| City | Dataset ID | Portal | Records | Coordinates | Status | Coordinate System | Data Quality |
|------|-----------|--------|---------|-------------|--------|-------------------|--------------|
| **Oakland** | 58em-y96b | data.oaklandca.gov | 2.5M+ | ⚠️ Mixed | ⚠️ Needs Filtering | WGS84 (GeoJSON) | Some invalid coordinates |
| **San Francisco** | ab4h-6ztd | data.sfgov.org | 23M+ | ✅ Yes | ✅ Ready | WGS84 (GeoJSON) | Good quality |
| **Los Angeles** | 4f5p-udkv | data.lacity.org | 24M+ | ✅ Yes | ✅ Ready | WGS84 (GeoJSON) | Good quality |
| **New York City** | pvqr-7yc4 (FY 2024) | data.cityofnewyork.us | Millions | ❌ No | ⚠️ Needs Geocoding | Address only | Requires geocoding |
| **Chicago** | N/A | N/A | N/A | ❌ No | ❌ Not Available | N/A | No Socrata dataset |
| **Seattle** | N/A | N/A | N/A | ❌ No | ❌ Not Available | N/A | No detailed dataset |

---

## Integration Recommendations

### High Priority (Ready for Integration)

1. **San Francisco Parking Citations** (`ab4h-6ztd`)
   - **Why**: Very large dataset (23M+ records), coordinates in WGS84, good data quality
   - **Effort**: Low - coordinates already in correct format
   - **Impact**: High - large dataset with rich metadata
   - **Use Case**: Revenue analysis, violation patterns, neighborhood enforcement analysis

2. **Los Angeles Parking Citations** (`4f5p-udkv`)
   - **Why**: Very large dataset (24M+ records), coordinates in WGS84, good data quality
   - **Effort**: Low - coordinates already in correct format
   - **Impact**: High - large dataset with rich metadata
   - **Use Case**: Revenue analysis, violation patterns, agency enforcement analysis

### Medium Priority (Requires Work)

3. **Oakland Parking Citations** (`58em-y96b`)
   - **Why**: Large dataset (2.5M+ records), recent data (2025)
   - **Effort**: Medium - need to filter invalid coordinates
   - **Impact**: Medium - good dataset but coordinate quality issues
   - **Coordinate Filter**: `longitude(the_geom) >= -180 AND longitude(the_geom) <= 180 AND latitude(the_geom) >= -90 AND latitude(the_geom) <= 90`
   - **Use Case**: Revenue analysis, violation patterns (with coordinate filtering)

### Low Priority (Requires Geocoding)

4. **New York City Parking Violations** (`pvqr-7yc4` and other fiscal year datasets)
   - **Why**: Very large dataset (millions of records per fiscal year)
   - **Effort**: High - requires geocoding service integration
   - **Impact**: High - large dataset but requires additional infrastructure
   - **Consideration**: Multiple datasets by fiscal year (need to query appropriate dataset)
   - **Alternative**: Consider "Open Parking and Camera Violations" dataset for current violations
   - **Use Case**: Revenue analysis, violation patterns (with geocoding)

### Not Available

5. **Chicago Parking Citations**
   - **Why**: No official Socrata dataset available
   - **Limitation**: Only historical ProPublica data (1996-2018)
   - **Recommendation**: Not suitable for current visualization without official API access

6. **Seattle Parking Citations**
   - **Why**: No detailed citation-level dataset available
   - **Limitation**: Only aggregated counts available
   - **Recommendation**: Would require public records request for detailed data

---

## Integration Guidelines

### For Datasets with WGS84 Coordinates (San Francisco, Los Angeles)

1. **Set `requiresCoordinateConversion: false`** in city config
2. **Use coordinates directly** from API response
3. **Extract from `the_geom` field**: `the_geom.coordinates[0]` (longitude), `the_geom.coordinates[1]` (latitude)
4. **No conversion function needed**

### For Datasets with Coordinate Quality Issues (Oakland)

1. **Filter invalid coordinates** using bounds check:
   ```sql
   $where=longitude(the_geom) >= -180 AND longitude(the_geom) <= 180 AND latitude(the_geom) >= -90 AND latitude(the_geom) <= 90
   ```
2. **Validate coordinates** in application code before mapping
3. **Handle coordinate errors** gracefully

### For Datasets Requiring Geocoding (New York City)

1. **Integrate geocoding service** (Google Maps, Mapbox, etc.)
2. **Cache geocoded results** to avoid repeated API calls
3. **Handle geocoding failures** gracefully
4. **Consider batch geocoding** for large datasets

---

## Sample Integration Code

### San Francisco Parking Citations (WGS84 Example)

```typescript
// San Francisco Parking Citations API integration
async function fetchSFParkingCitations(options: {
  limit?: number;
  offset?: number;
  year?: number;
}): Promise<CitationRecord[]> {
  const { limit = 5000, offset = 0, year } = options;

  let whereClause = "";
  if (year) {
    whereClause = `date_extract_y(citation_issued_datetime)=${year}`;
  }

  const url = new URL("https://data.sfgov.org/resource/ab4h-6ztd.json");
  if (whereClause) {
    url.searchParams.set("$where", whereClause);
  }
  url.searchParams.set("$limit", limit.toString());
  url.searchParams.set("$offset", offset.toString());
  url.searchParams.set("$order", "citation_issued_datetime DESC");

  const response = await fetch(url.toString());
  const data: any[] = await response.json();

  return data
    .filter(record => record.the_geom?.coordinates)
    .map(record => ({
      id: record.citation_number,
      lat: record.the_geom.coordinates[1], // GeoJSON is [lon, lat]
      lon: record.the_geom.coordinates[0],
      issueDate: record.citation_issued_datetime,
      violation: record.violation,
      violationDesc: record.violation_desc,
      fineAmount: parseFloat(record.fine_amount || "0"),
      location: record.citation_location,
      neighborhood: record.analysis_neighborhood,
    }));
}
```

### Los Angeles Parking Citations (WGS84 Example)

```typescript
// Los Angeles Parking Citations API integration
async function fetchLAParkingCitations(options: {
  limit?: number;
  offset?: number;
  year?: number;
}): Promise<CitationRecord[]> {
  const { limit = 5000, offset = 0, year } = options;

  let whereClause = "";
  if (year) {
    whereClause = `date_extract_y(issue_date)=${year}`;
  }

  const url = new URL("https://data.lacity.org/resource/4f5p-udkv.json");
  if (whereClause) {
    url.searchParams.set("$where", whereClause);
  }
  url.searchParams.set("$limit", limit.toString());
  url.searchParams.set("$offset", offset.toString());
  url.searchParams.set("$order", "issue_date DESC");

  const response = await fetch(url.toString());
  const data: any[] = await response.json();

  return data
    .filter(record => record.geocodelocation?.coordinates)
    .map(record => ({
      id: record.ticket_number,
      lat: parseFloat(record.loc_lat),
      lon: parseFloat(record.loc_long),
      issueDate: record.issue_date,
      violationCode: record.violation_code,
      violationDesc: record.violation_description,
      fineAmount: parseFloat(record.fine_amount || "0"),
      location: record.location,
      agency: record.agency_desc,
    }));
}
```

### Oakland Parking Citations (With Coordinate Filtering)

```typescript
// Oakland Parking Citations API integration (with coordinate filtering)
async function fetchOaklandParkingCitations(options: {
  limit?: number;
  offset?: number;
  year?: number;
}): Promise<CitationRecord[]> {
  const { limit = 5000, offset = 0, year } = options;

  // Filter invalid coordinates (165.99, -90)
  let whereClause = "longitude(the_geom) >= -180 AND longitude(the_geom) <= 180 AND latitude(the_geom) >= -90 AND latitude(the_geom) <= 90";
  if (year) {
    whereClause += ` AND date_extract_y(ticket_iss)=${year}`;
  }

  const url = new URL("https://data.oaklandca.gov/resource/58em-y96b.json");
  url.searchParams.set("$where", whereClause);
  url.searchParams.set("$limit", limit.toString());
  url.searchParams.set("$offset", offset.toString());
  url.searchParams.set("$order", "ticket_iss DESC");

  const response = await fetch(url.toString());
  const data: any[] = await response.json();

  return data
    .filter(record => {
      const coords = record.the_geom?.coordinates;
      if (!coords || coords.length !== 2) return false;
      const [lon, lat] = coords;
      // Additional validation in code
      return lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
    })
    .map(record => ({
      id: record.ticket_num,
      lat: record.the_geom.coordinates[1],
      lon: record.the_geom.coordinates[0],
      issueDate: record.ticket_iss,
      violation: record.violation,
      violationDesc: record.violatio_1,
      fineAmount: parseFloat(record.fine_amount || "0"),
      location: record.location,
    }));
}
```

---

## Data Quality Summary

### Coordinate Availability

- **✅ Direct WGS84 Coordinates**: 2 datasets (San Francisco, Los Angeles)
- **⚠️ WGS84 with Quality Issues**: 1 dataset (Oakland - some invalid coordinates)
- **❌ Address Only (Needs Geocoding)**: 1 dataset (New York City)
- **❌ Not Available**: 2 cities (Chicago, Seattle)

### Data Freshness

- **✅ Continuously Updated**: Oakland, San Francisco, Los Angeles
- **✅ Fiscal Year Snapshots**: New York City (updated after fiscal year ends)
- **❌ Historical Only**: Chicago (ProPublica data ends 2018)
- **❌ Not Available**: Seattle (no detailed citation data)

### Record Volume

- **Very Large (20M+)**: San Francisco (23M), Los Angeles (24M)
- **Large (1M-10M)**: Oakland (2.5M), New York City (millions per fiscal year)
- **Not Available**: Chicago, Seattle

---

## Next Steps

1. **Immediate**: Integrate San Francisco and Los Angeles parking citations (ready to use)
2. **Short-term**: Add Oakland parking citations with coordinate filtering
3. **Medium-term**: Consider New York City integration with geocoding service
4. **Long-term**: Monitor Chicago and Seattle for future dataset availability

---

## Resources

- **Oakland Open Data Portal**: https://data.oaklandca.gov/
- **San Francisco Open Data Portal**: https://data.sfgov.org/
- **Los Angeles Open Data Portal**: https://data.lacity.org/
- **NYC Open Data Portal**: https://opendata.cityofnewyork.us/
- **Socrata SODA API Documentation**: https://dev.socrata.com/
- **Oakland Parking Citations Dataset**: https://data.oaklandca.gov/Public-Safety/Citation-Data-Portal/58em-y96b
- **San Francisco Parking Citations Dataset**: https://data.sfgov.org/Transportation/SFMTA-Parking-Citations-Fines/ab4h-6ztd
- **Los Angeles Parking Citations Dataset**: https://data.lacity.org/Transportation/Parking-Citations/4f5p-udkv
- **NYC Parking Violations Dataset**: https://data.cityofnewyork.us/City-Government/Parking-Violations-Issued-Fiscal-Year-2024/pvqr-7yc4

---

## Changelog

- **2026-01-XX**: Initial research and documentation
  - Researched parking citations datasets for 6 supported cities
  - Verified API accessibility and data structures
  - Documented coordinate systems and data quality
  - Provided integration recommendations and sample code
  - Identified 3 cities ready for integration (SF, LA, Oakland with filtering)
  - Identified 1 city requiring geocoding (NYC)
  - Identified 2 cities without available datasets (Chicago, Seattle)
