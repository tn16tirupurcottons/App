@echo off
setlocal enabledelayedexpansion
color 0A

echo.
echo ==========================================
echo 📦 TN16 Ecommerce - One-Command Setup
echo ==========================================
echo.

REM Check for Node.js
echo Checking Node.js installation...
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed
    echo Please install Node.js v18+ from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION%
echo.

REM Check for npm
echo Checking npm installation...
npm -v >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✓ npm %NPM_VERSION%
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
cd ecommerce-frontend
call npm install
if errorlevel 1 (
    echo ❌ Frontend installation failed
    pause
    exit /b 1
)
cd ..
echo ✓ Frontend dependencies installed
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd ecommerce-backend
call npm install
if errorlevel 1 (
    echo ❌ Backend installation failed
    pause
    exit /b 1
)
cd ..
echo ✓ Backend dependencies installed
echo.

REM Check for .env files
echo Checking environment variables...
if not exist "ecommerce-backend\.env" (
    echo ⚠ backend\.env not found
    echo   Copy ecommerce-backend\.env.example to ecommerce-backend\.env
)
echo.

echo ==========================================
echo ✅ Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Configure backend environment:
echo    - Copy ecommerce-backend\.env.example to ecommerce-backend\.env
echo    - Update with your database URL and secrets
echo.
echo 2. Start development servers:
echo    npm run dev
echo.
echo 3. Or start individually:
echo    npm run dev:backend    (Terminal 1)
echo    npm run dev:frontend   (Terminal 2)
echo.
echo Common commands:
echo   npm run dev           - Start both frontend and backend
echo   npm run dev:frontend  - Start only frontend (port 5173)
echo   npm run dev:backend   - Start only backend (port 5001)
echo   npm run build         - Build frontend for production
echo   npm run clean         - Remove all node_modules
echo.
pause
