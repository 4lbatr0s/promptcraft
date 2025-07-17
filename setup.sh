#!/bin/bash

echo "🚀 Setting up LLM Prompt Optimizer..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install

# Create backend .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating backend .env file..."
    cp env.example .env
    echo "⚠️  Please update server/.env with your actual configuration"
fi

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install

# Create frontend .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating frontend .env file..."
    cp env.example .env
    echo "⚠️  Please update client/.env with your actual configuration"
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your environment files:"
echo "   - server/.env (MongoDB, Kinde, LLM API keys)"
echo "   - client/.env (Kinde frontend config)"
echo ""
echo "2. Set up your services:"
echo "   - MongoDB Atlas database"
echo "   - Kinde authentication (2 apps: frontend + backend)"
echo "   - LLM provider API keys (at least one required)"
echo ""
echo "3. Start development servers:"
echo "   cd server && npm run dev"
echo "   cd client && npm run dev"
echo ""
echo "📖 See README.md for detailed setup instructions" 