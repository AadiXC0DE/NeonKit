import { Banner, BannerAction } from "@/components/ui/banner";

const updates = [
  "Failover to the standby database in eu-west-1 is in progress",
  "Writes pause for up to 90 seconds",
  "Reads and cached pages are unaffected",
  "Next update at 14:30 UTC",
];

export default function BannerMarquee() {
  return (
    <div className="w-full max-w-[880px]">
      <Banner
        variant="warning"
        marquee
        tag="Incident"
        action={
          <BannerAction asChild>
            <a href="#status">Status page</a>
          </BannerAction>
        }
      >
        {updates.map((update) => (
          <span key={update} className="flex items-center gap-14">
            {update}
            <span aria-hidden className="size-1 rounded-full bg-[rgb(var(--neon)/0.6)]" />
          </span>
        ))}
      </Banner>
    </div>
  );
}
