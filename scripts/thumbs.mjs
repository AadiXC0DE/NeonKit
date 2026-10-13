// Social-card images: shoots blocks and template pages and writes JPEGs to public/thumbs/. The site itself
// never shows these; every preview on it renders live.
//
//   node scripts/thumbs.mjs                     everything
//   node scripts/thumbs.mjs hero-sign saas ...  just these (block or template slugs)
//
// Blocks come from /view/<slug> and land at public/thumbs/<slug>.jpg. Template pages come from
// /preview/<slug><route> and land at public/thumbs/templates/<slug><route with / as _>.jpg.
//
// Env: BASE_URL (default http://localhost:3000). Run it against a production build (`npm run build && npm start`)
// so dev-only overlays stay out of the shots. Uses the locally installed Chrome.

import { chromium } from "playwright-core";
import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const base = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const out = path.resolve("public/thumbs");
const { blocks, templates = [] } = JSON.parse(await readFile("src/registry/registry.json", "utf8"));
const only = new Set(process.argv.slice(2));
const pick = (slug) => only.size === 0 || only.has(slug);

const shots = [
  ...blocks.filter((block) => pick(block.slug)).map((block) => ({ url: `/view/${block.slug}`, file: `${block.slug}.jpg` })),
  ...templates
    .filter((template) => pick(template.slug))
    .flatMap((template) =>
      template.routes.map((route) => ({
        url: `/preview/${template.slug}${route}`,
        file: `templates/${template.slug}${route.replace(/\//g, "_")}.jpg`,
      })),
    ),
];

await mkdir(path.join(out, "templates"), { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
// Thumbnails show the resting state; skip entrance animations that would still be mid-flight.
await page.emulateMedia({ reducedMotion: "reduce" });
const problems = [];
page.on("pageerror", (error) => problems.push(`${page.url()} ${error.message}`));

for (const shot of shots) {
  await page.goto(base + shot.url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  const png = await page.screenshot({ type: "png" });
  await sharp(png).resize(960, 600).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(out, shot.file));
  console.log(`thumb ${shot.file}`);
}

await browser.close();

if (problems.length) {
  console.error(`\n${problems.length} page error(s):\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
