import { Terminal } from "@/components/ui/terminal";

export default function TerminalDemo() {
  return (
    <Terminal
      title="~/code/nightshift"
      loop
      className="max-w-xl"
      lines={[
        { kind: "comment", text: "# add a sign to the landing page" },
        { kind: "input", text: "npx shadcn@latest add @neonkit/neon-sign" },
        { kind: "output", text: "Checking registry dependencies..." },
        { kind: "output", text: "Created components/ui/neon-sign.tsx" },
        { kind: "success", text: "Done. 1 component added." },
        { kind: "input", text: "npm run dev" },
        { kind: "output", text: "Ready on http://localhost:3000 in 412ms" },
      ]}
    />
  );
}
