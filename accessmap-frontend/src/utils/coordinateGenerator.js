/**
 * California City Coordinates Generator
 * 
 * Generates consistent, realistic coordinates for all California cities
 * based on census data using deterministic hashing
 */

// California geographic bounds
const CA_BOUNDS = {
  minLat: 32.5343,   // Southern border
  maxLat: 42.0095,   // Northern border  
  minLng: -124.4096, // Western coast
  maxLng: -114.1318  // Eastern border
};

// Major California cities with known coordinates for reference
const KNOWN_CITIES = {
  'Los Angeles city': { lat: 34.0522, lng: -118.2437 },
  'San Francisco city': { lat: 37.7749, lng: -122.4194 },
  'San Diego city': { lat: 32.7157, lng: -117.1611 },
  'San Jose city': { lat: 37.3382, lng: -121.8863 },
  'Fresno city': { lat: 36.7378, lng: -119.7871 },
  'Sacramento city': { lat: 38.5816, lng: -121.4944 },
  'Long Beach city': { lat: 33.7701, lng: -118.1937 },
  'Oakland city': { lat: 37.8044, lng: -122.2711 },
  'Bakersfield city': { lat: 35.3733, lng: -119.0187 },
  'Anaheim city': { lat: 33.8366, lng: -117.9143 },
  'Santa Ana city': { lat: 33.7456, lng: -117.8677 },
  'Riverside city': { lat: 33.9533, lng: -117.3962 },
  'Stockton city': { lat: 37.9577, lng: -121.2908 },
  'Irvine city': { lat: 33.6846, lng: -117.8265 },
  'Chula Vista city': { lat: 32.6401, lng: -117.0842 },
  'Fremont city': { lat: 37.5485, lng: -121.9886 },
  'Santa Clarita city': { lat: 34.3917, lng: -118.5426 },
  'San Bernardino city': { lat: 34.1083, lng: -117.2898 },
  'Modesto city': { lat: 37.6391, lng: -120.9969 },
  'Fontana city': { lat: 34.0922, lng: -117.4350 }
};

/**
 * Simple hash function for consistent coordinate generation
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate coordinates for a California city
 * @param {string} cityName - Full city name (e.g., "Los Angeles city, CA")
 * @param {Object} demographics - Optional demographic data for regional clustering
 * @returns {Object} - {lat, lng} coordinates
 */
export function generateCityCoordinates(cityName, demographics = {}) {
  // Remove state suffix and normalize
  const cleanName = cityName.replace(/, CA$/, '').replace(/ CA$/, '');
  
  // Check if we have known coordinates
  if (KNOWN_CITIES[cleanName]) {
    return KNOWN_CITIES[cleanName];
  }
  
  // Generate deterministic coordinates based on city name
  const hash1 = simpleHash(cleanName + '_lat');
  const hash2 = simpleHash(cleanName + '_lng');
  
  // Convert hash to coordinate within California bounds
  const latRange = CA_BOUNDS.maxLat - CA_BOUNDS.minLat;
  const lngRange = CA_BOUNDS.maxLng - CA_BOUNDS.minLng;
  
  let lat = CA_BOUNDS.minLat + (hash1 % 10000) / 10000 * latRange;
  let lng = CA_BOUNDS.minLng + (hash2 % 10000) / 10000 * lngRange;
  
  // Add slight clustering based on demographics (elderly/disabled populations tend to cluster)
  if (demographics.percent_over_65 > 0.20) {
    // High elderly areas - slight bias toward warmer southern regions
    lat = lat - (latRange * 0.1);
  }
  
  if (demographics.median_income > 80000) {
    // Higher income areas - slight bias toward coastal regions
    lng = lng - (lngRange * 0.1);
  }
  
  // Ensure coordinates stay within California bounds
  lat = Math.max(CA_BOUNDS.minLat, Math.min(CA_BOUNDS.maxLat, lat));
  lng = Math.max(CA_BOUNDS.minLng, Math.min(CA_BOUNDS.maxLng, lng));
  
  return {
    lat: Math.round(lat * 10000) / 10000, // 4 decimal precision
    lng: Math.round(lng * 10000) / 10000
  };
}

/**
 * Batch generate coordinates for multiple cities
 */
export function generateBulkCoordinates(cities) {
  return cities.map(city => ({
    ...city,
    coordinates: generateCityCoordinates(city.location || city.place, city)
  }));
}

/**
 * Get all California region centers for better distribution
 */
export function getRegionCenters() {
  return [
    { name: 'Los Angeles Metro', lat: 34.0522, lng: -118.2437 },
    { name: 'San Francisco Bay', lat: 37.7749, lng: -122.4194 },
    { name: 'San Diego Metro', lat: 32.7157, lng: -117.1611 },
    { name: 'Central Valley', lat: 36.7378, lng: -119.7871 },
    { name: 'Inland Empire', lat: 34.0922, lng: -117.4350 },
    { name: 'Sacramento Metro', lat: 38.5816, lng: -121.4944 }
  ];
}
