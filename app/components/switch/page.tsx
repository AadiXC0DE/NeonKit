import { ComponentSection } from "../_shared/ComponentSection";
import { AnimatedDiv } from "../_shared/Animated";
import { getExampleSource } from "@/lib/get-source";
import BasicSwitches from "./snippets/BasicSwitches";
import NeonSwitches from "./snippets/NeonSwitches";

export default async function SwitchPage() {
  const basicSwitchesSource = await getExampleSource(
    "app/components/switch/snippets/BasicSwitches.tsx",
  );
  const neonSwitchesSource = await getExampleSource(
    "app/components/switch/snippets/NeonSwitches.tsx",
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
          Switch Components
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Interactive toggle switches with 8 vibrant neon variants and smooth
          animations. All switches default to on state.
        </p>
      </AnimatedDiv>

      <div className="space-y-16">
        {/* Neon Switches */}
        <ComponentSection
          title="Neon Switches"
          description="Electric neon switches with glowing effects in 8 vibrant colors (cyan, purple, chartreuse, pink, red, emerald, amber)"
          preview={<NeonSwitches />}
          code={neonSwitchesSource}
          filePathLabel="app/components/switch/snippets/NeonSwitches.tsx"
        />

        {/* Basic Switches */}
        <ComponentSection
          title="Basic Switches"
          description="Clean, simple toggle switches for general use"
          preview={<BasicSwitches />}
          code={basicSwitchesSource}
          filePathLabel="app/components/switch/snippets/BasicSwitches.tsx"
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
                Copy and paste the switch code directly. Install required
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
