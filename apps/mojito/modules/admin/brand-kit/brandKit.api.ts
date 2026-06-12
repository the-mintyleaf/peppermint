import { delay, USE_MOCK } from "../shared/mock.utils";

// TODO(backend): replace with real API

export interface BrandColor {
  name: string;
  hex: string;
}

export interface BrandFont {
  name: string;
  url?: string;
  weight?: string;
}

export interface BrandKit {
  id: string;
  name: string;
  primaryLogoUrl?: string;
  secondaryLogoUrl?: string;
  darkLogoUrl?: string;
  colors: BrandColor[];
  fonts: BrandFont[];
  watermarkText?: string;
  watermarkUrl?: string;
  tagline?: string;
}

let brandKit: BrandKit = {
  id: "bk_1",
  name: "Default Brand Kit",
  primaryLogoUrl: "https://picsum.photos/seed/logo/200/80",
  colors: [
    { name: "Primary", hex: "#228be6" },
    { name: "Secondary", hex: "#40c057" },
    { name: "Accent", hex: "#f59f00" },
    { name: "Dark", hex: "#212529" },
    { name: "Light", hex: "#f8f9fa" },
  ],
  fonts: [
    { name: "Inter", weight: "400, 600, 700" },
    { name: "Playfair Display", weight: "700" },
  ],
  tagline: "Creating with purpose.",
};

export async function fetchBrandKit(): Promise<BrandKit> {
  await delay();
  return { ...brandKit };
}

export async function updateBrandKit(patch: Partial<BrandKit>): Promise<BrandKit> {
  await delay();
  brandKit = { ...brandKit, ...patch };
  return { ...brandKit };
} // TODO(backend): PATCH /brand-kit
