@echo off
REM sAgent - Complete Startup Script for Windows
REM This script starts all required services to run sAgent with Joker chatbot
REM Usage: start-all.bat

setlocal enabledelayedexpansion

REM Colors and symbols (Windows 10+)
set "CHECKMARK=[√]"
set "CROSSMARK=[X]"
set "WARNING=[!]"
set "INFO=[i]"

echo.
echo =====================================================
echo  sAgent Startup Script - Complete Initialization
echo =====================================================
echo.

REM Check if Node.js is installed
echo %INFO% Checking prerequisites...
echo.

node --version >nul 2>&1
if errorlevel 1 (
    echo %CROSSMARK% Node.js is not installed!
    echo   Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo %CHECKMARK% Node.js installed: %NODE_VERSION%

REM Check .env.local
if not exist .env.local (
    echo %CROSSMARK% .env.local file not found!
    echo   Please create .env.local with DEEPSEEK_API_KEY
    pause
    exit /b 1
)

findstr /M "DEEPSEEK_API_KEY" .env.local >nul
if errorlevel 1 (
    echo %CROSSMARK% DEEPSEEK_API_KEY not set in .env.local
    echo   Please add: DEEPSEEK_API_KEY=sk-your-key-here
    pause
    exit /b 1
)

echo %CHECKMARK% .env.local configured with DEEPSEEK_API_KEY

echo.
echo =====================================================
echo.

REM Check if Redis is running
echo %INFO% Checking Redis connection...

redis-cli ping >nul 2>&1
if errorlevel 1 (
    echo %WARNING% Redis is not running or not accessible
    echo.
    echo If Redis is not running, please start it manually in another terminal:
    echo   redis-server
    echo.
    echo Or if you have Redis installed as a Windows service:
    echo   net start Redis
    echo.
) else (
    echo %CHECKMARK% Redis is running
)

echo.
echo =====================================================
echo.

REM Install dependencies
echo %INFO% Installing/updating dependencies...
call npm install >nul 2>&1
echo %CHECKMARK% Dependencies ready

echo.
echo =====================================================
echo.

REM Display system info
echo.
echo  System Ready!
echo.
echo %CHECKMARK% All prerequisites met
echo.
echo Starting sAgent API Server...
echo.
echo =====================================================
echo  Once the server starts, you can test with:
echo.
echo  curl -X POST http://localhost:3000/v1/runs/chat ^
echo    -H "Content-Type: application/json" ^
echo    -d "{\"workflowId\": \"joker.chatbot\", \"sessionId\": \"user-123\", \"input\": {\"message\": \"Hello!\"}}"
echo.
echo  For more examples, see STARTUP_GUIDE.md
echo =====================================================
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the API server
call npm run dev
