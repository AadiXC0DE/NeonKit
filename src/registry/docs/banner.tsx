import type { ComponentDoc } from "../types";
import BannerDemo from "../examples/banner/demo";
import BannerVariants from "../examples/banner/variants";
import BannerMarquee from "../examples/banner/marquee";
import BannerRemembered from "../examples/banner/remembered";

export const doc: ComponentDoc = {
  usage: `import { Banner, BannerAction } from "@/components/ui/banner"

<Banner variant="launch" tag="New" dismissible action={<BannerAction>Release notes</BannerAction>}>
  Halcyon 2.0 is out.
</Banner>`,
  examples: [
    {
      name: "demo",
      title: "Launch",
      description: "A thin tube runs along the bottom edge and strikes on when the banner mounts, washing light up the bar.",
      component: BannerDemo,
    },
    {
      name: "variants",
      title: "Variants",
      description: "Info uses the neon color, warning is amber, maintenance is orange with hazard stripes at the ends.",
      component: BannerVariants,
    },
    {
      name: "marquee",
      title: "Marquee",
      description: "Long, changing text runs through Marquee instead of wrapping. Hover or focus stops it, and reduced motion makes it a scrollable line.",
      component: BannerMarquee,
    },
    {
      name: "remembered",
      title: "Remembered dismissal",
      description: "With storageKey, a dismissal is kept in localStorage. The banner opens once storage has been read, so returning visitors never see it flash.",
      component: BannerRemembered,
    },
  ],
  api: [
    {
      name: "Banner",
      props: [
        { prop: "variant", type: '"info" | "launch" | "warning" | "maintenance"', default: '"info"', description: "Launch lights the tag and brightens the tube. Warning is amber, maintenance orange." },
        { prop: "tag", type: "ReactNode", description: 'A pill before the message, like "New" or a date.' },
        { prop: "action", type: "ReactNode", description: "A link or button after the message. BannerAction styles it." },
        { prop: "dismissible", type: "boolean", default: "false", description: "Shows a close button." },
        { prop: "storageKey", type: "string", description: "Remembers a dismissal in localStorage. Blocked storage is ignored." },
        { prop: "open", type: "boolean", description: "Controlled visibility." },
        { prop: "defaultOpen", type: "boolean", default: "true", description: "Initial visibility when uncontrolled." },
        { prop: "onOpenChange", type: "(open: boolean) => void", description: "Called with false when the banner is dismissed." },
        { prop: "marquee", type: "boolean", default: "false", description: "Runs the message through Marquee. The tag shows from 640px up." },
        { prop: "dismissLabel", type: "string", default: '"Dismiss"', description: "Accessible name of the close button." },
        { prop: "color", type: "NeonColor", default: "by variant", description: "Overrides the variant's color." },
      ],
    },
    {
      name: "BannerAction",
      description: "Lit text with an arrow that leans forward on hover.",
      props: [
        { prop: "asChild", type: "boolean", default: "false", description: "Renders its child, such as a link, with the action's styles. Base UI's render prop works too." },
      ],
    },
  ],
  notes: [
    "The banner is a region named \"Announcement\", not an alert: it doesn't interrupt, and screen reader users can jump to it as a landmark.",
    "Collapsing animates the height, then the banner is hidden from assistive tech and its controls leave the tab order.",
    "With reduced motion the tube is simply on and the banner opens and closes without animating.",
    "Put it in a sticky header yourself with className=\"sticky top-0 z-50\".",
  ],
};
