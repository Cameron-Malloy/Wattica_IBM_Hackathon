import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MapIcon, 
  ChartBarIcon, 
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  HomeIcon 
} from '@heroicons/react/24/outline';

const Navigation = () => {
  const location = useLocation();
  
  // Don't show navigation on landing page
  if (location.pathname === '/') {
    return null;
  }

  const navItems = [
    { path: '/map', name: 'Interactive Map', icon: MapIcon },
    { path: '/dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { path: '/survey', name: 'Survey', icon: ClipboardDocumentListIcon },
    { path: '/chat-log', name: 'AI Chat Log', icon: ChatBubbleLeftRightIcon },
    { path: '/community', name: 'Community', icon: UserGroupIcon },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <HomeIcon className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">AccessMap.AI</span>
            </Link>
          </div>

          {/* Navigation links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 border-b-2 border-primary-600'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button - you can expand this later */}
          <div className="md:hidden flex items-center">
            <button className="text-gray-600 hover:text-primary-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
