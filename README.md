# 🌟 AccessMap: AI-Powered Accessibility Intelligence

**Call for Code 2024 Submission - Sustainable Cities and Communities (SDG 11)**

*Developed by four UC Berkeley incoming freshmen*

AccessMap uses IBM WatsonX AI to analyze urban accessibility gaps and provide actionable insights for creating more inclusive communities. Our solution combines demographic vulnerability data with AI-powered analysis to identify critical accessibility barriers and prioritize improvements.

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

## 🛠️ Technology Stack

### Backend (EquityAgent)
- **Python 3.8+** - Core processing
- **IBM WatsonX AI** - Intelligent accessibility analysis
- **Pandas** - Data processing and analysis
- **US Census API** - Demographic data collection

### Frontend (AccessMap)
- **React 18** - Modern user interface
- **Leaflet** - Interactive mapping
- **Tailwind CSS** - Responsive design
- **Heroicons** - Consistent iconography

## 🚦 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- IBM Cloud Account with WatsonX access

### 1. Backend Setup (EquityAgent)

```bash
cd EquityAgent
chmod +x setup.sh
./setup.sh
```

### 2. Configure WatsonX Credentials

1. **Get IBM WatsonX Credentials:**
   - Go to [IBM Cloud](https://cloud.ibm.com)
   - Create/access WatsonX project
   - Get your API Key and Project ID

2. **Update .env file:**
```bash
WATSONX_API_KEY=your_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_REGION=us-south
```

### 3. Run Analysis

```bash
# Activate virtual environment
source venv/bin/activate

# Run analysis for California
python main.py CA
```

### 4. Frontend Setup

```bash
cd ../accessmap-frontend
npm install
npm start
```

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
Update your `.env` file with the credentials:
```bash
WATSONX_API_KEY=your_actual_api_key
WATSONX_PROJECT_ID=your_actual_project_id
```

## 🎮 Usage

### Running Analysis
1. **Start Backend Analysis:**
   ```bash
   cd EquityAgent
   python main.py CA  # or your preferred state
   ```

2. **Launch Frontend:**
   ```bash
   cd accessmap-frontend
   npm start
   ```

3. **View Results:**
   - Open http://localhost:3000
   - Navigate to Map page
   - Explore scan results, priority areas, and recommendations

---

*Built with ❤️ for more accessible cities and communities worldwide.*
