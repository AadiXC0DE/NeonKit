import { Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AlertCustom() {
  return (
    <div className="grid w-full max-w-lg gap-3">
      <Alert color="violet" icon={<Sparkles />}>
        <AlertTitle>Border Beam just landed</AlertTitle>
        <AlertDescription>
          Trace any card with a moving line of light. One file, no dependencies.
        </AlertDescription>
      </Alert>
      <Alert status="neutral" variant="outline" icon={false}>
        <AlertDescription>
          You’re viewing a read-only snapshot from September 30.
        </AlertDescription>
      </Alert>
    </div>
  );
}
