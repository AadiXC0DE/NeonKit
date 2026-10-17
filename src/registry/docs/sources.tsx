import type { ComponentDoc } from "../types";
import SourcesDemo from "../examples/sources/demo";
import SourcesChips from "../examples/sources/chips";
import SourcesQuotes from "../examples/sources/quotes";
import SourcesList from "../examples/sources/list";

export const doc: ComponentDoc = {
  usage: `import { Citation, SourceList, Sources } from "@/components/ui/sources"

<Sources sources={sources}>
  <p>Postgres stores timestamptz as UTC<Citation index={2} />.</p>
  <SourceList />
</Sources>`,
  examples: [
    {
      name: "demo",
      title: "Cited answer",
      description:
        "Hover or tab to a marker: it lights, its source lights in the list below, and a preview opens with the passage and the address. Hovering a source lights every marker that cites it.",
      component: SourcesDemo,
    },
    {
      name: "chips",
      title: "Compact chips",
      description:
        "variant=\"chips\" keeps the list to one row of domains. Each chip previews its source on hover, and max folds the rest behind a +2 that moves focus to the first one it reveals.",
      component: SourcesChips,
    },
    {
      name: "quotes",
      title: "Quoting the passage",
      description:
        "quote replaces the source's snippet for one citation, so two markers on the same page can each show the sentence they rest on. Both markers for source 1 light together.",
      component: SourcesQuotes,
    },
    {
      name: "list",
      title: "List on its own",
      description: "SourceList takes sources directly when there are no inline markers.",
      component: SourcesList,
    },
  ],
  api: [
    {
      name: "Sources",
      description: "Holds the sources for every Citation and SourceList inside it and links their light. Renders a div.",
      props: [
        {
          prop: "sources",
          type: "Source[]",
          description: "In citation order: index 1 is the first. A Source is { title, url, domain?, snippet?, date?, meta? }.",
        },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "Source",
      props: [
        { prop: "title", type: "string", description: "The page or document title." },
        { prop: "url", type: "string", description: "Where the marker and list item link. http(s) links open in a new tab." },
        { prop: "domain", type: "string", default: "url host", description: "Shown instead of the host, without www." },
        { prop: "snippet", type: "string", description: "A passage from the page. Two lines in the list, four in the preview." },
        { prop: "date", type: "string", description: "ISO date, 2024-09-26, or 2002-07 for a month. Printed as Sep 26, 2024 or Jul 2002." },
        { prop: "meta", type: "string", description: "A short qualifier after the domain: RFC 9110, Issue #2141, PostgreSQL 17." },
      ],
    },
    {
      name: "Citation",
      description: "An anchor. Other anchor attributes pass through.",
      props: [
        { prop: "index", type: "number", description: "1-based position in the surrounding sources." },
        { prop: "source", type: "Source", description: "The source, when the citation isn't inside Sources." },
        { prop: "quote", type: "string", description: "The passage this claim rests on. Replaces the snippet in the preview." },
        { prop: "preview", type: "boolean", default: "true", description: "Open a preview card on hover and keyboard focus." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex." },
      ],
    },
    {
      name: "SourceList",
      description: "An ordered list. Other list attributes pass through.",
      props: [
        { prop: "variant", type: '"list" | "chips"', default: '"list"', description: "list prints title, domain, date and snippet. chips prints the domain and previews the rest." },
        { prop: "sources", type: "Source[]", description: "The sources, when the list isn't inside Sources." },
        { prop: "max", type: "number", description: "Chips only: how many to show before a +n button." },
        { prop: "label", type: "string", default: '"Sources"', description: "Accessible name of the list." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex." },
      ],
    },
  ],
  notes: [
    "Each marker is a link named after its source, \"Source 2: 8.5. Date/Time Types (postgresql.org)\", so a screen reader reads more than a number.",
    "Tab to a marker to open its preview; the open card describes the marker through aria-describedby, and Escape closes it.",
    "Markers are inline text set directly after the word, so a number never starts a line on its own.",
    "The list is an <ol>, so its numbers match the markers for people who can't see the plates.",
    "Light is state only: a marker, its plate in the list and its row light while either is hovered or focused, and decay over 300ms.",
  ],
};
