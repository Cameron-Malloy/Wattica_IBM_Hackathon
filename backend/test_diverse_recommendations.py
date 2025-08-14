#!/usr/bin/env python3
import requests
import json

def test_diverse_recommendations():
    """Test submitting a survey to see diverse recommendation types"""
    
    # Test survey data with a different issue type
    survey_data = {
        "location": {
            "city": "San Francisco",
            "coordinates": {"lat": 37.7749, "lng": -122.4194},
            "fullAddress": "San Francisco, CA, USA"
        },
        "issue": {
            "type": "poor_lighting",
            "description": "Very dark streets at night making it unsafe for pedestrians",
            "severity": "moderate"
        },
        "impact": {
            "frequency": "daily",
            "age_groups": ["elderly", "young_adults", "adults"]
        },
        "demographics": {
            "mobility_needs": ["visual_impairment", "elderly"]
        },
        "contact": {
            "name": "Test User",
            "email": "test@example.com",
            "anonymous": False
        }
    }
    
    try:
        # Submit survey
        response = requests.post(
            "http://localhost:8003/survey",
            json=survey_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Survey submitted successfully!")
            print(f"Survey ID: {result.get('survey_id')}")
            
            # Check the recommendation type
            if result.get('ai_recommendation'):
                rec_type = result['ai_recommendation'].get('type', 'unknown')
                print(f"🎯 Recommendation Type: {rec_type}")
                print(f"📋 Title: {result['ai_recommendation'].get('title', 'N/A')}")
                print(f"🎯 SDG Alignment: {result['ai_recommendation'].get('sdg_alignment', 'N/A')}")
                
                # Check if it's one of the diverse types
                diverse_types = ['infrastructure', 'tech', 'policy', 'community']
                if rec_type in diverse_types:
                    print(f"✅ SUCCESS: Generated diverse recommendation type: {rec_type}")
                else:
                    print(f"⚠️  WARNING: Unexpected recommendation type: {rec_type}")
            else:
                print("❌ No AI recommendation generated")
                
        else:
            print(f"❌ Failed to submit survey: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_diverse_recommendations()
