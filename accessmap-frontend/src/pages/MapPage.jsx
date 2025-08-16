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

// Global function for popup tab switching
if (typeof window !== 'undefined') {
  window.switchPopupTab = function(btn, tabName) {
    const popup = btn.closest('.leaflet-popup-content');
    if (!popup) return;
    
    const isOrange = btn.classList.contains('text-orange-600');
    
    // Update tab buttons in this popup only
    popup.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('active');
      b.classList.add('text-gray-500');
      if (isOrange) {
        b.classList.remove('text-orange-600', 'border-orange-600', 'bg-orange-50');
      } else {
        b.classList.remove('text-blue-600', 'border-blue-600', 'bg-blue-50');
      }
    });
    
    btn.classList.add('active');
    if (isOrange) {
      btn.classList.add('text-orange-600', 'border-orange-600', 'bg-orange-50');
    } else {
      btn.classList.add('text-blue-600', 'border-blue-600', 'bg-blue-50');
    }
    btn.classList.remove('text-gray-500');
    
    // Update tab content in this popup only
    popup.querySelectorAll('.tab-content').forEach(content => {
      content.classList.add('hidden');
    });
    popup.querySelector('#' + tabName + '-tab').classList.remove('hidden');
  };
}

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
    console.log('MapPage useEffect - isConnected:', isConnected);
    if (isConnected) {
      console.log('API is connected, fetching latest results...');
      getLatestResults('CA');
      fetchSurveyData();
    } else {
      console.log('API is not connected');
    }
  }, [isConnected, getLatestResults]);

  const fetchSurveyData = async () => {
    try {
      const response = await fetch('http://localhost:8003/surveys');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched survey data:', data);
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
    console.log('Results useEffect triggered:', {
      hasResults: !!results,
      hasMapInstance: !!mapInstanceRef.current,
      mapInitialized,
      selectedDataType,
      filters
    });
    
    if (results && mapInstanceRef.current && mapInitialized) {
      console.log('Calling updateMapMarkers...');
      updateMapMarkers();
    }
  }, [results, selectedDataType, filters, mapInitialized, surveyData]);

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
    
    console.log('Raw results:', results);
    console.log('scan_results length:', results.scan_results?.length);
    console.log('recommendations length:', results.recommendations?.length);

    try {
      // Clear existing markers
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      // Use getFilteredData to get data with recommendations
      let dataToShow = getFilteredData();
      console.log('getFilteredData result:', dataToShow);
      console.log('dataToShow length:', dataToShow.length);



              dataToShow.forEach((item) => {
          // Get coordinates with proper fallback
          let coordinates = item.coordinates || { lat: item.lat, lng: item.lng };
          
          // If coordinates are still null/undefined, try to get them from the location name
          if (!coordinates || !coordinates.lat || !coordinates.lng) {
            if (item.location) {
              coordinates = getCityCoordinates(item.location);
            }
          }
          
          // Final validation - if still no valid coordinates, skip this item
          if (!coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
            console.warn(`Skipping item with invalid coordinates:`, item);
            return;
          }

          const { lat, lng } = coordinates;
        
        // Determine marker color and size
        let color = '#3b82f6';
        let radius = 8;
        let popupContent = '';

        if (item.severity === 'user_reported') {
          console.log('Creating user_reported marker for:', item);
          color = '#f59e0b'; // Orange for user reports
          radius = item.hasRecommendations ? 12 : 10; // Larger radius if has recommendations
          
          // Get the primary recommendation for this user report
          const primaryRecommendation = item.associatedRecommendations && item.associatedRecommendations.length > 0 
            ? item.associatedRecommendations[0] 
            : null;
          
          // Create a beautiful recommendation section for user reports
          let recommendationSection = '';
          if (primaryRecommendation) {
            recommendationSection = `
              <div class="mt-3 bg-gradient-to-br from-orange-50 to-red-50 rounded p-3 border border-orange-200">
                <div class="flex items-center mb-2">
                  <div class="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                    <span class="text-orange-600 text-sm">💡</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-orange-800 text-xs">Community Solution</h4>
                    <p class="text-xs text-orange-600">${primaryRecommendation.type || 'Community'} • ${primaryRecommendation.priority_level || 'High'} Priority</p>
                  </div>
                </div>
                <div class="mb-2">
                  <h5 class="font-medium text-orange-800 text-xs mb-1">${primaryRecommendation.title}</h5>
                  <p class="text-xs text-gray-600 leading-relaxed">${primaryRecommendation.description ? primaryRecommendation.description.substring(0, 80) + '...' : 'Community-driven solution to address this accessibility issue.'}</p>
                </div>
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    ${primaryRecommendation.cost_estimate ? `
                      <div class="flex items-center">
                        <span class="text-xs text-gray-500">💰</span>
                        <span class="text-xs font-medium text-gray-700 ml-1">${primaryRecommendation.cost_estimate}</span>
                      </div>
                    ` : ''}
                    ${primaryRecommendation.timeline ? `
                      <div class="flex items-center">
                        <span class="text-xs text-gray-500">⏱️</span>
                        <span class="text-xs font-medium text-gray-700 ml-1">${primaryRecommendation.timeline}</span>
                      </div>
                    ` : ''}
                  </div>
                </div>
                <a 
                  href="/ai-advisor?tab=recommendations&rec=${primaryRecommendation.id}" 
                  target="_blank"
                  class="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-xs font-semibold py-2 px-3 rounded transition-all duration-200 inline-block text-center shadow-sm hover:shadow-md"
                >
                  🤖 View AI Solution
                </a>
              </div>
            `;
          } else {
            // Fallback for user reports without solutions
            recommendationSection = `
              <div class="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div class="flex items-center mb-3">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span class="text-blue-600 text-lg">🔍</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-blue-800 text-sm">Analysis Available</h4>
                    <p class="text-xs text-blue-600">Community feedback analysis</p>
                  </div>
                </div>
                <p class="text-xs text-gray-600 mb-3">This community report has been analyzed and AI solutions are available.</p>
                <a 
                  href="/ai-advisor?tab=recommendations" 
                  target="_blank"
                  class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-200 inline-block text-center shadow-sm hover:shadow-md"
                >
                  🤖 View AI Analysis
                </a>
              </div>
            `;
          }
          
          popupContent = `
            <div class="bg-white rounded-lg shadow-lg border border-gray-200" style="width: 320px;">
              <!-- Header -->
              <div class="p-3 border-b border-gray-200">
                <div class="flex items-start justify-between">
                  <div class="flex items-center flex-1">
                    <div class="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                    <div class="min-w-0 flex-1">
                      <h3 class="font-semibold text-gray-900 text-sm truncate">Community Report</h3>
                      <p class="text-xs text-gray-500 truncate">${item.location}</p>
                    </div>
                  </div>
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 bg-orange-100 text-orange-800">
                    User Reported
                  </span>
                </div>
              </div>
              
              <!-- Tabs -->
              <div class="flex border-b border-gray-200">
                <button class="tab-btn active flex-1 py-2 px-3 text-xs font-medium text-orange-600 border-b-2 border-orange-600 bg-orange-50" onclick="window.switchPopupTab(this, 'report')">
                  Report
                </button>
                <button class="tab-btn flex-1 py-2 px-3 text-xs font-medium text-gray-500 hover:text-gray-700" onclick="window.switchPopupTab(this, 'solution')">
                  Solution
                </button>
              </div>
              
              <!-- Tab Content -->
              <div class="p-3">
                <!-- Report Tab -->
                <div id="report-tab" class="tab-content">
                  <div class="space-y-2">
                    <div class="bg-orange-50 rounded p-2">
                      <h4 class="font-medium text-orange-800 text-xs mb-1">${item.issue_type}</h4>
                      <p class="text-xs text-gray-700 leading-relaxed">${(item.issue?.description || item.survey_issue?.description) ? (item.issue?.description || item.survey_issue?.description).substring(0, 120) + '...' : 'Community-reported accessibility issue in this location.'}</p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-2 text-xs">
                      <div class="bg-blue-50 rounded p-2">
                        <p class="text-blue-600 font-medium">Daily Impact</p>
                        <p class="text-blue-800 font-bold">${item.impact?.daily_impact || 'High'}</p>
                      </div>
                      <div class="bg-green-50 rounded p-2">
                        <p class="text-green-600 font-medium">Submitted</p>
                        <p class="text-green-800 font-bold">${new Date(item.submitted_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    ${item.contact?.name && !item.contact?.anonymous ? `
                      <div class="bg-gray-50 rounded p-2">
                        <p class="text-xs text-gray-600">Reported by: <span class="font-medium text-gray-800">${item.contact.name}</span></p>
                      </div>
                    ` : ''}
                  </div>
                </div>
                
                <!-- Solution Tab -->
                <div id="solution-tab" class="tab-content hidden">
                  ${recommendationSection}
                </div>
              </div>
              
              <style>
                .tab-btn.active {
                  color: #ea580c;
                  border-bottom-color: #ea580c;
                  background-color: #fff7ed;
                }
                .tab-content.hidden {
                  display: none;
                }
              </style>
              
              <script>
                // Add event listeners when popup opens
                setTimeout(() => {
                  const tabBtns = document.querySelectorAll('.tab-btn');
                  tabBtns.forEach(btn => {
                    btn.addEventListener('click', function() {
                      const tabName = this.getAttribute('data-tab');
                      const isOrange = this.classList.contains('text-orange-600');
                      
                      // Update tab buttons
                      document.querySelectorAll('.tab-btn').forEach(b => {
                        b.classList.remove('active');
                        b.classList.add('text-gray-500');
                        if (isOrange) {
                          b.classList.remove('text-orange-600', 'border-orange-600', 'bg-orange-50');
                        } else {
                          b.classList.remove('text-blue-600', 'border-blue-600', 'bg-blue-50');
                        }
                      });
                      
                      this.classList.add('active');
                      if (isOrange) {
                        this.classList.add('text-orange-600', 'border-orange-600', 'bg-orange-50');
                      } else {
                        this.classList.add('text-blue-600', 'border-blue-600', 'bg-blue-50');
                      }
                      this.classList.remove('text-gray-500');
                      
                      // Update tab content
                      document.querySelectorAll('.tab-content').forEach(content => {
                        content.classList.add('hidden');
                      });
                      document.getElementById(tabName + '-tab').classList.remove('hidden');
                    });
                  });
                }, 100);
              </script>
            </div>
          `;
        } else if (item.severity === 'recommendation') {
          color = '#8b5cf6'; // Purple for recommendations
          radius = 12;
          
          // Get accessibility gaps this recommendation addresses
          const addressedGaps = item.addresses_gaps && item.addresses_gaps.length > 0 
            ? `Addresses ${item.addresses_gaps.length} accessibility gap(s)`
            : 'Addresses accessibility barriers';
          
          popupContent = `
            <div class="p-4 max-w-sm">
              <div class="flex items-center mb-3">
                <div class="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                <h3 class="font-bold text-lg text-purple-700">Accessibility Improvement</h3>
              </div>
              <div class="space-y-2 text-sm">
                <p><strong>Location:</strong> ${item.location || 'Unknown Location'}</p>
                <p><strong>Recommendation:</strong> ${item.recommendation.title}</p>
                <p><strong>Description:</strong> ${item.description}</p>
                <p><strong>Priority:</strong> ${item.recommendation.priority_level || item.recommendation.priority}</p>
                <p><strong>Timeline:</strong> ${item.recommendation.timeline}</p>
                <p><strong>Cost:</strong> ${item.recommendation.cost_estimate}</p>
                <p><strong>Type:</strong> ${item.recommendation.type || 'infrastructure'}</p>
                <p><strong>Scope:</strong> ${addressedGaps}</p>
                ${item.recommendation.survey_based ? '<p><strong>Source:</strong> <span class="text-blue-600">Survey-Based</span></p>' : '<p><strong>Source:</strong> <span class="text-green-600">AI Analysis</span></p>'}
                ${item.recommendation.implementation_steps ? '<p><strong>Implementation Steps:</strong> Available</p>' : ''}
                ${item.recommendation.success_metrics ? '<p><strong>Success Metrics:</strong> Available</p>' : ''}
                ${item.recommendation.sdg_alignment ? '<p><strong>SDG Alignment:</strong> Available</p>' : ''}
              </div>
            </div>
          `;
        } else {
          // Accessibility gaps
          let baseColor, baseRadius;
          switch (item.severity) {
            case 'critical':
              baseColor = '#dc2626'; // Red
              baseRadius = 12;
              break;
            case 'moderate':
              baseColor = '#f59e0b'; // Orange
              baseRadius = 10;
              break;
            case 'good':
              baseColor = '#10b981'; // Green
              baseRadius = 8;
              break;
            default:
              baseColor = '#3b82f6'; // Blue
              baseRadius = 8;
          }
          
          // If the gap has recommendations, add a purple border/ring effect
          if (item.hasRecommendations) {
            color = baseColor;
            radius = baseRadius + 2; // Slightly larger to accommodate border
          } else {
            color = baseColor;
            radius = baseRadius;
          }
          
          const severityColor = item.severity === 'critical' ? 'text-red-600' : 
                               item.severity === 'moderate' ? 'text-orange-600' : 'text-green-600';
          
          // Get the primary recommendation for this city
          const primaryRecommendation = item.associatedRecommendations && item.associatedRecommendations.length > 0 
            ? item.associatedRecommendations[0] 
            : null;
          
          // Debug logging
          console.log('Popup Debug:', {
            location: item.location,
            hasRecommendations: item.hasRecommendations,
            associatedRecommendations: item.associatedRecommendations,
            primaryRecommendation: primaryRecommendation,
            recommendationSection: primaryRecommendation ? 'Will show recommendation' : 'Will show fallback'
          });
          

          
          // Create a beautiful recommendation section
          let recommendationSection = '';
          
          // Force recommendation section to always show for debugging
          if (primaryRecommendation) {
            recommendationSection = `
              <div class="mt-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded p-3 border border-purple-200">
                <div class="flex items-center mb-2">
                  <div class="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                    <span class="text-purple-600 text-sm">💡</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-purple-800 text-xs">Recommended Solution</h4>
                    <p class="text-xs text-purple-600">${primaryRecommendation.type || 'Infrastructure'} • ${primaryRecommendation.priority_level || 'Medium'} Priority</p>
                  </div>
                </div>
                <div class="mb-2">
                  <h5 class="font-medium text-purple-800 text-xs mb-1">${primaryRecommendation.title}</h5>
                  <p class="text-xs text-gray-600 leading-relaxed">${primaryRecommendation.description ? primaryRecommendation.description.substring(0, 80) + '...' : 'Comprehensive accessibility improvements for this location.'}</p>
                </div>
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    ${primaryRecommendation.cost_estimate ? `
                      <div class="flex items-center">
                        <span class="text-xs text-gray-500">💰</span>
                        <span class="text-xs font-medium text-gray-700 ml-1">${primaryRecommendation.cost_estimate}</span>
                      </div>
                    ` : ''}
                    ${primaryRecommendation.timeline ? `
                      <div class="flex items-center">
                        <span class="text-xs text-gray-500">⏱️</span>
                        <span class="text-xs font-medium text-gray-700 ml-1">${primaryRecommendation.timeline}</span>
                      </div>
                    ` : ''}
                  </div>
                </div>
                <a 
                  href="/ai-advisor?tab=recommendations&rec=${primaryRecommendation.id}" 
                  target="_blank"
                  class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold py-2 px-3 rounded transition-all duration-200 inline-block text-center shadow-sm hover:shadow-md"
                >
                  🤖 View AI Recommendation
                </a>
              </div>
            `;
          } else {
            // Fallback for cities without recommendations
            recommendationSection = `
              <div class="mt-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded p-3 border border-blue-200">
                <div class="flex items-center mb-2">
                  <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <span class="text-blue-600 text-sm">🔍</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-blue-800 text-xs">Analysis Available</h4>
                    <p class="text-xs text-blue-600">Comprehensive accessibility analysis</p>
                  </div>
                </div>
                <p class="text-xs text-gray-600 mb-2">Detailed accessibility analysis and AI recommendations are available for ${item.location}.</p>
                <a 
                  href="/ai-advisor?tab=recommendations" 
                  target="_blank"
                  class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold py-2 px-3 rounded transition-all duration-200 inline-block text-center shadow-sm hover:shadow-md"
                >
                  🤖 View AI Analysis
                </a>
              </div>
            `;
          }
          
          // Always show a recommendation section for debugging
          if (!recommendationSection) {
            recommendationSection = `
              <div class="mt-3 bg-gradient-to-br from-red-50 to-pink-50 rounded p-3 border border-red-200">
                <div class="flex items-center mb-2">
                  <div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-2">
                    <span class="text-red-600 text-sm">⚠️</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-red-800 text-xs">Debug: No Recommendation Found</h4>
                    <p class="text-xs text-red-600">This should not happen</p>
                  </div>
                </div>
                <p class="text-xs text-gray-600 mb-2">hasRecommendations: ${item.hasRecommendations}, recommendationsCount: ${item.associatedRecommendations?.length || 0}</p>
                <a 
                  href="/ai-advisor?tab=recommendations" 
                  target="_blank"
                  class="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white text-xs font-semibold py-2 px-3 rounded transition-all duration-200 inline-block text-center shadow-sm hover:shadow-md"
                >
                  🤖 View AI Advisor
                </a>
              </div>
            `;
          }
          
          popupContent = `
            <div class="bg-white rounded-lg shadow-lg border border-gray-200" style="width: 320px;">
              <!-- Header -->
              <div class="p-3 border-b border-gray-200">
                <div class="flex items-start justify-between">
                  <div class="flex items-center flex-1">
                    <div class="w-3 h-3 rounded-full ${item.severity === 'critical' ? 'bg-red-500' : item.severity === 'moderate' ? 'bg-orange-500' : 'bg-green-500'} mr-2"></div>
                    <div class="min-w-0 flex-1">
                      <h3 class="font-semibold text-gray-900 text-sm truncate">${item.issue_type || 'Accessibility Issue'}</h3>
                      <p class="text-xs text-gray-500 truncate">${item.location}</p>
                    </div>
                  </div>
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                    item.severity === 'critical' ? 'bg-red-100 text-red-800' : 
                    item.severity === 'moderate' ? 'bg-orange-100 text-orange-800' : 
                    'bg-green-100 text-green-800'
                  }">
                    ${item.severity}
                  </span>
                </div>
              </div>
              
              <!-- Tabs -->
              <div class="flex border-b border-gray-200">
                <button class="tab-btn active flex-1 py-2 px-3 text-xs font-medium text-blue-600 border-b-2 border-blue-600 bg-blue-50" onclick="window.switchPopupTab(this, 'details')">
                  Details
                </button>
                <button class="tab-btn flex-1 py-2 px-3 text-xs font-medium text-gray-500 hover:text-gray-700" onclick="window.switchPopupTab(this, 'solution')">
                  Solution
                </button>
              </div>
              
              <!-- Tab Content -->
              <div class="p-3">
                <!-- Details Tab -->
                <div id="details-tab" class="tab-content">
                  <div class="space-y-2">
                    <div class="bg-gray-50 rounded p-2">
                      <p class="text-xs text-gray-700 leading-relaxed">${item.description ? item.description.substring(0, 120) + '...' : 'Accessibility issue identified in this location.'}</p>
                    </div>
                    
                    ${item.vulnerable_population ? `
                      <div class="bg-orange-50 rounded p-2">
                        <p class="text-xs text-orange-600 font-medium">Affected Population</p>
                        <p class="text-xs text-orange-800 font-semibold">${item.vulnerable_population}</p>
                      </div>
                    ` : ''}
                    
                    ${item.priority_score ? `
                      <div class="bg-blue-50 rounded p-2">
                        <p class="text-xs text-blue-600 font-medium">Priority Score</p>
                        <p class="text-xs text-blue-800 font-semibold">${item.priority_score}/10</p>
                      </div>
                    ` : ''}
                  </div>
                </div>
                
                <!-- Solution Tab -->
                <div id="solution-tab" class="tab-content hidden">
                  ${recommendationSection}
                </div>
              </div>
              
              <style>
                .tab-btn {
                  cursor: pointer;
                  transition: all 0.2s ease;
                }
                .tab-btn:hover {
                  background-color: #f3f4f6;
                }
                .tab-btn.active {
                  color: #2563eb;
                  border-bottom-color: #2563eb;
                  background-color: #eff6ff;
                }
                .tab-content.hidden {
                  display: none;
                }
              </style>
            </div>
          `;
        }



        const marker = L.circleMarker([lat, lng], {
          radius: radius,
          fillColor: color,
          color: item.hasRecommendations ? '#8b5cf6' : '#ffffff', // Purple border for items with recommendations
          weight: item.hasRecommendations ? 3 : 2, // Thicker border for items with recommendations
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(mapInstanceRef.current);
        
        if (item.severity === 'user_reported') {
          console.log('Created user_reported marker at:', lat, lng, 'with color:', color, 'radius:', radius);
        }



        if (popupContent) {
          marker.bindPopup(popupContent, {
            className: 'custom-popup',
            closeButton: true,
            autoClose: false,
            closeOnClick: false,
            offset: [0, -10] // Offset to center better on the marker
          });
        }

        marker.on('click', () => {
          setSelectedItem(item);
          // Smooth zoom to the marker location with a more reasonable zoom level
          mapInstanceRef.current.flyTo([lat, lng], 8.25, {
            duration: 1.5,
            easeLinearity: 0.25
          });
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
      mapInstanceRef.current.flyTo([coords.lat, coords.lng], 10, {
        duration: 2,
        easeLinearity: 0.25
      });
    }
  };

  const clearCitySearch = () => {
    setSelectedCity(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([36.7783, -119.4179], 6, {
        duration: 2,
        easeLinearity: 0.25
      });
    }
  };

  const handleDataTypeChange = (type) => {
    setSelectedDataType(type);
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
        const surveyRecommendationsCount = results.recommendations?.filter(rec => rec.survey_based)?.length || 0;
        return (results.scan_results?.length || 0) + surveyRecommendationsCount;
      case 'surveys':
        return surveyData.length || 0;

      default:
        return 0;
    }
  };

  const getFilteredData = () => {
    if (!results) return [];
    

    
    switch (selectedDataType) {
      case 'gaps':
        // Combine accessibility gaps with their associated recommendations
        const gapsData = results.scan_results || [];
        const recommendationsData = results.recommendations || [];
        
        // Convert survey-based recommendations to gap format so they show up as markers
        const surveyRecommendationsAsGaps = recommendationsData
          .filter(rec => rec.survey_based)
          .map(rec => ({
            id: rec.id,
            location: rec.survey_location?.city || rec.target_locations?.[0] || 'Survey Location',
            coordinates: rec.coordinates || rec.survey_location?.coordinates,
            issue_type: rec.survey_issue?.type || 'Community Reported Issue',
            severity: 'user_reported',
            description: rec.survey_issue?.description || rec.description,
            submitted_at: rec.submitted_at,
            agent: 'SurveyBot',
            survey_based: true,
            associatedRecommendations: [rec],
            hasRecommendations: true,
            // Add these fields to ensure proper marker display
            vulnerable_population: 'Community reported',
            confidence: 1.0,
            detected_date: rec.submitted_at?.split('T')[0] || new Date().toISOString().split('T')[0]
          }));
        
        console.log('Survey recommendations as gaps:', surveyRecommendationsAsGaps);
        
        // Combine regular gaps with survey-based gaps
        const allGapsData = [...gapsData, ...surveyRecommendationsAsGaps];
        console.log('All gaps data:', allGapsData);
        
        // Create a map of location to recommendations for quick lookup
        const locationToRecommendations = {};
        recommendationsData.forEach(rec => {
          if (rec.target_locations && Array.isArray(rec.target_locations)) {
            rec.target_locations.forEach(location => {
              const locationName = typeof location === 'string' ? location : (location.name || location);
              if (!locationToRecommendations[locationName]) {
                locationToRecommendations[locationName] = [];
              }
              locationToRecommendations[locationName].push(rec);
            });
          }
        });
        
        // Ensure every city has recommendations by creating default ones if needed
        const allCities = new Set();
        allGapsData.forEach(gap => {
          const locationName = gap.location || gap.name || 'Unknown Location';
          allCities.add(locationName);
        });
        
        // Create default recommendations for cities that don't have them
        allCities.forEach(cityName => {
          if (!locationToRecommendations[cityName] || locationToRecommendations[cityName].length === 0) {
            // Create a default recommendation for this city
            const defaultRecommendation = {
              id: `default_${cityName.replace(/\s+/g, '_').toLowerCase()}`,
              title: `General Accessibility Improvements for ${cityName}`,
              description: `Comprehensive accessibility improvements and infrastructure upgrades for ${cityName}`,
              type: 'infrastructure',
              priority_level: 'Medium',
              cost_estimate: '$50,000 - $150,000',
              timeline: '6-12 months',
              target_locations: [cityName],
              isDefault: true
            };
            locationToRecommendations[cityName] = [defaultRecommendation];
          }
        });
        
        // Enhance gaps data with recommendations and apply filters
        return allGapsData.map(gap => {
          const locationName = gap.location || gap.name || 'Unknown Location';
          const associatedRecommendations = locationToRecommendations[locationName] || [];
          

          
          return {
            ...gap,
            associatedRecommendations,
            hasRecommendations: associatedRecommendations.length > 0
          };
        }).filter(item => {
          if (filters.severity !== 'all' && item.severity !== filters.severity) return false;
          if (filters.region !== 'all') {
            const lat = item.coordinates?.lat;
            if (filters.region === 'northern' && lat < 37) return false;
            if (filters.region === 'southern' && lat > 37) return false;
            if (filters.region === 'central' && (lat < 35 || lat > 39)) return false;
          }
          return true;
        });
        
        console.log('Filtered gaps data:', allGapsData);
      case 'surveys':
        // Convert survey data to map-compatible format
        return surveyData.map(survey => {
          const locationName = survey.location.fullAddress || survey.location.city || 'Unknown Location';
          
          // Create associated recommendations from survey AI recommendations
          const associatedRecommendations = survey.ai_recommendation ? [{
            id: `survey_rec_${survey.id}`,
            title: survey.ai_recommendation.title || 'Community-Reported Solution',
            description: survey.ai_recommendation.description || 'AI-generated recommendation based on community feedback',
            type: survey.ai_recommendation.type || 'community',
            priority_level: survey.ai_recommendation.priority_level || 'High',
            cost_estimate: survey.ai_recommendation.cost_estimate || 'TBD',
            timeline: survey.ai_recommendation.timeline || '3-6 months',
            survey_based: true,
            agent: 'SurveyBot'
          }] : [];
          
          return {
            id: survey.id,
            location: locationName,
            coordinates: survey.location.coordinates,
            issue_type: survey.issue.type,
            severity: 'user_reported',
            description: survey.issue.description,
            submitted_at: survey.submitted_at,
            impact: survey.impact,
            demographics: survey.demographics,
            contact: survey.contact,
            associatedRecommendations,
            hasRecommendations: associatedRecommendations.length > 0
          };
        }).filter(item => {
          if (filters.severity !== 'all' && item.severity !== filters.severity) return false;
          if (filters.region !== 'all') {
            const lat = item.coordinates?.lat;
            if (filters.region === 'northern' && lat < 37) return false;
            if (filters.region === 'southern' && lat > 37) return false;
            if (filters.region === 'central' && (lat < 35 || lat > 39)) return false;
          }
          return true;
        });
        
        return surveyData.map(survey => {
          const locationName = survey.location.fullAddress || survey.location.city || 'Unknown Location';
          
          // Create associated recommendations from survey AI recommendations
          const associatedRecommendations = survey.ai_recommendation ? [{
            id: `survey_rec_${survey.id}`,
            title: survey.ai_recommendation.title || 'Community-Reported Solution',
            description: survey.ai_recommendation.description || 'AI-generated recommendation based on community feedback',
            type: survey.ai_recommendation.type || 'community',
            priority_level: survey.ai_recommendation.priority_level || 'High',
            cost_estimate: survey.ai_recommendation.cost_estimate || 'TBD',
            timeline: survey.ai_recommendation.timeline || '3-6 months',
            survey_based: true,
            agent: 'SurveyBot'
          }] : [];
          
          return {
            id: survey.id,
            location: locationName,
            coordinates: survey.location.coordinates,
            issue_type: survey.issue.type,
            severity: 'user_reported',
            description: survey.issue.description,
            submitted_at: survey.submitted_at,
            impact: survey.impact,
            demographics: survey.demographics,
            contact: survey.contact,
            associatedRecommendations,
            hasRecommendations: associatedRecommendations.length > 0
          };
        }).filter(item => {
          if (filters.severity !== 'all' && item.severity !== filters.severity) return false;
          if (filters.region !== 'all') {
            const lat = item.coordinates?.lat;
            if (filters.region === 'northern' && lat < 37) return false;
            if (filters.region === 'southern' && lat > 37) return false;
            if (filters.region === 'central' && (lat < 35 || lat > 39)) return false;
          }
          return true;
        });
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:shadow-md focus:shadow-lg"
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
                  <div className="absolute z-10 w-full mt-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl">
                    {searchResults.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleCitySelect(city)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-all duration-200"
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
                  { type: 'gaps', label: 'Accessibility Gaps & Recommendations', color: 'bg-red-500', icon: '🔍', count: getDataCount('gaps') },
                  { type: 'surveys', label: 'User Reports', color: 'bg-orange-500', icon: '📝', count: getDataCount('surveys') }
                ].map(({ type, label, color, icon, count }) => (
                  <button
                    key={type}
                    onClick={() => handleDataTypeChange(type)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedDataType === type
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
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

            {/* Description Section */}
            <div className="mb-8 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                <EyeIcon className="h-4 w-4 mr-2 text-blue-600" />
                About This View
              </h3>
              <div className="text-xs text-gray-700 space-y-2">
                {selectedDataType === 'gaps' ? (
                  <>
                    <p>🔍 <strong>Accessibility Gaps:</strong> Shows identified accessibility issues across California cities.</p>
                    <p>💡 <strong>Purple borders</strong> indicate gaps that have specific recommendations available.</p>
                    <p>📊 <strong>Click any marker</strong> to see detailed information and associated solutions.</p>
                  </>
                ) : selectedDataType === 'surveys' ? (
                  <>
                    <p>📝 <strong>User Reports:</strong> Community-submitted accessibility issues and concerns.</p>
                    <p>👥 <strong>Real feedback</strong> from residents experiencing accessibility challenges.</p>
                    <p>💡 <strong>Purple borders</strong> indicate reports that have community solutions available.</p>
                    <p>📊 <strong>Click any marker</strong> to view detailed report information and solutions.</p>
                  </>
                ) : null}
              </div>
            </div>

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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:shadow-md focus:shadow-lg"
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
                                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:shadow-md focus:shadow-lg"
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
                    {selectedDataType === 'gaps' 
                      ? `Accessibility Issues (${getFilteredData().length})`
                      : selectedDataType === 'surveys'
                      ? `User Reports (${getFilteredData().length})`
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
                        mapInstanceRef.current.flyTo([item.coordinates.lat, item.coordinates.lng], 9, {
                          duration: 1.5,
                          easeLinearity: 0.25
                        });
                      }
                    }}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      selectedItem === item ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 truncate mb-1">
                          {typeof item.location === 'string' ? item.location : 
                            typeof item.title === 'string' ? item.title : 
                            typeof item.issue_type === 'string' ? item.issue_type : 'Unknown Location'
                          }
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {typeof item.issue_type === 'string' ? item.issue_type : 
                             typeof item.type === 'string' ? item.type : 
                             typeof item.severity === 'string' ? item.severity : 'Unknown Type'
                          }
                        </p>
                        {/* Show recommendations count for gaps and surveys */}
                        {(selectedDataType === 'gaps' || selectedDataType === 'surveys') && item.hasRecommendations && (
                          <div className="flex items-center mb-2">
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                              💡 {item.associatedRecommendations.length} {selectedDataType === 'surveys' ? 'solution' : 'recommendation'}{item.associatedRecommendations.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                        {item.severity && typeof item.severity === 'string' && (
                          <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                            item.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            item.severity === 'moderate' ? 'bg-orange-100 text-orange-800' :
                            item.severity === 'good' ? 'bg-green-100 text-green-800' :
                            item.severity === 'user_reported' ? 'bg-orange-100 text-orange-800' :
                            item.severity === 'recommendation' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.severity === 'recommendation' ? 'Improvement' : item.severity}
                          </span>
                        )}
                      </div>

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
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-xl"
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
                  

                   
                   {/* Show recommendations for gaps and surveys */}
                   {(selectedDataType === 'gaps' || selectedDataType === 'surveys') && selectedItem.associatedRecommendations && selectedItem.associatedRecommendations.length > 0 && (
                     <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                       <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                         <span className="text-lg mr-2">💡</span>
                         {selectedDataType === 'surveys' ? 'Community Solutions' : 'Recommendations'} ({selectedItem.associatedRecommendations.length})
                       </h4>
                       <div className="space-y-3">
                         {selectedItem.associatedRecommendations.map((rec, index) => (
                           <div key={index} className="bg-white p-3 rounded-lg border border-purple-200 shadow-sm">
                             <h5 className="font-semibold text-purple-800 text-sm mb-1">{rec.title}</h5>
                             <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                             <div className="flex flex-wrap gap-2">
                               <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                 {rec.type || 'General'}
                               </span>
                               <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                 {rec.priority_level || 'Medium'} Priority
                               </span>
                               {rec.cost_estimate && (
                                 <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                   {rec.cost_estimate}
                                 </span>
                               )}
                               {rec.timeline && (
                                 <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                   {rec.timeline}
                                 </span>
                               )}
                             </div>
                             <button 
                               onClick={() => window.open(`/ai-advisor?tab=recommendations&rec=${rec.id}`, '_blank')}
                               className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors"
                             >
                               🤖 View AI Recommendation
                             </button>
                           </div>
                         ))}
                       </div>
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
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 p-4 z-[1000] max-w-xs">
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
                 <span>Issues with Solutions</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
