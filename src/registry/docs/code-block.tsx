import type { ComponentDoc } from "../types";
import CodeBlockDemo from "../examples/code-block/demo";
import CodeBlockDiff from "../examples/code-block/diff";
import CodeBlockLanguages from "../examples/code-block/languages";
import CodeBlockScroll from "../examples/code-block/scroll";
import CodeBlockBare from "../examples/code-block/bare";

export const doc: ComponentDoc = {
  usage: `import { CodeBlock } from "@/components/ui/code-block"

<CodeBlock filename="app/page.tsx" code={source} highlight={[3, 4]} />`,
  examples: [
    {
      name: "demo",
      title: "Several files",
      description:
        "Tabs for each file, arrow keys between them. Highlighted lines light a tube in the gutter; neighbouring lines share one tube.",
      component: CodeBlockDemo,
    },
    {
      name: "diff",
      title: "Diff",
      description:
        "diff reads a leading + or - on each line. Copy gives you the file as it reads after the change, without the removed lines or the markers.",
      component: CodeBlockDiff,
    },
    {
      name: "languages",
      title: "Shell, CSS and JSON",
      description:
        "The built-in tokenizer covers JS, TS, JSX, TSX, HTML, JSON, CSS and shell. startLine numbers an excerpt from where it sits in the file.",
      component: CodeBlockLanguages,
    },
    {
      name: "scroll",
      title: "Max height and wrap",
      description: "Past maxHeight the body scrolls and the line numbers stay put. The wrap toggle folds long lines instead of scrolling sideways.",
      component: CodeBlockScroll,
    },
    {
      name: "bare",
      title: "Without a header",
      description: "header={false} for one-liners in prose. Copy appears on hover and on keyboard focus.",
      component: CodeBlockBare,
    },
  ],
  api: [
    {
      name: "CodeBlock",
      description: "Renders a div and accepts every native div attribute.",
      props: [
        { prop: "code", type: "string", description: "The source. Ignored when files is set. A trailing newline is dropped." },
        {
          prop: "language",
          type: "string",
          default: "from filename",
          description: "tsx, ts, jsx, js, html, json, css, bash, sh or diff. Other values render as plain text with their name in the header.",
        },
        { prop: "filename", type: "string", description: "Shown in the header with its directories dimmed." },
        {
          prop: "files",
          type: "CodeBlockFile[]",
          description: "{ filename, code, language?, highlight?, diff?, startLine? } per tab. The tab value is the filename.",
        },
        { prop: "value", type: "string", description: "Controlled active file." },
        { prop: "defaultValue", type: "string", default: "first file", description: "Initial file when uncontrolled." },
        { prop: "onValueChange", type: "(filename: string) => void", description: "Called when another tab is chosen." },
        {
          prop: "highlight",
          type: "(number | [number, number])[]",
          description: "Line numbers to light, as they're displayed. [3, 4] or [[3, 9]] for a range.",
        },
        { prop: "diff", type: "boolean", default: "false", description: "Treat a leading + or - as added or removed." },
        { prop: "lineNumbers", type: "boolean", default: "true", description: "Show the line number gutter." },
        { prop: "startLine", type: "number", default: "1", description: "Number of the first line." },
        { prop: "wrap", type: "boolean", description: "Controlled word wrap." },
        { prop: "defaultWrap", type: "boolean", default: "false", description: "Initial wrap when uncontrolled." },
        { prop: "onWrapChange", type: "(wrap: boolean) => void", description: "Called when the toggle is pressed." },
        { prop: "wrapToggle", type: "boolean", default: "true", description: "Show the wrap toggle in the header." },
        { prop: "copyable", type: "boolean", default: "true", description: "Show the copy button." },
        { prop: "maxHeight", type: "number | string", description: "The body scrolls past this. Numbers are pixels." },
        { prop: "header", type: "boolean", default: "true", description: "Hide the header; copy floats in the corner instead." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Token colors are derived from it." },
      ],
    },
    {
      name: "tokenize",
      description: "The tokenizer on its own: tokenize(code, language) returns [kind, text] pairs, for rendering code somewhere else.",
      props: [
        {
          prop: "kind",
          type: "CodeTokenKind",
          description: "keyword, string, number, comment, function, type, property, punctuation, tag, attr, variable, prompt or plain.",
        },
      ],
    },
  ],
  notes: [
    "Highlighting runs in render with no effects, so the server sends colored HTML and nothing shifts on hydration.",
    "Token colors are mixed from --neon and stay above 4.5:1 on the block's background for every palette color.",
    "The code area is a focusable region named after the file, so keyboard users can scroll it with the arrow keys.",
    "File tabs follow the tabs pattern: one Tab stop, arrow keys and Home/End move and select.",
    "Added and removed lines carry a hidden 'Added:' or 'Removed:' prefix for screen readers, left out of copied text.",
    "Line numbers and diff markers can't be selected, so copying by hand gives clean code.",
  ],
};
