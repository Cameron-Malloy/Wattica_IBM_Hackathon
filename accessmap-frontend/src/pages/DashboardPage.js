import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon,
  MapPinIcon,
  ChartBarIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';
import { mockRecommendations, sdgCallouts } from '../data/mockData';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('impact');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setRecommendations(mockRecommendations);
      setLoading(false);
    }, 1000);
  }, []);

  const getImpactColor = (score) => {
    if (score >= 8.5) return 'text-green-600 bg-green-100';
    if (score >= 7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getImpactLabel = (score) => {
    if (score >= 8.5) return 'High Impact';
    if (score >= 7) return 'Medium Impact';
    return 'Low Impact';
  };

  const getPriorityColor = (score) => {
    if (score >= 8.5) return 'border-green-400 bg-green-50';
    if (score >= 7) return 'border-yellow-400 bg-yellow-50';
    return 'border-red-400 bg-red-50';
  };

  const filteredRecommendations = recommendations
    .filter(rec => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'high') return rec.impact_score >= 8.5;
      if (selectedFilter === 'medium') return rec.impact_score >= 7 && rec.impact_score < 8.5;
      if (selectedFilter === 'low') return rec.impact_score < 7;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'impact') return b.impact_score - a.impact_score;
      if (sortBy === 'cost') return parseInt(a.estimated_cost.replace(/[$,]/g, '')) - parseInt(b.estimated_cost.replace(/[$,]/g, ''));
      return 0;
    });

  const totalCost = recommendations.reduce((sum, rec) => 
    sum + parseInt(rec.estimated_cost.replace(/[$,]/g, '')), 0
  );

  const avgImpact = recommendations.length > 0 
    ? (recommendations.reduce((sum, rec) => sum + rec.impact_score, 0) / recommendations.length).toFixed(1)
    : 0;

  const handleImplement = (id) => {
    toast.success('Recommendation marked for implementation!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <ChartBarIcon className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">PlannerBot Dashboard</h1>
          </div>
          <p className="text-lg text-gray-600">
            AI-generated improvement recommendations with cost-benefit analysis and implementation timelines.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <LightBulbIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Recommendations</p>
                <p className="text-2xl font-bold text-gray-900">{recommendations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Investment</p>
                <p className="text-2xl font-bold text-gray-900">${totalCost.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Impact Score</p>
                <p className="text-2xl font-bold text-gray-900">{avgImpact}/10</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOffice2Icon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recommendations.filter(r => r.impact_score >= 8.5).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by Impact:</label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Recommendations</option>
                <option value="high">High Impact (8.5+)</option>
                <option value="medium">Medium Impact (7-8.4)</option>
                <option value="low">Low Impact (&lt;7)</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="impact">Impact Score</option>
                <option value="cost">Cost (Low to High)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {filteredRecommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className={`bg-white rounded-lg shadow-lg border-l-4 ${getPriorityColor(recommendation.impact_score)} p-6 hover:shadow-xl transition-shadow duration-200`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      {recommendation.location.address}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {recommendation.proposal}
                  </h3>
                </div>
                <div className="flex items-center space-x-1 ml-4">
                  <StarIcon className={`h-5 w-5 ${recommendation.impact_score >= 8.5 ? 'text-green-600' : recommendation.impact_score >= 7 ? 'text-yellow-600' : 'text-red-600'}`} />
                  <span className={`text-lg font-bold ${recommendation.impact_score >= 8.5 ? 'text-green-600' : recommendation.impact_score >= 7 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {recommendation.impact_score}
                  </span>
                </div>
              </div>

              {/* Cost and Timeline */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-lg font-bold text-gray-900">
                    {recommendation.estimated_cost}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {recommendation.timeline}
                  </span>
                </div>
              </div>

              {/* Impact Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getImpactColor(recommendation.impact_score)}`}>
                  {getImpactLabel(recommendation.impact_score)}
                </span>
              </div>

              {/* AI Justification */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                  PlannerBot Justification:
                </h4>
                <p className="text-sm text-gray-600">{recommendation.justification}</p>
              </div>

              {/* Benefits */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Expected Benefits:</h4>
                <div className="space-y-1">
                  {recommendation.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SDG Alignment */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">11</span>
                  </div>
                  <span className="text-sm font-medium text-green-700">
                    {recommendation.sdg_alignment}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleImplement(recommendation.id)}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <CheckCircleIcon className="h-4 w-4" />
                <span>Mark for Implementation</span>
              </button>
            </div>
          ))}
        </div>

        {/* SDG Callout */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">11</span>
            </div>
            <h4 className="font-semibold text-gray-900">UN SDG 11 - Sustainable Cities and Communities</h4>
          </div>
          <p className="text-gray-700 mb-3">
            These AI-generated recommendations directly support multiple UN Sustainable Development Goal 11 targets:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-1">11.2 - Sustainable Transport</h5>
              <p className="text-sm text-gray-600">Accessible transport systems for all</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-1">11.3 - Inclusive Planning</h5>
              <p className="text-sm text-gray-600">Participatory urban planning</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-1">11.7 - Safe Public Spaces</h5>
              <p className="text-sm text-gray-600">Universal access to public spaces</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
