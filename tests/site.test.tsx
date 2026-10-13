import { fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { AccentPicker } from "@/components/site/accent-picker";
import { AccentScript } from "@/components/site/accent-script";
import { componentCategoryId } from "@/components/site/category-id";
import { ComponentGallery } from "@/components/site/component-gallery";
import { PropsTable, unionMembers } from "@/components/site/props-table";
import { searchEntries, searchFor } from "@/components/site/search";
import { blocks, categories, registry, templates } from "@/registry";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/" }));

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

describe("componentCategoryId", () => {
  it("turns a category into a kebab-case anchor", () => {
    expect(componentCategoryId("Instruments")).toBe("instruments");
    expect(componentCategoryId("Data Display")).toBe("data-display");
    expect(componentCategoryId("AI")).toBe("ai");
  });

  it("gives every category its own anchor", () => {
    const ids = categories.map(componentCategoryId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("ComponentGallery", () => {
  const items = registry.slice(0, 40).map(({ slug, name, category, description }) => ({
    slug,
    name,
    category,
    description,
    isNew: false,
  }));
  const used = categories.filter((category) => items.some((item) => item.category === category));

  it("renders a section per group at its anchor, with a jump link to it", () => {
    const { container } = render(<ComponentGallery items={items} categories={used} previews={{}} />);
    for (const category of used) {
      const id = componentCategoryId(category);
      expect(container.querySelector(`section#${id}`)).not.toBeNull();
      expect(within(screen.getByRole("navigation", { name: "Groups" })).getByRole("link", { name: new RegExp(category) })).toHaveAttribute(
        "href",
        `#${id}`,
      );
    }
  });

  it("links each card once and never nests a link inside another", () => {
    const { container } = render(<ComponentGallery items={items} categories={used} previews={{}} />);
    expect(container.querySelectorAll("a a")).toHaveLength(0);
    for (const item of items) expect(container.querySelectorAll(`a[href="/components/${item.slug}"]`)).toHaveLength(1);
  });

  it("filters by name and says when nothing matches", () => {
    render(<ComponentGallery items={items} categories={used} previews={{}} />);
    const input = screen.getByRole("searchbox", { name: "Filter components" });
    fireEvent.change(input, { target: { value: items[0].name } });
    expect(screen.getByRole("link", { name: items[0].name })).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "zzzz-nothing" } });
    expect(screen.getByText(/Nothing called/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Request it" })).toHaveAttribute("href", "/request");
  });
});

describe("PropsTable", () => {
  it("splits a type at its top-level unions only", () => {
    expect(unionMembers('"sm" | "md" | "lg"')).toEqual(['"sm"', '"md"', '"lg"']);
    expect(unionMembers("(x: string | number) => string")).toEqual(["(x: string | number) => string"]);
    expect(unionMembers("number | (number | { value: number })[]")).toEqual(["number", "(number | { value: number })[]"]);
  });

  it("renders a row per prop with its default, or none", () => {
    render(
      <PropsTable
        rows={[
          { prop: "size", type: '"sm" | "md"', default: '"md"', description: "Height and padding." },
          { prop: "onChange", type: "(value: number) => void", description: "Called with `value` on change." },
        ]}
      />,
    );
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(3);
    expect(within(rows[1]).getByRole("rowheader")).toHaveTextContent("size");
    expect(within(rows[1]).getByText('"md"', { selector: "td code" })).toBeInTheDocument();
    expect(within(rows[2]).getByText("None")).toBeInTheDocument();
    expect(within(rows[2]).getByText("value", { selector: "code" })).toBeInTheDocument();
  });
});

describe("search", () => {
  it("covers the docs, every component, block and template", () => {
    const hrefs = new Set(searchEntries.map((entry) => entry.href));
    for (const item of registry) expect(hrefs).toContain(`/components/${item.slug}`);
    for (const block of blocks) expect(hrefs).toContain(`/blocks/${block.slug}`);
    for (const template of templates) expect(hrefs).toContain(`/templates/${template.slug}`);
    expect(hrefs).toContain("/docs/installation");
  });

  it("ranks a title match above a description match", () => {
    const results = searchFor("gauge");
    expect(results[0].href).toBe("/components/gauge");
    expect(searchFor("")).toHaveLength(searchEntries.length);
    expect(searchFor("qqqzzz")).toHaveLength(0);
  });
});

describe("AccentPicker", () => {
  it("is one tab stop that arrows move through", () => {
    const onChange = vi.fn();
    render(<AccentPicker value="cyan" onChange={onChange} />);
    const radios = screen.getAllByRole("radio");
    expect(radios.filter((radio) => radio.tabIndex === 0)).toHaveLength(1);
    expect(screen.getByRole("radio", { name: "cyan" })).toHaveAttribute("aria-checked", "true");
    fireEvent.keyDown(screen.getByRole("radio", { name: "cyan" }), { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("blue");
  });
});

describe("AccentScript", () => {
  it("runs from the server HTML and stays inert when React renders it in the browser", () => {
    const html = renderToString(<AccentScript />);
    // jsdom has a window, so this is the browser branch: a data block React won't warn about.
    expect(html).toContain('type="text/plain"');
    const { container } = render(<AccentScript />);
    expect(container.querySelector("script")).toHaveAttribute("type", "text/plain");
  });

  it("is a plain script on the server", () => {
    vi.stubGlobal("window", undefined);
    try {
      const html = renderToString(<AccentScript />);
      expect(html).not.toContain("type=");
      expect(html).toContain("neonkit:accent");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
