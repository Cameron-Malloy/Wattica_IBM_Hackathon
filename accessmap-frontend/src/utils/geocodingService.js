/**
 * Enhanced Geocoding Service for AccessMap
 * Uses comprehensive city cache and real geocoding APIs as fallback
 */

import { ALL_CALIFORNIA_CITIES } from './californiaCitiesData';

// Use OpenStreetMap Nominatim API for free geocoding
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/**
 * Geocode a location string to coordinates
 * @param {string} location - Location string (e.g., "Los Angeles, CA")
 * @returns {Promise<{lat: number, lng: number, display_name: string}>}
 */
export const geocodeLocation = async (location) => {
  try {
    // Add California context if not present
    let searchQuery = location;
    if (!location.includes('CA') && !location.includes('California')) {
      searchQuery = `${location}, CA, USA`;
    }

    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&countrycodes=us&state=CA`
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        display_name: result.display_name,
        confidence: result.importance || 0.5
      };
    } else {
      throw new Error('No geocoding results found');
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    
    // Fallback to California center if geocoding fails
    return {
      lat: 36.7783,
      lng: -119.4179,
      display_name: 'California, USA',
      confidence: 0.1
    };
  }
};

/**
 * Batch geocode multiple locations
 * @param {Array<string>} locations - Array of location strings
 * @returns {Promise<Array<{location: string, coordinates: {lat: number, lng: number}}>>}
 */
export const batchGeocode = async (locations) => {
  const results = [];
  
  for (const location of locations) {
    try {
      const coordinates = await geocodeLocation(location);
      results.push({
        location,
        coordinates
      });
      
      // Rate limiting - Nominatim allows 1 request per second
      await new Promise(resolve => setTimeout(resolve, 1100));
    } catch (error) {
      console.warn(`Failed to geocode ${location}:`, error);
      results.push({
        location,
        coordinates: null
      });
    }
  }
  
  return results;
};

/**
 * Reverse geocode coordinates to location name
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>}
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`
    );

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.status}`);
    }

    const data = await response.json();
    return data.display_name || 'Unknown Location';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return 'Unknown Location';
  }
};

/**
 * Get California city coordinates with comprehensive caching
 * Uses the imported comprehensive city data
 */
const CALIFORNIA_CITIES = ALL_CALIFORNIA_CITIES;

/**
 * Get coordinates for a California city (fast lookup)
 * @param {string} cityName - City name
 * @returns {{lat: number, lng: number} | null}
 */
export const getCaliforniaCityCoordinates = (cityName) => {
  // Clean the city name
  const cleanName = cityName.replace(/, CA$/, '').replace(/ CA$/, '').replace(/ city$/, '').replace(/ town$/, '').replace(/ CDP$/, '');
  
  // Check if we have cached coordinates
  if (CALIFORNIA_CITIES[cleanName]) {
    return CALIFORNIA_CITIES[cleanName];
  }
  
  // Try exact matches first
  for (const [city, coords] of Object.entries(CALIFORNIA_CITIES)) {
    if (cleanName.toLowerCase() === city.toLowerCase()) {
      return coords;
    }
  }
  
  // Try partial matches for cities not in cache
  for (const [city, coords] of Object.entries(CALIFORNIA_CITIES)) {
    if (cleanName.toLowerCase().includes(city.toLowerCase()) || 
        city.toLowerCase().includes(cleanName.toLowerCase())) {
      return coords;
    }
  }
  
  // Try fuzzy matching for similar city names
  const words = cleanName.toLowerCase().split(' ');
  for (const [city, coords] of Object.entries(CALIFORNIA_CITIES)) {
    const cityWords = city.toLowerCase().split(' ');
    const matchCount = words.filter(word => cityWords.includes(word)).length;
    if (matchCount >= Math.min(words.length, cityWords.length) * 0.7) {
      return coords;
    }
  }
  
  return null;
};

/**
 * Get statistics about the city cache
 * @returns {Object} Cache statistics
 */
export const getCityCacheStats = () => {
  const cities = Object.keys(CALIFORNIA_CITIES);
  return {
    totalCities: cities.length,
    cities: cities.sort(),
    regions: {
      northern: cities.filter(city => 
        city.includes('Eureka') || city.includes('Arcata') || city.includes('Redding') || 
        city.includes('Chico') || city.includes('Truckee') || city.includes('South Lake Tahoe')
      ).length,
      central: cities.filter(city => 
        city.includes('Sacramento') || city.includes('Stockton') || city.includes('Modesto') ||
        city.includes('Fresno') || city.includes('Visalia') || city.includes('Bakersfield')
      ).length,
      southern: cities.filter(city => 
        city.includes('Los Angeles') || city.includes('San Diego') || city.includes('Riverside') ||
        city.includes('San Bernardino') || city.includes('Orange') || city.includes('Ventura')
      ).length,
      bayArea: cities.filter(city => 
        city.includes('San Francisco') || city.includes('Oakland') || city.includes('San Jose') ||
        city.includes('Berkeley') || city.includes('Fremont') || city.includes('Hayward')
      ).length
    }
  };
};

export default {
  geocodeLocation,
  batchGeocode,
  reverseGeocode,
  getCaliforniaCityCoordinates,
  getCityCacheStats
};
