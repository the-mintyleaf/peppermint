// src/ai/jsoc.ts

/** Minimal TS types (optional) */
export interface JSOC1 {
  v: "jsoc-1";
  reply: string;
  summary: Record<string, string>; // flat k→v; must include phase & intent
}

/** Small helper: strip code fences and isolate the first {...} block */
function clean(raw: string): string {
  const t = (raw ?? "").trim();
  const noFences = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const first = noFences.indexOf("{");
  const last = noFences.lastIndexOf("}");
  const sliced =
    first !== -1 && last !== -1 && last > first
      ? noFences.slice(first, last + 1)
      : noFences;
  return sliced.replace(/[\r\n]+/g, " ");
}

/** Minimal invariant checks (throws Error on failure) */
export function parseJsoc(raw: string): JSOC1 {
  const cleaned = clean(raw);

  let obj: unknown;
  try {
    obj = JSON.parse(cleaned);
  } catch {
    throw new Error("Invalid JSON from model");
  }

  if (obj === null || typeof obj !== "object") {
    throw new Error("Top-level must be an object");
  }

  // allow-list keys
  const allowed = new Set(["v", "reply", "summary"]);
  for (const k of Object.keys(obj as Record<string, unknown>)) {
    if (!allowed.has(String(k))) {
      throw new Error(`Unknown top-level key: ${String(k)}`);
    }
  }
  const { v, reply, summary } = obj as Record<string, unknown>;

  if (v !== "jsoc-1") throw new Error('v must equal "jsoc-1"');
  if (typeof reply !== "string") throw new Error("reply must be a string");

  if (
    summary === null ||
    typeof summary !== "object" ||
    Array.isArray(summary)
  ) {
    throw new Error("summary must be a flat object");
  }

  // enforce flat string->string and required keys
  const sRec: Record<string, string> = {};
  for (const [k, val] of Object.entries(summary as Record<string, unknown>)) {
    if (typeof val !== "string")
      throw new Error(`summary.${k} must be a string`);
    sRec[k] = val;
  }
  if (typeof sRec.phase !== "string")
    throw new Error("summary.phase is required");
  if (typeof sRec.intent !== "string")
    throw new Error("summary.intent is required");

  return { v: "jsoc-1", reply, summary: sRec };
}

/** Tolerant version that doesn't throw */
export function tryParseJsoc(
  raw: string
): { ok: true; data: JSOC1 } | { ok: false; error: string } {
  try {
    return { ok: true, data: parseJsoc(raw) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Prompt you can drop in to get this shape reliably */
parseJsoc.prompt = `
You are a JSON generator. Your ONLY task is to return exactly one valid JSON object per request.

STRICT CONTRACT:
- The JSON object MUST have exactly these top-level keys: v, reply, summary.
- "v" MUST equal the fixed string "jsoc-1".
- "reply" MUST be a proper markdown response..
- "summary" MUST be a flat object of string→string pairs, This will contain the summary of crutial details so far and MUST include at least:
  - "phase": short code string
  - "intent": short code string

FORBIDDEN:
- Do NOT include markdown, code fences, explanations, comments, or text before/after the JSON.
- Do NOT include nested structures in "summary" (flat key→string only).
- Do NOT include trailing commas.

EXAMPLES:
✅ Valid:
{"v":"jsoc-1","reply":"Here are the categories: Electronics, Fashion.","summary":{"phase":"category_listing","intent":"category_inquiry"}}

❌ Invalid (markdown fences):
\`\`\`json
{ "v":"jsoc-1", "reply":"hi", "summary":{"phase":"none","intent":"none"} }
\`\`\`

❌ Invalid (extra key):
{"v":"jsoc-1","reply":"hi","summary":{"phase":"none","intent":"none"},"extra":"oops"}

❌ Invalid (non-JSON commentary):
Sure, here is the JSON: {"v":"jsoc-1","reply":"hi","summary":{"phase":"none","intent":"none"}}

FALLBACK:
If you cannot comply, return exactly:
{"v":"jsoc-1","reply":"unknown","summary":{"phase":"none","intent":"none","reason":"invalid_output"}}

FINAL RULE:
Respond ONLY with a single line of strict JSON that satisfies this contract. NOTHING else.
`;
