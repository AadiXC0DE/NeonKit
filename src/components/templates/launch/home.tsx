"use client";

import { neonVars } from "@/lib/neon";

import { Agenda } from "./agenda";
import { color } from "./config";
import { EventProvider } from "./event-state";
import { Faq } from "./faq";
import { Footer } from "./footer";
import { Header } from "./header";
import { Hero } from "./hero";
import { LiveBanner } from "./live-banner";
import { Speakers } from "./speakers";
import { Tickets } from "./ticket";
import { Venue } from "./venue";
import { Waitlist } from "./waitlist";

export function LaunchTemplate() {
  return (
    <EventProvider>
      {/* The color is set once here; every section and component inside inherits it. */}
      <div style={neonVars(color)} className="min-h-screen bg-[#05060a] text-white antialiased">
        <a
          href="#main"
          className="fixed left-4 top-3 z-[60] -translate-y-20 rounded-lg bg-[rgb(var(--neon))] px-4 py-2 text-sm font-medium text-[#05060a] outline-none transition-transform focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <LiveBanner />
        <Header />
        <main id="main">
          <Hero />
          <Waitlist />
          <Speakers />
          <Agenda />
          <Venue />
          <Tickets />
          <Faq />
        </main>
        <Footer />
      </div>
    </EventProvider>
  );
}
