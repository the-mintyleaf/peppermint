#!/usr/bin/env node
/**
 * Screenshot capture for /visual-review.
 * Captures a route at multiple viewport widths in light + dark mode so the
 * agent can Read the images and audit them against .claude/DESIGN.md.
 *
 * Usage (run from the repo root so @playwright/test resolves):
 *   node .claude/scripts/screenshot.mjs --url <url> --out <dir> \
 *     [--widths 390,768,1440] [--schemes light,dark] \
 *     [--storage-state <state.json>] [--wait-ms 1500]
 *
 * Prints a JSON manifest of captured files to stdout. Exits non-zero if any
 * capture fails.
 */

import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import { chromium } from "@playwright/test";

function parseArgs(argv) {
  const args = {
    widths: [390, 768, 1440],
    schemes: ["light", "dark"],
    waitMs: 1500,
    height: 900,
  };
  for (let i = 2; i < argv.length; i += 2) {
    const key = argv[i];
    const val = argv[i + 1];
    if (key === "--url") args.url = val;
    else if (key === "--out") args.out = val;
    else if (key === "--widths") args.widths = val.split(",").map(Number);
    else if (key === "--schemes") args.schemes = val.split(",");
    else if (key === "--storage-state") args.storageState = val;
    else if (key === "--wait-ms") args.waitMs = Number(val);
    else if (key === "--height") args.height = Number(val);
    else {
      console.error(`Unknown argument: ${key}`);
      process.exit(1);
    }
  }
  if (!args.url || !args.out) {
    console.error("Required: --url <url> --out <dir>");
    process.exit(1);
  }
  if (
    args.widths.some((w) => !Number.isFinite(w) || w <= 0) ||
    !Number.isFinite(args.height) ||
    !Number.isFinite(args.waitMs)
  ) {
    console.error("Invalid numeric value in --widths/--height/--wait-ms");
    process.exit(1);
  }
  const validSchemes = ["light", "dark", "no-preference"];
  if (args.schemes.some((s) => !validSchemes.includes(s))) {
    console.error(`Invalid --schemes value; use: ${validSchemes.join(",")}`);
    process.exit(1);
  }
  return args;
}

const args = parseArgs(process.argv);
await mkdir(args.out, { recursive: true });

const slug = (
  new URL(args.url).pathname.replace(/\W+/g, "-").replace(/^-|-$/g, "") ||
  "root"
).slice(-60);

const browser = await chromium.launch();
const manifest = [];
const failures = [];

for (const scheme of args.schemes) {
  for (const width of args.widths) {
    const context = await browser.newContext({
      viewport: { width, height: args.height },
      colorScheme: scheme,
      ...(args.storageState ? { storageState: args.storageState } : {}),
    });
    const page = await context.newPage();
    const file = join(args.out, `${slug}-${width}-${scheme}.png`);
    try {
      // networkidle never resolves on pages with polling/SSE — fall back to "load".
      try {
        await page.goto(args.url, { waitUntil: "networkidle", timeout: 15000 });
      } catch {
        await page.goto(args.url, { waitUntil: "load", timeout: 30000 });
      }
      // Settle skeletons/animations beyond network idle.
      await page.waitForTimeout(args.waitMs);
      await page.screenshot({ path: file, fullPage: true });
      manifest.push({
        file,
        width,
        scheme,
        url: args.url,
        finalUrl: page.url(),
        redirected: page.url() !== args.url,
      });
    } catch (err) {
      failures.push({ width, scheme, error: String(err) });
    } finally {
      await context.close();
    }
  }
}

await browser.close();

console.log(JSON.stringify({ captures: manifest, failures }, null, 2));
if (failures.length > 0) process.exit(1);
