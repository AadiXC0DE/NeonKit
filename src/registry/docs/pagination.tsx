import type { ComponentDoc } from "../types";
import PaginationDemo from "../examples/pagination/demo";
import PaginationCompact from "../examples/pagination/compact";
import PaginationSizes from "../examples/pagination/sizes";
import PaginationLinks from "../examples/pagination/links";

export const doc: ComponentDoc = {
  usage: `import { Pagination } from "@/components/ui/pagination"

<Pagination pageCount={24} page={page} onPageChange={setPage} />`,
  examples: [
    {
      name: "demo",
      title: "Audit log",
      description:
        "The lit pill glides to the page you pick. Mid-range it stays centered while the numbers roll over, and the control keeps its width. Below sm it switches to the compact layout.",
      component: PaginationDemo,
    },
    {
      name: "compact",
      title: "Compact",
      description: 'variant="compact" shows "Page 3 of 12" between the arrows. The number rolls in the direction you moved.',
      component: PaginationCompact,
    },
    {
      name: "sizes",
      title: "Sizes",
      description: "32, 40 and 48 px, matching Button and Input.",
      component: PaginationSizes,
    },
    {
      name: "links",
      title: "Links",
      description:
        "Pass getHref and every page becomes a real link, so it works without JavaScript and opens in a new tab. siblingCount widens the window.",
      component: PaginationLinks,
    },
  ],
  api: [
    {
      name: "Pagination",
      description: 'Renders a nav labelled "Pagination" and accepts every native attribute.',
      props: [
        { prop: "pageCount", type: "number", description: "Total number of pages. Values below 1 count as 1." },
        { prop: "page", type: "number", description: "Current page (1-based) when controlled." },
        { prop: "defaultPage", type: "number", default: "1", description: "Initial page when uncontrolled." },
        { prop: "onPageChange", type: "(page: number) => void", description: "Called with the new page when the user picks one." },
        { prop: "siblingCount", type: "number", default: "1", description: "Pages shown on each side of the current one." },
        { prop: "boundaryCount", type: "number", default: "1", description: "Pages always shown at the start and the end." },
        {
          prop: "getHref",
          type: "(page: number) => string",
          description: "Render links instead of buttons. Plain clicks still call onPageChange; modified clicks are left to the browser.",
        },
        {
          prop: "variant",
          type: '"default" | "compact"',
          description: "Unset: page numbers from sm up and the compact layout below it. Set it to pin one layout.",
        },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Control height: 32, 40 or 48 px." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "aria-label", type: "string", default: '"Pagination"', description: "Name of the navigation landmark. Give each one a distinct name when a page has several." },
      ],
    },
  ],
  notes: [
    'The control is a nav landmark named "Pagination"; the current page has aria-current="page".',
    'Previous and next are labelled "Previous page" and "Next page" and are disabled at the ends. As links, they drop their href and set aria-disabled.',
    'Page buttons are named "Page 3" and so on. The ellipsis is hidden from screen readers and is not focusable.',
    "When the window slides after you pick a page, focus follows that page to its new slot.",
    'The compact layout announces "Page 3 of 12" through a polite live region when the page changes.',
    "With reduced motion the indicator and the numbers jump instead of gliding.",
  ],
};
