import { ComponentSection } from "../_shared/ComponentSection";
import { AnimatedDiv } from "../_shared/Animated";
import { getExampleSource } from "@/lib/get-source";
import NeonProgressBars from "./snippets/NeonProgressBars";
import CircularProgressDemo from "./snippets/CircularProgress";

import BasicProgressBars from "./snippets/BasicProgressBars";
import MiniProgressBars from "./snippets/MiniProgressBars";
import AnimatedProgress from "./snippets/AnimatedProgress";
import ProgressWithLabels from "./snippets/ProgressWithLabels";
import MultiProgressBars from "./snippets/MultiProgressBars";
import NeonCircularProgress from "./snippets/NeonCircularProgress";

export default async function ProgressPage() {
  const neonProgressSource = await getExampleSource(
    "app/components/progress/snippets/NeonProgressBars.tsx",
  );
  const circularSource = await getExampleSource(
    "app/components/progress/snippets/CircularProgress.tsx",
  );

  const basicSource = await getExampleSource(
    "app/components/progress/snippets/BasicProgressBars.tsx",
  );
  const miniSource = await getExampleSource(
    "app/components/progress/snippets/MiniProgressBars.tsx",
  );
  const animatedSource = await getExampleSource(
    "app/components/progress/snippets/AnimatedProgress.tsx",
  );
  const labelsSource = await getExampleSource(
    "app/components/progress/snippets/ProgressWithLabels.tsx",
  );
  const multiSource = await getExampleSource(
    "app/components/progress/snippets/MultiProgressBars.tsx",
  );
  const neonCircularSource = await getExampleSource(
    "app/components/progress/snippets/NeonCircularProgress.tsx",
  );

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <AnimatedDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Progress Indicators
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Sleek progress indicators with neon effects for loading states, file
          uploads, and process tracking. Copy and paste into your project.
        </p>
      </AnimatedDiv>

      <div className="space-y-16">
        <ComponentSection
          title="Neon Progress Bars"
          description="Electric progress bars with glowing neon effects in multiple vibrant colors for enhanced visual feedback"
          preview={<NeonProgressBars />}
          code={neonProgressSource}
          filePathLabel="app/components/progress/snippets/NeonProgressBars.tsx"
        />

        <ComponentSection
          title="Circular Progress"
          description="Circular progress indicators with smooth animations and neon glow effects"
          preview={<CircularProgressDemo />}
          code={circularSource}
          filePathLabel="app/components/progress/snippets/CircularProgress.tsx"
        />

        <ComponentSection
          title="Basic Progress Bars"
          description="Standard progress bar variants for everyday use with clean styling"
          preview={<BasicProgressBars />}
          code={basicSource}
          filePathLabel="app/components/progress/snippets/BasicProgressBars.tsx"
        />

        <ComponentSection
          title="Mini Progress Bars"
          description="Compact progress indicators for inline displays and tight spaces"
          preview={<MiniProgressBars />}
          code={miniSource}
          filePathLabel="app/components/progress/snippets/MiniProgressBars.tsx"
        />

        <ComponentSection
          title="Animated Progress"
          description="Progress bars with pulsing neon animations and dynamic effects"
          preview={<AnimatedProgress />}
          code={animatedSource}
          filePathLabel="app/components/progress/snippets/AnimatedProgress.tsx"
        />

        <ComponentSection
          title="Progress with Labels"
          description="Progress indicators with percentage labels and status text"
          preview={<ProgressWithLabels />}
          code={labelsSource}
          filePathLabel="app/components/progress/snippets/ProgressWithLabels.tsx"
        />

        <ComponentSection
          title="Multi Progress Bars"
          description="Multiple progress indicators for complex processes and analytics"
          preview={<MultiProgressBars />}
          code={multiSource}
          filePathLabel="app/components/progress/snippets/MultiProgressBars.tsx"
        />

        <ComponentSection
          title="Neon Circular Progress"
          description="Circular progress with intense neon glow effects and animations"
          preview={<NeonCircularProgress />}
          code={neonCircularSource}
          filePathLabel="app/components/progress/snippets/NeonCircularProgress.tsx"
        />

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
                Copy and paste the component code directly into your project.{" "}
                <a href="/setup" className="text-[#00FFC3] hover:underline">
                  See complete installation guide
                </a>
                .
              </p>
              <p className="mt-2">
                Ensure the{" "}
                <code className="bg-muted px-1 py-0.5 rounded">cn</code> utility
                exists for className merging.
              </p>
            </div>
          </div>
        </AnimatedDiv>
      </div>
    </div>
  );
}
