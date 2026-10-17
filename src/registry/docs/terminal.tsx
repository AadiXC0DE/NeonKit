import type { ComponentDoc } from "../types";
import TerminalDemo from "../examples/terminal/demo";
import TerminalTypewriter from "../examples/terminal/typewriter";
import TerminalDeploy from "../examples/terminal/deploy";

export const doc: ComponentDoc = {
  usage: `import { Terminal, Typewriter } from "@/components/ui/terminal"

<Terminal
  title="~/app"
  lines={[
    { kind: "input", text: "npm run build" },
    { kind: "success", text: "Compiled in 4.2s" },
  ]}
/>

<h1>Neon UI for <Typewriter words={["dashboards", "landing pages"]} /></h1>`,
  examples: [
    {
      name: "demo",
      title: "Install session",
      description: "Input lines type after the prompt, the rest print. loop starts over a few seconds after the end.",
      component: TerminalDemo,
    },
    {
      name: "typewriter",
      title: "Typewriter",
      description: "Rotating words for a headline.",
      component: TerminalTypewriter,
    },
    {
      name: "deploy",
      title: "Errors and a custom prompt",
      description: "Without loop, a Replay button appears in the title bar when the session ends.",
      component: TerminalDeploy,
    },
  ],
  api: [
    {
      name: "Terminal",
      description: "Also accepts native div attributes.",
      props: [
        { prop: "lines", type: "TerminalLine[]", description: "The session, in order." },
        { prop: "title", type: "ReactNode", description: "Shown in the title bar." },
        { prop: "typingSpeed", type: "number", default: "35", description: "Milliseconds per typed character, with a little human jitter." },
        { prop: "loop", type: "boolean", default: "false", description: "Start over 3s after the last line." },
        { prop: "startOnView", type: "boolean", default: "true", description: "Wait until it scrolls into view before typing." },
        { prop: "prompt", type: "string", default: '"$"', description: "Printed before every input line." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Prompt and caret color." },
        { prop: "onDone", type: "() => void", description: "Called when the last line has printed: once per run, once per pass when looping, and right away under reduced motion." },
      ],
    },
    {
      name: "TerminalLine",
      props: [
        { prop: "kind", type: '"input" | "output" | "success" | "error" | "comment"', description: "input is typed after the prompt; the others print in their own color." },
        { prop: "text", type: "string", description: "The line. Long lines wrap at the terminal's edge." },
        { prop: "delay", type: "number", description: "Milliseconds to wait before this line. Defaults to a short think before input and a beat after it." },
      ],
    },
    {
      name: "Typewriter",
      description: "Also accepts native attributes for the element it renders.",
      props: [
        { prop: "words", type: "string[]", description: "Typed, held, deleted and replaced in turn." },
        { prop: "loop", type: "boolean", default: "true", description: "Keep rotating. When false it stops on the last word." },
        { prop: "cursor", type: "boolean", default: "true", description: "A lit caret after the word." },
        { prop: "typeSpeed", type: "number", default: "70", description: "Milliseconds per typed character." },
        { prop: "deleteSpeed", type: "number", default: "40", description: "Milliseconds per deleted character." },
        { prop: "pause", type: "number", default: "1800", description: "Milliseconds a finished word stays up." },
        { prop: "as", type: '"span" | "p" | "div" | "h1" | "h2" | "h3" | "h4"', default: '"span"', description: "Element to render." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Word and caret color." },
      ],
    },
  ],
  notes: [
    "The terminal renders the whole transcript once for screen readers, so nothing is announced per character.",
    "Typewriter gives screen readers all its words as one phrase instead of the one currently on screen.",
    "Space for every line is reserved up front, so the terminal doesn't grow while it types.",
    "Under reduced motion the terminal shows the finished session, and Typewriter swaps words without typing them.",
  ],
};
