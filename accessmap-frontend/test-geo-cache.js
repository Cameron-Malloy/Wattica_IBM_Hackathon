/**
 * Test script to verify geo caching functionality
 * Run with: node test-geo-cache.js
 */

// Mock the React environment for testing
global.window = {};
global.fetch = require('node-fetch');

// Import the geocoding service
const { getCaliforniaCityCoordinates, getCityCacheStats } = require('./src/utils/geocodingService.js');

console.log('🧪 Testing Geo Caching Functionality...\n');

// Test 1: Check if we can get coordinates for major cities
console.log('📍 Test 1: Major City Coordinates');
const testCities = ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'];
testCities.forEach(city => {
  const coords = getCaliforniaCityCoordinates(city);
  if (coords) {
    console.log(`✅ ${city}: ${coords.lat}, ${coords.lng}`);
  } else {
    console.log(`❌ ${city}: No coordinates found`);
  }
});

// Test 2: Check if we can get coordinates for cities from census data
console.log('\n📍 Test 2: Census Data Cities');
const censusCities = ['La Presa', 'Acton', 'Adelanto', 'Agoura Hills'];
censusCities.forEach(city => {
  const coords = getCaliforniaCityCoordinates(city);
  if (coords) {
    console.log(`✅ ${city}: ${coords.lat}, ${coords.lng}`);
  } else {
    console.log(`❌ ${city}: No coordinates found`);
  }
});

// Test 3: Check cache statistics
console.log('\n📊 Test 3: Cache Statistics');
try {
  const stats = getCityCacheStats();
  console.log(`✅ Total cities in cache: ${stats.totalCities}`);
  console.log(`✅ Regional distribution:`, stats.regions);
} catch (error) {
  console.log(`❌ Error getting cache stats: ${error.message}`);
}

// Test 4: Test coordinate generation for unknown cities
console.log('\n📍 Test 4: Unknown Cities (should generate coordinates)');
const unknownCities = ['TestCity', 'NewPlace', 'UnknownLocation'];
unknownCities.forEach(city => {
  const coords = getCaliforniaCityCoordinates(city);
  if (coords) {
    console.log(`✅ ${city}: Generated ${coords.lat}, ${coords.lng}`);
  } else {
    console.log(`❌ ${city}: No coordinates generated`);
  }
});

console.log('\n🏁 Geo Caching Test Complete!');
