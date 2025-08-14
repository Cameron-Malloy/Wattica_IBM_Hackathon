import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardDocumentListIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SparklesIcon,
  DocumentTextIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../components/LoadingSpinner';
import InteractiveMapSelector from '../components/InteractiveMapSelector';
import { ALL_CALIFORNIA_CITIES } from '../utils/californiaCitiesData';
import toast from 'react-hot-toast';
import { useApi } from '../contexts/ApiContext';

// California cities for validation (using comprehensive list)
const CALIFORNIA_CITIES = Object.keys(ALL_CALIFORNIA_CITIES);

const EnhancedSurveyPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submittedPlan, setSubmittedPlan] = useState(null);
  const { getLatestResults } = useApi();
  
  const [formData, setFormData] = useState({
    city: '',
    coordinates: null,
    selectedLocation: null,
    issue: {
      type: '',
      description: '',
      severity: ''
    },
    impact: {
      frequency: '',
      affected_groups: [],
      age_groups: []
    },
    demographics: {
      mobility_needs: [],
      income_level: '',
      accessibility_concerns: []
    }
  });

  const severityLevels = [
    { value: 'critical', label: 'Critical', description: 'Immediate safety hazard' },
    { value: 'moderate', label: 'Moderate', description: 'Significant barrier' },
    { value: 'minor', label: 'Minor', description: 'Inconvenience or minor issue' }
  ];

  const impactFrequencies = [
    { value: 'daily', label: 'Daily', description: 'Affects people every day' },
    { value: 'weekly', label: 'Weekly', description: 'Affects people weekly' },
    { value: 'monthly', label: 'Monthly', description: 'Affects people monthly' },
    { value: 'occasionally', label: 'Occasionally', description: 'Affects people occasionally' }
  ];

  const ageGroups = [
    { value: 'children', label: 'Children (0-17)', icon: '👶' },
    { value: 'young_adults', label: 'Young Adults (18-35)', icon: '👨‍🎓' },
    { value: 'adults', label: 'Adults (36-65)', icon: '👨‍💼' },
    { value: 'seniors', label: 'Seniors (65+)', icon: '👴' }
  ];

  const mobilityNeeds = [
    { value: 'wheelchair', label: 'Wheelchair Users', icon: '♿' },
    { value: 'walking_aids', label: 'Walking Aids', icon: '🦯' },
    { value: 'visual_impairment', label: 'Visual Impairment', icon: '🕶️' },
    { value: 'hearing_impairment', label: 'Hearing Impairment', icon: '🦻' },
    { value: 'cognitive_disabilities', label: 'Cognitive Disabilities', icon: '🧠' },
    { value: 'elderly', label: 'Elderly', icon: '👴' }
  ];

  const incomeLevels = [
    { value: 'low', label: 'Low Income', description: 'Below $50,000 annually' },
    { value: 'middle', label: 'Middle Income', description: '$50,000 - $100,000 annually' },
    { value: 'high', label: 'High Income', description: 'Above $100,000 annually' }
  ];

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.selectedLocation && formData.selectedLocation.coordinates;
      case 2:
        return formData.issue.type && formData.issue.description && formData.issue.severity;
      case 3:
        return formData.impact.frequency && formData.impact.age_groups.length > 0;
      case 4:
        return formData.demographics.mobility_needs.length > 0 && formData.demographics.income_level;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLocationSelect = (locationData) => {
    setFormData(prev => ({
      ...prev,
      selectedLocation: locationData,
      city: locationData.cityName,
      coordinates: locationData.coordinates
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Prepare survey data in the correct format for backend
      const surveyPayload = {
        location: {
          city: formData.city,
          coordinates: formData.coordinates,
          fullAddress: formData.selectedLocation?.fullAddress
        },
        issue: formData.issue,
        impact: formData.impact,
        demographics: formData.demographics,
        contact: {} // Add contact info if needed
      };

      // Submit survey data
      const surveyResponse = await fetch('http://localhost:8003/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyPayload)
      });

      if (!surveyResponse.ok) throw new Error('Failed to submit survey');

      const surveyResult = await surveyResponse.json();
      
      // Check if AI recommendation was generated
      if (surveyResult.ai_recommendation) {
        const recommendation = surveyResult.ai_recommendation;
        setSubmittedPlan({
          summary: "AI-powered accessibility recommendation generated based on your report",
          recommendations: [
            {
              title: recommendation.title,
              description: recommendation.description,
              priority: recommendation.priority,
              timeline: recommendation.timeline,
              cost_estimate: recommendation.cost_estimate,
              implementation_steps: recommendation.recommended_actions,
              type: "infrastructure",
              expected_impact: recommendation.expected_impact,
              implementation_partners: recommendation.implementation_partners
            }
          ]
        });
      } else {
        // Fallback plan if AI recommendation failed
        setSubmittedPlan({
          summary: "Thank you for your accessibility report",
          recommendations: [
            {
              title: "Accessibility Issue Response Plan",
              description: "Your report has been received and will be reviewed by accessibility experts.",
              priority: formData.issue.severity === 'critical' ? 'High' : 'Medium',
              timeline: formData.issue.severity === 'critical' ? '1-2 weeks' : '2-4 weeks',
              cost_estimate: "TBD after assessment",
              implementation_steps: [
                "Issue logged in accessibility tracking system",
                "Site assessment will be scheduled",
                "Local accessibility coordinator will be notified",
                "Community will receive updates on progress"
              ]
            }
          ]
        });
      }

      if (surveyResult.ai_recommendation) {
        toast.success('Survey submitted and AI recommendation generated! Check the Recommendations tab to see it.');
        // Refresh recommendations to include the new survey-based recommendation
        try {
          await getLatestResults('CA');
        } catch (error) {
          console.warn('Failed to refresh recommendations:', error);
        }
      } else {
        toast.success('Survey submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast.error('Failed to submit survey. Please try again.');
      
      // Fallback plan
      setSubmittedPlan({
        summary: "Thank you for your report",
        recommendations: [
          {
            title: "Immediate Response Plan",
            description: "Your accessibility concern has been recorded and will be addressed.",
            priority: "High",
            timeline: "1-2 weeks",
            cost_estimate: "TBD",
            implementation_steps: [
              "Issue has been logged in our system",
              "Local authorities will be notified",
              "Site assessment will be scheduled",
              "You will receive updates on progress"
            ]
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'infrastructure':
        return <DocumentTextIcon className="h-6 w-6 text-blue-600" />;
      case 'policy':
        return <LightBulbIcon className="h-6 w-6 text-green-600" />;
      case 'technology':
        return <SparklesIcon className="h-6 w-6 text-purple-600" />;
      default:
        return <CheckCircleIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const steps = [
    { number: 1, title: 'Location', icon: MapPinIcon },
    { number: 2, title: 'Issue Details', icon: ExclamationTriangleIcon },
    { number: 3, title: 'Impact Assessment', icon: UserGroupIcon },
    { number: 4, title: 'Demographics', icon: UserGroupIcon },
    { number: 5, title: 'Submit', icon: ClipboardDocumentListIcon },
    { number: 6, title: 'AI Plan', icon: SparklesIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold gradient-text mb-4">
              Report Accessibility Problem
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Report accessibility issues in your community and receive AI-generated action plans
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center space-y-2"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-lg ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent scale-110' 
                      : isCompleted 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-transparent'
                        : 'bg-white text-gray-400 border-gray-300 hover:border-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircleIcon className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="text-center">
                    <span className={`text-xs font-medium transition-colors duration-200 ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                    <div className={`text-xs mt-1 ${
                      isActive ? 'text-blue-500' : isCompleted ? 'text-green-500' : 'text-gray-400'
                    }`}>
                      Step {step.number}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Progress bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <motion.div
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 h-3 rounded-full shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 6) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Start</span>
              <span className="font-medium text-gray-700">{Math.round((currentStep / 6) * 100)}% Complete</span>
              <span>Finish</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl shadow-xl border border-white/20 p-8"
        >
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <MapPinIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Where is the issue located?</h2>
                  <p className="text-gray-600">Click on the map to select the exact location, or choose from popular cities below.</p>
                </div>

                <InteractiveMapSelector
                  onLocationSelect={handleLocationSelect}
                  selectedLocation={formData.selectedLocation}
                  className="w-full"
                />

                {/* Alternative city dropdown for users who prefer text selection */}
                <div className="border-t pt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Or search and select from all California cities:
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => {
                      const selectedCity = e.target.value;
                      if (selectedCity && ALL_CALIFORNIA_CITIES[selectedCity]) {
                        const coordinates = ALL_CALIFORNIA_CITIES[selectedCity];
                        handleLocationSelect({
                          coordinates: coordinates,
                          cityName: selectedCity,
                          fullAddress: `${selectedCity}, CA, USA`
                        });
                      }
                    }}
                    className="select-modern"
                  >
                    <option value="">Search cities...</option>
                    {CALIFORNIA_CITIES.sort().map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <ExclamationTriangleIcon className="h-16 w-16 text-orange-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Describe the Issue</h2>
                  <p className="text-gray-600">Tell us about the accessibility problem you've observed.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Issue Type</label>
                    <select
                      value={formData.issue.type}
                      onChange={(e) => setFormData({
                        ...formData,
                        issue: { ...formData.issue, type: e.target.value }
                      })}
                      className="select-modern"
                    >
                      <option value="">Select issue type...</option>
                      <option value="physical_barrier">Physical Barrier</option>
                      <option value="lack_of_ramps">Lack of Ramps</option>
                      <option value="narrow_pathways">Narrow Pathways</option>
                      <option value="poor_lighting">Poor Lighting</option>
                      <option value="lack_of_signage">Lack of Signage</option>
                      <option value="transportation_issue">Transportation Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Severity Level</label>
                    <div className="space-y-3">
                      {severityLevels.map((level) => (
                        <label key={level.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="severity"
                            value={level.value}
                            checked={formData.issue.severity === level.value}
                            onChange={(e) => setFormData({
                              ...formData,
                              issue: { ...formData.issue, severity: e.target.value }
                            })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <div className="font-medium text-gray-900">{level.label}</div>
                            <div className="text-sm text-gray-500">{level.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Detailed Description</label>
                  <textarea
                    value={formData.issue.description}
                    onChange={(e) => setFormData({
                      ...formData,
                      issue: { ...formData.issue, description: e.target.value }
                    })}
                    rows={4}
                    className="input-modern"
                    placeholder="Please provide a detailed description of the accessibility issue..."
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <UserGroupIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Impact Assessment</h2>
                  <p className="text-gray-600">Help us understand how this issue affects the community.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">How often does this issue occur?</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {impactFrequencies.map((freq) => (
                      <label key={freq.value} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="frequency"
                          value={freq.value}
                          checked={formData.impact.frequency === freq.value}
                          onChange={(e) => setFormData({
                            ...formData,
                            impact: { ...formData.impact, frequency: e.target.value }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{freq.label}</div>
                          <div className="text-sm text-gray-500">{freq.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Which age groups are most affected?</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ageGroups.map((group) => (
                      <label key={group.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          value={group.value}
                          checked={formData.impact.age_groups.includes(group.value)}
                          onChange={(e) => {
                            const newGroups = e.target.checked
                              ? [...formData.impact.age_groups, group.value]
                              : formData.impact.age_groups.filter(g => g !== group.value);
                            setFormData({
                              ...formData,
                              impact: { ...formData.impact, age_groups: newGroups }
                            });
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-2xl ml-3">{group.icon}</span>
                        <span className="ml-3 font-medium text-gray-900">{group.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <UserGroupIcon className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Demographic Information</h2>
                  <p className="text-gray-600">Help us understand the specific accessibility needs in your area.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">What types of mobility needs are affected?</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mobilityNeeds.map((need) => (
                      <label key={need.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          value={need.value}
                          checked={formData.demographics.mobility_needs.includes(need.value)}
                          onChange={(e) => {
                            const newNeeds = e.target.checked
                              ? [...formData.demographics.mobility_needs, need.value]
                              : formData.demographics.mobility_needs.filter(n => n !== need.value);
                            setFormData({
                              ...formData,
                              demographics: { ...formData.demographics, mobility_needs: newNeeds }
                            });
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-2xl ml-3">{need.icon}</span>
                        <span className="ml-3 font-medium text-gray-900">{need.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Income level of affected area</label>
                  <div className="space-y-3">
                    {incomeLevels.map((level) => (
                      <label key={level.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="income"
                          value={level.value}
                          checked={formData.demographics.income_level === level.value}
                          onChange={(e) => setFormData({
                            ...formData,
                            demographics: { ...formData.demographics, income_level: e.target.value }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{level.label}</div>
                          <div className="text-sm text-gray-500">{level.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <ClipboardDocumentListIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
                  <p className="text-gray-600">Please review your information before submitting.</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                      {formData.coordinates && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Coordinates:</p>
                          <p className="text-gray-600">
                            {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                          </p>
                          {formData.selectedLocation?.fullAddress && (
                            <>
                              <p className="text-sm font-medium text-gray-700 mt-2">Full Address:</p>
                              <p className="text-gray-600">{formData.selectedLocation.fullAddress}</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Issue Type</h3>
                      <p className="text-gray-600">{formData.issue.type}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Severity</h3>
                      <p className="text-gray-600">{formData.issue.severity}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Frequency</h3>
                      <p className="text-gray-600">{formData.impact.frequency}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{formData.issue.description}</p>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="button-primary flex items-center mx-auto"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="small" />
                        <span className="ml-2">Submitting...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-5 w-5 mr-2" />
                        Submit & Generate AI Plan
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 6 && submittedPlan && (
              <motion.div
                key="step6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <SparklesIcon className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">AI-Generated Action Plan</h2>
                  <p className="text-gray-600">Based on your report, here's a comprehensive plan to address the issue.</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
                  <p className="text-gray-700">{submittedPlan.summary}</p>
                </div>

                {submittedPlan.recommendations && submittedPlan.recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm"
                  >
                    <div className="flex items-start space-x-4 mb-4">
                      {getRecommendationIcon(rec.type)}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{rec.title}</h3>
                        <p className="text-gray-600 mb-3">{rec.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
                              <span className="text-sm font-medium text-gray-900">Priority</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">{rec.priority}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <ClockIcon className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-900">Timeline</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">{rec.timeline}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-gray-900">Cost Estimate</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">{rec.cost_estimate}</p>
                          </div>
                        </div>

                        {rec.implementation_steps && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Implementation Steps</h4>
                            <ol className="space-y-2">
                              {rec.implementation_steps.map((step, stepIndex) => (
                                <li key={stepIndex} className="flex items-start space-x-3">
                                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                    {stepIndex + 1}
                                  </span>
                                  <span className="text-gray-700">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {rec.implementation_partners && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Implementation Partners</h4>
                            <div className="flex flex-wrap gap-2">
                              {rec.implementation_partners.map((partner, partnerIndex) => (
                                <span 
                                  key={partnerIndex} 
                                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                >
                                  {partner}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {rec.expected_impact && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <h4 className="font-semibold text-green-900 mb-1">Expected Impact</h4>
                            <p className="text-green-700 text-sm">{rec.expected_impact}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => window.location.href = '/community'}
                    className="button-secondary flex items-center"
                  >
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    View Community Reports
                  </button>
                  <button
                    onClick={() => window.location.href = '/map'}
                    className="button-primary flex items-center"
                  >
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    View on Map
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation Buttons */}
        {currentStep < 6 && (
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="button-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Previous
            </button>
            
            <button
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
              className="button-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedSurveyPage;
