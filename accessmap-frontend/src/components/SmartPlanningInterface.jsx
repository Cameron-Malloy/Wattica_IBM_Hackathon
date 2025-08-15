import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../contexts/ApiContext';
import {
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  UsersIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  PlusIcon,
  EyeIcon,
  ChartBarIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
  MapPinIcon,
  FireIcon,
  BoltIcon,
  ShieldCheckIcon,
  BeakerIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const SmartPlanningInterface = ({ results, onPlanUpdate, onStartConversation, savedChatRecommendations = [] }) => {
  const { addPlanItem, updatePlanItem, planItems: contextPlanItems, addRecommendation } = useApi();
  const [selectedItems, setSelectedItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [selectedPlanItem, setSelectedPlanItem] = useState(null);
  const [showChatLogsModal, setShowChatLogsModal] = useState(false);
  const [selectedChatLogs, setSelectedChatLogs] = useState(null);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    priority: 'medium',
    duration: '',
    cost: '',
    type: 'implementation',
    status: 'planned'
  });

  // Use context plan items or local state
  const planItems = contextPlanItems || [];

  // Generate smart suggestions from AI data
  const smartSuggestions = useMemo(() => {
    if (!results?.recommendations) return [];
    
    return results.recommendations.slice(0, 6).map((rec, index) => ({
      id: `suggestion-${index}`,
      title: rec.title?.substring(0, 60) + '...' || 'Implementation Task',
      description: rec.description || 'AI-generated accessibility improvement',
      priority: rec.priority_level?.toLowerCase() || rec.priority?.toLowerCase() || 'medium',
      duration: rec.timeline || '6 months',
      cost: rec.cost_estimate || '$50,000',
      type: rec.type || 'implementation',
      status: 'suggested',
      aiGenerated: true,
      originalRecommendation: rec
    }));
  }, [results]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'infrastructure': return <BuildingOfficeIcon className="h-4 w-4" />;
      case 'technology': return <ComputerDesktopIcon className="h-4 w-4" />;
      case 'policy': return <DocumentTextIcon className="h-4 w-4" />;
      case 'community': return <UsersIcon className="h-4 w-4" />;
      case 'research': return <AcademicCapIcon className="h-4 w-4" />;
      case 'testing': return <BeakerIcon className="h-4 w-4" />;
      default: return <WrenchScrewdriverIcon className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'planned': return 'bg-yellow-500';
      case 'suggested': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const addSuggestionToPlan = (suggestion) => {
    const newPlanItem = {
      ...suggestion,
      status: 'planned',
      addedAt: new Date(),
      addAsRecommendation: true // This will sync to dashboard
    };
    
    const addedItem = addPlanItem(newPlanItem);
    toast.success('Added to your implementation plan and synced to dashboard!');
    
    if (onPlanUpdate) {
      onPlanUpdate(addedItem);
    }
  };

  const addCustomItem = () => {
    if (!newItem.title.trim()) return;
    
    const customItem = {
      ...newItem,
      aiGenerated: false,
      addedAt: new Date(),
      addAsRecommendation: true // Sync to dashboard
    };
    
    const addedItem = addPlanItem(customItem);
    setNewItem({
      title: '',
      description: '',
      priority: 'medium',
      duration: '',
      cost: '',
      type: 'implementation',
      status: 'planned'
    });
    setShowAddModal(false);
    toast.success('Custom plan item added and synced to dashboard!');
    
    if (onPlanUpdate) {
      onPlanUpdate(addedItem);
    }
  };

  const updateItemStatus = (itemId, newStatus) => {
    updatePlanItem(itemId, { status: newStatus });
    
    // If marking as completed, add as recommendation to dashboard
    if (newStatus === 'completed') {
      const item = planItems.find(p => p.id === itemId);
      if (item) {
        addRecommendation({
          title: item.title,
          description: item.description + ' (Completed)',
          type: item.type,
          priority_level: item.priority,
          cost_estimate: item.cost,
          timeline: item.duration,
          implementation_status: 'completed',
          source: 'planning_tool_completed'
        });
        toast.success(`Status updated to ${newStatus} and synced to dashboard!`);
      }
    } else {
      toast.success(`Status updated to ${newStatus}!`);
    }
  };

  const removeItem = (itemId) => {
    // Note: We don't have a remove function in context yet, so we'll update status to 'cancelled'
    updatePlanItem(itemId, { status: 'cancelled', hidden: true });
    toast.success('Item removed from plan');
  };

  const askAIForHelp = (item) => {
    const message = `I need help with this accessibility implementation: "${item.title}". Can you provide detailed steps, timeline breakdown, resource requirements, and potential challenges I should consider? Please format your response with clear phases and actionable items.`;
    
    if (onStartConversation) {
      onStartConversation(message, item.originalRecommendation || item);
    }
    
    // Update the plan item to indicate AI consultation is in progress
    updatePlanItem(item.id, { 
      aiConsultationRequested: true, 
      aiConsultationDate: new Date().toISOString() 
    });
    
    toast.success('Starting AI conversation about this plan item!');
  };

  const viewPlanTimeline = (item) => {
    setSelectedPlanItem(item);
    setShowTimelineModal(true);
  };

  const viewChatLogs = (item) => {
    // Find related saved chat recommendations
    const relatedRecommendations = savedChatRecommendations.filter(rec => 
      rec.title.toLowerCase().includes(item.title.toLowerCase()) || 
      item.title.toLowerCase().includes(rec.title.toLowerCase().substring(0, 20))
    );
    
    setSelectedChatLogs({
      planItem: item,
      recommendations: relatedRecommendations
    });
    setShowChatLogsModal(true);
  };

  const addAIRecommendationToPlan = (aiResponse, originalItem) => {
    // Parse AI response for actionable items
    const phases = aiResponse.split(/phase|step|stage/i).filter(phase => phase.trim().length > 10);
    
    phases.forEach((phase, index) => {
      if (index > 0 && phase.trim()) { // Skip first element as it's usually intro text
        const phaseTitle = `${originalItem.title} - Phase ${index}`;
        const phaseDescription = phase.trim().substring(0, 200) + '...';
        
        const phaseItem = {
          title: phaseTitle,
          description: phaseDescription,
          priority: originalItem.priority || 'medium',
          duration: '2-4 weeks',
          cost: '$10,000-25,000',
          type: originalItem.type || 'implementation',
          status: 'planned',
          aiGenerated: true,
          parentPlanId: originalItem.id,
          aiResponse: phase.trim(),
          addAsRecommendation: true
        };
        
        addPlanItem(phaseItem);
      }
    });
    
    toast.success(`Added ${phases.length - 1} AI-generated phases to your plan!`);
  };

  // Filter out hidden/cancelled items for display
  const visiblePlanItems = planItems.filter(item => !item.hidden && item.status !== 'cancelled');

  const planStats = useMemo(() => {
    const totalItems = visiblePlanItems.length;
    const completed = visiblePlanItems.filter(item => item.status === 'completed').length;
    const inProgress = visiblePlanItems.filter(item => item.status === 'in-progress').length;
    const totalCost = visiblePlanItems.reduce((sum, item) => {
      const match = item.cost?.match(/\$?(\d+(?:,\d+)?)/);
      return sum + (match ? parseInt(match[1].replace(/,/g, '')) : 0);
    }, 0);
    const avgDuration = visiblePlanItems.reduce((sum, item) => {
      const match = item.duration?.match(/(\d+)/);
      return sum + (match ? parseInt(match[1]) : 6);
    }, 0) / (totalItems || 1);

    return { totalItems, completed, inProgress, totalCost, avgDuration };
  }, [visiblePlanItems]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Smart Planning Assistant</h2>
              <p className="text-emerald-100">AI-powered accessibility implementation planner</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Custom</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{planStats.totalItems}</div>
            <div className="text-sm text-emerald-100">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{planStats.inProgress}</div>
            <div className="text-sm text-emerald-100">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">${(planStats.totalCost / 1000).toFixed(0)}K</div>
            <div className="text-sm text-emerald-100">Est. Budget</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{planStats.avgDuration.toFixed(0)}mo</div>
            <div className="text-sm text-emerald-100">Avg Duration</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Suggestions */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <BoltIcon className="h-6 w-6 mr-2" />
              AI Recommendations
            </h3>
            <p className="text-purple-100 text-sm">Smart suggestions based on your accessibility data</p>
          </div>

          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {smartSuggestions.map((suggestion) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(suggestion.type)}
                    <span className="font-semibold text-gray-900 text-sm">{suggestion.title}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(suggestion.priority)}`}>
                    {suggestion.priority}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{suggestion.description}</p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    {suggestion.duration}
                  </span>
                  <span className="flex items-center">
                    <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                    {suggestion.cost}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => addSuggestionToPlan(suggestion)}
                    className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                  >
                    <PlusIcon className="h-3 w-3" />
                    <span>Add to Plan</span>
                  </button>
                  <button
                    onClick={() => askAIForHelp(suggestion)}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center space-x-1"
                  >
                    <ChatBubbleLeftRightIcon className="h-3 w-3" />
                    <span>Ask AI</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Implementation Plan */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <CheckCircleIcon className="h-6 w-6 mr-2" />
              Your Implementation Plan
            </h3>
            <p className="text-blue-100 text-sm">Track and manage your accessibility improvements</p>
          </div>

          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {visiblePlanItems.length === 0 ? (
              <div className="text-center py-8">
                <LightBulbIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No plan items yet</p>
                <p className="text-sm text-gray-400">Add AI suggestions or create custom items</p>
              </div>
            ) : (
              visiblePlanItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                      <span className="font-semibold text-gray-900 text-sm">{item.title}</span>
                      {item.aiGenerated && (
                        <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-600 rounded">AI</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <select
                        value={item.status}
                        onChange={(e) => updateItemStatus(item.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="planned">Planned</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {item.duration}
                    </span>
                    <span className="flex items-center">
                      <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                      {item.cost}
                    </span>
                    <span className={`px-2 py-1 rounded-full border ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => askAIForHelp(item)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                    >
                      <ChatBubbleLeftRightIcon className="h-3 w-3" />
                      <span>Get AI Help</span>
                    </button>
                    <button
                      onClick={() => viewPlanTimeline(item)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center space-x-1"
                    >
                      <CalendarIcon className="h-3 w-3" />
                      <span>Timeline</span>
                    </button>
                    {/* Show chat logs button if this item has associated saved recommendations */}
                    {savedChatRecommendations.some(rec => 
                      rec.title.toLowerCase().includes(item.title.toLowerCase()) || 
                      item.title.toLowerCase().includes(rec.title.toLowerCase().substring(0, 20))
                    ) && (
                      <button
                        onClick={() => viewChatLogs(item)}
                        className="px-3 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors text-sm flex items-center space-x-1"
                      >
                        <DocumentTextIcon className="h-3 w-3" />
                        <span>Chat Logs</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Custom Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Add Custom Plan Item</h3>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Implementation task title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    rows="3"
                    placeholder="Describe this task..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={newItem.priority}
                      onChange={(e) => setNewItem(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={newItem.type}
                      onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="implementation">Implementation</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="technology">Technology</option>
                      <option value="policy">Policy</option>
                      <option value="community">Community</option>
                      <option value="research">Research</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <input
                      type="text"
                      value={newItem.duration}
                      onChange={(e) => setNewItem(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., 3 months"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                    <input
                      type="text"
                      value={newItem.cost}
                      onChange={(e) => setNewItem(prev => ({ ...prev, cost: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., $25,000"
                    />
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addCustomItem}
                  disabled={!newItem.title}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Item
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline Detail Modal */}
      <AnimatePresence>
        {showTimelineModal && selectedPlanItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTimelineModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <h3 className="text-lg font-semibold">Implementation Timeline</h3>
                    <p className="text-blue-100 text-sm">{selectedPlanItem.title}</p>
                  </div>
                  <button
                    onClick={() => setShowTimelineModal(false)}
                    className="text-white/80 hover:text-white"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="px-6 py-4">
                <div className="space-y-6">
                  {/* Project Overview */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">📋 Project Overview</h4>
                    <p className="text-sm text-blue-800">{selectedPlanItem.description}</p>
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-blue-900">Duration:</span>
                        <span className="ml-2 text-blue-800">{selectedPlanItem.duration}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-900">Budget:</span>
                        <span className="ml-2 text-blue-800">{selectedPlanItem.cost}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Insights */}
                  {selectedPlanItem.aiResponse && (
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-2">🤖 AI Insights</h4>
                      <p className="text-sm text-purple-800 whitespace-pre-wrap">{selectedPlanItem.aiResponse}</p>
                    </div>
                  )}

                  {/* Implementation Phases */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3">🗓️ Implementation Phases</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-green-200">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                        <div className="flex-1">
                          <p className="font-medium text-green-900">Planning & Assessment</p>
                          <p className="text-sm text-green-700">Detailed requirements analysis and stakeholder alignment</p>
                        </div>
                        <span className="text-sm text-green-600">2-3 weeks</span>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-green-200">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        <div className="flex-1">
                          <p className="font-medium text-green-900">Design & Development</p>
                          <p className="text-sm text-green-700">Create solutions and prepare for implementation</p>
                        </div>
                        <span className="text-sm text-green-600">4-6 weeks</span>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-green-200">
                        <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                        <div className="flex-1">
                          <p className="font-medium text-green-900">Implementation</p>
                          <p className="text-sm text-green-700">Deploy accessibility improvements</p>
                        </div>
                        <span className="text-sm text-green-600">6-8 weeks</span>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-green-200">
                        <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                        <div className="flex-1">
                          <p className="font-medium text-green-900">Testing & Validation</p>
                          <p className="text-sm text-green-700">Ensure compliance and gather feedback</p>
                        </div>
                        <span className="text-sm text-green-600">2-3 weeks</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200">
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedPlanItem.aiConsultationRequested ? '✓' : '○'}
                      </div>
                      <div className="text-sm text-yellow-800">AI Consulted</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">{selectedPlanItem.priority?.toUpperCase()}</div>
                      <div className="text-sm text-blue-800">Priority Level</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                      <div className="text-2xl font-bold text-green-600">{selectedPlanItem.status?.toUpperCase()}</div>
                      <div className="text-sm text-green-800">Current Status</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowTimelineModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => askAIForHelp(selectedPlanItem)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    <span>Get More AI Help</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Logs Modal */}
      <AnimatePresence>
        {showChatLogsModal && selectedChatLogs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowChatLogsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Chat Logs for: {selectedChatLogs.planItem.title}
                    </h2>
                    <p className="text-gray-600">
                      {selectedChatLogs.recommendations.length} related conversation{selectedChatLogs.recommendations.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                  <button
                    onClick={() => setShowChatLogsModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {selectedChatLogs.recommendations.length === 0 ? (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No chat logs found</h3>
                    <p className="text-gray-500">No conversations were found related to this plan item.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedChatLogs.recommendations.map((rec, index) => (
                      <div key={rec.id} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                        {/* Recommendation Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{rec.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Saved: {new Date(rec.saved_at).toLocaleDateString()}</span>
                              <span>Priority: {rec.priority_level}</span>
                              <span>Cost: {rec.cost_estimate}</span>
                              <span>Timeline: {rec.timeline}</span>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                            AI Generated
                          </span>
                        </div>

                        {/* Original Conversation */}
                        {rec.chat_context && (
                          <div className="space-y-3">
                            <h4 className="font-medium text-gray-900">Original Conversation:</h4>
                            
                            {/* User Question */}
                            {rec.chat_context.user_question && (
                              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center mb-2">
                                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                                    <span className="text-white text-xs font-bold">U</span>
                                  </div>
                                  <span className="font-medium text-blue-900">Your Question</span>
                                </div>
                                <p className="text-blue-800 text-sm">{rec.chat_context.user_question}</p>
                              </div>
                            )}
                            
                            {/* AI Response */}
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                              <div className="flex items-center mb-2">
                                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mr-2">
                                  <SparklesIcon className="h-3 w-3 text-white" />
                                </div>
                                <span className="font-medium text-purple-900">AI Response</span>
                              </div>
                              <p className="text-purple-800 text-sm whitespace-pre-wrap line-clamp-4">
                                {rec.chat_context.ai_response}
                              </p>
                            </div>

                            {/* Conversation History */}
                            {rec.chat_context.conversation_history && rec.chat_context.conversation_history.length > 0 && (
                              <div className="mt-4">
                                <h5 className="font-medium text-gray-900 mb-2">Follow-up Conversations:</h5>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {rec.chat_context.conversation_history.map((conv, convIndex) => (
                                    <div key={convIndex} className="p-2 bg-gray-100 rounded-lg">
                                      <div className="text-xs text-gray-600 mb-1">
                                        {new Date(conv.timestamp).toLocaleDateString()} - Follow-up #{convIndex + 1}
                                      </div>
                                      <p className="text-sm text-gray-800 line-clamp-2">{conv.user_question}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowChatLogsModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SmartPlanningInterface;
