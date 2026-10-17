import { ScrollProgress } from "@/components/ui/scroll-progress";

export default function ScrollProgressPage() {
  return (
    <div className="max-w-sm text-center">
      <ScrollProgress position="bottom" />
      <p className="text-sm leading-relaxed text-white/60">
        With no target it follows the page and pins itself to the window. This one sits on the bottom edge of
        your window while this page is open; scroll and watch it fill.
      </p>
    </div>
  );
}
