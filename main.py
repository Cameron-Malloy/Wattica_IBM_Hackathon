#!/usr/bin/env python3
"""
Main entry point for the AccessMap Equity Agent System

This script orchestrates the complete workflow:
1. Load existing census data
2. Process and enhance the data for agent analysis
3. Run the multi-agent analysis pipeline
4. Generate comprehensive accessibility reports
"""

import os
import sys
import logging
import pandas as pd
from pathlib import Path

# Import from EquityAgent directory
from EquityAgent.cleanVulnerabilityData import clean_data, add_vulnerability_score, prepare_data_for_agents
from EquityAgent.multi_agent_orchestrator import MultiAgentOrchestrator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def load_existing_data(state: str) -> pd.DataFrame:
    """
    Load existing census data for the specified state.
    
    Args:
        state (str): State abbreviation (e.g., 'CA')
        
    Returns:
        pd.DataFrame: Loaded census data
    """
    census_file = f"EquityAgent/census_results/Population_Vulnerability_{state}.csv"
    
    if not os.path.exists(census_file):
        logger.error(f"Census data file not found: {census_file}")
        logger.info("Available files:")
        census_dir = Path("EquityAgent/census_results")
        if census_dir.exists():
            for file in census_dir.glob("*.csv"):
                logger.info(f"  - {file.name}")
        sys.exit(1)
    
    logger.info(f"📁 Loading existing census data from {census_file}")
    df = pd.read_csv(census_file)
    logger.info(f"✅ Loaded {len(df)} locations for {state}")
    
    return df

def process_data_for_agents(df: pd.DataFrame, state: str) -> pd.DataFrame:
    """
    Process the census data to prepare it for agent analysis.
    
    Args:
        df (pd.DataFrame): Raw census data
        state (str): State abbreviation
        
    Returns:
        pd.DataFrame: Processed data ready for agents
    """
    logger.info("🔄 Processing data for multi-agent analysis...")
    
    # Clean the data
    df_clean = clean_data(df)
    
    # Add vulnerability scores
    df_scored = add_vulnerability_score(df_clean)
    
    # Prepare for agents
    df_agent_ready = prepare_data_for_agents(df_scored)
    
    # Save processed data
    processed_file = f"EquityAgent/census_results/Population_Vulnerability_{state}_processed.csv"
    df_agent_ready.to_csv(processed_file, index=False)
    logger.info(f"💾 Saved processed data to {processed_file}")
    
    return df_agent_ready

def run_multi_agent_analysis(df: pd.DataFrame, state: str) -> dict:
    """
    Run the complete multi-agent analysis pipeline.
    
    Args:
        df (pd.DataFrame): Processed data ready for agents
        state (str): State abbreviation
        
    Returns:
        dict: Complete analysis results
    """
    logger.info("🤖 Starting multi-agent analysis pipeline...")
    
    try:
        # Initialize the orchestrator
        orchestrator = MultiAgentOrchestrator()
        
        # Run the complete analysis
        results = orchestrator.run_complete_analysis(df, state)
        
        # Save results
        results_file = orchestrator.save_results(results, state)
        logger.info(f"💾 Analysis results saved to {results_file}")
        
        # Generate executive summary
        summary = orchestrator.generate_executive_summary(results)
        logger.info("📋 Executive Summary Generated")
        
        return results
        
    except Exception as e:
        logger.error(f"❌ Error during multi-agent analysis: {str(e)}")
        logger.error("This might be due to missing WatsonX credentials or API issues")
        logger.info("Please check your .env file for WATSONX_API_KEY and WATSONX_PROJECT_ID")
        return None

def main():
    """Main execution function."""
    logger.info("🚀 Starting AccessMap Equity Agent System")
    
    # Check command line arguments
    if len(sys.argv) != 2:
        print("Usage: python main.py <STATE_ABBREVIATION>")
        print("Example: python main.py CA")
        print("\nAvailable states: CA, NY, TX, FL, etc.")
        sys.exit(1)
    
    state = sys.argv[1].upper()
    logger.info(f"🎯 Processing state: {state}")
    
    try:
        # Step 1: Load existing data
        census_data = load_existing_data(state)
        
        # Step 2: Process data for agents
        processed_data = process_data_for_agents(census_data, state)
        
        # Step 3: Run multi-agent analysis
        logger.info("🎬 Starting multi-agent analysis...")
        results = run_multi_agent_analysis(processed_data, state)
        
        if results:
            logger.info("🎉 Multi-agent analysis completed successfully!")
            logger.info(f"📊 Analyzed {len(processed_data)} locations in {state}")
            
            # Display summary statistics
            summary = results.get('summary', {})
            logger.info(f"🔍 Total issues identified: {summary.get('total_issues_identified', 'N/A')}")
            logger.info(f"🚨 Critical issues: {summary.get('critical_issues', 'N/A')}")
            logger.info(f"🎯 Immediate priority areas: {summary.get('immediate_priority_areas', 'N/A')}")
            
        else:
            logger.warning("⚠️ Multi-agent analysis failed, but data processing completed")
            logger.info("You can still use the processed data for manual analysis")
        
    except Exception as e:
        logger.error(f"❌ Fatal error: {str(e)}")
        sys.exit(1)
    
    logger.info("🏁 AccessMap Equity Agent System completed")

if __name__ == "__main__":
    main()