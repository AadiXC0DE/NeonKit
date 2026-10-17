import * as React from "react";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as Icons from "@/components/ui/icons";
import { Check, CheckCircle, CircleCheck, Home, House, icons, type Icon } from "@/components/ui/icons";
import IconsBrowser from "@/registry/examples/icons/demo";

const components = Object.entries(Icons).filter(([name]) => name !== "createIcon" && name !== "icons") as [string, Icon][];
const svgOf = (el: React.ReactElement) => render(el).container.querySelector("svg")!;

describe("icons", () => {
  it.each(components)("%s renders a 24-unit svg", (name, Component) => {
    const svg = svgOf(<Component />);
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("stroke", "currentColor");
    expect(svg).toHaveAttribute("stroke-width", "1.75");
    expect(svg).toHaveAttribute("fill", "none");
    expect(svg.querySelector("path")?.getAttribute("d")).toMatch(/^M/);
    expect(svg.getAttribute("class")).toMatch(/^nk-icon nk-icon-[a-z0-9-]+$/);
    expect(Component.displayName).toBeTruthy();
    void name;
  });

  it("exports every icon the library, blocks, templates and site import", () => {
    const root = path.resolve(__dirname, "../..");
    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
        entry.isDirectory() ? walk(path.join(dir, entry.name)) : /\.tsx?$/.test(entry.name) ? [path.join(dir, entry.name)] : [],
      );
    const used = new Set<string>();
    for (const file of [...walk(path.join(root, "src")), ...walk(path.join(root, "app"))]) {
      for (const match of readFileSync(file, "utf8").matchAll(/import\s*\{([^}]*)\}\s*from\s*"@\/components\/ui\/icons"/g)) {
        for (const spec of match[1].split(",")) {
          const name = spec.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0];
          // Types (Icon, IconProps, LucideIcon…) have no runtime export to check.
          if (name && !/^(Icon|IconProps|IconNode|LucideIcon|LucideProps)$/.test(name)) used.add(name);
        }
      }
    }
    expect(used.size).toBeGreaterThan(100);
    expect([...used].filter((name) => !(name in Icons))).toEqual([]);
  });

  it("exports the extra names the newer components use", () => {
    const extra =
      "FilePen ArrowRightLeft WrapText CloudUpload FileHeadphone FileSpreadsheet FileVideoCamera TextAlignCenter TextAlignEnd TextAlignStart LocateFixed Box LayoutDashboard CopyPlus PencilLine Music2 NotebookPen SquareTerminal Hand MousePointer2 PenTool Shapes Type ChartNoAxesColumn FolderKanban PlugZap MessageCircle SearchX Laptop GitMerge ListMusic Newspaper Map MapIcon RefreshCcw UserRoundCheck Music MessageSquare Mouse MousePointer ShoppingCart Gift Trophy Sparkles Target TrendingUp TrendingDown Percent DollarSign Euro Ticket Camera Film Tv Navigation Compass Building Store Briefcase GraduationCap Code2 Bug TestTube Flame Snowflake Thermometer Droplet Wind".split(" ");
    expect(extra.filter((name) => !(name in Icons))).toEqual([]);
    expect(Icons.MapIcon).toBe(Icons.Map);
  });

  it("aliases point at the same component", () => {
    expect(CheckCircle).toBe(CircleCheck);
    expect(Home).toBe(House);
    expect(Object.values(icons)).toContain(CircleCheck);
    expect(Object.keys(icons)).not.toContain("CheckCircle");
  });

  it("applies size and strokeWidth", () => {
    const svg = svgOf(<Check size={16} strokeWidth={2} />);
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
    expect(svg).toHaveAttribute("stroke-width", "2");
  });

  it("keeps the stroke in pixels with absoluteStrokeWidth", () => {
    expect(svgOf(<Check size={48} strokeWidth={2} absoluteStrokeWidth />)).toHaveAttribute("stroke-width", "1");
    expect(svgOf(<Check size={12} absoluteStrokeWidth />)).toHaveAttribute("stroke-width", "3.5");
    expect(svgOf(<Check size="1em" absoluteStrokeWidth />)).toHaveAttribute("stroke-width", "1.75");
  });

  it("merges className after its own classes", () => {
    const svg = svgOf(<Check className="text-red-500" />);
    expect(svg).toHaveAttribute("class", "nk-icon nk-icon-check text-red-500");
    expect(svgOf(<Icons.ArrowUpRight />)).toHaveAttribute("class", "nk-icon nk-icon-arrow-up-right");
    expect(svgOf(<Icons.Building2 />)).toHaveAttribute("class", "nk-icon nk-icon-building-2");
  });

  it("is hidden from assistive tech unless labelled", () => {
    expect(svgOf(<Check />)).toHaveAttribute("aria-hidden", "true");
    const labelled = svgOf(<Check aria-label="Done" />);
    expect(labelled).not.toHaveAttribute("aria-hidden");
    expect(labelled).toHaveAttribute("role", "img");
    expect(labelled).toHaveAttribute("aria-label", "Done");
    const titled = svgOf(<Check title="Done" />);
    expect(titled).not.toHaveAttribute("aria-hidden");
    expect(titled.querySelector("title")?.textContent).toBe("Done");
  });

  it("forwards refs, color and other svg props", () => {
    const ref = React.createRef<SVGSVGElement>();
    const svg = svgOf(<Check ref={ref} color="red" data-x="1" />);
    expect(ref.current).toBe(svg);
    expect(svg).toHaveAttribute("stroke", "red");
    expect(svg).toHaveAttribute("data-x", "1");
  });

  it("builds custom icons with createIcon", () => {
    const Dot = Icons.createIcon("CustomDot", ["M12 12h.01"]);
    const svg = svgOf(<Dot />);
    expect(Dot.displayName).toBe("CustomDot");
    expect(svg).toHaveAttribute("class", "nk-icon nk-icon-custom-dot");
  });

  it("breaks a tube wherever another passes in front of it", () => {
    const runs = (Glyph: Icon) => (svgOf(<Glyph />).querySelector("path")!.getAttribute("d")!.match(/M/g) ?? []).length;
    // Calendar: the frame's top tube breaks around both binder rings (2 frame pieces, 2 rings, the header line).
    expect(runs(Icons.Calendar)).toBe(5);
    // Table: the row line breaks around the column divider (frame, header, 2 row pieces, divider).
    expect(runs(Icons.Table)).toBe(5);
    // Link: each ring passes behind the other once.
    expect(runs(Icons.Link)).toBe(2);
  });
});

describe("icon browser", () => {
  const options = () => screen.getAllByRole("option").map((option) => option.getAttribute("data-icon"));

  it("files every icon in exactly one set", () => {
    render(<IconsBrowser />);
    const shown = options();
    expect(shown).toHaveLength(Object.keys(icons).length);
    expect(new Set(shown).size).toBe(shown.length);
    expect([...shown].sort()).toEqual(Object.keys(icons).sort());
  });

  it("searches from the start of a word", () => {
    render(<IconsBrowser />);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search icons" }), { target: { value: "cal" } });
    expect(options()).toEqual(["Calendar", "CalendarDays", "CalendarPlus"]);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search icons" }), { target: { value: "up down" } });
    expect(options()).toEqual(expect.arrayContaining(["ArrowUpDown", "ChevronsUpDown"]));
  });

  it("moves the selection with the arrow keys and keeps one tab stop", () => {
    render(<IconsBrowser />);
    const list = screen.getByRole("listbox", { name: "Icons" });
    const selected = () => within(list).getByRole("option", { selected: true });
    expect(selected()).toHaveAttribute("data-icon", "Command");
    expect(within(list).getAllByRole("option").filter((option) => option.tabIndex === 0)).toHaveLength(1);
    fireEvent.keyDown(selected(), { key: "ArrowRight" });
    expect(selected()).toHaveAttribute("data-icon", "LayoutGrid");
    expect(selected()).toHaveFocus();
    fireEvent.keyDown(selected(), { key: "Home" });
    expect(selected()).toHaveAttribute("data-icon", "ArrowUp");
  });

  it("focuses search on slash unless you are typing", () => {
    render(<IconsBrowser />);
    fireEvent.keyDown(document.body, { key: "/" });
    expect(screen.getByRole("searchbox", { name: "Search icons" })).toHaveFocus();
  });
});

