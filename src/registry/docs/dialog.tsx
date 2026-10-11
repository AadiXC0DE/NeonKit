import type { ComponentDoc } from "../types";
import DialogDemo from "../examples/dialog/demo";
import DialogDestructive from "../examples/dialog/destructive";
import DialogSizes from "../examples/dialog/sizes";

export const doc: ComponentDoc = {
  usage: `import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Edit profile</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>This is how teammates see you.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="ghost">Cancel</Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
  examples: [
    {
      name: "demo",
      title: "Form",
      description: "Control open to close the dialog once the form submits.",
      component: DialogDemo,
    },
    {
      name: "destructive",
      title: "Destructive",
      description: "color tints the panel, its glow and every button inside. Typing the name unlocks the action.",
      component: DialogDestructive,
    },
    { name: "sizes", title: "Sizes", component: DialogSizes },
  ],
  api: [
    {
      name: "Dialog",
      description: "Holds the open state. Renders no element of its own.",
      props: [
        { prop: "open", type: "boolean", description: "Controlled open state." },
        { prop: "defaultOpen", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
        { prop: "onOpenChange", type: "(open: boolean) => void", description: "Called when the trigger, a close button, Escape or the overlay asks to change state." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "DialogTrigger",
      description: "Renders a button that opens the dialog. Also accepts every native button attribute.",
      props: [
        { prop: "asChild", type: "boolean", default: "false", description: "Merges trigger behaviour onto its single child element instead of rendering a button." },
      ],
    },
    {
      name: "DialogContent",
      description: "The overlay and panel, rendered in a native <dialog> on the top layer. Other props go to the panel.",
      props: [
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Maximum panel width: 384, 512 or 672px." },
        { prop: "showClose", type: "boolean", default: "true", description: "Shows the X button in the top-right corner." },
      ],
    },
    {
      name: "DialogClose",
      description: "Renders a button that closes the dialog. Also accepts every native button attribute.",
      props: [
        { prop: "asChild", type: "boolean", default: "false", description: "Merges close behaviour onto its single child element instead of rendering a button." },
      ],
    },
    {
      name: "DialogHeader, DialogTitle, DialogDescription, DialogFooter",
      description: "Layout and text parts. Each accepts the native attributes of its element.",
      props: [
        { prop: "DialogTitle", type: "h2", description: "Labels the dialog through aria-labelledby." },
        { prop: "DialogDescription", type: "p", description: "Describes the dialog through aria-describedby, only while it's rendered." },
        { prop: "DialogFooter", type: "div", description: "Stacks actions on small screens and right-aligns them from sm up." },
      ],
    },
  ],
  notes: [
    "Opens with showModal(), so the browser traps focus, makes the page inert and moves focus to the first focusable element.",
    "Escape and clicks on the overlay close the dialog after its exit animation.",
    "Focus returns to the element that opened the dialog, and page scroll is locked while it's open.",
    "Always include a DialogTitle, even a visually hidden one, so the dialog has an accessible name.",
  ],
};
