import React from 'react';
import { 
  EyeIcon, 
  UserGroupIcon, 
  CheckCircleIcon,
  ArrowRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const HowItWorksSidebar = () => {
  const steps = [
    {
      id: 1,
      title: "AccessScanner Agent",
      icon: EyeIcon,
      color: "bg-red-500",
      description: "Scans urban infrastructure using computer vision",
      details: [
        "Analyzes street-level imagery",
        "Detects missing curb ramps",
        "Identifies broken sidewalks",
        "Finds inaccessible transit stops",
        "Confidence scoring for each detection"
      ],
      output: "Raw accessibility issues with locations and severity"
    },
    {
      id: 2,
      title: "EquityAdvisor Agent",
      icon: UserGroupIcon,
      color: "bg-yellow-500",
      description: "Prioritizes issues based on demographic analysis",
      details: [
        "Cross-references with census data",
        "Analyzes vulnerable populations",
        "Considers disability rates",
        "Evaluates income levels",
        "Assesses transportation access"
      ],
      output: "Priority-ranked locations with equity scores"
    },
    {
      id: 3,
      title: "PlannerBot Agent",
      icon: CheckCircleIcon,
      color: "bg-green-500",
      description: "Generates actionable improvement plans",
      details: [
        "Creates specific recommendations",
        "Estimates implementation costs",
        "Provides timeline projections",
        "Calculates impact scores",
        "Aligns with accessibility standards"
      ],
      output: "Detailed improvement plans with justifications"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <InformationCircleIcon className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">How AccessMap.AI Works</h3>
      </div>
      
      <p className="text-sm text-gray-600">
        Our multi-agent AI system follows a three-step process to identify, prioritize, 
        and plan accessibility improvements for urban infrastructure.
      </p>

      {/* Workflow Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.id} className="relative">
              {/* Step Card */}
              <div className="card p-4 border-l-4 border-l-blue-400">
                <div className="flex items-start space-x-3">
                  <div className={`${step.color} p-2 rounded-lg flex-shrink-0`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Step {step.id}: {step.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                    
                    {/* Details */}
                    <div className="space-y-1 mb-3">
                      {step.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                          <span className="text-xs text-gray-600">{detail}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Output */}
                    <div className="bg-gray-50 rounded p-2">
                      <span className="text-xs font-medium text-gray-700">Output: </span>
                      <span className="text-xs text-gray-600">{step.output}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Arrow to next step */}
              {!isLast && (
                <div className="flex justify-center my-2">
                  <ArrowRightIcon className="h-5 w-5 text-gray-400 transform rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Technology Stack */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-3">Technology Stack</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">Backend Framework:</span>
            <span className="text-sm font-medium text-blue-900">LangChain</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">AI Platform:</span>
            <span className="text-sm font-medium text-blue-900">IBM watsonx</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">Computer Vision:</span>
            <span className="text-sm font-medium text-blue-900">Custom ML Models</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">Data Sources:</span>
            <span className="text-sm font-medium text-blue-900">Census, OpenStreetMap</span>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-3">Key Benefits</h4>
        <div className="space-y-2">
          {[
            "Automated accessibility gap detection",
            "Data-driven priority setting",
            "Cost-effective improvement planning",
            "Equitable resource allocation",
            "Measurable impact tracking"
          ].map((benefit, index) => (
            <div key={index} className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SDG Alignment */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">11</span>
          </div>
          <h4 className="font-medium text-gray-900">UN SDG 11 - Sustainable Cities</h4>
        </div>
        <p className="text-sm text-gray-700 mb-2">
          AccessMap.AI directly supports multiple SDG 11 targets:
        </p>
        <div className="space-y-1">
          <div className="text-xs text-gray-600">• 11.2 - Sustainable transport systems</div>
          <div className="text-xs text-gray-600">• 11.3 - Inclusive urbanization</div>
          <div className="text-xs text-gray-600">• 11.7 - Safe, accessible public spaces</div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksSidebar;
