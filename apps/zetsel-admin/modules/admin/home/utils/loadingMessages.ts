const LOADING_MESSAGES = [
  "🤔 Thinking...",
  "⚡ Figuring out...",
  "🔮 Pondering...",
  "💡 Brainstorming...",
  "🎯 Processing...",
  "🚀 Analyzing...",
  "🧠 Contemplating...",
  "✨ Synthesizing...",
  "🔬 Examining...",
  "💭 Reflecting...",
  "⏳ Cooking something up...",
  "🌟 Gathering thoughts...",
  "🎨 Crafting response...",
  "🧩 Connecting dots...",
  "📡 Receiving wisdom...",
  "🎪 Working magic...",
  "🌊 Diving deep...",
  "🔥 Heating up...",
  "🎭 Orchestrating...",
  "🌈 Channeling creativity...",
];

export function getRandomLoadingMessage(): string {
  return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
}
