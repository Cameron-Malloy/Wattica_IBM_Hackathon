import React from 'react';
import { CheckCircleIcon, MapPinIcon, CurrencyDollarIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';

const RecommendationsSidebar = ({ data }) => {
  const normalizeImpactScore = (rec) => {
    if (typeof rec.impact_score === 'number') return rec.impact_score;
    // Map string impact to a numeric-like score for color/labeling
    const impact = (rec.impact || '').toString().toLowerCase();
    if (impact.includes('critical') || impact.includes('very high')) return 9.0;
    if (impact.includes('high')) return 8.0;
    if (impact.includes('medium-high') || impact.includes('medium')) return 7.0;
    if (impact.includes('low')) return 5.0;
    return 6.5; // default medium
    };

  const getImpactColor = (rec) => {
    const score = normalizeImpactScore(rec);
    if (score >= 8.5) return 'text-green-600';
    if (score >= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactLabel = (rec) => {
    if (rec.impact) {
      const label = rec.impact.toString();
      // Title-case
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
    const score = normalizeImpactScore(rec);
    if (score >= 8.5) return 'High Impact';
    if (score >= 7) return 'Medium Impact';
    return 'Low Impact';
  };

  const parseCost = (str) => {
    if (!str || typeof str !== 'string') return 0;
    const m = str.replace(/,/g, '').match(/([\d.]+)\s*([MK])?/i);
    if (!m) return 0;
    const val = parseFloat(m[1] || '0');
    const unit = (m[2] || '').toUpperCase();
    if (unit === 'M') return Math.round(val * 1_000_000);
    if (unit === 'K') return Math.round(val * 1_000);
    return Math.round(val);
  };

  const totalCost = data.reduce((sum, item) => sum + parseCost(item.cost_estimate || item.estimated_cost), 0);

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
              {totalCost > 0 ? `$${totalCost.toLocaleString()}` : '—'}
            </div>
            <div className="text-xs text-gray-600">Total Cost</div>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        {data
          .slice()
          .sort((a, b) => normalizeImpactScore(b) - normalizeImpactScore(a))
          .map((recommendation) => (
            <div key={recommendation.id} className="card border-l-4 border-l-green-400 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{recommendation.title || recommendation.proposal}</h4>
                    <div className="flex items-center space-x-1">
                      <StarIcon className={`h-4 w-4 ${getImpactColor(recommendation)}`} />
                      <span className={`text-sm font-medium ${getImpactColor(recommendation)}`}>
                        {normalizeImpactScore(recommendation).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 font-medium mb-2">{recommendation.description || recommendation.justification}</p>
                  
                  {/* Locations Affected */}
                  {typeof recommendation.locations_affected !== 'undefined' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">Locations affected: {recommendation.locations_affected}</span>
                    </div>
                  )}

                  {/* Cost and Timeline */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{recommendation.cost_estimate || recommendation.estimated_cost || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{recommendation.timeline}</span>
                    </div>
                  </div>

                  {/* Impact Badge */}
                  <div className="mb-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      normalizeImpactScore(recommendation) >= 8.5 ? 'bg-green-100 text-green-800 border border-green-300' :
                      normalizeImpactScore(recommendation) >= 7 ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                      'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                      {getImpactLabel(recommendation)}
                    </span>
                  </div>

                  {/* Steps / Outcomes */}
                  {Array.isArray(recommendation.implementation_steps) && recommendation.implementation_steps.length > 0 ? (
                    <div className="mb-3">
                      <h5 className="text-xs font-medium text-gray-700 mb-1">Implementation Steps:</h5>
                      <div className="space-y-1">
                        {recommendation.implementation_steps.map((step, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircleIcon className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-gray-600">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : recommendation.expected_outcomes ? (
                    <div className="mb-3 p-2 bg-gray-50 rounded">
                      <h5 className="text-xs font-medium text-gray-700 mb-1">Expected Outcomes:</h5>
                      <p className="text-xs text-gray-600">{recommendation.expected_outcomes}</p>
                    </div>
                  ) : null}

                  {/* SDG Alignment */}
                  {recommendation.sdg_alignment && (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">11</span>
                      </div>
                      <span className="text-xs text-green-700 font-medium">{Array.isArray(recommendation.sdg_alignment) ? recommendation.sdg_alignment.join(', ') : recommendation.sdg_alignment}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
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
