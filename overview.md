AccessMap.AI

THE PROBLEM
Cities lack comprehensive systems to identify and prioritize accessibility gaps in public infrastructure. Disabled, elderly, and underserved populations face barriers to inclusive urban spaces due to fragmented planning data and reactive improvement processes.

OUR SOLUTION
AccessMap.AI is a collaborative multi-agent system using IBM watsonx.ai and watsonx Orchestrate that scans urban infrastructure, identifies accessibility gaps, and generates actionable improvement plans for city planners and advocacy groups. Implements AI-generated community surveys to help understand public sentiment and allow for improved planning 

MULTI-AGENT ARCHITECTURE
AccessScanner (watsonx.ai): Scans open data to map underserved areas - sidewalks, parks, transit, lighting
EquityAdvisor (watsonx.ai): Prioritizes city upgrades based on population vulnerability and accessibility risk
PlannerBot (watsonx Orchestrate): Generates improvement plans and automates delivery to city departments

SDG 11 IMPACT
11.2 - Accessible and sustainable transport systems
11.3 - Inclusive and sustainable urbanization
11.7 - Universal access to safe, inclusive public spaces

TARGET USERS & APPLICATIONS
Primary Users: City planning departments, disability rights advocates, housing authorities, municipal accessibility coordinators
Secondary Users: Community organizations, urban accessibility researchers, transit agencies, advocacy non-profits
Key Applications: ADA compliance planning and transit accessibility audits, inclusive park design and sidewalk improvement prioritization, public space accessibility assessment and barrier removal planning

TECHNICAL IMPLEMENTATION
watsonx.ai Core: IBM Granite models with LangChain/LlamaIndex for data ingestion and accessibility reasoning, function calling for real-time infrastructure data processing
watsonx Orchestrate: Automated report generation and email workflows, API triggers to city planning systems, multi-stakeholder notification processes
Data & Processing: OpenStreetMap, GTFS transit data, census demographics, municipal accessibility audits, scoring algorithms for population vulnerability assessment
