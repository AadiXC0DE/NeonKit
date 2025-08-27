import { ComponentSection } from "../_shared/ComponentSection";
import { AnimatedDiv } from "../_shared/Animated";
import { getExampleSource } from "@/lib/get-source";
import NeonCheckboxes from "./snippets/NeonCheckboxes";
import BasicCheckboxes from "./snippets/BasicCheckboxes";
import CheckboxSizes from "./snippets/CheckboxSizes";
import CheckboxStates from "./snippets/CheckboxStates";

export default async function CheckboxPage() {
  const neonCheckboxesSource = await getExampleSource(
    "app/components/checkbox/snippets/NeonCheckboxes.tsx",
  );
  const basicCheckboxesSource = await getExampleSource(
    "app/components/checkbox/snippets/BasicCheckboxes.tsx",
  );
  const checkboxSizesSource = await getExampleSource(
    "app/components/checkbox/snippets/CheckboxSizes.tsx",
  );
  const checkboxStatesSource = await getExampleSource(
    "app/components/checkbox/snippets/CheckboxStates.tsx",
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
          Checkbox Components
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Multiple-selection checkboxes with neon effects and smooth animations.
        </p>
      </AnimatedDiv>

      <div className="space-y-16">
        {/* Neon Checkboxes */}
        <ComponentSection
          title="Neon Checkboxes"
          description="Electric neon checkboxes with glowing effects in vibrant colors"
          preview={<NeonCheckboxes />}
          code={neonCheckboxesSource}
        />

        {/* Basic Checkboxes */}
        <ComponentSection
          title="Basic Checkboxes"
          description="Clean, simple checkboxes for general use"
          preview={<BasicCheckboxes />}
          code={basicCheckboxesSource}
        />

        {/* Checkbox Sizes */}
        <ComponentSection
          title="Checkbox Sizes"
          description="Checkboxes in different sizes for various use cases"
          preview={<CheckboxSizes />}
          code={checkboxSizesSource}
        />

        {/* Checkbox States */}
        <ComponentSection
          title="Checkbox States"
          description="Different states including indeterminate for partial selections"
          preview={<CheckboxStates />}
          code={checkboxStatesSource}
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
                Copy and paste the checkbox code directly. Install required
                dependencies:
              </p>
              <div className="bg-muted rounded-lg p-3">
                <code className="text-sm">
                  npm install framer-motion clsx tailwind-merge lucide-react
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
