#!/usr/bin/env python3
"""
Script for converting CSV with addresses to GeoJSON format.
Handles geocoding of addresses missing coordinates using Mapbox Geocoding API.
"""

import csv
import json
import os
import time
import requests
import re
from typing import Dict, List, Optional

# Configuration
CSV_FILE = 'Steder/StedertstAlle.csv'
OUTPUT_FILE = 'steder.geojson'

def get_mapbox_token():
    """Get Mapbox access token from .env file or environment variable."""
    # Try environment variable first
    token = os.getenv('MAPBOX_ACCESS_TOKEN')
    if token:
        return token
    
    # Try reading from .env file
    env_file = '.env'
    if os.path.exists(env_file):
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                # Match VITE_YOUR_MAPBOX_ACCESS_TOKEN=...
                match = re.search(r'VITE_YOUR_MAPBOX_ACCESS_TOKEN=(.+)', line)
                if match:
                    return match.group(1).strip()
    
    # Fallback to user input
    return input('Enter your Mapbox access token: ').strip()

MAPBOX_ACCESS_TOKEN = get_mapbox_token()

# Mapbox Geocoding API endpoint
GEOCODING_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places'

def parse_coordinate(coord_str: str) -> Optional[float]:
    """Parse coordinate string, handling both comma and dot as decimal separator."""
    if not coord_str or not coord_str.strip():
        return None
    try:
        # Replace comma with dot for decimal separator
        coord_str = coord_str.strip().replace(',', '.')
        return float(coord_str)
    except (ValueError, AttributeError):
        return None

def geocode_address(address_line: str, post_place: str, zip_code: str, country: str = 'Norway') -> Optional[tuple]:
    """
    Geocode an address using Mapbox Geocoding API.
    Returns (longitude, latitude) or None if geocoding fails.
    """
    # Build query string
    query = f"{address_line}, {post_place}, {zip_code}, {country}"
    
    params = {
        'access_token': MAPBOX_ACCESS_TOKEN,
        'country': 'no',  # Norway
        'limit': 1
    }
    
    try:
        response = requests.get(
            f"{GEOCODING_URL}/{query}.json",
            params=params,
            timeout=10
        )
        response.raise_for_status()
        
        data = response.json()
        if data.get('features') and len(data['features']) > 0:
            coords = data['features'][0]['geometry']['coordinates']
            return tuple(coords)  # Returns [longitude, latitude]
    except Exception as e:
        print(f"  ⚠️  Geocoding failed for '{query}': {e}")
    
    return None

def convert_csv_to_geojson():
    """Convert CSV file to GeoJSON format."""
    features = []
    geocoded_count = 0
    missing_coords_count = 0
    total_count = 0
    
    print(f"Reading CSV file: {CSV_FILE}")
    
    with open(CSV_FILE, 'r', encoding='utf-8') as f:
        # Read CSV with semicolon delimiter
        reader = csv.DictReader(f, delimiter=';')
        
        for row in reader:
            total_count += 1
            
            # Extract data
            def get_value(*keys: str) -> str:
                for key in keys:
                    if key in row and row[key]:
                        return row[key].strip()
                return ''

            address_line = get_value('Forvalt.visitorAddress.addressLine')
            post_place = get_value('Forvalt.visitorAddress.postPlace')
            zip_code = get_value('Forvalt.visitorAddress.zipCode')
            butikk = get_value('Butikk', '\ufeffButikk')
            # Kjøpesenter beholdt for eventuell senere bruk, men brukes ikke i GeoJSON nå
            shopping_center = get_value('Kjøpesenter')
            
            # Parse coordinates (handle comma as decimal separator)
            longitude = parse_coordinate(row.get('Longitude', ''))
            latitude = parse_coordinate(row.get('Latitude', ''))
            
            # If coordinates are missing, try to geocode
            if longitude is None or latitude is None:
                missing_coords_count += 1
                print(f"  🔍 Geocoding: {address_line}, {post_place}")
                
                coords = geocode_address(address_line, post_place, zip_code)
                if coords:
                    longitude, latitude = coords
                    geocoded_count += 1
                    print(f"  ✅ Geocoded: {longitude}, {latitude}")
                    # Rate limiting - be nice to the API
                    time.sleep(0.1)
                else:
                    print(f"  ❌ Could not geocode, skipping this row")
                    continue
            
            # Create GeoJSON feature
            feature = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [longitude, latitude]
                },
                'properties': {
                    'id': str(total_count),
                    'name': butikk,
                    'address': address_line,
                    'city': post_place,
                    'zipCode': zip_code,
                    'addressLine': address_line,
                    'butikk': butikk,
                    'shoppingCenter': shopping_center
                }
            }
            
            features.append(feature)
            
            # Progress indicator
            if total_count % 100 == 0:
                print(f"  Processed {total_count} rows...")
    
    # Create GeoJSON FeatureCollection
    geojson = {
        'type': 'FeatureCollection',
        'features': features
    }
    
    # Write to file
    print(f"\nWriting GeoJSON to: {OUTPUT_FILE}")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(geojson, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Conversion complete!")
    print(f"   Total rows processed: {total_count}")
    print(f"   Features with coordinates: {len(features)}")
    print(f"   Rows missing coordinates: {missing_coords_count}")
    print(f"   Successfully geocoded: {geocoded_count}")
    print(f"   GeoJSON file created: {OUTPUT_FILE}")

if __name__ == '__main__':
    if not MAPBOX_ACCESS_TOKEN:
        print("❌ Error: MAPBOX_ACCESS_TOKEN environment variable not set")
        print("   Set it with: $env:MAPBOX_ACCESS_TOKEN='your_token'")
        exit(1)
    
    if not os.path.exists(CSV_FILE):
        print(f"❌ Error: CSV file not found: {CSV_FILE}")
        exit(1)
    
    convert_csv_to_geojson()

