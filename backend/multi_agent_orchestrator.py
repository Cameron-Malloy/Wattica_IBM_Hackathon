import pandas as pd
import json
import os
import logging
from typing import Dict, Any
from datetime import datetime
from dotenv import load_dotenv

try:
    from .agents.access_scanner import AccessScannerAgent
    from .agents.equity_advisor import EquityAdvisorAgent  
    from .agents.planner_bot import PlannerBotAgent
except ImportError:
    from agents.access_scanner import AccessScannerAgent
    from agents.equity_advisor import EquityAdvisorAgent  
    from agents.planner_bot import PlannerBotAgent
    
# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

class MultiAgentOrchestrator:
    """
    Multi-Agent Orchestrator for AccessMap System
    
    Coordinates the workflow: AccessScanner → EquityAdvisor → PlannerBot
    Implements the complete agentic AI pipeline for urban accessibility analysis
    """
    
    def __init__(self):
        # Load WatsonX credentials
        self.watsonx_credentials = {
            "api_key": os.getenv("WATSONX_API_KEY"),
            "project_id": os.getenv("WATSONX_PROJECT_ID"),
            "url": os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
        }
        
        if not all([self.watsonx_credentials["api_key"], self.watsonx_credentials["project_id"]]):
            raise ValueError("Missing WatsonX credentials. Please set WATSONX_API_KEY and WATSONX_PROJECT_ID in .env file")
        
        # Initialize agents
        logger.info("🤖 Initializing Multi-Agent System...")
        self.access_scanner = AccessScannerAgent(self.watsonx_credentials)
        self.equity_advisor = EquityAdvisorAgent(self.watsonx_credentials)
        self.planner_bot = PlannerBotAgent(self.watsonx_credentials)
        
        logger.info("✅ All agents initialized successfully")
    
    def run_complete_analysis(self, census_data: pd.DataFrame, state: str) -> Dict[str, Any]:
        """
        Run complete multi-agent analysis workflow
        
        Args:
            census_data: Cleaned census data DataFrame
            state: State abbreviation (e.g., 'CA')
            
        Returns:
            Complete analysis results from all agents
        """
        logger.info(f"🚀 Starting complete multi-agent analysis for {state}")
        
        analysis_start = datetime.now()
        
        try:
            # Step 1: AccessScanner - Identify accessibility gaps
            logger.info("📊 Step 1: Running AccessScanner analysis...")
            scan_results = self.access_scanner.scan_accessibility_gaps(census_data, state)
            logger.info(f"✅ AccessScanner completed: {len(scan_results)} accessibility issues identified")
            
            # Step 2: EquityAdvisor - Prioritize areas based on vulnerability
            logger.info("🎯 Step 2: Running EquityAdvisor analysis...")
            priority_areas = self.equity_advisor.prioritize_areas(scan_results, census_data, state)
            logger.info(f"✅ EquityAdvisor completed: {len(priority_areas)} priority areas identified")
            
            # Step 3: PlannerBot - Generate improvement recommendations
            logger.info("🤖 Step 3: Running PlannerBot analysis...")
            recommendations = self.planner_bot.generate_improvement_plans(scan_results, priority_areas, census_data, state)
            logger.info(f"✅ PlannerBot completed: {len(recommendations)} recommendations generated")
            
            # Compile final results
            analysis_duration = (datetime.now() - analysis_start).total_seconds()
            
            final_results = {
                "metadata": {
                    "state": state,
                    "analysis_date": datetime.now().isoformat(),
                    "analysis_duration_seconds": analysis_duration,
                    "total_locations_analyzed": len(census_data),
                    "agent_workflow": ["AccessScanner", "EquityAdvisor", "PlannerBot"],
                    "data_source": "Multi-Agent WatsonX Analysis"
                },
                "scan_results": scan_results,
                "priority_areas": priority_areas, 
                "recommendations": recommendations,
                "summary": {
                    "total_issues_identified": len(scan_results),
                    "critical_issues": len([s for s in scan_results if s.get('severity') == 'critical']),
                    "moderate_issues": len([s for s in scan_results if s.get('severity') == 'moderate']),
                    "immediate_priority_areas": len([p for p in priority_areas if p.get('priority_level') == 'Immediate']),
                    "high_impact_recommendations": len([r for r in recommendations if r.get('impact') == 'high'])
                },
                "sdg_alignment": {
                    "sdg_11_targets_addressed": [
                        "11.2: Accessible and affordable transport systems",
                        "11.3: Inclusive and sustainable urbanization", 
                        "11.7: Universal access to inclusive public spaces",
                        "11.C: Support sustainable and resilient building"
                    ],
                    "equity_focus": "Prioritizes vulnerable populations (elderly, disabled, low-income)",
                    "measurable_impact": f"Addresses accessibility needs across {len(census_data)} locations"
                }
            }
            
            logger.info(f"🎉 Multi-agent analysis completed successfully in {analysis_duration:.2f} seconds")
            logger.info(f"📈 Summary: {len(scan_results)} issues, {len(priority_areas)} priorities, {len(recommendations)} recommendations")
            
            return final_results
            
        except Exception as e:
            logger.error(f"❌ Multi-agent analysis failed: {e}")
            raise
    
    def save_results(self, results: Dict[str, Any], state: str) -> str:
        """
        Save multi-agent analysis results for frontend consumption
        
        Args:
            results: Complete analysis results
            state: State abbreviation
            
        Returns:
            Path to saved results file
        """
        # Create output directories
        frontend_dir = "../accessmap-frontend/public/api_results"
        backend_dir = "../census_results/multi_agent_analysis"
        
        os.makedirs(frontend_dir, exist_ok=True)
        os.makedirs(backend_dir, exist_ok=True)
        
        # Save for frontend consumption
        frontend_file = f"{frontend_dir}/multi_agent_analysis_{state}.json"
        with open(frontend_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        # Save backup copy
        backend_file = f"{backend_dir}/multi_agent_analysis_{state}.json"
        with open(backend_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        logger.info(f"💾 Results saved to:")
        logger.info(f"  - Frontend: {frontend_file}")
        logger.info(f"  - Backend: {backend_file}")
        
        return frontend_file
    
    def generate_executive_summary(self, results: Dict[str, Any]) -> str:
        """Generate executive summary for city officials"""
        summary = results.get("summary", {})
        metadata = results.get("metadata", {})
        
        executive_summary = f"""
# AccessMap AI Analysis Executive Summary
**Analysis Date:** {metadata.get('analysis_date', 'N/A')}
**Region:** {metadata.get('state', 'N/A')}
**Analysis Method:** Multi-Agent AI System (IBM WatsonX)

## Key Findings
- **Total Accessibility Issues Identified:** {summary.get('total_issues_identified', 0)}
- **Critical Priority Issues:** {summary.get('critical_issues', 0)}
- **Immediate Action Areas:** {summary.get('immediate_priority_areas', 0)}
- **High-Impact Recommendations:** {summary.get('high_impact_recommendations', 0)}

## SDG 11 Impact
This analysis directly supports UN Sustainable Development Goal 11: Sustainable Cities and Communities
- Focuses on accessible transportation and public spaces
- Prioritizes equity for vulnerable populations
- Provides measurable implementation roadmap

## Next Steps
1. Review immediate priority areas requiring 0-3 month action
2. Allocate resources for high-impact infrastructure improvements
3. Implement community engagement and monitoring programs
4. Establish regular accessibility auditing schedule

**AI Agents Used:** AccessScanner → EquityAdvisor → PlannerBot
**Powered by:** IBM WatsonX AI Platform
        """
        
        return executive_summary
