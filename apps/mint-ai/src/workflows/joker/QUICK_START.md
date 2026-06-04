# Joker Workflow - Quick Start Guide

**Workflow ID:** `joker.chatbot`

---

## 🚀 What is Joker?

Joker is a witty, intelligent chatbot that:
1. **Listens** to user questions
2. **Fetches** relevant data from APIs
3. **Analyzes** that data
4. **Responds** with entertaining, insightful answers

---

## 📊 The 3-Step Flow

```
User Question
    ↓
Guard Policy (Validation)
    ↓
AI Agent (Fetch Data + Analyze + Respond Wittily)
    ↓
Response with Data & Humor
```

---

## 🛠️ Available Tools

| Tool | Fetches | Use When |
|------|---------|----------|
| **fetchUserInfo** | User profile, metrics | "Tell me about myself" |
| **fetchProductData** | Product catalog, pricing | "Show me products" |
| **fetchCategoryData** | Product categories | "What categories exist?" |
| **fetchOrderData** | Order history, cart | "Show my orders" |
| **fetchPostData** | Posts, engagement | "How are my posts?" |

---

## 💬 Example Conversations

### Example 1: Product Question
```
User: "What's your best-selling product?"

Joker: "Ah, a person of excellent taste!
Let me check our vault...

🏆 iPhone X is flying off shelves!
Why? Reliable, affordable, makes people smile.

Want specs or pricing?"
```

### Example 2: Analytics
```
User: "How am I performing?"

Joker: "Let me peek at your stats...

📈 Here's the breakdown:
• Sales: Up 15% (nice!)
• Engagement: Through roof
• Satisfaction: Chef's kiss 👌

You're crushing it!"
```

### Example 3: Recommendations
```
User: "What should I buy?"

Joker: "Based on your excellent taste...
I'd suggest Google Pixel 📱

Why?
• You love quality tech
• In stock & ready
• 4.8★ reviews
• $299 (great value)

Want reviews?"
```

---

## 🎯 Persona

- **Name:** Joker
- **Style:** Witty, helpful, entertaining
- **Strength:** Combining data with humor
- **Promise:** Useful funny, every time

---

## 📝 File Structure

```
src/workflows/joker/
├── index.ts              ← Workflow definition
├── prompt.ts             ← Personality & instructions
├── WORKFLOW.md           ← Full documentation
└── QUICK_START.md        ← This file
```

---

## ⚡ Key Features

✨ **Smart Tool Usage**
- Automatically picks tools based on question
- Fetches relevant data
- Analyzes for insights

🎭 **Witty Persona**
- Never mean-spirited
- Masters of wordplay
- Includes emojis & humor

🔒 **Safe & Secure**
- Validates input (guardPolicy)
- Respects privacy
- Only shares necessary info

📚 **Context Aware**
- Remembers conversation (1500 tokens)
- Adapts tone to user
- Provides relevant follow-ups

---

## 🔧 Configuration Tweaks

### Make it More Creative
Edit `index.ts`:
```typescript
temperature: 0.9  // (was 0.7)
```

### Add More Memory
Edit `index.ts`:
```typescript
memoryLimit: 2500  // (was 1500)
```

### Change Model
Edit `index.ts`:
```typescript
chatModel: "claude",  // (was deepseek.chat)
```

### Adjust Personality
Edit `prompt.ts`:
- More serious? → Remove emojis, tone down jokes
- More casual? → Add more personality
- Different domain? → Update persona section

---

## ❓ FAQ

**Q: How does Joker fetch data?**
A: Through 5 API tools that get user info, products, orders, posts, etc.

**Q: Can I add more tools?**
A: Yes! Add to the `tools` array in `index.ts`

**Q: How witty is too witty?**
A: If the joke doesn't serve the answer, it's too much. Joker balances fun with utility.

**Q: What if I want different API endpoints?**
A: Edit the URLs in the tool configs in `index.ts`

**Q: Can multiple tools be called at once?**
A: Yes! The agent decides which tools to use based on the user's question.

---

## 🎓 Next Steps

1. **Try it out!** Send a message like "What products do you have?"
2. **Customize** the system prompt in `prompt.ts`
3. **Add tools** by extending the tools array
4. **Extend** with more APIs or data sources

---

**Status:** ✅ Ready to Use
**Created:** 2026-01-14
