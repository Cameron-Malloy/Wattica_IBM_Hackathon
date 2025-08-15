import React, { useState, useEffect, useRef } from 'react';
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
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  LightBulbIcon,
  ChartBarIcon,
  GlobeAltIcon,
  HeartIcon,
  BoltIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  CogIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon as ClockIconSolid
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const AIAdvisorPage = () => {
  const {
    results,
    loading,
    error,
    isConnected,
    getLatestResults
  } = useApi();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedGap, setSelectedGap] = useState(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [chatMode, setChatMode] = useState('general'); // general, gap-analysis, recommendation-planning
  const [showDataPanel, setShowDataPanel] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isConnected) {
      getLatestResults('CA');
      // Add welcome message
      setMessages([
        {
          id: 'welcome',
          type: 'ai',
          content: `👋 Welcome to AccessMap AI Advisor! I'm your intelligent assistant for accessibility planning and analysis.

I can help you with:
• 📊 Analyzing equity gaps and accessibility issues
• 🎯 Exploring detailed recommendations and implementation plans
• 💡 Providing insights on accessibility improvements
• 📍 Understanding location-specific challenges
• 🤝 Community engagement strategies

What would you like to explore today?`,
          timestamp: new Date(),
          data: null
        }
      ]);
    }
  }, [isConnected, getLatestResults]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'infrastructure':
        return <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />;
      case 'tech':
        return <ComputerDesktopIcon className="h-5 w-5 text-purple-600" />;
      case 'policy':
        return <DocumentTextIcon className="h-5 w-5 text-green-600" />;
      case 'community':
        return <UsersIcon className="h-5 w-5 text-orange-600" />;
      default:
        return <LightBulbIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity) => {
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

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Call real WatsonX chatbot API
      const response = await fetch('http://localhost:8003/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          history: messages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          context: {
            selectedGap,
            selectedRecommendation,
            chatMode,
            results: results ? {
              gaps_count: results.scan_results?.length || 0,
              recommendations_count: results.recommendations?.length || 0,
              priority_areas_count: results.priority_areas?.length || 0
            } : {}
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: data.message,
        timestamp: new Date(),
        data: data.context_used,
        suggestions: data.suggestions || []
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Chatbot error:', error);
      
      // Fallback response
      const fallbackResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: `I apologize, but I'm having trouble connecting to my AI services right now. Please try again in a moment, or you can explore the accessibility data using the panel on the right.`,
        timestamp: new Date(),
        data: null
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };



  const handleGapSelection = (gap) => {
    setSelectedGap(gap);
    setChatMode('gap-analysis');
    setShowDataPanel(true);
  };

  const handleRecommendationSelection = (rec) => {
    setSelectedRecommendation(rec);
    setChatMode('recommendation-planning');
    setShowDataPanel(true);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Backend Not Connected</h2>
          <p className="text-gray-600">Please ensure the backend server is running.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Accessibility Advisor
                </h1>
                <p className="text-gray-600">Your intelligent assistant for accessibility planning</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowDataPanel(!showDataPanel)}
                className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                  showDataPanel 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                {showDataPanel ? 'Hide Data' : 'Show Data'}
              </button>
              
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">AI Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Chat Messages */}
              <div className="h-[600px] overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`rounded-2xl px-4 py-3 ${
                          message.type === 'user' 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          
                          {/* AI Suggestions */}
                          {message.type === 'ai' && message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs text-gray-500">💡 Suggested follow-ups:</p>
                              <div className="flex flex-wrap gap-2">
                                {message.suggestions.map((suggestion, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setInputMessage(suggestion);
                                      handleSendMessage();
                                    }}
                                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      
                      {message.type === 'ai' && (
                        <div className="order-1 mr-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <SparklesIcon className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="order-1 mr-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <SparklesIcon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="order-2">
                      <div className="bg-gray-100 rounded-2xl px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me about accessibility gaps, recommendations, or planning..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Data Panel */}
          <AnimatePresence>
            {showDataPanel && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="lg:col-span-1"
              >
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 space-y-6">
                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BoltIcon className="h-5 w-5 mr-2 text-blue-600" />
                      Quick Actions
                    </h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setInputMessage("Show me a critical accessibility gap");
                          handleSendMessage();
                        }}
                        className="w-full text-left p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                          <span className="font-medium text-red-800">Critical Gaps</span>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          setInputMessage("What are the latest recommendations?");
                          handleSendMessage();
                        }}
                        className="w-full text-left p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <LightBulbIcon className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="font-medium text-blue-800">Recommendations</span>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          setInputMessage("Create an implementation plan");
                          handleSendMessage();
                        }}
                        className="w-full text-left p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <CogIcon className="h-5 w-5 text-green-600 mr-2" />
                          <span className="font-medium text-green-800">Implementation</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Data Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <ChartBarIcon className="h-5 w-5 mr-2 text-purple-600" />
                      Data Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Accessibility Gaps</span>
                        <span className="font-semibold text-gray-900">{results?.scan_results?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Priority Areas</span>
                        <span className="font-semibold text-gray-900">{results?.priority_areas?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Recommendations</span>
                        <span className="font-semibold text-gray-900">{results?.recommendations?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Gaps */}
                  {results?.scan_results?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-600" />
                        Recent Gaps
                      </h3>
                      <div className="space-y-2">
                        {results.scan_results.slice(0, 3).map((gap, index) => (
                          <button
                            key={index}
                            onClick={() => handleGapSelection(gap)}
                            className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900 text-sm">
                                {gap.issue?.type?.replace(/_/g, ' ').toUpperCase()}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(gap.severity)}`}>
                                {gap.severity}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">{gap.location?.city || 'Unknown location'}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Recommendations */}
                  {results?.recommendations?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-600" />
                        Recent Recommendations
                      </h3>
                      <div className="space-y-2">
                        {results.recommendations.slice(0, 3).map((rec, index) => (
                          <button
                            key={index}
                            onClick={() => handleRecommendationSelection(rec)}
                            className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center">
                                {getTypeIcon(rec.type)}
                                <span className="font-medium text-gray-900 text-sm ml-2">
                                  {rec.type?.toUpperCase()}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">{rec.priority}</span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">{rec.title}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selected Item Details */}
        <AnimatePresence>
          {(selectedGap || selectedRecommendation) && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="mt-6"
            >
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedGap ? 'Gap Analysis' : 'Recommendation Details'}
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedGap(null);
                      setSelectedRecommendation(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {selectedGap && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Issue Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">Type</span>
                          <span className="font-medium text-gray-900">
                            {selectedGap.issue?.type?.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">Severity</span>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(selectedGap.severity)}`}>
                            {selectedGap.severity}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">Location</span>
                          <span className="font-medium text-gray-900">{selectedGap.location?.city || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Impact Analysis</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <UserGroupIcon className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="font-medium text-blue-900">Affected Groups</span>
                          </div>
                          <p className="text-sm text-blue-800">
                            {selectedGap.demographics?.mobility_needs?.join(', ') || 'Community members'}
                          </p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <ClockIcon className="h-4 w-4 text-orange-600 mr-2" />
                            <span className="font-medium text-orange-900">Daily Impact</span>
                          </div>
                          <p className="text-sm text-orange-800">
                            {selectedGap.impact?.daily_impact || 'High impact on daily activities'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedRecommendation && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Recommendation Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">Type</span>
                          <div className="flex items-center">
                            {getTypeIcon(selectedRecommendation.type)}
                            <span className="font-medium text-gray-900 ml-2">
                              {selectedRecommendation.type?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">Priority</span>
                          <span className="font-medium text-gray-900">{selectedRecommendation.priority}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">Cost Estimate</span>
                          <span className="font-medium text-gray-900">{selectedRecommendation.cost_estimate}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">Timeline</span>
                          <span className="font-medium text-gray-900">{selectedRecommendation.timeline}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Implementation Plan</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <CalendarIcon className="h-4 w-4 text-green-600 mr-2" />
                            <span className="font-medium text-green-900">Timeline</span>
                          </div>
                          <p className="text-sm text-green-800">{selectedRecommendation.timeline}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <CurrencyDollarIcon className="h-4 w-4 text-purple-600 mr-2" />
                            <span className="font-medium text-purple-900">Budget</span>
                          </div>
                          <p className="text-sm text-purple-800">{selectedRecommendation.cost_estimate}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <UsersIcon className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="font-medium text-blue-900">Partners</span>
                          </div>
                          <p className="text-sm text-blue-800">
                            {selectedRecommendation.implementation_partners?.slice(0, 3).join(', ')}...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      const message = selectedGap 
                        ? `Tell me more about this ${selectedGap.issue?.type} gap in ${selectedGap.location?.city}`
                        : `Create a detailed implementation plan for ${selectedRecommendation.title}`;
                      setInputMessage(message);
                      handleSendMessage();
                    }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    Ask AI for Detailed Analysis
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIAdvisorPage;
