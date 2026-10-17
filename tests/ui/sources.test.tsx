import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Citation, SourceList, Sources, type Source } from "@/components/ui/sources";

const SOURCES: Source[] = [
  {
    title: "Date and Time on the Internet: Timestamps",
    url: "https://www.rfc-editor.org/rfc/rfc3339",
    meta: "RFC 3339",
    date: "2002-07",
    snippet: "A profile of ISO 8601.",
  },
  {
    title: "8.5. Date/Time Types",
    url: "https://www.postgresql.org/docs/17/datatype-datetime.html",
    date: "2024-09-26",
    snippet: "The internally stored value is always in UTC.",
  },
  { title: "Issue 2141", url: "https://github.com/brianc/node-postgres/issues/2141" },
  { title: "toISOString", url: "https://developer.mozilla.org/x" },
  { title: "Don't Do This", url: "https://wiki.postgresql.org/wiki/Don%27t_Do_This" },
];

function Answer(props: { variant?: "list" | "chips"; max?: number }) {
  return (
    <Sources sources={SOURCES}>
      <p>
        Stored as UTC
        <Citation index={2} />.
      </p>
      <SourceList {...props} />
    </Sources>
  );
}

describe("Sources", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("names each citation after its source and links to it", () => {
    render(<Answer />);
    const marker = screen.getByRole("link", { name: "Source 2: 8.5. Date/Time Types (postgresql.org)" });
    expect(marker).toHaveAttribute("href", SOURCES[1].url);
    expect(marker).toHaveAttribute("target", "_blank");
    expect(marker).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("lists title, domain, meta and a hand-formatted date", () => {
    render(<Answer />);
    const list = screen.getByRole("list", { name: "Sources" });
    expect(list.tagName).toBe("OL");
    expect(screen.getByText("Jul 2002")).toHaveAttribute("dateTime", "2002-07");
    expect(screen.getByText("Sep 26, 2024")).toBeInTheDocument();
    expect(screen.getByText("rfc-editor.org")).toBeInTheDocument();
    expect(screen.getByText("RFC 3339")).toBeInTheDocument();
  });

  it("lights the cited source while its marker is hovered, and the marker while its source is", () => {
    render(<Answer />);
    const marker = screen.getByRole("link", { name: /^Source 2/ });
    const row = screen.getAllByRole("link").find((link) => link.closest("li") && link.textContent?.includes("8.5."))!;

    fireEvent.pointerEnter(marker, { pointerType: "mouse" });
    expect(row).toHaveAttribute("data-lit");
    fireEvent.pointerLeave(marker, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(400));
    expect(row).not.toHaveAttribute("data-lit");

    fireEvent.pointerEnter(row, { pointerType: "mouse" });
    expect(marker).toHaveAttribute("data-lit");
    fireEvent.pointerLeave(row, { pointerType: "mouse" });
    expect(marker).not.toHaveAttribute("data-lit");
  });

  it("previews the source on hover and describes the marker with it", () => {
    render(<Answer />);
    const marker = screen.getByRole("link", { name: /^Source 2/ });
    fireEvent.pointerEnter(marker, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(300));
    const preview = screen.getAllByText("The internally stored value is always in UTC.").find((el) => el.tagName === "P")!;
    expect(preview).toBeInTheDocument();
    expect(marker.getAttribute("aria-describedby")).toBe(preview.closest("[id]")!.id);
  });

  it("uses quote over the snippet in the preview", () => {
    render(<Citation index={1} source={SOURCES[0]} quote="The exact passage." />);
    const marker = screen.getByRole("link", { name: /^Source 1/ });
    fireEvent.pointerEnter(marker, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByText("The exact passage.")).toBeInTheDocument();
    expect(screen.queryByText("A profile of ISO 8601.")).toBeNull();
  });

  it("renders an unlinked marker when the source is missing", () => {
    render(
      <Sources sources={SOURCES}>
        <Citation index={9} />
      </Sources>,
    );
    const marker = screen.getByLabelText("Source 9");
    expect(marker).not.toHaveAttribute("href");
  });

  it("collapses chips past max behind a +n button that reveals them and moves focus", () => {
    render(<Answer variant="chips" max={3} />);
    const chips = () => screen.getByRole("list", { name: "Sources" }).querySelectorAll("li > a");
    expect(chips()).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: "Show 2 more sources" }));
    expect(chips()).toHaveLength(5);
    act(() => vi.advanceTimersByTime(20));
    expect(screen.queryByRole("button", { name: /more sources/ })).toBeNull();
  });

  it("names chips by their source", () => {
    render(<Answer variant="chips" />);
    expect(screen.getByRole("link", { name: "Source 3: Issue 2141 (github.com)" })).toBeInTheDocument();
  });
});
