import { Terminal } from "@/components/ui/terminal";

export default function TerminalDeploy() {
  return (
    <Terminal
      title="deploy · production"
      prompt="❯"
      typingSpeed={28}
      className="max-w-xl"
      lines={[
        { kind: "input", text: "git push origin main" },
        { kind: "output", text: "Building 1f3c9a2 on fra1..." },
        { kind: "error", text: "Type error: Property 'glow' does not exist on type 'SignProps'." },
        { kind: "output", text: "Build failed in 18.4s" },
        { kind: "input", text: "git commit -am \"fix: rename glow prop\" && git push", delay: 1200 },
        { kind: "output", text: "Building 7be04d1 on fra1..." },
        { kind: "success", text: "Deployed to nightshift.app in 21.9s" },
      ]}
    />
  );
}
