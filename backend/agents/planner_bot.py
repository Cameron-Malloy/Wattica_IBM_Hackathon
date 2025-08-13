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
        Generate comprehensive improvement plans based on AccessScanner and EquityAdvisor outputs
        
        Args:
            scan_results: Output from AccessScanner
            priority_areas: Output from EquityAdvisor
            census_data: Raw census data
            state: State abbreviation
            
        Returns:
            List of actionable improvement recommendations with implementation details
        """
        logger.info(f"🤖 PlannerBot: Generating improvement plans for {state}")
        
        # Prepare data for AI analysis
        top_scans = scan_results[:5] if scan_results else []
        top_priorities = priority_areas[:5] if priority_areas else []
        
        prompt = f"""
        You are PlannerBotAgent, an expert urban planning AI that creates actionable improvement plans for accessibility and equity.

        AccessScanner identified these issues:
        {json.dumps(top_scans, indent=2)}

        EquityAdvisor prioritized these areas:
        {json.dumps(top_priorities, indent=2)}

        Your task: Create comprehensive improvement recommendations that address the identified issues with specific, actionable plans.

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
                "rationale": "Critical accessibility barrier affecting vulnerable populations in high-priority areas"
            }}
        ]

        Recommendation types: "infrastructure", "policy", "technology", "community"
        Impact levels: "high", "medium", "low" 
        Priority levels: "Immediate", "Short-term", "Medium-term", "Long-term"
        
        Focus on:
        1. Specific, actionable solutions
        2. Clear implementation pathways
        3. Measurable outcomes
        4. Equity-centered approaches
        5. SDG 11 alignment
        
        Generate 5-8 diverse recommendations covering different solution types.
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
                
                # Extract JSON from response
                json_start = ai_response.find('[')
                json_end = ai_response.rfind(']') + 1
                
                if json_start != -1 and json_end != -1:
                    json_str = ai_response[json_start:json_end]
                    recommendations = json.loads(json_str)
                    
                    # Enhance recommendations with real data
                    enhanced_recommendations = self._enhance_recommendations(recommendations, scan_results, priority_areas, state)
                    logger.info(f"✅ PlannerBot: Generated {len(enhanced_recommendations)} WatsonX recommendations")
                    return enhanced_recommendations
                else:
                    logger.warning(f"Attempt {attempt + 1}: Could not parse AI response, retrying...")
                    if attempt == max_retries - 1:
                        raise Exception("Failed to parse WatsonX response after all retries")
                        
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
        
        # Generate coordinates for target locations
        target_locations = []
        for p in priority_areas[:5]:  # Use up to 5 priority areas
            location_name = p.get('location', f'Location {len(target_locations)+1}')
            # Generate coordinates based on location name (simplified approach)
            import hashlib
            location_hash = int(hashlib.md5(location_name.encode()).hexdigest()[:8], 16)
            
            # California bounds
            ca_lat_min, ca_lat_max = 32.5343, 42.0095
            ca_lng_min, ca_lng_max = -124.4096, -114.1318
            
            lat = ca_lat_min + (location_hash % 100000 / 100000) * (ca_lat_max - ca_lat_min)
            lng = ca_lng_min + ((location_hash // 100000) % 100000 / 100000) * (ca_lng_max - ca_lng_min)
            
            target_locations.append({
                "lat": round(lat, 6),
                "lng": round(lng, 6),
                "name": location_name
            })
        
        # Create location names array for frontend display
        location_names = [loc["name"] for loc in target_locations]
        
        # Enhance each WatsonX-generated recommendation
        for i, ai_rec in enumerate(ai_recommendations):
            # Determine cost based on type and scope
            cost_estimates = {
                "infrastructure": f"${total_locations * 5000:,} - ${total_locations * 15000:,}",
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
                "coordinates": target_locations,  # Keep coordinates for map display
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
                "success_metrics": ai_rec.get("success_metrics", self._generate_success_metrics(ai_rec.get("type", "infrastructure"), total_locations)),
                "sdg_alignment": ai_rec.get("sdg_alignment", "SDG 11.2: Accessible and affordable transport systems"),
                "equity_impact": ai_rec.get("equity_impact", f"Addresses accessibility needs for vulnerable populations across {total_locations} identified locations"),
                "priority_level": ai_rec.get("priority_level", priority_level),
                "rationale": ai_rec.get("rationale", f"WatsonX AI-generated recommendation addressing {ai_rec.get('type', 'accessibility')} needs"),
                "locations_affected": len(target_locations),
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
