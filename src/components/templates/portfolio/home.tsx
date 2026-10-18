import { Contact } from "./contact";
import { Experience } from "./experience";
import { Footer } from "./footer";
import { Header } from "./header";
import { Hero } from "./hero";
import { Lights } from "./lights";
import { Now } from "./now";
import { Work } from "./work";
import { Writing } from "./writing";

export function PortfolioTemplate() {
  return (
    <Lights>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-[rgb(var(--neon))] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[#05060a]"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Work />
        <Now />
        <Experience />
        <Writing />
        <Contact />
      </main>
      <Footer />
    </Lights>
  );
}
