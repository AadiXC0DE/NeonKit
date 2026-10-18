// Accessibility gate: runs axe-core (WCAG 2.1 A + AA) over every page of a running site and fails on
// serious or critical violations.
//
//   npm run a11y                                  every route against http://localhost:3000
//   npm run a11y -- /components/button /view/x    just these routes
//   npm run a11y -- --only=components,blocks      a subset: components, blocks, templates, site
//   npm run a11y -- --json=out.json               also write the full results as JSON
//   npm run a11y -- /components/x --verbose       print each failing node's markup and axe's reasoning
//
// Env: BASE_URL (default http://localhost:3000). Locally it drives the system Chrome; with CI set it uses the
// Playwright chromium that `npx playwright install chromium` downloads.

import { chromium } from "playwright-core";
import { createRequire } from "node:module";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, "..");
const base = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const args = process.argv.slice(2);
const flag = (name) => args.find((arg) => arg.startsWith(`--${name}=`))?.split("=")[1];
const only = flag("only")?.split(",");
const jsonOut = flag("json");
const verbose = args.includes("--verbose");

const FAILING = new Set(["serious", "critical"]);

// Known exceptions, each matched on route, rule and a piece of the node's markup. Keep this list short and say why;
// the fix is almost always the markup, not an entry here.
const EXCEPTIONS = [
  {
    route: "/view/marketing-contact",
    rule: "color-contrast",
    html: "--font-tilt-neon",
    // The studio's OPEN sign: an aria-hidden tube that is dark glass while the studio is closed (1.4.3 exempts
    // pure decoration). "Open now." / "Closed." is spelled out in text beside it, and whether it is lit depends
    // on the clock, so the result would flip with the time of day.
  },
];
const excepted = (route, rule, html) =>
  EXCEPTIONS.some((entry) => entry.route === route && entry.rule === rule && html.includes(entry.html));
const VIEWPORT = { width: 1280, height: 900 };
// Previews mount within 600px of the viewport and unmount 2000px past it, so each step overlaps the last.
const STEP = VIEWPORT.height + 1000;

async function routes() {
  const { items, blocks = [], templates = [] } = JSON.parse(await readFile(path.join(root, "src/registry/registry.json"), "utf8"));
  const docsDir = path.join(root, "app/(docs)/docs");
  const docs = (await readdir(docsDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => `/docs/${entry.name}`)
    .sort();
  const groups = {
    site: [
      "/",
      "/components",
      "/blocks",
      "/templates",
      "/docs",
      ...docs,
      "/theme",
      "/changelog",
      "/request",
      "/sponsor",
      // One of each gallery detail page: the route is shared, the content is the block or template.
      ...(blocks[0] ? [`/blocks/${blocks[0].slug}`] : []),
      ...(templates[0] ? [`/templates/${templates[0].slug}`] : []),
    ],
    components: items.map((item) => `/components/${item.slug}`),
    blocks: blocks.map((block) => `/view/${block.slug}`),
    templates: templates.flatMap((template) => (template.routes ?? [""]).map((route) => `/preview/${template.slug}${route}`)),
  };
  return Object.entries(groups)
    .filter(([name]) => !only || only.includes(name))
    .flatMap(([, list]) => list);
}

const list = args.filter((arg) => !arg.startsWith("--"));
const targets = list.length ? list : await routes();

const axeSource = await readFile(require.resolve("axe-core/axe.min.js"), "utf8");
const browser = await chromium.launch(process.env.CI ? { headless: true } : { channel: "chrome", headless: true });
// Reduced motion: components settle into their resting state, so contrast is measured on what people read rather
// than on a frame of an entrance animation.
const context = await browser.newContext({ viewport: VIEWPORT, reducedMotion: "reduce" });
const page = await context.newPage();

/** Runs axe in the page, optionally scoped to the elements marked with data-a11y-scope. */
async function runAxe(scoped) {
  return page.evaluate(
    async ({ source, scoped }) => {
      if (!window.axe) new Function(source)();
      const context = scoped ? { include: [...document.querySelectorAll("[data-a11y-scope]")].map((node) => [node]) } : document;
      if (scoped && context.include.length === 0) return [];
      const result = await window.axe.run(context, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
        resultTypes: ["violations"],
        // Gallery tiles embed /view/<slug> frames that are aria-hidden and tested on their own routes.
        iframes: false,
        elementRef: true,
      });
      // label-content-name-mismatch (2.5.3 Label in Name) counts every glyph inside a control as its label,
      // including text the author marked as not part of it. Two kinds are set aside before comparing again:
      // text the control points at with aria-describedby (a drop zone's hint is its description), and
      // aria-hidden decoration (an element tile beside a wordmark, avatar initials, the duplicate copy a glow
      // effect draws over a logo). Whatever visible text is left must still appear in the name, as axe requires.
      const words = (text) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
      const labelInName = (element) => {
        const copy = element.cloneNode(true);
        const ids = (element.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
        for (const id of ids) copy.querySelector(`[id="${CSS.escape(id)}"]`)?.remove();
        for (const hidden of copy.querySelectorAll('[aria-hidden="true"], style, script, template')) hidden.remove();
        // Text nodes joined with spaces: a number badge beside a domain reads "1 rfc-editor.org", not "1rfc".
        const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT);
        const parts = [];
        while (walker.nextNode()) parts.push(walker.currentNode.nodeValue);
        const visible = words(parts.join(" "));
        const labelledBy = (element.getAttribute("aria-labelledby") ?? "").split(/\s+/).filter(Boolean);
        const name = labelledBy.length
          ? labelledBy.map((id) => document.getElementById(id)?.textContent ?? "").join(" ")
          : (element.getAttribute("aria-label") ?? "");
        return !visible || ` ${words(name)} `.includes(` ${visible} `);
      };
      return result.violations
        .map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          help: violation.help,
          nodes: violation.nodes
            .filter((node) => !(violation.id === "label-content-name-mismatch" && node.element && labelInName(node.element)))
            .map((node) => ({ target: node.target.join(" "), html: node.html, summary: node.failureSummary })),
        }))
        .filter((violation) => violation.nodes.length);
    },
    { source: axeSource, scoped },
  );
}

async function audit(route) {
  const response = await page.goto(base + route, { waitUntil: "load", timeout: 120_000 });
  if (!response || response.status() >= 400) throw new Error(`HTTP ${response?.status() ?? "no response"}`);
  await page.waitForTimeout(1000);

  const found = new Map();
  const add = (violations) => {
    for (const violation of violations) {
      const nodes = violation.nodes.filter((node) => !excepted(route, violation.id, node.html));
      if (!nodes.length) continue;
      const entry = found.get(violation.id) ?? { ...violation, nodes: new Map() };
      for (const node of nodes) entry.nodes.set(node.target, node);
      found.set(violation.id, entry);
    }
  };

  // Walk down the page; at each stop, audit the preview stages that have mounted since the last one.
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = STEP; y < height; y += STEP) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
    await page.waitForTimeout(900);
    await page.evaluate(() => {
      for (const node of document.querySelectorAll("[data-a11y-scope]")) node.removeAttribute("data-a11y-scope");
      for (const node of document.querySelectorAll(".nk-stage")) {
        const box = node.getBoundingClientRect();
        if (box.bottom > -600 && box.top < window.innerHeight + 600 && node.childElementCount) node.setAttribute("data-a11y-scope", "");
      }
    });
    add(await runAxe(true));
  }
  await page.evaluate(() => {
    for (const node of document.querySelectorAll("[data-a11y-scope]")) node.removeAttribute("data-a11y-scope");
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.waitForTimeout(500);
  add(await runAxe(false));

  return [...found.values()].map((violation) => ({ ...violation, nodes: [...violation.nodes.values()] }));
}

const results = [];
let failed = 0;
for (const [index, route] of targets.entries()) {
  const label = `[${index + 1}/${targets.length}] ${route}`;
  try {
    const violations = await audit(route);
    const failing = violations.filter((violation) => FAILING.has(violation.impact));
    results.push({ route, violations });
    if (failing.length) failed++;
    console.log(`${failing.length ? "FAIL" : "ok  "} ${label}${failing.length ? `  ${failing.map((v) => v.id).join(", ")}` : ""}`);
    if (verbose) {
      for (const violation of failing) {
        for (const node of violation.nodes) {
          console.log(`\n  ${violation.id}  ${node.target}\n  ${node.html.slice(0, 400)}\n  ${node.summary.replace(/\n/g, "\n  ")}`);
        }
      }
    }
  } catch (error) {
    failed++;
    results.push({ route, error: String(error.message ?? error) });
    console.log(`ERR  ${label}  ${error.message ?? error}`);
  }
  // Written as it goes, so a long run can be read before it ends.
  if (jsonOut) await writeFile(jsonOut, JSON.stringify(results, null, 2));
}

await browser.close();

const rows = results.flatMap(({ route, violations = [], error }) =>
  error
    ? [[route, "(error)", "", "", error]]
    : violations
        .filter((violation) => FAILING.has(violation.impact))
        .map((violation) => [route, violation.id, violation.impact, String(violation.nodes.length), violation.nodes[0]?.target ?? ""]),
);

if (rows.length) {
  const header = ["route", "rule", "impact", "count", "first target"];
  const clip = (text, max) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);
  const table = [header, ...rows].map((row) => row.map((cell, i) => clip(cell, i === 4 ? 70 : 48)));
  const widths = header.map((_, i) => Math.max(...table.map((row) => row[i].length)));
  console.log("");
  for (const row of table) console.log(row.map((cell, i) => cell.padEnd(widths[i])).join("  "));
  console.error(`\n${failed} of ${targets.length} route(s) have serious or critical violations or failed to load.`);
  process.exit(1);
}

console.log(`\nNo serious or critical violations on ${targets.length} route(s).`);
