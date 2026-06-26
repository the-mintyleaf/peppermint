import { delay, paginate, USE_MOCK } from "../shared/mock.utils";
import type {
  Mention,
  Keyword,
  Competitor,
  Alert,
} from "../shared/entities.types";

// TODO(backend): replace with real API

const PLATFORMS = ["instagram", "x", "linkedin", "tiktok", "facebook"] as const;
const SENTIMENTS: Mention["sentiment"][] = ["positive", "neutral", "negative"];

let mentions: Mention[] = Array.from({ length: 30 }, (_, i) => ({
  id: `mention_${i + 1}`,
  source: ["twitter.com", "instagram.com", "reddit.com", "linkedin.com"][i % 4],
  platform: PLATFORMS[i % PLATFORMS.length] as Mention["platform"],
  author: `user_${i + 1}`,
  text: [
    "Love what you're doing with your brand!",
    "Just discovered @yourbrand and already obsessed.",
    "The latest post from @yourbrand was incredibly inspiring.",
    "Not impressed with @yourbrand lately.",
    "@yourbrand please fix the app — it keeps crashing.",
    "Shoutout to @yourbrand for great customer service!",
    "Anyone else following @yourbrand? Their content is fire!",
    "@yourbrand is the best in the industry, hands down.",
    "Disappointed with @yourbrand's recent changes.",
    "Just had a great experience with @yourbrand support team!",
  ][i % 10],
  url: `https://example.com/mention/${i + 1}`,
  sentiment: SENTIMENTS[i % 3],
  reach: Math.floor(Math.random() * 50000) + 1000,
  createdAt: new Date(Date.now() - i * 2 * 3600_000),
}));

const DAYS = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  return d;
});

let keywords: Keyword[] = [
  "social media",
  "content marketing",
  "influencer",
  "brand awareness",
  "#mojito",
  "#contentcreator",
  "#digitalmarketing",
  "#growthhacks",
  "competitor brand",
  "your brand name",
].map((term, i) => ({
  id: `kw_${i + 1}`,
  term,
  kind: term.startsWith("#") ? "hashtag" : "keyword",
  volumeSeries: DAYS.map((date) => ({
    date,
    value: Math.floor(Math.random() * 500) + 50,
  })),
}));

let competitors: Competitor[] = [
  { handle: "@brand_rival", platform: "instagram" },
  { handle: "@top_competitor", platform: "x" },
  { handle: "@industry_leader", platform: "linkedin" },
  { handle: "@fast_grower", platform: "tiktok" },
  { handle: "@legacy_brand", platform: "facebook" },
].map((c, i) => ({
  id: `comp_${i + 1}`,
  handle: c.handle,
  platform: c.platform as Competitor["platform"],
  volumeSeries: DAYS.map((date) => ({
    date,
    value: Math.floor(Math.random() * 1000) + 100,
  })),
}));

let alerts: Alert[] = Array.from({ length: 10 }, (_, i) => ({
  id: `alert_${i + 1}`,
  type: (["volume_spike", "crisis", "keyword_mention"] as Alert["type"][])[
    i % 3
  ],
  text: [
    "Volume spike detected for #yourbrand (+340% in 2h)",
    "Potential crisis: negative sentiment spike on Instagram",
    "Keyword 'your brand name' mentioned 87 times today",
    "Competitor @brand_rival gained 5,000 followers in 24h",
    "Your post reached viral threshold (>10k shares)",
    "Unusual negative sentiment detected on Twitter",
    "Hashtag #yourbrand trending in United States",
    "Weekly report: +12% engagement vs last week",
    "New mention from high-reach account (1.2M followers)",
    "Alert: Your content was reposted by an influencer",
  ][i],
  read: i > 5,
  triggeredAt: new Date(Date.now() - i * 5 * 3600_000),
}));

export interface MentionFilters {
  sentiment?: Mention["sentiment"];
  platform?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchMentions(filters: MentionFilters = {}) {
  await delay();
  let items = [...mentions];
  if (filters.sentiment)
    items = items.filter((m) => m.sentiment === filters.sentiment);
  if (filters.platform)
    items = items.filter((m) => m.platform === filters.platform);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (m) => m.author.includes(q) || m.text.toLowerCase().includes(q),
    );
  }
  return paginate(items, filters.page ?? 1, filters.pageSize ?? 15);
}

export async function fetchKeywords(): Promise<Keyword[]> {
  await delay();
  return [...keywords];
}

export async function addKeyword(
  term: string,
  kind: Keyword["kind"],
): Promise<Keyword> {
  await delay();
  const kw: Keyword = {
    id: `kw_${Date.now()}`,
    term,
    kind,
    volumeSeries: DAYS.map((date) => ({ date, value: 0 })),
  };
  keywords.push(kw);
  return kw;
}

export async function deleteKeyword(id: string): Promise<void> {
  await delay();
  keywords = keywords.filter((k) => k.id !== id);
}

export async function fetchCompetitors(): Promise<Competitor[]> {
  await delay();
  return [...competitors];
}

export async function addCompetitor(
  handle: string,
  platform: Competitor["platform"],
): Promise<Competitor> {
  await delay();
  const c: Competitor = {
    id: `comp_${Date.now()}`,
    handle,
    platform,
    volumeSeries: DAYS.map((date) => ({ date, value: 0 })),
  };
  competitors.push(c);
  return c;
}

export async function deleteCompetitor(id: string): Promise<void> {
  await delay();
  competitors = competitors.filter((c) => c.id !== id);
}

export interface SentimentPoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

export async function fetchSentimentStream(): Promise<SentimentPoint[]> {
  await delay();
  return DAYS.map((d) => ({
    date: d.toISOString().split("T")[0],
    positive: Math.floor(Math.random() * 60) + 40,
    neutral: Math.floor(Math.random() * 30) + 20,
    negative: Math.floor(Math.random() * 20) + 5,
  }));
}

export async function fetchAlerts(): Promise<Alert[]> {
  await delay();
  return [...alerts].sort(
    (a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime(),
  );
}

export async function markAlertRead(id: string): Promise<void> {
  await delay();
  const idx = alerts.findIndex((a) => a.id === id);
  if (idx !== -1) alerts[idx] = { ...alerts[idx], read: true };
}

export async function markAllAlertsRead(): Promise<void> {
  await delay();
  alerts = alerts.map((a) => ({ ...a, read: true }));
} // TODO(backend): PATCH /alerts/read-all
