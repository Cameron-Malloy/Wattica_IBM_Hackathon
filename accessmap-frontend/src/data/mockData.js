// Mock data for AccessMap.AI - simulating backend API responses

// AccessScanner Agent - identifies accessibility gaps
export const mockScanResults = [
  {
    id: 1,
    location: { lat: 37.7749, lng: -122.4194, address: "5th & Market St, San Francisco" },
    issue_type: "Missing Curb Ramp",
    severity: "critical",
    description: "Intersection lacks accessible curb ramp on northeast corner",
    detected_date: "2024-01-15",
    confidence: 0.92
  },
  {
    id: 2,
    location: { lat: 37.7849, lng: -122.4094, address: "Mission St & 3rd St" },
    issue_type: "Broken Sidewalk",
    severity: "moderate",
    description: "Large crack in sidewalk creating trip hazard",
    detected_date: "2024-01-14",
    confidence: 0.87
  },
  {
    id: 3,
    location: { lat: 37.7649, lng: -122.4294, address: "Union Square" },
    issue_type: "No Tactile Paving",
    severity: "critical",
    description: "Bus stop lacks tactile warning strips",
    detected_date: "2024-01-13",
    confidence: 0.95
  }
];

// EquityAdvisor Agent - analyzes population vulnerability
export const mockPriorityList = [
  {
    id: 1,
    location: { lat: 37.7749, lng: -122.4194, address: "Tenderloin District" },
    priority_score: 9.2,
    top_issue: "Multiple accessibility barriers",
    vulnerable_population: "High elderly population (34%), disability rate (28%)",
    equity_factors: ["Low income", "High disability rate", "Limited English proficiency"],
    recommended_timeline: "Immediate (0-3 months)"
  },
  {
    id: 2,
    location: { lat: 37.7849, lng: -122.4094, address: "Mission District" },
    priority_score: 8.7,
    top_issue: "Transit accessibility gaps",
    vulnerable_population: "High Latino population (60%), low car ownership",
    equity_factors: ["Transit dependent", "Language barriers", "Lower income"],
    recommended_timeline: "High priority (3-6 months)"
  },
  {
    id: 3,
    location: { lat: 37.7649, lng: -122.4294, address: "SOMA" },
    priority_score: 7.8,
    top_issue: "Pedestrian safety concerns",
    vulnerable_population: "Mixed demographics, high foot traffic",
    equity_factors: ["High pedestrian volume", "Tourist area"],
    recommended_timeline: "Medium priority (6-12 months)"
  }
];

// PlannerBot Agent - generates improvement plans
export const mockRecommendations = [
  {
    id: 1,
    location: { lat: 37.7749, lng: -122.4194, address: "5th & Market St" },
    proposal: "Install ADA-compliant curb ramp with tactile warning strips",
    justification: "Critical safety issue affecting wheelchair users and visually impaired pedestrians. High foot traffic area with nearby transit stops.",
    estimated_cost: "$3,500",
    timeline: "2-3 weeks",
    sdg_alignment: "11.2 - Sustainable Transport",
    impact_score: 9.1,
    benefits: ["Improved wheelchair accessibility", "Enhanced pedestrian safety", "ADA compliance"]
  },
  {
    id: 2,
    location: { lat: 37.7849, lng: -122.4094, address: "Mission St & 3rd St" },
    proposal: "Repair sidewalk surface and add tactile guidance path",
    justification: "Addresses trip hazard while improving navigation for visually impaired users. Located near senior center.",
    estimated_cost: "$2,800",
    timeline: "1-2 weeks",
    sdg_alignment: "11.7 - Safe Public Spaces",
    impact_score: 7.6,
    benefits: ["Reduced fall risk", "Better wayfinding", "Improved surface quality"]
  },
  {
    id: 3,
    location: { lat: 37.7649, lng: -122.4294, address: "Union Square Bus Stop" },
    proposal: "Install tactile warning strips and audio announcement system",
    justification: "High-traffic transit hub serving diverse population. Critical for visually impaired transit users.",
    estimated_cost: "$5,200",
    timeline: "3-4 weeks",
    sdg_alignment: "11.2 - Sustainable Transport",
    impact_score: 8.9,
    benefits: ["Enhanced transit accessibility", "Audio wayfinding", "Universal design"]
  }
];

// Community reports from users
export const mockCommunityReports = [
  {
    id: 1,
    location: { lat: 37.7699, lng: -122.4144, address: "Powell St BART" },
    issue_type: "Elevator Out of Service",
    description: "Main elevator has been broken for 3 days, forcing wheelchair users to find alternative routes",
    reporter: "Anonymous",
    date_reported: "2024-01-16",
    photo_url: "/images/broken-elevator.jpg",
    status: "reported",
    sentiment: "frustrated"
  },
  {
    id: 2,
    location: { lat: 37.7799, lng: -122.4044, address: "Dolores Park" },
    issue_type: "Inaccessible Restroom",
    description: "Restroom door is too narrow for wheelchairs and lacks grab bars",
    reporter: "Maria S.",
    date_reported: "2024-01-15",
    photo_url: "/images/restroom-door.jpg",
    status: "under_review",
    sentiment: "concerned"
  }
];

// AI-generated survey questions (from Watsonx)
export const mockSurveyQuestions = [
  {
    id: 1,
    question: "How would you rate the accessibility of sidewalks in your neighborhood?",
    type: "slider",
    scale: { min: 1, max: 5, labels: ["Very Poor", "Poor", "Fair", "Good", "Excellent"] }
  },
  {
    id: 2,
    question: "What is the biggest accessibility barrier you encounter in your daily commute?",
    type: "multiple_choice",
    options: [
      "Broken or missing curb ramps",
      "Uneven sidewalk surfaces",
      "Lack of audio signals at crossings",
      "Inaccessible public transit",
      "Blocked sidewalks",
      "Other"
    ]
  },
  {
    id: 3,
    question: "How does poor accessibility affect your daily life?",
    type: "text",
    placeholder: "Please describe your experience..."
  }
];

// Agent chat log - simulating reasoning from AI agents
export const mockAgentChatLog = [
  {
    id: 1,
    agent: "AccessScanner",
    timestamp: "2024-01-16 10:30:00",
    message: "Scanning complete for downtown area. Identified 23 accessibility issues.",
    reasoning: "Used computer vision to analyze street view imagery. Detected missing curb ramps with 92% confidence using trained accessibility detection model.",
    data: { issues_found: 23, area_covered: "2.3 sq km", confidence_avg: 0.89 }
  },
  {
    id: 2,
    agent: "EquityAdvisor",
    timestamp: "2024-01-16 10:35:00",
    message: "Prioritization analysis complete. Tenderloin district requires immediate attention.",
    reasoning: "Cross-referenced accessibility issues with demographic data. High elderly population (34%) and disability rate (28%) in Tenderloin increases urgency score.",
    data: { priority_locations: 8, equity_score: 9.2, vulnerable_pop_percentage: 62 }
  },
  {
    id: 3,
    agent: "PlannerBot",
    timestamp: "2024-01-16 10:40:00",
    message: "Generated 15 improvement recommendations with cost estimates.",
    reasoning: "Optimized solutions based on impact vs cost analysis. Prioritized high-traffic areas and locations serving vulnerable populations.",
    data: { recommendations: 15, total_estimated_cost: "$45,600", avg_timeline: "2.3 weeks" }
  }
];

// SDG 11 callouts for different features
export const sdgCallouts = {
  transit: {
    number: "11.2",
    title: "Sustainable Transport",
    description: "Provide access to safe, affordable, accessible and sustainable transport systems for all"
  },
  public_spaces: {
    number: "11.7", 
    title: "Safe Public Spaces",
    description: "Provide universal access to safe, inclusive and accessible, green and public spaces"
  },
  planning: {
    number: "11.3",
    title: "Inclusive Planning",
    description: "Enhance inclusive and sustainable urbanization and capacity for participatory planning"
  }
};
