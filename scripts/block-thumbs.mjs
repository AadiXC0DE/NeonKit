// Gallery thumbnails for blocks: shoots /view/<slug> at 1440x900 and writes public/thumbs/<slug>.jpg.
//
//   node scripts/block-thumbs.mjs                 every block
//   node scripts/block-thumbs.mjs hero-sign ...   just these
//
// Env: BASE_URL (default http://localhost:3000). Run it against a production build (`npm run build && npm start`)
// so dev-only overlays stay out of the shots. Uses the locally installed Chrome.

import { chromium } from "playwright-core";
import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const base = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const out = path.resolve("public/thumbs");
const { blocks } = JSON.parse(await readFile("src/registry/registry.json", "utf8"));
const only = process.argv.slice(2);
const slugs = only.length ? only : blocks.map((block) => block.slug);

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
// Thumbnails show the resting state; skip entrance animations that would still be mid-flight.
await page.emulateMedia({ reducedMotion: "reduce" });
const problems = [];
page.on("pageerror", (error) => problems.push(`${page.url()} ${error.message}`));

for (const slug of slugs) {
  await page.goto(`${base}/view/${slug}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  const png = await page.screenshot({ type: "png" });
  await sharp(png).resize(960, 600).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(out, `${slug}.jpg`));
  console.log(`thumb ${slug}.jpg`);
}

await browser.close();

if (problems.length) {
  console.error(`\n${problems.length} page error(s):\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
