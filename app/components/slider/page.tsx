import { ComponentSection } from "../_shared/ComponentSection";
import { AnimatedDiv } from "../_shared/Animated";
import { getExampleSource } from "@/lib/get-source";
import NeonSliders from "./snippets/NeonSliders";
import BasicSliders from "./snippets/BasicSliders";
import SliderSizes from "./snippets/SliderSizes";
import SliderVariants from "./snippets/SliderVariants";

export default async function SliderPage() {
  const neonSlidersSource = await getExampleSource(
    "app/components/slider/snippets/NeonSliders.tsx",
  );
  const basicSlidersSource = await getExampleSource(
    "app/components/slider/snippets/BasicSliders.tsx",
  );
  const sliderSizesSource = await getExampleSource(
    "app/components/slider/snippets/SliderSizes.tsx",
  );
  const sliderVariantsSource = await getExampleSource(
    "app/components/slider/snippets/SliderVariants.tsx",
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
          Slider Components
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Interactive slider components with neon effects, smooth animations,
          and full accessibility support. Perfect for volume controls, range
          inputs, and settings.
        </p>
      </AnimatedDiv>

      <div className="space-y-16">
        {/* Neon Sliders */}
        <ComponentSection
          title="Neon Sliders"
          description="Electric neon sliders with glowing effects and smooth animations"
          preview={<NeonSliders />}
          code={neonSlidersSource}
          filePathLabel="app/components/slider/snippets/NeonSliders.tsx"
        />

        {/* Basic Sliders */}
        <ComponentSection
          title="Basic Sliders"
          description="Clean, minimal sliders for standard use cases"
          preview={<BasicSliders />}
          code={basicSlidersSource}
          filePathLabel="app/components/slider/snippets/BasicSliders.tsx"
        />

        {/* Slider Sizes */}
        <ComponentSection
          title="Slider Sizes"
          description="Different slider sizes for various interface needs"
          preview={<SliderSizes />}
          code={sliderSizesSource}
          filePathLabel="app/components/slider/snippets/SliderSizes.tsx"
        />

        {/* Slider Variants */}
        <ComponentSection
          title="Slider Variants"
          description="Specialized slider variants with different behaviors and features"
          preview={<SliderVariants />}
          code={sliderVariantsSource}
          filePathLabel="app/components/slider/snippets/SliderVariants.tsx"
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
                Install required dependencies:
              </p>
              <div className="bg-muted rounded-lg p-3">
                <code className="text-sm">
                  npm install framer-motion clsx tailwind-merge lucide-react
                </code>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                Import the component where you need it:{" "}
                <code className="bg-muted px-1 py-0.5 rounded">
                  import {"{"} Slider {"}"} from "@/components/slider"
                </code>
              </p>
              <p className="mt-2">
                Make sure you have the{" "}
                <code className="bg-muted px-1 py-0.5 rounded">cn</code> utility
                function.{" "}
                <a href="/setup" className="text-[#00FFC3] hover:underline">
                  See complete installation guide
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
