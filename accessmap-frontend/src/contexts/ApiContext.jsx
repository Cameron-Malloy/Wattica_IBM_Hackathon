import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import toast from 'react-hot-toast';

// Action types
const API_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_RESULTS: 'SET_RESULTS',
  SET_ACTIVE_JOBS: 'SET_ACTIVE_JOBS',
  UPDATE_JOB_STATUS: 'UPDATE_JOB_STATUS',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_CONNECTION_STATUS: 'SET_CONNECTION_STATUS',
  ADD_RECOMMENDATION: 'ADD_RECOMMENDATION',
  ADD_SURVEY_SUBMISSION: 'ADD_SURVEY_SUBMISSION',
  ADD_PLAN_ITEM: 'ADD_PLAN_ITEM',
  UPDATE_PLAN_ITEM: 'UPDATE_PLAN_ITEM',
  ADD_SAVED_CHAT_RECOMMENDATION: 'ADD_SAVED_CHAT_RECOMMENDATION',
  UPDATE_SAVED_CHAT_RECOMMENDATION: 'UPDATE_SAVED_CHAT_RECOMMENDATION',
  CLEAR_SAVED_CHAT_RECOMMENDATIONS: 'CLEAR_SAVED_CHAT_RECOMMENDATIONS',
};

// Load saved recommendations from localStorage
const loadSavedRecommendations = () => {
  try {
    const saved = localStorage.getItem('savedChatRecommendations');
    const recommendations = saved ? JSON.parse(saved) : [];
    console.log('Loading saved recommendations from localStorage:', recommendations);
    return recommendations;
  } catch (error) {
    console.error('Error loading saved recommendations:', error);
    return [];
  }
};

// Save recommendations to localStorage
const saveSavedRecommendations = (recommendations) => {
  try {
    console.log('Saving recommendations to localStorage:', recommendations);
    localStorage.setItem('savedChatRecommendations', JSON.stringify(recommendations));
  } catch (error) {
    console.error('Error saving recommendations:', error);
  }
};

// Initial state
const initialState = {
  loading: false,
  error: null,
  results: null,
  activeJobs: [],
  connectionStatus: 'checking', // 'connected', 'disconnected', 'checking'
  lastUpdated: null,
  planItems: [],
  surveySubmissions: [],
  savedChatRecommendations: loadSavedRecommendations(),
};

// Reducer
function apiReducer(state, action) {
  switch (action.type) {
    case API_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case API_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case API_ACTIONS.SET_RESULTS:
      return { 
        ...state, 
        results: action.payload, 
        loading: false, 
        error: null,
        lastUpdated: new Date().toISOString()
      };
    
    case API_ACTIONS.SET_ACTIVE_JOBS:
      return { ...state, activeJobs: action.payload };
    
    case API_ACTIONS.UPDATE_JOB_STATUS:
      return {
        ...state,
        activeJobs: state.activeJobs.map(job =>
          job.jobId === action.payload.jobId
            ? { ...job, ...action.payload.updates }
            : job
        ),
      };
    
    case API_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    case API_ACTIONS.SET_CONNECTION_STATUS:
      return { ...state, connectionStatus: action.payload };
    
    case API_ACTIONS.ADD_RECOMMENDATION:
      return {
        ...state,
        results: state.results ? {
          ...state.results,
          recommendations: [...(state.results.recommendations || []), action.payload]
        } : {
          // Create initial results structure if it doesn't exist
          recommendations: [action.payload],
          scan_results: [],
          priority_areas: []
        }
      };
    
    case API_ACTIONS.ADD_SURVEY_SUBMISSION:
      return {
        ...state,
        surveySubmissions: [...state.surveySubmissions, action.payload],
        results: state.results ? {
          ...state.results,
          survey_submissions: [...(state.results.survey_submissions || []), action.payload]
        } : state.results
      };
    
    case API_ACTIONS.ADD_PLAN_ITEM:
      return {
        ...state,
        planItems: [...state.planItems, action.payload]
      };
    
    case API_ACTIONS.UPDATE_PLAN_ITEM:
      return {
        ...state,
        planItems: state.planItems.map(item =>
          item.id === action.payload.id ? { ...item, ...action.payload.updates } : item
        )
      };
    
    case API_ACTIONS.ADD_SAVED_CHAT_RECOMMENDATION:
      const newRecommendations = [...state.savedChatRecommendations, action.payload];
      saveSavedRecommendations(newRecommendations);
      return {
        ...state,
        savedChatRecommendations: newRecommendations
      };
    
    case API_ACTIONS.UPDATE_SAVED_CHAT_RECOMMENDATION:
      const updatedRecommendations = state.savedChatRecommendations.map(rec =>
        rec.id === action.payload.id ? { ...rec, ...action.payload.updates } : rec
      );
      saveSavedRecommendations(updatedRecommendations);
      return {
        ...state,
        savedChatRecommendations: updatedRecommendations
      };
    
    case API_ACTIONS.CLEAR_SAVED_CHAT_RECOMMENDATIONS:
      saveSavedRecommendations([]);
      return {
        ...state,
        savedChatRecommendations: []
      };
    
    default:
      return state;
  }
}

// Create context
const ApiContext = createContext();

// Provider component
export function ApiProvider({ children }) {
  const [state, dispatch] = useReducer(apiReducer, initialState);

  // Check backend connection on mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  // Update active jobs periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const activeJobs = apiService.getActiveJobs();
      dispatch({ type: API_ACTIONS.SET_ACTIVE_JOBS, payload: activeJobs });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const checkBackendConnection = useCallback(async () => {
    try {
      dispatch({ type: API_ACTIONS.SET_CONNECTION_STATUS, payload: 'checking' });
      await apiService.healthCheck();
      dispatch({ type: API_ACTIONS.SET_CONNECTION_STATUS, payload: 'connected' });
    } catch (error) {
      console.error('Backend connection failed:', error);
      dispatch({ type: API_ACTIONS.SET_CONNECTION_STATUS, payload: 'disconnected' });
      toast.error('Unable to connect to backend server');
    }
  }, []);

  const startAnalysis = useCallback(async (type = 'complete', payload = {}) => {
    try {
      dispatch({ type: API_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: API_ACTIONS.CLEAR_ERROR });

      let result;
      switch (type) {
        case 'complete':
          result = await apiService.startCompleteAnalysis(payload);
          break;
        case 'scan':
          result = await apiService.startScanAnalysis(payload.state);
          break;
        case 'priority':
          result = await apiService.startPriorityAnalysis(payload.state);
          break;
        case 'plan':
          result = await apiService.startPlanningAnalysis(payload.state);
          break;
        default:
          throw new Error(`Unknown analysis type: ${type}`);
      }

      toast.success(`Analysis started successfully! Job ID: ${result.job_id}`);
      
      // Start polling for status updates
      apiService.startStatusPolling(
        result.job_id,
        (status) => {
          dispatch({
            type: API_ACTIONS.UPDATE_JOB_STATUS,
            payload: {
              jobId: result.job_id,
              updates: status,
            },
          });
        },
        (results) => {
          dispatch({ type: API_ACTIONS.SET_RESULTS, payload: results });
          toast.success('Analysis completed successfully!');
        },
        (error) => {
          dispatch({ type: API_ACTIONS.SET_ERROR, payload: error.message });
          toast.error(`Analysis failed: ${error.message}`);
        }
      );

      return result;
    } catch (error) {
      dispatch({ type: API_ACTIONS.SET_ERROR, payload: error.message });
      toast.error(`Failed to start analysis: ${error.message}`);
      throw error;
    }
  }, []);

  const getLatestResults = useCallback(async (state = 'CA') => {
    try {
      dispatch({ type: API_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: API_ACTIONS.CLEAR_ERROR });

      const results = await apiService.getLatestResults(state);
      
      dispatch({ type: API_ACTIONS.SET_RESULTS, payload: results });
      
      return results;
    } catch (error) {
      dispatch({ type: API_ACTIONS.SET_ERROR, payload: error.message });
      toast.error(`Failed to load results: ${error.message}`);
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: API_ACTIONS.CLEAR_ERROR });
  }, []);

  const clearResults = useCallback(() => {
    dispatch({ type: API_ACTIONS.SET_RESULTS, payload: null });
  }, []);

  const addRecommendation = useCallback((recommendation) => {
    const newRecommendation = {
      ...recommendation,
      id: `rec-${Date.now()}`,
      created_at: new Date().toISOString(),
      source: recommendation.source || 'planning_tool' // Don't overwrite if source is already set
    };
    dispatch({ type: API_ACTIONS.ADD_RECOMMENDATION, payload: newRecommendation });
    return newRecommendation;
  }, []);

  const addSurveySubmission = useCallback((surveyData) => {
    const submission = {
      ...surveyData,
      id: `survey-${Date.now()}`,
      submitted_at: new Date().toISOString(),
      status: 'submitted'
    };
    dispatch({ type: API_ACTIONS.ADD_SURVEY_SUBMISSION, payload: submission });
    return submission;
  }, []);

  const addPlanItem = useCallback((planItem) => {
    const newPlanItem = {
      ...planItem,
      id: `plan-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    dispatch({ type: API_ACTIONS.ADD_PLAN_ITEM, payload: newPlanItem });
    
    // Also add as recommendation if it's a completed item
    if (planItem.status === 'completed' || planItem.addAsRecommendation) {
      addRecommendation({
        title: planItem.title,
        description: planItem.description,
        type: planItem.type,
        priority_level: planItem.priority,
        cost_estimate: planItem.cost,
        timeline: planItem.duration,
        implementation_status: planItem.status,
        source: 'planning_tool'
      });
    }
    
    return newPlanItem;
  }, [addRecommendation]);

  const updatePlanItem = useCallback((id, updates) => {
    dispatch({ 
      type: API_ACTIONS.UPDATE_PLAN_ITEM, 
      payload: { id, updates } 
    });
  }, []);

  const addSavedChatRecommendation = useCallback((recommendation) => {
    const savedRec = {
      ...recommendation,
      id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      saved_at: new Date().toISOString()
    };
    console.log('Adding saved chat recommendation:', savedRec);
    dispatch({ type: API_ACTIONS.ADD_SAVED_CHAT_RECOMMENDATION, payload: savedRec });
    return savedRec;
  }, []);

  const updateSavedChatRecommendation = useCallback((id, updates) => {
    console.log('Updating saved chat recommendation:', id, updates);
    dispatch({ 
      type: API_ACTIONS.UPDATE_SAVED_CHAT_RECOMMENDATION, 
      payload: { id, updates } 
    });
  }, []);

  const clearSavedChatRecommendations = useCallback(() => {
    dispatch({ type: API_ACTIONS.CLEAR_SAVED_CHAT_RECOMMENDATIONS });
  }, []);

  const value = {
    ...state,
    startAnalysis,
    startCompleteAnalysis: (state) => startAnalysis('complete', { state }),
    getLatestResults,
    clearError,
    clearResults,
    checkBackendConnection,
    isConnected: state.connectionStatus === 'connected',
    isChecking: state.connectionStatus === 'checking',
    addRecommendation,
    addSurveySubmission,
    addPlanItem,
    updatePlanItem,
    addSavedChatRecommendation,
    updateSavedChatRecommendation,
    clearSavedChatRecommendations,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

// Custom hook to use the API context
export function useApi() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
}
