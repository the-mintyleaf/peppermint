export function lcToText(raw: any): string {
  if (!raw) return "";
  if (typeof raw === "string") return raw;

  // LangChain AIMessage
  if (raw?.content && typeof raw.content === "string") {
    return raw.content;
  }

  // If content is array (LangChain block format)
  if (Array.isArray(raw?.content)) {
    return raw.content
      .map((c: any) =>
        typeof c?.text === "string" ? c.text : typeof c === "string" ? c : ""
      )
      .join("\n");
  }

  // Fallback
  return JSON.stringify(raw);
}
