import { schemaWorkflow } from "@/workflows/workflowRegistry.type";
import { systemPrompt } from "./prompt";

/**
 * DeepSeek Reasoning Workflow
 *
 * A workflow optimized for deep analytical reasoning using DeepSeek LLM.
 * Perfect for complex problem-solving, logical analysis, and comprehensive explanations.
 *
 * Flow:
 * 1. User Query Validation
 *    -> Enters through system.guardPolicy (input validation)
 *
 * 2. DeepSeek Reasoning
 *    -> agents.reasoning with DeepSeek model
 *    -> Provides structured, step-by-step analysis
 *    -> Can use tools for additional context if needed
 *
 * Key Features:
 * - Deep reasoning with extended thinking
 * - Logical step-by-step analysis
 * - Structured responses with clear reasoning chains
 * - Support for follow-up questions and context
 *
 * System Prompt: Located in ./prompt.ts
 */
export const workflowDeepseekReasoning = schemaWorkflow.parse({
  id: "deepseek.reasoning",
  entry: "system.guardPolicy",

  nodes: [
    // ============================================
    // Step 1: Guard Policy (Input Validation)
    // ============================================
    {
      id: "system.guardPolicy",
      kind: "system.guardPolicy",
      config: {
        // Optional: Configure guard rules
        // maxInputLength: 5000,
        // blocklistWords: [],
      },
    },

    // ============================================
    // Step 2: DeepSeek Reasoning Agent
    // ============================================
    // This agent:
    // - Uses DeepSeek for deep, analytical reasoning
    // - Provides structured, step-by-step analysis
    // - Maintains conversation context for follow-ups
    // - Returns detailed, well-reasoned responses
    // - Can access product catalog and other APIs for context
    {
      id: "agents.reasoning",
      kind: "agents.reasoning",
      config: {
        // Model Configuration
        chatModel: "deepseek.chat",
        temperature: 0.3, // Lower temperature for more analytical, consistent reasoning

        // System Instructions
        systemPrompt: systemPrompt,

        // Context & Memory
        dependencies: [], // No required external context
        memoryLimit: 2000, // Keep extensive conversation history for deep context

        // Tools Configuration
        tools: [
          {
            name: "fetchProducts",
            type: "apicall",
            description: "Fetches the product catalog from dummyjson.com including product details, prices, ratings, and availability. Use this when the user asks about products, pricing, availability, or product comparisons.",
            config: {
              method: "GET",
              url: "https://dummyjson.com/products",
              headers: { "Content-Type": "application/json" },
              withAuthentication: false,
              dataKey: "products",
              body: {},
              query: {},
            },
          },
          {
            name: "fetchProductByCategory",
            type: "apicall",
            description: "Fetches products filtered by category (e.g., 'beauty', 'electronics', 'clothing'). Provide the category name to filter results.",
            config: {
              method: "GET",
              url: "https://dummyjson.com/products/category/${{fromAI(category)}}",
              headers: { "Content-Type": "application/json" },
              withAuthentication: false,
              dataKey: "products",
              body: {},
              query: {},
            },
          },
          {
            name: "fetchProductCategories",
            type: "apicall",
            description: "Fetches the list of all available product categories. Use this when the user asks what categories are available.",
            config: {
              method: "GET",
              url: "https://dummyjson.com/products/categories",
              headers: { "Content-Type": "application/json" },
              withAuthentication: false,
              dataKey: undefined,
              body: {},
              query: {},
            },
          },
          {
            name: "searchProducts",
            type: "apicall",
            description: "Searches for products by keyword. Provide a search term to find relevant products.",
            config: {
              method: "GET",
              url: "https://dummyjson.com/products/search",
              headers: { "Content-Type": "application/json" },
              withAuthentication: false,
              dataKey: "products",
              body: {},
              query: {
                q: "${{fromAI(searchTerm)}}",
              },
            },
          },
        ],
      },
    },
  ],

  // ============================================
  // Workflow Edges (Flow Direction)
  // ============================================
  edges: [
    // After validation, move to reasoning agent
    {
      from: "system.guardPolicy",
      to: "agents.reasoning",
    },
  ],
});

export default workflowDeepseekReasoning;
