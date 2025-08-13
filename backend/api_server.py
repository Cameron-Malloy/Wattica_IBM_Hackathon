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

def merge_survey_recommendations_to_main_analysis(state: str = "CA"):
    """
    Merge survey-based recommendations into the main multi-agent analysis results
    so they appear on the map and dashboard
    """
    try:
        # Load existing multi-agent analysis results
        main_analysis_file = f"../accessmap-frontend/public/api_results/multi_agent_analysis_{state}.json"
        
        if not os.path.exists(main_analysis_file):
            logger.warning(f"Main analysis file not found: {main_analysis_file}")
            return
        
        with open(main_analysis_file, 'r') as f:
            main_analysis = json.load(f)
        
        # Get survey recommendations
        survey_recommendations = []
        for survey in survey_submissions:
            if survey.get('ai_recommendation'):
                recommendation = survey['ai_recommendation'].copy()
                # Add survey context to the recommendation
                recommendation['id'] = f"survey_rec_{survey['id']}"
                recommendation['survey_id'] = survey['id']
                recommendation['survey_location'] = survey['location']
                recommendation['survey_issue'] = survey['issue']
                recommendation['submitted_at'] = survey['submitted_at']
                recommendation['survey_based'] = True
                recommendation['agent'] = "SurveyBot"  # Distinguish from PlannerBot
                recommendation['generated_date'] = datetime.now().strftime('%Y-%m-%d')
                survey_recommendations.append(recommendation)
        
        if survey_recommendations:
            # Add survey recommendations to the main analysis
            if 'recommendations' not in main_analysis:
                main_analysis['recommendations'] = []
            
            # Add survey recommendations at the beginning (higher priority)
            main_analysis['recommendations'] = survey_recommendations + main_analysis['recommendations']
            
            # Update metadata to reflect survey integration
            if 'metadata' not in main_analysis:
                main_analysis['metadata'] = {}
            
            main_analysis['metadata']['survey_recommendations_included'] = True
            main_analysis['metadata']['total_survey_recommendations'] = len(survey_recommendations)
            main_analysis['metadata']['last_updated'] = datetime.now().isoformat()
            
            # Save updated analysis
            with open(main_analysis_file, 'w') as f:
                json.dump(main_analysis, f, indent=2)
            
            # Also update the backend copy
            backend_file = f"../census_results/multi_agent_analysis/multi_agent_analysis_{state}.json"
            if os.path.exists(backend_file):
                with open(backend_file, 'w') as f:
                    json.dump(main_analysis, f, indent=2)
            
            logger.info(f"✅ Merged {len(survey_recommendations)} survey recommendations into main analysis")
            
    except Exception as e:
        logger.error(f"Failed to merge survey recommendations: {e}")

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
        
        # Generate AI-powered recommendations for this survey using WatsonX
        try:
            recommendation = await generate_survey_recommendation(survey_data)
            if recommendation:
                survey_data['ai_recommendation'] = recommendation
                survey_data['watsonx_generated'] = True
                
                # Update the stored data with recommendation
                with open(surveys_file, "w") as f:
                    json.dump(survey_submissions, f, indent=2)
                    
                logger.info(f"✅ Survey {survey_data['id']}: WatsonX recommendation generated successfully")
                
                # Merge survey recommendation into main analysis for map/dashboard display
                merge_survey_recommendations_to_main_analysis("CA")
                
            else:
                raise Exception("WatsonX returned null recommendation")
                
        except Exception as e:
            logger.error(f"Failed to generate WatsonX recommendation for survey {survey_data['id']}: {e}")
            # Remove the survey from submissions since it failed
            survey_submissions.pop()
            # Update the file without the failed survey
            with open(surveys_file, "w") as f:
                json.dump(survey_submissions, f, indent=2)
            raise HTTPException(status_code=500, detail=f"Failed to generate AI recommendation: {str(e)}")
        
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

@app.get("/survey-recommendations")
async def get_survey_recommendations():
    """Get all AI-generated recommendations from survey submissions"""
    recommendations = []
    
    for survey in survey_submissions:
        if survey.get('ai_recommendation'):
            recommendation = survey['ai_recommendation'].copy()
            # Add survey context to the recommendation
            recommendation['id'] = f"survey_rec_{survey['id']}"
            recommendation['survey_id'] = survey['id']
            recommendation['survey_location'] = survey['location']
            recommendation['survey_issue'] = survey['issue']
            recommendation['submitted_at'] = survey['submitted_at']
            recommendation['survey_based'] = True
            recommendations.append(recommendation)
    
    return {
        "recommendations": recommendations,
        "total": len(recommendations)
    }

@app.post("/merge-survey-recommendations")
async def merge_survey_recommendations(state: str = "CA"):
    """Manually trigger merging of survey recommendations into main analysis"""
    try:
        merge_survey_recommendations_to_main_analysis(state)
        return {
            "status": "success",
            "message": f"Survey recommendations merged into main analysis for {state}",
            "total_surveys": len(survey_submissions),
            "surveys_with_recommendations": len([s for s in survey_submissions if s.get('ai_recommendation')])
        }
    except Exception as e:
        logger.error(f"Failed to merge survey recommendations: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to merge survey recommendations: {str(e)}")

async def generate_survey_recommendation(survey_data):
    """Generate AI-powered recommendation for a specific survey submission"""
    try:
        # Create a comprehensive prompt for WatsonX
        location = survey_data.get('location', {})
        issue = survey_data.get('issue', {})
        impact = survey_data.get('impact', {})
        demographics = survey_data.get('demographics', {})
        
        prompt = f"""You are an expert accessibility consultant and urban planner specializing in creating comprehensive, actionable improvement plans for accessibility issues. You have deep knowledge of ADA compliance, universal design principles, and community engagement strategies.

CONTEXT:
Location: {location.get('city', 'Location')}, California
Issue Type: {issue.get('type', 'accessibility issue')}
Issue Description: {issue.get('description', 'Not specified')}
Severity: {issue.get('severity', 'Not specified')}
Affected Groups: {', '.join(demographics.get('mobility_needs', ['community members']))}
Impact Frequency: {impact.get('frequency', 'Not specified')}
Age Groups Affected: {', '.join(impact.get('age_groups', ['all ages']))}

Create a comprehensive, detailed accessibility improvement plan that addresses the specific issue while considering the unique needs of the affected population and the local context.

IMPORTANT: Return ONLY the JSON object below. Do not include any additional text, explanations, or disclaimers.

{{
  "priority": "{'High' if issue.get('severity') == 'critical' else 'Medium' if issue.get('severity') == 'moderate' else 'Low'}",
  "title": "Comprehensive Accessibility Improvement Plan for {location.get('city', 'Location')} - {issue.get('type', 'Accessibility Issue').replace('_', ' ').title()}",
  "description": "A detailed, community-focused plan to address {issue.get('type', 'accessibility issue').replace('_', ' ')} affecting {', '.join(demographics.get('mobility_needs', ['community members']))} in {location.get('city', 'Location')}. This plan prioritizes safety, independence, and equitable access for all residents.",
  "recommended_actions": [
    "Conduct comprehensive on-site accessibility audit with certified accessibility experts",
    "Engage with local disability advocacy groups and affected community members",
    "Perform detailed cost-benefit analysis and secure funding sources",
    "Develop phased implementation timeline with clear milestones",
    "Coordinate with city planning, public works, and disability services departments",
    "Implement ADA-compliant solutions following universal design principles",
    "Establish regular maintenance and monitoring protocols",
    "Create community education and awareness programs",
    "Conduct post-implementation accessibility assessments",
    "Establish feedback mechanisms for continuous improvement"
  ],
  "cost_estimate": "{'$25,000 - $100,000' if issue.get('severity') == 'critical' else '$15,000 - $50,000' if issue.get('severity') == 'moderate' else '$5,000 - $25,000'}",
  "timeline": "{'8-16 weeks' if issue.get('severity') == 'critical' else '6-12 weeks' if issue.get('severity') == 'moderate' else '4-8 weeks'}",
  "expected_impact": "Significantly improve accessibility, safety, and independence for {', '.join(impact.get('age_groups', ['all community members']))} with {', '.join(demographics.get('mobility_needs', ['diverse mobility needs']))}, enhancing quality of life and community participation.",
  "implementation_partners": [
    "City Planning Department",
    "Public Works Department", 
    "Disability Services Office",
    "Local Disability Advocacy Groups",
    "Community Organizations",
    "Accessibility Consultants",
    "Transportation Authority",
    "Health and Human Services"
  ],
  "locations_affected": "1",
  "type": "infrastructure",
  "detailed_plan": "Phase 1 (Weeks 1-2): Comprehensive assessment and community engagement. Phase 2 (Weeks 3-8): Design and planning with stakeholder input. Phase 3 (Weeks 9-12): Implementation and testing. Phase 4 (Weeks 13-16): Verification, training, and ongoing monitoring.",
  "success_metrics": [
    "100% ADA compliance verification",
    "95% community satisfaction rate",
    "90% reduction in accessibility barriers",
    "Increased community participation by 40%",
    "Zero safety incidents related to accessibility",
    "Improved independence scores for affected populations"
  ],
  "equity_impact": "This plan directly addresses the needs of {', '.join(demographics.get('mobility_needs', ['vulnerable populations']))} in {location.get('city', 'Location')}, promoting social equity, community inclusion, and equal access to public spaces and services. It prioritizes the most affected populations and ensures their voices are central to the implementation process."
}}"""

        # Use WatsonX to generate recommendation with retry logic
        from ibm_watsonx_ai.foundation_models import Model
        from ibm_watsonx_ai import Credentials
        import os
        
        # Get WatsonX credentials
        api_key = os.getenv("WATSONX_API_KEY")
        project_id = os.getenv("WATSONX_PROJECT_ID")
        region = os.getenv("WATSONX_REGION", "us-south")
        
        if not api_key or not project_id:
            raise Exception("WatsonX credentials not configured")
        
        # Initialize WatsonX model
        creds = Credentials(api_key=api_key, url="https://us-south.ml.cloud.ibm.com")
        model = Model(
            model_id="ibm/granite-3-3-8b-instruct",
            credentials=creds,
            project_id=project_id
        )
        
        # Retry WatsonX generation up to 3 times
        max_retries = 3
        output_text = None
        
        for attempt in range(max_retries):
            try:
                response = model.generate(
                    prompt=prompt,
                    params={
                        'max_new_tokens': 1000,  # Increase token limit
                        'temperature': 0.7,      # Add some creativity
                        'top_p': 0.9,           # Control response diversity
                        'repetition_penalty': 1.1  # Prevent repetition
                    }
                )
                
                # Handle different response formats
                if hasattr(response, 'generated_text'):
                    output_text = response.generated_text
                elif hasattr(response, 'results') and response.results:
                    output_text = response.results[0].get('generated_text', '')
                elif isinstance(response, dict) and 'results' in response:
                    output_text = response['results'][0].get('generated_text', '')
                elif isinstance(response, dict) and 'generated_text' in response:
                    output_text = response['generated_text']
                else:
                    output_text = str(response)
                
                # If we get here, the generation was successful
                break
                
            except Exception as e:
                logger.error(f"WatsonX generation attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    raise Exception(f"WatsonX generation failed after {max_retries} attempts: {e}")
                continue
        
        # Try to parse JSON from the response
        if output_text:
            try:
                import json
                import re
                
                # Extract JSON from the response
                json_match = re.search(r'\{.*\}', output_text, re.DOTALL)
                if json_match:
                    parsed_recommendation = json.loads(json_match.group())
                    
                    # Create structured recommendation with parsed data
                    recommendation = {
                        "priority": parsed_recommendation.get("priority", "High" if issue.get('severity') == 'critical' else "Medium"),
                        "title": parsed_recommendation.get("title", f"Accessibility Improvement Plan for {location.get('city', 'Location')}"),
                        "description": parsed_recommendation.get("description", f"Address {issue.get('type', 'accessibility issue')} affecting {', '.join(demographics.get('mobility_needs', ['community members']))}"),
                        "recommended_actions": parsed_recommendation.get("recommended_actions", [
                            f"Conduct on-site assessment of {issue.get('type', 'the reported issue')}",
                            "Engage with local disability advocacy groups",
                            "Develop detailed implementation plan",
                            "Coordinate with city planning department",
                            "Monitor progress and community feedback"
                        ]),
                        "cost_estimate": parsed_recommendation.get("cost_estimate", "$5,000 - $25,000" if issue.get('severity') == 'critical' else "$2,000 - $15,000"),
                        "timeline": parsed_recommendation.get("timeline", "2-4 weeks" if issue.get('severity') == 'critical' else "1-3 months"),
                        "expected_impact": parsed_recommendation.get("expected_impact", f"Improve accessibility for {', '.join(impact.get('age_groups', ['all community members']))}"),
                        "implementation_partners": parsed_recommendation.get("implementation_partners", ["City Planning Department", "Disability Services", "Public Works", "Community Organizations"]),
                        "locations_affected": "1",  # Survey-based recommendations only affect the reported location
                        "type": parsed_recommendation.get("type", "infrastructure"),
                        "coordinates": location.get('coordinates'),
                        "target_locations": [location.get('city', 'Unknown City')],  # Only the reported city
                        "generated_at": datetime.now().isoformat(),
                        "watsonx_generated": True
                    }
                    
                    logger.info(f"✅ Successfully generated WatsonX recommendation for survey")
                    return recommendation
                else:
                    raise Exception("No JSON found in response")
                    
            except Exception as parse_error:
                logger.error(f"Failed to parse WatsonX response: {parse_error}")
                logger.error(f"Raw response: {output_text}")
                logger.error(f"Response type: {type(output_text)}")
                logger.error(f"Response length: {len(output_text) if output_text else 0}")
                raise Exception("Failed to generate AI recommendation - WatsonX response could not be parsed")
        else:
            raise Exception("No output text received from WatsonX")
            
    except Exception as e:
        logger.error(f"Failed to generate recommendation: {e}")
        raise Exception(f"Failed to generate AI recommendation: {e}")

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
