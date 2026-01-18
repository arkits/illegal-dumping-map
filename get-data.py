"""
Illegal Dumping Data Analysis Script

Fetches and analyzes illegal dumping requests from Oakland's 311 service data.
Provides tools for querying, filtering, and visualizing dumping request data.
"""

import datetime
import math
import os
from typing import Optional, Tuple

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import plotly.graph_objects as go
import traceback

from dotenv import load_dotenv
from sodapy import Socrata

# Load environment variables from .env file
load_dotenv()

# Constants
OAKLAND_DOMAIN = "data.oaklandca.gov"
DATASET_ID = "quth-gb8e"
EARTH_RADIUS_METERS = 6378137
OAKLAND_CENTER_LAT = 37.804747
OAKLAND_CENTER_LON = -122.272
MONTHS_IN_YEAR = 12
WEEKS_IN_YEAR = 52


class DumperData:
    """Client for querying Oakland 311 illegal dumping data."""
    
    def __init__(self, api_token: Optional[str] = None):
        """
        Initialize the DumperData client.
        
        Args:
            api_token: Optional API token. If not provided, will check OAK311_API_TOKEN env var.
        """
        # Get token from parameter or environment, use None if empty
        if api_token:
            token = api_token
        else:
            token = os.getenv("OAK311_API_TOKEN")
        
        # Convert empty string to None, keep None as None, keep valid tokens as-is
        self.oak311_api_token = token if token and token.strip() else None
        self.oak311_client: Optional[Socrata] = None
        self.open()

    def open(self) -> None:
        """Open connection to the Socrata API."""
        self.oak311_client = Socrata(OAKLAND_DOMAIN, self.oak311_api_token)

    def close(self) -> None:
        """Close the API connection."""
        if self.oak311_client:
            self.oak311_client.close()
            self.oak311_client = None
    
    def run_query(self, offset: int = 0, limit: int = 10, where: str = "", order: str = "") -> Optional[pd.DataFrame]:
        """
        Query illegal dumping requests from the API.
        
        Args:
            offset: Number of records to skip
            limit: Maximum number of records to return
            where: SQL WHERE clause for filtering
            order: SQL ORDER BY clause for sorting
            
        Returns:
            DataFrame with request data, or None if query fails
        """
        if not self.oak311_client:
            raise RuntimeError("Client not initialized. Call open() first.")
        
        try:
            results = self.oak311_client.get(
                DATASET_ID, 
                offset=offset, 
                limit=limit, 
                where=where, 
                order=order
            )
            query_dataframe = pd.DataFrame.from_records(results)
            
            if len(query_dataframe) == 0:
                return query_dataframe
            
            query_dataframe.insert(0, "show_on_map", [True] * len(query_dataframe))
        except Exception as e:
            # If we get a 403 with invalid token error and we have a token, try without token
            error_str = str(e)
            if "403" in error_str and "Invalid app_token" in error_str and self.oak311_api_token:
                print("Token appears invalid, retrying without authentication...")
                try:
                    # Close and reopen without token
                    self.close()
                    self.oak311_api_token = None
                    self.open()
                    results = self.oak311_client.get(
                        DATASET_ID, 
                        offset=offset, 
                        limit=limit, 
                        where=where, 
                        order=order
                    )
                    query_dataframe = pd.DataFrame.from_records(results)
                    query_dataframe.insert(0, "show_on_map", [True] * len(query_dataframe))
                except Exception as retry_error:
                    print("Unable to obtain information from the client even without token.")
                    print(traceback.format_exc())
                    return None
            else:
                print("Unable to obtain information from the client.")
                print(traceback.format_exc())
                return None

        # Add coordinate columns
        query_dataframe.insert(0, "lat", [0.0] * len(query_dataframe))
        query_dataframe.insert(0, "lon", [0.0] * len(query_dataframe))

        # Convert Web Mercator coordinates to WGS84
        for i, (x, y) in enumerate(zip(query_dataframe['srx'], query_dataframe['sry'])):
            if x and y:
                try:
                    req_coord = web_mercator_to_wgs84(float(x), float(y))
                    query_dataframe.loc[i, "lat"] = req_coord[0]
                    query_dataframe.loc[i, "lon"] = req_coord[1]
                except (ValueError, TypeError) as coord_error:
                    # Skip invalid coordinates
                    continue

        return query_dataframe


def dist_between_latlon(coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
    """
    Calculate distance between two lat/lon coordinates using Haversine formula.
    
    Cannot use the typical 2D distance equation due to the curvature of the Earth.
    
    Args:
        coord1: Tuple of (latitude, longitude) in degrees
        coord2: Tuple of (latitude, longitude) in degrees
        
    Returns:
        Distance in kilometers
        
    Raises:
        ValueError: If coordinates are invalid
    """
    if len(coord1) != 2 or len(coord2) != 2:
        raise ValueError("Coordinates must be tuples of (latitude, longitude)")
    
    if len(coord1) != len(coord2):
        raise ValueError("Coordinates must have the same number of elements")

    # Convert degrees to radians
    lat1_rad = math.radians(coord1[0])
    lon1_rad = math.radians(coord1[1])
    lat2_rad = math.radians(coord2[0])
    lon2_rad = math.radians(coord2[1])

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    # Haversine formula
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    dist_km = EARTH_RADIUS_METERS * c / 1000
    return dist_km


def web_mercator_to_wgs84(x: float, y: float) -> Tuple[float, float]:
    """
    Convert Web Mercator (EPSG:3857) coordinates to WGS84 (EPSG:4326).
    
    Args:
        x: X coordinate in Web Mercator
        y: Y coordinate in Web Mercator
        
    Returns:
        Tuple of (latitude, longitude) in degrees
    """
    lon_rad = x / EARTH_RADIUS_METERS
    lat_rad = 2 * math.atan(math.exp(y / EARTH_RADIUS_METERS)) - math.pi / 2

    return (math.degrees(lat_rad), math.degrees(lon_rad))


def get_requests_within_latlon_radius(
    query_dataframe: pd.DataFrame, 
    center_coord: Tuple[float, float], 
    center_radius: float
) -> None:
    """
    Filter requests to show only those within a specified radius of a center point.
    
    Modifies the DataFrame in-place by setting show_on_map to False for requests
    outside the radius.
    
    Args:
        query_dataframe: DataFrame with lat, lon, and show_on_map columns
        center_coord: Tuple of (latitude, longitude) for center point
        center_radius: Radius in kilometers
    """
    if len(center_coord) != 2:
        raise ValueError("center_coord must be a tuple of (latitude, longitude)")
    
    for i, row in query_dataframe.iterrows():
        if not row['show_on_map']:
            continue
            
        req_coord = (row['lat'], row['lon'])
        
        if dist_between_latlon(req_coord, center_coord) > center_radius:
            query_dataframe.loc[i, "show_on_map"] = False


def run_map(query_dataframe: pd.DataFrame) -> None:
    """
    Display an interactive map of requests using Plotly.
    
    Args:
        query_dataframe: DataFrame with lat, lon, and show_on_map columns
    """
    lat = []
    lon = []

    for _, row in query_dataframe.iterrows():
        if row['show_on_map']:
            lat.append(row['lat'])
            lon.append(row['lon'])

    fig = go.Figure(go.Scattermap(
        lat=lat,
        lon=lon,
        mode='markers',
        marker=go.scattermap.Marker(size=5)
    ))

    fig.update_layout(
        autosize=True,
        hovermode='closest',
        map=dict(
            bearing=0,
            center=dict(lat=OAKLAND_CENTER_LAT, lon=OAKLAND_CENTER_LON),
            pitch=0,
            zoom=10
        ),
    )

    fig.show()


def datetimeinit_to_datetime(date_string: str) -> datetime.datetime:
    """
    Convert date string to datetime object.
    
    Args:
        date_string: Date string in format "YYYY-MM-DD"
        
    Returns:
        datetime object
        
    Raises:
        ValueError: If date_string format is invalid
    """
    try:
        return datetime.datetime.strptime(date_string, "%Y-%m-%d")
    except ValueError as e:
        raise ValueError(f"Invalid date format: {date_string}. Expected YYYY-MM-DD") from e


def run_month(query_dataframe: pd.DataFrame) -> np.ndarray:
    """
    Group requests by month of the year.
    
    Args:
        query_dataframe: DataFrame with datetimeinit and show_on_map columns
        
    Returns:
        NumPy array with shape (2, 12) where first row is month numbers (1-12)
        and second row is request counts
    """
    months = np.array(list(range(1, MONTHS_IN_YEAR + 1)))
    req_num = np.array([0] * MONTHS_IN_YEAR)

    for i, row in query_dataframe.iterrows():
        if not row['show_on_map']:
            continue
        try:
            date_str = row['datetimeinit'].split('T')[0]
            ymd = date_str.split('-')
            if len(ymd) >= 2:
                month = int(ymd[1])
                if 1 <= month <= 12:
                    req_num[month - 1] += 1
        except (ValueError, IndexError, KeyError, AttributeError) as e:
            print(f"Skipping row {i}: {e}")

    return np.vstack((months, req_num))


def run_week(query_dataframe: pd.DataFrame) -> np.ndarray:
    """
    Group requests by week of the year.
    
    Args:
        query_dataframe: DataFrame with datetimeinit and show_on_map columns
        
    Returns:
        NumPy array with shape (2, 52) where first row is week numbers (1-52)
        and second row is request counts
    """
    weeks = np.array(list(range(1, WEEKS_IN_YEAR + 1)))
    req_num = np.array([0] * WEEKS_IN_YEAR)

    for i, row in query_dataframe.iterrows():
        if not row['show_on_map']:
            continue
        try:
            date_str = row['datetimeinit'].split('T')[0]
            ymd = date_str.split('-')
            if len(ymd) >= 3:
                date_obj = datetime.date(int(ymd[0]), int(ymd[1]), int(ymd[2]))
                week = date_obj.isocalendar()[1]
                if 1 <= week <= WEEKS_IN_YEAR:
                    req_num[week - 1] += 1
        except (ValueError, IndexError, KeyError, AttributeError) as e:
            print(f"Skipping row {i}: {e}")
    
    return np.vstack((weeks, req_num))


def main() -> None:
    """Main function to fetch and visualize illegal dumping data."""
    api_token = os.getenv("OAK311_API_TOKEN")
    dump = DumperData(api_token)
    
    # Fetch 2024 data
    query_dataframe = dump.run_query(
        offset=0, 
        limit=100000, 
        where="REQCATEGORY='ILLDUMP' AND date_extract_y(DATETIMEINIT)=2024", 
        order="DATETIMEINIT DESC"
    )
    if query_dataframe is None or len(query_dataframe) == 0:
        print("Failed to fetch 2024 data or no data found. Exiting.")
        dump.close()
        return
    
    data_2024 = run_week(query_dataframe)

    # Fetch 2025 data
    query_dataframe = dump.run_query(
        offset=0, 
        limit=100000, 
        where="REQCATEGORY='ILLDUMP' AND date_extract_y(DATETIMEINIT)=2025", 
        order="DATETIMEINIT DESC"
    )
    if query_dataframe is None or len(query_dataframe) == 0:
        print("Failed to fetch 2025 data or no data found. Exiting.")
        dump.close()
        return
    
    data_2025 = run_week(query_dataframe)

    # Create comparison plot
    plt.figure(figsize=(12, 6))
    plt.xlabel('Week', fontsize=12)
    plt.ylabel('Number of illegal dumping requests', fontsize=12)
    plt.title('2024 (Blue) vs 2025 (Orange) Requests Weekly Trend', fontsize=14)
    plt.xlim(data_2024[0][0], data_2024[0][-1])
    plt.xticks(np.arange(data_2024[0][0], data_2024[0][-1] + 1, 1))
    plt.plot(data_2024[0], data_2024[1], label='2024', linewidth=2)
    plt.plot(data_2025[0][:29], data_2025[1][:29], label='2025', linewidth=2)
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.show()
    
    dump.close()


if __name__ == "__main__":
    main()
