import React, { useState, useEffect } from 'react';
import {
  ChatBubbleLeftRightIcon,
  EyeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

// Agent chat log for WatsonX multi-agent communication
const agentChatLog = [
  {
    id: 1,
    timestamp: new Date().toISOString(),
    agent: 'AccessScanner',
    type: 'analysis',
    message: 'Starting accessibility scan for California locations...',
    status: 'completed',
    details: {
      locations_scanned: 1531,
      issues_found: 287,
      processing_time: '2.3s'
    }
  },
  {
    id: 2,
    timestamp: new Date().toISOString(),
    agent: 'EquityAdvisor',
    type: 'recommendation',
    message: 'Analyzing demographic data and vulnerability factors...',
    status: 'completed',
    details: {
      vulnerable_populations_identified: 156,
      equity_factors_analyzed: 8,
      recommendations_generated: 12
    }
  },
  {
    id: 3,
    timestamp: new Date().toISOString(),
    agent: 'PlannerBot',
    type: 'planning',
    message: 'Creating implementation timeline and priority ranking...',
    status: 'completed',
    details: {
      priority_areas_ranked: 45,
      timeline_created: '18-month plan',
      budget_estimated: '$8.2M'
    }
  }
];

const ChatLogPage = () => {
  const [chatLog, setChatLog] = useState([]);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState('all');

  useEffect(() => {
    // Simulate loading chat log
    setTimeout(() => {
      setChatLog(agentChatLog);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getAgentIcon = (agent) => {
    switch (agent) {
      case 'AccessScanner':
        return <EyeIcon className="h-5 w-5" />;
      case 'EquityAdvisor':
        return <UserGroupIcon className="h-5 w-5" />;
      case 'PlannerBot':
        return <CheckCircleIcon className="h-5 w-5" />;
      default:
        return <CpuChipIcon className="h-5 w-5" />;
    }
  };

  const getAgentColor = (agent) => {
    switch (agent) {
      case 'AccessScanner':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'EquityAdvisor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'PlannerBot':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredChatLog = chatLog.filter(entry => 
    selectedAgent === 'all' || entry.agent === selectedAgent
  );

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI Agent Chat Log</h1>
          </div>
          <p className="text-lg text-gray-600">
            Real-time communication and reasoning from AccessMap.AI's multi-agent system.
            See how each AI agent processes information and makes decisions.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by Agent:</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Agents</option>
              <option value="AccessScanner">AccessScanner</option>
              <option value="EquityAdvisor">EquityAdvisor</option>
              <option value="PlannerBot">PlannerBot</option>
            </select>
          </div>
        </div>

        {/* Agent Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-400">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <EyeIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900">AccessScanner</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">Computer vision analysis</p>
            <div className="text-2xl font-bold text-red-600">
              {chatLog.filter(entry => entry.agent === 'AccessScanner').length}
            </div>
            <div className="text-xs text-gray-500">Messages</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900">EquityAdvisor</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">Demographic analysis</p>
            <div className="text-2xl font-bold text-yellow-600">
              {chatLog.filter(entry => entry.agent === 'EquityAdvisor').length}
            </div>
            <div className="text-xs text-gray-500">Messages</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">PlannerBot</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">Solution generation</p>
            <div className="text-2xl font-bold text-green-600">
              {chatLog.filter(entry => entry.agent === 'PlannerBot').length}
            </div>
            <div className="text-xs text-gray-500">Messages</div>
          </div>
        </div>

        {/* Chat Timeline */}
        <div className="space-y-6">
          {filteredChatLog.map((entry, index) => (
            <div key={entry.id} className="relative">
              {/* Timeline Line */}
              {index < filteredChatLog.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-full bg-gray-200 -z-10"></div>
              )}
              
              {/* Chat Entry */}
              <div className="bg-white rounded-lg shadow-lg p-6 ml-12 relative">
                {/* Agent Avatar */}
                <div className={`absolute -left-6 top-6 w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${getAgentColor(entry.agent)}`}>
                  {getAgentIcon(entry.agent)}
                </div>

                {/* Entry Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-gray-900">{entry.agent}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getAgentColor(entry.agent)}`}>
                      AI Agent
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4" />
                    <span>{formatTimestamp(entry.timestamp)}</span>
                  </div>
                </div>

                {/* Message */}
                <div className="mb-4">
                  <p className="text-gray-800 font-medium">{entry.message}</p>
                </div>

                {/* Data Summary */}
                {entry.data && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Processing Results:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {Object.entries(entry.data).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-gray-500 capitalize">
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <span className="ml-1 font-medium text-gray-900">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reasoning Toggle */}
                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={() => toggleExpanded(entry.id)}
                    className="flex items-center space-x-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
                  >
                    {expandedItems.has(entry.id) ? (
                      <ChevronDownIcon className="h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4" />
                    )}
                    <InformationCircleIcon className="h-4 w-4" />
                    <span>Show AI Reasoning</span>
                  </button>

                  {/* Expanded Reasoning */}
                  {expandedItems.has(entry.id) && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">AI</span>
                        </div>
                        <h4 className="font-medium text-blue-900">Explainable AI Reasoning:</h4>
                      </div>
                      <p className="text-blue-800 text-sm leading-relaxed">
                        {entry.reasoning}
                      </p>
                      
                      {/* Technical Details */}
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <h5 className="text-xs font-medium text-blue-700 mb-2">Technical Process:</h5>
                        <div className="text-xs text-blue-600 space-y-1">
                          <div>• Model: IBM watsonx.ai</div>
                          <div>• Framework: LangChain multi-agent system</div>
                          <div>• Confidence: {entry.data && entry.data.confidence_avg ? Math.round(entry.data.confidence_avg * 100) : 'N/A'}%</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SDG Callout */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <h4 className="font-medium text-blue-900">Explainable AI for Transparency</h4>
          </div>
          <p className="text-sm text-blue-800">
            This chat log demonstrates explainable AI principles, showing how each agent processes information 
            and makes decisions. This transparency supports accountable AI governance and builds trust in 
            automated urban planning recommendations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatLogPage;
