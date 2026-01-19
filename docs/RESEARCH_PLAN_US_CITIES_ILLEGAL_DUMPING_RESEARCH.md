# Research Plan: US Cities Illegal Dumping Datasets

## Overview

This plan focuses on researching and testing major US cities with **Socrata-based open data APIs** (for easier integration with the existing codebase) that provide illegal dumping service request data. The goal is to identify cities with usable datasets, test their APIs, and document findings similar to the existing Bay Area research document.

## Target Cities (Socrata-based)

Based on initial research, these cities have Socrata portals and potential illegal dumping data:

### High Priority (Top 10 by population)

1. **New York City** - `data.cityofnewyork.us` - 311 Service Requests dataset
2. **Chicago** - `data.cityofchicago.org` - 311 Service Requests (Fly Dumping Complaint)
3. **San Diego** - `data.sandiego.gov` - Illegal Dumping Notifications dataset
4. **Seattle** - `data.seattle.gov` - Illegal Dumping Reports dataset
5. **Denver** - `data.denvergov.org` - 311 Service Requests dataset

### Medium Priority (Additional major cities)

6. **Houston** - Need to verify Socrata portal and dataset ID
7. **Dallas** - Need to verify Socrata portal and dataset ID
8. **Phoenix** - Need to verify if Socrata portal exists
9. **Philadelphia** - Uses Carto (not Socrata) - document but lower priority
10. **Boston** - Uses Open311 (not Socrata) - document but lower priority
11. **Austin** - Uses Open311 (not Socrata) - document but lower priority

## Implementation Steps

### Phase 1: Research and Documentation

1. **Create Research Document**

   - Create `docs/US_CITIES_ILLEGAL_DUMPING_RESEARCH.md` similar to `BAY_AREA_ILLEGAL_DUMPING_RESEARCH.md`
   - Document each city's portal, dataset ID, API endpoint, and field structure
   - Include filtering criteria for illegal dumping requests

2. **Research Each City**

   - For each city, identify:
     - Portal URL (e.g., `data.cityofnewyork.us`)
     - Dataset ID for 311/service requests
     - Filter field and value for illegal dumping
     - Date field name
     - Coordinate system (WGS84 or requires conversion)
     - Sample record structure
     - Data availability (years, update frequency)

### Phase 2: API Testing

3. **Create Test Script**

   - Create `test-city-apis.ts` (or similar) to test each city's API
   - Test script should:
     - Make API calls to each city's endpoint
     - Verify API accessibility
     - Test filtering for illegal dumping records
     - Validate data structure (required fields: id, lat, lon, date, status, address)
     - Check coordinate format (WGS84 vs conversion needed)
     - Count available records
     - Test pagination if needed

4. **Test Each City API**

   - For each city:
     - Test basic API connectivity
     - Test illegal dumping filter
     - Verify sample records have valid coordinates
     - Check data freshness (most recent record date)
     - Document any errors or limitations
     - Record sample API response for field mapping

### Phase 3: Data Validation

5. **Validate Data Quality**

   - For each city, verify:
     - Records have valid lat/lon coordinates
     - Date fields are parseable
     - Address fields are populated
     - Status fields are meaningful
     - Record count is reasonable (not 0, not suspiciously low)
     - Data appears current (recent records exist)

6. **Document Findings**

   - For each city, document:
     - ✅ Available and working
     - ⚠️ Available but has limitations (outdated, missing fields, etc.)
     - ❌ Not available or not usable
     - Include specific reasons for each status

### Phase 4: Integration Readiness Assessment

7. **Assess Integration Complexity**

   - For each working city, assess:
     - Field mapping requirements (how to map to `DumpingRequest` interface)
     - Coordinate conversion needs (if any)
     - API rate limits or restrictions
     - Data volume considerations
     - Any special handling needed

8. **Create Integration Examples**

   - For top candidates, create sample integration code (similar to SF/LA examples in Bay Area doc)
   - Show how to transform city-specific API response to `DumpingRequest` format
   - Document any special considerations

## Key Files to Create/Modify

1. **`docs/US_CITIES_ILLEGAL_DUMPING_RESEARCH.md`** - Main research document
2. **`test-city-apis.ts`** - Test script for validating APIs (can be temporary)
3. **Update `docs/BAY_AREA_ILLEGAL_DUMPING_RESEARCH.md`** - Add reference to new research doc

## Testing Approach

### Test Script Structure

```typescript
// Pseudo-code for test script
const cities = [
  {
    name: "New York City",
    domain: "data.cityofnewyork.us",
    datasetId: "erm2-nwe9", // 2020-present dataset
    filterField: "problem",
    filterValue: "Illegal Dumping",
    dateField: "created_date",
    latField: "latitude",
    lonField: "longitude",
  },
  // ... other cities
];

for (const city of cities) {
  try {
    // Test API connectivity
    const testUrl = `https://${city.domain}/resource/${city.datasetId}.json?$limit=1`;
    const response = await fetch(testUrl);
    
    // Test illegal dumping filter
    const filterUrl = `https://${city.domain}/resource/${city.datasetId}.json?$where=${city.filterField}='${city.filterValue}'&$limit=10`;
    const data = await fetch(filterUrl).then(r => r.json());
    
    // Validate data structure
    validateRecords(data, city);
    
    // Test coordinate validity
    validateCoordinates(data, city);
    
    // Count total records
    const count = await getRecordCount(city);
    
    console.log(`✅ ${city.name}: ${count} records found`);
  } catch (error) {
    console.log(`❌ ${city.name}: ${error.message}`);
  }
}
```

## Success Criteria

- [ ] Research document created with findings for at least 5-10 major cities
- [ ] All Socrata-based cities tested and documented
- [ ] At least 3-5 cities identified as ready for integration
- [ ] Test script validates APIs and data quality
- [ ] Field mappings documented for each city
- [ ] Integration examples provided for top candidates

## Notes

- Focus on Socrata APIs for easier integration (same API pattern as Oakland/SF/LA)
- Document non-Socrata cities (Open311, Carto) but mark as lower priority
- Test actual API endpoints, don't just rely on documentation
- Verify data is current and usable (not just historical)
- Check for coordinate systems and conversion needs
- Document any rate limits or API restrictions

## Expected Outcomes

1. Comprehensive research document listing all tested cities
2. Verified list of cities with working, usable APIs
3. Field mapping documentation for integration
4. Test results showing data quality and availability
5. Recommendations for which cities to integrate first