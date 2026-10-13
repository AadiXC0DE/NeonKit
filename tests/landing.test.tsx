import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { Anatomy } from "@/components/landing/anatomy";
import { demoLoaders } from "@/components/landing/catalog-demos";
import { Install } from "@/components/landing/install";
import { Library } from "@/components/landing/library";
import { Lights } from "@/components/landing/lights";
import { parts } from "@/components/landing/parts";
import { SiteFooter } from "@/components/site/site-footer";
import { blocks, registry, templates } from "@/registry";

beforeAll(() => {
  class Observer {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  globalThis.IntersectionObserver ??= Observer as unknown as typeof IntersectionObserver;
  globalThis.ResizeObserver ??= Observer as unknown as typeof ResizeObserver;
});

describe("catalog demos", () => {
  it("has a lazy demo for every component and nothing else", () => {
    expect(Object.keys(demoLoaders).sort()).toEqual(registry.map((item) => item.slug).sort());
  });
});

describe("Library", () => {
  it("links every component, block and template once", { timeout: 20_000 }, () => {
    render(<Library />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    for (const item of registry) {
      expect(document.querySelectorAll(`a[href="/components/${item.slug}"]`)).toHaveLength(1);
    }
    expect(within(screen.getByRole("list", { name: "Blocks" })).getAllByRole("link")).toHaveLength(blocks.length);
    expect(within(screen.getByRole("list", { name: "Templates" })).getAllByRole("link")).toHaveLength(templates.length);
  });
});

describe("Lights", () => {
  it("starts off and lights up from the switch", () => {
    render(<Lights />);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
    const lights = screen.getByRole("switch", { name: "Lights" });
    expect(lights).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText(/Every part at rest/)).toBeInTheDocument();
    fireEvent.click(lights);
    expect(lights).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText(/Five things lit/)).toBeInTheDocument();
  });

  it("names five real components", () => {
    expect(parts).toHaveLength(5);
    for (const part of parts) expect(registry.some((item) => item.slug === part.slug)).toBe(true);
  });
});

describe("Anatomy", () => {
  it("annotates all six layers next to a real switch", () => {
    render(<Anatomy />);
    for (const name of ["Focus ring", "Thumb", "Tube", "Halo", "Track", "The element"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    const real = screen.getByRole("switch", { name: "Try the switch" });
    fireEvent.click(real);
    expect(real).toHaveAttribute("aria-checked", "false");
  });
});

describe("Install", () => {
  it("swaps the command, the file and the usage together", () => {
    render(<Install />);
    expect(screen.getByText("/r/switch.json")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "knob" }));
    expect(screen.getByText("/r/knob.json")).toBeInTheDocument();
    expect(screen.getByText("knob.tsx")).toBeInTheDocument();
    expect(screen.getByText('"@/components/ui/knob"')).toBeInTheDocument();
  });
});

describe("SiteFooter", () => {
  it("states the real counts and links them", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("link", { name: `${registry.length} components` })).toHaveAttribute("href", "/components");
    expect(screen.getByRole("link", { name: `${blocks.length} blocks` })).toHaveAttribute("href", "/blocks");
    expect(screen.getByRole("link", { name: `${templates.length} templates` })).toHaveAttribute("href", "/templates");
  });
});
