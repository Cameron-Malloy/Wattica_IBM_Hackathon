import pandas as pd
import json
import logging
from typing import List, Dict, Any
from datetime import datetime
from ibm_watsonx_ai.foundation_models import Model
from ibm_watsonx_ai import Credentials

logger = logging.getLogger(__name__)

class PlannerBotAgent:
    """
    PlannerBot Agent - Generates improvement plans and actionable recommendations
    Uses WatsonX AI to create detailed implementation plans based on scan results and priorities
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
        
    def generate_improvement_plans(self, scan_results: List[Dict], priority_areas: List[Dict], 
                                 census_data: pd.DataFrame, state: str) -> List[Dict[str, Any]]:
        """
        Generate comprehensive improvement plans based on AccessScanner accessibility gaps
        
        Args:
            scan_results: Output from AccessScanner (accessibility gaps)
            priority_areas: Output from EquityAdvisor
            census_data: Raw census data (for context)
            state: State abbreviation
            
        Returns:
            List of actionable improvement recommendations with implementation details
        """
        logger.info(f"🤖 PlannerBot: Generating improvement plans for {state}")
        
        # Focus on accessibility gaps from AccessScanner
        accessibility_gaps = scan_results if scan_results else []
        all_priorities = priority_areas if priority_areas else []
        
        logger.info(f"🤖 PlannerBot: Processing {len(accessibility_gaps)} accessibility gaps and {len(all_priorities)} priority areas")
        
        if not accessibility_gaps:
            logger.warning("No accessibility gaps found to generate recommendations from")
            return []
        
        prompt = f"""
        You are PlannerBotAgent, an expert urban planning AI that creates actionable improvement plans for accessibility and equity.

        AccessScanner identified these accessibility gaps:
        {json.dumps(accessibility_gaps, indent=2)}

        EquityAdvisor prioritized these areas:
        {json.dumps(all_priorities, indent=2)}

        Your task: Create comprehensive improvement recommendations that directly address the identified accessibility gaps with specific, actionable plans.

        Return ONLY a JSON array with this structure:
        [
            {{
                "id": "rec_1",
                "type": "infrastructure",
                "title": "Install ADA-Compliant Curb Ramps",
                "description": "Systematic installation of accessible curb ramps in high-priority areas",
                "target_locations": ["Los Angeles, CA", "San Francisco, CA"],
                "impact": "high",
                "cost_estimate": "$150,000 - $300,000",
                "timeline": "6-12 months",
                "implementation_steps": [
                    "Conduct detailed site surveys",
                    "Obtain permits and approvals", 
                    "Procure materials and contractors",
                    "Execute phased installation",
                    "Conduct accessibility audits"
                ],
                "success_metrics": ["Number of compliant intersections", "User satisfaction surveys"],
                "sdg_alignment": "SDG 11.2: Accessible transportation systems",
                "equity_impact": "Directly serves 15.3% elderly and 8.2% disabled population",
                "priority_level": "Immediate",
                "rationale": "Critical accessibility barrier affecting vulnerable populations in high-priority areas",
                "addresses_gaps": ["gap_id_1", "gap_id_2"]
            }}
        ]

        Recommendation types: "infrastructure", "policy", "technology", "community"
        Impact levels: "high", "medium", "low" 
        Priority levels: "Immediate", "Short-term", "Medium-term", "Long-term"
        
        Focus on:
        1. Directly addressing the specific accessibility gaps identified
        2. Specific, actionable solutions for each gap type
        3. Clear implementation pathways with realistic timelines
        4. Measurable outcomes and success metrics
        5. Equity-centered approaches prioritizing vulnerable populations
        6. SDG 11 alignment for sustainable urban development
        
        IMPORTANT: Generate recommendations that directly correspond to the accessibility gaps identified.
        Create targeted recommendations for each major accessibility issue found.
        Ensure each recommendation addresses specific gaps and provides actionable solutions.
        Aim for comprehensive coverage of all identified accessibility barriers.
        """
        
        # Retry WatsonX generation up to 3 times
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate(
                    prompt=prompt,
                    params={
                        'max_new_tokens': 2000,
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
                        recommendations = json.loads(json_str)
                        logger.info(f"✅ PlannerBot: Generated {len(recommendations)} WatsonX recommendations")
                        
                        # Ensure we have a list
                        if not isinstance(recommendations, list):
                            recommendations = [recommendations]
                        
                        # Enhance recommendations with real data
                        enhanced_recommendations = self._enhance_recommendations(recommendations, scan_results, priority_areas, state)
                        return enhanced_recommendations
                        
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
                logger.error(f"PlannerBot WatsonX attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    raise Exception(f"PlannerBot WatsonX generation failed after {max_retries} attempts: {e}")
        
        # This should never be reached due to the exception above
        raise Exception("PlannerBot WatsonX generation failed")
    
    def _enhance_recommendations(self, ai_recommendations: List[Dict], scan_results: List[Dict], 
                               priority_areas: List[Dict], state: str) -> List[Dict[str, Any]]:
        """Enhance AI recommendations with real data"""
        enhanced_recommendations = []
        
        # Calculate impact based on scan results and priorities
        total_locations = len(scan_results) if scan_results else 0
        high_priority_count = len([p for p in priority_areas if p.get('priority_score', 0) >= 7])
        
        # Prepare all accessibility gap locations for distribution
        all_accessibility_locations = []
        for scan in scan_results:
            location_name = scan.get('location', f'Location {len(all_accessibility_locations)+1}')
            coordinates = scan.get('coordinates', {})
            
            # Use coordinates from scan results if available, otherwise generate them
            if coordinates and 'lat' in coordinates and 'lng' in coordinates:
                lat = coordinates['lat']
                lng = coordinates['lng']
            else:
                # Generate coordinates based on location name (fallback)
                import hashlib
                location_hash = int(hashlib.md5(location_name.encode()).hexdigest()[:8], 16)
                
                # California bounds
                ca_lat_min, ca_lat_max = 32.5343, 42.0095
                ca_lng_min, ca_lng_max = -124.4096, -114.1318
                
                lat = ca_lat_min + (location_hash % 100000 / 100000) * (ca_lat_max - ca_lat_min)
                lng = ca_lng_min + ((location_hash // 100000) % 100000 / 100000) * (ca_lng_max - ca_lng_min)
            
            # Validate coordinates to ensure they are valid numbers
            try:
                lat = float(lat) if lat is not None else 36.7783  # Default to CA center
                lng = float(lng) if lng is not None else -119.4179
                
                # Ensure coordinates are within California bounds
                lat = max(32.5343, min(42.0095, lat))
                lng = max(-124.4096, min(-114.1318, lng))
            except (ValueError, TypeError):
                # Fallback to default California coordinates
                lat = 36.7783
                lng = -119.4179
            
            all_accessibility_locations.append({
                "lat": round(lat, 6),
                "lng": round(lng, 6),
                "name": location_name,
                "issue_type": scan.get('issue_type', 'Unknown'),
                "severity": scan.get('severity', 'moderate')
            })
        
        # Enhance each WatsonX-generated recommendation
        for i, ai_rec in enumerate(ai_recommendations):
            # Assign different locations to each recommendation
            # Distribute all accessibility locations evenly across recommendations
            locations_per_rec = max(1, len(all_accessibility_locations) // len(ai_recommendations))
            start_idx = (i * locations_per_rec) % len(all_accessibility_locations)
            end_idx = min(start_idx + locations_per_rec, len(all_accessibility_locations))
            
            # If we have more recommendations than locations, cycle through locations
            if end_idx <= start_idx:
                end_idx = len(all_accessibility_locations)
            
            # Get locations for this specific recommendation
            rec_locations = all_accessibility_locations[start_idx:end_idx]
            
            # If we still don't have enough locations, add some from the beginning
            if len(rec_locations) < 2 and len(all_accessibility_locations) > 1:
                rec_locations.extend(all_accessibility_locations[:2-len(rec_locations)])
            
            # Create location names array for frontend display
            location_names = [loc["name"] for loc in rec_locations]
            
            # Determine cost based on type and scope
            cost_estimates = {
                "infrastructure": f"${len(rec_locations) * 5000:,} - ${len(rec_locations) * 15000:,}",
                "policy": f"$50,000 - $150,000",
                "technology": f"$200,000 - $500,000", 
                "community": f"$25,000 - $75,000"
            }
            
            # Timeline based on complexity
            timelines = {
                "infrastructure": "6-18 months",
                "policy": "3-6 months",
                "technology": "9-15 months",
                "community": "2-4 months"
            }
            
            # Priority based on issue severity
            critical_issues = len([s for s in scan_results if s.get('severity') == 'critical'])
            priority_level = "Immediate" if critical_issues > 10 else "Short-term"
            
            enhanced_rec = {
                "id": f"rec_{i+1}",
                "type": ai_rec.get("type", "infrastructure"),
                "title": ai_rec.get("title", f"WatsonX-Generated Plan {i+1}"),
                "description": ai_rec.get("description", "AI-generated accessibility improvement plan"),
                "target_locations": location_names,  # Use location names for frontend display
                "coordinates": rec_locations,  # Keep coordinates for map display
                "impact": ai_rec.get("impact", "high" if high_priority_count > 5 else "medium"),
                "cost_estimate": ai_rec.get("cost_estimate", cost_estimates.get(ai_rec.get("type", "infrastructure"), "$50,000 - $150,000")),
                "timeline": ai_rec.get("timeline", timelines.get(ai_rec.get("type", "infrastructure"), "6-12 months")),
                "implementation_steps": ai_rec.get("implementation_steps", [
                    "Conduct comprehensive assessment",
                    "Develop detailed implementation plan",
                    "Secure necessary approvals and funding",
                    "Execute phased implementation",
                    "Monitor and evaluate outcomes"
                ]),
                "success_metrics": ai_rec.get("success_metrics", self._generate_success_metrics(ai_rec.get("type", "infrastructure"), len(rec_locations))),
                "sdg_alignment": ai_rec.get("sdg_alignment", "SDG 11.2: Accessible and affordable transport systems"),
                "equity_impact": ai_rec.get("equity_impact", f"Addresses accessibility needs for vulnerable populations across {len(rec_locations)} identified locations"),
                "priority_level": ai_rec.get("priority_level", priority_level),
                "rationale": ai_rec.get("rationale", f"WatsonX AI-generated recommendation addressing {ai_rec.get('type', 'accessibility')} needs"),
                "locations_affected": len(rec_locations),
                "agent": "PlannerBot",
                "generated_date": datetime.now().strftime('%Y-%m-%d'),
                "watsonx_generated": True
            }
            
            enhanced_recommendations.append(enhanced_rec)
        
        return enhanced_recommendations
    
    def _generate_success_metrics(self, rec_type: str, location_count: int) -> List[str]:
        """Generate appropriate success metrics for recommendation type"""
        metrics_map = {
            "infrastructure": [
                f"Install compliant infrastructure at {location_count} locations",
                "Achieve 95%+ ADA compliance rate",
                "Reduce accessibility complaints by 60%"
            ],
            "policy": [
                "Establish comprehensive accessibility standards",
                "Train 100% of relevant city staff",
                "Achieve policy compliance across all departments"
            ],
            "technology": [
                "Deploy monitoring systems at key locations", 
                "Achieve 90% citizen app adoption in target areas",
                "Reduce response time to accessibility issues by 50%"
            ],
            "community": [
                "Recruit 50+ community accessibility champions",
                "Establish neighborhood reporting network",
                "Increase community engagement by 200%"
            ]
        }
        return metrics_map.get(rec_type, ["Improve accessibility outcomes", "Increase user satisfaction"])
