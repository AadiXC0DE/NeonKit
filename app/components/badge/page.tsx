import { ComponentSection } from "../_shared/ComponentSection";
import { AnimatedDiv } from "../_shared/Animated";
import { getExampleSource } from "@/lib/get-source";
import BasicBadges from "./snippets/BasicBadges";
import NeonBadges from "./snippets/NeonBadges";
import BadgeSizes from "./snippets/BadgeSizes";
import RemovableBadges from "./snippets/RemovableBadges";

export default async function BadgePage() {
  const basicBadgesSource = await getExampleSource(
    "app/components/badge/snippets/BasicBadges.tsx",
  );
  const neonBadgesSource = await getExampleSource(
    "app/components/badge/snippets/NeonBadges.tsx",
  );
  const badgeSizesSource = await getExampleSource(
    "app/components/badge/snippets/BadgeSizes.tsx",
  );
  const removableBadgesSource = await getExampleSource(
    "app/components/badge/snippets/RemovableBadges.tsx",
  );

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      {/* Header */}
      <AnimatedDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Badge Components
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Status indicators and labels with neon effects. Perfect for tags,
          notifications, and status displays.
        </p>
      </AnimatedDiv>

      <div className="space-y-16">
        {/* Neon Badges */}
        <ComponentSection
          title="Neon Badges"
          description="Electric neon badges with glowing effects in vibrant colors"
          preview={<NeonBadges />}
          code={neonBadgesSource}
        />

        {/* Basic Badges */}
        <ComponentSection
          title="Basic Badges"
          description="Clean, simple badges for general use"
          preview={<BasicBadges />}
          code={basicBadgesSource}
        />

        {/* Badge Sizes */}
        <ComponentSection
          title="Badge Sizes"
          description="Badges in different sizes for various use cases"
          preview={<BadgeSizes />}
          code={badgeSizesSource}
        />

        {/* Removable Badges */}
        <ComponentSection
          title="Removable Badges"
          description="Interactive badges that can be dismissed"
          preview={<RemovableBadges />}
          code={removableBadgesSource}
        />

        {/* Installation Section */}
        <AnimatedDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border rounded-lg p-6 bg-gradient-to-r from-[#00FFC3]/5 to-[#D300FF]/5"
        >
          <h2 className="text-2xl font-bold mb-4">Installation</h2>

          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-3">
                Copy and paste the badge code directly. Install required
                dependencies:
              </p>
              <div className="bg-muted rounded-lg p-3">
                <code className="text-sm">
                  npm install framer-motion clsx tailwind-merge
                </code>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                Make sure you have the{" "}
                <code className="bg-muted px-1 py-0.5 rounded">cn</code> utility
                function.{" "}
                <a href="/setup" className="text-[#00FFC3] hover:underline">
                  See installation guide
                </a>
                .
              </p>
            </div>
          </div>
        </AnimatedDiv>
      </div>
    </div>
  );
}
