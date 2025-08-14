#!/usr/bin/env python3
"""
Standalone script to run only the PlannerBot with existing data
"""

import os
import sys
import json
import pandas as pd
import logging
from pathlib import Path

# Add the current directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agents.planner_bot import PlannerBotAgent
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

def load_existing_results(state: str):
    """Load existing scan results and priority areas"""
    
    # Load scan results
    scan_file = f"../accessmap-frontend/public/api_results/scan_results_{state}.json"
    if not os.path.exists(scan_file):
        raise FileNotFoundError(f"Scan results file not found: {scan_file}")
    
    with open(scan_file, 'r') as f:
        scan_data = json.load(f)
    
    # Load priority areas
    priority_file = f"../accessmap-frontend/public/api_results/priority_areas_{state}.json"
    if not os.path.exists(priority_file):
        raise FileNotFoundError(f"Priority areas file not found: {priority_file}")
    
    with open(priority_file, 'r') as f:
        priority_data = json.load(f)
    
    # Load census data
    census_file = f"census_results/Population_Vulnerability_{state}_clean_real.csv"
    if not os.path.exists(census_file):
        raise FileNotFoundError(f"Census data file not found: {census_file}")
    
    census_data = pd.read_csv(census_file)
    
    logger.info(f"✅ Loaded existing data:")
    logger.info(f"   - Scan results: {len(scan_data.get('scan_results', []))}")
    logger.info(f"   - Priority areas: {len(priority_data.get('priority_areas', []))}")
    logger.info(f"   - Census data: {len(census_data)} places")
    
    return scan_data.get('scan_results', []), priority_data.get('priority_areas', []), census_data

def run_planner_bot(scan_results, priority_areas, census_data, state: str):
    """Run the planner bot with existing data"""
    
    # Load WatsonX credentials
    watsonx_credentials = {
        "api_key": os.getenv("WATSONX_API_KEY"),
        "project_id": os.getenv("WATSONX_PROJECT_ID"),
        "url": os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
    }
    
    if not all([watsonx_credentials["api_key"], watsonx_credentials["project_id"]]):
        raise ValueError("Missing WatsonX credentials. Please set WATSONX_API_KEY and WATSONX_PROJECT_ID in .env file")
    
    # Initialize planner bot
    logger.info("🤖 Initializing PlannerBot...")
    planner_bot = PlannerBotAgent(watsonx_credentials)
    
    # Generate recommendations
    logger.info("🤖 Running PlannerBot analysis...")
    recommendations = planner_bot.generate_improvement_plans(scan_results, priority_areas, census_data, state)
    
    logger.info(f"✅ PlannerBot completed: {len(recommendations)} recommendations generated")
    return recommendations

def save_results(recommendations, state: str):
    """Save the recommendations"""
    
    # Create output directories
    frontend_dir = "../accessmap-frontend/public/api_results"
    backend_dir = "../census_results/multi_agent_analysis"
    
    os.makedirs(frontend_dir, exist_ok=True)
    os.makedirs(backend_dir, exist_ok=True)
    
    # Save for frontend consumption
    frontend_file = f"{frontend_dir}/recommendations_{state}.json"
    with open(frontend_file, 'w') as f:
        json.dump({"recommendations": recommendations}, f, indent=2)
    
    # Save backup copy
    backend_file = f"{backend_dir}/recommendations_{state}.json"
    with open(backend_file, 'w') as f:
        json.dump({"recommendations": recommendations}, f, indent=2)
    
    logger.info(f"💾 Recommendations saved to:")
    logger.info(f"  - Frontend: {frontend_file}")
    logger.info(f"  - Backend: {backend_file}")
    
    return frontend_file

def main():
    """Main function"""
    if len(sys.argv) != 2:
        print("Usage: python run_planner_only.py <STATE_ABBREVIATION>")
        print("Example: python run_planner_only.py CA")
        sys.exit(1)
    
    state = sys.argv[1].upper()
    logger.info(f"🎯 Starting PlannerBot-only analysis for state: {state}")
    
    try:
        # Step 1: Load existing data
        logger.info("📊 Step 1: Loading existing data...")
        scan_results, priority_areas, census_data = load_existing_results(state)
        
        # Step 2: Run planner bot
        logger.info("🤖 Step 2: Running PlannerBot...")
        recommendations = run_planner_bot(scan_results, priority_areas, census_data, state)
        
        # Step 3: Save results
        logger.info("💾 Step 3: Saving results...")
        save_results(recommendations, state)
        
        # Step 4: Display summary
        logger.info("📈 PlannerBot Results Summary:")
        logger.info(f"   - Total recommendations: {len(recommendations)}")
        logger.info(f"   - High impact: {len([r for r in recommendations if r.get('impact') == 'high'])}")
        logger.info(f"   - Medium impact: {len([r for r in recommendations if r.get('impact') == 'medium'])}")
        logger.info(f"   - Low impact: {len([r for r in recommendations if r.get('impact') == 'low'])}")
        
        logger.info("🏁 PlannerBot analysis completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Fatal error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
