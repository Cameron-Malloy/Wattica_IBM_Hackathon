import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  Treemap
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  MapIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const COLORS = {
  critical: '#DC2626',
  high: '#EA580C',
  moderate: '#D97706',
  low: '#65A30D',
  infrastructure: '#2563EB',
  safety: '#7C3AED',
  transportation: '#059669',
  parking: '#DB2777',
  policy: '#0891B2',
  community: '#C2410C'
};

const InteractiveCharts = ({ results, onGapClick, onRecommendationClick }) => {
  const [activeChart, setActiveChart] = useState('types');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Process data for different visualizations
  const chartData = useMemo(() => {
    if (!results?.scan_results) return {};

    const scanResults = results.scan_results;
    const recommendations = results.recommendations || [];
    const priorityAreas = results.priority_areas || [];

    // Severity distribution
    const severityData = Object.entries(
      scanResults.reduce((acc, item) => {
        acc[item.severity] = (acc[item.severity] || 0) + 1;
        return acc;
      }, {})
    ).map(([severity, count]) => ({
      severity,
      count,
      fill: COLORS[severity] || '#6B7280'
    }));

    // Issue type distribution
    const issueTypeData = Object.entries(
      scanResults.reduce((acc, item) => {
        const type = item.issue_type?.replace(/_/g, ' ') || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {})
    ).map(([type, count]) => ({ type, count }));

    // Location-based data
    const locationData = Object.entries(
      scanResults.reduce((acc, item) => {
        const location = item.location || 'Unknown';
        if (!acc[location]) {
          acc[location] = { location, issues: 0, critical: 0, high: 0, moderate: 0, low: 0 };
        }
        acc[location].issues++;
        acc[location][item.severity]++;
        return acc;
      }, {})
    ).map(([location, data]) => data).slice(0, 10);

    // Recommendation type distribution
    const recommendationTypeData = Object.entries(
      recommendations.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {})
    ).map(([type, count]) => ({
      type,
      count,
      fill: COLORS[type] || '#6B7280'
    }));

    // Cost analysis
    const costData = recommendations.map((rec, index) => {
      const costRange = rec.cost_estimate || '$50000';
      const match = costRange.match(/\$?(\d+(?:,\d+)?(?:\.\d+)?)/g);
      const avgCost = match ? 
        match.reduce((sum, cost) => sum + parseInt(cost.replace(/[$,]/g, '')), 0) / match.length :
        50000;
      
      // Map impact to numeric values
      let impactScore = 2; // default medium
      const priority = rec.priority_level || rec.priority || 'medium';
      if (priority.toLowerCase() === 'high' || priority.toLowerCase() === 'critical') {
        impactScore = 3;
      } else if (priority.toLowerCase() === 'low') {
        impactScore = 1;
      }
      
      return {
        title: rec.title?.substring(0, 30) + '...' || `Recommendation ${index + 1}`,
        cost: Math.max(avgCost, 1000), // Ensure minimum cost for visibility
        type: rec.type || 'infrastructure',
        priority: priority,
        impact: impactScore
      };
    }).filter(item => item.cost > 0); // Filter out zero-cost items

    // Timeline analysis
    const timelineData = recommendations.map(rec => {
      const timeline = rec.timeline || '0 months';
      const match = timeline.match(/(\d+)/);
      const months = match ? parseInt(match[1]) : 0;
      
      return {
        title: rec.title?.substring(0, 20) + '...' || 'Unknown',
        months,
        cost: costData.find(c => c.title.includes(rec.title?.substring(0, 15)))?.cost || 0,
        impact: rec.impact === 'high' ? 3 : rec.impact === 'medium' ? 2 : 1
      };
    });

    // Vulnerability analysis
    const vulnerabilityData = scanResults.map(item => {
      const elderlyMatch = item.vulnerable_population?.match(/(\d+\.?\d*)% elderly/);
      const disabledMatch = item.vulnerable_population?.match(/(\d+\.?\d*)% disabled/);
      
      return {
        location: item.location?.split(',')[0] || 'Unknown',
        elderly: elderlyMatch ? parseFloat(elderlyMatch[1]) : 0,
        disabled: disabledMatch ? parseFloat(disabledMatch[1]) : 0,
        severity: item.severity,
        issues: 1
      };
    }).reduce((acc, item) => {
      const existing = acc.find(a => a.location === item.location);
      if (existing) {
        existing.issues += 1;
        existing.elderly = Math.max(existing.elderly, item.elderly);
        existing.disabled = Math.max(existing.disabled, item.disabled);
      } else {
        acc.push(item);
      }
      return acc;
    }, []);

    return {
      severityData,
      issueTypeData,
      locationData,
      recommendationTypeData,
      costData,
      timelineData,
      vulnerabilityData
    };
  }, [results]);

  const chartOptions = [
    { key: 'types', label: 'Issue Types', icon: FunnelIcon },
    { key: 'locations', label: 'Top Locations', icon: MapIcon },
    { key: 'costs', label: 'Cost Analysis', icon: CurrencyDollarIcon, description: 'Investment analysis for accessibility improvements' },
    { key: 'timeline', label: 'Timeline View', icon: ClockIcon, description: 'Implementation schedules and project phases' },
    { key: 'vulnerability', label: 'Vulnerability Map', icon: UserGroupIcon, description: 'Population impact and demographic analysis' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (activeChart) {
      case 'types':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.issueTypeData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="type" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'locations':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.locationData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="location" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={10}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="critical" stackId="a" fill={COLORS.critical} />
              <Bar dataKey="high" stackId="a" fill={COLORS.high} />
              <Bar dataKey="moderate" stackId="a" fill={COLORS.moderate} />
              <Bar dataKey="low" stackId="a" fill={COLORS.low} />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'costs':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">💰 Cost Analysis Overview</h4>
              <p className="text-sm text-blue-800">
                Investment analysis for accessibility improvements. Each point represents a recommendation plotted by estimated cost vs. expected impact.
                Higher positions indicate greater community impact, while right positions show higher investment requirements.
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={chartData.costData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  type="number" 
                  dataKey="cost" 
                  name="Cost" 
                  unit="$"
                  domain={['dataMin', 'dataMax']}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`}
                />
                <YAxis 
                  type="number" 
                  dataKey="impact" 
                  name="Impact"
                  domain={[0, 4]}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => ['Low', 'Medium', 'High'][value - 1] || ''}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl">
                          <p className="font-semibold text-gray-900 mb-2">{data.title}</p>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">💵 Cost: ${data.cost.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">📈 Impact: {data.impact === 3 ? 'High' : data.impact === 2 ? 'Medium' : 'Low'}</p>
                            <p className="text-sm text-gray-600">🏷️ Type: {data.type}</p>
                            <p className="text-sm text-gray-600">⭐ Priority: {data.priority}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Accessibility Investments" dataKey="impact" fill="#2563EB" fillOpacity={0.7} r={6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        );

      case 'timeline':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">📅 Implementation Timeline</h4>
              <p className="text-sm text-green-800">
                Project phases and implementation schedules. This chart shows the expected duration for each accessibility improvement, 
                helping you plan resources and coordinate multiple projects effectively.
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="title" 
                  fontSize={10} 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fill: '#374151' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#374151' }}
                  label={{ value: 'Months', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl">
                          <p className="font-semibold text-gray-900 mb-2">{label}</p>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">⏱️ Duration: {data.months} months</p>
                            <p className="text-sm text-gray-600">💰 Budget: ${data.cost.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">📊 Impact Level: {data.impact === 3 ? 'High' : data.impact === 2 ? 'Medium' : 'Low'}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="months" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case 'vulnerability':
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">👥 Vulnerability Analysis</h4>
              <p className="text-sm text-purple-800">
                Population impact and demographic analysis. This map shows the relationship between vulnerable populations (elderly and disabled residents) 
                and accessibility issues. Areas with higher percentages and more issues require prioritized attention.
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={chartData.vulnerabilityData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  type="number" 
                  dataKey="elderly" 
                  name="Elderly %"
                  domain={[0, 'dataMax + 5']}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Elderly Population (%)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="disabled" 
                  name="Disabled %"
                  domain={[0, 'dataMax + 5']}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Disabled Population (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl">
                          <p className="font-semibold text-gray-900 mb-2">📍 {data.location}</p>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">👴 Elderly: {data.elderly.toFixed(1)}%</p>
                            <p className="text-sm text-gray-600">♿ Disabled: {data.disabled.toFixed(1)}%</p>
                            <p className="text-sm text-gray-600">⚠️ Issues: {data.issues}</p>
                            <p className="text-sm text-gray-600">🚨 Severity: {data.severity}</p>
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-500">
                                Priority: {(data.elderly > 20 || data.disabled > 15) ? 'High' : 
                                         (data.elderly > 15 || data.disabled > 10) ? 'Medium' : 'Standard'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter 
                  name="Community Areas" 
                  dataKey="disabled" 
                  fill="#8B5CF6"
                  fillOpacity={0.7}
                  r={8}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">Interactive Analytics</h2>
          </div>
          <div className="flex items-center space-x-2">
            <EyeIcon className="h-5 w-5 text-white/80" />
            <span className="text-white/80 text-sm">Live Data</span>
          </div>
        </div>
      </div>

      {/* Chart Navigation */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex overflow-x-auto">
          {chartOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.key}
                onClick={() => setActiveChart(option.key)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${
                  activeChart === option.key
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title={option.description || option.label}
              >
                <IconComponent className="h-4 w-4" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeChart}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {renderChart()}
          </motion.div>
        </AnimatePresence>

        {/* Chart Insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Total Issues</p>
                <p className="text-2xl font-bold text-blue-600">
                  {results?.scan_results?.length || 0}
                </p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">Recommendations</p>
                <p className="text-2xl font-bold text-purple-600">
                  {results?.recommendations?.length || 0}
                </p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Priority Areas</p>
                <p className="text-2xl font-bold text-green-600">
                  {results?.priority_areas?.length || 0}
                </p>
              </div>
              <MapIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InteractiveCharts;
