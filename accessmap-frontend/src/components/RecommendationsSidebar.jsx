import React from 'react';
import { CheckCircleIcon, MapPinIcon, CurrencyDollarIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';

const RecommendationsSidebar = ({ data }) => {
  const getImpactColor = (score) => {
    if (score >= 8.5) return 'text-green-600';
    if (score >= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactLabel = (score) => {
    if (score >= 8.5) return 'High Impact';
    if (score >= 7) return 'Medium Impact';
    return 'Low Impact';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <CheckCircleIcon className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">PlannerBot Recommendations</h3>
      </div>
      
      <p className="text-sm text-gray-600">
        AI-generated improvement plans with cost estimates and impact analysis
      </p>

      {/* Summary Stats */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-600">
              {data.length}
            </div>
            <div className="text-xs text-gray-600">Recommendations</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">
              ${data.reduce((sum, item) => sum + parseInt(item.estimated_cost.replace(/[$,]/g, '')), 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Total Cost</div>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        {data
          .sort((a, b) => b.impact_score - a.impact_score)
          .map((recommendation) => (
            <div key={recommendation.id} className="card border-l-4 border-l-green-400 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{recommendation.location.address}</h4>
                    <div className="flex items-center space-x-1">
                      <StarIcon className={`h-4 w-4 ${getImpactColor(recommendation.impact_score)}`} />
                      <span className={`text-sm font-medium ${getImpactColor(recommendation.impact_score)}`}>
                        {recommendation.impact_score}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 font-medium mb-2">{recommendation.proposal}</p>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">{recommendation.location.address}</span>
                  </div>

                  {/* Cost and Timeline */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{recommendation.estimated_cost}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{recommendation.timeline}</span>
                    </div>
                  </div>

                  {/* Impact Badge */}
                  <div className="mb-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      recommendation.impact_score >= 8.5 ? 'bg-green-100 text-green-800 border border-green-300' :
                      recommendation.impact_score >= 7 ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                      'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                      {getImpactLabel(recommendation.impact_score)}
                    </span>
                  </div>

                  {/* Justification */}
                  <div className="mb-3 p-2 bg-gray-50 rounded">
                    <h5 className="text-xs font-medium text-gray-700 mb-1">AI Justification:</h5>
                    <p className="text-xs text-gray-600">{recommendation.justification}</p>
                  </div>

                  {/* Benefits */}
                  <div className="mb-3">
                    <h5 className="text-xs font-medium text-gray-700 mb-1">Expected Benefits:</h5>
                    <div className="space-y-1">
                      {recommendation.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-gray-600">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SDG Alignment */}
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">11</span>
                    </div>
                    <span className="text-xs text-green-700 font-medium">{recommendation.sdg_alignment}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* SDG Callout */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">11</span>
          </div>
          <h4 className="font-medium text-green-900">SDG 11.2 - Sustainable Transport</h4>
        </div>
        <p className="text-sm text-green-800">
          Provide access to safe, affordable, accessible and sustainable transport systems for all
        </p>
      </div>

      {/* Agent Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <h4 className="font-medium text-green-900 mb-2">About PlannerBot</h4>
        <p className="text-sm text-green-800">
          Generates specific, actionable improvement recommendations with cost-benefit analysis, 
          timeline estimates, and impact scoring based on accessibility best practices.
        </p>
      </div>
    </div>
  );
};

export default RecommendationsSidebar;
