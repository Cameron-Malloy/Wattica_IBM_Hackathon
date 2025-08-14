import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { 
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  PlayIcon,
  StopIcon,
  EyeIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  ComputerDesktopIcon,
  UsersIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const EnhancedChatLogPage = () => {
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

  const [chatLogs, setChatLogs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filters, setFilters] = useState({
    agent: 'all',
    status: 'all',
    timeRange: 'all'
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showJobDetails, setShowJobDetails] = useState(false);

  useEffect(() => {
    if (isConnected) {
      getLatestResults('CA');
      fetchChatLogs();
    }
  }, [isConnected, getLatestResults]);

  useEffect(() => {
    let interval;
    if (autoRefresh && isConnected) {
      interval = setInterval(() => {
        fetchChatLogs();
      }, 5000); // Refresh every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, isConnected]);

  const fetchChatLogs = async () => {
    try {
      // Fetch active jobs and their logs
      const jobsResponse = await fetch('http://localhost:8003/status/all');
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        
        // Generate chat logs from active jobs and completed results
        const logs = [];
        
        // Add logs from active jobs
        if (activeJobs.length > 0) {
          activeJobs.forEach(job => {
            logs.push({
              id: `job_${job.job_id}`,
              timestamp: new Date().toISOString(),
              agent: 'Multi-Agent Orchestrator',
              message: `Analysis job ${job.job_id} is currently running in stage: ${job.stage || 'Processing'}`,
              status: 'running',
              type: 'job_status',
              job_id: job.job_id,
              stage: job.stage
            });
          });
        }

        // Add logs from completed results
        if (results) {
          if (results.scan_results && results.scan_results.length > 0) {
            logs.push({
              id: 'scan_complete',
              timestamp: new Date().toISOString(),
              agent: 'AccessScanner',
              message: `Completed accessibility scan. Found ${results.scan_results.length} issues across California.`,
              status: 'completed',
              type: 'scan_results',
              data: results.scan_results
            });
          }

          if (results.priority_areas && results.priority_areas.length > 0) {
            logs.push({
              id: 'priority_complete',
              timestamp: new Date().toISOString(),
              agent: 'EquityAdvisor',
              message: `Completed priority analysis. Identified ${results.priority_areas.length} priority areas requiring immediate attention.`,
              status: 'completed',
              type: 'priority_results',
              data: results.priority_areas
            });
          }

          if (results.recommendations && results.recommendations.length > 0) {
            logs.push({
              id: 'recommendations_complete',
              timestamp: new Date().toISOString(),
              agent: 'PlannerBot',
              message: `Generated ${results.recommendations.length} actionable recommendations for accessibility improvements.`,
              status: 'completed',
              type: 'recommendations',
              data: results.recommendations
            });
          }
        }

        // Sort by timestamp (newest first)
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setChatLogs(logs);
      }
    } catch (error) {
      console.error('Failed to fetch chat logs:', error);
    }
  };

  const handleStartAnalysis = async () => {
    try {
      await startCompleteAnalysis('CA');
      toast.success('Analysis started successfully');
    } catch (error) {
      console.error('Failed to start analysis:', error);
      toast.error('Failed to start analysis');
    }
  };

  const handleStopAnalysis = (jobId) => {
    stopStatusPolling(jobId);
    toast.success('Analysis stopped');
  };

  const getAgentIcon = (agent) => {
    switch (agent) {
      case 'AccessScanner':
        return <MagnifyingGlassIcon className="h-5 w-5 text-blue-600" />;
      case 'EquityAdvisor':
        return <UserGroupIcon className="h-5 w-5 text-green-600" />;
      case 'PlannerBot':
        return <BuildingOfficeIcon className="h-5 w-5 text-purple-600" />;
      case 'Multi-Agent Orchestrator':
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-orange-600" />;
      default:
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'running':
        return 'text-blue-600 bg-blue-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getFilteredLogs = () => {
    let filtered = chatLogs;

    if (filters.agent !== 'all') {
      filtered = filtered.filter(log => log.agent === filters.agent);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(log => log.status === filters.status);
    }

    if (filters.timeRange !== 'all') {
      const now = new Date();
      const timeRanges = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000
      };
      
      if (timeRanges[filters.timeRange]) {
        const cutoff = now.getTime() - timeRanges[filters.timeRange];
        filtered = filtered.filter(log => new Date(log.timestamp).getTime() > cutoff);
      }
    }

    return filtered;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Backend Not Connected</h2>
          <p className="text-gray-600">Please ensure the backend server is running.</p>
        </div>
      </div>
    );
  }

  const filteredLogs = getFilteredLogs();
  const agents = [...new Set(chatLogs.map(log => log.agent))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Agent Chat Log</h1>
              <p className="text-gray-600">Real-time logs from WatsonX AI agents analyzing accessibility data</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center px-3 py-2 rounded-md ${
                  autoRefresh 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </button>
              
              <button
                onClick={handleStartAnalysis}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                Start Analysis
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner message="Loading agent logs..." />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Active Jobs */}
        {activeJobs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Analysis Jobs</h2>
            <div className="space-y-4">
              {activeJobs.map((job) => (
                <div key={job.job_id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-900">{job.job_id}</span>
                    </div>
                    <span className="text-sm text-gray-600">{job.stage || 'Processing'}</span>
                  </div>
                  <button
                    onClick={() => handleStopAnalysis(job.job_id)}
                    className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                  >
                    <StopIcon className="h-4 w-4 mr-1" />
                    Stop
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
              <select
                value={filters.agent}
                onChange={(e) => setFilters(prev => ({ ...prev, agent: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Agents</option>
                {agents.map(agent => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="running">Running</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chat Logs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Agent Logs</h2>
            <button
              onClick={fetchChatLogs}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Logs Found</h3>
              <p className="text-gray-600">
                No agent logs match your current filters. Start an analysis to see real-time logs.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedJob(log);
                    setShowJobDetails(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getAgentIcon(log.agent)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900">{log.agent}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 mb-2">{log.message}</p>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {formatTimestamp(log.timestamp)}
                          {log.job_id && (
                            <>
                              <span className="mx-2">•</span>
                              <span>Job: {log.job_id}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-700">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Job Details Modal */}
        {showJobDetails && selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    {getAgentIcon(selectedJob.agent)}
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedJob.agent}</h2>
                      <p className="text-sm text-gray-600">{selectedJob.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowJobDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Message</h3>
                    <p className="text-gray-700">{selectedJob.message}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Status</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedJob.status)}`}>
                        {selectedJob.status}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Timestamp</h3>
                      <p className="text-gray-700">{new Date(selectedJob.timestamp).toLocaleString()}</p>
                    </div>
                  </div>

                  {selectedJob.job_id && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Job ID</h3>
                      <p className="text-gray-700 font-mono">{selectedJob.job_id}</p>
                    </div>
                  )}

                  {selectedJob.stage && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Current Stage</h3>
                      <p className="text-gray-700">{selectedJob.stage}</p>
                    </div>
                  )}

                  {selectedJob.data && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Data Summary</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <pre className="text-sm text-gray-700 overflow-auto">
                          {JSON.stringify(selectedJob.data.slice(0, 3), null, 2)}
                          {selectedJob.data.length > 3 && `\n... and ${selectedJob.data.length - 3} more items`}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedChatLogPage;
