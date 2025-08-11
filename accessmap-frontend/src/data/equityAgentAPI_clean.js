// API service for WatsonX equity agent data - Clean version with no fallbacks
import { generateCityCoordinates } from '../utils/coordinateGenerator.js';

const API_BASE_URL = 'http://localhost:8002';

/**
 * Multi-agent API client for WatsonX equity analysis
 */
class MultiAgentAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Start complete WatsonX multi-agent analysis
   */
  async startCompleteAnalysis(payload = { state: 'CA' }) {
    try {
      // Normalize payload
      const body = typeof payload === 'string'
        ? { state: payload.toUpperCase(), include_summary: true }
        : {
            state: (payload.state || 'CA').toUpperCase(),
            place: payload.place || payload.region || undefined,
            survey_data: payload.survey_data || undefined,
            include_summary: true
          };

      const response = await fetch(`${this.baseURL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to start multi-agent analysis:', error);
      throw error;
    }
  }

  async getAnalysisStatus(jobId) {
    try {
      const response = await fetch(`${this.baseURL}/status/${jobId}`);
      if (!response.ok) {
        throw new Error(`Status request failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get analysis status:', error);
      throw error;
    }
  }

  async getAnalysisResults(jobId) {
    try {
      const response = await fetch(`${this.baseURL}/results/${jobId}`);
      if (!response.ok) {
        throw new Error(`Results request failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get analysis results:', error);
      throw error;
    }
  }

  async getLatestResults(state = 'CA') {
    try {
      const response = await fetch(`${this.baseURL}/latest/${state.toUpperCase()}`);
      if (!response.ok) {
        throw new Error(`Latest results request failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get latest results:', error);
      throw error;
    }
  }

  async runScanAnalysis(payload) {
    try {
      const response = await fetch(`${this.baseURL}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Scan analysis failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to run scan analysis:', error);
      throw error;
    }
  }

  async runPriorityAnalysis(payload) {
    try {
      const response = await fetch(`${this.baseURL}/prioritize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Priority analysis failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to run priority analysis:', error);
      throw error;
    }
  }

  async runPlanningAnalysis(payload) {
    try {
      const response = await fetch(`${this.baseURL}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Planning analysis failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to run planning analysis:', error);
      throw error;
    }
  }
}

// Create instance
const multiAgentAPI = new MultiAgentAPI();

/**
 * Main function to fetch equity agent data from WatsonX
 * Only uses WatsonX API - no fallbacks
 */
export const fetchEquityAgentData = async (state = 'CA') => {
  try {
    console.log(`🤖 Fetching WatsonX multi-agent data for ${state}...`);

    // First, try to get existing results
    try {
      const existingResults = await multiAgentAPI.getLatestResults(state);
      if (existingResults && existingResults.scan_results && existingResults.scan_results.length > 0) {
        console.log('✅ Found existing WatsonX results');
        
        // Transform and enhance results with coordinates
        const scanResults = (existingResults.scan_results || []).map(item => {
          const coordinates = generateCityCoordinates(item.location, {
            percent_over_65: item.vulnerable_population?.elderly_percent || 0.12,
            percent_disabled: item.vulnerable_population?.disabled_percent || 0.13,
            median_income: item.vulnerable_population?.median_income || 65000
          });

          return {
            id: item.id,
            location: item.location,
            lat: coordinates.lat,
            lng: coordinates.lng,
            issue_type: item.issue_type,
            severity: item.severity,
            description: item.description,
            confidence: item.confidence,
            detected_date: item.detected_date,
            vulnerable_population: item.vulnerable_population,
            risk_factors: item.risk_factors,
            agent: item.agent || 'AccessScanner'
          };
        });

        const priorityList = (existingResults.priority_areas || []).map(item => {
          const coordinates = generateCityCoordinates(item.location, {
            percent_over_65: item.vulnerable_population?.elderly_percent || 0.12,
            percent_disabled: item.vulnerable_population?.disabled_percent || 0.13,
            median_income: item.vulnerable_population?.median_income || 65000
          });

          return {
            id: item.id,
            location: item.location,
            lat: coordinates.lat,
            lng: coordinates.lng,
            priority_score: item.priority_score,
            priority_level: item.priority_level,
            top_issue: item.top_issue,
            vulnerable_population: item.vulnerable_population,
            equity_factors: item.equity_factors,
            recommended_timeline: item.recommended_timeline,
            potential_impact: item.potential_impact,
            rationale: item.rationale,
            agent: item.agent || 'EquityAdvisor'
          };
        });

        return {
          scanResults,
          priorityList,
          recommendations: (existingResults.recommendations || []).map(rec => ({
            ...rec,
            sdg_alignment: rec.sdg_alignment ? 
              (Array.isArray(rec.sdg_alignment) ? rec.sdg_alignment : [rec.sdg_alignment]) : 
              ['11']
          })),
          dataSource: existingResults.metadata?.data_source || 'WatsonX Multi-Agent AI System',
          summary: existingResults.summary || {},
          sdgAlignment: existingResults.sdg_alignment || {},
          metadata: existingResults.metadata || {}
        };
      }
    } catch (existingError) {
      console.log('No existing results found, starting new analysis...');
    }

    // Start new WatsonX analysis
    try {
      console.log('🚀 Starting new WatsonX multi-agent analysis...');
      const analysisJob = await multiAgentAPI.startCompleteAnalysis({ 
        state: state.toUpperCase(),
        include_summary: true 
      });
      
      if (analysisJob.job_id) {
        console.log(`📋 Analysis job started: ${analysisJob.job_id}`);
        
        // Poll for results
        const maxAttempts = 60; // 2 minutes max
        let attempts = 0;
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          
          try {
            const status = await multiAgentAPI.getAnalysisStatus(analysisJob.job_id);
            console.log(`📊 Analysis status: ${status.status}`);
            
            if (status.status === 'completed') {
              const results = await multiAgentAPI.getAnalysisResults(analysisJob.job_id);
              console.log('✅ WatsonX analysis completed successfully');
              
              // Transform and enhance results with coordinates
              const scanResults = (results.scan_results || []).map(item => {
                const coordinates = generateCityCoordinates(item.location, {
                  percent_over_65: item.vulnerable_population?.elderly_percent || 0.12,
                  percent_disabled: item.vulnerable_population?.disabled_percent || 0.13,
                  median_income: item.vulnerable_population?.median_income || 65000
                });

                return {
                  id: item.id,
                  location: item.location,
                  lat: coordinates.lat,
                  lng: coordinates.lng,
                  issue_type: item.issue_type,
                  severity: item.severity,
                  description: item.description,
                  confidence: item.confidence,
                  detected_date: item.detected_date,
                  vulnerable_population: item.vulnerable_population,
                  risk_factors: item.risk_factors,
                  agent: item.agent || 'AccessScanner'
                };
              });

              const priorityList = (results.priority_areas || []).map(item => {
                const coordinates = generateCityCoordinates(item.location, {
                  percent_over_65: item.vulnerable_population?.elderly_percent || 0.12,
                  percent_disabled: item.vulnerable_population?.disabled_percent || 0.13,
                  median_income: item.vulnerable_population?.median_income || 65000
                });

                return {
                  id: item.id,
                  location: item.location,
                  lat: coordinates.lat,
                  lng: coordinates.lng,
                  priority_score: item.priority_score,
                  priority_level: item.priority_level,
                  top_issue: item.top_issue,
                  vulnerable_population: item.vulnerable_population,
                  equity_factors: item.equity_factors,
                  recommended_timeline: item.recommended_timeline,
                  potential_impact: item.potential_impact,
                  rationale: item.rationale,
                  agent: item.agent || 'EquityAdvisor'
                };
              });

              return {
                scanResults,
                priorityList,
                recommendations: (results.recommendations || []).map(rec => ({
                  ...rec,
                  sdg_alignment: rec.sdg_alignment ? 
                    (Array.isArray(rec.sdg_alignment) ? rec.sdg_alignment : [rec.sdg_alignment]) : 
                    ['11']
                })),
                dataSource: results.metadata?.data_source || 'WatsonX Multi-Agent AI System',
                summary: results.summary || {},
                sdgAlignment: results.sdg_alignment || {},
                metadata: results.metadata || {}
              };
            } else if (status.status === 'failed') {
              throw new Error('WatsonX analysis failed');
            }
          } catch (statusError) {
            console.warn('Status check failed:', statusError);
          }
          
          attempts++;
        }
        
        throw new Error('WatsonX analysis timeout');
      }
    } catch (newAnalysisError) {
      console.error('Failed to start new WatsonX analysis:', newAnalysisError);
      throw newAnalysisError;
    }

  } catch (error) {
    console.error('❌ WatsonX API error:', error);
    
    return {
      scanResults: [],
      priorityList: [],
      recommendations: [],
      dataSource: 'WatsonX Required',
      summary: {
        total_issues_identified: 0,
        critical_issues: 0,
        error_occurred: true,
        message: 'WatsonX API connection required for analysis'
      }
    };
  }
};

// Function to start new multi-agent analysis
export const startMultiAgentAnalysis = async (state = 'CA') => {
  try {
    console.log(`🚀 Starting new multi-agent analysis for ${state}...`);
    const result = await multiAgentAPI.startCompleteAnalysis(state);
    return result;
  } catch (error) {
    console.error('Failed to start multi-agent analysis:', error);
    throw error;
  }
};

// Function to poll analysis status
export const pollAnalysisStatus = async (jobId, onStatusUpdate) => {
  const pollInterval = 2000; // Poll every 2 seconds
  const maxPolls = 150; // Maximum 5 minutes of polling
  let pollCount = 0;

  const poll = async () => {
    try {
      pollCount++;
      const status = await multiAgentAPI.getAnalysisStatus(jobId);
      
      if (onStatusUpdate) {
        onStatusUpdate(status);
      }
      
      if (status.status === 'completed') {
        const results = await multiAgentAPI.getAnalysisResults(jobId);
        return results;
      } else if (status.status === 'failed') {
        throw new Error(status.error || 'Analysis failed');
      } else if (pollCount >= maxPolls) {
        throw new Error('Analysis timeout - taking too long to complete');
      } else {
        // Continue polling
        setTimeout(() => poll(), pollInterval);
      }
    } catch (error) {
      console.error('Polling error:', error);
      throw error;
    }
  };

  return poll();
};

// Export individual agent functions for granular control
export const agentAPI = {
  scan: multiAgentAPI.runScanAnalysis.bind(multiAgentAPI),
  prioritize: multiAgentAPI.runPriorityAnalysis.bind(multiAgentAPI),
  plan: multiAgentAPI.runPlanningAnalysis.bind(multiAgentAPI),
  complete: multiAgentAPI.startCompleteAnalysis.bind(multiAgentAPI),
  status: multiAgentAPI.getAnalysisStatus.bind(multiAgentAPI),
  results: multiAgentAPI.getAnalysisResults.bind(multiAgentAPI),
  latest: multiAgentAPI.getLatestResults.bind(multiAgentAPI)
};

export default {
  fetchEquityAgentData
};

// Export MultiAgentAPI class for enhanced components
export { MultiAgentAPI };
