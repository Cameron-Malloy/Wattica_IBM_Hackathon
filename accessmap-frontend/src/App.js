import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import pages
import LandingPage from './pages/LandingPage';
import MapPage from './pages/MapPage';
import SurveyPage from './pages/SurveyPage';
import DashboardPage from './pages/DashboardPage';
import ChatLogPage from './pages/ChatLogPage';
import CommunityPage from './pages/CommunityPage';

// Import components
import Navigation from './components/Navigation';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        {/* Navigation will be shown on all pages except landing */}
        <Navigation />
        
        {/* Toast notifications for user feedback */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        
        {/* Main content area */}
        <main className="">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/survey" element={<SurveyPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chat-log" element={<ChatLogPage />} />
            <Route path="/community" element={<CommunityPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
