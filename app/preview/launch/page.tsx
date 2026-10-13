import type { Metadata } from "next";

import { LaunchTemplate } from "@/components/templates/launch/home";

export const metadata: Metadata = {
  title: { absolute: "Low Light 2027: interface craft, after dark" },
  description:
    "One night of talks on interface craft in Rotterdam, 19 March 2027. Seven talks, a workshop and a free captioned stream.",
};

export default function Page() {
  return <LaunchTemplate />;
}
