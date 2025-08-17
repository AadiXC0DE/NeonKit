import { ComponentSection } from "../_shared/ComponentSection";
import { AnimatedDiv } from "../_shared/Animated";
import { getExampleSource } from "@/lib/get-source";
import NeonDropdowns from "./snippets/NeonDropdowns";
import AdvancedDropdowns from "./snippets/AdvancedDropdowns";
import BasicDropdowns from "./snippets/BasicDropdowns";
import StatusDropdowns from "./snippets/StatusDropdowns";
import SizeDropdowns from "./snippets/SizeDropdowns";

export default async function DropdownPage() {
  const neonSource = await getExampleSource(
    "app/components/dropdown/snippets/NeonDropdowns.tsx",
  );
  const advancedSource = await getExampleSource(
    "app/components/dropdown/snippets/AdvancedDropdowns.tsx",
  );
  const basicSource = await getExampleSource(
    "app/components/dropdown/snippets/BasicDropdowns.tsx",
  );
  const statusSource = await getExampleSource(
    "app/components/dropdown/snippets/StatusDropdowns.tsx",
  );
  const sizeSource = await getExampleSource(
    "app/components/dropdown/snippets/SizeDropdowns.tsx",
  );

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <AnimatedDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Dropdown Components
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Sleek dropdown and select components with neon effects, search
          functionality, and multi-select capabilities. Copy and paste into your
          project.
        </p>
      </AnimatedDiv>

      <div className="space-y-16">
        <ComponentSection
          title="Neon Dropdowns"
          description="Electric dropdown selects with glowing neon effects in multiple vibrant colors"
          preview={<NeonDropdowns />}
          code={neonSource}
          filePathLabel="app/components/dropdown/snippets/NeonDropdowns.tsx"
        />

        <ComponentSection
          title="Advanced Dropdowns"
          description="Feature-rich dropdowns with icons, descriptions, search, and multi-select capabilities"
          preview={<AdvancedDropdowns />}
          code={advancedSource}
          filePathLabel="app/components/dropdown/snippets/AdvancedDropdowns.tsx"
        />

        <ComponentSection
          title="Basic Dropdowns"
          description="Standard dropdown variants for everyday use with clean styling"
          preview={<BasicDropdowns />}
          code={basicSource}
          filePathLabel="app/components/dropdown/snippets/BasicDropdowns.tsx"
        />

        <ComponentSection
          title="Status & Loading States"
          description="Dropdown states for error handling, success feedback, and loading indicators"
          preview={<StatusDropdowns />}
          code={statusSource}
          filePathLabel="app/components/dropdown/snippets/StatusDropdowns.tsx"
        />

        <ComponentSection
          title="Dropdown Sizes"
          description="Different sizes to fit various design contexts and layouts"
          preview={<SizeDropdowns />}
          code={sizeSource}
          filePathLabel="app/components/dropdown/snippets/SizeDropdowns.tsx"
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
                  import {"{"} Dropdown {"}"} from "@/components/dropdown"
                </code>
              </p>
              <p className="mt-2">
                If you use icons, also install and import them:{" "}
                <code className="bg-muted px-1 py-0.5 rounded">
                  import {"{"} User {"}"} from "lucide-react"
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
