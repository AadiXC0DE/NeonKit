import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { Anatomy } from "@/components/landing/anatomy";
import { Install } from "@/components/landing/install";
import { featured, shelfPicks } from "@/components/landing/shelf-data";
import { Shelves } from "@/components/landing/shelves";
import { Lights } from "@/components/landing/lights";
import { parts } from "@/components/landing/parts";
import { SiteFooter } from "@/components/site/site-footer";
import { blocks, categories, registry, templates } from "@/registry";

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

describe("Shelves", () => {
  const lookup = Object.fromEntries(
    registry.map(({ slug, name, description, category }) => [slug, { slug, name, description, category }]),
  );
  const shelves = categories
    .filter((category) => shelfPicks[category])
    .map((category) => ({ category, count: registry.filter((item) => item.category === category).length }));

  it("only features and picks real components from their own shelf", () => {
    for (const slug of featured) expect(lookup[slug]).toBeDefined();
    for (const [category, slugs] of Object.entries(shelfPicks)) {
      for (const slug of slugs) expect(lookup[slug]?.category).toBe(category);
    }
  });

  it("switches the open shelf and links it to its category on /components", { timeout: 20_000 }, () => {
    render(
      <Shelves
        total={registry.length}
        shelves={shelves}
        lookup={lookup}
        reels={[{ href: "/templates/saas", src: "/preview/saas", name: "SaaS landing", meta: "Template" }]}
        blockCount={blocks.length}
        templateCount={templates.length}
      />,
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(`${registry.length} components`);
    fireEvent.click(screen.getByRole("button", { name: /^Instruments/ }));
    expect(screen.getByRole("button", { name: /^Instruments/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("link", { name: "Open Instruments" })).toHaveAttribute("href", "/components#instruments");
    for (const slug of shelfPicks.Instruments) {
      expect(document.querySelector(`#shelf-stage a[href="/components/${slug}"]`)).not.toBeNull();
    }
    expect(document.querySelectorAll("img")).toHaveLength(0);
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
    const steps = screen.getAllByRole("heading", { level: 3 });
    expect(steps.map((step) => step.textContent?.replace(/^\d/, ""))).toEqual([
      "Step 1: Run the command",
      "Step 2: Import it",
      "Step 3: It's yours",
    ]);
    expect(screen.getByText(/\/r\/switch\.json$/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "knob" }));
    expect(screen.getByText(/\/r\/knob\.json$/)).toBeInTheDocument();
    expect(screen.getByText("knob.tsx")).toBeInTheDocument();
    expect(screen.getByText('"@/components/ui/knob"')).toBeInTheDocument();
  });
});

describe("SiteFooter", () => {
  it("groups every link the owner asked for", () => {
    render(<SiteFooter />);
    for (const name of [
      "Components",
      "Blocks",
      "Templates",
      "Icons",
      "Changelog",
      "Installation",
      "GitHub",
      "X",
      "Request a component",
      "Report a bug",
      "Sponsor",
      "GitHub Sponsors",
      "MIT license",
    ]) {
      expect(screen.getAllByRole("link", { name }).length).toBeGreaterThan(0);
    }
    expect(screen.getAllByRole("link", { name: "Buy me a coffee" })).toHaveLength(2);
    expect(screen.getByText("If NeonKit saved you a week, buy a coffee.")).toBeInTheDocument();
  });
});
