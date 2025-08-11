#!/usr/bin/env python3
"""
Extract California city names from census data and format them for the geocoding service
"""

import csv
import re

def clean_city_name(place_name):
    """Clean the place name to extract just the city name"""
    # Remove quotes and "California" suffix
    place_name = place_name.strip('"')
    place_name = re.sub(r', California$', '', place_name)
    
    # Remove CDP, city, town suffixes
    place_name = re.sub(r' CDP$', '', place_name)
    place_name = re.sub(r' city$', '', place_name)
    place_name = re.sub(r' town$', '', place_name)
    
    return place_name

def extract_cities():
    """Extract all unique city names from the census data"""
    cities = set()
    
    with open('census_results/Population_Vulnerability_CA_clean_real.csv', 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            city_name = clean_city_name(row['place'])
            if city_name:  # Skip empty names
                cities.add(city_name)
    
    # Convert to sorted list
    cities_list = sorted(list(cities))
    
    print(f"Found {len(cities_list)} unique cities in census data")
    
    # Write to a file for reference
    with open('extracted_cities.txt', 'w') as file:
        for city in cities_list:
            file.write(f"{city}\n")
    
    print("Cities written to extracted_cities.txt")
    
    # Show first 20 cities as sample
    print("\nSample cities:")
    for city in cities_list[:20]:
        print(f"  {city}")
    
    return cities_list

if __name__ == "__main__":
    extract_cities()
