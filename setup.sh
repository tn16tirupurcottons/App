#!/bin/bash
set -e

echo "=========================================="
echo "📦 TN16 Ecommerce - One-Command Setup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo -e "${BLUE}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"
echo ""

# Check npm version
echo -e "${BLUE}Checking npm installation...${NC}"
NPM_VERSION=$(npm -v)
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
echo -e "${GREEN}✓ npm ${NPM_VERSION}${NC}"
echo ""

# Install frontend dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd ecommerce-frontend
npm install
cd ..
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
echo ""

# Install backend dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
cd ecommerce-backend
npm install
cd ..
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

# Check for .env files
echo -e "${BLUE}Checking environment variables...${NC}"
if [ ! -f ecommerce-backend/.env ]; then
    echo -e "${YELLOW}⚠ backend/.env not found${NC}"
    echo "   Copy ecommerce-backend/.env.example to ecommerce-backend/.env and update with your values"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Configure backend environment:"
echo "   • Copy ecommerce-backend/.env.example to ecommerce-backend/.env"
echo "   • Update with your database URL and secrets"
echo ""
echo "2. Start development servers:"
echo "   npm run dev"
echo ""
echo "3. Or start individually:"
echo "   npm run dev:backend    (Terminal 1)"
echo "   npm run dev:frontend   (Terminal 2)"
echo ""
echo -e "${BLUE}Common commands:${NC}"
echo "  npm run dev           - Start both frontend and backend"
echo "  npm run dev:frontend  - Start only frontend (port 5173)"
echo "  npm run dev:backend   - Start only backend (port 5001)"
echo "  npm run build         - Build frontend for production"
echo "  npm run clean         - Remove all node_modules"
echo ""
