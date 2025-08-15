import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LightBulbIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  UsersIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ArrowTopRightOnSquareIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  StarIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PlusIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const EnhancedRecommendations = ({ results, onRecommendationClick, onStartConversation, onCreateDetailedPlan }) => {
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [viewMode, setViewMode] = useState('cards'); // cards, timeline, matrix

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'infrastructure':
        return <BuildingOfficeIcon className="h-5 w-5" />;
      case 'safety':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'transportation':
        return <UsersIcon className="h-5 w-5" />;
      case 'parking':
        return <BuildingOfficeIcon className="h-5 w-5" />;
      case 'policy':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'community':
        return <UserGroupIcon className="h-5 w-5" />;
      case 'tech':
        return <ComputerDesktopIcon className="h-5 w-5" />;
      default:
        return <LightBulbIcon className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'infrastructure':
        return 'from-blue-500 to-blue-600 border-blue-300';
      case 'safety':
        return 'from-red-500 to-red-600 border-red-300';
      case 'transportation':
        return 'from-green-500 to-green-600 border-green-300';
      case 'parking':
        return 'from-purple-500 to-purple-600 border-purple-300';
      case 'policy':
        return 'from-indigo-500 to-indigo-600 border-indigo-300';
      case 'community':
        return 'from-orange-500 to-orange-600 border-orange-300';
      case 'tech':
        return 'from-cyan-500 to-cyan-600 border-cyan-300';
      default:
        return 'from-gray-500 to-gray-600 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'immediate':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
      case 'short-term':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
      case 'long-term':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityScore = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'immediate':
        return 3;
      case 'medium':
      case 'short-term':
        return 2;
      case 'low':
      case 'long-term':
        return 1;
      default:
        return 0;
    }
  };

  const getImpactScore = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'high':
        return 3;
      case 'medium':
        return 2;
      case 'low':
        return 1;
      default:
        return 0;
    }
  };

  const getCostValue = (costEstimate) => {
    if (!costEstimate) return 0;
    const match = costEstimate.match(/\$?(\d+(?:,\d+)?)/);
    return match ? parseInt(match[1].replace(/,/g, '')) : 0;
  };

  const getTimelineMonths = (timeline) => {
    if (!timeline) return 12;
    const match = timeline.match(/(\d+)/);
    return match ? parseInt(match[1]) : 12;
  };

  const filteredAndSortedRecommendations = useMemo(() => {
    if (!results?.recommendations) return [];

    let filtered = results.recommendations.filter(rec => {
      const matchesPriority = filterPriority === 'all' || 
        (rec.priority_level?.toLowerCase() === filterPriority || rec.priority?.toLowerCase() === filterPriority);
      const matchesType = filterType === 'all' || rec.type === filterType;
      
      return matchesPriority && matchesType;
    });

    // Sort the results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return getPriorityScore(b.priority_level || b.priority) - getPriorityScore(a.priority_level || a.priority);
        case 'cost':
          return getCostValue(a.cost_estimate) - getCostValue(b.cost_estimate);
        case 'timeline':
          return getTimelineMonths(a.timeline) - getTimelineMonths(b.timeline);
        case 'impact':
          return getImpactScore(b.impact) - getImpactScore(a.impact);
        case 'type':
          return (a.type || '').localeCompare(b.type || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [results, filterPriority, filterType, sortBy]);

  const uniqueTypes = useMemo(() => {
    if (!results?.recommendations) return [];
    return [...new Set(results.recommendations.map(rec => rec.type))];
  }, [results]);

  const toggleExpanded = (id) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleRecommendationClick = (rec) => {
    setSelectedRecommendation(rec);
    setShowDetailModal(true);
    if (onRecommendationClick) {
      onRecommendationClick(rec);
    }
  };

  const handleStartConversation = (rec) => {
    const message = `I'd like to discuss the ${rec.title} recommendation. Can you help me create a more detailed implementation plan with specific steps, stakeholders, and milestones?`;
    
    if (onStartConversation) {
      onStartConversation(message, rec);
    }
    
    setShowDetailModal(false);
  };

  const renderRecommendationCard = (rec, index) => {
    const isExpanded = expandedCards.has(rec.id);
    
    return (
      <motion.div
        key={rec.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="group"
      >
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
          {/* Header */}
          <div className={`bg-gradient-to-r ${getTypeColor(rec.type)} p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-white">
                {getTypeIcon(rec.type)}
                <div>
                  <h3 className="font-semibold text-lg">
                    {rec.type?.toUpperCase()}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {rec.locations_affected || rec.target_locations?.length || 1} locations affected
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(rec.priority_level || rec.priority)} bg-white/20 text-white border-white/30`}>
                  {rec.priority_level || rec.priority}
                </span>
                {rec.impact && (
                  <div className="flex items-center">
                    {[...Array(getImpactScore(rec.impact))].map((_, i) => (
                      <StarIconSolid key={i} className="h-4 w-4 text-yellow-300" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {rec.title}
            </h4>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {rec.description}
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-700">{rec.cost_estimate || 'Cost TBD'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-700">{rec.timeline || 'Timeline TBD'}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Implementation Progress</span>
                <span className="text-xs text-gray-600">0%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>

            {/* Expandable Details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 pt-4 mt-4 space-y-3"
                >
                  {rec.recommended_actions && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Key Actions</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {rec.recommended_actions.slice(0, 3).map((action, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {rec.implementation_partners && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Key Partners</h5>
                      <div className="flex flex-wrap gap-1">
                        {rec.implementation_partners.slice(0, 4).map((partner, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {partner}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {rec.success_metrics && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Success Metrics</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {rec.success_metrics.slice(0, 2).map((metric, idx) => (
                          <li key={idx} className="flex items-center">
                            <ChartBarIcon className="h-4 w-4 text-blue-500 mr-2" />
                            <span>{metric}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => toggleExpanded(rec.id)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                <EyeIcon className="h-4 w-4 mr-1" />
                {isExpanded ? 'Show Less' : 'Show More'}
              </button>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRecommendationClick(rec)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center space-x-1"
                >
                  <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                  <span>Details</span>
                </button>
                <button
                  onClick={() => handleStartConversation(rec)}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm flex items-center space-x-1"
                >
                  <ChatBubbleLeftRightIcon className="h-3 w-3" />
                  <span>Discuss</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <LightBulbIcon className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">Enhanced Recommendations</h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {filteredAndSortedRecommendations.length} items
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg ${viewMode === 'cards' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <EyeIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 rounded-lg ${viewMode === 'timeline' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ClockIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`p-2 rounded-lg ${viewMode === 'matrix' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ChartBarIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>
                {type?.toUpperCase()}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="priority">Sort by Priority</option>
            <option value="cost">Sort by Cost</option>
            <option value="timeline">Sort by Timeline</option>
            <option value="impact">Sort by Impact</option>
            <option value="type">Sort by Type</option>
          </select>

          <button
            onClick={() => {
              if (onCreateDetailedPlan) {
                onCreateDetailedPlan(filteredAndSortedRecommendations);
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Create Plan</span>
          </button>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedRecommendations.map((rec, index) => 
          renderRecommendationCard(rec, index)
        )}
      </div>

      {/* Empty State */}
      {filteredAndSortedRecommendations.length === 0 && (
        <div className="text-center py-12">
          <LightBulbIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more recommendations.</p>
        </div>
      )}

      {/* Detailed Modal */}
      <AnimatePresence>
        {showDetailModal && selectedRecommendation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`bg-gradient-to-r ${getTypeColor(selectedRecommendation.type)} px-6 py-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-white">
                    {getTypeIcon(selectedRecommendation.type)}
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedRecommendation.title}
                      </h2>
                      <p className="text-white/90">
                        {selectedRecommendation.type?.toUpperCase()} • {selectedRecommendation.priority_level || selectedRecommendation.priority} Priority
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-white/80 hover:text-white"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-700">
                        {selectedRecommendation.description}
                      </p>
                    </div>

                    {selectedRecommendation.recommended_actions && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommended Actions</h3>
                        <ul className="space-y-2">
                          {selectedRecommendation.recommended_actions.map((action, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedRecommendation.plan && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Implementation Plan</h3>
                        <div className="space-y-3">
                          {Object.entries(selectedRecommendation.plan).map(([phase, description]) => (
                            <div key={phase} className="border-l-4 border-blue-500 pl-4">
                              <h4 className="font-medium text-gray-900">{phase}</h4>
                              <p className="text-gray-600 text-sm">
                                {typeof description === 'string' ? description : 
                                 Array.isArray(description) ? description.join(', ') : 
                                 JSON.stringify(description)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Cost</span>
                          <span className="font-medium text-gray-900">
                            {selectedRecommendation.cost_estimate || 'TBD'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Timeline</span>
                          <span className="font-medium text-gray-900">
                            {selectedRecommendation.timeline || 'TBD'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Impact</span>
                          <span className="font-medium text-gray-900">
                            {selectedRecommendation.impact || 'Medium'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Locations</span>
                          <span className="font-medium text-gray-900">
                            {selectedRecommendation.locations_affected || selectedRecommendation.target_locations?.length || 1}
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedRecommendation.implementation_partners && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Implementation Partners</h3>
                        <div className="space-y-2">
                          {selectedRecommendation.implementation_partners.map((partner, idx) => (
                            <div key={idx} className="flex items-center">
                              <UserGroupIcon className="h-4 w-4 text-blue-600 mr-2" />
                              <span className="text-sm text-gray-700">{partner}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedRecommendation.success_metrics && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Success Metrics</h3>
                        <ul className="space-y-2">
                          {selectedRecommendation.success_metrics.map((metric, idx) => (
                            <li key={idx} className="flex items-start">
                              <ChartBarIcon className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{metric}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleStartConversation(selectedRecommendation)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    <span>Create Detailed Plan</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedRecommendations;
