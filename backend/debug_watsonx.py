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

# Create sample census data with more cities
sample_data = pd.DataFrame([
    {
        'place': 'Los Angeles city, CA',
        'percent_over_65': 0.12,
        'percent_disabled': 0.09,
        'median_income': 65000
    },
    {
        'place': 'San Francisco city, CA',
        'percent_over_65': 0.18,
        'percent_disabled': 0.11,
        'median_income': 85000
    },
    {
        'place': 'Oakland city, CA',
        'percent_over_65': 0.14,
        'percent_disabled': 0.13,
        'median_income': 55000
    },
    {
        'place': 'San Diego city, CA',
        'percent_over_65': 0.15,
        'percent_disabled': 0.10,
        'median_income': 70000
    },
    {
        'place': 'Sacramento city, CA',
        'percent_over_65': 0.13,
        'percent_disabled': 0.12,
        'median_income': 60000
    },
    {
        'place': 'Fresno city, CA',
        'percent_over_65': 0.11,
        'percent_disabled': 0.14,
        'median_income': 45000
    },
    {
        'place': 'Long Beach city, CA',
        'percent_over_65': 0.16,
        'percent_disabled': 0.11,
        'median_income': 68000
    },
    {
        'place': 'Bakersfield city, CA',
        'percent_over_65': 0.10,
        'percent_disabled': 0.13,
        'median_income': 52000
    },
    {
        'place': 'Anaheim city, CA',
        'percent_over_65': 0.14,
        'percent_disabled': 0.09,
        'median_income': 72000
    },
    {
        'place': 'Santa Ana city, CA',
        'percent_over_65': 0.13,
        'percent_disabled': 0.10,
        'median_income': 58000
    }
])

print(f"\n📊 Sample data: {len(sample_data)} rows")
print(sample_data.head())

try:
    # Create AccessScanner agent
    print("\n🤖 Initializing AccessScanner...")
    agent = AccessScannerAgent(watsonx_creds)
    print("✅ Agent created successfully")
    
    # Test scan
    print("\n🔍 Running accessibility scan...")
    results = agent.scan_accessibility_gaps(sample_data, 'CA')
    
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
