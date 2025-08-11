import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ApiProvider } from './contexts/ApiContext';
import Navigation from './components/Navigation';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import EnhancedSurveyPage from './pages/EnhancedSurveyPage';
import CommunityPage from './pages/CommunityPage';
import EnhancedChatLogPage from './pages/EnhancedChatLogPage';
import './index.css';

function App() {
  return (
    <ApiProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          {/* Enhanced Navigation */}
          <Navigation />
          
          {/* Main Content Area */}
          <main className="animate-fade-in">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/survey" element={<EnhancedSurveyPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/chat" element={<EnhancedChatLogPage />} />
            </Routes>
          </main>
          
          {/* Enhanced Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'white',
                color: '#374151',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: 'white',
                },
                style: {
                  borderLeft: '4px solid #10b981',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: 'white',
                },
                style: {
                  borderLeft: '4px solid #ef4444',
                },
              },
              loading: {
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: 'white',
                },
                style: {
                  borderLeft: '4px solid #3b82f6',
                },
              },
            }}
          />
        </div>
      </Router>
    </ApiProvider>
  );
}

export default App;
