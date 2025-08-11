import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { 
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  MapPinIcon,
  EyeIcon,
  PlayIcon,
  StopIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  ComputerDesktopIcon,
  UsersIcon
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
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (isConnected) {
      getLatestResults('CA');
    }
  }, [isConnected, getLatestResults]);

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
        return <ChartBarIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Immediate':
        return 'text-red-600 bg-red-100';
      case 'Short-term':
        return 'text-orange-600 bg-orange-100';
      case 'Medium-term':
        return 'text-yellow-600 bg-yellow-100';
      case 'Long-term':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
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
      description: 'Issues identified'
    },
    {
      name: 'Priority Areas',
      value: results?.priority_areas?.length || 0,
      icon: ClockIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'High priority locations'
    },
    {
      name: 'Recommendations',
      value: results?.recommendations?.length || 0,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Action plans generated'
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
                className="bg-white rounded-xl shadow-lg border border-white/20 p-6 card-hover"
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
            className="button-primary flex items-center"
          >
            <PlayIcon className="h-5 w-5 mr-2" />
            Start New Analysis
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => window.location.href = '/map'}
            className="button-secondary flex items-center"
          >
            <MapPinIcon className="h-5 w-5 mr-2" />
            View Map
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

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recommendations List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg border border-white/20 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <ChartBarIcon className="h-6 w-6 text-blue-600 mr-2" />
              AI Recommendations
            </h2>
            
            {results?.recommendations && results.recommendations.length > 0 ? (
              <div className="space-y-4">
                {results.recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedRecommendation(rec)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedRecommendation?.id === rec.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getRecommendationIcon(rec.type)}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{rec.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(rec.priority_level)}`}>
                              {rec.priority_level}
                            </span>
                            <span className="text-xs text-gray-500">{rec.timeline}</span>
                          </div>
                        </div>
                      </div>
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recommendations available</p>
              </div>
            )}
          </motion.div>

          {/* Selected Recommendation Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg border border-white/20 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <EyeIcon className="h-6 w-6 text-green-600 mr-2" />
              Recommendation Details
            </h2>
            
            {selectedRecommendation ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedRecommendation.title}</h3>
                  <p className="text-gray-600">{selectedRecommendation.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600">Priority</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedRecommendation.priority_level}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600">Timeline</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedRecommendation.timeline}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600">Cost Estimate</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedRecommendation.cost_estimate}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600">Impact</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedRecommendation.impact}</p>
                  </div>
                </div>
                
                {selectedRecommendation.implementation_steps && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Implementation Steps</h4>
                    <ol className="space-y-2">
                      {selectedRecommendation.implementation_steps.map((step, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="w-full button-primary"
                >
                  {showMap ? 'Hide' : 'Show'} Target Locations
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <EyeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a recommendation to view details</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
