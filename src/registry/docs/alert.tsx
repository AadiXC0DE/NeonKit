import type { ComponentDoc } from "../types";
import AlertDemo from "../examples/alert/demo";
import AlertDismissible from "../examples/alert/dismissible";
import AlertVariants from "../examples/alert/variants";
import AlertCustom from "../examples/alert/custom";

export const doc: ComponentDoc = {
  usage: `import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

<Alert status="success">
  <AlertTitle>Deployment ready</AlertTitle>
  <AlertDescription>acme-web is live on acme.dev.</AlertDescription>
</Alert>`,
  examples: [
    {
      name: "demo",
      title: "Statuses",
      description: "Each status brings its own color and icon.",
      component: AlertDemo,
    },
    {
      name: "dismissible",
      title: "Action and dismiss",
      description: "The action inherits the alert's color, so a Button in it matches without props.",
      component: AlertDismissible,
    },
    { name: "variants", title: "Variants", component: AlertVariants },
    {
      name: "custom",
      title: "Custom color and icon",
      description: "color overrides the status color. icon={false} hides the icon.",
      component: AlertCustom,
    },
  ],
  api: [
    {
      name: "Alert",
      description: "Also accepts every native div attribute.",
      props: [
        { prop: "status", type: '"info" | "success" | "warning" | "error" | "neutral"', default: '"info"', description: "Sets the default color and icon, and how urgently a live alert is announced." },
        { prop: "live", type: '"assertive" | "polite" | "off"', default: "auto", description: "assertive renders role=\"alert\", polite role=\"status\", off no live region. Auto keeps alerts that were on the page at load quiet, and announces ones added later: assertive for warning and error, polite for the rest." },
        { prop: "variant", type: '"soft" | "outline" | "solid"', default: '"soft"', description: "Visual style." },
        { prop: "color", type: "NeonColor", default: "from status", description: "Palette name or hex. Overrides the status color." },
        { prop: "icon", type: "ReactNode | false", default: "status icon", description: "Replaces the icon, or hides it with false." },
        { prop: "action", type: "ReactNode", description: "Right-aligned slot, usually a small Button." },
        { prop: "onDismiss", type: "() => void", description: "Shows a dismiss button that calls this. Removing the alert is up to you." },
      ],
    },
    {
      name: "AlertTitle",
      description: "A div with the title style. Accepts every native div attribute.",
      props: [],
    },
    {
      name: "AlertDescription",
      description: "A div with the muted body style. Accepts every native div attribute.",
      props: [],
    },
  ],
  notes: [
    "An alert rendered with the page is a callout, not news, so it gets no live role and nothing is read out on load.",
    "An alert added after load (a failed save, a lost connection) is announced: warning and error interrupt with role=\"alert\", the others wait with role=\"status\".",
    "Set live yourself when the default guesses wrong, for example live=\"off\" on a client-rendered page's permanent banner.",
    "The dismiss button is a native button labelled \"Dismiss\", reachable with Tab.",
  ],
};
