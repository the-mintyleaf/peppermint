#!/bin/bash

# Load environment variables from .env.local
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
  echo "✓ Environment variables loaded from .env.local"
else
  echo "✗ .env.local file not found!"
  exit 1
fi

# Verify required variables are set
if [ -z "$VAGENT_REDIS_URL" ]; then
  echo "✗ VAGENT_REDIS_URL is not set in .env.local"
  exit 1
fi

echo "✓ VAGENT_REDIS_URL=$VAGENT_REDIS_URL"
echo "✓ Starting sAgent..."
echo ""

# Start the development server
npm run dev
