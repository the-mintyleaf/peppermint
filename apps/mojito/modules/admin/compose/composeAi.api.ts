import { delay } from "../shared/mock.utils";
import type { Platform } from "../shared/domain.types";

const CAPTION_TEMPLATES: Record<string, string[]> = {
  casual: [
    "Just dropped something amazing — check it out! 🔥",
    "You're going to love what we've been working on 👀",
    "Big news! Sharing something I've been obsessing over lately",
    "This is the update you've been waiting for. Trust me 😄",
  ],
  professional: [
    "We're excited to announce a new development that will transform how you work.",
    "Introducing a significant update to our platform. Here's what changed.",
    "After months of development, we're ready to share our latest innovation.",
    "We're proud to launch a feature our community has been requesting.",
  ],
  playful: [
    "Plot twist: we just made things even better 🎉✨",
    "Surprise! Something fun is waiting for you on the other side 🥳",
    "Okay okay okay... we may have outdone ourselves this time 😅",
    "Would you look at that?! New things! New things everywhere! 🎊",
  ],
  educational: [
    "Did you know? Here's something that will change how you think about this topic.",
    "Quick tip: the way you've been doing this can be 10x more efficient.",
    "Let's talk about something important that not enough people discuss.",
    "Breaking it down: here's everything you need to know about this in plain language.",
  ],
};

const PLATFORM_HASHTAGS: Record<Platform, string[]> = {
  instagram: ["#instagood", "#photooftheday", "#instagram", "#trending", "#viral", "#explore"],
  facebook: ["#facebook", "#socialmedia", "#community", "#share"],
  x: ["#trending", "#tech", "#startup", "#buildinginpublic"],
  linkedin: ["#professional", "#leadership", "#innovation", "#career", "#networking"],
  tiktok: ["#fyp", "#foryoupage", "#viral", "#trending", "#tiktok"],
  youtube: ["#youtube", "#subscribe", "#video", "#content"],
  threads: ["#threads", "#community", "#conversation"],
  pinterest: ["#pinterest", "#inspiration", "#ideas", "#design"],
};

const PLATFORM_ADAPTATIONS: Record<Platform, (caption: string) => string> = {
  instagram: (c) => `${c}\n\n📸 Double tap if you love this!\n\n${PLATFORM_HASHTAGS.instagram.slice(0, 5).join(" ")}`,
  facebook: (c) => `${c}\n\nLet us know your thoughts in the comments! 👇`,
  x: (c) => c.length > 280 ? c.substring(0, 277) + "..." : c,
  linkedin: (c) => `${c}\n\nWhat's your take on this? I'd love to hear from professionals in the space.\n\n${PLATFORM_HASHTAGS.linkedin.slice(0, 3).join(" ")}`,
  tiktok: (c) => `${c} ${PLATFORM_HASHTAGS.tiktok.slice(0, 4).join(" ")}`,
  youtube: (c) => `${c}\n\n🔔 Subscribe for more content like this!\n👍 Like if this was helpful\n💬 Comment your questions below`,
  threads: (c) => `${c}\n\nLet's start a conversation 💬`,
  pinterest: (c) => `${c}\n\n✨ Save this for later! ${PLATFORM_HASHTAGS.pinterest.slice(0, 3).join(" ")}`,
};

export async function generateCaption(params: {
  platform: Platform;
  brief: string;
  tone: "casual" | "professional" | "playful" | "educational";
}): Promise<string> {
  await delay(1200);

  const templates = CAPTION_TEMPLATES[params.tone] ?? CAPTION_TEMPLATES.casual;
  const base = templates[Math.floor(Math.random() * templates.length)];
  return `${base}\n\n${params.brief}`;
}

export async function generateVariations(
  caption: string,
  count: number = 3
): Promise<string[]> {
  await delay(1500);

  const suffixes = [
    "\n\n💡 What do you think?",
    "\n\n🔗 Link in bio for more",
    "\n\n🚀 Exciting times ahead",
    "\n\n✨ Stay tuned for updates",
    "\n\n💬 Tell us your thoughts",
  ];

  return Array.from({ length: count }, (_, i) => `${caption}${suffixes[i % suffixes.length]}`);
}

export async function repurposeToAllPlatforms(
  caption: string
): Promise<Record<Platform, string>> {
  await delay(1800);

  const platforms: Platform[] = [
    "instagram", "facebook", "x", "linkedin", "tiktok", "youtube", "threads", "pinterest",
  ];

  return Object.fromEntries(
    platforms.map((p) => [p, PLATFORM_ADAPTATIONS[p](caption)])
  ) as Record<Platform, string>;
}

export async function suggestHashtags(
  caption: string,
  platform: Platform
): Promise<string[]> {
  await delay(800);

  const base = PLATFORM_HASHTAGS[platform] ?? [];
  const generic = ["#content", "#social", "#marketing", "#brand"];

  return [...new Set([...base, ...generic])].slice(0, 10);
}

export async function adjustTone(
  caption: string,
  tone: "casual" | "professional" | "playful" | "educational"
): Promise<string> {
  await delay(1000);

  const prefixes: Record<string, string> = {
    casual: "Hey! ",
    professional: "We are pleased to share that ",
    playful: "🎉 Woohoo! ",
    educational: "Here's something worth knowing: ",
  };

  return `${prefixes[tone] ?? ""}${caption}`;
}

export async function adjustLength(
  caption: string,
  direction: "shorter" | "longer"
): Promise<string> {
  await delay(800);

  if (direction === "shorter") {
    const sentences = caption.split(". ");
    return sentences.slice(0, Math.max(1, sentences.length - 1)).join(". ");
  }

  const additions = [
    " We believe this will make a real difference.",
    " We've put a lot of thought into making this just right.",
    " Stay tuned — there's more where this came from!",
  ];

  return `${caption}${additions[Math.floor(Math.random() * additions.length)]}`;
}

export async function generateImage(prompt: string): Promise<string> {
  await delay(2000);
  // TODO(backend): wire to real image generation API
  return `https://via.placeholder.com/1200x800?text=${encodeURIComponent(prompt.slice(0, 30))}`;
}

// TODO(backend): wire to real AI agent API
