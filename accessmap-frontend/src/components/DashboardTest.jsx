import React from 'react';

const DashboardTest = () => {
  const testData = {
    scan_results: [
      {
        id: "scan_1",
        location: "Los Angeles, CA",
        coordinates: { lat: 34.0522, lng: -118.2437 },
        issue_type: "Missing Curb Ramps",
        severity: "critical",
        description: "High elderly population (15%) and medium disability rate (8%) necessitate adequate curb ramps for safe mobility.",
        confidence: 0.98,
        detected_date: "2025-08-10",
        vulnerable_population: "15.0% elderly, 8.0% disabled",
        risk_factors: ["High elderly population", "Medium disability rate"]
      }
    ],
    priority_areas: [
      {
        id: "priority_1",
        location: "Los Angeles, CA",
        coordinates: { lat: 34.0522, lng: -118.2437 },
        priority_score: 10.0,
        priority_level: "Immediate",
        top_issue: "Missing Curb Ramps",
        equity_factors: ["High elderly population", "Medium disability rate"],
        vulnerable_population: "10% elderly, 5% disabled, median income $45,000",
        recommended_timeline: "3-6 months",
        potential_impact: "high",
        implementation_cost: "high",
        rationale: "Priority 10.0/10 based on vulnerability analysis and accessibility gaps"
      }
    ],
    recommendations: [
      {
        id: "survey_rec_survey_1",
        priority: "High",
        title: "Comprehensive Accessibility Improvement Plan for Fresno - Poor Lighting",
        description: "A detailed, community-focused plan to address poor lighting affecting visual_impairment, elderly in Fresno.",
        recommended_actions: [
          "Conduct comprehensive on-site accessibility audit",
          "Engage with local disability advocacy groups",
          "Implement ADA-compliant solutions"
        ],
        cost_estimate: "$15,000 - $50,000",
        timeline: "6-12 weeks",
        type: "infrastructure",
        survey_based: true
      }
    ]
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Dashboard Test Data</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-red-600">Accessibility Gaps</h3>
          <p className="text-2xl font-bold">{testData.scan_results.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-orange-600">Priority Areas</h3>
          <p className="text-2xl font-bold">{testData.priority_areas.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-green-600">Survey Recommendations</h3>
          <p className="text-2xl font-bold">{testData.recommendations.filter(r => r.survey_based).length}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Test Accessibility Gap</h3>
          <p><strong>Location:</strong> {testData.scan_results[0].location}</p>
          <p><strong>Issue:</strong> {testData.scan_results[0].issue_type}</p>
          <p><strong>Severity:</strong> {testData.scan_results[0].severity}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Test Priority Area</h3>
          <p><strong>Location:</strong> {testData.priority_areas[0].location}</p>
          <p><strong>Priority:</strong> {testData.priority_areas[0].priority_level}</p>
          <p><strong>Score:</strong> {testData.priority_areas[0].priority_score}/10</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Test Survey Recommendation</h3>
          <p><strong>Title:</strong> {testData.recommendations[0].title}</p>
          <p><strong>Priority:</strong> {testData.recommendations[0].priority}</p>
          <p><strong>Timeline:</strong> {testData.recommendations[0].timeline}</p>
          <p><strong>Survey-based:</strong> {testData.recommendations[0].survey_based ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardTest;
