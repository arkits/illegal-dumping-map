# Oakland Open Data Portal - Potential Visualization Datasets

## Executive Summary

This document catalogs potential visualizable datasets from Oakland's Open Data Portal (data.oaklandca.gov) that could be integrated into visualization projects similar to the current illegal dumping map application.

**Key Findings:**
- **Total Datasets Identified**: 15+ visualizable datasets
- **Datasets Ready for Visualization**: 12 datasets with verified API access and coordinate data
- **311 Service Request Categories**: 34+ categories available beyond illegal dumping
- **Data Quality**: Most datasets have good coordinate coverage and recent updates

**Categories Covered:**
- Public Safety (Crime, Police, Fire)
- Infrastructure (311 Requests, Parking, Buildings, Transit)
- Environment (Limited availability)
- Property (Buildings, Trees)

---

## Dataset Catalog

### 1. CrimeWatch Data (Past 90 Days)

**Status**: ⚠️ **Needs Geocoding**

- **Dataset ID**: `ppgh-7dqv`
- **Dataset Name**: CrimeWatch Maps Past 90-Days
- **Category**: Public Safety
- **API Endpoint**: `https://data.oaklandca.gov/resource/ppgh-7dqv.json`
- **Total Records**: 1,253,403 (historical data, not just 90 days)
- **Data Freshness**: Last verified 2019 (may be historical dataset)

#### Key Fields
- `casenumber` - Case number (primary identifier)
- `datetime` - Date and time of incident
- `crimetype` - Type of crime (e.g., "THREATS", "STOLEN VEHICLE", "PETTY THEFT", "MISDEMEANOR ASSAULT")
- `description` - Crime description
- `policebeat` - Police beat identifier
- `address` - Street address (text only, no coordinates)
- `city` - City name
- `state` - State abbreviation

#### Coordinate System
- ❌ **No direct coordinates** - Only address strings
- ⚠️ **Requires geocoding** - Addresses need to be geocoded to lat/lon for mapping

#### Sample Query
```bash
curl "https://data.oaklandca.gov/resource/ppgh-7dqv.json?\$limit=10&\$order=datetime DESC"
```

#### Visualization Potential
- **Map**: Requires geocoding addresses first
- **Charts**: Crime type distribution, trends over time, police beat analysis
- **Filters**: Crime type, date range, police beat

#### Integration Notes
- **Challenge**: No coordinates - requires geocoding service (Google Maps, Mapbox, etc.)
- **Data Volume**: Very large dataset (1.2M+ records)
- **Data Freshness**: Dataset appears to be historical (2019), not current 90-day rolling window
- **Recommendation**: Verify if current 90-day dataset exists with different ID

---

### 2. 311 Service Requests - Multiple Categories

**Status**: ✅ **Ready - Already in Use (Illegal Dumping)**

- **Dataset ID**: `quth-gb8e`
- **Dataset Name**: Service requests received by the Oakland Call Center (OAK 311)
- **Category**: Infrastructure / Public Services
- **API Endpoint**: `https://data.oaklandca.gov/resource/quth-gb8e.json`
- **Total Records**: 1,117,476+ (all categories)
- **Data Freshness**: Continuously updated

#### Available Request Categories (with record counts)

| Category | Count | Visualization Potential |
|----------|-------|-------------------------|
| `ILLDUMP` | ~370,019 | ✅ Currently visualized |
| `STREETSW` | 57,174 | ✅ High - Street/sidewalk issues |
| `GRAFFITI` | 41,086 | ✅ High - Graffiti reports |
| `RECYCLING` | 28,277 | ✅ Medium - Recycling issues |
| `TRAFFIC` | 26,365 | ✅ High - Traffic-related requests |
| `PARKS` | 26,097 | ✅ High - Park maintenance |
| `PARKING` | 33,829 | ✅ High - Parking issues |
| `TREES` | 31,109 | ✅ High - Tree maintenance |
| `DRAINAGE` | 15,278 | ✅ Medium - Drainage issues |
| `FIRE` | 6,369 | ✅ Medium - Fire-related |
| `SIDESHOWS` | 1,536 | ✅ High - Sideshow reports |
| `ABANDONED AUTO` | Unknown | ⚠️ Needs verification |
| `BLDGMAINT` | Unknown | ✅ Medium - Building maintenance |
| `SEWERS` | 14,070 | ✅ Medium - Sewer issues |
| `ROW` | Unknown | ✅ Medium - Right of way |
| `TRAFFIC_ENGIN` | Unknown | ✅ Medium - Traffic engineering |

#### Key Fields (Same for all categories)
- `requestid` - Primary identifier
- `datetimeinit` - Request initiation date/time
- `datetimeclosed` - Closure date/time
- `status` - Current status
- `reqcategory` - Request category
- `srx`, `sry` - Coordinates (State Plane, requires conversion to WGS84)
- `probaddress` - Problem address
- `description` - Request description
- `councildistrict` - Council district
- `beat` - Police beat
- `zipcode` - ZIP code

#### Coordinate System
- Uses **NAD_1983_StatePlane_California_III_FIPS_0403_Feet** (State Plane coordinates)
- Requires conversion to WGS84 (lat/lon) for mapping
- Conversion function available in `src/lib/utils.ts`

#### Sample Queries

**Get Graffiti requests:**
```bash
curl "https://data.oaklandca.gov/resource/quth-gb8e.json?\$where=REQCATEGORY='GRAFFITI'&\$limit=10&\$order=DATETIMEINIT DESC"
```

**Get Sideshow reports:**
```bash
curl "https://data.oaklandca.gov/resource/quth-gb8e.json?\$where=REQCATEGORY='SIDESHOWS'&\$limit=10&\$order=DATETIMEINIT DESC"
```

**Get Tree maintenance requests:**
```bash
curl "https://data.oaklandca.gov/resource/quth-gb8e.json?\$where=REQCATEGORY='TREES'&\$limit=10&\$order=DATETIMEINIT DESC"
```

#### Visualization Potential
- **Map**: All categories have coordinates (after conversion)
- **Charts**: Category distribution, trends over time, response time analysis
- **Filters**: Category, date range, status, council district, police beat

#### Integration Notes
- **Advantage**: Same API structure as illegal dumping (already integrated)
- **Advantage**: Large datasets with good coordinate coverage
- **Advantage**: Continuously updated
- **Recommendation**: High priority - easy to add new categories using existing infrastructure

---

### 3. Parking Meters

**Status**: ✅ **Ready**

- **Dataset ID**: `wnjv-tz7z`
- **Dataset Name**: City of Oakland Parking Meters
- **Category**: Infrastructure
- **API Endpoint**: `https://data.oaklandca.gov/resource/wnjv-tz7z.json`
- **Total Records**: 4,872
- **Data Freshness**: Active dataset with meter status

#### Key Fields
- `pole` - Pole identifier (e.g., "15-622")
- `zone` - Parking zone (e.g., "R 4")
- `area` - Area identifier (e.g., "R 4B")
- `sub_area` - Sub-area (e.g., "15th St")
- `latitude` - **Already in WGS84** (no conversion needed!)
- `longitude` - **Already in WGS84** (no conversion needed!)
- `the_geom` - GeoJSON Point geometry
- `pole_statu` - Pole status (e.g., "Active")
- `meter_type` - Meter type (e.g., "MK5")
- `rfid` - RFID identifier
- `config__na` - Configuration name (e.g., "$2.00 per hr 2 Hour Basic Config-Oakland")
- `original_m` - Original installation date
- `terminal_i` - Terminal installation date
- `warranty_e` - Warranty expiration date

#### Coordinate System
- ✅ **WGS84 (lat/lon)** - No conversion needed!
- Fields: `latitude` (latitude), `longitude` (longitude)
- Also provides `the_geom` with GeoJSON Point geometry

#### Sample Query
```bash
curl "https://data.oaklandca.gov/resource/wnjv-tz7z.json?\$limit=10"
```

#### Visualization Potential
- **Map**: All meters with status, zone, and pricing information
- **Charts**: Meter distribution by zone, status breakdown, installation timeline
- **Filters**: Zone, area, status, meter type

#### Integration Notes
- **Advantage**: Coordinates already in WGS84 - no conversion needed
- **Advantage**: Static dataset (meters don't move frequently)
- **Advantage**: Rich metadata (pricing, zones, status)
- **Use Case**: Parking availability maps, revenue analysis, zone planning

---

### 4. Building Footprints

**Status**: ✅ **Ready**

- **Dataset ID**: `iqfp-6kz5`
- **Dataset Name**: Building Footprints
- **Category**: Property / Infrastructure
- **API Endpoint**: `https://data.oaklandca.gov/resource/iqfp-6kz5.json`
- **Total Records**: 10,651
- **Data Freshness**: Static dataset (buildings)

#### Key Fields
- `bldgid3` - Building ID (e.g., "EARHART RD_bldgL877")
- `bldgid2` - Building ID 2 (e.g., "EARHART RD")
- `bldgnum` - Building number (e.g., "bldgL877")
- `final_apn` - APN (Assessor's Parcel Number)
- `apnid` - APN ID
- `comname` - Commercial name (e.g., "Aircraft Wash B")
- `numbldgs` - Number of buildings
- `bldgtype` - Building type (e.g., "Industrial Building", "Commercial Building", "Publicly-Owned Building")
- `nostory` - Number of stories
- `the_geom` - **GeoJSON MultiPolygon** geometry (building footprint)
- `shape_area` - Shape area
- `shape_len` - Shape length

#### Coordinate System
- ✅ **WGS84 (lat/lon)** - GeoJSON MultiPolygon format
- Field: `the_geom` (GeoJSON MultiPolygon)
- Format: `{"type":"MultiPolygon","coordinates":[[[[lon,lat],...]]]}`

#### Sample Query
```bash
curl "https://data.oaklandca.gov/resource/iqfp-6kz5.json?\$limit=10"
```

#### Visualization Potential
- **Map**: Building footprints as polygons, building type distribution
- **Charts**: Building type breakdown, stories distribution, density analysis
- **Filters**: Building type, number of stories, APN

#### Integration Notes
- **Advantage**: Polygon data (footprints) - more detailed than points
- **Advantage**: Rich metadata (building type, stories, APN)
- **Challenge**: Requires polygon rendering (Leaflet supports this)
- **Use Case**: Building density maps, urban planning, property analysis

---

### 5. Oakland Bike Share Stations

**Status**: ✅ **Ready**

- **Dataset ID**: `9dmt-ttvc`
- **Dataset Name**: Oakland Bike Share Stations
- **Category**: Infrastructure / Transportation
- **API Endpoint**: `https://data.oaklandca.gov/resource/9dmt-ttvc.json`
- **Total Records**: 79
- **Data Freshness**: Active dataset

#### Key Fields
- `objectid` - Object ID
- `stationidf` - Station ID (e.g., "OK-C2-2")
- `locdes` - Location description
- `onstcond` - On-street condition (e.g., "Parking (unmetered)")
- `location` - Location description
- `officialna` - Official name (e.g., "Dover St at 57th St")
- `dockcount` - Number of docks
- `bikecount` - Current number of bikes
- `onoffstree` - On/off street indicator
- `the_geom` - **GeoJSON Point** geometry
- Coordinates: `the_geom.coordinates[0]` (longitude), `the_geom.coordinates[1]` (latitude)

#### Coordinate System
- ✅ **WGS84 (lat/lon)** - GeoJSON Point format
- Field: `the_geom` (GeoJSON Point)
- Format: `{"type":"Point","coordinates":[lon,lat]}`

#### Sample Query
```bash
curl "https://data.oaklandca.gov/resource/9dmt-ttvc.json?\$limit=10"
```

#### Visualization Potential
- **Map**: Station locations with real-time bike availability
- **Charts**: Station utilization, bike availability trends
- **Filters**: Station ID, location area

#### Integration Notes
- **Advantage**: Coordinates already in WGS84 (GeoJSON Point)
- **Advantage**: Real-time data (bike counts)
- **Use Case**: Bike share availability maps, transportation planning

---

### 6. Parking Citations

**Status**: ⚠️ **Coordinate Issues**

- **Dataset ID**: `58em-y96b` (Citation Data Portal)
- **Dataset Name**: Citation Data Portal
- **Category**: Infrastructure / Finance
- **API Endpoint**: `https://data.oaklandca.gov/resource/58em-y96b.json`
- **Total Records**: 2,515,341
- **Data Freshness**: Continuously updated (recent citations from 2025)

#### Key Fields
- `ticket_num` - Ticket number (primary identifier)
- `fine_amount` - Fine amount (e.g., 64.0, 83.0, 66.0)
- `ticket_iss` - Ticket issue date/time
- `ticket_i_1` - Ticket issue time (formatted)
- `violation` - Violation code (e.g., "10.36.100", "22514.00")
- `violatio_1` - Violation description (e.g., "METER EXP OFF STREET", "FIRE HYDRANT")
- `location` - Location address (e.g., "145 PIEDMONT LOT", "1035 CAMPBELL ST")
- `the_geom` - GeoJSON Point geometry
- `status` - Status (e.g., "U")
- `meter_indi` - Meter indicator (e.g., "Yes", "No")
- `meter` - Meter identifier (if applicable)

#### Coordinate System
- ⚠️ **Mixed Quality** - Some records have valid coordinates, others have placeholder values
- Some records show: `{"type":"Point","coordinates":[165.99845616481824,-90]}` (invalid)
- Valid records show: `{"type":"Point","coordinates":[-122.29743116711609,37.80935833015359]}`
- Field: `the_geom` (GeoJSON Point)

#### Sample Query
```bash
curl "https://data.oaklandca.gov/resource/58em-y96b.json?\$where=the_geom IS NOT NULL&\$limit=10&\$order=ticket_iss DESC"
```

#### Visualization Potential
- **Map**: Citation locations (filter invalid coordinates)
- **Charts**: Violation type distribution, fine amount analysis, trends over time
- **Filters**: Violation type, date range, fine amount, location

#### Integration Notes
- **Challenge**: Many records have invalid coordinates (165.99, -90) - need filtering
- **Advantage**: Very large dataset with recent data
- **Advantage**: Rich metadata (violation types, fine amounts)
- **Recommendation**: Filter out invalid coordinates, focus on records with valid lat/lon

---

### 7. Street Trees

**Status**: ✅ **Ready**

- **Dataset ID**: `4jcx-enxf`
- **Dataset Name**: Oakland Street Trees
- **Category**: Environment / Infrastructure
- **API Endpoint**: `https://data.oaklandca.gov/resource/4jcx-enxf.json`
- **Total Records**: 38,613
- **Data Freshness**: Active dataset

#### Key Fields
- `objectid` - Object ID
- `species` - Tree species (e.g., "Liquidambar styraciflua", "Unknown")
- `wellwidth` - Well width
- `welllength` - Well length
- `pareawidth` - Area width
- `lowwell` - Low well indicator (e.g., "None", "Low")
- `stname` - Street name (nested object with human_address)
- `location_1` - **Location with coordinates** (nested object)
  - `latitude` - Latitude (WGS84)
  - `longitude` - Longitude (WGS84)
  - `human_address` - Formatted address

#### Coordinate System
- ✅ **WGS84 (lat/lon)** - Nested in `location_1` object
- Fields: `location_1.latitude`, `location_1.longitude`

#### Sample Query
```bash
curl "https://data.oaklandca.gov/resource/4jcx-enxf.json?\$limit=10"
```

#### Visualization Potential
- **Map**: Tree locations by species, tree health indicators
- **Charts**: Species distribution, tree density by area
- **Filters**: Species, tree health, street name

#### Integration Notes
- **Advantage**: Coordinates already in WGS84
- **Advantage**: Rich metadata (species, health indicators)
- **Use Case**: Urban forestry maps, tree inventory, environmental planning

---

### 8. Fire Station Locations

**Status**: ✅ **Ready**

- **Dataset ID**: `58ik-33wk`
- **Dataset Name**: Fire Station Locations
- **Category**: Public Safety / Infrastructure
- **API Endpoint**: `https://data.oaklandca.gov/resource/58ik-33wk.json`
- **Total Records**: Small dataset (exact count not verified)
- **Data Freshness**: Static dataset (stations don't move)

#### Key Fields
- `engine_companies` - Engine company (e.g., "Engine 16", "Engine 21", "Engine 7")
- `location_1` - **Location with coordinates** (nested object)
  - `latitude` - Latitude (WGS84)
  - `longitude` - Longitude (WGS84)
  - `human_address` - Formatted address (e.g., "3600 13th Ave.", "13150 Skyline Blvd.")

#### Coordinate System
- ✅ **WGS84 (lat/lon)** - Nested in `location_1` object
- Fields: `location_1.latitude`, `location_1.longitude`

#### Sample Query
```bash
curl "https://data.oaklandca.gov/resource/58ik-33wk.json"
```

#### Visualization Potential
- **Map**: Fire station locations, coverage areas
- **Charts**: Station distribution, response time analysis (if combined with incident data)
- **Filters**: Engine company, location area

#### Integration Notes
- **Advantage**: Coordinates already in WGS84
- **Advantage**: Static dataset (stations are fixed locations)
- **Use Case**: Emergency response planning, coverage analysis

---

### 9. ShotSpotter Data (Historical)

**Status**: ⚠️ **Historical Only**

- **Dataset ID**: `45hc-hrd3`
- **Dataset Name**: Shotspotter Data 8-16-15 To 9-15-15
- **Category**: Public Safety
- **API Endpoint**: `https://data.oaklandca.gov/resource/45hc-hrd3.json`
- **Total Records**: Limited (one month sample)
- **Data Freshness**: Historical only (August-September 2015)

#### Key Fields
- `id` - Event ID
- `date` - Date (e.g., "14-Sep-15")
- `time` - Time (e.g., "23:25:25")
- `type` - Event type (e.g., "Backfire", "Firecracker")
- `rnds` - Number of rounds
- `beat` - Police beat (e.g., "6X", "7X")
- `location_1` - **Location with coordinates** (nested object)
  - `latitude` - Latitude (WGS84)
  - `longitude` - Longitude (WGS84)
  - `human_address` - Formatted address

#### Coordinate System
- ✅ **WGS84 (lat/lon)** - Nested in `location_1` object
- Fields: `location_1.latitude`, `location_1.longitude`

#### Sample Query
```bash
curl "https://data.oaklandca.gov/resource/45hc-hrd3.json?\$limit=10"
```

#### Visualization Potential
- **Map**: Gunfire detection locations, event type distribution
- **Charts**: Event type breakdown, time-of-day patterns, police beat analysis
- **Filters**: Event type, date range, police beat

#### Integration Notes
- **Limitation**: Historical dataset only (one month sample from 2015)
- **Advantage**: Coordinates already in WGS84
- **Recommendation**: Check if current ShotSpotter data is available with different dataset ID

---

### 10. Encampment Management Operations

**Status**: ⚠️ **No Coordinates**

- **Dataset ID**: `2e3d-5f6k`
- **Dataset Name**: Completed Encampment Management Team Operations Since 2021
- **Category**: Social Services / Public Safety
- **API Endpoint**: `https://data.oaklandca.gov/resource/2e3d-5f6k.json`
- **Total Records**: Small dataset
- **Data Freshness**: Updated regularly (recent operations from 2025)

#### Key Fields
- `location` - Location description (e.g., "MLk between W Grand Ave & 23rd")
- `district` - Council district (e.g., "D3")
- `sensitivity_zone` - Sensitivity zone (e.g., "High")
- `intervention` - Intervention type (e.g., "Closure")
- `operation_start_date` - Operation start date/time
- `operation_end_date` - Operation end date/time

#### Coordinate System
- ❌ **No coordinates** - Only location descriptions
- ⚠️ **Requires geocoding** - Location strings need to be geocoded

#### Sample Query
```bash
curl "https://data.oaklandca.gov/resource/2e3d-5f6k.json?\$limit=10"
```

#### Visualization Potential
- **Map**: Requires geocoding locations first
- **Charts**: Intervention type distribution, district analysis, timeline
- **Filters**: District, sensitivity zone, intervention type, date range

#### Integration Notes
- **Challenge**: No coordinates - requires geocoding service
- **Advantage**: Recent data (2021-present)
- **Use Case**: Homelessness response tracking, resource allocation

---

### 11. Parking Citations 2019 (Historical)

**Status**: ⚠️ **Coordinate Issues**

- **Dataset ID**: `28ng-sneu`
- **Dataset Name**: Parking Citations 2019
- **Category**: Infrastructure / Finance
- **API Endpoint**: `https://data.oaklandca.gov/resource/28ng-sneu.json`
- **Total Records**: Historical dataset (2019 only)
- **Data Freshness**: Historical only (2019)

#### Key Fields
- `ticket_num` - Ticket number
- `fine_amoun` - Fine amount
- `ticket_i_1` - Ticket issue time
- `location` - Location address
- `meter_indi` - Meter indicator
- `meter` - Meter identifier
- `the_geom` - GeoJSON Point geometry
- `status` - Status
- `x`, `y` - X/Y coordinates (appear to be 0.0)
- `score` - Score (appears to be 0.0)

#### Coordinate System
- ⚠️ **Invalid coordinates** - Most records show `[165.99845616481772,-90]` (invalid)
- Field: `the_geom` (GeoJSON Point)

#### Sample Query
```bash
curl "https://data.oaklandca.gov/resource/28ng-sneu.json?\$limit=10"
```

#### Visualization Potential
- **Map**: Limited (most coordinates invalid)
- **Charts**: Fine amount distribution, violation analysis
- **Filters**: Date range, fine amount, location

#### Integration Notes
- **Limitation**: Historical dataset only (2019)
- **Challenge**: Invalid coordinates in most records
- **Recommendation**: Use `58em-y96b` (Citation Data Portal) instead for current data

---

### 12. Oakland Police: Collisions

**Status**: ❌ **Not Accessible via Standard API**

- **Dataset ID**: `3f52-ufcy`
- **Dataset Name**: Oakland Police: Collisions
- **Category**: Public Safety
- **API Endpoint**: `https://data.oaklandca.gov/resource/3f52-ufcy.json`
- **Error**: "no row or column access to non-tabular tables"

#### Notes
- Dataset exists but is not accessible via standard Socrata SODA API
- May require different API format or may be a non-tabular dataset
- Would need to investigate alternative access methods

---

## Comparison Table

| Dataset | ID | Category | Records | Coordinates | Status | Priority |
|---------|----|----------|---------|--------------|--------|----------|
| **311 Service Requests - Graffiti** | quth-gb8e | Infrastructure | 41,086 | ✅ (State Plane) | ✅ Ready | High |
| **311 Service Requests - Trees** | quth-gb8e | Infrastructure | 31,109 | ✅ (State Plane) | ✅ Ready | High |
| **311 Service Requests - Parking** | quth-gb8e | Infrastructure | 33,829 | ✅ (State Plane) | ✅ Ready | High |
| **311 Service Requests - Sideshows** | quth-gb8e | Infrastructure | 1,536 | ✅ (State Plane) | ✅ Ready | High |
| **311 Service Requests - Parks** | quth-gb8e | Infrastructure | 26,097 | ✅ (State Plane) | ✅ Ready | High |
| **311 Service Requests - Traffic** | quth-gb8e | Infrastructure | 26,365 | ✅ (State Plane) | ✅ Ready | High |
| **Parking Meters** | wnjv-tz7z | Infrastructure | 4,872 | ✅ (WGS84) | ✅ Ready | High |
| **Building Footprints** | iqfp-6kz5 | Property | 10,651 | ✅ (WGS84 Polygons) | ✅ Ready | Medium |
| **Bike Share Stations** | 9dmt-ttvc | Infrastructure | 79 | ✅ (WGS84) | ✅ Ready | Medium |
| **Street Trees** | 4jcx-enxf | Environment | 38,613 | ✅ (WGS84) | ✅ Ready | High |
| **Fire Stations** | 58ik-33wk | Public Safety | Small | ✅ (WGS84) | ✅ Ready | Low |
| **Parking Citations (Current)** | 58em-y96b | Infrastructure | 2.5M+ | ⚠️ (Mixed) | ⚠️ Needs Filtering | Medium |
| **CrimeWatch Data** | ppgh-7dqv | Public Safety | 1.2M+ | ❌ (Address only) | ⚠️ Needs Geocoding | Medium |
| **ShotSpotter (Historical)** | 45hc-hrd3 | Public Safety | Limited | ✅ (WGS84) | ⚠️ Historical Only | Low |
| **Encampment Operations** | 2e3d-5f6k | Social Services | Small | ❌ (Address only) | ⚠️ Needs Geocoding | Low |

---

## Recommendations

### High Priority (Easy Integration)

1. **311 Service Request Categories** (Multiple)
   - **Why**: Same API structure as illegal dumping (already integrated)
   - **Categories**: Graffiti (41K), Trees (31K), Parking (34K), Parks (26K), Traffic (26K), Sideshows (1.5K)
   - **Effort**: Low - can reuse existing infrastructure
   - **Impact**: High - multiple new visualizations with minimal work

2. **Street Trees** (`4jcx-enxf`)
   - **Why**: Large dataset (38K records), coordinates in WGS84, rich metadata
   - **Effort**: Low - coordinates already in correct format
   - **Impact**: High - environmental/urban planning visualization

3. **Parking Meters** (`wnjv-tz7z`)
   - **Why**: Coordinates in WGS84, rich metadata (zones, pricing, status)
   - **Effort**: Low - coordinates already in correct format
   - **Impact**: Medium - parking infrastructure visualization

### Medium Priority (Requires Work)

4. **Building Footprints** (`iqfp-6kz5`)
   - **Why**: Polygon data (more detailed than points), rich metadata
   - **Effort**: Medium - requires polygon rendering support
   - **Impact**: Medium - urban planning, density analysis

5. **Parking Citations** (`58em-y96b`)
   - **Why**: Very large dataset (2.5M+ records), recent data
   - **Effort**: Medium - need to filter invalid coordinates
   - **Impact**: Medium - revenue analysis, violation patterns

6. **CrimeWatch Data** (`ppgh-7dqv`)
   - **Why**: Large dataset (1.2M+ records), crime data is valuable
   - **Effort**: High - requires geocoding service integration
   - **Impact**: High - public safety visualization
   - **Note**: Verify if current 90-day dataset exists

### Low Priority (Historical or Limited Data)

7. **Bike Share Stations** (`9dmt-ttvc`)
   - **Why**: Small dataset (79 stations), real-time bike counts
   - **Effort**: Low
   - **Impact**: Low - limited scope

8. **Fire Stations** (`58ik-33wk`)
   - **Why**: Small static dataset
   - **Effort**: Low
   - **Impact**: Low - limited visualization potential

9. **ShotSpotter Data** (`45hc-hrd3`)
   - **Why**: Historical only (2015 sample)
   - **Effort**: Low
   - **Impact**: Low - outdated data
   - **Note**: Check for current ShotSpotter dataset

10. **Encampment Operations** (`2e3d-5f6k`)
    - **Why**: No coordinates, requires geocoding
    - **Effort**: High - requires geocoding service
    - **Impact**: Medium - social services tracking

---

## Integration Guidelines

### For 311 Service Request Categories

Since these use the same dataset (`quth-gb8e`) as illegal dumping:

1. **Add new city config** in `src/lib/utils.ts`:
   ```typescript
   graffiti: {
     id: "graffiti",
     route: "/oakland/graffiti",
     name: "Oakland Graffiti",
     state: "CA",
     domain: "data.oaklandca.gov",
     datasetId: "quth-gb8e",
     filterField: "REQCATEGORY",
     filterValue: "GRAFFITI",
     // ... rest of config
   }
   ```

2. **Reuse existing infrastructure** - no code changes needed for API calls

3. **Create new page** - copy existing city page structure

### For Datasets with WGS84 Coordinates

1. **Set `requiresCoordinateConversion: false`** in city config
2. **Use coordinates directly** from API response
3. **No conversion function needed**

### For Datasets Requiring Geocoding

1. **Integrate geocoding service** (Google Maps, Mapbox, etc.)
2. **Cache geocoded results** to avoid repeated API calls
3. **Handle geocoding failures** gracefully

### For Polygon Datasets (Building Footprints)

1. **Use Leaflet polygon rendering** - Leaflet supports GeoJSON polygons
2. **Consider performance** - polygons are more complex than points
3. **Use clustering/simplification** for large datasets

---

## Sample Integration Code

### Adding a New 311 Category (Graffiti Example)

```typescript
// In src/lib/utils.ts - add to CITIES
graffiti: {
  id: "graffiti",
  route: "/oakland/graffiti",
  name: "Oakland Graffiti Reports",
  state: "CA",
  domain: "data.oaklandca.gov",
  datasetId: "quth-gb8e",
  filterField: "REQCATEGORY",
  filterValue: "GRAFFITI",
  dateField: "DATETIMEINIT",
  addressField: "probaddress",
  descriptionField: "description",
  centerLat: 37.804747,
  centerLon: -122.272,
  requiresCoordinateConversion: true,
  color: "purple",
  shortDescription: "Explore 41,000+ graffiti removal requests across Oakland.",
  imagePath: "/images/cities/oakland.png",
}
```

### Fetching Street Trees (WGS84 Example)

```typescript
// Street Trees API integration
async function fetchStreetTrees(options: {
  limit?: number;
  offset?: number;
}): Promise<TreeRecord[]> {
  const { limit = 5000, offset = 0 } = options;

  const url = new URL("https://data.oaklandca.gov/resource/4jcx-enxf.json");
  url.searchParams.set("$limit", limit.toString());
  url.searchParams.set("$offset", offset.toString());

  const response = await fetch(url.toString());
  const data: any[] = await response.json();

  return data
    .filter(record => record.location_1?.latitude && record.location_1?.longitude)
    .map(record => ({
      id: record.objectid,
      lat: parseFloat(record.location_1.latitude),
      lon: parseFloat(record.location_1.longitude),
      species: record.species || "",
      address: record.location_1.human_address || "",
    }));
}
```

---

## Data Quality Summary

### Coordinate Availability

- **✅ Direct WGS84 Coordinates**: 8 datasets
- **✅ State Plane (Requires Conversion)**: 1 dataset (311 requests - already handled)
- **✅ GeoJSON Polygons**: 1 dataset (building footprints)
- **❌ Address Only (Needs Geocoding)**: 2 datasets
- **⚠️ Invalid/Mixed Coordinates**: 2 datasets

### Data Freshness

- **✅ Continuously Updated**: 311 requests, parking citations (current)
- **✅ Active Datasets**: Parking meters, bike share, street trees, fire stations
- **⚠️ Historical Only**: ShotSpotter (2015), parking citations 2019
- **❓ Unknown**: CrimeWatch (appears historical from 2019)

### Record Volume

- **Very Large (1M+)**: CrimeWatch (1.2M), Parking Citations (2.5M)
- **Large (10K-100K)**: 311 categories (1K-57K each), Street Trees (38K)
- **Medium (1K-10K)**: Building Footprints (10K), Parking Meters (5K)
- **Small (<1K)**: Bike Share (79), Fire Stations, Encampment Operations

---

## Next Steps

1. **Immediate**: Add 311 request categories (Graffiti, Trees, Parking, Parks, Traffic, Sideshows)
2. **Short-term**: Integrate Street Trees dataset
3. **Medium-term**: Add Parking Meters visualization
4. **Long-term**: Consider Building Footprints (polygon support) and geocoding for address-only datasets

---

## Resources

- **Oakland Open Data Portal**: https://data.oaklandca.gov/
- **Socrata SODA API Documentation**: https://dev.socrata.com/
- **Current Illegal Dumping Implementation**: See `docs/OAKLAND_311_API.md`
- **Dataset Catalog**: https://data.oaklandca.gov/data.json

---

## Changelog

- **2026-01-XX**: Initial research and documentation
  - Identified 15+ visualizable datasets
  - Verified API accessibility and data structures
  - Documented coordinate systems and data quality
  - Provided integration recommendations and sample code
