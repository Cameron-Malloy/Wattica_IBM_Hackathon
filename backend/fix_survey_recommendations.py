#!/usr/bin/env python3
"""
Script to fix duplicate survey recommendations in the multi-agent analysis file
"""

import json
import os
from datetime import datetime

def fix_survey_recommendations():
    """Remove duplicate survey recommendations and keep only the latest ones"""
    
    # Load survey submissions to get the latest recommendations
    survey_file = "../accessmap-frontend/public/api_results/survey_submissions_CA.json"
    if not os.path.exists(survey_file):
        print("No survey submissions file found")
        return
    
    with open(survey_file, 'r') as f:
        survey_submissions = json.load(f)
    
    # Get the latest survey recommendations
    latest_survey_recommendations = []
    for survey in survey_submissions:
        if survey.get('ai_recommendation'):
            recommendation = survey['ai_recommendation'].copy()
            recommendation['id'] = f"survey_rec_{survey['id']}"
            recommendation['survey_id'] = survey['id']
            recommendation['survey_location'] = survey['location']
            recommendation['survey_issue'] = survey['issue']
            recommendation['submitted_at'] = survey['submitted_at']
            recommendation['survey_based'] = True
            recommendation['agent'] = "SurveyBot"
            recommendation['generated_date'] = datetime.now().strftime('%Y-%m-%d')
            latest_survey_recommendations.append(recommendation)
    
    # Load the main analysis file
    main_analysis_file = "../accessmap-frontend/public/api_results/multi_agent_analysis_CA.json"
    if not os.path.exists(main_analysis_file):
        print("No main analysis file found")
        return
    
    with open(main_analysis_file, 'r') as f:
        main_analysis = json.load(f)
    
    # Remove all existing survey recommendations
    if 'recommendations' in main_analysis:
        main_analysis['recommendations'] = [
            rec for rec in main_analysis['recommendations'] 
            if not (rec.get('agent') == 'SurveyBot' and rec.get('survey_based'))
        ]
    
    # Add the latest survey recommendations at the beginning
    if latest_survey_recommendations:
        if 'recommendations' not in main_analysis:
            main_analysis['recommendations'] = []
        
        main_analysis['recommendations'] = latest_survey_recommendations + main_analysis['recommendations']
        
        # Update metadata
        if 'metadata' not in main_analysis:
            main_analysis['metadata'] = {}
        
        main_analysis['metadata']['survey_recommendations_included'] = True
        main_analysis['metadata']['total_survey_recommendations'] = len(latest_survey_recommendations)
        main_analysis['metadata']['last_updated'] = datetime.now().isoformat()
    
    # Save the fixed analysis
    with open(main_analysis_file, 'w') as f:
        json.dump(main_analysis, f, indent=2)
    
    # Also update the backend copy
    backend_file = "../census_results/multi_agent_analysis/multi_agent_analysis_CA.json"
    if os.path.exists(backend_file):
        with open(backend_file, 'w') as f:
            json.dump(main_analysis, f, indent=2)
    
    print(f"✅ Fixed survey recommendations. Total recommendations: {len(main_analysis['recommendations'])}")
    print(f"   - Survey recommendations: {len(latest_survey_recommendations)}")
    print(f"   - Agent recommendations: {len(main_analysis['recommendations']) - len(latest_survey_recommendations)}")

if __name__ == "__main__":
    fix_survey_recommendations()
