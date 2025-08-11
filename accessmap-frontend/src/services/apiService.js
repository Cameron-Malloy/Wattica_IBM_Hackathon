/**
 * Comprehensive API Service for AccessMap Frontend
 * Handles all backend communication with proper error handling and real-time updates
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8002';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.activeJobs = new Map();
    this.statusPollers = new Map();
  }

  /**
   * Make HTTP request with proper error handling
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    return this.makeRequest('/health');
  }

  /**
   * Start complete multi-agent analysis
   */
  async startCompleteAnalysis(payload = { state: 'CA' }) {
    const body = {
      state: (payload.state || 'CA').toUpperCase(),
      include_summary: payload.include_summary !== false,
    };

    const result = await this.makeRequest('/analyze', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    // Track the job
    this.activeJobs.set(result.job_id, {
      type: 'complete',
      state: body.state,
      startedAt: new Date(),
      status: 'started',
    });

    return result;
  }

  /**
   * Start individual agent analysis
   */
  async startScanAnalysis(state = 'CA') {
    const result = await this.makeRequest('/scan', {
      method: 'POST',
      body: JSON.stringify({ state: state.toUpperCase() }),
    });

    this.activeJobs.set(result.job_id, {
      type: 'scan',
      state: state.toUpperCase(),
      startedAt: new Date(),
      status: 'started',
    });

    return result;
  }

  async startPriorityAnalysis(state = 'CA') {
    const result = await this.makeRequest('/prioritize', {
      method: 'POST',
      body: JSON.stringify({ state: state.toUpperCase() }),
    });

    this.activeJobs.set(result.job_id, {
      type: 'priority',
      state: state.toUpperCase(),
      startedAt: new Date(),
      status: 'started',
    });

    return result;
  }

  async startPlanningAnalysis(state = 'CA') {
    const result = await this.makeRequest('/plan', {
      method: 'POST',
      body: JSON.stringify({ state: state.toUpperCase() }),
    });

    this.activeJobs.set(result.job_id, {
      type: 'plan',
      state: state.toUpperCase(),
      startedAt: new Date(),
      status: 'started',
    });

    return result;
  }

  /**
   * Get analysis status
   */
  async getAnalysisStatus(jobId) {
    return this.makeRequest(`/status/${jobId}`);
  }

  /**
   * Get analysis results
   */
  async getAnalysisResults(jobId) {
    return this.makeRequest(`/results/${jobId}`);
  }

  /**
   * Get latest results for a state
   */
  async getLatestResults(state = 'CA') {
    return this.makeRequest(`/latest/${state.toUpperCase()}`);
  }

  /**
   * Poll job status with real-time updates
   */
  startStatusPolling(jobId, onStatusUpdate, onComplete, onError) {
    // Clear existing poller if any
    this.stopStatusPolling(jobId);

    const poller = setInterval(async () => {
      try {
        const status = await this.getAnalysisStatus(jobId);
        
        // Update active jobs
        if (this.activeJobs.has(jobId)) {
          this.activeJobs.get(jobId).status = status.status;
          this.activeJobs.get(jobId).stage = status.stage;
        }

        // Call status update callback
        if (onStatusUpdate) {
          onStatusUpdate(status);
        }

        // Check if job is complete
        if (status.status === 'completed') {
          this.stopStatusPolling(jobId);
          
          try {
            const results = await this.getAnalysisResults(jobId);
            if (onComplete) {
              onComplete(results);
            }
          } catch (error) {
            if (onError) {
              onError(error);
            }
          }
        } else if (status.status === 'failed') {
          this.stopStatusPolling(jobId);
          if (onError) {
            onError(new Error(status.message || 'Analysis failed'));
          }
        }
      } catch (error) {
        this.stopStatusPolling(jobId);
        if (onError) {
          onError(error);
        }
      }
    }, 2000); // Poll every 2 seconds

    this.statusPollers.set(jobId, poller);
  }

  /**
   * Stop status polling for a job
   */
  stopStatusPolling(jobId) {
    const poller = this.statusPollers.get(jobId);
    if (poller) {
      clearInterval(poller);
      this.statusPollers.delete(jobId);
    }
  }

  /**
   * Stop all status polling
   */
  stopAllPolling() {
    this.statusPollers.forEach((poller) => clearInterval(poller));
    this.statusPollers.clear();
  }

  /**
   * Get all active jobs
   */
  getActiveJobs() {
    return Array.from(this.activeJobs.entries()).map(([jobId, job]) => ({
      jobId,
      ...job,
    }));
  }

  /**
   * Clear completed jobs
   */
  clearCompletedJobs() {
    for (const [jobId, job] of this.activeJobs.entries()) {
      if (job.status === 'completed' || job.status === 'failed') {
        this.activeJobs.delete(jobId);
        this.stopStatusPolling(jobId);
      }
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
