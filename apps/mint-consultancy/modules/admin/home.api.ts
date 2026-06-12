export async function sendDeepseekMessage(
  sessionId: string,
  message: string,
  onChunk?: (chunk: string) => void
) {
  const baseUrl = process.env.NEXT_PUBLIC_MINT_AI_URL || "http://localhost:3000";
  const url = `${baseUrl}/v1/runs/deepseek`;

  console.log("[API] Sending message to:", url, { sessionId, message });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, input: { sessionId, message } }),
    });

    console.log("[API] Response status:", res.status, res.statusText);

    if (!res.ok) {
      const text = await res.text();
      console.error("[API] Error response:", text);
      throw new Error(text || `API error: ${res.status}`);
    }

    const data = await res.json();
    console.log("[API] Response data:", data);

    // Simulate streaming effect by sending chunks
    if (onChunk && data.reply) {
      const reply = data.reply;
      const chunkSize = 15; // Send 15 chars at a time for smooth typing effect
      for (let i = 0; i < reply.length; i += chunkSize) {
        onChunk(reply.slice(i, i + chunkSize));
        // Small delay to make typing effect visible
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    return data as { runId: string; reply: string; summary?: Record<string, string> };
  } catch (error) {
    console.error("[API] Fetch error:", error);
    throw error;
  }
}
