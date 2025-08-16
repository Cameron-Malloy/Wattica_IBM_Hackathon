import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  UsersIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ClickableGapsGrid = ({ results, onGapClick, onStartConversation }) => {
  const [selectedGap, setSelectedGap] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('severity');
  const [showDetailModal, setShowDetailModal] = useState(false);

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'missing curb ramps':
      case 'missing_curb_ramps':
        return <BuildingOfficeIcon className="h-5 w-5" />;
      case 'poor lighting':
      case 'poor_lighting':
        return <LightBulbIcon className="h-5 w-5" />;
      case 'steep grade':
      case 'steep_grade':
        return <ArrowTrendingUpIcon className="h-5 w-5" />;
      case 'inaccessible transit':
      case 'inaccessible_transit':
        return <UsersIcon className="h-5 w-5" />;
      case 'missing accessible parking':
      case 'missing_accessible_parking':
        return <BuildingOfficeIcon className="h-5 w-5" />;
      case 'broken sidewalk':
      case 'broken_sidewalk':
        return <WrenchScrewdriverIcon className="h-5 w-5" />;
      case 'no tactile paving':
      case 'no_tactile_paving':
        return <ShieldCheckIcon className="h-5 w-5" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'from-red-500 to-red-600 border-red-300';
      case 'high':
        return 'from-orange-500 to-orange-600 border-orange-300';
      case 'moderate':
        return 'from-yellow-500 to-yellow-600 border-yellow-300';
      case 'low':
        return 'from-green-500 to-green-600 border-green-300';
      default:
        return 'from-gray-500 to-gray-600 border-gray-300';
    }
  };

  const getSeverityBadgeColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredAndSortedGaps = useMemo(() => {
    if (!results?.scan_results) return [];

    let filtered = results.scan_results.filter(gap => {
      const matchesSeverity = filterSeverity === 'all' || gap.severity === filterSeverity;
      const matchesType = filterType === 'all' || gap.issue_type === filterType;
      const matchesSource = filterSource === 'all' || 
        (filterSource === 'survey' && gap.survey_based) ||
        (filterSource === 'ai' && !gap.survey_based);
      const matchesSearch = searchTerm === '' || 
        gap.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gap.issue_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gap.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSeverity && matchesType && matchesSource && matchesSearch;
    });

    // Sort the results - prioritize survey-based gaps
    filtered.sort((a, b) => {
      // First, prioritize survey-based gaps
      if (a.survey_based && !b.survey_based) return -1;
      if (!a.survey_based && b.survey_based) return 1;
      
      // Then sort by selected criteria
      switch (sortBy) {
        case 'severity':
          const severityOrder = { critical: 0, high: 1, moderate: 2, low: 3 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        case 'location':
          return (a.location || '').localeCompare(b.location || '');
        case 'type':
          return (a.issue_type || '').localeCompare(b.issue_type || '');
        case 'confidence':
          return (b.confidence || 0) - (a.confidence || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [results, filterSeverity, filterType, filterSource, searchTerm, sortBy]);

  const uniqueTypes = useMemo(() => {
    if (!results?.scan_results) return [];
    return [...new Set(results.scan_results.map(gap => gap.issue_type))];
  }, [results]);

  const handleGapClick = (gap) => {
    setSelectedGap(gap);
    setShowDetailModal(true);
    if (onGapClick) {
      onGapClick(gap);
    }
  };

  const handleStartConversation = (gap) => {
    const message = `I'd like to discuss the ${gap.issue_type?.replace(/_/g, ' ')} issue in ${gap.location}. Can you provide more detailed recommendations and create an implementation plan?`;
    
    if (onStartConversation) {
      onStartConversation(message, gap);
    }
    
    toast.success('Starting conversation about this accessibility gap!');
    setShowDetailModal(false);
  };

  const getImpactDescription = (gap) => {
    const elderlyMatch = gap.vulnerable_population?.match(/(\d+\.?\d*)% elderly/);
    const disabledMatch = gap.vulnerable_population?.match(/(\d+\.?\d*)% disabled/);
    
    const elderlyPercent = elderlyMatch ? parseFloat(elderlyMatch[1]) : 0;
    const disabledPercent = disabledMatch ? parseFloat(disabledMatch[1]) : 0;
    
    if (elderlyPercent > 20 || disabledPercent > 15) {
      return 'High impact on vulnerable populations';
    } else if (elderlyPercent > 15 || disabledPercent > 10) {
      return 'Moderate impact on vulnerable populations';
    } else {
      return 'Standard impact on community';
    }
  };

  return (
    <div className="space-y-6">
      {/* Comprehensive Data Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <ExclamationTriangleIcon className="h-6 w-6 mr-2 text-red-600" />
          Complete Accessibility Gap Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{results?.scan_results?.length || 0}</div>
            <div className="text-sm text-gray-600">Total Gaps Identified</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {results?.scan_results?.filter(gap => gap.severity === 'critical').length || 0}
            </div>
            <div className="text-sm text-gray-600">Critical Issues</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {results?.scan_results?.filter(gap => gap.severity === 'high').length || 0}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round((results?.scan_results?.reduce((sum, gap) => sum + (gap.confidence || 0), 0) / (results?.scan_results?.length || 1)) * 100) || 0}%
            </div>
            <div className="text-sm text-gray-600">Avg Confidence</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2 text-blue-600" />
            Filter & Search
          </h3>
          <span className="text-sm text-gray-500">
            {filteredAndSortedGaps.length} of {results?.scan_results?.length || 0} gaps
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search gaps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>
                {type?.replace(/_/g, ' ').toUpperCase()}
              </option>
            ))}
          </select>

          {/* Source Filter */}
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Sources</option>
            <option value="survey">📋 Community Reports</option>
            <option value="ai">🤖 AI Detected</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="severity">Sort by Severity</option>
            <option value="location">Sort by Location</option>
            <option value="type">Sort by Type</option>
            <option value="confidence">Sort by Confidence</option>
          </select>
        </div>
      </div>

      {/* Gaps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredAndSortedGaps.map((gap, index) => (
            <motion.div
              key={gap.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="group cursor-pointer"
              onClick={() => handleGapClick(gap)}
            >
              <div className={`relative bg-gradient-to-br ${getSeverityColor(gap.severity)} rounded-xl shadow-lg border-2 overflow-hidden transition-all duration-300 group-hover:shadow-xl`}>
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-sm p-4 border-b border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 text-white">
                      {getTypeIcon(gap.issue_type)}
                      <span className="font-semibold text-sm">
                        {gap.issue_type?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      {gap.survey_based && (
                        <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full font-medium border border-blue-300">
                          📋 Community Reported
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityBadgeColor(gap.severity)} bg-white/20 text-white border-white/30`}>
                      {gap.severity}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-white/90 text-sm">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span className="truncate">{gap.location?.split(',')[0] || 'Unknown Location'}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 text-white">
                  <p className="text-sm mb-3 line-clamp-2">
                    {gap.description || 'No description available'}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center">
                        <EyeIcon className="h-3 w-3 mr-1" />
                        Confidence: {Math.round((gap.confidence || 0) * 100)}%
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {gap.detected_date || 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs">
                      <UserGroupIcon className="h-3 w-3 mr-1" />
                      <span>{getImpactDescription(gap)}</span>
                    </div>
                    
                    {gap.vulnerable_population && (
                      <div className="flex items-center text-xs">
                        <UsersIcon className="h-3 w-3 mr-1" />
                        <span className="truncate">{gap.vulnerable_population}</span>
                      </div>
                    )}
                    
                    {gap.agent && (
                      <div className="flex items-center text-xs">
                        <ComputerDesktopIcon className="h-3 w-3 mr-1" />
                        <span>Analyzed by {gap.agent}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGapClick(gap);
                      }}
                      className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartConversation(gap);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      <span>Discuss</span>
                    </button>
                  </div>
                </div>

                {/* Confidence Indicator */}
                <div className="absolute top-2 right-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {Math.round((gap.confidence || 0) * 100)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredAndSortedGaps.length === 0 && (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No gaps found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms.</p>
        </div>
      )}

      {/* Detailed Modal */}
      <AnimatePresence>
        {showDetailModal && selectedGap && (
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
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`bg-gradient-to-r ${getSeverityColor(selectedGap.severity)} px-6 py-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-white">
                    {getTypeIcon(selectedGap.issue_type)}
                    <div>
                      <h2 className="text-xl font-bold">
                        {selectedGap.issue_type?.replace(/_/g, ' ').toUpperCase()}
                      </h2>
                      <p className="text-white/90">
                        {selectedGap.location}
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Issue Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">Severity</span>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityBadgeColor(selectedGap.severity)}`}>
                            {selectedGap.severity}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">Confidence</span>
                          <span className="font-medium text-gray-900">
                            {Math.round((selectedGap.confidence || 0) * 100)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">Detected</span>
                          <span className="font-medium text-gray-900">
                            {selectedGap.detected_date || 'Unknown'}
                          </span>
                        </div>
                        {selectedGap.agent && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-700">Analyzed By</span>
                            <span className="font-medium text-gray-900">
                              {selectedGap.agent}
                            </span>
                          </div>
                        )}
                        {selectedGap.watsonx_generated && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-700">AI Generated</span>
                            <span className="font-medium text-green-600">
                              ✓ WatsonX AI
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                        {selectedGap.description || 'No description available'}
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Impact Analysis</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <UserGroupIcon className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="font-medium text-blue-900">Affected Population</span>
                          </div>
                          <p className="text-sm text-blue-800">
                            {selectedGap.vulnerable_population || 'Population data not available'}
                          </p>
                        </div>
                        
                        {selectedGap.risk_factors && selectedGap.risk_factors.length > 0 && (
                          <div className="p-3 bg-orange-50 rounded-lg">
                            <div className="flex items-center mb-2">
                              <ExclamationTriangleIcon className="h-4 w-4 text-orange-600 mr-2" />
                              <span className="font-medium text-orange-900">Risk Factors</span>
                            </div>
                            <ul className="text-sm text-orange-800 space-y-1">
                              {selectedGap.risk_factors.map((factor, index) => (
                                <li key={index}>• {factor}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Location Details</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <MapPinIcon className="h-4 w-4 text-green-600 mr-2" />
                            <span className="font-medium text-green-900">Address</span>
                          </div>
                          <p className="text-sm text-green-800">
                            {selectedGap.location || 'Location not specified'}
                          </p>
                        </div>
                        
                        {selectedGap.coordinates && (
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center mb-2">
                              <BuildingOfficeIcon className="h-4 w-4 text-purple-600 mr-2" />
                              <span className="font-medium text-purple-900">Coordinates</span>
                            </div>
                            <p className="text-sm text-purple-800">
                              {selectedGap.coordinates.lat.toFixed(4)}, {selectedGap.coordinates.lng.toFixed(4)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
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
                    onClick={() => handleStartConversation(selectedGap)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    <span>Discuss with AI</span>
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
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

export default ClickableGapsGrid;
