# EquityAgent

EquityAgent is an autonomous AI tool designed to analyze population vulnerability and accessibility issue data to score and prioritize urban locations in need of accessibility upgrades. This project integrates U.S. Census demographic data with accessibility issues identified by an AccessScanner agent, then leverages IBM Watsonx AI to generate a prioritized list of locations requiring intervention.

---

## Features

- Retrieves and processes census data on population vulnerability indicators such as age, disability, and income.
- Integrates accessibility issue data from AccessScanner agent outputs.
- Uses Watsonx AI to dynamically score and rank locations based on combined vulnerability and accessibility issues.
- Outputs a sorted CSV list of locations with priority scores and top issues for targeted accessibility improvements.

---

## Setup

### Prerequisites

- Python 3.8+
- An IBM Watsonx AI account with API credentials
- A U.S. Census API key

### Environment Variables

Create a `.env` file in the project root directory with the following variables:

CENSUS_API_KEY=your_api_key

WATSONX_API_KEY=your_api_key

WATSONX_PROJECT_ID=your_project_id

WATSONX_REGION=us-south

Replace the placeholders with your actual API keys and project info.

---
