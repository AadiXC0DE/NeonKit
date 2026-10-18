import type { ComponentDoc } from "../types";
import AlertDialogDemo from "../examples/alert-dialog/demo";
import AlertDialogRevoke from "../examples/alert-dialog/revoke";
import AlertDialogPublish from "../examples/alert-dialog/publish";

export const doc: ComponentDoc = {
  usage: `import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="ghost">Revoke</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Revoke this key?</AlertDialogTitle>
      <AlertDialogDescription>Requests signed with it fail right away.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction variant="danger">Revoke key</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`,
  examples: [
    {
      name: "demo",
      title: "Type to confirm",
      description:
        "confirmText keeps the action dark until the name matches. Each letter in the label lights as it's typed; the action flickers on at the last one.",
      component: AlertDialogDemo,
    },
    {
      name: "revoke",
      title: "Destructive",
      description: "Without confirmText the red tube is lit from the start. Cancel still takes focus.",
      component: AlertDialogRevoke,
    },
    {
      name: "publish",
      title: "Important, not destructive",
      description: "The default variant follows the accent, for actions you can't take back that aren't deletions.",
      component: AlertDialogPublish,
    },
  ],
  api: [
    {
      name: "AlertDialog",
      description: "Holds the open state and the typed confirmation. Renders no element of its own.",
      props: [
        { prop: "open", type: "boolean", description: "Controlled open state." },
        { prop: "defaultOpen", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
        { prop: "onOpenChange", type: "(open: boolean) => void", description: "Called by the trigger, Cancel, Action and Escape. Never by a click outside." },
        { prop: "confirmText", type: "string", description: "Text that has to be typed into AlertDialogConfirmInput before the action unlocks. Cleared on every open." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "AlertDialogContent",
      description: "The overlay and panel in a native <dialog role=\"alertdialog\">. Other props go to the panel.",
      props: [
        { prop: "size", type: '"sm" | "md"', default: '"sm"', description: "Maximum panel width: 400 or 460px. Docks to the bottom edge below 640px." },
        { prop: "initialFocus", type: '"cancel" | "action" | "confirm"', default: '"cancel"', description: "What takes focus on open. Action only if it's already enabled." },
      ],
    },
    {
      name: "AlertDialogAction",
      description: "The confirming button. Closes the dialog after onClick unless the handler calls event.preventDefault().",
      props: [
        { prop: "variant", type: '"default" | "danger"', default: '"default"', description: "Danger is a red tube regardless of the dialog's color, and turns the confirmation input red too." },
        { prop: "loading", type: "boolean", default: "false", description: "Shows a spinner and ignores further presses, e.g. while a delete request runs." },
        { prop: "disabled", type: "boolean", default: "false", description: "Keeps the tube unlit. It's also unlit while confirmText doesn't match." },
      ],
    },
    {
      name: "AlertDialogConfirmInput",
      description: "Collects confirmText. Enter presses the action once it matches. Accepts native input attributes.",
      props: [
        { prop: "label", type: "ReactNode", default: '"Type … to confirm"', description: "Replaces the default label, which spells out confirmText and lights each matched letter." },
      ],
    },
    {
      name: "AlertDialogTrigger, AlertDialogCancel",
      description: "Buttons that open and cancel. Both accept native button attributes.",
      props: [
        { prop: "asChild", type: "boolean", default: "false", description: "Merges the behaviour onto the single child element instead of rendering a button." },
      ],
    },
    {
      name: "AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter",
      description: "Layout and text parts. Each accepts the native attributes of its element.",
      props: [
        { prop: "AlertDialogTitle", type: "h2", description: "Names the dialog through aria-labelledby." },
        { prop: "AlertDialogDescription", type: "p", description: "Describes it through aria-describedby. <strong> inside is set brighter for the facts that matter." },
        { prop: "AlertDialogFooter", type: "div", description: "Stacks the action above Cancel on small screens, right-aligns both from sm up." },
      ],
    },
  ],
  notes: [
    "Renders a native modal <dialog> with role=\"alertdialog\", so focus is trapped and the page behind is inert.",
    "Cancel takes focus on open, so a stray Enter never confirms.",
    "Escape cancels. A click outside doesn't close it; the panel nudges instead, or dims briefly with reduced motion.",
    "Focus returns to the element that opened it, and page scroll is locked while it's open.",
  ],
};
