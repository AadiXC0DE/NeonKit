import type { ComponentDoc } from "../types";
import TreeViewDemo from "../examples/tree-view/demo";
import TreeViewLazy from "../examples/tree-view/lazy";
import TreeViewMultiple from "../examples/tree-view/multiple";

export const doc: ComponentDoc = {
  usage: `import { TreeView, type TreeNode } from "@/components/ui/tree-view"

const files: TreeNode[] = [
  { id: "app", label: "app", children: [{ id: "app/page.tsx", label: "page.tsx" }] },
  { id: "package.json", label: "package.json" },
]

<TreeView aria-label="Files" data={files} defaultExpanded={["app"]} />`,
  examples: [
    {
      name: "demo",
      title: "File explorer",
      description:
        "Single selection with git status in the meta slot. The guide of the branch you're in lights up, with a short tick to the active file.",
      component: TreeViewDemo,
    },
    {
      name: "lazy",
      title: "Lazy folders",
      description: "isBranch nodes fetch their children with loadChildren on first open. One prefix fails to show the error row.",
      component: TreeViewLazy,
    },
    {
      name: "multiple",
      title: "Multiple selection",
      description: "Cmd or Ctrl-click toggles, Shift-click selects a range, Space toggles and Shift+Arrow extends.",
      component: TreeViewMultiple,
    },
  ],
  api: [
    {
      name: "TreeView",
      description: "Renders a ul with role=\"tree\". Give it an aria-label. Accepts every native ul attribute.",
      props: [
        { prop: "data", type: "TreeNode[]", description: "The nodes. A node is a branch when it has children or isBranch." },
        { prop: "selectionMode", type: '"single" | "multiple" | "none"', default: '"single"', description: "How many nodes can be selected. None leaves aria-selected off." },
        { prop: "selected", type: "string[]", description: "Selected ids when controlled." },
        { prop: "defaultSelected", type: "string[]", description: "Initial selection when uncontrolled." },
        { prop: "onSelectedChange", type: "(ids: string[]) => void", description: "Called with the new selection." },
        { prop: "expanded", type: "string[]", description: "Open branch ids when controlled." },
        { prop: "defaultExpanded", type: "string[]", description: "Initially open branches." },
        { prop: "onExpandedChange", type: "(ids: string[]) => void", description: "Called when a branch opens or closes." },
        { prop: "loadChildren", type: "(node: TreeNode) => Promise<TreeNode[]>", description: "Fetches a branch's children the first time it opens. Results are cached; a rejection shows an error row and reopening retries." },
        { prop: "onAction", type: "(node: TreeNode) => void", description: "A leaf was clicked or Enter was pressed on it." },
        { prop: "showIcons", type: "boolean", default: "true", description: "Folder and file icons. Nodes can bring their own." },
        { prop: "indent", type: "number", default: "16", description: "Pixels per level." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "TreeNode",
      description: "A plain object.",
      props: [
        { prop: "id", type: "string", description: "Unique across the tree." },
        { prop: "label", type: "ReactNode", description: "What the row shows." },
        { prop: "textValue", type: "string", description: "Text for typeahead when the label isn't a string." },
        { prop: "icon", type: "ReactNode", description: "Replaces the folder or file icon." },
        { prop: "children", type: "TreeNode[]", description: "Child nodes. An empty array shows an empty folder." },
        { prop: "isBranch", type: "boolean", description: "A branch whose children come from loadChildren." },
        { prop: "disabled", type: "boolean", description: "Skipped by the keyboard and can't be selected." },
        { prop: "meta", type: "ReactNode", description: "Trailing content: a count, a size, a status letter." },
      ],
    },
  ],
  notes: [
    "Follows the APG tree pattern: one Tab stop, Up and Down between visible nodes, Right opens or enters a branch, Left closes or goes to the parent.",
    "Home and End jump to the first and last visible node. Typing jumps to the next node starting with those letters; repeating a letter cycles.",
    "* opens every sibling of the focused node.",
    "Enter opens or closes a branch and activates a leaf. Space selects; in multiple mode it toggles, and Ctrl or Cmd+A selects everything visible.",
    "Every node has aria-level, aria-setsize and aria-posinset; branches have aria-expanded, and a loading branch is aria-busy.",
    "Closed branches are hidden from assistive tech and focus once their collapse animation ends. Reduced motion skips the animation.",
  ],
};
