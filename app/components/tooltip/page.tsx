import { ComponentSection } from "../_shared/ComponentSection";
import { AnimatedDiv } from "../_shared/Animated";
import { getExampleSource } from "@/lib/get-source";
import NeonTooltips from "./snippets/NeonTooltips";
import BasicTooltips from "./snippets/BasicTooltips";
import TooltipPositions from "./snippets/TooltipPositions";
import TooltipSizes from "./snippets/TooltipSizes";

export default async function TooltipPage() {
  const neonTooltipsSource = await getExampleSource(
    "app/components/tooltip/snippets/NeonTooltips.tsx",
  );
  const basicTooltipsSource = await getExampleSource(
    "app/components/tooltip/snippets/BasicTooltips.tsx",
  );
  const tooltipPositionsSource = await getExampleSource(
    "app/components/tooltip/snippets/TooltipPositions.tsx",
  );
  const tooltipSizesSource = await getExampleSource(
    "app/components/tooltip/snippets/TooltipSizes.tsx",
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
          Tooltip Components
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Contextual help and information tooltips with neon effects.
        </p>
      </AnimatedDiv>

      <div className="space-y-16">
        {/* Neon Tooltips */}
        <ComponentSection
          title="Neon Tooltips"
          description="Electric neon tooltips with glowing effects in vibrant colors"
          preview={<NeonTooltips />}
          code={neonTooltipsSource}
        />

        {/* Basic Tooltips */}
        <ComponentSection
          title="Basic Tooltips"
          description="Clean, simple tooltips for general use"
          preview={<BasicTooltips />}
          code={basicTooltipsSource}
        />

        {/* Tooltip Positions */}
        <ComponentSection
          title="Tooltip Positions"
          description="Tooltips positioned in different directions"
          preview={<TooltipPositions />}
          code={tooltipPositionsSource}
        />

        {/* Tooltip Sizes */}
        <ComponentSection
          title="Tooltip Sizes"
          description="Tooltips in different sizes for various use cases"
          preview={<TooltipSizes />}
          code={tooltipSizesSource}
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
                Copy and paste the tooltip code directly. Install required
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
