#!/bin/bash

echo "🚀 Setting up EquityAgent Backend with WatsonX AI..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ and try again."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing Python dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "🔑 IMPORTANT: Please update the .env file with your IBM WatsonX credentials!"
    echo "   - Open .env file"
    echo "   - Add your WATSONX_API_KEY"
    echo "   - Add your WATSONX_PROJECT_ID"
    echo "   - Optionally add CENSUS_API_KEY for higher rate limits"
    echo ""
    echo "📖 See README.md for instructions on getting WatsonX credentials"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Update .env file with your WatsonX credentials"
echo "2. Run: python main.py CA"
echo "3. Start the frontend to see AI-powered accessibility analysis"
echo ""
echo "For WatsonX setup instructions, check the README.md file."
