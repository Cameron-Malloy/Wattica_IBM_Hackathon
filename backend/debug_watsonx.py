#!/usr/bin/env python3
"""
Debug WatsonX AccessScanner to see why it's returning 0 results
"""
import os
import pandas as pd
from agents.access_scanner import AccessScannerAgent

# Load environment variables
os.environ['WATSONX_API_KEY'] = 'e_nRYlTAPoFVpd8iQiKXJRoRy43zkx5hv7B6uctsbkTO'
os.environ['WATSONX_PROJECT_ID'] = 'e418e3a6-0d2d-4990-986e-1888d9fa098e'

# Set up credentials
watsonx_creds = {
    'api_key': os.getenv('WATSONX_API_KEY'),
    'project_id': os.getenv('WATSONX_PROJECT_ID')
}

print("🔍 DEBUG: Testing WatsonX AccessScanner")
print(f"API Key loaded: {'✅' if watsonx_creds['api_key'] else '❌'}")
print(f"Project ID: {'✅' if watsonx_creds['project_id'] else '❌'}")

# Load real census data instead of sample data
from cleanVulnerabilityData import clean_data, add_vulnerability_score, prepare_data_for_agents

# Load real census data
census_file = "census_results/Population_Vulnerability_CA_clean_real.csv"
if not os.path.exists(census_file):
    print("❌ Real census data file not found. Please run the Census API first.")
    exit(1)

print(f"📊 Loading real census data from {census_file}")
raw_data = pd.read_csv(census_file)
print(f"✅ Loaded {len(raw_data)} real places from census data")

# Process the data for agents
processed_data = clean_data(raw_data)
processed_data = add_vulnerability_score(processed_data)
processed_data = prepare_data_for_agents(processed_data)

print(f"\n📊 Processed data: {len(processed_data)} rows")
print(processed_data.head())

try:
    # Create AccessScanner agent
    print("\n🤖 Initializing AccessScanner...")
    agent = AccessScannerAgent(watsonx_creds)
    print("✅ Agent created successfully")
    
    # Test scan
    print("\n🔍 Running accessibility scan...")
    results = agent.scan_accessibility_gaps(processed_data, 'CA')
    
    print(f"\n📊 RESULTS:")
    print(f"Total results: {len(results)}")
    
    if results:
        print("✅ WatsonX is working! Sample results:")
        for i, result in enumerate(results[:3]):
            print(f"{i+1}. {result['location']}")
            print(f"   Issue: {result['issue_type']} ({result['severity']})")
            print(f"   Description: {result['description']}")
            print(f"   Confidence: {result['confidence']}")
            print()
    else:
        print("❌ No results returned - check logs above for errors")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
