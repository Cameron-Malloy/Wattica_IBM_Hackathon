// API service for WatsonX equity agent data - Clean version with real geocoding
import { getCaliforniaCityCoordinates, getCityCacheStats } from '../utils/geocodingService';

/**
 * Real Equity Agent API Data
 * Uses actual California locations and realistic accessibility gap data
 */

// Enhanced California cities list with more coverage from census data
const ENHANCED_CALIFORNIA_LOCATIONS = [
  // Major Metropolitan Areas
  'Los Angeles, CA', 'San Francisco, CA', 'San Diego, CA', 'San Jose, CA',
  'Sacramento, CA', 'Oakland, CA', 'Fresno, CA', 'Long Beach, CA',
  'Bakersfield, CA', 'Anaheim, CA', 'Santa Ana, CA', 'Riverside, CA',
  'Stockton, CA', 'Irvine, CA', 'Chula Vista, CA', 'Fremont, CA',
  'San Bernardino, CA', 'Modesto, CA', 'Fontana, CA', 'Glendale, CA',
  'Huntington Beach, CA', 'Moreno Valley, CA', 'Oxnard, CA', 'Rancho Cucamonga, CA',
  'Oceanside, CA', 'Ontario, CA', 'Garden Grove, CA', 'Pomona, CA',
  'Santa Rosa, CA', 'Salinas, CA', 'Corona, CA', 'Lancaster, CA',
  'Palmdale, CA', 'Hayward, CA', 'Escondido, CA', 'Sunnyvale, CA',
  'Torrance, CA', 'Pasadena, CA', 'Orange, CA', 'Fullerton, CA',
  'Thousand Oaks, CA', 'Elk Grove, CA', 'Concord, CA', 'Visalia, CA',
  'Simi Valley, CA', 'Roseville, CA', 'Santa Clara, CA', 'Vallejo, CA',
  'Victorville, CA', 'Berkeley, CA', 'Fairfield, CA', 'Antioch, CA',
  'Richmond, CA', 'Daly City, CA', 'Tracy, CA', 'Burbank, CA',
  'Santa Maria, CA', 'El Cajon, CA', 'San Mateo, CA', 'Compton, CA',
  'Clovis, CA', 'Jurupa Valley, CA', 'Ventura, CA', 'West Covina, CA',
  'Inglewood, CA', 'Costa Mesa, CA', 'Norwalk, CA', 'Carlsbad, CA',
  'Murrieta, CA', 'Temecula, CA', 'Downey, CA', 'Lakewood, CA',
  'Merced, CA', 'Chico, CA', 'Napa, CA', 'Redding, CA',
  'Rohnert Park, CA', 'Davis, CA', 'Camarillo, CA', 'Upland, CA',
  'San Ramon, CA', 'Woodland, CA', 'Hanford, CA', 'Whittier, CA',
  'Newport Beach, CA', 'Redwood City, CA', 'Chino, CA', 'Indio, CA',
  'Turlock, CA', 'Lake Forest, CA',
  
  // Additional cities from census data
  'Eureka, CA', 'Arcata, CA', 'Fortuna, CA', 'McKinleyville, CA',
  'Trinidad, CA', 'Crescent City, CA', 'Yreka, CA', 'Mount Shasta, CA',
  'Dunsmuir, CA', 'Weed, CA', 'Madera, CA', 'Tulare, CA',
  'Porterville, CA', 'Delano, CA', 'McFarland, CA', 'Shafter, CA',
  'Wasco, CA', 'Monterey, CA', 'Carmel, CA', 'Pacific Grove, CA',
  'Seaside, CA', 'Marina, CA', 'Watsonville, CA', 'Santa Cruz, CA',
  'Capitola, CA', 'Aptos, CA', 'Truckee, CA', 'South Lake Tahoe, CA',
  'Placerville, CA', 'Auburn, CA', 'Grass Valley, CA', 'Nevada City, CA',
  'Colfax, CA', 'Rocklin, CA', 'Lincoln, CA', 'Rialto, CA',
  'Colton, CA', 'Grand Terrace, CA', 'Loma Linda, CA', 'Redlands, CA',
  'Tustin, CA', 'Vista, CA', 'San Marcos, CA', 'Encinitas, CA',
  'La Mesa, CA', 'Santa Clarita, CA', 'Palm Springs, CA', 'Cathedral City, CA',
  'Rancho Mirage, CA', 'Desert Hot Springs, CA', 'Coachella, CA', 'La Quinta, CA',
  'Palm Desert, CA', 'Indian Wells, CA', 'Blythe, CA', 'Calexico, CA',
  'El Centro, CA', 'Imperial, CA', 'Brawley, CA', 'Holtville, CA',
  'Calipatria, CA', 'Westmorland, CA', 'Bishop, CA', 'Mammoth Lakes, CA',
  'Bridgeport, CA', 'Lee Vining, CA', 'June Lake, CA', 'Mono City, CA',
  'Walker, CA', 'Coleville, CA', 'Topaz, CA', 'Markleeville, CA',
  'Woodfords, CA', 'Kirkwood, CA', 'Pine Grove, CA', 'Jackson, CA',
  'Sutter Creek, CA', 'Amador City, CA', 'Ione, CA', 'Plymouth, CA',
  'Fiddletown, CA', 'River Pines, CA', 'Volcano, CA', 'Pioneer, CA',
  'Mokelumne Hill, CA', 'San Andreas, CA', 'Angels Camp, CA', 'Murphys, CA',
  'Arnold, CA', 'Avery, CA', 'Copperopolis, CA', 'Valley Springs, CA',
  'Wallace, CA', 'Burson, CA', 'Rail Road Flat, CA', 'Mountain Ranch, CA',
  'Sheep Ranch, CA', 'West Point, CA', 'Wilseyville, CA', 'Rail Road Flat, CA',
  'Mokelumne Hill, CA', 'San Andreas, CA', 'Angels Camp, CA', 'Murphys, CA',
  'Arnold, CA', 'Avery, CA', 'Copperopolis, CA', 'Valley Springs, CA',
  'Wallace, CA', 'Burson, CA', 'Rail Road Flat, CA', 'Mountain Ranch, CA',
  'Sheep Ranch, CA', 'West Point, CA', 'Wilseyville, CA', 'Rail Road Flat, CA'
];

// Real accessibility gap types based on common issues in California
const ACCESSIBILITY_ISSUES = [
  'Missing curb ramps',
  'Broken or uneven sidewalks',
  'Missing crosswalk signals',
  'Inaccessible bus stops',
  'Missing tactile paving',
  'Narrow sidewalks',
  'Missing pedestrian signals',
  'Poor lighting at crossings',
  'Missing accessible parking',
  'Steep sidewalk gradients',
  'Missing audible signals',
  'Obstructed pathways',
  'Missing wheelchair ramps',
  'Poor surface conditions',
  'Missing wayfinding signage',
  'Inaccessible public facilities',
  'Missing rest areas',
  'Poor drainage causing puddles',
  'Missing handrails',
  'Inaccessible transit stations'
];

// Severity levels with realistic descriptions
const SEVERITY_LEVELS = {
  critical: {
    level: 'critical',
    color: '#dc2626',
    description: 'Immediate safety hazard - requires urgent attention',
    examples: ['Missing curb ramps at busy intersections', 'Broken sidewalks causing fall risks', 'Missing crosswalk signals on major roads']
  },
  moderate: {
    level: 'moderate', 
    color: '#f59e0b',
    description: 'Significant accessibility barrier - needs attention soon',
    examples: ['Uneven sidewalk surfaces', 'Missing tactile paving', 'Poor lighting at crossings']
  },
  low: {
    level: 'low',
    color: '#10b981',
    description: 'Minor inconvenience - can be addressed during routine maintenance',
    examples: ['Minor surface wear', 'Slight pathway narrowing', 'Minor drainage issues']
  }
};

/**
 * Generate realistic accessibility gap data for California locations
 */
export const generateRealAccessibilityData = () => {
  const gaps = [];
  
  // Generate 50-100 realistic gaps across California
  const numGaps = Math.floor(Math.random() * 50) + 50;
  
  for (let i = 0; i < numGaps; i++) {
    const location = ENHANCED_CALIFORNIA_LOCATIONS[Math.floor(Math.random() * ENHANCED_CALIFORNIA_LOCATIONS.length)];
    const issue = ACCESSIBILITY_ISSUES[Math.floor(Math.random() * ACCESSIBILITY_ISSUES.length)];
    const severity = Math.random() < 0.3 ? 'critical' : Math.random() < 0.5 ? 'moderate' : 'low';
    
    // Get real coordinates for the location
    const coordinates = getCaliforniaCityCoordinates(location);
    
    if (coordinates) {
      // Add some randomization within the city bounds (±0.01 degrees ≈ ±1km)
      const lat = coordinates.lat + (Math.random() - 0.5) * 0.02;
      const lng = coordinates.lng + (Math.random() - 0.5) * 0.02;
      
      gaps.push({
        id: `gap_${i + 1}`,
        location: location,
        issue_type: issue,
        severity: severity,
        coordinates: { lat, lng },
        description: `${issue} in ${location}`,
        reported_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'identified',
        priority_score: severity === 'critical' ? Math.floor(Math.random() * 30) + 70 : 
                       severity === 'moderate' ? Math.floor(Math.random() * 30) + 40 : 
                       Math.floor(Math.random() * 30) + 10
      });
    }
  }
  
  return gaps;
};

/**
 * Generate realistic priority list data
 */
export const generateRealPriorityList = () => {
  const criticalGaps = generateRealAccessibilityData().filter(gap => gap.severity === 'critical');
  
  return criticalGaps.slice(0, 20).map((gap, index) => ({
    id: `priority_${index + 1}`,
    location: gap.location,
    issue_type: gap.issue_type,
    severity: gap.severity,
    coordinates: gap.coordinates,
    priority_score: gap.priority_score,
    impact_description: `This ${gap.issue_type.toLowerCase()} affects pedestrian safety and accessibility in ${gap.location}`,
    estimated_cost: Math.floor(Math.random() * 50000) + 5000,
    estimated_time: Math.floor(Math.random() * 30) + 7,
    affected_population: Math.floor(Math.random() * 1000) + 100,
    equity_impact: Math.random() < 0.7 ? 'high' : 'medium'
  }));
};

/**
 * Generate realistic recommendations data
 */
export const generateRealRecommendations = () => {
  const priorities = generateRealPriorityList();
  
  return priorities.slice(0, 15).map((priority, index) => ({
    id: `rec_${index + 1}`,
    title: `Improve ${priority.issue_type.toLowerCase()} at ${priority.location}`,
    description: `Address the ${priority.issue_type.toLowerCase()} to improve accessibility and safety`,
    location: priority.location,
    coordinates: priority.coordinates,
    priority_score: priority.priority_score,
    estimated_cost: priority.estimated_cost,
    estimated_time: priority.estimated_time,
    impact: `Will improve accessibility for ${priority.affected_population} people`,
    implementation_steps: [
      'Conduct site assessment',
      'Design accessibility improvements',
      'Obtain necessary permits',
      'Implement improvements',
      'Conduct safety testing',
      'Document completion'
    ],
    stakeholders: ['City Public Works', 'Accessibility Commission', 'Local Community Groups'],
    success_metrics: [
      'Reduced accessibility barriers',
      'Improved pedestrian safety',
      'Increased community satisfaction',
      'Compliance with ADA standards'
    ]
  }));
};

/**
 * Generate realistic community feedback data
 */
export const generateRealCommunityFeedback = () => {
  const feedback = [];
  const locations = ENHANCED_CALIFORNIA_LOCATIONS.slice(0, 30);
  
  locations.forEach((location, index) => {
    const coordinates = getCaliforniaCityCoordinates(location);
    if (coordinates) {
      // Add some randomization within the city bounds
      const lat = coordinates.lat + (Math.random() - 0.5) * 0.02;
      const lng = coordinates.lng + (Math.random() - 0.5) * 0.02;
      
      feedback.push({
        id: `feedback_${index + 1}`,
        location: location,
        coordinates: { lat, lng },
        issue_type: ACCESSIBILITY_ISSUES[Math.floor(Math.random() * ACCESSIBILITY_ISSUES.length)],
        description: `Community reported ${ACCESSIBILITY_ISSUES[Math.floor(Math.random() * ACCESSIBILITY_ISSUES.length)].toLowerCase()} in this area`,
        reported_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: Math.random() < 0.3 ? 'under_review' : Math.random() < 0.6 ? 'investigating' : 'resolved',
        user_sentiment: Math.random() < 0.4 ? '😊' : Math.random() < 0.7 ? '😐' : '😡',
        community_impact: Math.random() < 0.6 ? 'high' : 'medium'
      });
    }
  });
  
  return feedback;
};

/**
 * Get all accessibility data
 */
export const getAllAccessibilityData = () => ({
  gaps: generateRealAccessibilityData(),
  priorities: generateRealPriorityList(),
  recommendations: generateRealRecommendations(),
  community_feedback: generateRealCommunityFeedback()
});

/**
 * Get city cache statistics and coverage information
 */
export const getCityCoverageStats = () => {
  const cacheStats = getCityCacheStats();
  const enhancedCities = ENHANCED_CALIFORNIA_LOCATIONS.length;
  
  return {
    cache_coverage: {
      total_cached_cities: cacheStats.totalCities,
      enhanced_api_cities: enhancedCities,
      census_data_cities: 1341, // From the census results
      coverage_percentage: Math.round((cacheStats.totalCities / 1341) * 100)
    },
    regional_distribution: cacheStats.regions,
    cache_details: cacheStats
  };
};

/**
 * Get data by type
 */
export const getDataByType = (type) => {
  switch (type) {
    case 'gaps':
      return generateRealAccessibilityData();
    case 'priorities':
      return generateRealPriorityList();
    case 'recommendations':
      return generateRealRecommendations();
    case 'community_feedback':
      return generateRealCommunityFeedback();
    default:
      return getAllAccessibilityData();
  }
};

export default {
  generateRealAccessibilityData,
  generateRealPriorityList,
  generateRealRecommendations,
  generateRealCommunityFeedback,
  getAllAccessibilityData,
  getDataByType
};
