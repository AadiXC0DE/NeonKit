import { ComponentSection } from "../_shared/ComponentSection";
import { AnimatedDiv } from "../_shared/Animated";
import { getExampleSource } from "@/lib/get-source";
import NeonModals from "./snippets/NeonModals";
import AdvancedModals from "./snippets/AdvancedModals";
import BasicModals from "./snippets/BasicModals";
import ModalSizes from "./snippets/ModalSizes";

export default async function ModalPage() {
  const neonSource = await getExampleSource(
    "app/components/modal/snippets/NeonModals.tsx",
  );
  const advancedSource = await getExampleSource(
    "app/components/modal/snippets/AdvancedModals.tsx",
  );
  const basicSource = await getExampleSource(
    "app/components/modal/snippets/BasicModals.tsx",
  );
  const sizesSource = await getExampleSource(
    "app/components/modal/snippets/ModalSizes.tsx",
  );

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <AnimatedDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Modal Dialog Components
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Sleek modal dialogs with neon effects, customizable content, and
          smooth animations. Perfect for confirmations, alerts, and user
          interactions.
        </p>
      </AnimatedDiv>

      <AnimatedDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border border-neon-cyan/20 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-neon-cyan font-medium mb-1">
            💡 Interactive Demo
          </p>
          <p className="text-xs text-white/80">
            Click on the buttons below to open and interact with the modal
            examples!
          </p>
        </div>
      </AnimatedDiv>

      <div className="space-y-16">
        <ComponentSection
          title="Neon Modals"
          description="Electric modal dialogs with glowing neon effects in multiple vibrant colors"
          preview={<NeonModals />}
          code={neonSource}
          filePathLabel="app/components/modal/snippets/NeonModals.tsx"
        />

        <ComponentSection
          title="Advanced Modals"
          description="Feature-rich modals with icons, custom actions, and flexible content layouts"
          preview={<AdvancedModals />}
          code={advancedSource}
          filePathLabel="app/components/modal/snippets/AdvancedModals.tsx"
        />

        <ComponentSection
          title="Basic Modals"
          description="Clean and simple modal variants for everyday use with standard styling"
          preview={<BasicModals />}
          code={basicSource}
          filePathLabel="app/components/modal/snippets/BasicModals.tsx"
        />

        <ComponentSection
          title="Modal Sizes"
          description="Different modal sizes to fit various content types and design contexts"
          preview={<ModalSizes />}
          code={sizesSource}
          filePathLabel="app/components/modal/snippets/ModalSizes.tsx"
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
                Import the component:{" "}
                <code className="bg-muted px-1 py-0.5 rounded">
                  import {"{"} Modal {"}"} from "@/components/modal"
                </code>
              </p>
              <p className="mt-2">
                For compound components, also import:{" "}
                <code className="bg-muted px-1 py-0.5 rounded">
                  import {"{"} ModalTrigger, ModalContent {"}"} from
                  "@/components/modal"
                </code>
              </p>
              <p className="mt-2">
                Ensure the{" "}
                <code className="bg-muted px-1 py-0.5 rounded">cn</code> utility
                exists.{" "}
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
