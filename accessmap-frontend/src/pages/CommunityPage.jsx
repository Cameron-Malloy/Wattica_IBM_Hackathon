import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  XMarkIcon,
  EyeIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  ComputerDesktopIcon,
  UsersIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// California cities for search
const CALIFORNIA_CITIES = [
  'Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Fresno', 'Sacramento',
  'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim', 'Santa Ana', 'Riverside',
  'Stockton', 'Irvine', 'Chula Vista', 'Fremont', 'San Bernardino', 'Modesto',
  'Fontana', 'Glendale', 'Huntington Beach', 'Moreno Valley', 'Oxnard',
  'Rancho Cucamonga', 'Oceanside', 'Ontario', 'Garden Grove', 'Pomona',
  'Santa Rosa', 'Salinas', 'Corona', 'Lancaster', 'Palmdale', 'Hayward',
  'Escondido', 'Sunnyvale', 'Torrance', 'Pasadena', 'Orange', 'Fullerton',
  'Thousand Oaks', 'Elk Grove', 'Concord', 'Visalia', 'Simi Valley',
  'Roseville', 'Santa Clara', 'Vallejo', 'Victorville', 'Berkeley',
  'Fairfield', 'Antioch', 'Richmond', 'Daly City', 'Tracy', 'Burbank'
];

const CommunityPage = () => {
  const {
    results,
    loading,
    error,
    isConnected,
    getLatestResults
  } = useApi();

  const [surveyData, setSurveyData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filters, setFilters] = useState({
    severity: 'all',
    issueType: 'all',
    status: 'all'
  });
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [cityAnalysis, setCityAnalysis] = useState({});

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

  const handleCitySearch = (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const filtered = CALIFORNIA_CITIES.filter(city =>
      city.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
    
    setSearchResults(filtered);
    setShowSearchResults(true);
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setSearchQuery(city);
    setShowSearchResults(false);
    
    // Generate analysis for the selected city
    generateCityAnalysis(city);
  };

  const clearCitySearch = () => {
    setSelectedCity(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setCityAnalysis({});
  };

  const generateCityAnalysis = async (city) => {
    try {
      const citySurveys = surveyData.filter(survey => 
        survey.location.city === city
      );

      if (citySurveys.length === 0) {
        setCityAnalysis({
          city,
          surveys: [],
          analysis: {
            summary: `No community feedback found for ${city}.`,
            recommendations: [{
              title: 'Encourage Community Reporting',
              type: 'community',
              priority_level: 'Medium-term',
              description: `No accessibility issues have been reported for ${city}. Consider launching a community awareness campaign to encourage residents to report accessibility barriers.`,
              implementation_steps: [
                'Create awareness materials about accessibility reporting',
                'Partner with local disability advocacy groups',
                'Host community workshops on accessibility',
                'Establish reporting channels in public spaces'
              ],
              cost_estimate: '$2,000 - $10,000',
              timeline: '3-6 months',
              impact: 'medium',
              locations_affected: 1
            }]
          }
        });
        return;
      }

      // Analyze survey data for the city
      const issueTypes = [...new Set(citySurveys.map(s => s.issue.type))];
      const severityCounts = citySurveys.reduce((acc, survey) => {
        acc[survey.issue.severity] = (acc[survey.issue.severity] || 0) + 1;
        return acc;
      }, {});

      const mostCommonIssue = issueTypes.reduce((prev, current) => 
        citySurveys.filter(s => s.issue.type === prev).length > 
        citySurveys.filter(s => s.issue.type === current).length ? prev : current
      );

      const criticalIssues = citySurveys.filter(s => s.issue.severity === 'critical').length;
      const moderateIssues = citySurveys.filter(s => s.issue.severity === 'moderate').length;

      setCityAnalysis({
        city,
        surveys: citySurveys,
        analysis: {
          summary: `${city} has ${citySurveys.length} reported accessibility issues. ${criticalIssues} critical issues require immediate attention.`,
          recommendations: [
            {
              title: `Address ${mostCommonIssue} Issues`,
              type: 'infrastructure',
              priority_level: criticalIssues > 0 ? 'Immediate' : 'Short-term',
              description: `Based on ${citySurveys.length} community reports, ${mostCommonIssue} is the most frequently reported issue in ${city}. ${criticalIssues} critical issues need immediate resolution.`,
              implementation_steps: [
                'Conduct site assessment of reported locations',
                'Prioritize critical issues for immediate action',
                'Develop improvement plan with timeline',
                'Engage with community for feedback on solutions'
              ],
              cost_estimate: criticalIssues > 0 ? '$50,000 - $200,000' : '$20,000 - $100,000',
              timeline: criticalIssues > 0 ? '1-3 months' : '3-6 months',
              impact: criticalIssues > 0 ? 'high' : 'medium',
              locations_affected: citySurveys.length
            },
            {
              title: 'Community Engagement Program',
              type: 'community',
              priority_level: 'Short-term',
              description: `Establish ongoing community feedback mechanisms to ensure accessibility issues are reported and addressed promptly.`,
              implementation_steps: [
                'Create dedicated accessibility reporting portal',
                'Establish regular community meetings',
                'Train city staff on accessibility standards',
                'Develop response protocols for reported issues'
              ],
              cost_estimate: '$5,000 - $25,000',
              timeline: '2-4 months',
              impact: 'medium',
              locations_affected: 1
            }
          ]
        }
      });

    } catch (error) {
      console.error('Failed to generate city analysis:', error);
      toast.error('Failed to analyze city data');
    }
  };

  const getFilteredSurveys = () => {
    let filtered = selectedCity ? 
      surveyData.filter(survey => survey.location.city === selectedCity) : 
      surveyData;

    if (filters.severity !== 'all') {
      filtered = filtered.filter(survey => survey.issue.severity === filters.severity);
    }

    if (filters.issueType !== 'all') {
      filtered = filtered.filter(survey => survey.issue.type === filters.issueType);
    }

    return filtered;
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
        return <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'moderate':
        return 'bg-orange-100 text-orange-800';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const markIssueResolved = async (surveyId) => {
    try {
      // In a real implementation, this would update the backend
      setSurveyData(prev => prev.map(survey => 
        survey.id === surveyId 
          ? { ...survey, status: 'resolved', resolved_at: new Date().toISOString() }
          : survey
      ));
      toast.success('Issue marked as resolved');
    } catch (error) {
      toast.error('Failed to update issue status');
    }
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

  const filteredSurveys = getFilteredSurveys();
  const issueTypes = [...new Set(surveyData.map(s => s.issue.type))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Community Feedback</h1>
              <p className="text-gray-600">View and analyze community-reported accessibility issues</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner message="Loading community data..." />
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

        {/* City Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search by City</h2>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleCitySearch(e.target.value)}
              placeholder="Enter city name to view community feedback..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={clearCitySearch}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
            
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                {searchResults.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleCitySelect(city)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                      {city}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* City Analysis */}
        {selectedCity && cityAnalysis.city && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Analysis for {selectedCity}
              </h2>
              <span className="text-sm text-gray-500">
                {cityAnalysis.surveys.length} reports
              </span>
            </div>

            <p className="text-gray-700 mb-6">{cityAnalysis.analysis.summary}</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {cityAnalysis.analysis.recommendations?.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start mb-3">
                    {getRecommendationIcon(rec.type)}
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                      <p className="text-sm text-gray-600">{rec.type} • {rec.priority_level}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{rec.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center text-sm">
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-600">{rec.timeline}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <UserGroupIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-600">{rec.locations_affected} location(s)</span>
                    </div>
                  </div>

                  {rec.implementation_steps && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Implementation Steps:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                        {rec.implementation_steps.map((step, stepIndex) => (
                          <li key={stepIndex}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </motion.div>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="moderate">Moderate</option>
                <option value="minor">Minor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
              <select
                value={filters.issueType}
                onChange={(e) => setFilters(prev => ({ ...prev, issueType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {issueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
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
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Survey List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Community Reports {selectedCity && `- ${selectedCity}`}
            </h2>
            <span className="text-sm text-gray-500">
              {filteredSurveys.length} reports
            </span>
          </div>

          {filteredSurveys.length === 0 ? (
            <div className="text-center py-8">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
              <p className="text-gray-600">
                {selectedCity 
                  ? `No community feedback found for ${selectedCity}.`
                  : 'No community feedback matches your current filters.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSurveys.map((survey, index) => (
                <motion.div
                  key={survey.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedSurvey(survey)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <h3 className="font-medium text-gray-900">{survey.location.city}</h3>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getSeverityColor(survey.issue.severity)}`}>
                          {survey.issue.severity}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 mb-1">{survey.issue.type}</h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {survey.issue.description}
                      </p>
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <span>Submitted: {new Date(survey.submitted_at).toLocaleDateString()}</span>
                        {survey.contact.name && !survey.contact.anonymous && (
                          <span className="ml-4">by {survey.contact.name}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {survey.status === 'resolved' ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markIssueResolved(survey.id);
                          }}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Survey Modal */}
        {selectedSurvey && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Report Details</h2>
                  <button
                    onClick={() => setSelectedSurvey(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Location</h3>
                    <p className="text-gray-700">{selectedSurvey.location.city}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Issue</h3>
                    <p className="text-gray-700">{selectedSurvey.issue.type}</p>
                    <p className="text-gray-600 mt-1">{selectedSurvey.issue.description}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${getSeverityColor(selectedSurvey.issue.severity)}`}>
                      {selectedSurvey.issue.severity}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Impact</h3>
                    <p className="text-gray-700">{selectedSurvey.impact.daily_impact}</p>
                    <p className="text-gray-600 mt-1">Affected: {selectedSurvey.impact.affected_population}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Demographics</h3>
                    <p className="text-gray-700">Age Group: {selectedSurvey.demographics.age_group}</p>
                    <p className="text-gray-700">Mobility Needs: {selectedSurvey.demographics.mobility_needs}</p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Submitted: {new Date(selectedSurvey.submitted_at).toLocaleString()}
                    </p>
                    {selectedSurvey.contact.name && !selectedSurvey.contact.anonymous && (
                      <p className="text-sm text-gray-500">
                        Reporter: {selectedSurvey.contact.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
