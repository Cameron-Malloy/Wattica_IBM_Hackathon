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
};

// Initial state
const initialState = {
  loading: false,
  error: null,
  results: null,
  activeJobs: [],
  connectionStatus: 'checking', // 'connected', 'disconnected', 'checking'
  lastUpdated: null,
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
