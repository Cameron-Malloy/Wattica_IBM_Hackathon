import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { reverseGeocode } from '../utils/geocodingService';
import { ALL_CALIFORNIA_CITIES } from '../utils/californiaCitiesData';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map click events
const MapClickHandler = ({ onLocationSelect, selectedLocation }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      
      try {
        // Get city name from reverse geocoding
        const locationName = await reverseGeocode(lat, lng);
        
        // Extract city name from the full address
        const cityMatch = locationName.match(/([^,]+),\s*CA/);
        const cityName = cityMatch ? cityMatch[1].trim() : 'Unknown City';
        
        onLocationSelect({
          coordinates: { lat: lat, lng: lng },
          cityName: cityName,
          fullAddress: locationName
        });
      } catch (error) {
        console.error('Error getting location name:', error);
        onLocationSelect({
          coordinates: { lat: lat, lng: lng },
          cityName: 'Unknown City',
          fullAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        });
      }
    }
  });

  return selectedLocation ? (
    <Marker position={[selectedLocation.coordinates.lat, selectedLocation.coordinates.lng]}>
      <Popup>
        <div className="text-center">
          <h3 className="font-semibold text-gray-900">{selectedLocation.cityName}</h3>
          <p className="text-sm text-gray-600 mb-2">{selectedLocation.fullAddress}</p>
          <p className="text-xs text-gray-500">
            Coordinates: {selectedLocation.coordinates.lat.toFixed(6)}, {selectedLocation.coordinates.lng.toFixed(6)}
          </p>
        </div>
      </Popup>
    </Marker>
  ) : null;
};

const InteractiveMapSelector = ({ onLocationSelect, selectedLocation, className = "" }) => {
  const mapRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // California center coordinates
  const center = [36.7783, -119.4179];

  useEffect(() => {
    setIsMapReady(true);
  }, []);

  const handleCitySelect = (cityName, coordinates) => {
    onLocationSelect({
      coordinates: coordinates,
      cityName: cityName,
      fullAddress: `${cityName}, CA, USA`
    });
  };

  if (!isMapReady) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Container */}
      <div className="relative">
        <MapContainer
          center={center}
          zoom={6}
          style={{ height: '400px', width: '100%', zIndex: 1 }}
          className="rounded-lg shadow-lg"
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler 
            onLocationSelect={onLocationSelect} 
            selectedLocation={selectedLocation}
          />
        </MapContainer>
        
        {/* Map Instructions */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs z-10">
          <p className="text-sm text-gray-700 font-medium">
            📍 Click anywhere on the map to select a location
          </p>
        </div>
      </div>

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Selected Location</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Coordinates:</span>
              <span className="ml-2 text-gray-900">
                {selectedLocation.coordinates.lat.toFixed(6)}, {selectedLocation.coordinates.lng.toFixed(6)}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Full Address:</span>
              <span className="ml-2 text-gray-900">{selectedLocation.fullAddress}</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick City Selection */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-900 mb-3">Or select from major cities:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(ALL_CALIFORNIA_CITIES)
            .filter(([name]) => [
              'Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 
              'Sacramento', 'Fresno', 'Oakland', 'Long Beach'
            ].includes(name))
            .map(([cityName, coordinates]) => (
              <button
                key={cityName}
                onClick={() => handleCitySelect(cityName, coordinates)}
                className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                  selectedLocation?.cityName === cityName
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cityName}
              </button>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default InteractiveMapSelector;
