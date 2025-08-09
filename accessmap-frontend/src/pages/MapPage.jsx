import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { 
  ExclamationTriangleIcon, 
  ExclamationCircleIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
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
  const [activeTab, setActiveTab] = useState('scan');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(384); // Default 24rem (384px)
  const [isResizing, setIsResizing] = useState(false);
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

  // Handle sidebar resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      // Constrain width between 280px and 600px
      const constrainedWidth = Math.min(Math.max(newWidth, 200), 750);
      setSidebarWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleResizeStart = () => {
    setIsResizing(true);
  };

  // San Francisco center coordinates
  const center = [37.7749, -122.4194];

  const tabs = [
    { id: 'scan', name: 'Scan Results', icon: ExclamationTriangleIcon, color: 'text-red-600'},
    { id: 'priority', name: 'Priority List', icon: ExclamationCircleIcon, color: 'text-yellow-600' },
    { id: 'recommendations', name: 'Recommendations', icon: CheckCircleIcon, color: 'text-green-600' },
    { id: 'how-it-works', name: 'How It Works', icon: QuestionMarkCircleIcon, color: 'text-blue-600' }
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

  // Legend component
  const Legend = () => (
    <div className="absolute bottom-4 right-4 z-[1000] bg-white p-3 rounded-lg shadow-lg opacity-0 hover:opacity-100 transition-opacity duration-300">
      <h4 className="font-semibold text-sm mb-2 text-gray-700">Accessibility Legend</h4>
      <div className="space-y-2">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <span className="text-xs text-gray-600">Critical (8-10)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <span className="text-xs text-gray-600">Moderate (5-7)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-xs text-gray-600">Good (0-4)</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Sidebar */}
      <div 
        className={`bg-white shadow-lg relative ${
          sidebarOpen ? 'block' : 'w-0'
        } overflow-hidden ${
          !isResizing ? 'transition-all duration-300' : ''
        }`}
        style={{
          width: sidebarOpen ? `${sidebarWidth}px` : '0px',
          minWidth: sidebarOpen ? '280px' : '0px',
          maxWidth: sidebarOpen ? '600px' : '0px'
        }}
      >
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
            
            {/* Tab Navigation - Grid Layout for All Screens */}
            <div className="mt-4">
              <nav className="grid grid-cols-2 gap-2" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <div key={tab.id} className="relative group">
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`${
                          activeTab === tab.id
                            ? 'bg-primary-100 text-primary-700 border-primary-500'
                            : 'text-gray-500 hover:text-gray-700 border-gray-200 hover:bg-gray-100'
                        } w-full py-3 px-2 border-2 font-medium text-xs rounded-lg flex flex-col items-center space-y-1 transition-colors duration-200`}
                      >
                        <Icon className={`h-5 w-5 ${tab.color}`} />
                        <span className="text-center leading-tight">{tab.name}</span>
                      </button>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        {tab.name}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
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
        
        {/* Resize Handle */}
        {sidebarOpen && (
          <div
            className="absolute top-0 right-0 w-1 h-full bg-gray-300 hover:bg-primary-500 cursor-ew-resize transition-colors duration-200 group"
            onMouseDown={handleResizeStart}
          >
            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-3 h-8 bg-gray-400 group-hover:bg-primary-600 rounded-l-md flex items-center justify-center transition-colors duration-200">
              <div className="w-0.5 h-4 bg-white rounded-full opacity-70"></div>
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {/* Toggle Sidebar Button */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-6 left-12 z-[1000] bg-white p-2 rounded-md shadow-lg hover:bg-gray-50"
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
          {/* Base Map Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Accessibility Issues Overlay */}
          {activeTab === 'scan' && (
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
          )}

          {/* Priority Areas Overlay */}
          {activeTab === 'priority' && (
            <>
              {mapData.priorityList.map((area) => {
                // Use same color scheme as accessibility markers based on priority score
                const getSeverityFromScore = (score) => {
                  if (score >= 8) return 'critical';
                  if (score >= 5) return 'moderate';
                  return 'good';
                };
                const severity = getSeverityFromScore(area.priority_score);
                
                return (
                  <Marker
                    key={`priority-${area.id}`}
                    position={[area.location.lat, area.location.lng]}
                    icon={createCustomIcon(severity)}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-gray-900">Priority Area</h3>
                        <p className="text-sm text-gray-600 mt-1">{area.top_issue}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            severity === 'critical' ? 'bg-red-100 text-red-800' :
                            severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            Score: {area.priority_score}/10
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">{area.vulnerable_population}</p>
                        <p className="text-xs text-gray-500 mt-1">{area.location.address}</p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </>
          )}
        </MapContainer>
        <Legend />
      </div>
    </div>
  );
};

export default MapPage;
