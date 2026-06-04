import { schemaWorkflow } from "@/workflows/workflowRegistry.type";
import { systemPrompt } from "./prompt";

/**
 * Joker Chatbot Workflow
 *
 * A workflow designed for witty, intelligent conversation that combines
 * entertainment with data-driven insights.
 *
 * Flow:
 * 1. User Asks a Question
 *    -> Enters through system.guardPolicy (validation)
 *
 * 2. AI Bot Fetches Data
 *    -> agents.reasoning agent uses tools to fetch user info or API data
 *    -> Tools: fetchUserInfo, fetchAPIData
 *
 * 3. Analyse & Respond
 *    -> Agent analyzes fetched data
 *    -> Provides witty, insightful response based on question
 *
 * System Prompt: Located in ./prompt.ts
 */
export const workflowJoker = schemaWorkflow.parse({
  id: "joker.chatbot",
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
        // maxInputLength: 1000,
        // blocklistWords: [],
      },
    },

    // ============================================
    // Step 2 & 3: AI Reasoning Agent
    // ============================================
    // This agent:
    // - Fetches user info or API data via tools
    // - Analyzes the data
    // - Provides witty, data-driven response
    {
      id: "agents.reasoning",
      kind: "agents.reasoning",
      config: {
        // Model Configuration
        chatModel: "deepseek.chat",
        temperature: 0.7, // Balanced: creative but coherent

        // System Instructions
        systemPrompt: systemPrompt,

        // Context & Memory
        dependencies: [], // No required external context
        memoryLimit: 1500, // Keep longer conversation history for context

        // Tools for Data Fetching & Analysis
        tools: [
          // ================================================
          // Tool 1: Fetch User Information (Dummy Data)
          // ================================================
          {
            name: "fetchUserInfo",
            type: "apicall",
            description:
              "Fetches current user profile information, preferences, activity, and performance metrics. Uses dummy data for demonstration.",
            config: {
              method: "GET",
              url: "https://dummyjson.com/users/1", // Dummy JSON API
              headers: {
                "Content-Type": "application/json",
              },
              withAuthentication: false,
              dataKey: "user", // Extract user data from response
              body: {},
              query: {},
            },
          },

          // ================================================
          // Tool 2: Fetch Product/Service Data
          // ================================================
          {
            name: "fetchProductData",
            type: "apicall",
            description:
              "Fetches product catalog, pricing, inventory, and performance data. Useful for answering questions about products, sales, or recommendations.",
            config: {
              method: "GET",
              url: "https://dummyjson.com/products", // Dummy JSON API
              headers: {
                "Content-Type": "application/json",
              },
              withAuthentication: false,
              dataKey: "products", // Extract products array from response
              body: {},
              query: {},
            },
          },

          // ================================================
          // Tool 3: Fetch Category Data
          // ================================================
          {
            name: "fetchCategoryData",
            type: "apicall",
            description:
              "Fetches available product categories and their metadata. Useful for browsing and organizing product information.",
            config: {
              method: "GET",
              url: "https://dummyjson.com/products/categories",
              headers: {
                "Content-Type": "application/json",
              },
              withAuthentication: false,
              dataKey: "categories",
              body: {},
              query: {},
            },
          },

          // ================================================
          // Tool 4: Fetch Cart/Orders Data
          // ================================================
          {
            name: "fetchOrderData",
            type: "apicall",
            description:
              "Fetches user cart, orders, and transaction history. Useful for analyzing spending patterns and purchase behavior.",
            config: {
              method: "GET",
              url: "https://dummyjson.com/carts/1", // Dummy cart data
              headers: {
                "Content-Type": "application/json",
              },
              withAuthentication: false,
              dataKey: "cart",
              body: {},
              query: {},
            },
          },

          // ================================================
          // Tool 5: Fetch Posts/Content Data
          // ================================================
          {
            name: "fetchPostData",
            type: "apicall",
            description:
              "Fetches user posts, comments, and content engagement metrics. Useful for analyzing social interactions and content performance.",
            config: {
              method: "GET",
              url: "https://dummyjson.com/posts", // Dummy posts
              headers: {
                "Content-Type": "application/json",
              },
              withAuthentication: false,
              dataKey: "posts",
              body: {},
              query: {},
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

export default workflowJoker;
