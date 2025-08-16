import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '../contexts/ApiContext';
import { useLocation, useSearchParams } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import InteractiveCharts from '../components/InteractiveCharts';

import ClickableGapsGrid from '../components/ClickableGapsGrid';

import EnhancedRecommendations from '../components/EnhancedRecommendations';
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
  ClockIcon as ClockIconSolid,
  Squares2X2Icon,
  PresentationChartBarIcon,
  MapIcon,
  WrenchIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  ChevronDownIcon,
  BookmarkIcon,
  CheckIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// EditPlanForm Component
const EditPlanForm = ({ plan, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: plan.title || '',
    description: plan.description || '',
    cost_estimate: plan.cost_estimate || '',
    timeline: plan.timeline || '',
    priority_level: plan.priority_level || 'medium',
    type: plan.type || 'ai_generated',
    implementation_notes: plan.implementation_notes || '',
    success_metrics: plan.success_metrics || '',
    stakeholders: plan.stakeholders || '',
    risks_mitigation: plan.risks_mitigation || '',
    // Additional fields that may be present in saved chat recommendations
    expected_impact: plan.expected_impact || '',
    implementation_partners: Array.isArray(plan.implementation_partners) 
      ? plan.implementation_partners.join(', ') 
      : (plan.implementation_partners || ''),
    recommended_actions: Array.isArray(plan.recommended_actions) 
      ? plan.recommended_actions.join('\n') 
      : (plan.recommended_actions || ''),
    target_locations: Array.isArray(plan.target_locations) 
      ? plan.target_locations.join(', ') 
      : (plan.target_locations || ''),
    sdg_alignment: plan.sdg_alignment || '',
    equity_impact: plan.equity_impact || '',
    locations_affected: plan.locations_affected || '',
    impact: plan.impact || '',
    source: plan.source || '',
    agent: plan.agent || '',
    implementation_progress: plan.implementation_progress || 0
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert string fields back to arrays where appropriate
    const processedData = {
      ...formData,
      implementation_partners: formData.implementation_partners 
        ? formData.implementation_partners.split(',').map(s => s.trim()).filter(s => s)
        : [],
      recommended_actions: formData.recommended_actions 
        ? formData.recommended_actions.split('\n').map(s => s.trim()).filter(s => s)
        : [],
      target_locations: formData.target_locations 
        ? formData.target_locations.split(',').map(s => s.trim()).filter(s => s)
        : [],
      last_updated: new Date().toISOString(),
      edited: true
    };
    
    onSave(processedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plan Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter plan title..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detailed description of the implementation plan..."
          />
        </div>
      </div>

      {/* Cost, Timeline, and Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cost Estimate
          </label>
          <input
            type="text"
            value={formData.cost_estimate}
            onChange={(e) => handleChange('cost_estimate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., $50,000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeline
          </label>
          <input
            type="text"
            value={formData.timeline}
            onChange={(e) => handleChange('timeline', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 6 months"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority Level
          </label>
          <select
            value={formData.priority_level}
            onChange={(e) => handleChange('priority_level', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Implementation Progress
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={formData.implementation_progress}
              onChange={(e) => handleChange('implementation_progress', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">0%</span>
              <span className={`text-sm font-medium px-2 py-1 rounded ${
                formData.implementation_progress === 0 ? 'bg-gray-100 text-gray-600' :
                formData.implementation_progress < 25 ? 'bg-red-100 text-red-700' :
                formData.implementation_progress < 50 ? 'bg-yellow-100 text-yellow-700' :
                formData.implementation_progress < 75 ? 'bg-blue-100 text-blue-700' :
                formData.implementation_progress < 100 ? 'bg-green-100 text-green-700' :
                'bg-green-200 text-green-800'
              }`}>
                {formData.implementation_progress}%
              </span>
              <span className="text-xs text-gray-500">100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recommended Actions
          </label>
          <textarea
            value={formData.recommended_actions}
            onChange={(e) => handleChange('recommended_actions', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter each action on a new line..."
          />
          <p className="text-xs text-gray-500 mt-1">Enter each action on a separate line</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Implementation Notes
          </label>
          <textarea
            value={formData.implementation_notes}
            onChange={(e) => handleChange('implementation_notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Specific implementation steps, requirements, or considerations..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Impact
          </label>
          <textarea
            value={formData.expected_impact}
            onChange={(e) => handleChange('expected_impact', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the expected impact and benefits..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Success Metrics
          </label>
          <textarea
            value={formData.success_metrics}
            onChange={(e) => handleChange('success_metrics', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="How will success be measured? Key performance indicators..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Stakeholders
            </label>
            <input
              type="text"
              value={formData.stakeholders}
              onChange={(e) => handleChange('stakeholders', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="City council, contractors, community groups..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Implementation Partners
            </label>
            <input
              type="text"
              value={formData.implementation_partners}
              onChange={(e) => handleChange('implementation_partners', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Separate partners with commas..."
            />
            <p className="text-xs text-gray-500 mt-1">Separate partners with commas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Locations
            </label>
            <input
              type="text"
              value={formData.target_locations}
              onChange={(e) => handleChange('target_locations', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Los Angeles, San Francisco..."
            />
            <p className="text-xs text-gray-500 mt-1">Separate locations with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Locations Affected
            </label>
            <input
              type="text"
              value={formData.locations_affected}
              onChange={(e) => handleChange('locations_affected', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Number or description of affected locations..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Equity Impact
          </label>
          <textarea
            value={formData.equity_impact}
            onChange={(e) => handleChange('equity_impact', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="How does this plan address equity and serve vulnerable populations?"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SDG Alignment
            </label>
            <input
              type="text"
              value={formData.sdg_alignment}
              onChange={(e) => handleChange('sdg_alignment', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="SDG 11.2: Accessible transportation..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Impact Level
            </label>
            <select
              value={formData.impact}
              onChange={(e) => handleChange('impact', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Impact Level</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Risks & Mitigation
          </label>
          <textarea
            value={formData.risks_mitigation}
            onChange={(e) => handleChange('risks_mitigation', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Potential risks and how to mitigate them..."
          />
        </div>

        {/* Read-only metadata fields */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Metadata (Read-only)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Source</label>
              <input
                type="text"
                value={formData.source}
                readOnly
                className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Agent</label>
              <input
                type="text"
                value={formData.agent}
                readOnly
                className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Plan Type</label>
              <input
                type="text"
                value={formData.type}
                readOnly
                className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-gray-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

const AIAdvisorPage = () => {
  const {
    results,
    loading,
    error,
    isConnected,
    getLatestResults,
    surveySubmissions,
    addRecommendation,
    updateRecommendation,
    addSavedChatRecommendation,
    updateSavedChatRecommendation,
    updateRecommendationProgress,
    savedChatRecommendations
  } = useApi();
  
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedGap, setSelectedGap] = useState(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [chatMode, setChatMode] = useState('general'); // general, gap-analysis, recommendation-planning
  const [showDataPanel, setShowDataPanel] = useState(true); // Changed: now open by default
  const [activeVisualization, setActiveVisualization] = useState('gaps'); // charts, mindmap, gaps, planning, recommendations, saved
  const [showVisualizationPanel, setShowVisualizationPanel] = useState(false); // Changed: now closed by default
  const [showLandingScreen, setShowLandingScreen] = useState(true); // New: landing screen state
  const [showImplementationPlan, setShowImplementationPlan] = useState(false);
  const [selectedSavedRec, setSelectedSavedRec] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [continuingConversationFor, setContinuingConversationFor] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const messagesEndRef = useRef(null);

  // Handle URL parameters for direct navigation
  useEffect(() => {
    const tab = searchParams.get('tab');
    const recId = searchParams.get('rec');
    
    if (tab) {
      setActiveVisualization(tab);
    }
    
    if (recId && results?.recommendations) {
      const targetRecommendation = results.recommendations.find(rec => 
        rec.id === recId || rec.title?.includes(recId)
      );
      
      if (targetRecommendation) {
        setSelectedRecommendation(targetRecommendation);
        // If we're on recommendations tab, we might want to show the detail modal
        if (tab === 'recommendations') {
          // We'll handle opening the detail modal in the EnhancedRecommendations component
          console.log('Target recommendation found:', targetRecommendation);
        }
      }
    }
  }, [searchParams, results?.recommendations, setActiveVisualization]);

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

  // Debug: Log saved recommendations when they change
  useEffect(() => {
    console.log('AI Advisor - savedChatRecommendations changed:', savedChatRecommendations);
    console.log('AI Advisor - count:', savedChatRecommendations.length);
  }, [savedChatRecommendations]);

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

      // If we're continuing a conversation, update the saved recommendation
      if (continuingConversationFor) {
        updateRecommendationFromAIResponse(continuingConversationFor, data.message, inputMessage);
      }
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

  const handleStartConversation = (message, context) => {
    setInputMessage(message);
    if (context) {
      if (context.issue_type) {
        setSelectedGap(context);
        setChatMode('gap-analysis');
      } else if (context.title) {
        setSelectedRecommendation(context);
        setChatMode('recommendation-planning');
      }
    }
    // Automatically send the message
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleVisualizationClick = (item) => {
    if (item.issue_type) {
      handleGapSelection(item);
    } else if (item.title) {
      handleRecommendationSelection(item);
    }
  };

  const handleCreateDetailedPlan = (recommendations) => {
    const message = `I'd like to create a comprehensive implementation plan that combines these recommendations: ${recommendations.map(r => r.title).slice(0, 3).join(', ')}. Please help me create a detailed timeline with phases, milestones, resource requirements, and stakeholder coordination.`;
    handleStartConversation(message, null);
  };

  const handlePlanUpdate = (planNode) => {
    toast.success('Plan item added successfully!');
    // You can add additional logic here to sync with backend if needed
  };

  const updateRecommendationFromAIResponse = (recommendationId, aiResponse, userQuestion) => {
    // Parse the AI response for updates
    const costMatch = aiResponse.match(/\$[\d,]+(?:\.\d{2})?/);
    const timelineMatch = aiResponse.match(/(\d+)\s*(weeks?|months?|years?|days?)/i);
    const priorityMatch = aiResponse.match(/(high|medium|low|critical)\s*priority/i);
    
    // Extract implementation notes
    const implementationMatch = aiResponse.match(/implementation:?\s*([^.]+)/gi);
    const stepsMatch = aiResponse.match(/steps?:?\s*([^.]+)/gi);
    
    // Extract success metrics
    const metricsMatch = aiResponse.match(/metrics?:?\s*([^.]+)/gi);
    const measureMatch = aiResponse.match(/measure:?\s*([^.]+)/gi);
    
    // Extract stakeholders
    const stakeholderMatch = aiResponse.match(/stakeholders?:?\s*([^.]+)/gi);
    const partnersMatch = aiResponse.match(/partners?:?\s*([^.]+)/gi);
    
    // Extract risks
    const riskMatch = aiResponse.match(/risks?:?\s*([^.]+)/gi);
    const challengesMatch = aiResponse.match(/challenges?:?\s*([^.]+)/gi);
    
    const updates = {
      last_updated: new Date().toISOString(),
      ai_updated: true,
      chat_context: {
        ...savedChatRecommendations.find(rec => rec.id === recommendationId)?.chat_context,
        conversation_history: [
          ...(savedChatRecommendations.find(rec => rec.id === recommendationId)?.chat_context?.conversation_history || []),
          {
            user_question: userQuestion,
            ai_response: aiResponse,
            timestamp: new Date().toISOString()
          }
        ]
      }
    };

    // Update specific fields if found in the response
    if (costMatch) {
      updates.cost_estimate = costMatch[0];
    }
    if (timelineMatch) {
      updates.timeline = `${timelineMatch[1]} ${timelineMatch[2]}`;
    }
    if (priorityMatch) {
      updates.priority_level = priorityMatch[1].toLowerCase();
    }
    
    // Update implementation notes
    if (implementationMatch || stepsMatch) {
      const currentRec = savedChatRecommendations.find(rec => rec.id === recommendationId);
      const existingNotes = currentRec?.implementation_notes || '';
      const newNotes = [...(implementationMatch || []), ...(stepsMatch || [])].join(' ');
      updates.implementation_notes = existingNotes ? `${existingNotes}\n\n🤖 AI Added: ${newNotes}` : newNotes;
    }
    
    // Update success metrics
    if (metricsMatch || measureMatch) {
      const currentRec = savedChatRecommendations.find(rec => rec.id === recommendationId);
      const existingMetrics = currentRec?.success_metrics || '';
      const newMetrics = [...(metricsMatch || []), ...(measureMatch || [])].join(' ');
      updates.success_metrics = existingMetrics ? `${existingMetrics}\n\n🤖 AI Added: ${newMetrics}` : newMetrics;
    }
    
    // Update stakeholders
    if (stakeholderMatch || partnersMatch) {
      const currentRec = savedChatRecommendations.find(rec => rec.id === recommendationId);
      const existingStakeholders = currentRec?.stakeholders || '';
      const newStakeholders = [...(stakeholderMatch || []), ...(partnersMatch || [])].join(', ');
      updates.stakeholders = existingStakeholders ? `${existingStakeholders}, ${newStakeholders}` : newStakeholders;
    }
    
    // Update risks and mitigation
    if (riskMatch || challengesMatch) {
      const currentRec = savedChatRecommendations.find(rec => rec.id === recommendationId);
      const existingRisks = currentRec?.risks_mitigation || '';
      const newRisks = [...(riskMatch || []), ...(challengesMatch || [])].join(' ');
      updates.risks_mitigation = existingRisks ? `${existingRisks}\n\n🤖 AI Added: ${newRisks}` : newRisks;
    }

    // Update the description with additional context if it's substantial
    if (aiResponse.length > 50) {
      const currentRec = savedChatRecommendations.find(rec => rec.id === recommendationId);
      updates.description = currentRec?.description + '\n\n--- 🤖 AI Update ---\n' + aiResponse;
    }

    updateSavedChatRecommendation(recommendationId, updates);
    
    // Also update the original recommendation if it exists in results
    const savedRec = savedChatRecommendations.find(rec => rec.id === recommendationId);
    if (savedRec && updateRecommendation) {
      updateRecommendation(savedRec, {
        ...updates,
        ai_updated: true
      });
    }
    
    toast.success('Recommendation updated with AI insights!');
  };

  const handleSaveChatbotResponse = (message) => {
    // Parse the AI response to create a structured recommendation
    const lines = message.content.split('\n').filter(line => line.trim());
    const title = lines[0]?.substring(0, 100) || 'AI Generated Recommendation';
    const description = message.content;
    
    // Try to extract key details from the response
    const costMatch = message.content.match(/\$[\d,]+(?:\.\d{2})?/);
    const timelineMatch = message.content.match(/(\d+)\s*(weeks?|months?|years?)/i);
    const priorityMatch = message.content.match(/(high|medium|low|critical)\s*priority/i);
    
    const recommendation = {
      title: title,
      description: description,
      type: 'ai_generated',
      priority_level: priorityMatch ? priorityMatch[1].toLowerCase() : 'medium',
      cost_estimate: costMatch ? costMatch[0] : 'TBD',
      timeline: timelineMatch ? `${timelineMatch[1]} ${timelineMatch[2]}` : 'TBD',
      source: 'ai_chatbot',
      ai_response: true,
      saved_at: new Date().toISOString(),
      chat_context: {
        user_question: messages[messages.length - 2]?.content || '',
        ai_response: message.content,
        conversation_id: message.id
      }
    };
    
    if (!addRecommendation) {
      toast.error('Unable to save recommendation - function not available');
      return;
    }
    
    const savedRec = addRecommendation(recommendation);
    
    // Add to saved recommendations list for the AI Advisor (persistent storage)
    addSavedChatRecommendation(savedRec);
    
    toast.success('AI response saved to your Implementation Plan! View it in the dropdown or Dashboard.');
    
    // Mark the message as saved
    setMessages(prev => prev.map(msg => 
      msg.id === message.id ? { ...msg, saved: true } : msg
    ));
    
    return savedRec;
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
                  AccessMap Dashboard
                </h1>
                <p className="text-gray-600">Turning Data into Access-First Action with IBM WatsonX</p>
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
{showDataPanel ? 'Hide Stats' : 'Stats'}
              </button>

              <button
                onClick={() => setShowVisualizationPanel(!showVisualizationPanel)}
                className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                  showVisualizationPanel 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <PresentationChartBarIcon className="h-4 w-4 mr-2" />
{showVisualizationPanel ? 'Hide AI Data' : 'AI Data'}
              </button>
              
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">WatsonX Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Landing Screen */}
        <AnimatePresence>
          {showLandingScreen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl text-white overflow-hidden relative"
            >
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-500/20 to-indigo-600/20"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
              
              <div className="relative z-10 px-8 py-16 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 overflow-hidden">
                    <img 
                      src="/access-map-logo.png" 
                      alt="AccessMap Logo" 
                      className="w-16 h-16 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    {/* Fallback logo */}
                    <div className="w-16 h-16 bg-white/20 rounded-xl hidden items-center justify-center relative overflow-hidden">
                      {/* Roads/Infrastructure */}
                      <div className="absolute inset-0">
                        <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-white/80 transform -translate-y-1/2"></div>
                        <div className="absolute top-0 bottom-0 left-1/2 w-1.5 bg-white/80 transform -translate-x-1/2"></div>
                      </div>
                      {/* Green hills */}
                      <div className="absolute top-1 left-1 w-4 h-4 bg-green-400 rounded-full"></div>
                      <div className="absolute top-1 right-1 w-4 h-4 bg-green-400 rounded-full"></div>
                      {/* Amber area with AM */}
                      <div className="absolute bottom-1 left-2 right-2 h-3 bg-amber-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">AM</span>
                      </div>
                    </div>
                  </div>
                  <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Welcome to AccessMap
                  </h1>
                  <p className="text-2xl font-light mb-2 text-blue-100">
                    Turning Data into Access-First Action
                  </p>
                  <p className="text-lg text-blue-200 max-w-2xl mx-auto mb-4">
                    Your intelligent accessibility planning assistant powered by IBM WatsonX. 
                    Discover gaps, explore AI-driven recommendations, and create inclusive communities.
                  </p>
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">11</span>
                    </div>
                    <span className="text-blue-100 text-sm font-medium">Supporting UN SDG Goal 11: Sustainable Cities & Communities</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                  <button
                    onClick={() => {
                      setShowLandingScreen(false);
                      setShowDataPanel(true);
                    }}
                    className="flex items-center space-x-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <ChartBarIcon className="h-5 w-5" />
                    <span>Explore Data & Stats</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowLandingScreen(false);
                      setShowVisualizationPanel(true);
                    }}
                    className="flex items-center space-x-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20"
                  >
                    <PresentationChartBarIcon className="h-5 w-5" />
                    <span>View AI Insights</span>
                  </button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
                >
                  <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <ExclamationTriangleIcon className="h-8 w-8 text-yellow-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-white mb-2">Identify Gaps</h3>
                    <p className="text-blue-100 text-sm">Discover accessibility barriers in your community</p>
                  </div>
                  
                  <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <LightBulbIcon className="h-8 w-8 text-yellow-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-white mb-2">AI Recommendations</h3>
                    <p className="text-blue-100 text-sm">Get intelligent solutions powered by WatsonX</p>
                  </div>
                  
                  <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <CheckCircleIcon className="h-8 w-8 text-green-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-white mb-2">Take Action</h3>
                    <p className="text-blue-100 text-sm">Implement data-driven accessibility improvements</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Visualization Panel */}
        <AnimatePresence>
          {showVisualizationPanel && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
            >
              {/* Visualization Navigation */}
              <div className="border-b border-gray-200 bg-gray-50">
                <div className="flex overflow-x-auto">
                  {[
                    { key: 'gaps', label: 'Accessibility Gaps', icon: ExclamationTriangleIcon },
                    { key: 'charts', label: 'Analytics', icon: ChartBarIcon },
                    { key: 'recommendations', label: 'Recommendations', icon: LightBulbIcon },
                    { key: 'saved', label: 'Saved from Chat', icon: BookmarkIcon }
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveVisualization(tab.key)}
                        className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
                          activeVisualization === tab.key
                            ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visualization Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeVisualization}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {activeVisualization === 'gaps' && (
                      <ClickableGapsGrid 
                        results={results}
                        onGapClick={handleGapSelection}
                        onStartConversation={handleStartConversation}
                      />
                    )}

                    {activeVisualization === 'charts' && (
                      <InteractiveCharts 
                        results={results} 
                        onGapClick={handleVisualizationClick}
                        onRecommendationClick={handleVisualizationClick}
                      />
                    )}





                    {activeVisualization === 'recommendations' && (
                      <EnhancedRecommendations
                        results={results}
                        onRecommendationClick={handleRecommendationSelection}
                        onStartConversation={handleStartConversation}
                        onCreateDetailedPlan={handleCreateDetailedPlan}
                        updateRecommendation={updateRecommendation}
                        updateSavedChatRecommendation={updateSavedChatRecommendation}
                        addSavedChatRecommendation={addSavedChatRecommendation}
                        savedChatRecommendations={savedChatRecommendations}
                        continuingConversationFor={continuingConversationFor}
                        setContinuingConversationFor={setContinuingConversationFor}
                        messages={messages}
                        setMessages={setMessages}
                        urlSelectedRecommendation={selectedRecommendation}
                        searchParams={searchParams}
                      />
                    )}

                    {activeVisualization === 'saved' && (
                      <div className="p-6">
                        <div className="mb-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Saved Chat Recommendations</h3>
                          <p className="text-gray-600">Recommendations saved from your AI conversations</p>
                        </div>

                        {savedChatRecommendations.length === 0 ? (
                          <div className="text-center py-12">
                            <BookmarkIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved recommendations yet</h3>
                            <p className="text-gray-500">Start a conversation with the AI and save responses to build your implementation plan.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {savedChatRecommendations.map((rec, index) => (
                              <motion.div
                                key={rec.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl"
                              >
                                <div className="flex items-start justify-between mb-3">
                                                                  <div className="flex items-center space-x-2">
                                  <SparklesIcon className="h-5 w-5 text-purple-600" />
                                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                    AI Generated
                                  </span>
                                  {rec.edited && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                      ✓ Edited
                                    </span>
                                  )}
                                  {rec.ai_updated && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                      🤖 AI Enhanced
                                    </span>
                                  )}
                                </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(rec.saved_at).toLocaleDateString()}
                                  </span>
                                </div>
                                
                                <h4 className="font-semibold text-gray-900 mb-2">{rec.title}</h4>
                                <p className="text-sm text-gray-700 mb-3 line-clamp-3">{rec.description}</p>
                                
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center space-x-4">
                                    <span className="flex items-center text-green-600">
                                      <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                                      {rec.cost_estimate}
                                    </span>
                                    <span className="flex items-center text-blue-600">
                                      <ClockIcon className="h-3 w-3 mr-1" />
                                      {rec.timeline}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full font-medium ${
                                      rec.priority_level === 'high' || rec.priority_level === 'critical' 
                                        ? 'bg-red-100 text-red-700'
                                        : rec.priority_level === 'medium'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-green-100 text-green-700'
                                    }`}>
                                      {rec.priority_level} priority
                                    </span>
                                  </div>

                                  {/* Progress Section */}
                                  <div className="mt-3 mb-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700">Implementation Progress</span>
                                      <span className={`text-sm font-bold ${
                                        (rec.implementation_progress || 0) === 0 ? 'text-gray-600' :
                                        (rec.implementation_progress || 0) < 25 ? 'text-red-600' :
                                        (rec.implementation_progress || 0) < 50 ? 'text-yellow-600' :
                                        (rec.implementation_progress || 0) < 75 ? 'text-blue-600' :
                                        (rec.implementation_progress || 0) < 100 ? 'text-green-600' :
                                        'text-green-700'
                                      }`}>
                                        {rec.implementation_progress || 0}%
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                      <div 
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                          (rec.implementation_progress || 0) === 0 ? 'bg-gray-400' :
                                          (rec.implementation_progress || 0) < 25 ? 'bg-red-500' :
                                          (rec.implementation_progress || 0) < 50 ? 'bg-yellow-500' :
                                          (rec.implementation_progress || 0) < 75 ? 'bg-blue-500' :
                                          (rec.implementation_progress || 0) < 100 ? 'bg-green-500' :
                                          'bg-green-600'
                                        }`}
                                        style={{ width: `${rec.implementation_progress || 0}%` }}
                                      ></div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="flex space-x-1">
                                        {[0, 25, 50, 75, 100].map((progress) => (
                                          <button
                                            key={progress}
                                            onClick={() => {
                                              updateRecommendationProgress(rec.id, progress);
                                              toast.success(`Progress updated to ${progress}%`);
                                            }}
                                            className={`px-2 py-1 text-xs rounded transition-colors ${
                                              (rec.implementation_progress || 0) === progress
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                          >
                                            {progress}%
                                          </button>
                                        ))}
                                      </div>
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        (rec.implementation_progress || 0) === 0 ? 'bg-gray-100 text-gray-600' :
                                        (rec.implementation_progress || 0) < 25 ? 'bg-red-100 text-red-700' :
                                        (rec.implementation_progress || 0) < 50 ? 'bg-yellow-100 text-yellow-700' :
                                        (rec.implementation_progress || 0) < 75 ? 'bg-blue-100 text-blue-700' :
                                        (rec.implementation_progress || 0) < 100 ? 'bg-green-100 text-green-700' :
                                        'bg-green-200 text-green-800'
                                      }`}>
                                        {(rec.implementation_progress || 0) === 0 ? 'Not Started' :
                                         (rec.implementation_progress || 0) < 25 ? 'Planning' :
                                         (rec.implementation_progress || 0) < 50 ? 'In Progress' :
                                         (rec.implementation_progress || 0) < 75 ? 'Advanced' :
                                         (rec.implementation_progress || 0) < 100 ? 'Near Complete' :
                                         'Completed'}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => {
                                        setSelectedSavedRec(rec);
                                        setShowDetailsModal(true);
                                      }}
                                      className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                                    >
                                      View Details
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <button
                                      onClick={() => {
                                        setContinuingConversationFor(rec.id);
                                        setInputMessage(`Continue our conversation about: ${rec.title}. `);
                                        toast.success('Continue the conversation below. Your next response will update this recommendation!');
                                        // Scroll to chat input
                                        setTimeout(() => {
                                          document.querySelector('input[type="text"]')?.focus();
                                        }, 100);
                                      }}
                                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                    >
                                      Continue Conversation
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

                          {/* Save Button for AI Messages */}
                          {message.type === 'ai' && message.id !== 'welcome' && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <button
                                onClick={() => handleSaveChatbotResponse(message)}
                                disabled={message.saved}
                                className={`flex items-center space-x-2 px-3 py-2 text-xs rounded-lg transition-all ${
                                  message.saved 
                                    ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                              >
                                {message.saved ? (
                                  <>
                                    <CheckIcon className="h-3 w-3" />
                                    <span>Saved to Dashboard</span>
                                  </>
                                ) : (
                                  <>
                                    <BookmarkIcon className="h-3 w-3" />
                                    <span>Save as Recommendation</span>
                                  </>
                                )}
                              </button>
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
                {/* Continuing Conversation Indicator */}
                {continuingConversationFor && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <span className="text-blue-800 text-sm font-medium">
                          Continuing conversation for: {savedChatRecommendations.find(rec => rec.id === continuingConversationFor)?.title}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setContinuingConversationFor(null);
                          toast.success('Stopped continuing conversation. New messages will be independent.');
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Stop
                      </button>
                    </div>
                    <p className="text-blue-600 text-xs mt-1">Your next response will update this recommendation with new information.</p>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={continuingConversationFor ? "Continue the conversation..." : "Ask me about accessibility gaps, recommendations, or planning..."}
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
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200" style={{ height: 'calc(600px + 140px)' }}>
                  <div className="h-full overflow-y-auto">
                  <div className="p-6 space-y-6">
                    {/* Enhanced Data Summary */}
                    <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <ChartBarIcon className="h-6 w-6 mr-3 text-purple-600" />
                        Data Overview
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 ml-9">Analytics powered by IBM WatsonX</p>
                    </div>
                    
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 gap-4 mb-6">
                      <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-red-800">Critical Issues</p>
                            <p className="text-2xl font-bold text-red-600">
                              {results?.scan_results?.filter(gap => gap.severity === 'critical').length || 0}
                            </p>
                          </div>
                          <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-800">Total Gaps</p>
                            <p className="text-2xl font-bold text-blue-600">{results?.scan_results?.length || 0}</p>
                            {results?.scan_results?.filter(gap => gap.survey_based).length > 0 && (
                              <p className="text-xs text-blue-600 mt-1">
                                {results?.scan_results?.filter(gap => gap.survey_based).length} community-reported
                              </p>
                            )}
                          </div>
                          <MapPinIcon className="h-8 w-8 text-blue-500" />
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-800">Solutions</p>
                            <p className="text-2xl font-bold text-green-600">{results?.recommendations?.length || 0}</p>
                            {results?.recommendations?.filter(rec => rec.survey_based).length > 0 && (
                              <p className="text-xs text-green-600 mt-1">
                                {results?.recommendations?.filter(rec => rec.survey_based).length} from surveys
                              </p>
                            )}
                          </div>
                          <LightBulbIcon className="h-8 w-8 text-green-500" />
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-purple-800">Priority Areas</p>
                            <p className="text-2xl font-bold text-purple-600">{results?.priority_areas?.length || 0}</p>
                          </div>
                          <UserGroupIcon className="h-8 w-8 text-purple-500" />
                        </div>
                      </div>
                    </div>

                    {/* Analysis Insights */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <SparklesIcon className="h-5 w-5 mr-2 text-blue-600" />
                        AI Insights
                      </h4>
                      
                    <div className="space-y-3">
                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center mb-2">
                            <ClockIcon className="h-4 w-4 text-yellow-600 mr-2" />
                            <span className="font-medium text-yellow-900">Completion Time</span>
                      </div>
                          <p className="text-sm text-yellow-800">
                            Estimated {Math.round((results?.recommendations?.reduce((sum, r) => {
                              const match = r.timeline?.match(/(\d+)/);
                              return sum + (match ? parseInt(match[1]) : 12);
                            }, 0) || 0) / (results?.recommendations?.length || 1))} months average per project
                          </p>
                      </div>
                        
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center mb-2">
                            <CurrencyDollarIcon className="h-4 w-4 text-green-600 mr-2" />
                            <span className="font-medium text-green-900">Investment Range</span>
                      </div>
                          <p className="text-sm text-green-800">
                            ${Math.round((results?.recommendations?.reduce((sum, r) => {
                              const match = r.cost_estimate?.match(/\$?(\d+(?:,\d+)?)/);
                              return sum + (match ? parseInt(match[1].replace(/,/g, '')) : 50000);
                            }, 0) || 0) / 1000)}K - ${Math.round((results?.recommendations?.reduce((sum, r) => {
                              const match = r.cost_estimate?.match(/\$?(\d+(?:,\d+)?)/);
                              return sum + (match ? parseInt(match[1].replace(/,/g, '')) : 50000);
                            }, 0) || 0) * 1.5 / 1000)}K estimated total
                          </p>
                        </div>
                        
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center mb-2">
                            <ShieldCheckIcon className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="font-medium text-blue-900">Impact Score</span>
                              </div>
                          <p className="text-sm text-blue-800">
                            {results?.recommendations?.filter(r => r.priority === 'High' || r.priority_level === 'High').length || 0} high-impact solutions identified
                          </p>
                            </div>
                      </div>
                    </div>
                  </div>

                  {/* Your Implementation Plan */}
                    <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <ClipboardDocumentCheckIcon className="h-6 w-6 mr-3 text-green-600" />
                        Your Implementation Plan
                      </h3>
                          <button
                        onClick={() => setShowImplementationPlan(!showImplementationPlan)}
                        className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                      >
                        <span className="mr-1">{savedChatRecommendations.length} saved</span>
                        <ChevronDownIcon className={`h-4 w-4 transition-transform ${showImplementationPlan ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {showImplementationPlan && (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {savedChatRecommendations.length === 0 ? (
                          <div className="text-center py-6">
                            <BookmarkIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No recommendations saved yet</p>
                            <p className="text-xs text-gray-400 mt-1">Chat with AI and save responses</p>
                          </div>
                        ) : (
                          savedChatRecommendations.map((rec, index) => (
                            <div key={rec.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                                    {rec.title}
                                  </h4>
                                  <div className="flex items-center space-x-2 text-xs">
                                    <span className="flex items-center text-green-600">
                                      <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                                      {rec.cost_estimate}
                              </span>
                                    <span className="flex items-center text-blue-600">
                                      <ClockIcon className="h-3 w-3 mr-1" />
                                      {rec.timeline}
                              </span>
                            </div>
                      </div>
                                <SparklesIcon className="h-4 w-4 text-purple-600 ml-2 flex-shrink-0" />
                    </div>
                              
                              {/* Action Buttons */}
                              <div className="flex items-center space-x-2 pt-2 border-t border-purple-200">
                          <button
                                  onClick={() => {
                                    setSelectedSavedRec(rec);
                                    setShowDetailsModal(true);
                                  }}
                                  className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                >
                                  <DocumentTextIcon className="h-3 w-3" />
                                  <span>View Chat</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingPlan(rec);
                                    setShowEditPlanModal(true);
                                  }}
                                  className="flex items-center space-x-1 px-2 py-1 text-xs text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                                >
                                  <PencilIcon className="h-3 w-3" />
                                  <span>Edit Plan</span>
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {savedChatRecommendations.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setActiveVisualization('saved')}
                          className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                        >
                          View All Saved Recommendations
                          </button>
                    </div>
                  )}
                  </div>
                  </div>
                  </div>
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
                            {(selectedGap.issue?.type || selectedGap.issue_type || 'Unknown')?.replace(/_/g, ' ').toUpperCase()}
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

        {/* Edit Plan Modal */}
        <AnimatePresence>
          {showEditPlanModal && editingPlan && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowEditPlanModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Edit Implementation Plan</h2>
                      <p className="text-gray-600">Modify the details of your saved recommendation</p>
                    </div>
                    <button
                      onClick={() => setShowEditPlanModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  <EditPlanForm 
                    plan={editingPlan}
                    onSave={(updatedPlan) => {
                      updateSavedChatRecommendation(editingPlan.id, updatedPlan);
                      setShowEditPlanModal(false);
                      toast.success('Plan updated successfully!');
                    }}
                    onCancel={() => setShowEditPlanModal(false)}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedSavedRec && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDetailsModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <SparklesIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedSavedRec.title}</h2>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                            AI Generated
                          </span>
                          <span className="text-sm text-gray-500">
                            Saved {new Date(selectedSavedRec.saved_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center mb-2">
                        <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-900">Cost Estimate</span>
                      </div>
                      <p className="text-lg font-bold text-green-700">{selectedSavedRec.cost_estimate}</p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center mb-2">
                        <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-900">Timeline</span>
                      </div>
                      <p className="text-lg font-bold text-blue-700">{selectedSavedRec.timeline}</p>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="flex items-center mb-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="font-medium text-yellow-900">Priority</span>
                      </div>
                      <p className={`text-lg font-bold capitalize ${
                        selectedSavedRec.priority_level === 'high' || selectedSavedRec.priority_level === 'critical' 
                          ? 'text-red-600'
                          : selectedSavedRec.priority_level === 'medium'
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}>
                        {selectedSavedRec.priority_level}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="flex items-center mb-2">
                        <ChartBarIcon className="h-5 w-5 text-purple-600 mr-2" />
                        <span className="font-medium text-purple-900">Progress</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`text-lg font-bold ${
                            (selectedSavedRec.implementation_progress || 0) === 0 ? 'text-gray-600' :
                            (selectedSavedRec.implementation_progress || 0) < 25 ? 'text-red-600' :
                            (selectedSavedRec.implementation_progress || 0) < 50 ? 'text-yellow-600' :
                            (selectedSavedRec.implementation_progress || 0) < 75 ? 'text-blue-600' :
                            (selectedSavedRec.implementation_progress || 0) < 100 ? 'text-green-600' :
                            'text-green-700'
                          }`}>
                            {selectedSavedRec.implementation_progress || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              (selectedSavedRec.implementation_progress || 0) === 0 ? 'bg-gray-400' :
                              (selectedSavedRec.implementation_progress || 0) < 25 ? 'bg-red-500' :
                              (selectedSavedRec.implementation_progress || 0) < 50 ? 'bg-yellow-500' :
                              (selectedSavedRec.implementation_progress || 0) < 75 ? 'bg-blue-500' :
                              (selectedSavedRec.implementation_progress || 0) < 100 ? 'bg-green-500' :
                              'bg-green-600'
                            }`}
                            style={{ width: `${selectedSavedRec.implementation_progress || 0}%` }}
                          ></div>
                        </div>
                        
                        {/* Progress Update Buttons */}
                        <div className="space-y-2">
                          <p className="text-sm text-purple-700 font-medium">Update Progress:</p>
                          <div className="flex flex-wrap gap-2">
                            {[0, 25, 50, 75, 100].map((progress) => (
                              <button
                                key={progress}
                                onClick={() => {
                                  updateRecommendationProgress(selectedSavedRec.id, progress);
                                  toast.success(`Progress updated to ${progress}%`);
                                  // Update the selected recommendation in the modal
                                  setSelectedSavedRec(prev => ({
                                    ...prev,
                                    implementation_progress: progress
                                  }));
                                }}
                                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                  (selectedSavedRec.implementation_progress || 0) === progress
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                }`}
                              >
                                {progress}%
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                              (selectedSavedRec.implementation_progress || 0) === 0 ? 'bg-gray-100 text-gray-700' :
                              (selectedSavedRec.implementation_progress || 0) < 25 ? 'bg-red-100 text-red-700' :
                              (selectedSavedRec.implementation_progress || 0) < 50 ? 'bg-yellow-100 text-yellow-700' :
                              (selectedSavedRec.implementation_progress || 0) < 75 ? 'bg-blue-100 text-blue-700' :
                              (selectedSavedRec.implementation_progress || 0) < 100 ? 'bg-green-100 text-green-700' :
                              'bg-green-200 text-green-800'
                            }`}>
                              Status: {(selectedSavedRec.implementation_progress || 0) === 0 ? 'Not Started' :
                                      (selectedSavedRec.implementation_progress || 0) < 25 ? 'Planning' :
                                      (selectedSavedRec.implementation_progress || 0) < 50 ? 'In Progress' :
                                      (selectedSavedRec.implementation_progress || 0) < 75 ? 'Advanced' :
                                      (selectedSavedRec.implementation_progress || 0) < 100 ? 'Near Complete' :
                                      'Completed'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Full Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Full Recommendation</h3>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedSavedRec.description}
                      </p>
                    </div>
                  </div>

                  {/* Additional Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Implementation Details */}
                    <div className="space-y-4">
                      {selectedSavedRec.recommended_actions && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Recommended Actions</h4>
                          {Array.isArray(selectedSavedRec.recommended_actions) && selectedSavedRec.recommended_actions.length > 0 ? (
                            <div className="space-y-2">
                              {selectedSavedRec.recommended_actions.map((action, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                                    {index + 1}
                                  </span>
                                  <span className="text-sm text-gray-700">{action}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm text-blue-800 whitespace-pre-wrap">{selectedSavedRec.recommended_actions}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedSavedRec.implementation_notes && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Implementation Notes</h4>
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-800 whitespace-pre-wrap">{selectedSavedRec.implementation_notes}</p>
                          </div>
                        </div>
                      )}

                      {selectedSavedRec.success_metrics && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Success Metrics</h4>
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800 whitespace-pre-wrap">{selectedSavedRec.success_metrics}</p>
                          </div>
                        </div>
                      )}

                      {selectedSavedRec.risks_mitigation && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Risks & Mitigation</h4>
                          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm text-yellow-800 whitespace-pre-wrap">{selectedSavedRec.risks_mitigation}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stakeholders and Impact */}
                    <div className="space-y-4">
                      {selectedSavedRec.expected_impact && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Expected Impact</h4>
                          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-sm text-purple-800 whitespace-pre-wrap">{selectedSavedRec.expected_impact}</p>
                          </div>
                        </div>
                      )}

                      {(selectedSavedRec.stakeholders || selectedSavedRec.implementation_partners) && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Stakeholders & Partners</h4>
                          <div className="space-y-2">
                            {selectedSavedRec.stakeholders && (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <h5 className="text-xs font-medium text-gray-700 mb-1">Key Stakeholders</h5>
                                <p className="text-sm text-gray-700">{selectedSavedRec.stakeholders}</p>
                              </div>
                            )}
                            {selectedSavedRec.implementation_partners && (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <h5 className="text-xs font-medium text-gray-700 mb-1">Implementation Partners</h5>
                                {Array.isArray(selectedSavedRec.implementation_partners) && selectedSavedRec.implementation_partners.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {selectedSavedRec.implementation_partners.map((partner, index) => (
                                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        {partner}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-700">{selectedSavedRec.implementation_partners}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {(selectedSavedRec.target_locations || selectedSavedRec.locations_affected) && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Locations</h4>
                          <div className="space-y-2">
                            {selectedSavedRec.target_locations && (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <h5 className="text-xs font-medium text-gray-700 mb-1">Target Locations</h5>
                                {Array.isArray(selectedSavedRec.target_locations) && selectedSavedRec.target_locations.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {selectedSavedRec.target_locations.map((location, index) => (
                                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                        {location}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-700">{selectedSavedRec.target_locations}</p>
                                )}
                              </div>
                            )}
                            {selectedSavedRec.locations_affected && (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <h5 className="text-xs font-medium text-gray-700 mb-1">Locations Affected</h5>
                                <p className="text-sm text-gray-700">{selectedSavedRec.locations_affected}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {(selectedSavedRec.equity_impact || selectedSavedRec.sdg_alignment) && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Impact & Alignment</h4>
                          <div className="space-y-2">
                            {selectedSavedRec.equity_impact && (
                              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                <h5 className="text-xs font-medium text-orange-700 mb-1">Equity Impact</h5>
                                <p className="text-sm text-orange-800 whitespace-pre-wrap">{selectedSavedRec.equity_impact}</p>
                              </div>
                            )}
                            {selectedSavedRec.sdg_alignment && (
                              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                <h5 className="text-xs font-medium text-green-700 mb-1">SDG Alignment</h5>
                                <p className="text-sm text-green-800">{selectedSavedRec.sdg_alignment}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chat Context */}
                  {selectedSavedRec.chat_context && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Original Conversation</h3>
                      <div className="space-y-3">
                        {selectedSavedRec.chat_context.user_question && (
                          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <div className="flex items-center mb-2">
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                                <span className="text-white text-xs font-bold">U</span>
                              </div>
                              <span className="font-medium text-blue-900">Your Question</span>
                            </div>
                            <p className="text-blue-800">{selectedSavedRec.chat_context.user_question}</p>
                          </div>
                        )}
                        
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mr-2">
                              <SparklesIcon className="h-3 w-3 text-white" />
                            </div>
                            <span className="font-medium text-purple-900">AI Response</span>
                          </div>
                          <p className="text-purple-800 whitespace-pre-wrap">
                            {selectedSavedRec.chat_context.ai_response}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                          window.location.href = '/dashboard';
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        View on Dashboard
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSavedRec(null);
                          setShowDetailsModal(false);
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        Close
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      Type: {selectedSavedRec.type?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIAdvisorPage;
