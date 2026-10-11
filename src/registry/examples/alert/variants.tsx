import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const variants = ["soft", "outline", "solid"] as const;

export default function AlertVariants() {
  return (
    <div className="grid w-full max-w-lg gap-3">
      {variants.map((variant) => (
        <Alert key={variant} status="success" variant={variant}>
          <AlertTitle>Deployment ready</AlertTitle>
          <AlertDescription>
            Built in 38s and promoted to production.
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
