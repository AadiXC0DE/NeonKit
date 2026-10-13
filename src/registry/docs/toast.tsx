import type { ComponentDoc } from "../types";
import ToastDemo from "../examples/toast/demo";
import ToastStatus from "../examples/toast/status";
import ToastPromise from "../examples/toast/promise";
import ToastPositions from "../examples/toast/positions";

export const doc: ComponentDoc = {
  usage: `import { Toaster, toast } from "@/components/ui/toast"

// Once, near the root of your app
<Toaster />

// Anywhere, even outside React
toast.success("Invite sent to ana@acme.dev")`,
  examples: [
    {
      name: "demo",
      title: "Toast",
      description: "Hover the stack to fan it out. Every timer pauses until you leave.",
      component: ToastDemo,
    },
    {
      name: "status",
      title: "Status",
      description: "Each status brings its own icon and color. Reuse an id to turn a loading toast into a result.",
      component: ToastStatus,
    },
    {
      name: "promise",
      title: "Promise",
      description: "toast.promise shows one toast that follows the promise from pending to settled.",
      component: ToastPromise,
    },
    {
      name: "positions",
      title: "Positions",
      description: "Set position on the Toaster. Top positions enter from above.",
      component: ToastPositions,
    },
  ],
  api: [
    {
      name: "Toaster",
      description:
        "Renders the toasts. Mount one per app; if several are mounted, the most recent one shows them. Also accepts native section attributes.",
      props: [
        {
          prop: "position",
          type: '"top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"',
          default: '"bottom-right"',
          description: "Corner or edge of the viewport, 16px from it.",
        },
        { prop: "max", type: "number", default: "3", description: "Toasts visible at once. Older ones stay hidden until their timers run out." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Color of default and loading toasts. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "toast(title, options?)",
      description: "Shows a toast and returns its id. title can be any React node.",
      props: [
        { prop: "description", type: "ReactNode", description: "Secondary line under the title." },
        { prop: "status", type: '"default" | "success" | "error" | "warning" | "info" | "loading"', default: '"default"', description: "Sets the icon and color." },
        { prop: "color", type: "NeonColor", description: "Overrides the status color." },
        { prop: "duration", type: "number", default: "4000", description: "Milliseconds on screen. Infinity keeps it until dismissed. Loading toasts default to Infinity." },
        { prop: "action", type: "{ label: string; onClick: () => void }", description: "A button inside the toast. Clicking it also dismisses the toast." },
        { prop: "id", type: "string", description: "Pass the id of a visible toast to replace its content in place and restart its timer." },
      ],
    },
    {
      name: "Methods",
      props: [
        { prop: "toast.success / error / warning / info / loading", type: "(title, options?) => string", description: "Shorthands that set status." },
        { prop: "toast.dismiss", type: "(id?: string) => void", description: "Dismisses one toast, or all of them when called without an id." },
        {
          prop: "toast.promise",
          type: "(promise, { loading, success, error }, options?) => Promise<T>",
          description: "Shows loading, then success or error on the same toast. success and error can be functions of the result or error. Returns the original promise.",
        },
      ],
    },
  ],
  notes: [
    "The stack is a labelled region. Each new or updated toast is read from a live region that stays mounted, politely, except errors, which interrupt.",
    "Hovering the stack or tabbing into it expands it and pauses every timer; timers also pause while the tab is hidden.",
    "Swipe a toast sideways to dismiss it. On touch screens the close button stays visible.",
    "Toasts disappear, so never make one the only way to reach an action.",
  ],
};
