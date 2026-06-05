import { ExecutorContext, createExecutorError } from "@/shared/executor-context";
import { Result, ok, err } from "@/shared/result";
import {
  schemaNodeAIReasoningInput,
  schemaNodeAIReasoningOutput,
  PropNodeAIReasoningInput,
  PropNodeAIReasoningOutput,
} from "./reasoning.type";

import { parseJsoc } from "@/shared/helpers/parseJSOC";
import { getLastMessages, pushMessage } from "@/shared/memory/sessionStore";
import { executorRegistry } from "@/executors";
import { lcToText } from "@/shared/helpers/lcToText";
import { DynamicStructuredTool, DynamicTool } from "@langchain/core/tools";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  ToolMessage,
  BaseMessage,
} from "@langchain/core/messages";
import { zodSchemaRebuilder } from "@/shared/helpers/zodSchemaRebuilder";
import {
  getSessionSummary,
  setSessionSummary,
} from "@/shared/memory/sessionSummary";

/** ─────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────────────────────────*/

// Keep for backward-compat filter of old stored messages, but we won't write new ones.
const SUMMARY_PREFIX = "SUMMARY:: ";

/** Convert {role, content} -> LangChain message */
function toBaseMessage(m: { role: string; content: string }): BaseMessage {
  switch (m.role) {
    case "assistant":
      return new AIMessage(m.content);
    case "system":
      return new SystemMessage(m.content);
    case "tool":
      return new ToolMessage({
        content: m.content,
        tool_call_id: `rehydrated-${Date.now()}`,
      });
    case "user":
    default:
      return new HumanMessage(m.content);
  }
}

/** Detect short acks and polarity */
type AckKind = "positive" | "negative" | null;
function classifyAck(s: string): AckKind {
  const t = (s || "").trim().toLowerCase();
  if (
    /^(y|ye|yes|yeah|yup|yep|sure|ok|okay|pls|please|do it|go ahead|continue|that works|sounds good|alright|go on|proceed|yes please)[.!?]*$/i.test(
      t
    )
  )
    return "positive";
  if (/^(n|no|nope|nah|not really|don't|do not|stop|cancel)[.!?]*$/i.test(t))
    return "negative";
  return null;
}

/** Last assistant utterance (ignoring recaps/summaries) */
function lastAssistantUtterance(
  history: Array<{ role: string; content: string }>
): string | null {
  for (let i = history.length - 1; i >= 0; i--) {
    const m = history[i];
    if (m.role !== "assistant") continue;
    const c = m.content.trim();
    if (c.startsWith(SUMMARY_PREFIX)) continue;
    if (c.startsWith("Recap:")) continue;
    if (!c) continue;
    return c;
  }
  return null;
}

/** Fallback JSOC wrapper */
function synthesizeJsocFromText(
  text: string,
  opts?: { phase?: string; intent?: string; extras?: Record<string, string> }
) {
  return {
    v: "jsoc-1",
    reply: (text ?? "").toString().trim(),
    summary: {
      phase: opts?.phase ?? "follow_up",
      intent: opts?.intent ?? "general",
      ...(opts?.extras ?? {}),
    },
  };
}

/** Merge summaries (flat, last-write-wins) */
function mergeSummaries(
  prev: Record<string, string> | undefined | null,
  next: Record<string, string> | undefined | null
): Record<string, string> {
  return { ...(prev ?? {}), ...(next ?? {}) };
}

/** ─────────────────────────────────────────────────────────────────────────────
 * Node: agents.reasoning
 * ────────────────────────────────────────────────────────────────────────────*/

/**
 * AI Reasoning Node: LLM inference with tool-calling loop
 *
 * Manages conversation with LLM, session context, and tool invocation.
 * Returns structured reply with summary metadata.
 *
 * @param input - Raw input to validate
 * @param ctx - ExecutorContext with logger, metrics, config
 * @returns Result<PropNodeAIReasoningOutput, ExecutorError>
 */
export const nodeAIReasoning = async (
  input: unknown,
  ctx: ExecutorContext,
  config?: {
    chatModel: keyof typeof executorRegistry.tools.chatModels;
    systemPrompt?: string;
    temperature?: number;
    memoryLimit?: number;
    dependencies?: string[];
    tools?: {
      name: string;
      type: string;
      description?: string;
      config?: any;
    }[];
  }
): Promise<Result<PropNodeAIReasoningOutput, any>> => {
  try {
    // 1. Validate input schema
    const parseResult = schemaNodeAIReasoningInput.safeParse(input);
    if (!parseResult.success) {
      ctx.logger.warn(
        {
          errors: parseResult.error.issues,
          nodeId: ctx.nodeId,
        },
        "Invalid input to nodeAIReasoning"
      );
      return err(
        createExecutorError(
          "INVALID_INPUT",
          `Invalid input: ${parseResult.error.message}`,
          {
            nodeId: ctx.nodeId,
            retryable: false,
          }
        )
      );
    }

    const parsed = parseResult.data;
    const sessionId = parsed.sessionId;

    ctx.logger.debug(
      {
        event: "node.started",
        nodeId: ctx.nodeId,
        sessionId,
        messagePreview: parsed.message.substring(0, 50),
      },
      "Executing nodeAIReasoning"
    );

    // 2. Resolve LLM model
    const model = executorRegistry.tools.chatModels[config?.chatModel as any];
    if (!model) {
      return err(
        createExecutorError(
          "CONFIG_ERROR",
          `Unknown chatModel: ${String(config?.chatModel)}`,
          {
            nodeId: ctx.nodeId,
            retryable: false,
          }
        )
      );
    }

    // 3. Persist user message on entry
    if (sessionId) {
      try {
        await pushMessage(sessionId, { role: "user", content: parsed.message });
      } catch (e) {
        ctx.logger.warn(
          { error: e, sessionId, nodeId: ctx.nodeId },
          "Failed to persist user message"
        );
      }
    }

    // 4. Load session context
    const rawHistory = sessionId
      ? await getLastMessages(sessionId, config?.memoryLimit ?? 200)
      : [];
    const latestSummary = sessionId ? await getSessionSummary(sessionId) : null;

    // Filter out legacy summary/recap lines from history and order oldest → newest
    const filtered = rawHistory.filter(
      (m) =>
        !m.content.startsWith(SUMMARY_PREFIX) && !m.content.startsWith("Recap:")
    );
    const chronological = filtered.slice().reverse();
    const recentMessages = chronological.slice(-10);

    // 5. Construct system prompt
    const sysPrompt = [
      config?.systemPrompt ?? "You are a helpful assistant named Momo.",
      "SESSION BEHAVIOR RULES:",
      "- Treat the session summary JSON as the single source of truth for context/state.",
      "- If the user reply is short (e.g., 'yes', 'ok', 'no'), interpret it relative to the last assistant message and continue that flow appropriately.",
      "- Prefer reusing known info from the summary or recent messages over repeating tool calls.",
      config?.dependencies
        ? `ESSENTIAL SUMMARY KEYS: ${JSON.stringify(config.dependencies)}`
        : "",
      parseJsoc.prompt,
    ]
      .filter(Boolean)
      .join("\n\n");

    const ackKind = classifyAck(parsed.message);
    const lastAI = lastAssistantUtterance(recentMessages);

    // 6. Build message stack for LLM
    const messages: BaseMessage[] = [
      new SystemMessage(sysPrompt),
      ...(latestSummary
        ? [
            new SystemMessage(
              `SESSION SUMMARY (authoritative JSON): ${JSON.stringify(latestSummary)}`
            ),
          ]
        : []),
      ...recentMessages.map(toBaseMessage),
      ...(ackKind && lastAI
        ? [
            new SystemMessage(
              ackKind === "positive"
                ? `ACK INTERPRETATION: User confirmed. Continue from the last assistant message:\n"""${lastAI}"""`
                : `ACK INTERPRETATION: User declined the previous proposal. Based on the last assistant message:\n"""${lastAI}"""\nOffer the next best step or ask a targeted follow-up aligned with the session summary.`
            ),
          ]
        : []),
    ];

    // 7. Hydrate tools for LLM
    const handlerRegistry: Record<string, Function> = {};
    const toolConfigMap: Record<string, any> = {};
    (config?.tools ?? []).forEach((t) => {
      const handler =
        executorRegistry.tools[t.name] || executorRegistry.tools[t.type];
      if (handler) handlerRegistry[t.name] = handler;
      toolConfigMap[t.name] = t.config || {};
    });

    const hydratedTools =
      config?.tools?.map((t: any) =>
        t.config?.schema
          ? new DynamicStructuredTool({
              name: t.name,
              description: t.description || "",
              schema: zodSchemaRebuilder(t.config.schema),
              func: async (input: any) =>
                handlerRegistry[t.name]?.(input, toolConfigMap[t.name]),
            })
          : new DynamicTool({
              name: t.name,
              description: t.description || "",
              func: async (input: string) =>
                handlerRegistry[t.name]?.(input, toolConfigMap[t.name]),
            })
      ) ?? [];

    // 8. LLM reasoning loop with tool-calling
    let result = await model.invoke(messages, {
      temperature: config?.temperature ?? 0.7,
      tools: hydratedTools,
    });

    let maxToolLoops = config?.tools?.length
      ? (ctx.config.maxToolLoops ?? 3)
      : 0;
    while (result.additional_kwargs?.tool_calls && maxToolLoops-- > 0) {
      // Add the AI message with tool_calls to messages first
      messages.push(result);

      for (const call of result.additional_kwargs.tool_calls) {
        const toolName = call.function.name;
        const args = JSON.parse(call.function.arguments);
        let toolResult: any;
        try {
          toolResult = await handlerRegistry[toolName](
            args,
            toolConfigMap[toolName]
          );
          ctx.logger.debug(
            {
              toolName,
              nodeId: ctx.nodeId,
              resultPreview: String(toolResult).slice(0, 100),
            },
            "Tool executed successfully"
          );
        } catch (toolErr) {
          toolResult = `Tool ${toolName} failed: ${toolErr}`;
          ctx.logger.warn(
            { toolName, error: toolErr, nodeId: ctx.nodeId },
            "Tool execution failed"
          );
        }
        messages.push(
          new ToolMessage({ content: String(toolResult), tool_call_id: call.id })
        );
      }
      result = await model.invoke(messages, {
        temperature: config?.temperature ?? 0.7,
        tools: hydratedTools,
      });
    }

    // 9. Parse LLM reply
    let replyText: string;
    let jsocSummary: Record<string, string>;
    try {
      const jsoc = parseJsoc((result as any)?.content ?? lcToText(result));
      replyText = jsoc.reply;
      jsocSummary = jsoc.summary;
    } catch (parseErr) {
      ctx.logger.debug(
        { error: parseErr, nodeId: ctx.nodeId },
        "JSOC parsing failed, using fallback"
      );
      const fb = synthesizeJsocFromText(
        (result as any)?.content ?? lcToText(result)
      );
      replyText = fb.reply;
      jsocSummary = fb.summary;
    }

    // 10. Persist assistant message and summary
    if (sessionId) {
      try {
        await pushMessage(sessionId, { role: "assistant", content: replyText });
        const merged = mergeSummaries(latestSummary, jsocSummary);
        await setSessionSummary(sessionId, merged);
      } catch (e) {
        ctx.logger.warn(
          { error: e, sessionId, nodeId: ctx.nodeId },
          "Failed to persist assistant message or summary"
        );
      }
    }

    // 11. Validate output schema
    const output = {
      reply: replyText,
      summary: jsocSummary ?? {
        phase: "none",
        intent: "none",
        reason: "no_summary",
      },
    };
    const validateResult = schemaNodeAIReasoningOutput.safeParse(output);
    if (!validateResult.success) {
      ctx.logger.error(
        {
          errors: validateResult.error.issues,
          nodeId: ctx.nodeId,
        },
        "Invalid output from nodeAIReasoning"
      );
      return err(
        createExecutorError(
          "INVALID_OUTPUT",
          `Invalid output: ${validateResult.error.message}`,
          {
            nodeId: ctx.nodeId,
            retryable: false,
          }
        )
      );
    }

    ctx.logger.debug(
      {
        event: "node.finished",
        nodeId: ctx.nodeId,
        sessionId,
        replyPreview: replyText.substring(0, 50),
      },
      "nodeAIReasoning execution complete"
    );

    return ok(validateResult.data);
  } catch (error) {
    const executorError = createExecutorError(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      {
        nodeId: ctx.nodeId,
        cause: error,
        retryable: false,
      }
    );

    ctx.logger.error(
      {
        error: executorError,
        nodeId: ctx.nodeId,
      },
      "Unexpected error in nodeAIReasoning"
    );

    return err(executorError);
  }
};
