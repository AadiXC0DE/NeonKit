import { ComponentSection } from "../_shared/ComponentSection";
import { AnimatedDiv } from "../_shared/Animated";
import { getExampleSource } from "@/lib/get-source";
import NeonInputs from "./snippets/NeonInputs";
import BasicInputs from "./snippets/BasicInputs";
import InputSizes from "./snippets/InputSizes";
import NeonVariants from "./snippets/NeonVariants";
import InputsWithIcons from "./snippets/InputsWithIcons";

export default async function InputPage() {
  const neonInputsSource = await getExampleSource(
    "app/components/input/snippets/NeonInputs.tsx",
  );
  const basicInputsSource = await getExampleSource(
    "app/components/input/snippets/BasicInputs.tsx",
  );
  const inputSizesSource = await getExampleSource(
    "app/components/input/snippets/InputSizes.tsx",
  );
  const neonVariantsSource = await getExampleSource(
    "app/components/input/snippets/NeonVariants.tsx",
  );
  const inputsWithIconsSource = await getExampleSource(
    "app/components/input/snippets/InputsWithIcons.tsx",
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
          Input Components
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Beautiful input components with neon effects, multiple variants, and
          rich features. Copy and paste into your project.
        </p>
      </AnimatedDiv>

      <div className="space-y-16">
        {/* Neon Inputs */}
        <ComponentSection
          title="Neon Inputs"
          description="Electric neon inputs with glowing effects in multiple vibrant colors"
          preview={<NeonInputs />}
          code={neonInputsSource}
          filePathLabel="app/components/input/snippets/NeonInputs.tsx"
        />

        {/* Basic Inputs */}
        <ComponentSection
          title="Basic Inputs"
          description="Standard input variants for everyday use"
          preview={<BasicInputs />}
          code={basicInputsSource}
          filePathLabel="app/components/input/snippets/BasicInputs.tsx"
        />

        {/* Input Sizes */}
        <ComponentSection
          title="Input Sizes"
          description="Different sizes for various use cases"
          preview={<InputSizes />}
          code={inputSizesSource}
          filePathLabel="app/components/input/snippets/InputSizes.tsx"
        />

        {/* Neon Input Variants */}
        <ComponentSection
          title="Neon Input Variants"
          description="Specialized neon inputs for different states and purposes"
          preview={<NeonVariants />}
          code={neonVariantsSource}
          filePathLabel="app/components/input/snippets/NeonVariants.tsx"
        />

        {/* Inputs with Icons */}
        <ComponentSection
          title="Inputs with Icons"
          description="Inputs with leading icons, password toggle, and clearable functionality"
          preview={<InputsWithIcons />}
          code={inputsWithIconsSource}
          filePathLabel="app/components/input/snippets/InputsWithIcons.tsx"
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
                  import {"{"} Input {"}"} from "@/components/input"
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
