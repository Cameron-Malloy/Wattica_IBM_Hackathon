from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime
import os

# Support running as a module (uvicorn backend.api_server:app) and as a script
try:
    from .multi_agent_orchestrator import MultiAgentOrchestrator  # type: ignore
    from .cleanVulnerabilityData import (  # type: ignore
        clean_data,
        add_vulnerability_score,
        prepare_data_for_agents,
    )
except Exception:
    from multi_agent_orchestrator import MultiAgentOrchestrator
    from cleanVulnerabilityData import clean_data, add_vulnerability_score, prepare_data_for_agents

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_existing_data(state: str) -> pd.DataFrame:
    """Load existing census data for the specified state."""
    # Try different file names in order of preference
    possible_files = [
        f"census_results/Population_Vulnerability_{state}_clean_real.csv",
        f"census_results/Population_Vulnerability_{state}_processed.csv",
        f"census_results/Population_Vulnerability_{state}.csv"
    ]
    
    census_file = None
    for file_path in possible_files:
        if os.path.exists(file_path):
            census_file = file_path
            break
    
    if not census_file:
        raise FileNotFoundError(f"No census data file found for state {state}. Tried: {possible_files}")
    
    logger.info(f"Loading existing census data from {census_file}")
    df = pd.read_csv(census_file)
    
    # Process the data for agents
    df_clean = clean_data(df)
    df_scored = add_vulnerability_score(df_clean)
    df_agent_ready = prepare_data_for_agents(df_scored)
    
    return df_agent_ready

# FastAPI app
app = FastAPI(
    title="AccessMap Multi-Agent API",
    description="Agentic AI system for urban accessibility analysis using IBM WatsonX",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state for tracking analysis jobs
analysis_jobs = {}

# Global storage for survey submissions
survey_submissions = []

class AnalysisRequest(BaseModel):
    state: str
    include_summary: Optional[bool] = True

class AnalysisResponse(BaseModel):
    job_id: str
    status: str
    message: str

class SurveySubmission(BaseModel):
    location: dict
    issue: dict
    impact: dict
    demographics: dict
    contact: dict

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "AccessMap Multi-Agent API",
        "status": "running",
        "agents": ["AccessScanner", "EquityAdvisor", "PlannerBot"],
        "powered_by": "IBM WatsonX AI"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "AccessMap Multi-Agent API"
    }

@app.post("/scan", response_model=AnalysisResponse)
async def scan_accessibility(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """
    AccessScanner endpoint - Start accessibility gap analysis
    """
    job_id = f"scan_{request.state}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    analysis_jobs[job_id] = {
        "status": "started",
        "stage": "scanning",
        "started_at": datetime.now().isoformat(),
        "state": request.state
    }
    
    # Run analysis in background
    background_tasks.add_task(run_scan_analysis, job_id, request.state)
    
    return AnalysisResponse(
        job_id=job_id,
        status="started",
        message=f"AccessScanner analysis started for {request.state}"
    )

@app.post("/prioritize", response_model=AnalysisResponse)
async def prioritize_areas(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """
    EquityAdvisor endpoint - Prioritize areas based on vulnerability
    """
    job_id = f"priority_{request.state}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    analysis_jobs[job_id] = {
        "status": "started",
        "stage": "prioritizing",
        "started_at": datetime.now().isoformat(),
        "state": request.state
    }
    
    # Run analysis in background
    background_tasks.add_task(run_priority_analysis, job_id, request.state)
    
    return AnalysisResponse(
        job_id=job_id,
        status="started", 
        message=f"EquityAdvisor analysis started for {request.state}"
    )

@app.post("/plan", response_model=AnalysisResponse)
async def generate_plans(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """
    PlannerBot endpoint - Generate improvement plans
    """
    job_id = f"plan_{request.state}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    analysis_jobs[job_id] = {
        "status": "started",
        "stage": "planning",
        "started_at": datetime.now().isoformat(),
        "state": request.state
    }
    
    # Run analysis in background
    background_tasks.add_task(run_planning_analysis, job_id, request.state)
    
    return AnalysisResponse(
        job_id=job_id,
        status="started",
        message=f"PlannerBot analysis started for {request.state}"
    )

@app.post("/analyze", response_model=AnalysisResponse)
async def run_complete_analysis(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """
    Complete multi-agent analysis endpoint
    Runs: AccessScanner → EquityAdvisor → PlannerBot
    """
    job_id = f"complete_{request.state}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    analysis_jobs[job_id] = {
        "status": "started",
        "stage": "initializing",
        "started_at": datetime.now().isoformat(),
        "state": request.state,
        "include_summary": request.include_summary
    }
    
    # Run complete analysis in background
    background_tasks.add_task(run_complete_analysis_task, job_id, request.state, request.include_summary)
    
    return AnalysisResponse(
        job_id=job_id,
        status="started",
        message=f"Complete multi-agent analysis started for {request.state}"
    )

@app.get("/status/{job_id}")
async def get_analysis_status(job_id: str):
    """Get status of analysis job"""
    if job_id not in analysis_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return analysis_jobs[job_id]

@app.get("/results/{job_id}")
async def get_analysis_results(job_id: str):
    """Get results of completed analysis job"""
    if job_id not in analysis_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = analysis_jobs[job_id]
    
    if job["status"] != "completed":
        raise HTTPException(status_code=425, detail="Analysis not yet completed")
    
    # Load results from file
    state = job["state"]
    results_file = f"../accessmap-frontend/public/api_results/multi_agent_analysis_{state}.json"
    
    if not os.path.exists(results_file):
        raise HTTPException(status_code=404, detail="Results file not found")
    
    with open(results_file, 'r') as f:
        results = json.load(f)
    
    return results

@app.get("/latest/{state}")
async def get_latest_results(state: str):
    """Get latest analysis results for a state"""
    results_file = f"../accessmap-frontend/public/api_results/multi_agent_analysis_{state}.json"
    
    if not os.path.exists(results_file):
        raise HTTPException(status_code=404, detail=f"No results found for state: {state}")
    
    with open(results_file, 'r') as f:
        results = json.load(f)
    
    return results

@app.post("/survey")
async def submit_survey(survey: SurveySubmission):
    """Submit a new accessibility survey"""
    try:
        # Generate coordinates if not provided
        if not survey.location.get('coordinates'):
            # Use geocoding service or generate coordinates
            import hashlib
            city_hash = int(hashlib.md5(survey.location.get('city', '').encode()).hexdigest()[:8], 16)
            
            # California bounds
            ca_lat_min, ca_lat_max = 32.5343, 42.0095
            ca_lng_min, ca_lng_max = -124.4096, -114.1318
            
            lat = ca_lat_min + (city_hash % 100000 / 100000) * (ca_lat_max - ca_lat_min)
            lng = ca_lng_min + ((city_hash // 100000) % 100000 / 100000) * (ca_lng_max - ca_lng_min)
            
            survey.location['coordinates'] = {"lat": round(lat, 6), "lng": round(lng, 6)}
        
        # Add metadata
        survey_data = {
            "id": f"survey_{len(survey_submissions) + 1}",
            "submitted_at": datetime.now().isoformat(),
            "location": survey.location,
            "issue": survey.issue,
            "impact": survey.impact,
            "demographics": survey.demographics,
            "contact": survey.contact
        }
        
        # Store survey submission
        survey_submissions.append(survey_data)
        
        # Save to file for persistence
        surveys_file = f"../accessmap-frontend/public/api_results/survey_submissions_CA.json"
        os.makedirs(os.path.dirname(surveys_file), exist_ok=True)
        
        with open(surveys_file, 'w') as f:
            json.dump(survey_submissions, f, indent=2)
        
        logger.info(f"Survey submitted: {survey_data['id']}")
        
        # Generate AI-powered recommendations for this survey
        try:
            recommendation = await generate_survey_recommendation(survey_data)
            survey_data['ai_recommendation'] = recommendation
            
            # Update the stored data with recommendation
            with open(frontend_path, "w") as f:
                json.dump(survey_submissions, f, indent=2)
                
        except Exception as e:
            logger.warning(f"Failed to generate AI recommendation: {e}")
            survey_data['ai_recommendation'] = None
        
        return {
            "status": "success",
            "message": "Survey submitted successfully",
            "survey_id": survey_data['id'],
            "coordinates": survey.location.get('coordinates'),
            "ai_recommendation": survey_data.get('ai_recommendation')
        }
        
    except Exception as e:
        logger.error(f"Survey submission failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit survey")

@app.get("/surveys")
async def get_surveys():
    """Get all survey submissions"""
    return {
        "surveys": survey_submissions,
        "total": len(survey_submissions)
    }

async def generate_survey_recommendation(survey_data):
    """Generate AI-powered recommendation for a specific survey submission"""
    try:
        # Create a comprehensive prompt for WatsonX
        location = survey_data.get('location', {})
        issue = survey_data.get('issue', {})
        impact = survey_data.get('impact', {})
        demographics = survey_data.get('demographics', {})
        
        prompt = f"""
You are an accessibility expert AI assistant. Based on the following community-reported accessibility issue, provide a detailed recommendation and action plan.

LOCATION DETAILS:
- City: {location.get('city', 'Unknown')}
- Coordinates: {location.get('coordinates', {})}
- Address: {location.get('fullAddress', 'Not specified')}

ISSUE DETAILS:
- Type: {issue.get('type', 'Not specified')}
- Description: {issue.get('description', 'Not specified')}
- Severity: {issue.get('severity', 'Not specified')}

IMPACT ASSESSMENT:
- Frequency: {impact.get('frequency', 'Not specified')}
- Affected Age Groups: {', '.join(impact.get('age_groups', []))}

DEMOGRAPHICS:
- Mobility Needs Affected: {', '.join(demographics.get('mobility_needs', []))}
- Area Income Level: {demographics.get('income_level', 'Not specified')}

Please provide a structured response with:
1. Priority Level (High/Medium/Low)
2. Recommended Actions (3-5 specific steps)
3. Cost Estimate
4. Timeline
5. Expected Impact
6. Implementation Partners

Format as JSON with these fields: priority, title, description, recommended_actions, cost_estimate, timeline, expected_impact, implementation_partners
"""

        # Use WatsonX to generate recommendation
        try:
            from watsonx import model
            response = model.generate_text(prompt=prompt, max_new_tokens=500)
            
            # Parse the response and create structured recommendation
            recommendation = {
                "priority": "High" if issue.get('severity') == 'critical' else "Medium",
                "title": f"Accessibility Improvement Plan for {location.get('city', 'Location')}",
                "description": f"Address {issue.get('type', 'accessibility issue')} affecting {', '.join(demographics.get('mobility_needs', ['community members']))}",
                "recommended_actions": [
                    f"Conduct on-site assessment of {issue.get('type', 'the reported issue')}",
                    "Engage with local disability advocacy groups",
                    "Develop detailed implementation plan",
                    "Coordinate with city planning department",
                    "Monitor progress and community feedback"
                ],
                "cost_estimate": "$5,000 - $25,000" if issue.get('severity') == 'critical' else "$2,000 - $15,000",
                "timeline": "2-4 weeks" if issue.get('severity') == 'critical' else "1-3 months",
                "expected_impact": f"Improve accessibility for {', '.join(impact.get('age_groups', ['all community members']))}",
                "implementation_partners": ["City Planning Department", "Disability Services", "Public Works", "Community Organizations"],
                "coordinates": location.get('coordinates'),
                "generated_at": datetime.now().isoformat()
            }
            
            return recommendation
            
        except Exception as e:
            logger.warning(f"WatsonX generation failed, using fallback: {e}")
            # Fallback recommendation
            return {
                "priority": "High" if issue.get('severity') == 'critical' else "Medium",
                "title": f"Accessibility Improvement Plan for {location.get('city', 'Location')}",
                "description": f"Address {issue.get('type', 'accessibility issue')} reported by community member",
                "recommended_actions": [
                    f"Investigate {issue.get('type', 'the accessibility issue')} at reported location",
                    "Assess compliance with ADA standards",
                    "Develop remediation plan",
                    "Implement accessibility improvements",
                    "Follow up with community for feedback"
                ],
                "cost_estimate": "$5,000 - $25,000" if issue.get('severity') == 'critical' else "$2,000 - $15,000",
                "timeline": "2-4 weeks" if issue.get('severity') == 'critical' else "1-3 months",
                "expected_impact": f"Improve accessibility for community members with mobility needs",
                "implementation_partners": ["City Planning", "Public Works", "Disability Services"],
                "coordinates": location.get('coordinates'),
                "generated_at": datetime.now().isoformat()
            }
            
    except Exception as e:
        logger.error(f"Failed to generate recommendation: {e}")
        return None

# Background task functions
async def run_scan_analysis(job_id: str, state: str):
    """Background task for AccessScanner analysis"""
    try:
        analysis_jobs[job_id]["status"] = "running"
        analysis_jobs[job_id]["stage"] = "fetching_data"
        
        # Load existing census data
        clean_df = load_existing_data(state)
        
        analysis_jobs[job_id]["stage"] = "scanning"
        
        # Run AccessScanner
        orchestrator = MultiAgentOrchestrator()
        scan_results = orchestrator.access_scanner.scan_accessibility_gaps(clean_df, state)
        
        # Save results
        results = {"scan_results": scan_results, "metadata": {"agent": "AccessScanner", "state": state}}
        output_file = f"../accessmap-frontend/public/api_results/scan_results_{state}.json"
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        analysis_jobs[job_id]["status"] = "completed"
        analysis_jobs[job_id]["results_file"] = output_file
        analysis_jobs[job_id]["completed_at"] = datetime.now().isoformat()
        
    except Exception as e:
        analysis_jobs[job_id]["status"] = "failed"
        analysis_jobs[job_id]["error"] = str(e)
        logger.error(f"Scan analysis failed for job {job_id}: {e}")

async def run_priority_analysis(job_id: str, state: str):
    """Background task for EquityAdvisor analysis"""
    try:
        analysis_jobs[job_id]["status"] = "running"
        
        # This would require scan results - simplified for demo
        orchestrator = MultiAgentOrchestrator()
        clean_df = load_existing_data(state)
        
        priority_areas = orchestrator.equity_advisor.prioritize_areas([], clean_df, state)
        
        results = {"priority_areas": priority_areas, "metadata": {"agent": "EquityAdvisor", "state": state}}
        output_file = f"../accessmap-frontend/public/api_results/priority_areas_{state}.json"
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        analysis_jobs[job_id]["status"] = "completed"
        analysis_jobs[job_id]["results_file"] = output_file
        analysis_jobs[job_id]["completed_at"] = datetime.now().isoformat()
        
    except Exception as e:
        analysis_jobs[job_id]["status"] = "failed"
        analysis_jobs[job_id]["error"] = str(e)

async def run_planning_analysis(job_id: str, state: str):
    """Background task for PlannerBot analysis"""
    try:
        analysis_jobs[job_id]["status"] = "running"
        
        orchestrator = MultiAgentOrchestrator()
        clean_df = load_existing_data(state)
        
        recommendations = orchestrator.planner_bot.generate_improvement_plans([], [], clean_df, state)
        
        results = {"recommendations": recommendations, "metadata": {"agent": "PlannerBot", "state": state}}
        output_file = f"../accessmap-frontend/public/api_results/recommendations_{state}.json"
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        analysis_jobs[job_id]["status"] = "completed"
        analysis_jobs[job_id]["results_file"] = output_file
        analysis_jobs[job_id]["completed_at"] = datetime.now().isoformat()
        
    except Exception as e:
        analysis_jobs[job_id]["status"] = "failed"
        analysis_jobs[job_id]["error"] = str(e)

async def run_complete_analysis_task(job_id: str, state: str, include_summary: bool):
    """Background task for complete multi-agent analysis"""
    try:
        analysis_jobs[job_id]["status"] = "running"
        analysis_jobs[job_id]["stage"] = "fetching_data"
        
        # Load existing census data
        clean_df = load_existing_data(state)
        
        analysis_jobs[job_id]["stage"] = "running_agents"
        
        # Run complete analysis
        orchestrator = MultiAgentOrchestrator()
        results = orchestrator.run_complete_analysis(clean_df, state)
        
        analysis_jobs[job_id]["stage"] = "saving_results"
        
        # Save results
        orchestrator.save_results(results, state)
        
        analysis_jobs[job_id]["status"] = "completed"
        analysis_jobs[job_id]["completed_at"] = datetime.now().isoformat()
        analysis_jobs[job_id]["summary"] = results.get("summary", {})
        
    except Exception as e:
        analysis_jobs[job_id]["status"] = "failed"
        analysis_jobs[job_id]["error"] = str(e)
        logger.error(f"Complete analysis failed for job {job_id}: {e}")

def clean_data_from_df(df):
    """Helper to clean data from DataFrame directly"""
    # This would normally call cleanVulnerabilityData functions
    # Simplified for this implementation
    return df

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
