import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import * as React from "react";
import { act, render } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { templates, templateShot, templateThumb } from "@/registry";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

const nav = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  notFound: () => {
    throw new Error("notFound");
  },
}));

// next/font only works through the Next compiler; here each loader just hands back class names.
vi.mock("next/font/google", () => {
  const font = (name: string) => () => ({ className: `font-${name}`, variable: `font-var-${name}`, style: { fontFamily: name } });
  return { Mona_Sans: font("mona"), Fragment_Mono: font("fragment"), Tilt_Neon: font("tilt") };
});

beforeAll(() => {
  class Observer {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal("IntersectionObserver", Observer);
  vi.stubGlobal("ResizeObserver", Observer);
});

function filesIn(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => (entry.isDirectory() ? filesIn(path.join(dir, entry.name)) : [path.join(dir, entry.name)]))
    .sort();
}

type Component = (props: Record<string, unknown>) => React.ReactNode | Promise<React.ReactNode>;

/** The page file serving a route, plus the params Next would pass it. */
function pageFor(slug: string, route: string) {
  const segments = route.split("/").filter(Boolean);
  const routeDir = path.join(root, "app/preview", slug);
  const exact = path.join(routeDir, ...segments, "page.tsx");
  if (existsSync(exact)) return { file: exact, params: {}, dirs: segments };
  // Fall back to an optional catch-all at the template root, e.g. the docs template's [[...slug]].
  const catchAll = readdirSync(routeDir).find((name) => /^\[\[\.\.\.(\w+)\]\]$/.test(name));
  if (catchAll) {
    const key = catchAll.slice(5, -2);
    return { file: path.join(routeDir, catchAll, "page.tsx"), params: { [key]: segments.length ? segments : undefined }, dirs: [catchAll] };
  }
  return undefined;
}

async function resolveElement(Component: Component, props: Record<string, unknown>) {
  return await Component(props);
}

describe.each(templates.map((template) => [template.slug, template] as const))("%s", (slug, template) => {
  const sectionDir = path.join(root, "src/components/templates", slug);
  const routeDir = path.join(root, "app/preview", slug);
  const files = [...filesIn(sectionDir), ...filesIn(routeDir)].filter((file) => /\.(tsx?|mjs)$/.test(file));

  it("is listed with a real description, routes and a version", () => {
    expect(template.description).not.toMatch(/TODO/);
    expect(template.description.length).toBeLessThanOrEqual(140);
    expect(template.routes.length).toBeGreaterThan(0);
    expect(template.routes[0]).toBe("");
    expect(template.addedIn).toMatch(/^\d+\.\d+$/);
  });

  it("keeps its base path, color and brand in config.ts", () => {
    const config = read(`src/components/templates/${slug}/config.ts`);
    expect(config).toContain(`export const basePath = "/preview/${slug}";`);
    expect(config).toMatch(/export const color\b/);
    expect(config).toMatch(/export const brand\b/);
  });

  it("links through basePath instead of hard-coding the preview path", () => {
    for (const file of files) {
      if (path.basename(file) === "config.ts") continue;
      expect(readFileSync(file, "utf8"), path.relative(root, file)).not.toContain("/preview/");
    }
  });

  it("brings its own fonts, applied at the root", () => {
    const fonts = read(`src/components/templates/${slug}/fonts.ts`);
    expect(fonts).toMatch(/Mona_Sans\(/);
    expect(fonts).toContain('variable: "--font-sans"');
    expect(files.some((file) => /import \{ fonts \} from "\.\.?\/fonts"/.test(readFileSync(file, "utf8")))).toBe(true);
  });

  it("gives every asChild a JSX element child, so shadcn can rewrite it to render={} in base-* apps", () => {
    for (const file of files) {
      // Blank out comments and string contents so a `>` inside them can't end the tag early.
      const code = readFileSync(file, "utf8")
        .replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, (m) => " ".repeat(m.length))
        .replace(/"[^"\n]*"/g, (m) => `"${" ".repeat(m.length - 2)}"`);
      for (const match of code.matchAll(/\sasChild\b/g)) {
        // Walk to the end of the opening tag, skipping `>` inside {expressions}.
        let depth = 0;
        let i = match.index!;
        for (; i < code.length; i++) {
          if (code[i] === "{") depth++;
          else if (code[i] === "}") depth--;
          else if (code[i] === ">" && depth === 0) break;
        }
        const next = code.slice(i + 1).trimStart()[0];
        const line = code.slice(0, match.index).split("\n").length;
        expect(code[i - 1] !== "/" && next === "<", `${path.relative(root, file)}:${line}`).toBe(true);
      }
    }
  });

  it("sets its color through neonVars", () => {
    expect(files.some((file) => /neonVars\(/.test(readFileSync(file, "utf8")))).toBe(true);
  });

  it("avoids Tailwind 3/4 traps and this site's theme tokens", () => {
    const banned = [
      /(?<![\w-])shadow-sm(?![\w-])/,
      /(?<![\w-])rounded-sm(?![\w-])/,
      /(?<![\w:-])rounded(?=["'`\s])/,
      /(?<![\w-])bg-gradient-to-/,
      /(?<![\w-])flex-shrink-/,
      /(?<![\w-])flex-grow/,
      /(?<![\w-])bg-opacity-/,
      /(?<![\w-])blur-sm(?![\w-])/,
      /(?<![\w-])backdrop-blur-sm(?![\w-])/,
      /\b(?:bg|text|border)-(?:background|surface|elevated|fg|muted|dim|line)\b/,
      /\bfont-neon\b/,
    ];
    for (const file of files) {
      const code = readFileSync(file, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*\/\/.*$/gm, "")
        .replace(/\b(?!className\b)[\w-]+="[^"]*"/g, "");
      const strings = code.match(/"[^"\n]*"|`[^`]*`|'[^'\n]*'/g)?.join("\n") ?? "";
      for (const pattern of banned) expect(strings, `${path.relative(root, file)} ${pattern}`).not.toMatch(pattern);
    }
  });

  it("has a social card and gallery screenshots for every page", () => {
    for (const route of template.routes) {
      expect(existsSync(path.join(root, "public", templateThumb(slug, route))), route || "/").toBe(true);
      for (const width of [1280, 2560]) {
        expect(existsSync(path.join(root, "public", `${templateShot(slug, route)}-${width}.webp`)), `${route || "/"} ${width}`).toBe(true);
      }
    }
  });

  it.each(template.routes.map((route) => [route || "/", route]))(
    "renders %s with one h1, a main landmark, labelled fields and named buttons",
    async (_label, route) => {
    const page = pageFor(slug, route);
    expect(page, `no page file serves ${route || "/"}`).toBeDefined();
    nav.pathname = `/preview/${slug}${route}`;

    // Wrap the page in every layout between the template root and the page.
    const layouts: string[] = [];
    for (let i = 0; i <= page!.dirs.length; i++) {
      const layout = path.join(routeDir, ...page!.dirs.slice(0, i), "layout.tsx");
      if (existsSync(layout)) layouts.push(layout);
    }

    vi.useFakeTimers();
    const params = Promise.resolve(page!.params);
    const Page = (await import(/* @vite-ignore */ page!.file)).default as Component;
    let tree = await resolveElement(Page, { params, searchParams: Promise.resolve({}) });
    for (const layout of layouts.reverse()) {
      const Layout = (await import(/* @vite-ignore */ layout)).default as Component;
      tree = await resolveElement(Layout, { children: tree, params });
    }
    const { container, unmount } = render(<>{tree}</>);
    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(container.querySelectorAll("h1").length).toBe(1);
    expect(container.querySelector("main")).not.toBeNull();

    for (const field of container.querySelectorAll<HTMLElement>(
      "input:not([type=hidden]):not([aria-hidden=true]), textarea, select",
    )) {
      if (field.closest("[aria-hidden=true],[inert]")) continue;
      const labelled =
        field.getAttribute("aria-label") ||
        field.getAttribute("aria-labelledby") ||
        field.closest("label") ||
        (field.id && container.querySelector(`label[for="${CSS.escape(field.id)}"]`));
      expect(labelled, `unlabelled <${field.tagName.toLowerCase()} name="${field.getAttribute("name") ?? ""}">`).toBeTruthy();
    }
    for (const button of container.querySelectorAll<HTMLElement>("button, [role=button]")) {
      if (button.closest("[aria-hidden=true],[inert]")) continue;
      const named =
        button.textContent?.trim() ||
        button.getAttribute("aria-label") ||
        button.getAttribute("aria-labelledby") ||
        button.getAttribute("title");
      expect(named, `unnamed button: ${button.outerHTML.slice(0, 160)}`).toBeTruthy();
    }

    unmount();
    vi.useRealTimers();
    },
    // The first render of a template imports and transforms every section it uses; under load that alone can pass 5s.
    30_000,
  );
});

describe("docs not-found", () => {
  it("renders inside the docs shell with one h1 and links through basePath", async () => {
    const NotFound = (await import("../app/preview/docs/not-found")).default;
    const { basePath } = await import("@/components/templates/docs/config");
    const { container, unmount } = render(<NotFound />);
    expect(container.querySelectorAll("h1").length).toBe(1);
    const hrefs = [...container.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href?.startsWith(basePath)).toBe(true);
    unmount();
  }, 30_000);
});
