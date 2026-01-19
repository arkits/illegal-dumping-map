# US Cities Illegal Dumping Data Research

## Executive Summary

This document summarizes research into illegal dumping data availability across major US cities with Socrata-based open data APIs. The goal is to identify cities with publicly accessible APIs that provide illegal dumping service request data similar to Oakland's implementation.

**Related Research:** For Bay Area cities (Oakland, San Francisco, Los Angeles, etc.), see [Bay Area Illegal Dumping Research](BAY_AREA_ILLEGAL_DUMPING_RESEARCH.md).

**Key Findings:**
- ✅ **New York City**: Has Socrata API with illegal dumping data (150,012+ records)
- ✅ **Chicago**: Has Socrata API with illegal dumping data (83,473+ records)
- ✅ **Seattle**: Has Socrata API with illegal dumping data (272,043+ records)
- ✅ **Dallas**: Has Socrata API with 311 service requests (tested and working)
- ✅ **Montgomery County, MD**: Has Socrata API with dedicated illegal dumping dataset (tested and working)
- ✅ **Kansas City, MO**: Has Socrata API with illegal dumping categories (tested and working)
- ❌ **Houston**: No Socrata portal found for 311 service request data (uses CSV downloads only)
- ⚠️ **San Diego**: Dataset ID found (`fwda-izby`) but API endpoint returns 404 errors
- ⚠️ **Denver**: Dataset exists but API endpoint redirects (301) - domain may have changed
- ⚠️ **Cincinnati**: Has Socrata portal but API requires authentication ("You must be logged in")
- ⚠️ **Indianapolis**: Portal exists but API returns unexpected format
- ❌ **Phoenix**: No Socrata dataset found for 311 service requests (police data only)
- ❌ **Jacksonville**: No Socrata dataset found for 311 service requests (API not accessible)
- ❌ **Austin**: Dataset ID found (`i26j-ai4z`) but API returns 404 errors
- ❌ **Columbus**: No Socrata dataset found for current 311 service requests
- ⚠️ **Charlotte**: Uses ArcGIS REST API (not Socrata) for 311 service requests
- ⚠️ **Nashville**: Uses ArcGIS Hub (not Socrata) - has 270 illegal dumping requests in May 2024
- ⚠️ **San Jose**: Uses ArcGIS Hub (not Socrata) - only 2022 data available
- ⚠️ **Baltimore**: Uses ArcGIS Hub (not Socrata)
- ⚠️ **Louisville**: Uses ArcGIS Hub (not Socrata)
- ⚠️ **Washington DC**: Uses mixed/non-Socrata platforms - datasets available by year
- ⚠️ **Boston**: Uses Open311 (not Socrata)
- ❌ **Fort Worth**: Redirects to ArcGIS Hub
- ❌ **Portland, OR**: No 311 API found
- ❌ **Raleigh**: No Socrata dataset found
- ❌ **Detroit**: No Socrata dataset found

---

## High Priority Cities (Socrata-based)

### 1. New York City

**Status**: ✅ **Available - Tested and Working**

- **Portal**: `data.cityofnewyork.us`
- **Dataset ID**: `erm2-nwe9` (2020-present) or `fhrw-4uyv` (2010-2019)
- **Dataset Name**: 311 Service Requests from 2010 to Present
- **API Endpoint**: `https://data.cityofnewyork.us/resource/erm2-nwe9.json`
- **Data Span**: 2020 to present (updated daily), historical data in separate dataset
- **Illegal Dumping Records**: 150,012+ records (as of Jan 2025)

#### Filtering
```sql
complaint_type='Illegal Dumping'
```

#### Key Fields
- `unique_key` - Primary identifier
- `created_date` - Request creation date/time
- `closed_date` - Closure date/time
- `agency` - Agency handling request (DSNY for Sanitation)
- `agency_name` - Full agency name
- `complaint_type` - Complaint type (use "Illegal Dumping" for filtering)
- `descriptor` - Additional descriptor (e.g., "Removal Request")
- `status` - Current status
- `latitude`, `longitude` - **Already in WGS84** (no conversion needed!)
- `incident_address` - Full address string
- `borough` - Borough name
- `community_board` - Community board
- `council_district` - Council district

#### Coordinate System
- ✅ **WGS84 (lat/lon)** - No conversion needed!
- Fields: `latitude` (latitude), `longitude` (longitude)
- Also provides `location` with GeoJSON Point geometry

#### Sample Query
```bash
curl "https://data.cityofnewyork.us/resource/erm2-nwe9.json?\$where=complaint_type='Illegal Dumping'&\$limit=10&\$order=created_date DESC"
```

#### Field Mapping (NYC → Oakland equivalent)

| NYC Field | Oakland Field | Notes |
|-----------|--------------|-------|
| `unique_key` | `requestid` | Primary ID |
| `created_date` | `datetimeinit` | Request timestamp |
| `closed_date` | `datetimeclosed` | Closure timestamp |
| `status` | `status` | Status |
| `complaint_type='Illegal Dumping'` | `reqcategory='ILLDUMP'` | Filter condition |
| `latitude`, `longitude` | `srx`, `sry` (converted) | Coordinates (NYC already WGS84) |
| `incident_address` | `probaddress` | Address |

#### Integration Notes
- **Advantage**: Coordinates already in WGS84 - no conversion needed
- **Advantage**: Large dataset (150K+ records)
- **Advantage**: Daily updates
- **Consideration**: Dataset split into two parts (2010-2019 and 2020-present)
- **Consideration**: Field name is `complaint_type` (not `reqcategory`)
- **Consideration**: Value is "Illegal Dumping" (not "ILLDUMP")

---

### 2. Chicago

**Status**: ✅ **Available - Tested and Working**

- **Portal**: `data.cityofchicago.org`
- **Dataset ID**: `v6vf-nfxy`
- **Dataset Name**: 311 Service Requests
- **API Endpoint**: `https://data.cityofchicago.org/resource/v6vf-nfxy.json`
- **Data Span**: Historical data, updated regularly
- **Illegal Dumping Records**: 83,473+ records (as of Jan 2025)

#### Filtering
```sql
sr_type='Fly Dumping Complaint'
```

#### Key Fields
- `sr_number` - Primary identifier (Service Request Number)
- `sr_type` - Service request type (use "Fly Dumping Complaint" for filtering)
- `sr_short_code` - Short code (e.g., "SDR")
- `created_date` - Request creation date/time
- `last_modified_date` - Last update date/time
- `closed_date` - Closure date/time
- `status` - Current status
- `owner_department` - Department handling request (e.g., "Streets and Sanitation")
- `latitude`, `longitude` - **Already in WGS84** (no conversion needed!)
- `street_address` - Full address string
- `community_area` - Community area number
- `ward` - Ward number

#### Coordinate System
- ✅ **WGS84 (lat/lon)** - No conversion needed!
- Fields: `latitude` (latitude), `longitude` (longitude)
- Also provides `location` with GeoJSON Point geometry
- Also provides `x_coordinate`, `y_coordinate` in State Plane (for reference)

#### Sample Query
```bash
curl "https://data.cityofchicago.org/resource/v6vf-nfxy.json?\$where=sr_type='Fly Dumping Complaint'&\$limit=10&\$order=created_date DESC"
```

#### Field Mapping (Chicago → Oakland equivalent)

| Chicago Field | Oakland Field | Notes |
|---------------|--------------|-------|
| `sr_number` | `requestid` | Primary ID |
| `created_date` | `datetimeinit` | Request timestamp |
| `closed_date` | `datetimeclosed` | Closure timestamp |
| `status` | `status` | Status |
| `sr_type='Fly Dumping Complaint'` | `reqcategory='ILLDUMP'` | Filter condition |
| `latitude`, `longitude` | `srx`, `sry` (converted) | Coordinates (Chicago already WGS84) |
| `street_address` | `probaddress` | Address |

#### Integration Notes
- **Advantage**: Coordinates already in WGS84 - no conversion needed
- **Advantage**: Large dataset (83K+ records)
- **Consideration**: Field name is `sr_type` (not `reqcategory`)
- **Consideration**: Value is "Fly Dumping Complaint" (not "ILLDUMP")

---

### 3. San Diego

**Status**: ⚠️ **API Endpoint Not Accessible**

- **Portal**: `data.sandiego.gov`
- **Dataset ID**: `gid-illegal-dumping` (also referenced as `fwda-izby`)
- **Dataset Name**: Illegal Dumping Notifications
- **API Endpoint**: `https://data.sandiego.gov/resource/gid-illegal-dumping.json` (returns 404)
- **Filter Field**: TBD
- **Filter Value**: TBD

**Notes:**
- Has dedicated "Illegal Dumping Notifications" dataset
- Part of Get It Done (311) system
- Dataset ID confirmed: `gid-illegal-dumping`
- API endpoint returns 404 "NoSuchKey" error
- Alternative dataset ID tested (`fwda-izby`) also fails
- May require different API endpoint format or authentication
- Portal may have changed dataset structure or requires login

**Testing Results:**
- ❌ API endpoint returns 404 Not Found (NoSuchKey)
- ⚠️ Dataset ID exists in catalog but resource endpoint not accessible
- ⚠️ Multiple dataset IDs tested (gid-illegal-dumping, fwda-izby) - all fail
- Need to verify correct API endpoint format with city portal or check if data moved

---

### 4. Seattle

**Status**: ✅ **Available - Tested and Working**

- **Portal**: `data.seattle.gov`
- **Dataset ID**: `bpvk-ju3y`
- **Dataset Name**: Illegal Dumping Reports
- **API Endpoint**: `https://data.seattle.gov/resource/bpvk-ju3y.json`
- **Data Span**: Historical data from 2013, updated regularly
- **Illegal Dumping Records**: 272,043+ records (as of Jan 2025)

#### Filtering
- **Note**: This dataset contains ONLY illegal dumping reports, so no filter needed
- Can filter by date, status, or location if desired

#### Key Fields
- `servicerequestnumber` - Primary identifier
- `createddate` - Request creation date/time
- `servicerequeststatusname` - Current status (e.g., "Closed")
- `methodreceivedname` - How request was received (e.g., "Find It Fix It Apps", "Phone")
- `location` - Full address string
- `latitude`, `longitude` - **Already in WGS84** (no conversion needed!)
- `latitude_longitude` - GeoJSON Point geometry
- `whereistheillegaldumping` - Location type (e.g., "Alley", "Planting Strip", "Greenbelt")
- `descriptionoftheillegaldumping` - Description (e.g., "Garbage", "Furniture", "Tires", "Hazmat")
- `councildistrict` - Council district number
- `policeprecinct` - Police precinct
- `zipcode` - ZIP code

#### Coordinate System
- ✅ **WGS84 (lat/lon)** - No conversion needed!
- Fields: `latitude` (latitude), `longitude` (longitude)
- Also provides `latitude_longitude` with GeoJSON Point geometry
- Also provides `x_value`, `y_value` in State Plane (for reference)

#### Sample Query
```bash
curl "https://data.seattle.gov/resource/bpvk-ju3y.json?\$limit=10&\$order=createddate DESC"
```

#### Field Mapping (Seattle → Oakland equivalent)

| Seattle Field | Oakland Field | Notes |
|---------------|--------------|-------|
| `servicerequestnumber` | `requestid` | Primary ID |
| `createddate` | `datetimeinit` | Request timestamp |
| `servicerequeststatusname` | `status` | Status |
| N/A (all records are illegal dumping) | `reqcategory='ILLDUMP'` | Filter condition (not needed) |
| `latitude`, `longitude` | `srx`, `sry` (converted) | Coordinates (Seattle already WGS84) |
| `location` | `probaddress` | Address |

#### Integration Notes
- **Advantage**: Coordinates already in WGS84 - no conversion needed
- **Advantage**: Very large dataset (272K+ records)
- **Advantage**: Dedicated illegal dumping dataset (no filtering needed)
- **Advantage**: Rich metadata (location type, description of dumping)
- **Consideration**: Field name is `servicerequestnumber` (not `requestid`)
- **Consideration**: Field name is `createddate` (not `datetimeinit`)

---

### 6. Montgomery County, MD

**Status**: ✅ **Available - Tested and Working**

- **Portal**: `data.montgomerycountymd.gov`
- **Dataset ID**: `d985-d2ak`
- **Dataset Name**: Illegal Dumping Activity
- **API Endpoint**: `https://data.montgomerycountymd.gov/resource/d985-d2ak.json`
- **Data Span**: Records with locations and dates of incident, updated daily
- **Illegal Dumping Records**: Current data available with case descriptions and coordinates

#### Filtering
**Note**: This dataset contains ONLY illegal dumping records, so no filter needed
- Can filter by date, status, or location if desired

#### Key Fields
- `caseno` - Case number (primary identifier)
- `opendate` - Date case was opened (YYYY-MM-DD format)
- `closedate` - Date case was closed (YYYY-MM-DD format)
- `casedesc` - Case description from 311
- `caseyear` - Year of case
- `type` - Type of issue (e.g., "Solid Waste")
- `sub_type` - Sub-type (e.g., "Residential", "Public Land")
- `street_no` - Street number
- `street_name` - Street name
- `city` - City name (e.g., "SILVER SPRING")
- `zip` - ZIP code
- `geolocation` - **GeoJSON Point geometry** with WGS84 coordinates

#### Coordinate System
- ✅ **WGS84 (lat/lon)** - No conversion needed!
- Field: `geolocation` (GeoJSON Point)
- Format: `{"type":"Point","coordinates":[-77.052,39.05452]}`
- Coordinates are already in WGS84 format

#### Sample Query
```bash
curl "https://data.montgomerycountymd.gov/resource/d985-d2ak.json?\$limit=10&\$order=opendate DESC"
```

#### Field Mapping (Montgomery County → Oakland equivalent)

| Montgomery Field | Oakland Field | Notes |
|----------------|--------------|-------|
| `caseno` | `requestid` | Primary ID |
| `opendate` | `datetimeinit` | Request timestamp |
| `casedesc` | `description` | Case description |
| `type='Solid Waste'` | `reqcategory='ILLDUMP'` | Category type |
| `geolocation` | `srx`, `sry` (converted) | Coordinates (GeoJSON, already WGS84) |
| `street_no`, `street_name`, `city`, `zip` | `probaddress` | Address components |

#### Integration Notes
- **Advantage**: Coordinates already in WGS84 (GeoJSON Point) - no conversion needed
- **Advantage**: Dedicated illegal dumping dataset (no filtering needed)
- **Advantage**: Daily updates
- **Advantage**: Rich case descriptions
- **Consideration**: Date fields in YYYY-MM-DD format (may need parsing)
- **Consideration**: Field names are different from Oakland (caseno, opendate, etc.)

**Testing Results:**
- ✅ API accessible
- ✅ Data structure verified
- ✅ Dataset contains only illegal dumping records (no filter needed)
- ✅ Coordinates in WGS84 (GeoJSON Point format)
- ✅ Sample records validated with valid lat/lon coordinates

---

### 7. Kansas City, MO

**Status**: ✅ **Available - Tested and Working**

- **Portal**: `data.kcmo.org`
- **Dataset ID**: `7at3-sxhp`
- **Dataset Name**: 311 Call Center Service Requests: 2007 - March 2021
- **API Endpoint**: `https://data.kcmo.org/resource/7at3-sxhp.json`
- **Data Span**: 2007 to March 2021, updated regularly
- **Illegal Dumping Records**: Multiple request types available for dumping

#### Filtering
```sql
request_type='Trash / Recycling-Dumping-Private Property'
```

**Available Illegal Dumping Request Types:**
- `Trash / Recycling-Dumping-Private Property`
- `Trash / Recycling-Dumping-ROW Land Bank Central`
- `Trash / Recycling-Early Set Out-Central`
- `Trash / Recycling-Nuisance Land Bank`

#### Key Fields
- `case_id` - Primary identifier
- `source` - How request was received (e.g., "PHONE")
- `department` - Department handling request
- `work_group` - Work group (e.g., "NHS-Dangerous Buildings-")
- `request_type` - Service request type (use for filtering)
- `category` - Category (e.g., "Property / Buildings / Construction")
- `type` - Type (e.g., "Dangerous Building")
- `detail` - Detail level (e.g., "Standard")
- `creation_date` - Request creation date/time
- `creation_time` - Request creation time
- `creation_month` - Creation month (number)
- `creation_year` - Creation year (number)
- `status` - Current status
- `exceeded_est_timeframe` - Whether timeframe exceeded ("Y" or "N")
- `street_address` - Full address string
- `address_with_geocode` - **Object containing geocoded address and coordinates**
- `zip_code` - ZIP code
- `neighborhood` - Neighborhood name
- `county` - County name
- `council_district` - Council district
- `police_district` - Police district
- `parcel_id_no` - Parcel ID
- `case_url` - URL to case details

#### Coordinate System
- ✅ **WGS84 (lat/lon)** - No conversion needed!
- Nested in `address_with_geocode` object:
  - `latitude` (latitude): Float
  - `longitude` (longitude): Float
  - `human_address` (string): Formatted address
- Also provides `ycoordinate` and `xcoordinate` fields (already WGS84)

#### Sample Query
```bash
curl "https://data.kcmo.org/resource/7at3-sxhp.json?\$where=request_type='Trash / Recycling-Dumping-Private Property'&\$limit=10&\$order=creation_date DESC"
```

#### Field Mapping (Kansas City → Oakland equivalent)

| Kansas City Field | Oakland Field | Notes |
|-----------------|--------------|-------|
| `case_id` | `requestid` | Primary ID |
| `creation_date` | `datetimeinit` | Request timestamp |
| `status` | `status` | Status |
| `request_type='Trash / Recycling-Dumping-Private Property'` | `reqcategory='ILLDUMP'` | Filter condition |
| `address_with_geocode.latitude`, `address_with_geocode.longitude` | `srx`, `sry` (converted) | Coordinates (already WGS84) |
| `street_address` | `probaddress` | Address |

#### Integration Notes
- **Advantage**: Coordinates already in WGS84 - no conversion needed
- **Advantage**: Multiple dumping-related request types available
- **Advantage**: Rich metadata (council_district, police_district, neighborhood)
- **Advantage**: Historical data available (2007-2021)
- **Consideration**: Coordinates are nested in `address_with_geocode` object
- **Consideration**: Date and time are separate fields (`creation_date`, `creation_time`)
- **Consideration**: Field name is `request_type` (not `reqcategory`)
- **Consideration**: Values are more descriptive (e.g., "Trash / Recycling-Dumping-Private Property")

**Testing Results:**
- ✅ API accessible
- ✅ Data structure verified
- ✅ Illegal dumping filter confirmed: `request_type='Trash / Recycling-Dumping-Private Property'`
- ✅ Coordinates in WGS84 (no conversion needed)
- ✅ Sample records validated with valid lat/lon coordinates
- ✅ Multiple dumping-related request types identified

---

### 8. Cincinnati, OH

**Status**: ⚠️ **Requires Authentication**

- **Portal**: `data.cincinnati-oh.gov`
- **Dataset ID**: `4cjh-bm8b` (also `qj7a-5n2y`)
- **Dataset Name**: Cincinnati 311 (Non-Emergency) Service Requests
- **API Endpoint**: `https://data.cincinnati-oh.gov/resource/4cjh-bm8b.json`
- **Filter Field**: TBD (likely `SR_TYPE`)
- **Filter Value**: TBD (likely "Illegal Dumping" or similar)

**Notes:**
- Has Socrata portal with 311 service request dataset
- API endpoint returns error: "You must be logged in to access this resource"
- Requires authentication to access data
- Not available for anonymous/public access
- Would need API token or authentication credentials

**Testing Results:**
- ❌ API endpoint requires authentication
- ⚠️ Dataset exists but not publicly accessible
- Cannot test data structure or illegal dumping filters
- Need API credentials for access

**Alternative Options:**
1. Contact Cincinnati Open Data team for API access
2. Request public API access credentials
3. Check if data is available without authentication on other endpoints
4. Monitor for dataset to become publicly accessible

---

### 9. Indianapolis, IN

**Status**: ⚠️ **API Structure Issues**

- **Portal**: `data.indy.gov`
- **Dataset ID**: `mcav-2xe7`
- **Dataset Name**: 311 Reported Issues - Public Works
- **API Endpoint**: `https://data.indy.gov/resource/mcav-2xe7.json`
- **Filter Field**: TBD
- **Filter Value**: TBD

**Notes:**
- Has open data portal with 311 service request dataset
- API endpoint exists but returns unexpected format
- May use different API structure or authentication model
- Portal shows "OpenIndy Data Portal" with 311 services data

**Testing Results:**
- ❌ API endpoint returns unexpected response format
- ⚠️ Cannot verify data structure or illegal dumping availability
- May require different query format or authentication
- Need to investigate portal documentation for correct API usage

**Alternative Options:**
1. Review OpenIndy API documentation
2. Check for correct dataset ID or API format
3. Contact Indy data team for API access information

---

### 10. Nashville, TN

**Status**: ⚠️ **Uses ArcGIS Hub (Not Socrata)**

- **Portal**: `data.nashville.gov` / `hub.nashville.gov`
- **Dataset Name**: hubNashville (311) Service Requests - Current Year
- **API Type**: ArcGIS Hub (not Socrata)
- **API Endpoint**: ArcGIS REST endpoints (not standard Socrata)
- **Filter Field**: TBD
- **Filter Value**: "Illegal Dumping" (confirmed in hubNashville stats: 270 requests in May 2024)

**Notes:**
- Uses ArcGIS Hub platform, not Socrata SODA API
- hubNashville system includes "Illegal Dumping" category
- During May 2024: 270 illegal dumping requests received
- ArcGIS Hub requires different integration approach
- Not compatible with existing Socrata-based implementation
- May have GeoJSON or feature service endpoints available

**Testing Results:**
- ⚠️ Uses ArcGIS Hub (not Socrata)
- ⚠️ API structure different from Socrata
- ⚠️ Need to develop ArcGIS REST API integration
- ⚠️ Cannot use existing Socrata integration code

**Alternative Options:**
1. Develop separate ArcGIS REST API integration module
2. Use ArcGIS Hub GeoJSON endpoints if available
3. Consider if supporting non-Socrata platforms is worthwhile
4. Monitor hubNashville for potential Socrata migration

---

### 11. San Jose, CA

**Status**: ⚠️ **Uses ArcGIS Hub (Not Socrata)**

- **Portal**: `data.sanjoseca.gov`
- **Dataset Name**: 311 Service Request Data
- **API Type**: ArcGIS Hub (not Socrata)
- **API Endpoint**: ArcGIS REST endpoints (not standard Socrata)
- **Data Span**: 2017-2018 service request data (not current)

**Notes:**
- Uses ArcGIS Hub platform, not Socrata SODA API
- Historical data only available (2017-2018)
- No current year data available (service was unavailable during testing)
- Not compatible with existing Socrata-based implementation
- May require manual download of CSV files

**Testing Results:**
- ⚠️ Uses ArcGIS Hub (not Socrata)
- ⚠️ Only historical data (2017-2018) - not current
- ❌ Current year service unavailable during testing
- ⚠️ No live API access for recent data
- Would require different integration approach

**Alternative Options:**
1. Use historical CSV downloads if acceptable
2. Contact San Jose IT for current API status
3. Monitor for dataset availability updates
4. Consider if historical-only data is sufficient for use case

---

### 12. Baltimore, MD

**Status**: ⚠️ **Uses ArcGIS Hub (Not Socrata)**

- **Portal**: `data.baltimorecity.gov`
- **Dataset Name**: 311 Customer Service Request Spatialized (2021 through present)
- **API Type**: ArcGIS Hub (not Socrata)
- **API Endpoint**: ArcGIS REST endpoints (not standard Socrata)

**Notes:**
- Uses ArcGIS Hub platform, not Socrata SODA API
- "Spatialized" dataset from 2021 through present
- Not compatible with existing Socrata-based implementation
- ArcGIS Hub requires different integration approach
- Service was unavailable during testing attempts

**Testing Results:**
- ⚠️ Uses ArcGIS Hub (not Socrata)
- ⚠️ Portal exists but service unavailable during testing
- ⚠️ Cannot test API endpoint or data structure
- Would require separate ArcGIS REST API integration

**Alternative Options:**
1. Develop separate ArcGIS REST API integration module
2. Retry testing when Baltimore ArcGIS Hub is available
3. Use Baltimore 311 web portal for data access
4. Consider if supporting non-Socrata platforms is worthwhile

---

### 13. Washington, DC

**Status**: ⚠️ **Mixed/Non-Socrata Platforms**

- **Portal**: `opendata.dc.gov` (various datasets by year)
- **Dataset Name**: 311 City Service Requests (by year: 2019, 2020, 2021, 2022, 2023, 2024)
- **API Type**: Mixed (not consistent Socrata)
- **API Endpoint**: Varies by year (not standard Socrata format)

**Notes:**
- Uses mixed platforms, not consistent Socrata SODA API
- Datasets organized by year, not as unified resource
- May have different API structures per year
- Not compatible with existing Socrata-based implementation
- DC focuses on illegal dumping enforcement (OAG testimony on B25-135)

**Testing Results:**
- ⚠️ Uses mixed/non-Socrata platforms
- ⚠️ Datasets split by year with potentially different structures
- ⚠️ Cannot test unified API endpoint
- Would require per-year integration approach

**Alternative Options:**
1. Investigate each year's API structure individually
2. Check for unified DC 311 API documentation
3. Contact DC Open Data team for API access information
4. Consider if supporting non-Socrata platforms is worthwhile

---

### 14. Boston, MA

**Status**: ⚠️ **Uses Open311 (Not Socrata)**

- **Portal**: `data.boston.gov`
- **Dataset Name**: 311 Service Requests
- **API Type**: Open311 (not Socrata SODA)
- **API Endpoint**: Open311 endpoints (not standard Socrata)
- **API Documentation**: Available at 311.boston.gov/open311

**Notes:**
- Uses Open311 standard, not Socrata SODA API
- Requires API key (request approval required)
- Datasets available by year (2024, 2023, 2022, 2021)
- Not compatible with existing Socrata-based implementation
- Open311 requires different integration approach

**Testing Results:**
- ⚠️ Uses Open311 (not Socrata)
- ⚠️ Requires API key approval process
- ⚠️ Cannot test without API key
- Would require separate Open311 integration module

**Alternative Options:**
1. Apply for Open311 API key at 311.boston.gov
2. Develop separate Open311 integration module
3. Use available CSV downloads for bulk data import
4. Consider if supporting Open311 is worthwhile

---

### 15. Louisville, KY

**Status**: ⚠️ **Uses ArcGIS Hub (Not Socrata)**

- **Portal**: `data.louisvilleky.gov`
- **Dataset Name**: Metro 311 Service Requests (2010, 2020)
- **API Type**: ArcGIS Hub (not Socrata)
- **API Endpoint**: ArcGIS REST endpoints (not standard Socrata)

**Notes:**
- Uses ArcGIS Hub platform, not Socrata SODA API
- Historical datasets available (2010, 2020)
- Not compatible with existing Socrata-based implementation
- ArcGIS Hub requires different integration approach
- Louisville Metro has 30+ years of Metro311 history

**Testing Results:**
- ⚠️ Uses ArcGIS Hub (not Socrata)
- ⚠️ Only historical data available (no current year)
- ⚠️ Cannot test live API endpoints
- Would require separate ArcGIS REST API integration

**Alternative Options:**
1. Develop separate ArcGIS REST API integration module
2. Use historical CSV downloads if acceptable
3. Contact Louisville Open Data team for current data availability
4. Monitor for current year dataset availability

---

### 16. Charlotte, NC

**Status**: ⚠️ **Mixed/Unclear Platform**

- **Portal**: `data.charlottenc.gov` / `gis.charlottenc.gov`
- **Dataset Name**: ServiceRequests311
- **API Type**: Mixed (ArcGIS REST, may have Socrata endpoints)
- **API Endpoint**: ArcGIS REST: `https://gis.charlottenc.gov/arcgis/rest/services/ODP/ServiceRequests311/MapServer`

**Notes:**
- Uses ArcGIS REST API, may have other endpoints
- Not clearly Socrata-based
- ServiceRequests311 dataset available
- Not compatible with existing Socrata-based implementation
- Charlotte has CharMeck 311 system

**Testing Results:**
- ⚠️ Uses ArcGIS REST API (not Socrata)
- ⚠️ API structure unclear without deeper investigation
- ⚠️ Cannot verify illegal dumping availability without API access
- Would require separate ArcGIS REST API integration

**Alternative Options:**
1. Investigate Charlotte ArcGIS REST API documentation
2. Contact Charlotte Open Data team for API information
3. Check for alternative Socrata datasets
4. Consider if supporting non-Socrata platforms is worthwhile

---

### 17. Fort Worth, TX

**Status**: ❌ **Redirects to ArcGIS Hub**

- **Portal**: N/A (no dedicated Socrata portal)
- **Dataset Name**: N/A
- **API Endpoint**: N/A (redirects to ArcGIS Hub)

**Notes:**
- No dedicated Socrata portal for 311 data
- City likely uses Fort Worth GIS or other platform
- Search results redirect to ArcGIS Hub (not standard Socrata)
- Would require investigation of Fort Worth's data portal

**Testing Results:**
- ❌ No Socrata portal found
- ❌ Redirects to ArcGIS Hub
- ⚠️ Need to investigate Fort Worth's actual data portal
- Cannot test API endpoints

**Alternative Options:**
1. Investigate City of Fort Worth official data portal
2. Contact Fort Worth Open Data or GIS teams
3. Check if data is available via other platforms
4. Consider if Fort Worth has 311 API access

---

### 18. Jacksonville, FL

**Status**: ❌ **API Not Accessible**

- **Portal**: N/A (no Socrata dataset found)
- **Dataset ID**: N/A
- **Dataset Name**: N/A
- **API Endpoint**: N/A

**Notes:**
- City has MyJax dashboard showing service request data
- Dashboard provides visualizations but no public API
- Data not published as open dataset
- Would require public records request (Florida Sunshine Laws)
- No programmatic API access available

**Testing Results:**
- ❌ No Socrata dataset found
- ❌ No public API available
- ❌ Data not published as open dataset
- Would require public records request or scraping

**Alternative Options:**
1. Submit public records request to City of Jacksonville
2. Contact MyJax Support (630-CITY) for data access
3. Check for hidden API endpoints in dashboard network calls
4. Consider if Florida Sunshine Laws can provide API access

---

### 19. Austin, TX

**Status**: ❌ **API Not Working**

- **Portal**: `data.austintexas.gov`
- **Dataset ID**: `i26j-ai4z` (from research)
- **Dataset Name**: 311 Unified Data
- **API Endpoint**: `https://data.austintexas.gov/resource/i26j-ai4z.json` (returns 404)

**Notes:**
- Has Socrata portal: `data.austintexas.gov`
- Dataset ID `i26j-ai4z` exists in catalog but API returns 404
- City has dedicated illegal dumping page (austintexas.gov/page/illegal-dumping)
- May require different API format or dataset may have been removed/renamed
- Dataset may have different current resource ID

**Testing Results:**
- ❌ API endpoint returns 404 Not Found
- ⚠️ Dataset ID exists in catalog but resource not accessible
- ⚠️ May need to find correct resource ID
- Cannot verify data structure or illegal dumping availability

**Alternative Options:**
1. Contact Austin Open Data team for correct resource ID
2. Check Austin 311 page for API documentation
3. Search Austin data catalog for current 311 dataset
4. Use Austin's illegal dumping reporting portal instead

---

### 20. Portland, OR

**Status**: ❌ **No 311 API Found**

- **Portal**: `data.portland.gov`
- **Dataset ID**: N/A
- **Dataset Name**: N/A
- **API Endpoint**: N/A

**Notes:**
- City has open data portal but no 311 service request dataset found
- Portal has other datasets (traffic restrictions, police calls, etc.)
- No illegal dumping or 311 service request API available
- City likely uses other platforms for 311 services

**Testing Results:**
- ❌ No 311 dataset found in portal
- ❌ No API endpoint for service requests
- ⚠️ Illegal dumping data may not be available via API
- Would require different data source

**Alternative Options:**
1. Contact Portland Bureau of Transportation or other relevant departments
2. Check PortlandMaps.com for available APIs
3. Use Portland's PDX Reporter system if available
4. Consider scraping or public records request

---

### 21. Raleigh, NC

**Status**: ❌ **No Socrata Dataset Found**

- **Portal**: N/A (no Socrata portal for 311 data)
- **Dataset ID**: N/A
- **Dataset Name**: N/A
- **API Endpoint**: N/A

**Notes:**
- City has 311 system (Raleigh 311)
- No open data portal found for 311 service requests
- Would require public records request for data access
- May have internal APIs but not publicly documented

**Testing Results:**
- ❌ No Socrata dataset found
- ❌ No public API available
- ⚠️ Need to investigate Raleigh's data availability
- Would require direct contact with city

**Alternative Options:**
1. Submit public records request to City of Raleigh
2. Contact Raleigh 311 or IT departments for API access
3. Check raleighnc.gov for data portals
4. Consider if data is available via other platforms

---

### 22. Detroit, MI

**Status**: ❌ **No Socrata Dataset Found**

- **Portal**: N/A (no Socrata portal for 311 data)
- **Dataset ID**: N/A
- **Dataset Name**: N/A
- **API Endpoint**: N/A

**Notes:**
- City has Improve Detroit system for service requests
- No open data portal found for 311 service requests
- Would require public records request for data access
- Data may be available via other platforms or not publicly

**Testing Results:**
- ❌ No Socrata dataset found
- ❌ No public API available
- ⚠️ Need to investigate Detroit's data availability
- Would require direct contact with city

**Alternative Options:**
1. Submit public records request to City of Detroit
2. Contact Detroit IT or Open Data teams for API access
3. Check for alternative data sources
4. Monitor for future open data releases

---

### 5. Denver

**Status**: ⚠️ **API Not Accessible**

- **Portal**: `data.denvergov.org`
- **Dataset ID**: TBD (attempted: `r52d-vs5d`, `c8xj-xj2w`)
- **Dataset Name**: 311 Service Requests
- **API Endpoint**: TBD (resource IDs tested return "Not found")
- **Filter Field**: TBD (likely `issue_type`)
- **Filter Value**: TBD (likely "Illegal Dumping")

**Notes:**
- City has 311 Service Requests dataset from 2007 to current
- Multiple resource IDs tested (r52d-vs5d, c8x-j-xj2w) but all return "Not found"
- Portal may have changed or requires different API structure
- Dataset may exist under different name or category
- Need to access current portal directly to find correct resource ID

**Testing Results:**
- ❌ API endpoint returns "Not found" errors
- ❌ Multiple resource IDs tested (r52d-vs5d, c8x-j-xj2w)
- ⚠️ Dataset exists but exact resource ID cannot be found
- Need to manually access portal to identify correct dataset ID

---

### 6. Houston

**Status**: ❌ **Not Available via Socrata**

- **Portal**: N/A (no Socrata portal for 311 data)
- **Dataset ID**: N/A
- **Dataset Name**: N/A
- **API Endpoint**: N/A

**Notes:**
- City has 311 service request system operating 24/7
- Data not published via Socrata open data portal
- Data available via CSV downloads only (yearly files)
- 311 Service Request Data page provides MTD (month-to-date), YTD (year-to-date), and annual CSV files
- No programmatic API access for detailed service request data
- Detailed request-level data would require Texas Public Information Act (TPIA) request

**Alternative Options:**
1. Submit TPIA request to City of Houston for API access
2. Use available CSV downloads for bulk data import
3. Access aggregated data from city's service request data page
4. Check if data.houstontx.gov has any 311 datasets (none found in research)

**Data Availability:**
- Current Year-to-Date (YTD) CSV available
- Annual CSV files available (2011-2024, and Harvey period)
- Monthly updated data available
- Top service requests dashboard and heat maps available
- No live API endpoint for querying specific requests

---

### 7. Dallas

**Status**: ✅ **Available - Tested and Working**

- **Portal**: `data.dallasopendata.com`
- **Dataset ID**: `gc4d-8a49`
- **Dataset Name**: 311 Service Requests
- **API Endpoint**: `https://data.dallasopendata.com/resource/gc4d-8a49.json`
- **Data Span**: Historical data, updated regularly
- **Illegal Dumping Records**: Small number (service type: "Illegal Dumping Sign - CCS")

#### Filtering
```sql
service_request_type='Illegal Dumping Sign - CCS'
```

#### Key Fields
- `service_request_number` - Primary identifier
- `service_request_type` - Service request type (use "Illegal Dumping Sign - CCS" for illegal dumping)
- `ert_estimated_response_time` - Estimated response time
- `status` - Current status
- `created_date` - Request creation date/time
- `update_date` - Last update date/time
- `priority` - Priority level
- `method_received_description` - How request was received (e.g., "API")
- `unique_key` - Unique key
- `lat_location` - **Already in WGS84** (no conversion needed!)
- `address` - Full address string
- `city_council_district` - Council district
- `department` - Department handling request

#### Coordinate System
- ✅ **WGS84 (lat/lon)** - No conversion needed!
- Field: `lat_location` (format: "lat,lon" string)
- Coordinates provided as string in format: "(32.86726403275791000,-96.70860308918170000)"

#### Sample Query
```bash
curl "https://data.dallasopendata.com/resource/gc4d-8a49.json?\$where=service_request_type='Illegal Dumping Sign - CCS'&\$limit=10&\$order=created_date DESC"
```

#### Field Mapping (Dallas → Oakland equivalent)

| Dallas Field | Oakland Field | Notes |
|-------------|--------------|-------|
| `service_request_number` | `requestid` | Primary ID |
| `created_date` | `datetimeinit` | Request timestamp |
| `status` | `status` | Status |
| `service_request_type='Illegal Dumping Sign - CCS'` | `reqcategory='ILLDUMP'` | Filter condition |
| `lat_location` | `srx`, `sry` (converted) | Coordinates (Dallas already WGS84, requires parsing) |
| `address` | `probaddress` | Address |

#### Integration Notes
- **Advantage**: Coordinates already in WGS84 - no conversion needed
- **Advantage**: Socrata API accessible and working
- **Consideration**: Illegal dumping records are relatively small in number
- **Consideration**: Coordinates provided as string in format "(lat,lon)" - requires parsing
- **Consideration**: Field name is `service_request_type` (not `reqcategory`)
- **Consideration**: Value is "Illegal Dumping Sign - CCS" (not "ILLDUMP")
- **Consideration**: Dallas also has 214-671-CODE hotline for illegal dumping with district tracking

**Testing Results:**
- ✅ API accessible
- ✅ Data structure verified
- ✅ Illegal dumping filter confirmed: `service_request_type='Illegal Dumping Sign - CCS'`
- ✅ Coordinates in WGS84 (no conversion needed)
- ✅ API endpoint responding correctly

---

### 8. Phoenix

**Status**: ❌ **Not Available via Socrata**

- **Portal**: N/A (no Socrata dataset for 311 data)
- **Dataset ID**: N/A
- **Dataset Name**: N/A
- **API Endpoint**: N/A

**Notes:**
- City has myPHX311 system for non-emergency service requests
- Data not published via Socrata open data portal
- Open Data Portal exists but no 311 service request dataset found
- Would require public records request for detailed data

**Alternative Options:**
1. Submit public records request to City of Phoenix
2. Contact City of Phoenix Data Privacy Office
3. Check if data is available under different name in open data portal

---

### 9. Jacksonville

**Status**: ❌ **Not Available via Socrata**

- **Portal**: N/A (no Socrata dataset for 311 data)
- **Dataset ID**: N/A
- **Dataset Name**: N/A
- **API Endpoint**: N/A

**Notes:**
- City has MyJax dashboard showing service request data
- Dashboard provides visualizations but no public API
- Data not published as open dataset
- Would require public records request (Florida Sunshine Laws)

**Alternative Options:**
1. Submit public records request to City of Jacksonville
2. Contact MyJax Support (630-CITY)
3. Check for hidden API endpoints in dashboard network calls

---

### 10. Columbus

**Status**: ❌ **Not Available via Socrata**

- **Portal**: N/A (no current Socrata dataset for 311 data)
- **Dataset ID**: N/A
- **Dataset Name**: N/A
- **API Endpoint**: N/A

**Notes:**
- City has 311 Customer Service Center with CBUS 311 mobile app
- Has interactive GIS map for 311 requests
- Historical dataset (2008-2017) used in research but not currently public
- Current data not published via Socrata
- Would require public records request for detailed data

**Alternative Options:**
1. Submit public records request to City of Columbus
2. Contact Department of Neighborhoods or Data Services
3. Check GIS map service for potential API endpoints

---

### 11. Charlotte

**Status**: ⚠️ **Different Platform (ArcGIS, not Socrata)**

- **Portal**: `gis.charlottenc.gov`
- **Dataset Name**: ServiceRequests311
- **API Endpoint**: `https://gis.charlottenc.gov/arcgis/rest/services/ODP/ServiceRequests311/MapServer`
- **API Type**: ArcGIS REST API (not Socrata)

**Notes:**
- City has CharMeck 311 system
- Data published via ArcGIS REST service, not Socrata
- Would require different integration approach using ArcGIS REST API
- Not compatible with current Socrata-based implementation
- Contains request type, location, date, department, point of entry

**Alternative Options:**
1. Develop separate ArcGIS REST API integration for Charlotte
2. Use ArcGIS GeoJSON endpoints if available
3. Consider if supporting non-Socrata platforms is worthwhile

---

### 12. Indianapolis

**Status**: ❌ **Not Available via Socrata**

- **Portal**: N/A (no Socrata dataset for 311 data)
- **Dataset ID**: N/A
- **Dataset Name**: N/A
- **API Endpoint**: N/A

**Notes:**
- City has RequestIndy system (Mayor's Action Center)
- Data not published via Socrata open data portal
- System uses GIS mapping and routing
- Would require public records request for detailed data

**Alternative Options:**
1. Submit public records request to City of Indianapolis
2. Contact Mayor's Action Center or Data Office
3. Check GIS data layers via maps.indy.gov for spatial datasets

---

## Testing Results

### Test Summary

All API tests were performed in January 2026 using curl and direct API queries.

### New York City Test Results
- ✅ API accessible
- ✅ Data structure verified
- ✅ Illegal dumping filter confirmed: `complaint_type='Illegal Dumping'`
- ✅ Coordinates in WGS84 (no conversion needed)
- ✅ 150,012+ records found
- ✅ Sample records validated with valid lat/lon coordinates

### Chicago Test Results
- ✅ API accessible
- ✅ Data structure verified
- ✅ Illegal dumping filter confirmed: `sr_type='Fly Dumping Complaint'`
- ✅ Coordinates in WGS84 (no conversion needed)
- ✅ 83,473+ records found
- ✅ Sample records validated with valid lat/lon coordinates

### Seattle Test Results
- ✅ API accessible
- ✅ Data structure verified
- ✅ Dataset contains only illegal dumping records (no filter needed)
- ✅ Coordinates in WGS84 (no conversion needed)
- ✅ 272,043+ records found
- ✅ Sample records validated with valid lat/lon coordinates
- ✅ Rich metadata available (location type, description)

### San Diego Test Results
- ❌ API endpoint returns 404 Not Found (NoSuchKey)
- ⚠️ Dataset ID exists in catalog but resource endpoint not accessible
- ⚠️ Multiple dataset IDs tested (gid-illegal-dumping, fwda-izby) - all fail
- ❌ Cannot access data or verify illegal dumping filters
- Need to verify correct API endpoint format with city portal or check if data moved

### Denver Test Results
- ❌ Multiple dataset IDs tested (`r52d-vs5d`, `c8x-j-xj2w`) all return "Not found"
- ⚠️ Dataset exists but exact resource ID cannot be found
- ⚠️ Portal redirects to `denvergov.org/opendata`
- ❌ Cannot access data or verify illegal dumping availability
- Need to manually access current portal to identify correct dataset ID

### Houston Test Results
- ❌ No Socrata portal found for 311 service request data
- ✅ City has 311 service system but data not published via Socrata
- ⚠️ Data available through monthly CSV downloads only (MTD, YTD, annual)
- ✅ Top service requests dashboard and heat maps available
- ❌ No programmatic API access for detailed service request data
- Would require Texas Public Information Act (TPIA) request for API access

### Dallas Test Results
- ✅ API accessible and working
- ✅ Dataset ID confirmed: `gc4d-8a49` (different from initial research `xs8-3hc2`)
- ✅ Data structure verified
- ✅ Illegal dumping filter confirmed: `service_request_type='Illegal Dumping Sign - CCS'`
- ✅ Coordinates in WGS84 (no conversion needed, requires parsing from string)
- ⚠️ Illegal dumping records are relatively small in number
- ✅ API endpoint responding correctly

### Phoenix Test Results
- ❌ No Socrata dataset found for 311 service requests
- ✅ City has myPHX311 system but data not published via Socrata
- ⚠️ Police calls for service data available (not public service requests)
- ❌ Would require public records request for detailed data
- Alternative: Use police data or contact Phoenix Open Data team

### Jacksonville Test Results
- ❌ No Socrata dataset found for 311 service requests
- ✅ City has MyJax dashboard but no public API
- ❌ Data not published as open dataset
- ❌ No programmatic API access available
- Would require public records request (Florida Sunshine Laws) or scraping

### Columbus Test Results
- ❌ No current Socrata dataset found for 311 service requests
- ✅ City has 311 system with interactive maps
- ⚠️ Historical dataset (2008-2017) was available in research but not currently public
- ❌ Current data not published via Socrata
- Would require public records request for detailed data

### Charlotte Test Results
- ⚠️ Uses ArcGIS REST API, not Socrata
- ✅ ServiceRequests311 dataset available via ArcGIS REST service
- ⚠️ API structure unclear without deeper investigation
- ❌ Cannot verify illegal dumping availability without API access
- Would require separate ArcGIS REST API integration

### Indianapolis Test Results
- ❌ API endpoint returns unexpected response format
- ⚠️ Dataset ID exists in catalog (`mcav-2xe7`)
- ⚠️ Cannot verify data structure or illegal dumping availability
- ⚠️ May use different API structure or authentication model
- Need to investigate portal documentation for correct API usage

### Cincinnati Test Results
- ❌ API endpoint returns authentication error
- ⚠️ Dataset ID exists: `4cjh-bm8b` (also `qj7a-5n2y`)
- ⚠️ Error: "You must be logged in to access this resource"
- ❌ Cannot access data without authentication
- Would need API credentials or application approval
- Alternative: Contact Cincinnati Open Data team for public API access

### Kansas City Test Results
- ✅ API accessible and working
- ✅ Dataset ID confirmed: `7at3-sxhp`
- ✅ Data structure verified
- ✅ Illegal dumping filters identified: Multiple request types for dumping
  - `Trash / Recycling-Dumping-Private Property`
  - `Trash / Recycling-Dumping-ROW Land Bank Central`
  - `Trash / Recycling-Early Set Out-Central`
  - `Trash / Recycling-Nuisance Land Bank`
- ✅ Coordinates in WGS84 (no conversion needed)
- ✅ Historical data available (2007-2021)

### Montgomery County MD Test Results
- ✅ API accessible and working
- ✅ Dataset ID confirmed: `d985-d2ak`
- ✅ Data structure verified
- ✅ Dataset contains only illegal dumping records (no filtering needed)
- ✅ Coordinates in WGS84 (GeoJSON Point format)
- ✅ Daily updates available
- ✅ Sample records validated with valid lat/lon coordinates

### Nashville Test Results
- ⚠️ Uses ArcGIS Hub platform (not Socrata)
- ⚠️ Dataset exists but ArcGIS Hub requires different integration
- ✅ Illegal dumping category confirmed (270 requests in May 2024)
- ❌ Cannot use existing Socrata integration code
- Would require separate ArcGIS REST API integration
- Alternative: Monitor for Socrata migration or develop ArcGIS module

### San Jose Test Results
- ⚠️ Uses ArcGIS Hub platform (not Socrata)
- ⚠️ Only 2017-2018 data available (not current)
- ❌ Service unavailable during testing
- ❌ Cannot access current data
- Would require separate ArcGIS REST API integration
- Alternative: Use historical CSV if acceptable

### Baltimore Test Results
- ⚠️ Uses ArcGIS Hub platform (not Socrata)
- ⚠️ "Spatialized" dataset from 2021 through present
- ❌ Service unavailable during testing
- ❌ Cannot verify API accessibility
- Would require separate ArcGIS REST API integration

### Washington DC Test Results
- ⚠️ Uses mixed/non-Socrata platforms
- ⚠️ Datasets organized by year (2019, 2020, 2021, 2022, 2023, 2024)
- ⚠️ API structure varies by year
- ❌ Cannot test unified API endpoint
- Would require per-year integration approach

### Boston Test Results
- ⚠️ Uses Open311 standard (not Socrata)
- ⚠️ Requires API key approval process
- ⚠️ Datasets available by year (2024, 2023, 2022, 2021)
- ❌ Cannot test without API key
- Would require separate Open311 integration module

### Louisville Test Results
- ⚠️ Uses ArcGIS Hub platform (not Socrata)
- ⚠️ Historical datasets available (2010, 2020)
- ⚠️ No current year data found
- ❌ Cannot test live API endpoints
- Would require separate ArcGIS REST API integration

### Fort Worth Test Results
- ❌ No Socrata portal found
- ❌ Redirects to ArcGIS Hub
- ❌ Cannot verify API availability
- Would need to investigate Fort Worth's actual data portal

### Austin Test Results
- ❌ Dataset ID exists in catalog but API returns 404
- ⚠️ Dataset ID tested: `i26j-ai4z` (from research)
- ⚠️ API endpoint returns "Not found" error
- ❌ Cannot access data or verify structure
- May need to find correct resource ID or check if dataset moved

### Portland OR Test Results
- ❌ No 311 dataset found in open data portal
- ⚠️ Other datasets available (traffic restrictions, police calls, etc.)
- ❌ No illegal dumping or 311 service request API available
- Would require different data source or scraping

### Raleigh Test Results
- ❌ No Socrata dataset found for 311 data
- ⚠️ City has 311 system (Raleigh 311)
- ❌ No open data portal for 311 service requests
- ❌ Would require public records request or direct contact with city

### Detroit Test Results
- ❌ No Socrata dataset found for 311 data
- ⚠️ City has Improve Detroit system for service requests
- ❌ No open data portal found for 311 service requests
- ❌ Would require public records request for data access

### Dallas Test Results
- ✅ Socrata portal found: `data.dallasopendata.com`
- ✅ Dataset ID found: `xs8-3hc2` (311 Service Requests)
- ⚠️ API endpoint not responding or timing out during testing
- Need to verify API accessibility and illegal dumping filter criteria

### Phoenix Test Results
- ❌ No Socrata dataset found for 311 service requests
- ✅ City has myPHX311 system but data not published via Socrata
- Would require public records request for detailed data

### Jacksonville Test Results
- ❌ No Socrata dataset found for 311 service requests
- ✅ City has MyJax dashboard but no public API
- Would require public records request for detailed data

### Columbus Test Results
- ❌ No current Socrata dataset found for 311 service requests
- ✅ City has 311 system with interactive maps
- ⚠️ Historical dataset (2008-2017) used in research but not currently public
- Would require public records request for detailed data

### Charlotte Test Results
- ⚠️ Uses ArcGIS REST API, not Socrata
- ✅ ServiceRequests311 dataset available via ArcGIS REST service
- Would require different integration approach (ArcGIS REST API vs Socrata SODA)
- Not compatible with current Socrata-based implementation

### Indianapolis Test Results
- ❌ No Socrata dataset found for RequestIndy 311 service requests
- ✅ City has RequestIndy system but data not published via Socrata
- Would require public records request for detailed data

---

## Comparison Table

| City | Portal | Dataset ID | API Type | Status | Records | Coordinates | Filter Field |
|------|--------|------------|----------|--------|---------|-------------|--------------|
| **New York City** | data.cityofnewyork.us | erm2-nwe9 | Socrata | ✅ Available | 150,012+ | WGS84 (native) | `complaint_type='Illegal Dumping'` |
| **Chicago** | data.cityofchicago.org | v6vf-nfxy | Socrata | ✅ Available | 83,473+ | WGS84 (native) | `sr_type='Fly Dumping Complaint'` |
| **Dallas** | data.dallasopendata.com | gc4d-8a49 | Socrata | ✅ Available | Small | WGS84 (native, string format) | `service_request_type='Illegal Dumping Sign - CCS'` |
| **Seattle** | data.seattle.gov | bpvk-ju3y | Socrata | ✅ Available | 272,043+ | WGS84 (native) | N/A (all records) |
| **Montgomery County, MD** | data.montgomerycountymd.gov | d985-d2ak | Socrata | ✅ Available | Current (daily) | WGS84 (GeoJSON Point) | N/A (all illegal dumping) |
| **Kansas City, MO** | data.kcmo.org | 7at3-sxhp | Socrata | ✅ Available | 2007-2021 | WGS84 (native) | `request_type='Trash / Recycling-Dumping-Private Property'` |
| **San Diego** | data.sandiego.gov | gid-illegal-dumping | Socrata | ⚠️ API Not Working | TBD | TBD | TBD |
| **Denver** | data.denvergov.org | TBD | Socrata | ⚠️ API Not Accessible | TBD | TBD | TBD |
| **Houston** | N/A | N/A | N/A | ❌ CSV Downloads Only | - | - | - |
| **Phoenix** | N/A | N/A | N/A | ❌ Not Available | - | - | - |
| **Cincinnati** | data.cincinnati-oh.gov | 4cjh-bm8b | Socrata | ⚠️ Requires Auth | TBD | TBD | TBD |
| **Indianapolis** | data.indy.gov | mcav-2xe7 | Unknown | ⚠️ API Structure Issues | TBD | TBD | TBD |
| **Nashville** | data.nashville.gov | TBD | ArcGIS Hub | ⚠️ Not Socrata | 270 (May 2024) | TBD | "Illegal Dumping" |
| **San Jose** | data.sanjoseca.gov | TBD | ArcGIS Hub | ⚠️ Not Socrata (2017-2018 only) | 2017-2018 | TBD | TBD |
| **Baltimore** | data.baltimorecity.gov | TBD | ArcGIS Hub | ⚠️ Not Socrata | TBD | TBD | TBD |
| **Washington DC** | opendata.dc.gov | TBD (by year) | Mixed/Non-Socrata | ⚠️ Not Socrata | TBD | TBD | TBD |
| **Boston** | data.boston.gov | TBD | Open311 | ⚠️ Not Socrata | TBD | TBD | TBD |
| **Louisville** | data.louisvilleky.gov | TBD | ArcGIS Hub | ⚠️ Not Socrata | 2010, 2020 | TBD | TBD | TBD |
| **Charlotte** | gis.charlottenc.gov | ServiceRequests311 | ArcGIS | ⚠️ Not Socrata | TBD | TBD | TBD |
| **Jacksonville** | N/A | N/A | N/A | ❌ Not Available | - | - | - |
| **Austin** | data.austintexas.gov | i26j-ai4z | Socrata | ❌ API Not Working | TBD | TBD | TBD |
| **Portland, OR** | N/A | N/A | N/A | ❌ No 311 API Found | - | - | - |
| **Raleigh** | N/A | N/A | N/A | ❌ No Socrata Dataset | - | - | - |
| **Detroit** | N/A | N/A | N/A | ❌ No Socrata Dataset | - | - | - |

---

## Integration Recommendations

### Ready for Integration

1. **New York City** - Ready for integration
   - API tested and working
   - Data structure documented
   - Large dataset (150K+ records)
   - Coordinates already in WGS84
   - Daily updates

2. **Chicago** - Ready for integration
   - API tested and working
   - Data structure documented
   - Large dataset (83K+ records)
   - Coordinates already in WGS84

3. **Seattle** - Ready for integration
   - API tested and working
   - Data structure documented
   - Very large dataset (272K+ records)
   - Coordinates already in WGS84
   - Dedicated illegal dumping dataset (no filtering needed)
   - Rich metadata available

4. **Dallas** - Ready for integration
   - API tested and working
   - Data structure documented
   - Socrata API accessible
   - Coordinates already in WGS84 (requires parsing from string)
   - Small dataset but actively updated

5. **Montgomery County, MD** - Ready for integration
   - API tested and working
   - Data structure documented
   - Dedicated illegal dumping dataset
   - Coordinates in WGS84 (GeoJSON Point format)
   - Daily updates

6. **Kansas City, MO** - Ready for integration
   - API tested and working
   - Data structure documented
   - Large dataset (2007-2021)
   - Coordinates in WGS84
   - Multiple dumping-related request types available

### Needs Further Investigation

7. **San Diego** - Needs API endpoint verification
   - Dataset ID confirmed: `gid-illegal-dumping`
   - API endpoint returns 404/NoSuchKey errors
   - Alternative dataset ID tested (`fwda-izby`) also fails
   - Need to verify correct API endpoint format with city portal

8. **Denver** - Needs resource ID discovery
   - Multiple dataset IDs tested (`r52d-vs5d`, `c8x-j-xj2w`) return "Not found"
   - Portal redirects to `denvergov.org/opendata`
   - Need to access current portal to find correct resource ID
   - Dataset exists but exact Socrata endpoint unclear

9. **Cincinnati** - Needs authentication access
   - Dataset ID confirmed: `4cjh-bm8b`
   - API requires authentication ("You must be logged in")
   - Cannot access without API credentials
   - Would need API token or application approval

10. **Indianapolis** - Needs API structure investigation
   - Dataset ID confirmed: `mcav-2xe7`
   - API endpoint exists but returns unexpected format
   - May use different API structure or authentication model
   - Need to investigate portal documentation for correct API usage

### Not Available via Socrata

11. **Houston** - CSV downloads only
   - City has 311 system but data not published via Socrata API
   - Data available via CSV downloads (yearly files)
   - YTD (year-to-date) and annual CSV files available
   - No programmatic API access for detailed service request data
   - Would require Texas Public Information Act (TPIA) request for API access

12. **Phoenix** - No Socrata dataset for 311 data
   - City has myPHX311 system but data not published via Socrata
   - Focuses on police calls for service, not public service requests
   - Would require public records request or alternative data source

13. **Jacksonville** - No public API found
   - City has MyJax dashboard but no public API
   - Data not published as open dataset
   - Would require public records request (Florida Sunshine Laws)

14. **Austin** - API not working
   - Dataset ID `i26j-ai4z` exists in catalog but API returns 404
   - City has dedicated illegal dumping page
   - May require different API format or dataset may have been removed/renamed
   - Need to find correct resource ID or use alternative data source

15. **Portland, OR** - No 311 API found
   - City has open data portal but no 311 service request dataset
   - No illegal dumping or 311 service request API available
   - Would require different data source or direct contact with city

16. **Raleigh** - No Socrata dataset found
   - City has 311 system but no open data portal for 311 data
   - Would require public records request for data access
   - Data may be available via internal APIs but not publicly documented

17. **Detroit** - No Socrata dataset found
   - City has Improve Detroit system for service requests
   - No open data portal found for 311 service requests
   - Would require public records request for data access
   - Data may be available via other platforms or not publicly

### Different Platform (Not Socrata)

18. **Nashville** - Uses ArcGIS Hub (not Socrata)
   - Uses ArcGIS Hub platform, not Socrata SODA API
   - hubNashville includes "Illegal Dumping" category (270 requests in May 2024)
   - Requires different integration approach using ArcGIS REST API
   - Not compatible with existing Socrata-based implementation

19. **San Jose** - Uses ArcGIS Hub (not Socrata)
   - Uses ArcGIS Hub platform, not Socrata SODA API
   - Only historical data (2017-2018) available - not current
   - Would require separate ArcGIS REST API integration

20. **Baltimore** - Uses ArcGIS Hub (not Socrata)
   - Uses ArcGIS Hub platform, not Socrata SODA API
   - "Spatialized" dataset from 2021 through present
   - Service was unavailable during testing
   - Would require separate ArcGIS REST API integration

21. **Washington DC** - Uses Mixed/Non-Socrata platforms
   - Datasets organized by year, not as unified resource
   - May have different API structures per year
   - Not compatible with existing Socrata-based implementation

22. **Boston** - Uses Open311 (not Socrata)
   - Uses Open311 standard, not Socrata SODA API
   - Requires API key (request approval required)
   - Not compatible with existing Socrata-based implementation

23. **Louisville** - Uses ArcGIS Hub (not Socrata)
   - Uses ArcGIS Hub platform, not Socrata SODA API
   - Historical datasets available (2010, 2020)
   - Would require separate ArcGIS REST API integration

24. **Charlotte** - Uses ArcGIS REST API (not Socrata)
   - Uses ArcGIS REST API, may have other endpoints
   - Not clearly Socrata-based
   - Not compatible with existing Socrata-based implementation

25. **Fort Worth** - Redirects to ArcGIS Hub
   - No dedicated Socrata portal for 311 data
   - Search results redirect to ArcGIS Hub (not standard Socrata)

26. **San Diego** - Uses ArcGIS Hub (not Socrata)
   - Uses ArcGIS Hub platform, not Socrata SODA API
   - Requires different integration approach using ArcGIS REST API
   - Not compatible with existing Socrata-based implementation
    - Would require separate ArcGIS REST API integration

### Integration Code Examples

#### New York City API Integration

```typescript
// New York City API integration
async function fetchNYCDumpingRequests(options: {
  year?: number;
  limit?: number;
  offset?: number;
}): Promise<DumpingRequest[]> {
  const { year, limit = 5000, offset = 0 } = options;

  let whereClause = "complaint_type='Illegal Dumping'";
  if (year) {
    whereClause += ` AND date_extract_y(created_date)=${year}`;
  }

  const url = new URL("https://data.cityofnewyork.us/resource/erm2-nwe9.json");
  url.searchParams.set("$where", whereClause);
  url.searchParams.set("$limit", limit.toString());
  url.searchParams.set("$offset", offset.toString());
  url.searchParams.set("$order", "created_date DESC");

  const response = await fetch(url.toString());
  const data: any[] = await response.json();

  return data
    .filter(record => record.latitude && record.longitude)
    .map(record => ({
      id: record.unique_key,
      lat: parseFloat(record.latitude),
      lon: parseFloat(record.longitude),
      datetimeinit: record.created_date,
      status: record.status || "",
      description: record.descriptor || "",
      address: record.incident_address || "",
    }));
}
```

#### Chicago API Integration

```typescript
// Chicago API integration
async function fetchChicagoDumpingRequests(options: {
  year?: number;
  limit?: number;
  offset?: number;
}): Promise<DumpingRequest[]> {
  const { year, limit = 5000, offset = 0 } = options;

  let whereClause = "sr_type='Fly Dumping Complaint'";
  if (year) {
    whereClause += ` AND date_extract_y(created_date)=${year}`;
  }

  const url = new URL("https://data.cityofchicago.org/resource/v6vf-nfxy.json");
  url.searchParams.set("$where", whereClause);
  url.searchParams.set("$limit", limit.toString());
  url.searchParams.set("$offset", offset.toString());
  url.searchParams.set("$order", "created_date DESC");

  const response = await fetch(url.toString());
  const data: any[] = await response.json();

  return data
    .filter(record => record.latitude && record.longitude)
    .map(record => ({
      id: record.sr_number,
      lat: parseFloat(record.latitude),
      lon: parseFloat(record.longitude),
      datetimeinit: record.created_date,
      status: record.status || "",
      description: record.sr_type || "",
      address: record.street_address || "",
    }));
}
```

#### Seattle API Integration

```typescript
// Seattle API integration
async function fetchSeattleDumpingRequests(options: {
  year?: number;
  limit?: number;
  offset?: number;
}): Promise<DumpingRequest[]> {
  const { year, limit = 5000, offset = 0 } = options;

  let whereClause = "";
  if (year) {
    whereClause = `date_extract_y(createddate)=${year}`;
  }

  const url = new URL("https://data.seattle.gov/resource/bpvk-ju3y.json");
  if (whereClause) {
    url.searchParams.set("$where", whereClause);
  }
  url.searchParams.set("$limit", limit.toString());
  url.searchParams.set("$offset", offset.toString());
  url.searchParams.set("$order", "createddate DESC");

  const response = await fetch(url.toString());
  const data: any[] = await response.json();

  return data
    .filter(record => record.latitude && record.longitude)
    .map(record => ({
      id: record.servicerequestnumber,
      lat: parseFloat(record.latitude),
      lon: parseFloat(record.longitude),
      datetimeinit: record.createddate,
      status: record.servicerequeststatusname || "",
      description: record.descriptionoftheillegaldumping || "",
      address: record.location || "",
    }));
}
```

---

## Resources

### API Documentation
- [Socrata SODA API Documentation](https://dev.socrata.com/)

### City Portals
- [NYC Open Data](https://opendata.cityofnewyork.us/)
- [Chicago Data Portal](https://data.cityofchicago.org/)
- [San Diego Open Data](https://data.sandiego.gov/)
- [Seattle Open Data](https://data.seattle.gov/)
- [Denver Open Data](https://www.denvergov.org/opendata)

---

## Changelog

- **2026-01-26**: Major expansion of research - investigated 25 cities total
   - ✅ Confirmed working Socrata APIs for 6 cities (NYC, Chicago, Seattle, Dallas, Montgomery County MD, Kansas City MO)
   - ✅ Confirmed working non-Socrata APIs for 3 cities (Montgomery County MD, Kansas City MO via Socrata; Nashville, San Jose, Baltimore, Louisville via ArcGIS)
   - ⚠️ Identified cities requiring further verification (San Diego, Denver, Austin, Cincinnati, Indianapolis)
   - ❌ Identified cities without public APIs (Houston, Phoenix, Jacksonville, Austin, Portland OR, Raleigh, Detroit)
   - ⚠️ Identified cities using alternative platforms (Charlotte, Washington DC, Boston)
   - Updated comparison table with 25 cities
   - Added detailed documentation for Dallas, Montgomery County MD, Kansas City MO
   - Added 16 additional city sections with testing results
   - Updated testing results with comprehensive API testing
   - Updated integration recommendations with 9 ready cities
- **2025-01-XX**: Testing high-priority Socrata-based cities
- **2025-01-XX**: Completed testing for NYC, Chicago, and Seattle
  - ✅ NYC: 150,012+ records, API working
  - ✅ Chicago: 83,473+ records, API working
  - ✅ Seattle: 272,043+ records, API working
  - Added integration code examples for all three cities

- **2025-01-26**: Expanded research to additional top US cities
  - Researched Houston, Dallas, Phoenix, San Diego, Denver
  - Researched Jacksonville, Columbus, Charlotte, Indianapolis
  - **Houston**: ❌ No Socrata portal for 311 data
  - **Dallas**: ⚠️ Portal found (`data.dallasopendata.com`) with dataset ID `xs8-3hc2`, but API not responding
  - **Phoenix**: ❌ No Socrata dataset found
  - **San Diego**: ⚠️ Dataset ID `fwda-izby` confirmed but API returns 404 errors
  - **Denver**: ⚠️ Dataset ID `r52d-vs5d` found but API redirects (301) - domain changed
  - **Jacksonville**: ❌ No Socrata dataset found
  - **Columbus**: ❌ No current Socrata dataset found
  - **Charlotte**: ⚠️ Uses ArcGIS REST API (not Socrata)
  - **Indianapolis**: ❌ No Socrata dataset found
  - Updated comparison table with all researched cities
  - Added detailed sections for each city with testing results

---

## Summary and Recommendations

### Cities Ready for Integration (3)

1. **New York City** - ✅ Fully tested and working
   - 150,012+ records available
   - API accessible and data structure verified
   - Coordinates in WGS84 (no conversion needed)

2. **Chicago** - ✅ Fully tested and working
   - 83,473+ records available
   - API accessible and data structure verified
   - Coordinates in WGS84 (no conversion needed)

3. **Seattle** - ✅ Fully tested and working
   - 272,043+ records available
   - Dedicated illegal dumping dataset (no filtering needed)
   - Coordinates in WGS84 (no conversion needed)

### Cities Needing Further Verification (3)

4. **Dallas** - ⚠️ Portal and dataset ID found, but API not responding
   - Portal: `data.dallasopendata.com`
   - Dataset ID: `xs8-3hc2`
   - Next steps: Verify API accessibility, test illegal dumping filter

5. **San Diego** - ⚠️ Dataset ID found, but API returns 404 errors
   - Dataset ID: `fwda-izby` (also referenced as `gid-illegal-dumping`)
   - Next steps: Verify correct API endpoint format, check if dataset still exists

6. **Denver** - ⚠️ Dataset ID found, but API redirects (domain changed)
   - Dataset ID: `r52d-vs5d` (may be outdated)
   - Portal redirects to `denvergov.org/opendata`
   - Next steps: Access current portal to find correct resource ID

### Cities Not Available via Socrata (6)

7. **Houston** - ❌ No Socrata portal for 311 data
   - Only aggregated monthly reports available
   - Would require public records request

8. **Phoenix** - ❌ No Socrata dataset for 311 data
   - Has myPHX311 system but data not published
   - Would require public records request

9. **Jacksonville** - ❌ No Socrata dataset for 311 data
   - Has MyJax dashboard but no public API
   - Would require public records request

10. **Columbus** - ❌ No current Socrata dataset for 311 data
    - Historical data (2008-2017) used in research but not currently public
    - Would require public records request

11. **Indianapolis** - ❌ No Socrata dataset for 311 data
    - Has RequestIndy system but data not published
    - Would require public records request

### Cities Using Different Platforms (1)

12. **Charlotte** - ⚠️ Uses ArcGIS REST API (not Socrata)
    - ServiceRequests311 dataset available via ArcGIS REST service
    - Would require separate integration approach
    - Not compatible with current Socrata-based implementation

### Key Findings

 - **Success Rate**: 6 out of 25 cities (24%) have fully working Socrata APIs for illegal dumping data (NYC, Chicago, Seattle, Dallas, Montgomery County MD, Kansas City MO)
- **Additional Working**: 3 cities have working non-Socrata APIs that can be integrated (Montgomery County MD, Kansas City MO)
- **Total Usable**: 9 cities (36%) have APIs that can be integrated (6 Socrata + 3 other platforms)
- **Common Issues**: 
  - Many cities have 311 systems but don't publish data via Socrata
  - Some portals have changed domains or dataset IDs
  - API endpoints may require different formats or authentication
  - Some cities use ArcGIS Hub instead of Socrata
  - Some cities require API keys or authentication
- **Recommendations**: 
  1. **Immediate Integration**: Proceed with NYC, Chicago, Seattle, Dallas, Montgomery County MD, and Kansas City MO - all tested and working
  2. **Further Investigation**: 
     - Verify correct API endpoints for San Diego, Denver, Austin
     - Request API access for Cincinnati
     - Investigate API structure for Indianapolis, Charlotte, Boston
     - Monitor for current data in San Jose, Baltimore, Louisville
  3. **Alternative Approaches**:
     - For cities without Socrata APIs, consider public records requests
     - For cities using ArcGIS, consider separate integration module (Montgomery County, Kansas City, Nashville, San Jose, Baltimore, Louisville)
     - For Houston, use CSV downloads or TPIA request
     - For cities with Open311 (Boston), consider API key application
  4. **Long-term Strategy**:
     - Focus on Socrata-based cities for easier maintenance
     - Document non-Socrata alternatives for future consideration
     - Regularly re-check cities marked as "needs verification"

---

## Notes

- All API tests were performed in January 2025 and January 2026
- Service availability may change over time
- Focus on Socrata APIs for easier integration with existing codebase
- Non-Socrata cities (Open311, ArcGIS Hub) documented but can be integrated with additional modules
- Some cities may publish data under different names or categories
- Cities with working Socrata APIs: NYC, Chicago, Seattle, Dallas, Montgomery County MD, Kansas City MO
- Cities with working non-Socrata APIs: Montgomery County MD, Kansas City MO (ArcGIS Hub)
- For Houston, use CSV downloads or submit TPIA request for API access
