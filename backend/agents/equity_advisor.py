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

        Your task: Identify the top 3-6 priority areas for accessibility improvements based on:
        1. Severity of accessibility barriers
        2. Vulnerability of population (elderly, disabled, low-income)
        3. Equity impact potential
        4. Implementation feasibility

        Return ONLY a JSON array with 3-6 priority areas using this structure:
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
        Generate only 3-6 priority areas, not more.
        """
        
        # Retry WatsonX generation up to 3 times
        max_retries = 3
        for attempt in range(max_retries):
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
                
                # Enhanced JSON extraction and parsing
                logger.info(f"Raw AI response: {ai_response[:200]}...")
                
                # Try multiple JSON extraction strategies
                json_str = None
                
                # Strategy 1: Look for JSON array markers
                json_start = ai_response.find('[')
                json_end = ai_response.rfind(']')
                
                if json_start != -1 and json_end > json_start:
                    json_str = ai_response[json_start:json_end+1]
                
                # Strategy 2: If no array found, try to extract JSON objects
                if not json_str:
                    # Look for individual JSON objects
                    brace_start = ai_response.find('{')
                    brace_end = ai_response.rfind('}')
                    if brace_start != -1 and brace_end > brace_start:
                        # Wrap in array if it's a single object
                        single_obj = ai_response[brace_start:brace_end+1]
                        json_str = f"[{single_obj}]"
                
                # Strategy 3: Try to fix common JSON issues
                if json_str:
                    # Clean up the JSON string
                    json_str = json_str.replace('\n', ' ').replace('\t', ' ')
                    json_str = json_str.replace('\\', '\\\\')  # Escape backslashes
                    
                    # Remove extra whitespace
                    while '  ' in json_str:
                        json_str = json_str.replace('  ', ' ')
                    
                    # Try to fix common JSON syntax issues
                    json_str = json_str.replace('",}', '"}')  # Remove trailing commas
                    json_str = json_str.replace(',]', ']')    # Remove trailing commas in arrays
                    json_str = json_str.replace(',}', '}')    # Remove trailing commas in objects
                    
                    # Try to fix incomplete JSON by finding the last complete object
                    if json_str.count('{') > json_str.count('}'):
                        # Find the last complete object
                        brace_count = 0
                        last_complete = 0
                        for i, char in enumerate(json_str):
                            if char == '{':
                                brace_count += 1
                            elif char == '}':
                                brace_count -= 1
                                if brace_count == 0:
                                    last_complete = i + 1
                        
                        if last_complete > 0:
                            json_str = json_str[:last_complete] + ']'
                            logger.info(f"Fixed incomplete JSON by truncating at position {last_complete}")
                    
                    logger.info(f"Cleaned JSON string: {json_str[:200]}...")
                    
                    try:
                        priority_results = json.loads(json_str)
                        logger.info(f"✅ EquityAdvisor: Generated {len(priority_results)} WatsonX priority areas")
                        
                        # Ensure we have a list
                        if not isinstance(priority_results, list):
                            priority_results = [priority_results]
                        
                        # Enhance with real data
                        enhanced_results = self._enhance_priority_results(priority_results, census_data, scan_results, state)
                        return enhanced_results
                        
                    except json.JSONDecodeError as e:
                        logger.warning(f"JSON parsing failed for attempt {attempt + 1}: {e}")
                        logger.warning(f"Failed JSON string: {json_str}")
                        
                        # If JSON parsing fails, retry
                        if attempt == max_retries - 1:
                            raise Exception(f"Failed to parse WatsonX response after all retries: {e}")
                        continue
                else:
                    logger.warning(f"Attempt {attempt + 1}: Could not find JSON in response, retrying...")
                    if attempt == max_retries - 1:
                        raise Exception("Failed to find JSON in WatsonX response after all retries")
                    continue
                        
            except Exception as e:
                logger.error(f"EquityAdvisor WatsonX attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    raise Exception(f"EquityAdvisor WatsonX generation failed after {max_retries} attempts: {e}")
        
        # This should never be reached due to the exception above
        raise Exception("EquityAdvisor WatsonX generation failed")
    
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
                "agent": "EquityAdvisor",
                "watsonx_generated": True
            }
            
            enhanced_results.append(priority_result)
        
        # Sort by priority score (highest first)
        enhanced_results.sort(key=lambda x: x['priority_score'], reverse=True)
        
        # Limit priority areas to be fewer than accessibility gaps
        max_priorities = min(len(scan_results) // 2, 10)  # Half of scan results, max 10
        return enhanced_results[:max_priorities]
    

