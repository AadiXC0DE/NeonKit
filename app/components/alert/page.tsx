import { ComponentSection } from "../_shared/ComponentSection";
import { AnimatedDiv } from "../_shared/Animated";
import { getExampleSource } from "@/lib/get-source";
import NeonAlerts from "./snippets/NeonAlerts";
import BasicAlerts from "./snippets/BasicAlerts";
import StatusAlerts from "./snippets/StatusAlerts";
import SizeAlerts from "./snippets/SizeAlerts";

export default async function AlertPage() {
  const neonSource = await getExampleSource(
    "app/components/alert/snippets/NeonAlerts.tsx",
  );
  const basicSource = await getExampleSource(
    "app/components/alert/snippets/BasicAlerts.tsx",
  );
  const statusSource = await getExampleSource(
    "app/components/alert/snippets/StatusAlerts.tsx",
  );
  const sizeSource = await getExampleSource(
    "app/components/alert/snippets/SizeAlerts.tsx",
  );

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <AnimatedDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Alert Components
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Sleek alert components with neon effects for user feedback,
          notifications, and status messages. Copy and paste into your project.
        </p>
      </AnimatedDiv>

      <div className="space-y-16">
        <ComponentSection
          title="Neon Alerts"
          description="Electric alerts with glowing neon effects in multiple vibrant colors for enhanced visual feedback"
          preview={<NeonAlerts />}
          code={neonSource}
          filePathLabel="app/components/alert/snippets/NeonAlerts.tsx"
        />

        <ComponentSection
          title="Basic Alerts"
          description="Standard alert variants for everyday use with clean styling and clear messaging"
          preview={<BasicAlerts />}
          code={basicSource}
          filePathLabel="app/components/alert/snippets/BasicAlerts.tsx"
        />

        <ComponentSection
          title="Status & Feedback Alerts"
          description="Alert states for success, error, warning, and info feedback with appropriate icons and colors"
          preview={<StatusAlerts />}
          code={statusSource}
          filePathLabel="app/components/alert/snippets/StatusAlerts.tsx"
        />

        <ComponentSection
          title="Alert Sizes"
          description="Different sizes to fit various design contexts and layout requirements"
          preview={<SizeAlerts />}
          code={sizeSource}
          filePathLabel="app/components/alert/snippets/SizeAlerts.tsx"
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
                  import {"{"} Alert {"}"} from "@/components/alert"
                </code>
              </p>
              <p className="mt-2">
                If you use icons, also install and import them:{" "}
                <code className="bg-muted px-1 py-0.5 rounded">
                  import {"{"} AlertCircle {"}"} from "lucide-react"
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
