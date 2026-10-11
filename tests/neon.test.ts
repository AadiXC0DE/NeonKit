import { describe, expect, it } from "vitest";
import { neonColorNames, neonColors, neonVars, toNeonRgb } from "@/lib/neon";

function luminance(rgb: string) {
  const [r, g, b] = rgb.split(" ").map((n) => {
    const c = Number(n) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("toNeonRgb", () => {
  it("resolves palette names", () => {
    expect(toNeonRgb("cyan")).toBe("34 211 238");
  });

  it("parses 6 and 3 digit hex, with or without #", () => {
    expect(toNeonRgb("#ff6a00")).toBe("255 106 0");
    expect(toNeonRgb("ff6a00")).toBe("255 106 0");
    expect(toNeonRgb("#0fa")).toBe("0 255 170");
  });

  it("falls back to cyan for garbage", () => {
    expect(toNeonRgb("not-a-color")).toBe(neonColors.cyan);
  });
});

describe("neonVars", () => {
  it("passes style through untouched when no color is given", () => {
    const style = { opacity: 0.5 };
    expect(neonVars(undefined, style)).toBe(style);
  });

  it("sets both the component and the inherited variable", () => {
    expect(neonVars("lime")).toMatchObject({ "--neon": "163 230 53", "--neon-accent": "163 230 53" });
  });

  it("lets explicit style win", () => {
    expect(neonVars("lime", { color: "red" })).toMatchObject({ color: "red" });
  });
});

describe("palette", () => {
  // Contrast is symmetric: this covers dark text on a solid fill and neon
  // text on the page background.
  it.each(neonColorNames)("%s keeps 4.5:1 against #05060a", (name) => {
    expect(contrast(neonColors[name], "5 6 10")).toBeGreaterThanOrEqual(4.5);
  });
});
