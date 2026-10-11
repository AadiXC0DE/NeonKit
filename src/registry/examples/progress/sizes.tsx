import { CircularProgress, Progress } from "@/components/ui/progress";

export default function ProgressSizes() {
  return (
    <div className="grid w-full max-w-md gap-8">
      <div className="grid gap-5">
        <Progress size="sm" value={32} label="Small" showValue />
        <Progress size="md" value={58} label="Medium" showValue />
        <Progress size="lg" value={84} label="Large" showValue />
      </div>
      <div className="flex items-center justify-center gap-6">
        <CircularProgress size={40} thickness={4} value={32} />
        <CircularProgress size={56} thickness={5} value={58} showValue />
        <CircularProgress size={72} thickness={6} value={84} showValue />
      </div>
    </div>
  );
}
