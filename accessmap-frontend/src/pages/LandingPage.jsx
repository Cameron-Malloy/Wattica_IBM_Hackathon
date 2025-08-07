import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapIcon, 
  EyeIcon, 
  UserGroupIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Map Urban Barriers.</span>{' '}
                  <span className="block text-primary-600 xl:inline">Empower Inclusive Cities.</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  AccessMap.AI uses advanced AI agents to identify accessibility gaps in urban infrastructure, 
                  prioritize improvements based on community needs, and generate actionable plans for inclusive cities.
                </p>
                
                {/* SDG 11 Badge */}
                <div className="mt-6 flex items-center justify-center lg:justify-start">
                  <div className="bg-green-100 border border-green-300 rounded-full px-4 py-2 flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">11</span>
                    </div>
                    <span className="text-green-800 text-sm font-medium">UN SDG 11 - Sustainable Cities</span>
                  </div>
                </div>

                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/map"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                    >
                      Start Scanning
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/community"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                    >
                      View Community Reports
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        
        {/* Hero Image/Illustration Area */}
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-r from-primary-400 to-green-500 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <div className="text-center text-white">
              <MapIcon className="h-24 w-24 mx-auto mb-4 opacity-80" />
              <p className="text-lg font-medium">Interactive Accessibility Mapping</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              AI-Powered Accessibility Analysis
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our multi-agent AI system identifies, prioritizes, and plans accessibility improvements for your city.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {/* AccessScanner Agent */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                  <EyeIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">AccessScanner Agent</p>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Scans urban infrastructure using computer vision to identify accessibility barriers like missing curb ramps, 
                  broken sidewalks, and inaccessible transit stops.
                </dd>
              </div>

              {/* EquityAdvisor Agent */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-yellow-500 text-white">
                  <UserGroupIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">EquityAdvisor Agent</p>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Analyzes demographic data to prioritize accessibility improvements in areas serving vulnerable populations, 
                  ensuring equitable resource allocation.
                </dd>
              </div>

              {/* PlannerBot Agent */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <CheckCircleIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">PlannerBot Agent</p>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Generates specific improvement recommendations with cost estimates, timelines, and justifications 
                  based on impact analysis and best practices.
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-primary-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Making Cities Accessible for Everyone
            </h2>
            <p className="mt-3 text-xl text-primary-200 sm:mt-4">
              Join the movement towards inclusive urban planning
            </p>
          </div>
          <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-200">
                Accessibility Issues Identified
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">1,200+</dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-200">
                Improvement Plans Generated
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">450+</dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-200">
                Community Reports Received
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">89</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to make your city more accessible?</span>
            <span className="block text-primary-600">Start scanning today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/map"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Launch AccessMap.AI
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
