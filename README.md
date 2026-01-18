# Illegal Dumping Map

A Python application for analyzing and visualizing illegal dumping requests from Oakland, California's 311 service data.

## Overview

This project fetches illegal dumping request data from Oakland's public 311 API, processes geographic coordinates, and provides tools for analyzing and visualizing the data. It includes functionality for:

- Querying illegal dumping requests from Oakland's open data portal
- Converting coordinates between Web Mercator (EPSG:3857) and WGS84 (EPSG:4326) formats
- Calculating distances between geographic coordinates using the Haversine formula
- Filtering requests by geographic radius
- Visualizing requests on interactive maps using Plotly
- Analyzing request trends by month or week
- Comparing data across different years

## Features

### Data Fetching
- Fetches illegal dumping requests from Oakland's Socrata API (`data.oaklandca.gov`)
- Supports filtering, ordering, and pagination
- Automatically converts coordinate systems from Web Mercator to WGS84
- Automatic retry without authentication if API token is invalid
- Graceful error handling with informative messages

### Analysis Tools
- **Weekly Analysis**: Groups requests by week of the year
- **Monthly Analysis**: Groups requests by month
- **Geographic Filtering**: Filter requests within a specified radius of a center point
- **Distance Calculation**: Calculate distances between coordinates using the Haversine formula

### Visualization
- Interactive map visualization using Plotly Scattermap
- Time-series plots comparing data across years (e.g., 2024 vs 2025)
- Configurable map center, zoom level, and marker styling
- Professional plots with legends, grids, and proper formatting

## Installation

### Prerequisites
- Python 3.14 or higher
- Access to Oakland's open data API (no authentication required, but API token is optional)

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd illegal-dumping-map
```

2. Install dependencies using `uv` (recommended):
```bash
uv sync
```

Or using pip:
```bash
pip install -e .
```

3. Set up environment variables (optional):
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your API token (optional)
# OAK311_API_TOKEN=your_token_here
```

**Note:** The API works without authentication, but using a valid API token provides higher rate limits. If an invalid token is provided, the script will automatically retry without authentication.

## Requirements

The following Python packages are required:

- `pandas` - Data manipulation and DataFrame operations
- `numpy` - Numerical operations
- `matplotlib` - Static plotting and visualization
- `plotly` - Interactive map visualization
- `python-dotenv` - Environment variable management
- `sodapy` - Socrata API client for accessing open data

All dependencies are listed in `pyproject.toml` and will be installed automatically.

## Usage

**Note:** The script file is named `get-data.py` (with a hyphen). For easier imports, you may want to rename it to `get_data.py`. The examples below show how to import using `importlib` for the hyphenated filename, or you can use standard imports if you rename the file.

### Basic Usage

Run the main script to compare weekly trends between 2024 and 2025:

```bash
uv run get-data.py
```

Or with Python directly:
```bash
python get-data.py
```

This will:
1. Fetch illegal dumping requests for 2024 and 2025
2. Group requests by week
3. Display a comparison plot showing weekly trends

### Using the DumperData Class

```python
# If you rename get-data.py to get_data.py, you can use:
# from get_data import DumperData
# Otherwise, use importlib as shown:

import importlib.util
spec = importlib.util.spec_from_file_location("get_data", "get-data.py")
get_data = importlib.util.module_from_spec(spec)
spec.loader.exec_module(get_data)

# Initialize the data client (token from .env file or None)
dump = get_data.DumperData()

# Or pass token explicitly
dump = get_data.DumperData(api_token="your_token_here")

# Query data with filters
query_dataframe = dump.run_query(
    offset=0,
    limit=1000,
    where="REQCATEGORY='ILLDUMP' AND date_extract_y(DATETIMEINIT)=2024",
    order="DATETIMEINIT DESC"
)

# Close the connection when done
dump.close()
```

### Coordinate Conversion

Convert Web Mercator coordinates to WGS84 (latitude/longitude):

```python
# Using importlib to import from get-data.py
import importlib.util
spec = importlib.util.spec_from_file_location("get_data", "get-data.py")
get_data = importlib.util.module_from_spec(spec)
spec.loader.exec_module(get_data)

# Convert coordinates
lat, lon = get_data.web_mercator_to_wgs84(x=13625665.0, y=4515493.0)
```

### Distance Calculation

Calculate distance between two lat/lon coordinates in kilometers:

```python
import importlib.util
spec = importlib.util.spec_from_file_location("get_data", "get-data.py")
get_data = importlib.util.module_from_spec(spec)
spec.loader.exec_module(get_data)

distance_km = get_data.dist_between_latlon(
    coord1=(37.804747, -122.272),
    coord2=(37.824874, -122.278)
)
```

### Geographic Filtering

Filter requests within a radius of a center point:

```python
import importlib.util
spec = importlib.util.spec_from_file_location("get_data", "get-data.py")
get_data = importlib.util.module_from_spec(spec)
spec.loader.exec_module(get_data)

# Show only requests within 5km of a center point
get_data.get_requests_within_latlon_radius(
    query_dataframe=df,
    center_coord=(37.804747, -122.272),
    center_radius=5  # radius in kilometers
)
```

### Map Visualization

Display requests on an interactive map:

```python
import importlib.util
spec = importlib.util.spec_from_file_location("get_data", "get-data.py")
get_data = importlib.util.module_from_spec(spec)
spec.loader.exec_module(get_data)

get_data.run_map(query_dataframe)
```

### Time-based Analysis

Analyze requests by week or month:

```python
import importlib.util
spec = importlib.util.spec_from_file_location("get_data", "get-data.py")
get_data = importlib.util.module_from_spec(spec)
spec.loader.exec_module(get_data)

# Weekly analysis
weekly_data = get_data.run_week(query_dataframe)  # Returns array: [weeks, request_counts]

# Monthly analysis
monthly_data = get_data.run_month(query_dataframe)  # Returns array: [months, request_counts]
```

## API Reference

### Classes

#### `DumperData`
Main class for interacting with Oakland's 311 API.

**Methods:**
- `__init__(api_token: Optional[str] = None)` - Initialize the client (optionally with API token)
  - If no token provided, checks `OAK311_API_TOKEN` environment variable
  - If token is invalid, automatically retries without authentication
- `open() -> None` - Open connection to the Socrata API
- `close() -> None` - Close the API connection
- `run_query(offset: int = 0, limit: int = 10, where: str = "", order: str = "") -> Optional[pd.DataFrame]` - Query illegal dumping requests
  - Returns: pandas DataFrame with columns: `show_on_map`, `lat`, `lon`, and all API fields
  - Returns `None` if query fails

### Functions

#### `web_mercator_to_wgs84(x: float, y: float) -> Tuple[float, float]`
Convert Web Mercator (EPSG:3857) coordinates to WGS84 (EPSG:4326).

**Parameters:**
- `x`: X coordinate in Web Mercator
- `y`: Y coordinate in Web Mercator

**Returns:** Tuple `(latitude, longitude)` in degrees

#### `dist_between_latlon(coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float`
Calculate distance between two lat/lon coordinates using Haversine formula.

**Parameters:**
- `coord1`: Tuple `(latitude, longitude)` in degrees
- `coord2`: Tuple `(latitude, longitude)` in degrees

**Returns:** Distance in kilometers

**Raises:** `ValueError` if coordinates are invalid

#### `get_requests_within_latlon_radius(query_dataframe: pd.DataFrame, center_coord: Tuple[float, float], center_radius: float) -> None`
Filter requests to show only those within a specified radius of a center point.

**Parameters:**
- `query_dataframe`: pandas DataFrame with `lat`, `lon`, and `show_on_map` columns
- `center_coord`: Tuple `(latitude, longitude)` in degrees
- `center_radius`: Radius in kilometers

**Note:** Modifies the DataFrame in-place by setting `show_on_map` to `False` for requests outside the radius.

**Raises:** `ValueError` if center_coord is invalid

#### `run_map(query_dataframe: pd.DataFrame) -> None`
Display an interactive map of requests using Plotly.

**Parameters:**
- `query_dataframe`: pandas DataFrame with `lat`, `lon`, and `show_on_map` columns

#### `run_week(query_dataframe: pd.DataFrame) -> np.ndarray`
Group requests by week of the year.

**Parameters:**
- `query_dataframe`: pandas DataFrame with `datetimeinit` and `show_on_map` columns

**Returns:** NumPy array with shape `(2, 52)` where first row is week numbers (1-52) and second row is request counts

#### `run_month(query_dataframe: pd.DataFrame) -> np.ndarray`
Group requests by month of the year.

**Parameters:**
- `query_dataframe`: pandas DataFrame with `datetimeinit` and `show_on_map` columns

**Returns:** NumPy array with shape `(2, 12)` where first row is month numbers (1-12) and second row is request counts

#### `datetimeinit_to_datetime(date_string: str) -> datetime.datetime`
Convert date string to datetime object.

**Parameters:**
- `date_string`: Date string in format "YYYY-MM-DD"

**Returns:** datetime object

**Raises:** `ValueError` if date format is invalid

## Code Quality

The codebase includes:
- **Type hints** throughout for better IDE support and type checking
- **Comprehensive docstrings** for all classes and functions
- **Proper error handling** with specific exception types
- **Constants** for magic numbers and configuration values
- **Clean code structure** following Python best practices

## Data Source

This project uses data from:
- **API**: Oakland Open Data Portal (data.oaklandca.gov)
- **Dataset**: 311 Service Requests (`quth-gb8e`)
- **Category**: Illegal Dumping (`REQCATEGORY='ILLDUMP'`)

## Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```env
# Optional: Oakland 311 API Token
# Leave empty if you don't have an API token - the API works without authentication
OAK311_API_TOKEN=your_token_here
```

The script will automatically load environment variables from the `.env` file using `python-dotenv`.

## Notes

- The main function is configured to compare 2024 vs 2025 weekly trends
- Map visualization is centered on Oakland, CA (37.804747, -122.272)
- Distance calculations account for Earth's curvature using the Haversine formula
- The script automatically handles invalid API tokens by retrying without authentication
- All functions include proper error handling and validation

## License

[Add your license information here]

## Contributing

[Add contributing guidelines here]
