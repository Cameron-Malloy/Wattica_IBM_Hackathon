import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { 
  ExclamationTriangleIcon,
  MapPinIcon,
  EyeIcon,
  PlayIcon,
  StopIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  ComputerDesktopIcon,
  UsersIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  FlagIcon,
  HeartIcon,
  LightBulbIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const {
    results,
    loading,
    error,
    isConnected,
    activeJobs,
    getLatestResults,
    startCompleteAnalysis,
    stopStatusPolling
  } = useApi();

  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [selectedGap, setSelectedGap] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [surveyData, setSurveyData] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [recommendationFilter, setRecommendationFilter] = useState('all');

  useEffect(() => {
    if (isConnected) {
      getLatestResults('CA');
      fetchSurveyData();
    }
  }, [isConnected, getLatestResults]);

  const fetchSurveyData = async () => {
    try {
      const response = await fetch('http://localhost:8002/surveys');
      if (response.ok) {
        const data = await response.json();
        setSurveyData(data.surveys || []);
      }
    } catch (error) {
      console.error('Failed to fetch survey data:', error);
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'infrastructure':
        return <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />;
      case 'policy':
        return <WrenchScrewdriverIcon className="h-6 w-6 text-green-600" />;
      case 'technology':
        return <ComputerDesktopIcon className="h-6 w-6 text-purple-600" />;
      case 'community':
        return <UsersIcon className="h-6 w-6 text-orange-600" />;
      default:
        return <LightBulbIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'immediate':
      case 'high':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'short-term':
      case 'medium':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium-term':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'long-term':
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'moderate':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'high':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const handleStartAnalysis = async () => {
    try {
      console.log('Starting analysis...');
      const result = await startCompleteAnalysis('CA');
      console.log('Analysis started:', result);
      toast.success('Analysis started successfully');
    } catch (error) {
      console.error('Failed to start analysis:', error);
      toast.error(`Failed to start analysis: ${error.message || 'Unknown error'}`);
    }
  };

  const handleStopAnalysis = (jobId) => {
    stopStatusPolling(jobId);
    toast.success('Analysis stopped');
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ExclamationTriangleIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Backend Not Connected</h2>
          <p className="text-gray-600">Please ensure the backend server is running.</p>
        </motion.div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Accessibility Gaps',
      value: results?.scan_results?.length || 0,
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Issues identified',
      onClick: () => setActiveTab('gaps')
    },
    {
      name: 'Priority Areas',
      value: results?.priority_areas?.length || 0,
      icon: FlagIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'High priority locations',
      onClick: () => setActiveTab('priorities')
    },
    {
      name: 'AI Recommendations',
      value: results?.recommendations?.length || 0,
      icon: LightBulbIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Strategic solutions',
      onClick: () => setActiveTab('recommendations')
    },
    {
      name: 'Active Jobs',
      value: activeJobs.length,
      icon: SparklesIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Analysis in progress'
    }
  ];

  const renderOverview = () => (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={stat.onClick}
              className={`bg-white rounded-xl shadow-lg border border-white/20 p-6 card-hover ${stat.onClick ? 'cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              {stat.onClick && (
                <div className="mt-3 flex items-center text-sm text-blue-600">
                  <span>Click to view</span>
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleStartAnalysis}
          disabled={loading}
          className="button-primary flex items-center hover:scale-105 transition-transform duration-200"
        >
          <PlayIcon className="h-5 w-5 mr-2" />
          Start New Analysis
        </motion.button>
        
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => window.location.href = '/map'}
          className="button-secondary flex items-center hover:scale-105 transition-transform duration-200"
        >
          <MapPinIcon className="h-5 w-5 mr-2" />
          View Interactive Map
        </motion.button>
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg border border-white/20 p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <SparklesIcon className="h-6 w-6 text-purple-600 mr-2" />
            Active Analysis Jobs
          </h2>
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <div key={job.job_id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse-gentle"></div>
                  <div>
                    <p className="font-medium text-gray-900">Job {job.job_id}</p>
                    <p className="text-sm text-gray-600">{job.stage || 'Processing'}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleStopAnalysis(job.job_id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
                >
                  <StopIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Preview Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Accessibility Gaps */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg border border-white/20 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
              Recent Accessibility Gaps
            </h2>
            <button
              onClick={() => setActiveTab('gaps')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              View All
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          {results?.scan_results && results.scan_results.length > 0 ? (
            <div className="space-y-3">
              {results.scan_results.slice(0, 3).map((gap) => (
                <div
                  key={gap.id}
                  onClick={() => setSelectedGap(gap)}
                  className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{gap.location}</h3>
                      <p className="text-xs text-gray-600 mb-1">{gap.issue_type}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(gap.severity)}`}>
                        {gap.severity}
                      </span>
                    </div>
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">No accessibility gaps found</p>
            </div>
          )}
        </motion.div>

        {/* Top Recommendations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg border border-white/20 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <LightBulbIcon className="h-6 w-6 text-blue-600 mr-2" />
              Top AI Recommendations
            </h2>
            <button
              onClick={() => setActiveTab('recommendations')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              View All
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          {results?.recommendations && results.recommendations.length > 0 ? (
            <div className="space-y-3">
              {results.recommendations.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecommendation(rec)}
                  className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{rec.title}</h3>
                      <p className="text-xs text-gray-600 mb-1">{rec.type}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(rec.priority_level)}`}>
                          {rec.priority_level}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getImpactColor(rec.impact)}`}>
                          {rec.impact} Impact
                        </span>
                      </div>
                    </div>
                    {getRecommendationIcon(rec.type)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <LightBulbIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">No recommendations available</p>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );

  const renderAccessibilityGaps = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
          Accessibility Gaps Analysis
        </h2>
        <button
          onClick={() => setActiveTab('overview')}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          <ArrowRightIcon className="h-4 w-4 mr-1 rotate-180" />
          Back to Overview
        </button>
      </div>

      {results?.scan_results && results.scan_results.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gaps List */}
          <div className="space-y-4">
            {results.scan_results.map((gap, index) => (
              <motion.div
                key={gap.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedGap(gap)}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedGap?.id === gap.id
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{gap.location}</h3>
                    <p className="text-sm text-gray-600 mb-2">{gap.issue_type}</p>
                    <p className="text-sm text-gray-700 mb-3">{gap.description}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(gap.severity)}`}>
                        {gap.severity}
                      </span>
                      <span className="text-xs text-gray-500">
                        Confidence: {Math.round(gap.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Gap Details */}
          <div className="bg-white rounded-xl shadow-lg border border-white/20 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <MagnifyingGlassIcon className="h-6 w-6 text-red-600 mr-2" />
              Gap Details
            </h3>
            
            {selectedGap ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedGap.location}</h4>
                  <p className="text-gray-600 mb-3">{selectedGap.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600">Issue Type</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedGap.issue_type}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600">Severity</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedGap.severity}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600">Confidence</p>
                    <p className="text-lg font-semibold text-gray-900">{Math.round(selectedGap.confidence * 100)}%</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600">Detected Date</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedGap.detected_date}</p>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h5 className="font-semibold text-red-900 mb-2">Vulnerable Population</h5>
                  <p className="text-sm text-red-800">{selectedGap.vulnerable_population}</p>
                </div>
                
                {selectedGap.risk_factors && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h5 className="font-semibold text-orange-900 mb-2">Risk Factors</h5>
                    <ul className="text-sm text-orange-800 list-disc list-inside space-y-1">
                      {selectedGap.risk_factors.map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedGap.coordinates && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-900 mb-2">Location Coordinates</h5>
                    <p className="text-sm text-blue-800">
                      Lat: {selectedGap.coordinates.lat}, Lng: {selectedGap.coordinates.lng}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a gap to view details</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No accessibility gaps found</p>
        </div>
      )}
    </motion.div>
  );

  const renderPriorityAreas = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FlagIcon className="h-8 w-8 text-orange-600 mr-3" />
          Priority Areas Analysis
        </h2>
        <button
          onClick={() => setActiveTab('overview')}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          <ArrowRightIcon className="h-4 w-4 mr-1 rotate-180" />
          Back to Overview
        </button>
      </div>

      {results?.priority_areas && results.priority_areas.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Priority Areas List */}
          <div className="space-y-4">
            {results.priority_areas.map((priority, index) => (
              <motion.div
                key={priority.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedPriority(priority)}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedPriority?.id === priority.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{priority.location}</h3>
                    <p className="text-sm text-gray-600 mb-2">{priority.top_issue}</p>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(priority.priority_level)}`}>
                        {priority.priority_level}
                      </span>
                      <span className="text-xs text-gray-500">
                        Score: {priority.priority_score}/10
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{priority.rationale}</p>
                  </div>
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Priority Details */}
          <div className="bg-white rounded-xl shadow-lg border border-white/20 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <MagnifyingGlassIcon className="h-6 w-6 text-orange-600 mr-2" />
              Priority Area Details
            </h3>
            
            {selectedPriority ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedPriority.location}</h4>
                  <p className="text-gray-600 mb-3">{selectedPriority.rationale}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600">Priority Level</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedPriority.priority_level}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600">Priority Score</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedPriority.priority_score}/10</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600">Top Issue</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedPriority.top_issue}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600">Timeline</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedPriority.recommended_timeline}</p>
                  </div>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h5 className="font-semibold text-orange-900 mb-2">Vulnerable Population</h5>
                  <p className="text-sm text-orange-800">{selectedPriority.vulnerable_population}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-semibold text-green-900 mb-2">Potential Impact</h5>
                    <p className="text-sm text-green-800 capitalize">{selectedPriority.potential_impact}</p>
                  </div>
                                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-900 mb-2">Implementation Cost</h5>
                      <p className="text-sm text-blue-800 capitalize">{selectedPriority.implementation_cost}</p>
                    </div>
                </div>
                
                {selectedPriority.equity_factors && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h5 className="font-semibold text-purple-900 mb-2">Equity Factors</h5>
                    <ul className="text-sm text-purple-800 list-disc list-inside space-y-1">
                      {selectedPriority.equity_factors.map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedPriority.coordinates && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-2">Location Coordinates</h5>
                    <p className="text-sm text-gray-700">
                      Lat: {selectedPriority.coordinates.lat}, Lng: {selectedPriority.coordinates.lng}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a priority area to view details</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <FlagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No priority areas identified</p>
        </div>
      )}
    </motion.div>
  );

  const renderSurveyRecommendations = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <HeartIcon className="h-8 w-8 text-green-600 mr-3" />
          Community Survey Recommendations
        </h2>
        <button
          onClick={() => setActiveTab('overview')}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          <ArrowRightIcon className="h-4 w-4 mr-1 rotate-180" />
          Back to Overview
        </button>
      </div>

      {surveyData.filter(s => s.ai_recommendation).length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Survey Recommendations List */}
          <div className="space-y-4">
            {surveyData.filter(s => s.ai_recommendation).map((survey, index) => (
              <motion.div
                key={survey.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedSurvey(survey)}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedSurvey?.id === survey.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {survey.location.city} - {survey.issue.type}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {survey.issue.description}
                    </p>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(survey.issue.severity)}`}>
                        {survey.issue.severity}
                      </span>
                      <span className="text-xs text-gray-500">
                        {survey.ai_recommendation.priority} Priority
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-300">
                        AI Generated
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {survey.ai_recommendation.title}
                    </p>
                  </div>
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Survey Details */}
          <div className="bg-white rounded-xl shadow-lg border border-white/20 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <MagnifyingGlassIcon className="h-6 w-6 text-green-600 mr-2" />
              Survey & Recommendation Details
            </h3>
            
            {selectedSurvey ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedSurvey.location.city} - {selectedSurvey.issue.type}
                  </h4>
                  <p className="text-gray-600 mb-3">{selectedSurvey.issue.description}</p>
                </div>
                
                {/* Survey Information */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-3">Survey Information</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Severity</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedSurvey.issue.severity}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Impact Frequency</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedSurvey.impact.frequency}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Affected Age Groups</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedSurvey.impact.age_groups.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Mobility Needs</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedSurvey.demographics.mobility_needs.join(', ')}</p>
                    </div>
                  </div>
                </div>
                
                {/* AI Recommendation */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-semibold text-green-900 mb-3">AI-Generated Recommendation</h5>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-green-800">Title</p>
                      <p className="text-sm font-semibold text-green-900">{selectedSurvey.ai_recommendation.title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800">Description</p>
                      <p className="text-sm text-green-900">{selectedSurvey.ai_recommendation.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm font-medium text-green-800">Priority</p>
                        <p className="text-sm font-semibold text-green-900">{selectedSurvey.ai_recommendation.priority}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">Timeline</p>
                        <p className="text-sm font-semibold text-green-900">{selectedSurvey.ai_recommendation.timeline}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">Cost Estimate</p>
                        <p className="text-sm font-semibold text-green-900">{selectedSurvey.ai_recommendation.cost_estimate}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">Type</p>
                        <p className="text-sm font-semibold text-green-900">{selectedSurvey.ai_recommendation.type}</p>
                      </div>
                    </div>
                    
                    {/* Add missing fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm font-medium text-green-800">Priority Level</p>
                        <p className="text-sm font-semibold text-green-900">{selectedSurvey.ai_recommendation.priority_level || selectedSurvey.ai_recommendation.priority}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">Impact</p>
                        <p className="text-sm font-semibold text-green-900 capitalize">{selectedSurvey.ai_recommendation.impact || 'medium'}</p>
                      </div>
                    </div>
                    
                    {selectedSurvey.ai_recommendation.sdg_alignment && (
                      <div>
                        <p className="text-sm font-medium text-green-800">SDG Alignment</p>
                        <p className="text-sm text-green-900">{selectedSurvey.ai_recommendation.sdg_alignment}</p>
                      </div>
                    )}
                    
                    {selectedSurvey.ai_recommendation.plan && (
                      <div>
                        <p className="text-sm font-medium text-green-800">Implementation Plan</p>
                        <p className="text-sm text-green-900">{selectedSurvey.ai_recommendation.plan}</p>
                      </div>
                    )}
                    
                    {selectedSurvey.ai_recommendation.recommended_actions && (
                      <div>
                        <p className="text-sm font-medium text-green-800 mb-2">Recommended Actions</p>
                        <ol className="text-sm text-green-900 list-decimal list-inside space-y-1">
                          {selectedSurvey.ai_recommendation.recommended_actions.map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                    
                    {selectedSurvey.ai_recommendation.expected_impact && (
                      <div>
                        <p className="text-sm font-medium text-green-800">Expected Impact</p>
                        <p className="text-sm text-green-900">{selectedSurvey.ai_recommendation.expected_impact}</p>
                      </div>
                    )}
                    
                    {selectedSurvey.ai_recommendation.implementation_partners && (
                      <div>
                        <p className="text-sm font-medium text-green-800">Implementation Partners</p>
                        <p className="text-sm text-green-900">{selectedSurvey.ai_recommendation.implementation_partners.join(', ')}</p>
                      </div>
                    )}
                    
                    {selectedSurvey.ai_recommendation.detailed_plan && (
                      <div>
                        <p className="text-sm font-medium text-green-800">Detailed Implementation Plan</p>
                        <p className="text-sm text-green-900">{selectedSurvey.ai_recommendation.detailed_plan}</p>
                      </div>
                    )}
                    
                    {selectedSurvey.ai_recommendation.success_metrics && (
                      <div>
                        <p className="text-sm font-medium text-green-800">Success Metrics</p>
                        <ul className="text-sm text-green-900 list-disc list-inside space-y-1">
                          {selectedSurvey.ai_recommendation.success_metrics.map((metric, index) => (
                            <li key={index}>{metric}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedSurvey.ai_recommendation.equity_impact && (
                      <div>
                        <p className="text-sm font-medium text-green-800">Equity Impact</p>
                        <p className="text-sm text-green-900">{selectedSurvey.ai_recommendation.equity_impact}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-gray-500">
                  Submitted: {new Date(selectedSurvey.submitted_at).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a survey to view details</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No survey recommendations available</p>
          <p className="text-gray-500 text-sm mt-2">Submit a survey to generate AI-powered recommendations</p>
        </div>
      )}
    </motion.div>
  );

  const renderRecommendations = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <LightBulbIcon className="h-8 w-8 text-blue-600 mr-3" />
          AI-Powered Recommendations
        </h2>
        <button
          onClick={() => setActiveTab('overview')}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          <ArrowRightIcon className="h-4 w-4 mr-1 rotate-180" />
          Back to Overview
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {['All', 'Infrastructure', 'Policy', 'Technology', 'Community'].map((filter) => (
          <button
            key={filter}
            onClick={() => setRecommendationFilter(filter.toLowerCase())}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              recommendationFilter === filter.toLowerCase()
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {results?.recommendations && results.recommendations.filter(rec => recommendationFilter === 'all' || rec.type === recommendationFilter).length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recommendations List */}
          <div className="space-y-4">
            {results.recommendations
              .filter(rec => recommendationFilter === 'all' || rec.type === recommendationFilter)
              .map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedRecommendation(rec)}
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedRecommendation?.id === rec.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getRecommendationIcon(rec.type)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                      <p className="text-sm text-gray-600 capitalize">{rec.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(rec.priority_level)}`}>
                      {rec.priority_level}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getImpactColor(rec.impact)}`}>
                      {rec.impact} Impact
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{rec.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {rec.timeline}
                    </span>
                    <span className="flex items-center">
                      <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                      {rec.cost_estimate}
                    </span>
                    <span className="flex items-center">
                      <GlobeAltIcon className="h-3 w-3 mr-1" />
                      {rec.locations_affected} cities
                    </span>
                  </div>
                  <EyeIcon className="h-4 w-4 text-gray-400" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recommendation Details */}
          <div className="bg-white rounded-xl shadow-lg border border-white/20 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <MagnifyingGlassIcon className="h-6 w-6 text-blue-600 mr-2" />
              Recommendation Details
            </h3>
            
            {selectedRecommendation ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    {getRecommendationIcon(selectedRecommendation.type)}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{selectedRecommendation.title}</h4>
                      <p className="text-sm text-gray-600 capitalize">{selectedRecommendation.type}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{selectedRecommendation.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600">Priority Level</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedRecommendation.priority_level}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600">Impact</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{selectedRecommendation.impact}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600">Timeline</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedRecommendation.timeline}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600">Cost Estimate</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedRecommendation.cost_estimate}</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-900 mb-2">SDG Alignment</h5>
                  <p className="text-sm text-blue-800">{selectedRecommendation.sdg_alignment}</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-semibold text-green-900 mb-2">Equity Impact</h5>
                  <p className="text-sm text-green-800">{selectedRecommendation.equity_impact}</p>
                </div>
                
                {selectedRecommendation.implementation_steps && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h5 className="font-semibold text-orange-900 mb-3">Implementation Steps</h5>
                    <ol className="text-sm text-orange-800 list-decimal list-inside space-y-2">
                      {selectedRecommendation.implementation_steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
                
                {selectedRecommendation.success_metrics && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h5 className="font-semibold text-purple-900 mb-3">Success Metrics</h5>
                    <ul className="text-sm text-purple-800 list-disc list-inside space-y-1">
                      {selectedRecommendation.success_metrics.map((metric, index) => (
                        <li key={index}>{metric}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedRecommendation.target_locations && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-2">Target Locations</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecommendation.target_locations.slice(0, 8).map((location, index) => (
                        <span key={index} className="px-2 py-1 bg-white text-xs rounded-full border">
                          {location}
                        </span>
                      ))}
                      {selectedRecommendation.target_locations.length > 8 && (
                        <span className="px-2 py-1 bg-white text-xs rounded-full border text-gray-500">
                          +{selectedRecommendation.target_locations.length - 8} more cities
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Total: {selectedRecommendation.target_locations.length} cities affected
                    </p>
                  </div>
                )}
                
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Generated by {selectedRecommendation.agent}</span>
                    <span>{selectedRecommendation.generated_date}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <LightBulbIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a recommendation to view details</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <LightBulbIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No recommendations available</p>
          <p className="text-gray-500 text-sm mt-2">Start an analysis to generate AI-powered recommendations</p>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold gradient-text mb-4">
              Accessibility Dashboard
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive overview of accessibility issues, priorities, and AI-generated recommendations across California
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner message="Loading dashboard data..." />
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400 mr-3" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'gaps' && renderAccessibilityGaps()}
        {activeTab === 'priorities' && renderPriorityAreas()}
        {activeTab === 'surveys' && renderSurveyRecommendations()}
        {activeTab === 'recommendations' && renderRecommendations()}
      </div>
    </div>
  );
};

export default DashboardPage;
