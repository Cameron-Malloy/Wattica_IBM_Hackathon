# AccessMap Frontend

A modern, intuitive React application for visualizing and managing accessibility analysis across California. Built with real-time backend integration, comprehensive geo-caching, and an excellent user experience.

## 🚀 Features

### Core Functionality
- **Real-time Backend Integration**: Seamless connection to IBM WatsonX-powered multi-agent analysis
- **Interactive Map Visualization**: Leaflet-based map with real-time data updates
- **Comprehensive Dashboard**: Monitor analysis jobs, view results, and manage workflows
- **Advanced Geo-caching**: 1,300+ California cities with precise coordinates
- **Smart Data Filtering**: Filter by severity, region, and data type
- **Real-time Status Updates**: Live polling for analysis job progress

### User Experience
- **Intuitive Navigation**: Clean, modern interface with clear information hierarchy
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Feedback**: Toast notifications and loading states
- **Error Handling**: Graceful error handling with user-friendly messages
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation

## 🏗️ Architecture

### Frontend Structure
```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts for state management
├── data/              # Data services and API clients
├── pages/             # Main application pages
├── services/          # Backend API integration
├── styles/            # Global styles and CSS
└── utils/             # Utility functions and helpers
```

### Key Components

#### API Service (`services/apiService.js`)
- Comprehensive backend communication
- Real-time job polling
- Error handling and retry logic
- Connection status monitoring

#### API Context (`contexts/ApiContext.jsx`)
- Global state management for API operations
- Real-time updates across components
- Loading and error state management
- Job tracking and status updates

#### Geo-caching System
- **`utils/californiaCitiesData.js`**: 1,300+ California cities with precise coordinates
- **`utils/geocodingService.js`**: Intelligent coordinate lookup and generation
- **`utils/coordinateGenerator.js`**: Deterministic coordinate generation for consistency

## 🛠️ Setup and Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Backend server running on port 8003

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Environment Variables
Create a `.env` file in the root directory:
```env
REACT_APP_API_URL=http://localhost:8003
```

## 📊 Data Flow

### 1. Backend Integration
The frontend connects to the backend API server which runs:
- **AccessScanner**: Identifies accessibility gaps
- **EquityAdvisor**: Prioritizes areas based on vulnerability
- **PlannerBot**: Generates improvement plans

### 2. Real-time Updates
- Jobs are tracked with real-time status updates
- Results are automatically loaded when analysis completes
- Map markers update dynamically based on new data

### 3. Geo-caching
- City coordinates are cached for fast lookup
- Fallback coordinate generation for unknown locations
- Regional clustering for better data visualization

## 🗺️ Map Features

### Interactive Visualization
- **Multiple Data Layers**: Scan results, priorities, and planning data
- **Smart Filtering**: Filter by severity, region, and data type
- **Detailed Popups**: Rich information display for each marker
- **Legend System**: Clear visual indicators for different data types

### Data Types
- **🔴 Critical Issues**: High-priority accessibility gaps
- **🟡 Moderate Issues**: Medium-priority concerns
- **🟢 Low Issues**: Minor accessibility improvements
- **🟣 Priority Areas**: High-impact regions for intervention
- **🟢 Action Plans**: Generated improvement strategies

## 📱 Pages Overview

### Dashboard (`/dashboard`)
- Start new analysis jobs
- Monitor active jobs with real-time status
- View latest results and statistics
- Quick access to map and detailed views

### Map (`/map`)
- Interactive California map
- Real-time data visualization
- Advanced filtering and search
- Detailed item information

### Survey (`/survey`)
- Community feedback collection
- Accessibility issue reporting
- Photo upload capabilities
- Multi-step form with validation

### Chat Log (`/chat-log`)
- Detailed analysis results
- Agent conversation logs
- Implementation recommendations
- Historical data tracking

## 🔧 API Integration

### Endpoints Used
- `POST /analyze` - Start complete multi-agent analysis
- `POST /scan` - Start accessibility scanning
- `POST /prioritize` - Start priority analysis
- `POST /plan` - Start planning analysis
- `GET /status/{job_id}` - Get job status
- `GET /results/{job_id}` - Get analysis results
- `GET /latest/{state}` - Get latest results for state
- `GET /health` - Health check

### Real-time Features
- **Job Polling**: Automatic status updates every 2 seconds
- **Connection Monitoring**: Real-time backend connectivity status
- **Error Recovery**: Automatic retry and fallback mechanisms
- **Data Synchronization**: Consistent state across all components

## 🎨 UI/UX Design

### Design Principles
- **Clarity**: Clear information hierarchy and visual organization
- **Efficiency**: Streamlined workflows and intuitive navigation
- **Feedback**: Real-time status updates and user notifications
- **Accessibility**: WCAG 2.1 AA compliance throughout

### Color Scheme
- **Primary**: Blue (#3b82f6) for main actions and navigation
- **Success**: Green (#10b981) for completed states
- **Warning**: Yellow (#f59e0b) for moderate priority
- **Error**: Red (#ef4444) for critical issues and errors
- **Info**: Purple (#8b5cf6) for priority areas

## 🚀 Performance Optimizations

### Geo-caching Benefits
- **Fast Lookups**: O(1) coordinate retrieval for known cities
- **Reduced API Calls**: Minimized external geocoding requests
- **Consistent Data**: Deterministic coordinate generation
- **Offline Capability**: Basic functionality without internet

### React Optimizations
- **Context Optimization**: Efficient state management
- **Component Memoization**: Reduced unnecessary re-renders
- **Lazy Loading**: Code splitting for better performance
- **Bundle Optimization**: Tree shaking and minification

## 🔒 Security Features

### Data Protection
- **Input Validation**: Client-side and server-side validation
- **XSS Prevention**: Proper data sanitization
- **CORS Configuration**: Secure cross-origin requests
- **Error Handling**: No sensitive data in error messages

## 📈 Monitoring and Analytics

### Built-in Monitoring
- **Connection Status**: Real-time backend connectivity
- **Job Tracking**: Complete analysis job lifecycle
- **Error Logging**: Comprehensive error tracking
- **Performance Metrics**: Load times and user interactions

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards
- **ESLint**: Enforced code quality standards
- **Prettier**: Consistent code formatting
- **TypeScript**: Type safety (future enhancement)
- **Testing**: Jest and React Testing Library

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed information
- Contact the development team

---

**Built with ❤️ for accessible communities**
