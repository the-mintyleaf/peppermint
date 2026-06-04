# Joker Chatbot Workflow

**Status:** ✅ Active
**ID:** `joker.chatbot`
**Location:** `src/workflows/joker/`

---

## 📋 Overview

The Joker Chatbot is an intelligent, witty conversational agent designed to:
1. **Entertain** users with humor and clever observations
2. **Fetch Data** from APIs or user information sources
3. **Analyze** that data intelligently
4. **Respond** with engaging, data-driven insights

This workflow combines entertainment with functionality, making information delivery engaging and memorable.

---

## 🎯 Workflow Flow

```
┌─────────────────────────────┐
│   User Asks Question        │
└──────────────┬──────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  Step 1: Validate Input          │
│  (system.guardPolicy node)       │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────┐
│  Step 2 & 3: AI Reasoning Agent                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Fetch Data (via tools):                         │ │
│  │ • fetchUserInfo (user profile & metrics)        │ │
│  │ • fetchProductData (catalog & pricing)          │ │
│  │ • fetchCategoryData (product categories)        │ │
│  │ • fetchOrderData (purchase history)             │ │
│  │ • fetchPostData (content & engagement)          │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Analyze Data:                                   │ │
│  │ • Process fetched information                   │ │
│  │ • Identify patterns & insights                  │ │
│  │ • Connect to user's original question           │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Respond Wittily:                                │ │
│  │ • Format findings entertainingly                │ │
│  │ • Include relevant humor                        │ │
│  │ • Provide actionable insights                   │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────┬───────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────┐
│   User Receives Response    │
│   (with data & humor!)      │
└─────────────────────────────┘
```

---

## 🔧 Workflow Configuration

### ID & Entry Point
- **Workflow ID:** `joker.chatbot`
- **Entry Node:** `system.guardPolicy`
- **Primary Agent:** `agents.reasoning`

### Agent Configuration

```typescript
{
  chatModel: "deepseek.chat",      // LLM Model (Deepseek)
  temperature: 0.7,                 // Balanced creativity
  memoryLimit: 1500,                // Keep 1500 tokens of history
  systemPrompt: systemPrompt,        // Witty instructions
  tools: [5 data fetching tools]     // See Tools section
}
```

---

## 🛠️ Available Tools

The Joker agent can use these tools to fetch data:

### 1. **fetchUserInfo**
- **Purpose:** Get user profile, preferences, activity, performance metrics
- **API:** `https://dummyjson.com/users/1`
- **Data Key:** `user`
- **Use Cases:**
  - "Tell me about myself"
  - "How am I doing?"
  - "What are my preferences?"

### 2. **fetchProductData**
- **Purpose:** Retrieve product catalog, pricing, inventory, performance
- **API:** `https://dummyjson.com/products`
- **Data Key:** `products`
- **Use Cases:**
  - "What products are available?"
  - "What's your best seller?"
  - "Show me product recommendations"
  - "What's the most expensive item?"

### 3. **fetchCategoryData**
- **Purpose:** Get product categories and metadata
- **API:** `https://dummyjson.com/products/categories`
- **Data Key:** `categories`
- **Use Cases:**
  - "What categories do you have?"
  - "Organize products by type"
  - "What's trending?"

### 4. **fetchOrderData**
- **Purpose:** Retrieve user cart, orders, transaction history
- **API:** `https://dummyjson.com/carts/1`
- **Data Key:** `cart`
- **Use Cases:**
  - "What have I ordered?"
  - "How much have I spent?"
  - "What's in my cart?"
  - "Analyze my spending"

### 5. **fetchPostData**
- **Purpose:** Get user posts, comments, content engagement metrics
- **API:** `https://dummyjson.com/posts`
- **Data Key:** `posts`
- **Use Cases:**
  - "Show my posts"
  - "What content is popular?"
  - "How are my posts doing?"
  - "Trending topics"

---

## 💬 Persona & Communication Style

### Identity
- **Name:** Joker
- **Type:** Witty, intelligent AI chatbot
- **Tone:** Entertaining, informative, charming
- **Specialty:** Combining humor with data-driven insights

### Key Characteristics
✅ Quick-witted and clever
✅ Master of wordplay and puns
✅ Never mean-spirited
✅ Always helpful and inclusive
✅ Balances fun with functionality

### Communication Examples

**User:** "What's your best-selling product?"
**Joker:** "Ah, a person of excellent taste! Let me check our data vault... *This product is flying off the shelves!* It's top choice because it's reliable, affordable, and makes people smile. Want details?"

**User:** "How am I performing this month?"
**Joker:** "Let me peek at your stats... 📊
🎯 Here's the breakdown:
• Sales: Up 15% (nice work!)
• Engagement: Through the roof
• Satisfaction: Chef's kiss 👌

You're crushing it! What's working best?"

---

## 📊 Data Flow Example

### User Question: "What should I buy?"

```
1. USER INPUT
   "Hey Joker, what product should I buy next?"

2. GUARD POLICY
   ✓ Input validated (no offensive content, reasonable length)

3. AI REASONING AGENT DECIDES
   - User wants product recommendation
   - Need to fetch: ProductData, UserInfo, OrderData
   - Will analyze preferences + history + available products

4. TOOL CALLS (Parallel)
   → fetchProductData()    // Get all products
   → fetchUserInfo()       // Get user preferences
   → fetchOrderData()      // Get purchase history

5. DATA ANALYSIS
   - User has bought Electronics before
   - Top product (iphoneX) matches preferences
   - Currently out of stock, but alternatives exist
   - Similar products: Samsung Galaxy, Google Pixel

6. WITTY RESPONSE
   "Based on your excellent taste in electronics, I'd suggest
   the Google Pixel 📱 - it's the second-best performer after
   the iPhone (which is currently sulking in our warehouse 😄).

   Why pick this? Because:
   • You love quality electronics
   • It's in stock and ready to go
   • Users give it 4.8/5 stars
   • $299 (good bang for your buck)

   Want me to show you reviews?"
```

---

## 🚀 Usage

### How to Use the Joker Workflow

```typescript
import { getWorkflow } from "@/workflows";

// Get the joker workflow
const jokerWorkflow = getWorkflow("joker.chatbot");

// The workflow will:
// 1. Validate user input (guardPolicy)
// 2. Process with AI agent (agents.reasoning)
// 3. Fetch relevant data via tools
// 4. Analyze and respond wittily
```

### Expected Interaction Flow

1. **User sends message** → AI validates with guard policy
2. **AI understands intent** → Determines which tools needed
3. **AI fetches data** → Calls appropriate API tools
4. **AI analyzes** → Processes fetched data for relevance
5. **AI responds** → Entertaining, data-driven answer
6. **User gets value** → Information + entertainment

---

## ⚙️ Configuration Details

### Nodes

**Node 1: system.guardPolicy**
- Type: Guard/Validator
- Purpose: Filter inappropriate input
- Config: Default settings (adjustable)

**Node 2: agents.reasoning**
- Type: AI Agent
- Purpose: Process user intent, fetch data, analyze, respond
- Tools: 5 data fetching APIs
- Memory: 1500 tokens (maintains context)
- Temperature: 0.7 (creative but coherent)
- Chat Model: deepseek.chat

### Edges

```
system.guardPolicy → agents.reasoning
```

Simple flow: Input validation → AI processing

---

## 📈 Example Use Cases

### 1. Product Discovery
- **User:** "What products are trending?"
- **Joker Fetches:** Products, Categories
- **Joker Responds:** Fun recommendations with sales data

### 2. User Analytics
- **User:** "How am I doing this month?"
- **Joker Fetches:** UserInfo, OrderData, PostData
- **Joker Responds:** Performance breakdown with witty commentary

### 3. Personalized Recommendations
- **User:** "What should I buy?"
- **Joker Fetches:** UserInfo, ProductData, OrderData
- **Joker Responds:** Smart recommendations based on history

### 4. Content Analysis
- **User:** "How are my posts performing?"
- **Joker Fetches:** PostData
- **Joker Responds:** Engagement metrics with humor

### 5. Purchase History Analysis
- **User:** "Show me my recent orders"
- **Joker Fetches:** OrderData, ProductData
- **Joker Responds:** Organized purchase history with insights

---

## 🔐 Security & Guidelines

✅ **Always:**
- Be honest about data limitations
- Ask clarifying questions when context is unclear
- Maintain positive, inclusive tone
- Respect user privacy

❌ **Never:**
- Share sensitive data without context
- Use offensive or stereotypical humor
- Make up data
- Be mean-spirited

---

## 📁 File Structure

```
src/workflows/joker/
├── index.ts           # Workflow definition (nodes, edges, tools)
├── prompt.ts          # System prompt & persona
├── WORKFLOW.md        # This file (documentation)
```

---

## ✅ Verification

**TypeScript Compilation:** ✅ No errors
**Workflow Registration:** ✅ Registered as "joker.chatbot"
**Tools Configuration:** ✅ 5 tools available
**System Prompt:** ✅ Loaded and configured
**Guard Policy:** ✅ Input validation enabled

---

## 🎓 How to Extend

### Add a New Tool

```typescript
{
  name: "toolName",
  type: "apicall",
  description: "What this tool does",
  config: {
    method: "GET",
    url: "https://api.example.com/endpoint",
    headers: {},
    withAuthentication: false,
    dataKey: "keyToExtract",
    body: {},
    query: {},
  },
}
```

### Modify the System Prompt

Edit `prompt.ts` to change:
- Personality traits
- Communication style
- Instructions for tool usage
- Examples of desired responses

### Adjust Agent Parameters

```typescript
config: {
  chatModel: "deepseek.chat",    // Change model
  temperature: 0.8,              // More creative (0-1)
  memoryLimit: 2000,             // Longer history
  // ...
}
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Agent not fetching data | Check tool configuration, verify API URLs |
| Responses not witty | Review system prompt, adjust temperature |
| Long response time | Reduce memoryLimit, optimize tool calls |
| Generic responses | Provide more specific user context |

---

## 📞 Support

For issues with:
- **Workflow definition:** Check `index.ts`
- **Persona/tone:** Edit `prompt.ts`
- **Tools/APIs:** Verify dummy JSON URLs
- **Registration:** Check main `src/workflows/index.ts`

---

**Created:** 2026-01-14
**Status:** Active & Ready for Use
**Version:** 1.0
