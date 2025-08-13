import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApi } from '../contexts/ApiContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { 
  MagnifyingGlassIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  FunnelIcon,
  ArrowPathIcon,
  MapPinIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  ComputerDesktopIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { getCaliforniaCityCoordinates } from '../utils/geocodingService';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// California cities with coordinates (fallback)
const CALIFORNIA_CITIES_DATA = {
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'San Francisco': { lat: 37.7749, lng: -122.4194 },
  'San Diego': { lat: 32.7157, lng: -117.1611 },
  'San Jose': { lat: 37.3382, lng: -121.8863 },
  'Fresno': { lat: 36.7378, lng: -119.7871 },
  'Sacramento': { lat: 38.5816, lng: -121.4944 },
  'Long Beach': { lat: 33.7701, lng: -118.1937 },
  'Oakland': { lat: 37.8044, lng: -122.2711 },
  'Bakersfield': { lat: 35.3733, lng: -119.0187 },
  'Anaheim': { lat: 33.8366, lng: -117.9143 },
  'Santa Ana': { lat: 33.7455, lng: -117.8677 },
  'Riverside': { lat: 33.9533, lng: -117.3962 },
  'Stockton': { lat: 37.9577, lng: -121.2908 },
  'Irvine': { lat: 33.6846, lng: -117.8265 },
  'Chula Vista': { lat: 32.6401, lng: -117.0842 },
  'Fremont': { lat: 37.5485, lng: -121.9886 },
  'San Bernardino': { lat: 34.1083, lng: -117.2898 },
  'Modesto': { lat: 37.6391, lng: -120.9969 },
  'Fontana': { lat: 34.0922, lng: -117.4350 },
  'Glendale': { lat: 34.1425, lng: -118.2551 },
  'Huntington Beach': { lat: 33.6595, lng: -118.0094 },
  'Moreno Valley': { lat: 33.9425, lng: -117.2297 },
  'Oxnard': { lat: 34.1975, lng: -119.1771 },
  'Rancho Cucamonga': { lat: 34.1064, lng: -117.5931 },
  'Oceanside': { lat: 33.1959, lng: -117.3795 },
  'Ontario': { lat: 34.0633, lng: -117.6509 },
  'Garden Grove': { lat: 33.7739, lng: -117.9414 },
  'Pomona': { lat: 34.0551, lng: -117.7499 },
  'Santa Rosa': { lat: 38.4404, lng: -122.7141 },
  'Salinas': { lat: 36.6777, lng: -121.6555 },
  'Corona': { lat: 33.8753, lng: -117.5664 },
  'Lancaster': { lat: 34.6868, lng: -118.1542 },
  'Palmdale': { lat: 34.5794, lng: -118.1165 },
  'Hayward': { lat: 37.6688, lng: -122.0808 },
  'Escondido': { lat: 33.1192, lng: -117.0864 },
  'Sunnyvale': { lat: 37.3688, lng: -122.0363 },
  'Torrance': { lat: 33.8358, lng: -118.3406 },
  'Pasadena': { lat: 34.1478, lng: -118.1445 },
  'Orange': { lat: 33.7879, lng: -117.8531 },
  'Fullerton': { lat: 33.8704, lng: -117.9242 },
  'Thousand Oaks': { lat: 34.1706, lng: -118.8376 },
  'Elk Grove': { lat: 38.4088, lng: -121.3716 },
  'Concord': { lat: 37.9722, lng: -122.0016 },
  'Visalia': { lat: 36.3302, lng: -119.2921 },
  'Simi Valley': { lat: 34.2694, lng: -118.7815 },
  'Roseville': { lat: 38.7521, lng: -121.2880 },
  'Santa Clara': { lat: 37.3541, lng: -121.9552 },
  'Vallejo': { lat: 38.1041, lng: -122.2566 },
  'Victorville': { lat: 34.5361, lng: -117.2928 },
  'Berkeley': { lat: 37.8716, lng: -122.2727 },
  'Fairfield': { lat: 38.2494, lng: -122.0400 },
  'Antioch': { lat: 38.0049, lng: -121.8058 },
  'Richmond': { lat: 37.9358, lng: -122.3477 },
  'Daly City': { lat: 37.6879, lng: -122.4702 },
  'Tracy': { lat: 37.7397, lng: -121.4252 },
  'Burbank': { lat: 34.1808, lng: -118.3089 }
};

const CALIFORNIA_CITIES = Object.keys(CALIFORNIA_CITIES_DATA);

const MapPage = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const {
    results,
    loading,
    isConnected,
    getLatestResults
  } = useApi();

  const [selectedDataType, setSelectedDataType] = useState('gaps');
  const [selectedItem, setSelectedItem] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [surveyData, setSurveyData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filters, setFilters] = useState({
    severity: 'all',
    region: 'all',
    priority: 'all'
  });
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  // California bounds
  const CALIFORNIA_BOUNDS = [
    [32.5121, -124.4091], // Southwest
    [42.0095, -114.1312]  // Northeast
  ];

  // Function to get coordinates for a city
  const getCityCoordinates = (cityName) => {
    // Use geocoding service first
    const geocodedCoords = getCaliforniaCityCoordinates(cityName);
    if (geocodedCoords) {
      return geocodedCoords;
    }
    
    // Try exact match with fallback data
    if (CALIFORNIA_CITIES_DATA[cityName]) {
      return CALIFORNIA_CITIES_DATA[cityName];
    }
    
    // Try partial match
    const matchedCity = Object.keys(CALIFORNIA_CITIES_DATA).find(city => 
      city.toLowerCase().includes(cityName.toLowerCase()) || 
      cityName.toLowerCase().includes(city.toLowerCase())
    );
    
    if (matchedCity) {
      return CALIFORNIA_CITIES_DATA[matchedCity];
    }
    
    // Default to Fresno if no match found
    console.warn(`No coordinates found for city: ${cityName}, defaulting to Fresno`);
    return { lat: 36.7378, lng: -119.7871 };
  };

  useEffect(() => {
    if (isConnected) {
      getLatestResults('CA');
      fetchSurveyData();
    }
  }, [isConnected, getLatestResults]);

  const fetchSurveyData = async () => {
    try {
      const response = await fetch('http://localhost:8002/surveys');
      if (response.ok) {
        const data = await response.json();
        setSurveyData(data.surveys || []);
      }
    } catch (error) {
      console.error('Failed to fetch survey data:', error);
    }
  };

  useEffect(() => {
    console.log('MapPage mounted, mapRef:', mapRef.current);
    
    const timer = setTimeout(() => {
      if (mapRef.current && !mapInstanceRef.current) {
        console.log('Initializing map...');
        initializeMap();
      } else {
        console.log('Map ref not ready or already initialized');
      }
    }, 500); // Increased delay

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (results && mapInstanceRef.current && mapInitialized) {
      updateMapMarkers();
    }
  }, [results, selectedDataType, filters, mapInitialized, surveyData, selectedRecommendation]);

  const initializeMap = () => {
    if (mapInstanceRef.current || !mapRef.current) {
      console.log('Map already initialized or ref not ready');
      return;
    }

    if (!L) {
      console.error('Leaflet not loaded');
      return;
    }

    try {
      console.log('Creating map instance...');
      console.log('Map container element:', mapRef.current);
      console.log('Map container dimensions:', mapRef.current.offsetWidth, 'x', mapRef.current.offsetHeight);
      
      const map = L.map(mapRef.current).setView([36.7783, -119.4179], 6);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      L.rectangle(CALIFORNIA_BOUNDS, {
        color: '#3b82f6',
        weight: 2,
        fillOpacity: 0.1
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapInitialized(true);
      console.log('Map initialized successfully');
      
      // Force a resize to ensure the map renders properly
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    } catch (error) {
      console.error('Map initialization failed:', error);
    }
  };

  const updateMapMarkers = () => {
    if (!mapInstanceRef.current || !mapInitialized) return;
    
    // If no results yet, just show the base map
    if (!results) {
      console.log('No results yet, showing base map');
      return;
    }

    try {
      // Clear existing markers
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      let dataToShow = [];
      
      switch (selectedDataType) {
        case 'gaps':
          dataToShow = results.scan_results || [];
          break;
        case 'surveys':
          dataToShow = surveyData.map(survey => ({
            ...survey,
            issue_type: survey.issue.type,
            severity: 'user_reported',
            location: survey.location.city || survey.location.fullAddress || 'Unknown City',
            coordinates: survey.location.coordinates || { lat: 36.7783, lng: -119.4179 },
            id: survey.id || `survey_${Math.random()}`
          }));
          break;
        case 'recommendations':
          if (selectedRecommendation) {
            // Show locations for selected recommendation only
            dataToShow = selectedRecommendation.target_locations?.map(location => {
              // Handle both coordinate objects and location names
              const coordinates = location.lat && location.lng ? location : getCityCoordinates(location);
              const locationName = location.name || location;
              
              return {
                location: locationName,
                coordinates: coordinates,
                issue_type: selectedRecommendation.title,
                severity: 'recommendation',
                description: selectedRecommendation.description,
                recommendation: selectedRecommendation,
                type: selectedRecommendation.type || 'general',
                id: `rec_${selectedRecommendation.id}_${locationName}`
              };
            }) || [];
          } else {
            // Show all recommendation locations (both agent-generated and survey-generated)
            const allRecommendationLocations = results.recommendations
              ?.flatMap(rec => 
                rec.target_locations?.map(location => {
                  // Handle both coordinate objects and location names
                  const coordinates = location.lat && location.lng ? location : getCityCoordinates(location);
                  const locationName = location.name || location;
                  
                  return {
                    location: locationName,
                    coordinates: coordinates,
                    issue_type: rec.title,
                    severity: 'recommendation',
                    description: rec.description,
                    recommendation: rec,
                    type: rec.type || 'general',
                    id: `rec_${rec.id}_${locationName}`
                  };
                }) || []
              ) || [];
            dataToShow = allRecommendationLocations;
          }
          break;
        default:
          dataToShow = [];
      }

      // Apply filters
      dataToShow = dataToShow.filter(item => {
        if (filters.severity !== 'all' && item.severity !== filters.severity) {
          return false;
        }
        if (filters.region !== 'all') {
          const lat = item.lat || item.coordinates?.lat;
          if (filters.region === 'northern' && lat < 37) return false;
          if (filters.region === 'southern' && lat > 37) return false;
          if (filters.region === 'central' && (lat < 35 || lat > 39)) return false;
        }
        return true;
      });

      dataToShow.forEach((item) => {
        const coordinates = item.coordinates || { lat: item.lat, lng: item.lng };
        if (!coordinates || !coordinates.lat || !coordinates.lng) return;

        const { lat, lng } = coordinates;
        
        // Determine marker color and size
        let color = '#3b82f6';
        let radius = 8;
        let popupContent = '';

        if (item.severity === 'user_reported') {
          color = '#f59e0b'; // Orange for user reports
          radius = 10;
          popupContent = `
            <div class="p-4 max-w-sm">
              <div class="flex items-center mb-3">
                <div class="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                <h3 class="font-bold text-lg text-orange-700">User Report</h3>
              </div>
              <div class="space-y-2 text-sm">
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Issue:</strong> ${item.issue_type}</p>
                <p><strong>Description:</strong> ${item.issue.description || 'No description available'}</p>
                <p><strong>Impact:</strong> ${item.impact.daily_impact || 'Not specified'}</p>
                <p><strong>Submitted:</strong> ${new Date(item.submitted_at).toLocaleDateString()}</p>
                ${item.contact.name && !item.contact.anonymous ? `<p><strong>Reporter:</strong> ${item.contact.name}</p>` : ''}
              </div>
            </div>
          `;
        } else if (item.severity === 'recommendation') {
          color = '#8b5cf6'; // Purple for recommendations
          radius = 12;
          popupContent = `
            <div class="p-4 max-w-sm">
              <div class="flex items-center mb-3">
                <div class="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                <h3 class="font-bold text-lg text-purple-700">Recommendation Area</h3>
              </div>
              <div class="space-y-2 text-sm">
                <p><strong>Location:</strong> ${item.location?.name || 'Location'}</p>
                <p><strong>Recommendation:</strong> ${item.issue_type}</p>
                <p><strong>Description:</strong> ${item.description}</p>
                <p><strong>Priority:</strong> ${item.recommendation.priority_level || item.recommendation.priority}</p>
                <p><strong>Timeline:</strong> ${item.recommendation.timeline}</p>
                <p><strong>Cost:</strong> ${item.recommendation.cost_estimate}</p>
                <p><strong>Type:</strong> ${item.recommendation.type || 'infrastructure'}</p>
                ${item.recommendation.survey_based ? '<p><strong>Source:</strong> <span class="text-blue-600">Survey-Based</span></p>' : ''}
              </div>
            </div>
          `;
        } else {
          // Accessibility gaps
          switch (item.severity) {
            case 'critical':
              color = '#dc2626'; // Red
              radius = 12;
              break;
            case 'moderate':
              color = '#f59e0b'; // Orange
              radius = 10;
              break;
            case 'good':
              color = '#10b981'; // Green
              radius = 8;
              break;
            default:
              color = '#3b82f6'; // Blue
              radius = 8;
          }
          
          const severityColor = item.severity === 'critical' ? 'text-red-600' : 
                               item.severity === 'moderate' ? 'text-orange-600' : 'text-green-600';
          
          popupContent = `
            <div class="p-4 max-w-sm">
              <div class="flex items-center mb-3">
                <div class="w-3 h-3 rounded-full ${item.severity === 'critical' ? 'bg-red-500' : item.severity === 'moderate' ? 'bg-orange-500' : 'bg-green-500'} mr-2"></div>
                <h3 class="font-bold text-lg">${item.issue_type || 'Accessibility Issue'}</h3>
              </div>
              <div class="space-y-2 text-sm">
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Severity:</strong> <span class="font-semibold ${severityColor}">${item.severity}</span></p>
                <p><strong>Description:</strong> ${item.description || 'No description available'}</p>
                ${item.confidence ? `<p><strong>Confidence:</strong> ${Math.round(item.confidence * 100)}%</p>` : ''}
                ${item.detected_date ? `<p><strong>Detected:</strong> ${new Date(item.detected_date).toLocaleDateString()}</p>` : ''}
                ${item.vulnerable_population ? `<p><strong>Affected Population:</strong> ${item.vulnerable_population}</p>` : ''}
                ${item.priority_score ? `<p><strong>Priority Score:</strong> ${item.priority_score}/10</p>` : ''}
                ${item.priority_level ? `<p><strong>Priority Level:</strong> ${item.priority_level}</p>` : ''}
              </div>
            </div>
          `;
        }

        const marker = L.circleMarker([lat, lng], {
          radius: radius,
          fillColor: color,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(mapInstanceRef.current);

        if (popupContent) {
          marker.bindPopup(popupContent, {
            maxWidth: 400,
            className: 'custom-popup'
          });
        }

        marker.on('click', () => {
          setSelectedItem(item);
        });
      });

    } catch (error) {
      console.error('Error updating map markers:', error);
    }
  };

  const handleCitySearch = (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const filtered = CALIFORNIA_CITIES.filter(city =>
      city.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
    
    setSearchResults(filtered);
    setShowSearchResults(true);
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setSearchQuery(city);
    setShowSearchResults(false);
    
    const cityData = results?.scan_results?.find(item => 
      item.location.includes(city)
    );

    if (cityData && mapInstanceRef.current) {
      const coords = cityData.coordinates;
      mapInstanceRef.current.setView([coords.lat, coords.lng], 12);
    }
  };

  const clearCitySearch = () => {
    setSelectedCity(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([36.7783, -119.4179], 6);
    }
  };

  const handleDataTypeChange = (type) => {
    setSelectedDataType(type);
    setSelectedRecommendation(null);
    setSelectedItem(null);
  };

  const handleRefreshData = () => {
    if (isConnected) {
      getLatestResults('CA');
      fetchSurveyData();
    }
  };

  const getDataCount = (type) => {
    if (!results) return 0;
    switch (type) {
      case 'gaps':
        return results.scan_results?.length || 0;
      case 'surveys':
        return surveyData.length || 0;
      case 'recommendations':
        return results.recommendations?.length || 0;
      default:
        return 0;
    }
  };

  const getFilteredData = () => {
    if (!results) return [];
    
    switch (selectedDataType) {
      case 'gaps':
        return (results.scan_results || []).filter(item => {
          if (filters.severity !== 'all' && item.severity !== filters.severity) return false;
          if (filters.region !== 'all') {
            const lat = item.coordinates?.lat;
            if (filters.region === 'northern' && lat < 37) return false;
            if (filters.region === 'southern' && lat > 37) return false;
            if (filters.region === 'central' && (lat < 35 || lat > 39)) return false;
          }
          return true;
        });
      case 'surveys':
        return surveyData;
      case 'recommendations':
        if (selectedRecommendation) {
          // Return target locations for the selected recommendation
          return selectedRecommendation.target_locations || [];
        } else {
          // Return all recommendations if none selected
          return results.recommendations || [];
        }
      default:
        return [];
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'infrastructure':
        return <BuildingOfficeIcon className="h-4 w-4 text-blue-600" />;
      case 'policy':
        return <WrenchScrewdriverIcon className="h-4 w-4 text-green-600" />;
      case 'technology':
        return <ComputerDesktopIcon className="h-4 w-4 text-purple-600" />;
      case 'community':
        return <UsersIcon className="h-4 w-4 text-orange-600" />;
      default:
        return <ChartBarIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Backend Not Connected</h2>
          <p className="text-gray-600">Please ensure the backend server is running.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Accessibility Map</h1>
              <p className="text-gray-600">Visualize accessibility gaps and priorities across California</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefreshData}
                disabled={loading}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)] min-h-[600px]">
        {/* Enhanced Sidebar */}
        <div className={`bg-gradient-to-b from-white to-gray-50 shadow-xl border-r border-gray-200 transition-all duration-300 ${sidebarExpanded ? 'w-96' : 'w-80'}`}>
          <div className="p-6 overflow-y-auto h-full">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-900">Map Controls</h2>
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {sidebarExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-sm text-gray-600">Explore accessibility data across California</p>
            </div>

            {/* City Search */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <MagnifyingGlassIcon className="h-4 w-4 mr-2 text-blue-600" />
                Search City
              </h3>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleCitySearch(e.target.value)}
                  placeholder="Enter city name..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={clearCitySearch}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
                
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl">
                    {searchResults.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleCitySelect(city)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mr-3" />
                          {city}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Data Type Selector */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Data Layers</h3>
              <div className="space-y-3">
                {[
                  { type: 'gaps', label: 'Accessibility Gaps', color: 'bg-red-500', icon: '🔍', count: getDataCount('gaps') },
                  { type: 'surveys', label: 'User Reports', color: 'bg-orange-500', icon: '📝', count: getDataCount('surveys') },
                  { type: 'recommendations', label: 'Recommendations', color: 'bg-purple-500', icon: '💡', count: getDataCount('recommendations') }
                ].map(({ type, label, color, icon, count }) => (
                  <button
                    key={type}
                    onClick={() => handleDataTypeChange(type)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedDataType === type
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full ${color} mr-3 shadow-sm`}></div>
                      <span className="text-lg mr-2">{icon}</span>
                      <span className="text-sm font-semibold text-gray-900">{label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-600 bg-white px-2 py-1 rounded-full shadow-sm">{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendation Selector (only for recommendations tab) */}
            {selectedDataType === 'recommendations' && results?.recommendations && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <ChartBarIcon className="h-4 w-4 mr-2 text-purple-600" />
                  Select Recommendation
                </h3>
                <select
                  value={selectedRecommendation?.id || ''}
                  onChange={(e) => {
                    const rec = results.recommendations.find(r => r.id === e.target.value);
                    setSelectedRecommendation(rec || null);
                    // Clear selected item when changing recommendation
                    setSelectedItem(null);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                >
                  <option value="">All Recommendations</option>
                  {results.recommendations.map((rec) => (
                    <option key={rec.id} value={rec.id}>{rec.title}</option>
                  ))}
                </select>
                
                {/* Selected recommendation indicator */}
                {selectedRecommendation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium text-purple-800">
                        Showing locations for: {selectedRecommendation.title}
                      </span>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">
                      {selectedRecommendation.target_locations?.length || 0} target locations
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Filters */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                <FunnelIcon className="h-4 w-4 mr-2 text-blue-600" />
                Filters
              </h3>
              
              <div className="space-y-4">
                {selectedDataType === 'gaps' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Severity Level</label>
                    <select
                      value={filters.severity}
                      onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    >
                      <option value="all">All Severities</option>
                      <option value="critical">Critical</option>
                      <option value="moderate">Moderate</option>
                      <option value="good">Good</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Region</label>
                  <select
                    value={filters.region}
                    onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  >
                    <option value="all">All Regions</option>
                    <option value="northern">Northern CA</option>
                    <option value="central">Central CA</option>
                    <option value="southern">Southern CA</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Data List */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                  <EyeIcon className="h-4 w-4 mr-2 text-blue-600" />
                  {selectedDataType === 'recommendations' && selectedRecommendation 
                    ? `${selectedRecommendation.title} Locations (${getFilteredData().length})`
                    : `Data Points (${getFilteredData().length})`
                  }
                </h3>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {getFilteredData().map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      setSelectedItem(item);
                      if (item.coordinates && mapInstanceRef.current) {
                        mapInstanceRef.current.setView([item.coordinates.lat, item.coordinates.lng], 12);
                      }
                    }}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedItem === item ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 truncate mb-1">
                          {selectedDataType === 'recommendations' 
                            ? item.location 
                            : typeof item.location === 'string' ? item.location : 
                              typeof item.title === 'string' ? item.title : 
                              typeof item.issue_type === 'string' ? item.issue_type : 'Unknown Location'
                          }
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {selectedDataType === 'recommendations'
                            ? selectedRecommendation ? selectedRecommendation.title : 'Recommendation Location'
                            : typeof item.issue_type === 'string' ? item.issue_type : 
                              typeof item.type === 'string' ? item.type : 
                              typeof item.severity === 'string' ? item.severity : 'Unknown Type'
                          }
                        </p>
                        {item.severity && typeof item.severity === 'string' && (
                          <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                            item.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            item.severity === 'moderate' ? 'bg-orange-100 text-orange-800' :
                            item.severity === 'good' ? 'bg-green-100 text-green-800' :
                            item.severity === 'user_reported' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.severity}
                          </span>
                        )}
                      </div>
                      {selectedDataType === 'recommendations' && item.type && (
                        <div className="ml-3">
                          {getRecommendationIcon(item.type)}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Selected Item Details */}
            {selectedItem && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600" />
                    Selected Item
                  </h3>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-semibold text-gray-900">
                      <span className="text-blue-600">Location:</span> {typeof selectedItem.location === 'string' ? selectedItem.location : typeof selectedItem.title === 'string' ? selectedItem.title : 'Unknown'}
                    </p>
                  </div>
                  {selectedItem.issue_type && typeof selectedItem.issue_type === 'string' && (
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="font-semibold text-gray-900">
                        <span className="text-blue-600">Issue:</span> {selectedItem.issue_type}
                      </p>
                    </div>
                  )}
                  {selectedItem.severity && typeof selectedItem.severity === 'string' && (
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="font-semibold text-gray-900">
                        <span className="text-blue-600">Severity:</span> {selectedItem.severity}
                      </p>
                    </div>
                  )}
                  {selectedItem.priority_score && (
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="font-semibold text-gray-900">
                        <span className="text-blue-600">Priority Score:</span> {selectedItem.priority_score}/10
                      </p>
                    </div>
                  )}
                  {selectedItem.priority_level && typeof selectedItem.priority_level === 'string' && (
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="font-semibold text-gray-900">
                        <span className="text-blue-600">Priority Level:</span> {selectedItem.priority_level}
                      </p>
                    </div>
                  )}
                  {selectedItem.description && typeof selectedItem.description === 'string' && (
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="font-semibold text-gray-900">
                        <span className="text-blue-600">Description:</span> {selectedItem.description}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative" style={{ minHeight: '600px' }}>
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <LoadingSpinner />
            </div>
          )}
          
          <div 
            ref={mapRef} 
            className="w-full h-full" 
            style={{ minHeight: '600px', height: '100%' }}
          />
          
          {/* Map Legend - Fixed positioning */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
            <div className="text-xs text-gray-600 mb-2 font-medium">Map Legend</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                <span>Critical</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-orange-500 mr-1"></div>
                <span>Moderate</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                <span>Good</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-orange-500 mr-1"></div>
                <span>User Reports</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-purple-500 mr-1"></div>
                <span>
                  {selectedDataType === 'recommendations' && selectedRecommendation 
                    ? `${selectedRecommendation.title} Locations`
                    : 'Recommendations'
                  }
                </span>
              </div>
            </div>
            
            {/* Current selection indicator */}
            {selectedDataType === 'recommendations' && selectedRecommendation && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
                  <span className="text-xs font-medium text-purple-700 truncate">
                    {selectedRecommendation.title}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedRecommendation.target_locations?.length || 0} locations
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
