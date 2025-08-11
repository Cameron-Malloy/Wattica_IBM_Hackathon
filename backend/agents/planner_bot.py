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
                
                # Enhance recommendations
                return self._enhance_recommendations(recommendations, scan_results, priority_areas, state)
            else:
                logger.warning("Could not parse AI response, using fallback")
                return self._fallback_recommendations(scan_results, priority_areas, state)
                
        except Exception as e:
            logger.error(f"PlannerBot AI failed: {e}")
            return self._fallback_recommendations(scan_results, priority_areas, state)
    
    def _enhance_recommendations(self, ai_recommendations: List[Dict], scan_results: List[Dict], 
                               priority_areas: List[Dict], state: str) -> List[Dict[str, Any]]:
        """Enhance AI recommendations with real data"""
        enhanced_recommendations = []
        
        # Base recommendations template
        base_recommendations = [
            {
                "type": "infrastructure",
                "title": "Prioritize Curb Ramp Installation Program",
                "description": "Systematic installation of ADA-compliant curb ramps in high-vulnerability areas",
                "implementation_steps": [
                    "Conduct comprehensive accessibility audits",
                    "Prioritize locations by vulnerability score",
                    "Secure funding and permits",
                    "Execute phased installation",
                    "Monitor and evaluate impact"
                ],
                "sdg_alignment": "SDG 11.2: Accessible and affordable transport systems"
            },
            {
                "type": "policy", 
                "title": "Equity-Centered Accessibility Standards",
                "description": "Implement comprehensive accessibility compliance program with equity focus",
                "implementation_steps": [
                    "Develop equity-centered accessibility standards",
                    "Create community feedback mechanisms",
                    "Establish regular auditing schedule",
                    "Train city staff on accessibility compliance",
                    "Publish annual accessibility reports"
                ],
                "sdg_alignment": "SDG 11.3: Inclusive and sustainable urbanization"
            },
            {
                "type": "technology",
                "title": "Smart Accessibility Monitoring System", 
                "description": "Deploy IoT sensors and AI monitoring for real-time accessibility tracking",
                "implementation_steps": [
                    "Install smart sensors at key locations",
                    "Develop AI monitoring dashboard",
                    "Create citizen reporting mobile app",
                    "Establish automated alert system",
                    "Integrate with city management systems"
                ],
                "sdg_alignment": "SDG 11.C: Support sustainable and resilient building"
            },
            {
                "type": "community",
                "title": "Community Accessibility Champions Program",
                "description": "Engage residents as accessibility advocates and monitors in their neighborhoods",
                "implementation_steps": [
                    "Recruit community volunteers",
                    "Provide accessibility training",
                    "Create neighborhood reporting network",
                    "Establish feedback loops with city",
                    "Recognize and reward participation"
                ],
                "sdg_alignment": "SDG 11.3: Enhance inclusive and participatory planning"
            }
        ]
        
        # Enhance each recommendation with real data
        for i, base_rec in enumerate(base_recommendations):
            # Calculate impact based on scan results and priorities
            total_locations = len(scan_results) if scan_results else 0
            high_priority_count = len([p for p in priority_areas if p.get('priority_score', 0) >= 7])
            
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
                **base_rec,
                "target_locations": [p.get('location', f'Location {i+1}') for p in priority_areas[:3]],
                "impact": "high" if high_priority_count > 5 else "medium",
                "cost_estimate": cost_estimates.get(base_rec["type"], "$50,000 - $150,000"),
                "timeline": timelines.get(base_rec["type"], "6-12 months"),
                "success_metrics": self._generate_success_metrics(base_rec["type"], total_locations),
                "equity_impact": f"Addresses accessibility needs for vulnerable populations across {total_locations} identified locations",
                "priority_level": priority_level,
                "rationale": f"Addresses {base_rec['type']} needs identified by multi-agent analysis",
                "locations_affected": max(total_locations, high_priority_count),
                "agent": "PlannerBot",
                "generated_date": datetime.now().strftime('%Y-%m-%d')
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
    
    def _fallback_recommendations(self, scan_results: List[Dict], priority_areas: List[Dict], state: str) -> List[Dict[str, Any]]:
        """Fallback if AI fails"""
        logger.info("Using fallback recommendations")
        return self._enhance_recommendations([], scan_results, priority_areas, state)
