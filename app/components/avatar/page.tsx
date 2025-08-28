import { ComponentSection } from "../_shared/ComponentSection";
import { AnimatedDiv } from "../_shared/Animated";
import { getExampleSource } from "@/lib/get-source";
import BasicAvatars from "./snippets/BasicAvatars";
import NeonAvatars from "./snippets/NeonAvatars";
import AvatarSizes from "./snippets/AvatarSizes";
import AvatarStatuses from "./snippets/AvatarStatuses";

export default async function AvatarPage() {
  const basicAvatarsSource = await getExampleSource(
    "app/components/avatar/snippets/BasicAvatars.tsx",
  );
  const neonAvatarsSource = await getExampleSource(
    "app/components/avatar/snippets/NeonAvatars.tsx",
  );
  const avatarSizesSource = await getExampleSource(
    "app/components/avatar/snippets/AvatarSizes.tsx",
  );
  const avatarStatusesSource = await getExampleSource(
    "app/components/avatar/snippets/AvatarStatuses.tsx",
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
          Avatar Components
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          User profile pictures with neon effects, fallback support, and status
          indicators.
        </p>
      </AnimatedDiv>

      <div className="space-y-16">
        {/* Neon Avatars */}
        <ComponentSection
          title="Neon Avatars"
          description="Electric neon avatars with glowing borders and effects"
          preview={<NeonAvatars />}
          code={neonAvatarsSource}
          filePathLabel="app/components/avatar/snippets/NeonAvatars.tsx"
        />

        {/* Basic Avatars */}
        <ComponentSection
          title="Basic Avatars"
          description="Standard avatar display with image and fallback support"
          preview={<BasicAvatars />}
          code={basicAvatarsSource}
          filePathLabel="app/components/avatar/snippets/BasicAvatars.tsx"
        />

        {/* Avatar Sizes */}
        <ComponentSection
          title="Avatar Sizes"
          description="Avatars in different sizes for various use cases"
          preview={<AvatarSizes />}
          code={avatarSizesSource}
          filePathLabel="app/components/avatar/snippets/AvatarSizes.tsx"
        />

        {/* Avatar Statuses */}
        <ComponentSection
          title="Status Indicators"
          description="Avatars with online/offline status indicators"
          preview={<AvatarStatuses />}
          code={avatarStatusesSource}
          filePathLabel="app/components/avatar/snippets/AvatarStatuses.tsx"
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
                Copy and paste the avatar code directly. Install required
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
