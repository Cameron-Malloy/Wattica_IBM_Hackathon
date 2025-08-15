# 🌟 AccessMap: AI-Powered Accessibility Intelligence

**Call for Code 2024 Submission - Sustainable Cities and Communities (SDG 11)**

*Developed by four UC Berkeley incoming freshmen*

AccessMap uses IBM WatsonX AI to analyze urban accessibility gaps and provide actionable insights for creating more inclusive communities. Our comprehensive solution combines demographic vulnerability data with conversational AI, intelligent planning tools, and persistent recommendation management to transform how cities approach accessibility improvements.

## 🎯 Problem Statement

Cities struggle to identify and prioritize accessibility improvements due to:
- Limited visibility into accessibility gaps
- Lack of demographic context for vulnerability assessment  
- No systematic approach to prioritizing improvements
- Disconnected data sources and manual processes

## 🚀 Our Solution

AccessMap leverages IBM WatsonX AI to:

### 🔍 **Intelligent Scanning**
- Analyzes census and demographic data using AI
- Identifies potential accessibility barriers
- Assigns severity levels (critical/moderate/good)
- Provides confidence scores for each finding

### 🎯 **Smart Prioritization** 
- Uses demographic vulnerability factors (elderly, disabled, low-income populations)
- AI-powered priority scoring (1-10 scale)
- Recommends implementation timelines
- Identifies equity factors and at-risk communities

### 💡 **Actionable Recommendations**
- AI-generated infrastructure, policy, and technology solutions
- Cost and impact assessments
- Specific implementation guidance
- Scalable across multiple locations

### 📊 **Interactive Visualization**
- Real-time map interface showing accessibility issues
- Detailed vulnerability analysis
- Priority area identification
- Progress tracking capabilities

### 🏘️ **Community Engagement**
- Survey-based accessibility reporting
- AI-powered recommendation generation
- Community-driven improvement tracking
- Real-time feedback integration

### 🤖 **AI Advisor & Conversational Planning**
- **Interactive AI Chat**: Natural language conversations about accessibility challenges
- **Persistent Recommendations**: Save, continue, and evolve AI recommendations over time
- **Smart Planning Tools**: AI-integrated implementation planning with timeline visualization
- **Conversation History**: Complete chat logs linked to planning items and recommendations
- **Dynamic Updates**: Recommendations automatically update with new AI insights (cost, timeline, priority)

## 🛠️ Technology Stack

### Backend (Python/FastAPI)
- **Python 3.8+** - Core processing
- **FastAPI** - REST API server
- **IBM WatsonX AI** - Intelligent accessibility analysis
- **Pandas** - Data processing and analysis
- **US Census API** - Demographic data collection
- **Uvicorn** - ASGI server

### Frontend (React)
- **React 18** - Modern user interface with hooks and context
- **Leaflet** - Interactive mapping with real-time data
- **Tailwind CSS** - Responsive design system
- **Heroicons** - Consistent iconography
- **Framer Motion** - Smooth animations and transitions
- **React Hot Toast** - User notifications and feedback
- **Recharts** - Data visualization and analytics
- **LocalStorage API** - Persistent data storage

## 🚦 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- IBM Cloud Account with WatsonX access

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Wattica_IBM_Hackathon
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure WatsonX Credentials

1. **Get IBM WatsonX Credentials:**
   - Go to [IBM Cloud](https://cloud.ibm.com)
   - Create/access WatsonX project
   - Get your API Key and Project ID

2. **Set Environment Variables:**
```bash
export WATSONX_API_KEY=your_api_key_here
export WATSONX_PROJECT_ID=your_project_id_here
export WATSONX_REGION=us-south
```

Or create a `.env` file in the backend directory:
```bash
WATSONX_API_KEY=your_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_REGION=us-south
```

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd ../accessmap-frontend

# Install dependencies
npm install
```

### 5. Run the Application

#### Option A: Run Both Services (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python api_server.py
```

**Terminal 2 - Frontend:**
```bash
cd accessmap-frontend
npm start
```

#### Option B: Run Analysis First (Optional)

If you want to generate fresh analysis data:

```bash
cd backend
source venv/bin/activate
python -c "from multi_agent_orchestrator import MultiAgentOrchestrator; import pandas as pd; orchestrator = MultiAgentOrchestrator(); df = pd.read_csv('census_results/cleaned_results/Population_Vulnerability_CA_clean.csv'); results = orchestrator.run_complete_analysis(df, 'CA')"
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8003
- **API Documentation**: http://localhost:8003/docs

## 🔧 IBM WatsonX Setup Guide

### Step 1: Create IBM Cloud Account
1. Go to [cloud.ibm.com](https://cloud.ibm.com)
2. Sign up or sign in
3. Navigate to WatsonX

### Step 2: Create WatsonX Project
1. Click "Create Project"
2. Choose "Standard" plan  
3. Note your Project ID

### Step 3: Get API Key
1. Go to "Manage" → "Access (IAM)"
2. Click "API keys" → "Create"
3. Copy your API key

### Step 4: Configure Environment
Update your environment variables with the credentials:
```bash
export WATSONX_API_KEY=your_actual_api_key
export WATSONX_PROJECT_ID=your_actual_project_id
```

## 🎮 Usage

### Dashboard Overview
- **Real-time Statistics**: View total issues, priorities, and recommendations
- **Active Analysis Jobs**: Monitor ongoing AI analysis with live updates
- **AI-Generated Recommendations**: Special highlighting for AI-powered suggestions
- **Quick Actions**: Start new analysis or navigate to interactive tools

### AI Advisor (NEW! 🤖)
- **Conversational Interface**: Natural language chat with IBM WatsonX AI
- **Contextual Assistance**: AI understands accessibility gaps and provides specific guidance
- **Save Recommendations**: Convert AI responses into actionable recommendations
- **Continue Conversations**: Evolve recommendations through ongoing dialogue
- **Implementation Planning**: AI-integrated planning tools with timeline visualization

#### AI Advisor Features:
1. **Interactive Chat**: Ask questions about accessibility challenges, implementation strategies, or specific gaps
2. **Smart Recommendations**: AI analyzes your questions and provides tailored solutions
3. **Persistent Storage**: Save important AI responses as recommendations that persist across sessions
4. **Dynamic Updates**: Continue conversations to refine cost estimates, timelines, and priorities
5. **Planning Integration**: View saved chat logs in planning tools for complete context

### Interactive Map
- **Accessibility Gaps**: Red markers showing critical issues with detailed popups
- **Priority Areas**: Orange markers for high-priority locations
- **Recommendations**: Blue markers for AI-generated solutions
- **Survey Reports**: Green markers for community submissions
- **Advanced Filtering**: Filter by severity, type, and data source

### Enhanced Survey System
1. **Submit Survey**: Report accessibility issues with location and photo support
2. **AI Analysis**: Get instant AI-powered recommendations
3. **Integration**: Survey data automatically integrates with AI Advisor
4. **Track Progress**: Monitor implementation status across all platforms

### Smart Planning Tools
- **AI-Integrated Planning**: Planning interface that connects with AI conversations
- **Chat Log Access**: View complete conversation history for each plan item
- **Timeline Visualization**: Detailed implementation timelines with cost analysis
- **Recommendation Sync**: Seamless integration between AI advice and planning

### Recommendation Management
- **Multi-Source**: Recommendations from surveys, AI chat, and automated analysis
- **AI-Generated Highlighting**: Special visual treatment for AI-powered suggestions
- **Persistent Storage**: All recommendations saved locally and synchronized
- **Conversation Context**: Full chat history preserved with each recommendation

## 📁 Project Structure

```
Wattica_IBM_Hackathon/
├── backend/                    # Python FastAPI backend
│   ├── agents/                # AI agents (AccessScanner, EquityAdvisor, PlannerBot)
│   ├── api_server.py          # Main API server with WatsonX integration
│   ├── multi_agent_orchestrator.py  # Agent coordination
│   ├── requirements.txt       # Python dependencies
│   └── venv/                  # Virtual environment
├── accessmap-frontend/         # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── InteractiveCharts.jsx       # Data visualization
│   │   │   ├── SmartPlanningInterface.jsx  # AI-integrated planning
│   │   │   ├── EnhancedRecommendations.jsx # Advanced recommendation display
│   │   │   └── VisualPlanningTools.jsx     # Planning visualization
│   │   ├── contexts/          # React contexts
│   │   │   └── ApiContext.jsx # Global state management with persistence
│   │   ├── pages/             # Main application pages
│   │   │   ├── AIAdvisorPage.jsx          # Conversational AI interface
│   │   │   ├── DashboardPage.jsx          # Enhanced dashboard with AI features
│   │   │   ├── MapPage.jsx                # Interactive mapping
│   │   │   └── EnhancedSurveyPage.jsx     # Advanced survey system
│   │   ├── services/          # API integration
│   │   └── utils/             # Utility functions and geo-caching
│   ├── public/
│   │   └── api_results/       # Generated analysis data
│   └── package.json           # Node.js dependencies
└── README.md                  # This file
```

## 🔍 Key Features

### Multi-Agent AI System
- **AccessScanner**: Identifies accessibility gaps using demographic data
- **EquityAdvisor**: Prioritizes areas based on vulnerability factors
- **PlannerBot**: Generates actionable improvement recommendations
- **Conversational AI**: Interactive WatsonX-powered chat interface

### Advanced AI Integration
- **Persistent Conversations**: Save and continue AI discussions across sessions
- **Dynamic Recommendations**: AI responses automatically update with new insights
- **Context-Aware Planning**: AI understands project context and provides relevant guidance
- **Smart Parsing**: Automatically extracts cost, timeline, and priority from AI responses

### Real-time Data & Persistence
- **Live Updates**: Analysis results update automatically across all components
- **LocalStorage Integration**: Recommendations and conversations persist across browser sessions
- **Cross-Page Synchronization**: Data updates seamlessly between Dashboard, AI Advisor, and Planning Tools
- **Community Input**: Survey submissions integrate with AI analysis

### Enhanced User Experience
- **Conversational Interface**: Natural language interaction with accessibility AI
- **Visual Planning Tools**: Interactive timeline and cost visualization
- **Smart Notifications**: Context-aware toast messages and status indicators
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Comprehensive Analysis
- **Demographic Context**: Elderly, disabled, and low-income populations
- **Geographic Coverage**: California cities and communities with precise geo-caching
- **Multi-Modal Input**: Surveys, AI conversations, and automated analysis
- **SDG Alignment**: Sustainable Development Goal 11 compliance

## 🐛 Troubleshooting

### Common Issues

**Backend Port Already in Use:**
```bash
lsof -ti:8003 | xargs kill -9
```

**Frontend Port Already in Use:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Virtual Environment Issues:**
```bash
# Remove and recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**WatsonX Connection Issues:**
- Verify API key and project ID are correct
- Check network connectivity
- Ensure WatsonX service is active

### Logs and Debugging
- **Backend Logs**: Check `backend/server.log`
- **Frontend Logs**: Check browser console
- **API Status**: Visit http://localhost:8003/docs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*Built with ❤️ for more accessible cities and communities worldwide.*
