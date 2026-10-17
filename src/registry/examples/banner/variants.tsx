import { Banner, BannerAction } from "@/components/ui/banner";

export default function BannerVariants() {
  return (
    <div className="flex w-full max-w-[880px] flex-col gap-6">
      <Banner variant="info" action={<BannerAction>See pricing</BannerAction>}>
        Usage-based billing starts on 1 November. Your plan and price stay the same.
      </Banner>
      <Banner variant="warning" dismissible action={<BannerAction>Update card</BannerAction>}>
        The card ending in 4242 expires this month. Builds pause if a payment fails.
      </Banner>
      <Banner variant="maintenance" tag="Sat 02:00 UTC">
        Scheduled maintenance for 90 minutes. Deploys will queue and run when it ends.
      </Banner>
    </div>
  );
}
