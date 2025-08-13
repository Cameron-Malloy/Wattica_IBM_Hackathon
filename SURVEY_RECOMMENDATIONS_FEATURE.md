# Survey-Based Recommendations Feature

## Overview

This feature allows users to submit accessibility surveys through the survey tab, which then generates AI-powered recommendations using IBM WatsonX. These recommendations are automatically displayed in the recommendations tab and sidebar.

## How It Works

### 1. Survey Submission
- Users fill out the enhanced survey form with location, issue details, impact assessment, and demographics
- Survey data is submitted to the backend API endpoint `/survey`
- The backend processes the survey data and generates an AI recommendation using WatsonX

### 2. AI Recommendation Generation
- The `generate_survey_recommendation()` function creates a comprehensive prompt for WatsonX
- WatsonX analyzes the survey data and generates structured recommendations including:
  - Priority level (High/Medium/Low)
  - Recommended actions (3-5 specific steps)
  - Cost estimate
  - Timeline
  - Expected impact
  - Implementation partners

### 3. Storage and Retrieval
- Survey submissions are stored in `survey_submissions_CA.json`
- AI recommendations are stored with the survey data
- A new endpoint `/survey-recommendations` provides access to all survey-based recommendations

### 4. Frontend Integration
- Survey-based recommendations are merged with system-generated recommendations
- They appear in the recommendations sidebar with a "Survey-Based" badge
- Survey-based recommendations are sorted to appear first in the list
- Visual indicators (blue border and background) distinguish survey-based recommendations

## API Endpoints

### POST /survey
Submits a new survey and generates an AI recommendation.

**Request Body:**
```json
{
  "location": {
    "city": "San Francisco",
    "coordinates": {"lat": 37.7749, "lng": -122.4194}
  },
  "issue": {
    "type": "Missing Curb Ramps",
    "description": "No curb ramps at intersection",
    "severity": "critical"
  },
  "impact": {
    "frequency": "daily",
    "affected_groups": ["wheelchair"],
    "age_groups": ["seniors"]
  },
  "demographics": {
    "mobility_needs": ["wheelchair"],
    "income_level": "middle"
  },
  "contact": {}
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Survey submitted successfully",
  "survey_id": "survey_1",
  "ai_recommendation": {
    "priority": "High",
    "title": "Accessibility Improvement Plan for San Francisco",
    "description": "Address Missing Curb Ramps reported by community member",
    "recommended_actions": [...],
    "cost_estimate": "$5,000 - $25,000",
    "timeline": "2-4 weeks",
    "expected_impact": "Improve accessibility for community members with mobility needs",
    "implementation_partners": [...],
    "coordinates": {...},
    "generated_at": "2025-08-12T16:23:48.180258"
  }
}
```

### GET /survey-recommendations
Retrieves all AI-generated recommendations from survey submissions.

**Response:**
```json
{
  "recommendations": [
    {
      "priority": "High",
      "title": "Accessibility Improvement Plan for San Francisco",
      "description": "Address Missing Curb Ramps reported by community member",
      "recommended_actions": [...],
      "cost_estimate": "$5,000 - $25,000",
      "timeline": "2-4 weeks",
      "expected_impact": "Improve accessibility for community members with mobility needs",
      "implementation_partners": [...],
      "coordinates": {...},
      "generated_at": "2025-08-12T16:23:48.180258",
      "survey_id": "survey_1",
      "survey_location": {...},
      "survey_issue": {...},
      "submitted_at": "2025-08-12T16:23:48.179894"
    }
  ],
  "total": 1
}
```

## Frontend Components

### EnhancedSurveyPage
- Handles survey form submission
- Shows success message with link to recommendations tab
- Automatically refreshes recommendations after successful submission

### RecommendationsSidebar
- Displays both system-generated and survey-based recommendations
- Survey-based recommendations are visually distinguished with:
  - Blue border and background
  - "Survey-Based" badge
  - Priority sorting (survey-based first)
- Updated description mentions both types of recommendations

### ApiContext
- Merges survey recommendations with system recommendations
- Provides unified access to all recommendations
- Handles error cases gracefully

## WatsonX Integration

The feature uses IBM WatsonX AI to generate contextual recommendations based on:
- Location details (city, coordinates)
- Issue specifics (type, description, severity)
- Impact assessment (frequency, affected groups)
- Demographics (mobility needs, income level)

The AI generates structured recommendations that follow accessibility best practices and provide actionable guidance for improvement.

## Error Handling

- If WatsonX generation fails, a fallback recommendation is provided
- Survey submission continues even if AI recommendation generation fails
- Frontend gracefully handles missing recommendations
- All errors are logged for debugging

## Future Enhancements

Potential improvements could include:
- More sophisticated WatsonX prompts for better recommendations
- Integration with existing accessibility databases
- Community voting on recommendations
- Progress tracking for implemented recommendations
- Email notifications for recommendation updates
