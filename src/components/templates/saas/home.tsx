import { sections } from "./config";
import { faqs } from "./data";
import { Cta } from "./cta";
import { Faq } from "./faq";
import { Features } from "./features/features";
import { Hero } from "./hero";
import { Install } from "./install";
import { Logos } from "./logos";
import { MobileBar } from "./mobile-bar";
import { Plans } from "./plans";
import { SectionRail } from "./section-rail";
import { Testimonials } from "./testimonials";

const clock = (id: (typeof sections)[number]["id"]) => sections.find((s) => s.id === id)?.clock;

export function SaasHome() {
  return (
    <>
      <Hero />
      <Logos />
      <Features />
      <Install />
      <Plans
        id="pricing"
        clock={clock("pricing")}
        title="Pay per seat. Deploys are on us."
        intro="Ship as often as you like on every paid plan. People who only read the morning report never count as seats."
        compareLink
      />
      <Testimonials />
      <Faq
        id="faq"
        clock={clock("faq")}
        title="What teams ask before the first night."
        intro="Mostly about what happens when something goes wrong while everyone is asleep. Short version: it rolls back, and you hear about it at breakfast."
        items={faqs}
        updated="9 Oct 2026"
      />
      <Cta />
      <SectionRail />
      <MobileBar />
    </>
  );
}
