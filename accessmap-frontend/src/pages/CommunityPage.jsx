import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  PhotoIcon,
  MapPinIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon,
  CheckCircleIcon,
  XMarkIcon,
  FaceSmileIcon,
  FaceFrownIcon
} from '@heroicons/react/24/outline';
import { mockCommunityReports } from '../data/mockData';
import toast from 'react-hot-toast';

const CommunityPage = () => {
  const [reports, setReports] = useState([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    issue_type: '',
    description: '',
    location: '',
    photo: null,
    sentiment: 'concerned'
  });
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    // Simulate loading community reports
    setTimeout(() => {
      setReports(mockCommunityReports);
      setLoading(false);
    }, 1000);
  }, []);

  const issueTypes = [
    'Missing Curb Ramp',
    'Broken Sidewalk',
    'Elevator Out of Service',
    'Inaccessible Restroom',
    'Blocked Sidewalk',
    'Missing Audio Signal',
    'Poor Lighting',
    'Other'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        photo: file
      }));
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    
    if (!formData.issue_type || !formData.description || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Simulate API call
    const newReport = {
      id: reports.length + 1,
      location: { lat: 37.7749, lng: -122.4194, address: formData.location },
      issue_type: formData.issue_type,
      description: formData.description,
      reporter: 'You',
      date_reported: new Date().toISOString().split('T')[0],
      photo_url: formData.photo ? URL.createObjectURL(formData.photo) : null,
      status: 'reported',
      sentiment: formData.sentiment
    };

    setReports(prev => [newReport, ...prev]);
    toast.success('Report submitted successfully! Thank you for helping improve accessibility.');
    
    // Reset form
    setFormData({
      issue_type: '',
      description: '',
      location: '',
      photo: null,
      sentiment: 'concerned'
    });
    setShowReportForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'frustrated':
        return <FaceFrownIcon className="h-4 w-4 text-red-500" />;
      case 'concerned':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case 'hopeful':
        return <FaceSmileIcon className="h-4 w-4 text-green-500" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredReports = reports.filter(report => {
    if (selectedFilter === 'all') return true;
    return report.status === selectedFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserGroupIcon className="h-8 w-8 text-primary-600" />
              <h1 className="text-3xl font-bold text-gray-900">Community Reporting</h1>
            </div>
            <button
              onClick={() => setShowReportForm(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Report a Barrier</span>
            </button>
          </div>
          <p className="text-lg text-gray-600 mt-4">
            Help improve accessibility in your community by reporting barriers and sharing your experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Reports Feed */}
          <div className="lg:col-span-2">
            {/* Filter Controls */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Reports</option>
                  <option value="reported">Reported</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Reports Feed */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <ClockIcon className="h-5 w-5" />
                <span>Recent Reports</span>
              </h2>
              
              {filteredReports.map((report) => (
                <div key={report.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                  {/* Report Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{report.issue_type}</h3>
                        {getSentimentIcon(report.sentiment)}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{report.location.address}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                        {report.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Photo */}
                  {report.photo_url && (
                    <div className="mb-4">
                      <img
                        src={report.photo_url}
                        alt="Accessibility barrier"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-gray-700">{report.description}</p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <span>Reported by {report.reporter}</span>
                      <span>•</span>
                      <span>{formatDate(report.date_reported)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <EyeIcon className="h-4 w-4" />
                      <span>Public</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Impact</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Reports</span>
                  <span className="text-lg font-bold text-primary-600">{reports.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Under Review</span>
                  <span className="text-lg font-bold text-blue-600">
                    {reports.filter(r => r.status === 'under_review').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Resolved</span>
                  <span className="text-lg font-bold text-green-600">
                    {reports.filter(r => r.status === 'resolved').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Reporting Tips</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start space-x-2">
                  <PhotoIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Include photos when possible to help identify the issue</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Be specific about the location (street address, landmark)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <ExclamationTriangleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Describe how the barrier affects accessibility</span>
                </div>
              </div>
            </div>

            {/* SDG Callout */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">11</span>
                </div>
                <h4 className="font-medium text-green-900">SDG 11.3 - Inclusive Planning</h4>
              </div>
              <p className="text-sm text-green-800">
                Your community reports enable participatory planning and help create more inclusive urban spaces.
              </p>
            </div>
          </div>
        </div>

        {/* Report Form Modal */}
        {showReportForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Report an Accessibility Barrier</h2>
                  <button
                    onClick={() => setShowReportForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmitReport} className="space-y-6">
                  {/* Issue Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Type *
                    </label>
                    <select
                      value={formData.issue_type}
                      onChange={(e) => handleInputChange('issue_type', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      required
                    >
                      <option value="">Select an issue type</option>
                      {issueTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., 123 Main St, or near City Hall"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How does this affect you? *
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the barrier and how it impacts accessibility..."
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      required
                    />
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Photo (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                  </div>

                  {/* Sentiment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How do you feel about this issue?
                    </label>
                    <div className="flex space-x-4">
                      {[
                        { value: 'frustrated', label: 'Frustrated', icon: '😡' },
                        { value: 'concerned', label: 'Concerned', icon: '😟' },
                        { value: 'hopeful', label: 'Hopeful', icon: '😊' }
                      ].map(option => (
                        <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="sentiment"
                            value={option.value}
                            checked={formData.sentiment === option.value}
                            onChange={(e) => handleInputChange('sentiment', e.target.value)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <span className="text-lg">{option.icon}</span>
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowReportForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Submit Report
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
