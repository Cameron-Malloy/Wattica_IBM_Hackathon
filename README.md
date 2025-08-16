# 🌟 AccessMap: AI-Powered Accessibility Intelligence

**IBM WatsonX Hackathon 2024 Submission - Sustainable Cities and Communities (SDG 11)**

*"Turning Data into Access-First Action"*

AccessMap leverages IBM WatsonX AI to transform how cities approach accessibility improvements. Our comprehensive solution combines demographic vulnerability analysis, conversational AI planning, community engagement, and intelligent recommendation management to create more inclusive communities.

## 🎯 Problem Statement

Cities struggle to create accessible communities due to:
- **Limited Visibility**: No systematic way to identify accessibility gaps
- **Data Disconnection**: Fragmented information across departments  
- **Prioritization Challenges**: Difficulty determining where to invest limited resources
- **Community Disconnect**: Lack of resident input in accessibility planning
- **Implementation Gaps**: Missing actionable guidance for improvements

## 🚀 Our Solution

AccessMap uses IBM WatsonX AI to provide:

### 🏠 **AI-First Dashboard Experience**
- **Landing Screen**: Beautiful welcome experience highlighting our mission and SDG 11 alignment
- **WatsonX Integration**: Prominent IBM WatsonX branding throughout the platform
- **Intelligent Navigation**: AI Advisor as the primary interface for accessibility planning
- **Real-time Status**: Live connection status with WatsonX services

### 🤖 **Conversational AI Planning** (Primary Interface)
- **Natural Language Interface**: Chat directly with IBM WatsonX about accessibility challenges
- **Persistent Recommendations**: Save, edit, and track AI-generated solutions over time
- **Implementation Progress**: Visual progress bars to track recommendation implementation
- **Dynamic Planning**: AI understands context and provides evolving guidance
- **Comprehensive Editing**: Full-featured plan editing with all implementation details

### 🔍 **Intelligent Analysis System**
- **Multi-Agent Architecture**: AccessScanner, EquityAdvisor, and PlannerBot working together
- **Demographic Integration**: Census data analysis for vulnerability assessment
- **Community Input**: Survey-based accessibility reporting with AI enhancement
- **Priority Scoring**: AI-powered ranking system for maximum impact

### 📊 **Advanced Visualization & Analytics**
- **Interactive Dashboards**: Real-time data visualization with WatsonX insights
- **Progress Tracking**: Implementation progress bars for all recommendations
- **Geographic Mapping**: Interactive maps showing accessibility gaps and solutions
- **Analytics Integration**: Comprehensive statistics and trend analysis

### 🏘️ **Community Engagement Platform**
- **Survey System**: Easy accessibility issue reporting with photo support
- **AI Enhancement**: Automatic AI recommendation generation from community reports
- **Progress Visibility**: Community can track improvement implementation
- **Feedback Integration**: Real-time community input integration

## 🛠️ Technology Stack

### Backend (Python/FastAPI)
- **Python 3.8+** - Core processing engine
- **FastAPI** - High-performance REST API server
- **IBM WatsonX AI** - Conversational AI and intelligent analysis
- **Multi-Agent System** - Specialized AI agents for different tasks
- **Pandas** - Advanced data processing and analysis
- **US Census API** - Demographic and vulnerability data
- **Uvicorn** - Production-ready ASGI server

### Frontend (React)
- **React 18** - Modern UI with hooks and context
- **Tailwind CSS** - Responsive design system
- **Framer Motion** - Smooth animations and transitions
- **Leaflet** - Interactive mapping with real-time updates
- **Recharts** - Advanced data visualization
- **React Hot Toast** - User notifications and feedback
- **LocalStorage API** - Persistent data storage

## 🚦 Quick Start Guide

### Prerequisites
- Python 3.8+
- Node.js 16+
- IBM Cloud Account with WatsonX access

### 1. Clone Repository
```bash
git clone <repository-url>
cd Wattica_IBM_Hackathon
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure IBM WatsonX
**Get Credentials:**
1. Visit [IBM Cloud](https://cloud.ibm.com)
2. Create/access WatsonX project
3. Get API Key and Project ID

**Set Environment Variables:**
```bash
export WATSONX_API_KEY=your_api_key_here
export WATSONX_PROJECT_ID=your_project_id_here
export WATSONX_REGION=us-south
```

Or create `.env` file:
```env
WATSONX_API_KEY=your_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_REGION=us-south
```

### 4. Frontend Setup
```bash
cd ../accessmap-frontend
npm install
```

### 5. Run Application
**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python api_server.py
```

**Terminal 2 - Frontend:**
```bash
cd accessmap-frontend
npm start
```

### 6. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8003
- **API Docs**: http://localhost:8003/docs

## 🎮 Using AccessMap

### 🏠 Landing Experience
- **Welcome Screen**: Beautiful landing page with mission statement
- **SDG 11 Alignment**: Clear connection to UN Sustainable Development Goals
- **Quick Actions**: Direct access to data exploration and AI insights
- **WatsonX Branding**: Prominent IBM WatsonX integration throughout

### 🤖 AI Advisor (Main Dashboard)
**Primary Interface Features:**
- **Conversational Planning**: Natural language chat with IBM WatsonX
- **Smart Recommendations**: AI-generated solutions with full implementation details
- **Progress Tracking**: Visual progress bars for implementation status
- **Persistent Storage**: All conversations and recommendations saved automatically
- **Comprehensive Editing**: Full-featured plan editing with:
  - Implementation steps and notes
  - Stakeholder management
  - Risk assessment and mitigation
  - Success metrics and KPIs
  - Timeline and cost estimation
  - SDG alignment tracking
  - Equity impact analysis

**Data Visualization Modes:**
- **Stats Panel**: Real-time analytics and key metrics (default open)
- **AI Data Panel**: Visualization tools and insights (default closed)
- **Interactive Charts**: Comprehensive data analysis
- **Gap Analysis**: Accessibility issue identification
- **Implementation Planning**: Timeline and resource visualization

### 📊 Advanced Analytics
- **Real-time Statistics**: Live updates on gaps, solutions, and progress
- **Community Integration**: Survey-based reporting with AI enhancement  
- **Geographic Visualization**: Interactive maps with filtering
- **Progress Monitoring**: Implementation tracking across all recommendations
- **WatsonX Insights**: AI-powered analysis and suggestions

### 🏘️ Community Features
- **Survey Submission**: Easy accessibility issue reporting
- **AI Enhancement**: Automatic recommendation generation from reports
- **Progress Visibility**: Track implementation of community-reported issues
- **Integration**: Seamless connection between community input and AI planning

## 📁 Project Architecture

```
Wattica_IBM_Hackathon/
├── backend/                           # Python FastAPI backend
│   ├── agents/                       # AI agent system
│   │   ├── access_scanner.py         # Accessibility gap identification
│   │   ├── equity_advisor.py         # Priority and vulnerability analysis
│   │   └── planner_bot.py           # Implementation planning
│   ├── api_server.py                # Main API with WatsonX integration
│   ├── multi_agent_orchestrator.py  # Agent coordination system
│   ├── watsonx.py                   # IBM WatsonX integration
│   └── requirements.txt             # Python dependencies
├── accessmap-frontend/               # React frontend application
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── EnhancedRecommendations.jsx    # Advanced recommendation display
│   │   │   ├── ClickableGapsGrid.jsx          # Interactive gap visualization
│   │   │   ├── InteractiveCharts.jsx          # Data visualization suite
│   │   │   └── Navigation.jsx                 # App navigation with WatsonX branding
│   │   ├── contexts/
│   │   │   └── ApiContext.jsx                 # Global state with persistence
│   │   ├── pages/
│   │   │   ├── AIAdvisorPage.jsx             # Main dashboard (conversational AI)
│   │   │   ├── MapPage.jsx                   # Interactive mapping
│   │   │   ├── EnhancedSurveyPage.jsx        # Community reporting
│   │   │   └── CommunityPage.jsx             # Community engagement
│   │   ├── services/
│   │   │   └── apiService.js                 # Backend API integration
│   │   └── utils/
│   │       ├── californiaCitiesData.js       # 1,300+ city geo-cache
│   │       └── geocodingService.js           # Intelligent coordinate lookup
│   └── public/
│       ├── access-map-logo.png               # Application logo
│       └── api_results/                      # Analysis results storage
└── README.md                                # This documentation
```

## 🔍 Key Features & Innovations

### 🤖 IBM WatsonX Integration
- **Conversational AI**: Natural language planning and problem-solving
- **Multi-Agent System**: Specialized AI agents for different accessibility domains
- **Dynamic Recommendations**: AI responses that evolve with continued interaction
- **Context Awareness**: AI understands project history and provides relevant guidance
- **Real-time Processing**: Live AI responses with typing indicators

### 📈 Implementation Tracking
- **Progress Bars**: Visual implementation progress for all recommendations
- **Status Updates**: Real-time tracking of improvement initiatives  
- **Timeline Visualization**: Comprehensive project timeline management
- **Success Metrics**: KPI tracking and outcome measurement
- **Community Visibility**: Public progress tracking for transparency

### 🏗️ Advanced Planning Tools
- **Comprehensive Editing**: Full-featured plan modification with all implementation details
- **Risk Assessment**: Detailed risk analysis and mitigation strategies
- **Stakeholder Management**: Complete stakeholder identification and engagement planning
- **Resource Planning**: Cost estimation and resource allocation
- **SDG Alignment**: UN Sustainable Development Goal tracking and reporting

### 🌐 Community Integration
- **Survey System**: Easy accessibility issue reporting with photo support
- **AI Enhancement**: Automatic AI recommendation generation from community input
- **Progress Transparency**: Community can track implementation progress
- **Feedback Loop**: Continuous community input integration

## 🌍 Impact & SDG Alignment

### UN SDG Goal 11: Sustainable Cities and Communities
AccessMap directly supports SDG 11 by:
- **11.2**: Accessible and sustainable transport systems
- **11.3**: Inclusive and sustainable urbanization
- **11.7**: Universal access to safe, inclusive public spaces
- **11.a**: Supporting positive economic, social, and environmental links

### Measurable Impact
- **Gap Identification**: Systematic accessibility barrier discovery
- **Priority-Based Implementation**: Data-driven resource allocation
- **Community Engagement**: Inclusive planning and implementation
- **Progress Tracking**: Measurable improvement outcomes
- **Scalable Solutions**: Replicable across cities and regions

## 🐛 Troubleshooting

### Common Issues
**Backend Port Issues:**
```bash
lsof -ti:8003 | xargs kill -9
python api_server.py
```

**Frontend Port Issues:**
```bash
lsof -ti:3000 | xargs kill -9
npm start
```

**WatsonX Connection:**
- Verify API key and project ID
- Check IBM Cloud service status
- Ensure network connectivity
- Review environment variables

**Virtual Environment:**
```bash
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Debug Resources
- **Backend Logs**: `backend/server.log`
- **API Documentation**: http://localhost:8003/docs
- **Browser Console**: Frontend error logs
- **Network Tab**: API request/response monitoring

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes with comprehensive testing
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open Pull Request with detailed description

### Code Standards
- **Python**: PEP 8 compliance with type hints
- **JavaScript**: ESLint and Prettier formatting
- **React**: Modern hooks and functional components
- **Documentation**: Comprehensive inline comments
- **Testing**: Unit tests for critical functionality

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎖️ Acknowledgments

- **IBM WatsonX**: For providing the AI platform that powers our conversational planning
- **UN SDG Framework**: For guidance on sustainable development goals
- **Open Source Community**: For the tools and libraries that make this possible
- **Accessibility Advocates**: For inspiring inclusive design principles

---

**🌟 Built with ❤️ for more accessible cities and communities worldwide 🌟**

*Transforming accessibility planning through AI-powered insights and community engagement*