# DeepSeek Reasoning Workflow

## Overview

The `deepseek.reasoning` workflow is optimized for deep analytical reasoning using DeepSeek's capabilities. It provides structured, step-by-step analysis for complex problems, logical reasoning, and comprehensive explanations.

## Workflow ID

```
deepseek.reasoning
```

## How to Use

### 1. Via REST API

**Endpoint:** `POST /v1/runs`

```bash
curl -X POST http://localhost:3000/v1/runs \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "deepseek.reasoning",
    "input": {
      "message": "Analyze the advantages and disadvantages of using microservices architecture"
    }
  }'
```

### 2. Via Chat Endpoint

**Endpoint:** `POST /v1/runs/chat`

```bash
curl -X POST http://localhost:3000/v1/runs/chat \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "deepseek.reasoning",
    "sessionId": "session-123",
    "message": "What are the key factors for successful project management?"
  }'
```

### 3. Streaming Results

**Endpoint:** `GET /v1/runs/{runId}/stream`

```bash
curl http://localhost:3000/v1/runs/abc123def456/stream
```

## Input Schema

```typescript
{
  message: string      // Your question or prompt
  sessionId?: string   // Optional: for maintaining conversation context
}
```

## Response Format

```typescript
{
  reply: string        // The AI's analytical response
  summary: {
    phase: string      // Current conversation phase
    intent: string     // Detected intent
    [key]: string      // Additional metadata
  }
}
```

## Best Use Cases

✅ **Complex Problem-Solving**

- Breaking down difficult questions
- Analyzing tradeoffs and decisions
- Evaluating multiple approaches

✅ **Analytical Reasoning**

- Logical explanations
- Cause-and-effect analysis
- Hypothesis evaluation

✅ **Educational Explanations**

- Teaching concepts step-by-step
- Providing detailed reasoning chains
- Clarifying difficult topics

✅ **Decision Support**

- Weighing pros and cons
- Analyzing options systematically
- Supporting conclusions with logic

## Configuration

The workflow uses:

- **Model:** DeepSeek Chat
- **Temperature:** 0.3 (optimized for analytical reasoning)
- **Memory Limit:** 2000 tokens (maintains extensive context)
- **System Prompt:** Emphasizes logical thinking and step-by-step analysis

## Example Queries

### Example 1: Technical Analysis

```
Q: "Explain how REST APIs and GraphQL differ, and when you'd choose each one"

A: [Deep analysis of both approaches, tradeoffs, use cases, and decision criteria]
```

### Example 2: Business Analysis

```
Q: "What should a startup consider before choosing between bootstrapping or seeking venture capital?"

A: [Structured analysis of factors, risks, benefits, and considerations for each path]
```

### Example 3: Complex Problem

```
Q: "How would you design a system to detect and prevent fraud in real-time payment processing?"

A: [Comprehensive breakdown of architecture, approaches, challenges, and solutions]
```

## Architecture

```
┌─────────────────┐
│  User Message   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  system.guardPolicy                │
│  (Validate input)                  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  agents.reasoning (DeepSeek)        │
│  • Deep analytical thinking         │
│  • Structured reasoning             │
│  • Session context management       │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Structured Response                │
│  • Reply text                       │
│  • Analysis metadata                │
└─────────────────────────────────────┘
```

## Notes

- **Context Preservation:** The workflow maintains conversation history to provide contextual follow-up responses
- **Reasoning Clarity:** The system prompt guides DeepSeek to always explain its reasoning
- **Temperature Setting:** Lower temperature (0.3) ensures more consistent and analytical responses
- **Memory:** Extended memory limit preserves context for complex multi-turn conversations

## Troubleshooting

### Issue: Responses are too short or superficial

**Solution:** Ask follow-up questions with more context, or rephrase with more specific requirements.

### Issue: Model seems to ignore context

**Solution:** Ensure your session ID is consistent across requests to maintain conversation history.

### Issue: Response includes less reasoning than expected

**Solution:** Your question might be answerable directly. Try asking "explain your reasoning step-by-step" or "what are all the factors involved?"
