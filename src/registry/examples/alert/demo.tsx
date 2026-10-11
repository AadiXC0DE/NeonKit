import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AlertDemo() {
  return (
    <div className="grid w-full max-w-lg gap-3">
      <Alert status="info">
        <AlertTitle>Your trial ends in 3 days</AlertTitle>
        <AlertDescription>
          Add a payment method to keep your projects online after October 14.
        </AlertDescription>
      </Alert>
      <Alert status="success">
        <AlertTitle>Deployment ready</AlertTitle>
        <AlertDescription>acme-web is live on acme.dev and 2 preview URLs.</AlertDescription>
      </Alert>
      <Alert status="warning">
        <AlertTitle>You’ve used 90% of your build minutes</AlertTitle>
        <AlertDescription>Builds will queue once you reach 6,000 minutes this cycle.</AlertDescription>
      </Alert>
      <Alert status="error">
        <AlertTitle>Payment failed — update your card</AlertTitle>
        <AlertDescription>
          We couldn’t charge the Visa ending in 4242. Your workspace pauses on October 18.
        </AlertDescription>
      </Alert>
      <Alert status="neutral">
        <AlertTitle>Scheduled maintenance on Sunday, 02:00–02:30 UTC</AlertTitle>
      </Alert>
    </div>
  );
}
