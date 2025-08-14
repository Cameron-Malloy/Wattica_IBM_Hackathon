import React, { useState } from 'react';
import { 
  ClipboardDocumentListIcon, 
  FaceSmileIcon,
  FaceFrownIcon,
  CheckCircleIcon,
  PhotoIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Enhanced survey questions for better WatsonX recommendations
const surveyQuestions = [
  {
    id: 1,
    type: 'location',
    question: 'Where is this accessibility issue located?',
    placeholder: 'Please provide the specific location (e.g., "Corner of Main St and Oak Ave")'
  },
  {
    id: 2,
    type: 'issue_type',
    question: 'What type of accessibility issue are you reporting?',
    options: [
      'Missing or broken curb ramps',
      'Uneven or damaged sidewalk surfaces',
      'Obstacles blocking pedestrian pathways',
      'Lack of audio signals at crosswalks',
      'Poor lighting in pedestrian areas',
      'Inaccessible public transportation stops',
      'Missing or unclear signage',
      'Other'
    ]
  },
  {
    id: 3,
    type: 'severity',
    question: 'How severe is this accessibility issue?',
    options: [
      'Critical - Completely blocks access',
      'High - Significantly difficult to navigate',
      'Moderate - Somewhat challenging',
      'Low - Minor inconvenience'
    ]
  },
  {
    id: 4,
    type: 'frequency',
    question: 'How often do you encounter this issue?',
    options: [
      'Daily',
      'Weekly',
      'Monthly',
      'Occasionally',
      'First time'
    ]
  },
  {
    id: 5,
    type: 'impact',
    question: 'How does this issue impact your daily life?',
    placeholder: 'Describe how this accessibility barrier affects you or others (e.g., "Makes it difficult to walk to the bus stop", "Prevents wheelchair access to the library")'
  },
  {
    id: 6,
    type: 'demographics',
    question: 'What accessibility needs do you or your household have? (Optional)',
    options: [
      'Mobility assistance (wheelchair, walker, cane)',
      'Visual impairment',
      'Hearing impairment',
      'Cognitive or developmental disabilities',
      'Aging-related accessibility needs',
      'Temporary mobility limitations',
      'None - reporting for others',
      'Prefer not to specify'
    ]
  },
  {
    id: 7,
    type: 'suggestions',
    question: 'What improvements would help resolve this issue? (Optional)',
    placeholder: 'Share any ideas you have for improving this location (e.g., "Install curb ramps", "Add better lighting", "Repair sidewalk")'
  }
];

const SurveyPage = () => {
  const [responses, setResponses] = useState({});
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setResponses(prev => ({
      ...prev,
      location: location
    }));
  };

  const handleMultipleChoice = (questionId, option) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleTextChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      toast.error('Please select a location on the map');
      return;
    }

    // Validate required fields
    const requiredFields = ['issue_type', 'severity', 'frequency', 'impact'];
    const missingFields = requiredFields.filter(field => !responses[field]);
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare survey data in the format expected by the backend
      const surveyData = {
        location: {
          fullAddress: selectedLocation.fullAddress,
          city: selectedLocation.city,
          state: selectedLocation.state,
          coordinates: {
            lat: selectedLocation.coordinates.lat,
            lng: selectedLocation.coordinates.lng
          }
        },
        issue: {
          type: responses.issue_type,
          severity: responses.severity,
          frequency: responses.frequency,
          description: responses.impact,
          suggestions: responses.suggestions || ''
        },
        impact: {
          daily_impact: responses.frequency,
          description: responses.impact,
          affected_population: responses.demographics || 'General public'
        },
        demographics: {
          accessibility_needs: responses.demographics || 'Not specified',
          household_size: 'Not specified'
        },
        contact: {
          name: 'Anonymous',
          email: 'anonymous@accessmap.com',
          anonymous: true
        }
      };

      // Submit to backend
      const response = await fetch('http://localhost:8003/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit survey');
      }

      const result = await response.json();
      
      toast.success('Survey submitted successfully! Your feedback will help improve accessibility.');
      
      // Reset form
      setResponses({});
      setSelectedLocation(null);
      
    } catch (error) {
      console.error('Survey submission error:', error);
      toast.error('Failed to submit survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <ClipboardDocumentListIcon className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Accessibility Issue Report</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Help us identify and improve accessibility barriers in your community. 
            Your report will be analyzed by AI to generate specific recommendations.
          </p>
        </div>

        {/* Survey Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            {/* AI Badge */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-blue-100 border border-blue-300 rounded-full px-3 py-1 flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                <span className="text-blue-800 text-sm font-medium">Powered by WatsonX</span>
              </div>
            </div>

            {/* Location Selection */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                1. Where is this accessibility issue located?
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-4">
                  Please select a location on the map to report an accessibility issue.
                </p>
                <button
                  type="button"
                  onClick={() => window.open('/map', '_blank')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  Open Map to Select Location
                </button>
                {selectedLocation && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      <strong>Selected:</strong> {selectedLocation.fullAddress}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-8">
              {surveyQuestions.slice(1).map((question, index) => (
                <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {index + 2}. {question.question}
                    {['issue_type', 'severity', 'frequency', 'impact'].includes(question.id) && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h3>

                  {/* Multiple Choice Question */}
                  {question.type === 'issue_type' || question.type === 'severity' || question.type === 'frequency' || question.type === 'demographics' && (
                    <div className="space-y-3">
                      {question.options.map((option, idx) => (
                        <label key={idx} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`question_${question.id}`}
                            value={option}
                            checked={responses[question.id] === option}
                            onChange={() => handleMultipleChoice(question.id, option)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Text Question */}
                  {(question.type === 'impact' || question.type === 'suggestions') && (
                    <div>
                      <textarea
                        rows={4}
                        placeholder={question.placeholder}
                        value={responses[question.id] || ''}
                        onChange={(e) => handleTextChange(question.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting || !selectedLocation}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                    Submit Accessibility Report
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurveyPage;
