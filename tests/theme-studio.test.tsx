import * as React from "react";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  globalsCss,
  installCommand,
  neonTs,
  registryItem,
  shareUrl,
  tailwindConfig,
} from "@/components/site/theme-studio/exports";
import {
  cleanName,
  decodeTheme,
  encodeTheme,
  radiusVars,
  stockTheme,
  surfaceRgb,
  type Theme,
} from "@/components/site/theme-studio/state";
import { Channels, Master } from "@/components/site/theme-studio/desk";

const custom: Theme = {
  palette: [
    { name: "brand", rgb: "0 255 170" },
    { name: "hot-pink", rgb: "255 95 162" },
    { name: "cyan", rgb: "34 211 238" },
  ],
  accent: "hot-pink",
  glow: 80,
  radius: 125,
  tint: 40,
  motion: "reduced",
};

describe("theme URL state", () => {
  it("writes nothing for the stock theme", () => {
    expect(encodeTheme(stockTheme)).toBe("");
    expect(decodeTheme("")).toEqual(stockTheme);
  });

  it("round-trips every control", () => {
    const qs = encodeTheme(custom);
    expect(qs).toBe("p=brand.00ffaa~hot-pink.ff5fa2~cyan.22d3ee&a=hot-pink&g=80&r=125&t=40&m=reduced");
    expect(decodeTheme(qs)).toEqual(custom);
    expect(decodeTheme(new URLSearchParams(qs))).toEqual(custom);
    expect(decodeTheme(Object.fromEntries(new URLSearchParams(qs)))).toEqual(custom);
  });

  it("ignores junk and clamps out-of-range values", () => {
    const theme = decodeTheme("p=good.ff0000~bad.zzz~~good.00ff00&a=missing&g=900&r=-5&t=abc&m=fast");
    expect(theme.palette).toEqual([{ name: "good", rgb: "255 0 0" }]);
    expect(theme.accent).toBe("good");
    expect(theme.glow).toBe(150);
    expect(theme.radius).toBe(0);
    expect(theme.tint).toBe(0);
    expect(theme.motion).toBe("full");
  });

  it("keeps palette names usable as object keys and color props", () => {
    expect(cleanName("  Hot Pink! ")).toBe("hot-pink");
    expect(cleanName("9lives")).toBe("lives");
    expect(cleanName("a".repeat(30))).toHaveLength(16);
  });
});

describe("derived values", () => {
  it("scales Tailwind's radius scale", () => {
    expect(radiusVars(100)["--radius-lg"]).toBe("0.5rem");
    expect(radiusVars(150)["--radius-xl"]).toBe("1.125rem");
    expect(radiusVars(0)["--radius-md"]).toBe("0rem");
  });

  it("tints the page from pure black through stock to purple-black", () => {
    expect(surfaceRgb(-100)).toBe("0 0 0");
    expect(surfaceRgb(0)).toBe("5 6 10");
    expect(surfaceRgb(100)).toBe("10 6 17");
  });
});

describe("exports", () => {
  it("writes the library's own lib/neon.ts for the stock palette", () => {
    const source = fs.readFileSync(path.resolve(import.meta.dirname, "../src/lib/neon.ts"), "utf8");
    expect(neonTs(stockTheme)).toBe(source);
  });

  it("writes an edited palette, quoting keys that need it and falling back to the accent", () => {
    const ts = neonTs(custom);
    expect(ts).toContain('  brand: "0 255 170",\n  "hot-pink": "255 95 162",');
    expect(ts).toContain('return neonColors["hot-pink"];');
    expect(ts).toContain("falling back to hot-pink.");
  });

  it("writes CSS variables, the Tailwind 4 radius scale and the motion rule", () => {
    const css = globalsCss(custom);
    expect(css).toContain("--neon-accent: 255 95 162;");
    expect(css).toContain("--neon-glow: 0.8;");
    expect(css).toContain("@theme {\n  --radius-xs: 0.1563rem;");
    expect(css).toContain("animation-iteration-count: 1 !important;");
    expect(css).not.toContain("transition-duration");
    expect(globalsCss(stockTheme)).not.toContain("@theme");
  });

  it("writes a Tailwind 3 borderRadius block", () => {
    expect(tailwindConfig(custom)).toContain('DEFAULT: "0.3125rem",');
    expect(tailwindConfig(custom)).toContain('"2xl": "1.25rem",');
  });

  it("builds a registry:theme item shadcn can apply", () => {
    const item = registryItem(custom);
    expect(item.type).toBe("registry:theme");
    expect(item.cssVars.light).toEqual({ "neon-accent": "255 95 162", "neon-glow": "0.8" });
    expect(item.cssVars.theme?.["radius-lg"]).toBe("0.625rem");
    expect(item.css["@layer base"].body.background).toBe("#07060d");
    expect(item.files?.[0]).toMatchObject({ path: "lib/neon.ts", type: "registry:lib" });
    // shadcn wraps values like "220 14% 96%" in hsl(); channel triplets have no %, so they're left alone.
    expect(item.cssVars.light["neon-accent"]).not.toContain("%");

    const stock = registryItem(stockTheme);
    expect(stock.files).toBeUndefined();
    expect(stock.cssVars.theme).toBeUndefined();
  });

  it("quotes the install URL only when it has a query", () => {
    expect(installCommand(stockTheme)).toMatch(/^npx shadcn@latest add https:\/\/\S+\/r\/theme$/);
    expect(installCommand(custom)).toMatch(/^npx shadcn@latest add "https:\/\/\S+\/r\/theme\?p=.+&m=reduced"$/);
    expect(shareUrl(custom)).toContain("/theme?p=brand.00ffaa");
  });
});

describe("desk", () => {
  function Harness({ initial = stockTheme }: { initial?: Theme }) {
    const [theme, setTheme] = React.useState(initial);
    return (
      <>
        <Channels theme={theme} update={setTheme} />
        <Master theme={theme} update={setTheme} stock={false} onStockChange={() => {}} />
        <output data-testid="qs">{encodeTheme(theme)}</output>
      </>
    );
  }

  it("moves through the palette with the arrow keys, one tab stop", () => {
    render(<Harness />);
    const tubes = screen.getAllByRole("button", { name: /#[0-9a-f]{6}/ });
    expect(tubes).toHaveLength(11);
    expect(tubes.filter((t) => t.tabIndex === 0)).toHaveLength(1);
    tubes[0].focus();
    fireEvent.keyDown(tubes[0], { key: "ArrowRight" });
    expect(document.activeElement).toBe(tubes[1]);
    fireEvent.keyDown(tubes[1], { key: "End" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Add a color" }));
    expect(screen.getByRole("button", { name: /cyan, #22d3ee, default accent/ })).toBeTruthy();
  });

  it("drives glow and corners from the keyboard and lands in the query string", () => {
    render(<Harness />);
    const glow = screen.getByRole("slider", { name: "Glow intensity" });
    fireEvent.keyDown(glow, { key: "ArrowDown" });
    fireEvent.keyDown(glow, { key: "ArrowDown" });
    const corners = screen.getByRole("slider", { name: "Corner radius" });
    fireEvent.keyDown(corners, { key: "ArrowRight" });
    expect(screen.getByTestId("qs").textContent).toBe("g=90&r=105");
    fireEvent.click(screen.getByRole("radio", { name: "Off" }));
    expect(screen.getByTestId("qs").textContent).toBe("g=90&r=105&m=off");
  });
});

