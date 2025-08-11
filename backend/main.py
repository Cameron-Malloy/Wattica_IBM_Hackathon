#!/usr/bin/env python3
"""
Main entry point for the AccessMap Equity Agent System

This script now uses the comprehensive real census data with 1,349+ places in California.
"""

import os
import sys
import logging
import pandas as pd
from pathlib import Path

# Import the data processing functions
from cleanVulnerabilityData import clean_data, add_vulnerability_score, prepare_data_for_agents
from multi_agent_orchestrator import MultiAgentOrchestrator

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def load_existing_data(state: str) -> pd.DataFrame:
    """Load existing census data for the specified state."""
    # Only use real Census API data
    census_file = f"census_results/Population_Vulnerability_{state}_clean_real.csv"
    if not os.path.exists(census_file):
        raise FileNotFoundError(f"Real census data file not found: {census_file}. Please run the Census API first.")
    
    logger.info(f"Loading real census data from {census_file}")
    df = pd.read_csv(census_file)
    logger.info(f"✅ Loaded real census data: {len(df)} places")
    return df

def process_data_for_agents(df: pd.DataFrame, state: str) -> pd.DataFrame:
    """Process the census data for agent analysis."""
    logger.info(f"Processing data for {len(df)} places in {state}")
    
    # If we have real data, it's already clean, just add vulnerability scores
    if "_clean_real" in str(df):
        logger.info("Data is already clean, adding vulnerability scores...")
        df_scored = add_vulnerability_score(df)
        df_agent_ready = prepare_data_for_agents(df_scored)
    else:
        # Process sample data through full pipeline
        logger.info("Processing sample data through full pipeline...")
        df_clean = clean_data(df)
        df_scored = add_vulnerability_score(df_clean)
        df_agent_ready = prepare_data_for_agents(df_scored)
    
    # Save processed data
    output_file = f"census_results/Population_Vulnerability_{state}_processed.csv"
    df_agent_ready.to_csv(output_file, index=False)
    logger.info(f"💾 Processed data saved to: {output_file}")
    
    return df_agent_ready

def run_multi_agent_analysis(df: pd.DataFrame, state: str) -> dict:
    """Run the multi-agent analysis on the processed data."""
    logger.info(f"Running multi-agent analysis on {len(df)} places")
    
    try:
        # Initialize the multi-agent orchestrator
        orchestrator = MultiAgentOrchestrator()
        
        # Run the complete analysis
        results = orchestrator.run_complete_analysis(df, state)
        
        logger.info("✅ Multi-agent analysis completed successfully")
        return results
        
    except Exception as e:
        logger.error(f"❌ Error in multi-agent analysis: {str(e)}")
        raise

def main():
    """Main function to orchestrate the entire pipeline."""
    if len(sys.argv) != 2:
        print("Usage: python main.py <STATE_ABBREVIATION>")
        print("Example: python main.py CA")
        sys.exit(1)
    
    state = sys.argv[1].upper()
    logger.info(f"🎯 Starting AccessMap Equity Agent System for state: {state}")
    
    try:
        # Step 1: Load census data
        logger.info("📊 Step 1: Loading census data...")
        census_data = load_existing_data(state)
        
        # Step 2: Process data for agents
        logger.info("🔧 Step 2: Processing data for agents...")
        processed_data = process_data_for_agents(census_data, state)
        
        # Step 3: Run multi-agent analysis
        logger.info("🤖 Step 3: Running multi-agent analysis...")
        results = run_multi_agent_analysis(processed_data, state)
        
        # Step 4: Display results summary
        logger.info("📈 Analysis Results Summary:")
        logger.info(f"   - Total places analyzed: {len(processed_data)}")
        logger.info(f"   - High priority areas: {len(processed_data[processed_data['priority_level'] == 'High'])}")
        logger.info(f"   - Medium priority areas: {len(processed_data[processed_data['priority_level'] == 'Medium'])}")
        logger.info(f"   - Low priority areas: {len(processed_data[processed_data['priority_level'] == 'Low'])}")
        
        logger.info("🏁 AccessMap Equity Agent System completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Fatal error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
