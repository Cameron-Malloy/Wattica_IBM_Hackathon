import React from 'react';
import { ExclamationCircleIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

const PriorityListSidebar = ({ data, onSelectPriorityArea }) => {
  const getPriorityColor = (score) => {
    if (score >= 9) return 'bg-red-100 text-red-800 border-red-300';
    if (score >= 7) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getPriorityLabel = (score) => {
    if (score >= 9) return 'Critical Priority';
    if (score >= 7) return 'High Priority';
    return 'Medium Priority';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <ExclamationCircleIcon className="h-5 w-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-gray-900">EquityAdvisor Priority List</h3>
      </div>
      
      <p className="text-sm text-gray-600">
        Areas prioritized based on vulnerability analysis and equity factors
      </p>

      {/* Summary Stats */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {data.length}
          </div>
          <div className="text-sm text-gray-600">Priority Areas Identified</div>
          <div className="text-xs text-gray-500 mt-1">
            Avg Score: {data.length > 0 ? (data.reduce((sum, item) => sum + item.priority_score, 0) / data.length).toFixed(1) : 0}/10
          </div>
        </div>
      </div>

      {/* Priority Areas List */}
        {data
          .sort((a, b) => b.priority_score - a.priority_score)
          .map((area) => (
            <button
              key={area.id}
              className="w-full text-left duration-200 hover:shadow-lg bg-yellow-50 space-y-3"
              onClick={() => onSelectPriorityArea && onSelectPriorityArea(area)}
            >
            <div className="card border-l-4 border-l-yellow-400 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{area.location.address}</h4>
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-600">{area.priority_score}</div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mt-1 font-medium">{area.top_issue}</p>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">{area.location.address}</span>
                  </div>
                  
                  {/* Priority Badge */}
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(area.priority_score)}`}>
                      {getPriorityLabel(area.priority_score)}
                    </span>
                  </div>

                  {/* Vulnerable Population Info */}
                  <div className="mt-3 p-2 bg-gray-50 rounded">
                    <h5 className="text-xs font-medium text-gray-700 mb-1">Vulnerable Population:</h5>
                    <p className="text-xs text-gray-600">{area.vulnerable_population}</p>
                  </div>

                  {/* Equity Factors */}
                  <div className="mt-2">
                    <h5 className="text-xs font-medium text-gray-700 mb-1">Equity Factors:</h5>
                    <div className="flex flex-wrap gap-1">
                      {area.equity_factors.map((factor, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800"
                        >
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex items-center space-x-2 mt-2">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-600">{area.recommended_timeline}</span>
                  </div>
                </div>
              </div>
            </div>
            </button>
          ))}

      {/* SDG Callout */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">11</span>
          </div>
          <h4 className="font-medium text-green-900">SDG 11.3 - Inclusive Planning</h4>
        </div>
        <p className="text-sm text-green-800">
          Enhance inclusive and sustainable urbanization and capacity for participatory planning
        </p>
      </div>

      {/* Agent Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <h4 className="font-medium text-yellow-900 mb-2">About EquityAdvisor</h4>
        <p className="text-sm text-yellow-800">
          Analyzes demographic data, income levels, disability rates, and transportation access 
          to prioritize accessibility improvements in areas serving vulnerable populations.
        </p>
      </div>
    </div>
  );
};

export default PriorityListSidebar;
