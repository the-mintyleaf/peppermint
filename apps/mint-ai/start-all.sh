#!/bin/bash

# sAgent - Complete Startup Script
# This script starts all required services to run sAgent with Joker chatbot
# Usage: ./start-all.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print with color
print_header() {
    echo -e "${BLUE}┌─────────────────────────────────────────────────────┐${NC}"
    echo -e "${BLUE}│${NC} $1"
    echo -e "${BLUE}└─────────────────────────────────────────────────────┘${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Start script
clear
print_header "sAgent Startup Script - Complete Initialization"
echo ""

# Check prerequisites
print_info "Checking prerequisites..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    echo "  Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js installed: $NODE_VERSION"

# Check Redis
if ! command -v redis-cli &> /dev/null; then
    print_warning "redis-cli not found. Redis might still be running, but can't verify."
    print_info "To fix: Install Redis from https://redis.io/download"
else
    print_success "redis-cli found"
fi

# Check .env.local
if [ ! -f .env.local ]; then
    print_error ".env.local file not found!"
    echo "  Please create .env.local with DEEPSEEK_API_KEY"
    exit 1
fi

if ! grep -q "DEEPSEEK_API_KEY" .env.local; then
    print_error "DEEPSEEK_API_KEY not set in .env.local"
    echo "  Please add: DEEPSEEK_API_KEY=sk-your-key-here"
    exit 1
fi

print_success ".env.local configured with DEEPSEEK_API_KEY"

echo ""
echo "═══════════════════════════════════════════════════════"
echo ""

# Check if Redis is running
print_info "Checking Redis connection..."
if redis-cli ping &> /dev/null; then
    print_success "Redis is running"
    REDIS_RUNNING=true
else
    print_warning "Redis is not running or not accessible"
    print_info "You can start Redis manually in another terminal:"
    print_info "  redis-server"
    echo ""
    echo "Attempting to start Redis with: redis-server"

    # Try to start Redis in background
    if command -v redis-server &> /dev/null; then
        redis-server --daemonize yes &> /dev/null 2>&1
        sleep 2

        if redis-cli ping &> /dev/null; then
            print_success "Redis started successfully"
            REDIS_RUNNING=true
        else
            print_error "Could not start Redis"
            echo ""
            echo "Please start Redis manually in another terminal:"
            echo "  $ redis-server"
            echo ""
            REDIS_RUNNING=false
        fi
    else
        print_error "redis-server command not found"
        echo ""
        echo "Please start Redis manually in another terminal:"
        echo "  $ redis-server"
        echo ""
        REDIS_RUNNING=false
    fi
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo ""

# Install dependencies
print_info "Installing/updating dependencies..."
npm install --silent 2>&1 | tail -1
print_success "Dependencies ready"

echo ""
echo "═══════════════════════════════════════════════════════"
echo ""

# Display system info
print_header "System Ready!"
echo ""
print_success "All prerequisites met"
echo ""
echo "Starting sAgent API Server..."
echo ""
echo "┌─────────────────────────────────────────────────────┐"
echo "│  Once the server starts, you can test with:        │"
echo "│                                                     │"
echo "│  curl -X POST http://localhost:3000/v1/runs/chat \\│"
echo "│    -H \"Content-Type: application/json\" \\         │"
echo "│    -d '{                                           │"
echo "│      \"workflowId\": \"joker.chatbot\",            │"
echo "│      \"sessionId\": \"user-123\",                  │"
echo "│      \"input\": {                                  │"
echo "│        \"message\": \"Hello Joker!\"              │"
echo "│      }                                            │"
echo "│    }'                                             │"
echo "│                                                     │"
echo "│  See STARTUP_GUIDE.md for more examples           │"
echo "└─────────────────────────────────────────────────────┘"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""

# Start the API server
npm run dev
