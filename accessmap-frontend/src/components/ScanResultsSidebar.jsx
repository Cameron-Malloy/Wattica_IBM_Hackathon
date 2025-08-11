import React from 'react';
import { ExclamationTriangleIcon, MapPinIcon } from '@heroicons/react/24/outline';

// onSelectScanResult: function(issue) => highlights the issue on the map in parent component
const ScanResultsSidebar = ({ data, onSelectScanResult }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'good':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityIcon = (severity) => {
    return severity === 'critical' ? '🔴' : 
           severity === 'high' ? '🟠' :
           severity === 'moderate' ? '🟡' : '🟢';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
        <h3 className="text-lg font-semibold text-gray-900">AccessScanner Results</h3>
      </div>
      
      <p className="text-sm text-gray-600">
        AI-detected accessibility barriers in urban infrastructure
      </p>

      {/* Summary Stats */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-red-600">
              {data.filter(item => item.severity === 'critical').length}
            </div>
            <div className="text-xs text-gray-600">Critical</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-600">
              {data.filter(item => item.severity === 'moderate').length}
            </div>
            <div className="text-xs text-gray-600">Moderate</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {data.filter(item => item.severity === 'low' || item.severity === 'good').length}
            </div>
            <div className="text-xs text-gray-600">Low</div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {data.map((issue) => (
            <button
              key={issue.id}
              className="w-full text-left duration-200 hover:shadow-lg bg-yellow-50 space-y-3"
              onClick={() => onSelectScanResult && onSelectScanResult(issue)}
            >
            <div className="card border-l-4 border-l-red-400 p-3 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getSeverityIcon(issue.severity)}</span>
                    <h4 className="font-medium text-gray-900">{issue.issue_type}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">{issue.location}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(issue.severity)}`}> 
                      {issue.severity}
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.round(issue.confidence * 100)}% confidence
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Detected: {issue.detected_date ? new Date(issue.detected_date).toLocaleDateString() : 'Recent Scan'}
                  </div>
                </div>
              </div>
            </div>
            </button>
        ))}
      </div>

      {/* Agent Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
        <h4 className="font-medium text-blue-900 mb-2">About AccessScanner</h4>
        <p className="text-sm text-blue-800">
          Uses demographic vulnerability data (elderly population %, disability rates, income levels) 
          from U.S. Census Bureau to identify accessibility barriers in areas serving vulnerable populations.
        </p>
      </div>
    </div>
  );
};

export default ScanResultsSidebar;
