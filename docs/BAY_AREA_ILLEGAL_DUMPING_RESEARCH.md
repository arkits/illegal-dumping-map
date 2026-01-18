# Bay Area Illegal Dumping Data Research

## Executive Summary

This document summarizes research into illegal dumping data availability across San Francisco Bay Area cities. The goal was to identify cities with publicly accessible APIs (preferably Socrata) that provide illegal dumping service request data similar to Oakland's implementation.

**Key Findings:**
- ✅ **San Francisco**: Has Socrata API with illegal dumping data (2,620+ records)
- ✅ **Los Angeles**: Has Socrata API with illegal dumping data (~114K records in 2024)
- ⚠️ **Sacramento**: Has 311 dataset but uses ArcGIS Hub platform (different API approach)
- ❌ **Berkeley**: No public 311 service request dataset available
- ⚠️ **San Jose**: ArcGIS REST API only (2022 data, service currently unavailable)
- ❓ **Other Cities**: Fremont, Hayward, Richmond have reporting systems but no public APIs found

---

## City-by-City Analysis

### 1. Oakland (Current Implementation)

**Status**: ✅ **Active - Currently Used**

- **Portal**: `data.oaklandca.gov`
- **Dataset ID**: `quth-gb8e`
- **Dataset Name**: Service requests received by the Oakland Call Center (OAK 311)
- **API Endpoint**: `https://data.oaklandca.gov/resource/quth-gb8e.json`
- **Data Span**: Historical data from 2008 to present, updated continuously
- **Total Illegal Dumping Records**: ~370,019 (as of Jan 2026)

#### Filtering
```sql
REQCATEGORY='ILLDUMP'
```

#### Key Fields
- `requestid` - Primary identifier
- `datetimeinit` - Request initiation date/time
- `status` - Current status
- `reqcategory` - Request category (ILLDUMP for illegal dumping)
- `srx`, `sry` - Coordinates (State Plane, requires conversion to WGS84)
- `probaddress` - Problem address
- `description` - Request description

#### Coordinate System
- Uses **NAD_1983_StatePlane_California_III_FIPS_0403_Feet** (State Plane coordinates)
- Requires conversion to WGS84 (lat/lon) for mapping
- Conversion function available in `src/lib/utils.ts`

#### Sample Query
```bash
curl "https://data.oaklandca.gov/resource/quth-gb8e.json?\$where=REQCATEGORY='ILLDUMP' AND date_extract_y(DATETIMEINIT)=2024&\$limit=10"
```

#### Documentation
- Full API documentation: [docs/OAKLAND_311_API.md](OAKLAND_311_API.md)

---

### 2. San Francisco

**Status**: ✅ **Available - Tested and Working**

- **Portal**: `data.sfgov.org` (DataSF)
- **Dataset ID**: `vw6y-z8j6`
- **Dataset Name**: 311 Cases
- **API Endpoint**: `https://data.sfgov.org/resource/vw6y-z8j6.json`
- **Data Span**: July 1, 2008 to present, updated nightly (~6 AM PT)
- **Illegal Dumping Records**: 2,620+ records with `service_details='trash_dumping'`

#### Filtering Options

**Primary Filter (Most Specific):**
```sql
service_details='trash_dumping'
```

**Alternative Filter (Broader):**
```sql
service_name='Street and Sidewalk Cleaning' AND service_subtype='Bulky Items'
```
*Note: This returns 1,004,147 records - much broader category that includes bulky item pickups*

#### Key Fields
- `service_request_id` - Primary identifier
- `requested_datetime` - Request date/time
- `closed_date` - Closure date/time
- `status_description` - Current status
- `service_name` - Service category (e.g., "RPD General", "Street and Sidewalk Cleaning")
- `service_subtype` - Sub-category
- `service_details` - Specific detail (e.g., "trash_dumping")
- `lat`, `long` - **Already in WGS84** (no conversion needed!)
- `address` - Full address string
- `neighborhoods_sffind_boundaries` - Neighborhood name
- `supervisor_district` - Supervisor district

#### Coordinate System
- ✅ **WGS84 (lat/lon)** - No conversion needed!
- Fields: `lat` (latitude), `long` (longitude)
- Also provides `point_geom` with GeoJSON Point geometry

#### Sample Queries

**Get illegal dumping records:**
```bash
curl "https://data.sfgov.org/resource/vw6y-z8j6.json?\$where=service_details='trash_dumping'&\$limit=10&\$order=requested_datetime DESC"
```

**Get count:**
```bash
curl "https://data.sfgov.org/resource/vw6y-z8j6.json?\$select=count(*)&\$where=service_details='trash_dumping'"
```

**Filter by year:**
```bash
curl "https://data.sfgov.org/resource/vw6y-z8j6.json?\$where=service_details='trash_dumping' AND date_extract_y(requested_datetime)=2024&\$limit=10"
```

#### Field Mapping (SF → Oakland equivalent)

| SF Field | Oakland Field | Notes |
|----------|--------------|-------|
| `service_request_id` | `requestid` | Primary ID |
| `requested_datetime` | `datetimeinit` | Request timestamp |
| `closed_date` | `datetimeclosed` | Closure timestamp |
| `status_description` | `status` | Status |
| `service_details='trash_dumping'` | `reqcategory='ILLDUMP'` | Filter condition |
| `lat`, `long` | `srx`, `sry` (converted) | Coordinates (SF already WGS84) |
| `address` | `probaddress` | Address |

#### Integration Notes
- **Advantage**: Coordinates already in WGS84 - no conversion needed
- **Disadvantage**: Only 2,620 records vs Oakland's 370,000+ (may be underreported or categorized differently)
- Consider also including "Bulky Items" subtype for more comprehensive coverage

#### Authentication
- Public API, no authentication required
- Optional: App token for higher rate limits (same as Oakland)

---

### 3. Los Angeles

**Status**: ✅ **Available - Tested and Working**

- **Portal**: `data.lacity.org` (DataLA - Socrata)
- **Primary Dataset ID**: `b7dx-7gc3`
- **Primary Dataset Name**: MyLA311 Service Request Data 2024
- **API Endpoint**: `https://data.lacity.org/resource/b7dx-7gc3.json`
- **Data Span**: 2024 data, updated daily
- **Illegal Dumping Records**: ~114,268 records in 2024 (estimated)

#### Filtering Options

**Primary Filter:**
```sql
requesttype='Illegal Dumping Pickup'
```

#### Key Fields
- `srnumber` - Primary identifier (Service Request Number)
- `createddate` - Request creation date/time
- `updateddate` - Last update date/time
- `closeddate` - Closure date/time
- `status` - Current status
- `requesttype` - Request type (use "Illegal Dumping Pickup" for filtering)
- `latitude`, `longitude` - **Already in WGS84** (no conversion needed!)
- `address` - Full address string
- `apc` - Area Planning Commission
- `cd` - Council District
- `nc` - Neighborhood Council number
- `ncname` - Neighborhood Council name

#### Coordinate System
- ✅ **WGS84 (lat/lon)** - No conversion needed!
- Fields: `latitude` (latitude), `longitude` (longitude)
- Also provides `location` with GeoJSON Point geometry

#### Sample Queries

**Get illegal dumping records:**
```bash
curl "https://data.lacity.org/resource/b7dx-7gc3.json?\$where=requesttype='Illegal Dumping Pickup'&\$limit=10&\$order=createddate DESC"
```

**Filter by year (2024):**
```bash
curl "https://data.lacity.org/resource/b7dx-7gc3.json?\$where=requesttype='Illegal Dumping Pickup' AND date_extract_y(createddate)=2024&\$limit=10"
```

**Get count:**
```bash
curl "https://data.lacity.org/resource/b7dx-7gc3.json?\$select=count(*)&\$where=requesttype='Illegal Dumping Pickup'"
```

#### Field Mapping (LA → Oakland equivalent)

| LA Field | Oakland Field | Notes |
|----------|--------------|-------|
| `srnumber` | `requestid` | Primary ID |
| `createddate` | `datetimeinit` | Request timestamp |
| `closeddate` | `datetimeclosed` | Closure timestamp |
| `status` | `status` | Status |
| `requesttype='Illegal Dumping Pickup'` | `reqcategory='ILLDUMP'` | Filter condition |
| `latitude`, `longitude` | `srx`, `sry` (converted) | Coordinates (LA already WGS84) |
| `address` | `probaddress` | Address |

#### Alternative Dataset: LASAN Abandoned Waste

- **Dataset ID**: `97ra-aqza`
- **Dataset Name**: LASAN: Solid Resources Abandoned Waste Collection Activity
- **Filter**: `service_request_type='Illegal Dumping Pickup'`
- **Limitations**: 
  - No location coordinates (only council_district)
  - Historical data only (last updated 2015)
  - 3,827 records
- **Use Case**: Historical analysis only, not suitable for mapping

#### Integration Notes
- **Advantage**: Coordinates already in WGS84 - no conversion needed
- **Advantage**: Large dataset (~114K records in 2024)
- **Advantage**: Daily updates
- **Consideration**: Yearly datasets (need to check for 2025 dataset availability)
- **Consideration**: Field name is `requesttype` (not `reqcategory`)
- **Consideration**: Value is "Illegal Dumping Pickup" (not "ILLDUMP")

#### Authentication
- Public API, no authentication required
- Optional: App token for higher rate limits (same as Oakland/SF)

---

### 4. Sacramento

**Status**: ⚠️ **Limited - Different Platform**

- **Portal**: `data.cityofsacramento.org`
- **Platform**: ArcGIS Hub (NOT Socrata)
- **Dataset**: 311 Service Requests exists but requires different API approach
- **Dataset ID**: `5b9a9448-663f-41b1-898c-43b6d91201c4` (mentioned in community discussions)

#### Investigation Results
- Uses **ArcGIS Hub** platform, not Socrata SODA API
- Requires different API integration approach (ArcGIS REST API or GeoJSON)
- Has 311 service request dataset but API endpoints are different
- Can filter by "Illegal Dumping" or "Illicit Dumping" in request type field

#### Limitations
- **Different Platform**: Not Socrata, so cannot use same integration code as Oakland/SF/LA
- **API Documentation**: ArcGIS Hub uses different API methods
- **Integration Complexity**: Would require separate integration approach

#### Conclusion
Sacramento has 311 service request data available, but uses ArcGIS Hub platform instead of Socrata. This requires a different API integration approach using ArcGIS REST API or GeoJSON endpoints, making it incompatible with the current Socrata-based implementation.

**Alternative Options:**
1. Develop separate ArcGIS REST API integration for Sacramento
2. Use ArcGIS Hub API if available
3. Consider if supporting non-Socrata platforms is worthwhile

---

### 5. Berkeley

**Status**: ❌ **Not Available**

- **Portal**: `data.cityofberkeley.info`
- **Dataset Search**: No 311 service request dataset found
- **Available Datasets**: 73 total datasets, but none for 311/service requests

#### Investigation Results
- Searched for: "311", "service", "request"
- Found: "Berkeley PD - Calls for Service" (dataset ID: `k2nh-s5h5`)
  - This is for **police calls**, not 311 service requests
  - Contains crime/incident data, not illegal dumping service requests
  - Fields: `offense`, `eventdt`, `caseno`, `block_location`, etc.

#### Conclusion
Berkeley does not have a publicly accessible 311 service request dataset on their Socrata portal. While the city has a "Report & Pay" portal where residents can report illegal dumping, this data is not published as an open dataset.

**Alternative Options:**
1. Submit a Public Records Request to the City of Berkeley
2. Contact Berkeley Public Works directly
3. Check if data exists under a different name/category

---

### 4. San Jose

**Status**: ⚠️ **Limited Availability**

- **Portal**: `data.sanjoseca.gov` (Open Data Portal exists)
- **311 Data**: ArcGIS REST service (not Socrata)
- **Endpoint**: `https://geodev.sanjoseca.gov/server/rest/services/OPN/OPN_OpenDataService/MapServer/616`
- **Data Span**: **2022 data only** (not current)
- **Service Status**: Service currently unavailable/unstarted

#### Investigation Results
- No Socrata dataset found for 311 service requests
- ArcGIS REST service exists but:
  - Only contains 2022 data
  - Service was not accessible during testing
  - Would require different integration approach (ArcGIS REST API vs Socrata SODA)

#### Fields (from documentation)
- `Incident_ID`
- `Status`
- `Service_Type`
- `Latitude`, `Longitude`
- `Date_Created`, `Date_Last_Updated`
- `Department`

#### Conclusion
San Jose does not have a current, accessible Socrata API for 311 service requests. The ArcGIS service is outdated (2022 only) and was unavailable during testing.

---

### 5. Other Cities

#### Fremont
- **Reporting System**: Fremont App Data Dashboard
- **API Status**: No public API found
- **Notes**: Has dashboard showing service requests but no documented API endpoint

#### Hayward
- **Reporting System**: Access Hayward portal/app
- **API Status**: No public API found
- **Notes**: Uses SeeClickFix or similar platform, but no public data API

#### Richmond
- **Reporting System**: Report an Issue app, TransparentRichmond.org
- **API Status**: No public API found
- **Notes**: References data on TransparentRichmond.org but no Socrata API found

---

## Comparison Table

| City | Portal | Dataset ID | API Type | Status | Records | Coordinates | Filter Field |
|------|--------|------------|----------|--------|---------|-------------|--------------|
| **Oakland** | data.oaklandca.gov | quth-gb8e | Socrata | ✅ Active | ~370K | State Plane → WGS84 | `REQCATEGORY='ILLDUMP'` |
| **San Francisco** | data.sfgov.org | vw6y-z8j6 | Socrata | ✅ Available | 2,620+ | WGS84 (native) | `service_details='trash_dumping'` |
| **Los Angeles** | data.lacity.org | b7dx-7gc3 | Socrata | ✅ Available | ~114K | WGS84 (native) | `requesttype='Illegal Dumping Pickup'` |
| **Sacramento** | data.cityofsacramento.org | 5b9a9448... | ArcGIS Hub | ⚠️ Limited | Unknown | Unknown | `request_type='Illegal Dumping'` |
| **Berkeley** | data.cityofberkeley.info | N/A | N/A | ❌ Not Available | - | - | - |
| **San Jose** | data.sanjoseca.gov | 616 | ArcGIS | ⚠️ Limited | 2022 only | Unknown | Unknown |
| **Fremont** | N/A | N/A | N/A | ❌ No API | - | - | - |
| **Hayward** | N/A | N/A | N/A | ❌ No API | - | - | - |
| **Richmond** | N/A | N/A | N/A | ❌ No API | - | - | - |

---

## Integration Recommendations

### For San Francisco Integration

1. **Use Primary Filter**: `service_details='trash_dumping'` for most accurate illegal dumping data
2. **Consider Broader Filter**: Include "Bulky Items" if you want comprehensive coverage
3. **Coordinate Handling**: No conversion needed - use `lat` and `long` directly
4. **Field Mapping**: Map SF fields to match Oakland's structure for consistency

### Sample Integration Code

#### San Francisco API Integration

```typescript
// San Francisco API integration
async function fetchSFDumpingRequests(options: {
  year?: number;
  limit?: number;
  offset?: number;
}): Promise<DumpingRequest[]> {
  const { year, limit = 5000, offset = 0 } = options;

  let whereClause = "service_details='trash_dumping'";
  if (year) {
    whereClause += ` AND date_extract_y(requested_datetime)=${year}`;
  }

  const url = new URL("https://data.sfgov.org/resource/vw6y-z8j6.json");
  url.searchParams.set("$where", whereClause);
  url.searchParams.set("$limit", limit.toString());
  url.searchParams.set("$offset", offset.toString());
  url.searchParams.set("$order", "requested_datetime DESC");

  const response = await fetch(url.toString());
  const data: any[] = await response.json();

  return data
    .filter(record => record.lat && record.long)
    .map(record => ({
      id: record.service_request_id,
      lat: parseFloat(record.lat),
      lon: parseFloat(record.long),
      datetimeinit: record.requested_datetime,
      status: record.status_description || "",
      description: record.service_details || "",
      address: record.address || "",
    }));
}
```

#### Los Angeles API Integration

```typescript
// Los Angeles API integration
async function fetchLADumpingRequests(options: {
  year?: number;
  limit?: number;
  offset?: number;
}): Promise<DumpingRequest[]> {
  const { year, limit = 5000, offset = 0 } = options;

  let whereClause = "requesttype='Illegal Dumping Pickup'";
  if (year) {
    whereClause += ` AND date_extract_y(createddate)=${year}`;
  }

  const url = new URL("https://data.lacity.org/resource/b7dx-7gc3.json");
  url.searchParams.set("$where", whereClause);
  url.searchParams.set("$limit", limit.toString());
  url.searchParams.set("$offset", offset.toString());
  url.searchParams.set("$order", "createddate DESC");

  const response = await fetch(url.toString());
  const data: any[] = await response.json();

  return data
    .filter(record => record.latitude && record.longitude)
    .map(record => ({
      id: record.srnumber,
      lat: parseFloat(record.latitude),
      lon: parseFloat(record.longitude),
      datetimeinit: record.createddate,
      status: record.status || "",
      description: record.requesttype || "",
      address: record.address || "",
    }));
}
```

---

## Testing Results

### Test Script
A test script was created at `test-apis.ts` to verify API accessibility and data structures.

### San Francisco Test Results
- ✅ API accessible
- ✅ Data structure verified
- ✅ Illegal dumping filter confirmed: `service_details='trash_dumping'`
- ✅ Coordinates in WGS84 (no conversion needed)
- ✅ 2,620+ records found

### Berkeley Test Results
- ❌ No 311 dataset found
- ✅ Portal accessible
- ✅ PD Calls for Service dataset exists but not relevant

### San Jose Test Results
- ❌ ArcGIS service unavailable
- ⚠️ Only 2022 data (outdated)
- ❌ Not Socrata format

### Los Angeles Test Results
- ✅ MyLA311 2024 API accessible
- ✅ Data structure verified
- ✅ Illegal dumping filter confirmed: `requesttype='Illegal Dumping Pickup'`
- ✅ Coordinates in WGS84 (no conversion needed)
- ✅ ~114K records in 2024 (estimated)
- ✅ LASAN Abandoned Waste dataset tested (historical only, no coordinates)

### Sacramento Test Results
- ⚠️ ArcGIS Hub platform (not Socrata)
- ❌ Requires different API integration approach
- ⚠️ Dataset exists but API endpoints need investigation

---

## Limitations and Gaps

1. **Data Coverage**: SF has significantly fewer records (2,620) compared to Oakland (370K+)
   - May indicate different categorization
   - May indicate underreporting
   - Consider including "Bulky Items" for broader coverage

2. **Los Angeles**: Yearly datasets
   - May need to check for 2025 dataset availability
   - Yearly datasets require checking which year's dataset to use

3. **Sacramento**: Different platform
   - Uses ArcGIS Hub instead of Socrata
   - Requires different API integration approach

4. **Berkeley**: No public dataset available
   - Would require public records request or direct city contact

5. **San Jose**: Outdated and unavailable
   - 2022 data only
   - Service was down during testing

6. **Other Cities**: No APIs found
   - May require different approaches (scraping, public records requests)

---

## Next Steps

1. ✅ **San Francisco**: Ready for integration
   - API tested and working
   - Data structure documented
   - Sample code provided

2. ✅ **Los Angeles**: Ready for integration
   - API tested and working
   - Data structure documented
   - Sample code provided
   - Large dataset (~114K records in 2024)

3. **Sacramento**:
   - Investigate ArcGIS Hub API documentation
   - Test REST endpoints if available
   - Consider if supporting non-Socrata platforms is worthwhile

4. **Berkeley**: 
   - Submit public records request
   - Contact Public Works department
   - Check for alternative data sources

5. **San Jose**:
   - Monitor for updated ArcGIS service
   - Consider ArcGIS REST API integration if service becomes available
   - Check for newer Socrata datasets

6. **Other Cities**:
   - Investigate SeeClickFix APIs (used by some cities)
   - Check for alternative open data platforms
   - Consider public records requests for cities without APIs

---

## Resources

### API Documentation
- [Socrata SODA API Documentation](https://dev.socrata.com/)
- [Oakland 311 API Documentation](OAKLAND_311_API.md)
- [DataSF Documentation](https://docs.datasf.org/)

### City Portals
- [Oakland Open Data](https://data.oaklandca.gov/)
- [DataSF (San Francisco)](https://data.sfgov.org/)
- [DataLA (Los Angeles)](https://data.lacity.org/)
- [Sacramento Open Data](https://data.cityofsacramento.org/)
- [Berkeley Open Data](https://data.cityofberkeley.info/)
- [San Jose Open Data](https://data.sanjoseca.gov/)

### Related Links
- [SF 311 Service Requests by Neighborhood](https://www.sf.gov/data--311-service-requests-neighborhood)
- [Oakland Illegal Dumping Services](https://www.oaklandca.gov/News-Releases/Oakland-Increases-Weekend-Staffing-to-Boost-Illegal-Dumping-Cleanup-Crews)

---

## Changelog

- **2025-01-XX**: Initial research and documentation
  - Tested San Francisco API ✅
  - Investigated Berkeley portal ❌
  - Tested San Jose ArcGIS ⚠️
  - Documented findings

- **2025-01-XX**: Expanded research to Sacramento and Los Angeles
  - Tested Los Angeles APIs ✅
  - Investigated Sacramento portal ⚠️
  - Updated documentation with LA and Sacramento findings
  - Added integration code examples for Los Angeles

---

## Notes

- All API tests were performed in January 2025
- Service availability may change over time
- Some cities may add datasets in the future
- Consider periodic re-evaluation of available data sources
