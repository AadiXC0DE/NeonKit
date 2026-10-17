import type { NeonColor } from "@/lib/neon";

/** Where the template is mounted in your app. Every link between its pages starts here. */
export const basePath = "/preview/launch";

/** The template's color. Change it here and every part of it follows. */
export const color: NeonColor = "pink";

export const brand = "Low Light";

/**
 * The night itself. The page is "before" until doors, "live" until the stream ends, then "after".
 * Rotterdam is on CET (UTC+1) in March until the clocks change on the 28th.
 * Preview any state with ?state=before, ?state=live or ?state=after.
 */
export const event = {
  edition: "2027",
  doorsAt: "2027-03-19T18:30:00+01:00",
  endsAt: "2027-03-19T23:45:00+01:00",
  dateLabel: "Friday 19 March 2027",
  shortDate: "Fri 19 Mar",
  city: "Rotterdam",
  venue: "Wolfraamhal",
  address: "Wolfraamkade 4, 3072 AN Rotterdam",
  seats: 340,
  streamUrl: "https://live.lowlight.events",
  replayUrl: "https://replay.lowlight.events/2027",
  referralBase: "lowlight.events/r/",
};

export const contact = {
  email: "hello@lowlight.events",
  press: "press@lowlight.events",
};
