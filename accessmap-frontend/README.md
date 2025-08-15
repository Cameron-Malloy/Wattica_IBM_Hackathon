# AccessMap Frontend

A modern, intuitive React application for visualizing and managing accessibility analysis across California. Built with conversational AI, persistent recommendation management, real-time backend integration, comprehensive geo-caching, and an exceptional user experience powered by IBM WatsonX AI.

## 🚀 Features

### Core Functionality
- **Real-time Backend Integration**: Seamless connection to IBM WatsonX-powered multi-agent analysis
- **Interactive Map Visualization**: Leaflet-based map with real-time data updates
- **Comprehensive Dashboard**: Monitor analysis jobs, view results, and manage workflows
- **Advanced Geo-caching**: 1,300+ California cities with precise coordinates
- **Smart Data Filtering**: Filter by severity, region, and data type
- **Real-time Status Updates**: Live polling for analysis job progress

### 🤖 AI-Powered Features (NEW!)
- **Conversational AI Interface**: Natural language chat with IBM WatsonX AI
- **Persistent Recommendation Management**: Save, continue, and evolve AI recommendations
- **Smart Planning Integration**: AI-powered planning tools with conversation history
- **Dynamic Updates**: Recommendations automatically update with new AI insights
- **Cross-Page Persistence**: LocalStorage-backed data persistence across sessions
- **Context-Aware Responses**: AI understands accessibility gaps and provides specific guidance

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
│   ├── InteractiveCharts.jsx       # Enhanced data visualization with improved analytics
│   ├── SmartPlanningInterface.jsx  # AI-integrated planning tools
│   ├── EnhancedRecommendations.jsx # Advanced recommendation display
│   ├── ClickableGapsGrid.jsx       # Interactive accessibility gap visualization
│   ├── MindMapVisualization.jsx    # Visual planning and relationship mapping
│   └── VisualPlanningTools.jsx     # Planning interface components
├── contexts/           # React contexts for state management
│   └── ApiContext.jsx  # Global state with persistent storage and AI integration
├── pages/             # Main application pages
│   ├── AIAdvisorPage.jsx          # Conversational AI interface (NEW!)
│   ├── DashboardPage.jsx          # Enhanced dashboard with AI features
│   ├── MapPage.jsx                # Interactive mapping
│   ├── EnhancedSurveyPage.jsx     # Advanced survey system
│   └── CommunityPage.jsx          # Community engagement features
├── services/          # Backend API integration
│   └── apiService.js   # Enhanced API client with AI endpoints
├── utils/             # Utility functions and helpers
│   ├── californiaCitiesData.js     # 1,300+ California cities geo-cache
│   ├── geocodingService.js         # Intelligent coordinate lookup
│   └── coordinateGenerator.js      # Deterministic coordinate generation
└── styles/            # Global styles and CSS
```

### Key Components

#### API Service (`services/apiService.js`)
- Comprehensive backend communication
- Real-time job polling
- Error handling and retry logic
- Connection status monitoring

#### API Context (`contexts/ApiContext.jsx`) - ENHANCED!
- Global state management for API operations with persistent storage
- Real-time updates across components with LocalStorage integration
- Advanced state management for AI recommendations and conversations
- Job tracking and status updates with cross-page synchronization
- Persistent recommendation storage with automatic save/load functionality

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

### Dashboard (`/dashboard`) - ENHANCED!
- Start new analysis jobs with improved monitoring
- Monitor active jobs with real-time status updates
- View latest results and statistics with AI-generated highlighting
- Special visual treatment for AI-generated recommendations
- Quick access to map and detailed views
- Enhanced filtering including "AI Generated" category

### AI Advisor (`/ai-advisor`) - NEW! 🤖
- **Conversational Interface**: Natural language chat with IBM WatsonX AI
- **Multiple Visualization Tabs**: Accessibility gaps, analytics, recommendations, planning tools, and saved conversations
- **Persistent Recommendations**: Save AI responses as actionable recommendations
- **Continue Conversations**: Evolve recommendations through ongoing dialogue
- **Smart Planning Integration**: AI-integrated planning tools with timeline visualization
- **Chat History**: Complete conversation logs with search and filtering

### Map (`/map`)
- Interactive California map with enhanced data visualization
- Real-time data visualization with improved performance
- Advanced filtering and search with AI recommendation support
- Detailed item information with conversation context
- Support for AI-generated recommendation markers

### Enhanced Survey (`/survey`)
- Community feedback collection with AI integration
- Accessibility issue reporting with improved validation
- Photo upload capabilities with enhanced processing
- Multi-step form with validation and AI-powered suggestions
- Automatic integration with AI Advisor conversations

### Community (`/community`)
- Community engagement features and collaboration tools
- Social sharing and discussion capabilities
- Progress tracking and community achievements
- Integration with survey and recommendation systems

## 🔧 API Integration

### Endpoints Used
- `POST /analyze` - Start complete multi-agent analysis
- `POST /scan` - Start accessibility scanning
- `POST /prioritize` - Start priority analysis
- `POST /plan` - Start planning analysis
- `POST /chatbot` - Interactive AI conversation endpoint (NEW!)
- `POST /survey` - Submit community surveys with AI integration
- `GET /surveys` - Retrieve survey data and AI recommendations
- `GET /status/{job_id}` - Get job status with enhanced tracking
- `GET /results/{job_id}` - Get analysis results with AI context
- `GET /latest/{state}` - Get latest results for state
- `GET /health` - Health check and system status

### Real-time Features
- **Job Polling**: Automatic status updates every 2 seconds
- **Connection Monitoring**: Real-time backend connectivity status
- **Error Recovery**: Automatic retry and fallback mechanisms
- **Data Synchronization**: Consistent state across all components
- **AI Conversation Persistence**: Real-time saving of conversations to LocalStorage
- **Cross-Page Updates**: Recommendations sync automatically between pages
- **Live Chat Updates**: Real-time AI responses with typing indicators

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
- **Context Optimization**: Efficient state management with selective updates
- **Component Memoization**: Reduced unnecessary re-renders with React.memo
- **Lazy Loading**: Code splitting for better performance
- **Bundle Optimization**: Tree shaking and minification

### AI & Persistence Optimizations (NEW!)
- **LocalStorage Caching**: Instant load of saved recommendations and conversations
- **Smart Updates**: Only update changed recommendation fields
- **Conversation Threading**: Efficient storage of chat history
- **Background Sync**: Non-blocking persistence operations

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
