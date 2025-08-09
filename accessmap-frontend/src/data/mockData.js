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
    timestamp: "2024-01-15T10:30:00Z",
    message: "Scan complete. Identified 23 accessibility barriers in the downtown area.",
    reasoning: "Used computer vision analysis of street-level imagery combined with ADA compliance database cross-referencing. High confidence detections include missing curb ramps (8), broken sidewalks (6), and inaccessible bus stops (4).",
    confidence: 0.94,
    data_sources: ["Street imagery", "ADA compliance database", "Municipal records"]
  },
  {
    id: 2,
    agent: "EquityAdvisor",
    timestamp: "2024-01-15T10:45:00Z",
    message: "Priority analysis complete. Tenderloin District requires immediate attention.",
    reasoning: "Demographic analysis shows 34% elderly population and 28% disability rate in Tenderloin, significantly above city average of 16% and 12% respectively. Combined with high concentration of accessibility barriers (15 per square mile vs city average of 3), this area scores 9.2/10 on equity priority scale.",
    confidence: 0.91,
    data_sources: ["Census data", "Disability services records", "Accessibility barrier density"]
  },
  {
    id: 3,
    agent: "PlannerBot",
    timestamp: "2024-01-15T11:00:00Z",
    message: "Generated 12 improvement recommendations with total estimated cost of $2.3M.",
    reasoning: "Optimization algorithm considered cost-effectiveness, impact on vulnerable populations, and implementation feasibility. Prioritized curb ramp installations (ROI: 8.5/10) and sidewalk repairs (ROI: 7.8/10) over more expensive elevator upgrades (ROI: 6.2/10). Timeline optimized for maximum parallel implementation.",
    confidence: 0.88,
    data_sources: ["Construction cost database", "Implementation timeline models", "Impact assessment algorithms"]
  },
  {
    id: 4,
    agent: "AccessScanner",
    timestamp: "2024-01-15T11:15:00Z",
    message: "Updated scan detected 3 new barriers reported by community.",
    reasoning: "Integrated community reports with AI detection system. Verified community-reported elevator outage at Civic Center Station through building management API. Cross-referenced with historical maintenance records showing 23% uptime over past 6 months.",
    confidence: 0.96,
    data_sources: ["Community reports", "Building management systems", "Maintenance records"]
  },
  {
    id: 5,
    agent: "EquityAdvisor",
    timestamp: "2024-01-15T11:30:00Z",
    message: "Equity impact assessment updated based on new community input.",
    reasoning: "Community sentiment analysis reveals 78% of residents in affected areas report daily mobility challenges. Weighted this qualitative data with quantitative demographic analysis to adjust priority scores. Mission District elevated from 8.7 to 9.1 due to high community concern levels.",
    confidence: 0.89,
    data_sources: ["Community surveys", "Sentiment analysis", "Demographic data"]
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

// Community Reporting Module - user-submitted accessibility reports
export const mockCommunityReports = [
  {
    id: 1,
    location: { lat: 37.7849, lng: -122.4094, address: "24th St BART Station" },
    issue_type: "Elevator Out of Service",
    description: "The main elevator has been broken for 3 weeks. I use a wheelchair and can't access the platform. This is my daily commute to work.",
    reporter: "Maria Rodriguez",
    date_reported: "2024-01-12",
    photo_url: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400",
    status: "under_review",
    sentiment: "frustrated"
  },
  {
    id: 2,
    location: { lat: 37.7749, lng: -122.4194, address: "Valencia St & 16th St" },
    issue_type: "Missing Curb Ramp",
    description: "There's no curb ramp at this busy intersection. I have to go two blocks out of my way to cross safely with my mobility scooter.",
    reporter: "James Chen",
    date_reported: "2024-01-10",
    photo_url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400",
    status: "reported",
    sentiment: "concerned"
  },
  {
    id: 3,
    location: { lat: 37.7649, lng: -122.4294, address: "Civic Center Plaza" },
    issue_type: "Broken Sidewalk",
    description: "Large pothole in the sidewalk near the library entrance. Several people with mobility aids have struggled here.",
    reporter: "Sarah Johnson",
    date_reported: "2024-01-08",
    photo_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    status: "resolved",
    sentiment: "hopeful"
  },
  {
    id: 4,
    location: { lat: 37.7549, lng: -122.4394, address: "Powell St Cable Car Stop" },
    issue_type: "Missing Audio Signal",
    description: "The pedestrian crossing doesn't have audio signals. As someone who is visually impaired, I can't safely cross during busy times.",
    reporter: "David Kim",
    date_reported: "2024-01-07",
    photo_url: null,
    status: "under_review",
    sentiment: "concerned"
  },
  {
    id: 5,
    location: { lat: 37.7449, lng: -122.4494, address: "Dolores Park Main Entrance" },
    issue_type: "Inaccessible Restroom",
    description: "The accessible restroom door is too heavy and the handle is broken. My elderly mother couldn't open it during our visit.",
    reporter: "Lisa Wong",
    date_reported: "2024-01-05",
    photo_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    status: "reported",
    sentiment: "frustrated"
  },
  {
    id: 6,
    location: { lat: 37.7349, lng: -122.4594, address: "Mission St Bus Stop (Line 14)" },
    issue_type: "Blocked Sidewalk",
    description: "Construction barriers have been blocking the sidewalk for months. People in wheelchairs have to go into the street.",
    reporter: "Michael Torres",
    date_reported: "2024-01-03",
    photo_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
    status: "under_review",
    sentiment: "frustrated"
  }
];
