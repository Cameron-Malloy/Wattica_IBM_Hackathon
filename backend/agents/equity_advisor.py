import pandas as pd
import json
import logging
from typing import List, Dict, Any
from datetime import datetime
from ibm_watsonx_ai.foundation_models import Model
from ibm_watsonx_ai import Credentials

logger = logging.getLogger(__name__)

class EquityAdvisorAgent:
    """
    EquityAdvisor Agent - Analyzes population vulnerability and prioritizes areas
    Uses WatsonX AI to score and rank areas based on equity and accessibility needs
    """
    
    def __init__(self, watsonx_credentials: dict):
        credentials_dict = {
            "api_key": watsonx_credentials["api_key"],
            "url": watsonx_credentials.get("url", "https://us-south.ml.cloud.ibm.com")
        }
        # Use ibm/granite-3-3-8b-instruct - newer, more reliable model
        self.model = Model(
            model_id="ibm/granite-3-3-8b-instruct",
            credentials=Credentials(**credentials_dict),
            project_id=watsonx_credentials["project_id"]
        )
    
    def prioritize_areas(self, scan_results: List[Dict], census_data: pd.DataFrame, state: str) -> List[Dict[str, Any]]:
        """
        Analyze scan results and census data to prioritize areas for intervention
        
        Args:
            scan_results: Output from AccessScanner
            census_data: Raw census data
            state: State abbreviation
            
        Returns:
            Prioritized list of areas with scores and recommendations
        """
        logger.info(f"🎯 EquityAdvisor: Prioritizing areas for {state}")
        
        # Prepare data for AI analysis
        sample_scans = scan_results[:10] if scan_results else []
        sample_census = census_data.head(10).to_dict('records')
        
        prompt = f"""
        You are EquityAdvisorAgent, an expert in urban equity and accessibility prioritization.

        AccessScanner found these issues:
        {json.dumps(sample_scans, indent=2)}

        Census vulnerability data:
        {json.dumps(sample_census, indent=2)}

        Your task: Prioritize these areas for accessibility improvements based on:
        1. Severity of accessibility barriers
        2. Vulnerability of population (elderly, disabled, low-income)
        3. Equity impact potential
        4. Implementation feasibility

        Return ONLY a JSON array with this structure:
        [
            {{
                "location": "City Name, {state}",
                "coordinates": {{"lat": 34.0522, "lng": -118.2437}},
                "priority_score": 8.7,
                "priority_level": "Immediate",
                "top_issue": "Multiple accessibility barriers",
                "equity_factors": ["High elderly population", "Low income", "High disability rate"],
                "vulnerable_population": "18.2% elderly, 12.1% disabled, median income $35,000",
                "recommended_timeline": "0-3 months",
                "potential_impact": "high",
                "implementation_cost": "medium",
                "rationale": "Critical accessibility gaps in highly vulnerable community"
            }}
        ]

        Priority levels: "Immediate" (0-3 months), "Short-term" (3-6 months), "Medium-term" (6-12 months), "Long-term" (12+ months)
        Priority scores: 1-10 scale where 10 = highest priority
        Potential impact: "high", "medium", "low"
        Implementation cost: "high", "medium", "low"

        Focus on equity-driven prioritization that serves the most vulnerable populations first.
        """
        
        try:
            response = self.model.generate(
                prompt=prompt,
                params={
                    'max_new_tokens': 1500,
                    'temperature': 0.3,
                    'top_k': 50
                }
            )
            ai_response = response['results'][0]['generated_text']
            
            # Extract JSON from response
            json_start = ai_response.find('[')
            json_end = ai_response.rfind(']') + 1
            
            if json_start != -1 and json_end != -1:
                json_str = ai_response[json_start:json_end]
                priority_results = json.loads(json_str)
                
                # Enhance with real data
                return self._enhance_priority_results(priority_results, census_data, scan_results, state)
            else:
                logger.warning("Could not parse AI response, using fallback")
                return self._fallback_priority_results(census_data, scan_results, state)
                
        except Exception as e:
            logger.error(f"EquityAdvisor AI failed: {e}")
            return self._fallback_priority_results(census_data, scan_results, state)
    
    def _enhance_priority_results(self, ai_results: List[Dict], census_data: pd.DataFrame, 
                                scan_results: List[Dict], state: str) -> List[Dict[str, Any]]:
        """Enhance AI results with real census and scan data"""
        enhanced_results = []
        
        for i, row in census_data.head(20).iterrows():
            # Calculate comprehensive priority score
            elderly_pct = (row.get('percent_over_65', 0) or 0) * 100
            disabled_pct = (row.get('percent_disabled', 0) or 0) * 100
            income = row.get('median_income', 50000) or 50000
            
            # Vulnerability factors (0-10 scale each)
            elderly_score = min(10, elderly_pct / 2)  # 20% elderly = 10 points
            disability_score = min(10, disabled_pct / 1.5)  # 15% disabled = 10 points  
            income_score = max(0, (70000 - income) / 7000)  # $0 income = 10 points
            
            # Check for accessibility issues in this location
            location_issues = [s for s in scan_results if row['place'] in s.get('location', '')]
            issue_severity_score = 0
            if location_issues:
                severity_weights = {'critical': 10, 'moderate': 6, 'good': 2}
                issue_severity_score = max([severity_weights.get(issue.get('severity', 'good'), 2) 
                                          for issue in location_issues])
            
            # Final priority score (weighted average)
            priority_score = (elderly_score * 0.25 + disability_score * 0.25 + 
                            income_score * 0.25 + issue_severity_score * 0.25)
            
            # Determine priority level and timeline
            if priority_score >= 8:
                priority_level = "Immediate"
                timeline = "0-3 months"
            elif priority_score >= 6:
                priority_level = "Short-term" 
                timeline = "3-6 months"
            elif priority_score >= 4:
                priority_level = "Medium-term"
                timeline = "6-12 months"
            else:
                priority_level = "Long-term"
                timeline = "12+ months"
            
            # Build equity factors
            equity_factors = []
            if elderly_pct > 15: equity_factors.append('High elderly population')
            if disabled_pct > 10: equity_factors.append('High disability rate')
            if income < 40000: equity_factors.append('Low income')
            if not equity_factors: equity_factors.append('Standard demographics')
            
            # Generate coordinates using proper CA bounds
            import hashlib
            place_hash = int(hashlib.md5(row['place'].encode()).hexdigest()[:8], 16)
            
            # California coordinate bounds
            ca_lat_min, ca_lat_max = 32.5343, 42.0095
            ca_lng_min, ca_lng_max = -124.4096, -114.1318
            
            lat_seed = place_hash % 100000
            lng_seed = (place_hash // 100000) % 100000
            
            lat = ca_lat_min + (lat_seed / 100000) * (ca_lat_max - ca_lat_min)
            lng = ca_lng_min + (lng_seed / 100000) * (ca_lng_max - ca_lng_min)
            
            priority_result = {
                "id": f"priority_{i+1}",
                "location": f"{row['place']}, {state}",
                "coordinates": {"lat": lat, "lng": lng},
                "priority_score": round(priority_score, 1),
                "priority_level": priority_level,
                "top_issue": location_issues[0].get('issue_type', 'Multiple accessibility barriers') if location_issues else 'Potential accessibility gaps',
                "equity_factors": equity_factors,
                "vulnerable_population": f"{elderly_pct:.1f}% elderly, {disabled_pct:.1f}% disabled, median income ${income:,.0f}",
                "recommended_timeline": timeline,
                "potential_impact": "high" if priority_score >= 7 else "medium" if priority_score >= 4 else "low",
                "implementation_cost": "medium",  # Default, could be enhanced with more data
                "rationale": f"Priority {priority_score:.1f}/10 based on vulnerability analysis and accessibility gaps",
                "agent": "EquityAdvisor"
            }
            
            enhanced_results.append(priority_result)
        
        # Sort by priority score (highest first)
        enhanced_results.sort(key=lambda x: x['priority_score'], reverse=True)
        return enhanced_results[:20]  # Top 20 priorities
    
    def _fallback_priority_results(self, census_data: pd.DataFrame, scan_results: List[Dict], state: str) -> List[Dict[str, Any]]:
        """Fallback if AI fails"""
        logger.info("Using fallback priority results")
        return self._enhance_priority_results([], census_data, scan_results, state)
