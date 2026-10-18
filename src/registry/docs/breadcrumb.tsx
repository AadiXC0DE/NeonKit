import type { ComponentDoc } from "../types";
import BreadcrumbDemo from "../examples/breadcrumb/demo";
import BreadcrumbCollapsed from "../examples/breadcrumb/collapsed";
import BreadcrumbFilePath from "../examples/breadcrumb/file-path";

export const doc: ComponentDoc = {
  usage: `import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Settings</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`,
  examples: [
    {
      name: "demo",
      title: "Page header",
      description: "Links stay quiet; the current page is the one lit softly.",
      component: BreadcrumbDemo,
    },
    {
      name: "collapsed",
      title: "Collapsed trail",
      description:
        "With maxItems, the first item and the last few stay and the middle folds into an ellipsis. Clicking it expands the trail in place.",
      component: BreadcrumbCollapsed,
    },
    {
      name: "file-path",
      title: "File path",
      description:
        "Slash separators, a mono font and asChild buttons. Moving deeper or back up collapses the trail again once it outgrows maxItems.",
      component: BreadcrumbFilePath,
    },
  ],
  api: [
    {
      name: "Breadcrumb",
      description: 'Renders a nav labelled "Breadcrumb" and accepts every native attribute.',
      props: [
        {
          prop: "maxItems",
          type: "number",
          description:
            "Collapse the trail when it has more items than this (minimum 2). The first item and the last maxItems − 1 stay visible.",
        },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "aria-label", type: "string", default: '"Breadcrumb"', description: "Name of the navigation landmark." },
      ],
    },
    {
      name: "BreadcrumbList",
      description:
        "Renders an ol that wraps on narrow screens. Put BreadcrumbItem and BreadcrumbSeparator directly inside it (fragments are fine) so it can collapse them.",
      props: [{ prop: "className", type: "string", description: "Classes for the list, e.g. a mono font for paths." }],
    },
    {
      name: "BreadcrumbItem",
      description: "Renders an li around one link or the current page.",
      props: [{ prop: "className", type: "string", description: "Classes for the list item." }],
    },
    {
      name: "BreadcrumbLink",
      description: "Renders an a. Icons inside are sized to the text.",
      props: [
        { prop: "href", type: "string", description: "Where the crumb goes." },
        {
          prop: "asChild",
          type: "boolean",
          default: "false",
          description: "Merge the link styles onto the single child, such as your router's Link or a button.",
        },
      ],
    },
    {
      name: "BreadcrumbPage",
      description: 'The current page. Renders a span with aria-current="page".',
      props: [{ prop: "className", type: "string", description: "Classes for the span." }],
    },
    {
      name: "BreadcrumbSeparator",
      description: "Renders a presentational li, hidden from screen readers.",
      props: [{ prop: "children", type: "ReactNode", default: "chevron", description: "Replaces the chevron, e.g. a slash." }],
    },
    {
      name: "BreadcrumbEllipsis",
      description:
        "The button that maxItems renders. Exported for building your own overflow, e.g. as a menu trigger.",
      props: [
        { prop: "aria-label", type: "string", default: '"Show more"', description: "Accessible name for the icon button." },
        { prop: "children", type: "ReactNode", default: "ellipsis icon", description: "Replaces the icon." },
      ],
    },
  ],
  notes: [
    'The trail is an ordered list inside a nav landmark named "Breadcrumb".',
    'The current page carries aria-current="page" and is not a link.',
    "Separators are presentational and hidden from screen readers, so the list reads as its links only.",
    'The collapse button is named for what it reveals, such as "Show 3 more items". After expanding, focus moves to the first revealed link.',
    "Revealed items slide in with a short stagger; with reduced motion they appear at once.",
  ],
};
