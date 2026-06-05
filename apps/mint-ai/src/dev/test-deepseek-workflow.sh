#!/bin/bash

# Test script for DeepSeek Reasoning Workflow
# This script demonstrates how to call the deepseek.reasoning workflow

set -e

# Configuration
API_URL="${API_URL:-http://localhost:3000}"
SESSION_ID="test-deepseek-$(date +%s)"
WORKFLOW_ID="deepseek.reasoning"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         DeepSeek Reasoning Workflow - Test Script              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🔧 Configuration:"
echo "   API URL: $API_URL"
echo "   Workflow: $WORKFLOW_ID"
echo "   Session ID: $SESSION_ID"
echo ""

# Test 1: Single query
echo "📝 Test 1: Single Query Analysis"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Query: What are the key principles of good API design?"
echo ""
echo "Sending request..."

RESPONSE=$(curl -s -X POST "$API_URL/v1/runs" \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "'$WORKFLOW_ID'",
    "input": {
      "message": "What are the key principles of good API design?"
    }
  }')

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Test 2: Chat endpoint with session
echo "📝 Test 2: Chat with Session Context"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Query 1: Explain microservices architecture"
echo ""
echo "Sending first request..."

RESPONSE1=$(curl -s -X POST "$API_URL/v1/runs/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "'$WORKFLOW_ID'",
    "sessionId": "'$SESSION_ID'",
    "message": "Explain microservices architecture"
  }')

echo "Response 1:"
echo "$RESPONSE1" | jq '.' 2>/dev/null || echo "$RESPONSE1"
echo ""

# Test 3: Follow-up question
echo "📝 Test 3: Follow-up Question (Context Preserved)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Query 2: What are the main challenges and how to address them?"
echo ""
echo "Sending follow-up request (same session)..."

RESPONSE2=$(curl -s -X POST "$API_URL/v1/runs/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "'$WORKFLOW_ID'",
    "sessionId": "'$SESSION_ID'",
    "message": "What are the main challenges and how to address them?"
  }')

echo "Response 2:"
echo "$RESPONSE2" | jq '.' 2>/dev/null || echo "$RESPONSE2"
echo ""

echo "✅ Tests Complete!"
echo ""
echo "💡 Tips:"
echo "   - Use the same sessionId to maintain conversation context"
echo "   - Try complex questions for best results"
echo "   - Check application logs for detailed execution info"
echo ""
