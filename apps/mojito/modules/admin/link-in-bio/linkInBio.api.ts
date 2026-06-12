import { delay, USE_MOCK } from "../shared/mock.utils";

// TODO(backend): replace with real API

export interface LinkItem {
  id: string;
  label: string;
  url: string;
  enabled: boolean;
  order: number;
}

export interface LinkInBioPage {
  id: string;
  title: string;
  bio?: string;
  avatarUrl?: string;
  slug: string;
  theme: "light" | "dark" | "gradient";
  accentColor: string;
  links: LinkItem[];
  publishedAt?: Date;
}

let page: LinkInBioPage = {
  id: "lib_1",
  title: "Your Brand",
  bio: "Content creator · Social media enthusiast · Building in public",
  avatarUrl: "https://picsum.photos/seed/avatar/80/80",
  slug: "yourbrand",
  theme: "light",
  accentColor: "#228be6",
  links: [
    { id: "lnk_1", label: "Website", url: "https://yourbrand.com", enabled: true, order: 0 },
    { id: "lnk_2", label: "Newsletter", url: "https://newsletter.yourbrand.com", enabled: true, order: 1 },
    { id: "lnk_3", label: "Shop", url: "https://shop.yourbrand.com", enabled: true, order: 2 },
    { id: "lnk_4", label: "YouTube", url: "https://youtube.com/@yourbrand", enabled: false, order: 3 },
  ],
  publishedAt: new Date(Date.now() - 7 * 86_400_000),
};

export async function fetchLinkInBioPage(): Promise<LinkInBioPage> {
  await delay();
  return { ...page, links: [...page.links].sort((a, b) => a.order - b.order) };
}

export async function updateLinkInBioPage(patch: Partial<Omit<LinkInBioPage, "links">>): Promise<LinkInBioPage> {
  await delay();
  page = { ...page, ...patch };
  return { ...page };
} // TODO(backend): PATCH /link-in-bio

export async function updateLinks(links: LinkItem[]): Promise<LinkInBioPage> {
  await delay();
  page = { ...page, links };
  return { ...page };
}

export async function publishPage(): Promise<LinkInBioPage> {
  await delay(600);
  page = { ...page, publishedAt: new Date() };
  return { ...page };
} // TODO(backend): POST /link-in-bio/publish
