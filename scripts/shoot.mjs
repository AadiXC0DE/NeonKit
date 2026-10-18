// Visual QA: screenshots pages from a running site and fails on console errors.
//
//   node scripts/shoot.mjs /components/button            desktop + phone
//   node scripts/shoot.mjs --all                          every component page
//   node scripts/shoot.mjs /components/select --full      full-page captures
//
// Env: BASE_URL (default http://localhost:3000), OUT (default internal/shots).
// Uses the locally installed Chrome; no browser download needed.

import { chromium } from "playwright-core";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const base = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const out = path.resolve(process.env.OUT ?? "internal/shots");
const full = args.includes("--full");
let routes = args.filter((arg) => !arg.startsWith("--"));

if (args.includes("--all")) {
  const { items } = JSON.parse(await readFile("src/registry/registry.json", "utf8"));
  routes = items.map((item) => `/components/${item.slug}`);
}
if (routes.length === 0) routes = ["/"];

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "phone", width: 390, height: 844 },
];

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const problems = [];

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  page.on("pageerror", (error) => problems.push(`${page.url()} [${viewport.name}] ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`${page.url()} [${viewport.name}] ${message.text()}`);
  });
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const file = `${route.replace(/^\//, "").replace(/\//g, "_") || "home"}.${viewport.name}.png`;
    await page.screenshot({ path: path.join(out, file), fullPage: full });
    console.log(`shot ${file}`);
  }
  await page.close();
}

await browser.close();

if (problems.length) {
  console.error(`\n${problems.length} console problem(s):\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
