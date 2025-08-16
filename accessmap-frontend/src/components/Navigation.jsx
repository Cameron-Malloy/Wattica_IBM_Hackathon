import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  MapIcon, 
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    {
      name: 'AI Advisor',
      href: '/ai-advisor',
      icon: SparklesIcon,
      description: 'Intelligent accessibility planning assistant powered by WatsonX'
    },
    {
      name: 'Map',
      href: '/map',
      icon: MapIcon,
      description: 'Interactive accessibility map'
    },
    {
      name: 'Report Problem',
      href: '/survey',
      icon: ClipboardDocumentListIcon,
      description: 'Report accessibility issues'
    },
    {
      name: 'Community',
      href: '/community',
      icon: UserGroupIcon,
      description: 'Community feedback and reports'
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-16 h-16 relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                  <img 
                    src="/access-map-logo.png" 
                    alt="AccessMap Logo" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* CSS-based logo fallback that matches your design */}
                  <div className="w-full h-full bg-gray-100 border-2 border-gray-400 rounded-xl hidden items-center justify-center relative overflow-hidden">
                    {/* Roads/Infrastructure */}
                    <div className="absolute inset-0">
                      {/* Main road */}
                      <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-600 transform -translate-y-1/2"></div>
                      {/* Dashed line */}
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white transform -translate-y-1/2" style={{
                        backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, white 2px, white 4px)'
                      }}></div>
                      {/* Intersecting road */}
                      <div className="absolute top-0 bottom-0 left-1/2 w-2 bg-gray-600 transform -translate-x-1/2"></div>
                    </div>
                    {/* Green hills */}
                    <div className="absolute top-1 left-1 w-5 h-5 bg-green-600 rounded-full"></div>
                    <div className="absolute top-1 right-1 w-5 h-5 bg-green-600 rounded-full"></div>
                    {/* Brown/amber area */}
                    <div className="absolute bottom-1 left-2 right-2 h-4 bg-amber-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">AM</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">AccessMap</h1>
                  <p className="text-xs text-amber-600 font-medium -mt-1">Inclusive City Planning</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-200 group ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                    
                    {/* Active indicator */}
                    {isActive(item.href) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl -z-10"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                      {item.description}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Right side - could add user menu, notifications, etc. */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-gentle"></div>
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white/90 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-12 h-12 relative overflow-hidden rounded-lg shadow-lg">
                <img 
                  src="/access-map-logo.png" 
                  alt="AccessMap Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                {/* CSS-based mobile logo fallback */}
                <div className="w-full h-full bg-gray-100 border-2 border-gray-400 rounded-lg hidden items-center justify-center relative overflow-hidden">
                  {/* Roads */}
                  <div className="absolute inset-0">
                    <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gray-600 transform -translate-y-1/2"></div>
                    <div className="absolute top-0 bottom-0 left-1/2 w-1.5 bg-gray-600 transform -translate-x-1/2"></div>
                  </div>
                  {/* Green hills */}
                  <div className="absolute top-1 left-1 w-3.5 h-3.5 bg-green-600 rounded-full"></div>
                  <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-green-600 rounded-full"></div>
                  {/* Brown area with AM */}
                  <div className="absolute bottom-1 left-1.5 right-1.5 h-2.5 bg-amber-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">AM</span>
                  </div>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-800">AccessMap</span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white/95 backdrop-blur-md border-t border-white/20 shadow-lg"
            >
              <div className="px-4 py-6 space-y-2">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                          isActive(item.href)
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                        <div className="flex-1">
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-sm opacity-75">{item.description}</div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
                
                {/* Mobile status indicator */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-gentle"></div>
                    <span>System Online</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navigation;
