// Install test: proves the published registry installs into a fresh Next.js app and builds.
//
//   npm run install-test             build, install, `next build`, clean up
//   npm run install-test -- --keep   keep the temp dir for a look afterwards
//
// It builds the registry for http://localhost:4400 into a temp dir (public/r is left alone), serves it with
// public/ on that port, creates an app with create-next-app (TypeScript, Tailwind, App Router, Cache Components),
// runs `shadcn init -d`, adds a representative set of components, one block and one template over HTTP, renders
// them from a page and runs `next build`. Any failing step fails the test. npm runs with prefer-offline, so a
// warm npm cache covers most of it; shadcn's own `utils` item and Google Fonts still need the network.

import { spawn } from "node:child_process";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const PORT = Number(process.env.INSTALL_TEST_PORT ?? 4400);
const origin = `http://localhost:${PORT}`;
const keep = process.argv.includes("--keep");

const COMPONENTS = ["button", "switch", "dialog", "select", "data-table", "chat-message", "knob", "neon-sign"];
const BLOCK = "hero-city";
const TEMPLATE = "saas";

// npm passes its own config and package details down through npm_* variables, which would point npm in the
// fresh app back at this repo. Drop them and keep the rest of the environment.
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^npm_/i.test(key) && key !== "INIT_CWD"));
Object.assign(env, { npm_config_prefer_offline: "true", npm_config_fund: "false", npm_config_audit: "false", NEXT_TELEMETRY_DISABLED: "1" });

function run(command, args, { cwd, extraEnv } = {}) {
  const started = Date.now();
  const where = cwd && cwd !== tmp ? `   (in ${cwd.startsWith(tmp) ? path.relative(tmp, cwd) : cwd})` : "";
  console.log(`\n$ ${[command, ...args].join(" ")}${where}`);
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: cwd ?? tmp, env: { ...env, ...extraEnv }, stdio: ["ignore", "inherit", "inherit"] });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        console.log(`  done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
        resolve();
      } else reject(new Error(`${command} ${args[0] ?? ""} exited with ${signal ?? code}`));
    });
  });
}

const types = { ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".txt": "text/plain" };

/** Serves /r/* from the freshly built registry and everything else from public/. */
function serve(registryDir) {
  const server = http.createServer(async (req, res) => {
    const url = decodeURIComponent(new URL(req.url, origin).pathname);
    const file = url.startsWith("/r/") ? path.join(registryDir, url.slice(3)) : path.join(root, "public", url);
    const inside = file.startsWith(registryDir + path.sep) || file.startsWith(path.join(root, "public") + path.sep);
    try {
      if (!inside || !(await stat(file)).isFile()) throw new Error("not a file");
      res.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" });
      createReadStream(file).pipe(res);
    } catch {
      console.log(`  404 ${url}`);
      res.writeHead(404).end("not found");
    }
  });
  return new Promise((resolve, reject) => {
    server.once("error", (error) =>
      reject(error.code === "EADDRINUSE" ? new Error(`port ${PORT} is busy; set INSTALL_TEST_PORT`) : error),
    );
    server.listen(PORT, () => resolve(server));
  });
}

const tmp = await mkdtemp(path.join(os.tmpdir(), "neonkit-install-"));
const registryDir = path.join(tmp, "registry");
const appDir = path.join(tmp, "app");
let server;
let failed = false;

try {
  console.log(`Install test in ${tmp}`);
  await mkdir(registryDir);
  await run(process.execPath, [path.join(root, "scripts/build-registry.mjs"), "--out", registryDir], {
    cwd: root,
    extraEnv: { NEXT_PUBLIC_SITE_URL: origin },
  });
  server = await serve(registryDir);
  console.log(`  serving the registry on ${origin}`);

  await run("npx", [
    "--yes",
    "create-next-app@latest",
    "app",
    "--ts",
    "--tailwind",
    "--eslint",
    "--app",
    "--cache-components",
    "--import-alias",
    "@/*",
    "--use-npm",
    "--disable-git",
    "--no-agent-feedback",
    "--yes",
  ]);
  await run("npx", ["--yes", "shadcn@latest", "init", "-d", "--no-monorepo"], { cwd: appDir });
  await run(
    "npx",
    ["--yes", "shadcn@latest", "add", ...[...COMPONENTS, BLOCK, TEMPLATE].map((slug) => `${origin}/r/${slug}.json`), "--overwrite", "--yes"],
    { cwd: appDir },
  );

  // The template brings its own routes; give the components and the block one too, so the build bundles them
  // rather than only type-checking them.
  const appRoutes = existsSync(path.join(appDir, "src/app")) ? path.join(appDir, "src/app") : path.join(appDir, "app");
  const expected = [path.join(appRoutes, TEMPLATE, "page.tsx"), path.join(appRoutes, TEMPLATE, "pricing/page.tsx")];
  for (const file of expected) if (!existsSync(file)) throw new Error(`shadcn add did not write ${path.relative(appDir, file)}`);
  await mkdir(path.join(appRoutes, "install-test"), { recursive: true });
  await writeFile(
    path.join(appRoutes, "install-test/page.tsx"),
    [
      ...COMPONENTS.map((slug) => `import "@/components/ui/${slug}";`),
      `import Block from "@/components/${BLOCK}";`,
      "",
      "export default function InstallTest() {",
      "  return <Block />;",
      "}",
      "",
    ].join("\n"),
  );

  const build = process.platform === "win32" ? ["npx", ["next", "build"]] : ["nice", ["-n", "10", "npx", "next", "build"]];
  await run(build[0], build[1], { cwd: appDir });
  console.log(`\nInstall test passed: ${COMPONENTS.length} components, ${BLOCK}, ${TEMPLATE} installed and built.`);
} catch (error) {
  failed = true;
  console.error(`\nInstall test failed: ${error.message}`);
} finally {
  server?.close();
  if (keep || failed) console.log(`Kept ${tmp}`);
  else await rm(tmp, { recursive: true, force: true });
}

process.exit(failed ? 1 : 0);
