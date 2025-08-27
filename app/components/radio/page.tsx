import { ComponentSection } from "../_shared/ComponentSection";
import { AnimatedDiv } from "../_shared/Animated";
import { getExampleSource } from "@/lib/get-source";
import NeonRadios from "./snippets/NeonRadios";
import BasicRadios from "./snippets/BasicRadios";
import RadioSizes from "./snippets/RadioSizes";
import RadioGroups from "./snippets/RadioGroups";

export default async function RadioPage() {
  const neonRadiosSource = await getExampleSource(
    "app/components/radio/snippets/NeonRadios.tsx",
  );
  const basicRadiosSource = await getExampleSource(
    "app/components/radio/snippets/BasicRadios.tsx",
  );
  const radioSizesSource = await getExampleSource(
    "app/components/radio/snippets/RadioSizes.tsx",
  );
  const radioGroupsSource = await getExampleSource(
    "app/components/radio/snippets/RadioGroups.tsx",
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
          Radio Button Components
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Single-selection radio buttons with neon effects and smooth
          animations.
        </p>
      </AnimatedDiv>

      <div className="space-y-16">
        {/* Neon Radios */}
        <ComponentSection
          title="Neon Radio Buttons"
          description="Electric neon radio buttons with glowing effects in vibrant colors"
          preview={<NeonRadios />}
          code={neonRadiosSource}
        />

        {/* Basic Radios */}
        <ComponentSection
          title="Basic Radio Buttons"
          description="Clean, simple radio buttons for single selection"
          preview={<BasicRadios />}
          code={basicRadiosSource}
        />

        {/* Radio Sizes */}
        <ComponentSection
          title="Radio Button Sizes"
          description="Radio buttons in different sizes for various use cases"
          preview={<RadioSizes />}
          code={radioSizesSource}
        />

        {/* Radio Groups */}
        <ComponentSection
          title="Radio Groups"
          description="Grouped radio buttons for better organization"
          preview={<RadioGroups />}
          code={radioGroupsSource}
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
                Copy and paste the radio code directly. Install required
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
