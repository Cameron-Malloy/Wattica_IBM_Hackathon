import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { 
  ExclamationTriangleIcon, 
  ExclamationCircleIcon,
  CheckCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Import mock data
import { mockScanResults, mockPriorityList, mockRecommendations } from '../data/mockData';

// Import sidebar components
import ScanResultsSidebar from '../components/ScanResultsSidebar.jsx';
import PriorityListSidebar from '../components/PriorityListSidebar.jsx';
import RecommendationsSidebar from '../components/RecommendationsSidebar.jsx';
import HowItWorksSidebar from '../components/HowItWorksSidebar.jsx';

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different severity levels
const createCustomIcon = (severity) => {
  const colors = {
    critical: '#ef4444',
    moderate: '#f59e0b',
    good: '#10b981'
  };
  
  return L.divIcon({
    html: `<div style="background-color: ${colors[severity]}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-div-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const MapPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('scan');
  const [mapData, setMapData] = useState({
    scanResults: [],
    priorityList: [],
    recommendations: []
  });

  // Load mock data on component mount
  useEffect(() => {
    setMapData({
      scanResults: mockScanResults,
      priorityList: mockPriorityList,
      recommendations: mockRecommendations
    });
  }, []);

  // San Francisco center coordinates
  const center = [37.7749, -122.4194];

  const tabs = [
    { id: 'scan', name: 'Scan Results', icon: ExclamationTriangleIcon, color: 'text-red-600' },
    { id: 'priority', name: 'Priority List', icon: ExclamationCircleIcon, color: 'text-yellow-600' },
    { id: 'recommendations', name: 'Recommendations', icon: CheckCircleIcon, color: 'text-green-600' },
    { id: 'how-it-works', name: 'How It Works', icon: Bars3Icon, color: 'text-blue-600' }
  ];

  const renderSidebarContent = () => {
    switch (activeTab) {
      case 'scan':
        return <ScanResultsSidebar data={mapData.scanResults} />;
      case 'priority':
        return <PriorityListSidebar data={mapData.priorityList} />;
      case 'recommendations':
        return <RecommendationsSidebar data={mapData.recommendations} />;
      case 'how-it-works':
        return <HowItWorksSidebar />;
      default:
        return <ScanResultsSidebar data={mapData.scanResults} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${
        sidebarOpen ? 'w-96' : 'w-0'
      } overflow-hidden`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">AccessMap.AI</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-md hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {/* Tab Navigation */}
            <div className="mt-4">
              <nav className="flex space-x-1" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? 'bg-primary-100 text-primary-700 border-primary-500'
                          : 'text-gray-500 hover:text-gray-700 border-transparent hover:bg-gray-100'
                      } whitespace-nowrap py-2 px-3 border-b-2 font-medium text-sm rounded-t-lg flex items-center space-x-1`}
                    >
                      <Icon className={`h-4 w-4 ${tab.color}`} />
                      <span className="hidden lg:block">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {renderSidebarContent()}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {/* Toggle Sidebar Button */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-[1000] bg-white p-2 rounded-md shadow-lg hover:bg-gray-50"
          >
            <Bars3Icon className="h-5 w-5 text-gray-600" />
          </button>
        )}

        {/* Map */}
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <LayersControl position="topright">
            {/* Base Map Layer */}
            <LayersControl.BaseLayer checked name="OpenStreetMap">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>

            {/* Accessibility Issues Overlay */}
            <LayersControl.Overlay checked name="Accessibility Issues">
              <>
                {mapData.scanResults.map((issue) => (
                  <Marker
                    key={issue.id}
                    position={[issue.location.lat, issue.location.lng]}
                    icon={createCustomIcon(issue.severity)}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-gray-900">{issue.issue_type}</h3>
                        <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            issue.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {issue.severity}
                          </span>
                          <span className="text-xs text-gray-500">
                            Confidence: {Math.round(issue.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {issue.location.address}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </>
            </LayersControl.Overlay>

            {/* Priority Areas Overlay */}
            <LayersControl.Overlay name="Priority Areas">
              <>
                {mapData.priorityList.map((area) => (
                  <Marker
                    key={`priority-${area.id}`}
                    position={[area.location.lat, area.location.lng]}
                    icon={L.divIcon({
                      html: `<div style="background-color: #f59e0b; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">${area.priority_score}</div>`,
                      className: 'custom-priority-icon',
                      iconSize: [30, 30],
                      iconAnchor: [15, 15]
                    })}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-gray-900">Priority Area</h3>
                        <p className="text-sm text-gray-600 mt-1">{area.top_issue}</p>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Score: {area.priority_score}/10
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">{area.vulnerable_population}</p>
                        <p className="text-xs text-gray-500 mt-1">{area.location.address}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </>
            </LayersControl.Overlay>
          </LayersControl>
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPage;
