// Screenshots of blocks and template pages, shot at 1440 × 900 and 2x:
//  - gallery previews, public/previews/<name>-1280.webp and -2560.webp (see PreviewShot);
//  - social cards, public/thumbs/<name>.jpg at 960 × 600.
//
//   node scripts/thumbs.mjs                     everything
//   node scripts/thumbs.mjs hero-sign saas ...  just these (block or template slugs)
//
// Blocks come from /view/<slug> and are named <slug>. Template pages come from /preview/<slug><route> and are
// named templates/<slug><route with / as _>.
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
  ...blocks.filter((block) => pick(block.slug)).map((block) => ({ url: `/view/${block.slug}`, name: block.slug })),
  ...templates
    .filter((template) => pick(template.slug))
    .flatMap((template) =>
      template.routes.map((route) => ({
        url: `/preview/${template.slug}${route}`,
        name: `templates/${template.slug}${route.replace(/\//g, "_")}`,
      })),
    ),
];

const previews = path.resolve("public/previews");
for (const dir of [out, previews]) await mkdir(path.join(dir, "templates"), { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
// Thumbnails show the resting state; skip entrance animations that would still be mid-flight.
await page.emulateMedia({ reducedMotion: "reduce" });
const problems = [];
page.on("pageerror", (error) => problems.push(`${page.url()} ${error.message}`));

for (const shot of shots) {
  await page.goto(base + shot.url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  const png = await page.screenshot({ type: "png" });
  await sharp(png).resize(960, 600).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(out, `${shot.name}.jpg`));
  for (const width of [1280, 2560]) {
    await sharp(png).resize(width).webp({ quality: 82, effort: 6 }).toFile(path.join(previews, `${shot.name}-${width}.webp`));
  }
  console.log(`shot ${shot.name}`);
}

await browser.close();

if (problems.length) {
  console.error(`\n${problems.length} page error(s):\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
